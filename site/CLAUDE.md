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
| `js/gallery-knots.js`, `js/gallery-knot-geometry.js`, `js/knot-catalogue.js` | 44 verified spatial curves, shaded tubes, true projections, F3 colours and continuous examples |
| `js/knotinfo-license.txt` | MIT licence for KnotInfo coordinate assets |
| `js/gallery-soap-model.js` | 13 fixed-topology spatial meshes and a separate tetrahedral junction solver |
| `js/gallery-context.js` | mathematical ideas, historical context and applications for all gallery entries |
| `js/gallery-hat-model.js`, `js/gallery-hat.js` | H7/H8 geometry and continuous hat-family explorer |
| `js/gallery-four-colour-model.js`, `js/gallery-four-colour.js` | four colour exhibit: nine menu choices, point-contact and disconnected-country examples, connected-country border editor with undo, shared-border neighbours and exact backtracking colouring |
| `js/platonic-explorer.js`, `js/platonic-fold.js` | Platonic solids and their folding nets |
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
| `js/chapter-sequence.js`, `js/sequence-model.js` | chapter page tabs and progression built from the chapter deck; the tab "Chercher" shows the chapter's lab references (`labBlock`: first one mounted inline, lazily, destroyed on navigation, a link per reference) |
| `js/visual-lessons.js` | animated companion diagrams |
| `js/library.js` | `#library` filterable resource list; chapter detail with the "Open in the laboratory" links |
| `js/pack-builder.js` | `#pack` custom pack builder, `#sources` LaTeX sources |
| `js/slides-page.js` | `#slides` deck index (HTML and lecture PDF editions) |
| `js/university.js`, `js/university-model.js` | `#university` pages and pathway summaries |
| `js/quadratic-workshop.js` | `#workshop/quadratic` five-stage workshop |
| `resources/document-theme.css` | style of generated HTML resource pages |

## Slide player (`slides/`; any change here rebuilds every deck export)

| File | Holds |
|---|---|
| `slides/player.html`, `slides/player.css`, `slides/player.js` | standalone player (1280x720 stage, steps, toolbar); the import map also lists `../js/lab/**`, `math.js`, `object-kit.js`; `player.css` carries the `.lab2-*` styles of a lab widget |
| `slides/widgets.js` | widget registry `mount`, drawing and readout helpers; `type: 'lab'` (`mountLab`: loads `js/lab/mount.js` on demand, dark palette `LAB_PALETTE`, `uniHTML` turns the experiment's Unicode into MathJax markup) |
| `slides/widgets-2d.js`, `slides/widgets-3d.js` | 2D widgets; true 3D widgets |

## Third party

`vendor/` (MathJax, JSZip, pdf-lib; see `vendor/README.md`), `fonts/` (with licences). Do not read.


Fourier: `js/fourier-model.js` (pure signals and error), `js/fourier-links.js` (catalogue-derived triangle).
