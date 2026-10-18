# site/js/lab/: the laboratory (experiments with missions)

The contract is `docs/LAB_DESIGN.md` (read sections 3 to 7 before changing anything here). One experiment = one maths object
+ one template + 4 to 6 missions. The page, the card and the smoothness rules are the same for every experiment.
`mount.js` `mountExperiment(host, ref, { mode, lang, palette, onMission, onComplete })` is the only entry point (lab page in
`app.js`; chapter pages and slides later). A lab reference is `"<experiment>"` or `"<experiment>/<mission>"`; the route is
`#lab/<experiment>[/<mission>]`.

## Files

| File | Holds |
|---|---|
| `engine.js` | `createStage`: DPR canvas, one rAF scheduler (draws only when dirty), handle hit-test (22 px radius), pointer capture, focusable twins of the handles (Tab, arrows), shared camera, palette and theme watch; `makeFormat` (decimal comma, `(x ; y)`), `setText`/`setAttr`/`setClass` (write only when changed), `createReadout`, `createTable` |
| `format.js` | `makeFormat`: numbers with honest labelling (`num`, `isExact`, `eq`, `rel`, `read`, `ratio`, `full`, `pt`, `iv`, `t`): ≈ for a rounded value, = for an exact one; decimal comma in French; re-exported by `engine.js` |
| `shell.js` | `createShell`: builds the figure and the mission card, runs the five mission kinds (`KINDS`), state, goals, answers, previous/next, `N`/`P`, argument section; `root.__lab` is the hook the browser tests use |
| `mount.js` | `mountExperiment` (modes `full`, `inline`, `slide` (stub, Phase 3)); loads the template of the experiment |
| `registry.js` | `EXPERIMENTS` (catalogue order, nine), `TEMPLATES` (lazy, six), `TEMPLATE_INFO` (group titles of the index), `resolveRef`, `catalogue()` (lines for `content.js` `labs`) |
| `page.js` | markup of `#lab` (index grouped by type of activity) and of one experiment page |
| `plot.js` | panels and views (fixed ranges), axes, the data-driven scene (curves, areas, rects, polys, lines, circles, arcs, points, texts, `rowLabels`; point labels never collide); `widen` spreads an equal-scale panel over the whole width, handle marks, `buildHandles` (the engine handles of a template) |
| `templates/family.js` | template `family`: one or two panels, handles from the experiment's `controls`, links between panels |
| `templates/process.js` | template `process`: `family` + play for scrubbers (reduced motion: one step per press) |
| `templates/chance.js` | template `chance`: histogram of observed frequencies (theory outline only when the state says so) above a tray of the last experiments drawn on the canvas; run buttons are an `action` control |
| `templates/figure.js` | template `figure`: one equal-scale panel, 2 to 4 point handles, a badge with the measured quantity |
| `templates/data.js` | template `data`: dot plot (one handle per value, equal values stacked) above a summary strip (box plot, mean), shared horizontal scale |
| `templates/transform.js` | template `transform`: `before` and `after` equal-scale panels with the same range, handles in either, dashed link from a point to its image |
| `models/quadratic.js`, `trig.js`, `derivative.js`, `integral.js`, `sequences.js`, `probability.js` (binomial law, seeded simulation `rng`, `simulate`), `vectors.js`, `statistics.js` (quartile convention), `complex.js` | pure maths of each experiment (`model(state)`, `quantities`), no DOM, no `Math.random`; built on `math.js` where it already had the maths |
| `models/num.js` | `clamp` and `snap` |
| `experiments/<id>.js` (nine) | one per experiment: state, controls, views (`scene`, `formula`, `readout`, `table`), missions, conclusion, history |

## Experiment contract (details beyond docs/LAB_DESIGN.md section 5)

- `controls`: `handle` (`at`, `drag(s, x, y)` returns a partial state or null, `grid`, `axis`, optional `nudge`, `absolute`, `panel`,
  `lattice(s)` for a handle on a polar grid), `slider` / `scrubber` (`key` or `get`/`set`, optional `format`, scrubbers may `play`),
  `choice` (`key` or `get`/`set`, `options`), `action` (`options` of buttons, `act(state, value)` returns a partial state: the run
  buttons of `chance`; it counts as the mission's one choice).
- state may hold arrays (statistics `data`) and flags that make a figure depend on the mission (`theory` shows the probabilities,
  `hide` keeps one number out of the readout of a `check`): always replace an array, never mutate it. The ctx given to
  `formula`/`readout`/`scene` has `fmt`, `lang` and `unlocked(id)`.
- randomness lives in the model and is seeded (`rng(seed)`); a result is a pure function of the state, so tests and deep links agree.
- in a `predict` mission the shell hides every control (they are locked and would only be clutter); in other missions the locked
  ones stay visible and disabled.
- missions: `predict` (`choices`, `correct`), `explore` (`unlock`, `goal(state, model)`, `done`, `hint`), `contrast`
  (`variants` A/B with `set`; the other variant stays as a faded ghost), `check` (`quantity` from the model, `answer`,
  `tolerance` or `choices`, `because`), `explain` (`argument`, shown after an attempt). `set` is the full start state of the
  mission over `state`. At most 2 handles + 1 slider + 1 choice are unlocked; the A/B buttons of a contrast are its one choice.
- every string is a `[fr, en]` pair; no em or en dashes; French uses a decimal comma (`makeFormat`).
- a new experiment: copy the nearest one, add it to `registry.js`, add its witnesses and independent check to
  `tests/lab-engine.test.mjs`, and a drag check to `tests/lab_browser.py`.
