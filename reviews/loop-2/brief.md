# Critic brief: loop 2

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
Root: `games/match-3 puzzle/screenshots/review-loop-2/`.
- `desktop/r01-title.png` … `r17-tip.png` and the same names under `mobile/`:
  - title, map, one level per world (r03–r08);
  - Cascade, Hot Stone and Crystal mid-fire (r09–r11), a chain callout (r12);
  - win, lose, level intro, help and a tutorial tip (r13–r17).
- `strips/desktop-s1.png`, `strips/mobile-s1.png` (a swap → Cascade fire → fall) and `strips/*-s2.png` (a Crystal
  swap). **Judge animation from these.**
- `sheets/*.png` are contact sheets of the same frames, for a quick sweep; open single frames for detail.

## What changed this loop (facts only)
Changes since loop 1 (facts only):
- Star bar: the fill tracks score ÷ 3-star threshold (it no longer keeps a stale width); star markers sit at their thresholds and at least 20% apart.
- HUD state: forced win/lose captures set goals and moves consistently; motion-strip replays start from the pre-move score and moves and count up as effects land.
- Map: the world name, its postcard thumbnail (desaturated by progress) and the restoration count live in the header bar and follow the scroll; the in-map world cards were removed; on desktop the map is wider (820 px) and the side gutters show a blurred, darkened copy of the current world's map; level nodes follow the painted path.
- Specials: the Hot Stone is the piece seated on a glowing ember-cracked basalt stone (the dashed ring is gone); the Cascade keeps its larger fins; every special still has a glow halo.
- Pine piece re-rendered about 18% larger in a lighter green with a small gold star on top.
- Board: thicker bevelled frame with a top highlight and drop shadow; stronger, wider cast shadow; the cell texture lost its bright top strip; the portrait board sits lower, near the tray; desktop board margins are larger.
- Blockers: steam fog is soft translucent grey vapour; the crust rim is grey-white; HUD goal icons are alpha-only.
- Motion: a stronger swap overshoot (longer swap beat) and a deeper landing squash; callouts now appear for every special ("Cascade!", "Hot Stone!", "Spring Crystal!"), for combos ("Steam Cross!", "Hot Rocks!" …) and for chains from 2 waves ("Bubbly!"); a light shake on Cascades.
- Type and UI: HUD world labels read "W1 · Bathhouse Row"; long level names shrink before truncating; "+5 Moves" never breaks; Help shows the three rendered specials; results buttons fit one row; the focus ring is a gold glow; the portrait tutorial tip docks under the HUD, above the board.
- Paintings: the landscape title's terraces were repainted lower and drab grey-tan.

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
   `"loop": 2`.

Don't edit any file. Reply with the review only.
