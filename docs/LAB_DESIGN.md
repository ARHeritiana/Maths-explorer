# Laboratory v2: design and architecture

Status: decided 18 October 2026 (owner request: "the laboratory is not smooth, has too many sliders, and the idea is not
clear; devise a standard laboratory function, fixed templates, and a structure lessons and slides can link to").
This document is the contract for the rebuild. The gallery (`#gallery`, `custom: true` entries) is out of scope.

## 1. Diagnosis of the current laboratory

| Problem | Cause in the code |
|---|---|
| Dragging is not smooth | `site/js/app.js` `updateLab()` rebuilds the whole SVG chart, the readouts and the data table as HTML strings and assigns `innerHTML` on every animation frame of a drag; the slide widgets (`site/slides/widgets.js`) already use a retained canvas and are smooth. |
| Too many sliders | every parameter is a slider (`content.js` `params`), plus radio groups, plus a notes form; handles on the graph exist but are secondary. Up to 4 sliders + 2 fieldsets visible at once. |
| The idea is not clear | one long page mixes predict, steps, notes, a quiz, a proof, history; nothing says what to do *now*. The steps are text, not states of the experiment. |
| Two engines for the same maths | the lab (9 hard-coded `if (lab.id === ...)` branches in `app.js`, about 900 lines) and the slide widgets (30 types in `widgets-2d.js` / `widgets-3d.js`) draw the same parabolas, vectors and integrals twice, with different behaviour. Lessons link to a lab only by id (`manifest.json` `catalog.chapters[].labs`). |

## 2. What research says (and the rule each finding gives)

Only findings checked on 18 October 2026 are listed; effect sizes are quoted from the abstracts named.

| Finding | Source | Design rule |
|---|---|---|
| Unassisted discovery does worse than explicit instruction (d = -0.38); *enhanced* discovery (feedback, worked examples, scaffolding, elicited explanations) does better than other instruction (d = 0.30). | Alfieri, Brooks, Aldrich, Tenenbaum (2011), *Journal of Educational Psychology* 103(1), 1-18 | R1. Never an open sandbox. Every experiment is a sequence of short **missions** with a goal, feedback and an explanation. |
| Prompting learners to explain gives a medium effect (g = 0.55; interrogative and "justify" prompts work, generic metacognitive prompts less). | Bisra, Liu, Nesbit, Salimi, Winne (2018), *Educational Psychology Review* | R2. Each experiment has at least one "Why?" prompt tied to what the learner just saw, not a generic "write your notes". |
| Problem solving before instruction can help when it is followed by instruction that builds on the learners' attempts. | Sinha and Kapur (2021), *Review of Educational Research* [VERIFY effect sizes in the published version] | R3. **Predict first**: the first mission asks for a prediction *before* the controls unlock; the explanation comes last and refers back to the prediction. |
| Simply linking representations dynamically did not improve learning over non-linked ones; learners stayed passive. | van der Meij and de Jong (2006), *Learning and Instruction* 16, 199-212 (as reported by citing papers) | R4. Linked views (graph, formula, table) are shown, but at least one mission asks the learner to *translate* between them (read a value on the graph, predict the formula). |
| Multiple representations work by complementing, constraining and building abstraction; the learner must understand each and their relation. | Ainsworth (2006), DeFT, *Learning and Instruction* 16(3), 183-198 | R5. At most three representations at once, each with a stated role; new representations appear only when a mission needs them. |
| Guidance through built-in affordances and constraints ("implicit scaffolding") supports inquiry without written instructions. | Podolefsky, Moore, Perkins (2013), arXiv:1306.6544; Moore, Herzog, Perkins (2013), *Chem. Educ. Res. Pract.* | R6. **Focused constraint**: each mission unlocks only the controls it needs (at most 2 handles + 1 slider + 1 choice). Others are locked, not hidden. |
| Virtual manipulatives show moderate positive effects; features that help: simultaneous linking, efficient precision, focused constraint, creative variation. | Moyer-Packenham et al. (2016 revisit of the 2013 meta-analysis) | R6 again, and R7: values snap to a sensible grid; exact values (fractions, roots) are shown when the state is exact. |
| Dragging serves different functions (exploring, conjecturing, validating); these do not emerge alone but from task design and teacher intervention. | Arzarello, Olivero, Paola, Robutti (2002), *ZDM* 34(3), 66-72 | R8. Missions name the dragging goal: "drag until...", "keep ... fixed while dragging ...", "find every position where ...". |
| Learners discern a feature when it varies against a background that stays fixed (contrast, generalisation, separation, fusion). | Marton's variation theory (secondary summaries; cite Marton and Tsui 2004 only after checking) | R9. Each mission varies **one** thing; the others are fixed by the mission's `set` state. Order: contrast, then generalise, then vary together. |
| Concrete first, then fading to the formal. | Fyfe, McNeil, Son, Goldstone (2014), *Educational Psychology Review* 26, 9-25 | R10. Formula and numbers are always visible next to the figure (no split attention), and the final mission asks for the general statement. |
| Dynamic geometry software shows large average effects in classroom studies (Juandi et al. 2021, *Heliyon*: 0.96, 29 studies); other meta-analyses report 0.65 to 1.18. | as named | Confirms the investment; not a design rule. |

Experiments give evidence, not proof: every experiment ends with the argument (brief section 1, "Honest labelling").

## 3. The standard laboratory function

Every laboratory item is one **experiment** = one mathematical object + a fixed **template** + 3 to 6 **missions**.
The page is always the same:

```
┌──────────────────────────────── canvas (the main content) ───────────────┐  ┌── mission card ───────────┐
│  draggable handles, camera (zoom/pan/reset), one readout strip under it: │  │ Mission 2/5 · Explore     │
│  formula + 2 or 3 live numbers (contiguous with the figure)              │  │ instruction (1 to 2 lines)│
└──────────────────────────────────────────────────────────────────────────┘  │ [unlocked controls only]  │
                                                                              │ answer / choice / Why?    │
                                                                              │ ◀ previous     next ▶     │
                                                                              └───────────────────────────┘
 below: "Argument" (after the last mission) · related lessons and slides · history (collapsed)
```

Mission kinds (fixed vocabulary):

| Kind | What the learner does | Controls | Feedback |
|---|---|---|---|
| `predict` | chooses or types a prediction; controls locked | none until answered | none; the prediction is kept and recalled in `explain` |
| `explore` | drags towards a stated goal ("until the curve touches the axis") | the mission's `unlock` list | `goal(state)` true → short confirmation, next unlocks |
| `contrast` | compares two preset states (button A / B, or a ghost of the previous state) | one control | the difference is highlighted on the figure |
| `check` | answers a question (number, choice); the figure is set for it | locked or one control | exact comparison with tolerance; "not yet" sends back to the figure |
| `explain` | reads the argument; answers one "Why?" | none | reveals the argument after an attempt |

Phone first: below 720 px the mission card is a bottom sheet over the canvas (canvas stays at least 55 vh). 44 px targets.
Keyboard: Tab reaches handles; arrows move the focused handle by one grid step, Shift+arrows pan, `+ - 0` zoom
(existing `canvas-navigation.js` policy); `N` / `P` next and previous mission.

## 4. Templates (fixed; every experiment uses exactly one)

| Template | Object and learning function | Views | Typical handles | Experiments (current lab → new) |
|---|---|---|---|---|
| `family` | a function family: how a parameter changes the graph | graph, formula, optional sign/variation table or unit circle | points on the curve (vertex, intercept, a point) that *are* the parameters | quadratic, trig (with unit circle), line, exp, log, inverse, square/inverse reference |
| `process` | a process indexed by n or h approaching a limit | graph, value table of the process, scrubber with play | the index (h, n) and the base point | derivative (secant to tangent), integral (Riemann sums), sequences, cobweb, limits |
| `chance` | a random experiment: frequency against probability | tray of outcomes, histogram, theory overlay revealed in `explain` | run 1 / 10 / 100 / 1000, one parameter (p, n) | probability (binomial), dice sums, trees as a sampler |
| `figure` | a dynamic figure with an invariant to discover | figure, one measured quantity highlighted | 2 to 4 points | vectors (determinant, collinearity), dot product, triangle, line through two points |
| `data` | a data set: summaries respond to each value | number line or scatter, summary strip (mean, median, quartiles, line) | each data point | statistics, box plot, regression |
| `transform` | a map applied to points, a figure or a grid | before and after (or one plane with ghost) | the parameter of the map (z, matrix columns) and a test point | complex multiplication, matrix 2x2, roots of unity |
| `space` | a 3D object, rotatable, with constrained points | 3D view, coordinates | points constrained to lines and planes | plane and normal, line in space, line and plane |

A new experiment that fits no template is a sign it belongs in the gallery, or that a template is missing; adding a
template is a design decision recorded here.

## 5. Code structure

```
site/js/lab/
  CLAUDE.md               folder index (required by tests/map.test.mjs)
  engine.js               stage: DPR canvas, ResizeObserver, one requestAnimationFrame scheduler (draw only when dirty),
                          handle hit-testing (22 px radius = 44 px target), pointer capture, keyboard handles,
                          camera from canvas-navigation.js, palette from object-kit.js palette() or the slide palette,
                          readout diffing (write text only when it changed; never innerHTML during a drag)
  shell.js                mission card, predict/goal/check logic, mode layouts ('full' | 'inline' | 'slide'), URL sync
  mount.js                mountExperiment(host, ref, { mode, lang, palette, controls, readout, hint }) → { setMission,
                          getState, setState, destroy }  (the only entry point used by app.js, chapter pages, slides)
  registry.js             id → experiment module (lazy import), list for the #lab index
  templates/<name>.js     one per template: view + interaction; uses engine.js; no experiment-specific code
  experiments/<id>.js     one per experiment: pure data + model import (see contract below)
  models/<name>.js        pure maths shared by templates and tests (move from math.js / trigonometry.js as needed)
```

Experiment contract (`experiments/<id>.js`, default export):

```js
export default {
  id: "quadratic", template: "family",
  title: ["La fabrique des paraboles", "The parabola workshop"], level: ["Première", "Upper secondary"],
  model: quadraticModel,                  // pure: state → derived values (roots, vertex, Δ ...)
  state: { a: 1, b: 0, c: -2 },           // defaults; every mission `set` is a partial state
  controls: {                             // every control the experiment can unlock
    vertex: { kind: "handle", at: s => [...], drag: (s, x, y) => ({ ... }), grid: 0.5 },
    a: { kind: "slider", min: -3, max: 3, step: 0.25, label: "a" },
  },
  views: { graph: { x: [-6, 6], y: [-5, 7] }, formula: s => "...", readout: s => [["Δ", ...], ...] },
  missions: [
    { id: "open", kind: "predict", prompt: [fr, en], choices: [[fr, en], ...] },
    { id: "vertex", kind: "explore", set: { a: 1, b: 0 }, unlock: ["vertex"], prompt: [fr, en], goal: s => ... },
    { id: "roots", kind: "check", set: { a: 1, b: 0, c: -4 }, prompt: [fr, en], answer: 2 },
    { id: "why", kind: "explain", prompt: [fr, en], argument: [fr, en] },
  ],
  history: { ... },                       // optional, shown collapsed
};
```

Rules enforced by a test: at most 2 handles + 1 slider + 1 choice per mission; every `set` key exists in `state`;
every string is a `[fr, en]` pair without em or en dashes; every `answer` is recomputed from `model` in the test.

## 6. Linking: one reference, three places

A **lab reference** is `"<experiment>"` or `"<experiment>/<mission>"` (example `quadratic/vertex`).

| Where | How | Single source |
|---|---|---|
| Lab page | route `#lab/<experiment>[/<mission>]`; the mission in the URL is updated as the learner advances | `registry.js` |
| Chapter pages and the course chooser | `content/data/manifest.json` `catalog.chapters[].labs` holds lab references (today: experiment ids, which stay valid). The chapter page shows "Open in the laboratory" per reference and may mount one `inline` (canvas + that mission + link to the full page). | `manifest.json` |
| Classroom slides | `scripts/build-slides.py` `WIDGETS` accepts `{'type': 'lab', 'ref': 'quadratic/vertex'}`; `site/slides/widgets.js` `mount()` dispatches `type: 'lab'` to `mountExperiment(..., { mode: 'slide' })`, with the player's dark palette, its `#wctl` controls area and `#readout`. | the experiment file |

Every reference is checked by a test (`tests/lab-links.test.mjs`): manifest references and slide `WIDGETS` references
resolve to an experiment and mission. Old slide widget types that duplicate an experiment (`quad`, `seq`, `vec`,
`tangent`, `integral`, `complex`, `stats`, `binom`, `circle`, `line`, `fn`, `ref`, `cobweb`, `matrix2`, `plane3d`,
`line3d`, `lineplane`, `scatter`) migrate to `type: 'lab'` one by one; the old widget is deleted when no deck uses it.

## 7. Smoothness requirements (acceptance)

- A drag repaints one canvas per frame; no element is created or replaced during a drag (browser test counts DOM
  mutations during a scripted drag: 0 outside the readout text nodes).
- Readouts: text nodes updated only when the string changes; MathJax is never called during a drag (formula in plain
  HTML with `<sup>`/italics during interaction, typeset at rest only if MathJax is present).
- Camera independent of state (brief section 5): changing parameters never rescales; "fit" is an explicit action.
- `prefers-reduced-motion`: no idle animation; the handle pulse is static.
- Works at 320 px wide with no horizontal scroll, both themes, keyboard only.

## 8. Phases

1. Engine, shell, mount, registry; templates `family` and `process`; experiments `quadratic`, `trig`, `derivative`,
   `integral`, `sequences` on the new lab page. Old code for these five removed from `app.js`.
2. Templates `chance`, `figure`, `data`, `transform`; experiments `probability`, `vectors`, `statistics`, `complex`.
   Old lab code (`updateLab`, `bindLab`, `chart`, guided entries of `content.js` `labs`, `interaction.js` if unused)
   removed. `#lab` index groups experiments by template ("type of activity") with the chapter level.
3. Linking: `type: 'lab'` in the slide player, chapter-page inline mount, `tests/lab-links.test.mjs`; migrate the
   duplicated slide widget types where an experiment exists.
4. Template `space` and new experiments from the remaining widget types (line, exp/log/inverse, cobweb, matrix 2x2,
   plane and line in space), each with missions.

## 9. Implementation notes (Phase 1, 18 October 2026)

What differs from sections 3 to 7, and why. Nothing here changes a rule; it records the smallest choices made.

| Point | Contract | Phase 1 |
|---|---|---|
| Registry | experiments imported lazily | the five experiment files are imported statically by `registry.js` (small data modules) because the home page, the library and the pathways need their titles synchronously (`catalogue()` feeds `content.js` `labs`, one source); the templates stay lazy |
| Extra files | engine, shell, mount, registry, templates, models, experiments | plus `plot.js` (drawing primitives shared by the templates), `page.js` (markup of `#lab` and of an experiment page), `models/num.js` (`clamp`, `snap`) |
| Mission fields | `set`, `unlock`, `goal`, `prompt`, `answer`, `argument` | plus `quantity` (names the model quantity a `check` asks for, so the test recomputes the answer), `correct` (the true choice of a `predict`, recalled in `explain`), `variants` (the A and B states of a `contrast`; the other one stays as a faded ghost), `choices`, `tolerance`, `hint`, `done`, `because`; the experiment has `conclusion` (the general argument shown after the last mission) |
| Control kinds | handle, slider | plus `scrubber` (a slider with play, `process` template only) and `choice`; handles take `axis`, `nudge` (keyboard step) and `absolute` (no grab offset); sliders and choices may use `get`/`set` instead of a state key |
| Count rule | at most 2 handles + 1 slider + 1 choice | the A and B buttons of a `contrast` count as its one choice |
| Mission start | `set` is a partial state | a mission always starts from `state` overlaid with its `set`, so a deep link and the sequential path give the same figure |
| Phone | mission card as a bottom sheet | sticky card above the tab bar, 40 vh high at most, with a fold button; the canvas is 55 vh |
| Formulas | MathJax at rest if present | MathJax is not used: formulas are plain text with Unicode (x², uₙ), written only when the string changes |
| Quadratic | a may reach 0 | a is never 0 (0.25 is the smallest step): the vertex stays fixed while a changes, and a = 0 is not a quadratic |
| Camera | `canvas-navigation.js` | reused as is; text on the canvas scales with the zoom, as in the slide player |
| Test hook | none | `root.__lab` on the experiment's root element (`getState`, `setState`, `setMission`, `mission`) for `tests/lab_browser.py` and `tests/browser.py` |


## 10. Implementation notes (Phase 2, 18 October 2026)

Phase 1 (section 9) conventions still hold. What Phase 2 added or decided, and why.

| Point | Contract | Phase 2 |
|---|---|---|
| Templates | `chance`, `figure`, `data`, `transform` | one file each in `templates/`; `plot.js` gained `buildHandles` (shared by all templates, `family` uses it too), the `polys` scene object, hollow rectangles, line alpha and collision-free point labels |
| Control kinds | handle, slider, choice | plus `action`: buttons that each do something once (run 1, 10, 100, 1 000 experiments, new series). It counts as the mission's one choice, like the A and B buttons of a contrast |
| Locked controls | locked, not hidden | hidden in a `predict` mission (nothing to operate before the learner has predicted); in other missions locked controls stay visible and disabled |
| Phone | bottom sheet over the canvas (Phase 1: sticky card, 40 vh) | the mission card follows the figure in normal flow and never covers it; `tests/lab_browser.py` checks that the two boxes do not intersect at 390 x 844 and 320 x 640; the fold button collapses the card |
| Fixed ranges | the camera never depends on the state | `chance` draws one bar per k, so the horizontal range of the histogram follows n; this is the only state-dependent range, it changes only when n changes (no mission lets the learner change n) |
| Randomness | seedable generator in the model | `models/probability.js`: mulberry32 `rng(seed)`; a series is a pure function of (seed, n, p, runs), so the same draws are reused when p changes and the first N experiments do not depend on how the buttons were pressed; the missions pin their seeds, the button "Nouvelle série" picks another |
| Theory overlay | revealed only in `explain` | the state flag `theory` (set by the last mission's `set`); the marker E = np appears only when its handle is unlocked or the theory is shown |
| Mission-dependent figures | not covered | state flags (`theory`, `hide`) rather than shell code, so a figure stays a pure function of the state |
| Handles | at most 2 per mission | `statistics` has one handle per value (seven controls, `d0` to `d6`); each mission unlocks one or two of them; the `complex` handle z moves on a polar grid (modulus 0,25, argument 15 degrees) and declares a `lattice` so that tests only round-trip lattice states |
| Statistics text entry | the text data entry may stay | dropped: a free text box unlocks every value at once, against the focused-constraint rule R6 |
| Complex maps | multiplication by z | the maps square, inverse and conjugate of the old explorer are not kept; `translate` stays as the contrast with `multiply`; the tests of the old explorer's pure maps moved to `tests/lab-engine.test.mjs` (modulus and argument rules, linear local factor, division undoes the product) |
| Vectors | determinant, collinearity | the dot product of the old lab is not in the experiment (it is a different invariant); the pathway notes that named it were reworded |
| Quartiles | not specified | Q1 (Q3) is the smallest value with at least 25 % (75 %) of the series at or below it; stated in `models/statistics.js` and in the check mission |
| Removed | old guided code | `app.js` `labPage`, `updateLab`, `bindLab`, `chart`, `bindPlot`, `interactionGuide`; `content.js` guided entries; `interaction.js`, `createLabMotion` in `motion.js`, `complex-explorer.js` and the "Autres expériences guidées" section; the gallery keeps `galleryDetail` and `bindGallery` (quiz, reset, history, reading paths) |


## 11. Implementation notes (Phase 3, 18 October 2026)

Phases 1 and 2 (sections 9 and 10) still hold. What Phase 3 added or decided, and why.

| Point | Contract | Phase 3 |
|---|---|---|
| Honest labelling | not specified | a rounded number is written with ≈, an exact one with =, everywhere an experiment shows a number (formula, readout, table cell, canvas label, badge). One formatter, `site/js/lab/format.js` (`rel`, `read`, `ratio`, `eq`, `isExact`, `pt`), tested in `tests/lab-engine.test.mjs`. Short exact fractions are shown: 33/7 ≈ 4,71. In a readout card or table cell the value stands alone: it is written bare when exact (the card's label is the equation) and with a leading ≈ when rounded; inside a sentence or a label it is `x = 6` or `x ≈ 4,71`. A point `(x ; y)` carries a leading ≈ when a coordinate is rounded. Intermediate values of a calculation chain are written with six decimals (`full`) so that the = signs inside the chain stay true |
| Phone readout | not specified | cards two or three to a row (columns of at least 104 px), a long value takes the whole row; no more one card per row |
| Equal-scale panels | camera never depends on the state | `widen` (vectors): the range of the axis that has room grows with the size of the panel so that the figure uses the whole width at equal scale; it depends on the size of the stage only |
| Box-plot labels | not specified | `scene.rowLabels`: the five labels (min, Q1, median, Q3, max) in one row above the box, in order, spreading sideways when they would touch, with a thin leader to the true position; the numbers are not written (a mission asks to read them) |
| Resolver | `resolveRef(ref)` returns `{experiment, mission}` or null | returns `{experiment, mission, index, ref, explicit}`: `mission` is the mission object (the first one when the reference names only the experiment), `ref` the normal form, `explicit` whether a mission was named. `mountExperiment` falls back to the experiment when the mission is unknown (an old deep link still opens the page); the lab route, `library.js`, chapter pages, slides and tests all use it |
| Slide mode | `mountExperiment(host, ref, {mode: 'slide', lang, palette, controls, readout, hint})` | also `render`: the player typesets every formula with MathJax, so the experiment's Unicode (x², uₙ, ≈, 35°, π/6, √3/2) is turned into `\( ... \)` markup by `slides/widgets.js` `uniHTML`, every number included. The canvas fills the widget host (340 px high), the stage fonts are x1.3, the stepper is `previous, 3/6 Explorer, next` with no gating by progress, the `explain` mission has a reveal button instead of a text box, no table, no link to the lab. `.lab2-*` styles for the player are in `player.css` (the site style sheets are not loaded there). Focus stays on the canvas when the mission changes, so N and P can be pressed again |
| Slide export | one self-contained file per deck | `scripts/export-slides.py` bundles `site/js/lab/` behind a small module registry (`__d`, `__r`) for the decks that have a lab widget only (about 2 MB more in total); `tests/lab-links.test.mjs` runs the bundled registry in a sandbox |
| Player import map | generated | `build/mxbuild/site.py` `versioned_player` also lists `../js/lab/**`, `../js/math.js`, `../js/object-kit.js` (same URLs as `index.html`, cache-busted by content) |
| Chapter pages | "may mount one `inline`" | the tab "Chercher" of `#chapter/<id>` shows, for the chapter's `labs` references (`catalog.chapters[].labs`, copied into the companion catalogue by `catalog.py`), the first one mounted inline when it scrolls into view (IntersectionObserver; at once without it), and a link "Ouvrir dans le laboratoire" for each; destroyed with the tab or on navigation. A deck's lab widget slide shows no second mount on that tab when the chapter already names the experiment. `#library/<id>` lists the same links |
| Migrated widgets | `quad`, `tangent`, `integral`, `seq`, `circle`, `vec`, `complex` (product), `stats`, `binom` | all migrated where an experiment covers the slide; functions deleted: `quad`, `seq`, `tangent`, `integral`, `stats`, `binom`, `circle`. Kept: `vec` (premiere-03 and premiere-07 need norm, orthogonality and the dot product, which the vectors experiment does not show), `complex` modes alg and polar (conjugate, modulus and argument of one number), and every widget with no experiment (`line`, `fn`, `ref`, `cobweb`, `limit`, `convex`, `tree`, `rv`, `scatter`, `interval`, `pct`, 3D, `matrix2`, `walks`, `markov`, `cquad`, `roots`, `modclock`) |
| Without TeX | | the deck builder compiles figures with `pdflatex`; where TeX is missing the decks are rebuilt with the committed figure SVGs (identical output) and the build receipt adopted, see `build/mxbuild/CLAUDE.md` |
