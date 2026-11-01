# Judge ruling: loop 5

**Total 52.0/80 (6.50/10). Verdict: continue.** Only authenticity (7.0, gate 6) clears its gate. The other seven categories sit at 6.0–6.5 against a gate of 7.

Critic totals: Claude 51.5, Codex 53.5. No category differs by more than 0.5 between the critics, so the >1.0 verification rule never triggers. I still opened and measured the disputed or load-bearing claims myself; the results are below.

## Verification of disputed claims (measured on the captures)

- **Desktop HUD score overflow (`desktop/r10-stone-fire`, `desktop/r09-cascade-fire`, `desktop/r11-crystal-rays`, `desktop/r03-world1`).** Partly confirmed, with a corrected cause.
  - At y=295 in r10, the cream "9" of "1,339" runs to x=282. Its dark outline sits at x=283, and the panel's dark fill ends at x=283, with backdrop from x=284. The glyph is flush with the panel edge, with zero padding. It is not cut off, and it does not sit "on the backdrop".
  - The cause is the score pop-scale. In `desktop/s1-6` (mid-pop) "1,080" ends at x≈283. In `desktop/s1-10` (at rest) the same "1,080" ends at x≈263, about 20 px inside the edge.
  - So the defect is a right-anchored pop with no reserved padding, not a static overflow. It is still a real "nothing overlapping or clipped" failure in 4 of the 5 desktop fire frames.
- **"No shake, board rock-steady" (Claude, animation).** Refuted.
  - I measured the board-cell left and top edges per frame. The board sits at (488, 98) at rest in `desktop/s1-1..4` and `s1-6..10`.
  - It is displaced to (491, 97) in `desktop/s1-5` (Cascade fire), (491, 98) in `desktop/r10-stone-fire`, (494, 99) in `desktop/s2-2`, (492, 101) in `desktop/s2-3` and (486, 100) in `desktop/s2-4`.
  - A 2–6 px shake therefore exists. It is just too small and short to read at strip scale. The fix is amplitude and timing, not adding a shake from scratch.
- **Dead frames at the end of s1 (Claude).** Confirmed. `desktop/s1-8`, `s1-9` and `s1-10` are near-identical, and so are `strips/mobile-s1` frames 8–10. No landing squash or rebound is legible in any sampled frame. `desktop/s1-7` shows pieces mid-fall with no visible stretch.
- **Crystal opens with opaque white blobs (both critics).** Confirmed. In `desktop/s2-2` every purple target is buried under a flat white, non-additive cotton puff, and the centre puff is about a cell wide. These are the same white blobs as the steam blocker in `desktop/r17-tip`.
- **Crust goal chip mismatch (Codex).** Confirmed by a crop of `mobile/r08-world6`. The HUD crust chip is a plain teal square. On the board, crust reads as a cream mineral ring around a dark inset, so the chip does not match what the player sees.
- **Phone map subtitle "butts against" the ★ pill (Claude).** Overstated. In `mobile/r02-map` the gap is about 10 device px (about 5 CSS px): tight, but not touching.
- **Lose dialog orphans Map (Claude).** Confirmed on desktop (`desktop/r14-lose`: Map sits alone on a third row). The phone version is fine: Retry and Map share a row (`mobile/r14-lose`).
- **Phone cells ≥44 px on nine-column boards (Codex's test).** Not feasible: 9 × 44 = 396 px is more than the 390 px viewport. Nine-column boards measure about 42 CSS px per cell (`mobile/r05-world3`). Seven-column boards already reach about 53 CSS px (`mobile/s1-8`). I dropped that test from the merged gap.

## Prosecute / defend

**critic-claude (51.5)**
- *Over-scored?* Authenticity 7.0 is generous: the title's chevron-tiled dome and villa cluster lean generic-Mediterranean (`desktop/r01-title`), which Claude itself conceded. Readability 6.5 survives steam and crust both reading as "highlight or blur" (`desktop/r17-tip`, `mobile/r07-world5`) only because the plain pieces are excellent.
- *Under-scored?* Animation 6.0 rests partly on a false "no shake" claim: I measured a 2–6 px board shake in `desktop/s1-5`, `desktop/s2-2..4` and `desktop/r10-stone-fire`. Its UI "overflow" is really zero padding during a pop (`desktop/s1-10` shows the score at rest well inside the panel). It also overweights the pine: in `mobile/s1-8` the pine is a clearly lighter green with a pale rim against the dark cells, and readable, just slim.

**critic-codex (53.5)**
- *Over-scored?*
  - Rendering 7 ignores the non-additive white Crystal puffs (`desktop/s2-2`) and the muddy beige Hot Stone rings (`desktop/r10-stone-fire`). The 7 anchor requires soft additive effects.
  - Typography 7 contradicts its own observations: wrapping titles crowd the goal row (`mobile/r06-world4`, `mobile/r12-callout`) and the desktop booster captions are tiny (`desktop/r03-world1`). The 7 anchor says "nothing clipped or crowded".
  - UI 6.5 misses the flush score (`desktop/r10-stone-fire`), the unlabelled target pill (`desktop/r03-world1`) and the orphaned Map button (`desktop/r14-lose`).
- *Under-scored?* Its readability and art comments on the locks are strong and correct (`mobile/r05-world3`). Its mobile "large scenic band" point is fair, but its ≥44 px cell test is impossible at nine columns, so mobile is not worse than 6.5.

## Category rulings

- **Art: 6.5** (both 6.5).
  - The plain pieces are glossy, distinct and share one palette (`mobile/s1-8`, `desktop/r03-world1`).
  - The blockers lack material identity. Crust is a cream cell tint (`desktop/r07-world5`, `desktop/r08-world6`). Steam is an undifferentiated white blur (`desktop/r17-tip`). Locks are gold lattices covering the pieces (`mobile/r05-world3`).
  - The paintings are richer than the board assets (`mobile/r06-world4`).
- **Rendering: 6.5** (Claude 6.5, Codex 7).
  - The board is framed, seated and shadowed (`desktop/r06-world4`, `mobile/r05-world3`), and the Cascade beam is properly additive (`desktop/r09-cascade-fire`).
  - The Crystal opening is opaque white (`desktop/s2-2`), and the Hot Stone reads as beige concentric rings rather than light (`desktop/r10-stone-fire`). The 7 anchor's "additive and soft" is not met. Claude is closer.
- **Animation: 6.5** (Claude 6.0, Codex 6.5).
  - The swap has in-betweens, the Cascade sweep is legible, and a small shake exists (`desktop/s1-5`, `desktop/s2-2..4`, measured), so Claude's 6.0 premise is partly wrong.
  - Against that: three dead settle frames (`strips/desktop-s1` and `strips/mobile-s1`, frames 8–10), no visible landing squash or rebound (`desktop/s1-7`), and Crystal targets buried in white puffs (`strips/desktop-s2` frames 2–3). Codex is right.
- **UI: 6.0** (Claude 6.0, Codex 6.5).
  - The score is flush with the panel edge during its pop (`desktop/r10-stone-fire`, `desktop/s1-6`).
  - The unlabelled "⭐ 9,840 pts" target out-ranks the live score (`desktop/r03-world1`, `mobile/r03-world1`).
  - The desktop lose dialog orphans Map (`desktop/r14-lose`).
  - The map nodes are plain discs, and the desktop map is a narrow centre column with blurred side bands (`desktop/r02-map`, `mobile/r02-map`).
  - The win card did improve: ribbon, sunburst, count-up (`mobile/r13-win`). Claude is right.
- **Typography: 6.5** (Claude 6.5, Codex 7).
  - The display and UI faces and the numerals are solid (`desktop/r16-help`, `mobile/r05-world3`).
  - Phone titles wrap onto the goal row (`mobile/r06-world4` "9. Backstretch / Chute", `mobile/r12-callout` "1. Magnolia / Promenade").
  - The score has no padding (`desktop/r10-stone-fire`), and the desktop booster captions and Della's tag are tiny (`desktop/r17-tip`).
  - These fail "nothing clipped or crowded". Claude is right.
- **Readability: 6.5** (both 6.5).
  - The six plain kinds read instantly (`mobile/s1-8`, `mobile/r08-world6`).
  - The locks obscure their pieces (`mobile/r05-world3`). Crust reads as a selection highlight (`mobile/r07-world5`), and its HUD chip is a teal square that does not match the board (`mobile/r08-world6`, crop verified). Steam equals the Crystal puff (`desktop/r17-tip` vs `desktop/s2-2`).
- **Mobile: 6.5** (both 6.5).
  - Boards fill the width: about 53 CSS px per cell at seven columns (`mobile/s1-8`) and about 42 at nine (`mobile/r05-world3`). The tray is reachable and the dialogs fit (`mobile/r13-win`, `mobile/r14-lose`).
  - Against that: a band of about 430 device px of painting between the HUD and a seven-column board (`mobile/s1-8`, `mobile/r12-callout`). The HUD floats on the painting with no backing. The five-goal row is dense (`mobile/r08-world6`).
- **Authenticity: 7.0** (both 7.0).
  - The Arlington-style twin towers at night (`mobile/r05-world3`), the Oaklawn-style grandstand (`mobile/r06-world4`), the Garvan glass chapel and stone bridge (`mobile/r08-world6`) and a sourced Fordyce postcard (`mobile/r13-win`) read as Hot Springs.
  - Della is dignified and labelled fictional (`desktop/r17-tip`).
  - The title dome and villas lean generic (`desktop/r01-title`).

**IP:** clean. Both critics agree, and nothing in the captures copies a commercial match-3's names, logos, pieces or UI.

## Ranked gaps (expected gain ÷ effort, top 10)

1. **G-score-clip** (ui, sev 3, S, +0.5).
   - **Cause:** the right-anchored score pop-scale has no reserved padding.
   - **Fix:** give the desktop score a 16 px right inset and tabular numerals, and scale the pop from the right edge.
   - **Test:** at peak pop with 99,999, the glyph box ends at least 12 px inside the panel.
   - **Evidence:** `desktop/r10-stone-fire`, `desktop/s1-6`, `desktop/s1-10`.
2. **G-target-label** (ui, sev 3, S, +0.5).
   - **Fix:** relabel the target pill "Target 9,840" in a smaller, muted style, or move it onto the star bar as a tick.
   - **Fix:** the live score becomes the largest number in the HUD block.
   - **Evidence:** `desktop/r03-world1`, `mobile/r03-world1`, `mobile/r17-tip`.
3. **G-crystal-puff** (rendering, sev 3, S, +0.5). Merges Claude's G-crystal-puff with the Crystal half of Codex's G-effect-sequencing.
   - **Fix:** replace the opaque white puffs with an additive flash tinted to the target colour (peak alpha 0.6 or less, at most 2 frames), keeping each target's coloured rim visible.
   - **Fix:** run one ray from the crystal to each target before it pops.
   - **Fix:** drop the full-board wash.
   - **Test:** every target is identifiable in every s2 frame.
   - **Evidence:** `desktop/s2-2`, `strips/desktop-s2`, `strips/mobile-s2`.
4. **G-mobile-hud-wrap** (typography, sev 2, S, +0.5).
   - **Fix:** auto-shrink phone level names to one line (minimum 16 px).
   - **Fix:** put five or more goals on two deliberate rows of chips.
   - **Fix:** widen the phone star bar to at least 140 CSS px with a visible fill.
   - **Test:** no title glyph overlaps the goal row's band in any r03–r08 phone frame.
   - **Evidence:** `mobile/r06-world4`, `mobile/r12-callout`, `mobile/r08-world6`.
5. **G-lose-layout** (ui, sev 1, S, +0.25).
   - **Fix:** put "+5 moves", Retry and Map on one row on desktop (Map as a compact secondary button), as on phone.
   - **Evidence:** `desktop/r14-lose`, `mobile/r14-lose`.
6. **G-impact-timing** (animation, sev 3, M, +0.5). Merges Claude's G-impact-shake with the refill half of Codex's G-effect-sequencing.
   - **Cause (corrected):** a shake already exists but peaks at only 2–6 px.
   - **Fix:** raise it to a decaying 8 px desktop / 6 CSS px phone shake over 220 ms on Hot Stone and Crystal, plus a 1.03 board punch on Cascade.
   - **Fix:** add an anticipation squash on the special (scale 0.85 for 60 ms) before it fires.
   - **Fix:** stagger the refill landings by 30 ms per row, with a landing squash of scaleY 0.8.
   - **Fix:** trim the settle so at most one strip frame is static.
   - **Evidence:** `strips/desktop-s1` frames 7–10, `strips/mobile-s1`, `desktop/s2-2`.
7. **G-mobile-layout** (mobile, sev 3, M, +0.5). Merges Claude's G-mobile-deadband with Codex's G-phone-layout, minus the infeasible 44 px nine-column test.
   - **Fix:** centre the board vertically between the HUD's bottom and the tray's top.
   - **Fix:** scale seven-column and cross boards to the full width (cells up to about 54 CSS px).
   - **Fix:** put a translucent rounded backing panel (about 55% dark) behind the phone HUD.
   - **Test:** the gaps above and below the board differ by no more than 24 CSS px.
   - **Evidence:** `mobile/s1-8`, `mobile/r12-callout`, `mobile/r03-world1`.
8. **G-lock-clarity** (readability, sev 3, M, +0.5). Codex's estimate is cut from +1.0 to +0.5.
   - **Fix:** replace the corner-to-corner gold loops with a compact padlock in the bottom-right quadrant and two thin chain bands, covering no more than 35% of the piece's area.
   - **Test:** every locked kind on the Park Hotel board is identifiable at native phone scale.
   - **Evidence:** `mobile/r05-world3`, `desktop/r05-world3`.
9. **G-crust-steam** (art, sev 3, M, +0.5). Merges Claude's G-crust-material with Codex's crust-goal mismatch.
   - **Fix:** render the crust as a cracked grey-tan mineral slab with two damage states, and regenerate its HUD goal chip from the same render so the chip matches the board.
   - **Fix:** make steam a soft-edged, drifting, swirled vapour with a faint warm tint, distinct from any clear effect.
   - **Evidence:** `mobile/r07-world5`, `mobile/r08-world6`, `desktop/r17-tip`.
10. **G-interface-finish** (ui, sev 2, M, +0.5). Merges Claude's G-map-nodes and G-win-stars with Codex's G-interface-finish.
    - **Fix (map):** themed map nodes (tile medallions or bathhouse plaques), a glowing path up to the current node and a player marker.
    - **Fix (map):** fill the desktop map's blurred side bands with a widened painting or a framed border.
    - **Fix (win):** glossy bevelled win stars that stamp in with a bounce.
    - **Evidence:** `desktop/r02-map`, `mobile/r02-map`, `mobile/r13-win`.

Below the cutoff:
- **G-pine-mass** (art, +0.25, M): chunkier conical pine filling at least 70% of its cell; the current one is readable in `mobile/s1-8`, just slim.
- **G-piece-finish** (art, +0.5, L): thicker fans and richer gem facets.

```json
{
  "loop": 5,
  "role": "judge",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/s1-8", "desktop/r03-world1", "desktop/r07-world5", "desktop/r17-tip", "mobile/r05-world3", "mobile/r06-world4"] },
    "rendering": { "score": 6.5, "confidence": 0.7, "evidence": ["desktop/r06-world4", "mobile/r05-world3", "desktop/r09-cascade-fire", "desktop/s2-2", "desktop/r10-stone-fire"] },
    "animation": { "score": 6.5, "confidence": 0.65, "evidence": ["strips/desktop-s1", "strips/mobile-s1", "strips/desktop-s2", "desktop/s1-5", "desktop/s1-7", "desktop/s2-2"] },
    "ui": { "score": 6.0, "confidence": 0.75, "evidence": ["desktop/r10-stone-fire", "desktop/s1-6", "desktop/s1-10", "desktop/r03-world1", "desktop/r14-lose", "desktop/r02-map", "mobile/r13-win"] },
    "typography": { "score": 6.5, "confidence": 0.7, "evidence": ["desktop/r16-help", "mobile/r05-world3", "mobile/r06-world4", "mobile/r12-callout", "desktop/r10-stone-fire", "desktop/r17-tip"] },
    "readability": { "score": 6.5, "confidence": 0.7, "evidence": ["mobile/s1-8", "mobile/r08-world6", "mobile/r05-world3", "mobile/r07-world5", "desktop/r17-tip", "desktop/s2-2"] },
    "mobile": { "score": 6.5, "confidence": 0.7, "evidence": ["mobile/s1-8", "mobile/r05-world3", "mobile/r12-callout", "mobile/r08-world6", "mobile/r13-win", "mobile/r14-lose"] },
    "authenticity": { "score": 7.0, "confidence": 0.7, "evidence": ["mobile/r05-world3", "mobile/r06-world4", "mobile/r08-world6", "mobile/r13-win", "desktop/r17-tip", "desktop/r01-title"] }
  },
  "ip": { "clean": true, "notes": "Both critics and the judge find no copied commercial match-3 names, logos, piece designs or UI; only generic genre conventions." },
  "gaps": [
    { "id": "G-score-clip", "category": "ui", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/r10-stone-fire", "desktop/s1-6", "desktop/s1-10"], "fix": "The score pop-scale is right-anchored with no padding (glyph flush at x=282 vs panel edge x=283 mid-pop; 20px inside at rest). Give the desktop score a 16px right inset and tabular numerals, and scale the pop from the right edge; at peak pop with 99,999 the glyph box must end >=12px inside the panel." },
    { "id": "G-target-label", "category": "ui", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/r03-world1", "mobile/r03-world1", "mobile/r17-tip"], "fix": "Relabel the target pill 'Target 9,840' in a smaller muted style (or show it as a tick on the star bar) and make the live score the largest number in the HUD block." },
    { "id": "G-crystal-puff", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["desktop/s2-2", "strips/desktop-s2", "strips/mobile-s2"], "fix": "Replace the opaque white Crystal puffs with an additive flash tinted to the target colour (peak alpha <=0.6, <=2 frames) that keeps each target's coloured rim, fire one ray from the crystal to each target before it pops, and drop the board wash; every target must stay identifiable in every s2 frame." },
    { "id": "G-mobile-hud-wrap", "category": "typography", "expectedGain": 0.5, "severity": 2, "effort": "S", "evidence": ["mobile/r06-world4", "mobile/r12-callout", "mobile/r08-world6"], "fix": "Auto-shrink phone level names to one line (min 16px), lay out 5+ goals as two deliberate chip rows, and widen the phone star bar to >=140 CSS px with a visible fill; no title glyph may overlap the goal row's band in any phone r03-r08 frame." },
    { "id": "G-lose-layout", "category": "ui", "expectedGain": 0.25, "severity": 1, "effort": "S", "evidence": ["desktop/r14-lose", "mobile/r14-lose"], "fix": "Put '+5 moves', Retry and Map on one row in the desktop lose dialog (Map as a compact secondary button), matching the phone layout." },
    { "id": "G-impact-timing", "category": "animation", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["strips/desktop-s1", "strips/mobile-s1", "desktop/s2-2"], "fix": "The existing shake peaks at only 2-6px: raise it to a decaying 8px (desktop) / 6 CSS px (phone) shake over 220ms on Hot Stone and Crystal plus a 1.03 board punch on Cascade; add a 0.85 anticipation squash for 60ms on the special before it fires; stagger refill landings 30ms per row with a scaleY 0.8 landing squash; trim the settle so at most one strip frame is static." },
    { "id": "G-mobile-layout", "category": "mobile", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/s1-8", "mobile/r12-callout", "mobile/r03-world1"], "fix": "On phones, centre the board vertically between the HUD bottom and the tray top (the gaps above and below differ by <=24 CSS px), scale 7-column and cross boards to the full width (cells up to ~54 CSS px), and put a ~55% dark rounded backing panel behind the HUD." },
    { "id": "G-lock-clarity", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/r05-world3", "desktop/r05-world3"], "fix": "Replace the corner-to-corner gold lock loops with a compact padlock in the bottom-right quadrant and two thin chain bands covering <=35% of the piece's area; every locked kind on the Park Hotel board must be identifiable at native phone scale." },
    { "id": "G-crust-steam", "category": "art", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/r07-world5", "mobile/r08-world6", "desktop/r17-tip"], "fix": "Render the crust as a cracked grey-tan mineral slab with two damage states and regenerate its HUD goal chip from the same render (the chip is currently a teal square); make steam a soft-edged, drifting, swirled vapour with a faint warm tint, distinct from any clear effect." },
    { "id": "G-interface-finish", "category": "ui", "expectedGain": 0.5, "severity": 2, "effort": "M", "evidence": ["desktop/r02-map", "mobile/r02-map", "mobile/r13-win"], "fix": "Themed map nodes (tile medallions or bathhouse plaques), a glowing path up to the current node and a player marker; fill the desktop map's blurred side bands with a widened painting or a framed border; glossy bevelled win stars that stamp in with a bounce." }
  ],
  "verdict": "continue"
}
```
