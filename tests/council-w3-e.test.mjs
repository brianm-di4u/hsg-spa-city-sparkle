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

// --- S1-06: an armed booster shows what it would hit, fires on release, and says when a target is no good -------------------------
const BOARD = ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d']; // 5 by 5; S3 at [1,2] takes a hammer, S1 at [4,1] a line
const STOCK = { hammer: 2, line: 2, shuffle: 1, plus5: 1 };
const GOALS = { moves: 10, boosters: STOCK, goals: [{ type: 'stone', need: 6 }] };
async function armedBoard(t) {
  await t.game('newGame', { level: 'w2-01', seed: 3, tips: false });
  await t.game('act', 'progress', {}, STOCK);
  await t.game('act', 'board', BOARD, GOALS);
  await t.waitIdle();
}
async function geometry(t) {
  const s = await t.state();
  const rect = await t.page.evaluate(() => { const r = document.querySelector('#stage canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const L = s.layout;
  const at = (x, y) => [rect.x + L.bx + (x + 0.5) * L.cell, rect.y + L.by + (y + 0.5) * L.cell];
  at.off = [rect.x + 3, rect.y + 3]; // a corner of the canvas, outside the board
  return at;
}
const aimIs = (t, want) => t.page.waitForFunction((w) => { const a = window.__game.getState().aim.slice().sort((p, q) => p - q); return a.length === w.length && a.every((v, k) => v === w[k]); }, want, { timeout: 5000 });
const arm = (t, name) => t.page.locator(`.booster[data-booster="${name}"]`).click();
const row = (y) => [0, 1, 2, 3, 4].map((x) => y * 5 + x);
const col = (x) => [0, 1, 2, 3, 4].map((y) => y * 5 + x);

tests.push({
  name: 'S1-06 the hammer, the row and the column each glow where the pointer is, and move with it',
  viewports: ['desktop'],
  async run(t) {
    await armedBoard(t);
    const at = await geometry(t);
    t.equal((await t.state()).aim.length, 0, 'nothing glows before a booster is armed');
    await arm(t, 'hammer');
    await t.page.mouse.move(...at(1, 2), { steps: 4 });
    await aimIs(t, [2 * 5 + 1]);
    await t.shot('S1-06-hammer-aim');
    await t.page.mouse.move(...at(3, 4), { steps: 4 });
    await aimIs(t, [4 * 5 + 3]);
    await arm(t, 'line'); // arming another booster replaces the first
    await t.page.mouse.move(...at(2, 1), { steps: 4 });
    await aimIs(t, row(1));
    await t.shot('S1-06-line-row-aim');
    await arm(t, 'line'); // the second press turns the row into a column
    await t.page.mouse.move(...at(4, 3), { steps: 4 });
    await aimIs(t, col(4));
    t.equal((await t.state()).boosters.line, 2, 'looking spends nothing');
    await t.page.mouse.move(...at.off, { steps: 4 });
    await aimIs(t, []);
  },
});
tests.push({
  name: 'S1-06 a booster fires when the press is let go, can be slid off to cancel, and a miss thuds and says so',
  viewports: ['desktop'],
  async run(t) {
    await armedBoard(t);
    const at = await geometry(t);
    await arm(t, 'hammer');
    const before = (await sounds(t)).filter((n) => n === 'bounce').length;
    await t.page.mouse.move(...at(1, 2), { steps: 3 });
    await t.page.mouse.down();
    await aimIs(t, [2 * 5 + 1]);
    t.equal((await t.state()).boosters.hammer, 2, 'a press alone spends nothing');
    await t.page.mouse.move(...at(4, 4), { steps: 4 }); // slide to another cell: the glow follows
    await aimIs(t, [4 * 5 + 4]);
    await t.page.mouse.move(...at.off, { steps: 4 });
    await aimIs(t, []);
    await t.page.mouse.up(); // released off the board
    const s = await t.state();
    t.equal(s.boosters.hammer, 2, 'let go off the board: nothing is spent');
    t.equal(s.armed, 'hammer', 'and the hammer stays armed');
    t.expect((await sounds(t)).filter((n) => n === 'bounce').length > before, 'the refused release thuds');
    t.expect(/Nothing there/.test(await t.page.locator('#toast').textContent()), 'and the toast says why');
    await t.page.mouse.move(...at(1, 2), { steps: 3 });
    await t.page.mouse.down(); await t.page.mouse.up(); // a plain click still works
    await t.waitIdle(8000);
    const after = await t.state();
    t.equal(after.boosters.hammer, 1, 'a click on a piece spends the hammer');
    t.equal(after.board.cells[2 * 5 + 1].stone, 2, 'and it took a layer off the stone');
    t.equal(after.armed, null, 'and puts it away');
    t.equal(after.aim.length, 0, 'the glow is gone');
  },
});
tests.push({
  name: 'S1-06 on a phone a tap fires the booster, and a touch slid off the board cancels it',
  viewports: ['mobile'],
  async run(t) {
    await armedBoard(t);
    const at = await geometry(t);
    await arm(t, 'line');
    await t.touchDrag(at(2, 1), at.off, { steps: 4 });
    let s = await t.state();
    t.equal(s.boosters.line, 2, 'a touch slid off the board spends nothing');
    t.equal(s.armed, 'line', 'the line stays armed');
    t.equal(s.aim.length, 0, 'and nothing glows');
    await t.tap(at(2, 1));
    await t.waitIdle(8000);
    s = await t.state();
    t.equal(s.boosters.line, 1, 'a tap spends the line');
    t.equal(s.board.cells[1 * 5 + 4].stone, 0, 'the row through [2,1] was cleared: the stone at its end is gone');
  },
});
tests.push({
  name: 'S1-06 with the keyboard the glow follows the cursor, and Esc puts the booster away',
  viewports: ['desktop'],
  async run(t) {
    await armedBoard(t);
    await t.page.keyboard.press('1'); // Hammer
    t.equal((await t.state()).armed, 'hammer', 'the key arms the hammer');
    await t.page.keyboard.press('ArrowRight'); // wakes the cursor on the middle piece and moves it
    const c = (await t.state()).cursor;
    await aimIs(t, [c]);
    await t.page.keyboard.press('ArrowUp');
    await aimIs(t, [c - 5]);
    await t.page.keyboard.press('Escape');
    await aimIs(t, []);
    t.equal((await t.state()).armed, null, 'Esc puts the booster away');
    await t.page.keyboard.press('2'); // Line, with the cursor already showing
    await aimIs(t, row(((c - 5) / 5) | 0));
  },
});
const sounds = (t) => t.page.evaluate(() => window.__game.getState().sounds);
tests.push({
  name: 'S1-06 the glow fits the board on a phone (a column, and a hammer on a stone)',
  viewports: ['mobile'],
  async run(t) {
    await armedBoard(t);
    const at = await geometry(t);
    await arm(t, 'line'); await arm(t, 'line'); // column
    await t.page.mouse.move(...at(1, 2), { steps: 3 });
    await aimIs(t, col(1));
    await t.shot('S1-06-line-column-aim');
    await arm(t, 'hammer');
    await t.page.mouse.move(...at(4, 1), { steps: 3 });
    await aimIs(t, [1 * 5 + 4]);
    await t.shot('S1-06-hammer-aim');
  },
});

// --- S6-09: no WebGL still plays (Canvas2D), a card that says what to turn on when nothing draws, and an Image quality setting ---
const noWebgl = () => { // a browser with hardware acceleration off: no WebGL context can be made
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...a) { return /webgl/i.test(type) ? null : get.call(this, type, ...a); };
};
const noDrawing = () => { // nothing can draw at all (and the page's test hooks are stood in for, since the game never gets as far as making them)
  HTMLCanvasElement.prototype.getContext = function () { return null; };
  Object.defineProperty(window, '__game', { get: () => ({}), set() {}, configurable: true });
};
async function playOneMove(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.game('act', 'board', ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d'], { moves: 10, goals: [{ type: 'stone', need: 6 }] });
  await t.waitIdle();
  const r = await t.game('act', 'swap', [1, 1], [1, 0]);
  t.equal(r.valid, true, 'the swap is legal and is made');
  await t.waitIdle(8000);
  t.equal((await t.state()).movesUsed, 1, 'and it was spent');
}
tests.push({
  name: 'S6-09 with WebGL turned off the game falls back to the Canvas2D renderer and plays',
  initScript: noWebgl,
  async run(t) {
    await t.waitIdle();
    t.equal((await t.state()).renderer, 'canvas', 'the board is drawn by the Canvas2D renderer');
    t.equal(await t.page.locator('#screen h2', { hasText: 'WebGL needed' }).count(), 0, 'no WebGL card is shown');
    await t.shot('S6-09-canvas-title');
    await playOneMove(t);
    await t.shot('S6-09-canvas-play');
  },
});
tests.push({
  name: 'S6-09 ?renderer=canvas asks for Canvas2D first, and with WebGL available the default is still WebGL',
  viewports: ['desktop'],
  url: 'index.html?renderer=canvas',
  async run(t) {
    await t.waitIdle();
    t.equal((await t.state()).renderer, 'canvas', 'the query asks for the canvas renderer');
    await t.page.goto(t.page.url().split('?')[0]);
    await t.page.waitForFunction(() => window.__game && window.__game.getState().renderer, null, { timeout: 15000 });
    t.equal((await t.state()).renderer, 'webgl', 'without the query a browser that has WebGL uses it');
  },
});
tests.push({
  name: 'S6-09 when nothing can draw the card says what to turn on, and has a Reload button',
  viewports: ['desktop'],
  initScript: noDrawing,
  allowConsoleErrors: true,
  async run(t) {
    await t.page.waitForSelector('#screen h2');
    const card = await t.page.locator('#screen .card').innerText();
    t.expect(/WebGL needed/.test(card), 'the card is titled WebGL needed');
    t.expect(/hardware acceleration/.test(card) && /reload/i.test(card), 'it says to turn on hardware acceleration and reload');
    t.equal(await t.page.locator('#screen .card button').count(), 1, 'and has one Reload button');
  },
});
const qualityState = (t) => t.page.evaluate(() => { const s = window.__game.getState(); return { quality: s.quality, resolution: s.resolution, steam: s.steamOn, saved: s.settings.quality }; });
tests.push({
  name: 'S6-09 Image quality: Auto draws at the screen density, Low at 1 with no ambient steam, kept across a reload',
  async run(t) {
    await t.waitIdle();
    const dpr = await t.page.evaluate(() => Math.min(window.devicePixelRatio || 1, 2));
    let q = await qualityState(t);
    t.equal(q.quality, 'auto', 'a new player starts on Auto');
    t.equal(q.resolution, dpr, `which draws at ${dpr}x`);
    t.equal(q.steam, true, 'with the ambient steam on');
    await t.game('scene', 'settings');
    await t.page.waitForSelector('[data-quality="low"]');
    t.equal(await t.page.locator('[data-quality="auto"]').getAttribute('aria-pressed'), 'true', 'Auto is shown as chosen');
    await t.shot('S6-09-settings-quality');
    await t.page.locator('[data-quality="low"]').click();
    await t.page.waitForFunction(() => window.__game.getState().resolution === 1, null, { timeout: 5000 });
    q = await qualityState(t);
    t.expect(q.quality === 'low' && q.saved === 'low' && q.steam === false, `Low is saved, draws at 1 and turns the steam off (${JSON.stringify(q)})`);
    t.equal((await t.state()).settings.steam, true, 'the Ambient steam switch itself is left as the player had it');
    await t.reload();
    q = await qualityState(t);
    t.expect(q.quality === 'low' && q.resolution === 1 && q.steam === false, 'Low is still on after a reload, from the first frame');
    await playOneMove(t);
    await t.game('scene', 'settings');
    await t.page.locator('[data-quality="auto"]').click();
    await t.page.waitForFunction((d) => window.__game.getState().resolution === d, dpr, { timeout: 5000 });
    t.equal((await qualityState(t)).steam, true, 'back on Auto the steam is back');
  },
});
tests.push({
  name: 'S6-09 a damaged quality value in a save draws at Auto, and an old save has Auto',
  viewports: ['desktop'],
  async run(t) {
    const KEY = 'spa-city-sparkle:v1';
    for (const saved of [{ volume: 0.5 }, { quality: 'ultra' }, { quality: 7 }, { quality: null }]) {
      await t.page.evaluate(([k, st]) => localStorage.setItem(k, JSON.stringify({ v: 1, settings: st })), [KEY, saved]);
      await t.reload();
      const q = await qualityState(t);
      t.expect(q.quality === 'auto' && q.steam === true, `${JSON.stringify(saved)} draws at Auto (${JSON.stringify(q)})`);
    }
  },
});

// --- S4-17: a Cascade throws spray, a Hot Stone breathes steam --------------------------------------------------------------
// The extra sprites drawn at one frozen moment of a move (the game counts the droplets and steam puffs it draws), at Full motion and then at
// Reduced, which draws none of them. The counts are the same every run: they come from the number of cells and a fixed hash, not from chance.
const CASCADE = ['aH a c b e', 'd e a e c', 'b d b d a', 'c a e c b', 'e b d a c'];
const STONE = ['c d e f c', 'd e f c d', 'e f aB a c', 'f c d e a', 'c d e f c'];
async function fxAt(t, type, n, frac) {
  await t.game('act', 'replay');
  const ms = await t.game('act', 'beatAt', type, n);
  t.expect(ms != null, `the move has a ${type} ${n} beat`);
  await t.game('act', 'clock', ms + frac);
  await t.waitFrames(3);
  return (await t.state()).fx;
}
async function fxOnce(t, board, swap, type, n, frac, shotName) {
  await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
  await t.game('act', 'board', board);
  await t.waitIdle();
  t.equal((await t.game('act', 'swap', ...swap)).valid, true, 'the swap makes a special fire');
  await t.waitIdle(8000);
  const r = await fxAt(t, type, n, frac);
  if (shotName) await t.shot(shotName, { wait: false });
  await t.game('act', 'clock', null);
  await t.waitIdle(8000);
  return r;
}
async function fxPair(t, board, swap, type, n, frac, shotName) {
  t.equal((await t.state()).reduced, false, 'motion is full');
  const full = await fxOnce(t, board, swap, type, n, frac, shotName);
  await t.page.emulateMedia({ reducedMotion: 'reduce' });
  await t.reload();
  t.equal((await t.state()).reduced, true, 'and now reduced');
  const calm = await fxOnce(t, board, swap, type, n, frac);
  return { full, calm };
}
tests.push({
  name: 'S4-17 a Cascade throws spray off its sheet of water, and none of it under reduced motion',
  async run(t) {
    const r = await fxPair(t, CASCADE, [[2, 1], [2, 0]], 'fire', 'h', 70, 'S4-17-cascade-fire');
    t.equal(r.full.spray, 14, 'Full motion throws fourteen droplets');
    t.equal(r.calm.spray, 0, 'Reduced motion throws none');
  },
});
tests.push({
  name: 'S4-17 a Hot Stone breathes steam and a heat ripple, and none of it under reduced motion',
  async run(t) {
    const r = await fxPair(t, STONE, [[4, 3], [4, 2]], 'fire', 'b', 110, 'S4-17-stone-fire');
    t.equal(r.full.steam, 9, 'Full motion lets off nine puffs of steam');
    t.equal(r.calm.steam, 0, 'Reduced motion lets off none');
  },
});
