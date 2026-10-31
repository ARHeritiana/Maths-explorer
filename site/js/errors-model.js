// Error correction collection ("Erreurs"): the pure mathematics, no DOM.
// Every activity starts from a false claim a learner might write. What the page tells the learner is computed here,
// never stored: a counterexample is found by evaluation, a proposed repair is accepted only if it holds on a grid of
// values of the claim's domain (`holds`), and the faulty step of a derivation is the first step whose equation fails.
// Text is bilingual pairs [French, English]. Mathematical strings are the same in both languages.
// To add an error: append a record to ERRORS (claim type) or to DERIVATIONS (step type) and a line to ROUTE; the
// tests check domains, counterexamples, the repairs and the links without further work.

const pair = (fr, en) => [fr, en];

// A claim is "left = right" for variables x and y, over `range` (inclusive integers, per variable).
// `repairs` are candidate corrections: `rel` is '=' or '<='. At least one must hold, the others are tempting but false.
export const ERRORS = [
  {
    id: 'square-of-sum', family: 'additive', level: pair('Seconde et après', 'Year 10 onward'),
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
    id: 'root-of-sum', family: 'additive', level: pair('Seconde et après', 'Year 10 onward'),
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
    id: 'inverse-of-sum', family: 'additive', level: pair('Seconde et après', 'Year 10 onward'),
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
    links: [],
  },
  {
    id: 'cancel-a-term', family: 'fractions', level: pair('Collège et après', 'Middle school onward'),
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
    id: 'partial-distribution', family: 'brackets', level: pair('Collège et après', 'Middle school onward'),
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
    id: 'lost-bracket-subtraction', family: 'brackets', level: pair('Collège et après', 'Middle school onward'),
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
    id: 'square-of-negative', family: 'brackets', level: pair('Collège et après', 'Middle school onward'),
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
    links: [],
  },
];

// A flawed derivation: every step is an equation in `a`, `b`, evaluated with a = b = t. The faulty step is found by
// evaluation: it is the first step whose two sides differ (for t ≠ 0).
export const DERIVATIONS = [
  {
    id: 'division-by-zero', family: 'zero', level: pair('Seconde et après', 'Year 10 onward'),
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
    links: [],
  },
];

// Suggested route through the collection (a pathway, not a requirement); each entry is an id.
export const ROUTE = ['lost-bracket-subtraction', 'square-of-negative', 'partial-distribution', 'cancel-a-term', 'square-of-sum', 'inverse-of-sum', 'root-of-sum', 'division-by-zero'];
export const FAMILIES = {
  brackets: pair('Parenthèses et signes', 'Brackets and signs'),
  fractions: pair('Fractions', 'Fractions'),
  additive: pair('Ce qui ne se distribue pas', 'What does not distribute'),
  zero: pair('Division par zéro', 'Division by zero'),
};
export const all = () => [...ERRORS, ...DERIVATIONS];
export const find = (id) => all().find((e) => e.id === id) || null;
export const isErrorRoute = (id) => !id || !!find(id);

const EPS = 1e-9;
export const close = (u, v) => Math.abs(u - v) <= EPS * Math.max(1, Math.abs(u), Math.abs(v));
const holdsAt = (rel, u, v) => (rel === '<=' ? u <= v + EPS * Math.max(1, Math.abs(v)) : close(u, v));

// Integer grid over the domain of a claim: every value of x, and y when there is one.
export function grid(error) {
  const [x0, x1] = error.range.x, ys = error.vars.includes('y') ? error.range.y : [0, 0], points = [];
  for (let x = x0; x <= x1; x++) for (let y = ys[0]; y <= ys[1]; y++) points.push([x, y]);
  return points;
}
// First point of the grid where `rel` fails for (L, R), or null when it holds everywhere.
export function counterexample(error, L = error.L, R = error.R, rel = '=') {
  for (const [x, y] of grid(error)) if (!holdsAt(rel, L(x, y), R(x, y))) return { x, y, left: L(x, y), right: R(x, y) };
  return null;
}
// A repair is accepted only if it holds on the whole grid; otherwise the learner gets the point where it fails.
export function checkRepair(error, repair) {
  const cx = counterexample(error, repair.L, repair.R, repair.rel);
  return cx ? { ok: false, counterexample: cx } : { ok: true, points: grid(error).length };
}
// Values at which the faulty claim happens to hold: an example never proves a general claim.
export function coincidences(error) {
  return grid(error).filter(([x, y]) => close(error.L(x, y), error.R(x, y)));
}

// Derivation: each step's two sides at a = b = t, whether it holds, the first false step (index) and the divisors.
export function evaluateDerivation(d, t) {
  const rows = d.steps.map((s, i) => {
    const left = s.L(t, t), right = s.R(t, t), divisor = d.divisor[i] ? d.divisor[i](t, t) : null;
    return { i, left, right, holds: close(left, right), divisor };
  });
  const firstFalse = rows.findIndex((r) => !r.holds);
  return { rows, firstFalse };
}

// Exact for integers, otherwise rounded (≈ marks a rounded value, = an exact one, as in the laboratory).
export function show(v, lang = 'fr') {
  if (Number.isInteger(v)) return String(v).replace('-', '−');
  const s = (Math.round(v * 1e4) / 1e4).toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 4 }).replace('-', '−');
  return '≈ ' + s;
}
