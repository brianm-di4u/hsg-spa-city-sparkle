# Critic A (critic-claude): loop 3

## Verdict
Spa City Sparkle is a competent, coherent browser match-3. The paintings carry it. The five common piece kinds are glossy and clearly distinct, and the cream-paper dialogs and gold moves badge form one consistent style. Measured against the phone genre leaders, though, it still looks like a well-dressed prototype:
- **Specials:** the Cascade's gold fins and the Hot Stone's crackle disc are too small and muddy to read at 390 px (`mobile/r12-callout`, `mobile/r10-stone-fire`).
- **Blockers:** crust, moss and steam lack material identity (`mobile/r07-world5`, `mobile/r08-world6`, `mobile/r17-tip`).
- **Game feel:** big moments land without shake, rim light or a strong beam. Three frames of `strips/mobile-s1` show nothing happening between the swap and the fire.
- **Map header:** the world title is dark text on a dark-green header and is close to invisible on the map, intro and help screens (`desktop/r02-map`, `mobile/r02-map`, `mobile/r15-intro`, `mobile/r16-help`).

The callout fix works, but every callout now sits over the top row of pieces. Nothing is broken, but nothing reaches the 7 bar for art, rendering, animation, UI, typography or readability yet. Score: 52.5/80. Continue.

## Scores

**Art: 6.5**
- **Pieces:** the Blender pieces (drop, flower, fan, crystal, horseshoe) are clean and glossy. Each has its own silhouette and colour and a soft contact shadow (`mobile/s1-1`, `desktop/r03-world1`). Micro-detail is low, though: the flower is plain plastic and the fan is a flat slab. The green pine-tree piece that drops in during refills is pastel and flatter than the rest (`mobile/s1-10`, `mobile/s2-7`).
- **Specials:** the Spring Crystal (pink and cyan cluster) reads as special (`mobile/s2-1`). The Cascade's cyan band and gold fins nearly vanish at phone scale: on a flower it looks like a ribbon (`mobile/r12-callout`, `mobile/s1-1`). The Hot Stone is a crystal on a dark-brown disc with a thin gold scribble and reads as a dirty tile (`mobile/r10-stone-fire`).
- **Blockers:**
  - Chains with a padlock are good (`mobile/r05-world3`).
  - Tufa reads as a lumpy grey rock, but its two gold studs make it look like a face. On the World 3 board it turns dark brown, not drab grey (`mobile/r05-world3` against `mobile/r04-world2`).
  - Crust is a beige cell frame with no crystalline material (`mobile/r04-world2`, `desktop/r04-world2`).
  - Moss reads as a bunch of green grapes (`mobile/r07-world5`, `mobile/r08-world6`).
- **Paintings:** polished, with a shared golden-hour palette (`mobile/r06-world4`, `mobile/r08-world6`). The map panel is a generic isometric Mediterranean hill village (`mobile/r02-map`).

**Rendering: 6.5**
- **Board seating:** the board is framed (a gold rim on Worlds 1, 3 and 6, silver on Worlds 2, 4 and 5), cells have an inner bevel, and the darkened halo seats the board on the painting (`mobile/r03-world1`, `desktop/r03-world1`).
- **Colour temperature:** the teal board and cold silver frame on World 2 fight the warm amber painting (`desktop/r04-world2`). On mobile, World 2 also has a flat foggy band between the painting and the board, so the board floats on haze (`mobile/r04-world2`).
- **Effects:**
  - The Cascade beam is additive but thin, a white hairline across the row (`desktop/r09-cascade-fire`, `mobile/s1-5`).
  - The Hot Stone ring is an opaque, muddy orange-brown donut, not a glow (`mobile/r10-stone-fire`, `desktop/r10-stone-fire`).
  - The Spring Crystal rays are the best effect in the build (`desktop/r11-crystal-rays`).
- **Light response:** none. The backdrop and frame never react to events.

**Animation: 6.5**
- **s1 (Cascade):**
  - Frame 1: an eased swap, with pieces overlapping mid-move and the moves badge pulsing.
  - Frames 2–4: identical. No anticipation on the special: no scale-up, no glow build.
  - Frame 5: the fire is one beam with brightened pieces, a callout and "+540".
  - Frame 6: the cleared row, a ring on the new special and a few sparkles. The coloured shards (10 per piece) are hard to see.
  - Frame 8: the column falls with eased motion, and new pieces enter, clipped by the board mask.
  - Frames 9–10: they settle; at most a faint widening of the fans hints at a squash.
- **s2 (Crystal):** better. There is a white flash marking the targets (anticipation), the callout scales in, the crystals pop with sparkles, rays fire, the board dims, then the columns fall staggered (`strips/mobile-s2` frames 2–6).
- **Score:** it counts up through the beats (667 → 978 → 1,215 → 1,319).
- **What is missing:**
  - No screen shake in any frame: the backdrop is pixel-static (`strips/desktop-s1`, `strips/mobile-s1`).
  - No visible landing bounce.
  - The "Cascade!" callout just fades out (s1 frame 7).

**UI: 6.5**
- **HUD:** the in-level hierarchy is clear: the big gold moves badge, then the world label and level name, then the goal pills, then score and stars (`mobile/r05-world3`, `mobile/r08-world6`).
- **Dialogs:** win, lose, intro and help share one cream-paper style. The win dialog's real-history card is a nice touch (`mobile/r13-win`, `mobile/r14-lose`).
- **Problems:**
  - The map header title is effectively invisible, dark grey on dark green, and it wraps to three lines (`mobile/r02-map`, `desktop/r02-map`, `mobile/r15-intro`).
  - The postcard thumbnail is grey noise.
  - The "★ 11,460" pill is unlabelled. Its value changes between captures of the same level (11,460, 5,100, 11,340: `mobile/s1-1`, `mobile/r10-stone-fire`, `mobile/s2-1`), and I cannot tell whether it is a target or a best score.
  - The star bar is a thin outline with all three stars bunched at its right end (`mobile/s1-6`).
  - On desktop, the HUD is a small translucent box in the top-left with the boosters stacked 3+2 under it, leaving a large dead area on the left (`desktop/r03-world1`, `desktop/r09-cascade-fire`).
  - The dialogs are plain rectangles, with no ribbon, header art or animation.

**Typography: 6.0**
- **What works:** the rounded display face, the Nunito-style UI face and big numerals in the moves badge read well (`mobile/r03-world1`, `mobile/r13-win`). The brown-outlined callouts are bold (`mobile/r09-cascade-fire`).
- **Failures:**
  - The map, intro and help header text "World 2: Hot Springs Mountain" falls well below any contrast threshold (`mobile/r02-map`, `mobile/r16-help`, `desktop/r02-map`).
  - The title logo is cream on a bright cream-and-yellow sky with a weak bevel. "HOT SPRINGS · ARKANSAS" is thin, letter-spaced text over busy hills. The tagline is small white text on a bright sky (`desktop/r01-title`, `mobile/r01-title`).
  - The HUD level name has a smeary grey glow that softens it (`mobile/r12-callout`, "1. Magnolia Promenade").
  - Long names wrap to two lines and push the goal row down (`mobile/r07-world5`).

**Readability: 6.5**
- **Pieces:** the five kinds are distinct by shape and colour, even on the dark World 3 board (`mobile/r05-world3`).
- **Goal icons:** the HUD icons match the tufa, chain and flower pieces (`mobile/r08-world6`).
- **Weak points:**
  - Callouts now sit over the top row for several frames. "Spring Crystal!" covers nearly the whole top row (`mobile/s2-3`, `mobile/r11-crystal-rays`, `mobile/r09-cascade-fire`).
  - The crust goal icon is a blank beige square (`mobile/r14-lose`, `mobile/r15-intro`).
  - Steam is a faint haze over a still-visible piece, so it reads as a disabled or ghosted tile, not "hidden" (`mobile/r17-tip`).
  - The bronze coin piece and the green tree piece are never explained in the captures (`mobile/r08-world6`, `mobile/s1-10`).
  - The Hot Stone and Cascade specials are hard to tell from plain pieces at a glance (`mobile/r10-stone-fire`, `mobile/r12-callout`).

**Mobile: 7.0**
- **Layout:** a real portrait design. The board spans the full width, the HUD is compact at the top, and the booster tray of roughly 64-px tiles plus the pause button sits in thumb reach at the bottom. Nothing is off-screen (`mobile/r03-world1`, `mobile/r05-world3`).
- **Shortfalls:**
  - The board starts about 37% of the way down. On cross-shaped boards it uses well under half the height, with a dead foggy band above it (`mobile/r04-world2`, `mobile/r07-world5`).
  - Five goal pills nearly hit the right edge (`mobile/r08-world6`).
  - The map header wraps to three lines and is unreadable (`mobile/r02-map`).

**Authenticity: 7.0**
- **World by world:**
  - World 1: Bathhouse Row's arcades, the tiled Quapaw-style dome and the Mountain Tower (`mobile/r03-world1`, `desktop/r04-world2`).
  - World 3 (Central Ave): a twin-towered Arlington-style hotel, an art-deco tower and 1930s cars (`mobile/r05-world3`).
  - World 4: an Oaklawn-style grandstand and track with horses (`mobile/r06-world4`).
  - World 5: a lake with a dam that reads as Carpenter Dam and Lake Catherine (`mobile/r07-world5`).
  - World 6: an Anthony-Chapel-style glass chapel with a stone bridge (`mobile/r08-world6`).
- **Accuracy and tone:** the World 2 tufa is now drab grey and the white terraces are gone (`mobile/r04-world2`). The Fordyce cost fact is cited (`mobile/r13-win`). Della is drawn respectfully and labelled fictional (`mobile/r17-tip`).
- **Deductions:**
  - The title paintings put a steaming lake in the middle of downtown (`desktop/r01-title`).
  - The map panel is a generic Mediterranean village (`mobile/r02-map`).
  - The Quapaw dome is reused as the World 2 centrepiece.
  - Level 8 is named "Park Hotel" over an Arlington-like facade.

## IP check
Clean.
- The piece set (drop, flower, fan, crystal, horseshoe, tree) is original.
- The specials use genre-standard mechanics (4 in a line, an L or T shape, 5 in a line) with original names and visuals: no striped or wrapped candies, no colour-bomb sphere.
- No commercial names, logos or UI layouts are copied. The booster tray and moves badge are generic genre conventions.

## Ranked gaps
1. **G-map-header-contrast** (typography/UI, severity 4, effort S, +1.0)
   - **Evidence:** the world title in the map, intro and help header is dark on dark and wraps to three lines (`mobile/r02-map`, `mobile/r15-intro`, `mobile/r16-help`, `desktop/r02-map`).
   - **Fix:**
     - Set the title to cream (#FFF3D6) with a 2 px dark outline or shadow, at a contrast of at least 4.5:1.
     - Shrink it with clamp() so it fits on at most two lines at 390 px.
     - Replace the noisy postcard thumbnail with a framed colour crop of the painting.
2. **G-special-identity** (art/readability, severity 4, effort M, +1.0)
   - **Evidence:** the Cascade's band and fins and the Hot Stone's disc are illegible at phone size (`mobile/r12-callout`, `mobile/r10-stone-fire`, `mobile/s1-1`).
   - **Fix:**
     - **Cascade:** a full-width glowing stripe band, with arrow fins at least 30% of the cell, plus a slow additive pulse.
     - **Hot Stone:** an emissive orange-hot core, an ember rim and a heat shimmer.
     - **Test:** in a frame downscaled to 50%, a viewer picks out every special on the board.
3. **G-impact-feel** (animation/rendering, severity 4, effort M, +1.0)
   - **Evidence:** there is no shake, the beam is a hairline, frames 2–4 of s1 are dead and the shards are barely visible (`strips/mobile-s1`, `strips/desktop-s1`, `mobile/r10-stone-fire`).
   - **Fix:**
     - Add a 6–10 px decaying board shake when a special fires.
     - Flash the frame rim in the event's colour.
     - Make the Cascade beam at least 0.6 of a cell thick, with the cleared pieces flung along it.
     - Before firing, scale the special to 1.2× with a glow build-up during the current dwell frames.
     - Make shards at least 12 px with gravity and spin.
     - Replace the muddy Hot Stone donut with an additive shockwave.
4. **G-blocker-materials** (art/readability, severity 3, effort M, +1.0)
   - **Evidence:** crust is a beige cell frame with a blank HUD icon, moss looks like grapes, steam is a faint haze, and World 3 tufa is dark brown (`mobile/r04-world2`, `mobile/r07-world5`, `mobile/r17-tip`, `mobile/r05-world3`).
   - **Fix:**
     - **Crust:** a white crystalline overlay with sparkling facets, and the HUD and goal icon textured the same way.
     - **Moss:** a leafy carpet that overlaps the cell edges.
     - **Steam:** an opaque swirling cloud covering at least 70% of the piece.
     - **Tufa:** one drab-grey tint in every world.
5. **G-callout-over-row** (readability, severity 3, effort S, +0.5)
   - **Evidence:** callouts cover the top row of pieces for 3+ frames (`mobile/s2-3`, `mobile/s2-4`, `mobile/r09-cascade-fire`, `desktop/r11-crystal-rays`).
   - **Fix:**
     - **On mobile:** anchor the callout in the free painting band above the board, so it is fully above the board's top edge.
     - **On desktop:** scale it down to 70% and fade it to 40% opacity after 300 ms.
     - **Test:** no callout pixel overlaps a cell after 300 ms.
6. **G-hud-star-meter** (UI, severity 2, effort S, +0.5)
   - **Evidence:** the "★ 11,460" pill is unlabelled, and the star bar is a hairline with its stars bunched at the right end (`mobile/s1-1`, `mobile/s1-6`, `mobile/r12-callout`).
   - **Fix:**
     - Label the pill ("Best" or "Goal") or drop it.
     - Make the bar at least 14 px tall, with each star marker placed at its real threshold.
     - Make each star pop and fill gold when it is reached.
7. **G-desktop-hud** (UI, severity 2, effort M, +0.5)
   - **Evidence:** the HUD is cramped in a 250 px box, the boosters are stacked 3+2 in a corner, and there is a large dead left area (`desktop/r03-world1`, `desktop/r09-cascade-fire`).
   - **Fix:** use a full-height left rail, with the moves badge, goals and star meter at a larger size and the boosters as a vertical column. Alternatively, centre the board and use symmetric side panels.
8. **G-title-lockup** (typography, severity 2, effort S, +0.5)
   - **Evidence:** the cream logo sits on a bright sky, the subtitle is thin and the tagline is low contrast (`desktop/r01-title`, `mobile/r01-title`).
   - **Fix:** a logo lockup with a dark outline and a plaque or emblem (dome and steam), with the subtitle and tagline on a soft dark scrim. Test for a contrast of at least 4.5:1.
9. **G-mobile-board-space** (mobile, severity 2, effort S, +0.5)
   - **Evidence:** the board starts about 37% down and leaves a dead fog band (`mobile/r04-world2`, `mobile/r07-world5`).
   - **Fix:** raise the board to start no more than 24 px below the HUD goal row, or enlarge the cells so the board fills at least 55% of the viewport height, keeping the booster tray in place.
10. **G-map-path-identity** (authenticity, severity 2, effort M, +0.5)
    - **Evidence:** the map painting is a generic Mediterranean village, and nodes 9–10 sit off the painted path (`mobile/r02-map`, `desktop/r02-map`).
    - **Fix:**
      - Snap the nodes to the path spline.
      - Repaint the World 2 map panel around the Mountain Tower, the brick Grand Promenade wall and grey tufa outcrops.

```json
{
  "loop": 3,
  "role": "critic-claude",
  "scores": {
    "art": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/s1-1", "mobile/r12-callout", "mobile/r10-stone-fire", "mobile/r04-world2", "mobile/r07-world5", "mobile/r08-world6", "mobile/r05-world3", "mobile/r02-map"] },
    "rendering": { "score": 6.5, "confidence": 0.7, "evidence": ["mobile/r03-world1", "desktop/r04-world2", "mobile/r04-world2", "desktop/r09-cascade-fire", "mobile/r10-stone-fire", "desktop/r11-crystal-rays"] },
    "animation": { "score": 6.5, "confidence": 0.7, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "strips/desktop-s1", "mobile/s1-5", "mobile/s2-3", "mobile/s2-6"] },
    "ui": { "score": 6.5, "confidence": 0.75, "evidence": ["mobile/r02-map", "desktop/r02-map", "mobile/r15-intro", "mobile/s1-1", "mobile/r13-win", "mobile/r14-lose", "desktop/r03-world1"] },
    "typography": { "score": 6.0, "confidence": 0.75, "evidence": ["mobile/r02-map", "mobile/r16-help", "desktop/r01-title", "mobile/r01-title", "mobile/r12-callout", "mobile/r07-world5"] },
    "readability": { "score": 6.5, "confidence": 0.7, "evidence": ["mobile/r05-world3", "mobile/s2-3", "mobile/r09-cascade-fire", "mobile/r14-lose", "mobile/r17-tip", "mobile/r08-world6", "mobile/r10-stone-fire"] },
    "mobile": { "score": 7.0, "confidence": 0.7, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r04-world2", "mobile/r07-world5", "mobile/r08-world6", "mobile/r02-map"] },
    "authenticity": { "score": 7.0, "confidence": 0.65, "evidence": ["mobile/r03-world1", "mobile/r05-world3", "mobile/r06-world4", "mobile/r07-world5", "mobile/r08-world6", "mobile/r13-win", "mobile/r17-tip", "desktop/r01-title", "mobile/r02-map"] }
  },
  "ip": { "clean": true, "notes": "Original piece set (drop, flower, fan, crystal, horseshoe, tree) and original special names and visuals. The specials use genre-standard mechanics only (4 in a line, L/T, 5 in a line). No commercial names, logos or copied UI." },
  "gaps": [
    { "id": "G-map-header-contrast", "category": "typography", "expectedGain": 1.0, "severity": 4, "effort": "S", "evidence": ["mobile/r02-map", "mobile/r15-intro", "mobile/r16-help", "desktop/r02-map"], "fix": "Set the map, intro and help header world title to cream #FFF3D6 with a 2px dark outline or shadow, at a contrast of at least 4.5:1, sized with clamp() to fit on at most 2 lines at 390px. Replace the noisy postcard thumbnail with a framed colour crop of the painting." },
    { "id": "G-special-identity", "category": "art", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["mobile/r12-callout", "mobile/r10-stone-fire", "mobile/s1-1"], "fix": "Cascade: a full-width glowing stripe band, arrow fins at least 30% of the cell and a slow additive pulse. Hot Stone: an emissive orange-hot core, an ember rim and a heat shimmer, replacing the dark disc and scribble. Test: every special is identifiable in a frame downscaled to 50%." },
    { "id": "G-impact-feel", "category": "animation", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["strips/mobile-s1", "strips/desktop-s1", "mobile/r10-stone-fire"], "fix": "Add a 6-10px decaying board shake when a special fires and flash the frame rim in the event's colour. Make the Cascade beam at least 0.6 of a cell thick with the cleared pieces flung along it. Scale the special to 1.2x with a glow build-up during the current dead frames (s1 frames 2-4). Make shards at least 12px with gravity and spin, and replace the opaque Hot Stone donut with an additive shockwave." },
    { "id": "G-blocker-materials", "category": "readability", "expectedGain": 1.0, "severity": 3, "effort": "M", "evidence": ["mobile/r04-world2", "mobile/r07-world5", "mobile/r17-tip", "mobile/r05-world3", "mobile/r14-lose"], "fix": "Crust: a white crystalline overlay with sparkling facets, and the HUD and goal icon textured the same way (not a blank square). Moss: a leafy carpet overlapping the cell edges, not grapes. Steam: an opaque swirling cloud covering at least 70% of the piece. Tufa: one drab-grey tint in every world, including the World 3 board." },
    { "id": "G-callout-over-row", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/s2-3", "mobile/s2-4", "mobile/r09-cascade-fire", "desktop/r11-crystal-rays"], "fix": "On mobile, anchor callouts in the painting band fully above the board's top edge. On desktop, scale them to 70% and fade them to 40% opacity after 300ms. Test: no callout pixel overlaps a cell after 300ms." },
    { "id": "G-hud-star-meter", "category": "ui", "expectedGain": 0.5, "severity": 2, "effort": "S", "evidence": ["mobile/s1-1", "mobile/s1-6", "mobile/r12-callout"], "fix": "Label the star-number pill (Best or Goal) or remove it. Make the star bar at least 14px tall, with each marker at its real threshold, and pop each star to gold when it is reached." },
    { "id": "G-desktop-hud", "category": "ui", "expectedGain": 0.5, "severity": 2, "effort": "M", "evidence": ["desktop/r03-world1", "desktop/r09-cascade-fire"], "fix": "Replace the 250px corner box with a full-height left rail: a larger moves badge, the goals and the star meter, with the boosters as a vertical column. Alternatively, centre the board with symmetric side panels so there is no dead left area." },
    { "id": "G-title-lockup", "category": "typography", "expectedGain": 0.5, "severity": 2, "effort": "S", "evidence": ["desktop/r01-title", "mobile/r01-title"], "fix": "Build a logo lockup with a dark outline and a plaque or emblem (dome and steam). Put the HOT SPRINGS · ARKANSAS subtitle and the tagline on a soft dark scrim, at a contrast of at least 4.5:1." },
    { "id": "G-mobile-board-space", "category": "mobile", "expectedGain": 0.5, "severity": 2, "effort": "S", "evidence": ["mobile/r04-world2", "mobile/r07-world5"], "fix": "Start the board no more than 24px below the goal row, or enlarge the cells so the board fills at least 55% of the viewport height, removing the dead fog band. Keep the booster tray in place." },
    { "id": "G-map-path-identity", "category": "authenticity", "expectedGain": 0.5, "severity": 2, "effort": "M", "evidence": ["mobile/r02-map", "desktop/r02-map"], "fix": "Snap the level nodes to the painted path spline (nodes 9-10 sit off it). Repaint the World 2 map panel around the Mountain Tower, the brick Grand Promenade wall and grey tufa outcrops instead of a generic Mediterranean village." }
  ],
  "verdict": "continue"
}
```
