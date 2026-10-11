# Site editing requirements

The owner explicitly forbids links from this or any other website to their
Google Drive or another personal space. Do not expose private folder/file URLs,
identifiers, or links in HTML, client-side catalogues, downloaded documents, or
PDF annotations. Host resource copies within the Site. Contact links are an
exception only in a specific, justified case authorised by the owner.

Maintain French and English editions of every downloadable resource. Keep the
single discreet AI-content notice in the footer; avoid repeating warnings in
resource cards. Preserve equations and illustrations when translating PDFs.

# Repository rules (redesign, October 2026)

- Read `docs/ARCHITECTURE.md` and `docs/HANDOFF.md` first. Edit `site/` (never `dist/` copies) and
  `content/data/manifest.json` (never `catalog.json`, `resources-data.js` or `RESOURCE_PROVENANCE.json`).
- Never write owner, school, teacher or city names, e-mail addresses, or personal-storage URLs or IDs anywhere
  (code, data, docs, PDFs, commit messages). `tests/banned.py` checks hashed phrases; do not add the plain names to any
  file, including guard lists.
- French TeX units are the source; English units are generated from reviewed translation tables
  (`docs/ADR-0001-tex-i18n.md`). Translate prose only: never maths, TikZ, listings or `\includegraphics`. FR and EN
  PDFs keep equal page counts.
- No em-dashes in new visible text; one mint accent on the site. No textbook statements reproduced.
- Before pushing: `make check` must pass.
- Ask the owner before launching expensive agent batches.
