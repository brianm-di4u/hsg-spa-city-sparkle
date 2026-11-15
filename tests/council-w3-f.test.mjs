// Council wave 3, batch F: dialogs, the board for a screen reader, the lore card of each stop, a pre-level pick
// (S2-10, S2-03, S4-01, S2-20).
// Nothing here depends on chance: boards are seeded, waits are for conditions, and every check reads state or the DOM.
import fs from 'node:fs';

export const tests = [];

const LORE = JSON.parse(fs.readFileSync(new URL('../data/lore.json', import.meta.url), 'utf8'));
const cardsOf = (w) => LORE.filter((c) => c.world === w);
const NEVER = { moves: 40, goals: [{ type: 'score', need: 900000 }], stars: [1000, 2000, 3000] };
const ROWS = ['a b a c e', 'S2 a d e S1', 'd S3 b d c', 'e d c b e', 'b c e a d'];
const live = (t) => t.page.locator('#live').innerText();
const liveHas = (t, text) => t.page.waitForFunction((x) => document.getElementById('live').textContent.includes(x), text, { timeout: 5000 });

// --- S2-10: a dialog shuts out the page behind it ------------------------------------------------------------------------
tests.push({
  name: 'S2-10 while a dialog is open the page behind it is inert and Tab stays inside, and it is live again after',
  async run(t) {
    await t.game('newGame', { level: 'w1-02', seed: 3, tips: false });
    await t.waitIdle();
    t.equal(await t.page.evaluate(() => ['hud', 'tray', 'screen', 'board-sr'].some((id) => document.getElementById(id).inert)), false, 'nothing is inert during play');
    await t.game('scene', 'pause');
    await t.waitIdle();
    t.equal(await t.page.evaluate(() => ['hud', 'tray', 'screen', 'board-sr'].every((id) => document.getElementById(id).inert)), true, 'the HUD, tray, screen and board are inert under Pause');
    const seen = new Set();
    for (let i = 0; i < 14; i++) {
      await t.page.keyboard.press('Tab');
      seen.add(await t.page.evaluate(() => (document.getElementById('modal').contains(document.activeElement) ? 'in' : (document.activeElement.className || document.activeElement.tagName))));
    }
    t.equal([...seen].join(), 'in', `fourteen Tab presses never leave the dialog (${[...seen].join()})`);
    const reach = await t.page.evaluate(() => { const b = document.querySelector('.booster'); b.focus(); return document.activeElement === b; });
    t.equal(reach, false, 'a booster behind the dialog cannot take focus');
    await t.page.keyboard.press('Escape');
    await t.waitIdle();
    t.equal(await t.page.evaluate(() => ['hud', 'tray', 'screen', 'board-sr'].some((id) => document.getElementById(id).inert)), false, 'closing the dialog makes the page live again');
    t.equal(await t.page.evaluate(() => { const b = document.querySelector('.booster'); b.focus(); return document.activeElement === b; }), true, 'and a booster takes focus');
  },
});
tests.push({
  name: 'S2-10 Settings On/Off and choice buttons are at least 44 px tall',
  async run(t) {
    await t.game('scene', 'settings');
    await t.waitIdle();
    const sizes = await t.page.evaluate(() => [...document.querySelectorAll('#modal .chip-btn')].map((b) => Math.round(b.getBoundingClientRect().height)));
    t.expect(sizes.length >= 10, `Settings has its chip buttons (${sizes.length})`);
    t.expect(sizes.every((h) => h >= 44), `every one is 44 px or more (smallest ${Math.min(...sizes)})`);
    await t.checkLayout();
    await t.shot('S2-10-settings-chips');
  },
});

// --- S2-03: the board in words -------------------------------------------------------------------------------------------
async function board(t) {
  await t.game('newGame', { level: 'w1-02', seed: 3, tips: false });
  await t.game('act', 'board', ROWS, NEVER);
  await t.waitIdle();
}
const cellText = (t, x, y) => t.page.evaluate(([cx, cy]) => document.querySelector(`#board-sr [role="row"][aria-rowindex="${cy + 1}"] [role="gridcell"][aria-colindex="${cx + 1}"]`)?.textContent ?? null, [x, y]);
tests.push({
  name: 'S2-03 a hidden grid names every cell of the board, and follows the board after a move',
  async run(t) {
    await board(t);
    const grid = await t.page.evaluate(() => { const g = document.getElementById('board-sr'); return { role: g.getAttribute('role'), hidden: g.hidden, rows: g.querySelectorAll('[role="row"]').length, cells: g.querySelectorAll('[role="gridcell"]').length, label: g.getAttribute('aria-label') }; });
    t.equal(grid.role, 'grid', 'it is a grid');
    t.equal(grid.hidden, false, 'it is exposed while a level is played');
    t.equal(grid.rows, 5, 'five rows');
    t.equal(grid.cells, 25, 'twenty-five cells');
    t.equal(await cellText(t, 0, 1), 'tufa rock, 2 layers', 'a stone is a tufa rock with its layers');
    t.equal(await cellText(t, 4, 1), 'tufa rock, 1 layer', 'one layer is singular');
    t.equal(await cellText(t, 0, 0), 'quartz', 'a piece is named by its kind (a is quartz)');
    // After a legal swap the mirror shows the new board.
    const legal = await t.game('act', 'legal');
    const [[ax, ay], [bx, by]] = legal[0];
    const before = [await cellText(t, ax, ay), await cellText(t, bx, by)];
    await t.game('act', 'swap', [ax, ay], [bx, by]);
    await t.waitIdle();
    const after = [await cellText(t, ax, ay), await cellText(t, bx, by)];
    t.expect(before[0] !== null && after[0] !== null && (before[0] !== after[0] || before[1] !== after[1]), `the grid changed after the move (${before.join(' / ')} -> ${after.join(' / ')})`);
  },
});
tests.push({
  name: 'S2-03 the arrow keys say where the cursor is and what is there; Enter says it is picked up; H says the hint in words',
  async run(t) {
    await board(t);
    await t.page.keyboard.press('ArrowRight');
    await liveHas(t, 'row 3, column');
    const first = await live(t);
    t.expect(/^row \d, column \d, /.test(first), `the cursor move is spoken as a row, a column and the contents ("${first}")`);
    await t.page.keyboard.press('ArrowDown');
    await t.page.waitForFunction((f) => document.getElementById('live').textContent !== f && /^row \d/.test(document.getElementById('live').textContent), first, { timeout: 5000 });
    await t.page.keyboard.press('Enter');
    await liveHas(t, 'picked up');
    t.expect((await live(t)).includes('Arrow toward a neighbour'), 'and it says what to do next');
    await t.page.keyboard.press('Escape');
    await t.page.keyboard.press('h');
    await liveHas(t, 'Hint: swap row');
    const hint = await live(t);
    t.expect(/Hint: swap row \d, column \d, [^.]+ with row \d, column \d, [^.]+\./.test(hint), `the hint names both cells ("${hint}")`);
    const legal = await t.game('act', 'legal');
    const named = legal.some(([[ax, ay], [bx, by]]) => hint.includes(`row ${ay + 1}, column ${ax + 1},`) && hint.includes(`row ${by + 1}, column ${bx + 1},`));
    t.expect(named, 'and the pair is a real legal swap');
  },
});
tests.push({
  name: 'S2-03 a move that changes a goal says how much is left, and the grid is not exposed away from play',
  async run(t) {
    await t.game('newGame', { level: 'w1-02', seed: 3, tips: false });
    await t.game('act', 'board', ['a b a c e', 'd a d e b', 'd b b d c', 'e d c b e', 'b c e a d'], { moves: 30, goals: [{ type: 'collect', kind: 0, need: 9 }], stars: [1000, 2000, 3000] });
    await t.waitIdle();
    // a swap that completes three quartz in the top row: [1,1] (a) with [1,0] (b)
    const r = await t.game('act', 'swap', [1, 1], [1, 0]);
    t.equal(r.valid, true, 'the swap is legal');
    await t.waitIdle();
    await liveHas(t, 'more quartz');
    t.expect(/Collect \d+ more quartz\./.test(await live(t)) || (await live(t)).includes('Collect'), `the goal left is spoken ("${await live(t)}")`);
    await t.game('scene', 'title');
    await t.waitIdle();
    t.equal(await t.page.evaluate(() => document.getElementById('board-sr').hidden), true, 'the grid is hidden away from a level');
  },
});

// --- S4-01: each stop gives the card about it ----------------------------------------------------------------------------
tests.push({
  name: 'S4-01 the card a stop gives is about that stop, not the nth card of its world',
  async run(t) {
    const asks = [['w3-04', 'The Ohio Club, 1905'], ['w3-05', null], ['w2-01', 'The Display Spring'], ['w1-03', 'The Oldest on the Row'], ['w1-10', 'The Row Completed'], ['w6-03', 'Running of the Tubs'], ['w4-03', 'Into the Alligator Farm']];
    for (const [id, title] of asks) {
      await t.game('newGame', { level: id, seed: 3, tips: false });
      await t.waitIdle();
      await t.game('act', 'win');
      await t.page.waitForSelector('#modal .lore h4');
      const shown = await t.page.locator('#modal .lore h4').innerText();
      if (title) t.equal(shown, title, `${id} shows "${title}"`);
      else t.expect(!['Radio at the Arlington', 'Lum and Abner'].includes(shown), `${id} (Medical Arts Tower) does not show the radio cards ("${shown}")`);
    }
  },
});
tests.push({
  name: 'S4-01 every world still gives each of its ten cards from exactly one stop, and the Scrapbook agrees',
  async run(t) {
    await t.game('act', 'save', { lore: LORE.map((c) => c.id) });
    for (let w = 1; w <= 6; w++) {
      await t.game('scene', 'scrapbook', w);
      await t.waitIdle();
      const titles = await t.page.locator('#modal .scrap .lore h4').allInnerTexts();
      t.equal(titles.length, 10, `world ${w} lists ten cards`);
      t.equal(new Set(titles).size, 10, `world ${w}: none twice`);
      t.equal([...titles].sort().join('|'), cardsOf(w).map((c) => c.title).sort().join('|'), `world ${w}: they are its ten cards`);
    }
    // a blank names the stop that really holds the card: w3-04 holds the Ohio Club
    await t.game('act', 'save', { lore: [] });
    await t.game('scene', 'scrapbook', 3);
    await t.waitIdle();
    t.expect((await t.page.locator('#modal').innerText()).includes('Win stop 3-4, Ohio Club, to find it.'), 'the fourth blank of world 3 sends the player to the Ohio Club');
    await t.game('act', 'save', { lore: [] });
  },
});

// --- S2-20: bring one booster ---------------------------------------------------------------------------------------------
const specials = (t) => t.page.evaluate(() => window.__game.engineState().tile.map((x, i) => (x && x.s ? [i, x.s] : null)).filter(Boolean));
async function intro(t, id, boosters) {
  await t.game('act', 'progress', { 'w1-01': { stars: 3, best: 1000 }, 'w1-02': { stars: 3, best: 1000 }, 'w1-03': { stars: 3, best: 1000 }, 'w1-04': { stars: 3, best: 1000 }, 'w1-05': { stars: 3, best: 1000 } }, boosters);
  await t.game('scene', 'intro', id);
  await t.page.waitForSelector('#modal .actions');
  await t.waitIdle();
}
tests.push({
  name: 'S2-20 the intro card offers Start with, only for what is held and not on a lesson, and Nothing is the default',
  async run(t) {
    await intro(t, 'w1-05', { hammer: 1, line: 0, shuffle: 1, plus5: 1 });
    const chips = await t.page.locator('#modal [data-load]').allInnerTexts();
    t.equal(chips.join(), 'Nothing,Hot Stone', 'with a Hammer and no Line: Nothing and Hot Stone');
    t.equal(await t.page.locator('#modal [data-load=""]').getAttribute('aria-pressed'), 'true', 'Nothing is pressed');
    await t.checkLayout();
    await t.shot('S2-20-intro-start-with');
    await t.page.locator('#modal [data-load="hammer"]').click();
    t.equal(await t.page.locator('#modal [data-load="hammer"]').getAttribute('aria-pressed'), 'true', 'Hot Stone is pressed after a tap');
    t.expect((await t.page.locator('#load-note').innerText()).includes('Spends one Hammer'), 'a line says what it costs');
    await t.checkLayout();
    await t.shot('S2-20-intro-hot-stone-chosen');
    await intro(t, 'w1-05', { hammer: 0, line: 0, shuffle: 1, plus5: 1 });
    t.equal(await t.page.locator('#modal [data-load]').count(), 0, 'with no Hammer or Line the row is not there');
    await intro(t, 'w1-01', { hammer: 1, line: 1, shuffle: 1, plus5: 1 });
    t.equal(await t.page.locator('#modal [data-load]').count(), 0, 'and a lesson level (w1-01) does not have it');
  },
});
tests.push({
  name: 'S2-20 choosing Hot Stone spends a Hammer for a Hot Stone near the middle; Cascade spends a Line; Nothing spends nothing; it is saved',
  async run(t) {
    await intro(t, 'w1-05', { hammer: 2, line: 1, shuffle: 1, plus5: 1 });
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    let s = await t.state();
    t.equal(s.boosters.hammer, 2, 'Nothing: the Hammers are all still there');
    t.equal((await specials(t)).length, 0, 'and no special on the board');
    await intro(t, 'w1-05', { hammer: 2, line: 1, shuffle: 1, plus5: 1 });
    await t.page.locator('#modal [data-load="hammer"]').click();
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    s = await t.state();
    t.equal(s.boosters.hammer, 1, 'Hot Stone: one Hammer is spent');
    t.equal(s.saveBoosters.hammer, 1, 'and the save agrees');
    const sp = await specials(t);
    t.equal(sp.length, 1, 'one special is on the board');
    t.equal(sp[0][1], 'b', 'it is a Hot Stone');
    const w = s.board.w, h = s.board.h, x = sp[0][0] % w, y = (sp[0][0] / w) | 0;
    t.expect(Math.abs(x - (w - 1) / 2) <= 1.5 && Math.abs(y - (h - 1) / 2) <= 1.5, `near the middle (${x},${y} of ${w}x${h})`);
    t.equal(s.movesUsed, 0, 'no move has been used');
    t.expect((await t.page.locator('#board-sr').innerText()).includes('Hot Stone'), 'the screen-reader grid names it');
    await t.shot('S2-20-hot-stone-on-board');
    await t.reload();
    s = await t.state();
    t.equal(s.saveBoosters.hammer, 1, 'a reload does not give the Hammer back');
    await intro(t, 'w1-06', { hammer: 1, line: 1, shuffle: 1, plus5: 1 });
    await intro(t, 'w1-05', { hammer: 1, line: 1, shuffle: 1, plus5: 1 });
    await t.page.locator('#modal [data-load="line"]').click();
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    s = await t.state();
    t.equal(s.boosters.line, 0, 'Cascade: the Line is spent');
    t.equal((await specials(t))[0][1], 'h', 'and a Cascade is on the board');
  },
});
tests.push({
  name: 'S2-20 a Restart does not bring the pick back, and a tutorial level is untouched',
  async run(t) {
    await intro(t, 'w1-05', { hammer: 1, line: 0, shuffle: 1, plus5: 1 });
    await t.page.locator('#modal [data-load="hammer"]').click();
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    await t.game('scene', 'pause');
    await t.page.locator('#modal [data-act="restart"]').click();
    await t.waitIdle();
    const s = await t.state();
    t.equal((await specials(t)).length, 0, 'a restarted level has no free special');
    t.equal(s.saveBoosters.hammer, 0, 'and the Hammer stays spent, as Restart says');
  },
});
