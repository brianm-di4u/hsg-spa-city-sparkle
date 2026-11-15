// Council wave 3, batch D: feedback, teaching and help; sound
// (S1-12, S1-04, S1-08, S1-02, S5-03, S5-04, S5-09, CL-01; S5-07 is already done, S4-04 is the finale).
// Nothing here depends on chance: every board is seeded, every wait is for a condition, and the sound checks count what a cue
// builds or render it offline with a fixed seed.
export const tests = [];

const BOARD = ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d']; // one swap, [1,1] with [1,0], breaks the stone and wins with moves to spare
const NEVER = { moves: 40, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] };

// Real pointer input: the mouse on a desktop, CDP touch on the phone.
async function geometry(t) {
  const s = await t.state();
  const rect = await t.page.evaluate(() => { const r = document.querySelector('#stage canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const L = s.layout;
  return (x, y) => [rect.x + L.bx + (x + 0.5) * L.cell, rect.y + L.by + (y + 0.5) * L.cell];
}
const pointer = (t, p) => (t.viewport === 'mobile' ? t.tap(p) : t.page.mouse.click(...p));
const sounds = (t) => t.page.evaluate(() => window.__game.getState().sounds);
async function board(t, rows = BOARD, opts = NEVER) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.game('act', 'board', rows, opts);
  await t.waitIdle();
}

// --- S1-12: a picked-up piece shows which neighbours it can trade with -------------------------------------------------------
const legalAround = async (t, x, y) => {
  const s = await t.state(), w = s.board.w, i = y * w + x;
  const pairs = await t.game('act', 'legal');
  return pairs.map(([a, b]) => [a[1] * w + a[0], b[1] * w + b[0]]).flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : [])).sort((p, q) => p - q);
};
const marked = (t, want) => t.page.waitForFunction((w) => { const m = window.__game.getState().legal.slice().sort((p, q) => p - q); return m.length === w.length && m.every((v, k) => v === w[k]); }, want, { timeout: 5000 });
tests.push({
  name: 'S1-12 a picked-up piece rings the neighbours it can legally trade with, and only those',
  async run(t) {
    await board(t);
    const at = await geometry(t), w = (await t.state()).board.w;
    t.equal((await t.state()).legal.length, 0, 'nothing is ringed before a piece is picked');
    const want = await legalAround(t, 1, 0);
    t.equal(want.length, 1, 'the piece at the top has exactly one legal neighbour on this board');
    t.expect(want[0] === 1 * w + 1, 'it is the piece below');
    await pointer(t, at(1, 0));
    await marked(t, want);
    t.equal((await t.state()).selected, 0 * w + 1, 'the piece is picked');
    await t.shot('S1-12-legal-rings');
    // a piece with no legal swap rings nothing; picking another piece moves the rings
    await pointer(t, at(4, 4));
    await marked(t, await legalAround(t, 4, 4));
    // putting it down (tap the same piece) clears them
    await pointer(t, at(4, 4));
    await marked(t, []);
  },
});
tests.push({
  name: 'S1-12 the rings come with the keyboard cursor too, clear on Esc, and stay (still) under reduced motion',
  viewports: ['desktop'],
  reducedMotion: true,
  async run(t) {
    await board(t);
    await t.page.keyboard.press('ArrowRight'); // wakes the cursor on the middle piece and moves it one right, to [3,2]
    for (const k of ['ArrowUp', 'ArrowUp', 'ArrowLeft', 'ArrowLeft']) await t.page.keyboard.press(k);
    t.equal((await t.state()).cursor, 1, 'the cursor is on the piece at [1,0]');
    await t.page.keyboard.press('Enter');
    const want = await legalAround(t, 1, 0);
    t.equal(want.length, 1, 'that piece has one legal neighbour');
    await marked(t, want);
    t.equal((await t.state()).reduced, true, 'reduced motion is on');
    await t.page.keyboard.press('Escape');
    await marked(t, []);
    t.equal((await t.state()).selected, -1, 'Esc puts the piece down');
  },
});
tests.push({
  name: 'S1-12 a swap clears the rings',
  viewports: ['desktop'],
  async run(t) {
    await board(t);
    const at = await geometry(t);
    await pointer(t, at(1, 0));
    await marked(t, await legalAround(t, 1, 0));
    await pointer(t, at(1, 1)); // the legal neighbour: the swap is made
    await t.page.waitForFunction(() => window.__game.getState().legal.length === 0 && window.__game.getState().selected === -1, null, { timeout: 5000 });
  },
});

// --- S4-04: each world ends in its own words with Della, and world 6 ends with all six postcards ---------------------------------
const cardText = (t) => t.page.evaluate(() => { const m = document.querySelector('.modal'); return { head: m.querySelector('h2').textContent, text: m.textContent, della: !!m.querySelector('.pc-say p'), six: m.querySelectorAll('.pc-six figure').length, btn: [...m.querySelectorAll('.btn')].map((b) => b.textContent) }; });
const inside = (t) => t.page.evaluate(() => { const m = document.querySelector('.modal').getBoundingClientRect(); return [...document.querySelectorAll('.modal h2, .modal p, .modal figure, .modal .btn')].every((e) => { const r = e.getBoundingClientRect(); return r.left >= m.left - 1 && r.right <= m.right + 1; }) && document.documentElement.scrollWidth <= window.innerWidth; });
tests.push({
  name: 'S4-04 every world card has its own headline and Della speaking, and world 6 shows all six postcards',
  async run(t) {
    const heads = new Set(), says = new Set();
    for (const w of [1, 2, 3, 4, 5, 6]) {
      await t.game('scene', 'world', w);
      await t.waitIdle();
      const c = await cardText(t);
      heads.add(c.head);
      says.add(await t.page.evaluate(() => document.querySelector('.modal .pc-say p').textContent));
      t.expect(c.della, `world ${w}: Della speaks on the card`);
      t.expect(/Della/.test(c.text), `world ${w}: she is named`);
      t.equal(c.six, w === 6 ? 6 : 0, `world ${w}: ${w === 6 ? 'all six postcards are shown' : 'one postcard, no gallery'}`);
      t.expect(c.btn.includes(w === 6 ? 'Back to the map' : 'On to the next world'), `world ${w}: the button is ${c.btn.join(', ')}`);
      t.expect(await inside(t), `world ${w}: everything sits inside the card and the page does not scroll sideways`);
      if (w === 2 || w === 6) await t.shot(`S4-04-world-${w}-card`);
    }
    t.equal(heads.size, 6, 'six different headlines');
    t.equal(says.size, 6, 'six different things for Della to say');
  },
});
tests.push({
  name: 'S4-04 the results card ribbon is in the world\'s own words',
  async run(t) {
    const seen = new Set();
    for (const [id, world] of [['w1-01', 1], ['w2-01', 2], ['w3-01', 3], ['w4-01', 4], ['w5-01', 5], ['w6-01', 6]]) {
      await t.game('newGame', { level: id, seed: 3, tips: false });
      await t.game('scene', 'win');
      await t.page.waitForSelector('.modal .ribbon span');
      const r = await t.page.evaluate(() => document.querySelector('.modal .ribbon span').textContent);
      seen.add(r);
      t.expect(r.length <= 17 && r !== 'Level cleared!', `world ${world}: the ribbon says "${r}"`);
      if (world === 5) { await t.waitIdle(); await t.shot('S4-04-results-ribbon'); }
    }
    t.equal(seen.size, 6, 'six different ribbons');
  },
});

// --- CL-01: nothing may clip with every volume control at its maximum ---------------------------------------------------------
// The busiest moment is the loudest piece at full intensity, a bed and the three loudest cues of one move struck 40 ms apart, measured at the speakers through the master volume and the limiter. Everything is seeded, so the answer is the same every run.
const MAX = { volume: 1 };
// The cues one move can sound together (play.js beatSounds and cuesAfterMove); the win, lose and world phrases come after the move, not with it.
const ONE_MOVE = ['swap', 'bounce', 'match', 'combo', 'goal', 'crystal', 'stone', 'cascade', 'special', 'tufa', 'lock', 'moss', 'fog', 'token', 'spread', 'reshuffle', 'starline', 'low'];
tests.push({
  name: 'CL-01 the render hooks take a volume, and a louder volume renders louder',
  viewports: ['desktop'],
  async run(t) {
    const [d, f] = [await t.game('cueRender', 'win', 3, {}, 3, false, 1), await t.game('cueRender', 'win', 3, {}, 3, false, 1, MAX)];
    t.expect(f.peak > d.peak * 1.05, `win at the maximum volume peaks ${f.peak}, above its default ${d.peak}`);
    const [m0, m1] = [await t.game('audioRender', 'garvan', 8, false), await t.game('audioRender', 'garvan', 8, false, MAX)];
    t.expect(m1.peak > m0.peak * 1.05, `a piece at the maximum volume peaks ${m1.peak}, above its default ${m0.peak}`);
    const before = await t.game('audioState');
    t.equal(before.master === null || typeof before.master === 'number', true, 'the live audio is untouched');
  },
});
tests.push({
  name: 'CL-01 the busiest moment stays under 0.95 with every volume control at its maximum',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.game('audioList');
    const pieces = [];
    for (const name of list.music) pieces.push([name, (await t.game('audioRender', name, 12, false, MAX)).peak]);
    pieces.sort((a, b) => b[1] - a[1]);
    const loudest = pieces[0][0];
    const loud = [];
    for (const name of list.cues) loud.push([name, (await t.game('cueRender', name, 3, {}, 2.5, false, 1, MAX)).peak]);
    loud.sort((a, b) => b[1] - a[1]);
    const move = loud.filter(([n]) => ONE_MOVE.includes(n)), top = move.slice(0, 6).map(([n]) => n);
    t.log(`loudest piece ${loudest} (${pieces[0][1]}); loudest cues of a move ${move.slice(0, 3).map(([n, p]) => `${n} ${p}`).join(', ')}; loudest of all ${loud[0][0]} ${loud[0][1]}`);
    for (const cue of loud) t.expect(cue[1] < 0.95, `${cue[0]} alone at full volume peaks ${cue[1]}, under 0.95`);
    const bed = list.ambience.includes('rain') ? 'rain' : list.ambience[0];
    const peaksBy = [];
    for (let n = 1; n <= top.length; n++) peaksBy.push((await t.game('mixRender', { piece: loudest, bed, seconds: 4, levels: MAX, cues: top.slice(0, n).map((name, k) => ({ name, arg: 3, at: 1 + k * 0.04, seed: 1 + k })) })).peak);
    t.log(`peak with 1 to ${top.length} of those cues: ${peaksBy.join(', ')}`);
    const mix = await t.game('mixRender', { piece: loudest, bed, seconds: 6, levels: MAX, cues: top.slice(0, 3).map((name, k) => ({ name, arg: 3, at: 1 + k * 0.04, seed: 1 + k })) });
    t.log(`busiest moment: peak ${mix.peak} (${mix.peakDb} dBFS)`);
    t.expect(mix.peak < 0.95, `the piece, a bed and the three loudest cues of one move together peak ${mix.peak}, under 0.95`);
    const solo = await t.game('mixRender', { piece: loudest, bed, seconds: 6, levels: MAX, cues: [{ name: loud[0][0], arg: 3, at: 2, seed: 1 }] });
    t.expect(solo.peak < 0.95, `the loudest cue of all (${loud[0][0]}) over the piece and bed peaks ${solo.peak}, under 0.95`);
  },
});

// --- S1-04: a refused move sounds and shows it, and a pull past the edge does not use up the gesture --------------------------
const RULES = ['aL1 b c d e', 'b c d e a', 'c d e a b', 'd bF a b c', 'e S1 T c d']; // a padlocked piece, a fogged piece, tufa and a bath token; no match on the board
const bounces = async (t) => (await sounds(t)).filter((n) => n === 'bounce').length;
tests.push({
  name: 'S1-04 a swap into a blocked piece thuds and the pressed piece gives a little toward it',
  async run(t) {
    await board(t, RULES);
    const before = await bounces(t);
    // one synchronous step, so the spring (80 ms) cannot have finished when the state is read
    const r = await t.page.evaluate(() => { const g = window.__game, res = g.act('swap', [0, 0], [1, 0]); const s = g.getState(); return { res, drag: s.drag, reduced: s.reduced }; });
    t.equal(r.res.reason, 'blocked', 'the engine refuses it');
    t.equal(await bounces(t), before + 1, 'the thud plays once');
    t.expect(r.drag && r.drag.i === 0 && r.drag.j === -1 && r.drag.dx > 0 && r.drag.dy === 0 && r.drag.released, `the padlocked piece leans toward the piece it was sent at and springs back (${JSON.stringify(r.drag)})`);
    await t.page.waitForFunction(() => window.__game.getState().drag === null, null, { timeout: 3000 });
    t.equal((await t.state()).movesLeft, 40, 'no move was spent');
  },
});
tests.push({
  name: 'S1-04 a drag onto a blocked piece thuds, spends no move, and leaves the board as it was',
  async run(t) {
    await board(t, RULES);
    const at = await geometry(t), before = await t.state();
    const from = at(0, 0), to = at(1, 0);
    if (t.viewport === 'mobile') await t.touchDrag(from, to, { steps: 6 });
    else { await t.page.mouse.move(...from); await t.page.mouse.down(); await t.page.mouse.move(...to, { steps: 6 }); await t.page.mouse.up(); }
    await t.page.waitForFunction(() => window.__game.getState().sounds.includes('bounce'), null, { timeout: 5000 });
    const s = await t.state();
    t.equal(s.movesLeft, before.movesLeft, 'no move was spent');
    t.equal(s.hash, before.hash, 'the board is unchanged');
  },
});
tests.push({
  name: 'S1-04 a pull past the board edge thuds once and the same press can be aimed again',
  viewports: ['desktop'],
  async run(t) {
    await board(t, BOARD);
    const at = await geometry(t), [x, y] = at(1, 0), cell = (await t.state()).layout.cell;
    await t.page.mouse.move(x, y);
    await t.page.mouse.down();
    await t.page.mouse.move(x, y - cell * 0.6, { steps: 5 }); // up: off the top of the board
    await t.page.waitForFunction(() => window.__game.getState().sounds.includes('bounce'), null, { timeout: 3000 });
    await t.page.mouse.move(x + 2, y - cell * 0.7, { steps: 3 }); // still past the edge: no second thud
    t.equal(await bounces(t), 1, 'one thud for the pull past the edge');
    t.equal((await t.state()).movesLeft, 40, 'the gesture was not spent as a move');
    await t.page.mouse.move(x, y + cell * 0.6, { steps: 8 }); // now down, onto the piece below: the swap that wins a stone is made
    await t.page.waitForFunction(() => window.__game.getState().movesLeft < 40, null, { timeout: 5000 });
    await t.page.mouse.up();
    t.expect((await t.state()).lastTimeline && (await t.state()).lastTimeline.valid, 'the re-aimed pull made the swap');
    await t.waitIdle();
  },
});
tests.push({
  name: 'S1-04 letting go after a pull past the edge does not pick the piece up',
  viewports: ['desktop'],
  async run(t) {
    await board(t, BOARD);
    const at = await geometry(t), [x, y] = at(1, 0), cell = (await t.state()).layout.cell;
    await t.page.mouse.move(x, y); await t.page.mouse.down(); await t.page.mouse.move(x, y - cell * 0.6, { steps: 5 });
    await t.page.waitForFunction(() => window.__game.getState().sounds.includes('bounce'), null, { timeout: 3000 });
    await t.page.mouse.up();
    t.equal((await t.state()).selected, -1, 'the piece is not selected');
  },
});

// --- S1-02: a Move speed setting that is kept ---------------------------------------------------------------------------------
const CHAIN = ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d']; // the winning swap [1,1] with [1,0] breaks a stone, so it has several beats
async function totalFor(t) {
  await board(t, CHAIN, { moves: 10, goals: [{ type: 'stone', need: 1 }], stars: [1, 2, 3] });
  const total = await t.page.evaluate(() => { const g = window.__game; g.act('swap', [1, 1], [1, 0]); return g.act('total'); });
  await t.page.evaluate(() => window.__game.act('skip'));
  await t.waitIdle();
  return total;
}
tests.push({
  name: 'S1-02 Move speed 1.5 and 2 shorten a move by that much, and the choice is kept',
  async run(t) {
    await t.game('scene', 'settings');
    await t.page.waitForSelector('[data-speed]');
    const pressed = () => t.page.evaluate(() => [...document.querySelectorAll('[data-speed]')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.speed));
    t.equal((await pressed()).join(), '1', 'the speed starts at 1');
    t.equal((await t.state()).settings.animSpeed, 1, 'and the saved setting is 1');
    await t.shot('S1-02-settings-speed');
    await t.page.click('[data-speed="2"]');
    t.equal((await t.state()).settings.animSpeed, 2, 'pressing 2× saves 2');
    t.equal((await pressed()).join(), '2', 'and shows it pressed');
    await t.reload();
    t.equal((await t.state()).settings.animSpeed, 2, 'the choice survives a reload');
    const fast = await totalFor(t);
    await t.game('scene', 'settings');
    await t.page.click('[data-speed="1.5"]');
    const mid = await totalFor(t);
    await t.game('scene', 'settings');
    await t.page.click('[data-speed="1"]');
    const base = await totalFor(t);
    t.log(`the same move lasts ${base} ms at 1x, ${mid} ms at 1.5x, ${fast} ms at 2x`);
    t.expect(base > 300, `the move has some length (${base} ms)`);
    t.expect(Math.abs(base / mid - 1.5) < 0.1, `1.5× is a third shorter (${base} to ${mid} ms)`);
    t.expect(Math.abs(base / fast - 2) < 0.15, `2× is half as long (${base} to ${fast} ms)`);
  },
});
tests.push({
  name: 'S1-02 a damaged Move speed in a save plays at the normal pace',
  viewports: ['desktop'],
  async run(t) {
    await t.game('act', 'save', { settings: { animSpeed: 7 } });
    await t.reload();
    t.equal((await t.state()).settings.animSpeed, 7, 'the damaged value is what the save holds');
    await t.game('scene', 'settings');
    const ok = await t.page.evaluate(() => [...document.querySelectorAll('[data-speed]')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.speed));
    t.equal(ok.join(), '1', 'the buttons show the normal pace');
    const base = await totalFor(t);
    t.equal(base, 844, 'a move takes its normal length');
  },
});
