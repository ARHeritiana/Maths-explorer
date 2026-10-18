# Recipe: finish and push

1. `make site` (copies `site/` to `dist/`, rebuilds what depends on changed inputs, regenerates import maps).
2. `npm run check && npm test` (Node tests import `dist/js`, so step 1 comes first); `npm run test:dom`.
3. Targeted checks for what you touched (see `tests/CLAUDE.md`). Before a push the owner requires `make check FAST=1`
   when the pipeline is available.
4. `grep -n "—\|–" <files you wrote>`: no em or en dashes in visible text.
5. Update `MAP.md` or the folder `CLAUDE.md` if you added, moved or removed a file. Tick the task in `HANDOFF.md` and
   add one dated line to `docs/LOG.md`.
6. Commit on `main` with a clear message (no names of owner, school or city), then `git push -u origin main`.
