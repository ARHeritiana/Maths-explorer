# Handoff

## French course quality, 27 October 2026

Première C07 and Terminale STMG C04 have completed two independent source and rendered-PDF reviews with exact computation checks. C07 corrections now explain the diameter interpretation and identify the singleton explicitly. STMG C04 has eight session-specific homework tasks with answers, completed proof and variation explanations, and the correct positive-domain graph for session 29. This is a bounded two-chapter review, not annual-course acceptance; human review remains pending. Private evidence is in `course-quality/batches/20261027-c07-stmg-c04/` in the existing private repository.

French builds can retain frozen English source baselines and rebuild one language independently. Existing English editions remain available; the bilingual lesson goal remains on standby.

Last updated: 25 October 2026. Everything an agent needs to start is in this file plus `PROJECT_BRIEF.md` (governing, wins on any conflict); `MAP.md` says which files a task needs. If you only have time for one thing, read brief section 2 (rules) and the task queue below.

## History atlas, 26 October 2026

The history routes now offer a visual time axis with lifetime bars, period navigation, scale choices and a reading view for phones, with the existing sourced people and advances. Forty locally hosted Wikimedia images retain their individual licences and attribution on the detail pages. The bilingual goal for curriculum lessons remains on standby.

## Current checkpoint, 25 October 2026

- The integrated exploration release is published on GitHub Pages. It contains 37 guided laboratories, 38 challenges, 85 people and 56 advances in the history timelines, overlapping topic discovery, independent language editions and the quadratic pilot. See the 24 October section below for source boundaries.
- Continue on `main` in both repositories. The owner requests a progress report at each milestone and commits for each finished or independently resumable block. Keep unapplied course proposals and review evidence in the private repository, not in the public site.
- The correction block `089a844` includes 49 English wording corrections in Première chapters C02 and C05 through C10, coordinated French/English repairs to the fixed-margin table and closed-interval extrema instructions, and regenerated course/slide/lecture downloads. These are bounded corrections, not completion of the remaining legacy curriculum review. Other English proofreading streams have completed proposals or partial read logs, preserved in the private repository's latest course-quality handoff. A prepared translation table is not evidence that it was read.
- Browser readout assertions now wait safely for animation-frame updates (`e813148`), preserving exact numerical assertions and requiring an actual string before accepting a changed value. Required pipeline checks, local bilingual browser integration, the updated slide decks and the full publication privacy scan passed. Consult the latest Actions run and private execution handoff for authoritative deployment and CI status.
- GitHub issues #1 through #22 remain open. Their feature implementations are shipped; acceptance and closure must be reconciled against the issue requirements. In particular, the Gömböc exhibit explicitly uses a certified polyhedral analogue with numerical dynamics.
- Owner decisions, 25 October 2026 (later): language policy and bilingual standby recorded in `PROJECT_BRIEF.md` section 3 (remind the owner of the standby in every site map or report); the 17 French source findings repaired or triaged (private `verification/source-repairs-20261025/`); Gömböc exhibit physics and drawing fixed (issue #18 stays open until the owner reconciles issues); the Seconde/STMG cross-review is deferred to a lighter agent and issue reconciliation waits for the owner's go. The owner supplied the Malagasy programme documents (Seconde, Première, Terminale) in a personal folder reachable through the Google Drive connector; never write its link or identifiers anywhere.
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
| Publication gate | Current artifact reviews and verification evidence are tracked in the private ledger. Historical conversion audits have a limited scope; a successful build does not establish a full curriculum content review. Rebuilt artifacts require matching review evidence. |
| Tooling | `node` 22, `python3`, Playwright Chromium at `/opt/pw-browsers`. TeX Live is not installed by default: see `docs/HANDOFF.md` for the apt packages. `pip install pymupdf playwright`; when the pip Playwright expects another browser build, set `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (adjust to the folder present). |

## Conventions added on 15 October 2026

- Git: commit and push to `main` only (see `CLAUDE.md`, `AGENTS.md`). Branches `claude/vigilant-darwin-ywur5s`,
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
  home page and the gallery cards are in `home-art.js`. The Madagascar outline in `gallery-math.js` is 360 points traced (PIL and numpy, smoothed, resampled) from an outline image supplied by the
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
6. Publish only after two independent AI audits (different agents) with no open finding, plus code verification of every computed result. Record `human_reviewed` in the ledger.
7. Never invent a source, bulletin number or programme requirement. Tag [VERIFY] or say you do not know.
8. Language (owner, 25 October 2026; brief section 3): French for French and Malagasy curricula, English for the international curriculum, the original language for university, Olympiad a category of its own, bilingual by default. The bilingual goal for lessons is on standby; remind the owner of it in every site map or report.
9. Slides: read both skills first; every canvas draggable; true 3D where the object is 3D; lint before committing.
10. Copy: no em or en dashes in site copy.

## Task queue (do in order; tick here when done)

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

## Open for the owner (do not guess)

1. Malagasy programme documents: the owner supplies them per chapter.
2. Terminale STMG programme in force this year (not found on Eduscol in the 12 October check).
3. Whether maths expertes keeps the 2019 text beyond this year.
4. Owner review of the Cahier design.
5. (Settled 15 October 2026: content CC BY-NC-SA 4.0 in `LICENSE.md`, program code MIT in `LICENSE-CODE`.)
6. Language policy is implemented: curriculum language follows the brief, neutral content follows the selected language, and resources declare available editions independently. Paired TeX translation remains a workflow, not a mandatory publication pair.
7. English proofreading of curriculum lessons is on standby (owner, 25 October 2026). Exact segment coverage and remaining scope stay recorded privately for when it resumes. Alignment is not proofreading.
8. Owner, school and place names remain in the git history of the TeX branch; removing them needs a history rewrite and force-push.
9. Later: access control (codes or paywall) needs a server or paid platform.

## Launch checklist (site launched on 20 October 2026)

1. Still open after launch: run the two-agent audit and ledger record for what is published (publication gate), and proof-read the English (open point 7). Planned before launch, not yet done.
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

- [x] Replaced faceted tubes and local overpass patches with the preview’s simple solid strand and depth-ordered crossing gaps. The card and explorer share `gallery-knot-render.js`; rotation, catalogue, deformations and projection colouring remain available.

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
