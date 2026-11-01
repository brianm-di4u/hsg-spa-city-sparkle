# Spa City Sparkle: code-sample survey

Survey date: 2026-11-01 (SESSION-BRIEF step B). Swap-and-match is a genre made famous by commercial titles,
so the brief's rule applies in full: **no code from clones of commercial titles**, only ideas. Every rule,
name and asset in this game is original. Nothing below was copied into `src/`; where an idea shaped a module,
that module's header comment names the sample. Third-party code, if ever downloaded for reading, lives in
`reference-samples/` (git-ignored, untrusted, never executed).

| # | Sample | License | Version seen | Reuse verdict |
|---|---|---|---|---|
| 1 | [PlaytestersKitchen/match-three-js](https://github.com/PlaytestersKitchen/match-three-js) | MIT | master, 156 commits (README read 2026-11-01) | Ideas only: board-logic API shape |
| 2 | [LibraStack/Match3-SDK](https://github.com/LibraStack/Match3-SDK) | MIT | master, 214 commits | Ideas only: pluggable fill strategies and sequence detectors |
| 3 | [tomcoolpxl/sugar-splat](https://github.com/tomcoolpxl/sugar-splat) | **none stated** | master | Reference only: blocker and goal taxonomy, combo list |
| 4 | [digitsensitive/phaser3-typescript](https://github.com/digitsensitive/phaser3-typescript) (`src/games/candy-crush`) | MIT | master, 689 commits | Not used: a clone of a commercial title |
| 5 | [jackz3/pixi-match3](https://github.com/jackz3/pixi-match3) | **none stated** | master, 10 commits | Reference only: Pixi project shape |
| 6 | [rembound/Match-3-Game-HTML5](https://github.com/rembound/Match-3-Game-HTML5/) | MIT | master | Not used: described as a clone of commercial titles |
| 7 | [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) | CC0 | 1.0.2 | **Asset reuse allowed**: soft particle textures, if the procedural ones fall short |
| 8 | [PixiJS v8](https://github.com/pixijs/pixijs) | MIT | pinned in `tools/build-vendor.mjs` | **Library**: renderer, vendored as a classic script |

## Notes per sample

**1. match-three-js.** It is a pure board engine (move, match, remove, refill, shuffle) that leaves turns and
stats to the game.
- Good: it separates logic from rendering, and a swap returns removal data for the view to animate. Initial
  boards have no matches but at least one move, and it shuffles when no move is left.
- Weak: it has no specials, blockers, holes or goals, and only vertical gravity.
- Foundation idea: the engine returns *what happened* and the view animates it. We take this further into a
  full event timeline (baseball's "resolve once, play back").

**2. Match3-SDK (Unity/C#).**
- Good: fill strategies are swappable (simple, fall down, slide down), detectors are pluggable sequence and
  special-item interfaces, and there is a tutorial on a stone blocker cleared by neighbouring matches.
- Weak: it is C#/Unity, depends on UniTask and DOTween, and has no diagonal refill or under-layer blockers.
- Foundation ideas: shape classification is its own step after run detection (`match.js`). Gravity is one
  deterministic routine with vertical and slide phases (`gravity.js`). Blocker damage is per layer.

**3. sugar-splat (Phaser 3, no license).** Read for ideas only. It is a broad catalogue of genre mechanics:
- 4/5/L/T specials, special+special combos, layered and spreading blockers, locks
- collect, clear-layer and drop-to-bottom goals, earned powerups
- Weak: no license, and it reuses a commercial title's mechanics vocabulary.
- Idea taken: the *checklist* of interactions to test (every combo pair, every blocker against every
  special). Our blocker set, names and combo effects are our own (MECHANICS.md).

**4 and 6.** These are permissively licensed, but both describe themselves as recreations of commercial
titles. The session brief bars code from clones, so neither is used.

**5. pixi-match3.** It is TypeScript + Pixi built with rollup, and has no license. It confirms a Pixi board
can stay simple: one container per layer, one sprite per tile. Nothing is copied.

**7. Kenney Particle Pack (CC0).** Soft blobs, sparks and smoke sprites. Steam and sparkle particles are
generated procedurally first; Kenney textures are a fallback, credited in REPORT.md if used.

**8. PixiJS v8.**
- Good: batched sprites, filters, a ticker that can be stopped (render on demand), and WebGL with a
  context-loss event.
- Rules from `shared/LESSONS.md`: textures come from data URIs (file:// taints WebGL), the library is
  vendored as a classic IIFE script, and init is async (`isIdle()` stays false until it resolves).

## Side-by-side: what becomes the foundation
| Concern | Taken from | Our version |
|---|---|---|
| Logic/view split | 1 | Pure `engine/` modules that Node can import; the view consumes a timeline |
| Shape classification | 2, 3 | Runs → union groups → classify (prism > burst > line) → placement rule |
| Gravity | 2 | Tick-based settle: vertical, then diagonal into cells with no supply, then spawn, then exits |
| Blocker layers | 2, 3 | fog → lock → stone/moss → tile → crust, at most one hit per cell per layer per wave |
| Interaction checklist | 3 | Combo matrix and blocker × special tests in `tests/` |
| Initial board / reshuffle | 1 | No initial matches, ≥ 1 move, Fisher–Yates, then a constructive recolour fallback |
| Determinism, solver | in-house (mahjong, block-puzzle) | Seeded RNG streams, Node bots, `check-levels.mjs`, `balance.mjs` |
