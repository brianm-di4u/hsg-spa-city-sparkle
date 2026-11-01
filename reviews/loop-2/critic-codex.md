Continue. **50.5/80 (6.31/10)**. Spa City Sparkle has attractive destination paintings, distinguishable basic pieces and a usable portrait layout, but it does not yet meet the premium commercial target. The largest weaknesses are inconsistent progress feedback, a visibly discontinuous map painting, crowded mobile labels, and the separation between richly painted scenery and comparatively simple board assets. The motion strips show legible special effects and falling pieces, but do not establish the timing or richness expected of genre leaders. This assessment uses the supplied images only; strip samples cannot establish playback smoothness.

1. **Art — 6.5/10.** The water drops and horseshoes have convincing highlights and distinct silhouettes. The purple quartz has broad, simple facets, while the orange fans appear substantially flatter; these assets do not share the same level of material richness. The mineral blockers resemble brown lumps with small gold details rather than an immediately identifiable mineral deposit (`desktop/r04-world2.png`). The garden painting is attractive, but its intricate foliage and architecture make the simpler pieces feel like a separate asset collection (`mobile/r08-world6.png`). The rendered specials in Help are distinctive, although their surrounding grey shadow patches weaken their presentation (`mobile/r16-help.png`).

2. **Rendering — 6/10.** Bevels, dark cell edges and the outer shadow give the board depth (`desktop/r04-world2.png`). Nevertheless, it remains a brightly lit panel suspended in front of a detailed painting. The garden board retains much the same piece lighting despite a different environment (`mobile/r08-world6.png`). Special rays have a pleasing luminous centre, but the broad haze flattens surrounding pieces rather than producing convincing local illumination (`mobile/r11-crystal-rays.png`). The rectangular grey patches behind Help’s specials are particularly conspicuous against the cream paper (`mobile/r16-help.png`).

3. **Animation — 6.5/10.** The Cascade strip communicates an understandable sequence: swap, bright horizontal sweep, cleared row, refill (`strips/mobile-s1.png`, `strips/desktop-s1.png`). The Crystal strip also connects its burst to affected pieces and a subsequent fall (`strips/mobile-s2.png`, `strips/desktop-s2.png`). These are functional, readable effects. However, the sampled anticipation and landing poses are modest, and Crystal’s impact relies heavily on thin rays and fading pieces. Its strip lacks the named celebration visible in the Cascade sequence. These captures support competent feedback, not exceptional physicality; precise easing, shake and frame pacing remain unverified.

4. **UI / HUD — 6/10.** Moves dominate clearly, and the cream, gold and teal dialogs form a reasonably consistent system (`mobile/r13-win.png`, `mobile/r15-intro.png`). Progress feedback is less trustworthy visually: the Cascade strip begins with a full-looking star bar at score zero, then shows an empty bar while the score remains zero (`strips/mobile-s1.png`). The special-fire capture shows a full-looking bar alongside 540 points and a 12,000-point objective, without explaining their relationship (`mobile/r09-cascade-fire.png`). The map header truncates its central destination name while surrounding controls retain substantial space (`mobile/r02-map.png`). Desktop boosters are also unusually small and detached from the board (`desktop/r04-world2.png`).

5. **Typography — 6.5/10.** The rounded display lettering has character, and moves, scores and dialog headings read clearly (`mobile/r13-win.png`, `mobile/r16-help.png`). The hierarchy deteriorates in the portrait HUD: “W6 · GARVAN GARD...” is truncated, and longer level names are similarly abbreviated (`mobile/r08-world6.png`, `mobile/r07-world5.png`). On the map, “World 2: Hot ...” removes the information that would distinguish the destination (`mobile/r02-map.png`). The issue is allocation of space, not simply font choice.

6. **Readability — 6.5/10.** Water, horseshoe, flower, fan and quartz are easily separated by silhouette and colour (`desktop/r04-world2.png`). Chains and locks are visible, and the goal icons correspond to board elements (`mobile/r08-world6.png`). However, that garden board combines crust, chained pieces, green clusters, coins and gold base rings into a dense vocabulary without equally clear material distinctions. Steam appears as pale bands and haze over still-recognisable pieces, which only partially communicates the tutorial’s assertion that it “hides a piece” (`mobile/r17-tip.png`). The large Cascade wordmark covers the very row whose interaction the player is trying to follow (`mobile/r09-cascade-fire.png`).

7. **Mobile — 6.5/10.** The board spans the available width, the booster tray is reachable, and the tutorial card fits above play (`mobile/r08-world6.png`, `mobile/r17-tip.png`). These are useful portrait decisions. The nine-column board nevertheless produces cells only about 43 logical pixels wide, and layered blockers make those cells visually busy. The large scenery interval between HUD and board consumes space while world and level labels are abbreviated (`mobile/r07-world5.png`, `mobile/r08-world6.png`). The map header is particularly cramped despite the otherwise generous vertical composition (`mobile/r02-map.png`). Static captures cannot verify touch behaviour.

8. **Authenticity — 6/10.** The tiled dome, bathhouse architecture, wooded hills, racing venue and garden chapel provide a much stronger regional identity than a generic spa theme (`desktop/r03-world1.png`, `mobile/r06-world4.png`, `mobile/r08-world6.png`). However, the extensive stepped thermal pools and cascading terraces remain a dominant fantasy-landscape cue (`desktop/r04-world2.png`, `mobile/r02-map.png`). Against the rubric’s caution about Hot Springs’ tufa, their scale and prominence undermine specificity even where the stone is grey-tan. The guide is presented as a fictional attendant; these captures alone do not justify a claim of caricature (`mobile/r17-tip.png`).

**IP check: clean.** No visible commercial match-3 names, logos, distinctive copied pieces or recognisably copied UI were identified. Gems, stars, horseshoes and match-3 conventions are generic visual vocabulary.

Ranked gaps below give expected gains within the named category; they are estimates and should not be added across overlapping fixes.

1. **Progress feedback contradicts itself.** In `strips/mobile-s1.png`, score zero accompanies both a full-looking and an empty star bar. Make each sampled state display progress derived from the same visible score and thresholds; verify zero, each threshold, and the final strip frame. **Expected gain: +1.0 UI; severity 5; effort M.**

2. **The mobile map has an obvious horizontal painting discontinuity.** Near the top of `mobile/r02-map.png`, scenery abruptly changes across a straight horizontal boundary, and the dotted route extends into a disconnected-looking upper segment. Repair the image transition and route alignment; verify the entire scroll range at 390 px with no straight seam or orphan connector. **Expected gain: +0.5 art; severity 4; effort M.**

3. **Portrait HUD labels lose essential identity.** Reallocate the header into explicit rows so full world names and level names remain readable at 390 px, including Garvan Gardens, Three Sisters Springs and the map destination. Keep five goals visible without colliding with score or moves (`mobile/r02-map.png`, `mobile/r07-world5.png`, `mobile/r08-world6.png`). **Expected gain: +1.0 typography; severity 4; effort M.**

4. **Pieces and blockers lack a unified material finish.** Give quartz and fans comparable highlight richness to the drops and horseshoes; replace brown mineral lumps with recognisable crust forms. Remove the visible rectangular shadow fields from Help’s special illustrations. Verify both isolated assets and the densest phone board (`desktop/r04-world2.png`, `mobile/r08-world6.png`, `mobile/r16-help.png`). **Expected gain: +1.0 art; severity 4; effort L.**

5. **Layered board states and celebrations compete with the puzzle.** Differentiate crust, steam and base rings through material and edge treatment. Place the Cascade label above the affected row or shorten its obstruction; preserve a clear view of the sweep and affected cells (`mobile/r08-world6.png`, `mobile/r17-tip.png`, `mobile/r09-cascade-fire.png`). **Expected gain: +0.5 readability; severity 3; effort M.**

6. **Crystal needs a stronger event sequence.** Add a clearly sampled charge pose, distinct affected-piece reactions, a named callout and visible landing deformation. Supply strips that show each stage without concealing the board (`strips/mobile-s2.png`, `strips/desktop-s2.png`). **Expected gain: +0.5 animation; severity 3; effort M.**

7. **Thermal scenery overstates terraced pools.** Reduce their extent and replace dominant stepped cascades with restrained grey-tan deposits, spring outlets and bathhouse landscape details. Verify that the mountain world reads as Hot Springs without relying on its label (`desktop/r04-world2.png`, `mobile/r02-map.png`). **Expected gain: +0.5 authenticity; severity 3; effort L.**

```json
{
  "loop": 2,
  "role": "critic-codex",
  "scores": {
    "art": {
      "score": 6.5,
      "evidence": ["desktop/r04-world2.png", "mobile/r08-world6.png", "mobile/r16-help.png"]
    },
    "rendering": {
      "score": 6,
      "evidence": ["desktop/r04-world2.png", "mobile/r08-world6.png", "mobile/r11-crystal-rays.png", "mobile/r16-help.png"]
    },
    "animation": {
      "score": 6.5,
      "confidence": 0.7,
      "evidence": ["strips/mobile-s1.png", "strips/desktop-s1.png", "strips/mobile-s2.png", "strips/desktop-s2.png"]
    },
    "ui": {
      "score": 6,
      "evidence": ["mobile/r13-win.png", "mobile/r15-intro.png", "strips/mobile-s1.png", "mobile/r09-cascade-fire.png", "mobile/r02-map.png"]
    },
    "typography": {
      "score": 6.5,
      "evidence": ["mobile/r13-win.png", "mobile/r16-help.png", "mobile/r08-world6.png", "mobile/r07-world5.png", "mobile/r02-map.png"]
    },
    "readability": {
      "score": 6.5,
      "evidence": ["desktop/r04-world2.png", "mobile/r08-world6.png", "mobile/r17-tip.png", "mobile/r09-cascade-fire.png"]
    },
    "mobile": {
      "score": 6.5,
      "evidence": ["mobile/r08-world6.png", "mobile/r17-tip.png", "mobile/r07-world5.png", "mobile/r02-map.png"]
    },
    "authenticity": {
      "score": 6,
      "evidence": ["desktop/r03-world1.png", "mobile/r06-world4.png", "mobile/r08-world6.png", "desktop/r04-world2.png", "mobile/r02-map.png"]
    }
  },
  "ip": {
    "clean": true,
    "notes": "No visible copied commercial match-3 names, logos, distinctive piece designs or recognisably copied UI identified."
  },
  "gaps": [
    {
      "id": "G-progress-feedback",
      "category": "ui",
      "expectedGain": 1,
      "severity": 5,
      "effort": "M",
      "evidence": ["strips/mobile-s1.png", "mobile/r09-cascade-fire.png"],
      "fix": "Derive the visible star bar from the same score and thresholds in every capture. Verify zero, threshold crossings and final motion-strip states; eliminate full-looking and empty bars at the same zero score."
    },
    {
      "id": "G-map-seam",
      "category": "art",
      "expectedGain": 0.5,
      "severity": 4,
      "effort": "M",
      "evidence": ["mobile/r02-map.png"],
      "fix": "Repair the horizontal painting discontinuity near the top and align route connectors continuously. Verify the full map scroll at 390 px with no straight image seam or disconnected-looking route."
    },
    {
      "id": "G-portrait-labels",
      "category": "typography",
      "expectedGain": 1,
      "severity": 4,
      "effort": "M",
      "evidence": ["mobile/r02-map.png", "mobile/r07-world5.png", "mobile/r08-world6.png"],
      "fix": "Reallocate portrait headers into rows that show complete world and level names at 390 px while retaining readable moves, score and all five goals."
    },
    {
      "id": "G-material-cohesion",
      "category": "art",
      "expectedGain": 1,
      "severity": 4,
      "effort": "L",
      "evidence": ["desktop/r04-world2.png", "mobile/r08-world6.png", "mobile/r16-help.png"],
      "fix": "Unify piece highlight richness, give mineral blockers a recognisable crust material, and remove rectangular shadow fields behind Help specials. Verify isolated assets and dense phone boards."
    },
    {
      "id": "G-layered-state-clarity",
      "category": "readability",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "M",
      "evidence": ["mobile/r08-world6.png", "mobile/r17-tip.png", "mobile/r09-cascade-fire.png"],
      "fix": "Differentiate crust, steam and base rings by material and edges. Move or shorten the Cascade label so affected cells and the sweep remain visible."
    },
    {
      "id": "G-crystal-impact",
      "category": "animation",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "M",
      "evidence": ["strips/mobile-s2.png", "strips/desktop-s2.png"],
      "fix": "Add a visible charge pose, affected-piece reactions, a named Crystal callout and distinct landing deformation; capture each stage clearly in motion strips."
    },
    {
      "id": "G-thermal-landscape",
      "category": "authenticity",
      "expectedGain": 0.5,
      "severity": 3,
      "effort": "L",
      "evidence": ["desktop/r04-world2.png", "mobile/r02-map.png"],
      "fix": "Reduce extensive terraced pools and stepped cascades in favour of restrained grey-tan deposits, spring outlets and locally specific bathhouse landscaping."
    }
  ],
  "verdict": "continue"
}
```
