// Slow motion over the still screens (title, map, results, world complete): cloud drift, rising steam, lamp flicker,
// petals, fireflies and water glints, as small CSS-animated elements laid over the existing paintings. No new art.
// Placement is a fixed function of the index (hrand), so a screen always looks the same on a rebuild. The layer is
// hidden under reduced motion (see main.css), and its steam wisps follow the "Ambient steam" setting.
import { hrand } from '../view/player.js';

// The motifs per world: [element kind, count]. cl cloud, st steam, lp lamp glow, pt petal, ff firefly, gl glint.
const MOTIF = {
  1: [['st', 7]],
  2: [['st', 5], ['cl', 2]],
  3: [['lp', 5], ['ff', 5]],
  4: [['pt', 9]],
  5: [['gl', 10]],
  6: [['pt', 6], ['ff', 4]],
};
const PETAL = { 4: '#F08DB0', 6: '#FFE3EC' }; // redbud pink on Oaklawn, pale blossom in Garvan Gardens

const r1 = (n) => Math.round(n * 10) / 10;
function bits(kind, n, seed, area) {
  let out = '';
  for (let j = 0; j < n; j++) {
    const k = seed * 100 + j, a = (m) => hrand(k, m);
    const [x0, x1, y0, y1] = area;
    const x = x0 + a(1) * (x1 - x0), y = y0 + a(2) * (y1 - y0);
    const d = { cl: 90 + a(3) * 60, st: 9 + a(3) * 7, lp: 2.6 + a(3) * 3, pt: 11 + a(3) * 7, ff: 6 + a(3) * 6, gl: 2.6 + a(3) * 2.4 }[kind];
    const sz = { cl: 150 + a(4) * 120, st: 70 + a(4) * 70, lp: 54 + a(4) * 26, pt: 11 + a(4) * 6, ff: 7 + a(4) * 3, gl: 12 + a(4) * 8 }[kind];
    out += `<i class="at-${kind}" style="--x:${r1(x)}%;--y:${r1(y)}%;--d:${r1(d)}s;--dl:-${r1(a(5) * d)}s;--sz:${r1(sz)}px;--sw:${r1((a(6) - 0.5) * 60)}px"></i>`;
  }
  return out;
}

// Markup for one layer. kind 'title' is the whole title screen; 'world' is a single world's motif.
export function atmosphere(kind, world = 1) {
  if (kind === 'title') {
    return `<div class="atmos atmos-title" aria-hidden="true">${bits('cl', 4, 1, [0, 100, 4, 34])}${bits('st', 8, 2, [8, 92, 78, 100])}${bits('gl', 5, 3, [10, 90, 40, 80])}</div>`;
  }
  const area = { cl: [10, 90, 4, 30], st: [15, 85, 70, 98], lp: [8, 92, 18, 82], pt: [4, 96, 0, 100], ff: [6, 94, 20, 90], gl: [6, 94, 45, 96] };
  const petal = PETAL[world] ? `--petal:${PETAL[world]}` : '';
  return `<div class="atmos atmos-w${world}" style="${petal}" aria-hidden="true">${MOTIF[world].map(([k, n], i) => bits(k, n, world * 10 + i, area[k])).join('')}</div>`;
}
