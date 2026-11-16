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
