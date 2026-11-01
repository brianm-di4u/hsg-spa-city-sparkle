#!/usr/bin/env node
// Validates the loop's review JSON blocks, writes scores.json, updates HISTORY.md / history.json, applies the
// stop rule (reviews/PROTOCOL.md) and prints the ranked backlog.
//   node tools/review/tally.mjs N
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const N = +process.argv[2];
const R = path.join(game, 'reviews'), dir = path.join(R, `loop-${N}`);
const CATS = ['art', 'rendering', 'animation', 'ui', 'typography', 'readability', 'mobile', 'authenticity'];
const GATE = { authenticity: 6 };
const lastJson = (file) => {
  const t = fs.readFileSync(file, 'utf8');
  const blocks = [...t.matchAll(/```json\s*([\s\S]*?)```/g)];
  if (!blocks.length) throw new Error(`${path.basename(file)}: no json block`);
  return JSON.parse(blocks[blocks.length - 1][1]);
};
const out = {};
for (const role of ['critic-claude', 'critic-codex', 'judge']) {
  const f = path.join(dir, `${role}.md`);
  if (!fs.existsSync(f)) { console.log(`missing ${role}.md`); continue; }
  const j = lastJson(f);
  for (const c of CATS) {
    const s = j.scores && j.scores[c];
    if (!s || typeof s.score !== 'number') throw new Error(`${role}: no score for ${c}`);
    if (!s.evidence || s.evidence.length < 2) console.log(`warn ${role}: ${c} cites ${s.evidence ? s.evidence.length : 0} captures`);
  }
  out[role] = j;
}
const J = out.judge;
const scores = Object.fromEntries(CATS.map((c) => [c, J.scores[c].score]));
const total = CATS.reduce((a, c) => a + scores[c], 0);
const gates = fs.existsSync(path.join(dir, 'gates.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'gates.json'), 'utf8')) : {};
const pass = CATS.every((c) => scores[c] >= (GATE[c] || 7)) && Object.values(gates).every((g) => !g || g.pass !== false);
const hist = fs.existsSync(path.join(R, 'history.json')) ? JSON.parse(fs.readFileSync(path.join(R, 'history.json'), 'utf8')) : [];
const prevBest = hist.length ? Math.max(...hist.map((h) => h.total)) : -1;
const row = { loop: N, total, scores, critics: Object.fromEntries(['critic-claude', 'critic-codex'].filter((r) => out[r]).map((r) => [r, CATS.reduce((a, c) => a + out[r].scores[c].score, 0)])), pass, newBest: total > prevBest };
const filtered = hist.filter((h) => h.loop !== N);
filtered.push(row); filtered.sort((a, b) => a.loop - b.loop);
fs.writeFileSync(path.join(R, 'history.json'), JSON.stringify(filtered, null, 1) + '\n');
let md = '# Review history (judged scores)\n\n| Loop | ' + CATS.join(' | ') + ' | Total | Critics (Claude / Codex) |\n|' + '---|'.repeat(CATS.length + 3) + '\n';
for (const h of filtered) md += `| ${h.loop} | ${CATS.map((c) => h.scores[c]).join(' | ')} | **${h.total}** | ${h.critics['critic-claude'] ?? '-'} / ${h.critics['critic-codex'] ?? '-'} |\n`;
fs.writeFileSync(path.join(R, 'HISTORY.md'), md);
// stop rule: pass, or two loops in a row without a new best, or the 6-loop budget
const last2 = filtered.slice(-2);
const stagnant = last2.length === 2 && last2.every((h) => !h.newBest);
const verdict = pass ? 'stop-pass' : stagnant ? 'stop-stagnation' : N >= 5 ? 'stop-budget' : 'continue';
const weight = (c) => (scores[c] < (GATE[c] || 7) ? 1.5 : scores[c] >= (GATE[c] || 7) + 1 ? 0.3 : 1);
const cost = { S: 1, M: 2, L: 4 };
const backlog = (J.gaps || []).map((g) => ({ ...g, priority: +(g.expectedGain * weight(g.category) / cost[g.effort]).toFixed(2) })).sort((a, b) => b.priority - a.priority);
fs.writeFileSync(path.join(dir, 'scores.json'), JSON.stringify({ loop: N, total, scores, pass, verdict, backlog }, null, 1) + '\n');
console.log(`loop ${N}: ${total}/80 ${CATS.map((c) => `${c} ${scores[c]}`).join(', ')}`);
console.log(`critics: ${JSON.stringify(row.critics)}; verdict ${verdict}`);
let budget = 0;
for (const g of backlog) { const mark = budget < 8 ? '*' : ' '; budget += cost[g.effort]; console.log(`${mark} ${g.priority.toFixed(2)} ${g.id} [${g.category}, ${g.effort}] ${g.fix}`); }
