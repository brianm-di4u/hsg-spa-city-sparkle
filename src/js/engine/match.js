// Run detection, grouping and special classification (MECHANICS §4.2).
// Idea credit: shape classification as a separate step after run detection follows the
// sequence/special-detector split in LibraStack/Match3-SDK (MIT); no code is copied.
import { isColour } from './grid.js';

export const matchable = (s, i) => s.mask[i] === 1 && s.fog[i] === 0 && isColour(s.tile[i]) && s.tile[i].s !== 'B';

// All horizontal and vertical runs of >= 3 matchable tiles of one kind: [{dir, k, cells:[i...]}].
export function findRuns(s) {
  const runs = [];
  const scan = (dir) => {
    const outer = dir === 'h' ? s.h : s.w, inner = dir === 'h' ? s.w : s.h;
    for (let o = 0; o < outer; o++) {
      let start = 0;
      while (start < inner) {
        const i0 = dir === 'h' ? o * s.w + start : start * s.w + o;
        if (!matchable(s, i0)) { start++; continue; }
        const k = s.tile[i0].k;
        let end = start + 1;
        while (end < inner) {
          const i = dir === 'h' ? o * s.w + end : end * s.w + o;
          if (!matchable(s, i) || s.tile[i].k !== k) break;
          end++;
        }
        if (end - start >= 3) {
          const cells = [];
          for (let j = start; j < end; j++) cells.push(dir === 'h' ? o * s.w + j : j * s.w + o);
          runs.push({ dir, k, cells });
        }
        start = end;
      }
    }
  };
  scan('h'); scan('v');
  return runs;
}

// Runs sharing at least one cell form one group. Returns [{k, cells:[...], runs:[...], type}],
// type: 'C' (Spring Crystal), 'b' (Hot Stone), 'g' (Cascade) or null.
export function findGroups(s) {
  const runs = findRuns(s);
  if (!runs.length) return [];
  const parent = runs.map((_, i) => i);
  const find = (a) => (parent[a] === a ? a : (parent[a] = find(parent[a])));
  const owner = new Map();
  runs.forEach((r, ri) => r.cells.forEach((c) => {
    if (owner.has(c)) parent[find(ri)] = find(owner.get(c)); else owner.set(c, ri);
  }));
  const byRoot = new Map();
  runs.forEach((r, ri) => {
    const root = find(ri);
    if (!byRoot.has(root)) byRoot.set(root, []);
    byRoot.get(root).push(r);
  });
  const groups = [];
  for (const rs of byRoot.values()) {
    const set = new Set();
    rs.forEach((r) => r.cells.forEach((c) => set.add(c)));
    const maxLen = Math.max(...rs.map((r) => r.cells.length));
    const crossed = rs.some((r) => r.dir === 'h') && rs.some((r) => r.dir === 'v');
    const type = maxLen >= 5 ? 'C' : crossed ? 'b' : maxLen === 4 ? 'g' : null;
    groups.push({ k: rs[0].k, cells: [...set].sort((a, b) => a - b), runs: rs, type });
  }
  // Deterministic order: by first cell.
  groups.sort((a, b) => a.cells[0] - b.cells[0]);
  return groups;
}

// Ordered candidate cells for a group's special (MECHANICS §4.2 step 5).
export function specialCandidates(s, g, swapCells) {
  const out = [], seen = new Set();
  const push = (c) => { if (!seen.has(c)) { seen.add(c); out.push(c); } };
  // Prefer the cell the player moved a piece into (b), then the other swapped cell.
  for (const c of swapCells || []) if (g.cells.includes(c)) push(c);
  const xy = (c) => [c % s.w, (c / s.w) | 0];
  const tieSort = (arr) => arr.sort((a, b) => (xy(b)[1] - xy(a)[1]) || (xy(a)[0] - xy(b)[0]));
  if (g.type === 'b') {
    const h = new Set(), v = new Set();
    g.runs.forEach((r) => r.cells.forEach((c) => (r.dir === 'h' ? h : v).add(c)));
    const inter = [...h].filter((c) => v.has(c));
    let cx = 0, cy = 0;
    g.cells.forEach((c) => { cx += xy(c)[0]; cy += xy(c)[1]; });
    cx /= g.cells.length; cy /= g.cells.length;
    const d = (c) => Math.abs(xy(c)[0] - cx) + Math.abs(xy(c)[1] - cy);
    tieSort(inter).sort((a, b) => d(a) - d(b)).forEach(push);
  }
  const longest = g.runs.slice().sort((a, b) => b.cells.length - a.cells.length || a.cells[0] - b.cells[0])[0];
  push(longest.cells[Math.floor((longest.cells.length - 1) / 2)]);
  tieSort(g.cells.slice()).forEach(push);
  return out;
}

// Length of the run through cell i in each direction, as if tile kind k were at i (k may be undefined to use the board).
export function runLengthsAt(s, i, k) {
  const x = i % s.w, y = (i / s.w) | 0;
  const kindAt = (j) => (j === i ? k : matchable(s, j) ? s.tile[j].k : -1);
  if (k == null || k < 0) return [0, 0];
  let h = 1, v = 1;
  for (let xx = x - 1; xx >= 0 && kindAt(y * s.w + xx) === k; xx--) h++;
  for (let xx = x + 1; xx < s.w && kindAt(y * s.w + xx) === k; xx++) h++;
  for (let yy = y - 1; yy >= 0 && kindAt(yy * s.w + x) === k; yy--) v++;
  for (let yy = y + 1; yy < s.h && kindAt(yy * s.w + x) === k; yy++) v++;
  return [h, v];
}
