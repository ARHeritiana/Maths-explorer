# Architecture

Static bilingual site (French and English) with downloadable PDFs compiled from LaTeX. The host serves `dist/` as
static files and runs no build, so `dist/` is committed. Decisions: `docs/ADR-0001-tex-i18n.md`. Plan and phase status:
`docs/REDESIGN_PLAN.md`, `docs/HANDOFF.md`.

## Layout

```
content/
  tex/courses/<course>/   LaTeX sources (automatismes, enrichment, premiere, seconde, stmg, terminale)
  tex/core/               shared class and packages (phase B)
  slides/                 authored slide decks and French drafts
  data/manifest.json      single source of truth for the resource catalogue
  data/enrichment.json    enrichment workshops (both languages), source of their TeX, HTML and site data
  data/glossary.json      FR-EN terminology
site/                     hand-written web source: index.html, styles/, js/, slides/ player, vendor/
build/mxbuild/            pipeline package (python -m mxbuild ...); build/out/ holds products and logs (ignored)
scripts/                  course builders and tools, called by mxbuild (to be folded into mxbuild in phase B)
dist/                     served folder: copies of site/ plus generated files (committed)
tests/                    node tests, browser tests (Playwright), slide checks, banned-content check
docs/                     documentation; docs/history/ keeps dated reports
```

## Data flow

```
content/tex/courses ──(make tex: scripts/build-*.py via mxbuild.tex.compile)──► dist/resources/**/*.pdf
        │                                                    └─ style-resource-pdfs.py (PDF frame) ─┐
        └─(publish-sources.py)──► dist/sources/ + manifest.json                                    │
content/data/manifest.json ──(make catalog: mxbuild.catalog)──► dist/resources/catalog.json        ◄┘ measures PDFs
                                                               dist/js/resources-data.js
                                                               docs/RESOURCE_PROVENANCE.json
content/data/enrichment.json ──(build-enrichment*.py)──► enrichment TeX, PDFs, HTML, dist/js/enrichment-data.js
site/js/study-guides.js ──(build-study-guides.mjs)──► dist/resources/shared/*.html + manifest entries
content/slides + content/tex ──(make slides: build-slides.py)──► dist/slides/data, dist/slides/fig
site/ ──(make site)──► dist/
```

Rules:
- Edit `site/`, never `dist/` copies; `mxbuild site --check` fails on drift.
- Edit `content/data/manifest.json` (or use `mxbuild.catalog.load()/save()` in builders), never `catalog.json`,
  `resources-data.js` or `RESOURCE_PROVENANCE.json`; `mxbuild catalog --check` fails on drift. Page counts, sizes and
  hashes are always measured, never typed.
- Resource URLs under `dist/resources/` are stable; the site and external links depend on them.
- Owner, school and place names are banned everywhere; `tests/banned.py` checks tracked text and PDF text against
  hashed phrases (the names are not stored in plain text).

## Commands

| Command | Does |
|---|---|
| `make tex [COURSE=x] [FORCE=1]` | Build courses (skipped when their inputs are unchanged), style changed PDFs, regenerate the catalogue, republish sources. |
| `make site` | Copy `site/` into `dist/`. |
| `make catalog` | Regenerate the catalogue files from the manifest. |
| `make slides` | Rebuild slide decks and figures. |
| `make inventory` | Regenerate `docs/TEX_INVENTORY.md`. |
| `make check [FAST=1]` | All pre-push checks (FAST skips the two browser suites). |

Container setup (per session): `apt-get install texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra
texlive-science texlive-lang-french texlive-pictures texlive-latex-recommended texlive-pstricks texlive-xetex latexmk`,
`pip install pymupdf playwright==1.56.0`; Chromium at `/opt/pw-browsers`.
