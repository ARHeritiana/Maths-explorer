// The cham challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
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
  hints: [],
  extension: ["Pour quels effectifs (r, v, b) peut-on rendre tous les caméléons bleus ? Énonce une condition simple.", "For which counts (r, g, b) can all the chameleons be made blue? State a simple condition."],
};

export const variant = {
  params: [choice("set", "Caméléons (rouges, verts, bleus)", "Chameleons (red, green, blue)", CHAM_SETS.map((s) => [s, s.split(",").join(" · "), s.split(",").join(" · ")]), "13,15,17")],
  answer: (q) => chamMin(...chamSet(q.set)),
  prompt: (q) => { const [r, g, b] = chamSet(q.set); return P(`Sur une île vivent ${r} caméléons rouges, ${g} verts et ${b} bleus. Quand deux caméléons de couleurs différentes se rencontrent, tous deux prennent la troisième couleur. Quel est le plus petit nombre de rencontres après lequel tous les caméléons ont la même couleur ? Réponds 0 si c’est impossible.`, `On an island live ${r} red, ${g} green and ${b} blue chameleons. When two chameleons of different colours meet, both change to the third colour. What is the smallest number of meetings after which all the chameleons have the same colour? Answer 0 if it is impossible.`); },
  hints: (q) => [P("Note (r, v, b) après une rencontre rouge-vert : comment changent r − v, v − b et b − r ?", "Write (r, g, b) after a red–green meeting: how do r − g, g − b and b − r change?"), P("À la fin, deux des trois nombres sont nuls. Que valent alors leurs différences, modulo 3 ?", "At the end two of the three numbers are zero. What are their differences, modulo 3?")],
  solution: (q) => { const [r, g, b] = chamSet(q.set), sol = chamSolve(r, g, b), mod = (x) => ((x % 3) + 3) % 3; return P(`Une rencontre rouge-vert fait (r, v, b) → (r − 1, v − 1, b + 2) : chaque différence entre deux effectifs varie de 0 ou de ±3. Les différences modulo 3 sont donc invariantes. Ici : r − v ≡ ${mod(r - g)}, v − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)} (mod 3). Pour que tous aient la même couleur, deux effectifs doivent être nuls, donc congrus modulo 3. ${sol ? `C’est le cas : une recherche exhaustive des suites de rencontres donne ${sol.length} rencontres au minimum.` : "Aucune différence n’est congrue à 0 modulo 3 : c’est impossible, la réponse est 0."}`, `A red–green meeting turns (r, g, b) into (r − 1, g − 1, b + 2): each difference between two counts changes by 0 or ±3. The differences modulo 3 are therefore invariant. Here: r − g ≡ ${mod(r - g)}, g − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)} (mod 3). For all to share one colour, two counts must be zero, hence congruent modulo 3. ${sol ? `This holds: an exhaustive search over sequences of meetings gives ${sol.length} meetings at least.` : "No difference is 0 modulo 3: it is impossible, the answer is 0."}`); },
};

export const original = (q) => { const [a, b, c] = String(q.set).split(","); return P(
`Avec ${a}, ${b} et ${c} caméléons de chaque couleur, peut-on arriver à une île où tous ont la même couleur ? Si oui, décris une suite de rencontres. Sinon, démontre que c’est impossible. Pour quels effectifs de départ est-ce possible ?`,
`With ${a}, ${b} and ${c} chameleons of each colour, can the island reach a state where all have the same colour? If so, describe a sequence of meetings. If not, prove it is impossible. For which starting numbers is it possible?`); };

export const icon = svg(`<circle class="ci-hue" cx="20" cy="22" r="10" fill="currentColor"/><circle class="ci-hue" style="--d:-1s" cx="44" cy="22" r="10" fill="currentColor"/><circle class="ci-hue" style="--d:-2s" cx="32" cy="44" r="10" fill="currentColor"/>`);

export const hintActions = { 0: ["diff", "Afficher r − v, v − b, b − r", "Show r − v, v − b, b − r"], 1: ["mod", "Afficher ces différences modulo 3", "Show these differences modulo 3"] };
