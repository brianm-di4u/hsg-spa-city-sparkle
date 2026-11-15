// One v1 resource; explicit intents never serialize an unrelated cached snapshot.
import { freshDaily, cleanDaily, dailyInto } from './daily.js';
const KEY = 'spa-city-sparkle:v1';
const BACKUP = KEY + ':corrupt';
const clone = (v) => JSON.parse(JSON.stringify(v));
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const own = (v, k) => Object.prototype.hasOwnProperty.call(v, k);
const ordered = (v) => Array.isArray(v) ? v.map(ordered) : obj(v) ? Object.fromEntries(Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => [k, ordered(v[k])])) : v;
const canonical = (v) => JSON.stringify(ordered(v));
const token = () => globalThis.crypto?.randomUUID?.() || ('save-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
const META = ['resourceId', 'resetEpoch', 'currentGeneration'];
const TYPES = ['hammer', 'line', 'shuffle', 'plus5'];
// Every STAR_STEP stars earned in the journey pay one booster, of the kind the player holds fewest of, on top of the
// one a first three-star win gives. Was 15 in the first try (about 4 extra over a casual bot's pass of all 60 levels); 12 gives about 5.
export const STAR_STEP = 12;
const starsOf = (progress) => Object.values(progress).reduce((n, p) => n + (p && p.stars || 0), 0);
const SETTING_KEYS = ['sound', 'music', 'ambience', 'volume', 'motion', 'steam', 'hints', 'badges'];
export const freshSave = () => ({ v: 1, settings: { sound: true, music: true, ambience: true, volume: 0.5, motion: 'auto', steam: true, hints: true, badges: false }, progress: {}, stats: {}, boosters: { hammer: 1, line: 1, shuffle: 1, plus5: 1 }, lore: [], tutorialSeen: [], current: null, soakDay: null, soakBest: 0, daily: freshDaily() });
// Settings as read from a save: the defaults under what the save holds. A save from before the Ambience switch gets it
// where its Sound effects switch is, so a player who had the effects off hears no new sound.
const readSettings = (saved) => { const st = { ...freshSave().settings, ...(saved || {}) }; if (!saved || typeof saved.ambience !== 'boolean') st.ambience = st.sound !== false; return st; };
// Per-level play record for tuning: stats[levelId] = { tries: runs finished (won or lost), wins, bestMoves: fewest moves a win took }.
// Small whole numbers; anything else in a damaged save is dropped.
const int = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);
export const cleanStats = (v) => Object.fromEntries(Object.entries(obj(v) ? v : {}).filter(([, e]) => obj(e)).map(([id, e]) => [id, { tries: int(e.tries), wins: int(e.wins), bestMoves: int(e.bestMoves) }]));
const tally = (next, id, won, moves) => {
  const e = (next.stats[id] ||= { tries: 0, wins: 0, bestMoves: 0 });
  e.tries++;
  if (won) { e.wins++; if (moves > 0 && (!e.bestMoves || moves < e.bestMoves)) e.bestMoves = moves; }
};
const stamp = (d) => ({ resourceId: d.resourceId, resetEpoch: d.resetEpoch });
const currentGroup = (d) => ({ ...stamp(d), currentGeneration: d.currentGeneration, current: clone(d.current ?? null) });
const same = (a, b) => canonical(a) === canonical(b);
const affectedReset = (d) => ({ ...currentGroup(d), progress: d.progress, stats: d.stats, boosters: d.boosters, lore: d.lore, tutorialSeen: d.tutorialSeen, soakBest: d.soakBest, soakDay: d.soakDay, daily: d.daily });

export function createSaveStore({ storage = () => globalThis.localStorage, newToken = token, projection = freshSave() } = {}) {
  let last = null, active = null, serial = 0, conflictKey = null, unsavedNotice = false, corrupt = null; // corrupt: raw text of a stored value that cannot be read
  const pending = { reservation: null, bundle: null, settings: {}, preferenceBirth: null, wins: new Map(), tutorials: new Map(), reset: null };
  const effects = { onChange() {}, onConflict() {}, onUnsaved() {} };
  const issued = new Map();
  const fail = (reason) => ({ ok: false, reason });
  function unsaved() { projection.storageOk = false; if (!unsavedNotice) { unsavedNotice = true; effects.onUnsaved(); } return fail('storage-unavailable'); }
  function project(data, ok) {
    data = { ...freshSave(), ...data, settings: readSettings(data.settings) };
    const settings = projection.settings;
    for (const k of Object.keys(projection)) if (k !== 'storageOk') delete projection[k];
    Object.assign(projection, clone(data));
    for (const k of Object.keys(settings)) if (!own(data.settings, k)) delete settings[k];
    Object.assign(settings, data.settings); projection.settings = settings; projection.storageOk = ok;
  }
  function observe() {
    const raw = storage().getItem(KEY);
    if (raw === null) { last = { kind: 'missing', raw: null, data: freshSave() }; return clone(last); }
    let d; try { d = JSON.parse(raw); } catch { throw Object.assign(Error('Unreadable save'), { raw }); }
    if (!obj(d) || d.v !== 1 || ['settings', 'progress', 'boosters'].some((k) => own(d, k) && !obj(d[k]))) throw Object.assign(Error('Unsupported save'), { raw });
    const count = META.filter((k) => own(d, k)).length;
    if (count && (count !== META.length || META.some((k) => typeof d[k] !== 'string' || !d[k]))) throw Object.assign(Error('Partial save identity'), { raw });
    const data = { ...freshSave(), ...d, settings: readSettings(d.settings), boosters: { ...freshSave().boosters, ...(d.boosters || {}) } };
    data.stats = cleanStats(data.stats); data.daily = cleanDaily(data.daily); if (!Number.isFinite(data.soakBest) || data.soakBest < 0) data.soakBest = 0; if (typeof data.soakDay !== 'string') data.soakDay = null;
    delete data.storageOk;
    last = { kind: count ? 'identified' : 'legacy', raw, data, payload: d }; return clone(last);
  }
  function read() { try { corrupt = null; return observe(); } catch (e) { corrupt = typeof e?.raw === 'string' ? e.raw : null; projection.storageOk = false; return null; } }
  // The player opted in (Start fresh or Reset): keep the unreadable text under a backup key, then treat the slot as missing.
  function discardUnreadable() {
    if (corrupt === null) return fail('not-unreadable');
    try { storage().setItem(BACKUP, corrupt); storage().removeItem(KEY); } catch { return fail('storage-unavailable'); }
    corrupt = null; last = null; return { ok: true };
  }
  const birth = () => ({ resourceId: newToken(), resetEpoch: newToken(), currentGeneration: newToken() });
  const identify = (o, ids) => o.kind === 'identified' ? clone(o.data) : { ...clone(o.data), ...ids };
  const metadataOnly = (o, ids) => o.kind === 'legacy' ? { ...clone(o.payload), ...ids } : identify(o, ids);
  function observationMatches(now, before) {
    if (!before || !now || before.kind !== now.kind) return false;
    return now.kind === 'identified' ? same(currentGroup(now.data), currentGroup(before.data)) : now.raw === before.raw;
  }
  function conflict(reason) {
    const key = (active?.run || 'none') + ':' + reason;
    if (key !== conflictKey) { conflictKey = key; effects.onConflict(reason); }
    return fail(reason);
  }
  const hasIdentity = (d, s) => META.every((k) => typeof d[k] === 'string') && s && d.resourceId === s.resourceId && d.resetEpoch === s.resetEpoch;
  function resultInto(next, r) {
    const prev = next.progress[r.levelId];
    const beforeWorld = r.worldLevels.every((id) => !!next.progress[id]);
    const levelReward = r.stars === 3 && !(prev && prev.stars === 3) ? r.rewardType : null;
    if (levelReward) next.boosters[levelReward] = (next.boosters[levelReward] || 0) + 1;
    const starsBefore = starsOf(next.progress);
    next.stats = cleanStats(next.stats); tally(next, r.levelId, true, r.moves);
    next.progress[r.levelId] = { ...(prev || {}), stars: Math.max(r.stars, prev?.stars || 0), best: Math.max(r.score, prev?.best || 0) };
    if (r.loreId && !next.lore.includes(r.loreId)) next.lore.push(r.loreId);
    let starReward = null;
    if (Math.floor(starsOf(next.progress) / STAR_STEP) > Math.floor(starsBefore / STAR_STEP)) {
      starReward = TYPES.reduce((low, k) => ((next.boosters[k] || 0) < (next.boosters[low] || 0) ? k : low), TYPES[0]);
      next.boosters[starReward] = (next.boosters[starReward] || 0) + 1;
    }
    const worldComplete = !beforeWorld && r.worldLevels.every((id) => !!next.progress[id]);
    if (worldComplete) for (const k of TYPES) next.boosters[k] = (next.boosters[k] || 0) + 1;
    return { levelReward, starReward, worldComplete };
  }
  function globals(data) {
    const next = clone(data), wins = [], tutorials = [], outcomes = {}, clearedRuns = [];
    next.settings = { ...next.settings, ...pending.settings };
    for (const [id, w] of pending.wins) if (hasIdentity(next, w.stamp)) {
      outcomes[id] = resultInto(next, w.result); wins.push(id);
      if (w.clearBase && same(currentGroup(next), w.clearBase)) { next.current = null; next.currentGeneration = w.terminalGeneration; clearedRuns.push(w.run); }
    }
    // pending.tutorials also carries finished Daily Challenge attempts ({daily}): small, idempotent records that never touch the Continue slot
    for (const [id, t] of pending.tutorials) if (hasIdentity(next, t.stamp)) { if (t.daily) outcomes[id] = dailyInto(next, t.daily); else if (!next.tutorialSeen.includes(t.tip)) next.tutorialSeen.push(t.tip); tutorials.push(id); }
    return { next, wins, tutorials, outcomes, clearedRuns };
  }
  const unpublished = () => !!(pending.reservation || pending.bundle || pending.reset || pending.wins.size || pending.tutorials.size || Object.keys(pending.settings).length);
  function publish(built, acknowledge = () => {}) {
    try { storage().setItem(KEY, JSON.stringify(built.next)); }
    catch { project(built.next, false); return { ...unsaved(), outcomes: built.outcomes }; }
    for (const id of built.wins) pending.wins.delete(id);
    for (const id of built.tutorials) pending.tutorials.delete(id);
    pending.settings = {}; pending.preferenceBirth = null;
    if (active && built.clearedRuns?.includes(active.run)) active.base = currentGroup(built.next);
    acknowledge(built.next); // Acknowledge/clear pending before any fallible UI/audio effect.
    const complete = !unpublished();
    project(built.next, complete); if (complete) unsavedNotice = false; else unsaved();
    last = { kind: 'identified', raw: JSON.stringify(built.next), data: clone(projection), payload: clone(built.next) }; delete last.data.storageOk;
    effects.onChange();
    return { ok: true, outcomes: built.outcomes };
  }
  function memoryGlobals() { const built = globals(projection); project(built.next, false); return { ...unsaved(), outcomes: built.outcomes }; }
  function retryReservation() {
    const p = pending.reservation; if (!p) return { ok: true };
    const o = read(); if (!o) return unsaved();
    if (!observationMatches(o, p.observed)) return conflict('current-reservation-changed');
    if (p.kind === 'adopt' && o.kind === 'identified' && !Object.keys(pending.settings).length) {
      active = { run: p.run, mode: p.mode, stamp: stamp(o.data), base: currentGroup(o.data) };
      pending.reservation = null; conflictKey = null; project(o.data, !unpublished()); if (unpublished()) unsaved(); effects.onChange(); return { ok: true };
    }
    const pureMetadata = !Object.keys(pending.settings).length;
    let next = pureMetadata ? metadataOnly(o, p.ids) : identify(o, p.ids);
    if (p.kind === 'new' && p.mode !== 'soak') next.currentGeneration = p.generation;
    if (!pureMetadata) next.settings = { ...next.settings, ...pending.settings };
    const previousVisit = pending.bundle && clone(projection);
    const receipt = publish({ next, wins: [], tutorials: [], outcomes: {} }, (saved) => {
      active = { run: p.run, mode: p.mode, stamp: stamp(saved), base: currentGroup(saved) };
      if (pending.bundle?.run === p.run) { pending.bundle.base = clone(active.base); pending.bundle.stamp = clone(active.stamp); }
      for (const w of pending.wins.values()) if (w.run === p.run && hasIdentity(saved, w.stamp)) w.clearBase = clone(active.base);
      pending.reservation = null; conflictKey = null;
      for (const [id, p] of pending.wins) if (!hasIdentity(saved, p.stamp)) pending.wins.delete(id);
      for (const [id, p] of pending.tutorials) if (!hasIdentity(saved, p.stamp)) pending.tutorials.delete(id);
    });
    if (!receipt.ok && previousVisit) project(previousVisit, false);
    return receipt;
  }
  function flushReset() {
    const p = pending.reset; if (!p) return { ok: true };
    const o = read(); if (!o) return fail('storage-unavailable');
    if (!observationMatches(o, p.observed) || !same(affectedReset(o.data), p.affected)) return conflict('reset-resource-changed');
    const next = identify(o, p.ids);
    next.progress = {}; next.stats = {}; next.boosters = freshSave().boosters; next.lore = []; next.tutorialSeen = []; next.current = null; next.soakBest = 0; next.soakDay = null; next.daily = freshDaily();
    next.resetEpoch = p.epoch; next.currentGeneration = p.generation;
    return publish(globals(next), () => {
      pending.reset = null; pending.reservation = null; pending.bundle = null; pending.wins.clear(); pending.tutorials.clear(); active = null; conflictKey = null;
    });
  }
  function memoryBundle(b) { const built = globals(projection); if (b.mode !== 'soak') { built.next.current = b.terminal ? null : clone(b.current); if (b.terminal) built.next.currentGeneration = b.terminalGeneration; } if (b.lost) { built.next.stats = cleanStats(built.next.stats); tally(built.next, b.lost, false); } if (b.result) built.outcomes[b.resultId] = resultInto(built.next, b.result); project(built.next, false); return { ...unsaved(), outcomes: built.outcomes }; }
  function flushBundle() {
    const b = pending.bundle; if (!b || !b.ready) return { ok: true };
    if (pending.reset) { const r = flushReset(); if (!r.ok) return r; }
    if (pending.reservation) { const r = retryReservation(); if (!r.ok) return r.reason === 'storage-unavailable' ? memoryBundle(b) : r; }
    const o = read(); if (!o) return memoryBundle(b);
    if (o.kind !== 'identified' || !hasIdentity(o.data, b.stamp) || (b.mode !== 'soak' && !same(currentGroup(o.data), b.base))) return conflict('current-action-conflict');
    const built = globals(o.data);
    for (const k of TYPES) { const owed = [...b.debits.values()].filter((d) => d.type === k).reduce((n, d) => n + d.count, 0); if ((built.next.boosters[k] || 0) < owed) return conflict('booster-balance-changed'); built.next.boosters[k] -= owed; }
    if (b.result) built.outcomes[b.resultId] = resultInto(built.next, b.result);
    if (b.mode !== 'soak') { built.next.current = b.terminal ? null : clone(b.current); if (b.terminal) built.next.currentGeneration = b.terminalGeneration; }
    if (b.lost) { built.next.stats = cleanStats(built.next.stats); tally(built.next, b.lost, false); }
    return publish(built, (saved) => { if (active?.run === b.run && b.mode !== 'soak') active.base = currentGroup(saved); pending.bundle = null; conflictKey = null; });
  }
  function flushGlobals() {
    if (!pending.wins.size && !pending.tutorials.size) return { ok: true };
    const o = read(); if (!o) return memoryGlobals();
    if (o.kind !== 'identified') return conflict('save-incarnation-changed');
    if ([...pending.wins.values(), ...pending.tutorials.values()].some((p) => !hasIdentity(o.data, p.stamp))) return conflict('earned-result-resource-changed');
    return publish(globals(o.data));
  }
  function begin(kind, mode = 'journey') {
    if (pending.reset) { const p = pending.reset, r = flushReset(); if (!r.ok) { if (kind !== 'new' || !p.abandonNotice) { p.abandonNotice = true; effects.onConflict('Reset was not saved. Choose New again only to abandon that pending reset without clearing newer progress.'); return r; } pending.reset = null; } }
    if (pending.bundle) {
      const b = pending.bundle, r = flushBundle();
      if (!r.ok || pending.bundle) {
        if (kind !== 'new' || !b.abandonNotice) { b.abandonNotice = true; effects.onConflict('Unpublished level changes and all dependent costs/rewards are unsaved. Choose New again only to abandon that whole bundle.'); return fail('abandonment-not-acknowledged'); }
        pending.bundle = null; // Fresh acknowledged New abandons the entire bundle, never costs alone.
      }
    }
    flushGlobals();
    const o = read(), run = newToken(), ids = birth();
    if (kind === 'adopt' && o && !o.data.current) { project(o.data, true); return fail('no-current'); }
    const observed = o || (last && clone(last));
    pending.reservation = { kind, mode, run, observed, ids, generation: newToken() };
    const authority = observed ? identify(observed, ids) : { ...freshSave(), ...ids };
    const imagined = o ? clone(authority) : { ...clone(projection), ...stamp(authority), currentGeneration: authority.currentGeneration }; delete imagined.storageOk;
    active = { run, mode, stamp: stamp(authority), base: currentGroup(authority) };
    if (!o) { project(imagined, false); return unsaved(); }
    const receipt = retryReservation();
    return { ...receipt, observedCurrent: kind === 'adopt' ? clone(o.data.current) : null };
  }
  const store = { data: projection, pending, effects,
    load() { const o = read(); if (o) project(o.data, true); else projection.storageOk = false; return projection; },
    settings(changes) {
      Object.assign(pending.settings, Object.fromEntries(Object.entries(changes).filter(([k]) => SETTING_KEYS.includes(k))));
      const o = read(); if (!o) { projection.settings = Object.assign(projection.settings, pending.settings); effects.onChange(); return unsaved(); }
      if (!pending.preferenceBirth || !observationMatches(o, pending.preferenceBirth.observed)) pending.preferenceBirth = { observed: clone(o), ids: birth() };
      return publish(globals(identify(o, pending.preferenceBirth.ids)));
    },
    reserve(mode = 'journey') { return begin('new', mode); },
    retryReservation,
    adopt() { const r = begin('adopt'); if (!r.ok && !(r.reason === 'storage-unavailable' && r.observedCurrent)) return null; return r.observedCurrent ? clone(r.observedCurrent) : null; },
    prepare({ mode = 'journey', booster = null, localAvailable = 0 } = {}) {
      if (booster && (!TYPES.includes(booster) || !(localAvailable > 0))) return fail('no-local-booster');
      if (pending.reset) { const r = flushReset(); if (!r.ok) return r; }
      let memory = false;
      for (const fn of [retryReservation, flushBundle, flushGlobals]) { const r = fn(); if (!r.ok) { if (r.reason !== 'storage-unavailable') return r; memory = true; } }
      const o = read(); if (!active) return conflict('no-current-authority');
      if (mode !== active.mode) return conflict('action-mode-changed');
      if (o && !pending.reservation && (o.kind !== 'identified' || !hasIdentity(o.data, active.stamp) || (mode !== 'soak' && !same(currentGroup(o.data), active.base)))) return conflict('current-action-conflict');
      if (booster) { const committed = o?.data || last?.data, source = committed || projection, owed = pending.bundle ? [...pending.bundle.debits.values()].filter((d) => d.type === booster).reduce((n, d) => n + d.count, 0) : 0; if ((source.boosters[booster] || 0) - (committed ? owed : 0) <= 0) return conflict('booster-balance-changed'); }
      issued.clear();
      const permit = Object.freeze({ ok: true, id: active.run + ':' + (++serial), memory: memory || !o });
      issued.set(permit.id, { permit, run: active.run, mode, stamp: clone(active.stamp), base: clone(active.base) });
      return permit;
    },
    computed(action, current, debit = null) {
      const grant = action && issued.get(action.id);
      if (!grant || grant.permit !== action || !active || grant.run !== active.run) return fail('stale-action-callback');
      if (debit && !TYPES.includes(debit)) return fail('unknown-booster');
      if (!pending.bundle) pending.bundle = { run: grant.run, mode: grant.mode, stamp: clone(grant.stamp), base: clone(grant.base), current: clone(current), debits: new Map(), actionIds: new Set(), ready: false, terminal: false, terminalGeneration: newToken(), result: null };
      const b = pending.bundle; if (b.run !== grant.run) return conflict('pending-action-owner-changed');
      const first = !b.actionIds.has(action.id);
      if (first) { b.actionIds.add(action.id); if (debit) b.debits.set(action.id, { type: debit, count: 1 }); }
      b.current = clone(current); b.ready = false; b.terminal = false; b.result = null; b.resultId = null; b.lost = null;
      if (debit && first) projection.boosters[debit] = (projection.boosters[debit] || 0) - 1;
      return { ok: true };
    },
    settle() { if (pending.bundle) pending.bundle.ready = true; return flushBundle(); },
    terminal(result = null, current = null, lost = null) {
      if (pending.bundle && (!result || pending.bundle.debits.size)) { const b = pending.bundle; if (current) b.current = clone(current); b.terminal = true; b.lost = lost; b.result = result && clone(result); b.resultId = result && (b.run + ':win:' + result.levelId + ':' + result.score + ':' + result.stars); b.ready = true; const receipt = flushBundle(); return { ...receipt, outcome: receipt.outcomes?.[b.resultId] }; }
      if (result && pending.bundle) pending.bundle = null; // No unpaid cost: new earned record can merge without clearing a foreign slot.
      let memoryReservation = false;
      if (pending.reservation) { const r = retryReservation(); if (!r.ok && r.reason !== 'storage-unavailable') return r; memoryReservation = !r.ok; }
      if (!active) return conflict('no-current-authority');
      if (result) {
        const id = active.run + ':win:' + result.levelId + ':' + result.score + ':' + result.stars;
        if (!pending.wins.has(id)) pending.wins.set(id, { run: active.run, stamp: clone(active.stamp), clearBase: clone(active.base), terminalGeneration: newToken(), result: clone(result) });
        const o = read(); if (!o || memoryReservation) { const receipt = memoryGlobals(); return { ...receipt, outcome: receipt.outcomes?.[id] }; }
        if (o.kind !== 'identified' || !hasIdentity(o.data, active.stamp)) return conflict('earned-result-resource-changed');
        const built = globals(o.data);
        const receipt = publish(built);
        return { ...receipt, outcome: receipt.outcomes?.[id] };
      }
      const o = read(); if (!o) return unsaved();
      if (!same(currentGroup(o.data), active.base)) return conflict('terminal-clear-conflict');
      const next = clone(o.data); next.current = null; next.currentGeneration = newToken();
      if (lost) { next.stats = cleanStats(next.stats); tally(next, lost, false); }
      return publish(globals(next), (saved) => { active.base = currentGroup(saved); });
    },
    tutorial(tip) { if (!active) { if (!projection.tutorialSeen.includes(tip)) projection.tutorialSeen.push(tip); return fail('no-resource-authority'); } const id = active.run + ':tip:' + tip; pending.tutorials.set(id, { tip, stamp: clone(active.stamp) }); return flushGlobals(); },
    // A finished Daily Challenge attempt: {key, score, stars, won}. Its outcome says what was new (best, streak).
    daily(result) {
      if (!active) { const out = dailyInto(projection, result); return { ...fail('no-resource-authority'), outcome: out }; }
      const id = active.run + ':daily:' + result.key + ':' + result.score + ':' + result.stars + ':' + (result.won ? 1 : 0);
      pending.tutorials.set(id, { daily: { ...result }, stamp: clone(active.stamp) });
      const r = flushGlobals();
      return { ...r, outcome: r.outcomes?.[id] };
    },
    unreadable() { read(); return corrupt !== null; },
    startFresh() {
      const r = discardUnreadable(); if (!r.ok) return r;
      active = null; conflictKey = null; unsavedNotice = false; pending.reservation = null; pending.bundle = null; pending.reset = null; pending.wins.clear(); pending.tutorials.clear();
      const o = read(); if (!o) return fail('storage-unavailable');
      if (Object.keys(pending.settings).length) store.settings({}); else project(o.data, true);
      effects.onChange(); return { ok: true };
    },
    reset() { let o = read(); if (!o && corrupt !== null && discardUnreadable().ok) o = read(); pending.reset = { observed: o || (last && clone(last)), affected: clone(affectedReset(o?.data || projection)), ids: birth(), epoch: newToken(), generation: newToken() }; const receipt = flushReset(); if (!receipt.ok && receipt.reason === 'storage-unavailable') project({ ...clone(projection), progress: {}, stats: {}, boosters: freshSave().boosters, lore: [], tutorialSeen: [], current: null, soakBest: 0, soakDay: null, daily: freshDaily(), resetEpoch: pending.reset.epoch, currentGeneration: pending.reset.generation }, false); return receipt; },
    retryReset: flushReset,
    retry: flushBundle,
    // Separate installer: called only by explicit fixture arrangement, never by a normal mutation.
    arrangeFixture(patch) {
      const o = read(); if (!o) { project({ ...clone(projection), ...clone(patch), ...birth() }, false); return fail('fixture-storage-unavailable'); }
      const next = identify(o, birth()); Object.assign(next, clone(patch)); Object.assign(next, birth());
      return publish({ next, wins: [], tutorials: [] }, () => { active = null; pending.reservation = null; pending.bundle = null; pending.wins.clear(); pending.tutorials.clear(); pending.reset = null; issued.clear(); });
    },
  };
  return store;
}

export const SAVE = freshSave();
const STORE = createSaveStore({ projection: SAVE });
export const configureSaveEffects = (callbacks) => Object.assign(STORE.effects, callbacks);
export const loadSave = () => STORE.load();
export const changeSettings = (changes) => STORE.settings(changes);
export const reserveCurrent = (mode) => STORE.reserve(mode);
export const adoptCurrent = () => STORE.adopt();
export const prepareSaveAction = (request) => STORE.prepare(request);
export const recordComputedAction = (action, current, debit) => STORE.computed(action, current, debit);
export const saveSettledAction = () => STORE.settle();
export const saveTerminal = (result, current, lost) => STORE.terminal(result, current, lost);
export const markTutorial = (tip) => STORE.tutorial(tip);
export const saveDaily = (result) => STORE.daily(result);
export const resetSave = () => STORE.reset();
export const saveUnreadable = () => STORE.unreadable();
export const startFreshSave = () => STORE.startFresh();
export function arrangeSaveFixture(patch) {
  if (!globalThis.window?.__TEST__) throw Error('Explicit fixture arrangement requires test context');
  return STORE.arrangeFixture(patch);
}
