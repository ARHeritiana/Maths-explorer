// Experiment `circle-regions` (template figure, no axes): n points on a circle joined by all their chords. 1, 2, 4, 8, 16
// regions suggest doubling; the sixth point gives 31. State {n, mode}: the number of points and their placement (general, or a
// regular polygon where three diagonals can meet). Pure maths: models/circle-regions.js.
import * as M from "../models/circle-regions.js";

const { model, MAX_N } = M;

export default {
  id: "circle-regions", template: "figure", section: "patterns", sub: ["Les régions d’un disque", "Regions of a disc"],
  symbol: "2ⁿ", group: ["Dénombrement", "Counting"],
  title: ["1, 2, 4, 8, 16… et 31", "1, 2, 4, 8, 16… and 31"],
  short: ["Cordes d’un cercle et régions", "Chords of a circle and regions"],
  intro: [
    "Place des points sur un cercle et trace toutes les cordes. Le nombre de régions double à chaque point… jusqu’au sixième.",
    "Place points on a circle and draw every chord. The number of regions doubles with each point… until the sixth.",
  ],
  duration: 10,
  level: ["Première · Terminale", "Intermediate · Advanced"],
  prereq: ["Coefficients binomiaux (pour la preuve)", "Binomial coefficients (for the proof)"],
  model: M,
  state: { n: 5, mode: "general" },
  controls: {
    n: { kind: "slider", key: "n", label: ["Nombre de points", "Number of points"], min: 1, max: MAX_N, step: 1, digits: 0 },
    mode: {
      kind: "choice", key: "mode", label: ["Position des points", "Position of the points"],
      options: [{ value: "general", label: ["Quelconque", "General"] }, { value: "regular", label: ["Polygone régulier", "Regular polygon"] }],
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [-1.25, 1.25], y: [-1.2, 1.2], equal: true, axes: false, pad: [6, 6, 6, 6],
      scene(s) {
        const m = model(s);
        const lines = m.chords.map(([i, j]) => ({ a: m.pts[i], b: m.pts[j], color: "accent", width: 1.8 }));
        const points = [
          ...m.pts.map((p) => ({ at: p, color: "ink", r: 6 })),
          ...m.hits.filter((h) => h.m > 2).map((h) => ({ at: h.at, color: "neg", r: 7, hollow: true })),
        ];
        return { circles: [{ c: [0, 0], r: 1, color: "line", width: 2 }], lines, points };
      },
      measure(s, { fmt }) {
        const m = model(s);
        return { text: fmt.t([`${m.regions} régions`, `${m.regions} regions`]), color: m.regions === m.doubling ? "pos" : m.regions === m.max ? "obj2" : "neg" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s);
      return fmt.fr ? `n = ${s.n} points : ${m.chords.length} cordes, ${m.regions} régions ; 2ⁿ⁻¹ = ${m.doubling}` : `n = ${s.n} points: ${m.chords.length} chords, ${m.regions} regions; 2ⁿ⁻¹ = ${m.doubling}`;
    },
    readout(s, { fmt }) {
      const m = model(s), fr = fmt.fr;
      return [
        [["Régions comptées", "Regions counted"], `${m.regions}`],
        [["Doublement 2ⁿ⁻¹", "Doubling 2ⁿ⁻¹"], `${m.doubling}`],
        [["Points où 3 cordes ou plus se croisent", "Points where 3 or more chords cross"], `${m.hits.filter((h) => h.m > 2).length}${m.concurrent ? (fr ? " (régions perdues)" : " (regions lost)") : ""}`],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { n: 5, mode: "general" }, correct: 1,
      prompt: [
        "Avec 1, 2, 3, 4, 5 points, on obtient au plus 1, 2, 4, 8, 16 régions. Avec 6 points, combien de régions au maximum ?",
        "With 1, 2, 3, 4, 5 points we get at most 1, 2, 4, 8, 16 regions. With 6 points, at most how many regions?",
      ],
      choices: [["32", "32"], ["31", "31"], ["30", "30"]],
    },
    {
      id: "six", kind: "explore", set: { n: 5, mode: "general" }, unlock: ["n"],
      prompt: [
        "Ajoute un sixième point et lis le nombre de régions. La régularité 1, 2, 4, 8, 16 continue-t-elle ?",
        "Add a sixth point and read the number of regions. Does the pattern 1, 2, 4, 8, 16 go on?",
      ],
      hint: ["Le curseur règle le nombre de points.", "The slider sets the number of points."],
      goal: (s) => s.n === 6,
      done: [
        "Six points donnent 31 régions, pas 32. Cinq cas qui doublent ne prouvaient pas que le doublement continue.",
        "Six points give 31 regions, not 32. Five cases that double did not prove that the doubling goes on.",
      ],
    },
    {
      id: "regular", kind: "contrast", set: { n: 6, mode: "general" },
      variants: [
        { label: ["Cas A : points quelconques", "Case A: general points"], set: { mode: "general" } },
        { label: ["Cas B : hexagone régulier", "Case B: regular hexagon"], set: { mode: "regular" } },
      ],
      prompt: [
        "Compare six points quelconques et les six sommets d’un hexagone régulier. Pourquoi l’hexagone donne-t-il une région de moins ?",
        "Compare six general points and the six vertices of a regular hexagon. Why does the hexagon give one region fewer?",
      ],
      done: [
        "Dans l’hexagone, les trois grandes diagonales passent par le centre : trois croisements se confondent en un seul point, et une région disparaît (30 au lieu de 31). Le maximum n’est atteint que si trois cordes ne sont jamais concourantes.",
        "In the hexagon the three long diagonals pass through the centre: three crossings merge into one point and a region disappears (30 instead of 31). The maximum is reached only if no three chords are concurrent.",
      ],
    },
    {
      id: "seven", kind: "check", set: { n: 7, mode: "general" }, quantity: "regions", answer: 57,
      prompt: [
        "Avec 7 points quelconques, chaque corde ajoute une région, plus une par croisement. Il y a 21 cordes et 35 croisements (un par choix de 4 points). Combien de régions ?",
        "With 7 general points, each chord adds one region, plus one per crossing. There are 21 chords and 35 crossings (one per choice of 4 points). How many regions?",
      ],
      hint: ["1 (le disque) + 21 + 35.", "1 (the disc) + 21 + 35."],
      because: ["1 + 21 + 35 = 57, loin de 2⁶ = 64.", "1 + 21 + 35 = 57, far from 2⁶ = 64."],
    },
    {
      id: "why", kind: "explain", set: { n: 7, mode: "general" },
      prompt: [
        "Pourquoi le nombre maximal de régions vaut-il 1 + C(n, 2) + C(n, 4), et pourquoi coïncide-t-il avec 2ⁿ⁻¹ seulement jusqu’à n = 5 ?",
        "Why is the maximum number of regions 1 + C(n, 2) + C(n, 4), and why does it agree with 2ⁿ⁻¹ only up to n = 5?",
      ],
      argument: [
        "Traçons les cordes une à une, sans trois cordes concourantes. Une corde qui en croise k autres est découpée en k + 1 morceaux, et chaque morceau partage une région en deux : elle ajoute k + 1 régions. Au total : 1 (le disque) + le nombre de cordes C(n, 2) + le nombre de croisements. Chaque croisement est celui des deux diagonales d’un quadrilatère formé par 4 des n points, et chaque choix de 4 points donne exactement un croisement : il y en a C(n, 4). D’où R = 1 + C(n, 2) + C(n, 4) = C(n − 1, 0) + C(n − 1, 1) + C(n − 1, 2) + C(n − 1, 3) + C(n − 1, 4), par la formule de Pascal. Or 2ⁿ⁻¹ est la somme de tous les C(n − 1, k) pour k de 0 à n − 1 : les deux nombres sont égaux tant que n − 1 ≤ 4, et R est plus petit ensuite.",
        "Draw the chords one at a time, with no three concurrent. A chord that crosses k others is cut into k + 1 pieces, and each piece splits a region in two: it adds k + 1 regions. In total: 1 (the disc) + the number of chords C(n, 2) + the number of crossings. Each crossing is that of the two diagonals of a quadrilateral formed by 4 of the n points, and each choice of 4 points gives exactly one crossing: there are C(n, 4). Hence R = 1 + C(n, 2) + C(n, 4) = C(n − 1, 0) + C(n − 1, 1) + C(n − 1, 2) + C(n − 1, 3) + C(n − 1, 4), by Pascal’s rule. Now 2ⁿ⁻¹ is the sum of all the C(n − 1, k) for k from 0 to n − 1: the two numbers agree as long as n − 1 ≤ 4, and R is smaller afterwards.",
      ],
    },
  ],
  conclusion: [
    "Le nombre maximal de régions est 1 + C(n, 2) + C(n, 4) : 1, 2, 4, 8, 16, 31, 57, 99… Les cinq premiers termes coïncident avec les puissances de 2, puis plus jamais. Deviner une formule à partir de quelques cas est utile ; seule la démonstration dit si elle est vraie.",
    "The maximum number of regions is 1 + C(n, 2) + C(n, 4): 1, 2, 4, 8, 16, 31, 57, 99… The first five terms agree with the powers of 2, then never again. Guessing a formula from a few cases is useful; only the proof says whether it is true.",
  ],
  history: {
    title: ["Euler · 1758", "Euler · 1758"],
    story: [
      "Le décompte peut aussi se faire avec la relation S − A + F = 2 de Leonhard Euler sur les sommets, arêtes et faces d’une figure plane. Le problème du cercle est souvent attribué à Leo Moser.",
      "The count can also be done with Leonhard Euler’s relation V − E + F = 2 between the vertices, edges and faces of a plane figure. The circle problem is often attributed to Leo Moser.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Euler/",
  },
};
