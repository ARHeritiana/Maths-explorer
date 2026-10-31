# Maths Explorer: redesign proposal
Date: 27 October 2026
Status: revised implementation proposal informed by supplied reference screenshots. Milestones 1 and 2 are implemented (see `HANDOFF.md`, 31 October 2026); milestones 3 and 4 and all human acceptance are not.

## Decision
Replace the welcome splash and the six-step chapter interface with a useful mathematics workspace. Make it easy to find a topic, understand it, manipulate an object, practise, and obtain classroom materials. Completeness and mathematical quality take priority over adding more features.

Design read: an accessible, phone-first educational site for lycée learners and teachers, with a colourful, illustrated catalogue and precise, readable learning pages. Mathematical figures supply its distinctive imagery. Proposed design variance 5/10, motion 2/10, density 4/10. Keep the static architecture and existing accessible primitives.

This proposal combines Maths Explorer source inspection with readable Mission Maths screenshots supplied by the owner. The reference homepage shows illustrated chapter cards, a named tool collection, explicit action links and a dedicated Grand Oral promotion. The tools section advertises exports for a table generator. These are visible presentation observations, not verified claims about tool behaviour, lesson quality or curriculum completeness. Live Mission Maths browsing remained unavailable.

Adopt its concrete resource entrances and visual identity. Improve on the small text, persistent sidebar and desktop-like density visible in the phone captures. Do not copy its artwork or reproduce a full-screen promotional banner. Before implementation, inspect the current Maths Explorer homepage, catalogue, chapter and laboratory at phone and desktop sizes.

This revision supersedes the earlier preference for chapter rows as the default presentation. Illustrated chapter cards are now the primary browsing mode; a compact list can be an optional alternative.

## 1. What to discard

| Current feature | Decision | Replacement |
|---|---|---|
| Welcome screen with two animated canvases, “Tonga soa / Bienvenue” and a single “Entrer” link to Curiosités | Remove as the homepage layout | Useful introduction, topic search and direct access to courses and experiments. Keep Tonga soa as a small greeting and reuse mathematical artwork in relevant activities. |
| Six numbered chapter stages: prepare, experiment, understand, practice, review, documents | Remove the compulsory-looking sequence and numbered rail | One chapter overview with direct access to Cours, Manipuler, Exercices and Documents. Guidance is a short optional suggestion, not six screens to visit. |
| Automatically treating answered examples as practice when no dedicated tasks exist | Stop counting this fallback as independent practice | Keep “Refaire cet exemple” as optional retrieval practice; author genuinely new exercises and transfer problems. |
| Generic self-check lists as the principal chapter bilan | Replace | A small set of chapter-specific questions with answers, explanations and links to the relevant concept. |
| Gradient headings, multicolour heading rules, hover tilts, wiggles and continuously pulsing selected items | Remove decorative effects | Solid high-contrast text, consistent selection styling and brief state feedback. Preserve animation that explains mathematics. |
| Repeated catalogue entrances and competing lists of formats | Consolidate presentation | A canonical chapter destination; resources and slide indexes link into it while retaining existing URLs. |
| Large progress dashboards, badges and streaks | Defer | Optional local resume and clearly labelled personal bookmarks. These do not certify mastery. |
| Expanding advanced curiosities while priority courses lack complete teaching material | Pause expansion | Finish priority chapters first; keep existing useful curiosities available. |

The existing chapter stages are freely clickable, not technically locked. The criticism is the imposed six-part presentation and its repeated navigation, not a claim that the application prevents skipping.

Source anchors: `site/js/welcome.js`, `site/js/chapter-sequence.js`, `site/js/sequence-model.js`, `site/styles/explorer.css`, and `docs/DESIGN_V4.md`.

## 2. Homepage and navigation

Keep the recognised primary sections Apprendre, Explorer and Lire. Keep the home neutral about school level, with curriculum selection inside Cours.

Proposed homepage, in order:
1. Compact header with the existing wordmark, Apprendre / Explorer / Lire, and an accessible phone menu.
2. Short introduction: “Comprendre les maths en les explorant.” One sentence explaining the offer, a prominent search field, and direct links “Trouver un cours” and “Explorer les outils”.
3. A compact mathematical illustration or small interactive example. Search and a useful entrance must be visible before scrolling on a typical phone; artwork must not postpone them.
4. “Les outils pour comprendre”: six curated existing tools with one-sentence purposes and specific action links; “Tous les outils” opens the full collection.
5. “Explorer une idée”: a small illustrated selection of existing experiments and curiosities.
6. Reading links and a restrained footer. “Reprendre” appears only when a local last-visited resource exists.

Keep curriculum and class selection inside Cours. After choosing them, show an illustrated chapter grid: title, accurate mathematical image, one-sentence learning goal, and available resource types. Whole cards open the canonical chapter page. Do not display all curricula on the neutral homepage.

Tool labels describe an action, not an internal module name. Examples to map to existing capabilities:
- “Explorer une fonction”: move parameters and observe the graph.
- “Comprendre une intégrale”: compare area approximations.
- “Simuler le hasard”: compare frequencies and probabilities.
- “Étudier une suite”: explore explicit or recurrent behaviour.
- “Manipuler la géométrie dans l’espace”: rotate and inspect objects.

Verify actual capabilities before publishing descriptions. A table builder or binomial calculator is a candidate only if the implementation exists or is explicitly scheduled. Never populate the catalogue with nonfunctional buttons.

Each tool page contains a concise question, the working figure, nearby controls, an explanation and reciprocal links to relevant chapters. Use actions such as “Explorer les limites” or “Ouvrir les exercices”, not generic “Entrer”.

Search should return topic names with resource type, curriculum/level when applicable, and language. Handle accents, common synonyms and empty results. A search for a concept should not require knowing whether it lives in a laboratory, chapter or curiosity.

Course navigation: curriculum, then class/series, then chapters. Remember choices locally with an obvious reset. On phones, opening a chapter must be a direct tap; previews must never be required.

Keep current hash links working. Existing chapter stage links should resolve to corresponding sections of the redesigned chapter, including direct links to exercises and documents.

## 3. Chapter page: four useful destinations, no forced workflow

Desktop: breadcrumb, chapter title, one-sentence purpose, then a compact anchor navigation and readable content. Phone: one column, a concise section selector and no competing fixed bars hiding the content.

The four destinations are:
1. **Cours**: clearly authored explanations, definitions, theorem hypotheses, examples and proofs where appropriate.
2. **Manipuler**: a meaningful question, usable figure, direct manipulation, readable live values and optional hints.
3. **Exercices**: short practice, applications and problems, with progressively available hints and corrections.
4. **Documents**: student booklet, corrections, interactive presentation, lecture PDF and source download where available.

These are destinations, not a new mandatory four-step sequence. The chapter overview recommends an appropriate starting activity. Learners revising a method can go straight to it. Teachers can open a presentation or download a worksheet immediately.

Preserve the experiment-first teaching philosophy by offering a concrete introductory question before its rule in the suggested learning route. Provide enough guidance for novices; do not leave them to discover everything without support.

Put one relevant example beside each difficult idea. Replace generic “back to the course” links with the exact concept or example needed. Keep long proofs collapsible and accessible, with hypotheses visible.

A useful exercise exposes: statement, optional hint, worked solution, common mistake, and a new related question. A numeric checker must handle meaningful equivalent answers and invalid input correctly. Open proofs must never be labelled automatically correct from a single number.

Retain existing PDF and slide access, separate corrections, exact/approximate notation, and the distinction between experiment and proof.

## 4. Visual specification

Retain the existing blue identity and self-hosted Atkinson Hyperlegible body font. Use that sans-serif for navigation and headings; reserve STIX for mathematics and mathematical notation.

Proposed tokens:
- Background #f5f6f8; surface #ffffff; primary text #141c2b; accent #1d4ed8.
- Body 18 px, line height about 1.6, reading width 65–72 characters.
- Heading scale 24 / 32 / 40 px with responsive limits.
- Spacing scale 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
- Controls radius 8 px; substantial panels 12 px.
- One strong primary action per local task.
- Use colour for mathematical objects and meaningful states. Avoid cycling colours purely by card position.
- Keep the existing dark theme, with equivalent contrast and focus treatment.

Use illustrated chapter cards as the default catalogue view:
- Desktop: three columns in a centred container of about 1200 px.
- Tablet: two columns when cards remain readable.
- Phone below 600 px: one column; never shrink a desktop sidebar and grid to fit.
- Illustration ratio about 16:9. Titles are real HTML below the image, never baked into it.
- One mathematical idea per preview: parabola and roots, a probability tree, sequence terms, or a plane intersecting a solid. Derive accurate previews from existing mathematics where possible.
- Use stable topic colours with a restrained palette inside artwork. Keep navigation, typography and actions consistent across the site.
- Avoid photomontages, miniature textbook pages, decorative equations and repeated text within thumbnails.
- Show only supported formats, and keep technical metadata secondary.

A compact list view is optional for returning users. Tools use lighter cards with an icon or small diagram, a verb-led title, a one-sentence purpose and an explicit action. Reading pages retain a comfortable text layout.

Colourful does not mean every panel has a gradient. Use blue for site identity and varied colours for useful mathematical illustration. Keep learning surfaces neutral enough for figures, formulas and feedback to remain legible. A modest illustration-led banner is acceptable; a large rotating hero is not a priority.

Figures need enough height to manipulate comfortably; controls must remain near the figure. Put rare options behind a compact disclosure. Preserve direct pointer/touch manipulation, arrow-key equivalents, numeric or slider alternatives, and independent camera state.

Respect reduced motion; pause offscreen animation. Support 320 px widths, 200% text, visible focus and 44 px targets. Reading content must not depend on canvas alone. Use text, formulas and descriptions to communicate the mathematical state.

## 4a. Useful additions and explicit deferrals

Provide export only where it serves an existing task. Start with an accessible image export for supported graphs or figures, with readable labels and the chosen mathematical state. Add SVG or LaTeX output where technically faithful. Do not claim exports until tested; do not turn every resource into a format picker.

Grand Oral is a worthwhile future collection inspired by the visible reference promotion. Schedule it after priority chapters: mathematically grounded questions, prerequisites, outline, a useful visual and possible follow-up questions. Verify current examination requirements before authoring. Do not create empty navigation or imitate advertised content counts.

Keep already useful games and challenges accessible, but do not add timers as the default learning experience. Speed challenges are optional activities, not evidence of understanding.

## 5. Content completion programme

Do not equate a chapter title, PDF, generated slide deck or populated tab with a complete learning unit.

Create a private coverage matrix for each priority chapter with:
- official programme source and applicable school year;
- prerequisites and explicit learning objectives;
- introductory activity and linked interactive experiment;
- definitions, hypotheses, methods and required proofs;
- worked examples and common misconceptions;
- original exercises, applications and transfer problems;
- complete corrections and independent end-of-topic questions;
- student PDF, teacher/corrections PDF, source files and appropriate presentations;
- mathematical verification, independent reviews and publication readiness.

Keep review evidence and draft status in the private repository. Public interfaces show only available resources and straightforward availability messages, never internal review labels.

The current model builds web chapter sections from slide data. That is a useful adapter, but a presentation deck is not necessarily a complete explanation for independent study. Make chapter content the canonical structured teaching unit, with stable concept and exercise IDs. Generate or assemble the web view, PDFs and presentations from shared reviewed content where practical; do not maintain unrelated copies manually.

Eliminate content fallbacks from completeness calculations:
- Reusing an example is not a replacement for a dedicated exercise set.
- A general instruction to work on paper is not a dedicated introductory activity.
- A generic checklist is not a chapter-specific assessment.
- A download link is not evidence that its content covers the programme.

Preserve the owner's priority order:
1. Seconde, Première spécialité, Terminale spécialité, Maths expertes, Terminale STMG.
2. Malagasy Terminale: S, OSE, L.
3. Olympiad, progressively.
4. Remaining Malagasy curriculum.
5. International, including IB and SAT.
6. University basics last, subject to the governing brief.

First implementation pilot: reuse the existing quadratic chapter and workshop. Assess it against the completeness matrix, repair actual gaps, and use it to establish the new layout. Then prioritise missing material needed for imminent teaching, rather than generating all chapters superficially.

Language: French and Malagasy curricula in French; International in English; university in its original language; Olympiad separate and bilingual by default. Existing English editions remain available. **The bilingual goal for curriculum lessons is on standby and remains unfinished work.**

## 6. Research translated into decisions

- Guided discovery: Alfieri et al. (2011), 164 studies, favoured assisted discovery over comparison conditions (d = 0.30), while unassisted discovery performed worse than explicit instruction (d = -0.38). Add hints, explanation and worked examples; this does not validate a compulsory interface sequence. https://doi.org/10.1037/a0021017
- Retrieval practice: Yang et al. (2021), 222 studies and 48,478 students, reported g = 0.499 for classroom quizzing. Ask learners to attempt an answer before opening the explanation. https://doi.org/10.1037/bul0000309
- Feedback: Wisniewski et al. (2020), 435 studies, average d = 0.48 with substantial variation. Explain the mathematical error and a useful next action. https://doi.org/10.3389/fpsyg.2019.03087
- Mixed practice: Rohrer et al. (2020), 54 seventh-grade classes, reported 61% versus 38% on a delayed test. Mix previously taught problem types after initial instruction. This is not a promised gain for this website. https://doi.org/10.1037/edu0000367
- Dashboards: Kaliisa et al. (2024), 38 studies, found limited achievement evidence and methodological weaknesses. Defer elaborate progress displays. https://doi.org/10.1145/3636555.3636884

Visual choices and navigation labels are design hypotheses, not experimentally established learning interventions. Evaluate them through observed task completion. Evaluate teaching changes with delayed retention and unfamiliar problems, not clicks. Preserve the no-accounts, no-analytics and no-student-tracking rules.

## 7. Implementation order and acceptance

### Milestone 1: useful entrance and coherent visual system
Change `site/js/welcome.js`, shared navigation presentation and the styles in `site/styles/explorer.css` / `pages.css`. Remove decorative v4 effects and establish the new typography, spacing, illustrated chapter grid and task-oriented tool cards. Reuse working tools before creating new ones. Preserve the current route scheme, wordmark and existing content.

Acceptance: chapter illustrations are mathematically meaningful; phone cards and titles remain readable; tool descriptions match working capabilities; a first-time learner can find a chapter and open an experiment without explanation; a teacher can reach a chapter's documents. Test with representative students and teachers, including a phone. Set a provisional usability target of four out of five successful participants for each core task; this is a product target, not a research statistic.

### Milestone 2: replace the six-step chapter presentation
Rework `site/js/chapter-sequence.js` and the corresponding resource-library entry points. Keep legacy stage links as aliases. Pilot the four direct destinations on quadratics. Preserve mathematics and working interactions.

Acceptance: no required stepping through unrelated screens; direct links to concepts and exercises work; back navigation restores context; downloads and presentations are reachable without traversing the lesson.

### Milestone 3: complete priority content
Build the private coverage matrix, assess priority chapters, and fill gaps in instructional order. Move beyond deck-derived fallback content with explicit shared chapter structures and references. Follow the existing two-independent-audit and computed-result-verification publication gate.

Acceptance: every claimed complete chapter meets the matrix; all linked resources exist and match the chosen edition; examples, practice and assessment are distinguishable; no placeholder is counted as a completed learning component.

### Milestone 4: useful revision
Offer authored mixed revision sets and reminders within course pages. Consider optional device-local resume only. Any richer learning history or adaptive scheduling needs a separate privacy/product decision under the governing brief.

Acceptance: revision tests previously taught skills, includes explained answers, and remains useful without an account.

## 8. Delivery checks

Before an implementation release:
- Run npm test, npm run check, make check, and the relevant browser checks.
- Verify old hash links, curriculum choices, document links and language editions.
- Test home, catalogue, chapter, figure and documents at 320, 390, 768 and 1440 px, both themes and 200% text.
- Test keyboard-only use, reduced motion and a real screen reader.
- Ensure no horizontal page overflow, obscured controls or accidental page scroll while dragging.
- Check performance on a modest phone; load PDFs and heavy interactive resources on demand.
- Preserve anonymity, local resource hosting and the existing publication rules.
- Edit source files, regenerate served outputs through the established pipeline, and commit on main.
- Keep mathematical review records and verification scripts private.

This proposal changes documentation only. It does not assert that the redesign has been implemented, that the curriculum is fully audited, or that browser acceptance has passed.
