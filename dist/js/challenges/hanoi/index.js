// The hanoi challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "hanoi",
  type: "play",
  title: ["Les tours de Hanoï", "The Tower of Hanoi"],
  topic: ["Récurrence", "Recursion"],
  difficulty: 2,
  minutes: 10,
  hints: [["Commence avec 1, 2 puis 3 disques et note le nombre minimal de coups.", "Start with 1, 2 then 3 disks and note the minimum number of moves."], ["Pour bouger le plus grand disque, les autres doivent être ailleurs. Combien de coups pour les y mettre, puis pour les remettre dessus ?", "To move the largest disk, the others must be elsewhere. How many moves to put them there, then back on top?"]],
  extension: ["Démontre par récurrence que u(n) = 2^n − 1, puis montre que le plus petit disque bouge un coup sur deux.", "Prove by induction that u(n) = 2^n − 1, then show that the smallest disk moves every other move."],
};

export const variant = {
  params: [int("n", "Nombre de disques", "Number of disks", 2, 8, 6)],
  answer: (q) => 2 ** q.n - 1,
  prompt: (q) => P(`Trois tiges. ${q.n} disques de tailles différentes sont empilés sur la première, le plus grand en bas. À chaque coup, on déplace un seul disque, sans jamais le poser sur un disque plus petit. Quel est le plus petit nombre de coups pour transférer toute la pile sur une autre tige ?`, `Three pegs. ${q.n} disks of different sizes are stacked on the first, the largest at the bottom. Each move shifts one disk, never onto a smaller disk. What is the smallest number of moves needed to transfer the whole stack to another peg?`),
  solution: (q) => P(`Pour libérer le plus grand disque, il faut déplacer les n − 1 autres sur la tige intermédiaire, déplacer le grand disque, puis ramener les n − 1 dessus : u(n) = 2u(n − 1) + 1 avec u(1) = 1. On obtient u(n) = 2<sup>n</sup> − 1 : 1, 3, 7, 15, 31, 63, … Le grand disque doit bouger au moins une fois, ce qui rend cette stratégie optimale. Pour ${q.n} disques : ${2 ** q.n - 1} coups.`, `To free the largest disk, move the other n − 1 to the spare peg, move the large disk, then bring the n − 1 back on top: u(n) = 2u(n − 1) + 1 with u(1) = 1. This gives u(n) = 2<sup>n</sup> − 1: 1, 3, 7, 15, 31, 63, … The large disk must move at least once, which makes the strategy optimal. For ${q.n} disks: ${2 ** q.n - 1} moves.`),
};

export const original = (q) => P(
`Décris un algorithme qui transfère une pile de ${q.n} disques d’une tige à une autre en respectant les règles. Prouve qu’il est correct, puis prouve qu’aucun algorithme ne peut faire moins de coups.`,
`Describe an algorithm that moves a stack of ${q.n} disks from one peg to another within the rules. Prove it is correct, then prove that no algorithm can use fewer moves.`);

export const icon = svg(`<path d="M32 10v40M8 52h48"/><rect x="14" y="44" width="36" height="7" rx="3" ${soft}/><rect x="20" y="36" width="24" height="7" rx="3" ${soft}/><rect class="ci-bob" x="25" y="28" width="14" height="7" rx="3" fill="currentColor" fill-opacity=".5"/>`);
