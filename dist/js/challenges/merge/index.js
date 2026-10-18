// The merge challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { mergeFinal } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "merge",
  type: "olympiad",
  title: ["Efface deux nombres", "Erase two numbers"],
  topic: ["Invariants", "Invariants"],
  difficulty: 3,
  minutes: 12,
  hints: [],
  extension: ["Remplace la règle par « a et b deviennent |a − b| » avec les nombres 1 à 100 : quelle propriété du résultat est invariante ?", "Replace the rule by “a and b become |a − b|” with the numbers 1 to 100: which property of the result is invariant?"],
};

export const variant = {
  params: [int("n", "Nombre de nombres", "How many numbers", 3, 12, 5)],
  answer: (q) => mergeFinal(q.n),
  prompt: (q) => P(`Les nombres 1, 2, …, ${q.n} sont écrits au tableau. À chaque étape, on efface deux nombres a et b et on écrit à la place le nombre a + b + ab. On recommence jusqu’à ce qu’il ne reste qu’un nombre. Quelle valeur peut-il avoir ?`, `The numbers 1, 2, …, ${q.n} are written on the board. At each step, erase two numbers a and b and write a + b + ab instead. Repeat until only one number is left. What value can it have?`),
  hints: (q) => [P("Essaie avec 1, 2, 3 en choisissant les paires dans des ordres différents. Que remarques-tu ?", "Try 1, 2, 3 choosing the pairs in different orders. What do you notice?"), P("Que vaut (a + 1)(b + 1) ? Cherche une quantité qui ne change pas à chaque étape.", "What is (a + 1)(b + 1)? Look for a quantity that does not change at each step.")],
  solution: (q) => P(`a + b + ab + 1 = (a + 1)(b + 1) : remplacer a et b par a + b + ab laisse inchangé le produit de tous les (nombre + 1). Au début ce produit vaut 2 × 3 × … × ${q.n + 1} = ${q.n + 1}!. À la fin, il reste un seul nombre N et N + 1 = ${q.n + 1}!, donc N = ${q.n + 1}! − 1 = ${mergeFinal(q.n)}, quel que soit l’ordre choisi. C’est un invariant.`, `a + b + ab + 1 = (a + 1)(b + 1): replacing a and b by a + b + ab leaves the product of all the (number + 1) unchanged. At the start this product is 2 × 3 × … × ${q.n + 1} = ${q.n + 1}!. At the end a single number N remains and N + 1 = ${q.n + 1}!, so N = ${q.n + 1}! − 1 = ${mergeFinal(q.n)}, whatever the order. This is an invariant.`),
};

export const original = () => P(
"Démontre que le nombre final ne dépend pas des choix faits à chaque étape.",
"Prove that the final number does not depend on the choices made at each step.");

export const icon = svg(`<circle class="ci-merge-l" cx="18" cy="32" r="9" ${soft}/><circle class="ci-merge-r" cx="46" cy="32" r="9" ${soft}/><path d="M32 10v6M32 48v6" stroke-opacity=".5"/>`);

export const hintActions = { 1: ["invariant", "Afficher le produit des (nombre + 1)", "Show the product of the (number + 1)"] };
