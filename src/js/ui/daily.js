// The Daily Challenge: one goal level a day, picked from the shipped levels by the local date, plus the streak and the
// per-day record kept in the save (pure functions; the save and the screens call them).
import { hash32 } from '../engine/rng.js';

export const KEEP_DAYS = 30; // best stars and score are kept for this many days, then pruned
export const freshDaily = () => ({ streak: 0, bestStreak: 0, last: null, days: {} });

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const validKey = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);
const dayNumber = (k) => Math.round(Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)) / 86400000);
export const addDays = (k, n) => { const d = new Date(Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10) + n)); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
export const dailySeed = (k) => +k.replace(/-/g, '');

// Worlds 1 to 3 without the tutorial levels or the hardest ones: a player who has finished Bathhouse Row can win these.
const inPool = (l) => l.world <= 3 && l.moves != null && l.goals.length && !(l.tags || []).some((t) => t.startsWith('intro:')) && l.band && l.band[0] >= 0.6;
export function dailyPool(levels) { return levels.filter(inPool); }

// A level whose board was changed for the journey after the Daily began (wave 4 gave Park Hotel 30 moves and a spawner layer) keeps the board the Daily dealt before,
// because what a date gives does not change: its moves and its layers as they were. A level not listed here is dealt exactly as it is in the journey.
const DAILY_BOARD = { 'w3-08': { moves: 32, drop: ['flow'] } };
function asDealt(base) {
  const was = DAILY_BOARD[base.id];
  if (!was) return base;
  const grid = { ...base.grid }; for (const k of was.drop) delete grid[k];
  return { ...base, moves: was.moves, grid };
}

// The same level and board for everyone on the same calendar day; never the same level two days running.
export function dailyLevel(levels, key) {
  const pool = dailyPool(levels);
  const at = (k) => hash32('daily', dayNumber(k)) % pool.length;
  let i = at(key);
  if (i === at(addDays(key, -1))) i = (i + 1) % pool.length;
  const base = asDealt(pool[i]);
  const L = { ...base, id: 'daily', name: base.name, mode: 'daily', tags: [] };
  delete L.tip;
  return { level: L, from: base.id, seed: dailySeed(key), key };
}

// A save field read from storage may be anything: keep only what is well formed.
export function cleanDaily(v) {
  const d = freshDaily();
  if (!v || typeof v !== 'object' || Array.isArray(v)) return d;
  const n = (x) => (Number.isFinite(x) && x >= 0 ? Math.floor(x) : 0);
  d.streak = n(v.streak); d.bestStreak = Math.max(n(v.bestStreak), d.streak); d.last = validKey(v.last) ? v.last : null;
  if (v.days && typeof v.days === 'object' && !Array.isArray(v.days)) {
    for (const k of Object.keys(v.days).filter(validKey).sort().slice(-KEEP_DAYS)) {
      const e = v.days[k] || {};
      d.days[k] = { stars: Math.min(3, n(e.stars)), best: n(e.best), tries: n(e.tries), won: !!e.won };
    }
  }
  return d;
}

// Folds one finished attempt ({key, score, stars, won}) into the daily record and the all-time best.
// Nothing a player already holds is lowered: best score and best stars only rise.
export function dailyInto(save, r) {
  const d = cleanDaily(save.daily), had = d.days[r.key] || { stars: 0, best: 0, tries: 0, won: false };
  d.days[r.key] = { stars: Math.max(had.stars, r.stars), best: Math.max(had.best, r.score), tries: had.tries + 1, won: had.won || !!r.won };
  if (r.won && d.last !== r.key) {
    d.streak = d.last === addDays(r.key, -1) ? d.streak + 1 : 1;
    d.last = r.key; d.bestStreak = Math.max(d.bestStreak, d.streak);
  }
  const keep = Object.keys(d.days).sort().slice(-KEEP_DAYS);
  d.days = Object.fromEntries(keep.map((k) => [k, d.days[k]]));
  const prevEver = Number.isFinite(save.soakBest) ? save.soakBest : 0;
  save.daily = d; save.soakDay = r.key; save.soakBest = Math.max(prevEver, r.score);
  return { prevBest: had.best, prevStars: had.stars, tries: had.tries + 1, newBest: had.tries > 0 && r.score > had.best, newEver: r.score > prevEver && prevEver > 0, streak: d.streak, bestStreak: d.bestStreak, firstWin: !!r.won && !had.won };
}

// The streak a player can still extend today: yesterday's or today's win keeps it, anything older has lapsed.
export function streakNow(daily, today) {
  const d = cleanDaily(daily);
  return d.last === today || d.last === addDays(today, -1) ? d.streak : 0;
}
