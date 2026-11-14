# Teacher structure: three modes (owner priority, 11 November 2026)

Governs the teacher-facing shape of the site. Built from the owner's statement (see `PROJECT_BRIEF.md`), his classroom
setup and a research report on how a lycée maths teacher's work is organised. Programme facts are official (2026
programmes, épreuve anticipée, automatismes as a transversal part). Durations and phase orders are professional
convention, not official text, and the UI must never present them as rules.

## Classroom setup (owner)

Always a chalkboard or whiteboard; often a projector; printing possible beforehand but moderate. So: projector-first,
never projector-only. Every in-class phase has a board version (what to write or draw). Printing is optional, few
sheets, and the preparation page shows how many are planned.

## The unit of work

A chapter (séquence) runs about 8 to 12 sessions: diagnostic questions, an introductory activity, lesson, exercises,
a written check, a homework (DM), a supervised test (DS), then correction and remediation. A session (55 min) runs:
entry (0 to 3), automatismes ritual (3 to 10), homework correction (10 to 18), activity or lesson (18 to 35),
exercises (35 to 50), wrap-up and homework (50 to 55).

## Entrance: three audiences

Since 13 November 2026 a device that never chose is a visitor in both products (`docs/AUDIENCE_MODES.md`); the
teacher entrance (`#teacher`, mode bar visible) opens by default only on a device that chose the teacher audience
(profile menu of the header, "Je suis professeur" on the visitor home, or the footer link). Only the empty address is
redirected. Logic: `effectiveEntry`, `landingHash`, `homeHash` in `site/js/teacher-entry.js`.

## Information architecture

One mode bar in the header, always visible: **Préparer**, **En classe**, **Détente**. The mode is remembered on the
device. The class and chapter choice (`teacher-state.js`) is shared by all modes and one click away everywhere. The
existing sections (Apprendre, Explorer, Lire) stay as the library behind the modes; nothing is removed.

### En classe (`#teacher`, the existing dashboard becomes this)

A launch pad in session order, each phase one click from the page and at most one more to the content:

1. Automatismes (projectable, timed; the one-click series with remembered settings)
2. Correction des exercices donnés (the chapter's exercises with corrections)
3. Activité d'introduction (the chapter's laboratory experiment)
4. Cours (slides, then the chapter page)
5. Exercices (the chapter's bank, by level)
6. Outils (laboratory, curiosities, error to correct)
7. Bilan et travail à faire (what to give as homework, from the chapter's exercises)

Plus "Ma séance": the ordered blocks prepared in Préparer, each one click to launch; a switch **Projecteur / Tableau
seul** (tools key `view`). The switch only changes where the seven tiles lead; the layout and the tiles are identical
and the site gives no instructions on how to run the session (owner, 12 November 2026). Tableau seul opens the
non-projected form of each resource, and the in-class dock follows the same view (`launchpad({..., view})`):

| Phase | Projecteur | Tableau seul |
|---|---|---|
| 1 Automatismes | `#automatismes/go` (timed projection stage) | `#automatismes/list` (numbered list of the series questions, answers hidden behind a "Réponses" button, "Projeter" one click away) |
| 2 Correction | bank of the chapter | same (the answer-key list) |
| 3 Activité d'introduction | chapter experiment `#lab/...` | same |
| 4 Cours | slide player of the chapter if a deck exists | chapter page `#chapter/<id>` (or the class lessons), never the player |
| 5 Exercices | bank of the chapter | same |
| 6 Outils | `#lab` | same |
| 7 Bilan | bank of the chapter | same |

`#automatismes/list` takes the class, chapter and remembered defaults like `/go`, opens the list in large type with
answers hidden, projects nothing, and rewrites the address to `#automatismes`.

One screen, no endless scroll (owner, 12 November 2026). The page is: class and chapter selects with the switch, the
seven tiles (4 + 3), and "Ma séance" as one row that scrolls sideways. Below, two collapsed disclosures: "Récents et
favoris" and "Réglages de cet appareil" (remembered automatismes defaults, start page choice, export, import, clear).
Removed as duplicates: the timed-series button (tile 1 is that one click), the dashboard search (the header has it) and
"Par activité" (the header menus and the tiles reach every page).

A compact in-class dock (previous, next, back to the pad)
on tool pages, hidden in full-screen projection and brought back by a tab on the screen edge.

### Préparer (`#prepare`)

The teacher has time: choose and assemble. Chapter sheet (prerequisites, errors to expect, resources by phase), a
séance builder (add resources from the search index, order them, durations against 55 min, print count with a
gentle warning above 3), then **Évaluer**: fiches et évaluations (DS, interrogations, subjects A and B), annales,
common errors as remediation. The séance saved here is the one offered in class.

### Détente (`#relax`)

Stay sharp, read, wonder: biographies, stories, curiosities, Olympiad problems, laboratory exploration, a random page.
Independent of the class.

## Rules for every build task

- Same state as today: `teacher-state.js` (device-local, no account); one new key for the séance, with export, import
  and clear covering it.
- Pure logic in its own module with tests; DOM thin; strings are `[French, English]` pairs; no em or en dashes in copy.
- No removal of existing routes; the student home stays the default entrance unless the device chose the teacher one.
- Cahier tokens only (black, white, one accent, square corners). Large targets (44 px) and readable at projector
  distance in the in-class views. Works at 320 px.
- Judge by click count from opening the site in class; a test asserts the one-click paths.
