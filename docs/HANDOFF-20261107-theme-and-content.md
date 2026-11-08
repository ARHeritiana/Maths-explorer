# Handoff, 7 November 2026: portable PDF theme and content round

Branch `wip/theme-content-20261107` (pushed, NOT merged, NOT verified). `main` = `81141760` plus Matematika sync `7d08f5a` (the Matematika repo). Everything below is in the WIP branch unless marked done on main.

## Done on main and live (both repos)
- Annales web edition no longer drops nested-list content / X-column table cells (`458c269a`).
- Olympiad hidden outside the full edition (nav, route); generators `e-quad-complex` and `g-sec-droite-cartesienne` fixed (`81141760`).
- Matematika = same code built with `FULL_EDITION = true`, dist copied into a clone, committed with the repo's author identity (procedure: flip flag in site/js/live-curriculum.js, `make site`, rsync dist/ to the clone excluding LICENSE*, README.md, .nojekyll, then `git checkout site dist content/data/build-state.json && make site`).

## In the WIP branch (needs review before merge)
1. Portable TeX profile and Cahier theme for course PDFs (owner decision: portability first, an Android app must compile the TeX): XeTeX only, fonts bundled in `content/tex/core/fonts` (STIX Two text+math, Schibsted Grotesk static TTFs made from the site woff2, Latin Modern Mono) loaded by file name through `\mxcorepath` (set by `build/mxbuild/books.py`), no PSTricks/pdflatex/system fonts. Edited: mx-math.sty, mx-figures.sty (palette = site tokens), mx-layout.sty (header/footer frame, headings), mx-env.sty (boxes, cover), mx-code.sty, mx-i18n.sty, mxbook.cls (pdfstring macros), `build/mxbuild/tex.py` (default engine xelatex), publish-sources.py (fonts published), build-slides.py (xelatex for figure export), tests/test_notation.py. `scripts/build-expertes.py` heading-size band widened (13-15 pt).
   - Rebuilt so far: automatismes, stmg, seconde, premiere, terminale (verified visually: automatismes, stmg). expertes and enrichment were still building. Check `build/out`/`dist/resources` PDFs visually per type before merging.
   - NOT yet ported: annales PDF books (`scripts/build-annals-pdf.py` still pdflatex + old preamble; its PSTricks figures stay prebuilt assets), `build-module-maths.py`, `build-fourier.py`, `build-university.py`, other pdflatex users, `tests/exercise-latex.test.mjs` (uses pdflatex). The annales web figures still need Adobe fonts to rebuild locally; do not rebuild them, the committed SVG/PDF figures are assets.
   - Receipts: after any change in core, `PYTHONPATH=build python3 -m mxbuild.refresh` must run; `--check` must pass before merging.
2. Agents' in-flight work (separate scopes, reports not yet verified): lecture decks beamer theme (`content/tex/core/beamerthememx.sty`, `scripts/build-lecture-slides.py`, 145 decks); slide player Home/Back + Cahier theme (`site/slides/*`); Première exercise bank expansion (`site/js/exercises/templates-premiere-2.js`, problems-premiere.js, bank.js); Foundations (`#basics`) classification + new Logic lessons (`site/js/basics-page.js`, `site/resources/basics/*`); gallery audit (read-only, report only). Review each diff, run `npm test`, `make site`, refresh --check, browser tests (`python3 tests/run_browser.py`) before merging.

## Next (owner requests, in order)
- Gallery: fix exhibits without real visuals and glitchy animation (needs the audit report).
- Exercise bank diversity for Terminale, Expertes, STMG, thin Seconde chapters (Première first); animated problem visuals as a plus.
- Non-PDF assets to the theme: animations, interactions.
- Audit leftovers: biographies/timelines historical review, accessibility pass (keyboard/screen-reader/print), cosmetic generator slips (`-1e^{3x}`, `\frac{1}{1}`, e^{1}, 0.000 binomial), annales: 3 silent upstream-typo fixes and 3 dropped sentences should be credited, a few remaining dropped questions (`bac_2024_11_sujet1_amsud_1`, `bac_2023_09_sujet1_ameriquesud_1`, minipage options in `e3c_2020_00_sujet15_1`).
- Local environment: no sudo; Adobe font metrics (pplr8t, phvr8t) and pst-tools missing, hence the XeTeX switch.
