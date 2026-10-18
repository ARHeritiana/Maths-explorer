// Experiment `complex` (template transform): multiplication by z as a rotation and a scaling of the whole plane. State
// {r, theta, tx, ty, mode, hide}: z is given by its modulus r and its argument theta (degrees), the test point is t, `mode` is
// "multiply" or "translate" (only the comparison mission uses the second), `hide` keeps one readout out of the check
// mission. The handle z sits in the plane of arrival (z is the image of 1); t sits in the plane of departure. Pure maths:
// models/complex.js.
import * as C from "../models/complex.js";
import { clamp, snap } from "../models/num.js";

const { model, HOUSE } = C;
const RMAX = 3.5, TMAX = 2.5, RANGE = 4.5;
const deg = (r) => (r * 180) / Math.PI;
const turn = (d) => { let t = ((d % 360) + 360) % 360; if (t > 180) t -= 360; return t; };   // ]-180, 180]
const Z_REF = [1.5, 2];   // the check mission: z = 1,5 + 2i

// x + iy written as a person would: 2 + i, −1 − 2i, 3, i
function alg(num, [x, y]) {
  const im = Math.abs(y) === 1 ? "i" : `${num(Math.abs(y))}i`;
  if (y === 0) return num(x);
  if (x === 0) return `${y < 0 ? "−" : ""}${im}`;
  return `${num(x)} ${y < 0 ? "−" : "+"} ${im}`;
}
const paren = (text) => (text.includes(" ") || text.startsWith("−") ? `(${text})` : text);

// The handle of z moves on the polar grid: modulus in steps of 0,25 and argument in steps of 15 degrees.
function polar(s, x, y) {
  const r = clamp(snap(Math.hypot(x, y), 0.25), 0, RMAX);
  return r === 0 ? { r: 0, theta: s.theta } : { r, theta: turn(snap(deg(Math.atan2(y, x)), 15)) };
}
const near = (a, b) => Math.abs(a - b) < 1e-9;

export default {
  id: "complex", template: "transform",
  symbol: "ℂ", group: ["Algèbre", "Algebra"],
  title: ["Les nombres prennent le plan", "Numbers take the plane"],
  short: ["Nombres complexes", "Complex numbers"],
  intro: [
    "Un nombre complexe est un point du plan. Ajouter déplace la figure ; multiplier par z la fait tourner et l’agrandit.",
    "A complex number is a point of the plane. Adding moves the figure; multiplying by z rotates and enlarges it.",
  ],
  duration: 9,
  level: ["Approfondissement", "Extension"],
  prereq: ["Coordonnées, Pythagore, trigonométrie", "Coordinates, Pythagoras, trigonometry"],
  model: C,
  state: { r: 1, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 },
  controls: {
    z: {
      kind: "handle", panel: "after", color: "obj2",
      label: ["Point z, image de 1 (flèches : haut et bas changent le module, gauche et droite l’argument)", "Point z, image of 1 (arrows: up and down change the modulus, left and right the argument)"],
      at: (s) => C.zOf(s),
      drag: (s, x, y) => polar(s, x, y),
      nudge: (s, dx, dy) => ({ r: clamp(snap(s.r + dy * 0.25, 0.25), 0, RMAX), theta: turn(s.theta - dx * 15) }),
      lattice: (s) => near(s.r / 0.25, Math.round(s.r / 0.25)) && near(s.theta / 15, Math.round(s.theta / 15)),
      valuetext: (s, f) => `|z| = ${f.num(s.r)}, arg z = ${f.num(s.theta)}°`,
    },
    t: {
      kind: "handle", panel: "before", color: "obj3", grid: 0.5, label: ["Point d’essai t", "Test point t"],
      at: (s) => [s.tx, s.ty],
      drag: (s, x, y) => ({ tx: clamp(x, -TMAX, TMAX), ty: clamp(y, -TMAX, TMAX) }),
      valuetext: (s, f) => f.pt(s.tx, s.ty),
    },
  },
  views: {
    panels: ["before", "after"],
    before: {
      x: [-RANGE, RANGE], y: [-RANGE, RANGE], equal: true, xTicks: [-4, -2, 0, 2, 4], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const m = model(s);
        return {
          polys: [{ pts: HOUSE, fill: "accent", alpha: 0.18, color: "accent", width: 2 }],
          lines: [{ a: [0, 0], b: m.t, color: "obj3", width: 2.5, arrow: true }],
          points: [
            { at: m.t, color: "obj3", r: 5, label: "t", dx: 8, dy: -9 },
            { at: [1, 0], color: "ink", r: 4.5, hollow: true, label: "1", dx: 6, dy: 18 },
          ],
          texts: [{ at: [-RANGE + 0.15, RANGE - 0.5], text: fmt.t(["Départ : t et la figure", "Before: t and the figure"]), color: "muted", size: 15 }],
        };
      },
    },
    after: {
      x: [-RANGE, RANGE], y: [-RANGE, RANGE], equal: true, xTicks: [-4, -2, 0, 2, 4], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const m = model(s), flat = s.mode === "multiply" && s.r === 0, lines = [];
        if (!flat) for (let k = -8; k <= 8; k++) {
          lines.push({ a: m.f([-9, k]), b: m.f([9, k]), color: "accent", alpha: 0.3, width: 1.2 }, { a: m.f([k, -9]), b: m.f([k, 9]), color: "accent", alpha: 0.3, width: 1.2 });
        }
        const turnable = s.mode === "multiply" && m.argT !== null && m.argZ !== null && Math.abs(m.argZ) > 1e-9 && s.r > 0;
        return {
          lines: [...lines, { a: [0, 0], b: m.z, color: "obj2", width: 2.5, arrow: true }, { a: [0, 0], b: m.w, color: "obj3", width: 2.5, arrow: true }],
          polys: [{ pts: m.house, fill: "accent", alpha: 0.18, color: "accent", width: 2 }],
          arcs: turnable ? [{ c: [0, 0], from: m.argT, to: m.argT + m.argZ, color: "obj2", width: 2.5, pixels: 30 }] : [],
          points: [
            { at: m.z, color: "obj2", r: 5, label: "z", dx: 8, dy: -9 },
            { at: m.w, color: "obj3", r: 5, label: s.mode === "multiply" ? "z × t" : "z + t", dx: 8, dy: 18 },
          ],
          texts: [{ at: [-RANGE + 0.15, RANGE - 0.5], text: fmt.t(s.mode === "multiply" ? ["Arrivée : tout multiplié par z", "After: everything multiplied by z"] : ["Arrivée : tout décalé de z", "After: everything shifted by z"]), color: "muted", size: 15 }],
        };
      },
    },
    links: (s) => { const m = model(s); return [{ from: { panel: "before", at: m.t }, to: { panel: "after", at: m.w }, color: "obj3" }]; },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num, z = alg(num, m.z), t = alg(num, m.t), w = alg(num, m.w);
      return s.mode === "multiply" ? `z × t = ${paren(z)} × ${paren(t)} = ${w}` : `z + t = ${paren(z)} + ${paren(t)} = ${w}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr, undef = fr ? "indéfini" : "not defined", sep = fr ? " ; " : ", ";
      const ma = (mod, arg) => `${fr ? "module" : "modulus"} ${num(mod, 3)}${sep}${fr ? "argument" : "argument"} ${arg === null ? undef : num(arg, 1) + "°"}`;
      const op = s.mode === "multiply" ? "z × t" : "z + t";
      return [
        [["z : module et argument", "z: modulus and argument"], ma(m.modZ, m.argZ)],
        [["t : module et argument", "t: modulus and argument"], ma(m.modT, m.argT)],
        [[`${op} : module et argument`, `${op}: modulus and argument`], s.hide ? (fr ? "à calculer" : "to compute") : ma(m.modW, m.argW)],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { r: 1, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 }, correct: 0,
      prompt: [
        "Ici z = 1 : la figure d’arrivée est identique à celle de départ. On remplace z par i, le point (0 ; 1). Que devient la maison dans le plan d’arrivée ?",
        "Here z = 1: the figure after is identical to the figure before. We replace z by i, the point (0, 1). What happens to the house in the plane of arrival?",
      ],
      choices: [
        ["Elle tourne d’un quart de tour autour de 0, sans changer de taille.", "It turns a quarter turn about 0, without changing size."],
        ["Elle glisse d’une unité vers le haut.", "It slides one unit upward."],
        ["Elle devient deux fois plus grande.", "It becomes twice as large."],
      ],
    },
    {
      id: "scale", kind: "explore", set: { r: 1, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 }, unlock: ["z"],
      prompt: [
        "Fais glisser z (l’image du point 1) jusqu’en 2, sur l’axe horizontal. Que fait la maison ? Et le point t ?",
        "Drag z (the image of the point 1) to 2, on the horizontal axis. What does the house do? And the point t?",
      ],
      hint: [
        "z se déplace par pas de 0,25 pour le module et de 15° pour l’argument. Vise le point (2 ; 0).",
        "z moves in steps of 0.25 for the modulus and 15° for the argument. Aim for the point (2, 0).",
      ],
      goal: (s) => near(s.r, 2) && near(s.theta, 0),
      done: [
        "Multiplier par 2 double toutes les distances à l’origine : la maison est agrandie, sans tourner. Un nombre réel positif z agit comme un agrandissement de rapport z.",
        "Multiplying by 2 doubles every distance from the origin: the house is enlarged without turning. A positive real number z acts as an enlargement of ratio z.",
      ],
    },
    {
      id: "compare", kind: "contrast", set: { r: Math.SQRT2, theta: 45, tx: 1, ty: 2, mode: "multiply", hide: 0 },
      variants: [
        { label: ["Cas A : on ajoute z", "Case A: add z"], set: { mode: "translate" } },
        { label: ["Cas B : on multiplie par z", "Case B: multiply by z"], set: { mode: "multiply" } },
      ],
      prompt: [
        "Ici z = 1 + i. Compare l’addition (cas A : t + z) et la multiplication (cas B : z × t). Laquelle déplace la maison sans la tourner ? Laquelle la tourne et la change de taille ?",
        "Here z = 1 + i. Compare addition (case A: t + z) and multiplication (case B: z × t). Which moves the house without turning it? Which turns it and changes its size?",
      ],
      done: [
        "Ajouter z décale toute la figure du même vecteur, sans la tourner. Multiplier par z la fait tourner de l’argument de z (ici 45°) et multiplie les distances à l’origine par le module de z (ici √2, environ 1,41).",
        "Adding z shifts the whole figure by the same vector, without turning it. Multiplying by z turns it by the argument of z (here 45°) and multiplies the distances from the origin by the modulus of z (here √2, about 1.41).",
      ],
    },
    {
      id: "angles", kind: "explore", set: { r: Math.SQRT2, theta: 45, tx: 2, ty: 0, mode: "multiply", hide: 0 }, unlock: ["t"],
      prompt: [
        "Ici z = 1 + i. Fais glisser t pour que z × t arrive sur l’axe vertical. Quel est l’argument de t quand c’est le cas ?",
        "Here z = 1 + i. Drag t so that z × t lands on the vertical axis. What is the argument of t when this happens?",
      ],
      hint: [
        "Le point z × t est sur l’axe vertical quand son argument vaut 90° (ou −90°). Que faut-il ajouter à l’argument de z, qui vaut 45° ?",
        "The point z × t is on the vertical axis when its argument is 90° (or −90°). What must be added to the argument of z, which is 45°?",
      ],
      goal: (s, m) => m.modT > 0.1 && Math.abs(m.w[0]) < 1e-9,
      done: [
        "z × t est sur l’axe vertical quand arg t + arg z vaut 90° ou −90°. Comme arg z = 45°, il faut arg t = 45° ou −135° : multiplier par z ajoute l’argument de z à celui de t.",
        "z × t is on the vertical axis when arg t + arg z is 90° or −90°. Since arg z = 45°, arg t must be 45° or −135°: multiplying by z adds the argument of z to that of t.",
      ],
    },
    {
      id: "read", kind: "check", set: { r: Math.hypot(...Z_REF), theta: deg(Math.atan2(Z_REF[1], Z_REF[0])), tx: 0, ty: 2, mode: "multiply", hide: 1 }, quantity: "modW", answer: 5, tolerance: 0.01,
      prompt: [
        "Voici z = 1,5 + 2i et t = 2i. Lis sur la figure les coordonnées de z × t dans le plan d’arrivée, puis calcule sa distance à l’origine, c’est-à-dire son module |z × t|.",
        "Here z = 1.5 + 2i and t = 2i. Read the coordinates of z × t in the plane of arrival on the figure, then compute its distance from the origin, that is its modulus |z × t|.",
      ],
      hint: [
        "Le point z × t a pour coordonnées (−4 ; 3). Utilise le théorème de Pythagore.",
        "The point z × t has coordinates (−4, 3). Use the Pythagorean theorem.",
      ],
      because: [
        "z × t = −4 + 3i, donc |z × t| = √(16 + 9) = 5. On retrouve |z| × |t| = 2,5 × 2 = 5.",
        "z × t = −4 + 3i, so |z × t| = √(16 + 9) = 5. This is |z| × |t| = 2.5 × 2 = 5.",
      ],
    },
    {
      id: "why", kind: "explain", set: { r: Math.SQRT2, theta: 45, tx: 1, ty: 2, mode: "multiply", hide: 0 },
      prompt: [
        "Pourquoi multiplier par z multiplie-t-il les distances à l’origine par |z| et ajoute-t-il les arguments ?",
        "Why does multiplying by z multiply the distances from the origin by |z| and add the arguments?",
      ],
      argument: [
        "Écrivons z = r(cos a + i sin a) et t = s(cos b + i sin b). En développant et avec les formules d’addition de cosinus et de sinus, z × t = rs(cos(a + b) + i sin(a + b)). Le module de z × t est donc rs = |z| × |t| et son argument a + b. Chaque point du plan, donc chaque point de la figure, subit la même rotation d’angle a et le même agrandissement de rapport r.",
        "Write z = r(cos a + i sin a) and t = s(cos b + i sin b). Expanding and using the addition formulas for cosine and sine, z × t = rs(cos(a + b) + i sin(a + b)). So the modulus of z × t is rs = |z| × |t| and its argument is a + b. Every point of the plane, hence every point of the figure, undergoes the same rotation by angle a and the same enlargement of ratio r.",
      ],
    },
  ],
  conclusion: [
    "Multiplier par z = r(cos a + i sin a) est la composée de la rotation de centre 0 et d’angle a et de l’agrandissement de rapport r ; ajouter z est la translation de vecteur z. Les figures montrent ce fait sur quelques exemples ; le calcul avec les formules d’addition le démontre pour tous les nombres complexes.",
    "Multiplying by z = r(cos a + i sin a) is the composition of the rotation about 0 by angle a and the enlargement of ratio r; adding z is the translation by the vector z. The figures show this on a few examples; the computation with the addition formulas proves it for all complex numbers.",
  ],
  history: {
    title: ["Bombelli · 1572", "Bombelli · 1572"],
    story: [
      "Dans son ouvrage L’Algebra, Rafael Bombelli a établi des règles de calcul avec des racines carrées de nombres négatifs, contribuant à donner un sens aux nombres complexes.",
      "In L’Algebra, Rafael Bombelli established calculation rules for square roots of negative numbers, helping give meaning to complex numbers.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Bombelli/",
  },
};
