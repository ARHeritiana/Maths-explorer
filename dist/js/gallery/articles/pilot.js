// Pilot articles (Game of Life, moving sofa). Shape and rules: ../article.js. Written in the voice of an encyclopedia:
// third person, present tense, facts and sources, no instruction and no question addressed to the reader.
const p = (fr, en) => [fr, en];
export const LIFE_ARTICLES = {
  life: {
    facts: [
      [p("Inventeur", "Inventor"), p("John Horton Conway", "John Horton Conway")],
      [p("Date", "Date"), p("1970", "1970")],
      [p("Domaine", "Field"), p("Automates cellulaires", "Cellular automata")],
      [p("Règle", "Rule"), p("B3/S23", "B3/S23")],
      [p("Statut", "Status"), p("Turing-complet (démontré)", "Turing complete (proved)")],
    ],
    lead: [
      p("Le jeu de la vie est un automate cellulaire imaginé par le mathématicien britannique John Horton Conway en 1970. Il se déroule sur une grille de cases, chacune vivante ou morte, qui évolue de génération en génération selon deux règles seulement, sans aucune intervention extérieure.",
        "The Game of Life is a cellular automaton devised by the British mathematician John Horton Conway in 1970. It unfolds on a grid of cells, each alive or dead, which changes from generation to generation under just two rules, with no outside intervention."),
    ],
    sections: [
      { h: p("Les règles", "The rules"), p: [
        p("Une case morte devient vivante si exactement trois de ses huit voisines sont vivantes (naissance). Une case vivante reste vivante si elle a deux ou trois voisines vivantes ; sinon elle meurt, par isolement (moins de deux) ou par surpopulation (plus de trois). Toutes les cases changent simultanément.",
          "A dead cell becomes alive if exactly three of its eight neighbours are alive (birth). A live cell stays alive if it has two or three live neighbours; otherwise it dies, of isolation (fewer than two) or overcrowding (more than three). All cells change at the same time."),
        p("Cette règle est notée B3/S23 (« born 3, survive 2 or 3 »). Une configuration de départ suffit à tout déterminer : le jeu n’a pas de joueur.",
          "The rule is written B3/S23 (“born 3, survive 2 or 3”). A starting pattern determines everything: the game has no player.") ] },
      { h: p("Les familles de motifs", "Families of patterns"), p: [
        p("Les motifs se rangent selon leur comportement. Les natures mortes ne changent jamais (le bloc de quatre cases). Les oscillateurs reviennent à leur forme après une période (le clignotant, de période 2). Les vaisseaux reviennent à leur forme décalée dans l’espace : le planeur, de cinq cases, se retrouve à l’identique, décalé d’une case en diagonale, au bout de 4 générations, donc à la vitesse c/4 (une case toutes les quatre générations, en diagonale).",
          "Patterns are sorted by behaviour. Still lifes never change (the block of four cells). Oscillators return to their shape after a period (the blinker, period 2). Spaceships return to their shape shifted in space: the five-cell glider takes the same shape, one cell diagonally further, after 4 generations, so it moves at speed c/4 (one cell every four generations, diagonally)."),
        p("Certains motifs très petits ont une évolution longue et irrégulière. Le R-pentomino, cinq cases seulement, met 1 103 générations à se stabiliser, après avoir produit six planeurs.",
          "Some very small patterns have a long, irregular evolution. The R-pentomino, only five cells, takes 1,103 generations to settle, having thrown off six gliders.") ] },
      { h: p("Croissance et calcul", "Growth and computation"), p: [
        p("En 1970, Bill Gosper découvre un canon à planeurs : un motif qui revient à sa forme toutes les 30 générations en ayant émis un planeur, et dont la population croît donc sans limite. Conway avait conjecturé le contraire ; il avait offert un prix pour trancher.",
          "In 1970 Bill Gosper found a glider gun: a pattern that takes its shape again every 30 generations having emitted a glider, so that its population grows without bound. Conway had conjectured the opposite and had offered a prize to settle the question."),
        p("Les planeurs servent de signaux et les canons d’horloges : on peut en tirer des portes logiques et des mémoires. Le jeu de la vie est ainsi Turing-complet : il peut simuler n’importe quel calcul d’un ordinateur. Une conséquence est qu’aucun algorithme ne peut décider, pour tout motif de départ, s’il finira par disparaître.",
          "Gliders act as signals and guns as clocks: logic gates and memory can be built from them. The Game of Life is therefore Turing complete: it can simulate any computation of a computer. One consequence is that no algorithm can decide, for every starting pattern, whether it will eventually die out.") ] },
      { h: p("Origines et héritage", "Origins and legacy"), p: [
        p("L’idée d’automate cellulaire remonte à John von Neumann et Stanislaw Ulam, qui cherchaient dans les années 1940 une machine capable de se reproduire. Martin Gardner présente le jeu de Conway en octobre 1970 dans sa rubrique de Scientific American ; des lecteurs du monde entier envoient alors leurs découvertes.",
          "The idea of a cellular automaton goes back to John von Neumann and Stanislaw Ulam, who in the 1940s sought a machine able to reproduce itself. Martin Gardner presented Conway’s game in October 1970 in his Scientific American column, and readers worldwide then sent in their discoveries."),
        p("Le jeu est devenu un exemple classique de complexité émergente : une règle locale très simple produit un comportement global riche et imprévisible.",
          "The game has become a classic example of emergent complexity: a very simple local rule produces rich, unpredictable global behaviour.") ] },
    ],
  },
  "moving-sofa": {
    facts: [
      [p("Posé par", "Posed by"), p("Leo Moser, 1966", "Leo Moser, 1966")],
      [p("Domaine", "Field"), p("Géométrie, optimisation", "Geometry, optimisation")],
      [p("Meilleur canapé connu", "Best known sofa"), p("Gerver, 1992 : aire ≈ 2,2195", "Gerver, 1992: area ≈ 2.2195")],
      [p("Statut", "Status"), p("Optimalité annoncée par Baek (2024), en cours de vérification", "Optimality announced by Baek (2024), under review")],
    ],
    lead: [
      p("Le problème du canapé (moving sofa problem) demande la plus grande aire d’une forme plane qu’on peut faire passer, en la déplaçant dans le plan, dans un couloir de largeur 1 qui tourne à angle droit. Posé par Leo Moser en 1966, il compte parmi les problèmes d’optimisation géométrique les plus simples à énoncer.",
        "The moving sofa problem asks for the largest area of a plane shape that can be moved round a right-angled corner in a hallway of width 1. Posed by Leo Moser in 1966, it is one of the simplest-to-state problems of geometric optimisation."),
    ],
    sections: [
      { h: p("Énoncé", "Statement"), p: [
        p("Un couloir en L a la largeur 1 dans ses deux bras. Une forme du plan (le « canapé ») doit aller d’un bras à l’autre par des translations et des rotations, sans jamais sortir du couloir. On cherche l’aire maximale d’une telle forme.",
          "An L-shaped hallway has width 1 in both arms. A plane shape (the “sofa”) must travel from one arm to the other by translations and rotations, never leaving the hallway. The question is the maximal area of such a shape.") ] },
      { h: p("Premiers canapés", "Early sofas"), p: [
        p("Un carré de côté 1 passe, avec une aire de 1. Un demi-disque de rayon 1 passe en tournant sur place : son aire vaut π/2 ≈ 1,57. En 1968, John Hammersley coupe ce demi-disque en deux quarts de disque et insère entre eux un rectangle de largeur 1 et de longueur 4/π, creusé d’un demi-disque de rayon 2/π. L’aire est π/2 + 2/π ≈ 2,2074.",
          "A square of side 1 passes, with area 1. A half-disc of radius 1 passes by turning on the spot: its area is π/2 ≈ 1.57. In 1968 John Hammersley cut this half-disc into two quarter discs and inserted between them a rectangle of width 1 and length 4/π, hollowed out by a half-disc of radius 2/π. The area is π/2 + 2/π ≈ 2.2074."),
        p("Dans cette famille, l’aire s’écrit A(r) = π/2 + 2r − πr²/2 pour un demi-disque de rayon r creusé ; elle est maximale pour r = 2/π.",
          "In this family the area is A(r) = π/2 + 2r − πr²/2 for a hollowing half-disc of radius r, and it is largest for r = 2/π.") ] },
      { h: p("Le canapé de Gerver", "Gerver’s sofa"), p: [
        p("En 1992, Joseph Gerver trouve une forme plus grande, dont le contour est formé de dix-huit morceaux analytiques différents. Son aire, d’environ 2,2195, est donnée par des équations algébriques sans formule simple ; Dan Romik en a calculé les constantes en 2018. Hammersley avait montré dès 1968 qu’aucun canapé ne dépasse 2√2 ≈ 2,83 ; la meilleure majoration publiée est d’environ 2,37.",
          "In 1992 Joseph Gerver found a larger shape whose boundary is made of eighteen different analytic pieces. Its area, about 2.2195, is given by algebraic equations with no simple closed form; Dan Romik computed the constants in 2018. Hammersley had shown in 1968 that no sofa exceeds 2√2 ≈ 2.83; the best published upper bound is about 2.37.") ] },
      { h: p("Optimalité", "Optimality"), p: [
        p("Gerver a conjecturé que son canapé est le plus grand possible. En novembre 2024, Jineon Baek a déposé sur arXiv une démonstration de cette conjecture. Au 20 octobre 2026, elle n’est pas parue dans une revue et reste en cours de vérification.",
          "Gerver conjectured that his sofa is the largest possible. In November 2024 Jineon Baek posted on arXiv a proof of this conjecture. As of 20 October 2026 it has not appeared in a journal and is still being checked.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },
};
