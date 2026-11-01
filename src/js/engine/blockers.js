// Blocker damage and moss growth (MECHANICS §4.5).
import { neighbours4, isColour, TOKEN } from './grid.js';
import { int } from './rng.js';

export const SCORE = { tile: 60, cascade: 120, stone: 200, crystal: 300, layer: 100, moss: 80, fog: 40, token: 1000 };

// Applies one hit to cell i. Returns {layer, left, removed?:tile, pts}. Layer order:
// fog -> lock -> stone/moss -> tile (crust loses a layer when its tile is removed). Tokens are immune.
export function hitCell(s, i) {
  if (!s.mask[i]) return null;
  if (s.fog[i]) { s.fog[i] = 0; s.stats.fog++; return { layer: 'fog', left: 0, pts: SCORE.fog }; }
  if (s.lock[i]) { s.lock[i]--; s.stats.lock++; return { layer: 'lock', left: s.lock[i], pts: SCORE.layer }; }
  if (s.stone[i]) { s.stone[i]--; s.stats.stone++; return { layer: 'stone', left: s.stone[i], pts: SCORE.layer }; }
  if (s.moss[i]) { s.moss[i] = 0; s.stats.moss++; s.mossHitThisTurn = true; return { layer: 'moss', left: 0, pts: SCORE.moss }; }
  const t = s.tile[i];
  if (!t || t.k === TOKEN) return null;
  s.tile[i] = null;
  if (isColour(t) && t.k >= 0) s.stats.cleared[t.k]++;
  const r = { layer: 'tile', removed: t, pts: SCORE.tile };
  if (s.crust[i]) { s.crust[i]--; s.stats.crust++; r.crust = s.crust[i]; r.pts += SCORE.layer; }
  return r;
}

// Cells next to a matched group that adjacent damage reaches (stone, moss, fog).
export function adjacentTargets(s, cells, already) {
  const out = new Set();
  for (const c of cells) for (const n of neighbours4(s, c)) {
    if (already.has(n) || out.has(n)) continue;
    if (s.stone[n] || s.moss[n] || s.fog[n]) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

// End of turn: if no moss was hit, one moss cell grows into a plain neighbouring tile.
// Returns {from, to, removed} or null.
export function mossGrowth(s) {
  if (s.mossHitThisTurn) return null;
  const pairs = [];
  s.moss.forEach((m, i) => {
    if (!m || !s.mask[i]) return;
    for (const n of neighbours4(s, i)) {
      const t = s.tile[n];
      if (s.mask[n] && isColour(t) && t.s == null && !s.lock[n] && !s.fog[n] && !s.stone[n] && !s.moss[n]) pairs.push([i, n]);
    }
  });
  if (!pairs.length) return null;
  const [from, to] = pairs[int(s.rng, 'misc', pairs.length)];
  const removed = s.tile[to];
  s.tile[to] = null; s.moss[to] = 1;
  return { from, to, removed };
}
