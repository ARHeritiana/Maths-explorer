# Maths Explorer v2: project brief

Status: v0.5, owner decisions of 12 October 2026 incorporated (language policy, two-agent publication gate, design delegated to the assistant). Start with HANDOFF.md for the current task queue. Items tagged [OPEN] are undecided. Items tagged [VERIFY] must be checked against an official source before use. Nothing in this brief is a confirmed fact about an official programme unless it is cited.

Precedence: this brief supersedes every earlier instruction in the repository (AGENTS.md, README, docs/). Where they conflict, follow this brief. Only the owner can change it.

## 0. Kickoff prompt (paste into any AI agent)

You are a collaborator on Maths Explorer, a static, bilingual, experiment-first mathematics resource site for lycée students and teachers (early-university basics included). Read this whole brief first. Rules that always apply:

1. Maths is learned by experimenting and seeing. Every chapter must let the student manipulate an object before being given a rule.
2. Be accurate. Verify every computed result with code (SymPy or equivalent). State "I do not know" rather than guess. Never invent a source, a bulletin number or a programme requirement. Tag uncertainty [VERIFY].
3. Nothing published may identify the owner or his employer (see section 2).
4. Every PDF has its LaTeX source in the repository.
5. Drafts, audit notes and review status stay in the private area, never in the published folder.
6. Work in the priority order of section 3. Ask before changing a rule in section 2.
7. For any interactive slide, read both skills in `.claude/skills/` first (section 10).

## 1. Mission and pedagogy

- Audience: students and teachers in Madagascar first; the owner's own classes; later a wider public. Word of mouth, no advertising, no tutoring content.
- Philosophy: see, manipulate, conjecture, then formalise. Example (owner's): for quadratics, the sign of a fixes the parabola's orientation; the canonical form gives the extremum; the roots are the x-intercepts; the sign table and the variation table then follow without rote memorisation. For vectors, the determinant is the signed area of the parallelogram, and colinearity is area zero.
- Experiment loop (from the existing plan): predict, experiment, conjecture, explain, check. Experiment gives evidence, not proof; say so explicitly.

## 2. Non-negotiable rules

| Rule | Detail |
|---|---|
| Anonymity | No owner name, employer, school or student names in HTML, PDF text, PDF/XMP metadata, LaTeX `\author`, file names or alt text. Existing PDFs have NOT yet been scanned for metadata: do this first. |
| No tutoring link | The site is not tied to private tutoring. A separate site handles that, later. |
| No personal-storage links | No Google Drive or other personal-space URLs anywhere (carried over from AGENTS.md; this rule stays). |
| LaTeX sources | Every PDF ships with its `.tex`. Imported PDFs without sources (about 574 in the current repo) are regenerated or replaced, in priority order. |
| Hidden area | Status ledger, AI audit notes, provenance records and drafts live outside the deploy folder (`dist/`). Only finished files are copied in. |
| No visible AI notice | No AI-content notice or review-status label anywhere on the published site, in resource cards or in PDFs (owner decision; this removes the old footer-notice rule). Provenance and review status are kept in the private ledger only. |
| No accounts, no tracking | No analytics, no student tracking tools for now. |
| Access control | None for now. Static hosting cannot truly gate files; a later code or paywall needs a server or paid platform [OPEN]. |
| Publication gate | Decided by the owner on 12 October 2026: a resource may be published once it has been audited by two different AI agents (independent sessions, ideally different models) with no open finding, and every computed result has been verified by code. Human review by the owner is not required for publication. The private ledger records, per resource, whether it has been human-reviewed (`human_reviewed: true/false`) and by whom; this is never shown publicly. The owner still reviews slowly and always before using a resource in class. |

## 3. Scope and priority order (owner's order)

1. Classes the owner teaches this year: Seconde, Première spécialité, Terminale spécialité, Maths expertes, Terminale STMG.
2. Malagasy Terminale (T12), all series, in the order S, then OSE, then L.
3. Olympiad: progressive, Malagasy, then Pan-African, then international.
4. Rest of the Malagasy curriculum.
5. IB (English). Decided: AA first (SL and HL on a shared core, HL extensions clearly marked), then AI (SL and HL). Verify every item against the current IB subject guides before writing [VERIFY]. The earlier repo audit says complex numbers leave AI HL for first assessment in 2029 [VERIFY].
6. University basics: calculus, analysis, algebra, narrow and basics only. Decided: last in rank; start only once each of items 1 to 4 has at least one audited pilot chapter.

Programme references (French), checked on 12 October 2026 on the Eduscol page "Programmes et ressources en mathématiques - voie GT" and the BO index. [VERIFY] before relying on a detail.
- New programmes: BO n° 14 du 2 avril 2026, arrêtés du 26 février 2026 (https://www.education.gouv.fr/bo/2026/Hebdo14). Applies from rentrée 2026-2027 to Seconde and Première; from rentrée 2027-2028 to Terminale (Eduscol).
  - Seconde GT: MENE2602914A.
  - Première, spécialité mathématiques: MENE2602917A.
  - Première, mathématiques intégrées à l'enseignement scientifique: MENE2602916A.
  - Première technologique: MENE2602918A.
  - Terminale, spécialité mathématiques: MENE2602919A.
  - Terminale, option mathématiques complémentaires: MENE2902920A.
  - Terminale technologique (STMG): MENE2602921A.
- Programmes in force this school year for Terminale: spécialité mathématiques and option mathématiques expertes, BO spécial n° 8 du 25 juillet 2019 (Eduscol, "programmes en vigueur"). No new maths expertes programme is listed; whether or when it changes is unknown [VERIFY].
- The programme in force this year for Terminale STMG was not found in this check [OPEN: look it up on Eduscol before writing STMG material].
- Cite the relevant NOR or BO reference in each chapter's private metadata. Flag out-of-programme content: [HORS PROGRAMME].
- Malagasy programmes: published on the ministry website, and the owner holds copies. Series order S, then OSE, then L. The owner will supply the documents for each chapter; do not guess their content [OPEN: obtain].

Language at launch (decided): French for the French and Malagasy curricula; English for IB; bilingual (French and English) for Olympiad. Full bilingual parity can wait. This overrides the old rule that every resource exists in both languages.

## 4. The chapter unit (PROPOSED template, owner to correct)

No gold-standard chapter exists yet, so this is a proposal. Each chapter delivers, in this order:

1. Automatismes: short recall and fluency drills (format to be confirmed by owner).
2. Activité d'introduction: an experiment the student runs before any rule.
3. Notes de cours: definitions, theorems, examples, clearly labelled.
4. Exercices et problèmes, with graded difficulty, and full corrections (teacher edition).
5. Interactive slide (section 5).

Formats: PDF (from LaTeX, source included) and an interactive web edition. Corrections are separate files. Increase example complexity gradually. Student instructions: academic yet accessible, lycée level.

LaTeX conventions: build with XeLaTeX (owner decision), using the repository's shared style `content/latex/enrichment/explorer.sty` and its build script. The owner's usual pdfLaTeX and mathpazo default does not apply to this project unless the owner says otherwise. Other conventions stay: automatic numbering with `\newcounter`; simple enumerations (1., 2., 3. or a., b., c.); `mdframed` for boxes where compatible with the shared style; ask before adding a barème; student and teacher versions.

## 5. Interactive slide specification

Derived from the owner's two attached slides (trinôme, déterminant et colinéarité). These are the reference implementations.

- One self-contained HTML file, 1280×720 stage scaled to the viewport.
- Left column: step blocks revealed one at a time. Right: canvas (graph or figure) with live values below.
- Controls: previous, step counter, next, "Tout" (show everything), fullscreen; Left and Right arrow keys.
- Maths typeset with MathJax 3 (tex-svg) and STIX Two Text. Internet is assumed available.
- Every canvas is interactive: draggable points (pointer events, touch-safe, snapped to the grid) and sliders. Use true 3D (rotatable) when the object is 3D.
- Presets for the key cases (a>0, a<0, Δ>0, Δ=0, Δ<0). Alternative parameterisations when useful (a,b,c / a,α,β / a,x₁,x₂).
- Colour meaning: primary object amber, positive/valid green, negative/warning red, secondary muted blue-grey.
- A live computation panel must show the actual current numbers (for example the determinant ad − bc with signs).
- Architecture (decided): one shared engine (rendering, steps, controls, dragging, sliders, themes); each chapter's slide supplies only its data and scenes. A single-file export for portability is optional, not required.
- The two reference slides duplicate their engine code; the shared engine must reproduce their behaviour before they are migrated.

## 6. Design

Design is delegated to the assistant by the owner (12 October 2026). Reference implementation: `design/prototype/` (run per its README). Read it before any visual work, and use the repo-level design skills (frontend-design, design-taste-frontend).

**Design read.** Experiment-first learning site for lycée students and teachers, phone-first (Madagascar), trust and legibility over decoration, with a mathematical, bookish voice. Dials: variance 5, motion 2 (only motion that answers a user action), density 4.

**Principles.**
- The first screen is an experiment: a manipulable figure beside one sentence, not a catalogue. Hero figure: parabola with draggable roots. Second figure: determinant as signed area.
- One memorable element (the figure panel); everything else is quiet. One accent per theme, one 10 px radius, no shadows, no gradients, no decorative animation, no emoji.
- Semantic colour is fixed across themes: primary = the object under study, positive = valid or positive, negative = warning or negative, muted = secondary.
- Structure encodes content: numbers appear only on real sequences (the five-part chapter sequence) and numbered chapter lists.

**Typography.** STIX Two Text (headings, formulas, readouts: matches MathJax output and LaTeX) and Atkinson Hyperlegible (interface and body), both OFL, self-hosted, font-display swap. Body 18 px, line length under 70 characters, French number format (decimal comma, true minus sign U+2212), simplified coefficients.

**Themes.** Selector in the header, choice saved locally (failure tolerated). Default Marine (Navy-Gold). Charbon (Charcoal-Yellow). Jour (daylight, for classroom projectors and print-like reading).

| Token | Marine | Charbon | Jour |
|---|---|---|---|
| bg | #0f1b2d | #16181d | #f3f5f8 |
| panel | #13243b | #1f2229 | #ffffff |
| ink | #f4f1ea | #f2f0e8 | #14213a |
| muted | #8fa6c4 | #9aa3b0 | #50607a |
| primary | #e8a33d | #ffd23f | #8f5200 |
| on-primary | #0f1b2d | #16181d | #ffffff |
| pos | #5fd0a0 | #6bd6a4 | #17734f |
| neg | #ff7a7a | #ff7a7a | #b3261e |
| grid | #24364f | #2e323b | #d8dee8 |
| border | #5d7699 | #6b7480 | #7a869b |

Computed WCAG contrast on bg / panel: ink 15.3 / 13.9, 15.6 / 14.0, 14.7 / 16.1; muted 6.9 / 6.3, 7.0 / 6.2, 5.8 / 6.4; primary 8.0 / 7.2, 12.3 / 11.0, 5.7 / 6.2; pos 9.1 / 8.2, 10.0 / 8.9, 5.3 / 5.8; neg 6.8 / 6.2, 7.0 / 6.3, 6.0 / 6.5; button text on primary 8.0, 12.3, 6.2; control borders 3.7 / 3.4, 3.8 / 3.4, 3.4 / 3.7 (at least 3:1 for UI components). Grid lines are decorative and exempt. This covers colours only, not full conformity.

**Layout.** Header one line (64 px), on phones a Menu button. Hero in two columns on desktop (words 5/12, figure 7/12), stacked on phones. Chapter list: level tabs (Seconde, Première, Terminale, Terminale STMG) and a two-column list on desktop. Minimal footer, no AI notice.

**Slide on phones.** In portrait the 1280x720 stage must not be shrunk to illegibility: stack the figure above a controls and readout panel, keep touch targets at least 44 px, and leave a fullscreen/landscape option.

**Accessibility rules.** Skip link; visible 3 px focus ring; draggable points are focusable (role slider) and move with arrow keys (Shift for larger steps), sliders always available as an alternative; debounced aria-live summary of the result; reduced motion respected; no horizontal scroll at 390 px; 200% text zoom must still work. Check each theme before shipping. Automated checks do not prove conformity.

**Copy rules.** French, sentence case, plain verbs, buttons say what happens ("Choisir un chapitre"). No em or en dashes in copy. No all-caps labels, no eyebrow labels.

- The existing site uses navy, mint and violet; migrate it to these themes. Print theme for PDFs stays light.

### Design flaws of the current site (visual audit, 12 October 2026)

Based on screenshots of four views (chapter catalogue and lab, desktop 1440 px; catalogue filters and lab, phone 390 px). The other views were captured but not inspected. The owner names design as one of the site's main flaws; the owner's own list of flaws is still to be collected [OPEN].
- The landing page is a text catalogue of chapter cards, not an experiment. Nothing shows the experiment-first philosophy at first sight.
- Chapter cards are visually empty (a number, a title, small grey text) and their text alignment varies from card to card.
- The lab's formula shows unsimplified coefficients ("f(x) = 1x² + 0x − 2"), unlike the owner's slides, which simplify them.
- In the lab, the graph is small and the controls fall below the first screen; the owner's five-step slide sits behind a small button rather than being the main experience.
- The "Présenter et explorer" button sits on the card edge instead of inside its padding.
- On a phone the navigation wraps onto two lines (an orphaned item) and a filter label is truncated ("Tous les parcou…").
- One uniform navy-and-mint look gives little visual hierarchy; the owner's slides (navy and gold, semantic colours, large figure) are the stronger reference.
- The design work must use the repo-level design skills (frontend-design, design-taste-frontend, theme-factory) and end with an accessibility check.

## 7. Technical architecture

- Static site, no accounts, relative paths, hash routes (existing design), deploy folder `dist/`. Source of truth is the private GitHub repository; the hidden area is `private/` (see its README; ledger schema there); optional static hosting on the ChatGPT sites platform (see `.openai/hosting.json`). Not launched until the owner judges it polished.
- Keep from the current repo: the `[French, English]` content model, route scheme, tests and CI, the 98 LaTeX workshop sources, curriculum research notes (re-verify).
- Rebuild: the interactive layer around the slide engine; the TeX-less PDFs.
- Before launch, size and load time need attention (the current `dist/` is about 156 MB, mostly PDFs).
- Pending clean-up tasks from the decisions above: remove the visible AI footer notice from the site and the matching README text; scan all PDFs and web editions for identifying metadata; update the language handling so French-only and English-only resources are allowed; keep tests and CI passing after each change.

## 8. Production workflow and quality gates

Per chapter, in order:
1. Align to the programme (cite the bulletin, tag [HORS PROGRAMME] where relevant).
2. Draft in LaTeX, then the slide.
3. Verify every result with code; keep the verification script in the private area.
4. Compile LaTeX without errors; check page layout.
5. Browser test of the slide (drag, sliders, steps, fullscreen, both themes, phone width).
6. Two independent audits by two different agents against this brief (each audit recorded with agent identity, date and findings).
7. Status in the private ledger: draft, audited once, audited twice (publishable), plus the separate flag `human_reviewed: true/false`.

Evaluate the `math-series-guardrails` skill as the pipeline (its description matches this need; its instructions have not been read yet).

## 9. Open decisions (summary)

Decided on 12 October 2026: no visible AI notice; language policy as in section 3; XeLaTeX; shared slide engine.

Settled by the assistant on the owner's instruction ("solve the remaining questions yourself"), all reversible by the owner:
1. University basics rank last (section 3).
2. Charcoal-Yellow tokens defined and contrast-checked (section 6).
3. French programme references collected (section 3).
4. IB: AA first, then AI, SL and HL (section 3).
5. Publication gate (section 2): superseded by the owner on 12 October 2026. Publishable means audited by two different AI agents plus code verification; the hidden ledger shows the human-review state.

Still open:
1. Malagasy programme documents: the owner supplies them per chapter.
2. The Terminale STMG programme in force this year.
3. Whether maths expertes keeps the 2019 text beyond this year.
4. Owner review of the prototype design (themes, hero figure, fonts).

## 10. Skills stored in this repository

Location: `.claude/skills/` (Claude Code loads this folder automatically; other agents should read the files directly).
- `slides-interactive-math/`: base skill. `SKILL.md`, `assets/template.html`, `assets/example_trinome.html`, `references/engine-patterns.md`, `references/hyperframes-workflow.md`, `scripts/lint_slide.py`.
- `slides-interactive-3d-math/`: add-on. Every canvas draggable; true rotatable 3D for 3D objects. Always read the base skill first.

Notes:
- Copied unchanged from the owner's account on 12 October 2026, with one fix: the add-on referred to the base skill as `math-interactive-slides`; it now says `slides-interactive-math`.
- No identifying information was found in either skill (scan for names, school, organisation, email, Drive links).
- Run `python3 -I .claude/skills/slides-interactive-math/scripts/lint_slide.py <slide.html>` on every slide. Both reference slides (trinôme, déterminant et colinéarité) pass this lint.
- The shared engine (section 5) should be built from `references/engine-patterns.md` and the two reference slides; keep the skills in step with it when it changes.

## 11. Suggested first milestone

Pilot chapter: quadratic trinôme (Première spécialité), since the slide exists. Produce the full sequence, compile it, test it, have it audited and reviewed. Use the result as the gold standard for the template in section 4, then scale in the order of section 3.
