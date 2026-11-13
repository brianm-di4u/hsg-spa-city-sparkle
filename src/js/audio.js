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
export function applyLevels() {
  if (!AUDIO.ctx) return;
  AUDIO.master.gain.cancelScheduledValues(AUDIO.ctx.currentTime);
  AUDIO.master.gain.value = AUDIO.volume * MASTER_SCALE;
  AUDIO.sfxGain.gain.value = AUDIO.sound ? 1 : 0;
  // Music and ambience obey the master Sound switch as well as their own, so a save that had sound off stays silent.
  AUDIO.kit.music.level(AUDIO.sound && AUDIO.music ? MUSIC_LEVEL : 0);
  AUDIO.kit.amb.level(AUDIO.sound && AUDIO.ambience ? AMBIENCE_LEVEL : 0);
}

function tone(freq, dur, { type = 'sine', gain = 0.2, at = 0, attack = 0.005, dest, slide = 0 } = {}) {
  const ctx = AUDIO.ctx, t = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || AUDIO.sfxGain); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, { gain = 0.15, at = 0, freq = 1200, q = 0.8, type = 'bandpass', sweep = 0 } = {}) {
  const ctx = AUDIO.ctx, t = ctx.currentTime + at;
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < n; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; d[i] = (seed / 0x3fffffff - 1) * (1 - i / n); }
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(freq * sweep, t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(AUDIO.sfxGain); src.start(t);
}

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (base, step) => base * 2 ** (SCALE[Math.min(step, SCALE.length - 1)] / 12);

export function sfx(name, arg = 0) {
  AUDIO.played.push(name);
  if (AUDIO.played.length > 50) AUDIO.played.shift();
  if (!AUDIO.sound || !ensure() || AUDIO.ctx.state !== 'running') return;
  switch (name) {
    case 'select': tone(880, 0.06, { type: 'triangle', gain: 0.05 }); break;
    case 'swap': noise(0.12, { gain: 0.05, freq: 900, sweep: 2 }); break;
    case 'bounce': tone(220, 0.12, { type: 'triangle', gain: 0.08, slide: 0.7 }); break;
    case 'match': { const f = note(523.25, arg); tone(f, 0.35, { type: 'sine', gain: 0.12 }); tone(f * 2, 0.25, { type: 'sine', gain: 0.04, at: 0.01 }); tone(f * 1.5, 0.3, { type: 'triangle', gain: 0.03, at: 0.03 }); break; }
    case 'cascade': noise(0.55, { gain: 0.16, freq: 600, sweep: 4, q: 0.6 }); tone(330, 0.4, { type: 'sine', gain: 0.06, slide: 2 }); break;
    case 'stone': tone(90, 0.35, { type: 'sine', gain: 0.25, slide: 0.5 }); noise(0.3, { gain: 0.12, freq: 300, type: 'lowpass' }); break;
    case 'crystal': for (let j = 0; j < 6; j++) tone(note(1046.5, j), 0.5, { type: 'sine', gain: 0.05, at: j * 0.05 }); break;
    case 'special': tone(784, 0.18, { type: 'triangle', gain: 0.07 }); tone(1175, 0.25, { type: 'sine', gain: 0.05, at: 0.06 }); break;
    case 'tufa': noise(0.16, { gain: 0.14, freq: 500, q: 1.2 }); break;
    case 'lock': tone(180, 0.12, { type: 'square', gain: 0.04 }); noise(0.1, { gain: 0.08, freq: 2500, q: 3 }); break;
    case 'moss': noise(0.2, { gain: 0.08, freq: 400, sweep: 0.5 }); break;
    case 'fog': noise(0.4, { gain: 0.07, freq: 2000, sweep: 0.3, type: 'highpass' }); break;
    case 'token': tone(1568, 0.25, { type: 'triangle', gain: 0.07 }); tone(2093, 0.3, { type: 'sine', gain: 0.05, at: 0.08 }); break;
    case 'spread': tone(150, 0.3, { type: 'sawtooth', gain: 0.02, slide: 0.8 }); break;
    case 'reshuffle': for (let j = 0; j < 4; j++) noise(0.1, { gain: 0.05, freq: 1200 + j * 300, at: j * 0.07 }); break;
    case 'win': AUDIO.kit?.music.duck(6, 700); [0, 2, 4, 5].forEach((s, j) => tone(note(523.25, s + 2), 0.5, { type: 'triangle', gain: 0.09, at: j * 0.12 })); break;
    case 'lose': AUDIO.kit?.music.duck(6, 700); [4, 2, 0].forEach((s, j) => tone(note(261.6, s), 0.5, { type: 'sine', gain: 0.08, at: j * 0.18 })); break;
    case 'star': tone(note(880, arg * 2), 0.3, { type: 'triangle', gain: 0.07 }); break;
    case 'click': tone(660, 0.04, { type: 'square', gain: 0.025 }); break;
    case 'booster': noise(0.3, { gain: 0.1, freq: 800, sweep: 3 }); break;
    default: break;
  }
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
  return { ctx: AUDIO.ctx ? AUDIO.ctx.state : null, mood: AUDIO.mood, held: !!(k && k.held), holds: [...AUDIO.holds], music: k ? +k.buses.music.gain.value.toFixed(3) : null, ambience: k ? +k.buses.ambience.gain.value.toFixed(3) : null, intensity: k ? k.intensity : null, playing: k ? { music: !!k.music.score, ambience: !!k.amb.scene } : null };
}
export const audioList = () => ({ music: Object.keys(SCORES), ambience: Object.keys(SCENES) });
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
