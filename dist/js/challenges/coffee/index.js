// The coffee challenge: card text, variations (checked answer, statement, written solution), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { CUPS, cupsOf, milkInCoffee } from "./maths.js";
export { activity } from "./activity.js";
export { diagram, scene } from "./solution.js";

export const card = {
  id: "coffee",
  type: "play",
  title: P("Café au lait, lait au café", "Coffee in milk, milk in coffee"),
  topic: P("Proportions", "Proportions"),
  difficulty: 1,
  minutes: 10,
  extension: P("Recommence l’aller-retour plusieurs fois : les deux quantités restent-elles égales ? Peut-on arriver exactement à deux tasses moitié café, moitié lait ?", "Repeat the round trip several times: do the two amounts stay equal? Can you end up with exactly two mugs of half coffee, half milk?"),
};

const label = ([V, v], lang) => (lang === "fr" ? `tasses de ${V} mL, cuillère de ${v} mL` : `${V} mL mugs, ${v} mL spoon`);

export const variant = {
  params: [choice("cups", "Tasses et cuillère", "Mugs and spoon", CUPS.map((s) => [s, label(cupsOf(s), "fr"), label(cupsOf(s), "en")]), "200,50")],
  answer: (q) => { const [V, v] = cupsOf(q.cups); return Math.round(milkInCoffee(V, v)); },
  prompt: (q) => { const [V, v] = cupsOf(q.cups); return P(
    `Une tasse contient ${V} mL de café, une autre ${V} mL de lait. On prend une cuillerée de ${v} mL de café, on la verse dans le lait et on remue bien. Puis on prend une cuillerée de ${v} mL de ce mélange et on la verse dans le café. Combien de millilitres de lait y a-t-il maintenant dans la tasse de café ?`,
    `One mug holds ${V} mL of coffee, another ${V} mL of milk. We take a spoonful of ${v} mL of coffee, pour it into the milk and stir well. Then we take a spoonful of ${v} mL of this mixture and pour it into the coffee. How many millilitres of milk are now in the coffee mug?`); },
  solution: (q) => { const [V, v] = cupsOf(q.cups), a = Math.round(milkInCoffee(V, v)); return P(
    `Après l’aller-retour, chaque tasse contient de nouveau ${V} mL. Dans la tasse de café, il manque un peu de café, et la place est prise par exactement autant de lait. Ce café qui manque n’a pas disparu : il est dans la tasse de lait. Il y a donc autant de lait dans le café que de café dans le lait. Calculons le café dans le lait : la cuillerée de café en a apporté ${v} mL dans ${V + v} mL de mélange ; la cuillerée qui repart emporte la fraction ${v} ÷ ${V + v} du mélange, donc ${v} × ${v} ÷ ${V + v} mL de café. Il reste ${v} − ${v} × ${v} ÷ ${V + v} = ${V} × ${v} ÷ ${V + v} = ${a} mL de café dans le lait, et donc ${a} mL de lait dans le café.`,
    `After the round trip, each mug holds ${V} mL again. In the coffee mug, some coffee is missing, and its place is taken by exactly as much milk. The missing coffee has not vanished: it is in the milk mug. So there is as much milk in the coffee as coffee in the milk. Let us find the coffee in the milk: the spoonful of coffee brought ${v} mL of it into ${V + v} mL of mixture; the spoonful going back takes the fraction ${v} ÷ ${V + v} of the mixture, so ${v} × ${v} ÷ ${V + v} mL of coffee. That leaves ${v} − ${v} × ${v} ÷ ${V + v} = ${V} × ${v} ÷ ${V + v} = ${a} mL of coffee in the milk, and so ${a} mL of milk in the coffee.`); },
};

export const original = () => P(
  "On a une tasse de café et une tasse de lait, de même volume. On verse une cuillerée de café dans le lait, on remue, puis on reverse une cuillerée du mélange dans le café. Y a-t-il plus de café dans le lait, ou plus de lait dans le café ? Et si l’on ne remue pas ? Et après plusieurs allers-retours ?",
  "We have a mug of coffee and a mug of milk, of the same volume. We pour a spoonful of coffee into the milk, stir, then pour a spoonful of the mixture back into the coffee. Is there more coffee in the milk, or more milk in the coffee? What if we do not stir? And after several round trips?");

export const icon = svg(`<path d="M8 26h18l-2 26H10Z" fill="currentColor" fill-opacity=".45"/><path d="M38 26h18l-2 26H40Z" fill="currentColor" fill-opacity=".15"/><g class="ci-bob"><path d="M32 6v14"/><ellipse cx="32" cy="22" rx="4" ry="3" fill="currentColor"/></g>${dot(17, 20, 2.2, "ci-blink")}`);
