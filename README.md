# Maths Explorer

A static, experiment-first mathematics resource site for lycée students and teachers (basic early-university topics last). Each chapter is a sequence: automatismes, an introductory activity, course notes, exercises and problems, and an interactive animated slide. Students manipulate a figure first, then conjecture, then prove.

Curricula, in priority order: current French lycée classes (Seconde, Première spécialité, Terminale spécialité, maths expertes, Terminale STMG), Malagasy Terminale, Olympiad, rest of the Malagasy curriculum, International (IB, SAT). Language: French for French and Malagasy curricula, English for International, bilingual for Olympiad. French and English PDFs are produced from one set of TeX sources.

Status: work in progress, not launched. The repository is private.

## For an AI agent or collaborator

Read, in this order:

1. `HANDOFF.md`: current state, task queue, how to verify your work.
2. `PROJECT_BRIEF.md`: the governing document. It overrides this file, `AGENTS.md` and `docs/`.
3. `docs/HANDOFF.md` and `docs/ARCHITECTURE.md`: the TeX and build pipeline (status of the PDF migration, commands).
4. `docs/DESIGN_V3.md`: the visual design and its reasons.
5. `.claude/skills/slides-interactive-math/SKILL.md`, then `.claude/skills/slides-interactive-3d-math/SKILL.md`, before touching any slide.
6. `private/README.md`: where review status and audit notes live (never published).

## Run locally

Requires Node.js 18 or later.

```sh
npm start              # serves dist/ at http://localhost:4173 (PORT overrides)
npm run check          # syntax check of the site code
npm test               # unit and content tests
npm run test:browser   # needs python playwright (see tests/run_browser.py)
make check             # the full check suite of the pipeline (needs TeX, see docs/HANDOFF.md)
```

Hash routes, relative paths (the site also works under a sub-path such as `/Maths-explorer/`), no accounts, no analytics, no runtime dependency. Opening files with `file://` is not supported (ES modules).

## Publishing (GitHub Pages)

The active deployment uses native ChatGPT Sites with its existing access policy. GitHub Pages is an optional public host. Configure repository Settings, Pages, Source: "GitHub Actions" before running `.github/workflows/pages.yml` manually. To enable automatic publication on pushes to `main`, explicitly set the repository variable `PUBLISH_GITHUB_PAGES=true`. Without that opt-in, pushes skip the Pages job instead of failing against an unconfigured public host. Run `make site` before publishing so `dist/` is current. Enabling Pages can make the published files publicly accessible; the private repository itself must remain private.

## Layout

```text
site/                 hand-written web source: index.html, js/, styles/, fonts/, slides player and widgets, vendor/
dist/                 the served folder, committed (the host has no build step): copies of site/ plus generated PDFs, catalogue and slide data
content/tex/          TeX core (mxbook class and packages) and course units; English units are generated from translation tables
content/data/         manifest.json (catalogue source of truth), enrichment.json, glossary.json
content/slides/       slide decks sources
build/mxbuild/        the pipeline (make tex, site, catalog, slides, check)
design/               superseded design prototype (kept for reference only)
private/              ledger, audits, verification scripts, drafts (never deployed)
.claude/skills/       slide skills and lint script
scripts/              course builders, local server
tests/                node tests, browser tests, slide, twin, notation, lint, parity and banned-phrase checks
docs/                 architecture, TeX style guide, design, history (the brief wins where they conflict)
```

Edit `site/`, never the copies in `dist/`: `python -m mxbuild site` (or `make site`) copies `site/` into `dist/`, and `python -m mxbuild site --check` fails when a copy differs.

## Rules in one paragraph

No identifying information about the author or any employer anywhere published (HTML, PDF text and metadata, file names). No links to personal storage. No visible AI notice or review label. No tracking. Draft, audit and review status stay in `private/`. A resource is publishable after two independent AI audits and code verification of every computed result. Full rules: `PROJECT_BRIEF.md`, section 2.

## Licences

Fonts in `site/fonts/` are under the SIL Open Font License (licence files alongside). Site content: CC BY-NC-SA 4.0 (see `LICENSE.md`). Program code: MIT (see `LICENSE-CODE`).

