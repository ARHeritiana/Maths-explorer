# Monorepo plan: one source, two editions (option B, owner go-ahead 21 November 2026)

Status: plan only. It reverses the independence rule of 14 November 2026 once step 2 below lands; until then the
independence rule and the double-PR habit stay in force.

## Measured starting point (21 November 2026, both `main` at their tips)

Of 3,334 tracked paths present in both repositories (`site/`, `content/`, `build/`, `scripts/`, `tests/`, `docs/`),
269 differ. They fall in three kinds:

| Kind | Examples | What to do |
|---|---|---|
| **Theme** (intended) | `site/styles/{tokens,pages,ergonomics,explorer}.css`, `comic.css`, `motion.js`, `home-art.js`, fonts, `content/tex/core/mx-brand.sty`, the 118 `content/tex` lecture units that carry the brand, `scripts/share-image.py`, `docs/DESIGN_V8.md` | one theme folder per edition, chosen at build time |
| **Scope** (intended) | `live-curriculum.js`, `curriculum-picker.js`, `edition.json`, `manifest.json`, `relax-model.js` (Olympiad), `bank-page.js` (Malagasy), `content/{malagasy,university}`, Olympiad and university modules and tests | superset code, switched by an edition scope file, not by `FULL_EDITION` |
| **Drift** (unintended) | order of functions in `home-art.js`, comment-only and test-only differences, a few ported-late changes | resolved once, in the merge |

Generated files (`manifest.json`, `RESOURCE_PROVENANCE.json`, `build-state.json`, `dist/`) are not source and are
rebuilt per edition.

## Target layout

```
site/ content/ build/ scripts/ tests/ docs/      shared source: the superset (Matematika's scope)
editions/
  explorer/    edition.json  scope.json  theme/ (css, fonts, mx-brand.sty, share image)
  matematika/  edition.json  scope.json  theme/
content/malagasy, content/university, ...         shared tree, listed in scope.json of the editions that show it
dist/<edition>/                                   built in CI, NOT committed
content/built/<edition>/                          committed PDFs only (local TeX lacks pplr8t)
```

`make site EDITION=explorer|matematika` builds one edition. `scope.json` lists curricula, routes and collections.

**Superset guarantee (the owner's hard rule, now a test):** `tests/editions.test.mjs` builds the course list, routes,
resource index and gallery/lab ids of both editions and fails if Matematika lacks anything Maths-explorer has.

## Steps (one PR each, `main` stays green and deployable throughout)

1. **Stop committing generated output.** `pages.yml` builds `dist/` in CI; only PDFs stay committed. Done first in
   Maths-explorer (worst history), then in Matematika.
2. **Edition seam.** Introduce `editions/<name>/` and `scope.json`; replace `FULL_EDITION` and the Python edition
   reads with the scope file; both editions still build from their own repository, byte-equal to today.
3. **Merge the superset.** Import Matematika's scope code and content into this repository behind `scope.json`
   (explorer scope = today's Maths-explorer). Resolve the drift once. Gate: Maths-explorer's built site is unchanged.
4. **Matematika from the monorepo.** Build `EDITION=matematika` here; gate: it equals the live Matematika site apart
   from the intended drift fixes.
5. **Deploy and retire.** Publish Matematika's Pages from this repository (see Decisions), archive its source.
6. **Guard rails.** The superset test in CI; `AGENTS.md`, both `CLAUDE.md` and the memory rules rewritten.
7. **Then** `site/js/` feature folders and a shorter `MAP.md`.

## Decisions needed from the owner

1. **Home repository.** Recommended: this one (589 commits, the main product). Matematika's repository then only
   serves its Pages site.
2. **Two Pages sites from one repository.** GitHub allows one Pages site per repository. Recommended: a workflow here
   builds `EDITION=matematika` and pushes it to the Matematika repository with a deploy key stored as a secret in
   this repository (owner action: create the key). Alternative: a workflow in the Matematika repository that checks
   this one out; needs a read token instead.
3. **Open PRs on Matematika** (#18 #19 #21 #22 #24 #25 #27 at the last count) are merged or rebased before step 3.

## Rollback

Every step is one squash-merged PR: revert it. Until step 5 the old Matematika repository stays the live source.
