# site/: module index

Hand-written web source. `make site` copies it into `dist/` (this file excepted) and rewrites the import maps in
`index.html` and `slides/player.html`. Never edit `dist/`. Plain ES modules, no bundler, no framework. Every user-visible
string is a pair `[French, English]` or `pair(fr, en)` / `t(fr, en)`. No em or en dashes in copy.

Pick the row of your feature and open only its files. One-line descriptions are the first comment of each file.

## Shell (every page)

| File | Holds |
|---|---|
| `index.html` | page skeleton, theme bootstrap, generated import map (do not edit the map) |
| `js/app.js` | router and page shell: `route()`, `link()`, `header()` (nav), `footer()`, `render()` (route validity and dispatch), `bindCommon()`; experiment pages mount `js/lab/` (`render()` dispatch, `mountExperiment`); the gallery page of one exhibit (`galleryDetail`, `bindGallery`), challenge and pathway pages |
| `js/ui.js` | theme choice, full-screen presenting |
| `js/icons.js` | Phosphor icon paths, `icon(name, size)` |
| `js/motion.js` | interface motion (`installInterfaceMotion`, `celebrate`, `illuminateFeedback`) |
| `js/control-policy.js` | selectors with one choice become labels |
| `js/resource-editions.js` | exact language edition selection, available language labels and complete pack checks |
| `js/content-language.js` | language of each route (neutral pages vs curriculum pages) |
| `js/data-loader.js` | `assetHref` (versioned URLs), `fetchJSON` |
| `js/catalogue-data.js` | GENERATED from `content/data/manifest.json`: courses, university, asset versions |
| `js/canvas-navigation.js` | camera (zoom, pan, reset) shared with the slide player |
| `js/camera3d.js` | the one orthographic 3D camera (project, unproject, view ray, constraints, turn), used by the laboratory template `space` and by `slides/widgets-3d.js` |
| `styles/explorer.css` | design tokens (both themes), base elements, layout |
| `styles/pages.css` | page and component styles, challenge card colours and animations |

## Content data

| File | Holds |
|---|---|
| `js/content.js` | `labs` (the fourteen experiments are catalogue lines from `js/lab/registry.js`; `custom: true` ones are gallery objects), `challengeBase` / `challenges` (text, topic, hints), `pathways` |
| `js/learning-content.js` | companion lessons on chapter pages (`guides`) |
| `js/study-guides.js` | short starting sheets (built into HTML by `scripts/build-study-guides.mjs`) |

## Laboratory and gallery

| File | Holds |
|---|---|
| `js/lab/` | **the laboratory**: engine, shell, mount (modes `full`, `inline`, `slide`), registry (`resolveRef`), format, templates, models and one file per experiment (quadratic, trig, sequences, derivative, integral, probability, vectors, statistics, complex, line, exponential, cobweb, matrix, space-lines, fourier, tiles, euler-primes, fermat, circle-regions, buffon, bertrand); index in `js/lab/CLAUDE.md`. Also mounted by chapter pages (`chapter-sequence.js`) and by slides (`slides/widgets.js` `type: 'lab'`) |
| `js/math.js` | pure maths shared by the labs (quadratic, sequences, binomial, statistics, Riemann...) |
| `js/lab-objects.js` | `mountObject`: the gallery exhibits (Galton, Reuleaux, Platonic, chaos game and more; pure maths first, then DOM) |
| `js/gallery-objects.js` | Fourier circles, Mandelbrot/Julia explorer |
| `js/gallery-math.js` | pure maths of the gallery (escape times, DFT, Madagascar outline) |
| `js/gallery-additions.js` | six experiment-first gallery entries (with the four colour map) and source labels |
| `js/gallery-models.js`, `js/gallery-kit.js` | Voronoi clipping, descent timing, film area minimisation; shared exhibit lifecycle |
| `js/gallery-voronoi.js`, `js/gallery-fastest.js`, `js/gallery-soap.js` | draggable territories, bead races, rotatable film |
| `js/gallery-knot-model.js` | legacy pure braid/invariant helpers and verified mirror certificate, retained for model tests |
| `js/gallery-knots.js`, `js/gallery-knot-geometry.js`, `js/knot-catalogue.js` | 44 verified spatial curves, preview-style strands, true projections, F3 colours and continuous examples |
| `js/gallery-knot-render.js` | shared solid-colour strand drawing with depth-ordered crossing gaps for the card and full explorer |
| `js/knotinfo-license.txt` | MIT licence for KnotInfo coordinate assets |
| `js/gallery-soap-model.js` | 13 fixed-topology spatial meshes and a separate tetrahedral junction solver |
| `js/gallery-context.js` | mathematical ideas, historical context and applications for all gallery entries |
| `js/gallery-hat-model.js`, `js/gallery-hat.js` | H7/H8 geometry and continuous hat-family explorer |
| `js/gallery-four-colour-model.js`, `js/gallery-four-colour.js` | four colour exhibit: nine menu choices, point-contact and disconnected-country examples, connected-country border editor with undo, shared-border neighbours and exact backtracking colouring |
| `js/platonic-explorer.js`, `js/platonic-fold.js` | Platonic solids and their folding nets |
| `js/object-kit.js` | canvas sizing, `palette()` from CSS tokens, sliders, loop |
| `js/home-art.js` | live drawings of the home page and the gallery cards |
| `js/welcome.js` | home page and gallery index (the "Curiosités" tab of "Lire") |
| `js/gallery-curiosities.js` | catalogue lines (and `links`) of the Game of Life, square packing, moving sofa, inscribed square and opaque square curiosities |
| `js/gallery-sofa-model.js`, `js/gallery-sofa.js` | moving sofa: L-shaped hallway, pose test, penetration and `pushOut` (the walls push the sofa), `resolve` (moves, turns about the centroid, optional guide), Hammersley's family and motion, Gerver's motion, freehand sofas |
| `js/gallery-sofa-gerver.js` | GENERATED by `scripts/build-gallery-data.py sofa`: Gerver's sofa (outline, rotation path, constants) from Romik's equations |
| `js/gallery-inscribed-model.js`, `js/gallery-inscribed.js` | inscribed square: closed spline through control points, self-crossing test, random curves, numerical search for inscribed squares and rectangles; draw, reshape, add or delete points |
| `js/gallery-opaque-model.js`, `js/gallery-opaque.js` | opaque square: gaps of a barrier in each direction, opacity check, preset barriers; draw segments, turn the light |
| `js/gallery-life-model.js`, `js/gallery-life.js` | Game of Life: B3/S23 on the unbounded plane, presets (oscillators, ships, Gosper gun, long evolutions); drawing, play, step |
| `js/gallery-squares-model.js`, `js/gallery-squares.js` | unit squares in a square: separating-axis overlap test, frame, records (status proved, claimed, open), best known packings n = 1 to 28, exact constructions of 5 and 10; drag and turn |
| `js/gallery-squares-data.js` | GENERATED by `scripts/build-gallery-data.py squares`: best known packings and bounds for n = 1 to 28 (the squares project, CC BY 4.0) |

## Reading ("Lire": biographies, stories; the curiosities are the gallery)

| File | Holds |
|---|---|
| `js/reading-content.js` | biographies and stories (bilingual), each with `links` and `sources` |
| `js/reading.js` | `#biographies`, `#stories` pages; `readAlso(hash, own, t)`: the cross-link box shown on texts, curiosities and challenges (own links plus pages linking here) |

## Challenges (`js/challenges/`, one folder per challenge; index in `js/challenges/CLAUDE.md`)

| File | Holds |
|---|---|
| `js/challenges/registry.js` | the list of challenge folders (card order) and the lookups used by `app.js` and `content.js` |
| `js/challenges/<id>/` | everything about one challenge: `index.js`, `maths.js`, `activity.js`, `solution.js` (+ `view-3d.js`, `art.js`) |
| `js/challenges/common/` | shared kit, helpers, emblem frame, solution player, cartoon and 3D kits |

## Courses and resources

| File | Holds |
|---|---|
| `js/resource-library.js` | `#resources` course chooser, `chapterPage`, `bindChapter` |
| `js/chapter-sequence.js`, `js/sequence-model.js` | chapter page tabs and progression built from the chapter deck; the tab "Chercher" shows the chapter's lab references (`labBlock`: first one mounted inline, lazily, destroyed on navigation, a link per reference) |
| `js/visual-lessons.js` | animated companion diagrams |
| `js/library.js` | `#library` filterable resource list; chapter detail with the "Open in the laboratory" links |
| `js/pack-builder.js` | `#pack` custom pack builder, `#sources` LaTeX sources |
| `js/slides-page.js` | `#slides` deck index (HTML and lecture PDF editions) |
| `js/university.js`, `js/university-model.js` | `#university` pages and pathway summaries |
| `js/quadratic-workshop.js` | `#workshop/quadratic` five-stage workshop |
| `resources/document-theme.css` | style of generated HTML resource pages |
| `resources/basics/place-value.html` | Self-contained first foundation: regrouping and place-value activity; embedded by `js/app.js` |

## Slide player (`slides/`; any change here rebuilds every deck export)

| File | Holds |
|---|---|
| `slides/player.html`, `slides/player.css`, `slides/player.js` | standalone player (1280x720 stage, steps, toolbar); the import map also lists `../js/lab/**`, `math.js`, `object-kit.js`; `player.css` carries the `.lab2-*` styles of a lab widget |
| `slides/edition-policy.js` | explicit available deck editions; curriculum default language, supported direct language requests and unavailable-edition handling |
| `slides/widgets.js` | widget registry `mount`, drawing and readout helpers; `type: 'lab'` (`mountLab`: loads `js/lab/mount.js` on demand, dark palette `LAB_PALETTE`, `uniHTML` turns the experiment's Unicode into MathJax markup) |
| `slides/widgets-2d.js`, `slides/widgets-3d.js` | 2D widgets; true 3D widgets |

## Third party

`vendor/` (MathJax, JSZip, pdf-lib; see `vendor/README.md`), `fonts/` (with licences). Do not read.


Fourier: `js/fourier-model.js` (pure signals and error), `js/fourier-links.js` (catalogue-derived triangle).

Discovery: `js/topic-registry.js` is the shared overlapping topic/subtopic registry; `js/discovery-index.js` assembles canonical records, counts, filtering and reciprocal recommendations; `js/discovery.js` renders the topic browser; `js/discovery-previews.js` supplies bounded, static illustrations of the actual named models, shared coordinates and exact topic metadata.

History: `js/history-data.js` holds sourced people and advances; `js/history.js` renders the timeline and detail routes, with `styles/history.css`; `js/history-layout.js` owns period scales and collision-free lanes; `js/history-images.js` holds image sources and licence metadata for the local WebP copies in `data/history/`; `js/reading-history-content.js` supplies the linked Galois biography.

Inference: `js/inference-content.js` shares assumptions, formal arguments and citations among six laboratories, `js/gallery-inference.js` mounts those same experiments from gallery cards; styles in `styles/inference.css`.

`js/illumination-model.js`: analytic specular reflection on segments, ellipse arcs and quadratic Bezier curves, polygon validation and unfolding. `js/illumination-presets.js`: documented Penrose, Tokarsky and Wolecki coordinate reconstructions.

`js/illumination-content.js`: catalogue and sourced lesson for mirrored rooms, shared gallery/lab mounting.

`js/gallery-gomboc.js`, `js/gallery-gomboc-model.js`: lazy certified-polytope inspection and rigid-body contact simulation, using the shared 3D camera; `js/gomboc-content.js` holds the gallery and formal reading text. `js/gomboc-preview.js` is generated visual geometry for the visible card only. `data/gomboc/body.bin`, `data/gomboc/body.json`, `data/gomboc/polytope.npz`, `data/gomboc/LICENSE.txt`, `data/gomboc/README.txt` retain the full contact geometry, original halfspaces, measurements and licence, generated by `scripts/build-gomboc.py`.

Fair division: `js/fair-division-content.js` holds gallery and formal reading entry points; `js/gallery-fair-division.js` mounts the same cake and goods laboratories.
Topology: `js/topology-content.js` holds tangent fields, surfaces and Banach-Tarski reading/gallery entry points; `js/gallery-topology.js` reuses the guided laboratories.

`js/dynamics-content.js` shares original sourced pendulum, three-body and logistic explanations across reading and gallery. `js/gallery-dynamics.js` mounts those same laboratory simulations in gallery entries.
