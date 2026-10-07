# Validation record

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
