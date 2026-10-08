# Review of the owner's quadratic presentation

Source: `content/contributions/quadratic-presentation-original.html`.
Integrated route: `#workshop/quadratic`, French and English.

## Mathematics and relevance

The expanded/canonical forms, vertex, discriminant, Vieta identities and sign
rules are correct for a real quadratic with a nonzero leading coefficient.
The five-stage progression is suitable for Première spécialité; the general
discriminant is an extension in Seconde. This presentation complements the
existing free parabola lab rather than replacing it.

## Reproducible defects corrected

- The original rounding function printed roots and canonical coefficients to
  two decimal places after an equals sign. For `x² − 2`, that presents the false
  exact factorisation `(x + 1.41)(x − 1.41)`. The integrated version retains
  exact rational and radical expressions and uses `≈` for numerical roots.
- `0 < Δ ≤ 1e−9` was incorrectly classified as rootless by the case predicate,
  despite the numerical root calculation finding two roots. Exact fraction
  arithmetic now determines the sign of Δ consistently.
- On changing parameter mode, assigning an out-of-range or off-step value to a
  range control could clamp/round it; immediately reading controls changed the
  polynomial. Switching mode now preserves the coefficients. Editing decimal
  roots intentionally defines a new polynomial and this is stated explicitly.
- Selecting root controls when Δ < 0 silently substituted a different example.
  The option is now unavailable for that polynomial; explicit example buttons
  remain available.
- Global arrow-key navigation intercepted range-control keyboard input; MathJax
  accessibility was disabled; the fixed 1280×720 stage shrank all text on phones.
  Native controls, MathML, labelled SVG and a responsive layout replace these.
- The original depended on external MathJax/font requests and kept polling if
  the math library failed. The adapted activity has no external dependencies
  and no perpetual animation loop. It displays the same current polynomial in
  the algebra and graph, including when its leading coefficient changes sign.

## Evidence and limits

Tests cover fractional coefficients, all six sign cases, root/vertex parameter
conversion, very small positive discriminants, rejection of a=0, and both
languages' exact expressions/finite graph coordinates. The graph is explicitly
numerical. This review is automated mathematical and functional verification;
it does not claim that a separate human review has been carried out.
