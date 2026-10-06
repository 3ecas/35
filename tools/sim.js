/* =============================================================================
   35 — a bot that plays the game, many runs over, to measure the climb
   -----------------------------------------------------------------------------
   Loads the game's own rules — the ladder, the board, the round, the bomb
   dial — into a sandbox with no screen, and plays run after run with a
   simple, steady strategy: drop where three would meet; failing that, next
   to the same number, low down; name the most numerous number when infinity
   asks; spend the bomb on the most crowded spot once the board is half full.
   It is no better than a decent player and no worse, and it plays the same
   way under every setting, which is what makes the settings comparable.

   Each setting is a change to the live config, applied to a fresh copy of
   the game. For every setting it reports how many runs reached 35, where
   the others died, and how long runs lasted.

     node tools/sim.js                 200 runs of every setting
     node tools/sim.js 500             500 runs of every setting
     node tools/sim.js 300 base,seam23 only those settings
   ============================================================================= */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const RUNS = Number(process.argv[2]) || 200;
const ONLY = process.argv[3] ? process.argv[3].split(",") : null;

const PEAK = 35;
const MOST_DROPS = 6000;         // a run that long is called a reach
const CROWDED = 14;              // free squares at or under this: spend the bomb

/* ---- the settings to try ----------------------------------------------- */
const SETTINGS = {
    base: {
        note: "as the game is: the seam holds at 25, and 34 is dealt once made",
        apply: function () {}
    },
    before: {
        note: "as it was: the seam stepped up to 3 every 2 at 30, and 34 was never dealt",
        apply: function (Game) {
            Game.Config.game.falls.push({ from: 30, count: 3, every: 2 });
            dealTo(Game, PEAK - 2);
        }
    },
    seam30: {
        note: "a last seam step at 30 again, but 2 every 2",
        apply: function (Game) { Game.Config.game.falls.push({ from: 30, count: 2, every: 2 }); }
    },
    room16: {
        note: "a fall takes at most a sixth of the free squares, not a quarter",
        apply: function (Game) { Game.Config.game.fallRoom = 1 / 6; }
    },
    help: {
        note: "the bomb fills in 15 merges and infinity comes every 50 drops",
        apply: function (Game) { Game.Config.game.bombPace = 15; Game.Config.game.infinityEvery = 50; }
    }
};

/* the deal's window reaches up to `upTo` until the peak is made */
function dealTo(Game, upTo) {
    var ladder = Game.Pieces.list;
    var WINDOW = 3;
    Game.Pieces.dealing = function (highestTier) {
        var made = highestTier || 1;
        var top = made >= PEAK ? PEAK : Math.max(1, Math.min(made, upTo));
        return ladder.slice(Math.max(0, top - WINDOW), top);
    };
}

/* ---- the game, with no screen ---------------------------------------------- */
function boot(apply) {
    const store = {};
    const win = {
        localStorage: {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: k => { delete store[k]; }
        },
        setTimeout: fn => { fn(); return 0; },
        clearTimeout: () => {},
        addEventListener: () => {},
        matchMedia: () => ({ matches: false })
    };
    win.window = win;
    win.Game = {};
    const ctx = vm.createContext(Object.assign(win, { document: { addEventListener: () => {} }, console }));
    ["core/config", "core/events", "core/storage", "data/pieces",
     "systems/board", "systems/round", "systems/charges"].forEach(f => {
        vm.runInContext(fs.readFileSync(path.join(root, "js", f + ".js"), "utf8"), ctx, { filename: f });
    });
    const Game = ctx.Game;
    Game.Charges.init();
    apply(Game);
    return Game;
}

/* ---- the bot ---------------------------------------------------------------- */
function around(Game, cell, far) {
    const near = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            if (!far && dx && dy) continue;          // the four sides only
            const other = Game.Board.at ? Game.Board.at(cell.x + dx, cell.y + dy) : null;
            if (other) near.push(other);
        }
    }
    return near;
}

// the board does not expose at(x, y): find cells by coordinates once
function index(Game) {
    const byXY = {};
    Game.Board.cells().forEach(c => { byXY[c.x + "," + c.y] = c; });
    Game.Board.at = (x, y) => byXY[x + "," + y] || null;
}

function tierOf(Game, id) {
    const p = id && Game.Pieces.byId(id);
    return p ? p.tier : 0;
}

function bestColumn(Game, pieceId) {
    const cols = Game.Board.size().cols;
    const rows = Game.Board.size().rows;
    let best = -1;
    let bestScore = -Infinity;
    for (let x = 0; x < cols; x++) {
        const spot = Game.Board.landing(x);
        if (!spot) continue;
        let score = 0;
        if (Game.Board.wouldJoin(x, pieceId)) score += 100;
        around(Game, spot, false).forEach(n => {
            if (n.piece === pieceId) score += 12;
            else if (n.piece && n.piece === Game.Pieces.bomb.id) score += 2;
        });
        score += spot.y;                                // the lower the landing, the emptier the column
        if (spot.y === 0) score -= 30;                  // never top a column off if it can be helped
        score += Math.random();                         // a tie-breaker
        if (score > bestScore) { bestScore = score; best = x; }
    }
    return best;
}

function nameToSweep(Game) {
    const count = {};
    Game.Board.snapshot().forEach(id => {
        if (!id) return;
        const t = tierOf(Game, id);
        if (!t) return;                                 // not the bomb, not infinity
        count[id] = (count[id] || 0) + 1;
    });
    const highest = Game.Round.get().highest;
    const ids = Object.keys(count).sort((a, b) => {
        // the most pieces, keeping the top two rungs if anything else is there
        const pa = tierOf(Game, a) >= highest - 1 ? -1 : 1;
        const pb = tierOf(Game, b) >= highest - 1 ? -1 : 1;
        if (pa !== pb) return pb - pa;
        if (count[b] !== count[a]) return count[b] - count[a];
        return tierOf(Game, a) - tierOf(Game, b);
    });
    return ids[0] || null;
}

function bombSpot(Game) {
    const cols = Game.Board.size().cols;
    let best = null;
    let bestScore = -1;
    for (let x = 0; x < cols; x++) {
        const spot = Game.Board.landing(x);
        if (!spot) continue;
        let score = 0;
        around(Game, spot, true).forEach(n => {
            if (!n.piece) return;
            const t = tierOf(Game, n.piece);
            score += t ? 1 + (PEAK - t) / PEAK : 0.5;   // clutter is worth more than progress
        });
        if (score > bestScore) { bestScore = score; best = spot; }
    }
    return best;
}

function playRun(Game) {
    let over = false;
    const off = Game.Events.on("game:over", () => { over = true; });
    Game.Round.start();
    index(Game);

    let drops = 0;
    let stuck = 0;
    while (!over && drops < MOST_DROPS) {
        const state = Game.Round.get();
        if (!state || !state.running) break;
        if (state.highest >= PEAK) break;

        if (Game.Board.owes() > 0) {
            const name = nameToSweep(Game);
            if (!name || !Game.Round.choose(name)) { stuck++; if (stuck > 5) break; }
            continue;
        }

        if (Game.Charges.bomb.ready() && Game.Board.empties().length <= CROWDED) {
            const spot = bombSpot(Game);
            if (spot && Game.Charges.toggle("bomb")) {
                if (!Game.Charges.aim(spot)) Game.Charges.disarm();
                continue;
            }
        }

        const piece = state.hand[0];
        if (!piece) break;
        const col = bestColumn(Game, piece.id);
        if (col < 0 || !Game.Round.play(col)) { stuck++; if (stuck > 5) break; continue; }
        stuck = 0;
        drops++;
    }

    const state = Game.Round.get();
    if (off && typeof off === "function") off();
    return { highest: state.highest, drops: drops, score: state.score, reached: state.highest >= PEAK };
}

/* ---- the report ------------------------------------------------------------- */
function quantile(sorted, q) {
    return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

function pad(s, n, left) {
    s = String(s);
    return left ? s.padStart(n) : s.padEnd(n);
}

const names = Object.keys(SETTINGS).filter(n => !ONLY || ONLY.indexOf(n) !== -1);
console.log(RUNS + " runs a setting\n");
console.log(pad("setting", 15) + pad("reach 35", 10, true) + pad("median top", 12, true) + pad("p90 top", 9, true) + pad("best", 6, true) + pad("median drops", 14, true) + "  died at (top rung: runs)");

names.forEach(name => {
    const setting = SETTINGS[name];
    const results = [];
    const t0 = Date.now();
    for (let i = 0; i < RUNS; i++) {
        const Game = boot(setting.apply);
        results.push(playRun(Game));
    }
    const tops = results.map(r => r.highest).sort((a, b) => a - b);
    const drops = results.map(r => r.drops).sort((a, b) => a - b);
    const reached = results.filter(r => r.reached).length;
    const died = {};
    results.forEach(r => { if (!r.reached) died[r.highest] = (died[r.highest] || 0) + 1; });
    const where = Object.keys(died).sort((a, b) => a - b).map(k => k + ":" + died[k]).join(" ");
    console.log(pad(name, 15) + pad((100 * reached / RUNS).toFixed(0) + "%", 10, true) + pad(quantile(tops, 0.5), 12, true) +
        pad(quantile(tops, 0.9), 9, true) + pad(tops[tops.length - 1], 6, true) + pad(quantile(drops, 0.5), 14, true) + "  " + where +
        "   (" + ((Date.now() - t0) / 1000).toFixed(0) + "s)");
});

console.log("\n" + names.map(n => pad(n, 15) + SETTINGS[n].note).join("\n"));
