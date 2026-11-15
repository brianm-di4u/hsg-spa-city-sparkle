// The Records card and the small achievements. Both are worked out from what the save already holds (level results,
// per-level tries, the scrapbook, the Daily streak), so nothing new is saved and a player who has already done a thing has it.
// Pure functions of the save and the level list: the screens call them, and a test can too.
const level = (save, id) => (save.progress && save.progress[id]) || null;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// Each: id, name, what it takes (shown on the card, earned or not), and the test on the counts below.
export const ACHIEVEMENTS = [
  { id: 'first-dip', name: 'First Dip', how: 'Clear your first level.', test: (c) => c.cleared >= 1 },
  { id: 'sparkling', name: 'Sparkling', how: 'Win a level with three stars.', test: (c) => c.threeStar >= 1 },
  { id: 'second-wind', name: 'Second Wind', how: 'Win a level you had lost before.', test: (c) => c.comebacks >= 1 },
  { id: 'ten-stops', name: 'Ten Stops Along', how: 'Clear ten levels.', test: (c) => c.cleared >= 10 },
  { id: 'postcard', name: 'Postcard Restored', how: 'Clear every stop of one world.', test: (c) => c.worlds >= 1 },
  { id: 'thirty-stars', name: 'Thirty Stars', how: 'Earn thirty stars in all.', test: (c) => c.stars >= 30 },
  { id: 'scrapbook', name: 'Scrapbook Keeper', how: 'Find twenty cards for the Scrapbook.', test: (c) => c.lore >= 20 },
  { id: 'three-days', name: 'Three Days Running', how: 'Clear the Daily Challenge three days in a row.', test: (c) => c.bestStreak >= 3 },
  { id: 'six-postcards', name: 'All Six Postcards', how: 'Restore every world.', test: (c) => c.worlds >= c.worldCount },
];

// The numbers the card shows. levels: the shipped level list (journey levels have a world).
export function recordCounts(save, levels) {
  const journey = levels.filter((l) => l.world), ids = journey.map((l) => l.id);
  const stats = save.stats || {};
  const worldIds = [...new Set(journey.map((l) => l.world))];
  return {
    levels: journey.length,
    cleared: ids.filter((id) => level(save, id)).length,
    stars: sum(ids.map((id) => (level(save, id) || {}).stars || 0)),
    threeStar: ids.filter((id) => (level(save, id) || {}).stars === 3).length,
    worlds: worldIds.filter((w) => journey.filter((l) => l.world === w).every((l) => level(save, l.id))).length,
    worldCount: worldIds.length,
    lore: (save.lore || []).length,
    runs: sum(Object.values(stats).map((e) => e.tries || 0)),
    wins: sum(Object.values(stats).map((e) => e.wins || 0)),
    comebacks: Object.values(stats).filter((e) => e.wins > 0 && e.tries > e.wins).length,
    boosters: sum(Object.values(save.boosters || {})),
    bestStreak: (save.daily && save.daily.bestStreak) || 0,
    bestDaily: save.soakBest || 0,
  };
}

export const earnedSet = (save, levels) => { const c = recordCounts(save, levels); return new Set(ACHIEVEMENTS.filter((a) => a.test(c)).map((a) => a.id)); };
// The achievements held now that were not in `before` (a set from earnedSet), in card order.
export const newlyEarned = (before, save, levels) => { const now = earnedSet(save, levels); return ACHIEVEMENTS.filter((a) => !before.has(a.id) && now.has(a.id)); };
