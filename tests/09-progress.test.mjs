// Progress, saves and settings: map unlocks, postcards, persistence, blocked storage, Continue (AC25-AC27, AC38, AC39).
export const tests = [
  {
    name: 'clearing levels unlocks the next and restores the postcard',
    async run(t) {
      const prog = {};
      for (let n = 1; n <= 5; n++) prog[`w1-${String(n).padStart(2, '0')}`] = { stars: (n % 3) + 1, best: 10000 };
      await t.game('act', 'progress', prog);
      await t.game('scene', 'map');
      await t.waitIdle();
      t.equal(await t.page.locator('.node.locked').count(), 54, 'six levels open');
      await t.game('scene', 'map', 'w1-06');
      await t.waitIdle();
      const head = await t.page.locator('.map-top').innerText();
      t.expect(/W(orld )?1/.test(head) && /5\/10 restored/.test(head), `postcard half restored (${head.replace(/\s+/g, ' ')})`);
      await t.shot('09-map');
    },
  },
  {
    name: 'settings persist across a reload',
    async run(t) {
      await t.waitIdle();
      await t.page.locator('[data-act="settings"]').click();
      await t.waitIdle();
      await t.page.locator('[data-toggle="sound"]').click();
      await t.page.locator('[data-motion="reduced"]').click();
      await t.reload();
      await t.waitIdle();
      const s = await t.state();
      t.equal(s.settings.sound, false, 'sound stays off');
      t.equal(s.settings.motion, 'reduced', 'motion stays reduced');
      t.equal(s.reduced, true, 'reduced motion applied');
    },
  },
  {
    name: 'save and Continue restore the level exactly',
    async run(t) {
      await t.game('newGame', { level: 'w1-02', seed: 9, tips: false });
      await t.waitIdle();
      const legal = await t.game('act', 'legal');
      await t.game('act', 'swap', ...legal[0]);
      await t.waitIdle(8000);
      const before = await t.state();
      await t.reload();
      await t.waitIdle();
      t.equal(await t.page.locator('[data-act="continue"]').count(), 1, 'Continue offered');
      await t.page.locator('[data-act="continue"]').click();
      await t.waitIdle();
      const after = await t.state();
      t.equal(after.hash, before.hash, 'same board, RNG, moves and score');
      t.equal(after.movesLeft, before.movesLeft, 'same moves left');
    },
  },
  {
    name: 'the game runs when localStorage throws',
    initScript: () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage blocked'); } }); },
    async run(t) {
      await t.waitIdle();
      t.equal((await t.state()).storageOk, false, 'storage reported unavailable');
      await t.game('newGame', { level: 'w1-01', seed: 1, tips: false });
      await t.waitIdle();
      const legal = await t.game('act', 'legal');
      t.equal((await t.game('act', 'swap', ...legal[0])).valid, true, 'play works');
      await t.waitIdle(8000);
      await t.game('scene', 'win', 'w1-01');
      await t.waitIdle();
      t.expect((await t.state()).progress['w1-01'], 'progress kept in memory');
    },
  },
];
