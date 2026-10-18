// The reflect challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { REFLECT_SETS, reflectSet, shortestVia, bestContact } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "reflect",
  type: "play",
  title: ["Le chemin le plus court par la rivière", "The shortest way via the river"],
  topic: ["Géométrie euclidienne", "Euclidean geometry"],
  difficulty: 2,
  minutes: 10,
  hints: [],
  extension: ["Que devient le problème si A et B sont de part et d’autre de la rivière ? Et s’il y a deux rivières perpendiculaires à traverser dans l’ordre ?", "What becomes of the problem if A and B are on opposite sides of the river? And with two perpendicular rivers to visit in order?"],
};

export const variant = {
  params: [choice("set", "Positions", "Positions", REFLECT_SETS.map((s) => { const [a, b, d] = reflectSet(s); return [s, `A à ${a} m, B à ${b} m, écart ${d} m`, `A ${a} m away, B ${b} m away, ${d} m apart`]; }), "1,2,4")],
  answer: (q) => { const [a, b, d] = reflectSet(q.set); return shortestVia(a, b, d); },
  prompt: (q) => { const [a, b, d] = reflectSet(q.set); return P(`Une rivière est rectiligne. Un randonneur part d’un point A situé à ${a} m de la rivière, doit puiser de l’eau en un point de la rivière, puis rejoindre sa tente en B, du même côté de la rivière, à ${b} m de celle-ci. Les pieds des perpendiculaires menées de A et de B à la rivière sont distants de ${d} m. Quelle est, en mètres, la longueur minimale de ce trajet A → rivière → B ?`, `A river is straight. A hiker starts at a point A ${a} m from the river, must fetch water at a point of the river, then reach the tent at B, on the same side of the river, ${b} m from it. The feet of the perpendiculars from A and from B to the river are ${d} m apart. What is the least length, in metres, of this trip A → river → B?`); },
  hints: (q) => [P("Si l’on place le point de puisage au hasard, la longueur est AX + XB. Essaie quelques positions pour sentir où se trouve le minimum.", "If the water point X is chosen at random the length is AX + XB. Try a few positions to feel where the minimum is."), P("Remplace B par son symétrique B′ par rapport à la rivière : XB = XB′. Que devient AX + XB′ ?", "Replace B by its mirror image B′ in the river: XB = XB′. What does AX + XB′ become?")],
  solution: (q) => { const [a, b, d] = reflectSet(q.set), L = shortestVia(a, b, d), x = bestContact(a, b, d); return P(`Soit B′ le symétrique de B par rapport à la rivière. Pour tout point X de la rivière, XB = XB′, donc AX + XB = AX + XB′ ≥ AB′, avec égalité exactement quand X est sur le segment AB′. Dans un repère où la rivière est l’axe des abscisses, A = (0 ; ${a}) et B′ = (${d} ; −${b}) : AB′ = √(${d}² + ${a + b}²) = √${d * d + (a + b) ** 2} = ${L} m. Le point de puisage est à ${Math.round(x * 100) / 100} m du pied de A. Au point X, les angles que font les deux parties du trajet avec la rivière sont égaux : c’est la loi de la réflexion de la lumière.`, `Let B′ be the mirror image of B in the river. For every point X of the river, XB = XB′, so AX + XB = AX + XB′ ≥ AB′, with equality exactly when X lies on the segment AB′. With the river as the x-axis, A = (0, ${a}) and B′ = (${d}, −${b}): AB′ = √(${d}² + ${a + b}²) = √${d * d + (a + b) ** 2} = ${L} m. The water point is ${Math.round(x * 100) / 100} m from the foot of A. At X, the two parts of the trip make equal angles with the river: this is the law of reflection of light.`); },
};

export const original = () => P(
"Où le randonneur doit-il puiser l’eau pour que son trajet de A à B, en passant par la rivière, soit le plus court possible ? Décris une construction à la règle et au compas, et démontre qu’elle donne le minimum.",
"Where should the hiker draw water so that the trip from A to B, touching the river, is as short as possible? Describe a construction with ruler and compass, and prove that it gives the minimum.");

export const icon = svg(`<path d="M32 6v52" stroke-dasharray="4 4" stroke-opacity=".6"/><path class="ci-draw" d="M12 48L32 24 52 48" stroke-width="3"/>${dot(12, 48, 4)}${dot(52, 48, 4)}${dot(32, 24, 3.4, "ci-pulse")}`);

export const hintActions = { 1: ["mirror", "Montrer B′, le symétrique de B", "Show B′, the mirror image of B", true] };
