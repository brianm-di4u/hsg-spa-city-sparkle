# Judge ruling: loop 2

**Total: 51.5/80 (6.44/10). Verdict: continue.** Up from 48 in loop 1. Only mobile and authenticity reach their gates. Six categories are still below 7. All measured gates pass: tests 93/93, perf and ip.

I opened these captures myself:
- strips: `strips/mobile-s1`, `strips/mobile-s2`
- mobile frames: `mobile/s1-1`, `mobile/s1-10`, `mobile/r02-map`, `mobile/r04-world2`, `mobile/r05-world3`, `mobile/r07-world5`, `mobile/r08-world6`
- desktop frames: `desktop/r01-title`, `desktop/r04-world2`, `desktop/r09-cascade-fire`, `desktop/r12-callout`, `desktop/r15-intro`
- contact sheets: `sheets/mobile-1`, `sheets/mobile-2`, `sheets/mobile-3`

No category has the critics more than 1.0 apart. Authenticity is exactly 1.0 apart (7 vs 6), so I rule on it with citations anyway.

## Prosecute, then defend

### Critic A (critic-claude): 52/80
- **Case that it over-scored.**
  - Mobile at 7.0 ignores clipping that the critic itself lists. "W1 · BATHHOUSE R…" appears in every frame of `strips/mobile-s1`, and the map header reads "World 2: Hot …" (`mobile/r02-map`).
  - Authenticity at 7.0 is generous. Monumental stacked terraces with waterfalls still dominate the right of `desktop/r01-title`, the right of `mobile/r02-map` and the W2 backdrop (`mobile/r04-world2`). The rubric penalises exactly this feature.
- **Case that it under-scored.**
  - Animation at 6.0 gives little credit for what this loop added. The "Cascade!" callout with a full-row beam (`mobile/s1-5`), the Crystal rays with sparkles, and a staggered mid-fall (`mobile/s2-6`) are real gains over pieces that just vanish.
  - Its factual claims all hold up in the captures:
    - star bar at about 95% when the score is 0 (`mobile/s1-1`);
    - star bar full at 540 of 12,000 (`desktop/r09-cascade-fire`);
    - star bar at about 2% at 2,160 of 9,840 (`sheets/mobile-1`, r03);
    - map header on W1 while the dialog is W2 (`desktop/r15-intro`);
    - "So close!" with no goals done and a score of 0 (`sheets/mobile-2`, r14).

### Critic B (critic-codex): 50.5/80
- **Case that it over-scored.**
  - Animation at 6.5 is not supported by its own text. It concedes that the anticipation and landing poses are "modest" and that the Crystal strip has no callout.
  - Two flaws it missed are visible in the captures:
    - `desktop/r12-callout` shows only "+540" and no chain callout;
    - in `strips/mobile-s2` the score jumps from 0 to 660 at frame 2, before anything clears.
- **Case that it under-scored.**
  - Rendering at 6.0 under-weights this loop's board work. The bevelled frame, top highlight and wide cast shadow clearly seat the board (`desktop/r09-cascade-fire`, `desktop/r04-world2`), and the pieces carry offset contact shadows (`mobile/s1-1`).
  - Mobile at 6.5 double-counts the truncation it already penalised under typography. It also treats the scenery between HUD and board as waste, when that placement puts the board low, near the thumb and the tray (`mobile/r08-world6`).
  - Its one unique catch is correct and is kept: the grey rectangles behind the specials in Help (`sheets/mobile-2`, r16).

## Category rulings

### Art: 6.5 (both critics 6.5)
- **Strengths.**
  - The six base pieces are glossy, with distinct silhouettes (`mobile/s1-1`).
  - The paintings are polished: the Park Hotel at night (`mobile/r05-world3`), the lake and dam (`mobile/r07-world5`), and the chapel and bridge (`mobile/r08-world6`).
- **What holds it below 7.**
  - The Cascade is a plain crystal with two tiny cyan tips (`mobile/s1-10`, row 4, column 4).
  - The Hot Stone reads as a sunburst sticker behind a drop, not as basalt (`mobile/r05-world3`, row 4, column 3).
  - The tufa blocker is a brown cookie with dot eyes (`mobile/r04-world2`).
  - The crust reads as flat white ice tiles (`mobile/r07-world5`).
  - The fans are matte next to the glossy drops.

### Rendering: 6.5 (Claude 6.5, Codex 6)
- **Strengths.** The board is seated: thick bevelled frame, top highlight and cast shadow (`desktop/r09-cascade-fire`, `desktop/r04-world2`). Pieces have contact shadows (`mobile/s1-1`).
- **What holds it below 7.**
  - There is no vignette and no darkening of the backdrop around the board.
  - The board's cool green cells ignore the warm sunset key light (`desktop/r09-cascade-fire`).
  - Help shows grey rectangles behind the specials (`sheets/mobile-2`, r16).
- **Ruling.** Claude is closer. The frame and shadow work is visible and earns the half point.

### Animation: 6.0 (Claude 6.0, Codex 6.5)
- **What works.**
  - `strips/mobile-s1`: a readable swap, a beam with the "Cascade!" callout (frame 5), a cleared row (frame 8) and a refill (frame 9).
  - `strips/mobile-s2`: the crystals flash and a staggered fall shows in frame 6.
- **What is missing.**
  - No frame shows pop anticipation, piece-coloured shards or a landing squash.
  - Frames 9 and 10 of `strips/mobile-s1` are almost identical.
  - There is no "Spring Crystal!" callout anywhere in `strips/mobile-s2`.
  - There is no chain callout in `desktop/r12-callout`.
  - The score does not count up (`strips/mobile-s2`).
- **Ruling.** Claude is right. Several "what changed" claims for this loop do not show in the strips.

### UI: 6.0 (both critics 6)
- **Strengths.** The HUD hierarchy is clear, and the cream, gold and teal dialogs are consistent (`sheets/mobile-2`, r13 and r15).
- **The core progress readout is wrong in almost every gameplay capture:**
  - about 95% full at a score of 0 (`mobile/s1-1`);
  - full with both end stars lit at 540 of 12,000 (`desktop/r09-cascade-fire`, `mobile/s1-10`);
  - about 2% at 2,160 of 9,840 (`sheets/mobile-1`, r03);
  - the three markers bunch into the right quarter of the bar (`mobile/r04-world2`), which breaks the "at least 20% apart" claim.
- **Other defects.**
  - The intro's map header says World 1 while the dialog says World 2 (`desktop/r15-intro`).
  - The lose dialog says "So close!" at zero progress and lists goals as text bullets (`sheets/mobile-2`, r14).
  - The map has a hard seam (`mobile/r02-map`, y ≈ 240).

### Typography: 6.5 (both critics 6.5)
- **Strengths.** A clear display face plus a UI face, and numerals read at a glance (`mobile/r05-world3`: "32 MOVES", "4,300").
- **Truncation on mobile.**
  - "W6 · GARVAN GARD…" (`mobile/r08-world6`).
  - "7. Three Sisters Sprin…" (`mobile/r07-world5`).
  - "World 2: Hot …" in the map header, which has room to spare (`mobile/r02-map`).
- **Weak title contrast.** The cream logo and the thin "HOT SPRINGS · ARKANSAS" line are low-contrast on a cream-peach sky (`desktop/r01-title`, `sheets/mobile-1`, r01).

### Readability: 6.5 (both critics 6.5)
- **Strengths.**
  - All six kinds separate by shape and colour, even mid-effect (`mobile/s2-6`).
  - The goal pills match the board (`mobile/r08-world6`).
  - The steam lets pieces show through (`sheets/mobile-3`, r17).
- **Weaknesses.**
  - The Cascade special is nearly invisible (`mobile/s1-10`).
  - W6 piles gold horseshoes, coin, rings and chains together (`mobile/r08-world6`).
  - The "Cascade!" wordmark sits over row 3 and the top of the swept row (`desktop/r09-cascade-fire`).

### Mobile: 7.0 (Claude 7.0, Codex 6.5)
- **Every point of the rubric's 7 anchor shows in the frames:**
  - the board is full width and sits low near the tray (`mobile/r08-world6`, `mobile/r05-world3`);
  - the HUD is compact, with five goal pills on one row (`mobile/r08-world6`);
  - the boosters are about 64 px and reachable;
  - the tip docks above the board without covering it (`sheets/mobile-3`, r17);
  - the dialogs fit (`sheets/mobile-2`).
- **Not penalised here.** Truncation is already scored under typography, and the seam under UI.
- **Ruling.** Claude is right. Gate met, narrowly.

### Authenticity: 6.5 (Claude 7, Codex 6; a gap of exactly 1.0)
- **Strong landmark set.**
  - Quapaw-style tiled dome (`desktop/r01-title`).
  - Arlington-style twin towers and an Art Deco Central Ave (`mobile/r05-world3`).
  - Oaklawn grandstand with horses (`sheets/mobile-1`, r06).
  - Lake and dam (`mobile/r07-world5`).
  - Garvan-style glass chapel (`mobile/r08-world6`).
  - The mountain tower on the hill.
  - A sourced Fordyce fact on the win card, and an honest disclaimer in Help (`sheets/mobile-2`, r13 and r16).
- **The penalty.** The terraces are now grey-tan, but they are still monumental stepped cascades: right of `desktop/r01-title`, right of `mobile/r02-map`, and `mobile/r04-world2`.
- **The guide.** Della is presented respectfully (`sheets/mobile-3`, r17), with no stereotype in the captures.
- **Ruling.** Each critic is half right. The landmarks earn more than Codex's 6, and the terraces cost the half point Claude did not take off.

## IP
Clean. Both critics agree, and I saw nothing copied. The chains and the booster tray are genre conventions.

## Ranked gaps (expected gain ÷ effort)

1. **G-starbar-fill (ui), +1.0, severity 5, effort S.**
   - Cause: the fill and the markers are not derived from the displayed score.
   - Fix: set fill = clamp(displayedScore ÷ star3Threshold, 0, 1) each time the score changes, with no width transition on level load. Place each marker at threshold_i ÷ star3Threshold. Light a marker only when the score is at or above its threshold.
   - Test: 0 gives 0% fill in `mobile/s1-1` and `mobile/s2-1`. 540 of 12,000 gives at most 5% fill with no lit star (`desktop/r09-cascade-fire`). 2,160 of 9,840 gives about 22% (r03).
2. **G-hud-truncation (typography), +0.5, severity 4, effort S.**
   - Fix: on portrait, fit-shrink the world label to 11 px and the level name to 16 px, then wrap the level name to two lines before any ellipsis. Abbreviate map headers ("W2 · Hot Springs Mtn"), and let the header title use the gutter space.
   - Test: no "…" in any mobile capture from r02 to r17, or in the strips.
3. **G-event-callouts-and-count (animation), +0.5, severity 3, effort S.**
   - Fix:
     - show "Spring Crystal!" on the Crystal fire;
     - show "Bubbly!" on wave 2 of a chain, and capture r12 at its peak;
     - tween the HUD score from its old value to its new value over the clear, about 400 ms;
     - anchor callouts at least one cell above the affected row.
   - Test:
     - `strips/*-s2` shows "Spring Crystal!" and at least one frame with a score between 0 and 660;
     - `desktop/r12-callout` shows "Bubbly!";
     - in r09 the swept row is uncovered.
4. **G-map-seam (ui), +0.5, severity 3, effort S.**
   - Fix: crossfade adjacent world map paintings with an alpha gradient of at least 120 px at every join, and keep the dotted route continuous across it.
   - Test: no straight horizontal edge at y ≈ 240 in `mobile/r02-map` or anywhere across the full scroll.
5. **G-dialog-consistency (ui), +0.25, severity 2, effort S.**
   - Fix:
     - the map header follows the world of the focused or intro level;
     - the lose dialog shows goal icon pills with remaining counts, and says "So close!" only when at least 50% of the goals are done;
     - Help's special icons are drawn with transparent alpha, with no grey rectangle.
   - Test: `desktop/r15-intro` header says W2. r14 shows pills. r16 has no grey boxes.
6. **G-special-silhouettes (readability), +1.0 across readability and art, severity 4, effort M.**
   - Fix:
     - Cascade: two gold arrow fins that extend at least 15% past the cell edge, a banded rim, and a looping shimmer;
     - Hot Stone: a basalt slab covering at least 90% of the cell, with orange ember cracks that pulse in emission.
   - Test: every special is found within 1 s in `mobile/s1-10` and `mobile/r05-world3` style frames.
7. **G-clear-and-land-juice (animation), +1.0, severity 4, effort M.**
   - Fix:
     - cleared pieces scale to 1.15 over about 60 ms, then burst into 6–10 shards in the piece's colour;
     - landing pieces squash for 2 frames to 0.85 y and 1.1 x;
     - add a strip frame inside the fall window.
   - Test: `strips/mobile-s1` shows shards in one frame and squashed pieces in another, and frames 9 and 10 differ.
8. **G-blocker-materials (art), +0.5, severity 3, effort M.**
   - Fix:
     - tufa: porous grey-tan limestone, without the dot-eye face;
     - crust: a beige-white crystalline mineral with a faceted edge, distinct from the steam and the gold base rings;
     - give the fan renders the same specular strength as the drop.
   - Test: in `mobile/r04-world2` and `mobile/r07-world5`, viewers name the blockers "stone" and "mineral crust", not "cookie" and "ice".
9. **G-board-seating (rendering), +0.5, severity 3, effort M.**
   - Fix: darken the backdrop by about 25% in a radial falloff behind the board, add a rim light on the frame's sun side in the colour of each world's key light, and tint the cells about 10% toward the backdrop's average colour.
   - Test: in `desktop/r09-cascade-fire` the board edge sits in a darkened halo, and the frame shows a warm edge toward the sun.
10. **G-terraces (authenticity), +0.5, severity 3, effort M.**
    - Fix: repaint the right side of the title, the W2 region of the map and the W2 backdrop. Use low, drab grey tufa outcrops on a wooded slope, one narrow Hot Water Cascade channel and steam, and no stacked pool terraces.
    - Test: no stepped terraces in `desktop/r01-title`, `mobile/r02-map` or `mobile/r04-world2`.

Noted but not ranked: on desktop, the HUD and boosters crowd the left edge while the right third of the screen is unused painting (`desktop/r04-world2`, `desktop/r09-cascade-fire`).

```json
{
  "loop": 2,
  "role": "judge",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/s1-1", "mobile/s1-10", "mobile/r05-world3", "mobile/r04-world2", "mobile/r07-world5", "mobile/r08-world6"] },
    "rendering": { "score": 6.5, "confidence": 0.65, "evidence": ["desktop/r09-cascade-fire", "desktop/r04-world2", "mobile/s1-1", "sheets/mobile-2"] },
    "animation": { "score": 6.0, "confidence": 0.75, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/s1-10", "desktop/r12-callout"] },
    "ui": { "score": 6.0, "confidence": 0.8, "evidence": ["mobile/s1-1", "mobile/s1-10", "desktop/r09-cascade-fire", "sheets/mobile-1", "mobile/r04-world2", "desktop/r15-intro", "sheets/mobile-2", "mobile/r02-map"] },
    "typography": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/r05-world3", "mobile/r08-world6", "mobile/r07-world5", "mobile/r02-map", "desktop/r01-title", "sheets/mobile-1"] },
    "readability": { "score": 6.5, "confidence": 0.7, "evidence": ["strips/mobile-s2", "mobile/r08-world6", "sheets/mobile-3", "mobile/s1-10", "desktop/r09-cascade-fire"] },
    "mobile": { "score": 7.0, "confidence": 0.65, "evidence": ["mobile/r08-world6", "mobile/r05-world3", "sheets/mobile-3", "sheets/mobile-2", "mobile/r02-map"] },
    "authenticity": { "score": 6.5, "confidence": 0.7, "evidence": ["desktop/r01-title", "mobile/r05-world3", "sheets/mobile-1", "mobile/r07-world5", "mobile/r08-world6", "mobile/r02-map", "mobile/r04-world2", "sheets/mobile-3"] }
  },
  "ip": { "clean": true, "notes": "Both critics and the judge found nothing copied. The pieces, specials, logo and HUD are original; chains, ice-like tiles and the booster tray are genre conventions." },
  "gaps": [
    { "id": "G-starbar-fill", "category": "ui", "expectedGain": 1.0, "severity": 5, "effort": "S", "evidence": ["mobile/s1-1", "mobile/s1-10", "desktop/r09-cascade-fire", "sheets/mobile-1", "mobile/r04-world2"], "fix": "Fill = clamp(displayedScore / star3Threshold, 0, 1), recomputed on every score change, with no width transition on level load. Each marker sits at threshold_i / star3Threshold and lights only when score >= threshold_i. Test: 0% at score 0 (s1-1, s2-1); <=5% with no lit star at 540/12,000 (r09); about 22% at 2,160/9,840 (r03)." },
    { "id": "G-hud-truncation", "category": "typography", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r08-world6", "mobile/r07-world5", "mobile/r02-map", "strips/mobile-s1"], "fix": "Portrait: fit-shrink the world label to 11 px and the level name to 16 px, then wrap the level name to 2 lines before eliding. Abbreviate map headers ('W2 · Hot Springs Mtn') and widen the header title into the free space. Test: no ellipsis in any mobile capture r02-r17 or in the strips." },
    { "id": "G-event-callouts-and-count", "category": "animation", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["strips/mobile-s2", "desktop/r12-callout", "desktop/r09-cascade-fire"], "fix": "Show 'Spring Crystal!' on the Crystal fire and 'Bubbly!' on chain wave 2 (capture r12 at its peak). Tween the HUD score from old to new over ~400 ms during the clear. Anchor callouts at least 1 cell above the affected row. Test: s2 shows the callout and a mid-count score; r12 shows 'Bubbly!'; the r09 swept row is uncovered." },
    { "id": "G-map-seam", "category": "ui", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r02-map"], "fix": "Crossfade adjacent world map paintings with an alpha gradient of at least 120 px at every join and keep the dotted route continuous across it. Test: no straight horizontal edge near y 240 in mobile/r02-map or anywhere in the full scroll." },
    { "id": "G-dialog-consistency", "category": "ui", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["desktop/r15-intro", "sheets/mobile-2"], "fix": "The map header follows the intro level's world. The lose dialog shows goal icon pills with remaining counts and says 'So close!' only when goals are at least 50% done. Help special icons use transparent alpha, with no grey rectangles. Test: the r15 header reads W2, r14 shows pills, r16 has no grey boxes." },
    { "id": "G-special-silhouettes", "category": "readability", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["mobile/s1-10", "mobile/r05-world3"], "fix": "Cascade: two gold arrow fins extending at least 15% past the cell edge, a banded rim and a shimmer loop. Hot Stone: a basalt slab covering at least 90% of the cell, with pulsing emissive orange ember cracks. Test: every special is found within 1 s in s1-10 and r05-style frames at 390 px." },
    { "id": "G-clear-and-land-juice", "category": "animation", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["strips/mobile-s1", "strips/mobile-s2"], "fix": "Cleared pieces scale to 1.15 over ~60 ms, then burst into 6-10 shards in the piece's colour. Landing pieces squash for 2 frames to 0.85 y and 1.1 x. Add a strip sample inside the fall window. Test: an s1 frame shows shards, another shows squashed pieces, and s1 frames 9 and 10 differ." },
    { "id": "G-blocker-materials", "category": "art", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/r04-world2", "mobile/r07-world5", "mobile/r08-world6"], "fix": "Tufa: porous grey-tan limestone texture, with no dot-eye face. Crust: a beige-white crystalline mineral with a faceted edge, distinct from steam and the gold base rings. Raise the fan's specular to match the drop. Test: viewers name the r04 and r07 blockers 'stone' and 'mineral crust', not 'cookie' and 'ice'." },
    { "id": "G-board-seating", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r09-cascade-fire", "desktop/r04-world2"], "fix": "Darken the backdrop ~25% in a radial falloff behind the board, add a rim light on the frame's sun side in each world's key-light colour, and tint the cells ~10% toward the backdrop's average colour. Test: in r09 the board edge sits in a darkened halo and the frame shows a warm edge toward the sun." },
    { "id": "G-terraces", "category": "authenticity", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r01-title", "mobile/r02-map", "mobile/r04-world2"], "fix": "Repaint the title's right side, the map's W2 region and the W2 backdrop: low drab grey tufa outcrops on a wooded slope, a single narrow Hot Water Cascade channel and steam, and no stacked pool terraces. Test: no stepped terraces in r01, r02 or r04." }
  ],
  "verdict": "continue"
}
```
