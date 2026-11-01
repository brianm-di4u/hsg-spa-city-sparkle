// Pixi stage: one Application, rendered on demand (the ticker never auto-runs). Layers, layout,
// world palettes and the frame loop live here; board-view.js draws the board into the layers.
import { buildVectorSources } from './vector-art.js';

export const WORLD_LOOK = {
  1: { short: 'Bathhouse Row', name: 'Bathhouse Row', era: 'Gilded spa · 1875–1920', sky: ['#F2D9A8', '#C9785A'], cellA: '#2F6248', cellA2: '#285741', cellB: '#244E3A', cellB2: '#1F4533', frame: '#D9A23A', frameDk: '#7A4E12', grout: '#132A20', ink: '#FFF6DE' },
  2: { short: 'The Mountain', name: 'Hot Springs Mountain', era: 'Thermal water · springs and tufa', sky: ['#BFE3E0', '#3E8C8C'], cellA: '#2A6A63', cellA2: '#25605A', cellB: '#205650', cellB2: '#1C4C47', frame: '#C9A774', frameDk: '#6B4E2C', grout: '#0C2C31', ink: '#F4F2EC' },
  3: { short: 'Central Ave', name: 'Central Avenue at Night', era: 'Roaring · 1921–1946', sky: ['#2A2246', '#120F1F'], cellA: '#2C2742', cellA2: '#26213A', cellB: '#211C33', cellB2: '#1B172B', frame: '#D4AF37', frameDk: '#7C5A2E', grout: '#0A0812', ink: '#D8CFBD' },
  4: { short: 'Oaklawn', name: 'Oaklawn & the Ballfields', era: 'Midcentury · 1947–1967', sky: ['#BFE6F2', '#8FD0E8'], cellA: '#4B3B2D', cellA2: '#443528', cellB: '#3D3024', cellB2: '#372B20', frame: '#E9D2A0', frameDk: '#8A6636', grout: '#1A120C', ink: '#FFF6E0' },
  5: { short: 'The Lakes', name: 'Lake Hamilton & Lake Ouachita', era: 'Lake life · the lakes', sky: ['#F7C27A', '#2C5F8A'], cellA: '#235889', cellA2: '#1F4F7B', cellB: '#1C476F', cellB2: '#183F63', frame: '#9C7A55', frameDk: '#5A4028', grout: '#0B2238', ink: '#F6F3EC' },
  6: { short: 'Garvan Gardens', name: 'Garvan Gardens & the Revival', era: 'Modern · 2000–2026', sky: ['#E9F1D6', '#6F9C5A'], cellA: '#2F5E3E', cellA2: '#2A5538', cellB: '#264D33', cellB2: '#21442D', frame: '#D9C38E', frameDk: '#6E5A34', grout: '#10241A', ink: '#F6F3EC' },
};

export const VIEW = {
  app: null, ready: false, failed: false, el: null,
  layers: {}, tex: {}, artSource: 'vector', paintings: {}, artNames: new Set(), vectorWorld: 0, retired: [],
  world: 1, layout: { W: 0, H: 0, cell: 48, bx: 0, by: 0, cols: 9, rows: 9, portrait: true },
  anim: null, frozenMs: null, raf: 0, ambientT: 0, lastFrame: 0,
  reduced: false, steam: true, badges: false, onFrame: null, idleFrames: 0, wantAmbient: false,
};

export async function initStage(el) {
  VIEW.el = el;
  const app = new PIXI.Application();
  await app.init({
    preference: 'webgl', backgroundAlpha: 0, antialias: true, autoStart: false, sharedTicker: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, width: el.clientWidth || 390, height: el.clientHeight || 844,
  });
  app.ticker.stop();
  el.appendChild(app.canvas);
  app.canvas.setAttribute('aria-hidden', 'true');
  app.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); VIEW.lost = true; });
  app.canvas.addEventListener('webglcontextrestored', () => { VIEW.lost = false; requestRender(); });
  VIEW.app = app;
  const L = VIEW.layers;
  for (const name of ['backdrop', 'ambientBack', 'board', 'fx', 'popups', 'callout']) {
    L[name] = new PIXI.Container(); L[name].label = name; app.stage.addChild(L[name]);
  }
  VIEW.ready = true;
  return app;
}

// Textures from canvases (vector fallback) or decoded images (painted / rendered art). A replaced texture may
// still be on screen, so it is retired and destroyed only after the next board rebuild (retireTextures).
export function setTextures(sources) {
  for (const [name, src] of Object.entries(sources)) {
    if (VIEW.tex[name]) VIEW.retired.push(VIEW.tex[name]);
    VIEW.tex[name] = PIXI.Texture.from(src);
  }
}
export function retireTextures() {
  for (const t of VIEW.retired) { try { t.destroy(true); } catch (_) { /* already gone */ } }
  VIEW.retired = [];
}
// The vector set is built once; per world only the cell tiles change colour.
export function buildVectorTextures(world = VIEW.world) {
  const src = buildVectorSources(160, WORLD_LOOK[world]);
  const keep = VIEW.vectorWorld ? ['cellA', 'cellB'] : Object.keys(src);
  const out = {};
  for (const n of keep) if (!VIEW.artNames.has(n)) out[n] = src[n];
  setTextures(out);
  VIEW.vectorWorld = world;
}

export function computeLayout(cols, rows) {
  const W = VIEW.el.clientWidth || window.innerWidth, H = VIEW.el.clientHeight || window.innerHeight;
  const portrait = W / H < 1.05;
  let cell, bx, by;
  if (portrait) {
    const hud = document.getElementById('hud');
    const top = hud && !hud.classList.contains('hidden') ? Math.max(110, hud.getBoundingClientRect().bottom + 8) : 136, bottom = 96;
    cell = Math.floor(Math.min((W - 16) / cols, (H - top - bottom - 12) / rows, 80));
    bx = Math.round((W - cell * cols) / 2);
    by = Math.round(top + (H - top - bottom - cell * rows) * 0.8);
  } else {
    const left = 300;
    cell = Math.floor(Math.min((W - left - 48) / cols, (H - 104) / rows, 86));
    bx = Math.round(left + (W - left - cell * cols) / 2);
    by = Math.round((H - cell * rows) / 2);
  }
  Object.assign(VIEW.layout, { W, H, cell, bx, by, cols, rows, portrait });
  document.body.classList.toggle('portrait', portrait);
  document.body.classList.toggle('landscape', !portrait);
  return VIEW.layout;
}

export function resizeStage() {
  if (!VIEW.app) return;
  const W = VIEW.el.clientWidth, H = VIEW.el.clientHeight;
  VIEW.app.renderer.resize(W, H);
}

// --- frame loop: runs only while something animates (or ambient steam is on) ---------------------
export const clockNow = () => (VIEW.frozenMs != null ? VIEW.frozenMs : performance.now());

export function requestRender() {
  if (VIEW.raf || !VIEW.ready) return;
  VIEW.raf = requestAnimationFrame(frame);
}
function frame(now) {
  VIEW.raf = 0;
  if (!VIEW.app || VIEW.lost) return;
  const dt = Math.min(100, now - (VIEW.lastFrame || now));
  VIEW.lastFrame = now;
  VIEW.ambientT += dt;
  const busy = VIEW.onFrame ? VIEW.onFrame(now) : false;
  VIEW.app.render();
  // Ambient steam and hint pulses keep the loop alive at a low rate without counting as "busy".
  if (busy) requestRender();
  else if (VIEW.wantAmbient && !document.hidden) { setTimeout(requestRender, 33); }
}
