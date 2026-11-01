# Art provenance: Spa City Sparkle

All art is original and made for this game on 2026-11-01. The raw PNGs in `art-src/sprites/` and
`art-src/paint/` are git-ignored. The packed WebP files in `art-src/packed/` are committed and become the
shipped packs `assets/art-*.js` through `tools/build-art.mjs`.

## Board sprites: Blender
`art-src/blender/pieces.py` builds every model procedurally and renders it in Blender 5.2 Cycles. Settings:
orthographic camera tilted 14°, Standard view transform, warm area key light, cool rim light, a studio gradient
world, and a shadow catcher. Output is 256 px RGBA. The models:
- the six pieces: quartz, magnolia, horseshoe, thermal drop, scallop, pine sprig;
- the specials: Cascade fins (horizontal and vertical) and the Hot Stone ember ring (idle and primed);
- the Spring Crystal and the bath token;
- tufa stone in 3 layers, the chain-and-padlock lock in 2 layers, algae moss and the drain.

Steam fog, the mineral crust rim, the cell tiles, the board frame, the cursor, the badges and the particle
textures are drawn in code (`src/js/view/vector-art.js`). The same code supplies the `?art=0` fallback set.

## Paintings: OpenAI image generation through Codex
Made through the `codex:codex-rescue` subagent at medium effort. Every prompt carried the same constraints:
- original art;
- no text, letters, numbers, logos or watermarks;
- no real or recognisable people (any people tiny, generic and in period dress);
- no imitation of any living artist.

**Process.** Two pilots came first (`bg1-p`, `title-p`). Once approved, they were the style reference for every
later batch: "a luminous painted travel-postcard illustration for a premium casual mobile puzzle game, soft
gouache-and-watercolour texture, crisp clean shapes, slightly stylized, warm light, atmospheric depth, rising
thermal steam".

| Files | Subject |
|---|---|
| `bg1-p`, `bg1-l` | Bathhouse Row across the avenue: cream-brick and stucco facades, red tile, an abstract-chevron tiled dome (no faces), a glass marquee, a magnolia promenade, the mountain and lattice tower |
| `bg2-p`, `bg2-l` | Hot Springs Mountain: drab grey-tan tufa terraces with emerald algae, the Hot Water Cascade, the brick promenade, the tower (terraces repainted in place: the first pass was white) |
| `bg3-p`, `bg3-l` | Central Avenue at night: a twin-towered hotel at the street fork, an Art Deco setback tower, black-glass club fronts, abstract neon with no letters |
| `bg4-p`, `bg4-l` | A midcentury racetrack: a glass-enclosed grandstand, a dirt oval, a wooden ballpark, redbud and dogwood (no logos) |
| `bg5-p`, `bg5-l` | The lakes at sunset: pine islands, a concrete dam, docks, a pontoon boat, quartz on the shore |
| `bg6-p`, `bg6-l` | A woodland garden: a timber-and-glass forest chapel, a round-arched stone bridge, azaleas and tulips |
| `title-p`, `title-l` | Title key art: the town from above at golden hour, with an empty glow for the logo (`title-p` terraces repainted grey) |
| `map1`–`map6` | Stacked bird's-eye world-map panels with a winding path, no labels (`map2` terraces repainted grey) |
| `postcard1`–`postcard6` | The restored postcard of each world |
| `della-wave`, `-point`, `-cheer`, `-think` | Della, the fictional guide: a confident, dignified 1920s bath attendant (never a caricature), generated on flat white and keyed with `keyWhite: 6` |
| `card-frame` | A light vintage postcard border (packed; reserved for lore cards) |

Exact prompts for the pilots and the fix-up edits are in the Codex run reports. Their full text: "Use case:
stylized-concept … Constraints: no text, letters, numbers, signage words, logos, watermarks or typography
anywhere. No real or recognizable people … Do not imitate any living artist."
