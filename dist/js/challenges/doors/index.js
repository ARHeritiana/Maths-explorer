// The doors challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft, dot } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "doors",
  type: "play",
  title: ["Les 100 portes", "The 100 doors"],
  topic: ["Nombres entiers", "Whole numbers"],
  difficulty: 2,
  minutes: 10,
  hints: [["La porte n change d’état une fois par diviseur positif de n.", "Door n is toggled once for each positive divisor of n."], ["Les diviseurs se regroupent par paires d et n/d. Quand sont-ils égaux ?", "Divisors pair up as d and n/d. When are they equal?"]],
  extension: ["Combien de portes restent ouvertes s’il y en a N ? Explique pourquoi.", "How many remain open with N doors? Explain why."],
};

export const variant = {
  params: [int("n", "Nombre de portes", "Number of doors", 10, 200, 100)],
  answer: (q) => Math.floor(Math.sqrt(q.n)),
  prompt: (q) => P(`${q.n} portes sont fermées. Au passage k, on change l’état des portes dont le numéro est un multiple de k, pour k = 1 à ${q.n}. Combien restent ouvertes ?`, `${q.n} doors start closed. On pass k, toggle every door whose number is a multiple of k, for k = 1 to ${q.n}. How many doors remain open?`),
  solution: (q) => { const m = Math.floor(Math.sqrt(q.n)); return P(`Seuls les carrés parfaits ont un nombre impair de diviseurs : le diviseur √n se retrouve seul. Les portes 1², 2², …, ${m}² restent ouvertes, soit ${m} portes.`, `Only perfect squares have an odd number of divisors: √n is unpaired. Doors 1², 2², …, ${m}² remain open, so there are ${m}.`); },
};

export const original = (q) => P(
`Quelles portes sont ouvertes à la fin parmi les ${q.n} portes, et pourquoi celles-là ? Explique ce qui les distingue des autres, sans avoir à simuler les ${q.n} passages.`,
`Which of the ${q.n} doors are open at the end, and why those ones? Explain what sets them apart from the others, without simulating all ${q.n} passes.`);

export const icon = svg(`<rect x="6" y="14" width="14" height="38" rx="2"/><rect class="ci-door" x="25" y="14" width="14" height="38" rx="2" ${soft}/><rect x="44" y="14" width="14" height="38" rx="2"/>${dot(16, 33, 1.8)}${dot(41, 33, 1.8)}${dot(54.5, 33, 1.8)}`);

export const hintActions = { 0: ["divisors", "Écrire le nombre de diviseurs sur chaque porte", "Write the number of divisors on each door"] };
