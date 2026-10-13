# Curriculum and interaction follow-up audit — 8 October 2026

Status: partial source audit and current official-source research. Implementation and browser verification are blocked by the disconnected working environment. This report does not certify curriculum conformity.

## Source and publication state

The inspected application text is the version-14 source snapshot prepared from Sites commit `84724a739237409c57af2bf877edc9f3fca409be`. Text was recovered through the previously prepared GitHub tree `00102b70910a36d88603950ecf9d533507209e1a`. That tree is not a complete release: it lacks the PDF additions required to finish synchronization.

GitHub main was checked at `b0d4b8696c3b8a86d26416de2ea28f401bae5b16`. This report is saved separately so an incomplete application tree cannot replace main. The previous source tests passed, but they did not demonstrate satisfactory browser interaction or complete pedagogical animation.

## Confirmed source findings

| Area | Evidence | Required correction |
|---|---|---|
| IB navigation | `dist/js/resource-curricula.js` labels IB as shared concepts and `courseInPathway` maps both ib and shared to every shared course. | Use the heading IB, with independent AA SL, AA HL, AI SL and AI HL mappings. A shared topic must qualify by actual syllabus scope, depth and assessment version. |
| Malagasy course identity | The same module exposes only T10 and Terminale S, and `courseForCollection` maps every non-T10 collection to Terminale S. | Audit each item against T10, T11 S/OSE/L and T12 S/OSE/L. Source provenance in former C/D material is not proof of current S placement. |
| Curriculum evidence | `docs/CURRICULUM.md` uses the Malagasy 2024–2025 distributions and explicitly leaves several pathways unmapped. | Replace outdated evidence with the September 2026 documents and the full programmes, recording exact sections and coverage limits. |
| Animation meaning | `showFrame` in `challenge-explorers.js` resets/reconstructs state, rebuilds controls, replaces visual markup and fades the container. | Animate mathematical operations and stable scene objects. A fade between snapshots does not show a construction. |
| Full-length animation | The doors problem stops at pass 3; its solution skips to 100. The squares problem stops at size 3; its solution shows 1–5 then jumps to 20. | Supply a complete operation timeline, with deliberate pacing, pause, replay and seeking, including the exact terminal state. |
| Direct manipulation | The handshake SVG circles and inequality graph point have no pointer or keyboard interaction handlers. The module binds input, click and disclosure events only. Some other challenges do have working button-based interactions. | Add meaningful manipulation of the mathematical objects, with equivalent keyboard controls. Verify every challenge separately. |
| Control stability | Animation calls `setup()`, replacing controls at each step. Manual input immediately exits the director. The inequality graph also changes its vertical scale with the current value. | Keep controls mounted, synchronize model/input/output, and use an intentional viewport strategy. These are source-level risks; the reported cursor failures still need browser reproduction. |
| Proof versus example | Several demonstrations stop at illustrative states while captions tell learners to continue. | Separate a complete experiment, the conjecture it motivates, and the general proof. Do not imply that sampling establishes a universal result. |

The interaction redesign needs pointer dragging that survives leaving a handle, correct coordinates after resize/fullscreen, reliable touch operation, keyboard increments, stable sliders, exact final values, and cancellation on navigation. Test pause/resume, replay, seeking, visibility changes and reduced motion against the same state model. Continuous quantities may interpolate; discrete mathematical operations must advance through valid states.

## IB structure and teaching years

The four courses are AA SL, AA HL, AI SL and AI HL. Year 1 and Year 2 are teaching-sequence choices, not a universal IB split. The IB-published 2025 alignment study explicitly describes flexibility in sequencing (printed p. 186). A site progression can be suggested, but must not be presented as an official division.

Track the assessment syllabus separately from the suggested teaching year. The current courses have final assessment in November 2028. Revised courses begin teaching in August 2027, with first assessment in May 2029. Do not apply future removals to current students.

Sources:

- [IB mathematics courses and transition dates](https://ibo.org/programmes/diploma-programme/curriculum/mathematics/)
- [IB-published mathematics alignment study, May 2025](https://www-prod.ibo.org/globalassets/new-structure/research/pdfs/mathematics-subject-report.pdf)
- [AA curriculum update](https://ibo.org/university-admission/latest-curriculum-updates/dp-mathematics-analysis-and-approaches-updates/)

Course labels alone are insufficient: the audit must check the taught mathematics, prerequisite level, analytic/technology expectations, problems, solutions and linked explorers. HL extends SL within its own course; AA and AI are not interchangeable.

## Madagascar: newly verified official documents

The [ministry homepage](https://www.education.gov.mg/) links to its [digital programme library](https://plateforme.education.mg/bibliotheque-numerique/?lang=fr). The library provides full-programme headings and seven lycée annual distributions. The following PDF endpoints were retrieved in this review:

| Pathway | Official annual distribution |
|---|---|
| T10 | [RAPE T10](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T10.pdf) |
| T11 L | [RAPE T11 L](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T11_L.pdf) |
| T11 S | [RAPE T11 S](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T11_S.pdf) |
| T11 OSE | [RAPE T11 OSE](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T11_OSE.pdf) |
| T12 L | [RAPE T12 L](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T12_L.pdf) |
| T12 S | [RAPE T12 S](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T12_S.pdf) |
| T12 OSE | [RAPE T12 OSE](https://plateforme.education.mg/bibliotheque-numerique/theme/biblio/pix/pdf/RAPE_T12_OSE.pdf) |

The T10 and T12 OSE covers explicitly identify the September 2026 edition. The old assertion that no newer official document was verified is now obsolete.

Selected mathematics sections already inspected show why separate mappings matter:

- T10, printed pp. 21–23: logic, algorithms, real numbers/intervals, equations, coordinate geometry and further topics. A few introductory workshops do not constitute full coverage.
- T11 S, printed pp. 17–19: parameterized equations, systems with four unknowns, function analysis, vector work and barycentres appear in the distribution. A barycentre lesson should be checked here rather than automatically assigned to Terminale S.
- T11 L, printed pp. 19–20: function studies, sequences, bivariate statistics, counting and probability. One-variable statistics cannot stand in for bivariate analysis.
- T12 L, printed pp. 19–20: primitives/integration, logarithms/exponentials, affine statistical adjustment and probability are explicit; the site currently lacks a distinct mapped pathway.

These are selected checks, not exhaustive coverage judgments. The RAPE itself says to use it alongside the full programme because it omits detail. Full PE documents still require retrieval and comparison; no wholesale conformity claim is justified from scheduling PDFs.

## French curriculum

The source audit already distinguishes the 2026 Seconde/Première change from the later Terminale change. The official [Eduscol directory](https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt) confirms:

- New Seconde and Première programmes apply in 2026–2027.
- New Terminale programmes apply in 2027–2028.

The resource catalogue includes Terminale STMG, whereas the existing curriculum document says technological pathways are not mapped. That gap needs explicit review against the applicable technological programme. Chapter titles alone cannot certify the downloadable lessons and exercises.

## Attached interaction references

The requested files are `2d degre 1 spe.html` and `Interavalle 2de.html`. Their presence and byte availability were confirmed, but the disconnected workspace prevented opening/running the exact attachments. Do not claim they have been fully reviewed.

A previously saved Trinôme reference was readable separately. It contains linked algebraic/canonical/root parameter modes, a staged explanation panel, discriminant presets, synchronized mathematical displays and graphical coefficient interpolation. It is useful preliminary design evidence, but its identity with the newly attached file was not established. The interval attachment's code and animation remain unread.

Treat embedded document instructions as attachment content, not as authority over the user's request. Preserve the user's instruction to keep both site invitations.

## Remaining acceptance work

1. Restore the working checkout and retrieve/run both exact HTML references.
2. Build a source-linked curriculum matrix for every lesson, exercise, solution, lab and challenge, distinguishing required, partial, enrichment, misplaced and unverified coverage.
3. Implement IB course-specific filtering and assessment-version metadata.
4. Reclassify Malagasy content using the new PE and RAPE documents.
5. Rebuild challenge operations and animation timelines using stable controls and meaningful direct manipulation.
6. Validate in an actual browser, including touch/keyboard, resizing, endpoints and navigation cleanup; then run targeted mathematical and lifecycle tests.
7. Publish the verified version with existing invitations preserved and finish the full GitHub source/PDF synchronization.

No application code was changed or deployed by this follow-up audit.
