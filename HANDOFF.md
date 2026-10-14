# Handoff

Last updated: 13 October 2026. Everything an agent needs to start is in this file plus `PROJECT_BRIEF.md` (governing, wins on any conflict). If you only have time for one thing, read brief section 2 (rules) and the task queue below.

## What this project is

Static maths resource site, experiment-first (manipulate, conjecture, prove), for lycée and basic early-university. Per chapter: automatismes, activité d'introduction, notes de cours, exercices et problèmes, interactive slide. The owner is a maths teacher; he reviews slowly and always before class use. AI agents write and audit.

## State of the repository (verified 12 October 2026)

| Area | State |
|---|---|
| Governing brief | `PROJECT_BRIEF.md` v0.5. Decisions settled, only the items in "Open for the owner" below remain. |
| Design | Design v3 "Cahier" (reasoning and tokens in `docs/DESIGN_V3.md`). Source in `site/styles/explorer.css` and `pages.css`, `site/js/ui.js`, `site/js/icons.js`, fonts in `site/fonts/`; `dist/` holds the assembled copies. |
| Site and content | `site/` is the hand-written web source and `dist/` the committed, assembled folder (`make site`). The catalogue comes from `content/data/manifest.json` (`make catalog`). Bilingual PDFs are compiled from the shared TeX system in `content/tex/` (six courses migrated, 47 slide decks in `dist/slides/`); details and next steps in `docs/HANDOFF.md`. |
| Tests | `npm test`: 53 pass. `npm run check` passes. `make check` (pipeline): all checks pass except the notation test, which needs `pdflatex` (not installed in the 13 October sandbox). Browser suite (`tests/browser.py`) passes; `tests/slides_smoke.py` was started but not confirmed. |
| Skills | `.claude/skills/slides-interactive-math/` and `slides-interactive-3d-math/` with lint script. |
| Private area | `private/` created with an empty `ledger.json`. No chapter has been through the pipeline yet. |
| Publication gate | No chapter has been through the two-agent audit recorded in `private/ledger.json` yet. The TeX migration was verified by the pipeline checks, not by the gate. |
| Tooling | `node` 22, `python3`, Playwright Chromium at `/opt/pw-browsers`. TeX Live is not installed by default: see `docs/HANDOFF.md` for the apt packages. `pip install pymupdf playwright`. |

## Rules you must not break (short form; brief section 2 is authoritative)

1. Anonymity: no name of the owner, employer, school or students in HTML, PDFs (text and XMP/metadata), `\author`, file names, alt text. Do not add any such detail to commit messages or docs either.
2. No links to Google Drive or any personal storage. Host copies inside the site.
3. No visible AI notice or review status anywhere published. Status lives only in `private/ledger.json`.
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
- [ ] Scan all 672 PDFs and web editions for identifying metadata (`pdfinfo`, `exiftool` or `qpdf`, plus XMP) and for names in text. Report findings in `private/audits/`; strip metadata only if the file is regenerated or with a safe tool, then re-run `npm test`.
- [ ] Allow French-only and English-only resources in the library model (currently every resource is a FR/EN pair, `[French, English]` fields). Keep tests and CI green.

### 2. Shared slide engine and pilot chapter
- [ ] Build the shared engine from `.claude/skills/slides-interactive-math/references/engine-patterns.md` and the reference slide `assets/example_trinome.html` (the owner also supplied a determinant slide; ask for it if needed). Put it where `dist/` can load it; keep each slide a single self-contained HTML file at publish time if the skill requires it; keep the skills in step with the engine.
- [ ] Pilot chapter: quadratic trinôme, Première spécialité (brief section 11). Sequence: automatismes, activité, notes de cours, exercices et problèmes with corrections, slide. Programme reference: BO n. 14 du 2 avril 2026, NOR MENE2602917A [VERIFY details against the text before citing].
- [ ] Run the pipeline in brief section 8: LaTeX compile, SymPy verification script in `private/verification/`, browser test of the slide (drag, sliders, steps, fullscreen, themes, 390 px), audit 1, audit 2 by a different agent, ledger record.
- [ ] Use the result to correct the chapter template (brief section 4) and ask the owner to review.

### 3. Apply the v2 design to the site
- [x] Applied (13 October 2026) as design v3 "Cahier": chapter chooser with live preview, resume, two themes, full-screen figures, tab bar on phones. Hash routes kept.
- [ ] Still to do: screen-reader pass with a real device, 200% zoom check on the home page and chapter pages (`tests/browser.py` covers labs, challenges and pathways only), and owner review.

### 4. Scale in priority order
Brief section 3: classes taught this year, then Malagasy T12 (S, OSE, L), Olympiad, rest of Malagasy, IB, university basics last. Each chapter goes through the same pipeline.

## Open for the owner (do not guess)

1. Malagasy programme documents: the owner supplies them per chapter.
2. Terminale STMG programme in force this year (not found on Eduscol in the 12 October check).
3. Whether maths expertes keeps the 2019 text beyond this year.
4. Owner review of the Cahier design.
5. Site licence.
7. Policy conflicts left by the merge of the TeX branch: its documents (`docs/HANDOFF.md`, `docs/ARCHITECTURE.md`) still say one AI notice in the footer, one mint accent, and an English twin with equal page count for every resource. The brief withdrew the notice and replaced the language rule; the site follows the brief. Decide whether English twins stay mandatory for every resource.
8. English proof-reading of the generated English units (16 of about 10,800 segments reviewed).
9. Owner, school and place names remain in the git history of the TeX branch; removing them needs a history rewrite and force-push.
6. Later: access control (codes or paywall) needs a server or paid platform.

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
- When you finish a task, tick it above, add a dated one-line note to "Log", and commit.
- Never rely on memory of a programme: cite the NOR or BO reference and tag [VERIFY] when unsure.

## Log

- 2026-10-12: brief v0.5 (design section, two-agent gate), skills uploaded, design prototype added, README and handoff rewritten, private area created.

- 2026-10-13: owner discarded all design instructions. Design v3 "Cahier" (docs/DESIGN_V3.md): task-first home (level control, search, chapter list, live preview of the chapter's own figure, resume), calm notebook look, themes Jour and Nuit (follow the system), STIX Two Text and Atkinson Hyperlegible, full-screen button on figures, tab bar on phones, no ambient effects. File sizes shown before PDFs open. axe-core reports no WCAG 2.1 AA violation on 12 routes in both themes at 1366 and 390 px. Removed the AI footer notice and all-caps labels, simplified the quadratic lab formula, fixed two stale assertions in `tests/browser.py`.
- 2026-10-13: every challenge now has a hands-on activity (`dist/js/challenge-activities.js`): handshakes (draw handshakes between people), 100 doors (step or play the passes, tap a door for its history), dominoes on a board (drag from an unlimited supply, tap to turn, drag off to remove, keyboard path), 21 stones (play the computer), choose integers (find a set with no pair differing by a multiple of 7, plus a labelled simulation), common divisor (table of n³ − n with a divisor tester), x + 1/x (draggable point, area-1 rectangle), odd numbers (build the square border by border, up to 12 so the general pattern still has to be found). Activities never state the answer or the method. Titles and topics that gave the method away were renamed (the board challenge is now "Des dominos sur un plateau", topic "Pavages") and "Pour aller plus loin" moved inside the worked solution. axe-core reports no violation on the eight challenge pages. `tests/browser.py` drives every activity.
- 2026-10-13: the "IB" pathway is now labelled "International" (globe badge, library filter "Notions communes · International") and holds two programmes: IB (existing stages) and SAT Math (new: Algebra, Advanced math, Problem-solving and data analysis, Geometry and trigonometry, mapped to the existing laboratories with honest notes on what is not covered yet). SAT facts checked on 13 October 2026 against College Board's Math overview and specification pages; the domain shares (about 35, 35, 15, 15 %) differ between College Board documents, so the page tells readers to check the current specification. Pathways now allow `programmes`; use `pathwayStages(p)` to read stages. Next for this area: IB topic lists per course, SAT skill-level chapters, and an SAT-style practice set.
- 2026-10-13: integrated the TeX/PDF migration branch (`redesign/2026-10-11`, which already contained the repository-audit branches) into main: shared TeX system, bilingual PDFs, 47 slide decks, pack builder, LaTeX sources page, build pipeline. The Cahier web layer was ported onto the new `site/` structure (Diaporamas joins the main navigation; Dossier sur mesure and Sources LaTeX are linked from the footer). The v1 style sheets and the design prototype were removed. The 8 October curriculum audit moved to `docs/history/`. The single-commit alternative redesign on `claude/vigilant-darwin-ywur5s` (commit 52c409f) was not merged: superseded by the Cahier design and the new decks. All branches other than main were deleted.
- 2026-10-14: slide player rebuilt on the layout of the interactive-slides skill (1280x720 stage, flow column of step blocks on the left, live figure and controls on the right, ◀ Étape ▶ Tout at the bottom left, live values panel, amber/green/red palette, toast on blocked full screen). Every deck now has a self-contained HTML export, `dist/slides/export/<deck>.html` (`scripts/export-slides.py`, run by `make slides`; checked by `tests/slides_export_check.py`, which runs the skill lint on all 47 files), offered as "⬇ HTML" in the player and "Télécharger HTML" on the slides page. MathJax 3.2.2 and STIX Two Text load from the CDNs the skill allows, so an export needs internet, like the reference slide. Not yet done: per-chapter hand-built scenes in the style of `example_trinome.html` (decks still use the shared chapter widgets).
- 2026-10-14: challenges. Six new challenges (Tower of Hanoi, two ostrich eggs, Königsberg bridges, Josephus circle, Ramsey R(3,3), art gallery), each with a hands-on activity (`site/js/challenge-more.js`) and an animated step-by-step solution (`site/js/challenge-solutions.js`, one per challenge, 14 in all, including the 8 existing ones; started when the worked solution is opened, step buttons, no autoplay under reduced motion). The domino board did not work on touch screens (touch-action is ignored on SVG children, so the page scrolled instead of the domino moving): fixed with `lockTouch` in `challenge-kit.js`, also used by the handshake, inequality and art gallery handles; placed dominoes are now translucent so the colouring shows, with a random-attempt button. The odd-numbers illustration gives each border its own colour, outline and legend line. Answers checked by independent code in `tests/challenges-new.test.mjs` (BFS for Hanoi, DP for eggs, exhaustive search for Ramsey and Königsberg, simulation for Josephus, ear clipping plus 3-colouring and visibility for the gallery). [VERIFY] the eggs challenge is my reading of "ostrich eggs" as the two-egg drop puzzle; confirm with the owner.
- 2026-10-14: challenges, second pass. Removed the three least interesting (handshakes, n³ − n, minimum of x + 1/x); 11 remain. Every challenge now has variations: the numbers are parameters (`site/js/challenge-variants.js`, pure and tested), and the statement, the expected answer, the hints, the worked solution, the hands-on activity and the animated solution all follow them ("Change les données" panel with sliders, choices, "Au hasard" and "Valeurs d'origine"). `content.js` derives each challenge's default text from its variant, so there is one source. The mutilated board now asks for the largest number of dominoes (n²/2 − 2 for opposite corners, n²/2 − 1 for neighbouring corners), with the board size as a parameter. Königsberg takes any small bridge network, Ramsey has R(3,3) and R(3,4), the gallery is a comb with 2 to 6 teeth, the eggs have 2 or 3 eggs and 20 to 200 floors, Josephus removes every second or third person. Every variation is verified by an independent method in `tests/challenges-variants.test.mjs` (matching, DP, BFS, exhaustive search, simulation).
- 2026-10-14: laboratory objects. Four scenes that are not a formula with sliders (`site/js/lab-objects.js`, mounted into `#object-stage` for labs with `custom: true`): Galton board (binomial law, paths, animated balls), Reuleaux polygons (constant width measured, turning in a square, rolling, perimeter πw), Platonic solids (rotatable 3D, V−E+F=2, animated "why only five" with the p×q angle table), chaos game / Sierpiński levels. Pure maths is tested in `tests/lab-objects.test.mjs`; browser checks added to `tests/browser.py`. Sources for Reuleaux/Theaetetus/Galton/Sierpiński MacTutor URLs not reachable from the sandbox [VERIFY].
- 2026-10-14: design v4 "Vivid" (docs/DESIGN_V4.md) supersedes v3 principle 7: colour per card/experiment, rise-in and hover motion (reduced-motion safe), confetti on correct answers.
- 2026-10-14: eight classic challenges added (19 in all): grid paths → Pascal, 25 horses (top 3 in 7 races; top 1 in 6), fair sharing of the cubic cake, queens leaving free squares (exhaustive table n=4..6), snail on a post, four soldiers on a bridge, spoiled light egg (balance), fake-coin piles (one weighing; minimum n(n−1)/2, classic 1..n uses n(n+1)/2). Pure maths in `site/js/challenge-puzzles.js` (tests: `tests/challenge-puzzles.test.mjs`: path enumeration, 2000 random horse orders, exact cake shares, exhaustive queens, Dijkstra for the bridge, DP for the eggs); activities in `challenge-classics.js`; animated solutions in `challenge-solutions-2.js`. Open points [VERIFY]: optimality of 7 races for the top 3 horses is the classical result, not re-proved here; the snail post height (default 10 m) and cake size were chosen by me; the queens maximum rests on exhaustive search, not a hand proof.
