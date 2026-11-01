// Gravity, refill and exits in deterministic ticks (MECHANICS §4.6).
// Idea credit: separate vertical-fall and slide phases follow the fill strategies in
// LibraStack/Match3-SDK (MIT); no code is copied.
import { playable, movableAt, newTile, TOKEN } from './grid.js';
import { weighted } from './rng.js';

// An empty playable cell is starved when nothing above it in its column can ever reach it.
function starved(s, j) {
  let k = j;
  for (;;) {
    if (s.spawner[k]) return false;
    k -= s.w;
    if (k < 0) return true;
    if (!s.mask[k] || s.stone[k] || s.moss[k]) return true;
    if (s.tile[k]) return !movableAt(s, k);
  }
}

const tokensOnBoard = (s) => s.tile.reduce((n, t) => n + (t && t.k === TOKEN ? 1 : 0), 0);

// Settles the board. Returns {paths:[{id, cells, ticks, spawn?}], spawned:[id], collected:[{id, at}], ticks}.
// Spawned tiles get spawn = {k, s} and their first cell is the spawner cell they appear in (entering from above).
export function settle(s) {
  const paths = new Map(), spawned = [], collected = [];
  const move = (from, to, tick) => {
    const t = s.tile[from];
    s.tile[to] = t; s.tile[from] = null;
    let p = paths.get(t.id);
    if (!p) { p = { id: t.id, cells: [from], ticks: [tick - 1] }; paths.set(t.id, p); }
    p.cells.push(to); p.ticks.push(tick);
  };
  let tick = 0;
  for (;;) {
    tick++;
    let changed = false;
    // 1. vertical: bottom-up so a whole column advances one cell per tick
    for (let y = s.h - 2; y >= 0; y--) for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x, j = i + s.w;
      if (movableAt(s, i) && playable(s, j) && s.tile[j] == null) { move(i, j, tick); changed = true; }
    }
    // 2. spawn into empty spawner cells
    for (let i = 0; i < s.tile.length; i++) {
      if (!s.spawner[i] || !playable(s, i) || s.tile[i] != null) continue;
      const T = s.tokens;
      let t;
      if (s.spawner[i] === 2 && T.spawned < T.total && T.sinceSpawn >= T.everyMoves && tokensOnBoard(s) < T.maxOnBoard) {
        t = newTile(s, TOKEN); T.spawned++; T.sinceSpawn = 0;
      } else {
        t = newTile(s, weighted(s.rng, 'spawn', s.weights));
      }
      s.tile[i] = t;
      paths.set(t.id, { id: t.id, cells: [i], ticks: [tick], spawn: true, tile: t });
      spawned.push(t.id);
      changed = true;
    }
    // 3. diagonal slides into starved cells, only once nothing fell or spawned this tick
    if (!changed) {
      for (let y = s.h - 1; y >= 1; y--) for (let x = 0; x < s.w; x++) {
        const j = y * s.w + x;
        if (!playable(s, j) || s.tile[j] != null || !starved(s, j)) continue;
        const ul = x > 0 ? j - s.w - 1 : -1, ur = x < s.w - 1 ? j - s.w + 1 : -1;
        const src = ul >= 0 && movableAt(s, ul) ? ul : ur >= 0 && movableAt(s, ur) ? ur : -1;
        if (src >= 0) { move(src, j, tick); changed = true; }
      }
    }
    // 4. exits collect resting tokens
    for (let i = 0; i < s.tile.length; i++) {
      const t = s.tile[i];
      if (t && t.k === TOKEN && s.exit[i]) {
        s.tile[i] = null; s.tokens.collected++;
        collected.push({ id: t.id, at: i, tick });
        changed = true;
      }
    }
    if (!changed) break;
    if (tick > 2000) throw new Error('settle did not terminate');
  }
  return { paths: [...paths.values()], spawned, collected, ticks: tick - 1 };
}
