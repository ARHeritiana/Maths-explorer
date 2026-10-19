# site/js/lab/: the laboratory (experiments with missions)

The contract is `docs/LAB_DESIGN.md` (read sections 3 to 7 before changing anything here). One experiment = one maths object
+ one template + 4 to 6 missions. The page, the card and the smoothness rules are the same for every experiment.
`mount.js` `mountExperiment(host, ref, { mode, lang, palette, onMission, onComplete, controls, readout, hint, render })` is the only entry point (lab page in
`app.js`, chapter pages in `chapter-sequence.js`, slides in `slides/widgets.js`). A lab reference is `"<experiment>"` or `"<experiment>/<mission>"`; the route is
`#lab/<experiment>[/<mission>]`.

## Files

| File | Holds |
|---|---|
| `engine.js` | `createStage`: DPR canvas, one rAF scheduler (draws only when dirty), handle hit-test (22 px radius), pointer capture, focusable twins of the handles (Tab, arrows), shared camera, palette and theme watch; option `onSpin` (3D template: a background drag or the arrow keys with the canvas focused turn the view instead of panning it); `makeFormat` (decimal comma, `(x ; y)`), `setText`/`setAttr`/`setClass` (write only when changed), `createReadout`, `createTable` |
| `format.js` | `makeFormat`: numbers with honest labelling (`num`, `isExact`, `eq`, `rel`, `read`, `ratio`, `full`, `pt`, `iv`, `t`): ≈ for a rounded value, = for an exact one; decimal comma in French; re-exported by `engine.js` |
| `shell.js` | `createShell`: builds the figure and the mission card, runs the five mission kinds (`KINDS`), state, goals, answers, previous/next, `N`/`P`, argument section; `root.__lab` is the hook the browser tests use |
| `mount.js` | `mountExperiment` (modes `full` lab page, `inline` chapter page: canvas, one mission, link to the full page, `slide` player: canvas in the widget host, controls, answer area and stepper in `controls`, formula and readout in `readout`, prompt in `hint`, dark `palette`, fonts x1.3, `render` typesets text, N and P only with canvas focus); loads the template of the experiment |
| `registry.js` | `EXPERIMENTS` (catalogue order, fourteen), `TEMPLATES` (lazy, seven), `TEMPLATE_INFO` (group titles of the index), `resolveRef` (THE resolver: `{experiment, mission, index, ref, explicit}` or null), `catalogue()` (lines for `content.js` `labs`) |
| `page.js` | markup of `#lab` (index grouped by type of activity) and of one experiment page |
| `plot.js` | panels and views (fixed ranges), axes, the data-driven scene (curves, areas, rects, polys, lines, circles, arcs, points, texts, `rowLabels`; point labels never collide); `widen` spreads an equal-scale panel over the whole width, handle marks, `buildHandles` (the engine handles of a template) |
| `templates/family.js` | template `family`: one or two panels, handles from the experiment's `controls`, links between panels |
| `templates/process.js` | template `process`: `family` + play for scrubbers (reduced motion: one step per press) |
| `templates/chance.js` | template `chance`: histogram of observed frequencies (theory outline only when the state says so) above a tray of the last experiments drawn on the canvas; run buttons are an `action` control |
| `templates/figure.js` | template `figure`: one equal-scale panel, 2 to 4 point handles, a badge with the measured quantity |
| `templates/data.js` | template `data`: dot plot (one handle per value, equal values stacked) above a summary strip (box plot, mean), shared horizontal scale |
| `templates/space.js` | template `space`: true 3D view (the camera of `../camera3d.js`, shared with the slide widgets), floor grid, axes, faces, segments and points; a part of a segment behind a face marked `occlude` is dashed; a background drag, the arrow keys or `spin` turn the view (never the state), `0` resets it; handles are points constrained to a line or a plane (`constraint(state)` = `{o, e1, e2?}`), snapped, with arrow-key steps; `stage.camera3` holds the angles |
| `templates/transform.js` | template `transform`: `before` and `after` equal-scale panels with the same range, handles in either, dashed link from a point to its image |
| `models/quadratic.js`, `trig.js`, `derivative.js`, `integral.js`, `sequences.js`, `probability.js` (binomial law, seeded simulation `rng`, `simulate`), `vectors.js`, `statistics.js` (quartile convention), `complex.js`, `line.js` (exact fractions of the slope and intercept), `exponential.js`, `cobweb.js` (fixed point, staircase), `matrix.js`, `space-lines.js` (plane polygon and line clipped to a box, intersection, projection) | pure maths of each experiment (`model(state)`, `quantities`), no DOM, no `Math.random`; built on `math.js` where it already had the maths |
| `models/num.js` | `clamp` and `snap` |
| `experiments/<id>.js` (fourteen) | one per experiment: state, controls, views (`scene`, `formula`, `readout`, `table`), missions, conclusion, history |

## Experiment contract (details beyond docs/LAB_DESIGN.md section 5)

- `controls`: `handle` (`at`, `drag(s, x, y)` returns a partial state or null, `grid`, `axis`, optional `nudge`, `absolute`, `panel`,
  `lattice(s)` for a handle on a polar grid), `slider` / `scrubber` (`key` or `get`/`set`, optional `format`, scrubbers may `play`),
  `choice` (`key` or `get`/`set`, `options`), `action` (`options` of buttons, `act(state, value)` returns a partial state: the run
  buttons of `chance`; it counts as the mission's one choice).
- state may hold arrays (statistics `data`) and flags that make a figure depend on the mission (`theory` shows the probabilities,
  `hide` keeps one number out of the readout of a `check`): always replace an array, never mutate it. The ctx given to
  `formula`/`readout`/`scene` has `fmt`, `lang` and `unlocked(id)`.
- randomness lives in the model and is seeded (`rng(seed)`); a result is a pure function of the state, so tests and deep links agree.
- `space` experiments declare `views.space = { box, axes, scene, measure }` (the fixed box the view is fitted to; `scene` returns `faces` `{pts, color, alpha, occlude}`, `segs` `{a, b, color, width, dash, arrow}`, `points`, `texts` in world coordinates) and `keys` (the help line, with the turning gestures); a handle control has `at(s)` (3D), `constraint(s)` = `{o, e1, e2?}` (the point is `o + a e1 + b e2`), `grid`, `drag(s, point, {a, b})`.
- in a `predict` mission the shell hides every control (they are locked and would only be clutter); in other missions the locked
  ones stay visible and disabled.
- missions: `predict` (`choices`, `correct`), `explore` (`unlock`, `goal(state, model)`, `done`, `hint`), `contrast`
  (`variants` A/B with `set`; the other variant stays as a faded ghost), `check` (`quantity` from the model, `answer`,
  `tolerance` or `choices`, `because`), `explain` (`argument`, shown after an attempt). `set` is the full start state of the
  mission over `state`. At most 2 handles + 1 slider + 1 choice are unlocked; the A/B buttons of a contrast are its one choice.
- every string is a `[fr, en]` pair; no em or en dashes; French uses a decimal comma (`makeFormat`).
- a new experiment: copy the nearest one, add it to `registry.js`, add its witnesses and independent check to
  `tests/lab-engine.test.mjs`, and a drag check to `tests/lab_browser.py`.


Fourier uses `experiments/fourier.js` (two experiments with 6 and 5 missions) and `templates/fourier.js` (wave, coefficient and DFT drawing views with the shared stage).
