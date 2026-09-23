window.Game = window.Game || {};

(function () {
    var ladder = [
        { id: "dirt", name: "Dirt", icon: "dirt", tint: "tint-dirt", points: 1 },
        { id: "stone", name: "Stone", icon: "rock", tint: "tint-rock", points: 2 },
        { id: "coal", name: "Coal", icon: "coal", tint: "tint-coal", points: 3 },
        { id: "iron", name: "Iron", icon: "iron", tint: "tint-iron", points: 4 },
        { id: "zinc", name: "Zinc", icon: "zinc", tint: "tint-zinc", points: 6 },
        { id: "copper", name: "Copper", icon: "copper", tint: "tint-copper", points: 8 },
        { id: "bronze", name: "Bronze", icon: "bronze", tint: "tint-bronze", points: 11 },
        { id: "tin", name: "Tin", icon: "tin", tint: "tint-tin", points: 15 },
        { id: "titanium", name: "Titanium", icon: "titanium", tint: "tint-titanium", points: 21 },
        { id: "silver", name: "Silver", icon: "silver_ore", tint: "tint-silver", points: 30 },
        { id: "gold", name: "Gold", icon: "ingot", tint: "tint-gold", points: 42 },
        { id: "platinum", name: "Platinum", icon: "platinum", tint: "tint-platinum", points: 59 },
        { id: "iridium", name: "Iridium", icon: "iridium", tint: "tint-iridium", points: 82 },
        { id: "rhodium", name: "Rhodium", icon: "rhodium", tint: "tint-rhodium", points: 115 },

        { id: "quartz", name: "Rose Quartz", icon: "quartz", tint: "tint-quartz", points: 160 },
        { id: "amethyst", name: "Amethyst", icon: "amethyst", tint: "tint-amethyst", points: 225 },
        { id: "citrine", name: "Citrine", icon: "citrine", tint: "tint-citrine", points: 315 },
        { id: "turquoise", name: "Turquoise", icon: "turquoise", tint: "tint-turquoise", points: 440 },
        { id: "garnet", name: "Garnet", icon: "garnet", tint: "tint-garnet", points: 615 },
        { id: "topaz", name: "Topaz", icon: "topaz", tint: "tint-topaz", points: 860 },
        { id: "peridot", name: "Peridot", icon: "peridot", tint: "tint-peridot", points: 1200 },
        { id: "lapis", name: "Lapis Lazuli", icon: "lapis", tint: "tint-lapis", points: 1700 },
        { id: "aquamarine", name: "Aquamarine", icon: "aquamarine", tint: "tint-aqua", points: 2350 },
        { id: "tourmaline", name: "Tourmaline", icon: "tourmaline", tint: "tint-tourmaline", points: 3300 },
        { id: "tanzanite", name: "Tanzanite", icon: "tanzanite", tint: "tint-tanzanite", points: 4600 },
        { id: "opal", name: "Black Opal", icon: "opal", tint: "tint-opal", points: 6450 },
        { id: "emerald", name: "Emerald", icon: "emerald", tint: "tint-emerald", points: 9000 },
        { id: "sapphire", name: "Sapphire", icon: "sapphire", tint: "tint-sapphire", points: 12600 },
        { id: "ruby", name: "Ruby", icon: "ruby", tint: "tint-ruby", points: 17600 },
        { id: "jadeite", name: "Jadeite", icon: "jadeite", tint: "tint-jadeite", points: 24700 },
        { id: "alexandrite", name: "Alexandrite", icon: "alexandrite", tint: "tint-alexandrite", points: 34500 },
        { id: "paraiba", name: "Paraiba", icon: "paraiba", tint: "tint-paraiba", points: 48300 },
        { id: "beryl", name: "Red Beryl", icon: "beryl", tint: "tint-beryl", points: 67600 },
        { id: "diamond", name: "Diamond", icon: "diamond", tint: "tint-diamond", points: 94600 },

        { id: "crown", name: "Crown", icon: "crown", tint: "tint-crown", points: 132000 }
    ];

    ladder.forEach(function (piece, index) {
        var above = ladder[index + 1];
        piece.tier = index + 1;
        piece.next = above ? above.id : null;
    });

    var rubble = {
        id: "rubble",
        name: "Rubble",
        icon: "rubble",
        tint: "tint-rock",
        tier: 0,
        next: null,
        points: 0
    };

    var dynamite = {
        id: "dynamite",
        name: "Dynamite",
        icon: "dynamite",
        tint: "tint-tnt",
        tier: 0,
        next: null,
        points: 0
    };

    var lodestone = {
        id: "lodestone",
        name: "Star",
        icon: "lodestone",
        tint: "tint-star",
        tier: 0,
        next: null,
        points: 0
    };

    var index = { rubble: rubble, dynamite: dynamite, lodestone: lodestone };
    ladder.forEach(function (piece) {
        index[piece.id] = piece;
    });

    var made = ladder.filter(function (piece) {
        return piece.tier > 1;
    });

    var WINDOW = 4;
    var CHANCE = [46, 34, 20, 10];

    function windowTop(highestTier) {
        var behind = Game.Config.game.dealBehind;
        var peak = ladder.length;
        var made = highestTier || 1;
        var reach = made >= peak ? peak : made - behind;

        // No floor of a full window: a run starts on dirt alone and every rung
        // it makes joins the deal, until there are four and the bottom one
        // drops off — zinc is what takes dirt out of the hand.
        return Math.max(1, Math.min(reach, peak - (made >= peak ? 0 : 2)));
    }

    Game.Pieces = {
        list: ladder,
        made: made,
        top: ladder[ladder.length - 1],
        rubble: rubble,
        dynamite: dynamite,
        lodestone: lodestone,

        byId: function (id) {
            return index[id] || null;
        },

        dealing: function (highestTier) {
            var top = windowTop(highestTier);
            return ladder.slice(Math.max(0, top - WINDOW), top);
        },

        randomFor: function (highestTier) {
            var options = this.dealing(highestTier);
            var total = options.reduce(function (sum, piece, i) {
                return sum + (CHANCE[i] || 10);
            }, 0);

            var roll = Math.random() * total;
            for (var i = 0; i < options.length; i++) {
                roll -= CHANCE[i] || 10;
                if (roll <= 0) return options[i];
            }
            return options[0];
        },

        under: function (id) {
            var piece = index[id];
            return piece ? ladder[piece.tier - 2] || null : null;
        }
    };
})();
