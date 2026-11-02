// Special activation patterns and the special+special combo matrix (MECHANICS §4.3).
import { isColour, TOKEN, CRYSTAL } from './grid.js';

export const isSpecialTile = (t) => t != null && (t.k === CRYSTAL || (isColour(t) && t.s != null));

export function rowCells(s, y) { const o = []; for (let x = 0; x < s.w; x++) if (s.mask[y * s.w + x]) o.push(y * s.w + x); return o; }
export function colCells(s, x) { const o = []; for (let y = 0; y < s.h; y++) if (s.mask[y * s.w + x]) o.push(y * s.w + x); return o; }
export function diamond(s, i, r) {
  const cx = i % s.w, cy = (i / s.w) | 0, o = [];
  for (let y = Math.max(0, cy - r); y <= Math.min(s.h - 1, cy + r); y++)
    for (let x = Math.max(0, cx - r); x <= Math.min(s.w - 1, cx + r); x++)
      if (Math.abs(x - cx) + Math.abs(y - cy) <= r && s.mask[y * s.w + x]) o.push(y * s.w + x);
  return o;
}

// Most common colour on the board (ties: lowest kind), or -1.
export function commonColour(s) {
  const n = [0, 0, 0, 0, 0, 0];
  s.tile.forEach((t, i) => { if (isColour(t) && s.mask[i]) n[t.k]++; });
  let best = -1, bn = 0;
  n.forEach((c, k) => { if (c > bn) { bn = c; best = k; } });
  return best;
}
export function colourCells(s, k) {
  const o = [];
  s.tile.forEach((t, i) => { if (isColour(t) && t.k === k && s.mask[i]) o.push(i); });
  return o;
}

// Cells hit when the special tile t at cell i fires on its own (hit by a match or a blast).
export function patternOf(s, t, i, colour) {
  if (t.k === CRYSTAL) return [i, ...colourCells(s, colour != null ? colour : commonColour(s))];
  if (t.s === 'h') return rowCells(s, (i / s.w) | 0);
  if (t.s === 'v') return colCells(s, i % s.w);
  if (t.s === 'b' || t.s === 'B') return diamond(s, i, 2);
  return [i];
}

// Combo kind for a swap of tiles ta (moved from a) and tb (moved into b), or null.
export function comboKind(ta, tb) {
  if (!ta || !tb || ta.k === TOKEN || tb.k === TOKEN) return null;
  const ca = ta.k === CRYSTAL, cb = tb.k === CRYSTAL;
  if (ca && cb) return 'CC';
  if (ca || cb) {
    const other = ca ? tb : ta;
    if (other.s === 'h' || other.s === 'v') return 'CG';
    if (other.s === 'b') return 'CB';
    return 'Cx'; // crystal + plain colour tile
  }
  const g = (t) => t.s === 'h' || t.s === 'v', b = (t) => t.s === 'b';
  if (g(ta) && g(tb)) return 'GG';
  if ((g(ta) && b(tb)) || (b(ta) && g(tb))) return 'GB';
  if (b(ta) && b(tb)) return 'BB';
  if ((g(ta) || b(ta) || g(tb) || b(tb)) && isColour(ta) && isColour(tb)) return 'Sx'; // special + plain piece
  return null;
}

// Cells for the area combos centred on target cell b.
export function comboArea(s, kind, b) {
  const x = b % s.w, y = (b / s.w) | 0;
  const set = new Set();
  if (kind === 'GG') { rowCells(s, y).forEach((c) => set.add(c)); colCells(s, x).forEach((c) => set.add(c)); }
  if (kind === 'GB') {
    for (let d = -1; d <= 1; d++) {
      if (y + d >= 0 && y + d < s.h) rowCells(s, y + d).forEach((c) => set.add(c));
      if (x + d >= 0 && x + d < s.w) colCells(s, x + d).forEach((c) => set.add(c));
    }
  }
  if (kind === 'BB') diamond(s, b, 4).forEach((c) => set.add(c));
  if (kind === 'CC') s.mask.forEach((m, i) => { if (m) set.add(i); });
  return [...set].sort((p, q) => p - q);
}
