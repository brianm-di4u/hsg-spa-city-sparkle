// Council wave 3, batch B: saves, lifecycle and robustness; controls, rules and play
// (S4-11, S5-16, S1-05, S2-16, S3-04, S1-03, S2-19, S2-21).
// Nothing here depends on chance: every board is seeded and every wait is for a condition.
import assert from 'node:assert/strict';

const KEY = 'spa-city-sparkle:v1';
const stored = (t) => t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);

export const tests = [];

// --- S4-11: the map names the stop, each world's stops look different, and a wide window gets a wider map ---------------
async function mapAt(t, progress) {
  await t.game('act', 'progress', progress);
  await t.game('scene', 'map');
  await t.waitIdle();
}
tests.push({
  name: 'S4-11 the current stop shows its name, a hovered stop shows its own, and a locked stop shows none',
  async run(t) {
    await mapAt(t, { 'w1-01': { stars: 2, best: 1 } });
    const cur = t.page.locator('.node.current');
    const name = await cur.locator('.nname').innerText();
    t.equal(await cur.getAttribute('data-level'), 'w1-02', 'the current stop is the next one to play');
    t.expect(name.length > 3, `the current stop shows a name (${name})`);
    const box = await cur.locator('.nname').boundingBox();
    t.expect(box && box.x >= 0 && box.x + box.width <= t.vp.width && box.y >= 0, 'the name sits inside the screen');
    t.equal(await t.page.locator('.node:not(.current) .nname:visible').count(), 0, 'no other name is shown at rest');
    t.equal(await t.page.locator('.node[data-level="w1-03"] .nname').evaluate((e) => getComputedStyle(e).display), 'none', 'a locked stop gives nothing away');
    if (t.viewport === 'desktop') {
      await t.page.locator('.node[data-level="w1-01"]').hover({ force: true });
      const shown = await t.page.locator('.node[data-level="w1-01"] .nname').evaluate((e) => getComputedStyle(e).display);
      t.equal(shown, 'block', 'hovering a played stop shows its name');
    }
    t.equal(await cur.locator('.nname').getAttribute('aria-hidden'), 'true', 'the name is not read twice: the button already says it');
    await t.shot('S4-11-map-name');
  },
});
tests.push({
  name: 'S4-11 every world has its own node look, and the map is wider than before on a wide window',
  async run(t) {
    await t.game('act', 'progress', Object.fromEntries(Array.from({ length: 59 }, (_, i) => [`w${Math.floor(i / 10) + 1}-${String((i % 10) + 1).padStart(2, '0')}`, { stars: 1, best: 1 }])));
    await t.game('scene', 'map');
    await t.waitIdle();
    const looks = await t.page.evaluate(() => [1, 2, 3, 4, 5, 6].map((w) => { const c = getComputedStyle(document.querySelector(`.node[data-w="${w}"]`)); return c.backgroundImage + '|' + c.borderRadius + '|' + c.borderColor; }));
    t.equal(new Set(looks).size, 6, 'six different looks');
    const width = await t.page.locator('.map-canvas').evaluate((e) => e.getBoundingClientRect().width);
    t.equal(width, Math.min(1000, t.vp.width), 'the map is as wide as the window up to 1000 px (it was 820)');
    await t.page.evaluate(() => document.querySelector('.node[data-w="3"]').scrollIntoView({ block: 'center' }));
    await t.shot('S4-11-map-skins');
  },
});

