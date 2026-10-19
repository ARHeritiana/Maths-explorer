// The sum and product challenge: card text, variations (checked answer, statement, solution text), original question, emblem
// and hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { SP_BOUNDS, spSteps, spSolution, goodSums } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

export const card = {
  id: "sumproduct",
  type: "olympiad",
  title: ["La somme et le produit", "Sum and product"],
  topic: ["Logique, arithmétique", "Logic, arithmetic"],
  difficulty: 3,
  minutes: 25,
  hints: [],
  extension: ["Pour quelles bornes N le dialogue a-t-il une seule solution ? Que se passe-t-il si l’on autorise x = y ?", "For which bounds N does the dialogue have a single solution? What happens if x = y is allowed?"],
};

export const variant = {
  params: [choice("N", "Borne de la somme", "Bound on the sum", SP_BOUNDS.map((N) => [N, `x + y ≤ ${N}`, `x + y ≤ ${N}`]), 100)],
  answer: (q) => { const s = spSolution(q.N); return s ? s[0] * s[1] : 0; },
  prompt: (q) => P(
    `On choisit deux entiers x et y avec 1 < x < y et x + y ≤ ${q.N}. On donne leur somme à Sam et leur produit à Paula, et chacun sait ce que l’autre a reçu comme information. Paula : « Je ne connais pas les deux nombres. » Sam : « Je savais que tu ne les connaissais pas. » Paula : « Maintenant, je les connais. » Sam : « Maintenant, moi aussi. » Que vaut le produit x × y ? Réponds 0 si aucun couple ne convient.`,
    `Two whole numbers x and y are chosen with 1 < x < y and x + y ≤ ${q.N}. Sam is told their sum and Paula their product, and each knows what kind of information the other received. Paula: “I don’t know the two numbers.” Sam: “I knew you didn’t.” Paula: “Now I know them.” Sam: “Now I know them too.” What is the product x × y? Answer 0 if no pair works.`),
  hints: (q) => [
    P("Paula ne sait pas : son produit s’écrit de plusieurs façons. Sam savait qu’elle ne saurait pas : quelle que soit la façon d’écrire sa somme comme x + y, le produit est ambigu. Une somme paire peut-elle convenir (pense à Goldbach) ? Et une somme p + 2 avec p premier ?", "Paula doesn’t know: her product can be written in several ways. Sam knew she wouldn’t know: however his sum is split as x + y, the product is ambiguous. Can an even sum work (think of Goldbach)? And a sum p + 2 with p prime?"),
    P(`Les sommes possibles pour Sam après sa phrase sont ${goodSums(q.N).slice(0, 10).join(", ")}${goodSums(q.N).length > 10 ? "…" : ""}. Paula sait ensuite : parmi les décompositions de son produit, une seule a une somme de cette liste. Sam sait enfin : parmi les décompositions de sa somme, une seule a ce dernier statut.`, `The sums Sam can have after his sentence are ${goodSums(q.N).slice(0, 10).join(", ")}${goodSums(q.N).length > 10 ? "…" : ""}. Paula then knows: among the splits of her product, only one has a sum in that list. Sam finally knows: among the splits of his sum, only one has that property.`),
  ],
  solution: (q) => {
    const st = spSteps(q.N), s = spSolution(q.N), g = goodSums(q.N);
    const fr = `On teste les couples phrase par phrase. Il y a ${st[0].length} couples au départ. « Je ne les connais pas » garde les produits qui ont plusieurs décompositions (${st[1].length} couples). « Je savais que tu ne savais pas » garde les sommes dont toutes les décompositions ont un produit ambigu : ${g.length ? g.join(", ") : "aucune"} (${st[2].length} couples). « Maintenant je sais » garde les couples dont le produit n’a plus qu’une décomposition parmi ceux-là (${st[3].length} couples). « Moi aussi » garde ceux dont la somme n’a plus qu’une décomposition restante : ${st[4].length ? st[4].map((p) => `(${p.join(" ; ")})`).join(", ") : "aucun"}. `
      + (s ? `Le couple est (${s[0]} ; ${s[1]}) : produit ${s[0] * s[1]}. Les sommes paires sont exclues dès la deuxième phrase si l’on admet la conjecture de Goldbach, vérifiée bien au delà de ces bornes : une somme paire s’écrit p + q avec p, q premiers, et le produit pq ne se décompose pas autrement.` : `Aucun couple ne survit : avec cette borne, le dialogue est impossible, réponse 0.`);
    const en = `Test the pairs sentence by sentence. There are ${st[0].length} pairs at the start. “I don’t know them” keeps the products with several splits (${st[1].length} pairs). “I knew you didn’t” keeps the sums all of whose splits have an ambiguous product: ${g.length ? g.join(", ") : "none"} (${st[2].length} pairs). “Now I know” keeps the pairs whose product has a single split among those (${st[3].length} pairs). “Now me too” keeps those whose sum has a single remaining split: ${st[4].length ? st[4].map((p) => `(${p.join(", ")})`).join(", ") : "none"}. `
      + (s ? `The pair is (${s[0]}, ${s[1]}): product ${s[0] * s[1]}. Even sums are excluded by the second sentence (Goldbach’s conjecture, checked far beyond these bounds): an even sum is p + q with p, q prime, and pq has no other split.` : `No pair survives: with this bound the dialogue is impossible, answer 0.`);
    return P(fr, en);
  },
};

export const original = () => P(
  "Trouve les deux nombres et justifie chaque étape du dialogue. Pourquoi la borne sur la somme compte-t-elle ? Que se passe-t-il si on la change ?",
  "Find the two numbers and justify each step of the dialogue. Why does the bound on the sum matter? What happens if it changes?");

export const icon = svg(`<text x="10" y="30" font-size="20" font-weight="700" fill="currentColor" stroke="none">+</text><text x="34" y="30" font-size="20" font-weight="700" fill="currentColor" stroke="none">×</text><path d="M10 40h44" stroke-opacity=".3"/><path class="ci-draw" d="M14 52l8-6 8 4 8-8 10 4"/>${dot(48, 46, 2.6, "ci-blink")}`);

export const hintActions = {
  0: ["sums", "Montrer les sommes possibles pour Sam après sa phrase", "Show the sums Sam can have after his sentence"],
  1: ["filter", "Filtrer les couples phrase par phrase", "Filter the pairs sentence by sentence"],
};
