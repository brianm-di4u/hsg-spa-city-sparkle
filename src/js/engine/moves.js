// Legal moves, initial board fill, reshuffle and the safe recolour (MECHANICS §4.8).
// Idea credit: "no initial matches but at least one move" and auto-shuffle follow
// PlaytestersKitchen/match-three-js (MIT); no code is copied.
import { swappableAt, isColour, CRYSTAL } from './grid.js';
import { findGroups, runLengthsAt, matchable } from './match.js';
import { isSpecialTile } from './specials.js';
import { weighted, int } from './rng.js';

// True if swapping cells a and b is a legal move (would match, or is a special pair / crystal swap).
export function isLegalSwap(s, a, b) {
  if (!swappableAt(s, a) || !swappableAt(s, b)) return false;
  const ta = s.tile[a], tb = s.tile[b];
  if (ta.k === CRYSTAL || tb.k === CRYSTAL) return true;
  if (isSpecialTile(ta) && isSpecialTile(tb)) return true;
  if (ta.k === tb.k) return false;
  s.tile[a] = tb; s.tile[b] = ta;
  const ok = makesRun(s, a) || makesRun(s, b);
  s.tile[a] = ta; s.tile[b] = tb;
  return ok;
}
function makesRun(s, i) {
  if (!matchable(s, i)) return false;
  const [h, v] = runLengthsAt(s, i, s.tile[i].k);
  return h >= 3 || v >= 3;
}

export function legalMoves(s, limit = Infinity) {
  const out = [];
  for (let i = 0; i < s.tile.length && out.length < limit; i++) {
    if (!swappableAt(s, i)) continue;
    const x = i % s.w;
    if (x < s.w - 1 && isLegalSwap(s, i, i + 1)) out.push([i, i + 1]);
    if (out.length < limit && i + s.w < s.tile.length && isLegalSwap(s, i, i + s.w)) out.push([i, i + s.w]);
  }
  return out;
}
export const hasMove = (s) => legalMoves(s, 1).length > 0;

// Kinds that may appear (weight > 0).
const liveKinds = (s) => s.weights.map((w, k) => (w > 0 ? k : -1)).filter((k) => k >= 0);

// A kind for cell i that completes no run with the current neighbours, drawn from `stream`.
export function safeKind(s, i, stream = 'spawn') {
  const ok = liveKinds(s).filter((k) => { const [h, v] = runLengthsAt(s, i, k); return h < 3 && v < 3; });
  if (!ok.length) return weighted(s.rng, stream, s.weights);
  const w = ok.map((k) => s.weights[k]);
  return ok[weighted(s.rng, stream, w)];
}

// Fills the cells flagged in `fill` (initial board) so the board has no matches and >= 1 move.
export function fillInitial(s, fill) {
  const cells = [];
  fill.forEach((f, i) => { if (f && s.mask[i] && !s.stone[i] && !s.moss[i]) cells.push(i); });
  for (let attempt = 0; attempt < 50; attempt++) {
    for (const i of cells) s.tile[i] = null;
    for (const i of cells) s.tile[i] = { id: 0, k: safeKind(s, i), s: null };
    if (!findGroups(s).length && hasMove(s)) break;
  }
  for (const i of cells) s.tile[i].id = s.nextId++;
  if (findGroups(s).length || !hasMove(s)) recolour(s);
  return s;
}

// Moves tiles of the board around (Fisher-Yates over movable non-token tiles) until there are no
// matches and at least one move. Falls back to a constructive recolour. Returns {moves:[[id, cell]], mode}.
export function reshuffle(s) {
  const cells = [];
  s.tile.forEach((t, i) => { if (swappableAt(s, i) && (isColour(t) || t.k === CRYSTAL)) cells.push(i); });
  const tiles = cells.map((i) => s.tile[i]);
  for (let attempt = 0; attempt < 100; attempt++) {
    const order = tiles.slice();
    for (let j = order.length - 1; j > 0; j--) { const r = int(s.rng, 'misc', j + 1); [order[j], order[r]] = [order[r], order[j]]; }
    cells.forEach((c, j) => { s.tile[c] = order[j]; });
    if (!findGroups(s).length && hasMove(s)) {
      s.stats.reshuffles++;
      return { moves: cells.map((c) => [s.tile[c].id, c, s.tile[c].k]), mode: 'shuffle' };
    }
  }
  cells.forEach((c, j) => { s.tile[c] = tiles[j]; });
  recolour(s);
  s.stats.reshuffles++;
  return { moves: cells.map((c) => [s.tile[c].id, c, s.tile[c].k]), mode: 'recolor' };
}

// Constructive fallback: recolour plain tiles to have no runs, then plant one near-match.
export function recolour(s) {
  s.stats.recolors++;
  const plain = [];
  s.tile.forEach((t, i) => { if (isColour(t) && t.s == null && swappableAt(s, i)) plain.push(i); });
  for (const i of plain) s.tile[i].k = -1;
  for (const i of plain) s.tile[i].k = safeKind(s, i, 'misc');
  if (hasMove(s)) return true;
  // Plant: cells p, p+1 get kind K and q (diagonally next to p+2) gets K, so swapping q into p+2 makes a run.
  const kinds = liveKinds(s), isPlain = new Set(plain);
  for (const p of plain) {
    const x = p % s.w, y = (p / s.w) | 0;
    if (x + 2 >= s.w) continue;
    const p1 = p + 1, t2 = p + 2;
    for (const q of [y + 1 < s.h ? t2 + s.w : -1, y > 0 ? t2 - s.w : -1]) {
      if (q < 0 || !isPlain.has(p1) || !isPlain.has(q) || !swappableAt(s, t2)) continue;
      for (const K of kinds) {
        if (s.tile[t2].k === K) continue;
        const save = [s.tile[p].k, s.tile[p1].k, s.tile[q].k];
        s.tile[p].k = K; s.tile[p1].k = K; s.tile[q].k = K;
        if (!findGroups(s).length && hasMove(s)) return true;
        [s.tile[p].k, s.tile[p1].k, s.tile[q].k] = save;
      }
    }
  }
  return hasMove(s);
}
