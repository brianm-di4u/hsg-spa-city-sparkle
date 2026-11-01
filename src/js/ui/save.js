// Saves: one localStorage key, every access in try/catch. The game keeps working in memory when
// storage is unavailable (private mode, blocked storage) — PRD §11, AC38.
const KEY = 'spa-city-sparkle:v1';

export const SAVE = {
  v: 1,
  settings: { sound: true, music: true, volume: 0.5, motion: 'auto', steam: true, hints: true, badges: false },
  progress: {},            // levelId -> {stars, best}
  boosters: { hammer: 1, line: 1, shuffle: 1, plus5: 1 },
  lore: [],
  tutorialSeen: [],
  current: null,           // {levelId, state} in-progress level for Continue
  soakDay: null, soakBest: 0,
  storageOk: true,
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.v === 1) {
        Object.assign(SAVE.settings, d.settings || {});
        Object.assign(SAVE.progress, d.progress || {});
        Object.assign(SAVE.boosters, d.boosters || {});
        SAVE.lore = d.lore || []; SAVE.tutorialSeen = d.tutorialSeen || []; SAVE.current = d.current || null;
        SAVE.soakDay = d.soakDay || null; SAVE.soakBest = d.soakBest || 0;
      }
    }
  } catch (e) { SAVE.storageOk = false; }
  return SAVE;
}

export function writeSave() {
  try {
    const { storageOk, ...data } = SAVE;
    localStorage.setItem(KEY, JSON.stringify(data));
    SAVE.storageOk = true;
  } catch (e) { SAVE.storageOk = false; }
}

export function resetSave() {
  SAVE.progress = {}; SAVE.lore = []; SAVE.tutorialSeen = []; SAVE.current = null;
  SAVE.boosters = { hammer: 1, line: 1, shuffle: 1, plus5: 1 };
  SAVE.soakBest = 0;
  writeSave();
}
