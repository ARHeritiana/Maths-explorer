// Experiment `line` (template figure): a line through two points. State {ax, ay, bx, by}; the handles are A and B. The slope
// is the same quotient for any two points of the line, the reduced equation y = mx + p follows, and AB is a direction vector.
// Why `figure` and not `family`: the learner moves two points of a figure and looks for what stays true (an invariant), where a
// family would make the coefficients themselves the handles. Pure maths: models/line.js.
import * as L from "../models/line.js";
import { clamp } from "../models/num.js";

const { model } = L;
const XMAX = 5.5, YMAX = 5.5;
const wrap = (num, x) => (x < 0 ? `(${num(x)})` : num(x));
// m or p written exactly: an integer, or a fraction in lowest terms
const coef = (num, f) => (f.den === 1 ? num(f.num) : `${num(f.num)}/${f.den}`);
function reduced(m, num) {
  if (m.vertical) return `x = ${num(m.A[0])}`;
  const { slope: a, intercept: b } = m;
  const mx = a.num === 0 ? "" : a.den > 1 ? `(${coef(num, a)})x` : a.num === 1 ? "x" : a.num === -1 ? "−x" : `${num(a.num)}x`;
  if (!mx) return `y = ${coef(num, b)}`;
  return b.num === 0 ? `y = ${mx}` : `y = ${mx} ${b.num < 0 ? "−" : "+"} ${coef(num, { num: Math.abs(b.num), den: b.den })}`;
}
function cartesian([a, b, c], num) {
  const term = (k, v, first) => (k === 0 ? "" : `${first ? (k < 0 ? "−" : "") : ` ${k < 0 ? "−" : "+"} `}${Math.abs(k) === 1 ? "" : num(Math.abs(k))}${v}`);
  const parts = [term(a, "x", true)];
  parts.push(term(b, "y", !parts[0]));
  const head = parts.join("");
  return `${head}${c === 0 ? "" : `${head ? ` ${c < 0 ? "−" : "+"} ` : (c < 0 ? "−" : "")}${num(Math.abs(c))}`} = 0`;
}

export default {
  id: "line", template: "figure",
  symbol: "⟋", group: ["Géométrie", "Geometry"],
  title: ["Une droite, deux points", "A line, two points"],
  short: ["Pente et équation réduite", "Slope and equation of a line"],
  intro: [
    "Deux points définissent une droite. Déplace-les et regarde ce qui reste vrai : le quotient des variations, la pente, l’équation y = mx + p, le vecteur directeur.",
    "Two points define a line. Move them and watch what stays true: the quotient of the changes, the slope, the equation y = mx + p, the direction vector.",
  ],
  duration: 8,
  level: ["Seconde", "Foundation"],
  prereq: ["Coordonnées d’un point, quotient", "Coordinates of a point, quotients"],
  model: L,
  state: { ax: 0, ay: 1, bx: 2, by: 5 },
  controls: {
    A: {
      kind: "handle", color: "accent", grid: 0.5, label: ["Point A", "Point A"],
      at: (s) => [s.ax, s.ay],
      drag: (s, x, y) => ({ ax: clamp(x, -XMAX, XMAX), ay: clamp(y, -YMAX, YMAX) }),
      valuetext: (s, f) => f.pt(s.ax, s.ay),
    },
    B: {
      kind: "handle", color: "obj2", grid: 0.5, label: ["Point B", "Point B"],
      at: (s) => [s.bx, s.by],
      drag: (s, x, y) => ({ bx: clamp(x, -XMAX, XMAX), by: clamp(y, -YMAX, YMAX) }),
      valuetext: (s, f) => f.pt(s.bx, s.by),
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [-6, 6], y: [-5.5, 5.5], equal: true, widen: true, xTicks: [-6, -4, -2, 0, 2, 4, 6], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num, [ax, ay, bx, by] = [s.ax, s.ay, s.bx, s.by];
        if (m.degenerate) return { points: [{ at: [ax, ay], color: "accent", r: 6, label: `A = B ${fmt.pt(ax, ay)}`, dx: 12, dy: -12 }] };
        const right = bx >= ax, up = by >= ay, tone = m.increasing ? "pos" : m.decreasing ? "neg" : "ink";
        return {
          lines: [
            { a: [ax, ay], b: [bx, by], extend: true, color: "accent", width: 3 },
            { a: [ax, ay], b: [bx, by], color: "obj2", width: 3.5, arrow: true },
          ],
          polys: [{ pts: [[ax, ay], [bx, ay], [bx, by]], fill: tone, alpha: m.vertical || m.dy === 0 ? 0 : 0.09, color: "muted", dash: [5, 5], width: 1.5, close: true }],
          points: [
            ...(m.p !== null && Math.abs(m.p) <= YMAX && ax !== 0 && bx !== 0 ? [{ at: [0, m.p], color: "pos", r: 5, hollow: true, label: `p = ${coef(num, m.intercept)}`, dx: 10, dy: -10 }] : []),
            { at: [ax, ay], color: "accent", r: 6, label: `A ${fmt.pt(ax, ay)}`, anchor: right ? "right" : "left", dx: right ? -12 : 12, dy: ay > 4 ? 24 : ay < -4 ? -12 : up ? 22 : -12 },
            { at: [bx, by], color: "obj2", r: 6, label: `B ${fmt.pt(bx, by)}`, anchor: right ? "left" : "right", dx: right ? 12 : -12, dy: by > 4 ? 24 : by < -4 ? -12 : up ? -12 : 22 },
          ],
          texts: [
            ...(m.dx !== 0 ? [{ at: [(ax + bx) / 2, ay], text: fmt.rel("Δx", m.dx), color: "muted", anchor: "center", dy: up ? 20 : -10, size: 15 }] : []),
            ...(m.dy !== 0 ? [{ at: [bx, (ay + by) / 2], text: fmt.rel("Δy", m.dy), color: "muted", anchor: right ? "left" : "right", dx: right ? 10 : -10, dy: 5, size: 15 }] : []),
          ],
        };
      },
      measure(s, { fmt }) {
        const m = model(s);
        if (m.degenerate) return { text: fmt.fr ? "A = B : pas de droite" : "A = B: no line", color: "muted" };
        if (m.vertical) return { text: fmt.fr ? "droite verticale" : "vertical line", color: "ink" };
        return { text: `m = ${fmt.ratio(m.dy, m.dx)}`, color: m.increasing ? "pos" : m.decreasing ? "neg" : "ink" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr;
      if (m.degenerate) return fr ? "A et B sont confondus : il n’y a pas de droite." : "A and B coincide: there is no line.";
      if (m.vertical) return fr ? `Δx = 0 : pas de pente. Droite verticale ${reduced(m, num)}` : `Δx = 0: no slope. Vertical line ${reduced(m, num)}`;
      const exact = fmt.isExact(m.m, 2);
      return `m = Δy/Δx = ${num(m.dy)}/${wrap(num, m.dx)} ${exact ? "=" : "≈"} ${num(m.m)} ; ${reduced(m, num)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr;
      const none = fr ? "aucune (A = B)" : "none (A = B)";
      return [
        [["Vecteur directeur AB", "Direction vector AB"], fmt.pt(m.dx, m.dy)],
        [["Coefficient directeur m", "Slope m"], m.degenerate ? none : m.vertical ? (fr ? "non défini" : "not defined") : fmt.ratio(m.dy, m.dx)],
        [["Ordonnée à l’origine p", "y-intercept p"], m.degenerate ? none : m.vertical ? (fr ? "aucune" : "none") : fmt.ratio(m.dx * s.ay - m.dy * s.ax, m.dx)],
        [["Équation cartésienne", "Cartesian equation"], m.degenerate ? none : cartesian(m.cartesian, num)],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { ax: 0, ay: 1, bx: 2, by: 5 }, correct: 0,
      prompt: [
        "La droite passe par A(0 ; 1) et B(2 ; 5) : quand x augmente de 2, y augmente de 4, donc le quotient Δy/Δx vaut 2. On remplace B par le point C(4 ; 9), qui est sur la même droite. Que devient le quotient de A à C ?",
        "The line passes through A(0, 1) and B(2, 5): when x increases by 2, y increases by 4, so the quotient Δy/Δx is 2. We replace B by the point C(4, 9), which is on the same line. What happens to the quotient from A to C?",
      ],
      choices: [
        ["Il ne change pas : il vaut encore 2.", "It does not change: it is still 2."],
        ["Il double : il vaut 4.", "It doubles: it is 4."],
        ["On ne peut pas le savoir sans tracer la droite.", "You cannot tell without drawing the line."],
      ],
    },
    {
      id: "slope", kind: "explore", set: { ax: 0, ay: 1, bx: 2, by: 5 }, unlock: ["B"],
      prompt: [
        "Le point A reste fixe. Fais glisser B pour que la droite descende de 2 chaque fois que x augmente de 1. Quel est alors le coefficient directeur m, et que fait la droite ?",
        "Point A stays fixed. Drag B so that the line goes down by 2 each time x increases by 1. What is the slope m then, and what does the line do?",
      ],
      hint: [
        "Si B = (1 ; −1), x augmente de 1 et y diminue de 2 par rapport à A(0 ; 1). D’autres positions de B donnent la même droite.",
        "If B = (1, −1), x increases by 1 and y decreases by 2 compared with A(0, 1). Other positions of B give the same line.",
      ],
      goal: (s, m) => m.m === -2,
      done: [
        "m = −2 : la droite descend. Le signe de m dit si la droite monte (m > 0) ou descend (m < 0), et sa valeur dit de combien y varie quand x augmente de 1. Plusieurs positions de B donnent la même droite.",
        "m = −2: the line goes down. The sign of m says whether the line rises (m > 0) or falls (m < 0), and its value says by how much y changes when x increases by 1. Several positions of B give the same line.",
      ],
    },
    {
      id: "intercept", kind: "explore", set: { ax: 0, ay: 1, bx: 2, by: 5 }, unlock: ["A"],
      prompt: [
        "Le point B reste fixe en (2 ; 5). Fais glisser A pour que la droite coupe l’axe des ordonnées en (0 ; 3). Quelle est alors son équation réduite ?",
        "Point B stays fixed at (2, 5). Drag A so that the line cuts the y-axis at (0, 3). What is its slope-intercept equation then?",
      ],
      hint: [
        "La droite doit passer par (0 ; 3) et par B(2 ; 5). Place A sur cette droite : A peut être (0 ; 3) lui-même.",
        "The line must pass through (0, 3) and B(2, 5). Put A on that line: A can be (0, 3) itself.",
      ],
      goal: (s, m) => m.p === 3,
      done: [
        "p = 3 : l’ordonnée à l’origine est l’ordonnée du point de la droite d’abscisse 0. Comme B est fixe, la droite est y = x + 3 : m = 1 et p = 3.",
        "p = 3: the y-intercept is the y-coordinate of the point of the line with x = 0. Since B is fixed, the line is y = x + 3: m = 1 and p = 3.",
      ],
    },
    {
      id: "direction", kind: "contrast", set: { ax: 0, ay: 1, bx: 2, by: 5 },
      variants: [
        { label: ["Cas A : B(2 ; 5)", "Case A: B(2, 5)"], set: { bx: 2, by: 5 } },
        { label: ["Cas B : B(1 ; 3)", "Case B: B(1, 3)"], set: { bx: 1, by: 3 } },
      ],
      prompt: [
        "Compare les cas A et B : A est le même point. Qu’est-ce qui change, et qu’est-ce qui ne change pas ? Regarde le vecteur directeur AB, la droite et son équation.",
        "Compare cases A and B: A is the same point. What changes, and what stays the same? Look at the direction vector AB, the line and its equation.",
      ],
      done: [
        "Les vecteurs directeurs AB = (2 ; 4) et AB = (1 ; 2) sont différents, mais colinéaires : c’est la même droite, avec la même pente 2 et la même équation y = 2x + 1. Un vecteur directeur donne la direction, pas la longueur.",
        "The direction vectors AB = (2, 4) and AB = (1, 2) differ, but are collinear: it is the same line, with the same slope 2 and the same equation y = 2x + 1. A direction vector gives the direction, not the length.",
      ],
    },
    {
      id: "read", kind: "check", set: { ax: -1, ay: 4, bx: 3, by: -2 }, quantity: "intercept", answer: 2.5, tolerance: 0.01,
      prompt: [
        "Lis les coordonnées de A et de B sur la figure. Calcule le coefficient directeur m, puis l’ordonnée à l’origine p de la droite (AB), avec p = yA − m xA. Que vaut p ?",
        "Read the coordinates of A and B on the figure. Compute the slope m, then the y-intercept p of the line (AB), with p = yA − m xA. What is p?",
      ],
      hint: [
        "Ici m = (−2 − 4)/(3 − (−1)) = −6/4 = −1,5. Puis p = 4 − (−1,5) × (−1).",
        "Here m = (−2 − 4)/(3 − (−1)) = −6/4 = −1.5. Then p = 4 − (−1.5) × (−1).",
      ],
      because: [
        "m = −1,5 et p = 4 − (−1,5) × (−1) = 4 − 1,5 = 2,5 : la droite a pour équation y = −1,5x + 2,5, et elle coupe l’axe des ordonnées au point (0 ; 2,5) marqué sur la figure.",
        "m = −1.5 and p = 4 − (−1.5) × (−1) = 4 − 1.5 = 2.5: the line is y = −1.5x + 2.5, and it cuts the y-axis at the point (0, 2.5) marked on the figure.",
      ],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi le quotient Δy/Δx est-il le même pour deux points quelconques de la droite, et pas seulement pour A et B ?",
        "Why is the quotient Δy/Δx the same for any two points of the line, and not only for A and B?",
      ],
      argument: [
        "Soit C un troisième point de la droite (AB). Les triangles rectangles construits sur [AB] et sur [AC], avec un côté horizontal et un côté vertical, ont leurs côtés parallèles deux à deux : ils sont semblables (Thalès). Leurs côtés sont donc proportionnels, et Δy/Δx est le même pour [AB] et pour [AC]. Pour une droite d’équation y = mx + p, on le voit aussi par le calcul : (m x₂ + p − m x₁ − p)/(x₂ − x₁) = m.",
        "Let C be a third point of the line (AB). The right triangles built on [AB] and on [AC], with one horizontal side and one vertical side, have pairwise parallel sides: they are similar (Thales). Their sides are therefore proportional, and Δy/Δx is the same for [AB] and for [AC]. For a line y = mx + p, calculation shows it too: (m x₂ + p − m x₁ − p)/(x₂ − x₁) = m.",
      ],
    },
  ],
  conclusion: [
    "Une droite non verticale passant par A(xA ; yA) et B(xB ; yB) a pour coefficient directeur m = (yB − yA)/(xB − xA), le même pour deux points quelconques de la droite, et pour équation réduite y = mx + p avec p = yA − m xA. Le vecteur AB est un vecteur directeur, tout vecteur colinéaire à AB aussi. Une droite verticale n’a pas de coefficient directeur : son équation est x = xA. Quelques positions illustrent ce résultat ; l’argument des triangles semblables le démontre pour tous les points.",
    "A non-vertical line through A(xA, yA) and B(xB, yB) has slope m = (yB − yA)/(xB − xA), the same for any two points of the line, and slope-intercept equation y = mx + p with p = yA − m xA. The vector AB is a direction vector, and so is any vector collinear to AB. A vertical line has no slope: its equation is x = xA. A few positions illustrate this; the similar-triangles argument proves it for all points.",
  ],
  history: {
    title: ["Descartes · 1637", "Descartes · 1637"],
    story: [
      "Dans La Géométrie (1637), René Descartes relie les courbes à des équations en coordonnées. C’est cette idée qui permet de décrire une droite par une équation comme y = mx + p.",
      "In La Géométrie (1637), René Descartes links curves to equations in coordinates. This idea makes it possible to describe a line by an equation such as y = mx + p.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Descartes/",
  },
};
