// The fakecoins challenge: card text, variations (checked answer, statement, solution text), original question, emblem. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft, dot } from "../common/icon.js";
import { minSample } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "fakecoins",
  type: "play",
  title: ["Les piles de fausses pièces", "The piles of fake coins"],
  topic: ["Raisonnement", "Reasoning"],
  difficulty: 2,
  minutes: 8,
  extension: ["Plusieurs piles peuvent contenir de fausses pièces. Comment adapter les nombres de pièces prises dans chaque pile (pense aux puissances de 2) ?", "Several piles may hold fake coins. How should the numbers of coins taken from each pile be adapted (think of powers of 2)?"],
};

export const variant = {
  params: [int("n", "Nombre de piles", "Number of piles", 4, 15, 10)],
  open: true,   // open challenge: "how can one weighing find the fake pile?"; the site checks nothing
  answer: (q) => minSample(q.n),   // fewest coins on the scale: a fact used by the tests, not asked
  prompt: (q) => P(`Il y a ${q.n} piles de pièces, chacune d’au moins ${q.n} pièces. Les pièces vraies pèsent 10 g ; dans l’une des piles, toutes les pièces sont fausses et pèsent 9 g. Tu disposes d’une balance de précision qui indique le poids exact. Comment identifier la pile fausse avec une seule pesée ? Décris ce que tu poses sur la balance, ce que tu lis, et comment tu en déduis la pile. Cherche ensuite à utiliser le moins de pièces possible.`, `There are ${q.n} piles of coins, each of at least ${q.n} coins. Genuine coins weigh 10 g; in one of the piles all the coins are fake and weigh 9 g. You have a precise scale that shows the exact weight. How can you identify the fake pile with a single weighing? Describe what you put on the scale, what you read, and how you deduce the pile. Then try to use as few coins as possible.`),
  solution: (q) => P(`Prends 1 pièce de la pile 1, 2 pièces de la pile 2, …, ${q.n} pièces de la pile ${q.n} : ${(q.n * (q.n + 1)) / 2} pièces. Si toutes étaient vraies, la balance indiquerait ${10 * ((q.n * (q.n + 1)) / 2)} g. Si la pile k est fausse, k pièces pèsent 1 g de moins : la balance indique k grammes de moins que ${10 * ((q.n * (q.n + 1)) / 2)} g, et ce manque donne k. Pour le minimum : deux piles dont on prend le même nombre de pièces donneraient le même manque et seraient indiscernables, donc les nombres de pièces prises sont deux à deux différents et leur somme est au moins 0 + 1 + … + ${q.n - 1} = ${minSample(q.n)}. On l’atteint en ne prenant aucune pièce de la pile 1 (manque nul : c’est elle), 1 pièce de la pile 2, …, ${q.n - 1} de la pile ${q.n}. La version classique 1, 2, …, ${q.n} utilise ${(q.n * (q.n + 1)) / 2} pièces ; le minimum est ${minSample(q.n)}.`, `Take 1 coin from pile 1, 2 coins from pile 2, …, ${q.n} coins from pile ${q.n}: ${(q.n * (q.n + 1)) / 2} coins. If all were genuine the scale would show ${10 * ((q.n * (q.n + 1)) / 2)} g. If pile k is fake, k coins weigh 1 g less: the scale shows k grams less than ${10 * ((q.n * (q.n + 1)) / 2)} g, and that shortfall is k. For the minimum: two piles from which the same number of coins is taken would give the same shortfall and could not be told apart, so the numbers of coins taken are pairwise different and their sum is at least 0 + 1 + … + ${q.n - 1} = ${minSample(q.n)}. It is reached by taking no coin from pile 1 (no shortfall: it is the one), 1 coin from pile 2, …, ${q.n - 1} from pile ${q.n}. The classical version 1, 2, …, ${q.n} uses ${(q.n * (q.n + 1)) / 2} coins; the minimum is ${minSample(q.n)}.`),
};

export const icon = svg(`<path d="M32 10v40M20 54h24"/><g class="ci-tilt"><path d="M8 20h48"/><path d="M8 20l-4 14h16zM56 20l-4 14h16z" ${soft}/></g>${dot(32, 10, 3.4)}`);
