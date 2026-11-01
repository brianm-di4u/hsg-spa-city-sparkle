// Game façade: builds a level's starting state and applies player actions.
// The mutable holder G is exported (the inliner snapshots imports, so never reassign exports).
import { stateFromLevel, cloneState, hashState, newTile, TOKEN } from './grid.js';
import { makeRng, hash32 } from './rng.js';
import { fillInitial, hasMove, reshuffle } from './moves.js';
import { resolveNeeds, updateGoals } from './goals.js';
import { resolveSwap, resolveBooster, resolveEncore } from './resolve.js';

export const G = { state: null, level: null };

// A level with a token goal starts with one bath token in play (at its first token spawner), so the goal is
// visible from the first frame; the quota counts it.
function placeFirstToken(s) {
  if (!(s.tokens.total > 0) || s.tile.some((t) => t && t.k === TOKEN)) return;
  const at = s.spawner.findIndex((v, i) => v === 2 && s.tile[i] && s.lock[i] === 0 && s.fog[i] === 0);
  if (at < 0) return;
  s.tile[at] = newTile(s, TOKEN);
  s.tokens.spawned = 1; s.tokens.sinceSpawn = 0;
  if (!hasMove(s)) reshuffle(s);
}

export function newGame(level, seed = 1, opts = {}) {
  const { state: s, fill } = stateFromLevel(level);
  s.seed = seed;
  s.rng = makeRng(hash32(seed, level.id));
  fillInitial(s, fill);
  placeFirstToken(s);
  resolveNeeds(s);
  for (const g of s.goals) if (g.type === 'moss') g.start = s.moss.reduce((a, b) => a + b, 0);
  updateGoals(s);
  if (opts.boosters) Object.assign(s.boosters, opts.boosters);
  return s;
}

// action: {type:'swap', a, b} | {type:'booster', name, cell?, dir?} | {type:'encore'}
export function apply(s, action, opts = {}) {
  if (action.type === 'swap') return resolveSwap(s, action.a, action.b, opts);
  if (action.type === 'booster') return resolveBooster(s, action.name, action, opts);
  if (action.type === 'encore') return resolveEncore(s, opts);
  return { valid: false, reason: 'unknown', timeline: { v: 1, events: [], beats: 0 } };
}

export { cloneState, hashState };
