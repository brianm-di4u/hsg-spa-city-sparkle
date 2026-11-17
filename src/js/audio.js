// WebAudio synthesis: no audio files. Glassy chimes that rise with each chain wave, a piece of generative
// music per world and screen, and a bed of place sound under it (music.js holds the scores and scenes, audio-kit.js
// the engine). Quiet by default, with separate Sound effects, Music and Ambience switches (PRD §7, AC42).
// Pattern adapted from games/property-game/src/js/audio.js (tone + filtered noise with exponential envelopes).
import { makeAudioKit, measureAudio } from './audio-kit.js';
import { SCORES, SCENES, WORLD_MOOD } from './music.js';

export const AUDIO = { ctx: null, master: null, sfxGain: null, kit: null, sound: true, music: true, ambience: true, volume: 0.5, musicVolume: 1, sfxVolume: 1, musicLevel: 0, masterLevel: 0, sfxLevel: 0, played: [], calls: [], mood: null, holds: new Set(), suspendTimer: 0 };
// Levels of the shipping mix. MASTER_SCALE was 0.6; at 1.2 the default volume (0.5) leaves the cues audible over the music.
const MASTER_SCALE = 1.2;
const MUSIC_LEVEL = 0.6, AMBIENCE_LEVEL = 1; // measured: every piece peaks 0.06 to 0.16 and every bed under 0.07 at the default volume
const limiter = (ctx) => { const c = ctx.createDynamicsCompressor(); c.threshold.value = -6; c.knee.value = 6; c.ratio.value = 12; c.attack.value = 0.003; c.release.value = 0.25; return c; };

function ensure() {
  if (AUDIO.ctx) return AUDIO.ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  AUDIO.ctx = ctx;
  AUDIO.master = ctx.createGain(); AUDIO.master.connect(limiter(ctx)).connect(ctx.destination);
  AUDIO.sfxGain = ctx.createGain(); AUDIO.sfxGain.connect(AUDIO.master);
  AUDIO.kit = makeAudioKit(ctx, AUDIO.master, { seed: (Math.random() * 0xffffff) | 1 });
  AUDIO.kit.start();
  if (AUDIO.holds.size) AUDIO.kit.hold();
  applyLevels();
  syncMood(1.2);
  return ctx;
}
// Resume on any state but 'running': iOS Safari reports 'interrupted' after a call, lock or alarm.
export function unlockAudio() { const c = ensure(); if (c && c.state !== 'running') try { c.resume().catch(() => {}); } catch (_) { /* resume is best effort */ } }
// A hand-edited save can hold any volume; a gain of NaN throws, and one above 1 is louder than the slider goes.
const safeVolume = (v, fallback = 0.5) => (Number.isFinite(+v) && v !== null && v !== '' ? Math.min(1, Math.max(0, +v)) : fallback);
// A level change glides (a time constant of GAIN_GLIDE seconds) instead of jumping, so dragging a slider or flipping a switch makes no zipper noise or click.
// The first setting of a new audio context is direct: nothing is playing yet and it should start at its level, not rise to it.
const GAIN_GLIDE = 0.03;
const leveled = new WeakSet();
const glide = (param, v, ctx) => { if (leveled.has(ctx)) param.setTargetAtTime(v, ctx.currentTime, GAIN_GLIDE); else param.value = v; };
export function applyLevels() {
  if (!AUDIO.ctx) return;
  const ctx = AUDIO.ctx;
  AUDIO.masterLevel = safeVolume(AUDIO.volume) * MASTER_SCALE; AUDIO.sfxLevel = AUDIO.sound ? safeVolume(AUDIO.sfxVolume, 1) : 0; // what the gains are asked for, kept for the tests
  glide(AUDIO.master.gain, AUDIO.masterLevel, ctx);
  // Music volume and Effects volume (1 is the level the mix was built at; they only turn it down) sit under the same switches as before.
  glide(AUDIO.sfxGain.gain, AUDIO.sfxLevel, ctx);
  leveled.add(ctx);
  // Sound effects, Music and Ambience are three separate switches. Music never depended on the effects switch: a
  // player who turns the effects off keeps the music, as before the ambience was added.
  AUDIO.musicLevel = AUDIO.music ? MUSIC_LEVEL * safeVolume(AUDIO.musicVolume, 1) : 0; // what the music bus is asked for, kept for the tests
  AUDIO.kit.music.level(AUDIO.musicLevel);
  AUDIO.kit.amb.level(AUDIO.ambience ? AMBIENCE_LEVEL : 0);
  AUDIO.kit.mute(AUDIO.masterLevel === 0); // at volume 0 nothing is heard, so no music or bed is built
}

// Cue building. A cue is built inside a small context (CUE): the audio context, where it goes, one draw of
// random variation shared by its layers (detune 10 to 30 cents, 1 to 2 dB of gain, a noise offset), its pan and
// its level trim. The live game and the offline measurement (cueRender) build cues the same way.
let CUE = null;
const jitter = (rnd) => ({ f: 2 ** ((rnd() < 0.5 ? -1 : 1) * (10 + 20 * rnd()) / 1200), g: 10 ** (-(1 + rnd()) / 20), o: rnd() });
const seeded = (seed) => { let x = seed >>> 0; return () => { x = (x + 0x6D2B79F5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pick = (xs) => xs[(CUE.rnd() * xs.length) | 0];
function tone(freq, dur, { type = 'sine', gain = 0.2, at = 0, attack = 0.005, slide = 0 } = {}) {
  const ctx = CUE.ctx, t = ctx.currentTime + CUE.at + at, f = freq * CUE.j.f, v = gain * CUE.j.g * CUE.trim;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
  g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(CUE.dest); o.start(t); o.stop(t + dur + 0.05);
}
// One buffer of noise per audio context (two seconds, made once) serves every burst. Each burst starts it at its own offset, from this cue's
// draw plus a counter, so no two swooshes are sample-identical and nothing is allocated per cue.
const NOISE_SECONDS = 2;
const NOISE_ATTACK = 0.002; // 4 ms read 0.963 at the busiest set (0.953 before): a softer start hits the limiter less, so the rest of the set came through louder
const noiseBuffers = new WeakMap();
function noiseBuffer(ctx) {
  let buf = noiseBuffers.get(ctx);
  if (!buf) {
    buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
    const d = buf.getChannelData(0), rnd = seeded(0x4E015E);
    for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
    noiseBuffers.set(ctx, buf);
  }
  return buf;
}
function noise(dur, { gain = 0.15, at = 0, freq = 1200, q = 0.8, type = 'bandpass', sweep = 0 } = {}) {
  const ctx = CUE.ctx, t = ctx.currentTime + CUE.at + at, fq = freq * CUE.j.f;
  const off = ((CUE.j.o + (CUE.n = (CUE.n || 0) + 1) * 0.618034) % 1) * (NOISE_SECONDS - dur);
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noiseBuffer(ctx); f.type = type; f.frequency.setValueAtTime(fq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(fq * sweep, t + dur);
  // a burst rises over NOISE_ATTACK seconds, as tone() does, so it never starts at a random sample value
  const top = gain * CUE.j.g * CUE.trim, rise = Math.min(NOISE_ATTACK, dur / 2);
  // the gain starts at silence from the moment the node exists: a source that begins part-way through a render block would otherwise pass its first sample at the default gain of 1
  g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(top, t + rise); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(CUE.dest); src.start(t, off, dur + 0.02);
}

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
// Every pitched cue is played in the key of the music under it. A cue is written in C (major pentatonic steps above a C-based pitch); a cue's tune
// moves it to the tonic of the piece that is playing (shift, in semitones, from C) and, for a piece in a minor-sounding mode (Dorian), flattens the
// third and the seventh, so the chimes never land a semitone from the music. A piece with no key (nothing playing yet) is C.
const C4 = 261.6256;
const tuneOf = (score) => { const sc = SCORES[score]; if (!sc) return { shift: 0, minor: false }; const pc = sc.key % 12; return { shift: pc > 6 ? pc - 12 : pc, minor: !!(sc.scale && sc.scale[2] === 3) }; };
const note = (base, step) => {
  let semis = Math.round(12 * Math.log2(base / C4)) + SCALE[Math.min(step, SCALE.length - 1)];
  if (CUE.minor && (semis % 12 === 4 || semis % 12 === 11)) semis -= 1;
  return C4 * 2 ** ((semis + CUE.shift) / 12);
};
// A fuller win phrase is scaled down by star count so all three peak together inside the cue range (measured with cueRender; a plain win is unchanged).
const WIN_FIT = [1, 1, 0.79, 0.63]; // was [1, 1, 0.6, 0.38] before the trims of CUE_TRIM (each win now peaks 0.46 to 0.6 at the maximum volume; the fuller phrases were fitted lower because they were louder)
// The star cues of the results card ring one after another under the win phrase and over the music; each is turned down (measured with mixRender at a delayed start, as it sounds live) so the whole card stays under 0.95 at the maximum volume.
const STAR_FIT = [1, 0.8, 0.8, 0.83];
// The results cards ring the stars a second time (screens.js) at these levels, struck with the card's real timing (win at 0, stars at 380, 560 and 740 ms, the earned chime at 810, 990 or 1170 ms).
export const CARD_STAR_LEVEL = [1, 1, 1, 1]; // was [1, 0.55, 0.85, 0.72] while the cues were louder; with the trims of CUE_TRIM the cards peak well under 0.95 at the full level (tests/council-w4-a), so it is one line to turn them down again
// Level trim per cue, measured with cueRender (struck 0.2 s in, as heard): gameplay cues peak between 0.2 and 0.45 at the default volume, and none peaks above about 0.6 at the maximum volume (the owner's loudness
// decision 69; the worst of every argument and four draws). The trims before it were fitted from time 0, where the limiter reads a cue two to four times low, so at the maximum volume 14 cues alone peaked 0.95 to 1.25:
// { select: 25, swap: 23, bounce: 24, match: 10.6, cascade: 13.6, stone: 7.4, crystal: 6.6, special: 14, tufa: 29, lock: 37, moss: 33, fog: 17, token: 11, spread: 80, reshuffle: 12, win: 5.4, lose: 5.8, star: 19, click: 59, booster: 24, goal: 5.7, low: 7, world: 5.5, earned: 7.3, intro: 5.7, combo: 7.6, starline: 17, encore: 6.1 }.
const CUE_TRIM = { select: 5.15, swap: 6.42, bounce: 5.66, match: 2.84, cascade: 3.29, stone: 1.6, crystal: 4.9, special: 6.69, tufa: 5.77, lock: 8.21, moss: 8.71, fog: 4.05, token: 6.78, spread: 23, reshuffle: 9.84, win: 3.84, lose: 4.47, star: 8.36, click: 16.5, booster: 5.98, goal: 3.67, low: 1.84, world: 4.41, earned: 6.48, intro: 5.7, combo: 4.35, starline: 7.94, encore: 4.48 };
export { tuneOf };
export const CUE_NAMES = Object.keys(CUE_TRIM);
const pannerFor = (ctx, dest, pan) => { if (!pan || !ctx.createStereoPanner) return dest; const p = ctx.createStereoPanner(); p.pan.value = Math.max(-0.7, Math.min(0.7, pan)); p.connect(dest); return p; };

// The cues. arg climbs a chain, a count or a star; opt.pan puts it where it happened (-0.7 left to 0.7 right), opt.size is how many pieces cleared and opt.at delays it by that many seconds, opt.level (default 1) scales it and opt.tune is the key it is played in.
function buildCue(name, arg, opt) {
  const size = opt.size || 0;
  switch (name) {
    case 'select': { const f = note(784, pick([0, 1, 2, 3])); tone(f, 0.07, { type: 'triangle', gain: 0.07 }); tone(f * 2, 0.05, { gain: 0.02 }); noise(0.03, { gain: 0.03, freq: 5000, type: 'highpass' }); break; }
    case 'swap': noise(0.12, { gain: 0.05, freq: 900, sweep: 2 }); tone(150, 0.09, { gain: 0.07, slide: 0.6 }); break;
    case 'bounce': tone(220, 0.12, { type: 'triangle', gain: 0.08, slide: 0.7 }); noise(0.05, { gain: 0.04, freq: 500, type: 'lowpass' }); break;
    case 'match': {
      const f = note(523.25, arg), up = 1 + 0.06 * Math.min(arg, 5);
      tone(f, 0.35, { gain: 0.12 * up }); tone(f * 2, 0.25, { gain: 0.04, at: 0.01 }); tone(note(523.25, arg + 3), 0.3, { type: 'triangle', gain: 0.03, at: 0.03 });
      noise(0.03, { gain: 0.05, freq: 3200, q: 1.5 });
      if (size >= 5) tone(f * 4, 0.3, { gain: 0.025, at: 0.04 });
      break;
    }
    case 'cascade': noise(0.55, { gain: 0.16, freq: 600, sweep: 4, q: 0.6 }); tone(330, 0.4, { gain: 0.06, slide: 2 }); noise(0.3, { gain: 0.04, freq: 3000, type: 'highpass', at: 0.05 }); break;
    case 'stone': tone(90, 0.35, { gain: 0.25, slide: 0.5 }); noise(0.3, { gain: 0.12, freq: 300, type: 'lowpass' }); tone(55, 0.4, { gain: 0.1, slide: 0.7 }); break;
    case 'crystal': { const d0 = pick([0, 1, 2]); for (let j = 0; j < 6; j++) tone(note(1046.5, d0 + j), 0.5, { gain: 0.05, at: j * 0.05 }); noise(0.5, { gain: 0.03, freq: 6000, type: 'highpass', at: 0.1 }); break; }
    case 'special': tone(note(784, 0), 0.18, { type: 'triangle', gain: 0.07 }); tone(note(1175, 0), 0.25, { gain: 0.05, at: 0.06 }); noise(0.04, { gain: 0.03, freq: 4000, q: 2 }); break;
    case 'tufa': noise(0.16, { gain: 0.14, freq: pick([450, 560, 700]), q: 1.2 }); tone(200, 0.08, { gain: 0.05, slide: 0.6 }); break;
    case 'lock': tone(180, 0.12, { type: 'square', gain: 0.04 }); noise(0.1, { gain: 0.08, freq: pick([2200, 2500, 2900]), q: 3 }); break;
    case 'moss': noise(0.2, { gain: 0.08, freq: 400, sweep: 0.5 }); tone(120, 0.15, { gain: 0.04, slide: 0.7 }); break;
    case 'fog': noise(0.4, { gain: 0.07, freq: 2000, sweep: 0.3, type: 'highpass' }); noise(0.3, { gain: 0.03, freq: 700, sweep: 0.5, at: 0.05 }); break;
    case 'token': { const f = note(1046.5, Math.min(arg, 4)); tone(f, 0.25, { type: 'triangle', gain: 0.07 }); tone(note(1046.5, Math.min(arg, 4) + 3), 0.3, { gain: 0.05, at: 0.08 }); noise(0.03, { gain: 0.03, freq: 6000, type: 'highpass', at: 0.08 }); break; }
    case 'spread': tone(150, 0.3, { type: 'sawtooth', gain: 0.02, slide: 0.8 }); noise(0.25, { gain: 0.02, freq: 250, type: 'lowpass' }); break;
    case 'reshuffle': for (let j = 0; j < 4; j++) noise(0.1, { gain: 0.05, freq: 1200 + j * 300, at: j * 0.07 }); tone(note(392, pick([0, 1, 2])), 0.25, { gain: 0.03, at: 0.28 }); break;
    case 'win': { // arg is the stars won: one is the plain phrase, two adds a harmony under its last notes, three harmony throughout, a shimmer and a held chord
      const st = Math.max(1, Math.min(3, arg | 0)), k = WIN_FIT[st];
      [0, 2, 4, 5].forEach((s, j) => {
        tone(note(523.25, s + 2), 0.5, { type: 'triangle', gain: 0.09 * k, at: j * 0.12 }); tone(note(523.25, s + 2) * 2, 0.4, { gain: 0.025 * k, at: j * 0.12 });
        if (st >= 2 && (st === 3 || j >= 2)) tone(note(523.25, s), 0.5, { gain: 0.04 * k, at: j * 0.12 });
      });
      if (st === 3) {
        [0, 2, 4].forEach((d, j) => tone(note(1046.5, d + 4), 0.55, { gain: 0.03 * k, at: 0.5 + j * 0.07 }));
        tone(note(523.25, 7), 0.9, { type: 'triangle', gain: 0.04 * k, at: 0.36 }); noise(0.7, { gain: 0.02 * k, freq: 6500, type: 'highpass', at: 0.45 });
      }
      break;
    }
    case 'encore': tone(note(523.25, 5), 0.18, { type: 'triangle', gain: 0.09 }); tone(note(523.25, 7), 0.3, { type: 'triangle', gain: 0.09, at: 0.1 }); tone(note(1046.5, 9), 0.35, { gain: 0.03, at: 0.12 }); noise(0.3, { gain: 0.03, freq: 5000, type: 'highpass', at: 0.08 }); break;
    case 'lose': [4, 2, 0].forEach((s, j) => { tone(note(261.6, s), 0.5, { gain: 0.08, at: j * 0.18 }); tone(note(261.6, s) / 2, 0.5, { type: 'triangle', gain: 0.03, at: j * 0.18 }); }); break;
    case 'star': { const k = STAR_FIT[Math.max(1, Math.min(3, arg | 0))]; tone(note(523.25, 3 + arg * 2), 0.3, { type: 'triangle', gain: 0.07 * k }); tone(note(523.25, 3 + arg * 2) * 2, 0.35, { gain: 0.03 * k, at: 0.02 }); break; }
    case 'click': { const f = note(523.25, pick([2, 3, 4])); tone(f, 0.04, { type: 'square', gain: 0.025 }); noise(0.02, { gain: 0.02, freq: 4000, type: 'highpass' }); break; }
    case 'booster': noise(0.3, { gain: 0.1, freq: 800, sweep: 3 }); tone(440, 0.3, { type: 'triangle', gain: 0.04, slide: 2 }); break;
    case 'goal': { const f = note(659.25, 0); tone(f, 0.3, { gain: 0.09 }); tone(f * 2, 0.25, { gain: 0.025 }); tone(note(659.25, 3), 0.5, { gain: 0.1, at: 0.13 }); tone(note(659.25, 3) * 2, 0.4, { gain: 0.03, at: 0.13 }); break; }
    case 'low': { const hi = arg <= 1, f = hi ? note(880, 0) : note(587.33, 0); for (let j = 0; j < (hi ? 2 : 1); j++) { tone(f, 0.09, { type: 'triangle', gain: hi ? 0.07 : 0.26, at: j * 0.12 }); noise(0.025, { gain: hi ? 0.03 : 0.1, freq: 3000, q: 2, at: j * 0.12 }); } break; }
    case 'world': { [0, 2, 3, 5, 7].forEach((s, j) => { tone(note(392, s), 0.9, { type: 'triangle', gain: 0.07, at: j * 0.16 }); tone(note(392, s) * 2, 0.8, { gain: 0.025, at: j * 0.16 }); }); tone(note(392, 7) / 2, 1.4, { gain: 0.05, at: 0.8 }); noise(1, { gain: 0.02, freq: 6000, type: 'highpass', at: 0.7 }); break; }
    case 'earned': for (let j = 0; j < 4; j++) { const f = note(1046.5, j * 2); tone(f, 0.35, { gain: 0.05, at: j * 0.07 }); tone(f * 2, 0.2, { gain: 0.012, at: j * 0.07 }); } break;
    case 'intro': tone(note(392, 0), 0.6, { gain: 0.04, attack: 0.25, slide: 1.5 }); tone(note(523.25, 2), 0.6, { gain: 0.05, at: 0.35 }); tone(note(523.25, 2) * 2, 0.4, { gain: 0.012, at: 0.35 }); break;
    case 'combo': tone(110, 0.35, { type: 'sawtooth', gain: 0.07, slide: 0.5 }); noise(0.5, { gain: 0.12, freq: 500, sweep: 6, q: 0.6 }); [0, 2, 3].forEach((s, j) => tone(note(523.25, s), 0.5, { gain: 0.05, at: 0.12 + j * 0.05 })); break;
    case 'starline': tone(note(523.25, 3 + arg * 2), 0.25, { type: 'triangle', gain: 0.06 }); tone(note(523.25, 6 + arg * 2), 0.3, { gain: 0.03, at: 0.07 }); break;
    default: break;
  }
}
export function runCue(name, arg, opt, ctx, dest, rnd) {
  if (!(name in CUE_TRIM)) return;
  const prev = CUE;
  CUE = { ctx, dest: pannerFor(ctx, dest, opt.pan), rnd, j: jitter(rnd), trim: CUE_TRIM[name] * (opt.level ?? 1), at: opt.at || 0, shift: opt.tune ? opt.tune.shift : 0, minor: !!(opt.tune && opt.tune.minor) };
  try { buildCue(name, arg, opt); } finally { CUE = prev; }
}
// Cues struck together (the sounds of one beat, or of every beat a skip folds into one) get quieter as they pile up, so even at the maximum
// volume a folded set (goal, combo, crystal, match, stone ...) stays under 0.95 at the speakers, summed (tests/council-w3-d). Up to three together are as loud as one.
// From three cues up each is struck at sqrt(3 / n), so the sound grows as the square root of the count (0.87 at four, 0.77 at five, 0.58 at nine) instead of falling as 1.5 / n (0.375 at four, which left
// a goal chime in a fold of four at 0.18, under the 0.2 floor).
export const crowdLevel = (n) => (n <= 3 ? 1 : Math.max(0.2, Math.sqrt(3 / n)));
// The big cues pull the music down for a moment so they are heard over it.
const DUCKS = { win: [6, 700], lose: [6, 700], world: [6, 1100] };

export function sfx(name, arg = 0, opt = {}) {
  AUDIO.played.push(name); AUDIO.calls.push({ name, arg, level: opt.level ?? 1, at: opt.at || 0 });
  if (AUDIO.played.length > 50) { AUDIO.played.shift(); AUDIO.calls.shift(); }
  if (!AUDIO.sound || !ensure() || AUDIO.ctx.state !== 'running') return;
  if (DUCKS[name]) AUDIO.kit?.music.duck(...DUCKS[name]);
  runCue(name, arg, { tune: tuneOf(AUDIO.mood && AUDIO.mood.score), ...opt }, AUDIO.ctx, AUDIO.sfxGain, Math.random);
}

// Music and ambience. A mood is the piece and the bed that should be playing: the title and the map share a
// theme, the level card has a calmer bed, each world has its own piece and place, and the result cards cool down.
// setMood only records the wish until the first gesture has made the audio context; nothing is scheduled before that.
export function setMood(kind, world = 1) {
  const [score, scene] = WORLD_MOOD[world] || WORLD_MOOD[1];
  AUDIO.mood = kind === 'title' || kind === 'map' ? { score: 'title', scene: 'town' }
    : kind === 'intro' ? { score: 'intro', scene }
      : kind === 'results' ? { score: 'results', scene }
        : kind === 'play' ? { score, scene } : null;
  AUDIO.holds.delete('pause');
  if (AUDIO.kit) { AUDIO.kit.music.intensity(0); syncHold(); syncMood(); }
}
function syncMood(fade = 1.6) {
  const k = AUDIO.kit, m = AUDIO.mood;
  if (!k) return;
  k.music.play(m ? SCORES[m.score] : null, { fade });
  k.amb.play(m ? SCENES[m.scene] : null, { fade: fade + 0.6 });
}
const syncHold = () => { const k = AUDIO.kit; if (!k) return; if (AUDIO.holds.size) { if (!k.held) k.hold(); } else if (k.held) { k.release(); restartMusic(); } };
// A hold leaves the rest of the bar it interrupted in the graph (silent); starting the piece afresh on release means that tail never plays over the new notes.
function restartMusic() { const m = AUDIO.mood; if (!AUDIO.kit || !m) return; AUDIO.kit.music.play(null, { fade: 0.02 }); AUDIO.kit.music.play(SCORES[m.score], { fade: 0.6 }); }
export const startMusic = (world) => setMood('play', world);
export const stopMusic = () => setMood(null);
// The last few moves: the pulse lifts a little (tempo, brightness) until the level ends.
export function setMusicIntensity(x) { if (AUDIO.kit) AUDIO.kit.music.intensity(x); }
// holdMusic fades music and ambience out for a reason ('tab' hidden, 'pause' card) and schedules nothing; they come back once every hold is released.
export function holdMusic(reason) { AUDIO.holds.add(reason); syncHold(); }
export function releaseMusic(reason) { AUDIO.holds.delete(reason); syncHold(); }
// Tab hidden or page leaving: fade out, then suspend the context so nothing plays in the background.
export function pauseAudio() {
  holdMusic('tab');
  const c = AUDIO.ctx; if (!c) return;
  clearTimeout(AUDIO.suspendTimer);
  if (c.state === 'running') AUDIO.master.gain.setTargetAtTime(0, c.currentTime, 0.04);
  AUDIO.suspendTimer = setTimeout(() => { try { c.suspend().catch(() => {}); } catch (_) { /* best effort */ } }, 150);
}
export function resumeAudio() {
  clearTimeout(AUDIO.suspendTimer);
  const c = AUDIO.ctx;
  if (c) { applyLevels(); if (c.state !== 'running') try { c.resume().catch(() => {}); } catch (_) { /* best effort */ } }
  releaseMusic('tab');
}

// Test hooks: every piece and bed by name, and a render of one of them on its own offline context through the same
// chain the game ships (master volume, limiter, level). Never touches the live audio or the settings.
// What a player would hear right now, for tests: the mood, whether it is held, and the two buses' levels.
export function audioState() {
  const k = AUDIO.kit;
  return { ctx: AUDIO.ctx ? AUDIO.ctx.state : null, master: AUDIO.master ? +AUDIO.masterLevel.toFixed(3) : null, masterNow: AUDIO.master ? +AUDIO.master.gain.value.toFixed(3) : null, mood: AUDIO.mood, held: !!(k && k.held), muted: !!(k && k.muted), holds: [...AUDIO.holds], music: k ? +k.buses.music.gain.value.toFixed(3) : null, musicLevel: k ? +AUDIO.musicLevel.toFixed(3) : null, sfx: AUDIO.sfxGain ? +AUDIO.sfxLevel.toFixed(3) : null, ambience: k ? +k.buses.ambience.gain.value.toFixed(3) : null, intensity: k ? k.intensity : null, playing: k ? { music: !!k.music.score, ambience: !!k.amb.scene } : null };
}
export const audioList = () => ({ music: Object.keys(SCORES), ambience: Object.keys(SCENES), cues: CUE_NAMES, cardStarLevel: CARD_STAR_LEVEL.slice() });
// What a render is heard through: the master volume (the shipped default unless a test asks for another, for example the slider at
// its maximum) and the limiter. Every hook below builds it the same way, so a measurement is what the speakers get.
const offlineMaster = (ctx, out, lv = {}) => { const master = ctx.createGain(); master.gain.value = safeVolume(lv.volume ?? 0.5) * MASTER_SCALE; master.connect(limiter(ctx)).connect(out); return master; };
const offlineSfx = (ctx, master, lv = {}) => { const g = ctx.createGain(); g.gain.value = safeVolume(lv.sfxVolume ?? 1, 1); g.connect(master); return g; };
// Everything a render measures starts RENDER_START seconds into it, as it does in the live game (a cue never sounds at the instant the context
// starts). The offline limiter reads a sound in its first 0.2 s two to four times low: tufa alone at the default volume reads 0.28 from time 0 and 0.91
// from 0.2 s. levels.start moves the start (0 gives the old reading, which the older fitting tests of waves 2 and 3 were written against).
export const RENDER_START = 0.2;
const startOf = (lv = {}) => (Number.isFinite(lv.start) && lv.start >= 0 ? lv.start : RENDER_START);
export function audioRender(name, seconds = 30, wantWav = false, levels = {}) {
  const score = SCORES[name], scene = SCENES[name], t0 = startOf(levels);
  if (!score && !scene) return Promise.reject(new Error('unknown audio: ' + name));
  return measureAudio((ctx, out) => {
    const master = offlineMaster(ctx, out, levels);
    const kit = makeAudioKit(ctx, master, { seed: 0x5EED1 });
    kit.music.level(MUSIC_LEVEL * safeVolume(levels.musicVolume ?? 1, 1)); kit.amb.level(AMBIENCE_LEVEL * safeVolume(levels.ambience ?? 1, 1));
    kit.mute(safeVolume(levels.volume ?? 0.5) === 0); // the same rule the live game follows: at volume 0 nothing is built
    if (score) kit.music.play(score, { fade: 0.05, at: t0 }); else kit.amb.play(scene, { fade: 0.05, at: t0 });
    kit.scheduleUntil(t0 + seconds);
    return () => { const b = score && kit.music.info(); return b && { ...b, formSeconds: +((b.formBars * (score.beats || 4) * 60) / score.bpm).toFixed(1) }; };
  }, t0 + seconds, { wav: wantWav });
}
// One cue on its own offline context at the shipping level (default volume, master and limiter), struck RENDER_START seconds in. seed picks the random
// variation, so a test can render the same cue twice with different draws. Never touches the live audio.
export function cueRender(name, arg = 0, opt = {}, seconds = 2.5, wantWav = false, seed = 1, levels = {}) {
  if (!CUE_NAMES.includes(name)) return Promise.reject(new Error('unknown cue: ' + name));
  const t0 = startOf(levels);
  return measureAudio((ctx, out) => {
    const master = offlineMaster(ctx, out, levels);
    runCue(name, arg, { tune: tuneOf(opt.score), ...opt, at: t0 + (opt.at || 0) }, ctx, offlineSfx(ctx, master, levels), seeded(seed));
  }, t0 + seconds, { wav: wantWav });
}
// The busiest moment: a piece at full intensity, a bed and a run of cues struck together, as one render. spec = { piece, bed, cues: [{ name, arg, opt, at, seed }],
// seconds, levels }; every time is counted from RENDER_START. The big cues' ducking of the music is left out, which is the louder, safer case to measure.
export function mixRender(spec) {
  const { piece, bed, cues = [], seconds = 6, levels = {} } = spec, t0 = startOf(levels);
  return measureAudio((ctx, out) => {
    const master = offlineMaster(ctx, out, levels), sfxBus = offlineSfx(ctx, master, levels);
    const kit = makeAudioKit(ctx, master, { seed: 0x5EED1 });
    kit.music.level(MUSIC_LEVEL * safeVolume(levels.musicVolume ?? 1, 1)); kit.amb.level(AMBIENCE_LEVEL); kit.music.intensity(1);
    if (piece) kit.music.play(SCORES[piece], { fade: 0.05, at: t0 });
    if (bed) kit.amb.play(SCENES[bed], { fade: 0.05, at: t0 });
    kit.scheduleUntil(t0 + seconds);
    for (const c of cues) runCue(c.name, c.arg || 0, { ...(c.opt || {}), at: t0 + (c.at || 0) }, ctx, sfxBus, seeded(c.seed || 1));
  }, t0 + seconds, {});
}
