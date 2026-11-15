// The cake challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { cakeCream, niceSide } from "./maths.js";
import { choice, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "cake",
  type: "olympiad",
  title: ["Le gâteau cubique à partager", "Sharing the cubic cake"],
  topic: ["Géométrie dans l’espace", "Solid geometry"],
  difficulty: 3,
  minutes: 12,
  extension: ["Le partage reste-t-il équitable si la crème couvre aussi le dessous ? Et pour un gâteau en forme de pavé droit à base carrée ?", "Does the sharing stay fair if the cream covers the bottom too? And for a square-based cuboid cake?"],
};

export const variant = {
  params: [choice("n", "Nombre de parts", "Number of portions", [[3, "3", "3"], [4, "4", "4"], [5, "5", "5"], [6, "6", "6"], [10, "10", "10"]], 5), choice("a", "Arête du gâteau", "Cake edge", [[30, "30 cm", "30 cm"], [60, "60 cm", "60 cm"]], 30)],
  answer: (q) => cakeCream(Number(q.a), Number(q.n)),
  prompt: (q) => P(`Un gâteau cubique de ${q.a} cm d’arête est recouvert de crème sur le dessus et sur ses quatre côtés (pas sur le dessous). On veut le partager en ${q.n} parts, par des coupes planes verticales, de sorte que toutes les parts aient le même volume de gâteau et la même surface de crème. Calcule la surface de crème de chaque part, en cm².`, `A cubic cake with ${q.a} cm edges is covered in cream on its top and its four sides (not the bottom). You want to share it into ${q.n} portions, with vertical plane cuts, so that every portion has the same volume of cake and the same surface of cream. Compute the surface of cream on each portion, in cm².`),
  solution: (q) => { const a = Number(q.a), n = Number(q.n); return P(`Marque sur le contour du dessus ${n} points régulièrement espacés, à ${(4 * a) / n} cm l’un de l’autre (on peut partir de n’importe où), et coupe verticalement du centre du dessus jusqu’à chacun de ces points. Chaque part a une croûte de même longueur ℓ = ${(4 * a) / n} cm. Le dessus d’une part se découpe en triangles de sommet le centre, dont la base est un morceau de côté et la hauteur a/2 = ${a / 2} cm : aire = ½ × ℓ × a/2, la même pour toutes les parts. Le volume vaut cette aire multipliée par la hauteur a. La crème des côtés vaut ℓ × a. Donc volume, crème du dessus et crème des côtés sont les mêmes pour toutes les parts. Crème totale : a² + 4a² = 5a² = ${5 * a * a} cm², donc ${(5 * a * a) / n} cm² par part.`, `Mark ${n} equally spaced points on the outline of the top, ${(4 * a) / n} cm apart (starting anywhere), and cut vertically from the centre of the top to each of these points. Every portion has the same length of crust ℓ = ${(4 * a) / n} cm. The top of a portion splits into triangles with their apex at the centre, whose base is a piece of side and whose height is a/2 = ${a / 2} cm: area = ½ × ℓ × a/2, the same for every portion. The volume is this area times the height a. The cream on the sides is ℓ × a. So volume, top cream and side cream are the same for all portions. Total cream: a² + 4a² = 5a² = ${5 * a * a} cm², hence ${(5 * a * a) / n} cm² per portion.`); },
};

export const original = (q) => P(
`Décris des coupes planes verticales qui partagent ce gâteau en ${q.n} parts ayant le même volume de gâteau et la même surface de crème, et démontre que c’est bien le cas.`,
`Describe vertical plane cuts that share this cake into ${q.n} portions with the same volume of cake and the same surface of cream, and prove that they do.`);

export const icon = svg(`<path d="M32 8l22 11v26L32 56 10 45V19z"/><path d="M10 19l22 11 22-11M32 30v26" stroke-opacity=".6"/><path class="ci-cut" d="M32 8l22 11-22 11-22-11z" ${soft}/>`);
