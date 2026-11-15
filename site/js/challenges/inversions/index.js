// The inversions challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { inversions, permOf } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "inversions",
  type: "play",
  title: ["Ranger une rangée", "Sorting a row"],
  topic: ["Monovariants", "Monovariants"],
  difficulty: 2,
  minutes: 10,
  extension: ["Pourquoi l’algorithme s’arrête-t-il toujours ? Combien d’échanges au maximum pour une rangée de n personnes ?", "Why does the process always stop? What is the largest number of swaps for a row of n people?"],
};

export const variant = {
  params: [int("n", "Nombre de personnes", "Number of people", 5, 10, 7), int("seed", "Tirage n°", "Draw no.", 0, 99, 0)],
  answer: (q) => inversions(permOf(q.n, q.seed)),
  prompt: (q) => P(`${q.n} personnes de tailles toutes différentes sont alignées ; leurs tailles, de gauche à droite, sont classées de 1 (la plus petite) à ${q.n} : ${permOf(q.n, q.seed).join(", ")}. Tant qu’il existe deux voisines dont la plus grande est à gauche, on les échange. Combien d’échanges seront faits au total ?`, `${q.n} people of different heights stand in a row; their heights, left to right, are ranked from 1 (shortest) to ${q.n}: ${permOf(q.n, q.seed).join(", ")}. While two neighbours stand with the taller one on the left, swap them. How many swaps will be made in all?`),
  solution: (q) => { const p = permOf(q.n, q.seed), inv = inversions(p); return P(`Appelons « paire mal rangée » une paire de personnes (pas forcément voisines) où la plus grande est à gauche de la plus petite. Échanger deux voisines mal rangées remet leur paire dans le bon ordre et ne change l’ordre d’aucune autre paire. Le nombre de paires mal rangées baisse donc de 1 exactement à chaque échange, et il vaut 0 exactement quand la rangée est triée. Le nombre d’échanges est donc le nombre de paires mal rangées au départ, quels que soient les choix : ici ${inv}.`, `Call a “pair out of order” a pair of people (not necessarily neighbours) where the taller stands to the left of the shorter. Swapping two neighbours that are out of order puts their pair right and changes the order of no other pair. So the number of pairs out of order drops by exactly 1 at each swap, and it is 0 exactly when the row is sorted. The number of swaps is therefore the number of pairs out of order at the start, whatever the choices: here ${inv}.`); },
};

export const original = () => P(
"Démontre que le nombre d’échanges effectués ne dépend pas de l’ordre dans lequel on choisit les voisines à échanger. À quoi ce nombre correspond-il pour la rangée de départ ?",
"Prove that the number of swaps made does not depend on the order in which neighbouring pairs are chosen. What does this number correspond to for the starting row?");

export const icon = svg(`<rect x="8" y="30" width="9" height="22" rx="2" ${soft}/><rect class="ci-swap-a" x="21" y="14" width="9" height="38" rx="2" ${soft}/><rect class="ci-swap-b" x="34" y="22" width="9" height="30" rx="2" ${soft}/><rect x="47" y="40" width="9" height="12" rx="2" ${soft}/><path d="M6 56h52"/>`);
