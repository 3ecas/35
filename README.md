# Grid of Fortune

A drop-and-merge puzzle that runs in the browser. No build step, no
dependencies — open `index.html` and play.

## The game

A 6×6 board and one piece in hand. No clock, nothing to spend, nothing to
manage. One rule:

> **Three of the same thing, touching, become the next one up.**

You drop a piece into a column and it falls to the ground. When three join,
what was above drops into the gap, which can set off another merge — so one
piece can start a long chain. A run longer than three joins all at once,
however far it has grown.

**Every piece in a run pays for itself.** A merge scores the worth of each
piece it consumes, at the rung they were standing on: three coal pay three
coal, five pay five. Size is worth something on its own now — before, a run of
six scored exactly what a run of three did, because the payout was read off the
one piece that came back rather than off the pile that went in. Rubble is worth
nothing and pays nothing wherever it is destroyed.

**A run gives back what it is worth.** Three become one, four become two, five
become three — a run of any length hands back all but two of itself, one rung
up. Before that a run of six gave back exactly what a run of three did, so
building anything past the minimum was a straight loss. Five is where it pays:
the three that come back are touching, so they go again on their own.

Every merge now frees exactly two squares whatever its size. Big runs stopped
being how you clear the board and became how you climb.

**Everything falls, and that is not decoration.** A merge always takes two
squares more than it gives back, so without gravity every merge leaves two
holes exactly where the surplus stood. The board then settles at about half full no matter
what size it is — measured, across every board from 4×4 to 6×6 — and what you
are left with is scattered pieces with a gap between each one. Falling closes
those holes the moment they appear: the built part stays packed, the empty part
stays overhead.

## The ladder

Nineteen rungs, dug out of the ground and locked away again:

```
dirt → stone → iron → silver → tin →
copper coin → silver coin → gold coin → coin stack → ingot →
topaz → amethyst → emerald → ruby → sapphire → diamond →
crown → treasure → vault
```

Ore, then coin, then stone, then what you keep them in. Every stone has its own
cut — pear, step, marquise, brilliant — so they never blur into coloured lumps.
The whole theme is that list in `js/data/pieces.js` plus its icons; nothing
else in the game knows what a diamond is, which is what makes adding a rung a
one-line job.

The ladder runs 1 to 2,500, climbing by about half again each rung rather than
doubling. Doubling looks right on paper, but the score is the *sum of every
merge*, and making one of a rung means making three of the one below — so a
doubling ladder compounds into the millions. Half again keeps a good run in
five figures while a vault is still worth 1,250 stones.

Dirt is the one value you can never collect: nothing on the ladder points at
it, so no merge ever produces one. Its 1 is there to say where the climb
starts.

## Playing

You hold **one piece**. There is nothing to hold back and nothing to swap, so
every drop is the same question, stripped to its bones: which column. The
column lights up on the tap that picks it and then lets go — there is no hover
on a phone, and a highlight that trailed the cursor read as part of the board.
Nothing pops up over the game: a merge pays out where it happens and the board
speaks for itself.

Nothing on screen is in a box. No cards, no panels, no pills — the menu and
the end card are text on the ground, and the end card only blurs the board
behind it rather than covering it, so the run you just lost stays in sight.

The screen is the board and the hand, and that is all. An arrow in the top
left goes back to the menu, and the button centred at the foot of the screen
opens the ladder: all nineteen rungs standing on end, scrollable, lit as
far as you have climbed *this game*, with a ring on the rungs being dealt. It
opens where you are rather than at the top, so the rungs in your hand are the
ones you see first.

**The hand climbs with you.** A run starts on dirt alone: the opening drops a
single dirt and the hand deals nothing else, so the first thing a run asks is
to build on it until three merge into stone. Every rung you make joins the deal
the moment you make it — stone, then coal, then iron — up to four at once, and
making zinc is what takes dirt out of the hand. From there the window slides up
with the best thing you have made, always four wide. Without that the ladder
caps out around six rungs and the top is unreachable however long you play.
The top two rungs are never dealt; those you build.

**The same piece comes at most twice in a row.** Beyond that the hand has to
offer you something else. Three of a kind in a row is a gift, not a puzzle.

**Nothing grows up behind it.** When a rung stops being dealt, whatever is
still standing on it stays exactly what it is. You only ever drop from the top,
so a piece buried under a pile can only be reached by its own kind falling onto
it — and once the hand has moved past that rung, none is coming. That leaves
pieces you can no longer complete, and digging them out before they cost you
the board is the skill. Nothing on the board is guaranteed a way out.

**The ladder shows what is gone.** Rungs below the dealing window are struck
through and greyed: they will never be dealt again, so anything of theirs still
standing on the board is yours to finish or live with.

**The seam schedule ends where games end.** It used to run to twelve pieces a
drop, four steps past anything a run reached — reaching them meant surviving
pressure whose whole job is to stop you, so tightening the schedule only
brought the same last step forward rather than unlocking the ones above. Those
four are gone and the rest arrive about a third sooner, so a run now meets the
last step instead of dying short of it.

**Every sixth drop the seam gives way** and two pieces fall in on their own,
into columns you did not pick. They come from the rungs already in your hand,
so they are never unmergeable — what they cost you is the choice of where.

**The seam reads the board before it gives.** It will not drop more than a
quarter of the free squares at once, so a scheduled burst of four arrives whole
on an open board and arrives as one piece on a board with four squares left.
The schedule sets the pressure; this only stops the schedule from finishing a
game the player was still in. Without it the same burst was harmless at a third
full and fatal at three-quarters, which is variance the player cannot read or
plan around.

**The seam fills the shallow columns first.** A burst picks among the columns
with the most room rather than uniformly, so it can no longer land three of its
four pieces on the one stack already near the ceiling. You still do not choose
where it goes — you just no longer lose to it landing all in one place.

**A star draws out a kind.** It falls in with the seam now and then, once you
are past 6,250 points, and answers a different problem from dynamite:
dynamite clears a *place*, a star clears a *kind*. It joins nothing, and a
merge beside it does nothing — only a blast sets it off. Catch one in a
stick's eight squares, the board stops and lights up, and whatever piece you
name is pulled off it wherever it happens to be — which is the only thing that
shifts one stranded here and another stranded three columns over. It pays the
same salvage a blast does. You cannot place one; the bomb is the only thing
you put on the board yourself.

**Dynamite is the way out.** Once you are past 1,250 points it starts coming in
with the seam. It joins nothing, and a merge landing against it sets it off:
everything in the eight squares around it goes, the stick with it. It waits twelve drops and then goes off
whether or not a merge has reached it — without that, a stick landing among
pieces too old to merge waits forever and becomes part of the very problem it
exists to solve. It pays the full worth of everything it destroys, the same
rule a merge pays under — a blast of three pieces and a merge of three pieces
are worth the same. Building stays clearly better anyway: a merge also climbs a
rung and can chain, and a chain pays up to five times over, neither of which a
blast does. What the full payout buys is that a stick is no longer a bad trade
for the pieces it is there to solve — with nothing growing up behind the
window, it is the only thing that shifts a piece you can never complete. One caught in another's blast goes off in turn, so a
line of them runs.

**Nothing ends the game but a full board** — and not even that while a stick is
standing on it: every stick on the board goes off first, and the run carries
on in the room that makes. The vault has nothing above it, so
it simply sits there taking a square — reaching the top is not a win, it is the
start of the squeeze. The score is the point.

**A game arrives rather than appears.** The board opens empty, holds for half a
second, then the six starting pieces fall in one at a time — the same fall the
game uses all the way through, not a special effect. Each one goes to a column
where it will not join anything, so the board is laid out rather than played:
the run starts from what you were dealt, not from a merge you did not make.
Where every column would join, it lands anyway and scores nothing — about one
opening in fifty.

**A run keeps itself.** The arrow in the top left goes back to the menu at any
point and costs you nothing. The menu offers Play, and when there is a run in
progress it offers Continue and, below it and quieter, New game — every drop is
written to `localStorage`, so closing the tab is not the same as losing.
Continue leads whenever it is there, and the one that starts over says so in
words. It used to be a bare play triangle, the one glyph on the screen that
reads as *resume*, sitting directly under Continue; pressing it threw the run
away without a word. Reaching a full board ends the run and clears it.

**The score comes back with the run.** The scoreboard counts up as merges land,
so it has to be told where a resumed run left off — nothing is animating when
one starts, and the event that normally re-syncs the counter never fires. Left
to itself it read zero on a restored board until the next merge, which looked
exactly like the run had been thrown away when it had not.

## Layout

```
index.html
css/
  theme.css        palette (including the icon palette), reset, base type
  components.css   buttons, tints, floating gains
  game.css         the board, the strip, the hand, the sheet, the end
js/
  core/
    config.js      every tunable number
    events.js      pub/sub bus
    storage.js     localStorage access
  data/
    pieces.js      the ladder, plus rubble and dynamite — content, no behaviour
  systems/         change state, emit events, never touch the DOM
    board.js       the grid, the falling, the merging
    round.js       a game: hand, score, what is dealt, when it ends
  ui/              listen and draw, never edit state directly
    icons.js       line icons for chrome, flat vector art for the ladder
    boardview.js   draws the board, plays a move out beat by beat
    roundview.js   the hand, the strip, the sheet, the end card
    scoreview.js   the number at the top, counting rather than jumping
    effects.js     weight and payoff: thumps, rings, shoves, shake
    sparks.js      the burst thrown out when something joins up
    toast.js       the floating gains thrown off a merge
  pages/
    game.js        entry point
```

The split to keep: **data** describes content, **systems** change state and
announce events, **ui** listens and draws.

## Balance

Measured with a greedy bot that weighs every column each turn — it plays worse
than a person, so read these as a floor. A person jams long before it does.
Both columns below come from the same bot on the same seeds, so the comparison
holds even where the absolute numbers are pessimistic.

Forty runs at the current rules (merge-3, one piece in hand, nothing growing
up behind the window), with the previous rules re-measured on the same seeds by
the same bot so the two columns compare like for like:

| | before | now |
| --- | --- | --- |
| Game length | ~354 drops median | ~453 drops median |
| Score | ~13,000 median | ~54,000 median |
| Board | 44% full | 43% full |
| Biggest single seam burst | 5 pieces | 4 pieces |
| Pieces per burst | 3.3 average | 2.6 average |
| Dynamite unlocks | 32% into the run | 29% into the run |

Every run in both columns ended on a genuinely full board.

**The seam schedule no longer ends in a cliff.** Its last step used to double
the rate in one move — five pieces every drop, against a hand of one, six
squares filling per drop on a board that gives back two per merge. Nothing
survives that, so the top of the schedule was not difficulty, it was a wall
with a fixed position. The steps through drop 250 are unchanged; only the last
three are softened, and the largest step-to-step rise is now half rather than
double. The rate tops out at two pieces a drop instead of five.

**Rain is fuel as much as threat, which is why cutting it backfires.** Softening
the schedule *alone* measured 15% *shorter* runs, not longer: fewer pieces means
less to merge, which means less score, which means the `dynamiteFrom` gate
arrives later, which means fewer sticks to open a jammed board. What actually
helps is leaving the supply roughly intact and changing how it is delivered —
the quarter-of-free-squares limit and the shallow-column bias together, which
is where nearly all of the extra run length above comes from.

How full the board sits is still not a dial. It settles near 40% under every
falls schedule tried — gentle, flat or harsh — because it is set by the merge
rule giving back all but two squares, not by what falls in. What *is* a dial is
how often the board looks bare, and that is almost entirely the opening:
starting at two every five rather than one every eight cut it from a fifth of
the run to a seventh.

Keeping the surplus is still the biggest single lever in the game: measured
against throwing it away, runs about a third shorter and score several times
lower. Paying per piece consumed rather than per piece returned made the old
`surplusPays` knob meaningless — every piece in a run is now paid for by
definition — so it is gone.

Roughly four merges in five are still plain threes, so all of that comes from
the one in five that is bigger.

**Score and survival are coupled** through `dynamiteFrom`. That gate is read
off the score, so anything that changes scoring also changes when the first
stick falls — and dynamite is what keeps a jammed board playable. A change
that only looks like scoring will move run length too. Paying per piece
consumed made the score curve about two and a half times steeper, which pulled
the first stick from 32% of the way into a run down to 14%; `dynamiteFrom` and
`lodestoneFrom` were scaled by the same factor, to 1,250 and 6,250, to put both
specials back where they were in the shape of a run rather than on the
scoreboard.

**Where the danger actually is, measured.** Thirty runs, by how full the board
is and whether the run ended within fifteen drops of first getting there:

| board | share of drops | ran out within 15 drops |
| --- | --- | --- |
| 55% full | 28% | 0% |
| 68% full | 11% | 0% |
| 75% full | 7% | 3% |
| 83% full | 3% | 27% |
| 90% full | 1% | 60% |

A board at two-thirds is not in trouble, whatever it looks like. The squeeze is
the top two rows and they are narrow — three drops in a hundred and one in a
hundred. That is where a run is actually decided.

## Save data

Best score and everything you have ever made are kept in `localStorage` under
`gridoffortune.save`.
