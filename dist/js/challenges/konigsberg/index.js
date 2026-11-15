// The konigsberg challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { minRemoval, graphFor, degrees } from "./maths.js";
import { cityFor } from "./plan.js";
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
  extension: ["Quelle condition sur le nombre de ponts de chaque quartier permet une promenade qui revient à son point de départ ?", "What condition on the number of bridges of each district allows a walk that returns to its starting point?"],
};

const plural = (k, one, many) => `${k} ${k > 1 ? many : one}`;
const QUESTION = P("Combien de ponts faut-il retirer, au minimum, pour qu’une promenade traverse chaque pont restant exactement une fois ?", "What is the minimum number of bridges to remove so that a walk crosses every remaining bridge exactly once?");

// What the map shows, in plain words: never the list of which bridge joins which districts (seeing it is the puzzle).
export function townWords(g) {
  const graph = graphFor(g), n = graph.names.length, m = graph.edges.length;
  if (g === 0) return P(`Le plan montre Königsberg en 1736 : la rivière Pregel entoure l’île du Kneiphof (A), puis se partage en deux bras de part et d’autre d’un quartier à l’est (D) ; au nord et au sud s’étendent les deux rives (B et C). Ces ${n} quartiers sont reliés par ${m} ponts.`, `The map shows Königsberg in 1736: the river Pregel flows round the Kneiphof island (A), then splits into two branches on either side of an eastern district (D); the two banks (B and C) lie to the north and the south. These ${n} districts are joined by ${m} bridges.`);
  const k = cityFor(g).islands.length, banks = n - k;
  const fr = k ? `${plural(banks, "rive", "rives")} et ${plural(k, "île", "îles")}` : "tous touchant le bord du plan", en = k ? `${plural(banks, "bank", "banks")} and ${plural(k, "island", "islands")}` : "all reaching the edge of the map";
  return P(`Le plan montre une ville coupée par des bras de rivière : ${n} quartiers (${fr}), notés ${graph.names.join(", ")}, reliés par ${m} ponts.`, `The map shows a town cut by arms of a river: ${n} districts (${en}), named ${graph.names.join(", ")}, joined by ${m} bridges.`);
}

export const variant = {
  params: [int("g", "Réseau n°", "Network no.", 0, 99, 0)],
  // A random variation draws one of the networks 1 to 98 (0 is Königsberg itself).
  random: (q, rnd) => { q.g = 1 + Math.floor(rnd() * 98); },
  answer: (q) => minRemoval(graphFor(q.g)).size,
  prompt: (q) => { const w = townWords(q.g); return P(`${w[0]} ${QUESTION[0]}`, `${w[1]} ${QUESTION[1]}`); },
  solution: (q) => {
    const g = graphFor(q.g), deg = degrees(g), odd = deg.filter((x) => x % 2).length, best = minRemoval(g), low = Math.max(0, (odd - 2) / 2);
    const gone = [...best].map((i) => `${g.names[g.edges[i][0]]}-${g.names[g.edges[i][1]]}`).join(", "), list = g.names.map((nm, i) => `${nm} ${deg[i]}`).join(", ");
    const fr = [
      "Seul compte quel pont relie quels quartiers : on peut réduire chaque quartier à un point et chaque pont à un trait entre deux points.",
      `Nombre de ponts de chaque quartier : ${list}. ${odd ? `${plural(odd, "quartier en a", "quartiers en ont")} un nombre impair.` : "Tous ces nombres sont pairs."}`,
      "Pendant la promenade, chaque passage par un quartier utilise deux ponts : un pour entrer, un pour sortir. Seuls le départ et l’arrivée peuvent utiliser un pont sans partenaire.",
      "Une promenade qui traverse chaque pont une fois exige donc 0 ou 2 quartiers avec un nombre impair de ponts, et il faut aussi pouvoir aller, par les ponts qui restent, de chaque quartier qui garde un pont à chaque autre.",
      best.size === 0 ? "Ici ces conditions sont déjà remplies : aucun pont à retirer."
        : `Retirer un pont enlève un pont à deux quartiers seulement, donc fait disparaître au plus deux quartiers impairs : il faut retirer au moins ${plural(low, "pont", "ponts")}.${best.size > low ? ` Ici, toute façon de retirer seulement ${plural(low, "pont", "ponts")} laisse trop de quartiers impairs ou coupe la ville en morceaux séparés.` : ""} Retirer ${best.size > 1 ? "les ponts" : "le pont"} ${gone} suffit.`,
      `Minimum : ${best.size}.`,
    ];
    const en = [
      "All that matters is which bridge joins which districts: each district can shrink to a point and each bridge to a line between two points.",
      `Bridges of each district: ${list}. ${odd ? `${odd} district${odd > 1 ? "s have" : " has"} an odd number.` : "All these numbers are even."}`,
      "During the walk, each pass through a district uses two bridges: one in, one out. Only the start and the end can use a bridge without a partner.",
      "So a walk crossing every bridge once needs 0 or 2 districts with an odd number of bridges, and every district that keeps a bridge must still be reachable from every other over the remaining bridges.",
      best.size === 0 ? "Here these conditions already hold: no bridge needs to go."
        : `Removing a bridge takes one bridge away from two districts only, so it clears at most two odd districts: at least ${plural(low, "bridge", "bridges")} must go.${best.size > low ? ` Here, every way of removing only ${plural(low, "bridge", "bridges")} leaves too many odd districts or cuts the town into separate pieces.` : ""} Removing ${best.size > 1 ? "the bridges" : "the bridge"} ${gone} is enough.`,
      `Minimum: ${best.size}.`,
    ];
    return P(fr.join(" "), en.join(" "));
  },
};

export const original = () => P(
"À Königsberg, en 1736, la rivière Pregel entoure une île, le Kneiphof, puis se partage en deux bras ; sept ponts relient l’île, la rive nord, la rive sud et le quartier situé entre les deux bras. Peut-on se promener dans la ville en traversant chaque pont exactement une fois, en choisissant librement le départ ? Justifie ta réponse par un argument général, pas par des essais. Si c’est impossible, quels ponts pourrait-on retirer ou ajouter pour que cela devienne possible ?",
"In Königsberg, in 1736, the river Pregel flows round an island, the Kneiphof, then splits into two branches; seven bridges join the island, the north bank, the south bank and the district between the two branches. Can you walk through the town crossing every bridge exactly once, starting wherever you like? Justify your answer with a general argument, not by trial. If it is impossible, which bridges could be removed or added to make it possible?");

// emblem: a river round an island, crossed by wooden bridges
export const icon = svg(`<path d="M4 22c12-4 22 2 30 0s18-4 26-2M4 44c12 4 22-2 30 0s18 4 26 2"/><ellipse cx="30" cy="33" rx="12" ry="6" ${soft}/><path class="ci-trace" d="M24 27v-6M36 27v-6M24 39v6M36 39v6M42 33h10" stroke-width="4" stroke-dasharray="14 100"/>`);
