// Council wave 4, batch C: polish across the game (C4-03, C4-05, S3-07, S3-09, S1-19, S4-14, S5-17, C4-12, C4-02, C4-04).
// Nothing here depends on chance or the clock: boards and levels are seeded, waits are for conditions, and the level checks run the engine in Node.
import assert from 'node:assert/strict';
import fs from 'node:fs';

export const tests = [];
const same = (t, a, b, m) => t.equal(JSON.stringify(a), JSON.stringify(b), m);

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

// --- C4-05: a bonus card for each finished world ------------------------------------------------------------------------------------
const BONUS = JSON.parse(fs.readFileSync(new URL('../data/bonus-lore.json', import.meta.url), 'utf8'));
const LORE = JSON.parse(fs.readFileSync(new URL('../data/lore.json', import.meta.url), 'utf8'));
const worldProgress = (w, except) => Object.fromEntries(Array.from({ length: 10 }, (_, i) => `w${w}-${String(i + 1).padStart(2, '0')}`).filter((id) => id !== except).map((id) => [id, { stars: 1, best: 1000 }]));
const bonusOf = (w) => BONUS.find((c) => c.world === w);
tests.push({
  name: 'C4-05 the data: six bonus cards, one a world, apart from the sixty stop cards, and the facts check passes',
  node: true,
  async run() {
    const { checkFacts } = await import('../tools/check-facts.mjs');
    const r = checkFacts();
    assert.deepEqual(r.problems, [], 'check-facts reads clean');
    assert.equal(r.count, 60, 'the stop cards are still sixty');
    assert.equal(r.bonusCount, 6, 'and the bonus cards are counted apart');
    assert.deepEqual(BONUS.map((c) => c.world).sort(), [1, 2, 3, 4, 5, 6], 'one for each world');
    assert.equal(LORE.filter((c) => BONUS.some((b) => b.id === c.id)).length, 0, 'none of them is a stop card');
    for (let w = 1; w <= 6; w++) assert.equal(LORE.filter((c) => c.world === w).length, 10, `world ${w} still has ten stop cards`);
  },
});
tests.push({
  name: 'C4-05 finishing a world earns its bonus card, announced once on the postcard card',
  async run(t) {
    await t.game('act', 'progress', worldProgress(1, 'w1-10'));
    await t.game('newGame', { level: 'w1-10', seed: 3, tips: false });
    await t.waitIdle();
    same(t, (await t.state()).bonus, [], 'nine stops are not enough');
    await t.game('act', 'win');
    await t.waitIdle();
    same(t, (await t.state()).bonus, [bonusOf(1).id], 'the tenth stop earns it');
    await t.page.locator('#modal [data-act="world"]').click();
    await t.page.waitForSelector('#modal .bonus-card');
    const card = await t.page.locator('#modal .bonus-card').innerText();
    t.expect(card.includes(bonusOf(1).text) && card.includes(bonusOf(1).title) && /New bonus card/i.test(card), 'the world card shows it, marked as new');
    t.equal(await t.page.locator('#modal .bonus-card').count(), 1, 'once');
    t.expect((await t.page.locator('#live').textContent()).includes(bonusOf(1).title), 'and a screen reader hears it');
    await t.checkLayout();
    await t.shot('C4-05-world-complete');
    await t.page.locator('#modal [data-act="map"]').click();
    await t.waitIdle();
    await t.game('newGame', { level: 'w1-02', seed: 3, tips: false });
    await t.waitIdle();
    await t.game('act', 'win'); // replaying a stop of a finished world gives nothing new and shows no bonus card
    await t.waitIdle();
    t.equal(await t.page.locator('#modal .bonus-card').count(), 0, 'the results card of a stop carries no bonus card');
    same(t, (await t.state()).bonus, [bonusOf(1).id], 'and the list is unchanged');
  },
});
tests.push({
  name: 'C4-05 a save that finished a world earlier has its card, quietly, and nothing is written for it',
  async run(t) {
    await t.game('act', 'save', { progress: { ...worldProgress(1), ...worldProgress(3) } });
    await t.reload();
    await t.game('scene', 'title');
    await t.waitIdle();
    const before = await t.page.evaluate(() => localStorage.getItem('spa-city-sparkle:v1'));
    same(t, (await t.state()).bonus.sort(), [bonusOf(1).id, bonusOf(3).id].sort(), 'worlds 1 and 3 give theirs on load');
    t.equal(await t.page.locator('#modal .bonus-card').count(), 0, 'with no card shown');
    t.equal((await t.page.locator('#toast').textContent()).trim(), '', 'and no toast');
    await t.game('scene', 'scrapbook', 1);
    await t.waitIdle();
    t.equal(await t.page.locator('#modal .scrap .bonus-card:not(.blank)').count(), 1, 'the Scrapbook shows it after the ten stop cards');
    t.equal(await t.page.evaluate(() => localStorage.getItem('spa-city-sparkle:v1')), before, 'opening it writes nothing');
    t.expect((await t.page.locator('#modal').innerText()).includes('2 of 6 bonus cards'), 'and counts two of six');
  },
});
tests.push({
  name: 'C4-05 the Scrapbook: a bonus card after the stop cards, a blank where the world is not finished, the sixty unchanged',
  async run(t) {
    await t.game('act', 'save', { progress: worldProgress(2, 'w2-07') });
    await t.game('scene', 'scrapbook', 2);
    await t.waitIdle();
    t.expect((await t.page.locator('#modal').innerText()).includes('0 of 60 cards found'), 'the count of stop cards stays out of 60');
    t.equal(await t.page.locator('#modal .scrap .lore').count(), 10, 'ten stop cards');
    const items = await t.page.locator('#modal .scrap > li').evaluateAll((l) => l.map((e) => e.className));
    t.equal(items.length, 11, 'and the bonus after them');
    t.expect(/bonus-card/.test(items[10]) && /blank/.test(items[10]), 'a blank, last');
    t.expect(/Finish all ten stops of this world/.test(await t.page.locator('#modal .scrap .bonus-card').innerText()), 'it says how to earn it');
    await t.game('act', 'save', { progress: worldProgress(2) });
    await t.game('scene', 'scrapbook', 2);
    await t.waitIdle();
    await t.page.locator('#modal .scrap').evaluate((e) => { e.scrollTop = e.scrollHeight; });
    const card = await t.page.locator('#modal .scrap .bonus-card').innerText();
    t.expect(card.includes(bonusOf(2).title) && card.includes(bonusOf(2).text) && card.includes('Source: ' + bonusOf(2).source), 'finished: title, text and source, word for word');
    await t.checkLayout();
    await t.shot('C4-05-scrapbook-bonus');
  },
});
tests.push({
  name: 'C4-05 every bonus card fits the Scrapbook and the postcard card without clipping',
  async run(t) {
    await t.game('act', 'save', { progress: Object.fromEntries([1, 2, 3, 4, 5, 6].flatMap((w) => Object.entries(worldProgress(w)))) });
    for (const w of [1, 2, 3, 4, 5, 6]) {
      await t.game('scene', 'scrapbook', w);
      await t.waitIdle();
      const r = await t.page.evaluate(() => { const li = document.querySelector('#modal .scrap .bonus-card'); li.scrollIntoView(); const m = document.getElementById('modal'); return { clipped: li.scrollWidth > li.clientWidth + 1, wide: m.scrollWidth > m.clientWidth + 1, text: li.innerText }; });
      t.expect(!r.clipped && !r.wide, `world ${w}: nothing sideways`);
      t.expect(r.text.includes(bonusOf(w).text), `world ${w}: the whole text is there`);
      await t.game('scene', 'world', w);
      await t.waitIdle();
      const c = await t.page.locator('#modal .bonus-card').innerText();
      t.expect(c.includes(bonusOf(w).text) && c.includes('Source: ' + bonusOf(w).source), `world ${w}: the postcard card carries it`);
      t.expect(await t.page.evaluate(() => { const m = document.getElementById('modal'); return m.scrollWidth <= m.clientWidth + 1; }), `world ${w}: the postcard card has no sideways scroll`);
    }
  },
});
tests.push({
  name: 'C4-05 a world with no bonus card behaves: no blank, no card, no error',
  async run(t) {
    await t.game('act', 'save', { progress: worldProgress(1) });
    await t.page.evaluate(() => { BONUS.splice(BONUS.findIndex((c) => c.world === 1), 1); });
    await t.game('scene', 'scrapbook', 1);
    await t.waitIdle();
    t.equal(await t.page.locator('#modal .scrap > li').count(), 10, 'ten stop cards and nothing else');
    t.equal(await t.page.locator('#modal .bonus-card').count(), 0, 'no bonus card, not even a blank');
    await t.game('scene', 'world', 1);
    await t.waitIdle();
    t.equal(await t.page.locator('#modal .bonus-card').count(), 0, 'the postcard card has none');
    t.expect(!(await t.state()).bonus.includes('hs-0582'), 'and none is earned');
  },
});
