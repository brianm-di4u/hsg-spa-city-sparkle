# Visual review rubric: Spa City Sparkle

**The target.** A premium swap-and-match puzzle game in a browser, judged against the commercial genre leaders on
phones (glossy, juicy, instantly readable boards with painted worlds). Score only what is in the captures. Do not
grade on a browser-game curve. A secondary reference is the collection's own property-game ("Bathhouse Barons"),
whose final harsh review scored about 6.4/10. This game must at least match that.

**Scoring.** Each review scores the 8 categories below from 1 to 10 in 0.5 steps, 80 points at most.
- Every category cites at least 2 captures.
- `animation` must cite a motion strip (`strips/*`).
- `mobile` must cite mobile frames.

| Category | key | Gate |
|---|---|---|
| Art: pieces, specials, blockers, paintings | `art` | ≥ 7 |
| Rendering and lighting: depth, glow, shadows, cohesion of board and backdrop | `rendering` | ≥ 7 |
| Animation and game feel (strips first) | `animation` | ≥ 7 |
| UI / HUD and menus | `ui` | ≥ 7 |
| Typography | `typography` | ≥ 7 |
| Readability: piece kinds, blockers and goals at a glance | `readability` | ≥ 7 |
| Mobile: portrait framing, touch targets, density at 390 px | `mobile` | ≥ 7 |
| Authenticity: Hot Springs, Arkansas, recognisable and respectful | `authenticity` | ≥ 6 |

**Measured gates.** The developer records these in `loop-N/gates.json`; reviewers do not score them.
- **tests:** the full harness suite is green.
- **perf:** the frame-cost budget is met (`tests/14-perf.test.mjs`, `--gpu`).
- **ip:** no commercial match-3 names, logos, piece designs or UI copied.

## Anchors (the genre leaders are the 9s)
- **Art.**
  - 3: flat clip-art shapes; specials barely differ from plain pieces.
  - 5: clean, consistent icons, but they read as stock assets. Paintings and pieces come from different worlds.
  - 7: glossy, dimensional pieces with distinct silhouettes and specular highlights; specials obviously special;
    blockers have material identity (stone, metal, moss, steam); the paintings are polished and share a palette
    with the board.
  - 9: candy-like or jewel-like pieces with micro-detail that hold up at 2×; every special and blocker is a little
    character; the board and world feel art-directed as one.
- **Rendering.**
  - 3: flat board pasted on a picture.
  - 5: some shadow and glow, but the board floats with no relation to the scene.
  - 7: a framed board seated in its world (frame, cast shadow, vignette); pieces have contact shadows; glows and
    effects are additive and soft; colour temperature is consistent per world.
  - 9: rich layered depth with light that responds to events.
- **Animation.**
  - 3: pieces teleport.
  - 5: swaps and falls are linear; clears just vanish.
  - 7: eased swaps with overshoot, pops with anticipation, particles, chained effects you can follow, falls with a
    landing squash or bounce, big-moment callouts and shake.
  - 9: every event has anticipation, impact and follow-through; the cascades are a joy to watch.
- **UI.**
  - 5: functional but generic or cluttered.
  - 7: a clear HUD hierarchy (moves, goals, score and stars) in one themed style; menus, dialogs and results are
    consistent, with nothing overlapping or clipped.
  - 9: a lavish, animated, themed UI on a par with the genre leaders.
- **Typography.**
  - 5: readable, mixed scales.
  - 7: a display face plus a UI face in a clear scale; numerals read at a glance; nothing clipped or crowded.
  - 9: characterful type that still reads at 390 px.
- **Readability.**
  - 5: some kinds or blockers are confusable, or overlays hide pieces.
  - 7: all six kinds distinguishable by shape and colour at phone size; specials, blockers and goals obvious; HUD
    goal icons match board pieces.
  - 9: instant reads even mid-cascade.
- **Mobile.**
  - 5: works but cramped or wasteful.
  - 7: the portrait layout is designed for the thumb (board large, HUD compact, tray reachable); nothing off-screen.
  - 9: feels phone-first.
- **Authenticity.**
  - 5: a generic spa town.
  - 7: Bathhouse Row, the tiled dome, the Arlington, Oaklawn-style racing, the lakes and Garvan-style gardens read as
    Hot Springs.
  - 9: a local would name every world from a screenshot.
  - Penalise inaccurate features (for example white Pamukkale-style terraces; the real tufa is drab grey) and any
    stereotype in the guide character.
