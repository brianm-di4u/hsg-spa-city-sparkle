# Critic brief: loop 3

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
Root: `games/match-3 puzzle/screenshots/review-loop-3/`.
- `desktop/r01-title.png` … `r17-tip.png` and the same names under `mobile/`:
  - title, map, one level per world (r03–r08);
  - Cascade, Hot Stone and Crystal mid-fire (r09–r11), a chain callout (r12);
  - win, lose, level intro, help and a tutorial tip (r13–r17).
- `strips/desktop-s1.png`, `strips/mobile-s1.png` (a swap → Cascade fire → fall) and `strips/*-s2.png` (a Crystal
  swap). **Judge animation from these.**
- `sheets/*.png` are contact sheets of the same frames, for a quick sweep; open single frames for detail.

## What changed this loop (facts only)
Changes since loop 2 (facts only):
- Fixed: callouts vanished after a board was rebuilt (the reused text object had been detached); "Spring Crystal!", "Bubbly!" (chain wave 2), "Cascade!", "Hot Stone!" and combo callouts now show, placed over the top edge of the board instead of over the rows being cleared.
- Fixed: the star bar had a width transition, so frozen frames caught a stale fill; it now matches the shown score in every frame. Capture boards inherit the level's star thresholds.
- The HUD score counts up through each scoring beat.
- Clears burst into shards tinted with the piece's colour (10 per piece).
- Cascade specials re-rendered: a cyan glass band through the piece with two gold arrow fins reaching the cell edge.
- Tufa layer studs moved to the stone's lower rim; tufa is tinted drab grey; the fan render is glossier; crust is a beige-white crystalline rim.
- Board: a darkened radial halo in the backdrop behind the board; a warm rim highlight on the frame.
- Map: wider crossfades (140 px) between world panels; the header names the world of the level whose intro is open; the header title wraps rather than truncates.
- HUD: the world label is the short world name only; level names wrap to two lines instead of truncating.
- Lose dialog: goal icon pills with what is left; "So close!" only when at least half the goals are done.
- Paintings: World 2 backdrops (portrait and landscape) recomposed around the wooded mountain slope, the brick Grand Promenade, the tower and a single narrow cascade, with low grey tufa; the stepped terraces were removed from both title paintings and the World 2 map panel.

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
   `"loop": 3`.

Don't edit any file. Reply with the review only.
