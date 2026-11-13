// Council wave 1, batch C: screens, layout and words.
const inView = (t) => t.page.evaluate(() => {
  const W = window.innerWidth, H = window.innerHeight;
  return [...document.querySelectorAll('#screen button')].map((b) => { const r = b.getBoundingClientRect(); return { act: b.dataset.act, top: r.top, bottom: r.bottom, left: r.left, right: r.right, W, H }; });
});

export const tests = [
  {
    name: 'S3-23 phone landscape: every title button sits inside the viewport',
    async run(t) {
      for (const [w, h] of [[844, 390], [667, 375]]) {
        await t.page.setViewportSize({ width: w, height: h });
        await t.game('scene', 'title');
        await t.waitIdle();
        const bs = await inView(t);
        t.expect(bs.length >= 5, `title has its buttons at ${w}x${h}`);
        for (const b of bs) t.expect(b.top >= 0 && b.bottom <= h && b.left >= 0 && b.right <= w, `${b.act} inside ${w}x${h} (top ${Math.round(b.top)}, bottom ${Math.round(b.bottom)})`);
        const s = await t.page.evaluate(() => { const e = document.getElementById('screen'); return getComputedStyle(e).overflowY; });
        t.expect(s === 'auto', 'title screen scrolls if it ever overflows');
      }
    },
  },
];
