// Experiment `space-lines` (template space): a line and a plane in space. State {ax, ay, az, ux, uy, uz, d, t, mode, hide}: the line
// passes through A with direction vector u (B = A + u, M(t) = A + t u), the plane is P: x + y + 2z + d = 0 with normal n = (1 ; 1 ; 2).
// `mode` says what the figure shows (0 the line and the plane, 1 the parametric representation alone, 2 the orthogonal projection
// of A on the plane) and `hide` keeps the common point out of the figure for the check mission. Handles are points constrained to the
// floor (the shadow of a point) or to a vertical line; every drag snaps to whole numbers. Pure maths: models/space-lines.js.
import * as S from "../models/space-lines.js";
import { clamp } from "../models/num.js";

const { model, N } = S;
const VIEW = [[-4.8, 4.8], [-4.8, 4.8], [-1.2, 6.8]];
const FLOOR = { o: [0, 0, 0], e1: [1, 0, 0], e2: [0, 1, 0] };
const XY = 4, ZMIN = 1, ZMAX = 5;
const sgn = (v) => (v < 0 ? "−" : "+");
const planeEq = (d, num) => `x + y + 2z${d === 0 ? "" : ` ${sgn(d)} ${num(Math.abs(d))}`} = 0`;
const param = (a, u, num) => (u === 0 ? num(a) : a === 0 ? (u === 1 ? "t" : u === -1 ? "−t" : `${num(u)}t`) : `${num(a)} ${sgn(u)} ${Math.abs(u) === 1 ? "" : num(Math.abs(u))}t`);
const nonzero = (s) => s.ux !== 0 || s.uy !== 0 || s.uz !== 0;
const wrapN = (num, x) => (x < 0 ? `(${num(x)})` : num(x));
const rnd = Math.round;

export default {
  id: "space-lines", template: "space",
  symbol: "⟂", group: ["Géométrie", "Geometry"],
  title: ["Une droite perce un plan", "A line pierces a plane"],
  short: ["Droite et plan de l’espace", "Line and plane in space"],
  intro: [
    "Fais tourner la figure : une droite et un plan de l’espace peuvent se couper en un point, ne pas se couper, ou se confondre en partie. Le vecteur directeur et le vecteur normal décident.",
    "Turn the figure: a line and a plane in space can meet in one point, miss each other, or overlap along the whole line. The direction vector and the normal vector decide.",
  ],
  keys: [
    "Fais tourner la figure en glissant le fond, ou clique dans la figure puis utilise les flèches. Poignées : glisse les points (ils restent au sol ou sur une verticale), ou Tab puis les flèches. Molette : zoom ; 0 : recentrer. N et P : mission suivante, précédente.",
    "Turn the figure by dragging the background, or click in the figure then use the arrow keys. Handles: drag the points (they stay on the floor or on a vertical line), or Tab then the arrow keys. Wheel: zoom; 0: reset the view. N and P: next and previous mission.",
  ],
  duration: 10,
  level: ["Terminale", "Upper secondary"],
  prereq: ["Vecteurs de l’espace, produit scalaire", "Vectors in space, dot product"],
  model: S,
  state: { ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7, t: 0, mode: 0, hide: 0 },
  controls: {
    A: {
      kind: "handle", color: "accent", grid: 1, label: ["Ombre de A au sol (déplace A horizontalement)", "Shadow of A on the floor (moves A horizontally)"],
      at: (s) => [s.ax, s.ay, 0],
      constraint: () => FLOOR,
      drag: (s, p) => ({ ax: clamp(rnd(p[0]), -XY, XY), ay: clamp(rnd(p[1]), -XY, XY) }),
      valuetext: (s, f) => f.pt(s.ax, s.ay, s.az),
    },
    Az: {
      kind: "handle", color: "accent", grid: 1, label: ["Point A (change sa hauteur)", "Point A (changes its height)"],
      at: (s) => [s.ax, s.ay, s.az],
      constraint: (s) => ({ o: [s.ax, s.ay, 0], e1: [0, 0, 1] }),
      drag: (s, p) => ({ az: clamp(rnd(p[2]), ZMIN, ZMAX) }),
      valuetext: (s, f) => `z = ${f.num(s.az)}`,
    },
    tip: {
      kind: "handle", color: "obj3", grid: 1, label: ["Ombre de B = A + u au sol (change u horizontalement)", "Shadow of B = A + u on the floor (changes u horizontally)"],
      at: (s) => [s.ax + s.ux, s.ay + s.uy, 0],
      constraint: () => FLOOR,
      drag: (s, p) => {
        const ux = clamp(rnd(p[0]), -XY, XY) - s.ax, uy = clamp(rnd(p[1]), -XY, XY) - s.ay;
        return ux === 0 && uy === 0 && s.uz === 0 ? null : { ux, uy };
      },
      valuetext: (s, f) => f.pt(s.ux, s.uy, s.uz),
    },
    tipz: {
      kind: "handle", color: "obj3", grid: 1, label: ["Point B = A + u (change la hauteur de B)", "Point B = A + u (changes the height of B)"],
      at: (s) => [s.ax + s.ux, s.ay + s.uy, s.az + s.uz],
      constraint: (s) => ({ o: [s.ax + s.ux, s.ay + s.uy, 0], e1: [0, 0, 1] }),
      drag: (s, p) => {
        const uz = clamp(rnd(p[2]), ZMIN, ZMAX) - s.az;
        return s.ux === 0 && s.uy === 0 && uz === 0 ? null : { uz };
      },
      valuetext: (s, f) => `u = ${f.pt(s.ux, s.uy, s.uz)}`,
    },
    t: { kind: "slider", min: -1, max: 3, step: 0.25, key: "t", label: ["t", "t"] },
  },
  views: {
    panels: ["space"],
    space: {
      box: VIEW, axes: 5,
      scene(s, { fmt }) {
        const m = model(s), pt = fmt.pt, show = s.mode !== 1;
        const [a, b] = [m.A, m.B], drop = (p) => ({ a: p, b: [p[0], p[1], 0], color: "muted", width: 1.4, dash: [4, 4] });
        const segs = [], points = [];
        if (!m.degenerate && m.clip) segs.push({ a: [m.A[0] + m.clip[0] * m.u[0], m.A[1] + m.clip[0] * m.u[1], m.A[2] + m.clip[0] * m.u[2]], b: [m.A[0] + m.clip[1] * m.u[0], m.A[1] + m.clip[1] * m.u[1], m.A[2] + m.clip[1] * m.u[2]], color: "obj2", width: 3 });
        if (!m.degenerate) segs.push({ a, b, color: "obj3", width: 4, arrow: true });
        segs.push(drop(a), drop(b));
        points.push({ at: a, color: "ink", r: 5.5, label: `A ${pt(...a)}`, dx: 12, dy: -10 });
        points.push({ at: b, color: "obj3", r: 5, hollow: true, label: s.mode === 0 ? "B" : undefined, dx: 10, dy: -8 });
        if (s.mode === 1) points.push({ at: m.M, color: "accent", r: 6.5, label: `M(t) ${pt(...m.M)}`, dx: 12, dy: 24 });
        if (s.mode === 0 && !s.hide && m.I) points.push({ at: m.I, color: "pos", r: 6.5, label: `I ${pt(...m.I)}`, dx: 12, dy: 24 });
        if (s.mode === 2) {
          segs.push({ a, b: m.H, color: "neg", width: 3.5 });
          points.push({ at: m.H, color: "pos", r: 6.5, label: "H", dx: 12, dy: 24 });
        }
        return {
          faces: show && m.planePoly ? [{ pts: m.planePoly, color: "accent", alpha: 0.16, occlude: true }] : [],
          segs, points,
        };
      },
      measure(s, { fmt }) {
        const m = model(s);
        if (s.mode === 0) return { text: `n · u = ${fmt.num(m.nu)}`, color: m.nu === 0 ? "pos" : "ink" };
        if (s.mode === 2) return { text: fmt.rel("AH", m.dist), color: m.dist === 0 ? "pos" : "neg" };
        return null;
      },
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num;
      if (s.mode === 1) return `M(t) = ${fmt.pt(s.ax, s.ay, s.az)} + t × ${fmt.pt(s.ux, s.uy, s.uz)}`;
      if (s.mode === 2) return `AH = |n · A + d| / ‖n‖ = |${num(m.sA)}| / √6 ${fmt.eq(m.dist)} ${num(m.dist)}`;
      return `${planeEq(s.d, num)} ; n · u = 1 × ${wrapN(num, s.ux)} + 1 × ${wrapN(num, s.uy)} + 2 × ${wrapN(num, s.uz)} = ${num(m.nu)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr, sep = fr ? " ; " : ", ";
      const plane = [["Plan P", "Plane P"], planeEq(s.d, num)];
      if (s.mode === 1) return [
        [["Point A", "Point A"], fmt.pt(s.ax, s.ay, s.az)],
        [["Vecteur directeur u", "Direction vector u"], fmt.pt(s.ux, s.uy, s.uz)],
        [["Point M(t)", "Point M(t)"], fmt.pt(...m.M)],
        [["Représentation paramétrique", "Parametric representation"], `x = ${param(s.ax, s.ux, num)}${sep}y = ${param(s.ay, s.uy, num)}${sep}z = ${param(s.az, s.uz, num)}`],
      ];
      if (s.mode === 2) return [
        plane,
        [["Point A", "Point A"], fmt.pt(s.ax, s.ay, s.az)],
        [["Projeté orthogonal H", "Orthogonal projection H"], fmt.pt(...m.H)],
        [["Distance AH", "Distance AH"], m.dist === 0 ? (fr ? "0 : A est dans le plan" : "0: A is in the plane") : fmt.read(m.dist)],
      ];
      const common = s.hide ? (fr ? "à déterminer" : "to be found")
        : m.relation === "secant" ? `${fmt.rel("t", m.tStar)}${sep}I = ${fmt.pt(...m.I)}`
        : m.relation === "inside" ? (fr ? "toute la droite" : "the whole line") : fr ? "aucun" : "none";
      return [
        plane,
        [["Vecteurs n et u", "Vectors n and u"], `n = ${fmt.pt(...N)}${sep}u = ${fmt.pt(s.ux, s.uy, s.uz)}`],
        [["Produit scalaire n · u", "Dot product n · u"], num(m.nu)],
        [["Points communs", "Common points"], common],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { mode: 0, hide: 1 }, correct: 0,
      prompt: [
        "Tourne la figure pour bien voir le plan P et la droite. Une droite et un plan de l’espace, en général : combien de points communs peuvent-ils avoir ?",
        "Turn the figure to see the plane P and the line clearly. A line and a plane in space, in general: how many common points can they have?",
      ],
      choices: [
        ["Aucun, un seul, ou une infinité (toute la droite).", "None, one, or infinitely many (the whole line)."],
        ["Toujours exactement un.", "Always exactly one."],
        ["Aucun ou un seul, jamais une infinité.", "None or one, never infinitely many."],
      ],
    },
    {
      id: "param", kind: "explore", set: { mode: 1, t: 0 }, unlock: ["t"],
      prompt: [
        "La droite passe par A(−2 ; −1 ; 0) et a pour vecteur directeur u = (2 ; 1 ; 1) : M(t) = A + t u. Fais varier t jusqu’à ce que M(t) ait pour abscisse 2. Quelles sont alors ses coordonnées ?",
        "The line passes through A(−2, −1, 0) with direction vector u = (2, 1, 1): M(t) = A + t u. Vary t until M(t) has x-coordinate 2. What are its coordinates then?",
      ],
      hint: [
        "L’abscisse de M(t) est −2 + 2t. Elle vaut 2 pour t = 2, et on calcule y et z avec le même t.",
        "The x-coordinate of M(t) is −2 + 2t. It equals 2 for t = 2, and y and z are computed with the same t.",
      ],
      goal: (s) => s.t === 2,
      done: [
        "−2 + 2t = 2 donne t = 2, puis y = −1 + 2 = 1 et z = 0 + 2 = 2 : M(2) = (2 ; 1 ; 2). Un seul réel t donne les trois coordonnées d’un point de la droite.",
        "−2 + 2t = 2 gives t = 2, then y = −1 + 2 = 1 and z = 0 + 2 = 2: M(2) = (2, 1, 2). A single real number t gives the three coordinates of a point of the line.",
      ],
    },
    {
      id: "parallel", kind: "explore", set: { mode: 0, hide: 0, ax: -2, ay: -1, az: 2, ux: 2, uy: 1, uz: 1 }, unlock: ["tip", "tipz"],
      prompt: [
        "Le point A reste fixe. Fais glisser l’ombre de B et la hauteur de B pour que la droite ne perce plus le plan : n · u = 0. Que vaut alors n · u, et combien de points communs reste-t-il ?",
        "Point A stays fixed. Drag the shadow of B and the height of B so that the line no longer pierces the plane: n · u = 0. What is n · u then, and how many common points remain?",
      ],
      hint: [
        "Avec n = (1 ; 1 ; 2) et u = (ux ; uy ; uz), n · u = ux + uy + 2 uz. Essaie uz = −1 : il faut alors ux + uy = 2.",
        "With n = (1, 1, 2) and u = (ux, uy, uz), n · u = ux + uy + 2 uz. Try uz = −1: then ux + uy = 2.",
      ],
      goal: (s, m) => m.nu === 0 && !m.degenerate,
      done: [
        "n · u = 0 : le vecteur directeur est orthogonal à la normale, donc parallèle au plan. Ici A n’est pas dans le plan (n · A + d ≠ 0), il n’y a aucun point commun ; si A était dans le plan, toute la droite y serait.",
        "n · u = 0: the direction vector is orthogonal to the normal, so parallel to the plane. Here A is not in the plane (n · A + d ≠ 0), so there is no common point; if A were in the plane, the whole line would be.",
      ],
    },
    {
      id: "normal", kind: "explore", set: { mode: 2, hide: 0, ax: 2, ay: -1, az: 3, ux: 1, uy: 1, uz: 2, d: -2 }, unlock: ["A", "Az"],
      prompt: [
        "Le plan est x + y + 2z − 2 = 0 et la droite passe par A avec le vecteur normal n comme direction : elle perce le plan en H, le projeté orthogonal de A. Déplace A (son ombre, sa hauteur) jusqu’à ce que la distance AH soit nulle. Que vaut alors n · A + d ?",
        "The plane is x + y + 2z − 2 = 0 and the line passes through A with the normal vector n as direction: it pierces the plane at H, the orthogonal projection of A. Move A (its shadow, its height) until the distance AH is zero. What is n · A + d then?",
      ],
      hint: [
        "A est dans le plan quand ses coordonnées vérifient x + y + 2z − 2 = 0. Par exemple (0 ; 0 ; 1).",
        "A is in the plane when its coordinates satisfy x + y + 2z − 2 = 0. For example (0, 0, 1).",
      ],
      goal: (s, m) => m.dist === 0,
      done: [
        "AH = 0 exactement quand n · A + d = 0 : A est alors dans le plan et H = A. Sinon AH = |n · A + d| / ‖n‖, avec ‖n‖ = √6.",
        "AH = 0 exactly when n · A + d = 0: A is then in the plane and H = A. Otherwise AH = |n · A + d| / ‖n‖, with ‖n‖ = √6.",
      ],
    },
    {
      id: "meet", kind: "check", set: { mode: 0, hide: 1, d: -7 }, quantity: "tStar", answer: 2, tolerance: 0.01,
      prompt: [
        "La droite est M(t) = (−2 + 2t ; −1 + t ; t) et le plan est x + y + 2z − 7 = 0. Remplace x, y, z par leurs expressions en t dans l’équation du plan et résous : pour quelle valeur de t le point M(t) est-il dans le plan ?",
        "The line is M(t) = (−2 + 2t, −1 + t, t) and the plane is x + y + 2z − 7 = 0. Replace x, y, z by their expressions in t in the plane equation and solve: for which value of t is the point M(t) in the plane?",
      ],
      hint: [
        "(−2 + 2t) + (−1 + t) + 2t − 7 = 5t − 10. Il reste à résoudre 5t − 10 = 0.",
        "(−2 + 2t) + (−1 + t) + 2t − 7 = 5t − 10. It remains to solve 5t − 10 = 0.",
      ],
      because: [
        "5t − 10 = 0 donne t = 2, donc le point d’intersection est I = M(2) = (2 ; 1 ; 2). On vérifie : 2 + 1 + 2 × 2 − 7 = 0.",
        "5t − 10 = 0 gives t = 2, so the intersection point is I = M(2) = (2, 1, 2). Check: 2 + 1 + 2 × 2 − 7 = 0.",
      ],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi, quand n · u ≠ 0, la droite et le plan ont-ils exactement un point commun ? Et que se passe-t-il quand n · u = 0 ?",
        "Why, when n · u ≠ 0, do the line and the plane have exactly one common point? And what happens when n · u = 0?",
      ],
      argument: [
        "Un point M(t) = A + t u de la droite est dans le plan quand n · M(t) + d = 0, c’est-à-dire t (n · u) + (n · A + d) = 0. C’est une équation du premier degré en t. Si n · u ≠ 0, elle a une unique solution t = −(n · A + d)/(n · u) : un seul point commun. Si n · u = 0, l’équation devient n · A + d = 0 : elle est soit toujours vraie (la droite est dans le plan), soit jamais vraie (aucun point commun).",
        "A point M(t) = A + t u of the line is in the plane when n · M(t) + d = 0, that is t (n · u) + (n · A + d) = 0. This is a first-degree equation in t. If n · u ≠ 0 it has a single solution t = −(n · A + d)/(n · u): exactly one common point. If n · u = 0 the equation becomes n · A + d = 0: it is either always true (the line lies in the plane) or never true (no common point).",
      ],
    },
  ],
  conclusion: [
    "La droite passant par A de vecteur directeur u est l’ensemble des points A + t u, t réel. Elle rencontre le plan n · X + d = 0 là où t (n · u) + (n · A + d) = 0 : en un seul point si n · u ≠ 0, nulle part si n · u = 0 et n · A + d ≠ 0, partout si n · u = 0 et n · A + d = 0. Quelques positions illustrent ces trois cas ; la résolution de cette équation en t les démontre tous.",
    "The line through A with direction vector u is the set of points A + t u, t real. It meets the plane n · X + d = 0 where t (n · u) + (n · A + d) = 0: at a single point if n · u ≠ 0, nowhere if n · u = 0 and n · A + d ≠ 0, everywhere if n · u = 0 and n · A + d = 0. A few positions illustrate the three cases; solving this equation in t proves them all.",
  ],
  history: {
    title: ["Monge · 1795", "Monge · 1795"],
    story: [
      "Gaspard Monge a développé la géométrie descriptive, qui représente les points, les droites et les plans de l’espace par leurs projections sur des plans, pour résoudre des problèmes d’intersection.",
      "Gaspard Monge developed descriptive geometry, which represents points, lines and planes of space by their projections on planes, in order to solve intersection problems.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Monge/",
  },
};
