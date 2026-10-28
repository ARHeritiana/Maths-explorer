# tests/: index

Gotcha: most Node tests import the `dist/js/` copies, so run `make site` before `npm test` or they test the old code. Without `pdflatex` `make site` stops at the slides job when `scripts/build-slides.py`, `content/slides/` or a course source changed: see `build/mxbuild/CLAUDE.md`.

Fast loop for a site change: `make site && npm run check && npm test` (then `npm run test:dom`).
Full pre-push suite: `make check FAST=1` (list in `build/mxbuild/pipeline.py` `CHECKS`); browser suites need Playwright.
Run only the test of the module you changed: `node --test tests/<name>.test.mjs`.

| Test | Covers |
|---|---|
| `home.test.mjs` | Neutral homepage, valid tool destinations, accent and synonym searches, empty results, escaping and language variants |
| `challenge-backlog.test.mjs` | Knight graph/tour validation and bounded search; exhaustive Eulerian multigraph trails; BigInt factorial valuations and arbitrary-base zeros independently checked against direct factorials |
| `math.test.mjs` | `math.js`, lab definitions in `content.js` |
| `lab-engine.test.mjs` | laboratory v2: registry (fourteen experiments, seven templates), mission rules (control count, `set` keys, predict first, explain last), strings (pairs, no dashes, decimal comma), finite scenes, every `check` answer recomputed independently (fourteen), the shared 3D camera (`camera3d.js`: round trips, view ray, constraints, pitch clamp), constrained 3D handles, the pure models of `line`, `exponential`, `cobweb`, `matrix` and `space-lines` (plane polygon, clipping, intersection, projection), goals reachable, handles, pure models including the seeded simulation statistics, every `#lab/` link in the site, pathways and manifest resolves, honest labelling (≈ for a rounded value, = for an exact one: `format.js`) |
| `lab-links.test.mjs` | lab references (Phase 3): the one resolver `resolveRef`, every manifest `labs` reference and every slide `type: 'lab'` widget (WIDGETS table, built decks, authored decks) resolves, every experiment is reachable from a chapter, the old widget types are gone from the decks, the self-contained export carries the laboratory code and it runs, the player import map reaches `js/lab/` |
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
| `basics-addition.test.mjs` | the published addition and carrying Basics lesson, linked route, display hooks and exact regrouped sums in bases 2 to 16 |
| `basics-language.test.mjs` | Both Foundation languages, iframe locale, independent English arithmetic and source-publication parity |
| `basics-interactions.test.mjs` | Both foundation editions: all-base place-value capacity, keyboard 3D camera, theme redraw and cancellation of a delayed carry after reset, with real lesson scripts under DOM events |
| `basics-subtraction.test.mjs` | the published borrowing Basics lesson, its route and display hooks, and exact subtraction with chained borrows in bases 2 to 16 |
| `course-content.test.mjs`, `sequence.test.mjs` | revised course decks (tasks, hints, corrections) and `sequence-model.js` |
| `resources.test.mjs`, `enrichment.test.mjs`, `sources.test.mjs` | library, study guides, enrichment data, published sources |
| `quadratic-workshop.test.mjs` | `quadratic-workshop.js` |
| `map.test.mjs` | `MAP.md` and the folder `CLAUDE.md` indexes stay complete and correct |
| `dom-smoke.mjs` | DOM integration under jsdom (`npm run test:dom`): Platonic folds, every experiment mounted (no element added during a drag or a run, fixed camera, plain wheel never zooms, background drag pans only once zoomed, free missions and the `gated` mode, keyboard), the old guided page gone, gallery routes |
| `accessibility_browser.py` | home and every pilot chapter step at 320, 390, 768 and 1440 px with normal and doubled text, both theme contrast, keyboard/skip navigation, inline lab handles, asynchronous load announcements and semantic MathML (`browser.py` calls it; also runnable alone) |
| `browser.py`, `run_browser.py` | Playwright checks of the fourteen experiments walked mission by mission, gallery, challenges, pathways (`npm run test:browser`); `run_browser.py` also runs `lab_browser.py` |
| `lab_browser.py` | Playwright checks of the fourteen experiments: a handle drag, a run or a rotation of the 3D view adds or removes no element (MutationObserver), no horizontal overflow at 320 px, canvas and mission sheet never overlap at 390 x 844 and 320 x 640, pointer policy (plain wheel scrolls the page, a near miss grabs the point, Ctrl + wheel and the zoom buttons, grid fills the panel when zoomed out), free exploration, both themes, missions, keyboard |
| `slides_lab_browser.py` | Playwright: a deck with a lab widget in the player and in the self-contained export (mount in the widget host, controls, stepper, readout and prompt in the player's areas, MathJax-typeset text, handle drag adds no element, N and P only with canvas focus, arrow keys stay the player's, destroyed when leaving); a chapter page mounts its first lab reference inline, lazily, with one link per reference, destroyed on navigation (run by `run_browser.py` after `lab_browser.py`) |
| `slides_check.py`, `slides_export_check.py`, `slides_smoke.py` | decks vs drafts, HTML exports, every deck in Chromium |
| `banned.py`, `banned.mjs`, `banned-sha256.json` | banned names (hashed), links, e-mail addresses |
| `privacy_scan.py`, `test_privacy_scan.py` | complete published PDF/text inventory; filenames, PDF text, Info metadata, XMP, outlines, links, annotations, form fields, attachment review and visible notices; adversarial PDF fixtures and private-report handling |
| `twin_parity.py`, `test_twin.py`, `pdf_parity.py`, `tex_lint.py`, `test_notation.py`, `test_enrichment.py` | TeX system: twins, PDF editions, unit lint, notation, enrichment converter |
| `test_content_dependencies.py` | dependency invalidation of `mxbuild.refresh` |
| `count_claims.py` | counts written in prose match the content |
| `verify-arithmetic.py`, `verify-quadratic.py` | independent maths checks of two courses |

| `gallery-discovery.test.mjs` | independent Voronoi, cycloid, film-area, hat and knot-invariant checks |
| `gallery-discovery-dom.test.mjs` | five exhibits, live inputs, bilingual readouts and lifecycle cleanup |

| `gallery-four-colour.test.mjs` | four colour exhibit: shared-border adjacency, exact example minima (including disconnected K5), random-map colourings, repeated splits preserving area and disjoint interiors |
| `gallery-four-colour-dom.test.mjs` | bilingual example menu, grouped-country colours, border drawing and undo, keyboard editor, conflict detection, cancelled pointer/pinch and frame cleanup |
| `interaction-surfaces.test.mjs` | formula-only arithmetic, direct cookie transfers and identity-independent counts, mobile text scroll policy, continuous sampling clock and motion |
| `direct-interactions.test.mjs` | analytic fly motion versus independent collision stepping (including very fast flies), custom tuples, spatial crossing-cue geometry, preview-style front/under strand rendering, direct jug actions and scene playback/scrubbing, callback motion preferences, animated peg frames, train-face contacts, hidden fly totals, ordered nail crossings and reverse-stroke cancellation |
| `reading.test.mjs` | "Lire": texts bilingual without dashes, every link resolves and is shown both ways; Game of Life periods and lifetimes, square packings and overlap test, gauss-sum formula, the Hanoi legend numbers, by independent methods |
| `reading-dom.test.mjs` | the five new curiosities (life, square packing, sofa, inscribed square, opaque square) and the gauss-sum activity under jsdom: controls, drawing, keyboard, finite readouts, frames stopped |
| `gallery-puzzles.test.mjs` | moving sofa (Hammersley area, motion fits, bigger copy fails; Gerver's constants solve Romik's equations, area 2.21953, motion fits; half disc, Hammersley and Gerver taken round by simulated keys; a long rectangle stays stuck), random curves, inscribed squares (triangles 3 and 1 with side ah/(a + h), ellipse, results are squares on the curve), opaque square (preset lengths, gaps against a line-by-line test, Cauchy means) |
| `gallery-spatial.test.mjs` | all 44 curve projections, continuous deformations, 14 film models and full-window hat coverage |


`fourier.test.mjs`: continuous coefficient quadrature, direct error integrals, finite DFT inversion, sample Parseval, aliasing, Fejér bounds and Fejér bounds. `fourier-links.test.mjs` checks reciprocal entry points and local lesson assets.

| `resource-editions.test.mjs`, `test_resource_editions.py` | French-only, English-only and bilingual fixtures: measured metadata, filtering, chapter downloads, unavailable pack items and no language substitution |

`inference.test.mjs`: independent exact enumeration of secretary stopping, tank estimator moments and confidence coverage, Benford digits, iid Gaussian inference calibration, birthday collision distributions and explicit Monty host rules.

`discovery.test.mjs`: overlapping taxonomy, canonical deduplication, exact counts, accent-insensitive combined filters, reciprocal recommendations, content addition/removal invariants, named preview and gallery-alias coverage, honest unknown-model fallbacks, static SVG bounds and independent plotted-geometry benchmarks.

`pilot.test.mjs`: exact polynomial equivalence across quadratic input forms, independent six-case selectors,
honest rounding, shared-slide control visibility, root-mode fallback, slider range updates, camera independence and cleanup.

| `fair-division.test.mjs` | independent quadrature, full enumeration of discrete allocations, cut-and-choose guarantees, EF1 and editable lab controls |

`inference-dom.test.mjs`: six inference surfaces in both languages, hidden information, choices and reveals, input validation, seeded populations, sample growth with reduced motion, reciprocal content paths and navigation cleanup through the shared laboratory mount.

`illumination.test.mjs`: independent reflection invariants, exact curve intersections, ellipse focal property, boundary validation, unfolding collinearity and original preset geometry.

`challenge-backlog-dom.test.mjs`: actual knight pointer/keyboard/touch events with drag-click suppression and undo; room traversal/editing with fixed-size hit strokes; factorial hint gating and large exact integer form validation.

`test_slide_editions.py`: actual slide source extraction, measured available editions, independent sequence lengths and figure selection for French-only, English-only and bilingual fixtures, plus lecture source selection and SVG-driven lecture figure cache invalidation. `slide-editions.test.mjs`: actual player rendering and unavailable-language behavior with independent edition counts.

`gomboc.test.mjs`: full graph/hash/volume invariants, support against independent all-vertex searches, local equilibrium potential, analytic freeflight and time-step convergence, collision nonpenetration/dissipation and honest linked explanations.

`dynamics.test.mjs`: independently differentiated pendulum energy, viscous dissipation, harmonic-solver benchmark, tolerance convergence, force balance, conserved gravitational moments, figure-eight return, explicit near-collision halt, logistic cycles/windows and invariant domain.

`backlog-lab-fixtures.mjs`: independent benchmark answers, prediction evidence and reachable-state witnesses for the new guided labs; consumed by the complete lab-engine contract suite.

`topology-audit.test.mjs`: independent tangent/zero checks, seam and normal identifications, quotient cutting invariants at several resolutions and exhaustive finite-atom conservation audit.

`pack-missing-parts.test.mjs`: actual pack-form selection with an absent chapter/part combination, explicit warning and blocked downloads until the selection becomes complete.

`history.test.mjs`: sourced chronological records, documentary dates, filtering, detail links and reciprocal timeline navigation.

`history_browser.py`: FR/EN atlas and reading geometry, both themes, normal/doubled text, hidden-to-visible relayout, background pan, keyboard, first-click search navigation and local image attribution; included in `run_browser.py`.

`solution-player.test.mjs`: repeated parameter remounts keep playback events on the current solution and never repaint discarded diagrams.
