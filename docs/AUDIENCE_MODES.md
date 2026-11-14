# Audience modes: visitor, student, teacher

Owner brief of 13 November 2026. Three audiences, chosen per device, no account.

| Audience | Opens on | What changes |
|---|---|---|
| Visitor (default) | `#home`, visitor home | No class is assumed. A figure to move at once, the doors of discovery (laboratory, stories, curiosities, timeline, challenges, plus the pathways and Olympiads where the product has them), then the two working audiences. |
| Student | `#home`, student home | Class, then chapter; "continue" link to the last chapter; review; past papers. |
| Teacher | `#teacher` (En classe) | The mode bar Préparer / En classe / Détente and the in-class dock (`docs/TEACHER_STRUCTURE.md`). |

## Rules

- The default is the visitor, on every device and in both products. Opening the site stores nothing.
- A choice is stored on the device (`localStorage` key `mx-teacher-entry`: `visitor`, `student` or `teacher`) and wins
  from then on. It is the device's own default; the settings of the teacher dashboard can clear it.
- Switching is always one menu away: the profile button of the header (`.audience-menu`), on every page. The visitor
  home also offers "Je suis élève" and "Je suis professeur"; the mode bar keeps "Espace élève" and the footer
  "Espace professeur".
- Only an empty address is redirected, and only for the teacher audience (to `#teacher`). Explicit links always open
  what they name.
- Visitor and student share `#home`; a change of audience redraws the page with no change of address.

## Why these designs

- Visitor: a first-time reader has no class to declare and should meet the site's thesis before any form: mathematics
  is seen and handled before it is stated. The first screen is therefore a manipulable figure and five verbs
  (manipuler, lire, s'étonner, situer, chercher), not a catalogue.
- Student: the fastest path to "my class, my chapter", because a student comes with a task. Discovery stays one link
  away but does not compete with the task.
- Teacher: built around a lesson (see `docs/TEACHER_STRUCTURE.md`).

## Privacy and "private" material

There are no accounts and the hosting is static, so nothing published can be protected: a mode is an entrance and an
ergonomic setting, never an access control. Consequently no private material is published at all. Corrections,
teacher versions of worksheets and marking schemes are public resources (generated in the browser from a seed, or
built from the public LaTeX sources), exactly as a published textbook's solutions would be. A test whose answers must
stay unknown to students has to use a seed the teacher keeps to himself: the series cannot be guessed without it, but
anyone who has the seed can regenerate the answers. Review records, drafts and audits live in the private repository
and are never deployed.

## Code

`site/js/teacher-entry.js` (`AUDIENCES`, `effectiveEntry`, `landingHash`, `homeHash`, `installEntrySwitch`),
`site/js/teacher-state.js` (`getEntry`, `setEntry`), `site/js/app.js` (`header()` profile menu, redraw on
`mx-teacher-change`), `site/js/welcome.js` (`homePage({audience})`, visitor home), styles in `site/styles/explorer.css`
(`.audience-menu`) and `site/styles/home.css` (`.home-visitor`). Tests: `tests/teacher-dashboard.test.mjs`,
`tests/modes.test.mjs`, `tests/dock-model.test.mjs`, `tests/teacher_browser.py`.
