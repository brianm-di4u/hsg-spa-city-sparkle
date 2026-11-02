// Specials: creation shapes, placement, orientation, activation patterns and the combo matrix.
import { B, at, swapXY, events, findGroups, resolveBooster, toAscii, invariants, legalMoves } from './lib/engine.mjs';
import { specialCandidates } from '../src/js/engine/match.js';

const BASE5 = ['a b c d e', 'c d e a b', 'e a b c d', 'b c d e a', 'd e a b c'];
const withCells = (rows, edits) => {
  const g = rows.map((r) => r.split(' '));
  for (const [x, y, v] of edits) g[y][x] = v;
  return g.map((r) => r.join(' '));
};
const wave0 = (r) => {
  const w = events(r, 'wave')[0];
  return r.timeline.events.filter((e) => e.beat === w.beat);
};
const tileHits = (evs) => evs.filter((e) => e.t === 'hit' && e.layer === 'tile');
const noMatches = (t, s, label) => t.equal(findGroups(s).length, 0, `${label}: board starts with no matches`);

export const tests = [
  {
    name: 'Cascade: a vertical swap making four in a row gives a column Cascade on the moved-into cell',
    node: true,
    run(t) {
      const s = B(['a a b a', 'c d a e', 'e c d c'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [2, 1], [2, 0]);
      const sp = events(r, 'special');
      t.equal(sp.length, 1, 'one special'); t.equal(sp[0] && sp[0].s, 'v', 'orientation follows the swap axis');
      t.equal(sp[0] && sp[0].at, at(s, 2, 0), 'placed on the cell the piece moved into');
      t.equal(sp[0] && sp[0].shape, 'g', 'Cascade shape');
    },
  },
  {
    name: 'Cascade: a horizontal swap making four in a column gives a row Cascade',
    node: true,
    run(t) {
      const s = B(['a b', 'a c', 'b a', 'a d'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [1, 2], [0, 2]);
      const sp = events(r, 'special')[0];
      t.equal(sp && sp.s, 'h', 'row Cascade'); t.equal(sp && sp.at, at(s, 0, 2), 'at the swap cell');
    },
  },
  {
    name: 'Cascade made in a cascade lies perpendicular to its run, in the middle of the run',
    node: true,
    run(t) {
      const s = B(['c . b .', 'b b c b', 'd e d e'], { spawners: false });
      s.boosters.hammer = 1;
      const r = resolveBooster(s, 'hammer', { cell: at(s, 2, 1) });
      t.equal(r.valid, true, 'hammer used');
      const sp = events(r, 'special')[0];
      t.equal(sp && sp.s, 'v', 'horizontal run → column Cascade');
      t.equal(sp && sp.at, at(s, 1, 1), 'middle of the run of four');
      t.equal(s.boosters.hammer, 0, 'booster spent'); t.equal(s.movesLeft, 20, 'boosters spend no move');
    },
  },
  {
    name: 'Hot Stone: an L match makes a Hot Stone at the corner the piece moved into',
    node: true,
    run(t) {
      const s = B(['a b c', 'a c b', 'b a a', 'a c b'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [0, 3], [0, 2]);
      const sp = events(r, 'special')[0];
      t.equal(sp && sp.shape, 'b', 'Hot Stone'); t.equal(sp && sp.s, 'b', 'special code b'); t.equal(sp && sp.at, at(s, 0, 2), 'corner cell');
    },
  },
  {
    name: 'Hot Stone: a T with no swap cell is placed on the run intersection; parallel runs stay separate',
    node: true,
    run(t) {
      const s = B(['a a a', 'd a e', 'e a d'], { spawners: false });
      const g = findGroups(s);
      t.equal(g.length, 1, 'T is one group'); t.equal(g[0].type, 'b', 'T classifies as Hot Stone');
      t.equal(specialCandidates(s, g[0], null)[0], at(s, 1, 0), 'intersection first');
      const s2 = B(['a a a', 'b b b', 'c d e'], { spawners: false });
      const g2 = findGroups(s2);
      t.equal(g2.length, 2, 'two touching parallel runs are two groups');
      t.expect(g2.every((x) => x.type === null), 'plain threes');
    },
  },
  {
    name: 'Spring Crystal: five in a row beats the other shapes',
    node: true,
    run(t) {
      const s = B(['a a b a a', 'c d a e c'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [2, 1], [2, 0]);
      const sp = events(r, 'special')[0];
      t.equal(sp && sp.shape, 'C', 'Crystal'); t.equal(sp && sp.k, 'C', 'Crystal tile'); t.equal(sp && sp.at, at(s, 2, 0), 'at the swap cell');
      const s2 = B(['a a a a a', 'b c a d e', 'c d a e b'], { spawners: false });
      t.equal(findGroups(s2)[0].type, 'C', 'five + a cross is still a Crystal');
    },
  },
  {
    name: 'Cascade fires its whole row when matched',
    node: true,
    run(t) {
      const s = B(['aH a c b', 'd e a e', 'b d b d'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [2, 1], [2, 0]);
      const f = events(r, 'fire')[0];
      t.equal(f && f.s, 'h', 'row Cascade fired');
      t.equal(f && f.cells.length, 4, 'all four row cells');
      t.expect(tileHits(wave0(r)).some((e) => e.i === at(s, 3, 0)), 'the far cell of the row was cleared');
    },
  },
  {
    name: 'Hot Stone fires a radius-2 diamond, then its aftershock where gravity moved it',
    node: true,
    run(t) {
      const s = B(['c d e f c', 'd e f c d', 'e f aB a c', 'f c d e a', 'c d e f c'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [4, 3], [4, 2]);
      const fires = events(r, 'fire').filter((e) => e.s === 'b' || e.s === 'B');
      t.equal(fires.length, 2, 'fires twice');
      t.equal(fires[0] && fires[0].cells.length, 13, 'diamond of 13 cells');
      t.equal(fires[1] && fires[1].after, true, 'second is the aftershock');
      t.expect(fires[1] && fires[1].at !== fires[0].at, 'aftershock from where it fell');
      t.equal(fires[0] && fires[0].id, fires[1] && fires[1].id, 'same tile');
      t.expect(!s.tile.some((x) => x && x.s === 'B'), 'stone gone after the aftershock');
    },
  },
  {
    name: 'Spring Crystal + piece clears every piece of that colour',
    node: true,
    run(t) {
      const s = B(['C b a', 'a c b', 'b a c'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'Cx', 'crystal swap');
      const w = tileHits(wave0(r));
      t.equal(w.length, 4, 'crystal + three magnolias');
      t.expect(w.filter((e) => e.k === 1).length === 3, 'all three b pieces');
    },
  },
  {
    name: 'combo Cascade + Cascade: row and column through the target',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[0, 0, 'aH'], [1, 0, 'bV']]), { spawners: false });
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'GG', 'combo kind');
      t.equal(tileHits(wave0(r)).length, 9, 'row 0 + column 1 = 9 cells');
    },
  },
  {
    name: 'combo Cascade + Hot Stone: three rows and three columns',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[0, 0, 'aH'], [1, 0, 'bB']]), { spawners: false });
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'GB', 'combo kind');
      t.equal(tileHits(wave0(r)).length, 19, 'rows 0-1 and columns 0-2');
    },
  },
  {
    name: 'combo Hot Stone + Hot Stone: radius-4 diamond',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[0, 0, 'aB'], [1, 0, 'bB']]), { spawners: false });
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'BB', 'combo kind');
      let n = 0;
      for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (Math.abs(x - 1) + y <= 4) n++;
      t.equal(tileHits(wave0(r)).length, n, `diamond of ${n} cells`);
    },
  },
  {
    name: 'combo Crystal + Crystal hits every cell',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[0, 0, 'C'], [1, 0, 'C']]), { spawners: false });
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'CC', 'combo kind');
      t.equal(tileHits(wave0(r)).length, 25, 'all 25 cells');
    },
  },
  {
    name: 'combo Crystal + Cascade turns that colour into Cascades and fires them all',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[0, 0, 'C'], [1, 0, 'aH']]), { spawners: false });
      const plainA = s.tile.filter((x) => x && x.k === 0 && !x.s).length;
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'CG', 'combo kind');
      const conv = events(r, 'convert')[0];
      t.equal(conv && conv.tiles.length, plainA, 'every plain a converted');
      t.expect(conv && conv.tiles.every((c) => c.s === 'h' || c.s === 'v'), 'converted to Cascades');
      t.expect(events(r, 'fire').length >= plainA + 1, 'all of them fired');
      t.equal(invariants(s).filter((e) => !/no legal move/.test(e)).length, 0, 'board settles cleanly');
    },
  },
  {
    name: 'combo Crystal + Hot Stone turns that colour into Hot Stones (each with an aftershock)',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[0, 0, 'C'], [1, 0, 'aB']]), { spawners: false });
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.combo, 'CB', 'combo kind');
      const conv = events(r, 'convert')[0];
      t.expect(conv && conv.tiles.every((c) => c.s === 'b'), 'converted to Hot Stones');
      t.expect(!s.tile.some((x) => x && x.s === 'B'), 'no primed stone left');
      t.log(toAscii(s).join(' | '));
    },
  },
  {
    name: 'swipe-to-fire: a Cascade swiped onto a plain piece fires even with no match, keeping its orientation',
    node: true,
    run(t) {
      const s = B(['aH b c d', 'e c d e', 'b d e b'], { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.valid, true, 'legal'); t.equal(r.combo, null, 'not a combo');
      t.equal(events(r, 'combo').length, 0, 'no combo event');
      const f = events(r, 'fire');
      t.equal(f.length, 1, 'fires once'); t.equal(f[0] && f[0].s, 'h', 'row Cascade');
      t.equal(f[0] && f[0].at, at(s, 1, 0), 'fires where it landed');
      t.equal(f[0] && f[0].cells.length, 4, 'the whole row');
      t.equal(s.movesUsed, 1, 'spends a move');
      const v = B(['aV b c d', 'e c d e', 'b d e b'], { spawners: false });
      const rv = swapXY(v, [0, 0], [1, 0]);
      t.equal(events(rv, 'fire')[0] && events(rv, 'fire')[0].s, 'v', 'a column Cascade swiped sideways still sweeps its column');
    },
  },
  {
    name: 'swipe-to-fire: a Hot Stone swiped with no match bursts and gives its aftershock',
    node: true,
    run(t) {
      const s = B(withCells(BASE5, [[2, 2, 'bB']]), { spawners: false });
      noMatches(t, s, 'board');
      const r = swapXY(s, [2, 2], [3, 2]);
      t.equal(r.valid, true, 'legal');
      const fires = events(r, 'fire').filter((e) => e.s === 'b' || e.s === 'B');
      t.equal(fires.length, 2, 'burst + aftershock');
      t.equal(fires[0] && fires[0].at, at(s, 3, 2), 'bursts where it landed');
      t.equal(fires[0] && fires[0].cells.length, 12, 'radius-2 diamond, clipped by the right edge');
      t.equal(fires[1] && fires[1].after, true, 'second is the aftershock');
      t.expect(!s.tile.some((x) => x && x.s === 'B'), 'no primed stone left');
    },
  },
  {
    name: 'swipe-to-fire: a swipe that also makes a match resolves both, and the special fires once',
    node: true,
    run(t) {
      const s = B(['aH c c d', 'c e f e', 'd f e f'], { spawners: false });
      noMatches(t, s, 'board');
      const id = s.tile[at(s, 0, 0)].id;
      const r = swapXY(s, [0, 0], [0, 1]);
      t.expect(events(r, 'match').some((e) => e.k === 2), 'the c pieces matched');
      t.equal(events(r, 'fire').filter((e) => e.id === id).length, 1, 'the Cascade fired exactly once');
      t.equal(events(r, 'fire')[0] && events(r, 'fire')[0].at, at(s, 0, 1), 'from its new row');
    },
  },
  {
    name: 'swipe-to-fire: a special still cannot swap with a token, a padlocked or a fogged piece',
    node: true,
    run(t) {
      for (const [row, label] of [[['aH T', 'b c'], 'token'], [['aH bL1', 'b c'], 'padlock'], [['aH bF', 'b c'], 'fog']]) {
        const s = B(row, { spawners: false });
        const r = swapXY(s, [0, 0], [1, 0]);
        t.equal(r.valid, false, `${label}: illegal`); t.equal(s.movesUsed, 0, `${label}: no move spent`);
      }
    },
  },
  {
    name: 'swipe-to-fire: special swipes count as legal moves (hints, reshuffle checks)',
    node: true,
    run(t) {
      const s = B(['aH b c', 'c d e', 'b e d'], { spawners: false });
      noMatches(t, s, 'board');
      const m = legalMoves(s).map(([a, b]) => `${a}-${b}`);
      t.expect(m.includes(`${at(s, 0, 0)}-${at(s, 1, 0)}`), 'sideways swipe listed');
      t.expect(m.includes(`${at(s, 0, 0)}-${at(s, 0, 1)}`), 'downward swipe listed');
    },
  },
];
