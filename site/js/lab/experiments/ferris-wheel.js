// Experiment `ferris-wheel` (template process): an idealised observation wheel. A marked point on the rim of a circle of radius 60 turns
// uniformly once in 30 minutes from its lowest point; the wheel and the height-time graph share one time t and one vertical scale, so a
// horizontal line joins the seat to its point on the curve. State {t, aid}. Pure maths: models/ferris-wheel.js.
// Placement in the International pathway is an indicative suggestion, not a syllabus claim.
import * as F from "../models/ferris-wheel.js";
import { clamp, snap } from "../models/num.js";

const { model, height, seat, TOP, CENTRE, RADIUS, LEVEL, T_MAX } = F;
const STEP = 0.05, NUDGE = 0.25;   // minutes: finest position, one arrow press
const tidy = (t) => Number(t.toFixed(10));
const wrap = (t) => tidy(((t % T_MAX) + T_MAX) % T_MAX);

export default {
  id: "ferris-wheel", template: "process", section: "modelling",
  symbol: "h(t)", group: ["Analyse", "Calculus"],
  title: ["Une roue, une courbe de hauteur", "A wheel and its height curve"],
  short: ["Modèle trigonométrique d’une grande roue", "A trigonometric model of an observation wheel"],
  intro: [
    "Un point marqué fait le tour d’une roue idéalisée en 30 minutes. Fais avancer le temps : la roue et la courbe de la hauteur h(t) se lisent ensemble.",
    "A marked point goes once round an idealised wheel in 30 minutes. Move the time: the wheel and the height curve h(t) are read together.",
  ],
  duration: 12,
  level: ["Intermédiaire", "Intermediate"],
  prereq: ["Cosinus, radians, dérivée d’une fonction composée", "Cosine, radians, derivative of a composite function"],
  model: F,
  state: { t: 0, aid: "none", hide: 0 },
  controls: {
    seat: {
      kind: "handle", panel: "wheel", color: "accent", absolute: true, label: ["Point marqué sur la roue", "Marked point on the wheel"],
      at: (s) => { const p = seat(s.t); return [p.x, p.y]; },
      drag: (s, x, y) => ({ t: wrap(snap(F.timeAt(x, y), STEP)) }),
      nudge: (s, dx, dy) => ({ t: wrap(s.t + NUDGE * (dx || dy)) }),
      valuetext: (s, f) => `t = ${f.num(s.t)} min, h = ${f.read(height(s.t), 1)} m`,
    },
    onGraph: {
      kind: "handle", panel: "graph", color: "accent", axis: "x", grid: [STEP, 0], label: ["Point de la courbe", "Point of the curve"],
      at: (s) => [s.t, height(s.t)],
      drag: (s, x) => ({ t: clamp(tidy(snap(x, STEP)), 0, T_MAX) }),
      nudge: (s, dx, dy) => ({ t: clamp(tidy(snap(s.t + NUDGE * (dx || dy), STEP)), 0, T_MAX) }),
      valuetext: (s, f) => `t = ${f.num(s.t)} min, h = ${f.read(height(s.t), 1)} m`,
    },
    time: {
      kind: "scrubber", min: 0, max: T_MAX, step: STEP, label: ["Temps t (minutes)", "Time t (minutes)"],
      get: (s) => s.t, set: (s, p) => ({ t: tidy(clamp(p, 0, T_MAX)) }),
      format: (p, { fmt }) => `${fmt.num(p, 2)} min`,
      play: { seconds: 30, from: 0, to: T_MAX, step: 2.5 },   // one minute of the model per second; one press = 2,5 min under reduced motion
    },
    aid: {
      kind: "choice", label: ["Repère affiché", "Overlay shown"], key: "aid",
      options: [
        { value: "none", label: ["aucun", "none"] },
        { value: "level", label: ["niveau 120 m", "120 m level"] },
        { value: "tangent", label: ["tangente et vitesse", "tangent and rate"] },
      ],
    },
  },
  views: {
    panels: ["wheel", "graph"],
    row: true,   // side by side at every width: the link from the seat to the curve is a horizontal line
    wheel: {
      x: [-72, 72], y: [0, 142], equal: true, pad: [30, 8, 8, 24], share: 0.42, xTicks: [], yTicks: [0, 15, 30],
      scene(s) {
        const m = model(s), p = m.seat;
        const scene = {
          circles: [{ c: [0, CENTRE], r: RADIUS, color: "line", width: 2.5 }],
          lines: [{ a: [0, CENTRE], b: [p.x, p.y], color: "accent", width: 2 }],
          points: [{ at: [0, CENTRE], color: "muted", r: 3.5 }],
        };
        if (s.aid === "level") {
          const dx = Math.sqrt(RADIUS ** 2 - (LEVEL - CENTRE) ** 2);
          scene.lines.push({ a: [-72, LEVEL], b: [72, LEVEL], color: "obj3", width: 1.8, dash: [7, 5] });
          scene.points.push({ at: [-dx, LEVEL], color: "obj3", r: 4, hollow: true }, { at: [dx, LEVEL], color: "obj3", r: 4, hollow: true });
        }
        if (s.aid === "tangent") {
          // the seat moves along the rim at constant speed 4π m/min (drawn at scale 2); the vertical part of that velocity is h'(t)
          const w = (2 * Math.PI) / F.PERIOD, k = 2, vx = -RADIUS * w * Math.cos(F.angle(s.t)) * k, vy = RADIUS * w * Math.sin(F.angle(s.t)) * k;
          scene.lines.push({ a: [p.x, p.y], b: [p.x + vx, p.y + vy], color: "muted", width: 2, arrow: true });
          scene.lines.push({ a: [p.x, p.y], b: [p.x, p.y + vy], color: "obj3", width: 3.5, arrow: true });
        }
        return scene;
      },
    },
    graph: {
      x: [0, T_MAX], y: [0, 142], alignY: "wheel", pad: [30, 8, 16, 24], zeroLabel: true,
      xTicks: [0, 5, 10], yTicks: [0, 15, 30],
      scene(s, { fmt }) {
        const m = model(s), t = s.t, h = m.h;
        const scene = {
          curves: [
            { f: height, from: 0, to: T_MAX, color: "obj2", width: 1.5, dash: [4, 4] },
            { f: height, from: 0, to: t, color: "obj2", width: 3.5, samples: 180 },
          ],
          lines: [{ a: [t, 0], b: [t, h], color: "obj2", dash: [4, 4], width: 1.5 }],
          points: [{ at: [t, h], color: "accent", r: 5 }],
        };
        if (s.aid === "level") {
          const n = 48, pts = Array.from({ length: n + 1 }, (_, i) => { const x = m.t1 + ((m.t2 - m.t1) * i) / n; return [x, height(x)]; });
          scene.polys = [{ pts: [...pts, [m.t2, LEVEL], [m.t1, LEVEL]], fill: "obj3", alpha: 0.28, width: 0 }];
          scene.lines.push({ a: [0, LEVEL], b: [T_MAX, LEVEL], color: "obj3", width: 1.8, dash: [7, 5] });
          scene.points.push({ at: [m.t1, LEVEL], color: "obj3", r: 4, hollow: true }, { at: [m.t2, LEVEL], color: "obj3", r: 4, hollow: true });
          scene.texts = [{ text: `${fmt.num(LEVEL)} m`, at: [0.4, LEVEL], dy: -7, color: "obj3" }];
        }
        if (s.aid === "tangent") scene.lines.push({ a: [t, h], b: [t + 1, h + m.rate], extend: true, color: "obj3", width: 2.5 });
        return scene;
      },
    },
    links(s) {
      const p = seat(s.t);
      return [{ from: { panel: "wheel", at: [p.x, p.y] }, to: { panel: "graph", at: [s.t, height(s.t)] }, color: "accent" }];
    },
    formula(s, { fmt }) {
      const h = height(s.t);
      const sep = fmt.fr ? " ; " : ", ";
      // `hide` keeps the value asked by the check mission out of sight until the learner has answered
      return s.hide ? `h(t) = 75 − 60 cos(πt/15)${sep}${fmt.t(["h(5) est à calculer", "h(5) is yours to compute"])}` : `h(t) = 75 − 60 cos(πt/15)${sep}h(${fmt.num(s.t)}) ${fmt.eq(h)} ${fmt.num(h)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), side = fmt.t(m.side > 0 ? ["au-dessus de 120 m", "above 120 m"] : m.side < 0 ? ["sous 120 m", "below 120 m"] : ["à 120 m exactement", "exactly 120 m"]);
      return [
        [["Temps écoulé t", "Elapsed time t"], `${fmt.num(s.t)} min`],
        [["Hauteur h(t)", "Height h(t)"], s.hide ? fmt.t(["à calculer", "to compute"]) : `${fmt.read(m.h)} m`],
        [["Vitesse verticale h′(t)", "Vertical rate h′(t)"], `${fmt.read(m.rate)} m/min`],
        [["Par rapport à 120 m", "Against 120 m"], side],
      ];
    },
  },
  missions: [
    {
      id: "fastest", kind: "predict", set: { t: 0, aid: "none", hide: 0 }, correct: 1,
      prompt: [
        "Un point marqué du bord d’une roue part du point le plus bas et tourne à vitesse constante jusqu’au point le plus haut. Sa hauteur augmente tout au long de la montée. Où augmente-t-elle le plus vite ?",
        "A marked point on the rim of a wheel starts at the lowest point and turns at a steady speed up to the highest point. Its height keeps increasing during the climb. Where does it increase fastest?",
      ],
      choices: [
        ["Juste après le départ, près du point le plus bas", "Just after the start, near the lowest point"],
        ["À la hauteur du moyeu (75 m), à mi-montée", "Level with the hub (75 m), halfway up"],
        ["Juste avant d’arriver, près du point le plus haut", "Just before the end, near the highest point"],
      ],
    },
    {
      id: "model", kind: "explore", set: { t: 0, aid: "none", hide: 0 }, unlock: ["seat", "onGraph", "time"],
      prompt: [
        "Modèle idéalisé : le point tourne régulièrement, exactement un tour en 30 minutes, à partir du point le plus bas, sur un cercle de 120 m de diamètre dont le sommet est à 135 m du niveau de référence. Amène le point en haut et lis les deux hauteurs extrêmes. Elles imposent h(t) = a cos(bt) + d : quelles valeurs pour a, b et d ?",
        "Idealised model: the point turns steadily, exactly one revolution in 30 minutes, from the lowest point, on a circle of diameter 120 m whose top is 135 m above the reference level. Take the point to the top and read the two extreme heights. They fix h(t) = a cos(bt) + d: which values for a, b and d?",
      ],
      hint: [
        "La hauteur moyenne est à égale distance du minimum et du maximum. L’amplitude est la moitié de l’écart. La période donne b.",
        "The midline is halfway between the minimum and the maximum. The amplitude is half the gap. The period gives b.",
      ],
      goal: (s, m) => m.h >= TOP - 0.01,
      done: [
        "Minimum 15 m, maximum 135 m : d = (15 + 135)/2 = 75 et |a| = 60. Le point part du minimum, où cos 0 = 1, donc a = −60. Un tour en 30 min donne b = 2π/30 = π/15. Ainsi h(t) = 75 − 60 cos(πt/15), avec h(0) = 15 et h(15) = 135.",
        "Minimum 15 m, maximum 135 m: d = (15 + 135)/2 = 75 and |a| = 60. The point starts at the minimum, where cos 0 = 1, so a = −60. One revolution in 30 min gives b = 2π/30 = π/15. So h(t) = 75 − 60 cos(πt/15), with h(0) = 15 and h(15) = 135.",
      ],
    },
    {
      id: "height", kind: "check", set: { t: 5, aid: "none", hide: 1 }, quantity: "height", answer: 45, tolerance: 0.01,
      prompt: [
        "Avec la formule du modèle, quelle est la hauteur du point au bout de 5 minutes, en mètres ? Compare avec la position du point sur la roue.",
        "With the formula of the model, what is the height of the point after 5 minutes, in metres? Compare with the position of the point on the wheel.",
      ],
      hint: ["5 minutes font un sixième de tour. Calcule cos(5π/15).", "5 minutes is one sixth of a revolution. Compute cos(5π/15)."],
      because: [
        "h(5) = 75 − 60 cos(π/3) = 75 − 60 × 1/2 = 45 m, valeur exacte du modèle.",
        "h(5) = 75 − 60 cos(π/3) = 75 − 60 × 1/2 = 45 m, an exact value of the model.",
      ],
    },
    {
      id: "first", kind: "explore", set: { t: 0, aid: "level", hide: 0 }, unlock: ["onGraph", "time"],
      prompt: [
        "Le trait en pointillés marque 120 m. Avance le temps jusqu’à ce que le point atteigne 120 m pour la première fois, puis calcule cet instant exactement en résolvant 75 − 60 cos(πt/15) = 120.",
        "The dashed line marks 120 m. Move the time until the point first reaches 120 m, then find that moment exactly by solving 75 − 60 cos(πt/15) = 120.",
      ],
      hint: ["Isole le cosinus, puis utilise arccos avec des angles en radians.", "Isolate the cosine, then use arccos with angles in radians."],
      goal: (s, m) => s.t < 15 && Math.abs(m.h - LEVEL) <= 0.5,
      done: [
        "cos(πt/15) = −3/4, donc t₁ = (15/π) arccos(−3/4) ≈ 11,55 min. La roue est symétrique par rapport à t = 15 : la hauteur revient à 120 m en t₂ = 30 − t₁ ≈ 18,45 min.",
        "cos(πt/15) = −3/4, so t₁ = (15/π) arccos(−3/4) ≈ 11.55 min. The wheel is symmetric about t = 15: the height returns to 120 m at t₂ = 30 − t₁ ≈ 18.45 min.",
      ],
    },
    {
      id: "above", kind: "check", set: { t: 11.55, aid: "level", hide: 0 }, quantity: "above", answer: 6.9016, tolerance: 0.005,
      prompt: [
        "Pendant un tour, combien de temps la hauteur reste-t-elle supérieure ou égale à 120 m ? Donne la réponse en minutes, à deux décimales.",
        "During one revolution, for how long is the height at least 120 m? Give the answer in minutes, to two decimal places.",
      ],
      hint: [
        "La zone ombrée est l’ensemble des instants cherchés. Utilise les deux instants où la hauteur vaut 120 m.",
        "The shaded part is the set of times you want. Use the two moments where the height equals 120 m.",
      ],
      because: [
        "t₂ − t₁ = (30 − t₁) − t₁ = 30 − (30/π) arccos(−3/4) ≈ 6,90 min. Les deux instants limites n’ajoutent aucune durée.",
        "t₂ − t₁ = (30 − t₁) − t₁ = 30 − (30/π) arccos(−3/4) ≈ 6.90 min. The two end moments add no duration.",
      ],
    },
    {
      id: "why", kind: "explain", set: { t: 7.5, aid: "tangent", hide: 0 },
      prompt: [
        "Pourquoi la hauteur augmente-t-elle le plus vite à la hauteur du moyeu, et à quelle vitesse ?",
        "Why does the height increase fastest level with the hub, and how fast is that?",
      ],
      argument: [
        "Avec la règle de dérivation d’une composée : h′(t) = −60 × (−π/15) sin(πt/15) = 4π sin(πt/15). Cette quantité est maximale quand sin(πt/15) = 1, soit t = 7,5 min, où h = 75 m : le maximum est 4π ≈ 12,57 m/min, et la valeur opposée est atteinte en t = 22,5 min, en descente. Géométriquement, le point avance sur le cercle à vitesse constante 2π × 60/30 = 4π m/min ; h′(t) est la part verticale de cette vitesse, entière quand la vitesse est verticale, c’est-à-dire à la hauteur du moyeu.",
        "By the chain rule: h′(t) = −60 × (−π/15) sin(πt/15) = 4π sin(πt/15). This is largest when sin(πt/15) = 1, that is t = 7.5 min, where h = 75 m: the maximum is 4π ≈ 12.57 m/min, and the opposite value is reached at t = 22.5 min, on the way down. Geometrically, the point moves along the circle at a constant speed 2π × 60/30 = 4π m/min; h′(t) is the vertical part of that velocity, all of it when the velocity is vertical, that is level with the hub.",
      ],
    },
  ],
  conclusion: [
    "Le modèle h(t) = 75 − 60 cos(πt/15) décrit un point idéal sur un cercle : minimum 15 m, maximum 135 m, un tour en 30 min. Les valeurs lues sur la figure illustrent les calculs ; ce sont l’équation, l’inéquation et la dérivée qui les établissent. Les 15 m, les 75 m, les 30 minutes exactes et le départ au point le plus bas sont des hypothèses de l’exercice, pas des mesures de la grande roue réelle.",
    "The model h(t) = 75 − 60 cos(πt/15) describes an ideal point on a circle: minimum 15 m, maximum 135 m, one revolution in 30 min. Values read on the figure illustrate the calculations; the equation, the inequality and the derivative are what establish them. The 15 m, the 75 m, the exact 30 minutes and the start at the lowest point are assumptions of the exercise, not measurements of the real wheel.",
  ],
  history: {
    title: ["La grande roue de Londres : données et hypothèses", "The London Eye: published data and assumptions"],
    story: [
      "Données publiées par l’exploitant : hauteur totale 135 m, diamètre de la roue 120 m, 32 capsules, environ 30 minutes par tour. Hypothèses de l’exercice, qui ne sont pas des mesures : minimum à 15 m, centre à 75 m, tour de 30 minutes exactement, départ au point le plus bas, point marqué au bord du cercle. Les vraies capsules sont montées à l’extérieur de la jante : le dessin est schématique.",
      "Data published by the operator: overall height 135 m, wheel diameter 120 m, 32 capsules, about 30 minutes per revolution. Assumptions of the exercise, not measurements: minimum at 15 m, centre at 75 m, exactly 30 minutes per turn, start at the lowest point, a marked point on the rim of the circle. The real capsules are mounted outside the rim: the drawing is schematic.",
    ],
    // [VERIFY] the 32 capsules and the 30 minutes come from the operator's FAQ and support pages (not linked here: one link per history box);
    // the external capsule bearings from an architects' project page. None re-checked in this session.
    source: "https://www.londoneye.com/about-us/history/",
  },
};
