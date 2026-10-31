# Malagasy T10 and T11 S authoring sources

This directory imports the original author-owned maths teaching material from [Mada-Boky](https://github.com/raantss18/Mada-Boky/tree/main/Livres), upstream revision `cea17681491d255e888393bac9b5f0b1f394a8f0`. The owner explicitly confirmed sole authorship for T10 and T11 on 31 October 2026. These source chapter and correction files are intentionally kept in a prepublication area; do not infer that their textbook layout, exercises, explanations or figures have been independently verified.

- `source/t10/chapters/`: 9 source chapters, with 9 entry activities in `activities/` and matching teacher `solutions/`. Original custom LaTeX macros are not yet migrated.
- `source/t11-s/chapitres/`: 20 source chapters plus 4 assessment documents, with teacher corrections in the chapter sources. Original custom LaTeX macros are not yet migrated.
- `chapters.json`: stable chapter identifiers and paths to canonical teaching source for two prospective curricula. These are **not** the live site's `manifest.json` entries.

## Adaptation contract

Work one bounded chapter at a time: validate against the appropriate official Malagasy programme; write an experiment-first Web edition with direct manipulation, coherent course/activities/practice/corrections, downloadable student and teacher PDFs with native Maths-explorer LaTeX sources, an exploratory interactive slide and an independent 16:9 Beamer lecture edition. Confirm notation, claims and calculations with code, browser/phone/keyboard checks, two independent AI audits, and the publication gate in `PROJECT_BRIEF.md` before adding any files or chapters to the served catalogue. Keep audit evidence private.

This index represents *intake and preparation*, not 29 completed web courses. T11 OSE and T11 L source books were not found in the specified upstream `Livres/` snapshot. The English lesson expansion remains **on standby**.
