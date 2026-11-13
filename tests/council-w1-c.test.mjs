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

// --- P-N01: phone landscape HUD, tray and board must not overlap ---------------------------------
const overlap = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
tests.push({
  name: 'P-N01 phone landscape: HUD, booster tray and board do not overlap',
  async run(t) {
    for (const [w, h] of [[844, 390], [667, 375]]) {
      await t.page.setViewportSize({ width: w, height: h });
      for (const level of ['w1-01', 'w6-10', 'w6-07']) {
        await t.game('newGame', { level, seed: 3, tips: false });
        await t.waitIdle();
        const r = await t.page.evaluate(() => {
          const box = (el) => { const b = el.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom }; };
          const hud = document.getElementById('hud'), tray = document.getElementById('tray');
          const l = window.__game.getState().layout;
          const kids = [...hud.querySelectorAll('.hud-level, .hud-moves, .hud-goals, .hud-score')].map(box);
          return { hud: box(hud), tray: box(tray), board: { left: l.bx, top: l.by, right: l.bx + l.cell * l.cols, bottom: l.by + l.cell * l.rows }, cell: l.cell, kids, H: window.innerHeight, W: window.innerWidth, boosters: [...document.querySelectorAll('.booster')].map((b) => b.getBoundingClientRect().height) };
        });
        const tag = `${level} at ${w}x${h}`;
        t.expect(!overlap(r.hud, r.tray), `HUD and tray apart, ${tag} (hud bottom ${Math.round(r.hud.bottom)}, tray top ${Math.round(r.tray.top)})`);
        t.expect(!overlap(r.hud, r.board) && !overlap(r.tray, r.board), `board clear of HUD and tray, ${tag}`);
        t.expect(r.hud.top >= 0 && r.tray.bottom <= r.H && r.board.bottom <= r.H && r.board.right <= r.W, `everything on screen, ${tag}`);
        for (const k of r.kids) t.expect(k.bottom <= r.hud.bottom + 1, `HUD content stays inside its panel, ${tag}`);
        t.expect(r.cell >= 38, `cells stay playable (${r.cell}px), ${tag}`);
        t.expect(r.boosters.every((x) => x >= 44), `booster buttons stay 44px or more, ${tag}`);
        if (level === 'w6-10' && w === 844) await t.shot('p-n01-landscape-hud');
      }
    }
  },
});

// --- S2-04: a locked Free Soak explains itself ---------------------------------------------------
tests.push({
  name: 'S2-04 locked Free Soak says why and answers a tap',
  async run(t) {
    await t.game('scene', 'title');
    await t.waitIdle();
    const soak = t.page.locator('#screen [data-act="soak"]');
    t.equal(await soak.getAttribute('aria-disabled'), 'true', 'announced as unavailable');
    t.expect(await soak.evaluate((b) => !b.disabled), 'still a live button, so the tap is answered');
    t.expect(/Bathhouse Row/.test(await t.page.locator('#screen .menu-note').innerText()), 'subtitle names what unlocks it');
    await soak.click({ force: true });
    t.expect(/Bathhouse Row/.test(await t.page.locator('#toast').innerText()), 'tap shows the unlock hint');
    t.equal((await t.state()).scene, 'title', 'stays on the title');
  },
});
