window.Game = window.Game || {};

/* =============================================================================
   BACKDROP
   -----------------------------------------------------------------------------
   The ground the game sits on is the board's own colour: a few soft pools, one
   for each of the numbers most common on the grid right now, blended into one
   another and drifting about the screen on slow, crossing paths that never
   quite repeat. When the board changes, the pools fade to its new colours; on
   an empty board they take the colours being dealt.

   The pools keep each tile's hue but not its strength: half the saturation
   taken out, so the vivid tiles stand clear of the ground they sit on, while
   staying deep enough that the white of the score, the buttons and the grid
   reads over all of it.

   It is drawn on a canvas a few dozen pixels across and stretched over the
   whole screen — the stretching is what makes the blend so soft, and redrawing
   something that small costs next to nothing. It redraws at a gentle rate, and
   not at all for anyone who has asked for less motion.
   ============================================================================= */

(function () {
    var POOLS = 5;
    var ACROSS = 36;          // the canvas is this many pixels wide
    var STEP = 1 / 24;        // seconds between redraws
    var MUTE = 0.55;          // share of each tile colour's saturation taken out
    var LIFT = 0.12;          // and how far it is then lifted towards white
    var STRENGTH = 0.6;       // how much of a pool's colour shows at its heart

    var canvas = null;
    var ctx = null;
    var probe = null;
    var wide = 0;
    var tall = 0;
    var pools = [];
    var base = [96, 170, 150];
    var baseTo = base.slice();
    var tinted = false;
    var clock = 0;
    var last = 0;
    var still = false;

    function rgb(hex) {
        var v = parseInt(hex.replace("#", ""), 16);
        return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }

    // the same hue, most of the way to grey, and a touch lighter
    function mute(c) {
        var grey = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
        return c.map(function (v) {
            var dull = v + (grey - v) * MUTE;
            return dull + (255 - dull) * LIFT;
        });
    }

    /* a number's tile colour, read off the same class the tile wears */
    function tone(piece) {
        probe.className = piece.tint;
        var found = getComputedStyle(probe).getPropertyValue("--num").trim();
        return /^#[0-9a-f]{6}$/i.test(found) ? mute(rgb(found)) : null;
    }

    /* the numbers on the board, most common first; an empty board shows what
       is being dealt */
    function palette() {
        var count = {};
        var byId = {};
        Game.Board.snapshot().forEach(function (id) {
            var piece = id && Game.Pieces.byId(id);
            if (!piece || !piece.tier) return;
            count[piece.id] = (count[piece.id] || 0) + 1;
            byId[piece.id] = piece;
        });

        var pieces = Object.keys(count).sort(function (a, b) {
            return count[b] - count[a];
        }).map(function (id) { return byId[id]; });

        if (!pieces.length) {
            var round = Game.Round.get();
            pieces = Game.Pieces.dealing(round ? round.highest : 1);
        }

        var tones = pieces.slice(0, POOLS).map(tone).filter(Boolean);
        return tones.length ? tones : [mute(rgb("#58c26d"))];
    }

    function retint() {
        if (!ctx) return;
        var tones = palette();
        pools.forEach(function (pool, i) {
            pool.to = tones[i % tones.length];
            if (!pool.now) pool.now = pool.to.slice();
        });

        // the ground under the pools: the commonest colour, a shade deeper —
        // taken at once the first time, faded to after that
        baseTo = tones[0].map(function (v) { return v * 0.92; });
        if (still || !tinted) base = baseTo.slice();
        tinted = true;
        if (still) draw();
    }

    function fit() {
        wide = ACROSS;
        tall = Math.max(2, Math.round(ACROSS * window.innerHeight / Math.max(1, window.innerWidth)));
        canvas.width = wide;
        canvas.height = tall;
        if (still) draw();
    }

    function draw() {
        ctx.fillStyle = "rgb(" + base.map(Math.round).join(",") + ")";
        ctx.fillRect(0, 0, wide, tall);

        var reach = Math.max(wide, tall);
        pools.forEach(function (pool) {
            if (!pool.now) return;
            var x = (0.5 + 0.6 * Math.sin(clock * pool.fx + pool.px)) * wide;
            var y = (0.5 + 0.6 * Math.sin(clock * pool.fy + pool.py)) * tall;
            var r = reach * pool.size;
            var c = pool.now.map(Math.round).join(",");

            var glow = ctx.createRadialGradient(x, y, 0, x, y, r);
            glow.addColorStop(0, "rgba(" + c + "," + STRENGTH + ")");
            glow.addColorStop(1, "rgba(" + c + ",0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, wide, tall);
        });
    }

    function frame(now) {
        var gap = (now - last) / 1000;
        if (gap >= STEP) {
            last = now;
            gap = Math.min(gap, 0.1);
            clock += gap;

            var ease = Math.min(1, gap * 0.9);
            for (var k = 0; k < 3; k++) base[k] += (baseTo[k] - base[k]) * ease;
            pools.forEach(function (pool) {
                if (!pool.now || !pool.to) return;
                for (var j = 0; j < 3; j++) pool.now[j] += (pool.to[j] - pool.now[j]) * ease;
            });
            draw();
        }
        window.requestAnimationFrame(frame);
    }

    Game.Backdrop = {
        init: function () {
            var host = document.getElementById("backdrop");
            if (!host) return;

            host.innerHTML = '<canvas class="fusion"></canvas>';

            canvas = host.querySelector(".fusion");
            ctx = canvas.getContext && canvas.getContext("2d");
            if (!ctx) return;

            probe = document.createElement("span");
            probe.hidden = true;
            host.appendChild(probe);

            still = !!(window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches);

            // each pool on its own slow path; the speeds never line up, so
            // the whole never repeats
            for (var i = 0; i < POOLS; i++) {
                pools.push({
                    fx: 0.1 + Math.random() * 0.14,
                    fy: 0.09 + Math.random() * 0.14,
                    px: Math.random() * Math.PI * 2,
                    py: Math.random() * Math.PI * 2,
                    size: 0.55 + Math.random() * 0.25,
                    now: null,
                    to: null
                });
            }
            clock = Math.random() * 100;

            fit();
            window.addEventListener("resize", fit);

            Game.Events.on("game:started", retint);
            Game.Events.on("board:settled", retint);

            if (!still) {
                last = window.performance ? window.performance.now() : Date.now();
                window.requestAnimationFrame(frame);
            }
        }
    };
})();
