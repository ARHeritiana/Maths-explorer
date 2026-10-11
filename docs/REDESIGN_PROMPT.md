# Hand-off prompt: total redesign of Maths Explorer (site, repository, TeX)

Paste everything below the line into a new session on `arheritiana/maths-explorer`. Start from branch `ccr-80defba8-6udo9f` (latest work),
create a working branch `redesign/<date>` from it, commit and push regularly, do not open a PR unless asked, update `docs/HANDOFF.md` as you go.

---

## 0. Who and what
Owner: a French-lycée mathematics teacher in Madagascar. Reformed Christian, father. Wants precision, no filler, no invention. Reply in English,
structured as TL;DR, answer, justification, sources, warnings; maths in LaTeX; flag uncertainty ([VERIFY], [HORS PROGRAMME]); say "I do not know" when
you do not. Never claim a render was viewed unless you viewed it.

Read first, in this order: `AGENTS.md`, `docs/HANDOFF.md`, `docs/RESOURCE_LIBRARY.md`, `docs/SLIDES.md`, `docs/CURRICULUM.md`, `docs/DESIGN_PLAN.md`.

## 1. Hard constraints (carry over unchanged)
- Never write Google Drive URLs, folder or file IDs, owner details or e-mails in the repo, site, PDFs, catalogues, metadata or docs. Origin is described only
  as "owner-supplied LaTeX sources". Never link from the site to a personal space. All resource copies are hosted in the site.
- Every downloadable resource exists in French and English with equal page counts (a per-excerpt one-page drift is tolerated and recorded as `englishPages`).
  One discreet AI-content notice, in the footer only.
- Translate prose only. Never alter maths, TikZ, `\includegraphics` or listings. No school, teacher or city names in published material.
- Curriculum: Première BO n°14 of 2 April 2026 (no binomial distribution); Terminale STMG BO spécial n°8 of 25 July 2019; Terminale spécialité: 2019 programme,
  still applicable in 2026-2027. Flag out-of-scope content.
- Every exercise created or changed is double-checked (recompute numbers, pedagogy, curriculum, same target as the item it replaces).
- New visible text has no em-dashes. The site keeps one mint accent.
- Textbook statements are never reproduced (STMG Calao extracts were removed for that reason; only page and exercise numbers may be cited).
- Pre-push checks, all green: `npm test`, `npm run check`, `python3 tests/run_browser.py`, `python3 tests/slides_smoke.py`, `python3 tests/slides_check.py`,
  `python3 scripts/check-stmg-twins.py`, and `git grep -nE "drive\.google|docs\.google"` must be empty.
- LaTeX: pdfLaTeX without shell escape by default; `mathpazo`; containers `mdframed` (left rule, breakable) for large boxes, `tcolorbox` only for small ones;
  numbering with `\newcounter`, never by hand; `\needspace`/`\nopagebreak` for page breaks; comment every non-obvious macro.

## 2. Current state (measured 11 October 2026)
- `content/latex/`: 6 trees, 436 `.tex` files, about 42,700 lines. Seconde 38 files, Première 154, Terminale 66, STMG 40, Automatismes 40, Enrichment 98.
  Every file has an `-en` twin (English). Only two style files exist (`premiere/styles/livret(-en).sty`, `enrichment/explorer.sty`); the other courses
  define their environments in a per-course `preamble(-en).tex` or `preambule(-en).tex`. Environment names differ per course for the same idea
  (French: `retenir`, `methode`, `exemple`, `repere`, `erreur`, `exercice`, `application`, `preuve`, `fiche`, `cours`, `ex`, `reponse`, `vigilance`,
  `activite`, `traceecrite`, `sortie`, `dm`, `probleme`, `correction`, `profbox`...). Entry files differ too (`eleve.tex/professeur.tex/main.tex/livret.tex/livret-eleve.tex`).
  Edition switches differ (`\versionprof`, `\VERSIONPROF`, `\EditionProf`, `\VERSIONELEVE`, `\ifprof`).
  Language handling is by duplicated `-en` files, not by a switch.
- Build scripts (`scripts/`): `build-tex-resources.py` (premiere, seconde, terminale), `build-automatismes.py`, `build-stmg.py`, `build-enrichment-latex.py`,
  `build-slides.py`, then `style-resource-pdfs.py`, `finalize-resources.py`, `publish-sources.py` (`sh scripts/restyle-changed.sh` chains the last three).
  Overlay-era tooling still needed for 156 `shared` resources and 17 legacy Terminale files: `import-resources.py`, `translate-resources.py`,
  `patch-english-pdfs.py`, `fix-french-glyphs.py`, `translation-*.py`, `docs/translation-*.json`.
- Site: static, `dist/` (171 MB, mostly PDFs). `dist/js/`: `app.js` 1,086 lines, `content.js` 804, `resources-data.js` 2,692 lines (generated, committed),
  `enrichment-data.js` 1,087, plus library, pack builder, slides page, quadratic workshop, visual lessons, study guides. Styles are spread over `style.css`,
  `taste.css`, `learning.css`, `library.css`, `pack.css`, `magic.css`. Slides player in `dist/slides/` (45 decks plus 2 shared, 34 widget canvases).
- Data duplication: catalogue facts live in `dist/resources/catalog.json`, in `dist/js/resources-data.js` (companion) and in
  `docs/RESOURCE_PROVENANCE.json`, `docs/TEX_CONVERSION.json`, several ledgers. Built PDFs and TeX sources are both committed under `dist/`.
- Known debts: see `docs/HANDOFF.md` (legacy overlay files, labs not audited in English or on narrow screens, vectors/complex labs scale, generic canvases in Terminale,
  `docs/AUDIT.md` dated).

## 2b. Skills to use (load them with the Skill tool before the matching work)
- `design:design-system` and `design:design-critique` for the site design system and its audit; `design:accessibility-review` for WCAG 2.1 AA;
  `design:design-handoff` for tokens and component specs; `design:ux-copy` for microcopy in French and English.
- `anthropic-skills:design-taste-frontend` (audit-first redesign, anti-slop pre-flight) and `anthropic-skills:theme-factory` only if it does not break the one-accent rule.
- `dataviz` before any chart, plot or stat tile. `artifact-design` is for published Artifacts only (not for the static site).
- `anthropic-skills:math-interactive-slides` and `anthropic-skills:math-slides-interactive-3d` for every slide canvas and lab (1280x720 stage, MathJax SVG,
  one parameter object driving text and canvas, draggable handles, French `{,}` typography, step reveal, rotatable 3D).
- `anthropic-skills:math-series-guardrails` for any new or rewritten lesson, exercise bank or evaluation (drift, premature terms, wrong answers).
- `simplify` and `code-review` at the end of each phase; `anthropic-skills:pdf` for PDF operations.
- Playwright and Chromium are per container: `pip install pymupdf playwright==1.56.0`, Chromium at `/opt/pw-browsers/chromium`; TeX Live via
  `apt-get install texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-science texlive-lang-french texlive-pictures texlive-latex-recommended texlive-pstricks`.

## 3. Mission
A total redesign in four tracks. Do them in this order and keep the site and all resources working and green after each phase (no big-bang merge).

### Track A. Repository structure
Audit the whole tree first (`git ls-files | sed 's|/[^/]*$||' | sort | uniq -c`, sizes, duplicated data, dead scripts), write `docs/REPO_AUDIT.md` with findings,
then propose and implement a structure along these lines (adapt where the audit says otherwise):
```
content/
  tex/
    core/            shared LaTeX system: class, packages, environments, macros, i18n, editions (see track B)
    courses/<course>/ chapters, assessments, annexes: ONE source per unit, both languages inside it
    banks/           shared banks (fluency, methods, proofs, algorithms), included by courses
    figures/         shared TikZ/pgfplots figures, one file per figure, used by TeX and by the slide pipeline
  slides/            authored decks and drafts
  data/              curriculum map, resource manifest source of truth (one YAML or JSON), glossary FR-EN
site/                static site source (HTML, CSS tokens, JS modules); built output goes to dist/
build/               pipeline code (Python package, not loose scripts) and all generated artefacts (gitignored)
docs/
tests/
```
Rules: one source of truth per fact (catalogue, page counts, provenance are generated from the manifest, not hand-edited); generated files either not committed
or committed in one place with a header saying so; built PDFs may stay committed under the deploy folder only if hosting requires it; remove dead overlay tooling
only when no resource depends on it (currently 156 `shared` and 17 legacy files do: rebuild them from TeX or drop them first, then retire it).
Provide `make` (or a single `python -m build ...`) targets: `make tex COURSE=terminale`, `make site`, `make check`, `make all`, with a cache so unchanged units are not recompiled.
Provide a short `docs/ARCHITECTURE.md` and update `AGENTS.md`.

### Track B. TeX redesign (the heart of the job)
Goal: one coherent, optimised LaTeX system so any unit can be included in any main file, in either language and either edition, with identical environment names everywhere.
1. Inventory all environments, macros, counters, colours and packages across the six trees (script it; output a table to `docs/TEX_INVENTORY.md`). Map synonyms
   to one canonical vocabulary (English-keyed names such as `keypoint`, `method`, `example`, `proof`, `pitfall`, `activity`, `exercise`, `application`, `solution`,
   `teachernote`, `homework`, `exitticket`, `figurebox`), keep French only as the displayed label.
2. Create `content/tex/core/`: a class `mxbook.cls` (options: `course=`, `lang=fr|en`, `edition=student|teacher|both`, `layout=booklet|sheet|slide-figs`), and small
   packages `mx-env.sty` (environments), `mx-math.sty` (macros: `\vect`, `\R`, `\dd`, `\vi`, `\vj`, `\Card`, `\pgcd`...; define every macro once and keep the MathJax macro
   table in the player generated from this file), `mx-i18n.sty` (all labels and decimal conventions from one dictionary keyed by `lang`), `mx-edition.sty`
   (one switch: `\ifmxteacher`, replacing `\versionprof`, `\VERSIONPROF`, `\EditionProf`, `\VERSIONELEVE`), `mx-figures.sty` (pgfplots styles, colours, tikz libraries),
   `mx-layout.sty` (headers, footers, page geometry, `\needspace` policy), `mx-code.sty` (Python listings).
   Colours: named palette that matches the site tokens (one mint accent, navy, teacher blue); no raw RGB in content files.
3. DECIDED by the owner: FR and EN are generated as a pair (`unit.fr.tex` and `unit.en.tex`), never one file with both languages. Authoritative source:
   the French unit written in the canonical environments, with maths and figures in separate shared files (`<unit>.math.tex` is not required; use `figures/` and
   `\input` of formula blocks where useful). The English twin is generated or checked from it: a tool (`tools/twin.py`) extracts the prose segments of the French
   unit into a translation table keyed by stable segment ids (`docs/translations/<unit>.json`, reviewed English text, glossary from `translation-terminology.py`),
   rebuilds `unit.en.tex` by substituting prose only, and FAILS if maths, TikZ, listings or `\includegraphics` differ or if a segment lacks a translation.
   The generated `.en.tex` is committed (so people can compile locally) and marked `% GENERATED, edit the French unit or the translation table`.
   Migrate the 218 existing twin pairs by aligning them paragraph by paragraph into the translation tables; refuse to align when the maths differs and list those units.
   Keep the `check-stmg-twins.py` invariant (numbers in maths and figure code identical) as a test on every pair. Record the decision in `docs/ADR-0001-tex-i18n.md`.
   A short `\mxtr{fr}{en}` helper may exist for labels inside `mx-i18n.sty` only, not in content units.
4. Unit contract: every unit is a self-contained `\mxunit{id}{...}` with metadata (course, chapter, kind, level, programme reference, duration, prerequisites,
   tags) in a header comment or YAML front matter that the pipeline reads. Units are included from course mains with `\mxinclude{courses/terminale/c06}` and
   from shared banks. No unit may redefine macros or load packages. Labels are namespaced (`<course>:<unit>:<name>`).
5. Mains are generated or tiny: `main.tex` per (course, edition, lang) is a 10-line file choosing options and listing units from the manifest.
   Pipeline compiles each main once, splits by bookmarks (as `build-tex-resources.py` does), and also compiles single units for excerpts and for slide figures.
6. Optimise: single `latexmk`-style driver with `-halt-on-error`, a precompiled format (`mylatexformat` or `.fmt`) for the core, `\input` instead of `\include` for
   clean cross-references, externalised TikZ (compile each figure once to PDF/SVG in `figures/`, shared by books, slides and site), remove unused packages,
   fix all overfull boxes and undefined references (current builds report 0; keep it), avoid `\clearpage` hacks (three were removed from STMG EN; add a lint that forbids them),
   page-count parity check FR vs EN in the build.
7. Quality gates (script them in `tests/`): compile all mains in all four variants; FR/EN maths and figure parity; no TeX leftovers in slide HTML; no banned strings
   (names, drive links, e-mails); no textbook statements; every `\ref` resolves; every macro used is defined in core; page budget per unit.
8. Documentation: `docs/TEX_STYLE_GUIDE.md` (environment catalogue with one example each, naming, i18n rules, figure rules, how to add a unit) and a minimal compilable example (per the owner's preferences: pdfLaTeX + mathpazo, `\newcounter`, `mdframed`, `\needspace`).
9. Ask the owner before launching expensive agent batches (a previous batch was rejected). Use agents only with explicit briefs and run the checkers afterwards.
   Migration order: Automatismes and STMG first (smallest, already verified), then Seconde, Première, Terminale, Enrichment last.
10. Acceptance: all 436 current files replaced by the new system or explicitly listed as legacy; every public PDF rebuilt; page counts equal FR/EN; visual diff of a sample of
    pages (before and after) viewed and judged acceptable; `dist/sources` republished with the new layout and a README for people who want to compile locally.

### Track C. Site and design system
Use the design skills (section 2b). Process: audit first (screenshots of every route at 360, 768, 1280 px, light and dark if present, English and French), list defects,
then redesign. Deliverables:
- One token file (`site/styles/tokens.css`: colour, type scale, spacing, radius, motion, one mint accent), then base, layout, components, pages. Merge the six current CSS files.
- A small component library with documented states (button, card, chip, tab, accordion, document card, resource row, canvas frame, readout, quiz field, toast) in `docs/DESIGN_SYSTEM.md`,
  with accessibility notes (WCAG 2.1 AA: contrast, focus order, touch targets 44 px, reduced motion, screen-reader names, keyboard operation of every canvas).
- Information architecture: keep Lessons and exercises, Slides, Custom pack, Laboratory, Challenges, Pathways, LaTeX sources; simplify the library (one catalogue view driven by the manifest, filters by course, type, language, edition),
  make the PDF reader links language-aware, add a clear "what is in each course" page and a teacher mode that reveals teacher files. Respect: no links to personal spaces, one footer notice.
- JS: split `app.js` (1,086 lines) into route modules; generate `resources-data.js` and `catalog.json` from the manifest; no hand-edited data; keep no-build static hosting (ES modules) unless a build step is justified in an ADR.
- Interactive apps: audit every lab, challenge, workshop, visual lesson and slide canvas against the `math-interactive-slides` skill and its 3D addendum, in FR and EN, on desktop and narrow screens, by eye
  (screenshots) and by script (drag, keyboard). Fix the open observations in `docs/HANDOFF.md` (equal-scale frames making vectors tiny, jargon labels, generic Terminale canvases; add limit, convexity and plane/line-intersection canvases where absent).
  Report per app what was viewed and what was only scripted.
- Charts: apply the `dataviz` skill (palette, legends, axes, light/dark) to all canvases and plots so they read as one system.

### Track D. Content and curriculum integrity
Re-run, on the new structure: curriculum alignment table (programme item to resource) in `content/data/`; recompute every exercise number that migrates (STMG 55 exercises were verified once; do not
re-derive them unless changed, but keep `check-stmg-twins`-style parity); proof-read English twins (E1 to E5 and chapter prose were only sampled); resolve the [VERIFY] list in `docs/HANDOFF.md`
(chapter numbering printed vs site, Year-11 gloss for seconde, Calao page citations, E6/E7 oddities, sampling fluctuation, Newton, Euler, "sur un domaine disjoint", French `\text{}` inside maths in terminale-03 slides).

## 4. Process
1. Plan first: write `docs/REDESIGN_PLAN.md` with phases, risks and the TeX prototype result; get the owner's go-ahead on the repository layout (the i18n decision is already made: generated pairs) before moving files.
2. Move files with `git mv`, keep history; never leave the site broken between commits; run all pre-push checks before each push.
3. Keep a compatibility layer until the end (old URLs `dist/resources/...` keep working or are redirected; `docs/RESOURCE_PROVENANCE.json` regenerated).
4. Update `docs/HANDOFF.md` continuously. When the session limit nears, reach a clean state, commit, push, and leave the handoff accurate.
5. Final report: what changed, what was verified (and how: viewed vs scripted), what was not done, all [VERIFY] flags, measured before/after numbers (files, lines, compile time, repository and `dist` size, page counts).
