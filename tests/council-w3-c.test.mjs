// Council wave 3, batch C: controls, rules and play; difficulty, progression and records; feedback, teaching and help
// (S3-14, S5-13, S1-11, S2-06, S2-07, S4-05, S2-18; S4-10 needs the owner and S3-10 no longer applies).
// Nothing here depends on chance: every board is seeded, every wait is for a condition, and the sound checks count what a cue builds.
export const tests = [];

const BOARD = ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d']; // one swap, [1,1] with [1,0], breaks the stone and wins with moves to spare
const RULES = ['aL1 b c d e', 'b c d e a', 'c d e a b', 'd bF a b c', 'e S1 T c d']; // a padlocked piece, a fogged piece, tufa and a bath token; no match on the board
const NEVER = { moves: 40, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] };

// Real pointer input: the mouse on a desktop, CDP touch on the phone.
async function geometry(t) {
  const s = await t.state();
  const rect = await t.page.evaluate(() => { const r = document.querySelector('#stage canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const L = s.layout;
  return (x, y) => [rect.x + L.bx + (x + 0.5) * L.cell, rect.y + L.by + (y + 0.5) * L.cell];
}
const pointer = (t, p) => (t.viewport === 'mobile' ? t.tap(p) : t.page.mouse.click(...p));
const toastText = (t) => t.page.evaluate(() => { const e = document.getElementById('toast'); return e.classList.contains('show') ? e.textContent : ''; });
const clearToast = (t) => t.page.evaluate(() => { const e = document.getElementById('toast'); clearTimeout(e._h); e.classList.remove('show'); e.textContent = ''; });
const sounds = (t) => t.page.evaluate(() => window.__game.getState().sounds);

// --- audio helpers: the audio context is real; the stub only counts what the game builds ---------------------------------
function trackAudio() {
  window.__node = 0; window.__ctxs = [];
  const Base = window.AudioContext, co = Base.prototype.createOscillator, cb = Base.prototype.createBufferSource;
  Base.prototype.createOscillator = function () { window.__node++; return co.call(this); };
  Base.prototype.createBufferSource = function () { window.__node++; return cb.call(this); };
  window.AudioContext = class extends Base { constructor(...a) { super(...a); window.__ctxs.push(this); } };
}
async function unlock(t) {
  await t.page.mouse.click(5, 5);
  await t.page.waitForFunction(() => window.__ctxs.length && window.__ctxs[0].state === 'running', null, { timeout: 5000 });
}
// Sources one cue builds, counted in a single synchronous step so the music's timer cannot add to it.
const cueNodes = (t, name, arg) => t.page.evaluate(([n, a]) => { const before = window.__node; window.__game.cue(n, a); return window.__node - before; }, [name, arg]);

// --- S3-14: the Encore says it can be skipped, and skipping ends it at once --------------------------------------------------
async function toEncore(t, before) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.game('act', 'board', BOARD, { moves: 10, goals: [{ type: 'stone', need: 1 }], stars: [1, 2, 3] });
  await t.waitIdle();
  if (before) await before();
  t.equal((await t.game('act', 'swap', [1, 1], [1, 0])).valid, true, 'the winning swap is legal');
  await t.page.waitForFunction(() => /Encore/.test(document.querySelector('#toast.show')?.textContent || ''), null, { timeout: 8000 });
}
const inEncore = (t) => t.page.waitForFunction(() => { const s = window.__game.getState(); return s.anim.playing && s.phase === 'won' && s.movesLeft === 0; }, null, { timeout: 8000 });
tests.push({
  name: 'S3-14 the Encore says how to skip it, a tap skips it, and the fanfare plays once',
  async run(t) {
    await toEncore(t);
    t.equal(await toastText(t), 'Encore! Tap to skip', 'the toast says how to skip');
    await t.shot('S3-14-encore-toast', { wait: false });
    await inEncore(t);
    const at = await geometry(t);
    await pointer(t, at(0, 0));
    await t.page.waitForSelector('.modal .ribbon', { timeout: 8000 });
    const s = await t.state();
    t.equal(s.scene, 'win', 'the results card is up');
    t.expect(s.encoreScore > 0, `the Encore bonus was still scored (${s.encoreScore})`);
    const heard = await sounds(t);
    t.equal(heard.filter((n) => n === 'win').length, 1, 'the win fanfare plays once, on the results card');
    t.expect(heard.includes('encore') && heard.indexOf('encore') < heard.indexOf('win'), 'a short Encore sting comes first');
  },
});
tests.push({
  name: 'S3-14 with the keyboard in use the toast names Esc, and Esc skips the Encore',
  viewports: ['desktop'],
  async run(t) {
    await toEncore(t, () => t.page.keyboard.press('ArrowRight'));
    t.equal(await toastText(t), 'Encore! Press Esc to skip', 'the toast names the key');
    await inEncore(t);
    await t.page.keyboard.press('Escape');
    await t.page.waitForSelector('.modal .ribbon', { timeout: 8000 });
    t.equal((await t.state()).scene, 'win', 'Esc skipped to the results card');
  },
});

// --- S5-13: the win phrase grows with the stars, and the Encore has a sting of its own ---------------------------------------
tests.push({
  name: 'S5-13 a win phrase is fuller for each star, and no richer than the cue range allows',
  viewports: ['desktop'],
  initScript: trackAudio,
  async run(t) {
    await t.waitIdle();
    await unlock(t);
    const n = {};
    for (const a of [0, 1, 2, 3]) n[a] = await cueNodes(t, 'win', a);
    t.log(`sources built: no stars ${n[0]}, 1 star ${n[1]}, 2 stars ${n[2]}, 3 stars ${n[3]}`);
    t.equal(n[0], n[1], 'a win with no star count is the plain phrase');
    t.expect(n[1] < n[2] && n[2] < n[3], 'one star, two stars, three stars: each phrase has more voices');
    t.expect((await cueNodes(t, 'encore', 0)) > 0, 'the Encore sting builds sound');
    const l = await t.game('audioList');
    t.expect(l.cues.includes('encore'), 'the sting is a listed cue');
  },
});
tests.push({
  name: 'S5-13 the win phrases and the Encore sting peak inside the gameplay-cue range',
  viewports: ['desktop'],
  async run(t) {
    // Eight draws each: the median must sit inside the range and no single draw may be more than 0.02 outside it (the 1 to 2 dB spread).
    const out = [];
    for (const [name, arg] of [['win', 1], ['win', 2], ['win', 3], ['encore', 0]]) {
      const peaks = [];
      for (let seed = 1; seed <= 8; seed++) peaks.push((await t.game('cueRender', name, arg, {}, 3, false, seed)).peak);
      peaks.sort((a, b) => a - b);
      const med = (peaks[3] + peaks[4]) / 2;
      out.push(`${name} ${arg}: ${peaks[0]}-${peaks[7]} median ${med.toFixed(3)}`);
      t.expect(med >= 0.2 && med <= 0.45, `${name} ${arg}: median peak ${med.toFixed(3)} is inside 0.2 to 0.45`);
      t.expect(peaks[0] >= 0.18 && peaks[7] <= 0.47, `${name} ${arg}: every draw (${peaks[0]} to ${peaks[7]}) is within 0.02 of the range`);
    }
    t.log(out.join('; '));
  },
});
tests.push({
  name: 'S5-13 the results card plays the win phrase for the stars won',
  viewports: ['desktop'],
  initScript: trackAudio,
  async run(t) {
    await t.waitIdle();
    await unlock(t);
    const built = {};
    for (const stars of [1, 3]) {
      await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
      await t.page.evaluate((k) => { const s = window.__game.engineState(); s.phase = 'won'; s.starsWon = k; s.movesLeft = 0; for (const g of s.goals) g.have = g.type === 'score' ? s.score : g.need; window.__game.setState(s); }, stars);
      // the music's own notes are scheduled by a timer, so the two runs are compared by what the results card adds in one synchronous step
      built[stars] = await t.page.evaluate(() => { const b = window.__node; window.__game.act('win'); return window.__node - b; });
      await t.waitIdle();
    }
    t.log(`sources built on the results card: 1 star ${built[1]}, 3 stars ${built[3]}`);
    t.expect(built[3] - built[1] >= 6, 'a three-star results card builds a fuller phrase than a one-star one');
  },
});
