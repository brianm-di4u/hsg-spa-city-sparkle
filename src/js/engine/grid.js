// Board geometry, state construction from level data or test ASCII, cloning and hashing.
// State shape: MECHANICS.md §3. Cells are flat arrays indexed i = y*w + x, y = 0 at the top.
import { makeRng, hash32 } from './rng.js';

export const KINDS = 'abcdef';           // a quartz, b magnolia, c horseshoe, d thermal drop, e scallop, f pine
export const TOKEN = 'T';                 // bath token (drop item)
export const CRYSTAL = 'C';               // Spring Crystal

export const isColour = (t) => t != null && typeof t.k === 'number';

export function emptyState(w, h) {
  const n = w * h, z = () => new Array(n).fill(0);
  return {
    v: 1, levelId: null, w, h, seed: 0,
    mask: new Array(n).fill(1), tile: new Array(n).fill(null),
    stone: z(), moss: z(), crust: z(), lock: z(), fog: z(), spawner: z(), exit: z(),
    rng: makeRng(0), nextId: 1,
    movesLeft: 20, movesUsed: 0, score: 0, encoreScore: 0, cascadeMax: 0,
    goals: [], weights: [1, 1, 1, 1, 1, 1],
    tokens: { total: 0, maxOnBoard: 1, everyMoves: 3, spawned: 0, collected: 0, sinceSpawn: 99 },
    stats: { cleared: [0, 0, 0, 0, 0, 0], crust: 0, stone: 0, moss: 0, lock: 0, fog: 0, specials: 0, reshuffles: 0, recolors: 0, capped: 0 },
    mossHitThisTurn: false,
    boosters: { hammer: 0, shuffle: 0, line: 0, plus5: 0 },
    stars: [0, 0, 0], starsWon: 0, phase: 'play', mode: 'journey',
  };
}

export const idx = (s, x, y) => y * s.w + x;
export const xOf = (s, i) => i % s.w;
export const yOf = (s, i) => (i / s.w) | 0;
export const inside = (s, x, y) => x >= 0 && y >= 0 && x < s.w && y < s.h;

export function neighbours4(s, i) {
  const x = xOf(s, i), y = yOf(s, i), out = [];
  if (y > 0) out.push(i - s.w);
  if (x > 0) out.push(i - 1);
  if (x < s.w - 1) out.push(i + 1);
  if (y < s.h - 1) out.push(i + s.w);
  return out;
}

// A playable cell can hold a tile: on the board and not filled by stone or moss.
export const playable = (s, i) => s.mask[i] === 1 && s.stone[i] === 0 && s.moss[i] === 0;
// A tile that gravity and swaps may move.
export const movableAt = (s, i) => {
  const t = s.tile[i];
  return t != null && s.lock[i] === 0 && s.fog[i] === 0 && s.mask[i] === 1;
};
// A tile the player may pick up and swap.
export const swappableAt = (s, i) => movableAt(s, i) && s.tile[i].k !== TOKEN && s.tile[i].s !== 'B';

export function newTile(s, k, sp = null) { return { id: s.nextId++, k, s: sp }; }

export function cloneState(s) { return JSON.parse(JSON.stringify(s)); }

export function hashState(s) {
  const t = s.tile.map((x) => (x ? `${x.k}${x.s || ''}` : '-')).join(',');
  return hash32(t, s.stone.join(''), s.moss.join(''), s.crust.join(''), s.lock.join(''), s.fog.join(''),
    s.movesLeft, s.score, s.rng.spawn, s.rng.misc, s.phase, s.tokens.collected);
}

function defaultFlow(s, wantExits) {
  for (let x = 0; x < s.w; x++) {
    let top = -1, bottom = -1;
    for (let y = 0; y < s.h; y++) if (s.mask[idx(s, x, y)]) { if (top < 0) top = y; bottom = y; }
    if (top >= 0) s.spawner[idx(s, x, top)] = 1;
    if (wantExits && bottom >= 0) s.exit[idx(s, x, bottom)] = 1;
  }
}

// Level data (built by tools/build-levels.mjs) -> state with fixed cells set and other cells empty.
// Random cells are marked in `fill` (true = generate). See data/levels/README.md for the format.
export function stateFromLevel(L) {
  const g = L.grid, rows = g.cells, h = rows.length, w = rows[0].length;
  const s = emptyState(w, h);
  s.levelId = L.id;
  s.movesLeft = L.moves == null ? null : L.moves;
  s.goals = (L.goals || []).map((gl) => ({ ...gl, have: 0 }));
  s.stars = L.stars ? L.stars.slice() : [0, 0, 0];
  s.weights = KINDS.split('').map((c) => (L.weights && L.weights[c] != null ? L.weights[c] : (L.weights ? 0 : 1)));
  if (L.tokens) Object.assign(s.tokens, { total: L.tokens.total || 0, maxOnBoard: L.tokens.max || 1, everyMoves: L.tokens.every || 3 });
  if (L.mode) s.mode = L.mode;
  const fill = new Array(w * h).fill(false);
  const layer = (name) => (g[name] ? g[name] : null);
  const block = layer('block'), under = layer('under'), top = layer('top'), flow = layer('flow');
  let anyFlow = false;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, c = rows[y][x];
    if (c === '#') { s.mask[i] = 0; continue; }
    const b = block ? block[y][x] : '.';
    if (b >= '1' && b <= '3') s.stone[i] = +b;
    else if (b === 'm') s.moss[i] = 1;
    const u = under ? under[y][x] : '.';
    if (u === '1' || u === '2') s.crust[i] = +u;
    const tp = top ? top[y][x] : '.';
    if (tp === 'l') s.lock[i] = 1; else if (tp === 'L') s.lock[i] = 2; else if (tp === 'f') s.fog[i] = 1;
    const f = flow ? flow[y][x] : '.';
    if (f === 'v') { s.spawner[i] = 1; anyFlow = true; } else if (f === 'x') { s.spawner[i] = 2; anyFlow = true; } else if (f === 'e') { s.exit[i] = 1; anyFlow = true; }
    if (s.stone[i] || s.moss[i]) continue;
    const k = KINDS.indexOf(c);
    if (k >= 0) s.tile[i] = newTile(s, k);
    else if (c === 'T') s.tile[i] = newTile(s, TOKEN);
    else if (c === 'C') s.tile[i] = newTile(s, CRYSTAL);
    else fill[i] = true;
  }
  if (!anyFlow) defaultFlow(s, s.tokens.total > 0);
  else if (!s.spawner.some(Boolean)) defaultFlow(s, false);
  if (s.tokens.total > 0 && !s.exit.some(Boolean)) {
    for (let x = 0; x < w; x++) for (let y = h - 1; y >= 0; y--) if (s.mask[y * w + x]) { s.exit[y * w + x] = 1; break; }
  }
  s.tokens.spawned = s.tile.filter((t) => t && t.k === TOKEN).length;
  s.tokens.sinceSpawn = s.tokens.everyMoves;
  return { state: s, fill };
}

// Test boards: rows of space-separated cell tokens. Grammar:
//   base  #  hole | .  empty | ?  random | a-f colour (+H/V/B special) | C crystal | T token | S1-3 stone | M moss
//   mods  ^1 ^2 crust | L1 L2 lock | F fog | > spawner | >> token spawner | _ exit
// Without any '>' the top playable cell of each column becomes a spawner.
const TOK = /^(#|\.|\?|[a-f][HVB]?|C|T|S[1-3]|M)((?:\^[12]|L[12]|F|>>|>|_)*)$/;
export function boardFromAscii(rows, opts = {}) {
  const grid = rows.map((r) => r.trim().split(/\s+/));
  const h = grid.length, w = grid[0].length;
  const s = emptyState(w, h);
  const fill = new Array(w * h).fill(false);
  let anySpawner = false;
  for (let y = 0; y < h; y++) {
    if (grid[y].length !== w) throw new Error(`row ${y} has ${grid[y].length} cells, expected ${w}`);
    for (let x = 0; x < w; x++) {
      const i = y * w + x, m = TOK.exec(grid[y][x]);
      if (!m) throw new Error(`bad cell token "${grid[y][x]}" at ${x},${y}`);
      const [, base, mods] = m;
      if (base === '#') { s.mask[i] = 0; continue; }
      if (base[0] === 'S') s.stone[i] = +base[1];
      else if (base === 'M') s.moss[i] = 1;
      else if (base === 'C') s.tile[i] = newTile(s, CRYSTAL);
      else if (base === 'T') s.tile[i] = newTile(s, TOKEN);
      else if (base === '?') fill[i] = true;
      else if (base !== '.') s.tile[i] = newTile(s, KINDS.indexOf(base[0]), { H: 'h', V: 'v', B: 'b' }[base[1]] || null);
      for (const mm of mods.match(/\^[12]|L[12]|F|>>|>|_/g) || []) {
        if (mm[0] === '^') s.crust[i] = +mm[1];
        else if (mm[0] === 'L') s.lock[i] = +mm[1];
        else if (mm === 'F') s.fog[i] = 1;
        else if (mm === '>>') { s.spawner[i] = 2; anySpawner = true; }
        else if (mm === '>') { s.spawner[i] = 1; anySpawner = true; }
        else if (mm === '_') s.exit[i] = 1;
      }
    }
  }
  if (!anySpawner && opts.spawners !== false) defaultFlow(s, false);
  if (opts.moves !== undefined) s.movesLeft = opts.moves;
  if (opts.seed !== undefined) { s.seed = opts.seed; s.rng = makeRng(opts.seed); }
  if (opts.weights) s.weights = opts.weights.slice();
  if (opts.goals) s.goals = opts.goals.map((g) => ({ ...g, have: 0 }));
  return opts.withFill ? { state: s, fill } : s;
}

// Compact text dump of a board (inverse of boardFromAscii for tiles and layers), for test messages.
export function toAscii(s) {
  const out = [];
  for (let y = 0; y < s.h; y++) {
    const row = [];
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      if (!s.mask[i]) { row.push('#'); continue; }
      let c;
      if (s.stone[i]) c = 'S' + s.stone[i];
      else if (s.moss[i]) c = 'M';
      else {
        const t = s.tile[i];
        c = !t ? '.' : t.k === TOKEN ? 'T' : t.k === CRYSTAL ? 'C' : KINDS[t.k] + (t.s ? t.s.toUpperCase() : '');
      }
      if (s.crust[i]) c += '^' + s.crust[i];
      if (s.lock[i]) c += 'L' + s.lock[i];
      if (s.fog[i]) c += 'F';
      row.push(c);
    }
    out.push(row.join(' '));
  }
  return out;
}
