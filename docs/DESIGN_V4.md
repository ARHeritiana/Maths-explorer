# Design v4: "Vivid" (14 October 2026)

The owner asked for a livelier design. This layer sits on top of v3 "Cahier" (docs/DESIGN_V3.md) and **replaces its principle 7 ("Nothing moves for show")** and its "one accent" rule where they conflict. Everything else in v3 (find first, the figure is the page, 18 px text, 7:1 body contrast, 44 px targets, light and dark, cheap to load) still holds.

## What changes

1. **Colour as identity.** Challenge cards and laboratory experiments each take one of the eight categorical colours `--c1…--c8` (defined for both themes), cycling in order. The colour appears on the card's top bar, its glyph, the experiment's round symbol chip and the selected-row bar. Text stays in the ink colours: the categorical colours are used only for large glyphs, borders and tinted backgrounds, never for small text.
2. **Headings.** Page and lab titles carry a light ink-to-accent gradient; the lab heading has a five-colour rule. Forced-colours mode falls back to plain text.
3. **Welcome motion.** Page sections and challenge cards rise in (460 ms, staggered by at most 200 ms). Cards lift and tilt a little on hover and their glyph wiggles; experiment chips pop on hover and the selected one pulses gently; buttons press down.
4. **Reward motion.** A correct answer (laboratory quiz or challenge) releases a short burst of coloured pieces from the feedback box (`celebrate` in `site/js/motion.js`, decorative, `aria-hidden`, removed after 1.4 s).
5. **Objects.** The laboratory now holds scenes that move by themselves because the motion is the explanation: Galton board, Reuleaux polygons, Platonic solids and the chaos game.

## Constraints kept

- Every animation and transition added here is inside `@media (prefers-reduced-motion: no-preference)`; the confetti checks `reduced()` first; the existing global reduce rule still applies.
- No new fonts, images or libraries. About 3 KB of CSS and 1 KB of JS.
- Contrast: tinted backgrounds use `color-mix` with the surface colour at 9–30 %, with ink text on top; checked by the existing accessibility audit.
