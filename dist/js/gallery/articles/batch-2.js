// Batch 2 of the gallery articles (shape and rules: ../article.js). Encyclopedia voice: third person, present tense, no
// instruction and no question addressed to the reader.
const p = (fr, en) => [fr, en];
export const BATCH2 = {
  "soap-films": {
    facts: [
      [p("Étudiés par", "Studied by"), p("Joseph Plateau (XIXe siècle)", "Joseph Plateau (19th century)")],
      [p("Domaine", "Field"), p("Surfaces minimales, calcul des variations", "Minimal surfaces, calculus of variations")],
      [p("Problème de Plateau", "Plateau’s problem"), p("Existence d’une surface d’aire minimale bordée par un fil donné", "Existence of a least-area surface spanning a given wire")],
      [p("Statut", "Status"), p("Résolu en 1930 et 1931 (Douglas, Radó)", "Solved in 1930 and 1931 (Douglas, Radó)")],
    ],
    lead: [
      p("Un film de savon est une mince membrane de liquide tendue entre les parties d’un cadre de fil de fer plongé dans de l’eau savonneuse. Libre de toute différence de pression, il prend la forme qui rend son aire la plus petite possible parmi les surfaces voisines : c’est une surface minimale. Les films de savon sont ainsi un moyen concret, et depuis longtemps classique, de voir à l’œuvre un problème de minimisation d’aire.",
        "A soap film is a thin membrane of liquid stretched across a wire frame dipped in soapy water. Free of any pressure difference, it takes the shape that makes its area as small as possible among nearby surfaces: it is a minimal surface. Soap films are thus a concrete and long-standing way of watching an area-minimisation problem at work."),
    ],
    sections: [
      { h: p("Pourquoi un film minimise son aire", "Why a film minimises its area"), p: [
        p("La tension superficielle tire sur chaque petit morceau du film : celui-ci se déplace jusqu’à ce que son aire ne puisse plus diminuer par une petite déformation. Sur un cadre plan, le film est le morceau de plan limité par le fil. Sur un cadre gauche (par exemple un carré de fil dont les côtés ne sont pas dans un même plan), aucun plan ne convient et le film devient une surface en forme de selle.",
          "Surface tension pulls on every small piece of the film, which moves until its area can no longer shrink under a small deformation. On a flat frame the film is the piece of plane bounded by the wire. On a skew frame (for instance a square of wire whose sides do not lie in one plane) no plane fits and the film becomes a saddle-shaped surface.") ] },
      { h: p("Les mathématiques", "The mathematics"), p: [
        p("En chaque point d’une surface lisse, on peut mesurer deux courbures principales, l’une vers le haut et l’autre vers le bas pour une selle. Un film en équilibre a une courbure moyenne nulle : les deux se compensent exactement, comme sur une selle. Lagrange écrit dès 1762 l’équation qui traduit cette condition pour une surface décrite comme un graphe.",
          "At each point of a smooth surface two principal curvatures can be measured, one bending up and the other down in the case of a saddle. A film in equilibrium has zero mean curvature: the two cancel exactly, as on a saddle. Lagrange wrote down in 1762 the equation expressing this condition for a surface given as a graph."),
        p("Une bulle fermée, au contraire, contient de l’air sous pression : la différence de pression impose une courbure moyenne constante non nulle. C’est un problème voisin mais différent, qu’il ne faut pas confondre avec celui du film tendu sur un fil.",
          "A closed bubble, by contrast, encloses pressurised air: the pressure difference forces a constant, nonzero mean curvature. This is a neighbouring but different problem, not to be confused with that of a film stretched on a wire.") ] },
      { h: p("Plateau et le problème de Plateau", "Plateau and Plateau’s problem"), p: [
        p("Le physicien belge Joseph Plateau étudie ces films au XIXe siècle avec des cadres de fil ; sa collection en compte environ 80. Il observe aussi comment plusieurs films se rejoignent : trois films se rencontrent toujours le long d’une arête en formant des angles égaux de 120 degrés, et quatre arêtes se rejoignent en un sommet.",
          "The Belgian physicist Joseph Plateau studied these films in the nineteenth century using wire frames; his collection had about 80. He also observed how several films join: three films always meet along an edge at equal angles of 120 degrees, and four edges meet at a vertex."),
        p("La question mathématique, appelée problème de Plateau, demande si tout fil fermé borde une surface d’aire minimale. Jesse Douglas en 1930 et Tibor Radó en 1931 la résolvent, indépendamment, pour une surface qui est un disque déformé. Un même cadre peut cependant porter plusieurs films stables : l’expérience en trouve un, pas forcément celui de plus petite aire.",
          "The mathematical question, called Plateau’s problem, asks whether every closed wire bounds a surface of least area. Jesse Douglas in 1930 and Tibor Radó in 1931 solved it independently for a surface that is a deformed disc. A single frame can nevertheless carry several stable films: the experiment finds one of them, not necessarily the one of smallest area.") ] },
      { h: p("Calculer un film", "Computing a film"), p: [
        p("Numériquement, on approche le film par un maillage de triangles dont les sommets de bord sont fixés. L’aire discrète est la somme des aires des triangles, chacune égale à la moitié de la norme du produit vectoriel de deux côtés. On déplace les sommets libres dans le sens qui fait baisser cette somme, en réduisant le pas si l’aire augmente.",
          "Numerically, the film is approximated by a mesh of triangles whose boundary vertices are fixed. The discrete area is the sum of the triangle areas, each equal to half the norm of the cross product of two sides. The free vertices are moved in the direction that lowers this sum, with a smaller step whenever the area increases."),
        p("Le résultat approche une surface minimale pour la topologie imposée par le maillage ; il ne prouve pas l’existence d’un minimum absolu parmi toutes les topologies possibles.",
          "The result approximates a minimal surface for the topology imposed by the mesh; it does not prove an absolute minimum among all possible topologies.") ] },
      { h: p("Applications", "Applications"), p: [
        p("Les films de savon rendent visibles des problèmes de minimisation d’aire. Les mêmes idées servent à comprendre les mousses, la capillarité et la forme de petites soudures, et les surfaces minimales sont étudiées en géométrie, en physique et en architecture.",
          "Soap films make area-minimisation problems visible. The same ideas help to understand foams, capillarity and the shape of small solder joints, and minimal surfaces are studied in geometry, physics and architecture.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },

  knots: {
    facts: [
      [p("Domaine", "Field"), p("Topologie, théorie des nœuds", "Topology, knot theory")],
      [p("Premières tables", "First tables"), p("Peter Guthrie Tait, XIXe siècle", "Peter Guthrie Tait, 19th century")],
      [p("Mouvements de Reidemeister", "Reidemeister moves"), p("1927", "1927")],
      [p("Invariant présenté ici", "Invariant shown here"), p("Colorations à trois couleurs", "Three-colourings")],
      [p("Application", "Application"), p("Étude de l’ADN noué", "Study of knotted DNA")],
    ],
    lead: [
      p("En mathématiques, un nœud est un cercle plongé dans l’espace : une ficelle fermée, sans bouts libres, qu’on n’a pas le droit de couper. Deux dessins représentent le même nœud si l’on peut déformer continûment le fil de l’un jusqu’à l’autre sans le couper ni lui faire traverser un autre brin. La théorie des nœuds cherche à décider quand deux nœuds sont ou ne sont pas les mêmes.",
        "In mathematics a knot is a circle embedded in space: a closed string with no loose ends, which may not be cut. Two drawings represent the same knot if the strand of one can be deformed continuously into the other without cutting it or passing it through another strand. Knot theory seeks to decide when two knots are or are not the same."),
    ],
    sections: [
      { h: p("Diagrammes et croisements", "Diagrams and crossings"), p: [
        p("Un nœud se représente par sa projection dans le plan, où l’on marque à chaque croisement quel brin passe dessus et quel brin passe dessous. Le nombre de croisements dépend de la direction du regard : le même nœud a de nombreux diagrammes. Le cercle non noué, le trèfle (trois croisements) et le huit (quatre croisements) sont les exemples les plus simples.",
          "A knot is drawn by its projection in the plane, marking at each crossing which strand passes over and which passes under. The number of crossings depends on the viewing direction: one knot has many diagrams. The unknot (the plain circle), the trefoil (three crossings) and the figure-eight knot (four crossings) are the simplest examples."),
        p("En 1927, Kurt Reidemeister montre que deux diagrammes du même nœud se déduisent l’un de l’autre par une suite de trois types de mouvements locaux, qui portent aujourd’hui son nom.",
          "In 1927 Kurt Reidemeister showed that two diagrams of the same knot are related by a sequence of three kinds of local moves, which now bear his name.") ] },
      { h: p("Tables de nœuds", "Knot tables"), p: [
        p("Au XIXe siècle, les tables de nœuds se développent notamment avec Peter Guthrie Tait, dans le contexte d’un ancien modèle d’atomes tourbillons selon lequel les atomes seraient des nœuds dans un fluide. Ce modèle est abandonné, mais le travail de classement reste, et les tables modernes de nœuds, comme KnotInfo, prolongent cette entreprise.",
          "In the nineteenth century knot tables developed notably through Peter Guthrie Tait, in the context of an old vortex-atom model in which atoms were supposed to be knots in a fluid. That model was abandoned, but the work of classification remained, and modern knot tables such as KnotInfo continue that enterprise.") ] },
      { h: p("Invariants", "Invariants"), p: [
        p("Un invariant est une quantité attachée à un diagramme qui garde la même valeur à travers les mouvements de Reidemeister. Si deux diagrammes ont des valeurs différentes, les nœuds sont différents : un invariant peut parfois prouver que deux nœuds ne sont pas équivalents, mais deux nœuds de même valeur peuvent rester distincts.",
          "An invariant is a quantity attached to a diagram that keeps the same value through the Reidemeister moves. If two diagrams give different values the knots are different: an invariant can sometimes prove that two knots are not equivalent, but two knots with the same value may still be distinct.") ] },
      { h: p("Les colorations à trois couleurs", "Three-colourings"), p: [
        p("On colorie chaque arc du diagramme (de passage dessous à passage dessous) avec l’une de trois couleurs, numérotées modulo 3, de sorte qu’à chaque croisement 2c(dessus) ≡ c(dessous 1) + c(dessous 2) modulo 3 : les trois arcs sont alors de la même couleur ou de trois couleurs différentes. Chaque mouvement de Reidemeister induit une bijection entre les colorations avant et après : leur nombre est donc un invariant.",
          "Each arc of the diagram (from one undercrossing to the next) is given one of three colours, numbered modulo 3, so that at every crossing 2c(over) ≡ c(under 1) + c(under 2) modulo 3: the three arcs then have the same colour or three different colours. Every Reidemeister move induces a bijection between the colourings before and after, so their number is an invariant."),
        p("Le trèfle admet 9 colorations, dont 3 monochromes et donc 6 non constantes ; le cercle non noué en a 3, toutes monochromes. Le trèfle n’est donc pas le cercle. Le huit a lui aussi seulement 3 colorations monochromes : cet invariant seul ne peut ni distinguer le huit du cercle ni établir leur équivalence, et d’autres invariants sont nécessaires.",
          "The trefoil admits 9 colourings, 3 of them monochrome and so 6 nonconstant; the unknot has 3, all monochrome. The trefoil is therefore not the unknot. The figure-eight also has only 3 monochrome colourings: this invariant alone can neither tell the figure-eight from the unknot nor establish that they are equivalent, so other invariants are needed.") ] },
      { h: p("Prolongements", "Later developments"), p: [
        p("Les invariants restent des outils fondamentaux de topologie, et l’invention de nouveaux invariants nourrit la recherche depuis le XXe siècle. Aujourd’hui, la théorie intervient aussi dans l’étude de l’ADN noué : les brins d’ADN peuvent s’enchevêtrer, et reconnaître le nœud formé renseigne sur les enzymes qui agissent sur eux.",
          "Invariants remain fundamental tools of topology, and the invention of new invariants has fed research since the twentieth century. Today the theory also contributes to the study of knotted DNA: DNA strands can become entangled, and recognising the knot formed tells something about the enzymes acting on them.") ] },
    ],
  },

  einstein: {
    facts: [
      [p("Découvreurs", "Discovered by"), p("D. Smith, J. S. Myers, C. Kaplan, C. Goodman-Strauss", "D. Smith, J. S. Myers, C. Kaplan, C. Goodman-Strauss")],
      [p("Date", "Date"), p("2023", "2023")],
      [p("Domaine", "Field"), p("Pavages du plan, apériodicité", "Tilings of the plane, aperiodicity")],
      [p("Résultat", "Key result"), p("Une forme unique, le « chapeau », ne pave que de façon apériodique", "A single shape, the “hat”, tiles only aperiodically")],
      [p("Statut", "Status"), p("Démontré (article de 2023)", "Proved (2023 paper)")],
    ],
    lead: [
      p("Un « pavé Einstein » (de l’allemand « ein Stein », une pierre) est une forme unique qui recouvre le plan sans trou ni recouvrement, mais seulement de façon apériodique : aucun de ses pavages ne se répète par translation. En 2023, David Smith, Joseph Samuel Myers, Craig Kaplan et Chaim Goodman-Strauss présentent le « chapeau », qui répond à ce problème ouvert depuis des décennies.",
        "An “einstein tile” (from the German “ein Stein”, one stone) is a single shape that covers the plane without gaps or overlaps, but only aperiodically: none of its tilings repeats under a translation. In 2023 David Smith, Joseph Samuel Myers, Craig Kaplan and Chaim Goodman-Strauss presented the “hat”, which answers a problem open for decades."),
    ],
    sections: [
      { h: p("Paver et apériodique", "Tiling and aperiodic"), p: [
        p("Paver signifie couvrir le plan sans trous ni recouvrements. Apériodique signifie qu’aucun pavage admis ne possède une translation non nulle qui le laisse inchangé. Un dessin irrégulier ne suffit donc pas : c’est une propriété de tous les pavages possibles de la forme, et elle ne se vérifie pas sur un morceau fini.",
          "Tiling means covering the plane without gaps or overlaps. Aperiodic means that no admitted tiling has a nonzero translation leaving it unchanged. An irregular drawing is therefore not enough: this is a property of all possible tilings by the shape, and it cannot be checked on a finite patch.") ] },
      { h: p("Des jeux de pièces aux monotuiles", "From tile sets to monotiles"), p: [
        p("Avant 2023, on ne connaissait que des jeux d’au moins deux pièces qui forcent l’apériodicité, comme les pavages de Penrose. Le premier jeu de ce genre date de 1966 et est dû à Robert Berger, avec un très grand nombre de pièces ; Roger Penrose en réduit ensuite le nombre à deux. La question d’une pièce unique reste ouverte, d’où le nom de pavé Einstein.",
          "Before 2023 only sets of at least two pieces forcing aperiodicity were known, such as the Penrose tilings. The first such set dates from 1966 and is due to Robert Berger, with a very large number of pieces; Roger Penrose later reduced the number to two. The question of a single piece remained open, hence the name einstein tile.") ] },
      { h: p("Le chapeau", "The hat"), p: [
        p("Le chapeau s’emploie avec ses copies retournées : dans le pavage, les couleurs distinguent les pièces retournées, mais c’est toujours la même forme. La même équipe a ensuite trouvé le « spectre », qui y parvient sans aucun retournement.",
          "The hat is used together with its flipped copies: in a tiling, colours mark the flipped pieces, but it is always the same shape. The same team then found the “spectre”, which manages without any flipping."),
        p("Le chapeau appartient à une famille continue de formes, réglée par deux longueurs a et b. La construction assemble des supertuiles (groupes de pièces, selon des incidences fixes) dont les coordonnées dépendent linéairement de a et b : on peut donc déformer le pavage sans changer ses voisinages, comme le montre le glissement du chevron à la comète, en passant par le chapeau et la tortue.",
          "The hat belongs to a continuous family of shapes governed by two lengths a and b. The construction assembles supertiles (groups of pieces, with fixed incidences) whose coordinates depend linearly on a and b, so the tiling can be deformed without changing its neighbours, as the slide from chevron to comet shows, passing through the hat and the turtle.") ] },
      { h: p("Le théorème", "The theorem"), p: [
        p("L’article démontre l’apériodicité pour les valeurs a et b strictement positives et différentes. Les valeurs a = 0, b = 0 et a = b sont des exceptions : les extrémités de la famille et le cas équilatéral admettent des pavages périodiques. Une image finie illustre le théorème sans le démontrer.",
          "The paper proves aperiodicity for a and b strictly positive and different. The values a = 0, b = 0 and a = b are exceptions: the endpoints of the family and the equilateral case admit periodic tilings. A finite picture illustrates the theorem without proving it."),
        p("La découverte éclaire la façon dont une contrainte locale sur une seule forme peut forcer une structure globale non périodique.",
          "The discovery illuminates how a local constraint on a single shape can force a global nonperiodic structure.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },

  "four-colours": {
    facts: [
      [p("Posé par", "Posed by"), p("Francis Guthrie, 1852", "Francis Guthrie, 1852")],
      [p("Domaine", "Field"), p("Théorie des graphes, cartes planaires", "Graph theory, planar maps")],
      [p("Démonstration", "Proof"), p("Appel et Haken, 1976 (assistée par ordinateur)", "Appel and Haken, 1976 (computer-assisted)")],
      [p("Version simplifiée", "Simplified version"), p("1997 : 633 configurations", "1997: 633 configurations")],
      [p("Statut", "Status"), p("Théorème", "Theorem")],
    ],
    lead: [
      p("Le théorème des quatre couleurs affirme que les pays d’une carte plane peuvent toujours être coloriés avec quatre couleurs au plus, de sorte que deux pays voisins, qui partagent un segment de frontière, reçoivent des couleurs différentes. Un simple contact en un point ne compte pas comme voisinage. Énoncé en 1852, il est démontré en 1976 par Kenneth Appel et Wolfgang Haken, en l’une des premières grandes démonstrations assistées par ordinateur.",
        "The four-colour theorem states that the countries of a plane map can always be coloured with at most four colours so that two neighbouring countries, which share a segment of border, receive different colours. Contact at a single point does not count as adjacency. Stated in 1852, it was proved in 1976 by Kenneth Appel and Wolfgang Haken, in one of the first major computer-assisted proofs."),
    ],
    sections: [
      { h: p("L’énoncé et ses origines", "The statement and its origins"), p: [
        p("Francis Guthrie remarque en 1852 que quatre couleurs semblent suffire pour les comtés d’Angleterre. Une « preuve » de Kempe en 1879 contient une erreur, trouvée par Heawood en 1890. Heawood en tire tout de même un résultat plus faible mais correct : cinq couleurs suffisent toujours.",
          "Francis Guthrie noticed in 1852 that four colours seemed to suffice for the counties of England. A “proof” by Kempe in 1879 contained an error, found by Heawood in 1890. Heawood nevertheless drew from it a weaker but correct result: five colours always suffice.") ] },
      { h: p("Colorier un graphe", "Colouring a graph"), p: [
        p("On ne colorie pas vraiment des formes, mais des relations : un pays est un point, et deux voisins sont reliés par un trait. Le problème devient celui de colorier les sommets d’un graphe planaire. Un cycle impair force trois couleurs, car deux couleurs alterneraient puis se heurteraient ; un sommet relié à tout un cycle impair en force quatre.",
          "It is not really shapes that are coloured but relations: a country is a point, and two neighbours are joined by a line. The problem becomes that of colouring the vertices of a planar graph. An odd cycle forces three colours, since two colours would alternate and then clash; a vertex joined to a whole odd cycle forces four."),
        p("La carte « roue », avec un pays central qui touche un anneau de 5 pays, montre ainsi que quatre couleurs sont nécessaires : l’anneau en demande trois et le centre une quatrième. Une carte « pizza » où huit parts se touchent au centre n’en demande que deux ou trois, car le point commun ne compte pas comme voisinage.",
          "The “wheel” map, with a central country touching a ring of 5 countries, thus shows that four colours are necessary: the ring needs three and the centre a fourth. A “pizza” map where eight slices meet at the centre needs only two or three, since the common point does not count as adjacency.") ] },
      { h: p("La démonstration", "The proof"), p: [
        p("Que quatre couleurs soient nécessaires se démontre avec une seule carte, la roue. Qu’elles suffisent pour toutes les cartes ne peut pas se vérifier carte par carte : il en existe une infinité. La preuve montre que toute carte contient l’une des configurations « réductibles » d’une liste finie, chacune vérifiée par ordinateur : plus de mille en 1976, 633 dans la version de 1997.",
          "That four colours are necessary is proved with a single map, the wheel. That they suffice for every map cannot be checked map by map: there are infinitely many. The proof shows that every map contains one of the “reducible” configurations of a finite list, each checked by computer: more than a thousand in 1976, 633 in the 1997 version."),
        p("La démonstration a suscité des discussions sur la manière de vérifier un argument dont une partie du travail est effectuée par une machine. En 2005, Georges Gonthier en donne une vérification formelle avec l’assistant de preuve Coq.",
          "The proof prompted discussion about how to verify an argument when a machine performs part of the work. In 2005 Georges Gonthier gave a formal verification of it with the Coq proof assistant.") ] },
      { h: p("Prolongements et applications", "Developments and applications"), p: [
        p("Colorier un graphe, c’est séparer ce qui ne doit pas se rencontrer : examens qui ont des élèves communs, fréquences de relais voisins, registres d’un programme. Pour un graphe quelconque, trouver le plus petit nombre de couleurs est un problème difficile ; la planéité donne la borne 4.",
          "Colouring a graph separates what must not meet: exams with students in common, frequencies of nearby relays, registers of a program. For an arbitrary graph, finding the least number of colours is a hard problem; planarity gives the bound 4."),
        p("Sur d’autres surfaces, le nombre de couleurs nécessaire change : sur un tore (la surface d’une bouée), sept couleurs sont parfois nécessaires et toujours suffisantes.",
          "On other surfaces the number of colours needed changes: on a torus (the surface of a ring-shaped buoy), seven colours are sometimes necessary and always sufficient.") ] },
    ],
  },

  "square-packing": {
    facts: [
      [p("Étudié par", "Studied by"), p("Paul Erdős et Ronald Graham, 1975", "Paul Erdős and Ronald Graham, 1975")],
      [p("Domaine", "Field"), p("Géométrie combinatoire, empilements", "Combinatorial geometry, packings")],
      [p("Question", "Question"), p("Plus petit carré contenant n carrés unité", "Smallest square holding n unit squares")],
      [p("Valeurs connues", "Known values"), p("5 carrés : 2 + 1/√2 ≈ 2,707", "5 squares: 2 + 1/√2 ≈ 2.707")],
      [p("Statut", "Status"), p("Ouvert pour la plupart des n", "Open for most n")],
    ],
    lead: [
      p("Le problème des carrés dans un carré demande, pour un entier n, le côté du plus petit carré qui contient n carrés de côté 1 sans chevauchement. Quand n est un carré parfait, une grille répond à la question. Pour presque tous les autres n, la meilleure disposition connue incline certains carrés, et l’on ne sait pas démontrer qu’elle est optimale.",
        "The problem of squares in a square asks, for an integer n, for the side of the smallest square that holds n squares of side 1 without overlap. When n is a perfect square a grid answers the question. For almost every other n the best known arrangement tilts some squares, and it cannot be proved optimal."),
    ],
    sections: [
      { h: p("Une borne évidente", "An obvious bound"), p: [
        p("L’aire du grand carré doit dépasser la somme des aires des petits carrés, soit n, donc son côté est au moins √n. Cette borne est atteinte par la grille quand n = k², pour laquelle elle est donc optimale. Pour les autres valeurs de n, elle n’est pas atteinte : il faut perdre de la place.",
          "The area of the big square must be at least the total area n of the small squares, so its side is at least √n. This bound is reached by the grid when n = k², for which the grid is therefore optimal. For other values of n it is not reached: some room must be wasted.") ] },
      { h: p("Quand tourner un carré fait gagner de la place", "When turning a square saves room"), p: [
        p("Quatre carrés tiennent dans un carré de côté 2. Pour cinq carrés, aligner une grille obligerait à prendre un côté de 3, mais en plaçant quatre carrés aux coins et un cinquième incliné à 45 degrés au centre, le côté tombe à 2 + 1/√2 ≈ 2,707. C’est Göbel qui, en 1979, établit que ce côté est optimal : un carré de côté 2,7 ne peut donc contenir que 4 carrés unité.",
          "Four squares fit in a square of side 2. For five squares an aligned grid would force a side of 3, but placing four squares at the corners and a fifth tilted by 45 degrees in the centre brings the side down to 2 + 1/√2 ≈ 2.707. Göbel established in 1979 that this side is optimal: a square of side 2.7 can therefore hold only 4 unit squares."),
        p("Pour 10 carrés, une disposition de même esprit tient dans un carré de côté 3 + 1/√2 ≈ 3,707. Pour 11, le record connu est d’environ 3,877 et n’est pas démontré optimal.",
          "For 10 squares an arrangement in the same spirit fits in a square of side 3 + 1/√2 ≈ 3.707. For 11 the best known record is about 3.877 and is not proved optimal.") ] },
      { h: p("Histoire", "History"), p: [
        p("Le problème est étudié par Paul Erdős et Ronald Graham en 1975. Ils se demandent combien de place on perd quand le grand carré n’a pas un côté entier, et montrent que l’espace perdu peut être rendu petit comparé à l’aire totale quand le côté est grand.",
          "The problem was studied by Paul Erdős and Ronald Graham in 1975. They asked how much room is wasted when the big square does not have a whole-number side, and showed that the wasted space can be made small compared with the total area when the side is large.") ] },
      { h: p("État des recherches", "State of research"), p: [
        p("Depuis, chercheurs et amateurs améliorent les records un par un. Erich Friedman tient à jour la liste des meilleures dispositions connues et en a donné un état dans l’Electronic Journal of Combinatorics. Pour chaque valeur de n, démontrer qu’une disposition est optimale demande un argument qui lui est propre, et l’on ne connaît le côté optimal que dans quelques cas.",
          "Since then researchers and amateurs have improved the records one by one. Erich Friedman keeps the list of best known arrangements up to date and surveyed them in the Electronic Journal of Combinatorics. For each value of n, proving that an arrangement is optimal needs its own argument, and the optimal side is known only in a few cases.") ] },
    ],
  },

  "inscribed-square": {
    facts: [
      [p("Posé par", "Posed by"), p("Otto Toeplitz, 1911", "Otto Toeplitz, 1911")],
      [p("Domaine", "Field"), p("Topologie et géométrie du plan", "Plane topology and geometry")],
      [p("Énoncé", "Statement"), p("Toute courbe fermée simple contient quatre points formant un carré", "Every simple closed curve contains four points forming a square")],
      [p("Résolu pour", "Solved for"), p("Courbes convexes (1913), lisses (1929)", "Convex curves (1913), smooth curves (1929)")],
      [p("Statut", "Status"), p("Ouvert en général", "Open in general")],
    ],
    lead: [
      p("Le problème du carré inscrit, ou conjecture de Toeplitz, affirme que toute courbe fermée du plan qui ne se croise pas contient quatre points formant les sommets d’un carré. Il est démontré pour de grandes familles de courbes, mais reste ouvert pour une courbe continue quelconque, qui peut zigzaguer à toutes les échelles.",
        "The inscribed square problem, or Toeplitz conjecture, states that every closed plane curve that does not cross itself contains four points forming the vertices of a square. It is proved for large families of curves but remains open for an arbitrary continuous curve, which may zigzag at every scale."),
    ],
    sections: [
      { h: p("Énoncé et exemples", "Statement and examples"), p: [
        p("Un cercle contient une infinité de carrés inscrits, et un carré en contient lui-même une infinité. Un triangle donne un compte exact : un carré inscrit a deux sommets sur un même côté du triangle, donc un côté posé sur un côté du triangle. Sur une base a de hauteur h, le carré de côté s = ah/(a + h) tient (par des triangles semblables) si le pied de la hauteur tombe dans la base.",
          "A circle contains infinitely many inscribed squares, and a square itself contains infinitely many. A triangle allows an exact count: an inscribed square has two corners on the same side of the triangle, hence one side lying on a side of the triangle. On a base a of height h, the square of side s = ah/(a + h) fits (by similar triangles) if the foot of the height falls inside the base."),
        p("Un triangle dont les trois angles sont aigus contient donc 3 carrés inscrits, un pour chaque côté ; un triangle obtusangle n’en contient qu’un, sur son plus grand côté.",
          "A triangle with three acute angles therefore contains 3 inscribed squares, one for each side; an obtuse triangle contains only one, on its longest side.") ] },
      { h: p("Histoire des résultats", "History of the results"), p: [
        p("Otto Toeplitz pose la question en 1911. Arnold Emch la résout pour les courbes convexes en 1913, Lev Schnirelmann pour les courbes lisses en 1929. Pour une courbe continue quelconque, le problème est toujours ouvert. Des cas plus généraux ont été traités par la suite, sans qu’une démonstration complète soit connue.",
          "Otto Toeplitz asked the question in 1911. Arnold Emch solved it for convex curves in 1913, Lev Schnirelmann for smooth curves in 1929. For an arbitrary continuous curve the problem is still open. More general cases have since been treated, without a complete proof being known.") ] },
      { h: p("Les rectangles inscrits", "Inscribed rectangles"), p: [
        p("En 2020, Joshua Greene et Andrew Lobb montrent que toute courbe lisse contient des rectangles inscrits de toutes les formes : pour tout rapport de côtés donné, il y a un rectangle de ce rapport dont les quatre sommets sont sur la courbe. Le carré est le cas particulier du rapport 1, que ce résultat règle pour les courbes lisses.",
          "In 2020 Joshua Greene and Andrew Lobb showed that every smooth curve contains inscribed rectangles of every shape: for any given ratio of sides, there is a rectangle of that ratio with all four vertices on the curve. The square is the special case of ratio 1, which this result settles for smooth curves."),
        p("Le rapport 2, par exemple, correspond à des rectangles deux fois plus longs que larges.",
          "The ratio 2, for instance, corresponds to rectangles twice as long as they are wide.") ] },
      { h: p("Pourquoi le problème résiste", "Why the problem resists"), p: [
        p("Pour une courbe très tordue, les méthodes qui s’appuient sur la régularité de la courbe ne s’appliquent plus : une courbe seulement continue peut avoir des oscillations à toutes les échelles. Le problème est facile à énoncer, à comprendre sur un dessin, et pourtant sa forme générale résiste depuis plus d’un siècle.",
          "For a very twisted curve the methods relying on the regularity of the curve no longer apply: a merely continuous curve can oscillate at every scale. The problem is easy to state and to follow on a drawing, yet its general form has resisted for more than a century.") ] },
    ],
  },

  "opaque-square": {
    facts: [
      [p("Introduit par", "Introduced by"), p("Stefan Mazurkiewicz, 1916", "Stefan Mazurkiewicz, 1916")],
      [p("Longueur minimale posée par", "Least length asked by"), p("Frederick Bagemihl, 1959", "Frederick Bagemihl, 1959")],
      [p("Meilleure barrière connue", "Best known barrier"), p("√2 + √6/2 ≈ 2,639", "√2 + √6/2 ≈ 2.639")],
      [p("Minorant", "Lower bound"), p("2 (1964) ; 2,00002 (2019)", "2 (1964); 2.00002 (2019)")],
      [p("Statut", "Status"), p("Ouvert", "Open")],
    ],
    lead: [
      p("Une barrière opaque d’un carré est un ensemble de segments et de courbes tel qu’aucune droite ne traverse le carré sans en rencontrer au moins un point : vue de l’extérieur, personne ne peut voir à travers le carré. Le problème du carré opaque demande la plus petite longueur possible d’une telle barrière pour un carré de côté 1. Il est toujours ouvert.",
        "An opaque barrier of a square is a set of segments and curves such that no line crosses the square without meeting at least one point of it: seen from outside, nobody can see through the square. The opaque square problem asks for the least possible length of such a barrier for a square of side 1. It is still open."),
    ],
    sections: [
      { h: p("Les premières barrières", "The first barriers"), p: [
        p("Trois côtés du carré suffisent : une droite qui traverse le carré coupe son bord en deux points, et au plus un est sur le côté manquant. La longueur est alors 3. Deux côtés opposés ne suffisent pas, car les droites parallèles à ces côtés passent entre eux. Deux côtés voisins non plus : une droite qui coupe les deux autres côtés près du coin opposé passe sans les toucher.",
          "Three sides of the square are enough: a line crossing the square meets its boundary in two points, and at most one of them is on the missing side. The length is then 3. Two opposite sides are not enough, as the lines parallel to them pass between them. Two neighbouring sides do not work either: a line cutting the other two sides near the opposite corner passes without touching them."),
        p("Les deux diagonales forment aussi une barrière, de longueur 2√2 ≈ 2,83. Mieux encore, l’arbre de Steiner, le réseau le plus court reliant les quatre coins, mesure 1 + √3 ≈ 2,73 et est opaque, parce qu’il relie les quatre coins.",
          "The two diagonals also form a barrier, of length 2√2 ≈ 2.83. Better still, the Steiner tree, the shortest network joining the four corners, has length 1 + √3 ≈ 2.73 and is opaque, because it connects all four corners.") ] },
      { h: p("Histoire", "History"), p: [
        p("Stefan Mazurkiewicz introduit les ensembles opaques en 1916 ; Frederick Bagemihl pose en 1959 la question de leur longueur minimale. Pour le carré, la meilleure barrière connue mesure √2 + √6/2 ≈ 2,639. Elle n’est pas d’un seul tenant : un morceau détaché peut aider, car il bloque des droites que le reste laisse passer.",
          "Stefan Mazurkiewicz introduced opaque sets in 1916; Frederick Bagemihl asked for their least length in 1959. For the square, the best known barrier has length √2 + √6/2 ≈ 2.639. It is not in one piece: a detached piece can help, since it blocks lines that the rest lets through.") ] },
      { h: p("Un minorant par les ombres", "A lower bound from shadows"), p: [
        p("Dans chaque direction, l’ombre des segments de la barrière doit recouvrir l’ombre du carré : la somme de leurs projections dépasse la largeur du carré dans cette direction. On fait la moyenne sur toutes les directions : un segment de longueur ℓ a une projection moyenne 2ℓ/π, et le carré une largeur moyenne égale à son périmètre divisé par π, soit 4/π (formule de Cauchy).",
          "In every direction the shadow of the barrier’s segments must cover the shadow of the square: the sum of their projections exceeds the width of the square in that direction. Averaging over all directions, a segment of length ℓ has mean projection 2ℓ/π, and the square has a mean width equal to its perimeter divided by π, that is 4/π (Cauchy’s formula)."),
        p("On obtient 2L/π ≥ 4/π, c’est-à-dire L ≥ 2 : toute barrière opaque du carré de côté 1 mesure au moins 2.",
          "This gives 2L/π ≥ 4/π, that is L ≥ 2: every opaque barrier of the unit square has length at least 2.") ] },
      { h: p("Résultats et questions ouvertes", "Results and open questions"), p: [
        p("Le minorant 2 date de 1964 ; il n’a été amélioré qu’en 2019, à 2,00002. Entre ce minorant et la barrière de 2,639, l’écart reste grand et on ne sait pas quelle est la vraie réponse. Le problème est étudié notamment par Adrian Dumitrescu et Minghui Jiang dans « The opaque square ».",
          "The lower bound 2 dates from 1964; it was only improved in 2019, to 2.00002. Between this lower bound and the barrier of 2.639 the gap remains large and the true answer is not known. The problem is studied notably by Adrian Dumitrescu and Minghui Jiang in “The opaque square”.") ] },
    ],
  },

  equidecomposition: {
    facts: [
      [p("Théorème", "Theorem"), p("Wallace, Bolyai, Gerwien", "Wallace, Bolyai, Gerwien")],
      [p("Dates", "Dates"), p("1807 (énoncé), 1832 et 1833 (preuves)", "1807 (statement), 1832 and 1833 (proofs)")],
      [p("Domaine", "Field"), p("Géométrie, aires et volumes", "Geometry, areas and volumes")],
      [p("Résultat", "Key result"), p("Deux polygones de même aire sont équidécomposables", "Two polygons of equal area are equidecomposable")],
      [p("Dimension 3", "Dimension 3"), p("Faux : Dehn, 1900", "False: Dehn, 1900")],
    ],
    lead: [
      p("Deux figures sont équidécomposables si l’on peut découper la première en un nombre fini de morceaux qui, déplacés par des translations et des rotations, se recollent exactement en la seconde. Le théorème de Wallace, Bolyai et Gerwien affirme que deux polygones du plan sont équidécomposables si et seulement s’ils ont la même aire.",
        "Two figures are equidecomposable if the first can be cut into finitely many pieces that, moved by translations and rotations, reglue exactly into the second. The Wallace-Bolyai-Gerwien theorem states that two plane polygons are equidecomposable if and only if they have the same area."),
    ],
    sections: [
      { h: p("Le théorème et son histoire", "The theorem and its history"), p: [
        p("William Wallace énonce le résultat en 1807 ; Farkas Bolyai en 1832 et Paul Gerwien en 1833 en donnent chacun une démonstration, d’où le nom du théorème. La condition est nécessaire, car les déplacements conservent l’aire. La démonstration montre qu’elle est aussi suffisante.",
          "William Wallace stated the result in 1807; Farkas Bolyai in 1832 and Paul Gerwien in 1833 each gave a proof, hence the name of the theorem. The condition is necessary, since moves preserve area. The proof shows that it is also sufficient.") ] },
      { h: p("La démonstration", "The proof"), p: [
        p("On découpe chaque polygone en triangles. Chaque triangle se découpe en un rectangle : on coupe à mi-hauteur et on fait pivoter les deux coins, en trois morceaux. Chaque rectangle se découpe ensuite en un rectangle de largeur 1 de même aire, par des cisaillements en bandes.",
          "Each polygon is cut into triangles. Each triangle can be cut into a rectangle: cut at half height and swing the two corners round, in three pieces. Each rectangle can then be cut into a rectangle of width 1 with the same area, by shears in strips."),
        p("On empile ces rectangles : les deux polygones de même aire donnent le même grand rectangle de largeur 1. Il suffit alors de suivre le chemin du premier polygone vers ce rectangle, puis celui du second à l’envers.",
          "These rectangles are stacked: two polygons of the same area give the same big rectangle of width 1. One then follows the first polygon’s path to that rectangle, and the second one’s path backwards.") ] },
      { h: p("Casse-tête de découpage", "Dissection puzzles"), p: [
        p("Le théorème garantit l’existence d’un découpage, mais pas qu’il utilise peu de morceaux. Trouver des découpages avec très peu de pièces est une tradition de la récréation mathématique : en 1902, Henry Dudeney présente un découpage d’un triangle équilatéral en un carré en seulement quatre morceaux.",
          "The theorem guarantees that a dissection exists, not that it uses few pieces. Finding dissections with very few pieces is a tradition of recreational mathematics: in 1902 Henry Dudeney presented a dissection of an equilateral triangle into a square in only four pieces.") ] },
      { h: p("En dimension 3 : le troisième problème de Hilbert", "In dimension 3: Hilbert’s third problem"), p: [
        p("En 1900, David Hilbert demande si le même énoncé vaut pour les polyèdres : deux polyèdres de même volume sont-ils toujours équidécomposables ? C’est son troisième problème. Son élève Max Dehn répond par la négative la même année : un cube et un tétraèdre régulier de même volume ne sont pas équidécomposables.",
          "In 1900 David Hilbert asked whether the same statement holds for polyhedra: are two polyhedra of equal volume always equidecomposable? This is his third problem. His student Max Dehn answered no that same year: a cube and a regular tetrahedron of equal volume are not equidecomposable."),
        p("Dehn introduit pour cela une quantité attachée à un polyèdre, qui combine les longueurs de ses arêtes et ses angles dièdres, et qui reste inchangée par découpage et recollement. Elle est nulle pour le cube et non nulle pour le tétraèdre régulier. Ce qui ne se transporte pas du plan à l’espace est l’étape qui transforme un triangle en rectangle : elle n’a pas d’analogue pour les tétraèdres.",
          "For this Dehn introduces a quantity attached to a polyhedron, combining the lengths of its edges and its dihedral angles, which stays unchanged under cutting and regluing. It is zero for the cube and nonzero for the regular tetrahedron. What does not carry over from the plane to space is the step turning a triangle into a rectangle: it has no analogue for tetrahedra.") ] },
      { h: p("Prolongements", "Later developments"), p: [
        p("Tarski pose en 1925 la question de la quadrature du cercle par découpage : un disque et un carré de même aire sont-ils équidécomposables ? Miklós Laczkovich répond oui en 1990, avec environ 10^50 morceaux, obtenus par des translations seules ; la démonstration n’est pas constructive.",
          "In 1925 Tarski asked the question of squaring the circle by dissection: are a disc and a square of the same area equidecomposable? Miklós Laczkovich answered yes in 1990, with about 10^50 pieces, moved by translations alone; the proof is not constructive."),
        p("Des morceaux très irréguliers, impossibles à dessiner, interviennent aussi dans le paradoxe de Banach et Tarski, qui découpe une boule de l’espace en morceaux recollés en deux boules de même taille.",
          "Very irregular pieces, impossible to draw, also appear in the Banach-Tarski paradox, which cuts a ball of space into pieces reglued into two balls of the same size.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },
};
