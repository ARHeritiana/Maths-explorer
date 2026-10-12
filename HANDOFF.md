# Handoff

Last updated: 12 October 2026. Everything an agent needs to start is in this file plus `PROJECT_BRIEF.md` (governing, wins on any conflict). If you only have time for one thing, read brief section 2 (rules) and the task queue below.

## What this project is

Static maths resource site, experiment-first (manipulate, conjecture, prove), for lycée and basic early-university. Per chapter: automatismes, activité d'introduction, notes de cours, exercices et problèmes, interactive slide. The owner is a maths teacher; he reviews slowly and always before class use. AI agents write and audit.

## State of the repository (verified 12 October 2026)

| Area | State |
|---|---|
| Governing brief | `PROJECT_BRIEF.md` v0.5. Decisions settled, only the items in "Open for the owner" below remain. |
| Design | Done as a prototype in `design/prototype/` (three themes, fonts, hero figures). Not yet applied to `dist/`. |
| Live site `dist/` | Still the old v1 site (navy, mint, violet; catalogue landing). 157 MB, 672 PDFs, mostly without TeX source. |
| Tests | `npm test`: 49 pass. `npm run check` passes. Browser tests not re-run this session. |
| Skills | `.claude/skills/slides-interactive-math/` and `slides-interactive-3d-math/` with lint script. |
| Private area | `private/` created with an empty `ledger.json`. No chapter has been through the pipeline yet. |
| Chapters produced under v2 | None. No gold-standard chapter exists. |
| Tooling in this sandbox | `xelatex`, `python3`, `node` 22 present (`which` check). Playwright Chromium at `/opt/pw-browsers/chromium`. Check SymPy before relying on it. |

## Rules you must not break (short form; brief section 2 is authoritative)

1. Anonymity: no name of the owner, employer, school or students in HTML, PDFs (text and XMP/metadata), `\author`, file names, alt text. Do not add any such detail to commit messages or docs either.
2. No links to Google Drive or any personal storage. Host copies inside the site.
3. No visible AI notice or review status anywhere published. Status lives only in `private/ledger.json`.
4. Every PDF ships its `.tex` (XeLaTeX, `content/latex/enrichment/explorer.sty`).
5. No accounts, no analytics.
6. Publish only after two independent AI audits (different agents) with no open finding, plus code verification of every computed result. Record `human_reviewed` in the ledger.
7. Never invent a source, bulletin number or programme requirement. Tag [VERIFY] or say you do not know.
8. Language: French for French and Malagasy curricula, English for IB, bilingual for Olympiad.
9. Slides: read both skills first; every canvas draggable; true 3D where the object is 3D; lint before committing.
10. Copy: no em or en dashes in site copy.

## Task queue (do in order; tick here when done)

### 1. Clean-up of v1 (small, do first)
- [ ] Remove the AI notice from the footer: `dist/js/app.js` line 118, the `<small class="content-origin">` element; remove its CSS and any test asserting it. Search again for other notices (`content-origin`, "IA", "AI-generated") in `dist/`, `docs/`, `README`.
- [ ] Scan all 672 PDFs and web editions for identifying metadata (`pdfinfo`, `exiftool` or `qpdf`, plus XMP) and for names in text. Report findings in `private/audits/`; strip metadata only if the file is regenerated or with a safe tool, then re-run `npm test`.
- [ ] Allow French-only and English-only resources in the library model (currently every resource is a FR/EN pair, `[French, English]` fields). Keep tests and CI green.

### 2. Shared slide engine and pilot chapter
- [ ] Build the shared engine from `.claude/skills/slides-interactive-math/references/engine-patterns.md` and the reference slide `assets/example_trinome.html` (the owner also supplied a determinant slide; ask for it if needed). Put it where `dist/` can load it; keep each slide a single self-contained HTML file at publish time if the skill requires it; keep the skills in step with the engine.
- [ ] Pilot chapter: quadratic trinôme, Première spécialité (brief section 11). Sequence: automatismes, activité, notes de cours, exercices et problèmes with corrections, slide. Programme reference: BO n. 14 du 2 avril 2026, NOR MENE2602917A [VERIFY details against the text before citing].
- [ ] Run the pipeline in brief section 8: LaTeX compile, SymPy verification script in `private/verification/`, browser test of the slide (drag, sliders, steps, fullscreen, themes, 390 px), audit 1, audit 2 by a different agent, ledger record.
- [ ] Use the result to correct the chapter template (brief section 4) and ask the owner to review.

### 3. Apply the v2 design to the site
- [ ] Port tokens, fonts and layout from `design/prototype/` into `dist/` (hero experiment, chapter tabs, five-part sequence, theme selector). Keep hash routes. Keep tests passing; update tests that assert old copy.
- [ ] Check contrast, keyboard use, 390 px and 200% zoom in all three themes.

### 4. Scale in priority order
Brief section 3: classes taught this year, then Malagasy T12 (S, OSE, L), Olympiad, rest of Malagasy, IB, university basics last. Each chapter goes through the same pipeline.

## Open for the owner (do not guess)

1. Malagasy programme documents: the owner supplies them per chapter.
2. Terminale STMG programme in force this year (not found on Eduscol in the 12 October check).
3. Whether maths expertes keeps the 2019 text beyond this year.
4. Owner review of the prototype design.
5. Site licence; whether to merge or replace the 98 existing LaTeX workshops.
6. Later: access control (codes or paywall) needs a server or paid platform.

## How to verify your work

```sh
npm run check && npm test
python3 -I .claude/skills/slides-interactive-math/scripts/lint_slide.py <slide.html>
python3 scripts/build-enrichment.py        # LaTeX builds (XeLaTeX)
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
