// Move evaluation shared by the in-game hint and the balance bots (tools/bots.mjs).
// Lookahead never touches the live RNG: candidates resolve on a clone whose spawn stream is
// reseeded per candidate ("fair lookahead"), so a bot can't peek at the real refills.
import { cloneState } from './grid.js';
import { legalMoves } from './moves.js';
import { resolveSwap } from './resolve.js';
import { goalProgress } from './goals.js';
import { hash32 } from './rng.js';

export function evaluateMoves(s, opts = {}) {
  const moves = legalMoves(s);
  const base = goalProgress(s), baseScore = s.score, baseSpecials = s.stats.specials;
  const out = [];
  moves.forEach(([a, b], j) => {
    const c = cloneState(s);
    c.rng.spawn = hash32('look', s.seed, s.movesUsed, j) || 1;
    c.rng.misc = hash32('lookm', s.seed, s.movesUsed, j) || 2;
    const r = resolveSwap(c, a, b, { fast: true });
    if (!r.valid) return;
    const won = c.phase === 'encore' || c.phase === 'won';
    const gp = goalProgress(c) - base;
    const specials = c.stats.specials - baseSpecials;
    const combo = r.combo ? 6 : 0;
    const value = (won ? 1000 : 0) + gp * 100 + specials * 4 + combo + (c.score - baseScore) / 1000;
    out.push({ a, b, value, gp, score: c.score - baseScore, won });
  });
  out.sort((x, y) => y.value - x.value || x.a - y.a || x.b - y.b);
  return out;
}

export function bestMove(s) { const m = evaluateMoves(s); return m.length ? [m[0].a, m[0].b] : null; }
