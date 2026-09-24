#!/usr/bin/env swift
/* =============================================================================
   35 — app icon and launch screen
   -----------------------------------------------------------------------------
   The icon is the top of the ladder: 35 in the game's own block digits, white,
   on the rainbow that only 35 wears — the same stops as .num-35 in
   css/numbers.css, round the clock from twelve. The launch screen is the
   page's own grey and nothing else, so the game opens into itself rather than
   onto a logo.

   The digits are the bars from js/ui/icons.js; keep the two in step. Nothing to
   install — the Swift that ships with Xcode or the Command Line Tools runs it.

     npm run icons        (from the project root)
   ============================================================================= */

import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let assets = root.appendingPathComponent("ios/App/App/Assets.xcassets")
let sRGB = CGColorSpace(name: CGColorSpace.sRGB)!

func rgb(_ hex: String) -> (CGFloat, CGFloat, CGFloat) {
    let v = Int(hex.dropFirst(), radix: 16)!
    return (CGFloat((v >> 16) & 255) / 255, CGFloat((v >> 8) & 255) / 255, CGFloat(v & 255) / 255)
}

/* No alpha channel at all: App Store Connect rejects an icon that has one. */
func canvas(_ size: Int) -> CGContext {
    return CGContext(data: nil, width: size, height: size, bitsPerComponent: 8,
                     bytesPerRow: 0, space: sRGB,
                     bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
}

func save(_ ctx: CGContext, _ url: URL) {
    let image = ctx.makeImage()!
    let out = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil)!
    CGImageDestinationAddImage(out, image, nil)
    guard CGImageDestinationFinalize(out) else { fatalError("could not write \(url.path)") }
    print("wrote \(image.width)×\(image.height)  \(url.path.replacingOccurrences(of: root.path + "/", with: ""))")
}

/* ---- the rainbow: a conic gradient from twelve o'clock, clockwise --------- */
let stops: [(CGFloat, String)] = [
    (0, "#df676b"), (30, "#d97230"), (60, "#bd8700"), (90, "#989900"),
    (120, "#5ba84a"), (150, "#00ab86"), (180, "#00a6ad"), (210, "#00a0d3"),
    (240, "#5991ed"), (270, "#927fe7"), (300, "#ba71cb"), (330, "#d4679f"),
    (360, "#df676b")
]

func wheel(_ size: Int) -> CGImage {
    var pixels = [UInt8](repeating: 255, count: size * size * 4)
    let c = CGFloat(size) / 2
    for y in 0..<size {
        for x in 0..<size {
            let dx = CGFloat(x) + 0.5 - c
            let dy = CGFloat(y) + 0.5 - c
            var angle = atan2(dx, -dy) * 180 / .pi       // 0 at twelve, clockwise
            if angle < 0 { angle += 360 }

            var i = 0
            while i < stops.count - 2 && angle > stops[i + 1].0 { i += 1 }
            let (a0, h0) = stops[i]
            let (a1, h1) = stops[i + 1]
            let t = (angle - a0) / (a1 - a0)
            let p = rgb(h0), q = rgb(h1)

            let o = (y * size + x) * 4
            pixels[o] = UInt8(((p.0 + (q.0 - p.0) * t) * 255).rounded())
            pixels[o + 1] = UInt8(((p.1 + (q.1 - p.1) * t) * 255).rounded())
            pixels[o + 2] = UInt8(((p.2 + (q.2 - p.2) * t) * 255).rounded())
        }
    }
    let data = CGDataProvider(data: Data(pixels) as CFData)!
    return CGImage(width: size, height: size, bitsPerComponent: 8, bitsPerPixel: 32,
                   bytesPerRow: size * 4, space: sRGB,
                   bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.noneSkipLast.rawValue),
                   provider: data, decode: nil, shouldInterpolate: false,
                   intent: .defaultIntent)!
}

/* ---- the number: straight bars in a 5 × 7 box, as in js/ui/icons.js ------- */
let W: CGFloat = 5, H: CGFloat = 7, T: CGFloat = 1.5
let MID = (H - T) / 2, REACH = (H + T) / 2
let BARS: [Character: CGRect] = [
    "a": CGRect(x: 0, y: 0, width: W, height: T),
    "b": CGRect(x: W - T, y: 0, width: T, height: REACH),
    "c": CGRect(x: W - T, y: MID, width: T, height: REACH),
    "d": CGRect(x: 0, y: H - T, width: W, height: T),
    "e": CGRect(x: 0, y: MID, width: T, height: REACH),
    "f": CGRect(x: 0, y: 0, width: T, height: REACH),
    "g": CGRect(x: 0, y: MID, width: W, height: T)
]
let DIGITS: [Character: String] = [
    "0": "abcdef", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd",
    "6": "afgecd", "7": "abc", "8": "abcdefg", "9": "abcdfg"
]
let ONE: (CGFloat, [CGRect]) = (4, [CGRect(x: 4 - T, y: 0, width: T, height: H),
                                    CGRect(x: 4 - T - 1.3, y: 0, width: 1.3, height: T)])

/* the bars of a number in digit units, y down, with the width they span */
func bars(_ text: String) -> ([CGRect], CGFloat) {
    var placed: [CGRect] = []
    var x: CGFloat = 0
    for (i, d) in text.enumerated() {
        if i > 0 { x += 1 }
        let (w, own) = d == "1" ? ONE : (W, DIGITS[d]!.map { BARS[$0]! })
        placed += own.map { $0.offsetBy(dx: x, dy: 0) }
        x += w
    }
    return (placed, x)
}

func icon(_ size: Int) -> CGContext {
    let ctx = canvas(size)
    let s = CGFloat(size)
    ctx.draw(wheel(size), in: CGRect(x: 0, y: 0, width: s, height: s))

    // draw the way the page does, y down from the top
    ctx.translateBy(x: 0, y: s)
    ctx.scaleBy(x: 1, y: -1)

    let (placed, _) = bars("35")
    let left = placed.map { $0.minX }.min()!
    let right = placed.map { $0.maxX }.max()!
    let k = s * 0.4 / H
    let dx = s / 2 - (left + right) * k / 2
    let dy = s / 2 - H * k / 2

    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    for bar in placed {
        ctx.fill(CGRect(x: dx + bar.minX * k, y: dy + bar.minY * k,
                        width: bar.width * k, height: bar.height * k))
    }
    return ctx
}

func plain(_ size: Int, _ hex: String) -> CGContext {
    let ctx = canvas(size)
    let c = rgb(hex)
    ctx.setFillColor(CGColor(red: c.0, green: c.1, blue: c.2, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: size, height: size))
    return ctx
}

guard FileManager.default.fileExists(atPath: assets.path) else {
    fatalError("run this from the project root: \(assets.path) is missing")
}

save(icon(1024), assets.appendingPathComponent("AppIcon.appiconset/AppIcon-512@2x.png"))

let launch = plain(2732, "#eef0f3")     // --bg in css/theme.css
for name in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"] {
    save(launch, assets.appendingPathComponent("Splash.imageset/" + name))
}
