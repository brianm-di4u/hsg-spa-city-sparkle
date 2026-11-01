// Resolves a player action into the new authoritative state plus an event timeline (MECHANICS §4-5).
// "Resolve once, play back": the view animates the timeline; tests assert on it.
import { isColour, playable, newTile, swappableAt, CRYSTAL, TOKEN } from './grid.js';
import { findGroups, specialCandidates } from './match.js';
import { patternOf, isSpecialTile, comboKind, comboArea, rowCells, colCells } from './specials.js';
import { hitCell, adjacentTargets, mossGrowth, SCORE } from './blockers.js';
import { settle } from './gravity.js';
import { isLegalSwap, hasMove, reshuffle, safeKind } from './moves.js';
import { updateGoals, allDone, starsFor } from './goals.js';
import { next, int } from './rng.js';

export const MAX_WAVES = 60;
export const SAFE_WAVE = 30;

class Timeline {
  constructor(fast) { this.fast = !!fast; this.events = []; this.beat = 0; }
  push(t, data) { if (!this.fast) this.events.push({ beat: this.beat, t, ...data }); }
  next() { this.beat++; }
  out(extra) { return { v: 1, events: this.events, beats: this.beat + 1, ...extra }; }
}

function newCtx(swapCells, axis) {
  return { swapCells, axis, fired: new Set(), primed: [], queue: [], initialHits: null, wave: 0, waves: 0 };
}

const adjacent = (s, a, b) => {
  if (a < 0 || b < 0 || a >= s.tile.length || b >= s.tile.length) return false;
  const ax = a % s.w, bx = b % s.w;
  return (Math.abs(a - b) === 1 && ((a / s.w) | 0) === ((b / s.w) | 0)) || (Math.abs(a - b) === s.w && ax === bx);
};

// --- the wave loop -----------------------------------------------------------------------------
function runWaves(s, ctx, tl) {
  for (let w = 0; ; w++) {
    ctx.wave = w;
    const groups = findGroups(s);
    const queue = ctx.queue; ctx.queue = [];
    const after = ctx.primed; ctx.primed = [];
    const initial = ctx.initialHits; ctx.initialHits = null;
    if (!groups.length && !queue.length && !after.length && !initial) break;
    if (w >= MAX_WAVES) { s.stats.capped++; break; }
    const mult = Math.min(w + 1, 8);
    ctx.waves = w + 1;
    tl.push('wave', { n: w, mult });

    const hits = new Set(), order = [];
    const addHit = (c) => { if (!hits.has(c)) { hits.add(c); order.push(c); } };
    const pending = [];
    for (const id of after) {
      const c = s.tile.findIndex((t) => t && t.id === id);
      if (c >= 0) pending.push({ cell: c, id, after: true });
    }
    pending.push(...queue);
    if (initial) initial.forEach(addHit);
    const matchCells = [];
    for (const g of groups) {
      tl.push('match', { cells: g.cells, k: g.k, shape: g.type });
      g.cells.forEach((c) => { addHit(c); matchCells.push(c); });
    }
    adjacentTargets(s, matchCells, hits).forEach(addHit);

    const keep = new Set();
    let oi = 0;
    const consider = (c) => {
      const t = s.tile[c];
      if (t && isSpecialTile(t) && !s.fog[c] && !s.lock[c] && !ctx.fired.has(t.id)) pending.push({ cell: c, id: t.id });
    };
    for (;;) {
      while (oi < order.length) consider(order[oi++]);
      if (!pending.length) break;
      const job = pending.shift();
      const t = s.tile[job.cell];
      if (!t || (job.id != null && t.id !== job.id)) continue;
      if (!job.after && ctx.fired.has(t.id)) continue;
      ctx.fired.add(t.id);
      const cells = patternOf(s, t, job.cell, job.colour);
      tl.push('fire', { id: t.id, at: job.cell, s: t.k === CRYSTAL ? 'C' : t.s, cells, after: !!job.after });
      cells.forEach(addHit);
      if (t.s === 'b' && !job.after) { t.s = 'B'; keep.add(job.cell); ctx.primed.push(t.id); }
    }

    let pts = 0;
    for (const c of order) {
      if (keep.has(c)) continue;
      const r = hitCell(s, c);
      if (!r) continue;
      pts += r.pts;
      tl.push('hit', { i: c, layer: r.layer, left: r.left, id: r.removed ? r.removed.id : undefined, k: r.removed ? r.removed.k : undefined, crust: r.crust });
    }

    // place new specials from this wave's groups
    for (const g of groups) {
      if (!g.type) continue;
      const swapMade = w === 0 && ctx.swapCells && g.cells.some((c) => ctx.swapCells.includes(c));
      const cands = specialCandidates(s, g, w === 0 ? ctx.swapCells : null);
      const c = cands.find((x) => playable(s, x) && s.tile[x] == null);
      if (c == null) continue;
      let t;
      if (g.type === 'C') { t = newTile(s, CRYSTAL); pts += SCORE.crystal; }
      else if (g.type === 'b') { t = newTile(s, g.k, 'b'); pts += SCORE.stone; }
      else {
        const longest = g.runs.slice().sort((a, b) => b.cells.length - a.cells.length)[0];
        const sp = swapMade ? ctx.axis : longest.dir === 'h' ? 'v' : 'h';
        t = newTile(s, g.k, sp); pts += SCORE.cascade;
      }
      s.tile[c] = t; s.stats.specials++;
      tl.push('special', { id: t.id, at: c, k: t.k, s: t.s, shape: g.type });
    }
    const gained = pts * mult;
    s.score += gained;
    tl.push('score', { pts: gained, mult, at: order.length ? order[(order.length / 2) | 0] : 0, wave: w });
    tl.next();

    const st = settle(s);
    if (w + 1 >= SAFE_WAVE) safeRecolour(s, st.spawned);
    let tokenPts = 0;
    const gone = new Set(st.collected.map((c) => c.id));
    if (st.paths.length) {
      tl.push('fall', {
        ticks: st.ticks,
        moves: st.paths.map((p) => {
          const m = { id: p.id, cells: p.cells, ticks: p.ticks };
          if (p.spawn) { m.spawn = true; m.k = p.tile.k; m.s = p.tile.s; }
          if (gone.has(p.id)) m.gone = true;
          return m;
        }),
      });
    }
    for (const c of st.collected) { tokenPts += SCORE.token; tl.push('collect', { id: c.id, at: c.at, tick: c.tick }); }
    if (tokenPts) { s.score += tokenPts; tl.push('score', { pts: tokenPts, mult: 1, at: st.collected[0].at, wave: w }); }
    tl.next();
  }
  s.cascadeMax = Math.max(s.cascadeMax, ctx.waves);
}

// After the safe wave, freshly spawned tiles that complete a run are recoloured, which ends cascades.
function safeRecolour(s, spawnedIds) {
  const fresh = new Set(spawnedIds);
  for (let pass = 0; pass < 6; pass++) {
    const groups = findGroups(s);
    if (!groups.length) return;
    let changed = false;
    for (const g of groups) for (const c of g.cells) {
      const t = s.tile[c];
      if (t && fresh.has(t.id) && t.s == null) {
        const old = t.k; t.k = -1;
        t.k = safeKind(s, c, 'misc');
        if (t.k !== old) changed = true;
      }
    }
    if (!changed) return;
  }
}

function endTurn(s, tl, moved) {
  if (moved) {
    const g = mossGrowth(s);
    if (g) tl.push('spread', { from: g.from, to: g.to, id: g.removed.id });
    s.tokens.sinceSpawn++;
    s.mossHitThisTurn = false;
  }
  for (const g of updateGoals(s)) tl.push('goal', { type: g.type, kind: g.kind, have: g.have, need: g.need });
  if (s.phase === 'play' && allDone(s)) {
    s.starsWon = starsFor(s);
    s.phase = s.movesLeft != null && s.movesLeft > 0 ? 'encore' : 'won';
    tl.push('end', { result: 'won', stars: s.starsWon, encore: s.phase === 'encore' });
  } else if (s.phase === 'play' && s.movesLeft != null && s.movesLeft <= 0) {
    s.phase = 'lost';
    tl.push('end', { result: 'lost' });
  }
  if (s.phase === 'play' && !hasMove(s)) {
    tl.next();
    const r = reshuffle(s);
    tl.push('reshuffle', r);
    // too few pieces left to make any move (e.g. algae overgrew the board): the level is lost, never frozen
    if (!hasMove(s)) { s.phase = 'lost'; s.stuck = true; tl.push('end', { result: 'lost', reason: 'stuck' }); }
  }
  tl.next();
}

// --- public actions --------------------------------------------------------------------------
export function resolveSwap(s, a, b, opts = {}) {
  const tl = new Timeline(opts.fast);
  if (s.phase !== 'play' || !adjacent(s, a, b) || !swappableAt(s, a) || !swappableAt(s, b)) {
    return { valid: false, reason: 'blocked', timeline: tl.out() };
  }
  const ta = s.tile[a], tb = s.tile[b];
  if (!isLegalSwap(s, a, b)) {
    tl.push('swap', { a, b, ids: [ta.id, tb.id] }); tl.next();
    tl.push('swapBack', { a, b, ids: [ta.id, tb.id] });
    return { valid: false, reason: 'nomatch', timeline: tl.out() };
  }
  s.tile[a] = tb; s.tile[b] = ta;
  tl.push('swap', { a, b, ids: [ta.id, tb.id] }); tl.next();
  const axis = Math.abs(a - b) === 1 ? 'h' : 'v';
  const ctx = newCtx([b, a], axis);
  const kind = comboKind(ta, tb);
  if (kind) setupCombo(s, ctx, tl, kind, a, b, ta, tb);
  if (s.movesLeft != null) s.movesLeft--;
  s.movesUsed++;
  runWaves(s, ctx, tl);
  endTurn(s, tl, true);
  return { valid: true, combo: kind, waves: ctx.waves, timeline: tl.out({ move: { a, b } }) };
}

function setupCombo(s, ctx, tl, kind, a, b, ta, tb) {
  // ta now sits at b, tb at a.
  const cellOf = (t) => (s.tile[b] === t ? b : a);
  tl.push('combo', { kind, a, b, ids: [ta.id, tb.id] });
  if (kind === 'Cx') {
    const crystal = ta.k === CRYSTAL ? ta : tb, other = crystal === ta ? tb : ta;
    ctx.queue.push({ cell: cellOf(crystal), id: crystal.id, colour: other.k });
    return;
  }
  if (kind === 'CG' || kind === 'CB') {
    const crystal = ta.k === CRYSTAL ? ta : tb, other = crystal === ta ? tb : ta;
    ctx.fired.add(crystal.id);
    ctx.initialHits = [cellOf(crystal)];
    const converted = [];
    s.tile.forEach((t, i) => {
      if (isColour(t) && t.k === other.k && t.s == null && !s.lock[i] && !s.fog[i] && s.mask[i]) {
        t.s = kind === 'CB' ? 'b' : next(s.rng, 'misc') < 0.5 ? 'h' : 'v';
        converted.push({ id: t.id, at: i, s: t.s });
      }
    });
    tl.push('convert', { tiles: converted, k: other.k });
    s.tile.forEach((t, i) => {
      if (isColour(t) && t.k === other.k && t.s != null && !s.lock[i] && !s.fog[i]) ctx.queue.push({ cell: i, id: t.id });
    });
    return;
  }
  ctx.fired.add(ta.id); ctx.fired.add(tb.id);
  ctx.initialHits = comboArea(s, kind, b);
}

// Boosters: hammer {cell}, line {cell, dir}, shuffle, plus5. None of them spends a move.
export function resolveBooster(s, name, arg = {}, opts = {}) {
  const tl = new Timeline(opts.fast);
  const fail = (reason) => ({ valid: false, reason, timeline: tl.out() });
  if (!(s.boosters[name] > 0)) return fail('none');
  if (name === 'plus5') {
    if (s.phase !== 'play' && s.phase !== 'lost') return fail('phase');
    if (s.movesLeft == null) return fail('nomoves');
    s.boosters.plus5--; s.movesLeft += 5;
    if (s.phase === 'lost') s.phase = 'play';
    tl.push('booster', { name, moves: s.movesLeft });
    return { valid: true, timeline: tl.out() };
  }
  if (s.phase !== 'play') return fail('phase');
  if (name === 'shuffle') {
    s.boosters.shuffle--;
    tl.push('booster', { name });
    tl.next();
    tl.push('reshuffle', reshuffle(s));
    return { valid: true, timeline: tl.out() };
  }
  const cell = arg.cell;
  if (cell == null || cell < 0 || cell >= s.tile.length || !s.mask[cell]) return fail('cell');
  const ctx = newCtx(null, null);
  if (name === 'hammer') ctx.initialHits = [cell];
  else if (name === 'line') ctx.initialHits = arg.dir === 'v' ? colCells(s, cell % s.w) : rowCells(s, (cell / s.w) | 0);
  else return fail('unknown');
  s.boosters[name]--;
  tl.push('booster', { name, cell, dir: arg.dir, cells: ctx.initialHits });
  tl.next();
  runWaves(s, ctx, tl);
  endTurn(s, tl, false);
  return { valid: true, waves: ctx.waves, timeline: tl.out() };
}

// Encore: each remaining move turns a random plain tile into a Cascade and fires it. Scored apart.
export function resolveEncore(s, opts = {}) {
  const tl = new Timeline(opts.fast);
  if (s.phase !== 'encore') return { valid: false, timeline: tl.out() };
  const before = s.score;
  let n = 0;
  while (s.movesLeft > 0) {
    const plain = [];
    s.tile.forEach((t, i) => { if (isColour(t) && t.s == null && swappableAt(s, i)) plain.push(i); });
    if (!plain.length) break;
    const c = plain[int(s.rng, 'misc', plain.length)];
    const t = s.tile[c];
    t.s = next(s.rng, 'misc') < 0.5 ? 'h' : 'v';
    s.movesLeft--;
    tl.push('encore', { n: ++n, id: t.id, at: c, s: t.s, movesLeft: s.movesLeft });
    tl.next();
    const ctx = newCtx(null, null);
    ctx.queue.push({ cell: c, id: t.id });
    runWaves(s, ctx, tl);
  }
  s.encoreScore += s.score - before;
  s.score = before;
  s.movesLeft = 0;
  s.phase = 'won';
  tl.push('end', { result: 'won', stars: s.starsWon, encoreScore: s.encoreScore });
  return { valid: true, timeline: tl.out() };
}

export { TOKEN };
