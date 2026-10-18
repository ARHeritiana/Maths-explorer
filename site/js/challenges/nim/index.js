// The nim challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "nim",
  type: "play",
  title: ["Le jeu des 21 pierres", "The 21-stone game"],
  topic: ["Stratégie", "Strategy"],
  difficulty: 2,
  minutes: 8,
  hints: [["Avec 4 pierres, le joueur qui doit jouer perd contre un adversaire parfait.", "With 4 stones, the player to move loses against perfect play."], ["Après le premier coup, complète chaque coup adverse pour retirer 4 pierres au total.", "After your first move, complement each opponent move to remove 4 stones in total."]],
  extension: ["Adapte la stratégie si on peut retirer de 1 à 5 pierres.", "Adapt the strategy when players may remove 1 to 5 stones."],
};

export const variant = {
  params: [int("n", "Nombre de pierres", "Number of stones", 10, 60, 21), int("m", "Maximum retiré par coup", "Most removable per move", 2, 6, 3)],
  answer: (q) => q.n % (q.m + 1),
  prompt: (q) => P(`Il y a ${q.n} pierres. À tour de rôle, on en retire de 1 à ${q.m}. Prendre la dernière fait gagner. Tu commences : combien dois-tu en prendre pour garantir la victoire avec un jeu parfait ? (Réponds 0 si aucune stratégie ne la garantit.)`, `There are ${q.n} stones. Players take turns removing 1 to ${q.m}. Taking the last stone wins. You move first: how many should you take to guarantee victory with perfect play? (Answer 0 if no strategy guarantees it.)`),
  hints: (q) => [P(`Avec ${q.m + 1} pierres, le joueur qui doit jouer perd contre un adversaire parfait.`, `With ${q.m + 1} stones, the player to move loses against perfect play.`), P(`Après le premier coup, complète chaque coup adverse pour retirer ${q.m + 1} pierres au total.`, `After your first move, complement each opponent move to remove ${q.m + 1} stones in total.`)],
  solution: (q) => {
    const r = q.n % (q.m + 1), b = q.m + 1;
    return r
      ? P(`Prends ${r} pierre${r > 1 ? "s" : ""} pour en laisser ${q.n - r}, un multiple de ${b}. Si l’adversaire prend k pierres, prends ${b} − k : il reste toujours un multiple de ${b}, jusqu’à 0 et tu prends la dernière.`, `Take ${r} stone${r > 1 ? "s" : ""} to leave ${q.n - r}, a multiple of ${b}. If your opponent takes k, take ${b} − k: a multiple of ${b} always remains, down to 0, and you take the last stone.`)
      : P(`${q.n} est un multiple de ${b} : quoi que tu prennes, l’adversaire parfait complète à ${b} et garde un multiple de ${b}. Tu perds : la réponse est 0.`, `${q.n} is a multiple of ${b}: whatever you take, a perfect opponent completes to ${b} and keeps a multiple of ${b}. You lose: the answer is 0.`);
  },
};

export const original = (q) => P(
`Avec ${q.n} pierres et des retraits de 1 à ${q.m}, lequel des deux joueurs peut forcer la victoire ? Décris sa stratégie, puis démontre qu’elle gagne quoi que fasse l’adversaire. Pour quels nombres de pierres au départ le premier joueur gagne-t-il ?`,
`With ${q.n} stones and moves of 1 to ${q.m}, which of the two players can force a win? Describe the strategy, then prove it wins whatever the opponent does. For which starting numbers of stones does the first player win?`);

export const icon = svg([0, 1, 2, 3, 4].map((i) => `<circle class="ci-blink" style="--d:${i * 0.18}s" cx="${12 + i * 10}" cy="34" r="4.2" fill="currentColor" fill-opacity=".5"/>`).join("") + `<path d="M8 46h48"/><path class="ci-blink" style="--d:.9s" d="M20 18l12-8 12 8"/>`);
