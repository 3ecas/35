window.Game = window.Game || {};

/* =============================================================================
   CHARGE VIEW
   -----------------------------------------------------------------------------
   The bomb dial beside the hand. A small disc that fills like a glass: a
   level that rises as the charge does, with a few motes drifting up through
   it so the thing is visibly alive without asking for attention. It is meant to
   be read out of the corner of the eye — the piece sitting on top is what you
   are actually looking at.

   Any [data-charge] button gets this renderer, so a second dial would only
   need its markup.
   ============================================================================= */

(function () {
    var PAD = 15;              // room around the disc for the ready-state motes
    var GREY = "#aeb6c0";      // what a dial looks like while it is still filling

    var dials = [];
    var still = false;
    var last = 0;

    /* ---- the piece itself, small enough to be dust ---------------------------
       The dial throws off what it is: little sticks. Drawn rather than scaled
       down from the art, because at four pixels the real drawing is a smudge —
       what survives at this size is the silhouette and nothing else. */
    function stick(ctx, x, y, r, turn) {
        var w = r * 1.5;
        var h = r * 0.95;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(turn);
        ctx.beginPath();
        // a rounded body, and a nub for the fuse
        ctx.moveTo(-w / 2 + h / 3, -h / 2);
        ctx.lineTo(w / 2 - h / 3, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, 0);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - h / 3, h / 2);
        ctx.lineTo(-w / 2 + h / 3, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, 0);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + h / 3, -h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 + r * 0.22, -h * 0.55, r * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function mote() {
        return {
            x: 0.15 + Math.random() * 0.7,
            y: Math.random(),
            size: 1.6 + Math.random() * 1.5,
            rise: 0.06 + Math.random() * 0.14,
            turn: Math.random() * Math.PI,
            twist: (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random()),
            glow: 0.3 + Math.random() * 0.7
        };
    }

    /* the ones that only appear once a dial is worth pressing: they circle it
       rather than sit in it, which is what makes a full dial catch the eye */
    function spark() {
        return {
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.5),
            out: 0.02 + Math.random() * 0.85,      // 0 at the rim, 1 at the edge
            size: 1.8 + Math.random() * 1.6,
            turn: Math.random() * Math.PI,
            twist: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random()),
            life: Math.random()
        };
    }

    function make(host) {
        var canvas = host.querySelector(".dial__ink");
        if (!canvas || !canvas.getContext) return null;

        var one = {
            name: host.getAttribute("data-charge"),
            shape: stick,
            host: host,
            canvas: canvas,
            ctx: canvas.getContext("2d"),
            tint: host.getAttribute("data-tint") || "#e2b75c",
            lit: host.getAttribute("data-lit") || "#ffd873",
            charge: 0,
            shown: 0,
            ready: false,
            motes: []
        };

        one.sparks = [];
        for (var i = 0; i < 10; i++) one.motes.push(mote());
        for (var k = 0; k < 14; k++) one.sparks.push(spark());
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

    function draw(one, gap) {
        var ctx = one.ctx;
        var w = one.wide;
        var h = one.tall;
        var cx = w / 2;
        var cy = h / 2;
        var r = Math.min(w, h) / 2 - PAD;           // the disc itself
        var top = cy - r;
        var span = r * 2;

        one.shown += (one.charge - one.shown) * Math.min(1, gap * 5);
        ctx.clearRect(0, 0, w, h);

        // While it is filling a dial is grey — the colour is the reward, and it
        // only arrives when the thing is worth pressing.
        var body = one.ready ? one.lit : GREY;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        var level = top + span * (1 - Math.max(0, Math.min(1, one.shown)));

        ctx.globalAlpha = one.ready ? 0.92 : 0.5;
        ctx.fillStyle = body;
        ctx.fillRect(cx - r, level, span, cy + r - level);

        for (var i = 0; i < one.motes.length; i++) {
            var m = one.motes[i];
            if (!still) {
                m.y -= m.rise * gap * (one.ready ? 1.9 : 1);
                m.turn += m.twist * gap;
                if (m.y < 0) { one.motes[i] = mote(); one.motes[i].y = 1; continue; }
            }
            var y = top + span * m.y;
            if (y < level) continue;                 // only inside what is filled

            ctx.globalAlpha = (one.ready ? 0.85 : 0.5) * m.glow;
            ctx.fillStyle = one.ready ? "#fffdf0" : "#ffffff";
            one.shape(ctx, cx - r + span * m.x, y,
                      m.size * (one.ready ? 1.2 : 1), m.turn);
        }

        ctx.restore();

        // and, once it is full, a scatter of sparks orbiting outside the rim
        if (one.ready) {
            for (var k = 0; k < one.sparks.length; k++) {
                var s = one.sparks[k];
                if (!still) {
                    s.angle += s.spin * gap;
                    s.turn += s.twist * gap;
                    s.life += gap * 0.55;
                    if (s.life > 1) { one.sparks[k] = spark(); one.sparks[k].life = 0; continue; }
                }
                var reach = r + 3 + s.out * (PAD - 4);
                var fade = Math.sin(Math.min(1, s.life) * Math.PI);

                ctx.globalAlpha = 0.85 * fade;
                ctx.fillStyle = one.lit;
                one.shape(ctx, cx + Math.cos(s.angle) * reach,
                          cy + Math.sin(s.angle) * reach, s.size, s.turn);
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
