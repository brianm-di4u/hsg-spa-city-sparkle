// Blockers, tokens, goals, stars, Encore, lose and boosters.
import { B, at, swapXY, events, findGroups, resolveBooster, resolveEncore, tileAt } from './lib/engine.mjs';

export const tests = [
  {
    name: 'tufa stone: adjacent match removes one layer; a line blast removes one layer per stone',
    node: true,
    run(t) {
      const s = B(['a b a c', 'S2 a d e'], { spawners: false });
      t.equal(findGroups(s).length, 0, 'no initial match');
      swapXY(s, [1, 1], [1, 0]);
      t.equal(s.stone[at(s, 0, 1)], 1, 'S2 → S1');
      const s2 = B(['a b c', 'S1 S2 d'], { spawners: false });
      s2.boosters.line = 1;
      resolveBooster(s2, 'line', { cell: at(s2, 0, 1), dir: 'h' });
      t.equal(s2.stone[at(s2, 0, 1)], 0, 'S1 broken'); t.equal(s2.stone[at(s2, 1, 1)], 1, 'S2 → S1');
      t.equal(tileAt(s2, 2, 1) && tileAt(s2, 2, 1).k, 2, 'the c above fell into the cleared cell');
    },
  },
  {
    name: 'mineral crust: clearing the piece above removes a layer and counts toward the goal',
    node: true,
    run(t) {
      const s = B(['a^1 b a', 'c a d'], { spawners: false, goals: [{ type: 'crust', need: 1 }] });
      swapXY(s, [1, 1], [1, 0]);
      t.equal(s.crust[at(s, 0, 0)], 0, 'crust cleared');
      t.equal(s.goals[0].have, 1, 'goal counted');
      t.expect(s.phase === 'encore' || s.phase === 'won', `goal met → ${s.phase}`);
    },
  },
  {
    name: 'padlocked safe: the piece cannot move, still matches, and loses one lock per hit',
    node: true,
    run(t) {
      const s = B(['aL1 b a', 'c a d'], { spawners: false });
      t.equal(swapXY(s, [0, 0], [1, 0]).reason, 'blocked', 'a locked piece cannot swap');
      const r = swapXY(s, [1, 1], [1, 0]);
      t.equal(r.valid, true, 'locked piece completes a match');
      t.equal(s.lock[at(s, 0, 0)], 0, 'lock removed');
      const h0 = events(r, 'hit').filter((e) => e.i === at(s, 0, 0));
      t.equal(h0.map((e) => e.layer).join(), 'lock', 'only the lock is hit; the piece survives');
    },
  },
  {
    name: 'algae moss: an adjacent match clears it; with no moss hit it spreads once per move',
    node: true,
    run(t) {
      const s = B(['a b a', 'M a d', 'b c e'], { spawners: false });
      swapXY(s, [1, 1], [1, 0]);
      t.equal(s.moss[at(s, 0, 1)], 0, 'moss cleared by the adjacent match');
      const s2 = B(['a b a d', 'c a e f', 'd e f c', 'M f c e'], { spawners: false });
      const r = swapXY(s2, [1, 1], [1, 0]);
      t.equal(events(r, 'spread').length, 1, 'one spread event');
      t.equal(s2.moss.reduce((a, b) => a + b, 0), 2, 'moss grew to two cells');
      t.expect(s2.moss[at(s2, 0, 2)] || s2.moss[at(s2, 1, 3)], 'grew into a neighbour');
    },
  },
  {
    name: 'steam fog: a fogged piece does not match; an adjacent match clears the fog only',
    node: true,
    run(t) {
      const s = B(['aF b a', 'c a d'], { spawners: false });
      t.equal(swapXY(s, [1, 1], [1, 0]).reason, 'nomatch', 'fogged piece is inert');
      const s2 = B(['a b a c', 'eF a d f'], { spawners: false });
      swapXY(s2, [1, 1], [1, 0]);
      t.equal(s2.fog[at(s2, 0, 1)], 0, 'fog lifted');
      t.equal(tileAt(s2, 0, 1) && tileAt(s2, 0, 1).k, 4, 'piece under the fog survives');
    },
  },
  {
    name: 'bath tokens: fall to a drain and are collected; immune to blasts; spawn by quota',
    node: true,
    run(t) {
      const s = B(['a T b', 'b c_ a', 'c a b'], { spawners: false, goals: [{ type: 'tokens', need: 1 }] });
      s.boosters.hammer = 1; s.boosters.line = 1;
      resolveBooster(s, 'line', { cell: at(s, 0, 0), dir: 'h' });
      t.expect(s.tile.some((x) => x && x.k === 'T') || s.tokens.collected === 1, 'token survives a line blast');
      const s2 = B(['a T b', 'b c_ a', 'c a b'], { spawners: false, goals: [{ type: 'tokens', need: 1 }] });
      s2.boosters.hammer = 1;
      const r = resolveBooster(s2, 'hammer', { cell: at(s2, 1, 1) });
      t.equal(s2.tokens.collected, 1, 'collected at the drain');
      t.equal(events(r, 'collect').length, 1, 'collect event');
      t.expect(s2.phase === 'encore' || s2.phase === 'won', 'token goal met');
      const s3 = B(['a>> b c', 'b c a', 'c a b'], { goals: [{ type: 'tokens', need: 1 }] });
      Object.assign(s3.tokens, { total: 1, maxOnBoard: 1, everyMoves: 0, sinceSpawn: 0 });
      s3.boosters.hammer = 1;
      resolveBooster(s3, 'hammer', { cell: at(s3, 0, 0) });
      t.equal(s3.tokens.spawned, 1, 'token spawned at the token spawner');
    },
  },
  {
    name: 'goals: score and collect complete; stars follow thresholds; Encore scores apart',
    node: true,
    run(t) {
      const s = B(['a b a d e', 'c a c e d', 'd e f d c', 'e d c f e'], { moves: 6, goals: [{ type: 'collect', kind: 0, need: 3 }] });
      s.stars = [100, 1000, 1e9];
      swapXY(s, [1, 1], [1, 0]);
      t.equal(s.goals[0].have, 3, 'three quartz collected');
      t.equal(s.phase, 'encore', 'won with moves left → Encore');
      t.equal(s.starsWon, 1, 'one star at 180+ points');
      const before = s.score;
      const r = resolveEncore(s);
      t.equal(r.valid, true, 'encore resolved');
      t.equal(s.phase, 'won', 'phase won'); t.equal(s.movesLeft, 0, 'moves used up');
      t.equal(s.score, before, 'encore does not change the star score');
      t.expect(s.encoreScore > 0, `encore scored ${s.encoreScore}`);
      t.equal(events(r, 'encore').length, 5, 'five leftover moves fired');
    },
  },
  {
    name: 'lose when out of moves; +5 moves booster resumes play',
    node: true,
    run(t) {
      const s = B(['a b a d', 'c a c e', 'd e f d'], { moves: 1, goals: [{ type: 'score', need: 1e6 }] });
      const r = swapXY(s, [1, 1], [1, 0]);
      t.equal(s.phase, 'lost', 'lost'); t.equal(events(r, 'end')[0] && events(r, 'end')[0].result, 'lost', 'end event');
      t.equal(swapXY(s, [0, 0], [1, 0]).valid, false, 'no swaps after losing');
      t.equal(resolveBooster(s, 'plus5').valid, false, 'needs a booster');
      s.boosters.plus5 = 1;
      t.equal(resolveBooster(s, 'plus5').valid, true, '+5 used');
      t.equal(s.phase, 'play', 'back in play'); t.equal(s.movesLeft, 5, 'five moves');
    },
  },
  {
    name: 'boosters: hammer breaks one cell, shuffle reshuffles, none without stock',
    node: true,
    run(t) {
      const s = B(['a b c', 'b S2 a', 'c a b']);
      t.equal(resolveBooster(s, 'hammer', { cell: at(s, 1, 1) }).reason, 'none', 'no stock');
      s.boosters.hammer = 1; s.boosters.shuffle = 1;
      resolveBooster(s, 'hammer', { cell: at(s, 1, 1) });
      t.equal(s.stone[at(s, 1, 1)], 1, 'hammer removes one stone layer');
      const r = resolveBooster(s, 'shuffle');
      t.equal(events(r, 'reshuffle').length, 1, 'reshuffle event');
      t.equal(s.movesLeft, 20, 'boosters spend no move');
    },
  },
];
