# Spa City Sparkle: mechanics foundation

This file is the core-mechanics contract (SESSION-BRIEF step C), synthesized from the samples in
`SAMPLES.md`. Sections: architecture, game loop, state, engine rules, timeline, input, rendering, RNG,
saves, validation tools and hooks.

## 1. Architecture
```
src/index.html        classic scripts vendor/pixi.min.js + assets/art-data.js, module js/main.js
src/js/engine/        pure modules: no DOM, globals, Date or Math.random; Node imports them directly
  rng.js       mulberry32; streams {spawn, misc}, stored as uint32 in state
  grid.js      index math, neighbours, parseLevel(level) -> state, cloneState, hashState
  match.js     findRuns, groupRuns (union on shared cells), classify, placeSpecial
  specials.js  activation patterns, combo matrix
  blockers.js  applyHit(cell, source); damage to neighbours; end-of-turn moss spread
  gravity.js   settle(): vertical ticks, diagonal ticks, spawners, exits
  resolve.js   resolveSwap / resolveBooster / resolveEncore -> {state, timeline}; opts.fast skips events
  moves.js     legalMoves, hint ranking, reshuffle, initial board generator
  goals.js     goal progress, stars, phase (play/encore/won/lost)
  game.js      newGame(level, seed), apply(action); exports the mutable holder G
src/js/view/   stage, atlas, board-view, player (poseAt), fx, ambient
src/js/ui/     input, hud, screens, settings, save, hooks (window.__game)
src/js/audio.js
data/levels/w1..w6.txt -> tools/build-levels.mjs -> data/levels.json (@inline as LEVELS)
```
The inliner snapshots imports, so modules export mutable objects (`G`, `VIEW`, `SETTINGS`), never
reassigned `let`s.

## 2. Game loop and timing
- **Event driven, not a fixed tick.** Input produces an action. `game.apply(action)` resolves it at once
  into the authoritative state plus a **timeline** (baseball's "resolve once, play back"). The view plays
  the timeline, so input is locked while it plays, except for Skip.
- The Pixi ticker runs only while a timeline, a UI transition or a hint pulse plays. Ambient steam runs at
  most 30 fps on its own layer and is **excluded** from `isIdle()`. Settings can turn it off.
- Animation time comes from `VIEW.clock()`: `performance.now()` normally, and a frozen value after
  `act('clock', ms)` so test captures are deterministic.

## 3. State model (one JSON-safe object)
Per-cell data lives in flat arrays indexed `i = y*w + x` (y = 0 is the top row).
```js
{ v:1, levelId:'w2-07', w:9, h:9, seed,
  mask:[0|1],                      // 0 = hole (not part of the board)
  tile:[null | {id, k, s}],        // k: 0-5 colour, 'T' bath token (drop item), 'C' Spring Crystal
                                   // s: null | 'h' | 'v' (Cascade) | 'b' (Hot Stone)
  stone:[0-3], moss:[0|1], crust:[0-2], lock:[0-2], fog:[0|1],
  spawner:[0|1|2], exit:[0|1],     // spawner 2 also spawns bath tokens
  rng:{spawn, misc}, nextId,
  movesLeft, movesUsed, score, cascadeMax,
  goals:[{type, kind?, need, have}],
  tokens:{total, maxOnBoard, everyMoves, spawned, collected, sinceSpawn},
  mossHitThisTurn:false,
  boosters:{hammer, shuffle, line, plus5},
  phase:'play' | 'encore' | 'won' | 'lost', stars:0 }
```
A cell with stone or moss has no tile. A locked tile stays on the board but can't swap or fall. A fogged
tile can't match or move, and its kind is hidden.

## 4. Engine rules

### 4.1 Swap validity (`resolveSwap(s, a, b)`)
- `a` and `b` must be orthogonally adjacent. Both cells must hold a movable tile: present, unlocked,
  unfogged, not a token, and the cell has no stone or moss.
- Tokens never swap, so a Spring Crystal swaps only with a colour tile or another special.
- Any swap that moves a special (Cascade, Hot Stone or Spring Crystal) is legal, match or not (v1.0.1:
  phone players read a bounced special as broken).
- If the swap creates no match and moves no special, the timeline is
  `swap, swapBack`. No move is spent and the state is unchanged.

### 4.2 Match detection
1. A **matchable** cell holds a colour tile (k 0–5) and has no fog. Locked tiles are matchable.
2. Find every horizontal and vertical run of length ≥ 3 of the same kind.
3. **Group** runs that share at least one cell (union-find on cells). Runs that only touch side by side
   are separate groups.
4. **Classify** each group into at most one special:
   - Any run ≥ 5 makes a **Spring Crystal**.
   - Else a horizontal run crossing a vertical run (L, T or +) makes a **Hot Stone**.
   - Else a run of 4 makes a **Cascade**.
   - Else no special.
5. **Placement:**
   - The swapped cell, if it's in the group (the two swapped tiles differ in kind, so each lies in at most
     one group).
   - Else, for a Hot Stone, the run intersection nearest the group's centroid.
   - Else the middle of the longest run, at index ⌊(len−1)/2⌋.
   - Ties: bottom-most, then left-most.
   - If the chosen cell is locked (its tile survives the hit), try the next candidate; if none is left, no
     special is made.
6. **Cascade orientation:** a swap-made Cascade takes the swap axis (a horizontal swap gives `'h'`, which
   clears the row). A cascade-made Cascade is perpendicular to its run (a horizontal run gives `'v'`).
7. Specials are placed **after** the wave's hits are applied, so a group never destroys its own special.

### 4.3 Specials and the combo matrix
| Special | Fires on activation |
|---|---|
| Cascade `h` / `v` | every cell in its row / column |
| Hot Stone | a diamond of radius 2 around it (13 cells); it then **re-fires once** at the end of the next wave from its cell (the "aftershock"), wherever gravity moved it, with the same diamond |
| Spring Crystal + colour tile | every tile of that colour |
| Spring Crystal hit by a blast | the most common colour on the board (ties: lowest k) |

Combo matrix (swapping two specials; both are consumed):

| | Cascade | Hot Stone | Spring Crystal |
|---|---|---|---|
| **Cascade** | row + column through the target | 3 rows + 3 columns through the target | every tile of the Cascade's colour becomes a Cascade (orientation from `rng.misc`), then all fire in reading order |
| **Hot Stone** | — | a diamond of radius 4 | every tile of the Stone's colour becomes a Hot Stone, then all fire |
| **Spring Crystal** | — | — | every playable cell is hit once |

A Cascade or Hot Stone swapped with a plain colour tile (`Sx`) fires at the cell it lands on, with its own
pattern (a Cascade keeps its orientation). There is no `combo` event and `combo` is null in the result; any
match the swap makes resolves in the same wave, and the special still fires only once.

The **target** is the cell the player moved the piece into (`b`).

### 4.4 Wave loop
```
wave = 0
queue = combo activation (if any)
loop (wave ≤ 60):
  groups = findGroups(state)
  if no groups and queue empty: break
  hits  = cells of all groups (deduped)
  run the activation queue FIFO:
    each special fires; cells it hits join hits; a special it hits joins the queue
    `fired` is keyed by tile id, so each special fires once per resolve (except the Stone's aftershock)
  apply hits: at most 1 damage per cell per layer per wave
    layer order: fog → lock → stone/moss → tile removed → crust −1 (crust only when a tile was removed)
  match hits (not blasts) also damage orthogonally adjacent stone, moss and fog, once per blocker per wave
  score: base × min(wave+1, 8)
  place new specials from this wave's groups
  settle()
  wave++
if wave reaches 30: refills switch to "safe kinds" that never complete a run, which ends the loop
at the cap: log `capped` (fuzz asserts this never happens)
```
Scoring bases:

| Event | Points |
|---|---|
| tile cleared | 60 |
| special made: Cascade / Hot Stone / Crystal | 120 / 200 / 300 |
| stone, crust or lock layer | 100 |
| moss | 80 |
| fog | 40 |
| token collected | 1000 |

### 4.5 Blockers
| Blocker | Layer | Rules |
|---|---|---|
| Tufa stone | `stone` 1–3 | Fills the cell (no tile). Damaged by adjacent matches and by blasts, one layer per hit. Blocks gravity. |
| Mineral crust | `crust` 1–2 | Under a tile. Loses a layer when the tile above it is cleared. The "clear the crust" goal. |
| Padlocked safe | `lock` 1–2 | On a tile. The tile can match but can't swap or fall; a hit removes a lock layer and the tile survives. |
| Algae moss | `moss` 0/1 | Fills the cell. Cleared by one hit (adjacent match or blast). If no moss was hit during a turn, one moss cell chosen by `rng.misc` grows into an orthogonal neighbour holding a plain, unlocked colour tile. |
| Steam fog | `fog` 0/1 | On a tile. The tile is hidden and can't match or move. One hit (adjacent match or blast) clears the fog only. |
| Bath token | tile `k:'T'` | Immune to hits, falls like a tile, collected when it rests on an exit cell. |

### 4.6 Gravity (`settle`)
Deterministic ticks. Each tick:
1. **Vertical:** scan bottom-up, left-to-right. A movable tile above an empty playable cell drops one
   cell. Holes, stone, moss, and locked or fogged tiles are fixed: tiles stop on them and never fall
   through a hole. Cells below such an obstacle are filled by diagonal slides (step 2).
2. **Diagonal**, only if no vertical move happened this tick. An empty cell is **starved** if no spawner
   or movable tile sits above it in the same unbroken column segment. A starved cell takes a tile from up
   and to the left first, then up and to the right.
3. **Spawn:**
   - Every empty spawner cell receives a new tile entering from above, its kind drawn from `rng.spawn`
     with the level weights.
   - A spawner-2 cell spawns a token instead when `onBoard < maxOnBoard && spawned < total &&
     sinceSpawn ≥ everyMoves`.
4. **Exits:** a token resting on an exit cell is collected, which frees the cell.
5. Repeat until a tick makes no moves and no spawns.

Each tile records its path, and the view merges consecutive vertical steps into one fall.

### 4.7 End of turn
In this order:
1. Moss spreads (if no moss was hit this turn).
2. Token spawn bookkeeping.
3. Goal update.
4. **Win:** all goals met. If moves are left, the **Encore** follows: each remaining move turns a random
   colour tile into a Cascade and fires it. Encore score is shown separately and **does not** count toward
   stars.
5. **Lose:** `movesLeft == 0` with goals unmet. The offer "+5 moves" uses a booster if the player owns one.
6. **Move check:** if no legal move exists, reshuffle.

### 4.8 Reshuffle, initial board, hint
- **Initial board:** fixed cells from the level, then a fill in reading order, each kind drawn from
  `rng.spawn` while avoiding a kind that would complete a run. This repeats until the board has ≥ 1 legal
  move (at most 50 tries; otherwise the constructive fallback below).
- **Reshuffle:** Fisher–Yates (`rng.misc`) over movable non-token tiles, accepted when the board has no
  matches and ≥ 1 move. After 100 attempts, a **constructive recolour**: plant a 3-cell near-match, then
  fill greedily with no runs. Event: `reshuffle{mode}`.
- **Hint:** after 5 s of idle play, the best legal move pulses. Moves are ranked by goal progress, then
  specials, then score, using a cloned RNG (never the live one).

### 4.9 Boosters
| Booster | Effect | Costs a move? |
|---|---|---|
| Hammer | hits one cell (all layers once) | no |
| Shuffle | forced reshuffle | no |
| Line | fires a row or column chosen by the player | no |
| +5 moves | only on the out-of-moves offer or before a level | no |

Boosters are earned: 1 for each new 3-star level, plus world-completion rewards. They are never bought.

## 5. Timeline format
```js
{ v:1, move:{a,b}|{booster}, valid, events:[{beat, t, ...}], hash }
// t: swap{a,b,ids} swapBack combo{a,b,kind} wave{n} match{cells,group,shape}
//    special{id,at,s,k} fire{id,at,s,cells} hit{i,layer,left} clear{ids}
//    score{pts,at,mult} fall{moves:[{id,path:[[x,y,tick]]}]} spawn{tiles:[{id,k,s,at}]}
//    collect{id,at} spread{from,to} reshuffle{moves,mode} goal{key,have} encore{n} end{result}
```
Events with the same `beat` start together. `player.js` gives each beat a duration:

| Event | Duration |
|---|---|
| swap | 140 ms |
| match / clear | 180 ms |
| fire | 200 ms + 12 ms per cell of distance |
| fall | 55 ms per cell, eased |
| reshuffle | 450 ms |

Score pop-ups never block. `poseAt(timeline, ms)` is pure. Skip (tap, Esc or `act('skip')`) jumps to the
end. Reduced motion scales durations by 0.35 and drops shake and particles; falls become short slides.
At the end of every timeline the view **snaps to the authoritative state** (sprite ids are matched).

## 6. Input
- **Pointer drag:** press a tile, then move ≥ 0.3 tile in a direction to swap. Touch acts on
  `pointermove` past the threshold and on `pointerup` (LESSONS: no `click` after a touch drag).
- **Tap-tap:** tap selects; tapping an adjacent tile swaps; tapping elsewhere moves the selection.
- **Keyboard:** arrows move a visible cursor. Space or Enter selects; an arrow then swaps in that
  direction. Esc cancels or skips. `H` hint, `B` boosters, `P` pause.
- Input is locked while a timeline plays, except Skip.

## 7. Rendering
- PixiJS v8 `Application` (`preference:'webgl'`, `autoStart:false`, `resolution: min(devicePixelRatio,
  2)`) in a canvas under the DOM UI.
- Layers, bottom to top: painted backdrop, board frame and cells, crust, tiles (sorted by row), locks,
  fog, FX (particles, beams), score pop-ups. The HUD is DOM.
- Textures: sprites rendered in Blender, packed into atlases, loaded from `assets/art-data.js` data URIs
  (file:// safe). A vector fallback draws placeholder shapes (`?art=0`) and is used until art loads, but
  `isIdle()` stays false while art is loading.
- `webglcontextlost` → pause and rebuild textures on restore.

## 8. RNG
mulberry32 with two streams stored in state: `spawn` (refills, initial board) and `misc` (reshuffle, moss,
Encore, combo orientations). Bots and hints clone the state (and its RNG) before lookahead. Fair lookahead
reseeds the clone's `spawn` stream with `hash(seed, movesUsed, candidateIndex)`.

## 9. Save format
`localStorage['spa-city-sparkle:v1']` (every access in try/catch):
```js
{ v:1, settings:{sound, music, volume, motion:'auto'|'reduced'|'full', steam:true, hints:true, colorblind:false},
  progress:{ 'w1-01':{stars, best}, ... }, boosters:{...}, lore:['id',...], tutorialSeen:[...],
  current: null | {state} }   // the in-progress level, for Continue
```

## 10. Validation tools
- `tools/check-levels.mjs`: structural and seeded checks (§DEV-PLAN), which fail the build.
- `tools/balance.mjs`: Monte Carlo bots (random, greedy-score, greedy-goal) using `worker_threads`.
- `tools/fuzz.mjs`: random legal play with invariants.

## 11. `window.__game` hooks
See DEV-PLAN §3 for the exact spec.
