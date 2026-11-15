// The artgallery challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "artgallery",
  type: "olympiad",
  title: ["Le problème de la galerie d’art", "The art gallery problem"],
  topic: ["Géométrie", "Geometry"],
  difficulty: 3,
  minutes: 15,
  extension: ["Construis une galerie à 15 côtés qui exige 5 gardiens. Peut-on faire mieux avec des gardiens qui se déplacent le long d’un mur ?", "Build a 15-sided gallery that needs 5 guards. Can guards who patrol along a wall do better?"],
};

export const variant = {
  params: [int("n", "Nombre de côtés", "Number of sides", 6, 18, 12, 3)],
  answer: (q) => (q.n / 3),
  prompt: (q) => P(`Une galerie d’art est un polygone simple à ${3 * (q.n / 3)} côtés, pas forcément convexe. Un gardien immobile voit tout point qu’il peut joindre par un segment contenu dans la galerie. Quel est le plus petit nombre de gardiens qui suffit à surveiller toute galerie à ${3 * (q.n / 3)} côtés, quelle que soit sa forme ?`, `An art gallery is a simple polygon with ${3 * (q.n / 3)} sides, not necessarily convex. A guard standing still sees every point he can join by a segment lying inside the gallery. What is the smallest number of guards that is enough to watch every ${3 * (q.n / 3)}-sided gallery, whatever its shape?`),
  solution: (q) => P(`Quelle que soit la galerie à n côtés, on la découpe en n − 2 triangles avec des diagonales intérieures qui ne se coupent pas. On colorie les coins avec trois couleurs de façon que chaque triangle ait ses trois coins de trois couleurs différentes : on y arrive en ajoutant les triangles un par un, car un nouveau triangle touche déjà deux coins coloriés et reçoit pour son troisième coin la couleur restante. Une couleur sert au plus ⌊n/3⌋ fois, car les trois couleurs servent n fois en tout. Des gardiens posés sur les coins de cette couleur voient chaque triangle, donc toute la galerie. Pour n = ${3 * (q.n / 3)} : ${(q.n / 3)} gardiens suffisent. Ils sont nécessaires pour une galerie en forme de peigne à ${(q.n / 3)} dents : aucun point ne voit deux pointes à la fois, donc chaque dent exige son gardien.`, `Whatever the gallery with n sides, cut it into n − 2 triangles with inside diagonals that do not cross. Colour the corners with three colours so that every triangle has its three corners in three different colours: add the triangles one at a time, since a new triangle already touches two coloured corners and gets the remaining colour on its third corner. Some colour is used at most ⌊n/3⌋ times, because the three colours are used n times in all. Guards standing on the corners of that colour see every triangle, hence the whole gallery. For n = ${3 * (q.n / 3)}: ${(q.n / 3)} guards are enough. They are needed for a comb-shaped gallery with ${(q.n / 3)} teeth: no point sees two tips at once, so each tooth needs its own guard.`),
};

export const original = (q) => P(
`Trouve le plus petit nombre g de gardiens tel que toute galerie à ${q.n} côtés puisse être surveillée par g gardiens immobiles, et démontre-le en deux parties : une méthode qui fonctionne pour toute galerie, puis une galerie qui ne peut pas se contenter de moins de g gardiens. Explore des galeries de formes variées avant de conjecturer.`,
`Find the smallest number g of guards such that every gallery with ${q.n} sides can be watched by g fixed guards, and prove it in two parts: a method that works for every gallery, then a gallery that cannot do with fewer than g guards. Explore galleries of different shapes before you conjecture.`);

export const icon = svg(`<path d="M8 50V14l16 14 14-14 4 22 14 14z" stroke-linejoin="round"/><path class="ci-pulse" d="M24 40L8 14M24 40L38 14M24 40l30 10" stroke-width="1.8" stroke-dasharray="3 3"/>${dot(24, 40, 4.2, "ci-bob")}`);
