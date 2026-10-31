# Design v6: "Grille" (31 October 2026)

Chosen by the owner on 31 October 2026 from three prototypes (`docs/design-v6/prototype.html`: A Planches, B Grille, C Calque). It replaces the look of v3 "Cahier" and v4 "Vivid". The rules of v3 that come from the site's purpose stay (find first, the figure is the page, phone first, accessible, honest labelling, no AI notice, no owner identity).

## Why

The earlier look (blue accent, pastel tinted cards per topic, soft shadows and lifts, rising surfaces, confetti) read as a template. A search of the published lists of generated-site "tells" (gradient text, glowing dark backgrounds, centred hero with three cards, default rounded corners and faint shadows, common fonts) served as a checklist. B removes all of them.

## Rules

| | |
|---|---|
| Palette | white paper, black ink, one red (`--accent`) for emphasis and state; greys for the rest. Dark theme "nuit": black, white, a lighter red. |
| Data colours | `--c1…--c8` stay as they are. They are data (graph colourings, series), not interface. |
| Corners | square. `--r` and `--r-sm` are 0. Circles stay circles. |
| Depth | none: no shadow, gradient, blur, glow, lift. Hairlines and a 6 px black top rule mark a plate. |
| Type | Schibsted Grotesk for headings and interface (self-hosted, `site/fonts/`, SIL OFL), Atkinson Hyperlegible for running text, STIX Two for mathematics. Headings weight 800, tracking −0.03em. |
| Motion | none for decoration. Surfaces do not rise, no confetti. Motion only explains a state of the mathematics. |
| Header | a 12 px black bar, then the three sections as plain text with a 4 px red underline for the current one. |
| Buttons | square, 2 px black border; primary is black and turns red on hover. |

## Done in this change

Tokens, fonts, header, buttons, cards and tiles, previews (ink on light grey), forms, focus, pills and tags, motion. Minimum contrast checked by `tests/accessibility_browser.py` (the active-step red was darkened from `#e30613` to `#d90012` after it failed 4.5:1).

## Structure (done, 31 October 2026)

- The header holds the three doors only. The page links of a section (Bases, Slides, Pathways; Topics, Challenges; Timelines, Biographies, Stories, Curiosities) are no longer a second sticky bar: they are quiet text links under the running head that scroll away.
- Slides were already reachable from each chapter ("Présenter et manipuler", opens the deck of the chapter), so they stay a page of the chapter, not a section of their own.
- Topics are a filter of the laboratory (`bindLabIndex`, `tests/lab-filter.test.mjs`). The `#topics` pages remain for the full resource listing and are linked from the filter.
- No route was removed or renamed, so existing links and bookmarks keep working. Merging `#topics`, `#slides` and `#pathways` into the three doors as pages is not done and would need route changes.

## Home (done, 31 October 2026)

The hero figure is an animated plate of five live figures shown one after the other (9 s each, progress rule on the tabs): parabola, unit circle, secant to tangent, left Riemann sum, logistic cobweb. Each is draggable and eased, in French and English, with its numbers under it and the same colour for the same quantity (red, ink, grey). It pauses while a figure is touched and on request, and does not advance under reduced motion. A plain wheel scrolls the page (Ctrl + wheel or a pinch zooms the figure). Code: `site/js/home-slides.js`, `figure-engine.js`, `figure-scenes.js`; tests: `tests/figure-scenes.test.mjs` (independent checks of each scene's mathematics, including the logistic period thresholds found numerically). The Madagascar Fourier figure left the hero; it remains an idea card and its own page.

## Still to do (in this order)

1. Canvas engine of the prototype (free handles, easing, pan and zoom, soft magnet) in the laboratory, replacing the current engine experiment by experiment.
2. Slides (`site/slides/player.css`) and PDFs (`content/tex/core/mx-layout.sty`) still use the old palette.
3. The pages "Lire" and the per-class pages of the prototype.
