// The lighteggs challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { eggWeighings, splitThree } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "lighteggs",
  type: "play",
  title: ["L’œuf abîmé", "The spoiled egg"],
  topic: ["Logique et dénombrement", "Logic and counting"],
  difficulty: 2,
  minutes: 8,
  hints: [],
  extension: ["Et si l’on ignore si l’œuf abîmé est plus léger ou plus lourd ? Combien de pesées pour 12 œufs, en sachant aussi dire lequel ?", "What if you do not know whether the spoiled egg is lighter or heavier? How many weighings for 12 eggs, also telling which?"],
};

export const variant = {
  params: [int("n", "Nombre d’œufs", "Number of eggs", 3, 81, 9)],
  answer: (q) => eggWeighings(q.n),
  prompt: (q) => P(`Parmi ${q.n} œufs d’apparence identique, un seul est abîmé : il est un peu plus léger que les autres, qui ont tous le même poids. On dispose d’une balance à deux plateaux, sans poids. Quel est le plus petit nombre de pesées qui permet de trouver à coup sûr l’œuf abîmé ?`, `Among ${q.n} identical-looking eggs, exactly one is spoiled: it is a little lighter than the others, which all weigh the same. You have a two-pan balance and no weights. What is the smallest number of weighings that always finds the spoiled egg?`),
  hints: (q) => [P("Une pesée a trois issues possibles : le plateau de gauche est plus léger, celui de droite l’est, ou l’équilibre. Que peut-on en déduire à chaque fois ?", "A weighing has three possible outcomes: the left pan is lighter, the right pan is lighter, or they balance. What can you deduce each time?"), P("Au lieu de comparer un œuf à un œuf, partage les œufs en trois paquets presque égaux.", "Instead of comparing one egg with one egg, split the eggs into three nearly equal piles.")],
  solution: (q) => { const k = eggWeighings(q.n), [a, , r] = splitThree(q.n, k); return P(`Une pesée a 3 issues : après k pesées, on distingue au plus 3^k situations, donc il faut 3^k ≥ ${q.n}. Comme 3^${k - 1} = ${3 ** (k - 1)} < ${q.n} ≤ ${3 ** k} = 3^${k}, il faut au moins ${k} pesée${k > 1 ? "s" : ""}. Elles suffisent : pose ${a} œufs sur chaque plateau et ${r} à côté. Si un plateau est plus léger, l’œuf abîmé est parmi ses ${a} œufs ; si la balance est en équilibre, il est parmi les ${r} œufs restants. À chaque pesée, le nombre de suspects est divisé par 3 (arrondi vers le haut), sans jamais dépasser 3^(k − 1) pour les pesées restantes.`, `A weighing has 3 outcomes: after k weighings at most 3^k situations can be told apart, so 3^k ≥ ${q.n} is needed. Since 3^${k - 1} = ${3 ** (k - 1)} < ${q.n} ≤ ${3 ** k} = 3^${k}, at least ${k} weighing${k > 1 ? "s" : ""} are needed. They are enough: put ${a} eggs on each pan and ${r} aside. If a pan is lighter, the spoiled egg is among its ${a} eggs; if the pans balance, it is among the ${r} eggs left. Each weighing divides the number of suspects by 3 (rounded up), never exceeding 3^(k − 1) for the weighings that remain.`); },
};

export const original = (q) => P(
`Décris comment trouver l’œuf abîmé parmi ${q.n} œufs avec le moins de pesées possible, dans le pire des cas. Justifie que ta méthode marche à coup sûr, puis qu’on ne peut pas faire avec moins de pesées.`,
`Describe how to find the spoiled egg among ${q.n} eggs with as few weighings as possible, in the worst case. Justify that your method is certain to work, then that fewer weighings cannot do it.`);

export const icon = svg(`<g class="ci-pulse"><path d="M32 4v6M12 12l4 4M52 12l-4 4M6 28h6M52 28h6" stroke-opacity=".7"/></g><path d="M22 36c-6-5-6-18 4-22 8-3 18 2 18 12 0 5-3 8-6 10v4H26v-4z" ${soft}/><path d="M26 44h14M27 50h12"/>`);
