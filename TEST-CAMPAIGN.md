# Spa City Sparkle: mechanics test campaign

Date 2026-11-01. A deliberate attempt to break the engine, level content and input, after the pattern of
`games/mahjong/TEST-CAMPAIGN.md`. Every defect found is in the DEV-PLAN defect log with its regression test.

## Coverage matrix
| Area | How | Scale | Result |
|---|---|---|---|
| Match shapes, special placement and orientation | `03-specials-node` table tests (3/4/5 in a row, L, T, +, a 5 with a cross, parallel runs, cascade-made Cascades) | 15 tests | pass |
| Combo matrix | `03-specials-node`: all 6 special pairs, plus Crystal with a plain piece | 7 tests | pass |
| Blockers, tokens, goals, Encore, lose, boosters | `06-blockers-node` | 9 tests | pass |
| Gravity: holes, stone, diagonal slides | `01-engine-node` crafted boards | 2 boards | pass |
| Invariants under random play on real level layouts | `01-engine-node` (open 9×9 and holed layouts) | 2,000 moves | pass |
| **State fuzz**: random layouts with every blocker, random specials, random moves and boosters | `15-statefuzz-node` (CI: 400 boards); campaign run with `FUZZ_SEEDS=4000` | **118,732 actions**, 37,470 multi-wave cascades, 14,499 specials, 1,527 tokens | pass after D11 |
| Timeline replay reproduces the engine state (the view can draw every change) | every random-play and fuzz action | as above | pass |
| Tile conservation, unique ids, no floating pieces, no matches left, a legal move or reshuffle | every action | as above | pass |
| Determinism: same seed and moves; JSON round trip | `01-engine-node`, fuzz every 5th action | thousands | pass |
| Level content: structure, refill, initial boards (40–100 seeds), goal reachability, token paths | `tools/check-levels.mjs`, `08-levels-node` | 60 levels | pass after D5, D6 |
| Difficulty: casual bot in band, random bot ≥ 15 points below, 3 stars reachable | `tools/balance.mjs` (200 + 50 seeds per level) | 15,000 games | all 60 in band |
| Lore facts trace to the audited bank | `tools/check-facts.mjs` | 60 cards | pass |
| Hit-testing: every playable cell on six layouts, real clicks and taps | `16-interaction` | 389 cells × 2 viewports | pass |
| Real input: mouse drag, tap-tap, touch swipe, keyboard play and menus | `04-input` | 7 tests | pass |
| Real-GPU rendering across world switches | `20-review --gpu` | 33 shots × 2 viewports | pass after D10 |
| Offline `file://` with art; vector fallback | `13-offline` | 2 tests | pass |
| Blocked storage, save and Continue, settings persistence | `09-progress` | 4 tests | pass |

## Findings
1. **D10, a real-GPU crash on world change.** Software GL in the default harness hid it. Real-GPU captures for the
   review loop found it.
2. **D11, an algae deadlock.** The fuzz drove algae across a whole board, leaving no possible move even after a
   reshuffle. Such a board now ends the level with its own message instead of freezing.
3. **D5, levels that starve themselves.** Bot tuning exposed layouts where fixed pieces (locks, fog) blocked every
   refill. It is now a `check-levels` rule.

## How to re-run
```bash
node shared/test-harness/run.mjs "games/match-3 puzzle" --slow
FUZZ_SEEDS=4000 node shared/test-harness/run.mjs "games/match-3 puzzle" --file statefuzz --slow
node "games/match-3 puzzle/tools/check-levels.mjs"
node "games/match-3 puzzle/tools/balance.mjs"
```
