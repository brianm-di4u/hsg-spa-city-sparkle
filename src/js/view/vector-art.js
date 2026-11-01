// Procedural Canvas 2D art: the fallback (?art=0) and the source for HUD goal icons before the Blender
// sprites load. Every piece has its own silhouette so the board reads in grayscale (PRD AC35).
export const PIECES = [
  { key: 'quartz', name: 'Quartz crystal', hi: '#E3CCFF', mid: '#9B6BDB', lo: '#4E2490', line: '#2E1060' },
  { key: 'magnolia', name: 'Magnolia', hi: '#FFE1EC', mid: '#F08AB4', lo: '#B13A6E', line: '#6E1A40' },
  { key: 'horseshoe', name: 'Horseshoe', hi: '#FFF0B8', mid: '#E8B443', lo: '#93600F', line: '#5A3A06' },
  { key: 'drop', name: 'Thermal drop', hi: '#D8FBFF', mid: '#4FD0E6', lo: '#11809E', line: '#06485C' },
  { key: 'scallop', name: 'Scallop shell', hi: '#FFE0D2', mid: '#FF8A68', lo: '#C2402E', line: '#6E1D12' },
  { key: 'pine', name: 'Pine sprig', hi: '#D6F7C8', mid: '#5DBE5E', lo: '#1F6E34', line: '#0E3D1B' },
];

const TAU = Math.PI * 2;

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function shapePath(g, k, S) {
  const p = (x, y) => [x * S, y * S];
  g.beginPath();
  switch (k) {
    case 0: { // quartz point: hexagonal prism with a pyramid tip
      const pts = [[0.5, 0.05], [0.77, 0.27], [0.75, 0.74], [0.5, 0.95], [0.25, 0.74], [0.23, 0.27]];
      pts.forEach(([x, y], i) => (i ? g.lineTo(...p(x, y)) : g.moveTo(...p(x, y))));
      g.closePath(); break;
    }
    case 1: { // magnolia: six rounded petals
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU - Math.PI / 2, cx = 0.5 + Math.cos(a) * 0.2, cy = 0.52 + Math.sin(a) * 0.2;
        g.moveTo(cx * S + 0.19 * S, cy * S);
        g.ellipse(cx * S, cy * S, 0.19 * S, 0.19 * S, a, 0, TAU);
      }
      break;
    }
    case 2: { // horseshoe: thick U, open at the bottom
      g.moveTo(...p(0.2, 0.86));
      g.lineTo(...p(0.16, 0.5));
      g.bezierCurveTo(...p(0.14, 0.12), ...p(0.86, 0.12), ...p(0.84, 0.5));
      g.lineTo(...p(0.8, 0.86)); g.lineTo(...p(0.6, 0.86)); g.lineTo(...p(0.63, 0.5));
      g.bezierCurveTo(...p(0.66, 0.31), ...p(0.34, 0.31), ...p(0.37, 0.5));
      g.lineTo(...p(0.4, 0.86)); g.closePath(); break;
    }
    case 3: { // thermal drop: teardrop
      g.moveTo(...p(0.5, 0.06));
      g.bezierCurveTo(...p(0.62, 0.28), ...p(0.82, 0.46), ...p(0.82, 0.64));
      g.bezierCurveTo(...p(0.82, 0.84), ...p(0.66, 0.94), ...p(0.5, 0.94));
      g.bezierCurveTo(...p(0.34, 0.94), ...p(0.18, 0.84), ...p(0.18, 0.64));
      g.bezierCurveTo(...p(0.18, 0.46), ...p(0.38, 0.28), ...p(0.5, 0.06));
      g.closePath(); break;
    }
    case 4: { // scallop: ribbed fan with a hinge
      g.moveTo(...p(0.5, 0.88));
      for (let i = 0; i <= 7; i++) {
        const a = Math.PI + (i / 7) * Math.PI, r = 0.4;
        const x = 0.5 + Math.cos(a) * r, y = 0.6 + Math.sin(a) * r * 1.12;
        const am = Math.PI + ((i - 0.5) / 7) * Math.PI, r2 = 0.44;
        if (i > 0) g.quadraticCurveTo((0.5 + Math.cos(am) * r2) * S, (0.6 + Math.sin(am) * r2 * 1.12) * S, x * S, y * S);
        else g.lineTo(x * S, y * S);
      }
      g.closePath(); break;
    }
    case 5: { // pine sprig: three stacked tiers and a stem
      g.moveTo(...p(0.5, 0.05));
      g.lineTo(...p(0.68, 0.32)); g.lineTo(...p(0.6, 0.32));
      g.lineTo(...p(0.8, 0.58)); g.lineTo(...p(0.66, 0.58));
      g.lineTo(...p(0.86, 0.84)); g.lineTo(...p(0.56, 0.84)); g.lineTo(...p(0.56, 0.95));
      g.lineTo(...p(0.44, 0.95)); g.lineTo(...p(0.44, 0.84)); g.lineTo(...p(0.14, 0.84));
      g.lineTo(...p(0.34, 0.58)); g.lineTo(...p(0.2, 0.58)); g.lineTo(...p(0.4, 0.32)); g.lineTo(...p(0.32, 0.32));
      g.closePath(); break;
    }
    default: break;
  }
}

function details(g, k, S, P) {
  g.save();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = S * 0.018; g.lineCap = 'round';
  if (k === 0) { // facets
    g.beginPath(); g.moveTo(0.5 * S, 0.05 * S); g.lineTo(0.5 * S, 0.95 * S);
    g.moveTo(0.23 * S, 0.27 * S); g.lineTo(0.5 * S, 0.4 * S); g.lineTo(0.77 * S, 0.27 * S); g.stroke();
  } else if (k === 1) { // petal centre
    const r = g.createRadialGradient(0.5 * S, 0.52 * S, 0, 0.5 * S, 0.52 * S, 0.12 * S);
    r.addColorStop(0, '#FFF5B8'); r.addColorStop(1, '#E4A93A');
    g.fillStyle = r; g.beginPath(); g.arc(0.5 * S, 0.52 * S, 0.11 * S, 0, TAU); g.fill();
  } else if (k === 2) { // nail holes
    g.fillStyle = P.line;
    for (const [x, y] of [[0.24, 0.62], [0.22, 0.44], [0.3, 0.29], [0.76, 0.62], [0.78, 0.44], [0.7, 0.29]]) { g.beginPath(); g.arc(x * S, y * S, 0.025 * S, 0, TAU); g.fill(); }
  } else if (k === 3) { // inner glint
    g.beginPath(); g.ellipse(0.4 * S, 0.62 * S, 0.06 * S, 0.12 * S, -0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill();
  } else if (k === 4) { // ribs
    g.strokeStyle = 'rgba(110, 29, 18, .45)';
    for (let i = 1; i < 7; i++) { const a = Math.PI + (i / 7) * Math.PI; g.beginPath(); g.moveTo(0.5 * S, 0.84 * S); g.lineTo((0.5 + Math.cos(a) * 0.36) * S, (0.6 + Math.sin(a) * 0.4) * S); g.stroke(); }
    g.fillStyle = P.lo; g.fillRect(0.4 * S, 0.8 * S, 0.2 * S, 0.1 * S);
  } else if (k === 5) { // needle highlights
    g.beginPath(); for (const y of [0.3, 0.56, 0.82]) { g.moveTo(0.5 * S, (y - 0.18) * S); g.lineTo(0.5 * S, y * S); } g.stroke();
  }
  g.restore();
}

// A glossy piece of kind k (0-5) at canvas size S.
export function drawPiece(g, k, S, opts = {}) {
  const P = PIECES[k];
  g.save();
  if (opts.shadow !== false) {
    g.save(); g.translate(S * 0.02, S * 0.05); shapePath(g, k, S); g.fillStyle = 'rgba(0,0,0,.3)'; g.filter = `blur(${S * 0.025}px)`; g.fill(); g.restore();
  }
  shapePath(g, k, S);
  const gr = g.createRadialGradient(S * 0.36, S * 0.3, S * 0.05, S * 0.5, S * 0.55, S * 0.6);
  gr.addColorStop(0, P.hi); gr.addColorStop(0.45, P.mid); gr.addColorStop(1, P.lo);
  g.fillStyle = gr; g.fill();
  g.lineWidth = S * 0.03; g.strokeStyle = P.line; g.lineJoin = 'round'; g.stroke();
  details(g, k, S, P);
  // specular highlight
  g.save(); shapePath(g, k, S); g.clip();
  const sp = g.createRadialGradient(S * 0.34, S * 0.24, 0, S * 0.34, S * 0.24, S * 0.32);
  sp.addColorStop(0, 'rgba(255,255,255,.85)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = sp; g.fillRect(0, 0, S, S);
  g.restore();
  g.restore();
}

function drawCascade(g, S, dir) {
  g.save();
  g.translate(S / 2, S / 2); if (dir === 'v') g.rotate(Math.PI / 2);
  const lg = g.createLinearGradient(-S / 2, 0, S / 2, 0);
  lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,.95)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = lg;
  for (const y of [-0.12, 0.12]) g.fillRect(-S * 0.46, y * S - S * 0.03, S * 0.92, S * 0.06);
  g.fillStyle = '#FFFFFF'; g.strokeStyle = 'rgba(20,60,90,.6)'; g.lineWidth = S * 0.015;
  for (const sgn of [-1, 1]) {
    g.beginPath(); g.moveTo(sgn * S * 0.47, 0); g.lineTo(sgn * S * 0.36, -S * 0.09); g.lineTo(sgn * S * 0.36, S * 0.09); g.closePath(); g.fill(); g.stroke();
  }
  g.restore();
}

function drawStoneRing(g, S, primed) {
  g.save();
  const r = g.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.5);
  r.addColorStop(0, 'rgba(255,140,40,0)'); r.addColorStop(0.55, primed ? 'rgba(255,170,60,.95)' : 'rgba(255,110,30,.8)'); r.addColorStop(1, 'rgba(60,20,10,0)');
  g.fillStyle = r; g.beginPath(); g.arc(S / 2, S / 2, S * 0.5, 0, TAU); g.fill();
  g.lineWidth = S * 0.07; g.strokeStyle = '#3B2E2A';
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.43, 0, TAU); g.stroke();
  g.strokeStyle = '#FF9B3D'; g.lineWidth = S * 0.018;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.3; g.beginPath(); g.arc(S / 2, S / 2, S * 0.43, a, a + 0.25); g.stroke(); }
  g.restore();
}

function drawCrystal(g, S) {
  const shard = (cx, cy, w, h, rot, hue) => {
    g.save(); g.translate(cx * S, cy * S); g.rotate(rot);
    g.beginPath(); g.moveTo(0, -h * S); g.lineTo(w * S, -h * 0.55 * S); g.lineTo(w * S, h * 0.6 * S); g.lineTo(0, h * 0.8 * S); g.lineTo(-w * S, h * 0.6 * S); g.lineTo(-w * S, -h * 0.55 * S); g.closePath();
    const lg = g.createLinearGradient(-w * S, -h * S, w * S, h * S);
    lg.addColorStop(0, `hsl(${hue},100%,92%)`); lg.addColorStop(0.5, `hsl(${(hue + 60) % 360},90%,74%)`); lg.addColorStop(1, `hsl(${(hue + 140) % 360},80%,62%)`);
    g.fillStyle = lg; g.fill(); g.strokeStyle = 'rgba(40,40,90,.7)'; g.lineWidth = S * 0.018; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(0, -h * S); g.lineTo(0, h * 0.8 * S); g.stroke();
    g.restore();
  };
  g.save();
  const glow = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5);
  glow.addColorStop(0, 'rgba(255,255,255,.9)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, S, S);
  shard(0.32, 0.6, 0.1, 0.26, -0.5, 300); shard(0.68, 0.6, 0.1, 0.26, 0.5, 180); shard(0.5, 0.5, 0.13, 0.38, 0, 40);
  g.restore();
}

function drawToken(g, S) {
  g.save();
  const r = g.createRadialGradient(S * 0.38, S * 0.32, S * 0.05, S / 2, S / 2, S * 0.45);
  r.addColorStop(0, '#FFF2C0'); r.addColorStop(0.5, '#D9A23A'); r.addColorStop(1, '#7A4E12');
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(S * 0.52, S * 0.55, S * 0.4, 0, TAU); g.fill();
  g.fillStyle = r; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, TAU); g.fill();
  g.lineWidth = S * 0.03; g.strokeStyle = '#5A3A06'; g.stroke();
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.31, 0, TAU); g.strokeStyle = 'rgba(90,58,6,.6)'; g.lineWidth = S * 0.02; g.stroke();
  // abstract bathhouse: arched door and dome, no lettering
  g.fillStyle = 'rgba(90,58,6,.75)';
  g.fillRect(S * 0.33, S * 0.47, S * 0.34, S * 0.2);
  g.beginPath(); g.arc(S / 2, S * 0.47, S * 0.1, Math.PI, 0); g.fill();
  g.fillStyle = '#F7D98A'; g.beginPath(); g.moveTo(S * 0.44, S * 0.67); g.lineTo(S * 0.44, S * 0.58); g.arc(S / 2, S * 0.58, S * 0.06, Math.PI, 0); g.lineTo(S * 0.56, S * 0.67); g.fill();
  g.restore();
}

function drawStone(g, S, layers) {
  g.save();
  const shades = [null, ['#CFC8B7', '#9A968C', '#6E6A60'], ['#B9B2A1', '#858174', '#5A574F'], ['#A39C8B', '#6F6B60', '#45423C']][layers];
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(S / 2, S * 0.56, S * 0.44, S * 0.4, 0, 0, TAU); g.fill();
  const r = g.createRadialGradient(S * 0.36, S * 0.3, S * 0.05, S / 2, S / 2, S * 0.55);
  r.addColorStop(0, shades[0]); r.addColorStop(0.55, shades[1]); r.addColorStop(1, shades[2]);
  g.beginPath();
  const pts = 11;
  for (let i = 0; i <= pts; i++) { const a = (i / pts) * TAU, rr = S * (0.42 + 0.03 * Math.sin(i * 2.7)); const x = S / 2 + Math.cos(a) * rr, y = S / 2 + Math.sin(a) * rr * 0.92; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath(); g.fillStyle = r; g.fill(); g.lineWidth = S * 0.025; g.strokeStyle = '#3A3A36'; g.stroke();
  g.fillStyle = 'rgba(40,38,34,.4)';
  for (let i = 0; i < 9; i++) { const a = i * 2.39, rr = S * 0.28 * Math.sqrt((i + 1) / 9); g.beginPath(); g.arc(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr, S * 0.025, 0, TAU); g.fill(); }
  // layer pips
  g.fillStyle = '#FFF6DE'; g.strokeStyle = '#3A3A36'; g.lineWidth = S * 0.015;
  for (let i = 0; i < layers; i++) { g.beginPath(); g.arc(S * (0.5 + (i - (layers - 1) / 2) * 0.16), S * 0.8, S * 0.05, 0, TAU); g.fill(); g.stroke(); }
  g.restore();
}

function drawLock(g, S, layers) {
  g.save();
  g.strokeStyle = '#2F3036'; g.lineWidth = S * 0.09;
  g.beginPath(); g.moveTo(S * 0.06, S * 0.3); g.lineTo(S * 0.94, S * 0.3); g.stroke();
  if (layers > 1) { g.beginPath(); g.moveTo(S * 0.06, S * 0.7); g.lineTo(S * 0.94, S * 0.7); g.stroke(); }
  g.strokeStyle = '#8A8D96'; g.lineWidth = S * 0.025;
  g.beginPath(); g.moveTo(S * 0.06, S * 0.28); g.lineTo(S * 0.94, S * 0.28); g.stroke();
  g.fillStyle = '#2F3036'; g.lineWidth = S * 0.05; g.strokeStyle = '#2F3036';
  g.beginPath(); g.arc(S / 2, S * 0.5, S * 0.1, Math.PI, 0); g.stroke();
  const lg = g.createLinearGradient(0, S * 0.5, 0, S * 0.76);
  lg.addColorStop(0, '#E6B54A'); lg.addColorStop(1, '#8A5F17');
  g.fillStyle = lg; g.fillRect(S * 0.36, S * 0.5, S * 0.28, S * 0.24); g.strokeStyle = '#4A320A'; g.lineWidth = S * 0.02; g.strokeRect(S * 0.36, S * 0.5, S * 0.28, S * 0.24);
  g.fillStyle = '#2B1B05'; g.beginPath(); g.arc(S / 2, S * 0.6, S * 0.03, 0, TAU); g.fill(); g.fillRect(S * 0.49, S * 0.6, S * 0.02, S * 0.07);
  g.restore();
}

function drawMoss(g, S) {
  g.save();
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39, rr = S * 0.3 * Math.sqrt((i + 0.5) / 14), x = S / 2 + Math.cos(a) * rr, y = S / 2 + Math.sin(a) * rr;
    const r = g.createRadialGradient(x - S * 0.03, y - S * 0.03, 0, x, y, S * 0.17);
    r.addColorStop(0, '#9EE07A'); r.addColorStop(0.6, '#2F8F5B'); r.addColorStop(1, 'rgba(20,80,40,0)');
    g.fillStyle = r; g.beginPath(); g.arc(x, y, S * 0.17, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(S * (0.3 + 0.08 * i), S * (0.35 + 0.05 * ((i * 7) % 5)), S * 0.018, 0, TAU); g.fill(); }
  g.restore();
}

function drawFog(g, S) {
  // soft translucent grey vapour: overlapping low-alpha puffs, densest in the middle, no bright core
  g.save();
  for (const [x, y, r, a] of [[0.32, 0.6, 0.32, 0.7], [0.62, 0.48, 0.36, 0.72], [0.48, 0.34, 0.28, 0.62], [0.5, 0.66, 0.32, 0.66], [0.72, 0.68, 0.24, 0.55], [0.5, 0.5, 0.3, 0.6]]) {
    const gr = g.createRadialGradient(x * S, y * S, 0, x * S, y * S, r * S);
    gr.addColorStop(0, `rgba(214,222,230,${a})`); gr.addColorStop(0.7, `rgba(200,210,220,${a * 0.6})`); gr.addColorStop(1, 'rgba(200,210,220,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x * S, y * S, r * S, 0, TAU); g.fill();
  }
  g.strokeStyle = 'rgba(240,244,248,.35)'; g.lineWidth = S * 0.025; g.lineCap = 'round';
  for (const [y, w] of [[0.3, 0.5], [0.5, 0.62], [0.7, 0.46]]) { g.beginPath(); g.moveTo(S * (0.5 - w / 2), S * y); g.bezierCurveTo(S * 0.4, S * (y - 0.06), S * 0.6, S * (y + 0.06), S * (0.5 + w / 2), S * y); g.stroke(); }
  g.restore();
}

function drawCell(g, S, dark, palette) {
  const [a, b] = dark ? [palette.cellB, palette.cellB2] : [palette.cellA, palette.cellA2];
  g.save();
  const lg = g.createLinearGradient(0, 0, S, S);
  lg.addColorStop(0, a); lg.addColorStop(1, b);
  g.fillStyle = lg; g.fillRect(0, 0, S, S);
  const sheen = g.createLinearGradient(0, 0, 0, S);
  sheen.addColorStop(0, 'rgba(255,255,255,.07)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(0,0,0,.08)');
  g.fillStyle = sheen; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = S * 0.03; g.strokeRect(S * 0.015, S * 0.015, S * 0.97, S * 0.97);
  g.restore();
}

// Mineral crust: a crystalline mint-white rim around the cell (thicker for 2 layers) that leaves the piece visible.
function drawCrust(g, S, layers) {
  g.save();
  const w = S * (layers > 1 ? 0.2 : 0.13);
  const rim = new Path2D();
  rim.rect(0, 0, S, S); rim.roundRect(w, w, S - 2 * w, S - 2 * w, S * 0.12);
  const lg = g.createLinearGradient(0, 0, S, S);
  lg.addColorStop(0, '#FBF6EA'); lg.addColorStop(0.5, '#E2D6BC'); lg.addColorStop(1, '#B6A584');
  g.fillStyle = lg; g.fill(rim, 'evenodd');
  g.strokeStyle = 'rgba(110,90,60,.6)'; g.lineWidth = S * 0.015;
  g.beginPath(); g.roundRect(w, w, S - 2 * w, S - 2 * w, S * 0.12); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.95)';
  for (let i = 0; i < 18; i++) {
    const side = i % 4, f = ((i * 37) % 100) / 100, o = w * (0.3 + 0.4 * ((i * 13) % 10) / 10);
    const [x, y] = side === 0 ? [f * S, o] : side === 1 ? [S - o, f * S] : side === 2 ? [f * S, S - o] : [o, f * S];
    g.beginPath(); g.moveTo(x, y - S * 0.025); g.lineTo(x + S * 0.015, y); g.lineTo(x, y + S * 0.025); g.lineTo(x - S * 0.015, y); g.closePath(); g.fill();
  }
  g.restore();
}

function drawDrain(g, S) {
  g.save();
  g.fillStyle = 'rgba(30,20,10,.55)'; g.beginPath(); g.ellipse(S / 2, S * 0.85, S * 0.36, S * 0.1, 0, 0, TAU); g.fill();
  g.strokeStyle = '#D9A23A'; g.lineWidth = S * 0.035;
  g.beginPath(); g.ellipse(S / 2, S * 0.85, S * 0.36, S * 0.1, 0, 0, TAU); g.stroke();
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(S / 2 + i * S * 0.12, S * 0.77); g.lineTo(S / 2 + i * S * 0.12, S * 0.93); g.stroke(); }
  g.fillStyle = '#FFF6DE'; g.beginPath(); g.moveTo(S * 0.42, S * 0.55); g.lineTo(S * 0.58, S * 0.55); g.lineTo(S * 0.5, S * 0.68); g.closePath(); g.fill();
  g.restore();
}

function drawCursor(g, S) {
  g.save(); g.strokeStyle = '#FFFFFF'; g.lineWidth = S * 0.06; g.shadowColor = '#4FC3FF'; g.shadowBlur = S * 0.08;
  const r = S * 0.16, m = S * 0.05;
  g.beginPath(); g.roundRect(m, m, S - 2 * m, S - 2 * m, r); g.stroke(); g.restore();
}

function glint(g, S) {
  const r = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,250,220,.8)'); r.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
  g.fillStyle = 'rgba(255,255,255,.9)';
  g.beginPath(); g.moveTo(S / 2, 0); g.lineTo(S * 0.54, S * 0.46); g.lineTo(S, S / 2); g.lineTo(S * 0.54, S * 0.54); g.lineTo(S / 2, S); g.lineTo(S * 0.46, S * 0.54); g.lineTo(0, S / 2); g.lineTo(S * 0.46, S * 0.46); g.closePath(); g.fill();
}
function puff(g, S) {
  const r = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(0.5, 'rgba(255,255,255,.4)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
}
function beam(g, S) {
  // a bright core with soft edges across its thickness, tapering to nothing at both ends
  const lg = g.createLinearGradient(0, 0, 0, S);
  lg.addColorStop(0, 'rgba(160,230,255,0)'); lg.addColorStop(0.3, 'rgba(170,235,255,.35)'); lg.addColorStop(0.46, 'rgba(255,255,255,1)'); lg.addColorStop(0.54, 'rgba(255,255,255,1)'); lg.addColorStop(0.7, 'rgba(170,235,255,.35)'); lg.addColorStop(1, 'rgba(160,230,255,0)');
  g.fillStyle = lg; g.fillRect(0, 0, S, S);
  g.globalCompositeOperation = 'destination-in';
  const tg = g.createLinearGradient(0, 0, S, 0);
  tg.addColorStop(0, 'rgba(0,0,0,0)'); tg.addColorStop(0.12, 'rgba(0,0,0,1)'); tg.addColorStop(0.88, 'rgba(0,0,0,1)'); tg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = tg; g.fillRect(0, 0, S, S);
  g.globalCompositeOperation = 'source-over';
}
function ring(g, S) {
  g.strokeStyle = '#FFFFFF'; g.lineWidth = S * 0.06; g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = S * 0.06;
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.42, 0, TAU); g.stroke();
}

function arrows(g, S) {
  const c = S / 2, h = S * 0.17, w = S * 0.13;
  g.lineJoin = 'round'; g.shadowColor = 'rgba(80,220,255,.9)'; g.shadowBlur = S * 0.05;
  for (const d of [-1, 1]) {
    const tip = c + d * S * 0.47, base = tip - d * w;
    g.beginPath();
    g.moveTo(tip, c); g.lineTo(base, c - h); g.lineTo(base - d * w * 0.55, c - h); g.lineTo(tip - d * w * 0.55, c);
    g.lineTo(base - d * w * 0.55, c + h); g.lineTo(base, c + h); g.closePath();
    g.fillStyle = '#FFF6DE'; g.fill();
    g.shadowBlur = 0; g.strokeStyle = '#0E5A6E'; g.lineWidth = S * 0.025; g.stroke(); g.shadowBlur = S * 0.05;
  }
}

function drawBadge(g, k, S) {
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#1F2F5C'; g.lineWidth = S * 0.08;
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.44, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#1F2F5C';
  const c = S / 2, r = S * 0.24;
  g.beginPath();
  if (k === 0) { g.moveTo(c, c - r); g.lineTo(c + r, c + r * 0.8); g.lineTo(c - r, c + r * 0.8); }
  else if (k === 1) g.arc(c, c, r * 0.9, 0, TAU);
  else if (k === 2) g.rect(c - r * 0.8, c - r * 0.8, r * 1.6, r * 1.6);
  else if (k === 3) { g.moveTo(c, c - r); g.lineTo(c + r, c); g.lineTo(c, c + r); g.lineTo(c - r, c); }
  else if (k === 4) for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, rr = i % 2 ? r * 0.45 : r * 1.05; g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); }
  else { g.rect(c - r * 0.3, c - r, r * 0.6, r * 2); g.rect(c - r, c - r * 0.3, r * 2, r * 0.6); }
  g.closePath(); g.fill();
}

// Builds every texture source as canvases: {name: HTMLCanvasElement}.
export function buildVectorSources(size = 160, palette) {
  const out = {};
  const make = (name, fn, S = size) => { const c = canvas(S); fn(c.getContext('2d'), S); out[name] = c; };
  for (let k = 0; k < 6; k++) {
    make(`p${k}`, (g, S) => drawPiece(g, k, S));
    make(`p${k}h`, (g, S) => { drawPiece(g, k, S); drawCascade(g, S, 'h'); });
    make(`p${k}v`, (g, S) => { drawPiece(g, k, S); drawCascade(g, S, 'v'); });
    make(`p${k}b`, (g, S) => { drawStoneRing(g, S, false); g.save(); g.translate(S * 0.12, S * 0.12); g.scale(0.76, 0.76); drawPiece(g, k, S); g.restore(); });
    make(`p${k}B`, (g, S) => { drawStoneRing(g, S, true); g.save(); g.translate(S * 0.12, S * 0.12); g.scale(0.76, 0.76); drawPiece(g, k, S); g.restore(); });
  }
  make('crystal', drawCrystal); make('token', drawToken);
  for (let l = 1; l <= 3; l++) make(`stone${l}`, (g, S) => drawStone(g, S, l));
  for (let l = 1; l <= 2; l++) { make(`lock${l}`, (g, S) => drawLock(g, S, l)); make(`crust${l}`, (g, S) => drawCrust(g, S, l)); }
  make('moss', drawMoss); make('fog', drawFog); make('drain', drawDrain); make('cursor', drawCursor);
  make('cellA', (g, S) => drawCell(g, S, false, palette)); make('cellB', (g, S) => drawCell(g, S, true, palette));
  // colour-blind badges: a white disc with a dark glyph per kind (triangle, circle, square, diamond, star, cross)
  for (let k = 0; k < 6; k++) make(`badge${k}`, (g, S) => drawBadge(g, k, S), 48);
  make('glint', glint, 64); make('puff', puff, 64); make('beam', beam, 64); make('ring', ring, 128); make('arrows', arrows, 128);
  return out;
}

// Small canvas icon for a goal chip (DOM), drawn once per kind.
export const ICON_IMAGES = {};
export function goalIcon(kind, size = 68) {
  const c = canvas(size), g = c.getContext('2d');
  const key = typeof kind === 'number' ? `p${kind}` : { token: 'token', stone: 'stone2', moss: 'moss', lock: 'lock1' }[kind];
  const img = key && ICON_IMAGES[key];
  if (img) { const m = size * 0.1; g.drawImage(img, -m, -m, size + 2 * m, size + 2 * m); return c; }
  if (typeof kind === 'number') drawPiece(g, kind, size, { shadow: false });
  else if (kind === 'token') drawToken(g, size);
  else if (kind === 'stone') drawStone(g, size, 2);
  else if (kind === 'crust') { g.save(); g.beginPath(); g.roundRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92, size * 0.18); g.clip(); g.fillStyle = '#3C6E5C'; g.fillRect(0, 0, size, size); g.scale(1, 1); drawCrust(g, size, 2); g.restore(); }
  else if (kind === 'moss') drawMoss(g, size);
  else if (kind === 'lock') drawLock(g, size, 1);
  else if (kind === 'score') { g.fillStyle = '#FFD54A'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? size * 0.2 : size * 0.46; g.lineTo(size / 2 + Math.cos(a) * r, size / 2 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = '#A86E00'; g.lineWidth = 3; g.stroke(); }
  return c;
}
