Spa City Sparkle visual review, critic-claude, loop 0

**Verdict.** The paintings are the strongest part. Title, Bathhouse Row, Central Avenue at night, Oaklawn and the Garvan chapel are polished and plainly about Hot Springs. The puzzle layer on top of them does not meet the genre bar yet. The six piece kinds are clean Blender renders, but they are small (about 55% of a cell) and two of them (fan, flower) look nearly flat. The specials are just a small glyph added to an ordinary piece. Some blockers are hard to read: the lock is a thin black bar and the crust is a pale wash over the piece. Each board sits on a translucent rectangle with hard edges, not seated in its scene. The motion strips show a swap, a beam and an empty row. There is no fall, no squash, no chain callout, no shake, and the HUD never changes. There are also clear UI bugs: the star counter is printed over the world title on every map screen, and the win dialog awards 3 stars for "0" points and shows "plus5" as the booster name. Total 44/80. Only authenticity clears its gate.

## Scores

**Art: 5.5.** The paintings are anchor-7 quality, for example `desktop/r01-title`, `mobile/r05-world3` and `mobile/r08-world6`. The pieces are anchor 5: consistent and readable, but they look like stock icons.
- Fan and flower show almost no specular or depth (`mobile/r03-world1`). The pine piece, which only appears after a refill (`mobile/s2-6`), is spindly and much lighter than the other kinds.
- Specials barely differ from plain pieces:
  - Cascade is a crystal or flower with tiny cyan double arrows (`mobile/s1-2`, `mobile/r12-callout`).
  - Hot Stone is a dotted brown ring around a piece (`mobile/r10-stone-fire`, `mobile/r05-world3` at column 3, row 4).
  - The Spring Crystal shows up as a white smudge (`mobile/s2-1`).
- Blockers are mixed:
  - The tufa as a brown "cookie" with eyes has character (`mobile/r04-world2`). Steam is flat white cloud blobs (`desktop/r17-tip`).
  - The lock is a thin black strip with a speck-sized padlock (`mobile/r05-world3`).
  - The crust is a pale mint wash with scribbles (`mobile/r07-world5`). It has no material identity.

**Rendering: 5.0.**
- Every board sits on a translucent rectangle with hard edges. You can see the seam at x≈375 in `desktop/r03-world1`, and at y≈475 and y≈1290 in `mobile/r03-world1` and `mobile/r08-world6`.
- On desktop the board frame touches the top and bottom edges of the viewport (`desktop/r03-world1`, `desktop/r17-tip`).
- There is no vignette. Pieces have only a faint offset drop shadow, and the cell tiles are flat with a thin top highlight.
- The cell colour changes per world (green, teal, near-black purple, slate, blue), which helps. The night board in `mobile/r05-world3` does sit well in its scene.
- The Hot Stone ring (`mobile/r10-stone-fire`) and the crystal rays (`mobile/r11-crystal-rays`) are reasonably soft additive effects.
- The Cascade beam looks like white smeared cotton, not light (`strips/mobile-s1` frames 3–4, `desktop/r09-cascade-fire`).

**Animation: 4.5.**
- `strips/mobile-s1`: frame 2 shows the two pieces sliding over each other at full size, with no lift, scale or overshoot. Frames 3–5 show the beam. Frame 6 is an empty row with nothing falling yet, so no fall, landing or bounce is ever shown.
- `strips/mobile-s2`: the crystal burst is the best moment. Rays and sparkles spread and the purple pieces fade out (frames 2–5). Frame 6 again just shows holes in the board.
- In both strips the HUD is frozen: moves stay at 19 and the score stays at 540 or 660 while "+540" or "+660" floats over the board.
- The "chain callout" capture `mobile/r12-callout` shows only a "+540" score pop, with no callout word and no visible shake.
- Clears fade rather than pop with anticipation.

**UI: 5.0.** The themed cream cards with gold and teal pills are consistent (`mobile/r15-intro`, `mobile/r16-help`). On mobile the HUD hierarchy (moves badge, goal pills, score) reads clearly. Defects:
- The "★ 28 / 180" counter is printed over the world title on every map screen: `mobile/r02-map` ("Wo★28/180ral Avenue"), `mobile/r15-intro`, `mobile/r16-help`, `desktop/r02-map`.
- The win card `mobile/r13-win` shows 3 stars with a score of "0". The HUD behind it still shows 22 horseshoes to collect and 17 moves left.
- The win card says "new booster: plus5", which is a raw internal ID.
- On the star bar, the star markers pile up at the right end, overlap the score numerals, and the fill is invisible (`mobile/r03-world1`, `mobile/r12-callout`).
- In `mobile/r08-world6`, five goals wrap onto three rows and push the moves badge down.
- On desktop the map is a 640 px column between flat green bars (`desktop/r02-map`, `desktop/r15-intro`).
- On desktop the Della portrait and the tip card cover the top of the board (`desktop/r17-tip`).

**Typography: 5.5.** Righteous as the display face plus Nunito for UI is a sound pairing, and the moves numerals read well (`mobile/r05-world3`). Problems:
- The map title collision described under UI (`mobile/r02-map`).
- "How to play" wraps to two lines inside a small pill (`desktop/r01-title`, `mobile/r01-title`).
- World labels wrap and leave one word alone on the second line: "CENTRAL AVENUE AT / NIGHT" (`mobile/r05-world3`, `mobile/r17-tip`) and "LAKE OUACHITA" in `mobile/r07-world5`.
- Star glyphs overprint the score numerals (`mobile/r03-world1`).
- "points · new booster: plus5" reads like debug output (`mobile/r13-win`).

**Readability: 6.0.** The six kinds can be told apart by colour and silhouette at 390 px (`mobile/r03-world1`, `mobile/r06-world4`). Problems:
- Specials are nearly invisible at a glance (`mobile/r12-callout`, `mobile/s1-1`).
- The lock is a few pixels tall (`mobile/r05-world3`).
- The crust wash lowers the contrast of the pieces under it (`mobile/r07-world5`, `mobile/r04-world2`).
- HUD goal icons don't match the board:
  - The tufa goal is a grey speckled rock, but tufa on the board is a brown blob (`mobile/r04-world2`, `mobile/r15-intro`).
  - In `mobile/r08-world6` the flower goal is a layered magenta bloom, unlike the board's 5-petal flower.
  - The bath-token goal (4) in `mobile/r06-world4` points at no visible token; only drain grates appear.

**Mobile: 6.0.** The portrait layout basically works. The board runs the full width with a margin of about 16 px, the booster tray sits under the thumb with targets of roughly 64 px, and nothing is off screen (`mobile/r05-world3`, `mobile/r06-world4`). Problems:
- There is a dead band of about 250 px (in 2× frame pixels) between the board and the tray, while the header is crowded (`mobile/r03-world1`, `mobile/r07-world5`).
- The goals wrap onto three rows (`mobile/r08-world6`).
- The map header overlap is worst on the phone (`mobile/r02-map`).
- Pieces fill only about 55% of each cell, which wastes the space the layout gains.

**Authenticity: 6.5.** Several worlds are clearly Hot Springs:
- Bathhouse Row with a tiled dome (`desktop/r01-title`, `desktop/r03-world1`).
- The Arlington's twin towers and the Art Deco Medical Arts tower on Central Avenue (`mobile/r05-world3`).
- An Oaklawn-style grandstand (`mobile/r06-world4`).
- A Lake Hamilton dam and pontoon boat (`mobile/r07-world5`).
- Anthony Chapel at Garvan Gardens (`mobile/r08-world6`).
- Quartz and horseshoe pieces, and a sourced "Real history" fact card (`mobile/r13-win`).

The penalty: white/cream Pamukkale-style terraces with turquoise pools on the title (`desktop/r01-title`), the map (`desktop/r02-map`) and World 2 (`mobile/r04-world2`, `mobile/r14-lose`), which the rubric names explicitly. The map is also labelled "World 3: Central Avenue at Night" but shows a daytime terrace and park painting (`mobile/r02-map`).

The guide, Della, is a Black bath attendant in a white uniform, labelled fictional (`mobile/r17-tip`). She is drawn with dignity and fits the history of segregated-era bathhouse staff. Still, giving the only character a service role is a risk worth watching. I did not penalise it.

## IP check
Clean. The name, the pieces (horseshoe, fan, drop, quartz, flower, pine), the blockers and the cream-card UI are original. The booster tray (hammer, line, shuffle, +5 moves) and lock overlays are genre conventions, not copies of any one game's art or logo.

## Ranked gaps
1. **G-specials-identity** (art; severity 5, effort M, +1.5). Render specials as their own Blender pieces:
   - Cascade: a piece with a glowing horizontal or vertical band and arrow fins at least 30% of the cell wide.
   - Hot Stone: the piece set into an ember-orange stone with a pulsing halo.
   - Spring Crystal: a large rainbow-faceted crystal with its own silhouette.

   Test: each one can be named, with no label, in frame 1 of `mobile/r09`–`r11` at 390 px.
2. **G-motion-feel** (animation; severity 5, effort M, +1.5).
   - Swap: back-out ease with a 1.08 scale lift.
   - Clear: a 1.15 scale pop before the shrink.
   - Falls: a landing squash of about 0.9 by 1.1 with a settle.
   - HUD: the moves counter drops and the score ticks up and pulses on every move.
   - Specials: a chain callout word and a 4–6 px board shake.

   Recapture the strips so at least 2 frames show falling pieces.
3. **G-board-seating** (rendering; severity 4, effort S, +1.0). Remove the translucent rectangle with hard edges. Use a feathered vignette and a soft cast shadow (blur of 24 px or more) under the frame instead. Keep at least 16 px between the desktop board and the viewport edges. Test: no straight seam visible in `desktop/r03` or `mobile/r03`.
4. **G-blocker-legibility** (readability; severity 4, effort M, +1.0).
   - Lock: a full brass chain in an X across the piece.
   - Crust: a textured mineral border around the cell edges, leaving the piece fully visible.
   - Draw HUD goal icons from the same sprites as the board (tufa and flower).
   - Show bath tokens on the board whenever a token goal exists.
5. **G-map-header-overlap** (ui; severity 4, effort S, +0.5). Move "★ n / 180" into its own pill outside the title block. Test: its bounding box doesn't overlap the title in `r02`, `r15` or `r16` at either viewport.
6. **G-result-data** (ui; severity 4, effort S, +0.5). Bind the win card's score and stars to the final state. Map booster IDs to display names ("+5 Moves"). Test: in `r13-win` the score is non-zero and matches the star thresholds.
7. **G-star-bar** (typography; severity 3, effort S, +0.5). Place the star markers at their thresholds along a visible gold fill, below the numerals rather than on them.
8. **G-piece-scale** (art; severity 3, effort S, +0.5). Scale pieces to about 78–82% of the cell. Add rim light and stronger specular to the fan, flower and pine.
9. **G-tufa-accuracy** (authenticity; severity 3, effort M, +0.5). Repaint the title, map and World 2 terraces as drab grey-brown tufa with a small steaming outflow, closer to the real Display Spring and Hot Water Cascade. Give the World 3 map panel an actual night scene.
10. **G-mobile-dead-band** (mobile; severity 3, effort S, +0.5). Anchor the board closer to the tray or enlarge its cells to use the empty band of about 250 px. Keep goals on a single row of smaller pills.
11. **G-cascade-beam** (rendering; severity 2, effort S, +0.3). Replace the smeared white sprite with an additive streak that has a bright core and tapered ends.
12. **G-desktop-map-pillarbox** (ui; severity 2, effort M, +0.3). Fill the side bars with blurred, extended map art or a landscape map panel. Keep the Della card and portrait off the board on desktop.

```json
{
  "loop": 0,
  "role": "critic-claude",
  "scores": {
    "art": { "score": 5.5, "confidence": 0.75, "evidence": ["desktop/r01-title", "mobile/r03-world1", "mobile/r05-world3", "mobile/r07-world5", "mobile/s1-2", "mobile/s2-1", "mobile/s2-6"] },
    "rendering": { "score": 5.0, "confidence": 0.7, "evidence": ["desktop/r03-world1", "mobile/r03-world1", "mobile/r08-world6", "desktop/r09-cascade-fire", "mobile/r10-stone-fire", "strips/mobile-s1"] },
    "animation": { "score": 4.5, "confidence": 0.65, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "strips/desktop-s1", "mobile/r12-callout"] },
    "ui": { "score": 5.0, "confidence": 0.75, "evidence": ["mobile/r02-map", "mobile/r15-intro", "mobile/r13-win", "mobile/r08-world6", "desktop/r02-map", "desktop/r17-tip"] },
    "typography": { "score": 5.5, "confidence": 0.7, "evidence": ["mobile/r02-map", "mobile/r01-title", "mobile/r05-world3", "mobile/r03-world1", "mobile/r13-win"] },
    "readability": { "score": 6.0, "confidence": 0.7, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r07-world5", "mobile/r04-world2", "mobile/r06-world4", "mobile/r12-callout"] },
    "mobile": { "score": 6.0, "confidence": 0.7, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r07-world5", "mobile/r08-world6", "mobile/r02-map"] },
    "authenticity": { "score": 6.5, "confidence": 0.65, "evidence": ["desktop/r01-title", "desktop/r02-map", "mobile/r04-world2", "mobile/r05-world3", "mobile/r06-world4", "mobile/r08-world6", "mobile/r13-win", "mobile/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Original title, piece set (horseshoe, fan, drop, quartz, flower, pine), blockers and UI. Booster tray and lock overlays are genre conventions, not copied art." },
  "gaps": [
    { "id": "G-specials-identity", "category": "art", "expectedGain": 1.5, "severity": 5, "effort": "M", "evidence": ["mobile/s1-2", "mobile/r12-callout", "mobile/r10-stone-fire", "mobile/s2-1"], "fix": "Render each special as its own Blender piece: Cascade with a glowing band and arrow fins at least 30% of the cell wide, Hot Stone set into an ember-orange stone with a pulsing halo, Spring Crystal as a large rainbow-faceted crystal with its own silhouette. Each must be nameable without a label at 390px in frame 1 of r09-r11." },
    { "id": "G-motion-feel", "category": "animation", "expectedGain": 1.5, "severity": 5, "effort": "M", "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/r12-callout"], "fix": "Back-out eased swap with a 1.08 scale lift; a 1.15 scale pop before each clear; falls with a landing squash and settle; HUD moves and score tick and pulse on every move; a chain callout word and a 4-6px board shake on specials. Recapture the strips with at least 2 frames of falling pieces." },
    { "id": "G-board-seating", "category": "rendering", "expectedGain": 1.0, "severity": 4, "effort": "S", "evidence": ["desktop/r03-world1", "mobile/r03-world1", "mobile/r08-world6"], "fix": "Replace the hard-edged translucent rectangle behind the board with a feathered vignette and a soft cast shadow (blur of 24px or more); keep at least 16px between the desktop board and the viewport edges. No straight seam should be visible." },
    { "id": "G-blocker-legibility", "category": "readability", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["mobile/r05-world3", "mobile/r07-world5", "mobile/r04-world2", "mobile/r15-intro", "mobile/r06-world4", "mobile/r08-world6"], "fix": "Lock as a full brass chain in an X across the piece; crust as a textured mineral border around the cell edges, leaving the piece fully visible; draw HUD goal icons from the same sprites as the board (tufa, flower); show bath tokens on the board whenever a token goal exists." },
    { "id": "G-map-header-overlap", "category": "ui", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r02-map", "mobile/r15-intro", "mobile/r16-help", "desktop/r02-map"], "fix": "Move the star total into its own pill outside the world-title block; its bounding box must not overlap the title on r02, r15 or r16 at either viewport." },
    { "id": "G-result-data", "category": "ui", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r13-win", "desktop/r13-win"], "fix": "Bind the win card's score and stars to the final level state (no 3 stars for 0 points) and map booster ids to display names ('+5 Moves', not 'plus5')." },
    { "id": "G-star-bar", "category": "typography", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r03-world1", "mobile/r12-callout", "mobile/r05-world3"], "fix": "Place the star markers at their thresholds along a visible gold fill, below the score numerals so nothing overprints the digits." },
    { "id": "G-piece-scale", "category": "art", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r03-world1", "desktop/r03-world1", "mobile/s2-6"], "fix": "Scale pieces to about 78-82% of the cell; add rim light and stronger specular to the fan, flower and pine so they read as dimensional." },
    { "id": "G-tufa-accuracy", "category": "authenticity", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r01-title", "desktop/r02-map", "mobile/r04-world2", "mobile/r02-map"], "fix": "Repaint the white/turquoise travertine terraces as drab grey-brown tufa with a small steaming outflow, closer to the real Display Spring and Hot Water Cascade; give the World 3 map panel an actual night scene." },
    { "id": "G-mobile-dead-band", "category": "mobile", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r03-world1", "mobile/r07-world5", "mobile/r08-world6"], "fix": "Anchor the board closer to the tray or enlarge its cells to use the empty band of about 250px between them; keep goals on a single row of smaller pills so the moves badge does not drift." },
    { "id": "G-cascade-beam", "category": "rendering", "expectedGain": 0.3, "severity": 2, "effort": "S", "evidence": ["strips/mobile-s1", "desktop/r09-cascade-fire"], "fix": "Replace the smeared white Cascade sprite with an additive streak that has a bright core and tapered ends." },
    { "id": "G-desktop-map-pillarbox", "category": "ui", "expectedGain": 0.3, "severity": 2, "effort": "M", "evidence": ["desktop/r02-map", "desktop/r15-intro", "desktop/r17-tip"], "fix": "Fill the flat green side bars with blurred, extended map art or a landscape map panel; keep the Della card and portrait off the board on desktop." }
  ],
  "verdict": "continue"
}
```
