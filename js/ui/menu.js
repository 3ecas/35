window.Game = window.Game || {};

/* =============================================================================
   MENU
   -----------------------------------------------------------------------------
   The one button at the top left opens this: how to play, sound, start over,
   and — on the web — where to get the app, and the privacy page. In the apps
   the stores are left out: you are already there, and a store would rather
   not be shown the other one. The words are the game's own square capitals,
   and the 35 at the top is the top of the ladder, as on the icon.
   ============================================================================= */

(function () {
    var host = null;
    var open = false;

    function native() {
        var cap = window.Capacitor;
        return !!(cap && cap.isNativePlatform && cap.isNativePlatform());
    }

    function all(selector, fn) {
        Array.prototype.forEach.call(host.querySelectorAll(selector), fn);
    }

    function fill() {
        all("[data-words]", function (el) {
            el.innerHTML = Game.Icons.words(el.getAttribute("data-words"));
        });
        all("[data-number]", function (el) {
            el.innerHTML = Game.Icons.number(el.getAttribute("data-number"));
        });

        var links = Game.Config.links || {};
        var inApp = native();

        // the stores: only on the web, and live only once there is somewhere
        // to go
        var get = document.getElementById("menuGet");
        if (get) get.hidden = inApp;
        all("[data-store]", function (el) {
            var url = links[el.getAttribute("data-store")];
            if (!url) return;
            el.href = url;
            el.removeAttribute("aria-disabled");
        });

        // the privacy page: next door on the web, out in the browser in the apps
        all("[data-link=privacy]", function (el) {
            if (inApp && links.privacy) el.href = links.privacy;
        });
        all("[data-link=source]", function (el) {
            if (links.source) el.href = links.source;
        });
    }

    function keys(event) {
        if (event.key === "Escape") Game.Menu.close();
    }

    Game.Menu = {
        init: function () {
            host = document.getElementById("menu");
            if (!host) return;

            fill();
            Game.Icons.hydrate(host);

            var button = document.getElementById("menuBtn");
            if (button) button.addEventListener("click", Game.Menu.open);

            host.addEventListener("click", function (event) {
                // the cross, or a tap on the dark around the card, closes it
                if (event.target.closest("#menuShut") || event.target === host) {
                    Game.Menu.close();
                }
            });

            var how = document.getElementById("howBtn");
            if (how) {
                how.addEventListener("click", function () {
                    Game.Menu.close();
                    Game.HowTo.open();
                });
            }
        },

        open: function () {
            if (!host || open) return;
            open = true;
            host.classList.add("is-open");
            host.setAttribute("aria-hidden", "false");
            document.addEventListener("keydown", keys);
            Game.Events.emit("menu:opened", {});
        },

        close: function () {
            if (!host || !open) return;
            open = false;
            host.classList.remove("is-open");
            host.setAttribute("aria-hidden", "true");
            document.removeEventListener("keydown", keys);
            Game.Events.emit("menu:closed", {});
        },

        isOpen: function () {
            return open;
        }
    };
})();
