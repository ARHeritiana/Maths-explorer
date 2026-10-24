# scripts/: index

Builders called by `build/mxbuild` (see `pipeline.py` `COURSES`) or by `make`. Each file starts with a one-line purpose.

| Script | Builds or does | Called by |
|---|---|---|
| `build-tex-resources.py` | Seconde, Première, Terminale PDFs | `make tex COURSE=...` |
| `build-expertes.py`, `build-stmg.py`, `build-automatismes.py` | Maths expertes, STMG, automatismes PDFs | `make tex` |
| `build-enrichment.py`, `enrichment_sections.py` | enrichment PDFs, HTML and site data | `make tex COURSE=enrichment` |
| `build-slides.py` | slide decks and figures from TeX and `content/slides` (`WIDGETS` table places canvases) | `make slides` |
| `export-slides.py` | one self-contained HTML per deck | `make slides`, `make site` |
| `build-lecture-slides.py` | Beamer lecture PDFs | `make lectures` |
| `extract-terminale-slides.py` | one-off: Terminale French drafts from LaTeX | by hand |
| `build-university.py`, `build-module-maths.py` | university foundations; applied mathematics module | `make university`, `make site` |
| `build-study-guides.mjs` | study guide HTML pages from `site/js/study-guides.js` | by hand |
| `publish-sources.py` | publish `.tex` sources to `dist/sources/` (refuses identifying content) | `make tex` |
| `finalize-resources.py` | PDF hygiene, then catalogue | by hand |
| `tex-inventory.py` | `docs/TEX_INVENTORY.md` | `make inventory` |
| `check-stmg-twins.py` | kept for an old command; real check is `tests/twin_parity.py` | |
| `check-syntax.mjs` | syntax of every served script | `npm run check` |
| `serve.mjs` | local server of `dist/` on port 4173 | `npm start` |
| `build-gallery-data.py` | Gerver's sofa from Romik's equations (`site/js/gallery-sofa-gerver.js`); best known square packings from a checkout of github.com/jlevy/squares (`site/js/gallery-squares-data.js`); needs numpy, scipy, shapely, pyyaml | by hand |

`build-fourier.py`: six web lessons, four XeLaTeX PDF editions, source bundle and checked build receipt.

`build-gomboc.py`: package the MIT certified Gömböc analogue from a source checkout and completed exact-certificate reproduction; integrate full-volume inertia and retain all contact vertices, with explicitly separate display and preview hulls.
