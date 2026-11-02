// In-level controller: input → engine action → timeline playback → HUD, sounds, end-of-level flow.
import { newGame, apply, cloneState } from '../engine/game.js';
import { swappableAt } from '../engine/grid.js';
import { goalDone, starsFor } from '../engine/goals.js';
import { bestMove } from '../engine/ai.js';
import { isSpecialTile } from '../engine/specials.js';
import { VIEW, computeLayout, buildVectorTextures, requestRender, resizeStage, WORLD_LOOK } from '../view/stage.js';
import { BOARD, buildBoard, drawStatic, startAnim, drawAnim } from '../view/board-view.js';
import { frameAt } from '../view/player.js';
import { buildBackdrop, drawAmbient } from '../view/backdrop.js';
import { goalIcon } from '../view/vector-art.js';
import { sfx, unlockAudio, startMusic } from '../audio.js';
import { SAVE, writeSave } from './save.js';
import { ensurePack } from '../art.js';

export const PLAY = {
  state: null, level: null, world: 1, anim: null, onAnimDone: null, selected: -1, cursor: -1, keyMode: false,
  armed: null, lineDir: 'h', hintTimer: 0, lastResult: null, transitions: 0, active: false, down: null, playedBeat: -1,
  shownScore: 0, pendingEncore: false, ui: null, // ui callbacks: {onWin, onLose, onTip, announce, toast}
};

const $ = (id) => document.getElementById(id);
const KIND_NAMES = ['quartz', 'magnolia', 'horseshoe', 'drop', 'scallop', 'pine'];

export function levelById(id) { return LEVELS.find((l) => l.id === id); }

export function startLevel(level, opts = {}) {
  PLAY.level = level; PLAY.world = level.world || 1;
  PLAY.state = opts.state || newGame(level, opts.seed != null ? opts.seed : Date.now() % 1e9, { boosters: { ...SAVE.boosters } });
  if (!opts.state) PLAY.state.boosters = { ...SAVE.boosters };
  PLAY.selected = -1; PLAY.cursor = -1; PLAY.armed = null; PLAY.anim = null; PLAY.down = null; PLAY.active = true;
  PLAY.shownScore = PLAY.state.score;
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
  const nm = `${L.n}. ${L.name}`;
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
  const score = partialScore != null ? partialScore : s.score;
  const sc = score.toLocaleString('en-US');
  if ($('hud-score').textContent !== sc && !VIEW.reduced && !$('hud-score').classList.contains('bump')) { bump($('hud-score')); setTimeout(() => $('hud-score').classList.remove('bump'), 340); }
  $('hud-score').textContent = sc;
  const max = s.stars[2] || 1;
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

export function doSwap(a, b) {
  if (!PLAY.active || PLAY.anim || !PLAY.state || PLAY.state.phase !== 'play') return { valid: false, reason: 'busy' };
  clearHint();
  const pre = cloneState(PLAY.state);
  const r = apply(PLAY.state, { type: 'swap', a, b });
  if (r.reason === 'blocked') return r;
  PLAY.selected = -1; BOARD.sel = -1;
  play(pre, r, () => afterMove(r));
  return r;
}

export function doBooster(name, cell, dir) {
  if (!PLAY.active || PLAY.anim || !PLAY.state) return { valid: false, reason: 'busy' };
  const pre = cloneState(PLAY.state);
  const r = apply(PLAY.state, { type: 'booster', name, cell, dir });
  if (!r.valid) return r;
  SAVE.boosters[name] = Math.max(0, (SAVE.boosters[name] || 0) - 1);
  writeSave();
  PLAY.armed = null;
  sfx('booster');
  play(pre, r, () => afterMove(r));
  return r;
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
  VIEW.wantAmbient = amb || specials || (PLAY.active && !!BOARD.hint) || (PLAY.active && PLAY.selected >= 0);
  return busy;
}

function beatEffects(A) {
  const upto = A.applied;
  while (PLAY.playedBeat < upto && PLAY.playedBeat < A.sched.beats.length - 1) {
    PLAY.playedBeat++;
    const evs = A.sched.beats[PLAY.playedBeat].events;
    if (!A.skip && !A.replay) beatSounds(evs);
    if (A.replay && PLAY.playedBeat === 1) updateHud(PLAY.shownScore);
    for (const e of evs) if (e.t === 'score') PLAY.shownScore += e.pts;
    if (evs.some((e) => e.t === 'score' || e.t === 'goal')) updateHud(PLAY.shownScore, A.replay && PLAY.playedBeat < 1 ? PLAY.lastPre.movesLeft : undefined);
  }
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

function beatSounds(evs) {
  const once = new Set();
  const s1 = (n, a) => { if (!once.has(n)) { once.add(n); sfx(n, a); } };
  for (const e of evs) {
    if (e.t === 'swap') s1('swap');
    else if (e.t === 'swapBack') s1('bounce');
    else if (e.t === 'wave') s1('match', e.n);
    else if (e.t === 'fire') s1(e.s === 'C' ? 'crystal' : e.s === 'b' || e.s === 'B' ? 'stone' : 'cascade');
    else if (e.t === 'special') s1('special');
    else if (e.t === 'hit' && e.layer !== 'tile') s1({ stone: 'tufa', lock: 'lock', moss: 'moss', fog: 'fog' }[e.layer] || 'tufa');
    else if (e.t === 'collect') s1('token');
    else if (e.t === 'spread') s1('spread');
    else if (e.t === 'reshuffle') s1('reshuffle');
  }
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
  if (r.valid && s.mode !== 'soak') { SAVE.current = s.phase === 'play' ? { levelId: PLAY.level.id, state: cloneState(s) } : null; writeSave(); }
  if (s.phase === 'encore') {
    PLAY.ui && PLAY.ui.toast('Encore!');
    sfx('win');
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
    if (PLAY.anim) { skipAnim(); return; }
    const i = cellAt(e.clientX, e.clientY);
    PLAY.keyMode = false; BOARD.showCursor = false;
    if (i < 0) { setSelected(-1); return; }
    clearHint();
    if (PLAY.armed) { useArmed(i); return; }
    PLAY.down = { i, x: e.clientX, y: e.clientY, swapped: false, id: e.pointerId };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* capture is optional */ }
  });
  canvas.addEventListener('pointermove', (e) => {
    const d = PLAY.down;
    if (!d || d.swapped || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y, th = VIEW.layout.cell * 0.3;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
    const s = PLAY.state, x = d.i % s.w, y = (d.i / s.w) | 0;
    let j = -1;
    if (Math.abs(dx) > Math.abs(dy)) j = dx > 0 ? (x < s.w - 1 ? d.i + 1 : -1) : (x > 0 ? d.i - 1 : -1);
    else j = dy > 0 ? (y < s.h - 1 ? d.i + s.w : -1) : (y > 0 ? d.i - s.w : -1);
    d.swapped = true;
    if (j >= 0 && s.mask[j]) { setSelected(-1); doSwap(d.i, j); }
  });
  const up = (e) => {
    const d = PLAY.down;
    PLAY.down = null;
    if (!d || d.swapped || d.id !== e.pointerId) return;
    const s = PLAY.state;
    if (PLAY.selected >= 0 && PLAY.selected !== d.i && adjacent(s, PLAY.selected, d.i)) { const a = PLAY.selected; setSelected(-1); doSwap(a, d.i); return; }
    if (PLAY.selected === d.i) { setSelected(-1); return; }
    if (swappableAt(s, d.i)) { setSelected(d.i); sfx('select'); }
    scheduleHint();
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', () => { PLAY.down = null; });
}

function setSelected(i) { PLAY.selected = i; BOARD.sel = i; requestRender(); }

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
  updateHud();
}
function useArmed(i) {
  const name = PLAY.armed;
  if (name === 'hammer') doBooster('hammer', i);
  else if (name === 'line') doBooster('line', i, PLAY.lineDir);
}

export function handleKey(e) {
  if (!PLAY.active || !PLAY.state) return false;
  const s = PLAY.state;
  const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (PLAY.anim && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { skipAnim(); return true; }
  if (PLAY.anim) return false;
  if (dirs[e.key]) {
    clearHint();
    if (PLAY.cursor < 0) PLAY.cursor = PLAY.selected >= 0 ? PLAY.selected : firstCell(s);
    const [dx, dy] = dirs[e.key];
    const x = PLAY.cursor % s.w, y = (PLAY.cursor / s.w) | 0, nx = x + dx, ny = y + dy;
    PLAY.keyMode = true; BOARD.showCursor = true;
    if (nx < 0 || ny < 0 || nx >= s.w || ny >= s.h || !s.mask[ny * s.w + nx]) { requestRender(); return true; }
    const j = ny * s.w + nx;
    if (PLAY.selected >= 0) { const a = PLAY.selected; setSelected(-1); PLAY.cursor = j; BOARD.cursor = j; doSwap(a, j); return true; }
    PLAY.cursor = j; BOARD.cursor = j; requestRender();
    return true;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    if (PLAY.cursor < 0) { PLAY.cursor = firstCell(s); BOARD.cursor = PLAY.cursor; BOARD.showCursor = true; requestRender(); return true; }
    if (PLAY.armed) { useArmed(PLAY.cursor); return true; }
    if (PLAY.selected === PLAY.cursor) setSelected(-1); else if (swappableAt(s, PLAY.cursor)) { setSelected(PLAY.cursor); sfx('select'); }
    return true;
  }
  if (e.key === 'Escape' && (PLAY.selected >= 0 || PLAY.armed)) { setSelected(-1); PLAY.armed = null; updateHud(); return true; }
  if (e.key === 'h' || e.key === 'H') { showHint(); return true; }
  return false;
}
function firstCell(s) { const c = (s.w >> 1) + (s.h >> 1) * s.w; return s.mask[c] ? c : s.mask.indexOf(1); }

export function stars(s) { return s.phase === 'won' ? s.starsWon || starsFor(s) : 0; }
