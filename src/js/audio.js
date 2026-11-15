// WebAudio synthesis: no audio files. Glassy chimes that rise with each chain wave, a piece of generative
// music per world and screen, and a bed of place sound under it (music.js holds the scores and scenes, audio-kit.js
// the engine). Quiet by default, with separate Sound effects, Music and Ambience switches (PRD §7, AC42).
// Pattern adapted from games/property-game/src/js/audio.js (tone + filtered noise with exponential envelopes).
import { makeAudioKit, measureAudio } from './audio-kit.js';
import { SCORES, SCENES, WORLD_MOOD } from './music.js';

export const AUDIO = { ctx: null, master: null, sfxGain: null, kit: null, sound: true, music: true, ambience: true, volume: 0.5, played: [], mood: null, holds: new Set(), suspendTimer: 0 };
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
const safeVolume = (v) => (Number.isFinite(+v) && v !== null && v !== '' ? Math.min(1, Math.max(0, +v)) : 0.5);
export function applyLevels() {
  if (!AUDIO.ctx) return;
  AUDIO.master.gain.cancelScheduledValues(AUDIO.ctx.currentTime);
  AUDIO.master.gain.value = safeVolume(AUDIO.volume) * MASTER_SCALE;
  AUDIO.sfxGain.gain.value = AUDIO.sound ? 1 : 0;
  // Sound effects, Music and Ambience are three separate switches. Music never depended on the effects switch: a
  // player who turns the effects off keeps the music, as before the ambience was added.
  AUDIO.kit.music.level(AUDIO.music ? MUSIC_LEVEL : 0);
  AUDIO.kit.amb.level(AUDIO.ambience ? AMBIENCE_LEVEL : 0);
}

// Cue building. A cue is built inside a small context (CUE): the audio context, where it goes, one draw of
// random variation shared by its layers (detune 10 to 30 cents, 1 to 2 dB of gain, a noise offset), its pan and
// its level trim. The live game and the offline measurement (cueRender) build cues the same way.
let CUE = null;
const jitter = (rnd) => ({ f: 2 ** ((rnd() < 0.5 ? -1 : 1) * (10 + 20 * rnd()) / 1200), g: 10 ** (-(1 + rnd()) / 20), o: rnd() });
const seeded = (seed) => { let x = seed >>> 0; return () => { x = (x + 0x6D2B79F5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pick = (xs) => xs[(CUE.rnd() * xs.length) | 0];
function tone(freq, dur, { type = 'sine', gain = 0.2, at = 0, attack = 0.005, slide = 0 } = {}) {
  const ctx = CUE.ctx, t = ctx.currentTime + at, f = freq * CUE.j.f, v = gain * CUE.j.g * CUE.trim;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(CUE.dest); o.start(t); o.stop(t + dur + 0.05);
}
// Every noise burst fills its own buffer from this cue's draw plus a counter, so no two swooshes are sample-identical.
function noise(dur, { gain = 0.15, at = 0, freq = 1200, q = 0.8, type = 'bandpass', sweep = 0 } = {}) {
  const ctx = CUE.ctx, t = ctx.currentTime + at, fq = freq * CUE.j.f;
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  let seed = (Math.floor(CUE.j.o * 0x3fffffff) + (CUE.n = (CUE.n || 0) + 1) * 7919) & 0x7fffffff;
  for (let i = 0; i < n; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; d[i] = (seed / 0x3fffffff - 1) * (1 - i / n); }
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf; f.type = type; f.frequency.setValueAtTime(fq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(fq * sweep, t + dur);
  g.gain.setValueAtTime(gain * CUE.j.g * CUE.trim, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(CUE.dest); src.start(t);
}

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (base, step) => base * 2 ** (SCALE[Math.min(step, SCALE.length - 1)] / 12);
// Level trim per cue, measured with cueRender so gameplay cues peak between 0.2 and 0.45 at the default volume (before this they peaked 0.01 to 0.15).
const CUE_TRIM = { select: 25, swap: 23, bounce: 24, match: 10.6, cascade: 13.6, stone: 7.4, crystal: 6.6, special: 14, tufa: 29, lock: 37, moss: 33, fog: 17, token: 11, spread: 80, reshuffle: 12, win: 5.4, lose: 5.8, star: 19, click: 59, booster: 24, goal: 5.7, low: 7, world: 5.5, earned: 7.3, intro: 5.7, combo: 7.6, starline: 17 };
export const CUE_NAMES = Object.keys(CUE_TRIM);
const pannerFor = (ctx, dest, pan) => { if (!pan || !ctx.createStereoPanner) return dest; const p = ctx.createStereoPanner(); p.pan.value = Math.max(-0.7, Math.min(0.7, pan)); p.connect(dest); return p; };

// The cues. arg climbs a chain, a count or a star; opt.pan puts it where it happened (-0.7 left to 0.7 right) and opt.size is how many pieces cleared.
function buildCue(name, arg, opt) {
  const size = opt.size || 0;
  switch (name) {
    case 'select': { const f = note(784, pick([0, 1, 2, 3])); tone(f, 0.07, { type: 'triangle', gain: 0.07 }); tone(f * 2, 0.05, { gain: 0.02 }); noise(0.03, { gain: 0.03, freq: 5000, type: 'highpass' }); break; }
    case 'swap': noise(0.12, { gain: 0.05, freq: 900, sweep: 2 }); tone(150, 0.09, { gain: 0.07, slide: 0.6 }); break;
    case 'bounce': tone(220, 0.12, { type: 'triangle', gain: 0.08, slide: 0.7 }); noise(0.05, { gain: 0.04, freq: 500, type: 'lowpass' }); break;
    case 'match': {
      const f = note(523.25, arg), up = 1 + 0.06 * Math.min(arg, 5);
      tone(f, 0.35, { gain: 0.12 * up }); tone(f * 2, 0.25, { gain: 0.04, at: 0.01 }); tone(f * 1.5, 0.3, { type: 'triangle', gain: 0.03, at: 0.03 });
      noise(0.03, { gain: 0.05, freq: 3200, q: 1.5 });
      if (size >= 5) tone(f * 3, 0.3, { gain: 0.025, at: 0.04 });
      break;
    }
    case 'cascade': noise(0.55, { gain: 0.16, freq: 600, sweep: 4, q: 0.6 }); tone(330, 0.4, { gain: 0.06, slide: 2 }); noise(0.3, { gain: 0.04, freq: 3000, type: 'highpass', at: 0.05 }); break;
    case 'stone': tone(90, 0.35, { gain: 0.25, slide: 0.5 }); noise(0.3, { gain: 0.12, freq: 300, type: 'lowpass' }); tone(55, 0.4, { gain: 0.1, slide: 0.7 }); break;
    case 'crystal': { const d0 = pick([0, 1, 2]); for (let j = 0; j < 6; j++) tone(note(1046.5, d0 + j), 0.5, { gain: 0.05, at: j * 0.05 }); noise(0.5, { gain: 0.03, freq: 6000, type: 'highpass', at: 0.1 }); break; }
    case 'special': tone(784, 0.18, { type: 'triangle', gain: 0.07 }); tone(1175, 0.25, { gain: 0.05, at: 0.06 }); noise(0.04, { gain: 0.03, freq: 4000, q: 2 }); break;
    case 'tufa': noise(0.16, { gain: 0.14, freq: pick([450, 560, 700]), q: 1.2 }); tone(200, 0.08, { gain: 0.05, slide: 0.6 }); break;
    case 'lock': tone(180, 0.12, { type: 'square', gain: 0.04 }); noise(0.1, { gain: 0.08, freq: pick([2200, 2500, 2900]), q: 3 }); break;
    case 'moss': noise(0.2, { gain: 0.08, freq: 400, sweep: 0.5 }); tone(120, 0.15, { gain: 0.04, slide: 0.7 }); break;
    case 'fog': noise(0.4, { gain: 0.07, freq: 2000, sweep: 0.3, type: 'highpass' }); noise(0.3, { gain: 0.03, freq: 700, sweep: 0.5, at: 0.05 }); break;
    case 'token': { const f = note(1175, Math.min(arg, 4)); tone(f, 0.25, { type: 'triangle', gain: 0.07 }); tone(f * 1.335, 0.3, { gain: 0.05, at: 0.08 }); noise(0.03, { gain: 0.03, freq: 6000, type: 'highpass', at: 0.08 }); break; }
    case 'spread': tone(150, 0.3, { type: 'sawtooth', gain: 0.02, slide: 0.8 }); noise(0.25, { gain: 0.02, freq: 250, type: 'lowpass' }); break;
    case 'reshuffle': for (let j = 0; j < 4; j++) noise(0.1, { gain: 0.05, freq: 1200 + j * 300, at: j * 0.07 }); tone(note(392, pick([0, 1, 2])), 0.25, { gain: 0.03, at: 0.28 }); break;
    case 'win': [0, 2, 4, 5].forEach((s, j) => { tone(note(523.25, s + 2), 0.5, { type: 'triangle', gain: 0.09, at: j * 0.12 }); tone(note(523.25, s + 2) * 2, 0.4, { gain: 0.025, at: j * 0.12 }); }); break;
    case 'lose': [4, 2, 0].forEach((s, j) => { tone(note(261.6, s), 0.5, { gain: 0.08, at: j * 0.18 }); tone(note(261.6, s) / 2, 0.5, { type: 'triangle', gain: 0.03, at: j * 0.18 }); }); break;
    case 'star': tone(note(880, arg * 2), 0.3, { type: 'triangle', gain: 0.07 }); tone(note(880, arg * 2) * 2, 0.35, { gain: 0.03, at: 0.02 }); break;
    case 'click': { const f = note(660, pick([0, 2, 4])); tone(f, 0.04, { type: 'square', gain: 0.025 }); noise(0.02, { gain: 0.02, freq: 4000, type: 'highpass' }); break; }
    case 'booster': noise(0.3, { gain: 0.1, freq: 800, sweep: 3 }); tone(440, 0.3, { type: 'triangle', gain: 0.04, slide: 2 }); break;
    case 'goal': { const f = note(659.25, 0); tone(f, 0.3, { gain: 0.09 }); tone(f * 2, 0.25, { gain: 0.025 }); tone(note(659.25, 3), 0.5, { gain: 0.1, at: 0.13 }); tone(note(659.25, 3) * 2, 0.4, { gain: 0.03, at: 0.13 }); break; }
    case 'low': { const hi = arg <= 1, f = hi ? 880 : 587; for (let j = 0; j < (hi ? 2 : 1); j++) { tone(f, 0.09, { type: 'triangle', gain: hi ? 0.07 : 0.26, at: j * 0.12 }); noise(0.025, { gain: hi ? 0.03 : 0.1, freq: 3000, q: 2, at: j * 0.12 }); } break; }
    case 'world': { [0, 2, 3, 5, 7].forEach((s, j) => { tone(note(392, s), 0.9, { type: 'triangle', gain: 0.07, at: j * 0.16 }); tone(note(392, s) * 2, 0.8, { gain: 0.025, at: j * 0.16 }); }); tone(note(392, 7) / 2, 1.4, { gain: 0.05, at: 0.8 }); noise(1, { gain: 0.02, freq: 6000, type: 'highpass', at: 0.7 }); break; }
    case 'earned': for (let j = 0; j < 4; j++) { const f = note(1046.5, j * 2); tone(f, 0.35, { gain: 0.05, at: j * 0.07 }); tone(f * 3, 0.2, { gain: 0.012, at: j * 0.07 }); } break;
    case 'intro': tone(392, 0.6, { gain: 0.04, attack: 0.25, slide: 1.5 }); tone(note(523.25, 2), 0.6, { gain: 0.05, at: 0.35 }); tone(note(523.25, 2) * 2, 0.4, { gain: 0.012, at: 0.35 }); break;
    case 'combo': tone(110, 0.35, { type: 'sawtooth', gain: 0.07, slide: 0.5 }); noise(0.5, { gain: 0.12, freq: 500, sweep: 6, q: 0.6 }); [0, 2, 4].forEach((s, j) => tone(note(587.33, s), 0.5, { gain: 0.05, at: 0.12 + j * 0.05 })); break;
    case 'starline': tone(note(880, arg * 2), 0.25, { type: 'triangle', gain: 0.06 }); tone(note(880, arg * 2) * 1.5, 0.3, { gain: 0.03, at: 0.07 }); break;
    default: break;
  }
}
function runCue(name, arg, opt, ctx, dest, rnd) {
  if (!(name in CUE_TRIM)) return;
  const prev = CUE;
  CUE = { ctx, dest: pannerFor(ctx, dest, opt.pan), rnd, j: jitter(rnd), trim: CUE_TRIM[name] };
  try { buildCue(name, arg, opt); } finally { CUE = prev; }
}
// The big cues pull the music down for a moment so they are heard over it.
const DUCKS = { win: [6, 700], lose: [6, 700], world: [6, 1100] };

export function sfx(name, arg = 0, opt = {}) {
  AUDIO.played.push(name);
  if (AUDIO.played.length > 50) AUDIO.played.shift();
  if (!AUDIO.sound || !ensure() || AUDIO.ctx.state !== 'running') return;
  if (DUCKS[name]) AUDIO.kit?.music.duck(...DUCKS[name]);
  runCue(name, arg, opt, AUDIO.ctx, AUDIO.sfxGain, Math.random);
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
  return { ctx: AUDIO.ctx ? AUDIO.ctx.state : null, master: AUDIO.master ? +AUDIO.master.gain.value.toFixed(3) : null, mood: AUDIO.mood, held: !!(k && k.held), holds: [...AUDIO.holds], music: k ? +k.buses.music.gain.value.toFixed(3) : null, ambience: k ? +k.buses.ambience.gain.value.toFixed(3) : null, intensity: k ? k.intensity : null, playing: k ? { music: !!k.music.score, ambience: !!k.amb.scene } : null };
}
export const audioList = () => ({ music: Object.keys(SCORES), ambience: Object.keys(SCENES), cues: CUE_NAMES });
export function audioRender(name, seconds = 30, wantWav = false) {
  const score = SCORES[name], scene = SCENES[name];
  if (!score && !scene) return Promise.reject(new Error('unknown audio: ' + name));
  return measureAudio((ctx, out) => {
    const master = ctx.createGain(); master.gain.value = 0.5 * MASTER_SCALE; master.connect(limiter(ctx)).connect(out);
    const kit = makeAudioKit(ctx, master, { seed: 0x5EED1 });
    kit.music.level(MUSIC_LEVEL); kit.amb.level(AMBIENCE_LEVEL);
    if (score) kit.music.play(score, { fade: 0.05, at: 0 }); else kit.amb.play(scene, { fade: 0.05, at: 0 });
    kit.scheduleUntil(seconds);
    return () => { const b = score && kit.music.info(); return b && { ...b, formSeconds: +((b.formBars * (score.beats || 4) * 60) / score.bpm).toFixed(1) }; };
  }, seconds, { wav: wantWav });
}
// One cue on its own offline context at the shipping level (default volume, master and limiter). seed picks the random
// variation, so a test can render the same cue twice with different draws. Never touches the live audio.
export function cueRender(name, arg = 0, opt = {}, seconds = 2.5, wantWav = false, seed = 1) {
  if (!CUE_NAMES.includes(name)) return Promise.reject(new Error('unknown cue: ' + name));
  return measureAudio((ctx, out) => {
    const master = ctx.createGain(); master.gain.value = 0.5 * MASTER_SCALE; master.connect(limiter(ctx)).connect(out);
    runCue(name, arg, opt, ctx, master, seeded(seed));
  }, seconds, { wav: wantWav });
}
