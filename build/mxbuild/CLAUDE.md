# build/mxbuild/: index

The pipeline package. Run with `PYTHONPATH=build python3 -m mxbuild <command>` or the `make` targets (see `Makefile`).
`build/out` holds products and logs (ignored by git; do not read).

| Module | Holds | Make target |
|---|---|---|
| `__main__.py` | command line (`catalog`, `site`, `tex`, `check`, `twin`, `enrichment`, `notation`) | |
| `__init__.py` | `ROOT`, `DIST` | |
| `refresh.py` | dependency-driven rebuild of everything linked; input fingerprints in `content/data/build-state.json` | `make site` |
| `site.py` | copy `site/` into `dist/`, regenerate import maps (cache busting) | part of `make site` |
| `catalog.py` | `catalog.json`, `resources-data.js`, `RESOURCE_PROVENANCE.json` from the manifest; `load()`/`save()` | `make catalog` |
| `content_index.py` | `site/js/catalogue-data.js` and the measured content model | part of `make site` |
| `books.py` | course main files generated from manifest key `books` | |
| `pipeline.py` | `COURSES` (course to builder script), `CHECKS` (pre-push suite), course builds | `make tex`, `make check` |
| `tex.py` | TeX compilation driver and per-course cache | `make tex` |
| `pdf.py` | PDF excerpt assembly with the native frame | |
| `twin.py` | French-to-English twin generation (`docs/ADR-0001-tex-i18n.md`) | |
| `notation.py` | web side of `mx-notation.sty`, slide MathJax table | |
| `enrichment.py` | enrichment TeX units from `content/data/enrichment.json` | |
| `migrate.py` | one-off migration of a course to the TeX system (historical) | |

To add a pre-push check, append to `CHECKS` in `pipeline.py`. To add a dependency for rebuilds, edit `inputs()` in
`refresh.py`.
