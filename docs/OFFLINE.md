# Offline support

Contract of `site/sw.js` (service worker), `site/js/offline.js` (page side) and `build/mxbuild/offline.py` (manifest).

## What works offline

- **The application shell**, precached on the first visit: `index.html`, every stylesheet, font and JavaScript module,
  and MathJax (`vendor/mathjax-tex-svg.js`), plus the small slide indexes. A page built from shell code alone works
  offline even if it was never opened (checked by the browser test on the worksheet generator `#sheets`). Shell size:
  about 9 MB, 480 files at the time of writing; `npm run test:offline` prints the current size).
- **What was opened online**: chapter data, slide decks, foundation lessons, PDFs (whole and by `Range`) are copied in a
  runtime cache when first opened, then served offline. Limits: 400 entries, 150 MB, 40 MB per item.
- **What was never opened** (a chapter page's data, a PDF) is not available offline. A PDF answers with a page
  "Hors connexion"; a failed fetch shows the notice "not available offline" in the status bar.

## Strategies

- Shell files: from the shell cache, each verified against its hash (all or nothing at install).
- `html`, `json`, `js`, `mjs`, `css` outside the shell: network first; after 4 s or on failure, the cached copy.
- Anything else (PDF, images): cached copy first, refreshed in the background.
- Only complete, same-origin `200` answers are kept (never `206`, opaque, redirected or error answers).
- Cache names start with `mx|<path of index.html>|`, so two editions on one origin (GitHub Pages) never mix.

## Updates

The build writes `dist/sw.js` = `site/sw.js` with its placeholder line replaced by the manifest (file list with
content hashes, a version derived from it). Any changed shell file changes `dist/sw.js`, so the browser installs a new
worker. Unchanged files are copied from the old cache, not downloaded again. The new version **waits**: the status bar
says "Nouvelle version disponible" with a "Recharger" button; nothing changes in the running page until then (or until
every tab is closed). After the switch every open tab reloads and the old shell cache is deleted.

## Support

- `index.html?offline=off` removes the worker and its caches on this device and keeps it off; `?offline=on` restores it.
- Inert under `file://`, in Node and in jsdom.

## Tests

- `tests/offline.test.mjs` (unit, page side and worker source rules), `tests/test_offline.py` (manifest),
- `tests/offline_browser.mjs` (`npm run test:offline`, Chromium): first visit, offline reload of opened routes, a page
  never opened, slide player and foundation lesson, PDF whole and by Range, unopened PDF, update flow.
