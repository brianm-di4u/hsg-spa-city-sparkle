# Spa City Sparkle: visual plan

**Target.** At least property-game's final review (about 6.4/10). The review loop's gates are ≥ 7 per
category and Authenticity ≥ 6, on the rubric in `reviews/RUBRIC.md` (adapted from Cart Racing). The
anchors are benchmark captures of commercial match-3 games, kept in `benchmarks/` (git-ignored) and
used only to calibrate quality.

## 1. Look
A **warm, glossy postcard town**. The pieces are jewel-like glazed ceramic and polished stone, under a
soft key light from the upper left with a cool rim. They sit on a glazed-tile board set into a painted
world. Saturation peaks on the pieces; the backdrops stay one step softer, so the board always reads first.

## 2. Pieces (Blender 5.2, Cycles, `art-src/blender/pieces.py`)
- **Camera and output:** orthographic, tilted 12° from top-down for a little depth. 256 px PNG with alpha.
  Each piece is rendered twice: once as beauty and once as shadow on a shadow catcher; the shadow is
  composited in Pixi.
- **Lighting:** an area key (warm 5200 K) at the upper left, a cool rim at the lower right, and a white
  studio environment for clean specular highlights. `Filmic`/`AgX` view, medium-high contrast.
- **Materials:** Principled BSDF.
  - Quartz: transmission 0.9, IOR 1.54, a faint violet tint, internal facets.
  - Magnolia: subsurface petals with a cream-pink gradient.
  - Horseshoe: brass, metallic 1, roughness 0.28, with nail holes.
  - Thermal drop: cyan glass, transmission and caustic highlights.
  - Scallop: coral glaze with ribbed geometry.
  - Pine sprig: green enamel needles on a copper stem.
- **Silhouettes:** each piece passes a grayscale test with a distinct outline:
  - hexagonal point (quartz)
  - 5-petal round (magnolia)
  - U (horseshoe)
  - teardrop (drop)
  - fan (scallop)
  - tall branch/triangle (pine)
- **Specials:**
  - **Cascade** h/v: the piece with a glazed vented collar and a steam-jet decal, horizontal or vertical.
  - **Hot Stone:** the piece set into a glowing basalt ring with ember cracks.
  - **Spring Crystal:** a colourless quartz cluster with rainbow dispersion.
- **Blockers:**
  - tufa stone in 3 states (porous grey-tan, crumbling)
  - mineral crust in 2 states (white-mint scale on the cell)
  - padlocked safe in 2 states (an iron strap and padlock over the piece, deco-era)
  - algae moss (emerald, wet)
  - steam fog (a soft cloud with a puff texture; procedural in Pixi)
  - bath token (a brass token stamped with an abstract bathhouse, no lettering)
  - drain grate (brass)
- **Board kit:**
  - cell tiles in 2 alternating glazes per world palette, with grout lines
  - frame pieces (corners, edges) per world: polished brass, tufa stone, neon tube, white rail, dock
    wood, garden lattice

## 3. Paintings (Codex image generation, `art-src/PROMPTS.md`)
- **Pilot first:** the world 1 backdrop and the title art. Once approved, they become the style reference
  for every later batch.
- **Style:** "frameless, evenly lit" painted gouache-and-ink with postcard warmth. No text, logos, real
  people or living-artist imitation.
- **Content:**
  - 6 world backdrops (portrait 1080×1920 and landscape 1920×1080 crops of one 2048×2048 master), with
    the board area kept calm.
  - The world map (2048×3072 portrait), painted over a Blender block-out of real coordinates from
    `research/match3-route.json`.
  - 6 postcards (1200×800), desaturated in a shader for the restore effect.
  - Della, the fictional guide: 4 poses (wave, point, cheer, think), transparent.
  - Lore-card frames (2: day, neon).
  - Title art (logo plate without text; the title text is set in CSS).
- **Packing:** `shared/test-harness/art-pack.mjs` writes WebP files and the manifest; `tools/build-art.mjs`
  writes the data URIs to `assets/art-data.js`.

## 4. FX (PixiJS v8)
- **Clears:** a 180 ms scale pop with a white flash, 6–10 glints (ADD blend), and droplets falling.
- **Cascade:** a steam column sweeping the row or column (a particle ribbon), plus the cells blasting in
  sequence.
- **Hot Stone:** a heat-shimmer displacement ring, an ember ring and a small screen shake (2 px).
- **Spring Crystal:** prismatic rays to every target, then cascaded pops.
- **Cascade callouts:** "Steamy!" (wave 3), "Simmering!" (5), "Boiling Over!" (7), "143°F!" (8, the
  maximum multiplier).
- **Ambient:** steam wisps rising over the backdrop (≤ 30 fps, off in settings and under reduced motion),
  a slow light sweep over the board frame every 8 s while idle.
- **Glow:** a cheap additive sprite halo on specials. No full-screen bloom, which keeps the frame budget.
- **Under reduced motion:** no particles, no shake, short fades.

## 5. UI
- **Typography:**
  - Headings: Righteous (OFL), deco-flavoured.
  - Body and UI: Nunito (OFL).
  - Both are base64-inlined via `tools/build-fonts.mjs` (property-game pattern), with system-stack
    fallback.
- **Panels:** a "linen postcard" card (cream paper, deckled edge, stamp corner) and a "brass plaque"
  button style; deco-neon variants for world 3.
- **HUD:** a moves badge in a brass medallion, goal chips with piece icons and counters, and a
  thermometer star meter (fills to 143°F).
- **Motion:** Web Animations for panels, `cubic-bezier(.25,.7,.25,1)` (the property-game easing).

## 6. Capture set for reviews (`tools/review-shots.json`)
| Code | Shot |
|---|---|
| R01 | title |
| R02 | world map |
| R03–R08 | game board in each world (mid-level) |
| R09 | Cascade mid-fire |
| R10 | Hot Stone mid-fire |
| R11 | Crystal rays |
| R12 | cascade callout |
| R13 | win + lore card |
| R14 | lose |
| R15 | postcard half restored |
| R16 | How to Play |
| R17 | settings |

- Each shot is taken at desktop and mobile, with frozen clocks.
- Motion strips: 6 frames each of a swap, a cascade and the Cascade.
