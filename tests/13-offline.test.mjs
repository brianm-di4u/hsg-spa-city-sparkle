// Offline: the game plays from file:// with its art (data URIs), and the vector fallback works with ?art=0 (AC40).
export const tests = [
  {
    name: 'plays from file:// with the rendered art',
    fileUrl: true,
    async run(t) {
      await t.waitIdle(8000);
      await t.game('newGame', { level: 'w1-01', seed: 2, tips: false });
      await t.waitIdle(8000);
      t.equal((await t.state()).art, 'art', 'art loaded from file://');
      const legal = await t.game('act', 'legal');
      t.equal((await t.game('act', 'swap', ...legal[0])).valid, true, 'swap works offline');
      await t.waitIdle(8000);
      await t.shot('13-file-url');
    },
  },
  {
    name: 'vector fallback with ?art=0',
    url: 'index.html?art=0',
    async run(t) {
      await t.waitIdle();
      await t.game('newGame', { level: 'w1-06', seed: 2, tips: false });
      await t.waitIdle();
      t.equal((await t.state()).art, 'vector', 'vector art');
      await t.shot('13-fallback');
    },
  },
];
