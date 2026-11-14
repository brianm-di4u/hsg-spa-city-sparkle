// Council wave 2, batch D: the first move is shown (S2-02) and the still screens move (S4-03).
const W1 = {};
for (let n = 1; n <= 10; n++) W1[`w1-${String(n).padStart(2, '0')}`] = { stars: 2, best: 1000 };

export const tests = [];

// =================================================================================================================
// S2-02: the hint arrow
// =================================================================================================================
const cellCentre = (s, i) => ({ x: s.layout.bx + (i % s.layout.cols + 0.5) * s.layout.cell, y: s.layout.by + (Math.floor(i / s.layout.cols) + 0.5) * s.layout.cell });
const canvasBox = (t) => t.page.evaluate(() => { const r = document.querySelector('#stage canvas').getBoundingClientRect(); return { x: r.x, y: r.y }; });

tests.push({
  name: 'S2-02 the first lesson shows the move at once: the hint is up with the tip and an arrow runs along the swap',
  async run(t) {
    await t.game('seed', 4);
    await t.game('scene', 'game', 'w1-01');
    await t.waitIdle();
    const s = await t.state();
    t.equal(s.tip, true, 'the first tip is open');
    t.expect(Array.isArray(s.hint) && s.hint.length === 2, 'the hint is on without the 5 s wait');
    t.expect(/arrow/i.test(await t.page.locator('#tip').innerText()), 'the tip points at the arrow');
    const [a, b] = s.hint, A = cellCentre(s, a), Bc = cellCentre(s, b), box = await canvasBox(t);
    const seen = [];
    for (let i = 0; i < 6; i++) { await t.page.waitForTimeout(170); seen.push((await t.state()).hintArrow); }
    t.expect(seen.every(Boolean), 'the arrow is drawn');
    const vis = seen.filter((p) => p && p.alpha > 0.3), xs = vis.map((p) => p.x - box.x), ys = vis.map((p) => p.y - box.y);
    t.expect(xs.length >= 2, 'it is visible for most of its pass');
    const slack = s.layout.cell * 0.3;
    t.expect(xs.every((x) => x >= Math.min(A.x, Bc.x) - slack && x <= Math.max(A.x, Bc.x) + slack) && ys.every((y) => y >= Math.min(A.y, Bc.y) - slack && y <= Math.max(A.y, Bc.y) + slack), 'it stays on the swap between the two pieces');
    t.expect(Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys) > s.layout.cell * 0.15, 'and it travels');
    await t.shot('S2-02-first-move');
  },
});
tests.push({
  name: 'S2-02 the arrow goes when the player moves; a seen tip means no hint at the start',
  async run(t) {
    await t.game('seed', 4);
    await t.game('scene', 'game', 'w1-01');
    await t.waitIdle();
    t.expect((await t.state()).hintArrow !== null, 'the arrow is up');
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    await t.waitIdle(8000);
    const s = await t.state();
    t.equal(s.hint, null, 'the hint is gone after a move');
    t.equal(s.hintArrow, null, 'and so is the arrow');
    await t.game('newGame', { level: 'w1-01', seed: 4, tips: false });
    await t.waitIdle();
    const s2 = await t.state();
    t.equal(s2.hint, null, 'with the tip already seen there is no hint at the start');
    t.equal(s2.hintArrow, null, 'and no arrow');
  },
});
tests.push({
  name: 'S2-02 the idle hint (after 5 s) now carries the arrow too',
  async run(t) {
    await t.game('newGame', { level: 'w1-02', seed: 8, tips: false });
    await t.waitIdle();
    t.equal((await t.state()).hintArrow, null, 'nothing at first');
    await t.page.waitForTimeout(5600);
    const s = await t.state();
    t.expect(Array.isArray(s.hint) && s.hintArrow !== null, 'hint and arrow after 5 s');
    await t.shot('S2-02-idle-hint');
  },
});
tests.push({
  name: 'S2-02 under reduced motion the hint is a still arrow and rings, not a moving one',
  reducedMotion: true,
  async run(t) {
    await t.game('seed', 4);
    await t.game('scene', 'game', 'w1-01');
    await t.waitIdle();
    const a = (await t.state()).hintArrow;
    await t.page.waitForTimeout(500);
    const b = (await t.state()).hintArrow;
    t.expect(a && b, 'the arrow is shown');
    t.expect(Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5, 'and it does not move');
    t.equal(b.alpha, 1, 'at full strength');
    await t.shot('S2-02-first-move-still');
  },
});

