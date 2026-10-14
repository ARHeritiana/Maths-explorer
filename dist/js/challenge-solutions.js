// Animated solutions: each challenge explains its answer as a short sequence of steps, drawn as SVG.
// A solution is { size: [w, h], steps: [[fr, en], ...], draw(ctx, step, p) } where draw is a pure function of the step
// index and the progress p in [0, 1] inside that step, so any frame can be reproduced and scrubbed.
// Controls: restart, previous, play or pause, next. With reduced motion nothing plays by itself: each step shows its
// finished state. The caption of the current step is announced in a polite live region.
import { svgEl, colour } from "./challenge-kit.js";
import { COMB, triangulate, threeColour, visibility } from "./challenge-geometry.js";
import { KB, bridgePath, josephusOrder } from "./challenge-more.js";

const ez = (x) => 1 - (1 - clamp01(x)) ** 3;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (p, a, b) => clamp01((p - a) / (b - a));   // sub-progress of p between a and b
const lerp = (a, b, k) => a + (b - a) * k;

function ctxFor(svg, lang) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const line = (x1, y1, x2, y2, attrs = {}) => svgEl("line", { x1, y1, x2, y2, ...attrs }, svg);
  const circ = (cx, cy, r, attrs = {}) => svgEl("circle", { cx, cy, r, ...attrs }, svg);
  const rect = (x, y, width, height, attrs = {}) => svgEl("rect", { x, y, width, height, ...attrs }, svg);
  const text = (x, y, s, attrs = {}) => { const el = svgEl("text", { x, y, ...attrs }, svg); el.textContent = s; return el; };
  const path = (d, attrs = {}) => svgEl("path", { d, ...attrs }, svg);
  // greedy word wrap into several <text> lines of at most `max` characters
  const wrap = (x, y, str, max, attrs = {}, dy = 17) => { const words = String(str).split(" "); let line = "", k = 0; for (const w of words) { if ((line + " " + w).trim().length > max) { text(x, y + k++ * dy, line, attrs); line = w; } else line = (line + " " + w).trim(); } if (line) text(x, y + k * dy, line, attrs); };
  return { svg, t, line, circ, rect, text, path, wrap };
}

/* ------------------------------------------------------------ handshakes */
const handshakes = {
  size: [520, 300],
  steps: [
    ["Une personne serre la main aux 5 autres.", "One person shakes hands with the other 5."],
    ["Chacune des 6 personnes fait de même : 6 × 5 = 30 salutations. Chaque couleur est une personne.", "Each of the 6 people does the same: 6 × 5 = 30 greetings. Each colour is one person."],
    ["Mais une poignée de main fait deux salutations, une dans chaque sens : on a compté chaque paire deux fois.", "But one handshake is two greetings, one each way: every pair was counted twice."],
    ["30 ÷ 2 = 15 poignées de main. Pour n personnes : n(n − 1) ÷ 2.", "30 ÷ 2 = 15 handshakes. For n people: n(n − 1) ÷ 2."],
  ],
  draw(c, s, p) {
    const n = 6, P = (i) => { const a = ((-90 + 60 * i) * Math.PI) / 180; return [190 + 105 * Math.cos(a), 150 + 105 * Math.sin(a)]; };
    const arc = (i, j, bend) => { const [x1, y1] = P(i), [x2, y2] = P(j), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy); return `M${x1} ${y1}Q${mx - (dy / l) * bend} ${my + (dx / l) * bend} ${x2} ${y2}`; };
    if (s === 0) for (let j = 1; j < n; j++) { const k = seg(p, (j - 1) / 5.2, j / 5.2), [x1, y1] = P(0), [x2, y2] = P(j); c.line(x1, y1, lerp(x1, x2, k), lerp(y1, y2, k), { class: "sol-edge", style: `stroke:${colour(0)}` }); }
    if (s === 1) {
      const shown = p * n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && i + seg(shown, i, i + 1) > i) c.path(arc(i, j, 16), { class: "sol-edge thin", style: `stroke:${colour(i)};opacity:${seg(shown, i, i + 1) > 0 ? 1 : 0}` });
    }
    if (s >= 2) {
      const k = s === 2 ? p : 1;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) c.path(arc(i, j, lerp(16, 0, ez(k))), { class: "sol-edge thin", style: `stroke:${i < j ? colour(i) : colour(j)};opacity:${i < j ? 1 : 1 - ez(k)}` });
    }
    for (let i = 0; i < n; i++) { const [x, y] = P(i); c.circ(x, y, 14, { class: "sol-node", style: `stroke:${colour(i)}` }); c.text(x, y + 5, i + 1, { class: "sol-label", "text-anchor": "middle" }); }
    const big = s === 0 ? "5" : s === 1 ? `${Math.min(30, Math.round(p * 6) * 5)}` : s === 2 ? `${Math.round(lerp(30, 15, ez(p)))}` : "15";
    c.text(400, 140, big, { class: "sol-big", "text-anchor": "middle" });
    c.text(400, 172, s === 0 ? c.t("salutations", "greetings") : s === 1 ? "6 × 5" : s === 2 ? "30 ÷ 2" : "6 × 5 ÷ 2", { class: "sol-sub", "text-anchor": "middle" });
  },
};

/* ----------------------------------------------------------------- doors */
const doors = {
  size: [520, 300],
  steps: [
    ["Passage 1 : on change l’état de toutes les portes. Toutes sont ouvertes.", "Pass 1: every door is toggled. All are open."],
    ["Passage 2 : les multiples de 2 changent d’état et se referment.", "Pass 2: the multiples of 2 are toggled and close again."],
    ["Passage 3 : les multiples de 3 changent d’état.", "Pass 3: the multiples of 3 are toggled."],
    ["Les passages 4 à 100 défilent. Une porte change d’état à chaque diviseur de son numéro.", "Passes 4 to 100 run. A door is toggled once for each divisor of its number."],
    ["Il reste 10 portes ouvertes : 1, 4, 9, …, 100. Les diviseurs vont par paires, sauf quand un nombre est un carré parfait.", "10 doors stay open: 1, 4, 9, …, 100. Divisors come in pairs, except when a number is a perfect square."],
  ],
  draw(c, s, p) {
    const pass = s === 0 ? 1 : s === 1 ? 2 : s === 2 ? 3 : s === 3 ? 3 + Math.round(ez(p) * 97) : 100;
    const open = (d) => { let k = 0; for (let q = 1; q <= pass; q++) if (d % q === 0) k++; return k % 2 === 1; };
    for (let d = 1; d <= 100; d++) {
      const x = 14 + ((d - 1) % 10) * 25, y = 14 + Math.floor((d - 1) / 10) * 27, o = open(d), sq = Number.isInteger(Math.sqrt(d));
      c.rect(x, y, 22, 24, { rx: 4, class: `sol-door${o ? " open" : ""}${s === 4 && sq ? " square" : ""}`, style: o ? `fill:${s === 4 ? colour(2) : colour(0)}` : "" });
      c.text(x + 11, y + 16, d, { class: `sol-tiny${o ? " on" : ""}`, "text-anchor": "middle" });
    }
    c.text(285, 40, `${c.t("Passage", "Pass")} ${pass}`, { class: "sol-sub" });
    if (s === 4) {
      c.text(285, 80, c.t("Porte 36 : diviseurs par paires", "Door 36: divisors in pairs"), { class: "sol-sub" });
      [["1 × 36"], ["2 × 18"], ["3 × 12"], ["4 × 9"], ["6 × 6"]].forEach(([e], i) => c.text(285, 112 + i * 26, e, { class: i === 4 ? "sol-hot" : "sol-line", style: i < 4 ? `fill:${colour(0)}` : "" }));
      c.wrap(285, 236, c.t("6 × 6 : un diviseur sans partenaire, donc 9 diviseurs (impair) : la porte reste ouverte.", "6 × 6: one divisor with no partner, so 9 divisors (odd): the door stays open."), 30, { class: "sol-small" }, 16);
    } else { c.text(285, 84, c.t("Ouvertes", "Open"), { class: "sol-sub" }); c.text(285, 130, Array.from({ length: 100 }, (_, i) => i + 1).filter(open).length, { class: "sol-big" }); }
  },
};

/* ----------------------------------------------------------------- chess */
const chess = {
  size: [520, 300],
  steps: [
    ["Le plateau a perdu deux coins opposés : il reste 62 cases.", "The board lost two opposite corners: 62 squares remain."],
    ["On colorie en damier. Les deux coins opposés sont de la même couleur.", "Colour it like a chessboard. Opposite corners have the same colour."],
    ["On retire deux cases sombres : il reste 30 cases sombres et 32 cases claires.", "Two dark squares are gone: 30 dark squares and 32 light squares remain."],
    ["Un domino couvre toujours une case sombre et une case claire, où qu’on le pose.", "A domino always covers one dark and one light square, wherever it lies."],
    ["31 dominos couvriraient 31 cases sombres et 31 claires. Il y en a 30 et 32 : aucun pavage.", "31 dominoes would cover 31 dark and 31 light squares. There are 30 and 32: no tiling."],
  ],
  draw(c, s, p) {
    const C = 33, X0 = 20, Y0 = 24, gone = (i, j) => (i === 0 && j === 0) || (i === 7 && j === 7), dark = (i, j) => (i + j) % 2 === 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      const g = gone(i, j), shade = s >= 1 && dark(i, j);
      c.rect(X0 + i * C, Y0 + j * C, C, C, { class: `sol-cell${g ? " gone" : ""}`, style: g ? "" : `fill:${shade ? `color-mix(in srgb, var(--ink) ${Math.round(34 * (s === 1 ? ez(p) : 1))}%, var(--surface))` : "var(--surface)"}` });
    }
    if (s === 1 || s === 2) [[0, 0], [7, 7]].forEach(([i, j]) => c.circ(X0 + i * C + C / 2, Y0 + j * C + C / 2, 15 + 2 * Math.sin(p * 9), { class: "sol-ring" }));
    if (s === 3) {
      const spots = [[2, 1, "h"], [4, 4, "v"], [5, 6, "h"], [1, 5, "v"]], k = Math.min(3, Math.floor(p * 4)), [i, j, o] = spots[k], w = o === "h" ? 2 : 1, h = o === "h" ? 1 : 2;
      c.rect(X0 + i * C + 2, Y0 + j * C + 2, w * C - 4, h * C - 4, { rx: 8, class: "sol-domino" });
      [[i, j], o === "h" ? [i + 1, j] : [i, j + 1]].forEach(([a, b]) => c.circ(X0 + a * C + C / 2, Y0 + b * C + C / 2, 7, { style: `fill:${dark(a, b) ? "var(--ink)" : "var(--surface)"};stroke:var(--ink);stroke-width:2` }));
    }
    const dk = 30, lt = 32;
    const k = s === 2 ? ez(p) : 1;
    c.text(320, 62, `${c.t("Cases sombres", "Dark squares")}${s >= 2 ? ` : ${dk}` : ""}`, { class: "sol-sub" });
    c.rect(320, 72, 150 * (s >= 2 ? dk / 32 : 0) * k, 22, { rx: 4, style: "fill:var(--ink)" });
    c.text(320, 120, `${c.t("Cases claires", "Light squares")}${s >= 2 ? ` : ${lt}` : ""}`, { class: "sol-sub" });
    c.rect(320, 130, 150 * (s >= 2 ? 1 : 0) * k, 22, { rx: 4, style: `fill:${colour(2)}` });
    if (s === 4) { c.wrap(320, 196, c.t("31 dominos couvrent 31 sombres et 31 claires.", "31 dominoes cover 31 dark and 31 light."), 26, { class: "sol-line" }, 22); c.text(320, 262, "30 ≠ 32", { class: "sol-big small", style: "fill:var(--neg)" }); }
  },
};

/* ------------------------------------------------------------------- nim */
const NIM_MOVES = [[1, null], [2, 2], [3, 1], [1, 3], [2, 2], [3, 1]];   // [opponent takes, you take]; the first entry is your opening move
const nim = {
  size: [520, 300],
  steps: [
    ["Tu prends 1 pierre : il en reste 20, soit 5 blocs de 4. L’adversaire va devoir jouer dans un bloc.", "You take 1 stone: 20 remain, that is 5 blocks of 4. The opponent has to play into a block."],
    ["Il prend 2 pierres, tu en prends 2 : le bloc de 4 est complet. Il reste 16.", "They take 2, you take 2: the block of 4 is complete. 16 remain."],
    ["Il prend 3, tu prends 1 : encore un bloc de 4. Il reste 12.", "They take 3, you take 1: another block of 4. 12 remain."],
    ["Il prend 1, tu prends 3 : il reste 8.", "They take 1, you take 3: 8 remain."],
    ["Il prend 2, tu prends 2 : il reste 4.", "They take 2, you take 2: 4 remain."],
    ["Il prend 3, tu prends la dernière pierre et tu gagnes. Quel que soit k, tu réponds 4 − k.", "They take 3, you take the last stone and win. Whatever k is, you reply 4 − k."],
  ],
  draw(c, s, p) {
    // owner[i]: 0 not taken, 1 taken by you, 2 taken by the opponent; the stones are removed from the right
    const owner = Array(21).fill(0); let right = 21, opp = 0, you = 0;
    const take = (n, who, upTo) => { for (let k = 0; k < n; k++) { right -= 1; owner[right] = who; } void upTo; };
    take(1, 1);
    for (let i = 1; i <= s; i++) { take(NIM_MOVES[i][0], 2); take(NIM_MOVES[i][1] ?? 0, 1); }
    const left = 21 - (1 + NIM_MOVES.slice(1, s + 1).reduce((a, m) => a + m[0] + m[1], 0));
    void opp; void you;
    for (let i = 0; i < 21; i++) {
      const x = 22 + i * 23.5, w = owner[i], fresh = (s === 0 ? i === 20 : i >= left && i < left + (NIM_MOVES[s][0] + NIM_MOVES[s][1]));
      const fill = w === 1 ? colour(0) : w === 2 ? colour(1) : "var(--surface)";
      c.circ(x, 120, 9.5, { class: "sol-stone", style: `fill:${fill};stroke:${w ? fill : "var(--ink)"};opacity:${w && fresh ? 0.3 + 0.7 * ez(p) : w ? 0.45 : 1}` });
    }
    // blocks of four among the stones still there
    const blocks = Math.floor(left / 4);
    for (let b = 0; b < blocks; b++) { const x1 = 22 + b * 4 * 23.5 - 12, x2 = x1 + 4 * 23.5 - 2; c.path(`M${x1} 142V152H${x2}V142`, { class: "sol-bracket", style: `stroke:${colour(2)}` }); c.text((x1 + x2) / 2, 170, "4", { class: "sol-small", "text-anchor": "middle", style: `fill:${colour(2)}` }); }
    c.text(260, 36, `${left} ${c.t(left > 1 ? "pierres" : "pierre", left > 1 ? "stones" : "stone")}`, { class: "sol-big small", "text-anchor": "middle" });
    c.rect(150, 214, 12, 12, { rx: 3, style: `fill:${colour(0)}` }); c.text(168, 225, c.t("tes pierres", "your stones"), { class: "sol-small" });
    c.rect(290, 214, 12, 12, { rx: 3, style: `fill:${colour(1)}` }); c.text(308, 225, c.t("pierres de l’adversaire", "opponent’s stones"), { class: "sol-small" });
  },
};

/* ------------------------------------------------------------- pigeonhole */
const pigeonhole = {
  size: [520, 300],
  steps: [
    ["Il y a 7 restes possibles dans la division par 7 : 7 cases, de 0 à 6.", "There are 7 possible remainders on division by 7: 7 boxes, from 0 to 6."],
    ["Sept entiers 0, 1, …, 6 : un par case, aucun reste commun. Sept ne suffisent donc pas.", "Seven integers 0, 1, …, 6: one per box, no shared remainder. So seven are not enough."],
    ["Un huitième entier, par exemple 15, doit aller dans une case déjà occupée : 15 a le reste 1, comme 1.", "An eighth integer, say 15, has to go into an occupied box: 15 has remainder 1, like 1."],
    ["15 − 1 = 14 = 2 × 7 : deux entiers de même reste ont une différence divisible par 7. Le minimum est 8.", "15 − 1 = 14 = 2 × 7: two integers with the same remainder differ by a multiple of 7. The minimum is 8."],
  ],
  draw(c, s, p) {
    for (let r = 0; r < 7; r++) {
      const x = 22 + r * 69, hot = s >= 2 && r === 1;
      c.rect(x, 150, 58, 100, { rx: 8, class: `sol-box${hot ? " hot" : ""}` });
      c.text(x + 29, 270, `${c.t("reste", "rem.")} ${r}`, { class: "sol-small", "text-anchor": "middle" });
      if (s >= 1) c.circ(x + 29, 224, 17, { class: "sol-ball", style: `fill:${colour(r)};opacity:${s === 1 ? ez(seg(p, r / 8, r / 8 + 0.25)) : 1}` }), c.text(x + 29, 230, r, { class: "sol-ball-n", "text-anchor": "middle" });
    }
    if (s >= 2) {
      const k = s === 2 ? ez(p) : 1, x = 22 + 69 + 29, y = lerp(50, 188, k);
      c.circ(x, y, 17, { class: "sol-ball", style: `fill:${colour(7)}` }); c.text(x, y + 6, 15, { class: "sol-ball-n", "text-anchor": "middle" });
    }
    if (s === 3) c.text(260, 110, "15 − 1 = 14 = 2 × 7", { class: "sol-hot", "text-anchor": "middle" });
  },
};

/* --------------------------------------------------------------- product */
const product = {
  size: [520, 300],
  steps: [
    ["n³ − n = n(n² − 1) = (n − 1) × n × (n + 1) : trois entiers consécutifs.", "n³ − n = n(n² − 1) = (n − 1) × n × (n + 1): three consecutive integers."],
    ["Parmi trois entiers consécutifs, un est toujours multiple de 3.", "Among three consecutive integers, one is always a multiple of 3."],
    ["Et au moins un est pair. Un multiple de 2 et un multiple de 3 : le produit est divisible par 6.", "And at least one is even. A multiple of 2 and a multiple of 3: the product is divisible by 6."],
    ["Pour n = 2 : 1 × 2 × 3 = 6. Les autres valeurs sont 24, 60, 120, … : 6 est le plus grand diviseur commun.", "For n = 2: 1 × 2 × 3 = 6. The other values are 24, 60, 120, …: 6 is the largest common divisor."],
  ],
  draw(c, s, p) {
    const X = (k) => 36 + k * 37;
    for (let k = 0; k <= 12; k++) { c.circ(X(k), 110, 14, { class: "sol-node" }); c.text(X(k), 115, k, { class: "sol-label", "text-anchor": "middle" }); }
    const start = s === 0 ? 1 : 1 + Math.floor(ez(p) * 8.99);
    if (s >= 1 && s <= 2) {
      c.rect(X(start - 1) - 20, 84, 3 * 37 - 12 + 24, 52, { rx: 14, class: "sol-window" });
      for (let k = start - 1; k <= start + 1; k++) {
        if (s === 1 && k % 3 === 0) c.circ(X(k), 110, 19, { class: "sol-ring", style: `stroke:${colour(2)}` });
        if (s === 2 && k % 2 === 0) c.circ(X(k), 110, 19, { class: "sol-ring", style: `stroke:${colour(1)}` });
      }
      c.text(260, 200, `${start - 1} × ${start} × ${start + 1} = ${(start - 1) * start * (start + 1)}`, { class: "sol-big small", "text-anchor": "middle" });
      c.text(260, 236, s === 1 ? c.t("un multiple de 3 dans la fenêtre", "one multiple of 3 in the window") : c.t("au moins un nombre pair dans la fenêtre", "at least one even number in the window"), { class: "sol-sub", "text-anchor": "middle" });
    }
    if (s === 0) { c.rect(X(1) - 20, 84, 3 * 37 - 12 + 24, 52, { rx: 14, class: "sol-window" }); c.text(260, 200, "n³ − n = (n − 1) n (n + 1)", { class: "sol-big small", "text-anchor": "middle" }); }
    if (s === 3) [2, 3, 4, 5, 6, 7].forEach((n, i) => c.text(60 + i * 78, 200, `${n ** 3 - n}`, { class: i === 0 ? "sol-hot" : "sol-line", "text-anchor": "middle", style: i === 0 ? "" : `opacity:${ez(seg(p, i / 8, i / 8 + 0.2))}` }));
    if (s === 3) c.text(260, 250, c.t("n = 2, 3, 4, … donnent 6, 24, 60, 120, 210, 336", "n = 2, 3, 4, … give 6, 24, 60, 120, 210, 336"), { class: "sol-sub", "text-anchor": "middle" });
  },
};

/* ------------------------------------------------------------ inequality */
const inequality = {
  size: [520, 300],
  steps: [
    ["Le graphe de f(x) = x + 1/x pour x > 0 : la courbe descend puis remonte.", "The graph of f(x) = x + 1/x for x > 0: the curve falls then rises."],
    ["La droite y = 2 touche la courbe en un seul point, (1 ; 2), et la courbe reste au-dessus.", "The line y = 2 touches the curve at one point only, (1, 2), and the curve stays above it."],
    ["Un point parcourt la courbe : la valeur de f ne descend jamais sous 2.", "A point runs along the curve: the value of f never goes below 2."],
    ["Pourquoi : (x − 1)² ≥ 0 donne x² + 1 ≥ 2x, et en divisant par x > 0 : x + 1/x ≥ 2. Égalité si x = 1.", "Why: (x − 1)² ≥ 0 gives x² + 1 ≥ 2x, and dividing by x > 0: x + 1/x ≥ 2. Equality when x = 1."],
  ],
  draw(c, s, p) {
    const X = (x) => 50 + x * 105, Y = (y) => 260 - y * 36, f = (x) => x + 1 / x, x0 = 0.2, x1 = 4.2;
    c.line(50, 260, 500, 260, { class: "sol-axis" }); c.line(50, 260, 50, 30, { class: "sol-axis" });
    for (let x = 1; x <= 4; x++) { c.line(X(x), 256, X(x), 264, { class: "sol-axis" }); c.text(X(x), 280, x, { class: "sol-small", "text-anchor": "middle" }); }
    for (let y = 1; y <= 6; y++) { c.line(46, Y(y), 54, Y(y), { class: "sol-axis" }); c.text(38, Y(y) + 5, y, { class: "sol-small", "text-anchor": "end" }); }
    const k = s === 0 ? ez(p) : 1, n = 160;
    let d = ""; for (let i = 0; i <= n * k; i++) { const x = x0 + ((x1 - x0) * i) / n; d += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(Math.min(f(x), 6.4)).toFixed(1)}`; }
    c.path(d, { class: "sol-curve" });
    if (s >= 1) { c.line(50, Y(2), lerp(50, 500, s === 1 ? ez(p) : 1), Y(2), { class: "sol-guide", style: `stroke:${colour(2)}` }); }
    if (s >= 1 && (s > 1 || p > 0.6)) { c.circ(X(1), Y(2), 7, { style: `fill:${colour(2)}` }); c.text(X(1) + 12, Y(2) - 12, "(1 ; 2)", { class: "sol-small" }); }
    if (s === 2) { const x = lerp(0.3, 3.8, ez(p)); c.circ(X(x), Y(f(x)), 7, { style: `fill:${colour(1)}` }); c.text(330, 70, `x = ${x.toFixed(2)}`, { class: "sol-line" }); c.text(330, 100, `f(x) = ${f(x).toFixed(2)}`, { class: "sol-hot" }); }
    if (s === 3) [["(x − 1)² ≥ 0", 0], ["x² − 2x + 1 ≥ 0", 0.25], ["x² + 1 ≥ 2x", 0.5], ["x + 1/x ≥ 2", 0.75]].forEach(([e, a], i) => c.text(250, 40 + i * 24, e, { class: i === 3 ? "sol-hot" : "sol-line", style: `opacity:${ez(seg(p, a, a + 0.25))};font-size:${i === 3 ? 20 : 16}px` }));
  },
};

/* --------------------------------------------------------------- squares */
const squares = {
  size: [520, 300],
  steps: [
    ["On construit un carré de points bordure par bordure. 1 point au centre.", "Build a square of dots border by border. 1 dot in the middle."],
    ["On ajoute une bordure en L de 3 points : 1 + 3 = 4, un carré 2 × 2.", "Add an L-shaped border of 3 dots: 1 + 3 = 4, a 2 × 2 square."],
    ["Puis 5 points : 1 + 3 + 5 = 9, un carré 3 × 3. Puis 7 : 16. Puis 9 : 25. Puis 11 : 36.", "Then 5 dots: 1 + 3 + 5 = 9, a 3 × 3 square. Then 7: 16. Then 9: 25. Then 11: 36."],
    ["La k-ième bordure compte 2k − 1 points, et n bordures forment un carré n × n : 1 + 3 + 5 + … + (2n − 1) = n².", "The kth border has 2k − 1 dots, and n borders make an n × n square: 1 + 3 + 5 + … + (2n − 1) = n²."],
    ["39 = 2 × 20 − 1 : il y a 20 bordures, la dernière de 39 points. 1 + 3 + … + 39 = 20² = 400.", "39 = 2 × 20 − 1: there are 20 borders, the last one with 39 dots. 1 + 3 + … + 39 = 20² = 400."],
  ],
  draw(c, s, p) {
    const dots = (n, sp, ox, oy, r, upto) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const layer = Math.max(i, j) + 1, show = layer <= Math.floor(upto + 1e-9), part = layer === Math.floor(upto + 1e-9) + 1 ? upto - Math.floor(upto + 1e-9) : 0;
        if (!show && part < 0.03) continue;
        c.circ(ox + j * sp, oy + i * sp, r, { style: `fill:${colour(layer - 1)};opacity:${show ? 1 : 0.25 + 0.75 * ez(part)}`, class: "sol-sq-dot" });
      }
    };
    if (s <= 3) {
      const upto = s === 0 ? 0.001 + ez(p) : s === 1 ? 1 + ez(p) : s === 2 ? 2 + ez(p) * 4 : 6;
      dots(6, 34, 40, 40, 12, Math.min(6, upto));
      const L = Math.min(6, Math.ceil(upto - 1e-9));
      for (let k = 1; k <= L; k++) {
        const y = 44 + (k - 1) * 33;
        c.rect(268, y - 14, 14, 14, { rx: 3, style: `fill:${colour(k - 1)}` });
        const sum = k * k, terms = Array.from({ length: k }, (_, q) => 2 * q + 1).join(" + ");
        c.text(290, y - 2, `${terms} = ${sum}`, { class: "sol-line", style: `opacity:${k < upto ? 1 : ez(upto - (k - 1))}` });
      }
    } else {
      dots(20, 13, 36, 22, 4.8, s === 4 ? 1 + ez(p) * 19 : 20);
      if (s >= 4) { const x0 = 36 - 9, y0 = 22 - 9, e = 36 + 19 * 13 + 9, f = 22 + 19 * 13 + 9, ix = 36 + 18 * 13 - 9, iy = 22 + 18 * 13 - 9; c.path(`M${x0} ${iy}H${ix}V${y0}H${e}V${f}H${x0}Z`, { class: "sol-last", style: `opacity:${s === 4 ? ez(seg(p, 0.85, 1)) : 1}` }); }
      c.rect(318, 60, 14, 14, { rx: 3, style: `fill:${colour(19)}` }); c.text(340, 72, c.t("dernière bordure : 39 points", "last border: 39 dots"), { class: "sol-small" });
      c.text(318, 130, s === 3 ? "1 + 3 + 5 + … + (2n − 1)" : "1 + 3 + 5 + … + 39", { class: "sol-line" });
      c.text(318, 170, s === 3 ? "= n²" : "= 20² = 400", { class: "sol-big small" });
    }
  },
};

/* ------------------------------------------------------------ art gallery */
let TRI = null;
const tri = () => (TRI ??= (() => { const tris = triangulate(COMB), col = threeColour(COMB.length, tris); return { tris, col }; })());
const GCOL = ["var(--c1)", "var(--c2)", "var(--c3)"];
const artgallery = {
  size: [520, 300],
  steps: [
    ["Une galerie à 12 murs, en forme de peigne. Combien de gardiens immobiles faut-il pour tout voir ?", "A gallery with 12 walls, shaped like a comb. How many fixed guards are needed to see everything?"],
    ["On découpe la galerie en triangles avec des diagonales intérieures : 12 − 2 = 10 triangles. Un gardien placé à un sommet voit tout son triangle.", "Cut the gallery into triangles with inside diagonals: 12 − 2 = 10 triangles. A guard standing at a vertex sees all of its triangle."],
    ["On colorie les sommets avec 3 couleurs pour que chaque triangle ait trois couleurs différentes.", "Colour the vertices with 3 colours so that every triangle has three different colours."],
    ["Les couleurs sont portées par 4, 4 et 4 sommets. Une couleur au plus ⌊12 ÷ 3⌋ = 4 : on met un gardien sur chaque sommet de cette couleur.", "The colours sit on 4, 4 and 4 vertices. Some colour is used at most ⌊12 ÷ 3⌋ = 4 times: put a guard on each vertex of that colour."],
    ["Chaque triangle contient un sommet de cette couleur, donc est vu : 4 gardiens suffisent.", "Every triangle contains a vertex of that colour, so it is watched: 4 guards suffice."],
    ["Mais 4 sont nécessaires : un point voit au plus une pointe des 4 dents. Chaque zone colorée montre d’où l’on voit une pointe.", "But 4 are needed: a point sees at most one of the 4 tooth tips. Each coloured zone shows where a tip can be seen from."],
  ],
  draw(c, s, p) {
    const SC = 24, OX = 44, OY = 22, X = (x) => OX + x * SC * 0.92, Y = (y) => OY + (10 - y) * SC * 0.92 + 8;
    const d = (pts) => pts.map((q, i) => `${i ? "L" : "M"}${X(q[0]).toFixed(1)} ${Y(q[1]).toFixed(1)}`).join("") + "Z";
    const { tris, col } = tri();
    if (s >= 4) { const best = 0, g = COMB.filter((_, i) => col[i] === best); g.forEach((q) => c.path(d(visibility(COMB, q)), { class: "sol-vis", style: `opacity:${s === 4 ? ez(p) * 0.9 : 0.25}` })); }
    if (s === 5) [2, 5, 8, 11].forEach((i, k) => c.path(d(visibility(COMB, COMB[i])), { class: "sol-vis", style: `fill:${colour(k)};opacity:${0.55 * ez(p)}` }));
    c.path(d(COMB), { class: "sol-wall" });
    if (s >= 1) tris.forEach(([a, b, e], i) => { const k = ez(seg(s === 1 ? p : 1, i / 11, i / 11 + 0.25)); [[a, b], [b, e], [e, a]].forEach(([u, v]) => c.line(X(COMB[u][0]), Y(COMB[u][1]), lerp(X(COMB[u][0]), X(COMB[v][0]), k), lerp(Y(COMB[u][1]), Y(COMB[v][1]), k), { class: "sol-diag" })); });
    COMB.forEach((q, i) => {
      if (s >= 2) { const k = s === 2 ? ez(seg(p, i / 14, i / 14 + 0.3)) : 1; c.circ(X(q[0]), Y(q[1]), 8 * k, { style: `fill:${GCOL[col[i]]};stroke:var(--ink)`, class: "sol-vertex" }); }
      else c.circ(X(q[0]), Y(q[1]), 3.5, { style: "fill:var(--ink)" });
    });
    if (s >= 3) { const best = 0; COMB.forEach((q, i) => { if (col[i] === best) c.circ(X(q[0]), Y(q[1]), 13 + (s === 3 ? 3 * Math.sin(p * 12) : 0), { class: "sol-ring" }); }); }
    c.text(504, 64, "4 + 4 + 4 = 12", { class: "sol-small", "text-anchor": "end", style: `opacity:${s >= 3 ? 1 : 0}` });
  },
};

/* ------------------------------------------------------------------ eggs */
const EGG_FLOORS = [14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100];
const eggs = {
  size: [520, 300],
  steps: [
    ["Avec un seul œuf, il faut monter un étage à la fois : jusqu’à 99 lancers. Avec deux, on peut sauter.", "With one egg you must climb one floor at a time: up to 99 drops. With two you can skip."],
    ["Premier œuf à l’étage 14. S’il se brise, le second teste les étages 1 à 13 : au plus 1 + 13 = 14 lancers.", "First egg at floor 14. If it breaks, the second tests floors 1 to 13: at most 1 + 13 = 14 drops."],
    ["S’il survit, deuxième lancer à l’étage 14 + 13 = 27. S’il se brise, le second teste 15 à 26 : 2 + 12 = 14 lancers.", "If it survives, second drop at floor 14 + 13 = 27. If it breaks, the second tests 15 to 26: 2 + 12 = 14 drops."],
    ["On diminue le pas d’un cran à chaque fois : 14, 13, 12, … Les étages visés sont 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100. Chaque cas coûte au plus 14.", "Reduce the step by one each time: 14, 13, 12, … The floors are 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100. Every case costs at most 14."],
    ["Avec n lancers on couvre n + (n − 1) + … + 1 = n(n + 1) ÷ 2 étages. 14 × 15 ÷ 2 = 105 ≥ 100, mais 13 × 14 ÷ 2 = 91 < 100. Minimum : 14.", "With n drops you cover n + (n − 1) + … + 1 = n(n + 1) ÷ 2 floors. 14 × 15 ÷ 2 = 105 ≥ 100, but 13 × 14 ÷ 2 = 91 < 100. Minimum: 14."],
  ],
  draw(c, s, p) {
    if (s === 0) {
      for (let f = 1; f <= 100; f++) c.rect(20 + ((f - 1) % 25) * 19.5, 40 + Math.floor((f - 1) / 25) * 22, 17, 18, { rx: 3, class: "sol-floor", style: `fill:${f <= Math.round(ez(p) * 99) ? colour(0) : "var(--surface)"}` });
      c.text(260, 170, `${c.t("lancers", "drops")} : ${Math.round(ez(p) * 99)}`, { class: "sol-big small", "text-anchor": "middle" });
      c.text(260, 214, c.t("un étage à la fois, au pire 99 lancers", "one floor at a time, 99 drops at worst"), { class: "sol-sub", "text-anchor": "middle" });
      return;
    }
    const rows = s === 1 ? 1 : s === 2 ? 2 : 12;
    const reveal = s === 1 ? ez(p) : s === 2 ? 1 + ez(seg(p, 0, 1)) : s === 3 ? 2 + ez(p) * 10 : 12;
    for (let k = 1; k <= rows; k++) {
      const a = clamp01(reveal - (k - 1)); if (a <= 0 && s !== 4) continue;
      const y = 26 + (k - 1) * 20, f = EGG_FLOORS[k - 1], before = k === 1 ? 0 : EGG_FLOORS[k - 2], scan = Math.max(0, f - before - 1), W = 17;
      c.text(16, y + 12, `${f}`, { class: "sol-small", "text-anchor": "end", style: `opacity:${a}` });
      c.rect(24, y, k * W * a, 16, { rx: 3, style: `fill:${colour(0)}` });
      c.rect(24 + k * W, y, scan * W * a, 16, { rx: 3, style: `fill:${colour(1)}` });
      c.text(30 + (k + scan) * W * a, y + 12, `${k} + ${scan} = ${k + scan}`, { class: "sol-small", style: `opacity:${a}` });
      void rows;
    }
    const x14 = 24 + 14 * 17; c.line(x14, 18, x14, 270, { class: "sol-guide", style: `stroke:${colour(2)};opacity:${s >= 3 ? 1 : 0.6}` });
    if (s >= 1) { c.rect(380, 28, 12, 12, { rx: 3, style: `fill:${colour(0)}` }); c.text(398, 38, c.t("lancers du 1er œuf", "drops of egg 1"), { class: "sol-small" }); c.rect(380, 50, 12, 12, { rx: 3, style: `fill:${colour(1)}` }); c.text(398, 60, c.t("lancers du 2e œuf", "drops of egg 2"), { class: "sol-small" }); }
    if (s === 4) { c.text(380, 110, "14 + 13 + … + 1", { class: "sol-line" }); c.text(380, 140, "= 105 ≥ 100", { class: "sol-hot" }); c.text(380, 176, "13 + 12 + … + 1", { class: "sol-line" }); c.text(380, 206, "= 91 < 100", { class: "sol-line", style: "fill:var(--neg)" }); }
  },
};

/* ----------------------------------------------------------------- hanoi */
function hanoiMoves(n, a, b, cc, out = []) { if (n === 0) return out; hanoiMoves(n - 1, a, cc, b, out); out.push([n, a, cc]); hanoiMoves(n - 1, b, a, cc, out); return out; }
const HM = hanoiMoves(3, 0, 1, 2);   // disk n moves from peg a to peg c
const hanoi = {
  size: [520, 300],
  steps: [
    ["Trois disques sur la tige 1. Pour libérer le grand disque, il faut d’abord déplacer les deux autres sur la tige 2.", "Three disks on peg 1. To free the big disk, the other two must first move to peg 2."],
    ...HM.map((m, i) => [`Coup ${i + 1} : le disque ${m[0]} va de la tige ${m[1] + 1} à la tige ${m[2] + 1}.${i < 3 ? " (on déplace les 2 petits disques)" : i === 3 ? " (le grand disque, une seule fois)" : " (on ramène les 2 petits dessus)"}`, `Move ${i + 1}: disk ${m[0]} goes from peg ${m[1] + 1} to peg ${m[2] + 1}.${i < 3 ? " (moving the 2 small disks)" : i === 3 ? " (the big disk, only once)" : " (bringing the 2 small disks back on top)"}`]),
    ["Pour 3 disques : 3 + 1 + 3 = 7 coups. En général u(n) = 2u(n − 1) + 1, donc u(n) = 2ⁿ − 1 : 1, 3, 7, 15, 31, 63. Pour 6 disques : 63.", "For 3 disks: 3 + 1 + 3 = 7 moves. In general u(n) = 2u(n − 1) + 1, so u(n) = 2ⁿ − 1: 1, 3, 7, 15, 31, 63. For 6 disks: 63."],
  ],
  draw(c, s, p) {
    const PEG = [100, 260, 420], BASE = 230, DH = 24, pegs = [[3, 2, 1], [], []];
    const done = Math.min(HM.length, Math.max(0, s - 1)), moving = s >= 1 && s <= HM.length ? HM[s - 1] : null;
    for (let i = 0; i < done - (moving && p < 1 ? 0 : 0); i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); }
    // the current move is the last of the loop above when s counts it as done; draw it animated instead
    let lift = null;
    if (moving && s - 1 < HM.length) { const [d, a, b] = moving; pegs[a].pop(); lift = { d, a, b }; }
    c.rect(30, BASE, 460, 8, { rx: 4, class: "hn-base" });
    PEG.forEach((x, i) => { c.rect(x - 4, BASE - 140, 8, 140, { rx: 4, class: "hn-pole" }); c.text(x, 262, `${c.t("Tige", "Peg")} ${i + 1}`, { class: "sol-small", "text-anchor": "middle" }); });
    const disk = (x, y, d) => c.rect(x - (30 + d * 22) / 2, y, 30 + d * 22, DH - 4, { rx: 7, class: "hn-disk", style: `fill:${colour(d - 1)}` });
    pegs.forEach((st, i) => st.forEach((d, k) => disk(PEG[i], BASE - DH * (k + 1), d)));
    if (lift) {
      const { d, a, b } = lift, y0 = BASE - DH * (pegs[a].length + 1), y1 = BASE - DH * (pegs[b].length + 1), top = 54;
      const k1 = ez(seg(p, 0, 0.3)), k2 = ez(seg(p, 0.3, 0.7)), k3 = ez(seg(p, 0.7, 1)), x = lerp(PEG[a], PEG[b], k2), y = p < 0.3 ? lerp(y0, top, k1) : p < 0.7 ? top : lerp(top, y1, k3);
      disk(x, y, d);
    }
    if (s >= 1 && s <= HM.length) c.text(260, 34, `${c.t("Coup", "Move")} ${s} / 7`, { class: "sol-big small", "text-anchor": "middle" });
    if (s === HM.length + 1) [1, 3, 7, 15, 31, 63].forEach((v, i) => c.text(60 + i * 80, 120, v, { class: i === 5 ? "sol-hot" : "sol-line", "text-anchor": "middle", style: `opacity:${ez(seg(p, i / 7, i / 7 + 0.2))}` })), [1, 2, 3, 4, 5, 6].forEach((n, i) => c.text(60 + i * 80, 92, `n = ${n}`, { class: "sol-small", "text-anchor": "middle" }));
  },
};

/* ---------------------------------------------------------------- ramsey */
const ramsey = {
  size: [520, 300],
  steps: [
    ["Cinq personnes suffisent-elles ? On colorie le pentagone en bleu (amis) et ses diagonales en orange (pas amis).", "Are five people enough? Colour the pentagon blue (friends) and its diagonals orange (not friends)."],
    ["Aucun trio n’a trois traits de la même couleur : cinq personnes ne suffisent pas.", "No trio has three lines of one colour: five people are not enough."],
    ["Avec six personnes, regardons la personne A : elle a 5 relations avec les autres.", "With six people, look at person A: she has 5 relations with the others."],
    ["5 relations, 2 couleurs : au moins 3 de la même couleur (tiroirs). Disons B, C, D, amis de A.", "5 relations, 2 colours: at least 3 of one colour (pigeonhole). Say B, C, D are friends of A."],
    ["Si deux d’entre eux sont amis, par exemple B et C, alors A, B, C sont trois amis.", "If two of them are friends, say B and C, then A, B, C are three friends."],
    ["Sinon B, C, D ne sont amis deux à deux : trois personnes sans amis entre elles. Dans tous les cas, un trio de même couleur : le minimum est 6.", "Otherwise B, C, D are pairwise not friends: three people with no friendship among them. Either way there is a one-colour trio: the minimum is 6."],
  ],
  draw(c, s, p) {
    const blue = colour(0), orange = colour(1);
    const edge = (A, B, col, dash, k = 1, w = 4) => c.line(A[0], A[1], lerp(A[0], B[0], k), lerp(A[1], B[1], k), { class: "sol-edge", style: `stroke:${col};stroke-width:${w}`, ...(dash ? { "stroke-dasharray": "9 6" } : {}) });
    const node = (q, lab, hot) => { c.circ(q[0], q[1], 15, { class: "sol-node", style: hot ? `stroke:${hot};stroke-width:4` : "" }); c.text(q[0], q[1] + 5, lab, { class: "sol-label", "text-anchor": "middle" }); };
    if (s <= 1) {
      const P = (i) => { const a = ((-90 + 72 * i) * Math.PI) / 180; return [190, 150].map((o, k) => o + 105 * (k ? Math.sin(a) : Math.cos(a))); };
      for (let i = 0; i < 5; i++) edge(P(i), P((i + 1) % 5), blue, false, s === 0 ? ez(seg(p, i / 10, i / 10 + 0.2)) : 1);
      for (let i = 0; i < 5; i++) edge(P(i), P((i + 2) % 5), orange, true, s === 0 ? ez(seg(p, 0.5 + i / 10, 0.7 + i / 10)) : 1, 3);
      for (let i = 0; i < 5; i++) node(P(i), i + 1);
      c.text(400, 140, s === 1 ? "0" : "", { class: "sol-big", "text-anchor": "middle" }); c.text(400, 176, s === 1 ? c.t("trio d’une seule couleur", "one-colour trios") : "", { class: "sol-sub", "text-anchor": "middle" });
      return;
    }
    const P = (i) => { const a = ((-90 + 60 * i) * Math.PI) / 180; return [190 + 105 * Math.cos(a), 150 + 105 * Math.sin(a)]; };
    const Aq = P(0), friends = [1, 2, 3], others = [4, 5];
    friends.forEach((i, k) => edge(Aq, P(i), blue, false, s === 2 ? ez(seg(p, k / 6, k / 6 + 0.3)) : 1));
    others.forEach((i, k) => edge(Aq, P(i), orange, true, s === 2 ? ez(seg(p, 0.5 + k / 6, 0.8 + k / 6)) : 1, 3));
    if (s >= 4) {
      const showBlue = s === 4 || (s === 5 && p < 0), BC = [P(1), P(2)];
      if (s === 4) { edge(BC[0], BC[1], blue, false, ez(p)); c.path(`M${Aq} L${P(1)} L${P(2)}Z`.replace(/,/g, " "), { class: "sol-tri", style: `fill:${blue};opacity:${0.35 * ez(p)}` }); }
      void showBlue;
      if (s === 5) { [[1, 2], [2, 3], [1, 3]].forEach(([a, b], k) => edge(P(a), P(b), orange, true, ez(seg(p, k / 4, k / 4 + 0.3)), 3)); c.path(`M${P(1)} L${P(2)} L${P(3)}Z`.replace(/,/g, " "), { class: "sol-tri", style: `fill:${orange};opacity:${0.35 * ez(seg(p, 0.6, 1))}` }); }
    }
    for (let i = 0; i < 6; i++) node(P(i), "ABCDEF"[i], s >= 3 && friends.includes(i) ? blue : "");
    if (s === 2) c.text(400, 150, "5", { class: "sol-big", "text-anchor": "middle" });
  },
};

/* ------------------------------------------------------------ konigsberg */
const konigsberg = {
  size: [520, 300],
  steps: [
    ["Quatre quartiers, sept ponts. Peut-on les traverser tous exactement une fois ?", "Four districts, seven bridges. Can we cross every bridge exactly once?"],
    ["Comptons les ponts qui touchent chaque quartier : A en a 5, B, C et D en ont 3. Quatre nombres impairs.", "Count the bridges touching each district: A has 5, B, C and D have 3. Four odd numbers."],
    ["Quand on passe par un quartier, on utilise un pont pour entrer et un pour sortir : deux ponts. Seuls le départ et l’arrivée peuvent laisser un nombre impair.", "Passing through a district uses one bridge to enter and one to leave: two bridges. Only the start and the end can leave an odd number."],
    ["Un parcours exige donc 0 ou 2 quartiers impairs. Ici 4 : impossible. Il faut retirer au moins un pont.", "So a route needs 0 or 2 odd districts. Here there are 4: impossible. At least one bridge must go."],
    ["Retirons le pont B–D : B et D deviennent pairs. Il reste 2 quartiers impairs, A et C.", "Remove the bridge B–D: B and D become even. Two odd districts remain, A and C."],
    ["On peut alors partir de A et finir en C en traversant chaque pont restant une fois. Le minimum est 1.", "Now we can start at A and finish at C crossing every remaining bridge once. The minimum is 1."],
  ],
  draw(c, s, p) {
    const removed = s >= 4 ? 5 : -1, trail = [[0, "A"], [1, "B"], [2, "A"], [3, "C"], [4, "A"], [6, "D"]];   // bridge index and where it lands... see below
    const WALK = [[0, "A", "B"], [1, "B", "A"], [2, "A", "C"], [3, "C", "A"], [4, "A", "D"], [6, "D", "C"]];
    void trail;
    const deg = { A: 0, B: 0, C: 0, D: 0 };
    KB.bridges.forEach((b, i) => { if (i !== removed || s < 4) { deg[b[0]]++; deg[b[1]]++; } });
    const prog = s === 5 ? p * WALK.length : 0;
    KB.bridges.forEach((b, i) => {
      const { d } = bridgePath(b), gone = i === removed, w = WALK.findIndex((q) => q[0] === i);
      const crossed = s === 5 && w >= 0 && prog > w;
      c.path(d, { class: "sol-bridge", style: `stroke:${gone ? "var(--neg)" : crossed ? colour(2) : "var(--ink-2)"};opacity:${gone ? (s === 4 ? 1 - 0.6 * ez(p) : 0.25) : 1};stroke-dasharray:${gone ? "6 6" : "none"}` });
    });
    Object.entries(KB.land).forEach(([n, [x, y]]) => {
      const odd = s >= 1 && deg[n] % 2 === 1;
      c.circ(x, y, 22, { class: "sol-node", style: odd ? `stroke:${colour(3)};stroke-width:4` : "" }); c.text(x, y + 6, n, { class: "sol-label", "text-anchor": "middle" });
      if (s >= 1) c.text(x + (n === "D" ? 34 : n === "A" ? -34 : 0), y + (n === "B" ? -32 : n === "C" ? 44 : 6), deg[n], { class: "sol-big small", "text-anchor": "middle", style: `fill:${odd ? colour(3) : "var(--ink)"};opacity:${s === 1 ? ez(p) : 1}` });
    });
    if (s === 5) {
      const k = Math.min(WALK.length - 1, Math.floor(prog)), [bi, from, to] = WALK[k], { d } = bridgePath(KB.bridges[bi]), t = prog - k;
      const A = KB.land[from], B = KB.land[to], mid = (() => { const m = bridgePath(KB.bridges[bi]).mid; return m; })();
      const x = (1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * (2 * mid[0] - (A[0] + B[0]) / 2) + t * t * B[0], y = (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * (2 * mid[1] - (A[1] + B[1]) / 2) + t * t * B[1];
      void d; c.circ(x, y, 9, { style: `fill:${colour(2)};stroke:var(--ink);stroke-width:2` });
    }
    c.text(26, 280, s >= 1 ? `${c.t("Quartiers impairs", "Odd districts")} : ${Object.values(deg).filter((v) => v % 2).length}` : "", { class: "sol-sub" });
  },
};

/* -------------------------------------------------------------- josephus */
const JO = josephusOrder(41);
const josephus = {
  size: [520, 300],
  steps: [
    ["41 personnes en cercle. On saute 1, on élimine 2, on saute 3, on élimine 4, …", "41 people in a circle. Skip 1, remove 2, skip 3, remove 4, …"],
    ["Après 9 éliminations (2, 4, …, 18), il reste 32 personnes : une puissance de 2.", "After 9 removals (2, 4, …, 18), 32 people remain: a power of 2."],
    ["Avec 32 = 2⁵ personnes, le premier tour retire une personne sur deux et recommence au même point : la personne qu’on saute en premier survit toujours. Ici c’est 19.", "With 32 = 2⁵ people, each lap removes every second person and restarts at the same spot: the person skipped first always survives. Here that is 19."],
    ["On joue la suite : 19 est bien la dernière personne restante.", "Play it out: 19 is indeed the last person standing."],
    ["41 = 32 + 9 : avec l éliminations pour atteindre une puissance de 2, le survivant est 2l + 1. Ici 2 × 9 + 1 = 19.", "41 = 32 + 9: with l removals to reach a power of 2, the survivor is 2l + 1. Here 2 × 9 + 1 = 19."],
  ],
  draw(c, s, p) {
    const n = 41, P = (i) => { const a = ((-90 + (360 * (i - 1)) / n) * Math.PI) / 180; return [170 + 128 * Math.cos(a), 150 + 128 * Math.sin(a)]; };
    const killed = s === 0 ? Math.round(ez(p) * 9) : s === 1 || s === 2 ? 9 : s === 3 ? 9 + Math.round(ez(p) * (JO.out.length - 9)) : JO.out.length;
    const dead = new Set(JO.out.slice(0, killed));
    for (let i = 1; i <= n; i++) {
      const [x, y] = P(i), isDead = dead.has(i), win = (s >= 2) && i === JO.last, power = s === 1 && !isDead;
      c.circ(x, y, win ? 11 : 9, { class: `js-p${isDead ? " dead" : ""}${win ? " win" : ""}`, style: win ? "" : power ? `fill:${colour(0)}` : "" });
      c.text(x, y + 3.5, i, { class: `js-n${isDead ? " dead" : ""}`, "text-anchor": "middle" });
    }
    c.text(418, 110, s <= 1 ? `${n - killed}` : s === 2 ? "32 = 2⁵" : s === 3 ? `${n - killed}` : "41 = 32 + 9", { class: "sol-big", "text-anchor": "middle", style: s === 4 || s === 2 ? "font-size:28px" : "" });
    c.text(418, 150, s <= 1 || s === 3 ? c.t("personnes restantes", "people left") : s === 2 ? c.t("le premier sauté survit", "first skipped survives") : "2 × 9 + 1 = 19", { class: s === 4 ? "sol-hot" : "sol-sub", "text-anchor": "middle" });
  },
};

export const SOLUTIONS = { handshakes, doors, chess, nim, pigeonhole, product, inequality, squares, artgallery, eggs, hanoi, ramsey, konigsberg, josephus };
export const hasSolution = (id) => Object.hasOwn(SOLUTIONS, id);

/* ----------------------------------------------------------------- player */
export function mountSolution(id, root, { lang, reduced: reducedPref }) {
  const reduced = () => (typeof reducedPref === "function" ? reducedPref() : !!reducedPref);   // the app passes a function
  const def = SOLUTIONS[id];
  if (!def) return null;
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const [w, h] = def.size, DUR = 2600, HOLD = 900, nSteps = def.steps.length;
  let step = 0, p = reduced() ? 1 : 0, auto = false, raf = 0, started = false;
  root.innerHTML = `
    <div class="sol-anim">
      <svg class="sol-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${t("Animation de la solution", "Solution animation")}"></svg>
      <p class="sol-cap" role="status" aria-live="polite"></p>
      <div class="sol-controls">
        <button class="btn-quiet" data-a="restart" type="button" aria-label="${t("Revenir au début", "Back to the start")}">⏮</button>
        <button class="btn btn-secondary" data-a="prev" type="button">${t("Précédent", "Previous")}</button>
        <button class="btn btn-primary" data-a="play" type="button" aria-pressed="false">${t("Lecture", "Play")}</button>
        <button class="btn btn-secondary" data-a="next" type="button">${t("Suivant", "Next")}</button>
        <span class="sol-count"></span>
      </div>
    </div>`;
  const svg = root.querySelector("svg"), cap = root.querySelector(".sol-cap"), count = root.querySelector(".sol-count");
  const btn = (a) => root.querySelector(`[data-a="${a}"]`), playBtn = btn("play");
  function paint() {
    svg.replaceChildren();
    def.draw(ctxFor(svg, lang), step, p);
    cap.textContent = def.steps[step][lang === "fr" ? 0 : 1];
    count.textContent = `${t("Étape", "Step")} ${step + 1} / ${nSteps}`;
    btn("prev").disabled = step === 0;
    btn("next").disabled = step === nSteps - 1 && p >= 1;
    playBtn.textContent = auto ? t("Pause", "Pause") : step === nSteps - 1 && p >= 1 ? t("Rejouer", "Replay") : t("Lecture", "Play");
    playBtn.setAttribute("aria-pressed", String(auto));
  }
  const halt = () => { auto = false; cancelAnimationFrame(raf); raf = 0; };
  // Animate the current step from its progress p to 1; with auto, carry on to the next steps.
  function run() {
    cancelAnimationFrame(raf);
    let start = performance.now() - p * DUR;
    const tick = (now) => {
      const e = now - start;
      p = Math.min(1, e / DUR);
      paint();
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      if (auto && step < nSteps - 1) {
        if (e < DUR + HOLD) { raf = requestAnimationFrame(tick); return; }
        step += 1; p = 0; start = now; paint(); raf = requestAnimationFrame(tick); return;
      }
      auto = false; raf = 0; paint();
    };
    raf = requestAnimationFrame(tick);
  }
  const show = (k, animated) => { halt(); step = clamp(k, 0, nSteps - 1); p = animated && !reduced() ? 0 : 1; paint(); if (p < 1) run(); };
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    if (a === "restart") show(0, true);
    else if (a === "prev") show(step - 1, false);
    else if (a === "next") { if (p < 1) { halt(); p = 1; paint(); } else show(step + 1, true); }
    else if (auto) { halt(); paint(); }
    else if (reduced()) show(step === nSteps - 1 ? 0 : step + 1, false);
    else { if (step === nSteps - 1 && p >= 1) { step = 0; p = 0; } auto = true; paint(); run(); }
  });
  paint();
  return { stop: halt, start: () => { if (!started && !reduced()) { started = true; auto = true; paint(); run(); } } };
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
void lerp;
