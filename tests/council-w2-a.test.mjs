// Council wave 2, batch A: music and ambience per world (S5-01, S4-21).
const KEY = 'spa-city-sparkle:v1';
const MUSIC = ['title', 'intro', 'results', 'row', 'mountain', 'avenue', 'oaklawn', 'lakes', 'garvan'];
const AMBIENCE = ['town', 'bathhouse', 'springs', 'rain', 'grandstand', 'shore', 'garden'];
const WORLD_PIECE = { 1: 'row', 2: 'mountain', 3: 'avenue', 4: 'oaklawn', 5: 'lakes', 6: 'garvan' };
const WORLD_BED = { 1: 'bathhouse', 2: 'springs', 3: 'rain', 4: 'grandstand', 5: 'shore', 6: 'garden' };
const CUE_PEAK_MAX = 0.45; // the loudest gameplay cue the standards allow

export const tests = [];

// --- measurements: every piece and every bed on its own offline context -------------------------------------------
tests.push({
  name: 'S5-01 the game lists its music and ambience by name',
  viewports: ['desktop'],
  async run(t) {
    const l = await t.game('audioList');
    t.equal(JSON.stringify(l.music), JSON.stringify(MUSIC), 'music names');
    t.equal(JSON.stringify(l.ambience), JSON.stringify(AMBIENCE), 'ambience names');
    t.expect(l.music.length >= 8, 'a title/map theme, a level-card bed, a results piece and one piece per world');
  },
});
for (const name of MUSIC) {
  tests.push({
    name: `S5-01 music "${name}" renders 60 s inside the mix limits, with form and variation`,
    viewports: ['desktop'],
    async run(t) {
      const r = await t.game('audioRender', name, 60, false);
      t.log(`${name}: peak ${r.peak}, rms ${r.rmsDb} dBFS, longest silence ${r.longestSilence} s, form ${r.built.formSeconds} s (${r.built.formBars} bars), ${r.built.distinctBars} distinct bars, ${r.built.pitches} pitches, stereo ${r.stereo}`);
      t.expect(r.peak >= 0.06 && r.peak <= 0.16, `music peak ${r.peak} is between 0.06 and 0.16`);
      t.expect(r.rmsDb >= -40 && r.rmsDb <= -28, `music RMS ${r.rmsDb} dBFS is between -40 and -28`);
      t.expect(r.longestSilence <= 2, `no silence longer than 2 s (${r.longestSilence})`);
      t.expect(r.built.formSeconds >= 45, `the form lasts ${r.built.formSeconds} s before it repeats`);
      t.expect(r.built.formBars >= 16, `${r.built.formBars} bars in the form`);
      t.expect(r.built.distinctBars >= 6, `${r.built.distinctBars} distinct bars of melody`);
      t.expect(r.built.pitches >= 6, `${r.built.pitches} distinct pitches`);
      t.expect(r.peak + 0.07 + CUE_PEAK_MAX < 0.95, 'music plus the loudest ambience plus the loudest cue stays under 0.95');
    },
  });
}
for (const name of AMBIENCE) {
  tests.push({
    name: `S4-21 ambience "${name}" renders 30 s inside the mix limits with no silent stretch`,
    viewports: ['desktop'],
    async run(t) {
      const r = await t.game('audioRender', name, 30, false);
      t.log(`${name}: peak ${r.peak}, rms ${r.rmsDb} dBFS, longest silence ${r.longestSilence} s, stereo ${r.stereo}`);
      t.expect(r.peak < 0.07, `ambience peak ${r.peak} is under 0.07`);
      t.expect(r.rmsDb >= -52 && r.rmsDb <= -38, `ambience RMS ${r.rmsDb} dBFS is between -52 and -38`);
      t.expect(r.longestSilence <= 2, `no silence longer than 2 s (${r.longestSilence})`);
    },
  });
}
tests.push({
  name: 'S5-01 rendering a piece leaves the live audio and the settings alone',
  viewports: ['desktop'],
  async run(t) {
    const before = await t.state();
    await t.game('audioRender', 'title', 3, false);
    const a = await t.game('audioState');
    t.equal(a.ctx, null, 'no live audio context was made by the render');
    t.equal(JSON.stringify((await t.state()).settings), JSON.stringify(before.settings), 'settings unchanged');
  },
});

// --- live behaviour -----------------------------------------------------------------------------------------------
function trackAudio() {
  window.__node = 0; window.__ctxs = [];
  const Base = window.AudioContext;
  const co = Base.prototype.createOscillator, cb = Base.prototype.createBufferSource;
  Base.prototype.createOscillator = function () { window.__node++; return co.call(this); };
  Base.prototype.createBufferSource = function () { window.__node++; return cb.call(this); };
  window.AudioContext = class extends Base { constructor(...a) { super(...a); window.__ctxs.push(this); } };
}
const nodes = (t) => t.page.evaluate(() => window.__node);
const audio = (t) => t.game('audioState');
async function unlock(t) {
  await t.page.mouse.click(5, 5);
  await t.page.waitForFunction(() => window.__ctxs.length && window.__ctxs[0].state === 'running', null, { timeout: 5000 });
}
const waitAudio = (t, pred, arg) => t.page.waitForFunction(`(${pred})(window.__game.audioState(), ${JSON.stringify(arg ?? null)})`, null, { timeout: 5000 });
const setHidden = (t, hidden) => t.page.evaluate((h) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
  document.dispatchEvent(new Event('visibilitychange'));
}, hidden);

tests.push(
  {
    name: 'S5-01 nothing plays before the first gesture; the title theme starts with it',
    initScript: trackAudio,
    async run(t) {
      await t.waitIdle();
      await t.page.waitForTimeout(800);
      t.equal(await t.page.evaluate(() => window.__ctxs.length), 0, 'no audio context before a gesture');
      t.equal(await nodes(t), 0, 'no oscillator or noise source before a gesture');
      await unlock(t);
      await waitAudio(t, (a) => a.playing && a.playing.music && a.playing.ambience);
      const a = await audio(t);
      t.equal(a.mood.score, 'title', 'the title theme');
      t.equal(a.mood.scene, 'town', 'the town bed');
      await t.page.waitForTimeout(900);
      t.expect((await nodes(t)) > 0, 'notes are scheduled once the context runs');
    },
  },
  {
    name: 'S5-01 each screen has its mood: title and map theme, level card, each world, results',
    initScript: trackAudio,
    async run(t) {
      await t.waitIdle();
      await unlock(t);
      const mood = async () => (await audio(t)).mood;
      await t.game('scene', 'map');
      await t.waitIdle();
      t.equal((await mood()).score, 'title', 'the map shares the title theme');
      for (const w of [1, 2, 3, 4, 5, 6]) {
        const id = `w${w}-01`;
        await t.game('scene', 'intro', id);
        await t.waitIdle();
        let m = await mood();
        t.equal(m.score + '/' + m.scene, 'intro/' + WORLD_BED[w], `world ${w} level card: calm bed under the world's place`);
        await t.game('newGame', { level: id, seed: 3, tips: false });
        await t.waitIdle();
        m = await mood();
        t.equal(m.score + '/' + m.scene, WORLD_PIECE[w] + '/' + WORLD_BED[w], `world ${w} play: its own piece and bed`);
      }
      await t.game('scene', 'win');
      await t.waitIdle();
      t.equal((await mood()).score, 'results', 'the result card cools down');
      await t.game('scene', 'title');
      await t.waitIdle();
      t.equal((await mood()).score, 'title', 'back on the title');
    },
  },
  {
    name: 'S5-01 the last few moves lift the music, and it settles back',
    viewports: ['desktop'],
    initScript: trackAudio,
    async run(t) {
      await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
      await t.waitIdle();
      await unlock(t);
      await waitAudio(t, (a) => a.playing && a.playing.music);
      t.equal((await audio(t)).intensity, 0, 'calm at the start');
      const s = await t.game('engineState');
      await t.page.evaluate((st) => window.__game.setState(st), { ...s, movesLeft: 4 });
      t.expect((await audio(t)).intensity > 0, 'lifted at 4 moves left');
      await t.page.evaluate((st) => window.__game.setState(st), { ...s, movesLeft: 12 });
      t.equal((await audio(t)).intensity, 0, 'calm again with plenty of moves');
    },
  },
  {
    name: 'S5-01 the Pause card and a hidden tab fade music and ambience out and schedule nothing; they return without a pile-up',
    viewports: ['desktop'],
    initScript: trackAudio,
    async run(t) {
      await t.game('newGame', { level: 'w2-01', seed: 3, tips: false });
      await t.waitIdle();
      await unlock(t);
      await waitAudio(t, (a) => a.playing && a.music > 0.3 && a.ambience > 0.3);
      await t.page.locator('#btn-pause').click();
      await t.waitIdle();
      await waitAudio(t, (a) => a.held && a.music < 0.02 && a.ambience < 0.02);
      const n = await nodes(t);
      await t.page.waitForTimeout(1500);
      t.equal(await nodes(t), n, 'nothing is scheduled under the Pause card');
      await t.page.locator('#modal [data-act="resume"]').click();
      await waitAudio(t, (a) => !a.held && a.music > 0.3 && a.ambience > 0.3);
      await setHidden(t, true);
      await t.page.waitForTimeout(600);
      const h = await nodes(t);
      await t.page.waitForTimeout(1200);
      t.equal(await nodes(t), h, 'nothing is scheduled in a hidden tab');
      t.expect((await audio(t)).held, 'held while hidden');
      await setHidden(t, false);
      await waitAudio(t, (a) => !a.held && a.ctx === 'running');
      await t.page.waitForTimeout(1500);
      const grown = (await nodes(t)) - h;
      t.expect(grown > 0 && grown < 400, `scheduling resumes at a normal rate (${grown} new sources in 1.5 s)`);
    },
  },
);

// --- settings: three separate switches, saved --------------------------------------------------------------------
async function openSettings(t) {
  await t.game('scene', 'settings');
  await t.waitIdle();
}
const bus = (t, which) => t.page.evaluate((k) => window.__game.audioState()[k], which);
tests.push(
  {
    name: 'S5-01 Settings has Sound effects, Music and Ambience, and each one is saved',
    initScript: trackAudio,
    async run(t) {
      await t.waitIdle();
      await unlock(t);
      await openSettings(t);
      const labels = await t.page.locator('#modal .set-row label').allInnerTexts();
      for (const l of ['Sound effects', 'Music', 'Ambience']) t.expect(labels.includes(l), `Settings lists ${l}`);
      await waitAudio(t, (a) => a.music > 0.3 && a.ambience > 0.3);
      await t.shot('S5-01-settings');
      await t.page.locator('#modal [data-toggle="music"]').click();
      await waitAudio(t, (a) => a.music < 0.02 && a.ambience > 0.3);
      t.equal((await t.state()).settings.music, false, 'Music is off in the settings');
      await t.reload();
      await t.waitIdle();
      await unlock(t);
      t.equal((await t.state()).settings.music, false, 'Music stays off after a reload');
      await waitAudio(t, (a) => a.music < 0.02 && a.ambience > 0.3);
      await openSettings(t);
      await t.page.locator('#modal [data-toggle="music"]').click();
      await waitAudio(t, (a) => a.music > 0.3);
      await t.page.locator('#modal [data-toggle="ambience"]').click();
      await waitAudio(t, (a) => a.ambience < 0.02 && a.music > 0.3);
      t.equal((await t.state()).settings.ambience, false, 'Ambience is off in the settings');
      await t.reload();
      await t.waitIdle();
      await unlock(t);
      t.equal((await t.state()).settings.ambience, false, 'Ambience stays off after a reload');
      t.equal((await t.state()).settings.music, true, 'Music is back on');
      await waitAudio(t, (a) => a.ambience < 0.02 && a.music > 0.3);
      await openSettings(t);
      await t.page.locator('#modal [data-toggle="sound"]').click();
      await waitAudio(t, (a) => a.music < 0.02 && a.ambience < 0.02);
      t.equal((await t.state()).settings.sound, false, 'the master Sound switch silences music and ambience too');
    },
  },
  {
    name: 'S5-01 a save from before this wave loads with music and ambience on, and a save that had sound off stays silent',
    initScript: trackAudio,
    async run(t) {
      const old = { v: 1, settings: { sound: true, music: true, volume: 0.5, motion: 'auto', steam: true, hints: true, badges: false }, progress: { 'w1-01': { stars: 2, best: 1500 } }, boosters: { hammer: 1, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [], current: null, soakDay: null, soakBest: 0 };
      await t.page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, old]);
      await t.reload();
      await t.waitIdle();
      let s = await t.state();
      t.equal(s.settings.ambience, true, 'ambience defaults to on for an old save');
      t.equal(s.settings.music, true, 'music stays on');
      t.equal(s.progress['w1-01'].stars, 2, 'progress untouched');
      await unlock(t);
      await waitAudio(t, (a) => a.music > 0.3 && a.ambience > 0.3);
      await t.page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, { ...old, settings: { ...old.settings, sound: false } }]);
      await t.reload();
      await t.waitIdle();
      s = await t.state();
      t.equal(s.settings.sound, false, 'sound off is kept');
      await unlock(t);
      await t.page.waitForTimeout(600);
      t.equal(await bus(t, 'music'), 0, 'the music bus is silent');
      t.equal(await bus(t, 'ambience'), 0, 'the ambience bus is silent');
      t.equal(s.progress['w1-01'].best, 1500, 'best score untouched');
    },
  },
);
