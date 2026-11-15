---
name: maths-explorer-challenge
description: Turn a maths problem into a finished Maths Explorer challenge (the "Défis" collection, page #challenges/ID) - a playable interactive page delivered as an Artifact in the FIRST answer, with a checked numerical version, the original open question, a hands-on activity with cartoon characters and an ANIMATED cartoon solution, plus (in the repository) a drop-in folder site/js/challenges/ID/, an independent test and the registration edits. Use it whenever an agent is handed a problem, puzzle, riddle or olympiad exercise "for the challenges", "pour les défis", "to add to the collection", or a standalone interactive prototype of one to port, or is asked to build or redo a challenge, even if the request only says "make this interactive for the site".
---

# Maths Explorer challenge

Input: one problem (statement in any language, sometimes a source and an answer), or a standalone prototype page of
it (like `assets/examples/`). Output: a challenge the owner can **play at once**, and that the site loads with one
import line.

## Two things the owner must never have to ask for again (15 November 2026)

1. **The first answer delivers the playable page, published as an Artifact.** Not a plan, not code in the chat, not
   files without a page, not "here is how it could look". If something is missing, deliver the page with what is
   known and say what is missing in two lines. Questions come after the page, never instead of it.
2. **The solution is animated.** It is played by the solution player (Play, Pause, Previous, Next, captions) and
   **every step moves**: characters walk, reach, turn, objects travel, quantities grow while the caption explains.
   A still drawing per step, a slideshow of static frames, a written explanation with a figure, or a single moving
   step is not an animated solution. The self-check and `check.mjs` fail any step whose start and end frames are the
   same.

Both are checked in the delivery checklist at the end of this file, before every reply.

## Pick the mode

| You have | Mode | Deliverable of the first answer |
|---|---|---|
| a checkout of Maths-explorer or Matematika (`site/js/challenges/` exists) | **Repository** | the challenge folder, its test, `check.mjs` passing, and the preview page published as an Artifact; then the pull request |
| no repository (a chat, claude.ai, a sandbox without the site) | **Standalone** | one page made from `assets/standalone/challenge.html`, published as an Artifact, its Self-check passing |

A standalone page is not a lesser deliverable: its source blocks are the repository files, and `scripts/split.mjs`
writes them into the repository unchanged later.

Read before starting (short): `references/design.md` (the style: cartoon characters, an interaction that shows how
the problem works, the insight earned by the right experiment, the animated solution, the minimum level of detail),
`references/contract.md` (exact exports) and `references/rules.md` (owner rules, quality bar). In Repository mode,
also `site/js/challenges/CLAUDE.md`.

## Workflow (both modes)

1. **Solve first.** Find the answer, a proof, and the idea a high-school student can follow. Compute the answer by
   two independent methods (formula and brute force, or search). If you cannot prove it, say so: no unverified
   challenge goes in. Provenance goes in the PR text, never on the page.
2. **Choose the checkable version.** The site checks one integer `>= 0`. Pick 1 to 3 parameters (`int` or `choice`)
   whose every combination gives a well-posed statement; the defaults give the card statement. If some cases have no
   solution, `0` means impossible and `variant.impossible = true`. Keep the open question for `original(q)`.
   Proof problems need a numerical version (`references/design.md` section 4).
3. **Design** (`references/design.md`): the world and its cartoon characters; the activity (rules simulated, the
   learner's choices, neutral tools, the experiment that reveals the idea, nothing that names it); the **solution
   storyboard**: 4 to 8 steps, for each step one caption AND the motion that happens during it (who moves, from where
   to where); the emblem.
4. **Build** from the template (the handshakes challenge: detailed people with jointed limbs, eyes that look and
   blink, expressions, speech bubbles, a table; alive in the activity; a `scene` solution that moves in every step).
   It is the minimum standard of detail (`references/design.md` section 3b). Keep the export shapes, the
   build-once, pose-per-frame pattern, and frames as pure functions of (step, p).
   - Repository: `node .claude/skills/maths-explorer-challenge/scripts/new.mjs <id>` creates the folder and the test.
     Write `maths.js` and the test first, then `index.js`, `activity.js`, `solution.js` (and `plan.js` or `art.js`).
   - Standalone: copy `assets/standalone/challenge.html` (one page, 117 KB, no download). Edit only the blocks
     `<script type="text/plain" data-path="js/challenges/handshakes/...">`: rename the folder in their `data-path`
     (and in the `card.id`), rewrite each block as the file it is. Leave the `common/` and `math.js` blocks as they
     are; a new shared helper goes in a new block `js/challenges/common/<name>.js`. Add a block for each new file of
     the folder; a block is imported by its relative path, like a file.
5. **Check.**
   - Repository: `check.mjs <id> --shots <dir>` (contract, every parameter combination, text rules, then in Chromium:
     activity draws, every solution step drawn and moving, answer accepted, no console error, no overflow at
     390 px) and `node --test tests/<id>.test.mjs`. Look at the screenshots.
   - Standalone: open the page and press **Self-check** (the same browser checks, run inside the page) and
     **Solution ▶** (watch it play from the first step to the last). If you cannot open a browser, say so.
6. **Deliver the Artifact** (first answer, both modes): Repository mode publishes
   `preview.mjs <id> --lite --out <dir>/<id>.html`; Standalone mode publishes the edited page.
7. **Repository only, then**: the registration edits (`references/integration.md`), `make site`, the checks, branch
   and pull request (`assets/PR_TEMPLATE.md`), and the same challenge in Matematika in the same round. A standalone page
   reaches the repository with `split.mjs <page.html>`, then the same registration edits.

## Scripts (Repository mode; Node 18+)

| Script | Does |
|---|---|
| `scripts/new.mjs <id>` | creates `site/js/challenges/<id>/` (index, maths, activity, solution, plan) and `tests/<id>.test.mjs` from `assets/template/` (refuses to overwrite) |
| `scripts/check.mjs <id> [--shots dir] [--no-browser]` | contract, all parameter combinations, giveaway controls (warning), text rules (dashes, jargon list of `tests/challenge-jargon.test.mjs`, no URLs), imports; then Chromium (Playwright): activity draws, every solution step drawn **and moving**, answer accepted, no console error, no overflow at 390 px |
| `scripts/preview.mjs <id> [--out file] [--lite]` | one self-contained page reproducing the challenge page, with toolbar buttons Solution ▶, Self-check, language, theme, reduced motion; every source file is a readable block; `--lite`: no web fonts, only the styles a challenge page uses |
| `scripts/split.mjs <page.html> [--dry] [--shared]` | writes the blocks of a standalone page back into `site/js/...` (the challenge folder; shared files only with `--shared`) |

`assets/standalone/challenge.html` is `preview.mjs handshakes --lite`; regenerate it when the template challenge or the
shared kit changes.

## Delivery checklist (before every reply)

- [ ] An Artifact is published in THIS answer, and it plays (no console error; Self-check or `check.mjs` passes).
- [ ] Solution ▶ plays every step, and something moves in every step (no still step, no static slideshow).
- [ ] The characters are at the template's level of detail; the activity reacts to every action.
- [ ] The answer is verified by two independent methods; the checked version is an integer `>= 0`.
- [ ] Both languages, no em or en dash, no hint or method in the activity.
- [ ] The reply gives the Artifact first, then in a few lines: the checked question and answer, what the learner does,
  the solution steps, and anything not done.
