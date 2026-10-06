window.Game = window.Game || {};

(function () {
    var host = null;
    var tiles = [];
    var shown = [];
    var choosing = false;   // infinity's sweep: name a number
    var aiming = false;     // the bomb in hand: pick a column
    var litColumn = -1;
    var litCell = -1;
    var litTimer = null;
    var LIT_MS = 240;
    var busy = false;
    var seenThisDrop = {};
    var pending = [];

    var FALL_MS = 140;
    var MERGE_MS = 125;
    var CLEAR_MS = 240;
    var FUSE_MS = 58;
    var FIZZ_FROM = 3;      // a bomb shakes through its last this many turns

    function build() {
        var size = Game.Board.size();
        host.style.setProperty("--cols", size.cols);
        host.style.setProperty("--rows", size.rows);
        tiles.forEach(unglow);
        host.innerHTML = "";
        tiles = [];
        shown = [];

        Game.Board.cells().forEach(function (cell) {
            var tile = document.createElement("button");
            tile.type = "button";
            tile.className = "tile";
            tile.dataset.cell = cell.id;
            tile.dataset.column = cell.x;
            tiles[cell.id] = tile;
            shown[cell.id] = null;
            host.appendChild(tile);
        });

        paintBoard(Game.Board.snapshot());
    }

    /* A bomb on the board carries the bomb's light (js/ui/pulse.js), the
       same as the dial when it is ready: a canvas over the tile, a little
       wider than it, drawn as long as the bomb stands there. */
    var GLOW_PAD = 12;

    function glow(tile) {
        var canvas = document.createElement("canvas");
        canvas.className = "tile__glow";
        canvas.setAttribute("aria-hidden", "true");
        tile.appendChild(canvas);
        if (!canvas.getContext) return;

        tile.glow = Game.Pulse.make(canvas, true, function (one, gap) {
            var ctx = one.ctx;
            var cx = one.wide / 2;
            var cy = one.tall / 2;
            var half = Math.min(one.wide, one.tall) / 2 - GLOW_PAD;

            ctx.clearRect(0, 0, one.wide, one.tall);
            var paint = Game.Pulse.edge(one, cx, cy, half, gap);
            Game.Pulse.pulses(one, cx, cy, half, GLOW_PAD - 2, gap, true, paint, 1);

            // the dust, inside the diamond only
            ctx.save();
            Game.Pulse.outline(ctx, cx, cy, half, 0, true);
            ctx.clip();
            Game.Pulse.dust(one, gap, cx - half, cy - half, half * 2, half * 2, -Infinity, true);
            ctx.restore();
        });
    }

    function unglow(tile) {
        if (!tile.glow) return;
        Game.Pulse.drop(tile.glow);
        tile.glow = null;
    }

    function paintContents(id, piece) {
        var tile = tiles[id];
        if (!tile || shown[id] === piece) return;
        shown[id] = piece;
        unglow(tile);

        if (!piece) {
            tile.innerHTML = "";
            tile.setAttribute(
                "aria-label",
                "Drop into column " + (Game.Board.byId(id).x + 1)
            );
            return;
        }

        var art = Game.Pieces.byId(piece);
        tile.innerHTML =
            '<span class="tile__art">' + Game.Icons.svg(art.icon) + "</span>";
        tile.setAttribute("aria-label", art.name);

        if (piece === Game.Pieces.bomb.id) glow(tile);
    }

    function paintState(id) {
        var tile = tiles[id];
        if (!tile) return;

        var cell = Game.Board.byId(id);
        var classes = ["tile"];

        if (shown[id]) {
            classes.push("tile--full", Game.Pieces.byId(shown[id]).tint);
        } else {
            classes.push("tile--empty");
        }

        if (cell.x === litColumn) classes.push("is-column");
        if (litCell === id) classes.push("is-landing");

        // a bomb near the end of its fuse shakes, and harder every turn:
        // data-fuse is the turns it has left (css/game.css)
        var left = Game.Board.fuseLeft(id);
        if (left <= FIZZ_FROM) {
            classes.push("is-fizzing");
            if (tile.dataset.fuse !== String(left)) tile.dataset.fuse = left;
        } else if (tile.dataset.fuse) {
            delete tile.dataset.fuse;
        }

        // what the board is waiting for: with the bomb in hand, the square it
        // would land on in each column; with a sweep owed, every piece
        if (aiming) {
            var spot = Game.Board.landing(cell.x);
            if (spot && spot.id === id) classes.push("is-aim");
        } else if (choosing && shown[id]) {
            classes.push("is-pickable");
        }

        var next = classes.join(" ");
        if (tile.className !== next) tile.className = next;
    }

    function paintBoard(board) {
        board.forEach(function (piece, id) {
            paintContents(id, piece);
        });
        board.forEach(function (piece, id) {
            paintState(id);
        });
    }

    function paintHover() {
        host.classList.toggle("is-aiming", aiming);
        host.classList.toggle("is-choosing", choosing && !aiming);
        shown.forEach(function (piece, id) {
            paintState(id);
        });
    }

    function playFall(moves) {
        moves.forEach(function (move) {
            var tile = tiles[move.to];
            var art = tile && tile.querySelector(".tile__art");
            if (!art) return;

            art.style.setProperty("--fall", move.distance);
            art.classList.remove("is-falling");
            void art.offsetWidth;
            art.classList.add("is-falling");
        });

        window.setTimeout(function () {
            var landed = 0;

            moves.forEach(function (move) {
                var cell = Game.Board.byId(move.to);
                if (!cell) return;
                Game.Effects.land(tiles[move.to], around(cell));
                landed++;
            });

            if (landed) Game.Events.emit("board:landed", { count: landed });
        }, FALL_MS - 60);
    }

    function around(cell) {
        if (!cell) return [];

        return [[0, -1], [0, 1], [-1, 0], [1, 0]]
            .map(function (step) {
                var near = Game.Board.at(cell.x + step[0], cell.y + step[1]);
                return near
                    ? { tile: tiles[near.id], dx: step[0], dy: step[1] }
                    : null;
            })
            .filter(Boolean);
    }

    function madeCells(step) {
        return step.cells && step.cells.length ? step.cells : [step.cell.id];
    }

    function playMerge(step, chain) {
        var lead = tiles[step.cell.id];
        if (!lead) return;

        var made = Game.Pieces.byId(step.piece);
        var fresh = !seenThisDrop[made.id] && Game.Round.found(made.id);
        var kept = madeCells(step);

        kept.forEach(function (id) {
            var tile = tiles[id];
            if (!tile) return;
            tile.classList.remove("is-landed");
            tile.classList.remove("is-made");
            void tile.offsetWidth;
            tile.classList.add("is-made");
        });

        Game.Events.emit("board:merged", { step: step, chain: chain });

        Game.Effects.burst(lead, around(step.cell), made.tier, chain);
        Game.Effects.shake(host, made.tier, chain);
        Game.Effects.flash(made.tier);
        Game.Effects.combo(step.times || 1);

        if (step.points) {
            Game.Toast.toScore(lead, "+" + step.points, made.icon, made.tint);
        }

        if (fresh) {
            seenThisDrop[made.id] = true;
            Game.Effects.discover(lead);
        }
    }

    /* Whatever is standing on these squares breaks apart and flies — read off
       the board as drawn, so call it before the squares are repainted. The
       force is the merge's weight: a lone merge is 1, and each link of a
       chain the multiplier the combo shows, up to 3. */
    function shatter(ids, force) {
        ids.forEach(function (id) {
            if (shown[id]) Game.Shatter.tile(tiles[id], shown[id], force);
        });
    }

    function playFuse(step, chain, done) {
        var kept = madeCells(step);
        var force = Math.min(3, step.times || 1);
        var trail = (step.fuse || []).filter(function (id) {
            return kept.indexOf(id) === -1;
        });

        if (!trail.length || !step.lit) {
            playMerge(step, chain);
            done();
            return;
        }

        paintBoard(step.lit);

        var at = 0;

        // the run goes one tile after another, each breaking as it goes, and
        // the tile that is kept breaks last, with the new number in its place
        function burn() {
            if (at >= trail.length) {
                shatter(kept, force);
                paintBoard(step.board);
                playMerge(step, chain);
                done();
                return;
            }

            var id = trail[at];
            at++;

            shatter([id], force);
            paintContents(id, null);
            paintState(id);

            Game.Events.emit("board:fuse", {
                step: at,
                of: trail.length,
                piece: step.from
            });

            window.setTimeout(burn, FUSE_MS);
        }

        burn();
    }

    function playClear(step) {
        var middle = tiles[step.cells[Math.floor(step.cells.length / 2)]];

        step.cells.forEach(function (id, i) {
            var tile = tiles[id];
            if (!tile) return;
            tile.classList.remove("is-cleared");
            void tile.offsetWidth;
            tile.style.setProperty("--wait", i * 40 + "ms");
            tile.classList.add("is-cleared");
        });

        Game.Effects.shake(host, 8, 0);
        Game.Effects.flash(8);

        if (middle && step.points) {
            Game.Toast.toScore(middle, "+" + step.points);
        }
    }

    function playSteps(steps, index, chain) {
        if (index >= steps.length) {
            advance();
            return;
        }

        var step = steps[index];

        if (step.type === "fall") {
            paintBoard(step.board);
            playFall(step.moves);
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain);
            }, FALL_MS);
            return;
        }

        if (step.type === "clear" || step.type === "cash" || step.type === "blast") {
            // a cash takes every 35 in the run; a blast, and three 35s cashing
            // in, go off as hard as anything does, a sweep a little less
            shatter(step.type === "cash" ? step.fuse : step.cells,
                    step.type === "clear" ? 2 : 3);
            paintBoard(step.board);
            playClear(step);

            if (step.type === "blast") {
                Game.Effects.shake(host, 11, 1);
                Game.Effects.flash(10);
            }

            Game.Events.emit("board:merged", { step: step, chain: chain });
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain);
            }, CLEAR_MS);
            return;
        }

        var made = Game.Pieces.byId(step.piece);
        if (!made) {
            if (step.board) paintBoard(step.board);
            playSteps(steps, index + 1, chain);
            return;
        }

        var hold = MERGE_MS + (made.tier >= 7 ? 110 : 0);

        playFuse(step, chain, function () {
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain + 1);
            }, hold);
        });
    }

    function enqueue(steps) {
        if (!steps || !steps.length) return;
        pending.push(steps);
        if (!busy) advance();
    }

    function advance() {
        if (!pending.length) {
            busy = false;
            paintHover();
            Game.Events.emit("board:settled", {});
            return;
        }

        busy = true;
        seenThisDrop = {};

        playSteps(pending.shift(), 0, 0);
    }

    function columnOf(event) {
        var tile = event.target.closest("[data-column]");
        return tile ? Number(tile.dataset.column) : -1;
    }

    function unlight() {
        if (litColumn === -1 && litCell === -1) return;
        litColumn = -1;
        litCell = -1;
        paintHover();
    }

    function light(column) {
        var landing = Game.Board.landing(column);
        litColumn = column;
        litCell = landing ? landing.id : -1;
        paintHover();

        window.clearTimeout(litTimer);
        litTimer = window.setTimeout(unlight, LIT_MS);
    }

    function onClick(event) {
        if (busy) return;

        var round = Game.Round.get();
        if (!round || !round.running) return;

        var tile = event.target.closest("[data-column]");
        if (!tile) return;

        if (choosing) {
            var cellId = Number(tile.dataset.cell);
            var picked = shown[cellId];

            // a dial taken in hand aims at the square itself; a sweep the board
            // is owed still asks for a kind of piece
            if (Game.Charges && Game.Charges.armed()) {
                Game.Charges.aim(Game.Board.byId(cellId));
                return;
            }

            if (!picked) return;
            Game.Round.choose(picked);
            return;
        }

        var column = Number(tile.dataset.column);
        if (column < 0) return;

        light(column);
        Game.Round.play(column);
    }

    Game.BoardView = {
        init: function () {
            host = document.getElementById("board");
            if (!host) return;

            host.addEventListener("click", onClick);

            Game.Events.on("game:started", function () {
                window.clearTimeout(litTimer);
                litColumn = -1;
                litCell = -1;
                busy = false;
                pending = [];
                build();
            });

            Game.Events.on("board:steps", function (detail) {
                enqueue(detail.steps);
            });

            Game.Events.on("game:choosing", function () {
                choosing = true;
                paintHover();
            });

            Game.Events.on("game:chosen", function () {
                choosing = false;
                paintHover();
            });

            Game.Events.on("game:started", function () {
                choosing = false;
                aiming = false;
            });

            Game.Events.on("charge:armed", function (detail) {
                aiming = !!detail.name;
                paintHover();
            });

            Game.Events.on("game:rain", function (detail) {
                enqueue(detail.steps);
            });

        },

        isBusy: function () {
            return busy;
        }
    };
})();
