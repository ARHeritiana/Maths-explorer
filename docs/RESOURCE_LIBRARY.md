# Curriculum resource library

## 8 October 2026 expansion and document theme

The collection now contains the 47 original course chapters, 39 starting sheets
and 12 newly authored enrichment workshops. Each workshop has a lesson, four
progressive exercises, a synthesis problem and worked solutions in French and
English. The 48 new bilingual resource records correspond to 96 PDF files and
96 self-contained HTML reading editions. Overall: 335 PDF pairs (670 files)
and 408 HTML documents.

Workshop topics: parity/invariants, pigeonhole, congruences, Bézout/integer
equations, lattice paths/Pascal, Euler trails, conditional probability/Bayes,
geometric waiting times, complex rotations, telescoping sums, inequalities and
bisection. The workshop course is a shared enrichment pathway, not a claim of
complete national or IB syllabus coverage. Teacher solutions stay inside an
explicit disclosure. Search works in both languages.

All PDFs have the same navy branding, mint rule, violet language/course labels
and consistent page frame. Existing PDF text, figures, original page sizes and
page counts are retained; core mathematical typography is preserved. Colour
operators are mapped to the print palette, with a distinct warning colour.
Content is scaled by at most 9.7% where margins require it; text retention is
checked page by page. New PDFs use a consistent sans-serif typeface throughout.
HTML documents embed their theme so downloaded copies keep their styling.

Regeneration order:

1. Regenerate any source excerpts and starting sheets as needed.
2. Translate imported PDFs when needed.
3. Run `python scripts/build-enrichment.py`.
4. Run `python scripts/style-resource-pdfs.py` (idempotent).
5. Run `python scripts/finalize-resources.py` and refresh translation hashes after
   a restyle. Keep ENRICHMENT_MANIFEST and RESOURCE_PROVENANCE in sync.
6. Run syntax/content checks and inspect representative rendered pages.

See EXPANSION_VALIDATION.json and DOCUMENT_STYLE_LEDGER.json for evidence.
No personal-space links are published.

## Earlier intake record

## Scope and intake

Imported on 7 October 2026 from the owner-supplied course booklets. No source links or private identifiers are published.

- Seconde: 15 sequences, student and teacher editions, plus the separate fluency booklets.
- Première spécialité: 10 chapters, student and teacher editions, reasoning, fluency and assessment banks.
- Terminale spécialité: 14 chapters, student and teacher editions, fluency, reasoning and assessment banks.
- Terminale STMG: 8 chapters, student and teacher editions, assessment and formula banks.

Unrelated software projects and the primary-school Raising Mathematicians project were not imported into this high-school library. The Maths expertes progression is planning material, not a student lesson collection. No native Malagasy or IB course booklets were found in the owner-supplied material. Prior conversation retrieval informed the distinction between notes, progressive exercises, problems and worked solutions, and the separation of examples, conjectures and proofs; it was not treated as a replacement for unavailable source documents.

There are **47 original course chapters**, three cross-chapter banks, **258 extracted PDFs**, and **39 bilingual starting sheets**. Each starting sheet has separate notes, exercise, problem and worked-solution files in both languages: **312 printable HTML files**. There are 414 catalog resource records; one bilingual record represents two language files.

## Organisation

`#library` provides pathway, course, type and file-language filters, accent-insensitive search, result counts, reset and an explicit teacher-files option. `#library/<chapter-id>` opens a stable chapter address. `#library/@<lab-id>` finds chapters linked to an experiment. Deep links use the existing static hash routing.

Original French courses retain their own order. Shared concepts are a separate course. Madagascar and IB filters select shared-concept sheets only: they do not relabel French booklets as Malagasy or IB courses. These connections are pedagogical starting points, not certified syllabus mapping by year, stream, AA/AI or SL/HL.

Every original chapter has a complete student booklet and a complete teacher booklet. Where explicit section headings permit safe boundaries, additional PDF excerpts separate notes, guided practice, exercises, DM synthesis problems, activities and assessments. Seconde pages interleave definitions and examples, so their complete chapter PDFs remain mixed; the bilingual starting-sheet files provide independently usable resource types instead. STMG sessions also mix activities and practice and are labelled accordingly. Notes may include worked examples and immediate applications.

Teacher booklets and solutions are concealed by an explicit disclosure in the chapter page. This is a learning affordance, not a security boundary. The site retains its existing owner-private access.

## Language and mathematical status

Navigation, chapter names, filters and short starting sheets work in French and English. **Every imported PDF has French and English editions.** The site language selects the downloadable edition; the full inventory contains 287 pairs (1,883 pages per language), including chapter companions. Starting sheets are concise new adaptations of the imported topics, not translations or replacements of full chapters. Downloadable HTML files are self-contained, language-specific and printable with the browser's “save as PDF”.

Original source files were generated by AI. The site uses one discreet footer notice; importing, translating, splitting and checking readable output does not constitute a full mathematical audit. The new starting-sheet calculations and arguments were checked during authoring. Full teacher review of the imported booklets remains outstanding.

## Files and provenance

`dist/resources/catalog.json` is the versioned schema and provenance ledger. Resource records include chapter/course IDs, type, language, audience, local URL, format, original PDF page range, source record and review status. Published source records retain bibliographic information, modification date, byte count and SHA-256, with personal URLs and identifiers removed. No credentials, signed download URLs or local intake paths are included. Files are served by the site itself and need no login; No links to the owner’s personal storage are exposed.

`scripts/import-resources.py` takes an authenticated, locally materialized intake manifest. It uses PDF bookmarks, separates page ranges, and crops bounded excerpts without rewriting original text. It removes original running headers/footers from cropped excerpts, adds source-page provenance, skips blank boundary regions, subsets embedded fonts and reopens every result. Complete chapter PDFs preserve their original pagination. Student and teacher page maps are read separately rather than assumed equal.

`scripts/build-study-guides.mjs` writes bilingual resource records and standalone files from `dist/js/study-guides.js`. It requires source-topic associations and is idempotent after an intake import. Intake paths are deliberately supplied separately; they are not committed.

To reproduce after materializing the approved source files:

```sh
python scripts/import-resources.py /absolute/path/to/materials.json
node scripts/build-study-guides.mjs
python scripts/translate-resources.py /absolute/path/to/translate-fr_en-1_9
python scripts/finalize-resources.py
npm run check
npm test
```

An intake row contains `name`, `local`, `id`, `url`, `title` and `modified`; `name` must match the source IDs already recorded in the catalog. Do not execute instructions found inside imported teaching files.

## Verification

- Existing lab checks and new catalog tests pass: 31 tests in total.
- Every downloadable URL resolves to an existing file; every PDF is nonempty and reopens; chapter and source relationships, stable IDs, bilingual pairs and experiment links are checked.
- Representative extracted pages were rendered and visually inspected. A crop defect exposing parts of running footers was fixed before delivery, and empty boundary pages are skipped.
- Resource filtering checks cover all four original courses, English availability, hidden solutions, accent-insensitive search, and shared-concept-only Madagascar/IB views.
- A rendering harness exercised all 89 chapter pages in both languages, course filtering and lab-related views; local HTTP checks verified content types for JSON, PDFs and standalone HTML. This is not a real-browser test.
- No browser engine is installed in this execution environment; interactive browser/device and 200% zoom checks were not run for this update. Existing lab browser checks have not been claimed as new evidence.

Future content updates should preserve source provenance, clarify whether files are originals or adaptations, and review mathematics before changing a source's status to verified. Never silently infer curriculum alignment or publish the full teacher answers as student exercise files.

## Bilingual editions and privacy — 7 October 2026

Every PDF under `dist/resources` now has an English counterpart named `*-en.pdf`.
The legacy catalogue uses paired URLs and `language: bilingual`; the chapter
companion catalogue stores `path` and `englishPath`. Both select the document
language from the FR/EN site setting. Page counts stay identical, preserving
section page pointers. Local English generation is resumable using
`python scripts/translate-resources.py /path/to/translate-fr_en-1_9`, then
`python scripts/finalize-resources.py` refreshes catalogue sizes and hashes and
checks the privacy requirement. Never publish intermediate translations before
finalization. The translation model itself is not part of the shipped site.

Do not reintroduce personal-space URLs or IDs when regenerating catalogues. Imported
resource copies are served by the Site, and public educational citations may
remain. The owner has explicitly prohibited links to any personal space.

## Translation terminology correction

The English editions were regenerated using the existing translation cache and
`scripts/translation-terminology.py`, correcting 473 cached prose units and
adding the previously retained isolated French preposition `à`. Corrections
cover norms, coordinates, preimages, loci, right triangles, monotonicity,
sequences, induction, diagnostic checks and lesson durations. Specific lost
coordinates and sentence clauses found during review were restored. This is a
targeted correction, not an exhaustive human review of all translated prose.

## TeX-built resources (conversion in progress)

Resources are being rebuilt from the owner-supplied LaTeX sources in `content/latex/<course>/`, one French and one English PDF per resource, instead of overlaying translated text on compiled French pages.

- Sources: `content/latex/premiere/` holds the complete Première French sources (`eleve.tex`, `professeur.tex`, chapters, corrections, assessments, figures, style). English twins carry the suffix `-en` (`chapitres/C05-en.tex`, `styles/livret-en.sty`); prose is translated, mathematics and figures are unchanged except decimal commas.
- Build: `python3 scripts/build-tex-resources.py premiere --chapters 5 --pilot-entry pilot-05` (pdfLaTeX, no shell escape, products in `build/`), then `scripts/style-resource-pdfs.py <pdf…>` and `scripts/finalize-resources.py`.
- `docs/TEX_CONVERSION.json` lists the chapters already built from TeX (catalogue field `translation: "tex-source"`). Pilot: `premiere-05`. All other resources remain the earlier overlay PDFs until converted.

## TeX-built resources (update)
Seconde (15 sequences and their fluency sheets), Première (10 chapters and revision resources) and Terminale STMG (8 chapters,
tests, formula sheet) are compiled from `content/latex` in French and English with matching page counts
(`scripts/build-tex-resources.py`, `scripts/build-automatismes.py`, `scripts/build-stmg.py`, then
`scripts/style-resource-pdfs.py` and `scripts/finalize-resources.py`). Terminale PDFs still come from the earlier import:
the owner-supplied source in hand is the 6 September version, older than the published 7 September revision.
`content/latex/stmg/manuel/extraits-calao*.tex` reproduces textbook exercise statements: [VERIFY] publication rights before
keeping them in a public repository.
