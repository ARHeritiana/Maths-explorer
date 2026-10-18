// Experiment `integral` (template process): rectangles under y = x^2 between a and b. State {a, b, n, method}. The
// handles move the bounds, one slider sets the number of rectangles n, one choice sets left, right or midpoint heights.
// Pure maths: models/integral.js.
import * as I from "../models/integral.js";
import { clamp } from "../models/num.js";

const { model, exact, sum, f } = I;
const cube = (v, num) => (v < 0 ? `(${num(v)})³` : `${num(v)}³`);
const signed = (v, num) => (v > 0 ? "+" : "") + num(v, 4);

export default {
  id: "integral", template: "process",
  symbol: "∫", group: ["Analyse", "Calculus"],
  title: ["Une aire, rectangle par rectangle", "Area, one rectangle at a time"],
  short: ["Intégrales et approximation", "Integrals and approximation"],
  intro: [
    "Approche l’aire sous la parabole y = x² avec des rectangles de plus en plus fins, et compare trois façons de choisir leur hauteur.",
    "Approximate the area under the parabola y = x² with thinner and thinner rectangles, and compare three ways to choose their height.",
  ],
  duration: 8,
  level: ["Terminale", "Advanced"],
  prereq: ["Aire d’un rectangle, fonctions, sommes", "Rectangle area, functions, sums"],
  model: I,
  state: { a: 0, b: 1, n: 4, method: "left" },
  controls: {
    upper: {
      kind: "handle", color: "accent", axis: "x", grid: [0.25, 0], label: ["Borne b", "Bound b"],
      at: (s) => [s.b, 0],
      drag: (s, wx) => ({ b: clamp(wx, s.a + 0.25, 2.5) }),
      valuetext: (s, fm) => `b = ${fm.num(s.b)}`,
    },
    lower: {
      kind: "handle", color: "obj3", axis: "x", grid: [0.25, 0], label: ["Borne a", "Bound a"],
      at: (s) => [s.a, 0],
      drag: (s, wx) => ({ a: clamp(wx, -1, s.b - 0.25) }),
      valuetext: (s, fm) => `a = ${fm.num(s.a)}`,
    },
    n: { kind: "slider", key: "n", min: 1, max: 40, step: 1, label: ["n : nombre de rectangles", "n: number of rectangles"], digits: 0 },
    method: {
      kind: "choice", label: ["Hauteur des rectangles", "Rectangle height"], key: "method",
      options: [
        { value: "left", label: ["À gauche", "Left"] },
        { value: "mid", label: ["Au milieu", "Midpoint"] },
        { value: "right", label: ["À droite", "Right"] },
      ],
    },
  },
  views: {
    panels: ["graph"],
    graph: {
      x: [-1, 3], y: [-1.2, 7], xTicks: [-1, 0, 1, 2, 3], yTicks: [0, 1, 2, 3, 4, 5, 6, 7],
      scene(s) {
        return {
          areas: [{ f, from: s.a, to: s.b, color: "accent", alpha: 0.12 }],
          rects: I.rectangles(s.a, s.b, s.n, s.method).map((r) => ({ ...r, color: "obj2", alpha: 0.32 })),
          curves: [{ f, color: "accent", width: 3 }],
          texts: [
            { at: [s.a, 0], text: "a", dy: 26, anchor: "center", color: "obj3" },
            { at: [s.b, 0], text: "b", dy: 26, anchor: "center", color: "accent" },
          ],
        };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num;
      return `${fmt.fr ? "Aire exacte" : "Exact area"} = (b³ − a³) / 3 = (${cube(s.b, num)} − ${cube(s.a, num)}) / 3 = ${num(m.exact, 4)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num;
      return [
        [[`Somme des ${s.n} rectangles`, `Sum of the ${s.n} rectangles`], num(m.sum, 4)],
        [["Aire exacte", "Exact area"], num(m.exact, 4)],
        [["Erreur (somme − aire)", "Error (sum − area)"], signed(m.error, num)],
      ];
    },
    table: {
      caption: ["Les trois sommes pour plusieurs valeurs de n", "The three sums for several values of n"],
      head: [["n", "n"], ["À gauche", "Left"], ["À droite", "Right"], ["Au milieu", "Midpoint"]],
      data(s, { fmt }) {
        const ns = [2, 4, 8, 16, 32];
        return { rows: ns.map((n) => [String(n), ...["left", "right", "mid"].map((mth) => fmt.num(sum(s.a, s.b, n, mth), 4))]), highlight: ns.indexOf(s.n) };
      },
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { a: 0, b: 1, n: 4, method: "left" }, correct: 0,
      prompt: [
        "Les 4 rectangles ont leur coin supérieur gauche sur la parabole y = x². Leur aire totale est-elle plus petite, égale ou plus grande que l’aire sous la courbe entre 0 et 1 ?",
        "The 4 rectangles have their top-left corner on the parabola y = x². Is their total area smaller than, equal to or larger than the area under the curve between 0 and 1?",
      ],
      choices: [["Plus petite.", "Smaller."], ["Égale.", "Equal."], ["Plus grande.", "Larger."]],
    },
    {
      id: "finer", kind: "explore", set: { a: 0, b: 1, n: 4, method: "left" }, unlock: ["n"],
      prompt: [
        "Augmente le nombre de rectangles n avec le curseur. À partir de quelle valeur de n la somme est-elle à moins de 0,02 de l’aire exacte ?",
        "Increase the number of rectangles n with the slider. From which value of n is the sum within 0.02 of the exact area?",
      ],
      hint: ["Regarde la ligne « Erreur » : elle doit passer sous 0,02 en valeur absolue.", "Watch the “Error” line: its absolute value must drop below 0.02."],
      goal: (s, m) => Math.abs(m.error) < 0.02,
      done: [
        "Dès n = 25. Pour une somme à gauche, l’erreur vaut environ 1/(2n) : elle est divisée par 2 quand on double n.",
        "From n = 25. For a left sum the error is about 1/(2n): it is halved when n is doubled.",
      ],
    },
    {
      id: "heights", kind: "contrast", set: { a: 0, b: 1, n: 6, method: "left" }, unlock: ["n"],
      variants: [
        { label: ["Rectangles à gauche", "Left rectangles"], set: { method: "left" } },
        { label: ["Rectangles à droite", "Right rectangles"], set: { method: "right" } },
      ],
      prompt: [
        "Compare les rectangles à gauche et à droite pour le même n. L’aire exacte vaut 1/3, soit environ 0,333 : où se place-t-elle par rapport aux deux sommes ?",
        "Compare left and right rectangles for the same n. The exact area is 1/3, about 0.333: where does it lie compared with the two sums?",
      ],
      done: [
        "Comme x² est croissante, la somme à gauche est trop petite et la somme à droite trop grande : l’aire exacte est coincée entre les deux. Leur écart vaut (f(b) − f(a)) × (b − a) / n, et il tend vers 0 quand n grandit.",
        "Since x² is increasing, the left sum is too small and the right sum too large: the exact area is squeezed between them. Their gap is (f(b) − f(a)) × (b − a) / n, which tends to 0 as n grows.",
      ],
    },
    {
      id: "bound", kind: "explore", set: { a: 0, b: 1, n: 20, method: "mid" }, unlock: ["upper"],
      prompt: [
        "Avec 20 rectangles pris au milieu, déplace la borne b pour que l’aire sous la courbe, de 0 à b, vaille 8/3 (environ 2,667). Quelle valeur de b convient ?",
        "With 20 midpoint rectangles, move the bound b so that the area under the curve, from 0 to b, equals 8/3 (about 2.667). Which value of b works?",
      ],
      hint: ["L’aire de 0 à b vaut b³/3. Quelle valeur de b a un cube égal à 8 ?", "The area from 0 to b is b³/3. Which value of b has a cube equal to 8?"],
      goal: (s, m) => Math.abs(m.exact - 8 / 3) < 1e-9,
      done: [
        "b = 2 : l’aire de 0 à b vaut b³/3 = 8/3. Elle grandit de plus en plus vite quand b augmente, car la courbe monte.",
        "b = 2: the area from 0 to b is b³/3 = 8/3. It grows faster and faster as b increases, because the curve rises.",
      ],
    },
    {
      id: "area", kind: "check", set: { a: 1, b: 2, n: 40, method: "mid" }, quantity: "exact", answer: 7 / 3, tolerance: 0.01,
      prompt: [
        "Entre a = 1 et b = 2, quelle est l’aire exacte sous y = x² ? Les sommes affichées t’en donnent une valeur proche ; l’aire exacte vaut (b³ − a³)/3. Une fraction est acceptée.",
        "Between a = 1 and b = 2, what is the exact area under y = x²? The displayed sums give a close value; the exact area is (b³ − a³)/3. A fraction is accepted.",
      ],
      hint: ["Calcule 2³ − 1³, puis divise par 3.", "Compute 2³ − 1³, then divide by 3."],
      because: ["(2³ − 1³)/3 = 7/3, soit environ 2,333.", "(2³ − 1³)/3 = 7/3, about 2.333."],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi la somme à gauche est-elle toujours inférieure à l’aire pour x² sur [0 ; 1], et pourquoi l’écart avec l’aire tend-il vers 0 ?",
        "Why is the left sum always below the area for x² on [0, 1], and why does the gap to the area tend to 0?",
      ],
      argument: [
        "Sur chaque petit intervalle, x² est croissante : sa plus petite valeur est à gauche, donc chaque rectangle à gauche est sous la courbe. De même, chaque rectangle à droite dépasse la courbe, d’où Lₙ ≤ aire ≤ Rₙ. La différence Rₙ − Lₙ = (1² − 0²)/n = 1/n tend vers 0 : l’aire est coincée entre deux nombres de plus en plus proches, et elle vaut 1/3.",
        "On each small interval x² is increasing: its smallest value is on the left, so each left rectangle is under the curve. Likewise each right rectangle goes over the curve, hence Lₙ ≤ area ≤ Rₙ. The difference Rₙ − Lₙ = (1² − 0²)/n = 1/n tends to 0: the area is squeezed between two numbers that get closer, and it equals 1/3.",
      ],
    },
  ],
  conclusion: [
    "Sur chaque intervalle, x² est comprise entre ses valeurs aux extrémités. En sommant les aires, Lₙ ≤ I ≤ Rₙ, et Rₙ − Lₙ = 1/n sur [0 ; 1] tend vers 0. Pour x² sur [0 ; 1], Lₙ = 1/3 − 1/(2n) + 1/(6n²) et Mₙ = 1/3 − 1/(12n²). Pour une fonction décroissante, le sens de l’encadrement s’inverse. Les nombres affichés illustrent la convergence ; l’encadrement la démontre.",
    "On each interval x² lies between its endpoint values. Summing areas gives Lₙ ≤ I ≤ Rₙ, and Rₙ − Lₙ = 1/n on [0, 1] tends to 0. For x² on [0, 1], Lₙ = 1/3 − 1/(2n) + 1/(6n²) and Mₙ = 1/3 − 1/(12n²). For a decreasing function the direction of the bounds reverses. The displayed numbers illustrate the convergence; the bounds prove it.",
  ],
  history: {
    title: ["Archimède · IIIe siècle avant notre ère", "Archimedes · 3rd century BCE"],
    story: [
      "Bien avant les intégrales modernes, Archimède utilisait des encadrements géométriques pour calculer des aires, notamment celle d’un segment de parabole.",
      "Long before modern integration, Archimedes used geometric bounds to calculate areas, including the area of a parabolic segment.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Archimedes/",
  },
};
