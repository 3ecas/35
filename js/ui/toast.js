window.Game = window.Game || {};

(function () {
    function drop(element) {
        if (element.parentNode) element.parentNode.removeChild(element);
    }

    Game.Toast = {
        autoRemove: function (element, fallbackMs) {
            element.addEventListener("animationend", function () {
                drop(element);
            });
            window.setTimeout(function () {
                drop(element);
            }, fallbackMs);
        },

        FLY_MS: 430,

        toScore: function (anchor, text, iconName, tintClass) {
            if (!anchor) return;

            var box = anchor.getBoundingClientRect();
            var x = box.left + box.width / 2;
            var y = box.top + box.height / 2;

            var chip = document.createElement("div");
            chip.className = "float " + (tintClass || "");
            chip.style.left = x + "px";
            chip.style.top = y + "px";

            var score = document.querySelector(".scoreboard__value");
            if (score) {
                var aim = score.getBoundingClientRect();
                chip.style.setProperty("--dx", aim.left + aim.width / 2 - x + "px");
                chip.style.setProperty("--dy", aim.top + aim.height / 2 - y + "px");
            }

            chip.innerHTML =
                (iconName ? Game.Icons.svg(iconName) : "") +
                Game.Icons.number(text);

            document.body.appendChild(chip);
            this.autoRemove(chip, this.FLY_MS + 260);
        }
    };
})();
