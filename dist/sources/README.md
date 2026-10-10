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

# Sources LaTeX

Chaque dossier contient les sources complètes d’un livret : chapitres, corrigés, évaluations, figures et
fichiers de style. Les versions anglaises portent le suffixe `-en` (prose traduite, mathématiques identiques).
