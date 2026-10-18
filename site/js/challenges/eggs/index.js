// The eggs challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, choice, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { eggDrops, eggPlan, eggCover } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "eggs",
  type: "play",
  title: ["Les deux œufs d’autruche", "The two ostrich eggs"],
  topic: ["Optimisation", "Optimization"],
  difficulty: 3,
  minutes: 15,
  hints: [["Avec un seul œuf, la seule méthode sûre est de monter un étage à la fois.", "With a single egg the only safe method is to climb one floor at a time."], ["Si le premier œuf se brise au k-ième lancer, combien de lancers restent-ils au second ? Fais diminuer le pas à chaque lancer.", "If the first egg breaks on the kth drop, how many drops does the second have left? Make the step shrink with each drop."]],
  extension: ["Que devient la réponse avec 3 œufs ? Cherche un tableau « étages couverts » en fonction du nombre d’œufs et de lancers.", "What happens with 3 eggs? Look for a table of floors covered as a function of eggs and drops."],
};

export const variant = {
  params: [int("floors", "Nombre d’étages", "Number of floors", 20, 200, 100), choice("eggs", "Nombre d’œufs", "Number of eggs", [[2, "2 œufs", "2 eggs"], [3, "3 œufs", "3 eggs"]], 2)],
  answer: (q) => eggDrops(Number(q.eggs), q.floors),
  prompt: (q) => P(`Tu as ${q.eggs} œufs d’autruche identiques et un immeuble de ${q.floors} étages. Il existe un étage critique : d’un étage inférieur ou égal, un œuf ne se brise pas ; d’un étage supérieur, il se brise. Un œuf intact peut resservir, un œuf brisé non. Quel est le plus petit nombre de lancers qui suffit, dans le pire des cas, pour trouver l’étage critique ?`, `You have ${q.eggs} identical ostrich eggs and a ${q.floors}-floor building. There is a critical floor: from that floor or below an egg does not break, from above it does. An intact egg can be reused, a broken one cannot. What is the smallest number of drops that is enough, in the worst case, to find the critical floor?`),
  solution: (q) => {
    const e = Number(q.eggs), plan = eggPlan(e, q.floors), n = plan.drops, f = (d) => eggCover(e, d);
    if (e === 2) return P(`Lâche le premier œuf des étages ${plan.floors.join(", ")} : les pas diminuent de 1. S’il se brise au k-ième lancer, le second parcourt les étages restants un par un : au total toujours au plus ${n} lancers. Avec n lancers, on couvre n + (n − 1) + … + 1 = n(n + 1)/2 étages. Il faut n(n + 1)/2 ≥ ${q.floors} : ${n - 1} lancers couvrent ${f(n - 1)} étages, ${n} couvrent ${f(n)}. Réponse : ${n}.`, `Drop the first egg from floors ${plan.floors.join(", ")}: the steps shrink by 1. If it breaks on the kth drop, the second egg walks through the remaining floors one by one: the total is always at most ${n} drops. With n drops you cover n + (n − 1) + … + 1 = n(n + 1)/2 floors. You need n(n + 1)/2 ≥ ${q.floors}: ${n - 1} drops cover ${f(n - 1)} floors, ${n} cover ${f(n)}. Answer: ${n}.`);
    return P(`Avec k lancers et 3 œufs, on couvre C(k, 1) + C(k, 2) + C(k, 3) étages : le premier lancer teste un étage tel que, s’il se brise, les 2 œufs restants et k − 1 lancers suffisent, et s’il tient, il reste 3 œufs et k − 1 lancers. Il faut couvrir ${q.floors} étages : ${n - 1} lancers couvrent ${f(n - 1)} étages, ${n} couvrent ${f(n)}. Réponse : ${n}.`, `With k drops and 3 eggs you cover C(k, 1) + C(k, 2) + C(k, 3) floors: the first drop tests a floor such that if it breaks, the 2 remaining eggs and k − 1 drops suffice, and if it holds, 3 eggs and k − 1 drops remain. You must cover ${q.floors} floors: ${n - 1} drops cover ${f(n - 1)} floors, ${n} cover ${f(n)}. Answer: ${n}.`);
  },
};

export const original = (q) => P(
`Décris une stratégie de lancers qui permet de trouver à coup sûr l’étage critique avec ${q.eggs} œufs et un immeuble de ${q.floors} étages, en faisant le moins de lancers possible dans le pire des cas. Explique pourquoi elle marche, puis pourquoi aucune autre stratégie ne ferait mieux.`,
`Describe a dropping strategy that is sure to find the critical floor with ${q.eggs} eggs and a ${q.floors}-floor building, using as few drops as possible in the worst case. Explain why it works, then why no other strategy could do better.`);

export const icon = svg(`<path d="M10 56h20V12H10zM10 24h20M10 36h20M10 48h20" stroke-width="2.4"/><ellipse class="ci-fall" cx="46" cy="14" rx="7" ry="9" ${soft}/><path d="M38 56h16" />`);
