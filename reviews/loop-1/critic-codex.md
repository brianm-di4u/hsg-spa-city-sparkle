Continue. **Spa City Sparkle scores 51/80 (6.38/10)** against premium phone match-3 standards. The paintings provide atmosphere, the ordinary pieces have strong silhouettes, and the effects communicate their clearing patterns. The presentation still falls short through crowded HUD labels, an obscured map information card, inconsistent material richness, and boards that resemble inset trays floating over illustrations. The mobile layout is functional, but its large scenic gaps and dense header do not yet feel fully art-directed for a phone. These judgments come from the supplied images and motion strips; the strips support sequence readability more confidently than precise timing or easing.

1. **Art — 6.5/10.** The gold horseshoes, cyan droplets and pink flowers have clear silhouettes and appealing highlights. The purple crystals look comparatively flat and sparsely faceted; the brown blockers resemble dull lumps with gold studs. Chains have recognizable metal detail but become visually fiddly at phone scale. The lush paintings carry more detail and atmosphere than the game objects, leaving a visible style gap. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`, `desktop/r01-title.png`.

2. **Rendering and lighting — 6/10.** The frame, dark cells and shadow establish a readable foreground layer. Cascade light has a bright core and soft bloom, while Crystal rays make a convincing focal flash. However, the repeated rectangular cell highlights and uniformly lit pieces give the board a rigid tray appearance; its lighting scarcely relates to the richly illuminated setting. The shadow helps separation more than physical seating. Evidence: `desktop/r09-cascade-fire.png`, `mobile/r11-crystal-rays.png`, `mobile/r04-world2.png`.

3. **Animation and game feel — 6.5/10.** The Cascade strip clearly progresses from swap to beam, cleared row, falling pieces and refill. The Crystal strip highlights affected purple pieces before the central flash and subsequent fall, giving the event a readable causal structure. The spectacle remains relatively thin: a flash, fading pieces and refill provide less visible anticipation and follow-through than the genre leaders. The sampled frames do not establish the claimed overshoot or landing squash strongly enough to award full credit. Evidence: `strips/mobile-s1.png`, `strips/mobile-s2.png`, `strips/desktop-s1.png`, `strips/desktop-s2.png`.

4. **UI / HUD and menus — 6/10.** Moves and score have clear priority; the cream dialogs and teal/gold buttons form a consistent family. Goal icons visibly match their board counterparts. However, the map header obscures the world information card, including its heading. Help devotes substantial space to text without showing the special pieces it describes. The win screen's three plain stars and text reward feel modest for the principal celebration. Evidence: `desktop/r02-map.png`, `mobile/r16-help.png`, `mobile/r13-win.png`.

5. **Typography — 6.5/10.** The rounded display face has personality, the body face reads comfortably in dialogs, and the large numerals are immediately legible. The hierarchy deteriorates in the gameplay header: world names repeatedly end in ellipses, some level names also truncate, and star markers crowd the narrow score bar. The reward line wraps "+5 Moves" awkwardly across lines. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`, `mobile/r13-win.png`.

6. **Readability — 6.5/10.** Ordinary pieces separate well by both shape and color. Matching goal sprites and the unobscured centers of the pale rimmed cells help. Lock overlays, tiny bottom-row grates and multiple bright cell treatments compete for attention in advanced boards. Steam reads as a luminous spiral emblem rather than soft vapor, making its visual language unusually close to a power-up. Evidence: `mobile/r08-world6.png`, `mobile/r05-world3.png`, `mobile/r17-tip.png`.

7. **Mobile — 6.5/10.** Boards use nearly the full width, booster buttons are substantial, and the help and result dialogs fit the portrait viewport. Nevertheless, broad scenic bands separate the HUD, board and boosters, while the header itself remains crowded. The tutorial card occupies the booster area, and its guide overlaps the leftmost control. Small decorative blocker details lose clarity at the effective 390-pixel width. Evidence: `mobile/r04-world2.png`, `mobile/r08-world6.png`, `mobile/r17-tip.png`, `mobile/r16-help.png`.

8. **Authenticity — 6.5/10.** The tiled dome, bathhouse architecture, observation tower, racing setting and woodland garden architecture establish a specific regional identity. The historical card adds useful local context. However, enormous cascading terraces dominate the title and mountain imagery; even with grey-tan stone and algae, their scale and arrangement communicate an extravagant fantasy spa landscape. The guide appears as a personable attendant; I see no overt caricature in the supplied captures. Evidence: `desktop/r01-title.png`, `mobile/r04-world2.png`, `desktop/r06-world4.png`, `mobile/r08-world6.png`, `mobile/r13-win.png`, `desktop/r17-tip.png`.

**IP check: clean.** No apparent copied commercial match-3 names, logos, distinctive piece designs or branded UI appear in these captures. Generic genre conventions alone do not indicate copying.

Ranked gaps follow. Expected gains are points within the named 10-point category, estimated independently and not guaranteed to add together.

1. **Repair the map header collision.** Move the world information card below the fixed navigation bar and reserve its full height in the scroll layout. Verify that the complete heading, thumbnail and restoration text remain visible at both supplied viewport sizes. Evidence: `desktop/r02-map.png`, `mobile/r02-map.png`. **Gain: +0.5 UI; severity 4; effort S.**

2. **Recompose the portrait HUD and vertical spacing.** Reserve separate widths for moves, level identity and score; make the short world names fit without ellipses. Reduce scenic gaps sufficiently to move the board closer to the booster tray, with a dedicated tutorial region that does not cover controls. Verify all six world headers and the tutorial at 390×844. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`, `mobile/r17-tip.png`. **Gain: +1 mobile; severity 4; effort M.**

3. **Unify piece and board material quality.** Add richer bevels and facet lighting to purple crystals, give brown blockers a recognizable mineral surface, and soften the repeated cell highlight bars. Match the board's ambient tint and frame lighting to each world. Verify that these objects retain material identity at phone size. Evidence: `mobile/r05-world3.png`, `mobile/r04-world2.png`, `desktop/r09-cascade-fire.png`. **Gain: +1 art; severity 4; effort L.**

4. **Separate blocker and special visual languages.** Render steam as soft translucent vapor with a clear cell boundary; simplify chains and enlarge the meaningful lock distinction. Make bottom-row exit markers recognizable without relying on fine gold lines. Test identification from unlabeled phone captures containing all states. Evidence: `mobile/r17-tip.png`, `mobile/r08-world6.png`. **Gain: +0.5 readability; severity 3; effort M.**

5. **Strengthen visible anticipation and landing response.** Give specials a distinct charge pose, then impact, debris or fragments, and a readable settling phase. Capture denser motion strips that visibly demonstrate swap overshoot and landing compression while preserving the clear target sequence. Evidence: `strips/mobile-s1.png`, `strips/mobile-s2.png`. **Gain: +0.5 animation; severity 3; effort M.**

6. **Reduce the fantasy terrace dominance.** Recompose the title and mountain painting around smaller grey-tan spring deposits and recognizable bathhouse/mountain relationships. Verify that the spring formation no longer occupies the scene as a monumental stepped waterfall. Evidence: `desktop/r01-title.png`, `mobile/r04-world2.png`. **Gain: +0.5 authenticity; severity 3; effort L.**

7. **Finish the instructional and reward presentation.** Add rendered special-piece examples to Help, keep "+5 Moves" together, and replace flat reward stars with dimensional assets consistent with the pieces. Verify clean wrapping and a clear reward hierarchy in the mobile win dialog. Evidence: `mobile/r16-help.png`, `mobile/r13-win.png`. **Gain: +0.5 UI; severity 2; effort M.**

```json
{
  "loop": 1,
  "role": "critic-codex",
  "scores": {
    "art": {
      "score": 6.5,
      "confidence": 0.93,
      "evidence": ["mobile/r05-world3.png", "mobile/r08-world6.png", "desktop/r01-title.png"]
    },
    "rendering": {
      "score": 6,
      "confidence": 0.92,
      "evidence": ["desktop/r09-cascade-fire.png", "mobile/r11-crystal-rays.png", "mobile/r04-world2.png"]
    },
    "animation": {
      "score": 6.5,
      "confidence": 0.72,
      "evidence": ["strips/mobile-s1.png", "strips/mobile-s2.png", "strips/desktop-s1.png", "strips/desktop-s2.png"]
    },
    "ui": {
      "score": 6,
      "confidence": 0.95,
      "evidence": ["desktop/r02-map.png", "mobile/r16-help.png", "mobile/r13-win.png"]
    },
    "typography": {
      "score": 6.5,
      "confidence": 0.95,
      "evidence": ["mobile/r05-world3.png", "mobile/r08-world6.png", "mobile/r13-win.png"]
    },
    "readability": {
      "score": 6.5,
      "confidence": 0.9,
      "evidence": ["mobile/r08-world6.png", "mobile/r05-world3.png", "mobile/r17-tip.png"]
    },
    "mobile": {
      "score": 6.5,
      "confidence": 0.94,
      "evidence": ["mobile/r04-world2.png", "mobile/r08-world6.png", "mobile/r17-tip.png", "mobile/r16-help.png"]
    },
    "authenticity": {
      "score": 6.5,
      "confidence": 0.78,
      "evidence": ["desktop/r01-title.png", "mobile/r04-world2.png", "desktop/r06-world4.png", "mobile/r08-world6.png", "mobile/r13-win.png", "desktop/r17-tip.png"]
    }
  },
  "ip": {
    "clean": true,
    "notes": "No apparent copied commercial names, logos, distinctive piece designs or branded UI in the supplied captures."
  },
  "gaps": [
    {
      "id": "G-map-header",
      "category": "ui",
      "expectedGain": 0.5,
      "severity": 4,
      "effort": "S",
      "evidence": ["desktop/r02-map.png", "mobile/r02-map.png"],
      "fix": "Place the world information card below the fixed navigation bar and reserve its full height; verify the complete card is visible at both viewport sizes."
    },
    {
      "id": "G-portrait-composition",
      "category": "mobile",
      "expectedGain": 1,
      "severity": 4,
      "effort": "M",
      "evidence": ["mobile/r05-world3.png", "mobile/r08-world6.png", "mobile/r17-tip.png"],
      "fix": "Reserve widths for moves, level identity and score; fit short world names without ellipses, reduce scenic gaps, and provide a tutorial region that does not cover booster controls. Verify all worlds at 390x844."
    },
    {
      "id": "G-material-cohesion",
      "category": "art",
      "expectedGain": 1,
      "severity": 4,
      "effort": "L",
      "evidence": ["mobile/r05-world3.png", "mobile/r04-world2.png", "desktop/r09-cascade-fire.png"],
      "fix": "Enrich crystal bevels and facet lighting, give brown blockers recognizable mineral surfaces, soften repeated cell highlight bars, and match board lighting to each world. Verify material identity at phone size."
    },
    {
      "id": "G-state-language",
      "category": "readability",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "M",
      "evidence": ["mobile/r17-tip.png", "mobile/r08-world6.png"],
      "fix": "Use soft vapor for steam, simplify chains while strengthening lock-state distinctions, and enlarge meaningful exit markers. Test identification from unlabeled phone captures."
    },
    {
      "id": "G-motion-follow-through",
      "category": "animation",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "M",
      "evidence": ["strips/mobile-s1.png", "strips/mobile-s2.png"],
      "fix": "Add distinct charge, impact, fragments and settling phases; supply denser strips that visibly demonstrate swap overshoot and landing compression."
    },
    {
      "id": "G-terrace-scale",
      "category": "authenticity",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "L",
      "evidence": ["desktop/r01-title.png", "mobile/r04-world2.png"],
      "fix": "Recompose title and mountain scenes around smaller grey-tan spring deposits and recognizable bathhouse/mountain relationships; remove the dominant monumental stepped-waterfall impression."
    },
    {
      "id": "G-help-rewards",
      "category": "ui",
      "expectedGain": 0.5,
      "severity": 2,
      "effort": "M",
      "evidence": ["mobile/r16-help.png", "mobile/r13-win.png"],
      "fix": "Add rendered special examples to Help, keep '+5 Moves' together, and use dimensional reward stars consistent with the pieces. Verify mobile wrapping and reward hierarchy."
    }
  ],
  "verdict": "continue"
}
```
