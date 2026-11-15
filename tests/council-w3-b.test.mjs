// Council wave 3, batch B: saves, lifecycle and robustness; controls, rules and play
// (S4-11, S5-16, S1-05, S2-16, S3-04, S1-03, S2-19, S2-21).
// Nothing here depends on chance: every board is seeded and every wait is for a condition.
import assert from 'node:assert/strict';

const KEY = 'spa-city-sparkle:v1';
const stored = (t) => t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);

export const tests = [];

// --- S4-11: the map names the stop, each world's stops look different, and a wide window gets a wider map ---------------
async function mapAt(t, progress) {
  await t.game('act', 'progress', progress);
  await t.game('scene', 'map');
  await t.waitIdle();
}
tests.push({
  name: 'S4-11 the current stop shows its name, a hovered stop shows its own, and a locked stop shows none',
  async run(t) {
    await mapAt(t, { 'w1-01': { stars: 2, best: 1 } });
    const cur = t.page.locator('.node.current');
    const name = await cur.locator('.nname').innerText();
    t.equal(await cur.getAttribute('data-level'), 'w1-02', 'the current stop is the next one to play');
    t.expect(name.length > 3, `the current stop shows a name (${name})`);
    const box = await cur.locator('.nname').boundingBox();
    t.expect(box && box.x >= 0 && box.x + box.width <= t.vp.width && box.y >= 0, 'the name sits inside the screen');
    t.equal(await t.page.locator('.node:not(.current) .nname:visible').count(), 0, 'no other name is shown at rest');
    t.equal(await t.page.locator('.node[data-level="w1-03"] .nname').evaluate((e) => getComputedStyle(e).display), 'none', 'a locked stop gives nothing away');
    if (t.viewport === 'desktop') {
      await t.page.locator('.node[data-level="w1-01"]').hover({ force: true });
      const shown = await t.page.locator('.node[data-level="w1-01"] .nname').evaluate((e) => getComputedStyle(e).display);
      t.equal(shown, 'block', 'hovering a played stop shows its name');
    }
    t.equal(await cur.locator('.nname').getAttribute('aria-hidden'), 'true', 'the name is not read twice: the button already says it');
    await t.shot('S4-11-map-name');
  },
});
tests.push({
  name: 'S4-11 every world has its own node look, and the map is wider than before on a wide window',
  async run(t) {
    await t.game('act', 'progress', Object.fromEntries(Array.from({ length: 59 }, (_, i) => [`w${Math.floor(i / 10) + 1}-${String((i % 10) + 1).padStart(2, '0')}`, { stars: 1, best: 1 }])));
    await t.game('scene', 'map');
    await t.waitIdle();
    const looks = await t.page.evaluate(() => [1, 2, 3, 4, 5, 6].map((w) => { const c = getComputedStyle(document.querySelector(`.node[data-w="${w}"]`)); return c.backgroundImage + '|' + c.borderRadius + '|' + c.borderColor; }));
    t.equal(new Set(looks).size, 6, 'six different looks');
    const width = await t.page.locator('.map-canvas').evaluate((e) => e.getBoundingClientRect().width);
    t.equal(width, Math.min(1000, t.vp.width), 'the map is as wide as the window up to 1000 px (it was 820)');
    await t.page.evaluate(() => document.querySelector('.node[data-w="3"]').scrollIntoView({ block: 'center' }));
    await t.shot('S4-11-map-skins');
  },
});


// --- S5-16: the audio graph is exercised: switches, interruptions, hidden tabs, volume (the skip check waits for S5-03) ---------------------------
// The audio context is real; the stub only counts what the game builds (oscillators and noise sources) and the resume calls.
function trackAudio() {
  window.__node = 0; window.__ctxs = []; window.__resumes = 0; window.__fake = null;
  const Base = window.AudioContext;
  const co = Base.prototype.createOscillator, cb = Base.prototype.createBufferSource, rs = Base.prototype.resume;
  Base.prototype.createOscillator = function () { window.__node++; return co.call(this); };
  Base.prototype.createBufferSource = function () { window.__node++; return cb.call(this); };
  Base.prototype.resume = function () { window.__resumes++; window.__fake = null; return rs.call(this); };
  window.AudioContext = class extends Base {
    constructor(...a) {
      super(...a); window.__ctxs.push(this);
      const real = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'state').get;
      Object.defineProperty(this, 'state', { configurable: true, get() { return window.__fake || real.call(this); } });
    }
  };
}
async function unlock(t) {
  await t.page.mouse.click(5, 5);
  await t.page.waitForFunction(() => window.__ctxs.length && window.__ctxs[0].state === 'running', null, { timeout: 5000 });
}
// Sources the game builds for one cue, counted in a single synchronous step so the music's timer cannot add to it.
const cueNodes = (t) => t.page.evaluate(() => { const a = window.__node; window.__game.cue('match', 2); return window.__node - a; });
const setHidden = (t, hidden) => t.page.evaluate((h) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
  document.dispatchEvent(new Event('visibilitychange'));
}, hidden);
tests.push({
  name: 'S5-16 a cue builds sound sources with Sound effects on and none with it off',
  viewports: ['desktop'],
  initScript: trackAudio,
  async run(t) {
    await t.waitIdle();
    await unlock(t);
    t.expect(await cueNodes(t) > 0, 'a match cue builds sources while Sound effects is on');
    await t.game('scene', 'settings');
    await t.page.locator('#modal [data-toggle="sound"]').click();
    t.equal((await t.state()).settings.sound, false, 'Sound effects is off');
    t.equal(await cueNodes(t), 0, 'a match cue builds nothing with Sound effects off');
    await t.page.locator('#modal [data-toggle="sound"]').click();
    t.expect(await cueNodes(t) > 0, 'and it sounds again when switched back on');
  },
});
tests.push({
  name: 'S5-16 an interrupted audio context is resumed by the next touch, and nothing is built while it is down',
  viewports: ['desktop'],
  initScript: trackAudio,
  async run(t) {
    await t.waitIdle();
    await unlock(t);
    await t.page.evaluate(() => { window.__fake = 'interrupted'; window.__resumes = 0; });
    t.equal(await cueNodes(t), 0, 'no cue is built while the context is interrupted');
    await t.page.mouse.click(5, 5);
    await t.page.waitForFunction(() => window.__resumes > 0, null, { timeout: 5000 });
    t.expect(await cueNodes(t) > 0, 'cues sound again once the touch has resumed it');
  },
});
tests.push({
  name: 'S5-16 a hidden tab suspends the audio context and builds no cue; coming back resumes it',
  viewports: ['desktop'],
  initScript: trackAudio,
  async run(t) {
    await t.waitIdle();
    await unlock(t);
    await setHidden(t, true);
    await t.page.waitForFunction(() => window.__ctxs[0].state === 'suspended', null, { timeout: 5000 });
    t.equal(await cueNodes(t), 0, 'no cue is built in a hidden tab');
    await setHidden(t, false);
    await t.page.waitForFunction(() => window.__ctxs[0].state === 'running', null, { timeout: 5000 });
    t.expect(await cueNodes(t) > 0, 'cues sound when the tab is back');
  },
});
tests.push({
  name: 'S5-16 a volume outside the slider, or not a number, never reaches the master gain unclamped',
  viewports: ['desktop'],
  initScript: trackAudio,
  async run(t) {
    for (const [stored, want] of [[7, 1.2], [-3, 0], ['loud', 0.6], [0.25, 0.3]]) {
      await t.page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify({ v: 1, settings: { volume: v } })), [KEY, stored]);
      await t.reload();
      await t.waitIdle();
      await unlock(t);
      await t.page.waitForFunction(() => window.__game.audioState().master !== null);
      t.equal((await t.game('audioState')).master, want, `a saved volume of ${JSON.stringify(stored)} gives a master gain of ${want}`);
    }
  },
});
