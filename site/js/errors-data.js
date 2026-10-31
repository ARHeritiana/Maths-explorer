// Error correction collection ("Erreurs"): the data. The pure mathematics that evaluates it is in errors-model.js.
// Every activity starts from a false claim a learner might write. What the page tells the learner is computed here,
// never stored: a counterexample is found by evaluation, a proposed repair is accepted only if it holds on a grid of
// values of the claim's domain (`holds`), and the faulty step of a derivation is the first step whose equation fails.
// Text is bilingual pairs [French, English]. Mathematical strings are the same in both languages.
// To add an error: append a record to ERRORS (claim type) or to DERIVATIONS (step type) and a line to ROUTE; the
// tests check domains, counterexamples, the repairs and the links without further work.

const pair = (fr, en) => [fr, en];
const D = Math.PI / 180;                                  // degrees to radians
const simpson = (f, x) => (x / 6) * (f(0) + 4 * f(x / 2) + f(x));   // exact for polynomials up to degree 3
const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
const round2 = (v) => Math.round(v * 100) / 100;
// Size of A ∪ B for A = {0..9} and B = {10 − x .. 17 − x}, so that |A ∩ B| = x (counted from the sets themselves).
const unionSize = (x) => { const s = new Set(); for (let i = 0; i < 10; i++) s.add(i); for (let i = 10 - x; i < 18 - x; i++) s.add(i); return s.size; };

// A claim is "left = right" for variables x and y, over `range` (inclusive integers, per variable).
// `repairs` are candidate corrections: `rel` is '=' or '<='. At least one must hold, the others are tempting but false.
export const ERRORS = [
  {
    id: 'square-of-sum', topics: ['algebra/equations'], family: 'additive', level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('Le carré d’une somme', 'The square of a sum'),
    claim: '(x + y)² = x² + y²',
    vars: ['x', 'y'], range: { x: [1, 9], y: [1, 9] },
    L: (x, y) => (x + y) ** 2, R: (x, y) => x ** 2 + y ** 2, diagram: 'square',
    why: pair(
      'Élever au carré n’est pas distribuer : le carré d’une somme contient aussi les deux rectangles de côtés x et y, qui valent ensemble 2xy. Le côté gauche dépasse donc toujours le droit de 2xy, qui n’est nul que si x ou y l’est.',
      'Squaring does not distribute: the square of a sum also contains the two x by y rectangles, worth 2xy together. The left side therefore always exceeds the right by 2xy, which is zero only if x or y is.'),
    repairs: [
      { text: '(x + y)² = x² + 2xy + y²', rel: '=', L: (x, y) => (x + y) ** 2, R: (x, y) => x ** 2 + 2 * x * y + y ** 2 },
      { text: '(x + y)² = x² + xy + y²', rel: '=', L: (x, y) => (x + y) ** 2, R: (x, y) => x ** 2 + x * y + y ** 2 },
      { text: '(x + y)² = 2x + 2y', rel: '=', L: (x, y) => (x + y) ** 2, R: (x, y) => 2 * x + 2 * y },
    ],
    links: ['#chapter/seconde-08'],
  },
  {
    id: 'root-of-sum', topics: ['algebra/equations'], family: 'additive', level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('La racine d’une somme', 'The root of a sum'),
    claim: '√(x + y) = √x + √y',
    vars: ['x', 'y'], range: { x: [1, 9], y: [1, 9] },
    L: (x, y) => Math.sqrt(x + y), R: (x, y) => Math.sqrt(x) + Math.sqrt(y),
    why: pair(
      'La racine carrée respecte les produits (√(xy) = √x·√y pour x, y ≥ 0), pas les sommes. En élevant au carré, (√x + √y)² = x + y + 2√(xy) dépasse x + y : la somme des racines est plus grande que la racine de la somme.',
      'The square root respects products (√(xy) = √x·√y for x, y ≥ 0), not sums. Squaring gives (√x + √y)² = x + y + 2√(xy), which exceeds x + y: the sum of the roots is larger than the root of the sum.'),
    repairs: [
      { text: '√(x + y) ≤ √x + √y', rel: '<=', L: (x, y) => Math.sqrt(x + y), R: (x, y) => Math.sqrt(x) + Math.sqrt(y) },
      { text: '√(x + y) = √x · √y', rel: '=', L: (x, y) => Math.sqrt(x + y), R: (x, y) => Math.sqrt(x) * Math.sqrt(y) },
      { text: '√(x + y) = (√x + √y)/2', rel: '=', L: (x, y) => Math.sqrt(x + y), R: (x, y) => (Math.sqrt(x) + Math.sqrt(y)) / 2 },
    ],
    links: ['#chapter/seconde-04'],
  },
  {
    id: 'inverse-of-sum', topics: ['algebra/equations'], family: 'additive', level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('L’inverse d’une somme', 'The reciprocal of a sum'),
    claim: '1/(x + y) = 1/x + 1/y',
    vars: ['x', 'y'], range: { x: [1, 9], y: [1, 9] },
    L: (x, y) => 1 / (x + y), R: (x, y) => 1 / x + 1 / y,
    why: pair(
      'Additionner des fractions demande un dénominateur commun : 1/x + 1/y = (x + y)/(xy). Pour x, y > 0, la somme des inverses est strictement plus grande que 1/(x + y), puisque chacun de ses termes l’est déjà.',
      'Adding fractions needs a common denominator: 1/x + 1/y = (x + y)/(xy). For x, y > 0 the sum of the reciprocals is strictly larger than 1/(x + y), since each of its terms already is.'),
    repairs: [
      { text: '1/x + 1/y = (x + y)/(xy)', rel: '=', L: (x, y) => 1 / x + 1 / y, R: (x, y) => (x + y) / (x * y) },
      { text: '1/x + 1/y = 2/(x + y)', rel: '=', L: (x, y) => 1 / x + 1 / y, R: (x, y) => 2 / (x + y) },
      { text: '1/x + 1/y = 1/(xy)', rel: '=', L: (x, y) => 1 / x + 1 / y, R: (x, y) => 1 / (x * y) },
    ],
    links: ['#chapter/seconde-08'],
  },
  {
    id: 'cancel-a-term', topics: ['algebra/equations'], family: 'fractions', level: pair('Collège et après', 'Middle school onward'),
    title: pair('Simplifier un terme, non un facteur', 'Cancelling a term, not a factor'),
    claim: '(x + y)/x = y',
    vars: ['x', 'y'], range: { x: [1, 9], y: [-9, 9] },
    L: (x, y) => (x + y) / x, R: (x, y) => y,
    why: pair(
      'On ne peut simplifier que des facteurs communs au numérateur et au dénominateur. Ici x est un terme de la somme x + y, non un facteur : (x + y)/x = x/x + y/x = 1 + y/x.',
      'Only common factors of numerator and denominator can be cancelled. Here x is a term of the sum x + y, not a factor: (x + y)/x = x/x + y/x = 1 + y/x.'),
    repairs: [
      { text: '(x + y)/x = 1 + y/x', rel: '=', L: (x, y) => (x + y) / x, R: (x, y) => 1 + y / x },
      { text: '(x + y)/x = 1 + y', rel: '=', L: (x, y) => (x + y) / x, R: (x, y) => 1 + y },
      { text: '(x + y)/x = y/x', rel: '=', L: (x, y) => (x + y) / x, R: (x, y) => y / x },
    ],
    links: ['#chapter/seconde-08'],
  },
  {
    id: 'partial-distribution', topics: ['algebra/equations'], family: 'brackets', level: pair('Collège et après', 'Middle school onward'),
    title: pair('Distribuer jusqu’au bout', 'Distributing all the way'),
    claim: '3(x + y) = 3x + y',
    vars: ['x', 'y'], range: { x: [1, 9], y: [1, 9] },
    L: (x, y) => 3 * (x + y), R: (x, y) => 3 * x + y, diagram: 'rectangle',
    why: pair(
      'Le facteur 3 multiplie toute la parenthèse : le rectangle de hauteur 3 et de largeur x + y est fait de deux rectangles, 3×x et 3×y. Oublier 3 sur y fait perdre 2y.',
      'The factor 3 multiplies the whole bracket: the rectangle of height 3 and width x + y is made of two rectangles, 3×x and 3×y. Forgetting the 3 on y loses 2y.'),
    repairs: [
      { text: '3(x + y) = 3x + 3y', rel: '=', L: (x, y) => 3 * (x + y), R: (x, y) => 3 * x + 3 * y },
      { text: '3(x + y) = 3x + y', rel: '=', L: (x, y) => 3 * (x + y), R: (x, y) => 3 * x + y },
      { text: '3(x + y) = 3xy', rel: '=', L: (x, y) => 3 * (x + y), R: (x, y) => 3 * x * y },
    ],
    links: ['#chapter/seconde-08'],
  },
  {
    id: 'lost-bracket-subtraction', topics: ['algebra/equations'], family: 'brackets', level: pair('Collège et après', 'Middle school onward'),
    title: pair('Soustraire une expression entière', 'Subtracting a whole expression'),
    claim: '(x² + 3x − 5) − (4x − 5) = x² + 3x − 5 − 4x − 5',
    vars: ['x'], range: { x: [-9, 9] },
    L: (x) => (x ** 2 + 3 * x - 5) - (4 * x - 5), R: (x) => x ** 2 + 3 * x - 5 - 4 * x - 5,
    why: pair(
      'Le signe moins agit sur toute la parenthèse : −(4x − 5) = −4x + 5. Sans parenthèses, le −5 reste −5 au lieu de devenir +5, et l’écart vaut 10 pour toute valeur de x.',
      'The minus sign acts on the whole bracket: −(4x − 5) = −4x + 5. Without the bracket the −5 stays −5 instead of becoming +5, and the gap is 10 for every value of x.'),
    repairs: [
      { text: '(x² + 3x − 5) − (4x − 5) = x² − x', rel: '=', L: (x) => (x ** 2 + 3 * x - 5) - (4 * x - 5), R: (x) => x ** 2 - x },
      { text: '(x² + 3x − 5) − (4x − 5) = x² − x − 10', rel: '=', L: (x) => (x ** 2 + 3 * x - 5) - (4 * x - 5), R: (x) => x ** 2 - x - 10 },
      { text: '(x² + 3x − 5) − (4x − 5) = x² + 7x − 10', rel: '=', L: (x) => (x ** 2 + 3 * x - 5) - (4 * x - 5), R: (x) => x ** 2 + 7 * x - 10 },
    ],
    links: ['#chapter/seconde-08'],
  },
  {
    id: 'square-of-negative', topics: ['algebra/equations'], family: 'brackets', level: pair('Collège et après', 'Middle school onward'),
    title: pair('Le carré d’un nombre négatif', 'The square of a negative number'),
    claim: '(−x)² = −x²',
    vars: ['x'], range: { x: [1, 9] },
    L: (x) => (-x) ** 2, R: (x) => -(x ** 2),
    why: pair(
      'L’exposant ne porte que sur ce qui est juste à sa gauche. Avec des parenthèses, (−x)² = (−x)(−x) = x² ; sans parenthèses, −x² = −(x²). Les deux expressions sont opposées l’une de l’autre, jamais égales pour x ≠ 0.',
      'The exponent applies only to what stands just before it. With brackets, (−x)² = (−x)(−x) = x²; without, −x² = −(x²). The two expressions are opposites of each other, never equal for x ≠ 0.'),
    repairs: [
      { text: '(−x)² = x²', rel: '=', L: (x) => (-x) ** 2, R: (x) => x ** 2 },
      { text: '(−x)² = −2x', rel: '=', L: (x) => (-x) ** 2, R: (x) => -2 * x },
      { text: '(−x)² = −(x²)', rel: '=', L: (x) => (-x) ** 2, R: (x) => -(x ** 2) },
    ],
    links: ['#chapter/seconde-08'],
  },
  // ---- functions ----
  {
    id: 'sqrt-of-square', family: 'functions', topics: ['analysis/functions'], level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('La racine d’un carré', 'The root of a square'),
    claim: '√(x²) = x', vars: ['x'], range: { x: [-9, 9] },
    L: (x) => Math.sqrt(x * x), R: (x) => x,
    why: pair(
      'Une racine carrée est toujours positive ou nulle : √(x²) est la valeur absolue |x|. Pour x négatif, √(x²) = −x, qui est positif, donc différent de x.',
      'A square root is never negative: √(x²) is the absolute value |x|. For negative x, √(x²) = −x, which is positive, hence different from x.'),
    repairs: [
      { text: '√(x²) = |x|', rel: '=', L: (x) => Math.sqrt(x * x), R: (x) => Math.abs(x) },
      { text: '√(x²) = x²', rel: '=', L: (x) => Math.sqrt(x * x), R: (x) => x * x },
      { text: '√(x²) = −x', rel: '=', L: (x) => Math.sqrt(x * x), R: (x) => -x },
    ],
    links: ['#chapter/seconde-04', '#chapter/seconde-06'],
  },
  {
    id: 'square-inequality', family: 'functions', topics: ['analysis/functions'], level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('Élever une inégalité au carré', 'Squaring an inequality'),
    claim: pair('Si x < y alors x² < y²', 'If x < y then x² < y²'), rel: '<', when: (x, y) => x < y,
    hypothesis: pair('Choisis x < y : l’affirmation ne parle que de ce cas.', 'Choose x < y: the claim is only about that case.'),
    vars: ['x', 'y'], range: { x: [-9, 9], y: [-9, 9] },
    L: (x) => x * x, R: (x, y) => y * y,
    why: pair(
      'La fonction carré est croissante sur [0 ; +∞[ mais décroissante sur ]−∞ ; 0]. Pour des nombres négatifs, l’ordre des carrés est inversé, et pour des signes différents il dépend des valeurs absolues : −3 < 2 mais 9 > 4.',
      'The square function increases on [0, +∞[ but decreases on ]−∞, 0]. For negative numbers the order of the squares is reversed, and for opposite signs it depends on the absolute values: −3 < 2 but 9 > 4.'),
    repairs: [
      { text: pair('Si 0 ≤ x < y alors x² < y²', 'If 0 ≤ x < y then x² < y²'), rel: '<', when: (x, y) => x >= 0 && x < y, L: (x) => x * x, R: (x, y) => y * y },
      { text: pair('Si x < y < 0 alors x² < y²', 'If x < y < 0 then x² < y²'), rel: '<', when: (x, y) => x < y && y < 0, L: (x) => x * x, R: (x, y) => y * y },
      { text: pair('Si x < y alors x² ≤ y²', 'If x < y then x² ≤ y²'), rel: '<=', when: (x, y) => x < y, L: (x) => x * x, R: (x, y) => y * y },
    ],
    links: ['#chapter/seconde-06', '#chapter/seconde-10'],
  },
  {
    id: 'reciprocal-order', family: 'functions', topics: ['analysis/functions'], level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('L’ordre et la fonction inverse', 'Order and the reciprocal function'),
    claim: pair('Si x < y alors 1/x < 1/y', 'If x < y then 1/x < 1/y'), rel: '<', when: (x, y) => x < y && x !== 0 && y !== 0,
    hypothesis: pair('Choisis x < y, tous deux non nuls.', 'Choose x < y, both nonzero.'),
    vars: ['x', 'y'], range: { x: [-5, 5], y: [-5, 5] },
    L: (x) => 1 / x, R: (x, y) => 1 / y,
    why: pair(
      'Sur ]0 ; +∞[ comme sur ]−∞ ; 0[, la fonction inverse est décroissante : x < y entraîne 1/x > 1/y. L’affirmation paraît juste entre un négatif et un positif (−1 < 1 et 1/(−1) < 1/1), mais ce cas ne dit rien des deux autres.',
      'On ]0, +∞[ as on ]−∞, 0[ the reciprocal function is decreasing: x < y gives 1/x > 1/y. The claim looks right between a negative and a positive number (−1 < 1 and 1/(−1) < 1/1), but that case says nothing about the other two.'),
    repairs: [
      { text: pair('Si 0 < x < y alors 1/x > 1/y', 'If 0 < x < y then 1/x > 1/y'), rel: '>', when: (x, y) => x > 0 && x < y, L: (x) => 1 / x, R: (x, y) => 1 / y },
      { text: pair('Si 0 < x < y alors 1/x < 1/y', 'If 0 < x < y then 1/x < 1/y'), rel: '<', when: (x, y) => x > 0 && x < y, L: (x) => 1 / x, R: (x, y) => 1 / y },
      { text: pair('Si x < y alors 1/x > 1/y', 'If x < y then 1/x > 1/y'), rel: '>', when: (x, y) => x < y && x !== 0 && y !== 0, L: (x) => 1 / x, R: (x, y) => 1 / y },
    ],
    links: ['#chapter/stmg-04', '#chapter/seconde-06'],
  },
  {
    id: 'compose-commute', family: 'functions', topics: ['analysis/functions'], level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('Composer dans le bon ordre', 'Composing in the right order'),
    claim: pair('f(g(x)) = g(f(x)), avec f(x) = x + 1 et g(x) = 2x', 'f(g(x)) = g(f(x)), with f(x) = x + 1 and g(x) = 2x'), vars: ['x'], range: { x: [-9, 9] },
    L: (x) => (2 * x) + 1, R: (x) => 2 * (x + 1),
    why: pair(
      'f(g(x)) applique g d’abord : f(2x) = 2x + 1. g(f(x)) applique f d’abord : g(x + 1) = 2x + 2. La composition n’est pas commutative ; ici les deux résultats diffèrent toujours de 1.',
      'f(g(x)) applies g first: f(2x) = 2x + 1. g(f(x)) applies f first: g(x + 1) = 2x + 2. Composition is not commutative; here the two results always differ by 1.'),
    repairs: [
      { text: 'f(g(x)) = 2x + 1', rel: '=', L: (x) => ((t) => t + 1)((t => 2 * t)(x)), R: (x) => 2 * x + 1 },
      { text: 'f(g(x)) = 2x + 2', rel: '=', L: (x) => ((t) => t + 1)((t => 2 * t)(x)), R: (x) => 2 * x + 2 },
      { text: 'g(f(x)) = 2x + 1', rel: '=', L: (x) => (t => 2 * t)(((t) => t + 1)(x)), R: (x) => 2 * x + 1 },
    ],
    links: ['#chapter/seconde-06'],
  },
  // ---- calculus ----
  {
    id: 'product-rule', family: 'calculus', topics: ['analysis/functions'], level: pair('Première et après', 'Year 11 onward'),
    title: pair('Dériver un produit', 'Differentiating a product'),
    claim: pair('(fg)′ = f′g′, avec f(x) = x² et g(x) = x', '(fg)′ = f′g′, with f(x) = x² and g(x) = x'), vars: ['x'], range: { x: [-5, 5] },
    L: (x) => 3 * x * x, R: (x) => 2 * x,
    why: pair(
      'Ici fg = x³, donc (fg)′ = 3x², alors que f′g′ = 2x × 1 = 2x. La dérivée d’un produit n’est pas le produit des dérivées : (fg)′ = f′g + fg′, soit 2x·x + x²·1 = 3x². Les deux côtés ne coïncident qu’en x = 0 parmi ces valeurs.',
      'Here fg = x³, so (fg)′ = 3x², while f′g′ = 2x × 1 = 2x. The derivative of a product is not the product of the derivatives: (fg)′ = f′g + fg′, that is 2x·x + x²·1 = 3x². Among these values the sides agree only at x = 0.'),
    repairs: [
      { text: '(fg)′ = f′g + fg′', rel: '=', L: (x) => 3 * x * x, R: (x) => 2 * x * x + x * x * 1 },
      { text: '(fg)′ = f′g′ + fg', rel: '=', L: (x) => 3 * x * x, R: (x) => 2 * x * 1 + x * x * x },
      { text: '(fg)′ = f′g − fg′', rel: '=', L: (x) => 3 * x * x, R: (x) => 2 * x * x - x * x * 1 },
    ],
    links: ['#chapter/premiere-04', '#chapter/terminale-06'],
  },
  {
    id: 'chain-rule', family: 'calculus', topics: ['analysis/functions'], level: pair('Première et après', 'Year 11 onward'),
    title: pair('Dériver une fonction composée', 'Differentiating a composite function'),
    claim: '((2x + 1)²)′ = 2(2x + 1)', vars: ['x'], range: { x: [-5, 5] },
    L: (x) => 4 * (2 * x + 1), R: (x) => 2 * (2 * x + 1),
    why: pair(
      'On a dérivé le carré sans dériver l’intérieur. Pour (u(x))², la dérivée est 2u(x)·u′(x) ; ici u(x) = 2x + 1 et u′(x) = 2, donc 2(2x + 1) × 2 = 4(2x + 1). L’écart vaut 2(2x + 1), nul seulement pour x = −1/2.',
      'The square was differentiated without differentiating the inside. For (u(x))² the derivative is 2u(x)·u′(x); here u(x) = 2x + 1 and u′(x) = 2, so 2(2x + 1) × 2 = 4(2x + 1). The gap is 2(2x + 1), zero only at x = −1/2.'),
    repairs: [
      { text: '((2x + 1)²)′ = 2 × 2 × (2x + 1)', rel: '=', L: (x) => 4 * (2 * x + 1), R: (x) => 2 * 2 * (2 * x + 1) },
      { text: '((2x + 1)²)′ = 2(2x + 1)(2x + 1)', rel: '=', L: (x) => 4 * (2 * x + 1), R: (x) => 2 * (2 * x + 1) * (2 * x + 1) },
      { text: '((2x + 1)²)′ = 4x + 1', rel: '=', L: (x) => 4 * (2 * x + 1), R: (x) => 4 * x + 1 },
    ],
    links: ['#chapter/premiere-04', '#chapter/terminale-06'],
  },
  {
    id: 'integral-of-product', family: 'calculus', topics: ['analysis/integration'], level: pair('Terminale', 'Year 12'),
    title: pair('Intégrer un produit', 'Integrating a product'),
    claim: '∫₀ˣ t²·t dt = (∫₀ˣ t² dt) × (∫₀ˣ t dt)', vars: ['x'], range: { x: [1, 9] },
    L: (x) => simpson((t) => t * t * t, x), R: (x) => simpson((t) => t * t, x) * simpson((t) => t, x),
    why: pair(
      'L’intégrale d’un produit n’est pas le produit des intégrales. Ici le côté gauche vaut x⁴/4 et le côté droit (x³/3)(x²/2) = x⁵/6 : leur rapport change avec x, et ils ne coïncident qu’en x = 3/2, hors des valeurs entières proposées.',
      'The integral of a product is not the product of the integrals. Here the left side is x⁴/4 and the right side is (x³/3)(x²/2) = x⁵/6: their ratio changes with x, and they agree only at x = 3/2, outside the whole values offered.'),
    repairs: [
      { text: '∫₀ˣ t³ dt = x⁴/4', rel: '=', L: (x) => simpson((t) => t * t * t, x), R: (x) => x ** 4 / 4 },
      { text: '∫₀ˣ t²·t dt = x³/3 + x²/2', rel: '=', L: (x) => simpson((t) => t * t * t, x), R: (x) => x ** 3 / 3 + x ** 2 / 2 },
      { text: '∫₀ˣ t²·t dt = 2x · 1', rel: '=', L: (x) => simpson((t) => t * t * t, x), R: (x) => 2 * x },
    ],
    links: ['#chapter/terminale-11'],
  },
  {
    id: 'log-of-sum', family: 'additive', topics: ['analysis/functions'], level: pair('Terminale', 'Year 12'),
    title: pair('Le logarithme d’une somme', 'The logarithm of a sum'),
    claim: 'ln(x + y) = ln x + ln y', vars: ['x', 'y'], range: { x: [1, 9], y: [1, 9] },
    L: (x, y) => Math.log(x + y), R: (x, y) => Math.log(x) + Math.log(y),
    why: pair(
      'Le logarithme transforme les produits en sommes : ln(xy) = ln x + ln y, pas ln(x + y). L’égalité demandée équivaut à x + y = xy, vraie par exemple pour x = y = 2 mais fausse presque partout.',
      'The logarithm turns products into sums: ln(xy) = ln x + ln y, not ln(x + y). The claimed equality is equivalent to x + y = xy, true for instance for x = y = 2 but false almost everywhere.'),
    repairs: [
      { text: 'ln(xy) = ln x + ln y', rel: '=', L: (x, y) => Math.log(x * y), R: (x, y) => Math.log(x) + Math.log(y) },
      { text: 'ln(x + y) = ln x × ln y', rel: '=', L: (x, y) => Math.log(x + y), R: (x, y) => Math.log(x) * Math.log(y) },
      { text: 'ln(x/y) = ln x + ln y', rel: '=', L: (x, y) => Math.log(x / y), R: (x, y) => Math.log(x) + Math.log(y) },
    ],
    links: ['#chapter/terminale-08', '#chapter/stmg-03'],
  },
  {
    id: 'modulus-of-sum', family: 'additive', topics: ['algebra/complex'], level: pair('Mathématiques expertes', 'Further mathematics'),
    title: pair('Le module d’une somme', 'The modulus of a sum'),
    claim: pair('|3 + w| = 3 + |w|, avec w = 4(cos x + i sin x)', '|3 + w| = 3 + |w|, with w = 4(cos x + i sin x)'), unit: '°', vars: ['x'], range: { x: [0, 180] },
    L: (x) => Math.hypot(3 + 4 * Math.cos(x * D), 4 * Math.sin(x * D)), R: () => 7,
    why: pair(
      'Le module d’une somme est au plus la somme des modules (inégalité triangulaire), avec égalité seulement si les deux nombres pointent dans la même direction, ici x = 0°. Géométriquement, un côté d’un triangle est plus court que la somme des deux autres.',
      'The modulus of a sum is at most the sum of the moduli (triangle inequality), with equality only when both numbers point the same way, here x = 0°. Geometrically, one side of a triangle is shorter than the sum of the other two.'),
    repairs: [
      { text: '|3 + w| ≤ 3 + |w|', rel: '<=', L: (x) => Math.hypot(3 + 4 * Math.cos(x * D), 4 * Math.sin(x * D)), R: () => 7 },
      { text: '|3 + w| ≥ 3 + |w|', rel: '>=', L: (x) => Math.hypot(3 + 4 * Math.cos(x * D), 4 * Math.sin(x * D)), R: () => 7 },
      { text: '|3 + w| = 3 × |w|', rel: '=', L: (x) => Math.hypot(3 + 4 * Math.cos(x * D), 4 * Math.sin(x * D)), R: () => 12 },
    ],
    links: ['#chapter/expertes-02', '#chapter/expertes-01'],
  },
  // ---- probability ----
  {
    id: 'union-of-events', family: 'probability', topics: ['probability/experiments'], level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('La probabilité d’une réunion', 'The probability of a union'),
    claim: pair('P(A ∪ B) = P(A) + P(B), avec |A| = 10, |B| = 8, 36 issues équiprobables et x = |A ∩ B|', 'P(A ∪ B) = P(A) + P(B), with |A| = 10, |B| = 8, 36 equally likely outcomes and x = |A ∩ B|'), vars: ['x'], range: { x: [0, 8] },
    L: (x) => unionSize(x) / 36, R: () => 18 / 36,
    why: pair(
      'Additionner P(A) et P(B) compte deux fois les issues communes. Il faut retirer P(A ∩ B) : P(A ∪ B) = P(A) + P(B) − P(A ∩ B). L’égalité demandée n’est vraie que si A et B sont disjoints, c’est-à-dire pour x = 0.',
      'Adding P(A) and P(B) counts the common outcomes twice. P(A ∩ B) must be removed: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). The claimed equality holds only when A and B are disjoint, that is for x = 0.'),
    repairs: [
      { text: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', rel: '=', L: (x) => unionSize(x) / 36, R: (x) => 10 / 36 + 8 / 36 - x / 36 },
      { text: 'P(A ∪ B) = P(A) + P(B) + P(A ∩ B)', rel: '=', L: (x) => unionSize(x) / 36, R: (x) => 10 / 36 + 8 / 36 + x / 36 },
      { text: 'P(A ∪ B) = P(A) × P(B)', rel: '=', L: (x) => unionSize(x) / 36, R: () => (10 / 36) * (8 / 36) },
    ],
    links: ['#chapter/seconde-14', '#chapter/premiere-05'],
  },
  {
    id: 'draw-without-replacement', family: 'probability', topics: ['probability/experiments'], level: pair('Première et après', 'Year 11 onward'),
    title: pair('Tirer sans remise', 'Drawing without replacement'),
    claim: pair('Urne de 10 boules dont x rouges, deux tirages sans remise : P(deux rouges) = (x/10)²', 'Urn of 10 balls with x red ones, two draws without replacement: P(two red) = (x/10)²'), vars: ['x'], range: { x: [2, 9] },
    L: (x) => comb(x, 2) / comb(10, 2), R: (x) => (x / 10) ** 2,
    why: pair(
      'Sans remise, la composition de l’urne change après le premier tirage : il reste x − 1 rouges sur 9 boules. P(deux rouges) = x/10 × (x − 1)/9, ce qui est toujours inférieur à (x/10)², valeur du tirage avec remise.',
      'Without replacement the urn changes after the first draw: x − 1 red balls remain among 9. P(two red) = x/10 × (x − 1)/9, always smaller than (x/10)², the value with replacement.'),
    repairs: [
      { text: pair('P(deux rouges) = x/10 × (x − 1)/9', 'P(two red) = x/10 × (x − 1)/9'), rel: '=', L: (x) => comb(x, 2) / comb(10, 2), R: (x) => (x / 10) * ((x - 1) / 9) },
      { text: pair('P(deux rouges) = x/10 × x/9', 'P(two red) = x/10 × x/9'), rel: '=', L: (x) => comb(x, 2) / comb(10, 2), R: (x) => (x / 10) * (x / 9) },
      { text: pair('P(deux rouges) = 2x/10', 'P(two red) = 2x/10'), rel: '=', L: (x) => comb(x, 2) / comb(10, 2), R: (x) => (2 * x) / 10 },
    ],
    links: ['#chapter/premiere-05', '#chapter/terminale-07'],
  },
  {
    id: 'conditional-swap', family: 'probability', topics: ['probability/conditioning'], level: pair('Première et après', 'Year 11 onward'),
    title: pair('Intervertir les deux probabilités conditionnelles', 'Swapping the two conditional probabilities'),
    claim: pair('P(A | B) = P(B | A), avec |A ∩ B| = 4, |A| = x et |B| = y', 'P(A | B) = P(B | A), with |A ∩ B| = 4, |A| = x and |B| = y'), vars: ['x', 'y'], range: { x: [4, 12], y: [4, 12] },
    L: (x, y) => 4 / y, R: (x, y) => 4 / x,
    why: pair(
      'P(A | B) = P(A ∩ B)/P(B) et P(B | A) = P(A ∩ B)/P(A) ont le même numérateur mais pas le même dénominateur. Elles sont égales seulement si P(A) = P(B), ici x = y. Confondre les deux revient à confondre « parmi les B, la part de A » et « parmi les A, la part de B ».',
      'P(A | B) = P(A ∩ B)/P(B) and P(B | A) = P(A ∩ B)/P(A) share the numerator but not the denominator. They are equal only if P(A) = P(B), here x = y. Confusing them mixes up "among the Bs, the share of As" with "among the As, the share of Bs".'),
    repairs: [
      { text: 'P(A | B) = P(A ∩ B) / P(B)', rel: '=', L: (x, y) => 4 / y, R: (x, y) => (4 / 36) / (y / 36) },
      { text: 'P(A | B) × P(A) = P(B | A) × P(B)', rel: '=', L: (x, y) => (4 / y) * (x / 36), R: (x, y) => (4 / x) * (y / 36) },
      { text: 'P(A | B) = P(B) / P(A)', rel: '=', L: (x, y) => 4 / y, R: (x, y) => y / x },
    ],
    links: ['#chapter/premiere-05', '#chapter/stmg-06', '#chapter/terminale-07'],
  },
  // ---- trigonometry ----
  {
    id: 'sine-of-sum', family: 'trigonometry', topics: ['analysis/integration'], level: pair('Première et après', 'Year 11 onward'),
    title: pair('Le sinus d’une somme', 'The sine of a sum'),
    claim: pair('sin(x + y) = sin x + sin y (angles en degrés)', 'sin(x + y) = sin x + sin y (angles in degrees)'), unit: '°', vars: ['x', 'y'], range: { x: [1, 89], y: [1, 89] },
    L: (x, y) => Math.sin((x + y) * D), R: (x, y) => Math.sin(x * D) + Math.sin(y * D),
    why: pair(
      'Le sinus n’est pas additif. La bonne formule est sin(x + y) = sin x cos y + cos x sin y. Le côté droit de l’égalité fausse peut même dépasser 1, valeur maximale du sinus, pour des angles proches de 90°.',
      'The sine is not additive. The correct formula is sin(x + y) = sin x cos y + cos x sin y. The right side of the false equality can even exceed 1, the maximum of the sine, for angles near 90°.'),
    repairs: [
      { text: 'sin(x + y) = sin x cos y + cos x sin y', rel: '=', L: (x, y) => Math.sin((x + y) * D), R: (x, y) => Math.sin(x * D) * Math.cos(y * D) + Math.cos(x * D) * Math.sin(y * D) },
      { text: 'sin(x + y) = sin x cos y − cos x sin y', rel: '=', L: (x, y) => Math.sin((x + y) * D), R: (x, y) => Math.sin(x * D) * Math.cos(y * D) - Math.cos(x * D) * Math.sin(y * D) },
      { text: 'sin(x + y) = sin x × sin y', rel: '=', L: (x, y) => Math.sin((x + y) * D), R: (x, y) => Math.sin(x * D) * Math.sin(y * D) },
    ],
    links: ['#chapter/premiere-10', '#chapter/terminale-14'],
  },
  {
    id: 'double-angle', family: 'trigonometry', topics: ['analysis/integration'], level: pair('Première et après', 'Year 11 onward'),
    title: pair('Le sinus du double d’un angle', 'The sine of a double angle'),
    claim: pair('sin(2x) = 2 sin x (x en degrés)', 'sin(2x) = 2 sin x (x in degrees)'), unit: '°', vars: ['x'], range: { x: [1, 89] },
    L: (x) => Math.sin(2 * x * D), R: (x) => 2 * Math.sin(x * D),
    why: pair(
      'Doubler l’angle ne double pas le sinus : sin(2x) = 2 sin x cos x. Comme cos x < 1 pour x ≠ 0, on a sin(2x) < 2 sin x sur ]0° ; 90°[.',
      'Doubling the angle does not double the sine: sin(2x) = 2 sin x cos x. Since cos x < 1 for x ≠ 0, sin(2x) < 2 sin x on ]0°, 90°[.'),
    repairs: [
      { text: 'sin(2x) = 2 sin x cos x', rel: '=', L: (x) => Math.sin(2 * x * D), R: (x) => 2 * Math.sin(x * D) * Math.cos(x * D) },
      { text: 'sin(2x) = sin x cos x', rel: '=', L: (x) => Math.sin(2 * x * D), R: (x) => Math.sin(x * D) * Math.cos(x * D) },
      { text: 'sin(2x) = 2 sin x cos 2x', rel: '=', L: (x) => Math.sin(2 * x * D), R: (x) => 2 * Math.sin(x * D) * Math.cos(2 * x * D) },
    ],
    links: ['#chapter/premiere-10', '#chapter/terminale-14', '#chapter/expertes-03'],
  },
  // ---- geometry ----
  {
    id: 'pythagoras-sum', family: 'geometry', topics: ['geometry/plane'], level: pair('Collège et après', 'Middle school onward'),
    title: pair('L’hypoténuse n’est pas la somme des côtés', 'The hypotenuse is not the sum of the legs'),
    claim: pair('Triangle rectangle de côtés a et b : l’hypoténuse c vérifie c = a + b', 'Right triangle with legs a and b: the hypotenuse c satisfies c = a + b'), vars: ['x', 'y'], range: { x: [1, 9], y: [1, 9] },
    L: (a, b) => Math.sqrt(a * a + b * b), R: (a, b) => a + b,
    why: pair(
      'Dans un triangle, un côté est toujours plus court que la somme des deux autres : c < a + b. Le théorème de Pythagore donne c² = a² + b², ce qui est différent de (a + b)² = a² + 2ab + b². (Ici x et y jouent les rôles de a et b.)',
      'In a triangle one side is always shorter than the sum of the other two: c < a + b. Pythagoras gives c² = a² + b², which differs from (a + b)² = a² + 2ab + b². (Here x and y play the roles of a and b.)'),
    repairs: [
      { text: 'c² = a² + b²', rel: '=', L: (a, b) => Math.sqrt(a * a + b * b) ** 2, R: (a, b) => a * a + b * b },
      { text: 'c² = (a + b)²', rel: '=', L: (a, b) => Math.sqrt(a * a + b * b) ** 2, R: (a, b) => (a + b) ** 2 },
      { text: 'c = √(a + b)', rel: '=', L: (a, b) => Math.sqrt(a * a + b * b), R: (a, b) => Math.sqrt(a + b) },
    ],
    links: ['#chapter/seconde-12'],
  },
  {
    id: 'scale-area', family: 'geometry', topics: ['geometry/plane'], level: pair('Collège et après', 'Middle school onward'),
    title: pair('Agrandir une figure : longueurs et aires', 'Enlarging a figure: lengths and areas'),
    claim: pair('On double le côté x d’un carré : son aire double', 'Doubling the side x of a square doubles its area'), vars: ['x'], range: { x: [1, 9] },
    L: (x) => (2 * x) ** 2, R: (x) => 2 * x * x,
    why: pair(
      'Un agrandissement de rapport k multiplie les longueurs par k et les aires par k². Pour k = 2, l’aire est multipliée par 4 : le grand carré contient quatre copies du petit.',
      'An enlargement of ratio k multiplies lengths by k and areas by k². For k = 2 the area is multiplied by 4: the large square holds four copies of the small one.'),
    repairs: [
      { text: pair('aire du grand carré = 4x²', 'area of the large square = 4x²'), rel: '=', L: (x) => (2 * x) ** 2, R: (x) => 4 * x * x },
      { text: pair('aire du grand carré = 2x²', 'area of the large square = 2x²'), rel: '=', L: (x) => (2 * x) ** 2, R: (x) => 2 * x * x },
      { text: pair('aire du grand carré = 2 × 2x', 'area of the large square = 2 × 2x'), rel: '=', L: (x) => (2 * x) ** 2, R: (x) => 2 * 2 * x },
    ],
    links: [],
  },
  {
    id: 'perimeter-area', family: 'geometry', topics: ['geometry/plane'], level: pair('Collège et après', 'Middle school onward'),
    title: pair('Même périmètre, même aire ?', 'Same perimeter, same area?'),
    claim: pair('Tous les rectangles de périmètre 20 ont la même aire que le carré de côté 5 (x : largeur)', 'All rectangles of perimeter 20 have the same area as the square of side 5 (x: width)'), vars: ['x'], range: { x: [1, 9] },
    L: (x) => x * (10 - x), R: () => 25,
    why: pair(
      'À périmètre fixé, l’aire dépend de la forme. Pour la largeur x, la longueur est 10 − x et l’aire x(10 − x) = 25 − (x − 5)², donc au plus 25, avec égalité seulement pour le carré x = 5.',
      'With the perimeter fixed, the area depends on the shape. For width x the length is 10 − x and the area x(10 − x) = 25 − (x − 5)², so at most 25, with equality only for the square x = 5.'),
    repairs: [
      { text: 'x(10 − x) ≤ 25', rel: '<=', L: (x) => x * (10 - x), R: () => 25 },
      { text: 'x(10 − x) ≥ 25', rel: '>=', L: (x) => x * (10 - x), R: () => 25 },
      { text: 'x(10 − x) = 10x', rel: '=', L: (x) => x * (10 - x), R: (x) => 10 * x },
    ],
    links: ['#chapter/premiere-02', '#chapter/premiere-06'],
  },
  // ---- notation and rounding ----
  {
    id: 'early-rounding', family: 'notation', topics: ['arithmetic/calculation'], level: pair('Collège et après', 'Middle school onward'),
    title: pair('Arrondir trop tôt', 'Rounding too early'),
    claim: pair('3 × (x ÷ 3 arrondi au centième) = x', '3 × (x ÷ 3 rounded to the nearest hundredth) = x'), vars: ['x'], range: { x: [1, 9] },
    L: (x) => 3 * round2(x / 3), R: (x) => x,
    why: pair(
      'Un arrondi perd de l’information : 10 ÷ 3 ≈ 3,33 et 3 × 3,33 = 9,99, non 10. Il faut garder la valeur exacte (la fraction) pendant les calculs et n’arrondir qu’à la fin. L’égalité n’est vraie que lorsque x ÷ 3 est déjà décimal à deux chiffres, c’est-à-dire pour x multiple de 3.',
      'A rounded value loses information: 10 ÷ 3 ≈ 3.33 and 3 × 3.33 = 9.99, not 10. Keep the exact value (the fraction) during the calculation and round only at the end. The equality holds only when x ÷ 3 already has two decimals, that is for x a multiple of 3.'),
    repairs: [
      { text: pair('3 × (x ÷ 3) = x, avec la valeur exacte', '3 × (x ÷ 3) = x, with the exact value'), rel: '=', L: (x) => 3 * (x / 3), R: (x) => x },
      { text: pair('(x ÷ 3 arrondi au centième) = x ÷ 3', '(x ÷ 3 rounded to the nearest hundredth) = x ÷ 3'), rel: '=', L: (x) => round2(x / 3), R: (x) => x / 3 },
      { text: pair('3 × (x ÷ 3 arrondi à l’unité) = x', '3 × (x ÷ 3 rounded to the unit) = x'), rel: '=', L: (x) => 3 * Math.round(x / 3), R: (x) => x },
    ],
    links: ['#chapter/seconde-04'],
  },
  {
    id: 'ambiguous-fraction', family: 'notation', topics: ['arithmetic/calculation'], level: pair('Collège et après', 'Middle school onward'),
    title: pair('Une écriture ambiguë : 12 ÷ x × y', 'An ambiguous expression: 12 ÷ x × y'),
    claim: '12 ÷ x × y = 12 ÷ (x × y)', vars: ['x', 'y'], range: { x: [1, 6], y: [1, 6] },
    L: (x, y) => (12 / x) * y, R: (x, y) => 12 / (x * y),
    why: pair(
      'Les opérations de même priorité se calculent de gauche à droite : 12 ÷ x × y = (12 ÷ x) × y = 12y/x. Pour diviser par le produit, il faut des parenthèses : 12 ÷ (x × y). En écriture fractionnaire, la barre de fraction joue le rôle des parenthèses.',
      'Operations of equal priority are evaluated left to right: 12 ÷ x × y = (12 ÷ x) × y = 12y/x. To divide by the product, brackets are needed: 12 ÷ (x × y). In fraction notation the fraction bar plays the role of brackets.'),
    repairs: [
      { text: '12 ÷ x × y = 12y/x', rel: '=', L: (x, y) => (12 / x) * y, R: (x, y) => (12 * y) / x },
      { text: '12 ÷ x × y = 12/(xy)', rel: '=', L: (x, y) => (12 / x) * y, R: (x, y) => 12 / (x * y) },
      { text: '12 ÷ x × y = 12/(x + y)', rel: '=', L: (x, y) => (12 / x) * y, R: (x, y) => 12 / (x + y) },
    ],
    links: ['#chapter/seconde-08'],
  },
];

// A flawed derivation: every step is an equation in `a`, `b`, evaluated with a = b = t. The faulty step is found by
// evaluation: it is the first step whose two sides differ (for t ≠ 0).
export const DERIVATIONS = [
  {
    id: 'division-by-zero', topics: ['algebra/equations'], family: 'zero', level: pair('Seconde et après', 'Year 10 onward'),
    title: pair('Une « preuve » que 1 = 2', 'A "proof" that 1 = 2'),
    intro: pair('On suppose a = b, avec a et b non nuls. Chaque ligne découle de la précédente. Laquelle est fausse ?', 'Assume a = b, with a and b nonzero. Each line follows from the one before. Which line is wrong?'),
    steps: [
      { say: pair('On part de a = b.', 'Start from a = b.'), eq: 'a = b', L: (a) => a, R: (a, b) => b },
      { say: pair('On multiplie par a.', 'Multiply by a.'), eq: 'ab = a²', L: (a, b) => a * b, R: (a) => a * a },
      { say: pair('On soustrait b².', 'Subtract b².'), eq: 'ab − b² = a² − b²', L: (a, b) => a * b - b * b, R: (a, b) => a * a - b * b },
      { say: pair('On factorise.', 'Factorise.'), eq: 'b(a − b) = (a + b)(a − b)', L: (a, b) => b * (a - b), R: (a, b) => (a + b) * (a - b) },
      { say: pair('On divise par a − b.', 'Divide by a − b.'), eq: 'b = a + b', L: (a, b) => b, R: (a, b) => a + b },
      { say: pair('Comme a = b, on remplace.', 'Since a = b, substitute.'), eq: 'b = 2b', L: (a, b) => b, R: (a, b) => 2 * b },
      { say: pair('On divise par b.', 'Divide by b.'), eq: '1 = 2', L: () => 1, R: () => 2 },
    ],
    // the number divided by in each step that divides, as a function of (a, b); null when the step does not divide
    divisor: [null, null, null, null, (a, b) => a - b, null, (a, b) => b],
    why: pair(
      'À la ligne 5, on divise par a − b. Or a = b, donc a − b = 0 : la ligne 4 dit 0 = 0, et diviser par zéro n’a pas de sens. Toute ligne correcte ne peut qu’être vérifiée ; la première fausse est celle qui suit cette division.',
      'On line 5 we divide by a − b. But a = b, so a − b = 0: line 4 says 0 = 0, and dividing by zero is meaningless. Every correct line can be checked numerically; the first false one is the line that follows that division.'),
    links: ['#chapter/seconde-08'],
  },
];

// Suggested route through the collection (a pathway, not a requirement); each entry is an id.
export const ROUTE = [
  'lost-bracket-subtraction', 'square-of-negative', 'partial-distribution', 'cancel-a-term', 'ambiguous-fraction', 'early-rounding',
  'square-of-sum', 'inverse-of-sum', 'root-of-sum', 'division-by-zero',
  'sqrt-of-square', 'square-inequality', 'reciprocal-order', 'compose-commute',
  'pythagoras-sum', 'scale-area', 'perimeter-area',
  'union-of-events', 'draw-without-replacement', 'conditional-swap',
  'product-rule', 'chain-rule', 'log-of-sum', 'integral-of-product',
  'sine-of-sum', 'double-angle', 'modulus-of-sum',
];
export const FAMILIES = {
  brackets: pair('Parenthèses et signes', 'Brackets and signs'),
  fractions: pair('Fractions', 'Fractions'),
  notation: pair('Notation et arrondis', 'Notation and rounding'),
  additive: pair('Ce qui ne se distribue pas', 'What does not distribute'),
  zero: pair('Division par zéro', 'Division by zero'),
  functions: pair('Fonctions et inégalités', 'Functions and inequalities'),
  geometry: pair('Géométrie', 'Geometry'),
  probability: pair('Probabilités', 'Probability'),
  calculus: pair('Dérivées et intégrales', 'Derivatives and integrals'),
  trigonometry: pair('Trigonométrie', 'Trigonometry'),
};
