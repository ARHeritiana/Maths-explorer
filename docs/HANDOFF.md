# Hand-off: Maths Explorer (state at checkpoint)

## Redesign session, 11 October 2026 (branch `redesign/2026-10-11`, from `ccr-80defba8-6udo9f`; no PR)
Brief: `docs/REDESIGN_PROMPT.md`. Plan: `docs/REDESIGN_PLAN.md`. Architecture: `docs/ARCHITECTURE.md`.
Owner decisions: layout approved (site/ + committed dist/), translation tables next to units, the 17 legacy Terminale
overlay PDFs dropped (done).

**Phase A (structure): DONE**, all checks green (`make check`: 13 checks).
- A1 `content/latex` -> `content/tex/courses` (git mv). A2 `content/data/manifest.json` is the source of truth;
  `mxbuild catalog` generates `catalog.json`, `resources-data.js`, `RESOURCE_PROVENANCE.json`. A3 web source in `site/`,
  `mxbuild site` copies to `dist/`. A4 `build/mxbuild` (tex driver reruns until .aux/.toc are stable; per-course cache),
  `Makefile`. A5 overlay tooling, `import-resources.py`, legacy PDFs, 3.4 MB ledgers retired; dated reports in
  `docs/history/`. A6 `ARCHITECTURE.md`, `AGENTS.md`, README.
- Privacy: plain-text owner/school/city names in guard lists replaced by hashed phrases (`tests/banned.py`, `.mjs`,
  `tests/banned-sha256.json`). [VERIFY with owner] the names remain in git history (rewrite = force-push, owner's call).
- Exit test: all 552 PDFs rebuilt via `make tex`: 0 page-count changes; 35 Automatismes sheets changed (stale TOCs
  fixed, arrow glyph), kept; the rest restored to avoid byte churn.
- `/simplify` and `/code-review` run (inline, no agent batch); all 10 review findings fixed.

**Phase B (TeX): IN PROGRESS.** Migrated (FR source + generated EN, mains from `content/data/manifest.json` "books"):
- Automatismes (17 units, 1,433 segments): student 27/27, teacher 47/47 pages (before 22/38: one sequence per page now).
- STMG (17 units): student 151/151, teacher 198/198 (before 152/203); a few lined "Notes" pages balance FR/EN per session.
- Seconde (17 units): student 94/94, teacher 98/98 (unchanged).
- Première (units C01..C10 with parts in corriges/, evaluations/, figures/): student 121/121, teacher 210/210 (before
  122/212); excerpts equal except chapter 10 notes/exercises (one page apart, recorded as `englishPages`).
- Terminale (front, C01..C14, annexes, evaluations intro and E1..E9): student 95/95, teacher 260/260 (before 95/262).
  Slide figures now compile with mxbook for every course (`build-slides.py` lost its per-course preambles).
- All migrated books: 0 overfull boxes, 0 undefined refs. Word comparison with the old PDFs: only running heads, box
  labels, TOC and line-break hyphenation differ.
- `twin stub` now removes unused segments and `twin check` fails on them (tables stay exact).
- Mechanisms: `build/mxbuild/migrate.py` (scripted renames per course, aligns old EN twins), `mxbuild.books` (mains),
  `mxbuild.tex.compile_pair` (FR/EN compiled together; per unit/session block, the shorter language gets notes pages),
  `tests/twin_parity.py` (numbers in maths and figures, all pairs), `scripts/build-slides.py` canonical parser.
- Source defects fixed on the way (all recorded in commit messages): French decimal commas in maths, ordinals as text,
  26 French "et" left in STMG English, English-only \clearpage hacks, English printing PGCD.
- Enrichment: units generated from `content/data/enrichment.json` (`mxbuild.enrichment`; maths now marked `$...$` in
  the JSON, which fixed wrong maths detection such as "il $y a C(5,3)$", "on $a 21$", "0,4, P(R|A)=0.5" in French);
  12 workshops x 4 resources + the quadratic sheet, sheet layout, pdfLaTeX; 37 student + 49 teacher pages, FR = EN,
  every resource 1 page except bayes solutions (now 1, was 2). XeLaTeX path, explorer.sty and 98 generated files removed.
- Full `make tex`: 4 min 10 s (baseline 622 s). Rebuilt PDFs that differ only in /ID keep the committed copy.
- Uniform structure and notation (owner request, 2026-10-11; English prints English notation, owner's choice):
  `mx-notation.sty` defines once every notation that differs by language (`\num \pc \intff/\intoo/\intfo/\intof
  \ent \pt \ens`); all 203 units rewritten (`python -m mxbuild notation --migrate`, round trip checked), the twin
  decimal rule removed, slides render the same commands (`notation.expand`, tested against the class), the player's
  MathJax table generated from `mx-math.sty`. Every unit has the same shape (lint): `\mxunit[n]` or `\mxfront` opening,
  no hand styling (new class commands `\mxbanner`, `\mxcontinued`, `\mxpseudo`, `\mxtab`; figure minipages ->
  `figurebox`), one cover command for every booklet. Every excerpt starts a balanced block: all 330 FR/EN PDF pairs have
  equal page counts (`tests/pdf_parity.py`); Première 133/222 and Terminale 123/289 pages (were 121/210, 95/260).
- NEXT: B4 (format file, figure externalisation, retire style-resource-pdfs.py).
- Each course: write a PLANS entry in migrate.py, `python -m mxbuild migrate <course> --dry-run` until no refusals
  (fix source defects in the old files first), migrate, write the front unit, add the book to the manifest, point the
  builder at generated mains, compare words with the old PDFs (`/tmp` baseline must be rebuilt in a new container),
  view a sample, `make check`, commit.
- Open question for the owner: `terminale-fluency-*` and `terminale-methods-*` supplement PDFs (8 files, companion
  data) are overlay-era copies of banks 0/1; drop them too for consistency? Not done.

Container setup: `apt-get install texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-science
texlive-lang-french texlive-pictures texlive-latex-recommended texlive-pstricks texlive-xetex latexmk`,
`pip install pymupdf playwright==1.56.0 pyflakes`. Baseline numbers: `docs/REPO_AUDIT.md`.

## Earlier state (before the redesign)

This repository, branch `claude/repository-audit-bsfs8y`. Do not open a PR unless asked.
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
  `python3 tests/slides_check.py`, and `python3 scripts/check-stmg-twins.py`, `git grep -nE "drive\.google|docs\.google"` (must be empty; the owner also gave three folder-ID prefixes in the original task, which are deliberately not repeated here).

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

## Status after the 11 October 2026 session
Tasks 1 to 4 and 6 are done (6: decided to keep the tooling), task 5 is partly done (see below). Work is on branch `ccr-80defba8-6udo9f`
(created from `claude/repository-audit-bsfs8y`; no PR opened). Suggested next steps: (a) the owner's decisions flagged [VERIFY] below,
(b) deeper by-eye QC of labs in English and on narrow screens, (c) rebuild or drop the 17 legacy Terminale overlay files and the 156
`shared` ones, then retire the overlay tooling, (d) limit-specific and Terminale-level canvases.

## Task list with outcomes (originally "the next tasks, in order")
1. **Terminale PDFs from the 6 September source**: DONE except the proof-read (see below).
   - `build-tex-resources.py terminale --chapters 1 2 ... 14 --appendices` now builds both books (student 95, teacher 262 pages, FR=EN),
     splits per chapter (`chapter`, `teacher`, `activities`, `notes`, `exercises`, `problems` = Devoir à la maison, `corrections` =
     Conduite et corrigés) and registers the entries itself (`prepare_terminale`, `register_terminale`: catalog.json and companion
     `resources-data.js`, including the old wrong teacher path of terminale-01). Appendices: algorithms, proofs, oral, assessments
     (assessments also feed `terminale-revision-bank-2`, flagged `texBuilt`). Then run `style-resource-pdfs.py <pdfs>`,
     `finalize-resources.py`, `publish-sources.py` (done, checks green). `publish-sources.py` now lists the Terminale entry points.
   - Excerpts can differ by a page between editions (chapter 5 exercises: FR 2, EN 1, a wrapped line). `finalize-resources.py` records
     `englishPages` for such files; chapter and teacher PDFs always match.
   - Legacy overlay PDFs kept (no counterpart in the 6 September source): `practice`, `assessment` per chapter, `terminale-revision`
     banks 0 and 1 (fluency, methods). They come from the older "Refonte 7 sept" overlay and are labelled `local-machine`.
     Tell the user: the 6 September source is thinner than the published "Refonte 7 sept" PDFs (95/262 pages versus 166/346).
   - Source edit: in `chapitres/C02(-en).tex` the cube figure moved from the notes into the research activity ("ci-dessus" became
     "ci-dessous"), otherwise the activity excerpt had no figure.
   - Printed chapter numbers keep the textbook numbering (e.g. vectors prints "CHAPITRE 10" while the site card is chapter 2). The
     booklet says so in "Utiliser ce livret". [VERIFY] whether the owner wants the printed numbers aligned with the site.
   - E1 to E5 EN twins proof-read by sampling (E1, E3, E5 read, French-residue scan over all EN files: clean). Fixed: "5 marks" to
     "5 points" and a garbled sentence in E4/E5/E9 (repeated trials). Not every line was read.
   - After any rebuild run `sh scripts/restyle-changed.sh` (styles modified PDFs, finalize, publish-sources).
   - Source oddities to report as [VERIFY]: E6 intro says "first four questions independent" but the exercise has five; E7 solution
     starts "No." for a compare-and-explain question; sources cite an external site "Lycée d'adultes, Paul Milan"; "Barbazo"
     textbook references (they remain in the exercises excerpts).

2. **STMG: Calao extracts replaced by original exercises**: DONE and verified (this session).
   - Verification (done by hand and by script, not by the authors): every number of the 55 exercises was recomputed (Python:
     regressions, powers, logarithms, probabilities, tables; all correct), unambiguity and curriculum fit read through, the
     replaced exercise targets kept (target line shown to teachers only), TikZ figures rendered and viewed for sessions 29, 39, 48
     (trees were inverted with `grow=right`: now `grow'=right`). Wording fixes: B22 (confusing remark removed), A11 (abscissa
     wording). Answer lines reduced for sessions 38, 52, 54 so that FR and EN keep equal page counts.
   - Wiring: `\DefExo`/`\ExoSession` and the `exerciceapp` box now live in `preambule(-en).tex`; `exo-A..D(-en)` are included from
     `livret-tstmg(-en).tex`; every `\CalaoSession` became `\ExoSession` (110 replacements); `extraits-calao*.tex` deleted from the
     working tree (the text remains in git history). `\manuelref` boxes now say "Pour prolonger / Further practice" and keep only
     the page and exercise numbers of the textbook; intro, sources annex and README rewritten. No statement of the textbook is
     reproduced any more. `SKIP` in `publish-sources.py` is neutralised, the exo files are public.
   - Removed three `\ifprof\clearpage` page-alignment hacks from the EN chapters 3 and 5 (they broke alignment once exercises changed).
   - New check: `python3 scripts/check-stmg-twins.py` compares the numbers inside maths and figures of FR and EN exercise files.
     Add it to the pre-push list. Page counts: student 152/152, teacher 203/203. PDFs rebuilt, styled, finalised.
   - Caveat for the owner: the exercises are original but were written to the same targets as the textbook exercises they replace;
     [VERIFY] whether the "Further practice" page and number citations of the textbook are acceptable to the owner.

3. **Première matrix and schedule**: DONE. The EN twins compile inside the teacher book (122/212 pages, FR=EN). `build-tex-resources.py
   premiere ... --appendices` now cuts `premiere-revision/matrix(.pdf|-en.pdf)` (6 pages) and `schedule` (17 pages) out of the teacher
   book (`standalone_teacher`), registers them in catalog.json (`premiere-revision-matrix/-schedule`, teacher, type solutions) and as
   teacher-only supplements in the companion data (`resource-library.js` handles a teacher-only supplement; `pack-builder.js` has
   the two new parts). Verified in the browser that the library lists both. Wording fix: "Year 10 (seconde)" became "Year 11
   (seconde)" (France seconde = age 15 to 16 = England Year 11; Terminale = Year 13 was already right) [VERIFY the gloss].
   `tests/learning.test.mjs` now expects 146 provenance entries. Remember to restyle after every rebuild (`style-resource-pdfs.py <changed pdfs>`).

4. **Slide figures for Terminale**: DONE. `extract-terminale-slides.py [outdir]` now reads `chapitres/C??.tex` (FR) and `-en` (figure code), writes
   `figs`/`figs_en` and per-slide `f` into the drafts; `build-slides.py` renders them (6 Terminale figures: C02 cube in the activity,
   C03, C06, C08, C11, C14; the other TikZ pictures of those chapters sit in exercise sections and are not in the decks). Viewed
   by screenshot: C02 (FR and EN), C06, C11, plus the render check that the SVG is loaded in C03, C08, C14. The C02 deck lost its
   caption-only slide (the figure moved into the activity), authored deck and `slides_check` updated. MathJax macros `\dd`, `\vi`, `\vj`
   were missing in `dist/slides/player.html` (shown as red text): added; `tests/slides_smoke.py` now fails on red undefined macros
   (MathJax shows them as red `mtext`, not as `merror`). Result: 47 decks, 1,044 slides, 59 slides with figures.

5. **Quality control of the interactive apps**: PARTLY DONE. Viewed by screenshot (not only scripted):
   - All 34 slide canvases in EN (default state), six of them also in FR. Defects found and fixed: polynomial and sequence formulas
     ("1x² + -2x + -1", "u_n = 2 + 1n", "|x − -0.5|", "10^1") now print "x² − 2x − 1", "2 + n", "|x + 0.5|", 10 with superscript; the Successive
     changes (pct) canvas clipped its third bar (layout now proportional to the canvas height); minus sign in "t₂ = −20 %";
     Terminale canvases were all stuck right after the title slide and are now placed after the matching unit (the integral canvas in C10
     was removed: Riemann sums come in C11). Interaction (drag) is covered by `tests/slides_smoke.py`, not re-checked by eye.
   - The 9 labs at their default state (FR, 1280x900) and the challenge list, two challenge pages, the quadratic workshop, the
     Première chapter 4 experiment tab and the pathways page: no layout defect seen. Not done: dragging/step-through of every lab
     by eye, English view of labs/challenges, narrow-screen view (the browser test covers 4 widths and 200 % text).
   - Open observations (not fixed): the vectors and complex labs keep an equal-scale frame that makes the default vectors small on wide
     panels; the fn explorer labels "(0 ; C)" and "(1 ; Cb)" are jargon and overlap when b is near 1; terminale-01/03 reuse the generic
     "first terms" canvas (no limit-specific canvas yet).
   - Slide decks follow the `math-interactive-slides` skill only in part (1280x720 stage, MathJax SVG, draggable handles, step reveal
     for Seconde answers are in place; one parameter object drives text and canvas per widget). No new apps were authored.

6. Overlay tooling: NOT retired, on purpose. 156 `shared` resources and 17 legacy Terminale files (per-chapter guided practice and MCQ, banks
   0 and 1) are still overlay PDFs, so `patch-english-pdfs.py`, `fix-french-glyphs.py`, the ledgers and `docs/translation-*.json` stay.
   They can go only after those files are rebuilt from TeX or dropped. `docs/RESOURCE_LIBRARY.md` is updated; `docs/AUDIT.md` (dated
   10 October) was not edited. Remaining English proof-read: overlay translations were reviewed in the earlier audit; the TeX twins
   were checked by scripts and sampled by eye only.

## Final report must include
The Terminale source limits (item 1), the Calao decision (item 2), the [VERIFY] flags (sampling fluctuation 2 sigma/sqrt(n) in
C08 and EV3; Newton in C06; Euler in C09; Terminale slide issues such as "sur un domaine disjoint" and French `\text{}` inside maths in
terminale-03), the quality-control results, and the note that rendering was not viewed slide by slide.

## Working style
Delegate bulk translation or authoring to agents only with explicit briefs and run the checkers afterwards. Ask the owner before
launching expensive agent batches if a previous batch was rejected. Never claim a render was viewed unless it was.
