// Real input: mouse drag, touch swipe, tap-tap, keyboard play and keyboard menus (PRD AC31-AC33).
const WIN_BOARD = ['a b a d e', 'c a c e d', 'd e b d c', 'e d c b e', 'b c e a d'];
async function cellPx(t, x, y) {
  const L = (await t.state()).layout;
  return [L.bx + (x + 0.5) * L.cell, L.by + (y + 0.5) * L.cell];
}
async function freshBoard(t, opts = {}) {
  await t.game('newGame', { level: 'w1-01', seed: 3, tips: false });
  await t.game('act', 'board', WIN_BOARD, { moves: 6, goals: [{ type: 'score', need: 1e9 }], ...opts });
  await t.waitIdle();
}

export const tests = [
  {
    name: 'mouse drag swaps two pieces',
    viewports: ['desktop'],
    async run(t) {
      await freshBoard(t);
      const [ax, ay] = await cellPx(t, 1, 1), [bx, by] = await cellPx(t, 1, 0);
      await t.page.mouse.move(ax, ay); await t.page.mouse.down();
      await t.page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await t.page.mouse.move(bx, by, { steps: 4 });
      await t.page.mouse.up();
      await t.waitIdle(8000);
      t.equal((await t.state()).movesUsed, 1, 'one move made by dragging');
    },
  },
  {
    name: 'mouse tap-tap swaps two pieces',
    viewports: ['desktop'],
    async run(t) {
      await freshBoard(t);
      const a = await cellPx(t, 1, 1), b = await cellPx(t, 1, 0);
      await t.page.mouse.click(...a);
      t.expect((await t.state()).selected >= 0, 'first tap selects');
      await t.page.mouse.click(...b);
      await t.waitIdle(8000);
      t.equal((await t.state()).movesUsed, 1, 'tap-tap swapped');
    },
  },
  {
    name: 'touch swipe and tap-tap swap pieces; touch targets are big enough',
    viewports: ['mobile'],
    async run(t) {
      await freshBoard(t);
      await t.touchDrag(await cellPx(t, 1, 1), await cellPx(t, 1, 0), { steps: 6 });
      await t.waitIdle(8000);
      t.equal((await t.state()).movesUsed, 1, 'swipe swapped');
      await freshBoard(t);
      await t.tap(await cellPx(t, 1, 1));
      await t.tap(await cellPx(t, 1, 0));
      await t.waitIdle(8000);
      t.equal((await t.state()).movesUsed, 1, 'tap-tap swapped');
      const box = await t.page.locator('.booster').first().boundingBox();
      t.expect(box.width >= 44 && box.height >= 44, `booster buttons at least 44 px (${box.width}x${box.height})`);
      await t.game('newGame', { level: 'w1-07', seed: 3, tips: false });
      await t.waitIdle();
      const L = (await t.state()).layout;
      t.expect(L.cell >= 40, `9x9 cells at least 40 px on a phone (${L.cell})`);
    },
  },
  {
    name: 'keyboard: cursor, select and arrow-swap win a level',
    async run(t) {
      await freshBoard(t, { goals: [{ type: 'collect', kind: 0, need: 3 }], stars: [100, 200, 1e9] });
      await t.page.keyboard.press('ArrowLeft');
      await t.page.keyboard.press('ArrowUp');
      t.equal((await t.state()).cursor, 6, 'cursor moved to (1,1)');
      await t.shot('04-cursor', { wait: false });
      await t.page.keyboard.press('Enter');
      t.equal((await t.state()).selected, 6, 'Enter selects');
      await t.page.keyboard.press('ArrowUp');
      await t.waitIdle(15000);
      t.equal((await t.state()).phase, 'won', 'won with the keyboard');
    },
  },
  {
    name: 'keyboard reaches the menus: title, map, intro, play, pause',
    viewports: ['desktop'],
    async run(t) {
      await t.waitIdle();
      await t.page.keyboard.press('Enter');
      await t.waitIdle();
      t.equal((await t.state()).scene, 'map', 'Enter on the focused Play opens the map');
      await t.page.keyboard.press('Enter');
      await t.waitIdle();
      t.equal((await t.state()).scene, 'intro', 'Enter on the focused level opens its intro');
      await t.page.keyboard.press('Enter');
      await t.waitIdle();
      t.equal((await t.state()).scene, 'game', 'Enter plays');
      await t.page.keyboard.press('Enter');
      t.equal((await t.state()).tip, false, 'Enter dismisses the tip');
      await t.page.keyboard.press('p');
      await t.waitIdle();
      t.equal((await t.state()).scene, 'pause', 'P pauses');
      await t.page.keyboard.press('Escape');
      t.equal((await t.state()).scene, 'game', 'Esc resumes');
    },
  },
];
