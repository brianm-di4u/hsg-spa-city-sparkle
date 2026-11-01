// Loads the art packs (assets/art-*.js, classic scripts of data URIs: file:// safe, never taint WebGL) on demand.
// Board sprites become Pixi textures; paintings stay as data URIs for the DOM, and backdrops also become
// textures. `busy()` feeds isIdle(), so screenshots never catch a half-loaded screen.
import { ART } from './art-list.js';
import { VIEW, setTextures } from './view/stage.js';
import { ICON_IMAGES } from './view/vector-art.js';

const ST = { loading: 0, loaded: new Set(), pending: new Map(), off: false };
export const artBusy = () => ST.loading > 0;
export function disableArt() { ST.off = true; }

export function ensurePack(key) {
  if (ST.off || !ART.packs || !ART.packs[key]) return Promise.resolve(false);
  if (ST.loaded.has(key)) return Promise.resolve(true);
  if (ST.pending.has(key)) return ST.pending.get(key);
  ST.loading++;
  const pack = ART.packs[key];
  const p = new Promise((resolve) => {
    const sc = document.createElement('script');
    sc.src = `${pack.file}?v=${pack.v}`;
    sc.onload = async () => {
      const data = (window.SCS_ART || {})[key] || { textures: {}, paintings: {} };
      const tex = {};
      const decode = async (name, uri) => { const img = new Image(); img.src = uri; try { await img.decode(); tex[name] = img; } catch (_) { /* keep the fallback */ } };
      await Promise.all(Object.entries(data.textures).map(([n, u]) => decode(n, u)));
      for (const [n, u] of Object.entries(data.paintings)) {
        VIEW.paintings[n] = u;
        if (/^bg/.test(n)) await decode(n, u);
      }
      for (const [n, img] of Object.entries(tex)) ICON_IMAGES[n] = img;
      if (Object.keys(tex).length) {
        setTextures(tex);
        for (const n of Object.keys(tex)) VIEW.artNames.add(n);
        if (key === 'core') VIEW.artSource = 'art';
      }
      ST.loaded.add(key); ST.loading--; ST.pending.delete(key);
      resolve(true);
    };
    sc.onerror = () => { ST.loading--; ST.pending.delete(key); resolve(false); };
    document.head.appendChild(sc);
  });
  ST.pending.set(key, p);
  return p;
}
