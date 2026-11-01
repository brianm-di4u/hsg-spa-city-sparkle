# Critic A (critic-claude): loop 2

## Verdict
Spa City Sparkle now looks like a real product in still frames. The six Blender pieces are clean and glossy, with clearly different silhouettes. The world paintings are lush, and you can see the Hot Springs landmarks in them. The board frame, bevel and cast shadow seat the board better than a flat slab would. It still falls short of the genre leaders, and some changes listed as fixed this loop are not fixed in the captures:
- **Star bar.** It is still wrong. It is full, with both end stars lit, at 540 of 12,000 points (`desktop/r09-cascade-fire`, `mobile/s1-6`…`s1-10`). It is about 35% full at a score of 0 (`mobile/s2-1`, `mobile/s1-1`). It is almost empty at 2,160 of 9,840 (`desktop/r03-world1`).
- **Callouts.** The Crystal strip has no "Spring Crystal!" callout (`strips/mobile-s2`). The "chain callout" capture shows only "+540" (`desktop/r12-callout`).
- **Score count-up.** In s2 the score jumps to 660 on the frame the effect starts (`mobile/s2-2`). It does not count up.
- **Specials.** The Cascade special is still only a purple crystal with two tiny cyan arrow tips. You can barely tell it from a plain crystal at phone size (`mobile/s1-10`, `desktop/r03-world1`).
- **Truncation.** Mobile labels still end in an ellipsis: "BATHHOUSE R…", "Three Sisters Sprin…", "World 2: Hot …".

The animation reads as competent but thin. A beam, a fade and a fall, with no pop anticipation and no landing squash I can see in any frame. Overall: a solid mid-tier mobile match-3 that looks good at rest, with a buggy HUD and modest juice. Continue.

## Scores

### Art: 6.5
- **Strengths.**
  - The six kinds are clean, glossy renders with distinct silhouettes and specular highlights: drop, fan, horseshoe, flower, crystal and pine (`mobile/r03-world1`, `mobile/s1-10`).
  - The paintings are polished and rich. The Park Hotel and Art Deco tower at night (`mobile/r05-world3`), the lake and dam at dusk (`mobile/r07-world5`) and the Garvan chapel and bridge (`mobile/r08-world6`) are all strong.
- **Weak specials.**
  - The Cascade is a plain crystal plus tiny arrow tips and a faint glow (`mobile/s1-10`, column 4, row 4).
  - The Hot Stone is a small dark disc with yellow crack lines behind the piece. At 390 px it reads as a sunburst sticker, not a basalt stone (`mobile/r05-world3`, row 4, column 3).
- **Blockers have weak material identity.**
  - The tufa blocker is a brown lumpy cookie with two dots for eyes (`mobile/r04-world2`).
  - Mineral crust reads as generic white ice tiles (`mobile/r07-world5`).
  - Chains are a stock chain-and-padlock overlay (`mobile/r05-world3`).
- **The pine fits poorly.** It is a lighter-green Christmas tree with a star (`mobile/s1-10`). Its matte, toy-like look sits oddly next to the jewel-like crystal and drop.

### Rendering: 6.5
- **Strengths.**
  - The thicker bevelled frame, top highlight and wide cast shadow do seat the board (`desktop/r03-world1`, `desktop/r05-world3`).
  - Pieces have offset contact shadows.
  - Cell colours follow the world: green, teal, navy, blue (sheets `desktop-1` and `desktop-2`).
  - Additive glows are soft. The Hot Stone ring (`desktop/r10-stone-fire`) and the Crystal starburst (`desktop/r11-crystal-rays`) are pleasant.
- **Weaknesses.**
  - The board is still an opaque dark slab over the painting. There is no vignette or local darkening of the backdrop around it, and no warm rim light from the scene's sunset (`desktop/r09-cascade-fire`).
  - On desktop the right third of the screen is unused painting while the HUD, boosters and tutorial pile up on the left (`desktop/r17-tip`).
  - Light does not respond to events beyond the local flash.

### Animation: 6.0
- **What works, from `strips/mobile-s1`.**
  - Frames 1–4 show the swap with a slight overshoot.
  - Frame 5 is a strong white beam sweeping the row, with the "Cascade!" callout. Frames 6–7 fade it out.
  - Frame 8 leaves a clean empty row.
  - Frame 9 is the refill.
- **No impact frames.** No frame shows pop anticipation (scale-up before the burst) or piece-coloured debris; the cleared pieces simply whiten and vanish. The whole fall happens between frames 8 and 9, and frames 9 and 10 are almost identical. The "deeper landing squash" is not visible anywhere.
- **`strips/mobile-s2` is better but incomplete.**
  - Good: frames 2–4 show every crystal flashing white with sparkles and a light shake (the board offset in `mobile/s2-2`), and frame 6 shows a real staggered mid-fall.
  - Missing: there is no "Spring Crystal!" callout in any of its 8 frames.
  - The score jumps from 0 to 660 at frame 2, before any piece has cleared.
- `desktop/r12-callout`, billed as the chain callout, shows no "Bubbly!", only "+540".

### UI: 6.0
- **Strengths.**
  - The HUD hierarchy is clear: a big gold moves medallion, level name, goal pills and score.
  - The themed style (cream paper, gold, teal) is consistent across the win, lose, intro and help screens (`mobile/r13-win`, `mobile/r14-lose`, `mobile/r16-help`).
  - The results buttons fit on one row.
- **The star bar is broken** (`desktop/r09-cascade-fire`, `desktop/r10-stone-fire`, `mobile/s1-1`, `mobile/s2-1`, `desktop/r03-world1`):
  - it is full, with stars lit, at 540 of 12,000;
  - it is partly filled at 0;
  - it shows about 2% at 2,160 of 9,840;
  - level 7 shows only two markers at the bar ends instead of three thresholds.

  This is the core progress readout of the genre.
- **Wrong header on the intro.** `desktop/r15-intro` has the map header reading "World 1: Bathhouse Row, postcard 10/10" while the dialog is "World 2 · Hot Springs Mountain, No. 5".
- **Map seam.** The mobile map has a hard horizontal seam where two paintings meet, at y≈240 in `mobile/r02-map`.
- **Lose dialog.** It says "So close!" with both goals untouched and the score at 0 (`mobile/r14-lose`). It lists goals as text bullets instead of goal icons with counts.

### Typography: 6.5
- **Strengths.**
  - A rounded display face for titles, moves and score, plus a humanist UI face for body text, in a clear scale.
  - Numerals read at a glance ("20 MOVES", "4,300").
  - The win and help copy are well set (`desktop/r13-win`, `mobile/r16-help`).
- **Truncation persists on mobile:**
  - "W1 · BATHHOUSE R…" (`mobile/r03-world1`, all of `strips/mobile-s1`);
  - "W6 · GARVAN GARD…" (`mobile/r08-world6`);
  - "7. Three Sisters Sprin…" (`mobile/r07-world5`);
  - "9. Backstretch Ch…" (`mobile/r06-world4`);
  - "World 2: Hot …" (`mobile/r02-map`).
- **Title contrast is weak.** The cream logo sits on a cream-gold sky. The thin outlined "HOT SPRINGS · ARKANSAS" with wide letter spacing is low-contrast on the bright sky (`mobile/r01-title`, `desktop/r01-title`).

### Readability: 6.5
- **Strengths.**
  - The kinds are distinct by both shape and colour, including mid-effect (`mobile/s2-6`, `mobile/r09-cascade-fire`).
  - HUD goal icons match the board blockers (`mobile/r04-world2`: tufa and crust).
  - The steam fog is soft and lets pieces read through it (`desktop/r17-tip`).
- **Weak specials.** The Cascade special is barely distinguishable from a plain crystal (`mobile/s1-10`, `desktop/r03-world1` row 4, column 2). The Hot Stone base is small.
- **Gold overload in W6.** The gold horseshoe, gold coin collectible, gold exit rings and gold chains compete (`mobile/r08-world6`, bottom rows).
- **The star-bar bug misreports progress** (`mobile/s1-10`).

### Mobile: 7.0
- **Strengths.**
  - The portrait layout is built for the phone: the board spans the full width and sits low near the tray, the HUD is compact, and the booster tray and pause are reachable with targets of about 64 px (`mobile/r03-world1`, `mobile/r05-world3`).
  - Even five goal pills fit on one row (`mobile/r08-world6`).
  - The tutorial tip docks under the HUD and does not cover the board (`mobile/r17-tip`).
  - Dialogs scale well (`mobile/r13-win`, `mobile/r14-lose`).
- **Weaknesses.**
  - The text truncations listed under Typography.
  - The map seam (`mobile/r02-map`).
  - The 9×9 boards give cells of about 41 css px, which is tight (`mobile/r05-world3`).

### Authenticity: 7.0
- **Strong local recognition:**
  - the Quapaw's tiled dome (`desktop/r03-world1`);
  - the Arlington-style twin towers and the Art Deco block on Central Ave (`mobile/r05-world3`);
  - the Oaklawn grandstand with horses (`mobile/r06-world4`);
  - a lake with a dam (`mobile/r07-world5`);
  - a glass chapel and a stone bridge in Garvan-style gardens (`mobile/r08-world6`);
  - an accurately sourced Fordyce fact on the win card (`desktop/r13-win`);
  - an honest "no geysers or hot stones" note in Help (`mobile/r16-help`).
- **Inaccurate terraces.** The title, map and W2 backdrop still show tall stacked travertine terraces with turquoise pools and waterfalls (`desktop/r01-title` right side, `desktop/r02-map` right half, `mobile/r04-world2`). This is the Pamukkale/Huanglong trope the rubric penalises. It is greyer now but still wrong in scale and form.
- **Della is respectful but narrow.** She is a dignified, smiling attendant in a white uniform (`desktop/r17-tip`, "fictional"). That is respectful, but casting the only Black character as a service attendant is a narrow framing. A line tying her to the real history of Black bath attendants or the Pythian Bathhouse would give her agency.

## IP check
Clean. The piece set (drop, fan, horseshoe, flower, quartz crystal, pine), the special names (Cascade, Hot Stone, Spring Crystal), the logo and the HUD are original. The chain-and-padlock blocker, ice-like crust tiles and the booster tray are genre conventions, not copies of a specific game's assets or layout.

## Ranked gaps
1. **G-starbar-fill (ui), +1.0, severity 4, effort S.**
   - Fix: compute fill as min(score ÷ 3-star threshold, 1), with no CSS transition on level load. Place the three markers at threshold ÷ 3-star threshold, and light a marker only when score ≥ its threshold.
   - Test: at 540 of 12,000 the fill is ≤ 5% with no lit star. At 0 the fill is 0 on the first frame. At 2,160 of 9,840 the fill is about 22%. Three markers are visible on every level.
2. **G-special-silhouettes (art/readability), +1.0, severity 4, effort M.**
   - Fix: make the Cascade read outside the piece silhouette. Add large gold arrow fins that extend past the cell edge, plus a striped or banded rim and a slow shimmer loop. Give the Hot Stone a visible basalt slab at least 90% of the cell, with orange ember cracks lit by an emissive pulse.
   - Test: in a 390 px capture, a viewer finds every special within 1 s, and a special is never mistaken for a plain piece in `mobile/s1-10`-type frames.
3. **G-clear-and-land-juice (animation), +1.0, severity 4, effort M.**
   - Fix: each cleared piece scales to 1.15 over about 60 ms, then bursts into 6–10 piece-coloured shards. Show a 2-frame landing squash of about 0.85 y and 1.1 x. Count the score up over the clear. Add the "Spring Crystal!" callout.
   - Test: an s1 frame shows shards, an s1 or s2 frame shows squashed pieces, s2 shows the callout, and the score is mid-count in at least one frame.
4. **G-terraces (authenticity), +0.5, severity 3, effort M.**
   - Fix: repaint the right side of the title, the map W2 region and the W2 backdrop. Replace the stacked pool terraces with low, drab grey tufa outcrops on a wooded hillside and the single narrow Hot Water Cascade channel, with steam.
   - Test: no stacked pool terraces in `r01`, `r02` or `r04`.
5. **G-hud-truncation (typography/mobile), +0.5, severity 3, effort S.**
   - Fix: on mobile, step the world label and level name down to 11 px and 16 px before eliding, or wrap the level name to two lines. Shorten the map header to "W2 · Hot Springs Mtn".
   - Test: no "…" in any mobile capture r02–r17.
6. **G-map-seam (ui/mobile), +0.5, severity 3, effort S.**
   - Fix: feather the joins between world map paintings with an alpha gradient of at least 120 px, or paint a transition band.
   - Test: no hard horizontal edge in `mobile/r02-map`.
7. **G-board-seating (rendering), +0.5, severity 3, effort M.**
   - Fix: add a radial darkening of about 25% on the backdrop behind the board, a warm rim light on the frame's sun side matched to each world's key light, and a subtle translucency so the backdrop colour tints the cells.
   - Test: in `desktop/r09` the board edge blends into a darkened halo rather than a flat cut.
8. **G-chain-callout (animation), +0.25, severity 2, effort S.**
   - Fix: make sure the "Bubbly!" chain callout shows on the 2nd wave, and capture r12 when it peaks.
   - Test: r12 shows the callout text.
9. **G-blocker-materials (art), +0.5, severity 2, effort M.**
   - Fix: give the tufa a porous grey-tan limestone texture without the cookie-with-eyes face. Give the mineral crust a crystalline beige-white mineral sheen rather than flat ice.
   - Test: in a side-by-side, a viewer names the materials as "stone" and "mineral crust", not "cookie" and "ice".
10. **G-intro-and-lose-copy (ui), +0.25, severity 2, effort S.**
    - Fix: the map header follows the intro dialog's world. The lose dialog shows goal icons with remaining counts and uses "So close!" only when at least 50% of the goal is done.
    - Test: `r15` header = W2. `r14` shows icon pills.

```json
{
  "loop": 2,
  "role": "critic-claude",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/r03-world1", "mobile/s1-10", "mobile/r05-world3", "mobile/r04-world2", "mobile/r07-world5", "mobile/r08-world6"] },
    "rendering": { "score": 6.5, "confidence": 0.7, "evidence": ["desktop/r03-world1", "desktop/r05-world3", "desktop/r09-cascade-fire", "desktop/r10-stone-fire", "desktop/r11-crystal-rays", "desktop/r17-tip"] },
    "animation": { "score": 6.0, "confidence": 0.75, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/s1-5", "mobile/s1-8", "mobile/s1-9", "mobile/s2-2", "mobile/s2-6", "desktop/r12-callout"] },
    "ui": { "score": 6.0, "confidence": 0.8, "evidence": ["desktop/r09-cascade-fire", "mobile/s1-1", "mobile/s2-1", "desktop/r03-world1", "desktop/r15-intro", "mobile/r02-map", "mobile/r14-lose", "mobile/r13-win"] },
    "typography": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/r03-world1", "mobile/r07-world5", "mobile/r06-world4", "mobile/r08-world6", "mobile/r02-map", "mobile/r01-title", "desktop/r13-win"] },
    "readability": { "score": 6.5, "confidence": 0.7, "evidence": ["mobile/s1-10", "desktop/r03-world1", "mobile/r04-world2", "mobile/r08-world6", "desktop/r17-tip", "mobile/s2-6"] },
    "mobile": { "score": 7.0, "confidence": 0.7, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r08-world6", "mobile/r17-tip", "mobile/r13-win", "mobile/r02-map"] },
    "authenticity": { "score": 7.0, "confidence": 0.7, "evidence": ["desktop/r03-world1", "mobile/r05-world3", "mobile/r06-world4", "mobile/r08-world6", "desktop/r13-win", "desktop/r01-title", "desktop/r02-map", "mobile/r04-world2", "desktop/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Original pieces (drop, fan, horseshoe, flower, quartz, pine), specials, logo and HUD. Chain-lock blockers, ice-like crust and the booster tray are genre conventions, not copies." },
  "gaps": [
    { "id": "G-starbar-fill", "category": "ui", "expectedGain": 1.0, "severity": 4, "effort": "S", "evidence": ["desktop/r09-cascade-fire", "mobile/s1-1", "mobile/s2-1", "desktop/r03-world1"], "fix": "Fill = min(score / 3-star threshold, 1) with no transition on level load; three markers at threshold/3-star positions, lit only when score >= threshold. Test: 540/12,000 shows <=5% fill and no lit star; 0 shows empty on frame 1; 2,160/9,840 shows ~22%." },
    { "id": "G-special-silhouettes", "category": "art", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["mobile/s1-10", "desktop/r03-world1", "mobile/r05-world3"], "fix": "Cascade: large gold arrow fins extending beyond the piece silhouette, banded rim and a shimmer loop; Hot Stone: a basalt slab at least 90% of the cell with emissive ember cracks pulsing. Test: every special is found within 1 s in a 390 px capture." },
    { "id": "G-clear-and-land-juice", "category": "animation", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["strips/mobile-s1", "strips/mobile-s2", "mobile/s2-2"], "fix": "Pop anticipation (scale 1.15 over ~60 ms) then 6-10 piece-coloured shards; a 2-frame landing squash (0.85 y, 1.1 x); score counts up during the clear; add the 'Spring Crystal!' callout. Test: the strips show shards, a squash frame, the s2 callout and a mid-count score." },
    { "id": "G-terraces", "category": "authenticity", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r01-title", "desktop/r02-map", "mobile/r04-world2"], "fix": "Repaint the title's right side, the map's W2 region and the W2 backdrop: low drab grey tufa outcrops on a wooded slope and a single narrow Hot Water Cascade with steam; no stacked turquoise pool terraces." },
    { "id": "G-hud-truncation", "category": "typography", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r03-world1", "mobile/r07-world5", "mobile/r06-world4", "mobile/r08-world6", "mobile/r02-map"], "fix": "Step mobile world labels and level names down (11 px and 16 px) or wrap level names to 2 lines before eliding; shorten the map header to 'W2 · Hot Springs Mtn'. Test: no ellipsis in any mobile capture." },
    { "id": "G-map-seam", "category": "mobile", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r02-map"], "fix": "Feather the world-map painting joins with an alpha gradient of at least 120 px, or paint a transition band; no hard horizontal edge at y~240 in mobile/r02-map." },
    { "id": "G-board-seating", "category": "rendering", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["desktop/r09-cascade-fire", "desktop/r05-world3"], "fix": "Radial ~25% backdrop darkening behind the board, a warm rim light on the frame's sun side per world, and slight cell translucency tinted by the backdrop." },
    { "id": "G-chain-callout", "category": "animation", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["desktop/r12-callout", "mobile/r12-callout"], "fix": "Make sure the 'Bubbly!' callout fires on the 2nd wave and capture r12 when it peaks; test: callout text visible in r12." },
    { "id": "G-blocker-materials", "category": "art", "expectedGain": 0.5, "severity": 2, "effort": "M", "evidence": ["mobile/r04-world2", "mobile/r07-world5"], "fix": "Tufa: porous grey-tan limestone texture, drop the cookie-with-eyes face; crust: crystalline beige-white mineral sheen rather than flat ice tiles." },
    { "id": "G-intro-and-lose-copy", "category": "ui", "expectedGain": 0.25, "severity": 2, "effort": "S", "evidence": ["desktop/r15-intro", "mobile/r14-lose"], "fix": "The map header follows the intro level's world (W2 in r15); the lose dialog shows goal icon pills with remaining counts and says 'So close!' only when at least 50% of the goals are done." }
  ],
  "verdict": "continue"
}
```
