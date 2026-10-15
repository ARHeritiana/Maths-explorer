// Animated solutions: each challenge explains its answer as a short sequence of steps, drawn as SVG.
// A solution is { size: [w, h], steps(q): [[fr, en], ...], draw(ctx, step, p, q) } where q holds the parameters of the
// variation being solved, and draw is a pure function of the step index and the progress p in [0, 1] inside that step,
// so any frame can be reproduced and scrubbed.
// Controls: restart, previous, play or pause, next. With reduced motion nothing plays by itself: each step shows its
// finished state. The caption of the current step is announced in a polite live region.
import { svgEl, colour } from "./challenge-kit.js";
import { triangulate, threeColour, visibility } from "./challenge-geometry.js";
import { SOLUTIONS_2 } from "./challenge-solutions-2.js";
import { SOLUTIONS_3 } from "./challenge-solutions-3.js";
import { comb, josephusOrder, eggPlan, eggCover, eggDrops, graphFor, layoutOf, bridgeGeom, degrees, minRemoval, trailOf } from "./challenge-variants.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ez = (x) => 1 - (1 - clamp01(x)) ** 3;
const seg = (p, a, b) => clamp01((p - a) / (b - a));   // sub-progress of p between a and b
const lerp = (a, b, k) => a + (b - a) * k;
const P = (fr, en) => [fr, en];

function ctxFor(svg, lang) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const line = (x1, y1, x2, y2, attrs = {}) => svgEl("line", { x1, y1, x2, y2, ...attrs }, svg);
  const circ = (cx, cy, r, attrs = {}) => svgEl("circle", { cx, cy, r, ...attrs }, svg);
  const rect = (x, y, width, height, attrs = {}) => svgEl("rect", { x, y, width, height, ...attrs }, svg);
  const text = (x, y, s, attrs = {}) => { const el = svgEl("text", { x, y, ...attrs }, svg); el.textContent = s; return el; };
  const path = (d, attrs = {}) => svgEl("path", { d, ...attrs }, svg);
  // greedy word wrap into several <text> lines of at most `max` characters
  const wrap = (x, y, str, max, attrs = {}, dy = 17) => { const words = String(str).split(" "); let ln = "", k = 0; for (const w of words) { if ((ln + " " + w).trim().length > max) { text(x, y + k++ * dy, ln, attrs); ln = w; } else ln = (ln + " " + w).trim(); } if (ln) text(x, y + k * dy, ln, attrs); };
  return { svg, t, line, circ, rect, text, path, wrap };
}

/* ----------------------------------------------------------------- doors */
const doors = {
  size: [520, 300],
  steps: (q) => { const m = Math.floor(Math.sqrt(q.n)); return [
    P("Passage 1 : on change l’état de toutes les portes. Toutes sont ouvertes.", "Pass 1: every door is toggled. All are open."),
    P("Passage 2 : les multiples de 2 changent d’état et se referment.", "Pass 2: the multiples of 2 are toggled and close again."),
    P("Passage 3 : les multiples de 3 changent d’état.", "Pass 3: the multiples of 3 are toggled."),
    P(`Les passages 4 à ${q.n} défilent. Une porte change d’état à chaque diviseur de son numéro.`, `Passes 4 to ${q.n} run. A door is toggled once for each divisor of its number.`),
    P(`Il reste ${m} portes ouvertes : 1, 4, 9, …, ${m * m}. Les diviseurs vont par paires, sauf quand un nombre est un carré parfait.`, `${m} doors stay open: 1, 4, 9, …, ${m * m}. Divisors come in pairs, except when a number is a perfect square.`),
  ]; },
  draw(c, s, p, q) {
    const N = q.n, cols = N <= 100 ? 10 : N <= 150 ? 15 : 20, rows = Math.ceil(N / cols), w = Math.min(25, 250 / cols), h = Math.min(27, 270 / rows), fs = Math.min(9, w * 0.4);
    const pass = s === 0 ? 1 : s === 1 ? 2 : s === 2 ? 3 : s === 3 ? 3 + Math.round(ez(p) * (N - 3)) : N;
    const open = (d) => { let k = 0; for (let r = 1; r <= pass; r++) if (d % r === 0) k++; return k % 2 === 1; };
    let count = 0;
    for (let d = 1; d <= N; d++) {
      const x = 14 + ((d - 1) % cols) * w, y = 14 + Math.floor((d - 1) / cols) * h, o = open(d), sq = Number.isInteger(Math.sqrt(d));
      if (o) count++;
      c.rect(x, y, w - 3, h - 3, { rx: 4, class: `sol-door${o ? " open" : ""}${s === 4 && sq ? " square" : ""}`, style: o ? `fill:${s === 4 ? colour(2) : colour(0)}` : "" });
      if (w > 14) c.text(x + (w - 3) / 2, y + h * 0.6, d, { class: `sol-tiny${o ? " on" : ""}`, "text-anchor": "middle", style: `font-size:${fs}px` });
    }
    const X0 = 14 + cols * w + 20;
    c.text(X0, 40, `${c.t("Passage", "Pass")} ${pass}`, { class: "sol-sub" });
    if (s === 4) {
      const m = Math.floor(Math.sqrt(N)), d0 = Math.min(36, m * m), divs = []; for (let r = 1; r <= d0; r++) if (d0 % r === 0 && r <= d0 / r) divs.push([r, d0 / r]);
      c.text(X0, 78, c.t(`Porte ${d0} : diviseurs par paires`, `Door ${d0}: divisors in pairs`), { class: "sol-sub" });
      divs.slice(0, 5).forEach(([a, b], i) => c.text(X0, 108 + i * 26, `${a} × ${b}`, { class: a === b ? "sol-hot" : "sol-line", style: a === b ? "" : `fill:${colour(0)}` }));
      if (divs.some(([a, b]) => a === b)) c.wrap(X0, 108 + Math.min(5, divs.length) * 26 + 10, c.t(`${Math.sqrt(d0)} × ${Math.sqrt(d0)} : un diviseur sans partenaire, donc un nombre impair de diviseurs : la porte reste ouverte.`, `${Math.sqrt(d0)} × ${Math.sqrt(d0)}: one divisor with no partner, so an odd number of divisors: the door stays open.`), 30, { class: "sol-small" }, 16);
    } else { c.text(X0, 84, c.t("Ouvertes", "Open"), { class: "sol-sub" }); c.text(X0, 130, count, { class: "sol-big" }); }
  },
};

/* ----------------------------------------------------------------- chess */
const chess = {
  size: [520, 300],
  steps: (q) => { const h = (q.n * q.n) / 2, opp = q.kind === "opp"; return [
    P(`Le plateau a perdu ${opp ? "deux coins opposés" : "deux coins voisins"} : il reste ${q.n * q.n - 2} cases.`, `The board lost ${opp ? "two opposite corners" : "two neighbouring corners"}: ${q.n * q.n - 2} squares remain.`),
    P(opp ? "On colorie en damier. Les deux coins opposés sont de la même couleur." : "On colorie en damier. Les deux coins voisins sont de couleurs différentes.", opp ? "Colour it like a chessboard. Opposite corners have the same colour." : "Colour it like a chessboard. Neighbouring corners have different colours."),
    opp ? P(`On retire deux cases sombres : il reste ${h - 2} cases sombres et ${h} cases claires.`, `Two dark squares are gone: ${h - 2} dark squares and ${h} light squares remain.`) : P(`On retire une case sombre et une claire : il reste ${h - 1} cases de chaque couleur.`, `One dark and one light square are gone: ${h - 1} squares of each colour remain.`),
    P("Un domino couvre toujours une case sombre et une case claire, où qu’on le pose.", "A domino always covers one dark and one light square, wherever it lies."),
    opp ? P(`Au plus ${h - 2} dominos (autant que de cases sombres). On y arrive en pavant chaque rangée à l’horizontale : deux cases claires restent libres. Pas de pavage complet.`, `At most ${h - 2} dominoes (as many as dark squares). Tiling every row horizontally reaches it: two light squares stay free. No complete tiling.`) : P(`Autant de cases de chaque couleur : ${h - 1} dominos, et en pavant chaque rangée à l’horizontale on couvre tout le plateau.`, `Equal numbers of each colour: ${h - 1} dominoes, and tiling every row horizontally covers the whole board.`),
  ]; },
  draw(c, s, p, q) {
    const N = q.n, C = Math.floor(264 / N), X0 = 20, Y0 = 24, gone = (i, j) => (i === 0 && j === 0) || (q.kind === "opp" ? i === N - 1 && j === N - 1 : i === N - 1 && j === 0), dark = (i, j) => (i + j) % 2 === 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const g = gone(i, j), shade = s >= 1 && dark(i, j);
      c.rect(X0 + i * C, Y0 + j * C, C, C, { class: `sol-cell${g ? " gone" : ""}`, style: g ? "" : `fill:${shade ? `color-mix(in srgb, var(--ink) ${Math.round(34 * (s === 1 ? ez(p) : 1))}%, var(--surface))` : "var(--surface)"}` });
    }
    if (s === 1 || s === 2) [[0, 0], q.kind === "opp" ? [N - 1, N - 1] : [N - 1, 0]].forEach(([i, j]) => c.circ(X0 + i * C + C / 2, Y0 + j * C + C / 2, C * 0.45 + 2 * Math.sin(p * 9), { class: "sol-ring" }));
    if (s === 3) {
      const spots = [[2, 1, "h"], [4, 3, "v"], [1, 4, "h"], [N - 3, 2, "v"]], k = Math.min(3, Math.floor(p * 4)), [i, j, o] = spots[k], w = o === "h" ? 2 : 1, h = o === "h" ? 1 : 2;
      c.rect(X0 + i * C + 2, Y0 + j * C + 2, w * C - 4, h * C - 4, { rx: 8, class: "sol-domino" });
      [[i, j], o === "h" ? [i + 1, j] : [i, j + 1]].forEach(([a, b]) => c.circ(X0 + a * C + C / 2, Y0 + b * C + C / 2, C * 0.2, { style: `fill:${dark(a, b) ? "var(--ink)" : "var(--surface)"};stroke:var(--ink);stroke-width:2` }));
    }
    if (s === 4) {   // tile every row horizontally
      const doms = []; for (let j = 0; j < N; j++) { let i = 0; while (i < N - 1) { if (gone(i, j)) { i++; continue; } if (gone(i + 1, j)) { i += 2; continue; } doms.push([i, j]); i += 2; } }
      const shown = Math.floor(ez(p) * doms.length);
      doms.slice(0, shown).forEach(([i, j]) => c.rect(X0 + i * C + 2, Y0 + j * C + 2, 2 * C - 4, C - 4, { rx: 6, class: "sol-domino" }));
      const covered = new Set(); doms.slice(0, shown).forEach(([i, j]) => { covered.add(`${i},${j}`); covered.add(`${i + 1},${j}`); });
      if (shown === doms.length) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (!gone(i, j) && !covered.has(`${i},${j}`)) c.circ(X0 + i * C + C / 2, Y0 + j * C + C / 2, C * 0.4, { class: "sol-ring" });
    }
    const h = (N * N) / 2, dk = q.kind === "opp" ? h - 2 : h - 1, lt = q.kind === "opp" ? h : h - 1, k = s === 2 ? ez(p) : 1, BX = 300, BW = Math.min(150, 520 - BX - 30);
    c.text(BX, 62, `${c.t("Cases sombres", "Dark squares")}${s >= 2 ? ` : ${dk}` : ""}`, { class: "sol-sub" });
    c.rect(BX, 72, BW * (s >= 2 ? dk / h : 0) * k, 22, { rx: 4, style: "fill:var(--ink)" });
    c.text(BX, 120, `${c.t("Cases claires", "Light squares")}${s >= 2 ? ` : ${lt}` : ""}`, { class: "sol-sub" });
    c.rect(BX, 130, BW * (s >= 2 ? lt / h : 0) * k, 22, { rx: 4, style: `fill:${colour(2)}` });
    if (s === 4) { c.wrap(BX, 196, q.kind === "opp" ? c.t(`${dk} dominos au plus : ${dk} + ${dk} cases.`, `${dk} dominoes at most: ${dk} + ${dk} squares.`) : c.t(`${dk} dominos : tout le plateau.`, `${dk} dominoes: the whole board.`), 26, { class: "sol-line" }, 22); c.text(BX, 262, q.kind === "opp" ? `${dk} ≠ ${lt}` : `${dk} = ${lt}`, { class: "sol-big small", style: `fill:${q.kind === "opp" ? "var(--neg)" : "var(--pos)"}` }); }
  },
};

/* ------------------------------------------------------------------- nim */
// A scripted game. With r = n mod (m + 1) > 0 you open with r, then answer each opponent move k with m + 1 − k.
// With r = 0 you open with 1 and the opponent answers so that a multiple of m + 1 is left to you.
function nimScript(q) {
  const b = q.m + 1, r = q.n % b, moves = [];
  let left = q.n, i = 0;
  if (r > 0) { moves.push([1, r]); left -= r; } else { moves.push([1, 1]); left -= 1; }
  while (left > 0) {
    const k = r > 0 ? Math.min(left, ((i * 2) % q.m) + 1) : left % b === 0 ? Math.min(left, 1) : left % b;   // opponent move (the perfect one when r = 0)
    i++; moves.push([2, k]); left -= k;
    if (left > 0) { const reply = Math.min(left, r > 0 ? b - k : 1 + ((i * 3) % q.m)); moves.push([1, reply]); left -= reply; }
  }
  return moves;
}
const nim = {
  size: [520, 300],
  steps: (q) => {
    const b = q.m + 1, r = q.n % b, rounds = Math.floor(q.n / b);
    const out = [r > 0 ? P(`Tu prends ${r} pierre${r > 1 ? "s" : ""} : il en reste ${q.n - r}, soit ${rounds} bloc${rounds > 1 ? "s" : ""} de ${b}. L’adversaire va devoir jouer dans un bloc.`, `You take ${r} stone${r > 1 ? "s" : ""}: ${q.n - r} remain, that is ${rounds} block${rounds > 1 ? "s" : ""} of ${b}. The opponent has to play into a block.`) : P(`${q.n} pierres, c’est ${rounds} blocs de ${b} : quoi que tu prennes, l’adversaire parfait peut compléter à ${b}. Tu prends 1 pierre pour voir.`, `${q.n} stones is ${rounds} blocks of ${b}: whatever you take, a perfect opponent can complete to ${b}. You take 1 stone to see.`)];
    out.push(r > 0 ? P(`Il prend k pierres, tu prends ${b} − k : le bloc de ${b} est complet.`, `They take k, you take ${b} − k: the block of ${b} is complete.`) : P(`Il prend ce qu’il faut pour que ${b} pierres au total partent à chaque tour : un bloc de ${b} se vide, et c’est toi qui reçois un multiple de ${b}.`, `They take what completes ${b} stones in total each round: a block of ${b} empties, and you are the one handed a multiple of ${b}.`));
    if (rounds > 2) out.push(P("Même scénario, bloc après bloc.", "Same story, block after block."));
    out.push(r > 0 ? P(`À la fin, il reste un bloc de ${b} : l’adversaire prend k, tu prends la dernière pierre. Tu gagnes quel que soit k.`, `At the end one block of ${b} remains: they take k, you take the last stone. You win whatever k is.`) : P(`Le multiple de ${b} est toujours pour toi : c’est l’adversaire qui prend la dernière pierre. La réponse est 0.`, `You are always handed the multiple of ${b}: the opponent takes the last stone. The answer is 0.`));
    return out;
  },
  draw(c, s, p, q) {
    const moves = nimScript(q), b = q.m + 1, rounds = Math.floor(q.n / b), last = rounds > 2 ? 3 : 2;
    const total = moves.length, at = (st) => (st === 0 ? 1 : st === 1 ? Math.min(3, total) : st === 2 && rounds > 2 ? Math.min(total, 3 + Math.round(ez(p) * (total - 3))) : total);
    const nShown = at(s), prev = s === 0 ? 0 : at(s - 1);
    const owner = Array(q.n).fill(0), fresh = new Set(); let right = q.n;
    moves.slice(0, nShown).forEach(([who, take], idx) => { for (let k = 0; k < take; k++) { right -= 1; owner[right] = who; if (idx >= prev) fresh.add(right); } });
    const per = q.n <= 30 ? q.n : Math.ceil(q.n / 2), sp = Math.min(23.5, 480 / per), rad = sp * 0.4, left = right;
    for (let i = 0; i < q.n; i++) {
      const row = Math.floor(i / per), x = 22 + (i % per) * sp, y = 100 + row * (rad * 2 + 14), w = owner[i], f = fresh.has(i);
      const fill = w === 1 ? colour(0) : w === 2 ? colour(1) : "var(--surface)";
      c.circ(x, y, rad, { class: "sol-stone", style: `fill:${fill};stroke:${w ? fill : "var(--ink)"};opacity:${w && f ? 0.3 + 0.7 * ez(p) : w ? 0.45 : 1}` });
      if (!w) c.rect(x - rad, y + rad + 3, rad * 2, 4, { rx: 2, style: `fill:${colour(2 + (Math.floor(i / b) % 2) * 2)}` });
    }
    c.text(260, 36, `${left} ${c.t(left > 1 ? "pierres" : "pierre", left > 1 ? "stones" : "stone")}`, { class: "sol-big small", "text-anchor": "middle" });
    c.rect(150, 238, 12, 12, { rx: 3, style: `fill:${colour(0)}` }); c.text(168, 249, c.t("tes pierres", "your stones"), { class: "sol-small" });
    c.rect(290, 238, 12, 12, { rx: 3, style: `fill:${colour(1)}` }); c.text(308, 249, c.t("pierres de l’adversaire", "opponent’s stones"), { class: "sol-small" });
    c.text(260, 214, c.t(`les barres regroupent les pierres restantes par ${b}`, `bars group the remaining stones by ${b}`), { class: "sol-sub", "text-anchor": "middle" });
    void last;
  },
};

/* ------------------------------------------------------------- pigeonhole */
const pigeonhole = {
  size: [520, 300],
  steps: (q) => [
    P(`Il y a ${q.m} restes possibles dans la division par ${q.m} : ${q.m} cases, de 0 à ${q.m - 1}.`, `There are ${q.m} possible remainders on division by ${q.m}: ${q.m} boxes, from 0 to ${q.m - 1}.`),
    P(`${q.m} entiers 0, 1, …, ${q.m - 1} : un par case, aucun reste commun. ${q.m} ne suffisent donc pas.`, `${q.m} integers 0, 1, …, ${q.m - 1}: one per box, no shared remainder. So ${q.m} are not enough.`),
    P(`Un entier de plus, par exemple ${2 * q.m + 1}, doit aller dans une case déjà occupée : ${2 * q.m + 1} a le reste 1, comme 1.`, `One more integer, say ${2 * q.m + 1}, has to go into an occupied box: ${2 * q.m + 1} has remainder 1, like 1.`),
    P(`${2 * q.m + 1} − 1 = ${2 * q.m} = 2 × ${q.m} : deux entiers de même reste ont une différence divisible par ${q.m}. Le minimum est ${q.m + 1}.`, `${2 * q.m + 1} − 1 = ${2 * q.m} = 2 × ${q.m}: two integers with the same remainder differ by a multiple of ${q.m}. The minimum is ${q.m + 1}.`),
  ],
  draw(c, s, p, q) {
    const m = q.m, bw = Math.min(58, 480 / m - 8), step = 480 / m, e = 2 * m + 1;
    for (let r = 0; r < m; r++) {
      const x = 22 + r * step, hot = s >= 2 && r === 1;
      c.rect(x, 150, bw, 100, { rx: 8, class: `sol-box${hot ? " hot" : ""}` });
      c.text(x + bw / 2, 270, `${c.t("reste", "rem.")} ${r}`, { class: "sol-small", "text-anchor": "middle", style: bw < 40 ? "font-size:10px" : "" });
      if (s >= 1) { c.circ(x + bw / 2, 224, Math.min(17, bw / 2 - 2), { class: "sol-ball", style: `fill:${colour(r)};opacity:${s === 1 ? ez(seg(p, r / (m + 1), r / (m + 1) + 0.25)) : 1}` }); c.text(x + bw / 2, 230, r, { class: "sol-ball-n", "text-anchor": "middle", style: bw < 40 ? "font-size:11px" : "" }); }
    }
    if (s >= 2) { const k = s === 2 ? ez(p) : 1, x = 22 + step + bw / 2, y = lerp(50, 188, k); c.circ(x, y, 17, { class: "sol-ball", style: `fill:${colour(7)}` }); c.text(x, y + 6, e, { class: "sol-ball-n", "text-anchor": "middle" }); }
    if (s === 3) c.text(260, 110, `${e} − 1 = ${e - 1} = 2 × ${m}`, { class: "sol-hot", "text-anchor": "middle" });
  },
};

/* --------------------------------------------------------------- squares */
const squares = {
  size: [520, 300],
  steps: (q) => [
    P("On construit un carré de points bordure par bordure. 1 point au centre.", "Build a square of dots border by border. 1 dot in the middle."),
    P("On ajoute une bordure en L de 3 points : 1 + 3 = 4, un carré 2 × 2.", "Add an L-shaped border of 3 dots: 1 + 3 = 4, a 2 × 2 square."),
    P("Puis 5 points : 1 + 3 + 5 = 9, un carré 3 × 3. Puis 7 : 16. Puis 9 : 25. Puis 11 : 36.", "Then 5 dots: 1 + 3 + 5 = 9, a 3 × 3 square. Then 7: 16. Then 9: 25. Then 11: 36."),
    P("La k-ième bordure compte 2k − 1 points, et k bordures forment un carré k × k : 1 + 3 + 5 + … + (2k − 1) = k².", "The kth border has 2k − 1 dots, and k borders make a k × k square: 1 + 3 + 5 + … + (2k − 1) = k²."),
    P(`${2 * q.n - 1} = 2 × ${q.n} − 1 : il y a ${q.n} bordures, la dernière de ${2 * q.n - 1} points. 1 + 3 + … + ${2 * q.n - 1} = ${q.n}² = ${q.n * q.n}.`, `${2 * q.n - 1} = 2 × ${q.n} − 1: there are ${q.n} borders, the last one with ${2 * q.n - 1} dots. 1 + 3 + … + ${2 * q.n - 1} = ${q.n}² = ${q.n * q.n}.`),
  ],
  draw(c, s, p, q) {
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
        const terms = Array.from({ length: k }, (_, qq) => 2 * qq + 1).join(" + ");
        c.text(290, y - 2, `${terms} = ${k * k}`, { class: "sol-line", style: `opacity:${k < upto ? 1 : ez(upto - (k - 1))}` });
      }
    } else {
      const n = q.n, sp = Math.min(13, 250 / n), r = Math.max(1.6, sp * 0.37), ox = 30, oy = 24;
      dots(n, sp, ox, oy, r, s === 4 ? 1 + ez(p) * (n - 1) : n);
      if (s >= 4) { const x0 = ox - sp * 0.7, y0 = oy - sp * 0.7, e = ox + (n - 1) * sp + sp * 0.7, f = oy + (n - 1) * sp + sp * 0.7, ix = ox + (n - 2) * sp + sp * 0.7, iy = oy + (n - 2) * sp + sp * 0.7; c.path(`M${x0} ${iy}H${ix}V${y0}H${e}V${f}H${x0}Z`, { class: "sol-last", style: `opacity:${s === 4 ? ez(seg(p, 0.85, 1)) : 1}` }); }
      const X0 = ox + n * sp + 24;
      c.rect(X0, 60, 14, 14, { rx: 3, style: `fill:${colour(n - 1)}` }); c.text(X0 + 22, 72, c.t(`dernière bordure : ${2 * n - 1} points`, `last border: ${2 * n - 1} dots`), { class: "sol-small" });
      c.text(X0, 130, s === 3 ? "1 + 3 + 5 + … + (2k − 1)" : `1 + 3 + 5 + … + ${2 * n - 1}`, { class: "sol-line" });
      c.text(X0, 170, s === 3 ? "= k²" : `= ${n}² = ${n * n}`, { class: "sol-big small" });
    }
  },
};

/* ------------------------------------------------------------ art gallery */
const GALLERY = new Map();
function gallery(k) {
  if (!GALLERY.has(k)) {
    const poly = comb(k), tris = triangulate(poly), col = threeColour(poly.length, tris), sizes = [0, 1, 2].map((x) => col.filter((v) => v === x).length), best = sizes.indexOf(Math.min(...sizes));
    GALLERY.set(k, { poly, tris, col, sizes, best, tips: Array.from({ length: k }, (_, i) => 2 + 3 * i) });
  }
  return GALLERY.get(k);
}
const GCOL = ["var(--c1)", "var(--c2)", "var(--c3)"];
const artgallery = {
  size: [520, 300],
  steps: (q) => { const n = 3 * (q.n / 3), g = gallery((q.n / 3)); return [
    P(`Une galerie à ${n} murs, en forme de peigne. Combien de gardiens immobiles faut-il pour tout voir ?`, `A gallery with ${n} walls, shaped like a comb. How many fixed guards are needed to see everything?`),
    P(`On découpe la galerie en triangles avec des diagonales intérieures : ${n} − 2 = ${n - 2} triangles. Un gardien placé à un sommet voit tout son triangle.`, `Cut the gallery into triangles with inside diagonals: ${n} − 2 = ${n - 2} triangles. A guard standing at a vertex sees all of its triangle.`),
    P("On colorie les sommets avec 3 couleurs pour que chaque triangle ait trois couleurs différentes.", "Colour the vertices with 3 colours so that every triangle has three different colours."),
    P(`Les couleurs sont portées par ${g.sizes.join(", ")} sommets. Une couleur au plus ⌊${n} ÷ 3⌋ = ${(q.n / 3)} : on met un gardien sur chaque sommet de cette couleur.`, `The colours sit on ${g.sizes.join(", ")} vertices. Some colour is used at most ⌊${n} ÷ 3⌋ = ${(q.n / 3)} times: put a guard on each vertex of that colour.`),
    P(`Chaque triangle contient un sommet de cette couleur, donc est vu : ${(q.n / 3)} gardiens suffisent.`, `Every triangle contains a vertex of that colour, so it is watched: ${(q.n / 3)} guards suffice.`),
    P(`Mais ${(q.n / 3)} sont nécessaires : un point voit au plus une pointe des ${(q.n / 3)} dents. Chaque zone colorée montre d’où l’on voit une pointe.`, `But ${(q.n / 3)} are needed: a point sees at most one of the ${(q.n / 3)} tooth tips. Each coloured zone shows where a tip can be seen from.`),
  ]; },
  draw(c, s, p, q) {
    const { poly, tris, col, best, tips, sizes } = gallery((q.n / 3)), WIDTH = 5 * (q.n / 3) - 2, S = Math.min(24, 420 / WIDTH), OX = (520 - WIDTH * S) / 2, OY = 22;
    const X = (x) => OX + x * S, Y = (y) => OY + (10 - y) * S * 0.92 + 8;
    const d = (pts) => pts.map((v, i) => `${i ? "L" : "M"}${X(v[0]).toFixed(1)} ${Y(v[1]).toFixed(1)}`).join("") + "Z";
    if (s >= 4) poly.forEach((v, i) => { if (col[i] === best) c.path(d(visibility(poly, v)), { class: "sol-vis", style: `opacity:${s === 4 ? ez(p) * 0.9 : 0.25}` }); });
    if (s === 5) tips.forEach((i, k) => c.path(d(visibility(poly, poly[i])), { class: "sol-vis", style: `fill:${colour(k)};opacity:${0.55 * ez(p)}` }));
    c.path(d(poly), { class: "sol-wall" });
    if (s >= 1) tris.forEach(([a, b, e], i) => { const k = ez(seg(s === 1 ? p : 1, i / (tris.length + 1), i / (tris.length + 1) + 0.25)); [[a, b], [b, e], [e, a]].forEach(([u, v]) => c.line(X(poly[u][0]), Y(poly[u][1]), lerp(X(poly[u][0]), X(poly[v][0]), k), lerp(Y(poly[u][1]), Y(poly[v][1]), k), { class: "sol-diag" })); });
    poly.forEach((v, i) => {
      if (s >= 2) { const k = s === 2 ? ez(seg(p, i / (poly.length + 2), i / (poly.length + 2) + 0.3)) : 1; c.circ(X(v[0]), Y(v[1]), 8 * k, { style: `fill:${GCOL[col[i]]};stroke:var(--ink)`, class: "sol-vertex" }); }
      else c.circ(X(v[0]), Y(v[1]), 3.5, { style: "fill:var(--ink)" });
    });
    if (s >= 3) poly.forEach((v, i) => { if (col[i] === best) c.circ(X(v[0]), Y(v[1]), 13 + (s === 3 ? 3 * Math.sin(p * 12) : 0), { class: "sol-ring" }); });
    if (s >= 3) c.text(504, 24, `${sizes.join(" + ")} = ${3 * (q.n / 3)}`, { class: "sol-small", "text-anchor": "end" });
  },
};

/* ------------------------------------------------------------------ eggs */
const eggs = {
  size: [520, 300],
  steps: (q) => {
    const e = Number(q.eggs), plan = eggPlan(e, q.floors), n = plan.drops, f = (d) => eggCover(e, d), fl = plan.floors, gap = (j) => (fl[j] ?? q.floors) - (j ? fl[j - 1] : 0) - 1, cost = (j) => eggDrops(e - 1, Math.max(0, gap(j)));
    return [
      P(`Avec un seul œuf, il faut monter un étage à la fois : jusqu’à ${q.floors} lancers. Avec ${e}, on peut sauter.`, `With one egg you must climb one floor at a time: up to ${q.floors} drops. With ${e} you can skip.`),
      P(`Premier œuf à l’étage ${fl[0]}. S’il se brise, il reste ${e - 1} œuf${e > 2 ? "s" : ""} pour les ${gap(0)} étages en dessous : ${cost(0)} lancers de plus, soit ${1 + cost(0)} en tout.`, `First egg at floor ${fl[0]}. If it breaks, ${e - 1} egg${e > 2 ? "s" : ""} remain for the ${gap(0)} floors below: ${cost(0)} more drops, ${1 + cost(0)} in all.`),
      P(`S’il survit, deuxième lancer à l’étage ${fl[1] ?? q.floors}. S’il se brise là : 2 lancers + ${cost(1)} = ${2 + cost(1)}.`, `If it survives, second drop at floor ${fl[1] ?? q.floors}. If it breaks there: 2 drops + ${cost(1)} = ${2 + cost(1)}.`),
      P(`On diminue le pas à chaque lancer. Étages visés : ${fl.join(", ")}. Chaque cas coûte au plus ${n} lancers.`, `Reduce the step each time. Floors dropped from: ${fl.join(", ")}. Every case costs at most ${n} drops.`),
      e === 2 ? P(`Avec k lancers on couvre k + (k − 1) + … + 1 = k(k + 1) ÷ 2 étages. ${n - 1} lancers : ${f(n - 1)} étages, ${n} lancers : ${f(n)} ≥ ${q.floors}. Minimum : ${n}.`, `With k drops you cover k + (k − 1) + … + 1 = k(k + 1) ÷ 2 floors. ${n - 1} drops: ${f(n - 1)} floors, ${n} drops: ${f(n)} ≥ ${q.floors}. Minimum: ${n}.`) : P(`Avec k lancers et 3 œufs on couvre C(k, 1) + C(k, 2) + C(k, 3) étages. ${n - 1} lancers : ${f(n - 1)} étages, ${n} lancers : ${f(n)} ≥ ${q.floors}. Minimum : ${n}.`, `With k drops and 3 eggs you cover C(k, 1) + C(k, 2) + C(k, 3) floors. ${n - 1} drops: ${f(n - 1)} floors, ${n} drops: ${f(n)} ≥ ${q.floors}. Minimum: ${n}.`),
    ];
  },
  draw(c, s, p, q) {
    const e = Number(q.eggs), plan = eggPlan(e, q.floors), n = plan.drops, fl = plan.floors;
    if (s === 0) {
      const per = 25, rows = Math.ceil(q.floors / per), cw = 450 / per, ch = Math.min(22, 120 / rows), shown = Math.round(ez(p) * q.floors);
      for (let f = 1; f <= q.floors; f++) c.rect(20 + ((f - 1) % per) * cw, 40 + Math.floor((f - 1) / per) * ch, cw - 2.5, ch - 3, { rx: 3, class: "sol-floor", style: `fill:${f <= shown ? colour(0) : "var(--surface)"}` });
      c.text(260, 190, `${c.t("lancers", "drops")} : ${shown}`, { class: "sol-big small", "text-anchor": "middle" });
      c.text(260, 224, c.t("un étage à la fois", "one floor at a time"), { class: "sol-sub", "text-anchor": "middle" });
      return;
    }
    const rows = fl.length, rh = Math.min(20, 250 / rows), W = Math.min(17, 310 / n);
    const reveal = s === 1 ? ez(p) : s === 2 ? 1 + ez(p) : s === 3 ? 2 + ez(p) * Math.max(0, rows - 2) : rows;
    for (let k = 1; k <= rows; k++) {
      const a = clamp01(reveal - (k - 1)); if (a <= 0 && s !== 4) continue;
      const y = 20 + (k - 1) * (rh + 2), f = fl[k - 1], before = k === 1 ? 0 : fl[k - 2], g = f - before - 1, extra = eggDrops(e - 1, Math.max(0, g));
      c.text(34, y + rh * 0.75, `${f}`, { class: "sol-small", "text-anchor": "end", style: `opacity:${a};font-size:${Math.min(13, rh * 0.8)}px` });
      c.rect(40, y, k * W * a, rh - 2, { rx: 3, style: `fill:${colour(0)}` });
      c.rect(40 + k * W, y, extra * W * a, rh - 2, { rx: 3, style: `fill:${colour(1)}` });
      if (rh >= 12) c.text(46 + (k + extra) * W * a, y + rh * 0.75, `${k} + ${extra} = ${k + extra}`, { class: "sol-small", style: `opacity:${a};font-size:${Math.min(13, rh * 0.8)}px` });
    }
    const xn = 40 + n * W; c.line(xn, 14, xn, 20 + rows * (rh + 2), { class: "sol-guide", style: `stroke:${colour(2)};opacity:${s >= 3 ? 1 : 0.6}` });
    c.rect(380, 28, 12, 12, { rx: 3, style: `fill:${colour(0)}` }); c.text(398, 38, c.t("lancers du 1er œuf", "drops of egg 1"), { class: "sol-small" });
    c.rect(380, 50, 12, 12, { rx: 3, style: `fill:${colour(1)}` }); c.text(398, 60, c.t(`lancers avec ${e - 1} œuf${e > 2 ? "s" : ""}`, `drops with ${e - 1} egg${e > 2 ? "s" : ""}`), { class: "sol-small" });
    if (s === 4) { c.text(380, 110, `${c.t("pire cas", "worst case")} : ${n}`, { class: "sol-hot" }); c.text(380, 150, `${eggCover(e, n - 1)} < ${q.floors} ≤ ${eggCover(e, n)}`, { class: "sol-line" }); }
  },
};

/* ----------------------------------------------------------------- hanoi */
function hanoiMoves(n, a, b, cc, out = []) { if (n === 0) return out; hanoiMoves(n - 1, a, cc, b, out); out.push([n, a, cc]); hanoiMoves(n - 1, b, a, cc, out); return out; }
const hanoi = {
  size: [520, 300],
  steps: (q) => {
    const m = Math.min(q.n, 3), HM = hanoiMoves(m, 0, 1, 2), half = 2 ** (m - 1) - 1;
    return [
      P(`${m} disques sur la tige 1${q.n > m ? ` (on anime ${m} disques, la méthode est la même pour ${q.n})` : ""}. Pour libérer le grand disque, il faut d’abord déplacer les autres sur la tige 2.`, `${m} disks on peg 1${q.n > m ? ` (we animate ${m} disks, the method is the same for ${q.n})` : ""}. To free the big disk, the others must first move to peg 2.`),
      ...HM.map((mv, i) => P(`Coup ${i + 1} : le disque ${mv[0]} va de la tige ${mv[1] + 1} à la tige ${mv[2] + 1}.${i < half ? " (on déplace les petits disques)" : i === half ? " (le grand disque, une seule fois)" : " (on ramène les petits disques dessus)"}`, `Move ${i + 1}: disk ${mv[0]} goes from peg ${mv[1] + 1} to peg ${mv[2] + 1}.${i < half ? " (moving the small disks)" : i === half ? " (the big disk, only once)" : " (bringing the small disks back on top)"}`)),
      P(`Pour ${m} disques : ${half} + 1 + ${half} = ${2 ** m - 1} coups. En général u(n) = 2u(n − 1) + 1, donc u(n) = 2ⁿ − 1. Pour ${q.n} disques : ${2 ** q.n - 1} coups.`, `For ${m} disks: ${half} + 1 + ${half} = ${2 ** m - 1} moves. In general u(n) = 2u(n − 1) + 1, so u(n) = 2ⁿ − 1. For ${q.n} disks: ${2 ** q.n - 1} moves.`),
    ];
  },
  draw(c, s, p, q) {
    const m = Math.min(q.n, 3), HM = hanoiMoves(m, 0, 1, 2), last = HM.length + 1;
    const PEG = [100, 260, 420], BASE = 230, DH = 24, pegs = [Array.from({ length: m }, (_, i) => m - i), [], []];
    const done = Math.min(HM.length, Math.max(0, s - 1)), moving = s >= 1 && s <= HM.length ? HM[s - 1] : null;
    for (let i = 0; i < done; i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); }
    let lift = null;
    if (moving) { const [d, a, b] = moving; pegs[a].pop(); lift = { d, a, b }; }
    if (s === last) { for (let i = done; i < HM.length; i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); } }
    c.rect(30, BASE, 460, 8, { rx: 4, class: "hn-base" });
    PEG.forEach((x, i) => { c.rect(x - 4, BASE - 140, 8, 140, { rx: 4, class: "hn-pole" }); c.text(x, 262, `${c.t("Tige", "Peg")} ${i + 1}`, { class: "sol-small", "text-anchor": "middle" }); });
    const disk = (x, y, d) => c.rect(x - (30 + d * 22) / 2, y, 30 + d * 22, DH - 4, { rx: 7, class: "hn-disk", style: `fill:${colour(d - 1)}` });
    pegs.forEach((st, i) => st.forEach((d, k) => disk(PEG[i], BASE - DH * (k + 1), d)));
    if (lift) {
      const { d, a, b } = lift, y0 = BASE - DH * (pegs[a].length + 1), y1 = BASE - DH * (pegs[b].length + 1), top = 54;
      const k1 = ez(seg(p, 0, 0.3)), k2 = ez(seg(p, 0.3, 0.7)), k3 = ez(seg(p, 0.7, 1)), x = lerp(PEG[a], PEG[b], k2), y = p < 0.3 ? lerp(y0, top, k1) : p < 0.7 ? top : lerp(top, y1, k3);
      disk(x, y, d);
    }
    if (s >= 1 && s <= HM.length) c.text(260, 34, `${c.t("Coup", "Move")} ${s} / ${HM.length}`, { class: "sol-big small", "text-anchor": "middle" });
    if (s === last) {
      const N = Math.min(q.n, 8);
      for (let i = 1; i <= N; i++) { const x = 40 + (i - 1) * (440 / Math.max(N - 1, 1)); c.text(x, 56, `n = ${i}`, { class: "sol-small", "text-anchor": "middle" }); c.text(x, 86, 2 ** i - 1, { class: i === q.n ? "sol-hot" : "sol-line", "text-anchor": "middle", style: `opacity:${ez(seg(p, i / (N + 1), i / (N + 1) + 0.2))}` }); }
    }
  },
};

/* ---------------------------------------------------------------- ramsey */
const ramsey = {
  size: [520, 300],
  steps: (q) => Number(q.s) === 3 ? [
    P("Cinq personnes suffisent-elles ? On colorie le pentagone en bleu (amis) et ses diagonales en orange (pas amis).", "Are five people enough? Colour the pentagon blue (friends) and its diagonals orange (not friends)."),
    P("Aucun trio n’a trois traits de la même couleur : cinq personnes ne suffisent pas.", "No trio has three lines of one colour: five people are not enough."),
    P("Avec six personnes, regardons la personne A : elle a 5 relations avec les autres.", "With six people, look at person A: she has 5 relations with the others."),
    P("5 relations, 2 couleurs : au moins 3 de la même couleur (tiroirs). Disons B, C, D, amis de A.", "5 relations, 2 colours: at least 3 of one colour (pigeonhole). Say B, C, D are friends of A."),
    P("Si deux d’entre eux sont amis, par exemple B et C, alors A, B, C sont trois amis.", "If two of them are friends, say B and C, then A, B, C are three friends."),
    P("Sinon B, C, D ne sont amis deux à deux : trois personnes sans amis entre elles. Dans tous les cas, un trio de même couleur : le minimum est 6.", "Otherwise B, C, D are pairwise not friends: three people with no friendship among them. Either way there is a one-colour trio: the minimum is 6."),
  ] : [
    P("Huit personnes en cercle : deux personnes sont amies (bleu) si leurs places diffèrent de 1 ou de 4, sinon non amies (orange). Chacun a 3 amis.", "Eight people in a circle: two are friends (blue) if their seats differ by 1 or 4, otherwise not friends (orange). Everyone has 3 friends."),
    P("Aucun trio d’amis et aucun groupe de 4 inconnus : huit personnes ne suffisent pas.", "No trio of friends and no group of 4 strangers: eight people are not enough."),
    P("Avec 9 personnes, supposons qu’il n’y ait ni trio d’amis ni 4 inconnus. Une personne A a au plus 3 amis : 4 amis seraient deux à deux inconnus.", "With 9 people, suppose there is no trio of friends and no 4 strangers. A person A has at most 3 friends: 4 friends would be pairwise strangers."),
    P("A a au plus 5 inconnus : parmi 6 inconnus, R(3, 3) = 6 donnerait un trio d’amis ou un trio d’inconnus, donc 4 inconnus avec A.", "A has at most 5 strangers: among 6 strangers, R(3, 3) = 6 would give a trio of friends or of strangers, hence 4 strangers with A."),
    P("3 + 5 = 8 : chacun a exactement 3 amis. 9 × 3 = 27 amitiés comptées deux fois : impossible, 27 est impair. Donc R(3, 4) = 9.", "3 + 5 = 8: everyone has exactly 3 friends. 9 × 3 = 27 friendships counted twice: impossible, 27 is odd. So R(3, 4) = 9."),
  ],
  draw(c, s, p, q) {
    const blue = colour(0), orange = colour(1);
    const edge = (A, B, col, dash, k = 1, w = 4) => c.line(A[0], A[1], lerp(A[0], B[0], k), lerp(A[1], B[1], k), { class: "sol-edge", style: `stroke:${col};stroke-width:${w}`, ...(dash ? { "stroke-dasharray": "9 6" } : {}) });
    const node = (v, lab, hot) => { c.circ(v[0], v[1], 15, { class: "sol-node", style: hot ? `stroke:${hot};stroke-width:4` : "" }); c.text(v[0], v[1] + 5, lab, { class: "sol-label", "text-anchor": "middle" }); };
    const ring = (n, i) => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180; return [190 + 105 * Math.cos(a), 150 + 105 * Math.sin(a)]; };
    if (Number(q.s) === 4) {
      if (s <= 1) {
        const n = 8, friend = (i, j) => [1, 4, 7].includes((j - i + n) % n);
        let idx = 0;
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const f = friend(i, j), k = s === 0 ? ez(seg(p, (idx++ / 28) * 0.7, (idx / 28) * 0.7 + 0.3)) : 1; edge(ring(n, i), ring(n, j), f ? blue : orange, !f, k, f ? 4 : 1.8); }
        for (let i = 0; i < n; i++) node(ring(n, i), i + 1);
        c.text(420, 140, s === 1 ? "0" : "3", { class: "sol-big", "text-anchor": "middle" }); c.text(420, 176, s === 1 ? c.t("trio ou groupe interdit", "forbidden group") : c.t("amis chacun", "friends each"), { class: "sol-sub", "text-anchor": "middle" });
        return;
      }
      const n = 9, A = ring(n, 0), fr = s === 2 ? [1, 2, 3, 4] : [1, 2, 3], st = s === 2 ? [5, 6, 7, 8] : [4, 5, 6, 7, 8];
      fr.forEach((i, k) => edge(A, ring(n, i), blue, false, ez(seg(p, k / 6, k / 6 + 0.3))));
      st.forEach((i, k) => edge(A, ring(n, i), orange, true, s === 2 ? ez(seg(p, 0.5 + k / 8, 0.8 + k / 8)) : ez(seg(p, k / 7, k / 7 + 0.3)), 2.5));
      for (let i = 0; i < n; i++) node(ring(n, i), i === 0 ? "A" : "", s === 2 && i >= 1 && i <= 4 ? blue : "");
      if (s === 2) { c.text(420, 120, "4 ?", { class: "sol-big", "text-anchor": "middle" }); c.wrap(420, 156, c.t("4 amis seraient 4 inconnus", "4 friends would be 4 strangers"), 18, { class: "sol-sub", "text-anchor": "middle" }, 20); }
      if (s === 3) { c.text(420, 120, "≤ 5", { class: "sol-big", "text-anchor": "middle" }); c.text(420, 156, c.t("inconnus", "strangers"), { class: "sol-sub", "text-anchor": "middle" }); }
      if (s === 4) { c.text(420, 110, "9 × 3 = 27", { class: "sol-big small", "text-anchor": "middle" }); c.text(420, 146, c.t("impair :", "odd:"), { class: "sol-hot", "text-anchor": "middle", style: "fill:var(--neg)" }); c.text(420, 174, c.t("impossible", "impossible"), { class: "sol-hot", "text-anchor": "middle", style: "fill:var(--neg)" }); }
      return;
    }
    if (s <= 1) {
      for (let i = 0; i < 5; i++) edge(ring(5, i), ring(5, (i + 1) % 5), blue, false, s === 0 ? ez(seg(p, i / 10, i / 10 + 0.2)) : 1);
      for (let i = 0; i < 5; i++) edge(ring(5, i), ring(5, (i + 2) % 5), orange, true, s === 0 ? ez(seg(p, 0.5 + i / 10, 0.7 + i / 10)) : 1, 3);
      for (let i = 0; i < 5; i++) node(ring(5, i), i + 1);
      c.text(400, 140, s === 1 ? "0" : "", { class: "sol-big", "text-anchor": "middle" }); c.text(400, 176, s === 1 ? c.t("trio d’une seule couleur", "one-colour trios") : "", { class: "sol-sub", "text-anchor": "middle" });
      return;
    }
    const V = (i) => ring(6, i), Aq = V(0), friends = [1, 2, 3], others = [4, 5];
    friends.forEach((i, k) => edge(Aq, V(i), blue, false, s === 2 ? ez(seg(p, k / 6, k / 6 + 0.3)) : 1));
    others.forEach((i, k) => edge(Aq, V(i), orange, true, s === 2 ? ez(seg(p, 0.5 + k / 6, 0.8 + k / 6)) : 1, 3));
    if (s === 4) { edge(V(1), V(2), blue, false, ez(p)); c.path(`M${Aq[0]} ${Aq[1]}L${V(1)[0]} ${V(1)[1]}L${V(2)[0]} ${V(2)[1]}Z`, { class: "sol-tri", style: `fill:${blue};opacity:${0.35 * ez(p)}` }); }
    if (s === 5) { [[1, 2], [2, 3], [1, 3]].forEach(([a, b], k) => edge(V(a), V(b), orange, true, ez(seg(p, k / 4, k / 4 + 0.3)), 3)); c.path(`M${V(1)[0]} ${V(1)[1]}L${V(2)[0]} ${V(2)[1]}L${V(3)[0]} ${V(3)[1]}Z`, { class: "sol-tri", style: `fill:${orange};opacity:${0.35 * ez(seg(p, 0.6, 1))}` }); }
    for (let i = 0; i < 6; i++) node(V(i), "ABCDEF"[i], s >= 3 && friends.includes(i) ? blue : "");
    if (s === 2) c.text(400, 150, "5", { class: "sol-big", "text-anchor": "middle" });
  },
};

/* ------------------------------------------------------------ konigsberg */
const konigsberg = {
  size: [520, 300],
  steps: (q) => {
    const g = graphFor(q.g), deg = degrees(g), odd = deg.filter((x) => x % 2).length, best = minRemoval(g), names = [...best].map((i) => `${g.names[g.edges[i][0]]}${g.names[g.edges[i][1]]}`), list = g.names.map((nm, i) => `${nm} ${deg[i]}`).join(", ");
    return [
      P(`${g.names.length} quartiers, ${g.edges.length} ponts. Peut-on les traverser tous exactement une fois ?`, `${g.names.length} districts, ${g.edges.length} bridges. Can we cross every bridge exactly once?`),
      P(`Comptons les ponts qui touchent chaque quartier : ${list}. Il y a ${odd} nombre${odd > 1 ? "s" : ""} impair${odd > 1 ? "s" : ""}.`, `Count the bridges touching each district: ${list}. There ${odd === 1 ? "is" : "are"} ${odd} odd number${odd === 1 ? "" : "s"}.`),
      P("Quand on passe par un quartier, on utilise un pont pour entrer et un pour sortir : deux ponts. Seuls le départ et l’arrivée peuvent laisser un nombre impair.", "Passing through a district uses one bridge to enter and one to leave: two bridges. Only the start and the end can leave an odd number."),
      P(`Un parcours exige donc 0 ou 2 quartiers impairs. Ici ${odd}${odd > 2 ? " : impossible, il faut retirer des ponts" : " : c’est possible"}.`, `So a route needs 0 or 2 odd districts. Here there ${odd === 1 ? "is" : "are"} ${odd}${odd > 2 ? ": impossible, bridges must go" : ": it is possible"}.`),
      best.size ? P(`Retirons ${best.size === 1 ? "le pont" : "les ponts"} ${names.join(", ")} : chaque retrait corrige la parité de deux quartiers, il en reste au plus 2 d’impairs.`, `Remove ${best.size === 1 ? "the bridge" : "the bridges"} ${names.join(", ")}: each removal fixes the parity of two districts, leaving at most 2 odd ones.`) : P("Aucun pont à retirer : le réseau convient déjà.", "No bridge needs to go: the network already works."),
      P(`On peut alors parcourir chaque pont restant une fois. Minimum de ponts à retirer : ${best.size}.`, `Now every remaining bridge can be crossed once. Minimum bridges to remove: ${best.size}.`),
    ];
  },
  draw(c, s, p, q) {
    const g = graphFor(q.g), pos = layoutOf(g), best = minRemoval(g), removed = s >= 4 ? best : new Set(), deg = degrees(g, removed), walk = s === 5 ? trailOf(g, best) : [];
    const prog = s === 5 ? p * walk.length : 0;
    g.edges.forEach((b, i) => {
      const { d } = bridgeGeom(g, i, pos), gone = best.has(i) && s >= 4, w = walk.findIndex((x) => x[0] === i), crossed = s === 5 && w >= 0 && prog > w;
      c.path(d, { class: "sol-bridge", style: `stroke:${gone ? "var(--neg)" : crossed ? colour(2) : "var(--ink-2)"};opacity:${gone ? (s === 4 ? 1 - 0.6 * ez(p) : 0.25) : 1};stroke-dasharray:${gone ? "6 6" : "none"}` });
    });
    g.names.forEach((n, v) => {
      const [x, y] = pos[v], odd = s >= 1 && deg[v] % 2 === 1, ang = Math.atan2(y - 150, x - 260), r = 38;
      c.circ(x, y, 22, { class: "sol-node", style: odd ? `stroke:${colour(3)};stroke-width:4` : "" }); c.text(x, y + 6, n, { class: "sol-label", "text-anchor": "middle" });
      if (s >= 1) c.text(x + r * Math.cos(ang), y + r * Math.sin(ang) + 9, deg[v], { class: "sol-big small", "text-anchor": "middle", style: `fill:${odd ? colour(3) : "var(--ink)"};opacity:${s === 1 ? ez(p) : 1}` });
    });
    if (s === 5 && walk.length) {
      const k = Math.min(walk.length - 1, Math.floor(prog)), [bi, from, to] = walk[k], tt = prog - k, { ctrl } = bridgeGeom(g, bi, pos), A = pos[from], B = pos[to];
      const x = (1 - tt) ** 2 * A[0] + 2 * (1 - tt) * tt * ctrl[0] + tt * tt * B[0], y = (1 - tt) ** 2 * A[1] + 2 * (1 - tt) * tt * ctrl[1] + tt * tt * B[1];
      c.circ(x, y, 9, { style: `fill:${colour(2)};stroke:var(--ink);stroke-width:2` });
    }
    c.text(26, 286, s >= 1 ? `${c.t("Quartiers impairs", "Odd districts")} : ${deg.filter((v) => v % 2).length}` : "", { class: "sol-sub" });
  },
};

/* -------------------------------------------------------------- josephus */
const josephus = {
  size: [520, 300],
  steps: (q) => {
    const k = Number(q.k), { out, last } = josephusOrder(q.n, k);
    if (k === 2) {
      const m = 2 ** Math.floor(Math.log2(q.n)), l = q.n - m;
      return [
        P(`${q.n} personnes en cercle. On saute 1, on élimine 2, on saute 3, on élimine 4, …`, `${q.n} people in a circle. Skip 1, remove 2, skip 3, remove 4, …`),
        l ? P(`Après ${l} éliminations (2, 4, …, ${2 * l}), il reste ${m} personnes : une puissance de 2.`, `After ${l} removals (2, 4, …, ${2 * l}), ${m} people remain: a power of 2.`) : P(`${q.n} est déjà une puissance de 2 : aucune élimination préalable.`, `${q.n} is already a power of 2: no preliminary removals.`),
        P(`Avec ${m} = 2^${Math.log2(m)} personnes, chaque tour retire une personne sur deux et recommence au même point : la personne qu’on saute en premier survit toujours. Ici c’est ${last}.`, `With ${m} = 2^${Math.log2(m)} people, each lap removes every second person and restarts at the same spot: the person skipped first always survives. Here that is ${last}.`),
        P(`On joue la suite : ${last} est bien la dernière personne restante.`, `Play it out: ${last} is indeed the last person standing.`),
        P(`${q.n} = ${m} + ${l} : avec l éliminations pour atteindre une puissance de 2, le survivant est 2l + 1. Ici 2 × ${l} + 1 = ${last}.`, `${q.n} = ${m} + ${l}: with l removals to reach a power of 2, the survivor is 2l + 1. Here 2 × ${l} + 1 = ${last}.`),
      ];
    }
    return [
      P(`${q.n} personnes en cercle. On saute ${k - 1} personnes, on élimine la suivante, et on recommence.`, `${q.n} people in a circle. Skip ${k - 1} people, remove the next one, and carry on.`),
      P(`On joue : les éliminés se succèdent (${out.slice(0, 5).join(", ")}, …).`, `Play it: the removed ones follow one another (${out.slice(0, 5).join(", ")}, …).`),
      P(`Dernière personne restante : ${last}.`, `Last person standing: ${last}.`),
      P(`Il n’y a pas de formule aussi simple qu’avec une élimination sur deux, mais une récurrence : J(1) = 1 et J(n) = (J(n − 1) + ${k} − 1) mod n + 1. On l’applique de n = 2 à n = ${q.n} : J(${q.n}) = ${last}.`, `There is no formula as simple as for every second one, but a recurrence: J(1) = 1 and J(n) = (J(n − 1) + ${k} − 1) mod n + 1. Apply it from n = 2 to n = ${q.n}: J(${q.n}) = ${last}.`),
    ];
  },
  draw(c, s, p, q) {
    const n = q.n, k = Number(q.k), { out, last } = josephusOrder(n, k), P2 = (i) => { const a = ((-90 + (360 * (i - 1)) / n) * Math.PI) / 180; return [170 + 128 * Math.cos(a), 150 + 128 * Math.sin(a)]; };
    const m = 2 ** Math.floor(Math.log2(n)), l = n - m;
    let killed;
    if (k === 2) killed = s === 0 ? Math.round(ez(p) * l) : s === 1 || s === 2 ? l : s === 3 ? l + Math.round(ez(p) * (out.length - l)) : out.length;
    else killed = s === 0 ? 0 : s === 1 ? Math.round(ez(p) * Math.min(out.length, Math.max(6, Math.floor(n / 3)))) : out.length;
    const dead = new Set(out.slice(0, killed)), rad = n > 70 ? 3.2 : n > 45 ? 5 : 9;
    for (let i = 1; i <= n; i++) {
      const [x, y] = P2(i), isDead = dead.has(i), win = s >= 2 && i === last;
      c.circ(x, y, win ? rad + 2 : rad, { class: `js-p${isDead ? " dead" : ""}${win ? " win" : ""}`, style: win || isDead || !(k === 2 && s === 1) ? "" : `fill:${colour(0)}` });
      if (n <= 45) c.text(x, y + 3.5, i, { class: `js-n${isDead ? " dead" : ""}`, "text-anchor": "middle" });
    }
    const left = n - killed;
    c.text(418, 110, k === 2 && s === 2 ? `${m} = 2^${Math.log2(m)}` : k === 2 && s === 4 ? `${n} = ${m} + ${l}` : `${left}`, { class: "sol-big", "text-anchor": "middle", style: k === 2 && (s === 2 || s === 4) ? "font-size:28px" : "" });
    c.text(418, 150, k === 2 && s === 2 ? c.t("le premier sauté survit", "first skipped survives") : k === 2 && s === 4 ? `2 × ${l} + 1 = ${last}` : c.t("personnes restantes", "people left"), { class: k === 2 && s === 4 ? "sol-hot" : "sol-sub", "text-anchor": "middle" });
  },
};

export const SOLUTIONS = { doors, chess, nim, pigeonhole, squares, artgallery, eggs, hanoi, ramsey, konigsberg, josephus, ...SOLUTIONS_2, ...SOLUTIONS_3 };
export const hasSolution = (id) => Object.hasOwn(SOLUTIONS, id);
export const stepsOf = (id, q) => SOLUTIONS[id].steps(q);

/* ----------------------------------------------------------------- player */
export function mountSolution(id, root, { lang, reduced: reducedPref, params = {} }) {
  const reduced = () => (typeof reducedPref === "function" ? reducedPref() : !!reducedPref);   // the app passes a function
  const def = SOLUTIONS[id];
  if (!def) return null;
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const [w, h] = def.size, HOLD = 900, steps = def.steps(params), nSteps = steps.length;
  const durOf = () => (def.dur ? def.dur(step, params) : 2600);   // a solution may pace each step itself
  let step = 0, p = reduced() ? 1 : 0, auto = false, raf = 0, started = false, scene = null;
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
    if (def.mount) { scene ||= (svg.replaceChildren(), def.mount(ctxFor(svg, lang), params)); def.update(scene, step, p, params); }   // built once, then posed
    else { svg.replaceChildren(); def.draw(ctxFor(svg, lang), step, p, params); }
    cap.textContent = steps[step][lang === "fr" ? 0 : 1];
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
    let start = performance.now() - p * durOf();
    const tick = (now) => {
      const e = now - start, DUR = durOf();
      p = Math.min(1, Math.max(0, e / DUR));   // a frame timestamp can predate the start by a few ms
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
