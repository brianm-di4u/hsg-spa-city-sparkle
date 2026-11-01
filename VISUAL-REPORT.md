# Spa City Sparkle: visual review report

The adversarial review loop followed `reviews/PROTOCOL.md`:
- **Critics.** Each loop, two blind critics scored the same capture set: a Claude subagent and Codex (GPT-6.1 Sol, medium effort). The set held 17 desktop and phone screens and two motion strips per viewport, all captured on the real GPU.
- **Scoring.** Each critic scored 8 categories out of 10. A judge checked disputed claims against the images and ruled.
- **Tally.** `tools/review/tally.mjs` ranked the backlog and applied the stop rule.
- **Gates.** Every category at 7 or above, except authenticity, whose gate is 6.

## Result
**The final judged score is 52.0 / 80 (6.5 / 10).** The loop stopped after loop 5 for stagnation: two loops in a row without a new best. Loop 5 also reached the six-loop budget. Property-game's final harsh review, the quality reference in the brief, was about 6.4 / 10.

| Loop | art | rendering | animation | ui | typography | readability | mobile | authenticity | Total | Claude / Codex |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 6 | 5 | 5 | 5.5 | 6 | 6 | 6 | 6 | **45.5** | 44 / 47.5 |
| 1 | 6 | 6 | 6 | 5.5 | 6 | 6 | 6 | 6.5 | **48** | 47.5 / 51 |
| 2 | 6.5 | 6.5 | 6 | 6 | 6.5 | 6.5 | 7 | 6.5 | **51.5** | 52 / 50.5 |
| 3 | 6.5 | 6.5 | 6.5 | 6 | 6 | 6.5 | 7 | 7 | **52** | 52.5 / 52.5 |
| 4 | 6.5 | 6 | 6.5 | 6 | 6.5 | 6.5 | 7 | 7 | **52** | 52 / 52 |
| 5 | 6.5 | 6.5 | 6.5 | 6 | 6.5 | 6.5 | 6.5 | 7 | **52** | 51.5 / 53.5 |

**Gates.** Authenticity (7, against a gate of 6) passes. The other seven categories sit at 6.0–6.5, so the 7 gate is not met. The IP check was clean in every loop.

## What the loops changed
- **Loops 0–1:**
  - pieces re-rendered in saturated Standard-view Cycles
  - the board frame, cell bevels and backdrop shade
  - the star bar and the HUD layout
  - map header and progression
  - the help screen with rendered specials
  - contrast fixes
- **Loops 2–3:**
  - World 2 and later backdrops now load with their packs
  - chain callouts, plus a callout lane above the board
  - effects: coloured shards, special halos and wind-up, a thicker Cascade beam, stronger shake, and the HUD score counting up
  - lose dialog with goal pills
  - tufa reads as grey; leafy algae; denser steam
- **Loop 4:**
  - the map title made visible again (class clash)
  - warm frames for Worlds 2 and 4
  - "pts" on score goals
  - larger desktop HUD and tray
  - title scrims
  - framed lore card
- **Loop 5:**
  - desktop HUD, callout and tip fitted to their lanes
  - Cascade chevrons
  - landing squash and rebound
  - clear effects that keep the piece's colour
  - Hot Stone core flash and shockwave
  - canvas-drawn board shade (removes a blur-filter grid over the skies)
  - emerald pine
  - thicker chains
  - warm umber and teal cells
  - win celebration: ribbon, sunburst, sparkles and score count-up
  - one-line phone map header
- **After the loop stopped (built and tested, but not re-scored by critics):**
  - the score is inset and pops from its right edge
  - score goals read "N to go"
  - clear shards blend normally, so Crystal targets no longer bleach white
  - lose-dialog actions on one row

## Remaining gaps (the loop-5 judge's ranked backlog)
1. **Phone layout.** Centre the board between the HUD and the tray, scale 7-column and cross-shaped boards to full width, put a backing panel behind the HUD, and fit level names on one line.
2. **Impact timing.** Stronger shake and a punch on specials, staggered refill landings, and no static end frames.
3. **Lock clarity.** A compact padlock with thin chain bands, so the piece underneath reads.
4. **Crust and steam materials.** A cracked mineral crust slab with a matching goal chip, and drifting, swirled steam.
5. **Interface finish.** Themed map nodes with a lit path and a player marker, and glossy stars that stamp in.
6. **Piece finish.** Richer facets on the gems, thickness on the fans, and more mass on the pine.

Evidence for every score is in `reviews/loop-N/` (critic reviews, judge rulings, scores.json) and in `screenshots/review-loop-N/`.
