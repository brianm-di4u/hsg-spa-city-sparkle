# Judge ruling: loop 1

**Total 48.0/80 (6.0/10). Verdict: continue.** That is up from 45.5 in loop 0. The critics totalled 47.5 (Claude) and 51.0 (Codex). Only authenticity meets its gate.

Measured gates: tests are green (93/93), and perf and ip pass. Both critics call IP clean, and I agree: the horseshoe, fan, teardrop, flower, amethyst and pine set, the special names and the postcard UI are original.

Capture-setup note: the win (r13) and lose (r14) dialogs are forced through test hooks, and the strips replay the last move. So I treat these as **one shared defect**, not several:
- the stale HUD values around those frames (17 moves under "Out of moves", 22 horseshoes left under "cleared!");
- the strip score already reading 540 or 660 in frame 1.

The star-bar mapping is a different matter. It is wrong in ordinary level captures as well:
- `mobile/r03-world1`: 2,160 of 9,840 shows an empty bar, with all stars bunched at the right end.
- `desktop/r10-stone-fire`: 6,900 of 12,000 shows an almost full bar.

I keep that as a real UI and readability bug and fold it into the same gap.

## Prosecute, then defend

**critic-claude (47.5)**
- **Over-scored?** Hardly anywhere. Its one inflated point is authenticity at 6.5: it penalised the Pamukkale-style terraces on the title and map but still gave the same score as Codex. The case for over-penalising is in animation. Its "score credited before the effect" and "moves stay at 19" complaints come from the strip replay artifact (`strips/mobile-s1`), so that complaint is dropped.
- **Under-scored?** Animation at 5.5 undersells `strips/mobile-s1` and `strips/mobile-s2`:
  - a readable beam with a bright core, sparkles and a floater;
  - a ring on the new special;
  - the column-wide star burst for Crystal;
  - a staggered refill.

  That is clearly past the 5 anchor ("clears just vanish"). Its "desktop board y=32–765" note is true of `desktop/r05-world3` but not of `desktop/r10-stone-fire`, where the board starts at about y=90.

**critic-codex (51.0)**
- **Over-scored?** Yes, in four places. It never mentions:
  - the weak specials: Hot Stone is a dashed ring around a normal amethyst (`desktop/r10-stone-fire`), and Cascade is two tiny cyan nubs (`mobile/s1-7`);
  - the half-size pine, which is green on green cells (`mobile/s1-7`, top row);
  - the star-bar mapping bug (`mobile/r03-world1`, `mobile/r09-cascade-fire`).

  It also grades typography at 6.5 while seeing ellipses on every header (`mobile/r04-world2`, `mobile/r14-lose`). Its UI, readability and mobile scores of 6–6.5 each miss one concrete defect that Claude documented.
- **Under-scored?** Little. It rightly credits the composed causal sequence in `strips/mobile-s2` and the cohesive cream and teal dialog family (`mobile/r16-help`, `mobile/r14-lose`).

No category differs by more than 1.0. Animation differs by exactly 1.0, and I checked it against the strips below.

## Category rulings

**Art: 6.0** (Claude 6.0, Codex 6.5)
- **Pieces.** The plain pieces are glossy and distinct in silhouette (`mobile/r03-world1`).
- **Specials** are still decorated plain pieces:
  - Hot Stone is a thin dashed ring around an amethyst (`desktop/r10-stone-fire`, centre).
  - Cascade is a flower or amethyst with small cyan arrows (`desktop/r12-callout`, `mobile/s1-7`).
- **Pine.** It is drawn at about half the width of the other pieces (`mobile/s1-7`, top row).
- **Blockers** are mixed:
  - The chains have metal identity (`desktop/r05-world3`).
  - Tufa is a brown lump with three studs.
  - Moss is a cluster of green grapes, and crust is a pale tile (`mobile/r08-world6`).
- **Paintings** are polished but live in a different world from the flat dark cells (`desktop/r01-title`).
- **Who was right.** Claude. The specials alone hold this below 6.5.

**Rendering and lighting: 6.0** (both 6.0)
- **What works.** The effects are additive and soft: the orange shockwave ring in `desktop/r10-stone-fire` and the beam core in `mobile/r09-cascade-fire`. Cell tints change per world.
- **What doesn't:**
  - Every cell carries a stray light-grey bar along its top edge. It is very visible on the navy cells in `desktop/r05-world3`.
  - The frame is a thin gold line, and the cast shadow is barely visible on bright backdrops (`mobile/r03-world1`).
  - The desktop W3 board nearly touches the top and bottom edges (`desktop/r05-world3`).
  - Nothing in the scene's light responds to events.

**Animation and game feel: 6.0** (Claude 5.5, Codex 6.5)
- **What the strips show.** In `strips/mobile-s1` you can follow every step: swap, beam with sparkles and a floater, emptied row with a ring on the new special, staggered fall. In `strips/mobile-s2` and `strips/desktop-s2`, the targeted purples puff, then a radial star burst fires, then the board falls and refills.
- **What is missing.** These 7-anchor items are not visible:
  - the swap overshoot, absent across `strips/mobile-s1` frames 1–2;
  - any landing squash: the pieces mid-fall in `mobile/s1-7` are undeformed;
  - any shake;
  - any chain callout: `desktop/r12-callout` shows only a "+540" floater.
- **Who was right.** The truth sits between them. The HUD-timing complaint is the shared capture artifact and is dropped.

**UI / HUD and menus: 5.5** (Claude 5.5, Codex 6.0)
- **The theme is consistent:** cream postcard dialogs with teal and gold buttons (`mobile/r14-lose`, `mobile/r16-help`).
- **Defects:**
  - **Map card.** It is hidden under the solid header on every map screen. Its title ghosts behind the star pill (`mobile/r02-map`, `desktop/r02-map`, `mobile/r16-help`).
  - **Star bar.** It does not track the score: empty at 2,160 (`mobile/r03-world1`), full at 540 of 12,000 (`mobile/r09-cascade-fire`), with stars bunched together.
  - **Desktop map.** Half the screen is flat green dead space (`desktop/r02-map`).
  - **Win dialog.** "Map" sits orphaned on its own row (`mobile/r13-win`).
  - **Focus rings.** A browser-blue ring shows on primary buttons. On the Help tabs, "Basics" wears the ring while "Specials" is the selected tab, which reads as two active states (`mobile/r16-help`).
  - **Help** is text only, with no sprites (`mobile/r16-help`).
  - **Stale HUD.** The win and lose frames show stale values. This counts once, as the shared defect.
- **Who was right.** Claude.

**Typography: 6.0** (Claude 6.0, Codex 6.5)
- **What works.** The display face plus UI face pairing is good, and the numerals read instantly (`mobile/r03-world1` "14 MOVES", "2,160").
- **Truncation is everywhere:**
  - "WORLD 1 · BATHHO…" (`mobile/r03-world1`);
  - "WORLD 2 · THE MOU…" (`mobile/r04-world2`);
  - "3. Tufa Terrace …" (`mobile/r14-lose`);
  - "WORLD 6 · GARVAN …" (`mobile/r08-world6`).
- **Breaks and overprints:**
  - "+5 / Moves" breaks across lines (`mobile/r13-win`).
  - The map card title is overprinted by the header (`mobile/r02-map`).
- **Who was right.** Claude.

**Readability: 6.0** (Claude 6.0, Codex 6.5)
- **What works.** Five kinds separate by shape and colour at phone size (`mobile/r03-world1`). The HUD goal icons are drawn from the board sprites (`mobile/r08-world6`).
- **What doesn't:**
  - **Pine.** It is small and green on green cells (`mobile/s1-7`).
  - **Specials** don't pop at a glance (`desktop/r12-callout`).
  - **Crust** reads as a selection highlight: a pale tile with a dark inner square (`mobile/r08-world6`, `mobile/r04-world2`).
  - **Steam** is a set of bright glowing spiral discs that look like power-ups (`mobile/r17-tip`).
  - **Star bar.** It misreports progress (see UI).

**Mobile: 6.0** (Claude 6.0, Codex 6.5)
- **What works.** The board spans the width, the HUD is one compact band, five goal pills fit on one row (`mobile/r08-world6`), and the tray is thumb-reachable.
- **What doesn't:**
  - **Wasted gap.** About 120 CSS px sits between the board and the tray, against only about 8 px side gutters (`mobile/r03-world1`, `mobile/r04-world2`).
  - **Tip covers the tray.** The portrait tip docks over the booster tray: Della covers the Hammer button and its red badge pokes through (`mobile/r17-tip`).
  - **Map card clipped** under the header (`mobile/r02-map`).
- **Who was right.** Claude. The tip overlap is a direct "nothing covered" failure.

**Authenticity: 6.5** (both 6.5; gate met)
- **What works:**
  - the tiled dome and Bathhouse Row (`desktop/r01-title`, `mobile/r03-world1`);
  - Arlington-style twin towers on a wet Central Avenue at night (`desktop/r05-world3`, `mobile/r17-tip`);
  - the Mountain Tower and the Garvan-style chapel and stone bridge (`mobile/r02-map`, `mobile/r08-world6`);
  - the sourced Fordyce card (`mobile/r13-win`);
  - Della, who is respectful and labelled "fictional" (`mobile/r17-tip`).
- **Penalty.** The title and map still show monumental stepped terraces with turquoise pools and waterfalls (`desktop/r01-title` right side, `desktop/r02-map`). Even the drabber W2 backdrop keeps the waterfall-terrace composition (`mobile/r04-world2`).

## Ranked gaps (gain ÷ effort, top 10)

1. **G-hud-state** (ui, sev 4, S, +0.5)
   - Star-bar fill must equal score ÷ the 3-star threshold, clamped to 0–1, with each star marker at its own threshold ratio and at least 1 star-width apart.
   - The seeded win and lose states and the strip replays must reset the HUD to the shown state: moves 0 on a loss, goals at 0 or ticked on a win, and the score at its pre-move value in strip frame 1.
   - Test: in `mobile/r03`, a 2,160/9,840 bar is filled 20–25%; `r09`, `r10`, `r13` and `r14` are consistent.
2. **G-map-header** (ui, sev 4, S, +0.5)
   - Offset the map scroll content and world card by the header height (64 px CSS), so the card title is fully visible in `r02`, `r15` and `r16`.
   - Fill the desktop side gutters with a blurred, darkened extension of the map art.
3. **G-tip-dock** (mobile, sev 3, S, +0.5)
   - In portrait, dock the tutorial tip in the gap between board and tray, with a max height equal to that gap, and never overlap the booster buttons.
   - When no tip is shown, use the space to enlarge the board by about 8%, cutting the board-to-tray gap to 40 CSS px or less.
   - Test: in `mobile/r17`, all four tray buttons are fully visible.
4. **G-specials-identity** (art, sev 4, M, +1.0)
   - Re-render Cascade with contrasting fins or stripes that cover at least 35% of the cell.
   - Replace the Hot Stone dashed ring with a glowing ember-red basalt stone sprite.
   - Test: each special is identifiable in `mobile/r03` and `desktop/r10` with its glow halo disabled.
5. **G-callout-shake-squash** (animation, sev 4, M, +1.0)
   - On a chain of 2 or more, or when a special fires, show a display-face banner ("Chain ×2", "Cascade!") that scales 0 → 1.15 → 1 over 250 ms, plus a 4–8 px screen shake for 150 ms.
   - Exaggerate the landing squash to scaleY 0.8 and scaleX 1.15 for 80 ms, and the swap overshoot to at least 12% of a cell.
   - Capture the strips at intervals of 50 ms or less around the swap and the landing.
   - Test: `r12` shows a banner, and a strip frame shows visible squash.
6. **G-label-fit** (typography, sev 3, S, +0.5)
   - On mobile, drop the "WORLD n ·" prefix from the HUD, or fit-shrink it to a minimum of 18 px CSS before any ellipsis.
   - Join "+5 Moves" with a non-breaking space.
   - Test: no ellipsis appears in any of `mobile/r03`–`r08` or `r14`.
7. **G-pine-piece** (readability, sev 3, S, +0.5)
   - Scale the pine sprite so its width is within 10% of the flower's.
   - Lighten it to a warm yellow-green, or add a gold star ornament, so it separates from the green W1 and W6 cells.
8. **G-cell-strip-seating** (rendering, sev 3, S, +0.5)
   - Remove the light-grey top bar from the cell texture.
   - Thicken the frame to about 10 px with a bevel and a warm rim light.
   - Raise the cast-shadow opacity until it is visible on `mobile/r03`.
   - Give the desktop board at least a 48 px top and bottom margin (`desktop/r05`).
9. **G-help-results** (ui, sev 2, S, +0.3)
   - Show each special's actual sprite beside its Help bullet.
   - Put Next level, Replay and Map on one row.
   - Replace the browser-blue focus ring with a 3 px gold glow, shown only on keyboard focus (`:focus-visible`).
10. **G-blocker-language** (readability, sev 3, M, +0.5)
    - Render crust as faceted grey-white mineral shards on the cell rim instead of a pale tile.
    - Render steam as a soft translucent grey vapour at 60% opacity or less, with no bright core or spiral.
    - Draw goal icons with alpha only and no square backing.
    - Test: in `mobile/r08` and `r15`, the crust HUD icon matches the board crust.

Also noted, but outside the top 10 by gain ÷ effort:
- Repaint the title and map terraces as low grey-tan tufa mounds without the turquoise waterfall tiers (authenticity, M).
- Use per-world cell materials so board and painting share one art direction (art, L).

```json
{
  "loop": 1,
  "role": "judge",
  "scores": {
    "art": { "score": 6.0, "confidence": 0.8, "evidence": ["desktop/r10-stone-fire", "desktop/r12-callout", "mobile/s1-7", "mobile/r08-world6", "desktop/r05-world3", "desktop/r01-title"] },
    "rendering": { "score": 6.0, "confidence": 0.8, "evidence": ["desktop/r05-world3", "desktop/r10-stone-fire", "mobile/r09-cascade-fire", "mobile/r03-world1"] },
    "animation": { "score": 6.0, "confidence": 0.7, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "strips/desktop-s2", "mobile/s1-7", "desktop/r12-callout"] },
    "ui": { "score": 5.5, "confidence": 0.8, "evidence": ["mobile/r02-map", "desktop/r02-map", "mobile/r03-world1", "mobile/r09-cascade-fire", "mobile/r13-win", "mobile/r16-help"] },
    "typography": { "score": 6.0, "confidence": 0.8, "evidence": ["mobile/r03-world1", "mobile/r04-world2", "mobile/r14-lose", "mobile/r08-world6", "mobile/r13-win", "mobile/r02-map"] },
    "readability": { "score": 6.0, "confidence": 0.75, "evidence": ["mobile/r03-world1", "mobile/s1-7", "mobile/r08-world6", "mobile/r04-world2", "mobile/r17-tip"] },
    "mobile": { "score": 6.0, "confidence": 0.8, "evidence": ["mobile/r03-world1", "mobile/r04-world2", "mobile/r08-world6", "mobile/r17-tip", "mobile/r02-map"] },
    "authenticity": { "score": 6.5, "confidence": 0.75, "evidence": ["desktop/r01-title", "desktop/r02-map", "mobile/r04-world2", "desktop/r05-world3", "mobile/r08-world6", "mobile/r13-win", "mobile/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Both critics and the judge find an original piece set, original special and blocker names, and an original postcard UI; nothing copied from commercial match-3 games." },
  "gaps": [
    { "id": "G-hud-state", "category": "ui", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r03-world1", "mobile/r09-cascade-fire", "desktop/r10-stone-fire", "mobile/r13-win", "mobile/r14-lose"], "fix": "Star-bar fill = score / 3-star threshold (clamped 0-1), each star marker at its threshold ratio and at least 1 star-width apart; seeded win/lose states and strip replays reset the HUD to the shown state (moves 0 on loss, goals 0/ticked on win, pre-move score in strip frame 1). Test: mobile/r03 2,160/9,840 bar filled 20-25%." },
    { "id": "G-map-header", "category": "ui", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r02-map", "desktop/r02-map", "mobile/r16-help"], "fix": "Offset the map scroll content and world card by the 64 px CSS header height so the card title is fully visible in r02/r15/r16; fill desktop side gutters with a blurred, darkened extension of the map art." },
    { "id": "G-tip-dock", "category": "mobile", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r17-tip", "mobile/r03-world1", "mobile/r04-world2"], "fix": "Dock the portrait tutorial tip in the board-tray gap (max height = gap) without overlapping booster buttons; with no tip, enlarge the board about 8% so the board-to-tray gap is 40 CSS px or less. Test: all four tray buttons fully visible in mobile/r17." },
    { "id": "G-specials-identity", "category": "art", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["desktop/r10-stone-fire", "desktop/r12-callout", "mobile/s1-7"], "fix": "Re-render Cascade with contrasting fins or stripes covering at least 35% of the cell; replace the Hot Stone dashed ring with a glowing ember-red basalt stone sprite. Test: each special identifiable in mobile/r03 and desktop/r10 with its glow halo disabled." },
    { "id": "G-callout-shake-squash", "category": "animation", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["desktop/r12-callout", "strips/mobile-s1", "strips/mobile-s2", "mobile/s1-7"], "fix": "Display-face banner scaling 0 to 1.15 to 1 over 250 ms on a chain of 2+ or a special firing, plus a 4-8 px screen shake for 150 ms; landing squash scaleY 0.8 / scaleX 1.15 for 80 ms; swap overshoot of at least 12% of a cell; capture strips at 50 ms or less around swap and landing. Test: r12 shows a banner, a strip frame shows squash." },
    { "id": "G-label-fit", "category": "typography", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r03-world1", "mobile/r04-world2", "mobile/r14-lose", "mobile/r13-win"], "fix": "Drop the 'WORLD n' prefix from the mobile HUD or fit-shrink to a minimum of 18 px CSS before ellipsis; join '+5 Moves' with a non-breaking space. Test: no ellipsis in mobile/r03-r08 or r14." },
    { "id": "G-pine-piece", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/s1-7", "strips/mobile-s1"], "fix": "Scale the pine sprite so its width is within 10% of the flower's, and lighten it to a warm yellow-green or add a gold star ornament so it separates from green W1/W6 cells." },
    { "id": "G-cell-strip-seating", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/r05-world3", "mobile/r03-world1"], "fix": "Remove the light-grey top bar from the cell texture; about 10 px beveled frame with a warm rim light; raise cast-shadow opacity until visible in mobile/r03; at least 48 px top and bottom margin for the desktop board." },
    { "id": "G-help-results", "category": "ui", "expectedGain": 0.3, "severity": 2, "effort": "S", "evidence": ["mobile/r16-help", "mobile/r13-win"], "fix": "Show each special's sprite beside its Help bullet; put Next level, Replay and Map on one row; replace the browser-blue focus ring with a 3 px gold glow shown only on :focus-visible." },
    { "id": "G-blocker-language", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/r08-world6", "mobile/r04-world2", "mobile/r17-tip"], "fix": "Crust as faceted grey-white mineral shards on the cell rim instead of a pale tile; steam as soft translucent grey vapour at 60% opacity or less with no bright core or spiral; goal icons alpha-only with no square backing. Test: crust HUD icon matches the board crust in mobile/r08 and r15." }
  ],
  "verdict": "continue"
}
```
