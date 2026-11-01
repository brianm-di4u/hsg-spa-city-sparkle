The board, effects, motion and HUD are all short of the 7.0 gate, so I rule **continue**. The judged total is **45.5/80**. Only authenticity clears its gate (6.0 against ≥6). Critic-claude scored 44.0 and critic-codex 47.5, so I land between them. Claude was closer on animation and rendering, and Codex was closer on art and typography.

**Capture note.** The 0 points, the 3 stars and the HUD behind the win dialog in r13 come from the test hook that forced the win, so I score none of them. The "plus5" label is a real bug and I score it. The fix includes driving the r13 capture through real play.

## Prosecute, then defend

**critic-claude (44.0)**
- **Over-scored:** Authenticity 6.5 forgives too much. The white and turquoise terraces fill the right half of the title screen (`desktop/r01-title`). They return on the map (`desktop/r02-map`), on World 2 (`mobile/r04-world2`) and on the lose screen (`mobile/r14-lose`). The rubric names this exact defect.
- **Under-scored, case 1:** Animation 4.5 ignores what works. The Crystal burst in `strips/mobile-s2` builds over frames 2 to 5: glints on its targets, a central flash, rays, then the targets fade. Clears do not "just vanish", which is the anchor-5 description.
- **Under-scored, case 2:** The claim that pieces fill only "about 55%" of a cell is a wrong cause. In `mobile/r12-callout` a horseshoe is about 80 of 105 px, and in `desktop/r03-world1` pieces are about 60 of 83 px. That is roughly 72 to 76% of the cell width.

**critic-codex (47.5)**
- **Over-scored, case 1:** Animation 6.0 credits motion the strips never show. No frame shows a fall, a landing, an eased swap, a callout word or a shake (`strips/mobile-s1` frames 1 to 6, `strips/desktop-s1`). The HUD stays frozen at 19 moves in every frame.
- **Over-scored, case 2:** Art 6.5 skips past the specials. The Cascade special is a pair of tiny cyan arrows on a flower (`mobile/r12-callout`). The Hot Stone is a dotted ring (`mobile/r10-stone-fire`).
- **Under-scored:** Authenticity 5.0 treats the game as close to "a generic spa town". In fact the Arlington's twin towers (`mobile/r05-world3`), an Oaklawn grandstand (`mobile/r06-world4`), the Lake Hamilton dam and a pontoon boat (`mobile/r07-world5`) and Anthony Chapel (`mobile/r08-world6`) are all recognisable. "Little racing specificity" undersells r06.

## Category rulings

**Art: 6.0** (critics 5.5 / 6.5)
- **Good:**
  - The paintings reach anchor 7 (`desktop/r01-title`, `mobile/r05-world3`).
  - The drops and horseshoes carry real specular highlights (`desktop/r03-world1`).
- **Weak:**
  - The crystals have flat facets and the fans are flat.
  - The specials are tiny add-ons: arrows on a piece (`mobile/r12-callout`), a dotted ring (`mobile/r10-stone-fire`).
  - Blockers are mixed. The tufa "cookie" has character, but the steam is flat white blobs (`desktop/r17-tip`) and the crust is a pale wash (`mobile/r07-world5`).
- The piece layer sits around 5.5 and the paintings pull it up to 6.0.

**Rendering: 5.0** (5.0 / 5.5)
- **Weak:**
  - A hard-edged translucent rectangle sits behind each board. It shows as a vertical seam at x≈375 in `desktop/r03-world1`, and as bands above and below the board in `mobile/r12-callout` and `mobile/r10-stone-fire`.
  - On desktop the board frame is about 18 px from the top and bottom edges (`desktop/r03-world1`, `desktop/r17-tip`).
  - Pieces have only a faint offset shadow.
  - The Cascade beam is a smeared white cotton band (`strips/mobile-s1` frames 3 and 4).
- **Good:**
  - The night board sits acceptably in its scene (`mobile/r05-world3`).
  - The Hot Stone ring is soft and additive.
- Overall this is anchor 5, a board floating over the scene.

**Animation: 5.0** (4.5 / 6.0). The critics differ by 1.5; I checked `strips/mobile-s1`, `strips/mobile-s2` and `strips/desktop-s1`.
- **Missing:**
  - The swap shows the two pieces sliding at full size, with no lift (s1 frame 2).
  - The clear is a beam followed by an empty row. No fall frame exists, and s2 frame 6 jumps straight to the refilled board.
  - The HUD never ticks.
  - `mobile/r12-callout` holds only a "+540" score pop, with no callout word and no shake.
- **Present:** the Crystal sequence (glints, flash, rays, fade) lifts this above "clears vanish".
- Claude is nearer the mark; Codex credited progression the strips do not show.

**UI: 5.5** (5.0 / 6.0)
- **Good:** the cream, gold and teal cards are consistent (`mobile/r15-intro`, `mobile/r16-help`), and the mobile HUD hierarchy reads.
- **Real defects:**
  - The "★ 28 / 180" counter is printed across the world title (`mobile/r02-map`, `desktop/r02-map`, `mobile/r16-help`).
  - The win card shows the raw booster id "plus5" (`mobile/r13-win`).
  - The star markers bunch at the right end of the bar with no visible fill (`mobile/r12-callout`, `mobile/r08-world6`).
  - Five goals wrap onto three rows (`mobile/r08-world6`).
  - The Della portrait covers the top row of the board on desktop (`desktop/r17-tip`).
- The forced-win zero score is not counted.

**Typography: 6.0** (5.5 / 6.5)
- **Good:** Righteous with Nunito is a sound pairing, and the moves numerals are strong (`mobile/r05-world3`).
- **Weak:**
  - World labels leave a single word on a second line: "NIGHT", "BALLFIELDS", "OUACHITA", "REVIVAL" (`mobile/r05-world3`, `mobile/r06-world4`, `mobile/r07-world5`, `mobile/r08-world6`).
  - "How to play" wraps inside its pill (`desktop/r01-title`).
  - The map title collides with the star counter (`mobile/r02-map`).

**Readability: 6.0** (6.0 / 6.0)
- **Good:** the six kinds are distinct by colour and shape (`mobile/r06-world4`).
- **Weak:**
  - The tufa goal is a grey rock while board tufa is a brown blob (`mobile/r04-world2`, `mobile/r05-world3`).
  - The flower goal is a layered magenta bloom while the board flower has five petals (`mobile/r08-world6`).
  - The bath-token goal has no token on the board (`mobile/r06-world4`).
  - Locks are a thin bar with a speck-sized padlock (`mobile/r05-world3`).
  - The specials are subtle (`mobile/r12-callout`).

**Mobile: 6.0** (6.0 / 6.0)
- **Good:** the board runs the full width and the tray is thumb-reachable, with targets of about 64 px (`mobile/r05-world3`).
- **Weak:**
  - There is a dead band of about 270 px (in 2× frame pixels) between the board and the tray (`mobile/r12-callout`).
  - The goals wrap and push the moves badge down (`mobile/r08-world6`).
  - The tip card covers bottom-row cells (`mobile/r17-tip`).
  - The map header overlap is worst at this width (`mobile/r02-map`).

**Authenticity: 6.0** (6.5 / 5.0). The critics differ by 1.5; I checked `desktop/r01-title`, `mobile/r02-map`, `mobile/r04-world2`, `mobile/r05-world3`, `mobile/r06-world4`, `mobile/r07-world5` and `mobile/r08-world6`.
- **Before the penalty, about 7:** five of the six worlds read as Hot Springs, and the history card is sourced (`mobile/r13-win`).
- **Penalty of 1.0:** the Pamukkale-style terraces lead the title screen and repeat on the map and World 2.
- **Who was right:** Claude's identification is right but its penalty is too light. Codex's penalty is right but its baseline is too low.
- Della, the guide, is drawn with dignity (`mobile/r17-tip`), so there is no stereotype penalty.

**IP check:** clean. Both critics agree, and I saw nothing copied.

## Ranked gaps (expected gain ÷ effort)

1. **G-board-seating** (rendering, S, +0.8, severity 4)
   - Delete the hard-edged translucent rectangle behind the board.
   - Add a feathered radial vignette (edge alpha 0.35).
   - Add a cast shadow under the frame: blur of 24 px or more, 8 px y-offset.
   - Add a soft 6 px contact-shadow ellipse under every piece.
   - Keep at least 16 px between the desktop board and the viewport edges.
   - Test: no straight seam visible in `desktop/r03` or `mobile/r03`.
2. **G-motion-feel** (animation, M, +1.5, severity 5)
   - Swap: back-out ease with a 1.08 scale lift.
   - Clear: a 1.15 scale pop before the shrink.
   - Falls: a landing squash of 0.9 × 1.1 with a settle.
   - HUD: the moves counter decrements and the score counts up and pulses on every move.
   - Specials: a callout word and a 4–6 px board shake.
   - Cascade: replace the white cotton beam with an additive streak with a bright core and tapered ends.
   - Recapture the strips so at least 2 frames show falling pieces.
3. **G-header-text-fit** (ui, S, +0.5, severity 4)
   - Move "★ n / 180" into its own pill outside the title block.
   - Shrink world labels to fit on one line.
   - Keep "How to play" on one line.
   - Test: no text bounding boxes intersect in r01, r02, r05, r15 or r16 at either viewport.
4. **G-star-bar** (ui, S, +0.5, severity 3)
   - Place the three star markers at their threshold fractions along a visible gold fill.
   - Draw them below the score numerals.
   - Test: in `mobile/r12` the markers are spread out and none overlaps the digits.
5. **G-goal-icons-match** (readability, S, +0.5, severity 4)
   - Draw the HUD and intro goal icons from the board's own sprites (tufa, flower, lock, crust).
   - Spawn at least one visible bath token on the board whenever a token goal exists.
   - Test: each goal-to-board pair matches in r04, r06 and r08.
6. **G-mobile-hud-layout** (mobile, S, +0.5, severity 3)
   - Move the board down, or enlarge its cells, to use the band of about 270 px above the tray.
   - Keep up to 5 goals on one row of 64 px pills so the moves badge stays put.
   - Dock the tip card and portrait away from the board on both viewports.
   - Test: in r17 every cell is visible; in r08 the goals fit on one row.
7. **G-specials-identity** (art, M, +1.0, severity 5)
   - Render each special as its own Blender piece.
   - Cascade: a glowing band with arrow fins at least 30% of the cell wide.
   - Hot Stone: the piece set in ember-orange stone with a pulsing halo.
   - Spring Crystal: a large rainbow-faceted crystal with its own silhouette.
   - Test: each can be named without a label at 390 px in frame 1 of r09–r11.
8. **G-tufa-accuracy** (authenticity, M, +1.0, severity 4)
   - Repaint the terraces on the title, map and World 2 (backdrop and lose screen) as drab grey-brown tufa with a small steaming outflow, like the Hot Water Cascade.
   - Test: no white or turquoise stepped pools in r01, r02, r04 or r14.
9. **G-result-labels** (ui, S, +0.3, severity 3)
   - Map booster ids to display names ("+5 Moves", not "plus5").
   - Drive the r13 win capture through real play, or seed a score above the 3-star threshold, so the card's stars and score agree.
10. **G-blocker-legibility** (readability, M, +0.5, severity 3)
    - Lock: a brass chain in an X across the whole piece.
    - Crust: a textured grey mineral border around the cell edges that leaves the piece at full contrast.
    - Steam: a translucent swirling vapour sprite, not opaque white blobs.
    - Test: each blocker type can be identified at 390 px in r05, r07 and r17.

```json
{
  "loop": 0,
  "role": "judge",
  "scores": {
    "art": { "score": 6.0, "confidence": 0.75, "evidence": ["desktop/r01-title", "mobile/r05-world3", "desktop/r03-world1", "mobile/r12-callout", "mobile/r10-stone-fire", "desktop/r17-tip", "mobile/r07-world5"] },
    "rendering": { "score": 5.0, "confidence": 0.75, "evidence": ["desktop/r03-world1", "mobile/r12-callout", "mobile/r10-stone-fire", "desktop/r17-tip", "mobile/r05-world3", "strips/mobile-s1"] },
    "animation": { "score": 5.0, "confidence": 0.7, "evidence": ["strips/mobile-s1", "strips/mobile-s2", "strips/desktop-s1", "mobile/r12-callout"] },
    "ui": { "score": 5.5, "confidence": 0.75, "evidence": ["mobile/r02-map", "desktop/r02-map", "mobile/r16-help", "mobile/r15-intro", "mobile/r13-win", "mobile/r12-callout", "mobile/r08-world6", "desktop/r17-tip"] },
    "typography": { "score": 6.0, "confidence": 0.7, "evidence": ["mobile/r05-world3", "mobile/r06-world4", "mobile/r07-world5", "mobile/r08-world6", "desktop/r01-title", "mobile/r02-map"] },
    "readability": { "score": 6.0, "confidence": 0.75, "evidence": ["mobile/r06-world4", "mobile/r04-world2", "mobile/r05-world3", "mobile/r08-world6", "mobile/r12-callout"] },
    "mobile": { "score": 6.0, "confidence": 0.75, "evidence": ["mobile/r05-world3", "mobile/r12-callout", "mobile/r08-world6", "mobile/r17-tip", "mobile/r02-map"] },
    "authenticity": { "score": 6.0, "confidence": 0.7, "evidence": ["desktop/r01-title", "mobile/r02-map", "mobile/r04-world2", "mobile/r05-world3", "mobile/r06-world4", "mobile/r07-world5", "mobile/r08-world6", "mobile/r13-win", "mobile/r17-tip"] }
  },
  "ip": { "clean": true, "notes": "Both critics and the judge found no copied commercial match-3 names, logos, piece designs or UI. Booster tray and lock overlays are genre conventions." },
  "gaps": [
    { "id": "G-board-seating", "category": "rendering", "expectedGain": 0.8, "severity": 4, "effort": "S", "evidence": ["desktop/r03-world1", "mobile/r12-callout", "desktop/r17-tip"], "fix": "Delete the hard-edged translucent rectangle behind the board; add a feathered radial vignette (edge alpha 0.35), a 24px+ blur cast shadow with 8px y-offset under the frame, and a soft 6px contact-shadow ellipse under every piece; keep at least 16px between the desktop board and viewport edges. Test: no straight seam visible in desktop/r03 or mobile/r03." },
    { "id": "G-motion-feel", "category": "animation", "expectedGain": 1.5, "severity": 5, "effort": "M", "evidence": ["strips/mobile-s1", "strips/mobile-s2", "strips/desktop-s1", "mobile/r12-callout"], "fix": "Back-out eased swap with 1.08 scale lift; 1.15 scale pop before each clear; falls with a 0.9x1.1 landing squash and settle; HUD moves decrement and score counts up with a pulse on every move; callout word plus 4-6px board shake on specials; replace the white cotton Cascade beam with an additive streak with bright core and tapered ends. Recapture strips with at least 2 frames of falling pieces." },
    { "id": "G-header-text-fit", "category": "ui", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r02-map", "desktop/r02-map", "mobile/r16-help", "mobile/r05-world3", "desktop/r01-title"], "fix": "Move the star total into its own pill outside the world-title block; shrink-to-fit world labels to one line; keep 'How to play' on one line. Test: no text bounding boxes intersect or orphan-wrap in r01, r02, r05, r15, r16 at both viewports." },
    { "id": "G-star-bar", "category": "ui", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r12-callout", "mobile/r08-world6", "mobile/r05-world3"], "fix": "Place the three star markers at their threshold fractions along a visible gold fill, drawn below the score numerals. Test: in mobile/r12 markers are spread and none overlaps the digits." },
    { "id": "G-goal-icons-match", "category": "readability", "expectedGain": 0.5, "severity": 4, "effort": "S", "evidence": ["mobile/r04-world2", "mobile/r08-world6", "mobile/r06-world4", "mobile/r15-intro"], "fix": "Render HUD and intro goal icons from the same sprites as the board (tufa, flower, lock, crust); spawn at least one visible bath token whenever a token goal exists. Test: each goal-to-board pair matches in r04, r06, r08." },
    { "id": "G-mobile-hud-layout", "category": "mobile", "expectedGain": 0.5, "severity": 3, "effort": "S", "evidence": ["mobile/r12-callout", "mobile/r08-world6", "mobile/r17-tip", "desktop/r17-tip"], "fix": "Move the board down or enlarge cells to use the ~270px dead band above the tray; keep up to 5 goals on one row of 64px pills so the moves badge stays fixed; dock the tip card and portrait off the board on both viewports. Test: every cell visible in r17; goals on one row in r08." },
    { "id": "G-specials-identity", "category": "art", "expectedGain": 1.0, "severity": 5, "effort": "M", "evidence": ["mobile/r12-callout", "mobile/r10-stone-fire", "strips/mobile-s2", "mobile/r05-world3"], "fix": "Render each special as its own Blender piece: Cascade with a glowing band and arrow fins at least 30% of the cell wide; Hot Stone set in ember-orange stone with a pulsing halo; Spring Crystal as a large rainbow-faceted crystal with its own silhouette. Test: each nameable without a label at 390px in frame 1 of r09-r11." },
    { "id": "G-tufa-accuracy", "category": "authenticity", "expectedGain": 1.0, "severity": 4, "effort": "M", "evidence": ["desktop/r01-title", "mobile/r02-map", "desktop/r02-map", "mobile/r04-world2"], "fix": "Repaint the white/turquoise stepped terraces on the title, map and World 2 backdrop as drab grey-brown tufa with a small steaming outflow like the Hot Water Cascade. Test: no white or turquoise stepped pools in r01, r02, r04, r14." },
    { "id": "G-result-labels", "category": "ui", "expectedGain": 0.3, "severity": 3, "effort": "S", "evidence": ["mobile/r13-win", "desktop/r13-win"], "fix": "Map booster ids to display names ('+5 Moves', not 'plus5'); drive the r13 win capture through real play or seed a score above the 3-star threshold so the card's stars and score agree." },
    { "id": "G-blocker-legibility", "category": "readability", "expectedGain": 0.5, "severity": 3, "effort": "M", "evidence": ["mobile/r05-world3", "mobile/r07-world5", "desktop/r17-tip", "mobile/r17-tip"], "fix": "Lock as a brass chain in an X across the whole piece; crust as a textured grey mineral border around the cell edges leaving the piece at full contrast; steam as a translucent swirling vapour sprite instead of opaque white blobs. Test: each blocker type identifiable at 390px in r05, r07, r17." }
  ],
  "verdict": "continue"
}
```
