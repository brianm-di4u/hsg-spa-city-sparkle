// WebAudio synthesis: no audio files. Glassy chimes that rise with each chain wave, plus a soft
// ambient arpeggio per world. Quiet by default and mutable (PRD §7, AC42). Pattern adapted from
// games/property-game/src/js/audio.js (tone + filtered noise with exponential envelopes).
export const AUDIO = { ctx: null, master: null, sfxGain: null, musicGain: null, sound: true, music: true, volume: 0.5, played: [], musicTimer: 0, world: 1 };

function ensure() {
  if (AUDIO.ctx) return AUDIO.ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  AUDIO.ctx = ctx;
  AUDIO.master = ctx.createGain(); AUDIO.master.connect(ctx.destination);
  AUDIO.sfxGain = ctx.createGain(); AUDIO.sfxGain.connect(AUDIO.master);
  AUDIO.musicGain = ctx.createGain(); AUDIO.musicGain.connect(AUDIO.master);
  applyLevels();
  return ctx;
}
export function unlockAudio() { const c = ensure(); if (c && c.state === 'suspended') c.resume(); }
export function applyLevels() {
  if (!AUDIO.ctx) return;
  AUDIO.master.gain.value = AUDIO.volume * 0.6;
  AUDIO.sfxGain.gain.value = AUDIO.sound ? 1 : 0;
  AUDIO.musicGain.gain.value = AUDIO.music ? 0.22 : 0;
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
    case 'win': [0, 2, 4, 5].forEach((s, j) => tone(note(523.25, s + 2), 0.5, { type: 'triangle', gain: 0.09, at: j * 0.12 })); break;
    case 'lose': [4, 2, 0].forEach((s, j) => tone(note(261.6, s), 0.5, { type: 'sine', gain: 0.08, at: j * 0.18 })); break;
    case 'star': tone(note(880, arg * 2), 0.3, { type: 'triangle', gain: 0.07 }); break;
    case 'click': tone(660, 0.04, { type: 'square', gain: 0.025 }); break;
    case 'booster': noise(0.3, { gain: 0.1, freq: 800, sweep: 3 }); break;
    default: break;
  }
}

// Ambient music: a gentle pentatonic arpeggio over a soft pad, varied per world.
const MOODS = { 1: [261.6, 1], 2: [233.1, 0], 3: [220, 2], 4: [293.7, 1], 5: [246.9, 0], 6: [277.2, 1] };
export function startMusic(world) {
  AUDIO.world = world;
  stopMusic();
  if (!ensure()) return;
  let step = 0;
  const [base, style] = MOODS[world] || MOODS[1];
  const pattern = [[0, 4, 7, 4], [0, 2, 4, 7, 9, 7, 4, 2], [0, 3, 7, 10, 7, 3]][style];
  const tick = () => {
    if (AUDIO.music && AUDIO.ctx.state === 'running') {
      const s = pattern[step % pattern.length];
      tone(base * 2 ** (s / 12), 0.9, { type: 'sine', gain: 0.12, dest: AUDIO.musicGain, attack: 0.04 });
      if (step % pattern.length === 0) { tone(base / 2, 2.6, { type: 'triangle', gain: 0.08, dest: AUDIO.musicGain, attack: 0.3 }); tone(base * 0.75, 2.6, { type: 'sine', gain: 0.05, dest: AUDIO.musicGain, attack: 0.4 }); }
    }
    step++;
  };
  AUDIO.musicTimer = setInterval(tick, 420);
}
export function stopMusic() { if (AUDIO.musicTimer) clearInterval(AUDIO.musicTimer); AUDIO.musicTimer = 0; }
