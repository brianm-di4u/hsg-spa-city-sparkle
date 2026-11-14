// Council wave 2, batch C: stars after the Encore (S3-01) and the Daily Challenge (S3-02).
import fs from 'node:fs';
import { B, swapXY, events, resolveEncore } from './lib/engine.mjs';
import { starsFor } from '../src/js/engine/goals.js';
import { playLevel } from '../tools/bots.mjs';
import { dailyLevel, dailyPool, dailyInto, cleanDaily, streakNow, addDays, freshDaily, KEEP_DAYS } from '../src/js/ui/daily.js';

const KEY = 'spa-city-sparkle:v1';
const LEVELS = JSON.parse(fs.readFileSync(new URL('../data/levels.json', import.meta.url), 'utf8'));
const W1 = {};
for (let n = 1; n <= 10; n++) W1[`w1-${String(n).padStart(2, '0')}`] = { stars: 2, best: 1000 };
const stored = (t) => t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
const openWorld1 = async (t) => { await t.game('act', 'progress', W1); };
const D1 = '2026-03-05';

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

// =================================================================================================================
// S3-02: the Daily Challenge, pure parts
// =================================================================================================================
tests.push({
  name: 'S3-02 the daily pick is the same for everyone on a date, varies by day and is a fair level',
  node: true,
  run(t) {
    const pool = dailyPool(LEVELS);
    t.expect(pool.length >= 10, `${pool.length} levels in the pool`);
    t.expect(pool.every((l) => l.moves > 0 && l.world <= 3 && !(l.tags || []).some((g) => g.startsWith('intro:'))), 'no tutorial levels, nothing past world 3, a fixed move count');
    const a = dailyLevel(LEVELS, D1), b = dailyLevel(LEVELS, D1);
    t.equal(JSON.stringify(a), JSON.stringify(b), 'same date, same level and seed');
    t.equal(a.level.mode, 'daily', 'daily mode');
    t.equal(a.level.moves, LEVELS.find((l) => l.id === a.from).moves, "the source level's move count");
    t.expect(!('tip' in a.level), 'no tutorial tip');
    const seen = new Set(), seeds = new Set();
    let prev = null, repeats = 0;
    for (let i = 0; i < 120; i++) {
      const k = addDays('2026-01-01', i), p = dailyLevel(LEVELS, k);
      seen.add(p.from); seeds.add(p.seed);
      if (prev === p.from) repeats++;
      prev = p.from;
    }
    t.equal(repeats, 0, 'never the same level two days running');
    t.expect(seen.size >= Math.min(10, pool.length), `${seen.size} different levels over 120 days`);
    t.equal(seeds.size, 120, 'a different board seed every day');
    t.equal(dailyLevel(LEVELS, '2026-03-05').seed, 20260305, 'the seed is the date');
  },
});
tests.push({
  name: 'S3-02 the streak counts consecutive days, lapses after a miss and bests only rise',
  node: true,
  run(t) {
    const save = { daily: freshDaily(), soakBest: 0, soakDay: null };
    let o = dailyInto(save, { key: '2026-03-05', score: 9000, stars: 1, won: true });
    t.equal(o.streak, 1, 'first win');
    o = dailyInto(save, { key: '2026-03-05', score: 12000, stars: 2, won: true });
    t.equal(o.streak, 1, 'a second win on the same day does not add to the streak');
    t.equal(o.newBest, true, 'a better score the same day is a new best today');
    t.equal(save.daily.days['2026-03-05'].stars, 2, 'the better stars are kept');
    o = dailyInto(save, { key: '2026-03-05', score: 5000, stars: 1, won: true });
    t.equal(save.daily.days['2026-03-05'].best, 12000, 'a worse run does not lower the best');
    t.equal(save.daily.days['2026-03-05'].stars, 2, 'or the stars');
    t.equal(save.daily.days['2026-03-05'].tries, 3, 'three tries');
    o = dailyInto(save, { key: '2026-03-06', score: 8000, stars: 1, won: true });
    t.equal(o.streak, 2, 'the next day extends it');
    o = dailyInto(save, { key: '2026-03-07', score: 4000, stars: 0, won: false });
    t.equal(o.streak, 2, 'a lost attempt neither extends nor breaks it');
    t.equal(save.soakBest, 12000, 'the best ever is the best total');
    t.equal(save.soakDay, '2026-03-07', 'soakDay is the last day played');
    o = dailyInto(save, { key: '2026-03-10', score: 7000, stars: 1, won: true });
    t.equal(o.streak, 1, 'a missed day starts a new streak');
    t.equal(save.daily.bestStreak, 2, 'the longest streak is kept');
    t.equal(streakNow(save.daily, '2026-03-10'), 1, 'live today');
    t.equal(streakNow(save.daily, '2026-03-11'), 1, 'still alive tomorrow morning');
    t.equal(streakNow(save.daily, '2026-03-12'), 0, 'lapsed after a missed day');
    t.equal(addDays('2026-02-28', 1), '2026-03-01', 'day arithmetic crosses a month');
    t.equal(addDays('2026-01-01', -1), '2025-12-31', 'and a year');
  },
});
tests.push({
  name: 'S3-02 old days are pruned so the save does not grow without limit',
  node: true,
  run(t) {
    const save = { daily: freshDaily(), soakBest: 0, soakDay: null };
    for (let i = 0; i < 90; i++) dailyInto(save, { key: addDays('2026-01-01', i), score: 1000 + i, stars: 1, won: true });
    const keys = Object.keys(save.daily.days);
    t.equal(keys.length, KEEP_DAYS, `only the last ${KEEP_DAYS} days are kept`);
    t.equal(keys[keys.length - 1], addDays('2026-01-01', 89), 'the newest is there');
    t.equal(save.daily.streak, 90, 'the streak is not pruned');
  },
});
tests.push({
  name: 'S3-02 a damaged daily record reads as empty without throwing',
  node: true,
  run(t) {
    for (const bad of [null, 5, 'x', [], { days: [] }, { streak: -4, bestStreak: 'a', last: 7, days: { nope: { stars: 9 } } }]) {
      const d = cleanDaily(bad);
      t.equal(d.streak, 0, `streak 0 for ${JSON.stringify(bad)}`);
      t.equal(Object.keys(d.days).length, 0, 'no days');
    }
    const d = cleanDaily({ streak: 3, bestStreak: 1, last: '2026-03-05', days: { '2026-03-05': { stars: 9, best: -1, tries: 2, won: 1 } } });
    t.equal(d.bestStreak, 3, 'the longest streak is never below the current one');
    t.equal(d.days['2026-03-05'].stars, 3, 'stars are capped at three');
    t.equal(d.days['2026-03-05'].best, 0, 'a negative best reads as zero');
  },
});

// =================================================================================================================
// S3-02 on screen
// =================================================================================================================
tests.push({
  name: 'S3-02 the title offers the Daily Challenge, locked on a fresh save and open after Bathhouse Row',
  async run(t) {
    await t.game('dailyDate', D1);
    await t.game('scene', 'title');
    await t.waitIdle();
    const b = t.page.locator('#screen [data-act="daily"]');
    t.equal(await b.getAttribute('aria-disabled'), 'true', 'locked at first');
    t.expect(/Bathhouse Row/.test(await t.page.locator('#screen .menu-note').innerText()), 'the unlock hint names Bathhouse Row');
    await openWorld1(t);
    await t.game('scene', 'title');
    await t.waitIdle();
    t.equal(await b.getAttribute('aria-disabled'), null, 'open once world 1 is done');
    t.equal(await t.page.locator('#screen .menu-note').innerText(), 'A new board today', 'a new board is waiting');
    await t.shot('S3-02-title');
  },
});
tests.push({
  name: 'S3-02 the daily card shows today\'s board, the streak, the records and a calendar',
  async run(t) {
    await t.game('dailyDate', D1);
    await openWorld1(t);
    await t.game('act', 'save', { soakBest: 21500, soakDay: '2026-03-04', daily: { streak: 2, bestStreak: 4, last: '2026-03-04', days: { '2026-03-03': { stars: 2, best: 14000, tries: 1, won: true }, '2026-03-04': { stars: 3, best: 21500, tries: 2, won: true } } } });
    await t.game('scene', 'title');
    await t.waitIdle();
    t.expect(/2 days in a row/.test(await t.page.locator('#screen .menu-note').innerText()), 'the title note names the streak');
    await t.page.locator('#screen [data-act="daily"]').click();
    await t.waitIdle();
    t.equal((await t.state()).scene, 'daily-card', 'the card is open');
    const pick = await t.game('dailyPick', D1);
    const card = await t.page.evaluate(() => ({
      text: document.querySelector('#modal .card').innerText, cells: document.querySelectorAll('#modal .dc').length,
      today: document.querySelector('#modal .dc.today').getAttribute('aria-label'), yday: document.querySelectorAll('#modal .dc.s3').length,
      overflow: document.querySelector('#modal .card').scrollWidth > document.querySelector('#modal .card').clientWidth + 1,
      btn: [...document.querySelectorAll('#modal button')].map((b) => ({ t: b.textContent, h: b.getBoundingClientRect().height })),
    }));
    t.expect(card.text.includes(pick.name), `today's level "${pick.name}" is named`);
    t.expect(card.text.includes(`${pick.moves} moves`), 'with its fixed move count');
    t.expect(/Streak\s*2 days/i.test(card.text) && /Best ever\s*21,500/i.test(card.text) && /Longest streak: 4 days/.test(card.text), 'streak, best ever and longest streak are shown');
    t.equal(card.cells, 14, 'a calendar of fourteen days');
    t.equal(card.yday, 1, 'yesterday is a three-star day');
    t.expect(/March 5: not played/.test(card.today), `today is marked: ${card.today}`);
    t.expect(!card.overflow, 'nothing overflows the card');
    t.expect(card.btn.every((b) => b.h >= 44), 'buttons are at least 44 px tall');
    await t.checkLayout();
    await t.shot('S3-02-daily-card');
  },
});
tests.push({
  name: 'S3-02 playing the daily: a goal level with a fixed move count, the same board for the same date, Continue untouched',
  async run(t) {
    await t.game('dailyDate', D1);
    await openWorld1(t);
    await t.game('newGame', { level: 'w2-01', seed: 3, tips: false });
    await t.waitIdle();
    const legal = await t.game('act', 'legal');
    await t.game('act', 'swap', ...legal[0]);
    await t.waitIdle(8000);
    t.equal((await stored(t)).current.levelId, 'w2-01', 'a level is in progress');
    const pick = await t.game('dailyPick', D1);
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    const s1 = await t.state();
    t.equal(s1.scene, 'game', 'in play');
    t.equal(s1.level, 'daily', 'the daily level');
    t.equal(s1.movesLeft, pick.moves, 'its fixed move count');
    t.expect(s1.goals.length > 0, 'goals to meet');
    t.equal(JSON.stringify(s1.starThresholds), JSON.stringify(pick.stars), 'the level\'s stars');
    const hud = await t.page.evaluate(() => ({ world: document.getElementById('hud-world').textContent, name: document.getElementById('hud-name').textContent, thermo: document.querySelector('.thermo').offsetParent !== null, clipped: document.getElementById('hud-world').scrollWidth > document.getElementById('hud-world').clientWidth }));
    t.equal(hud.world, 'Daily challenge', 'the HUD says Daily challenge before a best exists');
    t.equal(hud.name, pick.name, 'and names the level');
    t.expect(hud.thermo && !hud.clipped, 'star bar shown, label not clipped');
    await t.shot('S3-02-daily-play');
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    t.equal((await t.state()).hash, s1.hash, 'playing it again gives the identical board');
    await t.game('dailyDate', '2026-03-06');
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    t.expect((await t.state()).hash !== s1.hash, 'the next day gives a different board');
    const st = await stored(t);
    t.equal(st.current.levelId, 'w2-01', 'the Continue slot still holds the journey level after all that');
    await t.game('scene', 'title');
    await t.waitIdle();
    t.expect(/Continue/.test(await t.page.locator('#screen [data-act="continue"]').innerText()), 'Continue is still offered');
  },
});
tests.push({
  name: 'S3-02 clearing the daily saves its stars, best, best ever and streak, shows them and survives a reload',
  async run(t) {
    await t.game('dailyDate', D1);
    await openWorld1(t);
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    await t.game('scene', 'win'); // the hook sets a three-star win with a 1,860 Encore bonus on the daily level
    await t.waitIdle();
    await t.waitForAnimations();
    let st = await stored(t);
    const day = st.daily.days[D1], s = await t.state();
    t.equal(day.stars, 3, 'three stars saved for the date');
    t.equal(day.won, true, 'marked won');
    t.expect(day.best >= 1860, `best ${day.best} includes the Encore`);
    t.equal(st.soakBest, day.best, 'the best ever is written');
    t.equal(st.soakDay, D1, 'the last day played is written');
    t.equal(st.daily.streak, 1, 'a streak of one');
    t.equal(Object.keys(st.progress).length, 10, 'the journey progress is not touched');
    const card = await t.page.evaluate(() => document.querySelector('#modal .card').innerText);
    t.expect(/Daily cleared!/.test(card) && /1 day in a row/.test(card) && /Encore bonus/.test(card), `the result card: ${card.replace(/\s+/g, ' ').slice(0, 160)}`);
    t.equal(s.scene, 'win', 'results scene');
    await t.shot('S3-02-daily-win');
    await t.reload();
    await t.waitIdle();
    await t.game('dailyDate', D1);
    s.daily = (await t.state()).daily;
    t.equal(s.daily.days[D1].stars, 3, 'the record is there after a reload');
    t.equal((await t.state()).soakBest, day.best, 'and the best ever');
    await t.game('scene', 'title');
    await t.waitIdle();
    t.equal(await t.page.locator('#screen .menu-note').innerText(), 'Today: 3 stars · 1 day in a row', 'the title note shows today and the streak');
  },
});
tests.push({
  name: 'S3-02 the streak grows over consecutive days and starts again after a missed day',
  async run(t) {
    await openWorld1(t);
    const finish = async (key) => {
      await t.game('dailyDate', key);
      await t.game('scene', 'daily');
      await t.page.locator('#modal [data-act="go"]').click();
      await t.waitIdle();
      await t.game('scene', 'win');
      await t.waitIdle();
      return (await stored(t)).daily;
    };
    let d = await finish('2026-03-05');
    t.equal(d.streak, 1, 'day one');
    d = await finish('2026-03-06');
    t.equal(d.streak, 2, 'day two');
    d = await finish('2026-03-07');
    t.equal(d.streak, 3, 'day three');
    await t.game('dailyDate', '2026-03-10');
    await t.game('scene', 'title');
    await t.waitIdle();
    t.equal(await t.page.locator('#screen .menu-note').innerText(), 'A new board today', 'after two missed days the streak is not offered any more');
    d = await finish('2026-03-10');
    t.equal(d.streak, 1, 'a new streak starts');
    t.equal(d.bestStreak, 3, 'the longest one is remembered');
    t.equal(Object.keys(d.days).length, 4, 'four days on record');
  },
});
tests.push({
  name: 'S3-02 an out-of-moves daily saves the best score, keeps the streak and offers Retry',
  async run(t) {
    await t.game('dailyDate', D1);
    await openWorld1(t);
    await t.game('act', 'save', { daily: { streak: 3, bestStreak: 3, last: '2026-03-04', days: { '2026-03-04': { stars: 1, best: 9000, tries: 1, won: true } } }, soakBest: 9000 });
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    await t.game('scene', 'lose');
    await t.waitIdle();
    await t.waitForAnimations();
    const st = await stored(t);
    t.equal(st.daily.days[D1].won, false, 'recorded as not cleared');
    t.equal(st.daily.days[D1].tries, 1, 'one try');
    t.equal(st.daily.streak, 3, 'the streak is untouched by a loss');
    t.equal(st.daily.days['2026-03-04'].best, 9000, 'yesterday is untouched');
    t.expect(await t.page.locator('#modal [data-act="retry"]').count() === 1, 'Retry is offered');
    await t.shot('S3-02-daily-lose');
    await t.page.locator('#modal [data-act="retry"]').click();
    await t.waitIdle();
    const s = await t.state();
    t.equal(s.scene, 'game', 'Retry restarts the daily');
    t.equal(s.level, 'daily', 'on the daily level');
  },
});
tests.push({
  name: 'S3-02 the HUD shows today\'s best and the best ever, and the pause card quits to the title',
  async run(t) {
    await t.game('dailyDate', D1);
    await openWorld1(t);
    await t.game('act', 'save', { soakBest: 21500, soakDay: D1, daily: { streak: 1, bestStreak: 1, last: D1, days: { [D1]: { stars: 2, best: 14250, tries: 1, won: true } } } });
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    const r = await t.page.evaluate(() => {
      const w = document.getElementById('hud-world'), ever = w.querySelector('.hw-ever');
      return { text: w.textContent, title: w.title, everShown: !!ever && ever.offsetParent !== null, clipped: w.scrollWidth > w.clientWidth };
    });
    t.expect(/best 14,250/.test(r.text), `best today shown: "${r.text}"`);
    t.expect(/best today 14,250, best ever 21,500/.test(r.title), 'both numbers are in the tooltip and the label');
    if (t.viewport === 'desktop') t.expect(r.everShown && /ever 21,500/.test(r.text), 'the wide HUD shows the best ever too');
    else t.expect(!r.clipped, 'the phone HUD keeps one short label that is not clipped');
    await t.shot('S3-02-daily-hud');
    await t.page.locator('#btn-pause').click();
    await t.waitIdle();
    const pause = await t.page.locator('#modal').innerText();
    t.expect(/Quit to title/.test(pause) && !/map/i.test(pause.replace(/Quit to title/, '')), 'the pause card offers Quit to title, not the map');
    await t.shot('S3-02-daily-pause');
    await t.page.locator('#modal [data-act="map"]').click();
    await t.waitIdle();
    t.equal((await t.state()).scene, 'title', 'back at the title');
  },
});
tests.push({
  name: 'S3-02 saves from before this wave load whole, and a damaged daily field reads as empty',
  async run(t) {
    const old = { v: 1, settings: { sound: true, music: true, ambience: true, volume: 0.5, motion: 'auto', steam: true, hints: true, badges: false }, progress: { ...W1, 'w2-01': { stars: 3, best: 31000 } }, boosters: { hammer: 2, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [], current: null, soakDay: null, soakBest: 7777 };
    const put = (v) => t.page.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify(x)), [KEY, v]);
    await put(old);
    await t.reload();
    await t.waitIdle();
    let s = await t.state();
    t.equal(s.daily.streak, 0, 'no streak yet');
    t.equal(Object.keys(s.daily.days).length, 0, 'no days yet');
    t.equal(s.soakBest, 7777, 'an old best ever is kept');
    t.equal(s.progress['w2-01'].stars, 3, 'progress untouched');
    t.equal(s.saveBoosters.hammer, 2, 'boosters untouched');
    await t.game('dailyDate', D1);
    await t.game('scene', 'daily');
    await t.page.locator('#modal [data-act="go"]').click();
    await t.waitIdle();
    await t.game('scene', 'win');
    await t.waitIdle();
    const st = await stored(t);
    t.equal(st.progress['w2-01'].best, 31000, 'the old progress is still there after a daily win');
    t.equal(st.daily.streak, 1, 'the daily record starts');
    t.expect(st.soakBest >= 7777, 'the best ever never drops');
    for (const bad of ['yes', 5, [1, 2], { streak: 'many', days: 'none', last: 12 }]) {
      await put({ ...old, daily: bad });
      await t.reload();
      await t.waitIdle();
      s = await t.state();
      t.equal(s.daily.streak, 0, `a damaged field ${JSON.stringify(bad)} reads as empty`);
      t.equal(s.progress['w2-01'].best, 31000, 'and progress is intact');
    }
  },
});
tests.push({
  name: 'S3-02 resetting progress clears the daily record too',
  async run(t) {
    await openWorld1(t);
    await t.game('act', 'save', { soakBest: 5000, soakDay: D1, daily: { streak: 2, bestStreak: 2, last: D1, days: { [D1]: { stars: 1, best: 5000, tries: 1, won: true } } } });
    await t.game('scene', 'settings');
    await t.page.locator('#modal [data-act="reset"]').click();
    await t.page.locator('#modal [data-act="erase"]').click();
    await t.waitIdle();
    const st = await stored(t);
    t.equal(st.soakBest, 0, 'best ever cleared');
    t.equal(st.daily.streak, 0, 'streak cleared');
    t.equal(Object.keys(st.daily.days).length, 0, 'days cleared');
  },
});
