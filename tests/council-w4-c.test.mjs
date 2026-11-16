// Council wave 4, batch C: polish across the game (C4-03, C4-05, S3-07, S3-09, S1-19, S4-14, S5-17, C4-12, C4-02, C4-04).
// Nothing here depends on chance or the clock: boards and levels are seeded, waits are for conditions, and the level checks run the engine in Node.
export const tests = [];

const WORLD1 = Object.fromEntries(Array.from({ length: 10 }, (_, i) => ['w1-' + String(i + 1).padStart(2, '0'), { stars: 2, best: 1000 }]));
const fits = (t, sel) => t.page.evaluate((q) => {
  const r = [...document.querySelectorAll(q)].map((e) => { const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, h: b.height, label: e.textContent.trim() }; });
  return { boxes: r, W: window.innerWidth, H: window.innerHeight, scrollX: document.documentElement.scrollWidth > window.innerWidth };
}, sel);

// --- C4-03: Free Soak returns beside the Daily Challenge ------------------------------------------------------------------------------
tests.push({
  name: 'C4-03 Free Soak unlocks after world 1 and has no goals or move limit',
  async run(t) {
    await t.game('act', 'progress', WORLD1);
    await t.game('scene', 'title');
    await t.waitIdle();
    t.equal(await t.page.locator('#screen [data-act="soak"]').getAttribute('aria-disabled'), null, 'Free Soak is open');
    await t.page.locator('#screen [data-act="soak"]').click();
    await t.page.waitForFunction(() => window.__game.getState().scene === 'game' && window.__game.getState().level === 'soak', null, { timeout: 8000 });
    await t.waitIdle();
    const s = await t.state();
    t.equal(s.movesLeft, null, 'no move limit');
    t.equal(s.goals.length, 0, 'no goals');
    t.equal(s.phase, 'play', 'it plays');
    t.equal(await t.page.evaluate(() => window.__game.engineState().mode), 'soak', 'in the soak mode, as before wave 2');
  },
});
tests.push({
  name: 'C4-03 a locked Free Soak says why and answers a tap',
  async run(t) {
    await t.game('scene', 'title');
    await t.waitIdle();
    const soak = t.page.locator('#screen [data-act="soak"]');
    t.equal(await soak.getAttribute('aria-disabled'), 'true', 'announced as unavailable');
    t.expect(await soak.evaluate((b) => !b.disabled), 'still a live button, so the tap is answered');
    t.expect(await soak.evaluate((b) => b.innerHTML.includes('<svg')), 'with a padlock icon');
    t.expect(/Bathhouse Row/.test(await t.page.locator('#screen .menu-note').last().innerText()), 'the note names what unlocks it');
    await soak.click({ force: true });
    t.expect(/Bathhouse Row/.test(await t.page.locator('#toast').innerText()), 'a tap shows the unlock hint');
    t.equal((await t.state()).scene, 'title', 'stays on the title');
  },
});
tests.push({
  name: 'C4-03 Free Soak HUD: whole label, no star bar, no number',
  async run(t) {
    await t.game('scene', 'freesoak');
    await t.waitIdle();
    const r = await t.page.evaluate(() => {
      const w = document.getElementById('hud-world'), nm = document.getElementById('hud-name'), th = document.querySelector('.thermo'), n = document.getElementById('hud-next');
      return { text: w.textContent, name: nm.textContent, clipped: w.scrollWidth > w.clientWidth || nm.scrollWidth > nm.clientWidth, thermo: th.offsetParent !== null, next: n.offsetParent !== null };
    });
    t.equal(r.name, 'Free Soak', 'named, with no "0." in front');
    t.equal(r.text, 'Endless board', 'short label');
    t.expect(!r.clipped, 'neither label is truncated');
    t.expect(!r.thermo, 'star thermometer hidden in a goal-less mode');
    t.expect(!r.next, 'next-star line hidden in a goal-less mode');
    await t.shot('C4-03-free-soak');
  },
});
tests.push({
  name: 'C4-03 the title offers both the Daily Challenge and Free Soak, whole on screen',
  async run(t) {
    await t.game('act', 'progress', WORLD1);
    await t.game('scene', 'title');
    await t.waitIdle();
    const r = await fits(t, '#screen .menu .btn, #screen .menu-note');
    const labels = r.boxes.map((b) => b.label);
    t.expect(labels.includes('Daily Challenge') && labels.includes('Free Soak'), `both entries are there (${labels.join(' | ')})`);
    for (const b of r.boxes) t.expect(b.l >= 0 && b.r <= r.W && b.t >= 0 && b.b <= r.H, `${b.label} is inside the screen`);
    t.expect(!r.scrollX, 'no sideways scroll');
    const btns = r.boxes.filter((b) => b.label === 'Daily Challenge' || b.label === 'Free Soak');
    t.expect(btns[0].b <= btns[1].t || btns[1].b <= btns[0].t, 'the two buttons do not overlap');
    await t.shot('C4-03-title');
    await t.page.locator('#screen [data-act="daily"]').click();
    await t.page.waitForSelector('#modal .daily-cal');
    t.expect(/Daily Challenge|DAILY/.test(await t.page.locator('#modal').innerText()), 'the Daily Challenge card opens');
  },
});
tests.push({
  name: 'C4-03 Free Soak keeps no score and leaves the save, the Continue slot and the Daily alone',
  async run(t) {
    await t.game('act', 'save', { progress: WORLD1, soakBest: 1234, soakDay: '2026-11-13', daily: { streak: 2, bestStreak: 3, last: '2026-11-13', days: { '2026-11-13': { stars: 2, best: 1234, tries: 1, won: true } } } });
    await t.game('newGame', { level: 'w2-03', seed: 3, tips: false });
    await t.waitIdle();
    await t.game('scene', 'title');
    await t.waitIdle();
    const before = await t.page.evaluate(() => localStorage.getItem('spa-city-sparkle:v1'));
    const cont = (await t.state()).current;
    await t.page.locator('#screen [data-act="soak"]').click();
    await t.page.waitForFunction(() => window.__game.getState().level === 'soak', null, { timeout: 8000 });
    await t.waitIdle();
    const legal = await t.game('act', 'legal');
    t.equal((await t.game('act', 'swap', ...legal[0])).valid, true, 'a move plays');
    await t.waitIdle(8000);
    t.expect((await t.state()).score > 0, 'and it scores');
    t.equal(await t.page.evaluate(() => localStorage.getItem('spa-city-sparkle:v1')), before, 'the stored save is byte for byte the same');
    const s = await t.state();
    t.equal(s.current, cont, 'the Continue slot still holds the journey level');
    t.equal(s.soakBest, 1234, "the Daily's best ever is untouched");
  },
});
tests.push({
  name: 'C4-03 Pause in Free Soak quits to the title and restarts the soak, not a level',
  async run(t) {
    await t.game('act', 'progress', WORLD1);
    await t.game('scene', 'freesoak');
    await t.waitIdle();
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    await t.waitIdle(8000);
    await t.game('scene', 'pause');
    t.equal(await t.page.locator('#modal [data-act="map"]').innerText(), 'Quit to title', 'no map to save to');
    await t.page.locator('#modal [data-act="restart"]').click();
    await t.page.locator('#modal [data-act="restart"]').click(); // it asks first once a move is made
    await t.page.waitForFunction(() => { const s = window.__game.getState(); return s.scene === 'game' && s.level === 'soak' && s.movesUsed === 0; }, null, { timeout: 8000 });
    await t.game('scene', 'pause');
    await t.page.locator('#modal [data-act="map"]').click();
    await t.page.waitForFunction(() => window.__game.getState().scene === 'title', null, { timeout: 8000 });
  },
});
tests.push({
  name: 'C4-03 the Daily Challenge is untouched: the same board for a date, with its moves and goals',
  async run(t) {
    await t.game('act', 'progress', WORLD1);
    await t.game('dailyDate', '2026-11-14');
    const pick = await t.game('dailyPick', '2026-11-14');
    t.equal(pick.seed, 20261114, 'the date gives the same seed');
    await t.game('scene', 'title');
    await t.waitIdle();
    await t.page.locator('#screen [data-act="daily"]').click();
    await t.page.locator('#modal [data-act="go"]').click();
    await t.page.waitForFunction(() => window.__game.getState().level === 'daily', null, { timeout: 8000 });
    await t.waitIdle();
    const s = await t.state();
    t.equal(s.movesLeft, pick.moves, 'its own move limit');
    t.expect(s.goals.length > 0, 'and its goals');
  },
});
tests.push({
  name: 'C4-03 Help says what Free Soak is, with nothing clipped',
  async run(t) {
    await t.game('scene', 'help', 'goals');
    await t.waitIdle();
    const r = await t.page.evaluate(() => { const m = document.getElementById('modal'); return { text: m.innerText, wide: m.scrollWidth > m.clientWidth + 1 }; });
    t.expect(/Free Soak: an endless board with no goals, no move limit and no score kept/.test(r.text), 'Help names it');
    t.expect(!r.wide, 'no sideways overflow');
  },
});
