# Site editing requirements

The owner explicitly forbids links from this or any other website to their
Google Drive or another personal space. Do not expose private folder/file URLs,
identifiers, or links in HTML, client-side catalogues, downloaded documents, or
PDF annotations. Host resource copies within the Site. Contact links are an
exception only in a specific, justified case authorised by the owner.

Git rule, set by the owner and binding on every agent: commit and push to the `main` branch only. Do not create or
use feature, session or agent branches, and do not open pull requests unless the owner asks. Run `npm test` and
`npm run check` before each push.

Start with HANDOFF.md (state and task queue), then PROJECT_BRIEF.md. The TeX and
build pipeline is documented in docs/HANDOFF.md and docs/ARCHITECTURE.md.

PROJECT_BRIEF.md is the governing document and supersedes every earlier
instruction, including this file. Read it before any task. In particular, the
earlier rules requiring French and English editions of every resource and a
footer AI-content notice are withdrawn: follow the language policy and the
no-visible-AI-notice rule in the brief. Preserve equations and illustrations
when translating PDFs.

Interactive maths slides: read `.claude/skills/slides-interactive-math/SKILL.md`
and then `.claude/skills/slides-interactive-3d-math/SKILL.md` before building
or changing any slide.

# Repository rules

- Edit `site/` (never the `dist/` copies) and `content/data/manifest.json` (never `catalog.json`,
  `resources-data.js` or `RESOURCE_PROVENANCE.json`). `dist/` is the served folder, committed because the host has no
  build step; `make site` copies `site/` into it.
- Never write owner, school, teacher or city names, e-mail addresses, or personal-storage URLs or IDs anywhere
  (code, data, docs, PDFs, commit messages). `tests/banned.py` checks hashed phrases; do not add the plain names to any
  file, including guard lists.
- French TeX units are the source; English units are generated from reviewed translation tables
  (`docs/ADR-0001-tex-i18n.md`). Translate prose only: never maths, TikZ, listings or `\includegraphics`.
- No em-dashes in new visible text. No textbook statements reproduced. Visual design: see `docs/DESIGN_V3.md`.
- Before pushing: `make check` must pass. Ask the owner before launching expensive agent batches.
