window.Game = window.Game || {};

/* =============================================================================
   BACKDROP
   -----------------------------------------------------------------------------
   The ground the game sits on is a soft rainbow: every hue of the wheel that
   35 wears, in order round the screen, blended into one another and turning
   slowly — a turn takes a minute and a half — while each pool drifts a little
   off the ring on a slow path of its own, so the whole never quite repeats.

   The pools keep the wheel's hues but not their strength: half the saturation
   taken out and a touch of white let in, so the vivid tiles stand clear of
   the ground they sit on, while staying deep enough that the white of the
   score, the buttons and the grid reads over all of it.

   It is drawn on a canvas a few dozen pixels across and stretched over the
   whole screen — the stretching is what makes the blend so soft, and redrawing
   something that small costs next to nothing. It redraws at a gentle rate, and
   not at all for anyone who has asked for less motion.
   ============================================================================= */

(function () {
    var POOLS = 8;            // hues of the wheel, evenly round the screen
    var ACROSS = 36;          // the canvas is this many pixels wide
    var STEP = 1 / 24;        // seconds between redraws
    var TURN = 90;            // seconds the rainbow takes to go round once
    var MUTE = 0.55;          // share of each hue's saturation taken out
    var LIFT = 0.12;          // and how far it is then lifted towards white
    var STRENGTH = 0.6;       // how much of a pool's colour shows at its heart
    var DRIFT = 0.07;         // how far off the ring a pool wanders, of the screen

    var canvas = null;
    var ctx = null;
    var wide = 0;
    var tall = 0;
    var pools = [];
    var base = [200, 200, 200];
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

    /* the wheel's colour `deg` round it, between the stops 35 wears */
    function wheelAt(deg) {
        var wheel = Game.Icons.wheel();
        var at = ((deg % 360) + 360) % 360;
        for (var i = 1; i < wheel.length; i++) {
            if (at > wheel[i].at) continue;
            var a = rgb(wheel[i - 1].hex);
            var b = rgb(wheel[i].hex);
            var t = (at - wheel[i - 1].at) / Math.max(1e-6, wheel[i].at - wheel[i - 1].at);
            return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        }
        return rgb(wheel[wheel.length - 1].hex);
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
        var turn = clock / TURN * Math.PI * 2;
        pools.forEach(function (pool, i) {
            // its place on the ring just inside the edges of the screen, and
            // a little off it
            var angle = turn + i / POOLS * Math.PI * 2;
            var x = (0.5 + 0.48 * Math.cos(angle) + DRIFT * Math.sin(clock * pool.fx + pool.px)) * wide;
            var y = (0.5 + 0.48 * Math.sin(angle) + DRIFT * Math.sin(clock * pool.fy + pool.py)) * tall;
            var r = reach * pool.size;
            var c = pool.colour.map(Math.round).join(",");

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
            clock += Math.min(gap, 0.1);
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

            still = !!(window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches);

            // one pool a hue, evenly round the wheel, each wandering on its
            // own slow path; the speeds never line up, so the whole never
            // repeats. The ground under them is their average, a shade deeper.
            var sum = [0, 0, 0];
            for (var i = 0; i < POOLS; i++) {
                var colour = mute(wheelAt(i / POOLS * 360));
                for (var k = 0; k < 3; k++) sum[k] += colour[k];
                pools.push({
                    colour: colour,
                    fx: 0.1 + Math.random() * 0.14,
                    fy: 0.09 + Math.random() * 0.14,
                    px: Math.random() * Math.PI * 2,
                    py: Math.random() * Math.PI * 2,
                    size: 0.6 + Math.random() * 0.2
                });
            }
            base = sum.map(function (v) { return v / POOLS * 0.92; });
            clock = Math.random() * TURN;

            fit();
            window.addEventListener("resize", fit);

            if (still) draw();
            else {
                last = window.performance ? window.performance.now() : Date.now();
                window.requestAnimationFrame(frame);
            }
        }
    };
})();
