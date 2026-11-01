# Running Critic B (Codex)

Delegate through the `codex:codex-rescue` subagent from the folder `C:\Video Game Projects`. Codex's Windows
sandbox can't read under `C:\Users\brian\`, so every input lives under `games/match-3 puzzle/`.

- **Effort:** `--effort medium`.
- **Mode:** read-only. Codex's final message is the review.
- **Prompt** (verbatim, with N filled in):

> You are Critic B in an adversarial visual review. Read and follow `games/match-3 puzzle/reviews/loop-N/brief.md`
> exactly, with role `critic-codex`. Open the PNG files it lists and LOOK at them (they are images: view them, don't
> parse them as text). Do not read `games/match-3 puzzle/reviews/HISTORY.md`, `history.json`, any other
> `reviews/loop-*` folder, or any `critic-*.md` or `judge.md` file. Do not modify files. Return the full review as
> your final message, ending with the fenced json block the brief asks for.

- **If Codex can't view the images:** it must say so, and the review is discarded. Never accept scores made from
  file names or metadata.
