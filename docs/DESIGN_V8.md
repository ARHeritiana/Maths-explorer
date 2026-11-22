# Design v8: "Bande dessinée" (18 November 2026)

Asked by the owner on 18 November 2026 after a round of proposals on the canvas "Maths-explorer · Bande dessinée": a full
redesign, comic book style, with fewer choices per screen. It replaces v7 "Bac à sable" (`docs/DESIGN_V7.md`, kept as a
record). The rules of v3 that come from the site's purpose stay: the figure first, phone first, accessible, honest
labelling, no owner identity. No page and no content was removed: every address still works.

## Idea

Every page is a comic page. The paper is halftone yellow, the content sits in white panels outlined in ink with a solid
offset shadow, titles are shouted in capitals, explanations are lettered in a readable comic hand. Sound effects are
earned: a starburst appears only when something happens (a right answer, an error, a limit case), never as decoration.

## Visual rules

| | |
|---|---|
| Palette, Jour | page `#ffe14d` with red dots at 13 % (14 px grid); surface `#ffffff`; ink `#111111`; secondary ink `#2b2b2b`; muted `#3d3d3d` (8:1 on the yellow). |
| Palette, Nuit | page `#14130f` with yellow dots at 7 %; surface `#23211a`; ink `#fff7d6`. |
| Meaning | `--shape` red `#e11d2e` = the studied object and every red fill (white text on it); `--accent` `#b3101d` = red text (5.3:1 on the yellow); `--obj2` blue `#1d4ed8` = second object, hints, the selected class (`--sun`); `--pos` green, `--neg` raspberry, always with a word and an icon. Red text never sits on the yellow at body size. |
| Type | Titles: Impact, then Anton (SIL OFL, self-hosted in `site/fonts/`), in capitals. Lettering and interface: Comic Neue (SIL OFL), 17 px minimum. Mathematics: STIX Two. |
| Shape | Square corners. Panels: 3 to 4 px ink outline and a solid 6 to 9 px shadow (`--shadow`). Buttons: 3 px outline, 4 px shadow; they lift on hover and press in on click. |
| Page | Each page (`main.page`) is a white board on the yellow, so long text never sits on the halftone. The home is the only page that shows the yellow around its panels. |
| Mark | A red starburst with a white pi (`site/js/app.js` `brandMark`; the favicon is copied from it; TeX: `\mxbrandmark`). |
| Starbursts | `site/js/motion.js`: "BIEN VU !" in red on a correct answer, "OUPS" in blue on an error, removed after 1.4 s; the feedback box keeps the words. |
| Motion | Only as feedback: buttons press, cards lift, bursts pop. Nothing loops on its own; `prefers-reduced-motion` removes it all. |

Files: tokens in `site/styles/tokens.css`; the comic layer in `site/styles/comic.css`, loaded last by `site/index.html`
and the standalone timeline; the slide player keeps a copy of the tokens in `site/slides/player.css`; foundation lessons
through `site/resources/basics/basics-theme.css`; generated HTML resources through `site/resources/document-theme.css`;
PDFs and Beamer lectures through `content/tex/core/mx-brand.sty` (fonts made by `scripts/tex-fonts.py`); the share image
by `scripts/share-image.py`.

## Ergonomic rules and their sources

The owner asked for fewer, clearer choices, following recognised web design rules.

| Rule | Source | Applied |
|---|---|---|
| One thing per page | GOV.UK Design Notes, "One thing per page" (2015); Government Design Principles, "Do less" | the visitor home leads with one decision (student or teacher); the student home leads with one task (class, then chapter) |
| Few visible choices, the rest one step away | Hick's law (Laws of UX); Nielsen, progressive disclosure | the chapters appear only once a class is chosen; four sections instead of three sections with seventeen tabs in one row |
| Work like other sites | Nielsen Norman Group, Jakob's law | logo at the top left goes home, sections at the top, search at the top right, tabs under the bar |
| Show where the visitor is | NN/g heuristic 1 | current section in an ink box, current tab underlined in red, breadcrumbs on chapter pages |
| Recognition rather than recall | NN/g heuristic 6 | words beside icons, full chapter titles, counts |
| Nothing that does not serve | NN/g heuristic 8 | no decorative bursts, no loops, one figure per home |
| Control and freedom | NN/g heuristic 3 | every choice can be undone; nothing is irreversible |
| Errors that explain | NN/g heuristic 9 | "OUPS" always comes with the hint written in the feedback box |
| Large targets | W3C, WCAG 2.2, 2.5.8 (24 px minimum) | buttons and rows of 44 to 56 px |
| Teenagers on phones | NN/g, teen users compared with other age groups | short sentences, two-step paths, the same path on phone and desktop |

## Design skills (20 November 2026)

Two third-party skills sit in `.claude/skills/` and are used for every new or changed page, exhibit or control:
`frontend-design` (Anthropic, Apache 2.0: subject-first choices, restraint, one memorable element, plain copy) and
`web-design-guidelines` (Vercel Web Interface Guidelines, MIT, rules pinned in `rules.md` with the project overrides in
its `SKILL.md`: accessibility, focus, touch, layout, theming, copy). This document wins where they disagree: the palette,
fonts and comic style are fixed here, copy is sentence case in French and English.

Layout rules that came out of the first review:
- Phone first, the figure in reach: choices and the question above a figure, the buttons that change it right under it,
  measures after, so building a stage never scrolls the figure away (`.exhibit-band`, `site/styles/pages.css`).
- Feedback lines keep their place (always one line of text), so the buttons under them never move as they are pressed.
- The phone header is one row of 64 px (mark, tools, Menu; the language switch goes into the opened menu), so
  `scroll-padding-top` matches it and nothing focused or linked hides under it.
- Every drag has a button or key alternative (for example "Turn the view" on the 3D figures).

Figure and console (owner, 22 November 2026: "controls beside the figure on large horizontal screens, always on the same
screen as the canvas"). The third design skill, Impeccable (Paul Bakaus, Apache 2.0; installed for the user, not in this
repository), was used for the pass (its Operate, Layout and Craft-floor playbooks). The rules, in
`site/js/figure-layout.js` and `site/styles/figure-layout.css`:
- An exhibit is a strip of two panels: the figure, and the console of its controls. Wide figure area (860 px and more):
  the console beside the figure, top-aligned and sticky, the figure never taller than the viewport under the header.
  Narrow: figure, its caption, the console, then plots and notes, in the page and in the keyboard order.
- Weight follows priority inside the console: the main action is the only raised red button, on its own row, first (a
  transport joins back, play and forward, with the timeline under it); parameters next, label and value on one line with
  the slider across; secondary actions are flat cells of equal size in one joined toolbar; a group of exactly one pressed
  button is a choice (ink fill), other pressed buttons are on/off toggles drawn as check boxes; example lists are rows of one
  list; live values are a table; the help line closes the panel.
- The sentence that says what the figure shows is its caption, under it, one fact per line.
- The laboratory card (`.lab2-card`) speaks the same language: scenes as one list, segments as joined cells.
- A choice of three is one row of three cells; a choice of five or more is two columns, the odd last cell across. Only
  on/off toggles carry the check box; a picked choice is shown by its ink fill alone. Hover never repaints a picked choice
  or the main action (their text would lose its contrast).
- An inset (`data-fig-inset`) is a small map that drives the figure (the Wythoff triangle): in the figure's top left
  corner when the console is beside it, back in the console on a narrow screen.
- Budget: at 1600 × 900 the console holds without scrolling inside. When it does not, move out what is not a control
  (a question to answer goes under the figure, facts the caption already states leave the metrics), put a label beside
  its list, join secondary actions in one row; never shrink text below 0.86 rem to make it fit.

## Structure

Four sections, named after what the visitor came to do (`site/js/app.js` `SECTIONS`):

| Section | Pages (former place) |
|---|---|
| Cours | Chapitres (Apprendre › Cours), Domaines (Explorer), Bases, Fiches, Diaporamas (Apprendre) |
| Exercices | Exercices, Automatismes, Réviser, Annales (Apprendre), Défis (Explorer) |
| Labo | Laboratoire, Contre l’intuition, Erreurs (Explorer) |
| Bibliothèque | Curiosités, Histoires, Biographies, Chronologies (Lire) |

The teacher area (Préparer, En classe, Détente) is unchanged and still reached from the audience button.

## Rollback

The change is styles, the navigation table, the order of the two homes, the mark, the motion helper, the TeX brand and
fonts, and the rebuilt outputs. Reverting the pull request's squash commit restores v7 everywhere, PDFs included.
