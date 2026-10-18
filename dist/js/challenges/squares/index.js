// The squares challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "squares",
  type: "olympiad",
  title: ["Additionner des nombres impairs", "Adding odd numbers"],
  topic: ["Sommes", "Sums"],
  difficulty: 1,
  minutes: 8,
  hints: [["Le k-ième entier impair est 2k − 1. Combien de termes y a-t-il ?", "The kth odd integer is 2k − 1. How many terms are there?"], ["Pour passer d’un carré de côté k − 1 à un carré de côté k, ajoute une bordure de 2k − 1 points.", "To grow a square of side k − 1 into a square of side k, add a border of 2k − 1 dots."]],
  extension: ["Rédige aussi une preuve par récurrence.", "Also write a proof by induction."],
};

export const variant = {
  params: [int("n", "Nombre de termes", "Number of terms", 3, 30, 20)],
  answer: (q) => q.n * q.n,
  prompt: (q) => P(`Combien vaut 1 + 3 + 5 + … + ${2 * q.n - 1} ? Cherche une méthode qui explique aussi le résultat pour k termes.`, `What is 1 + 3 + 5 + … + ${2 * q.n - 1}? Find a method that also explains the result for k terms.`),
  hints: (q) => [P("Le k-ième entier impair est 2k − 1. Combien de termes y a-t-il ?", "The kth odd integer is 2k − 1. How many terms are there?"), P("Pour passer d’un carré de côté k − 1 à un carré de côté k, ajoute une bordure de 2k − 1 points.", "To grow a square of side k − 1 into a square of side k, add a border of 2k − 1 dots.")],
  solution: (q) => P(`Il y a ${q.n} termes car ${2 * q.n - 1} = 2 × ${q.n} − 1. Les bordures successives de 1, 3, 5, … points construisent un carré : la somme des k premiers impairs vaut k². Le résultat est ${q.n}² = ${q.n * q.n}.`, `There are ${q.n} terms because ${2 * q.n - 1} = 2 × ${q.n} − 1. Successive borders of 1, 3, 5, … dots build a square: the first k odd numbers sum to k². The result is ${q.n}² = ${q.n * q.n}.`),
};

export const original = () => P(
"Trouve une formule pour 1 + 3 + 5 + … + (2k − 1), quel que soit k, et démontre-la de deux façons différentes : par un dessin, puis par un calcul.",
"Find a formula for 1 + 3 + 5 + … + (2k − 1), for any k, and prove it in two different ways: with a picture, then with a calculation.");

export const icon = svg([[0, 2], [1, 2], [2, 2], [2, 1], [2, 0]].map(([r, c], i) => `<rect class="ci-blink" style="--d:${i * 0.2}s" x="${10 + c * 16}" y="${10 + r * 16}" width="14" height="14" rx="2" fill="currentColor" fill-opacity=".45"/>`).join("") + [[0, 0], [0, 1], [1, 0], [1, 1]].map(([r, c]) => `<rect x="${10 + c * 16}" y="${10 + r * 16}" width="14" height="14" rx="2"/>`).join(""));
