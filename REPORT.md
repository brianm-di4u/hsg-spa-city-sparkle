# Spa City Sparkle: report

An original swap-and-match puzzle journey through Hot Springs, Arkansas: 60 levels in six worlds. Built
2026-11-01, following `shared/SESSION-BRIEF.md` steps A–H.

## What was built
| Area | Delivered |
|---|---|
| Research (A) | `research/town-content.md` (every place and fact used, with sources); `data/lore.json` (60 lore cards from the audited bank, 10 per world). Additions to the shared corpus: section 14 of `research/game-hooks.md`, `research/match3-route.json` (60 stops), web-sourced facts on tufa, algae, Garvan Gardens, Mount Ida quartz and the Geo-Float trail, and a SOURCES entry |
| Samples (B) | `SAMPLES.md`: 8 sources reviewed. No clone code was used; the engine is our own |
| Design (C–E) | `MECHANICS.md`, `PRD.md` (44 acceptance criteria), `DEV-PLAN.md` (milestones, hook spec, test matrix, defect log D1–D27), `VISUAL-PLAN.md`, `VISUAL-REPORT.md` |
| Engine | Pure ES modules (`src/js/engine/`). Two seeded RNG streams; matching that classifies runs into shapes; specials and the six combos; five blockers; bath tokens; tick-based gravity with diagonal slides; reshuffle with a constructive fallback; goals, stars and the Encore; boosters. Every action resolves into an event timeline that the view replays |
| View | PixiJS 8.22.0 (vendored, MIT). Render-on-demand board; stateless effects (glints, coloured shards, beams, rings, rays, halos, callouts, shake, landing squash); frozen-clock captures; reduced motion |
| UI | Title, painted world map (header follows the scroll, postcard restoration), level intro, HUD, results (lore card with source), lose (goal pills), world complete, pause, Help (6 tabs, rendered specials), settings (sound, music, volume, motion, steam, hints, colour-blind badges), About, Free Soak (daily seeded endless board), tutorial tips from Della (fictional guide) |
| Content | 60 levels from specs in `tools/gen-levels.mjs`. Move limits tuned against a casual-player bot, with goals scaled up so every level has 15–36 moves. Star thresholds come from bot scores |
| Art | Blender 5.2 Cycles renders (`art-src/blender/pieces.py`): 6 pieces × 5 variants, Crystal, token, blockers. Codex paintings: 12 backdrops, 2 titles, 6 map panels, 6 postcards, 4 guide poses, 1 card frame. Provenance in `art-src/PROMPTS.md` |
| Audio | WebAudio synthesis: per-event sound effects with chimes that rise per chain wave, and an ambient arpeggio per world. Quiet by default, mutable |
| Tools | `build.mjs`, `build-vendor/fonts/levels/art.mjs`, `gen-levels.mjs`, `check-levels.mjs`, `balance.mjs`, `bots.mjs`, `check-facts.mjs`, `review/{prep,tally}.mjs`, `review/compose.py` |

## Acceptance criteria
All 44 PRD criteria are met. The exceptions are listed under Known gaps.

| ACs | Evidence |
|---|---|
| AC1–AC2, AC28–AC30 | `10-screens` (title, map, intro, help tabs, settings, about, pause, win, lose, world, Free Soak) |
| AC3–AC9, AC43 | `01-engine-node`, `03-specials-node`, `05-play` (frozen frames of every special and combo), `15-statefuzz-node` |
| AC10–AC20 | `06-blockers-node`, `07-goals` |
| AC21–AC22 | `05-play` (hint after 5 s; Skip gives the same state as full playback) |
| AC23–AC24, AC27 | `08-levels-node`: `check-levels`; balance report current with all 60 in band; random bot at least 15 points below the casual bot; 3 stars reachable; `check-facts` |
| AC25–AC26, AC38–AC39 | `09-progress` |
| AC31–AC33 | `04-input` (mouse drag, tap-tap, touch swipe, keyboard win, keyboard menus), `16-interaction` (389 cells hit-tested × 2 viewports) |
| AC34–AC37, AC42 | `12-a11y` (contrast on 8 screens, reduced motion, live region, badges, grayscale capture, sound events) |
| AC40 | `13-offline` (`file://` with art, `?art=0` fallback) |
| AC41 | `14-perf`, sizes: index.html 1.16 MB, assets 5.8 MB |
| AC44 | Review loop: see Visual quality |

## Tests and validation
- **Harness:** `node shared/test-harness/run.mjs "games/match-3 puzzle"` gives **93/93 green** in software GL and **93/93 on the real GPU** (`--gpu`), with zero console errors and zero external requests. The slow suites (`--slow`) add the state fuzz, the interaction sweep and the review capture set. **Final milestone (2026-11-01):** `--slow` 98/98, `--gpu` 93/93, `--file-url` 93/93.
- **Mechanics campaign** (`TEST-CAMPAIGN.md`): a state fuzz of **118,732 random actions** over 4,000 random boards with every blocker; timeline replay, conservation, determinism and settle invariants all hold after every action.
- **Levels:** `check-levels` gives 0 errors. `balance` gives all 60 levels in band over 200 casual and 50 random games each.

| World | Band | Casual-bot win rate (mean, min–max) |
|---|---|---|
| W1 | 90–100% (spikes 70–80) | 91% (66–100) |
| W2 | 75–95% (55–75) | 81% (71–93) |
| W3 | 60–85% (40–65) | 75% (54–90) |
| W4 | 50–75% (30–55) | 58% (41–72) |
| W5 | 40–65% (20–45) | 52% (27–66) |
| W6 | 30–55% (15–35) | 42% (20–56) |

- **Performance** (real GPU, `t.frameCost`, desktop and mobile): about 1 ms main-thread task per frame while cascading, 60 fps, 14.5 MB heap, hooks ready in under 2.5 s. `index.html` is 1.16 MB; the art packs total 5.8 MB, loaded on demand (core 1.7 MB at boot).

## Visual quality: adversarial review loop
`reviews/` holds the protocol, rubric and briefs, adapted from Cart Racing. Two blind critics (a Claude subagent and Codex GPT-6.1 Sol) score each loop, a judge rules, and a tally ranks the backlog. HISTORY.md has the per-category table.

| Loop | Judged total | Claude / Codex |
|---|---|---|
| 0 | 45.5 / 80 | 44 / 47.5 |
| 1 | 48.0 | 47.5 / 51 |
| 2 | 51.5 | 52 / 50.5 |
| 3 | 52.0 | 52.5 / 52.5 |
| 4 | 52.0 | 52 / 52 |
| 5 | 52.0 | 51.5 / 53.5 |

The loop stopped after loop 5 for stagnation (no new best in two loops), which was also the six-loop budget. The final judged score is **52.0/80 (6.5/10)**. Authenticity passes its gate. The other seven categories sit at 6.0–6.5, under the 7 gate. Property-game's final harsh review was about 6.4/10. `VISUAL-REPORT.md` has the per-category table, what each loop changed and the remaining backlog.

## Known gaps
- **Nobody has listened to the audio or used a screen reader.** Both stay gaps until a human pass, as in the other games.
- **Balance is bot-measured.** The casual bot (70% greedy, 30% random) stands in for players. Human playtesting may move the World 5–6 bands.
- **Seven visual categories end at 6.0–6.5, below the 7 gate.** The judge's remaining backlog is in `VISUAL-REPORT.md`: phone layout, impact timing, lock clarity, crust and steam materials, map nodes, and piece finish. A few small fixes made after the loop stopped (score inset, "to go" score goals, Crystal shards, lose-dialog row) were tested but not re-scored.
- **9×9 boards on a 390 px phone** give 41 px cells, readable but tight (an accepted trade-off).

## Harness requests
- `t.contrastReport` treats CSS gradients as transparent. Gradient buttons needed a declared mid-tone `background-color` to be measured. A gradient-aware sample would remove the workaround.
- Real-GPU runs (`--gpu`) caught a crash that software GL hid (D10). Consider making `--gpu` part of the final milestone for WebGL games.

## Update: repainted backgrounds (v1.1.0, 2026-11-02)

The title painting and all six world backdrops (portrait and landscape) were repainted. They pack at WebP quality 0.6
(was 0.66) to stay inside the 6 MB asset budget. The new source PNGs replace the `art-src/art.json` sources
(git-ignored; the workspace keeps copies of the old and new paintings in `reference/backgrounds/`) and were packed
with the usual tools. Older descriptions of these paintings in VISUAL-REPORT.md refer to the previous art.

`npm test`: 99/99 passed.
