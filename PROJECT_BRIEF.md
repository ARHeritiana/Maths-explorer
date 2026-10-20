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
5. International (English): the pathway is labelled "International" and holds the IB and, since 13 October 2026, the SAT (Math section, four College Board domains). IB: Decided: AA first (SL and HL on a shared core, HL extensions clearly marked), then AI (SL and HL). Verify every item against the current IB subject guides before writing [VERIFY]. The earlier repo audit says complex numbers leave AI HL for first assessment in 2029 [VERIFY].
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

### Slide purposes and canvas views (owner request, 15 October 2026)

- Two editions per chapter: exploratory HTML built with the interactive maths slide skill, and an actual 16:9 Beamer Metropolis lecture PDF. They have different uses and layouts, not a browser print export. A purpose toggle switches the catalogue between them.
- HTML retains live figures and step reveal. Lecture PDFs present definitions, proofs, methods, questions and separate worked answers, with vector figures. Interactive-only scenes are omitted. Downloadable Beamer source bundles accompany the PDFs.
- Keep a canvas camera separate from its mathematical state. Moving a point or changing a parameter does not automatically rescale a laboratory graph. Zoom, pan, reset and explicit fitting are deliberate actions; keep picking correct after a camera change and after a figure redraw.
- Platonic solids must have rigid, non-overlapping nets that fold into all five solids. Explain the strict vertex-angle inequality and the exclusion of p >= 6. Complex-number exploration uses geometric transformations of points, figures and grids, following the geometric approach of Visual Complex Analysis with original figures and wording.

## 6. Design

The owner discarded every earlier design instruction on 13 October 2026 and delegated design to the assistant, working from the site's goal and functions. The current design ("Cahier"), its reasoning, tokens and components are in `docs/DESIGN_V3.md`; read it before any visual work. Rules that still bind any design, because they come from the site's purpose rather than from taste:

- Experiment first: the manipulable figure is the main content of a chapter, and the first screen offers a way into one.
- Honest labelling: experiments give evidence, not proof; show the numbers behind a picture; simplify coefficients.
- Phone first, low data: usable at 320 px width, no horizontal scroll, 44 px touch targets, readable at 200% text, no heavy assets.
- Accessible: visible focus, full keyboard use (draggable points move with arrow keys, sliders as alternative), contrast checked in every theme, reduced motion respected.
- No visible AI notice, no owner identity, no personal-storage links (section 2).

## 7. Technical architecture

Update, 13 October 2026: the web source is `site/` and `dist/` is assembled from it (`make site`); the TeX system is in `content/tex/` and the catalogue source is `content/data/manifest.json`. See `docs/ARCHITECTURE.md`. Where the bullets below name `dist/js` or `content/latex`, read `site/js` and `content/tex`.

- Static site, no accounts, relative paths, hash routes (existing design), deploy folder `dist/`. Source of truth is this GitHub repository; review records (ledger, audits, verification) live in the private repository ARHeritiana/Maths-explorer-backup (see its README; ledger schema there), and `private/` is git-ignored here; launched on 20 October 2026 on GitHub Pages (https://arheritiana.github.io/Maths-explorer/), deployed from `dist/` by `.github/workflows/pages.yml` on every push to `main`; static hosting on the ChatGPT sites platform (see `.openai/hosting.json`) remains optional.
- Keep from the current repo: the `[French, English]` content model, route scheme, tests and CI, the 98 LaTeX workshop sources, curriculum research notes (re-verify).
- Rebuild: the interactive layer around the slide engine; the TeX-less PDFs.
- Size and load time still need attention (the current `dist/` is about 156 MB, mostly PDFs).
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
4. Owner review of the Cahier design (`docs/DESIGN_V3.md`).

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


## Interaction policy, owner instruction of 16 October 2026

Direct canvas interaction replaces view and point button toolbars throughout the site. Preserve keyboard operation,
mathematical mode choices and independent camera state. Load the chosen language automatically on neutral content;
use each curriculum's language for curriculum content. Omit language switches there. Put download links beside the
links opening each resource, outside the slide player toolbar. A menu with only one enabled choice becomes a label;
restore the menu when multiple choices exist. Content updates must propagate through linked views and exports by
shared data and build dependencies, with stale products rejected before publication.

Owner instruction, 19 October 2026: canvas interaction is preferred to buttons for actions on the objects themselves,
not only camera controls. Make direct pointer/touch manipulation primary, with keyboard equivalents. Keep genuine
mode and parameter choices in compact menus; optional examples must not prevent entering meaningful custom values.
