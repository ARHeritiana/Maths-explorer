// Experiment `eratosthenes` (template figure, no axes; issue #32): measure the Earth with two sticks. A section of the Earth
// through two towns, a vertical stick in each, parallel rays of the Sun and the shadows they cast. The learner moves the
// second town and the Sun and sets the distance between the towns; the difference of the shadow angles is the angle at the
// centre, and C = 360 × s / theta. State {phi, sigma, k, unit, hide}; k is the distance in thousands of stadia or km (state values stay small). Pure maths: models/eratosthenes.js.
import * as M from "../models/eratosthenes.js";
import { clamp, snap } from "../models/num.js";

const { model, town, shadowTip, RAD } = M;
const STICK = 0.45, TOP = (a) => { const p = town(a); return [p[0] * (1 + STICK), p[1] * (1 + STICK)]; };
const tidy = (v) => Number(v.toFixed(6));
const UNIT = { stadia: ["stades", "stadia"], km: ["km", "km"] };
// big numbers with the locale's thousands separator (250 000 in French, 250,000 in English)
const big = (fmt, v) => Number(v.toFixed(0)).toLocaleString(fmt.fr ? "fr-FR" : "en-GB");
const deg = (x, y) => (Math.atan2(-x, y) * 180) / Math.PI;   // angle of a point from the top, towards the left

export default {
  id: "eratosthenes", template: "figure", section: "modelling",
  symbol: "C", group: ["Géométrie", "Geometry"],
  title: ["Mesurer la Terre avec deux bâtons", "Measuring the Earth with two sticks"],
  short: ["L’expérience d’Ératosthène", "Eratosthenes’ experiment"],
  intro: [
    "Le même jour à midi, un bâton vertical n’a pas d’ombre à Syène, un autre en a une à Alexandrie. Avec cette différence d’ombre et la distance entre les deux villes, on calcule le tour de la Terre.",
    "On the same day at noon, a vertical stick casts no shadow at Syene, another casts one at Alexandria. From this difference of shadows and the distance between the towns, the Earth’s circumference follows.",
  ],
  duration: 12,
  level: ["Seconde · Première", "Grades 10 to 11"],
  prereq: ["Angles alternes-internes, proportionnalité", "Alternate angles, proportionality"],
  model: M,
  state: { phi: 7.2, sigma: 0, k: 5, unit: "stadia", hide: 0 },
  controls: {
    city: {
      kind: "handle", color: "object", absolute: true, label: ["Alexandrie (position sur la Terre)", "Alexandria (position on the Earth)"],
      at: (s) => town(s.phi),
      drag: (s, x, y) => ({ phi: tidy(clamp(snap(deg(x, y), 0.1), 1, 40)) }),
      nudge: (s, dx, dy) => ({ phi: tidy(clamp(s.phi + 0.1 * (dx || -dy), 1, 40)) }),
      valuetext: (s, f) => f.t([`angle au centre ${f.num(s.phi, 1)}°`, `central angle ${f.num(s.phi, 1)}°`]),
    },
    sun: {
      kind: "handle", color: "c7", absolute: true, label: ["Direction du Soleil", "Direction of the Sun"],
      at: (s) => { const u = town(s.sigma); return [u[0] * 1.8, u[1] * 1.8]; },
      drag: (s, x, y) => ({ sigma: tidy(clamp(snap(deg(x, y), 0.1), -25, 35)) }),
      nudge: (s, dx, dy) => ({ sigma: tidy(clamp(s.sigma + 0.1 * (dx || -dy), -25, 35)) }),
      valuetext: (s, f) => f.t([`Soleil à ${f.num(s.sigma, 1)}° de la verticale de Syène`, `Sun at ${f.num(s.sigma, 1)}° from the vertical at Syene`]),
    },
    dist: { kind: "slider", key: "k", label: ["Distance s entre les deux villes", "Distance s between the towns"], min: 0.1, max: 10, step: 0.1, format: (v, { fmt }) => big(fmt, v * 1000) },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [-1.45, 1.45], y: [-0.15, 2.0], equal: true, axes: false, pad: [6, 6, 6, 6],
      scene(s, { fmt }) {
        const m = model(s), O = [0, 0], up = (a) => town(a), dir = [Math.sin(s.sigma * RAD), -Math.cos(s.sigma * RAD)];
        const scene = { circles: [{ c: O, r: 1, color: "line", width: 2.5 }], lines: [], points: [], arcs: [], texts: [] };
        // rays: parallel, through the top of each stick down to the tip of its shadow; two more in between, fainter
        for (const a of [0, s.phi]) {
          const top = TOP(a), tip = shadowTip(a, s.sigma, STICK);
          scene.lines.push({ a: [top[0] - dir[0] * 1.6, top[1] - dir[1] * 1.6], b: tip, color: "c7", width: 2.4, arrow: true });
          scene.lines.push({ a: up(a), b: top, color: "ink", width: 4 });   // the stick
          if (Math.abs(s.sigma - a) > 0.05) scene.lines.push({ a: up(a), b: tip, color: "muted", width: 7 });   // its shadow
        }
        for (const k of [-0.55, 0.55]) { const c = [Math.cos(s.sigma * RAD) * k, Math.sin(s.sigma * RAD) * k]; scene.lines.push({ a: [c[0] - dir[0] * 1.2, 1.2 + c[1] - dir[1] * 1.2], b: [c[0] + dir[0] * 0.2, 1.2 + c[1] + dir[1] * 0.2], color: "c7", width: 1.2, dash: [6, 6] }); }
        // the angle at the centre, and the same angle between the stick at Alexandria and the ray
        scene.lines.push({ a: O, b: TOP(0), color: "obj2", width: 1.4, dash: [5, 5] }, { a: O, b: TOP(s.phi), color: "obj2", width: 1.4, dash: [5, 5] });
        scene.arcs.push({ c: O, from: 90, to: 90 + s.phi, color: "obj2", pixels: 34 });
        if (m.zA > 0.05) scene.arcs.push({ c: TOP(s.phi), from: 90 + Math.min(s.phi, s.sigma), to: 90 + Math.max(s.phi, s.sigma), color: "c7", pixels: 34 });
        scene.points.push({ at: O, color: "obj2", r: 4 }, { at: up(0), color: "ink", r: 5, label: fmt.t(["Syène", "Syene"]) });
        scene.texts.push({ text: `${fmt.num(s.phi, 1)}°`, at: O, dx: -40, dy: -20, color: "obj2" });
        scene.texts.push({ text: fmt.t(["Soleil", "Sun"]), at: [town(s.sigma)[0] * 1.8, town(s.sigma)[1] * 1.8], dx: 14, dy: 4, color: "c7" });
        scene.texts.push({ text: fmt.t(["Alexandrie", "Alexandria"]), at: up(s.phi), dx: -96, dy: 20, color: "object" });
        return scene;
      },
      measure(s, { fmt }) { const m = model(s); return { text: `θ ${fmt.eq(m.theta, 1)} ${fmt.num(m.theta, 1)}°`, color: "obj2" }; },
    },
    formula(s, { fmt }) {
      const m = model(s), u = fmt.t(UNIT[s.unit]);
      if (s.hide) return `C = 360° × s ÷ θ = 360 × ${big(fmt, s.k * 1000)} ÷ ${fmt.num(m.theta, 1)} ; ${fmt.t(["à calculer", "yours to compute"])}`;
      return `C = 360° × s ÷ θ = 360 × ${big(fmt, s.k * 1000)} ÷ ${fmt.num(m.theta, 1)} ${fmt.eq(m.C, 0)} ${big(fmt, m.C)} ${u}`;
    },
    readout(s, { fmt }) {
      const m = model(s), u = fmt.t(UNIT[s.unit]);
      return [
        [["Ombre à Syène", "Shadow at Syene"], `${fmt.num(m.zS, 1)}°`],
        [["Ombre à Alexandrie", "Shadow at Alexandria"], `${fmt.num(m.zA, 1)}°`],
        [["Angle au centre θ", "Angle at the centre θ"], `${fmt.num(m.theta, 1)}°`],
        [["Distance s", "Distance s"], `${big(fmt, s.k * 1000)} ${u}`],
        [["Tour de la Terre C", "Circumference C"], s.hide ? fmt.t(["à calculer", "to compute"]) : `${fmt.isExact(m.C, 0) ? "" : "≈ "}${big(fmt, m.C)} ${u}`],
      ];
    },
  },
  missions: [
    {
      id: "why", kind: "predict", set: { phi: 7.2, sigma: 0, k: 5, unit: "stadia", hide: 0 }, correct: 1,
      prompt: [
        "Le même jour à midi, le bâton de Syène n’a pas d’ombre et celui d’Alexandrie en a une. Les rayons du Soleil arrivent parallèles. Pourquoi les deux ombres sont-elles différentes ?",
        "On the same day at noon, the stick at Syene casts no shadow and the one at Alexandria does. The Sun’s rays arrive parallel. Why are the two shadows different?",
      ],
      choices: [
        ["Le Soleil est plus près de Syène", "The Sun is closer to Syene"],
        ["Le sol est courbé : les deux bâtons ne pointent pas dans la même direction", "The ground is curved: the two sticks do not point in the same direction"],
        ["Le bâton d’Alexandrie est plus long", "The stick at Alexandria is longer"],
      ],
    },
    {
      id: "shadow", kind: "explore", set: { phi: 15, sigma: 0, k: 5, unit: "stadia", hide: 0 }, unlock: ["city"],
      prompt: [
        "Ératosthène a mesuré à Alexandrie une ombre de 7,2° (un cinquantième de tour) quand le Soleil était à la verticale de Syène. Déplace Alexandrie jusqu’à obtenir cette ombre, puis compare avec l’angle au centre.",
        "Eratosthenes measured a shadow of 7.2° (one fiftieth of a turn) at Alexandria when the Sun was overhead at Syene. Move Alexandria until you get this shadow, then compare with the angle at the centre.",
      ],
      hint: ["Fais glisser le point d’Alexandrie sur le cercle, ou utilise les flèches.", "Drag the Alexandria point along the circle, or use the arrow keys."],
      goal: (s, m) => Math.abs(m.zA - 7.2) < 0.05,
      done: [
        "L’ombre fait 7,2° et l’angle au centre aussi : le rayon qui frappe le bâton d’Alexandrie est parallèle à la droite qui va du centre de la Terre à Syène.",
        "The shadow is 7.2° and so is the angle at the centre: the ray that strikes the stick at Alexandria is parallel to the line from the Earth’s centre to Syene.",
      ],
    },
    {
      id: "circumference", kind: "check", set: { phi: 7.2, sigma: 0, k: 5, unit: "stadia", hide: 1 }, quantity: "circumference", answer: 250000, tolerance: 0.01,
      prompt: [
        "Syène et Alexandrie sont à 5 000 stades l’une de l’autre, et l’angle au centre vaut 7,2°. Combien de stades fait le tour de la Terre ?",
        "Syene and Alexandria are 5,000 stadia apart, and the angle at the centre is 7.2°. How many stadia is the Earth’s circumference?",
      ],
      hint: ["L’arc de 5 000 stades est à tout le tour ce que 7,2° est à 360°.", "The 5,000-stadia arc is to the whole circle what 7.2° is to 360°."],
      because: [
        "7,2° est 1/50 de 360°, donc le tour vaut 50 × 5 000 = 250 000 stades : C = 360 × s ÷ θ.",
        "7.2° is 1/50 of 360°, so the circumference is 50 × 5,000 = 250,000 stadia: C = 360 × s ÷ θ.",
      ],
    },
    {
      id: "sun", kind: "contrast", set: { phi: 7.2, sigma: 0, k: 5, unit: "stadia", hide: 0 }, unlock: ["sun"],
      variants: [
        { label: ["A : Soleil à la verticale de Syène", "A: Sun overhead at Syene"], set: { sigma: 0 } },
        { label: ["B : Soleil plus bas, deux ombres", "B: lower Sun, two shadows"], set: { sigma: -12 } },
      ],
      prompt: [
        "Et si le Soleil n’était à la verticale d’aucune des deux villes ? Compare A et B : les deux ombres changent, mais leur différence ?",
        "What if the Sun were overhead at neither town? Compare A and B: both shadows change, but what about their difference?",
      ],
      hint: ["Lis les deux ombres dans le tableau et soustrais-les.", "Read both shadows in the table and subtract them."],
      done: [
        "En B, les ombres font 12° et 19,2° : leur différence vaut encore 7,2°, l’angle au centre. Il suffit de mesurer les deux ombres le même jour à midi.",
        "In B, the shadows are 12° and 19.2°: their difference is still 7.2°, the angle at the centre. Measuring both shadows on the same day at noon is enough.",
      ],
    },
    {
      id: "km", kind: "check", set: { phi: 7.2, sigma: 0, k: 0.8, unit: "km", hide: 1 }, quantity: "circumference", answer: 40000, tolerance: 0.01,
      prompt: [
        "Aujourd’hui : deux villes sur le même méridien, à 800 km l’une de l’autre, et une différence d’ombre de 7,2° le même jour à midi. Quel tour de la Terre trouve-t-on, en km ?",
        "Today: two towns on the same meridian, 800 km apart, and a difference of shadows of 7.2° on the same day at noon. What circumference do you get, in km?",
      ],
      hint: ["Même proportion qu’à la mission précédente.", "Same proportion as in the earlier mission."],
      because: [
        "C = 360 × 800 ÷ 7,2 = 40 000 km, proche du tour réel d’un méridien (environ 40 008 km).",
        "C = 360 × 800 ÷ 7.2 = 40,000 km, close to the real length of a meridian (about 40,008 km).",
      ],
    },
    {
      id: "proof", kind: "explain", set: { phi: 7.2, sigma: 0, k: 5, unit: "stadia", hide: 0 },
      prompt: ["Pourquoi l’ombre d’Alexandrie mesure-t-elle l’angle au centre ?", "Why does the shadow at Alexandria measure the angle at the centre?"],
      argument: [
        "Le bâton de Syène pointe vers le centre de la Terre, et le Soleil est dans son prolongement : le rayon qui arrive à Syène suit la droite (centre, Syène). Les rayons sont parallèles, donc le rayon qui touche le haut du bâton d’Alexandrie est parallèle à cette droite. Le bâton d’Alexandrie, prolongé, passe aussi par le centre : il coupe ces deux parallèles, et les angles alternes-internes sont égaux. L’angle entre le bâton et le rayon (l’ombre) est donc l’angle au centre θ. L’arc s est proportionnel à θ : s ÷ C = θ ÷ 360°. Hypothèses : la Terre est une sphère, les rayons sont parallèles (le Soleil est très loin), les deux villes sont sur le même méridien et les mesures sont faites le même jour à midi.",
        "The stick at Syene points to the centre of the Earth, and the Sun is straight above it: the ray reaching Syene follows the line (centre, Syene). The rays are parallel, so the ray touching the top of the stick at Alexandria is parallel to that line. The stick at Alexandria, extended, also passes through the centre: it crosses these two parallels, and alternate angles are equal. The angle between the stick and the ray (the shadow) is therefore the angle at the centre θ. The arc s is proportional to θ: s ÷ C = θ ÷ 360°. Assumptions: the Earth is a sphere, the rays are parallel (the Sun is very far away), the two towns are on the same meridian and the measurements are taken on the same day at noon.",
      ],
    },
  ],
  conclusion: [
    "Deux ombres et une distance suffisent : C = 360° × s ÷ θ. Le résultat d’Ératosthène dépend de la longueur du stade, qui n’est pas connue avec certitude ; on ne peut donc pas dire exactement combien de kilomètres il a trouvés. Syène et Alexandrie ne sont d’ailleurs pas tout à fait sur le même méridien.",
    "Two shadows and a distance are enough: C = 360° × s ÷ θ. Eratosthenes’ result depends on the length of the stadion, which is not known for certain; so we cannot say exactly how many kilometres he found. Syene and Alexandria are not quite on the same meridian either.",
  ],
  history: {
    title: ["Ératosthène et le tour de la Terre", "Eratosthenes and the Earth’s circumference"],
    story: [
      "Ératosthène de Cyrène (vers 276 à vers 194 av. J.-C.), bibliothécaire d’Alexandrie, a estimé le tour de la Terre vers 240 av. J.-C. Son texte est perdu : on connaît sa méthode par Cléomède, qui donne un angle d’un cinquantième de cercle et 5 000 stades entre Syène et Alexandrie, soit 250 000 stades. D’autres auteurs anciens donnent 252 000 stades. La valeur du stade utilisé est débattue, et la précision attribuée à Ératosthène dépend de ce choix.",
      "Eratosthenes of Cyrene (about 276 to about 194 BC), librarian of Alexandria, estimated the Earth’s circumference around 240 BC. His text is lost: his method is known from Cleomedes, who gives an angle of one fiftieth of a circle and 5,000 stadia between Syene and Alexandria, so 250,000 stadia. Other ancient authors give 252,000 stadia. The value of the stadion he used is debated, and the accuracy credited to Eratosthenes depends on that choice.",
    ],
    // [VERIFY] dates, Cleomedes as the source and the 252,000 variant follow the American Physical Society note (linked);
    // the stadion debate: Nature 152, 473 (1943). Not re-checked against a primary edition in this session.
    source: "https://www.aps.org/apsnews/2006/06/eratosthenes-measures-earth",
  },
};
