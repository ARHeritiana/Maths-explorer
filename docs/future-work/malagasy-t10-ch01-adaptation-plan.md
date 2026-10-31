# Malagasy T10, chapter 1 (Logique): adaptation plan and independent verification

Status: planning note, 31 October 2026, workstream D (`docs/ACTIVE_WORKSTREAMS.md`). Nothing here is published; no file of
`site/`, `content/`, `manifest.json` or `dist/` was touched. Sources read: `content/malagasy/chapters.json` (unit
`mada-t10-01`, state `source-imported-unreviewed`, `visible: false`), `content/malagasy/source/t10/chapters/01-logique.tex`
(1041 lines), `activities/01-logique.tex`, `solutions/00-introduction.tex`, `solutions/01-logique.tex` (1004 lines), and the
draft `docs/future-work/malagasy-t10-logic-interactive.html` (commit 87a2fdc). Language rule: Malagasy curriculum, French only.
The bilingual goal for lessons stays on standby (unfinished work).

## 1. Structure of the source chapter

Part opener "Algèbre et Algorithmique"; chapter `Logique` (`chap:logique`); entry activity via `\input{activities/01-logique}`.

| Block | Content |
|---|---|
| Anecdote, Objectifs | Aristote, Boole; 5 objectives (énoncé/proposition/prédicat, connecteurs, quantificateurs, négation et réciproque, contraposée and absurde "en approfondissement") |
| §1 Énoncés et propositions | `defn` Proposition; `ex` (4 cases incl. predicate `x>3`, imperative) |
| §2 Négation et connecteurs | `defn` Connecteurs (table ¬, ∧, ∨, ⇒); `defn` Équivalence; `\horsprogramme` note; `methode` Contraposée; figure flowchart "choisir sa méthode"; `attention` réciproque |
| §3 Quantificateurs | `defn` ∀, ∃; `prop` négations (2 formulas); Venn figure (P∧Q, P∨Q); coloured truth-table figure |
| §4 Types de raisonnement (`\horsprogramme`) | 3 `methode` (direct, contraposée, absurde); `attention` contre-exemple; `ex` irrationality of √2 |
| §5 Exercices | 36 `exo` (15 level 1, 13 level 2, 8 level 3), 14 `probleme`, 6 `challenge` (some `challenge`/`probleme` interleaved: 2 `\logicoalgo` problèmes sit after the défis) |
| Bilan | 7 bullet recap |

Counts: 3 definitions, 1 proposition (quantifier negation), 0 numbered theorems (Pythagoras is quoted inside an exercise,
Euclid's infinitude of primes and irrationality of √2/√3 are exercises), 4 `methode`, 36 + 14 + 6 = 56 numbered items.
Entry activity: prérequis, automatismes (5 sentences), activity "Le tribunal des affirmations". Solutions: one entry per `exo`
and per `probleme` (36 + 14 match 1 to 1), and 6 "Défi" entries. Cross-references `exo:1.21` (contraposée), `exo:1.29`
(√2), `exo:1.31`, `exo:1.17` agree with my numbering of the exercises (21, 29, 31, 17). Draft HTML (6.8 kB): one interactive
truth table (P, Q toggles; ∧, ∨, ⇒, ¬Q⇒¬P, ⇔), a divisibility counter-example slider (n from 0 to 40), a one-question quiz.
Its logic is correct (checked: `q||!p` is ¬Q⇒¬P; `!p||q` is P⇒Q).

## 2. Independent mathematical verification

Method: every truth table, equivalence (De Morgan, contraposée, ⇔ as two implications, exportation, distributivity, ⇒ as
¬P∨Q, ¬(P⇔Q), transitivity as tautology, circuit Φ = majority) checked exhaustively in Python; the Sudoku, the tournament,
the knights puzzles, the suspects puzzle, the farmer puzzle (BFS) and the sums of two squares checked by brute force; every
solution then read against its statement. Script kept outside the repository (scratchpad `chk.py`); archive it with the
private audit evidence.

**Verdict.** Chapter body (definitions, tables, figure tables, quantifier negations, bilan): **no mathematical error found.**
All exercise statements are mathematically sound; two are weak as written (see 2.3). The **solutions file contains real
errors**, mostly statement/solution drift in the last problems and all six défis. Nothing may be published from it as is.

### 2.1 Errors in `solutions/01-logique.tex` (fix before any reuse) [VERIFY each fix]

| # | Location (solution title, item) | Quote / problem | Correct |
|---|---|---|---|
| E1 | Codage et logique : parité, item 2 | "`10110` : quatre 1 : pair. Pas d'erreur détectée." `10110` has three 1s | odd, error detected |
| E2 | same, item 3 | "`10100` : trois 1 : impair. Erreur détectée." `10100` has two 1s | even, no error detected (an undetected double-looking pattern) |
| E3 | Sudoku, Étape 2 | "(4,4) ... manque 1 ... **(4,4)=1**. Donc (4,3)=2" but the grid gives (4,4)=3 | the cell forced by column 4 is (3,4)=1; row 4 gives (4,2),(4,3) in {1,2}. Final grid printed is right and unique (brute force: 1 solution) |
| E4 | Sudoku, question 2 | "4 implications principales ... (une par case inconnue)" | 8 cells are empty |
| E5 | Logique dans les preuves géométriques, items 2, 3 | item 2 answers with "¬P∨(¬Q∨¬R)" and a claim declared "fausse"; item 3 answers "P⇔(Q∧R) Vraie". The statements ask for the contrapositives of P⇒Q and Q⇒S, and a contrapositive proof "pas parallélogramme ⇒ pas carré". Item 4 (negation of "tout carré est rectangle et losange") has no solution | rewrite: ¬Q⇒¬P; ¬S⇒¬Q; proof: a square is a parallelogram; ¬(∀ carré, rectangle∧losange) = ∃ carré non rectangle ou non losange, false |
| E6 | Divisibilité et parité des carrés, item 3 | statement: which of 1..8 are impossible; solution discusses 7, 10, 13, 15 | impossible: 3, 6, 7 (with 0 allowed: 1=1+0, 4=4+0). Note 6 is not of the form 4k+3, so mod 4 alone does not exclude it; a finite check is needed |
| E7 | Sommes et formules algébriques | statement has 4 items; solution has 3 and stops at an algorithm; item 4 (sum of first n odd numbers = n²) is missing; "tester pour n=10, 100" absent | add item 4 and the tests |
| E8 | Calcul avec valeurs données, item 8 | statement `(P∧¬Q)⇒R`; solution computes `¬(P∧Q)∨R` | `(⊤∧⊤)⇒⊤ = ⊤` (value correct by luck; formula wrong) |
| E9 | Défi 1, item 3 | "Cette phrase est vraie." : "Non paradoxale : tautologie" | not a tautology; it is consistent with both values, so not a proposition in the sense of the course. Russell's item 4 has no solution |
| E10 | Défi 2, item 3 | gives `(P⇒¬Q)∧(¬P⇒Q)` | uses ∧, statement says "uniquement ⇒ et ¬": e.g. `¬((P⇒¬Q)⇒¬(¬P⇒Q))` (checked equivalent) |
| E11 | Défi 2, item 4 | "XOR est aussi universel : ¬P=P⊕⊤ ; P∧Q=P⊕Q⊕(P∨Q)" | the identity holds but uses ∨; with only ⊕ and constants one gets affine functions only, so P∧Q is unreachable (checked). The claim is false as stated. Statement items 4 and 5 (P⊕P, XOR cipher) are not answered |
| E12 | Défi 3 | solution item 2 never says E is undetermined (checked: (C,D)=(chevalier, coquin), E free: 2 models). Item 3 solves "E dit je suis un coquin" which is not in the statement; item 4 missing | rewrite |
| E13 | Défi 4, item 2 | "En général : 2k ↦ k et 2k+1 ↦ −k" contradicts its own list (f(2)=−1, f(1)=1) and is not injective (f(0)=f(1)=0) | f(2k)=−k, f(2k+1)=k+1. Items 3 (even integers) and 4 (reals in [0,1]) are replaced by N×N and {0,1}^N |
| E14 | Défi 5 | item 3 proves log₂3 irrational; statement item 3 is √5; item 4 (no two consecutive reals) missing | rewrite |
| E15 | Défi 6 | statement: modus ponens (2 examples, second is "divisible par 6 ⇒ par 2"), chain, syllogism, invent a chain. Solution: other example, modus tollens, chain, proof by cases | align (the proof by cases can become an extension) |
| E16 | Irrationalité de √2, "Généralisation" | "l'argument analogue (avec tout diviseur premier de k) mène à la même contradiction" | false for k=12 with p=2 (√12=2√3). Need a prime with odd exponent in k. The statement ("k non carré parfait ⇒ √k irrationnel") is true but its proof is not given |
| E17 | Erreurs classiques, item 1 | labelled "affirmation du conséquent" | it is the undistributed-middle fallacy; the formal remark below it is right |
| E18 | Berger, loup, chèvre, chou | "Solution alternative : remplacer loup par chou aux étapes 3 et 4"; also the state vector (B,L,C,X) is never decoded (X = chou, C = chèvre) | steps 3 and 5 carry the wolf/cabbage (step 4 returns with the goat in both). "Exactement deux solutions" = two shortest ones (BFS: 7 crossings, 2 paths). Forbidden states are described but not listed (statement asks to list them) |
| E19 | Chevaliers et coquins (problème) | solution is right (X and Y have opposite types, Z is a coquin; two models, brute force) but the statement asks "déterminer la nature de X, Y, Z" | restate the question: "que peut-on affirmer ?", or change Y's sentence so the answer is unique |
| E20 | Tournoi | "6×3−9=9 points restants" is meaningless | skip it; the deduction (B lost to A, so B won twice, C and D drew) is right and unique (brute force over 3^6 outcomes) |

Smaller doubtful points (not errors of fact):
- Raisonner sur les réels (1): "x²=(x−0)²≥0 car un carré est toujours ≥0" is circular. Prove by cases x≥0 / x<0 with the sign rule.
- Combinaisons logiques (1) to (3): "vérifiable par table" with no table; the exportation justification is a restatement.
- Priorité des connecteurs: statement asks for the truth tables, solution gives only prose; ⇔ missing from the priority list in the solution.
- Géométrie et logique (2): converse of the isosceles theorem "par la somme des angles et la loi des sinus" is above T10 level [VERIFY]; a congruence argument (altitude from A) suffices.
- Irrationalité de √3 lemma: "3(…)+4" is not a remainder; write 3(3k²+4k+1)+1.
- Nombres rationnels et puissances (3): numerical values requested (n=1,5,10,20: 0.667; 0.1317; 0.01734; 0.000301) are not given; the ε-N argument uses logarithms [VERIFY: programme level].
- De Morgan (3): stops at `(P∧¬Q)∨¬P`; the simplification is `¬P∨¬Q`.
- Trouver l'erreur (1): also mention that dividing by a negative n reverses the inequality, so "n≥1" is wrong for n<0 too.

### 2.2 Items verified correct (so the audit need not redo them)
Connector tables (chapter and solution), ⇔ definition, contraposée table, tautologies/contradiction, transitivity table (and
that ⇒ is not an equivalence: row 6), both De Morgan laws, ¬(P⇔Q), quantifier negations and the four nested-quantifier
exercises, all "négation avec quantificateurs" truth values, réciproques and contre-exemples, Pythagoras and its converse
(5-12-13, 6-8-10), n=40 gives 41² (n²+n+41), Euclid and √2/√3 proofs, circuit Φ = majority, suspects (A guilty only),
knights A/B (A coquin, B chevalier), farmer sequence (valid, 7 crossings), tournament (A 9, B 6, C=D=1), 22 multiples of 3 not
of 9 in 1..100, sums of two squares ≤20: 1,2,4,5,8,9,10,13,16,17,18,20, NAND constructions.

### 2.3 Statement-level doubts [VERIFY with the author]
- Exo "Contraposée" (3): "si n²+n est impair alors n est pair" has a never-true hypothesis (n(n+1) is always even). Valid but vacuously true; say so or replace.
- Exo "Suite et logique" (3): "en déduire" the form 4k or 4k+1 from n(n−1) even is not a deduction; it needs the parity split (as the solution does). P(n) is stated on N, the conclusion on Z.
- Exo "Nombres rationnels" (2): "en déduire" from item 1 is not direct (needs 3 ∤ 2^n), and "(2/3)^n → 0" is a limit by numerical check, not a proof.
- Exo "Négation de propositions complexes" (2): ambient set of n not stated (Z assumed).
- Automatismes: "tout carré est positif" is ambiguous in French (square shape vs squared number).
- Venn figure: draws P and Q as sets; the caption "l'union est P∨Q" mixes propositions and sets. Say "ensemble des x pour lesquels".
- Flowchart advises trying the contrapositive before the direct proof, which contradicts the `\horsprogramme` note ("ne doivent pas masquer les raisonnements directs").
- "Énoncé" is listed as an objective but never defined (only proposition and predicate appear, predicate only in `ex`).

### 2.4 Corrections applied to `solutions/01-logique.tex` (31 October 2026)

Only the solutions file was edited (chapter statements untouched); every value or claim was re-checked by brute force in
Python (scratchpad `v.py`) before writing. Not compiled: `pdflatex` is not installed here (brace and environment balance checked only).

| # | Status | Correction |
|---|---|---|
| E1 | fixed | `10110` has three 1s: odd, error detected |
| E2 | fixed | `10100` has two 1s: even, no error detected (it is `10111` with two flipped bits, link to item 4) |
| E3 | fixed | Step 2 rewritten: column 4 forces (3,4)=1, row 3 gives (3,1)=2; step 4 gives (4,2)=1, (4,3)=2; final grid unchanged |
| E4 | fixed | 8 implications, one per empty cell, in 4 steps of 2 cells |
| E5 | fixed | Contrapositives, proof of "not parallelogram => not square", negation of the square claim (false) written; old false claim removed; P<=>(Q and R) kept as a remark |
| E6 | fixed | Item 3: impossible values are 3, 6, 7 (0 allowed); 6 handled by the finite list, not by mod 4 |
| E7 | fixed | Tests n=10 (55) and n=100 (5050) and item 4 (sum of odd numbers = n^2, table and proof) added |
| E8 | fixed | Computes (P and not Q) => R = T |
| E9 | fixed | "Cette phrase est vraie": not a tautology, consistent with both values; Russell item 4 added |
| E10 | fixed | not((P=>not Q)=>not(not P=>Q)), derived and checked equal to XOR |
| E11 | fixed | Items 4 and 5 answered; false "XOR universal" replaced by: {xor, constants} gives only affine functions (closure has 8 functions, P and Q is not among them), add AND for completeness |
| E12 | fixed | Item 2: C knight, D knave, E undetermined (2 models); item 3 new unique puzzle (checked on 8 cases); item 4 truth table (A knave, B knight) |
| E13 | fixed | f(2k)=-k, f(2k+1)=k+1 (bijection checked); item 3 evens n->2n; item 4 Cantor diagonal on [0,1]; N x N kept as a remark |
| E14 | fixed | Item 3 is now sqrt(5) (squares mod 5 in {0,1,4}); item 4 midpoint c=(a+b)/2 |
| E15 | fixed | Aligned with the statement (6 => 2 example, chain, syllogism, invented chain of 3 implications); modus tollens and cases moved to an "Extension" |
| E16 | fixed | Rigorous proof via a prime of odd exponent; warning with k=12, p=2 |
| E17 | fixed | Relabelled "moyen terme non distribue (faux syllogisme)" |
| E18 | fixed | State vector decoded, 6 forbidden states listed, alternative = swap wolf and cabbage at steps 3 and 5, BFS: 7 crossings, exactly 2 shortest solutions |
| E19 | fixed (open) | Solution now says X and Y have opposite types and Z is a knave; statement still says "determine" (see open questions) |
| E20 | fixed | Meaningless "6x3-9" sentence removed; added check 5x3+1x2=17=9+6+1+1 |

Open questions:
- E19: the statement asks to determine X, Y, Z but only Z is determined (two models). Statement wording (chapter) to be changed by the author, or Y's sentence altered.
- E11/E10: statement hint for Défi 2 item 3 starts from a formula using the conjunction; the solution derives it with the identity A and B = not(A => not B). Check this is acceptable for "uniquement => et not".
- E13: Défi 4 item 4 statement asks for an explanation only; the diagonal argument given may exceed T10 level [VERIFY].
- E7: item 4 proof uses the Gauss formula; the statement only asks for a conjecture and checks.
- E5 item 3 relies on "a rectangle's opposite sides are parallel (perpendicular to a common side)"; confirm it is the accepted level of rigour.
- Not compiled (no pdflatex): the file needs a build check.

## 3. Programme alignment (nothing confirmed; no programme reference invented)

I did not find, in the repository, the official Malagasy T10 syllabus text, its edition or its logic requirements. Everything
below is therefore [VERIFY] against the current official Malagasy programme (owner to supply the document and edition):
- [VERIFY] Is logic a T10 chapter at all, and in which form (propositions, connectors, quantifiers)?
- [VERIFY] Whether truth tables, equivalence, quantifiers ∀/∃ and their negations, réciproque/contraposée, necessary/sufficient conditions are in the T10 list.
- [VERIFY] Operator precedence (exo "Priorité des connecteurs"), ⊕, NAND/NOR, modus ponens/tollens, nested quantifiers.
- [VERIFY] The source itself marks contraposée and absurde as `\horsprogramme`, yet they carry 5+ exercises, the objectives and the bilan. Decide: keep as enrichment, label consistently.
- [VERIFY] Enrichment only unless confirmed: bijections/Cantor/Russell, Boole algebra, parity bit, XOR cipher, Sudoku, farmer puzzle, log₂3, limits.
- [VERIFY] Vocabulary and symbols used in Madagascar (⇒ vs ⟹, "coquin" for the knave puzzle, "chevalier").
- [VERIFY] Whether "Seconde" is the right label (the repo's `chapters.json` calls T10 "Seconde (Madagascar)"); keep `curriculum: "mg"`, never reuse French course labels.

## 4. Concrete adaptation steps (workstream D, one bounded chapter)

Conventions: course units are `content/tex/courses/<course>/<unit>.fr.tex` with a reviewed `<unit>.en.json` table; `.en.tex`
is generated; builders are named in `build/mxbuild/pipeline.py` `COURSES`; the catalogue source is `content/data/manifest.json`
(`catalog.courses` currently only `fr`/`shared`; `catalog.chapters[]` carry `labs`); slides in `content/slides/<deck>.json`
placed with `WIDGETS` in `scripts/build-slides.py`; experiments in `site/js/lab/experiments/<id>.js`.

1. **Sources first, in the intake area.** Fix E1 to E20 in `content/malagasy/source/t10/solutions/01-logique.tex`; settle 2.3.
   Keep all text French. Record the fixed state in `chapters.json` (`state`), not yet `visible`.
2. **Course unit.** New folder `content/tex/courses/mada-t10/` with `c01.fr.tex` (chapter), `corriges/c01.fr.tex`, `figures/`.
   Port the custom macros (`\vrai`, `\faux`, `\horsprogramme`, `\diff`, `\logiq`, `\corrige`, `\corrigeP`, `\probleme`, `\challenge`,
   `\bilan`, `\solutiontitle`) to `mx-env.sty` environments per `docs/TEX_STYLE_GUIDE.md`; replace the inline colours (`BN`, `OR`, `TQ`, `VE`, `BO`) by the
   palette of `mx-layout.sty`; keep notation in `mx-notation.sty`. The course needs a builder script in `scripts/` and a `COURSES` entry.
   No `.en.json`, no English twin (language rule); no owner, school or city names.
3. **Manifest.** Only at publication: a course `mada-t10` with `curriculum: "mg"`, `contentLanguage: "fr"` and a chapter
   `mada-t10-01` (title "Logique", topic `logic`, `labs: ["logic-truth/…"]`), then `make site`. The schema and the nav must first
   accept a third curriculum value; check `site/js/resource-library.js`, `library.js`, `content-language.js` and `tests/`. Do not add placeholder links or counts.
4. **Web edition (experiment first).** Start from the draft (`docs/future-work/malagasy-t10-logic-interactive.html`): move its
   logic into a laboratory experiment, not a standalone page. Proposed experiment `logic-truth` (file
   `site/js/lab/experiments/logic-truth.js`, contract `docs/LAB_DESIGN.md`) with missions: (a) truth-table builder with De Morgan
   and contraposée checks; (b) réciproque counter-example hunt on n in 0..40; (c) quantifier negation game (set of numbers, find the witness or the
   counter-example); (d) knights-and-knaves solver (four cases (P,Q)). Add the chapter's `labs` entry for the "Chercher" tab.
   Reuse `makeFormat`, keep all text French, decimal comma.
5. **Slides.** `content/slides/mada-t10-01.json` (interactive, `type: 'lab'` widget via `WIDGETS` `lab('logic-truth/…')`) and an
   independent 16:9 Beamer lecture edition (`content/tex/lectures/`, `scripts/build-lecture-slides.py`).
6. **Student and teacher PDFs** from the same unit and `corriges` file.
7. **Map and tests.** Update `MAP.md`/folder `CLAUDE.md` for every new file (`tests/map.test.mjs`), add `tests/lab-links` coverage, a logic-table unit test (the
   Python checks above become a committed script in the private repository), and a language test for the new course.

### Remaining gates (none satisfied)
1. Official Malagasy T10 programme and edition confirmed by the owner (section 3).
2. Source corrections E1 to E20 and 2.3 decisions applied; all computations re-verified by committed code (private repo).
3. Build: `make tex COURSE=mada-t10`, `make slides`, `make site`, `make check`; real TeX compile (a sandbox without `pdflatex` cannot validate).
4. Two independent audits (different agents, evidence kept private), the second after fixes from the first. Queue: `course-quality/queue/` of the private repository.
5. Browser, phone and keyboard checks, accessibility (row selection by Tab/Enter, contrast in both themes, `prefers-reduced-motion`, 44 px targets: the draft is a good start), screen-reader labels on truth-table cells.
6. Publication gate of `PROJECT_BRIEF.md`; owner approval. Not before: no manifest entry, no `dist/` change.
