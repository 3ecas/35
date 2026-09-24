window.Game = window.Game || {};

/* =============================================================================
   SHATTER
   -----------------------------------------------------------------------------
   A piece that goes — merged away, blown up, swept off by infinity — breaks
   into squares of itself, number and all, and the squares fly out to every
   edge of the screen through a haze of fine square dust, spinning, falling,
   fading.

   One canvas over the whole screen. It draws only while something is in the
   air and stops the moment the last piece is gone, so a still board costs
   nothing. The pieces are cut from a picture of the tile as it stood, painted
   by the same code that draws the art (Game.Icons.paint), so they are always
   the tile's own colour and the number's own strokes.
   ============================================================================= */

(function () {
    var GRID = 4;             // a tile breaks into GRID × GRID squares,
    var SPLIT = [0.5, 0.35];  // of which this share stay whole, this share
                              // break again in two each way, the rest in three
    var DUST = 16;            // and throws this much dust
    var GRAVITY = 1100;       // px/s², so the pieces arc rather than drift
    var DRAG = 0.5;           // share of speed kept after one second in the air

    var canvas = null;
    var ctx = null;
    var dpr = 1;
    var wide = 0;
    var tall = 0;

    var bits = [];
    var motes = [];
    var pictures = {};
    var running = false;
    var last = 0;
    var still = false;

    function ensure() {
        if (canvas) return !!ctx;

        canvas = document.createElement("canvas");
        canvas.className = "shatter";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");

        fit();
        window.addEventListener("resize", fit);
        return !!ctx;
    }

    function fit() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        wide = window.innerWidth;
        tall = window.innerHeight;
        canvas.width = Math.round(wide * dpr);
        canvas.height = Math.round(tall * dpr);
        pictures = {};
    }

    /* ---- what the tile looked like -------------------------------------- */

    function stops(conic) {
        var found = [];
        var stop = /(#[0-9a-f]{6})\s+([\d.]+)deg/gi;
        var hit;
        while ((hit = stop.exec(conic))) found.push({ at: +hit[2], hex: hit[1] });
        return found;
    }

    function mix(a, b, t) {
        var x = parseInt(a.slice(1), 16);
        var y = parseInt(b.slice(1), 16);
        var r = Math.round(((x >> 16) & 255) + ((((y >> 16) & 255) - ((x >> 16) & 255)) * t));
        var g = Math.round(((x >> 8) & 255) + ((((y >> 8) & 255) - ((x >> 8) & 255)) * t));
        var bl = Math.round((x & 255) + (((y & 255) - (x & 255)) * t));
        return "rgb(" + r + "," + g + "," + bl + ")";
    }

    // 35's rainbow, as thin wedges round the clock from twelve
    function wheel(g, list) {
        for (var d = 0; d < 360; d += 4) {
            var i = 0;
            while (i < list.length - 2 && d >= list[i + 1].at) i++;
            var t = (d + 2 - list[i].at) / (list[i + 1].at - list[i].at);
            var from = (d - 90) * Math.PI / 180;
            var to = (d + 4.5 - 90) * Math.PI / 180;
            g.beginPath();
            g.moveTo(12, 12);
            g.arc(12, 12, 18, from, to);
            g.closePath();
            g.fillStyle = mix(list[i].hex, list[i + 1].hex, Math.min(1, Math.max(0, t)));
            g.fill();
        }
    }

    /* the colour or colours the tile stood in, and a few to throw as dust */
    function ground(tile) {
        var style = getComputedStyle(tile);
        var paper = style.getPropertyValue("--num").trim();
        if (/^conic-gradient/.test(paper)) return { rainbow: stops(paper) };
        if (paper) return { flat: paper };
        return { flat: style.backgroundColor };
    }

    function picture(piece, look, px) {
        var key = piece.id + "@" + px;
        if (pictures[key]) return pictures[key];

        var art = document.createElement("canvas");
        art.width = art.height = px;
        var g = art.getContext("2d");
        g.scale(px / 24, px / 24);

        if (look.rainbow) {
            wheel(g, look.rainbow);
        } else {
            g.fillStyle = look.flat;
            g.fillRect(0, 0, 24, 24);
        }
        Game.Icons.paint(g, piece.icon);

        pictures[key] = art;
        return art;
    }

    function dustColours(look) {
        if (look.rainbow) {
            return look.rainbow.map(function (stop) { return stop.hex; });
        }
        return [look.flat, look.flat, "#ffffff"];
    }

    /* ---- the pieces ------------------------------------------------------- */

    // grid lines, nudged so the squares are not all the same size
    function cuts() {
        var lines = [0];
        for (var i = 1; i < GRID; i++) {
            lines.push((i + (Math.random() - 0.5) * 0.5) / GRID);
        }
        lines.push(1);
        return lines;
    }

    function spread(force) {
        return (560 + Math.random() * 1150) * force;
    }

    function tileBreaks(tile, piece, force) {
        var box = tile.getBoundingClientRect();
        if (!box.width) return;

        var side = box.width;
        var px = Math.max(8, Math.round(side * dpr));
        var look = ground(tile);
        var art = picture(piece, look, px);
        var cx = box.left + side / 2;
        var cy = box.top + box.height / 2;

        var across = cuts();
        var down = cuts();

        for (var r = 0; r < GRID; r++) {
            for (var c = 0; c < GRID; c++) {
                // The full square is the largest a piece gets. Some break
                // again, into halves or thirds of themselves, so the air fills
                // with every size smaller than that and none larger.
                var roll = Math.random();
                var parts = roll < SPLIT[0] ? 1 : roll < SPLIT[0] + SPLIT[1] ? 2 : 3;
                var du = (across[c + 1] - across[c]) / parts;
                var dv = (down[r + 1] - down[r]) / parts;

                for (var pr = 0; pr < parts; pr++) {
                    for (var pc = 0; pc < parts; pc++) {
                        var u0 = across[c] + du * pc;
                        var v0 = down[r] + dv * pr;
                        var x = box.left + side * (u0 + du / 2);
                        var y = box.top + side * (v0 + dv / 2);

                        // outward from the middle of the tile, then scattered,
                        // so the squares leave in every direction rather than
                        // in a cross; the small ones fly a little harder
                        var aim = Math.atan2(y - cy, x - cx) + (Math.random() - 0.5) * 1.6;
                        var speed = spread(force) * (1 + (parts - 1) * 0.12);

                        bits.push({
                            art: art,
                            sx: u0 * px, sy: v0 * px,
                            sw: du * px, sh: dv * px,
                            w: du * side, h: dv * side,
                            x: x, y: y,
                            vx: Math.cos(aim) * speed,
                            vy: Math.sin(aim) * speed - 260 * force,
                            turn: 0,
                            spin: (Math.random() - 0.5) * 16 * (1 + (parts - 1) * 0.35),
                            age: 0,
                            life: 1 + Math.random() * 0.6
                        });
                    }
                }
            }
        }

        var colours = dustColours(look);
        for (var i = 0; i < DUST * force; i++) {
            var angle = Math.random() * Math.PI * 2;
            var fast = (260 + Math.random() * 1000) * force;
            motes.push({
                x: cx + (Math.random() - 0.5) * side * 0.6,
                y: cy + (Math.random() - 0.5) * side * 0.6,
                vx: Math.cos(angle) * fast,
                vy: Math.sin(angle) * fast - 120,
                r: 0.7 + Math.random() * 3.5,
                colour: colours[Math.floor(Math.random() * colours.length)],
                age: 0,
                life: 0.45 + Math.random() * 0.55
            });
        }
    }

    /* ---- the air ---------------------------------------------------------- */

    function frame(now) {
        var gap = Math.min(0.034, (now - last) / 1000 || 0.016);
        last = now;
        var keep = Math.pow(DRAG, gap);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = bits.length - 1; i >= 0; i--) {
            var b = bits[i];
            b.age += gap;
            b.vx *= keep;
            b.vy = b.vy * keep + GRAVITY * gap;
            b.x += b.vx * gap;
            b.y += b.vy * gap;
            b.turn += b.spin * gap;

            var t = b.age / b.life;
            var gone = b.y - b.h > tall || b.x + b.w < 0 || b.x - b.w > wide;
            if (t >= 1 || gone) {
                bits.splice(i, 1);
                continue;
            }

            var shrink = 1 - t * 0.4;
            var cos = Math.cos(b.turn) * dpr;
            var sin = Math.sin(b.turn) * dpr;
            ctx.globalAlpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
            ctx.setTransform(cos, sin, -sin, cos, b.x * dpr, b.y * dpr);
            ctx.drawImage(b.art, b.sx, b.sy, b.sw, b.sh,
                          -b.w * shrink / 2, -b.h * shrink / 2,
                          b.w * shrink, b.h * shrink);
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var slow = Math.pow(0.18, gap);
        for (var k = motes.length - 1; k >= 0; k--) {
            var m = motes[k];
            m.age += gap;
            if (m.age >= m.life) {
                motes.splice(k, 1);
                continue;
            }
            m.vx *= slow;
            m.vy = m.vy * slow + GRAVITY * 0.35 * gap;
            m.x += m.vx * gap;
            m.y += m.vy * gap;

            var fade = 1 - m.age / m.life;
            var side = m.r * (1 + fade);
            ctx.globalAlpha = fade;
            ctx.fillStyle = m.colour;
            ctx.fillRect(m.x - side / 2, m.y - side / 2, side, side);
        }

        ctx.globalAlpha = 1;

        if (bits.length || motes.length) {
            window.requestAnimationFrame(frame);
        } else {
            running = false;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function lift() {
        if (running) return;
        running = true;
        last = window.performance ? window.performance.now() : Date.now();
        window.requestAnimationFrame(frame);
    }

    Game.Shatter = {
        init: function () {
            still = !!(window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        },

        /* `tile` is the square on the board, `pieceId` what stood on it, and
           `force` how hard it goes: 1 for a merge, more for a blast */
        tile: function (tile, pieceId, force) {
            var piece = Game.Pieces.byId(pieceId);
            if (still || !tile || !piece || !ensure()) return;
            tileBreaks(tile, piece, force || 1);
            lift();
        }
    };
})();
