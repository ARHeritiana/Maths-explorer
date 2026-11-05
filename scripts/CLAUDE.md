# scripts/: index

Builders called by `build/mxbuild` (see `pipeline.py` `COURSES`) or by `make`. Each file starts with a one-line purpose.

| Script | Builds or does | Called by |
|---|---|---|
| `build-tex-resources.py` | Seconde, Première, Terminale PDFs | `make tex COURSE=...` |
| `build-expertes.py`, `build-stmg.py`, `build-automatismes.py` | Maths expertes, STMG, automatismes PDFs | `make tex` |
| `build-enrichment.py`, `enrichment_sections.py` | enrichment PDFs, HTML and site data | `make tex COURSE=enrichment` |
| `build-slides.py` | slide decks and figures from TeX and `content/slides` (`WIDGETS` table places canvases) | `make slides` |
| `build-mada.py` | Malagasy curriculum (T10, T11 S): chapter and supplement PDFs cut from the owner's compiled Mada-Boky books, manifest records | by hand, then `make site` |
| `export-slides.py` | one self-contained HTML per deck | `make slides`, `make site` |
| `build-lecture-slides.py` | Beamer lecture PDFs | `make lectures` |
| `extract-terminale-slides.py` | one-off: Terminale French drafts from LaTeX | by hand |
| `build-university.py`, `build-module-maths.py` | university foundations; applied mathematics module | `make university`, `make site` |
| `error-coverage.mjs` | `docs/ERROR_COVERAGE.md` (error correction coverage matrix by curriculum and misconception); `--check` compares | `node scripts/error-coverage.mjs`; `tests/errors.test.mjs` fails if stale |
| `build-study-guides.mjs` | study guide HTML pages from `site/js/study-guides.js` | by hand |
| `publish-sources.py` | publish `.tex` sources to `dist/sources/` (refuses identifying content) | `make tex` |
| `finalize-resources.py` | PDF hygiene, then catalogue | by hand |
| `tex-inventory.py` | `docs/TEX_INVENTORY.md` | `make inventory` |
| `check-stmg-twins.py` | kept for an old command; real check is `tests/twin_parity.py` | |
| `check-syntax.mjs` | syntax of every served script | `npm run check` |
| `serve.mjs` | local server of `dist/` on port 4173 | `npm start` |
| `optimise-gomboc.py` | the visibly shaped Gömböc: support-function polynomial found by sequential linear programming (`site/js/gomboc-support-data.js`) | by hand |
| `build-gallery-data.py` | Gerver's sofa from Romik's equations (`site/js/gallery/gallery-sofa-gerver.js`); best known square packings from a checkout of github.com/jlevy/squares (`site/js/gallery/gallery-squares-data.js`); needs numpy, scipy, shapely, pyyaml | by hand |

`build-fourier.py`: six web lessons, four XeLaTeX PDF editions, source bundle and checked build receipt.


`prerequisite-model.mjs`: internal concept DAG, course scope/order, local question scaffolding and source fingerprints. `check-prerequisites.mjs`: advisory scan of the real bank, generated samples, authored French decks and chapter TeX; reports in ignored build output. See `docs/PREREQUISITES.md`.

`build-annals.py`: structured HTML, original-source SVG figures and downloadable LaTeX for the locally hosted annales bank; source and output hashes in content/data/annals-build.json.

`build-annals-pdf.py`: native course-style annales statement/correction PDFs and their portable source bundle with precompiled vector figures; `data/annals-pdf-build.json` records source/output integrity.

`annals-code.py`: protects literal listings and table-based programs before semantic HTML conversion; retains indentation, source operators, line numbers and mathematical pseudocode. Used by `build-annals.py`; `--html-only` reuses published figures, and `build-annals-pdf.py --reuse-inputs` retains PDF books only when their archived typesetting inputs and output hashes are identical.
