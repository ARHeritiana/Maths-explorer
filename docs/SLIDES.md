# Classroom slides

`dist/slides/player.html?deck=<chapter id>&lang=fr|en` plays one deck: a 1280 by 720 stage scaled to the window,
keyboard navigation (arrows, R answer, G outline, L language, F full screen), MathJax SVG vendored in `dist/vendor/`
(nothing is fetched from a third party). `#slides` in the site lists every deck.

## Where decks come from
| Course | Source | Build |
|---|---|---|
| Seconde, Première, STMG | bilingual LaTeX under `content/latex` (course boxes, examples, errors, activities) | `python3 scripts/build-slides.py` |
| Terminale | French drafts `content/slides/draft/terminale-NN.fr.json` (from the supplied notes, via `scripts/extract-terminale-slides.py`) and English authored decks `content/slides/terminale-NN.json` | same script merges them |

Teacher-only material (solutions boxes, teacher notes, fluency drills) is never included. Seconde answers are revealed
on demand (R). Interactive canvases (`dist/slides/widgets*.js`) are inserted after the matching unit by the `WIDGETS`
table in `scripts/build-slides.py`: every canvas has draggable handles; space scenes (plane and projection, line,
surface) rotate when the background is dragged.

## Checks
`python3 tests/slides_smoke.py` opens every deck in Chromium in both languages (console errors, MathJax errors, raw TeX,
overflow, widget drag). `python3 tests/slides_check.py` compares the English Terminale decks with their French drafts
(same slides, same mathematics, same HTML structure, no identifiers).

## Limits
- Decks are extracted from course notes: they follow the booklets' wording and are denser than hand-designed slides.
- Terminale slides follow the supplied notes dated 6 September; the published Terminale PDFs are a later revision.
- The vector canvas hides the dot product and angle for Seconde (out of the Seconde programme).
- Rendering was checked by script and by screenshots of a few slides, not slide by slide.
