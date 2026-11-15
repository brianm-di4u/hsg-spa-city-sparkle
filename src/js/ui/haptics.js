// Haptics: a short buzz on a phone where navigator.vibrate exists. Pulses are 10 to 25 ms; nothing happens with reduced motion on or the
// Vibration switch off (it starts on for a touch screen and off for a mouse; the switch is in Settings).
import { SAVE } from './save.js';
import { VIEW } from '../view/stage.js';

export const PULSE = { match: 10, special: 20, fire: 25, refused: [12, 40, 12] };
export const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
export function haptic(pattern) {
  if (!pattern || !canVibrate() || !SAVE.settings.vibration || VIEW.reduced) return;
  try { navigator.vibrate(pattern); } catch (_) { /* a browser may refuse: no buzz is fine */ }
}
// The one pulse for a set of events (a beat, or the beats a skip collapses): the strongest thing that happened in them.
export function pulseFor(evs) {
  if (evs.some((e) => e.t === 'combo' || e.t === 'fire')) return PULSE.fire;
  if (evs.some((e) => e.t === 'special')) return PULSE.special;
  if (evs.some((e) => e.t === 'wave')) return PULSE.match;
  if (evs.some((e) => e.t === 'swapBack')) return PULSE.refused;
  return 0;
}
