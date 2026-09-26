# 35

A drop-and-merge number puzzle for iPhone and iPad. Plain HTML, CSS and
JavaScript — no framework, no bundler — wrapped for iOS with Capacitor.

## The game

A 6×6 board and one number in hand. You pick a column; the number falls to the
bottom. One rule:

> **Three of the same number, touching, become the next one up.**

Three 1s make a 2, three 2s make a 3, all the way to 35. A merge starts at
the piece that arrived last — the one you dropped, or the one the merge before
made — and runs through the others to the far one, where the new number
appears. Whatever was above a merge falls into the gap, which can set off the
next merge — a chain, and each link pays more. Every full three that join
make one: four or five of a kind still make one of the next number, six make
two.

The hand deals four numbers — the best you have made and the three under it —
so the deal climbs with you; 34 and 35 are only built, never dealt, until the
first 35 is made. From then on the deal is the last four, 32 to 35, for the
rest of the run. The four come round in turn rather than by the roll of a
die: they go into a bag — the lowest four times, then three, two, and the top
once — and the hand is dealt from it until it is empty, so none of them stays
away for long, and the same number never comes three times running. Once you make a 10 the seam starts to give way and pieces
fall in on their own, into columns you did not pick — more of them, and more
often, the higher you climb: one every five drops from 10, one every three from
15, two every five from 20, two every three from 25, three every two from 30.
The run ends when the board is full.

**The bomb — the black diamond with a 0 on it.** The dial beside the hand
fills with the merges your moves make — twenty fill it — and keeps its charge
if you leave mid-run. When it is full, tap it and pick a column to drop a bomb.
It joins nothing; a merge beside it, or its own five-turn fuse, sets it off,
and the eight squares around it go with it.

**Infinity — the white diamond with the ∞ on it.** It falls in now and then
once a run passes 6,250 points. A merge beside it, or a blast over it, sets it
off: every piece on the board rings, you tap a number, and every one of that
number goes.

Three 35s have nowhere to go: they cash in for double and leave the board.
Getting to 35 is hard; past it there is no ceiling on the score.

There is no menu. The game opens on the board — the run left off last time,
or a new one. How to play, sound and start over sit at the top left (start over
takes two taps mid-run, so a stray one never throws a run away); the score and
the best under it sit centred, halfway between the top of the screen and the
grid; the piece in hand and the bomb sit side by side under it. When the board
fills, the end card shows "game over", the run's score, and the best under it;
a tap anywhere starts the next run.

**How to play** is seven short pages, a line each, played out on a little grid
of the game's own pieces — dropping, three making one, chains, numbers falling
in, the bomb, infinity, and the climb to 35 — with the same shattering as the
game.
It opens by itself the first time the game is played (remembered under
`thirtyfive.tutorial` in `localStorage`), before anything drops: the run
waits behind it, and the first 1 falls in once it is closed, skipped or
played through. Skip sits beside Next on every page but the last. After that
first time it opens only from the ? button.

## The look

Every piece is a flat square with its number in white, in block digits built
from straight bars — no curves, no outline. The grid is white; the score, the
best and the three buttons are white and drawn the same way, and the few words
the game says are square capitals on a 5 × 7 grid. Behind it all,
the colours of the numbers on the board — muted, so the tiles stand out —
blend and drift slowly across the screen. The colours go up the ladder in
sets of four — 1 to 4, 5 to 8, and so on — and each set wears one colour, the
lowest of the four in a light shade of it and the highest in a deep one. Every
set starts a little darker than the one before, so the run walks the whole
wheel — green, yellow, orange, red, pink, purple, violet, blue, and a deep teal
for 33 and 34 — and the start of a run looks as easy as it plays while the top
looks as hard as it is. 35 wears every colour, round the clock. The shades are
made by `tools/palette.js`: the hues and the steps are set there, and
`npm run palette` writes them into `css/numbers.css`. The bomb and infinity
are the two pieces that are not numbers, and they do not look like numbers:
each stands on its point — the bomb a black diamond with a white 0 on it,
infinity a white diamond with a black edge and the sign on it, the bomb turned
inside out. Whatever leaves the board — merged, blown up, swept by infinity —
breaks into squares of itself that fly to the edges of the screen.

A strip at the foot of the screen, under the piece in hand and the bomb, is
kept clear for a banner ad (60pt on a phone, 90pt on an iPad; `--ad-space` in
`css/theme.css`). The layout is checked on every iPhone size from the SE
(375×667) to the 16 Pro Max (440×956), with room for the notch and the home
indicator.

## Layout

```
index.html
css/
  theme.css        page tokens, reset, base type
  components.css   the points that fly to the score
  game.css         the board, the hand, the three buttons, how-to, end card
  charges.css      the bomb dial
  backdrop.css     the board's colours drifting behind everything
  numbers.css      the palette, the flat square pieces, and the two diamonds
js/
  core/            config (every tunable number), events, storage
  data/pieces.js   the ladder 1–35, the bomb, infinity
  systems/         state and rules — board, round, charges; never touch the DOM
  ui/              listen and draw — never edit state directly
  pages/game.js    boot
tools/
  palette.js       the colours of the numbers, written into css/numbers.css
  stamp.js         cache-busting for the iOS build and the web deploy
  icon.swift       draws the app icon and the launch screen
ios/               the Xcode project (Capacitor)
```

All tuning lives in `js/core/config.js`.

## Run it in a browser

```bash
npm run serve
```

Then open http://localhost:4173. Best score and the run in progress are kept
in `localStorage` under `thirtyfive.save`; the sound setting under
`thirtyfive.sound`.

## Build for the App Store

You need a Mac with **Xcode** (from the Mac App Store), **CocoaPods**
(`brew install cocoapods`), Node, and a paid Apple Developer account.

1. `npm install` — once.
2. `npm run icons` — only if you change the icon; it redraws
   `AppIcon-512@2x.png` (1024×1024, no alpha) and the launch images.
3. `npm run ios` — builds `www/`, syncs it into the Xcode project and opens
   Xcode.
4. In Xcode, under *Signing & Capabilities*, pick your team. Set the version
   under *General* (1.0, build 1 for the first upload; raise the build number
   for every upload after).
5. Choose *Any iOS Device*, then *Product → Archive*, then *Distribute App →
   App Store Connect*.
6. In App Store Connect, create the app for the bundle id
   `com.bernardogramaxo.thirtyfive`, add screenshots (iPhone 6.9" and, because
   the app also runs on iPad, iPad 13"), a description, an age rating, and a
   privacy answer of *Data Not Collected* — the game stores nothing off the
   device. (Adding ads changes that answer: an ad SDK collects identifiers
   and usage data, and personalised ads need Apple's tracking prompt.)

The app is set up for that already: portrait on iPhone, every orientation on
iPad (iPad multitasking requires it), no export-compliance question
(`ITSAppUsesNonExemptEncryption` is off), and an icon with no transparency.
