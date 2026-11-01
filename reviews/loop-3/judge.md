# Judge ruling: loop 3

**Result: 52.0/80, verdict `continue`.** Mobile (7.0) and authenticity (7.0) meet their gates. Art, rendering, animation, UI, typography and readability do not. The measured gates (tests 93/93, perf ~1 ms, IP) all pass, and both critics found the IP check clean, which I confirm.

The critics agree closely: each totals 52.5, and no category differs by more than 0.5. Three categories differ at all: art (6.5 vs 7), UI and typography (each 6.5 vs 6, in opposite directions) and mobile (7 vs 6.5). I opened every capture cited below myself.

## Prosecution and defence

### Critic A (critic-claude)
- **Over-scored:**
  - Mobile 7.0 is generous when the board starts about 37% of the way down every phone frame (`mobile/r05-world3`, board top at y≈630 of 1688). World 2 also has a dead fog band (`mobile/r04-world2`).
  - Authenticity 7.0 overlooks that the World 6 "Holiday Lights" level is painted in plain daylight (`mobile/r08-world6`).
  - The "moves badge pulsing" in s1 frame 1 cannot be confirmed from a still.
- **Under-scored:**
  - Typography 6.0 discounts a real display/UI pairing and excellent numerals in the moves badge and win score (`mobile/r03-world1`, `mobile/r13-win`).
  - Its strongest claims all check out:
    - the map header is invisible (`mobile/r02-map`, `desktop/r02-map`);
    - s1 frames 2–4 are identical (`strips/mobile-s1`);
    - the Hot Stone ring is a muddy donut (`mobile/r10-stone-fire`);
    - the crust goal icon is blank (`mobile/r14-lose`);
    - steam is a ghost haze (`mobile/r17-tip`);
    - World 3 tufa is dark brown (`mobile/r05-world3`).
  - It is the better-evidenced review.

### Critic B (critic-codex)
- **Over-scored:**
  - Art 7.0 rests on three frames, none of which shows a special firing or the crust, moss or steam blockers. The rubric's 7 requires "specials obviously special" and "blockers with material identity". The Hot Stone reads as a dirty disc (`mobile/r10-stone-fire`) and moss as grapes (`mobile/r07-world5`).
  - Typography 6.5 is too kind given the same invisible header across three screens (`mobile/r02-map`, `mobile/r15-intro`, `mobile/r16-help`) and a low-contrast title lockup (`desktop/r01-title`).
- **Under-scored:**
  - Mobile 6.5 blames the scenery band for small cells. A 9-column board at 390 px is width-limited: 390 ÷ 9 ≈ 43 px per cell, however high the board sits. Its "≥ 44 px cells" target is therefore not achievable by moving the board, which is a wrong cause.
  - The HUD is compact and the tray is in thumb reach with nothing off-screen (`mobile/r03-world1`, `mobile/r08-world6`).

## Category rulings

### Art: 6.5 (A 6.5, B 7.0). A is right.
- **Strengths:**
  - The base pieces are glossy, with distinct silhouettes and contact shadows (`mobile/r05-world3`, `desktop/r04-world2`).
  - The Spring Crystal special reads (`strips/mobile-s2` frame 1), and chains with padlocks are good.
  - The paintings are polished.
- **Below the 7 anchor:**
  - **Hot Stone:** a dark disc with a gold scribble (`mobile/r05-world3` row 4 col 3, `mobile/r10-stone-fire`).
  - **Cascade:** its band and fins are barely visible at phone size (`mobile/r12-callout`).
  - **Crust:** a beige frame with no crystal facets (`mobile/r04-world2`).
  - **Moss:** green grapes (`mobile/r07-world5`).
  - **Tufa:** dark brown on the World 3 board, despite the drab-grey change (`mobile/r05-world3` against `mobile/r04-world2`).

### Rendering: 6.5 (both 6.5)
- **Strengths:**
  - The framed board, bevelled cells and halo seat the board reasonably (`mobile/r03-world1`).
  - The Crystal rays are soft and additive (`mobile/r11-crystal-rays`).
- **Against:**
  - The Cascade beam is a white hairline (`mobile/r09-cascade-fire`, `strips/mobile-s1` frame 5).
  - The Hot Stone ring is an opaque brown donut, not a glow (`mobile/r10-stone-fire`).
  - On World 2 the cold silver frame and teal cells fight the amber painting (`desktop/r04-world2`), and the mobile board floats on a fog band (`mobile/r04-world2`).
  - No light responds to events.

### Animation: 6.5 (both 6.5)
- **Strengths:**
  - The Crystal sequence has anticipation (a white target flash), a scaling callout, rays, a dim and staggered falls (`strips/mobile-s2` frames 2–7).
  - The score counts up through the beats.
- **Against:**
  - s1 frames 2–4 are identical, so there is no build-up before the Cascade fires (`strips/mobile-s1`).
  - The backdrop never moves, so there is no shake (`strips/mobile-s1`, `strips/mobile-s2`).
  - Frames 9–10 settle into a rigid grid with no landing squash.
  - The shards are hard to find (`strips/mobile-s1` frame 6).

### UI: 6.0 (A 6.5, B 6.0). B is right.
- **Strengths:**
  - The mobile HUD hierarchy is clear: the moves badge, then the level name, the goals, and the score and stars (`mobile/r05-world3`).
  - The dialogs share one style, and the lose dialog's goal pills work (`mobile/r14-lose`, `mobile/r13-win`).
- **Against:**
  - The world title in the map, intro and help header is dark on dark and wraps to three lines (`mobile/r02-map`, `mobile/r15-intro`, `mobile/r16-help`, `desktop/r02-map`). It is the most visible finish defect in the build.
  - The "★ N" score-goal pill is unlabelled, and on the capture boards it shows 11,460, 5,100 and 11,340 for the same level (`mobile/r09-cascade-fire`, `mobile/r10-stone-fire`, `mobile/r11-crystal-rays`).
  - The star bar is a hairline.
  - The desktop HUD is a small corner box with 3+2 boosters and dead space beside it (`desktop/r04-world2`).

### Typography: 6.0 (A 6.0, B 6.5). A is right.
- **Strengths:** a display/UI pairing and excellent numerals (`mobile/r03-world1`, `mobile/r13-win`).
- **Against:**
  - The illegible header title appears on three screens (`mobile/r02-map`, `desktop/r02-map`).
  - The title lockup is cream on a bright cream sky, and the "HOT SPRINGS · ARKANSAS" subtitle is thin and nearly lost (`desktop/r01-title`, `mobile/r01-title`).
  - The callouts are oversized relative to the board (`mobile/r11-crystal-rays`).
  - Both header failures have a contrast below 4.5:1, which caps typography under 7.

### Readability: 6.5 (both 6.5)
- **Strengths:**
  - All base kinds separate by shape and colour, even on the dark World 3 board (`mobile/r05-world3`).
  - The HUD goal icons match the board pieces (`mobile/r06-world4`).
- **Against:**
  - "Spring Crystal!" and "Hot Stone!" cover the top row for several frames (`mobile/r11-crystal-rays`, `strips/mobile-s2` frames 3–5).
  - The crust goal icon is a blank square (`mobile/r14-lose`, `mobile/r15-intro`).
  - Steam shows the piece it supposedly hides, which contradicts Della's tip (`mobile/r17-tip`).
  - Hot Stone and Cascade specials are hard to spot at a glance (`mobile/r05-world3`).

### Mobile: 7.0 (A 7.0, B 6.5). A is right.
- **Meets the 7 anchor:** a true portrait layout. The board is full width and already width-limited, the HUD is a compact ~190 px top band, the booster tray and pause are in thumb reach, and nothing is off-screen (`mobile/r03-world1`, `mobile/r05-world3`, `mobile/r08-world6`).
- **Shortfalls:**
  - The World 2 fog band (`mobile/r04-world2`).
  - Five goal pills near the right edge (`mobile/r08-world6`).
  - The three-line map header (`mobile/r02-map`).

### Authenticity: 7.0 (both 7.0)
- **Recognisable:**
  - World 1: the Bathhouse Row arcades and the tiled Quapaw dome (`mobile/r03-world1`, `desktop/r01-title`).
  - World 3: the twin-towered Arlington-style hotel with 1930s cars (`mobile/r05-world3`).
  - World 4: the Oaklawn-style grandstand (`mobile/r06-world4`).
  - World 5: the Carpenter-Dam-style lake (`mobile/r07-world5`).
  - World 6: the Anthony-Chapel-style glass chapel (`mobile/r08-world6`).
- **Accuracy and tone:** the World 2 tufa is grey and the white terraces are gone (`desktop/r04-world2`). Della is respectful and labelled fictional (`mobile/r17-tip`).
- **Deductions:**
  - A steaming lake sits in mid-downtown on the title (`desktop/r01-title`).
  - The map panel reads as a Mediterranean villa village (`desktop/r02-map`).
  - "Holiday Lights" is painted in daylight (`mobile/r08-world6`).

## Gaps (ranked by expected gain ÷ effort; S=1, M=2, L=4)

Merged duplicates:
- the map-header gaps from both critics, merged with A's title-lockup gap;
- A's callout gap with B's callout gap;
- A's impact gap, split into a timing part (animation) and a glow part (rendering), with B's landing gap kept separate;
- A's blocker gap with B's blocker gap.

Corrected causes:
- **Mobile board size:** B's "≥ 44 px cells" is impossible on 9-column boards, so I dropped it. The dead band above the board is better used as the callout lane (gap 2).
- **Board cohesion:** B's L-effort "material cohesion" gap was too vague. It is replaced by a concrete per-world frame and cell tint (gap 9).

Dropped below the top 10: the map path and nodes (authenticity, +0.5, M) and moving the mobile board up (mobile, +0.25).

1. **G-header-contrast** (typography and UI, +1.0, severity 4, S)
   - **Problem:** the world title on the map, intro and help is unreadable, and the title lockup is low contrast.
   - **Fix:**
     - Header world title: cream #FFF3D6 with a 2 px dark-brown outline, contrast ≥ 4.5:1, font-size clamp() so it fits on ≤ 2 lines at 390 px.
     - Title screen: give the logo a 3 px dark outline and drop shadow, and put the subtitle and tagline on a 40%-opacity dark scrim at ≥ 4.5:1.
   - **Evidence:** `mobile/r02-map`, `mobile/r15-intro`, `desktop/r02-map`, `desktop/r01-title`.
2. **G-callout-lane** (readability, +0.5, severity 4, S)
   - **Problem:** callouts cover the top row of pieces.
   - **Fix:**
     - **Mobile:** place callouts with their full bounds (stroke, shadow and peak scale included) in the painting band above the frame.
     - **Desktop:** place them in the side column under the HUD box.
     - **Test:** no callout pixel intersects a cell rectangle in any frame.
   - **Evidence:** `mobile/r11-crystal-rays`, `mobile/r10-stone-fire`, `strips/mobile-s2`.
3. **G-special-identity** (art, +1.0, severity 4, M)
   - **Cascade:** a full-width glowing stripe band with arrow fins ≥ 30% of the cell and a 1.2 s additive pulse.
   - **Hot Stone:** an emissive orange-hot core with an ember rim and shimmer, replacing the dark disc and scribble.
   - **Test:** every special is identifiable in a frame downscaled to 50%.
   - **Evidence:** `mobile/r05-world3`, `mobile/r10-stone-fire`, `mobile/r12-callout`.
4. **G-fire-anticipation-shake** (animation, +1.0, severity 4, M)
   - **Problem:** s1 frames 2–4 are dead, and nothing moves when a special fires.
   - **Fix:**
     - Over 150 ms before a special fires, scale it to 1.2× with an additive glow build-up.
     - On fire, add an 8 px board shake decaying over 250 ms, and flash the frame rim in the special's colour.
     - **Test:** the dwell frames differ, and the board offset is non-zero in the fire frame.
   - **Evidence:** `strips/mobile-s1`, `strips/desktop-s1`.
5. **G-blocker-materials** (art and readability, +1.0, severity 3, M)
   - **Crust:** a white crystalline overlay with facets and sparkle. Its HUD and goal icon must use the same texture, not a blank square.
   - **Moss:** a leafy carpet overlapping the cell edges.
   - **Steam:** an opaque swirling cloud covering ≥ 70% of the piece.
   - **Tufa:** one drab-grey tint on every board colour, with layer pips ≥ 6 px in light cream.
   - **Evidence:** `mobile/r04-world2`, `mobile/r07-world5`, `mobile/r17-tip`, `mobile/r05-world3`, `mobile/r14-lose`.
6. **G-effect-glow** (rendering, +0.5, severity 3, S)
   - **Cascade beam:** additive, ≥ 0.6 of a cell thick, with a soft falloff.
   - **Hot Stone:** replace the opaque brown ring with an additive orange shockwave (alpha ≤ 0.6, expanding 0 to 1.5 cells).
   - **Shards:** ≥ 12 px, with gravity and spin.
   - **Evidence:** `mobile/r09-cascade-fire`, `mobile/r10-stone-fire`, `strips/mobile-s1`.
7. **G-landing-squash** (animation, +0.5, severity 3, S)
   - **Fix:** on landing, each piece squashes to scale 1.1 × 0.85 for 60 ms, rebounds to 0.97 × 1.04, then settles. The landings are staggered per column.
   - **Test:** a strip frame catches a squashed piece.
   - **Evidence:** `strips/mobile-s1` frames 8–10, `strips/mobile-s2` frames 6–8.
8. **G-hud-star-meter** (UI, +0.5, severity 2, S)
   - **Fix:**
     - Label the score-goal pill ("Goal 11,340").
     - Make the star bar ≥ 14 px tall, with each star at its real threshold.
     - Pop each star to gold when it is reached.
   - **Evidence:** `mobile/r11-crystal-rays`, `mobile/r05-world3`, `mobile/r15-intro`.
9. **G-frame-temperature** (rendering, +0.5, severity 2, S)
   - **Fix:**
     - Give Worlds 2, 4 and 5 a warm bronze frame gradient in place of the cold grey.
     - Tint each world's cell fill from the painting's mid-tone darkened 60%.
     - Feather the World 2 mobile fog band into the halo.
   - **Evidence:** `desktop/r04-world2`, `mobile/r04-world2`.
10. **G-desktop-hud** (UI, +0.5, severity 2, M)
    - **Fix:** replace the 250 px corner box with a full-height left rail: a larger moves badge, goals and a star meter, with the boosters as a single vertical column.
    - **Evidence:** `desktop/r04-world2`, `desktop/r03-world1`.

## Verdict
**`continue`.** Six of the eight categories are below gate.

```json
{
  "loop": 3,
  "role": "judge",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.8, "evidence": ["mobile/r05-world3", "mobile/r10-stone-fire", "mobile/r12-callout", "mobile/r04-world2", "mobile/r07-world5", "desktop/r04-world2"] },
    "rendering": { "score": 6.5, "confidence": 0.8, "evidence": ["mobile/r03-world1", "mobile/r11-crystal-rays", "mobile/r09-cascade-fire", "mobile/r10-stone-fire", "desktop/r04-world2", "mobile/r04-world2"] },
    "animation": { "score": 6.5, "confidence": 0.75, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "strips/desktop-s1"] },
    "ui": { "score": 6.0, "confidence": 0.8, "evidence": ["mobile/r02-map", "mobile/r15-intro", "mobile/r16-help", "desktop/r02-map", "mobile/r14-lose", "mobile/r11-crystal-rays", "desktop/r04-world2"] },
    "typography": { "score": 6.0, "confidence": 0.8, "evidence": ["mobile/r02-map", "desktop/r02-map", "desktop/r01-title", "mobile/r01-title", "mobile/r13-win", "mobile/r11-crystal-rays"] },
    "readability": { "score": 6.5, "confidence": 0.8, "evidence": ["mobile/r05-world3", "mobile/r06-world4", "mobile/r11-crystal-rays", "strips/mobile-s2", "mobile/r14-lose", "mobile/r17-tip"] },
    "mobile": { "score": 7.0, "confidence": 0.75, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r08-world6", "mobile/r04-world2", "mobile/r02-map"] },
    "authenticity": { "score": 7.0, "confidence": 0.75, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r06-world4", "mobile/r07-world5", "mobile/r08-world6", "desktop/r04-world2", "desktop/r01-title", "desktop/r02-map", "mobile/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Both critics and the judge find no copied commercial match-3 names, logos, piece designs or UI. Specials use genre-standard mechanics with original names and visuals." },
  "gaps": [
    { "id": "G-header-contrast", "category": "typography", "expectedGain": 1.0, "severity": 4, "effort": "S", "evidence": ["mobile/r02-map", "mobile/r15-intro", "desktop/r02-map", "desktop/r01-title"], "fix": "Map/intro/help header world title in cream #FFF3D6 with a 2px dark-brown outline, contrast >= 4.5:1, font-size clamp() so it fits on <= 2 lines at 390px. Title screen: logo gets a 3px dark outline and drop shadow; subtitle and tagline sit on a 40%-opacity dark scrim at >= 4.5:1. Also lifts UI." },
    { "id": "G-callout-lane", "category": "readability", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r11-crystal-rays", "mobile/r10-stone-fire", "strips/mobile-s2"], "fix": "On mobile, place callouts with their full bounds (stroke, shadow and peak scale included) in the painting band above the frame; on desktop, in the side column under the HUD box. Test: no callout pixel intersects a cell rectangle in any frame." },
    { "id": "G-special-identity", "category": "art", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["mobile/r05-world3", "mobile/r10-stone-fire", "mobile/r12-callout"], "fix": "Cascade: a full-width glowing stripe band with arrow fins >= 30% of the cell and a 1.2s additive pulse. Hot Stone: an emissive orange-hot core with an ember rim and shimmer, replacing the dark disc and gold scribble. Test: every special is identifiable in a frame downscaled to 50%." },
    { "id": "G-fire-anticipation-shake", "category": "animation", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["strips/mobile-s1", "strips/desktop-s1"], "fix": "Over 150ms before a special fires, scale it to 1.2x with an additive glow build-up (fills the dead s1 frames 2-4). On fire, an 8px board shake decaying over 250ms, and the frame rim flashes in the special's colour. Test: the dwell frames differ, and the board offset is non-zero in the fire frame." },
    { "id": "G-blocker-materials", "category": "art", "expectedGain": 1.0, "severity": 3, "effort": "M", "evidence": ["mobile/r04-world2", "mobile/r07-world5", "mobile/r17-tip", "mobile/r05-world3", "mobile/r14-lose"], "fix": "Crust: a white crystalline overlay with facets and sparkle, with the HUD and goal icon textured the same (not a blank square). Moss: a leafy carpet overlapping the cell edges, not grapes. Steam: an opaque swirling cloud covering >= 70% of the piece. Tufa: one drab-grey tint on every board colour, with light-cream layer pips >= 6px. Also lifts readability." },
    { "id": "G-effect-glow", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r09-cascade-fire", "mobile/r10-stone-fire", "strips/mobile-s1"], "fix": "Cascade beam: additive, >= 0.6 of a cell thick, with a soft falloff. Hot Stone: replace the opaque brown ring with an additive orange shockwave (alpha <= 0.6, expanding 0 to 1.5 cells). Shards >= 12px with gravity and spin." },
    { "id": "G-landing-squash", "category": "animation", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["strips/mobile-s1", "strips/mobile-s2"], "fix": "On landing, each piece squashes to scale 1.1x0.85 for 60ms, rebounds to 0.97x1.04, then settles, staggered per column. Test: a strip frame catches a squashed piece." },
    { "id": "G-hud-star-meter", "category": "ui", "expectedGain": 0.5, "severity": 2, "effort": "S", "evidence": ["mobile/r11-crystal-rays", "mobile/r05-world3", "mobile/r15-intro"], "fix": "Label the score-goal pill (\"Goal 11,340\"). Make the star bar >= 14px tall with each star at its real threshold, and pop each star to gold when it is reached." },
    { "id": "G-frame-temperature", "category": "rendering", "expectedGain": 0.5, "severity": 2, "effort": "S", "evidence": ["desktop/r04-world2", "mobile/r04-world2"], "fix": "Replace the cold grey frame on Worlds 2, 4 and 5 with a warm bronze gradient. Tint each world's cell fill from the painting's mid-tone darkened 60%, and feather the World 2 mobile fog band into the board halo." },
    { "id": "G-desktop-hud", "category": "ui", "expectedGain": 0.5, "severity": 2, "effort": "M", "evidence": ["desktop/r04-world2", "desktop/r03-world1"], "fix": "Replace the 250px corner HUD box with a full-height left rail: a larger moves badge, goals and a star meter, with the boosters as a single vertical column, leaving no dead area beside it." }
  ],
  "verdict": "continue"
}
```
