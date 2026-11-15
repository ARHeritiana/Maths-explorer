// The piles challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { splitTotal } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "piles",
  type: "play",
  title: ["Le partage des cailloux", "Splitting the pebbles"],
  topic: ["Invariants", "Invariants"],
  difficulty: 2,
  minutes: 8,
  extension: ["Remplace le produit a × b par a + b, puis par a² + b² : que peut-on dire de la somme finale ?", "Replace the product a × b by a + b, then by a² + b²: what can be said of the final sum?"],
};

export const variant = {
  params: [int("n", "Nombre de cailloux", "Number of pebbles", 4, 60, 10)],
  answer: (q) => splitTotal(q.n),
  prompt: (q) => P(`On a un tas de ${q.n} cailloux. On le sépare en deux tas de a et b cailloux et on note le produit a × b. On recommence avec n’importe quel tas contenant au moins 2 cailloux, jusqu’à ce que chaque tas ne contienne qu’un caillou. Quelle est la somme de tous les produits notés ?`, `You have a pile of ${q.n} pebbles. Split it into two piles of a and b pebbles and write down the product a × b. Keep doing this with any pile holding at least 2 pebbles until every pile has a single pebble. What is the sum of all the products written down?`),
  solution: (q) => P(`Pour chaque paire de cailloux, il y a exactement un moment où elle est séparée (au début ils sont dans le même tas, à la fin chacun est seul). À cet instant, a × b est justement le nombre de paires formées d’un caillou de chaque tas : la paire est comptée une fois, et une seule. Au total, chaque paire est donc comptée exactement une fois : ${q.n} × ${q.n - 1} / 2 = ${splitTotal(q.n)}, quelle que soit la façon de séparer.`, `For each pair of pebbles there is exactly one moment when they are separated (at first they share a pile, at the end each is alone). At that moment, a × b is exactly the number of pairs made of one pebble from each pile: the pair is counted once, and only once. In all, every pair is therefore counted exactly once: ${q.n} × ${q.n - 1} / 2 = ${splitTotal(q.n)}, however the piles are split.`),
};

export const original = () => P(
"Trouve une formule, en fonction du nombre de cailloux, pour la somme de tous les produits, et démontre qu’elle ne dépend pas de la façon de séparer les tas.",
"Find a formula, in terms of the number of pebbles, for the sum of all the products, and prove that it does not depend on how the piles are split.");

export const icon = svg(`<g class="ci-bob">${[0, 1, 2].map((i) => `<ellipse cx="20" cy="${44 - i * 9}" rx="11" ry="4.5" ${soft}/>`).join("")}</g>${[0, 1, 2].map((i) => `<ellipse cx="46" cy="${44 - i * 9}" rx="11" ry="4.5" ${i === 1 ? 'fill="currentColor" fill-opacity=".6"' : soft}/>`).join("")}<path d="M6 54h52"/>`);
