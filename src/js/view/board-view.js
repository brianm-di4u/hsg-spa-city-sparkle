// Draws the board: static cells and frame, blocker layers, pieces, and the current timeline beat.
// Every animated value is a pure function of (model before the beat, beat events, progress p), so a
// frozen clock gives an exact frame and particles need no simulation state.
import { VIEW, WORLD_LOOK, retireTextures } from './stage.js';
import { modelFromState, applyEvent } from './model.js';
import { schedule, frameAt, ease, hrand, TICK_MS } from './player.js';

const B = { halos: [], halosUsed: 0, built: null, cells: [], drains: [], layer: {}, tiles: new Map(), fx: [], fxUsed: 0, pops: [], popsUsed: 0, callout: null, frame: null, maskG: null, model: null, sel: -1, cursor: -1, hint: null, showCursor: false };
export const BOARD = B;

const texFor = (t) => {
  if (!t) return null;
  if (t.k === 'C') return VIEW.tex.crystal;
  if (t.k === 'T') return VIEW.tex.token;
  return VIEW.tex[`p${t.k}${t.s || ''}`] || VIEW.tex[`p${t.k}`];
};

function cellXY(i) {
  const { cell, bx, by, cols } = VIEW.layout;
  return [bx + ((i % cols) + 0.5) * cell, by + (((i / cols) | 0) + 0.5) * cell];
}

// --- static board -------------------------------------------------------------------------------
export function buildBoard(s, world) {
  const Lr = VIEW.layers.board;
  Lr.removeChildren().forEach((c) => c.destroy({ children: true }));
  B.tiles.clear(); B.cells = []; B.drains = []; B.fx = []; B.pops = []; B.halos = [];
  VIEW.layers.fx.removeChildren(); VIEW.layers.popups.removeChildren(); VIEW.layers.callout.removeChildren();
  if (B.callout) { B.callout.destroy(); B.callout = null; } // it was detached with the layer's children
  const look = WORLD_LOOK[world] || WORLD_LOOK[1];
  const { cell, bx, by } = VIEW.layout;
  const frame = new PIXI.Graphics();
  // frame: a rounded slab under every playable cell, with a lip in the world's frame colour
  for (let i = 0; i < s.mask.length; i++) {
    if (!s.mask[i]) continue;
    const x = bx + (i % s.w) * cell, y = by + ((i / s.w) | 0) * cell, m = Math.max(10, cell * 0.2);
    frame.roundRect(x - m, y - m + 3, cell + 2 * m, cell + 2 * m, cell * 0.26).fill({ color: 0x000000, alpha: 0.35 });
    frame.roundRect(x - m, y - m, cell + 2 * m, cell + 2 * m, cell * 0.26).fill({ color: look.frameDk });
  }
  for (let i = 0; i < s.mask.length; i++) {
    if (!s.mask[i]) continue;
    const x = bx + (i % s.w) * cell, y = by + ((i / s.w) | 0) * cell, m = Math.max(7, cell * 0.14);
    frame.roundRect(x - m, y - m, cell + 2 * m, cell + 2 * m, cell * 0.22).fill({ color: look.frame });
    frame.roundRect(x - m + 2, y - m + 1, cell + 2 * m - 4, cell * 0.5, cell * 0.2).fill({ color: 0xfff1c8, alpha: 0.24 });
  }
  for (let i = 0; i < s.mask.length; i++) {
    if (!s.mask[i]) continue;
    const x = bx + (i % s.w) * cell, y = by + ((i / s.w) | 0) * cell;
    frame.rect(x - 1, y - 1, cell + 2, cell + 2).fill({ color: look.grout });
  }
  Lr.addChild(frame); B.frame = frame;
  const cells = new PIXI.Container(); Lr.addChild(cells);
  for (let i = 0; i < s.mask.length; i++) {
    if (!s.mask[i]) { B.cells.push(null); continue; }
    const x = i % s.w, y = (i / s.w) | 0;
    const sp = new PIXI.Sprite((x + y) % 2 ? VIEW.tex.cellB : VIEW.tex.cellA);
    sp.width = sp.height = cell - 2; sp.position.set(bx + x * cell + 1, by + y * cell + 1);
    cells.addChild(sp); B.cells.push(sp);
    if (s.exit[i]) {
      const d = new PIXI.Sprite(VIEW.tex.drain); d.anchor.set(0.5); d.width = d.height = cell; d.position.set(...cellXY(i)); d.position.y += cell * 0.32; d.alpha = 0.95;
      B.drains.push(d);
    }
  }
  const mk = (name) => { const c = new PIXI.Container(); c.label = name; Lr.addChild(c); B.layer[name] = c; return c; };
  mk('crust'); mk('blocks'); mk('halos'); const pieces = mk('pieces'); mk('locks'); mk('fog'); mk('ui');
  for (const d of B.drains) B.layer.crust.addChild(d);
  // pieces are clipped to the board rectangle so spawned pieces slide in from the top edge
  const mask = new PIXI.Graphics().rect(bx - cell * 0.1, by - 1, s.w * cell + cell * 0.2, s.h * cell + cell * 0.6).fill({ color: 0xffffff });
  Lr.addChild(mask); pieces.mask = mask; B.maskG = mask;
  for (const name of ['crust', 'blocks', 'locks', 'fog']) B[name] = new Array(s.mask.length).fill(null);
  const cur = new PIXI.Sprite(VIEW.tex.cursor); cur.anchor.set(0.5); cur.width = cur.height = cell * 1.06; cur.visible = false; B.layer.ui.addChild(cur); B.cursorSprite = cur;
  B.built = { w: s.w, h: s.h, cell };
  B.model = modelFromState(s);
  retireTextures(); // the old board's sprites are gone, so replaced textures can go too
}

function layerSprite(name, i, tex, parent) {
  let sp = B[name][i];
  if (!sp) { sp = new PIXI.Sprite(tex); sp.anchor.set(0.5); parent.addChild(sp); B[name][i] = sp; }
  sp.texture = tex; sp.visible = true; sp.alpha = 1; sp.tint = 0xffffff; sp.rotation = 0;
  const c = VIEW.layout.cell;
  sp.width = sp.height = name === 'crust' ? c - 2 : name === 'fog' ? c * 1.15 : c * 0.98;
  sp.position.set(...cellXY(i));
  return sp;
}
function hideLayer(name, i) { if (B[name][i]) B[name][i].visible = false; }

function tileSprite(id, t) {
  let sp = B.tiles.get(id);
  if (!sp) { sp = new PIXI.Sprite(texFor(t)); sp.anchor.set(0.5); B.layer.pieces.addChild(sp); B.tiles.set(id, sp); }
  const tx = texFor(t);
  if (tx && sp.texture !== tx) sp.texture = tx;
  sp.visible = true; sp.alpha = 1; sp.rotation = 0; sp.tint = 0xffffff;
  sp.width = sp.height = VIEW.layout.cell * 1.1; // the renders carry a soft shadow margin
  sp._used = true;
  // colour-blind badge (Settings): a glyph in the corner of every colour piece
  const wantBadge = VIEW.badges && typeof t.k === 'number';
  if (wantBadge && !sp._badge) { const b = new PIXI.Sprite(VIEW.tex[`badge${t.k}`]); b.anchor.set(0.5); b.position.set(sp.texture.width * 0.3, sp.texture.height * 0.3); b.width = b.height = sp.texture.width * 0.36; sp.addChild(b); sp._badge = b; }
  if (sp._badge) { sp._badge.visible = wantBadge; if (wantBadge) sp._badge.texture = VIEW.tex[`badge${t.k}`]; }
  // Cascades carry chevrons along their sweep, breathing outward slightly at rest
  const casc = t.s === 'h' || t.s === 'v';
  if (casc && !sp._arrows && VIEW.tex.arrows) { const a = new PIXI.Sprite(VIEW.tex.arrows); a.anchor.set(0.5); sp.addChild(a); sp._arrows = a; }
  if (sp._arrows) {
    sp._arrows.visible = casc;
    if (casc) {
      const w = sp.texture.width, breathe = VIEW.reduced ? 0 : 0.035 * Math.sin(VIEW.ambientT / 220);
      sp._arrows.rotation = t.s === 'v' ? Math.PI / 2 : 0; sp._arrows.width = w * (0.98 + breathe); sp._arrows.height = w * 0.98;
      if (t.s === 'v') { sp._arrows.width = w * 0.98; sp._arrows.height = w * (0.98 + breathe); }
    }
  }
  return sp;
}

// --- FX pools (stateless: each frame re-poses the particles it needs) ---------------------------
function fxSprite(tex, blend = 'add') {
  let sp = B.fx[B.fxUsed];
  if (!sp) { sp = new PIXI.Sprite(tex); sp.anchor.set(0.5); VIEW.layers.fx.addChild(sp); B.fx.push(sp); }
  B.fxUsed++;
  sp.texture = tex; sp.blendMode = blend; sp.visible = true; sp.alpha = 1; sp.rotation = 0; sp.scale.set(1); sp.tint = 0xffffff;
  return sp;
}
function popText(text, size, color) {
  let t = B.pops[B.popsUsed];
  if (!t) {
    t = new PIXI.Text({ text, style: { fontFamily: 'Righteous, Trebuchet MS, sans-serif', fontSize: size, fill: color, stroke: { color: '#3A2208', width: Math.max(3, size / 7) }, dropShadow: { color: '#000000', alpha: 0.45, blur: 3, distance: 3, angle: Math.PI / 2 } } });
    t.anchor.set(0.5); VIEW.layers.popups.addChild(t); B.pops.push(t);
  }
  B.popsUsed++;
  if (t.text !== text) t.text = text;
  if (t.style.fontSize !== size) t.style.fontSize = size;
  if (t.style.fill !== color) t.style.fill = color;
  t.visible = true; t.alpha = 1; t.scale.set(1); t.rotation = 0;
  return t;
}

// --- per-frame drawing --------------------------------------------------------------------------
// Draws the model, plus the beat at index i with progress p when a timeline plays.
export function drawFrame(model, beat, p, opts = {}) {
  const { cell } = VIEW.layout;
  B.fxUsed = 0; B.popsUsed = 0; B.halosUsed = 0;
  for (const sp of B.tiles.values()) sp._used = false;
  const ev = beat ? beat.events : [];
  const hitTiles = new Set(), hitLayer = new Map();
  for (const e of ev) if (e.t === 'hit') { if (e.layer === 'tile') hitTiles.add(e.id); else hitLayer.set(e.i, e); }

  // blocker layers
  for (let i = 0; i < model.at.length; i++) {
    if (!model.mask[i]) continue;
    const h = hitLayer.get(i);
    const fade = h ? 1 - ease.outCubic(Math.min(1, p * 1.6)) : 1;
    if (model.crust[i]) { const sp = layerSprite('crust', i, VIEW.tex[`crust${model.crust[i]}`], B.layer.crust); sp.alpha = 1; } else hideLayer('crust', i);
    if (model.stone[i]) {
      const sp = layerSprite('blocks', i, VIEW.tex[`stone${model.stone[i]}`], B.layer.blocks);
      sp.tint = VIEW.artSource === 'art' ? [0xffffff, 0xe2e6e8, 0xc2c8cc, 0x9ca3a9][model.stone[i]] : 0xffffff;
      if (h && h.layer === 'stone') { sp.rotation = Math.sin(p * 40) * 0.08 * (1 - p); if (p > 0.5 && h.left > 0) sp.texture = VIEW.tex[`stone${h.left}`]; else if (h.left === 0) sp.alpha = fade; }
    } else if (model.moss[i]) {
      const sp = layerSprite('blocks', i, VIEW.tex.moss, B.layer.blocks);
      if (h && h.layer === 'moss') { sp.alpha = fade; sp.scale.set(sp.scale.x * (1 + 0.3 * p)); }
    } else hideLayer('blocks', i);
    if (model.lock[i]) {
      const sp = layerSprite('locks', i, VIEW.tex[`lock${model.lock[i]}`], B.layer.locks);
      if (h && h.layer === 'lock') { sp.rotation = Math.sin(p * 30) * 0.12 * (1 - p); if (h.left === 0) { sp.alpha = fade; sp.position.y += p * cell * 0.4; } else if (p > 0.5) sp.texture = VIEW.tex[`lock${h.left}`]; }
    } else hideLayer('locks', i);
    if (model.fog[i]) {
      const sp = layerSprite('fog', i, VIEW.tex.fog, B.layer.fog);
      if (h && h.layer === 'fog') { sp.alpha = fade; sp.scale.set(sp.scale.x * (1 + 0.6 * p)); sp.position.y -= p * cell * 0.3; }
    } else hideLayer('fog', i);
    if (h && h.crust !== undefined && p > 0.5) { if (h.crust > 0) layerSprite('crust', i, VIEW.tex[`crust${h.crust}`], B.layer.crust); else if (B.crust[i]) B.crust[i].alpha = 1 - (p - 0.5) * 2; }
  }

  // pieces at rest (or moving within this beat)
  const swapEv = ev.find((e) => e.t === 'swap' || e.t === 'swapBack');
  const fallEv = ev.find((e) => e.t === 'fall');
  const reshEv = ev.find((e) => e.t === 'reshuffle');
  const movers = new Map();
  if (fallEv) for (const mv of fallEv.moves) movers.set(mv.id, mv);
  const resh = new Map();
  if (reshEv) for (const [id, cell2] of reshEv.moves) resh.set(id, cell2);
  const encoreEv = ev.filter((e) => e.t === 'encore');
  const converts = new Map();
  for (const e of ev) if (e.t === 'convert') for (const c of e.tiles) converts.set(c.id, c.s);
  const spreadEv = ev.find((e) => e.t === 'spread');

  for (let i = 0; i < model.at.length; i++) {
    const id = model.at[i];
    if (id == null) continue;
    const t = model.tiles[id];
    if (!t) continue;
    const sp = tileSprite(id, t);
    let [x, y] = cellXY(i);
    let sc = 1;
    if (swapEv && (i === swapEv.a || i === swapEv.b)) {
      const other = i === swapEv.a ? swapEv.b : swapEv.a;
      const [ox, oy] = cellXY(other), q = swapEv.t === 'swap' ? ease.outBackStrong(p) : ease.inOutSine(p);
      x += (ox - x) * q; y += (oy - y) * q; sc = 1 + 0.12 * Math.sin(Math.PI * p);
      if (i === swapEv.a) sp.zIndex = 2;
    }
    for (const e of ev) if (e.t === 'fire' && e.id === id && !VIEW.reduced) sc *= 1 + 0.28 * Math.sin(Math.PI * Math.min(1, p * 3));
    if (hitTiles.has(id)) {
      // pop: swell and flash, then shrink away
      const q = Math.min(1, p * 1.25);
      sc = q < 0.35 ? 1 + 0.25 * (q / 0.35) : 1.25 * (1 - ease.inQuad((q - 0.35) / 0.65));
      sp.alpha = q < 0.6 ? 1 : 1 - (q - 0.6) / 0.4;
      sp.tint = q < 0.3 ? 0xffffff : 0xfff4d0;
    }
    if (converts.has(id) && p > 0.35) sp.texture = texFor({ k: t.k, s: converts.get(id) });
    for (const e of encoreEv) if (e.id === id) { sc = 1 + 0.3 * Math.sin(Math.PI * Math.min(1, p * 1.5)); if (p > 0.45) sp.texture = texFor({ k: t.k, s: e.s }); }
    if (spreadEv && spreadEv.to === i) { sc *= 1 - p; sp.alpha = 1 - p; }
    if (movers.has(id)) [x, y] = fallPos(movers.get(id), p, beat.dur);
    if (resh.has(id)) {
      const [tx, ty] = cellXY(resh.get(id)), q = ease.inOutSine(p);
      x += (tx - x) * q; y += (ty - y) * q - Math.sin(Math.PI * q) * cell * 0.6; sc = 1 - 0.25 * Math.sin(Math.PI * q);
    }
    if (!beat && B.sel === i) sc = 1.12 + 0.04 * Math.sin(VIEW.ambientT / 120);
    if (!beat && B.hint && (B.hint[0] === i || B.hint[1] === i)) {
      const w = Math.sin(VIEW.ambientT / 180);
      sc = 1 + 0.07 * Math.max(0, w);
      const [hx, hy] = cellXY(B.hint[0] === i ? B.hint[1] : B.hint[0]);
      x += (hx - x) * 0.08 * Math.max(0, w); y += (hy - y) * 0.08 * Math.max(0, w);
    }
    let sx = sc, sy = sc;
    if (movers.has(id) && !VIEW.reduced) { const sq = landing(movers.get(id), p, beat.dur); sx *= 1 + 0.22 * sq; sy *= 1 - 0.28 * sq; y += VIEW.layout.cell * 0.14 * sq; }
    sp.position.set(x, y);
    sp.scale.set(sp.scale.x * sx, sp.scale.y * sy);
    if (t.s || t.k === 'C') halo(x, y, t, sp.alpha);
  }
  // spawned pieces enter from above the board during a fall beat
  if (fallEv) for (const mv of fallEv.moves) {
    if (!mv.spawn) continue;
    const sp = tileSprite(mv.id, { k: mv.k, s: mv.s });
    const [x, y] = fallPos(mv, p, beat.dur);
    sp.position.set(x, y);
    if (mv.gone) sp.alpha = 1 - Math.max(0, p - 0.8) * 5;
  }
  // new specials appear with a springy pop
  for (const e of ev) if (e.t === 'special') {
    const sp = tileSprite(e.id, { k: e.k, s: e.s });
    const q = Math.max(0, (p - 0.45) / 0.55);
    sp.position.set(...cellXY(e.at)); sp.scale.set(sp.scale.x * Math.max(0.001, ease.outBack(q))); sp.alpha = q > 0 ? 1 : 0;
    const r = fxSprite(VIEW.tex.ring); r.position.set(...cellXY(e.at)); r.width = r.height = cell * (0.6 + 1.6 * q); r.alpha = q > 0 ? 1 - q : 0; r.tint = e.s === 'b' ? 0xffa040 : e.k === 'C' ? 0xffffff : 0x9ff0ff;
  }
  for (const [id, sp] of B.tiles) {
    if (!sp._used) {
      if (beat) sp.visible = false; else { sp.destroy(); B.tiles.delete(id); }
    }
  }
  B.layer.pieces.sortableChildren = true;

  drawFx(ev, p, beat);
  // cursor (keyboard) and selection
  const cur = B.cursorSprite;
  const ci = B.showCursor ? B.cursor : B.sel;
  if (cur) { cur.visible = ci >= 0 && !beat; if (cur.visible) { cur.position.set(...cellXY(ci)); cur.alpha = B.showCursor ? 1 : 0.85; cur.tint = B.sel >= 0 && B.showCursor && B.sel !== B.cursor ? 0x9ff0ff : 0xffffff; } }
  // board shake on big events
  let shake = 0;
  if (beat && !VIEW.reduced) {
    if (ev.some((e) => e.t === 'combo')) shake = 6;
    else if (ev.some((e) => e.t === 'fire' && (e.s === 'C' || e.s === 'b' || e.s === 'B'))) shake = 7;
    else if (ev.some((e) => e.t === 'fire')) shake = 5;
  }
  const off = shake ? Math.sin(p * 55) * shake * (1 - p) : 0;
  for (const name of ['board', 'fx']) VIEW.layers[name].position.set(off, shake ? Math.cos(p * 47) * shake * 0.6 * (1 - p) : 0);
  for (let k = B.fxUsed; k < B.fx.length; k++) B.fx[k].visible = false;
  for (let k = B.halosUsed; k < B.halos.length; k++) B.halos[k].visible = false;
  for (let k = B.popsUsed; k < B.pops.length; k++) B.pops[k].visible = false;
}

// Specials glow from underneath so they read at a glance (static, so captures stay deterministic).
function halo(x, y, t, alpha) {
  let h = B.halos[B.halosUsed];
  if (!h) { h = new PIXI.Sprite(VIEW.tex.puff); h.anchor.set(0.5); h.blendMode = 'add'; B.layer.halos.addChild(h); B.halos.push(h); }
  B.halosUsed++;
  const c = VIEW.layout.cell;
  h.visible = true; h.position.set(x, y); h.rotation = 0;
  if (t.s === 'h' || t.s === 'v') {
    h.texture = VIEW.tex.beam; h.width = c * 1.25; h.height = c * 0.7; h.rotation = t.s === 'v' ? Math.PI / 2 : 0;
    h.tint = 0x7fe9ff; h.alpha = 0.95 * alpha;
  } else {
    h.texture = VIEW.tex.puff; h.width = h.height = c * (t.k === 'C' ? 1.6 : 1.45);
    h.tint = t.k === 'C' ? 0xffffff : 0xff7a1a; h.alpha = (t.s === 'B' ? 1 : 0.85) * alpha;
  }
}
// Landing response for a falling piece: 1 = full squash at impact, negative = the tall rebound, then settled.
// Before it lands it returns -0.3 while in flight (a slight stretch).
function landing(mv, p, dur) {
  const tick = (p * dur) / TICK_MS, end = mv.ticks[mv.ticks.length - 1];
  const over = tick - end;
  if (over <= 0) return tick > (mv.spawn ? mv.ticks[0] - 1 : mv.ticks[0]) ? -0.3 : 0;
  return over < 3.5 ? Math.exp(-over * 1.1) * Math.cos(over * 2.3) : 0;
}

function fallPos(mv, p, dur) {
  const { cell } = VIEW.layout;
  const tick = (p * dur) / TICK_MS; // in ticks since the beat began
  const cells = mv.cells, ticks = mv.ticks;
  const pos = (i) => cellXY(i);
  if (mv.spawn) {
    // virtual start one cell above the spawner, one tick before it appears
    const [x0, y0] = pos(cells[0]);
    const pts = [[x0, y0 - cell], ...cells.map(pos)], tk = [ticks[0] - 1, ...ticks];
    return along(pts, tk, tick);
  }
  return along(cells.map(pos), ticks, tick);
}
function along(pts, tk, t) {
  if (t <= tk[0]) return pts[0];
  for (let j = 1; j < pts.length; j++) {
    if (t < tk[j]) {
      const q = (t - tk[j - 1]) / (tk[j] - tk[j - 1]);
      const a = pts[j - 1], b = pts[j];
      return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
    }
  }
  // landing bounce
  const last = pts[pts.length - 1], over = t - tk[tk.length - 1];
  const bounce = over > 0.6 && over < 2.2 ? Math.sin(((over - 0.6) / 1.6) * Math.PI) * VIEW.layout.cell * 0.05 : 0;
  return [last[0], last[1] - bounce];
}

const SHARD_TINT = [0xc49cff, 0xff8fc0, 0xffd36a, 0x8fe6ff, 0xff9a78, 0x8fe08f];
const CALLOUTS = [[8, '143°F!'], [6, 'Boiling Over!'], [4, 'Simmering!'], [3, 'Steamy!'], [2, 'Bubbly!']];
const FIRE_CALL = { h: 'Cascade!', v: 'Cascade!', b: 'Hot Stone!', C: 'Spring Crystal!' };
const COMBO_CALL = { GG: 'Steam Cross!', GB: 'Big Vent!', BB: 'Hot Rocks!', CG: 'Cascade Storm!', CB: 'Stone Shower!', CC: 'Spring Flood!' };

function drawFx(ev, p, beat) {
  if (!beat) { if (B.callout) B.callout.visible = false; return; }
  const { cell } = VIEW.layout;
  const reduced = VIEW.reduced;
  for (const e of ev) {
    if (e.t === 'hit' && e.layer === 'tile' && !reduced) {
      const [x, y] = cellXY(e.i);
      const n = 10;
      for (let j = 0; j < n; j++) {
        const a = hrand(e.i, j, 3) * Math.PI * 2, d = cell * (0.34 + 0.5 * ease.outCubic(p)) * (0.7 + 0.5 * hrand(e.i, j, 5));
        const white = j % 3 === 0, g = fxSprite(VIEW.tex.glint, white ? 'add' : 'normal');
        g.position.set(x + Math.cos(a) * d, y + Math.sin(a) * d - p * cell * 0.2);
        g.width = g.height = cell * (0.36 + 0.26 * hrand(e.i, j, 7)) * (1 - p * 0.5); g.alpha = Math.min(1, p * 5) * (1 - p) * (white ? 0.7 : 0.95); g.rotation = p * 6 * (hrand(e.i, j, 9) - 0.5);
        g.position.y += p * p * cell * 0.5;
        g.tint = white ? 0xffffff : (SHARD_TINT[e.k] || 0xffffff);
      }
      const pf = fxSprite(VIEW.tex.puff); pf.position.set(x, y - p * cell * 0.4); pf.width = pf.height = cell * (0.6 + p); pf.alpha = 0.4 * (1 - p); pf.tint = SHARD_TINT[e.k] || 0xffffff;
    }
    if (e.t === 'fire') {
      const [x, y] = cellXY(e.at);
      const q = Math.min(1, p * 1.4);
      if (e.s === 'h' || e.s === 'v') {
        const bm = fxSprite(VIEW.tex.beam);
        const len = (e.s === 'h' ? VIEW.layout.cols : VIEW.layout.rows) * cell * 1.1 * ease.outCubic(q);
        bm.position.set(e.s === 'h' ? x : x, y); bm.rotation = e.s === 'h' ? 0 : Math.PI / 2;
        bm.width = Math.max(1, len); bm.height = cell * 0.85 * (1 - 0.4 * p); bm.alpha = 1 - ease.inQuad(p); bm.tint = 0xbff4ff;
        if (!reduced) for (let j = 0; j < 6; j++) {
          const f = (j / 5 - 0.5) * len, pf = fxSprite(VIEW.tex.puff);
          pf.position.set(x + (e.s === 'h' ? f : 0), y + (e.s === 'v' ? f : 0) - p * cell * 0.7 * hrand(e.id, j));
          pf.width = pf.height = cell * (0.5 + 0.7 * p); pf.alpha = 0.32 * (1 - p);
        }
        // the impact travels outward from the special: a spark at each leading tip of the beam
        for (const sgn of [-1, 1]) { const g = fxSprite(VIEW.tex.glint); const d = (len / 2) * sgn; g.position.set(x + (e.s === 'h' ? d : 0), y + (e.s === 'v' ? d : 0)); g.width = g.height = cell * 0.9; g.alpha = 1 - p; }
      } else if (e.s === 'b' || e.s === 'B') {
        const r = fxSprite(VIEW.tex.ring); r.position.set(x, y); r.width = r.height = cell * (0.8 + 4.4 * ease.outCubic(q)); r.alpha = 1 - p; r.tint = e.after ? 0xffd890 : 0xff9a30;
        const ri = fxSprite(VIEW.tex.ring); ri.position.set(x, y); ri.width = ri.height = cell * (0.5 + 2.6 * ease.outCubic(q)); ri.alpha = 0.9 * (1 - p); ri.tint = 0xfff2c8;
        const r2 = fxSprite(VIEW.tex.puff); r2.position.set(x, y); r2.width = r2.height = cell * (1 + 3.5 * q); r2.alpha = 0.7 * (1 - p); r2.tint = 0xff8a20;
        const core = fxSprite(VIEW.tex.puff); core.position.set(x, y); core.width = core.height = cell * 1.6; core.alpha = Math.max(0, 1 - p * 3); core.tint = 0xfff6e0;
      } else if (e.s === 'C') {
        for (const c of e.cells) {
          if (c === e.at) continue;
          const [tx, ty] = cellXY(c), dx = tx - x, dy = ty - y, len = Math.hypot(dx, dy);
          const ray = fxSprite(VIEW.tex.beam); ray.position.set(x + dx * q / 2, y + dy * q / 2); ray.rotation = Math.atan2(dy, dx);
          ray.width = Math.max(1, len * q); ray.height = cell * 0.22; ray.alpha = 1 - ease.inQuad(p);
          ray.tint = [0xffb3e6, 0xb3e6ff, 0xfff0b3, 0xc8ffb3][c % 4];
        }
        const glow = fxSprite(VIEW.tex.puff); glow.position.set(x, y); glow.width = glow.height = cell * (1.5 + 2 * q); glow.alpha = 1 - p;
      }
    }
    if (e.t === 'combo') {
      // special + special: a big themed burst at the target cell
      const [x, y] = cellXY(e.b), L = VIEW.layout, q = Math.min(1, p * 1.3), fade = 1 - ease.inQuad(p);
      const beams = (e.kind === 'GG' ? [[0, 0]] : e.kind === 'GB' ? [[-1, 0], [0, 0], [1, 0]] : []);
      for (const [o] of beams) {
        const h = fxSprite(VIEW.tex.beam); h.position.set(x, y + o * cell); h.width = L.cols * cell * 1.15 * ease.outCubic(q); h.height = cell * 1.1; h.alpha = fade;
        const v = fxSprite(VIEW.tex.beam); v.position.set(x + o * cell, y); v.rotation = Math.PI / 2; v.width = L.rows * cell * 1.15 * ease.outCubic(q); v.height = cell * 1.1; v.alpha = fade;
      }
      if (e.kind === 'BB' || e.kind === 'GB') {
        const r = fxSprite(VIEW.tex.ring); r.position.set(x, y); r.width = r.height = cell * (1 + 8 * ease.outCubic(q)); r.alpha = fade; r.tint = 0xff9a40;
        const g = fxSprite(VIEW.tex.puff); g.position.set(x, y); g.width = g.height = cell * (2 + 6 * q); g.alpha = 0.7 * fade; g.tint = 0xffc070;
      }
      if (e.kind === 'CC' || e.kind === 'CG' || e.kind === 'CB') {
        const g = fxSprite(VIEW.tex.puff); g.position.set(L.bx + L.cols * cell / 2, L.by + L.rows * cell / 2); g.width = g.height = Math.max(L.cols, L.rows) * cell * (0.5 + 1.5 * q); g.alpha = 0.85 * fade;
        for (let j = 0; j < 12; j++) { const a = (j / 12) * Math.PI * 2 + p, ray = fxSprite(VIEW.tex.beam); ray.position.set(x + Math.cos(a) * cell * 2 * q, y + Math.sin(a) * cell * 2 * q); ray.rotation = a; ray.width = cell * 5 * q; ray.height = cell * 0.3; ray.alpha = fade; ray.tint = [0xffb3e6, 0xb3e6ff, 0xfff0b3][j % 3]; }
      }
    }
    if (e.t === 'collect') {
      const [x, y] = cellXY(e.at);
      for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2, g = fxSprite(VIEW.tex.glint); g.position.set(x + Math.cos(a) * cell * p, y + Math.sin(a) * cell * p); g.width = g.height = cell * 0.4; g.alpha = 1 - p; g.tint = 0xffe39a; }
    }
    if (e.t === 'score' && e.pts > 0) {
      const [x, y] = cellXY(e.at);
      const t = popText(`+${e.pts}`, Math.round(cell * (e.mult > 1 ? 0.5 : 0.42)), e.mult > 1 ? '#FFE27A' : '#FFFFFF');
      t.position.set(x, y - cell * 0.2 - p * cell * 0.7); t.alpha = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3; t.scale.set(0.8 + 0.3 * ease.outBack(Math.min(1, p * 2)));
    }
  }
  // chain callout
  const w = ev.find((e) => e.t === 'wave'), combo = ev.find((e) => e.t === 'combo');
  const fire = ev.find((e) => e.t === 'fire' && !e.after);
  const call = combo && COMBO_CALL[combo.kind] ? [0, COMBO_CALL[combo.kind]] : fire && FIRE_CALL[fire.s] ? [0, FIRE_CALL[fire.s]] : w && CALLOUTS.find(([n]) => w.n + 1 >= n);
  if (call) {
    if (!B.callout) {
      B.callout = new PIXI.Text({ text: '', style: { fontFamily: 'Righteous, Trebuchet MS, sans-serif', fontSize: 64, fill: '#FFF6DE', stroke: { color: '#7A4E12', width: 9 }, dropShadow: { color: '#000000', alpha: 0.5, blur: 6, distance: 5, angle: Math.PI / 2 } } });
      B.callout.anchor.set(0.5, 1); VIEW.layers.callout.addChild(B.callout);
    }
    const c = B.callout, L = VIEW.layout;
    c.text = call[1]; c.visible = true; c.style.fontSize = Math.round(Math.min(L.W * 0.11, 70));
    c.scale.set(1);
    // a lane above the frame: the text's bottom edge sits on the frame's top, never over a cell
    if (L.portrait) c.position.set(L.bx + (L.cols * L.cell) / 2, Math.max(c.height * 0.9, L.by - Math.max(10, L.cell * 0.22)));
    else c.position.set(Math.max(150, L.bx / 2), L.H * 0.62); // desktop: in the side column, clear of the board
    const fit = L.portrait ? Math.min(1, (L.W - 24) / (c.width * 1.08)) : Math.min(1, (Math.max(150, L.bx / 2) * 2 - 32) / (c.width * 1.08));
    c.scale.set(fit * (reduced ? 1 : 0.6 + 0.4 * ease.outBack(Math.min(1, p * 2.2))));
    c.alpha = p < 0.75 ? 1 : 1 - (p - 0.75) * 4; c.rotation = -0.06;
  } else if (B.callout) B.callout.visible = false;
}

// --- timeline playback ----------------------------------------------------------------------------
// anim = {sched, base (model before), model, applied, t0, done}
export function startAnim(preState, timeline, reduced) {
  const sched = schedule(timeline, { reduced });
  const base = modelFromState(preState);
  return { sched, base, model: JSON.parse(JSON.stringify(base)), applied: 0, t0: performance.now(), timeline };
}
// Draws the animation at elapsed ms; returns true while still playing.
export function drawAnim(anim, ms) {
  const { i, p } = frameAt(anim.sched, ms);
  if (i < anim.applied) { anim.model = JSON.parse(JSON.stringify(anim.base)); anim.applied = 0; }
  while (anim.applied < i) { for (const e of anim.sched.beats[anim.applied].events) applyEvent(anim.model, e); anim.applied++; }
  if (i >= anim.sched.beats.length) { drawFrame(anim.model, null, 1); return false; }
  drawFrame(anim.model, anim.sched.beats[i], p);
  return true;
}
export function drawStatic(s) { B.model = modelFromState(s); drawFrame(B.model, null, 1); }
export { cellXY };
