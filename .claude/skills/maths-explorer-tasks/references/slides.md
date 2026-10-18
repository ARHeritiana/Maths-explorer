# Recipe: slides

Always read `.claude/skills/slides-interactive-math/SKILL.md` then `.claude/skills/slides-interactive-3d-math/SKILL.md` first
(owner rule).

- Deck content: source depends on the course, see the table in `docs/SLIDES.md` "Where decks come from"
  (`content/slides/<deck>.json`, `content/slides/draft/`, or TeX units). Build: `make slides`.
- A laboratory experiment as a canvas: `lab('<experiment>/<mission>')` in the `WIDGETS` table of `scripts/build-slides.py` (or
  `{"type": "lab", "ref": ...}` in an authored deck). Choose the mission from the slide's section title; the experiment file is the
  one source (do not write a new widget for a maths object an experiment already covers). Details in `docs/SLIDES.md`.
- A canvas: register and draw in `site/slides/widgets.js` (helpers and registry), `widgets-2d.js` or `widgets-3d.js`;
  place it with the `WIDGETS` table in `scripts/build-slides.py`. Every canvas draggable; true 3D for 3D objects.
- Player behaviour: `site/slides/player.js`, `player.css`, `player.html` (import map is generated). Changing any of
  them rebuilds every HTML export on `make site`.
- Lecture PDFs: `scripts/build-lecture-slides.py`, `content/tex/lectures/`.

Without `pdflatex` see `build/mxbuild/CLAUDE.md` (stand-in for the figure step). Checks: `python3 -I .claude/skills/slides-interactive-math/scripts/lint_slide.py dist/slides/export/<deck>.html`,
`node --test tests/player-controls.test.mjs tests/slide-format.test.mjs`, `python3 tests/slides_check.py`.
Then follow `release.md`.
