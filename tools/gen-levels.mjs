#!/usr/bin/env node
// Level authoring tool. Each level below is a hand-designed spec (layout, goals, blockers, kinds, tip);
// this script turns the specs into data/levels/w1.txt … w6.txt, auto-tuning the move limit so the greedy
// bot's win rate lands in the level's band, and setting star thresholds from the bot's winning scores.
// The .txt files are the source of truth for the build and may be hand-edited afterwards.
//   node tools/gen-levels.mjs [--only w2] [--seeds 60] [--no-tune]
// Level names come from research/town-content.md (real places in each world).
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));


// ---------------------------------------------------------------- layouts (9 wide max)
const W9 = '.........';
const rows = (n, w = 9) => Array(n).fill('.'.repeat(w));
const widths = (ws, W = 9) => ws.map((w) => { const pad = (W - w) / 2; return '#'.repeat(Math.floor(pad)) + '.'.repeat(w) + '#'.repeat(Math.ceil(pad)); });
const SHAPES = {
  sq7: rows(7, 7), sq8: rows(8, 8), sq9: rows(9),
  r8x9: rows(8), r9x8: rows(9, 8), r7x8: rows(7, 8),
  corners9: ['##.....##', '#.......#', W9, W9, W9, W9, W9, '#.......#', '##.....##'],
  corners8: ['#......#', ...rows(6, 8), '#......#'],
  diamond9: widths([5, 7, 9, 9, 9, 9, 9, 7, 5]),
  dome8: widths([4, 6, 8, 8, 8, 8, 8, 8], 8),
  arch9: [W9, W9, W9, W9, W9, W9, '...###...', '...###...', '...###...'],
  ring9: [W9, W9, W9, '...###...', '...###...', '...###...', W9, W9, W9],
  plus9: ['##.....##', '##.....##', W9, W9, W9, W9, W9, '##.....##', '##.....##'],
  hour9: widths([9, 9, 7, 5, 5, 5, 7, 9, 9]),
  twin9: ['....#....', '....#....', '....#....', '....#....', W9, W9, W9, W9, W9],
  lake9: [W9, W9, '..#...#..', W9, '....#....', W9, '..#...#..', W9, W9],
  steps9: ['.....####', '......###', '.......##', '........#', W9, W9, W9, W9, W9],
  tower9: ['###...###', '###...###', '##.....##', '#.......#', W9, W9, W9, W9, W9],
  wide9x7: rows(7),
  vee9: widths([9, 9, 9, 9, 9, 7, 7, 5, 5]),
};

// ---------------------------------------------------------------- blocker patterns
function grid(shape, fill = '.') { return shape.map((r) => r.replace(/[^#]/g, fill).replace(/#/g, '.')); }
function put(layer, cells, ch, shape) {
  const g = layer.map((r) => r.split(''));
  for (const [x, y] of cells) if (shape[y] && shape[y][x] === '.') g[y][x] = ch;
  return g.map((r) => r.join(''));
}
const H = (shape) => shape.length, Wd = (shape) => shape[0].length;
const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push([x, y]); return o; };
const rowCells = (shape, y) => rect(0, y, Wd(shape) - 1, y);
const ring = (cx, cy, r) => rect(cx - r, cy - r, cx + r, cy + r).filter(([x, y]) => Math.max(Math.abs(x - cx), Math.abs(y - cy)) === r);
const checker = (cells, par = 0) => cells.filter(([x, y]) => (x + y) % 2 === par);
const corners = (shape, k = 2) => { const w = Wd(shape), h = H(shape); return [...rect(0, 0, k - 1, k - 1), ...rect(w - k, 0, w - 1, k - 1), ...rect(0, h - k, k - 1, h - 1), ...rect(w - k, h - k, w - 1, h - 1)]; };
const diag = (shape) => { const o = []; for (let i = 0; i < Math.min(Wd(shape), H(shape)); i++) { o.push([i, i]); o.push([Wd(shape) - 1 - i, i]); } return o; };

// ---------------------------------------------------------------- level specs
// b: blockers [{layer:'block'|'under'|'top', ch, cells}] ; goals: [type, kindOrNeed, need]
const L = (name, shape, kinds, goals, extra = {}) => ({ name, shape, kinds, goals, ...extra });
const ST = (cells, ch = '1') => ({ layer: 'block', ch, cells });
const CR = (cells, ch = '1') => ({ layer: 'under', ch, cells });
const LK = (cells, ch = 'l') => ({ layer: 'top', ch, cells });
const FG = (cells) => ({ layer: 'top', ch: 'f', cells });
const MS = (cells) => ({ layer: 'block', ch: 'm', cells });

const S = SHAPES;
const WORLDS = {
  1: { band: [0.9, 1.0], levels: [
    L('Magnolia Promenade', S.sq7, 'abcde', [['score', 2000]], { tip: 'basics', tags: ['intro:basics'] }),
    L('Superior', S.corners8, 'abcde', [['collect', 'a', 18]], { tip: 'cascade', tags: ['intro:cascade'] }),
    L('Hale', S.sq8, 'abcde', [['collect', 'b', 20], ['score', 4000]], { tip: 'stone', tags: ['intro:stone'] }),
    L('Maurice', S.dome8, 'abcde', [['collect', 'c', 22]], { tip: 'crystal', tags: ['intro:crystal'] }),
    L('Main Entrance', S.arch9, 'abcde', [['score', 9000]], {}),
    L('Fordyce', S.corners9, 'abcde', [['collect', 'd', 25], ['collect', 'e', 25]], { tip: 'combo', tags: ['intro:combo'] }),
    L('Quapaw', S.diamond9, 'abcde', [['score', 12000]], {}),
    L('Ozark', S.twin9, 'abcde', [['collect', 'a', 28], ['collect', 'c', 28]], { tip: 'boosters', tags: ['intro:boosters'] }),
    L('Buckstaff', S.r8x9, 'abcde', [['collect', 'b', 35], ['score', 14000]], {}),
    L('Lamar', S.ring9, 'abcdef', [['collect', 'e', 20], ['collect', 'f', 20]], {}),
  ] },
  2: { band: [0.75, 0.95], levels: [
    L('Display Spring', S.sq8, 'abcde', [['stone', 'all']], { tip: 'tufa', tags: ['intro:tufa'], b: (s) => [ST(ring(3.5 | 0, 4, 2))] }),
    L('Hot Water Cascade', S.steps9, 'abcde', [['stone', 'all'], ['collect', 'd', 25]], { b: (s) => [ST(rowCells(s, 6), '1'), ST(rowCells(s, 7), '2')] }),
    L('Tufa Terrace Trail', S.r8x9, 'abcde', [['crust', 'all']], { tip: 'crust', tags: ['intro:crust'], b: (s) => [CR(rect(2, 2, 6, 5))] }),
    L('Grand Promenade', S.corners9, 'abcde', [['crust', 'all']], { b: (s) => [CR(rect(0, 3, 8, 5)), CR(rect(3, 0, 5, 8))] }),
    L('Noble Fountain', S.diamond9, 'abcde', [['stone', 'all'], ['crust', 'all']], { b: (s) => [ST(ring(4, 4, 1), '2'), CR(ring(4, 4, 3))] }),
    L('Ral Spring', S.sq9, 'abcde', [['crust', 'all']], { b: (s) => [CR(checker(rect(0, 3, 8, 8)), '1'), CR(rect(3, 4, 5, 6), '2')] }),
    L('Peak Trail', S.tower9, 'abcde', [['stone', 'all'], ['collect', 'b', 30]], { b: (s) => [ST(rect(1, 6, 7, 6), '2'), ST([[4, 3], [4, 4]], '1')] }),
    L('Goat Rock', S.hour9, 'abcde', [['crust', 'all'], ['stone', 'all']], { b: (s) => [ST([[3, 4], [5, 4]], '2'), CR(rect(0, 7, 8, 8), '1')] }),
    L('Gulpha Gorge', S.lake9, 'abcde', [['crust', 'all']], { b: (s) => [CR(rect(0, 4, 8, 8))] }),
    L('Mountain Tower', S.tower9, 'abcde', [['stone', 'all'], ['crust', 'all']], { b: (s) => [ST(checker(rect(0, 5, 8, 5)), '2'), ST(corners(s, 1).filter(([x, y]) => y > 4), '3'), CR(rect(1, 6, 7, 8), '2')] }),
  ] },
  3: { band: [0.6, 0.85], levels: [
    L('Valley Street', S.sq8, 'abcde', [['lock', 'all']], { tip: 'lock', tags: ['intro:lock'], b: (s) => [LK(diag(s).filter(([x, y]) => y > 0))] }),
    L('The Arlington', S.twin9, 'abcde', [['lock', 'all'], ['collect', 'a', 25]], { b: (s) => [LK(checker(rect(0, 5, 8, 6)))] }),
    L('Southern Club', S.r8x9, 'abcde', [['lock', 'all'], ['stone', 'all']], { b: (s) => [LK(checker(rect(1, 1, 7, 3))), ST(rect(2, 6, 6, 6), '2')] }),
    L('Ohio Club', S.corners9, 'abcde', [['score', 15000]], { tip: 'fog', tags: ['intro:fog'], b: (s) => [FG(checker(rect(1, 2, 7, 4)))] }),
    L('Medical Arts Tower', S.tower9, 'abcde', [['lock', 'all'], ['crust', 'all']], { b: (s) => [LK(checker(rect(2, 3, 6, 4)), 'L'), CR(rect(0, 6, 8, 8))] }),
    L('KTHS Ballroom', S.diamond9, 'abcde', [['crust', 'all']], { b: (s) => [FG(ring(4, 4, 2)), CR(rect(2, 2, 6, 6))] }),
    L('Bridge Street', S.hour9, 'abcde', [['lock', 'all'], ['collect', 'c', 30]], { b: (s) => [LK(checker(rect(2, 3, 6, 5)))] }),
    L('Park Hotel', S.sq9, 'abcde', [['stone', 'all'], ['lock', 'all']], { b: (s) => [ST(ring(4, 4, 1), '3'), LK(ring(4, 4, 3))] }),
    L('Fountain Street', S.arch9, 'abcde', [['crust', 'all'], ['lock', 'all']], { b: (s) => [FG([[1, 2], [7, 2]]), LK(checker(rect(0, 4, 8, 4))), CR(rect(0, 5, 2, 8)), CR(rect(6, 5, 8, 8))] }),
    L('The Vapors', S.sq9, 'abcdef', [['lock', 'all'], ['crust', 'all']], { b: (s) => [LK(checker(rect(1, 2, 7, 6), 1)), CR(rect(2, 3, 6, 6), '2'), FG([[0, 3], [8, 3]])] }),
  ] },
  4: { band: [0.5, 0.75], levels: [
    L('Baseball Grounds', S.sq8, 'abcde', [['tokens', 'all']], { tip: 'tokens', tags: ['intro:tokens'], tokens: [2, 1, 3], flow: 'x' }),
    L('Whittington Park', S.r8x9, 'abcde', [['tokens', 'all'], ['collect', 'b', 25]], { tokens: [3, 1, 3], flow: 'x' }),
    L('Alligator Farm Fence', S.corners9, 'abcde', [['tokens', 'all']], { tokens: [3, 1, 2], flow: 'x', b: (s) => [ST(rect(1, 4, 7, 4), '1')] }),
    L('Majestic Park', S.twin9, 'abcde', [['tokens', 'all'], ['crust', 'all']], { tokens: [3, 2, 3], flow: 'x', b: (s) => [CR(rect(0, 6, 8, 8))] }),
    L('Fogel Field', S.diamond9, 'abcde', [['tokens', 'all'], ['lock', 'all']], { tokens: [4, 2, 3], flow: 'x', b: (s) => [LK(ring(4, 4, 2))] }),
    L('Sam Guinn Field', S.sq9, 'abcde', [['score', 22000], ['stone', 'all']], { b: (s) => [ST(checker(rect(1, 5, 7, 7)), '2')] }),
    L('Jaycee Field', S.hour9, 'abcde', [['tokens', 'all']], { tokens: [4, 1, 2], flow: 'x', b: (s) => [FG([[2, 3], [6, 3], [3, 5], [5, 5]])] }),
    L('Glass Grandstand', S.r8x9, 'abcde', [['crust', 'all'], ['stone', 'all']], { b: (s) => [ST(checker(rect(0, 3, 8, 3)), '2'), CR(rect(0, 4, 8, 7), '1')] }),
    L('Backstretch Chute', S.vee9, 'abcde', [['tokens', 'all'], ['collect', 'd', 30]], { tokens: [4, 2, 3], flow: 'x' }),
    L('Derby Day', S.sq9, 'abcdef', [['tokens', 'all'], ['lock', 'all'], ['crust', 'all']], { tokens: [2, 1, 3], flow: 'x', b: (s) => [LK(checker(rect(0, 4, 8, 4)).filter(([x]) => Math.abs(x - 4) > 1)), CR(rect(0, 8, 8, 8), '1')] }),
  ] },
  5: { band: [0.4, 0.65], levels: [
    L('Carpenter Dam', S.r8x9, 'abcde', [['moss', 'all'], ['collect', 'c', 20]], { tip: 'moss', tags: ['intro:moss'], b: (s) => [MS([[0, 7], [8, 7], [4, 7]])] }),
    L('Lake Hamilton', S.lake9, 'abcde', [['moss', 'all'], ['collect', 'd', 20]], { b: (s) => [MS([[0, 8], [8, 8]])] }),
    L('Hulsey Hatchery', S.sq9, 'abcde', [['moss', 'all'], ['crust', 'all']], { b: (s) => [MS([[4, 4]]), CR(ring(4, 4, 2))] }),
    L('Remmel Dam', S.corners9, 'abcde', [['stone', 'all'], ['moss', 'all']], { b: (s) => [ST(rect(1, 3, 7, 3), '2'), MS([[2, 6], [6, 6]])] }),
    L('Catherine\'s Cabins', S.twin9, 'abcde', [['moss', 'all'], ['lock', 'all']], { b: (s) => [MS([[0, 0], [8, 0], [4, 8]]), LK(rect(1, 5, 7, 5))] }),
    L('Blakely Mountain Dam', S.r9x8, 'abcde', [['tokens', 'all'], ['moss', 'all']], { tokens: [3, 1, 3], flow: 'x', b: (s) => [MS([[0, 4], [7, 4]])] }),
    L('Three Sisters Springs', S.diamond9, 'abcde', [['crust', 'all'], ['moss', 'all']], { b: (s) => [MS([[4, 1], [2, 6], [6, 6]]), CR(rect(2, 2, 6, 6), '2')] }),
    L('Geo-Float Trail', S.steps9, 'abcde', [['moss', 'all'], ['stone', 'all']], { b: (s) => [ST(diag(s).filter(([x, y]) => y > 3), '1'), MS([[1, 8], [7, 8]])] }),
    L('Two Hundred Islands', S.r8x9, 'abcde', [['moss', 'all'], ['tokens', 'all']], { tokens: [2, 1, 3], flow: 'x', b: (s) => [MS([[1, 7], [7, 7]])] }),
    L('Mount Ida Crystals', S.sq9, 'abcdef', [['moss', 'all'], ['crust', 'all'], ['stone', 'all']], { b: (s) => [MS([[0, 8], [8, 8], [4, 0]]), CR(rect(3, 3, 5, 5), '2'), ST(ring(4, 4, 2).filter((_, i) => i % 2 === 0), '2')] }),
  ] },
  6: { band: [0.3, 0.55], levels: [
    L('Fordyce Visitor Center', S.sq9, 'abcde', [['crust', 'all'], ['lock', 'all'], ['stone', 'all']], { b: (s) => [ST(ring(4, 4, 1), '2'), LK(corners(s, 2).filter(([x, y]) => y > 4)), CR(rect(0, 7, 8, 8), '2')] }),
    L('Quapaw Baths', S.dome8, 'abcde', [['crust', 'all'], ['tokens', 'all']], { tokens: [3, 1, 3], flow: 'x', b: (s) => [CR(rect(0, 2, 7, 7))] }),
    L('Running of the Tubs', S.vee9, 'abcde', [['tokens', 'all'], ['score', 25000]], { tokens: [4, 2, 2], flow: 'x', b: (s) => [FG([[0, 3], [8, 3], [1, 5], [7, 5]])] }),
    L('Ozark Cultural Center', S.twin9, 'abcde', [['lock', 'all'], ['moss', 'all']], { b: (s) => [LK(checker(rect(0, 5, 8, 6))), MS([[0, 8], [8, 8]])] }),
    L('Hotel Hale', S.tower9, 'abcde', [['stone', 'all'], ['crust', 'all'], ['moss', 'all']], { b: (s) => [ST(rect(1, 4, 7, 4), '3'), CR(rect(1, 5, 7, 8), '2'), MS([[4, 2]])] }),
    L('Maurice Restoration', S.corners9, 'abcde', [['crust', 'all'], ['collect', 'a', 24]], { b: (s) => [CR(rect(0, 2, 8, 8), '1'), CR(rect(3, 3, 5, 5), '2'), FG([[3, 4], [5, 4]])] }),
    L('Garden of the Pine Wind', S.plus9, 'abcde', [['moss', 'all'], ['stone', 'all'], ['lock', 'all']], { b: (s) => [MS([[2, 0], [6, 0], [2, 8], [6, 8]]), ST(rect(3, 3, 5, 5).filter(([x, y]) => x !== 4 || y !== 4), '2'), LK([[4, 4]], 'L')] }),
    L('Bridge of the Full Moon', S.arch9, 'abcde', [['tokens', 'all'], ['crust', 'all']], { tokens: [3, 1, 2], flow: 'x', b: (s) => [CR(rect(0, 2, 8, 5), '1')] }),
    L('Anthony Chapel', S.tower9, 'abcdef', [['lock', 'all'], ['stone', 'all'], ['crust', 'all']], { b: (s) => [LK(checker(rect(2, 3, 6, 3))), ST([[1, 5], [4, 5], [7, 5]], '2'), CR(rect(0, 6, 8, 8), '1')] }),
    L('Holiday Lights', S.sq9, 'abcde', [['moss', 'all'], ['tokens', 'all'], ['crust', 'all'], ['lock', 'all']], { tokens: [2, 1, 3], flow: 'x', b: (s) => [MS([[0, 8], [8, 8]]), CR(rect(2, 3, 6, 6), '1'), LK(ring(4, 4, 3).filter(([x, y], i) => i % 3 === 0 && y > 2))] }),
  ] },
};

// ---------------------------------------------------------------- spec → level data
function buildLevel(w, n, spec, band) {
  const shape = spec.shape;
  const layers = { block: grid(shape), under: grid(shape), top: grid(shape) };
  for (const b of spec.b ? spec.b(shape) : []) layers[b.layer] = put(layers[b.layer], b.cells, b.ch, shape);
  // a stone or moss cell can't also hold crust, locks or fog
  for (let y = 0; y < shape.length; y++) {
    const blk = layers.block[y];
    layers.under[y] = layers.under[y].split('').map((c, x) => (blk[x] !== '.' ? '.' : c)).join('');
    layers.top[y] = layers.top[y].split('').map((c, x) => (blk[x] !== '.' ? '.' : c)).join('');
  }
  const lv = { id: `w${w}-${String(n).padStart(2, '0')}`, world: w, n, name: spec.name, goals: [], tags: spec.tags || [], grid: { cells: shape.slice() }, band, moves: spec.moves || 25, stars: [1, 2, 3] };
  for (const [t, a, b] of spec.goals) lv.goals.push(t === 'collect' ? { type: t, kind: 'abcdef'.indexOf(a), need: b } : { type: t, need: a });
  lv.weights = Object.fromEntries(spec.kinds.split('').map((c) => [c, 1]));
  if (layers.block.some((r) => /[^.]/.test(r))) lv.grid.block = layers.block;
  if (layers.under.some((r) => /[^.]/.test(r))) lv.grid.under = layers.under;
  if (layers.top.some((r) => /[^.]/.test(r))) lv.grid.top = layers.top;
  if (spec.tokens) {
    const [total, max, every] = spec.tokens;
    lv.tokens = { total, max, every };
    // token spawners: the top playable cell of the middle columns; normal spawners elsewhere
    const flow = shape.map((r) => r.replace(/[^#]/g, '.').replace(/#/g, '.'));
    const f = flow.map((r) => r.split(''));
    const mid = Math.floor(shape[0].length / 2);
    for (let x = 0; x < shape[0].length; x++) {
      let top = -1, bottom = -1;
      for (let y = 0; y < shape.length; y++) if (shape[y][x] === '.' && layers.block[y][x] === '.') { if (top < 0) top = y; bottom = y; }
      if (top < 0) continue;
      f[top][x] = Math.abs(x - mid) <= 1 ? 'x' : 'v';
      if (bottom > top) f[bottom][x] = 'e';
    }
    lv.grid.flow = f.map((r) => r.join(''));
  }
  if (spec.tip) lv.tip = spec.tip;
  return lv;
}

function toText(lv) {
  const K = 'abcdef';
  const out = [`== ${lv.id} | ${lv.name}`, `moves ${lv.moves}`];
  for (const g of lv.goals) out.push(g.type === 'collect' ? `goal collect ${K[g.kind]} ${g.need}` : `goal ${g.type} ${g.need}`);
  out.push(`stars ${lv.stars.join(' ')}`, `weights ${Object.keys(lv.weights).join('')}`);
  if (lv.tokens) out.push(`tokens ${lv.tokens.total} max ${lv.tokens.max} every ${lv.tokens.every}`);
  out.push(`band ${lv.band.map((x) => x.toFixed(2)).join(' ')}`);
  if (lv.tags.length) out.push(`tags ${lv.tags.join(' ')}`);
  if (lv.tip) out.push(`tip ${lv.tip}`);
  for (const k of ['cells', 'block', 'under', 'top', 'flow']) if (lv.grid[k]) out.push(k, ...lv.grid[k]);
  return out.join('\n');
}

// ---------------------------------------------------------------- tuning
async function main() {
  const args = process.argv.slice(2);
  const arg = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
  const only = arg('--only', ''), seeds = +arg('--seeds', 60), tune = !args.includes('--no-tune');
  const nw = Math.max(1, os.cpus().length - 2);
  const workers = Array.from({ length: nw }, () => new Worker(fileURLToPath(import.meta.url)));
  const pending = new Map();
  let rr = 0;
  for (const w of workers) w.on('message', (m) => { const p = pending.get(m.key); pending.delete(m.key); p(m.res); });
  const run = (level, n, seed0) => new Promise((res) => {
    // split across workers in chunks
    const chunks = Math.min(nw, Math.ceil(n / 8)), per = Math.ceil(n / chunks), parts = [];
    for (let c = 0; c < chunks; c++) {
      const key = `${level.id}:${level.moves}:${c}:${Math.random()}`;
      parts.push(new Promise((r) => { pending.set(key, r); workers[rr++ % nw].postMessage({ key, level, n: Math.min(per, n - c * per), seed0: seed0 + c * per }); }));
    }
    Promise.all(parts).then((a) => res(a.flat()));
  });
  for (const [wk, W] of Object.entries(WORLDS)) {
    const w = +wk;
    if (only && only !== `w${w}`) continue;
    const texts = [`# World ${w}. Generated by tools/gen-levels.mjs (specs there); moves and stars tuned by the greedy bot.`];
    for (let i = 0; i < W.levels.length; i++) {
      const n = i + 1, spec = W.levels[i];
      const spike = n === 5 || n === 10;
      const band = spike ? [Math.max(0.15, W.band[0] - 0.2), Math.max(0.3, W.band[1] - 0.2)] : W.band.slice();
      const lv = buildLevel(w, n, spec, band);
      if (tune) {
        const target = (band[0] + band[1]) / 2;
        const MIN_MOVES = 15 + Math.min(5, w - 1), MAX_MOVES = 40;
        const base = lv.goals.map((g) => g.need);
        let best = null;
        for (let scale = 1, round = 0; round < 8; round++) {
          lv.goals.forEach((g, j) => { if (typeof base[j] === 'number') g.need = Math.round(base[j] * scale / (g.type === 'score' ? 500 : 1)) * (g.type === 'score' ? 500 : 1); });
          const cache = new Map();
          const rate = async (m) => { if (!cache.has(m)) { lv.moves = m; cache.set(m, await run(lv, seeds, 5000)); } const r = cache.get(m); return r.filter((x) => x.won).length / r.length; };
          let lo = 6, hi = MAX_MOVES;
          while (lo < hi) { const mid = (lo + hi) >> 1; if ((await rate(mid)) >= target) hi = mid; else lo = mid + 1; }
          await rate(lo);
          lv.moves = lo; best = cache.get(lo);
          let scalable = base.some((b) => typeof b === 'number');
          if (lo < MIN_MOVES && !scalable) {
            // nothing to scale: add a collect goal for a kind the level spawns, and scale that
            const kinds = Object.keys(lv.weights);
            lv.goals.push({ type: 'collect', kind: 'abcdef'.indexOf(kinds[(w + n) % kinds.length]), need: 12 });
            base.push(12); scalable = true; continue;
          }
          if (lo >= MIN_MOVES || !scalable) break;
          scale *= Math.max(1.15, Math.min(2, MIN_MOVES / lo));
        }
        const wins = best.filter((x) => x.won).map((x) => x.score).sort((a, b) => a - b);
        const q = (p) => wins[Math.min(wins.length - 1, Math.floor(p * wins.length))] || 1000;
        const round = (v) => Math.max(500, Math.round(v / 500) * 500);
        let s1 = round(q(0.1)), s2 = round(q(0.5)), s3 = round(q(0.85));
        if (s2 <= s1) s2 = s1 + 500; if (s3 <= s2) s3 = s2 + 500;
        lv.stars = [s1, s2, s3];
        const sg = lv.goals.find((g) => g.type === 'score');
        if (sg && lv.stars[0] < sg.need) { lv.stars[0] = sg.need; if (lv.stars[1] <= sg.need) lv.stars[1] = sg.need + 1500; if (lv.stars[2] <= lv.stars[1]) lv.stars[2] = lv.stars[1] + 2000; }
        const goalsTxt = lv.goals.map((g) => `${g.type}${g.type === 'collect' ? ':' + 'abcdef'[g.kind] : ''}=${g.need}`).join(' ');
        console.log(`${lv.id} ${lv.name.padEnd(24)} moves ${String(lv.moves).padStart(2)}  win ${(best.filter((x) => x.won).length / best.length * 100).toFixed(0)}% (band ${band.map((x) => Math.round(x * 100)).join('-')})  ${goalsTxt}  stars ${lv.stars.join('/')}`);
      }
      texts.push(toText(lv));
    }
    fs.writeFileSync(path.join(here, '..', 'data', 'levels', `w${w}.txt`), texts.join('\n\n') + '\n');
  }
  for (const w of workers) w.terminate();
}

if (!isMainThread) {
  const { playLevel } = await import('./bots.mjs');
  parentPort.on('message', (job) => {
    const res = [];
    for (let s = 0; s < job.n; s++) res.push(playLevel(job.level, job.seed0 + s, 'casual'));
    parentPort.postMessage({ key: job.key, res });
  });
} else {
  await main();
}
