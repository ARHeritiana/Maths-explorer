// Four Monte Carlo experiments (template `inference`, group "Inférer et décider"): pi by random points, the area of a lake, an
// integral by averaging, the hitting probability of a random walk. One recipe (sample, measure, average, quantify the uncertainty),
// one surface (templates/monte-carlo.js), one pure model (models/monte-carlo.js). Every string is a [fr, en] pair.
import * as M from "../models/monte-carlo.js";

const P = (fr, en) => [fr, en];
const MAX = M.MAX_RUNS;
const run = {
  kind: "action", label: P("Essais", "Trials"),
  options: [
    { value: 1, label: P("+ 1", "+ 1") }, { value: 100, label: P("+ 100", "+ 100") }, { value: 1000, label: P("+ 1 000", "+ 1,000") },
    { value: "new", label: P("Nouvelle série", "New series") },
  ],
  act: (s, v) => (v === "new" ? { runs: 0, seed: s.seed + 1 } : { runs: Math.min(MAX, s.runs + v) }),
};
const source = "https://mathworld.wolfram.com/MonteCarloMethod.html";
const sourceLabel = P("Monte Carlo, MathWorld", "Monte Carlo method, MathWorld");
const recipe = P(
  "Même recette partout : tirer un essai aléatoire indépendant, mesurer son résultat, faire la moyenne. L’intervalle est approché : il décrit la variabilité du tirage pour un modèle donné, il ne corrige ni un mauvais modèle ni un échantillonnage biaisé.",
  "The same recipe everywhere: draw an independent random trial, measure its outcome, average. The interval is approximate: it describes sampling variability for a given model; it does not repair a wrong model or biased sampling.",
);
const rate = P(
  "Dans les cas ordinaires, l’erreur typique décroît à peu près comme 1/√N : pour la diviser par 2, il faut environ 4 fois plus d’essais.",
  "In ordinary cases the typical error falls roughly like 1/√N: to halve it you need about 4 times as many trials.",
);

const common = (id, kind, extra) => ({
  template: "inference", section: "inference", group: P("Données & hasard", "Data & chance"), duration: 12,
  level: P("Lycée · Université", "Upper secondary · University"), prereq: P("Fréquences et probabilités", "Frequencies and probability"),
  ...extra, id, monteCarlo: { kind, rate, recipe, ...extra.monteCarlo }, state: { runs: 0, seed: 1, hide: 0, ...extra.state },
  model: {
    model: M.MODELS[kind], MAX_RUNS: MAX, quantity: (name, s) => M.quantities[kind][name](s), quantities: M.quantities[kind],
  },
  views: {
    panels: [],
    formula: (s, { fmt }) => (fmt.fr || !extra.monteCarlo.formulaEn ? extra.monteCarlo.formula : extra.monteCarlo.formulaEn),
    readout: (s, { fmt }) => { const m = M.MODELS[kind](s); return [[P("Essais", "Trials"), fmt.num(m.n, 0)], [P("Référence", "Reference"), s.hide ? P("à calculer", "to compute")[fmt.fr ? 0 : 1] : fmt.read(m.reference, extra.monteCarlo.digits)]]; },
  },
  history: { title: P("La méthode de Monte-Carlo", "The Monte Carlo method"), story: P(
    "Stanislaw Ulam et John von Neumann ont popularisé l’idée de remplacer un calcul trop difficile par des tirages aléatoires au milieu des années 1940.",
    "Stanislaw Ulam and John von Neumann popularised the idea of replacing a calculation that is too hard by random draws in the mid 1940s.",
  ), source, sourceLabel },
});

const why = (fr, en) => ({ id: "why", kind: "explain", set: { hide: 0 }, prompt: P("Pourquoi cette méthode fonctionne-t-elle ?", "Why does this method work?"), argument: P(fr, en) });

const piExp = common("monte-carlo-pi", "pi", {
  symbol: "π", sub: P("Le hasard et π", "Chance and π"), title: P("Le hasard peut-il révéler π ?", "Can random dots reveal π?"),
  short: P("Monte-Carlo : π", "Monte Carlo: π"),
  intro: P("Des points tombent au hasard dans un carré de côté 2 qui contient un disque de rayon 1. La proportion dans le disque donne π.", "Dots fall at random in a square of side 2 that contains a disc of radius 1. The fraction inside the disc gives π."),
  state: {},
  controls: { run },
  monteCarlo: {
    assumption: P("Points indépendants et uniformes dans le carré. L’aléa est simulé par un générateur à graine : la même série redonne les mêmes points.", "Independent points, uniform in the square. Chance is simulated by a seeded generator: the same series gives the same points."),
    formula: "π ≈ 4 × H / N", unit: "", digits: 4,
    pseudo: P("succès = 0\nrépéter N fois :\n    x = uniforme(−1 ; 1)\n    y = uniforme(−1 ; 1)\n    si x² + y² ≤ 1 : succès += 1\nrenvoyer 4 × succès / N", "hits = 0\nrepeat N times:\n    x = uniform(-1, 1)\n    y = uniform(-1, 1)\n    if x² + y² ≤ 1: hits += 1\nreturn 4 × hits / N"),
    caution: P("Le tirage fluctue : relancer donne un autre nombre. Cette méthode est lente pour calculer π ; elle sert ici à comprendre l’estimation.", "The draw fluctuates: running again gives another number. This method is slow for computing π; it is here to understand estimation."),
    hint: P("Vert : dans le disque. Orange : en dehors.", "Green: inside the disc. Orange: outside."),
  },
  missions: [
    { id: "open", kind: "predict", prompt: P("Un point est tiré au hasard dans un carré de côté 2 qui contient un disque de rayon 1. Quelle proportion des points tombera dans le disque ?", "A point is drawn at random in a square of side 2 containing a disc of radius 1. What fraction of the points will fall in the disc?"),
      choices: [P("Environ π/4, soit 0,785", "About π/4, that is 0.785"), P("Environ 1/2", "About 1/2"), P("Environ 1/π, soit 0,318", "About 1/π, that is 0.318")], correct: 0 },
    { id: "run", kind: "explore", unlock: ["run"], set: { runs: 0, hide: 0 }, prompt: P("Lance au moins 1 000 essais. Observe le nombre 4H/N : il fluctue, puis se stabilise.", "Run at least 1,000 trials. Watch the number 4H/N: it fluctuates, then settles."),
      hint: P("Le bouton Lancer tire des points à vitesse constante ; « Nouvelle série » repart avec une autre graine.", "The Run button draws points at a constant speed; “New series” starts again with another seed."),
      goal: (s) => s.runs >= 1000, done: P("L’estimation est proche de π, mais pas égale : la proportion de points dans le disque n’est qu’approximativement π/4.", "The estimate is close to π but not equal to it: the fraction of points inside the disc is only approximately π/4.") },
    { id: "spread", kind: "check", set: { runs: 1000, hide: 1 }, quantity: "standardError", answer: 4 * Math.sqrt((Math.PI / 4) * (1 - Math.PI / 4) / 1000), tolerance: 0.005,
      prompt: P("Avec N = 1 000 points, l’écart type de l’estimation 4H/N vaut 4·√(p(1 − p)/N), où p = π/4. Calcule-le (arrondi au centième).", "With N = 1,000 points, the standard deviation of the estimate 4H/N is 4·√(p(1 − p)/N), where p = π/4. Compute it (to the nearest hundredth)."),
      hint: P("p(1 − p) ≈ 0,1685 ; divise par 1 000, prends la racine, multiplie par 4.", "p(1 − p) ≈ 0.1685; divide by 1,000, take the root, multiply by 4."),
      because: P("4·√(0,1685/1000) ≈ 0,052 : à N = 1 000, l’erreur typique est de l’ordre de 0,05.", "4·√(0.1685/1000) ≈ 0.052: at N = 1,000 the typical error is about 0.05.") },
    why("Chaque point tombe dans le disque avec la probabilité p = aire du disque / aire du carré = π/4, indépendamment des autres. Le nombre H de succès suit donc une loi binomiale (N, p), de moyenne Np et d’écart type √(Np(1 − p)). La fréquence H/N a pour moyenne p et pour écart type √(p(1 − p)/N), qui décroît comme 1/√N : la fréquence converge vers p (loi des grands nombres), et la vitesse en 1/√N vient de l’écart type. L’estimation 4H/N est donc sans biais pour π, avec un écart type 4√(p(1 − p)/N). L’intervalle de Wilson affiché est approché.",
      "Each point falls in the disc with probability p = area of the disc / area of the square = π/4, independently of the others. The number H of successes therefore follows a binomial law (N, p), with mean Np and standard deviation √(Np(1 − p)). The frequency H/N has mean p and standard deviation √(p(1 − p)/N), which falls like 1/√N: the frequency converges to p (law of large numbers), and the 1/√N rate comes from the standard deviation. The estimate 4H/N is therefore unbiased for π, with standard deviation 4√(p(1 − p)/N). The Wilson interval shown is approximate."),
  ],
  conclusion: P("Une fréquence estime une probabilité, et la probabilité ici est un rapport d’aires : π/4. Le hasard donne une réponse approchée dont on peut chiffrer l’incertitude.", "A frequency estimates a probability, and here the probability is a ratio of areas: π/4. Chance gives an approximate answer whose uncertainty can be quantified."),
});

const lakeExp = common("monte-carlo-lake", "lake", {
  symbol: "km²", sub: P("L’aire d’un lac", "The area of a lake"), title: P("Quelle est l’aire de ce lac ?", "How large is this lake?"),
  short: P("Monte-Carlo : un lac", "Monte Carlo: a lake"),
  intro: P("Une carte de 10 km sur 10 km, un rivage que tu dessines : des points au hasard estiment la fraction de la carte couverte par l’eau.", "A map of 10 km by 10 km and a shoreline you draw: random points estimate the fraction of the map covered by water."),
  state: { shape: "default", poly: null },
  controls: {
    run,
    shape: { kind: "choice", presentation: "select", label: P("Forme du lac", "Lake shape"),
      options: [["default", "Rivage initial", "Default shoreline"], ["disc", "Disque", "Disc"], ["square", "Carré", "Square"], ["ell", "En L", "L shape"], ["custom", "Dessiné à la main", "Drawn by hand"]].map(([value, fr, en]) => ({ value, label: P(fr, en), ...(value === "custom" ? { disabled: (s) => !s.poly } : {}) })),
      key: "shape", set: (s, v) => (v === "custom" && !s.poly ? {} : { shape: v, runs: 0 }) },
  },
  monteCarlo: {
    assumption: P("Points indépendants et uniformes sur la carte. La référence est l’aire exacte du polygone échantillonné ; un rivage dessiné est remplacé par un polygone d’au plus 250 sommets.", "Independent points, uniform on the map. The reference is the exact area of the polygon being sampled; a drawn shoreline is replaced by a polygon with at most 250 vertices."),
    formula: "aire ≈ 100 × H / N km²", formulaEn: "area ≈ 100 × H / N km²", unit: "km²", digits: 2,
    pseudo: P("succès = 0\nrépéter N fois :\n    (x ; y) = point uniforme de la carte\n    si dans_le_lac(x ; y) : succès += 1\nrenvoyer 100 × succès / N   // km²", "hits = 0\nrepeat N times:\n    (x, y) = uniform point of the map\n    if inside_lake(x, y): hits += 1\nreturn 100 × hits / N   // km²"),
    caution: P("Un lac long et étroit demande plus de points. Un tracé trop court, trop petit ou qui se croise est refusé.", "A long, narrow lake needs more points. A trace that is too short, too small or that crosses itself is refused."),
    hint: P("Glisse sur la carte pour dessiner un nouveau rivage (souris ou doigt), ou choisis une forme dans la liste.", "Drag on the map to draw a new shoreline (mouse or finger), or pick a shape in the list."),
  },
  missions: [
    { id: "open", kind: "predict", prompt: P("La carte représente 100 km². Sur 100 points tirés au hasard, 36 tombent dans le lac. Quelle aire estimer ?", "The map represents 100 km². Of 100 points drawn at random, 36 fall in the lake. What area should you estimate?"),
      choices: [P("Environ 36 km²", "About 36 km²"), P("Environ 64 km²", "About 64 km²"), P("Environ 0,36 km²", "About 0.36 km²")], correct: 0 },
    { id: "run", kind: "explore", unlock: ["run"], set: { runs: 0, hide: 0 }, prompt: P("Lance au moins 1 000 essais sur le rivage initial et compare l’estimation à l’aire du polygone.", "Run at least 1,000 trials on the default shoreline and compare the estimate with the area of the polygon."),
      hint: P("La référence est l’aire du polygone échantillonné, calculée exactement.", "The reference is the area of the polygon being sampled, computed exactly."),
      goal: (s) => s.runs >= 1000, done: P("L’estimation tourne autour de la référence ; l’intervalle approché indique l’ordre de grandeur de l’écart.", "The estimate wobbles around the reference; the approximate interval shows the order of magnitude of the gap.") },
    { id: "shape", kind: "explore", unlock: ["shape"], set: { runs: 0, shape: "default", hide: 0 }, prompt: P("Choisis la forme en L (33 km² exactement) et lance au moins 200 essais.", "Pick the L shape (exactly 33 km²) and run at least 200 trials."),
      hint: P("Tu peux aussi dessiner ta propre forme sur la carte.", "You can also draw your own shape on the map."),
      goal: (s) => s.shape === "ell" && s.runs >= 200, done: P("Une forme qui n’est pas un disque se traite de la même façon : seul le test « le point est-il dans le lac ? » change.", "A shape that is not a disc is handled the same way: only the test “is the point in the lake?” changes.") },
    { id: "spread", kind: "check", set: { runs: 1000, shape: "square", hide: 1 }, quantity: "standardError", answer: 100 * Math.sqrt(0.36 * 0.64 / 1000), tolerance: 0.005,
      prompt: P("Le lac carré (36 km²) et N = 1 000 points : l’écart type de l’estimation vaut 100·√(p(1 − p)/N) avec p = 0,36. Calcule-le en km² (arrondi au centième).", "The square lake (36 km²) and N = 1,000 points: the standard deviation of the estimate is 100·√(p(1 − p)/N) with p = 0.36. Compute it in km² (to the nearest hundredth)."),
      hint: P("0,36 × 0,64 = 0,2304 ; divise par 1 000 et prends la racine.", "0.36 × 0.64 = 0.2304; divide by 1,000 and take the root."),
      because: P("100·√(0,2304/1000) ≈ 1,52 km².", "100·√(0.2304/1000) ≈ 1.52 km².") },
    why("Chaque point tombe dans le lac avec la probabilité p = aire du lac / aire de la carte, quelle que soit la forme du rivage. H/N est une fréquence de succès : elle a pour moyenne p et pour écart type √(p(1 − p)/N). L’estimation 100 H/N est sans biais pour l’aire, et son erreur décroît comme 1/√N. Aucune formule d’aire n’est nécessaire : seul le test d’appartenance l’est.",
      "Each point falls in the lake with probability p = area of the lake / area of the map, whatever the shape of the shoreline. H/N is a success frequency: its mean is p and its standard deviation is √(p(1 − p)/N). The estimate 100 H/N is unbiased for the area, and its error falls like 1/√N. No area formula is needed: only the membership test is."),
  ],
  conclusion: P("Pour une frontière compliquée, un test d’appartenance suffit à estimer une aire. Le résultat reste aléatoire : on le chiffre avec un intervalle approché.", "For a complicated boundary a membership test is enough to estimate an area. The result stays random: it is quantified with an approximate interval."),
});

const integralExp = common("monte-carlo-integral", "integral", {
  symbol: "∫", sub: P("Une intégrale par la moyenne", "An integral by averaging"), title: P("Intégrer en calculant des moyennes", "Integration by taking averages"),
  short: P("Monte-Carlo : une intégrale", "Monte Carlo: an integral"),
  intro: P("Tire des abscisses au hasard, moyenne les hauteurs de la courbe et multiplie par la largeur : c’est l’aire sous la courbe. Un pic très étroit met la méthode en défaut.", "Draw abscissas at random, average the heights of the curve and multiply by the width: this is the area under the curve. A very narrow spike defeats the method."),
  state: { fn: "gauss" },
  controls: {
    run,
    fn: { kind: "choice", presentation: "select", label: P("Fonction", "Function"), key: "fn",
      options: [["gauss", "e^(−x²) sur [0 ; 2]", "e^(−x²) on [0, 2]"], ["sine", "sin²(πx) sur [0 ; 1]", "sin²(πx) on [0, 1]"], ["spike", "Pic étroit sur [0 ; 1]", "Narrow spike on [0, 1]"]].map(([value, fr, en]) => ({ value, label: P(fr, en) })),
      set: (s, v) => ({ fn: v, runs: 0 }) },
  },
  monteCarlo: {
    assumption: P("Abscisses indépendantes et uniformes sur [0 ; b], fonction positive. La référence est exacte pour sin²(πx), numérique (Simpson, 8 000 pas) pour les deux autres. Le pic est e^(−650(x − 0,72)²).", "Independent abscissas, uniform on [0, b], nonnegative function. The reference is exact for sin²(πx), numerical (Simpson, 8,000 panels) for the other two. The spike is e^(−650(x − 0.72)²)."),
    formula: "∫ f ≈ b × (Σ f(xᵢ)) / N", unit: "", digits: 5,
    pseudo: P("somme = 0\nrépéter N fois :\n    x = uniforme(0 ; b)\n    somme += f(x)\nrenvoyer b × somme / N", "total = 0\nrepeat N times:\n    x = uniform(0, b)\n    total += f(x)\nreturn b × total / N"),
    caution: P("Intervalle normal avec la variance de l’échantillon. Pour une fonction pointue et peu d’essais, il peut être trop étroit : il contient alors la vraie valeur moins de 95 % du temps (environ 92 % à N = 100 pour le pic, environ 85 % à N = 30).", "Normal interval with the sample variance. For a spiky function and few trials it can be too narrow: it then contains the true value less than 95% of the time (about 92% at N = 100 for the spike, about 85% at N = 30)."),
    hint: P("Chaque point est (x ; f(x)). Le trait pointillé est la hauteur moyenne.", "Each dot is (x, f(x)). The dashed line is the average height."),
  },
  missions: [
    { id: "open", kind: "predict", prompt: P("On moyenne 1 000 valeurs de sin²(πx) pour x tiré au hasard dans [0 ; 1]. Vers quelle valeur la moyenne tend-elle ?", "We average 1,000 values of sin²(πx) for x drawn at random in [0, 1]. Which value does the average approach?"),
      choices: [P("0,5", "0.5"), P("1", "1"), P("0,25", "0.25")], correct: 0, set: { fn: "sine" } },
    { id: "run", kind: "explore", unlock: ["run"], set: { runs: 0, fn: "gauss", hide: 0 }, prompt: P("Pour e^(−x²) sur [0 ; 2], lance au moins 1 000 essais et compare l’estimation à la référence.", "For e^(−x²) on [0, 2], run at least 1,000 trials and compare the estimate with the reference."),
      goal: (s) => s.runs >= 1000, done: P("La moyenne des hauteurs fois la largeur 2 approche l’aire sous la courbe.", "The average height times the width 2 approaches the area under the curve.") },
    { id: "spike", kind: "explore", unlock: ["run"], set: { runs: 0, fn: "spike", hide: 0 }, prompt: P("Fonction « pic étroit » : lance seulement 100 essais, puis une nouvelle série. L’estimation est-elle toujours proche de la référence ?", "Function “narrow spike”: run only 100 trials, then a new series. Is the estimate always close to the reference?"),
      hint: P("Peu de points tombent dans le pic : l’estimation varie beaucoup et l’intervalle peut être trop étroit.", "Few points land in the spike: the estimate varies a lot and the interval can be too narrow."),
      goal: (s) => s.fn === "spike" && s.runs >= 100, done: P("Un événement rare est mal échantillonné avec peu d’essais. L’intervalle approché peut alors ne pas contenir la valeur exacte.", "A rare event is poorly sampled with few trials. The approximate interval may then miss the exact value.") },
    { id: "read", kind: "check", set: { fn: "gauss", runs: 0, hide: 1 }, quantity: "benchmark", answer: 0.8820813907624178, tolerance: 0.001,
      prompt: P("Quelle est la valeur de ∫₀² e^(−x²) dx, la référence de la première fonction (arrondie au millième) ?", "What is the value of ∫₀² e^(−x²) dx, the reference of the first function (to the nearest thousandth)?"),
      hint: P("Cette intégrale n’a pas d’expression avec les fonctions usuelles : c’est (√π/2)·erf(2).", "This integral has no elementary form: it equals (√π/2)·erf(2)."),
      because: P("(√π/2)·erf(2) ≈ 0,882.", "(√π/2)·erf(2) ≈ 0.882.") },
    why("Si X est uniforme sur [0 ; b], l’espérance de b·f(X) vaut ∫₀ᵇ f(x) dx. La moyenne de N valeurs indépendantes de b·f(Xᵢ) est donc sans biais pour l’intégrale, et son écart type est σ/√N avec σ² la variance de b·f(X). L’intervalle normal remplace σ par l’écart type de l’échantillon. Si f a un pic étroit, σ est grand par rapport à la moyenne et la loi de la moyenne est très asymétrique pour N petit : l’approximation normale est mauvaise et l’intervalle peut manquer la valeur exacte plus de 5 % du temps.",
      "If X is uniform on [0, b], the expectation of b·f(X) is ∫₀ᵇ f(x) dx. The average of N independent values of b·f(Xᵢ) is therefore unbiased for the integral, with standard deviation σ/√N where σ² is the variance of b·f(X). The normal interval replaces σ by the sample standard deviation. If f has a narrow spike, σ is large compared with the mean and the law of the average is very skewed for small N: the normal approximation is poor and the interval can miss the exact value more than 5% of the time."),
  ],
  conclusion: P("Intégrer, c’est moyenner. La méthode marche pour toute fonction qu’on sait évaluer, mais un phénomène rare exige beaucoup d’essais, et l’intervalle approché le dit mal.", "Integrating is averaging. The method works for any function we can evaluate, but a rare phenomenon needs many trials, and the approximate interval says so poorly."),
});

const walkExp = common("monte-carlo-walk", "walk", {
  symbol: "±1", sub: P("Une marche aléatoire", "A random walk"), title: P("Quelle chance d’atteindre la cible ?", "What are the odds of reaching the goal?"),
  short: P("Monte-Carlo : une marche", "Monte Carlo: a walk"),
  intro: P("Un marcheur avance de +1 ou −1 à pile ou face, jusqu’à atteindre la cible ou la borne inférieure. Beaucoup de marches estiment la probabilité de réussir.", "A walker moves +1 or −1 on a coin toss until reaching the goal or the lower stop. Many walks estimate the probability of success."),
  state: { upper: 5, lower: 3 },
  controls: {
    run,
    upper: { kind: "slider", key: "upper", label: P("Cible supérieure U", "Upper goal U"), min: 2, max: 10, step: 1, digits: 0, set: (s, v) => ({ upper: v, runs: 0 }) },
    lower: { kind: "slider", key: "lower", label: P("Borne inférieure L", "Lower stop L"), min: 2, max: 10, step: 1, digits: 0, set: (s, v) => ({ lower: v, runs: 0 }) },
  },
  monteCarlo: {
    assumption: P("Pas indépendants, +1 ou −1 avec la même probabilité, départ en 0, arrêt en +U ou en −L. La référence L/(U + L) est exacte pour cette marche équilibrée.", "Independent steps, +1 or −1 with equal probability, start at 0, stop at +U or −L. The reference L/(U + L) is exact for this fair walk."),
    formula: "P(atteindre +U avant −L) ≈ réussites / N", formulaEn: "P(reach +U before −L) ≈ successes / N", unit: "", digits: 4,
    pseudo: P("succès = 0\nrépéter N fois :\n    position = 0\n    tant que −L < position < U :\n        position += choix_équiprobable(−1 ; +1)\n    si position = U : succès += 1\nrenvoyer succès / N", "wins = 0\nrepeat N times:\n    position = 0\n    while −L < position < U:\n        position += random_choice(−1, +1)\n    if position = U: wins += 1\nreturn wins / N"),
    caution: P("Chaque trajectoire est imprévisible ; seule la proportion de réussites sur beaucoup de marches est stable.", "Each path is unpredictable; only the proportion of successes over many walks is stable."),
    hint: P("La dernière marche est en trait épais ; les précédentes sont estompées.", "The latest walk is drawn thick; earlier ones are faint."),
  },
  missions: [
    { id: "open", kind: "predict", prompt: P("Pile ou face équilibré, +1 ou −1 à chaque pas. On part de 0, on gagne en atteignant +5 et on perd en atteignant −3. Quelle est la probabilité de gagner ?", "A fair coin gives +1 or −1 at each step. Start at 0, win on reaching +5, lose on reaching −3. What is the probability of winning?"),
      choices: [P("3/8, soit 0,375", "3/8, that is 0.375"), P("5/8, soit 0,625", "5/8, that is 0.625"), P("1/2", "1/2")], correct: 0 },
    { id: "run", kind: "explore", unlock: ["run"], set: { runs: 0, upper: 5, lower: 3, hide: 0 }, prompt: P("Lance au moins 1 000 marches. La proportion de réussites se rapproche-t-elle de la référence ?", "Run at least 1,000 walks. Does the proportion of successes approach the reference?"),
      goal: (s) => s.runs >= 1000, done: P("La proportion de marches qui atteignent +5 d’abord se stabilise près de 0,375.", "The proportion of walks reaching +5 first settles near 0.375.") },
    { id: "rare", kind: "explore", unlock: ["upper"], set: { runs: 0, upper: 5, lower: 2, hide: 0 }, prompt: P("Avec L = 2, déplace la cible U pour que la réussite devienne rare (probabilité d’au plus 0,2), alors que chaque pas est une pièce équilibrée.", "With L = 2, move the goal U until success becomes rare (probability at most 0.2), although every step is a fair coin."),
      goal: (s) => s.lower / (s.upper + s.lower) <= 0.2, done: P("Plus la cible est loin, plus la réussite est rare : L/(U + L) devient petit.", "The farther the goal, the rarer the success: L/(U + L) becomes small.") },
    { id: "read", kind: "check", set: { upper: 10, lower: 2, runs: 0, hide: 1 }, quantity: "benchmark", answer: 2 / 12, tolerance: 0.005,
      prompt: P("Avec U = 10 et L = 2, quelle est la probabilité exacte d’atteindre +10 avant −2 (arrondie au centième) ?", "With U = 10 and L = 2, what is the exact probability of reaching +10 before −2 (to the nearest hundredth)?"),
      hint: P("Pour cette marche équilibrée, la probabilité vaut L/(U + L).", "For this fair walk the probability is L/(U + L)."),
      because: P("2/(10 + 2) = 1/6 ≈ 0,17.", "2/(10 + 2) = 1/6 ≈ 0.17.") },
    why("La position d’une marche équilibrée est une martingale : son espérance ne change pas. Arrêtée en +U avec la probabilité p ou en −L avec 1 − p, elle vérifie pU − (1 − p)L = 0 (l’arrêt est presque sûr et la position reste bornée). D’où p = L/(U + L). La simulation estime cette probabilité par une fréquence, d’écart type √(p(1 − p)/N), et sert quand aucune formule n’est connue.",
      "The position of a fair walk is a martingale: its expectation does not change. Stopped at +U with probability p or at −L with 1 − p, it satisfies pU − (1 − p)L = 0 (stopping is almost sure and the position stays bounded). Hence p = L/(U + L). The simulation estimates this probability by a frequency with standard deviation √(p(1 − p)/N), and is used when no formula is known."),
  ],
  conclusion: P("Ici une formule existe, ce qui permet de juger la simulation. Quand elle n’existe pas, c’est la simulation, avec son intervalle, qui répond.", "Here a formula exists, which lets us judge the simulation. When none exists, the simulation, with its interval, is what answers."),
});

export const monteCarloExperiments = [piExp, lakeExp, integralExp, walkExp];
