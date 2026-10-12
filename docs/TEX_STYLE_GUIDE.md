# TeX style guide

One LaTeX system for every course: class `mxbook` and packages in `content/tex/core/`. pdfLaTeX without shell escape,
`mathpazo`; large boxes `mdframed` (left rule, breakable), small elements `tcolorbox`; numbering by `\newcounter`; page
breaks by `\mxneed{n}` (`\Needspace`), never by hand. Minimal compilable example: `content/tex/core/example.tex`
(`pdflatex example.tex` in that folder; options `\def\mxopts{lang=en,edition=teacher}\input{example}`).

## Files

| File | Holds |
|---|---|
| `mxbook.cls` | the master: options `course=`, `lang=fr\|en`, `edition=student\|teacher\|both`, `layout=booklet\|sheet\|slide-figs`, `unit=chapter\|sequence`, `sections=numbered\|unnumbered`; loads every package below; `\mxinclude`, `\mxunit`, `\mxfront`, `\mxsubtitle`, `\mxnewpage`, `\mxsection`, `\mxlabel` |
| `mx-i18n.sty` | babel, label dictionary (`\mxlabelof{key}`), `\mxtr{fr}{en}` (core only), `\mxdate{YYYY-MM-DD}`, `\mxdate*{...}` |
| `mx-edition.sty` | `\ifmxteacher`, `\mxteacheronly{}`, `\mxstudentonly{}` |
| `mx-math.sty` | every maths macro that reads the same in both languages, once (`\R \N \Z \Q \D \C \vect \vi \vj \vk \norm \vc \deter \abs \dd \e \Card \E \V \pgcd \ppcm \degre \un \sci`); source of the slide player's MathJax table |
| `mx-notation.sty` | every notation that differs between French and English (`\num \pc \intff \intoo \intfo \intof \ent \pt \ens`), printed per language |
| `mx-figures.sty` | palette `mxink mxmint mxmintpale mxteacher mxwarn mxline mxmuted mxpaper`; TikZ libraries; styles `mxcurve mxaux mxpoint mxaxisline` (TikZ), `mxaxis mxgridaxis` (pgfplots) |
| `mx-layout.sty` | geometry, print palette, native header band and footer, headings, `\mxneed{n}` |
| `mx-env.sty` | the environments below |
| `mx-code.sty` | Python listings style, `\code{}` |

## Environments

| Environment | Use | Numbered | Edition |
|---|---|---|---|
| `keypoint[title]` | what to remember | | both |
| `definition[title]` | a definition | | both |
| `theorem[title]` | a property or theorem (label "Propriété") | | both |
| `method[title]` | a method | | both |
| `example[title]` | worked example | per chapter | both |
| `proof` | proof, ends with a square | | both |
| `pitfall[title]` | common error, point of care | | both |
| `activity[title]` | investigation | per chapter | both |
| `exercise[title]` | exercise | chapter.n | both |
| `application[title]` | immediate practice | | both |
| `homework[title]` | homework | | both |
| `exitticket[title]` | exit ticket | | both |
| `fluency[title]` | starter routine, automatisms | | both |
| `objectives`, `prerequisites` | unit header boxes | | both |
| `solution[title]` | worked solution | | teacher only |
| `teachernote[title]` | teaching notes | | teacher only |
| `figurebox[caption]` | centred figure with caption | | both |

Inline: `\mxanswer{...}` (teacher only), `\mxblank{...}` (dots for students, bold for teachers), `\mxlines{n}` (answer
lines, students only), `\mxchip{...}` (small label such as a duration).

Example:
```latex
\begin{exercise}[Calcul de termes]
Calculer $u_{10}$ pour $u_0=-3$ et $r=2$. \mxlines{2}
\end{exercise}
\begin{solution}
$u_{10}=-3+10\times2=17$.
\end{solution}
```

## Mapping from the course vocabularies (for migration)

| Current name (course) | Canonical |
|---|---|
| `retenir` (STMG, Terminale), `repere` (Première), `cours` (Seconde), `traceecrite` (STMG) | `keypoint` (or `definition`/`theorem` when the title says so) |
| `methode` (Seconde, STMG, Terminale) | `method` |
| `exemple` (STMG env), `\exemple{}` (Première), `\ex[]{}` (Seconde) | `example` |
| `erreur` (Première, STMG), `\vigilance{}` (Seconde) | `pitfall` |
| `\preuve{}` (Première), `\preuve[]{}` (Seconde: proof to write, answer for teachers) | `proof` (Seconde: `exercise` + `solution`) |
| `activite` (STMG) | `activity` |
| `exercice` (STMG env), `\exercice{label}{title}` (Première, Terminale), `\DefExo`/`\ExoSession` (STMG) | `exercise` |
| `exerciceapp` (STMG), `\application{}` (Première) | `application` |
| `\reponse[]{}` (Seconde), `correction`, `\enseignant{}` (STMG) | `solution` (+ `\mxlines{n}` for the student space) |
| `profbox` (Terminale), `\prof{}` (Seconde) | `teachernote` |
| `dm` (STMG) | `homework` |
| `sortie` (STMG) | `exitticket` |
| `automatismes` (STMG), `\rituel{}{}` (Seconde), `fiche` + `\qitem` (Automatismes) | `fluency` |
| `objectifs`, `prerequis` (STMG) | `objectives`, `prerequisites` |
| `probleme` (STMG) | `exercise[Problème ...]` |
| `manuel`/`\manuelref` (STMG) | `keypoint[Pour prolonger]` with page and exercise numbers only |
| `\trou{}` (Seconde), `\rep{}` (STMG) | `\mxblank{}` |
| `\zoneeleve{n}` (STMG) | `\mxlines{n}` |
| `\versionprof`, `\VERSIONPROF`, `\VERSIONELEVE`, `\EditionProf`, `\PROFVERSION`, `\ifprof` | class option `edition=`, `\ifmxteacher` |

## Notation (French and English)

Units never type a notation that differs between the languages; they call these commands, and the class prints the
convention of the edition (`content/tex/core/mx-notation.sty`, decision in `docs/ADR-0001-tex-i18n.md`):

| Write | French prints | English prints | For |
|---|---|---|---|
| `\num{0,5}`, `\num{12500}` | 0,5 ; 12 500 | 0.5 ; 12,500 | a number with decimals or 4+ digits (input with a comma) |
| `\pc{12,5}` | 12,5 % | 12.5% | a percentage |
| `$\intff{a}{b}$` `$\intoo{a}{b}$` `$\intfo{a}{b}$` `$\intof{a}{b}$` | [a;b] ]a;b[ [a;b[ ]a;b] | [a,b] (a,b) [a,b) (a,b] | intervals (f = closed, o = open end) |
| `$\ent{1}{n}$` | ⟦1;n⟧ | {1,…,n} | integer interval |
| `$A\pt{1;-2}$`, `$\pt{1;2;3}$` | A(1;−2) | A(1,−2) | coordinates, pairs, triples |
| `$\ens{1;2;3}$` | {1;2;3} | {1,2,3} | set listed in extension |
| `$\pgcd(a,b)$`, `$\ppcm(a,b)$` | PGCD, PPCM | gcd, lcm | |

`tests/tex_lint.py` refuses `0{,}5`, `12\,500`, `50\,\%`, `]0;1[`, `(1;2)` and `\{1;2\}` written by hand
(`python -m mxbuild notation --migrate --write` converts them).

## Counts in prose

Never type a count that the content can measure; it goes stale as soon as a question or exercise is added.
- `\mxcounted{key}` as the last line of an `enumerate`, then `\mxcount{key}` (cinq / five) or `\mxCount{key}` (Cinq / Five)
  anywhere in the same unit: the number of top-level items of that list.
- `\mxtally{key}` before each counted element (an exercise of a paper), then `\mxTallied{key}` (Quatre / Four, masculine in
  French): how many times the tally was stepped. Corrections that repeat the headings are not tallied.
- Words go up to twelve; a first compilation prints ?? and the second (latexmk) resolves it. The slide builder resolves the
  same commands from the source.
- Counts that span a book (cover, front matter: sessions, papers, sheets) are checked by `tests/count_claims.py`, which
  reads each claim from the French text and compares it with the content. Rewording such a claim means updating that check.
- Tuples are written `\pt{a;b}` (points, solution pairs, parameters such as $\mathcal B\pt{n;p}$): French prints (a ; b) and
  English (a, b). A hand-written (a,b) prints the English form in French.

## Units

Every unit has the same shape. It is one file `<id>.fr.tex` that opens with `\mxunit{<id>}{<title>}` (or
`\mxunit[n]{...}` to keep a textbook's chapter number n, or `\mxfront{<id>}` for front matter), then an optional
`\mxsubtitle{...}`, then the canonical environments. A part included by a unit with `\mxinclude{path}` (figures,
solutions, assessment parts) opens with neither. Every resource cut from a book (notes, exercises, activities,
homework ...) starts with `\mxnewpage`, so French and English pages are balanced per resource. A unit may not load
packages, define macros, counters or colours, use raw colours, break pages by hand, or style text by hand (`\color`,
`\bfseries`, `\sffamily`, font sizes, `\hspace`, `\vspace`, `\noindent`, `\centering`, minipage; figure code is
exempt): the class commands carry the design (`tests/tex_lint.py`).

| Need | Command |
|---|---|
| book cover | `\mxcover{title}{course}{description}{details}{year}` (front unit) |
| line under a unit title (sessions, dates) | `\mxsubtitle{...}` |
| label line of an assessment paper | `\mxbanner{...}` (training), `\mxbanner*{...}` (reserved for assessment) |
| running line of a continued paper | `\mxcontinued{...}` |
| algorithm or code read in a question | `\mxpseudo{line\\ \mxtab indented line}` (inside arguments); `lstlisting` elsewhere |
| figure with caption; two side by side | `figurebox[caption]`; `\mxtwocols{...}{...}` | Labels are written `\mxlabel{name}`
and become `<id>:name`. A course main is generated from the manifest; by hand it is:
```latex
\documentclass[course=premiere,lang=fr,edition=teacher]{mxbook}
\begin{document}
\mxinclude{courses/premiere/c05}
\end{document}
```

## Native document frame

`mx-layout.sty` draws the dark header band, mint rule, language label and footer directly in TeX. The body remains
Palatino through `mathpazo`; frame text uses the class's sans-serif family. Body geometry is unchanged. The native
frame replaces the former secondary running heads and footers, so printed page counters refer to the downloaded
file rather than to an enclosing book. The `slide-figs` layout remains bare and keeps its figure palette.

`\mxdocumentpages` is recorded after the final shipout and settles on the normal auxiliary-file rerun. The
pipeline also compiles `\mxframeonly{n}` on the same master class to obtain cached frames numbered 1 to n. When
cutting an excerpt, `mxbuild.pdf` copies its selected body and the matching native frame, preserving page geometry,
bookmarks and links to retained pages. No colour operators, equations, TikZ or code listings are rewritten.
Do not add frame styling to units or reintroduce a Python PDF styler. The former document-style ledger is historical:
`docs/history/DOCUMENT_STYLE_LEDGER-overlay.json`. The PDF parity check also verifies every local sheet counter,
language label and PDF link policy.

## Languages

French is the source. Write numbers and notation with the commands above (`\num{0,5}`, never `0{,}5` or `0,5`), dates as `\mxdate{2026-09-15}`. The English unit
`<id>.en.tex` is generated (`python -m mxbuild twin gen <id>.fr.tex`) from the table `<id>.en.json`
(`python -m mxbuild twin stub <id>.fr.tex` adds untranslated segments and removes unused ones; `twin check` fails on either); never edit it. Translate prose only: placeholders
`[[mN]]` stand for maths and atoms (`\mxdate`, `\ref`, `\code`, `\num`, `\pc`) and must each appear once. Figure node texts, axis labels
and `\text{}` inside maths are separate segments. See `docs/ADR-0001-tex-i18n.md`.

## Figures

TikZ and pgfplots with the `mx` styles and palette; words in figures go in node texts or axis labels (translated), never
in coordinates or style options. A figure shared by books and slides lives in `content/tex/figures/<id>.fr.tex`.
