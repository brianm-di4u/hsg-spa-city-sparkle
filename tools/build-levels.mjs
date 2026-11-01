#!/usr/bin/env node
// Builds data/levels.json from the hand-written level files data/levels/w1.txt … w6.txt.
//   node tools/build-levels.mjs            (run from the game folder or anywhere)
// Format (one block per level; # starts a comment line):
//   == w1-01 | Grand Promenade
//   moves 18                    (omit for no move limit)
//   goal score 2500             goal <score|collect|crust|stone|moss|lock|tokens> [kind letter for collect] <need|all>
//   stars 2500 4000 6000
//   weights abcde               letters, optionally with weights: a2 b1 c1
//   tokens 3 max 1 every 4      bath tokens: total, most on board at once, moves between spawns
//   band 0.90 1.00              target greedy-bot win rate (tools/balance.mjs)
//   tags intro:geyser           free-form tags; intro:<mechanic> marks a tutorial level
//   tip geyser                  tutorial tip id shown on first play
//   cells | block | under | top | flow   followed by grid rows (same size), see src/js/engine/grid.js
// A blank line ends a grid. Lines starting with # are comments only outside grids (in a grid, # is a hole).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, '..', 'data', 'levels');
const out = path.join(here, '..', 'data', 'levels.json');
const KIND = 'abcdef';
const GRIDS = new Set(['cells', 'block', 'under', 'top', 'flow']);

export function parseLevels(text, file = 'levels') {
  const levels = [];
  let L = null, grid = null, lineNo = 0;
  const fail = (msg) => { throw new Error(`${file}:${lineNo}: ${msg}`); };
  for (const raw of text.split(/\r?\n/)) {
    lineNo++;
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { grid = null; continue; }
    if (!grid && /^\s*#/.test(line)) continue; // comments; inside a grid '#' marks a hole
    const m = /^==\s*(\S+)\s*\|\s*(.+)$/.exec(line);
    if (m) {
      const [w, n] = m[1].slice(1).split('-').map(Number);
      L = { id: m[1], world: w, n, name: m[2].trim(), goals: [], tags: [], grid: {} };
      levels.push(L); grid = null; continue;
    }
    if (!L) fail('text before the first level header');
    const words = line.trim().split(/\s+/);
    if (grid && !GRIDS.has(words[0]) && words.length === 1) { L.grid[grid].push(words[0]); continue; }
    grid = null;
    const [key, ...args] = words;
    switch (key) {
      case 'moves': L.moves = +args[0]; break;
      case 'goal': {
        const type = args[0];
        if (type === 'collect') L.goals.push({ type, kind: KIND.indexOf(args[1]), need: +args[2] });
        else L.goals.push({ type, need: args[1] === 'all' ? 'all' : +args[1] });
        break;
      }
      case 'stars': L.stars = args.map(Number); break;
      case 'weights': {
        L.weights = {};
        const parts = args.length === 1 && !/\d/.test(args[0]) ? args[0].split('') : args;
        for (const p of parts) L.weights[p[0]] = p.length > 1 ? +p.slice(1) : 1;
        break;
      }
      case 'tokens': L.tokens = { total: +args[0], max: +(args[args.indexOf('max') + 1] || 1), every: +(args[args.indexOf('every') + 1] || 3) }; break;
      case 'band': L.band = args.map(Number); break;
      case 'tags': L.tags.push(...args); break;
      case 'tip': L.tip = args[0]; break;
      case 'mode': L.mode = args[0]; break;
      default:
        if (GRIDS.has(key)) { grid = key; L.grid[key] = []; break; }
        fail(`unknown key "${key}"`);
    }
  }
  for (const lv of levels) {
    if (!lv.grid.cells) throw new Error(`${file}: ${lv.id} has no cells grid`);
    const h = lv.grid.cells.length, w = lv.grid.cells[0].length;
    for (const [k, rows] of Object.entries(lv.grid)) {
      if (rows.length !== h || rows.some((r) => r.length !== w)) throw new Error(`${file}: ${lv.id} grid "${k}" is not ${w}×${h}`);
    }
  }
  return levels;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = fs.readdirSync(dir).filter((f) => /^w\d+\.txt$/.test(f)).sort();
  const all = [];
  for (const f of files) all.push(...parseLevels(fs.readFileSync(path.join(dir, f), 'utf8'), f));
  fs.writeFileSync(out, JSON.stringify(all) + '\n');
  console.log(`levels: ${all.length} from ${files.length} files → ${path.relative(process.cwd(), out)}`);
}
