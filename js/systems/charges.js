window.Game = window.Game || {};

/* =============================================================================
   CHARGES
   -----------------------------------------------------------------------------
   One dial beside the hand: the bomb. It fills on merges, any merge at all,
   one for one, and pressing it puts a stick of dynamite in your hand to place.
   It is the wage for showing up — a run of ordinary merges keeps it coming.

   The star used to be a second dial here. It is a piece again: it falls in
   with the seam, and only a blast sets it off (js/systems/board.js), so the
   bomb is also how you get at one.

   The dial counts merges rather than points, and that is the whole trick.
   Points inflate — a merge at diamond is worth thousands of times a merge at
   dirt, and worse, a placement late in a run sets off cascades that score
   several merges at once. Pricing a dial in points meant it arrived every 22
   moves early on and every 6 moves late, which is the opposite of a cost.
   Counted this way, it costs the same amount of play wherever you are on the
   ladder.
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

    /* ---- what it asks for, and what it does to the square you pick --------- */
    function bombCost() {
        return Math.max(1, settings().bombPace || 10);
    }

    function drop(cell) {
        if (!cell) return false;
        // the stick is placed, not detonated: it falls down the column you
        // picked and burns its fuse there, going off on its own after
        // dynamiteFuse turns if a merge next to it has not lit it first
        return !!Game.Round.place(cell.x, Game.Pieces.dynamite.id);
    }

    var bomb = dial("bomb", bombCost, drop);

    var armed = null;                 // the dial waiting for a square


    Game.Charges = {
        bomb: bomb,

        byName: function (name) {
            return name === "bomb" ? bomb : null;
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
            if (!one || !one.ready()) return false;

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
                bomb.reset();
            });

            Game.Events.on("board:steps", function (detail) {
                var steps = (detail && detail.steps) || [];
                var merges = 0;

                for (var i = 0; i < steps.length; i++) {
                    if (steps[i].type === "merge") merges++;
                }

                bomb.feed(merges);
            });
        }
    };
})();
