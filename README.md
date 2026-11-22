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
`tools/build-lore.mjs` regenerates `data/lore.json` and `data/bonus-lore.json` from the bundled `research/lore-bank.json`
(or the monorepo's trivia bank when it is there) and runs in this repo on its own; `tools/build-route.mjs` regenerates the
route from the collection's research corpus and runs only inside the monorepo. The lore fact check uses the bundled bank.

Docs: `PRD.md` (requirements and acceptance criteria), `MECHANICS.md` (engine rules), `DEV-PLAN.md` (milestones,
test matrix, defect log), `VISUAL-PLAN.md`, `TEST-CAMPAIGN.md`, `REPORT.md`, `VISUAL-REPORT.md`, `SAMPLES.md`, `art-src/PROMPTS.md`
(art provenance), and `research/town-content.md` (every Hot Springs fact the game uses, with sources).

## Paths outside this repo

The game and its tests use files inside this repo, and the build uses the repo's own `shared/tools/inline.mjs` and `shared/test-harness/art-pack.mjs`. The tools below can also use shared material from the Hot
Springs Games workspace (`reference/`, `research/`, or a sibling checkout in `repos/`). They find the workspace through the
`HSG_WORKSPACE` environment variable; when it is unset, the workspace is this repo's grandparent, which is right when the
repo sits at `<workspace>/repos/<repo>`. When the workspace copy is not there, each tool falls back to a path in this repo or
skips that step with a message.

- `tools/build-vendor.mjs` (part of `npm run build`): copies `research/match3-route.json` to `data/route.json`, else keeps the committed `data/route.json`.
- `tools/check-facts.mjs`: the audited bank at `repos/hsg-trivia/data/questions.json`, else `research/lore-bank.json` here.
- `tools/build-lore.mjs`: the same bank, else `research/lore-bank.json` here. `tools/build-route.mjs` reads `research/places.json` and writes `research/match3-route.json` in the workspace.

## Changes
- **v1.1.0**: new paintings for the title screen and all six world backdrops, in portrait and landscape. They
  pack at WebP quality 0.6 (was 0.66) to stay inside the 6 MB asset budget.
- **v1.0.1**: from player feedback on a phone. A Cascade or Hot Stone now fires when you swipe it, even if
  the swipe makes no match. Specials glow brighter and pulse, Cascade chevrons are bigger, and a callout names
  each new special as it appears.

## Credits
- Renderer: [PixiJS](https://pixijs.com) (MIT).
- Fonts: Righteous and Nunito (SIL Open Font License).
- Pieces modelled and rendered in Blender.
- Backdrops, map, postcards and guide are AI-assisted paintings made for this game.
- Lore cards come from the collection's audited Hot Springs fact bank, each citing its source.
