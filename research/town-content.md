# Spa City Sparkle: town content

Everything Hot Springs-specific that the game uses (pieces, specials, blockers, worlds, level names,
postcards, guide, lore), with the corpus file each item comes from. Facts are copied from `research/`
(which carries the original web sources). Facts marked **(web 2026-11-01)** came from this session's
web research and were merged into the shared corpus the same day, marked "(added 2026-11-01, match-3
research)" in the topic files and listed in `research/SOURCES.md`. Hex colors are corpus estimates from
`shared/design/tokens.css` and `research/visual-style-guide.md`; none is official or measured. Hexes
marked **derived** are new game colors that are not in the corpus.

Short keys used below:
- **VSG** = `research/visual-style-guide.md` (Icon catalog = VSG Icon *n*; Motif library = VSG Motif *n*)
- **BRS** = `research/bathhouse-row-and-springs.md`; **BRL** = `research/bathhouse-row-layout.md`
- **GLM** = `research/geography-lakes-mountains.md`; **FW** = `research/fish-and-wildlife.md`
- **DL** = `research/downtown-and-landmarks.md`; **GG** = `research/gangster-era-and-gambling.md`
- **OAK** = `research/oaklawn-and-racing.md`; **BB** = `research/baseball-spring-training.md`
- **OA** = `research/other-attractions.md`; **CEF** = `research/culture-events-food.md`
- **HSNP** = `research/hot-springs-national-park.md`; **PJ** = `research/places.json`
- **ROUTE** = `research/match3-route.json` (the 60 level stops, built for this game)
- **QB** = `games/trivia/data/questions.json` (the audited trivia bank; lore cards only)

---

## 1. The six pieces

Each piece has a distinct silhouette as well as a distinct colour, so the board reads without colour
(colourblind rule in the PRD). Order below is the internal piece index 0–5.

| # | Piece | Silhouette (VSG recipe) | Colours (hex est.) | Research basis | Source |
|---|---|---|---|---|---|
| 0 | **Quartz crystal** (violet) | Hexagonal prism with a pointed 3-facet tip, light/dark facets (VSG Icon 27) | body `#8B6FD1` **derived**; facet lights `#F4F6FA`, `#C9D6E3` (VSG Icon 27) | Quartz crystal is Arkansas's state mineral (1967, Act 128). Ouachita quartz formed after the Ouachita Orogeny, especially around Mount Ida, the self-styled "Quartz Crystal Capital of the World," about 36 mi west via US 270. Lake Ouachita holds "one of the largest crystal veins in the world." | GLM → Quartz crystal and Mount Ida; QB hs-0129; PJ `mount-ida` |
| 1 | **Magnolia** (pink) | 6 broad ovate petals around a cone, 2 glossy dark leaves (VSG Icon 18, Motif 12) | petals `#E26D8E` (motor-hotel rose) with a `#F6F3EC` (dogwood white) centre; leaf `#2F4F2F` (VSG Icon 18) | The **Magnolia Promenade**: Army engineer Robert Stevens laid out double rows of magnolias in front of the Row in the 1890s; a single row stands today, about 25 ft apart on the HABS plan. Garvan Woodland Gardens also lists magnolias among its plantings. | VSG → Landscape; BRL → Magnolia Promenade; FW → Plants and forests; OA → Garvan |
| 2 | **Horseshoe** (brass) | U-shape thick stroke with 6 nail holes (VSG Icon 35) | brass `#C9A23F` (Buckstaff lettering swatch), highlight `#D4AF37` (deco gold), shadow `#7C5A2E` (bronze grille) | Oaklawn thoroughbred racing (since 1904/05; one-mile dirt oval; Arkansas Derby since 1936). Second basis on the Row itself: the Quapaw (1922) was built on the site of the old **Horseshoe** bathhouse (and the Magnesia). | OAK → Track facts, Arkansas Derby; QB hs-0068; PJ `horseshoe-bathhouse` |
| 3 | **Thermal water drop** (cyan) | Teardrop with a curl of steam (VSG Icon 1 steam wisp on a drop) | body `#4FC3FF` (deco-neon blue), inner `#A7DDF2` (linen horizon), rim `#1F5F6B` (pool depth) | 47 springs averaging about 143°F; over 700,000 gal/day (NPS figure; other sources say more); the water fell as rain about 4,400 years ago. | GLM → Thermal springs (Count, Temperature, Flow, Age) |
| 4 | **Scallop shell** (coral) | Fan of 7 ribs from a hinge, scalloped edge (VSG Icon 12, Motif 3) | body `#F26B5B` (motor-hotel coral), ribs `#C46A3E` (terra cotta), edge `#F3EFE6` (stucco) | Scalloped shells cap the Quapaw parapets and frame sculpin fish (originally gold, now white); the 1984 HABS photo of the Fordyce men's bath hall skylight shows scallop-shell roundels in its amber frame, around a sea scene with a mermaid. | VSG → Quapaw, Fordyce (skylight as photographed 1984); BRS → Quapaw; QB hs-0084 |
| 5 | **Ouachita pine sprig** (green) | Short branch with needle fans and a small cone (adapted from VSG Icon 22 pine tree) | needles `#3C9A4A` (linen foliage), dark `#2F4A2C` (pine needle green), cone `#A08A6A` (sandstone tan) | Shortleaf pine is a common Ouachita tree and among the park's old-growth trees (some over 200 years old); pine covers the south-facing slopes. Arkansas's state tree (1939) is "the pine," either loblolly or shortleaf. | FW → Plants and forests; GLM → Mountains and terrain (east–west bands); FW (web 2026-11-01, state tree) |

### Piece notes and design flags
- **Magnolia kept, with the justification above.** Arkansas's state flower is the **apple blossom** (1901), not
  the magnolia (FW, web 2026-11-01). The magnolia is used because it is the tree of the Magnolia Promenade, a
  documented 1890s feature of the Row, not as a state symbol. Never caption it "state flower". The promenade
  species is not sourced and the corpus draws the blossom **white** (VSG Icon 18); the pink is a game colour
  for distinctness. If a pink must be "real", the alternative is a white blossom with a blush centre.
- **Quartz colour.** Mount Ida / Montgomery County crystals are described as notably **clear** (EoA, web
  2026-11-01), and the VSG icon is near-white. Violet is a gameplay colour, not a claim about the stone (no
  amethyst claim anywhere). Draw it as a clear crystal with a violet tint and white facet glints.
- **Horseshoe** must stay a plain horseshoe: no jockey silks, track logo or Oaklawn mark (00-INDEX content
  rules). Gambling is not a theme of this piece; it is "racing luck" plus the Horseshoe bathhouse.
- **Scallop coral** is a game colour; the real Quapaw shells and fish are white today (gold originally).

---

## 2. Specials (made by 4-, L/T- and 5-matches)

| Special | Made by | Effect | Visual | Research tie | Source |
|---|---|---|---|---|---|
| **Geyser** (line clear) | 4 in a row | Clears its row or column | A vertical jet of water and steam (VSG Motif 7 steam curls, stretched) | Thermal water rising along the alpha and beta faults; rain heats to about 160°F about a mile down, then rises | GLM → Recharge, faults; QB hs-0151, hs-0153 |
| **Hot Stone** (area burst) | L or T shape | Clears a 3×3 area | A glowing rounded novaculite stone (VSG Icon 24 whetstone shape, `#EDEAE2` with a `#F28C28` glow) | Water is heated by deep hot rock through the geothermal gradient (about 4°F per 300 ft; the springs are not volcanic); novaculite forms the ridges on both sides of the valley | GLM → Age of the water and dating (NPS FAQ), Recharge, Novaculite |
| **Spring Crystal** (colour clear) | 5 in a row | Clears every piece of the swapped colour | A large faceted quartz point with prismatic glints | Quartz crystal, the state mineral | GLM → Quartz crystal and Mount Ida |

**Naming flag (Geyser).** Hot Springs has **no geysers**: the springs flow; they are not volcanic and do not
erupt (GLM → NPS FAQ "not volcanic"). Calling the special "Geyser" is fine as fantasy, but the help text must
not say Hot Springs has geysers. A better-sourced name is **"Cascade"** (NPS made the Hot Water / Thermal Water
Cascade in 1982 from spring water, BRS → Springs and fountains); "Steam Jet" is a neutral alternative.
Recommendation: rename to **Cascade** (line clear) and keep its jet animation as a falling sheet of water.

**Hot Stone** is flavour, not a claim that hot-stone treatments were part of the historic bath; the corpus
does not document hot-stone treatments (the traditional bath sequence itself is unsourced in the corpus).

---

## 3. Blockers and drop items

| Element | Mechanic | Look (hex est.) | Research tie | Source |
|---|---|---|---|---|
| **Tufa stone** (1–3 layers) | Each adjacent match removes one layer | Rounded terrace lobes: tufa gray `#9A968C`, rim `#C8C3B6`, damp streak `#6E6A60`; 3 layers = darker and more lobed (VSG Motif 8) | Tufa (travertine) forms when thermal water evaporates and leaves carbonate; locally "a more drab gray" (NPS); "white-to-tan" near the openings (Wikipedia); an early-1900s account (Haywood & Weed) describes "creamy alabaster-like" new tufa and "barren gray" old tufa (web 2026-11-01) | GLM → Tufa, algae and steam |
| **Mineral crust** (under-layer) | Sits under a piece; cleared by a match on top of it | Pale crystalline film `#E6DDB0` with white flecks | Dissolved minerals precipitate around the spring openings; bicarbonate (130 ppm), silica (53) and calcium (47) top the chemistry table | GLM → Chemistry; QB hs-0155, hs-0156 |
| **Padlocked safe** (World 3) | Needs two adjacent matches (unlock, then open); releases a bonus | Black-green safe `#1F2A24` with brass dial `#C9A23F` | Period flavour for the "open town" years (1927–1947) on Central Avenue. **No specific safe is documented**: this is an original game prop, never a depiction of a real club, raid or person | GG → McLaughlin machine, Clubs and casinos (setting only) |
| **Spring algae** (spreads) | If no algae is cleared on a turn, one patch spreads to a neighbour | Emerald `#2F8F5B` to blue-green `#2A9D8F` filaments (VSG Icon 3, Algae recipe) | *Phormidium treleasei*, a blue-green alga (cyanobacterium), grows where the spring water meets light and air; NPS calls Trelease's blue-green alga **rare**, otherwise known in North America only from Banff (web 2026-11-01, via search summary). An early-1900s account (Haywood & Weed) says the "brilliant emerald-green" colour of some tufa comes from hot-water algae | GLM → Tufa, algae and steam; FW → Aquatic invertebrates and microbes |
| **Steam fog** | Hides pieces in a cell until a match happens next to it | White `#FFFFFF` at 25–35% alpha, drifting curls (VSG Motif 7) | Steam off the springs gave the "Valley of Vapors" nickname | GLM → Tufa, algae and steam |
| **Bath tokens** (drop items) | Carried down to the drains at the bottom row | Cream ticket `#F3E9D2` with notched edge and red-ink numeral `#C8452B` (VSG Icon 46) | A 1920 course was 21 baths ($9–$15); attendant fees were capped at 20¢ a bath. **Bath-ticket design is undocumented; the token is invented** | BRS → Bathing practice and prices; QB hs-0022 |

**Algae framing.** The alga is a rare organism and part of what visitors come to see. In-game it should read as
"spring algae overgrowing the board" that the player tidies, not as a pest or pollution; the lore card may name
*Phormidium treleasei* and say it is rare. Do not call it moss in fact text (the corpus says the Display Spring is
"surrounded by mosses **and** blue-green algae", two different things).

**Drains.** Suggested art: a bronze floor drain or a tufa spillway at the bottom of the board. Hot Springs Creek
really does run in a stone arch under Bathhouse Row (enclosed 1882–83) and empties into Lake Hamilton (GLM →
Hot Springs Creek and the arch), which can be the "where the tokens go" flavour line.

---

## 4. Worlds

Six worlds × 10 levels. Each world restores a painted postcard (VSG Icon 49, Motif 13 linen texture) that
starts desaturated and regains colour level by level. Level names are real places, streets, springs and
features in that world; the full stop list with coordinates, eras, one-line facts and sources is in
**ROUTE** (`research/match3-route.json`). Lore cards per world: §6.

### World 1: Bathhouse Row
- **Era:** `gilded-spa` (1875–1920; the Row was finished in 1923). **Palette:** `gilded-spa`: cream brick
  `#E6D7B5`, red clay tile `#A9432C` / shadow `#7E2F1F`, terra cotta `#C46A3E`, Maurice green `#4E7D5B`, cobalt
  `#2B4C9B`, brass/amber `#D9A23A`, marble `#F2EFE8`, iron `#1F2A24`.
- **Places:** the eight bathhouses north to south (Superior, Hale, Maurice, Fordyce, Quapaw, Ozark, Buckstaff,
  Lamar), the Administration Building at the Reserve St end, the Magnolia Promenade, the 1890s Main Entrance
  with two bronze eagles (between the Maurice and Fordyce), Arlington Lawn at the north end (BRL → Order;
  VSG → Skyline recipe and row order).
- **Backdrop notes:**
  1. Panorama from the west side of Central Ave looking east: north (Superior) on the left, Lamar on the right;
     Hot Springs Mountain behind (VSG → Skyline recipe; BRL).
  2. Magnolias in one row about 25 ft apart framing each facade, dark green five-globe lamp posts (1984 photos)
     (VSG → Landscape; BRL → Street furniture).
  3. Signature shapes: Hale's big red hip roof with the low bell gable on the porch; the Fordyce's dark-brown
     lozenge brick on light-yellow upper floors; the Quapaw's buff/tan chevron dome (the Row's highest point,
     ~58–60 ft); the Ozark's twin stepped towers (PJ `visual` fields; VSG per building).
  4. Warm daylight haze with steam (VSG → gilded-spa era look).
- **Levels:** 1 Magnolia Promenade · 2 Superior Bathhouse · 3 Hale Bathhouse · 4 Maurice Bathhouse · 5 Main
  Entrance · 6 Fordyce Bathhouse · 7 Quapaw Bathhouse · 8 Ozark Bathhouse · 9 Buckstaff Bathhouse · 10 Lamar
  Bathhouse ("The Lamar's 1923 opening completed the Row", QB hs-0077).
- **Postcard:** Bathhouse Row from across Central Avenue, the eight facades behind a line of magnolias, the
  mountain behind.

### World 2: Hot Springs Mountain & the tufa terraces
- **Era:** cross-era (`thermal-water`), with stops from `gilded-spa` (Ral Spring) to `revival` (Mountain
  Tower 1983). **Palette:** `thermal-water`: pool `#1F5F6B`, surface `#174A54`, blue-green algae `#2A9D8F`,
  emerald `#2F8F5B`, moss `#6B8E3A`, tufa `#9A968C` / rim `#C8C3B6`, text `#F4F2EC`, steam white at 25–35%.
- **Places:** Display Spring (behind the Maurice; uncovered in the 1930s), Hot Water Cascade (NPS, 1982),
  Tufa Terrace Trail (0.3 mi), Grand Promenade (0.5 mi National Recreation Trail), Noble Fountain (moved 1957),
  Ral Spring and "Ral City" (19th c.), Peak Trail (0.6 mi, 12.6%), Goat Rock (North Mountain), Gulpha Gorge
  (pink-blazed trail), Hot Springs Mountain Tower (216 ft, 1983; Woolman 1877 and Rix 1906 before it)
  (GLM → Named springs, Trails; OA → Mountain Tower; PJ).
- **Backdrop notes:**
  1. Gray tufa terrace lobes stepping down with thin blue water lines and emerald algae fringe (VSG Motif 8;
     PJ `thermal-water-cascade`: "steaming water over gray tufa terraces with emerald algae").
  2. Display Spring: a shallow steaming pool "shaded by trees, surrounded by mosses and blue-green algae"
     (GLM; PJ `display-spring`).
  3. The curving brick Grand Promenade above the bathhouse roofs; the lattice tower on the ridge (PJ
     `grand-promenade`, `hot-springs-mountain-tower`; VSG Icon 20).
  4. Pine on the south slopes, oak/hickory on the north; novaculite-white ridgelines (FW → Plants; VSG Icon 25).
- **Levels:** 1 Display Spring · 2 Hot Water Cascade · 3 Tufa Terrace Trail · 4 Grand Promenade · 5 Noble
  Fountain · 6 Ral Spring · 7 Peak Trail · 8 Goat Rock · 9 Gulpha Gorge · 10 Mountain Tower.
- **Postcard:** steam over gray tufa terraces and the cascade, the Mountain Tower on the ridge above.
- **Caution:** "Ral" is probably short for "neuralgia", a period euphemism for syphilis symptoms (NPS); keep
  that out of the game. Use only "a free spring that drew a camp of health seekers".

### World 3: Central Avenue at night
- **Era:** `roaring` (1921–1946), finale bridging to `midcentury`. **Palette:** `deco-neon`: midnight
  `#14121F`, surface `#1F1C2E`, limestone `#D8CFBD`, bronze `#7C5A2E`, neon red `#FF3B3B`, neon blue `#4FC3FF`,
  Deco gold `#D4AF37`, felt green `#1E5B3A`; `linen-postcard` for the daytime postcard reveal.
- **Places:** Central Avenue (Valley Street until the late 1870s), the third Arlington at the Central/Fountain
  "Y" (1924), the Southern Club (1893; dark Pittsburgh glass front, 1940s), the Ohio Club (1905), the Medical
  Arts Building (16-story Deco, 1929–30), KTHS radio in the Arlington (1924), Bridge Street (~98 ft), the
  Park Hotel (1930, Fountain St), Fountain Street (the alpha fault), the Vapors (315 Park Ave, 1960)
  (DL; GG → Clubs and casinos; CEF → Radio).
- **Backdrop notes:**
  1. Navy-black sky; the Arlington's twin towers closing the vista at the "Y" (VSG Icon 15; DL → Arlington).
  2. Medical Arts setback slab with bronze grilles and a fan relief (VSG Icon 16, Motif 6).
  3. Southern Club storefront as a grid of near-black glossy glass panels with a specular streak
     (VSG → Southern Club).
  4. Neon drawn as stroked paths with glow (VSG Motif 15). **Club neon colours and signs are unsourced**: all
     signs use invented text, never real club names or lettering.
- **Levels:** 1 Valley Street · 2 The Arlington · 3 Southern Club · 4 Ohio Club · 5 Medical Arts Tower ·
  6 KTHS Ballroom · 7 Bridge Street · 8 Park Hotel · 9 Fountain Street · 10 The Vapors.
- **Postcard:** Central Avenue after dark looking north to the Arlington's towers, with the Medical Arts
  setbacks and invented neon.
- **Cautions:** the gangster era is setting only. No real gangster (Capone, Madden, Luciano) appears as a
  character or likeness; Capone's room number and tunnels are **[LEGEND]/[UNVERIFIED]** and are not used. The
  Vapors was bombed in 1963 and the Belvedere in 1959; never reference either. The Vapors is named only as a
  1960 venue (Tony Bennett rehearsal fact, EoA). The padlocked-safe blocker is generic.

### World 4: Oaklawn & the spring-training fields
- **Era:** `midcentury` (1947–1967) for the look; stops run from 1886 to the 1950s. **Palette:** `motor-hotel`:
  pool-sky `#8FD0E8`, turquoise `#3FBFB5`, coral `#F26B5B`, atomic yellow `#F4C542`, concrete `#D9D4CA`, neon
  white `#FFF6E0`, rose `#E26D8E`; `linen-postcard` for the card.
- **Places:** Hot Springs Baseball Grounds (White Stockings, 1886), Whittington Park (1894; Ban Johnson Park
  from 1935), the Alligator Farm across Whittington Ave (Ruth's 1918 homer), Majestic Park (Tigers 1908, Red
  Sox 1909; rebuilt 2021), Fogel Field (1912), Sam Guinn Field (1933, Negro leagues spring training), Jaycee
  Field (White Sox 1948–51), Oaklawn (1904/1905; one-mile oval; Arkansas Derby 1936; the "Fifth Season")
  (BB → Ballparks; OAK).
- **Backdrop notes:**
  1. Wooden ballpark grandstand with a short 260-ft right-field fence (PJ `whittington-park-ballpark`).
  2. Racetrack grandstand with a glass enclosure facing a one-mile dirt oval (PJ `oaklawn`; OAK → Track facts:
     1905 glass-enclosed grandstand with steam heat).
  3. Linen-postcard saturation, airbrushed sky (VSG P6, Motif 13).
  4. Generic racehorse and baseball icons only (VSG Icons 34, 42): no silks, uniforms, team or track logos.
- **Levels:** 1 Baseball Grounds · 2 Whittington Park · 3 Alligator Farm Fence · 4 Majestic Park · 5 Fogel
  Field · 6 Sam Guinn Field · 7 Jaycee Field · 8 Glass Grandstand · 9 Backstretch Chute · 10 Derby Day.
- **Postcard:** a linen-style racetrack grandstand on a one-mile oval with a wooden ballpark inset.
- **Cautions:** "Oaklawn" names the world as a setting only; no level, special or mode is called "Oaklawn"
  (Pinball precedent; game-hooks §12) and nothing implies endorsement. Ruth's homer is "about 573 feet" (a 2011
  engineering estimate; the exact distance is hedged as legend-adjacent in 00-INDEX). No real ballplayers or
  jockeys appear as characters. The 1953 Tugerson expulsion fight is never used (sensitive history).
  Oaklawn's opening is **1904 or 1905** (sources differ, QB hs-0398). The meet months are **[DISPUTED]**.

### World 5: Lake Hamilton & Lake Ouachita
- **Era:** `modern` look (`lake-life`); stops from 1924 (Remmel Dam) to today. **Palette:** `lake-life`: lake
  deep `#1E4E79`, surface `#183F63`, shallows `#4C8FA8`, restored brick `#B5654A`, dock wood `#9C7A55`, sunset
  gold `#F2A541`, redbud `#B5568F`, dogwood white `#F6F3EC`, fall orange `#C8501F`.
- **Places:** Carpenter Dam (1929–31), Lake Hamilton (7,200 acres, 1932), Andrew Hulsey State Fish Hatchery,
  Remmel Dam (1924) and Lake Catherine, Lake Catherine State Park (CCC, 1935), Blakely Mountain Dam (1948–53),
  Lake Ouachita (~200 islands), Lake Ouachita State Park and Three Sisters Springs (1955), the Geo-Float Trail
  (web 2026-11-01), Mount Ida (quartz) (GLM → Lakes; PJ).
- **Backdrop notes:**
  1. Long winding lake lined with docks and homes (PJ `lake-hamilton`).
  2. Deep clear lake with forested islands (PJ `lake-ouachita`); pine-covered ridges running east–west (GLM).
  3. Concrete dam faces: Carpenter's gravity dam (~1,000 ft long, ~100 ft high) and Remmel's flat-slab buttress
     row (PJ `carpenter-dam`, `remmel-dam`; GLM → Dams).
  4. Stone-and-wood CCC cabins (PJ `lake-catherine-state-park`); quartz glints on a rocky shore (Mount Ida).
     Lake colours and sunsets are **not sourced** (VSG → modern), so they are original art.
- **Levels:** 1 Carpenter Dam · 2 Lake Hamilton · 3 Hulsey Hatchery · 4 Remmel Dam · 5 Catherine's Cabins ·
  6 Blakely Mountain Dam · 7 Three Sisters Springs · 8 Geo-Float Trail · 9 Two Hundred Islands · 10 Mount Ida
  Crystals.
- **Postcard:** Lake Ouachita at sunset: pine-covered islands, a pontoon boat (VSG Icon 39), a quartz-flecked
  shore.
- **Cautions:** Lake Ouachita's area is 40,000 vs. 66,324 acres (conflict; print no acreage or say "about
  40,000" with "sources differ"). Never reference the 1999 *Miss Majestic* duck-boat sinking on Lake Hamilton.
  The quartz state-mineral year is **1967** (EoA, Wikipedia, bank) vs. **1976** (Arkansas.com); use 1967.

### World 6: Garvan Gardens & the revival
- **Era:** `revival` → `modern` (1989–2026). **Palette:** `lake-life` (above) with `nps-rustic` accents:
  forest floor `#3E3528`, native stone `#8C877C`, log `#5B4632`, oak green `#4F6B35`, cream `#EDE3C8`.
  Chapel recipe: pine `#C49A6C`, glass `#A7DDF2` at 40% (VSG → Anthony Chapel).
- **Places:** the Row reborn (Fordyce visitor center 1989, Quapaw Baths 2008, Ozark Cultural Center 2014,
  Hotel Hale 2019, Maurice restoration from Aug. 2025), the Running of the Tubs (since 2006), Garvan Woodland
  Gardens (210 acres, 4.5 mi of Lake Hamilton shore; trust to the University of Arkansas 1985; dedicated April
  7, 2002), Garden of the Pine Wind (begun 2000), Bridge of the Full Moon, Anthony Chapel (2006), Tulip
  Extravaganza (~150,000 tulips), Holiday Lights (~5 million lights over 18 acres) (BRS → Closure and reuse;
  OA → Garvan; web 2026-11-01).
- **Backdrop notes:**
  1. Anthony Chapel: tall narrow gable, repeated pine columns, criss-cross timber lattice, glass with forest
     behind; 57-ft ceiling (VSG → Anthony Chapel; PJ `anthony-chapel`).
  2. Wooded peninsula garden with a Japanese garden, azaleas and tulips (PJ `garvan-woodland-gardens`); a
     round-arched stone bridge over a stream (Bridge of the Full Moon, via search summary).
  3. The Row in restored colour, the reverse of the "empty Row" desaturated look (VSG → revival, modern).
  4. Holiday Lights as warm light points over dark woods (count hedged "about 5 million").
- **Levels:** 1 Fordyce Visitor Center · 2 Quapaw Baths · 3 Running of the Tubs · 4 Ozark Cultural Center ·
  5 Hotel Hale · 6 Maurice Restoration · 7 Garden of the Pine Wind · 8 Bridge of the Full Moon · 9 Anthony
  Chapel · 10 Holiday Lights.
- **Postcard:** Anthony Chapel among tall pines above Lake Hamilton, framed by tulips, with a restored
  Bathhouse Row strip along the bottom.
- **Cautions:** businesses (Quapaw Baths & Spa, Hotel Hale, Superior brewery) are named as building uses only,
  no logos. Garvan's founding date is a conflict: Verna Garvan began the garden in 1956 (Wikipedia) and spent
  "over thirty years" on it (EoA); trust signed 1985; public dedication 2002 (EoA). Say "opened to the public
  in 2002". Holiday Lights counts differ (4 million in 2014 vs. nearly/about 5 million later).

---

## 5. The guide: an original bath attendant

- **Concept:** a fictional, ageless bath attendant who "has worked every bathhouse on the Row" and guides the
  player through the eras, handing out bath tokens, explaining specials ("a Cascade clears a whole line") and
  reading the lore cards aloud as postcards are restored. Working name **"Della"**, a fictional first name
  only; no surname, so she is not mistaken for a real person. Rename freely, but check the name against
  `research/famous-people.md` and avoid any real Hot Springs figure.
- **Basis:** bath attendants appear in the records from 1875; from 1910 the medical director ran classes and
  written tests for them; in 1920 attendant fees were capped at 20¢ a bath or $4 a 21-bath course (BRS →
  Bathing practice and prices; history-timeline.md → gilded-spa).
- **Respect note:** NPS says bath attendants were mostly African American until the 1980s (BRS → African
  American bathing history). If the guide's design draws on that history, she must be a dignified, skilled
  professional (the expert in the room), never a servant stereotype, caricature or dialect joke. Her outfit is a
  simple white attendant's uniform with a towel over one arm (VSG Icon 45 bath towel and robe); the uniform
  details are invented (period dress is a corpus gap).
- **Voice:** warm, brisk, proud of the water; she quotes facts only from the lore cards and never claims to
  have met real historic figures.

---

## 6. Lore cards (`data/lore.json`)

60 cards, **10 per world** (no shortfall), built by `tools/build-lore.mjs` from the audited bank QB, which
checks each card: bank id exists, `confidence: "confirmed"`, passes the Bathhouse Mahjong sensitive-topic
regex (`games/mahjong/tools/extract-facts.mjs`), title ≤ 40 chars, text ≤ 160 chars. Text restates the bank
answer and explanation without new claims. Fields: `world`, `worldId`, `id`, `title`, `text`, `source`,
`sourceUrl`. One card is shown when a postcard tile is restored; all ten form the world's postcard back.

| World | Bank ids |
|---|---|
| 1 Bathhouse Row | hs-0109, hs-0061, hs-0062, hs-0064, hs-0065, hs-0068, hs-0084, hs-0070, hs-0022, hs-0077 |
| 2 Mountain & tufa | hs-0148, hs-0154, hs-0145, hs-0153, hs-0151, hs-0146, hs-0156, hs-0120, hs-0163, hs-0094 |
| 3 Central Ave at night | hs-0060, hs-0076, hs-0402, hs-0404, hs-0401, hs-0074, hs-0088, hs-0073, hs-0490, hs-0488 |
| 4 Oaklawn & ballfields | hs-0188, hs-0196, hs-0183, hs-0184, hs-0217, hs-0223, hs-0398, hs-0212, hs-0216, hs-0470 |
| 5 Lakes | hs-0121, hs-0122, hs-0159, hs-0123, hs-0126, hs-0127, hs-0128, hs-0175, hs-0173, hs-0129 |
| 6 Garvan & revival | hs-0096, hs-0103, hs-0104, hs-0101, hs-0052, hs-0379, hs-0141, hs-0108, hs-0385, hs-0384 |

Spares that also pass the filter, if a card must be swapped: W1 hs-0066, hs-0512, hs-0018; W2 hs-0292,
hs-0478, hs-0071, hs-0167; W3 hs-0406, hs-0403, hs-0107; W4 hs-0265, hs-0219, hs-0233, hs-0186; W5 hs-0511,
hs-0313, hs-0174; W6 hs-0053, hs-0098, hs-0102, hs-0093. The filter removes every bank item mentioning
"gangster"/"mob", so World 3 cards are about the avenue, radio and clubs as buildings.
No living person is named on any card.

---

## 7. Content rules applied (00-INDEX → Content rules)

- **No logos or marks:** no NPS arrowhead, no Arlington, Oaklawn, Quapaw Baths, Hotel Hale, Superior, Garvan,
  Vapors or school marks. Signs use invented lettering. Real places are settings only; nothing implies
  endorsement.
- **Quapaw:** the Quapaw Bathhouse appears as architecture (chevron dome, scallops, sculpin). Its entrance
  "Indian head" cartouche is drawn only as an abstract oval with scroll ends and **no face** (VSG Icon 54), or
  omitted. The "Indian cave" naming story is period marketing (**[LEGEND]**, CEF → Folklore) and is not told.
- **Legends labelled:** de Soto (the Fordyce statue and fountain are real objects; the visit is not), the
  neutral-ground story, Capone's room and tunnels, ghosts and Ruth's exact distance are either left out or
  shown as "legend says / about".
- **People:** no real people as characters or likenesses. Historic names appear only inside lore text
  (Robert Stevens, Leo McLaughlin, Babe Ruth, Ban Johnson, Winthrop Rockefeller, Maurice Jennings, David
  McKee, Lum and Abner). The guide is fictional.
- **Sensitive history:** slavery, segregation (beyond factual Negro-leagues field names), the 1953 Tugerson
  fight, bombings (Belvedere 1959, Vapors 1963), the 1999 duck-boat sinking and the "Ral" etymology are never
  used for gameplay.
- **Original game:** pieces, specials, blockers, level layouts and names are original; nothing is taken from
  commercial match-3 titles.

## 8. Hedged conflicts the game must show (or avoid)

| Topic | Values | On-screen rule |
|---|---|---|
| Spring count | 47 (NPS FAQ, USGS) vs. 43 flowing (Wikipedia HSNP) | Say "47 springs" (bank wording) |
| Daily flow | 700,000+ (NPS) to ~1,000,000 | "over 700,000 gallons a day (NPS)" |
| Oaklawn opening | 1904 vs. 1905 | Card hs-0398 shows both |
| Ruth's homer | about 573 ft (2011 estimate) | Always "about" |
| Oaklawn meet months | Dec–May vs. late Jan–early May vs. late fall–spring | Don't print months beyond the card's "per Wikipedia" |
| State mineral year | 1967 (EoA, bank) vs. 1976 (Arkansas.com) | Use 1967 |
| Lake Ouachita area | 40,000 vs. 66,324 acres | Don't print, or "about 40,000; sources differ" |
| Garvan dates | 1956 start / 1985 trust / 2002 public dedication | "Opened to the public in 2002" |
| Holiday Lights | 4 million (2014) vs. nearly 5 million | "nearly 5 million" (bank) |
| Southern Club glass | bought 1927; glass front dated 1940s (CAHD) | Card says "after 1927" only |
| Hale date | 1892–93 (NPS) vs. one 1883 mention | "1892–93" |
| Grand Promenade finish | 1958 (NPS sheet) vs. early 1960s (NHL) | Card gives only length |

## 9. Gaps designed around

- No documented bath-ticket design, attendant uniform, club neon colours, or interior of any 1920s–40s club:
  all invented and labelled as art.
- Coordinates missing for Gulpha Gorge, the Vapors, the Baseball Grounds and Sam Guinn Field (null in ROUTE);
  several stops borrow a parent place's point (marked `parent:` in ROUTE). The world map is stylized, not GIS.
- No sourced lake colours, sunset hues or bloom calendar beyond tulips (late Feb–mid Mar vs. mid-Mar–mid-Apr).
- The traditional bath sequence (tub, hot packs, vapor cabinet, needle shower) is not in the corpus; the game
  does not depict it as fact.
