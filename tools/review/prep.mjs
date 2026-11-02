#!/usr/bin/env node
// Writes reviews/loop-N/brief.md (critics) and judge-brief.md from the templates in reviews/briefs/.
//   node tools/review/prep.mjs N
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const N = +process.argv[2];
const dir = path.join(game, 'reviews', `loop-${N}`);
const GAME = 'repos/hsg-spa-city-sparkle';
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '');
const fill = (t, extra) => t.replace(/\{\{(\w+)\}\}/g, (m, k) => (extra[k] !== undefined ? extra[k] : m));
const vars = { LOOP: N, GAME, SHOTS: `review-loop-${N}`, ROLE: 'critic-claude or critic-codex, as your prompt says', CHANGES: read(path.join(dir, 'CHANGES.md')) || '(first loop: no changes yet)', GATES: read(path.join(dir, 'gates.json')) || '{}' };
fs.writeFileSync(path.join(dir, 'brief.md'), fill(read(path.join(game, 'reviews', 'briefs', 'critic.md')), vars) + '\n');
fs.writeFileSync(path.join(dir, 'judge-brief.md'), fill(read(path.join(game, 'reviews', 'briefs', 'judge.md')), vars) + '\n');
console.log(`wrote reviews/loop-${N}/brief.md and judge-brief.md`);
