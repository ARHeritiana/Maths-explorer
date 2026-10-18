# site/: module index

Hand-written web source. `make site` copies it into `dist/` (this file excepted) and rewrites the import maps in
`index.html` and `slides/player.html`. Never edit `dist/`. Plain ES modules, no bundler, no framework. Every user-visible
string is a pair `[French, English]` or `pair(fr, en)` / `t(fr, en)`. No em or en dashes in copy.

Pick the row of your feature and open only its files. One-line descriptions are the first comment of each file.

## Shell (every page)

| File | Holds |
|---|---|
| `index.html` | page skeleton, theme bootstrap, generated import map (do not edit the map) |
| `js/app.js` | router and page shell: `route()`, `link()`, `header()` (nav), `footer()`, `render()` (route validity and dispatch), `bindCommon()`; experiment pages mount `js/lab/` (`render()` dispatch, `mountExperiment`); pages of the guided labs not yet rebuilt (`labPage`, `updateLab`, `updatePlot`, `bindPlot`, `bindLab`); challenge pages (`challengePage`, `challengeDetail`, `bindChallenges`); pathways (`pathwayPage`); saved state (`save`, `state`) |
| `js/ui.js` | theme choice, full-screen presenting |
| `js/icons.js` | Phosphor icon paths, `icon(name, size)` |
| `js/motion.js` | slider animation of the guided labs not yet rebuilt, interface motion |
| `js/control-policy.js` | selectors with one choice become labels |
| `js/content-language.js` | language of each route (neutral pages vs curriculum pages) |
| `js/data-loader.js` | `assetHref` (versioned URLs), `fetchJSON` |
| `js/catalogue-data.js` | GENERATED from `content/data/manifest.json`: courses, university, asset versions |
| `js/canvas-navigation.js` | camera (zoom, pan, reset) shared with the slide player |
| `js/interaction.js` | dragging snapped to the slider grid (guided labs not yet rebuilt) |
| `styles/explorer.css` | design tokens (both themes), base elements, layout |
| `styles/pages.css` | page and component styles, challenge card colours and animations |

## Content data

| File | Holds |
|---|---|
| `js/content.js` | `labs` (guided labs: the rebuilt ones are catalogue lines from `js/lab/registry.js`; `custom: true` ones are gallery objects), `challengeBase` / `challenges` (text, topic, hints), `pathways` |
| `js/learning-content.js` | companion lessons on chapter pages (`guides`) |
| `js/study-guides.js` | short starting sheets (built into HTML by `scripts/build-study-guides.mjs`) |

## Laboratory and gallery

| File | Holds |
|---|---|
| `js/lab/` | **the laboratory**: engine, shell, mount, registry, templates, models and one file per experiment (quadratic, trig, sequences, derivative, integral); index in `js/lab/CLAUDE.md` |
| `js/math.js` | pure maths shared by the labs (quadratic, sequences, binomial, statistics, Riemann...) |
| `js/lab-objects.js` | `mountObject`: Galton, Reuleaux, Platonic, chaos game (pure maths first, then DOM) |
| `js/gallery-objects.js` | Fourier circles, Mandelbrot/Julia explorer |
| `js/gallery-math.js` | pure maths of the gallery (escape times, DFT, Madagascar outline) |
| `js/gallery-additions.js` | five experiment-first gallery entries and source labels |
| `js/gallery-models.js`, `js/gallery-kit.js` | Voronoi clipping, descent timing, film area minimisation; shared exhibit lifecycle |
| `js/gallery-voronoi.js`, `js/gallery-fastest.js`, `js/gallery-soap.js` | draggable territories, bead races, rotatable film |
| `js/gallery-knot-model.js` | legacy pure braid/invariant helpers and verified mirror certificate, retained for model tests |
| `js/gallery-knots.js`, `js/gallery-knot-geometry.js`, `js/knot-catalogue.js` | 44 verified spatial curves, shaded tubes, true projections, F3 colours and continuous examples |
| `js/knotinfo-license.txt` | MIT licence for KnotInfo coordinate assets |
| `js/gallery-soap-model.js` | 13 fixed-topology spatial meshes and a separate tetrahedral junction solver |
| `js/gallery-context.js` | mathematical ideas, historical context and applications for all gallery entries |
| `js/gallery-hat-model.js`, `js/gallery-hat.js` | H7/H8 geometry and continuous hat-family explorer |
| `js/platonic-explorer.js`, `js/platonic-fold.js` | Platonic solids and their folding nets |
| `js/complex-explorer.js` | complex numbers as transformations |
| `js/object-kit.js` | canvas sizing, `palette()` from CSS tokens, sliders, loop |
| `js/home-art.js` | live drawings of the home page and the gallery cards |
| `js/welcome.js` | home page and gallery index |

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
| `js/chapter-sequence.js`, `js/sequence-model.js` | chapter page tabs and progression built from the chapter deck |
| `js/visual-lessons.js` | animated companion diagrams |
| `js/library.js` | `#library` filterable resource list |
| `js/pack-builder.js` | `#pack` custom pack builder, `#sources` LaTeX sources |
| `js/slides-page.js` | `#slides` deck index (HTML and lecture PDF editions) |
| `js/university.js`, `js/university-model.js` | `#university` pages and pathway summaries |
| `js/quadratic-workshop.js` | `#workshop/quadratic` five-stage workshop |
| `resources/document-theme.css` | style of generated HTML resource pages |

## Slide player (`slides/`; any change here rebuilds every deck export)

| File | Holds |
|---|---|
| `slides/player.html`, `slides/player.css`, `slides/player.js` | standalone player (1280x720 stage, steps, toolbar) |
| `slides/widgets.js` | widget registry `mount`, drawing and readout helpers |
| `slides/widgets-2d.js`, `slides/widgets-3d.js` | 2D widgets; true 3D widgets |

## Third party

`vendor/` (MathJax, JSZip, pdf-lib; see `vendor/README.md`), `fonts/` (with licences). Do not read.
