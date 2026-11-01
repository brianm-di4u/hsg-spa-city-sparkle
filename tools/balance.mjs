#!/usr/bin/env node
// Monte Carlo difficulty check: every level played by the casual-player bot (tools/bots.mjs) (default 200 seeds) and the random bot
// (50 seeds) across worker threads. Writes tools/balance-report.json and prints a table against each
// level's target band (`band` in data/levels/*.txt). PRD §13, AC24.
//   node tools/balance.mjs [--seeds 200] [--random 50] [--only w1-01,w2] [--workers 8] [--fix-stars]
// --fix-stars rewrites the `stars` line of any level whose 3-star rate is outside 5-40% (or 1-star above the
// 25th percentile of winning scores) to the 10th / 50th / 85th percentiles of the bot's winning scores.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
if (!isMainThread) {
  const { playLevel } = await import('./bots.mjs');
  for (const job of workerData.jobs) {
    const res = [];
    for (let s = 1; s <= job.seeds; s++) res.push(playLevel(job.level, 1000 + s, job.strategy));
    parentPort.postMessage({ id: job.level.id, strategy: job.strategy, res });
  }
  process.exit(0);
}
const args = process.argv.slice(2);
const arg = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const seeds = +arg('--seeds', 200), rseeds = +arg('--random', 50), nw = +arg('--workers', Math.max(1, os.cpus().length - 2));
const only = arg('--only', '').split(',').filter(Boolean);
const levelsPath = path.join(here, '..', 'data', 'levels.json');
const levels = JSON.parse(fs.readFileSync(levelsPath, 'utf8')).filter((l) => !only.length || only.some((o) => l.id.startsWith(o)));
const jobs = [];
for (const l of levels) { jobs.push({ level: l, strategy: 'casual', seeds }); if (rseeds) jobs.push({ level: l, strategy: 'random', seeds: rseeds }); }
// spread the work: heavy greedy jobs round-robin
const buckets = Array.from({ length: nw }, () => []);
jobs.forEach((j, i) => buckets[i % nw].push(j));
const t0 = Date.now();
const results = {};
await Promise.all(buckets.filter((b) => b.length).map((b) => new Promise((resolve, reject) => {
  const w = new Worker(fileURLToPath(import.meta.url), { workerData: { jobs: b } });
  w.on('message', (m) => { (results[m.id] ||= {})[m.strategy] = m.res; process.stdout.write('.'); });
  w.on('error', reject); w.on('exit', resolve);
})));
console.log(`\n${jobs.length} jobs in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
const pct = (a, f) => a.length ? a.filter(f).length / a.length : 0;
const q = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))] || 0; };
const report = { generated: new Date().toISOString(), seeds, randomSeeds: rseeds, levelsHash: crypto.createHash('sha1').update(fs.readFileSync(levelsPath)).digest('hex').slice(0, 12), levels: {} };
let out = 0;
console.log('level   band        casual  random  3★    p50score  left  resh  rec  cap  verdict');
for (const l of levels) {
  const g = results[l.id].casual, r = results[l.id].random || [];
  const win = pct(g, (x) => x.won), rwin = pct(r, (x) => x.won);
  const wins = g.filter((x) => x.won);
  const row = {
    band: l.band, win, randomWin: rwin, star3: pct(g, (x) => x.stars === 3), star2: pct(g, (x) => x.stars >= 2),
    scoreP25: q(wins.map((x) => x.score), 0.25), scoreP50: q(g.map((x) => x.score), 0.5), scoreP90: q(g.map((x) => x.score), 0.9),
    leftP50: q(wins.map((x) => x.left || 0), 0.5), winQ: [q(wins.map((x) => x.score), 0.1), q(wins.map((x) => x.score), 0.5), q(wins.map((x) => x.score), 0.85)], reshuffles: g.reduce((a, x) => a + x.reshuffles, 0) / g.length,
    recolorRate: g.reduce((a, x) => a + x.recolors, 0) / Math.max(1, g.reduce((a, x) => a + x.moves, 0)), capped: g.reduce((a, x) => a + x.capped, 0),
  };
  const [lo, hi] = l.band || [0, 1];
  row.verdict = win < lo - 0.15 || win > hi + 0.15 ? 'FAIL' : win < lo - 0.05 || win > hi + 0.05 ? 'warn' : 'ok';
  if (row.capped) row.verdict = 'FAIL';
  if (row.verdict !== 'ok') out++;
  report.levels[l.id] = row;
  const f = (x) => (x * 100).toFixed(0).padStart(4) + '%';
  console.log(`${l.id.padEnd(7)} ${String(l.band ? l.band.map((x) => (x * 100).toFixed(0)).join('-') : '-').padEnd(10)} ${f(win)}   ${f(rwin)}  ${f(row.star3)}  ${String(row.scoreP50).padStart(8)}  ${String(row.leftP50).padStart(4)}  ${row.reshuffles.toFixed(2)}  ${(row.recolorRate * 100).toFixed(1)}  ${row.capped}  ${row.verdict}`);
}
if (args.includes('--fix-stars')) {
  const dir = path.join(here, '..', 'data', 'levels');
  let fixed = 0;
  const round = (v) => Math.max(500, Math.round(v / 500) * 500);
  for (const f of fs.readdirSync(dir).filter((x) => /^w\d+\.txt$/.test(x))) {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
    let cur = null;
    for (let i = 0; i < lines.length; i++) {
      const m = /^== (\S+)/.exec(lines[i]);
      if (m) { cur = levels.find((l) => l.id === m[1]); continue; }
      if (!cur || !lines[i].startsWith('stars ')) continue;
      const r = report.levels[cur.id];
      if (!r || (r.star3 >= 0.05 && r.star3 <= 0.4 && cur.stars[0] <= r.scoreP25)) continue;
      const st = r.winQ.map(round);
      const sg = cur.goals.find((g) => g.type === 'score');
      if (sg) st[0] = Math.max(st[0], sg.need);
      if (st[1] <= st[0]) st[1] = st[0] + 500;
      if (st[2] <= st[1]) st[2] = st[1] + 500;
      lines[i] = `stars ${st.join(' ')}`;
      fixed++;
      console.log(`stars ${cur.id}: ${cur.stars.join('/')} → ${st.join('/')}`);
    }
    fs.writeFileSync(path.join(dir, f), lines.join('\n'));
  }
  console.log(`${fixed} star line(s) rewritten; run node tools/build-levels.mjs and re-run balance`);
}
if (!only.length) fs.writeFileSync(path.join(here, 'balance-report.json'), JSON.stringify(report, null, 1) + '\n');
console.log(`${out} level(s) outside band${only.length ? ' (partial run, report not written)' : ''}`);
