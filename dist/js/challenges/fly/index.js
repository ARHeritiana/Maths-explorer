// The fly challenge: card text, variations (checked answer, statement, solution text), original question, emblem and hint
// actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { FLY_PRESETS, parseFly, meetTime, flyDistance, legs } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

const num = (x, fr) => { const s = String(Math.round(x * 100) / 100); return fr ? s.replace(".", ",") : s; };

export const card = {
  id: "fly",
  type: "play",
  title: ["La mouche et les deux trains", "The fly and the two trains"],
  topic: ["Vitesses, séries", "Speeds, series"],
  difficulty: 1,
  minutes: 8,
  hints: [],
  extension: ["Combien d’allers et retours la mouche fait-elle ? Calcule les longueurs des premiers trajets : quelle suite forment-elles, et quelle est leur somme ?", "How many trips does the fly make? Compute the lengths of the first legs: what sequence do they form, and what is their sum?"],
};

export const variant = {
  params: [choice("trip", "Distance et vitesses", "Distance and speeds", FLY_PRESETS.map((s) => { const [D, v1, v2, w] = parseFly(s); return [s, `${D} km ; ${v1} et ${v2} km/h ; mouche ${w} km/h`, `${D} km; ${v1} and ${v2} km/h; fly ${w} km/h`]; }), "200,50,50,75")],
  answer: (q) => { const [D, v1, v2, w] = parseFly(q.trip); return flyDistance(D, v1, v2, w); },
  prompt: (q) => { const [D, v1, v2, w] = parseFly(q.trip); return P(
    `Deux trains, à ${D} km l’un de l’autre sur la même voie, roulent l’un vers l’autre, à ${v1} km/h et à ${v2} km/h. Une mouche part de l’avant du premier train à ${w} km/h vers le second ; dès qu’elle le touche, elle fait demi-tour vers le premier, et ainsi de suite, jusqu’à ce que les trains se rencontrent. Quelle distance, en km, la mouche a-t-elle parcourue en tout ?`,
    `Two trains ${D} km apart on the same track drive towards each other at ${v1} km/h and ${v2} km/h. A fly leaves the front of the first train at ${w} km/h towards the second; as soon as it touches it, it turns back towards the first, and so on, until the trains meet. What distance, in km, has the fly covered in all?`); },
  hints: () => [
    P("Ne suis pas la mouche trajet par trajet : il y en a une infinité. Que vaut le temps total pendant lequel elle vole ?", "Do not follow the fly leg by leg: there are infinitely many. How long does it fly in total?"),
    P("Les trains se rapprochent à la somme de leurs vitesses. Quand se rencontrent-ils ? La mouche vole à vitesse constante pendant tout ce temps.", "The trains close in at the sum of their speeds. When do they meet? The fly flies at constant speed all that time."),
  ],
  solution: (q) => { const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), d = flyDistance(D, v1, v2, w), L = legs(D, v1, v2, w);
    return P(
      `Les trains se rapprochent de ${v1} + ${v2} = ${v1 + v2} km chaque heure : ils se rencontrent après ${D} / ${v1 + v2} = ${num(T, true)} h. Pendant tout ce temps, la mouche vole sans s’arrêter à ${w} km/h : elle parcourt ${w} × ${num(T, true)} = ${num(d, true)} km. On peut aussi additionner les trajets : le premier mesure ${num(L[0].length, true)} km, le deuxième ${num(L[1].length, true)} km, et chacun est une fraction fixe du précédent deux trajets plus tôt ; leur somme infinie (une série géométrique) vaut bien ${num(d, true)} km. La mouche fait une infinité d’allers et retours, mais en un temps fini.`,
      `The trains close in by ${v1} + ${v2} = ${v1 + v2} km every hour: they meet after ${D} / ${v1 + v2} = ${num(T, false)} h. All that time the fly flies non-stop at ${w} km/h: it covers ${w} × ${num(T, false)} = ${num(d, false)} km. One can also add up the legs: the first is ${num(L[0].length, false)} km, the second ${num(L[1].length, false)} km, and each is a fixed fraction of the one two legs before; their infinite sum (a geometric series) is indeed ${num(d, false)} km. The fly makes infinitely many trips, but in a finite time.`); },
};

export const original = () => P(
  "Deux trains roulent l’un vers l’autre et une mouche fait l’aller et retour entre eux jusqu’à leur rencontre. Quelle distance parcourt-elle ? Trouve la réponse de deux façons : par le temps, puis en additionnant les trajets. Pourquoi les deux méthodes donnent-elles le même résultat ?",
  "Two trains drive towards each other and a fly goes back and forth between them until they meet. What distance does it cover? Find the answer in two ways: through the time, then by adding the legs. Why do both methods give the same result?");

export const icon = svg(`<path d="M6 46h52" stroke-opacity=".4"/><path d="M8 34h12v10H8zM44 34h12v10H44z" ${'fill="currentColor" fill-opacity=".22"'}/><path class="ci-draw" d="M20 30l8-10 8 10 6-8"/>${dot(42, 22, 2.6, "ci-blink")}`);

export const hintActions = {
  0: ["clock", "Afficher l’horloge", "Show the clock"],
  1: ["graph", "Afficher le graphique temps et position", "Show the time and position graph"],
};
