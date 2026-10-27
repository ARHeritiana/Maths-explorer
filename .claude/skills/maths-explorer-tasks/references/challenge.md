# Recipe: a challenge

Everything about a challenge is in one folder, `site/js/challenges/<id>/`. Read `site/js/challenges/CLAUDE.md`
(short: the role of each file and of `site/js/challenges/common/`), then open only that folder.

Change an existing challenge: edit the file of the part you change (`index.js` for text, variations, original
question, emblem and hint buttons; `maths.js`, `activity.js`, `solution.js` for the rest). Nothing outside the folder.
For shared parameter presentation, edit `site/js/app.js` (`variationPanel`, `bindChallenges`) and
`site/js/challenges/registry.js` (`normalise`): choices use compact selects inside a folded settings panel;
optional tuple `fields` allow bounded custom numbers with explicit validation. Integration coverage is in
`tests/dom-smoke.mjs`, `tests/direct-interactions.test.mjs` and `tests/browser.py`.

Add a challenge:
1. Copy `site/js/challenges/pegs/` (the latest complete example) to `site/js/challenges/<id>/` and rewrite each file:
   - `index.js`: `card` (id, type, title, topic, difficulty, minutes, hints, extension), `variant` (params, answer,
     prompt, hints, solution; defaults give the statement shown on the card), `original` (never states the answer or
     the method), `icon`, `hintActions`.
   - `maths.js`: pure functions. `activity.js`: the hands-on canvas. `solution.js`: `diagram` (captions and frames),
     optionally `scene`.
2. `site/js/challenges/registry.js`: one import line and one entry in `CHALLENGES` (its place sets the card order).
3. Tests: the maths by an independent method (`tests/challenge-puzzles2.test.mjs` or a new test file),
   `tests/challenges-variants.test.mjs` (checks every layer of every challenge), `tests/browser.py` (`CHALLENGES`).

Rules (`HANDOFF.md` conventions of 15 October): the page shows the statement only; anything revealing a method is a
hint action; hint 1 brings closer, hint 2 nearly gives it away; every computed answer verified by an independent method.

Then follow `release.md`.

Shared solution playback and remount lifecycle: `site/js/challenges/common/player.js`, with `tests/solution-player.test.mjs`. Bind controls to the generated player so replacing variation data cannot leave handlers on the persistent host.
