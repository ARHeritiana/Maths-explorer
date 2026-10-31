// Experiment `cobweb` (template process): the recurrence u_{n+1} = f(u_n) with f(x) = a x + b, drawn as a staircase between the
// graph of f and the line y = x. State {a, b, u0, n}: the handles are u0 on the x-axis, the point (0 ; b) and the point (2 ; f(2))
// that sets a, and the scrubber is n, the number of steps drawn. The fixed point l (f(l) = l) is where the two lines cross.
// Pure maths: models/cobweb.js.
import * as W from "../models/cobweb.js";
import { clamp } from "../models/num.js";

const { model } = W;
const sup = (n) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
const R = [-1.5, 9.5];
const U0MAX = [-1, 9], BMAX = [-2, 5], AMAX = [-2, 1.5];
const sgn = (v) => (v < 0 ? "−" : "+");

export default {
  id: "cobweb", template: "process",
  symbol: "ℓ", group: ["Analyse", "Calculus"],
  title: ["L’escalier d’une suite récurrente", "The staircase of a recurrence"],
  short: ["Suite uₙ₊₁ = f(uₙ) et point fixe", "Sequence uₙ₊₁ = f(uₙ) and fixed point"],
  intro: [
    "Une suite définie par uₙ₊₁ = f(uₙ) se lit sur le graphique de f et la droite y = x : on monte jusqu’à la courbe, on traverse jusqu’à la droite, on recommence. Où l’escalier mène-t-il ?",
    "A sequence defined by uₙ₊₁ = f(uₙ) can be read on the graph of f and the line y = x: go up to the curve, across to the line, repeat. Where does the staircase lead?",
  ],
  duration: 9,
  level: ["Terminale", "Upper secondary"],
  prereq: ["Fonctions affines, suites", "Affine functions, sequences"],
  model: W,
  state: { a: 0.5, b: 2, u0: 8, n: 6 },
  ease: ['a', 'b', 'u0'],   // continuous keys the figure glides toward (shell.js); handles marked `soft` are free with a magnet
  controls: {
    start: {
      kind: "handle", soft: true, color: "accent", axis: "x", grid: [0.5, 1], label: ["Point u₀ sur l’axe des abscisses", "Point u₀ on the x-axis"],
      at: (s) => [s.u0, 0],
      drag: (s, x) => ({ u0: clamp(x, U0MAX[0], U0MAX[1]) }),
      valuetext: (s, f) => `u₀ = ${f.num(s.u0)}`,
    },
    intercept: {
      kind: "handle", soft: true, color: "obj3", axis: "y", grid: [1, 0.5], label: ["Point (0 ; b) de la droite de f", "Point (0, b) of the line of f"],
      at: (s) => [0, s.b],
      drag: (s, x, y) => ({ b: clamp(y, BMAX[0], BMAX[1]) }),
      valuetext: (s, f) => `b = ${f.num(s.b)}`,
    },
    slope: {
      kind: "handle", soft: true, color: "obj2", axis: "y", grid: [1, 0.5], label: ["Point (2 ; f(2)) qui règle a", "Point (2, f(2)) that sets a"],
      at: (s) => [2, 2 * s.a + s.b],
      drag: (s, x, y) => ({ a: clamp(Math.round((y - s.b) / 2 / 0.25) * 0.25, AMAX[0], AMAX[1]) }),
      nudge: (s, dx, dy) => ({ a: clamp(s.a + 0.25 * (dx || dy), AMAX[0], AMAX[1]) }),
      valuetext: (s, f) => `a = ${f.num(s.a)}`,
    },
    n: {
      kind: "scrubber", min: 0, max: 12, step: 1, label: ["n (nombre de pas)", "n (number of steps)"],
      get: (s) => s.n, set: (s, p) => ({ n: Math.round(p) }), play: { seconds: 8, from: 0, to: 12 }, digits: 0,
    },
  },
  views: {
    panels: ["graph"],
    graph: {
      x: R, y: R, equal: true, xTicks: [0, 2, 4, 6, 8], yTicks: [0, 2, 4, 6, 8],
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num, list = m.terms;
        const last = list.length - 1;
        return {
          lines: [{ a: [R[0], R[0]], b: [R[1], R[1]], color: "muted", dash: [6, 5], width: 1.6 }],
          curves: [{ f: m.f, color: "accent", width: 3 }],
          polys: [{ pts: m.path, color: "obj2", width: 2.2, close: false }],
          points: [
            ...(m.fixed !== null ? [{ at: [m.fixed, m.fixed], color: "pos", r: 6, hollow: true, label: `ℓ ${fmt.eq(m.fixed)} ${num(m.fixed)}`, dx: 10, dy: 24 }] : []),
            ...list.map((u, k) => ({ at: [u, 0], color: k === last ? "obj2" : "obj3", r: k === last ? 5.5 : 4, ...(k === 0 || k === last ? { label: `u${sup(k)}`, dx: 0, dy: -12, anchor: "center" } : {}) })),
          ],
          texts: [{ at: [R[1] - 0.2, R[1] - 0.2], text: "y = x", color: "muted", anchor: "right", dy: 18, size: 15 }],
        };
      },
    },
    formula(s, { fmt }) {
      const num = fmt.num, a = s.a === 1 ? "" : s.a === -1 ? "−" : `${num(s.a)} `;
      const bpart = s.b === 0 ? "" : ` ${sgn(s.b)} ${num(Math.abs(s.b))}`;
      return `uₙ₊₁ = f(uₙ) = ${s.a === 0 ? "" : `${a}uₙ`}${s.a === 0 ? num(s.b) : bpart}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr, none = fr ? "aucun" : "none";
      return [
        [[`Terme u${sup(s.n)}`, `Term u${sup(s.n)}`], fmt.read(m.last)],
        [["Point fixe ℓ (f(ℓ) = ℓ)", "Fixed point ℓ (f(ℓ) = ℓ)"], m.fixed === null ? none : fmt.read(m.fixed)],
        [[`Écart |u${sup(s.n)} − ℓ|`, `Gap |u${sup(s.n)} − ℓ|`], m.gap === null ? "·" : fmt.read(m.gap)],
      ];
    },
    table: {
      caption: ["Les termes autour de n", "The terms around n"],
      head: [["n", "n"], ["uₙ", "uₙ"], ["|uₙ − ℓ|", "|uₙ − ℓ|"]],
      data(s, { fmt }) {
        const first = Math.max(0, s.n - 7), list = W.terms(s, first + 8), fixed = W.fixedPoint(s);
        const rows = Array.from({ length: 8 }, (_, i) => { const k = first + i; return [String(k), fmt.read(list[k]), fixed === null ? "·" : fmt.read(Math.abs(list[k] - fixed))]; });
        return { rows, highlight: s.n - first };
      },
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { a: 0.5, b: 2, u0: 8, n: 3 }, correct: 0,
      prompt: [
        "Soit u₀ = 8 et uₙ₊₁ = 0,5 uₙ + 2. On calcule u₁ = 6, u₂ = 5, u₃ = 4,5. Que font les termes ensuite ?",
        "Let u₀ = 8 and uₙ₊₁ = 0.5 uₙ + 2. We compute u₁ = 6, u₂ = 5, u₃ = 4.5. What do the terms do next?",
      ],
      choices: [
        ["Ils se rapprochent de 4 sans la dépasser.", "They get closer to 4 without passing it."],
        ["Ils continuent de descendre sans s’arrêter.", "They keep going down without stopping."],
        ["Ils s’arrêtent à 4,5.", "They stop at 4.5."],
      ],
    },
    {
      id: "steps", kind: "explore", set: { a: 0.5, b: 2, u0: 8, n: 0 }, unlock: ["n"],
      prompt: [
        "Fais défiler n jusqu’à 10. Où l’escalier mène-t-il ? Quel point de la droite y = x semble atteint, et que se passe-t-il pour l’écart |uₙ − ℓ| ?",
        "Scrub n up to 10. Where does the staircase lead? Which point of the line y = x seems to be reached, and what happens to the gap |uₙ − ℓ|?",
      ],
      hint: [
        "Le point fixe ℓ est l’abscisse du point où la courbe de f coupe la droite y = x.",
        "The fixed point ℓ is the x-coordinate of the point where the graph of f crosses the line y = x.",
      ],
      goal: (s) => s.n >= 10,
      done: [
        "L’escalier se resserre vers le point où la courbe coupe la droite y = x, ici (4 ; 4). L’écart |uₙ − ℓ| est divisé par 2 à chaque pas : les termes se rapprochent de ℓ = 4 sans l’atteindre.",
        "The staircase tightens towards the point where the curve crosses the line y = x, here (4, 4). The gap |uₙ − ℓ| is halved at each step: the terms get closer to ℓ = 4 without reaching it.",
      ],
    },
    {
      id: "start", kind: "contrast", set: { a: 0.5, b: 2, u0: 8, n: 8 },
      variants: [
        { label: ["Départ u₀ = 8", "Start u₀ = 8"], set: { u0: 8 } },
        { label: ["Départ u₀ = −1", "Start u₀ = −1"], set: { u0: -1 } },
      ],
      prompt: [
        "Compare les deux départs avec la même fonction f. Les termes viennent de côtés opposés : où vont-ils ? Le point fixe dépend-il de u₀ ?",
        "Compare the two starts with the same function f. The terms come from opposite sides: where do they go? Does the fixed point depend on u₀?",
      ],
      done: [
        "Les deux suites se rapprochent de ℓ = 4, l’une par au-dessus, l’autre par en dessous. Le point fixe ne dépend que de f (c’est la solution de f(ℓ) = ℓ), pas de u₀.",
        "Both sequences get closer to ℓ = 4, one from above and the other from below. The fixed point depends only on f (it solves f(ℓ) = ℓ), not on u₀.",
      ],
    },
    {
      id: "slope", kind: "explore", set: { a: 0.5, b: 2, u0: 1, n: 8 }, unlock: ["slope"],
      prompt: [
        "Fais glisser le point (2 ; f(2)) pour changer a. Trouve des valeurs de a pour lesquelles les termes ne se rapprochent plus du point fixe. Que vaut alors |a| ?",
        "Drag the point (2, f(2)) to change a. Find values of a for which the terms no longer get closer to the fixed point. What is |a| then?",
      ],
      hint: [
        "Compare la pente de la droite de f avec celle de la droite y = x, qui vaut 1. Essaie une pente négative aussi.",
        "Compare the slope of the line of f with that of the line y = x, which is 1. Try a negative slope too.",
      ],
      goal: (s) => Math.abs(s.a) > 1,
      done: [
        "Pour |a| > 1, l’écart |uₙ − ℓ| est multiplié par |a| > 1 à chaque pas : les termes s’éloignent de ℓ (en spirale si a < 0). Pour |a| < 1 ils s’en rapprochent. Le point fixe existe dans les deux cas, mais il ne suffit pas à ce que la suite le rejoigne.",
        "For |a| > 1 the gap |uₙ − ℓ| is multiplied by |a| > 1 at each step: the terms move away from ℓ (in a spiral if a < 0). For |a| < 1 they approach it. The fixed point exists in both cases, but that is not enough for the sequence to reach it.",
      ],
    },
    {
      id: "fixed", kind: "check", set: { a: 0.75, b: 1.5, u0: 0, n: 4 }, quantity: "fixed", answer: 6, tolerance: 0.01,
      prompt: [
        "Ici f(x) = 0,75 x + 1,5. Lis sur la figure où la courbe coupe la droite y = x, puis vérifie par le calcul : quelle est la valeur du point fixe ℓ, solution de ℓ = 0,75 ℓ + 1,5 ?",
        "Here f(x) = 0.75 x + 1.5. Read on the figure where the curve crosses the line y = x, then check by calculation: what is the fixed point ℓ, the solution of ℓ = 0.75 ℓ + 1.5?",
      ],
      hint: [
        "Résous ℓ − 0,75 ℓ = 1,5, c’est-à-dire 0,25 ℓ = 1,5.",
        "Solve ℓ − 0.75 ℓ = 1.5, that is 0.25 ℓ = 1.5.",
      ],
      because: [
        "0,25 ℓ = 1,5 donne ℓ = 6. Les termes (0, 1,5, 2,625, 3,47…) se rapprochent de 6 car |a| = 0,75 < 1.",
        "0.25 ℓ = 1.5 gives ℓ = 6. The terms (0, 1.5, 2.625, 3.47…) get closer to 6 because |a| = 0.75 < 1.",
      ],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi, si la suite (uₙ) se rapproche d’un nombre ℓ, ce nombre vérifie-t-il forcément f(ℓ) = ℓ ? Et la réciproque est-elle vraie ?",
        "Why, if the sequence (uₙ) gets closer to a number ℓ, must that number satisfy f(ℓ) = ℓ? And is the converse true?",
      ],
      argument: [
        "Si uₙ tend vers ℓ, alors uₙ₊₁ tend aussi vers ℓ. Comme uₙ₊₁ = a uₙ + b et que a uₙ + b tend vers aℓ + b (limite d’une somme et d’un produit par une constante), on obtient ℓ = aℓ + b, c’est-à-dire f(ℓ) = ℓ. La réciproque est fausse : pour a = 2 et b = −2, ℓ = 2 vérifie f(ℓ) = ℓ, mais une suite qui part de u₀ ≠ 2 s’en éloigne. Un point fixe est une condition nécessaire pour avoir une limite, pas une condition suffisante.",
        "If uₙ tends to ℓ then uₙ₊₁ also tends to ℓ. Since uₙ₊₁ = a uₙ + b and a uₙ + b tends to aℓ + b (limit of a sum and of a constant multiple), we get ℓ = aℓ + b, that is f(ℓ) = ℓ. The converse is false: for a = 2 and b = −2, ℓ = 2 satisfies f(ℓ) = ℓ, but a sequence that starts from u₀ ≠ 2 moves away from it. A fixed point is a necessary condition for a limit, not a sufficient one.",
      ],
    },
  ],
  conclusion: [
    "Pour uₙ₊₁ = a uₙ + b avec a ≠ 1, le point fixe est ℓ = b/(1 − a), et uₙ − ℓ = aⁿ (u₀ − ℓ) : si |a| < 1 la suite tend vers ℓ, si |a| > 1 et u₀ ≠ ℓ elle s’en éloigne. Pour a = 1, uₙ₊₁ = uₙ + b est arithmétique. Quelques escaliers illustrent ces cas ; la formule uₙ − ℓ = aⁿ (u₀ − ℓ), démontrée par récurrence, les établit pour tout n.",
    "For uₙ₊₁ = a uₙ + b with a ≠ 1, the fixed point is ℓ = b/(1 − a), and uₙ − ℓ = aⁿ (u₀ − ℓ): if |a| < 1 the sequence tends to ℓ, if |a| > 1 and u₀ ≠ ℓ it moves away. For a = 1, uₙ₊₁ = uₙ + b is arithmetic. A few staircases illustrate these cases; the formula uₙ − ℓ = aⁿ (u₀ − ℓ), proved by induction, establishes them for every n.",
  ],
  history: {
    title: ["Banach · 1922", "Banach · 1922"],
    story: [
      "En 1922, Stefan Banach énonça le principe de contraction : si une application d’un espace complet réduit les distances dans un rapport fixe inférieur à 1, ses itérations convergent vers un unique point fixe. Pour f(x) = a x + b avec |a| < 1, c’est ce que montre l’escalier.",
      "In 1922 Stefan Banach stated the contraction principle: if a map of a complete space shrinks distances by a fixed ratio below 1, its iterates converge to a unique fixed point. For f(x) = a x + b with |a| < 1, that is what the staircase shows.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Banach/",
  },
};
