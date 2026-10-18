// The konigsberg challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
import { minRemoval, graphFor, describeBridges, degrees } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "konigsberg",
  type: "play",
  title: ["Les sept ponts de Königsberg", "The seven bridges of Königsberg"],
  topic: ["Graphes", "Graphs"],
  difficulty: 2,
  minutes: 10,
  hints: [["Pour chaque quartier, compte les ponts qui y arrivent.", "For each district, count the bridges that reach it."], ["Quand tu traverses un quartier, tu utilises deux ponts : un pour entrer, un pour sortir. Que peut-il se passer au départ et à l’arrivée ?", "Passing through a district uses two bridges: one in, one out. What can differ at the start and at the end?"]],
  extension: ["Quelle condition sur les degrés permet une promenade qui revient à son point de départ ?", "What condition on the degrees allows a walk that returns to its starting point?"],
};

export const variant = {
  params: [int("g", "Réseau n°", "Network no.", 0, 99, 0)],
  // A random variation draws one of the networks 1 to 98 (0 is Königsberg itself).
  random: (q, rnd) => { q.g = 1 + Math.floor(rnd() * 98); },
  answer: (q) => minRemoval(graphFor(q.g)).size,
  prompt: (q) => { const d = describeBridges(graphFor(q.g)); return P(`${d.fr}. Combien de ponts faut-il retirer, au minimum, pour qu’une promenade traverse chaque pont restant exactement une fois ?`, `${d.en}. What is the minimum number of bridges to remove so that a walk crosses every remaining bridge exactly once?`); },
  solution: (q) => {
    const g = graphFor(q.g), deg = degrees(g), odd = deg.filter((x) => x % 2).length, best = minRemoval(g), gone = [...best].map((i) => `${g.names[g.edges[i][0]]}${g.names[g.edges[i][1]]}`);
    const list = g.names.map((nm, i) => `${nm} ${deg[i]}`).join(", ");
    return P(`Nombre de ponts par quartier : ${list}. Il y a ${odd} quartier${odd > 1 ? "s" : ""} de degré impair. Un parcours qui traverse chaque pont une fois n’autorise que 0 ou 2 quartiers impairs (le départ et l’arrivée), car partout ailleurs les ponts vont par paires entrée et sortie, et il faut que le réseau reste connexe. ${best.size === 0 ? "Aucun pont à retirer." : `Retirer ${best.size} pont${best.size > 1 ? "s" : ""} (${gone.join(", ")}) suffit, et on ne peut pas faire moins : chaque retrait ne change que la parité de deux quartiers.`} Minimum : ${best.size}.`, `Bridges per district: ${list}. There ${odd === 1 ? "is" : "are"} ${odd} odd district${odd === 1 ? "" : "s"}. A route crossing every bridge once allows only 0 or 2 odd districts (the start and the end), since everywhere else bridges come in in-out pairs, and the network must stay connected. ${best.size === 0 ? "No bridge needs to go." : `Removing ${best.size} bridge${best.size > 1 ? "s" : ""} (${gone.join(", ")}) is enough, and fewer is impossible: each removal changes the parity of two districts only.`} Minimum: ${best.size}.`);
  },
};

export const original = () => P(
"Peut-on se promener dans la ville en traversant chaque pont exactement une fois, en choisissant librement le départ ? Justifie ta réponse par un argument général, pas par des essais. Si c’est impossible, quels ponts pourrait-on retirer ou ajouter pour que cela devienne possible ?",
"Can you walk through the city crossing every bridge exactly once, starting wherever you like? Justify your answer with a general argument, not by trial. If it is impossible, which bridges could be removed or added to make it possible?");

export const icon = svg(`<path d="M32 14c-14 4-14 32 0 36M32 14c14 4 14 32 0 36M14 32h36M32 14v-3M32 50v3" stroke-dasharray="3 0"/><circle cx="32" cy="14" r="5" fill="currentColor" fill-opacity=".5"/><circle cx="32" cy="50" r="5" fill="currentColor" fill-opacity=".5"/><circle cx="14" cy="32" r="5" fill="currentColor" fill-opacity=".5"/><circle cx="50" cy="32" r="5" fill="currentColor" fill-opacity=".5"/><path class="ci-trace" d="M14 32L32 14l18 18-18 18z" stroke-dasharray="14 100"/>`);

export const hintActions = { 0: ["degrees", "Afficher le nombre de ponts de chaque quartier", "Show the number of bridges at each district"] };
