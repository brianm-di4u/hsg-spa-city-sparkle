#!/usr/bin/env node
// Full build: vendor + data copies, fonts, levels, then the inliner (shared/tools/inline.mjs) → index.html.
//   node tools/build.mjs [--skip-art]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (script, args = []) => execFileSync(process.execPath, [path.join(game, script), ...args], { stdio: 'inherit', cwd: game });
run('tools/build-vendor.mjs');
run('tools/build-fonts.mjs');
run('tools/build-levels.mjs');
if (fs.existsSync(path.join(game, 'tools', 'build-art.mjs')) && !process.argv.includes('--skip-art')) run('tools/build-art.mjs');
// the shared inliner: the monorepo copy, or the game repo's own shared/ copy
const inliner = [path.join(game, '..', '..', 'shared', 'tools', 'inline.mjs'), path.join(game, 'shared', 'tools', 'inline.mjs')].find((p) => fs.existsSync(p));
execFileSync(process.execPath, [inliner, game], { stdio: 'inherit' });
const kb = fs.statSync(path.join(game, 'index.html')).size / 1024;
console.log(`index.html ${kb.toFixed(0)} KB`);
if (kb > 2048) { console.error('index.html is over the 2 MB budget'); process.exit(1); }
