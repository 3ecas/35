window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "thirtyfive.save",

        cols: 6,
        rows: 6,
        seedPieces: 1,   // a lone 1 to drop onto, so the first merge teaches itself
        handSize: 1,

        introPause: 500,

        // three that touch, on the four sides, become one of the next rung
        mergeAt: 3,

        // the same piece is dealt at most this many times in a row
        sameInRow: 2,

        // a run longer than three hands back all but two of itself, one rung up
        surplusStays: true,

        // the seam: after `after` drops, `count` pieces fall in every `every`
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

        // Takes one piece off every count in the table above, keeping its
        // shape. The extra play between falls is where the pressure the bomb
        // and infinity take off the board is paid back. Negative adds pieces.
        fallFewer: 1,

        // a fall never takes more than this share of the free squares, and
        // never less than fallLeast pieces
        fallRoom: 0.25,
        fallLeast: 1,

        // falling pieces go to the columns with the most room
        fallEven: true,

        // three 35s have nowhere to go: they cash in for cashBonus times
        // their worth and leave the board
        cashBonus: 2,

        // each link of a chain pays chainStep more, up to chainMost times
        chainStep: 1,
        chainMost: 5,

        shakeForce: 0.6,

        // a blast pays this share of what it destroys
        blastPays: 1,

        // turns a bomb sits before it goes off, if no merge lights it first
        bombFuse: 5,

        // how far the blast reaches from the bomb, corners included. At 1 it
        // takes the eight squares around it and nothing further out.
        blastReach: 1,

        // merges that fill the bomb dial — any merge, one for one
        bombPace: 24,

        // Infinity falls in with the seam, in place of a piece: past
        // infinityFrom points, each falling piece has this chance of being
        // one. It joins nothing; a merge beside it or a blast over it sets it
        // off, and then you name a number and every one of them goes.
        infinityFrom: 6250,
        infinityChance: 0.015,
        infinityCap: 1,
        infinitySpacing: 2
    }
};
