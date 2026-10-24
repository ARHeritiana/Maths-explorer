# site/js/lab/: the laboratory (experiments with missions)

The contract is `docs/LAB_DESIGN.md` (read sections 3 to 7 before changing anything here). One experiment = one maths object
+ one template + 4 to 6 missions. The page, the card and the smoothness rules are the same for every experiment.
`mount.js` `mountExperiment(host, ref, { mode, lang, palette, onMission, onComplete, controls, readout, hint, render })` is the only entry point (lab page in
`app.js`, chapter pages in `chapter-sequence.js`, slides in `slides/widgets.js`). A lab reference is `"<experiment>"` or `"<experiment>/<mission>"`; the route is
`#lab/<experiment>[/<mission>]`.

## Files

| File | Holds |
|---|---|
| `engine.js` | `createStage`: DPR canvas, one rAF scheduler (draws only when dirty), grabbing (nearest handle within `GRAB`: 26 px mouse, 40 px finger), pointer capture, focusable twins of the handles (Tab, arrows), the view cameras (`stage.cam(id)`, `stage.panel(...)`, `stage.view` zoom/pan/reset; plain wheel scrolls the page, Ctrl + wheel, pinch, + − buttons zoom, background drag pans only once zoomed), palette and theme watch; option `onSpin` (3D template: a background drag or the arrow keys with the canvas focused turn the view instead of panning it); `makeFormat` (decimal comma, `(x ; y)`), `setText`/`setAttr`/`setClass` (write only when changed), `createReadout`, `createTable` |
| `format.js` | `makeFormat`: numbers with honest labelling (`num`, `isExact`, `eq`, `rel`, `read`, `ratio`, `full`, `pt`, `iv`, `t`): ≈ for a rounded value, = for an exact one; decimal comma in French; re-exported by `engine.js` |
| `shell.js` | `createShell`: builds the figure and the mission card, runs the five mission kinds (`KINDS`), state, goals, answers, previous/next, `N`/`P`, argument section; exploration is free (every control in every mission, nothing waits; `unlock` marks suggested controls), `gated: true` restores the locks for the future tests (`docs/LAB_DESIGN.md` section 13); `root.__lab` is the hook the browser tests use |
| `mount.js` | `mountExperiment` (modes `full` lab page, `inline` chapter page: canvas, one mission, link to the full page, `slide` player: canvas in the widget host, controls, answer area and stepper in `controls`, formula and readout in `readout`, prompt in `hint`, dark `palette`, fonts x1.3, `render` typesets text, N and P only with canvas focus); loads the template of the experiment |
| `registry.js` | `EXPERIMENTS` (catalogue order, twenty-two with Fourier), `TEMPLATES` (lazy, eight), `TEMPLATE_INFO` (group titles of the index), `SECTION_INFO` (groups about an idea: an experiment with `section` is listed there, its `sub` title as a subsection), `INDEX_ORDER`, `groupOf`, `resolveRef` (THE resolver: `{experiment, mission, index, ref, explicit}` or null), `catalogue()` (lines for `content.js` `labs`) |
| `page.js` | markup of `#lab` (index grouped by type of activity or idea, subsections from `sub`) and of one experiment page (previous / next in index order, the full list folded in a `details`, related lessons and history side by side) |
| `plot.js` | panels and views (fixed designed ranges; `makeView(rect, spec, cam)` and `panelView(stage, id, ...)` apply the view camera to the world ranges, equal-scale panels fill their rectangle), `gridTicks` (grid recomputed for the visible range), axes, the data-driven scene (curves, areas, rects, polys, lines, circles, arcs, points, texts, `rowLabels`; point labels never collide); handle marks (`drawHandle`, `drawHandles`), `buildHandles` (the engine handles of a template) |
| `templates/family.js` | template `family`: one or two panels (`views.row` keeps them side by side; `alignY` gives a panel the vertical scale of another, so links between equal values are horizontal), handles from the experiment's `controls`, links between panels |
| `templates/process.js` | template `process`: `family` + play for scrubbers (reduced motion: one step per press) |
| `templates/chance.js` | template `chance`: histogram of observed frequencies (theory outline only when the state says so) above a tray of the last experiments drawn on the canvas; run buttons are an `action` control |
| `templates/stream.js` | user-started speed-adjustable sampling clock and landing/drawing progress for Buffon/Bertrand, using the single stage scheduler |
| `templates/calculation.js` | native MathML expression, exact value and factorisation; a DOM-only stage with no canvas or gesture interception (Euler and Fermat) |
| `templates/figure.js` | template `figure`: one equal-scale panel, 0 to 4 point handles, a badge with the measured quantity; `axes: false` for a figure that draws its own frame (tiles, number grids, circles, simulations) |
| `templates/data.js` | template `data`: dot plot (one handle per value, equal values stacked) above a summary strip (box plot, mean), shared horizontal scale |
| `templates/space.js` | template `space`: true 3D view (the camera of `../camera3d.js`, shared with the slide widgets), floor grid, axes, faces, segments and points; a part of a segment behind a face marked `occlude` is dashed; a background drag, the arrow keys or `spin` turn the view (never the state), `0` resets it; handles are points constrained to a line or a plane (`constraint(state)` = `{o, e1, e2?}`), snapped, with arrow-key steps; `stage.camera3` holds the angles |
| `templates/transform.js` | template `transform`: `before` and `after` equal-scale panels with the same range, handles in either, dashed link from a point to its image |
| `models/quadratic.js`, `trig.js`, `derivative.js`, `integral.js`, `sequences.js`, `probability.js` (binomial law, seeded simulation `rng`, `simulate`), `vectors.js`, `statistics.js` (quartile convention), `complex.js`, `line.js` (exact fractions of the slope and intercept), `exponential.js`, `cobweb.js` (fixed point, staircase), `matrix.js`, `space-lines.js` (plane polygon and line clipped to a box, intersection, projection), `tiles.js` (square and rectangle pieces, Curry's triangle, the sliver a² − ab − b²), `primes.js` (trial division, factorisation, shared), `euler-primes.js` (n² + n + c), `fermat.js` (2^e + 1, e ≤ 32), `circle-regions.js` (chords, crossings counted from the drawing), `buffon.js`, `bertrand.js` (seeded simulations, three chord methods) | pure maths of each experiment (`model(state)`, `quantities`), no DOM, no `Math.random`; built on `math.js` where it already had the maths |
| `models/num.js` | `clamp` and `snap` |
| `experiments/<id>.js` (quadratic … space-lines, `fourier.js`, and since 19 October 2026 `tiles.js`, `euler-primes.js`, `fermat.js`, `circle-regions.js` (group "a pattern is not a proof"), `buffon.js`, `bertrand.js` (group "geometric probability")) | one per experiment: state, controls, views (`scene`, `formula`, `readout`, `table`), missions, conclusion, history |

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
- exploration is free: every control works in every mission and the mission's `unlock` list only marks the suggested ones;
  with `gated: true` (future tests) a `predict` mission hides every control and other missions show the locked ones disabled.
- missions: `predict` (`choices`, `correct`), `explore` (`unlock`, `goal(state, model)`, `done`, `hint`), `contrast`
  (`variants` A/B with `set`; the other variant stays as a faded ghost), `check` (`quantity` from the model, `answer`,
  `tolerance` or `choices`, `because`), `explain` (`argument`, shown after an attempt). `set` is the full start state of the
  mission over `state`. At most 2 handles + 1 slider + 1 choice are unlocked; the A/B buttons of a contrast are its one choice.
- every string is a `[fr, en]` pair; no em or en dashes; French uses a decimal comma (`makeFormat`).
- a new experiment: copy the nearest one, add it to `registry.js`, add its witnesses and independent check to
  `tests/lab-engine.test.mjs`, and a drag check to `tests/lab_browser.py`.


Fourier uses `experiments/fourier.js` (two experiments with 6 and 5 missions) and `templates/fourier.js` (wave, coefficient and DFT drawing views with the shared stage).

`models/inference.js`: seeded secretary, tank, Benford, baker, birthday and Monty models with exact finite benchmarks separated from simulations.

The quadratic model also supplies vertex/root input conversions and independent opening/discriminant case selectors.
Optional `presentationControls` adds an experiment's parameter controls to the shared slide widget. A slider's optional
`range(state)` is applied before its value, and expands to include the current value when another parameter changes it.

| `models/fair-division.js`, `experiments/fair-division.js` | additive cake valuations, draggable cuts and preferences, discrete allocations, proportionality, envy, EF1 and sincere round robin; exports cake and goods experiments |

`experiments/inference.js` registers secretary, tank, Benford, baker, birthday and Monty missions. `templates/inference.js` renders native interactive cards/doors and accessible frequency tables with the shared shell lifecycle; mathematical models remain in `models/inference.js`.

`experiments/illumination.js`, `templates/illumination.js`: guided mirrored rooms and one retained direct editor, shared with gallery; analytic boundaries and finite-ray limitations.

`models/topology.js`: tangent fields on S²/S¹, Möbius and figure-eight Klein parametrizations, quotient-cell computations of components, boundaries, Euler characteristic and orientability, and finite free-word reduction.
`experiments/topology.js`: `hairy-ball`, `nonorientable-surfaces` and the explicitly finite `banach-tarski-model`, using the shared space/figure templates.

`models/dynamics.js`, `experiments/dynamics.js`, `templates/dynamics.js`: adaptive step-doubling RK4, pendulum and Newtonian three-body experiments, directly draggable positions and velocities, fixed-camera trajectories, nearby comparisons, physical settings and energy/angular diagnostics. `experiments/logistic.js`, `templates/logistic.js` extend the shared `models/cobweb.js` recurrence model to synchronized cobweb/time/bifurcation views and numerical Lyapunov estimates.
