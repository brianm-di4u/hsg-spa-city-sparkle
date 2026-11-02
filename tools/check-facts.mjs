#!/usr/bin/env node
// Confirms every lore card the game shows (data/lore.json) traces to the audited trivia bank
// (games/trivia/data/questions.json): id exists, confidence "confirmed", same source, and every number in the
// card text appears in that bank item's question, answer or explanation. Pattern from
// games/property-game/tools/check-facts.mjs. Exit 1 on any failure.
//   node tools/check-facts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export function checkFacts() {
  const lore = JSON.parse(fs.readFileSync(path.join(here, '..', 'data', 'lore.json'), 'utf8'));
  const bankPath = [path.join(here, '..', '..', 'hsg-trivia', 'data', 'questions.json'), path.join(here, '..', 'research', 'lore-bank.json')].find((p) => fs.existsSync(p));
  if (!bankPath) return { skipped: true, problems: [], count: lore.length };
  const raw = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  const bank = raw.questions || raw;
  const norm = (t) => String(t || '').replace(/[–—]/g, '-').replace(/’/g, "'");
  const numbers = (t) => (norm(t).match(/\d[\d,.]*\d|\d/g) || []).map((n) => n.replace(/[.,]$/, '').replace(/,/g, ''));
  const problems = [];
  const perWorld = {};
  for (const c of lore) {
    perWorld[c.world] = (perWorld[c.world] || 0) + 1;
    const q = bank.find((x) => x.id === c.id);
    if (!q) { problems.push(`${c.id}: not in the audited bank`); continue; }
    if (q.confidence !== 'confirmed') problems.push(`${c.id}: confidence ${q.confidence}`);
    if (q.source !== c.source) problems.push(`${c.id}: source "${c.source}" differs from bank "${q.source}"`);
    const hay = norm([q.question, q.answer, q.explanation, ...(q.wrong || [])].join(' ')).replace(/,/g, '');
    for (const n of numbers(c.text + ' ' + c.title)) if (!hay.includes(n)) problems.push(`${c.id}: number ${n} not in the bank item`);
    if (c.title.length > 40) problems.push(`${c.id}: title over 40 chars`);
    if (c.text.length > 160) problems.push(`${c.id}: text over 160 chars`);
  }
  for (let w = 1; w <= 6; w++) if (perWorld[w] !== 10) problems.push(`world ${w}: ${perWorld[w] || 0} cards, want 10`);
  return { problems, count: lore.length, bank: path.relative(process.cwd(), bankPath) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = checkFacts();
  if (r.skipped) { console.log('check-facts: audited bank not found, skipped'); process.exit(0); }
  r.problems.forEach((p) => console.log('FAIL', p));
  console.log(`check-facts: ${r.count} cards, ${r.problems.length} problems (bank ${r.bank})`);
  process.exit(r.problems.length ? 1 : 0);
}
