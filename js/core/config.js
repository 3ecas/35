window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 6,
        seedPieces: 6,
        handSize: 1,

        introPause: 500,

        // was 3. Two-of-a-kind makes each rung cost 2x the one below instead
        // of 3x, which is what puts the top of the ladder in reach at all.
        mergeAt: 3,

        // count the corners as touching too, not just the four sides
        mergeDiagonals: false,

        dealBehind: 0,   // was 1 — your best piece is dealt as soon as you make it

        growStranded: false,

        sameInRow: 2,

        surplusStays: true,

        surplusMost: 0,

        falls: [
            { after: 0, count: 2, every: 5 },
            { after: 110, count: 3, every: 5 },
            { after: 150, count: 3, every: 4 },
            { after: 200, count: 2, every: 2 },
            { after: 250, count: 4, every: 3 },
            { after: 310, count: 3, every: 2 },
            { after: 370, count: 2, every: 1 },
            { after: 430, count: 3, every: 1 }
        ],

        // Two knobs over the table above, both keeping its shape: fallFewer
        // takes pieces off every count, fallSlower puts plays between falls.
        // Negative numbers push the other way — fallFewer: -1 adds a piece to
        // every fall. One less piece per fall, at the table's own spacing: the
        // extra play between falls is gone, which is where the pressure the
        // star and the bomb take off the board is paid back.
        fallFewer: 1,
        fallSlower: 0,

        fallRoom: 0.25,
        fallLeast: 1,

        fallEven: true,

        liveArt: true,      // PNGs in ICONS/ replace the built-in piece art
        liveArtWait: 1500,

        clearColumns: false,
        clearRows: false,
        clearBonus: 3,

        cashBonus: 2,
        cashLeaves: true,

        chainStep: 1,
        chainMost: 5,

        shakeForce: 0.6,

        blastPays: 1,

        // turns a stick sits before it goes off, if nothing lights it first
        dynamiteFuse: 5,

        // how far the blast reaches from the stick, corners included. At 1 it
        // takes the eight squares around it and nothing further out.
        blastReach: 1,

        blastSpacing: 2,

        // Dynamite is never dealt or dropped any more — the only sticks on the
        // board are the ones the player placed off the bomb dial. These are
        // kept at zero rather than deleted so the sky can be given it back.
        dynamiteFrom: 1250,
        dynamiteChance: 0,
        dynamiteCap: 1,

        // The star is no longer dealt into the grid — it is charged on the
        // meter under the board and spent from there. js/systems/starmeter.js
        lodestoneFrom: 6250,
        lodestoneChance: 0,
        lodestoneCap: 1,

        // Chain multiplier, over and above 1, that fills the star. A plain
        // merge scores nothing here; a three-deep cascade pays 1 + 2. Counted
        // rather than scored, so it costs the same at dirt as at diamond.
        starPace: 24,

        // merges that fill the bomb — any merge, one for one
        bombPace: 24,


        rubbleFrom: 8,
        rubbleRise: 0.05,
        rubbleMost: 0.45,
        rubbleCap: 1,
        rubbleBreaks: true
    }
};
