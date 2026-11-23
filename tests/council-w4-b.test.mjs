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

// --- S6-16: a right or middle click is not a press, and the browser menu does not open over the board -------------------------------
tests.push({
  name: 'S6-16 a right or middle click on a piece selects nothing and the context menu is blocked; the left button still selects',
  viewports: ['desktop'],
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.waitIdle();
    const at = await geometry(t);
    const [x, y] = at(2, 2);
    await t.page.mouse.click(x, y, { button: 'right' });
    t.equal((await t.state()).selected, -1, 'a right click selects nothing');
    await t.page.mouse.click(x, y, { button: 'middle' });
    t.equal((await t.state()).selected, -1, 'a middle click selects nothing');
    const prevented = await t.page.evaluate(() => { const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.querySelector('#stage canvas').dispatchEvent(e); return e.defaultPrevented; });
    t.equal(prevented, true, 'the context menu is blocked over the board');
    await t.page.mouse.click(x, y);
    t.expect((await t.state()).selected >= 0, 'the left button still selects a piece');
  },
});

// --- S6-13: dragging a volume slider does not write the save on every step ------------------------------------------------------------
tests.push({
  name: 'S6-13 a drag along a volume slider moves the level without a write; letting go writes the save once and it is kept',
  async run(t) {
    await t.game('scene', 'settings');
    await t.page.waitForSelector('#vol');
    await t.page.mouse.click(5, 5); // the first touch starts the audio
    await t.page.waitForFunction(() => window.__game.audioState().master !== null, null, { timeout: 5000 });
    for (const [id, key] of [['vol', 'volume'], ['vol-music', 'musicVolume'], ['vol-sfx', 'sfxVolume']]) {
      const out = await t.page.evaluate(([sel, k]) => {
        const real = Storage.prototype.setItem; let writes = 0;
        Storage.prototype.setItem = function (...a) { writes++; return real.apply(this, a); };
        const el = document.querySelector(sel), seen = [];
        try {
          for (let v = 0.9; v >= 0.1; v -= 0.1) { el.value = String(v.toFixed(2)); el.dispatchEvent(new Event('input', { bubbles: true })); seen.push(window.__game.audioState()); }
          const during = writes, saved = window.__game.getState().settings[k];
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return { during, afterRelease: writes, saved, savedAfter: window.__game.getState().settings[k], seen, last: el.value };
        } finally { Storage.prototype.setItem = real; }
      }, ['#' + id, key]);
      t.equal(out.during, 0, `${key}: nine steps of a drag wrote nothing`);
      t.expect(out.saved !== +out.last, `${key}: the save still holds the old value during the drag`);
      t.expect(out.afterRelease >= 1 && out.afterRelease <= 2, `${key}: letting go writes (${out.afterRelease} writes for the settings)`);
      t.equal(out.savedAfter, +out.last, `${key}: and the value is saved`);
      if (key === 'volume') t.expect(new Set(out.seen.map((a) => a.master)).size > 5, 'the master level followed every step of the drag');
    }
    await t.reload();
    const s = (await t.state()).settings;
    t.expect(s.volume === 0.1 && s.musicVolume === 0.1 && s.sfxVolume === 0.1, 'the values are kept across a reload');
  },
});

// --- S2-12: the special pieces say "swap" like the rest of Help ---------------------------------------------------------------------
tests.push({
  name: 'S2-12 Help and the Cascade and Hot Stone tips say to swap a special with a neighbour, and no help text says swipe',
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.waitIdle();
    for (const kind of ['cascade', 'stone']) {
      await t.game('act', 'tip', kind);
      const text = await t.page.locator('#tip').innerText();
      t.expect(/Swap it with a neighbour/.test(text) && !/wipe/.test(text), `the ${kind} tip says swap (${text.replace(/\n/g, ' ')})`);
      t.expect(await t.page.evaluate(() => { const r = document.querySelector('#tip').getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight; }), `the ${kind} tip sits inside the screen`);
      await t.page.locator('#tip [data-act="ok"]').click();
    }
    await t.game('scene', 'help');
    await t.page.locator('#modal [role="tab"]', { hasText: 'Specials' }).click();
    const panel = await t.page.locator('#modal [role="tabpanel"]').innerText();
    t.equal((panel.match(/Swap it with a neighbour/g) || []).length, 2, 'both the Cascade and the Hot Stone line say swap');
    t.expect(!/wipe/.test(panel), 'the Specials tab no longer says swipe');
    t.expect(await t.page.evaluate(() => { const c = document.querySelector('#modal .card'); return c.scrollWidth <= c.clientWidth; }), 'Help does not scroll sideways');
    await t.shot('S2-12-help-specials');
    await t.page.locator('#modal [role="tab"]', { hasText: 'Controls' }).click();
    t.expect(!/wipe/.test(await t.page.locator('#modal [role="tabpanel"]').innerText()), 'nor does Controls');
  },
});

// --- S1-09: a gamepad presses the keys the game already has ---------------------------------------------------------------------------
// No controller was available: a stand-in pad is given to navigator.getGamepads and the test moves its buttons and stick. This proves the mapping and the
// polling; it does not prove a real controller (a real one needs trying by hand: D-pad and left stick, A, B, Start).
function fakePad() {
  const pad = { connected: true, id: 'test pad', index: 0, mapping: 'standard', buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
  window.__pad = pad;
  navigator.getGamepads = () => [pad];
}
const BTN = { a: 0, b: 1, start: 9, up: 12, down: 13, left: 14, right: 15 };
const connect = (t) => t.page.evaluate(() => window.dispatchEvent(new Event('gamepadconnected')));
// Holds one control until the game has answered it (the cursor, the pick, the scene, the phase or the focus changes; at most six frames), then lets go at once. A press is acted on at the
// first poll and a held direction repeats after 380 ms, so the control must not stay down for a fixed number of frames: on a loaded machine two frames can be longer than that and the
// stick repeated (the test then read the cursor one piece too far left). A slider's value counts as an answer too: without it a press on the
// Volume slider was held all six frames, which behind the Settings card (about 115 ms a frame in software GL) passed 380 ms and stepped twice.
const press = (t, what) => t.page.evaluate(async ([w, i]) => {
  const frame = () => new Promise((r) => requestAnimationFrame(r)), p = window.__pad;
  const look = () => { const s = window.__game.getState(), a = document.activeElement; return JSON.stringify([s.cursor, s.selected, s.scene, s.phase, s.movesUsed, a && (a.dataset.act || a.id || a.textContent.slice(0, 20)), a && a.type === 'range' ? a.value : null]); };
  const before = look();
  if (w === 'stickL') p.axes[0] = -1; else if (w === 'stickD') p.axes[1] = 1; else p.buttons[i].pressed = true;
  for (let n = 0; n < 6; n++) { await frame(); if (look() !== before) break; }
  p.axes[0] = 0; p.axes[1] = 0; if (i != null) p.buttons[i].pressed = false;
  await frame();
}, [what, BTN[what] ?? null]);
const focused = (t) => t.page.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.act || a.id || a.textContent.trim().slice(0, 20)) : null; });

tests.push({
  name: 'S1-09 the pad plays the board through the keys: D-pad and stick move the cursor, A picks, a direction swaps, B cancels',
  viewports: ['desktop'],
  initScript: fakePad,
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.game('act', 'board', BOARD, { moves: 10, goals: [{ type: 'stone', need: 1 }], stars: [1, 2, 3] });
    await t.waitIdle();
    await connect(t);
    await press(t, 'left'); // the first press wakes the cursor on the centre piece and moves it left: [1,2]
    let s = await t.state();
    t.equal(s.cursor, 2 * 5 + 1, 'D-pad left moved the cursor from the centre to [1,2]');
    await press(t, 'up');
    t.equal((await t.state()).cursor, 1 * 5 + 1, 'D-pad up moved it to [1,1]');
    await press(t, 'a');
    t.equal((await t.state()).selected, 1 * 5 + 1, 'A picked the piece, as Enter does');
    await press(t, 'b');
    t.equal((await t.state()).selected, -1, 'B put it down, as Esc does');
    t.equal((await t.state()).scene, 'game', 'and did not open Pause');
    await press(t, 'a');
    await press(t, 'up');
    s = await t.state();
    t.equal(s.movesUsed, 1, 'a direction after A swapped the piece: one move used');
    await t.page.waitForFunction(() => window.__game.getState().encore !== null || window.__game.getState().phase === 'won', null, { timeout: 8000 });
    t.expect(['encore', 'won'].includes((await t.state()).phase) || (await t.state()).encore !== null, 'the winning swap won the level');
  },
});
tests.push({
  name: 'S1-09 the left stick moves the cursor like the D-pad, and Start pauses and resumes',
  viewports: ['desktop'],
  initScript: fakePad,
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.waitIdle();
    await connect(t);
    const w = (await t.state()).board.w;
    await press(t, 'stickL');
    const c1 = (await t.state()).cursor;
    t.expect(c1 >= 0 && c1 % w === (w >> 1) - 1, `the stick pushed left moved the cursor one piece left of the centre column (${c1})`);
    await press(t, 'stickD');
    t.equal((await t.state()).cursor, c1 + w, 'the stick pushed down moved it one row down');
    await press(t, 'start');
    t.equal((await t.state()).scene, 'pause', 'Start opened the Pause card');
    await press(t, 'start');
    t.equal((await t.state()).scene, 'game', 'Start again resumed');
  },
});
tests.push({
  name: 'S1-09 on a card the pad moves focus, A presses the focused button and B backs out; a slider takes left and right',
  viewports: ['desktop'],
  initScript: fakePad,
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.waitIdle();
    await connect(t);
    await press(t, 'start');
    await t.page.waitForSelector('[data-act="resume"]');
    await press(t, 'down');
    const first = await focused(t);
    await press(t, 'down');
    t.expect((await focused(t)) !== first, `D-pad down moved focus (${first} then ${await focused(t)})`);
    await press(t, 'up'); await press(t, 'up');
    t.equal(await focused(t), 'resume', 'up and wrap-around reach Resume');
    await press(t, 'b');
    t.equal((await t.state()).scene, 'game', 'B resumed, as Esc does');
    await press(t, 'start');
    await t.page.waitForSelector('[data-act="settings"]');
    await t.page.focus('[data-act="settings"]');
    await press(t, 'a');
    await t.page.waitForSelector('#vol');
    await t.page.focus('#vol');
    const before = (await t.state()).settings.volume;
    await press(t, 'left');
    t.expect(Math.abs((await t.state()).settings.volume - (before - 0.05)) < 1e-6, `left on the Volume slider stepped it down (${before} to ${(await t.state()).settings.volume})`);
    await t.shot('S1-09-pad-settings');
  },
});
tests.push({
  name: 'S1-09 on the title the pad moves focus between the buttons and A presses the focused one',
  viewports: ['desktop'],
  initScript: fakePad,
  async run(t) {
    t.equal((await t.state()).scene, 'title', 'the game starts on the title');
    await connect(t);
    t.equal(await focused(t), 'play', 'Play has focus, as it has for the keyboard');
    await press(t, 'down');
    t.equal(await focused(t), 'daily', 'D-pad down moved focus to the next button');
    await press(t, 'up');
    t.equal(await focused(t), 'play', 'up moved it back');
    await press(t, 'a');
    await t.page.waitForFunction(() => window.__game.getState().scene === 'map', null, { timeout: 8000 });
    t.equal((await t.state()).scene, 'map', 'A pressed Play and the map opened');
    await t.shot('S1-09-pad-map');
  },
});
tests.push({
  name: 'S1-09 without a pad the game polls nothing and Help lists the pad',
  async run(t) {
    await t.page.evaluate(() => { window.__frames = 0; });
    const polled = await t.page.evaluate(() => { let calls = 0; const real = navigator.getGamepads.bind(navigator); navigator.getGamepads = () => { calls++; return real(); }; return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(calls))))); });
    t.equal(polled, 0, 'no pad connected: getGamepads is not polled frame by frame');
    await t.game('scene', 'help');
    await t.page.locator('#modal [role="tab"]', { hasText: 'Controls' }).click();
    t.expect(/Gamepad: the D-pad or left stick moves, A picks, B cancels or skips, Start pauses\./.test(await t.page.locator('#modal [role="tabpanel"]').innerText()), 'Controls names the pad');
    t.expect(await t.page.evaluate(() => { const c = document.querySelector('#modal .card'); return c.scrollWidth <= c.clientWidth; }), 'Help does not scroll sideways');
    await t.shot('S1-09-help-controls');
  },
});
