// Experiment `buffon` (template figure, no axes): needles dropped on a floor of parallel lines one unit apart. The frequency of
// crossings approaches 2L/π, which gives an estimate of π. State {L, runs, seed}. Pure maths: models/buffon.js.
import * as M from "../models/buffon.js";

const { model, MAX_RUNS, FLOOR } = M;
const newSeed = () => (Math.floor(Math.random() * 2 ** 31) % 1000000) + 1;

export default {
  id: "buffon", template: "figure", section: "geochance", sub: ["L’aiguille de Buffon", "Buffon’s needle"],
  symbol: "π", group: ["Données & hasard", "Data & chance"],
  title: ["Des aiguilles pour calculer π", "Needles to compute π"],
  short: ["Aiguille de Buffon", "Buffon’s needle"],
  intro: [
    "Laisse tomber des aiguilles sur un parquet rayé. La proportion d’aiguilles qui touchent une rayure fait apparaître π.",
    "Drop needles on a striped floor. The proportion of needles touching a stripe brings out π.",
  ],
  duration: 10,
  level: ["Terminale · Supérieur", "Advanced · University"],
  prereq: ["Fréquences, probabilités, intégrale de sin (pour la preuve)", "Frequencies, probability, the integral of sin (for the proof)"],
  model: M,
  state: { L: 1, runs: 0, seed: 4 },
  controls: {
    L: { kind: "slider", key: "L", label: ["Longueur L de l’aiguille (écart d = 1)", "Needle length L (spacing d = 1)"], min: 0.25, max: 1, step: 0.25 },
    run: {
      kind: "action", label: ["Lancer des aiguilles", "Drop needles"],
      options: [
        { value: 10, label: ["+ 10", "+ 10"] }, { value: 100, label: ["+ 100", "+ 100"] }, { value: 1000, label: ["+ 1 000", "+ 1,000"] },
        { value: "new", label: ["Nouvelle série", "New series"] },
      ],
      act: (s, v) => (v === "new" ? { runs: 0, seed: newSeed() } : { runs: Math.min(MAX_RUNS, s.runs + v) }),
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [0, FLOOR[0]], y: [-0.3, FLOOR[1] + 0.3], equal: true, axes: false, pad: [6, 6, 6, 6],
      scene(s) {
        const m = model(s);
        const lines = Array.from({ length: FLOOR[1] + 1 }, (_, j) => ({ a: [0, j], b: [FLOOR[0], j], color: "line", width: 2 }));
        for (const n of m.shown) lines.push({ a: n.a, b: n.b, color: n.hit ? "obj2" : "muted", width: n.hit ? 2.4 : 1.6, alpha: n.hit ? 1 : 0.7 });
        return { lines };
      },
      measure(s, { fmt }) {
        const m = model(s);
        if (!m.runs) return { text: fmt.t(["aucune aiguille", "no needle yet"]), color: "muted" };
        return { text: `${fmt.fr ? "fréquence" : "frequency"} ${fmt.read(m.freq, 3)}${m.piEstimate ? ` · π ≈ ${fmt.num(m.piEstimate, 3)}` : ""}`, color: "obj2" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s);
      return `P = 2L / (π d) = ${fmt.num(2 * s.L)} / π ${fmt.eq(m.prob, 3)} ${fmt.num(m.prob, 3)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), fr = fmt.fr;
      return [
        [["Aiguilles lancées", "Needles dropped"], `${m.runs}`],
        [["Touchent une rayure", "Touch a stripe"], m.runs ? `${m.hits} (${fmt.read(m.freq, 3)})` : fr ? "pas encore" : "not yet"],
        [["Estimation de π = 2L / f", "Estimate of π = 2L / f"], m.piEstimate ? fmt.read(m.piEstimate, 3) : fr ? "pas encore" : "not yet"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { L: 1, runs: 0, seed: 4 }, correct: 1,
      prompt: [
        "Les rayures sont espacées de 1 et les aiguilles mesurent 1. Quelle proportion des aiguilles touchera une rayure ?",
        "The stripes are 1 apart and the needles are 1 long. What proportion of the needles will touch a stripe?",
      ],
      choices: [
        ["Environ la moitié", "About half"],
        ["Un peu moins des deux tiers", "A little under two thirds"],
        ["Environ un tiers", "About a third"],
      ],
    },
    {
      id: "drop", kind: "explore", set: { L: 1, runs: 0, seed: 4 }, unlock: ["run"],
      prompt: [
        "Lance au moins 1 000 aiguilles. Une aiguille orange touche une rayure. Vers quelle valeur la fréquence se stabilise-t-elle ?",
        "Drop at least 1,000 needles. An orange needle touches a stripe. Which value does the frequency settle near?",
      ],
      hint: ["Les boutons s’additionnent ; « Nouvelle série » repart de zéro.", "The buttons add up; “New series” starts again from zero."],
      goal: (s) => s.runs >= 1000,
      done: [
        "La fréquence se stabilise près de 0,64. Or 2/π ≈ 0,637 : c’est la probabilité qu’une aiguille de longueur 1 touche une rayure. L’estimation 2/f approche alors π, lentement.",
        "The frequency settles near 0.64. Now 2/π ≈ 0.637: it is the probability that a needle of length 1 touches a stripe. The estimate 2/f then approaches π, slowly.",
      ],
    },
    {
      id: "half", kind: "contrast", set: { L: 1, runs: 2000, seed: 4 },
      variants: [
        { label: ["Cas A : L = 1", "Case A: L = 1"], set: { L: 1 } },
        { label: ["Cas B : L = 0,5", "Case B: L = 0.5"], set: { L: 0.5 } },
      ],
      prompt: [
        "Les mêmes 2 000 centres et angles, avec des aiguilles deux fois plus courtes. Que devient la fréquence ?",
        "The same 2,000 centres and angles, with needles half as long. What happens to the frequency?",
      ],
      done: [
        "La fréquence est à peu près divisée par 2 : la probabilité est proportionnelle à L (tant que L ≤ d).",
        "The frequency is roughly halved: the probability is proportional to L (as long as L ≤ d).",
      ],
    },
    {
      id: "theory", kind: "check", set: { L: 0.5, runs: 0, seed: 4 }, quantity: "prob", answer: 1 / Math.PI, tolerance: 0.005,
      prompt: [
        "Avec L = 0,5 et d = 1, calcule la probabilité théorique 2L/(π d) (arrondie au millième).",
        "With L = 0.5 and d = 1, compute the theoretical probability 2L/(π d) (to the nearest thousandth).",
      ],
      hint: ["2 × 0,5 = 1 : il reste 1/π.", "2 × 0.5 = 1: what is left is 1/π."],
      because: ["2 × 0,5 / π = 1/π ≈ 0,318.", "2 × 0.5 / π = 1/π ≈ 0.318."],
    },
    {
      id: "why", kind: "explain", set: { L: 1, runs: 2000, seed: 4 },
      prompt: [
        "Pourquoi la probabilité qu’une aiguille touche une rayure vaut-elle 2L/(π d) ?",
        "Why is the probability that a needle touches a stripe equal to 2L/(π d)?",
      ],
      argument: [
        "Notons y la distance du milieu de l’aiguille à la rayure la plus proche et θ l’angle entre l’aiguille et les rayures. y suit la loi uniforme sur [0 ; d/2], θ la loi uniforme sur [0 ; π/2], indépendamment. L’aiguille touche une rayure si et seulement si y ≤ (L/2) sin θ (ici L ≤ d). La probabilité est l’aire de cette région divisée par l’aire du rectangle (d/2)(π/2) : (∫₀^{π/2} (L/2) sin θ dθ) / (π d / 4) = (L/2) / (π d / 4) = 2L/(π d). La simulation n’est qu’une illustration : avec N aiguilles, l’écart typique de la fréquence est de l’ordre de 1/√N, si bien que 1 000 aiguilles ne donnent π qu’à quelques centièmes près.",
        "Let y be the distance from the midpoint of the needle to the nearest stripe and θ the angle between the needle and the stripes. y is uniform on [0, d/2] and θ uniform on [0, π/2], independently. The needle touches a stripe if and only if y ≤ (L/2) sin θ (here L ≤ d). The probability is the area of this region divided by the area of the rectangle (d/2)(π/2): (∫₀^{π/2} (L/2) sin θ dθ) / (π d / 4) = (L/2) / (π d / 4) = 2L/(π d). The simulation is only an illustration: with N needles the typical error of the frequency is of the order of 1/√N, so 1,000 needles give π only to within a few hundredths.",
      ],
    },
  ],
  conclusion: [
    "Une aiguille de longueur L ≤ d touche une rayure avec la probabilité 2L/(π d). Le hasard permet ainsi d’estimer π, mais lentement : la preuve, elle, est un calcul d’intégrale.",
    "A needle of length L ≤ d touches a stripe with probability 2L/(π d). Chance thus gives an estimate of π, but slowly: the proof is an integral calculation.",
  ],
  history: {
    title: ["Buffon · 1777", "Buffon · 1777"],
    story: [
      "Georges-Louis Leclerc, comte de Buffon, posa ce problème en 1733 et publia sa solution en 1777 : l’un des premiers calculs de probabilité géométrique.",
      "Georges-Louis Leclerc, Comte de Buffon, posed this problem in 1733 and published his solution in 1777: one of the first calculations of geometric probability.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Buffon/",
  },
};
