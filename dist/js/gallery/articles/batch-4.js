// Batch 4 of the gallery articles (shape and rules: ../article.js): basins, apollonian, escape-3d, collisions,
// napkin-ring, hundred-boxes, morley, secretary-gallery. Encyclopedia voice: third person, present tense.
const p = (fr, en) => [fr, en];
export const BATCH4 = {
  basins: {
    facts: [
      [p("Posé par", "Posed by"), p("Arthur Cayley (Newton dans le plan complexe, 1879) ; Fatou et Julia (itération, vers 1918)", "Arthur Cayley (Newton’s method in the complex plane, 1879); Fatou and Julia (iteration, around 1918)")],
      [p("Domaine", "Field"), p("Dynamique complexe, fractales", "Complex dynamics, fractals")],
      [p("Objets", "Objects"), p("Multibrot z ↦ zᵈ + c ; bassins de la méthode de Newton", "Multibrot z ↦ zᵈ + c; basins of Newton’s method")],
      [p("Fait clé", "Key fact"), p("Le multibrot de degré d a d − 1 copies identiques autour de 0", "The multibrot of degree d has d − 1 identical copies around 0")],
      [p("Statut", "Status"), p("Théorie établie ; frontières visibles par ordinateur depuis les années 1980", "Established theory; boundaries seen by computer since the 1980s")],
    ],
    lead: [
      p("Itérer, c’est répéter la même opération sur un nombre. Dans le plan complexe, deux itérations célèbres donnent des images dont les frontières sont d’une complexité infinie : la famille z ↦ zᵈ + c, dite multibrot (le cas d = 2 est l’ensemble de Mandelbrot), et la méthode de Newton appliquée à un polynôme, dont les bassins d’attraction se partagent le plan.",
        "To iterate is to repeat the same operation on a number. In the complex plane two famous iterations give pictures whose boundaries are infinitely complicated: the family z ↦ zᵈ + c, called the multibrot (the case d = 2 is the Mandelbrot set), and Newton’s method applied to a polynomial, whose basins of attraction share out the plane."),
    ],
    sections: [
      { h: p("Colorier selon le destin d’une suite", "Colouring by the fate of a sequence"), p: [
        p("On choisit un point du plan, on le prend comme point de départ, on itère, et on colorie le point selon ce que devient la suite : elle s’échappe vers l’infini (la couleur donne alors la vitesse de fuite), elle reste bornée, ou elle tend vers un point précis. Pour le multibrot, on fixe c et on part de 0 ; la couleur de c dit si la suite z ↦ zᵈ + c, issue de 0, s’échappe.",
          "A point of the plane is chosen as a starting value and iterated, and it is coloured according to what the sequence does: it escapes to infinity (the colour then gives the speed of escape), it stays bounded, or it tends to a definite point. For the multibrot, c is fixed and the sequence starts at 0; the colour of c tells whether the sequence z ↦ zᵈ + c, started from 0, escapes."),
      ] },
      { h: p("La symétrie du multibrot", "Symmetry of the multibrot"), p: [
        p("Pour z ↦ zᵈ + c, la figure possède d − 1 copies identiques tournées autour de 0 : pour d = 6, cinq copies. La raison est simple. Si ω est une racine (d − 1)-ième de l’unité, c’est-à-dire ωᵈ⁻¹ = 1, remplacer c par ωc multiplie toute la suite par ω, sans changer le module de ses termes. La suite s’échappe donc pour ωc exactement quand elle s’échappe pour c.",
          "For z ↦ zᵈ + c the figure has d − 1 identical copies turned about 0: for d = 6, five copies. The reason is simple. If ω is a (d − 1)-th root of unity, that is ωᵈ⁻¹ = 1, replacing c by ωc multiplies the whole sequence by ω without changing the modulus of its terms. The sequence therefore escapes for ωc exactly when it escapes for c."),
      ] },
      { h: p("Newton et ses bassins", "Newton’s method and its basins"), p: [
        p("La méthode de Newton résout f(z) = 0 en itérant N(z) = z − f(z)/f′(z). Pour z² − 1, deux racines, la frontière entre les deux bassins est la droite des imaginaires purs, Re z = 0. Dès trois racines, par exemple z³ − 1, la question « vers quelle racine ? » devient si compliquée qu’Arthur Cayley, qui la pose en 1879, bute sur le cas de trois racines.",
          "Newton’s method solves f(z) = 0 by iterating N(z) = z − f(z)/f′(z). For z² − 1, with two roots, the boundary between the two basins is the imaginary axis, Re z = 0. From three roots on, for instance z³ − 1, the question “towards which root?” becomes so intricate that Arthur Cayley, who raised it in 1879, got stuck on the case of three roots."),
        p("La méthode peut aussi ne jamais atteindre de racine. Pour z³ − 2z + 2, on a N(0) = 1 et N(1) = 0, et la dérivée de N est nulle en 0 : les points proches de 0 tombent dans ce cycle de longueur 2 et n’atteignent jamais une racine, sur toute une région du plan.",
          "The method may also never reach a root. For z³ − 2z + 2, N(0) = 1 and N(1) = 0, and the derivative of N vanishes at 0: points near 0 fall into this cycle of length 2 and never reach a root, over a whole region of the plane."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Pierre Fatou et Gaston Julia étudient vers 1918 l’itération des fractions rationnelles et décrivent, sans pouvoir les dessiner, les ensembles qui portent aujourd’hui leurs noms. Leurs frontières, que les ordinateurs révèlent dans les années 1980, sont des courbes qui se répètent à toutes les échelles. Benoit Mandelbrot en produit une des premières images de l’ensemble qui porte son nom en 1980.",
          "Pierre Fatou and Gaston Julia studied the iteration of rational maps around 1918 and described, without being able to draw them, the sets that now carry their names. Their boundaries, which computers reveal in the 1980s, are curves that repeat at every scale. Benoit Mandelbrot produced one of the first pictures of the set that bears his name in 1980."),
      ] },
      { h: p("Prolongements", "Later developments"), p: [
        p("Pour z³ − 1, les trois bassins ont la même frontière : chaque point de la frontière d’un bassin touche aussi les deux autres (propriété dite de Wada). Les images de bassins de Newton servent aujourd’hui d’exemples standard de fractales issues d’un algorithme de calcul, et la même construction s’applique à d’autres équations et à d’autres méthodes d’approximation.",
          "For z³ − 1 the three basins share a single boundary: every boundary point of one basin also touches the other two (the Wada property). Pictures of Newton basins are now standard examples of fractals born from a numerical algorithm, and the same construction applies to other equations and other approximation methods."),
      ] },
    ],
  },

  apollonian: {
    facts: [
      [p("Origine", "Origin"), p("Apollonius de Perge, IIIe siècle av. J.-C.", "Apollonius of Perga, 3rd century BC")],
      [p("Relation des courbures", "Curvature relation"), p("Descartes, 1643 ; redécouverte par Soddy, 1936", "Descartes, 1643; rediscovered by Soddy, 1936")],
      [p("Domaine", "Field"), p("Géométrie, fractales, théorie des nombres", "Geometry, fractals, number theory")],
      [p("Fait clé", "Key fact"), p("Courbures entières au départ, entières partout", "Whole curvatures at the start, whole curvatures everywhere")],
      [p("Statut", "Status"), p("Théorème démontré", "Proved theorem")],
    ],
    lead: [
      p("La baderne d’Apollonius est la figure obtenue en remplissant un espace entre trois cercles qui se touchent par le cercle qui touche les trois, puis en recommençant dans chaque nouvel espace, indéfiniment. Elle porte le nom d’Apollonius de Perge, qui cherchait les cercles tangents à trois cercles donnés.",
        "The Apollonian gasket is the figure obtained by filling a gap between three mutually touching circles with the circle that touches all three, then repeating in every new gap, indefinitely. It is named after Apollonius of Perga, who looked for the circles tangent to three given circles."),
    ],
    sections: [
      { h: p("La construction", "The construction"), p: [
        p("On part de trois cercles qui se touchent deux à deux, dans un grand cercle qui les contient tous. Entre eux apparaissent des espaces curvilignes à trois côtés ; dans chacun on place le cercle tangent aux trois côtés, ce qui crée trois nouveaux espaces, et ainsi de suite. À la limite, les cercles couvrent tout le disque sauf un ensemble de mesure nulle, de dimension fractale voisine de 1,31.",
          "One starts with three circles touching in pairs inside a large circle containing them all. Between them appear curved gaps with three sides; in each one the circle tangent to the three sides is placed, which creates three new gaps, and so on. In the limit the circles cover the whole disc except for a set of zero area, whose fractal dimension is close to 1.31."),
      ] },
      { h: p("La relation de Descartes", "Descartes’ relation"), p: [
        p("La courbure d’un cercle est l’inverse de son rayon ; on la compte négative pour le cercle qui en contient d’autres. Pour quatre cercles qui se touchent deux à deux, les courbures vérifient (k₁ + k₂ + k₃ + k₄)² = 2(k₁² + k₂² + k₃² + k₄²). Descartes énonce cette relation dans une lettre à la princesse Élisabeth de Bohême en 1643.",
          "The curvature of a circle is one over its radius; it is counted negative for the circle that contains the others. For four circles touching in pairs, the curvatures satisfy (k₁ + k₂ + k₃ + k₄)² = 2(k₁² + k₂² + k₃² + k₄²). Descartes states this relation in a letter to Princess Elisabeth of Bohemia in 1643."),
        p("Pour trois cercles fixés, l’équation en k₄ est du second degré ; ses deux solutions ont pour somme 2(k₁ + k₂ + k₃), ce sont les deux cercles tangents aux trois autres, de part et d’autre. Le nouveau cercle a donc la courbure 2(k₁ + k₂ + k₃) − k₄.",
          "For three fixed circles the equation in k₄ is quadratic; its two solutions add up to 2(k₁ + k₂ + k₃), and they are the two circles tangent to the three, one on each side. The new circle therefore has curvature 2(k₁ + k₂ + k₃) − k₄."),
      ] },
      { h: p("Des entiers partout", "Whole numbers throughout"), p: [
        p("Si les quatre premières courbures sont entières, toutes celles de la baderne le sont, puisque chaque nouvelle courbure est une combinaison à coefficients entiers des précédentes. Avec le cercle extérieur de courbure −1 et les trois cercles de courbures 2, 2 et 3, on trouve ainsi 3 (le cercle symétrique), 6, puis 15 pour le cercle placé entre les cercles 2, 2 et 3, et la suite n’en sort jamais.",
          "If the first four curvatures are whole numbers, so are all those of the gasket, since each new curvature is an integer combination of earlier ones. With the outer circle of curvature −1 and the three circles of curvatures 2, 2 and 3, one finds 3 (the mirror circle), 6, then 15 for the circle placed between the circles 2, 2 and 3, and the sequence never leaves the integers."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Apollonius de Perge cherche au IIIe siècle av. J.-C. les cercles tangents à trois objets donnés, ce qui, pour trois cercles, laisse jusqu’à huit solutions. Frederick Soddy redécouvre la relation de Descartes en 1936 et la publie sous forme de poème dans Nature, en l’étendant aux sphères.",
          "In the 3rd century BC Apollonius of Perga looked for the circles tangent to three given objects, which for three circles leaves up to eight solutions. Frederick Soddy rediscovered Descartes’ relation in 1936 and published it as a poem in Nature, extending it to spheres."),
      ] },
      { h: p("Prolongements", "Later developments"), p: [
        p("La relation se généralise à toute dimension (travaux de Lagarias, Mallows et Wilks, 2002). Les baderne à courbures entières, étudiées depuis le début des années 2000, ont ouvert un chapitre de théorie des nombres : quels entiers apparaissent comme courbures, et avec quelle fréquence.",
          "The relation extends to every dimension (work of Lagarias, Mallows and Wilks, 2002). Gaskets with whole curvatures, studied since the early 2000s, have opened a chapter of number theory: which integers occur as curvatures, and how often."),
      ] },
    ],
  },

  "escape-3d": {
    facts: [
      [p("Quaternions", "Quaternions"), p("Hamilton, 1843 ; Frobenius, 1878 (pas d’autre choix)", "Hamilton, 1843; Frobenius, 1878 (no other choice)")],
      [p("Mandelbulb", "Mandelbulb"), p("Daniel White et Paul Nylander, 2009", "Daniel White and Paul Nylander, 2009")],
      [p("Mandelbox", "Mandelbox"), p("Tom Lowe, 2010", "Tom Lowe, 2010")],
      [p("Domaine", "Field"), p("Fractales, dynamique, synthèse d’images", "Fractals, dynamics, image synthesis")],
      [p("Statut", "Status"), p("Formules choisies, non des théorèmes", "Chosen formulas, not theorems")],
    ],
    lead: [
      p("Peut-on faire « l’ensemble de Mandelbrot en trois dimensions » ? Il n’existe pas de réponse unique, et aucune n’est canonique. Trois constructions se disputent le titre : la Mandelbulb, qui imite la multiplication complexe par une formule choisie, la Mandelbox, une suite de replis de l’espace, et la tranche en trois dimensions d’un ensemble de Julia de dimension 4.",
        "Can one make “the Mandelbrot set in three dimensions”? There is no single answer, and none is canonical. Three constructions compete for the title: the Mandelbulb, which imitates complex multiplication by a chosen formula, the Mandelbox, a sequence of folds of space, and the three-dimensional slice of a Julia set of dimension 4."),
    ],
    sections: [
      { h: p("Pourquoi pas des nombres à trois dimensions", "Why not three-dimensional numbers"), p: [
        p("L’ensemble de Mandelbrot repose sur les nombres complexes, où l’on multiplie et divise. William Rowan Hamilton cherche pendant des années des nombres à trois dimensions du même genre et trouve en 1843 les quaternions, de dimension 4. Frobenius prouve en 1878 que les seules algèbres réelles associatives où l’on peut diviser sont les réels, les complexes et les quaternions, de dimensions 1, 2 et 4 : il n’existe pas de « nombres de l’espace ».",
          "The Mandelbrot set rests on complex numbers, where one can multiply and divide. William Rowan Hamilton looked for years for three-dimensional numbers of the same kind and found in 1843 the quaternions, of dimension 4. Frobenius proved in 1878 that the only associative real algebras in which one can divide are the reals, the complex numbers and the quaternions, of dimensions 1, 2 and 4: there are no “numbers of space”."),
      ] },
      { h: p("La Mandelbulb", "The Mandelbulb"), p: [
        p("Daniel White et Paul Nylander proposent en 2009 de remplacer le carré complexe par une puissance n écrite en coordonnées sphériques : le rayon est élevé à la puissance n et les deux angles sont multipliés par n, puis on ajoute le point de départ. La figure obtenue présente n − 1 copies identiques autour de l’axe vertical : 8 copies pour n = 9. En effet, tourner le point de départ d’un angle α autour de l’axe ajoute α à l’angle φ, multiplié par n à chaque étape, et la figure revient sur elle-même quand (n − 1)α est un multiple de 2π.",
          "In 2009 Daniel White and Paul Nylander proposed replacing the complex square by a power n written in spherical coordinates: the radius is raised to the power n and both angles are multiplied by n, then the starting point is added. The resulting figure has n − 1 identical copies around the vertical axis: 8 copies for n = 9. Indeed, turning the starting point by an angle α about the axis adds α to the angle φ, multiplied by n at each step, and the figure comes back onto itself when (n − 1)α is a multiple of 2π."),
      ] },
      { h: p("La Mandelbox", "The Mandelbox"), p: [
        p("Tom Lowe propose en 2010 une autre voie : à chaque étape, on replie les coordonnées sur un cube, on retourne l’espace par rapport à une sphère, puis on agrandit selon une échelle choisie avant d’ajouter le point de départ. L’échelle règle l’aspect de la figure, qui ressemble moins à une plante qu’à une architecture de boîtes emboîtées.",
          "Tom Lowe proposed another route in 2010: at each step the coordinates are folded onto a cube, space is inverted with respect to a sphere, then enlarged by a chosen scale before the starting point is added. The scale governs the look of the figure, which resembles less a plant than an architecture of nested boxes."),
      ] },
      { h: p("L’ensemble de Julia quaternionique", "The quaternion Julia set"), p: [
        p("Les quaternions permettent d’itérer z ↦ z² + c en vraie multiplication. L’ensemble obtenu vit en dimension 4 ; on en voit des tranches à w constant, qui sont des objets de l’espace. Dans les quaternions i j = k mais j i = −k, alors que i², j² et k² valent tous −1.",
          "Quaternions make it possible to iterate z ↦ z² + c with genuine multiplication. The resulting set lives in dimension 4; slices at constant w are seen, which are objects of space. In the quaternions i j = k but j i = −k, while i², j² and k² all equal −1."),
      ] },
      { h: p("Statut et usage", "Status and use"), p: [
        p("La Mandelbulb et la Mandelbox sont des formules choisies pour leur effet, non des théorèmes : aucune ne s’impose comme l’analogue de Mandelbrot. Leur intérêt est dans les images, tracées en général en estimant la distance au bord de l’ensemble et en faisant avancer un rayon par pas de cette distance, et dans la dynamique que la répétition d’une formule simple produit en trois dimensions.",
          "The Mandelbulb and the Mandelbox are formulas chosen for their effect, not theorems: neither stands as the analogue of Mandelbrot. Their interest lies in the images, usually drawn by estimating the distance to the boundary of the set and advancing a ray by steps of that distance, and in the dynamics that repeating a simple formula produces in three dimensions."),
      ] },
    ],
  },

  collisions: {
    facts: [
      [p("Décrit par", "Described by"), p("Gregory Galperin, « Playing pool with π », 2003", "Gregory Galperin, “Playing pool with π”, 2003")],
      [p("Domaine", "Field"), p("Mécanique, billards, géométrie", "Mechanics, billiards, geometry")],
      [p("Résultat clé", "Key result"), p("Nombre de chocs : ⌈π/θ⌉ − 1, avec θ = arctan(√(m/M))", "Number of collisions: ⌈π/θ⌉ − 1, with θ = arctan(√(m/M))")],
      [p("Exemple", "Example"), p("Rapport des masses 1 000 000 : 3141 chocs", "Mass ratio 1,000,000: 3141 collisions")],
      [p("Statut", "Status"), p("Théorème démontré (modèle idéal)", "Proved theorem (ideal model)")],
    ],
    lead: [
      p("Un bloc léger de masse m repose contre un mur ; un bloc lourd de masse M arrive sur lui. Les chocs sont parfaitement élastiques, sans frottement, et le nombre de chocs (entre blocs et contre le mur) est fini. Pour un rapport M/m égal à 100ᵏ, il s’écrit avec les k + 1 premiers chiffres de π : 3, 31, 314, 3141.",
        "A light block of mass m rests against a wall; a heavy block of mass M arrives. The collisions are perfectly elastic and frictionless, and the number of collisions (between blocks and against the wall) is finite. For a ratio M/m equal to 100ᵏ it is written with the first k + 1 digits of π: 3, 31, 314, 3141."),
    ],
    sections: [
      { h: p("Le montage", "The setup"), p: [
        p("Deux blocs glissent sur une droite, le bloc léger entre le mur et le bloc lourd. Quand le bloc lourd arrive, il pousse le léger, qui rebondit sur le mur et revient, et ainsi de suite jusqu’à ce que le bloc léger n’atteigne plus le bloc lourd. Avec deux masses égales, il y a 3 chocs. Avec un rapport de 100, il y en a 31 ; avec un rapport de 10 000, 314 ; avec un million, 3141.",
          "Two blocks slide along a line, the light one between the wall and the heavy one. When the heavy block arrives it pushes the light one, which bounces off the wall and returns, and so on until the light block no longer reaches the heavy one. With equal masses there are 3 collisions. With a ratio of 100 there are 31; with a ratio of 10,000, 314; with a million, 3141."),
      ] },
      { h: p("Le cercle de l’énergie", "The energy circle"), p: [
        p("L’énergie cinétique est conservée : m v₁²/2 + M v₂²/2 est constante. Le point (√m·v₁, √M·v₂) de l’espace des vitesses reste donc sur un cercle. Un choc contre le mur renverse v₁ : c’est une symétrie par rapport à un axe. Un choc entre blocs conserve aussi la quantité de mouvement : c’est une symétrie par rapport à une droite qui fait avec le premier axe l’angle θ = arctan(√(m/M)).",
          "Kinetic energy is conserved: m v₁²/2 + M v₂²/2 is constant. The point (√m·v₁, √M·v₂) of velocity space therefore stays on a circle. A collision with the wall reverses v₁: it is a reflection in an axis. A collision between blocks also conserves momentum: it is a reflection in a line making the angle θ = arctan(√(m/M)) with the first axis."),
      ] },
      { h: p("Compter les chocs", "Counting the collisions"), p: [
        p("Deux symétries successives dont les axes font l’angle θ font tourner le point de 2θ. Les chocs se poursuivent tant que le point n’a pas fait un demi-tour, d’où un nombre de chocs égal à ⌈π/θ⌉ − 1. Pour M/m = 100ᵏ, l’angle θ est un peu plus petit que 10⁻ᵏ, donc π/θ est un peu plus grand que π·10ᵏ ; l’écart reste très inférieur à 1, et le nombre de chocs donne la partie entière de π·10ᵏ tant que les décimales suivantes de π ne forment pas une longue suite de 9.",
          "Two successive reflections whose axes make the angle θ turn the point by 2θ. Collisions go on until the point has made half a turn, so the number of collisions is ⌈π/θ⌉ − 1. For M/m = 100ᵏ the angle θ is slightly less than 10⁻ᵏ, so π/θ is slightly more than π·10ᵏ; the gap stays far below 1, and the number of collisions gives the integer part of π·10ᵏ as long as the following digits of π do not form a long run of nines."),
        p("Les valeurs 3, 31, 314 et 3141 sont vérifiées par un calcul exact en fractions. Le raisonnement dit seulement que le nombre vaut environ π·10ᵏ : l’apparition des décimales de π n’est pas une propriété universelle.",
          "The values 3, 31, 314 and 3141 are checked by an exact computation in fractions. The reasoning only says that the number is about π·10ᵏ: the appearance of the digits of π is not a universal property."),
      ] },
      { h: p("Histoire et modèle", "History and model"), p: [
        p("Gregory Galperin décrit ce lien entre billard, collisions et π dans « Playing pool with π » (Regular and Chaotic Dynamics, 2003) : l’astuce consiste à remplacer les deux blocs par une boule de billard dans un coin, dont les rebonds sur les deux parois se lisent comme les chocs. Une étude de 2020, The Dynamics of Digits (Aretxabaleta et al., Mathematics), reprend la démonstration.",
          "Gregory Galperin describes this link between billiards, collisions and π in “Playing pool with π” (Regular and Chaotic Dynamics, 2003): the trick is to replace the two blocks by a billiard ball in a corner, whose bounces off the two walls read as the collisions. A 2020 study, The Dynamics of Digits (Aretxabaleta et al., Mathematics), takes up the proof."),
        p("Le modèle suppose des blocs sans frottement, des chocs parfaitement élastiques et un mur rigide, sans rebond mou. Les chocs sont comptés par une simulation exacte, événement par événement, jamais pas à pas dans le temps.",
          "The model assumes frictionless blocks, perfectly elastic collisions and a rigid wall, with no soft rebound. The collisions are counted by an exact event-by-event simulation, never by time steps."),
      ] },
    ],
  },

  "napkin-ring": {
    facts: [
      [p("Étudié par", "Studied by"), p("Seki Kōwa, XVIIe siècle (« anneau d’arc »)", "Seki Kōwa, 17th century (“arc ring”)")],
      [p("Domaine", "Field"), p("Géométrie dans l’espace, calcul intégral", "Solid geometry, integral calculus")],
      [p("Résultat clé", "Key result"), p("Volume de l’anneau de hauteur h : πh³/6, quel que soit le rayon", "Volume of a ring of height h: πh³/6, whatever the radius")],
      [p("Outil", "Tool"), p("Principe de Cavalieri", "Cavalieri’s principle")],
      [p("Statut", "Status"), p("Théorème démontré", "Proved theorem")],
    ],
    lead: [
      p("L’anneau de serviette est le solide qui reste d’une sphère percée de part en part par un cylindre dont l’axe passe par le centre. Son volume ne dépend que de sa hauteur h : il vaut πh³/6, que la sphère de départ soit une bille ou la Terre. Ce résultat contraire à l’intuition est appelé paradoxe de l’anneau de serviette.",
        "The napkin ring is the solid left when a sphere is drilled right through by a cylinder whose axis passes through the centre. Its volume depends only on its height h: it is πh³/6, whether the original sphere is a marble or the Earth. This counterintuitive result is called the napkin-ring paradox."),
    ],
    sections: [
      { h: p("Le problème", "The problem"), p: [
        p("Une sphère de rayon R est percée d’un trou cylindrique de rayon r. Il reste un anneau dont la hauteur h vérifie r² = R² − h²/4. Si l’on compare deux anneaux de même hauteur, tirés d’une grosse et d’une petite sphère, l’intuition dit que le plus large contient plus de matière. Il n’en est rien : les deux ont le même volume.",
          "A sphere of radius R is drilled by a cylindrical hole of radius r. A ring remains whose height h satisfies r² = R² − h²/4. If two rings of the same height are compared, cut from a large and a small sphere, intuition says the wider one holds more material. It does not: the two have the same volume."),
      ] },
      { h: p("La démonstration", "The proof"), p: [
        p("À la hauteur z, la coupe horizontale de l’anneau est une couronne de rayon extérieur √(R² − z²) et de rayon intérieur r. Son aire vaut π(R² − z² − r²) = π(h²/4 − z²) : R a disparu. Deux anneaux de même hauteur ont donc, à chaque niveau, des coupes de même aire ; par le principe de Cavalieri, ils ont le même volume.",
          "At height z the horizontal cut of the ring is an annulus with outer radius √(R² − z²) and inner radius r. Its area is π(R² − z² − r²) = π(h²/4 − z²): R has disappeared. Two rings of the same height therefore have, at every level, cuts of the same area; by Cavalieri’s principle they have the same volume."),
        p("Avec une intégrale, V = ∫ de −h/2 à h/2 de π(h²/4 − z²) dz = πh³/6. Pour h = 6 cm, on obtient 36π ≈ 113,1 cm³. Le cas limite où le trou est de rayon nul, avec h = 2R, redonne la boule de rayon h/2, de volume 4π(h/2)³/3 = πh³/6.",
          "With an integral, V = ∫ from −h/2 to h/2 of π(h²/4 − z²) dz = πh³/6. For h = 6 cm this gives 36π ≈ 113.1 cm³. The limiting case where the hole has radius zero, with h = 2R, gives back the ball of radius h/2, of volume 4π(h/2)³/3 = πh³/6."),
      ] },
      { h: p("Pourquoi cela paraît paradoxal", "Why it seems paradoxical"), p: [
        p("Plus la sphère de départ est grande, plus l’anneau de hauteur fixée est mince et long : le rayon extérieur grandit, mais la paroi s’amincit exactement de quoi compenser. Si l’on garde le même trou plutôt que la même hauteur, la hauteur change avec R et les volumes diffèrent : l’énoncé « plus la sphère est grande, plus l’anneau est volumineux » est faux à hauteur fixée, vrai à trou fixé.",
          "The larger the original sphere, the thinner and longer the ring of fixed height: the outer radius grows, but the wall thins by exactly enough to compensate. If the same hole is kept instead of the same height, the height changes with R and the volumes differ: the statement “the larger the sphere, the more voluminous the ring” is false at fixed height and true at fixed hole."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Le problème est étudié au XVIIe siècle par le mathématicien japonais Seki Kōwa, qui appelait ce solide un « anneau d’arc » (d’après Smith et Mikami, 1914). Il est devenu un classique des cours de calcul intégral. Il ne se confond pas avec le problème du prince Rupert, qui parle aussi de trous dans un solide mais pose une autre question.",
          "The problem was studied in the 17th century by the Japanese mathematician Seki Kōwa, who called this solid an “arc ring” (after Smith and Mikami, 1914). It has become a classic of calculus courses. It is not the same as Prince Rupert’s problem, which also involves holes in a solid but asks a different question."),
      ] },
    ],
  },

  "hundred-boxes": {
    facts: [
      [p("Posé par", "Posed by"), p("Anna Gál et Peter Bro Miltersen, 2003", "Anna Gál and Peter Bro Miltersen, 2003")],
      [p("Stratégie du cycle", "Cycle strategy"), p("Trouvée par Sven Skyum", "Found by Sven Skyum")],
      [p("Domaine", "Field"), p("Probabilités, permutations", "Probability, permutations")],
      [p("Résultat clé", "Key result"), p("Probabilité de victoire 1 − (1/51 + … + 1/100) ≈ 0,3118", "Probability of victory 1 − (1/51 + … + 1/100) ≈ 0.3118")],
      [p("Statut", "Status"), p("Théorème démontré", "Proved theorem")],
    ],
    lead: [
      p("Le problème des cent boîtes (ou des cent prisonniers) met en scène cent prisonniers numérotés et cent boîtes fermées qui cachent les numéros dans un ordre inconnu. Chaque prisonnier peut ouvrir cinquante boîtes au plus, seul, et doit trouver son propre numéro ; ils sont libérés seulement si tous réussissent. En cherchant au hasard, la probabilité est (1/2)¹⁰⁰ ≈ 10⁻³⁰ ; avec la stratégie du cycle, elle dépasse 31 %.",
        "The hundred boxes problem (or hundred prisoners problem) features a hundred numbered prisoners and a hundred closed boxes hiding the numbers in an unknown order. Each prisoner may open at most fifty boxes, alone, and must find his own number; they are freed only if all succeed. Searching at random, the probability is (1/2)¹⁰⁰ ≈ 10⁻³⁰; with the cycle strategy it exceeds 31%."),
    ],
    sections: [
      { h: p("La stratégie du cycle", "The cycle strategy"), p: [
        p("Chaque prisonnier ouvre d’abord la boîte qui porte son propre numéro, lit le numéro qu’elle contient et ouvre la boîte qui porte ce numéro, et ainsi de suite. Les numéros rangés dans les boîtes forment une permutation, et le prisonnier suit le cycle de cette permutation qui passe par son numéro. Ce cycle finit par revenir à son numéro : le prisonnier trouve donc son numéro, au plus tard au bout de la longueur du cycle.",
          "Each prisoner first opens the box carrying his own number, reads the number inside and opens the box with that number, and so on. The numbers in the boxes form a permutation, and the prisoner follows the cycle of this permutation through his number. This cycle comes back to his number, so the prisoner finds his number after at most the length of the cycle."),
      ] },
      { h: p("Le calcul", "The computation"), p: [
        p("Tous réussissent exactement quand aucun cycle ne dépasse 50. Le nombre de permutations de 100 éléments qui ont un cycle de longueur k > 50 est 100!/k, et ces cas s’excluent entre eux, puisqu’un seul cycle peut dépasser 50. La probabilité d’échec vaut donc la somme des 1/k pour k de 51 à 100, et la probabilité de victoire est 1 − (1/51 + 1/52 + … + 1/100) ≈ 0,3118.",
          "Everybody succeeds exactly when no cycle is longer than 50. The number of permutations of 100 elements with a cycle of length k > 50 is 100!/k, and these cases exclude one another, since only one cycle can exceed 50. The probability of failure is therefore the sum of 1/k for k from 51 to 100, and the probability of victory is 1 − (1/51 + 1/52 + … + 1/100) ≈ 0.3118."),
        p("Pour n prisonniers (n pair), la probabilité vaut 1 − (1/(n/2 + 1) + … + 1/n) et reste au-dessus de 1 − ln 2 ≈ 0,3069 quel que soit n. Avec 10 prisonniers, elle vaut 1 − (1/6 + 1/7 + 1/8 + 1/9 + 1/10).",
          "For n prisoners (n even), the probability is 1 − (1/(n/2 + 1) + … + 1/n) and stays above 1 − ln 2 ≈ 0.3069 whatever n is. With 10 prisoners it is 1 − (1/6 + 1/7 + 1/8 + 1/9 + 1/10)."),
      ] },
      { h: p("Pourquoi l’intuition échoue", "Why intuition fails"), p: [
        p("On pourrait croire qu’aucune stratégie sans communication ne dépasse 2⁻¹⁰⁰, en traitant les cent prisonniers comme cent essais indépendants. Cette conjecture est fausse : les décisions ne sont pas indépendantes, car elles dépendent toutes de la même permutation. Le succès des uns est lié à celui des autres, car un cycle court les sauve tous ensemble, et un cycle long les condamne ensemble.",
          "One might believe that no strategy without communication does better than 2⁻¹⁰⁰, treating the hundred prisoners as a hundred independent trials. This conjecture is false: the decisions are not independent, since they all depend on the same permutation. The success of some is tied to that of the others, because a short cycle saves them all together and a long cycle condemns them together."),
      ] },
      { h: p("Histoire et modèle", "History and model"), p: [
        p("Anna Gál et Peter Bro Miltersen posent le problème en 2003 dans une étude sur les structures de données ; la stratégie du cycle est trouvée par Sven Skyum, collègue de Miltersen. Des travaux ultérieurs établissent que cette stratégie est optimale parmi toutes celles qui n’utilisent pas de communication.",
          "Anna Gál and Peter Bro Miltersen posed the problem in 2003 in a study of data structures; the cycle strategy was found by Sven Skyum, a colleague of Miltersen. Later work established that this strategy is optimal among all those that use no communication."),
        p("Le modèle suppose que les numéros sont rangés par une permutation tirée au hasard de façon uniforme et que les prisonniers ne peuvent pas communiquer une fois les boîtes en cours d’ouverture.",
          "The model assumes that the numbers are arranged by a uniformly random permutation and that the prisoners cannot communicate once the boxes are being opened."),
      ] },
    ],
  },

  morley: {
    facts: [
      [p("Découvert par", "Discovered by"), p("Frank Morley, 1899", "Frank Morley, 1899")],
      [p("Domaine", "Field"), p("Géométrie du triangle, trigonométrie", "Triangle geometry, trigonometry")],
      [p("Résultat clé", "Key result"), p("Les trisectrices voisines forment un triangle équilatéral", "Neighbouring trisectors form an equilateral triangle")],
      [p("Côté", "Side"), p("8R·sin(A/3)·sin(B/3)·sin(C/3)", "8R·sin(A/3)·sin(B/3)·sin(C/3)")],
      [p("Statut", "Status"), p("Théorème démontré", "Proved theorem")],
    ],
    lead: [
      p("Le théorème de Morley affirme que, dans n’importe quel triangle, les trisectrices voisines des angles, c’est-à-dire les droites qui coupent chaque angle en trois angles égaux, se rencontrent en trois points qui forment un triangle équilatéral. Le triangle de départ peut être quelconque : la forme du petit triangle ne change pas.",
        "Morley’s theorem states that in any triangle the adjacent trisectors of the angles, that is the lines cutting each angle into three equal angles, meet in three points that form an equilateral triangle. The starting triangle can be arbitrary: the shape of the small triangle never changes."),
    ],
    sections: [
      { h: p("L’énoncé", "The statement"), p: [
        p("On trisecte chacun des trois angles A, B, C d’un triangle. Les trisectrices voisines de deux angles se coupent en un point, ce qui donne trois points. Ils forment un triangle équilatéral, dont chaque angle mesure 60°, quel que soit le triangle de départ. Sa taille change avec le triangle : son côté vaut 8R·sin(A/3)·sin(B/3)·sin(C/3), où R est le rayon du cercle circonscrit.",
          "Each of the three angles A, B, C of a triangle is trisected. The adjacent trisectors of two angles meet in one point, which gives three points. They form an equilateral triangle, each of whose angles measures 60°, whatever the starting triangle. Its size changes with the triangle: its side is 8R·sin(A/3)·sin(B/3)·sin(C/3), where R is the circumradius."),
        p("Pour un triangle équilatéral de côté 1, R = 1/√3 et le côté du petit triangle vaut 8R·sin³ 20° ≈ 0,185.",
          "For an equilateral triangle of side 1, R = 1/√3 and the side of the small triangle is 8R·sin³ 20° ≈ 0.185."),
      ] },
      { h: p("La démonstration", "The proof"), p: [
        p("Une démonstration trigonométrique utilise la loi des sinus et l’égalité sin 3x = 4 sin x sin(60° − x) sin(60° + x). On pose A = 3α, B = 3β, C = 3γ, avec α + β + γ = 60°. La loi des sinus donne les distances des sommets aux points de rencontre des trisectrices, et l’égalité sur sin 3x les met sous la forme d’un produit de sinus. Le calcul des côtés du petit triangle donne alors la même valeur pour les trois : il est équilatéral.",
          "A trigonometric proof uses the law of sines and the identity sin 3x = 4 sin x sin(60° − x) sin(60° + x). Put A = 3α, B = 3β, C = 3γ, with α + β + γ = 60°. The law of sines gives the distances from the vertices to the meeting points of the trisectors, and the identity for sin 3x puts them in the form of a product of sines. The computation of the sides of the small triangle then gives the same value for all three: it is equilateral."),
        p("Cette démonstration n’est pas élémentaire au sens du programme de lycée, et ce que l’on voit en déplaçant les sommets d’une figure est une expérience, non une démonstration.",
          "This proof is not elementary in the sense of the high school curriculum, and what one sees by moving the vertices of a figure is an experiment, not a proof."),
      ] },
      { h: p("Trisecter un angle", "Trisecting an angle"), p: [
        p("On ne peut pas trisecter un angle quelconque à la règle et au compas, un fait démontré au XIXe siècle. Le théorème n’en est pas affecté : les trisectrices sont des droites bien définies, que l’on peut calculer exactement même si l’on ne sait pas les construire avec ces instruments.",
          "An arbitrary angle cannot be trisected with ruler and compass, a fact proved in the 19th century. The theorem is not affected: the trisectors are well-defined lines, which can be computed exactly even if they cannot be constructed with those instruments."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Le théorème est découvert en 1899 par le mathématicien anglo-américain Frank Morley. Il a suscité de nombreuses démonstrations, géométriques, trigonométriques et algébriques, dont certaines très courtes, ce qui en fait un exemple fréquent de résultat simple à énoncer et peu évident à prouver.",
          "The theorem was discovered in 1899 by the Anglo-American mathematician Frank Morley. It has prompted many proofs, geometric, trigonometric and algebraic, some of them very short, which makes it a frequent example of a result easy to state and not obvious to prove."),
        p("Le théorème vaut aussi pour les trisectrices extérieures du triangle, ce qui donne au total dix-huit triangles équilatéraux associés à un même triangle.",
          "The theorem also holds for the exterior trisectors of the triangle, giving eighteen equilateral triangles in all associated with a single triangle."),
      ] },
    ],
  },

  "secretary-gallery": {
    facts: [
      [p("Domaine", "Field"), p("Probabilités, arrêt optimal", "Probability, optimal stopping")],
      [p("Énoncé", "Setting"), p("n candidats en ordre aléatoire, rejet sans rappel, un seul gagnant : le meilleur", "n candidates in random order, rejection without recall, a single winner: the best")],
      [p("Règle optimale", "Optimal rule"), p("Refuser les r ≈ n/e premiers, puis prendre le premier record", "Reject the first r ≈ n/e, then take the first record")],
      [p("Résultat clé", "Key result"), p("Probabilité de succès → 1/e ≈ 0,37", "Probability of success → 1/e ≈ 0.37")],
      [p("Synthèse historique", "Historical survey"), p("Thomas S. Ferguson, 1989", "Thomas S. Ferguson, 1989")],
    ],
    lead: [
      p("Le problème des secrétaires est un problème d’arrêt optimal : n candidats se présentent un par un dans un ordre aléatoire, on ne voit que leurs rangs relatifs, et après chaque entretien on accepte ou on refuse pour toujours. Le gain vaut 1 seulement si l’on retient le meilleur. La règle optimale consiste à laisser passer environ n/e candidats, puis à prendre le premier qui bat tous les précédents ; la probabilité de succès tend alors vers 1/e ≈ 0,37.",
        "The secretary problem is an optimal stopping problem: n candidates arrive one at a time in random order, only their relative ranks are seen, and after each interview one accepts or rejects for good. The payoff is 1 only if the best is chosen. The optimal rule is to let about n/e candidates pass, then take the first who beats all the previous ones; the probability of success then tends to 1/e ≈ 0.37."),
    ],
    sections: [
      { h: p("Le modèle", "The model"), p: [
        p("On suppose un ordre uniforme parmi les n! permutations, des qualités distinctes, un nombre n connu et aucun rappel d’un candidat refusé. Seuls les rangs relatifs sont visibles : on sait si le candidat qui se présente bat tous les précédents (on dit qu’il est un record), non sa valeur absolue.",
          "A uniform order among the n! permutations is assumed, with distinct qualities, a known number n and no recall of a rejected candidate. Only relative ranks are visible: one knows whether the candidate at hand beats all the previous ones (he is called a record), not his absolute value."),
      ] },
      { h: p("La règle du seuil", "The threshold rule"), p: [
        p("On refuse les r premiers, puis on accepte le premier record, ou le dernier candidat si aucun nouveau record ne vient. Si r = 0, on prend le premier candidat et la probabilité vaut 1/n. Pour 1 ≤ r < n, si le meilleur arrive en position j + 1, avec j ≥ r, on gagne exactement quand le meilleur des j précédents est parmi les r refusés : probabilité r/j. Chaque position du meilleur a la probabilité 1/n, et en sommant, pₙ(r) = (r/n)(1/r + 1/(r + 1) + … + 1/(n − 1)).",
          "The first r candidates are rejected, then the first record is accepted, or the last candidate if no new record comes. If r = 0 the first candidate is taken and the probability is 1/n. For 1 ≤ r < n, if the best arrives in position j + 1, with j ≥ r, one wins exactly when the best of the previous j is among the r rejected: probability r/j. Every position of the best has probability 1/n, and summing gives pₙ(r) = (r/n)(1/r + 1/(r + 1) + … + 1/(n − 1))."),
        p("Pour n = 10, on compare les seuils : r = 3 donne environ 0,399, r = 4 environ 0,398, les autres moins ; le meilleur seuil est 3. Pour n grand, avec r/n → x, la somme tend vers −ln x et la probabilité vers −x ln x, dont la dérivée −ln x − 1 s’annule en x = 1/e, où le maximum vaut 1/e.",
          "For n = 10 the thresholds are compared: r = 3 gives about 0.399, r = 4 about 0.398, the others less; the best threshold is 3. For large n, with r/n → x, the sum tends to −ln x and the probability to −x ln x, whose derivative −ln x − 1 vanishes at x = 1/e, where the maximum equals 1/e."),
      ] },
      { h: p("Variantes", "Variants"), p: [
        p("Le seuil n/e optimise cet objectif précis, qui est de choisir le meilleur. Si l’on cherche à minimiser le rang moyen du candidat retenu, la règle optimale, obtenue par programmation dynamique sur les rangs relatifs, n’a plus la forme « refuser les r premiers ». Si l’on peut rappeler un candidat déjà vu, tout voir puis rappeler le meilleur réussit toujours.",
          "The n/e threshold optimises this particular objective, which is to pick the best. If one seeks to minimise the mean rank of the chosen candidate, the optimal rule, obtained by dynamic programming on relative ranks, is no longer of the form “reject the first r”. If a candidate already seen may be recalled, seeing everyone and then recalling the best always succeeds."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Thomas S. Ferguson publie en 1989 dans Statistical Science une synthèse intitulée « Who Solved the Secretary Problem? », qui examine les formulations du problème, son histoire et ses variantes. Le seuil et le gain dépendent des règles du modèle ; la date de 1989 est celle de la synthèse, non celle de la première apparition du problème.",
          "Thomas S. Ferguson published in 1989 in Statistical Science a survey entitled “Who Solved the Secretary Problem?”, which examines the formulations of the problem, its history and its variants. The threshold and the payoff depend on the rules of the model; the date 1989 is that of the survey, not of the first appearance of the problem."),
        p("Même avec la règle optimale, une partie isolée peut échouer : la probabilité de 0,37 décrit la fréquence sur de nombreuses parties, non une garantie pour une seule.",
          "Even with the optimal rule an individual game can fail: the probability 0.37 describes the frequency over many games, not a guarantee for a single one."),
      ] },
    ],
  },
};
