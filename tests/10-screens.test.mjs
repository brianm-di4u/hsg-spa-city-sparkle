// Screens: title, map, intro, help tabs, settings, about, pause, tutorial tip, results, world complete, Free Soak.
export const tests = [
  {
    name: 'title, map and level intro',
    async run(t) {
      await t.waitIdle();
      await t.shot('10-title');
      await t.checkLayout();
      await t.game('scene', 'map');
      await t.waitIdle();
      const s = await t.state();
      t.equal(s.scene, 'map', 'map scene');
      t.equal(await t.page.locator('.node').count(), 60, '60 level nodes');
      t.equal(await t.page.locator('.node.locked').count(), 59, 'only the first level is open');
      await t.shot('10-map');
      await t.page.locator('.node[data-level="w1-01"]').click({ force: true }); // the current node bobs, so it is never 'stable'
      await t.waitIdle();
      t.equal((await t.state()).scene, 'intro', 'tapping a node opens the intro');
      await t.shot('10-intro');
      await t.checkLayout();
      await t.page.locator('[data-act="go"]').click();
      await t.waitIdle();
      t.equal((await t.state()).scene, 'game', 'Play starts the level');
      t.expect((await t.state()).tip, 'first level shows the basics tip');
      await t.shot('10-tutorial');
      await t.page.locator('#tip [data-act="ok"]').click();
      t.expect((await t.state()).tutorialSeen.includes('basics'), 'tip remembered');
    },
  },
  {
    name: 'help tabs, settings and about',
    async run(t) {
      await t.waitIdle();
      await t.page.locator('[data-act="help"]').click();
      await t.waitIdle();
      for (const tab of ['basics', 'specials', 'combos', 'blockers', 'goals', 'controls']) {
        await t.page.locator(`[data-tab="${tab}"]`).click();
        await t.waitIdle();
        await t.shot(`10-help-${tab}`);
      }
      await t.checkLayout();
      await t.page.locator('[data-act="close"]').click();
      await t.page.locator('[data-act="settings"]').click();
      await t.waitIdle();
      await t.shot('10-settings');
      await t.checkLayout();
      await t.page.locator('[data-act="close"]').click();
      await t.page.locator('[data-act="about"]').click();
      await t.waitIdle();
      await t.shot('10-about');
      const text = await t.page.locator('#modal').innerText();
      t.expect(/MIT/.test(text) && /fictional/.test(text) && /Blender/.test(text), 'about credits licence, fiction line and art provenance');
    },
  },
  {
    name: 'pause, win with lore card, lose and world complete',
    async run(t) {
      await t.game('newGame', { level: 'w1-03', seed: 3, tips: false });
      await t.waitIdle();
      await t.game('scene', 'pause');
      await t.waitIdle();
      await t.shot('10-pause');
      await t.game('scene', 'win', 'w1-03');
      await t.waitIdle();
      await t.waitForAnimations();
      const s = await t.state();
      t.equal(s.scene, 'win', 'win scene');
      t.expect(s.progress['w1-03'], 'progress saved');
      t.expect(s.lore.length === 1, 'lore card collected');
      t.expect(await t.page.locator('.lore .src').count() === 1, 'lore card shows its source');
      await t.shot('10-win');
      await t.checkLayout();
      await t.game('newGame', { level: 'w1-04', seed: 3, tips: false });
      await t.waitIdle();
      await t.game('scene', 'lose');
      await t.waitIdle();
      await t.shot('10-lose');
      await t.game('scene', 'world', 1);
      await t.waitIdle();
      await t.shot('10-world');
    },
  },
  {
    name: 'Free Soak unlocks after world 1 and has no goals or move limit',
    async run(t) {
      const prog = {};
      for (let n = 1; n <= 10; n++) prog[`w1-${String(n).padStart(2, '0')}`] = { stars: 2, best: 1000 };
      await t.game('act', 'progress', prog);
      await t.game('scene', 'title');
      await t.waitIdle();
      t.equal(await t.page.locator('[data-act="soak"]').isDisabled(), false, 'Free Soak enabled');
      await t.page.locator('[data-act="soak"]').click();
      await t.waitIdle();
      const s = await t.state();
      t.equal(s.scene, 'soak', 'soak scene');
      t.equal(s.movesLeft, null, 'no move limit');
      t.equal(s.goals.length, 0, 'no goals');
      await t.shot('10-soak');
    },
  },
];
