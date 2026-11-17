// Council wave 4, batch C: polish across the game (C4-03, C4-05, S3-07, S3-09, S1-19, S4-14, S5-17, C4-12, C4-02, C4-04).
// Nothing here depends on chance or the clock: boards and levels are seeded, waits are for conditions, and the level checks run the engine in Node.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

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
    t.expect(/Free Soak: an endless board with no goals and no move limit\. The running score is not saved\./.test(r.text), 'Help names it');
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
    // the live region is filled 30 ms after it is cleared, so wait for the text rather than read it at once
    await t.page.waitForFunction((title) => document.getElementById('live').textContent.includes(title), bonusOf(1).title, { timeout: 5000 });
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

// --- S3-07 and S3-09: the first levels test a little, and two levels no longer reshuffle every other game -------------------------------
// The engine and both bots are seeded (seed 1000 + n), so the same numbers come out every run: nothing here depends on luck. The thresholds
// sit between what the old levels gave and what the new ones give on these very seeds (the figures are in the batch report).
const LEVELS = JSON.parse(fs.readFileSync(new URL('../data/levels.json', import.meta.url), 'utf8'));
const levelOf = (id) => LEVELS.find((l) => l.id === id);
async function played(id, strategy, n) {
  const { playLevel } = await import('../tools/bots.mjs');
  let won = 0, reshuffles = 0;
  for (let s = 1; s <= n; s++) { const r = playLevel(levelOf(id), 1000 + s, strategy); if (r.won) won++; reshuffles += r.reshuffles; }
  return { win: won / n, reshuffles: reshuffles / n };
}
tests.push({
  name: 'S3-07 a random-swap bot wins w1-02 to w1-04 well under 45 percent of 300 seeded games (it won 56 to 64 percent before)',
  node: true,
  async run() {
    for (const id of ['w1-02', 'w1-03', 'w1-04']) {
      const r = await played(id, 'random', 300);
      assert.ok(r.win < 0.45, `${id}: random bot won ${(r.win * 100).toFixed(1)}%, want under 45%`);
    }
  },
});
tests.push({
  name: 'S3-07 a player who matches on purpose still wins w1-02 to w1-04 nine times in ten (the casual bot, 200 seeded games each, played here from the level files)',
  node: true,
  async run() {
    for (const id of ['w1-02', 'w1-03', 'w1-04']) {
      const r = await played(id, 'casual', 200);
      assert.ok(r.win >= 0.88, `${id}: casual bot won ${(r.win * 100).toFixed(1)}%, want at least 88%`);
    }
  },
});
tests.push({
  name: 'S3-09 w3-08 and w6-05 reshuffle far less than one game in two: the cells under their blockers refill',
  node: true,
  async run() {
    const a = await played('w3-08', 'casual', 30), b = await played('w6-05', 'casual', 25);
    assert.ok(a.reshuffles <= 0.3, `w3-08: ${a.reshuffles.toFixed(2)} reshuffles a game, want 0.3 or less (0.43 before)`);
    assert.ok(b.reshuffles <= 0.1, `w6-05: ${b.reshuffles.toFixed(2)} reshuffles a game, want 0.1 or less (0.41 before)`);
  },
});
tests.push({
  name: 'S3-09 the level check finds no starved cell on w6-05 and only the two walled-in ones on w3-08',
  node: true,
  async run() {
    const { execFileSync } = await import('node:child_process');
    const out = execFileSync(process.execPath, [new URL('../tools/check-levels.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' ')], { encoding: 'utf8' });
    assert.ok(!/w6-05: \d+ cells refill/.test(out), 'w6-05 has no cell that waits for a blocker to break');
    assert.match(out, /w3-08: 2 cells refill only after blockers break/, 'w3-08 keeps its two walled-in cells');
    assert.match(out, /0 errors/);
  },
});

// --- C4-12: the card's inner frame line stays on the card's edge when a long card scrolls ---------------------------------------------
// The line is read from real pixels: a thin strip at the card's bottom-left and top-left corners (seven pixels in from the edge, where the line runs)
// against the paper just above and below it. Before the fix the line was a pseudo-element inside the scroller and scrolled away with the content.
async function linePixels(t, where) {
  const box = await t.page.evaluate(() => { const r = document.querySelector('#modal .card').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const y = where === 'bottom' ? box.y + box.h - 14 : box.y + 1;
  const png = await t.page.screenshot({ clip: { x: box.x + 30, y, width: 40, height: 13 }, scale: 'css' });
  return t.page.evaluate(async (b64) => {
    const bmp = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
    const g = c.getContext('2d'); g.drawImage(bmp, 0, 0);
    const rows = [];
    for (let row = 0; row < bmp.height; row++) { const d = g.getImageData(0, row, bmp.width, 1).data; let sum = 0; for (let i = 0; i < d.length; i += 4) sum += d[i + 1]; rows.push(sum / (d.length / 4)); } // the green channel: the line is reddish, so green drops
    return rows;
  }, png.toString('base64'));
}
tests.push({
  name: 'C4-12 a long Settings card keeps its frame line on the card edge at the top and the bottom of its scroll',
  async run(t) {
    await t.game('scene', 'settings');
    await t.waitIdle();
    const css = await t.page.evaluate(() => { const c = document.querySelector('#modal .card'); const cs = getComputedStyle(c), af = getComputedStyle(c, '::after'); return { outline: cs.outlineWidth, offset: cs.outlineOffset, after: af.content, scrolls: c.scrollHeight > c.clientHeight }; });
    t.equal(css.after === 'none' || css.after === 'normal', true, 'no pseudo-element line left inside the scroller');
    t.equal(parseFloat(css.outline) >= 1 && parseFloat(css.offset) < 0, true, 'the line is the card outline, drawn inside its edge');
    if (t.viewport === 'mobile') t.expect(css.scrolls, 'at phone size the Settings card does scroll (the case this is about)');
    await t.page.locator('#modal .card').evaluate((e) => { e.scrollTop = e.scrollHeight; });
    const bottom = await linePixels(t, 'bottom');
    const hasLine = (rows) => rows.some((v, i) => i >= 2 && i < rows.length - 2 && Math.min(rows[i - 2], rows[i + 2]) - v > 12); // a row clearly less green than the paper two rows either side
    t.expect(hasLine(bottom), `the line runs along the bottom edge after scrolling down (rows ${bottom.map((v) => Math.round(v)).join(' ')})`);
    await t.page.locator('#modal .card').evaluate((e) => { e.scrollTop = 0; });
    const top = await linePixels(t, 'top');
    t.expect(hasLine(top), `and along the top edge at the top (rows ${top.map((v) => Math.round(v)).join(' ')})`);
    await t.page.locator('#modal .card').evaluate((e) => { e.scrollTop = e.scrollHeight; });
    await t.shot('C4-12-settings-scrolled');
  },
});

// --- S5-17: levels glide, and a noise burst rises instead of starting at full gain ----------------------------------------------------------
async function startAudio(t) {
  await t.game('scene', 'settings');
  await t.page.waitForSelector('#vol');
  await t.page.mouse.click(5, 5); // the first touch starts the audio
  await t.page.waitForFunction(() => { const a = window.__game.audioState(); return a.master !== null && a.ctx === 'running'; }, null, { timeout: 8000 });
}
tests.push({
  name: 'S5-17 the master and effects gains glide to a new level: nothing jumps, and they arrive',
  viewports: ['desktop'],
  async run(t) {
    await startAudio(t);
    const r = await t.page.evaluate(() => {
      const el = document.querySelector('#vol'), before = window.__game.audioState();
      el.value = '0.9'; el.dispatchEvent(new Event('input', { bubbles: true }));
      const during = window.__game.audioState(); // the same instant of audio time: a jump would already show
      return { before, during };
    });
    t.equal(r.before.masterNow, r.before.master, 'at rest the gain is where it was asked to be');
    t.equal(r.during.master, +(0.9 * 1.2).toFixed(3), 'the new level is asked for at once');
    t.equal(r.during.masterNow, r.before.masterNow, 'but the gain itself has not stepped in the same instant');
    await t.page.waitForFunction(() => { const a = window.__game.audioState(); return Math.abs(a.masterNow - a.master) < 0.005; }, null, { timeout: 8000 });
    t.equal((await t.game('audioState')).sfx, 1, 'the effects level is the default one');
    await t.page.evaluate(() => { const el = document.querySelector('#vol-sfx'); el.value = '0.2'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    t.equal((await t.game('audioState')).sfx, 0.2, 'and a new one is asked for the same way');
  },
});
tests.push({
  name: 'S5-17 no cue starts a gain at full level: noise bursts rise like the tones do',
  viewports: ['desktop'],
  async run(t) {
    await startAudio(t);
    const names = (await t.game('audioList')).cues;
    const bad = await t.page.evaluate((cues) => {
      const proto = BaseAudioContext.prototype, make = proto.createGain, log = [];
      proto.createGain = function () {
        const node = make.call(this), p = node.gain, ev = [];
        const set = p.setValueAtTime.bind(p), ramp = p.exponentialRampToValueAtTime.bind(p);
        p.setValueAtTime = (v, at) => { ev.push(['set', v, at]); return set(v, at); };
        p.exponentialRampToValueAtTime = (v, at) => { ev.push(['exp', v, at]); return ramp(v, at); };
        log.push(ev); return node;
      };
      const out = [];
      try {
        for (const name of cues) {
          log.length = 0;
          window.__game.cue(name, 4, {});
          for (const ev of log) if (ev.length >= 2 && ev[0][0] === 'set' && ev[0][1] > 0.002 && ev[1][0] === 'exp' && ev[1][1] <= 0.001) out.push(`${name}: starts at ${ev[0][1].toFixed(3)} and only decays`);
        }
      } finally { proto.createGain = make; }
      return out;
    }, names);
    t.equal(bad.length, 0, `every envelope starts from silence (${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ` and ${bad.length - 3} more` : ''})`);
  },
});

// --- C4-04: nine lore cards no longer cite their source in the middle of the sentence ---------------------------------------------------
// The wording is the owner's, copied character for character from _council/owner-review/approved-local-facts.json.
const REWORDED = {
  "hs-0062": "The Buckstaff opened on February 1, 1912. It has offered baths in continuous operation ever since.",
  "hs-0077": "The Lamar opened in 1923, and that was the final change to Bathhouse Row. It closed in 1985.",
  "hs-0148": "The park is best known for its 47 hot springs. They emerge from Hot Springs Mountain at an average temperature of 143°F.",
  "hs-0151": "Two faults help direct the heated water back up to the surface. They are named alpha and beta.",
  "hs-0146": "The thermal springs produce over 700,000 gallons of water a day.",
  "hs-0183": "Babe Ruth hit his famous long home run at Whittington Park on March 17, 1918. It landed in the Arkansas Alligator Farm.",
  "hs-0127": "Lake Ouachita has about 200 islands.",
  "hs-0101": "The Hale Bathhouse is now Hotel Hale. It has nine suites, and their soaking tubs get hot springs mineral water.",
  "hs-0384": "Garvan Woodland Gardens puts on a multi-week Holiday Lights display. It features nearly 5 million lights.",
};
const WAS = [
  "The Buckstaff opened on February 1, 1912, and NPS says it has offered baths in continuous operation ever since.",
  "The final change to Bathhouse Row was completed when the Lamar opened in 1923, NPS says. The Lamar closed in 1985.",
  "USGS says the park is best known for its 47 hot springs, which emerge from Hot Springs Mountain at an average temperature of 143°F.",
  "NPS says two faults, named alpha and beta, help direct the heated water back up to the surface.",
  "The National Park Service says the thermal springs produce over 700,000 gallons of water a day.",
  "Babe Ruth's famous long home run of March 17, 1918, at Whittington Park landed in the Arkansas Alligator Farm, Wikipedia says.",
  "Lake Ouachita has about 200 islands, according to Wikipedia's infobox for the lake.",
  "NPS says the Hale Bathhouse is now Hotel Hale, with nine suites whose soaking tubs get hot springs mineral water.",
  "Garvan Woodland Gardens' multi-week Holiday Lights display features nearly 5 million lights, Visit Hot Springs says.",
];
tests.push({
  name: 'C4-04 the nine reworded cards read as approved, the other fifty-one come out exactly as before, and a rebuild keeps it',
  node: true,
  async run() {
    const crypto = await import('node:crypto');
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os'), path = await import('node:path');
    const file = new URL('../data/lore.json', import.meta.url), bonusFile = new URL('../data/bonus-lore.json', import.meta.url);
    const before = fs.readFileSync(file, 'utf8'), bonusBefore = fs.readFileSync(bonusFile, 'utf8');
    // The tool runs on a copy in a temporary folder (tools/, research/lore-bank.json and an empty data/), so the repo's own data files are only read, never written.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sparkle-lore-'));
    try {
      fs.mkdirSync(path.join(tmp, 'tools')); fs.mkdirSync(path.join(tmp, 'research')); fs.mkdirSync(path.join(tmp, 'data'));
      fs.copyFileSync(fileURLToPath(new URL('../tools/build-lore.mjs', import.meta.url)), path.join(tmp, 'tools', 'build-lore.mjs'));
      fs.copyFileSync(fileURLToPath(new URL('../research/lore-bank.json', import.meta.url)), path.join(tmp, 'research', 'lore-bank.json'));
      execFileSync(process.execPath, [path.join(tmp, 'tools', 'build-lore.mjs')], { stdio: 'ignore' });
      assert.equal(fs.readFileSync(path.join(tmp, 'data', 'lore.json'), 'utf8'), before, 'running tools/build-lore.mjs again writes the same lore.json');
      assert.equal(fs.readFileSync(path.join(tmp, 'data', 'bonus-lore.json'), 'utf8'), bonusBefore, 'and the same bonus-lore.json');
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
    const lore = JSON.parse(before);
    for (const [id, text] of Object.entries(REWORDED)) assert.equal(lore.find((c) => c.id === id).text, text, id + ' reads as approved');
    for (const was of WAS) assert.ok(!lore.some((c) => c.text === was), 'the old text is gone: ' + was.slice(0, 40));
    assert.equal(lore.find((c) => c.id === 'hs-0398').text, 'Sources disagree on when Oaklawn opened: Wikipedia says Feb. 24, 1904; the Encyclopedia of Arkansas says Feb. 15, 1905.', 'the opening-year card keeps its hedge');
    assert.equal(lore.find((c) => c.id === 'hs-0470').text, 'Wikipedia says the Oaklawn race meet, held December through May, is sometimes called the "Fifth Season."', 'the Fifth Season card keeps its hedge');
    const rest = lore.map((c) => (REWORDED[c.id] ? { ...c, text: '' } : c));
    assert.equal(crypto.createHash('sha1').update(JSON.stringify(rest)).digest('hex'), '29d50f83de4dc54aa7e83a4c7cddc8b13a705bf3', 'every other field of every card, and the other 51 cards whole, are as they were');
    for (const c of lore) assert.ok(c.text.length <= 160 && c.title.length <= 40, c.id + ' is within the length limits');
  },
});
