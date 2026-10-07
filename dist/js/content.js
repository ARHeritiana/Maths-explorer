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
    history: ["Al-Khwarizmi · vers 820", "Al-Khwarizmi · around 820"],
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
        "Diminue h. Vers quelle valeur la pente semble-t-elle tendre ?",
        "Decrease h. What value does the slope seem to approach?",
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
      "Approxime l’aire sous y = x² entre 0 et 1 avec des rectangles à gauche.",
      "Approximate the area under y = x² from 0 to 1 using left-endpoint rectangles.",
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
        "Augmente N. Observe la somme et l’écart à 1/3.",
        "Increase N. Observe the sum and the gap from 1/3.",
      ],
      [
        "Chaque rectangle a une largeur 1/N et une hauteur (i/N)² pour i = 0, …, N − 1.",
        "Each rectangle has width 1/N and height (i/N)² for i = 0, …, N − 1.",
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
    topic: ["Diviseurs", "Divisors"],
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
    title: ["Un échiquier sans deux coins", "A chessboard missing two corners"],
    topic: ["Invariant", "Invariant"],
    difficulty: 2,
    minutes: 10,
    prompt: [
      "On retire deux coins opposés d’un échiquier 8 × 8. Combien de pavages complets peut-on réaliser avec 31 dominos de taille 2 × 1 ?",
      "Remove two opposite corners of an 8 × 8 chessboard. How many complete tilings are possible with 31 dominoes of size 2 × 1?",
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
    title: ["Des restes qui se rencontrent", "When remainders meet"],
    topic: ["Principe des tiroirs", "Pigeonhole principle"],
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
    title: ["Un produit toujours divisible", "An always-divisible product"],
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
    topic: ["Inégalités", "Inequalities"],
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
    title: ["La somme des nombres impairs", "The sum of odd numbers"],
    topic: ["Preuve visuelle", "Visual proof"],
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
    id: "mg",
    name: ["Programme malagasy", "Malagasy curriculum"],
    label: "MG",
    intro: [
      "Une entrée par les notions du lycée, de la seconde à la terminale. Les séries et les progressions peuvent différer : ces repères sont indicatifs.",
      "An entry through lycée topics, from seconde to terminale. Streams and progressions can differ: these placements are indicative.",
    ],
    stages: [
      {
        name: ["Fondations · Seconde", "Foundations · Seconde"],
        ids: ["quadratic", "vectors", "statistics"],
      },
      {
        name: ["Développer · Première", "Develop · Première"],
        ids: ["sequences", "trig", "derivative"],
      },
      {
        name: [
          "Approfondir · Terminale scientifique",
          "Extend · Scientific terminale",
        ],
        ids: ["probability", "integral", "complex"],
      },
    ],
    source: "https://www.education.gov.mg/systeme-educatif/lycee/",
    sourceName: [
      "Ministère de l’Éducation nationale de Madagascar",
      "Madagascar Ministry of National Education",
    ],
  },
  {
    id: "fr",
    name: ["Programme français", "French curriculum"],
    label: "FR",
    intro: [
      "Des notions communes du lycée aux approfondissements. Les fonctions quadratiques peuvent servir d’exploration en seconde ; leur étude détaillée dépend du programme suivi.",
      "From common lycée topics to extensions. Quadratics can be explored in seconde; detailed study depends on the course followed.",
    ],
    stages: [
      {
        name: ["Explorer · Seconde", "Explore · Seconde"],
        ids: ["statistics", "vectors", "quadratic"],
      },
      {
        name: ["Spécialité · Première", "Specialty · Première"],
        ids: ["quadratic", "trig", "sequences", "derivative"],
      },
      {
        name: ["Spécialité · Terminale", "Specialty · Terminale"],
        ids: ["probability", "integral"],
      },
      {
        name: ["Option maths expertes", "Maths expertes option"],
        ids: ["complex"],
      },
    ],
    source:
      "https://www.education.gouv.fr/reussir-au-lycee/les-programmes-du-lycee-general-et-technologique-9812",
    sourceName: [
      "Ministère de l’Éducation nationale français",
      "French Ministry of National Education",
    ],
  },
  {
    id: "ib",
    name: ["International Baccalaureate", "International Baccalaureate"],
    label: "IB",
    intro: [
      "Des explorations pour Mathematics: Analysis and Approaches (AA) et Applications and Interpretation (AI). Les niveaux SL et HL n’ont pas les mêmes exigences ; les vecteurs et les complexes ci-dessous sont proposés comme extensions HL selon le cours.",
      "Explorations for Mathematics: Analysis and Approaches (AA) and Applications and Interpretation (AI). SL and HL have different requirements; vectors and complex numbers below are HL extensions depending on the course.",
    ],
    stages: [
      {
        name: [
          "AA & AI · Fonctions et suites",
          "AA & AI · Functions and sequences",
        ],
        ids: ["quadratic", "sequences", "trig"],
      },
      {
        name: ["AA & AI · Données et analyse", "AA & AI · Data and calculus"],
        ids: ["statistics", "probability", "derivative", "integral"],
      },
      {
        name: [
          "HL · Extensions selon le cours",
          "HL · Course-dependent extensions",
        ],
        ids: ["vectors", "complex"],
      },
    ],
    source:
      "https://ibo.org/programmes/diploma-programme/curriculum/mathematics/",
    sourceName: [
      "IB · Mathematics in the Diploma Programme",
      "IB · Mathematics in the Diploma Programme",
    ],
  },
];
