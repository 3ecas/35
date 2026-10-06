window.Game = window.Game || {};

/* =============================================================================
   CHARGE VIEW
   -----------------------------------------------------------------------------
   The bomb beside the hand. A small square that fills like a glass: a level
   that rises as the charge does, with a drift of dust in every colour of the
   wheel rising through it so the thing is visibly alive, and a pulse that
   never stops — a square stroke born on the dial's edge in a flash, going
   out past it and fading as it goes, one after another. White, faint and
   slow while the dial is filling, and the fuller the clearer. Once it is
   worth pressing the edge itself turns to the rainbow only 35 wears,
   turning and pulsing, and the strokes going out carry it. It is meant to be
   read out of the corner of the eye — the piece sitting on top is what you
   are actually looking at.

   Any [data-charge] button gets this renderer, so a second dial would only
   need its markup.
   ============================================================================= */

(function () {
    var PAD = 15;              // room around the square for the pulses to go
    var GREY = "#aeb6c0";      // what a dial looks like while it is still filling

    // the pulse: seconds between one and the next, seconds one takes to cross
    // its room, and the share of that spent flashing — filling, then ready
    var EVERY = [0.9, 0.42];
    var TRAVEL = [1.3, 0.7];
    var FLASH = 0.18;

    // the ready edge: how fast the rainbow goes round, in turns a second, and
    // how fast it pulses, in beats a second
    var SPIN = 0.22;
    var BEAT = 0.9;

    var dials = [];
    var still = false;
    var last = 0;

    /* ---- the dust ------------------------------------------------------------
       Plain dots, each in one colour of the wheel, drifting up through the
       charge: at two pixels nothing finer than a dot survives anyway. */
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

    /* the rainbow round the dial, turned to `angle`: a conic gradient where
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

    function make(host) {
        var canvas = host.querySelector(".dial__ink");
        if (!canvas || !canvas.getContext) return null;

        var one = {
            name: host.getAttribute("data-charge"),
            host: host,
            canvas: canvas,
            ctx: canvas.getContext("2d"),
            lit: host.getAttribute("data-lit") || "#ffd873",
            charge: 0,
            shown: 0,
            ready: false,
            motes: [],
            pulses: [],         // each is how far out it has gone, 0 to 1
            wait: 0,            // seconds until the next one is born
            angle: 0,           // where the rainbow has turned to
            beat: 0             // and where in its pulse the ready edge is
        };

        for (var i = 0; i < 14; i++) one.motes.push(mote());
        measure(one);
        return one;
    }

    function measure(one) {
        var box = one.canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        one.wide = Math.max(1, box.width);
        one.tall = Math.max(1, box.height);
        one.canvas.width = Math.round(one.wide * dpr);
        one.canvas.height = Math.round(one.tall * dpr);
        one.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* the square stroke `reach` outside the dial's edge */
    function ring(ctx, cx, cy, r, reach) {
        var half = r + reach;
        ctx.strokeRect(cx - half, cy - half, half * 2, half * 2);
    }

    function draw(one, gap) {
        var ctx = one.ctx;
        var w = one.wide;
        var h = one.tall;
        var cx = w / 2;
        var cy = h / 2;
        var r = Math.min(w, h) / 2 - PAD;           // half the square itself
        var top = cy - r;
        var span = r * 2;
        var mode = one.ready ? 1 : 0;

        one.shown += (one.charge - one.shown) * Math.min(1, gap * 5);
        ctx.clearRect(0, 0, w, h);

        // While it is filling a dial is grey — the colour is the reward, and it
        // only arrives when the thing is worth pressing.
        var body = one.ready ? one.lit : GREY;

        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - r, cy - r, span, span);
        ctx.clip();

        var level = top + span * (1 - Math.max(0, Math.min(1, one.shown)));

        ctx.globalAlpha = one.ready ? 0.92 : 0.5;
        ctx.fillStyle = body;
        ctx.fillRect(cx - r, level, span, cy + r - level);

        for (var i = 0; i < one.motes.length; i++) {
            var m = one.motes[i];
            if (!still) {
                m.y -= m.rise * gap * (one.ready ? 1.9 : 1);
                if (m.y < 0) { one.motes[i] = mote(); one.motes[i].y = 1; continue; }
            }
            var y = top + span * m.y;
            if (y < level) continue;                 // only inside what is filled

            var dot = m.size * (one.ready ? 1.25 : 1);
            ctx.globalAlpha = (one.ready ? 0.95 : 0.7) * m.glow;
            ctx.fillStyle = m.colour;
            ctx.fillRect(cx - r + span * m.x - dot / 2, y - dot / 2, dot, dot);
        }

        ctx.restore();

        // Ready: the edge is the rainbow, going round and pulsing — wider and
        // brighter at the top of each beat — over the dial's own black edge.
        var paint = one.ready ? one.lit : "#ffffff";
        if (one.ready) {
            if (!still) {
                one.angle += gap * SPIN * Math.PI * 2;
                one.beat += gap * BEAT * Math.PI * 2;
            }
            var swell = 0.5 + 0.5 * Math.sin(one.beat);
            paint = rainbow(ctx, cx, cy, one.angle);

            ctx.globalAlpha = 0.8 + 0.2 * swell;
            ctx.lineWidth = 2.5 + 1.5 * swell;
            ctx.strokeStyle = paint;
            ring(ctx, cx, cy, r, 0);
        }

        // The pulse. A new one is born on the edge whenever the last has had
        // its head start, so there is always one on its way out: faint while
        // the dial fills, and the fuller the clearer; black once it is ready.
        // Each goes out in a flash — a white stroke on the edge, gone in a
        // moment — then fades as it goes, until it reaches the edge of its
        // room and is let go.
        if (!still) {
            one.wait -= gap;
            if (one.wait <= 0) {
                one.pulses.push(0);
                one.wait = EVERY[mode];
            }
        }

        var seen = one.ready ? 1 : 0.35 + 0.45 * Math.max(0, Math.min(1, one.shown));
        ctx.lineJoin = "miter";

        for (var k = one.pulses.length - 1; k >= 0; k--) {
            var out = one.pulses[k];
            if (!still) {
                out += gap / TRAVEL[mode];
                one.pulses[k] = out;
            }
            if (out >= 1) { one.pulses.splice(k, 1); continue; }

            var fade = 1 - out;
            var reach = out * (PAD - 2);

            // white while filling, like the dial's own edge; the rainbow once
            // it is ready — and the flash white either way
            ctx.globalAlpha = seen * fade * fade;
            ctx.lineWidth = 1 + 2 * fade;
            ctx.strokeStyle = paint;
            ring(ctx, cx, cy, r, reach);

            if (out < FLASH) {
                ctx.globalAlpha = (one.ready ? 1 : 0.9) * (1 - out / FLASH);
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#ffffff";
                ring(ctx, cx, cy, r, reach);
            }
        }

        ctx.globalAlpha = 1;
    }

    function frame(now) {
        var gap = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        for (var i = 0; i < dials.length; i++) draw(dials[i], gap);
        if (!still) window.requestAnimationFrame(frame);
    }

    function find(name) {
        for (var i = 0; i < dials.length; i++) {
            if (dials[i].name === name) return dials[i];
        }
        return null;
    }

    /* a short shudder, so a dial visibly reacts to being fed */
    function react(one, hard) {
        one.host.classList.remove("is-fed", "is-filled");
        void one.host.offsetWidth;                   // restart the animation
        one.host.classList.add(hard ? "is-filled" : "is-fed");
        window.clearTimeout(one.settle);
        one.settle = window.setTimeout(function () {
            one.host.classList.remove("is-fed", "is-filled");
        }, hard ? 620 : 340);
    }

    function show(detail) {
        var one = find(detail.name);
        if (!one) return;

        var grew = detail.charge > one.charge + 0.0001;
        var filled = detail.ready && !one.ready;

        one.charge = detail.charge;
        one.ready = detail.ready;

        // filling up is announced: a pulse at once, not after the next wait
        if (filled) one.wait = 0;

        if (!still && (grew || filled)) react(one, filled);
        one.host.classList.toggle("is-ready", detail.ready);
        one.host.disabled = !detail.ready;
        if (still) draw(one, 1);
    }

    Game.ChargeView = {
        init: function () {
            var hosts = document.querySelectorAll("[data-charge]");
            if (!hosts.length) return;

            still = window.matchMedia
                && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            Array.prototype.forEach.call(hosts, function (host) {
                var one = make(host);
                if (!one) return;
                dials.push(one);

                host.addEventListener("click", function () {
                    Game.Charges.toggle(one.name);
                });
            });

            Game.Icons.hydrate(document);

            window.addEventListener("resize", function () {
                dials.forEach(measure);
            });

            Game.Events.on("charge:change", show);

            Game.Events.on("charge:armed", function (detail) {
                dials.forEach(function (one) {
                    one.host.classList.toggle("is-armed", detail.name === one.name);
                });
            });

            last = window.performance ? window.performance.now() : Date.now();
            window.requestAnimationFrame(frame);
        }
    };
})();
