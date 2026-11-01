// Shared helpers for the Node engine tests (not a test file itself).
import { boardFromAscii, toAscii, cloneState, hashState, playable, movableAt, TOKEN } from '../../src/js/engine/grid.js';
import { findGroups } from '../../src/js/engine/match.js';
import { resolveSwap, resolveBooster, resolveEncore } from '../../src/js/engine/resolve.js';
import { legalMoves, hasMove } from '../../src/js/engine/moves.js';
import { modelFromState, replay, diffModel } from '../../src/js/view/model.js';

export { boardFromAscii, toAscii, cloneState, hashState, findGroups, resolveSwap, resolveBooster, resolveEncore, legalMoves, hasMove };

export const B = (rows, opts = {}) => boardFromAscii(rows, { seed: 1, moves: 20, ...opts });
export const at = (s, x, y) => y * s.w + x;
export const swapXY = (s, a, b, opts) => resolveSwap(s, at(s, a[0], a[1]), at(s, b[0], b[1]), opts);
export const events = (r, t) => r.timeline.events.filter((e) => e.t === t);
export const tileAt = (s, x, y) => s.tile[at(s, x, y)];
export const countTiles = (s) => s.tile.filter(Boolean).length;

// After any resolve: board settled (no gravity move left), no matches, a move exists (or game over).
export function invariants(s, label = '') {
  const errs = [];
  if (findGroups(s).length) errs.push(`${label} matches remain`);
  for (let j = 0; j < s.tile.length; j++) {
    if (!playable(s, j) || s.tile[j]) continue;
    if (s.spawner[j]) errs.push(`${label} empty spawner ${j}`);
    const up = j - s.w;
    if (up >= 0 && movableAt(s, up)) errs.push(`${label} floating tile above ${j}`);
  }
  const ids = new Set();
  for (const t of s.tile) if (t) { if (ids.has(t.id)) errs.push(`${label} duplicate id ${t.id}`); ids.add(t.id); }
  for (const L of ['stone', 'crust', 'lock']) if (s[L].some((v) => v < 0)) errs.push(`${label} negative ${L}`);
  if (s.phase === 'play' && !hasMove(s)) errs.push(`${label} no legal move in play`);
  if (s.stats.capped) errs.push(`${label} cascade hit the wave cap`);
  if (s.tile.some((t) => t && t.s === 'B')) errs.push(`${label} primed Hot Stone left on the board`);
  return errs;
}

// Resolve with a timeline and check the timeline reducer reproduces the state.
export function checkedSwap(s, a, b) {
  const m = modelFromState(s);
  const r = resolveSwap(s, a, b);
  replay(m, r.timeline.events);
  return { r, diff: diffModel(m, s) };
}
export function replayDiff(pre, r, post) { const m = modelFromState(pre); replay(m, r.timeline.events); return diffModel(m, post); }

export function conservation(pre, r, post) {
  let removed = 0, spawned = 0, made = 0, gone = 0;
  for (const e of r.timeline.events) {
    if (e.t === 'hit' && e.layer === 'tile') removed++;
    if (e.t === 'special') made++;
    if (e.t === 'fall') for (const m of e.moves) if (m.spawn) spawned++;
    if (e.t === 'collect') gone++;
    if (e.t === 'spread') removed++;
  }
  return countTiles(pre) - removed + made + spawned - gone === countTiles(post);
}
export { TOKEN };
