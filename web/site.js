/* Fills the page's words and digits with the game's own (js/ui/icons.js),
   draws the bomb and infinity, and lays out the ladder of colours. Nothing
   here is needed to read the page: every word is also in the markup for
   anyone listening rather than looking. */
(function () {
    function all(selector, fn) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
    }

    all("[data-words]", function (el) {
        el.innerHTML = Game.Icons.words(el.getAttribute("data-words"));
    });

    all("[data-number]", function (el) {
        el.innerHTML = Game.Icons.number(el.getAttribute("data-number"));
    });

    Game.Icons.hydrate(document);

    all(".how__pieces--ladder", function (el) {
        var html = "";
        for (var n = 1; n <= 35; n += 1) {
            html += '<i class="piece num num-' + n + '"></i>';
        }
        el.innerHTML = html;
    });

    // The store links: set STORES when the apps are published, and the
    // buttons come alive.
    var STORES = {
        ios: "",        // e.g. https://apps.apple.com/app/id0000000000
        android: ""     // e.g. https://play.google.com/store/apps/details?id=com.bernardogramaxo.thirtyfive
    };

    all("[data-store]", function (el) {
        var url = STORES[el.getAttribute("data-store")];
        if (!url) return;
        el.href = url;
        el.removeAttribute("aria-disabled");
    });
})();
