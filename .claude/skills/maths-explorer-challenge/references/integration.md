# Integration: the edits that register a challenge

The folder and its test work before these edits (`check.mjs`, `node --test tests/<id>.test.mjs`). These edits make
the site and the shared tests see it. Do them in one commit with the folder.

| # | File | Edit |
|---|---|---|
| 1 | `site/js/challenges/registry.js` | `import * as <name> from "./<id>/index.js";` with the other imports (`<name>` is the id in camelCase), and `<name>` in `CHALLENGES` at the place where the card should appear (the owner may choose; default: the end) |
| 2 | `site/js/topic-registry.js` | add `<id>` to the `concepts` string of the right subtopic (for example `discrete/counting`, `geometry/plane`, `foundations/reasoning`); if no subtopic fits, an entry `['#challenges/<id>', ['<topic>/<subtopic>']]` in `PLACEMENTS`. `tests/discovery.test.mjs` fails a challenge placed only by the fallback |
| 3 | `tests/browser.py` | append `'<id>'` to the last `CHALLENGES +=` line and its default answer to `CHALLENGE_ANSWERS +=` (same position) |
| 4 | `tests/CLAUDE.md` | one row for `<id>.test.mjs` saying what it checks and by which independent method |
| 5 | `site/js/challenges/CLAUDE.md` | one dated line if the folder has `art.js`, `plan.js` or another extra module, or if you added a helper to `common/` (every file of `common/` must be named there, or `tests/map.test.mjs` fails) |

Then:

```sh
make site                         # copies site/ to dist/ and regenerates the import maps (site/index.html is generated: never edit it)
npm run check && npm test         # includes challenges-variants, challenge-jargon, discovery, math, map tests
npm run test:dom
npm start &                       # serves dist/ on :4173, then:
python tests/run_browser.py       # when the pipeline allows; else say it was not run
```

`tests/challenges-variants.test.mjs` recomputes the answers of the older challenges by hand; a new challenge is
covered there by the generic checks and by its own `tests/<id>.test.mjs`, so it needs no edit.

## Pull request

Branch and pull request as the root `CLAUDE.md` git rule says (never push to `main`). Text: `assets/PR_TEMPLATE.md`.
Merge only when "Website checks" (`check`, `browser`) is green, and only if the owner did not ask to review first.

## Matematika

Matematika must never lack anything this site has: open the same challenge there in its own branch and pull request
in the same round (apply the folder and the five edits where they fit, `make site` there, its checks). Never copy
`dist/` between the two repositories. If this session cannot reach Matematika, say so in the PR and the final report.

## Receiving a challenge (from another agent, or from a page made without the repository)

The delivery is a page (format A) or a bundle (format B), see `AGENT_BRIEF.md`. For each repository:

1. `node .claude/skills/maths-explorer-challenge/scripts/split.mjs <delivery> --dry` lists what it would write; run it
   again without `--dry`. In Matematika: `--site /path/to/matematika/site`. Shared files (`common/`, `math.js`) that
   differ are reported and not written; read the difference, and use `--shared` only for a deliberate new helper
   (then name it in `site/js/challenges/CLAUDE.md`).
2. `check.mjs <id> --shots <dir>`. Typical faults from other agents: a file name outside the allowed list (only
   index, maths, activity, solution, art, plan; rename), a bare import (`import ... from "lodash"`), an answer that is
   not a whole number for some parameters, text with dashes or jargon, a frame that depends on time. Fix small things;
   send the rest back with the check's messages.
3. Verify the mathematics: read `maths.js`, run `node --test tests/<id>.test.mjs`, and make sure the test is truly
   independent (not a copy of `maths.js`); write it if it is missing or weak.
4. Look at the screenshots and play `preview.mjs <id>`: characters at the template's level, an activity that shows the
   problem without giving the method, a solution that explains (animated where it helps).
5. The five registration edits above, then `make site`, `npm run check && npm test`, `npm run test:dom`, the browser
   checks, and the pull request. Then the same in the other repository, in the same round.

## Delivering without integrating

If the request is only to *prepare* the challenge (owner review first), still make all five edits: `tests/map.test.mjs`
fails on a folder that `registry.js` does not import, so an unregistered folder cannot sit in the repository. Put the
work on its branch, open the pull request, publish the preview as an Artifact, write "owner review requested" in the
PR, and do not merge. Without a checkout to push to, hand over the folder, the test and these five edits as a patch
(`git diff` or `git format-patch` against `main`) together with the preview.
