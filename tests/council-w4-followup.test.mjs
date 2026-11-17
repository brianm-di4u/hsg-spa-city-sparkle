// Council wave 4, follow-up batch: what the verifiers of batches A to C required (S3-09 the Daily's board, C4-06 and C4-08 and the full-volume ceiling, the S1-09 stick test).
// Nothing here depends on chance or the clock: dates are fixed, renders are seeded, waits are for conditions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const tests = [];
const root = (p) => fileURLToPath(new URL('../' + p, import.meta.url));

// --- S3-09 (follow-up): the Daily deals the same board for a date as it did in wave 3 ----------------------------------------------------
// Park Hotel (w3-08) got 30 moves and a spawner layer in wave 4 for the journey; the Daily draws it for about one date in fifteen and must keep dealing the wave-3 board.
// These numbers were taken from the wave-3 levels file and the wave-3 daily.js (unchanged since): the order of levels over 730 dates from 2026-01-01 (hash32 of the ids), and a hash32 of every
// distinct Daily level as the Daily builds it (the whole level object as JSON), 16 levels in the pool.
const WAVE3_SEQUENCE = 434094443;
const WAVE3_LEVELS = { 'w2-07': 1709002038, 'w2-06': 3159642701, 'w2-04': 1600215471, 'w3-06': 2785464148, 'w3-03': 1561023442, 'w3-02': 1958441218, 'w3-08': 785470566, 'w3-09': 1142473561, 'w2-02': 2846675998, 'w3-07': 1465819606, 'w1-05': 2561471820, 'w2-09': 3970851898, 'w1-07': 652990535, 'w2-08': 209550666, 'w1-09': 2348565881, 'w1-10': 3717810942 };
tests.push({
  name: 'S3-09 the Daily deals the wave-3 level and board on 730 dates, Park Hotel included (32 moves, no spawner layer), while the journey keeps its new board',
  node: true,
  async run() {
    const { dailyLevel, addDays } = await import(new URL('../src/js/ui/daily.js', import.meta.url).href);
    const { hash32 } = await import(new URL('../src/js/engine/rng.js', import.meta.url).href);
    const raw = JSON.parse(fs.readFileSync(root('data/levels.json'), 'utf8')), levels = raw.levels || raw;
    const seq = [], per = {}; let key = '2026-01-01', parkHotel = null;
    for (let i = 0; i < 730; i++, key = addDays(key, 1)) {
      const d = dailyLevel(levels, key); seq.push(d.from); per[d.from] = hash32(JSON.stringify(d.level));
      if (d.from === 'w3-08') parkHotel = d.level;
    }
    assert.equal(hash32(seq.join(',')), WAVE3_SEQUENCE, 'the same level is drawn on every one of the 730 dates');
    assert.deepEqual(per, WAVE3_LEVELS, 'every level the Daily deals is the wave-3 level, board and moves');
    assert.ok(seq.filter((x) => x === 'w3-08').length > 20, 'the dates include many Park Hotel days');
    assert.equal(parkHotel.moves, 32, 'the Daily gives Park Hotel 32 moves');
    assert.equal(parkHotel.grid.flow, undefined, 'and no spawner layer');
    const journey = levels.find((l) => l.id === 'w3-08');
    assert.equal(journey.moves, 30, 'the journey level keeps its 30 moves');
    assert.ok(journey.grid.flow, 'and its spawner layer');
  },
});

// --- C4-06 (follow-up): a cue's loudness follows its level, with no stray first sample ---------------------------------------------------
// A noise burst that began part-way through a render block passed its first sample at the gain node's default of 1 before the burst's own silent start took hold, so crystal, token and the Encore sting
// carried one full-size click (0.94 to 0.97 at the maximum volume) however quiet the cue was asked to be. Every gain now starts at silence the moment it is made.
tests.push({
  name: 'C4-06 a cue struck at level 0.05 is far quieter than at level 1, for every cue (no unscaled click: crystal, token and the Encore sting read 0.94 or more at any level before)',
  viewports: ['desktop'],
  async run(t) {
    const L = await t.game('audioList'), rows = [];
    for (const name of L.cues) {
      let loud = 0, quiet = 0;
      for (const seed of [1, 2]) {
        loud = Math.max(loud, (await t.game('cueRender', name, 0, { level: 1 }, 3, false, seed, { volume: 1 })).peak);
        quiet = Math.max(quiet, (await t.game('cueRender', name, 0, { level: 0.05 }, 3, false, seed, { volume: 1 })).peak);
      }
      rows.push([name, loud, quiet]);
      t.expect(quiet < 0.3 * loud, `${name}: at level 0.05 it peaks ${quiet}, under 0.3 of its ${loud} at level 1`);
    }
    t.log(`peak at level 1 / level 0.05, maximum volume: ${rows.map((r) => `${r[0]} ${r[1]}/${r[2]}`).join('; ')}`);
  },
});

// --- C4-08 and C4-06 (follow-up): the cue levels as the owner decided (69) ------------------------------------------------------------
tests.push({
  name: 'C4-08 crowdLevel is 1 up to three cues and sqrt(3 / n) above, and the trims keep every cue under 0.7 alone at the maximum volume',
  viewports: ['desktop'],
  async run(t) {
    for (const [n, want] of [[1, 1], [2, 1], [3, 1], [4, Math.sqrt(0.75)], [6, Math.sqrt(0.5)], [12, 0.5]]) t.expect(Math.abs((await t.game('crowdLevel', n)) - want) < 1e-9, `crowdLevel(${n}) is ${want.toFixed(3)}`);
    const L = await t.game('audioList'), over = [];
    for (const name of L.cues) for (const arg of [0, 1, 2, 3]) {
      const p = (await t.game('cueRender', name, arg, name === 'match' ? { size: 5 } : {}, 3, false, 1, { volume: 1 })).peak;
      if (p >= 0.7) over.push(`${name} ${arg} ${p}`);
    }
    t.expect(over.length === 0, `no cue alone peaks 0.7 or more at the maximum volume as heard (${over.join('; ')})`);
  },
});
