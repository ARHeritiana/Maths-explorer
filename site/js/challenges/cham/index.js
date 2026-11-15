// The cham challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { CHAM_SETS, chamMin, chamSet, chamSolve } from "./maths.js";
import { choice, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "cham",
  type: "olympiad",
  title: ["Les caméléons", "The chameleons"],
  topic: ["Invariants", "Invariants"],
  difficulty: 3,
  minutes: 15,
  extension: ["Pour quels effectifs (r, v, b) peut-on rendre tous les caméléons bleus ? Énonce une condition simple.", "For which counts (r, g, b) can all the chameleons be made blue? State a simple condition."],
};

export const variant = {
  impossible: true,   // the answer can be "impossible": the shared answer form offers a neutral Impossible button (checks the answer 0)
  params: [choice("set", "Caméléons (rouges, verts, bleus)", "Chameleons (red, green, blue)", CHAM_SETS.map((s) => [s, s.split(",").join(" · "), s.split(",").join(" · ")]), "13,15,17")],
  answer: (q) => chamMin(...chamSet(q.set)),
  prompt: (q) => { const [r, g, b] = chamSet(q.set); return P(`Sur une île vivent ${r} caméléons rouges, ${g} verts et ${b} bleus. Quand deux caméléons de couleurs différentes se rencontrent, tous deux prennent la troisième couleur. Quel est le plus petit nombre de rencontres après lequel tous les caméléons ont la même couleur ?`, `On an island live ${r} red, ${g} green and ${b} blue chameleons. When two chameleons of different colours meet, both change to the third colour. What is the smallest number of meetings after which all the chameleons have the same colour?`); },
  solution: (q) => { const [r, g, b] = chamSet(q.set), sol = chamSolve(r, g, b), mod = (x) => ((x % 3) + 3) % 3; return P(`Une rencontre rouge-vert fait (r, v, b) → (r − 1, v − 1, b + 2). Chaque différence entre deux effectifs change de 0 ou de ±3 : le reste de sa division par 3 ne change donc jamais. Ici, les restes de r − v, v − b et b − r dans la division par 3 sont ${mod(r - g)}, ${mod(g - b)} et ${mod(b - r)}. Quand tous les caméléons ont la même couleur, deux effectifs sont nuls : leur différence est 0, de reste 0. Il faut donc qu’une des trois différences ait pour reste 0. ${sol ? `C’est le cas : en essayant toutes les suites de rencontres, la plus courte en compte ${sol.length}.` : "Aucune n’a pour reste 0 : c’est impossible, la réponse est 0."}`, `A red–green meeting turns (r, g, b) into (r − 1, g − 1, b + 2). Each difference between two counts changes by 0 or ±3, so its remainder on division by 3 never changes. Here, the remainders of r − g, g − b and b − r on division by 3 are ${mod(r - g)}, ${mod(g - b)} and ${mod(b - r)}. When all the chameleons share one colour, two counts are 0: their difference is 0, with remainder 0. So one of the three differences must have remainder 0. ${sol ? `This holds: by trying all sequences of meetings, the shortest one has ${sol.length}.` : "None has remainder 0: it is impossible, the answer is 0."}`); },
};

export const original = (q) => { const [a, b, c] = String(q.set).split(","); return P(
`Avec ${a}, ${b} et ${c} caméléons de chaque couleur, peut-on arriver à une île où tous ont la même couleur ? Si oui, décris une suite de rencontres. Sinon, démontre que c’est impossible. Pour quels effectifs de départ est-ce possible ?`,
`With ${a}, ${b} and ${c} chameleons of each colour, can the island reach a state where all have the same colour? If so, describe a sequence of meetings. If not, prove it is impossible. For which starting numbers is it possible?`); };

export const icon = svg(`<circle cx="20" cy="22" r="10"/><circle cx="44" cy="22" r="10" fill="currentColor" fill-opacity=".35"/><circle cx="32" cy="44" r="10" fill="currentColor"/>`);
