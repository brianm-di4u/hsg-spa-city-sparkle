// Display model: what the board view shows, rebuilt by replaying timeline events. Pure (no Pixi), so
// Node tests can prove that replaying a timeline on the pre-move state reproduces the engine's
// post-move state (the "timeline reducer" invariant in MECHANICS / DEV-PLAN).

export function modelFromState(s) {
  const m = { w: s.w, h: s.h, mask: s.mask.slice(), at: new Array(s.tile.length).fill(null), tiles: {},
    stone: s.stone.slice(), moss: s.moss.slice(), crust: s.crust.slice(), lock: s.lock.slice(), fog: s.fog.slice() };
  s.tile.forEach((t, i) => { if (t) { m.at[i] = t.id; m.tiles[t.id] = { k: t.k, s: t.s }; } });
  return m;
}

const removeId = (m, id) => { const i = m.at.indexOf(id); if (i >= 0) m.at[i] = null; };

export function applyEvent(m, e) {
  switch (e.t) {
    case 'swap': { const t = m.at[e.a]; m.at[e.a] = m.at[e.b]; m.at[e.b] = t; break; }
    case 'swapBack': { const t = m.at[e.a]; m.at[e.a] = m.at[e.b]; m.at[e.b] = t; break; }
    case 'convert': for (const c of e.tiles) if (m.tiles[c.id]) m.tiles[c.id].s = c.s; break;
    case 'fire': if (e.s === 'b' && !e.after && m.tiles[e.id]) m.tiles[e.id].s = 'B'; break;
    case 'encore': if (m.tiles[e.id]) m.tiles[e.id].s = e.s; break;
    case 'hit':
      if (e.layer === 'fog') m.fog[e.i] = 0;
      else if (e.layer === 'lock') m.lock[e.i] = e.left;
      else if (e.layer === 'stone') m.stone[e.i] = e.left;
      else if (e.layer === 'moss') m.moss[e.i] = 0;
      else if (e.layer === 'tile') { if (m.at[e.i] === e.id) m.at[e.i] = null; else removeId(m, e.id); delete m.tiles[e.id]; }
      if (e.crust !== undefined) m.crust[e.i] = e.crust;
      break;
    case 'special': m.at[e.at] = e.id; m.tiles[e.id] = { k: e.k, s: e.s }; break;
    case 'fall': {
      for (const mv of e.moves) if (!mv.spawn && m.at[mv.cells[0]] === mv.id) m.at[mv.cells[0]] = null;
      for (const mv of e.moves) {
        if (mv.spawn) m.tiles[mv.id] = { k: mv.k, s: mv.s };
        if (mv.gone) { delete m.tiles[mv.id]; continue; }
        m.at[mv.cells[mv.cells.length - 1]] = mv.id;
      }
      break;
    }
    case 'collect': removeId(m, e.id); delete m.tiles[e.id]; break;
    case 'spread': if (m.at[e.to] === e.id) m.at[e.to] = null; delete m.tiles[e.id]; m.moss[e.to] = 1; break;
    case 'reshuffle':
      for (const [id] of e.moves) removeId(m, id);
      for (const [id, cell, k] of e.moves) { m.at[cell] = id; if (m.tiles[id] && k !== undefined) m.tiles[id].k = k; }
      break;
    default: break;
  }
  return m;
}

export function replay(m, events) { for (const e of events) applyEvent(m, e); return m; }

// Compares a model with an engine state; returns a list of differences (empty when equal).
export function diffModel(m, s) {
  const out = [];
  for (let i = 0; i < s.tile.length; i++) {
    const t = s.tile[i], id = m.at[i];
    if ((t ? t.id : null) !== id) { out.push(`cell ${i}: model ${id} state ${t ? t.id : null}`); continue; }
    if (t && (m.tiles[id].k !== t.k || (m.tiles[id].s || null) !== (t.s || null))) out.push(`cell ${i}: kind ${m.tiles[id].k}${m.tiles[id].s} vs ${t.k}${t.s}`);
    for (const L of ['stone', 'moss', 'crust', 'lock', 'fog']) if (m[L][i] !== s[L][i]) out.push(`cell ${i}: ${L} ${m[L][i]} vs ${s[L][i]}`);
  }
  return out;
}
