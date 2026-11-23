// Council wave 3, batch B: saves, lifecycle and robustness; controls, rules and play
// (S4-11, S5-16, S1-05, S2-16, S3-04, S1-03, S2-19, S2-21).
// Nothing here depends on chance: every board is seeded and every wait is for a condition.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { schedule, FAILED_SWAP_MS } from '../src/js/view/player.js';
import { RELIEF_AFTER, RELIEF_MOVES } from '../src/js/ui/save.js';

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

// --- S1-05: a swap that makes no match is quick to come back -----------------------------------------------------------
tests.push({
  name: 'S1-05 a failed swap takes two short beats; a swap that matches keeps its full beat',
  node: true,
  run() {
    const failed = schedule({ events: [{ t: 'swap', beat: 0 }, { t: 'swapBack', beat: 1 }] });
    assert.deepEqual(failed.beats.map((b) => b.dur), [FAILED_SWAP_MS, FAILED_SWAP_MS], 'both halves are short');
    assert.equal(FAILED_SWAP_MS, 110);
    const good = schedule({ events: [{ t: 'swap', beat: 0 }, { t: 'match', beat: 1, cells: [1, 2, 3] }] });
    assert.equal(good.beats[0].dur, 190, 'a swap that goes on to match is still 190 ms');
    const reduced = schedule({ events: [{ t: 'swap', beat: 0 }, { t: 'swapBack', beat: 1 }] }, { reduced: true });
    assert.equal(reduced.total, Math.round(FAILED_SWAP_MS * 0.35) * 2, 'reduced motion still scales it');
  },
});
tests.push({
  name: 'S1-05 in the game a swap with no match plays in 220 ms, and a matching swap is unchanged',
  async run(t) {
    await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
    await t.waitIdle();
    await t.game('act', 'clock', 0);
    const s = await t.state();
    const w = s.board.w, legal = new Set((await t.game('act', 'legal')).map(([a, b]) => `${a}-${b}`));
    let bad = null;
    for (let i = 0; i < s.board.cells.length && !bad; i++) {
      const x = i % w, j = i + 1;
      if (x < w - 1 && s.board.cells[i] && s.board.cells[j] && !legal.has(`${[x, (i / w) | 0]}-${[x + 1, (i / w) | 0]}`) && !legal.has(`${[x + 1, (i / w) | 0]}-${[x, (i / w) | 0]}`)) bad = [[x, (i / w) | 0], [x + 1, (i / w) | 0]];
    }
    t.expect(bad, 'the seeded board has a swap that makes no match');
    const r = await t.game('act', 'swap', ...bad);
    t.equal(r.reason, 'nomatch', 'the engine refuses it');
    t.equal(await t.game('act', 'total'), 220, 'out and back take 110 ms each');
    await t.game('act', 'clock', null);
    await t.waitIdle(8000);
    t.equal((await t.state()).movesUsed, 0, 'it costs no move');
    await t.game('act', 'clock', 0);
    const ok = await t.game('act', 'legal');
    await t.game('act', 'swap', ...ok[0]);
    t.expect(await t.game('act', 'total') > 400, 'a matching swap still has its full swap, match and fall');
    t.equal(await t.game('act', 'beatAt', 'swap'), 95, 'and its swap beat is the old 190 ms (mid-point 95)');
    await t.game('act', 'clock', null);
  },
});

// --- S1-03: a piece follows the finger, and the slide carries on from where it was pulled to -----------------------------
// Pointer input is real: the mouse on a desktop, CDP touch on the phone. The finger is held (holdEndMs) while the state is read.
async function board(t) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.waitIdle();
  const s = await t.state();
  const rect = await t.page.evaluate(() => { const r = document.querySelector('#stage canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const L = s.layout;
  const at = (i, fx = 0, fy = 0) => [rect.x + L.bx + ((i % s.board.w) + 0.5 + fx) * L.cell, rect.y + L.by + (((i / s.board.w) | 0) + 0.5 + fy) * L.cell];
  return { s, L, at, rect };
}
async function pull(t, from, to, holdMs, during) {
  const run = t.viewport === 'mobile'
    ? t.touchDrag(from, to, { steps: 6, holdEndMs: holdMs })
    : (async () => { await t.page.mouse.move(...from); await t.page.mouse.down(); await t.page.mouse.move(...to, { steps: 6 }); await t.page.waitForTimeout(holdMs); await t.page.mouse.up(); })();
  // If the check fails while the finger is still down, let the drag settle before the page closes, so it cannot
  // reject later as an unhandled error that stops the whole run.
  try { await during(); } catch (e) { await run.catch(() => {}); throw e; }
  await run;
}
const waitDrag = (t, pred) => t.page.waitForFunction(`(${pred})(window.__game.getState().drag)`, null, { timeout: 5000 });
tests.push({
  name: 'S1-03 a pressed piece follows the finger and its neighbour gives way; letting go springs both back and nothing is played',
  async run(t) {
    const { s, L, at } = await board(t);
    // a piece in the middle of the board with a swappable neighbour to its right, and one that is not a legal swap
    const legal = new Set((await t.game('act', 'legal')).map(([a, b]) => `${a}-${b}`));
    const w = s.board.w, i = ((w >> 1) + w * (s.board.h >> 1)), j = i + 1;
    const id = s.board.cells[i].id, idj = s.board.cells[j].id;
    const rest = await t.game('act', 'sprite', id), restJ = await t.game('act', 'sprite', idj);
    const dist = L.cell * 0.18; // short of the 0.3 cell that makes the swap
    let seen;
    await pull(t, at(i), [at(i)[0] + dist, at(i)[1] + 1], 1200, async () => {
      await waitDrag(t, `(d) => d && !d.released && d.dx > ${dist * 0.97}`);
      await t.page.waitForFunction(({ id, x, dist }) => { const p = window.__game.act('sprite', id); return p && p.x > x + dist * 0.9; }, { id, x: rest.x, dist }, { timeout: 5000 });
      seen = { drag: (await t.state()).drag, a: await t.game('act', 'sprite', id), b: await t.game('act', 'sprite', idj) };
      await t.shot('S1-03-drag-follow');
    });
    t.equal(seen.drag.i, i, 'the pressed piece is the one being pulled');
    t.equal(seen.drag.j, j, 'and its neighbour on the pull side is the one giving way');
    t.expect(Math.abs(seen.drag.dx - dist) < L.cell * 0.06, `it is pulled ${seen.drag.dx.toFixed(1)} px of ${dist.toFixed(1)}`);
    t.expect(Math.abs(seen.a.x - rest.x - seen.drag.dx) < 1.5, 'the piece is drawn that far along');
    t.expect(Math.abs(restJ.x - seen.b.x - seen.drag.dx) < 1.5, 'the neighbour is drawn the same distance the other way');
    t.expect(seen.a.scale > rest.scale, 'the held piece is a little larger');
    t.equal((await t.state()).movesUsed, 0, 'no move was made');
    await t.page.waitForFunction(() => window.__game.getState().drag === null, null, { timeout: 5000 });
    const back = await t.game('act', 'sprite', id), backJ = await t.game('act', 'sprite', idj);
    t.expect(Math.abs(back.x - rest.x) < 1 && Math.abs(backJ.x - restJ.x) < 1, 'both are back at rest once the finger is up');
    t.equal((await t.state()).movesUsed, 0, 'still no move');
  },
});
tests.push({
  name: 'S1-03 a pull toward the edge or a hole only gives a little',
  async run(t) {
    const { s, L, at } = await board(t);
    const i = s.board.cells.findIndex((c, k) => c && k % s.board.w === 0); // on the left edge, so a pull to the left has no neighbour
    t.expect(i >= 0, 'there is a cell on the left edge');
    let seen;
    await pull(t, at(i), [at(i)[0] - L.cell * 0.25, at(i)[1] + 1], 800, async () => {
      await waitDrag(t, (d) => d && d.dx < 0);
      seen = (await t.state()).drag;
    });
    t.equal(seen.j, -1, 'nothing gives way');
    t.expect(Math.abs(seen.dx) <= L.cell * 0.12 + 0.01, `the pull is held to ${Math.abs(seen.dx).toFixed(1)} px of ${(L.cell * 0.12).toFixed(1)}`);
  },
});
tests.push({
  name: 'S1-03 a pull past the threshold swaps, and the slide carries on from where the piece had been pulled to',
  async run(t) {
    const { s, L, at } = await board(t);
    const [[a, b]] = (await t.game('act', 'legal')).map(([p, q]) => [p[0] + p[1] * s.board.w, q[0] + q[1] * s.board.w]);
    const ia = s.board.cells[a].id;
    const ax = a % s.board.w, bx = b % s.board.w, ay = (a / s.board.w) | 0, by = (b / s.board.w) | 0;
    const fx = (bx - ax) * 0.36, fy = (by - ay) * 0.36; // just over the 0.3 cell threshold
    const rest = await t.game('act', 'sprite', ia);
    await t.game('act', 'clock', 0);   // the move's animation starts frozen at its first instant
    const [sx, sy] = at(a), [ex, ey] = at(a, fx, fy);
    if (t.viewport === 'mobile') await t.touchDrag([sx, sy], [ex, ey], { steps: 6 });
    else { await t.page.mouse.move(sx, sy); await t.page.mouse.down(); await t.page.mouse.move(ex, ey, { steps: 6 }); await t.page.mouse.up(); }
    await t.page.waitForFunction(() => window.__game.getState().movesUsed === 1, null, { timeout: 5000 });
    const start = await t.game('act', 'sprite', ia);
    const moved = Math.hypot(start.x - rest.x, start.y - rest.y);
    t.expect(moved > L.cell * 0.25 && moved < L.cell * 0.5, `the swap starts ${moved.toFixed(1)} px along, not from rest (a cell is ${L.cell.toFixed(1)} px)`);
    t.equal((await t.state()).drag, null, 'the pull is over');
    await t.game('act', 'clock', null);
    await t.waitIdle(8000);
    t.equal((await t.state()).movesUsed, 1, 'one move was made');
  },
});
tests.push({
  name: 'S1-03 a tap still selects a piece, and a swap by two taps still works',
  async run(t) {
    const { s, at } = await board(t);
    const [[a, b]] = (await t.game('act', 'legal')).map(([p, q]) => [p[0] + p[1] * s.board.w, q[0] + q[1] * s.board.w]);
    const tap = (p) => (t.viewport === 'mobile' ? t.tap(p) : t.page.mouse.click(...p));
    await tap(at(a));
    await t.page.waitForFunction((i) => window.__game.getState().selected === i, a, { timeout: 5000 });
    t.equal((await t.state()).drag, null, 'a tap leaves no pull behind');
    await tap(at(b));
    await t.page.waitForFunction(() => window.__game.getState().movesUsed === 1, null, { timeout: 5000 });
    await t.waitIdle(8000);
  },
});

// --- S2-19: a level lost three times without a win starts with a few extra moves ---------------------------------------
const record = (tries, wins = 0) => ({ stats: { 'w1-03': { tries, wins, bestMoves: 0 } } });
async function startFor(t, id, patch) {
  await t.game('act', 'save', patch);
  await t.game('scene', 'intro', id);
  await t.waitIdle();
  const intro = await t.page.locator('#modal').innerText();
  await t.game('newGame', { level: id, seed: 3, tips: false });
  await t.waitIdle();
  return { intro, s: await t.state() };
}
tests.push({
  name: 'S2-19 after three losses of a level, the card says Della lends a hand and the level starts with extra moves',
  async run(t) {
    const base = (await startFor(t, 'w1-03', record(0))).s.movesLeft;
    for (const tries of [1, 2]) {
      const r = await startFor(t, 'w1-03', record(tries));
      t.equal(r.s.movesLeft, base, `${tries} losses: no relief yet`);
      t.expect(!/lends you a hand/.test(r.intro), `${tries} losses: the card does not mention it`);
    }
    const r = await startFor(t, 'w1-03', record(RELIEF_AFTER));
    t.equal(r.s.movesLeft, base + RELIEF_MOVES, `${RELIEF_AFTER} losses: ${RELIEF_MOVES} extra moves`);
    t.expect(/Della lends you a hand/.test(r.intro) && r.intro.includes(`${RELIEF_MOVES} extra moves`), 'the intro card says so');
    t.equal((await t.state()).levelStats['w1-03'].tries, RELIEF_AFTER, 'the record of tries is untouched by the start');
    await t.game('scene', 'intro', 'w1-03');
    await t.waitIdle();
    await t.shot('S2-19-relief-card');
  },
});
tests.push({
  name: 'S2-19 a level already cleared gets no relief, and neither does the Daily Challenge',
  async run(t) {
    const cleared = await startFor(t, 'w1-03', { ...record(5, 1), progress: { 'w1-03': { stars: 1, best: 1 } } });
    const plain = await startFor(t, 'w1-03', { ...record(0), progress: {} });
    t.equal(cleared.s.movesLeft, plain.s.movesLeft, 'a cleared level has its own moves');
    t.expect(!/lends you a hand/.test(cleared.intro), 'and no card line');
    const day = await t.game('dailyPick', '2026-11-14');
    const lost = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`w${Math.floor(i / 10) + 1}-${String((i % 10) + 1).padStart(2, '0')}`, { tries: 9, wins: 0, bestMoves: 0 }]));
    await t.game('act', 'save', { stats: lost, progress: {} }); // every level has been lost nine times, so any level the Daily picks would qualify
    await t.game('dailyDate', '2026-11-14');
    await t.game('scene', 'soak');
    await t.waitIdle();
    t.equal((await t.state()).movesLeft, day.moves, 'the Daily Challenge starts with exactly its own moves');
  },
});
tests.push({
  name: 'S2-19 a resumed level keeps the moves it had: relief is given once, at the start',
  async run(t) {
    await t.game('act', 'save', record(RELIEF_AFTER));
    await t.game('newGame', { level: 'w1-03', seed: 3, tips: false });
    await t.waitIdle();
    const start = (await t.state()).movesLeft;
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    await t.waitIdle(8000);
    t.equal((await t.state()).movesLeft, start - 1, 'one move used');
    await t.reload();
    await t.page.locator('[data-act="continue"]').click();
    await t.waitIdle();
    t.equal((await t.state()).movesLeft, start - 1, 'Continue shows the same moves left, with no second gift');
  },
});

// --- S2-21: the Scrapbook lists every lore card, found or not --------------------------------------------------------------
const LORE = JSON.parse(fs.readFileSync(new URL('../data/lore.json', import.meta.url), 'utf8'));
const cardsOf = (w) => LORE.filter((c) => c.world === w);
tests.push({
  name: 'S2-21 the title opens a Scrapbook: a fresh profile has 0 of 60 and each blank names the stop that holds its card',
  async run(t) {
    await t.game('scene', 'title');
    await t.waitIdle();
    await t.checkLayout();
    await t.shot('S2-21-title-menu');
    await t.page.locator('.menu [data-act="scrapbook"]').click();
    t.equal(await t.page.locator('#modal h2').innerText(), 'Scrapbook', 'the Scrapbook opens');
    const text = await t.page.locator('#modal').innerText();
    t.expect(text.includes('0 of 60 cards found'), 'it counts the cards');
    t.equal(await t.page.locator('#modal .tab').count(), 6, 'one tab for each world');
    t.equal(await t.page.locator('#modal .scrap .lore').count(), 10, 'ten slots for the world');
    t.equal(await t.page.locator('#modal .scrap .lore.blank').count(), 10, 'all of them blank');
    t.expect(text.includes('Win stop 1-1, Magnolia Promenade, to find it.'), 'a blank names its stop');
    t.expect(!cardsOf(1).some((c) => text.includes(c.text)), 'a blank does not show the card');
    const inView = await t.page.evaluate(() => ['#modal h2', '#modal [data-act="close"]'].map((q) => { const r = document.querySelector(q).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }));
    t.equal(inView.join(), 'true,true', 'the title and the Close button are both on screen without scrolling the card');
    await t.shot('S2-21-scrapbook-empty');
    await t.page.keyboard.press('Escape');
    await t.waitForStable();
    t.equal((await t.state()).scene, 'title', 'Esc closes it and returns to the title');
  },
});
tests.push({
  name: 'S2-21 found cards can be re-read with their source, by world, and the counts add up',
  async run(t) {
    const got = [cardsOf(1)[0], cardsOf(1)[3], cardsOf(3)[1]];
    await t.game('act', 'save', { lore: got.map((c) => c.id) });
    await t.game('scene', 'scrapbook');
    await t.waitIdle();
    let text = await t.page.locator('#modal').innerText();
    t.expect(text.includes('3 of 60 cards found'), 'three found');
    t.equal(await t.page.locator('#modal .scrap .lore:not(.blank)').count(), 2, 'it opens on the first world that has cards: two found');
    for (const c of [got[0], got[1]]) t.expect(text.includes(c.title) && text.includes(c.text) && text.includes(`Source: ${c.source}`), `"${c.title}" is there in full, with its source`);
    t.equal(await t.page.locator('#modal .tab[aria-selected="true"]').getAttribute('data-tab'), '1', 'world 1 is selected');
    t.equal(await t.page.locator('#modal .tab[data-tab="1"]').innerText(), '1 · 2/10', 'the tab counts its cards');
    await t.page.locator('#modal .tab[data-tab="3"]').click();
    text = await t.page.locator('#modal').innerText();
    t.expect(text.includes(got[2].title) && text.includes(got[2].text), 'world 3 shows its card');
    t.equal(await t.page.locator('#modal .scrap .lore:not(.blank)').count(), 1, 'and only the one');
    t.equal(await t.page.locator('#modal .tab[aria-selected="true"]').getAttribute('data-tab'), '3', 'the tab moved');
    t.equal(await t.page.locator('#modal .tab[data-tab="3"]').evaluate((e) => document.activeElement === e), true, 'focus stays on the tab for the keyboard');
    await t.checkLayout();
    await t.shot('S2-21-scrapbook-found');
    await t.page.locator('#modal [data-act="close"]').click();
    t.equal((await t.state()).scene, 'title', 'Close returns to the title');
  },
});
tests.push({
  name: 'S2-21 winning a level puts its card in the Scrapbook, and the card is the one the results card showed',
  async run(t) {
    await t.game('newGame', { level: 'w1-02', seed: 3, tips: false });
    await t.waitIdle();
    await t.game('act', 'win');
    await t.waitIdle();
    const shown = await t.page.locator('#modal .lore h4').innerText();
    t.equal((await t.state()).lore.length, 1, 'the save holds one card');
    await t.game('scene', 'scrapbook');
    await t.waitIdle();
    t.equal(await t.page.locator('#modal .scrap .lore:not(.blank) h4').innerText(), shown, 'the Scrapbook shows the same card');
    t.expect((await t.page.locator('#modal').innerText()).includes('1 of 60 cards found'), 'and counts it');
    await t.reload();
    await t.game('scene', 'scrapbook');
    t.expect((await t.page.locator('#modal').innerText()).includes('1 of 60 cards found'), 'it is still there after a reload');
  },
});
