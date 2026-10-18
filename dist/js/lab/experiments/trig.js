// Experiment `trig` (template family): the unit circle and the graph of sine or cosine share one angle. State {deg, assoc,
// fn}. Handles: P on the circle and its image on the graph. Pure maths: models/trig.js.
import * as T from "../models/trig.js";
import { clamp } from "../models/num.js";

const { model, remarkableAngles } = T;
const PI = Math.PI, GRID = 5;
const wrap = (d) => (d > 360 ? d - 360 : d < 0 ? d + 360 : d);
const fnOf = (s) => (s.fn === "cos" ? Math.cos : Math.sin);
const AXIS_COLOUR = { cos: "obj2", sin: "obj3" };

// Exact value when the angle is remarkable, a decimal otherwise.
function valueText(exact, v, num, i) {
  if (!exact) return `≈ ${num(v, 3)}`;
  const e = exact[i];
  return /√|\//.test(e) ? `${e} ${Math.abs(Math.round(v * 1e3) / 1e3 - v) < 1e-9 ? "=" : "≈"} ${num(v, 3)}` : e;
}
const pair = (fmt, a, b) => (fmt.fr ? `(${a} ; ${b})` : `(${a}, ${b})`);

export default {
  id: "trig", template: "family",
  symbol: "θ", group: ["Géométrie", "Geometry"],
  title: ["Un cercle, deux coordonnées", "One circle, two coordinates"],
  short: ["Cercle trigonométrique", "The unit circle"],
  intro: [
    "Fais tourner le point P : ses coordonnées dessinent le cosinus et le sinus, sur le cercle et sur la courbe à la fois.",
    "Rotate the point P: its coordinates draw cosine and sine, on the circle and on the curve at once.",
  ],
  duration: 8,
  level: ["Première · Terminale", "Intermediate"],
  prereq: ["Angles, coordonnées, théorème de Pythagore", "Angles, coordinates, Pythagoras’ theorem"],
  model: T,
  state: { deg: 45, assoc: "none", fn: "sin" },
  controls: {
    angle: {
      kind: "handle", panel: "circle", color: "accent", absolute: true, label: ["Point P sur le cercle", "Point P on the circle"],
      at: (s) => { const p = T.trigValues(s.deg); return [p.cos, p.sin]; },
      drag: (s, x, y) => ({ deg: wrap(Math.round(((Math.atan2(y, x) * 180) / PI + 360) % 360 / GRID) * GRID) % 360 }),
      nudge: (s, dx, dy) => ({ deg: wrap(s.deg + GRID * (dx || dy)) }),
      valuetext: (s, f) => `${f.num(s.deg)}°`,
    },
    onGraph: {
      kind: "handle", panel: "graph", color: "accent", axis: "x", grid: [(GRID * PI) / 180, 0], label: ["Point de la courbe", "Point of the curve"],
      at: (s) => [(s.deg * PI) / 180, fnOf(s)((s.deg * PI) / 180)],
      drag: (s, x) => ({ deg: clamp(Math.round(((x * 180) / PI) / GRID) * GRID, 0, 360) }),
      valuetext: (s, f) => `${f.num(s.deg)}°`,
    },
    fn: {
      kind: "choice", label: ["Courbe tracée", "Plotted curve"], key: "fn",
      options: [{ value: "sin", label: ["sinus", "sine"] }, { value: "cos", label: ["cosinus", "cosine"] }],
    },
    assoc: {
      kind: "choice", label: ["Point associé Q", "Associated point Q"], key: "assoc",
      options: [
        { value: "none", label: ["aucun", "none"] },
        { value: "supplementary", label: ["π − x", "π − x"] },
        { value: "plusPi", label: ["x + π", "x + π"] },
        { value: "opposite", label: ["−x", "−x"] },
        { value: "complementary", label: ["π/2 − x", "π/2 − x"] },
      ],
    },
  },
  views: {
    panels: ["circle", "graph"],
    circle: {
      x: [-1.4, 1.4], y: [-1.4, 1.4], equal: true, pad: [26, 8, 8, 24], share: 0.42,
      xTicks: [-1, 1], yTicks: [-1, 1],
      scene(s, { fmt }) {
        const m = model(s), p = m.p;
        const marks = remarkableAngles.slice(0, -1).map((d) => ({ at: [Math.cos((d * PI) / 180), Math.sin((d * PI) / 180)], color: "muted", r: 2.5 }));
        const scene = {
          circles: [{ c: [0, 0], r: 1, color: "line", width: 2 }],
          arcs: [{ c: [0, 0], from: 0, to: Math.min(s.deg, 359.9), color: "accent", pixels: 22 }],
          lines: [
            { a: [0, 0], b: [p.cos, p.sin], color: "accent", width: 2.5 },
            { a: [0, 0], b: [p.cos, 0], color: "obj2", width: 5 },
            { a: [p.cos, 0], b: [p.cos, p.sin], color: "obj3", width: 5 },
          ],
          points: [...marks, { at: [p.cos, p.sin], color: "accent", r: 5, label: "P", dx: 10, dy: -10 }],
        };
        if (m.q) {
          scene.lines.push({ a: [0, 0], b: [m.q.cos, m.q.sin], color: "c4", width: 2, dash: [6, 4] });
          scene.points.push({ at: [m.q.cos, m.q.sin], color: "c4", r: 5, label: "Q", dx: 10, dy: -10 });
        }
        return scene;
      },
    },
    graph: {
      x: [0, 2 * PI + 0.2], y: [-1.45, 1.45], pad: [30, 12, 12, 24], zeroLabel: true,
      xTicks: [0, PI / 2, PI, (3 * PI) / 2, 2 * PI], xLabel: (v) => T.radiansLabel((v * 180) / PI), yTicks: [-1, 0, 1],
      scene(s) {
        const f = fnOf(s), rad = (s.deg * PI) / 180, colour = AXIS_COLOUR[s.fn === "cos" ? "cos" : "sin"], y = f(rad);
        return {
          curves: [
            { f, from: 0, to: 2 * PI, color: colour, width: 1.5, dash: [4, 4] },
            { f, from: 0, to: rad, color: colour, width: 3.5, samples: 180 },
          ],
          lines: [{ a: [rad, 0], b: [rad, y], color: colour, dash: [4, 4], width: 1.5 }],
          points: [{ at: [rad, y], color: colour, r: 5 }],
        };
      },
    },
    links(s) {
      const f = fnOf(s), rad = (s.deg * PI) / 180, p = T.trigValues(s.deg);
      // P is joined to the curve point that copies one of its coordinates (same colour as that coordinate's segment).
      return [{ from: { panel: "circle", at: [p.cos, p.sin] }, to: { panel: "graph", at: [rad, f(rad)] }, color: AXIS_COLOUR[s.fn === "cos" ? "cos" : "sin"] }];
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num, p = m.p;
      const coords = (q) => pair(fmt, valueText(q.exact, q.cos, num, 0), valueText(q.exact, q.sin, num, 1));
      if (m.q) {
        const r = m.relation;
        return `Q = P(${r.angle}) = ${pair(fmt, r.cos, r.sin)} = ${coords(m.q)}`;
      }
      return `P = ${pair(fmt, "cos x", "sin x")} = ${coords(p)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, p = m.p;
      return [
        [["Angle x", "Angle x"], `${num(s.deg)}° ${p.radians ? "= " + p.radians : "≈ " + num(m.rad, 3)} rad`],
        [["cos x (abscisse de P)", "cos x (x-coordinate of P)"], valueText(p.exact, p.cos, num, 0)],
        [["sin x (ordonnée de P)", "sin x (y-coordinate of P)"], valueText(p.exact, p.sin, num, 1)],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { deg: 45, assoc: "none", fn: "sin" }, correct: 2,
      prompt: [
        "Le point P est sur le cercle de centre O et de rayon 1, à l’angle x. Quand x = 180°, P est à l’opposé de sa position de départ (1 ; 0). Que vaut alors son abscisse, c’est-à-dire cos 180° ?",
        "The point P is on the circle with centre O and radius 1, at angle x. When x = 180°, P is opposite its starting position (1, 0). What is then its x-coordinate, that is cos 180°?",
      ],
      choices: [["1", "1"], ["0", "0"], ["−1", "−1"]],
    },
    {
      id: "quadrants", kind: "explore", set: { deg: 30, assoc: "none", fn: "sin" }, unlock: ["angle", "onGraph"],
      prompt: [
        "Fais glisser P sur le cercle (ou le point de la courbe) pour trouver la zone où cos x est négatif et sin x positif. Vérifie sur les deux vues.",
        "Drag P on the circle (or the point of the curve) to find the region where cos x is negative and sin x is positive. Check on both views.",
      ],
      hint: ["cos x est l’abscisse de P : négative à gauche de l’axe des ordonnées. sin x est son ordonnée.", "cos x is the x-coordinate of P: negative to the left of the y-axis. sin x is its y-coordinate."],
      goal: (s, m) => m.p.cos < 0 && m.p.sin > 0,
      done: [
        "C’est le deuxième quadrant, entre 90° et 180° : P est à gauche de l’axe des ordonnées et au-dessus de l’axe des abscisses.",
        "This is the second quadrant, between 90° and 180°: P is left of the y-axis and above the x-axis.",
      ],
    },
    {
      id: "exact", kind: "explore", set: { deg: 0, assoc: "none", fn: "cos" }, unlock: ["angle", "fn"],
      prompt: [
        "Place P à 60°. Compare les valeurs exactes de cos 60° et sin 60° avec les longueurs des deux segments colorés, puis regarde la courbe de chaque fonction.",
        "Place P at 60°. Compare the exact values of cos 60° and sin 60° with the lengths of the two coloured segments, then look at the curve of each function.",
      ],
      hint: ["Un triangle équilatéral de côté 1, coupé en deux, donne ces valeurs.", "An equilateral triangle of side 1, cut in two, gives these values."],
      goal: (s) => s.deg === 60,
      done: [
        "cos 60° = 1/2 et sin 60° = √3/2. Aux angles remarquables, les valeurs sont exactes ; ailleurs, la figure ne donne que des valeurs approchées.",
        "cos 60° = 1/2 and sin 60° = √3/2. At remarkable angles the values are exact; elsewhere the figure gives only approximate values.",
      ],
    },
    {
      id: "read", kind: "check", set: { deg: 150, assoc: "none", fn: "sin" }, quantity: "sin", answer: 0.5, tolerance: 0.01,
      prompt: [
        "Sur la courbe du sinus, le point marqué a pour abscisse 5π/6, soit 150°. Lis son ordonnée : combien vaut sin 150° ? Une fraction est acceptée.",
        "On the sine curve, the marked point has x-coordinate 5π/6, that is 150°. Read its y-coordinate: what is sin 150°? A fraction is accepted.",
      ],
      hint: ["Compare avec la hauteur de P sur le cercle : sin x est l’ordonnée de P.", "Compare with the height of P on the circle: sin x is the y-coordinate of P."],
      because: [
        "sin 150° = sin 30° = 1/2 : P est le symétrique de la position à 30° par rapport à l’axe des ordonnées.",
        "sin 150° = sin 30° = 1/2: P is the mirror image of the 30° position in the y-axis.",
      ],
    },
    {
      id: "associated", kind: "contrast", set: { deg: 30, assoc: "supplementary", fn: "sin" }, unlock: ["angle"],
      variants: [
        { label: ["Cas A : Q = P(π − x)", "Case A: Q = P(π − x)"], set: { assoc: "supplementary" } },
        { label: ["Cas B : Q = P(x + π)", "Case B: Q = P(x + π)"], set: { assoc: "plusPi" } },
      ],
      prompt: [
        "Q est le point associé à P. Compare les deux cas, puis fais glisser P : par rapport à P, quelle coordonnée de Q change de signe pour π − x ? Et pour x + π ?",
        "Q is the point associated with P. Compare the two cases, then drag P: compared with P, which coordinate of Q changes sign for π − x? And for x + π?",
      ],
      done: [
        "Pour π − x, seule l’abscisse change de signe (symétrie par rapport à l’axe des ordonnées) : cos(π − x) = −cos x et sin(π − x) = sin x. Pour x + π, les deux changent de signe (demi-tour).",
        "For π − x only the x-coordinate changes sign (reflection in the y-axis): cos(π − x) = −cos x and sin(π − x) = sin x. For x + π both change sign (half-turn).",
      ],
    },
    {
      id: "why", kind: "explain",
      prompt: ["Pourquoi a-t-on cos² x + sin² x = 1 pour tout angle x ?", "Why is cos² x + sin² x = 1 for every angle x?"],
      argument: [
        "P a pour coordonnées (cos x ; sin x) et se trouve sur le cercle de centre O et de rayon 1. Dans le triangle rectangle formé par O, le pied de P sur l’axe des abscisses et P, le théorème de Pythagore donne cos² x + sin² x = OP² = 1. L’argument vaut pour tous les points du cercle, pas seulement pour les angles essayés.",
        "P has coordinates (cos x, sin x) and lies on the circle with centre O and radius 1. In the right triangle formed by O, the foot of P on the x-axis and P, Pythagoras’ theorem gives cos² x + sin² x = OP² = 1. The argument holds for every point of the circle, not only for the angles tried.",
      ],
    },
  ],
  conclusion: [
    "Les valeurs lues sur la figure illustrent que cos² x + sin² x = 1, que les signes dépendent du quadrant et que les angles associés échangent ou opposent les coordonnées. Ce qui le démontre, c’est le cercle de rayon 1 et le théorème de Pythagore, valables pour tout point du cercle. Un angle et son symétrique 360° − x se distinguent par le signe de l’ordonnée.",
    "The values read on the figure illustrate that cos² x + sin² x = 1, that signs depend on the quadrant, and that associated angles swap or reverse the coordinates. What proves it is the unit circle and Pythagoras’ theorem, valid for every point of the circle. An angle and its mirror 360° − x differ by the sign of the y-coordinate.",
  ],
  history: {
    title: ["Des cordes aux sinus", "From chords to sines"],
    story: [
      "Les tables de cordes de Ptolémée permettaient des calculs astronomiques. Les mathématiciens indiens, dont Aryabhata, ont ensuite développé des tables de sinus.",
      "Ptolemy’s chord tables supported astronomical calculations. Indian mathematicians, including Aryabhata, later developed sine tables.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/",
  },
};
