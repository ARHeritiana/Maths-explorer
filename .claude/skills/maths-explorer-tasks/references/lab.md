# Recipe: laboratory experiment or gallery curiosity

The laboratory is rebuilt (docs/LAB_DESIGN.md, 18 October 2026): fourteen experiments in seven templates (family, process, chance,
figure, data, transform, space). The old guided page is gone; `#lab` shows only experiments and `#gallery` only curiosities.

## New experiment, new mission, changed handle (rebuilt laboratory)
1. Read `docs/LAB_DESIGN.md` sections 2 to 5 (research rules R1-R10, templates, contract) and `site/js/lab/CLAUDE.md`.
2. Pure maths: `site/js/lab/models/<id>.js` (`model(state)`, `quantities`, `quantity`). Reuse `math.js` where it exists.
3. `site/js/lab/experiments/<id>.js`: copy the nearest experiment (same template: chance `probability`, figure `vectors`,
   data `statistics`, transform `complex` or `matrix`, family `quadratic` or `exponential`, process `derivative` or `cobweb`, space `space-lines`). Fill `state`, `controls`, `views`
   (`scene`, `formula`, `readout`, optional `table`), 4 to 6 `missions` with the fixed kinds: `predict` first with controls
   locked, one varied thing per mission (`set` is the whole start state), at most 2 handles + 1 slider + 1 choice
   unlocked, at least one `check` that translates between views, `explain` last with a "Pourquoi ?" and an `argument`.
   Strings are `[fr, en]` pairs, no em or en dashes, decimal comma in French (use `fmt.num`, `fmt.pt`). Randomness only through the
   seeded generator of the model (`site/js/lab/models/probability.js` `rng`), never `Math.random` in a model; a figure that must differ between
   missions (theory shown, a number hidden) takes a flag in the state, set by the mission's `set`. Quartiles use the lycée
   convention written in `site/js/lab/models/statistics.js`.
4. Add the experiment to `EXPERIMENTS` in `site/js/lab/registry.js`; its line in the shared catalogue (`content.js`
   `labs`, home, library, pathways) comes from `catalogue()`: do not write it twice.
5. Tests: `tests/lab-engine.test.mjs` fails until the experiment has, for every `check`, an independent recomputation
   in `independent`, for every `explore`, a `witness` state, a `truth` for its prediction, and a sample state in the formula and
   scene tests. Add the experiment to `DRAGS` and `EXPERIMENTS` in `tests/lab_browser.py` (a mission that unlocks a handle, so the
   drag is checked for zero element changes) and to `EXPERIMENTS`, `WITNESS`, `CHECKS` in `tests/browser.py` (walked mission by
   mission), and its drag to the list in `tests/dom-smoke.mjs`.
6. Link from a chapter: `content/data/manifest.json` `catalog.chapters[].labs` holds lab references (`<experiment>` or
   `<experiment>/<mission>`, resolved by `resolveRef` in `site/js/lab/registry.js`); the chapter tab "Chercher" mounts the first one inline and
   links each; then `make site`. In a slide: `lab('<ref>')` in `WIDGETS` of `scripts/build-slides.py`. `tests/lab-links.test.mjs` checks both.
   Every displayed number goes through `fmt` (`rel`, `read`, `ratio`): ≈ when rounded, = when exact.
A `space` experiment (3D, turnable): `views.space = { box, axes, scene, measure }`, a `keys` help line, handles with `at` (3D), `constraint(s)` = `{o, e1, e2?}` and `drag(s, point)`; the camera is `site/js/camera3d.js` (shared with the slide widgets, never write another), see `docs/LAB_DESIGN.md` section 12 and `tests/lab-engine.test.mjs` (the space handle test).
Colours come from CSS tokens through `stage.color(name)` (`accent`, `obj2`, `obj3`, `pos`, `neg`, `c1`..`c8`), never
literals. Camera, drag and keys come from the engine; do not add listeners of your own.

## Gallery curiosity or lab object (not a formula with sliders)
Entry in `labs` with `custom: true` and the object id; code in `site/js/lab-objects.js` (`OBJECTS` registry used by
`mountObject`) or `gallery-objects.js`; pure maths in `gallery-math.js` or the first part of `lab-objects.js`, tested in
`tests/gallery-math.test.mjs` / `tests/lab-objects.test.mjs`. Card drawing in `home-art.js`. Colours come from
`object-kit.js` `palette()`, never literals. Canvas behaviour (zoom, pan, drag, keys) comes from `canvas-navigation.js`;
do not reimplement it. Then follow `release.md`.

New discovery exhibits: `gallery-additions.js` holds their catalogue data. `gallery-models.js` holds Voronoi,
descent and film maths; `gallery-kit.js` shares lifecycle and drawing. Their interfaces are `gallery-voronoi.js`,
`gallery-fastest.js`, `gallery-soap.js`. Knots use `gallery-knot-model.js` and `gallery-knots.js`;
the Einstein family uses `gallery-hat-model.js` and `gallery-hat.js`. Verify with
`tests/gallery-discovery.test.mjs` and `tests/gallery-discovery-dom.test.mjs`.

Spatial gallery revisions: `gallery-knot-geometry.js` computes projections/Fox colour spaces directly from
`knot-catalogue.js` curves; retain `knotinfo-license.txt`. `gallery-soap-model.js` has full-xyz area descent
and a separate tetrahedral junction solver. `gallery-context.js` supplies reading paths for every exhibit.
`makeExpandingFamilyWindow()` in `gallery-hat-model.js` lazily fills the camera window from a nested hierarchy;
never periodically repeat a patch to simulate an aperiodic tiling. Verify spatial revisions with
`tests/gallery-spatial.test.mjs` as well as the discovery/DOM/browser suites.

Free exploration (owner decision, 19 October 2026, `docs/LAB_DESIGN.md` section 13): every control works in every mission and
nothing waits; a mission's `unlock` list only marks the suggested controls. Keep the rules on `unlock` (they feed the future
tests, mounted with `gated: true`). Zoom and pan come from the stage cameras: build views with `plot.js` `panelView`, never a
canvas transform of your own.
