# Workstream H: provenance audit (JavaLab, Mathoutils)

Date: 31 October 2026. Search: `git grep -i -E "javalab|java lab|mathoutils|math outils"` over `site/`, `content/`, `docs/` (not `docs/history`, `docs/LOG.md`), README, LICENSE*, `scripts/`, `tests/`.

## Hits and action

| File | Lines | Class | Action |
|---|---|---|---|
| `site/js/resource-library.js` | 48 (resource-origin block) | Public-facing credit and links | Removed the "Inspiration" paragraph and both links |
| `docs/VISUAL_LEARNING.md` | 3 | Public-facing claim in a doc ("reference sites were reviewed") | Sentence removed |
| `docs/ACTIVE_WORKSTREAMS.md` | 16 | Task description, private-ish | Kept (it is the task register) |

No hit in tests, scripts, content, README or LICENSE. `dist/js/resource-library.js` is generated and was left alone (`make site` regenerates it).

## Copied-material check

No text, code or asset in the searched files is marked as copied from either site, and no test asserts them. The grep cannot detect unattributed copying, though. Items an owner or reviewer should check by comparison against the live Mathoutils/JavaLab pages:

| File | What looks derived | Rewrite plan |
|---|---|---|
| `site/js/chapter-sequence.js`, `learning-content.js`, `visual-lessons.js` (chapter tabs understand / experiment / practice) | The lesson, experiment, exercise structure was described as "inspired by Mathoutils lesson-exercise pathways". This is a structure, not text, and no copied wording was found by name. | Owner decision: if only the structure is shared, no action. If any companion guide or exercise wording was taken from Mathoutils, rewrite from the course PDFs and first principles, record provenance in the private repository, and verify the mathematics. |
| Visual models (26 parameterised models) | Described as inspired by JavaLab simulations; the old doc said no code or assets were imported. | Compare model by model with JavaLab; replace any close reproduction with an original construction. |

No line-level evidence of copying was found, so nothing was left unstripped for that reason. This file records the open verification step.

## Second round (31 October 2026)

- Re-run of the search over `site/`, `content/`, `scripts/`, `build/`, README, licences and the built `dist/`: no hit, so the
  public credit and links stay removed. `tests/attribution.test.mjs` now fails if either name reappears there.
- Copy check against the live pages was **not possible**: `mathoutils.com` and `javalab.org` are not reachable from this
  environment (no HTTP response through the proxy). No claim of originality can therefore be made by comparison. What can be
  said: the 26 visual models and the lesson, experiment, exercise tabs are standard constructions (parabola, secant and
  tangent, Riemann sums, unit circle and so on) with French text written for this site; no line of text or code is marked or
  was found to be copied. The structure of the chapter page has since been replaced (four destinations, 31 October).
- Still open for the owner: if any companion guide or exercise wording was taken from either site, name it so that it can be
  rewritten from the course PDFs, the provenance kept in the private repository, and the mathematics verified.
