// Experiment `exponential` (template family): the functions x ↦ k × aˣ with k > 0 and a > 0, and the geometric sequence
// uₙ = f(n) they carry. State {k, a}; the handles are the points (0 ; k) and (1 ; k a), the slider sets a. Pure maths:
// models/exponential.js. No logarithm here: no mission needs one (the chapters that link to it do not need ln to read this graph).
import * as E from "../models/exponential.js";
import { clamp } from "../models/num.js";

const { model } = E;
const KMAX = 6, XR = [-3.5, 4.6], YR = [-1, 14];

export default {
  id: "exponential", template: "family",
  symbol: "aˣ", group: ["Analyse", "Calculus"],
  title: ["Multiplier à chaque pas", "Multiply at each step"],
  short: ["Fonctions k × aˣ et suites géométriques", "Functions k × aˣ and geometric sequences"],
  intro: [
    "La fonction x ↦ k × aˣ multiplie par a chaque fois que x augmente de 1. Déplace les deux points et regarde la suite des valeurs en x = 0, 1, 2…",
    "The function x ↦ k × aˣ multiplies by a each time x increases by 1. Move the two points and watch the sequence of values at x = 0, 1, 2…",
  ],
  duration: 8,
  level: ["Première · Terminale", "Intermediate"],
  prereq: ["Puissances, suites géométriques", "Powers, geometric sequences"],
  model: E,
  state: { k: 1, a: 2 },
  controls: {
    start: {
      kind: "handle", color: "accent", axis: "y", grid: [1, 0.5], label: ["Point (0 ; k)", "Point (0, k)"],
      at: (s) => [0, s.k],
      drag: (s, x, y) => ({ k: clamp(y, 0.5, KMAX) }),
      valuetext: (s, f) => `k = ${f.num(s.k)}`,
    },
    unit: {
      kind: "handle", color: "obj2", axis: "y", grid: [1, 0.5], label: ["Point (1 ; k × a)", "Point (1, k × a)"],
      nudge: (s, dx, dy) => ({ a: clamp(s.a + 0.25 * (dx || dy), 0.25, 3) }),
      at: (s) => [1, s.k * s.a],
      drag: (s, x, y) => ({ a: clamp(Math.round(y / s.k / 0.25) * 0.25, 0.25, 3) }),
      valuetext: (s, f) => `a = ${f.num(s.a)}`,
    },
    a: { kind: "slider", min: 0.25, max: 3, step: 0.25, key: "a", label: ["a (le facteur)", "a (the factor)"] },
  },
  views: {
    panels: ["graph"],
    graph: {
      x: XR, y: YR, xTicks: [-3, -2, -1, 0, 1, 2, 3, 4], yTicks: [0, 2, 4, 6, 8, 10, 12, 14],
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num, list = E.terms(s, 5);
        const dots = [-3, -2, -1].map((n) => ({ at: [n, m.f(n)], color: "muted", r: 3.5 }));
        return {
          curves: [{ f: m.f, from: XR[0], to: XR[1], color: "accent", width: 3 }],
          points: [
            ...dots,
            { at: [0, s.k], color: "accent", r: 5, label: fmt.pt(0, s.k), dx: 12, dy: 22 },
            { at: [1, list[1]], color: "obj2", r: 5, label: fmt.pt(1, list[1]), dx: 12, dy: 22 },
            ...[2, 3, 4].map((n) => ({ at: [n, list[n]], color: "accent", r: 4.5 })),
          ],
          texts: [0, 1, 2].map((n) => ({ at: [n + 0.5, m.f(n + 0.5)], text: `× ${num(s.a)}`, color: "obj2", anchor: "center", dy: -16, size: 15 })),
        };
      },
    },
    formula(s, { fmt }) {
      const num = fmt.num;
      return `f(x) = ${s.k === 1 ? "" : `${num(s.k)} × `}${num(s.a)}ˣ`;
    },
    readout(s, { fmt }) {
      const num = fmt.num, fr = fmt.fr;
      return [
        [["k = f(0)", "k = f(0)"], num(s.k)],
        [["a : f(x + 1) = a × f(x)", "a: f(x + 1) = a × f(x)"], num(s.a)],
        [["Sens de variation", "Direction"], s.a > 1 ? (fr ? "croissante (a > 1)" : "increasing (a > 1)") : s.a < 1 ? (fr ? "décroissante (0 < a < 1)" : "decreasing (0 < a < 1)") : fr ? "constante (a = 1)" : "constant (a = 1)"],
      ];
    },
    table: {
      caption: ["La suite uₙ = f(n)", "The sequence uₙ = f(n)"],
      head: [["n", "n"], ["uₙ = k × aⁿ", "uₙ = k × aⁿ"], ["uₙ₊₁ ÷ uₙ", "uₙ₊₁ ÷ uₙ"]],
      data(s, { fmt }) {
        const list = E.terms(s, 5);   // the table stops at n = 4: the check mission asks for u₅
        return { rows: list.map((u, n) => [String(n), fmt.read(u), n < 4 ? fmt.read(s.a) : "·"]), highlight: -1 };
      },
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { k: 1, a: 2 }, correct: 0,
      prompt: [
        "Pour f(x) = 2ˣ, on lit f(0) = 1, f(1) = 2, f(2) = 4. Quand x augmente de 1, que fait f(x), pour n’importe quelle valeur de x (même non entière) ?",
        "For f(x) = 2ˣ we read f(0) = 1, f(1) = 2, f(2) = 4. When x increases by 1, what does f(x) do, for any value of x (even a non-integer)?",
      ],
      choices: [
        ["Elle est multipliée par 2.", "It is multiplied by 2."],
        ["Elle augmente de 2.", "It increases by 2."],
        ["Elle double seulement quand x est un entier.", "It doubles only when x is an integer."],
      ],
    },
    {
      id: "base", kind: "explore", set: { k: 1, a: 2 }, unlock: ["unit", "a"],
      prompt: [
        "Fais glisser le point d’abscisse 1 (ou le curseur a) jusqu’à ce que la courbe descende. Que vaut alors a par rapport à 1 ? Peut-on rendre a négatif ?",
        "Drag the point with x-coordinate 1 (or the slider a) until the curve goes down. How does a compare with 1 then? Can a be made negative?",
      ],
      hint: [
        "Le point (1 ; k × a) est à la hauteur k × a : il est plus bas que (0 ; k) quand a < 1.",
        "The point (1, k × a) is at height k × a: it is lower than (0, k) when a < 1.",
      ],
      goal: (s) => s.a < 1,
      done: [
        "Quand 0 < a < 1, chaque pas multiplie par un nombre plus petit que 1 : la fonction décroît. Quand a > 1, elle croît ; quand a = 1, elle est constante. Ici a reste positif : aˣ n’est pas défini pour tout x si a < 0.",
        "When 0 < a < 1 each step multiplies by a number below 1: the function decreases. When a > 1 it increases; when a = 1 it is constant. Here a stays positive: aˣ is not defined for every x if a < 0.",
      ],
    },
    {
      id: "scale", kind: "explore", set: { k: 1, a: 2 }, unlock: ["start"],
      prompt: [
        "Le facteur a = 2 reste fixé. Fais glisser le point (0 ; k) pour que la courbe passe par le point (2 ; 6). Quelle valeur de k convient, et que devient le rapport entre deux valeurs voisines ?",
        "The factor a = 2 stays fixed. Drag the point (0, k) so that the curve passes through the point (2, 6). Which value of k works, and what happens to the ratio between neighbouring values?",
      ],
      hint: [
        "En x = 2, la fonction vaut k × 2² = 4k. Il faut 4k = 6.",
        "At x = 2 the function equals k × 2² = 4k. We need 4k = 6.",
      ],
      goal: (s) => s.k === 1.5,
      done: [
        "k × 2² = 6 donne k = 1,5. Changer k étire toute la courbe verticalement : toutes les valeurs sont multipliées par k, mais le rapport f(x + 1)/f(x) reste égal à a = 2.",
        "k × 2² = 6 gives k = 1.5. Changing k stretches the whole curve vertically: every value is multiplied by k, but the ratio f(x + 1)/f(x) stays equal to a = 2.",
      ],
    },
    {
      id: "sequence", kind: "check", set: { k: 1.5, a: 2 }, quantity: "u5", answer: 48, tolerance: 0.01,
      prompt: [
        "Les points (n ; f(n)) forment la suite uₙ = f(n). Lis u₀ et u₁ sur la figure ou dans le tableau, déduis la raison, puis calcule u₅ (le tableau s’arrête à n = 4 et la courbe sort du cadre).",
        "The points (n, f(n)) form the sequence uₙ = f(n). Read u₀ and u₁ on the figure or in the table, deduce the ratio, then compute u₅ (the table stops at n = 4 and the curve leaves the frame).",
      ],
      hint: [
        "u₀ = 1,5 et u₁ = 3 : la raison est 3 ÷ 1,5 = 2, donc u₅ = u₀ × 2⁵.",
        "u₀ = 1.5 and u₁ = 3: the ratio is 3 ÷ 1.5 = 2, so u₅ = u₀ × 2⁵.",
      ],
      because: [
        "uₙ = 1,5 × 2ⁿ, donc u₅ = 1,5 × 32 = 48. C’est une suite géométrique de premier terme 1,5 et de raison 2.",
        "uₙ = 1.5 × 2ⁿ, so u₅ = 1.5 × 32 = 48. It is a geometric sequence with first term 1.5 and ratio 2.",
      ],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi le rapport f(x + 1)/f(x) vaut-il a pour tous les x, et que dit-il de la suite uₙ = f(n) ?",
        "Why is the ratio f(x + 1)/f(x) equal to a for every x, and what does it say about the sequence uₙ = f(n)?",
      ],
      argument: [
        "f(x + 1) = k × aˣ⁺¹ = a × (k × aˣ) = a × f(x), pour tout réel x. En particulier uₙ₊₁ = a uₙ : la suite uₙ = f(n) est géométrique de raison a et de premier terme u₀ = k. Réciproquement, une suite géométrique de premier terme u₀ et de raison q > 0 se prolonge en la fonction x ↦ u₀ × qˣ ; si q < 0, ses termes changent de signe et aucune fonction de cette forme ne passe par tous ses points.",
        "f(x + 1) = k × aˣ⁺¹ = a × (k × aˣ) = a × f(x), for every real x. In particular uₙ₊₁ = a uₙ: the sequence uₙ = f(n) is geometric with ratio a and first term u₀ = k. Conversely, a geometric sequence with first term u₀ and ratio q > 0 extends to the function x ↦ u₀ × qˣ; if q < 0 its terms change sign and no function of this form passes through all its points.",
      ],
    },
  ],
  conclusion: [
    "Pour k > 0 et a > 0, la fonction f(x) = k × aˣ vérifie f(x + 1) = a × f(x) pour tout réel x. Elle est croissante si a > 1, décroissante si 0 < a < 1, constante si a = 1, et ne s’annule jamais. La suite uₙ = f(n) est géométrique de premier terme k et de raison a. Quelques courbes illustrent ces faits ; le calcul de f(x + 1)/f(x) les démontre pour tout x.",
    "For k > 0 and a > 0, the function f(x) = k × aˣ satisfies f(x + 1) = a × f(x) for every real x. It is increasing if a > 1, decreasing if 0 < a < 1, constant if a = 1, and never zero. The sequence uₙ = f(n) is geometric with first term k and ratio a. A few curves illustrate these facts; computing f(x + 1)/f(x) proves them for every x.",
  ],
  history: {
    title: ["Napier · 1614", "Napier · 1614"],
    story: [
      "John Napier publia en 1614 ses tables de logarithmes. Elles rapprochent une progression géométrique, où l’on multiplie, d’une progression arithmétique, où l’on ajoute : le lien entre suites géométriques et fonctions exponentielles.",
      "John Napier published his tables of logarithms in 1614. They set a geometric progression, where one multiplies, beside an arithmetic progression, where one adds: the link between geometric sequences and exponential functions.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Napier/",
  },
};
