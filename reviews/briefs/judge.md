# Judge brief: loop {{LOOP}}

You are the judge in an adversarial visual review of **Spa City Sparkle**, an original browser match-3 set in
Hot Springs, Arkansas. You reconcile two blind critics into the loop's final scores and a ranked gap list. That
list drives the next development loop.

## Inputs
- The rubric `{{GAME}}/reviews/RUBRIC.md` and the schema `{{GAME}}/reviews/schema.json`.
- The loop brief `{{GAME}}/reviews/loop-{{LOOP}}/brief.md`.
- The measured gates for this loop: {{GATES}}
- The captures, under `{{GAME}}/screenshots/{{SHOTS}}/` (`desktop/`, `mobile/`, `strips/`, `sheets/`).
- The two critiques: `{{GAME}}/reviews/loop-{{LOOP}}/critic-claude.md` and `critic-codex.md`.
- History: `{{GAME}}/reviews/HISTORY.md` holds earlier judged scores. Use it for trend only and don't anchor on it.

## Rules
1. **Prosecute, then defend.** For each critic, write the strongest case that it over-scored, then the strongest
   case that it under-scored. Keep each to a few lines and cite the captures.
2. **Open the captures yourself.** For every category where the critics differ by more than 1.0, cite at least one
   frame or strip you checked, and say who was right.
3. **Final score per category.** Use your own judgement on the rubric anchors, with at least 2 cited captures.
   Drop any uncited claim.
4. **Gaps.**
   - Merge duplicates and fix wrong causes.
   - Rank by expected gain ÷ effort and keep the top 10.
   - Each gap needs a concrete, testable fix, for example "a soft 8 px contact shadow ellipse under every piece".
     "Better lighting" is not concrete.
5. **Verdict.** `stop-pass` if every category meets its gate, otherwise `continue`.

Write a short ruling per category, then the ranked gaps. End with one fenced ```json block per schema.json, with
`"role": "judge"`, `"loop": {{LOOP}}` and a `"verdict"`. Don't edit any file.
