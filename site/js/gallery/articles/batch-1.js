// Batch 1 of the gallery articles (shape and rules: ../article.js): Galton board, Reuleaux, Platonic solids, chaos game,
// Fourier circles, Mandelbrot set, Voronoi diagrams, brachistochrone. Encyclopedia voice: third person, present tense.
const p = (fr, en) => [fr, en];
export const BATCH1 = {
  galton: {
    facts: [
      [p("Inventeur", "Inventor"), p("Francis Galton", "Francis Galton")],
      [p("Date", "Date"), p("1889 (Natural Inheritance)", "1889 (Natural Inheritance)")],
      [p("Domaine", "Field"), p("Probabilités, statistique", "Probability, statistics")],
      [p("Loi illustrée", "Law illustrated"), p("Loi binomiale, approchée par la loi normale", "Binomial law, approximated by the normal law")],
      [p("Résultat clé", "Key result"), p("Théorème central limite", "Central limit theorem")],
    ],
    lead: [
      p("La planche de Galton est un dispositif mécanique, appelé aussi quinconce, dans lequel des billes tombent à travers des rangées de clous. À chaque clou, une bille part à gauche ou à droite, et les billes s’accumulent en bas dans des cases voisines. Après un grand nombre de chutes, les hauteurs des piles dessinent une courbe en cloche.",
        "The Galton board, also called a quincunx, is a mechanical device in which balls fall through rows of pegs. At each peg a ball goes left or right, and the balls pile up at the bottom in adjacent bins. After a large number of drops, the heights of the piles trace a bell-shaped curve."),
    ],
    sections: [
      { h: p("Le dispositif", "The device"), p: [
        p("Les clous sont disposés en rangées décalées, de sorte que chaque bille rencontre un clou à chaque niveau. Si la planche a n rangées, une bille effectue n choix successifs, chacun à droite avec une probabilité p et à gauche avec la probabilité 1 − p. Pour un clou symétrique, p = 1/2. Chaque rebond est indépendant des précédents.",
          "The pegs are laid out in staggered rows, so that each ball meets one peg at every level. If the board has n rows, a ball makes n successive choices, each to the right with probability p and to the left with probability 1 − p. For a symmetric peg, p = 1/2. Each bounce is independent of the previous ones.") ] },
      { h: p("L’analyse mathématique", "The mathematics"), p: [
        p("Chaque rebond est une épreuve de Bernoulli. Le nombre de pas à droite après n rangées suit donc la loi binomiale : la probabilité d’atteindre la case k est C(n, k) p^k (1 − p)^(n − k). Le nombre de trajets menant à la case k est C(n, k), les nombres du triangle de Pascal : pour n = 4 et p = 1/2, il y a 16 trajets équiprobables, dont 6 aboutissent à la case centrale, soit une probabilité de 6/16 = 3/8 = 0,375.",
          "Each bounce is a Bernoulli trial. The number of right steps after n rows therefore follows the binomial law: the probability of reaching bin k is C(n, k) p^k (1 − p)^(n − k). The number of paths leading to bin k is C(n, k), the numbers of Pascal’s triangle: for n = 4 and p = 1/2 there are 16 equally likely paths, of which 6 end in the central bin, a probability of 6/16 = 3/8 = 0.375."),
        p("Le sommet de la distribution se trouve près de np, et la dispersion croît comme la racine de n. Quand n grandit, la loi binomiale se rapproche d’une loi normale : c’est l’approximation de de Moivre et Laplace. La courbe en cloche est une approximation adaptée à ces paramètres, non une identité avec la loi normale.",
          "The peak of the distribution lies near np, and the spread grows like the square root of n. As n increases, the binomial law approaches a normal law: this is the approximation of de Moivre and Laplace. The bell curve is an approximation suited to these parameters, not an identity with the normal law.") ] },
      { h: p("Histoire", "History"), p: [
        p("Francis Galton, cousin de Charles Darwin et pionnier de la statistique, imagine la planche pour montrer comment de nombreux petits hasards indépendants se combinent en une loi régulière. Il la décrit dans son ouvrage Natural Inheritance (1889), où elle illustre la façon dont des caractères variables, comme la taille, se répartissent dans une population.",
          "Francis Galton, a cousin of Charles Darwin and a pioneer of statistics, devised the board to show how many small independent chances combine into a regular law. He describes it in his book Natural Inheritance (1889), where it illustrates how variable characters, such as height, are distributed in a population.") ] },
      { h: p("Héritage et usages", "Legacy and uses"), p: [
        p("La planche matérialise une idée centrale de la statistique : des résultats individuels imprévisibles produisent une distribution collective régulière. C’est une version mécanique du théorème central limite, selon lequel la somme d’un grand nombre de petites causes indépendantes suit approximativement une loi normale.",
          "The board embodies a central idea of statistics: unpredictable individual outcomes produce a regular collective distribution. It is a mechanical version of the central limit theorem, according to which the sum of a large number of small independent causes approximately follows a normal law."),
        p("Elle sert aussi à distinguer la fréquence observée de la probabilité théorique : avec peu de billes, les piles fluctuent nettement autour de la courbe binomiale, et l’écart diminue quand le nombre de billes augmente. Changer p déplace le sommet de la distribution et la rend asymétrique.",
          "It also separates observed frequency from theoretical probability: with few balls the piles fluctuate visibly around the binomial curve, and the gap shrinks as the number of balls grows. Changing p moves the peak of the distribution and makes it asymmetric.") ] },
    ],
  },
  reuleaux: {
    facts: [
      [p("Nom", "Name"), p("Franz Reuleaux (1829 à 1905)", "Franz Reuleaux (1829 to 1905)")],
      [p("Date de l’étude", "Date of study"), p("1875 (Reuleaux) ; Barbier en 1860", "1875 (Reuleaux); Barbier in 1860")],
      [p("Domaine", "Field"), p("Géométrie, cinématique", "Geometry, kinematics")],
      [p("Résultat clé", "Key result"), p("Périmètre = π × largeur (théorème de Barbier)", "Perimeter = π × width (Barbier’s theorem)")],
      [p("Aire de largeur 1", "Area at width 1"), p("(π − √3)/2 ≈ 0,705", "(π − √3)/2 ≈ 0.705")],
    ],
    lead: [
      p("Le triangle de Reuleaux est la figure formée par l’intersection de trois disques de même rayon, centrés aux sommets d’un triangle équilatéral dont le côté égale ce rayon. Son bord est composé de trois arcs de cercle. C’est le plus simple exemple non circulaire d’une courbe de largeur constante.",
        "The Reuleaux triangle is the shape formed by the intersection of three discs of the same radius, centred at the vertices of an equilateral triangle whose side equals that radius. Its boundary is made of three circular arcs. It is the simplest non-circular example of a curve of constant width."),
    ],
    sections: [
      { h: p("Largeur constante", "Constant width"), p: [
        p("La largeur d’une forme convexe dans une direction est la distance entre les deux droites parallèles d’appui perpendiculaires à cette direction, qui l’enserrent. Une courbe est de largeur constante w quand cette distance vaut w dans toutes les directions. Le disque en est l’exemple évident, mais le triangle de Reuleaux a la même propriété : chaque sommet est à distance w de l’arc opposé, qui est centré sur lui.",
          "The width of a convex shape in a given direction is the distance between the two parallel support lines, perpendicular to that direction, that enclose it. A curve has constant width w when that distance equals w in every direction. The disc is the obvious example, but the Reuleaux triangle has the same property: each vertex is at distance w from the opposite arc, which is centred on it."),
        p("Largeur constante ne signifie pas courbure constante : le rayon de courbure du triangle de Reuleaux vaut w sur les arcs et zéro aux sommets. Le même procédé donne des polygones de Reuleaux à 5, 7, 9 sommets, toujours en nombre impair, qui tendent vers le disque.",
          "Constant width does not mean constant curvature: the radius of curvature of the Reuleaux triangle is w on the arcs and zero at the vertices. The same construction gives Reuleaux polygons with 5, 7, 9 vertices, always an odd number, which tend towards the disc.") ] },
      { h: p("Le théorème de Barbier", "Barbier’s theorem"), p: [
        p("En 1860, Joseph-Émile Barbier démontre que toutes les courbes de largeur constante w ont le même périmètre, πw, celui du cercle de diamètre w. Un triangle de Reuleaux de périmètre 6π cm a donc une largeur de 6 cm. Directement : chacun des trois arcs a pour rayon w et pour angle π/3, soit une longueur πw/3, et le total vaut πw.",
          "In 1860 Joseph-Émile Barbier proved that all curves of constant width w have the same perimeter, πw, that of the circle of diameter w. A Reuleaux triangle of perimeter 6π cm therefore has width 6 cm. Directly: each of the three arcs has radius w and angle π/3, a length πw/3, and the total is πw."),
        p("Les aires, elles, diffèrent. Parmi les courbes de largeur w, le disque a l’aire maximale (πw²/4), et le triangle de Reuleaux l’aire minimale, (π − √3)w²/2, résultat associé aux noms de Blaschke et de Lebesgue.",
          "The areas, however, differ. Among curves of width w, the disc has the largest area (πw²/4) and the Reuleaux triangle the smallest, (π − √3)w²/2, a result associated with the names of Blaschke and Lebesgue.") ] },
      { h: p("Mécanismes et applications", "Mechanisms and applications"), p: [
        p("Franz Reuleaux étudie ces courbes dans sa cinématique des mécanismes, vers 1875. Comme un disque, la forme roule entre deux parallèles à distance fixe : un plateau posé sur des rouleaux de ce profil reste à hauteur constante. En revanche, un axe placé au centre du triangle ne reste pas à hauteur constante, contrairement à celui d’une roue circulaire.",
          "Franz Reuleaux studied these curves in his kinematics of mechanisms, around 1875. Like a disc, the shape rolls between two parallels at a fixed distance: a platform resting on rollers of this profile stays at constant height. An axle at the centre of the triangle, however, does not stay at constant height, unlike that of a circular wheel."),
        p("Tournant dans un carré, le triangle touche constamment les quatre côtés, et un foret de ce profil perce des trous presque carrés (au coin arrondi près). Des profils voisins servent dans certains mécanismes de rotors et de cames, et dans des objets courants comme des médiators de guitare ou des pièces de monnaie à bord polygonal.",
          "Turning inside a square, the triangle touches all four sides at every moment, and a drill of this profile cuts almost-square holes (apart from rounded corners). Related profiles appear in rotor and cam mechanisms and in everyday objects such as guitar picks or coins with a polygonal edge.") ] },
      { h: p("Prolongements", "Further developments"), p: [
        p("L’idée s’étend à l’espace : une surface de largeur constante n’est pas forcément une sphère. Les corps de Meissner, décrits en 1911, sont des exemples dérivés du tétraèdre, et l’on conjecture qu’ils ont le volume minimal parmi les corps de largeur constante donnée ; la question reste ouverte.",
          "The idea extends to space: a surface of constant width need not be a sphere. The Meissner bodies, described in 1911, are examples derived from the tetrahedron, and they are conjectured to have the smallest volume among bodies of a given constant width; the question remains open.") ] },
    ],
  },
  platonic: {
    facts: [
      [p("Classification", "Classification"), p("Attribuée à Théétète (Ve siècle av. J.-C.)", "Attributed to Theaetetus (5th century BC)")],
      [p("Exposé dans", "Set out in"), p("Les Éléments d’Euclide, livre XIII", "Euclid’s Elements, Book XIII")],
      [p("Domaine", "Field"), p("Géométrie de l’espace", "Solid geometry")],
      [p("Résultat clé", "Key result"), p("Il n’existe que cinq solides réguliers convexes", "Only five convex regular solids exist")],
      [p("Relation d’Euler", "Euler’s relation"), p("S − A + F = 2", "V − E + F = 2")],
    ],
    lead: [
      p("Les solides de Platon sont les polyèdres convexes dont toutes les faces sont des polygones réguliers identiques et dont chaque sommet a le même nombre de faces. Il y en a exactement cinq, à une similitude près : le tétraèdre, le cube, l’octaèdre, le dodécaèdre et l’icosaèdre.",
        "The Platonic solids are the convex polyhedra whose faces are all identical regular polygons and in which the same number of faces meet at every vertex. There are exactly five, up to similarity: the tetrahedron, the cube, the octahedron, the dodecahedron and the icosahedron."),
    ],
    sections: [
      { h: p("Les cinq solides", "The five solids"), p: [
        p("Le tétraèdre a 4 sommets, 6 arêtes et 4 faces triangulaires. Le cube a 8 sommets, 12 arêtes et 6 faces carrées. L’octaèdre a 6 sommets, 12 arêtes et 8 faces triangulaires. Le dodécaèdre a 20 sommets, 30 arêtes et 12 faces pentagonales. L’icosaèdre a 12 sommets, 30 arêtes et 20 faces triangulaires.",
          "The tetrahedron has 4 vertices, 6 edges and 4 triangular faces. The cube has 8 vertices, 12 edges and 6 square faces. The octahedron has 6 vertices, 12 edges and 8 triangular faces. The dodecahedron has 20 vertices, 30 edges and 12 pentagonal faces. The icosahedron has 12 vertices, 30 edges and 20 triangular faces."),
        p("Dans chaque cas, S − A + F = 2, relation d’Euler. Elle permet de retrouver un nombre manquant : un solide à 12 sommets et 20 faces triangulaires a 3 × 20 / 2 = 30 arêtes, car chaque face a 3 arêtes et chaque arête borde 2 faces ; on reconnaît l’icosaèdre. Le cube et l’octaèdre, le dodécaèdre et l’icosaèdre sont duaux : échanger sommets et faces transforme l’un en l’autre, et le tétraèdre est son propre dual.",
          "In each case V − E + F = 2, Euler’s relation. It recovers a missing number: a solid with 12 vertices and 20 triangular faces has 3 × 20 / 2 = 30 edges, since each face has 3 edges and each edge borders 2 faces; this is the icosahedron. The cube and the octahedron, the dodecahedron and the icosahedron are dual: exchanging vertices and faces turns one into the other, and the tetrahedron is its own dual.") ] },
      { h: p("Pourquoi seulement cinq", "Why only five"), p: [
        p("Au moins trois faces se rencontrent en chaque sommet, et, pour que le solide soit convexe, la somme de leurs angles doit rester strictement inférieure à 360°. Avec des triangles équilatéraux (60°), on peut en réunir 3, 4 ou 5 (180°, 240°, 300°) : tétraèdre, octaèdre, icosaèdre ; 6 donneraient 360°, c’est-à-dire un plan. Avec des carrés (90°), seuls 3 conviennent (270°) : le cube. Avec des pentagones (108°), seuls 3 conviennent (324°) : le dodécaèdre.",
          "At least three faces meet at every vertex, and for the solid to be convex the sum of their angles must stay strictly below 360°. With equilateral triangles (60°) one can gather 3, 4 or 5 (180°, 240°, 300°): tetrahedron, octahedron, icosahedron; 6 would give 360°, that is, a plane. With squares (90°) only 3 work (270°): the cube. With pentagons (108°) only 3 work (324°): the dodecahedron."),
        p("Trois hexagones réguliers font déjà 360° et se rangent à plat, et les polygones à plus de six côtés ont des angles encore plus grands : aucun sixième solide régulier convexe n’existe.",
          "Three regular hexagons already make 360° and lie flat, and polygons with more than six sides have even larger angles: no sixth convex regular solid exists.") ] },
      { h: p("Histoire", "History"), p: [
        p("La classification est attribuée à Théétète, au Ve siècle avant notre ère, et exposée à la fin des Éléments d’Euclide (livre XIII), qui construit chacun des cinq solides. L’argument des angles autour d’un sommet y figure déjà en substance. Dans le Timée, Platon associe le tétraèdre au feu, le cube à la terre, l’octaèdre à l’air et l’icosaèdre à l’eau ; le dodécaèdre est lié à l’ensemble du cosmos.",
          "The classification is attributed to Theaetetus, in the 5th century BC, and set out at the end of Euclid’s Elements (Book XIII), which constructs each of the five solids. The angle-sum argument at a vertex is already there in substance. In the Timaeus, Plato associates the tetrahedron with fire, the cube with earth, the octahedron with air and the icosahedron with water; the dodecahedron is linked to the cosmos as a whole."),
        p("En 1596, Johannes Kepler propose dans le Mysterium Cosmographicum d’emboîter les cinq solides entre les orbites des planètes alors connues. Ce modèle est abandonné, mais il témoigne du prestige de ces formes.",
          "In 1596 Johannes Kepler proposed in the Mysterium Cosmographicum to nest the five solids between the orbits of the planets then known. The model was abandoned, but it testifies to the prestige of these forms.") ] },
      { h: p("Prolongements", "Further developments"), p: [
        p("Si l’on abandonne la convexité, on obtient quatre polyèdres réguliers étoilés (solides de Kepler et Poinsot). Les solides de Platon restent des modèles de symétrie : ils sont à la base de la classification des polyèdres semi-réguliers et de leurs variantes, et leurs symétries apparaissent en cristallographie et dans la forme de certains virus.",
          "If convexity is dropped, four regular star polyhedra are obtained (the Kepler and Poinsot solids). The Platonic solids remain models of symmetry: they underlie the classification of semi-regular polyhedra and their variants, and their symmetries appear in crystallography and in the shape of some viruses.") ] },
    ],
  },
  chaos: {
    facts: [
      [p("Figure limite", "Limit figure"), p("Triangle de Sierpiński (1915)", "Sierpiński triangle (1915)")],
      [p("Jeu du chaos", "Chaos game"), p("Popularisé par Michael Barnsley (années 1980)", "Popularised by Michael Barnsley (1980s)")],
      [p("Domaine", "Field"), p("Fractales, probabilités, systèmes itérés", "Fractals, probability, iterated systems")],
      [p("Dimension", "Dimension"), p("log 3 / log 2 ≈ 1,585", "log 3 / log 2 ≈ 1.585")],
      [p("Aire", "Area"), p("Nulle à la limite", "Zero in the limit")],
    ],
    lead: [
      p("Le jeu du chaos est un procédé aléatoire de construction de figures auto-similaires. On part d’un point quelconque et on répète : choisir au hasard l’un des sommets d’un triangle, puis placer le nouveau point au milieu du segment entre le point courant et ce sommet. Les points successifs dessinent peu à peu le triangle de Sierpiński.",
        "The chaos game is a random procedure for constructing self-similar figures. One starts from any point and repeats: choose at random one vertex of a triangle, then place the new point at the midpoint of the segment between the current point and that vertex. The successive points gradually draw the Sierpiński triangle."),
    ],
    sections: [
      { h: p("Le triangle de Sierpiński", "The Sierpiński triangle"), p: [
        p("Wacław Sierpiński décrit ce triangle en 1915. Il se construit par niveaux : on part d’un triangle plein, puis on remplace chaque triangle plein par trois triangles de moitié de côté, en retirant le triangle central. Le nombre de triangles pleins est multiplié par 3 à chaque niveau (27 au niveau 3), tandis que l’aire est multipliée par 3/4 et vaut (3/4)^n au niveau n : elle tend vers 0.",
          "Wacław Sierpiński described this triangle in 1915. It is built level by level: start from a filled triangle, then replace each filled triangle by three triangles of half the side, removing the central one. The number of filled triangles is multiplied by 3 at each level (27 at level 3), while the area is multiplied by 3/4 and equals (3/4)^n at level n: it tends to 0."),
        p("La figure limite a une aire nulle, mais une longueur de bord infinie, et sa dimension fractale est log 3 / log 2, environ 1,585 : trois copies réduites de moitié recouvrent la figure.",
          "The limit figure has zero area but infinite boundary length, and its fractal dimension is log 3 / log 2, about 1.585: three copies reduced by half cover the figure.") ] },
      { h: p("Pourquoi le hasard dessine une forme", "Why chance draws a shape"), p: [
        p("Choisir un sommet au hasard et aller à mi-chemin revient à appliquer l’une de trois homothéties de rapport 1/2, de centres les sommets. Chacune réduit les distances de moitié : l’influence du point de départ s’efface vite, car l’écart avec la trajectoire idéale est divisé par 2 à chaque saut. Un point qui se trouve dans le triangle de départ reste dans l’un des trois petits triangles d’angle, puis dans l’un des neuf suivants, et ainsi de suite.",
          "Choosing a vertex at random and going halfway amounts to applying one of three homotheties of ratio 1/2, centred at the vertices. Each halves distances: the influence of the starting point fades quickly, since the gap to the ideal trajectory is divided by 2 at each jump. A point inside the starting triangle stays in one of the three small corner triangles, then in one of the next nine, and so on."),
        p("Le hasard choisit donc les chemins, et les contractions déterminent la forme limite : le triangle de Sierpiński est l’unique figure fermée et bornée qui est la réunion de ses trois images par ces homothéties. Les trois sommets ne sont pas privilégiés par le hasard, c’est la règle de saut qui impose la figure.",
          "Chance thus chooses the paths, and the contractions determine the limiting shape: the Sierpiński triangle is the unique closed bounded figure that is the union of its three images under these homotheties. Chance does not favour any vertex; it is the jump rule that imposes the figure.") ] },
      { h: p("Systèmes de fonctions itérées", "Iterated function systems"), p: [
        p("Cette idée a été formalisée dans les systèmes de fonctions itérées, théorisés notamment par John Hutchinson en 1981 et popularisés par Michael Barnsley dans les années 1980. Un tel système est un petit ensemble de contractions du plan ; son attracteur est la figure obtenue, que le jeu du chaos approche aléatoirement.",
          "This idea was formalised in iterated function systems, developed notably by John Hutchinson in 1981 and popularised by Michael Barnsley in the 1980s. Such a system is a small set of contractions of the plane; its attractor is the resulting figure, which the chaos game approaches randomly."),
        p("Avec quatre sommets formant un carré et le même rapport 1/2, les sauts remplissent le carré entier : un changement de nombre de sommets ou de rapport peut changer la nature de la figure. Ces systèmes décrivent de façon compacte des formes naturelles, comme des fougères, par quelques paramètres.",
          "With four vertices forming a square and the same ratio 1/2, the jumps fill the whole square: a change in the number of vertices or in the ratio can change the nature of the figure. These systems describe natural shapes, such as ferns, compactly with a few parameters.") ] },
      { h: p("Portée", "Significance"), p: [
        p("Le jeu relie géométrie, suites et probabilités. Il montre aussi que « aléatoire » et « sans structure » ne sont pas synonymes : un processus où chaque pas est imprévisible peut produire une figure parfaitement déterminée.",
          "The game connects geometry, sequences and probability. It also shows that “random” and “unstructured” are not synonyms: a process in which each step is unpredictable can produce a perfectly determined figure.") ] },
    ],
  },
  fourier: {
    facts: [
      [p("Auteur", "Author"), p("Joseph Fourier", "Joseph Fourier")],
      [p("Date", "Date"), p("1822, Théorie analytique de la chaleur", "1822, Analytical Theory of Heat")],
      [p("Domaine", "Field"), p("Analyse harmonique", "Harmonic analysis")],
      [p("Idée", "Idea"), p("Un signal périodique est une somme de composantes de fréquences entières", "A periodic signal is a sum of components at whole-number frequencies")],
      [p("Algorithme moderne", "Modern algorithm"), p("Transformée de Fourier rapide (Cooley et Tukey, 1965)", "Fast Fourier transform (Cooley and Tukey, 1965)")],
    ],
    lead: [
      p("La décomposition de Fourier écrit un phénomène périodique comme une somme de composantes simples, des ondes de fréquences multiples d’une fréquence de base. Appliquée à une courbe fermée du plan, elle la décrit comme la trace du bout d’une chaîne de vecteurs tournants, ou « cercles de Fourier » : chaque cercle a un rayon, une vitesse de rotation et une position de départ.",
        "Fourier decomposition writes a periodic phenomenon as a sum of simple components, waves whose frequencies are multiples of a base frequency. Applied to a closed plane curve, it describes the curve as the path traced by the tip of a chain of rotating vectors, or “Fourier circles”: each circle has a radius, a rotation speed and a starting position."),
    ],
    sections: [
      { h: p("Une courbe comme somme de cercles", "A curve as a sum of circles"), p: [
        p("On repère le plan par les nombres complexes et on paramètre la courbe par z(t), où t parcourt une période. Elle s’écrit z(t) = Σ c_k e^(ikt), somme de termes de la forme c_k e^(ikt) : chacun est un vecteur de longueur |c_k| qui tourne à la vitesse k tours par période. Le premier cercle est centré sur l’origine, le second sur le bout du premier, et ainsi de suite ; le dernier bout trace la courbe.",
          "The plane is identified with the complex numbers and the curve is parametrised by z(t), where t runs through one period. It is written z(t) = Σ c_k e^(ikt), a sum of terms c_k e^(ikt): each one is a vector of length |c_k| turning at k turns per period. The first circle is centred at the origin, the second on the tip of the first, and so on; the last tip traces the curve."),
        p("Les coefficients c_k se calculent par une intégrale de la courbe contre e^(−ikt), ou, pour une courbe échantillonnée, par une somme finie, la transformée de Fourier discrète. La distance maximale du bout au centre est au plus la somme des rayons : avec des cercles de rayons 3 et 1, elle vaut au plus 4, atteint quand les deux bras pointent dans le même sens.",
          "The coefficients c_k are computed by an integral of the curve against e^(−ikt) or, for a sampled curve, by a finite sum, the discrete Fourier transform. The greatest distance from the tip to the centre is at most the sum of the radii: with circles of radii 3 and 1 it is at most 4, reached when both arms point the same way.") ] },
      { h: p("Approximation", "Approximation"), p: [
        p("Chaque fréquence ajoutée apporte du détail. Les grands cercles, de fréquences basses, donnent la forme générale ; les petits, de fréquences élevées, les angles et les finesses du contour. Un nombre fini de cercles ne reproduit pas exactement toute courbe : à des discontinuités, la somme présente des oscillations persistantes (phénomène de Gibbs).",
          "Each added frequency brings detail. The large circles, of low frequency, give the general shape; the small ones, of high frequency, give corners and fine detail of the outline. A finite number of circles does not reproduce every curve exactly: at discontinuities the sum shows persistent oscillations (the Gibbs phenomenon)."),
        p("La figure du site approche ainsi le contour de Madagascar. Ce contour a été relevé sur un fond de carte puis lissé : c’est une aide au dessin, pas un levé cartographique.",
          "The site’s figure thus approximates the outline of Madagascar. The outline was traced from a map outline and then smoothed: it is a drawing aid, not a survey.") ] },
      { h: p("Histoire", "History"), p: [
        p("Dans sa Théorie analytique de la chaleur (1822), Joseph Fourier développe la décomposition trigonométrique pour étudier la propagation de la chaleur dans un solide. L’idée suscite des débats sur ce que signifie « toute fonction » : des théorèmes de convergence, comme celui de Dirichlet (1829), précisent ensuite les hypothèses nécessaires pour retrouver un signal.",
          "In his Analytical Theory of Heat (1822), Joseph Fourier developed trigonometric decomposition to study heat propagation in a solid. The idea provoked debate over what “any function” means: convergence theorems, such as Dirichlet’s (1829), then specified the assumptions needed to recover a signal."),
        p("L’image de cercles portés par d’autres cercles rappelle les épicycles de l’astronomie ancienne : sommer des mouvements circulaires permet d’approcher des trajectoires très variées.",
          "The picture of circles carried by other circles recalls the epicycles of ancient astronomy: adding circular motions makes it possible to approximate a wide variety of trajectories.") ] },
      { h: p("Développements et applications", "Developments and applications"), p: [
        p("La transformée de Fourier rapide, publiée par James Cooley et John Tukey en 1965, calcule la transformée discrète de n valeurs en un nombre d’opérations de l’ordre de n log n, au lieu de n². Elle rend praticables l’analyse du son, le filtrage d’images, la compression (par exemple JPEG et MP3) et la résolution de certaines équations différentielles.",
          "The fast Fourier transform, published by James Cooley and John Tukey in 1965, computes the discrete transform of n values in a number of operations of the order of n log n instead of n². It makes practical the analysis of sound, the filtering of images, compression (for example JPEG and MP3) and the solution of certain differential equations.") ] },
    ],
  },
  mandelbrot: {
    facts: [
      [p("Visualisé par", "Visualised by"), p("Benoît Mandelbrot, par ordinateur, 1980", "Benoit Mandelbrot, by computer, 1980")],
      [p("Précurseurs", "Precursors"), p("Gaston Julia et Pierre Fatou (vers 1918)", "Gaston Julia and Pierre Fatou (around 1918)")],
      [p("Domaine", "Field"), p("Dynamique complexe, fractales", "Complex dynamics, fractals")],
      [p("Règle", "Rule"), p("z → z² + c, à partir de z = 0", "z → z² + c, starting from z = 0")],
      [p("Résultat clé", "Key result"), p("L’ensemble est connexe (Douady et Hubbard)", "The set is connected (Douady and Hubbard)")],
    ],
    lead: [
      p("L’ensemble de Mandelbrot est l’ensemble des nombres complexes c pour lesquels la suite définie par z₀ = 0 et zₙ₊₁ = zₙ² + c reste bornée. Dessiné dans le plan complexe, il forme une figure en bulbes dont le bord, d’une complexité infinie, est devenu l’une des images les plus connues des mathématiques.",
        "The Mandelbrot set is the set of complex numbers c for which the sequence defined by z₀ = 0 and zₙ₊₁ = zₙ² + c stays bounded. Drawn in the complex plane, it forms a figure of bulbs whose boundary, infinitely complicated, has become one of the best-known images in mathematics."),
    ],
    sections: [
      { h: p("Définition et test d’échappement", "Definition and escape test"), p: [
        p("Pour un c donné, on calcule la suite z₀ = 0, z₁ = c, z₂ = c² + c, et ainsi de suite. On démontre que, dès qu’un terme dépasse 2 en module, la suite tend vers l’infini : c n’appartient pas à l’ensemble. Par exemple, pour c = 1 la suite vaut 0, 1, 2, 5, … et dépasse 2 à l’étape 3. Pour c = 0 ou c = −1, elle reste bornée.",
          "For a given c, the sequence z₀ = 0, z₁ = c, z₂ = c² + c is computed, and so on. It is proved that as soon as a term exceeds 2 in modulus, the sequence tends to infinity: c is not in the set. For example, for c = 1 the sequence is 0, 1, 2, 5, … and exceeds 2 at step 3. For c = 0 or c = −1 it stays bounded."),
        p("Un ordinateur ne peut tester qu’un nombre fini d’itérations : un point qui n’a pas fui après N pas peut encore fuir plus tard. L’image est donc une approximation numérique, et les couleurs indiquent la vitesse d’échappement des points extérieurs. L’ensemble est contenu dans le disque de rayon 2 ; sur l’axe réel, il occupe l’intervalle de −2 à 1/4.",
          "A computer can test only a finite number of iterations: a point that has not escaped after N steps may still escape later. The image is therefore a numerical approximation, and the colours show the escape speed of the exterior points. The set is contained in the disc of radius 2; on the real axis it occupies the interval from −2 to 1/4.") ] },
      { h: p("Ensembles de Julia", "Julia sets"), p: [
        p("Pour un c fixé, l’ensemble de Julia associé est la frontière des points z qui restent bornés sous l’itération z → z² + c. Les travaux de Gaston Julia et de Pierre Fatou, vers 1918, en font l’étude. Le lien est précis : l’ensemble de Julia de c est d’un seul tenant exactement lorsque c appartient à l’ensemble de Mandelbrot, et il se réduit à une poussière de points sinon.",
          "For a fixed c, the associated Julia set is the boundary of the points z that remain bounded under the iteration z → z² + c. Gaston Julia and Pierre Fatou studied them around 1918. The link is precise: the Julia set of c is in one piece exactly when c belongs to the Mandelbrot set, and it is reduced to a dust of points otherwise."),
        p("Le disque central en forme de cardioïde et les bulbes qui l’entourent correspondent à des paramètres où l’orbite converge vers un cycle attractif de période donnée : la période 1 dans la cardioïde, la période 2 dans le grand disque voisin, et ainsi de suite.",
          "The central cardioid-shaped region and the bulbs around it correspond to parameters where the orbit converges to an attracting cycle of a given period: period 1 in the cardioid, period 2 in the large neighbouring disc, and so on.") ] },
      { h: p("Histoire", "History"), p: [
        p("Après les travaux de Julia et Fatou sur l’itération complexe, l’ordinateur permet d’explorer ces frontières avec une précision nouvelle. Benoît Mandelbrot visualise l’ensemble en 1980, chez IBM, dans le cadre de ses recherches sur les fractales, terme qu’il avait lui-même introduit en 1975. Adrien Douady et John Hubbard en étudient les propriétés au début des années 1980, démontrent qu’il est connexe et lui donnent son nom.",
          "After the work of Julia and Fatou on complex iteration, the computer made it possible to explore these boundaries with new precision. Benoit Mandelbrot visualised the set in 1980 at IBM, as part of his research on fractals, a term he had himself introduced in 1975. Adrien Douady and John Hubbard studied its properties in the early 1980s, proved that it is connected and gave it its name.") ] },
      { h: p("Résultats et questions ouvertes", "Results and open questions"), p: [
        p("Le bord de l’ensemble est une courbe de dimension 2, résultat de Mitsuhiro Shishikura (1998), et l’on voit des copies réduites de l’ensemble à toutes les échelles du bord. La question de savoir si l’ensemble est localement connexe (conjecture MLC) est toujours ouverte, et elle impliquerait une description combinatoire complète de sa structure.",
          "The boundary of the set has dimension 2, a result of Mitsuhiro Shishikura (1998), and reduced copies of the set can be seen at every scale of the boundary. Whether the set is locally connected (the MLC conjecture) is still open, and a positive answer would give a complete combinatorial description of its structure."),
        p("Sur l’axe réel, l’ensemble relie la dynamique à la suite logistique : la cascade de doublements de période y apparaît comme une suite de bulbes de plus en plus petits. L’intérêt central reste celui des systèmes dynamiques : une règle simple produit des comportements stables, périodiques ou sensibles au paramètre.",
          "On the real axis the set connects with the logistic sequence: the cascade of period doublings appears there as a sequence of ever smaller bulbs. The central interest remains that of dynamical systems: a simple rule produces stable, periodic or parameter-sensitive behaviour.") ] },
    ],
  },
  voronoi: {
    facts: [
      [p("Nommé d’après", "Named after"), p("Georgy Voronoï (1868 à 1908)", "Georgy Voronoi (1868 to 1908)")],
      [p("Date", "Date"), p("1908 (formes quadratiques)", "1908 (quadratic forms)")],
      [p("Domaine", "Field"), p("Géométrie, géométrie algorithmique", "Geometry, computational geometry")],
      [p("Autres noms", "Other names"), p("Pavage de Dirichlet, polygones de Thiessen", "Dirichlet tessellation, Thiessen polygons")],
      [p("Dual", "Dual"), p("Triangulation de Delaunay (1934)", "Delaunay triangulation (1934)")],
    ],
    lead: [
      p("Un diagramme de Voronoï partage le plan en territoires, un par point donné, les sites ou graines. Le territoire d’une graine est l’ensemble des points du plan qui sont plus proches d’elle que de toute autre graine. Les territoires, ou cellules, recouvrent le plan sans se chevaucher.",
        "A Voronoi diagram divides the plane into territories, one for each given point, the sites or seeds. The territory of a seed is the set of points of the plane that are nearer to it than to any other seed. The territories, or cells, cover the plane without overlapping."),
    ],
    sections: [
      { h: p("Construction", "Construction"), p: [
        p("La frontière entre deux graines A et B est la médiatrice du segment AB : les points à égale distance des deux. De part et d’autre, la graine la plus proche change. Trois territoires se rencontrent en général en un point équidistant de trois graines, le centre du cercle qui passe par elles. Si A = (0, 0) et B = (6, 0), l’égalité x² + y² = (x − 6)² + y² donne x = 3 : la frontière est la droite verticale d’abscisse 3.",
          "The boundary between two seeds A and B is the perpendicular bisector of the segment AB: the points equidistant from both. On either side, the nearest seed changes. Three territories generally meet at a point equidistant from three seeds, the centre of the circle passing through them. If A = (0, 0) and B = (6, 0), the equality x² + y² = (x − 6)² + y² gives x = 3: the boundary is the vertical line with x-coordinate 3.") ] },
      { h: p("Des cellules convexes", "Convex cells"), p: [
        p("Pour une graine A, la condition ||X − A||² ≤ ||X − B||² est une inégalité affine en X : être plus près de A que de B, c’est se trouver du côté de A de leur médiatrice, un demi-plan. Le territoire de A est l’intersection de ces demi-plans, un par autre graine, et une intersection de demi-plans est toujours convexe. Chaque cellule est donc un polygone convexe, éventuellement non borné.",
          "For a seed A, the condition ||X − A||² ≤ ||X − B||² is affine in X: being nearer to A than to B means lying on A’s side of their perpendicular bisector, a half-plane. A’s territory is the intersection of these half-planes, one per other seed, and an intersection of half-planes is always convex. Each cell is therefore a convex polygon, possibly unbounded."),
        p("Le diagramme de n graines (n ≥ 3) compte au plus 2n − 5 sommets et 3n − 6 arêtes : sa taille reste proportionnelle à n. Déplacer une graine modifie plusieurs cellules à la fois, celles de ses voisines.",
          "The diagram of n seeds (n ≥ 3) has at most 2n − 5 vertices and 3n − 6 edges: its size stays proportional to n. Moving one seed changes several cells at once, those of its neighbours.") ] },
      { h: p("Histoire", "History"), p: [
        p("L’idée de partager l’espace selon la proximité apparaît dès Descartes, qui en 1644 représente ainsi des régions autour des étoiles. Gustav Lejeune Dirichlet l’emploie en 1850 pour les formes quadratiques, et Georgy Voronoï la généralise en dimension quelconque dans un mémoire de 1908, l’année de sa mort à l’âge de 40 ans. Les cellules portent depuis son nom.",
          "The idea of dividing space according to proximity appears as early as Descartes, who in 1644 depicted regions around stars in this way. Gustav Lejeune Dirichlet used it in 1850 for quadratic forms, and Georgy Voronoi generalised it to any dimension in a memoir of 1908, the year of his death at the age of 40. The cells have borne his name since."),
        p("En météorologie, le même découpage est appelé polygones de Thiessen, du nom d’Alfred Thiessen qui l’utilise vers 1911 pour estimer la pluie d’une région à partir de postes de mesure. Boris Delaunay montre en 1934 que la triangulation duale, qui relie les graines voisines, vérifie la propriété du cercle vide.",
          "In meteorology the same partition is called Thiessen polygons, after Alfred Thiessen, who used it around 1911 to estimate the rainfall of a region from measuring stations. Boris Delaunay showed in 1934 that the dual triangulation, joining neighbouring seeds, satisfies the empty-circle property.") ] },
      { h: p("Algorithmes et applications", "Algorithms and applications"), p: [
        p("Le diagramme se calcule en un nombre d’opérations de l’ordre de n log n, par exemple avec l’algorithme de balayage de Steven Fortune (1986). Une variante, l’itération de Lloyd, déplace chaque graine vers le centre de gravité de son territoire : elle tend à répartir les graines régulièrement, sans garantir l’arrangement optimal global.",
          "The diagram is computed in a number of operations of the order of n log n, for example with Steven Fortune’s sweep algorithm (1986). A variant, Lloyd’s iteration, moves each seed to the centroid of its territory: it tends to spread the seeds evenly, without guaranteeing a globally optimal arrangement."),
        p("Le modèle sert à répondre à la question du plus proche : quel point d’eau, hôpital ou relais est le plus proche d’un lieu donné ? Il intervient aussi en cristallographie, en biologie (forme des cellules d’un tissu) et en infographie. La distance à vol d’oiseau est une hypothèse : des routes ou des obstacles demandent un autre modèle.",
          "The model answers nearest-site questions: which water source, hospital or relay is nearest to a given place? It also appears in crystallography, in biology (the shape of cells in a tissue) and in computer graphics. Straight-line distance is an assumption: roads or obstacles require a different model.") ] },
    ],
  },
  "fastest-slide": {
    facts: [
      [p("Posé par", "Posed by"), p("Johann Bernoulli, 1696", "Johann Bernoulli, 1696")],
      [p("Domaine", "Field"), p("Calcul des variations, mécanique", "Calculus of variations, mechanics")],
      [p("Solution", "Solution"), p("Un arc de cycloïde", "An arc of a cycloid")],
      [p("Hypothèses", "Assumptions"), p("Gravité uniforme, sans frottement", "Uniform gravity, no friction")],
      [p("Nom", "Name"), p("Brachistochrone, « temps le plus court »", "Brachistochrone, “shortest time”")],
    ],
    lead: [
      p("La brachistochrone (du grec, « temps le plus court ») est la courbe sur laquelle une bille, partie du repos sous gravité uniforme et sans frottement, descend d’un point à un autre en un temps minimal. La réponse n’est pas le segment droit, qui est le chemin le plus court, mais un arc de cycloïde.",
        "The brachistochrone (from the Greek for “shortest time”) is the curve along which a bead, released from rest under uniform gravity and without friction, descends from one point to another in minimal time. The answer is not the straight segment, which is the shortest path, but an arc of a cycloid."),
    ],
    sections: [
      { h: p("Le problème", "The problem"), p: [
        p("On minimise une durée, non une longueur. Par conservation de l’énergie, la vitesse ne dépend que de la profondeur atteinte : v = √(2gy), quelle que soit la forme de la piste. Une bille qui tombe de 5 m avec g = 10 m/s² atteint 10 m/s, par la droite comme par n’importe quelle courbe. C’est donc la forme qui décide de la durée.",
          "The quantity minimised is a time, not a length. By conservation of energy, the speed depends only on the depth reached: v = √(2gy), whatever the shape of the track. A bead dropping 5 m with g = 10 m/s² reaches 10 m/s, along a straight line or along any curve. It is the shape that decides the duration."),
        p("La durée d’un trajet est l’intégrale de ds/v le long de la courbe. Une pente initiale plus raide fait gagner de la vitesse plus tôt, au prix d’un trajet plus long : la meilleure piste est un compromis, qui prend un détour pour accélérer au début.",
          "The duration of a trip is the integral of ds/v along the curve. A steeper initial slope gains speed earlier, at the price of a longer path: the best track is a compromise, taking a detour to speed up at the start.") ] },
      { h: p("La cycloïde", "The cycloid"), p: [
        p("La cycloïde est la courbe tracée par un point d’un cercle qui roule sans glisser sur une droite. Retournée, elle est donnée par x = a(θ − sin θ), y = a(1 − cos θ), l’axe y étant dirigé vers le bas. Elle satisfait l’équation variationnelle du problème, et la durée du trajet jusqu’à l’angle θ vaut θ√(a/g).",
          "The cycloid is the curve traced by a point on a circle rolling without slipping along a line. Inverted, it is given by x = a(θ − sin θ), y = a(1 − cos θ), with the y axis pointing down. It satisfies the variational equation of the problem, and the travel time up to angle θ is θ√(a/g)."),
        p("Cette affirmation porte sur le modèle idéal, et non sur une bille réelle qui roule avec frottement. Sur le dessin, la cycloïde part verticalement, ce qui donne à la bille de la vitesse très tôt, et sa vitesse monte la première, avant celle de la droite.",
          "This statement concerns the ideal model, not a real rolling ball with friction. In the drawing, the cycloid leaves vertically, which gives the bead speed very early, and its speed rises first, ahead of that of the straight line.") ] },
      { h: p("Histoire", "History"), p: [
        p("Galilée considère en 1638 la descente le long d’un arc de cercle et la croit la plus rapide, ce qui est inexact. En juin 1696, Johann Bernoulli lance le défi aux mathématiciens de l’Europe dans les Acta Eruditorum. Des solutions parviennent de lui-même, de son frère Jakob, de Leibniz, de L’Hôpital et de Newton, qui répond de façon anonyme.",
          "In 1638 Galileo considered descent along a circular arc and believed it the fastest, which is incorrect. In June 1696 Johann Bernoulli issued the challenge to the mathematicians of Europe in the Acta Eruditorum. Solutions arrived from Bernoulli himself, from his brother Jakob, from Leibniz, from L’Hôpital and from Newton, who replied anonymously."),
        p("Johann Bernoulli résout le problème par une analogie avec l’optique : la lumière traversant des couches de vitesses différentes suit, d’après le principe de Fermat, le chemin de durée minimale, ce qui impose que sin α / v reste constant le long de la courbe, α étant l’angle de la tangente avec la verticale. Cette condition caractérise la cycloïde.",
          "Johann Bernoulli solved the problem by an analogy with optics: light crossing layers of different speeds follows, by Fermat’s principle, the path of least time, which forces sin α / v to stay constant along the curve, α being the angle of the tangent with the vertical. This condition characterises the cycloid.") ] },
      { h: p("Héritage", "Legacy"), p: [
        p("Le défi de 1696 contribue à la naissance du calcul des variations, où l’on choisit une courbe entière pour optimiser une quantité. Euler (1744) et Lagrange en donnent ensuite la méthode générale, l’équation d’Euler-Lagrange.",
          "The 1696 challenge helped give birth to the calculus of variations, in which an entire curve is chosen to optimise a quantity. Euler (1744) and Lagrange then gave the general method, the Euler-Lagrange equation."),
        p("La même manière de penser apparaît en optique et dans les principes variationnels de la mécanique, où les trajectoires réelles rendent extrémale une grandeur appelée action.",
          "The same way of thinking appears in optics and in the variational principles of mechanics, where real trajectories make a quantity called the action extremal.") ] },
    ],
  },
};
