// Timeline schedule: gives every beat of an engine timeline a start time and duration, so the board
// view can draw any instant as a pure function of (timeline, ms). Frozen-clock captures and Skip rely
// on that purity. Durations follow MECHANICS §5; reduced motion scales them by 0.35.
export const TICK_MS = 62;

export function beatDuration(evs, opts = {}) {
  const has = (t) => evs.some((e) => e.t === t);
  let d = 0;
  if (has('swap') || has('swapBack')) d = Math.max(d, 190);
  if (has('booster')) d = Math.max(d, 160);
  if (has('encore')) d = Math.max(d, 240);
  if (has('match') || has('hit') || has('fire') || has('special')) {
    let c = 260;
    const fires = evs.filter((e) => e.t === 'fire');
    if (fires.length) c = Math.max(c, 360 + Math.min(240, fires.length * 40));
    if (has('combo') || has('convert')) c += 260;
    d = Math.max(d, c);
  }
  const fall = evs.find((e) => e.t === 'fall');
  if (fall) d = Math.max(d, (fall.ticks + 1) * TICK_MS + 210);
  if (has('reshuffle')) d = Math.max(d, 560);
  if (has('spread')) d = Math.max(d, 320);
  if (has('end')) d = Math.max(d, 60);
  if (opts.reduced) d = Math.round(d * 0.35);
  return d;
}

export function schedule(timeline, opts = {}) {
  const byBeat = new Map();
  for (const e of timeline.events) {
    if (!byBeat.has(e.beat)) byBeat.set(e.beat, []);
    byBeat.get(e.beat).push(e);
  }
  const keys = [...byBeat.keys()].sort((a, b) => a - b);
  const beats = [];
  let t = 0;
  for (const k of keys) {
    const events = byBeat.get(k), dur = beatDuration(events, opts);
    beats.push({ beat: k, start: t, dur, events });
    t += dur;
  }
  return { beats, total: t, reduced: !!opts.reduced };
}

// Index of the beat playing at ms (beats.length when finished) and its progress 0..1.
export function frameAt(sched, ms) {
  const { beats } = sched;
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    if (ms < b.start + b.dur) return { i, p: b.dur ? Math.max(0, (ms - b.start) / b.dur) : 1 };
  }
  return { i: beats.length, p: 1 };
}

export const ease = {
  outCubic: (p) => 1 - (1 - p) ** 3,
  inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: (p) => { const c = 1.6; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; },
  outBackStrong: (p) => { const c = 2.6; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; },
  inQuad: (p) => p * p,
};

// Deterministic pseudo-random in [0,1) from integers, for stateless particles.
export function hrand(a, b = 0, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
