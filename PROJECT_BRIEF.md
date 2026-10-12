# Maths Explorer v2: project brief

Status: v0.2, owner decisions of 12 October 2026 incorporated. Items tagged [OPEN] are undecided. Items tagged [VERIFY] must be checked against an official source before use. Nothing in this brief is a confirmed fact about an official programme unless it is cited.

Precedence: this brief supersedes every earlier instruction in the repository (AGENTS.md, README, docs/). Where they conflict, follow this brief. Only the owner can change it.

## 0. Kickoff prompt (paste into any AI agent)

You are a collaborator on Maths Explorer, a static, bilingual, experiment-first mathematics resource site for lycée students and teachers (early-university basics included). Read this whole brief first. Rules that always apply:

1. Maths is learned by experimenting and seeing. Every chapter must let the student manipulate an object before being given a rule.
2. Be accurate. Verify every computed result with code (SymPy or equivalent). State "I do not know" rather than guess. Never invent a source, a bulletin number or a programme requirement. Tag uncertainty [VERIFY].
3. Nothing published may identify the owner or his employer (see section 2).
4. Every PDF has its LaTeX source in the repository.
5. Drafts, audit notes and review status stay in the private area, never in the published folder.
6. Work in the priority order of section 3. Ask before changing a rule in section 2.

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
| Owner review | The owner reviews slowly and before class use. AI output is draft until the owner marks it reviewed (private ledger). |

## 3. Scope and priority order (owner's order)

1. Classes the owner teaches this year: Seconde, Première spécialité, Terminale spécialité, Maths expertes, Terminale STMG.
2. Malagasy Terminale (T12), all series, in the order S, then OSE, then L.
3. Olympiad: progressive, Malagasy, then Pan-African, then international.
4. Rest of the Malagasy curriculum.
5. IB (English).
6. University basics: calculus, analysis, algebra (narrow, basics only) [OPEN: rank not given; placed last].

Programme versions (owner-stated, [VERIFY] with the official texts):
- French reform applies to Seconde and Première this year; Terminale from next year. Terminale content this year follows the current programme.
- Cite the specific bulletin (Eduscol / BO) in each chapter's private metadata. Bulletin numbers are not yet collected [OPEN].
- Malagasy programmes: available on the ministry website; the owner also holds copies [OPEN: obtain].
- Flag out-of-programme content: [HORS PROGRAMME].

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

- Name: Maths Explorer.
- Palette selector. Default themes: Navy-Gold and Charcoal-Yellow. Light print theme for PDFs.
- Navy-Gold tokens, taken from the slides: background #0f1b2d, panel #13243b, grid #24364f, ink #f4f1ea, muted #8fa6c4, primary #e8a33d, positive #5fd0a0, negative #ff7a7a. Charcoal-Yellow values are not yet defined [OPEN].
- The existing site uses navy, mint and violet; migrate it to the new palettes.
- Check contrast (WCAG AA), keyboard use and reduced motion for every theme. Conformity is not established by automated checks alone.

## 7. Technical architecture

- Static site, no accounts, relative paths, hash routes (existing design), deploy folder `dist/`. Source of truth is the private GitHub repository; optional static hosting on the ChatGPT sites platform (see `.openai/hosting.json`). Not launched until the owner judges it polished.
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
6. Independent audit by a second agent against this brief.
7. Status in the private ledger: draft, audited, owner-reviewed, publishable.

Evaluate the `math-series-guardrails` skill as the pipeline (its description matches this need; its instructions have not been read yet).

## 9. Open decisions (summary)

Decided on 12 October 2026: no visible AI notice; language policy as in section 3; XeLaTeX; shared slide engine.

Still open:
1. Rank of university basics.
2. Charcoal-Yellow colour values.
3. Programme bulletin references (Eduscol/BO) and the Malagasy programme documents.
4. IB tracks (AA/AI, SL/HL).
5. What counts as publishable at launch: only owner-reviewed content, or everything (owner unsure; decide before launch).

## 10. Suggested first milestone

Pilot chapter: quadratic trinôme (Première spécialité), since the slide exists. Produce the full sequence, compile it, test it, have it audited and reviewed. Use the result as the gold standard for the template in section 4, then scale in the order of section 3.
