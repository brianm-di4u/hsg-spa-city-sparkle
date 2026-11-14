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

// =================================================================================================================
// S4-03: slow motion on the still screens
// =================================================================================================================
const atmos = (t, sel) => t.page.evaluate((q) => {
  const root = document.querySelector(q);
  if (!root) return null;
  const kids = [...root.querySelectorAll('i')];
  return {
    n: kids.length,
    kinds: [...new Set(kids.map((k) => k.className))],
    animated: kids.every((k) => getComputedStyle(k).animationName !== 'none' && parseFloat(getComputedStyle(k).animationDuration) > 1),
    shown: getComputedStyle(root).display !== 'none',
    inert: getComputedStyle(root).pointerEvents === 'none',
  };
}, sel);

tests.push({
  name: 'S4-03 the title drifts: clouds, steam and glints move behind the menu, which stays clickable',
  async run(t) {
    await t.game('scene', 'title');
    await t.waitIdle();
    const a = await atmos(t, '#screen .atmos-title');
    t.expect(a && a.n >= 15, `a layer of ${a && a.n} elements`);
    t.expect(['at-cl', 'at-st', 'at-gl'].every((k) => a.kinds.includes(k)), 'clouds, steam and glints');
    t.expect(a.animated, 'every element is animated, slowly');
    t.expect(a.inert, 'the layer does not take taps');
    const top = await t.page.evaluate(() => { const b = document.querySelector('#screen [data-act="play"]').getBoundingClientRect(); const el = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return el.closest('[data-act="play"]') !== null; });
    t.expect(top, 'the Play button is on top');
    await t.page.waitForTimeout(1500);
    await t.shot('S4-03-title', { wait: false });
    await t.page.locator('#screen [data-act="play"]').click();
    await t.waitIdle();
    t.equal((await t.state()).scene, 'map', 'and it works');
  },
});
tests.push({
  name: 'S4-03 reduced motion and the steam setting switch the motion off',
  async run(t) {
    await t.game('scene', 'title');
    await t.waitIdle();
    const vis = () => t.page.evaluate(() => ({ layer: getComputedStyle(document.querySelector('#screen .atmos-title')).display, steam: getComputedStyle(document.querySelector('#screen .at-st')).display }));
    let v = await vis();
    t.equal(v.layer, 'block', 'on by default');
    t.equal(v.steam, 'block', 'steam too');
    await t.game('act', 'save', { settings: { ...(await t.state()).settings, steam: false } });
    await t.game('scene', 'title');
    v = await vis();
    t.equal(v.steam, 'none', 'steam off with the Ambient steam setting');
    t.equal(v.layer, 'block', 'clouds stay');
    await t.game('act', 'save', { settings: { ...(await t.state()).settings, steam: true, motion: 'reduced' } });
    await t.game('scene', 'title');
    v = await vis();
    t.equal(v.layer, 'none', 'all of it off under reduced motion');
  },
});
tests.push({
  name: 'S4-03 reduced motion from the system turns it off too',
  reducedMotion: true,
  async run(t) {
    await t.game('scene', 'title');
    await t.waitIdle();
    t.equal(await t.page.evaluate(() => getComputedStyle(document.querySelector('#screen .atmos-title')).display), 'none', 'the title layer is hidden');
  },
});
tests.push({
  name: 'S4-03 the map moves in each world: steam, mist, lamps, petals, glints, blossom',
  async run(t) {
    await t.game('act', 'progress', W1);
    await t.game('scene', 'map');
    await t.waitIdle();
    const want = { 1: ['at-st'], 2: ['at-st', 'at-cl'], 3: ['at-lp', 'at-ff'], 4: ['at-pt'], 5: ['at-gl'], 6: ['at-pt', 'at-ff'] };
    for (let w = 1; w <= 6; w++) {
      const a = await atmos(t, `#screen .atmos-w${w}`);
      t.expect(a && want[w].every((k) => a.kinds.includes(k)) && a.animated && a.inert, `world ${w}: ${a && a.kinds.join(' ')}`);
    }
    const tappable = await t.page.evaluate(() => { const n = document.querySelector('.node.current') || document.querySelector('.node'); const r = n.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!(el && el.closest('.node')); });
    t.expect(tappable, 'the level nodes stay on top and tappable');
    await t.page.waitForTimeout(800);
    await t.shot('S4-03-map', { wait: false });
  },
});
tests.push({
  name: 'S4-03 the world-complete card and the results card have slow motion behind them',
  async run(t) {
    for (const w of [3, 4]) {
      await t.game('scene', 'world', String(w));
      await t.waitIdle();
      const a = await atmos(t, '#modal .atmos');
      t.expect(a && a.n > 0 && a.inert, `world ${w} complete has a layer of ${a && a.n}`);
      const cardOnTop = await t.page.evaluate(() => { const c = document.querySelector('#modal .card').getBoundingClientRect(); const el = document.elementFromPoint(c.x + c.width / 2, c.y + 20); return !!el.closest('.card'); });
      t.expect(cardOnTop, 'the card is above it');
    }
    await t.game('scene', 'world', '4');
    await t.page.waitForTimeout(600);
    await t.shot('S4-03-world-complete', { wait: false });
    await t.game('scene', 'game', 'w4-02');
    await t.game('scene', 'win');
    await t.waitIdle();
    const w = await atmos(t, '#modal .atmos');
    t.expect(w && w.n > 0 && w.shown, 'the results card has it too');
    await t.page.waitForTimeout(600);
    await t.shot('S4-03-results', { wait: false });
  },
});
tests.push({
  name: 'S4-03 in a level, Central Avenue has fireflies, Oaklawn petals, the lakes glints, Garvan blossom, and Bathhouse Row none',
  async run(t) {
    const counts = {};
    for (const [lv, w] of [['w1-02', 1], ['w3-02', 3], ['w4-02', 4], ['w5-02', 5], ['w6-02', 6]]) {
      await t.game('newGame', { level: lv, seed: 6, tips: false });
      await t.waitIdle();
      await t.page.waitForTimeout(1600);
      counts[w] = (await t.state()).motes;
    }
    t.equal(counts[1], 0, 'world 1: steam only');
    for (const w of [3, 4, 5, 6]) t.expect(counts[w] > 0, `world ${w}: ${counts[w]} motes`);
    await t.game('newGame', { level: 'w4-02', seed: 6, tips: false });
    await t.waitIdle();
    await t.page.waitForTimeout(1500);
    await t.shot('S4-03-level-petals', { wait: false });
  },
});
tests.push({
  name: 'S4-03 reduced motion removes the level motes',
  reducedMotion: true,
  async run(t) {
    await t.game('newGame', { level: 'w3-02', seed: 6, tips: false });
    await t.waitIdle();
    await t.page.waitForTimeout(1200);
    t.equal((await t.state()).motes, 0, 'no motes');
  },
});
