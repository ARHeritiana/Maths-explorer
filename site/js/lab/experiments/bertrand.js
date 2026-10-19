// Experiment `bertrand` (template figure, no axes): Bertrand's paradox. "A chord chosen at random" is longer than the side of the
// inscribed equilateral triangle with probability 1/3, 1/2 or 1/4 depending on how it is chosen. State {method, runs, seed}.
// Pure maths: models/bertrand.js.
import * as M from "../models/bertrand.js";

const { model, MAX_RUNS } = M;
const newSeed = () => (Math.floor(Math.random() * 2 ** 31) % 1000000) + 1;
const TRI = [90, 210, 330].map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)]);
const FRAC = { ends: "1/3", radius: "1/2", midpoint: "1/4" };

export default {
  id: "bertrand", template: "figure", section: "geochance", sub: ["Le paradoxe de Bertrand", "Bertrand’s paradox"],
  symbol: "⌀", group: ["Données & hasard", "Data & chance"],
  title: ["Une corde au hasard ?", "A chord at random?"],
  short: ["Paradoxe de Bertrand", "Bertrand’s paradox"],
  intro: [
    "Quelle est la probabilité qu’une corde tirée au hasard soit plus longue que le côté du triangle équilatéral inscrit ? Trois façons de tirer, trois réponses.",
    "What is the probability that a chord drawn at random is longer than the side of the inscribed equilateral triangle? Three ways to draw, three answers.",
  ],
  duration: 10,
  level: ["Première · Terminale", "Intermediate · Advanced"],
  prereq: ["Fréquences, probabilités, aire d’un disque", "Frequencies, probability, area of a disc"],
  stream: { label: ["Dessiner", "Draw continuously"], unit: ["cordes / seconde", "chords / second"] },
  model: M,
  state: { method: "ends", runs: 0, seed: 6 },
  controls: {
    method: {
      kind: "choice", key: "method", label: ["Façon de tirer la corde", "Way of drawing the chord"],
      options: [
        { value: "ends", label: ["Deux extrémités", "Two endpoints"] },
        { value: "radius", label: ["Point d’un rayon", "Point on a radius"] },
        { value: "midpoint", label: ["Milieu dans le disque", "Midpoint in the disc"] },
      ],
    },
    run: {
      kind: "action", label: ["Tirer des cordes", "Draw chords"],
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
      x: [-1.2, 1.2], y: [-1.2, 1.2], equal: true, axes: false, pad: [6, 6, 6, 6],
      scene(s, { progress = null } = {}) {
        const m = model(s);
        const lines = m.shown.map((c) => ({ a: c.a, b: c.b, color: c.hit ? "obj2" : "muted", width: c.hit ? 1.8 : 1.2, alpha: c.hit ? 0.95 : 0.55 }));
        const polys = [{ pts: TRI, fill: "pos", alpha: 0.08, color: "pos", width: 2, dash: [6, 4] }];
        const circles = [{ c: [0, 0], r: 1, color: "ink", width: 2 }];
        if (s.method === "midpoint") circles.push({ c: [0, 0], r: 0.5, color: "pos", width: 1.5, dash: [4, 4] });
        if (progress !== null && s.runs < MAX_RUNS) {
          const next = model({ ...s, runs: s.runs + 1 }).shown.at(-1), p = progress * progress * (3 - 2 * progress);
          lines.push({ a: next.a, b: next.a.map((x, i) => x + p * (next.b[i] - x)), color: "accent", width: 3, alpha: 1 });
        }
        return { circles, polys, lines };
      },
      measure(s, { fmt }) {
        const m = model(s);
        if (!m.runs) return { text: fmt.t(["aucune corde", "no chord yet"]), color: "muted" };
        return { text: `${fmt.fr ? "fréquence" : "frequency"} ${fmt.read(m.freq, 3)}`, color: "obj2" };
      },
    },
    formula(s, { fmt }) {
      return fmt.fr ? `Corde plus longue que le côté √3 du triangle (rayon 1) : orange` : `Chord longer than the side √3 of the triangle (radius 1): orange`;
    },
    readout(s, { fmt }) {
      const m = model(s), fr = fmt.fr;
      return [
        [["Cordes tirées", "Chords drawn"], `${m.runs}`],
        [["Plus longues que √3", "Longer than √3"], m.runs ? `${m.long} (${fmt.read(m.freq, 3)})` : fr ? "pas encore" : "not yet"],
        [["Probabilité pour cette méthode", "Probability for this method"], m.runs >= 1000 ? FRAC[s.method] : fr ? "après 1 000 tirages" : "after 1,000 draws"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { method: "ends", runs: 0, seed: 6 }, correct: 3,
      prompt: [
        "On tire une corde « au hasard » dans un cercle. Quelle est la probabilité qu’elle soit plus longue que le côté du triangle équilatéral inscrit ?",
        "A chord is drawn “at random” in a circle. What is the probability that it is longer than the side of the inscribed equilateral triangle?",
      ],
      choices: [["1/3", "1/3"], ["1/2", "1/2"], ["1/4", "1/4"], ["Cela dépend de la façon de tirer la corde.", "It depends on how the chord is drawn."]],
    },
    {
      id: "ends", kind: "explore", set: { method: "ends", runs: 0, seed: 6 }, unlock: ["run"],
      prompt: [
        "Méthode « deux extrémités » : deux points pris au hasard sur le cercle. Tire au moins 1 000 cordes. Vers quelle valeur va la fréquence des cordes orange ?",
        "Method “two endpoints”: two random points on the circle. Draw at least 1,000 chords. Which value does the frequency of orange chords approach?",
      ],
      hint: ["Fixe une extrémité au sommet du triangle : l’autre doit tomber sur l’arc opposé, un tiers du cercle.", "Fix one endpoint at a vertex of the triangle: the other must fall on the opposite arc, a third of the circle."],
      goal: (s) => s.runs >= 1000,
      done: [
        "La fréquence approche 1/3 : la corde est plus longue quand la seconde extrémité tombe sur l’arc opposé à la première, qui mesure un tiers du cercle.",
        "The frequency approaches 1/3: the chord is longer when the second endpoint falls on the arc opposite the first, which is a third of the circle.",
      ],
    },
    {
      id: "methods", kind: "contrast", set: { method: "radius", runs: 2000, seed: 6 },
      variants: [
        { label: ["Cas A : point d’un rayon", "Case A: point on a radius"], set: { method: "radius" } },
        { label: ["Cas B : milieu dans le disque", "Case B: midpoint in the disc"], set: { method: "midpoint" } },
      ],
      prompt: [
        "Deux autres façons « naturelles » de tirer une corde, 2 000 tirages chacune. Compare les fréquences et l’aspect des cordes.",
        "Two other “natural” ways of drawing a chord, 2,000 draws each. Compare the frequencies and the look of the chords.",
      ],
      done: [
        "Le cas A donne environ 1/2, le cas B environ 1/4. Les cordes ne sont pas réparties de la même façon : le cas B produit beaucoup de cordes courtes près du bord.",
        "Case A gives about 1/2, case B about 1/4. The chords are not spread in the same way: case B produces many short chords near the edge.",
      ],
    },
    {
      id: "midpoint", kind: "check", set: { method: "midpoint", runs: 0, seed: 6 }, quantity: "prob", answer: 0.25, tolerance: 0.001,
      prompt: [
        "Une corde est plus longue que √3 exactement quand son milieu est à moins de 1/2 du centre. Si le milieu est un point au hasard du disque de rayon 1, quelle est la probabilité ? (Écris un nombre décimal.)",
        "A chord is longer than √3 exactly when its midpoint is within 1/2 of the centre. If the midpoint is a random point of the disc of radius 1, what is the probability? (Write a decimal number.)",
      ],
      hint: ["Rapport des aires : π (1/2)² sur π × 1².", "Ratio of the areas: π (1/2)² over π × 1²."],
      because: ["π (1/2)² / π = 1/4 = 0,25.", "π (1/2)² / π = 1/4 = 0.25."],
    },
    {
      id: "why", kind: "explain", set: { method: "ends", runs: 2000, seed: 6 },
      prompt: [
        "Pourquoi trois réponses différentes à la même question ? Laquelle est la bonne ?",
        "Why three different answers to the same question? Which one is right?",
      ],
      argument: [
        "Une corde est déterminée par son milieu, à distance r du centre ; elle est plus longue que √3 si et seulement si r < 1/2. Méthode du rayon : r suit la loi uniforme sur [0 ; 1], donc P = 1/2. Méthode du milieu : le milieu est uniforme dans le disque, P(r < 1/2) = (1/2)² = 1/4. Méthode des extrémités : une extrémité fixée, l’autre uniforme sur le cercle, la corde est plus longue si elle tombe sur un arc de 120°, donc P = 1/3. Les trois calculs sont justes : ils portent sur trois expériences aléatoires différentes. « Au hasard » n’a de sens qu’une fois la loi précisée. C’est la leçon de Bertrand : une probabilité se calcule pour un modèle, pas pour une phrase.",
        "A chord is determined by its midpoint, at distance r from the centre; it is longer than √3 if and only if r < 1/2. Radius method: r is uniform on [0, 1], so P = 1/2. Midpoint method: the midpoint is uniform in the disc, P(r < 1/2) = (1/2)² = 1/4. Endpoint method: with one endpoint fixed and the other uniform on the circle, the chord is longer when it lands on an arc of 120°, so P = 1/3. All three calculations are correct: they are about three different random experiments. “At random” means something only once the law is specified. That is Bertrand’s lesson: a probability is computed for a model, not for a sentence.",
      ],
    },
  ],
  conclusion: [
    "La probabilité d’un événement dépend de l’expérience aléatoire choisie. Pour une « corde au hasard », trois modèles raisonnables donnent 1/3, 1/2 et 1/4. Avant de calculer, il faut dire comment on tire.",
    "The probability of an event depends on the random experiment chosen. For a “random chord”, three reasonable models give 1/3, 1/2 and 1/4. Before computing, say how the drawing is done.",
  ],
  history: {
    title: ["Bertrand · 1889", "Bertrand · 1889"],
    story: [
      "Joseph Bertrand présenta ce paradoxe dans son Calcul des probabilités (1889) pour montrer qu’une probabilité géométrique reste ambiguë tant que l’expérience n’est pas précisée.",
      "Joseph Bertrand presented this paradox in his Calcul des probabilités (1889) to show that a geometric probability stays ambiguous until the experiment is specified.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Bertrand/",
  },
};
