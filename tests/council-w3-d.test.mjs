// Council wave 3, batch D: feedback, teaching and help; sound
// (S1-12, S1-04, S1-08, S1-02, S5-03, S5-04, S5-09, CL-01; S5-07 is already done, S4-04 is the finale).
// Nothing here depends on chance: every board is seeded, every wait is for a condition, and the sound checks count what a cue
// builds or render it offline with a fixed seed.
export const tests = [];
// Fitted from time 0 (wave 2 and 3): cueRender now starts a cue at 0.2 s by default (C4-06), where the offline limiter reads a cue two to four times
// louder, so the fitting checks below pass start: 0 to keep reading what they were fitted against. The reading as heard is in council-w4-a; the trims that
// bring it into range wait for the owner's loudness pass.
const FROM_ZERO = { start: 0 };

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
    for (const name of list.cues) loud.push([name, (await t.game('cueRender', name, 3, {}, 2.5, false, 1, { ...MAX, ...FROM_ZERO })).peak]);
    loud.sort((a, b) => b[1] - a[1]);
    const move = loud.filter(([n]) => ONE_MOVE.includes(n)), top = move.slice(0, 6).map(([n]) => n);
    t.log(`loudest piece ${loudest} (${pieces[0][1]}); loudest cues of a move ${move.slice(0, 3).map(([n, p]) => `${n} ${p}`).join(', ')}; loudest of all ${loud[0][0]} ${loud[0][1]}`);
    for (const cue of loud) t.expect(cue[1] < 0.95, `${cue[0]} alone at full volume peaks ${cue[1]}, under 0.95`);
    const bed = list.ambience.includes('rain') ? 'rain' : list.ambience[0];
    const peaksBy = [];
    for (let n = 1; n <= top.length; n++) peaksBy.push((await t.game('mixRender', { piece: loudest, bed, seconds: 4, levels: { ...MAX, ...FROM_ZERO }, cues: top.slice(0, n).map((name, k) => ({ name, arg: 3, at: 1 + k * 0.04, seed: 1 + k })) })).peak);
    t.log(`peak with 1 to ${top.length} of those cues: ${peaksBy.join(', ')}`);
    const mix = await t.game('mixRender', { piece: loudest, bed, seconds: 6, levels: { ...MAX, ...FROM_ZERO }, cues: top.slice(0, 3).map((name, k) => ({ name, arg: 3, at: 1 + k * 0.04, seed: 1 + k })) });
    t.log(`busiest moment: peak ${mix.peak} (${mix.peakDb} dBFS)`);
    t.expect(mix.peak < 0.95, `the piece, a bed and the three loudest cues of one move together peak ${mix.peak}, under 0.95`);
    const solo = await t.game('mixRender', { piece: loudest, bed, seconds: 6, levels: { ...MAX, ...FROM_ZERO }, cues: [{ name: loud[0][0], arg: 3, at: 2, seed: 1 }] });
    t.expect(solo.peak < 0.95, `the loudest cue of all (${loud[0][0]}) over the piece and bed peaks ${solo.peak}, under 0.95`);
  },
});

// The results card as screens.js plays it: the win phrase at once, a star cue for each star at 380, 560 and 740 ms and the earned chime at 810, 990 or 1170 ms for 1, 2 or 3 stars
// (200 + (stars + 1) x 180 + 250 ms), over the results piece and the world's bed. The mix starts 0.2 s into the render (C4-06). Was a fixed 1.17 s for the earned chime, which read 0.95 or less.
const RESULTS = (stars, card) => [{ name: 'win', arg: stars, at: 0, seed: 1 }, ...Array.from({ length: stars }, (_, k) => ({ name: 'star', arg: k + 1, at: 0.2 + (k + 1) * 0.18, seed: 2 + k, opt: { level: card[k + 1] } })), { name: 'earned', arg: 0, at: (200 + (stars + 1) * 180 + 250) / 1000, seed: 5 }];
tests.push({
  name: 'CL-01 the results card (win phrase, star cues, results music, earned) stays under 0.95 at the maximum volume for 1, 2 and 3 stars',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.game('audioList'), out = [];
    for (const bed of list.ambience) for (const stars of [1, 2, 3]) {
      const mix = await t.game('mixRender', { piece: 'results', bed, seconds: 4, levels: MAX, cues: RESULTS(stars, list.cardStarLevel) }); // the star cues at the levels the card rings them (C4-07)
      out.push(`${bed} ${stars}: ${mix.peak}`);
      t.expect(mix.peak < 0.95, `the results card at ${stars} stars over ${bed} peaks ${mix.peak}, under 0.95`);
    }
    t.log(out.join('; '));
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

// --- S1-08: haptics -----------------------------------------------------------------------------------------------------------
// navigator.vibrate is replaced by a recorder before the page loads; nobody here can feel it, so the test checks what would be asked of the phone.
const recordVibration = () => { window.__vib = []; Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => { window.__vib.push(p); return true; } }); };
const buzzes = (t) => t.page.evaluate(() => window.__vib.slice());
const flat = (xs) => xs.flat();
const SPECIAL = ['a a b a c', 'd e a c d', 'b c d e b', 'e d c b a', 'c b e a d']; // swapping [2,0] with [2,1] makes four in a row: a Cascade is made
tests.push({
  name: 'S1-08 on a touch screen a match buzzes 10 to 25 ms and a special made buzzes longer, by default',
  viewports: ['mobile'],
  initScript: recordVibration,
  async run(t) {
    await board(t, SPECIAL, { moves: 20, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] });
    t.equal((await t.state()).settings.vibration, true, 'Vibration starts on for a touch screen');
    t.equal((await buzzes(t)).length, 0, 'nothing buzzed yet');
    t.equal((await t.game('act', 'swap', [2, 0], [2, 1])).valid, true, 'the swap that makes four in a row');
    await t.waitIdle();
    const b = flat(await buzzes(t));
    t.log(`buzzes: ${JSON.stringify(b)}`);
    t.expect(b.length > 0 && b.every((n) => n >= 10 && n <= 25), 'every pulse is 10 to 25 ms');
    t.expect(b.includes(10) || b.includes(20), 'a match buzzes');
    t.expect(b.includes(20), 'the special made buzzes the longer 20 ms');
    await board(t, CHAIN, { moves: 10, goals: [{ type: 'stone', need: 1 }], stars: [1, 2, 3] });
    await t.page.evaluate(() => { window.__vib.length = 0; });
    await t.game('act', 'swap', [1, 1], [1, 0]);
    await t.waitIdle();
    t.equal((await buzzes(t))[0], 10, 'a plain match buzzes 10 ms');
  },
});
tests.push({
  name: 'S1-08 a refused swap buzzes a double tap, and Vibration off silences everything',
  viewports: ['mobile'],
  initScript: recordVibration,
  async run(t) {
    await board(t, RULES);
    await t.game('act', 'swap', [0, 0], [1, 0]);
    const b = await buzzes(t);
    t.expect(b.some((p) => Array.isArray(p) && p.length === 3 && p.filter((_, k) => k % 2 === 0).every((n) => n >= 10 && n <= 25)), `a padlock buzzes a double tap (${JSON.stringify(b)})`);
    await t.game('scene', 'settings');
    await t.shot('S1-08-settings-vibration');
    await t.page.click('[data-toggle="vibration"]');
    t.equal((await t.state()).settings.vibration, false, 'the switch turns it off');
    await t.page.evaluate(() => { window.__vib.length = 0; });
    await t.game('scene', 'game');
    await board(t, SPECIAL, { moves: 20, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] });
    await t.game('act', 'swap', [2, 0], [2, 1]);
    await t.waitIdle();
    t.equal((await buzzes(t)).length, 0, 'nothing buzzes with the switch off');
  },
});
tests.push({
  name: 'S1-08 with a mouse Vibration starts off, can be turned on in Settings, and reduced motion silences it',
  viewports: ['desktop'],
  initScript: recordVibration,
  async run(t) {
    await board(t, SPECIAL, { moves: 20, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] });
    t.equal((await t.state()).settings.vibration, false, 'Vibration starts off without a touch screen');
    await t.game('act', 'swap', [2, 0], [2, 1]);
    await t.waitIdle();
    t.equal((await buzzes(t)).length, 0, 'so nothing buzzes');
    await t.game('scene', 'settings');
    await t.page.click('[data-toggle="vibration"]');
    t.equal((await t.state()).settings.vibration, true, 'the switch turns it on');
    t.expect((await buzzes(t)).length === 1, 'turning it on gives one buzz to feel');
    await t.page.evaluate(() => { window.__vib.length = 0; });
    await t.page.click('[data-motion="reduced"]');
    t.expect((await t.state()).reduced && (await t.state()).settings.vibration, 'reduced motion is on with Vibration still on');
    await board(t, SPECIAL, { moves: 20, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] });
    await t.game('act', 'swap', [2, 0], [2, 1]);
    await t.waitIdle();
    t.equal((await buzzes(t)).length, 0, 'with reduced motion on nothing buzzes');
  },
});
tests.push({
  name: 'S1-08 where there is no vibration motor the switch is not offered',
  viewports: ['desktop'],
  initScript: () => { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: undefined }); },
  async run(t) {
    await t.game('scene', 'settings');
    t.equal(await t.page.locator('[data-toggle="vibration"]').count(), 0, 'no Vibration row');
    await t.game('scene', 'game');
    await board(t);
    t.equal((await t.game('act', 'swap', [1, 1], [1, 0])).valid, true, 'and play goes on without it');
  },
});

// --- S5-03: skipping a move keeps its sounds ----------------------------------------------------------------------------------
const calls = (t) => t.page.evaluate(() => window.__game.getState().calls);
const names = (xs) => xs.map((c) => c.name);
async function playMove(t, skip) {
  await board(t, CHAIN, { moves: 10, goals: [{ type: 'stone', need: 3 }], stars: [1, 2, 3] });
  const before = (await calls(t)).length;
  await t.page.evaluate((k) => { const g = window.__game; g.act('swap', [1, 1], [1, 0]); if (k) g.act('skip'); }, skip);
  await t.waitIdle();
  return (await calls(t)).slice(before > 0 ? before : 0);
}
tests.push({
  name: 'S5-03 a skipped move still sounds every cue the whole move would, each once and spread out',
  viewports: ['desktop'],
  async run(t) {
    const full = await playMove(t, false), quick = await playMove(t, true);
    t.log(`played through: ${names(full).join(' ')}; skipped: ${names(quick).join(' ')}`);
    t.expect(new Set(names(full)).size >= 3, `the move has at least three kinds of sound (${[...new Set(names(full))].join(', ')})`);
    t.equal([...new Set(names(quick))].sort().join(), [...new Set(names(full))].sort().join(), 'the skipped move sounds the same kinds of cue');
    t.equal(new Set(names(quick)).size, quick.length, 'each is struck once');
    const together = quick.filter((c) => c.name !== 'starline' && c.name !== 'low');
    const crowd = await t.game('crowdLevel', together.length);
    t.expect(crowd < 1 && together.every((c) => Math.abs(c.level - crowd) < 1e-9), `each is turned down for a crowd of ${together.length} (level ${together[0].level.toFixed(2)}, want ${crowd.toFixed(2)})`);
    const gaps = quick.filter((c) => c.name !== 'starline' && c.name !== 'low').map((c) => c.at); // those two come after the move, not with it
    t.expect(gaps.every((g, k) => k === 0 || Math.abs(g - gaps[k - 1] - 0.04) < 1e-9), `they are 40 ms apart (${gaps.map((g) => g.toFixed(2)).join(' ')})`);
    const hi = (xs) => Math.max(...xs.filter((c) => c.name === 'match').map((c) => c.arg));
    t.equal(hi(quick), hi(full), 'the match is the highest wave the move reached');
  },
});
tests.push({
  name: 'S5-03 a replay is still silent, and a move skipped late only adds the beats it had not played',
  viewports: ['desktop'],
  async run(t) {
    await playMove(t, false);
    const n = (await calls(t)).length;
    await t.page.evaluate(() => { window.__game.act('replay'); window.__game.act('skip'); });
    await t.waitIdle();
    t.equal((await calls(t)).length, n, 'a replay makes no sound, skipped or not');
    // skipping part-way through: what already played is not played again
    await board(t, CHAIN, { moves: 10, goals: [{ type: 'stone', need: 3 }], stars: [1, 2, 3] });
    const before = (await calls(t)).length;
    await t.page.evaluate(() => { window.__game.act('swap', [1, 1], [1, 0]); });
    await t.page.waitForFunction((b) => window.__game.getState().calls.length > b + 1, before, { timeout: 5000 });
    await t.game('act', 'skip');
    await t.waitIdle();
    const all = (await calls(t)).slice(before), once = {};
    for (const c of all) once[c.name] = (once[c.name] || 0) + 1;
    t.expect(Object.values(once).every((k) => k <= 2), `no cue is played more than twice (${JSON.stringify(once)})`);
  },
});
// A skipped move folds the cues of every beat it skipped into one set (play.js skippedSounds), so a long chain can strike a goal, a combo, a crystal, a match and a stone together. The sets below add one cue at a time in the order of the verifier's loudest realistic fold; each is measured as a SUM (all cues together over the loudest piece and a bed, delayed so the limiter has warmed up), each cue at the crowd level for the set's size.
const FOLD = ['goal', 'combo', 'crystal', 'match', 'stone', 'tufa', 'lock', 'special'];
tests.push({
  name: 'S5-03 the folded cues of a skipped move, summed, stay under 0.95 at the maximum volume',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.game('audioList');
    const pieces = [];
    for (const name of list.music) pieces.push([name, (await t.game('audioRender', name, 12, false, MAX)).peak]);
    pieces.sort((a, b) => b[1] - a[1]);
    const out = [];
    for (let n = 4; n <= FOLD.length; n++) {
      const level = await t.game('crowdLevel', n);
      const mix = await t.game('mixRender', { piece: pieces[0][0], bed: 'rain', seconds: 4, levels: MAX, cues: FOLD.slice(0, n).map((name, k) => ({ name, arg: 3, at: 1 + k * 0.04, seed: 1 + k, opt: { level } })) });
      out.push(`${n} cues at level ${level.toFixed(2)}: ${mix.peak}`);
      t.expect(mix.peak < 0.95, `the first ${n} folded cues (${FOLD.slice(0, n).join(', ')}) summed at level ${level.toFixed(2)} peak ${mix.peak}, under 0.95`);
    }
    t.log(out.join('; '));
    t.equal(await t.game('crowdLevel', 3), 1, 'three cues or fewer are as loud as one');
  },
});

// --- S5-04: the chimes are in the key of the music under them ---------------------------------------------------------------
// Node only. A recording context stands in for the audio context and the test reads the pitch of every tone a pitched cue builds, in every
// piece's key; each must be a note of that piece's mode. Chance: the draws are seeded, so it gives the same answer every run.
const NON_PITCHED = ['swap', 'bounce', 'stone', 'cascade', 'tufa', 'lock', 'moss', 'fog', 'spread', 'booster'];
const ARGS = { match: [0, 1, 2, 3, 4, 5], token: [0, 1, 2, 3, 4], win: [1, 2, 3], star: [1, 2, 3], starline: [1, 2, 3], low: [1, 3] };
function recorder() {
  const freqs = [], param = () => ({ value: 0, setValueAtTime(v) { freqs.push(v); }, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }), quiet = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect() {}, start() {}, stop() {}, gain: quiet(), frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, Q: {} });
  const ctx = {
    currentTime: 0, sampleRate: 8000,
    createOscillator() { const o = node(); o.frequency = param(); return o; },
    createGain: node, createBiquadFilter: node, createBufferSource: node,
    createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }),
  };
  return { ctx, freqs };
}
const seededRnd = (seed) => { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
tests.push({
  name: 'S5-04 every pitched cue is a note of the mode of the piece under it, in every world',
  node: true,
  async run(t) {
    const { runCue, tuneOf, CUE_NAMES } = await import('../src/js/audio.js');
    const { SCORES } = await import('../src/js/music.js');
    const MODES = { major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11] };
    let checked = 0, tonic = 0;
    for (const [name, sc] of Object.entries(SCORES)) {
      const mode = sc.scale ? (sc.scale[2] === 3 ? MODES.dorian : MODES.lydian) : MODES.major;
      const allowed = new Set(mode.map((d) => (sc.key + d) % 12)), tune = tuneOf(name);
      for (const cue of CUE_NAMES.filter((c) => !NON_PITCHED.includes(c))) {
        for (const arg of ARGS[cue] || [0]) {
          for (let draw = 1; draw <= 8; draw++) {
            const { ctx, freqs } = recorder();
            runCue(cue, arg, { tune, size: 5 }, ctx, {}, seededRnd(draw * 131 + arg));
            for (const f of freqs) {
              if (cue === 'combo' && f < 130) continue; // the low growl of a combo glides; it is not a note
              const semis = Math.round(12 * Math.log2(f / 261.6256)), pc = ((semis % 12) + 12) % 12;
              checked++;
              if (!allowed.has(pc)) t.fail(`${name}: ${cue} ${arg} sounds pitch class ${pc} (${f.toFixed(1)} Hz), not in the mode of ${(sc.key % 12)}`);
            }
          }
        }
      }
      // the first chime of a chain is the tonic of the piece
      const { ctx, freqs } = recorder();
      runCue('match', 0, { tune, size: 3 }, ctx, {}, seededRnd(7));
      const tpc = (((Math.round(12 * Math.log2(freqs[0] / 261.6256))) % 12) + 12) % 12;
      if (tpc === sc.key % 12) tonic++; else t.fail(`${name}: the first match chime is pitch class ${tpc}, the piece's tonic is ${sc.key % 12}`);
    }
    t.log(`${checked} tones checked across ${Object.keys(SCORES).length} pieces; the first chime is the tonic in ${tonic}`);
    t.expect(checked > 3000, 'a real number of tones was checked');
  },
});
tests.push({
  name: 'S5-04 with no piece playing the cues are in C, and a world\'s cues are not',
  node: true,
  async run(t) {
    const { runCue, tuneOf } = await import('../src/js/audio.js');
    const first = (tune) => { const { ctx, freqs } = recorder(); runCue('match', 0, { tune, size: 3 }, ctx, {}, seededRnd(3)); return freqs[0]; };
    const c = first(tuneOf(null)), lakes = first(tuneOf('lakes'));
    t.expect(Math.abs(Math.log2(c / 523.25)) < 0.02, `a first chime in C is C5 (${c.toFixed(1)} Hz)`);
    t.expect(Math.abs(12 * Math.log2(lakes / c) + 3) < 0.7, `in the lakes (A) it is three semitones lower (${lakes.toFixed(1)} Hz)`);
  },
});
tests.push({
  name: 'S5-04 the retuned cues keep their level in every key',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.game('audioList'), out = [];
    for (const score of list.music) {
      const inPlay = !['title', 'intro', 'results'].includes(score); // the win phrase sounds while a level is on, in a world's key
      for (const [name, arg] of [['match', 0], ['match', 3], ['crystal', 0], ['win', 3], ['star', 3], ['goal', 0], ['token', 3], ['combo', 0], ['click', 0], ['starline', 2]]) {
        if (name === 'win' && !inPlay) continue;
        const peaks = [];
        for (let seed = 1; seed <= 3; seed++) peaks.push((await t.game('cueRender', name, arg, { score }, 3, false, seed, FROM_ZERO)).peak);
        peaks.sort((a, b) => a - b);
        if (name !== 'click') t.expect(peaks[1] >= 0.2 && peaks[1] <= 0.45, `${score}: ${name} ${arg} median peak ${peaks[1]} is inside 0.2 to 0.45`);
        else t.expect(peaks[1] < 0.45, `${score}: click median peak ${peaks[1]} is under 0.45`);
        if (score === 'avenue') out.push(`${name} ${arg} ${peaks.join('/')}`);
      }
    }
    t.log(`in Bb: ${out.join('; ')}`);
  },
});

// --- S5-09: Music and Effects volume, and a click to judge a slider by --------------------------------------------------------
const MUSIC_LEVEL = 0.6; // audio.js: the shipped music level, at music volume 1
const slide = async (t, id, steps) => { // real keys on the slider: Home, then so many steps of 0.05 to the right
  await t.page.focus('#' + id);
  await t.page.keyboard.press('Home');
  for (let i = 0; i < steps; i++) await t.page.keyboard.press('ArrowRight');
};
tests.push({
  name: 'S5-09 Music volume and Effects volume sliders move their own bus and are kept',
  async run(t) {
    await t.game('scene', 'settings');
    await t.page.waitForSelector('#vol-music');
    t.equal(await t.page.locator('label[for="vol-music"]').textContent(), 'Music volume', 'the music slider is labelled');
    t.equal(await t.page.locator('label[for="vol-sfx"]').textContent(), 'Effects volume', 'the effects slider is labelled');
    let s = (await t.state()).settings;
    t.expect(s.musicVolume === 1 && s.sfxVolume === 1, 'both start at 1: the mix is as it was');
    await t.shot('S5-09-settings-sliders');
    await slide(t, 'vol-music', 8); // 0.4
    await t.page.waitForFunction(() => window.__game.audioState().music !== null, null, { timeout: 5000 });
    let a = await t.game('audioState');
    s = (await t.state()).settings;
    t.equal(s.musicVolume, 0.4, 'the music slider saves 0.4');
    t.equal(a.musicLevel, +(MUSIC_LEVEL * 0.4).toFixed(3), `the music level is the shipped level times 0.4 (${a.musicLevel})`);
    t.equal(a.sfx, 1, 'the effects bus did not move');
    t.equal(a.master, 0.6, 'nor did the master volume');
    await slide(t, 'vol-sfx', 10); // 0.5
    a = await t.game('audioState');
    t.equal(a.sfx, 0.5, 'the effects slider halves the effects bus');
    t.equal(a.musicLevel, +(MUSIC_LEVEL * 0.4).toFixed(3), 'and leaves the music where it was');
    await t.reload();
    s = (await t.state()).settings;
    t.expect(s.musicVolume === 0.4 && s.sfxVolume === 0.5, 'both are kept across a reload');
    await t.page.mouse.click(5, 5);
    await t.page.waitForFunction(() => window.__game.audioState().sfx !== null, null, { timeout: 5000 });
    a = await t.game('audioState');
    t.expect(a.sfx === 0.5 && a.musicLevel === +(MUSIC_LEVEL * 0.4).toFixed(3), 'and applied when the sound starts');
  },
});
tests.push({
  name: 'S5-09 letting go of the Volume and Effects sliders plays a click; the Music slider does not need one',
  viewports: ['desktop'],
  async run(t) {
    await t.game('scene', 'settings');
    await t.page.waitForSelector('#vol');
    const clicks = async () => (await sounds(t)).filter((n) => n === 'click').length;
    const base = await clicks();
    await slide(t, 'vol', 6);
    t.expect((await clicks()) >= base + 1, 'the master slider plays the click');
    const afterVol = await clicks();
    await slide(t, 'vol-sfx', 6);
    t.expect((await clicks()) >= afterVol + 1, 'the effects slider plays the click');
    const afterSfx = await clicks();
    await slide(t, 'vol-music', 6);
    t.equal(await clicks(), afterSfx, 'the music slider makes none: the music is its own preview');
  },
});
tests.push({
  name: 'S5-09 the sliders only turn the mix down: a lower Music volume lowers the render, and the switches stay separate',
  viewports: ['desktop'],
  async run(t) {
    const full = await t.game('audioRender', 'garvan', 8, false), half = await t.game('audioRender', 'garvan', 8, false, { musicVolume: 0.5 });
    t.expect(Math.abs(half.peak / full.peak - 0.5) < 0.08, `music at 0.5 peaks about half (${full.peak} to ${half.peak})`);
    const loud = await t.game('cueRender', 'goal', 0, {}, 3, false, 1), soft = await t.game('cueRender', 'goal', 0, {}, 3, false, 1, { sfxVolume: 0.5 });
    t.expect(soft.peak < loud.peak * 0.8, `effects at 0.5 are quieter (${loud.peak} to ${soft.peak})`);
    // the switches did not change meaning: Music off silences the music bus whatever its slider says, effects off silences the effects
    await t.game('scene', 'settings');
    await t.page.mouse.click(5, 5);
    await t.page.waitForFunction(() => window.__game.audioState().sfx !== null, null, { timeout: 5000 });
    await t.page.click('[data-toggle="music"]');
    let a = await t.game('audioState');
    t.expect(a.musicLevel === 0 && a.sfx === 1, `Music off silences the music and leaves the effects (${a.musicLevel}, ${a.sfx})`);
    await t.page.click('[data-toggle="music"]');
    await t.page.click('[data-toggle="sound"]');
    a = await t.game('audioState');
    t.expect(a.sfx === 0 && a.musicLevel === MUSIC_LEVEL, `Sound effects off silences the effects and leaves the music (${a.sfx}, ${a.musicLevel})`);
  },
});
tests.push({
  name: 'S5-09 an old save gets both at 1, and a damaged one never goes above the shipped level',
  viewports: ['desktop'],
  async run(t) {
    const KEY = 'spa-city-sparkle:v1';
    for (const [saved, music, sfx] of [[{ volume: 0.5 }, 0.6, 1], [{ musicVolume: 7, sfxVolume: -2 }, 0.6, 0], [{ musicVolume: 'loud', sfxVolume: null }, 0.6, 1]]) {
      await t.page.evaluate(([k, st]) => localStorage.setItem(k, JSON.stringify({ v: 1, settings: st })), [KEY, saved]);
      await t.reload();
      await t.page.mouse.click(5, 5);
      await t.page.waitForFunction(() => window.__game.audioState().sfx !== null, null, { timeout: 5000 });
      const a = await t.game('audioState');
      t.expect(a.musicLevel === music && a.sfx === sfx, `${JSON.stringify(saved)} gives music ${a.musicLevel} (want ${music}) and effects ${a.sfx} (want ${sfx})`);
    }
  },
});
