// Experiment `statistics` (template data): a series of seven values on a number line; each value is a handle. The summary
// strip shows the box plot (min, Q1, median, Q3, max) and the mean. State {data, hide}: `hide` keeps the quartile numbers
// out of the readout in the mission where they must be read from the figure. Pure maths: models/statistics.js.
import * as S from "../models/statistics.js";
import { clamp } from "../models/num.js";

const { model } = S;
const MAX = 20, N = 7;
const DEFAULT = [2, 3, 4, 4, 5, 6, 9];

const handle = (i) => ({
  kind: "handle", color: "accent", axis: "x", grid: [0.5, 0], label: [`Valeur D${i + 1}`, `Value D${i + 1}`],
  at: (s) => [s.data[i], 0.4 + 0.5 * model(s).levels[i]],
  drag: (s, x) => ({ data: s.data.map((v, j) => (j === i ? clamp(x, 0, MAX) : v)) }),
  valuetext: (s, f) => f.num(s.data[i]),
});

export default {
  id: "statistics", template: "data",
  symbol: "x̄", group: ["Données & hasard", "Data & chance"],
  title: ["Que raconte une moyenne ?", "What does an average tell us?"],
  short: ["Moyenne, médiane, quartiles", "Mean, median, quartiles"],
  intro: [
    "Sept valeurs sur une droite graduée. Déplace-en une et regarde ce qui bouge : la moyenne, la médiane, la boîte.",
    "Seven values on a number line. Move one and watch what changes: the mean, the median, the box.",
  ],
  duration: 8,
  level: ["Seconde", "Foundation"],
  prereq: ["Calculs, nombres décimaux", "Arithmetic, decimal numbers"],
  model: S,
  state: { data: DEFAULT, hide: 0 },
  controls: Object.fromEntries(Array.from({ length: N }, (_, i) => [`d${i}`, handle(i)])),
  views: {
    panels: ["dots", "box"],
    dots: {
      x: [0, MAX], y: [0, 3.6], xTicks: Array.from({ length: MAX + 1 }, (_, k) => k), yTicks: [], noYAxis: true, zeroLabel: true,
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num;
        return {
          lines: [
            { a: [m.mean, 0], b: [m.mean, 3.6], color: "obj2", dash: [6, 5], width: 2 },
            { a: [m.median, 0], b: [m.median, 3.6], color: "obj3", dash: [2, 4], width: 2.4 },
          ],
          points: s.data.map((x, i) => ({ at: [x, 0.4 + 0.5 * m.levels[i]], color: "ink", r: 7 })),
          texts: [
            { at: [m.mean, 3.3], text: `x̄ = ${num(m.mean)}`, color: "obj2", dx: 7, size: 16 },
            { at: [m.median, 2.8], text: `${fmt.fr ? "méd." : "med."} = ${num(m.median)}`, color: "obj3", dx: 7, size: 16 },
          ],
        };
      },
    },
    box: {
      x: [0, MAX], y: [0, 1], xTicks: Array.from({ length: MAX + 1 }, (_, k) => k), yTicks: [], noYAxis: true, zeroLabel: true,
      xLabel: (x) => (x % 2 ? "" : String(x)),
      scene(s, { fmt }) {
        const m = model(s);
        const box = [[m.q1, 0.3], [m.q3, 0.3], [m.q3, 0.7], [m.q1, 0.7], [m.q1, 0.3]];
        return {
          polys: [{ pts: box, fill: "accent", alpha: 0.18, color: "accent", width: 2.4 }],
          lines: [
            { a: [m.min, 0.5], b: [m.q1, 0.5], color: "accent", width: 2.4 },
            { a: [m.q3, 0.5], b: [m.max, 0.5], color: "accent", width: 2.4 },
            { a: [m.min, 0.36], b: [m.min, 0.64], color: "accent", width: 2.4 },
            { a: [m.max, 0.36], b: [m.max, 0.64], color: "accent", width: 2.4 },
            { a: [m.median, 0.3], b: [m.median, 0.7], color: "obj3", width: 4.5 },
          ],
          points: [{ at: [m.mean, 0.5], color: "obj2", r: 6, hollow: true }],
          texts: [
            { at: [m.min, 0.9], text: "min", anchor: "center", color: "muted", size: 14 },
            { at: [m.q1, 0.9], text: "Q₁", anchor: "center", color: "accent", size: 15 },
            { at: [m.q3, 0.9], text: "Q₃", anchor: "center", color: "accent", size: 15 },
            { at: [m.max, 0.9], text: "max", anchor: "center", color: "muted", size: 14 },
          ],
        };
      },
    },
    formula(s, { fmt }) {
      const m = model(s);
      return `x̄ = (${s.data.map((x) => fmt.num(x)).join(" + ")}) / ${m.n} = ${fmt.num(m.mean)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr;
      return [
        [["Moyenne x̄", "Mean x̄"], num(m.mean)],
        [["Médiane", "Median"], num(m.median)],
        [["Q₁ ; Q₃ (boîte)", "Q₁, Q₃ (box)"], s.hide ? (fr ? "à lire sur la figure" : "read it on the figure") : `${num(m.q1)}${fr ? " ; " : ", "}${num(m.q3)} (${fr ? "écart" : "gap"} ${num(m.iqr)})`],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { data: DEFAULT, hide: 0 }, correct: 0,
      prompt: [
        "La série 2 ; 3 ; 4 ; 4 ; 5 ; 6 ; 9 a pour moyenne environ 4,7 et pour médiane 4. On remplace la plus grande valeur, 9, par 18. Que deviennent la moyenne et la médiane ?",
        "The series 2, 3, 4, 4, 5, 6, 9 has a mean of about 4.7 and a median of 4. The largest value, 9, is replaced by 18. What happens to the mean and the median?",
      ],
      choices: [
        ["La moyenne augmente, la médiane ne change pas.", "The mean increases, the median does not change."],
        ["La moyenne et la médiane augmentent toutes les deux.", "Both the mean and the median increase."],
        ["Ni la moyenne ni la médiane ne changent.", "Neither the mean nor the median changes."],
      ],
    },
    {
      id: "outlier", kind: "contrast", set: { data: DEFAULT, hide: 0 },
      variants: [
        { label: ["Cas A : la plus grande valeur est 9", "Case A: the largest value is 9"], set: { data: DEFAULT } },
        { label: ["Cas B : la plus grande valeur est 18", "Case B: the largest value is 18"], set: { data: [2, 3, 4, 4, 5, 6, 18] } },
      ],
      prompt: [
        "Compare les cas A et B. Observe la droite orange (moyenne), la droite violette (médiane) et la boîte. Laquelle de ces mesures a bougé ?",
        "Compare cases A and B. Watch the orange line (mean), the purple line (median) and the box. Which of these measures moved?",
      ],
      done: [
        "La moyenne passe d’environ 4,71 à 6 ; la médiane reste à 4 et la boîte ne bouge pas : une valeur extrême déplace fortement la moyenne, mais pas la médiane.",
        "The mean goes from about 4.71 to 6; the median stays at 4 and the box does not move: an extreme value moves the mean a lot, but not the median.",
      ],
    },
    {
      id: "box", kind: "explore", set: { data: DEFAULT, hide: 0 }, unlock: ["d1", "d5"],
      prompt: [
        "Avec les poignées D2 et D6, resserre la boîte jusqu’à ce que Q₃ − Q₁ soit au plus 1. Les valeurs extrêmes, 2 et 9, ont-elles bougé ?",
        "With handles D2 and D6, narrow the box until Q₃ − Q₁ is at most 1. Did the extreme values, 2 and 9, move?",
      ],
      hint: [
        "Pour 7 valeurs rangées, Q₁ est la 2e valeur et Q₃ la 6e. Rapproche la 2e et la 6e valeur l’une de l’autre.",
        "For 7 sorted values, Q₁ is the 2nd value and Q₃ the 6th. Bring the 2nd and 6th values closer together.",
      ],
      goal: (s, m) => m.iqr <= 1,
      done: [
        "La boîte va de Q₁ à Q₃ ; sa largeur Q₃ − Q₁ s’appelle l’écart interquartile. Les valeurs extrêmes n’ont pas bougé : elles n’influencent pas la boîte.",
        "The box runs from Q₁ to Q₃; its width Q₃ − Q₁ is the interquartile range. The extreme values did not move: they do not influence the box.",
      ],
    },
    {
      id: "mean", kind: "explore", set: { data: DEFAULT, hide: 0 }, unlock: ["d0"],
      prompt: [
        "Fais glisser la valeur D1 (la plus à gauche) pour que la moyenne atteigne 6. Que fait la médiane pendant ce temps ?",
        "Drag the value D1 (the leftmost) so that the mean reaches 6. What does the median do meanwhile?",
      ],
      hint: [
        "La somme des valeurs doit valoir 6 × 7 = 42. Les six autres valeurs font 31.",
        "The sum of the values must be 6 × 7 = 42. The other six values add up to 31.",
      ],
      goal: (s, m) => Math.abs(m.mean - 6) < 1e-9,
      done: [
        "Il faut D1 = 11. Déplacer une valeur de d déplace la moyenne de d/7 : ici 9/7, de 4,71 à 6. La médiane, elle, ne dépend que de l’ordre : elle passe seulement de 4 à 5.",
        "You need D1 = 11. Moving one value by d moves the mean by d/7: here 9/7, from 4.71 to 6. The median depends only on the order: it only goes from 4 to 5.",
      ],
    },
    {
      id: "read", kind: "check", set: { data: [1, 2, 4, 5, 7, 8, 12], hide: 1 }, quantity: "q3", answer: 8, tolerance: 0.01,
      prompt: [
        "Lis la boîte sur la figure : quelle est la valeur du troisième quartile Q₃ ?",
        "Read the box on the figure: what is the value of the third quartile Q₃?",
      ],
      hint: [
        "Q₃ est le bord droit de la boîte. Lis sa position sur la droite graduée.",
        "Q₃ is the right edge of the box. Read its position on the number line.",
      ],
      because: [
        "Q₃ est la plus petite valeur telle qu’au moins 75 % des valeurs lui soient inférieures ou égales. Avec 7 valeurs, c’est la 6e : 6/7 ≈ 86 % (alors que 5/7 ≈ 71 % est trop peu). Donc Q₃ = 8.",
        "Q₃ is the smallest value such that at least 75% of the values are less than or equal to it. With 7 values this is the 6th: 6/7 ≈ 86% (whereas 5/7 ≈ 71% is too few). So Q₃ = 8.",
      ],
    },
    {
      id: "why", kind: "explain", set: { data: DEFAULT, hide: 0 },
      prompt: [
        "Pourquoi la médiane ne bouge-t-elle pas quand on éloigne la plus grande valeur, alors que la moyenne change ?",
        "Why does the median not move when the largest value is pushed away, while the mean changes?",
      ],
      argument: [
        "La médiane est la valeur du milieu de la série rangée : elle ne dépend que de l’ordre des valeurs. Tant que la plus grande valeur reste la plus grande, aucun rang ne change. La moyenne, elle, est la somme divisée par n : si une valeur augmente de d, la somme augmente de d et la moyenne de d/n, aussi loin que l’on aille.",
        "The median is the middle value of the sorted series: it depends only on the order of the values. As long as the largest value stays the largest, no rank changes. The mean is the sum divided by n: if one value increases by d, the sum increases by d and the mean by d/n, however far you go.",
      ],
    },
  ],
  conclusion: [
    "La moyenne est la somme des valeurs divisée par n : déplacer une valeur de d la déplace de d/n. La médiane, Q₁ et Q₃ ne dépendent que de l’ordre des valeurs, donc ils résistent aux valeurs extrêmes. Ces figures illustrent le phénomène sur sept valeurs ; l’argument vaut pour toute série.",
    "The mean is the sum of the values divided by n: moving one value by d moves the mean by d/n. The median, Q₁ and Q₃ depend only on the order of the values, so they resist extreme values. These figures illustrate the effect on seven values; the argument holds for every series.",
  ],
  history: {
    title: ["Florence Nightingale · XIXe siècle", "Florence Nightingale · 19th century"],
    story: [
      "Florence Nightingale a utilisé les statistiques et des diagrammes pour défendre des réformes sanitaires. Les représentations de données peuvent rendre un argument plus clair, mais leur construction compte.",
      "Florence Nightingale used statistics and diagrams to advocate for sanitary reform. Data visualizations can clarify an argument, but their construction matters.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Nightingale/",
  },
};
