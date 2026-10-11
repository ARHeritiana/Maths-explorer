# Repository audit — 10 October 2026

Scope, in the owner's order: mathematical accuracy, curriculum conformity and pedagogical relevance; then responsiveness, design and interaction. Commits on `claude/repository-audit-bsfs8y`.

## Mathematics and notation (site)

| Finding | Correction |
|---|---|
| Lab formula printed `1x² + 0x − 2`. | Conventional writing: zero terms omitted, unit coefficients implicit, typographic minus. |
| Quadratic workshop gave decimal roots when the discriminant is a perfect rational square, and wrote vertex form as `x − (−1)`. | Exact rational roots (`rationalSqrt`, regression test); vertex form `x + 1`, `x²` when α = 0. |
| Integral prompt did not say which rectangles. | “Two left-endpoint rectangles”, then right endpoints. |
| Visual lessons used decimal points in French and `10^x` written inline. | French decimal commas; true superscripts. |
| Vectors sheet used Greek β as a subscript for point B. | `x_B − x_A`. |
| Sequence readout `u9` instead of an index. | Unicode subscript index. |

No incorrect answer or theorem statement was found in the labs, challenges, workshop or study guides.

## Curriculum

French pathway references were checked against BO n°14 of 2 April 2026: the new seconde and première programmes apply from 2026–2027, terminale from 2027–2028. The première spécialité programme text (supplied by the owner) settles the probability question:
- In première: independence, total probability, trees for n ⩽ 4 Bernoulli trials, random variables, expectation and variance; conditional probabilities appear among the automatismes.
- Not in première: the binomial distribution.

The site's French pathway already placed the binomial lab in terminale. The première stage now lists the probability lab with the note "n ⩽ 4 and a tree". The première PDF chapters were checked and conform. Malagasy and IB mappings in `CURRICULUM.md` were not changed.

## English editions of the PDF library

Finding: the English PDFs were machine-translated (local model) span by span and never reviewed. Sampling showed systematic and sometimes meaning-changing errors: *Exercice* → “Fiscal year”, *Devoir* → “Duty”, *Blanc* → “White”, *abscisse* → “abscesses/apses”, *droite* → “right”, *dérivable* → “drifting”, *vecteur directeur* → “master vector”, *sans remise* → “without remission”, *point d’inflexion* → “deflection point”, “au plus deux succès” → “at least two”, dropped signs and digits (F(0)=−1 → F(0)=1; 0,28 → 0.18; (1;2;−1) → (1−2;−1)), translated Python identifiers, dropped second sentences, and a garbled running header (“Maths ExploreWhat’s going on in…”).

Method: all 18,748 cached French→English spans were reviewed; 11,794 corrections (template rules for repeated headings plus individual review) are stored in `docs/translation-corrections.json`. `scripts/patch-english-pdfs.py` rewrites only the English overlay text blocks; equations, figures and the French layout are untouched. A replacement may use the width of the French line it covers and is condensed only beyond that. Result (`docs/TRANSLATION_CORRECTIONS_LEDGER.json`): 282 English PDFs, 42,582 spans replaced; all 331 FR/EN pairs keep identical page and image counts; French files are unchanged. Counts in the English text before → after: “Fiscal year” 86 → 0, “Duty” 81 → 0, “White” 62 → 0, “abscess/apses” 50 → 0, “derivable/drift” 108 → 0, garbled header 172 → 0. `translate-resources.py` now applies the reviewed corrections last, so a regeneration keeps them.

Second pass (teacher's proof-read in context):
- Each English block is now matched to its French source by position: the French edition's text at the same baseline identifies it. This resolved the machine outputs that several French sources shared (e.g. "Right." from *Vrai.*, *droite.*, *raison.*; "where" for *lorsque*), which were previously skipped.
- Every multi-segment paragraph (5,809 unique paragraphs) was read against the French. 3,875 contextual corrections are in `docs/translation-context-corrections.json`, keyed by the paragraph's French sources and the segment index, so they apply wherever that paragraph recurs. They cover:
  - word order and grammar across segment joins ("do not join necessarily these points" → "we do not necessarily join these points");
  - duplicated or missing words, and badly split words;
  - wrong senses (*face* → tails, *premier* → prime, *pièce* → room, *à droite* → on the right, *parallélépipède*);
  - translated Python identifiers (`from math import`, `bornes`, `favorables`);
  - English punctuation instead of French spacing and guillemets.
- Segments squeezed below 60 % of their width went from 685 to 28, by shorter wording; "&" stands for "and" where "and" would not fit.
- The patcher is idempotent: a second run changes nothing.

Third pass (residual limits):
- `scripts/fix-french-glyphs.py` replaces the French left visible in the original fonts, which the translator never overlaid because these spans contain no two-letter word:
  - 123 guillemets « » become straight quotation marks hugging the quoted text;
  - 33 "à" between formulas become "to", or "at" for times;
  - 10 "et" in maths lines become "and";
  - the verb "a" in two formulas becomes ":" or disappears where "has" already follows.
  Each glyph is covered with the sampled background colour and the English is drawn on top. Its code is mapped to a space in the font's ToUnicode table, so copied text is clean. *eᵗ* (italic e with superscript t) is recognised and left alone. Fixes are recorded in `docs/FRENCH_GLYPH_FIXES.json`, so reruns are no-ops.
- Overlays set on a sub- or superscript baseline are now matched to their French word (tolerance 2.4 pt), e.g. *vaut* after *u₄*, which read "value" and now reads "is". Blocks not located fell from 5,881 to 5,050. Nearly all of the rest already carry reviewed text from the first pass.
- The middle dot that the first translation used for en dashes ("2026·2027", "König·Huygens", 742 occurrences) is now a hyphen.
- Segments below 60 % width: 18, down from 28. Words were moved across segment boundaries where no formula intervenes ("is below", "Long-run mean.", "under reflection in a line").

Remaining limits:
- About 15 segments stay between 30 % and 60 % width. A word such as "from" or "If Delta" must sit inside a gap between two formulas, and the gap is narrower than the English.
- Decimal commas inside formulas (e.g. 0,9) are kept: in French notation commas also separate list items and coordinates, so changing them automatically could alter mathematics.
- The corrections were made by me and parallel AI reviewers, not a professional translator. A teacher should read a sample of each document type before using the English editions in class.

## Site design and interaction

- Quadratic workshop in dark theme: active stage and headings were near-invisible (`--mint` is dark there). Fixed; buttons, presets and controls styled; mobile sign table and graph labels.
- Trig tabs: white on mint (≈1.4:1) → dark text.
- Phone navigation fits one row at ≤420 px; 44 px-class targets on disclosures and checkboxes; data tables have `scope="col"` headers.
- Ten unlinked STMG notes PDFs that rendered blank were removed.
- Checks: `npm test` 50/50, `npm run check`, Chromium browser suite (4 widths, 200 % text) pass; axe-core 4.10.2 reported 0 violations on 13 routes at 2 widths. Automated checks do not establish WCAG conformity.

## Owner requirements (AGENTS.md)

No personal-space URL, identifier or link was found in HTML, JavaScript, catalogues, PDF text, annotations or metadata (`finalize-resources.py` re-checks on every run). Every downloadable resource has French and English editions. The single AI-content notice remains in the footer.

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
