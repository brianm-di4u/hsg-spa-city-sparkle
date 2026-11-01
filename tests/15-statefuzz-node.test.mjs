// State fuzz (mechanics test campaign, TEST-CAMPAIGN.md): random layouts with every blocker, random specials,
// random legal moves and boosters. After every action: settle/no-match/move invariants, timeline replay
// reproduces the state, tile conservation, JSON round-trip determinism (AC5, AC43).
import { boardFromAscii, cloneState, hashState, invariants, replayDiff, conservation, legalMoves, resolveSwap, resolveBooster, toAscii } from './lib/engine.mjs';
import { fillInitial, hasMove, reshuffle } from '../src/js/engine/moves.js';
import { findGroups } from '../src/js/engine/match.js';
import { resolveNeeds } from '../src/js/engine/goals.js';
import { makeRng, next, int } from '../src/js/engine/rng.js';

function randomBoard(seed) {
  const r = makeRng(seed);
  const R = () => next(r, 'misc');
  const w = 5 + int(r, 'misc', 5), h = 5 + int(r, 'misc', 5);
  const tokens = R() < 0.3;
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      let c;
      const p = R();
      if (y > 0 && p < 0.07) c = '#';
      else if (y > 0 && p < 0.12) c = 'S' + (1 + int(r, 'misc', 3));
      else if (y > 0 && p < 0.14) c = 'M';
      else c = '?';
      if (c === '?') {
        const q = R();
        if (q < 0.15) c += '^' + (1 + int(r, 'misc', 2));
        if (y > 1 && q > 0.92) c += 'L' + (1 + int(r, 'misc', 2));
        else if (y > 1 && q > 0.88) c += 'F';
      }
      if (y === 0) c += tokens && Math.abs(x - (w >> 1)) <= 1 ? '>>' : '>';
      if (tokens && y === h - 1 && c.startsWith('?')) c += '_';
      row.push(c);
    }
    rows.push(row.join(' '));
  }
  const { state: s, fill } = boardFromAscii(rows, { withFill: true, seed, moves: 40, goals: [{ type: 'score', need: 1e9 }], weights: [1, 1, 1, 1, 1, R() < 0.5 ? 1 : 0] });
  if (tokens) Object.assign(s.tokens, { total: 4, maxOnBoard: 2, everyMoves: 2, sinceSpawn: 2 });
  fillInitial(s, fill);
  // sprinkle specials on plain tiles
  s.tile.forEach((t, i) => { if (t && typeof t.k === 'number' && !s.lock[i] && !s.fog[i]) { const q = R(); if (q < 0.04) t.s = ['h', 'v', 'b'][int(r, 'misc', 3)]; else if (q < 0.05) { t.k = 'C'; t.s = null; } } });
  if (findGroups(s).length || !hasMove(s)) reshuffle(s);
  resolveNeeds(s);
  s.boosters = { hammer: 3, line: 3, shuffle: 2, plus5: 0 };
  return s;
}

export const tests = [
  {
    name: 'state fuzz: 400 random boards × up to 30 actions keep every invariant',
    node: true,
    slow: true,
    run(t) {
      let actions = 0, cascades = 0, specials = 0, collected = 0;
      const SEEDS = +(process.env.FUZZ_SEEDS || 400);
      for (let seed = 1; seed <= SEEDS; seed++) {
        const s = randomBoard(seed);
        if (findGroups(s).length) continue; // a rare unshufflable start; skip
        const r = makeRng(seed * 7);
        for (let a = 0; a < 30 && s.phase === 'play'; a++) {
          const pre = cloneState(s);
          let res;
          const roll = next(r, 'misc');
          if (roll < 0.08 && s.boosters.hammer > 0) res = resolveBooster(s, 'hammer', { cell: int(r, 'misc', s.tile.length) });
          else if (roll < 0.12 && s.boosters.line > 0) res = resolveBooster(s, 'line', { cell: int(r, 'misc', s.tile.length), dir: next(r, 'misc') < 0.5 ? 'h' : 'v' });
          else {
            const lm = legalMoves(s);
            if (!lm.length) { t.fail(`seed ${seed}: no legal move in play\n${toAscii(s).join('\n')}`); return; }
            res = resolveSwap(s, ...lm[int(r, 'misc', lm.length)]);
            if (!res.valid) { t.fail(`seed ${seed}: legal move rejected`); return; }
          }
          if (!res.valid) continue;
          actions++;
          if ((res.waves || 0) > 1) cascades++;
          specials += res.timeline.events.filter((e) => e.t === 'special').length;
          collected += res.timeline.events.filter((e) => e.t === 'collect').length;
          const errs = invariants(s, `seed ${seed} action ${a}`);
          const diff = replayDiff(pre, res, s);
          if (diff.length) errs.push(`seed ${seed} action ${a}: replay mismatch ${diff.slice(0, 3).join('; ')}`);
          if (!conservation(pre, res, s)) errs.push(`seed ${seed} action ${a}: tiles not conserved`);
          // determinism: the same action on a JSON copy of the pre-state gives the same result
          if (a % 5 === 0 && res.timeline.move) {
            const copy = JSON.parse(JSON.stringify(pre));
            resolveSwap(copy, res.timeline.move.a, res.timeline.move.b);
            if (hashState(copy) !== hashState(s)) errs.push(`seed ${seed} action ${a}: not deterministic`);
          }
          if (errs.length) { errs.slice(0, 3).forEach((e) => t.fail(e)); t.log(toAscii(pre).join('\n')); return; }
        }
      }
      t.log(`${actions} actions, ${cascades} cascades of 2+ waves, ${specials} specials made, ${collected} tokens collected`);
      t.expect(actions > 5000, 'enough actions exercised');
    },
  },
];
