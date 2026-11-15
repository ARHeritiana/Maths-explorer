// The horses challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
import { horseRaces } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "horses",
  type: "olympiad",
  title: ["Les 25 chevaux", "The 25 horses"],
  topic: ["Algorithmes", "Algorithms"],
  difficulty: 3,
  minutes: 15,
  extension: ["Cherche une méthode pour trouver les deux plus rapides, puis le classement complet. Combien de courses faut-il, au minimum, pour les ordonner tous ?", "Look for a method to find the two fastest, then the complete ranking. At least how many races are needed to order them all?"],
};

export const variant = {
  params: [choice("top", "On veut connaître", "We want to find", [[3, "les 3 plus rapides", "the 3 fastest"], [1, "le plus rapide", "the fastest"]], 3)],
  answer: (q) => horseRaces(q.top),
  prompt: (q) => P(`On a 25 chevaux, de vitesses toutes différentes et constantes, et pas de chronomètre : une course met en piste au plus 5 chevaux et ne donne que leur ordre d’arrivée. On veut trouver ${Number(q.top) === 3 ? "le plus rapide, le deuxième et le troisième" : "le plus rapide"}. Quel est le plus petit nombre de courses nécessaire ?`, `There are 25 horses, with different constant speeds, and no stopwatch: a race has at most 5 horses and only tells you their finishing order. You want to find ${Number(q.top) === 3 ? "the fastest, the second fastest and the third fastest" : "the fastest"}. What is the smallest number of races needed?`),
  solution: (q) => Number(q.top) === 3
    ? P("Courses 1 à 5 : cinq paquets de 5, chacun classé. Course 6 : les 5 vainqueurs ; on renomme les paquets A, B, C, D, E dans l’ordre d’arrivée de leurs vainqueurs. A1 est le plus rapide de tous : le premier est trouvé. Pour les places 2 et 3, il ne reste que 5 candidats : A2, A3, B1, B2, C1 (D et E ont déjà au moins 3 chevaux devant eux, tout comme B3, C2, C3 et les suivants). Course 7 : ces 5 candidats ; les deux premiers arrivés sont les 2e et 3e de l’ensemble. Total 7 courses, avec la méthode garantie pour tout ordre. Que 7 soit aussi un minimum est le résultat classique de ce problème (résultat admis).", "Races 1 to 5: five batches of 5, each ranked. Race 6: the 5 winners; rename the batches A, B, C, D, E in the order their winners finish. A1 is the fastest of all: the first place is found. For places 2 and 3 only 5 candidates remain: A2, A3, B1, B2, C1 (D and E, as well as B3, C2, C3 and below, already have at least 3 horses ahead of them). Race 7: these 5 candidates; the first two home are 2nd and 3rd overall. Total 7 races, guaranteed for every order. That 7 is also a minimum is the classical result for this problem (taken as known).")
    : P("Cinq courses de paquets, puis une course des 5 vainqueurs : le vainqueur de celle-ci est le plus rapide de tous, soit 6 courses. On ne peut pas faire mieux : 24 chevaux doivent perdre au moins une course, et une course de 5 chevaux fait au plus 4 perdants ; or 5 courses font au plus 20 perdants, donc il en faut au moins 6.", "Five batch races, then a race of the 5 winners: its winner is the fastest of all, which makes 6 races. One cannot do better: 24 horses must lose at least one race and a race of 5 horses creates at most 4 losers; 5 races create at most 20 losers, so at least 6 races are needed."),
};

export const original = (q) => P(
`Décris la suite de courses (quels chevaux courent ensemble, en fonction des résultats déjà connus) qui permet de trouver ${Number(q.top) === 3 ? "les trois plus rapides" : "le plus rapide"} avec le moins de courses possible. Justifie que ta méthode marche dans tous les cas, puis qu’on ne peut pas faire moins.`,
`Describe the sequence of races (which horses run together, depending on the results already known) that finds ${Number(q.top) === 3 ? "the three fastest" : "the fastest"} with as few races as possible. Justify that your method works in every case, then that fewer races cannot do it.`);

export const icon = svg([0, 1, 2, 3, 4].map((i) => `<path d="M8 ${14 + i * 9}h48" stroke-opacity=".3" stroke-width="2"/><circle class="ci-run" style="--d:${i * 0.35}s" cx="12" cy="${14 + i * 9}" r="3.4" fill="currentColor" stroke="none"/>`).join("") + `<path d="M56 10v44" stroke-width="2.4"/>`);
