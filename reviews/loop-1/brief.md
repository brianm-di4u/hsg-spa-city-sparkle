# Critic brief: loop 1

You are an independent, deliberately harsh visual critic reviewing **Spa City Sparkle**. It is an original
browser swap-and-match (match-3) puzzle game set in Hot Springs, Arkansas, rendered with PixiJS:
- pieces are Blender renders;
- backdrops, the map, postcards and the guide are AI-assisted paintings;
- the UI is HTML and CSS.

You judge it against the commercial genre leaders on phones. Inflated scores waste the developer's time;
deflated ones without evidence get thrown out by the judge. Be exact and cite.

You have not seen any earlier score, the other reviewer, or the developer's opinion. Don't look for them:
`games/match-3 puzzle/reviews/HISTORY.md`, `games/match-3 puzzle/reviews/history.json` and every other `games/match-3 puzzle/reviews/loop-*/` folder
are off limits.

## Read first
- The rubric: `games/match-3 puzzle/reviews/RUBRIC.md`.
- The output schema: `games/match-3 puzzle/reviews/schema.json`.

## What to review
The captures were made on a real GPU in headless Chrome, at 1280×800 desktop and 390×844@2× phone portrait.
Root: `games/match-3 puzzle/screenshots/review-loop-1/`.
- `desktop/r01-title.png` … `r17-tip.png` and the same names under `mobile/`:
  - title, map, one level per world (r03–r08);
  - Cascade, Hot Stone and Crystal mid-fire (r09–r11), a chain callout (r12);
  - win, lose, level intro, help and a tutorial tip (r13–r17).
- `strips/desktop-s1.png`, `strips/mobile-s1.png` (a swap → Cascade fire → fall) and `strips/*-s2.png` (a Crystal
  swap). **Judge animation from these.**
- `sheets/*.png` are contact sheets of the same frames, for a quick sweep; open single frames for detail.

## What changed this loop (facts only)
Changes since loop 0 (facts only):
- Board seating: the hard-edged translucent rectangle behind the board was removed; a blurred cast shadow now sits under the board frame, and the screen vignette is stronger. Desktop board margins are larger.
- Pieces are drawn larger (sprite 1.1 × cell, up from 0.92).
- Specials: Cascade arrow fins re-rendered about 50% larger; every special has an additive glow halo underneath (cyan Cascade, orange Hot Stone, white Crystal); the Spring Crystal was re-rendered larger, in pink, blue and violet shards.
- Blockers: the padlock was re-modelled as a chain crossing the cell in an X with a large padlock (brass for one lock, steel for two); mineral crust is now a crystalline rim around the cell edge with the piece unobscured; steam fog is a translucent swirl.
- HUD goal and intro icons are drawn from the board's own rendered sprites. Levels with a token goal start with a bath token on the board.
- Motion: the swap uses a back-out ease (overshoot); falling pieces squash on landing; the moves badge and score pulse when they change; the Cascade beam texture now has a bright core and tapered ends, with fewer, fainter steam puffs and sparks at the beam tips.
- UI and type: the map header is a solid bar with the star total in its own pill; "How to play" on the title is now "Help"; HUD world labels use short names on one line; star markers sit along the bar at their thresholds; booster rewards use display names ("+5 Moves").
- Mobile: the board sits lower, nearer the booster tray; goal pills are compact on one row; the tutorial tip docks below the board in portrait (when there is room) and in the left column on desktop.
- Paintings: the World 2 backdrops, the World 2 postcard, the portrait title and the World 2 map panel were repainted so the tufa terraces are drab grey-tan with green algae; a landscape title painting was added for desktop.
- The win capture (r13) now comes from a seeded state with a score above the 3-star threshold.

## Write
1. A verdict in one paragraph.
2. For each of the 8 categories: the score, then why, citing captures by path (for example `mobile/r05-world3`,
   `strips/mobile-s1`).
3. The IP check: anything that copies a commercial match-3 game's names, logos, piece designs or UI. Say "clean"
   if nothing does.
4. The ranked gaps: the specific visual defects or shortfalls that cost the most points. Give each one:
   - a concrete, testable fix;
   - an expected gain in points;
   - a severity from 1 to 5;
   - an effort: S, M or L.
5. **The last thing in your reply:** one fenced ```json block per schema.json, with `"role": "critic-claude or critic-codex, as your prompt says"` and
   `"loop": 1`.

Don't edit any file. Reply with the review only.
