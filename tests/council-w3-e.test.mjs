// Council wave 3, batch E: sound, booster arming, the 1920s lore, a lower-quality screen
// (S6-14, S1-06, S4-07, S4-17, S6-09).
// Nothing here depends on chance: boards are seeded, waits are for conditions, and the sound checks count what the audio graph builds
// (the offline render uses a seeded kit) instead of listening to a timer.
export const tests = [];

// --- S6-14: one shared noise buffer, and nothing built for a bus nobody can hear -----------------------------------------------
const NOISY = ['swap', 'tufa', 'fog', 'cascade', 'bounce', 'match', 'crystal', 'combo', 'stone', 'moss'];
tests.push({
  name: 'S6-14 cues reuse one noise buffer instead of allocating one each',
  viewports: ['desktop'],
  async run(t) {
    await t.game('scene', 'title');
    await t.page.mouse.click(5, 5);
    await t.page.waitForFunction(() => window.__game.audioState().ctx === 'running', null, { timeout: 8000 });
    const r = await t.page.evaluate((names) => {
      const P = BaseAudioContext.prototype, count = { buffer: 0, source: 0 }, mk = P.createBuffer, src = P.createBufferSource;
      P.createBuffer = function (...a) { count.buffer++; return mk.apply(this, a); };
      P.createBufferSource = function (...a) { count.source++; return src.apply(this, a); };
      try { for (let i = 0; i < 30; i++) window.__game.cue(names[i % names.length], i % 4, { size: 3 }); } finally { P.createBuffer = mk; P.createBufferSource = src; }
      return count;
    }, NOISY);
    t.expect(r.source >= 30, `thirty cues started at least thirty noise sources (${r.source})`);
    t.expect(r.buffer <= 1, `and they made ${r.buffer} buffers (one, the first time)`);
  },
});
tests.push({
  name: 'S6-14 a cue is still different each time it is struck, and the levels held',
  viewports: ['desktop'],
  async run(t) {
    for (const name of ['swap', 'tufa', 'fog']) {
      const peaks = [];
      for (let seed = 1; seed <= 8; seed++) peaks.push((await t.game('cueRender', name, 0, {}, 2, false, seed)).peak);
      const sorted = peaks.slice().sort((a, b) => a - b), median = sorted[4];
      t.expect(median >= 0.2 && median <= 0.45, `${name} median peak ${median.toFixed(3)} is inside 0.2 to 0.45`);
      t.expect(new Set(peaks.map((p) => p.toFixed(4))).size >= 4, `${name}: repeats differ (${peaks.map((p) => p.toFixed(3)).join(' ')})`);
    }
  },
});
tests.push({
  name: 'S6-14 a piece with its switch off or the volume at 0 builds no notes; with them on it does',
  viewports: ['desktop'],
  async run(t) {
    const on = await t.game('audioRender', 'garvan', 12, false);
    t.expect(on.built.bars > 0 && on.built.notes > 0, `the piece builds bars when it can be heard (${on.built.bars} bars)`);
    for (const [label, lv] of [['music volume 0', { musicVolume: 0 }], ['master volume 0', { volume: 0 }]]) {
      const off = await t.game('audioRender', 'garvan', 12, false, lv);
      t.equal(off.built.bars, 0, `${label}: no bar is built`);
      t.equal(off.built.notes, 0, `${label}: no note is built`);
    }
  },
});
tests.push({
  name: 'S6-14 a bed with its level at 0 builds its layers but none of the one-shots',
  viewports: ['desktop'],
  async run(t) {
    const count = (levels) => t.page.evaluate(async (lv) => {
      const P = BaseAudioContext.prototype, c = { n: 0 }, mk = P.createOscillator, src = P.createBufferSource;
      P.createOscillator = function (...a) { c.n++; return mk.apply(this, a); };
      P.createBufferSource = function (...a) { c.n++; return src.apply(this, a); };
      try { await window.__game.audioRender('rain', 30, false, lv); } finally { P.createOscillator = mk; P.createBufferSource = src; }
      return c.n;
    }, levels);
    const heard = await count({}), silent = await count({ ambience: 0 }), muted = await count({ volume: 0 });
    // The continuous layers are started either way; what the level 0 saves is every sparse one-shot after them.
    t.expect(heard >= silent + 8, `a heard bed builds its one-shots (${heard} sources, against ${silent} for the layers alone)`);
    t.equal(muted, silent, 'a bed at volume 0 builds only the layers too');
  },
});
tests.push({
  name: 'S6-14 the live game stops building at volume 0 and starts again when it is raised',
  async run(t) {
    await t.game('scene', 'settings');
    await t.page.mouse.click(5, 5);
    await t.page.waitForFunction(() => window.__game.audioState().ctx === 'running', null, { timeout: 8000 });
    await t.page.focus('#vol');
    await t.page.keyboard.press('Home');
    await t.page.waitForFunction(() => window.__game.audioState().muted === true, null, { timeout: 5000 });
    t.equal((await t.game('audioState')).master, 0, 'the master volume is 0');
    await t.page.keyboard.press('ArrowRight');
    await t.page.waitForFunction(() => window.__game.audioState().muted === false, null, { timeout: 5000 });
  },
});
