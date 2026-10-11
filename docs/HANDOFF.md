# Hand-off: Maths Explorer (state at checkpoint)

Repository `arheritiana/maths-explorer`, branch `claude/repository-audit-bsfs8y`. Do not open a PR unless asked.
Owner: a French-lycée maths teacher in Madagascar. They want precision, no filler, no hallucination, uncertainty flagged
([VERIFY], [HORS PROGRAMME]). Reply in English, structured as TL;DR, answer, justification, sources, warnings; maths in LaTeX.

## Hard constraints
- Never write Google Drive URLs, folder or file IDs, paths, owner details or e-mails anywhere in the repo, site, PDFs,
  catalogues, metadata or docs. Describe the origin only as "owner-supplied LaTeX sources". Do not touch the owner's Drive.
- The site never links to Drive or any personal space; all copies are hosted in the site (see `AGENTS.md`).
- Every downloadable resource exists in French and English with equal page counts. One discreet AI-content notice, in the footer only.
- Translate prose only: never alter maths, TikZ, `\includegraphics` or listings. No school, teacher or city names in published material.
- Curriculum: Première BO n°14 of 2 April 2026 (no binomial distribution); Terminale STMG BO spécial n°8 of 25 July 2019.
- Every exercise you create must be double-checked: maths, pedagogy, curriculum alignment, same targets as the item it replaces.
- New visible text has no em-dashes; the site keeps one mint accent (Taste skill).
- Before each push: `npm test`, `npm run check`, `python3 tests/run_browser.py`, `python3 tests/slides_smoke.py`,
  `python3 tests/slides_check.py`, and `git grep -nE "drive\.google|docs\.google|1_ozGBWjc|1OJe-_v-b|1AfyQ60kJ"` (must be empty).

## Pipeline (all in `scripts/`, TeX under `content/latex/<course>/`)
pdfLaTeX without shell escape, then PyMuPDF split, then `style-resource-pdfs.py --only <pdfs>`, then `finalize-resources.py`,
then `publish-sources.py`. Builders: `build-tex-resources.py` (premiere, seconde), `build-automatismes.py`, `build-stmg.py`,
`build-slides.py`. TeX Live and Playwright exist only per container (`pip install pymupdf playwright==1.56.0`; Chromium at
`/opt/pw-browsers/chromium`). English twins are `*-en.tex`; a checker comparing maths and skeleton between FR and EN twins was
a scratchpad script (`check_tex.py`) and may need rewriting; `tests/slides_check.py` is in the repo.

## Done (pushed, checks green at this commit)
- Première (10 chapters, revision), Seconde (15 sequences, annexes, fluency sheets) and Terminale STMG (8 chapters, tests,
  formula sheet) are built from TeX in FR and EN, page counts equal, labelled `tex-source` in the catalog.
- Site pages `#pack` (custom PDF packs, client-side merge), `#sources` (TeX downloads), `#slides` (deck index).
- Slides: player `dist/slides/player.html`, 26 interactive canvases (2D draggable, 3D rotatable), 47 decks (1,045 slides),
  figures compiled from TikZ/pgfplots to SVG for Seconde, Première and STMG decks. See `docs/SLIDES.md`.
- Design pass: `dist/taste.css`, one mint accent, sans headings, nav fixed. The useless free-text "Ton raisonnement" field was
  removed from the chapter practice card (quiz and challenge answer inputs are checked fields and were kept).

## Committed but unfinished (the next tasks, in order)
1. **Terminale PDFs from the 6 September source** (the only Terminale source available; the user said to use it).
   - Sources split and translated: `content/latex/terminale/` (`livret(-en).tex`, `eleve/professeur(-en).tex`, `front`, `chapitres/C01..C14`,
     `annexes/*`, `evaluations/intro, E1..E9`, all with `-en` twins). FR/EN builds already have equal page counts (student 95,
     teacher 262; `evaluations/E5-en.tex` has a `\clearpage` before its last item to align pages; `10^-6` typos fixed to `10^{-6}`).
   - To do: extend `build-tex-resources.py` for `terminale` (student bookmarks start at chapter index 3, teacher at 4 because of
     the extra "Guide de préparation"; markers Notes de cours/Course notes, Activité de recherche/Research activity, Exercices
     progressifs/Progressive exercises, Devoir à la maison/Homework, Conduite et corrigés/Teaching notes and solutions); add catalog
     entries for a new `activities` type per chapter; map appendices (algorithms, proofs, oral, assessments) onto existing
     `terminale-*` files; run style, finalize, publish-sources; update `docs/TEX_CONVERSION.json`.
   - Old per-chapter types without a counterpart (practice, problems, assessment, fluency and methods banks) stay as legacy overlay
     PDFs. Tell the user: the 6 September source is thinner than the published "Refonte 7 sept" PDFs (95/262 pages versus 166/346).
   - Spot-proofread the E1 to E5 English twins: they were produced by scripted phrase replacement.
   - Source oddities to report as [VERIFY]: E6 intro says "first four questions independent" but the exercise has five; E7 solution
     starts "No." for a compare-and-explain question; sources cite an external site "Lycée d'adultes, Paul Milan"; "Barbazo"
     textbook references.
2. **STMG: replace the Calao textbook extracts.** `manuel/extraits-calao*.tex` reproduces a published textbook (copyright risk; old
   text remains in git history). Original replacements exist as `manuel/exo-A.tex` (sessions 1-14), `exo-B` (15-30), `exo-C` (31-46),
   `exo-D` (47-55), each with an `-en` twin, 55 `\DefExo{N}{target}{statement}{teacher solution}{answer lines}` calls in total.
   A and D were self-checked by their authors; **B and C are unverified** (authors cut off by a rate limit). All four need an
   independent verification: recompute every number, check unambiguity, curriculum fit, target match with the replaced exercise,
   FR/EN sync, LaTeX validity (render TikZ), originality. Then wire them in: define `\DefExo`/`\ExoSession` in `preambule(-en).tex`
   (replacing `\DefCalao`/`\CalaoSession`), rename the `exercicecal` box, include `exo-A..D`, replace every `\CalaoSession{n}` in
   `chapitres/*.tex` and `-en`, rewrite or drop `\manuelref{Calao, ...}`, fix Calao mentions in `annexes/sources*.tex`,
   `livret-tstmg*.tex`, `preambule*.tex`; delete `extraits-calao*.tex`; rebuild with `build-stmg.py`; keep page counts equal.
   `publish-sources.py` already withholds `stmg/manuel/extraits-calao*` and `exo-*` from the public download (`SKIP`); remove `SKIP`
   once the wiring is done and verified. Note: the already-published STMG PDFs still contain the Calao extracts until rebuilt.
3. **Première `matrice-en.tex` and `progression-en.tex`** (teacher-only, translated, never compiled). `main-en.tex` already inputs
   them in the teacher edition: rebuild Première and check FR/EN page counts; build standalone teacher PDFs (coverage matrix, annual
   schedule) in FR and EN, add catalog entries and check `#pack` and the library show them. Check wording ("Year 11 (Seconde)", Year 10/13 glosses).
4. **Slide figures for Terminale.** The pipeline (`extract_figs`, `compile_figs` in `build-slides.py`) works for the other courses.
   The authored Terminale decks (`content/slides/terminale-NN.json`) had their figures stripped (`clean_residue`). Regenerate the French
   drafts with `scripts/extract-terminale-slides.py` (it needs the French Terminale source: point it at `content/latex/terminale/livret.tex`
   after concatenating the chapters, or adapt it to read `chapitres/C??.tex`), have it write `figs`/`figs_en` (figure code lists, FR from
   `C??.tex`, EN from `C??-en.tex`) and per-slide `f` indices into the draft JSON; `build-slides.py` main already reads them. Keep
   `tests/slides_check.py` green (authored FR bodies must equal draft bodies). Verify with screenshots that every figure renders.
5. **Quality control of every interactive app** against the `math-interactive-slides` skill and its 3D addendum (1280x720 stage,
   one parameter object driving text and canvas, draggable handles, selectors, French typography `{,}`, step reveal, MathJax SVG).
   Audit the 9 labs, the challenges, the quadratic workshop, the visual lessons and the slide canvases: screenshot each, list defects,
   overwrite weak ones. Report per app; state that rendering was checked only where it was actually viewed.
6. Retire the overlay tooling (`patch-english-pdfs.py`, `fix-french-glyphs.py`, ledgers; keep `docs/translation-corrections.json`)
   only after Terminale is built from TeX; update `docs/AUDIT.md` and `docs/RESOURCE_LIBRARY.md`; finish the English proof-read.

## Final report must include
The Terminale source limits (item 1), the Calao decision (item 2), the [VERIFY] flags (sampling fluctuation 2 sigma/sqrt(n) in
C08 and EV3; Newton in C06; Euler in C09; Terminale slide issues such as "sur un domaine disjoint" and French `\text{}` inside maths in
terminale-03), the quality-control results, and the note that rendering was not viewed slide by slide.

## Working style
Delegate bulk translation or authoring to agents only with explicit briefs and run the checkers afterwards. Ask the owner before
launching expensive agent batches if a previous batch was rejected. Never claim a render was viewed unless it was.
