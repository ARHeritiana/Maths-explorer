// The bridge challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { BRIDGE_SETS, bridgeBest, bridgeTimes, bridgePlans } from "./maths.js";
import { choice, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

export const card = {
  id: "bridge",
  type: "play",
  title: ["Quatre soldats sur un pont", "Four soldiers on a bridge"],
  topic: ["Optimisation", "Optimisation"],
  difficulty: 2,
  minutes: 10,
  hints: [],
  extension: ["Trouve des temps pour lesquels le plan 2 est meilleur que le plan 1, puis des temps pour lesquels ils sont à égalité.", "Find crossing times for which plan 2 beats plan 1, and times for which they tie."],
};

export const variant = {
  params: [choice("set", "Temps de traversée", "Crossing times", BRIDGE_SETS.map((s) => [s, `${s.split(",").join(", ")} min`, `${s.split(",").join(", ")} min`]), "1,2,5,10")],
  answer: (q) => bridgeBest(bridgeTimes(q.set)),
  prompt: (q) => { const [a, b, c, d] = bridgeTimes(q.set); return P(`Quatre soldats doivent traverser un pont de nuit. Ils n’ont qu’une lampe, indispensable à chaque traversée, et le pont ne porte que deux personnes à la fois, qui avancent à la vitesse du plus lent. Seuls, ils mettent ${a}, ${b}, ${c} et ${d} minutes. Quel est le temps minimum pour que les quatre soient de l’autre côté ?`, `Four soldiers must cross a bridge at night. They have only one lamp, needed for every crossing, and the bridge holds only two people at a time, who go at the pace of the slower one. Alone, they take ${a}, ${b}, ${c} and ${d} minutes. What is the least time for all four to be across?`); },
  hints: (q) => [P("Faire traverser le plus rapide avec chacun des autres n’est pas forcément optimal : les deux plus lents gagnent à traverser ensemble.", "Taking the fastest across with each of the others is not necessarily best: the two slowest gain by crossing together."), P("Compare deux plans : (1) les deux plus rapides traversent, le plus rapide revient, les deux plus lents traversent, le deuxième plus rapide revient, les deux plus rapides traversent ; (2) le plus rapide accompagne tour à tour chacun des trois autres.", "Compare two plans: (1) the two fastest cross, the fastest returns, the two slowest cross, the second fastest returns, the two fastest cross; (2) the fastest escorts each of the other three in turn.")],
  solution: (q) => { const t = bridgeTimes(q.set), [a, b, c, d] = t, p = bridgePlans(t), best = Math.min(p.A.total, p.B.total); return P(`Plan 1 (les deux plus rapides font le va-et-vient) : ${b} + ${a} + ${d} + ${b} + ${b} = ${p.A.total} minutes. Plan 2 (le plus rapide escorte chacun) : ${d} + ${a} + ${c} + ${a} + ${b} = ${p.B.total} minutes. Le meilleur est le plan ${p.A.total <= p.B.total ? 1 : 2} : ${best} minutes. Une recherche exhaustive de toutes les suites de traversées confirme qu’on ne peut pas faire mieux. L’idée à retenir : envoyer ensemble les deux plus lents, pour que leur lenteur ne se paie qu’une fois.`, `Plan 1 (the two fastest shuttle): ${b} + ${a} + ${d} + ${b} + ${b} = ${p.A.total} minutes. Plan 2 (the fastest escorts everyone): ${d} + ${a} + ${c} + ${a} + ${b} = ${p.B.total} minutes. The better one is plan ${p.A.total <= p.B.total ? 1 : 2}: ${best} minutes. An exhaustive search over all sequences of crossings confirms nothing does better. The idea to keep: send the two slowest together so that their slowness is paid only once.`); },
};

export const original = () => P(
"Décris la suite des traversées (qui passe, qui revient avec la lampe) qui permet aux quatre soldats de passer le plus vite possible. Comment peux-tu être sûr qu’aucune autre suite ne fait mieux ?",
"Describe the sequence of crossings (who goes, who brings the lamp back) that gets the four soldiers across as fast as possible. How can you be sure no other sequence does better?");

export const icon = svg(`<path d="M4 38h56M10 38c8-16 36-16 44 0"/><path d="M4 46h56" stroke-opacity=".4"/>${[0, 1, 2, 3].map((i) => `<circle class="ci-cross" style="--d:${i * 0.5}s" cx="10" cy="32" r="3.2" fill="currentColor" stroke="none"/>`).join("")}`);
