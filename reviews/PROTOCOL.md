# Adversarial review loop: protocol (Spa City Sparkle)

Adapted from `games/Cart Racing/reviews/PROTOCOL.md` (itself an improved version of football's). The loop is:
**build → test → capture → blind critiques → judge → tally → develop**. `RUBRIC.md` defines the scores and
`schema.json` the output shape.

## Roles
| Role | Who | Sees | Must not see |
|---|---|---|---|
| Critic A | Claude subagent, `briefs/critic.md` | this loop's captures, the rubric, the loop brief | prior scores, HISTORY.md, the other critic |
| Critic B | Codex (GPT-6.1 Sol) via `codex:codex-rescue`, `briefs/critic.md` + `briefs/codex-wrapper.md` | same as A | same as A |
| Judge | Claude subagent, `briefs/judge.md` | everything above plus HISTORY.md (trend only) and gates.json | — |

**The judge also plays prosecutor and advocate.** It must write, before ruling:
- the strongest case that each critic over-scored;
- the strongest case that each critic under-scored.

This replaces Cart Racing's separate prosecutor and advocate agents and keeps each loop to three reviewers.

**The developer** (the main session):
- writes `CHANGES.md` (facts only);
- opens every capture before the review;
- never edits a reviewer's output.

## Blindness
- The critics run in parallel. Their outputs reach `loop-N/critic-*.md` only after both have returned.
- Briefs carry no prior score and no opinion of quality.

## The loop (N = loop number)
1. Build: `node tools/build.mjs`.
2. Harness, all green: `node shared/test-harness/run.mjs "games/match-3 puzzle" --milestone loop-N`.
3. Capture on the real GPU:
   - `node shared/test-harness/run.mjs "games/match-3 puzzle" --file review --slow --gpu --milestone review-loop-N --clean`
   - then `python tools/review/compose.py screenshots/review-loop-N` (motion strips and sheets).
4. The developer opens every frame and strip, and writes `loop-N/CHANGES.md` and `loop-N/gates.json`.
5. `node tools/review/prep.mjs N` writes `loop-N/brief.md`.
6. Critics A and B in parallel (blind), then the judge (judge.md, ending with the final JSON block).
7. `node tools/review/tally.mjs N`:
   - validates every JSON block;
   - writes `scores.json`;
   - updates HISTORY.md and `history.json`;
   - applies the stop rule;
   - prints the ranked backlog.
8. Develop the backlog, then go to step 1 with N+1.

## Backlog
- **Priority** = expectedGain × weight ÷ effort, with effort S = 1, M = 2, L = 4.
- **Weight:** 1.5 below the gate, 1.0 at the gate, 0.3 once a category is 1 point above its gate.
- About 8 effort points per loop.

## Stop rule
- **Pass:** every gate is met (judge scores) and the measured gates pass.
- **Stagnation:** two loops in a row that don't beat the best total so far.
- **Budget cap:** 6 loops. On a stop, `VISUAL-REPORT.md` gets the final scores and the remaining ranked gaps.

## Effects allowed in the renderer
Only stateless effects, so captures stay deterministic:
- every particle and glow is a pure function of (event, progress);
- captures freeze the clock (`__game.act('clock', ms)`).
