// Experiment `probability` (template chance): repeated Bernoulli trials and the binomial law. State {n, p, runs, seed,
// theory}: n trials per experiment, success probability p, how many experiments have been run, the seed of the series and
// whether the theoretical probabilities are shown (only in the last mission). Pure maths: models/probability.js.
import * as P from "../models/probability.js";
import { clamp, snap } from "../models/num.js";

const { model, MAX_RUNS } = P;

export default {
  id: "probability", template: "chance",
  symbol: "P", group: ["Données & hasard", "Data & chance"],
  title: ["Le hasard a ses habitudes", "Chance has its patterns"],
  short: ["Loi binomiale", "Binomial probability"],
  intro: [
    "Répète une expérience aléatoire des centaines de fois et regarde les fréquences se stabiliser autour des probabilités.",
    "Repeat a random experiment hundreds of times and watch the frequencies settle around the probabilities.",
  ],
  duration: 10,
  level: ["Première · Terminale", "Intermediate · Advanced"],
  prereq: ["Probabilités, indépendance, fréquences", "Probability, independence, relative frequency"],
  model: P,
  state: { n: 10, p: 0.3, runs: 0, seed: 2, theory: 0 },
  controls: {
    expectation: {
      kind: "handle", color: "accent", axis: "x", label: ["Repère E = np (change p)", "Marker E = np (changes p)"],
      at: (s) => [s.n * s.p, 0.025],
      drag: (s, x) => ({ p: clamp(snap(x / s.n, 0.05), 0, 1) }),
      nudge: (s, dx, dy) => ({ p: clamp(snap(s.p + (dx || dy) * 0.05, 0.05), 0, 1) }),
      valuetext: (s, f) => `p = ${f.num(s.p)}`,
    },
    run: {
      kind: "action", label: ["Lancer des expériences", "Run experiments"],
      options: [
        { value: 1, label: ["+ 1", "+ 1"] }, { value: 10, label: ["+ 10", "+ 10"] },
        { value: 100, label: ["+ 100", "+ 100"] }, { value: 1000, label: ["+ 1 000", "+ 1,000"] },
        { value: "new", label: ["Nouvelle série", "New series"] },
      ],
      // "new" starts again with another seed; the other buttons add experiments to the same series
      act: (s, v) => (v === "new" ? { runs: 0, seed: (Math.floor(Math.random() * 2 ** 31) % 1000000) + 1 } : { runs: Math.min(MAX_RUNS, s.runs + v) }),
    },
  },
  views: {
    panels: ["histogram"],
    histogram: {
      x: (s) => [-0.7, s.n + 0.7], xTicks: (s) => Array.from({ length: s.n + 1 }, (_, k) => k),
      y: [0, 0.5], yTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], noYAxis: true, zeroLabel: true,
      scene(s, { fmt, unlocked }) {
        const m = model(s), show = !!s.theory, rects = [], texts = [], lines = [], points = [];
        for (let k = 0; k <= s.n; k++) {
          if (show) rects.push({ x: k - 0.36, w: 0.34, h: m.probs[k], color: "pos", hollow: true });
          if (m.runs) rects.push({ x: show ? k + 0.02 : k - 0.2, w: show ? 0.34 : 0.4, h: m.freq[k], color: "obj2", alpha: 0.6 });
        }
        if (show || unlocked("expectation")) {
          lines.push({ a: [m.mean, 0], b: [m.mean, 0.5], color: "accent", dash: [6, 5], width: 1.8 });
          texts.push({ at: [m.mean, 0.42], text: `E = ${fmt.num(m.mean)}`, color: "accent", dx: 6, size: 15 });
        }
        if (m.runs && (show || unlocked("expectation"))) points.push({ at: [m.observedMean, 0.015], color: "obj2", hollow: true, r: 6 });
        texts.push({ at: [-0.6, 0.485], text: fmt.t(show ? ["fréquence (plein), probabilité (contour)", "frequency (filled), probability (outline)"] : ["fréquence observée", "observed frequency"]), color: "muted", size: 15 });
        return { rects, lines, points, texts };
      },
    },
    tray: {
      title: ["Dernières expériences : pièce pleine = succès", "Latest experiments: filled coin = success"],
      empty: ["Lance des expériences : chaque ligne en est une.", "Run experiments: each row is one."],
      rows: (s) => model(s).rows, columns: (s) => s.n,
    },
    formula(s, { fmt }) {
      return fmt.fr ? `X suit la loi binomiale B(${fmt.num(s.n)} ; ${fmt.num(s.p)})` : `X follows the binomial law B(${fmt.num(s.n)}, ${fmt.num(s.p)})`;
    },
    readout(s, { fmt, unlocked }) {
      const m = model(s), num = fmt.num, fr = fmt.fr;
      const known = s.theory || unlocked("expectation");
      return [
        [["Expériences lancées", "Experiments run"], `${m.runs}`],
        [["Moyenne observée de X", "Observed mean of X"], m.runs ? num(m.observedMean, 3) : fr ? "pas encore" : "not yet"],
        [["E(X) = np", "E(X) = np"], known ? `${num(s.n)} × ${num(s.p)} = ${num(m.mean)}` : fr ? "à découvrir" : "to discover"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { n: 10, p: 0.3, runs: 0, seed: 2, theory: 0 }, correct: 0,
      prompt: [
        "Une pièce truquée tombe sur « face » avec la probabilité 0,3. Une expérience consiste à la lancer 10 fois et à compter les faces. On répète l’expérience 1 000 fois. Quel nombre de faces sera le plus fréquent ?",
        "A trick coin lands on heads with probability 0.3. One experiment is 10 tosses and a count of the heads. The experiment is repeated 1,000 times. Which number of heads will be the most frequent?",
      ],
      choices: [
        ["Autour de 3", "Around 3"],
        ["Autour de 5", "Around 5"],
        ["Autour de 7", "Around 7"],
        ["On ne peut rien dire avant d’avoir essayé", "Nothing can be said before trying"],
      ],
    },
    {
      id: "run", kind: "explore", set: { n: 10, p: 0.3, runs: 0, seed: 2, theory: 0 }, unlock: ["run"],
      prompt: [
        "Lance des expériences avec les boutons (1, 10, 100 ou 1 000 à la fois) jusqu’à en avoir fait 1 000 au total. Chaque ligne du plateau est une expérience : pièce pleine = face. Quelle barre devient la plus haute ?",
        "Run experiments with the buttons (1, 10, 100 or 1,000 at a time) until you have made 1,000 in all. Each row of the tray is one experiment: filled coin = heads. Which bar becomes the highest?",
      ],
      hint: [
        "Les boutons s’additionnent : 100 puis 1 000 donnent 1 100 expériences. Le bouton « Nouvelle série » repart de zéro avec d’autres tirages.",
        "The buttons add up: 100 then 1,000 give 1,100 experiments. The button “New series” starts again from zero with other draws.",
      ],
      goal: (s) => s.runs >= 1000,
      done: [
        "Après 1 000 expériences, les résultats se concentrent autour de k = 3 : c’est là que les barres sont les plus hautes. Compare avec ta prédiction.",
        "After 1,000 experiments the results gather around k = 3: that is where the bars are tallest. Compare with your prediction.",
      ],
    },
    {
      id: "few", kind: "contrast", set: { n: 10, p: 0.3, runs: 10, seed: 3, theory: 0 },
      variants: [
        { label: ["Cas A : 10 expériences", "Case A: 10 experiments"], set: { runs: 10 } },
        { label: ["Cas B : 1 000 expériences", "Case B: 1,000 experiments"], set: { runs: 1000 } },
      ],
      prompt: [
        "Compare 10 expériences (cas A) et 1 000 expériences (cas B), tirées avec la même suite de hasard. Que devient le diagramme quand on répète beaucoup plus ?",
        "Compare 10 experiments (case A) and 1,000 experiments (case B), drawn from the same sequence of chance. What happens to the chart when you repeat far more?",
      ],
      done: [
        "Avec peu d’expériences, les barres sont irrégulières et d’un lot à l’autre elles changent beaucoup. Avec 1 000, elles dessinent un profil stable : la fréquence d’un résultat se stabilise quand on répète.",
        "With few experiments the bars are irregular and change a lot from one series to another. With 1,000 they draw a stable profile: the frequency of a result settles as the experiment is repeated.",
      ],
    },
    {
      id: "mean", kind: "explore", set: { n: 10, p: 0.3, runs: 1000, seed: 2, theory: 0 }, unlock: ["expectation"],
      prompt: [
        "Le repère bleu E marque le nombre np sur l’axe. Fais-le glisser jusqu’à E = 5 : p change, et les mêmes 1 000 tirages sont réutilisés. Où va la barre la plus haute ?",
        "The blue marker E shows the number np on the axis. Drag it to E = 5: p changes and the same 1,000 draws are reused. Where does the highest bar go?",
      ],
      hint: [
        "E = n × p avec n = 10 : pour E = 5, il faut p = 0,5.",
        "E = n × p with n = 10: for E = 5 you need p = 0.5.",
      ],
      goal: (s) => Math.abs(s.n * s.p - 5) < 1e-9,
      done: [
        "Avec p = 0,5, E = np = 5 et la barre la plus haute est celle de k = 5 : le centre du diagramme suit np.",
        "With p = 0.5, E = np = 5 and the highest bar is k = 5: the centre of the chart follows np.",
      ],
    },
    {
      id: "read", kind: "check", set: { n: 8, p: 0.25, runs: 1000, seed: 5, theory: 0 }, quantity: "observedMode", answer: 2, tolerance: 0.01,
      prompt: [
        "Voici 1 000 expériences de 8 lancers, avec p = 0,25. Lis le diagramme : quelle valeur de k est la plus fréquente ?",
        "Here are 1,000 experiments of 8 tosses with p = 0.25. Read the chart: which value of k is the most frequent?",
      ],
      hint: [
        "Cherche la barre orange la plus haute et lis le nombre sous elle.",
        "Find the tallest orange bar and read the number under it.",
      ],
      because: [
        "La barre la plus haute est celle de k = 2, tout près de np = 8 × 0,25 = 2.",
        "The tallest bar is k = 2, right next to np = 8 × 0.25 = 2.",
      ],
    },
    {
      id: "why", kind: "explain", set: { n: 10, p: 0.3, runs: 1000, seed: 2, theory: 1 },
      prompt: [
        "Pourquoi les barres des fréquences observées (pleines) s’approchent-elles des probabilités (contours) quand on répète beaucoup l’expérience ?",
        "Why do the bars of the observed frequencies (filled) come close to the probabilities (outlines) when the experiment is repeated many times?",
      ],
      argument: [
        "Pour un résultat k fixé, chaque expérience donne k avec la probabilité P(X = k), indépendamment des autres. La fréquence de k après N expériences est la moyenne de N variables qui valent 1 ou 0 : son espérance est P(X = k) et sa variance vaut P(X = k)(1 − P(X = k))/N. Cette variance tend vers 0 quand N grandit : les fréquences se concentrent autour de la probabilité (c’est le contenu de la loi des grands nombres). La simulation illustre ce fait sans le démontrer.",
        "For a fixed result k, each experiment gives k with probability P(X = k), independently of the others. The frequency of k after N experiments is the mean of N variables equal to 1 or 0: its expected value is P(X = k) and its variance is P(X = k)(1 − P(X = k))/N. This variance tends to 0 as N grows: the frequencies concentrate around the probability (this is the content of the law of large numbers). The simulation illustrates this fact without proving it.",
      ],
    },
  ],
  conclusion: [
    "Si X compte les succès de n essais indépendants de probabilité p, alors X suit la loi binomiale B(n ; p) et E(X) = np, car X est la somme de n variables valant 1 avec la probabilité p et 0 sinon. Les simulations montrent des fluctuations autour de ces valeurs ; elles les illustrent sans les démontrer.",
    "If X counts the successes of n independent trials of probability p, then X follows the binomial law B(n, p) and E(X) = np, because X is the sum of n variables equal to 1 with probability p and 0 otherwise. The simulations show fluctuations around these values; they illustrate them without proving them.",
  ],
  history: {
    title: ["Pascal et Fermat · 1654", "Pascal and Fermat · 1654"],
    story: [
      "Leur correspondance sur le partage équitable d’une mise lors d’un jeu interrompu a contribué au développement de la théorie des probabilités.",
      "Their correspondence about fairly dividing stakes in an interrupted game contributed to the development of probability theory.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Pascal/",
  },
};
