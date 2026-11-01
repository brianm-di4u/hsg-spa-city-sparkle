# Spa City Sparkle: development plan

## 1. Milestones
| M | Goal | Exit criteria |
|---|---|---|
| M1 Foundation | Scaffold, build, vendored Pixi, engine core, hooks, vector pieces | Node engine tests green; a board renders at both viewports; swaps, matches and gravity work; zero console errors |
| M2 Core loop | Specials, combos, timeline player, all input modes, juice, HUD, win/lose, Encore | AC4–AC9, AC17, AC18, AC22, AC31–AC33, AC43 tests green; screenshots inspected |
| M3 Rules and content | Blockers, tokens, goals, boosters, reshuffle, hints, 60 levels, map, saves, tutorial, lore, Free Soak | AC10–AC16, AC19–AC21, AC23–AC30, AC38, AC39 green; `check-levels` and `balance` in band |
| M4 Art and audio | Blender sprites, Codex paintings, Pixi FX, fonts, audio, accessibility polish | AC34–AC37, AC40, AC42 green; art manifest clean; pilot style approved |
| M5 Optimisation and review | Perf and size budgets, adversarial visual review loop, mechanics test campaign | AC41, AC44; `TEST-CAMPAIGN.md`; `REPORT.md` |

## 2. Task breakdown
**M1**
- `package.json` scripts: `build` (vendor, art, levels, fonts, then the inliner), `test`, `check`.
- `tools/build-vendor.mjs`: pinned PixiJS v8 IIFE copied from `tools/dev/node_modules` to `vendor/`.
- `src/index.html`, `styles/main.css` (tokens copied from `shared/design/tokens.css`).
- Engine modules: rng, grid, match, gravity, a resolve skeleton.
- `view/stage.js`, `view/board-view.js` (vector placeholders), `ui/hooks.js`, `ui/input.js` (drag only).
- Tests: `01-engine-node`, `02-boot`.

**M2**
- specials, combo matrix, the full `resolve` wave loop with timeline events
- `view/player.js` (`poseAt`), FX v1, HUD, results screens, Encore
- input: tap-tap, keyboard cursor, touch threshold
- tests: `03-specials-node`, `04-input`, `05-play`

**M3**
- blockers, tokens, goals, boosters, reshuffle and hints
- level text format, `tools/build-levels.mjs`, `tools/check-levels.mjs`, `tools/bots.mjs`,
  `tools/balance.mjs`, `tools/fuzz.mjs`
- 60 levels, world map, saves, tutorial overlays, lore cards (`data/lore.json`, `tools/check-facts.mjs`),
  How to Play demos, Free Soak
- tests: `06-blockers-node`, `07-goals`, `08-levels-node`, `09-progress`, `10-screens`

**M4**
- `art-src/blender/pieces.py` renders, `tools/build-sprites.mjs` (atlas), `tools/build-art.mjs` (data URIs)
- Codex paintings (pilot, then batches) packed with `art-pack.mjs`
- FX v2 (steam, shimmer, rays, sparkles), fonts (`tools/build-fonts.mjs`), `audio.js`
- tests: `11-art`, `12-a11y`, `13-offline`

**M5**
- `tools/perf-gpu.mjs`, `tools/shots-gpu.mjs` (review captures), `reviews/`, the loop
- `TEST-CAMPAIGN.md`: state fuzz, interaction sweep, defect table
- tests: `14-perf`, `15-statefuzz-node`

## 3. `window.__game` hook spec
| Method | Returns / effect |
|---|---|
| `seed(n)` | sets the base seed used by the next `newGame`/`loadLevel` |
| `getState()` | `{scene, level, board:{w,h,cells:[{k,s,stone,crust,lock,fog,moss}]}, movesLeft, movesUsed, score, goals, phase, stars, boosters, progress, settings, lastTimeline:{events:n, waves, valid}, anim:{playing}}` |
| `setState(s)` | loads an engine state (the `G.state` shape from MECHANICS §3) and redraws |
| `isIdle()` | no timeline playing, no UI transition, art loaded, Pixi ready (ambient excluded) |
| `scene(name)` | `'title'`, `'map'`, `'intro'`, `'game'`, `'pause'`, `'win'`, `'lose'`, `'world'`, `'help'`, `'settings'`, `'about'`, `'soak'` |
| `newGame(opts)` | `{level:'w1-01', seed?}` → loads the level into the game scene |
| `act('swap', [x,y], [x,y])` | performs a swap and resolves it; returns `{valid, waves}` |
| `act('booster', name, [x,y]?, dir?)` | uses a booster |
| `act('skip')` | jumps the timeline to the end |
| `act('clock', ms | null)` | freezes the animation clock at `ms` into the current timeline (null unfreezes) |
| `act('replay')` | replays the last timeline from 0 (for frozen-clock shots) |
| `act('hint')` | shows the hint now; returns the move |
| `act('win')` / `act('lose')` | force the outcome (screen tests only) |
| `act('progress', obj)` | set saved progress (map tests) |
| `act('legal')` | the list of legal moves |
| `act('board', ascii)` | load a test board from the ASCII level format |
| `step(n)` | advances the animation clock `n` × 16.67 ms while paused (for `stepUntil`) |
| `pause()` / `resume()` | freeze or unfreeze animation |

## 4. Test matrix
Screenshots are named `NN-name` and taken at both viewports unless noted. Node tests have no shots.

| AC | Test (file › name) | Screenshots |
|---|---|---|
| AC1 | 10-screens › title | `10-title` |
| AC2 | every screen test calls `checkLayout` | — |
| AC3 | 01-engine-node › level parse, initial board; 08-levels-node | — |
| AC4 | 01-engine-node › swap valid/invalid; 05-play › invalid bounce | `05-bounce` |
| AC5 | 01-engine-node › cascades settle; 05-play › cascade mid-frame | `05-cascade-mid` |
| AC6 | 03-specials-node › cascade shapes/orientation; 05-play › cascade fire | `05-cascade-fire` |
| AC7 | 03-specials-node › stone shapes, diamond, aftershock | `05-stone-fire` |
| AC8 | 03-specials-node › crystal | `05-crystal-fire` |
| AC9 | 03-specials-node › combo matrix ×6; 05-play › combos | `05-combo-*` |
| AC10–AC15 | 06-blockers-node › one test per blocker; 07-goals › blocker boards | `07-tufa`, `07-crust`, `07-lock`, `07-moss`, `07-fog`, `07-tokens` |
| AC16 | 07-goals › each goal type; stars | `07-goals-hud` |
| AC17 | 05-play › encore | `05-encore`, `10-win` |
| AC18 | 07-goals › out of moves | `10-lose` |
| AC19 | 07-goals › boosters | `07-booster-*` |
| AC20 | 01-engine-node › reshuffle; 07-goals › reshuffle message | `07-reshuffle` |
| AC21 | 05-play › hint after idle | `05-hint` |
| AC22 | 05-play › skip equals full playback | — |
| AC23 | 08-levels-node › check-levels | — |
| AC24 | 08-levels-node › balance snapshot (reads `tools/balance-report.json`, fails if stale or out of band) | — |
| AC25 | 09-progress › map unlocks | `09-map`, `09-map-w3` |
| AC26 | 09-progress › postcard steps | `09-postcard-0`, `09-postcard-5`, `09-postcard-10` |
| AC27 | 09-progress › lore card; 08-levels-node › check-facts | `09-lore` |
| AC28 | 10-screens › tutorial overlay | `10-tutorial` |
| AC29 | 10-screens › help tabs, about | `10-help-*`, `10-about` |
| AC30 | 10-screens › free soak | `10-soak` |
| AC31 | 04-input › mouse drag | — |
| AC32 | 04-input › touch swipe, tap-tap (mobile) | — |
| AC33 | 04-input › keyboard win | `04-cursor` |
| AC34 | 12-a11y › contrast on every screen | — |
| AC35 | 12-a11y › grayscale silhouettes; badges | `12-grayscale`, `12-badges` |
| AC36 | 12-a11y › reduced motion | `12-reduced` |
| AC37 | 12-a11y › live region | — |
| AC38 | 09-progress › settings persist; localStorage throws | — |
| AC39 | 09-progress › save and continue | — |
| AC40 | 13-offline › file url (gpu), `?art=0` fallback | `13-fallback` |
| AC41 | 14-perf › frame cost, size, load, heap | — |
| AC42 | 12-a11y › audio events and mute (AudioContext spy) | — |
| AC43 | 01-engine-node › determinism; 15-statefuzz-node | — |
| AC44 | `reviews/` loop (manual protocol) | review captures |

## 5. Defect log
| # | Found | Symptom | Root cause | Fix | Regression test |
|---|---|---|---|---|---|
| D1 | M1 | Magnolia petals rendered with dark holes | Overlapping petal paths filled with the even-odd rule | Fill and clip with the non-zero rule | 02-boot board screenshot |
| D2 | M1 | Star meter's last star overflowed the HUD on mobile | Markers positioned at 100% of the bar width | Markers clamped to 8–92% of the bar | 10-screens, 12-a11y layout checks |
| D3 | M1 | `newGame` from a test returned to the title | `window.__game` was installed before boot finished; the art load then called `showTitle()` | Hooks installed last in `boot()` | 02-boot |
| D4 | M4 | Blender renders silently went nowhere | A relative output path resolved against Blender's own working folder | Absolute output path in the render command | art pipeline (manual) |
| D5 | M3 | Several levels at 0–15% win rate even with 40 moves | Full-width rows of locked or fogged pieces (and fog on the spawner row) blocked all refills below | Checker-pattern layouts; `check-levels` refill simulation and "no lock or fog on a spawner" rule | 08-levels-node |
| D6 | M3 | Level build failed: "grid is not 9×5" | Grid rows starting with `#` (holes) were parsed as comments | Comments only outside grids | 08-levels-node |
| D7 | M3 | Algae and crust-only levels tuned to 6–13 moves | Goals with nothing to scale | Generator adds a scaled collect goal when a level would be under the move floor | 08-levels-node (balance report) |
| D8 | M3 | Contrast failures on every gradient button | Gradient elements had no solid background colour for the checker (and dark stops) | Mid-tone `background-color` declared under every gradient | 12-a11y |
| D9 | M3 | Map star labels failed contrast | Gold text over the gold node | Stars on their own dark pill | 12-a11y |
| D10 | M5 | Real-GPU crash "reading 'alphaMode'" when moving between worlds | Rebuilding vector textures destroyed textures still used by live sprites (ambient steam, effects) | Only cell textures rebuild per world; replaced textures are retired after the next board rebuild | 20-review on `--gpu`, all suites |
| D11 | M5 | State fuzz: a board with no possible move stayed in play | Algae can overgrow the board so even a reshuffle finds no move | The level ends as lost ("The algae took over the board!") | 15-statefuzz-node |
| D12 | M4 | World 2 levels showed the procedural sky | Backdrop rebuild after the world art pack loaded was tied to the exact level state | Tied to the active world | 07-goals, review captures |
| D13 | M2 | Map node click timed out in tests | The current node bobs forever, so Playwright never sees it as stable | Force-click in the test (the animation is intended) | 10-screens |
| D14 | M2 | Special + special combos had no effect of their own | Combo hits are not `fire` events | Dedicated combo effects (cross beams, shockwave, prism burst) | 05-play combo frames |
| D15 | M2 | Board shade sized for a 9×9 board on smaller boards | Backdrop cache key ignored board size | Key includes board size and cell size | 05-play frames |
| D16 | M4 | Art assets 15.7 MB, over the 6 MB budget | WebP files shipped next to their base64 copies; oversized paintings | Paintings downsized; WebP kept as build input; on-demand art packs (core, map, per world) | 14-perf sizes |
| D17 | M4 | White Pamukkale-style terraces in World 2, title and map art | Image model's default for "terraces" | Codex in-place edits to drab grey-tan tufa with algae | review loop authenticity |
| D18 | Review loop 0 | Map star total over the world title; "plus5" on the win card; star markers over the score | Sticky header with a transparent gradient; raw booster ids; flex column without fixed bar size | Solid header bar with a star pill; display names; fixed-width bar with clamped markers | 09-progress, 10-screens, review loop 1 |
| D19 | Fuzz campaign | Algae could cover every movable cell, leaving no swap even after reshuffle | Reshuffle cannot create a move when moss leaves too few movable tiles | The turn ends the level as lost (`stuck`), with its own lose message | 15-statefuzz-node, 06-blockers-node |
| D20 | Review loop 2 | World 2+ backdrops stayed procedural after their art pack loaded | Backdrop cache key did not change when the pack arrived | Rebuild forced when the world's pack finishes loading | 05-play frames, review captures |
| D21 | Review loop 3 | Chain callouts stopped appearing after the first level | `buildBoard` cleared the callout layer, leaving a detached cached Text | Callout destroyed and nulled on rebuild | 20-review r12-callout |
| D22 | Review loop 3 | Star bar showed full on hook-loaded test boards and lagged a frame behind the score | Test boards had stars `[0,0,0]`; a CSS width transition | Hook boards inherit the level's stars and goals; transition removed | 07-goals, 20-review |
| D23 | Review loop 4 | Map world title nearly invisible | Its class `map-world` also matched the panel fade mask | Renamed to `.map-title` | 09-progress |
| D24 | Review loop 4 | Desktop score drawn outside the HUD panel; "Spring Crystal!" clipped at the left edge; tip card over the booster tray | Fixed-width star bar plus score in a row wider than the panel; callouts not fitted to their lane; tip height not checked against the tray | Score on its own row; callouts scaled to their lane at peak; Della's portrait shrinks or hides to clear the tray | 20-review r03, r11, r17 |
| D25 | Review loop 4 | Fine grid pattern over desktop skies | Large-strength GPU BlurFilters on the board shade and shadow | Shade and cast shadow drawn once with canvas gradients and shadowBlur | 20-review r04/r06 sky crops |
| D26 | Review loop 4 | Hot Stone ring muddy, Cascade-creation ring green | Orange ring texture multiplied by colour tints | Neutral white ring texture; tints give the colour | 20-review r10 |
| D27 | Review loop 5 | Desktop score still flush with the HUD panel's right edge | The HUD grid's implicit column sized to its widest item, wider than the panel's content box | `grid-template-columns: minmax(0, 1fr)`, tabular numerals, right padding (99,999 ends 24 px inside the panel) | measured in Chromium at 1280×800 |
