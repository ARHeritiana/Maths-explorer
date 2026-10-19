// The cookies challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { sharings, code, NAMES } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

const people = (k) => NAMES.slice(0, k).join(", ");

export const card = {
  id: "cookies",
  type: "play",
  title: ["Dix biscuits pour cinq", "Ten cookies for five"],
  topic: ["Dénombrement", "Counting"],
  difficulty: 2,
  minutes: 12,
  hints: [],
  extension: ["Et si chacun ne peut pas recevoir plus de 3 biscuits ? Combien de solutions entières positives l’équation x + y + z + t = 20 a-t-elle ?", "What if nobody may receive more than 3 cookies? How many solutions in natural numbers does x + y + z + t = 20 have?"],
};

export const variant = {
  params: [
    int("n", "Nombre de biscuits", "Number of cookies", 3, 15, 10),
    int("k", "Nombre de personnes", "Number of people", 2, 6, 5),
    choice("rule", "Règle", "Rule", [["any", "Certains peuvent n’avoir rien", "Some may get nothing"], ["one", "Chacun en reçoit au moins un", "Everyone gets at least one"]], "any"),
  ],
  answer: (q) => sharings(q.n, q.k, q.rule === "one"),
  prompt: (q) => P(
    `On partage ${q.n} biscuits identiques entre ${q.k} personnes ${people(q.k)}, en donnant tous les biscuits. ${q.rule === "one" ? "Chacun doit en recevoir au moins un." : "Certains peuvent ne rien recevoir."} Seul compte le nombre de biscuits reçus par chacun. Combien de partages différents y a-t-il ?`,
    `${q.n} identical cookies are shared among ${q.k} people ${people(q.k)}, giving away every cookie. ${q.rule === "one" ? "Everyone must receive at least one." : "Some may receive nothing."} Only the number of cookies each person receives matters. How many different sharings are there?`),
  hints: (q) => [
    P("Commence avec moins de biscuits et moins de personnes : 3 biscuits pour 3 personnes, puis 4 biscuits. Comment écrire un partage de façon compacte ?", "Start with fewer cookies and fewer people: 3 cookies for 3 people, then 4 cookies. How can a sharing be written compactly?"),
    P(`Aligne les biscuits et place ${q.k - 1} séparateurs entre eux : ce qui est avant le premier séparateur va à A, etc. Que faut-il choisir pour décrire un partage ?`, `Line up the cookies and place ${q.k - 1} separators among them: what is before the first separator goes to A, and so on. What must be chosen to describe a sharing?`),
  ],
  solution: (q) => {
    const n = q.n, k = q.k, m = n + k - 1, v = sharings(n, k, q.rule === "one");
    // an example of a sharing and its row: 3 to A, nothing to B, the rest to C (two people: 3 and the rest)
    const ex = k >= 3 ? [3, 0, n - 3, ...Array(k - 3).fill(0)] : [3, n - 3];
    const gives = (fr) => ex.map((x, i) => `${x} ${fr ? "à" : "to"} ${NAMES[i]}`).join(", ");
    const free = P(`Écrivons un partage comme une rangée de ${n} biscuits ● et de ${k - 1} séparateur${k > 2 ? "s" : ""} | : les biscuits avant le premier séparateur vont à A, ceux qui suivent jusqu’au séparateur suivant à B, et ainsi de suite. Par exemple, ${code(ex)} donne ${gives(true)}. Chaque partage donne une seule rangée, et chaque rangée de ${n} ● et ${k - 1} | donne un seul partage : il y a autant de partages que de rangées. Une rangée a ${m} places, et elle est déterminée par les places des ${k - 1} séparateurs : C(${m}, ${k - 1}) = ${sharings(n, k)}.`,
      `Write a sharing as a row of ${n} cookies ● and ${k - 1} separator${k > 2 ? "s" : ""} |: the cookies before the first separator go to A, the following ones up to the next separator to B, and so on. For example, ${code(ex)} gives ${gives(false)}. Each sharing gives exactly one row, and each row of ${n} ● and ${k - 1} | gives exactly one sharing: there are as many sharings as rows. A row has ${m} places and is determined by the places of the ${k - 1} separators: C(${m}, ${k - 1}) = ${sharings(n, k)}.`);
    if (q.rule !== "one") return free;
    if (n < k) return P(`${free[0]} Mais ici chacun doit recevoir au moins un biscuit, et il y a moins de biscuits (${n}) que de personnes (${k}) : aucun partage ne convient. Réponse : 0.`, `${free[1]} But here everyone must receive at least one cookie, and there are fewer cookies (${n}) than people (${k}): no sharing works. Answer: 0.`);
    return P(`${free[0]} Ici chacun doit recevoir au moins un biscuit. Donnons d’abord un biscuit à chacun ; il reste ${n - k} biscuits à partager librement, d’où C(${n - k} + ${k - 1}, ${k - 1}) = C(${n - 1}, ${k - 1}) = ${v} partages. Autre lecture : les séparateurs vont dans les ${n - 1} espaces entre deux biscuits, au plus un par espace.`,
      `${free[1]} Here everyone must receive at least one cookie. First give one cookie to each person; ${n - k} cookies are left to share freely, hence C(${n - k} + ${k - 1}, ${k - 1}) = C(${n - 1}, ${k - 1}) = ${v} sharings. Another reading: the separators go into the ${n - 1} gaps between two cookies, at most one per gap.`);
  },
};

export const original = (q) => P(
  `De combien de façons peut-on partager ${q.n} biscuits identiques entre ${q.k} personnes nommées ? Trouve une méthode qui marche pour n biscuits et k personnes, et démontre qu’elle ne compte chaque partage qu’une fois. Que change la règle « chacun en reçoit au moins un » ?`,
  `In how many ways can ${q.n} identical cookies be shared among ${q.k} named people? Find a method that works for n cookies and k people, and prove that it counts each sharing exactly once. What does the rule “everyone gets at least one” change?`);

export const icon = svg(`<circle cx="18" cy="40" r="8" ${'fill="currentColor" fill-opacity=".22"'}/><circle cx="34" cy="40" r="8" ${'fill="currentColor" fill-opacity=".22"'}/><path d="M44 28v24" stroke-width="3.5"/><circle class="ci-bob" cx="54" cy="40" r="6"/>${dot(16, 38, 1.6)}${dot(20, 42, 1.6)}${dot(33, 37, 1.6)}${dot(36, 43, 1.6)}<path d="M10 22h44" stroke-opacity=".3"/>`);

export const hintActions = {
  0: ["code", "Écrire le partage affiché avec des ● et des |", "Write the sharing shown with ● and |"],
  1: ["places", "Numéroter les places de la rangée", "Number the places of the row"],
};
