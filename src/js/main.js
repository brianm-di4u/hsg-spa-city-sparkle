// Spa City Sparkle: boot. Loads settings, starts the Pixi stage, loads art, wires input and screens.
import { loadSave } from './ui/save.js';
import { VIEW, initStage, buildVectorTextures, requestRender } from './view/stage.js';
import { PLAY, bindInput, handleKey, playFrame, levelById, layoutAndBuild, armBooster } from './ui/play.js';
import { UI, showTitle, showPause, wireUi, applySettings, closeModal, enterLevel, showMap } from './ui/screens.js';
import { installHooks, HOOK } from './ui/hooks.js';
import { unlockAudio } from './audio.js';
import { ensurePack, artBusy, disableArt } from './art.js';

const params = new URLSearchParams(location.search);
async function boot() {
  window.__game = undefined;
  loadSave();
  applySettings();
  HOOK.artReady = () => !artBusy();
  if (params.get('art') === '0') disableArt();
  try {
    await initStage(document.getElementById('stage'));
  } catch (e) {
    VIEW.failed = true;
    document.getElementById('screen').innerHTML = '<div class="card" style="margin:20vh auto;max-width:420px"><h2>WebGL needed</h2><p>Spa City Sparkle draws its board with WebGL, which this browser has turned off.</p></div>';
    return;
  }
  buildVectorTextures(1);
  VIEW.onFrame = playFrame;
  bindInput(VIEW.app.canvas);
  wireUi();
  document.querySelectorAll('.booster').forEach((b) => b.addEventListener('click', () => { unlockAudio(); armBooster(b.dataset.booster); }));
  window.addEventListener('keydown', (e) => {
    unlockAudio();
    if (document.getElementById('tip') && (e.key === 'Enter' || e.key === 'Escape')) { document.querySelector('#tip [data-act="ok"]').click(); e.preventDefault(); return; }
    if (UI.modalOpen) { if (e.key === 'Escape' && UI.scene === 'pause') { closeModal(); UI.scene = 'game'; document.body.dataset.scene = 'game'; } return; }
    if ((e.key === 'p' || e.key === 'P' || (e.key === 'Escape' && PLAY.selected < 0 && !PLAY.anim && !PLAY.armed)) && UI.scene === 'game') { showPause(); e.preventDefault(); return; }
    if (handleKey(e)) e.preventDefault();
  });
  document.addEventListener('visibilitychange', () => requestRender());
  await ensurePack('core');
  const lv = params.get('level') && levelById(params.get('level'));
  if (lv) enterLevel(lv, { seed: +(params.get('seed') || 1) });
  else if (params.get('scene') === 'map') showMap();
  else showTitle();
  installHooks(); // last: the harness starts driving the game as soon as window.__game appears
  requestRender();
}

boot();
