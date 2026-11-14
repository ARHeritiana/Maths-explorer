# site/: module index

Hand-written web source. `make site` copies it into `dist/` (this file excepted) and rewrites the import maps in
`index.html` and `slides/player.html`. Never edit `dist/`. Plain ES modules, no bundler, no framework. Every user-visible
string is a pair `[French, English]` or `pair(fr, en)` / `t(fr, en)`. No em or en dashes in copy.

Pick the row of your feature and open only its files. One-line descriptions are the first comment of each file.

## Shell (every page)

| File | Holds |
|---|---|
| `index.html` | page skeleton, theme bootstrap, generated import map (do not edit the map) |
| `js/app.js` | router and page shell: `route()`, `link()`, `header()` (nav), `footer()`, `render()` (route validity and dispatch), `bindCommon()`; experiment pages mount `js/lab/` (`render()` dispatch, `mountExperiment`); the gallery page of one exhibit (`galleryDetail`, `bindGallery`), challenge and pathway pages |
| `js/pathways-view.js` | `#pathways` page: curriculum rail, level tabs, topic filters and tile grid (`pathwayPage`, `bindPathways`); data stays in `js/content.js` `pathways` |
| `js/navigation-state.js` | one validated, device-local class preference shared across home, courses, practice, slides and classroom generators |
| `js/teacher-state.js` | device-local teacher state (`mx-teacher-*`): entry choice, chapter beside the class, recent items, favorites, automatismes settings, export/import/clear, in-memory fallback with `storageStatus()`; no UI, no network |
| `js/seance-model.js` | pure séance model (no DOM, no storage): phases with default minutes, blocks, add/remove/move/minutes/print, totals against 55 min, `cleanSeance`; stored through `teacher-state.js` key `mx-teacher-seance` |
| `js/config.js` | site-wide configuration constants: the Mikajy Spark download link, and the Mikajy Atlas link left empty (the full build writes it from `MX_ATLAS_URL`, `build/mxbuild/site.py`; shown only when set), read by the home and app |
| `js/classroom-context.js` | the device's class and chapter offered to other pages: recents on open (`recentFor`, `noteOpen`), the "your class chapter" strip on lessons and exercises, remembered one-click automatismes defaults (`autoDefaults`); never a hidden filter, storage-safe |
| `js/modes.js` | pure: the three modes (preparer, classe, detente) with labels and home hashes, `modeOfRoute(page,remembered)`, `showModeBar({entry,page,full})`; the bar is drawn by `header()` in `app.js`, styles in `styles/teacher.css` |
| `js/prepare-page.js` | `#prepare` (Préparer), loaded on demand: class and chapter selects, chapter sheet by phase (launchpad) with errors to expect (`errorsFor`), search over the shared index, the "Ma séance" builder (saved at once through `teacher-state.js`), Évaluer links; prerequisites not shown (no cheap source) |
| `js/prepare-model.js` | pure (no DOM): phase default from item type, block from item or phase, totals wording and print list, live-link filter |
| `js/relax-page.js` | `#relax` (Détente), loaded on demand with its data: five pages of the day, Surprends-moi draw, collections |
| `js/relax-model.js` | pure (no DOM): `pageOfTheDay` (seeded by date), `randomPage`, teaser from existing text, pools, live filter, collections |
| `js/review-page.js` | `#review` (Réviser), loaded on demand by `app.js`: today's session (show answer, grade 1 to 4, keyboard), choice of chapters and objectives, progress, export, import, erase; contract `docs/REVIEW.md` |
| `js/review-model.js` | pure (no DOM, storage or clock): spaced-repetition rule (SM-2, four grades, integers), day numbers, enrolment, daily order and cap, stats, export and import with merge |
| `js/review-state.js` | device storage of Réviser (`mx-review-v1`), memory fallback, damaged data set aside, event `mx-review-change` |
| `styles/review.css` | styles of `#review` |
| `js/offline.js` | registers `sw.js`, offline badge, "new version" notice with Recharger, "not available offline" notice, `?offline=off` kill switch; contract `docs/OFFLINE.md` |
| `sw.js` | the service worker: verified shell precache, runtime cache of opened content, update on request; its manifest line is written by `build/mxbuild/offline.py` |
| `js/teacher-entry.js` | eager and tiny: the three audiences of a device (`AUDIENCES`: visitor, student, teacher; visitor by default), `effectiveEntry`, `landingHash`, `homeHash` and the `data-set-entry` switch (`installEntrySwitch`); see docs/AUDIENCE_MODES.md |
| `js/launchpad-model.js` | pure (no DOM): the one resolution of a class and chapter to bank, slides, lesson and laboratory targets (`resolveTargets`), `launchpad({course,chapter,decks,view})` (the seven phases of `seance-model.js` with href or reason, detail and print flag; `view` 'tableau' swaps automatismes and cours for their non-projector targets) and `resolveForSeance` (resolver for `defaultSeance`) |
| `js/dock-model.js` | pure (no DOM): `dockItems({course,chapter,decks,seance,currentHash})` (the seven launch pad phases as dock items with active and disabled reason, prev and next from the saved séance or the phases) and `showDock({mode,entry,page})` (remembered mode classe, mode bar shown, tool page) |
| `js/dock.js` | the in-class dock, loaded on demand by `app.js` `syncDock` only for a device in mode classe: slim bottom bar on tool pages, collapsible (tools key `dockCollapsed`), hidden in every full-screen projection; styles in `styles/teacher.css` |
| `js/teacher-dashboard.js` | `#teacher` En classe launch pad, loaded on demand by `app.js`: class and chapter override, Projecteur / Tableau seul switch (tools key `view`, changes only the tile targets, no board scripts), one tile per phase (4 + 3), "Ma séance" one-row strip and standard-séance proposal, `quickActions` (reuses `launchpad-model.js`); folded at the bottom: recents and favorites, and device settings (automatismes defaults, start page, export, import, clear of teacher state); storage banner; no search box (the header has it) |
| `js/resource-index.js` | pure: the one search index over live resources (stable ids `type:key`, honest actions Ouvrir/Projeter/Manipuler/Imprimer, projectable/printable flags), accent/case/plural folding, FR/EN synonyms, ranking, filters (class, topic, type, projection, print), and the shared topic/relationship registry `RELATIONS` (`rel.*` ids) behind `relatedTo` (options `types`, `excludeTypes`, `excludeSameChapter`, `otherClassChapters`, `excludeHrefs`, `perType`; defaults unchanged) and the page helpers `routeBase`, `itemForRoute`, `relatedForPage`. Individual worked exercises (`exercise` type, label `Exercice corrigé`; the per-chapter `exercises` type is labelled `Exercices du chapitre`) rank fully only through their own title, never enter a relation-only match, are never siblings or related of other items, and relate to their chapter, the chapter's exercises, slides and experiments |
| `js/related-box.js` | the "Ressources liées" box of chapter, gallery exhibit and laboratory pages: `fillRelatedBox` (fed by `relatedForPage` of `resource-index.js`, so by the shared `RELATIONS` registry; no slides, no deck fetch), `relatedBoxHtml`, `shownHrefs` (nothing already linked on the page is repeated; nothing related renders nothing). Loaded by `app.js` `mountRelated` with a dynamic `import()` only when the placeholder at the end of the page nears the viewport; styles `.related-box` in `styles/pages.css` |
| `js/resource-sources.js` | wiring of the real data (discovery index, chapters, decks, bank, one `exercise:<id>` item per worked exercise through `js/exercises/bank-select.js` over the bank page's own live chapters, annales) through `isLiveHash` into `buildResourceIndex`; decks come from the caller (no index, no slide claimed) |
| `js/resource-search.js` | the search UI (`mountResourceSearch`) used by `#search` and the teacher dashboard, favorites and recents through `teacher-state.js`; styles in `styles/teacher.css` |
| `js/page-ergonomics.js` | native disclosures group classroom chapter choices, advanced settings and secondary exports without replacing controls |
| `js/ui.js` | theme choice, full-screen presenting |
| `js/icons.js` | Phosphor icon paths, `icon(name, size)` |
| `js/motion.js` | interface motion (`installInterfaceMotion`, `celebrate`, `illuminateFeedback`) |
| `js/visible-loop.js` | the one animation loop for figures (`animationLoop`, used by `object-kit.js` `loopFor`, the exhibit kit and the mirrored room): no frames offscreen, in a hidden tab or under reduced motion; a frame returning `false` sleeps until an interaction |
| `js/device-capability.js` | what this device can afford: facts that forbid (data saver, battery, phone, no worker, no float GPU buffer), a short benchmark of the real work, memory; returns a tier (`basic` to `extreme`) with ceilings (rays, bounces, segments, trials per second); cached per session; the heavy exhibits offer choices up to the ceilings and nothing above |
| `js/illumination-farm.js`, `js/illumination-worker.js` | mirrored rooms at scale: `traceChunk` (pure), a farm of Web Workers (or inline slices) that streams chunks of segments, with a segment cap and cancellation |
| `js/entry-nav.js` | `withEntryNav`: compact previous/next navigation and a folded complete chooser for galleries, challenges, biographies, stories and errors |
| `js/scroll-memory.js` | scrollable lists (gallery sidebar, timelines, strips) keep their scroll position across the rebuild of a page of the same kind, and the current entry is scrolled into view of its list |
| `js/control-policy.js` | selectors with one choice become labels |
| `js/resource-editions.js` | exact language edition selection, available language labels and complete pack checks |
| `js/content-language.js` | language of each route (neutral pages vs curriculum pages) |
| `js/live-curriculum.js` | shared live visibility policy: French courses, filtered catalogues, route and discovery scope; complete data is retained |
| `js/data-loader.js` | `assetHref` (versioned URLs), `fetchJSON` |
| `js/catalogue-data.js` | GENERATED from `content/data/manifest.json`: courses, university, asset versions |
| `js/canvas-navigation.js` | camera (zoom, pan, reset) shared with the slide player |
| `js/camera3d.js` | the one orthographic 3D camera (project, unproject, view ray, constraints, turn), used by the laboratory template `space` and by `slides/widgets-3d.js` |
| `styles/explorer.css` | design tokens (both themes), base elements, layout |
| `styles/pages.css` | page and component styles, challenge card colours and animations |
| `styles/timeline-standalone.css` | standalone mathematicians timeline: shared site chrome, Jour/Nuit tokens, readable portrait lanes and mobile scrolling |
| `styles/topics.css` | the topics browser (`#topics`): field menu with figures, landing tiles and the "where to start" selection (issue #22); cards stay in `pages.css` |
| `styles/exhibit.css` | the gallery exhibit layout (stage first with chips, tools, hint and zoom over the canvas, readout and legend, tabbed side panel), first used by the mirrored rooms; entries with `layout: 'exhibit'` get the full workbench width |
| `styles/ergonomics.css` | compact catalogues, grouped secondary tools, collection navigation and responsive layouts, using the existing visual tokens |
| `styles/teacher.css` | the Espace professeur dashboard (Cahier tokens only) |
| `styles/home.css` | compact class-to-chapter homepage, one quiet interactive figure and grouped secondary entrances |

## Content data

| File | Holds |
|---|---|
| `js/content.js` | `labs` (the fourteen experiments are catalogue lines from `js/lab/registry.js`; `custom: true` ones are gallery objects), `challengeBase` / `challenges` (text, topic, hints), `pathways` |
| `js/learning-content.js` | companion lessons on chapter pages (`guides`) |
| `js/study-guides.js` | short starting sheets (built into HTML by `scripts/build-study-guides.mjs`) |

## Error correction

| File | Holds |
|---|---|
| `js/errors-data.js` | the records: `ERRORS` (false claims with repairs, 27 with the derivation), `DERIVATIONS`, `ROUTE`, `FAMILIES`; each has `topics` (discovery) and `links` (chapters) |
| `js/errors-model.js` | pure: relations, grid with hypotheses, counterexamples, repair checks, faulty step of a derivation, `errorsFor(hash)` (reverse links); nothing is stored |
| `js/errors.js` | the page `#errors[/<id>]`: index with suggested route, test bench with sliders, diagnosis, repair choice; finished ids kept on the device only |

## Laboratory and gallery

| File | Holds |
|---|---|
| `js/lab/` | **the laboratory**: engine, shell, mount (modes `full`, `inline`, `slide`), registry (`resolveRef`), format, templates, models and one file per experiment (quadratic, trig, sequences, derivative, integral, probability, vectors, statistics, complex, line, exponential, cobweb, matrix, space-lines, fourier, tiles, euler-primes, fermat, circle-regions, buffon, bertrand); index in `js/lab/CLAUDE.md`. Also mounted by chapter pages (`chapter-sequence.js`) and by slides (`slides/widgets.js` `type: 'lab'`) |
| `js/gallery/` | **the gallery** ("Lire > Curiosités"): one `gallery-*` module per exhibit with its pure model; index in `js/gallery/CLAUDE.md` |
| `js/knot-catalogue.js` | 44 verified spatial curves (KnotInfo coordinates) used by the knot exhibit (`js/gallery/gallery-knots.js`) |
| `js/math.js` | pure maths shared by the labs (quadratic, sequences, binomial, statistics, Riemann...) |
| `js/lab-objects.js` | `mountObject`: the gallery exhibits (Galton, Reuleaux, Platonic, chaos game and more; pure maths first, then DOM) |
| `js/fractal-gl.js` | WebGL2 renderer of the Mandelbrot and Julia views: smooth escape time at device resolution, perturbation around a double-precision reference orbit (deep zooms without glitches), 2x2 supersampling at rest; the CPU path of `js/gallery/gallery-objects.js` is the fallback |
| `js/illumination-light.js`, `js/illumination-light-worker.js` | the lit floor of the mirrored rooms, pure: beams between neighbouring rays that meet the same walls (split breadth-first near corners within a budget), the grid of reflection levels (`rasterLevels`, `lightMap`), lit share and dark patches (`coverage`), wall crossings and helpers of the room editor; the worker computes `lightMap` off the page |
| `js/illumination-view.js` | the mirrored room on a canvas, shared by the gallery exhibit and the laboratory template: night scene, direct and reflected light, hatched numbered dark patches, rays (density map beyond 1,440), lamp, editor (grid snap, add, insert, drag, delete, close, curved walls, undo), zoom, keyboard |
| `js/illumination-gl.js` | GPU maps of the mirrored rooms: the float density map of very many rays (`createDensityMap`), and the older additive light map (`createLightMap`, now unused); `illumination-model.js` `trace` is the allocation-free tracer (`traceReference` is the checked original) |
| `js/knotinfo-license.txt` | MIT licence for KnotInfo coordinate assets |
| `js/platonic-explorer.js`, `js/platonic-fold.js` | Platonic solids and their folding nets |
| `js/object-kit.js` | canvas sizing, `palette()` from CSS tokens, sliders, loop |
| `js/mandelbrot-preview.js` | fixed screen-resolution, antialiased GPU card preview; blended repeating zoom, reduced-motion and CPU still fallback |
| `js/home-art.js` | live drawings of the home page and the gallery cards |
| `js/welcome.js` | class-to-chapter homepage, remembered class, chapter search, fixed interactive figure, and gallery index (the "Curiosités" tab of "Lire") |
| `js/home-slides.js` | retained five-scene slideshow component; the home now mounts one fixed figure through welcome.js |
| `js/figure-engine.js` | canvas engine of those figures: free handles, spring easing, pan, Ctrl-wheel and pinch zoom, soft magnet, keyboard; `readouts` |
| `js/figure-scenes.js` | the five scenes (parabola, unit circle, secant to tangent, left Riemann sum, logistic cobweb), pure and tested; `SLIDES` texts in both languages |

## Generators (automatismes, worksheets, tests; the exercise bank)

Seeded and limitless: any text is a seed, the same seed gives the same series. French content (curricula), UI in both languages. Exports: print (browser), LaTeX source (pdfLaTeX, Palatino through newpx or else mathpazo; compiled by `tests/exercise-latex.test.mjs` when pdflatex is installed), standalone projection page.

| File | Holds |
|---|---|
| `js/automatismes.js` | `#automatismes` page: class, chapters, topics, levels, number, total time, order, seed; projection stage (timer, keys, full screen), print, `.tex`, projection `.html` |
| `js/worksheets.js` | `#sheets` page: worksheet, quiz (interro) or supervised test (devoir); marking scheme, subjects A and B, student and teacher versions |
| `js/exercises/engine.js` | seeded random numbers, exact fractions, LaTeX helpers (`polyTex`, `numTex`, `sqrtTex`...) |
| `js/exercises/competencies.js` | the competency of every generator (`COMPETENCY_OF`, main first), `coverage`; pure data, imported by `bank.js`; table and rules in `docs/AUTOMATISMES_COMPETENCES.md` |
| `js/exercises/starter-visual.js` | twenty illustrated starters (vectors, lines, parabolas, scatter plot with its fitted line, graph of f′ or f″, complex plane) for Seconde, Première, Terminale, Maths expertes and STMG: the figure is data, drawn as SVG (`starterFigureHtml`: page, print, projection file) and TikZ (`starterFigureTex`); starters only (`bank.js` adds them to the starter pool, about 30 % of a series when the filters allow, never to `TEMPLATES`); competencies in `competencies.js` |
| `js/exercises/templates-competences.js` | ten short generators for the weakest competency cells (représenter, modéliser, raisonner), each with its own class |
| `js/exercises/templates-<class>.js` | the generators of `seconde`, `premiere`, `terminale`, `expertes`, `stmg`: `make(r, level)` returns statement, answer and `ok()` that recomputes the answer another way; chapter ids are those of `manifest.json` |
| `js/exercises/templates-premiere-2.js`, `-3.js`, `-4.js`, `premiere-kit.js`, `problems-premiere.js` | the second Première bank (chapters 01 to 10, at least eight generators each): four-choice questions with one typical error per wrong option (`mcq`), true/false (`tf`), find-the-error (`spot`), tables of variations, contexts, level-3 exam-style items, ten seeded problems; registered in `bank.js` (`robust` redraws the rare four-choice question with two identical wrong options) |
| `js/exercises/templates-terminale-2.js`, `-3.js`, `-4.js`, `-5.js`, `terminale-kit.js`, `problems-terminale.js` | the second Terminale bank (chapters 01 to 14, at least eight generators each): four-choice questions with one typical error per wrong option, true/false, find-the-error, tables with limits, contexts, level-3 exam-style items, fourteen seeded problems; `tidy` and `tidyProblems` remove ugly typography (`\dfrac{n}{1}`, `\mathrm{e}^{1}`, `-1x`) |
| `js/exercises/templates-seconde-4.js` to `-8.js`, `seconde-kit-2.js`, `problems-seconde-3.js` | the third Seconde bank (all fifteen chapters, at least eight generators each): four-choice (`qcmNum` of `seconde-kit-2.js` on top of `mcq`), true/false, find-the-error, contexts and multi-step items, with statistics, interval and enumeration helpers; five more seeded problems |
| `js/exercises/templates-stmg-2.js`, `-3.js`, `-4.js`, `stmg-kit.js`, `problems-stmg.js` | the second STMG bank (chapters 01 to 08, at least seven generators each): suites, exponentielles, logarithme décimal, fonction inverse, ajustement affine, probabilités conditionnelles, loi binomiale, révisions (indices, TVA, taux moyen); money, percent, rounding and binomial helpers in `stmg-kit.js`; six seeded problems |
| `js/exercises/templates-expertes-2.js` to `-5.js`, `expertes-kit.js`, `problems-expertes.js` | the second Maths expertes bank (chapters 01 to 11, at least seven generators each): complex numbers (algebraic, geometric, exponential), polynomial equations, geometry, congruences, Bézout and Gauss, Fermat, matrices, graphs, Markov chains; complex, matrix, number-theory and graph helpers in `expertes-kit.js`; six seeded problems |
| `js/exercises/authored.js` | fixed multi-part exercises with a full correction (`ok()` checks the quoted numbers) |
| `js/exercises/problems.js` | the same kind of problem, with numbers drawn from the seed |
| `js/bank-page.js` | `#bank[/<course>[/<chapter>[/<exercise id>]]]`: the online exercise bank (a fourth segment = one worked exercise the chapter page shows: scrolled into view and its heading focused after render, never hidden by a level filter; an id the page does not show is "Page introuvable"; `bindBank` needs nothing from the search index) (rail of levels, chapter index, worked exercises with hints and folded corrections, renewable seeded problems, quick practice from the generators, print with or without corrections) |
| `js/exercises/bank-select.js` | pure, no DOM: `exercisesOf(chapter)` (the one rule of which worked exercises the bank page shows under a chapter: a seeded twin replaces its fixed twin of the same title), `shownExercises(chapterIds)`, `LEVEL` labels; imported by `bank-page.js` and `resource-sources.js` so page and search index cannot disagree |
| `js/exercises/bank-mada.js` | exercises of the Malagasy books (T10, T11 S) for the online bank, same shape as `authored.js` |
| `js/exercises/bank.js` | registry, `instance`, `buildStarter`, `buildSheet`, marking scheme (`scalePoints`) |
| `js/exercises/export.js` | HTML, LaTeX and projection-page builders (one source string serves all three) |
| `js/exercises/ui-kit.js` | form chips, settings kept on the device, MathJax loading, download, print, `stepSeed` |
| `styles/generator.css` | forms, projection stage, paper preview and print rules |

To add a generator: write `make` in the class file, give it a manifest chapter, a domain and an `ok()`; `tests/exercise-bank.test.mjs` then checks it (answers, formatting, variety of at least 20 questions).

## Olympiad ("Explorer > Olympiades")

| File | Holds |
|---|---|
| `js/olympiad-content.js` | the ten strategies (bilingual): the question, the idea, a solved example, five problems per strategy (national, Pan-African, international level) with hints and solutions, links to experiments and challenges; seeded from the owner's COMIMa courses, rewritten, problems restated |
| `js/olympiad.js` | `#olympiad` (index) and `#olympiad/<id>` (one strategy): page markup, inline figure or laboratory experiment, MathJax typesetting |
| `js/olympiad-widgets.js` | three figures with pure models: nearest neighbours (extremal principle), the inscribed angle, rectangle and square of the same perimeter |

## Reading ("Lire": biographies, stories; the curiosities are the gallery)

| File | Holds |
|---|---|
| `js/reading-content.js` | biographies and stories (bilingual), each with `links` and `sources` |
| `js/biographies-major.js` | the biographies of the leading mathematicians of the people timeline (issue #15), generated from the staged private set and checked against MacTutor; `reading-content.js` adds them to `BIOGRAPHIES`, `history-data.js` `BIOGRAPHY_PEOPLE` links both ways |
| `js/reading.js` | `#biographies`, `#stories` pages; `readAlso(hash, own, t)`: the cross-link box shown on texts, curiosities and challenges (own links plus pages linking here) |

## Challenges (`js/challenges/`, one folder per challenge; index in `js/challenges/CLAUDE.md`)

| File | Holds |
|---|---|
| `js/challenges/registry.js` | the list of challenge folders (card order) and the lookups used by `app.js` and `content.js` |
| `js/challenges/<id>/` | everything about one challenge: `index.js`, `maths.js`, `activity.js`, `solution.js` (+ `view-3d.js`, `art.js`) |
| `js/challenges/common/` | shared kit, helpers, emblem frame, solution player, cartoon and 3D kits |

## Courses and resources

| File | Holds |
|---|---|
| `js/resource-library.js` | `#resources` course chooser, `chapterPage`, `bindChapter` |
| `js/chapter-sequence.js`, `js/sequence-model.js` | chapter page tabs and progression built from the chapter deck; the tab "Chercher" shows the chapter's lab references (`labBlock`: first one mounted inline, lazily, destroyed on navigation, a link per reference) |
| `js/visual-lessons.js` | animated companion diagrams |
| `js/library.js` | `#library` filterable resource list; chapter detail with the "Open in the laboratory" links |
| `js/pack-builder.js` | `#pack` custom pack builder, `#sources` LaTeX sources |
| `js/slides-page.js` | `#slides` deck index (HTML and lecture PDF editions) |
| `js/university.js`, `js/university-model.js` | `#university` pages and pathway summaries |
| `js/quadratic-workshop.js` | `#workshop/quadratic` five-stage workshop |
| `resources/document-theme.css` | style of generated HTML resource pages |
| `js/basics-page.js` | `#basics` as data: `BASICS_GROUPS` (groups of lessons), derived numbers and previous/next, `basicsPage` (grouped index and lesson page), `bindBasics` (theme and height of the iframe), `discoveryLessons` (lessons placed in the topic browser). `js/app.js` only imports it; add a lesson here |
| `resources/basics/logic-lesson.css`, `resources/basics/logic-lesson.js` | Shared look and engine of the four logic lessons: tokens, tabs, truth tables, Venn diagram of two propositions (`LX.venn2`), guided-challenge runner (`LX.quiz`, `LX.choice`), height message |
| `resources/basics/logic-propositions.html`, `.en.html` | Logic 1: propositions, connectives, truth tables, Venn link with sets. Same code in both editions, only the `TEXT-BEGIN`/`TEXT-END` table, title and `lang` differ (`tests/logic-lessons.test.mjs`) |
| `resources/basics/logic-implication.html`, `.en.html` | Logic 2: implication, converse, contrapositive, equivalence, necessary and sufficient conditions |
| `resources/basics/logic-quantifiers.html`, `.en.html` | Logic 3: quantifiers over an editable universe, two quantifiers, negation checked against all universes, counterexample game |
| `resources/basics/logic-reasoning.html`, `.en.html` | Logic 4: direct proof, contrapositive, counterexample, cases, contradiction, induction (proofs to assemble, dominoes) |
| `resources/basics/place-value.html` | Self-contained first foundation: regrouping and place-value activity; embedded by `js/app.js` |
| `resources/basics/place-value.en.html` | English interactive foundation edition, with local typography and iframe resizing |
| `resources/basics/addition.html` | Second foundation: place-value addition and animated carries in bases 2 to 16; embedded by `js/app.js` |
| `resources/basics/addition.en.html` | English interactive foundation edition, with local typography and iframe resizing |
| `resources/basics/subtraction.html` | Third foundation: subtraction with borrowing across empty columns, written subtraction, bases 2 to 16; embedded by `js/app.js` |
| `resources/basics/subtraction.en.html` | English interactive foundation edition, with local typography and iframe resizing |
| `resources/basics/fractions.html`, `resources/basics/fractions.en.html` | Seventh foundation, French and English: eight fraction activities, guided challenges, shared Cahier tokens and host theme/height synchronisation. Identical engine scripts outside the `TEXT-BEGIN`/`TEXT-END` language table, guarded by `tests/fractions.test.mjs`; edit logic in both |
| `resources/basics/sets.html` | Sixth foundation, French: sets and operations (Venn diagrams, 18 concepts, quizzes, shading practice, 15 laws); inclusion is written ⊂; embedded by `js/app.js` |
| `resources/basics/sets.en.html` | English edition of the sets lesson. The two files share all code; only the `TEXT-BEGIN`/`TEXT-END` table, the title and `lang` differ (`tests/sets-language.test.mjs` enforces it): edit the logic in both |

## Slide player (`slides/`; any change here rebuilds every deck export)

| File | Holds |
|---|---|
| `slides/player.html`, `slides/player.css`, `slides/player.js` | standalone player (1280x720 stage, steps, toolbar); the import map also lists `../js/lab/**`, `math.js`, `object-kit.js`; `player.css` carries the `.lab2-*` styles of a lab widget |
| `slides/edition-policy.js` | explicit available deck editions; curriculum default language, supported direct language requests and unavailable-edition handling |
| `slides/widgets.js` | widget registry `mount`, drawing and readout helpers; `type: 'lab'` (`mountLab`: loads `js/lab/mount.js` on demand, dark palette `LAB_PALETTE`, `uniHTML` turns the experiment's Unicode into MathJax markup) |
| `slides/widgets-2d.js`, `slides/widgets-3d.js` | 2D widgets; true 3D widgets |

## Third party

`vendor/` (MathJax, JSZip, pdf-lib; see `vendor/README.md`), `fonts/` (with licences). Do not read.


Fourier: `js/fourier-model.js` (pure signals and error), `js/fourier-links.js` (catalogue-derived triangle).

Discovery: `js/topic-registry.js` is the shared overlapping topic/subtopic registry; `js/discovery-index.js` assembles canonical records, counts, filtering and reciprocal recommendations; `js/discovery.js` renders the topic browser; `js/discovery-previews.js` supplies bounded, static illustrations of the actual named models, shared coordinates and exact topic metadata.

History: `js/history-data.js` holds sourced people and advances; `js/history.js` renders the timeline and detail routes, with `styles/history.css`; `js/history-layout.js` owns period scales and collision-free lanes; `js/history-images.js` holds image sources and licence metadata for the local WebP copies in `data/history/`; `js/reading-history-content.js` supplies the linked Galois biography.

Inference: `js/inference-content.js` shares assumptions, formal arguments and citations among six laboratories, `js/gallery/gallery-inference.js` mounts those same experiments from gallery cards; styles in `styles/inference.css`.

`js/illumination-model.js`: analytic specular reflection on segments, ellipse arcs and quadratic Bezier curves, polygon validation and unfolding. `js/illumination-presets.js`: documented Penrose, Tokarsky and Wolecki coordinate reconstructions, and three ordinary rooms (L-shaped, star, ellipse).

`js/illumination-content.js`: catalogue and sourced lesson for mirrored rooms; the gallery entry mounts `js/gallery/gallery-room.js`.

The Gömböc, two smooth exact bodies: the body of Várkonyi and Domokos 2006 (`js/gomboc-body.js`: pure, radial law R = 1 + d·ΔR, mass properties by quadrature, exact contact, `PAPER` model, previews) and a visibly shaped body found by optimisation (`js/gomboc-support.js`: pure, convex body from its support function, exact contact, mass properties by the divergence theorem; coefficients in `js/gomboc-support-data.js`, GENERATED by `scripts/optimise-gomboc.py`). `js/gomboc-rolling.js` (pure: rolling without slipping on either model, RK4, energy and diagnostics), `js/gomboc-gl.js` (WebGL2 drawing, radial or explicit mesh; the page has a CPU fallback), `js/gallery/gallery-gomboc.js` (the page: body switch, free orbit with `cam3TurnFree`, tip and push, map of the body, readouts) and `js/gomboc-content.js` (gallery and reading text).

Fair division: `js/fair-division-content.js` holds gallery and formal reading entry points; `js/gallery/gallery-fair-division.js` mounts the same cake and goods laboratories.
Topology: `js/topology-content.js` holds tangent fields, surfaces and Banach-Tarski reading/gallery entry points; `js/gallery/gallery-topology.js` reuses the guided laboratories.

`js/dynamics-content.js` shares original sourced pendulum, three-body and logistic explanations across reading and gallery. `js/gallery/gallery-dynamics.js` mounts those same laboratory simulations in gallery entries.

## Mathematical history portrait timeline

| `resources/history/mathematicians-timeline.html` | Standalone 236-profile, bilingual portrait timeline opened from `#history/people`; shared site navigation and tokens from `styles/explorer.css`, `styles/pages.css` and `styles/timeline-standalone.css`; scrollable, touch-size portrait lanes and biography links. |

`js/exercises/authored-exams.js`: 24 original multi-part problems; target skills (`skills`) remain internal metadata. Do not render competency lists or exam-type labels in the bank, printed sheets or LaTeX exports for now.

`js/annals-bank.js`: self-hosted Bac/EAM/E3C exercises, topic/year filters, lazy statement and solution loading, local LaTeX and print exports; shared by the bank catalogue and chapter pages.
