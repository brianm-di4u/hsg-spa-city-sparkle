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

// --- S4-09: Della's portrait on landscape screens -----------------------------------------------
tests.push({
  name: 'S4-09 Della is shown on the tip card in landscape, clear of the tray',
  viewports: ['desktop'],
  async run(t) {
    for (const [w, h] of [[1280, 800], [1024, 600], [844, 390]]) {
      await t.page.setViewportSize({ width: w, height: h });
      await t.game('newGame', { level: 'w1-01', seed: 3, tips: true });
      await t.waitIdle();
      const r = await t.page.evaluate(() => {
        const d = document.querySelector('#tip .della'), tip = document.getElementById('tip'), tray = document.getElementById('tray').getBoundingClientRect();
        if (!d) return null;
        const b = d.getBoundingClientRect(), tb = tip.getBoundingClientRect(), l = window.__game.getState().layout;
        return { right: b.right, shown: getComputedStyle(d).display !== 'none', w: b.width, h: b.height, art: d.style.backgroundImage !== '', tipBottom: tb.bottom, tipRight: tb.right, tipTop: tb.top, trayTop: tray.top, bx: l.bx, W: window.innerWidth, H: window.innerHeight };
      });
      const tag = `${w}x${h}`;
      await t.shot(`s4-09-${w}x${h}`);
      t.expect(!!r, `tip is open at ${tag}`);
      if (!r) continue;
      t.expect(r.art, `Della's painting loaded at ${tag}`);
      t.expect(r.shown && r.h >= 70 && r.w >= 40, `Della is visible (${Math.round(r.w)}x${Math.round(r.h)}) at ${tag}`);
      t.expect(r.right <= r.bx + 1, `Della stays off the board at ${tag}`);
      t.expect(r.tipBottom <= r.H && r.tipRight <= r.W, `tip card stays on screen at ${tag}`);
      if (h >= 800) t.expect(r.tipBottom <= r.trayTop, `tip card clear of the tray at ${tag}`);
    }
  },
});

// --- S4-12: drawn icons and an in-game Reset confirmation ----------------------------------------
tests.push({
  name: 'S4-12 map and title use drawn icons, not system glyphs',
  async run(t) {
    await t.game('act', 'progress', { 'w1-01': { stars: 2, best: 9000 } });
    await t.game('scene', 'map');
    await t.waitIdle();
    await t.shot('s4-12-map');
    const glyphs = /[⌂⚙★☆\u{1F512}]/u;
    const m = await t.page.evaluate(() => ({
      home: document.querySelector('.map-top [data-act="home"]').innerHTML, gear: document.querySelector('.map-top [data-act="settings"]').innerHTML,
      totals: document.querySelector('.map-top .totals').innerHTML, stars: document.querySelector('.node .stars').innerHTML,
      count: document.querySelectorAll('.node .stars svg').length,
    }));
    for (const k of ['home', 'gear', 'totals', 'stars']) t.expect(m[k].includes('<svg') && !glyphs.test(m[k]), `map ${k} is an SVG icon`);
    t.equal(m.count, 3, 'node shows three star icons');
    await t.game('scene', 'title');
    await t.waitIdle();
    const lock = await t.page.locator('#screen [data-act="soak"]').innerHTML();
    t.expect(lock.includes('<svg') && !glyphs.test(lock), 'Free Soak padlock is an SVG icon');
  },
});
tests.push({
  name: 'S4-12 Reset asks in an in-game card with Keep as the default, not a browser dialog',
  async run(t) {
    let native = 0;
    t.page.on('dialog', (d) => { native++; d.accept(); });
    await t.game('act', 'progress', { 'w1-01': { stars: 2, best: 9000 } });
    await t.game('scene', 'map');
    await t.waitIdle();
    const gear = t.page.locator('.map-top [data-act="settings"]');
    const open = async () => { await gear.click(); await t.waitIdle(); await t.page.locator('#modal [data-act="reset"]').click(); await t.waitIdle(); };
    await open();
    t.equal(native, 0, 'no native confirm dialog');
    const card = await t.page.locator('#modal').innerText();
    t.expect(/Keep/.test(card) && /Erase/.test(card), 'card offers Keep and Erase');
    t.equal(await t.page.evaluate(() => document.activeElement.textContent.trim()), 'Keep', 'Keep has focus');
    await t.page.keyboard.press('Escape');
    await t.waitIdle();
    t.equal(await t.page.locator('#modal h2').innerText(), 'Settings', 'Esc keeps and returns to Settings');
    t.equal(Object.keys((await t.state()).progress).length, 1, 'progress untouched after Keep');
    await t.page.locator('#modal [data-act="reset"]').click();
    await t.waitIdle();
    await t.page.locator('#modal [data-act="erase"]').click();
    await t.waitIdle();
    t.equal(Object.keys((await t.state()).progress).length, 0, 'Erase clears progress');
    t.equal(await t.page.locator('#modal h2').innerText(), 'Settings', 'back in Settings after Erase');
    await t.page.locator('#modal [data-act="close"]').click();
    await t.waitIdle();
    t.equal((await t.state()).scene, 'map', 'Done returns to the map');
    t.equal(native, 0, 'still no native dialog');
  },
});

// --- S6-10: dialogs size to the visible viewport on phones with a dynamic toolbar -----------------
tests.push({
  name: 'S6-10 dialog height uses dvh, with vh kept as the fallback before it',
  async run(t) {
    const css = await t.page.evaluate(() => [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n'));
    const rule = (css.match(/\.modal \.card\s*\{[^}]*\}/) || [''])[0];
    const vh = rule.indexOf('max-height: calc(100vh - 32px)'), dvh = rule.indexOf('max-height: calc(100dvh - 32px)');
    t.expect(vh >= 0, 'vh fallback is declared');
    t.expect(dvh > vh, 'dvh declaration comes after the fallback');
    await t.game('scene', 'help');
    await t.waitIdle();
    const fits = await t.page.evaluate(() => document.querySelector('#modal .card').getBoundingClientRect().bottom <= window.innerHeight);
    t.expect(fits, 'the help card stays inside the visible height');
  },
});
