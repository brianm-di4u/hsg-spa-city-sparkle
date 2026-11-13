// Council wave 1, batch A: pause round trips, audio lifecycle, Esc, fatal errors, corrupt saves, input during animation.
const WIN_BOARD = ['a b a d e', 'c a c e d', 'd e b d c', 'e d c b e', 'b c e a d'];
async function inLevel(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.waitIdle();
}
async function openPause(t) {
  await t.page.locator('#btn-pause').click();
  await t.waitIdle();
  t.equal((await t.state()).scene, 'pause', 'pause scene');
}
const heading = (t) => t.page.locator('#modal h2').innerText();

export const tests = [
  {
    name: 'S6-01 Pause > How to play > Back and Pause > Settings > Done return to the Paused card',
    async run(t) {
      await inLevel(t);
      await openPause(t);
      await t.page.locator('#modal [data-act="help"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'How to play', 'help is open');
      await t.page.locator('#modal [data-act="close"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'Paused', 'Back from help returns to Paused');
      t.equal((await t.state()).scene, 'pause', 'scene is pause again');
      await t.page.locator('#modal [data-act="settings"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'Settings', 'settings is open');
      await t.page.locator('#modal [data-act="close"]').click();
      await t.waitIdle();
      t.equal(await heading(t), 'Paused', 'Done from settings returns to Paused');
      t.equal((await t.state()).scene, 'pause', 'scene is pause again');
    },
  },
];

// --- S5-05: audio lifecycle ---------------------------------------------------------------------
function trackAudio() {
  window.__osc = 0; window.__ctxs = [];
  const Base = window.AudioContext;
  const co = Base.prototype.createOscillator;
  Base.prototype.createOscillator = function () { window.__osc++; return co.call(this); };
  window.AudioContext = class extends Base { constructor(...a) { super(...a); window.__ctxs.push(this); } };
}
const setHidden = (t, hidden) => t.page.evaluate((h) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
  document.dispatchEvent(new Event('visibilitychange'));
}, hidden);
const oscCount = (t) => t.page.evaluate(() => window.__osc);
async function unlock(t) {
  await t.page.mouse.click(5, 5);
  await t.page.waitForFunction(() => window.__ctxs.length && window.__ctxs[0].state === 'running', null, { timeout: 5000 });
}

tests.push(
  {
    name: 'S5-05 hiding the tab suspends audio and stops the music tick; returning resumes it',
    initScript: trackAudio,
    async run(t) {
      await inLevel(t);
      await unlock(t);
      await t.page.waitForTimeout(1000);
      t.expect((await oscCount(t)) > 0, 'music is playing in the visible tab');
      await setHidden(t, true);
      await t.page.waitForTimeout(600);
      t.equal(await t.page.evaluate(() => window.__ctxs[0].state), 'suspended', 'context suspended while hidden');
      const before = await oscCount(t);
      await t.page.waitForTimeout(1500);
      t.equal(await oscCount(t), before, 'no notes are scheduled while hidden');
      await setHidden(t, false);
      await t.page.waitForFunction(() => window.__ctxs[0].state === 'running', null, { timeout: 3000 });
      await t.page.waitForTimeout(1200);
      t.expect((await oscCount(t)) > before, 'music plays again after returning');
      await t.page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
      await t.page.waitForTimeout(600);
      t.equal(await t.page.evaluate(() => window.__ctxs[0].state), 'suspended', 'pagehide suspends too');
    },
  },
  {
    name: 'S5-05 a context left interrupted (iOS) is resumed by the next gesture',
    initScript: trackAudio,
    async run(t) {
      await inLevel(t);
      await unlock(t);
      await t.page.evaluate(() => {
        const c = window.__ctxs[0];
        let o = Object.getPrototypeOf(c), proto;
        while (o && !(proto = Object.getOwnPropertyDescriptor(o, 'state'))) o = Object.getPrototypeOf(o);
        let interrupted = true;
        Object.defineProperty(c, 'state', { configurable: true, get: () => (interrupted ? 'interrupted' : proto.get.call(c)) });
        const r = c.resume.bind(c);
        window.__resumes = 0;
        c.resume = () => { window.__resumes++; interrupted = false; return r(); };
      });
      await t.page.mouse.click(5, 5);
      t.equal(await t.page.evaluate(() => window.__resumes), 1, 'a gesture calls resume() on an interrupted context');
    },
  },
  {
    name: 'S5-05 the Pause card silences the music and Resume brings it back',
    viewports: ['desktop'],
    initScript: trackAudio,
    async run(t) {
      await inLevel(t);
      await unlock(t);
      await t.page.waitForTimeout(900);
      await openPause(t);
      await t.page.waitForTimeout(300);
      const before = await oscCount(t);
      await t.page.waitForTimeout(1500);
      t.equal(await oscCount(t), before, 'no music notes while paused');
      await t.page.locator('#modal [data-act="resume"]').click();
      await t.page.waitForTimeout(1200);
      t.expect((await oscCount(t)) > before, 'music returns after Resume');
    },
  },
);

// --- S2-05: Help from the map and the level intro ----------------------------------------------
tests.push({
  name: 'S2-05 the map header and the level intro card each have a Help button that returns to where it was opened',
  async run(t) {
    await t.game('scene', 'map');
    await t.waitIdle();
    await t.page.locator('.map-top [data-act="help"]').click();
    await t.waitIdle();
    t.equal(await heading(t), 'How to play', 'help opens from the map');
    await t.page.locator('#modal [data-act="close"]').click();
    await t.waitIdle();
    const s = await t.state();
    t.equal(s.scene, 'map', 'closing help returns to the map');
    t.expect(!s.modal, 'no dialog is left open');
    await t.checkLayout();
    await t.page.locator('.node[data-level="w1-01"]').click({ force: true });
    await t.waitIdle();
    t.equal((await t.state()).scene, 'intro', 'intro card is open');
    await t.page.locator('#modal [data-act="help"]').click();
    await t.waitIdle();
    t.equal(await heading(t), 'How to play', 'help opens from the intro card');
    await t.page.locator('#modal [data-act="close"]').click();
    await t.waitIdle();
    t.equal((await t.state()).scene, 'intro', 'closing help returns to the intro card');
    t.expect(/Play/.test(await t.page.locator('#modal [data-act="go"]').innerText()), 'the intro card is back with its Play button');
  },
});
