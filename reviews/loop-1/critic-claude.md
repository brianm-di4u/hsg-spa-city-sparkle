# Critic A (critic-claude): loop 1

## Verdict

Spa City Sparkle has lovely, specific Hot Springs paintings. The board sitting in front of them is competent but generic, and the captures show a string of state and layout bugs that a genre leader would never ship. The bugs:
- The map's world card is hidden behind the header on every map screen.
- The star bar is full at 540 of 12,000 and empty at 2,160, with stars stacked on top of each other.
- The "Out of moves" dialog sits over a HUD that still shows 17 moves.
- The win screen still lists 22 horseshoes left to collect.
- On phone, the tutorial tip covers the booster tray.

The piece set is clean Blender work with distinct silhouettes. The specials are still only lightly decorated plain pieces: tiny cyan fins for Cascade, and a thin dashed ring for Hot Stone. The sixth piece, a pine tree, is half-size and green on green cells. In motion the strips show a swap, a bright beam, a clear and a refill. There is no chain callout in the callout capture, no visible shake, and the HUD score is credited before the effect fires. It is better than a browser toy and still short of the 7 gates in every category except authenticity. Total: 47.5/80. Verdict: continue.

## Scores

### Art: 6.0
- **Pieces.** The pieces are tidy, glossy renders with clear silhouettes: horseshoe, fan, teardrop, flower, amethyst and pine (zoom of `desktop/r05-world3`). But they read as stock icons. The fan has a crude flat orange block for a handle. The pine is drawn at about 55% of the other pieces' width (`mobile/s2-8`, `strips/mobile-s1` frames 7–8).
- **Specials** are barely special:
  - The Cascade special is a normal amethyst with two small cyan nubs and a glow (`desktop/r03-world1` row 4, `mobile/s1-7`).
  - The Hot Stone special is a thin brown ring with yellow dashes drawn around an ordinary piece (`desktop/r10-stone-fire` centre, `desktop/r05-world3` row 4). It looks nothing like a hot stone.
- **Blockers** are mixed:
  - The brass and steel chain-and-padlock X has real material identity (`mobile/r05-world3`).
  - The tufa stone is a brown blob with three rivets: fine.
  - The new mineral crust reads as a pale mint highlighted tile with a dark square cut-out behind some pieces, not as crystal (`mobile/r07-world5`, `mobile/r08-world6`).
  - The moss looks like a bunch of green grapes.
- **Paintings** are polished, warm and detailed (`desktop/r01-title`, `mobile/r08-world6`, `desktop/r02-map`). But the board's flat dark cells don't share their painterly language, so they read as two art directions.

### Rendering and lighting: 6.0
- **What works:**
  - Cell colour is tinted per world: teal for W2, navy for W3/W5, green for W1/W6 (`desktop/r04-world2`, `desktop/r05-world3`).
  - Pieces carry soft drop shadows.
  - The effects are additive and soft: the crystal rays in `desktop/r11-crystal-rays` and the orange shockwave ring in `desktop/r10-stone-fire` are good.
- **Board seating** is weak:
  - The frame is a thin gold line.
  - The new cast shadow is nearly invisible against the busy paintings (`desktop/r03-world1`, `mobile/r03-world1`).
  - On desktop the board runs from about y=32 to y=765 of 800, crammed against the top edge (`desktop/r03-world1`, `desktop/r05-world3`).
- **Cell artifact:** every cell has a stray light-grey bar along its top edge, which looks like an empty label slot. It is very visible on the navy W3 cells (`desktop/r05-world3`, `desktop/r17-tip`).
- **Beam overshoot:** the Cascade beam runs past the board frame into the backdrop and off-screen (`mobile/s1-3`, `desktop/r09-cascade-fire`).
- **Light:** no light in the scene responds to events.

### Animation and game feel: 5.5
- **What the strips show:**
  - `strips/mobile-s1` and `strips/desktop-s1` show a swap (frames 1–2), then a white beam with sparkles and a +540 floater (3–4). The row empties with a ring on the new special (5), the board is briefly empty (6), and pieces drop in staggered (7–8).
  - `strips/mobile-s2` shows the purple pieces puffing white (frame 2), a star-burst of rays (3–4), a column-wide fall (6) and a refill (7–8).
  - The effects can be followed and are reasonably juicy.
- **What is missing or wrong:**
  - **No overshoot or squash:** across 8 frames neither the swap overshoot nor the landing squash is legible. Frame 7 of s1 shows pieces mid-fall with no deformation.
  - **No callout:** `mobile/r12-callout` and `desktop/r12-callout` show only a +540 floater, with no chain banner or callout.
  - **No shake:** no screen shake is visible.
  - **HUD frozen:** in all 16 strip frames the score already reads 540 and 660 at frame 1, and moves stay at 19. Score lands before the effect, and the claimed HUD pulse can't be seen.
  - **Specials appear without fanfare:** they just show up (`mobile/s1-7`).

### UI / HUD and menus: 5.5
- **The theme is consistent:** a gold moves medallion, cream postcard-style dialogs and teal/gold pill buttons (`mobile/r13-win`, `mobile/r15-intro`, `mobile/r16-help`).
- **Defects:**
  - **Map card hidden:** the world card is hidden under the solid header bar. The title ("…al Avenue Night", "…Springs Mountain") ghosts behind the header and the star pill (`mobile/r02-map`, `mobile/r15-intro`, `mobile/r16-help`, `desktop/r02-map`).
  - **Star bar:** it is fully filled at 540 with a 12,000 target and only one star visible (`mobile/s1-3`, `mobile/r09-cascade-fire`). It is empty at 2,160 with two stars overlapping each other (`mobile/r03-world1`).
  - **Lose dialog:** "Out of moves" and "So close!" over a HUD showing 17 moves and a score of 0 (`mobile/r14-lose`, `desktop/r14-lose`).
  - **Win dialog:** the HUD still shows 22 horseshoes outstanding (`mobile/r13-win`). "Map" is orphaned on its own row under Next level and Replay.
  - **Goal icons:** the HUD and intro goal icons carry square background crops. The tufa icon sits in a pale box, and crust is a flat teal square (`mobile/r15-intro`, `mobile/r04-world2`).
  - **Desktop map:** half the screen is flat green dead space (`desktop/r02-map`).
  - **Focus ring:** the Play and primary buttons wear a blue focus ring that looks like a browser default (`mobile/r01-title`, `mobile/r14-lose`).

### Typography: 6.0
- **What works:**
  - A rounded display face plus a humanist UI face, in a sensible scale.
  - Numerals are heavy and read instantly (the 32 MOVES medallion and 4,300 in `mobile/r05-world3`).
  - The fact card is set cleanly (`mobile/r13-win`).
- **Truncation is everywhere:** "WORLD 1 · BATHHO…", "WORLD 2 · THE MOU…", "3. Tufa Terrace …", "7. Three Sisters …", "1. Magnolia Pro…" (`mobile/r14-lose`, `mobile/r07-world5`, `mobile/r12-callout`, `desktop/r07-world5`).
- **Title lock-up:** the letter-spaced "HOT SPRINGS · ARKANSAS" sits tight under "Sparkle", in low-contrast gold over a bright sky (`mobile/r01-title`, `desktop/r01-title`).
- **Orphans and overlaps:**
  - The win copy breaks with "Moves" alone on a line (`mobile/r13-win`).
  - The map card title is overprinted by the header (`mobile/r02-map`).

### Readability: 6.0
- **Silhouettes are distinct** at phone size for five kinds (`mobile/r03-world1`). Fan and flower are both warm coral and pink, but their shapes carry them.
- **The pine** is small, thin, and green on green W1/W6 cells, the weakest read on the board (`mobile/s2-8`, `strips/mobile-s1` frame 8).
- **Specials don't pop** at a glance (see Art).
- **Crust** is easily mistaken for a selection highlight. Its HUD icon, a flat dark-teal square, doesn't match the pale rimmed tile on the board (`mobile/r08-world6`, `mobile/r07-world5`).
- **Tufa stones** are dark brown on dark navy, with low contrast (`mobile/r05-world3`).
- **Chains** are busy but the pieces under them stay identifiable.
- **Steam** reads as opaque white glowing discs; that is intended concealment, but the effect is heavy (`desktop/r17-tip`).
- **Star bar** errors make progress unreadable (see UI).

### Mobile: 6.0
- **What works:**
  - The board spans the width.
  - The HUD is compact in one band: a medallion, name, goal pills and score. Even five goal pills fit (`mobile/r08-world6`).
  - The booster tray sits at the thumb, with targets about 64 px wide.
- **Wasted space:** about 125 CSS px sits between the board's bottom and the tray, while the board has only about 8 px side gutters (`mobile/r03-world1`, `mobile/r04-world2`, `mobile/r07-world5`).
- **Tip covers the tray:** the portrait tip docks on top of the booster tray. Della and the card overlap the Hammer button, and its red "1" badge pokes through (`mobile/r17-tip`).
- **Map card clipped** under the header (`mobile/r02-map`).
- **Dialogs** fit without clipping (`mobile/r16-help`).

### Authenticity: 6.5
- **Strong, specific landmarks:**
  - The Quapaw-style tiled dome and Bathhouse Row glass marquees (`desktop/r01-title`, `desktop/r03-world1`).
  - The Hot Springs Mountain Tower (`mobile/r02-map`).
  - Arlington-style twin towers on a wet Central Avenue at night, with period cars (`mobile/r05-world3`).
  - An Oaklawn grandstand with racing (`mobile/r06-world4`).
  - A lake with a dam and a pontoon boat (`mobile/r07-world5`).
  - A glass Anthony-style chapel and a stone bridge for Garvan (`mobile/r08-world6`).
  - A sourced Fordyce fact card (`mobile/r13-win`).
- **Della** is a respectful, non-caricatured period attendant (`desktop/r17-tip`).
- **Penalty:** the title paintings and the map still show cream-white stepped terraces with turquoise pools and waterfalls, which is Pamukkale, not Hot Springs' modest grey tufa (`desktop/r01-title` right side, `mobile/r01-title`, `desktop/r02-map`, `mobile/r02-map`). The W2 level backdrop is now drabber (`desktop/r04-world2`), but the first screens a player sees still carry the error.

## IP check

Clean. The pieces (horseshoe, fan, teardrop, flower, amethyst, pine), the blockers, the names (Cascade, Hot Stone, Spring Crystal, Free Soak) and the cream postcard UI are original. Nothing copies a commercial match-3 game's logo, piece designs or layout beyond generic genre conventions.

## Ranked gaps

1. **G-hud-state-bugs** (ui, sev 4, S, +1.0)
   - Make star-bar fill equal score ÷ the 3-star threshold, place each star at its threshold ratio, and keep at least 1 star-width between stars.
   - Seeded win and lose captures must show a consistent HUD: goals ticked or zero on a win, moves 0 on a loss.
   - Test: `r09`, `r03`, `r13` and `r14` show bars proportional to their scores, with no overlapping stars.
2. **G-specials-identity** (art, sev 4, M, +1.0)
   - Model specials as distinct objects rather than decorated pieces:
     - Cascade: a striped or arrowed piece with fins at least 35% of the cell, contrasting with the base colour.
     - Hot Stone: a glowing ember-red basalt stone with heat shimmer, replacing the dashed ring.
   - Test: in `mobile/r03` and `desktop/r10`, a special is identifiable in under 1 s without the glow.
3. **G-callout-shake-score-timing** (animation, sev 4, M, +1.0)
   - On a chain of 2 or more, or when a special fires, show a display-face callout that scales 0→1.15→1 over 250 ms, plus a screen shake of 4–8 px for 150 ms.
   - Credit the HUD score when floaters land, with a count-up, not before the effect.
   - Test: `r12` shows a banner; strip frames show the score rising between frames 3 and 6.
4. **G-map-header-overlap** (ui, sev 4, S, +0.5)
   - Offset the map scroll content and world card by the header height (about 64 px desktop, 128 px at 2×). Fill the desktop side gutters with a blurred, darkened extension of the map art.
   - Test: in `r02`, `r15` and `r16` the card title is fully visible.
5. **G-pine-piece** (readability, sev 3, S, +0.5)
   - Scale the pine to the same 1.1× cell bounding box as the other pieces, and give it a lighter, warmer green or a gold star ornament so it separates from green cells.
   - Test: its width is within 10% of the flower's.
6. **G-cell-strip-and-seating** (rendering, sev 3, S, +0.5)
   - Remove the grey top strip in each cell texture.
   - Thicken the frame to about 10 px with a bevel and a warm rim light.
   - Raise cast-shadow opacity until it is visible on bright backdrops.
   - Give the desktop board a top margin of at least 48 px.
   - Test: zoom on the `desktop/r05` cells shows no bar.
7. **G-tip-covers-tray** (mobile, sev 3, S, +0.5)
   - Dock the portrait tip in the gap between the board and the tray, or shrink the board gap. Never overlap the booster buttons.
   - Use the reclaimed gap to enlarge the board by about 8%.
   - Test: in `mobile/r17` all tray buttons are fully visible.
8. **G-tufa-title-map** (authenticity, sev 3, M, +0.5)
   - Repaint the title (both orientations) and the map's terrace panel. Replace the white terraces and turquoise pools with low grey-tan tufa mounds, algae-green runnels and steam, matching `desktop/r04-world2`.
9. **G-label-truncation** (typography, sev 3, S, +0.5)
   - On mobile, drop the "WORLD n ·" prefix or move it into the medallion. Shrink level names to fit on one line, with a minimum of 18 px, before ellipsis.
   - Fix the title lock-up by adding 8–12 px under "Sparkle" and a dark text shadow on the subtitle.
   - Test: no ellipsis appears in `mobile/r07`, `r12` or `r14`.
10. **G-crust-and-goal-icons** (readability, sev 3, S, +0.5)
    - Give the crust a visible crystalline material: faceted grey-white mineral shards on the cell corners, not a pale tile.
    - Render goal icons with alpha from the actual blocker sprite, with no square background.
    - Test: the crust HUD icon matches the board crust in `mobile/r08` and `mobile/r15`.
11. **G-board-art-cohesion** (art, sev 3, L, +0.5)
    - Replace flat cell fills with per-world materials (marble tile for W1, wet stone for W3, lacquered wood for W4), lit by the backdrop's key light, so board and painting share one art direction.
12. **G-results-polish** (ui, sev 2, S, +0.3)
    - Put Next level, Replay and Map on one row. Animate the stars in one at a time with a punch. Replace the browser-blue focus ring with a gold glow.

```json
{
  "loop": 1,
  "role": "critic-claude",
  "scores": {
    "art": { "score": 6.0, "confidence": 0.75, "evidence": ["desktop/r05-world3", "desktop/r03-world1", "desktop/r10-stone-fire", "mobile/r07-world5", "mobile/s2-8", "desktop/r01-title"] },
    "rendering": { "score": 6.0, "confidence": 0.7, "evidence": ["desktop/r05-world3", "desktop/r03-world1", "desktop/r11-crystal-rays", "desktop/r10-stone-fire", "mobile/s1-3"] },
    "animation": { "score": 5.5, "confidence": 0.65, "evidence": ["strips/mobile-s1", "strips/desktop-s1", "strips/mobile-s2", "mobile/r12-callout", "mobile/s1-7"] },
    "ui": { "score": 5.5, "confidence": 0.8, "evidence": ["mobile/r02-map", "mobile/r15-intro", "desktop/r02-map", "mobile/s1-3", "mobile/r03-world1", "mobile/r14-lose", "mobile/r13-win"] },
    "typography": { "score": 6.0, "confidence": 0.75, "evidence": ["mobile/r14-lose", "mobile/r07-world5", "mobile/r12-callout", "mobile/r01-title", "mobile/r13-win", "mobile/r05-world3"] },
    "readability": { "score": 6.0, "confidence": 0.7, "evidence": ["mobile/r03-world1", "mobile/s2-8", "mobile/r08-world6", "mobile/r05-world3", "desktop/r17-tip"] },
    "mobile": { "score": 6.0, "confidence": 0.75, "evidence": ["mobile/r03-world1", "mobile/r04-world2", "mobile/r08-world6", "mobile/r17-tip", "mobile/r02-map"] },
    "authenticity": { "score": 6.5, "confidence": 0.7, "evidence": ["mobile/r05-world3", "mobile/r06-world4", "mobile/r08-world6", "desktop/r01-title", "desktop/r02-map", "mobile/r13-win"] }
  },
  "ip": { "clean": true, "notes": "Original piece set (horseshoe, fan, teardrop, flower, amethyst, pine), original special and blocker names, and an original postcard UI; nothing copied from commercial match-3 games." },
  "gaps": [
    { "id": "G-hud-state-bugs", "category": "ui", "expectedGain": 1.0, "severity": 4, "effort": "S", "evidence": ["mobile/s1-3", "mobile/r03-world1", "mobile/r14-lose", "mobile/r13-win"], "fix": "Star bar fill = score / 3-star threshold; stars placed at threshold ratios with at least 1 star-width spacing; seeded win and lose states show consistent HUD (goals ticked on a win, moves 0 on a loss)." },
    { "id": "G-specials-identity", "category": "art", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["desktop/r03-world1", "desktop/r10-stone-fire", "mobile/s1-7"], "fix": "Model specials as distinct objects: Cascade with contrasting fins or stripes at least 35% of the cell; Hot Stone as a glowing ember basalt stone replacing the dashed ring; identifiable without the glow." },
    { "id": "G-callout-shake-score-timing", "category": "animation", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["mobile/r12-callout", "strips/mobile-s1", "strips/mobile-s2"], "fix": "Display-face callout (scale 0 to 1.15 to 1 over 250 ms) on a chain of 2 or more or when a special fires; 4-8 px screen shake for 150 ms; credit the HUD score as floaters land, with a count-up, not before the effect." },
    { "id": "G-map-header-overlap", "category": "ui", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r02-map", "mobile/r15-intro", "desktop/r02-map"], "fix": "Offset the map content and world card by the header height so the card title is fully visible; fill the desktop side gutters with a blurred extension of the map art." },
    { "id": "G-pine-piece", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/s2-8", "strips/mobile-s1"], "fix": "Scale the pine to the same 1.1x cell box as the other pieces (width within 10% of the flower's) and lighten or warm its green, or add an ornament, so it separates from green cells." },
    { "id": "G-cell-strip-and-seating", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/r05-world3", "desktop/r03-world1"], "fix": "Remove the grey top strip from the cell texture; thicker beveled frame with a warm rim light; visibly stronger cast shadow; desktop board top margin of at least 48 px." },
    { "id": "G-tip-covers-tray", "category": "mobile", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r17-tip", "mobile/r03-world1"], "fix": "Dock the portrait tip in the board-tray gap without overlapping the booster buttons; use the reclaimed gap to enlarge the board by about 8%." },
    { "id": "G-tufa-title-map", "category": "authenticity", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r01-title", "mobile/r01-title", "desktop/r02-map"], "fix": "Repaint the title paintings and the map terrace panel: replace the white terraces and turquoise pools with low grey-tan tufa, algae-green runnels and steam, matching the W2 backdrop." },
    { "id": "G-label-truncation", "category": "typography", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r07-world5", "mobile/r12-callout", "mobile/r14-lose", "mobile/r01-title"], "fix": "Drop or relocate the 'WORLD n' prefix on mobile and fit level names to one line (minimum 18 px) before ellipsis; add 8-12 px spacing and a dark shadow under the title subtitle." },
    { "id": "G-crust-and-goal-icons", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r08-world6", "mobile/r15-intro", "mobile/r04-world2"], "fix": "Give the crust visible faceted mineral shards on cell corners instead of a pale tile; render goal icons from blocker sprites with alpha only, no square background, matching the board." },
    { "id": "G-board-art-cohesion", "category": "art", "expectedGain": 0.5, "severity": 3, "effort": "L", "evidence": ["desktop/r03-world1", "desktop/r05-world3"], "fix": "Replace flat cell fills with per-world materials (marble, wet stone, lacquered wood) lit by the backdrop's key light so board and painting share one art direction." },
    { "id": "G-results-polish", "category": "ui", "expectedGain": 0.3, "severity": 2, "effort": "S", "evidence": ["mobile/r13-win", "mobile/r01-title"], "fix": "Put Next level, Replay and Map on one row; animate the stars in one at a time; replace the browser-blue focus ring with a themed gold glow." }
  ],
  "verdict": "continue"
}
```
