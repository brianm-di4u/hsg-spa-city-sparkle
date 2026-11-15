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
