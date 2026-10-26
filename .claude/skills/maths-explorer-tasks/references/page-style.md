# Recipe: pages, routes, navigation, colours

- Colour, font, radius, spacing: change the token in `site/styles/explorer.css` (top of file, light then dark theme).
  Never write a literal colour in a page style or a canvas: canvases read tokens with `object-kit.js` `palette()`,
  challenge cards with `site/js/challenges/common/kit.js` `colour(i)` (`--c1..--c8`). The PDF palette is separate
  (`content/tex/core/mx-layout.sty`).
- One page's styling: `site/styles/pages.css`, search the page's root class.
- Navigation and footer: `site/js/app.js` `header()` (array `nav`), `footer()`.
- New route: `site/js/app.js` `render()` (add to `valid` and to the dispatch chain) and a page module exporting
  `<name>Page(...)` and `bind<Name>(...)`; add a row to the site map in `MAP.md` section 3.
- Which language a page uses: `site/js/content-language.js`.
- Design reasoning only when making a design decision: `docs/DESIGN_V3.md`, `docs/DESIGN_V4.md`.

Visual check: `npm start`, screenshot at 1440 and 390 px, light and dark themes, keyboard use, no horizontal scroll.
Then follow `release.md`.

- History atlas: `site/js/history.js`, `site/js/history-layout.js`, `site/js/history-images.js`, `site/styles/history.css`; image files in `site/data/history/`. Preserve source/creator/licence metadata and distinguish documentary dates from lifetimes.
