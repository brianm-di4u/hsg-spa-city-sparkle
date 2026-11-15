// In-level controller: input → engine action → timeline playback → HUD, sounds, end-of-level flow.
import { newGame, apply, cloneState } from '../engine/game.js';
import { swappableAt, TOKEN } from '../engine/grid.js';
import { goalDone, starsFor } from '../engine/goals.js';
import { bestMove } from '../engine/ai.js';
import { isLegalSwap } from '../engine/moves.js';
import { isSpecialTile } from '../engine/specials.js';
import { VIEW, computeLayout, buildVectorTextures, requestRender, resizeStage, WORLD_LOOK } from '../view/stage.js';
import { BOARD, buildBoard, drawStatic, startAnim, drawAnim } from '../view/board-view.js';
import { frameAt } from '../view/player.js';
import { buildBackdrop, drawAmbient } from '../view/backdrop.js';
import { goalIcon } from '../view/vector-art.js';
import { sfx, unlockAudio, startMusic, setMusicIntensity, crowdLevel } from '../audio.js';
import { SAVE, prepareSaveAction, recordComputedAction, saveSettledAction } from './save.js';
import { ensurePack } from '../art.js';
import { haptic, pulseFor, PULSE } from './haptics.js';

export const PLAY = {
  state: null, level: null, world: 1, anim: null, onAnimDone: null, selected: -1, cursor: -1, keyMode: false,
  armed: null, aim: -1, aimId: null, lineDir: 'h', hintTimer: 0, lastResult: null, transitions: 0, active: false, down: null, playedBeat: -1,
  shownScore: 0, pendingEncore: false, ui: null, // ui callbacks: {onWin, onLose, onTip, announce, toast}
};

const $ = (id) => document.getElementById(id);
const KIND_NAMES = ['quartz', 'apple blossom', 'horseshoe', 'drop', 'scallop', 'pine'];
const LOW_MOVES_CUE = [3, 1]; // a soft tick when the moves left first drop to each of these
const LOW_MOVES_MUSIC = 5; // the music lifts (a little faster, brighter) when this many moves or fewer are left

export function levelById(id) { return LEVELS.find((l) => l.id === id); }
// The Daily Challenge runs outside the journey (the save calls that kind of run 'soak'): it never touches the Continue slot.
const saveMode = (s) => (s.mode === 'soak' || s.mode === 'daily' ? 'soak' : 'journey');

export function startLevel(level, opts = {}) {
  PLAY.level = level; PLAY.world = level.world || 1;
  PLAY.state = opts.state || newGame(level, opts.seed != null ? opts.seed : Date.now() % 1e9, { boosters: { ...SAVE.boosters } });
  if (!opts.state) PLAY.state.boosters = { ...SAVE.boosters };
  if (opts.relief && PLAY.state.movesLeft != null) PLAY.state.movesLeft += opts.relief; // see RELIEF_AFTER in save.js
  PLAY.selected = -1; PLAY.cursor = -1; PLAY.armed = null; PLAY.aimId = null; PLAY.anim = null; PLAY.down = null; PLAY.active = true; BOARD.sel = -1; BOARD.legal = null; BOARD.aim = null;
  PLAY.shownScore = PLAY.state.score; PLAY.explained = 0; PLAY.explainedAt = -Infinity;
  VIEW.world = PLAY.world;
  layoutAndBuild();
  // the world's painted backdrop arrives as its own pack; rebuild once it lands
  const world = PLAY.world;
  ensurePack(`w${world}`).then((ok) => { if (ok && PLAY.world === world && PLAY.active) { buildBackdrop(world, true); requestRender(); } });
  buildHud();
  updateHud();
  showGameChrome(true);
  startMusic(PLAY.world);
  scheduleHint();
  return PLAY.state;
}

export function layoutAndBuild() {
  const s = PLAY.state;
  if (!s || !VIEW.ready) return;
  resizeStage();
  computeLayout(s.w, s.h);
  if (VIEW.vectorWorld !== PLAY.world || !VIEW.tex.p0) buildVectorTextures(PLAY.world);
  buildBackdrop(PLAY.world);
  buildBoard(s, PLAY.world);
  drawStatic(s);
  requestRender();
}

export function showGameChrome(on) {
  $('hud').classList.toggle('hidden', !on);
  $('tray').classList.toggle('hidden', !on);
  VIEW.layers.board && (VIEW.layers.board.visible = on);
  if (!on) { PLAY.active = false; clearHint(); }
  requestRender();
}

// --- HUD -------------------------------------------------------------------------------------------
function buildHud() {
  const L = PLAY.level, look = WORLD_LOOK[PLAY.world];
  $('hud-world').textContent = look.short || look.name;
  $('hud-world').title = `World ${PLAY.world}`;
  if (L.mode === 'daily') dailyHud(L);
  const nm = L.mode === 'daily' ? L.name : `${L.n}. ${L.name}`;
  $('hud-name').textContent = nm;
  $('hud-name').style.fontSize = nm.length > 22 ? '0.95rem' : nm.length > 17 ? '1.08rem' : '';
  const ul = $('hud-goals');
  ul.innerHTML = '';
  for (const g of PLAY.state.goals) {
    const li = document.createElement('li');
    li.className = 'goal';
    const kind = g.type === 'collect' ? g.kind : g.type === 'tokens' ? 'token' : g.type;
    li.appendChild(goalIcon(kind));
    const n = document.createElement('span'); n.className = 'n'; li.appendChild(n);
    li.dataset.type = g.type;
    ul.appendChild(li);
  }
  for (const b of document.querySelectorAll('.booster')) b.querySelector('.b-icon').style.backgroundImage = `url(${boosterIcon(b.dataset.booster)})`;
}

// Daily Challenge: today's best and the best ever, in the world line (the all-time part drops out on a narrow phone HUD).
export function dailyHud(L = PLAY.level) {
  const el = $('hud-world'), today = SAVE.daily?.days?.[L.dayKey]?.best || 0, ever = SAVE.soakBest || 0;
  const n = (v) => v.toLocaleString('en-US');
  el.innerHTML = `<span>${today ? `Daily · best ${n(today)}` : 'Daily challenge'}</span>${ever ? `<span class="hw-ever"> · ever ${n(ever)}</span>` : ''}`;
  el.title = `Daily challenge: best today ${n(today)}, best ever ${n(ever)}`;
}

const iconCache = {};
function boosterIcon(name) {
  if (iconCache[name]) return iconCache[name];
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (name === 'hammer') { g.fillStyle = '#7A4E12'; g.save(); g.translate(32, 32); g.rotate(-0.7); g.fillRect(-4, -6, 8, 34); g.fillStyle = '#5B6270'; g.fillRect(-16, -18, 32, 14); g.fillStyle = '#9AA3B2'; g.fillRect(-16, -18, 32, 4); g.restore(); }
  if (name === 'line') { g.strokeStyle = '#1B8FB0'; g.lineWidth = 7; g.beginPath(); g.moveTo(8, 32); g.lineTo(56, 32); g.stroke(); g.fillStyle = '#1B8FB0'; g.beginPath(); g.moveTo(4, 32); g.lineTo(16, 22); g.lineTo(16, 42); g.fill(); g.beginPath(); g.moveTo(60, 32); g.lineTo(48, 22); g.lineTo(48, 42); g.fill(); }
  if (name === 'shuffle') { g.strokeStyle = '#A9432C'; g.lineWidth = 6; g.beginPath(); g.arc(32, 32, 18, 0.3, Math.PI * 1.7); g.stroke(); g.fillStyle = '#A9432C'; g.beginPath(); g.moveTo(52, 20); g.lineTo(52, 36); g.lineTo(38, 26); g.fill(); }
  if (name === 'plus5') { g.fillStyle = '#4E7D5B'; g.font = 'bold 34px Righteous, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+5', 32, 34); }
  return (iconCache[name] = c.toDataURL());
}

export function updateHud(partialScore, movesOverride) {
  const s = PLAY.state;
  if (!s) return;
  const mvn = movesOverride != null ? movesOverride : s.movesLeft;
  const mv = mvn == null ? '∞' : String(mvn);
  if ($('hud-moves').textContent !== mv && !VIEW.reduced) bump($('hud-moves-wrap'));
  $('hud-moves').textContent = mv;
  $('hud-moves-wrap').classList.toggle('low', s.movesLeft != null && s.movesLeft <= 3 && s.phase === 'play');
  setMusicIntensity(s.movesLeft != null && s.movesLeft <= LOW_MOVES_MUSIC && s.phase === 'play' ? 0.7 : 0);
  const score = partialScore != null ? partialScore : s.score;
  const sc = score.toLocaleString('en-US');
  if ($('hud-score').textContent !== sc && !VIEW.reduced && !$('hud-score').classList.contains('bump')) { bump($('hud-score')); setTimeout(() => $('hud-score').classList.remove('bump'), 340); }
  $('hud-score').textContent = sc;
  const max = s.stars[2] || 1;
  $('hud').classList.toggle('soak', s.mode === 'soak'); // no goals, so no star bar or star text
  const nextStar = s.stars.find((v) => score < v);
  $('hud-next').textContent = nextStar != null ? `Next star at ${nextStar.toLocaleString('en-US')}` : 'All stars earned';
  $('thermo-fill').style.width = `max(0px, calc(${Math.min(100, (score / max) * 100)}% - 4px))`;
  const stars = document.querySelectorAll('.thermo .star');
  // markers at their thresholds, but at least 20% apart so they never stack
  const pos = s.stars.map((v) => Math.max(8, Math.min(92, (v / max) * 92)));
  pos[2] = 92; pos[1] = Math.min(pos[1], pos[2] - 20); pos[0] = Math.min(pos[0], pos[1] - 20);
  stars.forEach((el, j) => { el.style.left = `${Math.max(8, pos[j])}%`; el.classList.toggle('on', score >= s.stars[j]); });
  const lis = $('hud-goals').children;
  s.goals.forEach((g, j) => {
    const li = lis[j]; if (!li) return;
    const left = g.type === 'moss' ? g.have : g.type === 'score' ? Math.max(0, g.need - s.score) : Math.max(0, g.need - g.have);
    li.querySelector('.n').textContent = g.type === 'score' ? (left ? `${left.toLocaleString('en-US')} to go` : '0') : left;
    li.classList.toggle('done', goalDone(g));
    li.setAttribute('aria-label', goalLabel(g, left));
  });
  for (const b of document.querySelectorAll('.booster')) {
    const n = s.boosters[b.dataset.booster] || 0;
    b.querySelector('.b-count').textContent = n;
    const usable = n > 0 && (b.dataset.booster === 'plus5' ? s.movesLeft != null : true) && s.phase === 'play';
    b.disabled = !usable;
    b.classList.toggle('armed', PLAY.armed === b.dataset.booster);
  }
  const line = document.querySelector('.booster[data-booster="line"] .b-name');
  if (line) line.textContent = PLAY.armed === 'line' ? (PLAY.lineDir === 'h' ? 'Row' : 'Column') : 'Line';
}

function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

export function goalLabel(g, left) {
  if (g.type === 'collect') return `Collect ${left} more ${KIND_NAMES[g.kind]}`;
  if (g.type === 'score') return `Score ${left} more points`;
  if (g.type === 'crust') return `Clear ${left} more mineral crust`;
  if (g.type === 'stone') return `Break ${left} more tufa layers`;
  if (g.type === 'lock') return `Open ${left} more padlocks`;
  if (g.type === 'moss') return `Clear the algae: ${left} left`;
  if (g.type === 'tokens') return `Deliver ${left} more bath tokens`;
  return '';
}

// --- actions ----------------------------------------------------------------------------------------
export const isBusy = () => !!PLAY.anim;

export function doSwap(a, b, pulled = 0) {
  if (!PLAY.active || PLAY.anim || !PLAY.state || PLAY.state.phase !== 'play') return { valid: false, reason: 'busy' };
  const mode = saveMode(PLAY.state);
  const action = prepareSaveAction({ mode });
  if (!action.ok) return { valid: false, reason: action.reason };
  clearHint();
  const pre = cloneState(PLAY.state);
  const r = apply(PLAY.state, { type: 'swap', a, b });
  if (r.reason === 'blocked') { explainRefusal(whyStuck(PLAY.state, a) || whyStuck(PLAY.state, b)); refused(a, b); return r; }
  PLAY.selected = -1; BOARD.sel = -1; BOARD.legal = null;
  if (r.valid && mode !== 'soak') { recordComputedAction(action, { levelId: PLAY.level.id, state: cloneState(PLAY.state) }); commitMove(); }
  play(pre, r, () => afterMove(r));
  if (r.reason === 'nomatch') explainRefusal('nomatch');
  if (pulled && PLAY.anim) PLAY.anim.dragFrac = pulled;
  return r;
}

export function doBooster(name, cell, dir) {
  if (!PLAY.active || PLAY.anim || !PLAY.state) return { valid: false, reason: 'busy' };
  const action = prepareSaveAction({ mode: saveMode(PLAY.state), booster: name, localAvailable: PLAY.state.boosters[name] || 0 });
  if (!action.ok) return { valid: false, reason: action.reason };
  const pre = cloneState(PLAY.state);
  const r = apply(PLAY.state, { type: 'booster', name, cell, dir });
  if (!r.valid) return r;
  recordComputedAction(action, { levelId: PLAY.level.id, state: cloneState(PLAY.state) }, name);
  commitMove();
  PLAY.armed = null; setAim(-1);
  sfx('booster');
  play(pre, r, () => afterMove(r));
  return r;
}

// A move counts the moment it is made: the save already holds the board it leaves behind, so reloading during the
// animation cannot take it back. A move that ends the level (Encore, win, loss) is saved by the end-of-level flow instead.
function commitMove() { if (PLAY.state.phase === 'play') saveSettledAction(); }

// Why a swap or a tap did nothing, in a line a new player can act on. Said for the first few refusals of a level only (REFUSAL_NOTES),
// and not twice within REFUSAL_GAP_MS, so someone who knows the rules is not nagged.
const REFUSAL_NOTES = 3, REFUSAL_GAP_MS = 2500;
const REFUSALS = {
  nomatch: 'No match there. Line up three of a kind.',
  lock: 'Padlocked: match it to open the safe.',
  fog: 'Steam hides that piece. Match beside it to clear it.',
  token: 'Bath tokens cannot be swapped. Clear the pieces below.',
  stone: 'Tufa is in the way. Match beside it to wear it down.',
  moss: 'Algae is in the way. Match beside it to clear it.',
};
function whyStuck(s, i) {
  if (!s.mask[i]) return null;
  if (s.stone[i]) return 'stone';
  if (s.moss[i]) return 'moss';
  const t = s.tile[i];
  if (!t) return null;
  if (s.lock[i]) return 'lock';
  if (s.fog[i]) return 'fog';
  return t.k === TOKEN ? 'token' : null;
}
// A move the board refuses (a padlock, tufa, fog, a token in the way, or a pull past the edge or into a hole): the same soft thud as a swap that
// comes back, and the pressed piece gives a little toward where it was sent and springs back, so a missed gesture is told from a refused one.
const NUDGE_CELLS = 0.18;
function refused(a, b) {
  sfx('bounce', 0, { pan: panOf(a) }); haptic(PULSE.refused);
  if (VIEW.reduced || !PLAY.state || b < 0) return;
  const w = PLAY.state.w, cell = VIEW.layout.cell, dx = (b % w) - (a % w), dy = ((b / w) | 0) - ((a / w) | 0);
  if (Math.abs(dx) + Math.abs(dy) !== 1) return;
  BOARD.drag = { i: a, j: -1, dx: dx * cell * NUDGE_CELLS, dy: dy * cell * NUDGE_CELLS, rel: performance.now() };
  requestRender();
}
function explainRefusal(why) {
  const now = performance.now();
  if (!why || !PLAY.ui || PLAY.explained >= REFUSAL_NOTES || now - PLAY.explainedAt < REFUSAL_GAP_MS) return;
  PLAY.explained++; PLAY.explainedAt = now;
  PLAY.ui.toast(REFUSALS[why], 1900);
}

function play(pre, r, done) {
  PLAY.lastPre = pre; PLAY.lastTimeline = r.timeline;
  PLAY.anim = startAnim(pre, r.timeline, VIEW.reduced);
  PLAY.onAnimDone = done;
  PLAY.playedBeat = -1;
  PLAY.lastResult = { valid: r.valid, reason: r.reason, waves: r.waves || 0, events: r.timeline.events.length, combo: r.combo || null };
  updateHud(PLAY.shownScore);
  requestRender();
}

// Replays the last move's animation from its pre-move board without touching the game state (captures).
export function replayLast() {
  if (!PLAY.lastPre || PLAY.anim) return false;
  PLAY.anim = startAnim(PLAY.lastPre, PLAY.lastTimeline, VIEW.reduced);
  PLAY.anim.replay = true; PLAY.onAnimDone = null; PLAY.playedBeat = -1;
  PLAY.shownScore = PLAY.lastPre.score;
  updateHud(PLAY.shownScore, PLAY.lastPre.movesLeft);
  requestRender();
  return PLAY.anim.sched.total;
}
// Middle of the first beat of the playing (or last) animation that has an event matching t (and n for waves).
export function beatAt(t, n) {
  const A = PLAY.anim;
  if (!A) return null;
  const b = A.sched.beats.find((x) => x.events.some((e) => e.t === t && (n == null || e.n === n || e.s === n)));
  return b ? Math.round(b.start + b.dur * 0.5) : null;
}

export function skipAnim() {
  if (!PLAY.anim) return;
  PLAY.anim.skip = true;
  requestRender();
}

// Called by the frame loop. Returns true while the board needs more frames.
export function playFrame(now) {
  const A = PLAY.anim;
  let busy = false;
  if (A) {
    const ms = A.skip ? A.sched.total + 1 : VIEW.frozenMs != null ? VIEW.frozenMs : now - A.t0;
    const playing = drawAnim(A, ms);
    beatEffects(A);
    countUp(A, ms);
    if (!playing && VIEW.frozenMs == null) finishAnim();
    else busy = VIEW.frozenMs == null;
  } else if (PLAY.active && PLAY.state) {
    drawStatic(PLAY.state);
  }
  const amb = PLAY.active ? drawAmbient() : false;
  const specials = PLAY.active && !VIEW.reduced && PLAY.state && PLAY.state.tile.some(isSpecialTile); // halos pulse
  if (BOARD.drag && BOARD.drag.rel) busy = true; // the spring back plays out
  VIEW.wantAmbient = amb || specials || (PLAY.active && !!BOARD.hint) || (PLAY.active && PLAY.selected >= 0);
  return busy;
}

function beatEffects(A) {
  const upto = A.applied, skipped = [];
  while (PLAY.playedBeat < upto && PLAY.playedBeat < A.sched.beats.length - 1) {
    PLAY.playedBeat++;
    const evs = A.sched.beats[PLAY.playedBeat].events;
    if (A.skip && !A.replay) skipped.push(evs); else if (!A.replay) beatSounds(evs);
    if (A.replay && PLAY.playedBeat === 1) updateHud(PLAY.shownScore);
    for (const e of evs) if (e.t === 'score') PLAY.shownScore += e.pts;
    if (evs.some((e) => e.t === 'score' || e.t === 'goal')) updateHud(PLAY.shownScore, A.replay && PLAY.playedBeat < 1 ? PLAY.lastPre.movesLeft : undefined);
  }
  if (skipped.length) skippedSounds(skipped);
}

// The HUD score climbs through the beat that earns it instead of jumping when the beat ends.
function countUp(A, ms) {
  const { i, p } = frameAt(A.sched, ms);
  const b = A.sched.beats[i];
  if (!b) return;
  const pts = b.events.reduce((n, e) => n + (e.t === 'score' ? e.pts : 0), 0);
  if (!pts) return;
  const q = Math.min(1, p / 0.8);
  const shown = Math.round(PLAY.shownScore + pts * (1 - (1 - q) ** 2));
  const el = document.getElementById('hud-score'), txt = shown.toLocaleString('en-US');
  if (el.textContent !== txt) updateHud(shown, A.replay && PLAY.playedBeat < 1 ? PLAY.lastPre.movesLeft : undefined);
}

// Where a cell is across the board, as a stereo position (-0.7 left to 0.7 right).
const panCol = (x) => { const w = PLAY.state ? PLAY.state.w : 0; return w > 1 ? (x / (w - 1) * 2 - 1) * 0.7 : 0; };
const panOf = (i) => (i >= 0 && PLAY.state ? panCol(i % PLAY.state.w) : 0);
const goalIsDone = (e) => (e.type === 'moss' ? e.have === 0 : e.have >= e.need);

// One beat's sounds: each distinct cue once, from where the first thing in the beat happened. A skip hands it the beats it folded together
// (merged): the match is the highest wave reached, and the cues are spread 40 ms apart so they read as a run, not a blur.
const SKIP_GAP = 0.04;
function beatSounds(evs, merged = false) {
  haptic(pulseFor(evs));
  const cues = [], once = new Set();
  // A beat's cues come from where the first thing in it happened; a match is heard on the side the player swapped.
  const here = evs.find((e) => e.t === 'swap' || e.t === 'fire' || e.t === 'hit' || e.t === 'special' || e.t === 'collect');
  const w = PLAY.state.w, at = !here ? 0 : here.t === 'swap' ? panCol(((here.a % w) + (here.b % w)) / 2) : panOf(here.t === 'hit' ? here.i : here.at);
  const size = merged ? merged.size : evs.reduce((n, e) => n + (e.t === 'match' ? e.cells.length : 0), 0);
  const top = merged ? Math.max(...evs.filter((e) => e.t === 'wave').map((e) => e.n)) : 0;
  const s1 = (n, a, o) => { if (!once.has(n)) { once.add(n); cues.push([n, a, o]); } };
  for (const e of evs) {
    if (e.t === 'swap') s1('swap');
    else if (e.t === 'swapBack') s1('bounce');
    else if (e.t === 'wave') s1('match', merged ? top : e.n, { size });
    else if (e.t === 'combo') s1('combo');
    else if (e.t === 'goal' && goalIsDone(e)) s1('goal');
    else if (e.t === 'fire') s1(e.s === 'C' ? 'crystal' : e.s === 'b' || e.s === 'B' ? 'stone' : 'cascade');
    else if (e.t === 'special') s1('special');
    else if (e.t === 'hit' && e.layer !== 'tile') s1({ stone: 'tufa', lock: 'lock', moss: 'moss', fog: 'fog' }[e.layer] || 'tufa');
    else if (e.t === 'collect') s1('token', Math.min(4, PLAY.state.tokens ? PLAY.state.tokens.collected : 0));
    else if (e.t === 'spread') s1('spread');
    else if (e.t === 'reshuffle') s1('reshuffle');
  }
  const level = crowdLevel(cues.length);
  cues.forEach(([n, a, o], k) => sfx(n, a, { pan: at, level, at: merged ? k * SKIP_GAP : 0, ...o }));
}
// The player skipped: the beats that had not played yet are folded into one set of sounds, so the information in them (a special made, a
// blocker broken, a goal met) is still heard.
function skippedSounds(beats) {
  const size = Math.max(...beats.map((evs) => evs.reduce((n, e) => n + (e.t === 'match' ? e.cells.length : 0), 0)));
  beatSounds(beats.flat(), { size });
}

function finishAnim() {
  if (PLAY.anim && PLAY.anim.replay) { PLAY.anim = null; PLAY.shownScore = PLAY.state.score; drawStatic(PLAY.state); updateHud(); requestRender(); return; }
  const done = PLAY.onAnimDone;
  PLAY.anim = null; PLAY.onAnimDone = null;
  PLAY.shownScore = PLAY.state.score;
  drawStatic(PLAY.state);
  updateHud();
  if (done) done();
  requestRender();
}

function afterMove(r) {
  const s = PLAY.state;
  if (r.valid && PLAY.ui) {
    const tl = r.timeline.events;
    if (tl.some((e) => e.t === 'reshuffle')) PLAY.ui.toast('No moves left: reshuffled!');
    PLAY.ui.announce(announceText(r));
  }
  if (r.valid && s.phase === 'play') cuesAfterMove(s);
  if (r.valid && s.phase === 'play') saveSettledAction(); // No unresumable encore publication; final outcome owns its coherent transaction.
  if (s.phase === 'encore') {
    PLAY.ui && PLAY.ui.toast(PLAY.keyMode ? 'Encore! Press Esc to skip' : 'Encore! Tap to skip', 2400);
    sfx('encore');
    PLAY.pendingEncore = true;
    setTimeout(() => {
      PLAY.pendingEncore = false;
      if (PLAY.state !== s || s.phase !== 'encore') return;
      const pre = cloneState(s);
      const er = apply(s, { type: 'encore' });
      play(pre, er, () => endLevel('won'));
    }, VIEW.reduced ? 100 : 700);
    return;
  }
  if (s.phase === 'won') return endLevel('won');
  if (s.phase === 'lost') return endLevel('lost');
  scheduleHint();
}

// Cues for what the move left behind: a star line crossed, or the last moves coming up. The goal cue comes with the move's own sounds.
function cuesAfterMove(s) {
  const pre = PLAY.lastPre;
  if (!pre || s.mode === 'soak') return;
  const crossed = s.stars.filter((v) => pre.score < v && s.score >= v).length;
  if (crossed) sfx('starline', s.stars.filter((v) => s.score >= v).length);
  if (s.movesLeft != null && pre.movesLeft != null) {
    for (const n of LOW_MOVES_CUE) if (s.movesLeft === n && pre.movesLeft > n) sfx('low', n);
  }
}

function announceText(r) {
  const s = PLAY.state;
  if (!r.valid) return 'No match. Swap returned.';
  const specials = r.timeline.events.filter((e) => e.t === 'special').length;
  const fired = r.timeline.events.filter((e) => e.t === 'fire' && !e.after).length;
  const parts = [`Score ${s.score}.`];
  if (r.waves > 1) parts.push(`Chain of ${r.waves}.`);
  if (fired) parts.push(`${fired} special piece${fired > 1 ? 's' : ''} fired.`);
  if (specials) parts.push(`${specials} special piece${specials > 1 ? 's' : ''} made.`);
  if (s.movesLeft != null) parts.push(`${s.movesLeft} moves left.`);
  return parts.join(' ');
}

function endLevel(result) {
  clearHint();
  if (PLAY.ui) (result === 'won' ? PLAY.ui.onWin : PLAY.ui.onLose)(PLAY.state, PLAY.level);
}

// --- hints -----------------------------------------------------------------------------------------
export function scheduleHint() {
  clearHint();
  if (!SAVE.settings.hints || !PLAY.active) return;
  PLAY.hintTimer = setTimeout(showHint, 5000);
}
export function showHint() {
  if (!PLAY.active || PLAY.anim || !PLAY.state || PLAY.state.phase !== 'play') return null;
  const m = bestMove(PLAY.state);
  BOARD.hint = m;
  requestRender();
  return m;
}
export function clearHint() { if (PLAY.hintTimer) clearTimeout(PLAY.hintTimer); PLAY.hintTimer = 0; if (BOARD.hint) { BOARD.hint = null; requestRender(); } }

// --- input ------------------------------------------------------------------------------------------
function cellAt(clientX, clientY) {
  const r = VIEW.app.canvas.getBoundingClientRect(), L = VIEW.layout, s = PLAY.state;
  const x = Math.floor((clientX - r.left - L.bx) / L.cell), y = Math.floor((clientY - r.top - L.by) / L.cell);
  if (x < 0 || y < 0 || x >= s.w || y >= s.h) return -1;
  const i = y * s.w + x;
  return s.mask[i] ? i : -1;
}
const adjacent = (s, a, b) => (Math.abs(a - b) === 1 && ((a / s.w) | 0) === ((b / s.w) | 0)) || Math.abs(a - b) === s.w;

export function bindInput(canvas) {
  canvas.addEventListener('pointerdown', (e) => {
    unlockAudio();
    if (!PLAY.active || !PLAY.state) return;
    if (PLAY.anim) { // early input is intent: finish the animation now, then treat this touch as a normal one
      skipAnim(); playFrame(performance.now());
      if (PLAY.anim || PLAY.state.phase !== 'play') return;
    }
    const i = cellAt(e.clientX, e.clientY);
    PLAY.keyMode = false; BOARD.showCursor = false;
    if (PLAY.armed) { // the target is chosen on release: a press shows what it would hit, sliding to another cell moves it, and letting go off the board cancels
      clearHint(); PLAY.aimId = e.pointerId; setAim(i);
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* capture is optional */ }
      return;
    }
    if (i < 0) { setSelected(-1); return; }
    clearHint();
    PLAY.down = { i, x: e.clientX, y: e.clientY, swapped: false, id: e.pointerId };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* capture is optional */ }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (PLAY.armed) { if (!PLAY.anim && (PLAY.aimId === e.pointerId || (PLAY.aimId == null && e.pointerType === 'mouse'))) setAim(cellAt(e.clientX, e.clientY)); return; }
    const d = PLAY.down;
    if (!d || d.swapped || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y, cell = VIEW.layout.cell, th = cell * 0.3;
    const s = PLAY.state, x = d.i % s.w, y = (d.i / s.w) | 0;
    const horiz = Math.abs(dx) > Math.abs(dy), far = Math.max(Math.abs(dx), Math.abs(dy));
    let j = -1;
    if (horiz) j = dx > 0 ? (x < s.w - 1 ? d.i + 1 : -1) : (x > 0 ? d.i - 1 : -1);
    else j = dy > 0 ? (y < s.h - 1 ? d.i + s.w : -1) : (y > 0 ? d.i - s.w : -1);
    if (far < th) { d.refused = false; showDrag(d.i, j, horiz ? dx : 0, horiz ? 0 : dy, cell); return; }
    if (j < 0 || !s.mask[j]) { // an edge or a hole: the piece gives a little and the gesture stays open, so the player can aim again without lifting
      showDrag(d.i, -1, horiz ? dx : 0, horiz ? 0 : dy, cell);
      if (!d.refused) { d.refused = true; sfx('bounce', 0, { pan: panOf(d.i) }); haptic(PULSE.refused); }
      return;
    }
    d.swapped = true;
    const f = dragFraction(horiz ? dx : dy, cell, j, s, d.i); BOARD.drag = null; setSelected(-1); doSwap(d.i, j, f);
  });
  const up = (e) => {
    if (PLAY.armed && PLAY.aimId === e.pointerId) {
      PLAY.aimId = null;
      const i = cellAt(e.clientX, e.clientY);
      if (i >= 0) useArmed(i); else refuseAim();
      return;
    }
    const d = PLAY.down;
    PLAY.down = null;
    letGo();
    if (!d || d.swapped || d.refused || d.id !== e.pointerId) return; // a pull that was refused is not a tap
    const s = PLAY.state;
    if (PLAY.selected >= 0 && PLAY.selected !== d.i && adjacent(s, PLAY.selected, d.i)) { const a = PLAY.selected; setSelected(-1); doSwap(a, d.i); return; }
    if (PLAY.selected === d.i) { setSelected(-1); return; }
    if (swappableAt(s, d.i)) { setSelected(d.i); sfx('select', 0, { pan: panOf(d.i) }); } else explainRefusal(whyStuck(s, d.i));
    scheduleHint();
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', () => { PLAY.down = null; PLAY.aimId = null; if (PLAY.armed) setAim(-1); letGo(); });
  canvas.addEventListener('pointerleave', () => { if (PLAY.armed && PLAY.aimId == null) setAim(-1); });
}

// A piece follows the finger along the axis of the pull, at most one cell, and the one it would trade with gives way by the same
// amount. A pull toward nothing (an edge, a hole, a blocked cell) only gives a little. Letting go springs both back.
const DRAG_DEAD_PX = 4, DRAG_BLOCKED = 0.12;
function showDrag(i, j, dx, dy, cell) {
  const s = PLAY.state, along = dx || dy;
  if (Math.abs(along) < DRAG_DEAD_PX) { if (BOARD.drag && !BOARD.drag.rel) { BOARD.drag = null; requestRender(); } return; }
  const ok = j >= 0 && s.mask[j] && swappableAt(s, i) && swappableAt(s, j);
  const room = ok ? cell : cell * DRAG_BLOCKED, k = Math.min(1, room / Math.abs(along));
  BOARD.drag = { i, j: ok ? j : -1, dx: dx * k, dy: dy * k, rel: 0 };
  requestRender();
}
// How much of the swap the pull has already made when it commits, 0 to 0.6, so the slide carries on from where the piece is.
function dragFraction(along, cell, j, s, i) { return j >= 0 && swappableAt(s, i) && swappableAt(s, j) ? Math.min(0.6, Math.abs(along) / cell) : 0; }
function letGo() {
  const d = BOARD.drag;
  if (!d) return;
  if (VIEW.reduced) BOARD.drag = null; else d.rel = performance.now();
  requestRender();
}

// The neighbours the picked piece can legally trade with, for the rings on the board.
function legalNeighbours(i) {
  const s = PLAY.state, x = i % s.w, out = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = ((i / s.w) | 0) + dy;
    if (nx < 0 || ny < 0 || nx >= s.w || ny >= s.h) continue;
    const j = ny * s.w + nx;
    if (s.mask[j] && isLegalSwap(s, i, j)) out.push(j);
  }
  return out;
}
function setSelected(i) { PLAY.selected = i; BOARD.sel = i; BOARD.legal = i >= 0 && PLAY.state ? legalNeighbours(i) : null; requestRender(); }

export function armBooster(name) {
  if (!PLAY.active || PLAY.anim) return;
  const s = PLAY.state;
  if (!(s.boosters[name] > 0)) return;
  if (name === 'plus5') { doBooster('plus5'); return; }
  if (name === 'shuffle') { doBooster('shuffle'); return; }
  if (PLAY.armed === name) {
    if (name === 'line' && PLAY.lineDir === 'h') PLAY.lineDir = 'v';
    else { PLAY.armed = null; PLAY.lineDir = 'h'; }
  } else { PLAY.armed = name; PLAY.lineDir = 'h'; }
  if (PLAY.ui && PLAY.armed) PLAY.ui.toast(PLAY.armed === 'hammer' ? 'Tap a cell to break it' : `Tap a cell: clears its ${PLAY.lineDir === 'h' ? 'row' : 'column'}`);
  setAim(PLAY.armed && PLAY.keyMode && PLAY.cursor >= 0 ? PLAY.cursor : -1);
  updateHud();
}
// The cells an armed booster would hit if it were used on cell i: one for the Hammer, the row or the column for the Line.
function aimCells(i) {
  const s = PLAY.state;
  if (PLAY.armed === 'hammer') return [i];
  const out = [];
  if (PLAY.lineDir === 'v') { for (let y = 0; y < s.h; y++) if (s.mask[y * s.w + i % s.w]) out.push(y * s.w + i % s.w); }
  else { const y = (i / s.w) | 0; for (let x = 0; x < s.w; x++) if (s.mask[y * s.w + x]) out.push(y * s.w + x); }
  return out;
}
function setAim(i) {
  const next = i >= 0 && PLAY.armed && PLAY.state && PLAY.state.mask[i] ? i : -1;
  PLAY.aim = next;
  BOARD.aim = next >= 0 ? { cells: aimCells(next), kind: PLAY.armed } : null;
  requestRender();
}
// A release off the board (or on a hole) uses nothing: the booster stays armed, with a thud and a line saying so.
function refuseAim() {
  setAim(-1); sfx('bounce'); haptic(PULSE.refused);
  if (PLAY.ui) PLAY.ui.toast('Nothing there: tap a piece, or tap the booster again to cancel');
}
function useArmed(i) {
  const name = PLAY.armed;
  if (name === 'hammer') doBooster('hammer', i);
  else if (name === 'line') doBooster('line', i, PLAY.lineDir);
}

// Number keys work the boosters in tray order; a focused button keeps its own Enter and Space (Tab to Hammer, press Enter).
const BOOSTER_KEYS = { 1: 'hammer', 2: 'line', 3: 'shuffle', 4: 'plus5' };
const onButton = () => { const el = document.activeElement; return !!(el && el !== document.body && el.matches && el.matches('button, a[href], input, select, textarea')); };

export function handleKey(e) {
  if (!PLAY.active || !PLAY.state) return false;
  const s = PLAY.state;
  if ((e.key === 'Enter' || e.key === ' ') && onButton()) return false;
  if (BOOSTER_KEYS[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) { armBooster(BOOSTER_KEYS[e.key]); return true; }
  const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (PLAY.anim && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { skipAnim(); return true; }
  if (PLAY.anim && !dirs[e.key]) return false;
  if (dirs[e.key]) {
    clearHint();
    if (onButton()) document.activeElement.blur(); // the arrows move to the board: Enter then picks a piece again
    if (PLAY.cursor < 0) PLAY.cursor = PLAY.selected >= 0 ? PLAY.selected : firstCell(s);
    const [dx, dy] = dirs[e.key];
    const x = PLAY.cursor % s.w, y = (PLAY.cursor / s.w) | 0, nx = x + dx, ny = y + dy;
    PLAY.keyMode = true; BOARD.showCursor = true;
    if (nx < 0 || ny < 0 || nx >= s.w || ny >= s.h || !s.mask[ny * s.w + nx]) { if (PLAY.armed) setAim(PLAY.cursor); requestRender(); return true; }
    const j = ny * s.w + nx;
    if (PLAY.selected >= 0 && !PLAY.anim) { const a = PLAY.selected; setSelected(-1); PLAY.cursor = j; BOARD.cursor = j; doSwap(a, j); return true; }
    PLAY.cursor = j; BOARD.cursor = j; if (PLAY.armed) setAim(j); requestRender();
    return true;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    if (PLAY.cursor < 0) { PLAY.cursor = firstCell(s); BOARD.cursor = PLAY.cursor; BOARD.showCursor = true; if (PLAY.armed) setAim(PLAY.cursor); requestRender(); return true; }
    if (PLAY.armed) { useArmed(PLAY.cursor); return true; }
    if (PLAY.selected === PLAY.cursor) setSelected(-1); else if (swappableAt(s, PLAY.cursor)) { setSelected(PLAY.cursor); sfx('select', 0, { pan: panOf(PLAY.cursor) }); }
    return true;
  }
  if (e.key === 'Escape' && (PLAY.selected >= 0 || PLAY.armed)) { setSelected(-1); PLAY.armed = null; setAim(-1); updateHud(); return true; }
  if (e.key === 'h' || e.key === 'H') { showHint(); return true; }
  return false;
}
function firstCell(s) { const c = (s.w >> 1) + (s.h >> 1) * s.w; return s.mask[c] ? c : s.mask.indexOf(1); }

export function stars(s) { return s.phase === 'won' ? s.starsWon || starsFor(s) : 0; }
