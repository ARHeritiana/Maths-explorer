# Critical audit — 7 October 2026

Baseline: `aeda41df506ff7e6f884ffdd1b150a4251476c61`, fetched from both GitHub main and the existing Sites source. No repository or ancestor `AGENTS.md` was present. GitHub's original Website checks run succeeded, but ran only syntax and seven Node tests. These seven tests and the original Chromium browser suite were independently reproduced from the baseline archive.

## Prioritized plan and outcome

| Priority | Reproducible finding and impact | Work completed |
|---|---|---|
| P1 | Activate the skip link on `#lab/trig`: it navigates to `#main`, which the router interprets as a missing page. Keyboard users lose their experiment. | Prevent route navigation; focus and scroll the current main landmark. Regression checks activate it using Enter. |
| P1 | Enter `0.0000000001 0.0000000002` in statistics: mean, median and standard deviation all display `0`; the fixed minimum range makes distinct small values visually coincide. | Preserve nonzero values with scientific notation; adapt the statistics range to nonconstant data; derive tick precision from the actual scale and bound tick generation even at subnormal scales. Compute standard deviation with a scaled norm to avoid squaring underflow. Cardinal trig zeros and floating tick zeros are normalized independently. |
| P1 | IB pathways group the unit-circle activity into AA and AI without distinguishing SL/HL, and group complex numbers into HL without considering the 2029 AI removal. | Separate AA SL/HL, AI HL and AI SL enrichment. Identify current AI HL complexes and their removal for first assessment 2029; retain AA HL. |
| P1 | Malagasy reference links foreground older A/C/D resources; scientific terminale label obscures S/OSE/L and the age of the documents. | Use the official annual-distribution page; split T10, T11 S, T11 OSE/L and T12 S. Disclose 2024–2025 source dates and unresolved current-year applicability. T12 OSE/L remains unmapped. |
| P2 | Fixed checks may ask about parameters different from the visible graph; generic “try again” feedback does not resolve that mismatch. | A question preset sets relevant parameters without submitting the answer. All nine presets checked in browsers. |
| P2 | Three aggregate readouts do not supply the values of sequence points, probabilities or individual data frequencies. Color alone distinguishes several curves. | Every lab now has a labeled numerical table; curves also use solid/dashed/dotted patterns, and vector segments have arrowheads. |
| P2 | Derivative controls permit only positive h; integration offers only left sums. These constrain investigation of two-sided limits and approximation bounds. | Left/right approach with nonzero magnitude; signed secant formula; left/right/midpoint rectangles, absolute errors and bound comparisons. |
| P2 | Observation/conjecture/proof distinctions are mentioned inconsistently; most checks assess one number. | Session notes for observations and conditional conjectures; bilingual general arguments and transfer/counterexample prompts in all nine labs. Correct numeric answers still do not certify a proof or mastery. |
| P2 | Unknown lab/challenge IDs silently fall back to an unrelated page. Progress marks and storage errors can remain stale until rerender; successful feedback loses styling after language switches. | Show a missing-page view for unknown IDs. Update saved-progress markers and storage messaging immediately. Retain success styling on rerender. |
| P2 | Pure quadratic helper loses the small root for highly unequal roots, e.g. `(1, 1e8, 1)`. This lies outside the current sliders but is a maintenance trap. | Use a cancellation-resistant root computation and a residual/product regression check. This is not arbitrary-precision arithmetic or a guarantee for overflow-scale coefficients. |
| P3 | French programme-change note gives no cohort boundary; labels can imply an entire lab belongs to seconde. | State seconde/première 2026–2027 versus terminale 2027–2028, and mark dot products/general discriminants as seconde enrichment. |
| P3 | “No personal data is sent” ignores hosting authentication and outbound reference links. Requested feature names remain untranslated in French. | State the narrower application behavior: no answer/note submission or application analytics. Hosting manages private access; source links go to external sites. Translate activity and history labels. |

No incorrect challenge answer was identified. Each statement, two hints, solution and extension was read; independent small-case calculations cover all eight answers. Small-case tests are evidence for the numerical checks, not substitutes for the written proofs. The original nine labs and eight challenges are preserved; no new runtime dependency, account flow, AI service or tutoring content was added.

## Remaining work

- Teacher review of the explanations, prerequisites and item-level curriculum mappings; current Malagasy school-year confirmation.
- Full assistive-technology/contrast audit and student usability observation. Automated focus/reflow checks do not establish WCAG conformity.
- Real Safari and mobile-device testing; browser-engine checks are recorded separately in `VALIDATION.md`.
- Validate optional WebMCP against an actual implementation, including BFCache/lifecycle behavior. It remains feature-detected, unvalidated and unnecessary for student features.
- Extend coverage only with a clear learning purpose (e.g. exponential/logarithmic functions, conditional probability and regression). These are future work, not implemented labs.
