// DOM screens and dialogs: title, world map, level intro, results, world complete, pause, help,
// settings, about, Free Soak and tutorial tips. Game logic stays in play.js and the engine.
import { PLAY, startLevel, showGameChrome, levelById, updateHud, goalLabel, layoutAndBuild, doBooster, showHint } from './play.js';
import { SAVE, STAR_STEP, changeSettings, markTutorial, saveDaily, resetSave, saveUnreadable, startFreshSave, configureSaveEffects, reserveCurrent, adoptCurrent, saveTerminal } from './save.js';
import { cloneState } from '../engine/game.js';
import { goalIcon, PIECES, ICON_IMAGES } from '../view/vector-art.js';
import { VIEW, WORLD_LOOK, requestRender } from '../view/stage.js';
import { sfx, setMood, holdMusic, releaseMusic, AUDIO, applyLevels, unlockAudio } from '../audio.js';
import { TIPS } from './tips.js';
import { atmosphere } from './atmos.js';
import { dailyLevel, dayKey, addDays, streakNow, cleanDaily } from './daily.js';
import { ensurePack } from '../art.js';

export const UI = { scene: 'boot', transitions: 0, modalOpen: false, lastFocus: null, tipOpen: false, dailyDate: null }; // dailyDate: a test can pin today's date
const $ = (id) => document.getElementById(id);
const screenEl = () => $('screen');
const modalEl = () => $('modal');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const worldOf = (id) => +id.slice(1).split('-')[0];
const totalStars = () => Object.values(SAVE.progress).reduce((a, p) => a + (p.stars || 0), 0);
const nextBoosterAt = () => (Math.floor(totalStars() / STAR_STEP) + 1) * STAR_STEP;
export function isUnlocked(level) {
  const idx = LEVELS.indexOf(level);
  return idx <= 0 || !!SAVE.progress[LEVELS[idx - 1].id];
}
const worldDone = (w) => LEVELS.filter((l) => l.world === w).every((l) => SAVE.progress[l.id]);
// Small drawn icons (brass-button style) in place of system glyphs, which look different on every OS.
const ICONS = {
  home: '<path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/>',
  star: '<path d="M12 2.2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.1l-6.1 3.5 1.5-6.8-5.2-4.6 6.9-.7z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  gear: '<circle cx="12" cy="12" r="5.6" fill="none" stroke="currentColor" stroke-width="3.2"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M10.4 1.6h3.2v3.6h-3.2z" transform="rotate(${a} 12 12)"/>`).join(''),
};
const ico = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${ICONS[name]}</svg>`;
const paint = (name) => (VIEW.paintings && VIEW.paintings[name]) || '';

function setScene(name) {
  UI.scene = name;
  document.body.dataset.scene = name;
}
function announce(text) { const el = $('live'); el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30); }
export function toast(text, ms = 1300) {
  const t = $('toast'); t.textContent = text; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
  announce(text);
}

// --- modal ---------------------------------------------------------------------------------------
export function openModal(html, opts = {}) {
  const m = modalEl();
  UI.lastFocus = document.activeElement;
  m.innerHTML = `<div class="card ${opts.cls || ''}">${html}</div>`;
  m.classList.remove('hidden');
  m.setAttribute('aria-label', opts.label || 'Dialog');
  UI.modalOpen = true;
  if (!VIEW.reduced) { m.classList.add('enter'); UI.transitions++; setTimeout(() => { m.classList.remove('enter'); UI.transitions--; }, 340); }
  const first = m.querySelector('[data-focus]') || m.querySelector('button');
  if (first) first.focus();
  return m;
}
export function closeModal() {
  const m = modalEl();
  m.classList.add('hidden'); m.innerHTML = ''; UI.modalOpen = false;
  if (UI.lastFocus && UI.lastFocus.focus) try { UI.lastFocus.focus(); } catch (_) { /* element gone */ }
}

// Esc: press the open dialog's own way out (Resume on Pause, else Close/Back, else Map on result cards).
export function dismissModal() {
  const m = modalEl();
  for (const act of ['resume', 'close', 'back', 'map']) {
    const b = m.querySelector(`[data-act="${act}"]`);
    if (b) { b.click(); return true; }
  }
  return false;
}
// Tab and Shift+Tab wrap inside the open dialog instead of reaching the screen behind it.
export function trapTab(e) {
  const items = [...modalEl().querySelectorAll('button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1], at = document.activeElement;
  if (e.shiftKey && (at === first || !modalEl().contains(at))) { last.focus(); e.preventDefault(); }
  else if (!e.shiftKey && (at === last || !modalEl().contains(at))) { first.focus(); e.preventDefault(); }
}

// --- title ---------------------------------------------------------------------------------------
export function showTitle() {
  closeModal(); showGameChrome(false); setMood('title');
  setScene('title');
  const cont = SAVE.current && levelById(SAVE.current.levelId);
  const dailyOpen = worldDone(1);
  const land = window.innerWidth / window.innerHeight > 1.05;
  const bg = paint(land ? 'title-l' : 'title-p') || (land && paint('bg1-l')) || paint('title-p');
  screenEl().className = 'screen title';
  screenEl().style.backgroundImage = bg ? `url(${bg})` : 'radial-gradient(ellipse at 50% 30%, #3E8C8C, #1F5F6B 55%, #123E47)';
  screenEl().innerHTML = `${atmosphere('title')}
    <div class="title-wrap">
      <h1 class="logo">Spa City<br>Sparkle<small>HOT SPRINGS · ARKANSAS</small></h1>
      <p class="tagline">Swap and match your way down Bathhouse Row and beyond.</p>
      <div class="menu">
        ${cont ? `<button class="btn" data-act="continue" data-focus>Continue ${esc(cont.n)}. ${esc(cont.name)}</button>` : ''}
        <button class="btn${cont ? ' alt' : ''}" data-act="play" ${cont ? '' : 'data-focus'}>${Object.keys(SAVE.progress).length ? 'World map' : 'Play'}</button>
        <button class="btn alt" data-act="daily" ${dailyOpen ? '' : 'aria-disabled="true"'}>Daily Challenge${dailyOpen ? '' : ' ' + ico('lock')}</button><p class="menu-note">${dailyOpen ? esc(dailyNote()) : 'Finish Bathhouse Row to unlock the Daily Challenge.'}</p>
        <div class="menu-row">
          <button class="btn small alt" data-act="help">Help</button>
          <button class="btn small alt" data-act="settings">Settings</button>
          <button class="btn small alt" data-act="about">About</button>
        </div>
      </div>
    </div>`;
  bindActs(screenEl(), {
    continue: () => enterLevel(null, { continue: true, skipIntro: true }),
    play: () => showMap(),
    daily: () => (dailyOpen ? showDaily() : toast('Finish Bathhouse Row to unlock the Daily Challenge', 2200)),
    help: () => showHelp(), settings: () => showSettings(), about: () => showAbout(),
  });
  const f = screenEl().querySelector('[data-focus]');
  if (f) f.focus();
}

function bindActs(root, acts) {
  root.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => {
    unlockAudio(); sfx('click');
    const fn = acts[b.dataset.act];
    if (fn && !b.disabled) fn(b, e);
  }));
}

// --- world map -----------------------------------------------------------------------------------
// Each world's map panel keeps the painting's portrait shape: wider screens get taller sections.
let MAP_WORLD_H = 820;
const mapWidth = () => Math.min(820, window.innerWidth);
export function nodePos(level) {
  const j = level.n - 1, w = level.world;
  const step = (MAP_WORLD_H - 230) / 9;
  const yInWorld = MAP_WORLD_H - 150 - j * step;
  const x = 50 + 11 * Math.sin(j * 0.9 + w * 1.7); // the painted path winds down the middle of each panel
  const y = (6 - w) * MAP_WORLD_H + yInWorld;
  return [x, y];
}
export function showMap(focusId) {
  closeModal(); showGameChrome(false); setMood('map');
  ensurePack('map').then((ok) => { if (ok && UI.scene === 'map' && !UI.mapPainted) { UI.mapPainted = true; showMap(focusId); } });
  setScene('map');
  const el = screenEl();
  MAP_WORLD_H = Math.max(820, Math.round(mapWidth() * 1.45));
  el.className = 'screen map';
  el.style.backgroundImage = '';
  const current = LEVELS.find((l) => !SAVE.progress[l.id] && isUnlocked(l)) || LEVELS[LEVELS.length - 1];
  let html = `<div class="map-top"><button class="round" data-act="home" aria-label="Back to title">${ico('home')}</button><span class="map-pc" id="map-pc" aria-hidden="true"></span><div class="map-head"><b class="map-title" id="map-world"></b><span class="map-sub" id="map-sub"></span></div><span class="totals" aria-label="${totalStars()} stars earned. Next booster at ${nextBoosterAt()} stars" title="Next booster at ${nextBoosterAt()} stars">${ico('star')} ${totalStars()}</span><button class="round" data-act="help" aria-label="How to play">?</button><button class="round" data-act="settings" aria-label="Settings">${ico('gear')}</button></div>`;
  html += `<div class="map-canvas" style="height:${6 * MAP_WORLD_H}px">`;
  for (let w = 6; w >= 1; w--) {
    const look = WORLD_LOOK[w], top = (6 - w) * MAP_WORLD_H;
    const img = paint(`map${w}`);
    html += `<div class="map-world" style="position:absolute;left:0;right:0;top:${top - (w < 6 ? 140 : 0)}px;height:${MAP_WORLD_H + (w < 6 ? 140 : 0)}px;background:${img ? `url(${img}) center/cover` : `linear-gradient(180deg, ${look.sky[1]}, ${look.sky[0]})`}">${atmosphere('world', w)}</div>`;
  }
  // path dots
  html += '<svg class="map-path" width="100%" height="100%" viewBox="0 0 100 ' + 6 * MAP_WORLD_H + '" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="#FFF6DE" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="1.5 2.5" vector-effect="non-scaling-stroke" style="stroke-width:5px" points="';
  html += LEVELS.map((l) => nodePos(l).join(',')).join(' ');
  html += '"/></svg>';
  for (const l of LEVELS) {
    const [x, y] = nodePos(l), pr = SAVE.progress[l.id], open = isUnlocked(l);
    const stars = pr ? ico('star').repeat(pr.stars) + ico('star', 'off').repeat(3 - pr.stars) : '';
    html += `<button class="node${open ? '' : ' locked'}${l === current ? ' current' : ''}" style="left:${x}%;top:${y}px" data-level="${l.id}" ${open ? '' : 'aria-disabled="true"'} aria-label="Level ${l.world}-${l.n}, ${esc(l.name)}${pr ? `, ${pr.stars} stars` : open ? ', not played' : ', locked'}">${l.n}${stars ? `<span class="stars">${stars}</span>` : ''}</button>`;
  }
  html += '</div>';
  el.innerHTML = html;
  bindActs(el, { home: () => showTitle(), help: () => showHelp(), settings: () => showSettings() });
  el.querySelectorAll('.node').forEach((b) => b.addEventListener('click', () => {
    unlockAudio();
    const L = levelById(b.dataset.level);
    if (!isUnlocked(L)) { toast('Clear the previous level first'); return; }
    sfx('click'); showIntro(L);
  }));
  const head = () => {
    const mid = el.scrollTop + el.clientHeight * 0.5;
    const w = Math.max(1, Math.min(6, 6 - Math.floor(mid / MAP_WORLD_H)));
    const look = WORLD_LOOK[w], done = LEVELS.filter((l) => l.world === w && SAVE.progress[l.id]).length;
    const a = document.getElementById('map-world'), b = document.getElementById('map-sub');

    const narrow = window.innerWidth < 600, label = narrow ? look.short : `World ${w}: ${look.name}`;
    if (a && a.textContent !== label) {
      a.textContent = label; a.title = `World ${w}: ${look.name}`; b.textContent = narrow ? `World ${w} · ${done}/10 restored` : `postcard ${done}/10 restored`;
      const img = paint(`map${w}`); if (img) el.style.setProperty('--map-bg', `url(${img})`);
      const pc = document.getElementById('map-pc'), pci = paint(`postcard${w}`);
      if (pc) { pc.style.backgroundImage = pci ? `url(${pci})` : ''; pc.style.filter = `grayscale(${1 - done / 10}) saturate(${0.3 + (done / 10) * 0.7})`; }
    }
  };
  el.addEventListener('scroll', head, { passive: true });
  const target = levelById(focusId || '') || current;
  const [, ty] = nodePos(target);
  el.scrollTop = Math.max(0, ty - el.clientHeight * 0.55);
  head();
  const btn = el.querySelector(`[data-level="${target.id}"]`);
  if (btn) btn.focus({ preventScroll: true });
}

// --- level intro ---------------------------------------------------------------------------------
function goalChips(goals) {
  return goals.map((g) => {
    const need = g.need === 'all' ? 'all' : g.need;
    const text = g.type === 'score' ? `${Number(need).toLocaleString('en-US')} pts` : g.type === 'moss' ? 'clear all' : need;
    return `<span class="goal" data-kind="${g.type === 'collect' ? g.kind : g.type}"><span class="ic" data-icon="${g.type === 'collect' ? g.kind : g.type === 'tokens' ? 'token' : g.type}"></span><span class="n">${text}</span></span>`;
  }).join('');
}
function fillIcons(root) {
  root.querySelectorAll('[data-icon]').forEach((s) => {
    const k = s.dataset.icon; const c = goalIcon(/^\d$/.test(k) ? +k : k);
    s.replaceWith(c);
  });
}
export const BOOSTER_NAMES = { hammer: 'Hammer', line: 'Line', shuffle: 'Shuffle', plus5: '+5\u00a0Moves' };
const GOAL_TEXT = { score: 'Reach the score', collect: 'Collect pieces', crust: 'Clear the mineral crust', stone: 'Break the tufa', moss: 'Clear the algae', lock: 'Open the padlocks', tokens: 'Deliver bath tokens to the drains' };
export function showIntro(L) {
  const node = document.querySelector(`.node[data-level="${L.id}"]`), map = document.querySelector('.screen.map');
  if (node && map) { map.scrollTop = Math.max(0, node.offsetTop - map.clientHeight * 0.55); map.dispatchEvent(new Event('scroll')); }
  setScene('intro'); setMood('intro', L.world); sfx('intro');
  const look = WORLD_LOOK[L.world], pr = SAVE.progress[L.id];
  const m = openModal(`
    <div class="stamp">W${L.world}<br>No. ${L.n}</div>
    <p class="fine">World ${L.world} · ${esc(look.name)}</p>
    <h2>${esc(L.name)}</h2>
    <p>${L.goals.map((g) => GOAL_TEXT[g.type]).join(' · ')}${L.moves ? ` in <b>${L.moves} moves</b>` : ''}.</p>
    <div class="goals-big">${goalChips(L.goals)}</div>
    <p class="fine">Stars at ${L.stars.map((x) => x.toLocaleString('en-US')).join(' · ')} points${pr ? ` · best ${pr.best.toLocaleString('en-US')}` : ''}</p>
    <div class="actions"><button class="btn" data-act="go" data-focus>Play</button><button class="btn alt small" data-act="back">Map</button><button class="round" data-act="help" aria-label="How to play">?</button></div>`, { label: `Level ${L.world}-${L.n} ${L.name}` });
  fillIcons(m);
  bindActs(m, { go: () => enterLevel(L), back: () => showMap(L.id), help: () => showHelp(() => showIntro(L)) });
}

export function enterLevel(L, opts = {}) {
  if (opts.continue) {
    const saved = adoptCurrent();
    if (!saved) { showTitle(); toast('That saved level changed. Choose a current level or start a new one.'); return false; }
    L = levelById(saved.levelId); opts = { ...opts, state: saved.state };
    if (!L) { showTitle(); toast('Saved level unavailable'); return false; }
  } else {
    const reserved = reserveCurrent();
    if (!reserved.ok && reserved.reason !== 'storage-unavailable') return false;
  }
  closeModal();
  screenEl().innerHTML = ''; screenEl().className = 'screen';
  setScene('game');
  startLevel(L, opts);
  const tip = L.tip && TIPS[L.tip];
  if (tip && !SAVE.tutorialSeen.includes(L.tip)) {
    showTip(L.tip);
    if (L.tip === 'basics') showHint(); // the first lesson shows the move as well as describing it: the hint arrow starts at once
  }
}

// --- tutorial tips (Della, fictional guide) -------------------------------------------------------
export function showTip(id) {
  const tip = TIPS[id];
  if (!tip) return;
  closeTip();
  UI.tipOpen = true;
  const el = document.createElement('div');
  el.className = 'tip'; el.id = 'tip'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', `Tip: ${tip.title}`);
  const L = VIEW.layout, portrait = L.portrait;
  if (portrait) {
    const hud = document.getElementById('hud').getBoundingClientRect();
    el.style.top = `${Math.round(hud.bottom + 4)}px`;
  } else {
    const hud = document.getElementById('hud').getBoundingClientRect();
    el.style.left = '24px'; el.style.transform = 'none'; el.style.width = '250px'; el.style.top = `${hud.bottom + 12}px`; el.style.flexDirection = 'column'; el.style.alignItems = 'stretch';
  }
  const della = paint('della-' + (tip.pose || 'wave'));
  el.innerHTML = `<div class="della" style="${della ? `background-image:url(${della})` : 'display:none'}"></div><div class="bubble card"><div class="who">Della <small>· your bath attendant (fictional)</small></div><p>${tip.html}</p><button class="btn small" data-act="ok" data-focus>Got it</button></div>`;
  document.getElementById('app').appendChild(el);
  if (!portrait) {
    // Della stands beside the card, over the backdrop between the HUD column and the board; a card that would run off the bottom moves up.
    const d = el.querySelector('.della'), r = el.getBoundingClientRect();
    d.style.width = `${Math.max(60, Math.min(130, L.bx - r.right - 8))}px`;
    if (r.bottom > L.H - 8) el.style.top = `${Math.max(8, L.H - 8 - r.height)}px`;
  }
  bindActs(el, { ok: () => { markTutorial(id); closeTip(); } });
  el.querySelector('[data-focus]').focus();
}
export function closeTip() { const t = document.getElementById('tip'); if (t) t.remove(); UI.tipOpen = false; }

// --- results -------------------------------------------------------------------------------------
function loreFor(L) {
  const list = LORE.filter((c) => c.world === L.world);
  return list[(L.n - 1) % list.length];
}
export function onWin(s, L) {
  closeTip();
  setScene('win');
  if (L.mode === 'daily') return onDailyWin(s, L);
  if (s.mode === 'soak') return;
  const stars = s.starsWon, total = s.score + (s.encoreScore || 0); // stars are counted on the score plus the Encore
  const card = loreFor(L);
  const receipt = saveTerminal({ levelId: L.id, stars, score: total, moves: s.movesUsed, loreId: card && card.id,
    rewardType: ['hammer', 'line', 'shuffle', 'plus5'][LEVELS.indexOf(L) % 4],
    worldLevels: LEVELS.filter((l) => l.world === L.world).map((l) => l.id) }, { levelId: L.id, state: cloneState(s) });
  const rewards = [receipt.outcome?.levelReward, receipt.outcome?.starReward].filter(Boolean).map((k) => BOOSTER_NAMES[k]);
  const worldComplete = !!receipt.outcome?.worldComplete;
  sfx('win'); setMood('results', L.world);
  const idx = LEVELS.indexOf(L), next = LEVELS[idx + 1];
  const m = openModal(`
    <div class="ribbon"><span>Level cleared!</span></div>
    <p class="fine" style="text-align:center">World ${L.world} · Level ${L.n}</p>
    <h2 style="text-align:center">${esc(L.name)}</h2>
    <div class="stars-big burst" aria-label="${stars} of 3 stars">${[1, 2, 3].map((n) => `<i class="${n <= stars ? 'on pop' : ''}" style="animation-delay:${n * 0.18}s"></i>`).join('')}</div>
    <p class="result-score" data-to="${total}">${total.toLocaleString('en-US')}</p>
    <p class="result-sub">${s.encoreScore ? `${s.score.toLocaleString('en-US')} + ${s.encoreScore.toLocaleString('en-US')} Encore bonus: stars count both` : 'points'}${rewards.length ? ` · new booster: ${rewards.join(', ')}` : ''}</p>
    <p class="fine" style="text-align:center">${totalStars()} stars · next booster at ${nextBoosterAt()}</p>
    ${card ? `<div class="lore${paint('card-frame') ? ' framed' : ''}" style="${paint('card-frame') ? `--card-frame: url(${paint('card-frame')})` : ''}" aria-label="Lore card"><span class="tag">Real history</span><h4>${esc(card.title)}</h4><p>${esc(card.text)}</p><p class="src">Source: ${esc(card.source)}</p></div>` : ''}
    <div class="actions">${next && !worldComplete ? '<button class="btn" data-act="next" data-focus>Next level</button>' : ''}${worldComplete ? '<button class="btn" data-act="world" data-focus>Postcard restored!</button>' : ''}<button class="btn alt small" data-act="replay">Replay</button><button class="btn alt small" data-act="map">Map</button></div>`, { label: 'Level cleared' });
  stars && [1, 2, 3].slice(0, stars).forEach((n) => setTimeout(() => sfx('star', n), 200 + n * 180));
  if (rewards.length) setTimeout(() => { if (UI.scene === 'win') sfx('earned'); }, 200 + (stars + 1) * 180 + 250);
  celebrate(m, L.world);
  bindActs(m, { next: () => showIntro(next), replay: () => enterLevel(L), map: () => showMap(L.id), world: () => showWorldComplete(L.world) });
}
// Sparkles drift up around the results card; the score counts up from zero (instantly under reduced motion).
function celebrate(m, world = 1) {
  const fx = document.createElement('div');
  fx.className = 'sparkles'; fx.setAttribute('aria-hidden', 'true');
  let html = '';
  for (let i = 0; i < 18; i++) {
    const x = (i * 37 + 11) % 100, d = ((i * 53) % 17) / 10, sz = 6 + ((i * 29) % 9);
    html += `<i style="left:${x}%;top:${10 + ((i * 41) % 80)}%;width:${sz}px;height:${sz}px;animation-delay:-${d}s"></i>`;
  }
  fx.innerHTML = html;
  m.insertBefore(fx, m.firstChild);
  m.insertAdjacentHTML('afterbegin', atmosphere('world', world)); // the world's own slow motion behind the card
  const el = m.querySelector('.result-score');
  if (!el || VIEW.reduced) return;
  const to = +el.dataset.to, t0 = performance.now();
  const step = (t) => {
    const q = Math.min(1, (t - t0) / 900);
    el.textContent = Math.round(to * (1 - (1 - q) ** 3)).toLocaleString('en-US');
    if (q < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function onLose(s, L) {
  const daily = L.mode === 'daily';
  if (daily) saveDaily({ key: L.dayKey, score: s.score, stars: 0, won: false });
  else if (s.mode !== 'soak') saveTerminal(null, { levelId: L.id, state: cloneState(s) }, L.id);
  closeTip();
  setScene('lose');
  sfx('lose'); setMood('results', L.world);
  const plus = SAVE.boosters.plus5 > 0 && s.movesLeft != null && !s.stuck;
  const left = s.goals.filter((g) => !(g.type === 'moss' ? g.have === 0 : g.have >= g.need));
  const frac = s.goals.length ? s.goals.reduce((a, g) => a + (g.type === 'moss' ? (g.start ? 1 - g.have / g.start : 0) : g.type === 'score' ? Math.min(1, s.score / g.need) : Math.min(1, g.have / Math.max(1, g.need))), 0) / s.goals.length : 0;
  const remain = (g) => (g.type === 'moss' ? g.have : g.type === 'score' ? Math.max(0, g.need - s.score) : Math.max(0, g.need - g.have));
  const pills = left.map((g) => `<span class="goal"><span class="ic" data-icon="${g.type === 'collect' ? g.kind : g.type === 'tokens' ? 'token' : g.type}"></span><span class="n">${g.type === 'score' ? remain(g).toLocaleString('en-US') : remain(g)}</span></span>`).join('');
  const m = openModal(`
    <h2 style="text-align:center">${s.stuck ? 'No moves left' : 'Out of moves'}</h2>
    <p style="text-align:center">${s.stuck ? (s.moss.some(Boolean) ? 'The algae took over the board!' : 'No swaps are possible.') : frac >= 0.5 ? 'So close! Still to do:' : 'Still to do:'}</p>
    <div class="goals-big" aria-label="${esc(left.map((g) => goalLabel(g, remain(g))).join('; '))}">${pills}</div>
    <div class="actions lose-actions">${plus ? `<button class="btn" data-act="plus" data-focus>+5 moves (${SAVE.boosters.plus5} left)</button>` : ''}<button class="btn${plus ? ' alt' : ''}" data-act="retry" ${plus ? '' : 'data-focus'}>Retry</button><button class="btn alt small" data-act="map">${daily ? 'Home' : 'Map'}</button></div>`, { label: 'Out of moves' });
  fillIcons(m);
  bindActs(m, {
    plus: () => { closeModal(); setScene('game'); doBooster('plus5'); },
    retry: () => (daily ? startDaily() : enterLevel(L)),
    map: () => (daily ? showTitle() : showMap(L.id)),
  });
}
export function showWorldComplete(w) {
  setScene('world'); sfx('world'); setTimeout(() => { if (UI.scene === 'world') sfx('earned'); }, 1100);
  const look = WORLD_LOOK[w], pc = paint(`postcard${w}`);
  const m = openModal(`
    <h2 style="text-align:center">World ${w} complete</h2>
    <p style="text-align:center">${esc(look.name)}: the postcard is restored.</p>
    <div class="help-demo" style="aspect-ratio:3/2;${pc ? `background:url(${pc}) center/cover` : `background:linear-gradient(135deg, ${look.sky[0]}, ${look.sky[1]})`}"></div>
    <p class="fine" style="text-align:center">+1 of every booster</p>
    <div class="actions">${w < 6 ? '<button class="btn" data-act="map" data-focus>On to the next world</button>' : '<button class="btn" data-act="map" data-focus>Back to the map</button>'}</div>`, { label: `World ${w} complete` });
  m.insertAdjacentHTML('afterbegin', atmosphere('world', w));
  bindActs(m, { map: () => showMap() });
}

// --- pause ---------------------------------------------------------------------------------------
export function showPause() {
  if (UI.scene !== 'game') return;
  setScene('pause'); holdMusic('pause');
  const L = PLAY.level, daily = L.mode === 'daily';
  const m = openModal(`<h2>Paused</h2><p class="fine">${esc(L.name)}</p>
    <div class="menu" style="margin:12px auto 0"><button class="btn" data-act="resume" data-focus>Resume</button><button class="btn alt" data-act="restart">Restart level</button><button class="btn alt" data-act="help">How to play</button><button class="btn alt" data-act="settings">Settings</button><button class="btn alt" data-act="map">${daily ? 'Quit to title' : 'Save &amp; quit to map'}</button></div>`, { label: 'Paused' });
  bindActs(m, { resume: () => { closeModal(); setScene('game'); releaseMusic('pause'); }, restart: () => (PLAY.state && PLAY.state.movesUsed > 0 ? confirmRestart(L, daily) : daily ? startDaily() : enterLevel(L)), help: () => showHelp('game'), settings: () => showSettings('game'), map: () => (daily ? showTitle() : showMap(L.id)) });
}

// Restart throws the board away, so once a move has been made it asks first; Keep playing is the default and what Esc picks.
function confirmRestart(L, daily) {
  const used = PLAY.state.movesUsed;
  const m = openModal(`<h2>Restart this level?</h2><p>Your ${used === 1 ? 'move' : used + ' moves'} so far will be lost. Boosters you used stay spent.</p>
    <div class="actions"><button class="btn small" data-act="back" data-focus>Keep playing</button><button class="btn alt small" data-act="restart">Restart</button></div>`, { label: 'Confirm restart' });
  bindActs(m, { back: () => { setScene('game'); showPause(); }, restart: () => (daily ? startDaily() : enterLevel(L)) });
}

// --- help ----------------------------------------------------------------------------------------
const HELP = [
  ['basics', 'Basics', `<ul class="help-list"><li>Swap two neighbouring pieces to line up <b>three or more</b> of a kind.</li><li>Matched pieces clear and new ones drop in. New matches chain at a rising multiplier, up to <b>×8</b>.</li><li>Meet every goal before the moves run out. Leftover moves become the <b>Encore</b>.</li><li>Stars come from your score when the goals are met, plus the Encore bonus.</li></ul><p class="fine">The six pieces: ${PIECES.map((p) => p.name).join(', ')}.</p>`],
  ['specials', 'Specials', `<div class="help-pieces" data-pieces="p0h,p2b,crystal"></div><ul class="help-list"><li><b>Cascade</b>: match 4 in a line. It sweeps its row or column (it follows the direction you swapped). <b>Swipe it</b> any way, or match it, to fire it.</li><li><b>Hot Stone</b>: match an L, T or + shape. <b>Swipe it</b> or match it: it bursts the cells around it, then gives one aftershock.</li><li><b>Spring Crystal</b>: match 5 in a line. Swap it with a piece to clear every piece of that kind.</li></ul><p class="fine">The names are game flavour: the town has a real Hot Water Cascade, but no geysers or hot stones.</p>`],
  ['combos', 'Combos', `<ul class="help-list"><li>Cascade + Cascade: a row and a column.</li><li>Cascade + Hot Stone: three rows and three columns.</li><li>Hot Stone + Hot Stone: a huge burst.</li><li>Crystal + Cascade or Hot Stone: every piece of that kind becomes that special and fires.</li><li>Crystal + Crystal: clears the whole board.</li></ul>`],
  ['blockers', 'Blockers', `<ul class="help-list"><li><b>Tufa</b> (1-3 layers): break it with matches beside it or with specials.</li><li><b>Mineral crust</b> under pieces: clear the piece above it.</li><li><b>Padlocked safe</b>: the piece can match but can't move.</li><li><b>Algae</b>: clear it with nearby matches, or it spreads after any move that doesn't touch it.</li><li><b>Steam fog</b>: hides a piece until a match beside it lifts the fog.</li></ul>`],
  ['goals', 'Goals', `<ul class="help-list"><li>Reach a score · collect pieces · clear the crust · break tufa · clear algae · open padlocks.</li><li><b>Bath tokens</b> fall like pieces: bring them down to the brass drains.</li><li><b>Daily Challenge</b>: one board a day, the same for every player. Clear it on consecutive days to build a streak.</li><li>Boosters (earned, never bought): Hammer, Line (tap the booster again to switch row and column), Shuffle, +5 moves.</li></ul>`],
  ['controls', 'Controls', `<ul class="help-list"><li><b>Mouse or touch</b>: drag a piece toward a neighbour, or tap one piece and then its neighbour.</li><li><b>Keyboard</b>: <span class="kbd">←</span><span class="kbd">↑</span><span class="kbd">→</span><span class="kbd">↓</span> move the cursor, <span class="kbd">Enter</span> or <span class="kbd">Space</span> picks a piece, then an arrow swaps it. <span class="kbd">1</span>–<span class="kbd">4</span> Hammer, Line, Shuffle, +5 Moves, <span class="kbd">H</span> hint, <span class="kbd">P</span> pause, <span class="kbd">Esc</span> cancels or skips.</li><li>Tap or press a key during a chain to skip the animation.</li></ul>`],
];
export function showHelp(back, tab = 'basics') {
  const prev = UI.scene;
  setScene('help');
  const render = (id) => {
    const t = HELP.find((h) => h[0] === id) || HELP[0];
    const m = openModal(`<h2>How to play</h2><div class="tabs" role="tablist">${HELP.map((h) => `<button class="tab" role="tab" aria-selected="${h[0] === t[0]}" data-tab="${h[0]}">${h[1]}</button>`).join('')}</div>
      <div role="tabpanel" aria-label="${t[1]}">${t[2]}</div>
      <div class="actions"><button class="btn small" data-act="close">${back ? 'Back' : 'Close'}</button></div>`, { label: 'How to play' });
    m.querySelectorAll('[data-pieces]').forEach((box) => {
      for (const [n, label] of box.dataset.pieces.split(',').map((n, i) => [n, ['Cascade', 'Hot Stone', 'Spring Crystal'][i]])) {
        const img = ICON_IMAGES[n];
        const fig = document.createElement('figure');
        fig.innerHTML = `<figcaption>${label}</figcaption>`;
        if (img) { const im = new Image(); im.src = img.src; im.alt = ''; fig.prepend(im); }
        box.appendChild(fig);
      }
    });
    m.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sfx('click'); render(b.dataset.tab); m.querySelector(`[data-tab="${b.dataset.tab}"]`).focus(); }));
    bindActs(m, { close: () => back === 'game' ? (setScene('game'), showPause()) : back ? back() : (closeModal(), setScene(prev === 'help' ? 'title' : prev)) });
  };
  render(tab);
}

// --- settings ------------------------------------------------------------------------------------
export function applySettings() {
  const st = SAVE.settings;
  AUDIO.sound = st.sound; AUDIO.music = st.music; AUDIO.ambience = st.ambience; AUDIO.volume = st.volume; applyLevels();
  const sysReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  VIEW.reduced = st.motion === 'reduced' || (st.motion === 'auto' && sysReduced);
  VIEW.steam = st.steam;
  document.body.classList.toggle('no-steam', !st.steam);
  VIEW.badges = !!st.badges;
  document.body.classList.toggle('reduced', VIEW.reduced);
  document.body.classList.toggle('badges', st.badges);
  requestRender();
}
export function showSettings(back) {
  const prev = UI.scene;
  setScene('settings');
  const st = SAVE.settings;
  const toggle = (key, label) => `<div class="set-row"><label id="l-${key}">${label}</label><button class="chip-btn" data-toggle="${key}" aria-labelledby="l-${key}" aria-pressed="${!!st[key]}">${st[key] ? 'On' : 'Off'}</button></div>`;
  const m = openModal(`<h2>Settings</h2>
    ${toggle('sound', 'Sound effects')}${toggle('music', 'Music')}${toggle('ambience', 'Ambience')}
    <div class="set-row"><label for="vol">Volume</label><input id="vol" type="range" min="0" max="1" step="0.05" value="${st.volume}"></div>
    <div class="set-row"><label id="l-motion">Motion</label><div class="seg" role="group" aria-labelledby="l-motion">${['auto', 'reduced', 'full'].map((v) => `<button class="chip-btn" data-motion="${v}" aria-pressed="${st.motion === v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div>
    ${toggle('steam', 'Ambient steam')}${toggle('hints', 'Hints after 5 s')}${toggle('badges', 'Colour-blind badges')}
    <div class="set-row"><label>Progress</label><button class="chip-btn" data-act="reset">Reset…</button></div>
    <div class="set-row"><label>Play record</label><button class="chip-btn" data-act="copystats">Copy my stats</button></div>
    ${SAVE.storageOk ? '' : saveUnreadable() ? (back === 'game' ? '<p class="fine">Your saved progress could not be read, so this visit is not being saved. Reset… starts fresh and keeps a copy of the old save.</p>' : '<div class="set-row" id="fresh-row"><label>Saved progress could not be read</label><button class="chip-btn" data-act="fresh">Start fresh (your old save is kept)</button></div>') : '<p class="fine">Storage is unavailable: progress lasts for this visit only.</p>'}
    <div class="actions"><button class="btn small" data-act="close" data-focus>Done</button></div>`, { label: 'Settings' });
  m.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.toggle; changeSettings({ [k]: !st[k] }); b.setAttribute('aria-pressed', st[k]); b.textContent = st[k] ? 'On' : 'Off';
    applySettings(); unlockAudio(); sfx('click');
  }));
  m.querySelectorAll('[data-motion]').forEach((b) => b.addEventListener('click', () => {
    changeSettings({ motion: b.dataset.motion }); m.querySelectorAll('[data-motion]').forEach((x) => x.setAttribute('aria-pressed', st.motion === x.dataset.motion)); applySettings();
  }));
  m.querySelector('#vol').addEventListener('input', (e) => { changeSettings({ volume: +e.target.value }); applySettings(); });
  bindActs(m, {
    fresh: () => { const r = startFreshSave(); toast(r.ok ? 'Started fresh. Your old save is kept.' : 'Could not start fresh. Storage is unavailable.'); if (r.ok) m.querySelector('#fresh-row')?.remove(); },
    reset: () => confirmReset(prev, back),
    copystats: copyStats,
    close: () => (back === 'game' ? (setScene('game'), showPause()) : (closeModal(), prev === 'map' ? showMap() : setScene(prev === 'settings' ? 'title' : prev))),
  });
}

// What each level has taken so far, as JSON on the clipboard, so playtesters can send their numbers for tuning.
function statsJson() {
  const levels = {};
  for (const l of LEVELS) {
    const p = SAVE.progress[l.id], e = SAVE.stats[l.id];
    if (p || e) levels[l.id] = { moves: l.moves, stars: p ? p.stars : 0, best: p ? p.best : 0, tries: e ? e.tries : 0, wins: e ? e.wins : 0, bestMoves: e ? e.bestMoves : 0 };
  }
  return JSON.stringify({ game: 'Spa City Sparkle', stats: 1, stars: totalStars(), levels });
}
function copyStats() {
  const done = () => toast('Stats copied'), failed = () => toast('Could not copy your stats');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(statsJson()).then(done, failed); else failed();
}

// Reset asks in the game's own card; Keep is the default and what Esc picks.
function confirmReset(prev, back) {
  const m = openModal(`<h2>Erase everything?</h2><p>This clears all your stars, boosters and saved levels. It cannot be undone.</p>
    <div class="actions"><button class="btn small" data-act="back" data-focus>Keep</button><button class="btn alt small" data-act="erase">Erase</button></div>`, { label: 'Confirm reset' });
  const again = () => { setScene(prev); showSettings(back); };
  bindActs(m, {
    back: again,
    erase: () => { const result = resetSave(); again(); toast(result.ok ? 'Progress reset' : 'Reset is not saved yet. Storage or another tab changed.'); },
  });
}

// --- about ---------------------------------------------------------------------------------------
export function showAbout() {
  const prev = UI.scene;
  setScene('about');
  const m = openModal(`<h2>About</h2>
    <p><b>Spa City Sparkle</b> is an original swap-and-match puzzle game from the Hot Springs Games collection.</p>
    <p class="fine">Game rules are original. Places are real; the lore cards cite their sources (checked against the collection's audited fact bank). Della, the guide, is fictional. Piece and special names are game flavour.</p>
    <p class="fine">No logos or trademarks are shown, and nothing implies endorsement by any park, business or attraction.</p>
    <p class="fine">Art: pieces modelled and rendered in Blender; backdrops are AI-assisted paintings made for this game (no real people, no imitation of living artists). Sound is synthesized in your browser. Renderer: PixiJS (MIT). Fonts: Righteous and Nunito (SIL OFL).</p>
    <p class="fine">Open source under the MIT licence.</p>
    <div class="actions"><button class="btn small" data-act="close" data-focus>Close</button></div>`, { label: 'About' });
  bindActs(m, { close: () => { closeModal(); setScene(prev === 'about' ? 'title' : prev); } });
}

// --- Daily Challenge -----------------------------------------------------------------------------
export const todayKey = () => UI.dailyDate || dayKey();
const dateOf = (k) => new Date(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10));
const longDate = (k) => dateOf(k).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function dailyNote() {
  const key = todayKey(), day = cleanDaily(SAVE.daily).days[key], streak = streakNow(SAVE.daily, key);
  const today = day && day.won ? `Today: ${plural(day.stars, 'star')}` : day ? 'Today: not cleared yet' : 'A new board today';
  return streak ? `${today} · ${plural(streak, 'day')} in a row` : today;
}
export function showDaily() {
  const key = todayKey(), { level: L } = dailyLevel(LEVELS, key), d = cleanDaily(SAVE.daily), day = d.days[key];
  setScene('daily-card');
  const streak = streakNow(d, key), n = (v) => v.toLocaleString('en-US');
  const cells = [];
  for (let i = 13; i >= 0; i--) {
    const k = addDays(key, -i), e = d.days[k], cls = e ? (e.won ? 's' + e.stars : 'tried') : 'none';
    const label = `${dateOf(k).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: ${e ? (e.won ? plural(e.stars, 'star') : 'not cleared') : 'not played'}`;
    cells.push(`<li class="dc ${cls}${i === 0 ? ' today' : ''}" aria-label="${esc(label)}" title="${esc(label)}"><span aria-hidden="true">${+k.slice(8)}</span></li>`);
  }
  const m = openModal(`
    <div class="stamp">DAILY<br>${dateOf(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
    <p class="fine">${esc(longDate(key))}</p>
    <h2>${esc(L.name)}</h2>
    <p>${L.goals.map((g) => GOAL_TEXT[g.type]).join(' · ')} in <b>${L.moves} moves</b>.</p>
    <div class="goals-big">${goalChips(L.goals)}</div>
    <p class="fine">Stars at ${L.stars.map(n).join(' · ')} points, counting the Encore</p>
    <dl class="daily-stats">
      <div><dt>Streak</dt><dd>${plural(streak, 'day')}</dd></div>
      <div><dt>Best today</dt><dd>${day && day.best ? n(day.best) : '–'}</dd></div>
      <div><dt>Best ever</dt><dd>${SAVE.soakBest ? n(SAVE.soakBest) : '–'}</dd></div>
    </dl>
    <p class="fine">Longest streak: ${plural(d.bestStreak, 'day')}. The last two weeks:</p>
    <ol class="daily-cal" aria-label="The last 14 days">${cells.join('')}</ol>
    <div class="actions"><button class="btn" data-act="go" data-focus>${day && day.tries ? 'Play again' : 'Play'}</button><button class="btn alt small" data-act="back">Back</button></div>`, { label: 'Daily Challenge' });
  fillIcons(m);
  bindActs(m, { go: () => startDaily(), back: () => { closeModal(); setScene('title'); } });
}
export function startDaily() {
  const key = todayKey(), { level: L, seed } = dailyLevel(LEVELS, key);
  const reserved = reserveCurrent('soak');
  if (!reserved.ok && reserved.reason !== 'storage-unavailable') return;
  L.dayKey = key;
  closeModal();
  screenEl().innerHTML = ''; screenEl().className = 'screen';
  setScene('game');
  startLevel(L, { seed });
  toast(`Daily challenge: ${L.moves} moves`);
}
function onDailyWin(s, L) {
  const total = s.score + (s.encoreScore || 0), stars = s.starsWon;
  const receipt = saveDaily({ key: L.dayKey, score: total, stars, won: true });
  const o = receipt.outcome || {}, d = cleanDaily(SAVE.daily), n = (v) => v.toLocaleString('en-US');
  sfx('win'); setMood('results', L.world);
  const bits = [];
  if (o.newBest) bits.push('new best today');
  if (o.newEver) bits.push('new best ever');
  const m = openModal(`
    <div class="ribbon"><span>Daily cleared!</span></div>
    <p class="fine" style="text-align:center">${esc(longDate(L.dayKey))}</p>
    <h2 style="text-align:center">${esc(L.name)}</h2>
    <div class="stars-big burst" aria-label="${stars} of 3 stars">${[1, 2, 3].map((k) => `<i class="${k <= stars ? 'on pop' : ''}" style="animation-delay:${k * 0.18}s"></i>`).join('')}</div>
    <p class="result-score" data-to="${total}">${n(total)}</p>
    <p class="result-sub">${s.encoreScore ? `${n(s.score)} + ${n(s.encoreScore)} Encore bonus` : 'points'}${bits.length ? ' · ' + bits.join(' · ') : ''}</p>
    <p class="daily-line" style="text-align:center"><b>${plural(o.streak != null ? o.streak : streakNow(d, L.dayKey), 'day')}</b> in a row · best ever ${n(SAVE.soakBest || total)}</p>
    <div class="actions"><button class="btn" data-act="again" data-focus>Play again</button><button class="btn alt small" data-act="back">Home</button></div>`, { label: 'Daily cleared' });
  stars && [1, 2, 3].slice(0, stars).forEach((k) => setTimeout(() => sfx('star', k), 200 + k * 180));
  celebrate(m, L.world);
  bindActs(m, { again: () => startDaily(), back: () => showTitle() });
}

export function wireUi() {
  configureSaveEffects({ onChange: applySettings, onUnsaved: () => toast('Not saved: storage is unavailable. Keep this tab open.', 4200), onConflict: (reason) => toast(reason.includes(' ') ? reason : 'Your progress changed in another tab. Choose Continue or a new level.', 3200) });
  PLAY.ui = { onWin, onLose, toast, announce };
  $('btn-pause').addEventListener('click', () => { sfx('click'); showPause(); });
  window.addEventListener('resize', () => {
    if (UI.scene === 'game' || UI.scene === 'pause') layoutAndBuild();
  });
  updateHud();
}
