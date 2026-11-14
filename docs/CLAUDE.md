# docs/: which document to read

Read one only when the task router in `MAP.md` sends you here.

| Document | Read it for |
|---|---|
| `ARCHITECTURE.md` | data flow, commands, linked-content policy, container setup (TeX packages) |
| `PREREQUISITES.md` | internal prerequisite model, scope/order diagnostics, question contracts, annotations and advisory commands |
| `ERROR_COVERAGE.md` | generated matrix of the error correction collection by misconception and curriculum, with the planned misconceptions (`node scripts/error-coverage.mjs`) |
| `TEX_STYLE_GUIDE.md` | TeX class, packages, environments |
| `ADR-0001-tex-i18n.md` | how English units are generated from French ones |
| `TEX_INVENTORY.md` | generated inventory of environments and macros (`make inventory`) |
| `CHAPTER_TEMPLATE.md` | chapter phases, source bindings and format checklist |
| `SLIDES.md` | where each deck comes from, slide checks |
| `DESIGN_V3.md`, `DESIGN_V4.md` | design reasoning (v4 amends v3) |
| `DESIGN_V6.md` | the current look, "Grille" (chosen 31 October 2026): rules, what is done, what is next. Supersedes the look of v3 and v4 |
| `design-v6/prototype.html` | clickable redesign prototype (home, chapter, laboratory, notes); not part of the site |
| `REDESIGN_PROPOSAL_2026-10-27.md` | proposed illustrated catalogue, practical tools, chapter redesign and content completion |
| `IMPROVEMENT_GOALS.md` | owner-approved learning, visualization, interactive slides, error-investigation, and Grand Oral goals with acceptance criteria |
| `REDESIGN_HANDOFF.md` | prompt to begin implementation of the revised redesign proposal |
| `LAB_DESIGN.md` | laboratory v2: research basis, templates, mission model, lab references for lessons and slides |
| `TEACHER_STRUCTURE.md` | the owner's teacher-first structure (11 Nov 2026): three modes (Préparer, En classe, Détente), launch pad order, séance, classroom setup, build rules |
| `AUDIENCE_MODES.md` | the three audiences per device (visitor by default, student, teacher), switching, why, and how "private" material is handled without accounts |
| `REVIEW.md` | Réviser (`#review`): spaced repetition by objective, files, rule, data export and import |
| `OFFLINE.md` | offline support: what is precached, what is cached when opened, strategies, update flow, kill switch, tests |
| `AUTOMATISMES_COMPETENCES.md` | competency of each generator: classification rules, pinned coverage table, gaps, where labels show |
| `CURRICULUM.md` | programme references (verify before citing) |
| `RESOURCE_LIBRARY.md` | history and provenance of the resource library |
| `ACTIVE_WORKSTREAMS.md` | current parallel-task register and corrected mathematicians' timeline scope; preserve it when writing a narrower handoff |
| `HANDOFF.md` | TeX pipeline hand-off: open owner questions, TeX status (older than root `HANDOFF.md`) |
| `LOG.md` | dated log of past sessions (append one line per finished task) |
| `future-work/seeded-exercises-first-slice.patch` | superseded first version of seeded exercises (a quadratic generator with its own page `#exercises`, HTML sheet, print, single-file student/teacher TeX export, 9 tests), kept as reference after the bank in `site/js/exercises/` covered it; `git apply --stat` shows the files, it applies to the tree before commit `68c84ba` |
| `future-work/malagasy-t12-cd-audit.md` | audit and integration plan of the T12 séries C et D book (chapters, C/D split, Bac corrections, converter gaps, anonymity, owner decisions); task 1 of the T12 integration |
| `history/` | superseded plans and reports; do not read unless asked |

ANNALS.md: source rights, imported-fragment format, chapter integration, local typesetting pipeline and rebuild requirements for the self-hosted annales bank.
