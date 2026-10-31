# Mathematicians' timeline: classification decisions (workstream B)

**31 October 2026.** The owner delegated the three-way split to the agent ("full dedicated biography / timeline entry only / not shown but still credited"). These are **editorial decisions on the proposal** in `timeline-classification-20261031.md`; they are not a live update and nothing in `site/` changed. Facts and dates still need independent historical review and the two-agent publication gate before any text is published.

Rules applied: (1) the person has a substantial, sourceable body of original mathematics; (2) enough trustworthy biographical material exists; (3) being named after a theorem, puzzle or object on the site is not a reason. People not shown stay credited in the **advances** timeline and wherever their result appears. No excluded person is moved into another biography list.

## A. Existing 86 entries

**MAJOR (dedicated biography + timeline entry, linked both ways): 40.** The 37 of the proposal, plus **Legendre** (least squares, elliptic integrals, the geometry textbook that shaped teaching), **Sophie Germain** (existing page kept; plate theory, partial result on Fermat's last theorem, documented correspondence) and **John Conway** (finite groups, surreal numbers, knot invariants; Game of Life is the popular but minor part). Jacob Bernoulli and Shannon stay MAJOR.

**SEMI (short biographical account in the timeline only): 16.** thales, pythagoras (the account states what is and is not attested; if sources prove insufficient, drop), hypatia (existing page folded into the timeline entry, redirect from `#biographies/hypatia`), johann-bernoulli, mobius, bayes, bertrand, galton, voronoi, steinhaus, ulam, lorenz, penrose, may, appel, haken. Rule: an entry that cannot reach a meaningful paragraph from serious sources is removed, not padded. bayes, bertrand, galton and may are conditional on a specialist source.

**NOT SHOWN (30), credit kept elsewhere:** the 22 listed in section 2.4 of the proposal (ahmes … schettini-gherardini), plus plato (philosopher and patron, not a producer of mathematics), buffon (mathematics a minor part of his work; the needle problem stays credited to him in the advances timeline and the lab), hammersley, plateau, reuleaux, newcomb, gardner (a popularizer; recognition belongs in reading texts, not in the people timeline), moser.

Check: 40 + 16 + 30 = 86. (The brief says 85; the file holds 86, `penrose` being the extra one. Record the count as 86 in the next register update.)

## B. Missing figures

- **P1 of the proposal (section 5): MAJOR candidates**, written in batches as sources are gathered: Eudoxus, Apollonius, Diophantus, Bhaskara II, al-Tusi, al-Kashi, Zu Chongzhi, Qin Jiushao, Seki Takakazu, Viète, Napier, d'Alembert, Laplace, Riemann, Dirichlet, Jacobi, Hamilton, Lobachevsky, Bolyai, Boole, Weierstrass, Chebyshev, Dedekind, Lie, Cantor, Kovalevskaya, Markov, Lebesgue, Hausdorff, Hardy, Kolmogorov, Gödel, Weil, Mandelbrot, Nash, Grothendieck. A name enters the site only once a dedicated, sourced biography is written and reviewed.
- **P2: SEMI candidates**, same condition. Ada Lovelace only with her debated role stated precisely.
- **Living mathematicians:** professional record only (publications, prizes, results), from public sources, no private details. Wiles and Perelman: SEMI. Smale and Uhlenbeck: SEMI. Tao: not shown for now (revisit later). Penrose: SEMI.
- **Women and regions:** research du Châtelet, Agnesi, Somerville, Johnson, and sources for sub-Saharan Africa and the Malagasy tradition. Nothing is added without a source; no invented names.

## C. Implementation order (each step passes the publication gate before it goes live)

1. Fix `site/js/history-data.js` counts, remove the 30 not-shown entries from the **people** timeline only (advances untouched), update tests that count people or biographies.
2. Expand the 7 existing biographies (gauss, von-neumann, erdos, liu-hui, mirzakhani, germain; hypatia folded).
3. New MAJOR pages by group, oldest first, FR and EN; two independent reviewers per batch.
4. SEMI summaries, then missing P1/P2 figures.
Bilingual curriculum-lesson goal remains on standby; the timeline is bilingual by default.
