// Engine core: level parsing, initial boards, swaps, gravity, cascades, determinism, reshuffle.
import { B, at, swapXY, events, invariants, replayDiff, conservation, cloneState, hashState, findGroups, legalMoves, hasMove, toAscii, resolveSwap } from './lib/engine.mjs';
import { stateFromLevel } from '../src/js/engine/grid.js';
import { settle } from '../src/js/engine/gravity.js';
import { reshuffle } from '../src/js/engine/moves.js';
import { newGame } from '../src/js/engine/game.js';

const open9 = { id: 't-open', moves: 25, goals: [{ type: 'score', need: 1e9 }], stars: [1, 2, 3], grid: { cells: Array(9).fill('.........') } };
const holes = { id: 't-holes', moves: 25, goals: [{ type: 'score', need: 1e9 }], stars: [1, 2, 3], grid: {
  cells: ['##.....##', '#.......#', '.........', '....#....', '...###...', '....#....', '.........', '#.......#', '##.....##'],
  block: ['.........', '.........', '..2...1..', '.........', '.........', '.........', '..1...2..', '.........', '.........'] } };

function randomPlay(L, seeds, movesPer, t, label) {
  let n = 0, waves2 = 0, bad = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const s = newGame(L, seed);
    for (let m = 0; m < movesPer && s.phase === 'play'; m++) {
      const lm = legalMoves(s);
      if (!lm.length) { t.fail(`${label} seed ${seed}: no legal moves in play`); return; }
      const [a, b] = lm[(seed * 31 + m * 17) % lm.length];
      const pre = cloneState(s);
      const r = resolveSwap(s, a, b);
      n++;
      if (!r.valid) { t.fail(`${label} seed ${seed}: legal move rejected`); bad++; }
      if (r.waves >= 2) waves2++;
      const errs = invariants(s, `${label} seed ${seed} move ${m}`);
      const diff = replayDiff(pre, r, s);
      if (diff.length) errs.push(`${label} seed ${seed} move ${m}: replay mismatch ${diff.slice(0, 3).join('; ')}`);
      if (!conservation(pre, r, s)) errs.push(`${label} seed ${seed} move ${m}: tile count not conserved`);
      if (errs.length) { errs.slice(0, 3).forEach((e) => t.fail(e)); t.log(toAscii(pre).join('\n')); return; }
    }
  }
  return { n, waves2, bad };
}

export const tests = [
  {
    name: 'level parse: masks, layers, flow defaults',
    node: true,
    run(t) {
      const { state: s, fill } = stateFromLevel(holes);
      t.equal(s.w, 9, 'width'); t.equal(s.h, 9, 'height');
      t.equal(s.mask.filter((m) => !m).length, 4 + 2 + 1 + 3 + 1 + 2 + 4, 'hole count');
      t.equal(s.stone[at(s, 2, 2)], 2, 'stone layers'); t.equal(s.stone[at(s, 6, 2)], 1, 'stone layers 2');
      t.equal(s.spawner[at(s, 2, 0)], 1, 'top playable cell spawns'); t.equal(s.spawner[at(s, 0, 2)], 1, 'spawner below a hole');
      t.equal(s.spawner[at(s, 4, 0)], 1, 'centre column spawns at top');
      t.expect(fill[at(s, 4, 2)] && !fill[at(s, 2, 2)], 'stone cells are not filled');
    },
  },
  {
    name: 'initial boards: no matches, at least one move, 100 seeds × 2 layouts',
    node: true,
    run(t) {
      for (const L of [open9, holes]) for (let seed = 1; seed <= 100; seed++) {
        const s = newGame(L, seed);
        if (findGroups(s).length) { t.fail(`${L.id} seed ${seed}: initial match`); break; }
        if (!hasMove(s)) { t.fail(`${L.id} seed ${seed}: no initial move`); break; }
        if (s.stats.recolors) t.log(`${L.id} seed ${seed} used the recolour fallback`);
        const empty = s.tile.filter((x, i) => !x && s.mask[i] && !s.stone[i] && !s.moss[i]).length;
        if (empty) { t.fail(`${L.id} seed ${seed}: ${empty} empty cells`); break; }
      }
    },
  },
  {
    name: 'invalid swap bounces back and spends nothing; non-adjacent is blocked',
    node: true,
    run(t) {
      const s = B(['a b c', 'b c a', 'c a b']);
      const h = hashState(s);
      const r = swapXY(s, [0, 0], [1, 0]);
      t.equal(r.valid, false, 'no match → invalid'); t.equal(r.reason, 'nomatch', 'reason');
      t.equal(r.timeline.events.map((e) => e.t).join(','), 'swap,swapBack', 'bounce timeline');
      t.equal(hashState(s), h, 'state unchanged'); t.equal(s.movesLeft, 20, 'no move spent');
      t.equal(swapXY(s, [0, 0], [2, 0]).reason, 'blocked', 'non-adjacent');
      t.equal(swapXY(s, [0, 0], [1, 1]).reason, 'blocked', 'diagonal');
    },
  },
  {
    name: 'a match of three clears, scores 180 and spends a move',
    node: true,
    run(t) {
      const s = B(['a b a d', 'c a c e', 'd e f d'], { spawners: false });
      const r = swapXY(s, [1, 1], [1, 0]);
      t.equal(r.valid, true, 'valid');
      t.equal(events(r, 'match').length, 1, 'one group');
      t.equal(events(r, 'hit').filter((e) => e.layer === 'tile').length, 3, 'three tiles cleared');
      t.equal(s.score, 180, 'score 3 × 60'); t.equal(s.movesLeft, 19, 'move spent'); t.equal(s.movesUsed, 1, 'moves used');
    },
  },
  {
    name: 'gravity: vertical falls, stone blocks, starved cells fill diagonally',
    node: true,
    run(t) {
      const s = B(['a b c', 'd S1 e', 'f . a', 'b . c'], { spawners: false });
      const r = settle(s);
      t.equal(toAscii(s).join('|'), '. . c|b S1 e|a d a|b f c', 'diagonal slides fill under the stone');
      t.expect(r.paths.length === 4, `four tiles moved (${r.paths.length})`);
      const s2 = B(['a b', '# c', '. d'], { spawners: false });
      settle(s2);
      t.equal(toAscii(s2).join('|'), 'a .|# b|c d', 'a tile never falls through a hole; the cell below fills by a slide');
    },
  },
  {
    name: 'random play: invariants, timeline replay and conservation (2 layouts, 40 seeds × 25 moves)',
    node: true,
    run(t) {
      const r1 = randomPlay(open9, 40, 25, t, 'open');
      const r2 = randomPlay(holes, 40, 25, t, 'holes');
      if (r1 && r2) {
        t.log(`moves ${r1.n + r2.n}, cascades ≥2 waves: ${r1.waves2 + r2.waves2}`);
        t.expect(r1.waves2 > 0, 'cascades happen');
      }
    },
  },
  {
    name: 'cascade multiplier rises per wave',
    node: true,
    run(t) {
      for (let seed = 1; seed < 60; seed++) {
        const s = newGame(open9, seed);
        for (let m = 0; m < 25 && s.phase === 'play'; m++) {
          const lm = legalMoves(s);
          const r = resolveSwap(s, ...lm[(m * 7) % lm.length]);
          if (r.waves >= 2) {
            const sc = events(r, 'score').filter((e) => e.wave === 1)[0];
            t.equal(events(r, 'wave')[1].mult, 2, 'wave 1 multiplier ×2');
            t.expect(sc && sc.mult === 2, 'score event at ×2');
            return;
          }
        }
      }
      t.fail('no cascade found');
    },
  },
  {
    name: 'determinism: same seed and moves give the same state and timeline; JSON round trip resolves the same',
    node: true,
    run(t) {
      const play = (s0) => {
        const s = s0, tl = [];
        for (let m = 0; m < 20 && s.phase === 'play'; m++) {
          const lm = legalMoves(s);
          tl.push(JSON.stringify(resolveSwap(s, ...lm[(m * 11) % lm.length]).timeline));
        }
        return [hashState(s), tl.join('\n')];
      };
      const a = play(newGame(holes, 42)), b = play(newGame(holes, 42));
      t.equal(a[0], b[0], 'state hash'); t.equal(a[1] === b[1], true, 'timelines identical');
      const s = newGame(holes, 7);
      const c = play(JSON.parse(JSON.stringify(s)));
      t.equal(play(s)[0], c[0], 'round-trip state resolves identically');
      t.expect(newGame(holes, 1).tile.map((x) => x && x.k).join() !== newGame(holes, 2).tile.map((x) => x && x.k).join(), 'different seeds differ');
    },
  },
  {
    name: 'reshuffle: a dead board becomes playable with no matches',
    node: true,
    run(t) {
      const s = B(['a b c a', 'b c a b', 'c a b c', 'a b c a'], { weights: [1, 1, 1, 0, 0, 0] });
      t.equal(hasMove(s), false, 'dead board');
      const r = reshuffle(s);
      t.expect(hasMove(s), 'has a move after reshuffle');
      t.equal(findGroups(s).length, 0, 'no matches after reshuffle');
      t.expect(r.moves.length === 16, 'every tile reported');
      t.log('mode', r.mode);
    },
  },
];
