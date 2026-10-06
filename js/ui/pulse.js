window.Game = window.Game || {};

/* =============================================================================
   PULSE — the bomb's light
   -----------------------------------------------------------------------------
   The dial beside the hand, once it is worth pressing (js/ui/chargeview.js):
   its edge wears the rainbow only 35 wears, going round and pulsing — wider
   and brighter at the top of each beat; a stroke is born on the edge in a
   white flash and goes out past it, fading as it goes, one after another
   without end; and dust in every colour of the wheel rises inside. The dust
   alone drifts over a bomb standing on the board, and the board borrows the
   loop for the green along its lines while it waits (js/ui/boardview.js).
   The strokes can take a square or a diamond.

   One loop draws every light there is, and stops when there is none.
   ============================================================================= */

(function () {
    // the pulse: seconds between one and the next, seconds one takes to cross
    // its room, and the share of that spent flashing — filling, then live
    var EVERY = [0.9, 0.42];
    var TRAVEL = [1.3, 0.7];
    var FLASH = 0.18;

    // the live edge: turns of the rainbow a second, and beats a second
    var SPIN = 0.22;
    var BEAT = 0.9;

    var lights = [];
    var still = null;
    var running = false;
    var last = 0;

    function quiet() {
        if (still === null) {
            still = !!(window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        }
        return still;
    }

    /* the rainbow round (cx, cy), turned to `angle`: a conic gradient where
       the canvas can draw one, and where it cannot, the one colour of the
       wheel that is at twelve o'clock right now */
    function rainbow(ctx, cx, cy, angle) {
        var wheel = Game.Icons.wheel();
        if (!ctx.createConicGradient) {
            var share = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
            return wheel[Math.floor(share * (wheel.length - 1))].hex;
        }
        var g = ctx.createConicGradient(angle - Math.PI / 2, cx, cy);
        wheel.forEach(function (stop) {
            g.addColorStop(Math.min(1, stop.at / 360), stop.hex);
        });
        return g;
    }

    /* the outline of the piece, `reach` outside its edge: a square, or a
       diamond standing on its point, each `half` from the centre to the edge */
    function outline(ctx, cx, cy, half, reach, diamond) {
        var h = half + reach;
        ctx.beginPath();
        if (diamond) {
            ctx.moveTo(cx, cy - h);
            ctx.lineTo(cx + h, cy);
            ctx.lineTo(cx, cy + h);
            ctx.lineTo(cx - h, cy);
        } else {
            ctx.rect(cx - h, cy - h, h * 2, h * 2);
        }
        ctx.closePath();
    }

    function mote() {
        var wheel = Game.Icons.wheel();
        return {
            x: 0.12 + Math.random() * 0.76,
            y: Math.random(),
            size: 1.3 + Math.random() * 1.3,
            rise: 0.06 + Math.random() * 0.14,
            glow: 0.4 + Math.random() * 0.6,
            colour: wheel[Math.floor(Math.random() * (wheel.length - 1))].hex
        };
    }

    function measure(light) {
        var box = light.canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        light.wide = Math.max(1, box.width);
        light.tall = Math.max(1, box.height);
        light.canvas.width = Math.round(light.wide * dpr);
        light.canvas.height = Math.round(light.tall * dpr);
        light.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(now) {
        var gap = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        for (var i = 0; i < lights.length; i++) lights[i].draw(lights[i], gap);
        if (lights.length && !quiet()) window.requestAnimationFrame(frame);
        else running = false;
    }

    function lift() {
        if (running || quiet()) return;
        running = true;
        last = window.performance ? window.performance.now() : Date.now();
        window.requestAnimationFrame(frame);
    }

    window.addEventListener("resize", function () {
        lights.forEach(measure);
    });

    Game.Pulse = {
        /* a light on `canvas`, drawn by `draw(light, gap)` every frame;
           `diamond` says which shape its strokes take */
        make: function (canvas, diamond, draw) {
            var light = {
                canvas: canvas,
                ctx: canvas.getContext("2d"),
                diamond: !!diamond,
                draw: draw,
                pulses: [],         // each is how far out it has gone, 0 to 1
                wait: 0,            // seconds until the next one is born
                angle: 0,           // where the rainbow has turned to
                beat: 0,            // and where in its pulse the live edge is
                motes: []
            };
            for (var i = 0; i < 14; i++) light.motes.push(mote());
            measure(light);
            lights.push(light);
            if (quiet()) draw(light, 1); else lift();
            return light;
        },

        drop: function (light) {
            var at = lights.indexOf(light);
            if (at !== -1) lights.splice(at, 1);
        },

        // for a change that must show at once under reduced motion
        touch: function (light) {
            if (quiet()) light.draw(light, 1);
        },

        // a pulse now, not after the next wait — for the moment a dial fills
        now: function (light) {
            light.wait = 0;
        },

        still: quiet,
        rainbow: rainbow,
        outline: outline,

        /* The live edge: the rainbow, going round and pulsing. Returns the
           paint, for the strokes going out to carry. */
        edge: function (light, cx, cy, half, gap) {
            var ctx = light.ctx;
            if (!quiet()) {
                light.angle += gap * SPIN * Math.PI * 2;
                light.beat += gap * BEAT * Math.PI * 2;
            }
            var swell = 0.5 + 0.5 * Math.sin(light.beat);
            var paint = rainbow(ctx, cx, cy, light.angle);

            ctx.globalAlpha = 0.8 + 0.2 * swell;
            ctx.lineWidth = 2.5 + 1.5 * swell;
            ctx.lineJoin = "miter";
            ctx.strokeStyle = paint;
            outline(ctx, cx, cy, half, 0, light.diamond);
            ctx.stroke();
            ctx.globalAlpha = 1;
            return paint;
        },

        /* The strokes going out. `room` is how far they go before they are
           let go; `live` picks the quick cadence; `paint` and `seen` are
           their colour and how plainly they show. Each is born in a white
           flash, then fades as it goes. */
        pulses: function (light, cx, cy, half, room, gap, live, paint, seen) {
            var ctx = light.ctx;
            var mode = live ? 1 : 0;

            if (!quiet()) {
                light.wait -= gap;
                if (light.wait <= 0) {
                    light.pulses.push(0);
                    light.wait = EVERY[mode];
                }
            }

            ctx.lineJoin = "miter";
            for (var k = light.pulses.length - 1; k >= 0; k--) {
                var out = light.pulses[k];
                if (!quiet()) {
                    out += gap / TRAVEL[mode];
                    light.pulses[k] = out;
                }
                if (out >= 1) { light.pulses.splice(k, 1); continue; }

                var fade = 1 - out;
                var reach = out * room;

                ctx.globalAlpha = seen * fade * fade;
                ctx.lineWidth = 1 + 2 * fade;
                ctx.strokeStyle = paint;
                outline(ctx, cx, cy, half, reach, light.diamond);
                ctx.stroke();

                if (out < FLASH) {
                    ctx.globalAlpha = (live ? 1 : 0.9) * (1 - out / FLASH);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#ffffff";
                    outline(ctx, cx, cy, half, reach, light.diamond);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
        },

        /* The dust: dots in every colour of the wheel rising through the box
           (x, y, w, h), shown only below `floor` — the level a dial has
           filled to — and only inside whatever the caller has clipped to. */
        dust: function (light, gap, x, y, w, h, floor, live) {
            var ctx = light.ctx;
            for (var i = 0; i < light.motes.length; i++) {
                var m = light.motes[i];
                if (!quiet()) {
                    m.y -= m.rise * gap * (live ? 1.9 : 1);
                    if (m.y < 0) { light.motes[i] = mote(); light.motes[i].y = 1; continue; }
                }
                var my = y + h * m.y;
                if (my < floor) continue;

                var dot = m.size * (live ? 1.25 : 1);
                ctx.globalAlpha = (live ? 0.95 : 0.7) * m.glow;
                ctx.fillStyle = m.colour;
                ctx.fillRect(x + w * m.x - dot / 2, my - dot / 2, dot, dot);
            }
            ctx.globalAlpha = 1;
        }
    };
})();
