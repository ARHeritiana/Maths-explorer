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

Les chapitres sont séparés dans `chapitres/`, les 55 extraits référencés du
manuel dans `manuel/extraits-calao.tex`, les quatorze sujets de DS dans
`evaluations/devoirs.tex`, et les annexes dans `annexes/`.

Les énoncés retenus dans le manuel *Calao Terminale technologique* sont
reproduits dans le livret avec leur page et leur numéro. Le macro-fichier
`manuel/extraits-calao.tex` centralise à la fois les énoncés, les espaces de
réponse et les corrections réservées à l'édition professeur.

## Architecture éditoriale

- `preambule.tex` : charte typographique, couleurs et environnements ;
- `livret-tstmg.tex` : couverture, mode d'emploi et ordre d'assemblage ;
- `chapitres/` : cours et séances ;
- `manuel/` : exercices Calao reproduits et corrigés ;
- `evaluations/` : DS en deux versions, structurés en 6 + 6 + 8 points ;
- `annexes/` : formulaire, programmation et sources.
