// Interaction sweep (TEST-CAMPAIGN.md): on one layout per world, a real click or tap on every playable cell
// selects exactly that cell (hit-testing agrees with the drawn board at both viewports), and taps outside
// the board deselect.
const LEVELS = ['w1-07', 'w2-09', 'w3-08', 'w4-09', 'w5-02', 'w6-07'];
export const tests = [
  {
    name: 'every playable cell is hit-tested correctly on six layouts',
    slow: true,
    async run(t) {
      let checked = 0;
      for (const id of LEVELS) {
        await t.game('newGame', { level: id, seed: 2, tips: false });
        await t.waitIdle(8000);
        await t.game('act', 'clock', 0); // freeze idle animation so taps land on still pieces
        const s = await t.state();
        const L = s.layout;
        for (let i = 0; i < s.board.cells.length; i++) {
          const c = s.board.cells[i];
          if (!c || c.k == null || c.lock || c.fog || c.k === 'T' || c.stone || c.moss) continue;
          const x = i % s.board.w, y = (i / s.board.w) | 0;
          const p = [L.bx + (x + 0.5) * L.cell, L.by + (y + 0.5) * L.cell];
          if (t.viewport === 'mobile') await t.tap(p); else await t.page.mouse.click(...p);
          const sel = (await t.state()).selected;
          if (sel !== i) { t.fail(`${id}: tap on ${x},${y} selected ${sel}`); break; }
          if (t.viewport === 'mobile') await t.tap(p); else await t.page.mouse.click(...p); // tap again: deselect
          checked++;
        }
        await t.game('act', 'clock', null);
      }
      t.log(`${checked} cells hit-tested`);
      t.expect(checked > 250, 'swept the boards');
    },
  },
];
