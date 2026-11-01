// Performance: file sizes (Node), load time, frame cost while cascading, heap (AC41).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const tests = [
  {
    name: 'sizes: index.html at most 2 MB, assets at most 6 MB',
    node: true,
    run(t) {
      const html = fs.statSync(path.join(game, 'index.html')).size;
      let assets = 0;
      for (const f of fs.readdirSync(path.join(game, 'assets'))) assets += fs.statSync(path.join(game, 'assets', f)).size;
      t.log(`index.html ${(html / 1024).toFixed(0)} KB, assets ${(assets / 1024 / 1024).toFixed(2)} MB (art-data.js repeats the WebP files as base64)`);
      t.expect(html <= 2 * 1024 * 1024, 'index.html within 2 MB');
      t.expect(assets <= 6 * 1024 * 1024, 'assets within 6 MB');
    },
  },
  {
    name: 'loads fast and plays a cascade within the frame budget',
    async run(t) {
      t.expect(t.loadMs < 2500, `hooks in ${t.loadMs} ms`);
      await t.game('newGame', { level: 'w1-07', seed: 6, tips: false });
      await t.waitIdle();
      const legal = await t.game('act', 'legal');
      await t.game('act', 'swap', ...legal[0]);
      const fc = await t.frameCost(1200);
      t.log(`frame cost: task ${fc.taskMs.toFixed(2)} ms, script ${fc.scriptMs.toFixed(2)} ms, ${fc.fps.toFixed(0)} fps (${t.gpu ? 'GPU' : 'SwiftShader'})`);
      t.expect(fc.taskMs < (t.gpu ? 10 : 16), `main-thread task ${fc.taskMs.toFixed(2)} ms per frame`);
      await t.waitIdle(8000);
      const mb = await t.memoryMB();
      t.log(`heap ${mb.toFixed(1)} MB`);
      t.expect(mb < 120, 'heap under 120 MB');
    },
  },
];
