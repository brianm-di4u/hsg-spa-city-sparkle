# Critic brief: loop 0

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
Root: `games/match-3 puzzle/screenshots/review-loop-0/`.
- `desktop/r01-title.png` … `r17-tip.png` and the same names under `mobile/`:
  - title, map, one level per world (r03–r08);
  - Cascade, Hot Stone and Crystal mid-fire (r09–r11), a chain callout (r12);
  - win, lose, level intro, help and a tutorial tip (r13–r17).
- `strips/desktop-s1.png`, `strips/mobile-s1.png` (a swap → Cascade fire → fall) and `strips/*-s2.png` (a Crystal
  swap). **Judge animation from these.**
- `sheets/*.png` are contact sheets of the same frames, for a quick sweep; open single frames for detail.

## What changed this loop (facts only)
First review loop: the whole game is new.
- Pieces, specials, the Spring Crystal, the bath token and every blocker are Blender Cycles renders (art-src/blender/pieces.py), drawn as Pixi sprites; cell tiles and the board frame are drawn in code.
- Backdrops (6 worlds, portrait and landscape), the title, the world map panels, the postcards and the guide are AI-assisted paintings.
- Effects are stateless Pixi sprites: glints, steam puffs, beams, rings, rays, chain callouts and board shake.
- The UI is HTML and CSS with the Righteous and Nunito fonts.

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
   `"loop": 0`.

Don't edit any file. Reply with the review only.
