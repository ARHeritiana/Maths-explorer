# Design v7: "Bac à sable" (15 November 2026)

Chosen by the owner on 15 November 2026 from four brand proposals (two per site). It replaces the look of v6 "Grille"
(white, black, one red, square corners). Matematika received its own identity, "Pavage", at the same time: the two
sites are independent products and no longer share a look. The rules of v3 that come from the site's purpose stay
(find first, the figure is the page, phone first, accessible, honest labelling, no AI notice, no owner identity).

## Idea

Mathematics as a playground: an invitation to touch, guess and then prove. Warm cream paper, plum ink, bright rounded
shapes outlined in ink, pill buttons, and one small surprise per screen. Playful in form, serious in content.

## Rules

| | |
|---|---|
| Mark | a Reuleaux triangle (a shape of constant width: it rolls like a wheel without being a circle) with a dot. Tomato on cream, coral on night. At 16 px the dot is dropped. `site/js/app.js` `brandMark`; the favicon is copied from it. |
| Palette, Jour | page `#fff7ea` cream, surface `#ffffff`, ink `#2b1e3f` plum (14.5:1), secondary ink `#4a3d5e` (9.3:1), muted `#55466b` (8.0:1). |
| Palette, Nuit | page `#1c1530`, surface `#271e40`, ink `#fff7ea` (16.5:1), secondary `#cfc3e6` (10.5:1), muted `#bdb0d6` (8.6:1). |
| Meaning | `--accent` tomato = the studied object and its words (`#c8391b` Jour, `#ff7a5c` Nuit); `--shape` = tomato for filled shapes (`#e8492a` Jour, not for text); `--obj2` lilac = second object; `--pos` lagoon = valid; `--neg` raspberry = error, always with an icon and a word; `--sun` sunflower = surprises and the chosen class, ink on it. |
| Data colours | `--c1…--c8` are unchanged: they are data (graph colourings, series), not interface. |
| Type | Bricolage Grotesque (SIL OFL, self-hosted, `site/fonts/`) for headings, weight 700 to 800, tracking −0.02 to −0.035 em. Atkinson Hyperlegible for text and interface (kept for low vision). STIX Two for mathematics. |
| Shape | panels 36 px (`--r-panel`), cards 24 px (`--r`), fields 12 px (`--r-sm`), buttons and chips are pills (`--r-pill`). Outlines 2 px ink. No shadow, no gradient, no blur. |
| Buttons | primary: ink pill, tomato on hover. Secondary: ink outline, sunflower on hover. Quiet: underlined text, tomato on hover. Focus: 3 px lilac ring in Jour, sunflower in Nuit. |
| Header | cream bar over a 2 px ink rule; the current section is an ink pill (sunflower on the phone tab bar). |
| Motion | only when touched or to explain a state: cards lift 3 px under the pointer; nothing moves under reduced motion. |
| Voice | "tu" for students, "vous" in the teacher area. An action verb first (tire, devine, compare, prouve). Never "facile", "évidemment", "il suffit de". An experiment is evidence, not a proof. |

## Done in this change

Tokens of both themes (`site/styles/explorer.css`), the v6 override block of `site/styles/pages.css` rewritten for v7,
the home plate, the mark and favicon, the theme colour of the browser bar (`site/index.html`, `site/js/ui.js`), the
slide player tokens and fonts (`site/slides/player.css`, `scripts/export-slides.py`), the timeline page mark.
Schibsted Grotesk left the site (it stays in the TeX sources until the PDFs are restyled).

## Done on 16 November 2026

1. PDFs and Beamer lectures restyled through one brand file, `content/tex/core/mx-brand.sty` (style apart from content:
   the other core files are the same in both sites; `docs/TEX_STYLE_GUIDE.md`). Text in Atkinson Hyperlegible, titles in
   Bricolage Grotesque, maths in STIX Two; rounded cards (lilac definitions, outlined properties), sunflower chips,
   the mark in the header. Every PDF and lecture rebuilt.
2. The site's tokens moved to `site/styles/tokens.css`, imported by `explorer.css` and by the foundation lessons
   through `site/resources/basics/basics-theme.css`: the lessons keep only their data colours and follow the site's
   fonts, corners and both themes.
3. Share image `site/share.png` (1280 × 640, `scripts/share-image.py`), declared in `site/index.html` (Open Graph). Upload it
   by hand as the repository's social preview (GitHub, Settings, General, Social preview).
4. Figures read the role `--object-ink` / `--object` (the studied object) instead of `--accent`; here both point to tomato.

Still to do: `site/resources/document-theme.css` (generated HTML resource pages) keeps its own dark look.

The full brand guide (logo system, both palettes with contrast, components, slides, PDF page, share card) is the
canvas "Brand identity proposals", page "Bac à sable guide".
