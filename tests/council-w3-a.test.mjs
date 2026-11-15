// Council wave 3, batch A: saves, lifecycle and robustness (S2-08, S2-27, S6-11, P-N02, S3-03, S3-06, S4-02).
// Nothing here depends on chance: every board is seeded and every wait is for a condition.
import assert from 'node:assert/strict';
import { createSaveStore, freshSave, STAR_STEP } from '../src/js/ui/save.js';
const KEY = 'spa-city-sparkle:v1';
const stored = (t) => t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
async function inLevel(t, level = 'w1-01', seed = 3) {
  await t.game('newGame', { level, seed, tips: false });
  await t.waitIdle();
}
async function swapOnce(t) {
  const legal = await t.game('act', 'legal');
  await t.game('act', 'swap', ...legal[0]);
  await t.waitIdle(8000);
}
const modalTitle = (t) => t.page.locator('#modal h2').innerText();

export const tests = [];

// --- S2-08: Restart asks before it throws a started board away -----------------------------------------------------
tests.push({
  name: 'S2-08 Restart after a move asks first; Keep playing returns to the same board, Restart starts fresh',
  async run(t) {
    await inLevel(t);
    await swapOnce(t);
    const before = await t.state();
    t.equal(before.movesUsed, 1, 'one move made');
    await t.page.locator('#btn-pause').click();
    await t.page.locator('#modal [data-act="restart"]').click();
    t.equal(await modalTitle(t), 'Restart this level?', 'a confirm card opens');
    t.equal((await t.state()).hash, before.hash, 'asking changes nothing on the board');
    await t.shot('S2-08-restart-confirm');
    await t.page.locator('#modal [data-act="back"]').click();
    t.equal(await modalTitle(t), 'Paused', 'Keep playing returns to the Paused card');
    t.equal((await t.state()).scene, 'pause', 'still paused');
    await t.page.locator('#modal [data-act="restart"]').click();
    await t.page.keyboard.press('Escape');
    t.equal(await modalTitle(t), 'Paused', 'Esc means Keep playing');
    await t.page.locator('#modal [data-act="restart"]').click();
    await t.page.locator('#modal [data-act="restart"]').click();
    await t.waitIdle();
    const after = await t.state();
    t.equal(after.scene, 'game', 'back in play');
    t.equal(after.movesUsed, 0, 'a fresh board');
    t.equal(await t.page.locator('#modal').evaluate((m) => m.classList.contains('hidden')), true, 'no card left open');
  },
});
tests.push({
  name: 'S2-08 Restart before any move needs no confirmation',
  async run(t) {
    await inLevel(t);
    await t.page.locator('#btn-pause').click();
    await t.page.locator('#modal [data-act="restart"]').click();
    await t.waitIdle();
    const s = await t.state();
    t.equal(s.scene, 'game', 'restarted at once');
    t.equal(s.movesUsed, 0, 'still a fresh board');
  },
});

// --- S2-27: toasts wrap and stay on the screen -----------------------------------------------------------------------
tests.push({
  name: 'S2-27 the longest real toast wraps inside the screen',
  initScript: () => {
    const old = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === 'spa-city-sparkle:v1') throw Error('storage blocked for this test'); return old.call(this, k, v); };
  },
  async run(t) {
    await inLevel(t);
    await t.page.waitForFunction(() => document.getElementById('toast').classList.contains('show'), null, { timeout: 5000 });
    const m = await t.page.evaluate(() => {
      const el = document.getElementById('toast'), r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return { text: el.textContent, left: r.left, right: r.right, width: r.width, height: r.height, line: parseFloat(cs.lineHeight), vw: innerWidth, ws: cs.whiteSpace, bg: cs.backgroundColor };
    });
    t.equal(m.text, 'Not saved: storage is unavailable. Keep this tab open.', 'the unsaved notice');
    t.expect(m.ws !== 'nowrap', `white-space is ${m.ws}`);
    t.expect(m.left >= 0 && m.right <= m.vw, `toast spans ${Math.round(m.left)}..${Math.round(m.right)} of ${m.vw}`);
    t.expect(m.width <= Math.min(0.9 * m.vw, 420) + 1, `toast is ${Math.round(m.width)} px wide`);
    t.expect(m.bg !== 'rgba(0, 0, 0, 0)', 'a pill behind the text');
    if (t.viewport === 'mobile') t.expect(m.height > m.line * 1.5, 'on a phone the sentence takes more than one line');
    await t.shot('S2-27-toast');
  },
});

// --- S6-11: a move counts when it is made --------------------------------------------------------------------------
tests.push({
  name: 'S6-11 reloading during a move\'s animation does not take the move back',
  async run(t) {
    await inLevel(t);
    const start = await t.state();
    await t.game('act', 'clock', 0); // freeze the animation so the move is still "playing"
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    const mid = await t.state();
    t.equal(mid.anim.playing, true, 'the animation is still playing');
    t.equal(mid.movesLeft, start.movesLeft - 1, 'the screen shows one move spent');
    const saved = await stored(t);
    t.equal(saved.current.state.movesLeft, mid.movesLeft, 'the save already holds the board after the move');
    await t.reload();
    await t.waitIdle();
    await t.page.locator('[data-act="continue"]').click();
    await t.waitIdle();
    const back = await t.state();
    t.equal(back.movesLeft, mid.movesLeft, 'Continue shows the same moves left as before the reload');
    t.equal(back.hash, mid.hash, 'and the same board');
  },
});
tests.push({
  name: 'S6-11 a booster spent mid-animation is spent in the save at once',
  async run(t) {
    await inLevel(t);
    await t.game('act', 'clock', 0);
    const r = await t.game('act', 'booster', 'shuffle');
    t.equal(r.valid, true, 'the shuffle ran');
    const saved = await stored(t);
    t.equal(saved.boosters.shuffle, 0, 'the booster is gone from the save');
    await t.reload();
    await t.waitIdle();
    t.equal((await t.state()).saveBoosters.shuffle, 0, 'and still gone after a reload');
  },
});

// --- P-N02: boosters and Pause work from the keyboard --------------------------------------------------------------
tests.push({
  name: 'P-N02 Enter and Space press the focused booster and the Pause button',
  async run(t) {
    await inLevel(t);
    await t.page.focus('.booster[data-booster="hammer"]');
    await t.page.keyboard.press('Enter');
    t.equal((await t.state()).armed, 'hammer', 'Enter on the focused Hammer arms it');
    await t.page.keyboard.press('Space');
    t.equal((await t.state()).armed, null, 'Space on it again puts it down');
    await t.page.focus('#btn-pause');
    await t.page.keyboard.press('Space');
    t.equal((await t.state()).scene, 'pause', 'Space on the focused Pause button opens Pause');
    await t.page.locator('#modal [data-act="resume"]').click();
    await t.page.focus('#btn-pause');
    await t.page.keyboard.press('Enter');
    t.equal((await t.state()).scene, 'pause', 'Enter on it does too');
  },
});
tests.push({
  name: 'P-N02 number keys 1 to 4 work the boosters and the arrows hand Enter back to the board',
  async run(t) {
    await inLevel(t);
    await t.page.keyboard.press('1');
    t.equal((await t.state()).armed, 'hammer', '1 arms the Hammer');
    await t.page.keyboard.press('2');
    t.equal((await t.state()).armed, 'line', '2 switches to the Line');
    await t.page.keyboard.press('Escape');
    t.equal((await t.state()).armed, null, 'Esc puts it down');
    await t.page.keyboard.press('1');
    await t.page.keyboard.press('ArrowRight');
    await t.page.keyboard.press('Enter');
    await t.waitIdle(8000);
    const s = await t.state();
    t.equal(s.boosters.hammer, 0, 'the Hammer was used on the cursor cell from the keyboard alone');
    t.equal(s.armed, null, 'and is put down');
    await t.page.keyboard.press('3');
    await t.waitIdle(8000);
    t.equal((await t.state()).boosters.shuffle, 0, '3 shuffles at once');
    // a focused button keeps its Enter, but an arrow key moves on to the board: Enter then picks a piece
    await t.page.focus('.booster[data-booster="line"]');
    await t.page.keyboard.press('ArrowLeft');
    await t.page.keyboard.press('Enter');
    t.expect((await t.state()).selected >= 0, 'Enter picks the piece under the cursor after an arrow key');
    t.equal(await t.page.evaluate(() => document.activeElement === document.body || !document.activeElement.classList.contains('booster')), true, 'the booster no longer holds focus');
    if (t.viewport === 'desktop') {
      const key = await t.page.locator('.booster[data-booster="line"] .b-key').evaluate((e) => ({ text: e.textContent, shown: getComputedStyle(e).display !== 'none' }));
      t.equal(key.text + ':' + key.shown, '2:true', 'the Line button shows its key on a desktop');
    }
    await t.shot('P-N02-booster-keys');
  },
});
tests.push({
  name: 'P-N02 a modifier with a number is left to the browser, and the keys do nothing on a card',
  viewports: ['desktop'],
  async run(t) {
    await inLevel(t);
    await t.page.keyboard.press('Control+1');
    t.equal((await t.state()).armed, null, 'Ctrl+1 arms nothing');
    await t.page.locator('#btn-pause').click();
    await t.page.keyboard.press('1');
    t.equal((await t.state()).armed, null, 'a number key on the Paused card arms nothing');
  },
});

// --- S3-03: stars pay out boosters ---------------------------------------------------------------------------------
const order = ['hammer', 'line', 'shuffle', 'plus5'];
const names = { hammer: 'Hammer', line: 'Line', shuffle: 'Shuffle', plus5: '+5 Moves' };
const total = (b) => order.reduce((n, k) => n + b[k], 0);
async function winAs(t, id) {
  await t.game('newGame', { level: id, seed: 3, tips: false });
  await t.waitIdle();
  const before = (await t.state()).saveBoosters;
  await t.game('scene', 'win', id);
  await t.waitIdle();
  return { before, after: (await t.state()).saveBoosters, sub: await t.page.locator('#modal .result-sub').innerText(), line: await t.page.locator('#modal .fine').last().innerText() };
}
tests.push({
  name: 'S3-03 a booster for every 12 stars: crossing the line pays, not crossing and replays do not',
  async run(t) {
    t.equal(STAR_STEP, 12, 'one booster every 12 stars');
    await t.game('act', 'progress', { 'w1-01': { stars: 3, best: 1 }, 'w1-02': { stars: 3, best: 1 } }, { hammer: 1, line: 1, shuffle: 1, plus5: 1 });
    // 6 stars, a first three-star win on w1-05 makes 9: only the win's own booster
    let r = await winAs(t, 'w1-05');
    t.equal(total(r.after) - total(r.before), 1, 'below the line: the three-star booster only');
    t.expect(/new booster: Hammer$/.test(r.sub), `card says (${r.sub})`);
    // 10 stars, a first three-star win on w1-04 makes 13: that booster and a star booster
    await t.game('act', 'progress', { 'w1-03': { stars: 1, best: 1 } }, { hammer: 4, line: 3, shuffle: 0, plus5: 2 });
    r = await winAs(t, 'w1-04');
    t.equal(total(r.after) - total(r.before), 2, 'crossing 12: the win booster and a star booster');
    t.equal(r.after.plus5 - r.before.plus5, 1, 'w1-04 gives its own kind (+5 moves)');
    t.equal(r.after.shuffle - r.before.shuffle, 1, 'the star booster is the kind held fewest (Shuffle: none in hand)');
    t.expect(r.sub.includes('new booster: +5 Moves, Shuffle'), `card lists both (${r.sub})`);
    t.equal(r.line, '13 stars · next booster at 24', 'the card says how far the next one is');
    await t.shot('S3-03-star-booster-card');
    // replaying a three-star level changes no star total and pays nothing
    const stars = (await t.state()).progress;
    r = await winAs(t, 'w1-04');
    t.equal(total(r.after) - total(r.before), 0, 'a replay of a three-star level pays nothing');
    t.equal(JSON.stringify((await t.state()).progress['w1-04']), JSON.stringify(stars['w1-04']), 'and keeps its record');
  },
});
tests.push({
  name: 'S3-03 the map says when the next booster comes',
  async run(t) {
    await t.game('act', 'progress', { 'w1-01': { stars: 2, best: 1 }, 'w1-02': { stars: 3, best: 1 } });
    await t.game('scene', 'map');
    await t.waitIdle();
    const label = await t.page.locator('.map-top .totals').getAttribute('aria-label');
    t.equal(label, '5 stars earned. Next booster at 12 stars', 'star total and the next booster');
  },
});
tests.push({
  name: 'S3-03 the star booster goes through the save store: same kind-held-fewest rule, once per crossing',
  node: true,
  run() {
    const f = nodeFixture();
    const s = f.tab();
    const won = (levelId, stars) => ({ levelId, stars, score: 100, moves: 5, rewardType: 'hammer', worldLevels: ['w1-01'] });
    for (const id of ['a1', 'a2', 'a3']) { s.reserve(); s.terminal(won(id, 3)); }
    const after9 = f.read();
    assert.deepEqual(after9.boosters, { hammer: 4, line: 1, shuffle: 1, plus5: 1 }, 'nine stars: only the win boosters');
    s.reserve();
    const rec = s.terminal(won('a4', 3));
    assert.equal(rec.outcome.starReward, 'line', 'twelve stars: the first kind held fewest, in tray order');
    assert.deepEqual(f.read().boosters, { hammer: 5, line: 2, shuffle: 1, plus5: 1 });
    s.reserve();
    const again = s.terminal(won('a4', 3));
    assert.equal(again.outcome.starReward, null, 'no new stars, no booster');
    assert.deepEqual(f.read().boosters, { hammer: 5, line: 2, shuffle: 1, plus5: 1 });
  },
});

// --- S3-06: what each level has taken is kept, and can be copied ----------------------------------------------------
tests.push({
  name: 'S3-06 tries, wins and fewest moves are recorded per level and survive a reload',
  async run(t) {
    await inLevel(t, 'w1-01', 5);
    await swapOnce(t);
    await swapOnce(t);
    await t.game('act', 'win');
    await t.waitIdle();
    let s = (await t.state()).levelStats;
    t.equal(JSON.stringify(s['w1-01']), JSON.stringify({ tries: 1, wins: 1, bestMoves: 2 }), 'a win after two moves');
    await inLevel(t, 'w1-01', 5);
    await swapOnce(t);
    await t.game('act', 'win');
    await t.waitIdle();
    s = (await t.state()).levelStats;
    t.equal(JSON.stringify(s['w1-01']), JSON.stringify({ tries: 2, wins: 2, bestMoves: 1 }), 'a quicker win lowers the fewest moves');
    await inLevel(t, 'w1-01', 5);
    await swapOnce(t);
    await swapOnce(t);
    await swapOnce(t);
    await t.game('act', 'win');
    await t.waitIdle();
    s = (await t.state()).levelStats;
    t.equal(s['w1-01'].bestMoves, 1, 'a slower win never raises it');
    await inLevel(t, 'w1-02', 5);
    await t.game('act', 'lose');
    await t.waitIdle();
    s = (await t.state()).levelStats;
    t.equal(JSON.stringify(s['w1-02']), JSON.stringify({ tries: 1, wins: 0, bestMoves: 0 }), 'a loss is a try and not a win');
    await t.reload();
    t.equal(JSON.stringify((await t.state()).levelStats), JSON.stringify(s), 'the record is still there after a reload');
  },
});
tests.push({
  name: 'S3-06 Copy my stats puts the record on the clipboard; Reset clears it',
  initScript: () => {
    window.__clip = null;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (x) => { window.__clip = x; return Promise.resolve(); } } });
  },
  async run(t) {
    await inLevel(t, 'w1-01', 5);
    await swapOnce(t);
    await t.game('act', 'win');
    await t.waitIdle();
    await t.game('scene', 'settings');
    await t.page.locator('#modal [data-act="copystats"]').click();
    await t.page.waitForFunction(() => window.__clip !== null);
    const copied = JSON.parse(await t.page.evaluate(() => window.__clip));
    t.equal(copied.game, 'Spa City Sparkle', 'names the game');
    t.equal(copied.levels['w1-01'].tries, 1, 'tries');
    t.equal(copied.levels['w1-01'].wins, 1, 'wins');
    t.equal(copied.levels['w1-01'].bestMoves, 1, 'fewest moves');
    t.equal(copied.levels['w1-01'].moves, 16, 'the level\'s own move budget, for working out moves left');
    t.expect('best' in copied.levels['w1-01'] && 'stars' in copied.levels['w1-01'], 'best score and stars come with it');
    await t.page.waitForFunction(() => document.getElementById('toast').textContent === 'Stats copied');
    await t.shot('S3-06-settings-copy');
    await t.page.locator('#modal [data-act="reset"]').click();
    await t.page.locator('#modal [data-act="erase"]').click();
    await t.page.waitForFunction(() => document.querySelector('#modal [data-act="copystats"]'));
    t.equal(JSON.stringify((await t.state()).levelStats), '{}', 'Reset clears the record with the progress');
  },
});
tests.push({
  name: 'S3-06 a save from before the record loads, and damaged records are dropped',
  initScript: () => {
    if (localStorage.getItem('spa-city-sparkle:v1') === null) {
      localStorage.setItem('spa-city-sparkle:v1', JSON.stringify({ v: 1, progress: { 'w1-01': { stars: 2, best: 900 } }, boosters: { hammer: 2, line: 1, shuffle: 1, plus5: 1 }, stats: { 'w1-01': { tries: -3, wins: 'x', bestMoves: 2.5 }, 'w1-02': 'junk', 'w1-03': { tries: 4, wins: 1, bestMoves: 9 } } }));
    }
  },
  async run(t) {
    const s = await t.state();
    t.equal(s.progress['w1-01'].stars, 2, 'progress is kept');
    t.equal(s.saveBoosters.hammer, 2, 'boosters are kept');
    t.equal(JSON.stringify(s.levelStats), JSON.stringify({ 'w1-01': { tries: 0, wins: 0, bestMoves: 0 }, 'w1-03': { tries: 4, wins: 1, bestMoves: 9 } }), 'junk entries dropped, good ones kept');
  },
});
tests.push({
  name: 'S3-06 a loss with a booster still owed is counted once, with the cost, in one write',
  node: true,
  run() {
    const f = nodeFixture();
    const s = f.tab();
    s.reserve();
    const p = s.prepare({ booster: 'hammer', localAvailable: 1 });
    assert.equal(p.ok, true);
    s.computed(p, cur(1), 'hammer');
    const r = s.terminal(null, cur(2), 'w1-01');
    assert.equal(r.ok, true);
    const d = f.read();
    assert.deepEqual(d.stats, { 'w1-01': { tries: 1, wins: 0, bestMoves: 0 } }, 'one try, no win');
    assert.equal(d.boosters.hammer, 0, 'the cost went in the same write');
    assert.equal(d.current, null, 'the Continue slot is cleared');
    s.reserve();
    s.terminal(null, cur(0), 'w1-01');
    assert.equal(f.read().stats['w1-01'].tries, 2, 'the next loss adds one more');
  },
});
tests.push({
  name: 'S3-06 a win is tried once and a fresh profile starts empty',
  node: true,
  run() {
    assert.deepEqual(freshSave().stats, {}, 'a fresh save has an empty record');
    const f = nodeFixture();
    const s = f.tab();
    s.reserve();
    s.terminal({ levelId: 'w1-01', stars: 1, score: 10, moves: 7, rewardType: 'hammer', worldLevels: ['w1-01'] });
    assert.deepEqual(f.read().stats, { 'w1-01': { tries: 1, wins: 1, bestMoves: 7 } });
  },
});

// --- fixtures for the node tests --------------------------------------------------------------------------------------
const cur = (n = 0) => ({ levelId: 'w1-01', state: { v: 1, w: 2, h: 2, tile: [{ id: 1, k: 0 }, null, null, null], mask: [1, 1, 1, 1], rng: { spawn: 17, misc: 23 }, nextId: 2, movesUsed: n, movesLeft: 20 - n, score: n * 10, goals: [{ type: 'score', need: 100, have: n * 10 }], boosters: { hammer: Math.max(0, 1 - n), line: 1, shuffle: 1, plus5: 1 }, phase: 'play' } });
function nodeFixture() {
  let raw = JSON.stringify(freshSave()), n = 0;
  const storage = { getItem: () => raw, setItem: (k, v) => { raw = v; } };
  return { read: () => JSON.parse(raw), tab() { const s = createSaveStore({ storage: () => storage, newToken: () => 'fixture-' + (++n) }); s.load(); return s; } };
}
