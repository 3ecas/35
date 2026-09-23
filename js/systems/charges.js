window.Game = window.Game || {};

/* =============================================================================
   CHARGES
   -----------------------------------------------------------------------------
   Two dials either side of the hand. Both fill, both are spent by pressing
   them, and that is where the similarity ends — what feeds them is the point.

     star   fills on chains.  Only a merge that sets off another one pays, and
                              the deeper the chain the more it pays. A blast
                              that takes four pieces or more fills it outright.
                              Spending one owes the board a sweep: pick a piece
                              and every one of them goes.
     bomb   fills on merges.  Any merge at all, one for one. Spending one puts a
                              stick of dynamite in your hand to place.

   So the bomb is the wage for showing up and the star is the bonus for playing
   well. A run of ordinary merges keeps the bomb coming; only a chain moves the
   star, or a stick placed where it takes four or more with it, which makes the
   star something you set up rather than something that accumulates.

   Both count things rather than points, and that is the whole trick. Points
   inflate — a merge at diamond is worth thousands of times a merge at dirt, and
   worse, a placement late in a run sets off cascades that score several merges
   at once. Pricing a dial in points meant it arrived every 22 moves early on
   and every 6 moves late, which is the opposite of a cost. Counted this way,
   both dials cost the same amount of play wherever you are on the ladder.
   ============================================================================= */

(function () {
    function settings() {
        return Game.Config.game;
    }

    /* one dial: what fills it, what it costs, what spending it does */
    function dial(name, cost, spend) {
        var charge = 0;
        var ready = false;

        function tell() {
            Game.Events.emit("charge:change", {
                name: name, charge: charge, ready: ready
            });
        }

        return {
            name: name,

            reset: function () {
                charge = 0;
                ready = false;
                tell();
            },

            /* `much` is in whatever unit this dial counts — points, or pieces */
            feed: function (much) {
                if (ready || much <= 0) return;

                charge = Math.min(1, charge + much / cost());
                if (charge >= 1) {
                    ready = true;
                    Game.Events.emit("charge:ready", { name: name });
                }
                tell();
            },

            charge: function () { return charge; },
            ready: function () { return ready; },

            /* Spending is two steps: press the dial to take it in hand, then
               pick the square it acts on. Nothing is deducted until the pick,
               so changing your mind costs nothing. */
            spend: function (cell) {
                var state = Game.Round.get();
                if (!ready || !state || !state.running) return false;
                if (!spend(cell)) return false;

                ready = false;
                charge = 0;
                Game.Events.emit("charge:spent", { name: name });
                tell();
                return true;
            }
        };
    }

    /* ---- what each one asks for -------------------------------------------- */
    function starCost() {
        return Math.max(1, settings().starPace || 20);
    }

    function bombCost() {
        return Math.max(1, settings().bombPace || 10);
    }

    /* ---- what each one does to the square you pick -------------------------- */
    function sweep(cell) {
        if (!cell || !cell.piece) return false;      // an empty square is not a kind
        Game.Board.owe(1);
        return !!Game.Round.choose(cell.piece);
    }

    function drop(cell) {
        if (!cell) return false;
        // the stick is placed, not detonated: it falls down the column you
        // picked and burns its fuse there, going off on its own after
        // dynamiteFuse turns if a merge next to it has not lit it first
        return !!Game.Round.place(cell.x, Game.Pieces.dynamite.id);
    }

    /* A blast that takes enough with it, the sticks aside, fills the star
       outright. Counted over everything one move set off. */
    function blastFills(steps) {
        var need = settings().starBlast || 0;
        if (!need) return false;

        var took = 0;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].type === "blast") took += steps[i].took || 0;
        }
        return took >= need;
    }

    var star = dial("star", starCost, sweep);
    var bomb = dial("bomb", bombCost, drop);

    var armed = null;                 // the dial waiting for a square


    Game.Charges = {
        star: star,
        bomb: bomb,

        byName: function (name) {
            return name === "bomb" ? bomb : star;
        },

        armed: function () {
            return armed;
        },

        /* pressing a ready dial takes it in hand; pressing it again puts it
           back. The board is told either way, so it knows whether the next tap
           is a piece being played or a target being picked. */
        toggle: function (name) {
            var one = this.byName(name);

            if (armed === name) return this.disarm();
            if (!one.ready()) return false;

            armed = name;
            Game.Events.emit("charge:armed", { name: name });
            Game.Events.emit("game:choosing", { owed: 1 });
            return true;
        },

        disarm: function () {
            if (!armed) return false;
            armed = null;
            Game.Events.emit("charge:armed", { name: null });
            if (Game.Board.owes() <= 0) Game.Events.emit("game:chosen", {});
            return false;
        },

        /* the board hands back the square that was tapped */
        aim: function (cell) {
            if (!armed) return false;

            var one = this.byName(armed);
            var name = armed;
            armed = null;
            Game.Events.emit("charge:armed", { name: null });

            if (!one.spend(cell)) {
                // an unusable square: put it back in hand rather than eat it
                armed = name;
                Game.Events.emit("charge:armed", { name: name });
                return false;
            }

            if (Game.Board.owes() <= 0) Game.Events.emit("game:chosen", {});
            return true;
        },

        init: function () {
            Game.Events.on("game:started", function () {
                armed = null;
                star.reset();
                bomb.reset();
            });

            Game.Events.on("board:steps", function (detail) {
                var steps = (detail && detail.steps) || [];
                var merges = 0;
                var over = 0;

                for (var i = 0; i < steps.length; i++) {
                    var step = steps[i];
                    if (step.type !== "merge" && step.type !== "cash") continue;

                    if (step.type === "merge") merges++;

                    // `times` is the chain multiplier the board worked out: 1
                    // for a merge that stands on its own, more for one that
                    // fell out of the merge before it. Only the part above 1
                    // counts, so an unchained merge does nothing for the star.
                    over += Math.max(0, (step.times || 1) - 1);
                }

                bomb.feed(merges);
                star.feed(over);
                if (blastFills(steps)) star.feed(starCost());
            });

            // A stick left to burn goes off after the move, and one lit by a
            // fall goes off in the fall. Neither comes through above, and both
            // are still the stick the player placed.
            Game.Events.on("game:rain", function (detail) {
                if (blastFills((detail && detail.steps) || [])) star.feed(starCost());
            });
        }
    };
})();
