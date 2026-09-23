window.Game = window.Game || {};

/* =============================================================================
   HOW TO PLAY
   -----------------------------------------------------------------------------
   One mechanic per screen, each one played out on a small board rather than
   described. Six screens: dropping, merging, chains, the seam, dynamite, the
   star. Dots below, a cross to leave.

   The boards are frames of real piece ids drawn with the real icons, so the
   tutorial cannot drift away from the game - change a piece's art and this
   changes with it.
   ============================================================================= */

(function () {
    var COLS = 5;
    var ROWS = 4;
    var CELLS = COLS * ROWS;

    var host = null;
    var stage = null;
    var titleEl = null;
    var lineEl = null;
    var dotsEl = null;
    var cells = [];

    var at = 0;
    var frame = 0;
    var timer = null;

    // a board state is { index: pieceId }, anything absent is an empty square
    function board(map, pop, lit) {
        return { map: map || {}, pop: pop || [], lit: lit || [] };
    }

    var PAGES = [
        {
            title: "Drop a piece",
            line: "You only ever choose the column. It falls to the bottom.",
            hold: 520,
            frames: [
                board({ 2: "dirt" }, [], [2]),
                board({ 7: "dirt" }, [], [7]),
                board({ 12: "dirt" }, [], [12]),
                board({ 17: "dirt" }),
                board({ 17: "dirt" })
            ]
        },
        {
            title: "Three of a kind, touching",
            line: "Three that touch become one, a rung up the ladder.",
            hold: 560,
            frames: [
                board({ 16: "dirt", 17: "dirt" }),
                board({ 3: "dirt", 16: "dirt", 17: "dirt" }, [], [3]),
                board({ 13: "dirt", 16: "dirt", 17: "dirt" }, [], [13]),
                board({ 16: "dirt", 17: "dirt", 18: "dirt" }),
                board({ 16: "dirt", 17: "dirt", 18: "dirt" }, [16, 17, 18]),
                board({ 17: "rock" }, [], [17]),
                board({ 17: "rock" })
            ]
        },
        {
            title: "One merge sets off the next",
            line: "What a run hands back can finish another. That is a chain, and it pays more each link.",
            hold: 520,
            frames: [
                board({ 15: "rock", 16: "rock", 17: "dirt", 18: "dirt" }),
                board({ 4: "dirt", 15: "rock", 16: "rock", 17: "dirt", 18: "dirt" }, [], [4]),
                board({ 9: "dirt", 15: "rock", 16: "rock", 17: "dirt", 18: "dirt" }, [], [9]),
                board({ 14: "dirt", 15: "rock", 16: "rock", 17: "dirt", 18: "dirt" }, [], [14]),
                board({ 15: "rock", 16: "rock", 17: "dirt", 18: "dirt", 19: "dirt" }),
                board({ 15: "rock", 16: "rock", 17: "dirt", 18: "dirt", 19: "dirt" }, [17, 18, 19]),
                board({ 15: "rock", 16: "rock", 17: "rock" }, [], [17]),
                board({ 15: "rock", 16: "rock", 17: "rock" }, [15, 16, 17]),
                board({ 15: "coal" }, [], [15]),
                board({ 15: "coal" })
            ]
        },
        {
            title: "The seam gives way",
            line: "Every few drops, pieces fall in on their own - into columns you did not pick.",
            hold: 540,
            frames: [
                board({ 16: "dirt", 18: "rock" }),
                board({ 1: "coal", 3: "dirt", 16: "dirt", 18: "rock" }, [], [1, 3]),
                board({ 6: "coal", 8: "dirt", 16: "dirt", 18: "rock" }, [], [6, 8]),
                board({ 11: "coal", 13: "dirt", 16: "dirt", 18: "rock" }, [], [11, 13]),
                board({ 11: "coal", 13: "dirt", 16: "dirt", 18: "rock" }),
                board({ 11: "coal", 13: "dirt", 16: "dirt", 18: "rock" })
            ]
        },
        {
            title: "Dynamite is the way out",
            line: "It joins nothing. A merge landing beside it sets it off, and the eight squares around it go with it.",
            hold: 560,
            frames: [
                board({ 13: "rock", 14: "rock", 15: "dirt", 16: "dirt", 18: "dynamite", 19: "coal" }),
                board({ 2: "dirt", 13: "rock", 14: "rock", 15: "dirt", 16: "dirt", 18: "dynamite", 19: "coal" }, [], [2]),
                board({ 12: "dirt", 13: "rock", 14: "rock", 15: "dirt", 16: "dirt", 18: "dynamite", 19: "coal" }, [], [12]),
                board({ 13: "rock", 14: "rock", 15: "dirt", 16: "dirt", 17: "dirt", 18: "dynamite", 19: "coal" }),
                board({ 13: "rock", 14: "rock", 15: "dirt", 16: "dirt", 17: "dirt", 18: "dynamite", 19: "coal" }, [15, 16, 17], [18]),
                board({ 13: "rock", 14: "rock", 16: "rock", 18: "dynamite", 19: "coal" }, [], [18]),
                board({ 13: "rock", 14: "rock", 16: "rock", 18: "dynamite", 19: "coal" }, [13, 14, 18, 19]),
                board({ 16: "rock" }),
                board({ 16: "rock" })
            ]
        },
        {
            title: "A star draws out a kind",
            line: "Stars fall in now and then. Blow one up, tap a piece, and every one like it goes.",
            hold: 560,
            frames: [
                board({ 10: "dirt", 11: "coal", 13: "coal", 15: "coal", 16: "dirt", 17: "rock", 18: "dynamite", 19: "lodestone" }),
                board({ 10: "dirt", 11: "coal", 13: "coal", 15: "coal", 16: "dirt", 17: "rock", 18: "dynamite", 19: "lodestone" }, [], [18]),
                board({ 10: "dirt", 11: "coal", 13: "coal", 15: "coal", 16: "dirt", 17: "rock", 18: "dynamite", 19: "lodestone" }, [13, 17, 18, 19]),
                board({ 10: "dirt", 11: "coal", 15: "coal", 16: "dirt" }),
                board({ 10: "dirt", 11: "coal", 15: "coal", 16: "dirt" }, [], [11]),
                board({ 10: "dirt", 11: "coal", 15: "coal", 16: "dirt" }, [], [11, 15]),
                board({ 10: "dirt", 11: "coal", 15: "coal", 16: "dirt" }, [11, 15]),
                board({ 15: "dirt", 16: "dirt" }),
                board({ 15: "dirt", 16: "dirt" })
            ]
        }
    ];

    function build() {
        host = document.getElementById("how");
        if (!host) return false;

        host.innerHTML =
            '<div class="how__card" role="dialog" aria-modal="true" aria-label="How to play">' +
            '<button type="button" class="how__shut" id="howShut" aria-label="Close">' +
            '<span aria-hidden="true">×</span></button>' +
            '<div class="how__stage" id="howStage"></div>' +
            '<h2 class="how__title" id="howTitle"></h2>' +
            '<p class="how__line" id="howLine"></p>' +
            '<div class="how__dots" id="howDots"></div>' +
            "</div>";

        stage = document.getElementById("howStage");
        titleEl = document.getElementById("howTitle");
        lineEl = document.getElementById("howLine");
        dotsEl = document.getElementById("howDots");

        cells = [];
        for (var i = 0; i < CELLS; i++) {
            var cell = document.createElement("span");
            cell.className = "how__cell";
            stage.appendChild(cell);
            cells.push(cell);
        }
        stage.style.setProperty("--how-cols", COLS);

        for (var d = 0; d < PAGES.length; d++) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "how__dot";
            dot.setAttribute("aria-label", "Step " + (d + 1));
            dot.dataset.to = d;
            dotsEl.appendChild(dot);
        }

        host.addEventListener("click", function (event) {
            if (event.target.closest("#howShut")) return Game.HowTo.close();

            var dot = event.target.closest(".how__dot");
            if (dot) return show(Number(dot.dataset.to));

            // tapping the picture moves on, which is how everyone tries it first
            if (event.target.closest(".how__stage")) {
                return show((at + 1) % PAGES.length);
            }
            if (!event.target.closest(".how__card")) Game.HowTo.close();
        });

        return true;
    }

    function paint(state) {
        for (var i = 0; i < CELLS; i++) {
            var id = state.map[i];
            var cell = cells[i];
            var next = "how__cell" +
                (id ? " is-full" : "") +
                (state.pop.indexOf(i) !== -1 ? " is-going" : "") +
                (state.lit.indexOf(i) !== -1 ? " is-lit" : "");

            if (cell.className !== next) cell.className = next;

            var want = id || "";
            if (cell.dataset.piece !== want) {
                cell.dataset.piece = want;
                cell.innerHTML = id ? Game.Icons.svg(pieceIcon(id)) : "";
            }
        }
    }

    function pieceIcon(id) {
        var piece = Game.Pieces.byId(id);
        return piece ? piece.icon : id;
    }

    function run() {
        window.clearTimeout(timer);
        var page = PAGES[at];
        paint(page.frames[frame]);

        var last = frame === page.frames.length - 1;
        timer = window.setTimeout(function () {
            frame = (frame + 1) % page.frames.length;
            run();
        }, last ? page.hold * 2 : page.hold);
    }

    function show(index) {
        at = index;
        frame = 0;

        var page = PAGES[at];
        titleEl.textContent = page.title;
        lineEl.textContent = page.line;

        var dots = dotsEl.children;
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.toggle("is-here", i === at);
        }
        run();
    }

    function keys(event) {
        if (!host || !host.classList.contains("is-open")) return;
        if (event.key === "Escape") return Game.HowTo.close();
        if (event.key === "ArrowRight") return show((at + 1) % PAGES.length);
        if (event.key === "ArrowLeft") return show((at + PAGES.length - 1) % PAGES.length);
    }

    Game.HowTo = {
        open: function () {
            if (!host && !build()) return;
            host.classList.add("is-open");
            show(0);
            document.addEventListener("keydown", keys);
        },

        close: function () {
            if (!host) return;
            window.clearTimeout(timer);
            host.classList.remove("is-open");
            document.removeEventListener("keydown", keys);
        }
    };
})();
