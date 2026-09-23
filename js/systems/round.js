window.Game = window.Game || {};

(function () {
    var config = null;
    var state = null;
    var held = null;

    function settings() {
        return config || (config = Game.Config.game);
    }

    function readSave() {
        var save = Game.Storage.read(settings().saveKey) || {};
        return {
            best: save.best || 0,
            found: Array.isArray(save.found) ? save.found : [],
            game: save.game || null
        };
    }

    function writeSave(game) {
        Game.Storage.write(settings().saveKey, {
            best: state.best,
            found: state.found,
            game: typeof game === "undefined" ? held : game
        });
    }

    function snapshotGame() {
        return {
            score: state.score,
            placed: state.placed,
            tally: state.tally,
            highest: state.highest,
            sinceFall: state.sinceFall,
            picked: state.picked,
            runId: state.runId,
            runLen: state.runLen,
            hand: state.hand.map(function (piece) { return piece.id; }),
            board: Game.Board.snapshot()
        };
    }

    function keep() {
        if (!state || !state.running) return;
        held = snapshotGame();
        writeSave(held);
    }

    function drop() {
        held = null;
        writeSave(null);
    }

    function nextDeal() {
        var most = settings().sameInRow || 0;
        var piece = Game.Pieces.randomFor(state.highest);

        if (most > 0 && state.runId === piece.id && state.runLen >= most) {
            var options = Game.Pieces.dealing(state.highest).filter(function (other) {
                return other.id !== state.runId;
            });
            if (options.length) {
                var guard = 0;
                while (piece.id === state.runId && guard++ < 24) {
                    piece = Game.Pieces.randomFor(state.highest);
                }
                if (piece.id === state.runId) {
                    piece = options[Math.floor(Math.random() * options.length)];
                }
            }
        }

        if (piece.id === state.runId) state.runLen += 1;
        else { state.runId = piece.id; state.runLen = 1; }

        return piece;
    }

    function fillHand() {
        while (state.hand.length < settings().handSize) {
            state.hand.push(nextDeal());
        }
    }

    function rubbleChance() {
        var s = settings();
        var over = state.highest - s.rubbleFrom + 1;
        if (over <= 0) return 0;
        return Math.min(s.rubbleMost, over * s.rubbleRise);
    }

    function rubbleNow() {
        return Math.random() < rubbleChance();
    }

    function dynamiteNow() {
        var s = settings();
        if (state.score < s.dynamiteFrom) return false;
        return Math.random() < s.dynamiteChance;
    }

    function lodestoneNow() {
        var s = settings();
        if (state.score < s.lodestoneFrom) return false;
        return Math.random() < s.lodestoneChance;
    }

    function seam() {
        var table = settings().falls;
        var found = null;

        for (var i = 0; i < table.length; i++) {
            var level = table[i];

            if (typeof level.after === "number") {
                if (state.placed >= level.after) found = level;
                continue;
            }

            var piece = Game.Pieces.byId(level.at);
            if (piece && state.highest >= piece.tier) found = level;
        }

        return found;
    }

    function fallGap() {
        var level = seam();
        if (!level) return Infinity;

        // fallSlower spaces the falls out by the same amount at every step of
        // the table. One play between falls is the floor.
        var s = settings();
        return Math.max(1, level.every + (s.fallSlower || 0));
    }

    function fallCount() {
        var level = seam();
        if (!level) return 0;

        // fallFewer thins every fall by the same amount, so the pressure curve
        // keeps its shape. A fall never drops nothing — that is what the gap
        // between falls is for.
        var s = settings();
        var least = s.fallLeast || 1;
        return Math.max(least, level.count - (s.fallFewer || 0));
    }

    function open() {
        if (!state || !state.opening) return;

        var steps = [];
        var wide = Game.Board.size().cols;

        // The opening is dirt and nothing else. It stops short rather
        // than let one merge before the first move, which would put a stone
        // on the board that the run has not made yet.
        var dirt = Game.Pieces.list[0];

        for (var i = 0; i < settings().seedPieces; i++) {
            var free = [];
            for (var col = 0; col < wide; col++) {
                if (Game.Board.landing(col)) free.push(col);
            }

            var calm = free.filter(function (col) {
                return !Game.Board.wouldJoin(col, dirt.id);
            });
            if (!calm.length) break;

            var where = calm[Math.floor(Math.random() * calm.length)];
            var result = Game.Board.drop(where, dirt.id);
            if (result) steps = steps.concat(result.steps);
        }

        steps.forEach(function (step) {
            step.points = 0;
        });

        state.opening = false;
        Game.Events.emit("board:steps", { steps: steps });
        keep();
    }

    function roomFor(count) {
        var s = settings();
        var free = Game.Board.empties().length;
        var allowed = Math.max(s.fallLeast || 1, Math.ceil(free * s.fallRoom));
        return Math.min(count, allowed);
    }

    function evened(pool) {
        if (!settings().fallEven || pool.length < 3) return pool;

        var most = 0;
        var depth = pool.map(function (col) {
            var spot = Game.Board.landing(col);
            var room = spot ? spot.y + 1 : 0;
            if (room > most) most = room;
            return { col: col, room: room };
        });

        var roomy = depth.filter(function (item) {
            return item.room >= most - 1;
        });

        return (roomy.length ? roomy : depth).map(function (item) {
            return item.col;
        });
    }

    function rain() {
        var count = roomFor(fallCount());
        var made = [];
        var steps = [];
        var points = 0;
        var dirt = 0;
        var sticks = 0;
        var stones = 0;

        for (var i = 0; i < count; i++) {
            var open = [];
            for (var col = 0; col < Game.Board.size().cols; col++) {
                if (Game.Board.landing(col)) open.push(col);
            }
            if (!open.length) break;

            var stone = stones < settings().lodestoneCap && lodestoneNow();
            if (stone) stones++;

            var stick = !stone && sticks < settings().dynamiteCap && dynamiteNow();
            if (stick) sticks++;

            var spoilt =
                !stone && !stick && dirt < settings().rubbleCap && rubbleNow();
            if (spoilt) dirt++;

            var piece = stone
                ? Game.Pieces.lodestone
                : stick
                ? Game.Pieces.dynamite
                : spoilt
                ? Game.Pieces.rubble
                : Game.Pieces.randomFor(state.highest);

            var pool = open;
            if (stone || stick) {
                var apart = open.filter(function (col) {
                    return Game.Board.spacedFrom(
                        col,
                        piece.id,
                        settings().blastSpacing
                    );
                });
                if (apart.length) pool = apart;
            }

            pool = evened(pool);

            var where = pool[Math.floor(Math.random() * pool.length)];
            var result = Game.Board.drop(where, piece.id);
            if (!result) continue;

            steps = steps.concat(result.steps);
            made = made.concat(result.made);
            points += result.points;
        }

        if (!steps.length) return;

        Game.Events.emit("game:rain", { steps: steps, count: count });
        absorb({ made: made, points: points }, 0);
    }

    function grownTo(piece, tier) {
        while (piece && piece.tier < tier && piece.next) {
            piece = Game.Pieces.byId(piece.next);
        }
        return piece;
    }

    function absorb(result, depth) {
        state.score += result.points;
        state.tally += result.made.length;
        record(result.made);
        raise(result.made, depth || 0);
    }

    /* What a move costs, either side of the pieces settling: it counts against
       the seam table, and it brings the next fall closer. Anything that does
       not spend a turn skips both halves. */
    function openTurn() {
        state.placed += 1;
        checkSeam();
    }

    function closeTurn() {
        state.sinceFall += 1;
        if (state.sinceFall >= fallGap()) {
            state.sinceFall = 0;
            rain();
        }
    }

    /* A full board ends the run, but not while a stick is standing on it:
       every stick goes off first, and the run carries on in the room that
       makes. Nor while a star's sweep is still owed — naming a piece makes
       room too. True only when there is no way left to go on. */
    function stuck() {
        if (!Game.Board.isFull()) return false;

        var blown = Game.Board.detonate();
        if (blown && blown.steps.length) {
            Game.Events.emit("game:rain", { steps: blown.steps, count: 0 });
            absorb(blown, 0);
        }
        return Game.Board.isFull() && Game.Board.owes() <= 0;
    }

    /* Everything that happens after a piece lands, whoever put it there.
       `free` is for a piece that arrives without costing the player a move. */
    function turn(result, free) {
        state.picked = 0;
        if (!free) openTurn();

        Game.Events.emit("board:steps", { steps: result.steps });

        absorb(result, 0);
        fillHand();

        if (!free) closeTurn();

        var blown = Game.Board.burn();
        if (blown && blown.steps.length) {
            Game.Events.emit("game:rain", { steps: blown.steps, count: 0 });
            absorb(blown, 0);
        }

        // before the sweep is asked for: a star caught in a full board's last
        // blast is owed like any other
        var over = stuck();

        Game.Events.emit("game:placed", { result: result });
        Game.Events.emit("game:hand", {});

        if (Game.Board.owes() > 0) {
            Game.Events.emit("game:choosing", { owed: Game.Board.owes() });
        }

        if (over) finish("full");
        else keep();

        return result;
    }

    function checkSeam() {
        var now = seam();
        if (now === state.seam) return;

        state.seam = now;
        Game.Events.emit("game:seam", { level: now });
    }

    function raise(made, depth) {
        var was = Game.Pieces.dealing(state.highest);
        var before = was[0];

        made.forEach(function (step) {
            var piece = Game.Pieces.byId(step.piece);
            if (piece.tier > state.highest) state.highest = piece.tier;
        });

        checkSeam();

        // The window moves at either end. Early on it only grows at the top,
        // with dirt still at the bottom, and that is a new deal all the same.
        var now = Game.Pieces.dealing(state.highest);
        var after = now[0];
        if ((after === before && now.length === was.length) || depth > 12) return;

        Game.Events.emit("game:dealing", { lowest: after });

        // only a rung dropping off the bottom leaves anything stranded
        if (!settings().growStranded || after === before) return;

        state.hand = state.hand.map(function (piece) {
            return grownTo(piece, after.tier);
        });
        Game.Events.emit("game:hand", {});

        var grown = Game.Board.growUpTo(after.tier);
        if (!grown) return;

        var settled = Game.Board.settle();
        Game.Events.emit("game:grown", { grown: grown, settled: settled });
        absorb(settled, depth + 1);
    }

    function record(made) {
        var fresh = [];

        made.forEach(function (step) {
            if (state.found.indexOf(step.piece) !== -1) return;
            state.found.push(step.piece);
            fresh.push(step.piece);
        });

        if (!fresh.length) return;
        writeSave();
        Game.Events.emit("game:found", { pieces: fresh });
    }

    function finish(reason) {
        if (!state.running) return;
        state.running = false;

        var record = state.score > state.best;
        if (record) state.best = state.score;
        drop();

        var top = Game.Pieces.top;
        var crowns = Game.Board.cells().filter(function (cell) {
            return cell.piece === top.id;
        }).length;

        Game.Events.emit("game:over", {
            reason: reason,
            score: state.score,
            best: state.best,
            record: record,
            made: state.tally,
            moves: state.placed,
            crowns: crowns,
            highest: Game.Board.highest()
        });
    }

    Game.Round = {
        get: function () {
            return state;
        },

        found: function (pieceId) {
            return !!state && state.found.indexOf(pieceId) !== -1;
        },

        start: function () {
            var save = state ? state : readSave();

            Game.Board.build(settings().cols, settings().rows);

            state = {
                running: true,
                opening: true,
                score: 0,
                placed: 0,
                tally: 0,
                highest: 1,
                sinceFall: 0,
                seam: null,
                hand: [],
                picked: 0,
                runId: null,
                runLen: 0,
                best: save.best,
                found: save.found
            };
            state.seam = seam();
            fillHand();

            Game.Events.emit("game:started", {});
            window.setTimeout(open, settings().introPause);
        },

        peek: readSave,

        saved: function () {
            var save = readSave();
            return !!(save.game && Array.isArray(save.game.board));
        },

        resume: function () {
            var save = readSave();
            var game = save.game;
            if (!game || !Array.isArray(game.board)) return false;

            Game.Board.build(settings().cols, settings().rows);
            if (!Game.Board.load(game.board)) return false;

            state = {
                running: true,
                opening: false,
                score: game.score || 0,
                placed: game.placed || 0,
                tally: game.tally || 0,
                highest: game.highest || 1,
                sinceFall: game.sinceFall || 0,
                seam: null,
                hand: (game.hand || [])
                    .map(function (id) { return Game.Pieces.byId(id); })
                    .filter(Boolean),
                picked: game.picked || 0,
                runId: game.runId || null,
                runLen: game.runLen || 0,
                best: save.best,
                found: save.found
            };
            state.seam = seam();
            fillHand();
            keep();

            Game.Events.emit("game:started", {});
            return true;
        },

        pick: function () {},

        cycle: function () {},

        play: function (column) {
            if (!state || !state.running || state.opening) return null;
            if (Game.Board.owes() > 0) return null;

            var piece = state.hand[0];
            if (!piece) return null;

            var result = Game.Board.drop(column, piece.id);
            if (!result) return null;

            state.hand.shift();
            return turn(result);
        },

        /* A piece put on the board by something other than the hand — the bomb
           dial. It is free: the stick is the reward, and making the player pay
           a move for it as well would mean the sky gets a fall out of the very
           thing it gave you for being buried. */
        place: function (column, pieceId) {
            if (!state || !state.running || state.opening) return null;
            if (Game.Board.owes() > 0) return null;

            var result = Game.Board.drop(column, pieceId);
            return result ? turn(result, true) : null;
        },

        choose: function (pieceId) {
            if (!state || !state.running) return null;
            if (Game.Board.owes() <= 0) return null;

            var out = Game.Board.sweep(pieceId);
            if (!out) return null;

            Game.Events.emit("board:steps", { steps: out.steps });
            absorb(out, 0);

            if (Game.Board.owes() > 0) {
                Game.Events.emit("game:choosing", { owed: Game.Board.owes() });
            } else {
                // a sweep is the move: clearing a whole kind off the board is
                // worth a turn, and the falls close in the same as any other
                openTurn();
                closeTurn();
                Game.Events.emit("game:chosen", {});
            }

            if (stuck()) finish("full");
            else keep();
            return out;
        },

        give: function () {
            finish("full");
        }
    };
})();
