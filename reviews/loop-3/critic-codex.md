Spa City Sparkle scores **52.5/80 (6.56/10): continue**. The paintings, clear base-piece silhouettes, and consistent gold-and-cream palette establish a credible game identity. It falls short of premium phone match-3 presentation in board materials, mobile composition, HUD polish, and animation follow-through. The visible effects communicate what fired, but oversized callouts still cover pieces, blockers lose definition on dark boards, and the map’s nearly invisible heading is a conspicuous finish defect. The captures support a polished foundation, not a commercial-leader finish.

1. **Art — 7/10.** The drops and horseshoes have convincing gloss, while flowers, fans, and crystals separate well by silhouette. The painted gardens and architecture supply considerable richness. However, the purple crystals have broad, plain facets, the fans read more like graphic icons than dimensional objects, and tufa resembles a repeated scalloped lump with tiny gold studs. Chains are ornate but visually fussy at phone size. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`, `desktop/r04-world2.png`.

2. **Rendering and lighting — 6.5/10.** Bevels, dark cells, frame highlights, and the surrounding shadow give the board depth and separation. Crystal rays have a bright core and soft bloom. Nevertheless, the regular, hard cell grid and uniformly lit pieces feel detached from the richly atmospheric paintings. The grey World 2 frame looks particularly utilitarian beside the environment. Tufa becomes muddy on the dark purple board. Evidence: `desktop/r04-world2.png`, `mobile/r05-world3.png`, `mobile/r11-crystal-rays.png`.

3. **Animation and game feel — 6.5/10.** The strips show readable swaps, a distinct Cascade sweep, progressive Crystal targeting, cleared spaces, and subsequent falls. Score counting and callout growth add activity. The Crystal sequence has the strongest buildup and release. Landing follow-through is much less evident: the last frames settle into nearly identical rigid grids, without a clearly legible bounce or squash. Small particles contribute less impact than the large white flashes and text. Sampled stills cannot establish exact easing or frame pacing, so those are not credited as proven strengths. Evidence: `strips/mobile-s1.png`, `strips/mobile-s2.png`, `strips/desktop-s1.png`, `strips/desktop-s2.png`.

4. **UI / HUD and menus — 6/10.** Moves have a strong primary position, goal pills are compact, and cream dialogs with gold and teal actions form a consistent system. The lose dialog clearly exposes the remaining requirements. Against that, the map heading is extremely low contrast, the star track is tiny relative to the moves badge, and the booster tray uses generic symbols and notification badges rather than the crafted visual language of the pieces. Help’s blue outline tabs introduce another button treatment. Evidence: `mobile/r02-map.png`, `mobile/r14-lose.png`, `mobile/r16-help.png`, `mobile/r08-world6.png`.

5. **Typography — 6.5/10.** Rounded display lettering and simpler explanatory text provide a usable hierarchy. Dialog copy is comfortably spaced, and wrapped level names avoid obvious truncation. The map’s dark green world heading almost disappears into its header, however. Oversized, heavily outlined special callouts dominate the board; secondary HUD information and help-icon labels receive comparatively little emphasis. Evidence: `mobile/r02-map.png`, `mobile/r16-help.png`, `mobile/r11-crystal-rays.png`, `mobile/r06-world4.png`.

6. **Readability — 6.5/10.** Base pieces distinguish themselves well by both shape and colour, and goal icons correspond to board objects. The difficulty lies in stacked states: chains, crust, steam, and collection sockets create several competing outlines. Tufa’s lower studs are difficult to count on the dark board. Crucially, “Spring Crystal!” still intrudes into the top row, concealing parts of multiple pieces; placing the callout at the board edge has not fully solved obstruction. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`, `mobile/r11-crystal-rays.png`, `mobile/r17-tip.png`.

7. **Mobile — 6.5/10.** The board spans nearly the full width, the bottom tools are reachable, and dialogs remain within the portrait viewport. But roughly the upper third of gameplay is allocated to the HUD and scenery before the board begins. On nine-column levels, cells are only about 41 logical pixels wide before their borders, while the large moves badge consumes disproportionate space. The composition showcases the painting more effectively than it prioritizes play. Evidence: `mobile/r03-world1.png`, `mobile/r05-world3.png`, `mobile/r08-world6.png`, `mobile/r14-lose.png`.

8. **Authenticity — 7/10.** Bathhouse architecture, the tiled dome, wooded slopes, racing, lakes, and the garden chapel give the worlds a recognizable Hot Springs identity. The visible World 2 terrain avoids conspicuous white stepped terraces, and its board tufa is grey. The guide appears respectfully presented. Precision is weaker than atmosphere: repeated towers, domes, lush flowers, and warm haze make several locations resemble an idealized resort montage. “Holiday Lights” is illustrated primarily as a daylight garden rather than a distinctive illuminated destination. Evidence: `desktop/r04-world2.png`, `mobile/r06-world4.png`, `mobile/r07-world5.png`, `mobile/r08-world6.png`, `mobile/r17-tip.png`.

**IP check: clean.** No identifiable copied commercial match-3 names, logos, signature piece designs, or distinctive UI compositions appear in the reviewed captures. Stars, rounded buttons, boosters, and a winding level path are generic genre conventions.

The ranked gaps below give expected gains in the named category’s 10-point score. These estimates overlap and should not be added mechanically.

1. **Callouts still obscure the board.** Reserve a text lane entirely above the frame and constrain the animated text’s full bounds to it. Test the longest callout at its largest animation scale on both layouts; no glyph, stroke, or shadow should cross a playable cell. Evidence: `mobile/r11-crystal-rays.png`, `mobile/r10-stone-fire.png`. **Expected gain: +0.5 readability; severity 4; effort S.**

2. **The map heading fails contrast and hierarchy.** Give the world title an opaque, contrasting colour and a dedicated header column. Preserve readable text at 390 px with the postcard, star counter, and settings button present. Evidence: `mobile/r02-map.png`, `desktop/r02-map.png`. **Expected gain: +0.5 UI; severity 4; effort S.**

3. **The mobile layout spends too much height on scenery.** Compact the header and move the board upward, retaining useful space above the bottom tools. Compare all six world layouts at 390×844; target nine-column cells of at least 44 logical pixels where feasible, adjusting margins and frame thickness first. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`. **Expected gain: +0.5 mobile; severity 4; effort M.**

4. **Blocker materials and layer counts lack immediate clarity.** Increase tufa’s material contrast on dark cells and replace tiny studs with larger, consistently spaced layer indicators. Simplify chain highlights so the underlying piece remains dominant. Test every blocker and layer state at actual phone size on each board colour. Evidence: `mobile/r05-world3.png`, `mobile/r08-world6.png`. **Expected gain: +0.5 readability; severity 3; effort M.**

5. **Cascades lack visible landing punctuation.** Add a short, staggered landing compression and rebound, with restrained contact flashes or particles at affected cells. Capture denser strips around impact so anticipation, contact, and recovery are independently visible. Evidence: `strips/mobile-s1.png`, `strips/mobile-s2.png`. **Expected gain: +0.5 animation; severity 3; effort M.**

6. **The board and tools need a more unified material treatment.** Reduce the heavy cell seams, strengthen consistent piece contact shadows, and give booster icons the dimensional treatment used by the pieces. Compare the purple and teal boards to ensure both retain clear blocker silhouettes. Evidence: `desktop/r04-world2.png`, `mobile/r05-world3.png`, `mobile/r08-world6.png`. **Expected gain: +0.5 rendering; severity 3; effort L.**

```json
{
  "loop": 3,
  "role": "critic-codex",
  "scores": {
    "art": {
      "score": 7,
      "confidence": 0.94,
      "evidence": [
        "mobile/r05-world3.png",
        "mobile/r08-world6.png",
        "desktop/r04-world2.png"
      ]
    },
    "rendering": {
      "score": 6.5,
      "confidence": 0.93,
      "evidence": [
        "desktop/r04-world2.png",
        "mobile/r05-world3.png",
        "mobile/r11-crystal-rays.png"
      ]
    },
    "animation": {
      "score": 6.5,
      "confidence": 0.77,
      "evidence": [
        "strips/mobile-s1.png",
        "strips/mobile-s2.png",
        "strips/desktop-s1.png",
        "strips/desktop-s2.png"
      ]
    },
    "ui": {
      "score": 6,
      "confidence": 0.95,
      "evidence": [
        "mobile/r02-map.png",
        "mobile/r14-lose.png",
        "mobile/r16-help.png",
        "mobile/r08-world6.png"
      ]
    },
    "typography": {
      "score": 6.5,
      "confidence": 0.94,
      "evidence": [
        "mobile/r02-map.png",
        "mobile/r16-help.png",
        "mobile/r11-crystal-rays.png",
        "mobile/r06-world4.png"
      ]
    },
    "readability": {
      "score": 6.5,
      "confidence": 0.94,
      "evidence": [
        "mobile/r05-world3.png",
        "mobile/r08-world6.png",
        "mobile/r11-crystal-rays.png",
        "mobile/r17-tip.png"
      ]
    },
    "mobile": {
      "score": 6.5,
      "confidence": 0.94,
      "evidence": [
        "mobile/r03-world1.png",
        "mobile/r05-world3.png",
        "mobile/r08-world6.png",
        "mobile/r14-lose.png"
      ]
    },
    "authenticity": {
      "score": 7,
      "confidence": 0.8,
      "evidence": [
        "desktop/r04-world2.png",
        "mobile/r06-world4.png",
        "mobile/r07-world5.png",
        "mobile/r08-world6.png",
        "mobile/r17-tip.png"
      ]
    }
  },
  "ip": {
    "clean": true,
    "notes": "Clean in the reviewed captures: no identifiable copied commercial names, logos, signature piece designs, or distinctive UI compositions."
  },
  "gaps": [
    {
      "id": "G-callout-obstruction",
      "category": "readability",
      "expectedGain": 0.5,
      "severity": 4,
      "effort": "S",
      "evidence": [
        "mobile/r11-crystal-rays.png",
        "mobile/r10-stone-fire.png"
      ],
      "fix": "Reserve a callout lane above the frame. Verify that the longest callout at maximum animated scale, including stroke and shadow, never crosses a playable cell on either layout."
    },
    {
      "id": "G-map-heading-contrast",
      "category": "ui",
      "expectedGain": 0.5,
      "severity": 4,
      "effort": "S",
      "evidence": [
        "mobile/r02-map.png",
        "desktop/r02-map.png"
      ],
      "fix": "Use an opaque contrasting world-title colour and a dedicated header column. Verify readability at 390 px with all header controls present."
    },
    {
      "id": "G-mobile-board-priority",
      "category": "mobile",
      "expectedGain": 0.5,
      "severity": 4,
      "effort": "M",
      "evidence": [
        "mobile/r05-world3.png",
        "mobile/r08-world6.png"
      ],
      "fix": "Compact the header and move the board upward. Reduce margins and frame thickness to target at least 44 logical pixels per nine-column cell where feasible; verify all six worlds at 390 by 844."
    },
    {
      "id": "G-blocker-state-clarity",
      "category": "readability",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "M",
      "evidence": [
        "mobile/r05-world3.png",
        "mobile/r08-world6.png"
      ],
      "fix": "Increase tufa contrast on dark cells, enlarge and consistently space layer indicators, and simplify chain highlights. Check every blocker state at actual phone size on every board colour."
    },
    {
      "id": "G-landing-follow-through",
      "category": "animation",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "M",
      "evidence": [
        "strips/mobile-s1.png",
        "strips/mobile-s2.png"
      ],
      "fix": "Add staggered landing compression and rebound with restrained contact effects. Capture denser impact strips demonstrating anticipation, contact, and recovery."
    },
    {
      "id": "G-board-material-cohesion",
      "category": "rendering",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "L",
      "evidence": [
        "desktop/r04-world2.png",
        "mobile/r05-world3.png",
        "mobile/r08-world6.png"
      ],
      "fix": "Reduce heavy cell seams, establish consistent piece contact shadows, and render booster icons with materials matching the pieces. Verify blocker contrast on both purple and teal boards."
    }
  ],
  "verdict": "continue"
}
```
