// Seeded RNG for the engine: mulberry32 streams whose state lives inside the game state (uint32),
// so a saved game resumes the same sequence. Two streams per game: `spawn` (refills, initial board)
// and `misc` (reshuffle, moss, Encore, combo orientations). Never call Math.random in engine code.

export function hash32(...parts) {
  // FNV-1a over the decimal text of each part; stable across platforms.
  let h = 0x811c9dc5;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    h ^= 0x2c; h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function makeRng(seed) {
  return { spawn: hash32('spawn', seed) || 1, misc: hash32('misc', seed) || 2 };
}

// Advances stream `name` of rng object `r` and returns a float in [0, 1).
export function next(r, name) {
  let a = (r[name] + 0x6d2b79f5) >>> 0;
  r[name] = a;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function int(r, name, n) { return Math.floor(next(r, name) * n); }

// Weighted pick: weights is an array of non-negative numbers; returns an index.
export function weighted(r, name, weights) {
  let total = 0;
  for (const w of weights) total += w;
  let x = next(r, name) * total;
  for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x < 0 && weights[i] > 0) return i; }
  for (let i = weights.length - 1; i >= 0; i--) if (weights[i] > 0) return i;
  return 0;
}
