# Automatismes: competencies of the generators

Single source: `site/js/exercises/competencies.js` (`COMPETENCY_OF`: one line per generator, main competency first).
Pinned by `tests/competencies.test.mjs`: a new generator needs its line there, and a change of the table below must be
made in the test and here together.

## The competencies

The lycée programmes name six: chercher, modéliser, représenter, raisonner, calculer, communiquer
[VERIFY — check the programme texts on Eduscol / BO; no bulletin reference is recorded in `PROJECT_BRIEF.md`].
"Communiquer" is left out: a generated question with a short answer cannot assess it.

How a generator is classified (by reading its generated instances, not by keyword):

| Competency | Main competency of a generator when the crux is... |
|---|---|
| calculer | carrying out a technique (derivative, equation, limit, exact value) |
| représenter | reading or producing a table, tree, graph, interval; changing register |
| modéliser | turning a described situation into an expression, equation, sequence or law |
| raisonner | true/false with justification, find the error, counter-example, implication, proof |
| chercher | open investigation. **No generator has it as main competency, on purpose**: a timed starter is not an investigation. Investigations live in the chapter tab "Manipuler" ("Chercher avant de formaliser") and in the laboratory. |

## Coverage (main competency: all generators / short ones), 13 November 2026

| Class | chercher | modéliser | représenter | raisonner | calculer |
|---|---|---|---|---|---|
| Seconde | 0 / 0 | 9 / 4 | 11 / 5 | 38 / 3 | 67 / 43 |
| Première | 0 / 0 | 10 / 2 | 5 / 2 | 20 / 10 | 51 / 24 |
| Terminale | 0 / 0 | 6 / 2 | 4 / 2 | 29 / 14 | 75 / 25 |
| Maths expertes | 0 / 0 | 3 / 1 | 8 / 3 | 25 / 3 | 42 / 19 |
| STMG | 0 / 0 | 14 / 2 | 4 / 2 | 17 / 1 | 26 / 19 |

Audit: the bank is dominated by *calculer*; *représenter* and *modéliser* are thin, especially among short generators.
`site/js/exercises/templates-competences.js` adds ten short generators for the weakest cells (reading a table of
variations, a tree, a law, convexity from the sign of $f''$; translating an evolution into a recurrence, an exponential
or a transition matrix; an area to optimise; a short true/false on evolutions). Remaining gaps: short *représenter* and
*modéliser* items in every class, short *raisonner* items in Seconde, Maths expertes and STMG.

Illustrated starters (14 November 2026): `site/js/exercises/starter-visual.js` adds twenty short starters with a figure
(vectors, lines, parabolas, a scatter plot with its fitted line, the graph of $f'$ or $f''$, the complex plane), for the
starter pool only. They are not generators of `TEMPLATES`, so the table above does not count them. Main competency:
*représenter* for a reading (13), *raisonner* for a property deduced from the figure (7); lines in `competencies.js`.
About 30 % of a series shows a figure when the class, chapters and topics allow it (at most one per illustrated starter).

## Where it shows

- `#automatismes`: optional filter "Compétences" (none ticked: all; the series is then identical to before). A note
  says when a ticked competency has nothing under the current class, chapters and "short only", and where "chercher"
  lives instead.
- Teacher documents only: the competency label after each answer in the list under the answers and in the printed
  key. Never on the projected stage nor on the student sheet.
