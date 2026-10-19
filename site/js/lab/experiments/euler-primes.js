// Experiment `euler-primes` (template figure, no axes): f(n) = n² + n + 41 gives forty primes in a row, then stops. State
// {c, n}: one of Euler's lucky numbers c and how far the grid of values n = 0, …, 59 has been revealed. Pure maths:
// models/euler-primes.js, primes.js.
import * as M from "../models/euler-primes.js";
import { group, writeFactors } from "../models/primes.js";

const { model, LUCKY, CELLS, f } = M;
const COLS = 10;
const cell = (k) => { const x = k % COLS, y = 6 - Math.floor(k / COLS); return [[x + 0.06, y - 0.94], [x + 0.94, y - 0.94], [x + 0.94, y - 0.06], [x + 0.06, y - 0.06]]; };

export default {
  id: "euler-primes", template: "figure", section: "patterns", sub: ["Le polynôme d’Euler", "Euler’s polynomial"],
  symbol: "n²", group: ["Arithmétique", "Number theory"],
  title: ["Quarante nombres premiers, et puis ?", "Forty primes, and then?"],
  short: ["Polynôme d’Euler n² + n + 41", "Euler’s polynomial n² + n + 41"],
  intro: [
    "n² + n + 41 est premier pour n = 0, 1, 2, … et ainsi de suite pendant quarante valeurs. Une si longue série de vérifications prouve-t-elle quelque chose ?",
    "n² + n + 41 is prime for n = 0, 1, 2, … and so on for forty values. Does such a long run of checks prove anything?",
  ],
  duration: 10,
  level: ["Seconde · Première", "Foundation · Intermediate"],
  prereq: ["Nombres premiers, diviseurs, factorisation", "Prime numbers, divisors, factorisation"],
  model: M,
  state: { c: 41, n: 9 },
  controls: {
    n: { kind: "slider", key: "n", label: ["Valeur de n", "Value of n"], min: 0, max: CELLS - 1, step: 1, digits: 0 },
    c: { kind: "choice", key: "c", label: ["Constante c dans n² + n + c", "Constant c in n² + n + c"], options: LUCKY.map((c) => ({ value: c, label: [`${c}`, `${c}`] })) },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [0, 10], y: [-0.4, 6.9], equal: true, axes: false, pad: [6, 6, 6, 6],
      scene(s, { fmt }) {
        const m = model(s), polys = [], texts = [];
        for (let k = 0; k < CELLS; k++) {
          const shown = k <= s.n, q = cell(k), tone = !shown ? "line" : m.primes[k] ? "pos" : "neg";
          polys.push({ pts: q, fill: shown ? tone : "surface", alpha: shown ? (k === s.n ? 0.75 : 0.32) : 1, color: k === s.n ? "ink" : tone, width: k === s.n ? 2.4 : 1 });
          texts.push({ at: [q[0][0] + 0.44, q[0][1] + 0.34], text: `${k}`, anchor: "center", size: 13, color: shown ? "ink" : "muted" });
        }
        const key = fmt.t(["vert : f(n) premier · rouge : f(n) composé", "green: f(n) prime · red: f(n) composite"]);
        texts.push({ at: [0.05, -0.25], text: key, size: 14, color: "muted" });
        return { polys, texts };
      },
      measure(s, { fmt }) {
        const m = model(s);
        return { text: `f(${s.n}) = ${group(m.value, fmt.fr)}${m.prime ? "" : " = " + writeFactors(m.value, fmt.fr)}`, color: m.prime ? "pos" : "neg" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s);
      return `f(n) = n² + n + ${s.c} ; f(${s.n}) = ${s.n}² + ${s.n} + ${s.c} = ${group(m.value, fmt.fr)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), fr = fmt.fr;
      return [
        [["f(n) est-il premier ?", "Is f(n) prime?"], m.prime ? (fr ? "oui" : "yes") : fr ? `non : ${writeFactors(m.value, fr)}` : `no: ${writeFactors(m.value, fr)}`],
        [["Valeurs premières de 0 à n", "Prime values from 0 to n"], `${m.primes.slice(0, s.n + 1).filter(Boolean).length} / ${s.n + 1}`],
        [["Premier n où f(n) est composé", "First n with f(n) composite"], m.firstComposite <= s.n ? `${m.firstComposite}` : fr ? "pas encore vu" : "not seen yet"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { c: 41, n: 9 }, correct: 1,
      prompt: [
        "f(n) = n² + n + 41 donne 41, 43, 47, 53, 61, 71, 83, 97, 113, 131 pour n = 0 à 9 : dix nombres premiers. f(n) est-il premier pour tout entier naturel n ?",
        "f(n) = n² + n + 41 gives 41, 43, 47, 53, 61, 71, 83, 97, 113, 131 for n = 0 to 9: ten primes. Is f(n) prime for every natural number n?",
      ],
      choices: [
        ["Oui : dix cas sur dix, la régularité continue.", "Yes: ten cases out of ten, the pattern goes on."],
        ["Non : il existe un n pour lequel f(n) n’est pas premier.", "No: there is an n for which f(n) is not prime."],
        ["On ne pourra jamais le savoir.", "We can never know."],
      ],
    },
    {
      id: "hunt", kind: "explore", set: { c: 41, n: 9 }, unlock: ["n"],
      prompt: [
        "Augmente n et regarde la grille se remplir. Trouve le premier n pour lequel f(n) n’est pas premier.",
        "Increase n and watch the grid fill. Find the first n for which f(n) is not prime.",
      ],
      hint: ["La série dure très longtemps : va au delà de 35.", "The run lasts a long time: go beyond 35."],
      goal: (s, m) => !m.prime,
      done: [
        "f(40) = 1 681 = 41² : la série s’arrête après quarante nombres premiers. Quarante vérifications ne prouvaient rien pour la quarante et unième.",
        "f(40) = 1,681 = 41²: the run stops after forty primes. Forty checks proved nothing about the forty-first.",
      ],
    },
    {
      id: "square", kind: "check", set: { c: 41, n: 40 }, quantity: "root", answer: 41,
      prompt: [
        "f(40) = 40² + 40 + 41 est un carré parfait. De quel entier est-il le carré ?",
        "f(40) = 40² + 40 + 41 is a perfect square. Of which whole number is it the square?",
      ],
      hint: ["Factorise : 40² + 40 = 40 × 41.", "Factorise: 40² + 40 = 40 × 41."],
      because: [
        "40² + 40 + 41 = 40 × 41 + 41 = 41 × (40 + 1) = 41². En général, f(c − 1) = (c − 1)c + c = c².",
        "40² + 40 + 41 = 40 × 41 + 41 = 41 × (40 + 1) = 41². In general f(c − 1) = (c − 1)c + c = c².",
      ],
    },
    {
      id: "lucky", kind: "contrast", set: { c: 41, n: 16 },
      variants: [
        { label: ["Cas A : n² + n + 41", "Case A: n² + n + 41"], set: { c: 41 } },
        { label: ["Cas B : n² + n + 17", "Case B: n² + n + 17"], set: { c: 17 } },
      ],
      prompt: [
        "Euler a remarqué d’autres constantes : n² + n + 17 est premier pour n = 0 à 15. Compare les deux grilles jusqu’à n = 16. Où chaque série s’arrête-t-elle ?",
        "Euler noticed other constants: n² + n + 17 is prime for n = 0 to 15. Compare the two grids up to n = 16. Where does each run stop?",
      ],
      done: [
        "La série de n² + n + 17 s’arrête à n = 16, où f(16) = 289 = 17². Chaque série s’arrête au plus tard à n = c − 1, où f(c − 1) = c².",
        "The run of n² + n + 17 stops at n = 16, where f(16) = 289 = 17². Each run stops at n = c − 1 at the latest, where f(c − 1) = c².",
      ],
    },
    {
      id: "why", kind: "explain", set: { c: 41, n: 59 },
      prompt: [
        "Pourquoi aucun polynôme non constant à coefficients entiers ne peut-il donner que des nombres premiers ?",
        "Why can no non-constant polynomial with integer coefficients give only primes?",
      ],
      argument: [
        "Soit P un tel polynôme et m un entier avec P(m) = p premier (sinon il n’y a rien à démontrer). Pour tout entier k, P(m + kp) − P(m) est divisible par (m + kp) − m = kp, car a^i − b^i est divisible par a − b. Donc p divise P(m + kp) pour tout k. Or P n’étant pas constant, P(x) ne prend chacune des valeurs p et −p qu’un nombre fini de fois, et |P(x)| tend vers l’infini. Pour k assez grand, P(m + kp) est un multiple de p différent de 0, p et −p : il n’est pas premier. Avec n² + n + 41, on peut aussi prendre n = 40. Une suite de vérifications, aussi longue soit-elle, n’est pas une démonstration.",
        "Let P be such a polynomial and m an integer with P(m) = p prime (otherwise there is nothing to prove). For every integer k, P(m + kp) − P(m) is divisible by (m + kp) − m = kp, because a^i − b^i is divisible by a − b. So p divides P(m + kp) for every k. Since P is not constant, P(x) takes each of the values p and −p only finitely many times, and |P(x)| tends to infinity. For k large enough, P(m + kp) is a multiple of p other than 0, p and −p: it is not prime. With n² + n + 41 one can also take n = 40. A run of checks, however long, is not a proof.",
      ],
    },
  ],
  conclusion: [
    "n² + n + 41 est premier pour n = 0 à 39 et composé pour n = 40. Vérifier des cas donne une conjecture ; seule une démonstration établit un résultat pour tous les entiers. Ici, la démonstration montre au contraire qu’aucun polynôme non constant ne donne que des nombres premiers.",
    "n² + n + 41 is prime for n = 0 to 39 and composite for n = 40. Checking cases gives a conjecture; only a proof establishes a result for every integer. Here the proof shows instead that no non-constant polynomial gives only primes.",
  ],
  history: {
    title: ["Euler · 1772", "Euler · 1772"],
    story: [
      "Leonhard Euler signala en 1772 que n² + n + 41 prend des valeurs premières pour n = 0 à 39. Le phénomène est lié à des propriétés profondes du nombre 163 = 4 × 41 − 1.",
      "Leonhard Euler pointed out in 1772 that n² + n + 41 takes prime values for n = 0 to 39. The phenomenon is linked to deep properties of the number 163 = 4 × 41 − 1.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Euler/",
  },
};
