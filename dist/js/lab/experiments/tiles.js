// Experiment `tiles` (template figure, no axes): four pieces that seem to change their area when rearranged. State {a, b,
// variant, show}: the square of side a + b and the rectangle a × (2a + b) made from the same pieces, or Curry's triangle built
// twice; `show` shades the gap (or the overlap) that the eye misses. Pure maths: models/tiles.js.
import * as M from "../models/tiles.js";

const { model, PAIRS, CURRY, pieces } = M;
const COLORS = { I: "c1", II: "c2", III: "c3", IV: "c4" };
const ROMAN = ["I", "II", "III", "IV"];
const BOX = [11.4, 5.4];   // the figure is scaled to fit this box, whatever the size of the pieces

const gcd = (x, y) => (y ? gcd(y, x % y) : Math.abs(x));
const frac = (p, q) => { const g = gcd(p, q) || 1; return q / g === 1 ? `${p / g}` : `${p / g}/${q / g}`; };
const centroid = (pts) => [pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length];
const place = (pts, ox, oy, k) => pts.map(([x, y]) => [ox + x * k, oy + y * k]);

// Places two figures of sizes [w, h] with one scale: side by side, or one above the other when the canvas is taller than wide
// (a phone held upright). The panel is equal-scale with x in [0, 12] centred on y = 3, so its visible height is 12 H / W.
function arrange(sizes, stage, gap) {
  const tall = stage && stage.H > stage.W * 0.9, [[w1, h1], [w2, h2]] = sizes;
  if (!tall) {
    const k = Math.min(BOX[0] / (w1 + gap + w2), BOX[1] / Math.max(h1, h2)), x0 = (12 - (w1 + gap + w2) * k) / 2;
    return { k, at: [[x0, 0.4], [x0 + (w1 + gap) * k, 0.4]] };
  }
  const hh = 12 * (stage.H / stage.W) - 1.6, k = Math.min(11.4 / Math.max(w1, w2), hh / (h1 + h2 + gap + 0.6)), top = 3 + (h1 + h2 + gap) * k / 2;
  return { k, at: [[(12 - w1 * k) / 2, top - h1 * k], [(12 - w2 * k) / 2, top - (h1 + gap) * k - h2 * k]] };
}

// Unit grid lines inside a w × h frame placed at (ox, oy) with scale k.
function grid(w, h, ox, oy, k) {
  const lines = [];
  for (let i = 0; i <= w; i++) lines.push({ a: [ox + i * k, oy], b: [ox + i * k, oy + h * k], color: "grid", width: 1 });
  for (let j = 0; j <= h; j++) lines.push({ a: [ox, oy + j * k], b: [ox + w * k, oy + j * k], color: "grid", width: 1 });
  return lines;
}

function squareScene(s, fmt, stage) {
  const m = model(s), P = pieces(s.a, s.b), { S, W } = P, L = arrange([[S, S], [W, s.a]], stage, 1.2), k = L.k;
  const [[x0, y0], [xr, yr]] = L.at;
  const polys = [], texts = [], lines = [...grid(S, S, x0, y0, k), ...grid(W, s.a, xr, yr, k)];
  ROMAN.forEach((r) => {
    for (const [pts, ox, oy] of [[P.square[r], x0, y0], [P.rect[r], xr, yr]]) {
      const q = place(pts, ox, oy, k);
      polys.push({ pts: q, fill: COLORS[r], alpha: 0.32, color: COLORS[r], width: 1.6 });
      texts.push({ at: centroid(q), text: r, color: COLORS[r], anchor: "center", size: 15 });
    }
  });
  if (s.show && m.excess) {
    polys.push({ pts: place(P.sliver, xr, yr, k), fill: "neg", alpha: 0.75, color: "neg", width: 1.5 });
    texts.push({ at: [xr + (W * k) / 2, yr + s.a * k + 0.35], anchor: "center", size: 15, color: "neg",
      text: fmt.t(m.excess > 0 ? [`trou d’aire ${m.excess}`, `gap of area ${m.excess}`] : [`chevauchement d’aire ${-m.excess}`, `overlap of area ${-m.excess}`]) });
  }
  texts.push({ at: [x0 + (S * k) / 2, y0 - 0.45], text: `${S} × ${S}`, anchor: "center", color: "muted", size: 14 });
  texts.push({ at: [xr + (W * k) / 2, yr - 0.45], text: `${s.a} × ${W}`, anchor: "center", color: "muted", size: 14 });
  return { polys, lines, texts };
}

function curryScene(s, fmt, stage) {
  const L = arrange([[13, 5], [13, 5]], stage, 1.2), k = L.k;
  const polys = [], texts = [], lines = [];
  const tone = { red: "neg", blue: "c1", l7: "c3", l8: "c7" };
  ["A", "B"].forEach((key, i) => {
    const [ox, y0] = L.at[i], arr = CURRY[key];
    lines.push(...grid(13, 5, ox, y0, k));
    for (const name of ["red", "blue", "l7", "l8"]) polys.push({ pts: place(arr[name], ox, y0, k), fill: tone[name], alpha: 0.4, color: tone[name], width: 1.6 });
    if (arr.hole) polys.push({ pts: place(arr.hole, ox, y0, k), fill: "surface", alpha: 1, color: "ink", width: 2 });
    if (s.show) {
      lines.push({ a: [ox, y0], b: [ox + 13 * k, y0 + 5 * k], color: "ink", width: 1.5, dash: [5, 4] });
      // the bend of the long side: below the true hypotenuse in A, above it in B
      const bend = key === "A" ? [[0, 0], [8, 3], [13, 5]] : [[0, 0], [5, 2], [13, 5]];
      polys.push({ pts: place(bend, ox, y0, k), fill: "obj3", alpha: 0.75, color: "obj3", width: 1 });
    }
    texts.push({ at: [ox + 6.5 * k, y0 - 0.45], text: fmt.t(key === "A" ? ["Triangle A", "Triangle A"] : ["Triangle B : un trou", "Triangle B: a hole"]), anchor: "center", color: "muted", size: 14 });
  });
  return { polys, lines, texts };
}

export default {
  id: "tiles", template: "figure", section: "tiles",
  symbol: "▱", group: ["Démonstration", "Proof"],
  title: ["Des pièces qui changent d’aire", "Pieces that change their area"],
  short: ["Puzzles trompeurs et preuve", "Misleading puzzles and proof"],
  intro: [
    "Un carré de 64 carreaux devient un rectangle de 65 carreaux avec les mêmes pièces. La figure semble parfaite : seul un calcul dit où est passé le carreau.",
    "A square of 64 cells becomes a rectangle of 65 cells with the same pieces. The figure looks perfect: only a calculation says where the cell went.",
  ],
  duration: 12,
  level: ["Seconde · Première", "Foundation · Intermediate"],
  prereq: ["Aire, pente d’une droite, déterminant de deux vecteurs", "Area, slope of a line, determinant of two vectors"],
  model: M,
  state: { a: 5, b: 3, variant: "square", show: 0 },
  controls: {
    size: {
      kind: "slider", label: ["Taille des pièces (a ; b)", "Size of the pieces (a, b)"], min: 0, max: PAIRS.length - 1, step: 1,
      get: (s) => Math.max(0, PAIRS.findIndex(([a, b]) => a === s.a && b === s.b)),
      set: (s, i) => { const [a, b] = PAIRS[Math.max(0, Math.min(PAIRS.length - 1, Math.round(i)))]; return { a, b }; },
      format: (i, { fmt }) => fmt.pt(...PAIRS[i]),
    },
    variant: {
      kind: "choice", key: "variant", label: ["Puzzle", "Puzzle"],
      options: [{ value: "square", label: ["Carré et rectangle", "Square and rectangle"] }, { value: "curry", label: ["Triangle de Curry", "Curry’s triangle"] }],
    },
    show: {
      kind: "choice", key: "show", label: ["Écart caché", "Hidden gap"],
      options: [{ value: 0, label: ["Masqué", "Hidden"] }, { value: 1, label: ["Montré", "Shown"] }],
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [0, 12], y: [-0.2, 6.2], equal: true, axes: false, pad: [8, 8, 8, 8],
      scene: (s, { fmt, stage }) => (s.variant === "curry" ? curryScene(s, fmt, stage) : squareScene(s, fmt, stage)),
      measure(s, { fmt }) {
        if (s.variant === "curry") return { text: fmt.t(["mêmes pièces, un trou", "same pieces, one hole"]), color: "neg" };
        const m = model(s);
        return { text: `${m.squareArea} → ${m.rectArea}`, color: m.excess > 0 ? "neg" : m.excess < 0 ? "obj2" : "ink" };
      },
    },
    formula(s, { fmt }) {
      if (s.variant === "curry") return fmt.fr ? "Pentes : rouge 3/8, bleu 2/5, hypoténuse 5/13 : trois pentes différentes" : "Slopes: red 3/8, blue 2/5, hypotenuse 5/13: three different slopes";
      const m = model(s);
      return `${s.a} × ${m.W} − ${m.S}² = ${m.rectArea} − ${m.squareArea} = ${m.excess > 0 ? m.excess : "−" + -m.excess}`;
    },
    readout(s, { fmt }) {
      if (s.variant === "curry") {
        return [
          [["Pièces (dans A et dans B)", "Pieces (in A and in B)"], fmt.fr ? "32 carreaux" : "32 cells"],
          [["Vrai triangle 13 × 5", "True triangle 13 × 5"], fmt.fr ? "32,5 carreaux" : "32.5 cells"],
          [["Pentes rouge, bleu", "Slopes red, blue"], fmt.fr ? "3/8 ≈ 0,375 ; 2/5 = 0,4" : "3/8 ≈ 0.375, 2/5 = 0.4"],
        ];
      }
      const m = model(s);
      return [
        [["Aire du carré", "Area of the square"], `${m.squareArea}`],
        [["Aire du rectangle", "Area of the rectangle"], `${m.rectArea}`],
        [["Pentes triangle, trapèze", "Slopes triangle, trapezoid"], `${frac(s.b, m.S)}${fmt.fr ? " ; " : ", "}${frac(s.a - s.b, s.a)}`],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { a: 5, b: 3, variant: "square", show: 0 }, correct: 1,
      prompt: [
        "Le carré 8 × 8 (64 carreaux) est découpé en quatre pièces, rangées en un rectangle 5 × 13 (65 carreaux). D’où vient le carreau de plus ?",
        "The 8 × 8 square (64 cells) is cut into four pieces, arranged into a 5 × 13 rectangle (65 cells). Where does the extra cell come from?",
      ],
      choices: [
        ["Découper puis recoller peut créer de l’aire.", "Cutting and regluing can create area."],
        ["Les pièces ne remplissent pas exactement le rectangle : un trou très fin longe la diagonale.", "The pieces do not exactly fill the rectangle: a very thin gap runs along the diagonal."],
        ["Le rectangle mesure en fait 5 × 12,8.", "The rectangle really measures 5 × 12.8."],
      ],
    },
    {
      id: "zoom", kind: "explore", set: { a: 5, b: 3, variant: "square", show: 0 }, unlock: ["show"],
      prompt: [
        "Les pièces sont dessinées avec leurs vraies coordonnées. Agrandis la figure autour de la diagonale du rectangle (boutons + et −), puis montre l’écart caché. Que vois-tu ?",
        "The pieces are drawn with their true coordinates. Zoom on the diagonal of the rectangle (buttons + and −), then show the hidden gap. What do you see?",
      ],
      hint: ["Le choix « Écart caché : Montré » colore la région que les pièces ne couvrent pas.", "The choice “Hidden gap: Shown” colours the region the pieces do not cover."],
      goal: (s) => s.show === 1,
      done: [
        "Le long de la « diagonale », les bords des pièces ne sont pas alignés : ils laissent un parallélogramme très aplati d’aire 1. C’est le carreau « en plus ».",
        "Along the “diagonal” the edges of the pieces are not aligned: they leave a very flat parallelogram of area 1. That is the “extra” cell.",
      ],
    },
    {
      id: "size", kind: "explore", set: { a: 5, b: 3, variant: "square", show: 1 }, unlock: ["size"],
      prompt: [
        "Change la taille des pièces. Trouve une taille où le rectangle a un carreau de MOINS que le carré.",
        "Change the size of the pieces. Find a size where the rectangle has one cell LESS than the square.",
      ],
      hint: ["Essaie la taille suivante, (8 ; 5) : carré 13 × 13, rectangle 8 × 21.", "Try the next size, (8, 5): square 13 × 13, rectangle 8 × 21."],
      goal: (s, m) => m.excess === -1,
      done: [
        "Avec (8 ; 5), 8 × 21 = 168 et 13² = 169 : les pièces se chevauchent sur une aire 1. Selon la taille, le puzzle gagne ou perd un carreau ; il n’est jamais exact.",
        "With (8, 5), 8 × 21 = 168 and 13² = 169: the pieces overlap on an area of 1. Depending on the size the puzzle gains or loses a cell; it is never exact.",
      ],
    },
    {
      id: "curry", kind: "contrast", set: { a: 5, b: 3, variant: "curry", show: 0 },
      variants: [
        { label: ["Cas A : écart masqué", "Case A: gap hidden"], set: { show: 0 } },
        { label: ["Cas B : écart montré", "Case B: gap shown"], set: { show: 1 } },
      ],
      prompt: [
        "Les deux « triangles » 13 × 5 sont faits des mêmes quatre pièces, pourtant B a un trou. Compare les cas A et B : le grand côté est-il vraiment droit ?",
        "Both 13 × 5 “triangles” are made of the same four pieces, yet B has a hole. Compare cases A and B: is the long side really straight?",
      ],
      done: [
        "Les pentes 3/8 et 2/5 sont différentes : le grand côté de A est légèrement creusé, celui de B légèrement bombé. La différence des deux aires est exactement le carreau du trou.",
        "The slopes 3/8 and 2/5 differ: the long side of A bends slightly inwards, that of B slightly outwards. The difference of the two areas is exactly the cell of the hole.",
      ],
    },
    {
      id: "det", kind: "check", set: { a: 5, b: 3, variant: "square", show: 1 }, quantity: "det", answer: 1,
      prompt: [
        "Dans le rectangle, le bord du triangle suit u = (8 ; 3) et celui du trapèze suit v = (5 ; 2). Calcule det(u, v) = 8 × 2 − 3 × 5 : c’est l’aire du trou.",
        "In the rectangle the edge of the triangle follows u = (8, 3) and that of the trapezoid follows v = (5, 2). Compute det(u, v) = 8 × 2 − 3 × 5: it is the area of the gap.",
      ],
      hint: ["16 − 15.", "16 − 15."],
      because: [
        "det(u, v) = 16 − 15 = 1 : u et v ne sont pas colinéaires, donc les deux bords ne sont pas alignés, et le parallélogramme qu’ils forment a une aire 1.",
        "det(u, v) = 16 − 15 = 1: u and v are not collinear, so the two edges are not aligned, and the parallelogram they form has area 1.",
      ],
    },
    {
      id: "why", kind: "explain", set: { a: 5, b: 3, variant: "square", show: 1 },
      prompt: [
        "Pourquoi aucun découpage de ce type, avec a et b entiers, ne peut-il être exact ?",
        "Why can no cut of this kind, with whole numbers a and b, ever be exact?",
      ],
      argument: [
        "Le rectangle est rempli exactement si et seulement si les deux bords sont alignés, c’est-à-dire si les pentes b/(a + b) et (a − b)/a sont égales. Cela équivaut à ab = (a − b)(a + b), soit a² − ab − b² = 0. Supposons a et b entiers, b ≥ 1, et la fraction a/b irréductible. Alors a² = b(a + b), donc b divise a² ; comme b est premier avec a, b = 1. Il resterait a² − a − 1 = 0, soit a(a − 1) = 1 : impossible, car a(a − 1) est pair. Donc a² − ab − b² est un entier non nul, et l’écart vaut au moins 1 carreau. Pour deux nombres de Fibonacci consécutifs il vaut exactement 1 ou −1 (identité de Cassini) : le plus petit écart possible, d’où l’illusion. Une figure, même juste à l’œil, ne remplace pas ce calcul.",
        "The rectangle is filled exactly if and only if the two edges are aligned, that is if the slopes b/(a + b) and (a − b)/a are equal. This is equivalent to ab = (a − b)(a + b), that is a² − ab − b² = 0. Suppose a and b are whole numbers, b ≥ 1, with a/b in lowest terms. Then a² = b(a + b), so b divides a²; as b is coprime to a, b = 1. We would be left with a² − a − 1 = 0, that is a(a − 1) = 1: impossible, because a(a − 1) is even. So a² − ab − b² is a non-zero integer and the gap is at least one cell. For two consecutive Fibonacci numbers it is exactly 1 or −1 (Cassini’s identity): the smallest possible gap, hence the illusion. A figure, even one that looks right, does not replace this calculation.",
      ],
    },
  ],
  conclusion: [
    "Un dessin peut cacher une erreur d’une unité d’aire dans une figure de 65 carreaux. Pour savoir si des pièces s’emboîtent, on compare des pentes, ou on calcule un déterminant : le puzzle du carré et du rectangle n’est exact que si a/b vaut le nombre d’or, qui n’est pas rationnel.",
    "A drawing can hide an error of one unit of area in a figure of 65 cells. To know whether pieces fit, compare slopes or compute a determinant: the square and rectangle puzzle is exact only if a/b equals the golden ratio, which is not rational.",
  ],
  history: {
    title: ["Cassini · 1680", "Cassini · 1680"],
    story: [
      "L’identité F(n − 1) × F(n + 1) − F(n)² = ±1 sur les nombres de Fibonacci porte le nom de Giovanni Domenico Cassini. Elle explique pourquoi ce puzzle perd ou gagne toujours exactement un carreau.",
      "The identity F(n − 1) × F(n + 1) − F(n)² = ±1 on Fibonacci numbers bears the name of Giovanni Domenico Cassini. It explains why this puzzle always loses or gains exactly one cell.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Cassini/",
  },
};
