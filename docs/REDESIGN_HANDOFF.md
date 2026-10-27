# Redesign handoff prompt

Paste the following into a new implementation chat opened on this repository.

---

Implement the latest proposal in `docs/REDESIGN_PROPOSAL_2026-10-27.md`. Read the current file, not an earlier conversation summary.

The owner considers the UI ugly and impractical and the content incomplete. Removing or replacing features is explicitly welcome, including the six-stage chapter interface.

Read AGENTS.md, HANDOFF.md, PROJECT_BRIEF.md, MAP.md and the redesign proposal before implementation. Use design-taste-frontend where appropriate. Inspect the current live experience and relevant source before editing.

## Design direction

Build a colourful, illustrated mathematics catalogue with readable, restrained learning pages. The revised proposal supersedes the earlier preference for plain chapter rows.

Reference evidence: the owner supplied readable Mission Maths screenshots showing illustrated chapter cards, tools named by their use, specific action links and a Grand Oral promotion. The full website and interactions were not successfully browsed. Do not claim verified reference-site pedagogy or tool behaviour. The screenshots need not be uploaded again; their relevant observations are recorded in the proposal.

Implement:
- A useful homepage with a short introduction, search, direct course/tool entrances and compact mathematical artwork.
- An illustrated chapter grid after curriculum and class selection. Use real HTML titles and mathematically accurate previews.
- Tools named by what the student can do, with brief descriptions and reciprocal chapter links.
- Direct Cours / Manipuler / Exercices / Documents access, with optional teaching guidance. Remove the six-stage numbered rail; do not replace it with another forced sequence.
- A phone layout with one-column cards below 600 px, readable text and accessible navigation.
- Consistent typography, spacing and blue identity, with stable topic colours inside illustrations.
- Meaningful mathematical animation. Remove decorative wiggles, tilts and continuously pulsing selections.
- Useful exports for supported figures where practical and tested.

Avoid a full-screen welcome splash, dense text baked into thumbnail images, a narrow phone sidebar, nonexistent tool buttons, inflated completeness claims and feature expansion ahead of priority content.

Keep Grand Oral as a scoped later content collection, after priority chapters and verification of examination requirements. Defer elaborate dashboards, badges and streaks.

## Content and delivery

Begin with the homepage/shared design and the existing quadratic chapter as a complete pilot. Continue through independently reviewable milestones.

Assess content using a private coverage matrix. A complete chapter requires aligned objectives, prerequisites, guided exploration, explanations, worked examples, original exercises, corrections and chapter-specific assessment. Slide-derived text, reused examples and generic checklists cannot establish completeness.

Follow the governing curriculum priority order. Preserve experiment-first teaching, with adequate hints and explanations for novices. Apply retrieval practice, feedback and spaced/mixed revision as described in the proposal; do not describe the visual design as research-proven.

Work on main only. Edit source files, regenerate served outputs through the established pipeline, and run npm test, npm run check, make check and relevant browser checks before pushing. Keep old hash links working. Verify phone layouts, both themes, keyboard operation, mathematical dragging, reduced motion, 200% text, downloads and language editions.

Preserve anonymity, local resource hosting, no accounts, no analytics and no student tracking. Keep drafts and review evidence private. Follow the existing independent-audit and mathematical-verification publication gate for educational resources.

French and Malagasy curricula use French; International uses English; university retains the original language; Olympiad is separate and bilingual by default. Existing English editions stay available. The bilingual curriculum goal remains on standby and unfinished.

## Starting state

The earlier work inspected source and wrote documentation only. It did not implement the redesign or complete the curriculum. GitHub connector access worked; local cloning failed because the workspace could not reach GitHub. Retry in the new environment and report actual checks, not assumed results.

Proceed autonomously within this scope. Give concise milestone updates and report changes, test results and remaining gaps. The authoritative design details and acceptance criteria are in the revised proposal.
