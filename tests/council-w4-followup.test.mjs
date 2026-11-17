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
