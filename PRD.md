# Spa City Sparkle: product requirements

## 1. Vision and pillars
An original swap-and-match puzzle journey through Hot Springs, Arkansas. Each world is a district of the
Spa City, painted in the style of its era. Clearing levels restores that district's faded postcard and
unlocks a sourced lore card.

1. **Our own game.** Original pieces (quartz, magnolia, horseshoe, thermal drop, scallop, pine), specials
   (Cascade, Hot Stone, Spring Crystal), blockers (tufa, crust, padlocked safes, algae moss, steam fog) and
   the Encore. No commercial title's names, rules text, art or code.
2. **Tactile, juicy, readable.** Glossy pre-rendered pieces, punchy cascades, crisp feedback. Every piece is
   readable by shape alone at 40 px on a phone.
3. **Real town, cited.** Every place and fact shown traces to `research/` or the audited trivia bank, and
   every lore card shows its source. Game logic is labelled as game logic.
4. **Fair difficulty.** Every level is proven winnable and tuned by bots to a target win-rate band; no
   level is random luck.
5. **Kind to players.** No timers, no purchases, no ads, no lives. Boosters are earned. Works offline from
   one file.

## 2. Target players
Casual puzzle players of all ages, on a phone (portrait) or a laptop. Visitors and locals who enjoy Hot
Springs history. Sessions of 2–5 minutes per level.

## 3. Modes and options
- **Journey:** 60 levels in 6 worlds of 10, unlocked in order. Replay any cleared level for stars.
- **Free Soak** (unlocked after world 1): an endless relax mode with no goals and no move limit, a
  seeded daily board, and the score only.
- **Settings:** sound effects, music, volume, motion (auto/reduced/full), ambient steam on/off, hints
  on/off, colourblind badges (an extra glyph on each piece), and reset progress (with confirmation).

## 4. Rules (complete; formal rules in MECHANICS.md)
- **Board:** up to 9×9 cells; levels may have holes.
- **Swaps:** swap two orthogonally adjacent pieces. A swap must create a match of 3 or more in a row or
  column (or involve a special pair or a Spring Crystal), or it bounces back for free.
- **Clearing and gravity:** matched pieces clear, pieces above fall, new pieces drop in from the spawners,
  and new matches cascade at a rising multiplier (×1…×8).
- **Specials:**
  - **Cascade** (a match of 4): clears a row or column.
  - **Hot Stone** (an L, T or + match): bursts a diamond of radius 2, then gives one aftershock.
  - **Spring Crystal** (a match of 5): swap it with a piece to clear that colour.
- **Combos:** swapping two specials combines them (the 6 pairs, MECHANICS §4.3).
- **Blockers:**
  - **Tufa stone** (1–3 layers): broken by adjacent matches or blasts.
  - **Mineral crust** under pieces (1–2 layers): cleared by clearing the piece above.
  - **Padlocked safe** (1–2 locks): the piece can match but can't move.
  - **Algae moss:** spreads after a turn in which no moss was hit.
  - **Steam fog:** hides a piece until hit.
- **Bath tokens** fall like pieces and are collected at the drains.
- **Goals** (1–3 per level): reach a score; clear all crust; collect N of a piece; deliver N tokens;
  break all stone or moss.
- **Moves:** a fixed move budget.
- **Win:** all goals met. Leftover moves become the **Encore** (each move fires a Cascade), scored apart from
  stars.
- **Lose:** out of moves. Offer +5 moves if a booster is owned, otherwise retry.
- **Stars:** 1–3 stars from score thresholds, counted at the moment the goals are met.
- **Boosters:** Hammer, Shuffle, Line, +5 Moves. Earned only.
- **No moves left:** an automatic reshuffle, shown with a message.
- **Hint:** after 5 s idle (can be turned off).

## 5. Hot Springs content map
Details and sources are in `research/town-content.md`; the route is in `research/match3-route.json`.

| World | Setting | Era / palette | Blocker introduced | Postcard restored |
|---|---|---|---|---|
| 1 | Bathhouse Row and the Grand Promenade | gilded-spa | (basics, specials) | Bathhouse Row |
| 2 | Hot Springs Mountain, tufa terraces, Mountain Tower | thermal-water | tufa stone, mineral crust | Tufa terraces and steam |
| 3 | Central Avenue at night: clubs and neon | deco-neon | padlocked safes, steam fog | Central Avenue neon |
| 4 | Oaklawn and the spring-training fields | motor-hotel / midcentury | bath tokens to the drains | The racetrack and ballpark |
| 5 | Lake Hamilton and Lake Ouachita | lake-life | algae moss | The lakes at sunset |
| 6 | Garvan Gardens and the revival | modern | all mechanics | The town, restored |

- **Pieces:** quartz crystal (Mount Ida / Ouachita quartz), magnolia (Southern flowering tree of the
  town's gardens, per the research), horseshoe (Oaklawn racing), thermal drop (143°F springs), scallop
  shell (Fordyce motif), pine sprig (Ouachita shortleaf pine).
- **Specials:** themed on spring science (steam, heated stone, quartz).
- **Level names:** real streets, springs and landmarks in that world.
- **Lore cards:** 60, one per level, taken from the audited bank `games/trivia/data/questions.json`
  (`confirmed`, sensitive topics filtered), each with its source.
- **Guide:** "Della", an original fictional bath attendant of the 1920s Row, used only for tutorial tips.
  She is labelled fictional.
- **Content rules:** no logos (NPS arrowhead, Oaklawn, Magic Springs, Mountain Valley); the Quapaw motif
  is drawn abstractly; legends are labelled as legends; conflicts are hedged (47/43 springs, flow
  700,000+ gal/day per NPS).

## 6. Screens and flow
**Title.** Painted title art, then Play (Continue if a level is in progress), Free Soak, How to Play,
Settings, About.

**World map.** A painted map of Hot Springs, with a path of 60 level nodes over 6 districts.
- Each node shows its stars. Locked nodes are dimmed. The current node bobs.
- World banners show the postcard's progress.

**Level intro card.** Level name, goals with icons, move count, star thresholds, and booster picks, then
Play.

**Game screen.**
- Top HUD: moves left, goals with progress, score with a star meter.
- Board in the centre; booster tray at the bottom; pause button.
- Portrait: HUD on top, board full-width, tray at the bottom. Landscape: HUD on the left, board centred,
  painted backdrop on both sides.

**Results.**
- Win: stars, score, Encore bonus, the lore card, then Next / Map.
- Lose: goals missed, then Retry / Map (+5 offer first).

**World complete.** The postcard fully coloured, a celebration, booster rewards, and the next world
unlocked.

**Other screens.**
- Pause: resume, restart, settings, map, how to play.
- How to Play: tabs for Basics, Specials, Combos, Blockers, Goals, Controls; each has an animated demo
  board (the real engine on a scripted level).
- About: credits, sources, MIT licence, "game rules are original; places are real; the guide is
  fictional", art provenance (Blender, AI-assisted paintings).
- Tutorial overlays: Della's tips on the first level of each mechanic (a spotlight on the relevant cells),
  shown once.

## 7. Art and audio direction
Full spec in `VISUAL-PLAN.md`.

**Look.** A warm painted spa-town postcard world, with glossy jewel-like pieces lit like glazed ceramic and
polished stone. Palettes come from `shared/design/tokens.css`: gilded-spa, thermal-water, deco-neon,
motor-hotel, lake-life, nps-rustic. Motifs from `research/visual-style-guide.md`: lozenge brick, chevron
dome, leaded sea glass, steam curls, tufa terraces, neon outline.

**Pieces and effects.**
- Pieces are Blender Cycles renders: 6 kinds × (plain, Cascade h, Cascade v, Hot Stone), plus the Spring
  Crystal, the token and every blocker state.
- Board cells are glazed tile with grout. The frame changes per world (brass, tufa, neon, white rail,
  dock wood, garden lattice).
- Effects:
  - steam plumes for Cascades, a heat shimmer and ember ring for Hot Stones, prismatic rays for the Crystal
  - sparkles and drips on clears
  - cascade text callouts ("Steamy!", "Simmering!", "Boiling Over!")
  - board shake on big combos (off under reduced motion)

**Paintings.** Codex (OpenAI image generation) from a pilot style reference:
- 6 world backdrops, title art, the world map, 6 postcards (colour + desaturated by shader), Della
  (4 poses), lore-card frames.
- Prompts are recorded in `art-src/PROMPTS.md`: no text, no logos, no real people, no imitation of living
  artists.

**Audio.** WebAudio synthesis.
- Glassy chimes rising in pitch per cascade wave, a soft bubbling Cascade, a stone thump, a crystal
  shimmer, a lock clunk, a moss squelch, a fog whoosh, a token clink, win and lose stingers.
- An ambient music loop (a gentle ragtime-tinged arpeggio in world 1, varied per world).
- Quiet by default, everything mutable.

## 8. Accessibility
- Fully playable by keyboard (cursor, select, arrows to swap, all menus).
- Text contrast ≥ 4.5:1 (large text ≥ 3:1).
- Pieces differ by silhouette as well as colour; the optional colourblind badges add a glyph.
- `prefers-reduced-motion` (and the setting) removes shake, particles and long tweens.
- Text scales with the root font size.
- A live region announces moves, matches, specials, goals and results.

## 9. Mobile and touch
- Portrait-first. The 9×9 board is ≥ 40 px per cell at 390 px wide.
- Swipe to swap, with a slop threshold. Tap-tap works too.
- All buttons ≥ 44 px.
- No hover-only UI. Safe-area insets are respected.

## 10. Performance budgets
- 60 fps during cascades on a mid-range laptop (`t.frameCost().taskMs` < 10 ms with `--gpu`); playable
  under 4× CPU throttle.
- `index.html` ≤ 2 MB (code and data). `assets/` ≤ 6 MB (WebP plus `art-data.js`).
- Hooks interactive in ≤ 2 s. Heap ≤ 120 MB.
- Zero network requests and zero console errors.

## 11. Save/load
Progress, stars, best scores, boosters, collected lore, settings, tutorial flags and the in-progress level
are kept in `localStorage` (try/catch). The game runs normally when storage throws, with session-only
progress.

## 12. Acceptance criteria
| AC | Feature | Criterion |
|---|---|---|
| AC1 | Title | Shows the name, Play/Continue, Free Soak (locked until world 1 is complete), How to Play, Settings, About |
| AC2 | Layout | Every screen passes `checkLayout` at 1280×800 and 390×844 |
| AC3 | Board | A level loads its mask, layers and fixed cells exactly; the initial board has no matches and ≥ 1 legal move |
| AC4 | Swap | A valid swap spends one move and clears the matches; an invalid swap bounces back and spends nothing |
| AC5 | Cascades | Gravity, refill and cascades resolve to a settled board with no matches; the multiplier rises per wave |
| AC6 | Cascade | A match of 4 creates a Cascade oriented by the swap axis; firing clears its row/column |
| AC7 | Hot Stone | An L/T/+ match creates a Hot Stone; firing clears the radius-2 diamond, then its aftershock |
| AC8 | Spring Crystal | A match of 5 creates a Crystal; swapped with a piece, it clears that colour |
| AC9 | Combos | Each of the 6 special pairs produces its effect from the MECHANICS §4.3 matrix |
| AC10 | Tufa | Stone layers drop by one per adjacent match or blast; stone blocks gravity |
| AC11 | Crust | Clearing a piece above crust removes one layer; the crust goal counts it |
| AC12 | Locks | Locked pieces can't move, still match, and lose one lock per hit |
| AC13 | Moss | Moss clears on a hit and spreads exactly once after a turn in which none was hit |
| AC14 | Fog | Fogged pieces are hidden and inert until hit once |
| AC15 | Tokens | Tokens spawn by quota, fall, ignore blasts, and are collected at the drains |
| AC16 | Goals & stars | Every goal type tracks progress; the win occurs when all are met; stars follow the thresholds |
| AC17 | Encore | Leftover moves become fired Cascades after a win; the Encore is scored separately from stars |
| AC18 | Lose | Out of moves with goals unmet shows Lose with Retry; +5 is offered if a booster is owned |
| AC19 | Boosters | Hammer, Shuffle, Line and +5 work, spend a booster, and are earned per the rules |
| AC20 | Reshuffle | With no legal moves, the board reshuffles to ≥ 1 move and no matches, with a message |
| AC21 | Hint | After 5 s idle the best move pulses; turning hints off disables it |
| AC22 | Skip | A tap or Esc during playback jumps to the settled state, identical to unskipped play |
| AC23 | Levels | 60 levels in 6 worlds pass `tools/check-levels.mjs` |
| AC24 | Difficulty | `tools/balance.mjs` casual-bot win rates fall in each world's band (§13); random-bot rate ≥ 15 points lower; 3 stars reachable on ≥ 5% of wins |
| AC25 | Map & progress | The map shows 60 nodes with stars; clearing unlocks the next level; world completion unlocks the next world |
| AC26 | Postcards | Each world's postcard regains colour in 10 steps as its levels are cleared |
| AC27 | Lore cards | Every win shows a lore card with its source; every card traces to the audited bank (`tools/check-facts.mjs`) |
| AC28 | Tutorial | The first level using each mechanic shows Della's tip once, with a spotlight |
| AC29 | Help & About | How to Play has 6 tabs with working demo boards; About credits sources, art provenance and the MIT licence |
| AC30 | Free Soak | Endless mode with no goals and no move limit; the daily seed is the same for everyone on a given date |
| AC31 | Mouse | A real mouse drag swaps pieces |
| AC32 | Touch | A real touch swipe (`t.touchDrag`) and tap-tap both swap; targets ≥ 44 px |
| AC33 | Keyboard | A full level can be won with keys only; every menu is keyboard reachable |
| AC34 | Contrast | Text contrast passes `t.contrastReport` on every screen |
| AC35 | Colourblind | Pieces are distinguishable in grayscale (silhouette check); badges toggle |
| AC36 | Reduced motion | Reduced motion removes shake and particles and shortens tweens |
| AC37 | Live region | Moves, specials, goal changes and results are announced |
| AC38 | Settings & storage | Settings persist; the game runs when `localStorage` throws |
| AC39 | Save & resume | Continue restores an in-progress level exactly (board, RNG, moves, goals) |
| AC40 | Offline | Plays from `file://` with art on a real GPU; the vector fallback works with `?art=0` |
| AC41 | Performance | Budgets of §10 met (frame cost, size, load, heap); zero console errors and external requests |
| AC42 | Audio | Every event sound plays, is quiet by default and mutable; music toggles separately |
| AC43 | Determinism | Same seed + same moves ⇒ identical state and timeline (Node and browser) |
| AC44 | Visual quality | The review loop meets every rubric gate (≥ 7 per category, Authenticity ≥ 6) or the stop rule fires with the gaps reported |

## 13. Difficulty targets (casual-player bot, 200 seeds per level)
The casual bot (`tools/bots.mjs`) plays the greedy one-ply move (goal progress, specials, score) 70% of the
time and a random legal move otherwise. Tuning to the pure greedy bot gave stingy 6–14 move limits, since it is
much stronger than a casual player. Move limits are tuned by `tools/gen-levels.mjs` (minimum 15–20 moves per
world, with goals scaled up to fit) and checked by `tools/balance.mjs`.

| World | Win-rate band | Notes |
|---|---|---|
| W1 | 90–100% | teaching levels |
| W2 | 75–95% | |
| W3 | 60–85% | |
| W4 | 50–75% | |
| W5 | 40–65% | |
| W6 | 30–55% | |

Levels 5 and 10 of each world are spikes, up to 20 points below the band floor but never below 15%.
Recolour reshuffles stay under 1% of turns, and no cascade reaches the 60-wave cap.

## 14. Out of scope
- Purchases, ads, lives or energy timers, accounts, leaderboards, and online or social features.
- A level editor UI (levels are authored as text files).
- Localisation beyond English.
- Real-time 3D board rendering (pieces are pre-rendered).
- A human audio pass and a screen-reader pass (known gaps, as in other games).
