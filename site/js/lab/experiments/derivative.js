// Experiment `derivative` (template process): the secant AB of y = x^2 tends to the tangent at A as h tends to 0. State {x, h}:
// A has abscissa x, B has abscissa x + h (h may be negative). The scrubber moves |h| along a fixed list of sizes.
// Pure maths: models/derivative.js.
import * as D from "../models/derivative.js";
import { clamp } from "../models/num.js";

const { model, slope, f } = D;
// |h| positions of the scrubber, from far to very close; between two positions h is interpolated geometrically.
const SIZES = [2, 1.5, 1, 0.75, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.001];
const sizeAt = (p) => {
  const i = clamp(Math.floor(p), 0, SIZES.length - 2), k = clamp(p - i, 0, 1);
  return SIZES[i] * (SIZES[i + 1] / SIZES[i]) ** k;
};
const positionOf = (size) => {
  const m = clamp(size, SIZES.at(-1), SIZES[0]);
  let i = SIZES.findIndex((v, j) => j < SIZES.length - 1 && m <= v && m >= SIZES[j + 1]);
  if (i < 0) i = SIZES.length - 2;
  return i + Math.log(SIZES[i] / m) / Math.log(SIZES[i] / SIZES[i + 1]);
};
const sign = (h) => (h < 0 ? -1 : 1);

export default {
  id: "derivative", template: "process",
  symbol: "f′", group: ["Analyse", "Calculus"],
  title: ["Approcher une tangente", "Approaching a tangent"],
  short: ["Dérivée et taux de variation", "Derivatives and rates of change"],
  intro: [
    "Rapproche le point B du point A sur la parabole y = x² et observe la pente de la sécante (AB).",
    "Bring the point B towards the point A on the parabola y = x² and watch the slope of the secant (AB).",
  ],
  duration: 8,
  level: ["Première · Terminale", "Intermediate · Advanced"],
  prereq: ["Fonctions, pente d’une droite", "Functions, slope of a line"],
  model: D,
  state: { x: 1, h: 1 },
  controls: {
    nearby: {
      kind: "handle", color: "obj2", axis: "x", grid: [0.05, 0], label: ["Point B", "Point B"],
      at: (s) => [s.x + s.h, f(s.x + s.h)],
      drag: (s, wx) => {
        let h = Math.round((wx - s.x) / 0.05) * 0.05;
        if (Math.abs(h) < 0.05) h = 0.05 * (wx < s.x ? -1 : wx > s.x ? 1 : sign(s.h));
        h = clamp(Number(h.toFixed(10)), -3, 3);
        return s.x + h < -3.4 || s.x + h > 3.4 ? null : { h };
      },
      valuetext: (s, f2) => `h = ${f2.num(s.h, 3)}`,
    },
    base: {
      kind: "handle", color: "accent", axis: "x", grid: [0.25, 0], label: ["Point A", "Point A"],
      at: (s) => [s.x, f(s.x)],
      drag: (s, wx) => ({ x: clamp(wx, -3, 3) }),
      valuetext: (s, f2) => `x = ${f2.num(s.x)}`,
    },
    h: {
      kind: "scrubber", min: 0, max: SIZES.length - 1, step: 0.05, label: ["|h| : distance entre A et B", "|h|: distance between A and B"],
      get: (s) => positionOf(Math.abs(s.h)), set: (s, p) => ({ h: sign(s.h) * sizeAt(p) }),
      format: (p, { fmt }) => fmt.num(sizeAt(p), 3), play: { seconds: 6, from: 0, to: SIZES.length - 1, step: 2 },
    },
    side: {
      kind: "choice", label: ["Côté de B", "Side of B"],
      get: (s) => (s.h < 0 ? "left" : "right"), set: (s, v) => ({ h: (v === "left" ? -1 : 1) * Math.abs(s.h) }),
      options: [{ value: "right", label: ["À droite (h > 0)", "Right (h > 0)"] }, { value: "left", label: ["À gauche (h < 0)", "Left (h < 0)"] }],
    },
  },
  views: {
    panels: ["graph"],
    graph: {
      x: [-3.5, 3.5], y: [-2, 10], xTicks: [-3, -2, -1, 0, 1, 2, 3], yTicks: [0, 2, 4, 6, 8, 10],
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num, xb = s.x + s.h, wide = Math.abs(s.h) >= 0.2;
        return {
          curves: [{ f, color: "accent", width: 3 }],
          lines: [
            { a: [s.x, m.ya], b: [s.x + 1, m.ya + m.tangent], extend: true, color: "obj3", width: 2.5, dash: [9, 5] },
            { a: [s.x, m.ya], b: [xb, m.yb], extend: true, color: "obj2", width: 2.5 },
            { a: [s.x, m.ya], b: [xb, m.ya], color: "muted", width: 1.5, dash: [3, 4] },
            { a: [xb, m.ya], b: [xb, m.yb], color: "muted", width: 1.5, dash: [3, 4] },
          ],
          points: [
            { at: [s.x, m.ya], color: "accent", r: 5, label: "A", dx: -20, dy: -12 },
            { at: [xb, m.yb], color: "obj2", r: 5, label: "B", dx: 10, dy: -12 },
          ],
          texts: wide ? [
            { at: [s.x + s.h / 2, m.ya], text: `h = ${num(s.h, 2)}`, dy: 20, anchor: "center", color: "muted" },
            { at: [xb, (m.ya + m.yb) / 2], text: `Δy = ${num(m.yb - m.ya, 2)}`, dx: s.h > 0 ? 8 : -8, anchor: s.h > 0 ? "left" : "right", color: "muted" },
          ] : [],
        };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num;
      return `${fmt.fr ? "Pente de (AB)" : "Slope of (AB)"} = (yB − yA) / (xB − xA) = (${num(m.yb, 3)} − ${num(m.ya, 3)}) / ${num(s.h, 3)} = ${num(m.secant, 3)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num;
      return [
        [["Pente de la sécante (AB)", "Slope of the secant (AB)"], num(m.secant, 3)],
        [["Pente de la tangente en A", "Slope of the tangent at A"], num(m.tangent, 3)],
        [["Écart entre les deux pentes", "Gap between the two slopes"], num(m.gap, 3)],
      ];
    },
    table: {
      caption: ["Pente de la sécante pour des h de plus en plus petits", "Secant slope for smaller and smaller h"],
      head: [["h", "h"], ["Pente de (AB)", "Slope of (AB)"], ["Écart avec 2x", "Gap to 2x"]],
      data(s, { fmt }) {
        const num = fmt.num, hs = [1, 0.5, 0.1, 0.01, 0.001], sg = sign(s.h);
        const rows = hs.map((v) => { const sl = slope(s.x, sg * v); return [num(sg * v, 3), num(sl, 4), num(sl - 2 * s.x, 4)]; });
        return { rows, highlight: hs.findIndex((v) => Math.abs(Math.abs(s.h) - v) < 1e-9) };
      },
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { x: 1, h: 1 }, correct: 0,
      prompt: [
        "Les points A(1 ; 1) et B(2 ; 4) sont sur la parabole y = x². La droite (AB) a pour pente 3. Si B se rapproche de A le long de la courbe, que devient cette pente ?",
        "The points A(1, 1) and B(2, 4) lie on the parabola y = x². The line (AB) has slope 3. If B moves towards A along the curve, what happens to this slope?",
      ],
      choices: [
        ["Elle se stabilise vers une valeur précise.", "It settles towards a precise value."],
        ["Elle augmente sans limite.", "It grows without bound."],
        ["Elle devient nulle.", "It becomes zero."],
      ],
    },
    {
      id: "approach", kind: "explore", set: { x: 1, h: 1 }, unlock: ["h"],
      prompt: [
        "Fais tendre h vers 0 avec le curseur (ou la lecture). Vers quelle valeur la pente de la sécante semble-t-elle tendre ? Compare avec le tableau.",
        "Make h tend to 0 with the slider (or the play button). What value does the slope of the secant seem to approach? Compare with the table.",
      ],
      hint: ["Regarde la ligne « Pente de la tangente en A » : la sécante s’en rapproche.", "Look at the line “Slope of the tangent at A”: the secant approaches it."],
      goal: (s) => Math.abs(s.h) <= 0.02,
      done: [
        "La pente se rapproche de 2 : la sécante (AB) tend vers la tangente en A. Mais h ne vaut jamais 0 : le quotient n’est pas défini en h = 0, la dérivée est une limite.",
        "The slope approaches 2: the secant (AB) tends to the tangent at A. But h is never 0: the quotient is not defined at h = 0; the derivative is a limit.",
      ],
    },
    {
      id: "sides", kind: "contrast", set: { x: 1, h: 0.5 }, unlock: ["h"],
      variants: [
        { label: ["B à droite de A (h > 0)", "B right of A (h > 0)"], set: { h: 0.5 } },
        { label: ["B à gauche de A (h < 0)", "B left of A (h < 0)"], set: { h: -0.5 } },
      ],
      prompt: [
        "Compare les deux côtés, puis fais tendre |h| vers 0 dans chaque cas. Les deux approches mènent-elles à la même valeur de pente ?",
        "Compare the two sides, then make |h| tend to 0 in each case. Do both approaches lead to the same slope?",
      ],
      done: [
        "Oui : à droite la pente vaut 2x + h, un peu plus que 2x ; à gauche, un peu moins. Dans les deux cas l’écart avec 2x est |h|, qui tend vers 0.",
        "Yes: on the right the slope is 2x + h, slightly more than 2x; on the left, slightly less. In both cases the gap to 2x is |h|, which tends to 0.",
      ],
    },
    {
      id: "where", kind: "explore", set: { x: 1, h: 0.05 }, unlock: ["base"],
      prompt: [
        "Garde h petit et fais glisser le point A. Relève la pente de la tangente en x = −1, en x = 1, puis en x = 2. Pour quelle valeur de x la tangente est-elle horizontale ?",
        "Keep h small and drag the point A. Read the slope of the tangent at x = −1, x = 1, then x = 2. For which value of x is the tangent horizontal?",
      ],
      hint: ["Une tangente horizontale a une pente nulle.", "A horizontal tangent has slope zero."],
      goal: (s) => s.x === 0,
      done: [
        "En x = 0 la tangente est horizontale : sa pente 2x vaut 0. C’est le sommet de la parabole. La pente de la tangente vaut 2x en chaque point.",
        "At x = 0 the tangent is horizontal: its slope 2x is 0. This is the vertex of the parabola. The slope of the tangent is 2x at every point.",
      ],
    },
    {
      id: "slope", kind: "check", set: { x: 3, h: 0.01 }, quantity: "tangent", answer: 6, tolerance: 0.005,
      prompt: [
        "A est au point d’abscisse 3 et B est tout près. La barre de résultats donne la pente de la sécante. Quelle est la pente de la tangente à la parabole en x = 3 ?",
        "A is at x = 3 and B is very close. The results bar gives the slope of the secant. What is the slope of the tangent to the parabola at x = 3?",
      ],
      hint: ["La sécante est presque la tangente : arrondis la pente de la sécante.", "The secant is almost the tangent: round the slope of the secant."],
      because: ["La pente de la tangente vaut 2x = 6 en x = 3. La sécante donne 6,01 : l’écart est h = 0,01.", "The tangent slope is 2x = 6 at x = 3. The secant gives 6.01: the gap is h = 0.01."],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi la pente de la sécante vaut-elle exactement 2x + h, et pourquoi cela montre-t-il que la limite est 2x ?",
        "Why is the slope of the secant exactly 2x + h, and why does this show that the limit is 2x?",
      ],
      argument: [
        "Pour h ≠ 0 : ((x + h)² − x²)/h = (2xh + h²)/h = 2x + h. L’écart avec 2x est donc exactement h, qui tend vers 0 des deux côtés. Le quotient n’est jamais calculé en h = 0 : la limite décrit ce vers quoi il tend, pas une valeur atteinte.",
        "For h ≠ 0: ((x + h)² − x²)/h = (2xh + h²)/h = 2x + h. The gap to 2x is therefore exactly h, which tends to 0 from both sides. The quotient is never evaluated at h = 0: the limit describes what it approaches, not a value reached.",
      ],
    },
  ],
  conclusion: [
    "Pour tout x fixé et h ≠ 0, ((x + h)² − x²)/h = 2x + h : la pente de la sécante est exactement 2x + h, et son écart avec 2x vaut h, qui tend vers 0. Pour x ↦ |x| en 0, le quotient vaut 1 si h > 0 et −1 si h < 0 : les deux limites diffèrent, il n’y a pas de dérivée en 0. Les pentes affichées sont des mesures arrondies ; l’égalité algébrique ci-dessus, elle, vaut pour tous les x.",
    "For every fixed x and h ≠ 0, ((x + h)² − x²)/h = 2x + h: the slope of the secant is exactly 2x + h, and its gap to 2x is h, which tends to 0. For x ↦ |x| at 0, the quotient is 1 if h > 0 and −1 if h < 0: the two limits differ, so there is no derivative at 0. The displayed slopes are rounded measurements; the algebraic equality above holds for every x.",
  ],
  history: {
    title: ["Newton et Leibniz · XVIIe siècle", "Newton and Leibniz · 17th century"],
    story: [
      "Newton et Leibniz ont développé indépendamment le calcul infinitésimal. Leurs approches reliaient mouvement, tangentes et aires. Les notations de Leibniz restent très utilisées.",
      "Newton and Leibniz independently developed calculus. Their approaches linked motion, tangents and areas. Leibniz’s notation remains widely used.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/HistTopics/The_rise_of_calculus/",
  },
};
