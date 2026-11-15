# Owner rules and design bar for a challenge

Sources: root `CLAUDE.md`, `HANDOFF.md` (challenge conventions), `site/js/challenges/CLAUDE.md` (dated updates). Where
they differ, the most recent dated rule wins; the list below is current on 15 November 2026.

## Mathematics

- The answer is computed by `maths.js` and checked in `tests/<id>.test.mjs` by an **independent** method (brute force
  against a formula, exhaustive search against a construction, simulation against a closed form) over the whole
  parameter range. Never assert a value copied from a book.
- Lower bounds count: if the answer is a minimum, the solution says why fewer is impossible (as `pegs` lists the
  points reachable in fewer moves).
- If you cannot prove the result or check it independently, do not ship it; report what is missing.

## What the page shows

- The statement only. No hint panel, no hint buttons (13 November 2026).
- The activity simulates the problem and offers tools, never the method: no table, running total, highlighted
  invariant, hint toggle, "worst case" or "optimal" button, or helper that gives the idea away. Neutral measurements
  of what the question asks (a stopwatch, a move count, measuring a cup) and a neutral end message are fine.
- The right experiment may reveal the idea: that is the intended discovery (`references/design.md` section 1), as
  long as the learner chose it and nothing on screen pointed to it.
- One `goalLine` sentence on top of the activity; nothing explanatory under it.
- Answer `0` means impossible only when `variant.impossible` is set; the prompt never mentions "impossible".
- Keep the classic statement (owner rule, 15 November 2026). If it asks for a number, the prompt is that statement and
  the site checks it; the proof version, if any, sits in a closed "Jusqu'à la preuve" disclosure from `original(q)`. If
  it asks for a proof, a construction or a yes/no with a reason, set `variant.open: true`: the prompt is the classic
  statement, no `original`, no `impossible`, no answer form, and the solution answers that question. Never bend a
  statement into a number just to have something to check.
- The written solution sits in a closed "Version écrite", produced by the shared page from `variant.solution(q)`.

## Teaching (the animated solution does the teaching)

- High-school level, cartoon-like, in the activity's world with the same characters: real objects (people, pegs, eggs, bridges) before symbols; the symbols, if any,
  arrive in the last steps. Show the town before the graph (Königsberg rule).
- No jargon in the written solution: the banned list in `tests/challenge-jargon.test.mjs` (group, invariant, modulo,
  graph, parity, valuation, Euler, Bézout, gcd, ...) fails the tests. Say "even or odd", "never changes", "the
  remainder when divided by 3". Captions and prompts should follow the same rule (check.mjs warns).
- No URLs, citations, names of competitions as provenance, or `[VERIFY]` in visible text. Provenance goes in the PR.

## Text

- Bilingual `[fr, en]` everywhere (extra-curricular content is bilingual, root `CLAUDE.md` language rule). French with
  French typography: a space before `:`, `;`, `?`, `!`; curly apostrophe `’`; `×`, `÷`, `−` (U+2212) for minus.
- No em dash or en dash in visible text (owner rule; check.mjs fails it).
- No names of the owner, a school or a city.

## Quality bar (check before delivery)

- The delivery is the file in the handoff format (`AGENT_BRIEF.md`), in the first answer, not a plan.
- The solution is animated where motion helps understanding (`references/design.md` section 2).

- Works at 390 px wide without horizontal scroll, and at 1280 px; both themes (`jour`, `nuit`); reduced motion shows
  final frames without animation.
- Every piece reachable and operable by keyboard; status messages in an `aria-live` region.
- Every parameter combination: the activity draws, every solution step shows something, the form accepts the answer
  (check.mjs walks all of this).
- Small code: one concern per file; comments say *why*; no dependency outside `site/js/`.
