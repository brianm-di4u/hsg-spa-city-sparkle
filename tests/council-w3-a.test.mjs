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

