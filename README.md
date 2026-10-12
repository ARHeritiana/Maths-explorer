# Maths Explorer

A static, experiment-first mathematics resource site for lycée students and teachers (basic early-university topics last). Each chapter is a sequence: automatismes, an introductory activity, course notes, exercises and problems, and an interactive animated slide. Students manipulate a figure first, then conjecture, then prove.

Curricula, in priority order: current French lycée classes (Seconde, Première spécialité, Terminale spécialité, maths expertes, Terminale STMG), Malagasy Terminale, Olympiad, rest of the Malagasy curriculum, IB. Language: French for French and Malagasy curricula, English for IB, bilingual for Olympiad.

Status: work in progress, not launched. The repository is private.

## For an AI agent or collaborator

Read, in this order:

1. `HANDOFF.md`: current state, task queue, how to verify your work.
2. `PROJECT_BRIEF.md`: the governing document. It overrides this file, `AGENTS.md` and `docs/`.
3. `design/prototype/`: reference for the new visual design (run per its README).
4. `.claude/skills/slides-interactive-math/SKILL.md`, then `.claude/skills/slides-interactive-3d-math/SKILL.md`, before touching any slide.
5. `private/README.md`: where review status and audit notes live (never published).

## Run locally

Requires Node.js 18 or later.

```sh
npm start          # serves dist/ at http://localhost:4173 (PORT overrides)
npm run check      # syntax check of dist/js
npm test           # 49 unit and content tests
npm run test:browser   # needs python playwright (see tests/run_browser.py)
```

Hash routes, relative paths, no accounts, no analytics, no runtime dependency. `dist/` is the deployed folder and is committed on purpose. Opening files with `file://` is not supported (ES modules).

## Layout

```text
dist/                 deployed site (current v1 site, being migrated to the v2 design)
design/prototype/     v2 design reference: tokens, themes, fonts, hero figures (not deployed)
private/              ledger, audits, verification scripts, drafts (never deployed)
content/latex/        LaTeX sources and the shared style explorer.sty (XeLaTeX)
content/contributions/ owner-submitted originals
.claude/skills/       slide skills and lint script
scripts/              build and import scripts, local server
tests/                node tests and browser tests
docs/                 older v1 notes (superseded by the brief where they conflict)
```

## Building PDFs

`python scripts/build-enrichment.py` builds the authored PDFs with XeLaTeX and regenerates their web editions and catalogue. Install XeLaTeX, DejaVu Sans, Latin Modern Math and the packages listed in `content/latex/enrichment/explorer.sty`. Every PDF ships with its `.tex`. `--skip-pdf` updates web editions and the catalogue only.

## Slides

Each interactive slide is one self-contained HTML file. Lint every slide:

```sh
python3 -I .claude/skills/slides-interactive-math/scripts/lint_slide.py <slide.html>
```

## Rules in one paragraph

No identifying information about the author or any employer anywhere published (HTML, PDF text and metadata, file names). No links to personal storage. No visible AI notice or review label. No tracking. Draft, audit and review status stay in `private/`. A resource is publishable after two independent AI audits and code verification of every computed result. Full rules: `PROJECT_BRIEF.md`, section 2.

## Licences

Fonts in `design/prototype/fonts/` are under the SIL Open Font License (licence files alongside). Site content licence: not yet decided.
