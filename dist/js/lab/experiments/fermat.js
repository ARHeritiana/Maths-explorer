// Experiment `fermat` (template figure, no axes): the numbers 2^e + 1 for e = 1, …, 32. Fermat believed every 2^(2^n) + 1
// prime from five cases; Euler factored the sixth. State {e}: the exponent reached in the grid. Pure maths: models/fermat.js,
// primes.js.
import * as M from "../models/fermat.js";
import { group, writeFactors, sup } from "../models/primes.js";

const { model, MAX_E, isPowerOfTwo } = M;
const COLS = 8;
const cell = (e) => { const i = e - 1, x = (i % COLS) * 1.25, y = 5.1 - Math.floor(i / COLS) * 1.25; return [[x + 0.08, y - 1.07], [x + 1.17, y - 1.07], [x + 1.17, y - 0.08], [x + 0.08, y - 0.08]]; };
const power = (e) => `2${sup(e)} + 1`;

export default {
  id: "fermat", template: "figure", section: "patterns", sub: ["Les nombres de Fermat", "Fermat numbers"],
  symbol: "Fₙ", group: ["Arithmétique", "Number theory"],
  title: ["Cinq cas, puis une erreur de Fermat", "Five cases, then Fermat’s mistake"],
  short: ["Nombres de Fermat 2^(2ⁿ) + 1", "Fermat numbers 2^(2ⁿ) + 1"],
  intro: [
    "3, 5, 17, 257 et 65 537 sont premiers. Fermat en a conclu que tous les nombres 2^(2ⁿ) + 1 le sont. Le sixième lui donne tort.",
    "3, 5, 17, 257 and 65,537 are prime. Fermat concluded that every number 2^(2ⁿ) + 1 is. The sixth one proves him wrong.",
  ],
  duration: 10,
  level: ["Première · Terminale", "Intermediate · Advanced"],
  prereq: ["Puissances, nombres premiers, congruences (pour la preuve)", "Powers, prime numbers, congruences (for the proof)"],
  model: M,
  state: { e: 16 },
  controls: {
    e: { kind: "slider", key: "e", label: ["Exposant e dans 2^e + 1", "Exponent e in 2^e + 1"], min: 1, max: MAX_E, step: 1, digits: 0 },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [0, 10], y: [-0.5, 5.9], equal: true, axes: false, pad: [6, 6, 6, 6],
      scene(s, { fmt }) {
        const m = model(s), polys = [], texts = [];
        for (let e = 1; e <= MAX_E; e++) {
          const shown = e <= s.e, q = cell(e), tone = !shown ? "line" : m.primes[e - 1] ? "pos" : "neg";
          polys.push({ pts: q, fill: shown ? tone : "surface", alpha: shown ? (e === s.e ? 0.75 : 0.3) : 1, color: isPowerOfTwo(e) ? "obj2" : e === s.e ? "ink" : tone, width: isPowerOfTwo(e) || e === s.e ? 2.6 : 1 });
          texts.push({ at: [q[0][0] + 0.55, q[0][1] + 0.62], text: `${e}`, anchor: "center", size: 14, color: shown ? "ink" : "muted" });
          if (isPowerOfTwo(e)) texts.push({ at: [q[0][0] + 0.55, q[0][1] + 0.25], text: `F${Math.log2(e)}`, anchor: "center", size: 12, color: "obj2" });
        }
        texts.push({ at: [0.05, -0.3], text: fmt.t(["case e : 2^e + 1 (vert premier, rouge composé) ; cadre orange : nombre de Fermat", "cell e: 2^e + 1 (green prime, red composite); orange frame: Fermat number"]), size: 13, color: "muted" });
        return { polys, texts };
      },
      measure(s, { fmt }) {
        const m = model(s);
        return { text: `${power(s.e)} = ${group(m.N, fmt.fr)}${m.prime ? "" : " = " + writeFactors(m.N, fmt.fr)}`, color: m.prime ? "pos" : "neg" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), fr = fmt.fr;
      return m.fermat ? `F${m.index} = 2^(2${sup(m.index)}) + 1 = ${power(s.e)} = ${group(m.N, fr)}` : `${power(s.e)} = ${group(m.N, fr)}${fr ? " (pas un nombre de Fermat)" : " (not a Fermat number)"}`;
    },
    readout(s, { fmt }) {
      const m = model(s), fr = fmt.fr;
      return [
        [["Premier ?", "Prime?"], m.prime ? (fr ? "oui" : "yes") : fr ? "non" : "no"],
        [["Factorisation", "Factorisation"], writeFactors(m.N, fr)],
        [["Plus petit diviseur premier", "Smallest prime divisor"], group(m.smallest, fr)],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { e: 16 }, correct: 1,
      prompt: [
        "F0 = 3, F1 = 5, F2 = 17, F3 = 257 et F4 = 65 537 sont premiers. Fermat affirmait que tous les Fn = 2^(2ⁿ) + 1 le sont. Que vaut F5 = 2³² + 1 = 4 294 967 297 ?",
        "F0 = 3, F1 = 5, F2 = 17, F3 = 257 and F4 = 65,537 are prime. Fermat claimed that every Fn = 2^(2ⁿ) + 1 is. What about F5 = 2³² + 1 = 4,294,967,297?",
      ],
      choices: [
        ["Il est premier, comme les cinq premiers.", "It is prime, like the first five."],
        ["Il est composé.", "It is composite."],
        ["Il est trop grand pour qu’on puisse le savoir.", "It is too large for anyone to know."],
      ],
    },
    {
      id: "f5", kind: "explore", set: { e: 16 }, unlock: ["e"],
      prompt: [
        "Pousse l’exposant jusqu’à 32 pour atteindre F5. Regarde aussi les cases intermédiaires : quels exposants donnent des nombres premiers ?",
        "Push the exponent up to 32 to reach F5. Look at the cells in between too: which exponents give primes?",
      ],
      hint: ["F5 est la case 32, la dernière.", "F5 is cell 32, the last one."],
      goal: (s) => s.e === 32,
      done: [
        "2³² + 1 = 641 × 6 700 417 : la régularité observée sur cinq cas était fausse. Entre 1 et 32, seuls les exposants 1, 2, 4, 8 et 16 donnent des nombres premiers.",
        "2³² + 1 = 641 × 6,700,417: the pattern seen in five cases was false. Between 1 and 32, only the exponents 1, 2, 4, 8 and 16 give primes.",
      ],
    },
    {
      id: "odd", kind: "contrast", set: { e: 8 },
      variants: [
        { label: ["Cas A : 2⁸ + 1", "Case A: 2⁸ + 1"], set: { e: 8 } },
        { label: ["Cas B : 2¹² + 1", "Case B: 2¹² + 1"], set: { e: 12 } },
      ],
      prompt: [
        "Compare 2⁸ + 1 et 2¹² + 1. Pourquoi Fermat ne regardait-il que des exposants puissances de 2 ?",
        "Compare 2⁸ + 1 and 2¹² + 1. Why did Fermat only look at exponents that are powers of 2?",
      ],
      done: [
        "2¹² + 1 = 4 097 = 17 × 241. Comme 12 = 4 × 3 a un facteur impair, x³ + 1 = (x + 1)(x² − x + 1) avec x = 2⁴ montre que 2⁴ + 1 = 17 divise 2¹² + 1. Si e a un facteur impair, 2^e + 1 est composé.",
        "2¹² + 1 = 4,097 = 17 × 241. Since 12 = 4 × 3 has an odd factor, x³ + 1 = (x + 1)(x² − x + 1) with x = 2⁴ shows that 2⁴ + 1 = 17 divides 2¹² + 1. If e has an odd factor, 2^e + 1 is composite.",
      ],
    },
    {
      id: "euler", kind: "check", set: { e: 32 }, quantity: "k", answer: 10,
      prompt: [
        "Euler savait qu’un diviseur premier de F5 s’écrit 64k + 1 : il n’avait que peu de candidats à essayer. 641 = 64k + 1 : trouve k.",
        "Euler knew that a prime divisor of F5 has the form 64k + 1: he had few candidates to try. 641 = 64k + 1: find k.",
      ],
      hint: ["640 = 64 × ?", "640 = 64 × ?"],
      because: ["641 − 1 = 640 = 64 × 10, donc k = 10. Les candidats 193, 257, 449, 577 ne sont pas des diviseurs ; 641 l’est.", "641 − 1 = 640 = 64 × 10, so k = 10. The candidates 193, 257, 449, 577 are not divisors; 641 is."],
    },
    {
      id: "why", kind: "explain", set: { e: 32 },
      prompt: [
        "Pourquoi 641 divise-t-il 2³² + 1 ? (Une preuve sans calculer F5.)",
        "Why does 641 divide 2³² + 1? (A proof without computing F5.)",
      ],
      argument: [
        "641 = 5 × 2⁷ + 1 et 641 = 5⁴ + 2⁴. Modulo 641, la première égalité donne 5 × 2⁷ ≡ −1, donc en élevant à la puissance 4 : 5⁴ × 2²⁸ ≡ 1. La seconde donne 5⁴ ≡ −2⁴. En remplaçant : −2⁴ × 2²⁸ ≡ 1, c’est-à-dire 2³² ≡ −1, soit 641 divise 2³² + 1. Fermat s’était appuyé sur cinq cas : une observation, même vraie cinq fois, n’est pas une démonstration. On ne connaît aujourd’hui aucun nombre de Fermat premier au delà de F4.",
        "641 = 5 × 2⁷ + 1 and 641 = 5⁴ + 2⁴. Modulo 641 the first equality gives 5 × 2⁷ ≡ −1, so raising to the power 4: 5⁴ × 2²⁸ ≡ 1. The second gives 5⁴ ≡ −2⁴. Substituting: −2⁴ × 2²⁸ ≡ 1, that is 2³² ≡ −1, so 641 divides 2³² + 1. Fermat relied on five cases: an observation, even one true five times, is not a proof. No prime Fermat number beyond F4 is known today.",
      ],
    },
  ],
  conclusion: [
    "2^e + 1 ne peut être premier que si e est une puissance de 2, mais la réciproque est fausse : F5 = 2³² + 1 = 641 × 6 700 417. Cinq cas favorables ont suffi à tromper Fermat ; la preuve d’Euler tient en deux lignes de congruences.",
    "2^e + 1 can be prime only if e is a power of 2, but the converse is false: F5 = 2³² + 1 = 641 × 6,700,417. Five favourable cases were enough to mislead Fermat; Euler’s proof fits in two lines of congruences.",
  ],
  history: {
    title: ["Fermat · 1640, Euler · 1732", "Fermat · 1640, Euler · 1732"],
    story: [
      "Pierre de Fermat écrivit en 1640 qu’il croyait tous ces nombres premiers. Leonhard Euler montra en 1732 que 641 divise F5.",
      "Pierre de Fermat wrote in 1640 that he believed all these numbers to be prime. Leonhard Euler showed in 1732 that 641 divides F5.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Fermat/",
  },
};
