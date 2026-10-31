# Mathematicians' timeline: classification proposal (workstream B, chunk 1)

**Status: proposal only. Not independently reviewed. The served site (`site/`, `content/`, `dist/`) is not changed.**
Prepared 31 October 2026 from `docs/ACTIVE_WORKSTREAMS.md` (binding revised brief, 31 October 2026). Nothing here is
evidence of a live update. No quota is applied: the classes follow mathematical importance and the amount of trustworthy
material available. Dates marked **[VERIFY]** are from memory and must be checked against a serious source (MacTutor,
a biographical dictionary, a specialist monograph) before use. Where the dataset holds a discovery year instead of a
lifetime (for example `benford` 1938), the lifetime is not recorded in `history-data.js`.

Classes: **MAJOR** = dedicated biography page plus timeline entry, linked both ways. **SEMI** = substantial short
biographical account inside the timeline only. **UNCERTAIN** = no class proposed until evidence is checked.
**EXCLUDE** = remove from the people timeline (results stay in the advances timeline with correct credit; no
replacement biography list).

## 1. Inventory

- `site/js/history-data.js` `PEOPLE`: **86** `person(...)` entries (the brief and draft say 85; recount before any
  count is quoted in the project record). Fields: id, name, start, end, context, bilingual summary, source, links.
- Dedicated biographies in `site/js/reading-content.js` (`BIOGRAPHIES`): **7**. All 7 have a timeline entry.

| Biography id | Where | Rough size (FR+EN source bytes) | Sections | Assessment |
|---|---|---|---|---|
| `gauss` | lines 8-39 | ~5.8 KB | several | longest; still short for a MAJOR page |
| `von-neumann` | lines 40-68 | ~5.0 KB | several | as above |
| `erdos` | lines 69-97 | ~4.2 KB | several | as above |
| `liu-hui` | pushed ~line 215 | ~1.9 KB | 1 (2 paragraphs) | thin; expand |
| `hypatia` | ~line 228 | ~1.8 KB | 1 (2 paragraphs) | thin; person is SEMI, so page is optional |
| `germain` | ~line 239 | ~1.9 KB | 1 (2 paragraphs) | thin; see uncertain cases |
| `mirzakhani` | ~line 250 | ~1.6 KB | 1 (2 paragraphs) | thin; expand |

Every existing biography is below the "substantial, sourced, main original contributions" bar of point 1 of the brief
and needs reuse-and-improve work, not duplication. 79 of the 86 entries have no biography page.

## 2. Classification of the 86 existing entries

Totals: **MAJOR 37, SEMI 19, UNCERTAIN 8, EXCLUDE 22** (sum 86). Of the 37 MAJOR, 5 have an existing biography
(gauss, von-neumann, erdos, liu-hui, mirzakhani); 32 need a new page. "Draft" = status in
`mathematicians-timeline-expanded-profiles.md` (46 portraits / 39 proposed exclusions).

### 2.1 MAJOR (37)

| Id | Name | Dates in data | Draft | Note |
|---|---|---|---|---|
| euclid | Euclide | -325 to -265 | 46 | Elements; biographical facts scarce, write about the work |
| archimedes | Archimède | -287 to -212 | 46 | |
| liu-hui | Liu Hui | 220-280 | 46 | existing thin biography |
| aryabhata | Aryabhata | 476-550 | 46 | |
| brahmagupta | Brahmagupta | 598-670 | 46 | |
| al-khwarizmi | Al-Khwarizmi | 790-850 | 46 | |
| ibn-al-haytham | Ibn al-Haytham | 965-1039 | 46 | |
| khayyam | Omar Khayyam | 1048-1131 | 46 | |
| fibonacci | Leonardo de Pise | 1170-1250 | 46 | |
| madhava | Madhava | 1350-1425 | 46 | dates approximate; school of Kerala attribution needs care |
| cardano | Gerolamo Cardano | 1501-1576 | 46 | shared priority (del Ferro, Tartaglia, Ferrari) |
| descartes | René Descartes | 1596-1650 | 46 | |
| fermat | Pierre de Fermat | 1601-1665 | 46 | |
| pascal | Blaise Pascal | 1623-1662 | 46 | |
| huygens | Christiaan Huygens | 1629-1695 | 46 | |
| newton | Isaac Newton | 1643-1727 | 46 | |
| leibniz | Gottfried Wilhelm Leibniz | 1646-1716 | 46 | |
| jacob-bernoulli | Jacob Bernoulli | 1655-1705 | 46 | Ars conjectandi, series, calculus of variations beginnings; borderline MAJOR/SEMI |
| euler | Leonhard Euler | 1707-1783 | 46 | |
| lagrange | Joseph-Louis Lagrange | 1736-1813 | 46 | |
| fourier | Joseph Fourier | 1768-1830 | 46 | |
| gauss | Carl Friedrich Gauss | 1777-1855 | 46 | existing biography |
| cauchy | Augustin-Louis Cauchy | 1789-1857 | 46 | |
| abel | Niels Henrik Abel | 1802-1829 | 46 | |
| galois | Évariste Galois | 1811-1832 | 46 | |
| klein | Felix Klein | 1849-1925 | 46 | Erlangen programme |
| poincare | Henri Poincaré | 1854-1912 | 46 | |
| hilbert | David Hilbert | 1862-1943 | 46 | |
| noether | Emmy Noether | 1882-1935 | 46 | |
| ramanujan | Srinivasa Ramanujan | 1887-1920 | 46 | |
| banach | Stefan Banach | 1892-1945 | 46 | functional analysis |
| tarski | Alfred Tarski | 1901-1983 | 46 | logic, model theory, Banach-Tarski (with Banach) |
| von-neumann | John von Neumann | 1903-1957 | 46 | existing biography |
| turing | Alan Turing | 1912-1954 | 46 | |
| erdos | Paul Erdős | 1913-1996 | 46 | existing biography |
| shannon | Claude Shannon | 1916-2001 | 46 | information theory; borderline MAJOR/SEMI (engineer-mathematician) |
| mirzakhani | Maryam Mirzakhani | 1977-2017 | 46 | existing biography; the dataset end date 2017 is her death, start is birth |

### 2.2 SEMI (19): short biographical account in the timeline only

| Id | Name | Dates in data | Draft | Reason / disagreement |
|---|---|---|---|---|
| thales | Thalès | -624 to -547 | 39 excl | DISAGREE. Traditional "first" geometer; evidence late and legendary, so a careful short account on what is and is not attested. May be UNCERTAIN |
| pythagoras | Pythagore | -570 to -490 | 39 excl | DISAGREE. Same: school and tradition, attribution problems are themselves the content |
| plato | Platon | -427 to -347 | 39 excl | DISAGREE. Philosopher-patron of the Academy, role in Eudoxus/Theaetetus circle; a short account is defensible, not a page |
| hypatia | Hypatie | 370-415 | 39 excl | DISAGREE. Sources fragmentary but the person is well documented as a teacher and commentator; existing page may stay |
| johann-bernoulli | Johann Bernoulli | 1667-1748 | 46 | agree it is not a page; teacher of Euler, brachistochrone, l'Hôpital rule dispute |
| legendre | Adrien-Marie Legendre | 1752-1833 | 46 | borderline MAJOR (elliptic integrals, least squares, quadratic reciprocity statement) |
| germain | Sophie Germain | 1776-1831 | 46 | existing page; Germain primes/FLT partial result, plate theory; borderline MAJOR, owner may keep the page |
| mobius | August Ferdinand Möbius | 1790-1868 | 46 | |
| bayes | Thomas Bayes | 1702-1761 | 39 excl | DISAGREE. One posthumous essay but of lasting importance; documentation of his life is thin [VERIFY enough material] |
| buffon | Georges-Louis Leclerc de Buffon | 1707-1788 | 39 excl | DISAGREE. Needle problem is geometric probability; life is well documented, mathematics is a minor part of his work |
| bertrand | Joseph Bertrand | 1822-1900 | 39 excl | DISAGREE. Bertrand's postulate, paradox, textbooks, Academy secretary; check which results are his |
| galton | Francis Galton | 1822-1911 | 39 excl | DISAGREE. Regression, correlation; polymath more than mathematician, statistics-history framing |
| voronoi | Georgy Voronoï | 1868-1908 | 46 | |
| steinhaus | Hugo Steinhaus | 1887-1972 | 46 | |
| ulam | Stanisław Ulam | 1909-1984 | 46 | |
| conway | John Horton Conway | 1937-2020 | 46 | borderline MAJOR (finite groups, surreal numbers, Game of Life, knot theory) |
| lorenz | Edward Lorenz | 1917-2008 | 39 excl | DISAGREE. Meteorologist; 1963 paper on deterministic chaos |
| penrose | Roger Penrose | 1931- | none | GAP in draft (in neither list). Tilings, twistors, singularity theorems (Nobel Prize in Physics 2020 [VERIFY]) |
| hammersley | John Hammersley | 1920-2004 | 46 | DISAGREE with a full portrait; percolation, Monte Carlo; SEMI at most |

### 2.3 UNCERTAIN (8): see section 4

plateau, reuleaux, newcomb, gardner, may, appel, haken, moser.

### 2.4 EXCLUDE (22): all were already in the draft's 39

| Id | Name | Entry date(s) | Why |
|---|---|---|---|
| ahmes | Ahmès | -1550 | scribe of the Rhind papyrus; the papyrus belongs in advances |
| benford | Frank Benford | 1938 | physicist; named law only |
| gerver | Joseph Gerver | 1992 | sofa problem result only |
| tokarsky | George Tokarsky | 1995 | one result (unlit room) |
| domokos | Gábor Domokos | 2006 | Gömböc co-discoverer; result stays in advances |
| varkonyi | Péter Várkonyi | 2006 | same |
| lelievre | Samuel Lelièvre | 2016 | one result (billiards) |
| monteil | Thierry Monteil | 2016 | same |
| weiss | Barak Weiss | 2016 | same; research career exists but not documented on site |
| wolecki | Amit Wolecki | 2019-2024 | same |
| smith | David Smith | 2023 | amateur discoverer of the hat tile; credit stays in advances |
| myers | Joseph Samuel Myers | 2023 | one result |
| kaplan | Craig S. Kaplan | 2023 | one result |
| goodman-strauss | Chaim Goodman-Strauss | 2023 | one result |
| baek | Jineon Baek | 2024 | one result |
| ferguson | Thomas S. Ferguson | 1989 | one problem |
| ruggles | Richard Ruggles | 1947 | one problem |
| brodie | Henry Brodie | 1947 | one problem |
| selvin | Steve Selvin | 1975 | one problem (Monty Hall letter) |
| hatcher | Allen Hatcher | 2002 | one textbook figure |
| siegrist | Kyle Siegrist | 2022 | applet author |
| schettini-gherardini | Tancredi Schettini Gherardini | 2026 | one result |

## 3. Comparison with the draft (46 / 39)

- Draft 46 vs this proposal: 37 of the 46 stay MAJOR; **9 move to SEMI**: johann-bernoulli, legendre, germain, mobius,
  voronoi, steinhaus, ulam, conway, hammersley. Several (legendre, germain, conway, jacob-bernoulli, shannon) are
  borderline and the owner's "genuinely major" threshold decides.
- Draft 39 vs this proposal: **22 confirmed EXCLUDE; 9 move to SEMI** (thales, pythagoras, plato, hypatia, bayes,
  buffon, bertrand, galton, lorenz); **8 become UNCERTAIN** (plateau, reuleaux, newcomb, gardner, may, appel, haken,
  moser). 22 + 9 + 8 = 39.
- Gap: `penrose` is in neither draft list (86 entries = 46 + 39 + 1). Proposed SEMI.
- The 46 portraits already drafted are working material only; none has been independently verified.

## 4. Uncertain cases (no class proposed yet)

| Id | Name | Question to settle | Lean |
|---|---|---|---|
| plateau | Joseph Plateau | Physicist (soap films, persistence of vision). Plateau's problem is mathematical but he proved little. Is his life documented as mathematical? | EXCLUDE |
| reuleaux | Franz Reuleaux | Engineer, kinematics of machines. Triangle bears his name; was the shape his invention? Attribution history is murky [VERIFY] | EXCLUDE |
| newcomb | Simon Newcomb | Astronomer. Mathematics is applied; "Newcomb-Benford" observation 1881 [VERIFY] | EXCLUDE |
| gardner | Martin Gardner | Popularizer, not a research mathematician (1914-2010). Does a "significant contribution to the mathematical culture" count under the brief? | owner decision |
| may | Robert May | Mathematical ecology, logistic map and chaos in populations; lifetime not in data (1936-2020 [VERIFY]) | SEMI if sourced |
| appel | Kenneth Appel | Four colour theorem 1976 with Haken; computer-assisted proof is historically major | SEMI as a pair if sourced |
| haken | Wolfgang Haken | Also Haken manifolds, knot recognition algorithms [VERIFY] | SEMI as a pair if sourced |
| moser | Leo Moser | Number theory and combinatorial geometry (moving sofa, worm problem); known mainly via the problem, but real career (1921-1970) | EXCLUDE unless sourced |

Other points to settle:
- **Germain**: existing page plus draft portrait; SEMI/MAJOR boundary (owner may prefer MAJOR to keep the page).
- **Bayes**: documentation of his life is thin even if the result is major. A SEMI account may not reach the "meaningful
  short biography" threshold [VERIFY with a specialist source].
- **Thales / Pythagoras / Plato**: whether a legendary or tradition-based figure can pass the "documented sufficiently"
  test. The brief forbids filler; a short honest account of the tradition may or may not satisfy it.
- **Dates**: `madhava` 1350-1425 and `liu-hui` 220-280 are approximate in the data; `penrose` end is null (living).
- **Entry count**: 86 in the file versus 85 stated. Find which entry is the extra one.

## 5. Major mathematicians missing from the current dataset

Names and years only, with one line on why major. Dates marked [VERIFY] are not certain. Ids to be chosen later.
"P1" = I judge indispensable for a credible timeline; "P2" = strong candidate.

### 5.1 Antiquity (Greek, Hellenistic, late antique)

| Name | Years | Why major | Priority |
|---|---|---|---|
| Eudoxus of Cnidus | c. -408 to c. -355 [VERIFY] | theory of proportion, method of exhaustion; the base of Euclid Books V and XII | P1 |
| Apollonius of Perga | c. -262 to c. -190 [VERIFY] | Conics; named the ellipse, parabola, hyperbola | P1 |
| Eratosthenes | c. -276 to c. -194 [VERIFY] | sieve, measure of the Earth, geography | P2 |
| Hipparchus | c. -190 to c. -120 [VERIFY] | founder of trigonometry by chord tables | P2 |
| Ptolemy | c. 100 to c. 170 [VERIFY] | Almagest, chord table, spherical astronomy | P2 |
| Diophantus | c. 200-284 traditional [VERIFY] | Arithmetica; symbolic algebra, integer and rational equations | P1 |
| Pappus of Alexandria | c. 290 to c. 350 [VERIFY] | Collection; projective ideas, Pappus theorem | P2 |

### 5.2 India

| Name | Years | Why major | Priority |
|---|---|---|---|
| Bhaskara II (Bhaskaracharya) | 1114-1185 | Lilavati and Bijaganita; Pell-type equations (chakravala), early calculus ideas | P1 |
| Bhaskara I | c. 600 to c. 680 [VERIFY] | place-value expositions, sine approximation formula | P2 |
| Nilakantha Somayaji | 1444 to 1544 [VERIFY] | Kerala school; series for the arctangent, reformulated planetary model | P2 |
| Mahavira | 9th century [VERIFY] | Ganita Sara Samgraha; combinatorics, fractions | P2 |

### 5.3 Islamic world and Central Asia

| Name | Years | Why major | Priority |
|---|---|---|---|
| Thabit ibn Qurra | 826-901 | amicable numbers rule, generalization of Pythagoras, translations | P2 |
| Abu Kamil | c. 850 to c. 930 [VERIFY] | extended al-Khwarizmi's algebra, irrational solutions | P2 |
| Al-Karaji | c. 953 to c. 1029 [VERIFY] | algebra of polynomials, early induction argument | P2 |
| Al-Biruni | 973-1048 | trigonometry, astronomy, geodesy | P2 |
| Al-Samawal | c. 1130 to c. 1180 [VERIFY] | algebra of polynomials, decimal fractions | P2 |
| Nasir al-Din al-Tusi | 1201-1274 | trigonometry as a separate discipline, parallel postulate | P1 |
| Jamshid al-Kashi | c. 1380 to 1429 [VERIFY] | π to 16 digits, decimal fractions, law of cosines | P1 |

### 5.4 China and East Asia

| Name | Years | Why major | Priority |
|---|---|---|---|
| Zu Chongzhi | 429-500 | π to seven decimals (355/113); volume of the sphere with his son | P1 |
| Qin Jiushao | c. 1202 to c. 1261 [VERIFY] | Chinese remainder theorem treatise; Horner-type method | P1 |
| Yang Hui | c. 1238 to c. 1298 [VERIFY] | binomial triangle, magic squares | P2 |
| Zhu Shijie | c. 1260 to c. 1320 [VERIFY] | Jade Mirror of the Four Unknowns | P2 |
| Seki Takakazu | c. 1642 to 1708 [VERIFY] | determinants, Bernoulli numbers, Japanese wasan | P1 |
| Hua Luogeng | 1910-1985 | analytic number theory, founder of modern Chinese mathematics | P2 |
| Shiing-Shen Chern | 1911-2004 | differential geometry, Chern classes | P2 |

### 5.5 Europe, Renaissance to the 18th century

| Name | Years | Why major | Priority |
|---|---|---|---|
| Nicole Oresme | c. 1320 to 1382 [VERIFY] | graphing of qualities, divergence of the harmonic series | P2 |
| François Viète | 1540-1603 | founding of symbolic algebra | P1 |
| John Napier | 1550-1617 | logarithms | P1 |
| Johannes Kepler | 1571-1630 | laws of planetary motion, packing conjecture, volumes | P2 |
| Girard Desargues | 1591-1661 | projective geometry | P2 |
| John Wallis | 1616-1703 | infinite products, notation ∞ [VERIFY the attribution] | P2 |
| Colin Maclaurin | 1698-1746 | series, geometry of curves | P2 |
| Jean le Rond d'Alembert | 1717-1783 | wave equation, fundamental theorem of algebra attempt | P1 |
| Gaspard Monge | 1746-1818 | descriptive geometry, École polytechnique | P2 |
| Pierre-Simon Laplace | 1749-1827 | celestial mechanics, probability, Laplace equation | P1 |

### 5.6 19th century

| Name | Years | Why major | Priority |
|---|---|---|---|
| Bernhard Riemann | 1826-1866 | Riemann surfaces, integral, hypothesis, geometry | P1 |
| Peter Gustav Lejeune Dirichlet | 1805-1859 | analytic number theory, modern definition of function | P1 |
| Carl Gustav Jacob Jacobi | 1804-1851 | elliptic functions, determinants | P1 |
| William Rowan Hamilton | 1805-1865 | quaternions, Hamiltonian mechanics | P1 |
| Nikolai Lobachevsky | 1792-1856 | non-Euclidean geometry | P1 |
| János Bolyai | 1802-1860 | non-Euclidean geometry | P1 |
| Jean-Victor Poncelet | 1788-1867 | projective geometry | P2 |
| Ernst Kummer | 1810-1893 | ideal numbers, Fermat for regular primes | P2 |
| George Boole | 1815-1864 | algebra of logic | P1 |
| Karl Weierstrass | 1815-1897 | rigorous analysis | P1 |
| Ada Lovelace | 1815-1852 | the first published program for the Analytical Engine; role debated, handle with care | P2 |
| Pafnuty Chebyshev | 1821-1894 | prime counting, approximation theory | P1 |
| Arthur Cayley | 1821-1895 | matrices, group theory | P2 |
| Leopold Kronecker | 1823-1891 | algebraic number theory, constructivist views | P2 |
| Richard Dedekind | 1831-1916 | real numbers by cuts, ideals | P1 |
| Camille Jordan | 1838-1922 | group theory, Jordan curve | P2 |
| Sophus Lie | 1842-1899 | continuous groups | P1 |
| Georg Cantor | 1845-1918 | set theory, transfinite numbers | P1 |
| Sofia Kovalevskaya | 1850-1891 | partial differential equations, first woman professor in modern Europe [VERIFY the "first" claim] | P1 |
| Gottlob Frege | 1848-1925 | modern logic | P2 |
| Giuseppe Peano | 1858-1932 | axioms for the natural numbers | P2 |
| Aleksandr Lyapunov | 1857-1918 | stability theory | P2 |
| Andrey Markov | 1856-1922 | Markov chains | P1 |

### 5.7 20th century and later

| Name | Years | Why major | Priority |
|---|---|---|---|
| Henri Lebesgue | 1875-1941 | integration theory | P1 |
| Jacques Hadamard | 1865-1963 | prime number theorem proof (with de la Vallée Poussin) | P2 |
| Hermann Minkowski | 1864-1909 | geometry of numbers, spacetime | P2 |
| Felix Hausdorff | 1868-1942 | topology, dimension | P1 |
| Ernst Zermelo | 1871-1953 | axiomatic set theory | P2 |
| G. H. Hardy | 1877-1947 | analysis and number theory, mentor of Ramanujan | P1 |
| Bertrand Russell | 1872-1970 | logic, paradox | P2 |
| Hermann Weyl | 1885-1955 | geometry, groups, mathematical physics | P2 |
| Mary Cartwright | 1900-1998 | early work on chaos (with Littlewood) | P2 |
| Andrey Kolmogorov | 1903-1987 | axioms of probability, many fields | P1 |
| Kurt Gödel | 1906-1978 | incompleteness | P1 |
| Alonzo Church | 1903-1995 | lambda calculus, computability | P2 |
| André Weil | 1906-1998 | algebraic geometry, number theory | P1 |
| Julia Robinson | 1919-1985 | Hilbert's tenth problem | P2 |
| Benoît Mandelbrot | 1924-2010 | fractal geometry | P1 |
| John Nash | 1928-2015 | game theory, embedding theorem | P1 |
| Alexander Grothendieck | 1928-2014 | modern algebraic geometry | P1 |
| Michael Atiyah | 1929-2019 | index theorem, geometry and physics | P2 |
| Stephen Smale | b. 1930 [VERIFY] | dynamics, topology (living) | P2 |
| William Thurston | 1946-2012 | geometrization of 3-manifolds | P2 |
| Karen Uhlenbeck | b. 1942 [VERIFY] | geometric analysis, first woman to receive the Abel Prize 2019 [VERIFY] | P2 |
| Andrew Wiles | b. 1953 | proof of Fermat's last theorem (announced 1993, completed 1994-95 [VERIFY]) | P1 |
| Grigori Perelman | b. 1966 | Poincaré conjecture (living; see caution below) | P2 |
| Terence Tao | b. 1975 | Fields Medal 2006 (living) | P2 |

Living mathematicians (Wiles, Perelman, Tao, Smale, Uhlenbeck, Penrose) need a project decision on whether and how to
profile them (privacy, press accuracy); no dated claim here is a recommendation to publish.

Gaps in coverage, to be sourced separately: Africa south of the Sahara and the Malagasy tradition (no figure proposed
here without a source; do not invent), pre-Columbian America, and medieval Hebrew and Latin European mathematics.
Women remain few; the list above includes Kovalevskaya, Lovelace, Cartwright, Robinson, Uhlenbeck; others to research:
Emilie du Châtelet (1706-1749 [VERIFY]), Maria Gaetana Agnesi (1718-1799 [VERIFY]), Mary Somerville, Katherine Johnson.

## 6. Next steps (not done here)

1. Owner reviews the borderline MAJOR/SEMI cases and the 8 UNCERTAIN.
2. Pick one bounded group (for example antiquity, or the 5 existing biographies to enlarge) and gather sources.
3. Draft, then independent review of facts and both languages, then the two-agent publication gate.
4. Language rule: French pages in French, international curriculum in English, bilingual by default for the timeline;
   the bilingual lesson goal is on standby as unfinished work.
