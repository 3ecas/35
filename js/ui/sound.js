window.Game = window.Game || {};

(function () {
    var KEY = "thirtyfive.sound";

    var ctx = null;
    var master = null;
    var noise = null;
    var on = true;
    var broken = false;

    var SCALE = [
        261.63, 293.66, 329.63, 392.0, 440.0,
        523.25, 587.33, 659.25, 783.99, 880.0,
        1046.5, 1174.66, 1318.51
    ];

    function step(i) {
        return SCALE[Math.max(0, Math.min(SCALE.length - 1, i))];
    }

    function ensure() {
        if (ctx || broken) return ctx;

        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) {
            broken = true;
            return null;
        }

        try {
            ctx = new Ctor();
            master = ctx.createGain();
            master.gain.value = 0.2;
            master.connect(ctx.destination);
        } catch (err) {
            broken = true;
            ctx = null;
        }

        return ctx;
    }

    function hiss() {
        if (noise) return noise;
        var frames = Math.floor(ctx.sampleRate * 0.5);
        noise = ctx.createBuffer(1, frames, ctx.sampleRate);
        var data = noise.getChannelData(0);
        for (var i = 0; i < frames; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return noise;
    }

    function tone(o) {
        if (!on || !ensure()) return;

        var now = ctx.currentTime + (o.at || 0);
        var len = o.len || 0.18;
        var peak = o.gain || 0.3;

        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = o.type || "triangle";
        osc.frequency.setValueAtTime(o.freq, now);
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, now + len);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.014);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + len + 0.03);
    }

    function crunch(o) {
        if (!on || !ensure()) return;

        var now = ctx.currentTime + (o.at || 0);
        var len = o.len || 0.2;

        var src = ctx.createBufferSource();
        src.buffer = hiss();

        var band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = o.freq || 900;
        band.Q.value = o.q || 0.9;

        var gain = ctx.createGain();
        gain.gain.setValueAtTime(o.gain || 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

        src.connect(band);
        band.connect(gain);
        gain.connect(master);
        src.start(now);
        src.stop(now + len);
    }

    function joined(piece, chain, times) {
        var note = step(chain - 1 + Math.floor(piece.tier / 3));
        tone({ freq: note, len: 0.15, gain: 0.24 });

        if (piece.tier >= 6) {
            tone({ freq: note / 4, type: "sine", len: 0.3, gain: 0.2 });
        }

        if (times >= Game.Config.game.chainMost) {
            tone({ freq: note * 2, at: 0.07, len: 0.14, gain: 0.14, type: "sine" });
        }
    }

    function broke(count) {
        for (var i = 0; i < Math.min(count, 4); i++) {
            crunch({
                at: i * 0.045,
                freq: 620 + Math.random() * 500,
                len: 0.16,
                gain: 0.26
            });
        }
    }

    function cashed() {
        [0, 2, 4, 7].forEach(function (n, i) {
            tone({ freq: step(n + 5), at: i * 0.06, len: 0.26, gain: 0.2 });
        });
    }

    function found() {
        [0, 3, 5].forEach(function (n, i) {
            tone({
                freq: step(n + 6),
                at: i * 0.075,
                len: 0.22,
                gain: 0.15,
                type: "sine"
            });
        });
    }

    function landed(count) {
        tone({
            freq: 150,
            to: 90,
            type: "sine",
            len: 0.11,
            gain: Math.min(0.06 + count * 0.02, 0.16)
        });
    }

    function fuse(at, of) {
        crunch({
            freq: 1500 + (at / Math.max(1, of)) * 1700,
            len: 0.05,
            q: 3.4,
            gain: 0.11
        });
    }

    function over() {
        [8, 6, 4, 2].forEach(function (n, i) {
            tone({ freq: step(n), at: i * 0.15, len: 0.42, gain: 0.2 });
        });
    }

    function onMerged(detail) {
        var s = detail.step;

        if (s.type === "merge") {
            joined(Game.Pieces.byId(s.piece), s.chain || 1, s.times || 1);
            return;
        }

        if (s.type === "cash") {
            cashed();
            return;
        }

        if (s.type === "clear") {
            if (s.points) cashed();
            else broke(s.cells.length);
        }
    }

    function button() {
        var node = document.querySelector("[data-sound]");
        if (!node) return;

        function paint() {
            node.innerHTML = Game.Icons.svg(on ? "sound" : "mute");
            node.setAttribute("aria-pressed", on ? "false" : "true");
            node.setAttribute(
                "aria-label",
                on ? "Turn sound off" : "Turn sound on"
            );
            node.classList.toggle("is-off", !on);
        }

        node.addEventListener("click", function () {
            on = !on;
            Game.Storage.write(KEY, { on: on });
            paint();
            if (on) tone({ freq: step(5), len: 0.16, gain: 0.22 });
        });

        paint();
    }

    Game.Sound = {
        start: function () {
            var saved = Game.Storage.read(KEY);
            if (saved && typeof saved.on === "boolean") on = saved.on;

            ["pointerdown", "keydown"].forEach(function (kind) {
                window.addEventListener(kind, function () {
                    if (!ensure()) return;
                    if (ctx.state === "suspended") ctx.resume();
                });
            });

            Game.Events.on("board:merged", onMerged);
            Game.Events.on("board:landed", function (d) {
                landed(d.count || 1);
            });
            Game.Events.on("board:fuse", function (d) {
                fuse(d.step, d.of);
            });
            Game.Events.on("game:found", found);
            Game.Events.on("game:over", over);

            button();
        }
    };
})();
