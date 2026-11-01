// Level content: structure, refill, initial boards, goal reachability (tools/check-levels.mjs), the balance
// report is fresh and in band (tools/balance.mjs), and every lore card traces to the audited bank.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkLevels } from '../tools/check-levels.mjs';
import { checkFacts } from '../tools/check-facts.mjs';

const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const levelsRaw = fs.readFileSync(path.join(game, 'data', 'levels.json'));
const levels = JSON.parse(levelsRaw);

export const tests = [
  {
    name: 'check-levels: 60 levels pass structure, refill, initial-board and goal checks',
    node: true,
    run(t) {
      const { errors, warnings } = checkLevels(levels, 40);
      errors.slice(0, 10).forEach((e) => t.fail(e));
      t.log(`${warnings.length} warnings`);
      t.equal(levels.length, 60, '60 levels');
      for (let w = 1; w <= 6; w++) t.equal(levels.filter((l) => l.world === w).length, 10, `world ${w} has 10`);
      const intros = levels.flatMap((l) => l.tags.filter((x) => x.startsWith('intro:')));
      for (const m of ['basics', 'cascade', 'stone', 'crystal', 'tufa', 'crust', 'lock', 'fog', 'tokens', 'moss']) t.expect(intros.includes(`intro:${m}`), `a level introduces ${m}`);
    },
  },
  {
    name: 'balance report is current and every level is in its band',
    node: true,
    run(t) {
      const p = path.join(game, 'tools', 'balance-report.json');
      if (!fs.existsSync(p)) { t.fail('run node tools/balance.mjs'); return; }
      const r = JSON.parse(fs.readFileSync(p, 'utf8'));
      const hash = crypto.createHash('sha1').update(levelsRaw).digest('hex').slice(0, 12);
      t.equal(r.levelsHash, hash, 'report matches data/levels.json (re-run tools/balance.mjs after editing levels)');
      t.expect(r.seeds >= 200, `≥ 200 seeds per level (${r.seeds})`);
      for (const l of levels) {
        const x = r.levels[l.id];
        if (!x) { t.fail(`${l.id} missing from report`); continue; }
        if (x.verdict === 'FAIL') t.fail(`${l.id} win rate ${(x.win * 100).toFixed(0)}% outside band ${l.band}`);
        if (x.randomWin > x.win - 0.15) t.fail(`${l.id}: random bot ${(x.randomWin * 100).toFixed(0)}% too close to casual ${(x.win * 100).toFixed(0)}%`);
        if (x.win > 0 && x.star3 / x.win < 0.05) t.fail(`${l.id}: 3 stars on only ${((x.star3 / x.win) * 100).toFixed(1)}% of wins`);
        if (x.capped) t.fail(`${l.id}: cascade cap hit`);
      }
    },
  },
  {
    name: 'lore cards trace to the audited fact bank',
    node: true,
    run(t) {
      const r = checkFacts();
      r.problems.forEach((p) => t.fail(p));
      t.equal(r.count, 60, '60 lore cards');
    },
  },
];
