// The snail challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
import { snailDays, snailDown } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "snail",
  type: "play",
  title: ["L’escargot et le poteau", "The snail on the post"],
  topic: ["Suites arithmétiques", "Arithmetic sequences"],
  difficulty: 1,
  minutes: 6,
  hints: [],
  extension: ["Que se passe-t-il si l’escargot glisse autant qu’il monte ? Et s’il glisse davantage ?", "What happens if the snail slips as much as it climbs? Or more?"],
};

export const variant = {
  params: [int("h", "Hauteur du poteau (m)", "Height of the post (m)", 5, 50, 10), int("up", "Montée de jour (m)", "Daytime climb (m)", 2, 5, 3), int("down", "Glissade de nuit (m)", "Night slip (m)", 1, 4, 2)],
  answer: (q) => snailDays(q.h, q.up, q.down),
  prompt: (q) => { const d = snailDown(q.up, q.down); return P(`Un escargot veut atteindre le sommet d’un poteau de ${q.h} m. Chaque jour il monte de ${q.up} m ; chaque nuit il glisse de ${d} m. Pendant quel jour (numéroté à partir de 1) atteint-il le sommet ?`, `A snail wants to reach the top of a ${q.h} m post. Each day it climbs ${q.up} m; each night it slips back ${d} m. During which day (numbered from 1) does it reach the top?`); },
  hints: (q) => [P("Pendant les premiers jours, de combien le niveau du matin avance-t-il d’un jour à l’autre ?", "During the first days, by how much does the morning level move from one day to the next?"), P("Le dernier jour, l’escargot n’a pas le temps de glisser : il suffit qu’au début de ce jour-là il soit à moins d’une montée du sommet.", "On the last day the snail has no time to slip: it is enough that at the start of that day it is within one climb of the top.")],
  solution: (q) => { const d = snailDown(q.up, q.down), days = snailDays(q.h, q.up, q.down), g = q.up - d; return q.h <= q.up
    ? P(`Dès le premier jour l’escargot monte de ${q.up} m, ce qui suffit pour les ${q.h} m : réponse 1.`, `On the very first day the snail climbs ${q.up} m, which is enough for ${q.h} m: answer 1.`)
    : P(`Un jour complet (montée puis glissade) fait gagner ${q.up} − ${d} = ${g} m. Le dernier jour, il atteint le sommet sans glisser. Il doit donc commencer ce jour à une hauteur au moins égale à ${q.h} − ${q.up} = ${q.h - q.up} m, ce qui demande ⌈${q.h - q.up}/${g}⌉ = ${Math.ceil((q.h - q.up) / g)} jour${Math.ceil((q.h - q.up) / g) > 1 ? "s" : ""} complet${Math.ceil((q.h - q.up) / g) > 1 ? "s" : ""}. Il arrive donc au sommet le jour ${Math.ceil((q.h - q.up) / g)} + 1 = ${days}. ${Math.ceil(q.h / g) !== days ? `(L’erreur classique est de répondre ${Math.ceil(q.h / g)}, qui oublie que le dernier jour il ne glisse pas.)` : ""}`, `A full day (climb then slip) gains ${q.up} − ${d} = ${g} m. On the last day it reaches the top without slipping. So it must start that day at a height of at least ${q.h} − ${q.up} = ${q.h - q.up} m, which takes ⌈${q.h - q.up}/${g}⌉ = ${Math.ceil((q.h - q.up) / g)} full day${Math.ceil((q.h - q.up) / g) > 1 ? "s" : ""}. It reaches the top on day ${Math.ceil((q.h - q.up) / g)} + 1 = ${days}. ${Math.ceil(q.h / g) !== days ? `(The classic mistake is to answer ${Math.ceil(q.h / g)}, forgetting that on the last day it does not slip.)` : ""}`); },
};

export const original = () => P(
"Explique ton raisonnement, puis trouve une règle qui donne le jour d’arrivée de l’escargot quelle que soit la hauteur du poteau.",
"Explain your reasoning, then find a rule that gives the snail's day of arrival whatever the height of the pole.");

export const icon = svg(`<path d="M50 10v46" stroke-width="2.4"/><path d="M6 56h50" /><path class="ci-draw" d="M10 52c0-14 14-14 14-6s-8 6-8 0 8-9 14-3 14 4 12-14" stroke-width="3.2"/><circle class="ci-climb" cx="50" cy="52" r="4" fill="currentColor" stroke="none"/>`);
