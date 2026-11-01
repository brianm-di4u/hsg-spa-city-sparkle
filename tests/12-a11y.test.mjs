// Accessibility: contrast on every screen, reduced motion, live region, colour-blind badges, audio events (AC34-AC37, AC42).
export const tests = [
  {
    name: 'text contrast passes on every screen',
    async run(t) {
      await t.waitIdle();
      const check = async (label) => {
        const r = await t.contrastReport({});
        r.fails.slice(0, 4).forEach((f) => t.fail(`${label}: ${JSON.stringify(f)}`));
        t.log(`${label}: ${r.checked} checked`);
      };
      await check('title');
      await t.game('scene', 'intro', 'w1-01'); await t.waitIdle(); await check('intro');
      await t.game('scene', 'help'); await t.waitIdle(); await check('help');
      await t.game('scene', 'settings'); await t.waitIdle(); await check('settings');
      await t.game('scene', 'about'); await t.waitIdle(); await check('about');
      await t.game('newGame', { level: 'w1-03', seed: 2, tips: false }); await t.waitIdle(); await check('game HUD');
      await t.game('scene', 'win', 'w1-03'); await t.waitIdle(); await t.waitForAnimations(); await check('win');
      await t.game('scene', 'map'); await t.waitIdle(); await check('map');
    },
  },
  {
    name: 'reduced motion shortens the animation',
    reducedMotion: true,
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
      await t.waitIdle();
      t.equal((await t.state()).reduced, true, 'system preference honoured');
      const legal = await t.game('act', 'legal');
      await t.game('act', 'swap', ...legal[0]);
      const total = await t.game('act', 'total');
      t.expect(total > 0 && total < 1400, `short animation (${total} ms)`);
      await t.waitIdle(8000);
      await t.shot('12-reduced');
    },
  },
  {
    name: 'the live region announces moves; badges toggle; sounds fire on events',
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
      await t.waitIdle();
      const legal = await t.game('act', 'legal');
      await t.game('act', 'swap', ...legal[0]);
      await t.waitIdle(8000);
      await t.page.waitForTimeout(100);
      const live = await t.page.locator('#live').innerText();
      t.expect(/Score \d+/.test(live) && /moves left/.test(live), `announced: "${live}"`);
      const s = await t.state();
      t.expect(s.sounds.includes('swap') && s.sounds.includes('match'), `sound events: ${s.sounds.join(',')}`);
      await t.game('scene', 'settings');
      await t.page.locator('[data-toggle="badges"]').click();
      await t.page.locator('[data-act="close"]').click();
      await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
      await t.waitIdle();
      t.equal((await t.state()).settings.badges, true, 'badges on');
      await t.shot('12-badges');
      await t.page.addStyleTag({ content: '#stage canvas { filter: grayscale(1) }' });
      await t.waitFrames(2);
      await t.shot('12-grayscale');
    },
  },
];
