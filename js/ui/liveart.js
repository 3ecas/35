window.Game = window.Game || {};

/* Piece art from ICONS/.

   A PNG named after a piece — Dirt.png, Rose Quartz.png, Star.png — replaces
   that piece everywhere. A piece with no PNG keeps the art built into
   icons.js, so the set can arrive one file at a time.

   A dev server that lists folders is read directly, so any spelling reaches
   the right piece (dirt.png, 01_DIRT.png, Stone.png or Rock.png). A published
   build cannot list a folder, so there each piece is looked for by its exact
   in-game name. Art 64px or smaller keeps hard pixel edges. */

(function () {
    var FOLDER = "ICONS/";
    var BOX = 24;
    var FIT = 0.9;
    var PIXEL_ART = 64;

    // the iOS build stamps this script's URL; the art carries the same stamp so
    // a redrawn PNG is not served from the webview's cache of the last build
    var STAMP = (function () {
        var src = document.currentScript ? document.currentScript.src : "";
        var hit = src.match(/[?&]v=([^&#]+)/);
        return hit ? "?v=" + hit[1] : "";
    })();

    function plain(text) {
        return String(text)
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase()
            .replace(/\.png$/, "")
            .replace(/^\d+[_-]/, "")
            .replace(/[^a-z0-9]/g, "");
    }

    function pieces() {
        var all = Game.Pieces.list.slice();
        [Game.Pieces.rubble, Game.Pieces.dynamite, Game.Pieces.lodestone].forEach(function (piece) {
            if (piece) all.push(piece);
        });
        return all;
    }

    function spellings() {
        var keys = Game.Icons.keys();
        var map = {};
        keys.forEach(function (key) {
            map[plain(key)] = key;
        });
        pieces().forEach(function (piece) {
            if (keys.indexOf(piece.icon) === -1) return;
            map[plain(piece.id)] = piece.icon;
            map[plain(piece.name)] = piece.icon;
        });
        return map;
    }

    function exactName(key) {
        var owner = pieces().filter(function (piece) {
            return piece.icon === key;
        })[0];
        return (owner ? owner.name : key.charAt(0).toUpperCase() + key.slice(1)) + ".png";
    }

    function everyExactName() {
        return Game.Icons.keys().map(function (key) {
            return { key: key, file: exactName(key) };
        });
    }

    function decode(text) {
        try {
            return decodeURIComponent(text);
        } catch (e) {
            return text;
        }
    }

    function fromListing(html) {
        var map = spellings();
        var found = [];
        var taken = {};
        var link = /href="([^"]+\.png)"/gi;
        var hit;

        while ((hit = link.exec(html))) {
            var file = decode(hit[1].split("/").pop());
            var key = map[plain(file)];

            if (!key) {
                if (window.console) console.warn("art: " + FOLDER + file + " is not named after a piece");
            } else if (!taken[key]) {
                taken[key] = true;
                found.push({ key: key, file: file });
            }
        }
        return found;
    }

    function discover() {
        if (location.protocol === "file:" || typeof fetch !== "function") {
            return Promise.resolve(everyExactName());
        }

        return fetch(FOLDER, { cache: "no-store" })
            .then(function (response) {
                return response.ok ? response.text() : "";
            })
            .catch(function () {
                return "";
            })
            .then(function (html) {
                var listed = /Directory listing for|Index of/i.test(html);
                return listed ? fromListing(html) : everyExactName();
            });
    }

    function open(item) {
        var url = FOLDER + encodeURIComponent(item.file) + STAMP;

        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
                resolve(img.naturalWidth && img.naturalHeight
                    ? { key: item.key, url: url, w: img.naturalWidth, h: img.naturalHeight }
                    : null);
            };
            img.onerror = function () {
                resolve(null);
            };
            img.src = url;
        });
    }

    function round(n) {
        return Math.round(n * 1e4) / 1e4;
    }

    function markup(art) {
        var side = Math.max(art.w, art.h);
        var scale = (BOX * FIT) / side;
        var w = art.w * scale;
        var h = art.h * scale;
        var crisp = side <= PIXEL_ART
            ? ' style="image-rendering:crisp-edges;image-rendering:pixelated"'
            : "";

        return '<image href="' + art.url + '" x="' + round((BOX - w) / 2) +
            '" y="' + round((BOX - h) / 2) + '" width="' + round(w) +
            '" height="' + round(h) + '"' + crisp + "/>";
    }

    Game.LiveArt = {
        load: function () {
            if (!Game.Config.game.liveArt || typeof Image !== "function") {
                return Promise.resolve(0);
            }

            return discover()
                .then(function (items) {
                    return Promise.all(items.map(open));
                })
                .then(function (arts) {
                    var swapped = 0;
                    arts.forEach(function (art) {
                        if (art && Game.Icons.replace(art.key, markup(art))) swapped++;
                    });
                    return swapped;
                });
        }
    };
})();
