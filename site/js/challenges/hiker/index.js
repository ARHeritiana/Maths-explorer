// The hiker challenge: card text, variations (checked answer, statement, written solution), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { PAIRS, pairOf, meetMinutes, clock } from "./maths.js";
export { activity } from "./activity.js";
export { diagram, scene } from "./solution.js";

export const card = {
  id: "hiker",
  type: "olympiad",
  title: P("Le randonneur", "The hiker"),
  topic: P("Fonctions", "Functions"),
  difficulty: 2,
  minutes: 12,
  extension: P("S’il s’arrête pour pique-niquer, ou revient un moment sur ses pas, le résultat reste-t-il vrai ? Peut-il y avoir plusieurs endroits passés à la même heure les deux jours ?", "If he stops for a picnic, or walks back for a while, is the result still true? Can there be several places passed at the same time on both days?"),
};

const label = ([a, b], lang) => (lang === "fr" ? `montée ${a} h, descente ${b} h` : `up ${a} h, down ${b} h`);

export const variant = {
  params: [choice("pair", "Durées de la montée et de la descente", "Times up and down", PAIRS.map((s) => [s, label(pairOf(s), "fr"), label(pairOf(s), "en")]), "12,6")],
  answer: (q) => { const [T1, T2] = pairOf(q.pair); return meetMinutes(T1, T2); },
  prompt: (q) => { const [T1, T2] = pairOf(q.pair); return P(
    `Le jour 1, un randonneur part du pied de la montagne à 8 h 00 et monte au sommet à allure régulière ; il arrive ${T1} h plus tard. Le jour 2, il repart du sommet à 8 h 00 et redescend par le même sentier, à allure régulière ; il arrive en bas ${T2} h plus tard. À quelle heure passe-t-il au même endroit les deux jours ? Donne la réponse en minutes après 8 h 00.`,
    `On day 1, a hiker leaves the foot of the mountain at 08:00 and climbs to the top at a steady pace; he arrives ${T1} h later. On day 2, he leaves the top at 08:00 and comes down the same trail at a steady pace; he is down ${T2} h later. At what time is he at the same place on both days? Give the answer in minutes after 08:00.`); },
  solution: (q) => { const [T1, T2] = pairOf(q.pair), m = meetMinutes(T1, T2); return P(
    `Imaginons les deux journées le même jour : un randonneur part du pied à 8 h 00, un autre part du sommet à 8 h 00, sur le même sentier. Ils marchent l’un vers l’autre, donc ils se rencontrent ; à cet instant, notre randonneur passe au même endroit, à la même heure, les deux jours. Pour trouver l’heure, appelons h le nombre d’heures après 8 h 00. Le premier a parcouru la fraction h ÷ ${T1} du sentier, le second la fraction h ÷ ${T2}. Ils se rencontrent quand, à eux deux, ils ont parcouru tout le sentier : h ÷ ${T1} + h ÷ ${T2} = 1, donc h = ${T1} × ${T2} ÷ (${T1} + ${T2}) = ${String(T1 * T2 / (T1 + T2)).replace(".", ",")} h, soit ${m} minutes après 8 h 00 (${clock(m, "fr")}).`,
    `Picture both days on the same day: one hiker leaves the foot at 08:00, another leaves the top at 08:00, on the same trail. They walk towards each other, so they meet; at that moment, our hiker is at the same place, at the same time, on both days. To find the time, call h the number of hours after 08:00. The first has walked the fraction h ÷ ${T1} of the trail, the second the fraction h ÷ ${T2}. They meet when, together, they have walked the whole trail: h ÷ ${T1} + h ÷ ${T2} = 1, so h = ${T1} × ${T2} ÷ (${T1} + ${T2}) = ${T1 * T2 / (T1 + T2)} h, that is ${m} minutes after 08:00 (${clock(m, "en")}).`); },
};

export const original = () => P(
  "Le jour 1, un randonneur part du pied de la montagne à 8 h 00 et atteint le sommet à 20 h 00. Le jour 2, il part du sommet à 8 h 00 et redescend par le même sentier, arrivant en bas à 20 h 00. Son allure est quelconque les deux jours : il peut accélérer, s’arrêter, revenir sur ses pas. Montre qu’il existe un endroit du sentier par lequel il passe exactement à la même heure les deux jours.",
  "On day 1, a hiker leaves the foot of the mountain at 08:00 and reaches the top at 20:00. On day 2, he leaves the top at 08:00 and comes down the same trail, reaching the foot at 20:00. His pace is anything on both days: he may speed up, stop, walk back. Show that there is a place on the trail that he passes at exactly the same time on both days.");

export const icon = svg(`<path d="M4 54L30 14L60 54Z" fill="currentColor" fill-opacity=".18"/><path d="M12 50L22 44L16 38L28 32L24 26L32 18" stroke-dasharray="3 3"/><g class="ci-bob"><circle cx="22" cy="40" r="3.4" fill="currentColor"/></g>${dot(28, 30, 3, "ci-blink")}<circle cx="50" cy="14" r="5" fill="currentColor" fill-opacity=".35"/>`);
