/* =============================================================================
   35 — Android launcher icons and Google Play listing art
   -----------------------------------------------------------------------------
   The same drawing as the iOS icon (tools/icon.swift): 35 in the game's own
   block digits, white, on the rainbow that only 35 wears — the same stops as
   .num-35 in css/numbers.css, round the clock from twelve. Written in plain
   Node with nothing to install: the pixels are drawn here and the PNGs are
   written by hand.

   It writes, under android/app/src/main/res/:
     mipmap-*dpi/ic_launcher.png             the icon, square (48 to 192 px)
     mipmap-*dpi/ic_launcher_round.png       the same, round
     mipmap-*dpi/ic_launcher_foreground.png  adaptive icon: the 35 alone, on
                                             nothing (108 to 432 px)
     mipmap-*dpi/ic_launcher_background.png  adaptive icon: the rainbow
   and, under store/play/:
     icon-512.png                            the Play listing icon
     feature-1024x500.png                    the Play feature graphic

     node tools/icon-android.js     (npm run icons:android, from the root)
   ============================================================================= */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.join(__dirname, "..");
const res = path.join(root, "android", "app", "src", "main", "res");
const store = path.join(root, "store", "play");

/* ---- the rainbow: a conic gradient from twelve o'clock, clockwise --------- */
const STOPS = [
    [0, "#df676b"], [30, "#d97230"], [60, "#bd8700"], [90, "#989900"],
    [120, "#5ba84a"], [150, "#00ab86"], [180, "#00a6ad"], [210, "#00a0d3"],
    [240, "#5991ed"], [270, "#927fe7"], [300, "#ba71cb"], [330, "#d4679f"],
    [360, "#df676b"]
].map(([at, hex]) => [at, rgb(hex)]);

function rgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// the colour of the wheel at (x, y) about the centre (cx, cy)
function wheelAt(x, y, cx, cy) {
    let angle = Math.atan2(x + 0.5 - cx, -(y + 0.5 - cy)) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    let i = 0;
    while (i < STOPS.length - 2 && angle > STOPS[i + 1][0]) i++;
    const [a0, p] = STOPS[i];
    const [a1, q] = STOPS[i + 1];
    const t = (angle - a0) / (a1 - a0);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
}

/* ---- the number: straight bars in a 5 × 7 box, as in js/ui/icons.js ------- */
const W = 5, H = 7, T = 1.5;
const MID = (H - T) / 2, REACH = (H + T) / 2;
const BARS = {
    a: [0, 0, W, T], b: [W - T, 0, T, REACH], c: [W - T, MID, T, REACH],
    d: [0, H - T, W, T], e: [0, MID, T, REACH], f: [0, 0, T, REACH], g: [0, MID, W, T]
};
const DIGITS = {
    0: "abcdef", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd",
    6: "afgecd", 7: "abc", 8: "abcdefg", 9: "abcdfg"
};
const ONE = { w: 4, bars: [[4 - T, 0, T, H], [4 - T - 1.3, 0, 1.3, T]] };

// the bars of a number in digit units, and the span they cover
function bars(text) {
    const placed = [];
    let x = 0;
    [...String(text)].forEach((ch, i) => {
        if (i) x += 1;
        const own = ch === "1" ? ONE : { w: W, bars: [...DIGITS[ch]].map(k => BARS[k]) };
        own.bars.forEach(r => placed.push([x + r[0], r[1], r[2], r[3]]));
        x += own.w;
    });
    const left = Math.min(...placed.map(r => r[0]));
    const right = Math.max(...placed.map(r => r[0] + r[2]));
    return { bars: placed, left, right };
}

/* ---- a picture: floats, four a pixel ---------------------------------------- */
function picture(width, height) {
    return { width, height, px: new Float32Array(width * height * 4) };
}

function fillWheel(pic, cx, cy) {
    for (let y = 0; y < pic.height; y++) {
        for (let x = 0; x < pic.width; x++) {
            const c = wheelAt(x, y, cx, cy);
            const o = (y * pic.width + x) * 4;
            pic.px[o] = c[0]; pic.px[o + 1] = c[1]; pic.px[o + 2] = c[2]; pic.px[o + 3] = 255;
        }
    }
}

// a white rectangle, soft-edged: each pixel takes the share of it the
// rectangle covers
function fillRect(pic, rx, ry, rw, rh) {
    const x0 = Math.max(0, Math.floor(rx)), x1 = Math.min(pic.width, Math.ceil(rx + rw));
    const y0 = Math.max(0, Math.floor(ry)), y1 = Math.min(pic.height, Math.ceil(ry + rh));
    for (let y = y0; y < y1; y++) {
        const cy = Math.max(0, Math.min(y + 1, ry + rh) - Math.max(y, ry));
        for (let x = x0; x < x1; x++) {
            const cx = Math.max(0, Math.min(x + 1, rx + rw) - Math.max(x, rx));
            const a = cx * cy;
            if (a <= 0) continue;
            const o = (y * pic.width + x) * 4;
            const was = pic.px[o + 3] / 255;
            const now = a + was * (1 - a);
            for (let k = 0; k < 3; k++) {
                pic.px[o + k] = now ? (255 * a + pic.px[o + k] * was * (1 - a)) / now : 0;
            }
            pic.px[o + 3] = now * 255;
        }
    }
}

// the number, `tall` pixels high, centred on (cx, cy)
function number(pic, text, tall, cx, cy) {
    const set = bars(text);
    const k = tall / H;
    const dx = cx - (set.left + set.right) * k / 2;
    const dy = cy - H * k / 2;
    set.bars.forEach(r => fillRect(pic, dx + r[0] * k, dy + r[1] * k, r[2] * k, r[3] * k));
}

// keep only the circle inscribed in a square picture, soft-edged
function round(pic) {
    const R = pic.width / 2;
    for (let y = 0; y < pic.height; y++) {
        for (let x = 0; x < pic.width; x++) {
            const d = Math.hypot(x + 0.5 - R, y + 0.5 - R);
            const keep = Math.max(0, Math.min(1, R - d + 0.5));
            pic.px[(y * pic.width + x) * 4 + 3] *= keep;
        }
    }
}

/* ---- PNG, by hand ----------------------------------------------------------- */
const CRC = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
});

function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

function png(pic) {
    const head = Buffer.alloc(13);
    head.writeUInt32BE(pic.width, 0);
    head.writeUInt32BE(pic.height, 4);
    head[8] = 8;            // bits a channel
    head[9] = 6;            // colour type: RGBA
    head[10] = 0; head[11] = 0; head[12] = 0;

    const rows = Buffer.alloc((pic.width * 4 + 1) * pic.height);
    for (let y = 0; y < pic.height; y++) {
        const at = y * (pic.width * 4 + 1);
        rows[at] = 0;       // no filter
        for (let i = 0; i < pic.width * 4; i++) {
            rows[at + 1 + i] = Math.max(0, Math.min(255, Math.round(pic.px[y * pic.width * 4 + i])));
        }
    }

    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", head),
        chunk("IDAT", zlib.deflateSync(rows, { level: 9 })),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

function save(pic, file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, png(pic));
    console.log("wrote " + pic.width + "×" + pic.height + "  " + path.relative(root, file));
}

/* ---- the pictures ------------------------------------------------------------ */

// the icon as drawn everywhere: the 35 two fifths of the height
const TALL = 0.4;

function icon(size) {
    const pic = picture(size, size);
    fillWheel(pic, size / 2, size / 2);
    number(pic, "35", size * TALL, size / 2, size / 2);
    return pic;
}

const DENSITY = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

if (!fs.existsSync(res)) {
    console.error("run this from the project root: " + path.relative(root, res) + " is missing");
    process.exit(1);
}

Object.keys(DENSITY).forEach(name => {
    const dir = path.join(res, "mipmap-" + name);
    const legacy = Math.round(48 * DENSITY[name]);
    const layer = Math.round(108 * DENSITY[name]);

    save(icon(legacy), path.join(dir, "ic_launcher.png"));

    const disc = icon(legacy);
    round(disc);
    save(disc, path.join(dir, "ic_launcher_round.png"));

    // An adaptive icon shows the middle 72 of its 108: the 35 is drawn at
    // the size it has on the square icon, as seen through that window.
    const fore = picture(layer, layer);
    number(fore, "35", layer * TALL * 72 / 108, layer / 2, layer / 2);
    save(fore, path.join(dir, "ic_launcher_foreground.png"));

    const back = picture(layer, layer);
    fillWheel(back, layer / 2, layer / 2);
    save(back, path.join(dir, "ic_launcher_background.png"));
});

save(icon(512), path.join(store, "icon-512.png"));

const feature = picture(1024, 500);
fillWheel(feature, 512, 250);
number(feature, "35", 500 * TALL, 512, 250);
save(feature, path.join(store, "feature-1024x500.png"));
