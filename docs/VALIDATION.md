# Validation record

Validated locally in Chromium on 7 October 2026.

## Automated checks

- JavaScript syntax checks for the application, content and mathematical modules.
- Quadratic roots across a grid of coefficients, including linear and constant degeneracies.
- Arithmetic and geometric sequences with zero and negative ratios.
- Binomial normalization and expectation over every n and p slider setting; deterministic simulation boundary cases.
- Median, mean, standard deviation, bilingual decimal input and invalid-data handling.
- Left Riemann sums are increasing lower bounds for the integral of x² on [0,1].
- Numerical-answer parsing accepts fractions and decimal commas without evaluating code.
- Bilingual content completeness and curriculum link integrity.

## Browser checks

- All nine experiments rendered in French and English without JavaScript errors.
- All slider minimum and maximum values produced finite results.
- Each learning check rejected an incorrect answer and accepted its expected answer.
- Each of eight challenges accepted the correct answer; both hints and the solution opened.
- Probability batches accumulated and reset when parameters changed.
- Invalid statistics input displayed an error and removed the invalid graph; valid data restored results.
- Language and all 17 successful checks persisted through reload.
- Challenge filters returned the expected four recreational and four Olympiad-style problems.
- All main surfaces were checked for horizontal overflow at 1440, 768, 390 and 320 pixels.
- Enlarged text at 200% was checked for overflow on the laboratory surface.

## Limits

The UI uses native keyboard controls, semantic labels, visible focus, numeric chart results and a skip link. These checks are not a formal WCAG audit or an assistive-technology certification. Safari and Firefox have not been tested in this environment. Teacher and student usability trials have not yet taken place. Curriculum placements require the review described in `CURRICULUM.md`.

The optional WebMCP API is feature-detected. An actual browser implementing `document.modelContext` was not available, so native WebMCP registration/execution validation is unavailable. Ordinary browser functionality does not depend on it.
