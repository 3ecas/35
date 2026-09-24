window.Game = window.Game || {};

(function () {
    var host = null;
    var valueEl = null;
    var bestEl = null;

    var shown = 0;
    var target = 0;
    var frame = null;

    var pending = 0;
    var era = 0;

    var COUNT_MS = 420;
    var drawn = null;

    // in the tiles' block digits; redrawn only when the whole number moves,
    // and told how many ems wide it runs, so a score in the billions still
    // fits across the screen (css/game.css)
    function paint() {
        var value = Math.round(shown);
        if (!valueEl || value === drawn) return;
        drawn = value;
        valueEl.innerHTML = Game.Icons.number(value);
        var digits = valueEl.firstChild;
        if (digits) valueEl.style.setProperty("--wide", parseFloat(digits.style.width));
    }

    function paintBest() {
        var round = Game.Round.get();
        if (!bestEl || !round) return;
        // no word for it: the small number in the corner is the one to beat
        bestEl.innerHTML = round.best
            ? Game.Icons.number(round.best, "Best " + round.best)
            : "";
    }

    function run() {
        var from = shown;
        var gap = target - from;
        if (gap <= 0) {
            shown = target;
            paint();
            return;
        }

        var started = null;
        if (frame) window.cancelAnimationFrame(frame);

        function step(now) {
            if (started === null) started = now;
            var t = Math.min(1, (now - started) / COUNT_MS);

            var eased = 1 - Math.pow(1 - t, 3);
            shown = from + gap * eased;
            paint();
            if (t < 1) frame = window.requestAnimationFrame(step);
            else frame = null;
        }

        frame = window.requestAnimationFrame(step);
    }

    function pop(points) {
        if (!valueEl) return;
        var weight = Math.min(1, points / 3000);

        valueEl.style.setProperty("--pop", 1.12 + weight * 0.34);
        valueEl.classList.remove("is-up");
        void valueEl.offsetWidth;
        valueEl.classList.add("is-up");
    }

    Game.ScoreView = {
        init: function () {
            host = document.getElementById("scoreboard");
            if (!host) return;

            valueEl = host.querySelector(".scoreboard__value");
            bestEl = host.querySelector(".scoreboard__best");

            Game.Events.on("game:started", function () {
                era += 1;
                pending = 0;
                if (frame) window.cancelAnimationFrame(frame);
                frame = null;

                // A resumed run starts here too, and nothing is enqueued when
                // it does - no steps means no board:settled, which is the only
                // other thing that re-syncs this counter. Zeroing it blindly
                // left the board and the ladder right and the score reading 0
                // until the next merge.
                var round = Game.Round.get();
                shown = round ? round.score : 0;
                target = shown;

                paint();
                paintBest();
            });

            Game.Events.on("board:merged", function (detail) {
                var points = detail.step.points;
                if (!points) return;

                var mine = era;
                pending += points;

                window.setTimeout(function () {
                    if (mine !== era) return;
                    pending -= points;
                    target += points;
                    pop(points);
                    run();
                }, Game.Toast.FLY_MS - 60);
            });

            Game.Events.on("board:settled", function () {
                var round = Game.Round.get();
                if (!round || pending > 0) return;
                if (target === round.score) return;
                target = round.score;
                run();
            });

            Game.Events.on("game:over", paintBest);
        }
    };
})();
