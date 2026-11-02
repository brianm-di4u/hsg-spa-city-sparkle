// Builds research/match3-route.json (shared corpus file, added 2026-11-01 at the user's request)
// from research/places.json plus the hand-picked stop list below. Coordinates are copied from
// places.json; a stop without its own point borrows its parent place's point and says so.
// Run from the repo root:  node tools/build-route.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const places = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'places.json'), 'utf8')).places;
const P = new Map(places.map((p) => [p.id, p]));

const WP_ROW = ['Wikipedia: Bathhouse Row', 'https://en.wikipedia.org/wiki/Bathhouse_Row'];
const NPS_HC = ['NPS: History & Culture', 'https://www.nps.gov/hosp/learn/historyculture/index.htm'];
const NPS_TRAILS = ['NPS: Hot Springs & North Mountain Trails', 'https://www.nps.gov/hosp/planyourvisit/hot-springs-and-north-mountain-trails.htm'];
const EOA_ROW = ['Encyclopedia of Arkansas: Bathhouse Row', 'https://encyclopediaofarkansas.net/entries/bathhouse-row-437/'];
const EOA_KTHS = ['Encyclopedia of Arkansas: KTHS Radio Station', 'https://encyclopediaofarkansas.net/entries/kths-radio-station-6423/'];
const WP_BJ = ['Wikipedia: Ban Johnson Park', 'https://en.wikipedia.org/wiki/Ban_Johnson_Park'];
const W_OAK = ['Wikipedia: Oaklawn Racing Casino Resort', 'https://en.wikipedia.org/wiki/Oaklawn_Racing_Casino_Resort'];
const EOA_OAK = ['Encyclopedia of Arkansas: Oaklawn Park', 'https://encyclopediaofarkansas.net/entries/oaklawn-park-racetrack-3636/'];
const EOA_GARVAN = ['Encyclopedia of Arkansas: Garvan Woodland Gardens', 'https://encyclopediaofarkansas.net/entries/garvan-woodland-gardens-4197/'];

// [placeId|null, stop name, era, fact, [source, url], parentIdForCoords?]
const worlds = [
  {
    world: 1, id: 'bathhouse-row', name: 'Bathhouse Row', era: 'gilded-spa', palette: 'gilded-spa',
    postcard: 'Bathhouse Row from across Central Avenue: eight facades behind a line of magnolias, Hot Springs Mountain behind',
    stops: [
      ['magnolia-promenade', 'Magnolia Promenade', 'gilded-spa', 'Laid out in the 1890s by Army engineer Robert Stevens with double rows of magnolias; a single row today.', WP_ROW, 'bathhouse-row'],
      ['superior-bathhouse', 'Superior Bathhouse', 'gilded-spa', 'The northernmost bathhouse on the Row (1916), with green tile medallions on its facade.', WP_ROW],
      ['hale-bathhouse', 'Hale Bathhouse', 'gilded-spa', 'Built 1892–93, the oldest surviving bathhouse on the Row.', EOA_ROW],
      ['maurice-bathhouse', 'Maurice Bathhouse', 'gilded-spa', 'Built 1911–12; its visible roof sections are covered in green tile.', WP_ROW],
      ['bathhouse-row-main-entrance', 'Main Entrance', 'gilded-spa', 'Two bronze federal eagles mark the 1890s main entrance designed by Robert Stevens.', WP_ROW, 'bathhouse-row'],
      ['fordyce-bathhouse', 'Fordyce Bathhouse', 'gilded-spa', 'Cost $212,749.55 with fixtures (1914–15), the most elaborate bathhouse on the Row.', WP_ROW],
      ['quapaw-bathhouse', 'Quapaw Bathhouse', 'roaring', 'Built in 1922 on the sites of the Horseshoe and Magnesia bathhouses; crowned by a chevron-tiled dome.', WP_ROW],
      ['ozark-bathhouse', 'Ozark Bathhouse', 'roaring', 'Built in 1922; twin towers with three-tiered setbacks flank the entrance.', WP_ROW],
      ['buckstaff-bathhouse', 'Buckstaff Bathhouse', 'gilded-spa', 'Opened February 1, 1912, and in continuous operation since.', ['NPS: Buckstaff Bathhouse', 'https://www.nps.gov/hosp/learn/historyculture/buckstaff-bathhouse.htm']],
      ['lamar-bathhouse', 'Lamar Bathhouse', 'roaring', 'Its 1923 opening completed Bathhouse Row.', NPS_HC],
    ],
  },
  {
    world: 2, id: 'hot-springs-mountain', name: 'Hot Springs Mountain & the tufa terraces', era: 'any', palette: 'thermal-water',
    postcard: 'Steam over gray tufa terraces and the Hot Water Cascade, with the Mountain Tower on the ridge above',
    stops: [
      ['display-spring', 'Display Spring', 'roaring', 'Covered by a grate for decades and uncovered in the 1930s so visitors could see the water in its natural state.', ['NPS: Maurice Historic Display Spring', 'https://www.nps.gov/places/maurice-historic-display-spring.htm']],
      ['thermal-water-cascade', 'Hot Water Cascade', 'revival', 'NPS created the Thermal Water Cascade in 1982; a blue-green alga, Phormidium treleasei, grows where spring water meets light and air.', ['Encyclopedia of Arkansas: Hot Springs National Park', 'https://encyclopediaofarkansas.net/entries/hot-springs-national-park-2547/']],
      ['tufa-terrace-trail', 'Tufa Terrace Trail', 'modern', 'A 0.3-mile paved trail whose lower section passes the Hot Water Cascade.', NPS_TRAILS, 'thermal-water-cascade'],
      ['grand-promenade', 'Grand Promenade', 'roaring', 'A half-mile brick National Recreation Trail on the hillside behind the bathhouses, begun in the 1930s.', NPS_TRAILS],
      ['noble-fountain', 'Noble Fountain', 'midcentury', 'Moved to the Reserve Avenue end of the Grand Promenade in 1957.', WP_ROW],
      ['ral-spring', 'Ral Spring', 'gilded-spa', 'A free spring midway up Hot Springs Mountain whose camp of poor health seekers became known as "Ral City."', ['NPS: Ral Spring', 'https://www.nps.gov/places/ral-spring.htm'], 'hot-springs-mountain'],
      ['peak-trail', 'Peak Trail', 'modern', 'A 0.6-mile climb at a 12.6% grade, from 644 to 1,044 ft, toward the tower.', NPS_TRAILS, 'hot-springs-mountain'],
      ['goat-rock', 'Goat Rock', 'modern', 'An overlook on North Mountain; the Goat Rock Trail rises from 886 to 1,067 ft.', NPS_TRAILS, 'north-mountain'],
      ['gulpha-gorge-trail', 'Gulpha Gorge', 'modern', 'The pink-blazed Gulpha Gorge Trail links the campground to the park trail network.', NPS_TRAILS],
      ['hot-springs-mountain-tower', 'Mountain Tower', 'revival', 'The 216-ft lattice steel tower opened June 3, 1983, after the Woolman (1877) and Rix (1906) towers.', ['Wikipedia: Hot Springs Mountain Tower', 'https://en.wikipedia.org/wiki/Hot_Springs_Mountain_Tower']],
    ],
  },
  {
    world: 3, id: 'central-avenue-night', name: 'Central Avenue at night', era: 'roaring', palette: 'deco-neon',
    postcard: "Central Avenue after dark looking north to the Arlington's twin towers, Medical Arts setbacks and original neon (sign colors are unsourced, so invented)",
    stops: [
      ['central-avenue-historic-district', 'Valley Street', 'gilded-spa', 'Central Avenue was Valley Street until it was renamed by the late 1870s.', ['Encyclopedia of Arkansas: Central Avenue Historic District', 'https://encyclopediaofarkansas.net/entries/hot-springs-central-avenue-historic-district-7954/']],
      ['arlington-hotel', 'The Arlington', 'roaring', 'The third Arlington was built in 11 months and 3 days and completed Nov. 28, 1924, at the Central/Fountain "Y".', ['Arlington Hotel: History', 'https://www.arlingtonhotel.com/history/']],
      ['southern-club', 'Southern Club', 'roaring', 'Built 1893; after a 1927 sale its front was clad in dark Pittsburgh glass (a 1940s storefront per the 1985 district nomination).', ['Encyclopedia of Arkansas: Southern Club', 'https://encyclopediaofarkansas.net/entries/southern-club-1208/']],
      ['ohio-club', 'Ohio Club', 'roaring', 'Founded in 1905; during Prohibition it officially became the Ohio Cigar Store.', ['Encyclopedia of Arkansas: Ohio Club', 'https://encyclopediaofarkansas.net/entries/ohio-club-9408/']],
      ['medical-arts-building', 'Medical Arts Tower', 'roaring', "A 16-story Art Deco tower, Arkansas's tallest building from 1930 until 1960.", ['Encyclopedia of Arkansas: Medical Arts Building', 'https://encyclopediaofarkansas.net/entries/medical-arts-building-6047/']],
      [null, 'KTHS Ballroom', 'roaring', 'Radio KTHS ("Kome To Hot Springs") aired its first program Dec. 20, 1924, from the Arlington ballroom.', EOA_KTHS, 'arlington-hotel'],
      ['bridge-street', 'Bridge Street', 'roaring', 'About 98 ft long; Ripley\'s Believe It or Not called it the shortest street in the world in the 1940s.', ['ACHP: The Hot Springs National Park Visitors Center', 'https://www.achp.gov/node/8710']],
      ['park-hotel', 'Park Hotel', 'roaring', 'A seven-story hotel on Fountain Street that opened in 1930.', ['Arkansas Democrat-Gazette (2024): Hot Springs rebound', 'https://www.arkansasonline.com/news/2024/may/26/hot-springs-rebound/']],
      [null, 'Fountain Street', 'any', 'NPS says the "alpha" fault that brings the hot water up roughly follows Central Avenue and Fountain Street.', ['NPS: Maurice Historic Display Spring', 'https://www.nps.gov/places/maurice-historic-display-spring.htm'], 'arlington-hotel'],
      ['vapors', 'The Vapors', 'midcentury', 'Opened in 1960 at 315 Park Avenue; Tony Bennett first sang "I Left My Heart in San Francisco" there in rehearsal.', ['Encyclopedia of Arkansas: Vapors', 'https://encyclopediaofarkansas.net/entries/vapors-3998/']],
    ],
  },
  {
    world: 4, id: 'oaklawn-and-ballfields', name: 'Oaklawn & the spring-training fields', era: 'midcentury', palette: 'motor-hotel',
    postcard: 'A linen-style card of a racetrack grandstand on a one-mile oval, with a wooden ballpark grandstand inset (generic, no track or team marks)',
    stops: [
      ['hot-springs-baseball-grounds', 'Baseball Grounds', 'gilded-spa', 'Where A. G. Spalding and Cap Anson brought the Chicago White Stockings to train in 1886.', ['Hot Springs Historic Baseball Trail: Hot Springs Baseball Grounds', 'https://hotspringsbaseballtrail.com/see-the-trail/hot-springs-baseball-grounds/']],
      ['whittington-park-ballpark', 'Whittington Park', 'gilded-spa', 'Opened in 1894 with a 260-ft right-field fence; renamed Ban Johnson Park in 1935.', WP_BJ],
      ['arkansas-alligator-farm', 'Alligator Farm Fence', 'gilded-spa', "Babe Ruth's March 17, 1918, home run cleared Whittington Park and landed in the Alligator Farm (later measured at about 573 ft).", WP_BJ],
      ['majestic-park', 'Majestic Park', 'gilded-spa', 'The Detroit Tigers made a practice field here in 1908 and the Boston Red Sox built stands in 1909.', ['Wikipedia: Majestic Park', 'https://en.wikipedia.org/wiki/Majestic_Park']],
      ['fogel-field', 'Fogel Field', 'roaring', 'Built in 1912 (also called Fordyce Field); Negro league teams, including the Pittsburgh Crawfords, trained here in the 1930s.', ['Hot Springs Historic Baseball Trail: See the Trail', 'https://hotspringsbaseballtrail.com/see-the-trail/']],
      ['sam-guinn-field', 'Sam Guinn Field', 'roaring', 'Built in 1933 at 497 Crescent Avenue to host Negro leagues spring training.', WP_BJ],
      [null, 'Jaycee Field', 'midcentury', 'The Chicago White Sox trained here from 1948 to 1951; Jaycee Park was built on the old Majestic Field site.', WP_BJ, 'majestic-park'],
      ['oaklawn', 'Glass Grandstand', 'gilded-spa', "Oaklawn's 1905 grandstand was glass-enclosed with steam heat, among the first U.S. tracks with either.", EOA_OAK],
      [null, 'Backstretch Chute', 'any', 'The one-mile dirt oval has a backstretch chute for six-furlong sprints.', W_OAK, 'oaklawn'],
      [null, 'Derby Day', 'roaring', 'The first Arkansas Derby was run at Oaklawn in 1936 for a purse of $5,000.', EOA_OAK, 'oaklawn'],
    ],
  },
  {
    world: 5, id: 'lakes', name: 'Lake Hamilton & Lake Ouachita', era: 'modern', palette: 'lake-life',
    postcard: 'Lake Ouachita at sunset: pine-covered islands, a pontoon boat and a quartz-flecked shore',
    stops: [
      ['carpenter-dam', 'Carpenter Dam', 'roaring', 'Begun by Arkansas Power & Light in 1929 and completed in 1931, creating Lake Hamilton.', ['Encyclopedia of Arkansas: Hot Springs (city)', 'https://encyclopediaofarkansas.net/entries/hot-springs-887/']],
      ['lake-hamilton', 'Lake Hamilton', 'roaring', 'About 7,200 acres, named for Hamilton Moses of Arkansas Power & Light.', ['Wikipedia: Lake Hamilton', 'https://en.wikipedia.org/wiki/Lake_Hamilton_(Arkansas)']],
      ['andrew-hulsey-hatchery', 'Hulsey Hatchery', 'modern', 'The Andrew Hulsey State Fish Hatchery sits on the south side of Lake Hamilton, its water source.', ['Encyclopedia of Arkansas: AGFC State Fish Hatcheries', 'https://encyclopediaofarkansas.net/entries/arkansas-game-and-fish-commission-state-fish-hatcheries-2539/'], 'lake-hamilton'],
      ['remmel-dam', 'Remmel Dam', 'roaring', 'A 1924 Ambursen flat-slab buttress dam that forms Lake Catherine.', ['Wikipedia: Lake Catherine', 'https://en.wikipedia.org/wiki/Lake_Catherine_(Arkansas)']],
      ['lake-catherine-state-park', "Catherine's Cabins", 'roaring', 'The Civilian Conservation Corps built Lake Catherine State Park in the 1930s, including stone-and-wood cabins.', ['Wikipedia: Lake Catherine State Park', 'https://en.wikipedia.org/wiki/Lake_Catherine_State_Park']],
      ['blakely-mountain-dam', 'Blakely Mountain Dam', 'midcentury', 'The Corps of Engineers built the 231-ft dam from 1948 to 1953, creating Lake Ouachita.', ['Wikipedia: Lake Ouachita', 'https://en.wikipedia.org/wiki/Lake_Ouachita']],
      ['three-sisters-springs', 'Three Sisters Springs', 'midcentury', 'Historic healing springs preserved in Lake Ouachita State Park (opened 1955).', ['Wikipedia: Lake Ouachita State Park', 'https://en.wikipedia.org/wiki/Lake_Ouachita_State_Park'], 'lake-ouachita-state-park'],
      [null, 'Geo-Float Trail', 'revival', 'A 16-mile water trail from Spillway to Brady Mountain recreation areas, certified a National Recreation Trail in 1980 (added 2026-11-01).', ['National Recreation Trails: Ouachita Geo-Float Trail', 'https://nrtapplication.org/trails/ouachita-geo-float-trail'], 'lake-ouachita'],
      ['lake-ouachita', 'Two Hundred Islands', 'midcentury', 'Lake Ouachita has about 200 islands and "one of the largest crystal veins in the world."', ['Wikipedia: Lake Ouachita', 'https://en.wikipedia.org/wiki/Lake_Ouachita']],
      ['mount-ida', 'Mount Ida Crystals', 'modern', 'Mount Ida claims the title "Quartz Crystal Capital of the World" and hosts a crystal dig the second week of October (added 2026-11-01).', ['Encyclopedia of Arkansas: World Championship Quartz Crystal Dig', 'https://encyclopediaofarkansas.net/entries/World-Championship-Quartz-Crystal-Dig-4414']],
    ],
  },
  {
    world: 6, id: 'garvan-and-revival', name: 'Garvan Gardens & the revival', era: 'modern', palette: 'lake-life',
    postcard: 'Anthony Chapel among tall pines above Lake Hamilton, framed by tulips; a restored Bathhouse Row strip along the bottom',
    stops: [
      ['fordyce-bathhouse', 'Fordyce Visitor Center', 'revival', 'Closed in 1962 and reopened as the park visitor center on May 13, 1989.', ['Encyclopedia of Arkansas: Hot Springs National Park', 'https://encyclopediaofarkansas.net/entries/hot-springs-national-park-2547/']],
      ['quapaw-bathhouse', 'Quapaw Baths', 'modern', 'Restored by NPS in 2004; Quapaw Baths & Spa opened in July 2008.', WP_ROW],
      ['bathhouse-row', 'Running of the Tubs', 'modern', 'Since 2006, teams have pushed bathtubs the length of Bathhouse Row.', ['Visit Hot Springs: Running of the Tubs 2026 press release', 'https://hotsprings.org/media-room/press-releases/first-ever-running-of-the-tubs-website-provides-registration-fun-and-background-information-for-2026-world-championship-bathtub/']],
      ['ozark-bathhouse', 'Ozark Cultural Center', 'modern', 'Reopened in 2014 as the Hot Springs National Park Cultural Center.', WP_ROW],
      ['hale-bathhouse', 'Hotel Hale', 'modern', 'Now Hotel Hale, nine suites with thermal-water soaking tubs (opened May 2019).', ['NPS: Hale Bathhouse', 'https://www.nps.gov/places/hale-bathhouse.htm']],
      ['maurice-bathhouse', 'Maurice Restoration', 'modern', 'A $31.6 million rehabilitation broke ground Aug. 19, 2025, the last on the Row.', ['NPS: Groundbreaking celebrated for Maurice Bathhouse rehabilitation', 'https://www.nps.gov/hosp/learn/news/maurice-gaoa-groundbreaking.htm']],
      [null, 'Garden of the Pine Wind', 'modern', 'A Japanese rock-and-stream garden begun in March 2000 (added 2026-11-01).', EOA_GARVAN, 'garvan-woodland-gardens'],
      [null, 'Bridge of the Full Moon', 'modern', 'A stone bridge with a round arch, focal point of the Garden of the Pine Wind (via search summary, added 2026-11-01).', ['Arkansas Tourism / TravelAwaits (via search summary)', 'https://www.travelawaits.com/2562287/garvan-woodland-gardens/'], 'garvan-woodland-gardens'],
      ['anthony-chapel', 'Anthony Chapel', 'modern', 'A wood-and-glass chapel with a 57-ft ceiling on pine columns, opened September 2006.', EOA_GARVAN, 'garvan-woodland-gardens'],
      [null, 'Holiday Lights', 'modern', 'Visit Hot Springs lists about 5 million lights over 18 acres (earlier counts were about 4 million).', ['Visit Hot Springs: Garvan Woodland Gardens', 'https://www.hotsprings.org/places/activities/garvan-woodland-gardens/'], 'garvan-woodland-gardens'],
    ],
  },
];

const errors = [];
const out = {
  _meta: {
    title: 'Spa City Sparkle (match-3) world route',
    date: '2026-11-01',
    builtBy: 'tools/build-route.mjs (Spa City Sparkle Phase A)',
    schema: {
      worlds: 'array of 6 worlds in play order',
      'world fields': 'world (1-6), id, name, era (era id; "any" = cross-era), palette (tokens slug), postcard (subject of the world\'s restored postcard), stops[]',
      'stop fields': 'order (1-10, the level number), placeId (places.json id or null), name (level name), lat, lng (decimal degrees or null), coordSource ("places.json:<id>" own point, "parent:<id>" the parent place\'s point used as a stand-in, or "none"), era, fact (one line), source, sourceUrl',
    },
    notes: [
      'Coordinates are copied from research/places.json (whose own coordSource notes apply). A "parent:" coordinate is the containing place (park, lake, mountain or hotel), not the stop itself.',
      'Facts restate research/ topic files; items marked "(added 2026-11-01)" come from the match-3 web research recorded in geography-lakes-mountains.md, other-attractions.md and SOURCES.md.',
      'Stop order is a level order for the game, not a walking or driving route.',
    ],
    sources: ['research/places.json', 'research/bathhouse-row-and-springs.md', 'research/geography-lakes-mountains.md', 'research/downtown-and-landmarks.md', 'research/baseball-spring-training.md', 'research/oaklawn-and-racing.md', 'research/other-attractions.md', 'research/culture-events-food.md'],
  },
  worlds: worlds.map((w) => ({
    world: w.world, id: w.id, name: w.name, era: w.era, palette: w.palette, postcard: w.postcard,
    stops: w.stops.map(([placeId, name, era, fact, [source, sourceUrl], parent], i) => {
      let lat = null, lng = null, coordSource = 'none';
      if (placeId && !P.has(placeId)) errors.push(`${w.id}: unknown place ${placeId}`);
      const own = placeId && P.get(placeId);
      if (own && own.lat != null) { lat = own.lat; lng = own.lng; coordSource = `places.json:${placeId}`; }
      else if (parent) {
        const pp = P.get(parent);
        if (!pp || pp.lat == null) errors.push(`${name}: parent ${parent} has no point`);
        else { lat = pp.lat; lng = pp.lng; coordSource = `parent:${parent}`; }
      }
      return { order: i + 1, placeId, name, lat, lng, coordSource, era, fact, source, sourceUrl };
    }),
  })),
};
for (const w of out.worlds) if (w.stops.length !== 10) errors.push(`${w.id}: ${w.stops.length} stops`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const file = path.join(ROOT, 'research', 'match3-route.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n'); // LF, like the other research files
console.log('wrote', file, out.worlds.map((w) => `${w.id}: ${w.stops.filter((s) => s.lat != null).length}/10 with coords`).join('; '));
