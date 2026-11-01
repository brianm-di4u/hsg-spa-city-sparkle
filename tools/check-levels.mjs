#!/usr/bin/env node
// Structural and seeded checks for every level (PRD AC23, MECHANICS §10). Fails (exit 1) on any error.
//   node tools/check-levels.mjs [--seeds 100]
// 1. 60 levels, 10 per world, unique ids, ≤ 9×9, star thresholds strictly rising, 3–6 kinds, moves > 0
// 2. refill: with every movable piece removed, gravity + spawners must refill at least 65% of the board while
//    the blockers stand (walled-in cells refill once blockers break); no spawner sits under a lock or fog
// 3. initial boards over N seeds: no matches, ≥ 1 legal move, no recolour fallback
// 4. goals are reachable: the collect kind spawns, 'all' goals have something to clear, tokens can reach a drain
// 5. a short random-play run: no cascade hits the wave cap and recolour reshuffles stay under 1% of moves
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stateFromLevel, movableAt, playable, TOKEN } from '../src/js/engine/grid.js';
import { newGame } from '../src/js/engine/game.js';
import { findGroups } from '../src/js/engine/match.js';
import { hasMove, fillInitial } from '../src/js/engine/moves.js';
import { settle } from '../src/js/engine/gravity.js';
import { playLevel } from './bots.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const SEEDS = +(args.includes('--seeds') ? args[args.indexOf('--seeds') + 1] : 100);

export function checkLevels(levels, seeds = SEEDS) {
  const errors = [], warnings = [];
  const err = (id, m) => errors.push(`${id}: ${m}`), warn = (id, m) => warnings.push(`${id}: ${m}`);
  if (levels.length !== 60) errors.push(`expected 60 levels, found ${levels.length}`);
  const ids = new Set();
  for (let w = 1; w <= 6; w++) { const n = levels.filter((l) => l.world === w).length; if (n !== 10) errors.push(`world ${w} has ${n} levels`); }
  for (const L of levels) {
    if (ids.has(L.id)) err(L.id, 'duplicate id'); ids.add(L.id);
    const h = L.grid.cells.length, w = L.grid.cells[0].length;
    if (w > 9 || h > 9) err(L.id, `board ${w}×${h} is larger than 9×9`);
    if (!(L.moves > 0)) err(L.id, 'moves must be > 0');
    if (!L.stars || L.stars.length !== 3 || !(L.stars[0] < L.stars[1] && L.stars[1] < L.stars[2])) err(L.id, `stars must rise: ${L.stars}`);
    const kinds = Object.entries(L.weights || {}).filter(([, v]) => v > 0).map(([k]) => k);
    if (kinds.length < 3 || kinds.length > 6) err(L.id, `${kinds.length} kinds`);
    if (!L.goals.length) err(L.id, 'no goals');
    if (!L.band) warn(L.id, 'no difficulty band');

    // 2. refill
    {
      const { state: s, fill } = stateFromLevel(L);
      fillInitial(s, fill);
      for (let i = 0; i < s.tile.length; i++) if (s.tile[i] && movableAt(s, i)) s.tile[i] = null;
      s.tokens.total = 0;
      settle(s);
      const holes = [];
      for (let i = 0; i < s.tile.length; i++) if (playable(s, i) && !s.tile[i]) holes.push(`${i % s.w},${(i / s.w) | 0}`);
      // cells walled in under tufa or behind locks refill once those break (a "dam"); a board that is mostly
      // walled off, or spawners sitting on fixed pieces, starve the whole level
      const playableN = s.tile.filter((_, i) => playable(s, i)).length;
      const list = `${holes.slice(0, 6).join(' ')}${holes.length > 6 ? '…' : ''}`;
      if (holes.length > playableN * 0.35) err(L.id, `${holes.length}/${playableN} cells never refill while blockers stand: ${list}`);
      else if (holes.length) warn(L.id, `${holes.length} cells refill only after blockers break: ${list}`);
      for (let i = 0; i < s.spawner.length; i++) if (s.spawner[i] && (s.lock[i] || s.fog[i])) err(L.id, `spawner at ${i % s.w},${(i / s.w) | 0} sits under a lock or fog`);
    }
    // 4. goals
    const { state: s0 } = stateFromLevel(L);
    for (const g of L.goals) {
      if (g.type === 'collect' && !(s0.weights[g.kind] > 0)) err(L.id, `collect goal for kind ${g.kind} that never spawns`);
      if (g.type === 'crust' && !s0.crust.some(Boolean)) err(L.id, 'crust goal without crust');
      if (g.type === 'stone' && !s0.stone.some(Boolean)) err(L.id, 'stone goal without stone');
      if (g.type === 'lock' && !s0.lock.some(Boolean)) err(L.id, 'lock goal without locks');
      if (g.type === 'moss' && !s0.moss.some(Boolean)) err(L.id, 'moss goal without moss');
      if (g.type === 'tokens') {
        if (!(s0.tokens.total > 0)) err(L.id, 'token goal without tokens');
        if (!s0.spawner.some((v) => v === 2) && !s0.tile.some((t) => t && t.k === TOKEN)) err(L.id, 'token goal without a token spawner');
        // every token spawner reaches a drain moving down or diagonally down through non-stone cells
        for (let i = 0; i < s0.spawner.length; i++) {
          if (s0.spawner[i] !== 2) continue;
          const seen = new Set([i]), q = [i];
          let ok = false;
          while (q.length && !ok) {
            const c = q.shift();
            if (s0.exit[c]) { ok = true; break; }
            const x = c % s0.w, y = (c / s0.w) | 0;
            if (y + 1 >= s0.h) continue;
            for (const dx of [0, -1, 1]) {
              const nx = x + dx, n = (y + 1) * s0.w + nx;
              if (nx < 0 || nx >= s0.w || seen.has(n) || !s0.mask[n] || s0.stone[n] || s0.moss[n]) continue;
              seen.add(n); q.push(n);
            }
          }
          if (!ok) err(L.id, `token spawner at ${i % s0.w},${(i / s0.w) | 0} cannot reach a drain`);
        }
      }
    }
    // 3. initial boards
    let fallback = 0;
    for (let seed = 1; seed <= seeds; seed++) {
      const s = newGame(L, seed);
      if (findGroups(s).length) { err(L.id, `seed ${seed}: initial board has a match`); break; }
      if (!hasMove(s)) { err(L.id, `seed ${seed}: initial board has no move`); break; }
      if (s.stats.recolors) fallback++;
    }
    if (fallback) warn(L.id, `${fallback}/${seeds} initial boards needed the recolour fallback`);
    // 5. random play
    let capped = 0, recolors = 0, moves = 0;
    for (let seed = 1; seed <= 8; seed++) { const r = playLevel(L, 900 + seed, 'random'); capped += r.capped; recolors += r.recolors; moves += r.moves; }
    if (capped) err(L.id, `${capped} cascade(s) hit the wave cap`);
    if (moves && recolors / moves > 0.01) err(L.id, `recolour reshuffles ${(recolors / moves * 100).toFixed(1)}% of moves`);
  }
  return { errors, warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const levels = JSON.parse(fs.readFileSync(path.join(here, '..', 'data', 'levels.json'), 'utf8'));
  const t0 = Date.now();
  const { errors, warnings } = checkLevels(levels);
  for (const w of warnings) console.log('warn ', w);
  for (const e of errors) console.log('ERROR', e);
  console.log(`check-levels: ${levels.length} levels, ${errors.length} errors, ${warnings.length} warnings (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  process.exit(errors.length ? 1 : 0);
}
