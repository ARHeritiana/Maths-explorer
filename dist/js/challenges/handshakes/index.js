// The handshakes challenge: card text, variations (checked answer, statement, written solution), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { handshakes } from "./maths.js";
export { activity } from "./activity.js";
export { diagram, scene } from "./solution.js";

export const card = {
  id: "handshakes",                 // = folder name, lower case and hyphens
  type: "play",                 // "play" (Maths récréatives) or "olympiad" (Esprit olympiade)
  title: P("Poignées de main", "Handshakes"),
  topic: P("Dénombrement", "Counting"),
  difficulty: 1,                // 1, 2 or 3
  minutes: 8,
  extension: P("Et si chacun ne serre la main qu’à ses deux voisins de table, autour d’une table ronde ?", "What if each person shakes hands only with their two neighbours at a round table?"),
};

export const variant = {
  
  params: [int("n", "Nombre de personnes", "Number of people", 3, 30, 10)],
  answer: (q) => handshakes(q.n),   // an integer >= 0, from maths.js
  prompt: (q) => P(
    `${q.n} personnes se retrouvent. Chacune serre une fois la main de chacune des autres. Combien de poignées de main sont échangées en tout ?`,
    `${q.n} people meet. Each one shakes hands once with each of the others. How many handshakes take place in all?`),
  // the written solution ("Version écrite"): plain high-school wording, no jargon, no URLs or citations
  solution: (q) => P(
    `Chaque personne serre ${q.n - 1} mains, ce qui fait ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} mains serrées si l’on compte personne par personne. Mais chaque poignée de main relie deux personnes : elle a été comptée deux fois. Il y en a donc ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`,
    `Each person shakes ${q.n - 1} hands, which makes ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} hands shaken when counted person by person. But each handshake joins two people: it has been counted twice. So there are ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`),
};

// The original open question (proof, strategy or construction). It never states the answer or the method.
export const original = (q) => P(
  `${q.n} personnes se serrent toutes la main deux à deux. Combien de poignées de main ? Trouve une formule valable pour n personnes et justifie-la.`,
  `${q.n} people all shake hands in pairs. How many handshakes? Find a formula valid for n people and justify it.`);

// 64 × 64 emblem for the card, in currentColor; classes ci-bob, ci-blink, ci-pulse, ci-cross animate a part.
export const icon = svg(`<circle cx="32" cy="32" r="20" stroke-opacity=".3"/>${[0, 1, 2, 3, 4].map((k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5; return dot(32 + 20 * Math.cos(a), 32 + 20 * Math.sin(a), 4); }).join("")}<path d="M32 12L51 26M32 12L13 26" class="ci-blink"/>`);
