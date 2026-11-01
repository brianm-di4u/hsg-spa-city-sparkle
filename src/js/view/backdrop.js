// World backdrop (painted art when loaded, a procedural sky otherwise) and ambient steam wisps.
// The steam is stateless: positions are a function of the ambient clock, so it needs no update step.
import { VIEW, WORLD_LOOK } from './stage.js';
import { hrand } from './player.js';

const BD = { sprite: null, key: '', wisps: [] };

function proceduralSky(world, W, H) {
  const look = WORLD_LOOK[world] || WORLD_LOOK[1];
  const c = document.createElement('canvas');
  const sc = Math.min(1, 900 / Math.max(W, H));
  c.width = Math.max(2, Math.round(W * sc)); c.height = Math.max(2, Math.round(H * sc));
  const g = c.getContext('2d'), w = c.width, h = c.height;
  const lg = g.createLinearGradient(0, 0, 0, h);
  lg.addColorStop(0, look.sky[0]); lg.addColorStop(1, look.sky[1]);
  g.fillStyle = lg; g.fillRect(0, 0, w, h);
  // layered ridges (the Ouachitas) in the world's tones
  for (let r = 0; r < 3; r++) {
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += w / 24) g.lineTo(x, h * (0.55 + r * 0.12) - Math.sin(x / w * 6 + r * 2) * h * 0.04 - Math.sin(x / w * 13 + r) * h * 0.015);
    g.lineTo(w, h); g.closePath();
    g.fillStyle = `rgba(20, 40, 35, ${0.18 + r * 0.14})`; g.fill();
  }
  return c;
}

export function buildBackdrop(world, force = false) {
  const { W, H } = VIEW.layout;
  const key = `${world}:${W}x${H}:${VIEW.artSource}:${VIEW.layout.cols}x${VIEW.layout.rows}:${VIEW.layout.cell}`;
  const L = VIEW.layers.backdrop;
  if (BD.key === key && BD.sprite && !force) return;
  // generated textures (shade, procedural sky) are retired, then destroyed after the next board rebuild
  L.removeChildren().forEach((c) => { if (c._own) VIEW.retired.push(c.texture); c.destroy(); });
  const o = VIEW.layout.portrait ? ['p', 'l'] : ['l', 'p'];
  const painted = VIEW.tex[`bg${world}-${o[0]}`] || VIEW.tex[`bg${world}-${o[1]}`];
  let sp;
  if (painted) {
    sp = new PIXI.Sprite(painted);
    const s = Math.max(W / painted.width, H / painted.height);
    sp.scale.set(s); sp.anchor.set(0.5); sp.position.set(W / 2, H / 2);
  } else {
    sp = new PIXI.Sprite(PIXI.Texture.from(proceduralSky(world, W, H)));
    sp._own = true;
    sp.width = W; sp.height = H;
  }
  L.addChild(sp);
  BD.sprite = sp; BD.key = key;
  // a soft darkening behind the board for contrast, and the board's cast shadow on the painting.
  // Drawn with canvas gradients and shadowBlur: GPU blur filters this large left a fine grid in the sky.
  const shade = new PIXI.Sprite(PIXI.Texture.from(shadeCanvas(W, H, VIEW.layout)));
  shade.width = W; shade.height = H; shade._own = true;
  L.addChild(shade);
}

function shadeCanvas(W, H, { bx, by, cell, cols, rows }) {
  const k = 0.5, c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(W * k)); c.height = Math.max(2, Math.round(H * k));
  const g = c.getContext('2d');
  g.scale(k, k);
  const cx = bx + (cols * cell) / 2, cy = by + (rows * cell) / 2, rx = cols * cell * 0.95, ry = rows * cell * 0.9;
  g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
  const rg = g.createRadialGradient(0, 0, rx * 0.35, 0, 0, rx);
  rg.addColorStop(0, 'rgba(10,15,18,.32)'); rg.addColorStop(0.6, 'rgba(10,15,18,.16)'); rg.addColorStop(1, 'rgba(10,15,18,0)');
  g.fillStyle = rg; g.fillRect(-rx, -rx, rx * 2, rx * 2);
  g.restore();
  // the shape itself is drawn off-canvas; only its offset blurred shadow lands under the board
  const off = 10000;
  g.shadowColor = 'rgba(5,10,12,.8)'; g.shadowBlur = Math.max(12, cell * 0.5) * k * 2; g.shadowOffsetX = off * k; g.shadowOffsetY = cell * 0.24 * k;
  g.beginPath(); g.roundRect(bx - cell * 0.22 - off, by + cell * 0.05, cols * cell + cell * 0.44, rows * cell + cell * 0.3, cell * 0.4); g.fillStyle = '#000'; g.fill();
  return c;
}

export function drawAmbient() {
  const L = VIEW.layers.ambientBack;
  const on = VIEW.steam && !VIEW.reduced;
  const N = on ? 14 : 0;
  while (BD.wisps.length < N) { const s = new PIXI.Sprite(VIEW.tex.puff); s.anchor.set(0.5); L.addChild(s); BD.wisps.push(s); }
  const { W, H } = VIEW.layout, t = VIEW.ambientT / 1000;
  BD.wisps.forEach((s, j) => {
    if (j >= N) { s.visible = false; return; }
    const period = 9 + hrand(j, 1) * 7, ph = ((t / period) + hrand(j, 2)) % 1;
    s.visible = true;
    s.position.set(W * hrand(j, 3) + Math.sin(t * 0.6 + j) * 30, H * (1.05 - ph * 1.2));
    const size = (120 + hrand(j, 4) * 180) * (0.6 + ph);
    s.width = s.height = size;
    s.alpha = 0.22 * Math.sin(ph * Math.PI);
  });
  return N > 0;
}
