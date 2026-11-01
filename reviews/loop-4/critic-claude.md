# Critic A (critic-claude): loop 4

## Verdict
Spa City Sparkle looks like a competent, warm, well-themed browser match-3. It does not yet look like a genre-leading phone game. The phone portrait layout is the strongest part. It has a big moves medallion, a compact goal row, a full-width board, and a reachable booster tray (`mobile/r03-world1`, `mobile/r08-world6`). The paintings carry real Hot Springs identity: the Quapaw-style tiled dome, the Mountain Tower, the Oaklawn grandstand, and a Garvan-style glass chapel. The craft falls short of the 7 gates in several places:
- The Cascade special is almost invisible at rest (`desktop/r03-world1`, `mobile/s1-4`).
- The refill-only pine-tree piece is matte and pastel, so it looks like it came from a different set (`mobile/s1-10`).
- Falls land with no squash (`strips/mobile-s1`).
- The desktop HUD's score figure spills outside its panel on every board (`desktop/r03-world1`, `desktop/r13-win`).
- The desktop tutorial card sits on top of the booster tray (`desktop/r17-tip`).
- A fine screen-door grid shows on the desktop backdrop skies (`desktop/r04-world2`, `desktop/r06-world4`).
- The win screen is a static cream card with no celebration (`desktop/r13-win`).

It is solid, but most categories sit at 6–7.

## Scores

### Art: 6.5
- **Pieces.** All are clean Blender renders with distinct silhouettes: drop, coral fan, gold horseshoe, pink flower, violet crystal, and pine tree. The drop and crystal have faceted speculars and the horseshoe a real metallic sheen (`mobile/s1-4`, `desktop/r03-world1`). Detail is thin, though. The fan reads as a flat coral cut-out and the flower as glossy plastic. Nothing has the micro-detail a 9 needs.
- **Pine tree.** The sixth kind, seen only in refills (`mobile/s1-10` row 1, `strips/mobile-s2` frames 7–8), is pale mint and matte, with no specular highlight or rim light. It is visibly a different material from the rest of the set.
- **Specials.**
  - The Spring Crystal is a good iridescent pink/cyan gem (`mobile/s2-1`).
  - The Hot Stone (a piece on a dark disc with gold rays, `desktop/r05-world3` row 4, col 3) is acceptable.
  - The Cascade is just a thin cyan bar with two tiny gold tips (`mobile/s1-4` row 4, col 2; `desktop/r03-world1` row 4, col 2, where it is barely a sparkle).
- **Blockers.**
  - Chains with padlocks read well (`desktop/r05-world3`).
  - The algae is a leafy green ball, more like a cabbage than a carpet spilling over the cell (`desktop/r07-world5`).
  - Tufa is properly drab grey, but its two gold studs read as a pair of eyes on a cookie (`mobile/r04-world2`).
  - Crust is a cream frame that reads as a light floor tile (`desktop/r08-world6`).
- **Paintings.** They are lush and polished, and they share the board's warm palette (`desktop/r01-title`, `mobile/r08-world6`).

### Rendering: 6.0
- **What works.**
  - Pieces cast soft contact shadows down and to the right (`mobile/s1-4`).
  - Effects are additive and soft: the crystal rays (`desktop/r11-crystal-rays`) and the cascade beam (`mobile/s1-5`).
  - Night boards use dark slate cells that match the Central Ave backdrop (`desktop/r05-world3`).
- **Board seating.** The board still sits on top of the painting rather than in it. The frame is a thin rim with little cast shadow onto the scene. On phones, W2's board floats in a flat fog band that cuts off the painting (`mobile/r04-world2`, y≈520–640).
- **Cell colour.** Oaklawn's cells are cold slate grey under a warm sunset, even though the frame is now bronze (`desktop/r06-world4`). W2's teal cells also fight the golden backdrop (`desktop/r04-world2`).
- **Backdrop artifact.** Desktop backdrops show a regular fine grid over the sky, like a screen door, clearly visible above the board in `desktop/r04-world2` and right of the frame in `desktop/r06-world4`, `desktop/r07-world5`.
- **Hot Stone ring.** It is brownish and muddy rather than hot orange. It also turns the pieces in the blast semi-transparent (`desktop/r10-stone-fire`).
- **Overall.** Light does not respond to events beyond the effects themselves.

### Animation: 6.5
- **Swap.** It moves on depth: the crystal passes over the fan with a slight lift (`mobile/s1-1`).
- **Cascade.** The beam is thick and sparkly and runs past the frame (`mobile/s1-5`). It leaves a lingering row glow and a ring around the new Cascade (`mobile/s1-6`), and the callout fades out cleanly (`mobile/s1-7`).
- **Crystal fire.** It has real anticipation. The targets flash white first (`strips/mobile-s2` frame 2), then rays and shard bursts fire (frames 3–4), then the board clears and refills (frames 6–7). Score popups (+540, +660) sit on the action.
- **What is missing.**
  - Falls are rigid translations. Pieces mid-drop in `mobile/s1-8` and `mobile/s2-6` show no stretch, and the landed frames show no squash or bounce.
  - `strips/mobile-s1` frames 9–10 are identical, so the board simply stops.
  - Shake cannot be seen in the stills beyond a few pixels of offset in `mobile/s1-5`.
  - The Hot Stone burst is a dim ring rather than an impact (`desktop/r10-stone-fire`).
- **Overall.** This is above the "linear and vanishing" anchor, short of the follow-through the 7 anchor asks for.

### UI: 6.0
- **Style.** It is coherent: cream cards, teal and gold pill buttons, a gold moves medallion, and goal chips, applied consistently across the title, map, intro, help, win and lose screens (`desktop/r15-intro`, `mobile/r14-lose`, `desktop/r16-help`).
- **Defects.**
  - **Desktop HUD.** The running score is drawn outside the HUD panel's right edge on every board: "2,160" in `desktop/r03-world1`, "4,300" in `desktop/r05-world3`, "3,776" in `desktop/r12-callout`, "23,000" in `desktop/r13-win`. It looks clipped and unfinished.
  - **Desktop tip.** Della's tip card covers the Hammer, Line and Shuffle buttons, with their count badges peeking out behind it (`desktop/r17-tip`).
  - **Desktop layout.** A large dead gap separates the left column from the board (`desktop/r06-world4`). The map is a centred strip between blurred copies of itself (`desktop/r02-map`).
  - **Win screen.** It is a static card: three flat stars and a number, with no banner, burst or count-up (`desktop/r13-win`, `mobile/r13-win`).
  - **Mobile map.** Nodes 9 and 10 crowd each other and sit off the road (`mobile/r02-map`).

### Typography: 6.5
- **Faces.** A rounded display face is used for titles and numbers, with a humanist sans for body text, in a clear scale.
- **Numerals.** The moves numerals ("20", "14") are big and read instantly (`mobile/r04-world2`). The lore and help body copy is clean (`mobile/r16-help`, `mobile/r13-win`).
- **Logo.** It is the same rounded sans with an outline (`desktop/r01-title`). That is a font setting, not a characterful wordmark.
- **Crowding.**
  - "1. Magnolia Promenade" wraps to two lines in the mobile HUD (`mobile/r12-callout`).
  - The mobile map header stacks four lines in the top bar ("W2 · The / Mountain / postcard 4/10 / restored", `mobile/r02-map`).
  - The desktop score overflow above is also a typesetting fault.
- **Captions.** The booster labels and the "MOVES" caption are small but legible.

### Readability: 6.5
- **Piece kinds.** All six are distinct by shape, and pink and coral are kept apart by silhouette (`mobile/r03-world1`, `mobile/s1-10`).
- **Goal icons.** They match the board for tufa, chains, algae and flowers (`mobile/r08-world6`).
- **Cascade special.** It is the big miss: at rest it is nearly indistinguishable from a plain crystal (`desktop/r03-world1`, `mobile/s1-4`).
- **Crust.** It looks like a highlighted floor tile, not an obstacle (`desktop/r07-world5`, `desktop/r08-world6`).
- **Steam.** The tip says it "hides a piece", yet the crystal, horseshoe and drop under it remain identifiable (`mobile/r17-tip`, `desktop/r17-tip`).
- **Exit gates.** They are small gold rings under the bottom-row pieces and are easy to miss (`desktop/r06-world4`).
- **Mid-fire.** The Hot Stone burst ghosts nine pieces at once (`desktop/r10-stone-fire`).

### Mobile: 7.0
- **Portrait layout.** It is clearly designed for the phone:
  - The moves medallion, level name and goal chips sit in a compact top band.
  - The board spans the full 390 px width.
  - The four boosters and pause sit in the thumb zone with about 60 px targets (`mobile/r03-world1`, `mobile/r05-world3`).
- **Placement.** Callouts sit on the board's top edge (`mobile/r09-cascade-fire`, `mobile/r11-crystal-rays`). The tip card covers the painting, not the board (`mobile/r17-tip`). Dialogs fit without clipping (`mobile/r13-win`, `mobile/r16-help`).
- **Density.** Nine-column boards still give about 40 px cells with readable pieces (`mobile/r08-world6`).
- **Weak spots.**
  - Seven-column levels leave a roughly 200 px painting gap between the HUD and the board (`mobile/r09-cascade-fire`).
  - The five-goal row is at its width limit (`mobile/r08-world6`).
  - The map header is cramped and the nodes overlap (`mobile/r02-map`).

### Authenticity: 7.0
- **Places that read as Hot Springs.**
  - A tiled, Quapaw-like dome and Italianate bathhouses on Bathhouse Row (`desktop/r03-world1`, `mobile/r03-world1`).
  - Hot Springs Mountain Tower on the ridge in several backdrops (`desktop/r01-title`, `desktop/r06-world4`).
  - A twin-towered, Arlington-like hotel and vintage cars on a wet Central Ave at night (`desktop/r05-world3`).
  - The Oaklawn grandstand with a horse race (`desktop/r06-world4`).
  - Lake Hamilton with pontoons and quartz clusters, a real local mineral (`desktop/r07-world5`).
  - A Garvan-style glass chapel and stone bridge (`mobile/r08-world6`).
- **Accuracy.** Tufa is correctly drab grey (`mobile/r04-world2`). The lore card states a sourced real fact (`desktop/r13-win`), and the help screen candidly notes there are no geysers (`desktop/r16-help`).
- **Weak spots.**
  - The W2 map is generic Mediterranean villa country, not the forested mountain (`desktop/r02-map`).
  - The title's dome is an exaggerated rainbow zigzag (`desktop/r01-title`).
  - "Holiday Lights" shows no lights (`desktop/r08-world6`).
- **Della.** She is dignified and labelled fictional. Making the only Black character a service attendant is historically grounded, but it is a mild risk worth handling with care (`mobile/r17-tip`).

## IP check
Clean. The piece set (drop, fan, horseshoe, flower, crystal, pine), the specials (Cascade, Hot Stone, Spring Crystal), the blockers, the boosters and the UI chrome are original and themed. No commercial names, logos, piece designs or layouts are copied. Line-clear, area-blast and colour-bomb specials are generic genre mechanics, and their art here is original.

## Ranked gaps
1. **G-cascade-special-visibility** (readability). The Cascade at rest is a thin cyan bar (`desktop/r03-world1`, `mobile/s1-4`).
   - **Fix:** draw two bold opaque cream/cyan bands across the piece in its sweep direction, add chevron arrows at both ends, scale it to 1.1× and give it a constant soft pulse. Test: in a 50% downscaled `desktop/r03-world1`, a viewer can pick out every Cascade.
   - Gain +1.0 · severity 4 · effort M
2. **G-landing-squash** (animation). Falls are rigid, with no landing squash or bounce, and they stop dead (`strips/mobile-s1` frames 8–10, `mobile/s2-6`).
   - **Fix:** stretch in flight (scaleY 1.08), squash on landing (scaleX 1.12, scaleY 0.86 for about 70 ms), overshoot back with an elastic ease, and stagger columns by 25 ms. Test: a strip frame mid-landing shows squashed pieces.
   - Gain +0.75 · severity 3 · effort M
3. **G-desktop-hud-overflow** (ui). The score figure is drawn outside the HUD panel (`desktop/r03-world1`, `desktop/r05-world3`, `desktop/r12-callout`, `desktop/r13-win`).
   - **Fix:** put the score inside the panel's padding, right-aligned above or below the star bar. Test: the score's bounding box lies within the panel's bounding box.
   - Gain +0.5 · severity 3 · effort S
4. **G-pine-piece-style** (art). The pine piece is matte and pastel, with no specular (`mobile/s1-10`, `strips/mobile-s2` frame 7).
   - **Fix:** re-render it with the set's material and lighting rig: saturated emerald, clearcoat specular, rim light, and the same shadow offset as the other pieces.
   - Gain +0.5 · severity 3 · effort M
5. **G-backdrop-grid-artifact** (rendering). A fine regular grid shows over the desktop skies (`desktop/r04-world2`, `desktop/r06-world4`, `desktop/r07-world5`).
   - **Fix:** remove the tiled overlay, or serve a backdrop at native resolution with linear filtering. Test: a 4× crop of the sky shows no periodic pattern.
   - Gain +0.5 · severity 3 · effort S
6. **G-win-celebration** (ui). The win screen is a static card (`desktop/r13-win`, `mobile/r13-win`).
   - **Fix:** add a ribbon banner header, stars that slam in one by one with particle bursts, a score count-up, and confetti or steam sparkles behind the card. Test: the win capture shows particles and the banner.
   - Gain +0.5 · severity 3 · effort M
7. **G-crust-blocker-identity** (readability). Crust reads as a light floor tile (`desktop/r07-world5`, `desktop/r08-world6`).
   - **Fix:** give it a crystalline mineral overlay with jagged facets that overlap the piece edges, plus a visible cracked second stage, and keep the goal icon identical.
   - Gain +0.5 · severity 3 · effort M
8. **G-board-cold-cells** (rendering). The slate and teal cells clash with warm sunsets (`desktop/r06-world4`, `desktop/r04-world2`).
   - **Fix:** tint each world's cell colours toward its backdrop's key light (warm umber or olive for W4, a warmer teal for W2), and add a cast shadow from the frame onto the backdrop.
   - Gain +0.4 · severity 2 · effort S
9. **G-title-wordmark** (typography). The logo is a plain font with an outline (`desktop/r01-title`, `mobile/r01-title`).
   - **Fix:** build a custom wordmark with a gold bevel gradient, an inner highlight, a steam or sparkle ornament and an arched baseline.
   - Gain +0.4 · severity 2 · effort M
10. **G-desktop-tip-overlap** (ui). The tip card covers the booster tray (`desktop/r17-tip`).
    - **Fix:** anchor the card above the tray, or over the board's top-left area. Test: the card and tray bounding boxes do not intersect.
    - Gain +0.3 · severity 2 · effort S
11. **G-mobile-map-nodes** (mobile). Nodes 9 and 10 crowd each other and sit off the road, and the header runs to four lines (`mobile/r02-map`).
    - **Fix:** snap the nodes to the path spline with at least 1.3× diameter spacing, and set the header on one line with a single-line subtitle.
    - Gain +0.3 · severity 2 · effort S
12. **G-steam-opacity** (readability). The pieces under steam stay identifiable (`mobile/r17-tip`).
    - **Fix:** use an opaque cloud core of at least 85% alpha over the centre 70% of the cell, with drifting wisps at the edges.
    - Gain +0.25 · severity 2 · effort S
13. **G-desktop-callout-anchor** (animation). Desktop callouts sit in the left column, far from the action (`desktop/r10-stone-fire`, `desktop/r12-callout`).
    - **Fix:** anchor them to the board's top edge, as on phones.
    - Gain +0.25 · severity 2 · effort S
14. **G-tufa-studs** (art). The two gold studs read as eyes (`mobile/r04-world2`).
    - **Fix:** scatter 5–7 irregular studs and add porous layered strata.
    - Gain +0.25 · severity 2 · effort S

```json
{
  "loop": 4,
  "role": "critic-claude",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/s1-4", "mobile/s1-10", "mobile/s2-1", "desktop/r03-world1", "desktop/r05-world3", "desktop/r07-world5", "desktop/r08-world6", "mobile/r04-world2"] },
    "rendering": { "score": 6.0, "confidence": 0.7, "evidence": ["desktop/r04-world2", "desktop/r06-world4", "desktop/r07-world5", "desktop/r10-stone-fire", "desktop/r11-crystal-rays", "mobile/r04-world2", "mobile/s1-4"] },
    "animation": { "score": 6.5, "confidence": 0.65, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/s1-1", "mobile/s1-5", "mobile/s1-8", "mobile/s2-6", "desktop/r10-stone-fire"] },
    "ui": { "score": 6.0, "confidence": 0.75, "evidence": ["desktop/r03-world1", "desktop/r05-world3", "desktop/r12-callout", "desktop/r13-win", "desktop/r17-tip", "desktop/r02-map", "mobile/r02-map", "mobile/r14-lose"] },
    "typography": { "score": 6.5, "confidence": 0.7, "evidence": ["desktop/r01-title", "mobile/r04-world2", "mobile/r12-callout", "mobile/r02-map", "mobile/r16-help", "desktop/r03-world1"] },
    "readability": { "score": 6.5, "confidence": 0.75, "evidence": ["desktop/r03-world1", "mobile/s1-4", "desktop/r07-world5", "desktop/r08-world6", "mobile/r17-tip", "desktop/r06-world4", "desktop/r10-stone-fire", "mobile/r08-world6"] },
    "mobile": { "score": 7.0, "confidence": 0.7, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r08-world6", "mobile/r09-cascade-fire", "mobile/r17-tip", "mobile/r13-win", "mobile/r02-map"] },
    "authenticity": { "score": 7.0, "confidence": 0.65, "evidence": ["desktop/r01-title", "desktop/r03-world1", "desktop/r05-world3", "desktop/r06-world4", "desktop/r07-world5", "mobile/r08-world6", "mobile/r04-world2", "desktop/r02-map", "mobile/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Original piece set (drop, fan, horseshoe, flower, crystal, pine), original special and blocker art, and themed names (Cascade, Hot Stone, Spring Crystal, Free Soak). No commercial match-3 names, logos, piece designs or UI copied; line, area and colour-clear specials are generic genre mechanics." },
  "gaps": [
    { "id": "G-cascade-special-visibility", "category": "readability", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["desktop/r03-world1", "mobile/s1-4"], "fix": "Draw two bold opaque cream/cyan bands across the piece in its sweep direction, add chevron arrows at both ends, scale it to 1.1x and give it a constant soft pulse; in a 50% downscaled desktop/r03-world1 every Cascade must be identifiable." },
    { "id": "G-landing-squash", "category": "animation", "expectedGain": 0.75, "severity": 3, "effort": "M", "evidence": ["strips/mobile-s1", "mobile/s1-8", "mobile/s2-6"], "fix": "Stretch in flight (scaleY 1.08), squash on landing (scaleX 1.12, scaleY 0.86 for ~70 ms), overshoot back with an elastic ease, and stagger columns by 25 ms; a strip frame mid-landing must show squashed pieces." },
    { "id": "G-desktop-hud-overflow", "category": "ui", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/r03-world1", "desktop/r05-world3", "desktop/r12-callout", "desktop/r13-win"], "fix": "Place the running score inside the HUD panel's padding, right-aligned above or below the star bar; the score's bounding box must lie within the panel's bounding box." },
    { "id": "G-pine-piece-style", "category": "art", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/s1-10", "strips/mobile-s2"], "fix": "Re-render the pine piece with the set's material and lighting rig: saturated emerald, clearcoat specular, rim light, and the same shadow offset as the other pieces." },
    { "id": "G-backdrop-grid-artifact", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/r04-world2", "desktop/r06-world4", "desktop/r07-world5"], "fix": "Remove the tiled grid overlay on desktop backdrops, or serve native-resolution art with linear filtering; a 4x crop of the sky must show no periodic pattern." },
    { "id": "G-win-celebration", "category": "ui", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r13-win", "mobile/r13-win"], "fix": "Add a ribbon banner header, stars that slam in one by one with particle bursts, a score count-up, and confetti or steam sparkles behind the card; the win capture must show particles and the banner." },
    { "id": "G-crust-blocker-identity", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r07-world5", "desktop/r08-world6", "mobile/r04-world2"], "fix": "Replace the cream frame with a crystalline mineral overlay whose jagged facets overlap the piece edges, add a visible cracked second stage, and keep the goal icon identical." },
    { "id": "G-board-cold-cells", "category": "rendering", "expectedGain": 0.4, "severity": 2, "effort": "S", "evidence": ["desktop/r06-world4", "desktop/r04-world2"], "fix": "Tint each world's cell colours toward its backdrop's key light (warm umber or olive for W4, a warmer teal for W2) and add a cast shadow from the frame onto the backdrop." },
    { "id": "G-title-wordmark", "category": "typography", "expectedGain": 0.4, "severity": 2, "effort": "M", "evidence": ["desktop/r01-title", "mobile/r01-title"], "fix": "Replace the outlined font logo with a custom wordmark: gold bevel gradient, inner highlight, a steam or sparkle ornament and an arched baseline." },
    { "id": "G-desktop-tip-overlap", "category": "ui", "expectedGain": 0.3, "severity": 2, "effort": "S", "evidence": ["desktop/r17-tip"], "fix": "Anchor the tutorial card above the booster tray, or over the board's top-left area; the card and tray bounding boxes must not intersect." },
    { "id": "G-mobile-map-nodes", "category": "mobile", "expectedGain": 0.3, "severity": 2, "effort": "S", "evidence": ["mobile/r02-map"], "fix": "Snap level nodes to the path spline with at least 1.3x diameter spacing, and set the map header on one line with a single-line subtitle." },
    { "id": "G-steam-opacity", "category": "readability", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["mobile/r17-tip", "desktop/r17-tip"], "fix": "Give steam an opaque cloud core of at least 85% alpha over the centre 70% of the cell, with drifting wisps at the edges, so the hidden piece cannot be identified." },
    { "id": "G-desktop-callout-anchor", "category": "animation", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["desktop/r10-stone-fire", "desktop/r12-callout"], "fix": "Anchor desktop callouts to the board's top edge, as on phones, instead of the left column." },
    { "id": "G-tufa-studs", "category": "art", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["mobile/r04-world2", "desktop/r04-world2"], "fix": "Scatter 5-7 irregular studs over the tufa block and add porous layered strata so the two studs no longer read as eyes." }
  ],
  "verdict": "continue"
}
```
