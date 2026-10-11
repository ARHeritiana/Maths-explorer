# Livret annuel de mathématiques — Terminale STMG 2026–2027

Ce dossier contient deux éditions issues de la même source :

- `livret-eleve.tex` : sujets, cours, activités et espaces de réponse ;
- `livret-prof.tex` : même livret avec corrigés, vigilance et conduite de séance.

## Compilation

Depuis ce dossier :

```bash
latexmk -pdf -interaction=nonstopmode -halt-on-error -jobname=livret-tstmg-eleve livret-eleve.tex
latexmk -pdf -interaction=nonstopmode -halt-on-error -jobname=livret-tstmg-prof livret-prof.tex
```

Les chapitres sont séparés dans `chapitres/`, les 55 exercices d'application originaux
dans `manuel/exo-A.tex` à `exo-D.tex` (et leurs jumeaux `-en`), les quatorze sujets de DS dans
`evaluations/devoirs.tex`, et les annexes dans `annexes/`.

Les exercices d'application sont originaux ; les encadrés « Pour prolonger »
citent seulement les pages et numéros du manuel *Calao Terminale technologique*.
Les macros `\DefExo` (dans `preambule.tex`) rangent chaque énoncé, ses lignes de
réponse et sa correction réservée à l'édition professeur.

## Architecture éditoriale

- `preambule.tex` : charte typographique, couleurs et environnements ;
- `livret-tstmg.tex` : couverture, mode d'emploi et ordre d'assemblage ;
- `chapitres/` : cours et séances ;
- `manuel/` : exercices d'application originaux et corrigés ;
- `evaluations/` : DS en deux versions, structurés en 6 + 6 + 8 points ;
- `annexes/` : formulaire, programmation et sources.
