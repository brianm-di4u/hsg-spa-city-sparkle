// window.__game: the test-harness contract (shared/test-harness/README.md, DEV-PLAN §3).
import { PLAY, startLevel, doSwap, doBooster, skipAnim, showHint, layoutAndBuild, updateHud, levelById, armBooster, replayLast, beatAt } from './play.js';
import { UI, showTitle, showMap, showIntro, enterLevel, showHelp, showSettings, showAbout, showPause, onWin, onLose, showWorldComplete, startSoak, closeModal, showTip, closeTip } from './screens.js';
import { SAVE, writeSave } from './save.js';
import { VIEW, requestRender } from '../view/stage.js';
import { BOARD } from '../view/board-view.js';
import { boardFromAscii, cloneState, hashState } from '../engine/grid.js';
import { legalMoves } from '../engine/moves.js';
import { AUDIO } from '../audio.js';

export const HOOK = { seed: 1, artReady: () => true };

const idxOf = (p) => (Array.isArray(p) ? p[1] * PLAY.state.w + p[0] : p);

function summary() {
  const s = PLAY.state;
  const board = s && {
    w: s.w, h: s.h,
    cells: s.tile.map((t, i) => (s.mask[i] ? { k: t ? t.k : null, s: t ? t.s : null, id: t ? t.id : null, stone: s.stone[i], moss: s.moss[i], crust: s.crust[i], lock: s.lock[i], fog: s.fog[i], exit: s.exit[i] } : null)),
  };
  return {
    scene: UI.scene, level: PLAY.level ? PLAY.level.id : null, board,
    movesLeft: s ? s.movesLeft : null, movesUsed: s ? s.movesUsed : 0, score: s ? s.score : 0, encoreScore: s ? s.encoreScore : 0,
    goals: s ? s.goals.map((g) => ({ ...g })) : [], phase: s ? s.phase : null, stars: s ? s.starsWon : 0, starThresholds: s ? s.stars : [],
    boosters: s ? { ...s.boosters } : {}, saveBoosters: { ...SAVE.boosters }, progress: JSON.parse(JSON.stringify(SAVE.progress)), settings: { ...SAVE.settings },
    lore: SAVE.lore.slice(), tutorialSeen: SAVE.tutorialSeen.slice(), storageOk: SAVE.storageOk, current: SAVE.current ? SAVE.current.levelId : null,
    lastTimeline: PLAY.lastResult, anim: { playing: !!PLAY.anim, frozen: VIEW.frozenMs }, hash: s ? hashState(s) : null,
    selected: PLAY.selected, cursor: PLAY.cursor, hint: BOARD.hint, armed: PLAY.armed, art: VIEW.artSource,
    layout: { ...VIEW.layout }, reduced: VIEW.reduced, modal: UI.modalOpen, tip: UI.tipOpen, sounds: AUDIO.played.slice(-20),
    stats: s ? { ...s.stats } : null, levels: LEVELS.length,
  };
}

export function installHooks() {
  window.__game = {
    seed(n) { HOOK.seed = n; return n; },
    getState: () => summary(),
    engineState: () => (PLAY.state ? cloneState(PLAY.state) : null),
    setState(s) { PLAY.state = cloneState(s); PLAY.anim = null; layoutAndBuild(); updateHud(); return true; },
    isIdle: () => VIEW.ready && HOOK.artReady() && !PLAY.anim && !PLAY.pendingEncore && UI.transitions === 0,
    scene(name, arg) {
      const L = levelById(arg || (PLAY.level && PLAY.level.id) || LEVELS[0].id);
      const map = {
        title: () => showTitle(), map: () => showMap(arg), intro: () => showIntro(L), help: () => showHelp(undefined, arg), settings: () => showSettings(), about: () => showAbout(),
        game: () => enterLevel(L, { seed: HOOK.seed }), pause: () => showPause(), soak: () => startSoak(), world: () => showWorldComplete(+(arg || 1)),
        win: () => { if (!PLAY.state) enterLevel(L, { seed: HOOK.seed }); const s = PLAY.state; s.score = Math.max(s.score, s.stars[2]); s.encoreScore = s.encoreScore || 1860; for (const g of s.goals) g.have = g.type === 'moss' ? 0 : g.type === 'score' ? s.score : g.need; s.movesLeft = 0; s.phase = 'won'; s.starsWon = 3; PLAY.ui && updateHud(); onWin(s, PLAY.level); },
        lose: () => { if (!PLAY.state) enterLevel(L, { seed: HOOK.seed }); PLAY.state.movesLeft = 0; PLAY.state.phase = 'lost'; updateHud(); onLose(PLAY.state, PLAY.level); },
      };
      (map[name] || map.title)();
      return UI.scene;
    },
    newGame(opts = {}) {
      const L = levelById(opts.level || LEVELS[0].id);
      if (opts.seed != null) HOOK.seed = opts.seed;
      closeModal(); closeTip();
      if (opts.tips === false) for (const l of LEVELS) if (l.tip && !SAVE.tutorialSeen.includes(l.tip)) SAVE.tutorialSeen.push(l.tip);
      enterLevel(L, { seed: HOOK.seed });
      return summary();
    },
    act(name, ...args) {
      switch (name) {
        case 'swap': { const r = doSwap(idxOf(args[0]), idxOf(args[1])); return { valid: r.valid, reason: r.reason || null, waves: r.waves || 0, combo: r.combo || null }; }
        case 'booster': { const r = doBooster(args[0], args[1] != null ? idxOf(args[1]) : undefined, args[2]); return { valid: r.valid, reason: r.reason || null }; }
        case 'arm': armBooster(args[0]); return PLAY.armed;
        case 'skip': skipAnim(); return true;
        case 'clock': {
          if (args[0] == null) { if (PLAY.anim && VIEW.frozenMs != null) PLAY.anim.t0 = performance.now() - VIEW.frozenMs; VIEW.frozenMs = null; }
          else VIEW.frozenMs = args[0];
          requestRender();
          return VIEW.frozenMs;
        }
        case 'total': return PLAY.anim ? PLAY.anim.sched.total : 0;
        case 'replay': return replayLast();
        case 'beatAt': return beatAt(args[0], args[1]);
        case 'hint': return showHint();
        case 'legal': return PLAY.state ? legalMoves(PLAY.state).map(([a, b]) => [[a % PLAY.state.w, (a / PLAY.state.w) | 0], [b % PLAY.state.w, (b / PLAY.state.w) | 0]]) : [];
        case 'board': {
          const s = boardFromAscii(args[0], { seed: HOOK.seed, moves: args[1] && args[1].moves != null ? args[1].moves : 20, ...(args[1] || {}) });
          const prev = PLAY.state;
          s.stars = (args[1] && args[1].stars) || (prev ? prev.stars.slice() : [1000, 2000, 3000]);
          if (!(args[1] && args[1].goals) && prev) { s.goals = prev.goals.map((g) => ({ ...g, have: 0 })); }
          s.boosters = { ...SAVE.boosters, ...((args[1] && args[1].boosters) || {}) };
          PLAY.state = s; PLAY.anim = null; layoutAndBuild(); updateHud(); return true;
        }
        case 'progress': Object.assign(SAVE.progress, args[0] || {}); if (args[1]) Object.assign(SAVE.boosters, args[1]); writeSave(); return true;
        case 'tip': showTip(args[0]); return true;
        case 'win': onWin(PLAY.state, PLAY.level); return true;
        case 'lose': onLose(PLAY.state, PLAY.level); return true;
        default: return null;
      }
    },
    step(n = 1) { if (VIEW.frozenMs == null) VIEW.frozenMs = 0; VIEW.frozenMs += n * 16.67; requestRender(); return VIEW.frozenMs; },
    pause() { VIEW.frozenMs = VIEW.frozenMs == null ? (PLAY.anim ? performance.now() - PLAY.anim.t0 : 0) : VIEW.frozenMs; return true; },
    resume() { return window.__game.act('clock', null); },
  };
}
