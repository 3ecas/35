window.Game = window.Game || {};

document.addEventListener("DOMContentLoaded", function () {
    function boot() {
        Game.Backdrop.init();
        Game.Vibe.init();
        Game.Icons.hydrate(document);
        Game.Sound.start();

        Game.BoardView.init();
        Game.RoundView.init();
        Game.ScoreView.init();

        Game.Charges.init();
        Game.ChargeView.init();

        Game.RoundView.menu();
    }

    // Pieces are read out of ICONS/ first when liveArt is on, so the very first
    // frame already has them and nothing has to be repainted. It never blocks
    // the game: anything missing, slow or unreadable falls back to the art
    // baked into icons.js.
    var art = Game.LiveArt ? Game.LiveArt.load() : null;
    if (!art || typeof art.then !== "function") return boot();

    var started = false;
    var go = function () { if (!started) { started = true; boot(); } };

    art.then(go, go);
    window.setTimeout(go, Game.Config.game.liveArtWait || 1500);
});
