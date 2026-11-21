// The coffee challenge: card text, variations (checked answer, statement, written solution), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { CUPS, cupsOf, milkInCoffee, BEANS, isBeans, beansOf } from "./maths.js";
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
const beanLabel = ([N, k], lang) => (lang === "fr" ? `sacs de ${N} haricots, poignée de ${k}` : `sacks of ${N} beans, handful of ${k}`);

// The discrete version: two sacks of beans and a handful (owner, 21 November 2026).
const beanPrompt = ([N, k]) => P(
  `Un sac contient ${N} haricots blancs, un autre ${N} haricots rouges. On prend une poignée de ${k} haricots dans le sac des blancs et on la verse dans le sac des rouges, on secoue, puis on reprend une poignée de ${k} haricots dans le sac des rouges et on la verse dans le sac des blancs. Y a-t-il plus de haricots rouges dans le sac des blancs, ou plus de haricots blancs dans le sac des rouges ? Et si l’on choisit les haricots de la seconde poignée au lieu de les tirer au hasard ? Et après plusieurs allers-retours ?`,
  `One sack holds ${N} white beans, another ${N} red beans. We take a handful of ${k} beans from the white sack and pour it into the red sack, shake, then take a handful of ${k} beans from the red sack and pour it into the white sack. Are there more red beans in the white sack, or more white beans in the red sack? What if we choose the beans of the second handful instead of drawing them at random? And after several round trips?`);
const beanSolution = ([N, k]) => P(
  `Après l’aller-retour, chaque sac contient de nouveau ${N} haricots. Disons qu’il y a r haricots rouges dans le sac des blancs : ils occupent r places, donc il manque r haricots blancs dans ce sac. Ces r haricots blancs n’ont pas disparu : ils sont dans le sac des rouges. Il y a donc exactement autant de rouges chez les blancs que de blancs chez les rouges, quelle que soit la poignée qui revient, tirée au hasard ou choisie, et après n’importe quel nombre d’allers-retours (chaque sac garde ${N} haricots). Par exemple, si la poignée qui revient contient 1 haricot blanc et ${k - 1} rouges, chaque sac contient ${k - 1} haricots de l’autre couleur. Le café et le lait, c’est la même chose avec des grains infiniment petits.`,
  `After the round trip, each sack holds ${N} beans again. Say there are r red beans in the white sack: they take up r places, so r white beans are missing from that sack. Those r white beans have not vanished: they are in the red sack. So there are exactly as many red beans among the white as white beans among the red, whatever handful comes back, drawn at random or chosen, and after any number of round trips (each sack keeps ${N} beans). For instance, if the handful coming back holds 1 white bean and ${k - 1} red ones, each sack holds ${k - 1} beans of the other colour. Coffee and milk are the same thing with infinitely small grains.`);

export const variant = {
  params: [choice("cups", "Tasses ou sacs de haricots", "Mugs or sacks of beans", [...CUPS.map((s) => [s, label(cupsOf(s), "fr"), label(cupsOf(s), "en")]), ...BEANS.map((s) => [s, beanLabel(beansOf(s), "fr"), beanLabel(beansOf(s), "en")])], "200,50")],
  open: true,   // open challenge: more coffee in the milk or more milk in the coffee?; the site checks nothing
  // a fact used by the tests, not asked: mL of milk in the coffee; for the beans, the difference between the red beans
  // in the white sack and the white beans in the red sack, always 0
  answer: (q) => { if (isBeans(q.cups)) return 0; const [V, v] = cupsOf(q.cups); return Math.round(milkInCoffee(V, v)); },   // millilitres of milk in the coffee: a fact used by the tests, not asked
  prompt: (q) => { if (isBeans(q.cups)) return beanPrompt(beansOf(q.cups)); const [V, v] = cupsOf(q.cups); return P(
    `Une tasse contient ${V} mL de café, une autre ${V} mL de lait. On verse une cuillerée de ${v} mL de café dans le lait, on remue, puis on reverse une cuillerée de ${v} mL du mélange dans le café. Y a-t-il plus de café dans le lait, ou plus de lait dans le café ? Et si l’on ne remue pas ? Et après plusieurs allers-retours ?`,
    `One mug holds ${V} mL of coffee, another ${V} mL of milk. We pour a spoonful of ${v} mL of coffee into the milk, stir, then pour a spoonful of ${v} mL of the mixture back into the coffee. Is there more coffee in the milk, or more milk in the coffee? What if we do not stir? And after several round trips?`); },
  solution: (q) => { if (isBeans(q.cups)) return beanSolution(beansOf(q.cups)); const [V, v] = cupsOf(q.cups), a = Math.round(milkInCoffee(V, v)); return P(
    `Après l’aller-retour, chaque tasse contient de nouveau ${V} mL. Dans la tasse de café, il manque un peu de café, et la place est prise par exactement autant de lait. Ce café qui manque n’a pas disparu : il est dans la tasse de lait. Il y a donc autant de lait dans le café que de café dans le lait. Calculons le café dans le lait : la cuillerée de café en a apporté ${v} mL dans ${V + v} mL de mélange ; la cuillerée qui repart emporte la fraction ${v} ÷ ${V + v} du mélange, donc ${v} × ${v} ÷ ${V + v} mL de café. Il reste ${v} − ${v} × ${v} ÷ ${V + v} = ${V} × ${v} ÷ ${V + v} = ${a} mL de café dans le lait, et donc ${a} mL de lait dans le café. Le premier argument n’utilise ni le mélange ni le nombre de voyages : seulement que chaque tasse retrouve ${V} mL. Sans remuer, ou après plusieurs allers-retours, il y a donc toujours autant de lait dans le café que de café dans le lait.`,
    `After the round trip, each mug holds ${V} mL again. In the coffee mug, some coffee is missing, and its place is taken by exactly as much milk. The missing coffee has not vanished: it is in the milk mug. So there is as much milk in the coffee as coffee in the milk. Let us find the coffee in the milk: the spoonful of coffee brought ${v} mL of it into ${V + v} mL of mixture; the spoonful going back takes the fraction ${v} ÷ ${V + v} of the mixture, so ${v} × ${v} ÷ ${V + v} mL of coffee. That leaves ${v} − ${v} × ${v} ÷ ${V + v} = ${V} × ${v} ÷ ${V + v} = ${a} mL of coffee in the milk, and so ${a} mL of milk in the coffee. The first argument uses neither the stirring nor the number of trips: only that each mug is back to ${V} mL. Without stirring, or after several round trips, there is therefore always as much milk in the coffee as coffee in the milk.`); },
};

export const icon = svg(`<path d="M8 26h18l-2 26H10Z" fill="currentColor" fill-opacity=".45"/><path d="M38 26h18l-2 26H40Z" fill="currentColor" fill-opacity=".15"/><g class="ci-bob"><path d="M32 6v14"/><ellipse cx="32" cy="22" rx="4" ry="3" fill="currentColor"/></g>${dot(17, 20, 2.2, "ci-blink")}`);
