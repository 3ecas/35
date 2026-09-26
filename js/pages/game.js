window.Game = window.Game || {};

document.addEventListener("DOMContentLoaded", function () {
    Game.Backdrop.init();
    Game.Icons.hydrate(document);
    Game.Sound.start();
    Game.Shatter.init();

    Game.BoardView.init();
    Game.RoundView.init();
    Game.ScoreView.init();

    Game.Charges.init();
    Game.ChargeView.init();

    // No menu: the run left off last time, or a new one. The first time the
    // game is ever played it explains itself before anything drops: the new
    // run is set up behind how to play with its opening held, and the first
    // 1 falls in once that is closed, skipped or played through.
    Game.Events.on("howto:closed", function () {
        Game.Round.release();
    });

    if (Game.Round.resume()) {
        if (!Game.HowTo.seen()) Game.HowTo.open();
    } else if (Game.HowTo.seen()) {
        Game.Round.start();
    } else {
        Game.Round.start({ hold: true });
        Game.HowTo.open();
    }
});
