# TeX style guide

One LaTeX system for every course: class `mxbook` and packages in `content/tex/core/`. pdfLaTeX without shell escape,
`mathpazo`; large boxes `mdframed` (left rule, breakable), small elements `tcolorbox`; numbering by `\newcounter`; page
breaks by `\mxneed{n}` (`\Needspace`), never by hand. Minimal compilable example: `content/tex/core/example.tex`
(`pdflatex example.tex` in that folder; options `\def\mxopts{lang=en,edition=teacher}\input{example}`).

## Files

| File | Holds |
|---|---|
| `mxbook.cls` | options `course=`, `lang=fr\|en`, `edition=student\|teacher\|both`, `layout=booklet\|sheet\|slide-figs`; `\mxinclude`, `\mxunit`, `\mxlabel` |
| `mx-i18n.sty` | babel, label dictionary (`\mxlabelof{key}`), `\mxtr{fr}{en}` (core only), `\mxdate{YYYY-MM-DD}`, `\mxdate*{...}` |
| `mx-edition.sty` | `\ifmxteacher`, `\mxteacheronly{}`, `\mxstudentonly{}` |
| `mx-math.sty` | every maths macro, once (`\R \N \Z \Q \D \C \vect \vi \vj \vk \norm \vc \deter \abs \dd \e \ent \Card \pgcd \ppcm \degre \un \sci`) |
| `mx-figures.sty` | palette `mxink mxmint mxmintpale mxteacher mxwarn mxline mxmuted mxpaper`; TikZ libraries; styles `mxcurve mxaux mxpoint mxaxis` |
| `mx-layout.sty` | geometry per layout, headings, running heads, `\mxneed{n}` |
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

## Units

A unit is one file `<id>.fr.tex` that starts with `\mxunit{<id>}{<title>}`. It may not load packages, define macros,
counters or colours, use raw colours, or break pages by hand (`tests/tex_lint.py`). Labels are written `\mxlabel{name}`
and become `<id>:name`. A course main is generated from the manifest; by hand it is:
```latex
\documentclass[course=premiere,lang=fr,edition=teacher]{mxbook}
\begin{document}
\mxinclude{courses/premiere/c05}
\end{document}
```

## Languages

French is the source. Write decimals as `0{,}5` (never `0,5`), dates as `\mxdate{2026-09-15}`. The English unit
`<id>.en.tex` is generated (`python -m mxbuild twin gen <id>.fr.tex`) from the table `<id>.en.json`
(`python -m mxbuild twin stub <id>.fr.tex` adds untranslated segments and removes unused ones; `twin check` fails on either); never edit it. Translate prose only: placeholders
`[[mN]]` stand for maths and atoms (`\mxdate`, `\ref`, `\code`) and must each appear once. Figure node texts, axis labels
and `\text{}` inside maths are separate segments. See `docs/ADR-0001-tex-i18n.md`.

## Figures

TikZ and pgfplots with the `mx` styles and palette; words in figures go in node texts or axis labels (translated), never
in coordinates or style options. A figure shared by books and slides lives in `content/tex/figures/<id>.fr.tex`.
