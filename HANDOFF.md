# Handoff

## Exam archive filters (5 November 2026)

The annales index starts with exam and search. The redundant class selector is
removed. Existing year and notion selectors appear only after an exam is chosen;
their options come from that exam, and unavailable selections clear on a switch.
The existing chapter entry remains unchanged; no extra topic selector was added.
Reset restores the compact initial form.

## Site-wide ergonomics (5 November 2026)

The homepage approach now extends to catalogues, collections and classroom tools.
Shared class memory lives in `navigation-state.js`; `page-ergonomics.js` groups
optional generator settings without replacing controls. Compact course, practice
and slide lists retain every resource. Downloads and sources are disclosed on
demand; collections have previous/next and a folded complete chooser. Discovery
starts with a domain or a search. The main navigation preserves class context.
Mathematical models, activity controls and content are retained. Styles use the
existing tokens in `styles/ergonomics.css`.

## Approved homepage ergonomics (5 November 2026)

The home keeps the existing design and now guides students from class to chapter.
It uses actual live chapter destinations, remembers the class on this device,
reuses the last-chapter link and searches chapter titles with accents and synonyms.
Large card grids and duplicate entry buttons are removed. One fixed manipulable
parabola replaces the five-scene slideshow; discovery links are secondary and
teaching tools are grouped under a disclosure. Source: `site/js/welcome.js`,
`site/styles/home.css`; the app owns figure cleanup and theme changes.

## Algorithms and program rendering (5 November 2026)

The annales HTML converter now protects literal listings and table/minipage-based
programs before prose and figure conversion. Indentation, line numbers, blank
lines, literal operators, completion placeholders and candidate labels remain
visible. Mathematical pseudocode retains MathJax notation. Program candidates
wrap into individual columns/cards on phones; code scrolls within its own block.
Printing reuses the same markup. Existing source values and program logic are
retained. `scripts/annals-code.py` owns the conversion; regressions are in
`tests/test_annals_code.py` and `tests/annals-bank.test.mjs`. The PDF books are
retained only after comparing every archived typesetting input and output hash.

## Exercise navigation (5 November 2026)

The bank now separates chapter practice from exam annales with visible collection
links. Practice counts exclude past papers; chapter cards show annales separately.
Chapter annales are folded into their own section, and the annales index filters
by class as well as exam, year and topic. Direct links omit catalogue filters;
loading more results preserves opened exercises. Exercises without a source
correction are labelled before opening. The redundant French curriculum heading
is removed from bank, courses and slides; phone class links wrap into visible rows.

## Curriculum visibility corrected (4 November 2026)

The owner clarified: hide the other curricula only. Galleries, curiosities, all
laboratories, foundations, challenges, history, reading, Olympiad and shared workshops
are visible again, along with the original Explorer/Lire navigation and bilingual
interface. The Pathways menu and its footer link are hidden at the owner’s request;
old Pathways links return to courses. Course selectors show only the French curriculum; hidden
curriculum links still return to the French courses. Shared library resources and
source bundles remain accessible. No resource files were removed.
`site/js/live-curriculum.js` is the shared curriculum visibility policy.

## Fractions foundation (4 November 2026)

Integrated the supplied fractions workbench at `#basics/fractions`, seventh foundation. Eight activities, six guided challenges, shared Cahier typography and themes, visible activity grid, keyboard focus and bounded SVG handles, automatic iframe resizing, arithmetic discovery link. French and English by the specific owner request of 4 November 2026. Sources: `site/resources/basics/fractions.html` and `site/resources/basics/fractions.en.html`, with identical scripts outside the language table; regression coverage: `tests/fractions.test.mjs`.

## Open issues: triage (1 November 2026, night, issues agent; read-only checks, nothing closed)

| Issue | State found on `main` | Plan |
|---|---|---|
| #1 Illumination, Penrose room | owned by the gallery-redesign agent | not handled here |
| #5 Secretary problem | `#lab/secretary`, `#gallery/secretary-gallery`: exact p(r), proof to 1/e in the text; the 25 Oct gaps remain (no n/e or 1/e mark on the threshold chart, no variant with recall or another payoff) | finish: chart marks, one playable variant |
| #6 German tank | `#lab/tank`: unbiased estimator, 95 % bound, histogram of repeated N̂; gaps remain (no Bayesian or other estimator, raw maximum distribution not drawn, history one sentence) | finish: second estimator, M distribution, sourced history |
| #7 Benford | `#lab/benford`: theory, scale invariance, presets; gaps remain (forensic context, fixed-price and fabricated-data presets, a representative real dataset) | finish with sourced context and a real dataset |
| #8 Poincaré and the baker | `#lab/baker`: statistics complete; anecdote not told, only source a Stack Exchange thread | needs a reliable source; tell only what is documented [VERIFY] |
| #12 Banach-Tarski | `#lab/banach-tarski-model`: "a choice principle", the axiom of choice never named or stated; dimension 3 condition and physics line partly present | small: name and state the axiom, dimension ≥ 3, physical matter line |
| #15 Mathematicians timeline | 56 people in `history-data.js` (30 thin entries removed); Riemann, Cantor, Gödel, Kovalevskaya, Wiles, Perelman absent; a staged 60-biography set sits in the private repository | owner decision on the staged private set, else add sourced records |
| #16 Advances timeline | Done on 1 Nov: 26 sourced events added (82 in all): Kepler, Fermat's note and Wiles, Basel, Goldbach, Wessel, Gauss 1799, Cauchy, non-Euclidean geometry, quaternions, Boole, Riemann, Dedekind, Cantor, Lindemann, prime number theorem, Hilbert, Lebesgue, Poincaré and Perelman, Zermelo, Gödel (1931, 1940), Kolmogorov, Cohen, Hales. No person added (#15), no image | done |
| #22 Taxonomy | Misplacements fixed on 1 Nov (explicit `PLACEMENTS` in `topic-registry.js`, whole-word rules, broad gallery group no longer matched, placement test in `tests/discovery.test.mjs`). Then the owner choices: field menu with a figure per field, difficulty filter (three bands), landing with fields first, six starters, then the full list (`styles/topics.css`) | done |
| #23 Javalab/Mathoutils audit | public credit and links removed, guard `tests/attribution.test.mjs`, audit `docs/future-work/h-provenance-audit.md`; live comparison impossible (sites unreachable) | report findings in an issue comment; owner names any copied wording |
| #24 Foundations locale | fixed on 28 Oct (`fd079963`): six lessons in FR and EN, iframe src, lang and title follow the site language, the switch reloads the lesson; verified in the browser on 1 Nov; new `tests/basics_browser.py` | close after owner check |
| #26 Malagasy T10, T11 S | courses (29 chapters, PDFs) and 29 decks on the site; exercise extraction belongs to the exercise agent; left: generators for T10 and T11 S, the books' figures in the decks, official syllabus check [VERIFY] | other parts after the exercise agent |
| #27 Prince Rupert | nothing on the site | new lab: pure projection model, cube witness 3√2/4, tests |
| #28 Against intuition (six puzzles) | nothing (π collisions, napkin ring, hundred boxes...) | new experiments, one at a time |
| #29 Guided investigation pattern | mission contract exists (`docs/LAB_DESIGN.md`); no documented pattern linking a curiosity to its investigation, proof and exercise | document the pattern, apply it to the new exhibits |
| #30 Cavalieri | nothing | new lab (hemisphere vs cylinder minus cone, napkin ring) |
| #31 Dandelin spheres | nothing | new 3D lab |
| #32 Eratosthenes | nothing (one Olympiad mention) | new lab, sourced history [VERIFY] numbers |
| #33 Viviani | nothing | new lab (area proof) |
| #34 Braess | nothing | new challenge or lab (65 vs 80 minutes) |
| #35 Polyhedra by transformation | only `#gallery/platonic` | truncation and duality lab |
| #36 Fractal collection | Mandelbrot/Julia, chaos game (Sierpiński), Barnsley in `content.js`; no Koch, Menger, Cantor or unified menu | collection with dimensions, reuse existing renderers |
| #37 Informative gallery entries | owned by the gallery-redesign agent | not handled here |

## Owner decisions, 2 November 2026
- T12 C/D (`docs/future-work/malagasy-t12-cd-audit.md`, section "Owner decisions"): the book is the owner's own work, published without the owner's name; borrowed exercises and the six type-D sujets left out; Bac C and D statements published with attribution, only real checked solutions; two courses `t12c` and `t12d`.
- #15 timeline of mathematicians: use the 60 staged biographies of the private repository, after checking sources and dates.

## Design pass, exercise bank online, gallery references (1 November 2026, evening, owner request)

Owner requests: fewer inner scroll boxes, no one-shot menus, use large screens, clickable topic previews, rework of
`#resources`, slides by curriculum first, a real exercise bank (not PDF links), many more starters and worksheet materials.
**Done (on `main`):**
- `#resources`: rail of curricula and levels (FR, MG, other pathways, classroom tools) beside the chapter grid; search spans
  every level; per-level quick links (worked exercises, slides, starters, worksheets); supplement PDFs as a compact list.
- `#slides[/<course>]`: same rail, deck cards (Present, HTML, errors / PDF, LaTeX), deck counts only (slide counts dropped).
- `#topics`: each preview links to its resource, hover lift and curve redraw (reduced motion respected).
- Inner scroll boxes removed: generator form (no sticky max-height), chapter chips, pack chapter list (now in columns), tables.
- `#bank[/<course>[/<chapter>]]` (Apprendre > Exercices, `site/js/bank-page.js`): worked exercises from `authored.js` and
  `problems.js` with hints (`hint` on a part) and folded corrections, renewable seeded problems, quick practice from the
  generators, level filter, show all, print with or without corrections. `site/js/exercises/bank-mada.js` is empty.
**Still to do, in this order:**
1. Bank content: every chapter of the five French classes needs at least six worked exercises (about 33 exist, many chapters
   have none) and four generators (one or two today); T10 and T11 S: extract the exercises and solutions of
   `content/tex/mada/` (about 550 exercises, 218 solutions) into `bank-mada.js`; same for STMG and maths expertes TeX.
   **Seconde done (2 November 2026, class 1 of 7, supervised one class at a time):** every chapter seconde-01 to 15 has at least
   six worked exercises shown in `#bank` (levels 1 to 3, hints, full corrections; 7 to 14 per chapter, shared synthesis problems
   counted in each chapter they list) and at least four generators (4 to 6). New files: `templates-seconde-2.js`, `-3.js` (49
   generators), `seconde-kit.js`, `authored-seconde.js` (23 fixed), `problems-seconde.js`, `problems-seconde-2.js` (59 seeded);
   hints added to the four older Seconde exercises; `s-prime-factors`, `s-expand`, `s-factor`, `s-percent` widened (ratchet
   49 to 42 small pairs, 363 pairs). `tests/exercise-bank.test.mjs` `FINISHED` checks the class. Bank page text now goes through
   `html()` (a `<` in maths, as in f(x)<g(x), was eaten as a tag). Counts per chapter (shown / generators): 01 8/5, 02 9/5,
   03 9/5, 04 10/4, 05 7/4, 06 9/4, 07 7/4, 08 14/6, 09 8/4, 10 9/4, 11 7/4, 12 9/4 (four primary), 13 8/4, 14 8/4, 15 7/4.
   Next class: Première spécialité (waiting for the coordinator).
2. Starters and worksheets: more generators per chapter (feeds both pages and the bank's quick practice).
   **Gallery step 1 done (2 November 2026): the unilluminable room** (`#gallery/mirrored-rooms`, `#lab/illumination`). Rebuilt
   on a shared canvas `site/js/illumination-view.js` and a pure light module `site/js/illumination-light.js` (worker
   `illumination-light-worker.js`): the lit floor is computed from beams between neighbouring rays (split breadth-first near
   corners), counted on a grid of reflection levels, and what no beam reaches is hatched and numbered (Penrose from the centre:
   four pockets of about 0.8 u², exact 0.8; L-room: shadow of exact area 10.5 with no reflection, gone after two). Night scene,
   direct and reflected light in two tones, rays from 1 to the device ceiling (slider and quick choices; beyond 1,440 the
   existing worker farm and density map), reflections slider, light shown reflection by reflection, rays travelling, unfolding.
   Editor: Walls tool (click on the 0.5 grid, click the first vertex to close, drag, click a wall to insert, double click to
   remove, Shift without snapping), Curve tool (Bezier diamonds), undo and redo, live validation with crossing walls in red, the
   lamp put inside on closing, "edit this room" copies a polygonal preset. Presets as thumbnails: Penrose, Tokarsky, Wolecki and
   three ordinary rooms (L-shaped, star, ellipse). Gallery page in the new exhibit layout (`site/styles/exhibit.css`, entry
   `layout: 'exhibit'`): chips above the stage, tools, hint and zoom over it, readout and legend under it, tabs Explorer,
   Dessiner, Comprendre, Défis (four challenges, two checked automatically). The earlier versions (commits 2e7745b9, ec83c556,
   branch ccr-f8cd81a4) were the same editor with 1 to 96 rays drawn one by one; what was better there (few clearly visible
   rays, travelling rays, unfolding) is kept; the 500,000-ray density mode is kept but no longer the main picture. Tests:
   `tests/illumination-light.test.mjs`, `tests/room_browser.py` (in `run_browser.py`); `device_scale_browser.py` unchanged and green.
   Not done: guided tour; Wolecki and Tokarsky drawn y-down (mirror of the papers' figures, same room); the light of curved custom
   rooms takes a few seconds on a slow device (shown as a rough preview meanwhile); the lab page keeps its select for the rays.
3. Gallery redesign after the owner's references https://missionmaths.fr/animations/mandelbrot.html and
   https://missionmaths.fr/decouvertes.html (ideas only, never their code or assets): stage first and large, with title,
   hints and zoom buttons over the canvas; a side panel with tabs (Explore, Understand, Challenges) instead of long text
   below; destination thumbnails (Mandelbrot: named places); a readout strip under the stage and a colour legend; linked
   secondary views (Julia set, orbit step by step with play and step); a guided tour that stops when the visitor acts;
   figurative scenes where they help (Monty Hall: real doors, goats and a car; play mode and a simulate mode with
   cumulative frequencies converging to 1/3 and 2/3); live charts beside simulations (Game of Life: population over time,
   births and deaths); headline stat chips in the stage header. Pilot on Mandelbrot, then a shared exhibit layout.
   Also: about 14 gallery cards have blank previews (Bayes, Benford, birthdays, doors, pendulums, Möbius...): give each a
   drawing in `home-art.js`.

## Local session on the owner's laptop (1 November 2026, afternoon): generators made classroom-ready, more slide canvases

Owner request: advance the practical work for the French classes (Seconde, Première, Terminale, maths expertes, STMG): fully working
automatismes, exercise and problem generators, and interactive slides wherever useful. Done on `main`:
- **LaTeX exports compiled for the first time** (pdflatex here): every generator at every level, every problem, starters and sheets in
  both versions. Fixed: the preamble now takes newpx (Palatino) when installed, else mathpazo (Fedora ships mathpazo.sty without its
  fonts: every export failed there); `s-inequation` wrote `\leqslantx`; marks no longer break across lines; automatismes in two
  columns (20 questions on one page). `tests/exercise-latex.test.mjs` (known LaTeX commands; compile when pdflatex exists).
- **Projection stage**: leaving full screen (Escape, F11, the button) left the overlay over the page; fixed in `ui.js` for every
  presenting target. `tests/generators_browser.py`: MathJax on all classes and sheet kinds, the stage, 390 px.
- **Variety**: no generator below 10 distinct questions (were 10); ratchet 49 and 0 (were 52 and 10).
- **Coverage**: new generators `s-two-way` (Seconde 11), `t-space-vectors`, `t-space-coplanar` (Terminale 02), `t-rv-sum`,
  `t-concentration` (Terminale 12); every chapter of the five classes has generators except the synthesis ones (Seconde 05, 13, 15,
  STMG 08, Première revision). Seven seeded problems, the first two for maths expertes (Markov chain, affine cipher).
- **Slides**: 22 more laboratory canvases (list in `docs/SLIDES.md`); premiere-06 and seconde-01 had none. Built with
  `MX_REUSE_FIGS=1` and `refresh --adopt` because TeX here cannot rebuild the figures (Palatino fonts missing): figures unchanged.

Still to do (next sessions):
1. Slides: done the same evening, widgets `twoway` and `signtable` (Seconde 08, 11, 14, STMG 04, 06). Most decks still have one to
   three canvases among 15 to 49 slides; the Terminale decks were not touched.
2. Owner review of the new generators and problems against the 2026 programmes (wording, levels) [VERIFY].
3. `tests/browser.py`: the overflow of `#errors/square-of-sum` at 320 px with doubled text is fixed (the bench grid column could not
   shrink), and the counts that had gone stale behind it are updated (42 experiments, 16 groups, 8 biographies, run buttons by device
   tier). It now stops at line 279: the `#pathways` assertions ('2027–2028', 'AI SL', 'Removed') describe the page before its
   redesign of 1 November; rewrite them against the new rail, then rerun (CI 'Website checks' stays red until then); `make check` runs `build-lecture-slides.py --check`, which compares with
   git-ignored build files and cannot pass on a fresh clone.
4. Malagasy curriculum (evening of 1 November): T10 and T11 S are on the site as courses (`#resources`, "Programme malgache"):
   29 chapters with student and teacher PDFs, 6 supplements, cut from the owner's Mada-Boky books by `scripts/build-mada.py`
   (details and the two source fixes to report upstream: `docs/CURRICULUM.md`). The owner approved publication of T11 S, whose
   own notes still called it a model-reviewed draft. Slide decks done the same evening (29 decks from
   `content/tex/mada/`, lab canvases at the end, lecture PDFs). Next: generators for T10 and T11 S; figures of the books in the decks.
5. Olympiad (evening of 1 November): new category `#olympiad` (Explorer > Olympiades), bilingual. Ten strategies seeded from the
   owner's COMIMa courses, rewritten in the site's spirit (a question to handle first, the idea, a solved example), 50 problems
   (5 per strategy, national to international level) with progressive hints and full solutions, three new figures (nearest
   neighbours, inscribed angle, rectangle and square) and links to 30 existing challenges and experiments. Problems are classical
   ones restated in our own words; COMIMa's verbatim third-party statements (Engel, Dujella) were not used. Every solution was
   checked by hand; the IMO 1986 semi-invariant numerically. Next: more problems per strategy, olympiad papers by level, review.
6. Private repository `Maths-explorer-backup` not reached from this laptop (no GitHub access at the time): nothing was read from its
   review queue.
7. Language: see the owner rule of 11 November 2026 (`PROJECT_BRIEF.md` section 3); no pending bilingual goal for curriculum lessons.

## Generators: automatismes, worksheets, exercise bank (1 November 2026, owner request)

**Done (on `main`):** two new pages under Apprendre, `#automatismes` (fluency starters) and `#sheets` (worksheets, quizzes, supervised tests), on a seeded exercise bank (`site/js/exercises/`, index in `site/CLAUDE.md` section Generators). Any text is a seed and the same seed gives the same series; arrows step to the previous or next series, so the supply is unlimited in practice.
- Bank: 69 generators (Seconde 15, Première 15, Terminale 16, Maths expertes 14, STMG 9) with three levels, each returning statement, answer and an `ok()` that recomputes the answer another way; 20 fixed written exercises with full corrections and 6 seeded problems (multi-part, numbers from the seed). Chapter ids and classes are those of `manifest.json`. Distinct questions per generator over 4,000 seeds: median about 1,400; the smallest spaces are the exact-value trigonometry topics (tens of variants, inherent to the topic). `tests/exercise-bank.test.mjs` fails below 20.
- Automatismes: class, chapters, topics, levels, number of questions, total time (seconds per question follow), progressive or mixed order, short questions only; projection stage on the page (timer, keys, full screen), print (students, answer key), LaTeX source, standalone projection page (`.html`, loads MathJax from cdnjs, so the room needs internet).
- Sheets: type (worksheet, interro, devoir), marking scheme optional (points scale exactly to the total, half points), subjects A and B, student and teacher versions, print and LaTeX source.
- Not done: no `pdflatex` in the cloud container, so the `.tex` files are tested for structure only, never compiled (compile one before relying on it: pdfLaTeX + mathpazo, `mdframed`, `needspace`); the generators have not been reviewed by the owner against the new 2026 programmes (chapter titles are the site's own; level labels are the assistant's) [VERIFY]; Malagasy T10/T11 and Olympiad classes have no generators yet; English editions: none (curricula are French only); a real-device screen-reader pass.
- Publication gate removed by the owner the same day (`PROJECT_BRIEF.md` section 2): nothing here was waiting for audits.
- Build note: `make site` needs `pip install pymupdf`; the 28 failing node tests of the earlier note were missing `jsdom` (`npm install` fixes it; 476 pass).

**Audit of the bank's variety (1 November 2026, `tests/exercise-audit.test.mjs`):** "unlimited in practice" holds for many generators but not for all. Over 5000 seeds, 52 of the 203 generator-and-level pairs give fewer than 100 distinct questions, 94 fewer than 500, and 10 fewer than 10: `t-counting/3` (3), `s-percent/3` (4), `p-trig-exact/1` (4), `m-cm/3` (4), `m-exp-evolution/2` (4) and `/3` (7), `t-trig-deriv/2` (6), `p-radians/1` (8), `e-modulus-arg/1` (8), `t-ln-deriv/2` (9). The existing test only demands 20 per generator summed over its levels. `p-quad-roots` level 1 has exactly 78 equations. The test keeps these counts from growing; widen a family (more parameters, other forms of the statement) and lower the bounds. The first, parallel version of seeded exercises is kept as `docs/future-work/seeded-exercises-first-slice.patch`; its single-file student/teacher TeX switch (one `\ifteacher` line) is the one idea not ported.

## Layout harmonisation and Pathways redesign (1 November 2026, owner request)

**Done (on `main`):**
- `#pathways` rebuilt (`site/js/pathways-view.js`, styles at the end of `pages.css`): curriculum rail (MG, FR, IB, SAT, university collections), level tabs (opens on the first level, "Tous les niveaux" one click away), topic chips from each experiment's `group`, tile grid; the choice of curriculum is kept for the session. Data in `content.js` `pathways` is unchanged.
- One container width: `--page-w` (1440px, `explorer.css`) for pages, sub-navigation, home, laboratory, history, pack. The errors activity keeps a 980px reading measure.
- `#topics`: results 24 at a time with "Afficher la suite" (page height 77,000 px to about 3,200 px); field counts no longer wrap. `#errors`: suggested route in columns.
- The 38 `gallery-*` modules moved to `site/js/gallery/` (`git mv`, names kept) with their own index `site/js/gallery/CLAUDE.md`; `tests/map.test.mjs` checks it. Imports between them use `./`, shared modules `../`.

**Still to do (design audit, owner goal: no endless scrolling, use large screens, guide the eye):**
1. Home (`welcome.js`) and the course list (`#resources`, `#library`, about 8,000 px tall): apply the rail, level and topic pattern; library list in a grid with "show more".
2. Gallery index (about 4,000 px): topic filter chips and a denser grid on wide screens; challenges (about 2,900 px) and laboratory index the same way.
3. Sub-navigation tabs sit 14 px right of the page text edge on wide screens; align the two.
4. Old `.pathway-*` and `.programme*` rules in `pages.css` are now unused; remove them after checking `tests` and the print rules.
5. Run `design:accessibility-review` (contrast of `--muted` text on tiles, focus order of the rail and tabs) and `design:design-critique` on each page above.
6. Further regrouping of `site/js/` (history, reading, errors, discovery families) is possible; do it only as one mechanical, test-verified commit like the gallery one.

**Known and not caused by this work:** 28 tests fail on `main` (`npm test`, mostly modules that need packages absent here); the GitHub "Website checks" workflow is red for the same reason. Build needs `pymupdf` (`pip install pymupdf`).

**Git:** in the cloud session the local branch `claude/friendly-bohr-syi5c6` could not be pushed (permission check); its content is all in `main`. The branch can be reset to `origin/main` or deleted.

## Workstreams G and H (31 October to 1 November 2026)

G: the four audited references are integrated, from the prototypes kept in `docs/future-work/`: the Monte Carlo experiments (`monte-carlo-pi`, `-lake`, `-integral`, `-walk`, Laboratoire group "Inférer et décider", listed in the French pathway's Terminale stage), the equidecomposition exhibit (Lire > Curiosités, `#gallery/equidecomposition`), the sets lesson (Apprendre > Bases, `#basics/sets`, French and English editions) and the Ferris wheel experiment (`#lab/ferris-wheel`, International pathway, English-only exercise rule; the owner confirmed on 31 October that it is an IB exercise). Placement and language: `docs/future-work/g-placement-20261031.md`. Two independent audits (different models, separate sessions) were run on the integrated code; the mathematics checked out; the audit findings were fixed except the ones listed below; the reports are in the private repository (`audits/`). **Fixed after the audits (1 November, owner instructions):** the equidecomposition pieces no longer overlap at the end of any step (each triangle is worked on in its own box, a test samples every step boundary); the lake select no longer shows "Drawn by hand" before a shape is drawn and an open stroke is refused; typed vertices accept a decimal point or a decimal comma; the topic browser no longer files calculus and modelling experiments under Arithmetic (the word "calcul" matched; 29 records re-filed); the Fourier circles never open on one circle (24 for Madagascar, 12 for the others) and no longer restart from one circle by themselves; long lists (gallery sidebar, timelines, strips) keep their scroll position when a neighbouring entry is opened and show the current entry (`site/js/scroll-memory.js`, `tests/ergonomics_browser.py`). **Owner decisions:** the French sets notation (Aᶜ, Card(A)) is correct as written; the unchecked facts (London Eye figures and links, historical dates and attributions, Ulam and von Neumann) are left as they are; the Ferris wheel exercise is the owner's own teaching exercise for an IB student, so originality against IB papers is not an open item. **Still open:** a screen-reader pass; the owner's review of the French wording.
**Lists and heavy modes (1 November 2026, owner requests):** (1) every collection (gallery, challenges, biographies, stories, errors) now has the same list beside the open entry (`site/js/entry-nav.js`: sticky column on wide screens, chip strip on phones) and keeps its scroll position and shows the current entry (`site/js/scroll-memory.js`); `tests/ergonomics_browser.py` fails if a collection has no list or the list resets, whatever its length (short window, 390 px). The laboratory and the history timelines have their own navigation and are not yet given this list. (2) Heavy modes only where the device proves it can: `site/js/device-capability.js` decides a tier (basic, standard, high, extreme) from blocking facts (data saver, low battery, phone, no worker, no float GPU buffer, fewer than 2 or 4 spare cores), a short benchmark of the real work and memory, cached per session. The mirrored rooms offer up to 500,000 rays and 2,000 reflections on an extreme device (Web Workers trace chunks, a float density map counts the crossings, a memory cap stops the trace and says so) and only 1,440 rays and 100 reflections on a basic one; Monte Carlo offers a very fast speed (up to 2 million trials per second) and up to 10 million trials on a capable device, 10,000 elsewhere. While the lamp is dragged the room is drawn with at most 3,000 rays. Also on the same tiers (1 November, second step): series of up to 5 million experiments (buttons "+ 10,000" to "+ 1,000,000", hidden elsewhere) for the probability, Buffon and Bertrand experiments (`site/js/lab/scale.js`, the shell measures the device once for an experiment that declares `scale`); finer solver tolerances (down to 1e-13) for the double pendulum and the three bodies; a huge drop at once for the Galton board (bars instead of balls beyond 1,500 per column) and more points per frame for the chaos game (never more than 8 ms of a frame). Not done: Fourier circles (the slider already reaches 150 and the outline has fewer samples), longer simulated times and ensembles of trajectories for the dynamics, higher-resolution redraw of the chaos game on zoom; the worker module imports are not version-stamped by the import map (a stale cache could pair old and new files). Tests: `device-capability.test.mjs`, `illumination-farm.test.mjs`, `device_scale_browser.py`.
H: no public credit remains; `tests/attribution.test.mjs` guards it; the two sites could not be reached, so originality is not claimed by comparison.

## Workstream E: error correction collection started (31 October 2026)

New page `#errors[/<id>]` (Explorer > Erreurs), goals 4 and 5 of `docs/IMPROVEMENT_GOALS.md`. Seven claim activities (square of a sum, root of a sum, reciprocal of a sum, cancelling a term, partial distribution, lost bracket in a subtraction, square of a negative) and one flawed derivation (1 = 2 by dividing by zero). Each: a false claim, sliders that give a computed counterexample, a diagnosis, and a repair choice that is accepted only if it holds on the whole domain grid. Data and checks in `site/js/errors-model.js` (add an error there, nothing else is needed for the page; tests check domains and links). Written from first principles; a supplied algebra-errors PDF only suggested common topics, none of its text or examples is reproduced.

Second batch (31 October 2026): the collection now has 26 claim activities and the 1 = 2 derivation across algebra, functions and inequalities, derivatives and integrals, logarithm, complex modulus, probability, trigonometry, geometry, notation and rounding (relations `<`, `>`, `<=`, `>=` and hypotheses supported). Each error appears back on the chapter pages it links to (a "Common errors in this chapter" block in Cours and Exercices, `#chapter/<id>/cours/errors`), in the slides index (link per deck) and in discovery search and topic pages (format "Erreur à corriger"). Coverage matrix: `docs/ERROR_COVERAGE.md`, generated by `scripts/error-coverage.mjs` from the activities and `content/data/error-coverage.json`; it shows 20 planned misconceptions with no activity (suites, statistiques, arithmétique and matrices, exponential, limits, vectors, discriminant and others). Curriculum placement of each error is [VERIFY — check Eduscol] and the `level` labels are the assistant's own.

Not done: the 20 planned misconceptions; links from individual lessons, exercises and slides (links are per chapter, not per idea or per slide; the slide player itself has none); links to laboratory experiments and challenges; accessibility pass with a real screen reader; owner review of the wording; the second language of curriculum chapters (the chapters keep their own language, the error pages are bilingual). Other Workstream E items (interactive slides for every lesson, Grand Oral, other misconception pathways) are unchanged and pending.

## Workstream F, milestone 2: four chapter destinations (31 October 2026)

The six numbered chapter stages are replaced by four direct destinations, none compulsory: `#chapter/<id>/cours` (default), `/manipuler`, `/exercices`, `/documents`. The old names `prepare`, `understand`, `experiment`, `practice` and `review` resolve as aliases (`chapterTab` in `site/js/chapter-sequence.js`); `/cours/<n>` and `/exercices/<n>` open at idea or exercise n, and `/review` at the chapter bilan. The numbered rail and the "next step" bar are gone; the chapter overview is a short optional "Par où commencer ?" line. Cours merges the former preparation (objectives, fluency, diagnostic folded) and the written lesson; Exercices merges practice and the review questions (a personal checklist is folded). Practice cards link to the exact idea (`lessonIndex` in `sequence-model.js`), not to a generic course page. Mathematics, labs and slide widgets are unchanged. New test `tests/chapter_destinations_browser.py` (run by `run_browser.py`); `accessibility_browser.py` covers the four destinations at 320, 390, 768 and 1440 px, both themes, doubled text.

Not done, and not claimed: milestone 3 (private coverage matrix, canonical structured chapter content, original exercises), milestone 4 (mixed revision), the quadratic pilot's completeness assessment against the matrix, usability tests with students and teachers, real-device screen-reader testing, phone performance check. Practice for chapters with no authored tasks still falls back to the verified reused examples.

## Malagasy T10 / T11 S sources imported (31 October 2026)

At the owner's request the original T10 (9 chapters plus activities and solutions) and T11 S (20 chapters plus assessments) maths sources have been committed under `content/malagasy/source/`. The chapter-to-source mapping is in `content/malagasy/chapters.json`; source transfer is **not** Maths-explorer chapter publication or course adaptation completion. Start with T10 logic, then T11 S functions, retaining the official programme, computational proof, dual independent AI audits, full PDF/slides build, browser and accessibility gates. See `docs/future-work/malagasy-t10-t11-source-adaptation.md` and active workstream D. The owner has confirmed sole authorship of T10 and T11. Other active workstreams are unchanged.

## Cross-workstream register and revised timeline direction, 31 October 2026

**Read [the active workstreams register](docs/ACTIVE_WORKSTREAMS.md) before accepting a task-specific handoff.** The private Première C01-C03 handoff tracks only that audit; it is **not** a replacement for the project's other pending work. A single-chunk agent must preserve unrelated pending tasks in its next handoff rather than silently dropping them.

**Mathematicians' timeline is a separate, active future-work stream.** The owner revised the editorial target on 31 October: include **all genuinely major mathematicians** with substantial, well-sourced dedicated biographies and links both ways between the biographies and the timeline; include other significant mathematicians in the timeline when meaningful shorter biography text is possible, without requiring a dedicated page; remove bare-name or incidental entries with no worthwhile biographical substance. Discoveries already listed in the **mathematical advances** timeline remain there with correct credit to their authors. The 46 prepared bilingual portraits are a **draft**, and the previous 39-person exclusion list is **not a final deletion order**. Expand beyond the original 85 where warranted; do not invent a fixed target count. Historical fact-check, independent review, accessible navigation, publication gate and actual site integration are still pending.

The prior 30 October editorial instructions below and in the draft are superseded where they impose fixed roster counts. **No timeline site content was updated in this documentation-only correction.**

## Foundations and practice corrections, 28 October 2026

Reviewed the 20 commits dated 28 October (UTC), covering foundations, standalone practice and publication checks. Foundations now prevent counters exceeding four-column capacity, support keyboard rotation/zoom/reset of the 3D camera, redraw when the site theme changes and cancel multiplication carries after a reset. Interval practice approvals are bound to the nine reviewed source statements; the Python precondition is retained, with regression checks against the French source table and program. Enlarged text and input labels now wrap within narrow screens. New interaction regressions cover both existing language editions. Private audit and computation evidence lives in `audits/basics-20261028/` and `verification/` of the private repository. Human/classroom acceptance remains pending.

## Homepage and catalogue redesign, 27 October 2026

Milestone 1 of `docs/REDESIGN_PROPOSAL_2026-10-27.md` is implemented: useful homepage search, six existing tools with task-oriented entrances, reading links, illustrated chapter cards, sans-serif headings and a compact phone menu. Search reuses the discovery index; illustrations reuse existing mathematical models. Existing routes and chapter documents are retained. Decorative interface animation has been removed; mathematical interactions remain. The six-stage chapter presentation is still present and is milestone 2.

The subsequent visual checkpoint follows the request for a more vibrant, lively and classy style: stable topic colours in artwork, a larger opening mathematical figure, blue headline emphasis, restrained card elevation and short curve tracing on hover/focus. Reduced-motion previews stay static; there are no looping decorative effects.

Challenge cards now keep a readable minimum width on phones and with enlarged text. Replacing challenge variation data also replaces its playback handlers, preventing discarded solution diagrams from responding to new controls; a regression test covers repeated remounts.

Release verification passes: `npm test`, `npm run check` and full `make check`, including the complete browser integration suite and slide smoke replay. Published source copies and generated site files match.

Desktop/phone layouts, both themes, 200% text, keyboard menu operation, search, course counts and representative downloads have automated checks. Real-device screen-reader testing and learner/teacher acceptance remain pending.

## French course quality, 27 October 2026

Première C07 and Terminale STMG C04 have completed two independent source and rendered-PDF reviews with exact computation checks. C07 corrections now explain the diameter interpretation and identify the singleton explicitly. STMG C04 has eight session-specific homework tasks with answers, completed proof and variation explanations, and the correct positive-domain graph for session 29. This is a bounded two-chapter review, not annual-course acceptance; human review remains pending. Private evidence is in `course-quality/batches/20261027-c07-stmg-c04/` in the existing private repository.

French builds can retain frozen English source baselines and rebuild one language independently. Existing English editions remain available.

Last updated: 25 October 2026. Everything an agent needs to start is in this file plus `PROJECT_BRIEF.md` (governing, wins on any conflict); `MAP.md` says which files a task needs. If you only have time for one thing, read brief section 2 (rules) and the task queue below.

## History atlas, 26 October 2026

The history routes now offer a visual time axis with lifetime bars, period navigation, scale choices and a reading view for phones, with the existing sourced people and advances. Forty locally hosted Wikimedia images retain their individual licences and attribution on the detail pages.

## Current checkpoint, 25 October 2026

- The integrated exploration release is published on GitHub Pages. It contains 37 guided laboratories, 38 challenges, 85 people and 56 advances in the history timelines, overlapping topic discovery, independent language editions and the quadratic pilot. See the 24 October section below for source boundaries.
- Continue on `main` in both repositories. The owner requests a progress report at each milestone and commits for each finished or independently resumable block. Keep unapplied course proposals and review evidence in the private repository, not in the public site.
- The correction block `089a844` includes 49 English wording corrections in Première chapters C02 and C05 through C10, coordinated French/English repairs to the fixed-margin table and closed-interval extrema instructions, and regenerated course/slide/lecture downloads. These are bounded corrections, not completion of the remaining legacy curriculum review. Other English proofreading streams have completed proposals or partial read logs, preserved in the private repository's latest course-quality handoff. A prepared translation table is not evidence that it was read.
- Browser readout assertions now wait safely for animation-frame updates (`e813148`), preserving exact numerical assertions and requiring an actual string before accepting a changed value. Required pipeline checks, local bilingual browser integration, the updated slide decks and the full publication privacy scan passed. Consult the latest Actions run and private execution handoff for authoritative deployment and CI status.
- GitHub issues #1 through #22 remain open. Their feature implementations are shipped; acceptance and closure must be reconciled against the issue requirements. In particular, the Gömböc exhibit explicitly uses a certified polyhedral analogue with numerical dynamics.
- Owner decisions, 25 October 2026 (later): language policy recorded in `PROJECT_BRIEF.md` section 3 (replaced by the owner rule of 11 November 2026: no bilingual standby, no reminder); the 17 French source findings repaired or triaged (private `verification/source-repairs-20261025/`); Gömböc exhibit physics and drawing fixed (issue #18 stays open until the owner reconciles issues); the Seconde/STMG cross-review is deferred to a lighter agent and issue reconciliation waits for the owner's go. The owner supplied the Malagasy programme documents (Seconde, Première, Terminale) in a personal folder reachable through the Google Drive connector; never write its link or identifiers anywhere.
- Next: resume the private proofreading/correction queue from its recorded hashes and unread IDs, then reconcile issue acceptance. Real-device screen-reader testing, owner design/classroom acceptance and unresolved official curriculum sources remain separate pending work.

Read `PROJECT_BRIEF.md` and `MAP.md` next, then `course-quality/EXECUTION_HANDOFF_20261025.md` and `course-quality/phase2-english-20261025-HANDOFF.md` in the private repository before applying a proposal. `docs/HANDOFF.md` contains historical build/migration notes; its old branch, hosting, toolchain and task-status statements do not supersede this checkpoint. Exact test/deployment results and commit references are recorded with each release in `docs/LOG.md` and the private evidence.

## What this project is

Static maths resource site, experiment-first (manipulate, conjecture, prove), for lycée and basic early-university. Per chapter: automatismes, activité d'introduction, notes de cours, exercices et problèmes, interactive slide. The owner is a maths teacher; he reviews slowly and always before class use. AI agents write and audit.

## Repository reference (17 October baseline, updated by the current checkpoint)

| Area | State |
|---|---|
| Governing brief | `PROJECT_BRIEF.md` v0.5. Decisions settled, only the items in "Open for the owner" below remain. |
| Design | Design v3 "Cahier" (reasoning and tokens in `docs/DESIGN_V3.md`). Source in `site/styles/explorer.css` and `pages.css`, `site/js/ui.js`, `site/js/icons.js`, fonts in `site/fonts/`; `dist/` holds the assembled copies. |
| Site and content | `site/` is the hand-written web source and `dist/` the committed, assembled folder (`make site`). The catalogue comes from `content/data/manifest.json` (`make catalog`). Bilingual PDFs are compiled from the shared TeX system in `content/tex/` (seven courses migrated, 58 slide decks in `dist/slides/`); details and next steps in `docs/HANDOFF.md`. |
| Tests | `npm test` (node tests), `npm run check` (syntax of every served script, `scripts/check-syntax.mjs`), `make check` (pipeline; the notation test needs TeX Live) and the browser suite (`npm run test:browser`) are the pre-push checks. Current results are in the latest entry of `docs/LOG.md`. |
| Skills | `.claude/skills/slides-interactive-math/` and `slides-interactive-3d-math/` with lint script; `.claude/skills/maths-explorer-tasks/` (step-by-step recipes for recurring tasks). Navigation: `MAP.md`. |
| Private area | Since 20 October 2026 the repository is public and `private/` (ledger, audits, verification, course quality) is no longer in it: it lives in the private repository ARHeritiana/Maths-explorer-backup (imported with its history the same day; paths below are relative to that repository), and `private/` is git-ignored here. Agents commit new audit notes and verification scripts there, on `main`. Human review remains false for every resource. |
| Launch | 20 October 2026: the repository was made public and the site launched on GitHub Pages (https://arheritiana.github.io/Maths-explorer/), deployed from `dist/` by `.github/workflows/pages.yml` (run 59, commit `b0bb88b`). Every push to `main` republishes it, so run `make site` before pushing. Launched before checklist item 1 below (two-agent audit, English proof-reading) was done. |
| Publication gate | Removed by the owner on 1 November 2026: no audit or verification is required before publication (`PROJECT_BRIEF.md` section 2). A successful build still does not establish a full curriculum content review. |
| Tooling | `node` 22, `python3`, Playwright Chromium at `/opt/pw-browsers`. TeX Live is not installed by default: see `docs/HANDOFF.md` for the apt packages. `pip install pymupdf playwright`; when the pip Playwright expects another browser build, set `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (adjust to the folder present). |

## Conventions added on 15 October 2026

- Git: commit and push to `main` only (rule of 15 October, replaced on 14 November by branch and pull request: see
  `CLAUDE.md`). Branches `claude/vigilant-darwin-ywur5s`,
  `claude/repository-audit-bsfs8y` and `ccr-80defba8-6udo9f` were compared with `main` on 15 October and judged superseded
  (older KaTeX redesign, and the earlier PDF-patching pipeline replaced by the TeX sources in `content/tex/`); they are
  to be deleted on GitHub together with the branches already merged into `main`.
- Challenges (one folder each since 18 October 2026: `site/js/challenges/<id>/`, conventions in
  `site/js/challenges/CLAUDE.md`) have two versions: the original question (strategy, algorithm, construction or proof;
  answered alone or with a teacher; `original` in the folder's `index.js`, shown under the statement) and the version the
  site can check (a number; `variant`). Every challenge needs both; a test enforces it. An original never states the
  answer or method.
- Art gallery: the learner explores random, convex and star-shaped galleries and can drag vertices; no preset is a worst
  case. The comb appears only in the animated solution, after the learner has asked for it.
- 25 horses: horses can be dragged to any free cell of the field (arrow keys too); positions do not affect speeds.

- Animated solutions: each challenge's `solution.js` holds a `diagram` (captions `steps`, frames `draw`) and usually a
  cartoon `scene` built from `challenges/common/scene-kit.js` (soldier), `common/scene-props.js` (daylight, egg,
  balance) and the challenge's own `art.js` (night bridge and lantern, snail, horse, chameleon, pigeon). Protocol:
  `mount(c, q)` builds the SVG once, `update(S, step, p, q)` poses it, so a frame is a pure function of (step, p);
  `dur(step, q)` sets the pace of each step; the captions stay in the `diagram`. The player (`common/player.js`) exposes
  `seek(step, p)` on `#solution-anim.__solution`, used to check frames in the browser.

- Challenge pages show the statement only. The canvas offers tools, never the method: any control that reveals a method or
  an answer (mirror image, optimal placement, 1, 2, 3 fill, invariant, differences, inversion counter, flattening the box)
  is a hint button in the hint panel (`hintActions` in the challenge's `index.js`; activities listen with `onHintAction`
  from `challenges/common/kit.js`). Hint 1 brings the learner closer, hint 2 nearly gives it away. The worked solution is a full-width
  section under the page.
- Cake and box are open sandboxes: `challenges/cake/activity.js` (3D view, top-view lock, points/segments/midpoint/
  intersection/circle, grid and snapping, disk split) with `maths.js` (pure) and `view-3d.js` (renderer; shared camera in
  `common/view-3d.js`); the same files in `challenges/box/`. When the learner's cuts or route are right, a short show
  plays; their animated solutions are 3D scenes (`common/scene-3d.js`). Other challenges use flat activities and
  cartoon scenes.

- Structure (15 October 2026): the home page (`#home`, default route, `site/js/welcome.js`) is neutral and carries no school
  level; the curriculum chooser stays under "Cours" (`#resources`) and "Parcours". The laboratory has nine guided
  experiments (all missions in `site/js/lab/`, rebuilt on 18 October 2026); the curiosities (Galton board, Reuleaux, Platonic solids, chaos game, Fourier circles,
  Mandelbrot) are in the gallery (`#gallery`, every lab with `custom: true`; `#lab/<custom id>` redirects). Live drawings for the
  home page and the gallery cards are in `home-art.js`. The Madagascar outline in `js/gallery/gallery-math.js` is 360 points traced (PIL and numpy, smoothed, resampled) from an outline image supplied by the
  owner; it is a drawing aid, not a survey.

- Structure (20 October 2026): three sections. "Apprendre" (cours, diaporamas, parcours), "Explorer" (laboratoire, défis),
  "Lire" (biographies `#biographies`, histoires `#stories`, curiosités `#gallery`). Texts in `site/js/reading-content.js`;
  a cross-link is written once in the `links` of a text or curiosity and shown back on the page it points to
  (`site/js/reading.js` `readAlso`). Square packings: only verified exact packings are drawn (n = 5, 10, grids); the
  records for 11, 17, 18, 19 are table values from Friedman's survey [VERIFY against the survey before extending].

## Rules you must not break (short form; brief section 2 is authoritative)

1. Anonymity: no name of the owner, employer, school or students in HTML, PDFs (text and XMP/metadata), `\author`, file names, alt text. Do not add any such detail to commit messages or docs either.
2. No links to Google Drive or any personal storage. Host copies inside the site.
3. No visible AI notice or review status anywhere published. Status lives only in `ledger.json` of `ARHeritiana/Maths-explorer-backup`.
4. Every PDF has its TeX source in `content/tex/` (see `docs/TEX_STYLE_GUIDE.md`). English units are generated from translation tables, never edited directly.
5. No accounts, no analytics.
6. Publication needs no audit or code verification (owner, 1 November 2026). `human_reviewed` may still be recorded in the ledger.
7. Never invent a source, bulletin number or programme requirement. Tag [VERIFY] or say you do not know.
8. Language (owner, 25 October 2026; brief section 3): French for French and Malagasy curricula, English for the international curriculum, the original language for university, Olympiad a category of its own, bilingual by default. Superseded on 11 November 2026: each lesson in its target language(s), university in its input language or bilingual, Olympiad, problems, galleries and extra-curricular activities bilingual; no bilingual goal for curriculum lessons and no reminder.
9. Slides: read both skills first; every canvas draggable; true 3D where the object is 3D; lint before committing.
10. Copy: no em or en dashes in site copy.

## Legacy scoped task queue (consult active register for parallel workstreams)

### 1. Clean-up of v1 (small, do first)
- [x] Remove the AI notice from the footer (done in the site code, 13 October 2026). Search again for other notices (`content-origin`, "IA", "AI-generated") in `docs/` and the PDFs.
- [x] Scan all current PDFs and web editions for identifying metadata (`pdfinfo`, `exiftool` or `qpdf`, plus XMP) and for names in text. Report findings in `audits/` of `ARHeritiana/Maths-explorer-backup`; strip metadata only if the file is regenerated or with a safe tool, then re-run `npm test`.
- [x] Allow French-only, English-only and bilingual resources through explicit edition declarations, independent metadata, download filtering and unavailable-edition errors. Existing English resources remain available.

### 2. Shared slide engine and pilot chapter
- [x] Build the shared engine from `.claude/skills/slides-interactive-math/references/engine-patterns.md` and the reference slide `assets/example_trinome.html` (the owner also supplied a determinant slide; ask for it if needed). Put it where `dist/` can load it; keep each slide a single self-contained HTML file at publish time if the skill requires it; keep the skills in step with the engine.
- [x] Pilot chapter: quadratic trinôme, Première spécialité (brief section 11). Sequence: automatismes, activité, notes de cours, exercices et problèmes with corrections, slide. Programme reference: BO n. 14 du 2 avril 2026, NOR MENE2602917A (verified against the official text for the pilot).
- [x] Run the pilot pipeline in brief section 8: LaTeX compile, SymPy verification script in `verification/` of `ARHeritiana/Maths-explorer-backup`, browser test of the slide (drag, sliders, steps, fullscreen, themes, 390 px), audit 1, audit 2 by a different agent, ledger record.
- [x] Use the result to correct the chapter template (brief section 4): `docs/CHAPTER_TEMPLATE.md`.
- [ ] Owner review of the pilot and chapter template before classroom acceptance.

### 3. Apply the v2 design to the site
- [x] Applied (13 October 2026) as design v3 "Cahier": chapter chooser with live preview, resume, two themes, full-screen figures, tab bar on phones. Hash routes kept.
- [x] Automated home and pilot chapter checks at 320, 390, 768 and 1440 px with normal and doubled text, contrast, keyboard navigation and semantic MathML (`tests/accessibility_browser.py`, also called by `tests/browser.py`).
- [ ] Still to do: screen-reader pass with a real device and owner design review.

### 3b. Laboratory v2 (owner request, 18 October 2026)
Contract: `docs/LAB_DESIGN.md`. One engine, seven templates, missions, lab references shared by lessons and slides.
- [x] Phase 1 (done 18 October 2026): engine, shell, `family` and `process` templates; quadratic, trig, derivative, integral, sequences. Code in `site/js/lab/` (index in its `CLAUDE.md`), tests `tests/lab-engine.test.mjs`, `tests/lab_browser.py`; deviations from the contract are listed in `docs/LAB_DESIGN.md` section 9. 
- [x] Phase 2 (done 18 October 2026): `chance`, `figure`, `data`, `transform`; probability, vectors, statistics, complex; old guided lab code removed (`#lab` lists nine experiments in six types of activity); deviations in `docs/LAB_DESIGN.md` section 10.
- [x] Phase 3 (done 18 October 2026): honest labelling (≈ and =) in all nine experiments, `type: 'lab'` slide widgets (player mode `slide`, export bundle), inline mount of the first lab reference on chapter pages, lab references refined to missions in the manifest, `tests/lab-links.test.mjs` and `tests/slides_lab_browser.py`; deviations in `docs/LAB_DESIGN.md` section 11. Slide widget types still on old code (no experiment covers them): `vec` (premiere-03, premiere-07: norm, orthogonality, dot product), `complex` modes alg and polar, `tree`, `rv`, `fn`, `line`, `ref`, `interval`, `pct`, `scatter`, `cobweb`, `limit`, `convex` and the 3D, matrix and Markov ones.
- [x] Phase 4 (done 19 October 2026): template `space` (true 3D, shared camera `site/js/camera3d.js`), experiments `line`, `exponential`, `cobweb`, `matrix`, `space-lines` (fourteen in seven groups), manifest links, slide widgets `line`, `fn` exp (stmg-02), `cobweb`, `matrix2`, `plane3d`, `line3d`, `lineplane` migrated and deleted (kept: `fn` for premiere-09, stmg-03, stmg-04, and the others listed in `docs/LAB_DESIGN.md` section 12); deviations in section 12.

- [x] Proof and geometric chance (owner request, 19 October 2026): experiments `tiles` (64 = 65 puzzle and Curry's triangle, group "a figure is not a proof"), `euler-primes`, `fermat`, `circle-regions` (group "a pattern is not a proof", one subsection each), `buffon`, `bertrand` (group "geometric probability", one subsection each); groups about an idea live in `SECTION_INFO` of `site/js/lab/registry.js` (an experiment's `section` and `sub`). Gallery: four colour map (`gallery-four-colour*.js`). Challenges: `cookies` (stars and bars), `jugs` (two jugs, Bézout). Lighter pages: lab index and experiment page (previous / next, list folded), two cards per row on phones for challenges and gallery, pathway programmes folded. Owner to check: the MacTutor links of the new history boxes (Cassini, Buffon, Bertrand, the four colour history topic) were written without network access [VERIFY].

- [x] Second batch (owner request, 19 October 2026): challenges `nails` (picture hanging; shortest windings found by exhaustive search, repeated in the tests), `fly` (two trains, animated statement and solution), `cheryl` (Cheryl's birthday, four date lists), `sumproduct` (Freudenthal; (4, 13) for x + y ≤ 65 to 300, none for 62). The tiles experiment now opens on the usual cheated drawing (corners moved onto the diagonal so the pieces seem to fit) and shows the true pieces only with "Drawing: True pieces".

### 3c. Second review of the owner's classes (UNFINISHED, owner priority, 25 October 2026)
The first review happened when the courses were written; each French unit needs one second independent review plus
code verification of computed results. Order: Première, Terminale, then Seconde, STMG, Maths expertes. Scope now: the
content planned for the first trimester only (up to the December holidays, 18 December 2026).
- [x] Première: C01 to C06 with corrections, EV1 (DS commun) papers and corrections, automatismes items available by
  18 December, diagnostic unit. Second review done 25 October 2026 (2 blocking and minor findings fixed; notes kept
  privately for the owner).
- [x] Terminale: C01 to C07, E1 to E4 (DS1, DS2, devoir commun, DS3). Second review done 25 October 2026.
- [x] Seconde: sequences 1 to 7 (s01 to s07) and automatismes sheets ch01 to ch04. Second review done 25 October 2026.
- [x] STMG c01 to c03 and Maths expertes C1, C6, C2, C7 (scope confirmed by the owner). Second review done 25 October
  2026; STMG needed real repairs (missing activity material, two wrong values, a false counterexample).
- [x] Re-check of the 157 slide and lecture records: 110 unchanged in content and re-bound, 47 changes reviewed
  independently with no finding (25 October 2026).
- [ ] Later trimesters: the remaining units of every course.
- [x] Reviewer notes of the first-trimester review applied (25 October 2026), except: textbook-exercise corrigés (statements
  may not be reproduced), and two open questions for the owner below.
- [ ] Programme checks [VERIFY] not settled: Newton's method and the Cartesian product in Première 2026, variance and
  écart type in Seconde 2026, decimal logarithm and geometric mean in STMG, "développement local" in Terminale C04. The
  official sites (education.gouv.fr, eduscol, académie sites) are blocked by this environment's network policy.
- [x] EV1 dated Saturday 14 November 2026: correct (owner, 25 October 2026: common DS are held on Saturdays or Wednesday
  afternoons).

### 4. Scale in priority order
Brief section 3: classes taught this year, then Malagasy T12 (S, OSE, L), Olympiad, rest of Malagasy, IB, university basics last. Each chapter goes through the same pipeline.
### 5. Candidate explorations (future work only; not published)
- [ ] **Mathematicians' timeline and biographies (revised 31 October 2026):** independent workstream B in [the active register](docs/ACTIVE_WORKSTREAMS.md). Expand the timeline to cover all well-supported major mathematicians with dedicated, substantial sourced biographies, plus other significant figures with meaningful shorter timeline entries; link dedicated biographies and timeline entries in both directions. Exclude empty/incidental entries without relocating them to other biography pages; keep existing mathematical discoveries in the separate advances timeline with their authors credited. Reassess the [46-profile working draft and former 39-person exclusion proposals](docs/future-work/mathematicians-timeline-expanded-profiles.md), not a final 46-only roster. Audit historical facts and omissions, verify independently, then integrate only through the publication gate. The served timeline has not been updated by this handoff correction.
- [ ] **Set Theory: interactive atlas of sets and operations.** Keep the self-contained English-language HTML prototype at [`docs/future-work/set-theory-interactive-atlas.html`](docs/future-work/set-theory-interactive-atlas.html) as a reference for a future Maths-explorer learning activity. It introduces 18 concepts including membership, subsets, empty and universal sets, union, intersection, difference, complement, symmetric difference, disjointness, cardinality, power sets and Cartesian products. Students can build finite sets in a fixed universe, explore operations with two- and three-set Venn diagrams, inspect regions, read definitions and worked examples, answer randomized multiple-choice questions, and shade regions for three-set expressions. An identities reference pairs Venn illustrations with membership truth tables. **Future-work reference only, not approved or published.** Before integration, independently audit mathematical definitions, examples and identities; review randomized question generation and edge cases; test touch, keyboard, screen readers, reduced motion and mobile layouts; determine the appropriate curriculum placement and language; and adapt navigation and interactions to Maths-explorer's experiment-first design. Do not add this reference to `site/`, `content/`, `dist/` or any public catalogue until the review and publication gate is satisfied.
- [ ] **The London Eye: interactive trigonometry exercise and worked solutions.** The self-contained English-language HTML reference is stored at [`docs/future-work/london-eye-interactive-exercise.html`](docs/future-work/london-eye-interactive-exercise.html). Adapted from a six-part Ferris wheel problem using published London Eye dimensions and an approximately 30-minute rotation, with clearly labelled idealized assumptions. It includes a manipulable wheel, synchronized height-time cosine graph, a horizontal dashed connector when the diagrams are side by side, and step-by-step answers about the model, height, threshold times, derivative and maximum rate of change. The exercise has no mark allocations. **Future-work reference only; not approved for publication.** Before integration, independently validate numerical results and sources, distinguish model assumptions from actual capsule motion, and adapt/check the curriculum language, accessibility, responsiveness and pedagogical presentation. Do not add this file to `site/`, `content/`, `dist/` or any served catalogue until the project's review and publication gate has been met.
- [ ] **Equidecomposability of polygons (Wallace-Bolyai-Gerwien theorem):** A standalone, English-language interactive reference is stored at [`docs/future-work/equidecomposability-of-polygons.html`](docs/future-work/equidecomposability-of-polygons.html). It offers preset and user-drawn polygons, gallery examples, and an eight-step animated polygon dissection through a common equal-area rectangle, with explanatory mathematical notes. **This is reference material, not an approved or published Maths-explorer resource.** Before integration, independently check the proof and construction, numerical geometry and custom-polygon edge cases, and any historical assertions or citations; adapt to the site's mathematical, interaction, language and accessibility conventions; test keyboard, touch and mobile use; satisfy all independent verification and publication requirements. Do not move or link this HTML into `site/`, `content/` or `dist/` until it is approved for publication.


- [ ] **Monte Carlo methods: random sampling, estimation and uncertainty.** Self-contained, bilingual (English/French) interactive prototype at [`docs/future-work/monte-carlo-lab.html`](docs/future-work/monte-carlo-lab.html). Four experiments illustrate the same principle in different settings: estimating π from a circle in a square; estimating the area of a user-drawn irregular lake; evaluating definite integrals (including a narrow peak that can defeat naive sampling); and estimating hitting probabilities in random walks with adjustable boundaries. Includes animated samples, controls, convergence graphs, comparisons to reference values, approximate uncertainty intervals, explanations and pseudocode. **Future-work reference only; not approved for publication.** Before integration, independently check all estimators, reference results, statistical intervals and edge cases; review accessibility (touch, keyboard, screen reader) and mobile performance; align curriculum placement, language and explanations with Maths-explorer; independently audit the artifact under the publication gate. Keep it outside `site/`, `content/`, `dist/` and all served catalogues until approved.

## Open for the owner (do not guess)

1. Malagasy programme documents: the owner supplies them per chapter.
2. Terminale STMG programme in force this year (not found on Eduscol in the 12 October check).
3. Whether maths expertes keeps the 2019 text beyond this year.
4. Owner review of the Cahier design.
5. (Settled 15 October 2026: content CC BY-NC-SA 4.0 in `LICENSE.md`, program code MIT in `LICENSE-CODE`.)
6. Language policy is implemented: curriculum language follows the brief, neutral content follows the selected language, and resources declare available editions independently. Paired TeX translation remains a workflow, not a mandatory publication pair.
7. English proofreading of curriculum lessons is not pending work (owner language rule of 11 November 2026: French curriculum lessons are French only). Alignment is not proofreading.
8. Owner, school and place names remain in the git history of the TeX branch; removing them needs a history rewrite and force-push.
9. Later: access control (codes or paywall) needs a server or paid platform.

## Launch checklist (site launched on 20 October 2026)

1. Still open after launch: proof-read the English (open point 7). Planned before launch, not yet done.
2. Licence: content is CC BY-NC-SA 4.0 (`LICENSE.md`, footer link); code is MIT (`LICENSE-CODE`).
3. Done on 20 October 2026: Settings, Pages, Source: GitHub Actions, then the "Deploy to GitHub Pages" workflow (run 59) succeeded.
4. The `.tex` sources, including correction files with marking schemes, are published by design (`dist/sources/`); the owner accepted this on 15 October.

## How to verify your work

```sh
npm run check && npm test
python3 -I .claude/skills/slides-interactive-math/scripts/lint_slide.py <slide.html>
make check FAST=1                           # pipeline checks (TeX needed for the notation test)
make tex COURSE=seconde                     # rebuild one course (TeX needed)
grep -rn "—\|–" <files you wrote>           # no em or en dashes in copy
```

For visual work: serve, screenshot desktop (1440) and phone (390) in all three themes, check no horizontal overflow, and test keyboard operation. Say what you did not test.

## Working conventions

- Commit small, with a clear message. Add the commit attribution trailer your harness requires.
- Do not edit `PROJECT_BRIEF.md` rules on your own; propose changes to the owner. You may update status lines, the task queue here, and the reference sections.
- When you finish a task, tick it above, add a dated one-line note to `docs/LOG.md`, and commit.
- Never rely on memory of a programme: cite the NOR or BO reference and tag [VERIFY] when unsure.

## Log

Moved to `docs/LOG.md` (read it only when you need the history of a feature).

## Gallery additions, 18 October 2026

- [x] Voronoi worlds, fastest slide, soap films, knots and continuous Einstein-tile family added to the gallery.
- Knots: closed-braid RI/II/III workbench, exact 16-step mirror certificate, Fox tricolouring and knot-table links.
- Physics: frictionless sliding with conservation of energy; soap film is explicitly a discretised height graph.
- Tile family: valid H7/H8 patch and explicit periodic endpoint/equilateral exceptions; not the curved Spectre.
- Independent checks: `tests/gallery-discovery.test.mjs`; input/lifecycle checks: `tests/gallery-discovery-dom.test.mjs`.
- Live visual QA is unavailable in this environment: supervised preview fails before startup with a proc mount error.

## Gallery spatial revision (18 October 2026)

- Slide race has per-track checkboxes; curve handles replace depth sliders.
- Soap films offer 14 selectable spatial wire frames, full-xyz constrained area relaxation and a distinct tetrahedral junction model.
- Knot explorer offers 44 entries through eight minimum crossings, shared 3D/projection geometry, projection-based Fox tricolourings and three continuous examples. The Reidemeister workbench is removed.
- Einstein tiles lazily extend the same nested H7/H8 hierarchy to fill the camera window without repeating a patch or changing its scale.
- All 11 gallery exhibits have mathematical and historical/practical reading paths. New pure-model regression tests are in `tests/gallery-spatial.test.mjs`.

## Fourier learning triangle, 19 October 2026

- [x] Two guided Fourier experiments (continuous signals and sampled contours), six French university lessons and eighteen corrected exercises.
- [x] Four XeLaTeX PDF editions, standalone LaTeX sources, web reading editions and dependency-driven asset hashes.
- [x] Reciprocal links between gallery, laboratory and university, derived from the shared catalogue; exact sample reconstruction and RMS labels corrected in the gallery.
- [x] Two independent audits and numerical verification. Audit records and browser-verification limits are in `audits/fourier/` of `ARHeritiana/Maths-explorer-backup`.

- Integration validation: merged Phase 4 without dropping its five experiments or shared camera; `make check FAST=1`, syntax checks, Fourier DOM and symbolic verification pass. Browser preview is blocked by the managed proc mount.

## Four-colour gallery editor, 19 October 2026

- [x] Nine menu choices: random, checkerboard, K4, odd/even wheels, even/odd sectors, disconnected-country K5 and blank custom map.
- [x] Direct straight-border splits (connected countries, maximum 30), undo, keyboard construction, painting and exact colouring checks.
- [x] Independent mathematics and UI audits, geometry and bilingual DOM tests; records in `audits/four-colour-editor/` of `ARHeritiana/Maths-explorer-backup`. Browser visual verification is unavailable because the managed preview cannot mount proc.

## Direct canvas interactions, 19 October 2026

- [x] All challenge parameter choice lists use compact selects in folded settings; fly and jugs also accept validated custom values.
- [x] Jug actions use the objects, tap and sink directly (drag or tap sequence, plus keyboard); undo and restart remain available.
- [x] Fly scene supports tap play/pause, horizontal time scrubbing and keyboard; analytic collision positioning handles very fast flies without finite-leg extrapolation. Default fast example and classic example remain editable.
- [x] Knot overpass cues use camera-depth ordering on the actual spatial curve. Shared SVG navigation no longer remounts detached figures.
- [x] Independent maths and interaction audits, model/DOM checks and make check FAST=1 pass. Managed local visual preview remains unavailable (proc mount); browser workflow includes real captured taps, parameter edits and desktop/mobile screenshots.

## Knot preview rendering, 19 October 2026

- [x] Replaced faceted tubes and local overpass patches with the preview’s simple solid strand and depth-ordered crossing gaps. The card and explorer share `js/gallery/gallery-knot-render.js`; rotation, catalogue, deformations and projection colouring remain available.

## Interaction surfaces, 19 October 2026

- [x] Fermat and Euler use native MathML expressions, values and prime factors without a drawing, canvas controls or touch interception.
- [x] Identical cookies can be dragged or tapped to distinct children, transferred, or returned to the tray; keyboard allocation and count-only sharing records are retained.
- [x] Mission text has no nested scrolling viewport, height limit or scroll containment.
- [x] Buffon and Bertrand have continuous animated drop/draw controls and speed from 1 to 60 samples per second; only finished trials enter the tally. Changing parameters or missions pauses the run; reduced motion uses an explicit one-sample action and stops active motion when enabled. Counts include all trials; only the last samples remain drawn.

## Challenge interaction corrections, 20 October 2026

- [x] Fly distance stays in solution; fly touches train fronts. Peg jumps animate with the actual motion preference. Nails accept direct string strokes with ordered ray crossings, common base connectors and collision rejection; buttons are folded. Automatic star/lune/square totals and premature optimal-value disclosures are hidden or removed. Two independent audits and callback-based DOM regressions recorded privately.

## Integrated exploration and publication pipeline, 24 October 2026

- The laboratory registers 37 guided experiments, with shared models for their gallery and reading entry points. New topics cover mirrored rooms, dynamical systems, inference, fair division and topology; the gallery also has a certified polyhedral analogue of the Gömböc with disclosed numerical dynamics.
- The challenge registry contains 38 problems, including knight tours, room-door traversals and exact factorial valuations.
- Topic discovery uses overlapping topic/subtopic metadata, canonical routes, content-derived counts and filters. The history timelines contain 85 people and 56 dated advances, separating life dates from documentary dates.
- The quadratic pilot aligns its diagnostics, activity, course, exercises, corrections and shared interactive model. Its chapter template is in `docs/CHAPTER_TEMPLATE.md`; design and classroom acceptance remain with the owner.
- PDF/privacy checks cover extracted text, document metadata, links and annotations. Text encoded only in pictures or outlined lettering needs separate visual review.
- Real-device screen-reader testing, owner design/pilot review and the remaining curriculum proofreading/review queue are still open. Preserve those limits in the private evidence.

## Exercise bank expansion, 3 November 2026

- Added 24 original French exam-style problems (84 questions): eight EAM, eight E3C, eight Bac spécialité. Shared records in `site/js/exercises/authored-exams.js` feed the existing online bank, worksheet composer, printing and LaTeX exports.
- Based on six inspected APMEP papers from 2021, 2025 and 2026; new scenarios and coefficients, hints and full worked solutions. Existing bank entries are preserved.
- French curriculum content remains French only.

- 3 November 2026: all 24 exam-style problems now list observable target skills, distinct from prerequisites; the online bank, printed sheets and LaTeX editions share those lists.

## Internal prerequisites, 3 November 2026

- Added an advisory prerequisite audit integrated with the existing bank registry, chapter catalogue, generated samples, authored French decks, French chapter sources, make check and CI. Design/authoring instructions: `docs/PREREQUISITES.md`.
- Initial profiles cover the five French priority courses; all 24 new exam problems have explicit per-question contracts. Legacy content remains visibly unannotated and is scanned heuristically, without being certified.
- Supports concept dependencies, chapter/unit order with sequence identity, local definitions and earlier-question results, reasoned mentions/extensions, stale source declarations and internal JSON/Markdown reports. Default diagnostics do not add a publication gate or student-facing audit labels.
-; retained English curriculum editions are not scanned or modified.

- Current display instruction, 3 November 2026: keep target-skill metadata internal for now; do not display competency lists or exam-type labels on bank cards, printed sheets or LaTeX editions. The prerequisite diagnostics remain internal and advisory.

## Self-hosted Bac, EAM and E3C bank (5 November 2026)

The GitHub Pages bank at #bank/annales contains 829 individual exercises (429 Bac, 120 EAM, 280 E3C), with 821 proposed source corrections. The eight unavailable corrections are labelled. Chapter bank pages include source-tagged matches; untagged exercises stay in the complete catalogue. Question hierarchy, maths, original diagrams and boxed answers are retained in local HTML/SVG, with folded corrections, filters, permalinks and printing. Six native-frame PDF books and complete LaTeX bundles are generated locally.

Source and attribution: APMEP / CoopMaths, CC BY-SA, separate from the general site licence. Canonical metadata is manifest.annalsBank; imported source fragments are content/tex/annals/*.tex. See docs/ANNALS.md for producers and dependencies.
