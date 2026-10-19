# Classroom slides

`dist/slides/player.html?deck=<chapter id>&lang=fr|en` plays one deck: a 1280 by 720 stage scaled to the window,
keyboard navigation (arrows, R answer, G outline, L language, F full screen), MathJax SVG vendored in `dist/vendor/`
(nothing is fetched from a third party). `#slides` in the site lists every deck.

## Where decks come from
| Course | Source | Build |
|---|---|---|
| Seconde, Première, STMG | bilingual LaTeX under `content/latex` (course boxes, examples, errors, activities) | `python3 scripts/build-slides.py` |
| Maths expertes | units `content/tex/courses/expertes/chapitres/C??.{fr,en}.tex` (shared TeX system; subsection titles head the slides; automatismes, exercises and problem are left out) | `python3 scripts/build-slides.py` |
| Terminale | French drafts `content/slides/draft/terminale-NN.fr.json` (from `content/latex/terminale/chapitres/C??.tex`, via `scripts/extract-terminale-slides.py`; the drafts also carry the figure code `figs`/`figs_en`) and English authored decks `content/slides/terminale-NN.json` | same script merges them |

Teacher-only material (solutions boxes, teacher notes, fluency drills) is never included. Seconde answers are revealed
on demand (R). Interactive canvases (`dist/slides/widgets*.js`) are inserted after the matching unit by the `WIDGETS`
table in `scripts/build-slides.py`: every canvas has draggable handles; space scenes (plane and projection, line,
surface) rotate when the background is dragged.
Laboratory experiments (`type: 'lab'`, 18 October 2026): `lab('<experiment>/<mission>')` in the `WIDGETS` table (or a widget slide
`{"type": "lab", "ref": "..."}` in an authored deck) mounts the experiment of the laboratory in the player: the canvas fills the widget
host (dark palette, larger fonts), the unlocked controls, the answer area and a mission stepper (previous, 3/6 Explorer, next) are in the
controls area, the formula and the readout in the readout area (typeset with MathJax from the experiment's Unicode), the mission prompt in
the hint line. N and P change mission when the canvas has focus; the arrow keys stay the player's. The slide title is the experiment's
title (read from `site/js/lab/experiments/<id>.js`). The self-contained HTML export of a deck that uses one carries the laboratory code
(`scripts/export-slides.py` `lab_modules`); other decks do not. Migrated: `quad` to quadratic, `tangent` to derivative, `integral` to
integral, `seq` to sequences, `circle` to trig, `vec` (without dot product) to vectors, `complex` mode product to complex, `stats` to
statistics, `binom` to probability, `line` to line, `fn` mode exp to exponential (stmg-02), `cobweb` to cobweb, `matrix2` to matrix, `line3d`, `plane3d` and `lineplane` to space-lines (true rotatable 3D: drag the background, arrow keys with the figure focused, `H` picks a handle); those widget functions are deleted. `vec` stays for the dot-product decks (premiere-03, premiere-07), `fn` for premiere-09 (the exponential defined by f′ = f), stmg-03 (log) and stmg-04 (inverse).
Maths expertes widgets: `complex` (z and its conjugate; modulus and argument; product zw), `cquad` (roots of a real
quadratic), `roots` (n-th roots of a), `modclock` (powers and inverses modulo n; the 2 by 2 matrix is the laboratory experiment `matrix`), `walks` (walks counted by powers of the adjacency matrix), `markov` (two-state chain).

## Checks
`python3 tests/slides_smoke.py` opens every deck in Chromium in both languages (console errors, MathJax errors, undefined macros shown as red text, raw TeX,
overflow, widget drag). `python3 tests/slides_check.py` compares the English Terminale decks with their French drafts
(same slides, same mathematics, same HTML structure, no identifiers).

## Limits
- Decks are extracted from course notes: they follow the booklets' wording and are denser than hand-designed slides.
- Terminale slides follow the supplied notes dated 6 September; the published Terminale PDFs are a later revision.
- Seconde vector slides use the laboratory (determinant and collinearity only, no dot product); the old `vec` canvas (dot product, `noDot`) serves the Première decks.
- Rendering was checked by script and by screenshots of a few slides, not slide by slide.
