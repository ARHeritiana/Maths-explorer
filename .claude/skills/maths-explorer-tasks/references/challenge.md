# Recipe: a challenge

Everything about a challenge is in one folder, `site/js/challenges/<id>/`. Read `site/js/challenges/CLAUDE.md`
(short: the role of each file and of `site/js/challenges/common/`), then open only that folder.

Change an existing challenge: edit the file of the part you change (`index.js` for text, variations, original
question and emblem; `maths.js`, `activity.js`, `solution.js` for the rest). Nothing outside the folder.
For shared parameter presentation, edit `site/js/app.js` (`variationPanel`, `bindChallenges`) and
`site/js/challenges/registry.js` (`normalise`): choices use compact selects inside a folded settings panel;
optional tuple `fields` allow bounded custom numbers with explicit validation. Integration coverage is in
`tests/dom-smoke.mjs`, `tests/direct-interactions.test.mjs` and `tests/browser.py`.

Add a challenge: use the skill `maths-explorer-challenge` (`.claude/skills/maths-explorer-challenge/SKILL.md`). It
holds the export contract, the owner rules, a working template (`scripts/new.mjs <id>`), a contract and browser check
(`scripts/check.mjs <id>`), a one-file preview for review (`scripts/preview.mjs <id>`) and the five registration
edits.

Then follow `release.md`.

Shared solution playback and remount lifecycle: `site/js/challenges/common/player.js`, with `tests/solution-player.test.mjs`. Bind controls to the generated player so replacing variation data cannot leave handlers on the persistent host.

**Owner rule (13 November 2026): no hints in the UI.** The challenge page shows no hint panel; do not add `hints` or `hintActions` to a new challenge. The display, controls and copy must not point to the method; the animated solution does the teaching (high-school level, no group theory, cartoon-like).
