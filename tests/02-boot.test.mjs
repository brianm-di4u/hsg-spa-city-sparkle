// Boot, title, a level renders, a swap resolves through the real view.
export const tests = [
  {
    name: 'boot to title',
    async run(t) {
      await t.waitIdle();
      const s = await t.state();
      t.equal(s.scene, 'title', 'title scene');
      t.expect(t.loadMs < 4000, `hooks ready in ${t.loadMs} ms`);
      await t.shot('02-title');
      await t.checkLayout();
    },
  },
  {
    name: 'level renders and a swap resolves',
    async run(t) {
      await t.seed(5);
      await t.game('newGame', { level: 'w1-01', seed: 5, tips: false });
      await t.waitIdle();
      await t.shot('02-board');
      const legal = await t.game('act', 'legal');
      t.expect(legal.length > 0, 'legal moves exist');
      const before = await t.state();
      const r = await t.game('act', 'swap', legal[0][0], legal[0][1]);
      t.equal(r.valid, true, `swap valid (${r.reason})`);
      await t.game('act', 'clock', 200);
      await t.shot('02-mid-swap', { wait: false });
      await t.game('act', 'clock', null);
      await t.waitIdle(8000);
      const after = await t.state();
      t.equal(after.movesUsed, before.movesUsed + 1, 'one move used');
      t.expect(after.score > before.score, 'scored');
      await t.shot('02-after');
      await t.checkLayout();
    },
  },
];
