# Design v3: "Cahier"

Written 13 October 2026. All earlier design instructions (brief section 6, the v2 "Atelier" direction) were discarded by the owner. This plan starts from what the site is for. Rules outside design (anonymity, no personal links, no visible AI notice, publication gate, languages) are untouched.

## 1. What the site is for

A free, static, bilingual maths resource for lycée students and their teachers. Maths is learned by manipulating an object first, then reading the rule. Each of the 47 chapters has: a guide with one central idea and a figure to manipulate, practice with a hint and solution, and PDFs (lessons, exercises, solutions, fluency drills). Around the chapters: 9 laboratories, 8 challenges, curriculum pathways, a slide for the quadratic chapter, a file library.

## 2. Who uses it, and for what

| Person | Situation | Job to be done |
|---|---|---|
| Student | Phone, 3G or shared data, often outdoors or at night | Find today's chapter in under 10 seconds. Understand it by moving something. Practise. Download or open a PDF without surprises. |
| Teacher | Laptop and projector in a bright room, or phone at home | Pick a chapter, project the figure at a readable size, open the teacher solutions, print. |
| Curious or olympiad student | Any device | Play in a laboratory, try a challenge, see where a topic leads. |

## 3. What this implies (brainstorm, kept short)

- The site is a tool and a library, not a brand story. The thing people do most is choose a chapter, so the first screen must be the chooser. A marketing hero and decorative sections delay the main task and cost bytes.
- The philosophy ("manipulate first") must still be visible at first sight. The chooser therefore carries a live preview: pointing at a chapter shows its real figure and central idea beside the list. Nothing is invented for the home page; it reuses each chapter's own figure.
- 47 chapters is a list, not a gallery. Compact rows with an information scent line ("Cours, exercices, corrigés") scan faster than 47 tiles, and fit a phone screen.
- The figure is the content. It gets the biggest area on every page, with its numbers beside it. Everything else is quiet.
- Projector and sunlight need high contrast and a light default. Night study needs a dark option. Both follow the system setting unless the user chooses.
- Data is expensive. Two font families only, no decorative effects, no scripts that run for show, previews built on demand, and every download shows format, language and size before it is opened.
- Trust comes from restraint and honesty: experiments are labelled as evidence, not proof; coefficients are simplified; real numbers sit next to every picture.
- Teachers project. A full-screen button on every figure is a real need, not decoration.
- Returning students want to resume. The site remembers the last chapter and which chapters were opened, on this device only.

## 4. Principles

1. Find first, then do. The chooser is above the fold on every device.
2. The figure is the page. Largest area, plain background, numbers beside it.
3. Quiet chrome. One accent. Meaning is carried by semantic colour only. Borders, not shadows.
4. Readable anywhere: 18 px text, 7:1 body contrast, 44 px touch targets, light and dark.
5. Cheap to load, cheap to run.
6. One skeleton for every page: header, breadcrumb, title, steps, content, next step.
7. Motion only when it explains a state change (about 120 ms). Nothing moves for show. Reduced motion removes it.

## 5. Information architecture

Unchanged routes and sections (Cours, Laboratoire, Défis, Parcours). New structure inside them:

- Home (Cours): level control, search, chapter list, preview stage; below, one line to the other three sections. Workshops and exercise banks sit in a collapsible group under the list.
- Chapter: breadcrumb, title, four steps (Comprendre, Expérimenter, S'entraîner, Documents), content, previous and next.
- Laboratory: experiment on the left, journal (prediction, conjecture, check) on the right, rail of experiments.

## 6. Visual language

Metaphor: a maths notebook on a desk. Light theme "Jour" is clean paper; dark theme "Nuit" is a night desk. Graph-paper lines appear only inside figure panels, where they have a job.

Tokens (both themes defined in `dist/explorer.css`):

| Role | Jour | Nuit |
|---|---|---|
| page / surface | #f5f6f8 / #ffffff | #0c111b / #131a28 |
| ink / secondary / muted | #141c2b / #3a475c / #55637a | #e8edf6 / #c3cde0 / #97a5be |
| line / control border | #d5dbe5 / #8693a8 | #26324a / #5f7192 |
| accent (studied object, actions) | #1d4ed8 | #7aa2ff |
| second and third objects | #b45309, #6d3fc0 | #f0b04d, #b9a6ff |
| positive / negative | #136c46 / #b42318 | #5fd0a0 / #ff8a80 |

Type: STIX Two Text for headings and all mathematics (same letterforms as the formulas and the PDFs); Atkinson Hyperlegible for interface and body (designed for low vision). Scale 1.2 from 18 px. Tabular numerals.

Shape: containers 12 px, controls and chips 8 px. Spacing on a 4 px grid. Elevation: borders only. Icons: Phosphor, bold, inline.

## 7. Components

Button (primary, secondary, quiet), segmented control, search field, chapter row (default, hover, selected, seen), preview stage, figure panel (with full-screen), result stat, step tabs, callout (note, success, warning), details, form fields, tab bar (phone), theme and language switches. All have a visible 3 px focus ring and work with keyboard.

## 8. Success checks

- Home: chapter chosen in two actions (level, row) with no scrolling on a 390 px phone.
- No horizontal scroll at 320, 390, 768, 1440 px; 200% text zoom still works.
- Contrast: body 7:1 or better, large text and controls 3:1 or better in both themes (checked by script).
- Full keyboard path on every page; figure handles move with arrow keys.
- Transfer size of the home page without PDFs stays small (no images, 5 font files).
