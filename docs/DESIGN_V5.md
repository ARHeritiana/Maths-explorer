# Design v5: visual identity (31 October 2026)

Goal 1 of `IMPROVEMENT_GOALS.md`: a coherent, colourful, recognisable design on every surface. This layer sits on v3 "Cahier" and v4 "Vivid" and changes none of their rules (contrast, 44 px targets, reduced motion, no decoration that costs bytes).

## The identity in one sentence

A parabola through two points on a night-blue tile, and a **spectrum of eleven field hues**: each branch of mathematics has one colour that never changes from page to page.

## Elements

| Element | Rule | Where |
|---|---|---|
| Mark | the blue tile with a curve and two points (the roots); the favicon is the same drawing | header, favicon; planned: slide title card, PDF cover |
| Field hue | one hue per field, `[data-topic="<id>"] { --hue }`, from `--c1…--c11` | topic menu and subtopics now; to extend: discovery cards, chapter cards, lab chips |
| Spectrum rule | 3 px gradient of the eleven hues under the header and above the footer; plain `CanvasText` in forced-colours mode | every page |
| Accent | blue `--accent` stays the colour of actions and the studied object | unchanged |
| Type | Atkinson Hyperlegible for interface, STIX Two Text for mathematics | unchanged |

Hue table (identical in both themes by role; values in `site/styles/explorer.css`):

| Field | Token | Field | Token |
|---|---|---|---|
| Algebra | `--c1` blue | Discrete | `--c7` gold |
| Analysis | `--c2` orange | Dynamics | `--c8` vermilion |
| Geometry | `--c3` green | Topology | `--c9` indigo |
| Arithmetic | `--c4` magenta | Foundations | `--c10` brown |
| Probability | `--c5` purple | History | `--c11` slate |
| Statistics | `--c6` teal | | |

Rules: a hue marks or tints (bar, dot, 9–12 % tint); text stays `--ink`. Never use a hue as the only carrier of meaning (the field name is always written). All eleven keep 3:1 contrast with the surface in both themes (`tests/identity.test.mjs`).

## Per-surface status

| Surface | State | Next step |
|---|---|---|
| Site chrome and topic menus | done in this change | extend `data-topic` to discovery result cards, chapter cards (`resource-library.js`), lab experiment chips |
| Laboratory and challenge canvases | read `palette()` (`object-kit.js`) from the same tokens | none |
| Slides | own dark palette (`player.css`), amber = focus by the brief section 5; same fonts | add the mark and the spectrum rule to the title slide; keep amber semantics |
| PDFs | green/mint and navy band in `content/tex/core/mx-layout.sty` | not aligned. Decide whether to move the PDF ink to the site blue; needs a TeX Live rebuild of every PDF, so not done here |
| Mobile and desktop review | screenshots of `#topics/algebra` at 1280 and 390 px, both themes: no horizontal overflow | full-route review is goal 10 |

## Not claimed

The success criterion of goal 1 ("no significant inconsistencies in desktop and mobile reviews") needs a review of every major section; this change covers the chrome and the topic pages only.
