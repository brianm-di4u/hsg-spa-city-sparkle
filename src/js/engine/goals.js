// Goal progress, stars and phase (MECHANICS §4.7). Goal types:
//   score {need}            reach the score
//   collect {kind, need}    clear N tiles of a colour (0-5)
//   crust {need}            clear N crust layers ('all' resolved at level start)
//   stone {need}            break N stone layers
//   moss {need:'all'}       no moss left on the board
//   lock {need}             open N locks
//   tokens {need}           deliver N bath tokens to the drains
export function resolveNeeds(s) {
  for (const g of s.goals) {
    if (g.need !== 'all') continue;
    if (g.type === 'crust') g.need = s.crust.reduce((a, b) => a + b, 0);
    else if (g.type === 'stone') g.need = s.stone.reduce((a, b) => a + b, 0);
    else if (g.type === 'lock') g.need = s.lock.reduce((a, b) => a + b, 0);
    else if (g.type === 'moss') g.need = 0;
    else if (g.type === 'tokens') g.need = s.tokens.total;
  }
}

export function updateGoals(s) {
  const changed = [];
  for (const g of s.goals) {
    const before = g.have;
    switch (g.type) {
      case 'score': g.have = s.score; break;
      case 'collect': g.have = Math.min(g.need, s.stats.cleared[g.kind]); break;
      case 'crust': g.have = Math.min(g.need, s.stats.crust); break;
      case 'stone': g.have = Math.min(g.need, s.stats.stone); break;
      case 'lock': g.have = Math.min(g.need, s.stats.lock); break;
      case 'tokens': g.have = Math.min(g.need, s.tokens.collected); break;
      case 'moss': g.have = s.moss.reduce((a, b) => a + b, 0); break; // remaining moss; done at 0
      default: break;
    }
    if (g.have !== before) changed.push(g);
  }
  return changed;
}

export const goalDone = (g) => (g.type === 'moss' ? g.have === 0 : g.have >= g.need);
export const allDone = (s) => s.goals.length > 0 && s.goals.every(goalDone);

export function starsFor(s, score = s.score) {
  let n = 0;
  for (const t of s.stars) if (score >= t) n++;
  return Math.max(1, n);
}

// 0..1 progress of all goals, for bots and hints.
export function goalProgress(s) {
  if (!s.goals.length) return 0;
  let sum = 0;
  for (const g of s.goals) {
    if (g.type === 'moss') { const start = g.start == null ? Math.max(1, g.have) : g.start; sum += 1 - Math.min(1, g.have / Math.max(1, start)); }
    else sum += g.need > 0 ? Math.min(1, g.have / g.need) : 1;
  }
  return sum / s.goals.length;
}
