# Malagasy T12 séries C et D: source audit and integration plan

**1 November 2026. Task 1 of a supervised series: audit and plan only.** Nothing was imported, converted or published. Source
audited: the private backup repository, `resources/mg/t12-c-d/` (`README.md`, `T12-C-D-resources-cleaned.zip`, 135 files
kept of 151, `MANIFEST.json` lists the 16 removals). The book is one common volume for both series (entry point `Main.tex`,
class `bokiko.cls`, landscape two-column or portrait, pdfLaTeX). Unlike T10/T11 S, the owner has **not** yet confirmed sole
authorship of this book (see `malagasy-t10-t11-source-adaptation.md`: "do not extrapolate this ownership claim to T12").

## 1. Inventory

### Chapters in `Main.tex` (in book order)

Sizes in KB (L = `Lesona`, F = `Fiche`, E = `Exo`, V = `Valiny`). Blocks = `defi`, `thm`, `prop`, `prp`, `lem`, `cor`;
ex = worked examples; exe = exercises inside the lesson; exo = exercises of the `Exo` file; sol = solutions or proofs
(`sol`, `dem`, `proof` in `Valiny`, plus inline `valiny`); TikZ = `tikzpicture` in L+F+E.

| Part | Folder | Book title | L / F / E / V | Blocks | ex | exe | exo | sol | TikZ |
|---|---|---|---|---|---|---|---|---|---|
| I | `Arithmetique` | Arithmétique | 49 / – / 21 / 2 | 18 | 14 | 7 | 45 | 1 | 6 |
| I | `Proba` | Probabilité | 43 / 4 / 24 / – | 10 | 14 | 6 | 23 | 5 inline | 7 |
| I | `Stat` | Statistiques | 43 / – / 19 / – | 3 | 6 | 0 | 10 | 0 | 5 |
| II | `SystemeLineaire` | Systèmes d'équations linéaires dans R³ | 20 / – / 7 / – | 0 | 2 | 0 | 8 | 2 inline | 0 |
| II | `Complexe` | Ensemble des nombres complexes | 43 / 12 / 28 / 26 | 13 | 3 | 9 | 43 | 13 | 8 |
| II | `Barycentre` | Calcul barycentrique | 24 / – / 10 / – | 12 | 0 | 1 | 11 | 0 | 1 |
| II | `Affine` + `Isometrie` | Applications affine (one `\chapter`; `Isometrie` has none) | 23+37 / – / 12 / – | 10 | 7 | 0 | 9 | 0 | 13 |
| II | `Similitude` | Similitude plane | 16 / – / 21 / – | 2 | 1 | 0 | 14 | 1 inline | 1 |
| III | `Suite` | Suite numérique | 19 / 3 / 11 / 2 | 14 | 13 | 3 | 8 | 3 | 1 |
| III | `Fonction` | Généralités sur les fonctions (limites, continuité, dérivation, branches infinies) | 40 / 7 / 12 / – | 19 | 3 | 0 | 14 | 0 | 12 |
| III | `ExpoLog` | Fonction exponentielle et logarithme | 16 / – / 25 / – | 12 | 1 | 0 | 16 | 0 | 3 |
| III | `Integrale` | Primitives et Intégrales | 24 / – / 11 / – | 11 | 6 | 0 | 10 | 0 | 5 |
| III | `EquaDiff` | Equations différentielles | 8 / – / 8 / – | 2 | 1 | 1 | 10 | 0 | 0 |
| III | `Problems` | Problèmes (synthèse 2, analyse 13) | 2 + 45 | – | – | – | 15 | 0 | 0 |

Totals in the book: 236 numbered exercises (221 chapter + 15 problems), 27 lesson exercises, ~80 TikZ figures, one raster image
outside the book. **The `Valiny` files are never input** (`Main.tex` defines `\answers` but never calls it): the chapter
solutions (Complexe 7 solutions + 5 proofs, Suite 3, Arithmétique 1 proof) are orphans.

### Exams, sujets, appendices, files outside the book

| Item | Content | State |
|---|---|---|
| `Bac/C/2003`–`2018`, `Bac/D/2003`–`2018` | 32 Bac statements (C: exercise + two problems, 4/7/9 points; D: exercises + problem) | all input; no session header, so not checkable against the official papers from the file itself |
| `BacValiny/C`, `BacValiny/D` | 14 C + 13 D "corrections" (classified in section 3) | only C 2003, 2004, 2005 are input; all D entries are commented out |
| `Sujets/typeD.tex` | 6 practice papers (`sujetD`, 47 `exe`); comments say "Lauréat Bac D 2015, sujet type #1–#10" (7–10 empty) | input, but has no `\chapter`: it prints **inside the chapter "Corrigés Bac série C"** |
| `Appendix/` | Trigonométrie, Géométrie, Polygones, Binôme, Opérations (input); `Taloha` = old version (not input) | revision appendix |
| Not input | `Arithmetique/Exo (taloha).tex` (21 old exercises), `Nalefa TC.tex` (17 exercises, material moved to an earlier class), `Sieve.tex` (TikZ sieve), `Complexe/exercices.tex` (26 exercises, older set), `SystemeLineaire/Lesona (fohy).tex` (short variant), `ProStat/Lesona.tex` (short counting and probability lesson, 3 PNG), `fanampiny.sty` (older copy of `FotsySyMainty.sty`), `BacValiny/GeoGebra/*.ggb`, `Fonction/TVI.png`, three covers | candidates for the bank or discard; owner to say |

### Dependencies (TeX)

`bokiko.cls` (book class: geometry, `mathpazo`, `helvet`, titlesec, fancyhdr) → `Main.tex` loads babel French, ams*, `mathrsfs`,
`wasysym`, `pifont`, `marvosym`, `fancybox`, TikZ, xy, sidecap, then `tcd-compat` (→ `tcd-trollface`), `tcd-colour`
(→ `FotsySyMainty.sty`: all environments `defi thm prop prp lem cor rmk ex exo exe sol dem valiny fiche methode multiform mitanisa
sujetC sujetD`, 126 macros, mdframed), `tcd-professional` (tcolorbox restyling, redefines `\mybox \thmbox \defbox`). Chapter
files add 290 `\providecommand`s of their own (`\Courbe`, `\D`, `\Plan`, `\Angl`, `\congru`...), many redefined per file.

### Compared with T10 and T11 S

| | T10 / T11 S (done) | T12 C/D (this source) |
|---|---|---|
| Master | owner's Mada-Boky repository, compiled there, PDFs cut by `scripts/build-mada.py` | only the private backup zip; no compiled book, not in Mada-Boky |
| Editions | student and teacher editions (teacher material in `corrige`, `notepourlaclasse`, `\TeacherOnly`) | one edition; answers in separate, mostly empty `Valiny` files |
| One chapter = | one `.tex` file (`content/tex/mada/<course>/chapitres/chNN-*.tex`) | a folder of 2–4 files, `Isometrie` continues the `Affine` chapter |
| Vocabulary | `defn prop methode ex activite demonstration corrige...` (known to `build/mxbuild/mada.py`) | `defi thm prp lem cor rmk exe dem sol valiny fiche` (unknown to it) |
| Language | French | French; preface, comments and some macro names in Malagasy |
| Rights | owner's own work, confirmed | not confirmed; third-party marks in comments (section 4) |

## 2. Curriculum fit: C, D or both

Evidence from the sources only: the book is titled "Terminales scientifiques" and its preface says it follows the Bac's split
(arithmétique-probabilités-statistiques, algèbre et géométrie, analyse, sujets); no chapter says "C only" or "D only". The Bac
papers give the evidence below (keyword scan of the 32 statements, accents normalised; confirm by reading).

| Topic | Bac C 2003–2018 | Bac D 2003–2018 | Reading |
|---|---|---|---|
| Arithmétique (congruences, PGCD, bases) | 16/16 papers | 0 | C |
| Barycentres, lignes de niveau | 9 papers | 0 | C |
| Isométries, applications affines | most papers | rotations in a complex-number setting only (2003, 2007) | C |
| Similitudes | 13 papers (direct and indirect) | 13 papers (direct, via complex numbers) | both; indirect similitudes C [VERIFY] |
| Statistiques à deux variables | 0 | 2008, 2011, 2013, 2015, 2017 (+ type-D sujets) | D |
| Équations différentielles | 2003, 2006, 2008, 2012, 2014–2016 | 0 | C [VERIFY] |
| Systèmes linéaires (R³) | no evidence | no evidence | [VERIFY] (the T11 S course already has a linear-systems chapter) |
| Probabilités, complexes, suites, fonctions, exp/ln, intégrales | every year | every year | both |

**Important [VERIFY]:** the current Malagasy streams are S, OSE and L (the site's `t11s`; the 2024–2025 annual distribution
"RAPE T12 S" in `docs/CURRICULUM.md`). Whether this C/D book matches the current T12 S programme, and which C-only chapters
(arithmétique, barycentres, isométries, équations différentielles) are still in S, needs the official programme, which the owner
holds. Do not label anything "programme T12 S" before that check.

**Proposal: one course, series markers per chapter or section.** Id `t12s` if the owner confirms the book serves the current
T12 S programme (it then sits after `t11s`), otherwise `t12cd`. Two courses would duplicate 8 of 13 chapters. Markers: "C" or
"D" in the chapter record and on the page; within "Similitudes", the indirect part marked C. Proposed numbering (book order, with
statistics moved after exp/ln because a statistics exercise needs ln, as a source comment notes):

| No. | Chapter (French title) | Series (from the sources) | Folder(s) |
|---|---|---|---|
| 1 | Arithmétique | C | `Arithmetique` |
| 2 | Probabilités | C, D | `Proba` (+ `ProStat` if kept) |
| 3 | Systèmes d'équations linéaires dans R³ | [VERIFY] | `SystemeLineaire` |
| 4 | Nombres complexes | C, D | `Complexe` |
| 5 | Barycentres | C | `Barycentre` |
| 6 | Applications affines et isométries | C | `Affine`, `Isometrie` |
| 7 | Similitudes planes | C, D (indirectes: C) | `Similitude` |
| 8 | Suites numériques | C, D | `Suite` |
| 9 | Limites, continuité, dérivation | C, D | `Fonction` |
| 10 | Fonctions exponentielle et logarithme | C, D | `ExpoLog` |
| 11 | Statistiques | D | `Stat` |
| 12 | Primitives et intégrales | C, D | `Integrale` |
| 13 | Équations différentielles | C [VERIFY] | `EquaDiff` |

Supplements (course-wide, like the T11 S assessments): Problèmes de synthèse; Bac C 2003–2018; Bac D 2003–2018; sujets type D;
Annexes (rappels). The exam items depend on the decisions in section 3.

## 3. Bac papers and their "corrections"

Each `BacValiny/<s>/<year>.tex` was diffed line by line against `Bac/<s>/<year>.tex`.

| File | Classification | Evidence |
|---|---|---|
| C 2003 | **real worked solution**, complete | 34 KB vs 11 KB; every exercise and problem part solved, ends with Problème II Partie C |
| C 2004 | **real worked solution**, complete | 41 KB vs 13 KB, 11 figures, all parts |
| C 2005 | **partial** worked solution | 20 KB; stops at Problème II Partie A, question 2(b); Partie A 3–6 and Partie B missing |
| C 2006, 2008–2017 (11 files) | **near-copy of the statement** | similarity 0.91–0.99; the differences are typos (`Combein`, `rotatoins`, `fonctoin`) and layout: these are older, uncorrected copies of the statements, not solutions |
| D 2003–2008, 2010–2012, 2014–2017 (13 files) | **near-copy of the statement** | similarity 0.91–0.99, same kind of differences |
| C 2007, C 2018, D 2009, D 2013, D 2018 | no file | four identical copies removed at cleaning; C 2018 never existed |

So: 2 complete solutions, 1 partial, 24 near-copies, 5 missing. The near-copies must never be called "corrigés". The `Bac/`
files are the cleaner version and are the ones to use.

**[OPEN] Owner decision:** publishing official exam statements (copyright of the Ministry and the exam office, attribution,
transcription accuracy: the files carry no session header and were never checked against the official papers). Publishing the
three solutions is a separate decision (authorship and checking).

## 4. Quality

**Compilation (copy in a private scratch folder, the source left untouched).** The whole book compiles with pdfLaTeX in three
passes, portrait edition, 278 pages, no error, no undefined reference, no overfull box, once the local TeX installation's
missing fonts are stood in for: `mathpazo` (→ newpx, with `\let\openbox\undefined` because amsthm is loaded after it, and a
`\mathbold` fallback used in `Arithmetique`), `mathrsfs` (→ `\mathcal`), `wasysym` (no symbol actually used), `helvet` (sans from
newpx). The two covers need Zapf Chancery and were left out (covers are never published). `makeindex` was not run. The same
stand-ins as T10 (`docs/CURRICULUM.md`) plus three.

**Structural defects:** `Sujets/typeD` prints inside "Corrigés Bac série C"; `BacValiny/D.tex` is all comments, so the book has an
empty D-corrections slot; `Valiny` files are never input; `EquaDiff` defines `\mampiditratext` as empty, so the justification
text between the aligned lines of a proof disappears from the PDF; chapter title "Applications affine" (agreement).

**What `build/mxbuild/mada.py` would not handle (the slide decks):**

| Construct | Where | Effect today |
|---|---|---|
| `\begin{chapter}{Title}` ... `\end{chapter}` | Suite, Complexe, Barycentre | not recognised as a chapter title |
| environments `defi thm prp lem cor rmk dem` | all lessons | not in `RENAME`: not turned into definition/theorem/keypoint/proof slides |
| `exe`, `valiny`, `sol`, `fiche`, `sujetC`, `sujetD` | lessons, Valiny, Fiche, sujets | not in `DROP`: in-lesson exercises and answers would leak into the decks |
| `\providecommand` (290 in chapter files) | all files | `macros()` reads only `\newcommand`/`\renewcommand` from .sty/.cls: these stay unexpanded |
| `\mybox \thmbox \defbox \ansbox \vln \smallnota \TCDtag` | 300+ uses | bodies use colour, `\fbox` or `\newline`, so `macros()` skips them; raw macros reach MathJax |
| `\tikznode` in maths, `\Milimetre` | Suite footnotes, Bac solutions | TikZ inside a formula |
| `multiform` (79), `mitanisa` (12), `IEEEeqnarray*` (4), `description` with `\item[...]` (149), `\not 2` cancellations | everywhere | no rule; need `cases`/`aligned` rewrites |
| `Isometrie` without `\chapter` | | must be joined to `Affine` into one chapter file first |

**Mathematical errors seen in a sample (not fixed):**

| File | Error |
|---|---|
| `Complexe/Lesona.tex` (a cos x + b sin x) | footnote gives cos(u − v) = cos u cos v − **sin u sin v** (must be +) |
| `Suite/Lesona.tex` (sum 1 + ... + 100) | sets S_n = U_1 + ... + U_100 but applies the formula for U_0 + ... + U_n with (1 + 100)·100/2: right value, inconsistent with the stated formula |
| `Suite/Valiny.tex` | the exercise on V_n = 1/n and W_n = (−1)ⁿ concludes about "(U_n)" (names mixed); V_n = 1/n used without saying n ≥ 1 |
| `Arithmetique/Valiny.tex` | from b = (qq′)b concludes qq′ = 1 without treating b = 0 |
| `EquaDiff/Lesona.tex` | "f″(x) + a f′(x) + b f(x) = " with the "0" missing; the guessed form f = g e^{αx} is not justified as general |
| `BacValiny/C/2004.tex` | (g⁻¹)′(e) = 1/g′(e) assumes g⁻¹(e) = e without saying so [VERIFY against the statement] |

A full maths review per chapter is still needed; this sample covered parts of Suite, Complexe, EquaDiff, the Valiny files and
the three Bac solutions.

**Anonymity (rule of `PROJECT_BRIEF.md` section 2): the owner's full name appears in** `Main.tex` (`pdfauthor`, `\TCDAuthor`),
`bokiko.cls` (default `\TCDAuthor`, printed in the footer of **every** page: 253 times in the compiled text),
`FrontMatter/TitlePage.tex`, `Preface/Fanolorana.tex` (signature, city, date) and the covers `Foniny/Spiral*.tex`. The build must
empty `\TCDAuthor` and `pdfauthor` and never publish front matter or covers; clearing PDF metadata alone (as `build-mada.py`
does) is not enough because of the footer. No school, employer or student name was found.

**Provenance (rights):** source comments name third-party books for at least 27 exercises (a "Prépa Bac" series: Stat 5,
Isometrie, Barycentre, EquaDiff; a named textbook with page numbers: Similitude 8, Isometrie, EquaDiff) and for the six type-D
sujets (a 2015 Bac D annals book). The other exercises carry no provenance mark. [OPEN] what may be published.

## 5. Integration plan (one supervised task each)

| # | Task | Output | Size | Risks |
|---|---|---|---|---|
| 2 | Owner decisions (below); no code | answers recorded here | – | everything else waits on rights and the course id |
| 3 | Import into `content/tex/mada/t12/`: `preambule/` (`bokiko.cls` with empty `\TCDAuthor`, `FotsySyMainty.sty`, `tcd-*.sty`), `chapitres/chNN-*.tex` = Lesona + Fiche + Exo (+ Valiny), Affine and Isometrie joined, `\begin{chapter}` → `\chapter`, third-party exercises left out unless cleared; a student and a teacher driver | 13 chapter files (~600 KB), 2 drivers | L | where the master lives (Mada-Boky `Livres/T12` like T10/T11 S, or this folder); drift from the owner's copy |
| 4 | Book PDFs and manifest: compile both drivers (stand-ins documented in `docs/CURRICULUM.md`), add a `T12` table, course and `BOOKS` entries to `scripts/build-mada.py`, `MADA` in `build/mxbuild/refresh.py`; supplements (problems, annexes) | `dist/resources/t12*-NN/{chapter,teacher}.pdf`, manifest records | M | teacher PDFs equal the student ones except for 3 chapters with answers; footer anonymity check on every page |
| 5 | Converter: extend `build/mxbuild/mada.py` (RENAME/DROP for the bokiko vocabulary, `\providecommand`, box macros → plain text, `multiform` → `cases`, `IEEEeqnarray*` → `aligned`, `description` items) and the course loop in `scripts/build-slides.py`; tests on one chapter | converter + tests | M | regressions on T10/T11 S decks: run their deck checks too |
| 6 | Chapter pages and slide decks for the 13 chapters; labs and topics in the build table; deck checks | 13 pages, 13 decks | M | lessons are long and figure-heavy; decks lose the TikZ figures |
| 7 | Bac supplement (only if allowed): statements C and D 2003–2018 per year from `Bac/`, solutions C 2003–2004 (+ 2005 marked partial) after a maths check | 32 statements, ≤ 3 corrections | M | transcription accuracy; copyright |
| 8 | Online bank: exercises with checked answers in `site/js/exercises/bank-mada.js` (exists, empty `MADA` array, same shape as `authored.js`) or a new `bank-t12.js` | first slice, e.g. complexes and suites | L | answers mostly do not exist and must be written and checked |
| 9 | Maths review chapter by chapter (errors of section 4 and the rest), owner reviews | corrections in the import copy | L | the source copy and the owner's master diverge |

Order: 2, 3, 4, 5, 6, then 7 and 8 (independent), 9 alongside 3–6. One chapter (Nombres complexes: both series, has solutions
and a summary sheet) can run 3–6 first as a pilot.

**Owner decisions needed**

1. [OPEN] Rights: is the T12 book the owner's own work, and may the exercises marked with third-party sources and the type-D sujets
   be published (or must they be left out)?
2. [OPEN] Publication of official Bac statements and of the three solutions; attribution wording.
3. [OPEN] Course id and label: `t12s` (book serves the current T12 S programme) or `t12cd`; the official T12 S programme to check
   chapters 1, 3, 5, 6, 13 and the indirect similitudes [VERIFY].
4. [OPEN] Where the master lives (Mada-Boky or `content/tex/mada/t12/`), and whether fixes go back to the owner's copy.
5. [OPEN] Teacher edition: publish teacher PDFs only for chapters with answers, or write answers first.
6. [OPEN] Files not in the book (old exercise sets, `Nalefa TC`, `ProStat`, `Complexe/exercices.tex`): bank material or discard.


## Owner decisions (2 November 2026)

1. The T12 book is the owner's own work: publish it, with the owner's name removed everywhere (author macro emptied, no front matter, covers, preface signature or page footers). Leave out the third-party exercises (the "Prépa Bac" series, the named textbook) and the six "sujets type D": they are not imported.
2. Bac C and D statements 2003 to 2018: publish, with an attribution line (Baccalauréat malgache, série, année); publish only the solutions checked as real (C 2003, C 2004, C 2005 partial, marked partial). Further solutions are written by us and checked.
3. Two courses: T12 C (`t12c`) and T12 D (`t12d`); the shared chapters appear in both (one source, two catalogue entries), the C-only and D-only chapters in their course.
4. Not decided, defaults taken: master copy in `content/tex/mada/t12/`; teacher PDFs only where answers exist, the others after the bank has their answers; files outside the book stay in the private repository.


## Import (unit T3, 2 November 2026)

The book is in `content/tex/mada/t12/` (master copy): `chapitres/ch01` to `ch13` (one file per chapter: lesson, summary sheet, exercises,
and the chapter's answers in a `corrige` environment printed only in the teacher edition; Affine and Isometrie joined in `ch06`),
`supplements/` (problems, appendices), `bac/` (32 statements, each with the line "Baccalauréat malgache, série X, année"; the three
real solutions `c-2003-corrige`, `c-2004-corrige`, `c-2005-corrige`, the last with a printed "Corrigé partiel" note), `preambule/` (the
class with no author and no author footer, the styles, `t12-livre.sty` with the original packages and the edition switch),
`t12-eleve.tex` and `t12-prof.tex` (drivers, A4 portrait, no front matter, title page, preface or cover) and `t12-corps.tex`.
`chapitres.json` records, per chapter, the series (from section 2, `verify` notes kept), whether answers exist, the chapter order of
`t12c` and `t12d`, and the Bac files. Not imported: the 24 near-copy "corrections", the six type-D practice papers, the files outside
the book, the covers and front matter. `tests/test_t12_sources.py` keeps the folder anonymous (hashed names, `tests/banned.py`; the two
surnames of the owner were added to `tests/banned-sha256.json`, so the site-wide check also refuses them) and free of third-party
markers, and checks the index and the Bac files.

Order changed from the book: statistics comes after exp/ln (chapter 11), as a source comment asks; part III is "Analyse et statistiques".

**Exercises left out (third-party source named in a comment), 42.** In `Proba/Exo` the mark is an unnumbered heading ("exercises from
the Prépa Bac book") before exercise 10; it was read as covering every exercise after it (10 to 23) [VERIFY with the owner: if only
exercise 10 is third-party, exercises 11 to 23 can be restored from the private repository]. Isometrie keeps no exercise.

| Source file | Exercise no. | Source named | Begins |
|---|---|---|---|
| `Proba/Exo` | 10 | Prépa Bac series | Un groupe de 20 personnes doit d 'esigner parmi ses membres  |
| `Proba/Exo` | 11 | Prépa Bac series (group heading) | On tire simultan 'ement huit cartes d'un jeu de 32 cartes, e |
| `Proba/Exo` | 12 | Prépa Bac series (group heading) | On dispose d'un d 'e cubique dont les faces sont num 'erot ' |
| `Proba/Exo` | 13 | Prépa Bac series (group heading) | Une urne contient deux boules blanches et quatre boules noir |
| `Proba/Exo` | 14 | Prépa Bac series (group heading) | Dans un magasin d’électroménager, on s’intéresse au comporte |
| `Proba/Exo` | 15 | Prépa Bac series (group heading) | On dispose de deux urnes u_1 et u_2 . L’urne u_1 contient tr |
| `Proba/Exo` | 16 | Prépa Bac series (group heading) | Le quart d’une population a été vacciné contre une maladie c |
| `Proba/Exo` | 17 | Prépa Bac series (group heading) | Une urne contient (n+8) boules distinctes de trois couleurs  |
| `Proba/Exo` | 18 | Prépa Bac series (group heading) | Dans une foires, une publicit 'e annonce : << Un billet sur  |
| `Proba/Exo` | 19 | Prépa Bac series (group heading) | On lance un d 'e non pip 'e troi fois de suite. On note par  |
| `Proba/Exo` | 20 | Prépa Bac series (group heading) | Dans un jeu de trente-deux cartes, on distingue quatre coule |
| `Proba/Exo` | 21 | Prépa Bac series (group heading) | On consid `ere un questionnaire comportant cinq questions. P |
| `Proba/Exo` | 22 | Prépa Bac series (group heading) | Une usine produit des sacs. Chaque sac fabriqu 'e peut pr 'e |
| `Proba/Exo` | 23 | Prépa Bac series (group heading) | Une entreprise fabrique des lecteurs MP3, dont 6 sont d 'efe |
| `Barycentre/Exo` | 12 | Prépa Bac series | On consid `ere, dans le plan orient 'e, un triangle ABC . On |
| `Isometrie/Exo` | 1 | named textbook, already commented out | On se place dans le plan affine euclidien orient 'e. On cons |
| `Isometrie/Exo` | 2 | named textbook | Dans le plan affine euclidien, on consid `ere un carr 'e ABC |
| `Isometrie/Exo` | 3 | named textbook | Dans le plan affine euclidien orient 'e, on consid `ere un c |
| `Isometrie/Exo` | 4 | Prépa Bac series | Dans le plan orient 'e, on consid `ere le triangle ABC . On  |
| `Isometrie/Exo` | 5 | Prépa Bac series | On consid `ere dans un plan affine euclidien orient 'e un tr |
| `Isometrie/Exo` | 6 | Prépa Bac series | ~ minipage .6 Dans le plan orient 'e on consid `ere la figur |
| `Isometrie/Exo` | 7 | Prépa Bac series | Soit un triangle isoc `ele OAB , avec OA = OB , et un point  |
| `Isometrie/Exo` | 8 | Prépa Bac series | Dans un plan , on consid `ere trois points A , B et C non al |
| `Isometrie/Exo` | 9 | Prépa Bac series | On consid `ere dans le plan orient 'e un triangle 'equilat ' |
| `Isometrie/Exo` | 10 | Prépa Bac series | Dans le plan orient 'e, on consid `ere un triangle 'equilat  |
| `Similitude/Exo` | 1 | named textbook | On consid `ere la transformation f du plan complexe qui, `a  |
| `Similitude/Exo` | 2 | named textbook | On consid `ere la transformation S du plan complexe, qui `a  |
| `Similitude/Exo` | 3 | named textbook | On consid `ere dans le plan complexe les points A(1) , B(2)  |
| `Similitude/Exo` | 4 | named textbook | On donne dans le plan complexe les points A(-1+3i) et B(1-2i |
| `Similitude/Exo` | 5 | named textbook | Dans le plan complexe orient 'e, ABC est un triangle rectang |
| `Similitude/Exo` | 6 | named textbook | Dans le plan complexe muni d'un rep `ere orthonormal direct  |
| `Similitude/Exo` | 7 | named textbook | On donne dans le plan complexe les points B(i) , B'(4-3i) et |
| `Similitude/Exo` | 8 | named textbook | Caract 'eriser les transformations S_1 , S_2 et S_3 du plan  |
| `Stat/Exo` | 7 | Prépa Bac series | On consid `ere la s 'erie statistique double (x,y) d 'ecrite |
| `Stat/Exo` | 8 | Prépa Bac series, already commented out | L' 'etude d'une population animale en voie de disparition a  |
| `Stat/Exo` | 9 | Prépa Bac series | Au cours d'une s 'eance d'essai un pilote d'automobile doit, |
| `Stat/Exo` | 10 | Prépa Bac series | Une entreprise fabrique et vend des lots de circuits 'electr |
| `Stat/Exo` | 11 | Prépa Bac series | Le tableau suivant donne l' 'evolution du nombre de cas d'un |
| `EquaDiff/Exo` | 5 | named textbook | On consid `ere l' 'equation diff 'erentielle (E) : y' + y =  |
| `EquaDiff/Exo` | 6 | named textbook | V 'erifier que la fonction f_1 d 'efinie par f_1(x) = x 5 (2 |
| `EquaDiff/Exo` | 9 | Prépa Bac series | Soit f une fonction d 'efinie sur R `a valeurs r 'eelles, de |
| `EquaDiff/Exo` | 10 | Prépa Bac series | On appelle E l'ensemble des fonctions num 'eriques f admetta |

**Barycentre proofs (from T5).** Five of the six proofs sit inside their property box (`\begin{prp} ... \begin{proof} ...`); the slide
parser reads one level of boxes, so they gave no proof slide and their text ran into the property. `build/mxbuild/mada.py`
(`hoist_proofs`) now moves a nested proof after its box: Barycentre gives 6 proof slides; T10 and T11 S decks unchanged.

**Review list (maths, not fixed; a later unit fixes them):**

| File | Place | Issue |
|---|---|---|
| `chapitres/ch04-nombres-complexes.tex` | footnote, section "Transformation de a cos x + b sin x" | cos(u − v) given with − sin u sin v (must be +) |
| `chapitres/ch08-suites.tex` | example "somme des entiers de 1 à 100" | S_n defined from U_1, formula of U_0 + ... + U_n applied as (1 + 100)·100/2: right value, inconsistent with the stated formula |
| `chapitres/ch08-suites.tex` | corrigé, sequences V_n = 1/n and W_n = (−1)ⁿ | conclusions name (U_n); V_n = 1/n used without n ⩾ 1 |
| `chapitres/ch01-arithmetique.tex` | corrigé, proof of the divisibility property | qq′ = 1 deduced from b = (qq′)b without the case b = 0 |
| `chapitres/ch13-equations-differentielles.tex` | characteristic equation | "f″(x) + a f′(x) + b f(x) = " with the "0" missing; `\mampiditratext` empty, so the justifications of the aligned proof vanish; the form f = g e^(αx) not justified as general |
| `bac/c-2004-corrige.tex` | end of problem II | (g⁻¹)′(e) = 1/g′(e) assumes g⁻¹(e) = e without saying so [VERIFY against the statement] |
| `chapitres/ch06-applications-affines-isometries.tex` | chapter title | "Applications affine" (agreement) |
