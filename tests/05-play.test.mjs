// Play through the real view: bounce, cascades, every special and combo in frozen-clock frames, chain
// callouts, Encore, hints and Skip.
const BASE5 = ['a b c d e', 'c d e a b', 'e a b c d', 'b c d e a', 'd e a b c'];
const edit = (rows, edits) => { const g = rows.map((r) => r.split(' ')); for (const [x, y, v] of edits) g[y][x] = v; return g.map((r) => r.join(' ')); };

async function frozenAt(t, name, type, n, frac = 0) {
  const total = await t.game('act', 'replay');
  let ms = await t.game('act', 'beatAt', type, n);
  if (ms == null) { t.fail(`${name}: no ${type} beat`); ms = total / 2; }
  await t.game('act', 'clock', ms + frac);
  await t.waitFrames(3);
  await t.shot(name, { wait: false });
  await t.game('act', 'clock', null);
  await t.waitIdle(8000);
}

export const tests = [
  {
    name: 'an invalid swap bounces back and spends nothing',
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 2, tips: false });
      await t.game('act', 'board', ['a b c a', 'b c a b', 'c a b c', 'd e d e'], { spawners: true });
      await t.waitIdle();
      const r = await t.game('act', 'swap', [0, 0], [1, 0]);
      t.equal(r.valid, false, 'invalid'); t.equal(r.reason, 'nomatch', 'no match');
      await t.game('act', 'clock', 120);
      await t.waitFrames(3);
      await t.shot('05-bounce', { wait: false });
      await t.game('act', 'clock', null);
      await t.waitIdle();
      t.equal((await t.state()).movesUsed, 0, 'no move spent');
    },
  },
  {
    name: 'specials fire: Cascade, Hot Stone, Spring Crystal (frozen frames)',
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
      await t.game('act', 'board', ['aH a c b e', 'd e a e c', 'b d b d a', 'c a e c b', 'e b d a c']);
      await t.waitIdle();
      t.equal((await t.game('act', 'swap', [2, 1], [2, 0])).valid, true, 'cascade swap');
      await t.waitIdle(8000);
      await frozenAt(t, '05-cascade-fire', 'fire', 'h', 60);
      await t.game('act', 'board', ['c d e f c', 'd e f c d', 'e f aB a c', 'f c d e a', 'c d e f c']);
      await t.waitIdle();
      t.equal((await t.game('act', 'swap', [4, 3], [4, 2])).valid, true, 'stone swap');
      await t.waitIdle(8000);
      await frozenAt(t, '05-stone-fire', 'fire', 'b', 60);
      await t.game('act', 'board', edit(BASE5, [[0, 0, 'C']]));
      await t.waitIdle();
      t.equal((await t.game('act', 'swap', [0, 0], [1, 0])).combo, 'Cx', 'crystal swap');
      await t.waitIdle(8000);
      await frozenAt(t, '05-crystal-fire', 'fire', 'C', 80);
    },
  },
  {
    name: 'combos: Cascade+Cascade, Cascade+Stone, Stone+Stone, Crystal+Crystal',
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
      const cases = [['GG', [[0, 0, 'aH'], [1, 0, 'bV']]], ['GB', [[0, 0, 'aH'], [1, 0, 'bB']]], ['BB', [[0, 0, 'aB'], [1, 0, 'bB']]], ['CC', [[0, 0, 'C'], [1, 0, 'C']]]];
      for (const [kind, edits] of cases) {
        await t.game('act', 'board', edit(BASE5, edits));
        await t.waitIdle();
        const r = await t.game('act', 'swap', [0, 0], [1, 0]);
        t.equal(r.combo, kind, `${kind} combo`);
        await t.waitIdle(10000);
        await frozenAt(t, `05-combo-${kind}`, 'combo', null, -180);
      }
    },
  },
  {
    name: 'a long chain shows a callout; Skip lands on the same board as full playback',
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 11, tips: false });
      await t.waitIdle();
      let found = false;
      for (let m = 0; m < 14 && !found; m++) {
        const legal = await t.game('act', 'legal');
        const r = await t.game('act', 'swap', ...legal[m % legal.length]);
        await t.game('act', 'skip');
        await t.waitIdle(8000);
        if (r.waves >= 3) { found = true; await frozenAt(t, '05-callout', 'wave', 2, 80); }
        if ((await t.state()).phase !== 'play') break;
      }
      t.expect(found, 'found a chain of 3+ waves');
      // Skip vs full playback from the same seed and moves
      const play = async (skip) => {
        await t.game('newGame', { level: 'w1-02', seed: 21, tips: false });
        await t.waitIdle();
        for (let m = 0; m < 3; m++) {
          const legal = await t.game('act', 'legal');
          await t.game('act', 'swap', ...legal[0]);
          if (skip) await t.game('act', 'skip');
          await t.waitIdle(10000);
        }
        return (await t.state()).hash;
      };
      t.equal(await play(true), await play(false), 'skip and full playback give the same state');
    },
  },
  {
    name: 'winning with moves left plays the Encore; results show stars and the bonus',
    async run(t) {
      await t.game('newGame', { level: 'w1-02', seed: 5, tips: false });
      await t.game('act', 'board', ['a b a d e c', 'c a c e d b', 'd e f d c a', 'e d c f e b', 'b c e a d f'], { moves: 4, goals: [{ type: 'collect', kind: 0, need: 3 }], stars: [100, 200, 1e9] });
      await t.waitIdle();
      t.equal((await t.game('act', 'swap', [1, 1], [1, 0])).valid, true, 'winning swap');
      await t.waitIdle(15000);
      await t.waitForAnimations();
      const s = await t.state();
      t.equal(s.phase, 'won', 'won after the Encore');
      t.expect(s.encoreScore > 0, `Encore scored ${s.encoreScore}`);
      t.equal(s.scene, 'win', 'results shown');
      await t.shot('05-encore-results');
    },
  },
  {
    name: 'a hint pulses after 5 seconds idle',
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 8, tips: false });
      await t.waitIdle();
      t.equal((await t.state()).hint, null, 'no hint at first');
      await t.page.waitForTimeout(5600);
      const s = await t.state();
      t.expect(Array.isArray(s.hint) && s.hint.length === 2, 'hint shown after 5 s');
      await t.shot('05-hint', { wait: false });
    },
  },
];
