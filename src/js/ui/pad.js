// Gamepad (S1-09). A pad is another way to press the keys the game already answers to, not a second scheme:
// the D-pad and the left stick are the arrow keys, A is Enter, B is Esc and Start is P. In the game the keys go to the same listener a keyboard
// reaches, so the cursor, picking, swapping, cancelling, skipping and pausing behave as they do from the keys. On the title, the map and
// every card the arrows move focus between the buttons (a slider takes left and right as steps), A presses the focused button and B backs out.
// Polling runs only while a pad is connected.
import { UI } from './screens.js';

const DIRS = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const BUTTON = { 0: 'confirm', 1: 'back', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
const STICK = 0.55, FIRST_REPEAT_MS = 380, REPEAT_MS = 140;
const FOCUSABLE = 'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])';
let running = false, held = new Map(); // held: control name -> when it may repeat

const key = (k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const visible = (x) => !x.disabled && x.offsetParent !== null;
function scope() { const m = document.getElementById('modal'); return UI.modalOpen ? m : document.getElementById('screen'); }

// Left and right on a slider step it; every other arrow moves focus to the next or previous control in the card or screen.
function focusStep(dir) {
  const root = scope(), at = document.activeElement;
  if (at && at.type === 'range' && (dir === 'left' || dir === 'right')) {
    const step = +at.step || 1, v = Math.max(+at.min, Math.min(+at.max, +at.value + (dir === 'right' ? step : -step)));
    if (v !== +at.value) { at.value = String(v); at.dispatchEvent(new Event('input', { bubbles: true })); at.dispatchEvent(new Event('change', { bubbles: true })); }
    return;
  }
  const items = [...root.querySelectorAll(FOCUSABLE)].filter(visible);
  if (!items.length) return;
  const i = items.indexOf(at), next = dir === 'down' || dir === 'right' ? i + 1 : i - 1;
  items[i < 0 ? 0 : (next + items.length) % items.length].focus();
}
function confirm() {
  const at = document.activeElement;
  if (at && at !== document.body && at.matches && at.matches('button, a[href]') && visible(at)) at.click();
  else if (UI.scene === 'game' && !UI.modalOpen) key('Enter');
  else focusStep('down');
}
function act(name) {
  const inGame = UI.scene === 'game' && !UI.modalOpen && !document.getElementById('tip');
  if (DIRS[name]) { if (inGame) key(DIRS[name]); else if (!document.getElementById('tip')) focusStep(name); return; }
  if (name === 'confirm') { if (document.getElementById('tip')) key('Enter'); else confirm(); return; }
  if (name === 'back') { key('Escape'); return; }
  if (name === 'start') { if (inGame) key('p'); else if (UI.scene === 'pause') key('Escape'); }
}
// A browser may refuse the call (a page in a frame without permission): then there is no pad.
const connected = () => { try { return navigator.getGamepads ? [...navigator.getGamepads()].filter((p) => p && p.connected) : []; } catch (_) { return []; } };
function poll(now) {
  const pads = connected();
  if (!pads.length) { running = false; held.clear(); return; }
  const down = new Set();
  for (const p of pads) {
    for (const [i, name] of Object.entries(BUTTON)) if (p.buttons[i] && p.buttons[i].pressed) down.add(name);
    const x = p.axes[0] || 0, y = p.axes[1] || 0;
    if (Math.abs(x) > STICK && Math.abs(x) >= Math.abs(y)) down.add(x < 0 ? 'left' : 'right');
    else if (Math.abs(y) > STICK) down.add(y < 0 ? 'up' : 'down');
  }
  for (const name of [...held.keys()]) if (!down.has(name)) held.delete(name);
  for (const name of down) {
    const due = held.get(name);
    if (due === undefined) { held.set(name, now + FIRST_REPEAT_MS); act(name); } // a press acts once, at once
    else if (DIRS[name] && now >= due) { held.set(name, now + REPEAT_MS); act(name); } // a held direction repeats, as a held arrow key does
  }
  requestAnimationFrame(poll);
}
function start() { if (running) return; running = true; held.clear(); requestAnimationFrame(poll); }
export function initPad() {
  window.addEventListener('gamepadconnected', start);
  if (connected().length) start();
}
