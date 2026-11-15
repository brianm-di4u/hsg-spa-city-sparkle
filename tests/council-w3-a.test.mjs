// Council wave 3, batch A: saves, lifecycle and robustness (S2-08, S2-27, S6-11, P-N02, S3-03, S3-06, S4-02).
// Nothing here depends on chance: every board is seeded and every wait is for a condition.

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

