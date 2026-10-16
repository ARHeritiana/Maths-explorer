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
  data/enrichment.json    enrichment workshops (both languages, maths marked $...$), source of their TeX units, HTML and site data
  data/glossary.json      FR-EN terminology
site/                     hand-written web source: index.html, styles/ (tokens.css first: colour tokens), js/, slides/ player, vendor/
build/mxbuild/            pipeline package (python -m mxbuild ...), native PDF excerpt assembly; build/out/ holds products and logs (ignored)
scripts/                  course builders and tools, called by mxbuild (to be folded into mxbuild in phase B)
dist/                     served folder: copies of site/ plus generated files (committed)
tests/                    node tests, browser tests (Playwright), slide checks, banned-content check
docs/                     documentation; docs/history/ keeps dated reports
```

## Data flow

```
content/tex/courses ──(make tex: scripts/build-*.py via mxbuild.tex.compile)──► dist/resources/**/*.pdf
        │                  mx-layout.sty draws the frame and print palette; mxbuild.pdf assembles excerpts
        └─(publish-sources.py)──► dist/sources/ + manifest.json
content/data/manifest.json ──(make catalog: mxbuild.catalog)──► dist/resources/catalog.json (measured PDFs)
                                                               dist/js/resources-data.js
                                                               docs/RESOURCE_PROVENANCE.json
content/data/enrichment.json ──(build-enrichment.py: mxbuild.enrichment)──► enrichment units (FR, table, EN), PDFs, HTML,
                                                                        dist/js/enrichment-data.js
site/js/study-guides.js ──(build-study-guides.mjs)──► dist/resources/shared/*.html + manifest entries
content/slides + content/tex ──(make slides: build-slides.py)──► dist/slides/data, dist/slides/fig
dist/slides/data + site/slides ──(make slides: export-slides.py)──► dist/slides/export/<deck>.html (one self-contained file per deck, offered as "Télécharger HTML")
site/ ──(make site)──► dist/
```

Rules:
- Edit `site/`, never `dist/` copies; `mxbuild site --check` fails on drift.
- Edit `content/data/manifest.json` (or use `mxbuild.catalog.load()/save()` in builders), never `catalog.json`,
  `resources-data.js` or `RESOURCE_PROVENANCE.json`; `mxbuild catalog --check` fails on drift. Page counts, sizes and
  hashes are always measured, never typed.
- A rebuilt PDF that differs from the committed one only in its random `/ID` is put back (`mxbuild.pipeline.restore_unchanged`),
  so a core change does not rewrite every binary in the repository.
- Resource URLs under `dist/resources/` are stable; the site and external links depend on them.
- All visible PDF framing is compiled by `mx-layout.sty`. Excerpts reuse cached empty mxbook pages to keep their
  own sheet counters, copy selected content at its existing geometry, and remap links to retained pages.
  No Python colour substitution or general content scaling is applied. Frames are cached under
  `build/out/native-frames/` by the core hash, language and page count.
  Known resource lengths are compiled together per language; cache writes are atomic and incomplete entries are
  rebuilt rather than used in a download.
- Owner, school and place names are banned everywhere; `tests/banned.py` checks tracked text and PDF text against
  hashed phrases (the names are not stored in plain text).

## Commands

| Command | Does |
|---|---|
| `make tex [COURSE=x] [FORCE=1]` | Build native-framed courses (skipped when inputs are unchanged), assemble excerpts, regenerate the catalogue, republish sources. |
| `make site` | Rebuild products whose source dependencies changed, regenerate catalogues/cache versions, and copy `site/` into `dist/`. |
| `make catalog` | Regenerate the catalogue files from the manifest. |
| `make slides` | Rebuild slide decks and figures, then the single-file HTML export of every deck. |
| `make inventory` | Regenerate `docs/TEX_INVENTORY.md`. |
| `make check [FAST=1]` | All pre-push checks (FAST skips the two browser suites). |

Container setup (per session): `apt-get install texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra
texlive-science texlive-lang-french texlive-pictures texlive-latex-recommended texlive-pstricks texlive-xetex latexmk`,
`pip install pymupdf playwright==1.56.0`; Chromium at `/opt/pw-browsers`.

## Linked content and interface policy (16 October 2026)

`make site` is the publication preparation command. `mxbuild.refresh` compares tracked input fingerprints in
`content/data/build-state.json`, runs affected producers in dependency order, then measures products and regenerates
shared metadata. PDF/TeX, university packaging, slide data, HTML exports, lecture PDFs and source downloads have
separate dependencies. A change to a shared player invalidates all its HTML exports; an unchanged lecture stays cached.
The receipt is generated state, never an editorial source. Its initial migration was adopted only after rebuilding
and validating retained products. Missing receipts, missing assets, unknown references and unexpected product drift
fail explicitly. Removing a whole producer needs an explicit asset migration.

Course identities, titles, language policy and chapter identities come from `manifest.json`. Companion records retain
layout annotations and pedagogical guide mappings; those topic mappings can differ from the catalogue taxonomy.
University collections, documents and sequences generate `site/js/catalogue-data.js`, the measured university index,
pathway summaries, navigation and catalogue links. Counts come from arrays. Foundation sequences carry stable
`sourceDeck` and `pdfChapter` bindings, so display order cannot silently swap lesson content. Removed indexed
university assets and removed slide exports/lecture products are pruned. New primary chapters require reviewed file
and companion layout records; the build refuses incomplete entries instead of silently hiding them.

Every linked resource uses a content version. The main page and separate player document version their JS dependencies;
slide figures, exports, sources, PDF links and JSON reads have matching freshness rules. CI checks both input/output
receipts and regenerated metadata. Mutation tests cover changed engine/course metadata, sequence addition, rename,
reorder, removal and stable source bindings.

Neutral pages use the saved language preference, or the browser language on first visit. Curriculum pages and their
PDF/player links use `contentLanguage`; university sequences use their collection language. Language controls are
omitted on fixed-language pages. Downloads sit beside the links opening their resources. A shared policy hides
selectors with zero or one enabled choice and restores them when choices grow.

Canvas cameras remain independent of mathematical state. Wheel/pinch zoom, direct dragging and keyboard shortcuts
replace view and point button toolbars. H selects a point and arrows move it; Shift+arrows pan, +/- zoom, and 0 resets.
SVG editors retain their own pointer gestures and support Shift-drag/pinch camera interaction. Double-click resets
camera views. Mathematical mode choices, reveal/navigation controls and fullscreen remain available.
