# ADR-0001: French and English TeX units as a generated pair

Status: **accepted** (decided by the owner, recorded 11 October 2026).

## Context

Every TeX unit exists as two hand-maintained files (`x.tex`, `x-en.tex`; 218 `.tex` pairs plus one style twin). Nothing guarantees that the
English file keeps the same mathematics, figures and listings as the French one; `scripts/check-stmg-twins.py` checks this
for the 4 STMG exercise files only. Prose drifts, and fixes made in one language are not carried to the other.

## Decision

1. **Pairs, not mixed files.** Each unit is compiled from two files, `unit.fr.tex` and `unit.en.tex`. A single file holding
   both languages is not used.
2. **The French unit is the source.** It is written in the canonical environments of `content/tex/core/` and holds all
   mathematics, TikZ, listings and `\includegraphics`.
3. **The English unit is generated** by the twin tool (`python -m mxbuild twin`, `build/mxbuild/twin.py`) from the French unit and a reviewed translation table
   (`<unit>.en.json`, stable segment ids, English text, review status). The generated file starts with
   `% GENERATED, edit the French unit or the translation table` and is committed so people can compile locally.
4. **Prose only is translated.** The tool splits the French unit into a locked skeleton and prose segments. Inline maths
   inside a segment becomes a placeholder (`[[m1]]`); the English text may move placeholders but must use each exactly
   once. Locked: display maths, maths environments, TikZ/pgfplots code, listings, verbatim, `\includegraphics`, labels,
   references, inputs. Translatable inside locked material: `\text{}`/`\mathrm{word}` in maths and the text slots of
   figures (node text, axis labels, titles, legend entries).
5. **The tool fails** when a segment has no reviewed translation, when the English text adds, drops or alters a
   placeholder, or when the regenerated English unit's locked material differs from the French one. Language conventions
   are applied by rule, not by hand: decimal separator (`0{,}5` becomes `0.5` in English), French spacing before high
   punctuation, and dates through `\mxdate{YYYY-MM-DD}`.
6. **Labels in the class** may use `\mxtr{fr}{en}` inside `mx-i18n.sty` only; content units never do.
7. **Invariant kept as a test:** numbers inside maths and figure code are identical for every pair (generalising
   `check-stmg-twins.py`), and the French and English PDFs of a unit have the same page count.

## Migration of the existing 218 pairs

Existing English twins are aligned paragraph by paragraph into translation tables (status `aligned`, not yet `reviewed`).
A pair is refused when its skeleton or its maths differ; refused units are listed and fixed by hand before migration.

Prototype measurement (first prototype, since replaced by `build/mxbuild/twin.py`; before any source change): **164 of 218 pairs align
automatically, 12,777 segments.** Of the 54 refused pairs, 39 differ only in ways the new system removes
(18 entry, main and preamble files, which are replaced by the class and generated mains; 21 units with per-language
figure inputs, include lists, STMG dates or decimals in table text); the other 15 are real divergences to review: Automatismes `ch02`, `ch13` (an English-only `\clearpage`), Terminale `E5` (a `\clearpage` moved
inside a list), STMG `exo-A` (maths differ), and 11 Enrichment units, which are regenerated from
`content/data/enrichment.json` instead.

## Consequences

- English prose is edited in the translation table, never in `unit.en.tex`.
- A French edit that changes a segment invalidates its id; the build fails until the English is supplied and reviewed.
- Page-alignment hacks (`\clearpage` in one language only) become impossible; layout differences must be solved in the
  class (a lint forbids `\clearpage`/`\newpage` in units).
- Proof-reading English becomes a review of one JSON table per unit, with the French segment beside it.
