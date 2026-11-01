// Blockers and goals in the real view, boosters through the tray, the lose dialog (AC10-AC20).
const shots = [
  ['07-tufa', ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d'], [{ type: 'stone', need: 6 }]],
  ['07-crust', ['a^1 b a c e', 'c a^2 d e d^1', 'd e^1 b d c', 'e d c^2 b e', 'b c e a d'], [{ type: 'crust', need: 7 }]],
  ['07-lock', ['aL1 b a c e', 'c a dL2 e d', 'd e b d c', 'eL1 d c b e', 'b c e a d'], [{ type: 'lock', need: 4 }]],
  ['07-moss', ['a b a c e', 'M a d e d', 'd e b d M', 'e d c b e', 'M c e a d'], [{ type: 'moss', need: 0 }]],
  ['07-fog', ['a b a c e', 'eF a d e d', 'd e bF d c', 'e d c b e', 'b cF e a d'], [{ type: 'score', need: 5000 }]],
  ['07-tokens', ['a T> b c e', 'c a d e d', 'd e b d c', 'e d c b e', 'b c_ e a d'], [{ type: 'tokens', need: 1 }]],
];
const px = (L, x, y) => [L.bx + (x + 0.5) * L.cell, L.by + (y + 0.5) * L.cell];
async function tapCell(t, x, y) {
  const L = (await t.state()).layout;
  if (t.viewport === 'mobile') await t.tap(px(L, x, y)); else await t.page.mouse.click(...px(L, x, y));
}

export const tests = [
  {
    name: 'each blocker renders, and the HUD tracks its goal',
    async run(t) {
      await t.game('newGame', { level: 'w2-01', seed: 3, tips: false });
      for (const [name, board, goals] of shots) {
        await t.game('act', 'board', board, { moves: 10, goals });
        await t.waitIdle();
        await t.shot(name);
      }
      await t.game('act', 'board', shots[0][1], { moves: 10, goals: shots[0][2] });
      await t.waitIdle();
      await t.game('act', 'swap', [1, 1], [1, 0]);
      await t.waitIdle(8000);
      t.equal((await t.state()).goals[0].have, 1, 'one tufa layer broken');
      await t.shot('07-goals-hud');
    },
  },
  {
    name: 'boosters from the tray: hammer, line, shuffle, +5',
    async run(t) {
      await t.game('newGame', { level: 'w2-01', seed: 3, tips: false });
      const stock = { hammer: 2, line: 2, shuffle: 2, plus5: 2 };
      await t.game('act', 'progress', {}, stock);
      await t.game('act', 'board', ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d'], { moves: 10, boosters: stock });
      await t.waitIdle();
      await t.page.locator('.booster[data-booster="hammer"]').click();
      t.equal((await t.state()).armed, 'hammer', 'hammer armed');
      await t.shot('07-booster-armed', { wait: false });
      await tapCell(t, 1, 2);
      await t.waitIdle(8000);
      let s = await t.state();
      t.equal(s.board.cells[2 * 5 + 1].stone, 2, 'hammer took one layer off S3');
      t.equal(s.boosters.hammer, 1, 'hammer spent');
      await t.page.locator('.booster[data-booster="line"]').click();
      await t.page.locator('.booster[data-booster="line"]').click();
      t.equal((await t.state()).armed, 'line', 'line armed (column)');
      await tapCell(t, 4, 3);
      await t.waitIdle(8000);
      s = await t.state();
      t.equal(s.board.cells[1 * 5 + 4].stone, 0, 'the column line broke S1 in column 4');
      await t.page.locator('.booster[data-booster="shuffle"]').click();
      await t.game('act', 'clock', 300);
      await t.waitFrames(3);
      await t.shot('07-reshuffle', { wait: false });
      await t.game('act', 'clock', null);
      await t.waitIdle(8000);
      const moves = (await t.state()).movesLeft;
      await t.page.locator('.booster[data-booster="plus5"]').click();
      await t.waitIdle(4000);
      t.equal((await t.state()).movesLeft, moves + 5, '+5 moves');
      t.equal((await t.state()).movesUsed, 0, 'boosters spend no move');
    },
  },
  {
    name: 'out of moves shows the lose dialog with +5 and Retry',
    async run(t) {
      await t.game('newGame', { level: 'w2-01', seed: 3, tips: false });
      await t.game('act', 'progress', {}, { plus5: 1 });
      await t.game('act', 'board', ['a b a c e', 'c a d e d', 'd e b d c', 'e d c b e', 'b c e a d'], { moves: 1, goals: [{ type: 'score', need: 1e6 }], boosters: { plus5: 1 } });
      await t.waitIdle();
      await t.game('act', 'swap', [1, 1], [1, 0]);
      await t.waitIdle(8000);
      await t.waitForAnimations();
      const s = await t.state();
      t.equal(s.phase, 'lost', 'lost'); t.equal(s.scene, 'lose', 'lose dialog');
      t.equal(await t.page.locator('[data-act="plus"]').count(), 1, '+5 offered');
      t.equal(await t.page.locator('[data-act="retry"]').count(), 1, 'Retry offered');
      await t.shot('07-lose');
      await t.page.locator('[data-act="plus"]').click();
      await t.waitIdle(4000);
      const s2 = await t.state();
      t.equal(s2.phase, 'play', 'back in play'); t.equal(s2.movesLeft, 5, 'five moves');
    },
  },
];
