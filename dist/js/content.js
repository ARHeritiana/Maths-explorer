// Bilingual content: every pair is [French, English]. Topic placements are indicative.
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
        "Avec deux rectangles, pourquoi l’approximation est-elle inférieure à l’aire exacte ?",
        "With two rectangles, why is the approximation below the exact area?",
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
    symbol: "v⃗",
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
      "Déplace z = a + ib dans le plan. Multiplier par i fait tourner le point.",
      "Move z = a + ib in the plane. Multiplying by i rotates the point.",
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
        "Compare z et iz = −b + ia. Que devient la distance à l’origine ?",
        "Compare z and iz = −b + ia. What happens to the distance from the origin?",
      ],
      [
        "Multiplie mentalement encore par i : i²z = −z. Décris la rotation totale.",
        "Mentally multiply by i again: i²z = −z. Describe the total rotation.",
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
  complex: {
    conjecture: ["Multiplier par i conserve le module et fait tourner de 90° dans le sens direct. L’origine reste fixe.", "Multiplication by i preserves modulus and rotates 90° counterclockwise. The origin stays fixed."],
    proof: ["i(a + ib) = −b + ia, donc (a,b) devient (−b,a). Le module au carré reste a² + b². Pour z ≠ 0, les vecteurs (a,b) et (−b,a) ont un produit scalaire nul et leur déterminant vaut a² + b² > 0 : l’angle orienté vaut +90°. Pour z = 0, l’argument est indéfini.", "i(a + ib) = −b + ia, so (a,b) becomes (−b,a). Squared modulus remains a² + b². For z ≠ 0, vectors (a,b) and (−b,a) have zero dot product and determinant a² + b² > 0: the directed angle is +90°. For z = 0, the argument is undefined."],
    transfer: ["À tester : applique mentalement quatre multiplications par i. Pourquoi retrouves-tu z ? Utilise i⁴ = 1.", "Mentally multiply by i four times. Why do you recover z? Use i⁴ = 1."]
  }
};
const quizStates = {
  quadratic: {values:[1,0,-4]}, trig:{values:[180]},
  sequences:{values:[3,2,5],mode:"geometric"}, probability:{values:[10,0.3]},
  derivative:{values:[3,0.01],direction:1}, integral:{values:[8],method:"left"},
  vectors:{values:[2,1,-1,2]}, statistics:{data:"2 3 4 5 100"}, complex:{values:[3,4]}
};
for (const lab of labs) {
  lab.reasoning = reasoning[lab.id];
  lab.quizState = quizStates[lab.id];
}

export const challenges = [
  {
    id: "handshakes",
    type: "play",
    title: [
      "Une salle, beaucoup de poignées de main",
      "A room full of handshakes",
    ],
    topic: ["Combinatoire", "Counting"],
    difficulty: 1,
    minutes: 5,
    prompt: [
      "Six personnes se serrent la main. Chaque paire se salue exactement une fois. Combien y a-t-il de poignées de main ?",
      "Six people shake hands. Every pair shakes hands exactly once. How many handshakes are there?",
    ],
    answer: 15,
    hints: [
      [
        "Chaque personne salue cinq autres personnes.",
        "Each person greets five other people.",
      ],
      [
        "Le produit 6 × 5 compte chaque paire deux fois.",
        "The product 6 × 5 counts every pair twice.",
      ],
    ],
    solution: [
      "Il y a 6 × 5 / 2 = 15 paires. Pour n personnes, on obtient n(n − 1)/2.",
      "There are 6 × 5 / 2 = 15 pairs. For n people, the count is n(n − 1)/2.",
    ],
    extension: [
      "Justifie la formule générale avec un dessin ou un double comptage.",
      "Justify the general formula with a drawing or double counting.",
    ],
  },
  {
    id: "doors",
    type: "play",
    title: ["Les 100 portes", "The 100 doors"],
    topic: ["Nombres entiers", "Whole numbers"],
    difficulty: 2,
    minutes: 10,
    prompt: [
      "100 portes sont fermées. Au passage k, on change l’état des portes dont le numéro est un multiple de k, pour k = 1 à 100. Combien restent ouvertes ?",
      "100 doors start closed. On pass k, toggle every door whose number is a multiple of k, for k = 1 to 100. How many doors remain open?",
    ],
    answer: 10,
    hints: [
      [
        "La porte n change d’état une fois par diviseur positif de n.",
        "Door n is toggled once for each positive divisor of n.",
      ],
      [
        "Les diviseurs se regroupent par paires d et n/d. Quand sont-ils égaux ?",
        "Divisors pair up as d and n/d. When are they equal?",
      ],
    ],
    solution: [
      "Seuls les carrés parfaits ont un nombre impair de diviseurs : le diviseur √n se retrouve seul. Les portes 1², 2², …, 10² restent ouvertes, soit 10 portes.",
      "Only perfect squares have an odd number of divisors: √n is unpaired. Doors 1², 2², …, 10² remain open, so there are 10.",
    ],
    extension: [
      "Combien de portes restent ouvertes s’il y en a N ? Explique pourquoi.",
      "How many remain open with N doors? Explain why.",
    ],
  },
  {
    id: "chess",
    type: "play",
    title: ["Des dominos sur un plateau", "Dominoes on a board"],
    topic: ["Pavages", "Tilings"],
    difficulty: 2,
    minutes: 10,
    prompt: [
      "Un plateau de 8 × 8 cases a perdu deux coins opposés. On dispose d’autant de dominos 2 × 1 que l’on veut. Combien de pavages complets (sans trou ni chevauchement) existe-t-il ?",
      "An 8 × 8 board has lost two opposite corners. You have as many 2 × 1 dominoes as you like. How many complete tilings (no gaps, no overlaps) exist?",
    ],
    answer: 0,
    hints: [
      [
        "Colorie les cases en noir et blanc.",
        "Color the squares black and white.",
      ],
      [
        "Les coins opposés sont de même couleur. Chaque domino couvre deux couleurs différentes.",
        "Opposite corners have the same color. Every domino covers one square of each color.",
      ],
    ],
    solution: [
      "Il reste 30 cases d’une couleur et 32 de l’autre. Chaque domino couvre une case de chaque couleur. Un pavage exigerait des effectifs égaux : aucun pavage n’est possible.",
      "There are 30 squares of one color and 32 of the other. Every domino covers one of each. A tiling would require equal counts, so no tiling is possible.",
    ],
    extension: [
      "Si on retire deux cases de couleurs différentes, est-ce suffisant pour garantir un pavage ? Cherche avant de conclure.",
      "If two squares of different colors are removed, is that enough to guarantee a tiling? Investigate before concluding.",
    ],
  },
  {
    id: "nim",
    type: "play",
    title: ["Le jeu des 21 pierres", "The 21-stone game"],
    topic: ["Stratégie", "Strategy"],
    difficulty: 2,
    minutes: 8,
    prompt: [
      "Il y a 21 pierres. À tour de rôle, on en retire 1, 2 ou 3. Prendre la dernière fait gagner. Tu commences : combien dois-tu en prendre pour garantir la victoire avec un jeu parfait ?",
      "There are 21 stones. Players take turns removing 1, 2 or 3. Taking the last stone wins. You move first: how many should you take to guarantee victory with perfect play?",
    ],
    answer: 1,
    hints: [
      [
        "Avec 4 pierres, le joueur qui doit jouer perd contre un adversaire parfait.",
        "With 4 stones, the player to move loses against perfect play.",
      ],
      [
        "Après le premier coup, complète chaque coup adverse pour retirer 4 pierres au total.",
        "After your first move, complement each opponent move to remove 4 stones in total.",
      ],
    ],
    solution: [
      "Prends 1 pierre pour en laisser 20. Si l’adversaire prend k pierres, prends 4 − k. Tu lui laisses successivement 16, 12, 8, puis 4 pierres et tu prends la dernière.",
      "Take 1 to leave 20. If your opponent takes k, take 4 − k. You leave 16, 12, 8, then 4, and take the last stone.",
    ],
    extension: [
      "Adapte la stratégie si on peut retirer de 1 à 5 pierres.",
      "Adapt the strategy when players may remove 1 to 5 stones.",
    ],
  },
  {
    id: "pigeonhole",
    type: "olympiad",
    title: ["Une différence multiple de 7", "A difference that is a multiple of 7"],
    topic: ["Arithmétique", "Number theory"],
    difficulty: 2,
    minutes: 10,
    prompt: [
      "Quel est le plus petit nombre d’entiers distincts à choisir pour être certain que deux d’entre eux ont une différence divisible par 7 ?",
      "What is the smallest number of distinct integers you must choose to guarantee that two have a difference divisible by 7?",
    ],
    answer: 8,
    hints: [
      [
        "Classe les entiers selon leur reste dans la division par 7.",
        "Sort integers by their remainder when divided by 7.",
      ],
      [
        "Il n’y a que sept restes possibles. Montre aussi que sept entiers ne suffisent pas toujours.",
        "There are only seven possible remainders. Also show that seven integers do not always suffice.",
      ],
    ],
    solution: [
      "Avec 8 entiers et 7 restes, deux entiers ont le même reste, donc leur différence est divisible par 7. La liste 0, 1, …, 6 montre que 7 ne suffisent pas. Le minimum est donc 8.",
      "Among 8 integers and 7 remainders, two share a remainder, so their difference is divisible by 7. The list 0, 1, …, 6 shows that 7 are not enough. The minimum is 8.",
    ],
    extension: [
      "Généralise à la divisibilité par m et rédige les deux parties de la preuve.",
      "Generalize to divisibility by m and write both parts of the proof.",
    ],
  },
  {
    id: "product",
    type: "olympiad",
    title: ["Un diviseur commun à tous", "A divisor shared by all"],
    topic: ["Arithmétique", "Number theory"],
    difficulty: 2,
    minutes: 12,
    prompt: [
      "Quel est le plus grand entier positif qui divise n³ − n pour tout entier n ≥ 2 ?",
      "What is the largest positive integer that divides n³ − n for every integer n ≥ 2?",
    ],
    answer: 6,
    hints: [
      ["Factorise n³ − n.", "Factor n³ − n."],
      [
        "Regarde trois entiers consécutifs, puis utilise n = 2 pour borner le diviseur.",
        "Look at three consecutive integers, then use n = 2 to bound the divisor.",
      ],
    ],
    solution: [
      "n³ − n = (n − 1)n(n + 1). Parmi trois entiers consécutifs, l’un est divisible par 3 et au moins l’un est pair. Le produit est divisible par 6. Pour n = 2, il vaut 6, donc aucun diviseur commun plus grand n’est possible.",
      "n³ − n = (n − 1)n(n + 1). Among three consecutive integers, one is divisible by 3 and at least one is even. The product is divisible by 6. At n = 2 it equals 6, so no larger common divisor is possible.",
    ],
    extension: [
      "Explique pourquoi « divisible par 2 et par 3 » implique ici « divisible par 6 ».",
      "Explain why “divisible by 2 and by 3” implies “divisible by 6” here.",
    ],
  },
  {
    id: "inequality",
    type: "olympiad",
    title: ["Un minimum caché", "A hidden minimum"],
    topic: ["Extrema", "Extrema"],
    difficulty: 3,
    minutes: 12,
    prompt: [
      "Pour x > 0, quelle est la plus petite valeur possible de x + 1/x ?",
      "For x > 0, what is the smallest possible value of x + 1/x?",
    ],
    answer: 2,
    hints: [
      [
        "Un carré est toujours positif ou nul.",
        "A square is always nonnegative.",
      ],
      [
        "Développe (x − 1)² ≥ 0, puis divise par x > 0.",
        "Expand (x − 1)² ≥ 0, then divide by x > 0.",
      ],
    ],
    solution: [
      "(x − 1)² ≥ 0 donne x² − 2x + 1 ≥ 0. En divisant par x > 0, on obtient x + 1/x ≥ 2. L’égalité est atteinte pour x = 1 : le minimum vaut donc 2.",
      "(x − 1)² ≥ 0 gives x² − 2x + 1 ≥ 0. Dividing by x > 0 gives x + 1/x ≥ 2. Equality is attained at x = 1, so the minimum is 2.",
    ],
    extension: [
      "Trouve le minimum de x + a/x pour a > 0 et justifie le cas d’égalité.",
      "Find the minimum of x + a/x for a > 0 and justify the equality case.",
    ],
  },
  {
    id: "squares",
    type: "olympiad",
    title: ["Additionner des nombres impairs", "Adding odd numbers"],
    topic: ["Sommes", "Sums"],
    difficulty: 1,
    minutes: 8,
    prompt: [
      "Combien vaut 1 + 3 + 5 + … + 39 ? Cherche une méthode qui explique aussi le résultat pour n termes.",
      "What is 1 + 3 + 5 + … + 39? Find a method that also explains the result for n terms.",
    ],
    answer: 400,
    hints: [
      [
        "Le k-ième entier impair est 2k − 1. Combien de termes y a-t-il ?",
        "The kth odd integer is 2k − 1. How many terms are there?",
      ],
      [
        "Pour passer d’un carré de côté k − 1 à un carré de côté k, ajoute une bordure de 2k − 1 points.",
        "To grow a square of side k − 1 into a square of side k, add a border of 2k − 1 dots.",
      ],
    ],
    solution: [
      "Il y a 20 termes car 39 = 2 × 20 − 1. Les bordures successives de 1, 3, 5, … points construisent un carré : la somme des n premiers impairs vaut n². Le résultat est 20² = 400.",
      "There are 20 terms because 39 = 2 × 20 − 1. Successive borders of 1, 3, 5, … dots build a square: the first n odd numbers sum to n². The result is 20² = 400.",
    ],
    extension: [
      "Rédige aussi une preuve par récurrence.",
      "Also write a proof by induction.",
    ],
  },
];

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
      {name:["Première · Spécialité","Première · Specialty"],ids:["quadratic","trig","sequences","derivative","vectors"]},
      {name:["Terminale · Spécialité (2026–2027)","Terminale · Specialty (2026–2027)"],ids:["probability","integral"]},
      {name:["Terminale · Option maths expertes","Terminale · Maths expertes option"],ids:["complex"]}
    ],
    source:"https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt",
    sourceName:["MEN · Programmes et options du lycée","Ministry · Lycée programmes and options"]
  },
  {
    id:"ib",label:"IB",name:["International Baccalaureate","International Baccalaureate"],
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
  }
];
