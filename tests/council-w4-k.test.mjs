// Council wave 4b, clean-up batch K: K-02 (Vibration for a save that existed before), K-03 (Free Soak's score and Help), K-05 (cues struck at one instant).
// K-01 is already done by wave 4 (council-w4-a and council-w4-followup measure it), K-04 and K-06 tighten tests of council-w4-c in place.
// Nothing here depends on chance: saves are written by a script before the page loads, every board and cue is seeded, every wait is for a condition.
export const tests = [];

const KEY = 'spa-city-sparkle:v1';
const rawOf = (t) => t.page.evaluate((k) => localStorage.getItem(k), KEY);
const parsed = async (t) => JSON.parse(await rawOf(t));

// --- K-02: Vibration is off for a save that existed before this build and never chose it ------------------------------------------------
// ?saved=<kind> writes a wave-3 style save before the game loads, once per tab (the flag lives in sessionStorage so a reload does not write it again):
// nochoice (settings without a Vibration key), nosettings (no settings at all), on and off (a stored choice). Without it the profile is new.
// navigator.vibrate is a recorder, so the page offers the switch and the test can see whether a buzz would have been asked for.
function seedSave() {
  window.__vib = [];
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => { window.__vib.push(p); return true; } });
  const kind = new URLSearchParams(location.search).get('saved');
  if (!kind || sessionStorage.getItem('k-seeded')) return;
  sessionStorage.setItem('k-seeded', '1');
  const save = { v: 1, settings: { sound: false, music: true, volume: 0.7 }, progress: { 'w1-01': { stars: 3, best: 9000 } }, boosters: { hammer: 2, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [] };
  if (kind === 'on') save.settings.vibration = true;
  if (kind === 'off') save.settings.vibration = false;
  if (kind === 'nosettings') delete save.settings;
  localStorage.setItem('spa-city-sparkle:v1', JSON.stringify(save));
}
const vibrationOf = async (t) => (await t.state()).settings.vibration;
const SWAP_BOARD = ['a a b a c', 'd e a c d', 'b c d e b', 'e d c b a', 'c b e a d']; // swapping [2,0] with [2,1] makes four in a row
async function playAMove(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.game('act', 'board', SWAP_BOARD, { moves: 20, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] });
  await t.waitIdle();
  await t.page.evaluate(() => { window.__vib.length = 0; });
  t.equal((await t.game('act', 'swap', [2, 0], [2, 1])).valid, true, 'the swap is played');
  await t.waitIdle();
}
const vibrationSwitch = async (t) => {
  await t.game('scene', 'settings');
  await t.page.waitForSelector('[data-toggle="vibration"]');
  return t.page.locator('[data-toggle="vibration"]').getAttribute('aria-pressed');
};

tests.push({
  name: 'K-02 a touch player whose save never chose Vibration has it off, stored with the first save, with every other setting and all progress kept, and it stays off after a reload',
  viewports: ['mobile'],
  url: 'index.html?saved=nochoice',
  initScript: seedSave,
  async run(t) {
    t.equal(await vibrationOf(t), false, 'Vibration reads off');
    const opened = await rawOf(t);
    t.equal(Object.keys(JSON.parse(opened).settings).sort().join(), 'music,sound,volume', 'opening the game writes nothing into the stored save');
    await playAMove(t);
    t.equal((await t.page.evaluate(() => window.__vib.length)), 0, 'a match on a touch screen asks the phone for no buzz');
    await t.reload();
    t.equal(await vibrationOf(t), false, 'still off after a reload');
    t.equal(await vibrationSwitch(t), 'false', 'the Settings switch shows off');
    await t.page.locator('[data-toggle="hints"]').click();
    const raw = await parsed(t);
    t.equal(raw.settings.vibration, false, 'the first save the game makes holds the off');
    t.equal(raw.settings.sound, false, 'Sound effects keep their stored setting');
    t.equal(raw.settings.volume, 0.7, 'the volume is kept');
    t.equal(raw.progress['w1-01'].stars, 3, 'progress is kept');
    t.equal(raw.boosters.hammer, 2, 'boosters are kept');
    await t.reload();
    t.equal(await vibrationOf(t), false, 'and it is still off after that save and a reload');
    await vibrationSwitch(t);
    await t.page.locator('[data-toggle="vibration"]').click();
    t.equal(await vibrationOf(t), true, 'the player can turn it on');
    await t.reload();
    t.equal(await vibrationOf(t), true, 'and that choice is kept after a reload');
  },
});
tests.push({
  name: 'K-02 a save with no settings at all also has Vibration off on a touch screen',
  viewports: ['mobile'],
  url: 'index.html?saved=nosettings',
  initScript: seedSave,
  async run(t) {
    t.equal(await vibrationOf(t), false, 'Vibration reads off');
    t.equal((await parsed(t)).settings, undefined, 'and opening the game writes nothing');
    t.equal(await vibrationSwitch(t), 'false', 'the Settings switch shows off');
    await t.page.locator('[data-toggle="hints"]').click();
    t.equal((await parsed(t)).settings.vibration, false, 'the first save holds the off');
    t.equal((await parsed(t)).progress['w1-01'].stars, 3, 'progress is kept');
  },
});
for (const [kind, want] of [['on', true], ['off', false]]) {
  tests.push({
    name: `K-02 a save that chose Vibration ${kind} keeps that choice on a touch screen, through a reload`,
    viewports: ['mobile'],
    url: `index.html?saved=${kind}`,
    initScript: seedSave,
    async run(t) {
      t.equal(await vibrationOf(t), want, `Vibration reads ${kind}`);
      t.equal((await parsed(t)).settings.vibration, want, 'the stored choice is as it was');
      await t.reload();
      t.equal(await vibrationOf(t), want, 'and after a reload');
    },
  });
}
tests.push({
  name: 'K-02 a new profile on a touch screen gets Vibration on, and keeps it once it is saved and reloaded',
  viewports: ['mobile'],
  url: 'index.html',
  initScript: seedSave,
  async run(t) {
    t.equal(await vibrationOf(t), true, 'Vibration starts on');
    t.equal(await rawOf(t), null, 'nothing is written just by opening the game');
    await playAMove(t);
    t.expect((await t.page.evaluate(() => window.__vib.length)) > 0, 'a match buzzes');
    await t.game('scene', 'settings');
    await t.page.waitForSelector('[data-toggle="hints"]');
    await t.page.locator('[data-toggle="hints"]').click();
    t.equal((await parsed(t)).settings.vibration, true, 'the first save holds it on');
    await t.reload();
    t.equal(await vibrationOf(t), true, 'still on after a reload');
  },
});
tests.push({
  name: 'K-02 without a touch screen Vibration is off for a new profile and for a save that never chose',
  viewports: ['desktop'],
  url: 'index.html',
  initScript: seedSave,
  async run(t) {
    t.equal(await vibrationOf(t), false, 'a new profile on a mouse has it off');
    await t.page.evaluate(() => { sessionStorage.setItem('k-seeded', '1'); localStorage.setItem('spa-city-sparkle:v1', JSON.stringify({ v: 1, settings: { sound: true, music: true, volume: 0.5 }, progress: {}, boosters: { hammer: 1, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [] })); });
    await t.reload();
    t.equal(await vibrationOf(t), false, 'an older save has it off');
  },
});

// --- K-03: Free Soak shows a running score, and Help says it is not saved -------------------------------------------------------------------
const WORLD1 = Object.fromEntries(Array.from({ length: 10 }, (_, i) => ['w1-' + String(i + 1).padStart(2, '0'), { stars: 2, best: 1000 }]));
tests.push({
  name: 'K-03 Free Soak shows its running score and Help says that score is not saved, not that none is kept',
  async run(t) {
    await t.game('act', 'progress', WORLD1);
    await t.game('scene', 'help', 'goals');
    await t.waitIdle();
    const help = await t.page.evaluate(() => document.getElementById('modal').innerText);
    t.expect(/The running score is not saved/.test(help), 'Help says the running score is not saved');
    t.expect(!/no score kept/.test(help), 'and no longer says no score is kept');
    await t.shot('K-03-help-goals');
    await t.game('scene', 'freesoak');
    await t.waitIdle();
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    await t.waitIdle(8000);
    const hud = await t.page.evaluate(() => { const el = document.getElementById('hud-score'), r = el.getBoundingClientRect(); return { text: el.textContent, shown: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' }; });
    t.expect(hud.shown && /[1-9]/.test(hud.text), `the HUD shows a running score (${hud.text})`);
    await t.shot('K-03-free-soak-hud');
    t.equal(await rawOf(t) === null ? 0 : (await parsed(t)).soakBest, 0, 'and none of it is saved');
  },
});

// --- K-05: cues struck at one instant ---------------------------------------------------------------------------------------------------------
// A beat strikes its cues together. crowdLevel (sqrt(3 / n), built for a skip that spaces its cues 40 ms apart) left five different cues at one instant at about 1.0 at the maximum volume;
// a beat uses beatLevel (1.5 / n from four) instead. The sets are drawn with a seeded generator from the kinds a beat can strike; every render is seeded and offline, so the numbers repeat exactly.
const KINDS = ['goal', 'combo', 'crystal', 'match', 'stone', 'cascade', 'special', 'tufa', 'lock', 'moss', 'fog', 'token', 'spread', 'reshuffle', 'swap'];
const lcg = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
tests.push({
  name: 'K-05 beatLevel is 1 up to three cues and then 1.5 / n, and sets of four or more different cues struck at one instant stay under 0.95 at the maximum volume (they did not at the skip level)',
  viewports: ['desktop'],
  async run(t) {
    for (const [n, want] of [[1, 1], [2, 1], [3, 1], [4, 0.375], [5, 0.3], [6, 0.25]]) t.expect(Math.abs((await t.game('beatLevel', n)) - want) < 1e-9, `beatLevel(${n}) is ${want}`);
    t.expect((await t.game('beatLevel', 12)) >= 0.2, 'and never falls under 0.2');
    for (const n of [4, 5, 6, 9, 12]) t.expect((await t.game('beatLevel', n)) < (await t.game('crowdLevel', n)), `a beat of ${n} is struck lower than a skip of ${n}`);
    const r = lcg(777), draw = (n) => { const pool = KINDS.slice(), set = []; while (set.length < n) set.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return set; };
    const peak = async (set, level) => (await t.game('mixRender', { piece: 'avenue', bed: 'rain', seconds: 4, levels: { volume: 1 }, cues: set.map((name, k) => ({ name, arg: 3, at: 1, seed: 1 + k, opt: { level, size: 5 } })) })).peak;
    let worstBeat = 0, worstOld = 0, wb = '';
    for (const n of [4, 5, 6, 9, 12]) for (let i = 0; i < 4; i++) {
      const set = draw(n), p = await peak(set, await t.game('beatLevel', n)), old = await peak(set, await t.game('crowdLevel', n));
      if (p > worstBeat) { worstBeat = p; wb = `${n}: ${set.join(',')}`; }
      worstOld = Math.max(worstOld, old);
    }
    t.log(`worst at one instant: beat level ${worstBeat} (${wb}); with the skip level ${worstOld}`);
    t.expect(worstBeat < 0.95, `no set peaks 0.95 or more at the beat level (worst ${worstBeat}: ${wb})`);
    t.expect(worstOld >= 0.95, `the same sets did reach 0.95 at the skip level, so they are a real test (${worstOld})`);
  },
});
tests.push({
  name: 'K-05 in play a beat that strikes four different cues together strikes them at the beat level, and a beat of three or fewer at full level',
  viewports: ['desktop'],
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    // A Cascade swapped sideways clears a row holding a padlock and a tufa: match, cascade, lock and tufa sound in one beat, then the goal in the next.
    await t.game('act', 'board', ['aH b cL1 S1 e', 'c a d e b', 'e c d b e', 'd e c a b', 'b c e d a'], { moves: 10, goals: [{ type: 'stone', need: 1 }], stars: [1, 2, 3] });
    await t.waitIdle();
    const before = (await t.state()).calls.length;
    await t.game('act', 'swap', [0, 0], [1, 0]);
    await t.page.waitForFunction((b) => window.__game.getState().calls.some((c) => c.name === 'goal'), before, { timeout: 8000 });
    const calls = (await t.state()).calls, level = await t.game('beatLevel', 4);
    const four = calls.filter((c) => ['match', 'cascade', 'lock', 'tufa'].includes(c.name) && c.level < 1);
    t.equal(four.map((c) => c.name).join(), 'match,cascade,lock,tufa', 'the four cues of the one beat are turned down');
    t.expect(four.every((c) => Math.abs(c.level - level) < 1e-9 && c.at === 0), `each at level ${level} and all at the same instant`);
    t.expect(calls.filter((c) => ['swap', 'goal'].includes(c.name)).every((c) => c.level === 1), 'the beats of fewer cues stay at full level');
  },
});
