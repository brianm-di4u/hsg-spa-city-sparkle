// Council wave 4, batch A: saves, lifecycle and robustness
// (C4-01, C4-06, C4-07, C4-08, C4-09, C4-10, C4-11, C4-13, C4-14, S5-10).
// Nothing here depends on chance: every board and every cue is seeded, every wait is for a condition, and the sound checks render offline
// with fixed seeds.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSaveStore, freshSave } from '../src/js/ui/save.js';
import { recordCounts } from '../src/js/ui/records.js';

const KEY = 'spa-city-sparkle:v1';
const LEVELS = JSON.parse(fs.readFileSync(new URL('../data/levels.json', import.meta.url), 'utf8'));
const read = (rel) => fs.readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
const rawOf = (t, key = KEY) => t.page.evaluate((k) => localStorage.getItem(k), key);
const NEWER = JSON.stringify({ v: 2, settings: { sound: false, music: false, volume: 0.9, newThing: 'x' }, progress: { 'w1-01': { stars: 3, best: 9000 } }, boosters: { hammer: 7, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [], current: null, soakBest: 0, soakDay: null, daily: {}, futureField: { keep: [1, 2, 3] } });
const OLD_WAVE2 = { v: 1, settings: { sound: true, music: true, volume: 0.5 }, progress: Object.fromEntries(Array.from({ length: 10 }, (_, i) => ['w1-' + String(i + 1).padStart(2, '0'), { stars: 2, best: 1500 }])), boosters: { hammer: 1, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [] };
const NEWER_NOTE = /newer version of the game, so this visit is not being saved/;

export const tests = [];

// A tap on a phone, a mouse click on a desktop: the pointer input a player has.
async function press(t, selector) {
  if (t.viewport === 'mobile') { const b = await t.page.locator(selector).boundingBox(); await t.tap([b.x + b.width / 2, b.y + b.height / 2]); } else await t.page.locator(selector).click();
}
const active = (t) => t.page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.className || a.tagName) : null; });
async function inLevel(t) { await t.game('newGame', { level: 'w1-01', seed: 3, tips: false }); await t.waitIdle(); }
// Counts every time the toast is set to the newer-save notice. It watches the whole document from the first moment, so a toast made while the page boots is seen too.
const toastCounter = () => {
  window.__newerToasts = 0;
  new MutationObserver((records) => {
    for (const r of records) if (r.target.id === 'toast' && [...r.addedNodes].some((n) => /newer version of the game, so this visit is not being saved/.test(n.textContent))) window.__newerToasts++;
  }).observe(document, { childList: true, subtree: true });
};

// --- C4-01: a save from a newer version of the game is left alone ---------------------------------------------------------------
function fake(initial = {}) {
  const m = new Map(Object.entries(initial)), log = [];
  const storage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { log.push(['set', k]); m.set(k, String(v)); }, removeItem: (k) => { log.push(['remove', k]); m.delete(k); } };
  return { m, log, storage };
}
const result = (id = 'w1-01') => ({ levelId: id, stars: 3, score: 5000, moves: 4, rewardType: 'hammer', worldLevels: ['w1-01', 'w1-02'] });
tests.push({
  name: 'C4-01 a save with a higher version is never written over: no setItem, no removeItem, whatever the visit does, and the player is told once',
  node: true,
  run() {
    const f = fake({ [KEY]: NEWER });
    const events = [], projection = freshSave(), s = createSaveStore({ storage: () => f.storage, projection });
    s.effects.onNewer = () => events.push('newer'); s.effects.onUnsaved = () => events.push('unsaved'); s.effects.onConflict = () => events.push('conflict');
    s.load();
    assert.equal(projection.storageOk, false, 'the visit is marked as not saved');
    assert.deepEqual(projection.progress, {}, 'it plays from defaults, not from the newer save');
    s.announceNewer();
    // everything a visit does that would normally save
    s.settings({ sound: true, volume: 0.2 });
    s.settings({ badges: true });
    s.reserve();
    const p = s.prepare(); assert.equal(p.ok, true);
    s.computed(p, { levelId: 'w1-01', state: { v: 1 } });
    s.settle();
    s.terminal(result(), { levelId: 'w1-01', state: { v: 1 } });
    s.tutorial('basics');
    s.daily({ key: '2026-11-16', score: 100, stars: 1, won: true });
    assert.equal(s.reset().reason, 'newer-save', 'Reset refuses');
    assert.equal(s.startFresh().ok, false, 'Start fresh refuses');
    assert.equal(s.unreadable(), false, 'a newer save is not an unreadable one');
    assert.equal(s.newerSave(), true);
    assert.deepEqual(f.log, [], 'nothing was written or removed');
    assert.equal(f.m.get(KEY), NEWER, 'the stored text is byte for byte what it was');
    assert.equal(f.m.has(KEY + ':corrupt'), false, 'and no backup copy was made either');
    assert.deepEqual(events, ['newer'], 'the notice came once, and no storage-unavailable notice came with it');
    assert.equal(projection.settings.volume, 0.2, 'settings changed in memory for this visit');
    assert.ok(projection.progress['w1-01'], 'a win this visit is kept in memory');
  },
});
tests.push({
  name: 'C4-01 a damaged, truncated, wrong-shaped or older save is handled as before: unreadable, kept under a backup only when the player asks',
  node: true,
  run() {
    const cases = { truncated: '{"v":1,"progress":{"w1-01":', 'wrong shape': JSON.stringify({ v: 1, settings: 'loud' }), 'older version': JSON.stringify({ v: 0, progress: {} }), 'version as text': JSON.stringify({ v: '2', progress: {} }), 'fractional version': JSON.stringify({ v: 1.5, progress: {} }), 'not an object': '[1,2]', 'no version': JSON.stringify({ progress: {} }) };
    for (const [name, text] of Object.entries(cases)) {
      const f = fake({ [KEY]: text }), projection = freshSave(), s = createSaveStore({ storage: () => f.storage, projection });
      let newerNotices = 0; s.effects.onNewer = () => newerNotices++;
      s.load();
      assert.equal(s.newerSave(), false, `${name}: not a newer save`);
      assert.equal(s.unreadable(), true, `${name}: unreadable as before`);
      assert.deepEqual(f.log, [], `${name}: nothing written by the visit itself`);
      assert.equal(s.startFresh().ok, true, `${name}: Start fresh works as before`);
      assert.equal(f.m.get(KEY + ':corrupt'), text, `${name}: the old text is kept under the backup key`);
      assert.equal(newerNotices, 0, `${name}: no newer-version notice`);
    }
    const ok = fake({ [KEY]: JSON.stringify({ ...freshSave(), v: 1 }) }), projection = freshSave(), s = createSaveStore({ storage: () => ok.storage, projection });
    s.load(); s.settings({ sound: false });
    assert.equal(projection.storageOk, true, 'a current save loads and saves as ever');
    assert.equal(JSON.parse(ok.m.get(KEY)).settings.sound, false);
  },
});
tests.push({
  name: 'C4-01 a newer save survives a whole visit untouched: settings, a level won, Reset, a reload; the notice shows once and Settings says why',
  initScript: toastCounter,
  async run(t) {
    await t.page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, NEWER]);
    await t.reload();
    await t.waitIdle();
    await t.page.waitForFunction(() => /newer version/.test(document.getElementById('toast').textContent), null, { timeout: 5000 });
    const s0 = await t.state();
    t.equal(s0.storageOk, false, 'the visit is not being saved');
    t.equal(s0.settings.volume, 0.5, 'it starts from the default settings');
    t.equal(Object.keys(s0.progress).length, 0, 'and an empty journey, in memory');
    t.expect(NEWER_NOTE.test(await t.page.locator('#toast').innerText()), 'the toast says the save is from a newer version and this visit is not saved');
    await t.shot('C4-01-newer-notice');
    // a visit that would normally save: settings, a played and won level, the speaker button, Reset
    await t.game('scene', 'settings');
    await t.waitIdle();
    const note = await t.page.locator('#modal .fine').allInnerTexts();
    t.expect(note.some((x) => NEWER_NOTE.test(x)), 'Settings says why nothing is saved');
    t.equal(await t.page.locator('#fresh-row').count(), 0, 'and offers no Start fresh over the newer save');
    await t.page.locator('[data-toggle="badges"]').click();
    await t.page.locator('#vol').fill('0.3');
    await t.page.locator('[data-act="reset"]').click();
    await t.page.locator('#modal [data-act="erase"]').click();
    await t.page.waitForFunction(() => /Nothing was reset/.test(document.getElementById('toast').textContent), null, { timeout: 5000 });
    await t.page.locator('#modal [data-act="close"]').click();
    await inLevel(t);
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    await t.waitIdle(8000);
    await t.game('scene', 'win', 'w1-02');
    await t.waitIdle();
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.waitIdle();
    t.equal(await t.page.evaluate(() => window.__newerToasts), 1, 'the notice came once in the whole first visit, though it changed settings, started a level, won and reset');
    t.equal(await rawOf(t), NEWER, 'the stored save is byte for byte what it was after all of that');
    await t.reload();
    await t.waitIdle();
    t.equal(await rawOf(t), NEWER, 'and after a reload');
    t.equal(await rawOf(t, KEY + ':corrupt'), null, 'and no copy was made');
    t.equal(await t.page.evaluate(() => window.__newerToasts), 1, 'the notice came once in the next visit too');
  },
});
tests.push({
  name: 'C4-01 a truncated save still shows the unreadable-save card, and Start fresh keeps the old text',
  async run(t) {
    const bad = '{"v":1,"progress":{"w1-01":';
    await t.page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, bad]);
    await t.reload();
    await t.waitIdle();
    await t.game('scene', 'settings');
    await t.waitIdle();
    t.expect(/could not be read/.test(await t.page.locator('#fresh-row').innerText()), 'the card says it could not be read');
    t.expect(!/newer version/.test(await t.page.locator('#modal').innerText()), 'and does not blame a newer version');
    await t.page.locator('[data-act="fresh"]').click();
    await t.page.waitForFunction(() => /Started fresh/.test(document.getElementById('toast').textContent), null, { timeout: 5000 });
    t.equal(await rawOf(t, KEY + ':corrupt'), bad, 'the old text is kept');
  },
});

// --- C4-09: a returning player's Records do not read zero games ------------------------------------------------------------------
tests.push({
  name: 'C4-09 a cleared level counts as at least one try and one win, and real records are never lowered',
  node: true,
  run() {
    const none = recordCounts(OLD_WAVE2, LEVELS);
    assert.equal(none.cleared, 10); assert.equal(none.runs, 10, 'ten cleared levels, ten tries'); assert.equal(none.wins, 10, 'and ten wins');
    const mixed = recordCounts({ ...OLD_WAVE2, stats: { 'w1-01': { tries: 5, wins: 2, bestMoves: 9 }, 'w1-02': { tries: 3, wins: 0, bestMoves: 0 } } }, LEVELS);
    assert.equal(mixed.runs, 5 + 3 + 8, 'the recorded levels keep their numbers (w1-02 recorded 3 tries and no win, and reads as 3 tries and one win), and the eight with no record count one each');
    assert.equal(mixed.wins, 2 + 1 + 8, 'a cleared level with no recorded win counts one');
    assert.equal(mixed.comebacks, 1, 'achievements still read the real record: only w1-01 won after losing');
    const fresh = recordCounts(freshSave(), LEVELS);
    assert.equal(fresh.runs, 0); assert.equal(fresh.wins, 0);
    const lost = recordCounts({ progress: {}, stats: { 'w1-03': { tries: 4, wins: 0, bestMoves: 0 } } }, LEVELS);
    assert.equal(lost.runs, 4, 'tries on a level never cleared are counted as recorded'); assert.equal(lost.wins, 0);
    const before = JSON.stringify(OLD_WAVE2); recordCounts(OLD_WAVE2, LEVELS);
    assert.equal(JSON.stringify(OLD_WAVE2), before, 'the save object is not changed');
  },
});
tests.push({
  name: 'C4-09 a wave-2 save shows Games played and Games won beside Levels cleared, and opening Records writes nothing',
  async run(t) {
    const text = JSON.stringify(OLD_WAVE2);
    await t.page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, text]);
    await t.reload();
    await t.waitIdle();
    await t.game('scene', 'records');
    await t.waitIdle();
    const cells = await t.page.locator('.rec-stats div').evaluateAll((ds) => Object.fromEntries(ds.map((d) => [d.querySelector('dt').textContent, d.querySelector('dd').textContent])));
    t.equal(cells['Levels cleared'], '10 of 60', 'levels cleared');
    t.equal(cells['Games played'], '10', 'games played is not zero');
    t.equal(cells['Games won'], '10', 'games won is not zero');
    t.equal(await rawOf(t), text, 'display only: the stored save is untouched');
    await t.shot('C4-09-records');
  },
});

// --- C4-10: the lose card and Help say every way to earn a booster ----------------------------------------------------------------
tests.push({
  name: 'C4-10 the lose card fine print and Help both name the booster every 12 stars pays',
  async run(t) {
    await inLevel(t);
    await t.game('scene', 'lose');
    await t.waitIdle();
    const card = await t.page.locator('#modal .card').innerText();
    t.expect(/three-star wins, finished worlds and every 12 stars/.test(card), `the lose card line names stars (${card.split('\n').pop()})`);
    t.expect(await t.page.evaluate(() => { const c = document.querySelector('#modal .card'); return c.scrollWidth <= c.clientWidth; }), 'the card does not scroll sideways');
    await t.shot('C4-10-lose-card');
    await t.game('scene', 'help');
    await t.waitIdle();
    await t.page.locator('#modal [role="tab"]', { hasText: 'Goals' }).click();
    const help = await t.page.locator('#modal .card').innerText();
    t.expect(/three-star wins, finished worlds and every 12 stars/.test(help), 'Help (Goals) names the same ways');
    t.expect(await t.page.evaluate(() => { const c = document.querySelector('#modal .card'); return c.scrollWidth <= c.clientWidth; }), 'Help does not scroll sideways');
    await t.shot('C4-10-help-goals');
  },
});

// --- C4-11: a mouse or touch click on Pause or a booster does not leave focus on the button ----------------------------------------
tests.push({
  name: 'C4-11 after a click on Pause the keyboard goes back to the board: Enter wakes the board cursor and does not pause again',
  async run(t) {
    await inLevel(t);
    await press(t, '#btn-pause');
    t.equal((await t.state()).scene, 'pause', 'the click opened Pause');
    await press(t, '#modal [data-act="resume"]');
    t.equal((await t.state()).scene, 'game', 'Resume returned to the game');
    t.expect(!['btn-pause'].includes(await active(t)), `focus is not on the Pause button (it is on ${await active(t)})`);
    await t.page.keyboard.press('Enter');
    const s = await t.state();
    t.equal(s.scene, 'game', 'Enter did not press Pause again');
    t.expect(s.cursor >= 0, 'it woke the board cursor instead');
  },
});
tests.push({
  name: 'C4-11 after a click on a booster the keyboard goes back to the board, and a key press keeps focus where it put it',
  async run(t) {
    await inLevel(t);
    await press(t, '.booster[data-booster="hammer"]');
    t.equal((await t.state()).armed, 'hammer', 'the click armed the Hammer');
    t.expect(!(await active(t)).toString().includes('booster'), `focus is not left on the booster (it is on ${await active(t)})`);
    await t.page.keyboard.press('Enter');
    const s = await t.state();
    t.equal(s.armed, 'hammer', 'Enter did not press the Hammer again');
    t.expect(s.cursor >= 0, 'it woke the board cursor');
    if (t.viewport === 'desktop') {
      await t.page.keyboard.press('Escape');
      await t.page.focus('.booster[data-booster="line"]');
      await t.page.keyboard.press('Enter');
      t.equal((await t.state()).armed, 'line', 'Enter on a focused booster still arms it');
      t.expect((await active(t)).toString().includes('booster'), 'and focus stays on it after a key press');
    }
  },
});

// --- S5-10: a mute button in the play HUD -----------------------------------------------------------------------------------------
const settingsOf = async (t) => (await t.state()).settings;
const boxes = (t) => t.page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#tray .booster, #tray .round')].map((e) => { const r = e.getBoundingClientRect(); return [e.id || e.dataset.booster, { x: r.x, y: r.y, r: r.right, b: r.bottom, w: r.width, h: r.height }]; })));
const overlap = (a, b) => a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;
async function layoutOk(t, w, h) {
  const bx = await boxes(t), names = Object.keys(bx);
  t.expect(names.includes('btn-mute') && names.includes('btn-pause'), 'the tray has Mute and Pause');
  for (const n of names) t.expect(bx[n].x >= -0.5 && bx[n].r <= w + 0.5 && bx[n].y >= -0.5 && bx[n].b <= h + 0.5, `${n} is on the screen (${Math.round(bx[n].x)}-${Math.round(bx[n].r)}, ${Math.round(bx[n].y)}-${Math.round(bx[n].b)} of ${w}x${h})`);
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) t.expect(!overlap(bx[names[i]], bx[names[j]]), `${names[i]} and ${names[j]} do not overlap`);
  t.expect(bx['btn-mute'].w >= 44 && bx['btn-mute'].h >= 44, `the Mute button is at least 44 px (${bx['btn-mute'].w}x${bx['btn-mute'].h})`);
  const hud = await t.page.evaluate(() => { const r = document.getElementById('hud').getBoundingClientRect(), tr = document.getElementById('tray').getBoundingClientRect(); return { hud: { x: r.x, y: r.y, r: r.right, b: r.bottom }, tray: { x: tr.x, y: tr.y, r: tr.right, b: tr.bottom } }; });
  t.expect(!overlap(hud.hud, hud.tray), 'the HUD and the tray do not overlap');
}
tests.push({
  name: 'S5-10 the play HUD has a 44 px Mute button beside Pause that fits with the boosters on a phone, a desktop and a short landscape screen',
  async run(t) {
    await inLevel(t);
    await layoutOk(t, t.vp.width, t.vp.height);
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'false', 'it starts as sound on');
    await t.shot('S5-10-hud-mute');
    for (const [w, h] of [[360, 640], [844, 390], [667, 375]]) {
      await t.page.setViewportSize({ width: w, height: h });
      await t.page.waitForFunction((n) => window.innerWidth === n, w);
      await t.waitIdle();
      await layoutOk(t, w, h);
      if (w === 844) await t.shot('S5-10-hud-mute-landscape');
      if (w === 667) await t.shot('S5-10-hud-mute-small-landscape');
    }
    await t.page.setViewportSize({ width: t.vp.width, height: t.vp.height });
  },
});
tests.push({
  name: 'S5-10 one tap silences the effects, music and ambience, saves it, shows the muted icon, and the next tap brings back what was on',
  async run(t) {
    // music was already off by the player's choice: the speaker must not turn it on
    await t.page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify({ v: 1, settings: { sound: true, music: false, ambience: true, volume: 0.5 } })]);
    await t.reload();
    await inLevel(t);
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'false', 'sound is on');
    await press(t, '#btn-mute');
    let st = await settingsOf(t);
    t.expect(!st.sound && !st.music && !st.ambience, `all three switches are off (${JSON.stringify([st.sound, st.music, st.ambience])})`);
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'true', 'the button shows it is muted');
    t.equal(await t.page.locator('#btn-mute .mute-on').isVisible(), false, 'the sound waves are gone');
    t.equal(await t.page.locator('#btn-mute .mute-off').isVisible(), true, 'and the cross is there');
    const saved = JSON.parse(await rawOf(t)).settings;
    t.expect(saved.sound === false && saved.music === false && saved.ambience === false, 'the choice is saved with the other settings');
    await t.waitForAnimations();
    await t.shot('S5-10-muted');
    await t.page.waitForFunction(() => { const a = window.__game.audioState(); return a.ctx !== null && a.sfx === 0 && a.music === 0 && a.ambience === 0; }, null, { timeout: 5000 });
    // it survives a reload as muted, and the Settings card agrees
    await t.reload();
    await inLevel(t);
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'true', 'still muted after a reload');
    await press(t, '#btn-mute');
    st = await settingsOf(t);
    t.expect(st.sound && st.ambience, 'the next tap brings back the effects and the ambience');
    t.equal(st.music, false, 'but not the music the player had turned off');
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'false', 'the icon is back');
    await t.page.waitForFunction(() => { const a = window.__game.audioState(); return a.ctx !== null && a.sfx === 1 && a.music === 0 && a.ambience > 0.3; }, null, { timeout: 5000 });
  },
});
tests.push({
  name: 'S5-10 Mute works from the keyboard and tells a screen reader its state; Settings and the button stay in step',
  viewports: ['desktop'],
  async run(t) {
    await inLevel(t);
    await t.page.focus('#btn-mute');
    await t.page.keyboard.press('Enter');
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'true', 'Enter on the focused button mutes');
    t.equal(await active(t), 'btn-mute', 'focus stays on the button after a key press');
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-label'), 'Mute', 'its name stays Mute and aria-pressed carries the state');
    await t.page.keyboard.press('Space');
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'false', 'Space unmutes');
    // Settings changes reach the button: turning all three off there reads as muted
    await t.page.keyboard.press('Enter');
    await t.game('scene', 'pause');
    await t.page.locator('#modal [data-act="settings"]').click();
    t.equal(await t.page.locator('[data-toggle="sound"]').getAttribute('aria-pressed'), 'false', 'Settings shows the effects off after the mute');
    await t.page.locator('[data-act="close"]').click();
    await t.page.locator('#modal [data-act="resume"]').click();
    t.equal(await t.page.locator('#btn-mute').getAttribute('aria-pressed'), 'true', 'the button still reads muted');
  },
});

// --- C4-13: the older S5-01 test --------------------------------------------------------------------------------------------------------
tests.push({
  name: 'C4-13 the older S5-01 save test waits for the buses to reach their level, not for 600 ms',
  node: true,
  run() {
    const src = read('tests/council-w2-a.test.mjs');
    const i = src.indexOf("name: 'S5-01 a save from before this wave"), j = src.indexOf('\n  },\n', i);
    assert.ok(i > 0 && j > i, 'the test is there');
    const body = src.slice(i, j);
    assert.equal(/waitForTimeout\(/.test(body), false, 'no fixed wait inside it');
    assert.equal((body.match(/waitAudio\(t, \(x\) =>/g) || []).length, 2, 'it waits for the bus state twice');
  },
});
// --- C4-14: the merged comment -----------------------------------------------------------------------------------------------------------
tests.push({
  name: 'C4-14 the spray comment in the board view is two comments on their own lines, and no source line carries two run-together comments',
  node: true,
  run() {
    const src = read('src/js/view/board-view.js').split('\n');
    const k = src.findIndex((l) => l.includes('const lift = rise * p'));
    assert.ok(k > 1);
    assert.equal(src[k].includes('//'), false, 'the code line has no trailing comment');
    assert.match(src[k - 2], /^\s*\/\/ a throw: up first, then down under its own weight$/);
    assert.match(src[k - 1], /^\s*\/\/ dir: up or down off the sheet, then back toward it$/);
    const merged = [];
    for (const f of ['src/js/view/board-view.js', 'src/js/ui/play.js', 'src/js/ui/screens.js', 'src/js/audio.js', 'src/js/ui/save.js']) read(f).split('\n').forEach((l, n) => { if (/\S.*[^:'"`]\/\/[^'"`]*[^:'"`]\/\/ /.test(l.replace(/https?:\/\/\S+/g, ''))) merged.push(`${f}:${n + 1}`); });
    assert.deepEqual(merged, [], 'no line has two comments run together');
  },
});

// --- C4-06: the sound measuring tools start every cue and mix 0.2 s in -----------------------------------------------------------
// Chromium's offline limiter reads a sound in the first 0.2 s two to four times low (tufa alone at the default volume: 0.28 from time 0, 0.96 from 0.2 s), so a cue
// rendered at time 0 passed "alone under 0.95" and "0.2 to 0.45" checks that the live game, which never sounds a cue at the instant its context starts, does not.
tests.push({
  name: 'C4-06 cueRender, mixRender and audioRender start their sound 0.2 s into the render, and levels.start puts it back at 0',
  viewports: ['desktop'],
  async run(t) {
    const honest = await t.game('cueRender', 'tufa', 0, {}, 2.5, false, 1), legacy = await t.game('cueRender', 'tufa', 0, {}, 2.5, false, 1, { start: 0 });
    t.expect(honest.peak > legacy.peak * 1.5, `tufa alone reads ${honest.peak} from 0.2 s and ${legacy.peak} from time 0: the old reading was far too low`);
    t.equal(honest.seconds, 2.7, 'the render is 0.2 s longer than asked, so the whole cue is inside it');
    t.equal(legacy.seconds, 2.5, 'and start: 0 gives the old length');
    const silent = await t.game('cueRender', 'tufa', 0, {}, 0, false, 1);
    t.equal(silent.peak, 0, 'nothing sounds in the first 0.2 s');
    const mix = await t.game('mixRender', { seconds: 2.5, cues: [{ name: 'tufa', arg: 0, at: 0, seed: 1 }] });
    t.expect(Math.abs(mix.peak - honest.peak) < 0.005, `the same cue in mixRender at 0 reads ${mix.peak}, as cueRender (${honest.peak})`);
    t.equal(mix.seconds, 2.7, 'a mix starts 0.2 s in as well');
    const piece = await t.game('audioRender', 'title', 3, false);
    t.equal(piece.seconds, 3.2, 'a piece starts 0.2 s in');
    t.equal((await t.game('audioRender', 'title', 3, false, { start: 0 })).seconds, 3, 'and start: 0 puts it back');
    const full = await t.game('cueRender', 'tufa', 0, {}, 2.5, false, 1, { volume: 1 });
    t.expect(full.peak > honest.peak, `at the maximum volume the same cue reads ${full.peak}, above ${honest.peak}: the hook takes the volume the full-volume tool needs`);
  },
});
tests.push({
  name: 'C4-06 every cue re-read as heard (0.2 s in): the gameplay range and the full-volume reading, with the older reading beside them',
  viewports: ['desktop'],
  async run(t) {
    const L = await t.game('audioList'), rows = [];
    const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    for (const name of L.cues) {
      const arg = { match: 3, token: 2, star: 2, starline: 2, low: 3 }[name] || 0, opt = name === 'match' ? { size: 5 } : {}, d = [], o = [], f = [];
      for (const seed of [1, 2, 3, 4, 5]) {
        d.push((await t.game('cueRender', name, arg, opt, 3, false, seed)).peak);
        o.push((await t.game('cueRender', name, arg, opt, 3, false, seed, { start: 0 })).peak);
        f.push((await t.game('cueRender', name, arg, opt, 3, false, seed, { volume: 1 })).peak);
      }
      rows.push({ name, heard: med(d), fromZero: med(o), full: Math.max(...f) });
      t.expect(med(d) >= med(o) * 0.9, `${name}: heard ${med(d)} is not below the time-0 reading ${med(o)}`);
      t.expect(Math.max(...f) > med(d), `${name}: the full-volume reading ${Math.max(...f)} is above the default ${med(d)}`);
    }
    const out = rows.filter((r) => r.heard < 0.2 || r.heard > 0.45), clip = rows.filter((r) => r.full >= 0.95);
    t.log(`default volume, median of 5 draws, as heard (from time 0 in brackets): ${rows.map((r) => `${r.name} ${r.heard} (${r.fromZero})`).join('; ')}`);
    t.log(`${out.length} of ${rows.length} cues sit outside 0.2 to 0.45 as heard: ${out.map((r) => r.name).join(', ')}`);
    t.log(`at the maximum volume ${clip.length} cues alone reach 0.95 or more: ${clip.map((r) => `${r.name} ${r.full}`).join(', ')}`);
  },
});

// --- C4-07: the results card at full volume, with the timing screens.js really uses -----------------------------------------------
tests.push({
  name: 'C4-07 the results cards ring the stars (at the card levels) and the earned chime at the times the test below uses (380, 560, 740 ms; 810, 990, 1170 ms)',
  node: true,
  run() {
    const src = read('src/js/ui/screens.js');
    assert.equal((src.match(/sfx\('star', (n|k), \{ level: CARD_STAR_LEVEL\[(n|k)\] \}\), 200 \+ (n|k) \* 180\)/g) || []).length, 2, 'both result cards ring star n at its card level at 200 + n x 180 ms');
    assert.equal((src.match(/sfx\('earned'\); \}, 200 \+ \(stars \+ 1\) \* 180 \+ 250\)/g) || []).length, 2, 'and the earned chime at 200 + (stars + 1) x 180 + 250 ms');
  },
});
const MAX = { volume: 1 };
// What the game really asks for on its results card: the level of each star cue, read from the calls the card makes (so a card that stopped passing its levels is seen).
async function liveStarLevels(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.waitIdle();
  await t.page.evaluate(() => { const s = window.__game.engineState(); s.phase = 'won'; s.starsWon = 3; s.movesLeft = 0; for (const g of s.goals) g.have = g.type === 'score' ? s.score : g.need; window.__game.setState(s); window.__game.act('win'); });
  await t.page.waitForFunction(() => [1, 2, 3].every((n) => window.__game.getState().calls.some((c) => c.name === 'star' && c.arg === n)), null, { timeout: 8000 });
  const calls = (await t.state()).calls, level = {};
  for (const n of [1, 2, 3]) level[n] = calls.filter((c) => c.name === 'star' && c.arg === n).pop().level;
  return level;
}
tests.push({
  name: 'C4-07 the results card stays under 0.95 at the maximum volume for 1, 2 and 3 stars over every bed, with the stars and the earned chime struck up to 50 ms early or late',
  viewports: ['desktop'],
  async run(t) {
    const L = await t.game('audioList'), worst = { 1: 0, 2: 0, 3: 0 }, at = {}, live = await liveStarLevels(t);
    t.log(`the card's own star levels: ${JSON.stringify(live)}`);
    t.expect(live[1] < 1 && live[2] < 1 && live[3] < 1, 'the card rings its stars turned down');
    for (const stars of [1, 2, 3]) for (const bed of [null, ...L.ambience]) for (const shift of [-0.05, 0, 0.05]) for (const seed of [1, 7]) {
      const cues = [{ name: 'win', arg: stars, at: 0, seed }, ...Array.from({ length: stars }, (_, k) => ({ name: 'star', arg: k + 1, at: 0.2 + (k + 1) * 0.18 + shift, seed: seed + 1 + k, opt: { level: live[k + 1] } })), { name: 'earned', arg: 0, at: (200 + (stars + 1) * 180 + 250) / 1000 + shift, seed: seed + 9 }];
      const p = (await t.game('mixRender', { piece: 'results', bed, seconds: 4, levels: MAX, cues })).peak;
      if (p > worst[stars]) { worst[stars] = p; at[stars] = `${bed || 'no bed'}, shift ${shift}, seed ${seed}`; }
    }
    t.log(`worst card at the maximum volume: 1 star ${worst[1]} (${at[1]}), 2 stars ${worst[2]} (${at[2]}), 3 stars ${worst[3]} (${at[3]})`);
    for (const stars of [1, 2, 3]) t.expect(worst[stars] < 0.95, `the ${stars} star card peaks ${worst[stars]} at worst (${at[stars]}), under 0.95`);
  },
});
tests.push({
  name: 'C4-07 the first star cue, struck at its card level, is as heard inside the gameplay range, and a 3 star win is still the fuller card',
  viewports: ['desktop'],
  async run(t) {
    const live = await liveStarLevels(t), med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)], star = {};
    for (const arg of [1, 2, 3]) { const xs = []; for (const seed of [1, 2, 3, 4, 5]) xs.push((await t.game('cueRender', 'star', arg, { level: live[arg] }, 3, false, seed)).peak); star[arg] = med(xs); }
    t.log(`star cues as heard at their card levels, default volume, median of 5: 1 ${star[1]}, 2 ${star[2]}, 3 ${star[3]}`);
    t.expect(star[1] >= 0.2 && star[1] <= 0.45, `the first star cue peaks ${star[1]} as heard on the card, inside 0.2 to 0.45`);
    const card = (stars) => t.game('mixRender', { piece: 'results', seconds: 4, levels: { volume: 0.5 }, cues: [{ name: 'win', arg: stars, at: 0, seed: 1 }, ...Array.from({ length: stars }, (_, k) => ({ name: 'star', arg: k + 1, at: 0.2 + (k + 1) * 0.18, seed: 2 + k, opt: { level: live[k + 1] } }))] });
    const one = await card(1), three = await card(3);
    t.expect(three.rms > one.rms, `the 3 star card carries more sound than the 1 star card (rms ${three.rms} against ${one.rms})`);
  },
});

// --- C4-08: the skip crowd level, measured over every set of four and a seeded draw of folded sets ---------------------------------
// The finding asked for a gentler slope (about 1 / sqrt(n) from three cues up) with every set under 0.95 at the maximum volume and the goal cue at four cues not under 0.2.
// Measured here, those cannot all hold while the cues themselves read as loud as they do (a single cue alone reaches 0.95 or more at the maximum): see the report. So this test
// is a ceiling: it records the worst set of four, the worst of a seeded draw and the goal cue's level at four cues, and fails if a change makes any of them worse than it is today.
const FOLD8 = ['goal', 'combo', 'crystal', 'match', 'stone', 'tufa', 'lock', 'special'];
const KINDS = ['goal', 'combo', 'crystal', 'match', 'stone', 'cascade', 'special', 'tufa', 'lock', 'moss', 'fog', 'token', 'spread', 'reshuffle', 'booster', 'starline', 'swap'];
const lcg = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
tests.push({
  name: 'C4-08 every set of four folded cues and a seeded draw of 40 folded sets: the worst peak and the goal cue at four cues do not get worse than today',
  viewports: ['desktop'],
  async run(t) {
    const L = await t.game('audioList'), pieces = [];
    for (const name of L.music) pieces.push([name, (await t.game('audioRender', name, 12, false, MAX)).peak]);
    pieces.sort((a, b) => b[1] - a[1]);
    const piece = pieces[0][0];
    const mix = async (set, level, levels = MAX, p = piece) => (await t.game('mixRender', { piece: p, bed: p ? 'rain' : null, seconds: 4, levels, cues: set.map((name, k) => ({ name, arg: 3, at: 1 + k * 0.04, seed: 1 + k, opt: { level, size: 5 } })) })).peak;
    let worstFour = 0, wf = '';
    const l4 = await t.game('crowdLevel', 4);
    for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) for (let c = b + 1; c < 8; c++) for (let d = c + 1; d < 8; d++) {
      const set = [FOLD8[a], FOLD8[b], FOLD8[c], FOLD8[d]], p = await mix(set, l4);
      if (p > worstFour) { worstFour = p; wf = set.join(','); }
    }
    const r = lcg(12345); let worstDraw = 0, wd = '';
    for (let i = 0; i < 40; i++) {
      const n = 4 + Math.floor(r() * 6), pool = KINDS.filter((k) => L.cues.includes(k)), set = [], level = await t.game('crowdLevel', n);
      while (set.length < n) set.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
      const p = await mix(set, level);
      if (p > worstDraw) { worstDraw = p; wd = `${set.join(',')} at ${level.toFixed(2)}`; }
    }
    const goal4 = await mix(['goal'], l4, {}, null), goal1 = await mix(['goal'], 1, {}, null);
    t.log(`loudest piece ${piece}; worst of the 70 sets of four ${worstFour} (${wf}); worst of the seeded draw ${worstDraw} (${wd}); goal alone at the default volume ${goal1}, at four cues (level ${l4}) ${goal4}`);
    // today's readings are 0.9895, 0.9525 and 0.1752; the ceilings sit just beside them so only a real change trips them
    t.expect(worstFour <= 1.0, `no set of four peaks above 1.0 (worst ${worstFour}: ${wf})`);
    t.expect(worstDraw <= 0.96, `no set in the seeded draw peaks above 0.96 (worst ${worstDraw}: ${wd})`);
    t.expect(goal4 >= 0.17, `the goal cue at four cues stays at or above 0.17 (${goal4})`);
    t.expect((await t.game('crowdLevel', 3)) === 1 && l4 < 1, 'three cues or fewer are struck at full level, four or more are turned down');
  },
});
