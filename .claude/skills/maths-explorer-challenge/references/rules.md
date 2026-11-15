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
- The activity offers tools, never the method: no counter, table, running total, highlighted invariant, "optimal"
  button or helper that gives the idea away. A neutral end message ("Everyone has shaken hands.") is fine.
- One `goalLine` sentence on top of the activity; nothing explanatory under it.
- Answer `0` means impossible only when `variant.impossible` is set; the prompt never mentions "impossible".
- The original statement sits in a closed "Énoncé d'origine" disclosure; the written solution in a closed "Version
  écrite"; both are produced by the shared page from `original(q)` and `variant.solution(q)`.

## Teaching (the animated solution does the teaching)

- High-school level, cartoon-like: real objects (people, pegs, eggs, bridges) before symbols; the symbols, if any,
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

- Works at 390 px wide without horizontal scroll, and at 1280 px; both themes (`jour`, `nuit`); reduced motion shows
  final frames without animation.
- Every piece reachable and operable by keyboard; status messages in an `aria-live` region.
- Every parameter combination: the activity draws, every solution step shows something, the form accepts the answer
  (check.mjs walks all of this).
- Small code: one concern per file; comments say *why*; no dependency outside `site/js/`.
