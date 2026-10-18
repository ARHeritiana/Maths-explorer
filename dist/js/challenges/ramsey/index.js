// The ramsey challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const pent = Array.from({ length: 5 }, (_, i) => { const a = ((i * 72 - 90) * Math.PI) / 180; return [32 + 22 * Math.cos(a), 32 + 22 * Math.sin(a)]; });

export const card = {
  id: "ramsey",
  type: "olympiad",
  title: ["Trois amis ou trois inconnus", "Three friends or three strangers"],
  topic: ["Graphes", "Graph theory"],
  difficulty: 3,
  minutes: 15,
  hints: [["Montre d’abord que 5 ne suffit pas : cherche un coloriage des traits d’un pentagone et de ses diagonales sans trio d’une seule couleur.", "First show that 5 is not enough: look for a colouring of a pentagon’s sides and diagonals with no one-colour trio."], ["Avec 6 personnes, fixe l’une d’elles et regarde ses 5 relations avec les autres : le principe des tiroirs s’applique.", "With 6 people, fix one of them and look at her 5 relations with the others: the pigeonhole principle applies."]],
  extension: ["Combien de trios faut-il vérifier pour 6 personnes ? Pourquoi R(3, 3) = 6 ne dépend-il pas du coloriage choisi ?", "How many trios must be checked for 6 people? Why does R(3, 3) = 6 not depend on the colouring chosen?"],
};

export const variant = {
  params: [choice("s", "Groupe d’inconnus recherché", "Group of strangers sought", [[3, "3 personnes", "3 people"], [4, "4 personnes", "4 people"]], 3)],
  answer: (q) => (Number(q.s) === 3 ? 6 : 9),
  prompt: (q) => P(`Dans un groupe de n personnes, deux personnes quelconques sont soit amies, soit non amies. Quel est le plus petit n qui garantit de trouver trois personnes deux à deux amies, ou ${q.s === 3 ? "trois" : "quatre"} personnes deux à deux non amies ?`, `In a group of n people, any two are either friends or not friends. What is the smallest n that guarantees three people who are pairwise friends, or ${Number(q.s) === 3 ? "three" : "four"} people who are pairwise not friends?`),
  solution: (q) => Number(q.s) === 3
    ? P("5 personnes ne suffisent pas : en pentagone, amis = côtés, non amis = diagonales, aucun trio n’est d’une seule couleur. Avec 6 personnes, la personne A a 5 relations, donc au moins 3 du même type (tiroirs), par exemple 3 amis B, C, D. Si deux d’entre eux sont amis, ils forment avec A un trio d’amis. Sinon B, C, D sont deux à deux non amis. Dans tous les cas il y a un trio d’une seule couleur : R(3, 3) = 6.", "5 people are not enough: arranged as a pentagon, friends = sides, not friends = diagonals, no trio is one colour. With 6 people, person A has 5 relations, so at least 3 of one kind (pigeonhole), say 3 friends B, C, D. If two of them are friends, they form a trio of friends with A. Otherwise B, C, D are pairwise not friends. Either way there is a one-colour trio: R(3, 3) = 6.")
    : P("8 personnes ne suffisent pas : place-les en cercle ; deux personnes sont amies si leurs places diffèrent de 1 ou de 4. Il n’y a ni trio d’amis ni groupe de 4 inconnus. Avec 9 personnes, supposons ni trio d’amis ni 4 inconnus. Chacun a au plus 3 amis (4 amis seraient deux à deux inconnus) et au plus 5 inconnus (parmi 6 inconnus, d’après R(3, 3) = 6, on trouverait un trio d’amis ou un trio d’inconnus, donc 4 inconnus avec lui). Comme 3 + 5 = 8, chacun a exactement 3 amis : 9 × 3 = 27 amitiés comptées deux fois, un nombre impair. Contradiction : R(3, 4) = 9.", "8 people are not enough: seat them in a circle; two people are friends if their seats differ by 1 or by 4. There is no trio of friends and no group of 4 strangers. With 9 people, suppose no trio of friends and no 4 strangers. Everyone has at most 3 friends (4 friends would be pairwise strangers) and at most 5 strangers (among 6 strangers, by R(3, 3) = 6, there would be a friend trio or a stranger trio, hence 4 strangers with them). Since 3 + 5 = 8, everyone has exactly 3 friends: 9 × 3 = 27 friendships counted twice, an odd number. Contradiction: R(3, 4) = 9."),
};

export const original = (q) => P(
`Détermine le plus petit nombre de personnes qui garantit trois personnes deux à deux amies ou ${q.s} personnes deux à deux inconnues. Rédige la preuve en deux parties : un groupe explicite, un peu plus petit, qui échappe à la conclusion, puis un argument montrant que ce nombre suffit.`,
`Determine the smallest number of people that guarantees three mutual friends or ${q.s} mutual strangers. Write the proof in two parts: an explicit group, a little smaller, that escapes the conclusion, then an argument showing that this number is enough.`);

export const icon = svg(`<g class="ci-pulse">${pent.map((p, i) => { const q = pent[(i + 1) % 5], r = pent[(i + 2) % 5]; return `<path d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" ${i % 2 ? 'stroke-dasharray="4 4"' : ""}/><path d="M${p[0]} ${p[1]}L${r[0]} ${r[1]}" stroke-opacity=".45" ${i % 2 ? "" : 'stroke-dasharray="4 4"'}/>`; }).join("")}</g>${pent.map((p) => dot(p[0].toFixed(1), p[1].toFixed(1), 3.8)).join("")}`);
