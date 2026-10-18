# tests/: index

Gotcha: most Node tests import the `dist/js/` copies, so run `make site` before `npm test` or they test the old code.

Fast loop for a site change: `make site && npm run check && npm test` (then `npm run test:dom`).
Full pre-push suite: `make check FAST=1` (list in `build/mxbuild/pipeline.py` `CHECKS`); browser suites need Playwright.
Run only the test of the module you changed: `node --test tests/<name>.test.mjs`.

| Test | Covers |
|---|---|
| `math.test.mjs` | `math.js`, lab definitions in `content.js` |
| `lab-engine.test.mjs` | laboratory v2: registry (nine experiments, six templates), mission rules (control count, `set` keys, predict first, explain last), strings (pairs, no dashes, decimal comma), finite scenes, every `check` answer recomputed independently, goals reachable, handles, pure models including the seeded simulation statistics, every `#lab/` link in the site, pathways and manifest resolves |
| `audit.test.mjs` | audited edge cases of `math.js` (roots, secants, Riemann bounds) |
| `lab-handles.test.mjs` | the handles of every experiment: grid snapping, clamping, one named quantity changes, far drags stay finite |
| `trigonometry.test.mjs` | `site/js/lab/models/trig.js` and the circle and curve of the trig experiment |
| `lab-objects.test.mjs` | `lab-objects.js` pure maths |
| `explorer-models.test.mjs` | `canvas-navigation.js`, `lab-objects.js`, `platonic-fold.js` |
| `gallery-math.test.mjs`, `gallery-controls.test.mjs` | `gallery-math.js`, `gallery-objects.js` |
| `challenge-puzzles.test.mjs`, `challenge-puzzles2.test.mjs` | pure challenge maths, by an independent method |
| `challenges-variants.test.mjs` | every challenge has variant, original, activity, solution; answers recomputed |
| `cake-model.test.mjs`, `box-model.test.mjs` | cake and box sandboxes |
| `control-policy.test.mjs` | `control-policy.js`, `content-language.js`, camera policy, slide widgets |
| `player-controls.test.mjs`, `slide-format.test.mjs`, `slide-builder.test.mjs`, `expertes-widgets.test.mjs` | slide player, widget formatting, `scripts/build-slides.py`, Maths expertes widgets |
| `university.test.mjs`, `university-slides.test.mjs` | `university.js`, `university-model.js`, university decks |
| `learning.test.mjs` | `learning-content.js`, `visual-lessons.js`, chapter pages |
| `course-content.test.mjs`, `sequence.test.mjs` | revised course decks (tasks, hints, corrections) and `sequence-model.js` |
| `resources.test.mjs`, `enrichment.test.mjs`, `sources.test.mjs` | library, study guides, enrichment data, published sources |
| `quadratic-workshop.test.mjs` | `quadratic-workshop.js` |
| `map.test.mjs` | `MAP.md` and the folder `CLAUDE.md` indexes stay complete and correct |
| `dom-smoke.mjs` | DOM integration under jsdom (`npm run test:dom`): Platonic folds, every experiment mounted (no element added during a drag or a run, fixed camera, missions, keyboard, predictions hide controls), the old guided page gone, gallery routes |
| `browser.py`, `run_browser.py` | Playwright checks of the nine experiments walked mission by mission, gallery, challenges, pathways (`npm run test:browser`); `run_browser.py` also runs `lab_browser.py` |
| `lab_browser.py` | Playwright checks of the nine experiments: a handle drag or a run adds or removes no element (MutationObserver), no horizontal overflow at 320 px, canvas and mission sheet never overlap at 390 x 844 and 320 x 640, locked controls hidden in predictions, both themes, missions, keyboard |
| `slides_check.py`, `slides_export_check.py`, `slides_smoke.py` | decks vs drafts, HTML exports, every deck in Chromium |
| `banned.py`, `banned.mjs`, `banned-sha256.json` | banned names (hashed), links, e-mail addresses |
| `twin_parity.py`, `test_twin.py`, `pdf_parity.py`, `tex_lint.py`, `test_notation.py`, `test_enrichment.py` | TeX system: twins, PDF editions, unit lint, notation, enrichment converter |
| `test_content_dependencies.py` | dependency invalidation of `mxbuild.refresh` |
| `count_claims.py` | counts written in prose match the content |
| `verify-arithmetic.py`, `verify-quadratic.py` | independent maths checks of two courses |

| `gallery-discovery.test.mjs` | independent Voronoi, cycloid, film-area, hat and knot-invariant checks |
| `gallery-discovery-dom.test.mjs` | five exhibits, live inputs, bilingual readouts and lifecycle cleanup |

| `gallery-spatial.test.mjs` | all 44 curve projections, continuous deformations, 14 film models and full-window hat coverage |
