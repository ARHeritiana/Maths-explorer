// Experiment `sequences` (template process): add or multiply. State {mode, u0, r, q, n}: the first term u0, the difference r
// (arithmetic) or the ratio q (geometric), and n, the last index shown (the scrubber). Pure maths: models/sequences.js.
import * as S from "../models/sequences.js";
import { clamp } from "../models/num.js";

const { isGeom, term } = S;
const COUNT = 12;   // terms drawn (indices 0 to 11); the table and the scrubber follow n
const nz = (v) => (v === 0 ? 0.5 : v);
const sup = (n) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
const power = (q, num) => (q < 0 ? `(${num(q)})` : num(q));

export default {
  id: "sequences", template: "process",
  symbol: "uₙ", group: ["Algèbre", "Algebra"],
  title: ["Additionner ou multiplier ?", "Add or multiply?"],
  short: ["Suites et croissance", "Sequences and growth"],
  intro: [
    "Compare une suite où l’on ajoute toujours la même chose à une suite où l’on multiplie toujours par le même nombre.",
    "Compare a sequence where you always add the same amount with one where you always multiply by the same number.",
  ],
  duration: 8,
  level: ["Première · Terminale", "Intermediate"],
  prereq: ["Puissances, calcul numérique", "Powers, numerical calculation"],
  model: S,
  state: { mode: "arith", u0: 2, r: 3, q: 2, n: 6 },
  controls: {
    start: {
      kind: "handle", color: "accent", axis: "y", grid: [1, 0.5], label: ["Point u₀ (premier terme)", "Point u₀ (first term)"],
      at: (s) => [0, s.u0],
      drag: (s, x, y) => ({ u0: nz(clamp(y, -5, 8)) }),
      valuetext: (s, f) => `u₀ = ${f.num(s.u0)}`,
    },
    step: {
      kind: "handle", color: "obj2", axis: "y", grid: [1, 0.5], label: ["Point u₁ (donne la raison)", "Point u₁ (sets the difference or ratio)"],
      nudge: (s, dx, dy) => { const d = dx || dy; return isGeom(s) ? { q: clamp(s.q + 0.25 * d, -2.5, 2.5) } : { r: clamp(s.r + 0.5 * d, -4, 4) }; },
      at: (s) => [1, term(s, 1)],
      drag: (s, x, y) => (isGeom(s) ? { q: clamp(Math.round(y / s.u0 / 0.25) * 0.25, -2.5, 2.5) } : { r: clamp(Math.round((y - s.u0) / 0.5) * 0.5, -4, 4) }),
      valuetext: (s, f) => (isGeom(s) ? `q = ${f.num(s.q)}` : `r = ${f.num(s.r)}`),
    },
    mode: {
      kind: "choice", label: ["Type de suite", "Type of sequence"], key: "mode",
      options: [{ value: "arith", label: ["Arithmétique : on ajoute", "Arithmetic: add"] }, { value: "geom", label: ["Géométrique : on multiplie", "Geometric: multiply"] }],
    },
    n: {
      kind: "scrubber", min: 1, max: 10, step: 1, label: ["n (dernier indice affiché)", "n (last index shown)"],
      get: (s) => s.n, set: (s, p) => ({ n: Math.round(p) }), play: { seconds: 6, from: 1, to: 10 }, digits: 0,
    },
  },
  views: {
    panels: ["graph"],
    graph: {
      x: [-1, COUNT - 0.5], y: [-8, 16], xTicks: Array.from({ length: COUNT }, (_, k) => k), yTicks: [-8, -4, 0, 4, 8, 12, 16],
      scene(s, { fmt }) {
        const list = S.terms(s, COUNT), pts = list.map((u, k) => ({ at: [k, u], color: k <= s.n ? "accent" : "muted", r: k <= s.n ? 6 : 3.5, hollow: k > s.n }));
        const guide = isGeom(s)
          ? (s.q > 0 ? [{ f: (x) => s.u0 * s.q ** x, color: "muted", dash: [5, 5], width: 1.5 }] : [])
          : [{ f: (x) => s.u0 + s.r * x, color: "muted", dash: [5, 5], width: 1.5 }];
        return {
          curves: guide,
          lines: [{ a: [s.n, -8], b: [s.n, 16], color: "muted", dash: [3, 5], width: 1.2 }],
          points: pts,
          texts: [{ at: [s.n, list[s.n]], text: `u${sup(s.n)} = ${fmt.num(list[s.n])}`, dx: 10, dy: -14, color: "accent" }],
        };
      },
    },
    formula(s, { fmt }) {
      const num = fmt.num;
      return isGeom(s) ? `uₙ = u₀ × qⁿ = ${num(s.u0)} × ${power(s.q, num)}ⁿ` : `uₙ = u₀ + n × r = ${num(s.u0)} ${s.r < 0 ? "−" : "+"} ${num(Math.abs(s.r))} n`;
    },
    readout(s, { fmt }) {
      const m = S.model(s), num = fmt.num;
      return [
        [["Premier terme u₀", "First term u₀"], num(s.u0)],
        [[`Terme u${sup(s.n)}`, `Term u${sup(s.n)}`], num(m.last)],
        [[`Somme u₀ + … + u${sup(s.n)}`, `Sum u₀ + … + u${sup(s.n)}`], num(m.total)],
      ];
    },
    table: {
      caption: ["Les termes autour de n", "The terms around n"],
      head: (s) => [["n", "n"], ["uₙ", "uₙ"], isGeom(s) ? ["uₙ / uₙ₋₁", "uₙ / uₙ₋₁"] : ["uₙ − uₙ₋₁", "uₙ − uₙ₋₁"]],
      data(s, { fmt }) {
        // eight consecutive terms ending at n (or the first eight when n is small: the next terms show what comes after)
        const first = Math.max(0, s.n - 7), list = S.terms(s, first + 8), num = fmt.num;
        const rows = Array.from({ length: 8 }, (_, i) => {
          const k = first + i, u = list[k];
          const rel = k === 0 ? "·" : isGeom(s) ? (list[k - 1] === 0 ? "·" : num(u / list[k - 1])) : num(u - list[k - 1]);
          return [String(k), num(u), rel];
        });
        return { rows, highlight: s.n - first };
      },
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { mode: "arith", u0: 2, r: 3 }, correct: 0,
      prompt: [
        "On part de u₀ = 2 et on ajoute 3 à chaque terme : 2, 5, 8, 11… Où vont se placer les points (n ; uₙ) ?",
        "We start at u₀ = 2 and add 3 each time: 2, 5, 8, 11… Where will the points (n, uₙ) lie?",
      ],
      choices: [
        ["Alignés sur une droite.", "On a straight line."],
        ["Sur une courbe qui monte de plus en plus vite.", "On a curve that rises faster and faster."],
        ["N’importe où, sans régularité.", "Anywhere, with no pattern."],
      ],
    },
    {
      id: "difference", kind: "explore", set: { mode: "arith", u0: 2, r: 3 }, unlock: ["step"],
      prompt: [
        "Fais glisser le point u₁ pour que chaque terme soit inférieur de 2 au précédent. Que vaut alors la différence uₙ₊₁ − uₙ, et que devient la droite en pointillés ?",
        "Drag the point u₁ so that each term is 2 less than the previous one. What is then the difference uₙ₊₁ − uₙ, and what happens to the dashed line?",
      ],
      hint: ["Le point u₁ est en (1 ; u₁) : la différence est r = u₁ − u₀.", "The point u₁ is at (1, u₁): the difference is r = u₁ − u₀."],
      goal: (s) => s.r === -2,
      done: [
        "r = −2 : les points restent alignés, sur une droite de pente −2 qui descend. Pour une suite arithmétique, la pente de la droite est la raison r.",
        "r = −2: the points stay aligned, on a line of slope −2 going down. For an arithmetic sequence the slope of the line is the difference r.",
      ],
    },
    {
      id: "versus", kind: "contrast", set: { mode: "arith", u0: 1, r: 1, q: 2 }, unlock: ["n"],
      variants: [
        { label: ["Additionner 1 à chaque pas", "Add 1 at each step"], set: { mode: "arith", u0: 1, r: 1 } },
        { label: ["Multiplier par 2 à chaque pas", "Multiply by 2 at each step"], set: { mode: "geom", u0: 1, q: 2 } },
      ],
      prompt: [
        "Les deux suites partent de u₀ = 1. Compare-les, puis fais défiler n jusqu’à 10 : laquelle est la plus grande à la fin, et à partir de quel rang dépasse-t-elle l’autre ?",
        "Both sequences start at u₀ = 1. Compare them, then scrub n up to 10: which is larger at the end, and from which index does it overtake the other?",
      ],
      done: [
        "Ajouter fait croître régulièrement (une droite) ; multiplier fait croître de plus en plus vite (une courbe). Elles coïncident jusqu’à u₁ = 2, puis la géométrique l’emporte dès u₂ (4 contre 3).",
        "Adding grows steadily (a line); multiplying grows faster and faster (a curve). They agree up to u₁ = 2, then the geometric one wins from u₂ (4 against 3).",
      ],
    },
    {
      id: "signs", kind: "explore", set: { mode: "geom", u0: 2, q: 1.5, n: 6 }, unlock: ["step", "n"],
      prompt: [
        "Fais glisser le point u₁ pour choisir une raison q négative, puis fais défiler n. Que deviennent les signes des termes ? Et leur valeur absolue quand |q| > 1 ?",
        "Drag the point u₁ to choose a negative ratio q, then scrub n. What happens to the signs of the terms? And to their absolute value when |q| > 1?",
      ],
      hint: ["Un terme négatif est sous l’axe des abscisses : u₁ passe sous l’axe quand q < 0.", "A negative term lies below the x-axis: u₁ goes below the axis when q < 0."],
      goal: (s) => s.q < 0 && s.n >= 4,
      done: [
        "Les termes changent de signe à chaque pas, car qⁿ alterne. La valeur absolue grandit si |q| > 1 et diminue si |q| < 1.",
        "The terms change sign at every step, because qⁿ alternates. The absolute value grows if |q| > 1 and shrinks if |q| < 1.",
      ],
    },
    {
      id: "formula", kind: "check", set: { mode: "geom", u0: 3, q: 2, n: 4 }, quantity: "u5", answer: 96,
      prompt: [
        "La suite géométrique a pour premier terme u₀ = 3 et pour raison q = 2. Le tableau s’arrête à n = 4. Sans changer la figure, calcule u₅ avec la formule uₙ = u₀ × qⁿ.",
        "The geometric sequence has first term u₀ = 3 and ratio q = 2. The table stops at n = 4. Without changing the figure, compute u₅ with the formula uₙ = u₀ × qⁿ.",
      ],
      hint: ["Chaque terme est le double du précédent : le tableau donne u₄, il reste un pas.", "Each term is double the previous one: the table gives u₄, one more step remains."],
      because: ["u₅ = 3 × 2⁵ = 96. Le premier terme porte ici l’indice 0.", "u₅ = 3 × 2⁵ = 96. The first term here has index 0."],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi les termes de la suite géométrique de raison q = −1,5 changent-ils de signe à chaque pas, alors que leur valeur absolue augmente ?",
        "Why do the terms of the geometric sequence with ratio q = −1.5 change sign at every step while their absolute value increases?",
      ],
      argument: [
        "On passe d’un terme au suivant en multipliant par −1,5 : uₙ₊₁ = −1,5 uₙ. Multiplier par un nombre négatif change le signe, et |−1,5| = 1,5 > 1 agrandit la valeur absolue : |uₙ| = |u₀| × 1,5ⁿ. Quelques termes affichés ne le prouvent pas pour tout n ; la formule uₙ = u₀ qⁿ, elle, le garantit.",
        "We go from one term to the next by multiplying by −1.5: uₙ₊₁ = −1.5 uₙ. Multiplying by a negative number changes the sign, and |−1.5| = 1.5 > 1 enlarges the absolute value: |uₙ| = |u₀| × 1.5ⁿ. A few displayed terms do not prove it for all n; the formula uₙ = u₀ qⁿ does.",
      ],
    },
  ],
  conclusion: [
    "Si uₙ = u₀ + nr, alors uₙ₊₁ − uₙ = r : la différence est constante. Si uₙ₊₁ = q uₙ à partir de u₀, alors uₙ = u₀ qⁿ pour tout entier n ≥ 0, par récurrence. Pour q = 0, les termes suivants sont nuls : on ne peut pas calculer leur quotient. Si q < 0 et u₀ ≠ 0, les signes alternent. Une fenêtre de quelques termes ne prouve pas ce qui se passe à l’infini.",
    "If uₙ = u₀ + nr, then uₙ₊₁ − uₙ = r: the difference is constant. If uₙ₊₁ = q uₙ from u₀, then uₙ = u₀ qⁿ for every integer n ≥ 0, by induction. For q = 0 all later terms are zero: their ratio cannot be calculated. If q < 0 and u₀ ≠ 0, signs alternate. A window of a few terms does not prove what happens at infinity.",
  ],
  history: {
    title: ["Fibonacci · 1202", "Fibonacci · 1202"],
    story: [
      "Le Liber abaci de Fibonacci a diffusé en Europe les chiffres indo-arabes. Son problème de lapins conduit à une suite où chaque terme est la somme des deux précédents : une autre façon de construire une suite.",
      "Fibonacci’s Liber abaci helped spread Hindu-Arabic numerals in Europe. His rabbit problem leads to a sequence where each term is the sum of the previous two: another way to build a sequence.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Fibonacci/",
  },
};
