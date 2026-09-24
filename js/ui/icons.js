window.Game = window.Game || {};

(function () {
    /* The three buttons at the foot of the screen, drawn like the digits:
       straight lines only, square ends, sharp corners — no curve anywhere. */
    var line = {
        // a speaker, and two steps of sound off it
        sound:
            '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>' +
            '<path d="M15.5 9.5h1.5v5h-1.5"/>' +
            '<path d="M18.5 7H21v10h-2.5"/>',

        mute:
            '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>' +
            '<path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>',

        // start over: back to the start — a bar, and a turn pointing at it
        restart:
            '<path d="M6 6v12"/>' +
            '<path d="M18 6v12l-8-6z"/>',

        help:
            '<path d="M8.5 9.5V6h7v6.5H12V15"/>' +
            '<path d="M11 18h2v2h-2z" fill="currentColor" stroke="none"/>',

        close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'
    };

    /* ---- the numbers ------------------------------------------------------

       Pieces n1 to n35 up the ladder, and n0, the bomb. Every digit is built
       from straight bars in a 5 × 7 box, 1.5 thick, square at every corner —
       no curve anywhere and no outline, just white on the tile's colour.
       The colour is the tile's, not the art's: see css/numbers.css. */
    var W = 5;
    var H = 7;
    var T = 1.5;
    var MID = (H - T) / 2;
    var REACH = (H + T) / 2;

    var BARS = {
        a: [0, 0, W, T],             // top
        b: [W - T, 0, T, REACH],     // upper right
        c: [W - T, MID, T, REACH],   // lower right
        d: [0, H - T, W, T],         // bottom
        e: [0, MID, T, REACH],       // lower left
        f: [0, 0, T, REACH],         // upper left
        g: [0, MID, W, T]            // middle
    };

    var DIGITS = {
        0: "abcdef", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd",
        6: "afgecd", 7: "abc", 8: "abcdefg", 9: "abcdfg"
    };

    // a 1 is narrower: a stem, and a flag off the top of it
    var ONE = { w: 4, bars: [[4 - T, 0, T, H], [4 - T - 1.3, 0, 1.3, T]] };

    // and a plus, for the points a merge throws up to the score
    var PLUS = { w: W, bars: [[0, MID, W, T], [(W - T) / 2, 1, T, H - 2]] };

    // and a times, for the length of a chain: five squares set as an X
    var TIMES = {
        w: W,
        bars: [[0.25, 1.25, T, T], [3.25, 1.25, T, T], [1.75, 2.75, T, T],
               [0.25, 4.25, T, T], [3.25, 4.25, T, T]]
    };

    var TALL = 8.2;     // height of a number in the 24-unit tile
    var GAP = 1;        // between two digits, in the digits' own units

    function round(v) {
        return Math.round(v * 1000) / 1000;
    }

    function glyph(ch) {
        if (ch === "1") return ONE;
        if (ch === "+") return PLUS;
        if (ch === "×") return TIMES;
        return {
            w: W,
            bars: (DIGITS[ch] || "").split("").map(function (k) { return BARS[k]; })
        };
    }

    /* a number's bars in the digits' own units — y down from 0 to H — and
       the span they actually cover, left to right */
    function layout(text) {
        var placed = [];
        var x = 0;

        String(text).split("").forEach(function (ch, i) {
            if (i) x += GAP;
            var own = glyph(ch);
            own.bars.forEach(function (r) {
                placed.push([x + r[0], r[1], r[2], r[3]]);
            });
            x += own.w;
        });

        var left = Infinity;
        var right = -Infinity;
        placed.forEach(function (r) {
            left = Math.min(left, r[0]);
            right = Math.max(right, r[0] + r[2]);
        });

        return { bars: placed, left: left, right: right };
    }

    function outline(list) {
        return list.map(function (r) {
            return "M" + round(r[0]) + " " + round(r[1]) + "h" + round(r[2]) +
                "v" + round(r[3]) + "h" + round(-r[2]) + "Z";
        }).join("");
    }

    /* the bars of a number on a tile, as [x, y, w, h] in the 24-unit box,
       centred on what is actually drawn rather than on the digits' boxes */
    function bars(n) {
        var set = layout(n);
        var k = TALL / H;
        var dx = 12 - (set.left + set.right) * k / 2;
        var dy = 12 - TALL / 2;
        return set.bars.map(function (r) {
            return [dx + r[0] * k, dy + r[1] * k, r[2] * k, r[3] * k];
        });
    }

    function numeral(n) {
        return '<path fill="#fff" d="' + outline(bars(n)) + '"/>';
    }

    /* ---- words ------------------------------------------------------------

       The few words the game says, squared off like the numbers: capitals on
       a 5 × 7 grid of squares, no curve anywhere. Each letter is its seven
       rows, top to bottom; # is a filled square. */
    var LETTERS = {
        A: "#####|#...#|#...#|#####|#...#|#...#|#...#",
        B: "####.|#...#|#...#|####.|#...#|#...#|####.",
        C: "#####|#....|#....|#....|#....|#....|#####",
        D: "####.|#...#|#...#|#...#|#...#|#...#|####.",
        E: "#####|#....|#....|####.|#....|#....|#####",
        F: "#####|#....|#....|####.|#....|#....|#....",
        G: "#####|#....|#....|#.###|#...#|#...#|#####",
        H: "#...#|#...#|#...#|#####|#...#|#...#|#...#",
        I: "###|.#.|.#.|.#.|.#.|.#.|###",
        J: "....#|....#|....#|....#|....#|#...#|#####",
        K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#",
        L: "#....|#....|#....|#....|#....|#....|#####",
        M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",
        N: "#...#|##..#|#.#.#|#..##|#...#|#...#|#...#",
        O: "#####|#...#|#...#|#...#|#...#|#...#|#####",
        P: "#####|#...#|#...#|#####|#....|#....|#....",
        Q: "#####|#...#|#...#|#...#|#.#.#|#..##|#####",
        R: "#####|#...#|#...#|#####|#..#.|#...#|#...#",
        S: ".####|#....|#....|.###.|....#|....#|####.",
        T: "#####|..#..|..#..|..#..|..#..|..#..|..#..",
        U: "#...#|#...#|#...#|#...#|#...#|#...#|#####",
        V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",
        W: "#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#",
        X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
        Y: "#...#|#...#|#...#|.###.|..#..|..#..|..#..",
        Z: "#####|....#|...#.|..#..|.#...|#....|#####",
        0: "#####|#...#|#..##|#.#.#|##..#|#...#|#####",
        1: ".#.|##.|.#.|.#.|.#.|.#.|###",
        2: "#####|....#|....#|#####|#....|#....|#####",
        3: "#####|....#|....#|.####|....#|....#|#####",
        4: "#...#|#...#|#...#|#####|....#|....#|....#",
        5: "#####|#....|#....|####.|....#|....#|####.",
        6: "#####|#....|#....|#####|#...#|#...#|#####",
        7: "#####|....#|....#|...#.|..#..|..#..|..#..",
        8: "#####|#...#|#...#|#####|#...#|#...#|#####",
        9: "#####|#...#|#...#|#####|....#|....#|#####",
        ".": ".|.|.|.|.|.|#",
        ",": ".|.|.|.|.|#|#",
        "-": "...|...|...|###|...|...|...",
        "!": "#|#|#|#|#|.|#",
        "?": "#####|....#|....#|..###|..#..|.....|..#.."
    };

    // one word as bars, a square apart letter to letter, each unbroken run
    // of squares in a row joined into one bar
    function word(text) {
        var runs = [];
        var x = 0;

        text.split("").forEach(function (ch, i) {
            var rows = (LETTERS[ch] || "...").split("|");
            if (i) x += 1;
            rows.forEach(function (row, y) {
                var from = -1;
                for (var c = 0; c <= row.length; c++) {
                    if (row.charAt(c) === "#") {
                        if (from < 0) from = c;
                    } else if (from >= 0) {
                        runs.push([x + from, y, c - from, 1]);
                        from = -1;
                    }
                }
            });
            x += rows[0].length;
        });

        return { bars: runs, width: x };
    }

    function escape(text) {
        return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    }

    // infinity: one unbroken figure of eight, dark on its white tile — the
    // bomb turned inside out
    var LOOP =
        "M12 12C10.88 10.29 9.76 9.44 8.64 9.44A2.24 2.56 0 1 0 8.64 14.56" +
        "C9.76 14.56 10.88 13.71 12 12C13.12 10.29 14.24 9.44 15.36 9.44" +
        "A2.24 2.56 0 1 1 15.36 14.56C14.24 14.56 13.12 13.71 12 12Z";
    var INK = "#2d2a2e";
    var LOOP_WIDTH = 1.9;

    var art = {
        infinity:
            '<path d="' + LOOP + '" fill="none" stroke="' + INK + '" ' +
            'stroke-width="' + LOOP_WIDTH + '"/>'
    };

    for (var n = 0; n <= 35; n++) art["n" + n] = numeral(n);

    function wrap(body, isArt) {
        return (
            '<svg class="icon' +
            (isArt ? " icon--art" : "") +
            '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            body +
            "</svg>"
        );
    }

    Game.Icons = {
        has: function (name) {
            return !!(art[name] || line[name]);
        },

        /* Any number in the same blocks — the score, the best, the points in
           flight. One em tall and as wide as it runs, in the colour of the
           text around it, and read out as the number it is, or as `label`. */
        number: function (text, label) {
            var set = layout(text);
            var wide = set.right - set.left;
            return '<svg class="blocks" viewBox="' + round(set.left) + " 0 " +
                round(wide) + " " + H + '" style="width:' + round(wide / H) +
                'em;height:1em" role="img" aria-label="' + (label || text) + '">' +
                '<path fill="currentColor" d="' + outline(set.bars) + '"/></svg>';
        },

        /* Words in the square letters: one em tall, in the colour of the text
           around them. Each word is a picture of its own, so a line breaks
           between words the way text does (the holder lays them out — see
           .words in css/theme.css); the words themselves are there too,
           unseen, for anyone listening rather than looking. */
        words: function (text) {
            var pictures = String(text).toUpperCase().split(/\s+/).filter(Boolean)
                .map(function (w) {
                    var set = word(w);
                    return '<svg class="glyphs" viewBox="0 0 ' + set.width + " " + H + '" ' +
                        'style="width:' + round(set.width / H) + 'em;height:1em" ' +
                        'aria-hidden="true" focusable="false"><path fill="currentColor" d="' +
                        outline(set.bars) + '"/></svg>';
                });
            return '<span class="unseen">' + escape(text) + "</span>" + pictures.join("");
        },

        svg: function (name) {
            if (art[name]) return wrap(art[name], true);
            if (line[name]) return wrap(line[name], false);
            return "";
        },

        /* The same drawing on a canvas, in the 24-unit box the art is made in,
           for js/ui/shatter.js to cut into pieces. */
        paint: function (ctx, name) {
            if (name === "infinity") {
                ctx.lineWidth = LOOP_WIDTH;
                ctx.strokeStyle = INK;
                ctx.stroke(new Path2D(LOOP));
                return;
            }

            if (!/^n\d+$/.test(name)) return;
            ctx.fillStyle = "#fff";
            bars(name.slice(1)).forEach(function (r) {
                ctx.fillRect(r[0], r[1], r[2], r[3]);
            });
        },

        hydrate: function (root) {
            var host = root || document;
            var slots = host.querySelectorAll("[data-icon]");
            Array.prototype.forEach.call(slots, function (slot) {
                var name = slot.getAttribute("data-icon");
                if (!name || slot.firstElementChild) return;
                slot.innerHTML = Game.Icons.svg(name);
            });
        }
    };
})();
