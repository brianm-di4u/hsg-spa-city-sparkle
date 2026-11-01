# Spa City Sparkle

An original swap-and-match puzzle journey through Hot Springs, Arkansas: 60 levels in six worlds (Bathhouse Row,
Hot Springs Mountain, Central Avenue at night, Oaklawn and the ballfields, the lakes, Garvan Gardens), each
restoring a painted postcard and unlocking a sourced lore card. Part of **Hot Springs Games**, an open-source
(MIT) collection of browser games set in Hot Springs, Arkansas.

The game ships as a self-contained `index.html`:
- art packs load from `assets/` (Blender renders and AI-assisted paintings as data URIs);
- sound is synthesized with WebAudio;
- nothing loads from the network;
- it plays from `file://` too.

All rules, names and art are original. Real places appear as setting and history only; no logos are reproduced
and nothing implies endorsement. Della, the guide, is fictional.

## Play
Open `index.html` in a browser, or serve the folder (`python -m http.server 8765`) and open
http://127.0.0.1:8765/.

## Develop
```bash
npm run setup          # build-time tools (PixiJS, OFL fonts) and the test harness (Playwright + Chromium)
npm run build          # vendor, fonts, levels, art packs, then the inliner → index.html
npm run check          # level checks (structure, refill, boards, goals)
node tools/balance.mjs # difficulty: casual and random bots, 200 + 50 seeds per level
npm test               # the Playwright harness; screenshots land in screenshots/
```

`shared/` holds a copy of the Hot Springs Games test harness and inliner, so the repo builds and tests on its own.
`tools/build-lore.mjs` and `tools/build-route.mjs` regenerate `data/lore.json` and the route from the collection's
research corpus and run only inside the monorepo; the lore fact check uses the bundled `research/lore-bank.json`.

Docs: `PRD.md` (requirements and acceptance criteria), `MECHANICS.md` (engine rules), `DEV-PLAN.md` (milestones,
test matrix, defect log), `VISUAL-PLAN.md`, `TEST-CAMPAIGN.md`, `REPORT.md`, `VISUAL-REPORT.md`, `SAMPLES.md`, `art-src/PROMPTS.md`
(art provenance), and `research/town-content.md` (every Hot Springs fact the game uses, with sources).

## Credits
- Renderer: [PixiJS](https://pixijs.com) (MIT).
- Fonts: Righteous and Nunito (SIL Open Font License).
- Pieces modelled and rendered in Blender.
- Backdrops, map, postcards and guide are AI-assisted paintings made for this game.
- Lore cards come from the collection's audited Hot Springs fact bank, each citing its source.
