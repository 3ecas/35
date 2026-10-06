/* Fills the privacy page's words and digits with the game's own
   (js/ui/icons.js). Every word is also in the markup, for anyone listening
   rather than looking. */
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
})();
