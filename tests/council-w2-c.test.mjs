// Council wave 2, batch C: stars after the Encore (S3-01).
import fs from 'node:fs';
import { B, swapXY, events, resolveEncore } from './lib/engine.mjs';
import { starsFor } from '../src/js/engine/goals.js';
import { playLevel } from '../tools/bots.mjs';

const KEY = 'spa-city-sparkle:v1';
const LEVELS = JSON.parse(fs.readFileSync(new URL('../data/levels.json', import.meta.url), 'utf8'));
const stored = (t) => t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);

export const tests = [];

// =================================================================================================================
// S3-01: stars are counted after the Encore
// =================================================================================================================
tests.push({
  name: 'S3-01 the Encore can raise the stars: they are counted on the goal score plus the Encore',
  node: true,
  run(t) {
    const s = B(['a b a d e', 'c a c e d', 'd e f d c', 'e d c f e'], { moves: 6, goals: [{ type: 'collect', kind: 0, need: 3 }] });
    s.stars = [100, 1000, 1e9];
    swapXY(s, [1, 1], [1, 0]);
    t.equal(s.phase, 'encore', 'won with moves left');
    t.equal(s.starsWon, 1, 'one star when the goals are met');
    s.stars = [100, s.score + 1, 1e9]; // the second star is one point above the goal score: only the Encore can reach it
    const goalScore = s.score;
    const r = resolveEncore(s);
    t.equal(s.score, goalScore, 'the goal score itself is untouched');
    t.expect(s.encoreScore > 1, `the Encore scored ${s.encoreScore}`);
    t.equal(s.starsWon, 2, 'two stars once the Encore is counted');
    t.equal(events(r, 'end')[0].stars, 2, 'the end event carries the final stars');
    t.equal(s.starsWon, starsFor(s, goalScore + s.encoreScore), 'stars equal the stars of the total');
  },
});
tests.push({
  name: 'S3-01 stars won when the goals were met are the minimum: the Encore never lowers them',
  node: true,
  run(t) {
    const s = B(['a b a d e', 'c a c e d', 'd e f d c', 'e d c f e'], { moves: 6, goals: [{ type: 'collect', kind: 0, need: 3 }] });
    s.stars = [100, 1000, 1e9];
    swapXY(s, [1, 1], [1, 0]);
    s.starsWon = 3; // as if the provisional stars were higher than any total could give
    resolveEncore(s);
    t.equal(s.starsWon, 3, 'still three stars after the Encore');
  },
});
tests.push({
  name: 'S3-01 a win on the last move has no Encore and keeps its stars',
  node: true,
  run(t) {
    const s = B(['a b a d e', 'c a c e d', 'd e f d c', 'e d c f e'], { moves: 1, goals: [{ type: 'collect', kind: 0, need: 3 }] });
    s.stars = [100, 120, 1e9];
    swapXY(s, [1, 1], [1, 0]);
    t.equal(s.phase, 'won', 'won outright');
    t.equal(s.encoreScore, 0, 'no Encore score');
    t.equal(s.starsWon, starsFor(s), 'stars from the score');
  },
});
tests.push({
  name: 'S3-01 every level has rising star thresholds, the first at or above its score goal',
  node: true,
  run(t) {
    for (const l of LEVELS) {
      t.expect(l.stars.length === 3 && l.stars[0] < l.stars[1] && l.stars[1] < l.stars[2], `${l.id} stars ${l.stars.join('/')} rise`);
      const sg = l.goals.find((g) => g.type === 'score');
      if (sg) t.expect(l.stars[0] >= sg.need, `${l.id} first star ${l.stars[0]} covers the score goal ${sg.need}`);
    }
  },
});
// The share of won games that earn 1, 2 and 3 stars, per level, as the casual bot plays them with the Encore counted.
// BASE is what tools/balance.mjs measured on the branch before stars counted the Encore (200 seeds); the fit must stay close.
const BASE = {
  'w1-01': [0.42, 0.44, 0.14], 'w1-05': [0.48, 0.41, 0.11], 'w2-02': [0.45, 0.37, 0.18], 'w3-02': [0.58, 0.35, 0.08], 'w4-01': [0.51, 0.34, 0.15],
};
for (const id of Object.keys(BASE)) {
  tests.push({
    name: `S3-01 ${id}: the bots' star spread is still close to what it was before the Encore counted`,
    node: true,
    run(t) {
      const L = LEVELS.find((l) => l.id === id), res = [];
      for (let seed = 1; seed <= 120; seed++) { const r = playLevel(L, 1000 + seed, 'casual'); if (r.won) res.push(r); }
      const split = [1, 2, 3].map((n) => res.filter((r) => (n === 3 ? r.stars >= 3 : r.stars === n)).length / res.length);
      t.log(`${id}: ${res.length} wins, split ${split.map((x) => x.toFixed(2)).join('/')}, baseline ${BASE[id] ? BASE[id].join('/') : '-'}`);
      t.expect(res.length > 30, 'enough wins to measure');
      t.expect(split[2] > 0.03 && split[2] < 0.4, `3-star share ${split[2].toFixed(2)} stays in the 5 to 40 percent band`);
      if (BASE[id]) BASE[id].forEach((b, i) => t.expect(Math.abs(split[i] - b) <= 0.15, `${i + 1}-star share ${split[i].toFixed(2)} is within 15 points of ${b}`));
    },
  });
}

// =================================================================================================================
// S3-01 on screen: the results card says so and the save keeps the best
// =================================================================================================================
tests.push({
  name: 'S3-01 the results card shows goal score plus Encore, earns the stars on the total and saves the total',
  async run(t) {
    await t.game('newGame', { level: 'w1-02', seed: 5, tips: false });
    await t.game('act', 'board', ['a b a d e c', 'c a c e d b', 'd e f d c a', 'e d c f e b', 'b c e a d f'], { moves: 4, goals: [{ type: 'collect', kind: 0, need: 3 }], stars: [100, 200, 1e9] });
    await t.waitIdle();
    t.equal((await t.game('act', 'swap', [1, 1], [1, 0])).valid, true, 'winning swap');
    await t.waitIdle(15000);
    await t.waitForAnimations();
    const s = await t.state();
    t.equal(s.phase, 'won', 'won after the Encore');
    const total = s.score + s.encoreScore;
    t.expect(total >= 200, `goal ${s.score} plus Encore ${s.encoreScore} reaches the second star`);
    t.equal(s.stars, 2, 'two stars on the total');
    const card = await t.page.evaluate(() => ({ big: document.querySelector('#modal .result-score').dataset.to, sub: document.querySelector('#modal .result-sub').textContent, stars: document.querySelector('#modal .stars-big').getAttribute('aria-label') }));
    t.equal(+card.big, total, 'the big number is the total');
    t.expect(/Encore bonus/.test(card.sub) && /stars count both/.test(card.sub), `the card explains it: "${card.sub}"`);
    t.equal(card.stars, '2 of 3 stars', 'two stars shown');
    t.equal((await stored(t)).progress['w1-02'].best, total, 'the saved best is the total');
    await t.shot('S3-01-results-encore');
  },
});
tests.push({
  name: 'S3-01 a star already held is never taken away by a worse replay',
  async run(t) {
    await t.game('newGame', { level: 'w1-02', seed: 5, tips: false });
    await t.game('act', 'progress', { 'w1-02': { stars: 3, best: 99999 } });
    await t.game('act', 'board', ['a b a d e c', 'c a c e d b', 'd e f d c a', 'e d c f e b', 'b c e a d f'], { moves: 4, goals: [{ type: 'collect', kind: 0, need: 3 }], stars: [100, 1e8, 1e9] });
    await t.waitIdle();
    await t.game('act', 'swap', [1, 1], [1, 0]);
    await t.waitIdle(15000);
    await t.waitForAnimations();
    t.equal((await t.state()).stars, 1, 'this run earned one star');
    const p = (await stored(t)).progress['w1-02'];
    t.equal(p.stars, 3, 'the save still holds three stars');
    t.equal(p.best, 99999, 'and the better best');
  },
});
