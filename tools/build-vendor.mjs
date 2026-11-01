#!/usr/bin/env node
// Copies build-time inputs into the game folder:
//   vendor/pixi.min.js   PixiJS (MIT), pinned in tools/dev/package.json; inlined into index.html by the build
//   data/route.json      the world route from the shared research corpus (research/match3-route.json)
// Run `npm --prefix tools/dev ci` once first. node tools/build-vendor.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pixiPkg = path.join(game, 'tools', 'dev', 'node_modules', 'pixi.js');
const want = JSON.parse(fs.readFileSync(path.join(game, 'tools', 'dev', 'package.json'), 'utf8')).devDependencies['pixi.js'];
if (fs.existsSync(pixiPkg)) {
  const have = JSON.parse(fs.readFileSync(path.join(pixiPkg, 'package.json'), 'utf8')).version;
  if (have !== want) throw new Error(`pixi.js ${have} installed, ${want} pinned: run npm --prefix tools/dev ci`);
  let js = fs.readFileSync(path.join(pixiPkg, 'dist', 'pixi.min.js'), 'utf8');
  js = js.replace(/\n\/\/# sourceMappingURL=.*$/, '\n');
  fs.mkdirSync(path.join(game, 'vendor'), { recursive: true });
  fs.writeFileSync(path.join(game, 'vendor', 'pixi.min.js'), `/*! PixiJS v${have} | MIT License | https://github.com/pixijs/pixijs */\n${js}`);
  console.log(`vendor: pixi.js ${have} (${(js.length / 1024).toFixed(0)} KB)`);
} else if (!fs.existsSync(path.join(game, 'vendor', 'pixi.min.js'))) {
  throw new Error('vendor/pixi.min.js missing and tools/dev not installed');
}
// The route lives in the shared corpus in the monorepo; a standalone game repo keeps the copied file.
for (const p of [path.join(game, '..', '..', 'research', 'match3-route.json'), path.join(game, 'research', 'match3-route.json')]) {
  if (fs.existsSync(p)) { fs.copyFileSync(p, path.join(game, 'data', 'route.json')); console.log('data: route.json from', path.relative(game, p)); break; }
}
