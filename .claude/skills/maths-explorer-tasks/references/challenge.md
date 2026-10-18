# Recipe: a challenge

A challenge is split by layer over these files (all in `site/js/`). Search each for the challenge id; copy the shape of
a recent one (`pegs` is the latest complete example).

| # | File | Symbol | What to write |
|---|---|---|---|
| 1 | `content.js` | `challengeBase` entry `{ id, type, title, topic, difficulty, minutes, hints, extension }` | card and page text |
| 2 | `challenge-variants.js` | `VARIANTS.<id>` `{ params, answer, prompt, hints, solution }` | parameters, checked answer, statement, solution text; defaults must reproduce the statement of `content.js` |
| 3 | `challenge-originals.js` | `ORIGINALS.<id>` | the original open question (never states the answer or method) |
| 4 | `challenge-icons.js` | `CHALLENGE_ICONS.<id>` | 64x64 SVG emblem in `currentColor`; motion classes `ci-*` in `styles/pages.css` |
| 5 | `challenge-puzzles2.js` (or `challenge-puzzles.js`) | pure functions | the maths, no DOM |
| 6 | `challenge-classics2.js` / `challenge-classics.js` / `challenge-more.js` | `export function <id>(root, { t, q, reduced })` | hands-on activity (pointer, touch, keyboard, live region) |
| 7 | `challenge-activities.js` | `activities` object, import line | register the activity |
| 8 | `app.js` | `HINT_ACTIONS.<id>` | hint buttons acting on the canvas; the activity listens with `onHintAction(id, {...})` from `challenge-kit.js` |
| 9 | `challenge-solutions-3.js` (or a `solution-scenes-N.js` scene) | object `{ size, steps(q), draw(c, step, p, q) }` or `{ mount, update, dur }`, and the `SOLUTIONS_3` / `SCENES_N` export | animated solution, a pure function of (step, p) |

Tests: `tests/challenge-puzzles2.test.mjs` (independent check of the maths), `tests/challenges-variants.test.mjs`
(every challenge must have all layers; add the id to its lists if it enumerates them), `tests/browser.py`
(`CHALLENGES` list and a click check).

Rules (from `HANDOFF.md` conventions of 15 October): the page shows the statement only; anything revealing a method is
a hint action; hint 1 brings closer, hint 2 nearly gives it away; every computed answer verified by an independent
method in a test.

Then follow `release.md`.
