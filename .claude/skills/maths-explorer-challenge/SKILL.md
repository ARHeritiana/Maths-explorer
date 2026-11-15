---
name: maths-explorer-challenge
description: Turn a maths problem into a finished Maths Explorer challenge (the "Défis" collection, page #challenges/ID) - a drop-in folder site/js/challenges/ID/ with a checked numerical version and its parameters, the original open question, a hands-on activity, an animated cartoon solution and a card emblem, plus an independent test, a one-file interactive preview for review, and the registration edits. Use it whenever an agent is handed a problem, puzzle, riddle or olympiad exercise "for the challenges", "pour les défis", "to add to the collection", or a standalone interactive prototype of one to port, or is asked to build or redo a challenge, even if the request only says "make this interactive for the site".
---

# Maths Explorer challenge

Input: one problem (statement in any language, sometimes a source and an answer), or a standalone prototype page of
it (like `assets/examples/`). Output: a challenge that the site
loads with **one import line**, verified mathematically and in a browser. Work in a checkout of this repository: the
challenge builds on `site/js/challenges/common/`, and the scripts below read `site/`.

Read before starting (short): `site/js/challenges/CLAUDE.md` (files of a folder, shared kit), then
`references/design.md` (the style: cartoon characters, an interaction that shows how the problem works, the insight
earned by the right experiment; three example prototypes), `references/contract.md` (exact exports) and
`references/rules.md` (owner rules, quality bar). Open one existing
folder only if you need a pattern the template lacks (index in `references/contract.md` section 6).

## Deliverable

| Piece | Where | What makes it easy to integrate |
|---|---|---|
| challenge folder | `site/js/challenges/<id>/` (`index.js`, `maths.js`, `activity.js`, `solution.js`, optional `art.js`) | self-contained; imports only `../common/` and its own files |
| independent test | `tests/<id>.test.mjs` | recomputes every answer by another method over the whole parameter range |
| review page | `<id>-preview.html` (scratchpad), published as an Artifact when the owner reviews | one file, site CSS and fonts inlined, same markup as the real page |
| registration | the edits in `references/integration.md` | five small edits, listed with their exact lines |
| pull request | branch + PR, text from `assets/PR_TEMPLATE.md` | changes, verification, rollback note, design note |

## Workflow

1. **Solve first, on paper.** Find the answer, a proof, and the idea a high-school student can follow. Compute the
   answer by two independent methods (formula and brute force, or search). If you cannot prove it, say so and stop:
   no unverified challenge goes in. State the source and provenance in the PR text only, never on the page.
2. **Choose the checkable version.** The site checks one integer `>= 0` (fractions are accepted by the form but the
   tests expect integers). Pick 1 to 3 parameters (`int` or `choice`) whose every combination gives a well-posed
   statement; the defaults give the card statement. If some cases have no solution, `0` means impossible and
   `variant.impossible = true`. Keep the open question (prove, construct, find a strategy) for `original(q)`.
3. **Design before code** (`references/design.md`; write the result into the PR's design note):
   - The world and its characters: who or what moves (ants, a hiker, a spoon), drawn as cartoon characters.
   - Activity: the rules simulated faithfully, the learner making the choices the question ranges over, neutral
     tools only. Name the experiment that reveals the idea; check that it is natural to try and that nothing on
     screen names or performs it.
   - Solution storyboard: 4 to 8 steps in the same world, the decisive observation shown on the characters, symbols
     last, the answer in the last step.
   - Emblem: a 64 by 64 line drawing of the situation.
   For a prototype to port, also follow `references/design.md` section 5.
4. **Scaffold**: `node .claude/skills/maths-explorer-challenge/scripts/new.mjs <id>` creates the folder and the test
   from a working template (handshakes): detailed cartoon people (`art.js`: limbs with joints, eyes that look and
   blink, expressions, speech bubbles) around a table (`plan.js`), alive in the activity and posed in a `scene`
   solution. It is the minimum standard of detail (`references/design.md` section 3b). Rewrite every file; keep the export shapes and the build-once, pose-per-frame pattern.
5. **Write `maths.js` and the test first**, then `index.js`, `activity.js`, `solution.js`.
6. **Check**: `node .claude/skills/maths-explorer-challenge/scripts/check.mjs <id> --shots <scratchpad>/shots`, and
   `node --test tests/<id>.test.mjs`. The check works before registration. Fix every ERROR; judge every WARN. Open the
   screenshots (390 px and 1280 px, page and last solution frame) and look at them.
7. **Preview**: `node .claude/skills/maths-explorer-challenge/scripts/preview.mjs <id> --out <scratchpad>/<id>-preview.html`.
   Play it yourself in Chromium (both languages, both themes, reduced motion). Publish it as an Artifact when the
   owner wants to review before the merge, or when you deliver without merging.
8. **Integrate**: the edits of `references/integration.md`, then `make site`, `npm run check && npm test`,
   `npm run test:dom`, and the browser checks when the pipeline is available.
9. **Ship**: branch and pull request (root `CLAUDE.md` git rule), PR text from `assets/PR_TEMPLATE.md`. Matematika
   must get the same challenge in its own pull request in the same round (root `CLAUDE.md` independence rule).

## Scripts

| Script | Does | Needs |
|---|---|---|
| `scripts/new.mjs <id>` | creates `site/js/challenges/<id>/` (index, maths, activity, solution, art, plan) and `tests/<id>.test.mjs` from `assets/template/` | refuses to overwrite |
| `scripts/check.mjs <id> [--shots dir] [--no-browser]` | contract, all parameter combinations, giveaway controls in the activity (warning), owner text rules (dashes, jargon list of `tests/challenge-jargon.test.mjs`, no URLs), imports; then Chromium: activity draws, every solution step drawn, answer accepted, no console error, no overflow at 390 px | Node 18+, Playwright (pre-installed in cloud sessions) |
| `scripts/preview.mjs <id> [--out file]` | one self-contained HTML page reproducing the challenge page (language, theme and reduced-motion toggles) | Node only |

Calibration: on the 38 existing challenges `check.mjs` reports no false error; the two errors it raises are real
(`cham`: an en dash in the English solution; `factorials` with n = 0: empty solution frames).
