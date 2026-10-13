# LaTeX sources

Each course folder holds the complete sources of its booklets: chapters, corrections, assessments,
figures and style files. English twins carry the suffix `-en` (translated prose, identical mathematics).

```sh
cd premiere
pdflatex -no-shell-escape eleve.tex && pdflatex -no-shell-escape eleve.tex            # French, student
pdflatex -no-shell-escape professeur.tex && pdflatex -no-shell-escape professeur.tex  # French, teacher
```

Engine and preamble are those of each source (pdfLaTeX unless stated; enrichment workshops use XeLaTeX).
Shell escape is never needed.

Courses already moved to the shared system (`core/` folder: class `mxbook` and packages) hold one file per unit,
`<unit>.fr.tex` and `<unit>.en.tex` (the English unit is generated from the French one), and the same entry files
(`eleve.tex`, `professeur.tex`, `eleve-en.tex`, `professeur-en.tex`); keep `core/` next to the course folder.

# Sources LaTeX

Chaque dossier contient les sources complètes d’un livret : chapitres, corrigés, évaluations, figures et
fichiers de style. Les versions anglaises portent le suffixe `-en` (prose traduite, mathématiques identiques).
Les cours déjà passés au système commun (dossier `core/`) ont un fichier par unité, `<unité>.fr.tex` et
`<unité>.en.tex` (généré à partir du français) ; garder `core/` à côté du dossier du cours.
