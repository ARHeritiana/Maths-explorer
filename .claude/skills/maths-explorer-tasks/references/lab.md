# Recipe: laboratory experiment or gallery curiosity

Guided lab (formula and sliders):
1. `site/js/content.js` `labs`: add the entry (id, title, parameters `[name, min, max, step]`, text). Copy a neighbour.
2. `site/js/math.js`: pure computation, with a test in `tests/math.test.mjs`.
3. `site/js/app.js` `updateLab()`: search `lab.id === "` for the nearest similar lab and add the drawing branch;
   controls in `bindLab()` only if the lab has extra inputs.

Gallery curiosity or lab object (not a formula with sliders): entry in `labs` with `custom: true` and the object id;
code in `site/js/lab-objects.js` (`OBJECTS` registry used by `mountObject`) or `gallery-objects.js`; pure maths in `gallery-math.js` or the
first part of `lab-objects.js`, tested in `tests/gallery-math.test.mjs` / `tests/lab-objects.test.mjs`. Card drawing
in `home-art.js`. Colours come from `object-kit.js` `palette()`, never literals.

Canvas behaviour (zoom, pan, drag, keys) comes from `canvas-navigation.js` and `interaction.js`; do not reimplement it.
Then follow `release.md`.

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
