// The josephus challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { josephusOrder } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const ring = (n, R, f) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return f(32 + R * Math.cos(a), 32 + R * Math.sin(a), i); }).join("");

export const card = {
  id: "josephus",
  type: "play",
  title: ["Le cercle de Josèphe", "The Josephus circle"],
  topic: ["Récurrence", "Recursion"],
  difficulty: 3,
  minutes: 12,
  hints: [["Cherche la survivante pour n = 1, 2, 3, …, 10 : quel motif apparaît quand n est une puissance de 2 ?", "Find the survivor for n = 1, 2, 3, …, 10: what pattern appears when n is a power of 2?"], ["Après avoir éliminé assez de personnes pour tomber sur une puissance de 2, qui est la première personne sautée ?", "After removing enough people to land on a power of 2, who is the first person skipped?"]],
  extension: ["Écris le numéro du survivant en binaire à partir de celui de n : que remarques-tu ?", "Write n in binary and the survivor’s number in binary: what do you notice?"],
};

export const variant = {
  params: [int("n", "Nombre de personnes", "Number of people", 5, 100, 41), choice("k", "On élimine une personne sur", "Remove one person in", [[2, "2 (une sur deux)", "2 (every second)"], [3, "3 (une sur trois)", "3 (every third)"]], 2)],
  answer: (q) => josephusOrder(q.n, Number(q.k)).last,
  prompt: (q) => Number(q.k) === 2
    ? P(`${q.n} personnes, numérotées de 1 à ${q.n}, forment un cercle. On saute la personne 1, on élimine la 2, on saute la 3, on élimine la 4, et ainsi de suite en tournant et sans s’arrêter jusqu’à ce qu’il n’en reste qu’une. Quel est le numéro de la dernière personne restante ?`, `${q.n} people, numbered 1 to ${q.n}, stand in a circle. Skip person 1, remove 2, skip 3, remove 4, and so on around the circle without stopping until one person is left. What is the number of the last person standing?`)
    : P(`${q.n} personnes, numérotées de 1 à ${q.n}, forment un cercle. On saute les personnes 1 et 2, on élimine la 3, on saute les deux suivantes, on élimine la 6, et ainsi de suite en tournant jusqu’à ce qu’il n’en reste qu’une. Quel est le numéro de la dernière personne restante ?`, `${q.n} people, numbered 1 to ${q.n}, stand in a circle. Skip persons 1 and 2, remove 3, skip the next two, remove 6, and so on around the circle until one person is left. What is the number of the last person standing?`),
  solution: (q) => {
    const k = Number(q.k), last = josephusOrder(q.n, k).last;
    if (k === 2) { const m = 2 ** Math.floor(Math.log2(q.n)), l = q.n - m; return P(`Si le cercle compte 2<sup>m</sup> personnes, un tour élimine une personne sur deux et recommence au même point : la première personne sautée, la numéro 1, survit. Pour n = 2<sup>m</sup> + l avec 0 ≤ l &lt; 2<sup>m</sup>, après l éliminations (2, 4, …, 2l) il reste 2<sup>m</sup> personnes et la prochaine sautée est 2l + 1 : elle survit. Ici ${q.n} = ${m} + ${l}, donc le survivant est 2 × ${l} + 1 = ${last}.`, `If the circle has 2<sup>m</sup> people, one lap removes every second person and restarts at the same spot: the first person skipped survives. For n = 2<sup>m</sup> + l with 0 ≤ l &lt; 2<sup>m</sup>, after l removals (2, 4, …, 2l) there are 2<sup>m</sup> people left and the next one skipped is 2l + 1: that person survives. Here ${q.n} = ${m} + ${l}, so the survivor is 2 × ${l} + 1 = ${last}.`); }
    return P(`Avec une élimination sur ${k}, il n’y a pas de formule aussi simple, mais une récurrence : si J(n) est le survivant parmi n personnes, J(1) = 1 et J(n) = (J(n − 1) + ${k} − 1) mod n + 1. Après la première élimination, il reste n − 1 personnes et on recommence à compter après la personne éliminée : on se ramène au cas de n − 1. On calcule de proche en proche jusqu’à n = ${q.n} : J(${q.n}) = ${last}.`, `With one removal in ${k} there is no formula as simple, but there is a recurrence: if J(n) is the survivor among n people, J(1) = 1 and J(n) = (J(n − 1) + ${k} − 1) mod n + 1. After the first removal, n − 1 people remain and counting restarts after the removed one: this reduces to the case n − 1. Compute step by step up to n = ${q.n}: J(${q.n}) = ${last}.`);
  },
};

export const original = (q) => (Number(q.k) === 2
? P("Trouve une règle, ou une formule, qui donne la dernière personne restante pour un cercle d’un nombre quelconque de personnes, quand on élimine une personne sur deux. Démontre-la.",
"Find a rule, or a formula, that gives the last person standing for a circle of any number of people when every second person is removed. Prove it.")
: P(`Décris une procédure qui calcule la dernière personne restante pour un cercle de ${q.n} personnes, quand on élimine une personne sur 3. Peux-tu la rendre bien plus rapide que de simuler tout le jeu ?`,
`Describe a procedure that computes the last person standing for a circle of ${q.n} people when every third person is removed. Can you make it much faster than simulating the whole game?`));

export const icon = svg(`<g class="ci-spin">${ring(8, 21, (x, y, i) => (i === 3 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="none"/>` : dot(x.toFixed(1), y.toFixed(1), 3.6)))}</g>`);
