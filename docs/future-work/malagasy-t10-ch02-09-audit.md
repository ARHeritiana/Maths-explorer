# Malagasy T10, chapters 2 to 9: independent mathematical audit

Status: audit note, 31 October 2026, workstream D (`docs/ACTIVE_WORKSTREAMS.md`). Method as in section 2 of
`malagasy-t10-ch01-adaptation-plan.md`: every definition, theorem, worked example, exercise statement and solution of
the chapter, its entry activity and its solutions file was re-derived or brute-forced in Python (exhaustive search,
direct simulation, exact rational arithmetic; `sympy` is not installed, so symbolic claims were checked numerically on
large integer/rational grids), then each solution was read against its statement. Sources:
`content/malagasy/chapters.json`, `content/malagasy/source/t10/{chapters,activities,solutions}/NN-*.tex`. Language rule:
Malagasy curriculum, French only; the bilingual goal for lessons stays on standby (unfinished work). Nothing here is
published; `site/`, `dist/` and `manifest.json` were not touched; nothing was committed. `pdflatex` is not installed:
only brace and `begin`/`end` balance of the edited files was checked (balanced in all edited files).

Fix policy: solutions first; statements only when ill-posed or when a solution cannot match them, then minimally; the
LaTeX style of the sources is kept. "Programme" points that cannot be confirmed from the repository are marked
[VERIFY] (no programme reference is invented). Level concern = content that goes beyond a seconde-level course
(`PROJECT_BRIEF.md` section 3, `docs/CURRICULUM.md`).

## Chapter 2: Algorithmique (`mada-t10-02`)

Structure: 4 definition/organigram sections, 36 `exo` (15 level 1, 14 level 2, 7 level 3), 13 `probleme`, 5 `challenge`; the solutions file has one
entry per exercise and problem and five "Défi" entries. Chapter body, definitions, the worked trace, the two
flowcharts and the pseudo-code of "ax+b=0": no mathematical error (checked: all three cases). Introduction activity
("Faire exécuter sans ambiguïté") and automatismes (x=3: 6, 11, 121; x=-1: -2, 3, 9): correct, no solution expected.

**Verdict: chapter body and statements sound (2 minor statement faults); the solutions file has 20 errors, mostly
statement/solution drift and unanswered sub-questions.** All fixed in place; 0 open errors, 5 open level concerns.

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| A1 | sol. "Lecture de trace : algorithme d'Euclide" | statement A=4, B=6; solution traces A=48, B=18 and concludes pgcd(48,18)=6 | trace redone: (4,6)->(6,4)->(4,2)->(2,0), result 2 = pgcd(4,6) |
| A2 | sol. "Alignement de points" | statement second test C(2,5); solution uses C(3,5) | d = 1*5-2*2 = 1, non aligned |
| A3 | sol. "Factorielle", item 3 | "n-1 multiplications" but the loop `Pour k de 1 à n` does n | n (n-1 if the loop starts at 2) |
| A4 | sol. "Suite de Collatz" item 2 | never answers "n<=1000 maximising the flight time"; "27 has 111 for n up to 100" is false (n=97 gives 118) | n=871, 178 steps; records 27 (1..53), 97 (<=100) |
| A5 | sol. "Méthode de Héron" | items 3 and 4 not answered (iterations for 1e-6; proof u_{n+1}>=sqrt a); item 2 says "4 iterations" for a different stopping test | 5 iterations (verified), AM-GM proof and identity u_{n+1}-sqrt a=(u_n-sqrt a)^2/(2u_n) |
| A6 | sol. "Horner et polynômes" | statement items 3 (algorithm by hand) and 4 (test x^3-6x^2+11x-6 at 1,2,3) missing | added: -1, 0, 1, -3; zeros 0,0,0 |
| A7 | sol. "Cryptographie par décalage" | "la lettre la plus fréquente est E : 17 %" | about 15 % in French (14.7 %) |
| A8 | sol. "Crible d'Ératosthène" | answers shifted by one item; N=30 trace and the N=100 count are absent ("Nombre de premiers" answers a question not asked) | trace N=30; 104 markings (74 distinct cells, verified); p^2 argument made explicit |
| A9 | sol. "Chiffrement de Vigenère" | statement key MATHS, solution uses CLE; its result "DZRJYAS" is wrong even for CLE (correct: DZRLZYT); key count given for L, not for L=5 | NOGQGGR with MATHS (checked), 26^5 = 11 881 376 |
| A10 | sol. "Compression RLE" | statement test string AAAAAABBBCCCCCD not treated | 6A3B5C1D |
| A11 | sol. "Monte-Carlo pour pi" | table for N=100, 1000, 100000 but statement tests 100, 1000, 10^6; errors too optimistic (std dev is 0.16, 0.05, 0.005, 0.0016) | table 100, 1000, 10^4, 10^6 with +/-0.2, 0.05, 0.02, 0.002 |
| A12 | sol. "Statistiques par algorithme" | `plt.hist(notes, bins=5)` gives 5 classes, statement asks 4 classes [0,5[,[5,10[,[10,15[,[15,20] | `bins=[0,5,10,15,20]` |
| A13 | sol. Défi 1 "Tri par sélection" | traces [5,3,1,4,2], statement [5,3,8,1,9,2]; comparisons/exchanges and the comparison with bubble sort not given | 15 comparisons, 4 exchanges (brute-force checked); sorted list also 15 comparisons |
| A14 | sol. Défi 2 "Flocon de Koch" | table of the statement (segment: 4^n, (4/3)^n L) not filled; only snowflake treated | table, unbounded length, stop condition |
| A15 | sol. Défis 3 to 6 | headings numbered 1, 2, 3, 5, 6 for five défis; "4 reines" items 1 to 2 not answered | headings 1 to 5; 3x3 impossibility (exhaustive: 0 configuration), column-2 availability, 4^4=256 trials; the two solutions {2,4,1,3},{3,1,4,2} verified |
| A16 | sol. Défi 4 "Automate distributeur" | solution is a generic multi-price vending machine; statement (coins 1 or 2, threshold 3 euros, trace 1,1,2 and 2,2, sequences summing exactly to 3) unanswered; typo "Distribuition" | rewritten: traces, 3 sequences (1,1,1),(1,2),(2,1), state diagram; generic automaton kept as the extension |
| A17 | sol. Défi 5 "Rendu de monnaie" | euro coins up to 200 and R=63; statement coins {1,2,5,10,20,50}, n=87, 6, 30, 41 | 87=50+20+10+5+2 (5 coins), 6->2, 30->2, 41->3; greedy optimal checked by dynamic programming for n<500 |
| A18 | sol. "Codage et décodage binaire" | item 4 (number of bits) unanswered; statement says "poids faible au poids fort", the algorithm prepends (prints the other way) | floor(log2 n)+1; order remark |
| A19 | sol. "Suite de Fibonacci", item 3 and "Leibniz" item 3 / "Tri fusion" items 3, 4 | threshold index, "5 décimales", and the 8-element merge sort trace/count missing | F17/F16 = 1597/987 (first ratio within 1e-6 of phi); error about 1/N, so about 10^5 to 2x10^5 terms; merge sort 17 comparisons vs 28 for bubble sort |
| A20 | stat. "Suite de Syracuse" | "nombre de termes (temps de vol)" and "(le vol)" vs the solution (8 steps for n=6, which has 9 terms) and the problem "Collatz" ("nombre de pas") | statement: "nombre d'étapes (temps de vol)", "altitude maximale" |
| A21 | stat. "Défi 1" | `\ref{exo:2.31}` points to the invariant exercise; bubble sort is exercise 34 | `\ref{exo:2.34}` (numbering recomputed over the 36 exercises) |

Verified without change: trace exercises 1, 2, 3 (A=15, B=-7, C=8 ; X=3, Y=3, Z=3, R=1 ; swap), exercises 4 to 14, 16
to 19, 21 to 24, 26, 28 (series table: 3.0418, 3.1316, 3.1406, 3.1415 with errors 1e-1 ... 1e-4), 29, 32 (steps
n-1 for (F_{n+1}, F_n), n=2..11), 33 (trace (2,4,6),(2,16,3),(32,256,1),(8192,256,0); 6 and 15 multiplications),
34 (all four passes), 35 (iterations 4, 5, 7, 11, 20), prime list (25), 20 iterations of the bisection for x^3-2,
dice (6/36), jeu plus/moins (ceil(log2 100)=7), Koch area 2 sqrt 3/5.

Level concerns (not changed): loop invariants and `defn` "Invariant de boucle" (not a seconde notion, the chapter marks
them `\horsprogramme` only partly) ; TVI in "Zéro d'une fonction par dichotomie" and infinite series/limits in Leibniz
and Koch (`n -> +infinity`, "converge") ; AM-GM inequality in Héron ; recursion, merge sort, dynamic programming,
backtracking and cost analysis in log2 (levels 3 and défis). Whether bisection and thresholds are in the seconde
algorithmics programme: [VERIFY].

## Chapter 3: Calcul dans R (`mada-t10-03`)

Structure: 5 sections (ensembles de nombres, puissances et racines, valeur absolue, intervalles et encadrements,
fractions), 49 numbered `exo` (37 plus 12 in a "Logique & Algorithmes" block), 16 `probleme`, 8 `challenge` (6 + 2 in the logic and
algorithm block). Chapter body (hierarchy N, Z, Q, R, powers, square roots, absolute value, triangle inequality,
interval operations, fraction rules, rationalisation with its degenerate cases a=b): **no mathematical error found**
(rules checked on rational grids; the worked rationalisations 1/sqrt3 and 2/(sqrt5-1) are right; 157 = 12*13 + 1 in the
division figure is right). Entry activity (cards for N, Z, D, Q, R; ordering -sqrt2 < -1.4 < 0 < 3/2): correct.

**Verdict: body sound; 7 statement faults; the solutions file is badly out of step with the statements: 32 entries wrong
or answering another question (every problem solution but four, all six défis of the main block).** All fixed.

### 3.1 Statement faults (fixed minimally)

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| T1 | Défi "Approximation de sqrt2 par l'algorithme babylonien", items 3 and 4 | "a_n^2 - 2b_n^2 = (-1)^n" with a_0=b_0=1: values are -1, 1, -1, 1 for n=0..3, i.e. (-1)^(n+1); same sign error in (a_n/b_n)^2 = 2 + (-1)^n/b_n^2 | exponent n+1 in both places (the hint "= -(a^2-2b^2)" was already right) |
| T2 | Problème "La spirale de Pythagore", item 3 | "Montrer que 2 < P_n < 1 + sqrt(n+1)": false, P_n = 1+sqrt n+sqrt(n+1) > 1+sqrt(n+1) (n=1: 3.41 vs 2.41) | "1 + 2 sqrt n < P_n < 1 + 2 sqrt(n+1)" |
| T3 | Défi "Représentation décimale", item 2 | "la période de 1/q divise toujours q-1": false for composite q (1/21 has period 6, 6 does not divide 20; also q = 14, 22, 26, 27, 28 ...; checked for q < 40) | restricted to "q premier différent de 2 et de 5" (true: Fermat) |
| T4 | Défi "Calcul algébrique avancé", items 2 to 4 | "somme télescopique" of 1/(sqrt(k+1)-sqrt k) = sqrt(k+1)+sqrt k: this does not telescope (S = 4 + 2(sqrt2+...+sqrt8)) | denominators with "+": 1/(sqrt(k+1)+sqrt k) = sqrt(k+1)-sqrt k, S = 2, general sum sqrt(n+1)-1 |
| T5 | Problème "Notation scientifique et astronomie", item 2 | "atomes dans 18 g d'eau" from the datum "1 g d'hydrogène" only: the oxygen count needs the molar mass of O, not given | question limited to the hydrogen atoms (18 g of water contain 2 g of H): 1.204e24 |
| T6 | Exo "Inégalité des moyennes" | "on admet que" AM >= GM, then "Démontrer cette inégalité" | "on veut montrer que" |
| T7 | structure, end of the chapter | the `bilan` environment is opened before the recap and closed after the last défi, so the "Logique & Algorithmes" exercises sit inside the recap box; heading "Logique & Algorithmes" duplicated | `\end{bilan}` moved after the recap list, final `\end{bilan}` and the duplicated heading removed |

### 3.2 Solutions (`solutions/03-calcul-reels.tex`), all fixed

| # | Location (title, item) | Quote / problem | Correct |
|---|---|---|---|
| S1 | Comparaison des réels (1), (3) | "1,4 < sqrt1,9": false (sqrt 1.9 = 1.378); item 3 compares 5/3 with sqrt3 (not in the statement) | sqrt1.9 < 1.4 < sqrt2 < 3/2 ; 2-sqrt5 < 1 < sqrt5-1 |
| S2 | Racines : développer (4), (5), (6) | answers for (sqrt2+sqrt3)^2, sqrt2(sqrt8-sqrt2), (sqrt5-sqrt3)^2 | (sqrt6-sqrt2)^2 = 8-4sqrt3 ; 3sqrt2+2sqrt2 = 5sqrt2 ; sqrt20-sqrt5 = sqrt5 |
| S3 | Lire un intervalle (4) | answers "|x-3|<2" instead of 5-2x<3 | x > 1, ]1,+oo[ (sign flip noted) |
| S4 | Rationalisations (3) to (6) | 3/(sqrt7+2), 1/(sqrt2+sqrt3), 6/(2-sqrt2) answered; statement asks (sqrt3+1)/(sqrt3-1), 4/(sqrt7+sqrt3), sqrt2/(sqrt6-sqrt2), 3/(2+sqrt5) | 2+sqrt3 ; sqrt7-sqrt3 ; (sqrt3+1)/2 ; 3sqrt5-6 |
| S5 | Preuve d'inégalité (3) | proves a limit about sqrt(n+1)-sqrt n; statement is sqrt(a+b) <= sqrt a + sqrt b | squares compared, equality iff a=0 or b=0 |
| S6 | Signe et tableau (2) to (4) | "Positif sur [1/2,4]", "]-oo,-1] u ]3,+oo[", "[-2,1] u ]5,+oo[": the statement asks f(x) > 0 (strict) so zeros must be excluded; (1) lacks the solution set | ]1/2,4[ ; ]-oo,-1[ u ]3,+oo[ ; ]-2,1[ u ]5,+oo[ ; ]-oo,-3[ u ]2,+oo[ |
| S7 | Équations sans carrés (4) | solves sqrt x + sqrt(x+1) = sqrt(4x-1) instead of sqrt(x^2) = 2 | {-2, 2} |
| S8 | Chaînes d'inégalités (3), (4) | a^2<b^2 discussion and a^n powers instead of "c < 0" and sign of (x-1)^2-4 | ac > bc ; (x-3)(x+1): > 0 outside [-1,3] |
| S9 | Approximation de réels (2), (3) | sqrt5 approximations replaced by pi and by 99/70 | 2.236^2 = 4.999696 < 5 < 5.004169 = 2.237^2 ; 0.44702 < 1/sqrt5 < 0.44723 |
| S10 | Distances (3), (4) | generic radius formula, midpoint; statement: |x+1| > 3 and the two towns (AB = 40 or 200 km) | ]-oo,-4[ u ]2,+oo[ ; same side 40 km, opposite sides 200 km |
| S11 | Puissances et ordre de grandeur (2), (3) | Earth size and Avogadro, not the red cell and the Earth-Sun light time | 125 cells ; 500 s |
| S12 | Algorithme : encadrement de sqrt n | trace for n = 7; statement n = 17, n = 9 and the "carré parfait" modification unanswered | k = 1,2,3,4 and output 4, 5 ; n = 9 gives 3, 4 ; test k*k = n |
| S13 | Inégalité des moyennes (3), (4) | sum-fixed product and numeric example instead of x+1/x >= 2 and the fixed-perimeter rectangle | done (rectangle: ab <= p^2/4, equality for a=b) |
| S14 | Algorithme : décimales de sqrt n | "1,41^2 = 1,9881 < 2 < 1,4(4 overlined)^2" (garbled bound) | 1.42^2 = 2.0164 |
| S15 | Problème "Mesures et ordres de grandeur" | solves year/century in seconds, Milky Way crossing, electron mass | 3.57e51 protons ; 3.3e5 ; 10^15 |
| S16 | Problème "Encadrements en physique" | free fall and pendulum, not the weight and spring-energy intervals | [18.60, 20.64] N ; [2.10, 2.40] J ; propagation |
| S17 | Problème "Rationnels proches d'un irrationnel" | continued fractions and "Hurwitz" bound; none of the 4 items answered (errors, algorithm, fraction) | errors 0.414, 0.0142, 0.00421, 0.000214, 0.0000136 ; algorithm ; 99/70 |
| S18 | Problème "Inégalité de Bernoulli", (3), (4) | (4) answers (1.1)^10 >= 2 instead of 2^10 >= 11 and whether the bound is good | 2^10 = 1024: valid but very weak ; (3) now uses (2) as asked |
| S19 | Problème "Spirale de Pythagore", (2), (3) | "Le nombre de triangles pour atteindre sqrt N est N-1" for item 3 (perimeter) | perimeter bounds (see T2) |
| S20 | Problème "Valeur absolue et inéquations physiques" | temperature, speed and sound frequency examples; statement is a part of length 50 mm | [49.8, 50.2] ; accepted ; not all accepted (|sin| > 2/3) ; sum in [79.3, 80.7] |
| S21 | Problème "Encadrements et décimales de sqrt2" (1) | no largest n with n^2 <= 2000; garbled item 2 | n = 44 ; 1.414^2 = 1.999396 < 2 < 2.002225 ; 1.41421 < sqrt2 < 1.41422 ; error 3.56e-6 |
| S22 | Problème "Organisation et classement des fractions" | order of 1/3, 2/5, 3/8, 5/12 instead of the Farey lists | 11 fractions in ]0,3[ ; 6 fractions with q <= 4 ; mediant proof via (bc-ad)/(b(b+d)) |
| S23 | Problème "Distance et médiane" | only the vague claim for n=2; n=4 and the conjecture missing | minimiser interval [x2, x3] for n=4 ; median in general |
| S24 | Problème "Notation scientifique et astronomie" | Moon light time, Earth-Sun time (not asked) | 9.6 laps ; 1.204e24 ; 4.01e16 m |
| S25 | Problème "Fractions et thème de la harmonique" | musical intervals and harmonic mean | H_1..H_5 exact, H_4 > 3/2, H_8 > 5/2 > 2, smallest n with H_n > 2.5 is 7 |
| S26 | Problème "Décrire des ensembles de réels" | five different sets | A = ]-2,2[, B = ]-oo,-3] u [1,+oo[, C = [1,3], D = ... ; intersections ; x = 2 ; {|x-3| <= |x+1|} = [1,+oo[ |
| S27 | Défi 1 (babylonian) | solves Héron's method | (1,1),(3,2),(7,5),(17,12) ; error about 1/(2 sqrt2 b^2) |
| S28 | Défi 2 (nombre d'or) | answers a different list (continued fraction, Fibonacci) | phi^2 = phi+1 ; phi^n = F_n phi + F_(n-1) ; the golden rectangle ; irrationality |
| S29 | Défi 3 (sommes et produits) | table only; items 3, 4 (two examples, classification of five expressions) missing | done |
| S30 | Défi 4 (décimales), 1 to 3 | "période <= q-1"; only 1/7 and 1/6 | six expansions of k/7 ; Fermat argument ; 0.999... = 1 |
| S31 | Défi 5 (règle et compas) | 4th point claimed "constructibles = exactement ... " without caveat | answers items 1 to 4, cube root not constructible (admitted) |
| S32 | Défi 6 (radicaux) | (sqrt2+sqrt3)^4 instead of (sqrt3+sqrt2)^4 - (sqrt3-sqrt2)^4 ; a cube-root identity unrelated to the statement | 40 sqrt6 ; telescoping sum = 2 |

Défi 7 (irrationalité de sqrt p), Défi 8 (Newton-Héron) and the logic and algorithm exercises: correct; Défi 8 item 3
completed (k=2: 5 iterations, k=3: 6 iterations for 1e-8, checked). Exercises 1 to 11, 14, 15 to 20 (apart from
the items above), 22, 24, 26, the "Nier", "CN/CS" and "Logique des inégalités" solutions: verified, no change.
Cross-reference `exo 26` (triangle inequality) agrees with the numbering.

Level concerns (not changed): Bernoulli's inequality and the AM-GM inequality (levels 2 and 3 exercises and problems),
cube roots (`\sqrt[3]{2}`, "Encadrements et décimales"), Fermat's little theorem and periods of decimal expansions,
Farey sequences, constructibility, weighted AM-GM in the Newton-Héron défi, "Puissances négatives et fractionnaires"
(title mentions fractional exponents, none occur), the sequence notation in the babylonian défi; difficulty marker of
"Inégalité par carrés" is 2 under the heading "Niveau 3". Which of cube roots, absolute-value inequalities with two
absolute values and Bernoulli belong to seconde: [VERIFY].

## Chapter 4: Équations et inéquations (`mada-t10-04`)

Structure: trinomial (definition, discriminant theorem, Viète, sign theorem, canonical form), degree-3 polynomials
(factorisation by a known root, identification and long division, sign table), rational fractions, 2x2 systems; 49
exercises (37 plus a "Logique & Algorithmes" block of 12), 16 problems, 6 + 2 défis. Chapter body (all theorems,
both parabola figures: vertex (1,-4), roots -1 and 3; Viète; the worked canonical form 2(x-2)^2-5; the worked division of
x^3-6x^2+11x-6 by x-1; the three sign tables, including F(x)=(x+1)(x-3)/(x-1) whose table was recomputed): **no
mathematical error.** Entry activity: (x+2)(x+5)=28 gives x^2+7x-18=0, x=2 or x=-9, only x=2 is admissible (side lengths
positive): consistent with the "contraintes géométriques" sentence.

**Verdict: body and statements sound apart from two statement faults and one structural fault; the solutions file is
the most reliable so far (every numerical answer of exercises 1 to 49 re-derived), with five errors.** All fixed.

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| C1 | sol. "Division euclidienne de polynômes" (2) | "P(-2)=2(-8)+4+6+2=0" and "(x+2)(2x^2-3x+1)": the sum is -4, and (x+2)(2x^2-3x+1) = 2x^3+x^2-5x+2 is not P | P(-2) = -4 ; P = (x+2)(2x^2-3x+3) - 4 (remainder equals P(-2), as the statement asks to verify) |
| C2 | sol. "Algorithme : trouver les racines par balayage" | the code tests `prev * curr < 0`; for x^2-5x+6 the grid hits the roots 2.00 and 3.00 exactly (value 0), so the loop prints **nothing** (run in Python), while the text says it finds both roots | test `prev != 0 and prev * curr <= 0` (prints 2.0 and 3.0), caveat added |
| C3 | stat. Défi "Irrationalité et trinôme", item 2 | "En utilisant Viète ... on aurait q^2 | 1 et p^2 | 3": false claim (p^2 | 3 fails for p = 3) and not a Viète argument | rewritten: p^2 = 3q^2, so 3 | p then 3 | q (what the solution already did) |
| C4 | sol. same défi, item 3 | "tout facteur premier de n divise à la fois p et q": false (n = 12: 2 need not divide q) | correct proof: q^2 | p^2 and gcd(p^2, q^2) = 1 give q = 1, n = p^2 |
| C5 | stat. Défi "Triplets de Pythagore", item 3 | "c^2=(m^2+n^2)^2 est le carré d'un entier : tout carré parfait peut-il être l'hypoténuse ... ?" (trivial first half, ill-posed second half) | "c = m^2+n^2 est un entier : tout entier peut-il être l'hypoténuse d'un triplet ?" ; solution: no (1, 2, 3, 4, 6, 7, 8, 9 are not hypotenuses, 5 and 13 are; brute force up to 60) |
| C6 | sol. "Algorithme : signe d'un trinôme en un point", item 3 | does not say what the program prints | no integer in [-10, 10] (x^2-5x+6<0 only on ]2,3[): prints nothing |
| C7 | sol. "Dénombrement de racines positives" (1) | question "toujours positives ?" is not answered explicitly | no (m <= 0), both roots > 0 iff m > 0 |
| C8 | structure | `bilan` opened before the recap and closed after the last défi of the logic block (same fault as chapter 3) | `\end{bilan}` moved after the recap list |

Verified without change (selection): exercises 1 to 25 including every discriminant, factorisation, sign table,
parameter discussion (m<0 or m>4 etc., the cumulative conditions -2<m<=-1), the three mixed systems, the four
rational equations (x=3 ; x=2 ; no solution ; 2 +/- sqrt6), the four rational inequalities, the geometry problems
(4x6, 12x17, a=6, speed 90 km/h), exercises on Viète (p^2-2q, p^2-4q, p(p^2-3q) = 18 for x^2-3x+1), the parametric
system (unique solution iff k != +/-1, x = y = 1/(k+1)), intersection of the parabola with y=kx+1 (never tangent,
sqrt410), the thrown ball (21 m at t = 2 s, back at 2+sqrt105/5), triangle area 6, V(10/3) = 16000/27, double
inequalities (]-oo,-1[ u [7/2,+oo[ ; |x| >= sqrt6/2 ; ]-1,0[), the Descartes sign counts, the cubic roots found by brute
force on a grid. Cross-reference `exo 17` agrees with the numbering.

Level concerns (not changed): the discriminant, canonical form and sign of a trinomial, Viète's relations and
rational-function inequalities are first-year upper-secondary topics in the French curriculum; whether they belong
to the Malagasy seconde (T10) syllabus: [VERIFY] (`docs/CURRICULUM.md`). Clearly above seconde: derivatives
(`P'` in "Polynôme à racine double", `V'` in the optimisation problem, `f'` in the Newton défi, all flagged
`ExtensionTTen` or "adm." only in part), the intermediate value theorem in "Localisation de racines", Cardano's method
with complex cube roots, Descartes' rule of signs, polynomial division and Bézout's theorem, Horner's scheme,
parametric discussions of systems by determinant. Statement 4 of "Conditions sur le discriminant" is intended as
false ("deux racines" for Δ >= 0) and is answered so.

## Chapter 5: Vecteurs du plan (`mada-t10-05`)

Structure: vectors, scalar product, operations, frames, 49 exercises (37 + 12 in the logic and algorithm block), 16 problems, 6 + 2
défis. Chapter body: definitions, scalar product by coordinates and by cosine, orthogonality and collinearity criteria,
Chasles, coordinates of a vector and of the midpoint, centroid, the three figures (all coordinates in the TikZ sketches
checked), alignment and parallelogram methods: **no mathematical error**. The zero vector is treated correctly
(collinear with every vector). Entry activity (A(1;2), B(4;-1), AC = 2AB gives C(7;-4)): correct.

**Verdict: body sound; 6 statement faults; the solutions file has 20 errors, many of them sloppy corrections left in the
text ("Correction: ... incohérent. Reprenons", "..."), plus real wrong values.** All fixed.

### 5.1 Statement faults (fixed minimally)

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| D1 | Exo "Construction de figures par vecteurs", items 3 and 4 | "ABDC soit un parallélogramme" then "M milieu de [BD] ... coïncide avec le milieu de [AC]": for ABDC the diagonals are [AD] and [BC]; [BD] and [AC] are sides, so item 4 is false (D would be (6,3): midpoints (5,1.5) and (1,1.5)) | "ABCD" (then D = (-2,3) and the check holds, which is what the solution did) |
| D2 | Exo "Point image par translation", item 4 | "le triangle OAB (O origine)" with A(0,0) taken from item 3: degenerate triangle | "avec O(0,0), A(4,0), B(3,2)" (the values the solution assumed) |
| D3 | Exo "Colinéarité: CNS", item 3 | "u // v et v // w => u // w (transitivité)": false when v = 0 (the zero vector is collinear with everything): u = (1,0), v = 0, w = (0,1) | hypothesis "v != 0" added, with the question why it is needed |
| D4 | Problème "Vecteurs et déplacement", item 3 | "séquence d'exactement 3 mouvements" from A to B = (5,3) with the moves (0,2), (2,0), (1,-1): impossible (a+b = 4 forces at least 5 moves); the solution gave a move (1,3) that is not an instruction | "Peut-on ... en exactement 3 mouvements ? Quel est le nombre minimal ?" (answer: no, 5) |
| D5 | Problème "Logique et preuves géométriques", item 1 | "ABCD est un losange <=> AB = BC et AC perp BD": false for a general quadrilateral (a kite has AB = BC and perpendicular diagonals) | stated for a parallelogram ABCD, equivalence to be proved (both sides) |
| D6 | structure | `bilan` opened before the recap, closed after the last défi of the logic block (same as chapters 3 and 4) | `\end{bilan}` moved after the recap |

### 5.2 Solutions (`solutions/05-vecteurs.tex`), all fixed

| # | Location | Quote / problem | Correct |
|---|---|---|---|
| E1 | Opérations vectorielles (3) | muddled remark ending "Non, simplement ..." around a correct inequality | sqrt5 = 2.24 < 5.40, strict because det = 5 != 0 |
| E2 | Parallélogramme (1), (2) | diagonals "AC = sqrt8, BD = sqrt20" and "AD = BC = sqrt8, AC = sqrt40, BD = 4 sqrt2": AC = (2,-1), BD = (-4,-5) for (1); AD = (2,-3) so AD = BC = sqrt13, AC = sqrt37, BD = sqrt29 for (2) (checked with numpy) | sqrt5, sqrt41 ; sqrt13, sqrt37, sqrt29 |
| E3 | Norme et distance (2) | "isocèle ... Non isocèle": self-contradictory | three distinct sides (sqrt13, sqrt45, sqrt52): neither isosceles nor equilateral |
| E4 | Construction de figures (3) | "AB = CD => D = C + BA": wrong vector identity for ABDC | for ABCD: AB = DC, D = C - AB = (-2,3) |
| E5 | Point image par translation (4) | self-correcting remark "O' = (2,-3), A' = (2,-3)... non" | O'(2,-3), A'(6,-3), B'(5,-1) |
| E6 | Angle et produit scalaire (2) | at C: "CA.CB = -2-15 = -17": CA = (-2,-3), CB = (1,-5), so -2+15 = 13 (still not 0) | 13 |
| E7 | Formule de polarisation (3) | gives 161.6 degrees, then retracts to "108.4 degrees": arccos(-3/sqrt10) = 161.57 degrees | 161.6 degrees (obtuse) |
| E8 | Coordonnées et équations de droites (3) | perpendicular bisector of [AB], A(2,6), B(8,2): "2x+3y-22=0": that line is parallel to AB (normal (2,3) is perpendicular to AB = (6,-4)) | normal AB: 3x-2y-7=0 (checked: (7,7) is sqrt26 from A and B) |
| E9 | same exercise, (4) | "propriété classique" | short proof OA = OB, OB = OC |
| E10 | Projection orthogonale (1) | "2 = 0 !", "incohérent. Reprenons" left in the text | clean derivation, H = (11/5, 3/5) |
| E11 | Condition d'alignement (d) | k = -1: wrong determinant; A(0,3), B(4,k), C(8,0) | k = 3/2 (B is the midpoint of [AC]) |
| E12 | Symétrie centrale (4) | opens with a stray "M'N' = (M+t)(N+t)..." | clean computation |
| E13 | Colinéarité CNS (3) | proof that needs v != 0 without saying so | proof by det, counterexample with v = 0 |
| E14 | Raisonnement par l'absurde (2) | "IA = IC'..." stray text | clean |
| E15 | Implication en géométrie (3) | equivalence AB = DC <=> parallelogram | degenerate flat case noted |
| E16 | Problème "Vecteurs et déplacement" (3) | impossible 3-move sequence with an invalid move (1,3) | see D4 |
| E17 | Problème "Cercle défini par son diamètre" (3) | expansion "5-6x+x^2-3+2y+y^2-3+x^2+y^2" is not MA.MB | (x^2-6x+5)+(y^2-2y-3) = (x-3)^2+(y-1)^2-8 |
| E18 | Problème "Médiane, hauteur, médiatrice" (3) | "(-4)(4)+(0-6)(0-6)... = 20" | explicit vectors, also not right-angled at B |
| E19 | Problème "Construction d'un point" (1) | "ABDC ... D = C+BA = (-2,3)": for ABDC, D = C + AB = (4,9) | (4,9) |
| E20 | Défi 5 (décomposition) (1) | "mu = (2b-a)/5 * 1/2 ...", "5 mu = 2b-2a ?": false starts | lambda = (a+2b)/5, mu = (b-2a)/5 |
| E21 | Problème "Logique et preuves géométriques" (1) | only "voir exo 32", equivalence with missing hypothesis | proof for a parallelogram, kite counterexample |

Verified without change: exercises 1 to 3, 5 to 9 (apart from E2, E3), 10 to 30, 32 to 37 (losange, médiane, angle inscrit,
barycentre, loi des cosinus, orthocentre (0, 3/2)), problems "Navigation" (OP = 5, 53.1 degrees), "parallélogramme" (C = (5,3), area
12), "Barycentre" ((4,5), (6,3)), "Forces" (R = (2,6), 63.4 degrees), "Médiane, hauteur, médiatrice" (O' = (0,5/3),
G = (0,2), H = (0,8/3)), "Régression" (a = 0.9, b = 1.3), "Hexagone" (area 6 sqrt3), "Thalès", défis 2 (Euler: O'(2,1), G(5/3,1),
H(1,1)), 3, 4, 6 (projectile: 80 m at t = 4 s, range 240 m). Cross-references `exo 5.32`, `5.33`, `5.34`, `exo 32`
agree with the numbering of the 37 exercises.

Level concerns (not changed): the scalar product (norm, angle, polarisation, law of cosines, orthocentre, Euler line,
distance from a point to a line, circle of diameter [AB]) is a first-year upper-secondary topic in the French curriculum;
whether it belongs to the Malagasy seconde (T10): [VERIFY]. Further above seconde: linear regression (problem
"Vecteurs et régression linéaire"), the Euler line and nine-point circle, parametric equations, rotation by 60 degrees with
trigonometric matrices, projectile trajectory (quadratic in t), the "produit vectoriel en 2D" and the determinant
defi, composition of transformations, numerical `numpy` code. The statement of "Formule de polarisation" says
"On admet que" and then asks to verify it in coordinates: consistent but redundant.

## Chapter 6: Droites et cercles (`mada-t10-06`)

Structure: line equations (cartesian, reduced, parametric), circle equation, distance from a point to a line, line/circle
and circle/circle positions, tangent, 49 exercises (37 + 12 in the logic and algorithm block), 16 problems, 6 + 2 défis. Chapter body:
**no mathematical error** (the three line/circle pictures, the five circle/circle pictures (d = 2.8, 2, 1.2, 0.5, 0 with the
given radii), the worked bisector y = 2x-4, the tangent theorem x0 x + y0 y = r^2, the completion of the square
(D^2+E^2-4F)/4, the six cases of two circles). Entry activity (circle through points at 4 cm; distance AB = 5 for
A(1;1), B(4;5)): correct.

**Verdict: the cleanest chapter of the series. 4 statement faults, 3 solution faults; all fixed.** The solutions file
already shows a careful earlier revision (tangents from an exterior point, GPS, incircle).

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| F1 | Exo "Axe radical de deux cercles", items 2 and 3 | C1: x^2+y^2-4x+2y=0 (centre (2,-1), r = sqrt5) and C2: x^2+y^2+2x-6y+6=0 (centre (-1,3), r = 2): d = 5 > sqrt5 + 2 = 4.24, the circles do not meet, so "montrer que l'axe radical passe par les deux points d'intersection" and "vérifier en calculant les intersections" have no object (the solution had to answer "pas d'intersection réelle") | C2 changed to x^2+y^2+2x-6y=0 (centre (-1,3), r = sqrt10; the circles meet at O(0,0) and (8/5,6/5), checked); axis 3x-4y=0 |
| F2 | Exo "Trouver le cercle par conditions", item 2 | "centre sur y = x, tangent aux deux axes. Trouver son équation": a one-parameter family, not a single circle | "de rayon 2 ... ses équations": (x-2)^2+(y-2)^2=4 and (x+2)^2+(y+2)^2=4 |
| F3 | Problème "GPS simplififié" | typo in the title | "simplifié" |
| F4 | structure | `bilan` closed after the last défi of the logic block | `\end{bilan}` moved |
| G1 | sol. same exo as F1 | answered "cercles extérieurs" | rewritten for the corrected statement |
| G2 | sol. "Propositions sur les droites" (1) | "Fausse si on inclut les droites verticales (pas de pente définie)": confused (vertical lines have no slope, so the statement does not concern them) | true for non-vertical lines, with the convention that coincident lines are parallel |
| G3 | sol. "Théorème de Thalès : logique" (4) | cross-chapter reference "Prob. 11 du Ch5" for a different configuration (midpoints, k=1/2) | refers to the problem of this chapter (k=2/3) |

Verified without change (selection): all 37 exercises (e.g. the distances 12/5, 2/5, 2, 0, sqrt5/5, 1; the six circle
equations; parabola x^2 = 4y; (72/25, 21/25); the three explicit intersections), the incircle (0, 3/2), r = 3/2; the
other incircle with r = 9/(3+sqrt5+2sqrt2), the coaxial circles (x = 1, (1, +/- sqrt3)), the tangent problem of the line
3x+4y=25 to the circle of radius 5 (the "corde" is empty, answered as such), Ptolemy's theorem on the unit square, the
common chord ((3,+/-4), length 8), the Python codes (tangents from an exterior point, three-point circle,
GPS, Euler analysis; run for the quoted data). Cross-reference `exo 35` agrees with the numbering.

Level concerns (not changed): the distance formula |ax0+by0+c|/sqrt(a^2+b^2), the position of two circles, the radical
axis and power of a point, Apollonius circles, Ptolemy's theorem, the parabola (marked `ExtensionTTen`), the incircle,
and the Euler line are beyond a strict seconde course; line and circle equations in an orthonormal frame, distance
between two points and tangents belong to the French seconde to première boundary: [VERIFY]. The anecdote on non-Euclidean
geometry is accurate in outline ("l'Univers n'est pas strictement euclidien" is a physics statement, not a proof).

## Chapter 7: Fonctions numériques (`mada-t10-07`)

Structure: functions, parity, reference functions, transformations (the section "Transformations" and the section
"Fonctions de référence" each appear twice, with overlapping content), reading curves, 49 exercises (37 + 12 logic and
algorithm), 16 problems, 6 + 2 défis. Chapter body: **no mathematical error** (definitions of parity and monotonicity with
non-strict inequalities, x^2-4 table, reference-function table, the translation vector (-a,0) of f(x+a), the
worked transformations; the reference-curve plots checked). Entry activity (f(x)=x^2-3: f(-2)=1, f(0)=-3, f(3)=6; x^2-4 table): correct.

**Verdict: body sound; 3 statement faults; the solutions file is already largely correct (it had been revised: several
self-corrections are visible in the text) with 10 remaining errors.** All fixed.

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| H1 | Exo "Fonctions affines", item 3 (stat.) | "fonction affine croissante, zéro en x=4, f(0)=6": impossible (m = -3/2 < 0); the solution said "L'énoncé a des conditions incompatibles" | "décroissante" in the statement; solution adapted |
| H2 | Problème "Maximiser une aire" (stat.) | "Un sommet est sur le diamètre ... Si le sommet sur le diamètre est en (-x,0) et (x,0)": a rectangle has two vertices on the diameter | "Deux sommets ... les sommets sur le diamètre sont (-x,0) et (x,0)" |
| H3 | structure | `bilan` opened before the recap and closed after the last défi of the logic block | `\end{bilan}` moved |
| H4 | sol. "Tableau de variations : lecture" (4) | "Total : 1 ou 2 antécédents" | at most 2; exactly 2 if f is continuous (the table does not force it) |
| H5 | sol. "Valeur absolue et étude" (4) | sign of f(x)-x on 4/3 < x < 4 left as "voir les deux branches" | f - x = 4-3x then x-4: negative on ]4/3,4[ |
| H6 | sol. "Application : trajectoire" (2) | "décroissante sur [2, 4+...]" | [2, +oo[ up to the landing at 4.05 s |
| H7 | sol. "Position relative de deux courbes" (3) | gives the zeros 2 +/- sqrt3 but not the sign | f > g on ]0,2-sqrt3[ and ]2+sqrt3,+oo[ |
| H8 | sol. Problème "Étude de 1/x" (4) | "-1<1 mais f(-1)<f(1) ... semble indiquer la croissance ! En fait ..." (confused reasoning) | f(-1) < f(1) with -1 < 1 rules out "décroissante sur R*" |
| H9 | sol. "Algorithme : vérifier la monotonie" | comment "True (croissante ?)" for `est_croissante(x**2, -3, 0)`; the program returns False | comment corrected |
| H10 | sol. Défi 1, items 2 and 5 | (2) "Vraie" for "si f(a)=f(b), a != b, f n'est pas monotone" - false with the chapter's non-strict definition (constant function); (5) muddled argument for "paire => pas strictement croissante" | (2) false, true for strictly monotone ; (5) f(-1) = f(1) contradicts -1 < 1 => f(-1) < f(1) |
| H11 | sol. Défi 6 (point fixe), (4) | u_3 = 15/8, u_4 = 21/16: wrong (u_n = 3 - 3/2^n gives 21/8, 45/16, 93/32, 189/64) | corrected |

Verified without change (selection): domains of the eight functions (e.g. [-3,+oo[ \ {2}); the tables of values and parities; the
three position studies; the box (V(1.57) = 67.6 > V(1.5) = 67.5 > ... V(2) = 64), the fence (A(25) = 1250), the parabola through A, B, C (x^2-2x), the fixed
points, the zeros of x^3-3x+1 (-1.879, 0.347, 1.532 by numpy), the monotony proofs, the rectangle in the semicircle (25 at
x = 5/sqrt2), the double transformation (-(x-3)^2+2 in both orders). Remaining statements of the logic block ("conditions
sur les extremums": bounded does not imply min and max) answered correctly.

Level concerns (not changed): asymptotes (exercise "Asymptotes", level 1) and limit notations (+oo in tables,
k -> +oo at 2+) need limits; the intermediate value theorem (défi, "ExtensionTTen"); fixed points and
sequences; composition of functions; floor function; the inverse-function exercise (symmetry about y = x); algorithms
for zeros and monotony by sweeping. Which of these belong to the seconde syllabus (functions, variations table,
parity, reference functions are standard): [VERIFY]. Editorial: the two partial overlaps of the chapter body
(two `prop` "Transformations élémentaires", two sections "Fonctions de référence") should be merged by a later pass.

## Chapter 8: Trigonométrie (`mada-t10-08`)

Structure: radians, remarkable values (sin, cos, tan), Pythagorean relation, unit circle, symmetries, equations
cos x = a and sin x = a on [0,2pi], tangent; 49 exercises (37 + 12 in the logic and algorithm block), 16 problems, 6 + 2 défis.
Chapter body: **no mathematical error** (conversion formulas, value table, symmetries table, the worked
cos(5pi/6), cos x = -1/2 -> 2pi/3, 4pi/3 and sin x = sqrt2/2 -> pi/4, 3pi/4; the 16-point figure inside `\iffalse` is also
correct and unused). Hipparchus dates (c. 190-120 BC) acceptable. Entry activity (radian from an arc equal to the radius;
half, quarter and sixth turn): correct.

**Verdict: body sound; 3 statement faults; 9 solution errors, including two wrong Python programs.** All fixed.

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| J1 | Exo "Cercle trigonométrique et triangle", item 2 (stat.) | "triangle de côtés 3, 4, 5 ... θ l'angle opposé au côté 5": that angle is the right angle (cos = 0, tan undefined); the solution wandered ("θ = 90 degrees ?", "AC=?") before using θ = ABC with AB = 4, AC = 3 | statement: AB = 4, AC = 3, BC = 5, θ = ABC ; solution cos = 4/5, sin = 3/5, tan = 3/4 |
| J2 | Exo "Trigonométrie dans un triangle", item 3 (stat.) | A = pi/3, B = pi/4: item 3 asks AC and BC "si le triangle est rectangle en C", which item 2 shows impossible | item 3: compute AC and BC (hint: altitude from C): AC = 6(sqrt3 - 1) = 4.39, BC = 3 sqrt2 (3 - sqrt3) = 5.38 (checked with the law of sines) |
| J3 | structure | `bilan` opened before the recap and closed after the last défi | `\end{bilan}` moved |
| J4 | sol. "Calculer une expression" (1) | "Hmm :" left in the text, repeating the same line | clean |
| J5 | sol. "Triangle" item 3 | answered with the impossibility only | altitude computation |
| J6 | sol. "Conditions sur les solutions d'une équation trig." (2), (3) | "solution unique dans [0,2pi] : a = 1 (x = 0 = 2pi) ou a = -1": a = 1 has two distinct real solutions 0 and 2pi (the algorithm exercise itself counts them); (3) negation accordingly | unique solution only for a = -1 ; negation: |a| > 1 or a = -1 |
| J7 | sol. "Nécessaire et suffisant" (1) | garbled ("sin pi = 0 != implique theta = 0") | n.c. but not sufficient for theta = 0 ; CNS on [0,2pi] for {0, pi, 2pi} ; CNS on R for k pi |
| J8 | sol. "Raisonnement sur les symétries" (4) | uses sin(2θ) (Première) for an inequality that follows from (sinθ - cosθ)^2 >= 0 | elementary proof |
| J9 | sol. Problème "Équation trigonométrique appliquée" (2) | statement asks to verify numerically; solution only quotes Cauchy-Schwarz (beyond the course) | numeric values 3, 4.60, 4.95, 4.96, 4 (all <= 5) |
| J10 | sol. Défi 3 (cos x + sin x = 1) | candidate 2pi never checked: 2pi is a solution (1 + 0 = 1) | solutions 0, pi/2, 2pi |
| J11 | sol. Problème "Archimède" (program) | prints `Pn < pi < Pn_circ` with perimeters 6.28 and 6.29, i.e. "6.28 < 3.14": false inequality, whereas the text announces 3.14103 < pi < 3.14271 | uses P/2 ; text explains the factor 2 |
| J12 | sol. "Nombre pi par périmètre" (comment) | "P_96 ~ 3.14103" for P_n = 2n sin(pi/n) (that is 6.28206) | comment corrected |

Verified without change (selection): exercises 1 to 33 (e.g. the 16 equation solutions, the sign table of sin x + cos x,
the four composed equations, the substitution equations, the 12 numerical values), problems "Mesure d'une hauteur
inaccessible" (h = 5(3 + sqrt3) = 23.66 m), "Résolution systématique" (item 3: only pi/2 and pi; 3pi/2 rejected), "Coordonnées
sur le cercle" (MA = 1 for pi/3; MB = 1 for pi/6 and 5pi/6), "Applications des formules", "Trigonométrie et coordonnées"
(5.36 rad), "Schéma du cercle et arc" (0.6 pi = 1.88 m), "Longueur d'arc et secteur" (32 pi/3, 120 degrees, 10 pi/3, 3pi/2 and 75 pi),
"Trigonométrie et géométrie" (71.6, 45, 63.4 degrees), défis 1 to 7. Cross-reference `exo 35` agrees with the numbering.

Level concerns (not changed): the Cauchy-Schwarz remark (J9) and the half-angle/double-angle use
(`sin(2x) = 2 sin x cos x`, "adm.") are Première; the equations with several roots (`ExtensionTTen` flags are
absent here); the polynomial approximation of cosine (défi 8) and the Archimedes iteration need series/limits; the
tangent equations and inequalities with phase shifts (`sqrt2 sin(x - pi/4)`) in "Signe des fonctions et inégalités" use
the addition formula, which the chapter does not state [VERIFY]. Radians and the unit circle themselves are French
Première (seconde has only the triangle trigonometry): whether radians belong to the Malagasy T10 syllabus: [VERIFY].

## Chapter 9: Statistiques (`mada-t10-09`)

Structure: indicators of position and dispersion, mode, frequencies, grouped series, remarks on classes and
histograms; 45 exercises (33 + 12 in the logic and algorithm block), 16 problems, 6 + 2 défis. Chapter body: definitions of mean,
median, quartiles (ranks ceil(n/4), ceil(3n/4), flagged `ExtensionTTen`), standard deviation (population form 1/n),
variance as mean of squares minus square of the mean, median rule for N odd or even, the remark that histogram
areas are proportional to counts, and the closing figure (values 10 to 22, counts 3,7,10,12,8,5,2: sum of n times x = 734,
mean 15.62, Q1 = 14, Q2 = 16, Q3 = 18 by the stated rank rule): **no mathematical error.** Entry activity
(A = (8,8,8,8,8) and B = (4,6,8,10,12) have mean 8 / 8; automatismes 2,3,3,4,8: n = 5, mean 4, median 3, range 6; replacing 8 by 80
changes mean to 18.4 and range to 78 but not the median): correct. Anecdote on Jacob Bernoulli and "son neveu Nicolas"
quoting the remark about fools: [VERIFY] (the remark is usually attributed to Jacob Bernoulli himself, in a letter to Leibniz).

**Verdict: body sound; the solutions file is the most carefully revised one (it already contains explicit corrections
such as the impossible sigma = sqrt6 case); 12 faults remain, two of them mathematical in the statements and four
wrong "counter-examples" in the solutions.** All fixed.

| # | Location | Quote / problem | Fix applied |
|---|---|---|---|
| K1 | Défi "Paradoxe de Simpson" (stat.) | women A 200/250 = 80 %, B 180/200 = 90 % ; men A 45/50 = 90 %, B 150/300 = 50 % ; global A 81.7 %, B 66 %: A wins among men and globally, B among women: **no reversal, so not a Simpson paradox**, while the statement and the logic exercises/problem "Logique du paradoxe de Simpson" refer to this défi as the example of A better in every group but worse globally | data replaced: women A 150/250 = 60 %, B 25/50 = 50 % ; men A 45/50 = 90 %, B 240/300 = 80 % ; global A 65 %, B 75.7 % (a genuine reversal; checked) |
| K2 | sol. Défi "Paradoxe de Simpson" | the solution itself concludes "B meilleur chez les femmes, A meilleur chez les hommes et globalement" with a confused explanation | rewritten for the corrected data, with the weighting explanation |
| K3 | structure | `bilan` opened before the recap and closed after the last défi, wrapping the logic and algorithm block | `\end{bilan}` moved after the recap list |
| K4 | Exo "Algorithme : moyenne et écart-type" (stat.) | stray cross-reference "(Voir exercice Étude de f(x)=1/x.)" (a function exercise of chapter 7) | removed |
| K5 | Problème "Analyse de données olympiques" | presented as the 100 m final of the Olympic Games "2020" with exact times; the times cannot be confirmed here | "valeurs fictives proches de celles d'une finale olympique" [VERIFY if real data are wanted] |
| K6 | sol. Exo "Sensibilité aux valeurs extrêmes" (3) | gives the median effect (7 -> 8) but not the standard deviation the statement asks for | mean 23.6, sigma = 33.2 (against 7 and 1.41) |
| K7 | sol. Défi "Génération de distributions" (1) | trial and error in the text; two of the tried series do not have sigma = 3 (3.39, 2.74, 3.35) and none is stated as the answer | {5,7,8,10,10,13,13,14}: mean 10, median 10, V = 72/8 = 9, Q1 = 7, Q3 = 13, symmetric box (brute force over 8-value integer series) |
| K8 | same, (2) | {1,2,3,10,15,16,17,16} unsorted, quartiles not given | sorted, Q1 = 2, Q2 = 12.5, Q3 = 16 |
| K9 | sol. Défi "Encadrement de la moyenne" (2) | "Non" with the example {1,1,3,100} whose mean 26.25 is **above** Q2: not a counter-example to "mean >= Q2" | {1,10,10,10,10}: median 10, mean 8.2 |
| K10 | same, (3) | "Non" with {1,4,5,8,12} where mean 6 != median 5: the hypothesis "mean = Q2" is not satisfied | {0,1,5,6,13}: mean 5 = Q2, Q2 - Q1 = 4 != Q3 - Q2 = 1 |
| K11 | sol. Défi "Variance minimale et inégalité" (3) | invokes Cauchy-Schwarz for x2bar >= xbar^2, which is just V >= 0 | direct from (1) and (2) |
| K12 | sol. "Logique de la transformation affine" (2) | "Voir exo 33 ci-dessus": exercise 33 is the regression, the property is proved in "Transformation affine et statistiques" | reference corrected |

Verified without change (selection): exercises 1 to 28 (all means, medians, variances, the 25-grade class: sum 320,
sum of squares 4338, mean 12.8, sigma 3.11, Q = (11,12,15); quality control: mean 19.977, sigma 0.242, 5 rejected = 16.7 %;
trip times: mean 33.25, sigma 24.81, Q = (14.67, 27, 44); life expectancy and income; arithmetic sequence sigma = 2 sqrt(99/12);
gender medians; class evolution 11.6 and sigma 2.97), 29 (Simpson with the exercise's own data: 90/80 % and 60/50 %,
global 62.7/77.3 %: a genuine paradox), 31 to 33 (r = 0.85, regression y = 0.8x+2.6 and prediction 7.4), the impossible case
sigma = sqrt6 (discriminant 4900 - 5380 < 0), the impossibility of mean 10, unique mode 10, median != 10. Cross-references
`exo 29` and `défi 1` agree with the numbering.

Level concerns (not changed): quartiles, boxplots, outliers and interquartile range are declared outside the T10
programme by the chapter itself (`\horsprogramme`) yet are used in the level-1 exercise "Indicateurs sur une série" (item 3) and
in the problems; correlation coefficient and linear regression (exercises "Corrélation élémentaire", "Statistiques
bidimensionnelles", défi, problem "Vecteurs et régression" of chapter 5) are beyond seconde; the standard deviation
and variance (taught from the French seconde: [VERIFY] for the Malagasy T10), random-variable simulation with
`random.uniform`, the "loi des grands nombres" anecdote (probability, not statistics), contexts in euros/France in two
problems (genre, comparaison internationale) rather than Malagasy data.

## Summary

| Chapter | Errors found | Fixed | Open errors | Open [VERIFY] / level points |
|---|---|---|---|---|
| 2 Algorithmique | 21 (2 statement, 19 solution) | 21 | 0 | 5 |
| 3 Calcul dans R | 39 (7 statement, 32 solution) | 39 | 0 | 6 |
| 4 Équations et inéquations | 8 (3 statement, 5 solution) | 8 | 0 | 8 |
| 5 Vecteurs du plan | 27 (6 statement, 21 solution) | 27 | 0 | 6 |
| 6 Droites et cercles | 7 (4 statement, 3 solution) | 7 | 0 | 5 |
| 7 Fonctions numériques | 11 (3 statement, 8 solution) | 11 | 0 | 5 |
| 8 Trigonométrie | 12 (3 statement, 9 solution) | 12 | 0 | 5 |
| 9 Statistiques | 12 (4 statement, 8 solution) | 12 | 0 | 6 |
| **Total** | **137** | **137** | **0** | **46** |

Counting rule: one row of the tables above is one error (a row may group items of the same exercise); missing sub-answers are
counted as errors only when the solution answered another question or a wrong value. "Fixed" means corrected in the TeX
source under `content/malagasy/source/t10/{chapters,solutions}/`; not compiled (no `pdflatex`), balanced `begin`/`end`
and braces verified for all 16 edited files.

Cross-cutting findings:

1. **Statement/solution drift** is the dominant defect (about half of the errors): chapter 3 problems and défis,
   chapters 2, 5 and 8 several items. The solutions file of chapter 3 had to be rewritten for 12 of 16 problems and the six
   main défis. A mechanical comparison of the headings of statement and solution is not enough: the titles match while the questions do not.
2. **Same structural fault in chapters 3 to 9**: the `bilan` environment is closed only after the last défi of the
   "Logique & Algorithmes" block (all 7 chapters). Fixed in each chapter (the recap is closed after its list).
3. **Wrong programs in solutions** (checked by running): chapter 4 root sweep prints nothing (strict `< 0` with roots on the grid),
   chapter 8 Archimedes program prints `6.28 < 3.14`, chapter 7 comment on monotony.
4. **Level.** A large part of the content (discriminant, scalar product, radians, standard deviation, regression, Newton and
   Euler lines, intermediate value theorem, derivatives in two problems, Cardano, Descartes) is above a strict seconde
   course; the sources already mark some of it `\horsprogramme` or `ExtensionTTen`, inconsistently. No programme reference
   was invented: every programme question is left as [VERIFY] for the owner (`docs/CURRICULUM.md`, `PROJECT_BRIEF.md` section 3).
5. Language rule: Malagasy curriculum, French only; the bilingual goal for lessons stays on standby, as unfinished work.

Nothing in `site/`, `dist/`, the manifest or `chapters.json` was changed; no commit or push was made.
