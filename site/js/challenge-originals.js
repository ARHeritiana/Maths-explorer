// The original question of each challenge.
//
// The site can only check a number, so every challenge has two versions: the original problem, usually an algorithm, a
// strategy, a construction or a proof, which the learner answers alone or with a teacher, and the checkable version
// (the number asked in challenge-variants.js). The original never gives away the answer or the method.
// Each entry is (q) => [French, English] where q holds the parameters of the current variation.
const P = (fr, en) => [fr, en];

export const ORIGINALS = {
  doors: (q) => P(
    `Quelles portes sont ouvertes à la fin parmi les ${q.n} portes, et pourquoi celles-là ? Explique ce qui les distingue des autres, sans avoir à simuler les ${q.n} passages.`,
    `Which of the ${q.n} doors are open at the end, and why those ones? Explain what sets them apart from the others, without simulating all ${q.n} passes.`),
  chess: (q) => P(
    `Peut-on recouvrir exactement ce plateau de ${q.n} × ${q.n} cases, privé de ${q.kind === "adj" ? "deux coins voisins" : "deux coins opposés"}, par des dominos 2 × 1, sans chevauchement ni débordement ? Si oui, décris un pavage. Sinon, démontre que c’est impossible par un argument qui évite d’essayer tous les placements.`,
    `Can this ${q.n} × ${q.n} board, missing ${q.kind === "adj" ? "two neighbouring corners" : "two opposite corners"}, be covered exactly by 2 × 1 dominoes, with no overlap and nothing sticking out? If so, describe a tiling. If not, prove it is impossible with an argument that avoids trying every placement.`),
  nim: (q) => P(
    `Avec ${q.n} pierres et des retraits de 1 à ${q.m}, lequel des deux joueurs peut forcer la victoire ? Décris sa stratégie, puis démontre qu’elle gagne quoi que fasse l’adversaire. Pour quels nombres de pierres au départ le premier joueur gagne-t-il ?`,
    `With ${q.n} stones and moves of 1 to ${q.m}, which of the two players can force a win? Describe the strategy, then prove it wins whatever the opponent does. For which starting numbers of stones does the first player win?`),
  pigeonhole: (q) => P(
    `Démontre qu’en choisissant assez d’entiers distincts, deux d’entre eux ont forcément une différence divisible par ${q.m}. À partir de combien d’entiers est-ce garanti ? Prouve les deux faits : c’est garanti à partir de ce nombre, et ce n’est pas garanti avec un entier de moins.`,
    `Prove that if you choose enough distinct integers, two of them must have a difference divisible by ${q.m}. From how many integers on is this guaranteed? Prove both facts: it is guaranteed from that number on, and it is not guaranteed with one integer fewer.`),
  squares: () => P(
    "Trouve une formule pour 1 + 3 + 5 + … + (2k − 1), quel que soit k, et démontre-la de deux façons différentes : par un dessin, puis par un calcul.",
    "Find a formula for 1 + 3 + 5 + … + (2k − 1), for any k, and prove it in two different ways: with a picture, then with a calculation."),
  hanoi: (q) => P(
    `Décris un algorithme qui transfère une pile de ${q.n} disques d’une tige à une autre en respectant les règles. Prouve qu’il est correct, puis prouve qu’aucun algorithme ne peut faire moins de coups.`,
    `Describe an algorithm that moves a stack of ${q.n} disks from one peg to another within the rules. Prove it is correct, then prove that no algorithm can use fewer moves.`),
  eggs: (q) => P(
    `Décris une stratégie de lancers qui permet de trouver à coup sûr l’étage critique avec ${q.eggs} œufs et un immeuble de ${q.floors} étages, en faisant le moins de lancers possible dans le pire des cas. Explique pourquoi elle marche, puis pourquoi aucune autre stratégie ne ferait mieux.`,
    `Describe a dropping strategy that is sure to find the critical floor with ${q.eggs} eggs and a ${q.floors}-floor building, using as few drops as possible in the worst case. Explain why it works, then why no other strategy could do better.`),
  konigsberg: () => P(
    "Peut-on se promener dans la ville en traversant chaque pont exactement une fois, en choisissant librement le départ ? Justifie ta réponse par un argument général, pas par des essais. Si c’est impossible, quels ponts pourrait-on retirer ou ajouter pour que cela devienne possible ?",
    "Can you walk through the city crossing every bridge exactly once, starting wherever you like? Justify your answer with a general argument, not by trial. If it is impossible, which bridges could be removed or added to make it possible?"),
  josephus: (q) => (Number(q.k) === 2
    ? P("Trouve une règle, ou une formule, qui donne la dernière personne restante pour un cercle d’un nombre quelconque de personnes, quand on élimine une personne sur deux. Démontre-la.",
      "Find a rule, or a formula, that gives the last person standing for a circle of any number of people when every second person is removed. Prove it.")
    : P(`Décris une procédure qui calcule la dernière personne restante pour un cercle de ${q.n} personnes, quand on élimine une personne sur 3. Peux-tu la rendre bien plus rapide que de simuler tout le jeu ?`,
      `Describe a procedure that computes the last person standing for a circle of ${q.n} people when every third person is removed. Can you make it much faster than simulating the whole game?`)),
  ramsey: (q) => P(
    `Détermine le plus petit nombre de personnes qui garantit trois personnes deux à deux amies ou ${q.s} personnes deux à deux inconnues. Rédige la preuve en deux parties : un groupe explicite, un peu plus petit, qui échappe à la conclusion, puis un argument montrant que ce nombre suffit.`,
    `Determine the smallest number of people that guarantees three mutual friends or ${q.s} mutual strangers. Write the proof in two parts: an explicit group, a little smaller, that escapes the conclusion, then an argument showing that this number is enough.`),
  artgallery: (q) => P(
    `Trouve le plus petit nombre g de gardiens tel que toute galerie à ${q.n} côtés puisse être surveillée par g gardiens immobiles, et démontre-le en deux parties : une méthode qui fonctionne pour toute galerie, puis une galerie qui ne peut pas se contenter de moins de g gardiens. Explore des galeries de formes variées avant de conjecturer.`,
    `Find the smallest number g of guards such that every gallery with ${q.n} sides can be watched by g fixed guards, and prove it in two parts: a method that works for every gallery, then a gallery that cannot do with fewer than g guards. Explore galleries of different shapes before you conjecture.`),
  gridpaths: () => P(
    "Compte les chemins de deux façons différentes, puis explique pourquoi les deux méthodes donnent le même nombre.",
    "Count the paths in two different ways, then explain why both methods give the same number."),
  horses: (q) => P(
    `Décris la suite de courses (quels chevaux courent ensemble, en fonction des résultats déjà connus) qui permet de trouver ${Number(q.top) === 3 ? "les trois plus rapides" : "le plus rapide"} avec le moins de courses possible. Justifie que ta méthode marche dans tous les cas, puis qu’on ne peut pas faire moins.`,
    `Describe the sequence of races (which horses run together, depending on the results already known) that finds ${Number(q.top) === 3 ? "the three fastest" : "the fastest"} with as few races as possible. Justify that your method works in every case, then that fewer races cannot do it.`),
  cake: (q) => P(
    `Décris des coupes planes verticales qui partagent ce gâteau en ${q.n} parts ayant le même volume de gâteau et la même surface de crème, et démontre que c’est bien le cas.`,
    `Describe vertical plane cuts that share this cake into ${q.n} portions with the same volume of cake and the same surface of cream, and prove that they do.`),
  queens: (q) => P(
    `Comment placer ${q.k} dames sur l’échiquier de ${q.n} × ${q.n} pour laisser le plus de cases libres possible ? Décris ton placement, puis explique comment tu sais qu’on ne peut pas faire mieux.`,
    `How should ${q.k} queens be placed on the ${q.n} × ${q.n} board to leave as many free squares as possible? Describe your placement, then explain how you know nothing better exists.`),
  snail: () => P(
    "Explique ton raisonnement, puis trouve une règle qui donne le jour d’arrivée de l’escargot quelle que soit la hauteur du poteau.",
    "Explain your reasoning, then find a rule that gives the snail's day of arrival whatever the height of the pole."),
  bridge: () => P(
    "Décris la suite des traversées (qui passe, qui revient avec la lampe) qui permet aux quatre soldats de passer le plus vite possible. Comment peux-tu être sûr qu’aucune autre suite ne fait mieux ?",
    "Describe the sequence of crossings (who goes, who brings the lamp back) that gets the four soldiers across as fast as possible. How can you be sure no other sequence does better?"),
  lighteggs: (q) => P(
    `Décris comment trouver l’œuf abîmé parmi ${q.n} œufs avec le moins de pesées possible, dans le pire des cas. Justifie que ta méthode marche à coup sûr, puis qu’on ne peut pas faire avec moins de pesées.`,
    `Describe how to find the spoiled egg among ${q.n} eggs with as few weighings as possible, in the worst case. Justify that your method is certain to work, then that fewer weighings cannot do it.`),
  fakecoins: () => P(
    "Comment identifier la pile fausse avec une seule pesée ? Décris ce que tu poses sur la balance, ce que tu lis, et comment tu en déduis la pile. Cherche ensuite à utiliser le moins de pièces possible.",
    "How can you identify the fake pile with a single weighing? Describe what you put on the scale, what you read, and how you deduce the pile. Then try to use as few coins as possible."),
  reflect: () => P(
    "Où le randonneur doit-il puiser l’eau pour que son trajet de A à B, en passant par la rivière, soit le plus court possible ? Décris une construction à la règle et au compas, et démontre qu’elle donne le minimum.",
    "Where should the hiker draw water so that the trip from A to B, touching the river, is as short as possible? Describe a construction with ruler and compass, and prove that it gives the minimum."),
  lunes: () => P(
    "Compare l’aire totale des deux lunules à l’aire du triangle ABC. Que remarques-tu ? Démontre-le sans utiliser de valeur approchée de π.",
    "Compare the total area of the two lunes with the area of triangle ABC. What do you notice? Prove it without using an approximate value of π."),
  star: (q) => P(
    `Que vaut la somme des angles aux pointes de l’étoile {${q.n}/${q.k}} ? Démontre ton résultat, puis explore d’autres étoiles : la somme change-t-elle avec le nombre de points et avec le pas ?`,
    `What is the sum of the point angles of the star {${q.n}/${q.k}}? Prove your result, then explore other stars: does the sum change with the number of points and with the step?`),
  box: () => P(
    "Décris comment trouver le plus court chemin, sur la surface d’une boîte en forme de pavé droit, entre deux coins opposés, et justifie que ton chemin est bien le plus court de tous ceux qui existent.",
    "Describe how to find the shortest path, on the surface of a box shaped like a rectangular block, between two opposite corners, and justify that your path is the shortest of all possible ones."),
  merge: () => P(
    "Démontre que le nombre final ne dépend pas des choix faits à chaque étape.",
    "Prove that the final number does not depend on the choices made at each step."),
  cham: (q) => { const [a, b, c] = String(q.set).split(","); return P(
    `Avec ${a}, ${b} et ${c} caméléons de chaque couleur, peut-on arriver à une île où tous ont la même couleur ? Si oui, décris une suite de rencontres. Sinon, démontre que c’est impossible. Pour quels effectifs de départ est-ce possible ?`,
    `With ${a}, ${b} and ${c} chameleons of each colour, can the island reach a state where all have the same colour? If so, describe a sequence of meetings. If not, prove it is impossible. For which starting numbers is it possible?`); },
  pegs: (q) => { const [x, y] = String(q.target).split(","); return P(
    `Trois pions sont aux points (0, 0), (1, 0) et (0, 1). Un pion peut sauter par-dessus un autre et atterrir au point symétrique, si ce point est libre. Peut-on amener un pion au point (${x}, ${y}) ? Si oui, décris une suite de sauts. Sinon, démontre que c’est impossible. Quels points du quadrillage un pion peut-il occuper un jour ?`,
    `Three pegs sit at (0, 0), (1, 0) and (0, 1). A peg may jump over another and land on the symmetric point, if that point is free. Can a peg be brought to the point (${x}, ${y})? If so, describe a sequence of jumps. If not, prove it is impossible. Which points of the grid can a peg ever occupy?`); },
  inversions: () => P(
    "Démontre que le nombre d’échanges effectués ne dépend pas de l’ordre dans lequel on choisit les voisines à échanger. À quoi ce nombre correspond-il pour la rangée de départ ?",
    "Prove that the number of swaps made does not depend on the order in which neighbouring pairs are chosen. What does this number correspond to for the starting row?"),
  piles: () => P(
    "Trouve une formule, en fonction du nombre de cailloux, pour la somme de tous les produits, et démontre qu’elle ne dépend pas de la façon de séparer les tas.",
    "Find a formula, in terms of the number of pebbles, for the sum of all the products, and prove that it does not depend on how the piles are split."),
};

export const originalOf = (id, q) => (ORIGINALS[id] ? ORIGINALS[id](q) : null);
