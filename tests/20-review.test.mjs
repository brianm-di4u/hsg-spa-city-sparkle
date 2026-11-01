// Review capture set for the adversarial visual loop (reviews/PROTOCOL.md, VISUAL-PLAN §6). Slow: runs with
// --slow or --milestone final, and on its own with --file review --milestone review-loop-N --gpu.
// Frames R01-R17 at both viewports; motion strips as numbered frames S<n>-<k> that tools/review/compose.py tiles.
async function frame(t, name) { await t.waitFrames(3); await t.shot(name, { wait: false }); }
async function strip(t, name, fracs) {
  const total = await t.game('act', 'replay');
  for (let k = 0; k < fracs.length; k++) { await t.game('act', 'clock', Math.round(total * fracs[k])); await frame(t, `${name}-${k + 1}`); }
  await t.game('act', 'clock', null);
  await t.waitIdle(10000);
}
const BASE = ['a b c d e a b', 'c d e a b c d', 'e a b c d e a', 'b c d e a b c', 'd e a b c d e', 'a b c d e a b', 'c d e a b c d'];
const edit = (rows, edits) => { const g = rows.map((r) => r.split(' ')); for (const [x, y, v] of edits) g[y][x] = v; return g.map((r) => r.join(' ')); };
const WORLD_LEVEL = { 1: 'w1-07', 2: 'w2-05', 3: 'w3-08', 4: 'w4-09', 5: 'w5-07', 6: 'w6-10' };

export const tests = [
  {
    name: 'review capture set',
    slow: true,
    async run(t) {
      await t.waitIdle(10000);
      await t.shot('R01-title');
      const prog = {};
      for (let n = 1; n <= 10; n++) prog[`w1-${String(n).padStart(2, '0')}`] = { stars: (n % 3) + 1, best: 9000 };
      for (let n = 1; n <= 4; n++) prog[`w2-${String(n).padStart(2, '0')}`] = { stars: 2, best: 9000 };
      await t.game('act', 'progress', prog);
      await t.game('scene', 'map', 'w2-05');
      await t.waitIdle(10000);
      await t.shot('R02-map');
      for (let w = 1; w <= 6; w++) {
        await t.game('newGame', { level: WORLD_LEVEL[w], seed: 40 + w, tips: false });
        await t.waitIdle(10000);
        const legal = await t.game('act', 'legal');
        await t.game('act', 'swap', ...legal[0]);
        await t.game('act', 'skip');
        await t.waitIdle(10000);
        await t.shot(`R0${w + 2}-world${w}`);
      }
      // specials mid-fire (world 1 look)
      await t.game('newGame', { level: 'w1-07', seed: 7, tips: false });
      await t.game('act', 'board', edit(BASE, [[1, 3, 'aH'], [2, 3, 'a'], [3, 2, 'a']]));
      await t.waitIdle(8000);
      await t.game('act', 'swap', [3, 2], [3, 3]);
      await t.waitIdle(10000);
      await t.game('act', 'replay'); await t.game('act', 'clock', (await t.game('act', 'beatAt', 'fire', 'h')) || 400); await frame(t, 'R09-cascade-fire');
      await t.game('act', 'clock', null); await t.waitIdle(10000);
      await strip(t, 'S1', [0.02, 0.05, 0.08, 0.2, 0.36, 0.6, 0.67, 0.74, 0.8, 0.86]);
      await t.game('act', 'board', edit(BASE, [[3, 3, 'aB'], [4, 3, 'a'], [5, 2, 'a']]));
      await t.waitIdle(8000);
      await t.game('act', 'swap', [5, 2], [5, 3]);
      await t.waitIdle(10000);
      await t.game('act', 'replay'); await t.game('act', 'clock', (await t.game('act', 'beatAt', 'fire', 'b')) || 400); await frame(t, 'R10-stone-fire');
      await t.game('act', 'clock', null); await t.waitIdle(10000);
      await t.game('act', 'board', edit(BASE, [[3, 3, 'C']]));
      await t.waitIdle(8000);
      await t.game('act', 'swap', [3, 3], [4, 3]);
      await t.waitIdle(10000);
      await t.game('act', 'replay'); await t.game('act', 'clock', ((await t.game('act', 'beatAt', 'fire', 'C')) || 400) + 60); await frame(t, 'R11-crystal-rays');
      await t.game('act', 'clock', null); await t.waitIdle(10000);
      await strip(t, 'S2', [0.06, 0.16, 0.28, 0.42, 0.58, 0.72, 0.84, 0.95]);
      // a chain callout
      await t.game('newGame', { level: 'w1-01', seed: 11, tips: false });
      await t.waitIdle(8000);
      for (let m = 0; m < 14; m++) {
        const legal = await t.game('act', 'legal');
        const r = await t.game('act', 'swap', ...legal[m % legal.length]);
        await t.game('act', 'skip'); await t.waitIdle(8000);
        if (r.waves >= 3) { await t.game('act', 'replay'); await t.game('act', 'clock', (await t.game('act', 'beatAt', 'wave', 2)) + 60); await frame(t, 'R12-callout'); await t.game('act', 'clock', null); await t.waitIdle(10000); break; }
      }
      await t.game('newGame', { level: 'w1-04', seed: 3, tips: false });
      await t.waitIdle(8000);
      await t.game('scene', 'win', 'w1-04');
      await t.waitIdle(8000); await t.waitForAnimations();
      await t.shot('R13-win');
      await t.game('newGame', { level: 'w2-03', seed: 3, tips: false });
      await t.waitIdle(8000);
      await t.game('scene', 'lose');
      await t.waitIdle(8000); await t.waitForAnimations();
      await t.shot('R14-lose');
      await t.game('scene', 'map', 'w1-05');
      await t.waitIdle(8000);
      await t.game('scene', 'intro', 'w2-05');
      await t.waitIdle(8000);
      await t.shot('R15-intro');
      await t.game('scene', 'help', 'specials');
      await t.waitIdle(8000);
      await t.shot('R16-help');
      await t.game('newGame', { level: 'w3-04', seed: 5, tips: true });
      await t.waitIdle(8000);
      await t.game('act', 'tip', 'fog');
      await t.waitIdle(8000);
      await t.shot('R17-tip');
    },
  },
];
