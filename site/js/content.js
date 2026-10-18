import { university } from './catalogue-data.js';
import { universityPathway } from './university-model.js';
// Bilingual content: every pair is [French, English]. Topic placements are indicative.
import { VARIANTS, defaults } from "./challenge-variants.js";
export const labs = [
  {
    id: "quadratic",
    symbol: "ƒ",
    group: ["Algèbre", "Algebra"],
    title: ["La fabrique des paraboles", "The parabola workshop"],
    short: ["Fonctions du second degré", "Quadratic functions"],
    intro: [
      "Que change un seul coefficient ? Déplace les curseurs et observe la courbe.",
      "What can one coefficient change? Move the sliders and watch the curve.",
    ],
    duration: 8,
    level: ["Seconde · Première", "Foundation · Intermediate"],
    prereq: [
      "Coordonnées, carrés, équations",
      "Coordinates, squares, equations",
    ],
    formula: "f(x) = ax² + bx + c",
    params: [
      ["a", -3, 3, 0.25, 1],
      ["b", -6, 6, 0.5, 0],
      ["c", -5, 5, 0.5, -2],
    ],
    steps: [
      [
        "Prédis : si a devient négatif, dans quel sens la parabole s’ouvre-t-elle ?",
        "Predict: if a becomes negative, which way does the parabola open?",
      ],
      [
        "Fixe a = 1 et b = 0. Fais varier c. Repère ce qui reste inchangé.",
        "Set a = 1 and b = 0. Vary c. Identify what stays unchanged.",
      ],
      [
        "Compare le discriminant Δ = b² − 4ac au nombre de racines réelles. Puis essaie a = 0.",
        "Compare the discriminant Δ = b² − 4ac with the number of real roots. Then try a = 0.",
      ],
    ],
    quiz: [
      "Pour f(x) = x² − 4, combien y a-t-il de racines réelles ?",
      "For f(x) = x² − 4, how many real roots are there?",
    ],
    answer: 2,
    explain: [
      "Il y en a deux : −2 et 2. Ici Δ = 16 > 0. Lorsque a = 0, la fonction n’est plus du second degré.",
      "There are two: −2 and 2. Here Δ = 16 > 0. When a = 0, the function is no longer quadratic.",
    ],
    history: ["Al-Khwarizmi · IXe siècle", "Al-Khwarizmi · 9th century"],
    story: [
      "Al-Khwarizmi présentait des méthodes de résolution d’équations du second degré par des arguments géométriques. Le mot « algèbre » vient d’al-jabr, dans le titre de son traité.",
      "Al-Khwarizmi presented methods for solving quadratic equations using geometric arguments. “Algebra” comes from al-jabr in the title of his treatise.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/",
  },
  {
    id: "trig",
    symbol: "θ",
    group: ["Géométrie", "Geometry"],
    title: ["Un cercle, deux coordonnées", "One circle, two coordinates"],
    short: ["Cercle trigonométrique", "The unit circle"],
    intro: [
      "Fais tourner le point. Ses coordonnées racontent le sinus et le cosinus.",
      "Rotate the point. Its coordinates reveal sine and cosine.",
    ],
    duration: 6,
    level: ["Première · Terminale", "Intermediate"],
    prereq: [
      "Angles, coordonnées, théorème de Pythagore",
      "Angles, coordinates, Pythagoras’ theorem",
    ],
    formula: "P = (cos θ, sin θ)",
    params: [["θ", 0, 360, 1, 45]],
    steps: [
      [
        "Prédis les coordonnées du point à 90°, 180° et 270°.",
        "Predict the coordinates at 90°, 180° and 270°.",
      ],
      [
        "Observe les signes des deux coordonnées dans chaque quadrant.",
        "Observe the signs of both coordinates in each quadrant.",
      ],
      [
        "Vérifie plusieurs angles : cos² θ + sin² θ = 1. Explique avec Pythagore.",
        "Check several angles: cos² θ + sin² θ = 1. Explain using Pythagoras.",
      ],
    ],
    quiz: ["Quelle est la valeur de cos(180°) ?", "What is cos(180°)?"],
    answer: -1,
    explain: [
      "À 180°, le point est (−1, 0). Le cosinus est son abscisse, donc −1.",
      "At 180°, the point is (−1, 0). Cosine is its x-coordinate, so −1.",
    ],
    history: ["Des cordes aux sinus", "From chords to sines"],
    story: [
      "Les tables de cordes de Ptolémée permettaient des calculs astronomiques. Les mathématiciens indiens, dont Aryabhata, ont ensuite développé des tables de sinus.",
      "Ptolemy’s chord tables supported astronomical calculations. Indian mathematicians, including Aryabhata, later developed sine tables.",
    ],
    source:
      "https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/",
  },
  {
    id: "sequences",
    symbol: "uₙ",
    group: ["Algèbre", "Algebra"],
    title: ["Additionner ou multiplier ?", "Add or multiply?"],
    short: ["Suites et croissance", "Sequences and growth"],
    intro: [
      "Compare une progression arithmétique à une progression géométrique.",
      "Compare arithmetic growth with geometric growth.",
    ],
    duration: 8,
    level: ["Première · Terminale", "Intermediate"],
    prereq: ["Puissances, calcul numérique", "Powers, numerical calculation"],
    formula: "uₙ = u₀ + nr  /  uₙ = u₀ × qⁿ",
    params: [
      ["u₀", 1, 5, 1, 2],
      ["r / q", -2, 3, 0.25, 1.5],
      ["N", 3, 15, 1, 10],
    ],
    steps: [
      [
        "Choisis le mode arithmétique. Que vaut la différence entre deux termes consécutifs ?",
        "Choose arithmetic mode. What is the difference between consecutive terms?",
      ],
      [
        "Passe au mode géométrique, avec q = 0,5, puis 1,5. Compare les évolutions.",
        "Switch to geometric mode with q = 0.5, then 1.5. Compare the patterns.",
      ],
      [
        "Essaie une raison négative. Explique l’alternance des signes en mode géométrique.",
        "Try a negative ratio. Explain the alternating signs in geometric mode.",
      ],
    ],
    quiz: [
      "Si u₀ = 3 et q = 2, combien vaut u₄ pour une suite géométrique ?",
      "If u₀ = 3 and q = 2, what is u₄ in a geometric sequence?",
    ],
    answer: 48,
    explain: [
      "u₄ = 3 × 2⁴ = 48. Le premier terme porte ici l’indice 0.",
      "u₄ = 3 × 2⁴ = 48. The first term here has index 0.",
    ],
    history: ["Fibonacci · 1202", "Fibonacci · 1202"],
    story: [
      "Le Liber abaci de Fibonacci a diffusé en Europe les chiffres indo-arabes. Son problème de lapins conduit à une suite où chaque terme est la somme des deux précédents : une autre façon de construire une suite.",
      "Fibonacci’s Liber abaci helped spread Hindu-Arabic numerals in Europe. His rabbit problem leads to a sequence where each term is the sum of the previous two: another way to build a sequence.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Fibonacci/",
  },
  {
    id: "probability",
    symbol: "P",
    group: ["Données & hasard", "Data & chance"],
    title: ["Le hasard a ses habitudes", "Chance has its patterns"],
    short: ["Loi binomiale", "Binomial probability"],
    intro: [
      "Lance une série d’expériences virtuelles et compare les fréquences au modèle.",
      "Run virtual experiments and compare observed frequencies with the model.",
    ],
    duration: 10,
    level: ["Première · Terminale", "Intermediate · Advanced"],
    prereq: [
      "Probabilités, indépendance, fréquences",
      "Probability, independence, relative frequency",
    ],
    formula: "X ∼ B(n, p) · E(X) = np",
    params: [
      ["n", 1, 12, 1, 6],
      ["p", 0, 1, 0.05, 0.5],
    ],
    steps: [
      [
        "Chaque expérience contient n essais indépendants, avec une probabilité p de succès à chaque essai. Prédis le nombre moyen de succès.",
        "Each experiment contains n independent trials, with success probability p per trial. Predict the average number of successes.",
      ],
      [
        "Lance 100 expériences, puis 1 000. Compare les fréquences observées aux probabilités théoriques.",
        "Run 100 experiments, then 1,000. Compare observed frequencies with theoretical probabilities.",
      ],
      [
        "Essaie p = 0 et p = 1. Pourquoi le résultat devient-il certain ? Une simulation ne prouve pas une loi.",
        "Try p = 0 and p = 1. Why does the result become certain? A simulation does not prove a law.",
      ],
    ],
    quiz: [
      "Avec n = 10 et p = 0,3, quelle est l’espérance du nombre de succès ?",
      "With n = 10 and p = 0.3, what is the expected number of successes?",
    ],
    answer: 3,
    explain: [
      "E(X) = np = 10 × 0,3 = 3. Une expérience isolée peut donner un autre résultat.",
      "E(X) = np = 10 × 0.3 = 3. A single experiment may give a different result.",
    ],
    history: ["Pascal et Fermat · 1654", "Pascal and Fermat · 1654"],
    story: [
      "Leur correspondance sur le partage équitable d’une mise lors d’un jeu interrompu a contribué au développement de la théorie des probabilités.",
      "Their correspondence about fairly dividing stakes in an interrupted game contributed to the development of probability theory.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Pascal/",
  },
  {
    id: "derivative",
    symbol: "f′",
    group: ["Analyse", "Calculus"],
    title: ["Approcher une tangente", "Approaching a tangent"],
    short: ["Dérivée et taux de variation", "Derivatives and rates of change"],
    intro: [
      "Rapproche deux points sur la courbe de x². Observe la pente de leur sécante.",
      "Bring two points together on the graph of x². Watch the slope of their secant.",
    ],
    duration: 8,
    level: ["Première · Terminale", "Intermediate · Advanced"],
    prereq: ["Fonctions, pente d’une droite", "Functions, slope of a line"],
    formula: "[f(x + h) − f(x)] / h → f′(x)",
    params: [
      ["x", -3, 3, 0.25, 1],
      ["h", 0.01, 2, 0.01, 1],
    ],
    steps: [
      [
        "Pour x = 1 et h = 1, calcule la pente entre (1, 1) et (2, 4).",
        "For x = 1 and h = 1, calculate the slope between (1, 1) and (2, 4).",
      ],
      [
        "Diminue |h| et change le côté d’approche. Vers quelle valeur les pentes semblent-elles tendre ?",
        "Decrease |h| and change approach sides. What value do the slopes seem to approach?",
      ],
      [
        "Développe ((x + h)² − x²) / h = 2x + h, pour h ≠ 0. La limite vaut 2x.",
        "Expand ((x + h)² − x²) / h = 2x + h, for h ≠ 0. The limit is 2x.",
      ],
    ],
    quiz: [
      "Pour f(x) = x², quelle est la pente de la tangente en x = 3 ?",
      "For f(x) = x², what is the tangent slope at x = 3?",
    ],
    answer: 6,
    explain: [
      "f′(x) = 2x, donc f′(3) = 6. Le quotient à h = 0 est indéfini ; la dérivée est une limite.",
      "f′(x) = 2x, so f′(3) = 6. The quotient at h = 0 is undefined; the derivative is a limit.",
    ],
    history: [
      "Newton et Leibniz · XVIIe siècle",
      "Newton and Leibniz · 17th century",
    ],
    story: [
      "Newton et Leibniz ont développé indépendamment le calcul infinitésimal. Leurs approches reliaient mouvement, tangentes et aires. Les notations de Leibniz restent très utilisées.",
      "Newton and Leibniz independently developed calculus. Their approaches linked motion, tangents and areas. Leibniz’s notation remains widely used.",
    ],
    source:
      "https://mathshistory.st-andrews.ac.uk/HistTopics/The_rise_of_calculus/",
  },
  {
    id: "integral",
    symbol: "∫",
    group: ["Analyse", "Calculus"],
    title: [
      "Une aire, rectangle par rectangle",
      "Area, one rectangle at a time",
    ],
    short: ["Intégrales et approximation", "Integrals and approximation"],
    intro: [
      "Approxime l’aire sous y = x² entre 0 et 1. Compare trois choix de rectangles.",
      "Approximate the area under y = x² from 0 to 1. Compare three choices of rectangles.",
    ],
    duration: 7,
    level: ["Terminale", "Advanced"],
    prereq: [
      "Aire d’un rectangle, fonctions, sommes",
      "Rectangle area, functions, sums",
    ],
    formula: "∫₀¹ x² dx = 1/3",
    params: [["N", 2, 100, 1, 8]],
    steps: [
      [
        "Avec deux rectangles à gauche, pourquoi l’approximation est-elle inférieure à l’aire exacte ? Et à droite ?",
        "With two left-endpoint rectangles, why is the approximation below the exact area? What about right endpoints?",
      ],
      [
        "Compare les rectangles à gauche, à droite et au milieu. Augmente N et observe les erreurs.",
        "Compare left, right and midpoint rectangles. Increase N and observe the errors.",
      ],
      [
        "À gauche, chaque rectangle a une largeur 1/N et une hauteur (i/N)² pour i = 0, …, N − 1. Justifie l’encadrement.",
        "With left endpoints, each rectangle has width 1/N and height (i/N)² for i = 0, …, N − 1. Justify the bounds.",
      ],
    ],
    quiz: [
      "Quelle est l’aire exacte sous x² entre 0 et 1 ? Une fraction est acceptée.",
      "What is the exact area under x² from 0 to 1? A fraction is accepted.",
    ],
    answer: 1 / 3,
    explain: [
      "Une primitive est x³/3. Entre 0 et 1, on obtient 1/3. Les sommes de rectangles tendent vers cette valeur.",
      "An antiderivative is x³/3. Evaluating from 0 to 1 gives 1/3. The rectangle sums approach this value.",
    ],
    history: [
      "Archimède · IIIe siècle avant notre ère",
      "Archimedes · 3rd century BCE",
    ],
    story: [
      "Bien avant les intégrales modernes, Archimède utilisait des encadrements géométriques pour calculer des aires, notamment celle d’un segment de parabole.",
      "Long before modern integration, Archimedes used geometric bounds to calculate areas, including the area of a parabolic segment.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Archimedes/",
  },
  {
    id: "vectors",
    symbol: "↗",
    group: ["Géométrie", "Geometry"],
    title: ["Deux vecteurs font un chemin", "Two vectors make a path"],
    short: ["Vecteurs et produit scalaire", "Vectors and dot products"],
    intro: [
      "Construis un parallélogramme et explore la somme et le produit scalaire.",
      "Build a parallelogram and explore vector addition and the dot product.",
    ],
    duration: 7,
    level: ["Seconde · Première", "Foundation · Intermediate"],
    prereq: ["Coordonnées, Pythagore", "Coordinates, Pythagoras"],
    formula: "u · v = uₓvₓ + uᵧvᵧ",
    params: [
      ["uₓ", -4, 4, 0.5, 3],
      ["uᵧ", -4, 4, 0.5, 1],
      ["vₓ", -4, 4, 0.5, -1],
      ["vᵧ", -4, 4, 0.5, 3],
    ],
    steps: [
      [
        "Lis les coordonnées de u + v. Vérifie-les par addition composante par composante.",
        "Read the coordinates of u + v. Check them by adding components.",
      ],
      [
        "Cherche deux vecteurs non nuls dont le produit scalaire vaut zéro.",
        "Find two nonzero vectors whose dot product is zero.",
      ],
      [
        "Explique pourquoi ces vecteurs sont perpendiculaires avec u · v = ‖u‖ ‖v‖ cos θ.",
        "Explain why these vectors are perpendicular using u · v = ‖u‖ ‖v‖ cos θ.",
      ],
    ],
    quiz: [
      "Quel est le produit scalaire de (2, 1) et (−1, 2) ?",
      "What is the dot product of (2, 1) and (−1, 2)?",
    ],
    answer: 0,
    explain: [
      "2 × (−1) + 1 × 2 = 0. Les deux vecteurs non nuls sont donc perpendiculaires.",
      "2 × (−1) + 1 × 2 = 0. The two nonzero vectors are therefore perpendicular.",
    ],
    history: ["Grassmann · 1844", "Grassmann · 1844"],
    story: [
      "Hermann Grassmann développa une algèbre des grandeurs géométriques. Ses travaux ont contribué aux idées modernes d’espace vectoriel.",
      "Hermann Grassmann developed an algebra of geometric quantities. His work contributed to modern ideas about vector spaces.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Grassmann/",
  },
  {
    id: "statistics",
    symbol: "x̄",
    group: ["Données & hasard", "Data & chance"],
    title: ["Que raconte une moyenne ?", "What does an average tell us?"],
    short: ["Statistiques descriptives", "Descriptive statistics"],
    intro: [
      "Modifie une série de données. Observe la moyenne, la médiane et la dispersion.",
      "Edit a data set. Observe its mean, median and spread.",
    ],
    duration: 6,
    level: ["Seconde", "Foundation"],
    prereq: ["Calculs, nombres décimaux", "Arithmetic, decimal numbers"],
    formula: "x̄ = (x₁ + … + xₙ) / n",
    params: [],
    steps: [
      [
        "Observe la série proposée. Compare la moyenne et la médiane.",
        "Observe the initial data. Compare the mean and median.",
      ],
      [
        "Remplace 9 par 90. Quelle mesure varie le plus ?",
        "Replace 9 with 90. Which measure changes the most?",
      ],
      [
        "Explique pourquoi une valeur extrême peut déplacer fortement la moyenne.",
        "Explain why an extreme value can move the mean substantially.",
      ],
    ],
    quiz: [
      "Quelle est la médiane de 2 ; 3 ; 4 ; 5 ; 100 ?",
      "What is the median of 2; 3; 4; 5; 100?",
    ],
    answer: 4,
    explain: [
      "La valeur centrale de cette liste ordonnée est 4. La moyenne vaut 22,8 : elle est très sensible à 100.",
      "The middle value of this sorted list is 4. The mean is 22.8: it is strongly affected by 100.",
    ],
    history: [
      "Florence Nightingale · XIXe siècle",
      "Florence Nightingale · 19th century",
    ],
    story: [
      "Florence Nightingale a utilisé les statistiques et des diagrammes pour défendre des réformes sanitaires. Les représentations de données peuvent rendre un argument plus clair, mais leur construction compte.",
      "Florence Nightingale used statistics and diagrams to advocate for sanitary reform. Data visualizations can clarify an argument, but their construction matters.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Nightingale/",
  },
  {
    id: "complex",
    symbol: "ℂ",
    group: ["Algèbre", "Algebra"],
    title: ["Les nombres prennent le plan", "Numbers take the plane"],
    short: ["Nombres complexes", "Complex numbers"],
    intro: [
      "Transforme un point, une figure et un quadrillage. Ajouter déplace ; multiplier tourne et agrandit.",
      "Transform a point, a shape and a grid. Addition translates; multiplication rotates and scales.",
    ],
    duration: 8,
    level: ["Approfondissement", "Extension"],
    prereq: [
      "Coordonnées, Pythagore, trigonométrie",
      "Coordinates, Pythagoras, trigonometry",
    ],
    formula: "z = a + ib · i² = −1",
    params: [
      ["a", -4, 4, 0.25, 2],
      ["b", -4, 4, 0.25, 1],
    ],
    steps: [
      [
        "Observe le module |z|. Retrouve-le avec Pythagore.",
        "Observe the modulus |z|. Recover it using Pythagoras.",
      ],
      [
        "Choisis a = i, puis a = 2. Compare la rotation et le changement de module. Active le quadrillage transformé.",
        "Choose a = i, then a = 2. Compare the rotation and the change in modulus. Show the transformed grid.",
      ],
      [
        "Compare le carré et la conjugaison. Où vont z et −z ? Quel effet conserve l’orientation ?",
        "Compare squaring and conjugation. Where do z and −z go? Which operation preserves orientation?",
      ],
    ],
    quiz: ["Quel est le module de 3 + 4i ?", "What is the modulus of 3 + 4i?"],
    answer: 5,
    explain: [
      "|3 + 4i| = √(3² + 4²) = 5. Multiplier par i conserve ce module et tourne de 90° dans le sens direct.",
      "|3 + 4i| = √(3² + 4²) = 5. Multiplying by i preserves the modulus and rotates 90° counterclockwise.",
    ],
    history: ["Bombelli · 1572", "Bombelli · 1572"],
    story: [
      "Dans son ouvrage L’Algebra, Rafael Bombelli a établi des règles de calcul avec des racines carrées de nombres négatifs, contribuant à donner un sens aux nombres complexes.",
      "In L’Algebra, Rafael Bombelli established calculation rules for square roots of negative numbers, helping give meaning to complex numbers.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Bombelli/",
  },
  {
    id: "galton",
    custom: true,
    symbol: "∴",
    group: ["Données & hasard", "Data & chance"],
    title: ["La planche de Galton", "The Galton board"],
    short: ["Planche de Galton", "Galton board"],
    intro: ["Des billes tombent entre des clous : à chaque clou, gauche ou droite. Pourquoi une cloche apparaît-elle ?", "Balls fall through pegs: left or right at every peg. Why does a bell shape appear?"],
    prereq: ["Probabilités, triangle de Pascal", "Probability, Pascal’s triangle"],
    formula: "",
    params: [],
    steps: [
      ["Fais tomber quelques billes, puis des centaines. La forme se stabilise-t-elle ?", "Drop a few balls, then hundreds. Does the shape settle down?"],
      ["Change p : où se déplace le sommet ? Compare avec la courbe binomiale.", "Change p: where does the peak move? Compare with the binomial curve."],
      ["Compte les trajets menant à chaque case : retrouves-tu une ligne du triangle de Pascal ?", "Count the paths to each bin: do you recognise a row of Pascal’s triangle?"],
    ],
    quiz: ["Une planche de Galton a 4 rangées de clous et p = 1/2. Quelle est la probabilité qu’une bille termine dans la case centrale ? (décimal ou fraction)", "A Galton board has 4 rows of pegs and p = 1/2. What is the probability that a ball ends in the central bin? (decimal or fraction)"],
    answer: 0.375,
    explain: ["Il y a 2⁴ = 16 trajets équiprobables ; ceux qui comptent 2 droites et 2 gauches sont C(4,2) = 6. Donc 6/16 = 3/8 = 0,375.", "There are 2⁴ = 16 equally likely paths; those with 2 rights and 2 lefts number C(4,2) = 6. So 6/16 = 3/8 = 0.375."],
    history: ["Galton · 1889", "Galton · 1889"],
    story: ["Francis Galton a imaginé cette planche pour montrer comment de nombreux petits hasards indépendants se combinent en une loi régulière, ancêtre intuitif du théorème central limite.", "Francis Galton devised this board to show how many small independent chances combine into a regular law, an intuitive forerunner of the central limit theorem."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Galton/",
    duration: 8,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "reuleaux",
    custom: true,
    symbol: "◇",
    group: ["Géométrie", "Geometry"],
    title: ["Les courbes de largeur constante", "Curves of constant width"],
    short: ["Triangle de Reuleaux", "Reuleaux triangle"],
    intro: ["Un triangle aux côtés bombés qui roule aussi bien qu’un disque, et qui perce des trous presque carrés. Comment est-ce possible ?", "A triangle with bulging sides that rolls as well as a disc and drills almost-square holes. How is that possible?"],
    prereq: ["Cercles, arcs, périmètre", "Circles, arcs, perimeter"],
    formula: "",
    params: [],
    steps: [
      ["Fais tourner la forme : la distance entre deux droites parallèles qui l’enserrent change-t-elle ?", "Rotate the shape: does the distance between two parallel lines enclosing it change?"],
      ["Passe de 3 à 5, 7, 9 sommets. Que devient le périmètre ? Et l’aire ?", "Go from 3 to 5, 7, 9 vertices. What happens to the perimeter? And the area?"],
      ["Compare l’aire avec celle du disque de même largeur : laquelle est maximale ?", "Compare the area with that of the disc of the same width: which is larger?"],
    ],
    quiz: ["Un triangle de Reuleaux a un périmètre de 6π cm. Quelle est sa largeur, en cm ?", "A Reuleaux triangle has perimeter 6π cm. What is its width, in cm?"],
    answer: 6,
    explain: ["Une courbe de largeur constante w a pour périmètre πw (théorème de Barbier). Donc πw = 6π et w = 6 cm.", "A curve of constant width w has perimeter πw (Barbier’s theorem). So πw = 6π and w = 6 cm."],
    history: ["Reuleaux · 1875", "Reuleaux · 1875"],
    story: ["Franz Reuleaux étudia ces courbes en cinématique des mécanismes. Barbier avait montré dès 1860 que toutes les courbes de même largeur ont le même périmètre.", "Franz Reuleaux studied these curves in the kinematics of mechanisms. Barbier had shown in 1860 that all curves of the same width have the same perimeter."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Reuleaux/",
    duration: 10,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "platonic",
    custom: true,
    symbol: "△",
    group: ["Géométrie", "Geometry"],
    title: ["Les cinq solides de Platon", "The five Platonic solids"],
    short: ["Solides de Platon", "Platonic solids"],
    intro: ["Des faces régulières identiques, un solide convexe, le même assemblage à chaque sommet : cinq solides, à une similitude près. Ouvre leurs patrons pour comprendre.", "Identical regular faces, a convex solid and the same arrangement at every vertex: five solids up to similarity. Open their nets to see why."],
    prereq: ["Polygones réguliers, angles, formule d’Euler", "Regular polygons, angles, Euler’s formula"],
    formula: "",
    params: [],
    steps: [
      ["Fais tourner chaque solide et compte sommets, arêtes, faces : calcule S − A + F.", "Rotate each solid and count vertices, edges, faces: compute V − E + F."],
      ["Dans « Pourquoi seulement cinq ? », ajoute des faces autour d’un sommet : quand l’angle total atteint-il 360° ?", "In “Why only five?”, add faces around a vertex: when does the total angle reach 360°?"],
      ["Essaie des pentagones ou des hexagones : combien peut-on en rassembler au plus ?", "Try pentagons or hexagons: how many can you gather at most?"],
    ],
    quiz: ["Un solide a 12 sommets et 20 faces triangulaires. Combien d’arêtes a-t-il ?", "A solid has 12 vertices and 20 triangular faces. How many edges does it have?"],
    answer: 30,
    explain: ["Chaque face a 3 arêtes et chaque arête borde 2 faces : E = 3 × 20 / 2 = 30. Euler : 12 − 30 + 20 = 2 ✓ (c’est l’icosaèdre).", "Each face has 3 edges and each edge borders 2 faces: E = 3 × 20 / 2 = 30. Euler: 12 − 30 + 20 = 2 ✓ (the icosahedron)."],
    history: ["Théétète · Ve s. av. J.-C.", "Theaetetus · 5th c. BC"],
    story: ["La classification des cinq solides réguliers est attribuée à Théétète et exposée à la fin des Éléments d’Euclide (livre XIII). L’argument des angles autour d’un sommet y figure déjà en substance.", "The classification of the five regular solids is attributed to Theaetetus and set out at the end of Euclid’s Elements (Book XIII). The angle-sum argument at a vertex is already there in substance."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Theaetetus/",
    duration: 12,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "chaos",
    custom: true,
    symbol: "⁘",
    group: ["Géométrie", "Geometry"],
    title: ["Le jeu du chaos", "The chaos game"],
    short: ["Jeu du chaos", "Chaos game"],
    intro: ["Un point saute au hasard à mi-chemin d’un sommet : le désordre dessine un triangle de Sierpiński. Pourquoi ?", "A point jumps at random halfway to a vertex: disorder draws a Sierpiński triangle. Why?"],
    prereq: ["Homothéties, suites géométriques", "Homotheties, geometric sequences"],
    formula: "",
    params: [],
    steps: [
      ["Lance le jeu avec 3 sommets : que remarques-tu après quelques milliers de points ?", "Run the game with 3 vertices: what do you notice after a few thousand points?"],
      ["Déplace un sommet, ou passe à 4, 5 ou 6 sommets : la figure change-t-elle de nature ?", "Move a vertex, or switch to 4, 5 or 6 vertices: does the figure change nature?"],
      ["Dans la construction par niveaux, compare le nombre de triangles et l’aire restante.", "In the level-by-level construction, compare the number of triangles and the remaining area."],
    ],
    quiz: ["On construit le triangle de Sierpiński : à chaque niveau, chaque triangle plein est remplacé par 3 triangles de moitié de côté. Combien de triangles pleins au niveau 3 ?", "We build the Sierpiński triangle: at each level, each filled triangle is replaced by 3 triangles of half the side. How many filled triangles at level 3?"],
    answer: 27,
    explain: ["Le nombre est multiplié par 3 à chaque niveau : 3³ = 27. L’aire, elle, est multipliée par 3/4 : (3/4)³ ≈ 0,42, et tend vers 0.", "The number is multiplied by 3 at each level: 3³ = 27. The area is multiplied by 3/4: (3/4)³ ≈ 0.42, tending to 0."],
    history: ["Sierpiński · 1915", "Sierpiński · 1915"],
    story: ["Wacław Sierpiński décrit ce triangle en 1915. Le jeu du chaos, popularisé par Michael Barnsley dans les années 1980, montre qu’il apparaît aussi comme limite d’un processus aléatoire.", "Wacław Sierpiński described this triangle in 1915. The chaos game, popularised by Michael Barnsley in the 1980s, shows it also emerges as the limit of a random process."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Sierpinski/",
    duration: 8,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "fourier",
    custom: true,
    symbol: "◎",
    group: ["Formes & mouvement", "Shapes & motion"],
    title: ["Des cercles qui dessinent Madagascar", "Circles that draw Madagascar"],
    short: ["Cercles de Fourier", "Fourier circles"],
    intro: ["Des cercles qui tournent, chacun porté par le précédent, suffisent à redessiner n’importe quelle forme fermée. Combien en faut-il pour reconnaître une île ?", "Turning circles, each carried by the previous one, are enough to redraw any closed shape. How many does it take to recognise an island?"],
    prereq: ["Aucun : curiosité, ou nombres complexes et trigonométrie pour aller plus loin", "None: curiosity, or complex numbers and trigonometry to go further"],
    formula: "",
    params: [],
    steps: [
      ["Regarde la forme apparaître avec un seul cercle, puis deux, puis dix. Que gagne-t-on à chaque cercle ajouté ?", "Watch the shape appear with one circle, then two, then ten. What does each added circle bring?"],
      ["Cache les cercles : il reste une seule pointe qui trace la forme. Quels cercles sont les plus grands ?", "Hide the circles: a single tip remains and traces the shape. Which circles are the largest?"],
      ["Dessine ta propre forme avec le doigt ou la souris, puis augmente le nombre de cercles.", "Draw your own shape with your finger or the mouse, then increase the number of circles."],
    ],
    quiz: ["Un cercle de rayon 3 tourne à 1 tour par seconde. Sur son bord, un second cercle de rayon 1 tourne à 2 tours par seconde autour de ce point. Quelle est la plus grande distance possible entre le bout du second cercle et le centre du premier ?", "A circle of radius 3 turns once per second. On its edge, a second circle of radius 1 turns twice per second around that point. What is the greatest possible distance between the tip of the second circle and the centre of the first?"],
    answer: 4,
    explain: ["La distance est au plus 3 + 1 = 4, atteinte quand les deux bras sont alignés dans le même sens : à cet instant le bout est à 4 du centre.", "The distance is at most 3 + 1 = 4, reached when both arms point the same way: at that moment the tip is 4 from the centre."],
    history: ["Fourier · 1822", "Fourier · 1822"],
    story: ["Joseph Fourier a montré, dans sa Théorie analytique de la chaleur (1822), qu’une fonction périodique se décompose en une somme de mouvements circulaires de fréquences entières. Les cercles de cette page sont la même idée appliquée à une courbe du plan. Le contour de Madagascar a été relevé sur un fond de carte puis lissé : c’est une aide au dessin, pas un levé cartographique.", "In his Analytical Theory of Heat (1822), Joseph Fourier showed that a periodic function splits into a sum of circular motions with whole-number frequencies. The circles on this page are the same idea applied to a plane curve. The outline of Madagascar was traced from a map outline and then smoothed: it is a drawing aid, not a survey."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Fourier/",
    duration: 10,
    level: ["Pour tous", "For everyone"],
  },
  {
    id: "mandelbrot",
    custom: true,
    symbol: "❋",
    group: ["Formes & mouvement", "Shapes & motion"],
    title: ["L’ensemble de Mandelbrot", "The Mandelbrot set"],
    short: ["Ensemble de Mandelbrot", "Mandelbrot set"],
    intro: ["Une règle d’une ligne, z → z² + c, et un monde infini de détails. Explore-le, zoome, et regarde l’ensemble de Julia de chaque point.", "A one-line rule, z → z² + c, and an infinite world of detail. Explore it, zoom in, and watch the Julia set of every point."],
    prereq: ["Aucun : curiosité, ou nombres complexes et suites pour aller plus loin", "None: curiosity, or complex numbers and sequences to go further"],
    formula: "",
    params: [],
    steps: [
      ["Déplace le pointeur dans le grand disque central puis dans les bulbes : l’ensemble de Julia reste-t-il d’un seul tenant ?", "Move the pointer inside the big central disc and then in the bulbs: does the Julia set stay in one piece?"],
      ["Zoome sur le bord : les formes se répètent-elles à une autre échelle ?", "Zoom in on the edge: do the shapes repeat at another scale?"],
      ["Lance le voyage vers la vallée des hippocampes et observe le nombre d’itérations nécessaires.", "Take the trip to the seahorse valley and watch the number of iterations needed."],
    ],
    quiz: ["On part de z₀ = 0 et on répète zₙ₊₁ = zₙ² + c avec c = 1. À quelle étape n la valeur |zₙ| dépasse-t-elle 2 pour la première fois ?", "Start from z₀ = 0 and repeat zₙ₊₁ = zₙ² + c with c = 1. At which step n does |zₙ| exceed 2 for the first time?"],
    answer: 3,
    explain: ["z₁ = 1, z₂ = 1² + 1 = 2 (pas encore supérieur à 2), z₃ = 2² + 1 = 5 > 2. Le point c = 1 s’échappe : il n’est pas dans l’ensemble de Mandelbrot.", "z₁ = 1, z₂ = 1² + 1 = 2 (not yet greater than 2), z₃ = 2² + 1 = 5 > 2. The point c = 1 escapes: it is not in the Mandelbrot set."],
    history: ["Mandelbrot · 1980", "Mandelbrot · 1980"],
    story: ["Benoît Mandelbrot a visualisé cet ensemble par ordinateur en 1980. Les ensembles de Julia, étudiés dès 1918 par Gaston Julia et Pierre Fatou, en sont les pièces : l’ensemble de Mandelbrot indique, pour chaque c, si l’ensemble de Julia associé est d’un seul tenant.", "Benoit Mandelbrot visualised this set by computer in 1980. The Julia sets, studied from 1918 by Gaston Julia and Pierre Fatou, are its building blocks: the Mandelbrot set records, for each c, whether the associated Julia set is in one piece."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Mandelbrot/",
    duration: 10,
    level: ["Pour tous", "For everyone"],
  },
];

// Activities give examples, conditions and a general argument separately.
const reasoning = {
  quadratic: {
    conjecture: ["À a ≠ 0 et b fixés, changer c translate la parabole verticalement sans changer son axe.", "With a ≠ 0 and b fixed, changing c shifts the parabola vertically without changing its axis."],
    proof: ["Pour tout x, f(x) + k = ax² + bx + (c + k). En complétant le carré, f(x) = a(x + b/(2a))² − Δ/(4a). Le sommet a pour abscisse −b/(2a). L’équation f(x) = 0 équivaut à (x + b/(2a))² = Δ/(4a²) : deux, une ou aucune racine selon le signe de Δ. Ce raisonnement suppose a ≠ 0.", "For every x, f(x) + k = ax² + bx + (c + k). Completing the square gives f(x) = a(x + b/(2a))² − Δ/(4a). The vertex has x-coordinate −b/(2a). The equation f(x) = 0 is equivalent to (x + b/(2a))² = Δ/(4a²): two, one or no roots depending on the sign of Δ. This argument assumes a ≠ 0."],
    transfer: ["À tester : compare a = 0, b = 0, c = 0 puis c = 1. Pourquoi « aucune racine » et « tous les réels » sont-ils différents ?", "Try a = 0, b = 0, c = 0, then c = 1. Why are “no roots” and “all real numbers” different?"]
  },
  trig: {
    conjecture: ["Pour tout angle, cos² θ + sin² θ = 1 ; les coordonnées ont des signes différents selon le quadrant.", "For every angle, cos² θ + sin² θ = 1; coordinate signs depend on the quadrant."],
    proof: ["P = (cos θ, sin θ) appartient au cercle de centre O et de rayon 1. Pythagore donne OP² = cos² θ + sin² θ = 1. L’argument porte sur tous les points du cercle, pas seulement les angles testés.", "P = (cos θ, sin θ) lies on the circle with centre O and radius 1. Pythagoras gives OP² = cos² θ + sin² θ = 1. The argument covers every point on the circle, not just tested angles."],
    transfer: ["À tester : θ et 360° − θ. Quel signe change ? Justifie par la symétrie par rapport à l’axe horizontal.", "Try θ and 360° − θ. Which sign changes? Explain using reflection in the horizontal axis."]
  },
  sequences: {
    conjecture: ["Une suite arithmétique a une différence constante. Une suite géométrique vérifie uₙ₊₁ = q uₙ, même pour q = 0.", "An arithmetic sequence has a constant difference. A geometric sequence satisfies uₙ₊₁ = q uₙ, including q = 0."],
    proof: ["uₙ = u₀ + nr donne uₙ₊₁ − uₙ = r. La récurrence uₙ₊₁ = q uₙ, avec le terme initial u₀, donne uₙ = u₀qⁿ pour n ≥ 1 par récurrence. Pour q = 0, les termes suivants sont nuls : on ne peut pas calculer leur quotient. Si q < 0 et u₀ ≠ 0, les signes alternent.", "uₙ = u₀ + nr gives uₙ₊₁ − uₙ = r. Starting with u₀, the recurrence uₙ₊₁ = q uₙ gives uₙ = u₀qⁿ for n ≥ 1 by induction. For q = 0, all later terms are zero: their ratio cannot be calculated. If q < 0 and u₀ ≠ 0, signs alternate."],
    transfer: ["À tester : q = −0,5 puis q = −1,5. Les signes alternent dans les deux cas ; compare les valeurs absolues. Une fenêtre de 15 termes ne prouve pas une limite.", "Try q = −0.5, then q = −1.5. Signs alternate in both cases; compare absolute values. A window of 15 terms does not prove a limit."]
  },
  probability: {
    conjecture: ["Sur beaucoup d’expériences, les fréquences tendent à se rapprocher du modèle binomial. L’erreur ne diminue pas forcément à chaque nouveau lot.", "Over many experiments, frequencies tend to approach the binomial model. The error need not decrease after every new batch."],
    proof: ["Pour k succès parmi n essais indépendants de probabilité p, chaque arrangement a une probabilité pᵏ(1 − p)ⁿ⁻ᵏ. Il y en a C(n,k), d’où P(X = k) = C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ. En écrivant X comme somme de n indicatrices d’espérance p, on obtient E(X) = np. La simulation illustre ces résultats ; elle ne les démontre pas.", "For k successes in n independent trials with probability p, each arrangement has probability pᵏ(1 − p)ⁿ⁻ᵏ. There are C(n,k) arrangements, giving P(X = k) = C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ. Writing X as the sum of n indicators with expectation p gives E(X) = np. Simulation illustrates these results; it does not prove them."],
    transfer: ["À tester : p = 0,5 puis p = 0,2, avec n fixé. Compare symétrie et dispersion dans le tableau. Sans indépendance ou avec p variable, ce modèle peut être inadapté.", "Try p = 0.5, then p = 0.2, keeping n fixed. Compare symmetry and spread in the table. Without independence or with varying p, this model may be unsuitable."]
  },
  derivative: {
    conjecture: ["Pour x², les pentes des sécantes tendent vers 2x lorsque h tend vers zéro par la gauche comme par la droite.", "For x², secant slopes approach 2x as h approaches zero from either side."],
    proof: ["Pour h ≠ 0, ((x + h)² − x²)/h = (2xh + h²)/h = 2x + h. Pour tout x fixé, la différence avec 2x est h, donc tend vers zéro des deux côtés. Le quotient n’est jamais calculé en h = 0.", "For h ≠ 0, ((x + h)² − x²)/h = (2xh + h²)/h = 2x + h. For fixed x, the difference from 2x is h, tending to zero from either side. The quotient is never evaluated at h = 0."],
    transfer: ["À comparer sur papier : pour |x| en x = 0, le quotient vaut 1 si h > 0 et −1 si h < 0. Les limites diffèrent : il n’y a pas de dérivée en 0.", "Compare on paper: for |x| at x = 0, the quotient is 1 for h > 0 and −1 for h < 0. The limits differ, so there is no derivative at 0."]
  },
  integral: {
    conjecture: ["Pour x² sur [0 ; 1], la somme à gauche est un minorant et la somme à droite un majorant de l’aire. Les deux tendent vers 1/3.", "For x² on [0, 1], the left sum bounds the area below and the right sum bounds it above. Both approach 1/3."],
    proof: ["Sur chaque intervalle, x² est compris entre ses valeurs aux extrémités. En sommant les aires, Lₙ ≤ I ≤ Rₙ. La différence Rₙ − Lₙ = (1² − 0²)/N = 1/N tend vers 0. La formule de la somme des carrés donne Lₙ = 1/3 − 1/(2N) + 1/(6N²). Au milieu, Mₙ = 1/3 − 1/(12N²). Ces formules justifient ici la convergence et les erreurs.", "On each interval, x² lies between its endpoint values. Summing areas gives Lₙ ≤ I ≤ Rₙ. The difference Rₙ − Lₙ = (1² − 0²)/N = 1/N tends to zero. The sum-of-squares formula gives Lₙ = 1/3 − 1/(2N) + 1/(6N²). Midpoints give Mₙ = 1/3 − 1/(12N²). These formulas justify convergence and errors for this function."],
    transfer: ["À discuter : une somme à gauche est-elle toujours un minorant ? Pour une fonction décroissante, le sens de l’encadrement s’inverse.", "Discuss: is a left sum always a lower bound? For a decreasing function, the bounds reverse."]
  },
  vectors: {
    conjecture: ["Pour deux vecteurs non nuls, un produit scalaire nul correspond à un angle droit.", "For two nonzero vectors, a zero dot product corresponds to a right angle."],
    proof: ["u · v = ‖u‖‖v‖ cos θ. Si les deux normes sont non nulles, u · v = 0 équivaut à cos θ = 0, donc θ = 90° pour l’angle entre vecteurs dans [0° ; 180°]. Avec un vecteur nul, le produit vaut 0 mais l’angle est indéfini.", "u · v = ‖u‖‖v‖ cos θ. If both norms are nonzero, u · v = 0 is equivalent to cos θ = 0, hence θ = 90° for the angle between vectors in [0°, 180°]. With a zero vector, the dot product is zero but the angle is undefined."],
    transfer: ["À tester : rends u nul. Puis prends v = −u avec u non nul. Que valent la somme et l’angle ?", "Make u zero. Then try v = −u with u nonzero. What are the sum and angle?"]
  },
  statistics: {
    conjecture: ["Remplacer une valeur x par x + d change la moyenne de d/n. La médiane dépend de l’ordre, pas de la grandeur de toutes les valeurs.", "Replacing one value x by x + d changes the mean by d/n. The median depends on order, not the magnitude of every value."],
    proof: ["La somme augmente de d et l’effectif n reste fixe : la moyenne augmente donc de d/n. La médiane est la valeur centrale de la liste ordonnée (ici, la moyenne des deux valeurs centrales si n est pair). Si une valeur extrême reste du même côté des positions centrales, la médiane ne change pas. L’écart-type affiché décrit toute la série et utilise le diviseur n, pas n − 1.", "The sum increases by d while n stays fixed, so the mean increases by d/n. The median is the central ordered value (here the average of the two central values for even n). If an extreme value stays on the same side of the central positions, the median stays unchanged. The displayed standard deviation describes the whole data set and divides by n, not n − 1."],
    transfer: ["À tester : 2 ; 3 ; 4 ; 5 ; 100 puis 2 ; 3 ; 4 ; 5 ; 1000. La médiane ne change pas ici ; elle peut changer si une valeur traverse la position centrale.", "Try 2; 3; 4; 5; 100, then 2; 3; 4; 5; 1000. The median stays fixed here; it can change when a value crosses the central position."]
  },
  galton: {
    conjecture: ["Avec p = 1/2, la répartition est symétrique et se concentre autour du centre quand le nombre de billes augmente.", "With p = 1/2 the distribution is symmetric and concentrates around the centre as the number of balls grows."],
    proof: ["Une bille fait n choix indépendants gauche/droite. La probabilité d’aboutir dans la case k est C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ : il y a C(n,k) trajets à k virages à droite, chacun de probabilité pᵏ(1 − p)ⁿ⁻ᵏ. L’espérance est np. La simulation illustre ce résultat, elle ne le démontre pas.", "A ball makes n independent left/right choices. The probability of bin k is C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ: there are C(n,k) paths with k right turns, each of probability pᵏ(1 − p)ⁿ⁻ᵏ. The mean is np. The simulation illustrates this result; it does not prove it."],
    transfer: ["À tester : p = 0,2 avec 12 rangées. La courbe est-elle encore symétrique ? Où est son sommet ?", "Try p = 0.2 with 12 rows. Is the curve still symmetric? Where is its peak?"]
  },
  reuleaux: {
    conjecture: ["Un polygone de Reuleaux à n sommets (n impair) garde la même largeur dans toutes les directions et son périmètre vaut πw.", "A Reuleaux polygon with n vertices (n odd) has the same width in every direction and its perimeter equals πw."],
    proof: ["Chaque arc a pour rayon w et pour angle π/n, donc pour longueur πw/n ; avec n arcs, le périmètre est πw. La largeur est constante car chaque point d’un arc est à distance w du sommet opposé, et deux tangentes parallèles touchent la courbe en un sommet et en un point de l’arc opposé. Ce raisonnement suppose n impair.", "Each arc has radius w and angle π/n, hence length πw/n; with n arcs the perimeter is πw. The width is constant because each point of an arc is at distance w from the opposite vertex, and two parallel tangents touch the curve at a vertex and at a point of the opposite arc. The argument assumes n is odd."],
    transfer: ["À discuter : pourquoi un carré ne peut-il pas être une courbe de largeur constante ? Calcule sa largeur selon l’axe puis selon la diagonale.", "Discuss: why can a square not be a curve of constant width? Compute its width along an axis and along a diagonal."]
  },
  platonic: {
    conjecture: ["Autour d’un sommet, il faut au moins 3 faces et la somme de leurs angles doit être strictement inférieure à 360° : cela ne laisse que cinq possibilités.", "At a vertex at least 3 faces are needed and their angles must add up to strictly less than 360°: only five possibilities remain."],
    proof: ["Le polygone régulier à p côtés a pour angle intérieur 180°(p − 2)/p. Avec q faces par sommet, la condition est q · 180°(p − 2)/p < 360°, soit (p − 2)(q − 2) < 4. Les couples (p,q) avec p, q ≥ 3 sont (3,3), (3,4), (3,5), (4,3), (5,3). Cette condition est nécessaire ; l’existence de chaque solide se vérifie par construction. Euler : S − A + F = 2.", "The regular p-gon has interior angle 180°(p − 2)/p. With q faces at a vertex the condition is q · 180°(p − 2)/p < 360°, i.e. (p − 2)(q − 2) < 4. The pairs (p,q) with p, q ≥ 3 are (3,3), (3,4), (3,5), (4,3), (5,3). This condition is necessary; the existence of each solid is checked by construction. Euler: V − E + F = 2."],
    transfer: ["À tester : trois hexagones en un sommet donnent exactement 360°. Que se passe-t-il : un solide ou un pavage du plan ?", "Try three hexagons at a vertex: exactly 360°. What happens: a solid or a tiling of the plane?"]
  },
  chaos: {
    conjecture: ["Quel que soit le point de départ, les points du jeu du chaos à trois sommets se rassemblent sur le triangle de Sierpiński.", "Whatever the starting point, the points of the three-vertex chaos game gather on the Sierpiński triangle."],
    proof: ["Chaque saut est l’homothétie de rapport 1/2 et de centre un sommet. Les trois homothéties envoient le triangle sur trois copies réduites ; l’ensemble limite K vérifie K = h₁(K) ∪ h₂(K) ∪ h₃(K). Le point de départ est « oublié » car chaque saut divise la distance à K par 2. La simulation illustre ; la preuve repose sur cette contraction.", "Each jump is the homothety of ratio 1/2 centred at a vertex. The three homotheties send the triangle to three reduced copies; the limit set K satisfies K = h₁(K) ∪ h₂(K) ∪ h₃(K). The starting point is “forgotten” because each jump halves the distance to K. The simulation illustrates; the proof rests on this contraction."],
    transfer: ["À tester : 4 sommets avec le rapport 1/2. Que remarques-tu ? Essaie ensuite le bouton « Valeur qui donne un joli motif ».", "Try 4 vertices with ratio 1/2. What do you notice? Then try the “Value that gives a clean pattern” button."]
  },
  complex: {
    conjecture: ["Multiplier par i conserve le module et fait tourner de 90° dans le sens direct. L’origine reste fixe.", "Multiplication by i preserves modulus and rotates 90° counterclockwise. The origin stays fixed."],
    proof: ["i(a + ib) = −b + ia, donc (a,b) devient (−b,a). Le module au carré reste a² + b². Pour z ≠ 0, les vecteurs (a,b) et (−b,a) ont un produit scalaire nul et leur déterminant vaut a² + b² > 0 : l’angle orienté vaut +90°. Pour z = 0, l’argument est indéfini.", "i(a + ib) = −b + ia, so (a,b) becomes (−b,a). Squared modulus remains a² + b². For z ≠ 0, vectors (a,b) and (−b,a) have zero dot product and determinant a² + b² > 0: the directed angle is +90°. For z = 0, the argument is undefined."],
    transfer: ["À tester : applique mentalement quatre multiplications par i. Pourquoi retrouves-tu z ? Utilise i⁴ = 1.", "Mentally multiply by i four times. Why do you recover z? Use i⁴ = 1."]
  },
  fourier: {
    conjecture: ["Plus on ajoute de cercles, plus la courbe tracée se rapproche de la forme, et les premiers cercles, les plus grands, suffisent à reconnaître l’île.", "The more circles are added, the closer the traced curve gets to the shape, and the first, largest circles are enough to recognise the island."],
    proof: ["Une courbe fermée z(t), périodique de période 1, se développe en série de Fourier z(t) = Σ cₖ e^(2iπkt). Chaque terme est un mouvement circulaire uniforme de rayon |cₖ| et de fréquence k. Pour des points échantillonnés, la transformée de Fourier discrète donne les cₖ et la somme complète redonne exactement les points. L’erreur quadratique moyenne de la somme partielle vaut la somme des |cₖ|² des termes omis (égalité de Parseval), donc ranger les cercles par rayon décroissant la fait diminuer le plus vite.", "A closed curve z(t) of period 1 expands as a Fourier series z(t) = Σ cₖ e^(2iπkt). Each term is a uniform circular motion of radius |cₖ| and frequency k. For sampled points, the discrete Fourier transform gives the cₖ and the full sum returns the points exactly. The mean squared error of a partial sum equals the sum of |cₖ|² over the omitted terms (Parseval), so ordering the circles by decreasing radius makes it fall fastest."],
    transfer: ["À tester : dessine un carré, puis un cercle. Combien de cercles faut-il pour chacun, et pourquoi le cercle n’en demande-t-il qu’un ?", "Try drawing a square, then a circle. How many circles does each need, and why does the circle need only one?"]
  },
  mandelbrot: {
    conjecture: ["Les points proches du centre de l’ensemble ne s’échappent jamais ; ceux loin de lui s’échappent vite ; le bord est infiniment détaillé.", "Points near the middle of the set never escape; those far from it escape quickly; the edge is endlessly detailed."],
    proof: ["Si |c| > 2, alors |z₁| = |c| > 2 et, par récurrence, |zₙ₊₁| ≥ |zₙ|² − |c| > |zₙ|, donc la suite tend vers l’infini. Plus généralement, dès qu’un terme dépasse 2 en module, la suite s’échappe : c’est ce critère qui permet de tester chaque point par un nombre fini d’itérations. L’ensemble est donc contenu dans le disque de rayon 2.", "If |c| > 2 then |z₁| = |c| > 2 and, by induction, |zₙ₊₁| ≥ |zₙ|² − |c| > |zₙ|, so the sequence tends to infinity. More generally, as soon as a term exceeds 2 in modulus the sequence escapes: this is the criterion that lets each point be tested with finitely many iterations. The set is therefore contained in the disc of radius 2."],
    transfer: ["À tester : c = −1 donne la suite 0, −1, 0, −1… Pourquoi ce point est-il dans l’ensemble ? Trouve un autre point du même genre.", "Try c = −1: the sequence is 0, −1, 0, −1… Why is that point in the set? Find another point of the same kind."]
  }
};
const quizStates = {
  quadratic: {values:[1,0,-4]}, trig:{values:[180]},
  sequences:{values:[3,2,5],mode:"geometric"}, probability:{values:[10,0.3]},
  derivative:{values:[3,0.01],direction:1}, integral:{values:[8],method:"left"},
  vectors:{values:[2,1,-1,2]}, statistics:{data:"2 3 4 5 100"}, complex:{values:[3,4]},
  galton:{}, reuleaux:{}, platonic:{}, chaos:{}, fourier:{}, mandelbrot:{}
};
for (const lab of labs) {
  lab.reasoning = reasoning[lab.id];
  lab.quizState = quizStates[lab.id];
}

// The statement, the expected answer, the hints and the worked solution of each challenge come from its variant
// (challenge-variants.js) with the default parameters: one source, so the page and the tests cannot drift apart.
const challengeBase = [
  {
    id: "doors",
    type: "play",
    title: ["Les 100 portes", "The 100 doors"],
    topic: ["Nombres entiers", "Whole numbers"],
    difficulty: 2,
    minutes: 10,
    hints: [["La porte n change d’état une fois par diviseur positif de n.", "Door n is toggled once for each positive divisor of n."], ["Les diviseurs se regroupent par paires d et n/d. Quand sont-ils égaux ?", "Divisors pair up as d and n/d. When are they equal?"]],
    extension: ["Combien de portes restent ouvertes s’il y en a N ? Explique pourquoi.", "How many remain open with N doors? Explain why."],
  },
  {
    id: "chess",
    type: "play",
    title: ["Des dominos sur un plateau mutilé", "Dominoes on a damaged board"],
    topic: ["Pavages", "Tilings"],
    difficulty: 2,
    minutes: 10,
    hints: [["Colorie les cases en noir et blanc.", "Colour the squares black and white."], ["Chaque domino couvre une case de chaque couleur. Que dire des deux cases retirées ?", "Every domino covers one square of each colour. What can you say about the two removed squares?"]],
    extension: ["Si on retire deux cases de couleurs différentes quelconques, le plateau 8 × 8 reste-t-il toujours pavable ? Cherche avant de conclure.", "If two squares of different colours are removed, can the 8 × 8 board always be tiled? Investigate before concluding."],
  },
  {
    id: "nim",
    type: "play",
    title: ["Le jeu des 21 pierres", "The 21-stone game"],
    topic: ["Stratégie", "Strategy"],
    difficulty: 2,
    minutes: 8,
    hints: [["Avec 4 pierres, le joueur qui doit jouer perd contre un adversaire parfait.", "With 4 stones, the player to move loses against perfect play."], ["Après le premier coup, complète chaque coup adverse pour retirer 4 pierres au total.", "After your first move, complement each opponent move to remove 4 stones in total."]],
    extension: ["Adapte la stratégie si on peut retirer de 1 à 5 pierres.", "Adapt the strategy when players may remove 1 to 5 stones."],
  },
  {
    id: "pigeonhole",
    type: "olympiad",
    title: ["Une différence multiple de 7", "A difference that is a multiple of 7"],
    topic: ["Arithmétique", "Number theory"],
    difficulty: 2,
    minutes: 10,
    hints: [["Classe les entiers selon leur reste dans la division par 7.", "Sort integers by their remainder when divided by 7."], ["Il n’y a que sept restes possibles. Montre aussi que sept entiers ne suffisent pas toujours.", "There are only seven possible remainders. Also show that seven integers do not always suffice."]],
    extension: ["Généralise à la divisibilité par m et rédige les deux parties de la preuve.", "Generalize to divisibility by m and write both parts of the proof."],
  },
  {
    id: "squares",
    type: "olympiad",
    title: ["Additionner des nombres impairs", "Adding odd numbers"],
    topic: ["Sommes", "Sums"],
    difficulty: 1,
    minutes: 8,
    hints: [["Le k-ième entier impair est 2k − 1. Combien de termes y a-t-il ?", "The kth odd integer is 2k − 1. How many terms are there?"], ["Pour passer d’un carré de côté k − 1 à un carré de côté k, ajoute une bordure de 2k − 1 points.", "To grow a square of side k − 1 into a square of side k, add a border of 2k − 1 dots."]],
    extension: ["Rédige aussi une preuve par récurrence.", "Also write a proof by induction."],
  },
  {
    id: "hanoi",
    type: "play",
    title: ["Les tours de Hanoï", "The Tower of Hanoi"],
    topic: ["Récurrence", "Recursion"],
    difficulty: 2,
    minutes: 10,
    hints: [["Commence avec 1, 2 puis 3 disques et note le nombre minimal de coups.", "Start with 1, 2 then 3 disks and note the minimum number of moves."], ["Pour bouger le plus grand disque, les autres doivent être ailleurs. Combien de coups pour les y mettre, puis pour les remettre dessus ?", "To move the largest disk, the others must be elsewhere. How many moves to put them there, then back on top?"]],
    extension: ["Démontre par récurrence que u(n) = 2^n − 1, puis montre que le plus petit disque bouge un coup sur deux.", "Prove by induction that u(n) = 2^n − 1, then show that the smallest disk moves every other move."],
  },
  {
    id: "eggs",
    type: "play",
    title: ["Les deux œufs d’autruche", "The two ostrich eggs"],
    topic: ["Optimisation", "Optimization"],
    difficulty: 3,
    minutes: 15,
    hints: [["Avec un seul œuf, la seule méthode sûre est de monter un étage à la fois.", "With a single egg the only safe method is to climb one floor at a time."], ["Si le premier œuf se brise au k-ième lancer, combien de lancers restent-ils au second ? Fais diminuer le pas à chaque lancer.", "If the first egg breaks on the kth drop, how many drops does the second have left? Make the step shrink with each drop."]],
    extension: ["Que devient la réponse avec 3 œufs ? Cherche un tableau « étages couverts » en fonction du nombre d’œufs et de lancers.", "What happens with 3 eggs? Look for a table of floors covered as a function of eggs and drops."],
  },
  {
    id: "konigsberg",
    type: "play",
    title: ["Les sept ponts de Königsberg", "The seven bridges of Königsberg"],
    topic: ["Graphes", "Graphs"],
    difficulty: 2,
    minutes: 10,
    hints: [["Pour chaque quartier, compte les ponts qui y arrivent.", "For each district, count the bridges that reach it."], ["Quand tu traverses un quartier, tu utilises deux ponts : un pour entrer, un pour sortir. Que peut-il se passer au départ et à l’arrivée ?", "Passing through a district uses two bridges: one in, one out. What can differ at the start and at the end?"]],
    extension: ["Quelle condition sur les degrés permet une promenade qui revient à son point de départ ?", "What condition on the degrees allows a walk that returns to its starting point?"],
  },
  {
    id: "josephus",
    type: "play",
    title: ["Le cercle de Josèphe", "The Josephus circle"],
    topic: ["Récurrence", "Recursion"],
    difficulty: 3,
    minutes: 12,
    hints: [["Cherche la survivante pour n = 1, 2, 3, …, 10 : quel motif apparaît quand n est une puissance de 2 ?", "Find the survivor for n = 1, 2, 3, …, 10: what pattern appears when n is a power of 2?"], ["Après avoir éliminé assez de personnes pour tomber sur une puissance de 2, qui est la première personne sautée ?", "After removing enough people to land on a power of 2, who is the first person skipped?"]],
    extension: ["Écris le numéro du survivant en binaire à partir de celui de n : que remarques-tu ?", "Write n in binary and the survivor’s number in binary: what do you notice?"],
  },
  {
    id: "ramsey",
    type: "olympiad",
    title: ["Trois amis ou trois inconnus", "Three friends or three strangers"],
    topic: ["Graphes", "Graph theory"],
    difficulty: 3,
    minutes: 15,
    hints: [["Montre d’abord que 5 ne suffit pas : cherche un coloriage des traits d’un pentagone et de ses diagonales sans trio d’une seule couleur.", "First show that 5 is not enough: look for a colouring of a pentagon’s sides and diagonals with no one-colour trio."], ["Avec 6 personnes, fixe l’une d’elles et regarde ses 5 relations avec les autres : le principe des tiroirs s’applique.", "With 6 people, fix one of them and look at her 5 relations with the others: the pigeonhole principle applies."]],
    extension: ["Combien de trios faut-il vérifier pour 6 personnes ? Pourquoi R(3, 3) = 6 ne dépend-il pas du coloriage choisi ?", "How many trios must be checked for 6 people? Why does R(3, 3) = 6 not depend on the colouring chosen?"],
  },
  {
    id: "artgallery",
    type: "olympiad",
    title: ["Le problème de la galerie d’art", "The art gallery problem"],
    topic: ["Géométrie", "Geometry"],
    difficulty: 3,
    minutes: 15,
    hints: [["Découpe le polygone en triangles par des diagonales intérieures. Un gardien posé sur un sommet d’un triangle voit tout ce triangle.", "Cut the polygon into triangles with inside diagonals. A guard standing at a vertex of a triangle sees the whole triangle."], ["Colorie les sommets avec trois couleurs pour que chaque triangle porte les trois couleurs. Que dire de la couleur la moins utilisée ?", "Colour the vertices with three colours so that each triangle carries all three. What can you say about the least-used colour?"]],
    extension: ["Construis une galerie à 15 côtés qui exige 5 gardiens. Peut-on faire mieux avec des gardiens qui se déplacent le long d’un mur ?", "Build a 15-sided gallery that needs 5 guards. Can guards who patrol along a wall do better?"],
  },
  {
    id: "gridpaths",
    type: "play",
    title: ["Les chemins du quadrillage", "Paths on a grid"],
    topic: ["Dénombrement", "Counting"],
    difficulty: 2,
    minutes: 10,
    hints: [],
    extension: ["Que devient le nombre de chemins s’il faut éviter un carrefour ? Et pour une grille en trois dimensions ?", "What happens to the number of paths if one crossing must be avoided? And for a three-dimensional grid?"],
  },
  {
    id: "horses",
    type: "olympiad",
    title: ["Les 25 chevaux", "The 25 horses"],
    topic: ["Algorithmes", "Algorithms"],
    difficulty: 3,
    minutes: 15,
    hints: [],
    extension: ["Cherche une méthode pour trouver les deux plus rapides, puis le classement complet. Combien de courses faut-il, au minimum, pour les ordonner tous ?", "Look for a method to find the two fastest, then the complete ranking. At least how many races are needed to order them all?"],
  },
  {
    id: "cake",
    type: "olympiad",
    title: ["Le gâteau cubique à partager", "Sharing the cubic cake"],
    topic: ["Géométrie dans l’espace", "Solid geometry"],
    difficulty: 3,
    minutes: 12,
    hints: [],
    extension: ["Le partage reste-t-il équitable si la crème couvre aussi le dessous ? Et pour un gâteau en forme de pavé droit à base carrée ?", "Does the sharing stay fair if the cream covers the bottom too? And for a square-based cuboid cake?"],
  },
  {
    id: "queens",
    type: "play",
    title: ["Des dames qui laissent des cases libres", "Queens that leave free squares"],
    topic: ["Combinatoire", "Combinatorics"],
    difficulty: 3,
    minutes: 12,
    hints: [],
    extension: ["Compare avec le problème inverse : placer le plus petit nombre de dames qui attaquent toutes les cases d’un échiquier 5 × 5.", "Compare with the opposite problem: place the fewest queens that attack every square of a 5 × 5 board."],
  },
  {
    id: "snail",
    type: "play",
    title: ["L’escargot et le poteau", "The snail on the post"],
    topic: ["Suites arithmétiques", "Arithmetic sequences"],
    difficulty: 1,
    minutes: 6,
    hints: [],
    extension: ["Que se passe-t-il si l’escargot glisse autant qu’il monte ? Et s’il glisse davantage ?", "What happens if the snail slips as much as it climbs? Or more?"],
  },
  {
    id: "bridge",
    type: "play",
    title: ["Quatre soldats sur un pont", "Four soldiers on a bridge"],
    topic: ["Optimisation", "Optimisation"],
    difficulty: 2,
    minutes: 10,
    hints: [],
    extension: ["Trouve des temps pour lesquels le plan 2 est meilleur que le plan 1, puis des temps pour lesquels ils sont à égalité.", "Find crossing times for which plan 2 beats plan 1, and times for which they tie."],
  },
  {
    id: "lighteggs",
    type: "play",
    title: ["L’œuf abîmé", "The spoiled egg"],
    topic: ["Logique et dénombrement", "Logic and counting"],
    difficulty: 2,
    minutes: 8,
    hints: [],
    extension: ["Et si l’on ignore si l’œuf abîmé est plus léger ou plus lourd ? Combien de pesées pour 12 œufs, en sachant aussi dire lequel ?", "What if you do not know whether the spoiled egg is lighter or heavier? How many weighings for 12 eggs, also telling which?"],
  },
  {
    id: "fakecoins",
    type: "play",
    title: ["Les piles de fausses pièces", "The piles of fake coins"],
    topic: ["Raisonnement", "Reasoning"],
    difficulty: 2,
    minutes: 8,
    hints: [],
    extension: ["Plusieurs piles peuvent contenir de fausses pièces. Comment adapter les nombres de pièces prises dans chaque pile (pense aux puissances de 2) ?", "Several piles may hold fake coins. How should the numbers of coins taken from each pile be adapted (think of powers of 2)?"],
  },
  {
    id: "reflect",
    type: "play",
    title: ["Le chemin le plus court par la rivière", "The shortest way via the river"],
    topic: ["Géométrie euclidienne", "Euclidean geometry"],
    difficulty: 2,
    minutes: 10,
    hints: [],
    extension: ["Que devient le problème si A et B sont de part et d’autre de la rivière ? Et s’il y a deux rivières perpendiculaires à traverser dans l’ordre ?", "What becomes of the problem if A and B are on opposite sides of the river? And with two perpendicular rivers to visit in order?"],
  },
  {
    id: "lunes",
    type: "play",
    title: ["Les lunules d’Hippocrate", "Hippocrates’ lunes"],
    topic: ["Aires et cercles", "Areas and circles"],
    difficulty: 2,
    minutes: 10,
    hints: [],
    extension: ["Que devient la somme des aires des lunules si le triangle n’est plus rectangle ? Compare avec l’aire du triangle.", "What becomes of the total area of the lunes if the triangle is no longer right-angled? Compare it with the area of the triangle."],
  },
  {
    id: "star",
    type: "olympiad",
    title: ["Les angles de l’étoile", "The angles of the star"],
    topic: ["Angles et cercle", "Angles and circles"],
    difficulty: 2,
    minutes: 10,
    hints: [],
    extension: ["Que devient la somme des angles aux pointes d’une étoile à 5 branches dessinée sans régularité (cinq points quelconques sur un cercle) ?", "What becomes of the sum of the tip angles of a 5-pointed star drawn without regularity (five arbitrary points on a circle)?"],
  },
  {
    id: "box",
    type: "play",
    title: ["La fourmi sur la boîte", "The ant on the box"],
    topic: ["Géométrie dans l’espace", "Solid geometry"],
    difficulty: 3,
    minutes: 12,
    hints: [],
    extension: ["Et si la fourmi va d’un coin au milieu d’une arête opposée ? Et sur un cube ?", "And if the ant goes from a corner to the middle of an opposite edge? And on a cube?"],
  },
  {
    id: "merge",
    type: "olympiad",
    title: ["Efface deux nombres", "Erase two numbers"],
    topic: ["Invariants", "Invariants"],
    difficulty: 3,
    minutes: 12,
    hints: [],
    extension: ["Remplace la règle par « a et b deviennent |a − b| » avec les nombres 1 à 100 : quelle propriété du résultat est invariante ?", "Replace the rule by “a and b become |a − b|” with the numbers 1 to 100: which property of the result is invariant?"],
  },
  {
    id: "cham",
    type: "olympiad",
    title: ["Les caméléons", "The chameleons"],
    topic: ["Invariants", "Invariants"],
    difficulty: 3,
    minutes: 15,
    hints: [],
    extension: ["Pour quels effectifs (r, v, b) peut-on rendre tous les caméléons bleus ? Énonce une condition simple.", "For which counts (r, g, b) can all the chameleons be made blue? State a simple condition."],
  },
  {
    id: "pegs",
    type: "olympiad",
    title: ["Trois pions qui sautent", "Three jumping pegs"],
    topic: ["Invariants", "Invariants"],
    difficulty: 2,
    minutes: 12,
    hints: [],
    extension: ["Change les positions de départ, par exemple (0, 0), (2, 0), (0, 1) : quels points peut-on atteindre ? Que devient l’invariant ?", "Change the starting positions, for example (0, 0), (2, 0), (0, 1): which points can be reached? What becomes of the invariant?"],
  },
  {
    id: "inversions",
    type: "play",
    title: ["Ranger une rangée", "Sorting a row"],
    topic: ["Monovariants", "Monovariants"],
    difficulty: 2,
    minutes: 10,
    hints: [],
    extension: ["Pourquoi l’algorithme s’arrête-t-il toujours ? Combien d’échanges au maximum pour une rangée de n personnes ?", "Why does the process always stop? What is the largest number of swaps for a row of n people?"],
  },
  {
    id: "piles",
    type: "play",
    title: ["Le partage des cailloux", "Splitting the pebbles"],
    topic: ["Invariants", "Invariants"],
    difficulty: 2,
    minutes: 8,
    hints: [],
    extension: ["Remplace le produit a × b par a + b, puis par a² + b² : que peut-on dire de la somme finale ?", "Replace the product a × b by a + b, then by a² + b²: what can be said of the final sum?"],
  },
];
export const challenges = challengeBase.map((c) => {
  const v = VARIANTS[c.id], q = defaults(c.id);
  return { ...c, prompt: v.prompt(q), answer: v.answer(q), solution: v.solution(q), hints: v.hints ? v.hints(q) : c.hints };
});

export const pathways = [
  {
    id:"mg", label:"MG", name:["Programme malagasy","Malagasy curriculum"],
    intro:["Repères tirés des répartitions ministérielles 2024–2025 pour T10 et les séries S, OSE, L. Leur validité pour 2026–2027 reste à confirmer avec ton enseignant. Les anciens documents A/C/D ne sont pas interchangeables.", "Guides based on ministry distributions for 2024–2025: T10 and streams S, OSE, L. Their applicability to 2026–2027 still needs confirmation with your teacher. Older A/C/D documents are not interchangeable."],
    stages:[
      {name:["T10 · Algèbre et vecteurs","T10 · Algebra and vectors"],ids:["quadratic","vectors"],note:["Le produit scalaire est un approfondissement ici.","The dot product is an extension here."]},
      {name:["T11 S · Analyse et géométrie","T11 S · Calculus and geometry"],ids:["quadratic","trig","sequences","derivative","vectors"]},
      {name:["T11 OSE & L · Algèbre et analyse","T11 OSE & L · Algebra and calculus"],ids:["quadratic","sequences","derivative"]},
      {name:["T11 OSE · Statistiques","T11 OSE · Statistics"],ids:["statistics"]},
      {name:["T12 S · Approfondir","T12 S · Extend"],ids:["probability","integral","complex"],note:["Explorations partielles, pas une couverture complète. T12 OSE/L : correspondances encore à vérifier.","Partial explorations, not full coverage. T12 OSE/L mappings still need review."]}
    ],
    source:"https://www.education.gov.mg/repartition-annuelle-du-programme-detudes/",
    sourceName:["MEN · Répartitions T10, T11/T12 S, OSE, L (2024–2025)","Ministry · T10, T11/T12 S, OSE, L distributions (2024–2025)"]
  },
  {
    id:"fr",label:"FR",name:["Programme français","French curriculum"],
    intro:["Voie générale : seconde et première, programmes 2026–2027 ; terminale spécialité, programme 2019 encore applicable en 2026–2027. Le nouveau programme de terminale s’applique en 2027–2028. Les voies technologiques et les maths complémentaires ne sont pas cartographiées ici.","General pathway: seconde and première use the 2026–2027 programmes; terminale specialty still uses the 2019 programme in 2026–2027. Its new programme starts in 2027–2028. Technological pathways and maths complémentaires are not mapped here."],
    stages:[
      {name:["Seconde · Explorer","Seconde · Explore"],ids:["statistics","vectors","quadratic"],note:["Vecteurs : addition et coordonnées. Produit scalaire et discriminant général : prolongements, pas des attendus de seconde.","Vectors: addition and coordinates. Dot products and the general discriminant are extensions, not seconde requirements."]},
      {name:["Première · Spécialité","Première · Specialty"],ids:["quadratic","trig","sequences","derivative","vectors","probability"],note:["Probabilités (BO n° 14 du 2 avril 2026) : indépendance, probabilités totales, arbre de n ⩽ 4 épreuves de Bernoulli, espérance et variance. Le labo de probabilités s’utilise avec n ⩽ 4 et un arbre ; la loi binomiale B(n, p) relève de la terminale.","Probability (BO no. 14, 2 April 2026): independence, total probability, trees for n ⩽ 4 Bernoulli trials, expectation and variance. Use the probability lab with n ⩽ 4 and a tree; the binomial distribution B(n, p) belongs to terminale."]},
      {name:["Terminale · Spécialité (2026–2027)","Terminale · Specialty (2026–2027)"],ids:["probability","integral"]},
      {name:["Terminale · Option maths expertes","Terminale · Maths expertes option"],ids:["complex"]}
    ],
    source:"https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt",
    sourceName:["MEN · Programmes et options du lycée","Ministry · Lycée programmes and options"]
  },
  {
    id:"int",label:"INT",icon:"globe",name:["International","International"],
    intro:["Deux référentiels pour commencer : le Baccalauréat International (IB) et le SAT. Les placements sont pédagogiques et indicatifs ; les explorations couvrent une partie seulement de chaque référentiel.","Two frameworks to start with: the International Baccalaureate (IB) and the SAT. Placements are pedagogical suggestions; the explorations cover only part of each framework."],
    programmes:[{
    id:"ib",name:["Baccalauréat International (IB)","International Baccalaureate (IB)"],
    intro:["AA = Analysis and Approaches ; AI = Applications and Interpretation. SL = niveau moyen ; HL = niveau supérieur. Les repères ci-dessous distinguent le programme actuel (première évaluation 2021) des changements pour la première évaluation 2029.","AA = Analysis and Approaches; AI = Applications and Interpretation. SL = standard level; HL = higher level. These guides distinguish the current syllabus (first assessment 2021) from changes for first assessment 2029."],
    stages:[
      {name:["AA & AI · SL/HL · Idées communes","AA & AI · SL/HL · Shared ideas"],ids:["quadratic","sequences","statistics","probability","derivative","integral"]},
      {name:["AA SL/HL & AI HL · Cercle unité","AA SL/HL & AI HL · Unit circle"],ids:["trig"],note:["AI SL : trigonométrie des triangles ; cette activité sur les radians et les angles orientés est un prolongement.","AI SL: triangle trigonometry; this activity on radians and directed angles is an extension."]},
      {name:["AA & AI · HL · Vecteurs","AA & AI · HL · Vectors"],ids:["vectors"]},
      {name:["AA HL · Complexes","AA HL · Complex numbers"],ids:["complex"]},
      {name:["AI HL · Complexes : programme actuel seulement","AI HL · Complex numbers: current syllabus only"],ids:["complex"],note:["Retirés pour les élèves commençant en août 2027 (première évaluation en mai 2029). Ils restent une exploration facultative.","Removed for students starting in August 2027 (first assessment May 2029). They remain optional enrichment."]}
    ],
    source:"https://ibo.org/programmes/diploma-programme/curriculum/mathematics/",
    sourceName:["IB · Cours actuels et première évaluation 2029","IB · Current courses and first assessment 2029"]
  },{
    id:"sat",name:["SAT Math","SAT Math"],
    intro:["Le SAT numérique comporte une section de mathématiques de 44 questions en deux modules, répartie en quatre domaines. Les parts indiquées sont approximatives et varient d’un document à l’autre : vérifie la fiche College Board en vigueur. Dérivation et intégration ne figurent pas dans ces domaines.","The digital SAT has one maths section of 44 questions in two modules, split across four domains. The shares shown are approximate and differ between documents: check the current College Board specification. Differentiation and integration are not among these domains."],
    stages:[
      {name:["Algèbre · environ 35 %","Algebra · about 35%"],ids:[],note:["Équations et inéquations affines, fonctions affines, systèmes de deux équations. Pas encore d’exploration dédiée.","Linear equations and inequalities, linear functions, systems of two equations. No dedicated exploration yet."]},
      {name:["Mathématiques avancées · environ 35 %","Advanced math · about 35%"],ids:["quadratic","sequences"],note:["Équations et fonctions non linéaires : quadratiques, exponentielles, polynomiales. Les suites géométriques donnent le modèle discret de la croissance exponentielle.","Nonlinear equations and functions: quadratic, exponential, polynomial. Geometric sequences give the discrete model of exponential growth."]},
      {name:["Résolution de problèmes et analyse de données · environ 15 %","Problem-solving and data analysis · about 15%"],ids:["statistics","probability"],note:["Données à une et deux variables, probabilités. Probabilités conditionnelles, marge d’erreur, rapports et pourcentages : pas encore couverts.","One- and two-variable data, probability. Conditional probability, margin of error, ratios and percentages: not yet covered."]},
      {name:["Géométrie et trigonométrie · environ 15 %","Geometry and trigonometry · about 15%"],ids:["trig"],note:["Triangles rectangles et trigonométrie. Aires, volumes, angles et cercles : pas encore couverts.","Right triangles and trigonometry. Area, volume, angles and circles: not yet covered."]}
    ],
    source:"https://satsuite.collegeboard.org/sat/whats-on-the-test/math/overview",
    sourceName:["College Board · SAT, section Mathématiques (consulté le 13 octobre 2026)","College Board · SAT Math section (consulted 13 October 2026)"]
  }]
  },
  universityPathway(university)
];

// Stages of a pathway, whether it lists them directly or through programmes.
export const pathwayStages = (p) => (p.programmes ? p.programmes.flatMap((x) => x.stages) : p.stages);
