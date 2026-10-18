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
| `shell.js` | `createShell`: builds the figure and the mission card, runs the five mission kinds (`KINDS`), state, goals, answers, previous/next, `N`/`P`, argument section; `root.__lab` is the hook the browser tests use |
| `mount.js` | `mountExperiment` (modes `full`, `inline`, `slide` (stub, Phase 3)); loads the template of the experiment |
| `registry.js` | `EXPERIMENTS` (catalogue order), `TEMPLATES` (lazy), `TEMPLATE_INFO` (group titles of the index), `resolveRef`, `catalogue()` (lines for `content.js` `labs`) |
| `page.js` | markup of `#lab` (index grouped by type of activity) and of one experiment page |
| `plot.js` | panels and views (fixed ranges), axes, the data-driven scene (curves, areas, rects, lines, circles, arcs, points, texts), handle marks |
| `templates/family.js` | template `family`: one or two panels, handles from the experiment's `controls`, links between panels |
| `templates/process.js` | template `process`: `family` + play for scrubbers (reduced motion: one step per press) |
| `models/quadratic.js`, `models/trig.js`, `models/derivative.js`, `models/integral.js`, `models/sequences.js` | pure maths of each experiment (`model(state)`, `quantities`), no DOM; built on `math.js` where it already had the maths |
| `models/num.js` | `clamp` and `snap` |
| `experiments/quadratic.js`, `experiments/trig.js`, `experiments/sequences.js`, `experiments/derivative.js`, `experiments/integral.js` | one per experiment: state, controls, views (`scene`, `formula`, `readout`, `table`), missions, conclusion, history |

## Experiment contract (details beyond docs/LAB_DESIGN.md section 5)

- `controls`: `handle` (`at`, `drag(s, x, y)` returns a partial state or null, `grid`, `axis`, optional `nudge`, `absolute`),
  `slider` / `scrubber` (`key` or `get`/`set`, optional `format`, scrubbers may `play`), `choice` (`key` or `get`/`set`, `options`).
- missions: `predict` (`choices`, `correct`), `explore` (`unlock`, `goal(state, model)`, `done`, `hint`), `contrast`
  (`variants` A/B with `set`; the other variant stays as a faded ghost), `check` (`quantity` from the model, `answer`,
  `tolerance` or `choices`, `because`), `explain` (`argument`, shown after an attempt). `set` is the full start state of the
  mission over `state`. At most 2 handles + 1 slider + 1 choice are unlocked; the A/B buttons of a contrast are its one choice.
- every string is a `[fr, en]` pair; no em or en dashes; French uses a decimal comma (`makeFormat`).
- a new experiment: copy the nearest one, add it to `registry.js`, add its witnesses and independent check to
  `tests/lab-engine.test.mjs`, and a drag check to `tests/lab_browser.py`.
