// This game's own music and ambience, written as data for the engine in audio-kit.js.
// Chord roots are scale degrees (0 = I, 1 = ii, 2 = iii, 3 = IV, 4 = V, 5 = vi); [degree, bars] holds a chord longer.
// Every piece is at least 45 s before it repeats (AABA form, a different set of chords in B) and each world has its
// own key, tempo, lead instrument and rhythm part. title also plays on the map; intro is the level card; results is the win and lose card.
const DORIAN = [0, 2, 3, 5, 7, 9, 10], LYDIAN = [0, 2, 4, 6, 7, 9, 11];

export const SCORES = {
  // Title and world map: an unhurried parlour theme in C, piano over a pad, long echo. 16 bars, 53 s.
  title: {
    bpm: 72, key: 60, form: 'AABA', sections: { A: [0, 5, 3, 4], B: [3, 1, 4, [0, 1], 4] },
    pad: { gain: 0.05 }, bass: { pattern: 'two', gain: 0.1 }, comp: { inst: 'mallet', at: [1.5], gain: 0.03, oct: 0 },
    lead: { inst: 'piano', gain: 0.1, vary: 0.35, rest: 0.18 },
    lp: 3800, delay: 0.22,
  },
  // Level card: a calmer bed in F, soft pad and a sparse bell-like lead. 16 bars, 64 s.
  intro: {
    bpm: 60, key: 65, scale: LYDIAN, form: 'AABA', sections: { A: [0, 1, 0, 4], B: [3, 5, 1, 4] },
    pad: { gain: 0.055 }, bass: { pattern: 'root', gain: 0.07 },
    lead: { inst: 'mallet', gain: 0.075, vary: 0.4, rest: 0.4 },
    lp: 3200, delay: 0.3,
  },
  // Results card: warm and a little brighter, in E, with a brush. 16 bars, 48 s.
  results: {
    bpm: 80, key: 64, form: 'AABA', sections: { A: [0, 3, 0, 4], B: [5, 3, 4, [0, 1], 4] },
    pad: { gain: 0.05 }, bass: { pattern: 'two', gain: 0.1 }, comp: { inst: 'piano', at: [1, 3], gain: 0.03 },
    lead: { inst: 'mallet', gain: 0.09, vary: 0.35, rest: 0.12 },
    perc: { b: [1, 3], gain: 0.35 },
    lp: 4200, delay: 0.2,
  },
  // 1. Bathhouse Row, the gilded spa years: a rag in Eb, oom-pah left hand and a syncopated right. 32 bars, 87 s.
  row: {
    bpm: 88, swing: 0.14, key: 63, sevenths: [4], form: 'AABA',
    sections: { A: [0, [0, 1], 4, [4, 1], 0, 5, 1, 4], B: [3, 3, 0, 0, 1, 4, 0, [0, 1]] },
    bass: { inst: 'bass', pattern: 'two', gain: 0.15 }, comp: { inst: 'piano', at: [1, 3], gain: 0.05 },
    lead: { inst: 'piano', gain: 0.11, vary: 0.3, rest: 0.06, rhythms: [[0, 1, 3, 4, 6], [0, 3, 4, 7], [1, 2, 4, 5, 7], [0, 2, 3, 5, 6], [0, 3, 6], [0, 2, 4, 6], [0, 1, 3, 6, 7]] },
    perc: { b: [1, 3], gain: 0.25 },
    lp: 5000, delay: 0,
  },
  // 2. Hot Springs Mountain: slow and watery, D dorian, flute over a pad. 16 bars, 58 s.
  mountain: {
    bpm: 66, key: 62, scale: DORIAN, form: 'AABA', sections: { A: [0, 3, 0, 4], B: [2, 3, 0, [4, 1], 1] },
    pad: { gain: 0.055 }, bass: { pattern: 'root', gain: 0.085 },
    lead: { inst: 'flute', gain: 0.085, vary: 0.35, rest: 0.22, oct: 1 },
    lp: 3400, delay: 0.3,
  },
  // 3. Central Avenue at night: smoky swing in Bb, walking bass, vibraphone lead, brushes. 32 bars, 71 s.
  avenue: {
    bpm: 108, swing: 0.22, key: 58, sevenths: [0, 1, 3, 4, 5], form: 'AABA',
    sections: { A: [1, 4, 0, 5, 1, 4, 0, [0, 1]], B: [3, 3, 2, 5, 1, 4, 0, 4] },
    bass: { inst: 'bass', pattern: 'walk', gain: 0.15 }, comp: { inst: 'piano', at: [1, 3], gain: 0.04 },
    lead: { inst: 'mallet', gain: 0.09, vary: 0.35, rest: 0.12, rhythms: [[0, 3, 4, 7], [1, 2, 4, 6], [0, 2, 3, 6], [0, 3, 6], [2, 4, 5, 7], [0, 1, 4, 6]] },
    perc: { b: [1, 3], h: [0, 1.67, 2.67], gain: 0.4 },
    lp: 3600, delay: 0.12, delayBeats: 0.67,
  },
  // 4. Oaklawn and the ballfields: a midcentury shuffle in G, organ lead, plucked bass, a light kit. 32 bars, 68 s.
  oaklawn: {
    bpm: 112, swing: 0.1, key: 67, sevenths: [4], form: 'AABA',
    sections: { A: [0, 0, 3, 0, 4, 3, 0, 4], B: [3, 3, 0, 0, 5, 5, 4, 4] },
    bass: { inst: 'pluck', pattern: 'two', gain: 0.1 }, comp: { inst: 'organ', at: [1, 3], gain: 0.025, len: 0.5 },
    lead: { inst: 'organ', gain: 0.06, vary: 0.3, rest: 0.1, oct: 1 },
    perc: { k: [0, 2], s: [1, 3], h: [0.5, 1.5, 2.5, 3.5], gain: 0.28 },
    lp: 4200, delay: 0.1, delayBeats: 0.5,
  },
  // 5. The lakes: a slow lilting waltz in A, flute over a pad, soft chords on two and three. 32 bars, 69 s.
  lakes: {
    bpm: 84, beats: 3, key: 57, form: 'AABA',
    sections: { A: [0, 3, 0, 4, 0, 5, 3, 4], B: [3, 0, 1, 4, 5, 3, 4, [0, 1]] },
    pad: { gain: 0.05 }, bass: { pattern: 'root', gain: 0.09 }, comp: { inst: 'piano', at: [1, 2], gain: 0.03 },
    lead: { inst: 'flute', gain: 0.085, vary: 0.35, rest: 0.15, oct: 1 },
    lp: 3800, delay: 0.26, delayBeats: 1,
  },
  // 6. Garvan Gardens and the revival: bright and open, Db lydian, mallets over a pad. 23 bars, 70 s.
  garvan: {
    bpm: 78, key: 61, scale: LYDIAN, form: 'AABA',
    sections: { A: [0, 1, 0, 4, 5, 3], B: [3, 1, 4, [0, 2]] },
    pad: { gain: 0.05 }, bass: { pattern: 'root', gain: 0.085 },
    lead: { inst: 'mallet', gain: 0.09, vary: 0.4, rest: 0.18 },
    lp: 4000, delay: 0.28,
  },
};

// One bed of sound per place: noise layers that slowly breathe, plus sparse one-shots at random gaps.
// Gains are the levels measured through the shipping chain (see the batch report); 'every' is seconds between one-shots.
const bloop = (ctx, dst, t, rnd, v) => { const f = 180 + rnd() * 260, o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2.4, t + 0.09); e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(v, t + 0.012); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(e); e.connect(dst); o.start(t); o.stop(t + 0.2); };
const lamp = (ctx, dst, t, rnd, v) => { const o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 100 + rnd() * 12; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(v * 0.5, t + 0.5); e.gain.linearRampToValueAtTime(0.0001, t + 1.6); o.connect(f); f.connect(e); e.connect(dst); o.start(t); o.stop(t + 1.7); };

export const SCENES = {
  // Title and map: thermal steam on a quiet street, now and then a far bell.
  town: {
    beds: [
      { type: 'lowpass', freq: 460, gain: 0.05, lfo: { rate: 0.06, depth: 0.5 }, flfo: { rate: 0.04, depth: 120 } },
      { type: 'bandpass', freq: 2600, q: 0.6, gain: 0.011, pan: 0.3, lfo: { rate: 0.1, depth: 0.8 } },
    ],
    spots: [{ make: 'bell', every: [14, 30], gain: 0.03, pan: [-0.5, 0.5] }, { make: 'drip', every: [3, 8], gain: 0.04 }],
  },
  // Bathhouse Row: a low wash of water in tiled rooms, steam air, drips and the odd vent.
  bathhouse: {
    beds: [
      { type: 'lowpass', freq: 520, gain: 0.055, lfo: { rate: 0.07, depth: 0.5 }, flfo: { rate: 0.05, depth: 140 } },
      { type: 'bandpass', freq: 2400, q: 0.6, gain: 0.011, pan: 0.3, lfo: { rate: 0.11, depth: 0.8 } },
    ],
    spots: [{ make: 'drip', every: [1.5, 5], gain: 0.04 }, { make: 'hiss', every: [9, 20], gain: 0.03 }],
  },
  // The mountain: a spring trickling over tufa, steam hiss, a hollow bloop, a bird.
  springs: {
    beds: [
      { type: 'bandpass', freq: 1300, q: 0.9, gain: 0.03, lfo: { rate: 0.31, depth: 0.55 }, flfo: { rate: 0.17, depth: 380 } },
      { type: 'lowpass', freq: 300, gain: 0.04, lfo: { rate: 0.05, depth: 0.5 } },
      { type: 'highpass', freq: 4500, q: 0.5, gain: 0.006, pan: -0.3, lfo: { rate: 0.08, depth: 0.9 } },
    ],
    spots: [{ make: bloop, every: [3, 9], gain: 0.04, pan: [-0.6, 0.6] }, { make: 'hiss', every: [8, 16], gain: 0.03 }, { make: 'bird', every: [10, 22], gain: 0.016, pan: [-0.8, 0.8] }],
  },
  // Central Avenue at night: rain on pavement, a muffled band behind a door, a far lamp hum, a passing bell.
  rain: {
    beds: [
      { type: 'bandpass', freq: 3800, q: 0.5, gain: 0.02, lfo: { rate: 0.09, depth: 0.35 } },
      { type: 'lowpass', freq: 220, gain: 0.045, lfo: { rate: 0.04, depth: 0.4 } },
      { type: 'bandpass', freq: 520, q: 1.4, gain: 0.014, pan: 0.45, lfo: { rate: 0.5, depth: 0.7 }, flfo: { rate: 0.2, depth: 90 } },
    ],
    spots: [{ make: lamp, every: [7, 15], gain: 0.012, pan: [-0.7, -0.2] }, { make: 'bell', every: [18, 36], gain: 0.025, pan: [0.1, 0.8] }, { make: 'drip', every: [2, 6], gain: 0.025, pan: [-0.8, 0.8] }],
  },
  // Oaklawn: a grandstand crowd murmuring, swells of cheering, a bell, birds over the field.
  grandstand: {
    beds: [
      { type: 'bandpass', freq: 700, q: 0.5, gain: 0.045, lfo: { rate: 0.13, depth: 0.5 } },
      { type: 'bandpass', freq: 1600, q: 0.7, gain: 0.014, pan: -0.3, lfo: { rate: 0.21, depth: 0.6 } },
    ],
    spots: [{ make: 'swell', every: [6, 14], gain: 0.035 }, { make: 'bell', every: [20, 40], gain: 0.025 }, { make: 'bird', every: [4, 10], gain: 0.016, pan: [-0.8, 0.8] }],
  },
  // The lakes: water lapping at a shore, a steady breeze, gulls far off.
  shore: {
    beds: [
      { type: 'lowpass', freq: 520, gain: 0.05, lfo: { rate: 0.19, depth: 0.7 }, flfo: { rate: 0.09, depth: 160 } },
      { type: 'bandpass', freq: 1100, q: 0.7, gain: 0.014, pan: 0.3, lfo: { rate: 0.23, depth: 0.8 } },
      { type: 'lowpass', freq: 260, gain: 0.035, lfo: { rate: 0.06, depth: 0.6 }, pan: -0.2 },
    ],
    spots: [{ make: 'swell', every: [8, 16], gain: 0.025 }, { make: 'bird', every: [7, 16], gain: 0.014, pan: [-0.9, 0.9] }, { make: bloop, every: [6, 14], gain: 0.02, pan: [-0.7, 0.7] }],
  },
  // Garvan Gardens: a breeze in the leaves, a little fountain, many small birds.
  garden: {
    beds: [
      { type: 'lowpass', freq: 380, gain: 0.04, lfo: { rate: 0.09, depth: 0.7 }, flfo: { rate: 0.04, depth: 120 } },
      { type: 'bandpass', freq: 2100, q: 0.8, gain: 0.011, pan: 0.35, lfo: { rate: 0.27, depth: 0.7 } },
    ],
    spots: [{ make: 'bird', every: [1.8, 6], gain: 0.018, pan: [-0.8, 0.8] }, { make: 'bird', every: [4, 11], gain: 0.013, pan: [-0.9, -0.3] }, { make: 'drip', every: [1.2, 3.5], gain: 0.02, pan: [0.2, 0.8] }],
  },
};

// Which piece and which bed play in each world's levels.
export const WORLD_MOOD = { 1: ['row', 'bathhouse'], 2: ['mountain', 'springs'], 3: ['avenue', 'rain'], 4: ['oaklawn', 'grandstand'], 5: ['lakes', 'shore'], 6: ['garvan', 'garden'] };
