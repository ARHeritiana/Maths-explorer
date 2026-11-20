// Batch 3 of the gallery articles (shape and rules: ../article.js). Written in the voice of an encyclopedia: third person,
// present tense, no instruction and no question addressed to the reader.
const p = (fr, en) => [fr, en];
export const BATCH3 = {
  "self-similar": {
    facts: [
      [p("Pionniers", "Pioneers"), p("Cantor (1883), Koch (1904), Sierpiński (1916), Menger (1926)", "Cantor (1883), Koch (1904), Sierpiński (1916), Menger (1926)")],
      [p("Terme « fractale »", "Term “fractal”"), p("Benoît Mandelbrot, 1975", "Benoît Mandelbrot, 1975")],
      [p("Domaine", "Field"), p("Géométrie, suites, dimension", "Geometry, sequences, dimension")],
      [p("Résultat clé", "Key result"), p("Dimension non entière : log N / log(1/r)", "Non-integer dimension: log N / log(1/r)")],
      [p("Exemple", "Example"), p("Éponge de Menger : volume 0, dimension ≈ 2,727", "Menger sponge: volume 0, dimension ≈ 2.727")],
    ],
    lead: [
      p("Une figure auto-similaire est composée de copies réduites d’elle-même. On la construit en répétant sans fin une règle simple (enlever, ajouter, recommencer) : chaque étape remplace les morceaux de la précédente par des morceaux plus petits. La figure limite, jamais atteinte à une étape finie, est appelée fractale depuis que Benoît Mandelbrot a forgé ce mot en 1975.",
        "A self-similar figure is made of reduced copies of itself. It is built by repeating a simple rule without end (remove, add, repeat): each stage replaces the pieces of the previous one by smaller pieces. The limit figure, never reached at any finite stage, has been called a fractal since Benoît Mandelbrot coined the word in 1975."),
    ],
    sections: [
      { h: p("Les constructions classiques", "The classical constructions"), p: [
        p("L’ensemble de Cantor, décrit par Georg Cantor en 1883, s’obtient en retirant à chaque étape le tiers central de chaque segment. La courbe de Koch, publiée par Helge von Koch en 1904, remplace le tiers central de chaque segment par deux segments formant une pointe ; c’est une courbe continue sans tangente en aucun point. Wacław Sierpiński présente son tapis en 1916 : on retire le carré central d’un carré partagé en neuf, puis on recommence dans chacun des huit carrés restants. Karl Menger construit son éponge en 1926 dans ses travaux sur la dimension : on retire, d’un cube partagé en 27 petits cubes, les 7 cubes du centre et du milieu des faces.",
          "The Cantor set, described by Georg Cantor in 1883, is obtained by removing at each stage the middle third of every segment. The Koch curve, published by Helge von Koch in 1904, replaces the middle third of each segment by two segments forming a peak; it is a continuous curve with no tangent at any point. Wacław Sierpiński presented his carpet in 1916: the central square of a square cut into nine is removed, then the process is repeated in each of the eight remaining squares. Karl Menger built his sponge in 1926 in his work on dimension: from a cube cut into 27 small cubes, the 7 cubes at the centre and at the middle of the faces are removed."),
      ] },
      { h: p("Compter les morceaux, mesurer la figure", "Counting pieces, measuring the figure"), p: [
        p("Dans l’éponge de Menger, chaque cube est remplacé par 20 cubes trois fois plus petits. À l’étape n il y a donc 20ⁿ cubes, chacun de volume (1/27)ⁿ : après deux étapes, 400 cubes de côté 1/9. Le volume conservé est (20/27)ⁿ, une suite géométrique de raison inférieure à 1 qui tend vers 0 (400/729 ≈ 0,549 à l’étape 2). Le nombre de morceaux croît, mais moins vite que leur taille ne diminue. L’éponge limite a un volume nul sans être vide : elle contient, par exemple, toutes les arêtes du cube de départ.",
          "In the Menger sponge each cube is replaced by 20 cubes three times smaller. At stage n there are thus 20ⁿ cubes, each of volume (1/27)ⁿ: after two stages, 400 cubes of side 1/9. The volume kept is (20/27)ⁿ, a geometric sequence with ratio below 1 that tends to 0 (400/729 ≈ 0.549 at stage 2). The number of pieces grows, but more slowly than their size shrinks. The limit sponge has zero volume without being empty: it contains, for example, every edge of the original cube."),
        p("La courbe de Koch montre l’effet inverse : son périmètre est multiplié par 4/3 à chaque étape et tend vers l’infini, alors que l’aire du flocon reste bornée. La figure limite peut donc avoir une longueur infinie dans une région finie, ou un volume nul tout en contenant une infinité de points.",
          "The Koch curve shows the opposite effect: its perimeter is multiplied by 4/3 at each stage and tends to infinity, while the area of the snowflake stays bounded. The limit figure can thus have an infinite length inside a finite region, or zero volume while containing infinitely many points."),
      ] },
      { h: p("Une dimension qui n’est pas entière", "A dimension that is not a whole number"), p: [
        p("Quand une figure se compose de N copies de rapport de réduction r, sa dimension D vérifie N = (1/r)^D, soit D = log N / log(1/r). Le segment (N = 3, r = 1/3) donne 1, le carré (N = 9, r = 1/3) donne 2. L’ensemble de Cantor (N = 2, r = 1/3) a pour dimension log 2 / log 3 ≈ 0,631, la courbe de Koch (N = 4, r = 1/3) log 4 / log 3 ≈ 1,262, le triangle de Sierpiński (N = 3, r = 1/2) log 3 / log 2 ≈ 1,585, le tapis (N = 8, r = 1/3) log 8 / log 3 ≈ 1,893 et l’éponge de Menger log 20 / log 3 ≈ 2,727.",
          "When a figure consists of N copies at reduction ratio r, its dimension D satisfies N = (1/r)^D, that is D = log N / log(1/r). The segment (N = 3, r = 1/3) gives 1, the square (N = 9, r = 1/3) gives 2. The Cantor set (N = 2, r = 1/3) has dimension log 2 / log 3 ≈ 0.631, the Koch curve (N = 4, r = 1/3) log 4 / log 3 ≈ 1.262, the Sierpiński triangle (N = 3, r = 1/2) log 3 / log 2 ≈ 1.585, the carpet (N = 8, r = 1/3) log 8 / log 3 ≈ 1.893 and the Menger sponge log 20 / log 3 ≈ 2.727."),
        p("Ces valeurs sont celles de la figure limite : le théorème de Moran et Hutchinson assure que c’est la dimension de Hausdorff lorsque les copies ne se chevauchent pas, ce qui est le cas ici. Une étape finie n’en donne qu’une approximation.",
          "These values are those of the limit figure: the theorem of Moran and Hutchinson makes it the Hausdorff dimension when the copies do not overlap, as is the case here. A finite stage only gives an approximation of it."),
      ] },
      { h: p("Autres exemples", "Other examples"), p: [
        p("Le tétraèdre de Sierpiński garde 4 copies de moitié taille : son volume à l’étape 5 est 1/32 du volume de départ et sa dimension vaut log 4 / log 2 = 2. Le produit de trois ensembles de Cantor a un volume (8/27)ⁿ qui tend vers 0 et une dimension log 8 / log 3 ≈ 1,893, inférieure à 2 bien que l’objet soit dans l’espace.",
          "The Sierpiński tetrahedron keeps 4 half-size copies: its volume at stage 5 is 1/32 of the starting volume and its dimension is log 4 / log 2 = 2. The product of three Cantor sets has a volume (8/27)ⁿ that tends to 0 and a dimension log 8 / log 3 ≈ 1.893, below 2 although the object lies in space."),
        p("Certaines fractales relèvent de transformations affines, qui écrasent davantage dans une direction que dans l’autre. C’est le cas de la fougère engendrée par quatre transformations (réduire, tourner, incliner) : il n’y a plus de rapport unique r ni de formule log N / log(1/r), et la somme des aires des morceaux est au plus 0,9367ⁿ, donc la fougère limite a une aire nulle. La courbe du dragon, à la limite, remplit une région d’aire non nulle (D = log 2 / log √2 = 2), tandis que la dimension de sa frontière, environ 1,5236, est une valeur calculée et publiée.",
          "Some fractals come from affine transformations, which squash more in one direction than in the other. This is the case of the fern generated by four transformations (shrink, turn, tilt): there is no single ratio r and no formula log N / log(1/r), and the sum of the areas of the pieces is at most 0.9367ⁿ, so the limit fern has zero area. The dragon curve, in the limit, fills a region of non-zero area (D = log 2 / log √2 = 2), while the dimension of its boundary, about 1.5236, is a computed and published value."),
      ] },
      { h: p("Courbes qui remplissent le plan", "Space-filling curves"), p: [
        p("Giuseppe Peano publie en 1890 la première courbe qui remplit un carré, et David Hilbert en donne une autre en 1891. À l’étape n, la courbe de Hilbert passe par le centre de chacune des 4ⁿ cases ; les étapes se rapprochent les unes des autres et convergent vers une courbe continue qui passe par tous les points du carré. Chaque étape finie n’a pas d’aire : c’est la limite qui remplit le carré. Celle de Peano relie 9ⁿ centres de cases distants de 1/3ⁿ, avec une longueur (9ⁿ − 1)/3ⁿ presque multipliée par 3 à chaque étape.",
          "Giuseppe Peano published in 1890 the first curve that fills a square, and David Hilbert gave another in 1891. At stage n, the Hilbert curve passes through the centre of each of the 4ⁿ cells; the stages come closer and closer and converge to a continuous curve that passes through every point of the square. No finite stage has an area: it is the limit that fills the square. Peano’s curve joins 9ⁿ cell centres a distance 1/3ⁿ apart, with a length (9ⁿ − 1)/3ⁿ almost multiplied by 3 at each stage."),
      ] },
      { h: p("Prolongements", "Later developments"), p: [
        p("Les systèmes de fonctions itérées décrivent de façon compacte les formes auto-similaires par la liste des transformations qui produisent les copies. Ces figures relient géométrie, suites géométriques et probabilités : elles montrent aussi que « aléatoire » et « sans structure » ne sont pas synonymes. Elles sont liées à l’ensemble de Mandelbrot et à la théorie du chaos.",
          "Iterated function systems describe self-similar shapes compactly by the list of transformations that produce the copies. These figures connect geometry, geometric sequences and probability: they also show that “random” and “unstructured” are not synonyms. They are linked to the Mandelbrot set and to chaos theory."),
      ] },
    ],
  },

  polyhedra: {
    facts: [
      [p("Origine", "Origin"), p("Archimède (texte perdu, d’après Pappus) ; Kepler, 1619", "Archimedes (text lost, according to Pappus); Kepler, 1619")],
      [p("Domaine", "Field"), p("Géométrie des polyèdres", "Geometry of polyhedra")],
      [p("Opération", "Operation"), p("Troncature des sommets d’un solide de Platon", "Truncation of the vertices of a Platonic solid")],
      [p("Invariant", "Invariant"), p("V − E + F = 2 (Euler)", "V − E + F = 2 (Euler)")],
      [p("Exemple", "Example"), p("Icosaèdre tronqué : 60 sommets, 90 arêtes, 32 faces", "Truncated icosahedron: 60 vertices, 90 edges, 32 faces")],
    ],
    lead: [
      p("Tronquer un polyèdre consiste à couper ses sommets par des plans. En partant d’un solide de Platon et en coupant ses coins de plus en plus profondément, on obtient une suite de solides à faces régulières, dont plusieurs figurent parmi les treize solides d’Archimède, jusqu’à un autre solide de Platon, le dual du premier.",
        "To truncate a polyhedron is to cut off its vertices with planes. Starting from a Platonic solid and cutting its corners deeper and deeper gives a sequence of solids with regular faces, several of which are among the thirteen Archimedean solids, up to another Platonic solid, the dual of the first."),
    ],
    sections: [
      { h: p("Couper les coins d’un cube", "Cutting the corners of a cube"), p: [
        p("Les huit coins d’un cube sont coupés par des plans perpendiculaires aux directions des sommets. Peu profondément, la coupe donne le cube tronqué : 8 triangles et 6 octogones. En continuant, les 6 faces du cube deviennent des carrés de plus en plus petits et les octogones se transforment en carrés ; lorsque les plans passent par les milieux des arêtes, on obtient le cuboctaèdre (8 triangles, 6 carrés). Plus profond encore, vient l’octaèdre tronqué (6 carrés, 8 hexagones).",
          "The eight corners of a cube are cut by planes perpendicular to the directions of the vertices. Shallow cuts give the truncated cube: 8 triangles and 6 octagons. Going on, the 6 faces of the cube become smaller and smaller squares and the octagons turn into squares; when the planes pass through the midpoints of the edges, the cuboctahedron is obtained (8 triangles, 6 squares). Deeper still comes the truncated octahedron (6 squares, 8 hexagons)."),
        p("Si la coupe va jusqu’au bout, il ne reste pas un petit cube mais un octaèdre. Les plans de coupe sont ceux des 8 faces d’un octaèdre ; quand ils sont assez profonds, chacune des 6 faces du cube ne touche plus le solide qu’en un point : les 6 faces sont devenues 6 sommets et les 8 sommets sont devenus 8 faces.",
          "If the cutting goes all the way, what is left is not a smaller cube but an octahedron. The cutting planes are those of the 8 faces of an octahedron; once they are deep enough, each of the 6 faces of the cube touches the solid at a single point: the 6 faces have become 6 vertices and the 8 vertices have become 8 faces."),
      ] },
      { h: p("Dualité", "Duality"), p: [
        p("La dualité échange sommets et faces et conserve le nombre d’arêtes : le cube a pour dual l’octaèdre, le dodécaèdre l’icosaèdre, et le tétraèdre est son propre dual. La troncature d’un solide, poussée jusqu’au point où les coupes se rejoignent, aboutit à son dual ; les solides intermédiaires partagent la symétrie des deux.",
          "Duality swaps vertices and faces and keeps the number of edges: the cube has the octahedron as dual, the dodecahedron has the icosahedron, and the tetrahedron is its own dual. Truncating a solid, pushed until the cuts meet, ends at its dual; the intermediate solids share the symmetry of both."),
      ] },
      { h: p("Compter : la relation d’Euler", "Counting: Euler’s relation"), p: [
        p("Pour chaque solide convexe de la suite, le nombre de sommets V, d’arêtes E et de faces F vérifie V − E + F = 2. Pour l’icosaèdre tronqué, utilisé pour les ballons de football, les 12 sommets de l’icosaèdre sont chacun coupés et deviennent un pentagone de 5 sommets : V = 12 × 5 = 60. On le vérifie autrement : 12 pentagones et 20 hexagones ont 12 × 5 + 20 × 6 = 180 côtés ; chaque arête est partagée par deux faces, donc E = 90 ; chaque sommet touche 3 faces, donc V = 180 / 3 = 60 ; et 60 − 90 + 32 = 2.",
          "For every convex solid of the sequence, the number of vertices V, edges E and faces F satisfies V − E + F = 2. For the truncated icosahedron, the shape of a football, the 12 vertices of the icosahedron are each cut off and become a pentagon with 5 vertices: V = 12 × 5 = 60. A second check: 12 pentagons and 20 hexagons have 12 × 5 + 20 × 6 = 180 sides; each edge is shared by two faces, so E = 90; each vertex touches 3 faces, so V = 180 / 3 = 60; and 60 − 90 + 32 = 2."),
        p("Le dodécaèdre tronqué, obtenu en coupant les 20 sommets du dodécaèdre, a de même 60 sommets, 90 arêtes et 32 faces (20 triangles et 12 décagones).",
          "The truncated dodecahedron, obtained by cutting the 20 vertices of the dodecahedron, likewise has 60 vertices, 90 edges and 32 faces (20 triangles and 12 decagons)."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Archimède a décrit treize solides à faces régulières, d’après Pappus ; son texte est perdu. Kepler les a retrouvés et dessinés dans Harmonices Mundi (1619), où il nomme aussi le cuboctaèdre et l’icosidodécaèdre. Ces treize solides ont chacun des sommets tous semblables et des faces régulières de deux sortes au moins, sans être des solides de Platon.",
          "Archimedes described thirteen solids with regular faces, according to Pappus; his text is lost. Kepler rediscovered and drew them in Harmonices Mundi (1619), where he also named the cuboctahedron and the icosidodecahedron. Each of these thirteen solids has all its vertices alike and regular faces of at least two kinds, without being Platonic solids."),
      ] },
      { h: p("Prolongements", "Later developments"), p: [
        p("La même construction, étendue à tous les points de coupe, est systématisée par la construction de Wythoff, qui engendre les solides d’Archimède à partir de miroirs. La forme de l’icosaèdre tronqué se retrouve dans la molécule de fullerène C60 (1985), dont les 60 atomes occupent les sommets.",
          "The same construction, extended to all the cutting positions, is made systematic by Wythoff’s construction, which generates the Archimedean solids from mirrors. The shape of the truncated icosahedron reappears in the C60 fullerene molecule (1985), whose 60 atoms occupy the vertices."),
      ] },
    ],
  },

  viviani: {
    facts: [
      [p("Auteur", "Author"), p("Vincenzo Viviani (1622-1703), élève de Galilée", "Vincenzo Viviani (1622-1703), a pupil of Galileo")],
      [p("Époque", "Period"), p("XVIIe siècle", "17th century")],
      [p("Domaine", "Field"), p("Géométrie du triangle", "Triangle geometry")],
      [p("Énoncé", "Statement"), p("Dans un triangle équilatéral, la somme des distances d’un point intérieur aux trois côtés est constante", "In an equilateral triangle, the sum of the distances from an inside point to the three sides is constant")],
      [p("Valeur", "Value"), p("Égale à la hauteur du triangle", "Equal to the height of the triangle")],
    ],
    lead: [
      p("Le théorème de Viviani affirme que, dans un triangle équilatéral, la somme des distances d’un point intérieur aux trois côtés ne dépend pas du point : elle est égale à la hauteur du triangle. Le résultat porte le nom de Vincenzo Viviani, élève de Galilée, qui l’a énoncé au XVIIe siècle.",
        "Viviani’s theorem states that, in an equilateral triangle, the sum of the distances from an inside point to the three sides does not depend on the point: it equals the height of the triangle. The result is named after Vincenzo Viviani, a pupil of Galileo, who stated it in the 17th century."),
    ],
    sections: [
      { h: p("L’énoncé", "The statement"), p: [
        p("Soit un triangle équilatéral de côté a et de hauteur h = a√3/2, et un point P à l’intérieur, à des distances d₁, d₂, d₃ des trois côtés. Alors d₁ + d₂ + d₃ = h, que P soit au centre, contre un côté ou tout près d’un sommet. Si P est sur un côté, la distance à ce côté est nulle et les deux autres distances s’additionnent encore à h ; si P est au sommet, deux distances sont nulles et la troisième vaut h.",
          "Let an equilateral triangle have side a and height h = a√3/2, and let P be an inside point at distances d₁, d₂, d₃ from the three sides. Then d₁ + d₂ + d₃ = h, whether P is at the centre, against a side or very near a vertex. If P lies on a side, the distance to that side is zero and the other two still add up to h; if P is at a vertex, two distances are zero and the third equals h."),
        p("Pour un triangle de côté 6, la hauteur vaut 3√3 ≈ 5,196. Si P est à la distance 1 d’un côté et 2 d’un autre, sa distance au troisième est 3√3 − 1 − 2 ≈ 2,20.",
          "For a triangle of side 6, the height is 3√3 ≈ 5.196. If P is at distance 1 from one side and 2 from another, its distance to the third is 3√3 − 1 − 2 ≈ 2.20."),
      ] },
      { h: p("La preuve par les aires", "The proof by areas"), p: [
        p("En reliant P aux trois sommets, on coupe le triangle en trois triangles. Ils ont pour bases les côtés, tous de longueur a, et pour hauteurs d₁, d₂, d₃. Leurs aires a·d₁/2, a·d₂/2 et a·d₃/2 ont pour somme l’aire totale a·h/2. En divisant par a/2, il reste d₁ + d₂ + d₃ = h. La preuve tient en une ligne, mais elle cache une idée qui sert partout en géométrie : découper une figure pour comparer des aires.",
          "Joining P to the three vertices cuts the triangle into three triangles. Their bases are the sides, all of length a, and their heights are d₁, d₂, d₃. Their areas a·d₁/2, a·d₂/2 and a·d₃/2 add up to the whole area a·h/2. Dividing by a/2 leaves d₁ + d₂ + d₃ = h. The proof fits in one line, but it hides an idea used everywhere in geometry: cut a figure up to compare areas."),
      ] },
      { h: p("Triangles quelconques", "Arbitrary triangles"), p: [
        p("Dans un triangle quelconque de côtés a, b, c, le même découpage donne a·d₁ + b·d₂ + c·d₃ = 2 × aire. On ne peut diviser par un même nombre que si a = b = c, c’est pourquoi la somme des distances n’est constante que pour le triangle équilatéral. Dans un triangle quelconque, la somme vaut la hauteur issue de A quand P est en A, et une autre hauteur quand P est en B : elle change avec le point.",
          "In an arbitrary triangle with sides a, b, c, the same cutting gives a·d₁ + b·d₂ + c·d₃ = 2 × area. One can divide by a single number only if a = b = c, which is why the sum of the distances is constant only for the equilateral triangle. In an arbitrary triangle, the sum equals the height from A when P is at A, and another height when P is at B: it changes with the point."),
      ] },
      { h: p("Variantes", "Variants"), p: [
        p("Dans un carré de côté 4, la somme des distances d’un point intérieur aux quatre côtés vaut toujours 8 : deux côtés opposés donnent chacun une somme 4. Plus généralement, la somme est constante dans tout polygone régulier, et dans tout polygone dont les angles sont égaux. Si le point sort du triangle équilatéral, la propriété subsiste en comptant négativement les distances aux côtés qu’il a franchis.",
          "In a square of side 4, the sum of the distances from an inside point to the four sides is always 8: two opposite sides each give a sum of 4. More generally, the sum is constant in every regular polygon, and in every polygon with equal angles. If the point leaves the equilateral triangle, the property still holds when the distances to the sides it has crossed are counted negatively."),
        p("Dans l’espace, le tétraèdre régulier a la propriété analogue : la somme des distances d’un point intérieur aux quatre faces est constante, par un découpage en quatre pyramides de même base.",
          "In space, the regular tetrahedron has the analogous property: the sum of the distances from an inside point to the four faces is constant, by cutting into four pyramids with the same base."),
      ] },
    ],
  },

  dandelin: {
    facts: [
      [p("Auteur", "Author"), p("Germinal Pierre Dandelin, mathématicien belge", "Germinal Pierre Dandelin, Belgian mathematician")],
      [p("Date", "Date"), p("1822", "1822")],
      [p("Domaine", "Field"), p("Coniques, géométrie dans l’espace", "Conics, solid geometry")],
      [p("Résultat", "Result"), p("Les foyers d’une ellipse sont les points de contact de deux sphères tangentes au cône et au plan", "The foci of an ellipse are the contact points of two spheres tangent to the cone and the plane")],
      [p("Propriété", "Property"), p("PF₁ + PF₂ constante", "PF₁ + PF₂ constant")],
    ],
    lead: [
      p("Les sphères de Dandelin sont deux sphères placées dans un cône, de part et d’autre d’un plan qui le coupe, tangentes au cône et au plan. Leurs points de contact avec le plan sont les foyers de la section, ce qui prouve que la section d’un cône par un plan est bien une ellipse au sens de la propriété des foyers. Germinal Pierre Dandelin, mathématicien belge, publie cette preuve en 1822.",
        "Dandelin’s spheres are two spheres placed in a cone, on either side of a plane that cuts it, tangent to the cone and to the plane. Their points of contact with the plane are the foci of the section, which proves that the section of a cone by a plane is indeed an ellipse in the sense of the focal property. Germinal Pierre Dandelin, a Belgian mathematician, published this proof in 1822."),
    ],
    sections: [
      { h: p("Deux définitions de l’ellipse", "Two definitions of the ellipse"), p: [
        p("Les Grecs, avec Apollonius, étudient les coniques comme sections d’un cône par un plan. Par ailleurs, l’ellipse se définit dans le plan : c’est l’ensemble des points P dont la somme des distances à deux points fixes, les foyers F₁ et F₂, est constante. Cette définition est celle du jardinier : deux punaises, une ficelle attachée aux deux, un crayon qui la tend.",
          "The Greeks, with Apollonius, studied conics as sections of a cone by a plane. Separately, the ellipse is defined in the plane: it is the set of points P for which the sum of the distances to two fixed points, the foci F₁ and F₂, is constant. This is the gardener’s definition: two pins, a string tied to both, a pencil keeping it tight."),
        p("Pour deux punaises distantes de 6 cm et une ficelle de 10 cm, on a PF₁ + PF₂ = 10. Le grand axe vaut 10, donc a = 5, et les punaises sont à c = 3 du centre. Au sommet de la petite largeur, PF₁ = PF₂ = 5, et le théorème de Pythagore donne b = √(5² − 3²) = 4 cm. La question que Dandelin résout est de savoir pourquoi ces deux définitions décrivent la même courbe.",
          "For two pins 6 cm apart and a 10 cm string, PF₁ + PF₂ = 10. The major axis is 10, so a = 5, and the pins are c = 3 from the centre. At the end of the short width, PF₁ = PF₂ = 5, and Pythagoras gives b = √(5² − 3²) = 4 cm. The question Dandelin settles is why these two definitions describe the same curve."),
      ] },
      { h: p("La preuve de Dandelin", "Dandelin’s proof"), p: [
        p("Soit un cône coupé par un plan incliné qui ne rencontre qu’une nappe. On glisse dans le cône une sphère au-dessus du plan et une autre en dessous, jusqu’à ce qu’elles touchent le plan, aux points F₁ et F₂, et le cône, le long de deux cercles. Pour un point P de la section, la génératrice du cône qui passe par P coupe ces deux cercles en T₁ et T₂.",
          "Take a cone cut by a tilted plane that meets only one nappe. One sphere is slid into the cone above the plane and another below it, until they touch the plane at the points F₁ and F₂ and the cone along two circles. For a point P of the section, the generator of the cone through P meets these two circles at T₁ and T₂."),
        p("Les deux tangentes menées d’un point à une sphère ont la même longueur : PF₁ = PT₁ et PF₂ = PT₂. Donc PF₁ + PF₂ = PT₁ + PT₂ = T₁T₂, la portion de génératrice entre les deux cercles de contact. Cette longueur est la même pour toutes les génératrices, donc la somme est constante sur toute la section : c’est une ellipse de foyers F₁ et F₂. Elle change quand on incline le plan, mais reste la même pour tous les points d’une même ellipse.",
          "The two tangents from a point to a sphere have the same length: PF₁ = PT₁ and PF₂ = PT₂. Hence PF₁ + PF₂ = PT₁ + PT₂ = T₁T₂, the piece of generator between the two circles of contact. This length is the same on every generator, so the sum is constant over the whole section: it is an ellipse with foci F₁ and F₂. The sum changes when the plane is tilted, but stays the same for all points of one ellipse."),
      ] },
      { h: p("Parabole et hyperbole", "Parabola and hyperbola"), p: [
        p("Si le plan est parallèle à une génératrice, la section est une parabole et il ne reste qu’une sphère. Le foyer est alors son point de contact avec le plan, et la directrice la droite où le plan coupe le plan du cercle de contact. Si le plan coupe les deux nappes, la section est une hyperbole : une sphère se place dans chaque nappe, et c’est la différence des distances aux foyers qui est constante.",
          "If the plane is parallel to a generator, the section is a parabola and only one sphere remains. The focus is then its point of contact with the plane, and the directrix is the line where the plane meets the plane of the circle of contact. If the plane cuts both nappes, the section is a hyperbola: one sphere sits in each nappe, and it is the difference of the distances to the foci that is constant."),
      ] },
      { h: p("Importance", "Significance"), p: [
        p("Les sphères montrent d’un coup pourquoi la section d’un cône a la propriété des foyers, sans calcul de coordonnées. L’ellipse intervient en astronomie : en 1609, Kepler établit que les planètes décrivent des ellipses dont le Soleil occupe un foyer. Une autre propriété des foyers sert en optique et en acoustique : un rayon issu d’un foyer se réfléchit sur l’ellipse vers l’autre foyer.",
          "The spheres show at once why the section of a cone has the focal property, without any coordinate computation. The ellipse plays a role in astronomy: in 1609 Kepler established that the planets move on ellipses with the Sun at one focus. Another focal property serves in optics and acoustics: a ray from one focus reflects off the ellipse towards the other focus."),
      ] },
    ],
  },

  cavalieri: {
    facts: [
      [p("Auteur", "Author"), p("Bonaventura Cavalieri, élève de Galilée", "Bonaventura Cavalieri, a pupil of Galileo")],
      [p("Date", "Date"), p("1635 (méthode des indivisibles)", "1635 (method of indivisibles)")],
      [p("Domaine", "Field"), p("Aires et volumes", "Areas and volumes")],
      [p("Énoncé", "Statement"), p("Deux solides de même hauteur dont les sections ont même aire à toutes les hauteurs ont même volume", "Two solids of the same height whose sections have the same area at every height have the same volume")],
      [p("Antécédent", "Precursor"), p("Archimède, volume de la boule (IIIe siècle av. J.-C.)", "Archimedes, volume of the ball (3rd century BC)")],
    ],
    lead: [
      p("Le principe de Cavalieri compare deux solides tranche par tranche : si, à toute hauteur, leurs sections par un plan horizontal ont la même aire, alors ils ont le même volume. Bonaventura Cavalieri, élève de Galilée, publie en 1635 sa méthode des « indivisibles », dont ce principe est l’expression la plus utilisée dans l’enseignement.",
        "Cavalieri’s principle compares two solids slice by slice: if, at every height, their sections by a horizontal plane have the same area, then they have the same volume. Bonaventura Cavalieri, a pupil of Galileo, published in 1635 his method of “indivisibles”, of which this principle is the form most used in teaching."),
    ],
    sections: [
      { h: p("Le principe", "The principle"), p: [
        p("Le principe se comprend d’abord sur une pile de cartes. Quand on la pousse de côté, sa forme change, mais chaque carte garde son aire et la hauteur ne varie pas : le volume reste le même. Le principe affirme que cette conservation tient pour deux solides de formes très différentes, du moment que leurs sections se correspondent en aire à chaque hauteur. Son analogue plan compare deux figures dont les cordes parallèles ont mêmes longueurs.",
          "The principle is first understood on a stack of cards. When it is pushed sideways its shape changes, but each card keeps its area and the height does not vary: the volume stays the same. The principle states that this conservation holds for two solids of very different shapes, as long as their sections match in area at every height. Its plane analogue compares two figures whose parallel chords have equal lengths."),
      ] },
      { h: p("La demi-boule et le cylindre creusé", "The hemisphere and the hollowed cylinder"), p: [
        p("Une demi-boule de rayon R et un cylindre de rayon R et de hauteur R creusé d’un cône de même base, sommet en bas, ne se ressemblent pas. À la hauteur z, la section de la demi-boule est un disque de rayon √(R² − z²), par le théorème de Pythagore : son aire est π(R² − z²). Celle du cylindre creusé est une couronne : le disque entier πR², moins le disque du cône, de rayon z à la hauteur z, soit πz². L’aire vaut πR² − πz², la même fonction de z.",
          "A hemisphere of radius R and a cylinder of radius R and height R with a cone of the same base dug out, apex at the bottom, do not look alike. At height z, the section of the hemisphere is a disc of radius √(R² − z²), by Pythagoras: its area is π(R² − z²). The section of the hollowed cylinder is a ring: the full disc πR², minus the disc of the cone, of radius z at height z, that is πz². The area is πR² − πz², the same function of z."),
        p("Le volume de la demi-boule est donc celui du cylindre moins celui du cône : πR³ − πR³/3 = 2πR³/3, et celui de la boule entière 4πR³/3. Pour R = 3, cela donne 27π − 9π = 18π. Comparer quelques hauteurs ne suffirait pas : c’est l’égalité pour tout z qui compte.",
          "The volume of the hemisphere is therefore that of the cylinder minus that of the cone: πR³ − πR³/3 = 2πR³/3, and that of the whole ball 4πR³/3. For R = 3 this gives 27π − 9π = 18π. Comparing a few heights would not be enough: it is the equality for every z that counts."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Archimède connaissait déjà le volume de la boule, qu’il tenait pour sa plus belle découverte : il fit graver une sphère dans un cylindre sur sa tombe. Cavalieri généralise l’idée de couper en tranches, et le calcul intégral donne plus tard un fondement solide à ces tranches : le principe revient à V = ∫ S(z) dz avec la même fonction S pour les deux solides. En Chine, Zu Chongzhi et son fils Zu Gengzhi (Ve siècle) avaient employé un argument de même nature.",
          "Archimedes already knew the volume of the ball, which he held as his finest discovery: he had a sphere in a cylinder carved on his tomb. Cavalieri generalises the idea of cutting into slices, and integral calculus later gave these slices a solid foundation: the principle amounts to V = ∫ S(z) dz with the same function S for both solids. In China, Zu Chongzhi and his son Zu Gengzhi (5th century) had used an argument of the same kind."),
      ] },
      { h: p("Autres applications", "Other applications"), p: [
        p("Le principe donne le volume du cône et de la pyramide (un tiers de la base par la hauteur) en comparant des pyramides de même base et de même hauteur. Il donne aussi le volume de l’anneau de serviette : une boule de rayon R percée d’un trou cylindrique laisse un anneau de hauteur h dont les sections ont la même aire que celles d’une boule de diamètre h. Son volume vaut πh³/6, indépendamment de R.",
          "The principle gives the volume of the cone and of the pyramid (one third of the base times the height) by comparing pyramids with the same base and the same height. It also gives the volume of the napkin ring: a ball of radius R drilled through by a cylindrical hole leaves a ring of height h whose sections have the same area as those of a ball of diameter h. Its volume is πh³/6, independent of R."),
      ] },
    ],
  },

  rupert: {
    facts: [
      [p("Origine", "Origin"), p("Prince Rupert du Rhin, XVIIe siècle ; John Wallis", "Prince Rupert of the Rhine, 17th century; John Wallis")],
      [p("Domaine", "Field"), p("Géométrie des polyèdres convexes", "Geometry of convex polyhedra")],
      [p("Cube", "Cube"), p("Plus grand cube passant : côté 3√2/4 (Nieuwland, XVIIIe siècle)", "Largest cube that passes: side 3√2/4 (Nieuwland, 18th century)")],
      [p("Question ouverte (2017)", "Open question (2017)"), p("Tout polyèdre convexe est-il « de Rupert » ? Jerrard, Wetzel, Yuan", "Is every convex polyhedron “Rupert”? Jerrard, Wetzel, Yuan")],
      [p("Statut", "Status"), p("Réponse négative : Noperthèdre (Steininger et Yurkevich, 2025, preuve assistée par ordinateur)", "Answered in the negative: Noperthedron (Steininger and Yurkevich, 2025, computer-assisted proof)")],
    ],
    lead: [
      p("Le problème du prince Rupert demande si un solide peut traverser un tunnel droit percé dans une copie identique de lui-même, sans que celle-ci se brise en deux. On dit qu’un polyèdre a la propriété de Rupert lorsque c’est possible. La réponse est affirmative pour le cube, ce qui est contre-intuitif, et négative pour au moins un polyèdre convexe, le Noperthèdre, d’après un résultat de 2025.",
        "Prince Rupert’s problem asks whether a solid can pass through a straight tunnel drilled in an identical copy of itself, without that copy breaking in two. A polyhedron is said to have the Rupert property when this is possible. The answer is yes for the cube, which is counter-intuitive, and no for at least one convex polyhedron, the Noperthedron, according to a result of 2025."),
    ],
    sections: [
      { h: p("Le problème", "The problem"), p: [
        p("Le prince Rupert du Rhin aurait parié qu’un cube pouvait passer par un trou percé dans un cube de même taille. John Wallis montre que c’est possible. Un cube passe par un trou de même section quand, regardé dans une direction convenable, l’ombre de la pièce qui traverse tient à l’intérieur de l’ombre du bloc, avec de la place sur tout le pourtour : tout se joue dans le plan.",
          "Prince Rupert of the Rhine is said to have bet that a cube could pass through a hole drilled in a cube of the same size. John Wallis showed that it is possible. A cube passes through a hole of the same section when, seen from a suitable direction, the shadow of the passing piece fits inside the shadow of the block, with room all round: everything happens in the plane."),
      ] },
      { h: p("Le calcul dans le plan", "The computation in the plane"), p: [
        p("Un exemple élémentaire éclaire la méthode : un carré de côté 1 tourné de 45° a ses sommets sur les axes, à la distance √2/2 du centre, et ses côtés sont les droites |x| + |y| = √2/2. Un carré droit de demi-côté h y tient si 2h ≤ √2/2, soit un côté √2/2 ≈ 0,71. On teste de même chaque côté de l’ombre du bloc.",
          "An elementary example shows the method: a square of side 1 turned by 45° has its vertices on the axes, at distance √2/2 from the centre, and its sides are the lines |x| + |y| = √2/2. An upright square of half-side h fits if 2h ≤ √2/2, that is a side √2/2 ≈ 0.71. Each side of the block’s shadow is tested in the same way."),
        p("L’ombre du cube de côté 1 regardé selon une grande diagonale est un hexagone régulier de côté √(2/3). Un carré de côté √6 − √2 ≈ 1,035, donc plus grand que 1, tient dans cet hexagone : un cube de côté 1 passe par un tunnel qui lui est plus petit en section que le bloc. Pieter Nieuwland trouve au XVIIIe siècle le plus grand cube qui passe, de côté 3√2/4 ≈ 1,061.",
          "The shadow of the unit cube seen along a long diagonal is a regular hexagon of side √(2/3). A square of side √6 − √2 ≈ 1.035, hence larger than 1, fits in this hexagon: a cube of side 1 passes through a tunnel in a block of the same size. Pieter Nieuwland found in the 18th century the largest cube that passes, of side 3√2/4 ≈ 1.061."),
      ] },
      { h: p("Autres solides", "Other solids"), p: [
        p("Les cinq solides de Platon ont la propriété de Rupert, avec des passages vérifiés par le calcul. Une boule ne l’a pas : toutes ses ombres sont des disques de même rayon, et aucun ne tient dans un autre avec de la place. Une recherche numérique qui ne trouve aucun passage ne prouve rien : la preuve d’une absence de passage doit couvrir toutes les positions possibles.",
          "The five Platonic solids have the Rupert property, with passages checked by computation. A ball does not: all its shadows are discs of the same radius, and none fits inside another with room. A numerical search that finds no passage proves nothing: proof that no passage exists must cover every possible position."),
      ] },
      { h: p("Histoire récente", "Recent history"), p: [
        p("En 2017, Jerrard, Wetzel et Yuan demandent si tout polyèdre convexe a la propriété de Rupert. En 2025, Steininger et Yurkevich répondent non avec le Noperthèdre, au moyen d’une preuve assistée par ordinateur. En 2026 sont annoncés deux autres polyèdres convexes sans la propriété de Rupert : le Septopert, à 7 sommets, le minimum possible puisque tout polyèdre convexe à 6 sommets ou moins a la propriété (Tom Murphy, avec une vérification formelle en Lean), et le petit rhombicosidodécaèdre, solide d’Archimède à 60 sommets (Hervay, preuve assistée par ordinateur), ce qui confirme une conjecture de 2023. Ces deux résultats sont très récents ; l’exposition ne prouve rien à elle seule : sa recherche de passage ne dépasse pas le rapport 1 pour le rhombicosidodécaèdre.",
          "In 2017 Jerrard, Wetzel and Yuan asked whether every convex polyhedron has the Rupert property. In 2025 Steininger and Yurkevich answered no with the Noperthedron, by means of a computer-assisted proof. In 2026 two further convex polyhedra without the Rupert property were announced: the Septopert, with 7 vertices, the smallest possible since every convex polyhedron with 6 vertices or fewer has the property (Tom Murphy, with a formal verification in Lean), and the small rhombicosidodecahedron, an Archimedean solid with 60 vertices (Hervay, a computer-assisted proof), confirming a conjecture of 2023. Both results are very recent; the exhibit proves nothing on its own: its search for a passage never exceeds ratio 1 for the rhombicosidodecahedron."),
      ] },
    ],
  },

  "star-polyhedra": {
    facts: [
      [p("Auteurs", "Authors"), p("Kepler (1619), Poinsot (1809), Cauchy (1813)", "Kepler (1619), Poinsot (1809), Cauchy (1813)")],
      [p("Domaine", "Field"), p("Polyèdres réguliers, stellation", "Regular polyhedra, stellation")],
      [p("Nombre", "Number"), p("Quatre polyèdres réguliers étoilés", "Four regular star polyhedra")],
      [p("Résultat clé", "Key result"), p("Cauchy : il n’y en a pas d’autre", "Cauchy: there are no others")],
      [p("Particularité", "Peculiarity"), p("V − E + F peut valoir −6, non 2", "V − E + F can be −6 rather than 2")],
    ],
    lead: [
      p("Les solides de Kepler et Poinsot sont les quatre polyèdres réguliers non convexes : le petit dodécaèdre étoilé, le grand dodécaèdre, le grand dodécaèdre étoilé et le grand icosaèdre. Ils s’obtiennent en prolongeant les faces d’un dodécaèdre ou d’un icosaèdre jusqu’à ce qu’elles se recoupent, opération nommée stellation. Leurs faces se traversent, ce qui les distingue des solides de Platon.",
        "The Kepler-Poinsot solids are the four non-convex regular polyhedra: the small stellated dodecahedron, the great dodecahedron, the great stellated dodecahedron and the great icosahedron. They are obtained by extending the faces of a dodecahedron or of an icosahedron until they meet again, an operation called stellation. Their faces pass through each other, which sets them apart from the Platonic solids."),
    ],
    sections: [
      { h: p("La stellation", "Stellation"), p: [
        p("On garde les plans des faces d’un dodécaèdre et on prolonge les faces. Dans le plan d’une face, les droites qui portent les côtés des autres faces forment un réseau ; à chaque étape la face s’étend jusqu’aux droites suivantes. Pour le dodécaèdre, trois étapes donnent des solides étoilés à faces régulières : le petit dodécaèdre étoilé, le grand dodécaèdre et le grand dodécaèdre étoilé. Les plans de l’icosaèdre donnent de même le grand icosaèdre.",
          "The face planes of a dodecahedron are kept and the faces are extended. In the plane of one face, the lines carrying the sides of the other faces form a network; at each stage the face reaches the next lines. For the dodecahedron, three stages give star solids with regular faces: the small stellated dodecahedron, the great dodecahedron and the great stellated dodecahedron. The planes of the icosahedron likewise give the great icosahedron."),
      ] },
      { h: p("La relation d’Euler en défaut", "Euler’s relation fails"), p: [
        p("Pour un polyèdre convexe, V − E + F = 2. Le petit dodécaèdre étoilé a 12 sommets, 30 arêtes et 12 faces en pentagramme : 12 − 30 + 12 = −6. Le grand dodécaèdre donne le même résultat. La relation d’Euler vaut pour une surface qu’on peut déformer en sphère ; les faces de ces solides se traversent et leur surface n’en est pas une.",
          "For a convex polyhedron, V − E + F = 2. The small stellated dodecahedron has 12 vertices, 30 edges and 12 pentagram faces: 12 − 30 + 12 = −6. The great dodecahedron gives the same result. Euler’s relation holds for a surface that can be deformed into a sphere; the faces of these solids pass through each other and their surface is not one."),
        p("La relation ne tombe pas toujours en défaut : le grand dodécaèdre étoilé, avec 20 sommets, 30 arêtes et 12 faces, donne 20 − 30 + 12 = 2.",
          "The relation does not always fail: the great stellated dodecahedron, with 20 vertices, 30 edges and 12 faces, gives 20 − 30 + 12 = 2."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Kepler décrit les deux dodécaèdres étoilés dans Harmonices Mundi (1619). Louis Poinsot redécouvre ces deux-là et trouve le grand dodécaèdre et le grand icosaèdre en 1809. Augustin Cauchy prouve en 1813, en partant justement de la stellation, qu’il n’existe pas d’autre polyèdre régulier étoilé.",
          "Kepler described the two stellated dodecahedra in Harmonices Mundi (1619). Louis Poinsot rediscovered those two and found the great dodecahedron and the great icosahedron in 1809. Augustin Cauchy proved in 1813, starting precisely from stellation, that there is no other regular star polyhedron."),
      ] },
      { h: p("Postérité", "Legacy"), p: [
        p("Avec les cinq solides de Platon, ces quatre solides complètent la liste des polyèdres réguliers au sens large. L’étude de la stellation, de la dualité et de la caractéristique d’Euler d’une surface qui se traverse conduit à la topologie des surfaces et à celle des polytopes.",
          "Together with the five Platonic solids, these four complete the list of regular polyhedra in the broad sense. The study of stellation, of duality and of the Euler characteristic of a self-intersecting surface leads to the topology of surfaces and to that of polytopes."),
      ] },
    ],
  },

  wythoff: {
    facts: [
      [p("Auteurs", "Authors"), p("Willem Abraham Wythoff (1918) ; H. S. M. Coxeter et collaborateurs (1954)", "Willem Abraham Wythoff (1918); H. S. M. Coxeter and co-authors (1954)")],
      [p("Domaine", "Field"), p("Symétrie, polyèdres uniformes", "Symmetry, uniform polyhedra")],
      [p("Principe", "Principle"), p("Les reflets d’un point par trois miroirs donnent les sommets d’un solide", "The reflections of a point in three mirrors give the vertices of a solid")],
      [p("Exemple", "Example"), p("Point au centre du triangle du cube : 48 sommets", "Point at the centre of the cube’s triangle: 48 vertices")],
      [p("Solides duaux", "Dual solids"), p("Solides de Catalan", "Catalan solids")],
    ],
    lead: [
      p("La construction de Wythoff engendre des polyèdres à partir de trois miroirs qui découpent un triangle sur la sphère. Un point du triangle est reflété par les miroirs ; ses images sont les sommets d’un solide dont les arêtes relient les images voisines. Pour des positions particulières du point, toutes les arêtes sont égales et les faces sont régulières : on obtient les solides d’Archimède et leurs cousins.",
        "Wythoff’s construction generates polyhedra from three mirrors that cut out a triangle on the sphere. A point of the triangle is reflected by the mirrors; its images are the vertices of a solid whose edges join neighbouring images. For particular positions of the point, all the edges are equal and the faces are regular: the Archimedean solids and their relatives are obtained."),
    ],
    sections: [
      { h: p("La construction", "The construction"), p: [
        p("Trois plans de symétrie passant par le centre d’un solide de Platon découpent sa sphère circonscrite en triangles identiques : 24 pour le tétraèdre, 48 pour le cube et l’octaèdre, 120 pour le dodécaèdre et l’icosaèdre. Le point choisi dans un triangle possède un reflet dans chacun des triangles du pavage. Quand le point est au centre du triangle du cube, il y en a 48 : le solide obtenu a 48 sommets. C’est le cuboctaèdre tronqué (ou grand rhombicuboctaèdre), avec 12 carrés, 8 hexagones et 6 octogones.",
          "Three planes of symmetry through the centre of a Platonic solid cut its circumscribed sphere into identical triangles: 24 for the tetrahedron, 48 for the cube and the octahedron, 120 for the dodecahedron and the icosahedron. The point chosen in one triangle has one reflection in each triangle of the tiling. When the point is at the centre of the cube’s triangle there are 48 of them: the solid obtained has 48 vertices. It is the truncated cuboctahedron (or great rhombicuboctahedron), with 12 squares, 8 hexagons and 6 octagons."),
      ] },
      { h: p("Sept points, sept solides", "Seven points, seven solids"), p: [
        p("Dans chaque symétrie, sept positions du point donnent des arêtes toutes égales : les trois coins du triangle, les trois milieux de côtés (ou points équidistants de deux côtés) et le centre. Pour la symétrie du cube, on obtient ainsi le cube, l’octaèdre, le cuboctaèdre, le cube tronqué, l’octaèdre tronqué, le petit rhombicuboctaèdre et le cuboctaèdre tronqué. Le point au milieu du côté opposé au coin d’ordre 4 donne 12 sommets : le cuboctaèdre.",
          "In each symmetry, seven positions of the point give edges that are all equal: the three corners of the triangle, the three points on the sides (equidistant from two sides) and the centre. For the cube’s symmetry this yields the cube, the octahedron, the cuboctahedron, the truncated cube, the truncated octahedron, the rhombicuboctahedron and the truncated cuboctahedron. The point at the midpoint of the side opposite the order 4 corner gives 12 vertices: the cuboctahedron."),
        p("Une variante, la torsion, ne garde que la moitié des reflets (ceux obtenus par rotations) et donne les solides adoucis (snub). Le dual d’un solide obtenu ainsi s’obtient en échangeant sommets et faces : pour les solides d’Archimède, ce sont les solides de Catalan.",
          "A variant, the twist, keeps only half of the reflections (those obtained by rotations) and gives the snub solids. The dual of a solid obtained this way is got by swapping vertices and faces: for the Archimedean solids these are the Catalan solids."),
      ] },
      { h: p("Histoire", "History"), p: [
        p("Willem Abraham Wythoff décrit la construction en 1918. H. S. M. Coxeter et ses collaborateurs l’utilisent en 1954 pour dresser la liste complète des polyèdres uniformes. Les 13 solides d’Archimède étaient connus d’Archimède selon Pappus ; Kepler les redécrit en 1619. La position du point se note par un symbole de Wythoff, dont la notation encode les miroirs et le point choisi.",
          "Willem Abraham Wythoff described the construction in 1918. H. S. M. Coxeter and his co-authors used it in 1954 to list all uniform polyhedra. The 13 Archimedean solids were known to Archimedes according to Pappus; Kepler described them again in 1619. The position of the point is written as a Wythoff symbol, a notation encoding the mirrors and the chosen point."),
      ] },
      { h: p("Faces régulières sans uniformité", "Regular faces without uniformity"), p: [
        p("Les faces régulières ne suffisent pas à donner des sommets tous semblables. La pyramide à base carrée, aux arêtes égales, a des faces régulières mais un sommet entouré de quatre triangles et quatre sommets entourés de deux triangles et d’un carré. C’est un solide de Johnson, et il y en a 92. La construction de Wythoff ne les produit pas : elle exige que tous les sommets soient équivalents par symétrie.",
          "Regular faces are not enough to make all vertices alike. The square pyramid with equal edges has regular faces but one vertex surrounded by four triangles and four vertices surrounded by two triangles and a square. It is a Johnson solid, and there are 92 of them. Wythoff’s construction does not produce them: it requires all vertices to be equivalent by symmetry."),
      ] },
    ],
  },
};
