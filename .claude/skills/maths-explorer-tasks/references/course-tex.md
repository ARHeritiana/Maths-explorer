# Recipe: course PDF (TeX)

Read `content/CLAUDE.md` first (it is short). Then:
1. Open only the unit: `content/tex/courses/<course>/<folder>/<unit>.fr.tex`. Never edit `.en.tex` (generated).
2. If prose changed, update the matching segment in `<unit>.en.json` (stable ids; prose only, maths untouched).
   Regenerate English: `PYTHONPATH=build python3 -m mxbuild twin gen <unit>.fr.tex` (see `build/mxbuild/twin.py`
   docstring for the exact commands if this fails).
3. Environments and macros: `docs/TEX_STYLE_GUIDE.md` sections "Environments" and "Mapping"; do not read the core
   packages unless changing the look.
4. Verify every computed result with a script in `private/verification/`.
5. Build: `make tex COURSE=<course>` (TeX Live packages listed in `docs/ARCHITECTURE.md` "Commands"), then
   `make site`.
6. New chapter: add it to `content/data/manifest.json` (`catalog.chapters`, and `books.<course>`), with its companion
   layout record (`companion`); the build refuses incomplete entries.

Look of every PDF: `content/tex/core/mx-layout.sty` (frame, palette), `mx-env.sty` (boxes), `mx-figures.sty` (figure
palette). A core change rebuilds every course.
Then follow `release.md`.
