// The box challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { BOX_SETS, boxPath, boxSet, boxUnfoldings } from "./maths.js";
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "box",
  type: "play",
  title: ["La fourmi sur la boîte", "The ant on the box"],
  topic: ["Géométrie dans l’espace", "Solid geometry"],
  difficulty: 3,
  minutes: 12,
  hints: [],
  extension: ["Et si la fourmi va d’un coin au milieu d’une arête opposée ? Et sur un cube ?", "And if the ant goes from a corner to the middle of an opposite edge? And on a cube?"],
};

export const variant = {
  params: [choice("set", "Dimensions", "Dimensions", BOX_SETS.map((s) => [s, `${s.split(",").join(" × ")} cm`, `${s.split(",").join(" × ")} cm`]), "1,2,4")],
  answer: (q) => boxPath(...boxSet(q.set)),
  prompt: (q) => { const [a, b, c] = boxSet(q.set); return P(`Une fourmi est sur un coin d’une boîte en forme de pavé droit de dimensions ${a} cm × ${b} cm × ${c} cm. Elle veut rejoindre le coin opposé, en marchant uniquement sur la surface de la boîte. Quelle est la longueur du plus court trajet, en cm ?`, `An ant sits at a corner of a box shaped like a cuboid of ${a} cm × ${b} cm × ${c} cm. It wants to reach the opposite corner, walking only on the surface of the box. What is the length of the shortest route, in cm?`); },
  hints: () => [P("Une surface peut se mettre à plat. Le bouton ci-dessous déplie deux faces voisines : que devient un trajet de S à T une fois à plat, et par quel point de l’arête commune passe-t-il ?", "A surface can be laid flat. The button below unfolds two neighbouring faces: what does a route from S to T become once flat, and which point of the shared edge does it go through?"), P("Sur un plan, quel est le plus court chemin entre deux points ? Le bouton trace ce segment ; pense au théorème de Pythagore, puis essaie les autres paires de faces.", "In a plane, what is the shortest path between two points? The button draws that segment; think of Pythagoras’ theorem, then try the other pairs of faces.")],
  solution: (q) => { const [a, b, c] = boxSet(q.set), u = boxUnfoldings(a, b, c), best = Math.min(...u.map((x) => x.length)); return P(`On déplie deux faces voisines en un rectangle : le plus court chemin y est un segment de droite, de longueur √((x + y)² + z²) où {x, y, z} = {${a}, ${b}, ${c}}. Trois dépliages : ${u.map((x) => `√((${x.cross[0]} + ${x.cross[1]})² + ${x.height}²) = √${(x.cross[0] + x.cross[1]) ** 2 + x.height ** 2}`).join(" ; ")}. Le plus petit est ${best} cm. (Un trajet sur trois faces ou plus est plus long ; les deux plus petites dimensions s’additionnent, la plus grande reste seule.)`, `Unfold two neighbouring faces into a rectangle: the shortest path there is a straight segment of length √((x + y)² + z²) where {x, y, z} = {${a}, ${b}, ${c}}. Three unfoldings: ${u.map((x) => `√((${x.cross[0]} + ${x.cross[1]})² + ${x.height}²) = √${(x.cross[0] + x.cross[1]) ** 2 + x.height ** 2}`).join("; ")}. The smallest is ${best} cm. (A route over three or more faces is longer; the two smaller dimensions add up, the largest stands alone.)`); },
};

export const original = () => P(
"Décris comment trouver le plus court chemin, sur la surface d’une boîte en forme de pavé droit, entre deux coins opposés, et justifie que ton chemin est bien le plus court de tous ceux qui existent.",
"Describe how to find the shortest path, on the surface of a box shaped like a rectangular block, between two opposite corners, and justify that your path is the shortest of all possible ones.");

export const icon = svg(`<path d="M10 22l18-8h26v28l-18 8H10z"/><path d="M10 22h26l18-8M36 22v28" stroke-opacity=".6"/><path class="ci-draw" d="M14 46L36 22l18-8" stroke-width="3.4"/>${dot(14, 46, 3.6)}${dot(54, 14, 3.6)}`);

export const hintActions = { 0: ["net", "Mettre deux faces à plat", "Lay two faces flat"], 1: ["line", "Tracer le segment droit", "Draw the straight segment"] };
