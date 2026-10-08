## Quadratic contribution and LaTeX update (8 October 2026)

The owner’s presentation is integrated at `#workshop/quadratic` in French and English. Exact fraction arithmetic separates identities from approximations, changing input mode preserves coefficients, and all five stages are selectable. See `QUADRATIC_CONTRIBUTION_REVIEW.md`. The new functional/mathematical tests bring the suite to 49 passing tests.

The 96 authored workshop PDFs and two new quadratic study sheets are typeset with XeLaTeX. Versioned sources, native fractions/indices/radicals, TikZ figures, a shared print theme and incremental source/style/PDF hash checks are recorded in `LATEX_BUILD.json`. Original PDF-only imports are preserved.

# Validation record

## Collection expansion and resource theme — 8 October 2026

- 12 bilingual workshops: 48 exercises and 12 synthesis problems, with explicit
  methods and worked solutions. 96 PDF and 96 HTML editions were added.
- 44 Node tests pass. New checks cover catalogue coverage, independent path
  enumeration, integer solutions, modular powers, Bayes, waiting-time means,
  telescoping thresholds, complex rotations, optimisation and root bracketing.
- DOM checks verify all 12 routes in both languages, correct PDF/HTML language
  selection, hidden teacher solutions, workshop filtering and bilingual search.
- All 574 pre-existing PDFs were restyled. The complete collection has 670 PDFs
  and 408 self-contained HTML documents. Every old PDF text sequence was
  retained, ignoring whitespace; original page counts and page sizes remain.
  Existing mathematical fonts and vector figures remain embedded.
- Representative new FR lessons and EN solutions/exercises and existing
  algebra/logarithm PDFs were rendered and inspected. Theme, hash, bilingual
  page-count and private-storage-link scans pass across the collection.
- Full browser/device QA is unavailable for this static Site's managed preview;
  DOM integration and PDF rendering do not certify browser layout or touch use.


## Transformed trigonometric graphs and English terminology — 7 October 2026

The graph view now selects x or any of eight associated-angle transformations,
independently from the sine/cosine selection. The circle's transformed point and
both graph ordinates share the same model. Cosine now has a visible projection
connection as well as sine. The axis variable is consistently x in the controls.

- 41 Node checks pass, including every graph transformation at six reference
  angles, independent sine/cosine calculations, exact negative quarter-turn
  values, and isolation of the selected functions.
- A DOM integration check covers section changes, the transformation selector,
  both displayed graph panels during playback, pause, language switching and
  callback cleanup. Three SVG scenes were rendered and visually inspected.
- All 287 French/English PDF pairs reopen with identical page counts (1,883
  pages per language). English hashes match the translation ledger; companion
  catalogue hashes and byte counts were refreshed after finalization.
- 473 existing cached translations were corrected and one isolated French word
  was newly translated. Representative English pages with vectors, powers,
  fractions, induction and logarithmic plots were rendered and inspected.
- Finalization checks all shipped PDF links, text and metadata and all client
  HTML/JavaScript/JSON for personal storage URLs. None remain. The single site
  footer notice is retained in both languages.
- No full browser/device QA was available for this plain static project; DOM
  and static render checks do not certify touch interaction or browser layout.
  The PDF work is a targeted terminology correction, not a complete human
  mathematical or editorial review.


## Chapter visuals and integration — 7 October 2026

Based on the newer published source `99ffeeaf4afe2883bbc8f35ef31b8dd7908575cd`, preserving its classified resource catalogue and downloads. The new chapter workspace adds 30 bilingual companion guides reused across 47 chapters and 26 mathematical visual models with staged construction, play/pause, step controls, timeline and parameter exploration. Playback cancels on navigation, pauses in hidden tabs and changes to manual stepping with reduced motion. Practice reasoning stays in session memory.

- Syntax, mathematical and content checks pass: **36 Node tests**, including the four existing library checks and five new companion checks. New coverage includes provenance hashes, PDF page pointers, all 47 chapter sections in both languages, finite model endpoints, quadratic roots, secant slopes, Riemann bounds, conditional probabilities, binomial normalization, regression normal equations, logarithm inversion and playback cancellation.
- 144 companion PDF references were reopened: page counts and whitespace-normalized first/last source text match. The combined revision reuses 120 existing complete/fluency PDF assets and adds 24 excerpts for preparation collections and corrected boundaries. Representative source excerpts were rendered and inspected with Poppler.
- Six representative mathematical SVG scenes were rendered with librsvg and inspected. Circle geometry uses equal coordinate scales. These are static diagram inspections, not browser UI tests.
- Existing type/language/pathway filters, 39 bilingual printable starting sheets, deep links and lab-associated resource views remain present. Teacher corrections remain behind deliberate disclosures. The newer source was opened separately before integration to preserve concurrent changes.
- **No browser or device QA was run for this revision.** The required managed-preview browser capability is unavailable for this static project. Reflow, touch, actual browser playback and assistive-technology behavior still require device verification; earlier browser results below do not verify this update.
- New guides cover central ideas and do not replace full chapter lessons. French source PDFs are not translated. Original booklet correctness and complete curriculum coverage have not been audited by this integration.

## Direct graph interaction — 7 October 2026

Started from current Sites source `cf5dbf21f7541df47a5aa3a6a82cee230c012391`.

- Added pointer capture and keyboard interaction to all nine graphs; direct manipulation snaps to each slider's bounds and step. Statistics edits the individual data value and preserves the other observations.
- Adaptive graph scales remain fixed during a pointer drag and adjust on release. Grabbing keeps the original offset; the SVG screen transform maps mouse/touch coordinates. Pointer movement is coalesced once per animation frame, and the final pending movement is applied before release.
- Active slider animations are settled/cancelled before dragging; slider values, graph and numerical results use the same state. Direction controls follow a secant dragged across its base point. The minimum nonzero secant distance is retained.
- Labeled handles have touch targets, focus indicators, progressive labels for statistics, Tab/arrow/Shift controls and bilingual instructions. Mobile navigation uses a native select. Native sliders, data input, chart tables and all learning content remain available.
- `npm run check`, `npm test` (**27 tests**) and `git diff --check`: passed. Six new test cases exercise coordinate conversion, coefficient isolation, circle quadrants, vector/complex coordinates, arithmetic/geometric interpretation, probability expectation, secant direction and nonzero distance, reciprocal partition counts, parameter clamping and snapping. Existing mathematical, content and animation tests pass.
- **No browser or real-device QA was run for this update.** The required managed-preview browser skill is unavailable, and this static Site has no compatible managed preview. Pointer capture, SVG focus preservation, touch scrolling, frame coalescing and mobile visual layout have been reviewed in source but still need browser/device validation. Earlier browser results below do not verify this revision.


## Luminous UI update — 7 October 2026

This update starts from the opened Sites source commit `b7056de598d35a166ddf89b2744dbdffa9f53103` and changes the visual system and motion, preserving mathematical content and the existing learning flows.

- `npm run check`: passed, including the new motion module.
- `npm test`: passed, **21 tests** (15 existing mathematical/content tests plus six motion tests).
- `git diff --check`: passed.
- Motion tests cover exact convergence, interruption by new input, discrete integer counts, reduced-motion/hidden-tab settling, navigation cancellation and slider-release/direct-update cancellation.
- Source checks: animation interpolates model parameters rather than independent SVG coordinates; graph and numeric results share the interpolated model; live-result announcements are held busy during motion; native slider readouts retain selected values. Existing hint/solution semantics, notes, bilingual content, static routes and print stylesheet are retained.
- **Browser/visual QA was not rerun for this UI update.** The required managed-preview browser skill is unavailable in this session, and this static project has no compatible managed development preview. Python Playwright and Manim are also absent. The browser results below document the earlier source revision, not this update. Real-device smoothness, contrast, reflow and the SVG DOM reconciliation remain browser-validation items.

## Prior audit verification

Review date: **7 October 2026**. Baseline `aeda41df506ff7e6f884ffdd1b150a4251476c61` was independently checked from an archive: original seven Node tests and original Chromium suite passed. The following records the revised implementation, not a certification of educational effectiveness or accessibility.

## Checks actually run

| Check | Result and scope |
|---|---|
| `npm run check` | Passed: application, mathematical and content module syntax. |
| `npm test` | Passed: **15 Node tests**, including the seven original tests and eight audit regressions. |
| `npm run test:browser` | Passed with Python Playwright **1.51.0**, Chromium **134.0.6998.35**, Linux headless. |
| `MOZ_DISABLE_CONTENT_SANDBOX=1 MATHS_EXPLORER_BROWSER=firefox npm run test:browser` | Passed with Firefox **135.0**, Linux headless. Container startup required disabling the test browser's content sandbox; deployed application settings are unaffected. |
| `git diff --check` | Passed. |
| Visual inspection | Chromium desktop and mobile screenshots inspected for hierarchy, chart readability and layout. |
| Source review | All nine bilingual activities, history notes and reasoning panels; all eight challenge statements, hints, solutions and extensions; selected official curriculum references. See `CURRICULUM.md` and `AUDIT.md`. |

## Mathematical regression scope

- Quadratic coefficient grid, linear/constant degeneracies and unequal-root cancellation using residuals and the root product.
- Arithmetic/geometric sequences, including zero and negative ratios.
- Binomial normalization and expectation across all slider settings; deterministic simulation boundaries.
- Mean, median and population standard deviation, bilingual decimal input, invalid data and very small nonzero data. Scaled norm avoids squaring underflow.
- Left/right/midpoint sums checked against independent closed formulas for 1–100 rectangles; monotone lower/upper bounds and midpoint error for x² on [0,1].
- Signed secant slopes checked on both sides; invalid/zero h rejected by the mathematical helper.
- Numerical formatting preserves nonzero small values and negative-zero normalization. Axis ticks remain bounded for tiny/subnormal and near-constant scales.
- Numerical-answer parsing accepts decimal commas and fractions without executing input.
- Bilingual content/presets and curriculum link structure; independent small-case calculations for all eight challenge answers. These calculations do not replace proof review.

## Browser regression scope

Both engines completed the same suite:

- Nine labs and eight challenges in French/English; no uncaught JavaScript errors.
- Slider endpoints, all nine question presets, incorrect/correct answers, both hints and challenge solutions.
- Probability accumulation/reset, invalid statistics recovery, very small data with scientific notation and finite/bounded axis ticks.
- Two-sided secants, left/right/midpoint integration controls and numerical tables in every lab; vector arrowheads and cardinal trigonometric zeros.
- Keyboard skip-link activation preserves the current route and focuses main; keyboard slider operation; unknown lab/challenge IDs show a missing-page view.
- Observation/conjecture notes survive language changes/navigation within the session; control reset preserves them. HTML-like input remains text.
- Language and all 17 successful checks persist through reload; malformed storage and denied storage reads/writes remain usable with appropriate feedback.
- Challenge filters, curriculum distinctions and immediate progress indicators.
- No fetch/XHR submission during the tested answer/notes workflow. This is a limited behavior check, not a comprehensive network/security audit.
- All main surfaces checked for horizontal overflow at **1440, 768, 390 and 320 px**; all main surfaces at **200% root text size** at 768 px. This is text resizing, not a test of every browser zoom mode.

`tests/run_browser.py` starts and stops the local server in the same process environment. CI now includes a Chromium browser job alongside syntax/Node checks; CI configuration is not itself evidence that a future run passes.

## Limits and future validation

No formal WCAG audit, screen-reader testing, comprehensive contrast measurement, real touch-device testing, teacher review or student usability study has been completed. Numeric tables and keyboard/reflow checks improve access but do not establish conformity.

Firefox was tested as recorded above. **Safari was not tested.** Playwright WebKit could not launch because this container lacks required system libraries; no WebKit result is claimed. Browser engines and screenshots do not substitute for real-device testing.

Current Malagasy-year applicability and full item-level mappings remain unresolved; French options and IB versions have the scope limits in `CURRICULUM.md`. Experiment notes and numeric checks do not assess proof quality or certify mastery.

Optional WebMCP is feature-detected. No browser implementing the actual API was available; registration, execution, BFCache and lifecycle behavior remain unvalidated. Ordinary student functionality does not depend on it.
# Validation record

## Chapter visuals and integration — 7 October 2026

Based on the newer published source `99ffeeaf4afe2883bbc8f35ef31b8dd7908575cd`, preserving its classified resource catalogue and downloads. The new chapter workspace adds 30 bilingual companion guides reused across 47 chapters and 26 mathematical visual models with staged construction, play/pause, step controls, timeline and parameter exploration. Playback cancels on navigation, pauses in hidden tabs and changes to manual stepping with reduced motion. Practice reasoning stays in session memory.

- Syntax, mathematical and content checks pass: **36 Node tests**, including the four existing library checks and five new companion checks. New coverage includes provenance hashes, PDF page pointers, all 47 chapter sections in both languages, finite model endpoints, quadratic roots, secant slopes, Riemann bounds, conditional probabilities, binomial normalization, regression normal equations, logarithm inversion and playback cancellation.
- 144 companion PDF references were reopened: page counts and whitespace-normalized first/last source text match. The combined revision reuses 120 existing complete/fluency PDF assets and adds 24 excerpts for preparation collections and corrected boundaries. Representative source excerpts were rendered and inspected with Poppler.
- Six representative mathematical SVG scenes were rendered with librsvg and inspected. Circle geometry uses equal coordinate scales. These are static diagram inspections, not browser UI tests.
- Existing type/language/pathway filters, 39 bilingual printable starting sheets, deep links and lab-associated resource views remain present. Teacher corrections remain behind deliberate disclosures. The newer source was opened separately before integration to preserve concurrent changes.
- **No browser or device QA was run for this revision.** The required managed-preview browser capability is unavailable for this static project. Reflow, touch, actual browser playback and assistive-technology behavior still require device verification; earlier browser results below do not verify this update.
- New guides cover central ideas and do not replace full chapter lessons. French source PDFs are not translated. Original booklet correctness and complete curriculum coverage have not been audited by this integration.

## Resource library update · 7 October 2026

Added 47 course chapters and three cross-chapter banks from the AI Assistant/ANONYME Drive subtree, 258 PDF extracts, and 39 short bilingual study guides (312 standalone HTML files). All 31 syntax/numerical/content/catalog tests pass. Download files, source hashes, page ranges, chapter links, language filters and separated teacher resources were checked. Representative PDF pages were rendered and inspected; crop footer artefacts and empty boundary pages were corrected. Original PDFs remain explicitly unverified AI-generated French material. No installed browser engine was available for new UI/device checks. See [the resource library record](RESOURCE_LIBRARY.md).

## 7 October 2026 — bilingual documents and trigonometry

The trigonometry lab has three independent views: remarkable angles with exact
coordinates, eight associated-angle transformations, and circle/function motion.
Both coordinate axes are named. One angle drives every frame of the circle and
selected sine/cosine graph. The two panels stack on a phone. Playback pauses on
manual input, navigation, language changes and hidden pages; reduced motion uses
steps. The chapter companion also labels the axes and uses exact remarkable
values. Exact-coordinate tests compare all quadrants to independent calculations;
identity tests cover negative angles and multiple turns.

All 287 PDF assets (1,883 source pages, including the additional chapter
companions) have corresponding English editions. The local Argos French-English
1.9 model translates prose; original mathematical glyphs, equations, images,
plots and page order are retained. Source hyphenation is reconstructed, rotated
labels remain rotated, and English lines retain source text height with width
adjustment. A mathematics glossary corrects sequence, bound, divisor,
antiderivative, expectation, conditioning and induction terminology. The source
French and English PDFs are separately selectable by the site's FR/EN setting.
`TRANSLATION_LEDGER.json` records per-file page coverage and prose-unit counts;
`RESOURCE_PROVENANCE.json` records both language hashes for chapter documents.
These translations have automated structural checks and representative visual
inspection, not an exhaustive human mathematics or editorial review.

The owner forbids links to their Drive or other personal spaces. All such URLs
and IDs were removed from client catalogues; rendered interfaces no longer offer
source-folder/file links. PDF annotations, visible text and metadata are scanned.
Only public educational/historical reference links remain. The restriction is
also recorded in AGENTS.md for subsequent edits. Repeated AI warnings have been
replaced by one discreet bilingual footer note; printable sheets have the same
short footer wording.

The 40 model, content, catalogue, language, provenance and trigonometry tests
pass. A DOM integration check exercises exact-value selection, section switching,
identity selection, synchronized playback, pause, language change and callback
cleanup. SVG render inspection covers the three new diagrams; representative
English PDF pages include equations, tables and rotated plot labels. The managed
browser preview is unavailable for this plain static project, so a full browser
layout/device interaction run was not performed.
