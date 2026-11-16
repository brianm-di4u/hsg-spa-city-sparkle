// Council wave 4, batch B: saves, lifecycle and robustness; controls, rules and play
// (P-N03, S1-10, S1-09, S6-16, S6-13, S2-12; S5-18 is already done and S3-08 no longer applies).
// Nothing here depends on chance or on the clock: every board is seeded, every wait is for a condition, and the Encore's 700 ms beat is held
// by a stand-in for setTimeout that the test fires by hand, so "during the beat" is a state and not a race.
export const tests = [];

const BOARD = ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d']; // one swap, [1,1] with [1,0], breaks the stone and wins with moves to spare

// The Encore's wait is the only 700 ms (100 ms under reduced motion) timer the game sets. This keeps it in a list until the test fires it.
function holdBeat() {
  const real = window.setTimeout.bind(window), realClear = window.clearTimeout.bind(window);
  window.__beat = new Map(); let n = -1;
  window.setTimeout = (fn, ms, ...a) => { if (ms === 700 || ms === 100) { const id = n--; window.__beat.set(id, fn); return id; } return real(fn, ms, ...a); };
  window.clearTimeout = (id) => { if (window.__beat.has(id)) window.__beat.delete(id); else realClear(id); };
  window.__fireBeat = () => { const all = [...window.__beat.values()]; window.__beat.clear(); all.forEach((f) => f()); return all.length; };
}
const beats = (t) => t.page.evaluate(() => window.__beat.size);
const encore = (t) => t.page.evaluate(() => window.__game.getState().encore);

async function geometry(t) {
  const s = await t.state();
  const rect = await t.page.evaluate(() => { const r = document.querySelector('#stage canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const L = s.layout;
  return (x, y) => [rect.x + L.bx + (x + 0.5) * L.cell, rect.y + L.by + (y + 0.5) * L.cell];
}
const pointer = (t, p) => (t.viewport === 'mobile' ? t.tap(p) : t.page.mouse.click(...p));

// Wins with moves to spare and waits for the beat before the Encore (the timer is held, so the state stays put).
async function toBeat(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.game('act', 'board', BOARD, { moves: 10, goals: [{ type: 'stone', need: 1 }], stars: [1, 2, 3] });
  await t.waitIdle();
  t.equal((await t.game('act', 'swap', [1, 1], [1, 0])).valid, true, 'the winning swap is legal');
  await t.page.waitForFunction(() => window.__game.getState().encore === 'waiting', null, { timeout: 8000 });
}
const inEncore = (t) => t.page.waitForFunction(() => { const s = window.__game.getState(); return s.anim.playing && s.phase === 'won' && s.movesLeft === 0; }, null, { timeout: 8000 });

// The Encore plays out the leftover moves in real time; a second tap or Esc skips that, and the results card follows.
async function resultsCard(t) {
  if (t.viewport === 'mobile') await t.tap([200, 300]); else await t.page.keyboard.press('Escape');
  await t.page.waitForSelector('.modal .ribbon', { timeout: 8000 });
}

// --- P-N03: Pause and leaving the board hold or drop the Encore's beat ------------------------------------------------------------
tests.push({
  name: 'P-N03 Pause holds the beat before the Encore, and Resume brings it back and plays the Encore once',
  initScript: holdBeat,
  async run(t) {
    await toBeat(t);
    t.equal(await beats(t), 1, 'the beat is waiting');
    await t.game('scene', 'pause');
    t.equal(await encore(t), 'held', 'Pause holds it');
    t.equal(await beats(t), 0, 'its timer is cancelled while the card is open');
    t.equal(await t.page.evaluate(() => window.__fireBeat()), 0, 'nothing is left to start the Encore behind the card');
    t.equal((await t.state()).scene, 'pause', 'still on the Pause card');
    t.equal((await t.state()).anim.playing, false, 'the Encore is not playing behind the card');
    await t.page.locator('[data-act="resume"]').click();
    t.equal(await encore(t), 'waiting', 'Resume brings the beat back');
    t.equal(await beats(t), 1, 'with a timer of its own');
    await t.page.evaluate(() => window.__fireBeat());
    await resultsCard(t);
    t.equal((await t.state()).scene, 'win', 'the results card opens');
    t.equal((await t.state()).sounds.filter((n) => n === 'win').length, 1, 'the win cue plays once');
  },
});
tests.push({
  name: 'P-N03 Save and quit to the map drops the beat: no Encore, no results card over the map',
  initScript: holdBeat,
  async run(t) {
    await toBeat(t);
    await t.game('scene', 'pause');
    await t.page.locator('[data-act="map"]').click();
    await t.page.waitForFunction(() => window.__game.getState().scene === 'map', null, { timeout: 8000 });
    t.equal(await encore(t), null, 'nothing is pending');
    t.equal(await beats(t), 0, 'no timer is left');
    t.equal(await t.page.evaluate(() => window.__fireBeat()), 0, 'nothing fires');
    const s = await t.state();
    t.equal(s.scene, 'map', 'the map stays the map');
    t.equal(s.modal, false, 'no results card over it');
    t.equal(s.sounds.includes('win'), false, 'no win cue for a screen the player left');
  },
});
tests.push({
  name: 'P-N03 starting another level drops a beat that was waiting',
  initScript: holdBeat,
  async run(t) {
    await toBeat(t);
    await t.game('newGame', { level: 'w1-02', seed: 4, tips: false });
    await t.waitIdle();
    t.equal(await encore(t), null, 'nothing is pending');
    t.equal(await t.page.evaluate(() => window.__fireBeat()), 0, 'nothing fires');
    const s = await t.state();
    t.equal(s.level, 'w1-02', 'the new level is the one on screen');
    t.equal(s.modal, false, 'no results card over it');
  },
});

// --- S1-10: the beat can be skipped -----------------------------------------------------------------------------------------------
tests.push({
  name: 'S1-10 a tap on the board in the beat starts the Encore at once',
  initScript: holdBeat,
  async run(t) {
    await toBeat(t);
    const at = await geometry(t);
    await pointer(t, at(0, 0));
    await inEncore(t);
    t.equal(await beats(t), 0, 'the held timer is gone: the Encore did not wait for it');
    await resultsCard(t);
    t.equal((await t.state()).scene, 'win', 'the results card opens');
    t.equal((await t.state()).sounds.filter((n) => n === 'win').length, 1, 'the win cue plays once');
  },
});
tests.push({
  name: 'S1-10 Esc in the beat starts the Encore and does not open Pause; P still pauses',
  viewports: ['desktop'],
  initScript: holdBeat,
  async run(t) {
    await toBeat(t);
    await t.page.keyboard.press('ArrowRight'); // keyboard in use, so the toast says "Press Esc to skip"
    await t.page.keyboard.press('Escape');
    await inEncore(t);
    t.expect(!(await t.state()).modal || (await t.state()).scene !== 'pause', 'Esc did not open the Pause card');
    await resultsCard(t);
    t.equal((await t.state()).scene, 'win', 'the results card opens');
    await toBeat(t);
    await t.page.keyboard.press('p');
    t.equal((await t.state()).scene, 'pause', 'P opens Pause in the beat');
    t.equal(await encore(t), 'held', 'and holds it');
  },
});
