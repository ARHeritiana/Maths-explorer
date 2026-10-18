// Experiment `vectors` (template figure): the determinant as the signed area of the parallelogram built on u and v, and
// collinearity as area 0. State {ux, uy, vx, vy}; the handles are the tips of u and v. Pure maths: models/vectors.js.
import * as V from "../models/vectors.js";
import { clamp } from "../models/num.js";

const { model } = V;
const LIMIT = 4;
// A negative number is put in brackets inside a product: 3 × (−1).
const wrap = (num, x) => (x < 0 ? `(${num(x)})` : num(x));

export default {
  id: "vectors", template: "figure",
  symbol: "↗", group: ["Géométrie", "Geometry"],
  title: ["Deux vecteurs, une aire", "Two vectors, one area"],
  short: ["Déterminant et colinéarité", "Determinant and collinearity"],
  intro: [
    "Deux vecteurs construisent un parallélogramme. Son aire, avec un signe, est le déterminant : elle s’annule exactement quand les vecteurs sont colinéaires.",
    "Two vectors build a parallelogram. Its area, with a sign, is the determinant: it vanishes exactly when the vectors are collinear.",
  ],
  duration: 8,
  level: ["Seconde · Première", "Foundation · Intermediate"],
  prereq: ["Coordonnées d’un vecteur, aire d’un parallélogramme", "Vector coordinates, area of a parallelogram"],
  model: V,
  state: { ux: 3, uy: 1, vx: -1, vy: 3 },
  controls: {
    u: {
      kind: "handle", color: "accent", grid: 0.5, label: ["Extrémité du vecteur u", "Tip of vector u"],
      at: (s) => [s.ux, s.uy],
      drag: (s, x, y) => ({ ux: clamp(x, -LIMIT, LIMIT), uy: clamp(y, -LIMIT, LIMIT) }),
      valuetext: (s, f) => f.pt(s.ux, s.uy),
    },
    v: {
      kind: "handle", color: "obj2", grid: 0.5, label: ["Extrémité du vecteur v", "Tip of vector v"],
      at: (s) => [s.vx, s.vy],
      drag: (s, x, y) => ({ vx: clamp(x, -LIMIT, LIMIT), vy: clamp(y, -LIMIT, LIMIT) }),
      valuetext: (s, f) => f.pt(s.vx, s.vy),
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [-5, 5], y: [-4.5, 4.5], equal: true, widen: true, xTicks: [-4, -2, 0, 2, 4], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num, tone = m.orientation > 0 ? "pos" : m.orientation < 0 ? "neg" : "muted";
        const [sx, sy] = m.sum, flat = m.collinear;
        return {
          polys: [
            { pts: m.polygon, fill: tone, alpha: flat ? 0 : 0.22, color: tone, width: 1.5, dash: [6, 5] },
          ],
          lines: [
            { a: [0, 0], b: [s.ux, s.uy], color: "accent", width: 3.5, arrow: true },
            { a: [0, 0], b: [s.vx, s.vy], color: "obj2", width: 3.5, arrow: true },
            ...(flat && (m.normU > 0 || m.normV > 0) ? [{ a: [-s.ux * 9, -s.uy * 9], b: [s.ux * 9, s.uy * 9], color: "pos", width: 2, dash: [3, 5] }] : []),
          ],
          points: [
            { at: [s.ux, s.uy], color: "accent", r: 5, label: `u = ${fmt.pt(s.ux, s.uy)}`, dx: 14, dy: 22 },
            { at: [s.vx, s.vy], color: "obj2", r: 5, label: `v = ${fmt.pt(s.vx, s.vy)}`, dx: -14, dy: -12, anchor: "right" },
            { at: [sx, sy], color: tone, r: 3.5, hollow: true },
          ],
          texts: flat ? [] : [{ at: [sx / 2, sy / 2], text: fmt.rel(fmt.fr ? "aire" : "area", m.area), color: tone, anchor: "center", size: 17 }],
        };
      },
      measure(s, { fmt }) {
        const m = model(s);
        return { text: fmt.rel("det(u, v)", m.det), color: m.orientation > 0 ? "pos" : m.orientation < 0 ? "neg" : "ink" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num;
      return `det(u, v) = ${num(s.ux)} × ${wrap(num, s.vy)} − ${wrap(num, s.uy)} × ${wrap(num, s.vx)} ${fmt.eq(m.det)} ${num(m.det)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr;
      return [
        [["Déterminant", "Determinant"], fmt.read(m.det)],
        [["Aire du parallélogramme", "Area of the parallelogram"], fmt.read(m.area)],
        [["Sens de (u, v)", "Orientation of (u, v)"], m.orientation > 0 ? (fr ? "direct (aire positive)" : "counterclockwise (positive)") : m.orientation < 0 ? (fr ? "indirect (aire négative)" : "clockwise (negative)") : fr ? "aplati : colinéaires" : "flat: collinear"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { ux: 3, uy: 1, vx: -1, vy: 3 }, correct: 0,
      prompt: [
        "Le parallélogramme construit sur u et v a une aire de 10. On fait glisser v jusqu’à le placer sur la droite qui porte u. Que devient l’aire du parallélogramme ?",
        "The parallelogram built on u and v has area 10. We slide v until it lies on the line carrying u. What happens to the area of the parallelogram?",
      ],
      choices: [
        ["Elle devient nulle.", "It becomes zero."],
        ["Elle reste égale à 10.", "It stays equal to 10."],
        ["Elle diminue un peu mais reste positive.", "It decreases a little but stays positive."],
      ],
    },
    {
      id: "collinear", kind: "explore", set: { ux: 3, uy: 1, vx: -1, vy: 3 }, unlock: ["v"],
      prompt: [
        "Fais glisser l’extrémité de v jusqu’à ce que l’aire soit nulle (avec v non nul). Où se trouve alors v par rapport à u ?",
        "Drag the tip of v until the area is zero (with v non-zero). Where is v then compared with u?",
      ],
      hint: [
        "Le déterminant vaut ux × vy − uy × vx. Pour u = (3 ; 1), il s’annule quand 3 × vy = 1 × vx.",
        "The determinant is ux × vy − uy × vx. For u = (3, 1) it vanishes when 3 × vy = 1 × vx.",
      ],
      goal: (s, m) => m.det === 0 && (s.vx !== 0 || s.vy !== 0),
      done: [
        "L’aire est nulle quand v est sur la droite qui porte u : v = k u pour un nombre k. On dit que u et v sont colinéaires.",
        "The area is zero when v lies on the line carrying u: v = k u for some number k. We say that u and v are collinear.",
      ],
    },
    {
      id: "sign", kind: "contrast", set: { ux: 3, uy: 1, vx: -1, vy: 3 },
      variants: [
        { label: ["Cas A : v = (−1 ; 3)", "Case A: v = (−1, 3)"], set: { vx: -1, vy: 3 } },
        { label: ["Cas B : v = (1 ; −3)", "Case B: v = (1, −3)"], set: { vx: 1, vy: -3 } },
      ],
      prompt: [
        "Compare les cas A et B : les deux parallélogrammes ont la même aire. Qu’est-ce qui change dans le déterminant ? Regarde la couleur et le sens de rotation de u vers v.",
        "Compare cases A and B: the two parallelograms have the same area. What changes in the determinant? Look at the colour and the direction of rotation from u to v.",
      ],
      done: [
        "Les aires sont égales (10) mais les déterminants sont opposés : +10 quand on tourne de u vers v dans le sens direct, −10 dans le sens indirect. Le déterminant est une aire orientée.",
        "The areas are equal (10) but the determinants are opposite: +10 when turning from u to v counterclockwise, −10 clockwise. The determinant is a signed area.",
      ],
    },
    {
      id: "area", kind: "explore", set: { ux: 3, uy: 1, vx: -1, vy: 3 }, unlock: ["u"],
      prompt: [
        "Le vecteur v reste fixe. Fais glisser l’extrémité de u pour que le parallélogramme ait une aire de 6. Quelles positions de u conviennent ?",
        "The vector v stays fixed. Drag the tip of u so that the parallelogram has area 6. Which positions of u work?",
      ],
      hint: [
        "Avec v = (−1 ; 3), det(u, v) = 3 ux + uy. Plusieurs positions donnent 6 : elles sont alignées sur une droite parallèle à v.",
        "With v = (−1, 3), det(u, v) = 3 ux + uy. Several positions give 6: they lie on a line parallel to v.",
      ],
      goal: (s, m) => m.area === 6,
      done: [
        "Plusieurs positions de u donnent l’aire 6 : celles d’une droite parallèle à v. L’aire ne dépend que de la distance de u à la droite qui porte v, pas de sa position le long de cette droite.",
        "Several positions of u give area 6: those on a line parallel to v. The area depends only on the distance from u to the line carrying v, not on where u is along that direction.",
      ],
    },
    {
      id: "read", kind: "check", set: { ux: 2, uy: -1, vx: 1, vy: 3 }, quantity: "det", answer: 7, tolerance: 0.01,
      prompt: [
        "Lis les coordonnées de u et de v sur la figure, puis calcule le déterminant det(u, v) = ux × vy − uy × vx.",
        "Read the coordinates of u and v on the figure, then compute the determinant det(u, v) = ux × vy − uy × vx.",
      ],
      hint: [
        "Ici u = (2 ; −1) et v = (1 ; 3) : 2 × 3 − (−1) × 1.",
        "Here u = (2, −1) and v = (1, 3): 2 × 3 − (−1) × 1.",
      ],
      because: ["2 × 3 − (−1) × 1 = 6 + 1 = 7 : c’est l’aire du parallélogramme, positive car on tourne de u vers v dans le sens direct.", "2 × 3 − (−1) × 1 = 6 + 1 = 7: the area of the parallelogram, positive because the turn from u to v is counterclockwise."],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi le déterminant est-il nul exactement quand u et v sont colinéaires ?",
        "Why is the determinant zero exactly when u and v are collinear?",
      ],
      argument: [
        "Si v = k u, alors det(u, v) = ux (k uy) − uy (k ux) = 0. Réciproquement, supposons det(u, v) = 0 et u ≠ 0. Posons k = (u · v)/‖u‖² et w = v − k u : alors u · w = 0 et det(u, w) = det(u, v) − k det(u, u) = 0. Or det(u, w)² + (u · w)² = ‖u‖² ‖w‖² (identité de Lagrange), donc ‖w‖ = 0, c’est-à-dire v = k u.",
        "If v = k u then det(u, v) = ux (k uy) − uy (k ux) = 0. Conversely, suppose det(u, v) = 0 and u ≠ 0. Let k = (u · v)/‖u‖² and w = v − k u: then u · w = 0 and det(u, w) = det(u, v) − k det(u, u) = 0. But det(u, w)² + (u · w)² = ‖u‖² ‖w‖² (Lagrange identity), so ‖w‖ = 0, that is v = k u.",
      ],
    },
  ],
  conclusion: [
    "Pour u = (ux ; uy) et v = (vx ; vy), l’aire orientée du parallélogramme est det(u, v) = ux vy − uy vx. Elle est nulle si et seulement si u et v sont colinéaires. Quelques figures illustrent ce résultat ; l’argument ci-dessus le démontre pour tous les vecteurs.",
    "For u = (ux, uy) and v = (vx, vy), the signed area of the parallelogram is det(u, v) = ux vy − uy vx. It is zero if and only if u and v are collinear. A few figures illustrate this; the argument above proves it for all vectors.",
  ],
  history: {
    title: ["Grassmann · 1844", "Grassmann · 1844"],
    story: [
      "Hermann Grassmann développa une algèbre des grandeurs géométriques. Ses travaux ont contribué aux idées modernes d’espace vectoriel.",
      "Hermann Grassmann developed an algebra of geometric quantities. His work contributed to modern ideas about vector spaces.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Grassmann/",
  },
};
