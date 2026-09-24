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

    // no menu: the run left off last time, or a new one
    if (!Game.Round.resume()) Game.Round.start();

    Game.HowTo.firstTime();
});
