// Balance bots: play a level with the real engine (no view). Used by tools/balance.mjs and the level tests.
//   random       a random legal move
//   greedy       one-ply best by goal progress, specials and score (the in-game hint's evaluator, src/js/engine/ai.js)
//   score        one-ply best by score only
//   casual       a casual-player proxy: the greedy move 70% of the time, a random legal move otherwise.
//                Level move limits are tuned against this bot (tools/gen-levels.mjs), and its win rate is
//                checked against each level's band (tools/balance.mjs).
import { newGame } from '../src/js/engine/game.js';
import { legalMoves } from '../src/js/engine/moves.js';
import { resolveSwap } from '../src/js/engine/resolve.js';
import { evaluateMoves } from '../src/js/engine/ai.js';
import { hash32 } from '../src/js/engine/rng.js';

export function playLevel(level, seed, strategy = 'greedy', opts = {}) {
  const s = newGame(level, seed);
  const cap = opts.maxMoves || 200;
  let pick = hash32('bot', seed, level.id);
  while (s.phase === 'play' && s.movesUsed < cap) {
    let a, b;
    pick = hash32(pick, s.movesUsed, 7);
    if (strategy === 'random' || (strategy === 'casual' && pick % 100 < 30)) {
      const lm = legalMoves(s);
      if (!lm.length) break;
      pick = hash32(pick, s.movesUsed);
      [a, b] = lm[pick % lm.length];
    } else {
      const ev = evaluateMoves(s);
      if (!ev.length) break;
      if (strategy === 'score') ev.sort((x, y) => y.score - x.score || x.a - y.a);
      ({ a, b } = ev[0]);
    }
    const r = resolveSwap(s, a, b, { fast: true });
    if (!r.valid) throw new Error(`${level.id} seed ${seed}: bot chose an invalid move`);
  }
  const won = s.phase === 'won' || s.phase === 'encore';
  return { won, moves: s.movesUsed, left: s.movesLeft, score: s.score, stars: won ? s.starsWon : 0,
    reshuffles: s.stats.reshuffles, recolors: s.stats.recolors, capped: s.stats.capped, cascade: s.cascadeMax,
    progress: s.goals.map((g) => (g.type === 'moss' ? (g.start ? 1 - g.have / g.start : 1) : Math.min(1, g.have / (g.need || 1)))) };
}
