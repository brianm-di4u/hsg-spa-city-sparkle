// Builds data/lore.json for Spa City Sparkle from the AUDITED trivia bank
// (games/trivia/data/questions.json). Card text is a hand-written restatement of each bank
// item's answer + explanation (no new claims); this script checks every card against the bank:
// id exists, confidence "confirmed", passes the sensitive-topic filter, title <= 40, text <= 160.
// Run from the repo root:  node "games/match-3 puzzle/tools/build-lore.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'games', 'trivia', 'data', 'questions.json'), 'utf8'));
const byId = new Map(bank.questions.map((q) => [q.id, q]));
// Same filter as games/mahjong/tools/extract-facts.mjs (research/00-INDEX.md content rules).
const SENSITIVE = /lynch|slave|segregat|bomb|murder|kill|racis|riot|massacre|shoot|death|died|fatal|incident|gangster|mob\b/i;

const W = {
  1: 'bathhouse-row', 2: 'hot-springs-mountain', 3: 'central-avenue-night',
  4: 'oaklawn-and-ballfields', 5: 'lakes', 6: 'garvan-and-revival',
};
const cards = [
  // World 1: Bathhouse Row (gilded-spa)
  [1, 'hs-0109', 'Eight Historic Bathhouses', 'Eight historic bathhouses stand on Bathhouse Row: Superior, Hale, Maurice, Fordyce, Quapaw, Ozark, Buckstaff and Lamar, lining Central Avenue.'],
  [1, 'hs-0061', 'The Oldest on the Row', 'The Hale, built in 1892–93, is the oldest surviving bathhouse on the Row. The Buckstaff (1912), Fordyce (1914–15) and Lamar (1923) came later.'],
  [1, 'hs-0062', 'Baths Since 1912', 'The Buckstaff opened on February 1, 1912, and NPS says it has offered baths in continuous operation ever since.'],
  [1, 'hs-0064', 'The Priciest Bathhouse', 'The Fordyce, the most elaborate and most expensive bathhouse, cost $212,749.55 to build in 1914–15, including fixtures and furniture.'],
  [1, 'hs-0065', 'Under the Skylight', "The Fordyce's massive stained-glass skylight is in the men's area, with the DeSoto Fountain centered on the floor directly below it."],
  [1, 'hs-0068', 'Horseshoe and Magnesia', 'The 1922 Quapaw Bathhouse was built on the sites of two earlier bathhouses, the Horseshoe and the Magnesia.'],
  [1, 'hs-0084', 'Shells and Sculpin', "Sculpin fish decorate the Quapaw's parapets, framed by scalloped shells. The fish were originally gold and are now white."],
  [1, 'hs-0070', 'Two Bronze Eagles', "Two bronze federal eagles guard Bathhouse Row's 1890s main entrance. Army engineer Lt. Robert Stevens designed the reservation's entrances."],
  [1, 'hs-0022', 'A Course of 21 Baths', 'In 1920 a standard prescribed "course" at Hot Springs was 21 baths, and a course cost $9 to $15.'],
  [1, 'hs-0077', 'The Row Completed', 'The final change to Bathhouse Row was completed when the Lamar opened in 1923, NPS says. The Lamar closed in 1985.'],
  // World 2: Hot Springs Mountain and the tufa terraces (thermal-water)
  [2, 'hs-0148', 'Forty-Seven Springs', 'USGS says the park is best known for its 47 hot springs, which emerge from Hot Springs Mountain at an average temperature of 143°F.'],
  [2, 'hs-0154', 'Hottest East of the Rockies', 'NPS calls the Hot Springs thermal springs the hottest east of the Rocky Mountains. They average about 143°F.'],
  [2, 'hs-0145', 'Rain from Long Ago', 'USGS tritium and carbon-14 dating show most of the thermal water is about 4,400 years old, mixed with a very small amount under 20 years old.'],
  [2, 'hs-0153', 'Heated a Mile Down', 'Rainwater heats to about 160°F through the geothermal gradient, roughly a mile underground, before it rises again as spring water.'],
  [2, 'hs-0151', 'The Alpha and Beta Faults', 'NPS says two faults, named alpha and beta, help direct the heated water back up to the surface.'],
  [2, 'hs-0146', '700,000 Gallons a Day', 'The National Park Service says the thermal springs produce over 700,000 gallons of water a day.'],
  [2, 'hs-0156', 'Tufa Rock', 'Minerals dissolved in the spring water precipitate near the spring openings as white-to-tan travertine, or tufa rock.'],
  [2, 'hs-0120', 'The Display Spring', 'The Display Spring was covered by a grate for decades. In the 1930s it was uncovered so visitors could see thermal water in its natural state.'],
  [2, 'hs-0163', 'The Grand Promenade', 'The Grand Promenade, a National Recreation Trail and the entry point to the park from downtown, is about half a mile long.'],
  [2, 'hs-0094', 'A 216-Foot Tower', 'The Hot Springs Mountain Tower is 216 feet tall. The lattice steel observation tower officially opened to the public on June 3, 1983.'],
  // World 3: Central Avenue at night (roaring)
  [3, 'hs-0060', 'Valley Street', 'Central Avenue was originally Valley Street. By the late 1870s it was named Central Avenue to reflect its status as the commercial center.'],
  [3, 'hs-0076', 'The Third Arlington', 'After the 1923 fire, work on the third Arlington Hotel began Oct. 25, 1923, and the new hotel was completed Nov. 28, 1924.'],
  [3, 'hs-0402', 'Kome To Hot Springs', 'The call letters of Hot Springs radio station KTHS stood for "Kome (Come) To Hot Springs."'],
  [3, 'hs-0404', 'Radio at the Arlington', "KTHS first broadcast from the Arlington Hotel. The station was built on the new Arlington's upper floor."],
  [3, 'hs-0401', 'Lum and Abner', 'The radio comedy team Lum and Abner first performed on KTHS in April 1931, at a flood relief benefit that launched their careers.'],
  [3, 'hs-0074', 'The Southern Club, 1893', 'The Southern Club on Central Avenue was built in 1893 as a private club by Charles Dugan and Dan Stuart.'],
  [3, 'hs-0088', 'Dark Pittsburgh Glass', 'After William Jacobs bought the Southern Club building in 1927, he encased its front in dark Pittsburgh glass, which helped hide the gambling.'],
  [3, 'hs-0073', 'The Ohio Club, 1905', 'The Ohio Club on Central Avenue was founded in 1905. During Prohibition it officially became the Ohio Cigar Store, a front with a fake wall.'],
  [3, 'hs-0490', 'The Shortest Street', "In the 1940s, Ripley's Believe It or Not designated Hot Springs' Bridge Street \"the shortest street in the world.\""],
  [3, 'hs-0488', 'Scotch and Soda', "Mayor Leo McLaughlin's sulky was pulled down Central Avenue by horses named Scotch and Soda. He rode daily, wearing a red carnation."],
  // World 4: Oaklawn and the spring-training fields (midcentury)
  [4, 'hs-0188', 'Spring Training, 1886', 'Hot Springs first welcomed Major League Baseball in 1886, when the Chicago White Stockings came to town for spring training.'],
  [4, 'hs-0196', 'Whittington Park, 1894', "Hot Springs' Whittington Park ballfield opened in 1894. It replaced the Hot Springs Baseball Grounds."],
  [4, 'hs-0183', 'Into the Alligator Farm', "Babe Ruth's famous long home run of March 17, 1918, at Whittington Park landed in the Arkansas Alligator Farm, Wikipedia says."],
  [4, 'hs-0184', 'About 573 Feet', "A 2011 engineering measurement put Ruth's 1918 Whittington Park homer at about 573 feet. A Boston paper had thought it went more than 500."],
  [4, 'hs-0217', 'Ban Johnson Park', 'In 1935 Whittington Park was renamed for Hall of Fame baseball pioneer Ban Johnson, founder of the American League.'],
  [4, 'hs-0223', 'The First Umpire School', "Hot Springs' George Barr school (1935–47) is recognized as the first school for umpires in baseball."],
  [4, 'hs-0398', '1904 or 1905?', 'Sources disagree on when Oaklawn opened: Wikipedia says Feb. 24, 1904; the Encyclopedia of Arkansas says Feb. 15, 1905.'],
  [4, 'hs-0212', 'A City Holiday', "Hot Springs declared a city holiday for Oaklawn's first day of racing, and more than 3,000 people attended, per Wikipedia."],
  [4, 'hs-0216', 'The First Arkansas Derby', 'The first Arkansas Derby was run at Oaklawn in 1936, for a purse of $5,000.'],
  [4, 'hs-0470', 'The Fifth Season', 'Wikipedia says the Oaklawn race meet, held December through May, is sometimes called the "Fifth Season."'],
  // World 5: Lake Hamilton and Lake Ouachita (lake-life)
  [5, 'hs-0121', 'Carpenter Dam, 1931', 'Arkansas Power & Light developed Lake Hamilton. Its Carpenter Dam, a concrete gravity dam, was completed in 1931, and the lake was created in 1932.'],
  [5, 'hs-0122', 'About 7,200 Acres', 'Lake Hamilton covers about 7,200 acres. Lake Catherine, the smaller of the two lakes, is about 1,940 acres.'],
  [5, 'hs-0159', 'Creek to Lake', 'Hot Springs Creek flows from Whittington Avenue through the southern city and, after passing under Bathhouse Row, empties into Lake Hamilton.'],
  [5, 'hs-0123', 'Remmel Dam, 1924', 'Remmel Dam, built in 1924, forms Lake Catherine. Remmel and Carpenter dams were both listed on the National Register in 1992.'],
  [5, 'hs-0126', 'Blakely Mountain Dam', 'The Army Corps of Engineers built the 231-foot Blakely Mountain Dam from 1948 to 1953. It creates Lake Ouachita.'],
  [5, 'hs-0127', 'Two Hundred Islands', "Lake Ouachita has about 200 islands, according to Wikipedia's infobox for the lake."],
  [5, 'hs-0128', 'Three Sisters Springs', 'Lake Ouachita State Park, a 360-acre park that opened in 1955, preserves the historic healing springs called Three Sisters Springs.'],
  [5, 'hs-0175', 'Winter Eagles', 'In January and February, eagle-watch cruises at Lake Ouachita State Park look for bald eagles.'],
  [5, 'hs-0173', 'Trout Below the Dam', 'From November through April, the AGFC stocks catchable rainbow trout in the Ouachita River tailwaters below Carpenter Dam.'],
  [5, 'hs-0129', 'The State Mineral', "Quartz crystal became Arkansas's state mineral in 1967, when Gov. Winthrop Rockefeller signed Act 128 on Feb. 22, 1967."],
  // World 6: Garvan Gardens and the revival (modern)
  [6, 'hs-0096', 'Visitor Center, 1989', 'The Fordyce closed on June 29, 1962. Since 1989 it has served as the visitor center of Hot Springs National Park.'],
  [6, 'hs-0103', 'Quapaw Baths Reopen', 'NPS restored the Quapaw Bathhouse in 2004, and Quapaw Baths & Spa opened in the building in July 2008.'],
  [6, 'hs-0104', "The Ozark's New Life", 'The Ozark Bathhouse reopened in 2014 as the Hot Springs National Park Cultural Center, showing artist-in-residence work.'],
  [6, 'hs-0101', 'Hotel Hale', 'NPS says the Hale Bathhouse is now Hotel Hale, with nine suites whose soaking tubs get hot springs mineral water.'],
  [6, 'hs-0052', 'Restoring the Maurice', 'Work on the Maurice Bathhouse, about $31.6 million, broke ground Aug. 19, 2025. It is the last building on the Row to be rehabilitated.'],
  [6, 'hs-0379', 'Running of the Tubs', 'Racers push bathtubs the length of Bathhouse Row. Visit Hot Springs billed the 2026 races as the 20th running since they began in 2006.'],
  [6, 'hs-0141', '210 Acres of Garden', 'Garvan Woodland Gardens on Lake Hamilton covers 210 acres. The University of Arkansas owns the garden.'],
  [6, 'hs-0108', 'Anthony Chapel', 'Anthony Chapel, a wood-and-glass chapel in Garvan Woodland Gardens by Maurice Jennings and David McKee, officially opened in September 2006.'],
  [6, 'hs-0385', '150,000 Tulips', "About 150,000 tulips bloom in Garvan Woodland Gardens' Tulip Extravaganza, mid-March to mid-April in the Sensory Garden, per Visit Hot Springs."],
  [6, 'hs-0384', 'Nearly 5 Million Lights', "Garvan Woodland Gardens' multi-week Holiday Lights display features nearly 5 million lights, Visit Hot Springs says."],
];

const out = [];
const errors = [];
const seen = new Set();
for (const [world, id, title, text] of cards) {
  const q = byId.get(id);
  if (!q) { errors.push(`${id}: not in bank`); continue; }
  if (seen.has(id)) errors.push(`${id}: duplicate`);
  seen.add(id);
  if (q.confidence !== 'confirmed') errors.push(`${id}: confidence ${q.confidence}`);
  if (SENSITIVE.test(q.question + ' ' + q.answer + ' ' + q.explanation)) errors.push(`${id}: fails sensitive filter`);
  if (SENSITIVE.test(title + ' ' + text)) errors.push(`${id}: card text fails sensitive filter`);
  if (title.length > 40) errors.push(`${id}: title ${title.length} chars`);
  if (text.length > 160) errors.push(`${id}: text ${text.length} chars`);
  out.push({ world, worldId: W[world], id, title, text, source: q.source, sourceUrl: q.sourceUrl });
}
const counts = out.reduce((a, c) => ((a[c.world] = (a[c.world] || 0) + 1), a), {});
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
fs.writeFileSync(path.join(HERE, '..', 'data', 'lore.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`${out.length} lore cards written; per world:`, counts);
