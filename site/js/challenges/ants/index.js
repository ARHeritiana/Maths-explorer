// The ants challenge: card text, variations (checked answer, statement, written solution), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { longestTime } from "./maths.js";
export { activity } from "./activity.js";
export { diagram, scene } from "./solution.js";

export const card = {
  id: "ants",
  type: "play",
  title: P("Les fourmis tamponneuses", "The bumping ants"),
  topic: P("Mouvement", "Motion"),
  difficulty: 2,
  minutes: 12,
  extension: P("Et si le bâton est remplacé par un cercle, où les fourmis ne tombent jamais : au bout de combien de temps toutes les fourmis se retrouvent-elles à leur place de départ ?", "What if the stick is replaced by a circle, where the ants never fall: after how long are all the ants back at their starting places?"),
};

export const variant = {
  params: [int("L", "Longueur du bâton (cm)", "Length of the stick (cm)", 20, 200, 100, 10), int("n", "Nombre de fourmis", "Number of ants", 2, 12, 5)],
  answer: (q) => longestTime(q.L),
  prompt: (q) => P(
    `Un bâton mesure ${q.L} cm. On y pose ${q.n} fourmis, n’importe où (extrémités comprises), chacune tournée vers la gauche ou vers la droite. Elles avancent toutes à 1 cm par seconde. Quand deux fourmis se rencontrent, elles font demi-tour toutes les deux ; quand une fourmi atteint un bout du bâton, elle tombe. Au plus, combien de secondes faut-il attendre pour que toutes les fourmis soient tombées ?`,
    `A stick is ${q.L} cm long. ${q.n} ants are put on it, anywhere (ends included), each facing left or right. They all walk at 1 cm per second. When two ants meet, they both turn back; when an ant reaches an end of the stick, it falls off. At most, how many seconds must you wait until all the ants have fallen?`),
  solution: (q) => P(
    `Quand deux fourmis se rencontrent et font demi-tour, on ne voit pas la différence avec deux fourmis qui se croiseraient sans s’arrêter : à chaque instant, les places occupées sur le bâton sont les mêmes. On peut donc imaginer que chaque fourmi marche tout droit. Une fourmi qui marche tout droit quitte le bâton après au plus ${q.L} s, puisqu’elle parcourt au plus ${q.L} cm à 1 cm par seconde. Après ${q.L} s, il ne reste donc plus aucune fourmi. Et cette durée est atteinte : si une fourmi part d’un bout, tournée vers l’autre bout, la fourmi « tout droit » qui lui correspond parcourt tout le bâton, et le dernier départ du bâton a lieu exactement au bout de ${q.L} s. Réponse : ${q.L} secondes, quel que soit le nombre de fourmis.`,
    `When two ants meet and turn back, you cannot tell the difference from two ants passing through each other without stopping: at every moment, the places taken on the stick are the same. So we may imagine that each ant walks straight on. An ant walking straight on leaves the stick within ${q.L} s, since it walks at most ${q.L} cm at 1 cm per second. After ${q.L} s, no ant is left. And this time is reached: if an ant starts at one end, facing the other end, the matching "straight on" ant walks the whole stick, and the last ant leaves the stick exactly after ${q.L} s. Answer: ${q.L} seconds, whatever the number of ants.`),
};

export const original = (q) => P(
  `Des fourmis sont posées sur un bâton de ${q.L} cm et avancent à 1 cm par seconde ; deux fourmis qui se rencontrent font demi-tour, une fourmi qui atteint un bout tombe. Montre que toutes les fourmis finissent par tomber, et trouve la plus longue attente possible. Combien de rencontres peut-il y avoir, au plus, avec ${q.n} fourmis ?`,
  `Ants are put on a stick of ${q.L} cm and walk at 1 cm per second; two ants that meet turn back, an ant that reaches an end falls off. Show that all the ants end up falling, and find the longest possible wait. With ${q.n} ants, at most how many meetings can there be?`);

export const icon = svg(`<path d="M6 44h52" stroke-width="5"/><g class="ci-bob"><ellipse cx="20" cy="36" rx="6" ry="4.5" fill="currentColor" fill-opacity=".35"/><circle cx="28" cy="34" r="3.6" fill="currentColor" fill-opacity=".35"/><path d="M29 31q2-5 5-6"/></g><g class="ci-bob" style="--d:.4s"><ellipse cx="44" cy="36" rx="6" ry="4.5" fill="currentColor" fill-opacity=".35"/><circle cx="36" cy="34" r="3.6" fill="currentColor" fill-opacity=".35"/><path d="M35 31q-2-5-5-6"/></g>${dot(32, 22, 2.6, "ci-blink")}`);
