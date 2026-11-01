# Judge ruling: loop 4

**Judged total: 52.0 / 80 (6.5/10). Verdict: continue.** Critics: Claude 52.0 / Codex 52.0.

Measured gates: tests pass (93/93), perf pass, ip pass. Gates still missed: art, rendering, animation, ui, typography and readability are all below 7. Mobile (7) and authenticity (7, gate 6) pass.

The critics agree within 1.0 in every category, so no category triggers the more-than-1.0 rule. They differ by exactly 1.0 on mobile and by 0.5 on art and rendering. I opened the captures for every disputed or load-bearing claim anyway. The checks are cited below.

## Prosecute, then defend

### critic-claude (52.0)
- **Over-scored?** Mobile 7.0 overlooks the cramped 4-line map header (`mobile/r02-map`) and the roughly 215 CSS px of dead painting between the HUD and a 7-column board (`mobile/s1-10`). Authenticity 7.0 is generous given the generic villa-country W2 map (`desktop/r02-map`) and a "Holiday Lights" level with no lights (`mobile/r08-world6`).
- **Under-scored?** Rendering 6.0 leans hard on a grid artifact that only shows on desktop. Pieces do carry offset contact shadows (`mobile/s1-10`), and the Crystal and Cascade effects are soft and additive (`desktop/r11-crystal-rays`, `strips/mobile-s1` frame 5). Claude also missed the clipped "Spring Crystal!" callout (`desktop/r11-crystal-rays`), so it under-stated the UI and typography faults rather than over-stating them.
- **Accuracy.** Every defect I spot-checked is real: score overflow, the tip covering the tray, the matte pine, rigid falls, the sky grid, the muddy Hot Stone ring and the cold Oaklawn cells.

### critic-codex (52.0)
- **Over-scored?** Art 7 at 0.95 confidence ignores two things. The Cascade special is almost invisible at rest (`desktop/r03-world1` row 4, col 2). The pine refill piece is matte and pastel against a glossy set (`mobile/s1-10` row 1). The 7 anchor requires "specials obviously special", which the Cascade fails. Rendering 6.5 never mentions the screen-door grid over the desktop skies (`desktop/r04-world2`) or the Hot Stone burst ghosting nine pieces (`desktop/r10-stone-fire`).
- **Under-scored?** Mobile 6 rests on a 44 CSS px target demand that no 9-column board can meet at 390 px (9 × 44 = 396 px, before the frame). The genre leaders run 9-wide boards at about the same 41 px. The board already spans the full width (`mobile/r08-world6`, `mobile/r05-world3`), so the scenery band does not cost cell size. The cause is wrong and the L-effort fix is infeasible.
- **Accuracy.** Codex's evidence lists are thin (3 to 4 captures per category). Its one unique catch, the clipped "Spring Crystal!" callout, is real and verified.

## Category rulings

### Art: 6.5 (Claude 6.5, Codex 7)
- **Verified strengths.** Glossy pieces with specular highlights and distinct silhouettes: faceted drop, metallic horseshoe, glossy flower (`desktop/r03-world1`, `mobile/s1-10`). The Spring Crystal special is a good iridescent gem (`strips/mobile-s2` frame 1). Chains with padlocks read well (`desktop/r05-world3`).
- **Verified weaknesses.**
  - The Cascade is a crystal with a faint sparkle (`desktop/r03-world1` row 4, col 2).
  - The pine is a mint, low-spec ornament with a gold hook (`mobile/s1-10`).
  - The tufa's two gold studs read as eyes (`desktop/r04-world2`, `mobile/r04-world2`).
  - The algae reads as a leafy ball, not a spilling carpet (`desktop/r07-world5`).
  - The crust reads as a cream floor tile (`mobile/r08-world6`).
- **Ruling.** Claude is right. This is not yet the 7 anchor.

### Rendering: 6.0 (Claude 6.0, Codex 6.5)
- **Grid artifact.** I cropped the desktop sky at 4×. A regular fine grid and blocky upscaling are clearly visible above the W2 board (`desktop/r04-world2`), and the same striping shows right of the frame in `desktop/r06-world4`.
- **Cold cells.** Oaklawn's cold slate cells sit under a warm sunset (`desktop/r06-world4`).
- **Hot Stone ring.** It is a translucent brown-gold ring, and it turns the pieces inside it semi-transparent (`desktop/r10-stone-fire`, `mobile/r10-stone-fire`).
- **Board seating.** The board has a frame but no visible cast shadow or vignette onto the painting. On phones, W2 sits in a flat fog band (`mobile/r04-world2`).
- **Credit.** There are contact shadows and soft additive beams (`mobile/s1-10`, `strips/mobile-s1` frame 5).
- **Ruling.** About half of the 7 checklist is met. Claude is right; Codex omitted the verified defects.

### Animation: 6.5 (both 6.5)
- **Swap and Cascade.** The swap lifts and crosses (`strips/mobile-s1` frames 1–3). The Cascade beam runs the row with a +540 popup and leaves a lingering glow (frames 5–6).
- **Crystal fire.** It has a readable white-flash anticipation, then rays and shards (`strips/mobile-s2` frames 2–4). The flash erases piece identity, as Codex notes.
- **Falls.** They are rigid translations with no stretch or squash (`mobile/s1-8`, `strips/mobile-s2` frames 6–7). Frames 9 and 10 of `strips/mobile-s1` are identical.
- **Ruling.** It sits above the 5 anchor, but the 7 anchor's landing bounce and follow-through are missing.

### UI: 6.0 (both 6.0)
- **Score overflow.** The running score is drawn outside the HUD panel on every desktop board: "2,160" (`desktop/r03-world1`), "480" (`desktop/r04-world2`), "1,339" (`desktop/r10-stone-fire`), "23,000" (`desktop/r13-win`).
- **Clipped callout.** "Spring Crystal!" runs off the left viewport edge (`desktop/r11-crystal-rays`).
- **Tip overlap.** Della's tip card covers Hammer, Line and Shuffle (`desktop/r17-tip`).
- **Win screen.** It is a static card with no banner or burst (`desktop/r13-win`, `mobile/r13-win`).
- **Desktop map.** It is a centred strip between blurred copies of itself (`desktop/r02-map`).
- **Ruling.** The style is consistent (`mobile/r14-lose`, `mobile/r15-intro`), but the 7 anchor requires that nothing overlaps or is clipped.

### Typography: 6.5 (both 6.5)
- **Strengths.** The display/UI pairing and scale are clear. The moves numerals read instantly (`mobile/r04-world2`, `mobile/s1-10`). Body copy on lore and help is clean (`mobile/r16-help`, `desktop/r13-win`).
- **Faults.**
  - The display callout is clipped (`desktop/r11-crystal-rays`).
  - The phone map header stacks four lines (`mobile/r02-map`).
  - "1. Magnolia Promenade" wraps in the HUD (`mobile/r12-callout`).
  - The logo is the UI face with an outline (`desktop/r01-title`).
- **Ruling.** It holds at 6.5.

### Readability: 6.5 (both 6.5)
- **Strengths.** All six kinds separate by silhouette and colour at phone size (`mobile/s1-10`, `mobile/r08-world6`).
- **Cascade.** It is nearly indistinguishable from a plain crystal (`desktop/r03-world1`).
- **New finding (both critics missed it).** On the night board, the tufa renders as dark brown lumps, while its goal chip shows light grey tufa (`desktop/r05-world3`, `mobile/r05-world3`).
- **Crust goal icon.** It reads as a plain green square, while the board shows a cream surround (`mobile/r08-world6`, `mobile/r15-intro`). Codex is right on this point. Its claim that the chains are unreadable is wrong: the padlocks read at phone size (`mobile/r05-world3`).
- **Steam.** It signals clearly, but the piece under it stays identifiable (`desktop/r17-tip`). This is minor.

### Mobile: 7.0 (Claude 7.0, Codex 6.0; differ by 1.0)
- **Verified.** The portrait layout follows the 7 anchor:
  - a compact top band (medallion, title, goals);
  - a full-width board, with nine columns at about 41 CSS px, the same as the genre leaders;
  - a four-booster tray plus pause in the thumb zone at about 60 px;
  - callouts above the board, and no clipping (`mobile/r08-world6`, `mobile/r05-world3`, `mobile/r09-cascade-fire`, `mobile/r13-win`).
- **Codex's case.** Its 44 px demand is infeasible at 9 columns, so I drop that cause.
- **Real deductions.** The map header runs to four lines and nodes 9–10 crowd each other (`mobile/r02-map`). The five-goal row is at its width limit (`mobile/r08-world6`).
- **Ruling.** Claude is right. 7.0, at the gate.

### Authenticity: 7.0 (both 7.0)
- **Reads as Hot Springs.** The tiled dome and Italianate Bathhouse Row (`desktop/r03-world1`, `mobile/s1-10`). Mountain Tower on the ridge (`desktop/r06-world4`). An Arlington-like hotel on a wet Central Ave (`desktop/r05-world3`). The Oaklawn grandstand and race (`desktop/r06-world4`). Lake Hamilton with quartz (`desktop/r07-world5`). A Garvan-style glass chapel (`mobile/r08-world6`).
- **Accuracy.** The tufa is drab grey. The lore card is sourced (`desktop/r13-win`), and the help screen states there are no geysers (`mobile/r16-help`).
- **Weak spots.** The W2 map is generic villa country (`desktop/r02-map`), and "Holiday Lights" shows no lights (`mobile/r08-world6`).
- **Della.** She is labelled fictional and presented with dignity (`mobile/r17-tip`, `desktop/r17-tip`).
- **Ruling.** It passes its gate of 6.

## IP
Clean. Both critics agree, and I saw nothing copied. The pieces, specials, blockers and chrome are original and themed.

## Ranked gaps (gain ÷ effort, top 10)
Effort weights: S = 1, M = 2, L = 3.

Merged:
- Claude's `G-desktop-hud-overflow`, `G-desktop-tip-overlap` and `G-desktop-callout-anchor` with Codex's `G-desktop-overflow`, into `G-desktop-left-column`.
- Claude's `G-board-cold-cells` with Codex's `G-world-lighting`, into `G-world-cell-tint`.
- Claude's `G-landing-squash` with Codex's `G-landing-response`.

Dropped:
- `G-phone-board-targets`: the cause is wrong. A 44 px cell is infeasible at 9 columns, and the cells already match the genre.
- Codex's chain-thickening half of `G-blocker-recognition`: the chains read fine.
- Below the top 10 on gain ÷ effort: blocker art pass (tufa studs, algae carpet, crust facets), title wordmark, steam opacity, supporting type.

Added: the night-tufa goal-icon mismatch.

1. **G-desktop-left-column** (ui, S, +0.6). Score overflow (`desktop/r03-world1`, `desktop/r13-win`), clipped callout (`desktop/r11-crystal-rays`), tip over tray (`desktop/r17-tip`).
   - **Fix:** move the running score inside the HUD panel's padding, right-aligned above the star bar. Clamp callout peak scale and tilt so the label's bounding box stays at x ≥ 8 px and inside the viewport. Anchor the tip card above the booster tray.
   - **Test:** the score box lies inside the panel box. The callout box lies inside the viewport. The tip and tray boxes do not intersect.
2. **G-backdrop-grid-artifact** (rendering, S, +0.4). A regular fine grid and blocky upscaling show in desktop skies (`desktop/r04-world2`, `desktop/r06-world4`).
   - **Fix:** remove the tiled overlay, or serve backdrops at 1280 px or wider with linear filtering.
   - **Test:** a 4× sky crop shows no periodic pattern.
3. **G-cascade-special-visibility** (readability, M, +0.75). The Cascade at rest reads as a plain crystal (`desktop/r03-world1`, `mobile/s1-10`).
   - **Fix:** draw two bold opaque cream/cyan bands across the piece in its sweep direction, with chevron arrowheads at both ends. Scale it to 1.1× and add a constant 1.2 s soft pulse.
   - **Test:** every Cascade is identifiable in a 50% downscale of `desktop/r03-world1`.
4. **G-hot-stone-burst** (rendering, S, +0.3). The burst is a muddy translucent ring that ghosts the pieces inside it (`desktop/r10-stone-fire`, `mobile/r10-stone-fire`).
   - **Fix:** replace it with an additive orange-to-white shockwave ring, 6 px thick and fading as it expands. Keep the pieces in the blast at full opacity until their pop.
   - **Test:** no piece alpha is below 1 in the fire frame.
5. **G-goal-icon-match** (readability, S, +0.3). Night tufa is dark while its goal chip is light grey (`desktop/r05-world3`). The crust chip is a plain green square while the board shows a cream frame (`mobile/r08-world6`, `mobile/r15-intro`).
   - **Fix:** render every goal icon from the same sprite and per-world tint as the board blocker.
   - **Test:** pixel-sample the mean colour of chip vs. board blocker; ΔE < 10.
6. **G-world-cell-tint** (rendering, S, +0.3). Cold slate cells sit under the warm Oaklawn sunset (`desktop/r06-world4`), and the board has no cast shadow onto the scene (`desktop/r04-world2`).
   - **Fix:** tint W4 cells to warm umber (about #3a3128) and W2 cells to a warmer teal. Add a 24 px, 35% black blurred drop shadow from the frame onto the backdrop.
7. **G-landing-squash** (animation, M, +0.5). Falls are rigid translations and frames 9–10 are identical (`strips/mobile-s1`, `strips/mobile-s2` frames 6–7).
   - **Fix:** scaleY 1.08 in flight. On landing, squash to scaleX 1.12 / scaleY 0.86 for about 70 ms, then rebound with an elastic ease. Stagger columns by 25 ms. Tint the Crystal target flash toward the piece colour instead of pure white, so the kind stays readable.
   - **Test:** a strip frame shows squashed pieces.
8. **G-map-header** (mobile, S, +0.25). The phone map header stacks four lines and nodes 9–10 crowd each other (`mobile/r02-map`).
   - **Fix:** put the header on one line ("W2 · The Mountain") with a single-line "4/10" postcard chip. Snap nodes to the path spline with at least 1.3× diameter spacing.
9. **G-pine-piece-style** (art, M, +0.4). The pine is matte and pastel with no specular highlight (`mobile/s1-10`, `strips/mobile-s2` frame 7).
   - **Fix:** re-render it with the set's material and lighting rig: saturated emerald, clearcoat specular, rim light, and the same shadow offset as the other pieces.
10. **G-win-celebration** (ui, M, +0.4). The win screen is a static card (`desktop/r13-win`, `mobile/r13-win`).
    - **Fix:** add a ribbon banner header, stars that slam in one by one with particle bursts, a score count-up, and steam sparkles behind the card.
    - **Test:** the win capture shows the banner and particles.

```json
{
  "loop": 4,
  "role": "judge",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.8, "evidence": ["desktop/r03-world1", "mobile/s1-10", "strips/mobile-s2", "desktop/r04-world2", "desktop/r07-world5", "mobile/r08-world6", "desktop/r05-world3"] },
    "rendering": { "score": 6.0, "confidence": 0.75, "evidence": ["desktop/r04-world2", "desktop/r06-world4", "desktop/r10-stone-fire", "mobile/r10-stone-fire", "mobile/r04-world2", "mobile/s1-10", "desktop/r11-crystal-rays"] },
    "animation": { "score": 6.5, "confidence": 0.7, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/s1-8", "mobile/s1-10"] },
    "ui": { "score": 6.0, "confidence": 0.85, "evidence": ["desktop/r03-world1", "desktop/r04-world2", "desktop/r10-stone-fire", "desktop/r11-crystal-rays", "desktop/r13-win", "desktop/r17-tip", "desktop/r02-map", "mobile/r13-win"] },
    "typography": { "score": 6.5, "confidence": 0.75, "evidence": ["desktop/r11-crystal-rays", "mobile/r02-map", "mobile/r12-callout", "mobile/r04-world2", "mobile/r16-help", "desktop/r01-title"] },
    "readability": { "score": 6.5, "confidence": 0.8, "evidence": ["mobile/s1-10", "mobile/r08-world6", "desktop/r03-world1", "desktop/r05-world3", "mobile/r05-world3", "mobile/r15-intro", "desktop/r17-tip"] },
    "mobile": { "score": 7.0, "confidence": 0.75, "evidence": ["mobile/r08-world6", "mobile/r05-world3", "mobile/r09-cascade-fire", "mobile/r13-win", "mobile/r02-map", "mobile/s1-10"] },
    "authenticity": { "score": 7.0, "confidence": 0.75, "evidence": ["desktop/r03-world1", "desktop/r05-world3", "desktop/r06-world4", "desktop/r07-world5", "mobile/r08-world6", "desktop/r13-win", "mobile/r16-help", "desktop/r02-map", "mobile/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Both critics and the judge found no copied commercial match-3 names, logos, piece designs or UI; pieces, specials, blockers and chrome are original and Hot Springs-themed." },
  "gaps": [
    { "id": "G-desktop-left-column", "category": "ui", "expectedGain": 0.6, "severity": 4, "effort": "S", "evidence": ["desktop/r03-world1", "desktop/r13-win", "desktop/r11-crystal-rays", "desktop/r17-tip"], "fix": "Move the running score inside the HUD panel padding, right-aligned above the star bar; clamp callout peak scale/tilt so its bounding box stays inside the viewport (x >= 8 px); anchor the tip card above the booster tray. Test: score box inside panel box, callout box inside viewport, tip and tray boxes do not intersect." },
    { "id": "G-backdrop-grid-artifact", "category": "rendering", "expectedGain": 0.4, "severity": 3, "effort": "S", "evidence": ["desktop/r04-world2", "desktop/r06-world4"], "fix": "Remove the tiled overlay or serve backdrops at >= 1280 px width with linear filtering. Test: a 4x crop of the desktop sky shows no periodic grid pattern." },
    { "id": "G-cascade-special-visibility", "category": "readability", "expectedGain": 0.75, "severity": 4, "effort": "M", "evidence": ["desktop/r03-world1", "mobile/s1-10"], "fix": "Draw two bold opaque cream/cyan bands across the piece in its sweep direction with chevron arrowheads at both ends, scale to 1.1x and add a constant 1.2 s soft pulse. Test: every Cascade is identifiable in a 50% downscale of desktop/r03-world1." },
    { "id": "G-hot-stone-burst", "category": "rendering", "expectedGain": 0.3, "severity": 3, "effort": "S", "evidence": ["desktop/r10-stone-fire", "mobile/r10-stone-fire"], "fix": "Replace the muddy translucent ring with an additive orange-to-white shockwave ring (6 px, fading as it expands) and keep blast pieces at full opacity until they pop. Test: no piece alpha below 1 in the fire frame." },
    { "id": "G-goal-icon-match", "category": "readability", "expectedGain": 0.3, "severity": 3, "effort": "S", "evidence": ["desktop/r05-world3", "mobile/r08-world6", "mobile/r15-intro"], "fix": "Render every goal-chip icon from the same sprite and per-world tint as its board blocker (night tufa dark, crust with the cream frame). Test: mean colour of chip icon vs board blocker differs by deltaE < 10." },
    { "id": "G-world-cell-tint", "category": "rendering", "expectedGain": 0.3, "severity": 2, "effort": "S", "evidence": ["desktop/r06-world4", "desktop/r04-world2"], "fix": "Tint W4 cells to warm umber (~#3a3128) and W2 cells to a warmer teal, and add a 24 px 35% black blurred drop shadow from the board frame onto the backdrop." },
    { "id": "G-landing-squash", "category": "animation", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/s1-8"], "fix": "Stretch falling pieces to scaleY 1.08, squash on landing to scaleX 1.12 / scaleY 0.86 for ~70 ms, rebound with an elastic ease, stagger columns by 25 ms; tint the Crystal target flash toward the piece colour instead of pure white. Test: a strip frame mid-landing shows squashed pieces." },
    { "id": "G-map-header", "category": "mobile", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["mobile/r02-map"], "fix": "Set the phone map header on one line with a single-line postcard chip, and snap level nodes to the path spline with >= 1.3x diameter spacing." },
    { "id": "G-pine-piece-style", "category": "art", "expectedGain": 0.4, "severity": 3, "effort": "M", "evidence": ["mobile/s1-10", "strips/mobile-s2"], "fix": "Re-render the pine piece with the set's material and lighting rig: saturated emerald, clearcoat specular, rim light and the same shadow offset as the other pieces." },
    { "id": "G-win-celebration", "category": "ui", "expectedGain": 0.4, "severity": 3, "effort": "M", "evidence": ["desktop/r13-win", "mobile/r13-win"], "fix": "Add a ribbon banner header, stars that slam in one by one with particle bursts, a score count-up and steam sparkles behind the card. Test: the win capture shows the banner and particles." }
  ],
  "verdict": "continue"
}
```
