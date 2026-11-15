// The jugs challenge: card text, variations (checked answer, statement, solution text), original question, emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { JUG_PRESETS, parseJugs, jugsSolve, jugsMin, gcd, moveText } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

export const card = {
  id: "jugs",
  type: "play",
  title: ["Quatre litres avec deux bidons", "Four litres with two jugs"],
  topic: ["Arithmétique", "Number theory"],
  difficulty: 2,
  minutes: 10,
  extension: ["Avec des bidons de a et b litres, quelles quantités peut-on mesurer ? Et avec trois bidons de 8, 5 et 3 litres, le premier plein, comment partager le vin en deux moitiés de 4 litres ?", "With jugs of a and b litres, which amounts can be measured? And with three jugs of 8, 5 and 3 litres, the first one full, how can the wine be split into two halves of 4 litres?"],
};

export const variant = {
  impossible: true,   // the answer can be "impossible": the shared answer form offers a neutral Impossible button (checks the answer 0)
  params: [{ ...choice("jugs", "Bidons et quantité visée", "Jugs and target amount", JUG_PRESETS.map((s) => { const [a, b, t] = parseJugs(s); return [s, `${a} L et ${b} L : ${t} L`, `${a} L and ${b} L: ${t} L`]; }), "3,5,4"),
    fields: [int('capacity1', 'Premier bidon (L)', 'First jug (L)', 1, 30, 3), int('capacity2', 'Second bidon (L)', 'Second jug (L)', 1, 30, 5), int('target', 'Quantité visée (L)', 'Target amount (L)', 1, 60, 4)] }],
  answer: (q) => { const [a, b, t] = parseJugs(q.jugs); return jugsMin(a, b, t); },
  prompt: (q) => { const [a, b, t] = parseJugs(q.jugs); return P(
    `On dispose d’un robinet, d’un évier et de deux bidons sans graduation, de ${a} L et de ${b} L. Une opération consiste à remplir un bidon au robinet, à le vider dans l’évier, ou à verser un bidon dans l’autre jusqu’à ce que le premier soit vide ou le second plein. Quel est le plus petit nombre d’opérations pour obtenir exactement ${t} L dans l’un des bidons ?`,
    `You have a tap, a sink and two unmarked jugs of ${a} L and ${b} L. One operation is to fill a jug at the tap, empty it into the sink, or pour one jug into the other until the first is empty or the second full. What is the smallest number of operations to get exactly ${t} L in one of the jugs?`); },
  solution: (q) => {
    const [a, b, t] = parseJugs(q.jugs), g = gcd(a, b), path = jugsSolve(a, b, t), big = Math.max(a, b);
    const inv = g > 1
      ? P(`Un état est le couple (x ; y) des litres contenus dans les bidons de ${a} L et ${b} L. Au départ ils sont vides ; remplir donne ${a} ou ${b} litres, vider donne 0, et transvaser ne fait que déplacer des litres. Les quantités obtenues sont donc des sommes et des différences de ${a} et de ${b}, toutes multiples de ${g}, le plus grand diviseur commun de ${a} et de ${b}.`,
          `A state is the pair (x, y) of litres in the ${a} L and ${b} L jugs. At the start they are empty; filling gives ${a} or ${b} litres, emptying gives 0, and pouring only moves litres around. So the amounts obtained are sums and differences of ${a} and ${b}, all multiples of ${g}, the greatest common divisor of ${a} and ${b}.`)
      : P(`Un état est le couple (x ; y) des litres contenus dans les bidons de ${a} L et ${b} L. Remplir donne ${a} ou ${b} litres, vider donne 0, et transvaser ne fait que déplacer des litres : aucune quantité entière n’est exclue d’avance, il faut seulement qu’elle tienne dans un bidon.`,
          `A state is the pair (x, y) of litres in the ${a} L and ${b} L jugs. Filling gives ${a} or ${b} litres, emptying gives 0, and pouring only moves litres around: no whole amount is ruled out in advance, it only has to fit in a jug.`);
    if (!path) {
      const why = t > big ? P(`De plus, ${t} L ne tient dans aucun des deux bidons. Réponse : 0.`, `Moreover, ${t} L fits in neither jug. Answer: 0.`) : P(`Or ${t} n’est pas un multiple de ${g} : on ne peut jamais avoir ${t} L dans un bidon. Réponse : 0.`, `But ${t} is not a multiple of ${g}: there can never be ${t} L in a jug. Answer: 0.`);
      return P(`${inv[0]} ${why[0]}`, `${inv[1]} ${why[1]}`);
    }
    const steps = (lang) => path.map((s, i) => `${i + 1}. ${moveText(s.move, a, b)[lang]} → (${s.state.join(lang ? ", " : " ; ")})`).join(lang ? "; " : " ; ");
    const ok = g > 1 ? P(`Ici ${t} est un multiple de ${g} et ne dépasse pas ${big}.`, `Here ${t} is a multiple of ${g} and does not exceed ${big}.`) : P(`Ici ${t} ne dépasse pas ${big}.`, `Here ${t} does not exceed ${big}.`);
    return P(`${inv[0]} ${ok[0]} En essayant toutes les suites d’opérations, de longueur 1, 2, 3…, on trouve que la plus courte en compte ${path.length} : ${steps(0)}. Aucune suite plus courte n’atteint ${t} L.`,
      `${inv[1]} ${ok[1]} Trying all sequences of operations, of length 1, 2, 3…, shows that the shortest has ${path.length}: ${steps(1)}. No shorter sequence reaches ${t} L.`);
  },
};

export const original = (q) => { const [a, b, t] = parseJugs(q.jugs); return P(
  `Avec deux bidons sans graduation de ${a} L et ${b} L, un robinet et un évier, comment obtenir exactement ${t} L ? Plus généralement, quelles quantités peut-on mesurer avec des bidons de a et b litres ? Démontre ta réponse.`,
  `With two unmarked jugs of ${a} L and ${b} L, a tap and a sink, how can you get exactly ${t} L? More generally, which amounts can be measured with jugs of a and b litres? Prove your answer.`); };

export const icon = svg(`<path d="M10 20h16v34H10z"/><path d="M34 12h20v42H34z"/><path d="M10 42h16v12H10z" fill="currentColor" fill-opacity=".3" stroke="none"/><path class="ci-bob" d="M34 30h20v24H34z" fill="currentColor" fill-opacity=".3" stroke="none"/><path d="M27 18c3-6 5-6 7-2" stroke-dasharray="3 3"/>${dot(44, 22, 2.6, "ci-blink")}`);
