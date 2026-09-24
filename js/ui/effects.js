window.Game = window.Game || {};

(function () {
    var flashHost = null;
    var comboHost = null;

    function restart(element, className) {
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }

    function layer(className) {
        var node = document.createElement("div");
        node.className = className;
        document.body.appendChild(node);
        return node;
    }

    Game.Effects = {
        land: function (tile, neighbours) {
            if (!tile) return;
            restart(tile, "is-landed");
            this.shove(neighbours, 3);
        },

        shove: function (neighbours, force) {
            neighbours.forEach(function (near) {
                if (!near.tile) return;
                near.tile.style.setProperty("--jx", near.dx * force + "px");
                near.tile.style.setProperty("--jy", near.dy * force + "px");
                restart(near.tile, "is-jolt");
            });
        },

        burst: function (tile, neighbours, tier, chain) {
            if (!tile) return;

            var weight = tier + chain * 1.5;

            var ring = document.createElement("span");
            ring.className = "tile__ring";
            ring.style.setProperty("--reach", 1.4 + weight * 0.14);
            tile.appendChild(ring);
            Game.Toast.autoRemove(ring, 720);

            this.shove(neighbours, 3 + Math.min(weight, 12));
        },

        shake: function (board, tier, chain) {
            var weight = tier + chain * 1.5;
            if (!board || weight < 3) return;

            var force = Game.Config.game.shakeForce;
            if (typeof force !== "number") force = 1;
            if (force <= 0) return;

            board.style.setProperty(
                "--shake",
                Math.min(weight - 1, 11) * 1.5 * force + "px"
            );
            restart(board, "is-shaken");
        },

        flash: function (tier) {
            if (tier < 7) return;
            if (!flashHost) flashHost = layer("flash");
            flashHost.style.setProperty("--glow", (tier - 6) * 0.07 + 0.08);
            restart(flashHost, "is-lit");
        },

        combo: function (count) {
            if (count < 2) return;
            if (!comboHost) comboHost = layer("combo");
            comboHost.innerHTML = Game.Icons.number("×" + count);
            comboHost.style.setProperty("--grow", 1 + Math.min(count, 8) * 0.11);
            restart(comboHost, "is-up");
        },

        discover: function (tile) {
            if (!tile) return;
            restart(tile, "is-new");
        }
    };
})();
