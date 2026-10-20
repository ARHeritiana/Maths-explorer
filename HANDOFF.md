# Handoff

Last updated: 18 October 2026. Everything an agent needs to start is in this file plus `PROJECT_BRIEF.md` (governing, wins on any conflict); `MAP.md` says which files a task needs. If you only have time for one thing, read brief section 2 (rules) and the task queue below.

## What this project is

Static maths resource site, experiment-first (manipulate, conjecture, prove), for lycée and basic early-university. Per chapter: automatismes, activité d'introduction, notes de cours, exercices et problèmes, interactive slide. The owner is a maths teacher; he reviews slowly and always before class use. AI agents write and audit.

## State of the repository (verified 17 October 2026)

| Area | State |
|---|---|
| Governing brief | `PROJECT_BRIEF.md` v0.5. Decisions settled, only the items in "Open for the owner" below remain. |
| Design | Design v3 "Cahier" (reasoning and tokens in `docs/DESIGN_V3.md`). Source in `site/styles/explorer.css` and `pages.css`, `site/js/ui.js`, `site/js/icons.js`, fonts in `site/fonts/`; `dist/` holds the assembled copies. |
| Site and content | `site/` is the hand-written web source and `dist/` the committed, assembled folder (`make site`). The catalogue comes from `content/data/manifest.json` (`make catalog`). Bilingual PDFs are compiled from the shared TeX system in `content/tex/` (seven courses migrated, 58 slide decks in `dist/slides/`); details and next steps in `docs/HANDOFF.md`. |
| Tests | `npm test` (node tests), `npm run check` (syntax of every served script, `scripts/check-syntax.mjs`), `make check` (pipeline; the notation test needs TeX Live) and the browser suite (`npm run test:browser`) are the pre-push checks. Current results are in the latest entry of `docs/LOG.md`. |
| Skills | `.claude/skills/slides-interactive-math/` and `slides-interactive-3d-math/` with lint script; `.claude/skills/maths-explorer-tasks/` (step-by-step recipes for recurring tasks). Navigation: `MAP.md`. |
| Private area | Since 20 October 2026 the repository is public and `private/` (ledger, audits, verification, course quality) is no longer in it: it lives in the private repository ARHeritiana/Maths-explorer-backup (imported with its history the same day; paths below are relative to that repository), and `private/` is git-ignored here. Agents commit new audit notes and verification scripts there, on `main`. Human review remains false for every resource. |
| Publication gate | No chapter has been through the two-agent audit recorded in `ledger.json` of `ARHeritiana/Maths-explorer-backup` yet. The TeX migration was verified by the pipeline checks, not by the gate. Maths expertes was published on 17 October 2026 on the owner's explicit instruction before its two audits (ledger record `expertes-course`). |
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

## Rules you must not break (short form; brief section 2 is authoritative)

1. Anonymity: no name of the owner, employer, school or students in HTML, PDFs (text and XMP/metadata), `\author`, file names, alt text. Do not add any such detail to commit messages or docs either.
2. No links to Google Drive or any personal storage. Host copies inside the site.
3. No visible AI notice or review status anywhere published. Status lives only in `ledger.json` of `ARHeritiana/Maths-explorer-backup`.
4. Every PDF has its TeX source in `content/tex/` (see `docs/TEX_STYLE_GUIDE.md`). English units are generated from translation tables, never edited directly.
5. No accounts, no analytics.
6. Publish only after two independent AI audits (different agents) with no open finding, plus code verification of every computed result. Record `human_reviewed` in the ledger.
7. Never invent a source, bulletin number or programme requirement. Tag [VERIFY] or say you do not know.
8. Language: French for French and Malagasy curricula, English for IB, bilingual for Olympiad.
9. Slides: read both skills first; every canvas draggable; true 3D where the object is 3D; lint before committing.
10. Copy: no em or en dashes in site copy.

## Task queue (do in order; tick here when done)

### 1. Clean-up of v1 (small, do first)
- [x] Remove the AI notice from the footer (done in the site code, 13 October 2026). Search again for other notices (`content-origin`, "IA", "AI-generated") in `docs/` and the PDFs.
- [ ] Scan all 672 PDFs and web editions for identifying metadata (`pdfinfo`, `exiftool` or `qpdf`, plus XMP) and for names in text. Report findings in `audits/` of `ARHeritiana/Maths-explorer-backup`; strip metadata only if the file is regenerated or with a safe tool, then re-run `npm test`.
- [ ] Allow French-only and English-only resources in the library model (currently every resource is a FR/EN pair, `[French, English]` fields). Keep tests and CI green.

### 2. Shared slide engine and pilot chapter
- [ ] Build the shared engine from `.claude/skills/slides-interactive-math/references/engine-patterns.md` and the reference slide `assets/example_trinome.html` (the owner also supplied a determinant slide; ask for it if needed). Put it where `dist/` can load it; keep each slide a single self-contained HTML file at publish time if the skill requires it; keep the skills in step with the engine.
- [ ] Pilot chapter: quadratic trinôme, Première spécialité (brief section 11). Sequence: automatismes, activité, notes de cours, exercices et problèmes with corrections, slide. Programme reference: BO n. 14 du 2 avril 2026, NOR MENE2602917A [VERIFY details against the text before citing].
- [ ] Run the pipeline in brief section 8: LaTeX compile, SymPy verification script in `verification/` of `ARHeritiana/Maths-explorer-backup`, browser test of the slide (drag, sliders, steps, fullscreen, themes, 390 px), audit 1, audit 2 by a different agent, ledger record.
- [ ] Use the result to correct the chapter template (brief section 4) and ask the owner to review.

### 3. Apply the v2 design to the site
- [x] Applied (13 October 2026) as design v3 "Cahier": chapter chooser with live preview, resume, two themes, full-screen figures, tab bar on phones. Hash routes kept.
- [ ] Still to do: screen-reader pass with a real device, 200% zoom check on the home page and chapter pages (`tests/browser.py` covers labs, challenges and pathways only), and owner review.

### 3b. Laboratory v2 (owner request, 18 October 2026)
Contract: `docs/LAB_DESIGN.md`. One engine, seven templates, missions, lab references shared by lessons and slides.
- [x] Phase 1 (done 18 October 2026): engine, shell, `family` and `process` templates; quadratic, trig, derivative, integral, sequences. Code in `site/js/lab/` (index in its `CLAUDE.md`), tests `tests/lab-engine.test.mjs`, `tests/lab_browser.py`; deviations from the contract are listed in `docs/LAB_DESIGN.md` section 9. 
- [x] Phase 2 (done 18 October 2026): `chance`, `figure`, `data`, `transform`; probability, vectors, statistics, complex; old guided lab code removed (`#lab` lists nine experiments in six types of activity); deviations in `docs/LAB_DESIGN.md` section 10.
- [x] Phase 3 (done 18 October 2026): honest labelling (≈ and =) in all nine experiments, `type: 'lab'` slide widgets (player mode `slide`, export bundle), inline mount of the first lab reference on chapter pages, lab references refined to missions in the manifest, `tests/lab-links.test.mjs` and `tests/slides_lab_browser.py`; deviations in `docs/LAB_DESIGN.md` section 11. Slide widget types still on old code (no experiment covers them): `vec` (premiere-03, premiere-07: norm, orthogonality, dot product), `complex` modes alg and polar, `tree`, `rv`, `fn`, `line`, `ref`, `interval`, `pct`, `scatter`, `cobweb`, `limit`, `convex` and the 3D, matrix and Markov ones.
- [x] Phase 4 (done 19 October 2026): template `space` (true 3D, shared camera `site/js/camera3d.js`), experiments `line`, `exponential`, `cobweb`, `matrix`, `space-lines` (fourteen in seven groups), manifest links, slide widgets `line`, `fn` exp (stmg-02), `cobweb`, `matrix2`, `plane3d`, `line3d`, `lineplane` migrated and deleted (kept: `fn` for premiere-09, stmg-03, stmg-04, and the others listed in `docs/LAB_DESIGN.md` section 12); deviations in section 12.

- [x] Proof and geometric chance (owner request, 19 October 2026): experiments `tiles` (64 = 65 puzzle and Curry's triangle, group "a figure is not a proof"), `euler-primes`, `fermat`, `circle-regions` (group "a pattern is not a proof", one subsection each), `buffon`, `bertrand` (group "geometric probability", one subsection each); groups about an idea live in `SECTION_INFO` of `site/js/lab/registry.js` (an experiment's `section` and `sub`). Gallery: four colour map (`gallery-four-colour*.js`). Challenges: `cookies` (stars and bars), `jugs` (two jugs, Bézout). Lighter pages: lab index and experiment page (previous / next, list folded), two cards per row on phones for challenges and gallery, pathway programmes folded. Owner to check: the MacTutor links of the new history boxes (Cassini, Buffon, Bertrand, the four colour history topic) were written without network access [VERIFY].

- [x] Second batch (owner request, 19 October 2026): challenges `nails` (picture hanging; shortest windings found by exhaustive search, repeated in the tests), `fly` (two trains, animated statement and solution), `cheryl` (Cheryl's birthday, four date lists), `sumproduct` (Freudenthal; (4, 13) for x + y ≤ 65 to 300, none for 62). The tiles experiment now opens on the usual cheated drawing (corners moved onto the diagonal so the pieces seem to fit) and shows the true pieces only with "Drawing: True pieces".

### 4. Scale in priority order
Brief section 3: classes taught this year, then Malagasy T12 (S, OSE, L), Olympiad, rest of Malagasy, IB, university basics last. Each chapter goes through the same pipeline.

## Open for the owner (do not guess)

1. Malagasy programme documents: the owner supplies them per chapter.
2. Terminale STMG programme in force this year (not found on Eduscol in the 12 October check).
3. Whether maths expertes keeps the 2019 text beyond this year.
4. Owner review of the Cahier design.
5. (Settled 15 October 2026: content CC BY-NC-SA 4.0 in `LICENSE.md`, program code MIT in `LICENSE-CODE`.)
6. Policy conflicts left by the merge of the TeX branch: its documents (`docs/HANDOFF.md`, `docs/ARCHITECTURE.md`) still say one AI notice in the footer, one mint accent, and an English twin with equal page count for every resource. The brief withdrew the notice and replaced the language rule; the site follows the brief. Decide whether English twins stay mandatory for every resource.
7. English proof-reading of the generated English units (16 of about 10,800 segments reviewed).
8. Owner, school and place names remain in the git history of the TeX branch; removing them needs a history rewrite and force-push.
9. Later: access control (codes or paywall) needs a server or paid platform.

## Before the site is made public (owner checklist)

1. Run the two-agent audit and ledger record for what is published (publication gate), and proof-read the English (open point 7). The owner said he will do this before launch.
2. Licence: content is CC BY-NC-SA 4.0 (`LICENSE.md`, footer link); code is MIT (`LICENSE-CODE`).
3. Settings, Pages, Source: GitHub Actions (or another static host), then run the "Deploy to GitHub Pages" workflow.
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
