# Redesign plan

Inputs: `docs/REDESIGN_PROMPT.md` (brief), `docs/REPO_AUDIT.md` (findings and baseline), `docs/TEX_INVENTORY.md`
(generated inventory), `docs/ADR-0001-tex-i18n.md` (decided i18n model). Order: A structure, B TeX, C site, D content.
After every phase: all resources build, all pre-push checks pass, `dist/` keeps serving the same URLs.

## 1. Proposed repository layout (needs the owner's go-ahead before any file moves)

```
content/
  tex/
    core/                 mxbook.cls, mx-env.sty, mx-math.sty, mx-i18n.sty, mx-edition.sty, mx-figures.sty,
                          mx-layout.sty, mx-code.sty, example.tex (minimal compilable example)
    courses/
      seconde/            s01.fr.tex, s01.en.tex (GENERATED), s01.en.json (translation table), ...
      premiere/           c01..c10, corrections, evaluations, annexes as units
      terminale/
      stmg/
      automatismes/
      enrichment/         generated from content/data/enrichment.json by the pipeline
    banks/                shared banks (fluency, methods, proofs, algorithms)
    figures/              one figure per file: <id>.fr.tex, <id>.en.tex (GENERATED), <id>.en.json
  slides/                 authored decks and drafts (unchanged)
  data/
    manifest.json         single source of truth: courses, units, resources, editions, provenance labels
    curriculum.json       programme item -> resource map (track D)
    glossary.json         FR-EN terminology (from translation-terminology.py)
    enrichment.json       moved from content/
site/                     hand-written site source: index.html, styles/ (tokens.css first), js/ (ES modules), slides/
                          player, vendor/
build/
  mxbuild/                Python package: tex (compile, cache, split), twin, catalog, sources, slides, site, checks
  out/                    all intermediate products (gitignored)
dist/                     the served folder (hosting serves dist/): assembled by `make site`, PDFs written by
                          `make tex`, committed because the host has no build step; README says "generated"
docs/                     ARCHITECTURE.md, ADRs, style guide, design system, handoff; history/ for dated reports
tests/
Makefile                  make tex COURSE=..., make site, make check, make all (cached)
```

Choices to confirm (the layout question to the owner):

1. **`site/` plus committed `dist/`** (recommended). `site/` is the only hand-edited web code; `dist/` is generated and
   committed because the host serves it without building. Cost: about 1 MB of JS/CSS stored twice in git. The alternative,
   pointing `.openai/hosting.json` at `site/`, cannot be tested from here [VERIFY with the host].
2. **Translation tables next to the unit** (`c05.en.json` beside `c05.fr.tex`, recommended) rather than in
   `docs/translations/` as the brief suggests: one move, one review, one diff per unit.
3. **Overlay tooling.** The 17 legacy Terminale PDFs have no TeX source. Recommended: keep the 17 PDFs as frozen static
   files (catalogue `legacy: true`) and retire the overlay scripts and 3.4 MB of translation JSON (git history keeps
   them). Alternative: drop the 17 PDFs. The 156 `shared` resources are HTML from `study-guides.js` and are unaffected.

URLs: resource paths under `dist/resources/` keep their names, so no redirects are needed. `dist/sources/` is regenerated
from `content/tex/` with a README for local compilation.

## 2. Phases

### Phase A. Structure (no change to any PDF)
A1. `git mv content/latex/<course>` to `content/tex/courses/<course>` (file names unchanged until each unit migrates in
B); update builders. A2. Create `content/data/manifest.json` from `catalog.json`, `TEX_CONVERSION.json`,
`RESOURCE_PROVENANCE.json`; generate those three (and `resources-data.js` companion fields) from it; tests compare the
regenerated files byte for byte with today's. A3. Move web source to `site/`, add `make site` (copy to `dist/`), point
`npm run check` and tests at the right files. A4. `build/mxbuild` package with one compile driver (`-halt-on-error`, rerun
detection, content-hash cache), wrapping the current builders; `Makefile`. A5. Retire dead code (`import-resources.py`,
overlay tooling if approved, orphan PDFs), move dated reports to `docs/history/`. A6. `docs/ARCHITECTURE.md`, `AGENTS.md`.
Exit test: rebuilt PDFs have identical page counts and text to the committed ones (byte identity is not expected:
PDF timestamps).

### Phase B. TeX system
B1. `content/tex/core/` (class and packages listed above; one colour palette matching site tokens; `mdframed` left rule
for large boxes, `tcolorbox` for small ones; `\newcounter`; `\needspace`; `\ifmxteacher`), canonical environments
(`keypoint`, `definition`, `theorem`, `method`, `example`, `proof`, `pitfall`, `activity`, `exercise`, `application`,
`solution`, `teachernote`, `homework`, `exitticket`, `figurebox`, `fluency`) with French labels from `mx-i18n.sty`.
Mapping from current names: `docs/TEX_INVENTORY.md` plus a hand-checked table in `docs/TEX_STYLE_GUIDE.md`.
B2. `mxbuild twin` (`build/mxbuild/twin.py`, section 4) with tests. B3. Migrate per course in the order Automatismes, STMG,
Seconde, Première, Terminale, Enrichment: rewrite the French unit into canonical environments (mechanical, scripted,
reviewed by diff), align the old English twin into the table, generate `unit.en.tex`, compile both editions in both
languages, compare page counts and render a page sample before/after (viewed). B4. Generated mains, precompiled format,
figure externalisation (standalone compile per figure, shared with slides), lints (no `\clearpage` in units, no raw RGB,
no undefined macros, no banned strings). B5. Restyling moves into the class; `style-resource-pdfs.py` retired when the
last course migrates. B6. `docs/TEX_STYLE_GUIDE.md`, `dist/sources` README.

### Phase C. Site and design system
Audit first (screenshots of every route at 360/768/1280 px, FR and EN, viewed), defect list, then `site/styles/tokens.css`
and the merged CSS, component library in `docs/DESIGN_SYSTEM.md`, `app.js` split into route modules, catalogue view
driven by the manifest, language-aware reader links, teacher mode, lab and canvas fixes listed in `docs/HANDOFF.md`.

### Phase D. Content integrity
Curriculum map in `content/data/curriculum.json`; parity tests on every pair; English proof-read through the translation
tables (status `reviewed`); [VERIFY] list resolved with the owner.

## 3. Risks

| Risk | Mitigation |
|---|---|
| Restyling in TeX changes page counts that the site and splits rely on | Splits read bookmarks, not fixed pages; manifest page counts are generated; FR=EN parity is a build failure. |
| Canonical rewrite alters mathematics | Rewrite is a scripted rename of environments only; a test compares the maths token stream before and after per unit. |
| The phase sequence exceeds one session | Each phase step is committed green; `docs/HANDOFF.md` records the exact resume point. |
| STMG compile time (51 % of total) | Profile in B4 (tcolorbox `drop shadow`/`enhanced` and pgfplots are the suspects); externalised figures and the format file. |
| Expensive agent batches | None launched without the owner's approval. |

## 4. TeX prototype result

The first prototype (tokenizer: locked skeleton, prose segments, maths placeholders, figure text slots, rules for
decimal separator and French punctuation spacing), run on the unchanged sources: **164 of 218 pairs align, 12,777
segments**. The refused pairs and their causes are listed in `docs/ADR-0001-tex-i18n.md`. Not yet prototyped: the class
and the precompiled format (B1, B4).

## 5. Baseline (before)

Files 2,288; text lines 182,186; `.git` 167.6 MiB; `dist/` 171 MB; TeX 439 files, 42,845 lines; full compile 622 s;
page counts per book in `docs/REPO_AUDIT.md` section 8 (all FR = EN). All pre-push checks green.
