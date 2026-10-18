// The gridpaths challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { gridPaths } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "gridpaths",
  type: "play",
  title: ["Les chemins du quadrillage", "Paths on a grid"],
  topic: ["Dénombrement", "Counting"],
  difficulty: 2,
  minutes: 10,
  hints: [],
  extension: ["Que devient le nombre de chemins s’il faut éviter un carrefour ? Et pour une grille en trois dimensions ?", "What happens to the number of paths if one crossing must be avoided? And for a three-dimensional grid?"],
};

export const variant = {
  params: [int("m", "Pas vers la droite", "Steps to the right", 2, 10, 6), int("n", "Pas vers le haut", "Steps up", 2, 10, 4)],
  answer: (q) => gridPaths(q.m, q.n),
  prompt: (q) => P(`Un quadrillage compte ${q.m} carrés en largeur et ${q.n} en hauteur. On va du coin en bas à gauche au coin en haut à droite en suivant les lignes du quadrillage, et en ne se déplaçant que d’un cran vers la droite ou d’un cran vers le haut. Combien de chemins différents y a-t-il ?`, `A grid is ${q.m} squares wide and ${q.n} squares high. You walk from the bottom-left corner to the top-right corner along the grid lines, moving only one step to the right or one step up. How many different paths are there?`),
  hints: (q) => [P(`Combien de pas faut-il en tout, et de quelles sortes ? Écris un chemin sous forme d’un mot de ${q.m + q.n} lettres D (droite) et H (haut).`, `How many steps are needed in all, and of which kinds? Write a path as a word of ${q.m + q.n} letters R (right) and U (up).`), P("Pour arriver à un point, on vient forcément de la gauche ou d’en dessous : le nombre de chemins vers un point est la somme des nombres de ses deux voisins. Reconnais-tu les nombres obtenus ?", "To reach a point you must come from the left or from below: the number of paths to a point is the sum of the numbers for its two neighbours. Do you recognise the numbers?")],
  solution: (q) => P(`Tout chemin comporte ${q.m} pas vers la droite et ${q.n} pas vers le haut, soit ${q.m + q.n} pas, et il est entièrement déterminé par la place des ${q.n} pas vers le haut parmi les ${q.m + q.n} : il y en a C(${q.m + q.n}, ${q.n}) = ${gridPaths(q.m, q.n)}. Autre point de vue : si on note N(i, j) le nombre de chemins vers le point (i, j), alors N(i, j) = N(i − 1, j) + N(i, j − 1), avec 1 sur les bords. Ce sont exactement les nombres du triangle de Pascal, lus le long des diagonales : C(i + j, j) = C(i + j − 1, j) + C(i + j − 1, j − 1).`, `Every path has ${q.m} steps to the right and ${q.n} steps up, that is ${q.m + q.n} steps, and it is entirely determined by where the ${q.n} up-steps sit among the ${q.m + q.n}: there are C(${q.m + q.n}, ${q.n}) = ${gridPaths(q.m, q.n)}. Another view: if N(i, j) is the number of paths to the point (i, j), then N(i, j) = N(i − 1, j) + N(i, j − 1), with 1 along the edges. These are exactly the numbers of Pascal’s triangle, read along the diagonals: C(i + j, j) = C(i + j − 1, j) + C(i + j − 1, j − 1).`),
};

export const original = () => P(
"Compte les chemins de deux façons différentes, puis explique pourquoi les deux méthodes donnent le même nombre.",
"Count the paths in two different ways, then explain why both methods give the same number.");

export const icon = svg(`<path d="M10 54h44M10 41h44M10 28h44M10 15h44M10 15v39M23 15v39M36 15v39M49 15v39" stroke-opacity=".3" stroke-width="1.8"/><path class="ci-draw" d="M10 54h13v-13h13v-13h13v-13" stroke-width="4"/>${dot(10, 54, 4)}${dot(49, 15, 4)}`);

export const hintActions = { 1: ["counts", "Afficher le nombre de chemins en chaque point", "Show the number of paths at every point"] };
