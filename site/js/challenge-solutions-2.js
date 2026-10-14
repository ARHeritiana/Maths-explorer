// Animated solutions of the classic puzzles (see challenge-solutions.js for the format: { size, steps(q), draw(c, step, p, q) }).
import { colour } from "./challenge-kit.js";
import { bridge } from "./solution-bridge.js";
import { pascalGrid, gridPaths, horseRaces, cakeCream, QUEENS, queensK, unattacked, snailDown, snailTrace, snailDays, bridgePlans, bridgeTimes, bridgeBest, eggWeighings, splitThree, minSample, classicSample } from "./challenge-puzzles.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ez = (x) => 1 - (1 - clamp01(x)) ** 3;
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const P = (fr, en) => [fr, en];
const ink = { "text-anchor": "middle" };

/* ------------------------------------------------------------ grid paths */
const SAMPLE = (m, n) => { const w = []; let r = m, u = n; while (r || u) { if (r && (w.length % 2 === 0 || !u)) { w.push("R"); r--; } else { w.push("U"); u--; } } return w; };
const gridpaths = {
  size: [520, 300],
  steps: (q) => [
    P(`Une grille de ${q.m} × ${q.n} carrés : on va de A (en bas à gauche) à B (en haut à droite), en n’allant que vers la droite ou vers le haut.`, `A grid of ${q.m} × ${q.n} squares: we go from A (bottom left) to B (top right), moving only right or up.`),
    P(`Voici un chemin. Quel qu’il soit, il comporte exactement ${q.m} pas vers la droite et ${q.n} pas vers le haut : ${q.m + q.n} pas en tout.`, `Here is one path. Whatever it is, it has exactly ${q.m} steps to the right and ${q.n} steps up: ${q.m + q.n} steps in all.`),
    P(`Écrivons-le comme un mot de ${q.m + q.n} lettres (D = droite, H = haut). Choisir un chemin, c’est choisir les ${q.n} places des lettres H parmi les ${q.m + q.n} : C(${q.m + q.n}, ${q.n}) possibilités.`, `Write it as a word of ${q.m + q.n} letters (R = right, U = up). Choosing a path means choosing the ${q.n} places of the U’s among the ${q.m + q.n}: C(${q.m + q.n}, ${q.n}) possibilities.`),
    P("Autre méthode : écrivons en chaque point le nombre de chemins qui y mènent. On y arrive de la gauche ou d’en dessous : on additionne les deux voisins.", "Another method: write at every point the number of paths leading to it. You arrive from the left or from below: add the two neighbours."),
    P(`Ces nombres sont ceux du triangle de Pascal, lus en diagonale. En B on lit C(${q.m + q.n}, ${q.n}) = ${gridPaths(q.m, q.n)} : les deux méthodes concordent.`, `These are the numbers of Pascal’s triangle, read along diagonals. At B we read C(${q.m + q.n}, ${q.n}) = ${gridPaths(q.m, q.n)}: both methods agree.`),
  ],
  draw(c, s, p, q) {
    const m = q.m, n = q.n, X0 = 50, Y0 = 36, DX = Math.min(44, 420 / m), DY = Math.min(40, 220 / n), px = (i) => X0 + i * DX, py = (j) => Y0 + (n - j) * DY, g = pascalGrid(m, n);
    for (let j = 0; j <= n; j++) c.line(px(0), py(j), px(m), py(j), { stroke: "var(--line-strong)", "stroke-width": 1 });
    for (let i = 0; i <= m; i++) c.line(px(i), py(0), px(i), py(n), { stroke: "var(--line-strong)", "stroke-width": 1 });
    const w = SAMPLE(m, n), shown = s === 1 ? ez(p) * w.length : s === 2 ? w.length : 0;
    if (s >= 1 && s <= 2) {
      let i = 0, j = 0; const pts = [[0, 0]];
      for (let k = 0; k < Math.floor(shown); k++) { w[k] === "R" ? i++ : j++; pts.push([i, j]); }
      if (shown < w.length) { const k = Math.floor(shown), f = shown - k; if (k < w.length) pts.push([i + (w[k] === "R" ? f : 0), j + (w[k] === "U" ? f : 0)]); }
      c.path(`M${pts.map(([a, b]) => `${px(a)} ${py(b)}`).join("L")}`, { fill: "none", stroke: colour(1), "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" });
    }
    if (s <= 2) { for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) c.circ(px(i), py(j), 4, { fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.5 }); }
    if (s === 2) {
      const word = w.map((x) => (x === "R" ? c.t("D", "R") : c.t("H", "U"))), cell = Math.min(24, 440 / word.length), x0 = 260 - (cell * word.length) / 2, k = Math.floor(ez(p) * word.length + 0.001);
      word.forEach((ch, i) => { const on = i < k + 1, isU = w[i] === "U"; c.rect(x0 + i * cell, 266, cell - 2, 20, { rx: 4, fill: on ? (isU ? colour(2) : colour(0)) : "var(--surface)", stroke: "var(--ink)", "stroke-width": 1 }); c.text(x0 + i * cell + cell / 2 - 1, 281, ch, { ...ink, class: "sol-small", style: `fill:${on ? "#fff" : "var(--ink)"}` }); });
    }
    if (s >= 3) {
      const diagShown = s === 3 ? Math.floor(ez(p) * (m + n + 1) + 0.0001) : m + n + 1;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) {
        const on = i + j < diagShown, big = g[j][i], last = i === m && j === n;
        c.circ(px(i), py(j), 12, { fill: on ? (last && s === 4 ? colour(2) : "var(--surface)") : "var(--surface)", stroke: on ? "var(--ink)" : "var(--line-strong)", "stroke-width": on ? 1.5 : 1 });
        if (on) c.text(px(i), py(j) + 4, big, { ...ink, style: `font:700 ${big > 9999 ? 7 : big > 999 ? 8 : big > 99 ? 9 : 11}px var(--body);fill:${last && s === 4 ? "#fff" : "var(--ink)"}` });
      }
      if (s === 3 && diagShown >= 2 && diagShown <= m + n) { const d = diagShown - 1; for (let i = 0; i <= m; i++) { const j = d - i; if (j >= 1 && j <= n && i >= 1) c.path(`M${px(i - 1)} ${py(j)}L${px(i)} ${py(j)}M${px(i)} ${py(j - 1)}L${px(i)} ${py(j)}`, { fill: "none", stroke: colour(1), "stroke-width": 2.5, "stroke-linecap": "round" }); } }
    }
    c.text(px(0) - 14, py(0) + 22, "A", { ...ink, class: "sol-label" }); c.text(px(m) + 14, py(n) - 10, "B", { ...ink, class: "sol-label" });
    if (s === 4) c.text(260, 288, `C(${m + n}, ${n}) = ${gridPaths(m, n)}`, { ...ink, class: "sol-hot" });
  },
};

/* ---------------------------------------------------------------- horses */
const LETTERS = "ABCDE";
const horses = {
  size: [520, 300],
  steps: (q) => Number(q.top) === 3 ? [
    P("25 chevaux, courses de 5 au plus. Courses 1 à 5 : on les fait courir par groupes de 5. Chaque colonne est classée, le plus rapide du groupe en haut.", "25 horses, races of at most 5. Races 1 to 5: they race in groups of 5. Each column is ranked, the fastest of the group on top."),
    P("Course 6 : les 5 vainqueurs. On renomme les groupes A, B, C, D, E dans l’ordre d’arrivée de leurs vainqueurs : A1 est plus rapide que B1, qui l’est plus que C1…", "Race 6: the 5 winners. Rename the groups A, B, C, D, E in the order their winners finish: A1 is faster than B1, which is faster than C1…"),
    P("A1 bat son groupe et les 4 autres vainqueurs, donc tous les chevaux : A1 est le premier du classement général.", "A1 beats its own group and the 4 other winners, hence every horse: A1 is first overall."),
    P("Qui peut être 2e ou 3e ? Un cheval qui a déjà 3 chevaux devant lui est éliminé (en gris). Il reste 5 candidats : A2, A3, B1, B2, C1.", "Who can be 2nd or 3rd? A horse with 3 horses already ahead of it is out (greyed). Five candidates remain: A2, A3, B1, B2, C1."),
    P("Course 7 : ces 5 candidats. Les deux premiers sont les 2e et 3e de l’ensemble. En tout 7 courses.", "Race 7: these 5 candidates. The first two are 2nd and 3rd overall. In all, 7 races."),
  ] : [
    P("25 chevaux, courses de 5 au plus. Courses 1 à 5 : cinq groupes de 5, chacun classé.", "25 horses, races of at most 5. Races 1 to 5: five groups of 5, each ranked."),
    P("Course 6 : les 5 vainqueurs. Le vainqueur de cette course bat son groupe et les 4 autres vainqueurs, donc tous les chevaux : c’est le plus rapide.", "Race 6: the 5 winners. The winner of that race beats its own group and the 4 other winners, hence every horse: it is the fastest."),
    P("On ne peut pas faire moins : 24 chevaux doivent perdre au moins une fois, une course de 5 chevaux fait au plus 4 perdants, et 5 courses font au plus 20 perdants. Il faut donc 6 courses.", "One cannot do fewer: 24 horses must lose at least once, a race of 5 horses makes at most 4 losers, and 5 races make at most 20 losers. So 6 races are needed."),
  ],
  draw(c, s, p, q) {
    const top3 = Number(q.top) === 3, CW = 58, X0 = 60, Y0 = 56, RH = 34, order = [2, 0, 4, 1, 3];   // heat shown in column i before the renaming: heat order[i]
    const moved = s === 1 ? ez(seg(p, 0.1, 0.9)) : s >= 2 ? 1 : 0;
    const colX = (heat) => { const before = order.indexOf(heat); return lerp(X0 + before * CW, X0 + heat * CW, moved); };
    const letter = (heat) => LETTERS[heat];
    const grey = (g, r) => top3 && s >= 3 && !((g === 0 && (r === 1 || r === 2)) || (g === 1 && (r === 0 || r === 1)) || (g === 2 && r === 0) || (g === 0 && r === 0));
    for (let g = 0; g < 5; g++) {
      const x = colX(g), shownLetters = s >= 1 && moved > 0.5;
      c.text(x + CW / 2 - 4, 40, shownLetters ? letter(g) : `${c.t("groupe", "group")} ${order[g] + 1}`, { ...ink, class: shownLetters ? "sol-label" : "sol-small" });
      for (let r = 0; r < 5; r++) {
        const win = r === 0 && s >= 1 && s <= 1, isA1 = g === 0 && r === 0 && s >= 2, cand = top3 && s >= 3 && !grey(g, r) && !(g === 0 && r === 0), gr = grey(g, r);
        c.rect(x, Y0 + r * RH, CW - 8, RH - 6, { rx: 7, fill: isA1 ? colour(6) : cand ? colour(2) : `color-mix(in srgb, ${colour(g)} ${gr ? 14 : 55}%, var(--surface))`, stroke: win ? "var(--ink)" : "var(--line-strong)", "stroke-width": win ? 3 : 1, opacity: gr ? 0.55 : 1 });
        c.text(x + (CW - 8) / 2, Y0 + r * RH + 20, s >= 2 || (s === 1 && moved > 0.5) ? `${letter(g)}${r + 1}` : `${r + 1}`, { ...ink, class: "sol-small", style: `font-weight:700;fill:${isA1 || cand ? "#fff" : "var(--ink)"}` });
      }
    }
    if (s === 0 || (s === 1 && p < 0.1)) c.text(60 + 2.5 * CW - 6, 262, c.t("5 courses : une par groupe", "5 races: one per group"), { ...ink, class: "sol-sub" });
    if (s === 1) { c.rect(X0 - 4, Y0 - 3, 5 * CW - 2, RH, { rx: 9, fill: "none", stroke: colour(1), "stroke-width": 3 }); c.text(60 + 2.5 * CW - 6, 262, c.t("Course 6 : les cinq vainqueurs", "Race 6: the five winners"), { ...ink, class: "sol-sub" }); }
    if (s === 2) c.text(60 + 2.5 * CW - 6, 262, c.t("A1 est premier de tous", "A1 is first of all"), { ...ink, class: "sol-hot" });
    if (top3 && s === 4) { c.text(60 + 2.5 * CW - 6, 262, c.t("Course 7 : A2, A3, B1, B2, C1", "Race 7: A2, A3, B1, B2, C1"), { ...ink, class: "sol-sub" }); c.text(440, 120, "7", { ...ink, class: "sol-big" }); c.text(440, 146, c.t("courses", "races"), { ...ink, class: "sol-sub" }); }
    if (top3 && s === 3) c.text(60 + 2.5 * CW - 6, 262, c.t("En gris : au moins 3 chevaux devant", "Grey: at least 3 horses ahead"), { ...ink, class: "sol-sub" });
    if (!top3 && s >= 1) { c.text(440, 120, String(horseRaces(1)), { ...ink, class: "sol-big" }); c.text(440, 146, c.t("courses", "races"), { ...ink, class: "sol-sub" }); }
    if (!top3 && s === 2) c.text(60 + 2.5 * CW - 6, 262, c.t("24 perdants ÷ 4 par course = 6 courses", "24 losers ÷ 4 per race = 6 races"), { ...ink, class: "sol-sub" });
  },
};

/* ------------------------------------------------------------------ cake */
const sq = (t) => { const s = ((t % 4) + 4) % 4, k = Math.floor(s), u = s - k; return [[u, 0], [1, u], [1 - u, 1], [0, 1 - u]][k]; };
const cake = {
  size: [520, 300],
  steps: (q) => { const a = Number(q.a), n = Number(q.n); return [
    P(`Un gâteau cubique de ${a} cm d’arête, avec de la crème sur le dessus et les quatre côtés. Vu de dessus : un carré de côté ${a} cm. On veut ${n} parts égales en gâteau et en crème.`, `A cubic cake with ${a} cm edges, with cream on the top and the four sides. Seen from above: a square of side ${a} cm. We want ${n} portions equal in cake and in cream.`),
    P(`Partageons le contour du carré (périmètre ${4 * a} cm) en ${n} longueurs égales de ${(4 * a) / n} cm : on marque ${n} points, en partant d’où l’on veut.`, `Divide the outline of the square (perimeter ${4 * a} cm) into ${n} equal lengths of ${(4 * a) / n} cm: mark ${n} points, starting anywhere.`),
    P("On coupe verticalement du centre jusqu’à chaque point. Chaque part a la même longueur de croûte.", "Cut vertically from the centre to each point. Every portion has the same length of crust."),
    P(`Dessus d’une part : des triangles de sommet le centre. Chaque côté du carré est à la même distance a/2 = ${a / 2} cm du centre, donc l’aire est ½ × longueur de croûte × a/2 : proportionnelle à la croûte, même si la part contient un coin.`, `Top of a portion: triangles with their apex at the centre. Every side of the square is at the same distance a/2 = ${a / 2} cm from the centre, so the area is ½ × crust length × a/2: proportional to the crust, even if the portion contains a corner.`),
    P(`Volume = aire × a, crème des côtés = croûte × a, crème du dessus ∝ aire : tout est proportionnel à la croûte, donc égal pour toutes les parts. Crème totale a² + 4a² = ${5 * a * a} cm², donc ${cakeCream(a, n)} cm² par part.`, `Volume = area × a, side cream = crust × a, top cream ∝ area: everything is proportional to the crust, hence equal for all portions. Total cream a² + 4a² = ${5 * a * a} cm², so ${cakeCream(a, n)} cm² per portion.`),
  ]; },
  draw(c, s, p, q) {
    const n = Number(q.n), X0 = 70, Y0 = 30, S = 230, T0 = 0.35, P2 = (pt) => [X0 + pt[0] * S, Y0 + (1 - pt[1]) * S], cuts = Array.from({ length: n }, (_, i) => T0 + (4 * i) / n);
    const poly = (k) => { const a = cuts[k], b = k + 1 < n ? cuts[k + 1] : cuts[0] + 4, pts = [[0.5, 0.5], sq(a)]; for (let u = Math.floor(a) + 1; u < b; u++) pts.push(sq(u)); pts.push(sq(b)); return pts; };
    if (s === 0) {   // oblique view of the cube with cream
      const w = 150, d = 60, x = 170, y = 90;
      c.path(`M${x} ${y}L${x + w} ${y}L${x + w + d} ${y - d}L${x + d} ${y - d}Z`, { fill: "#fff8e1", stroke: "var(--ink)", "stroke-width": 2 });
      c.path(`M${x} ${y}L${x + w} ${y}L${x + w} ${y + w}L${x} ${y + w}Z`, { fill: "#fff3c4", stroke: "var(--ink)", "stroke-width": 2 });
      c.path(`M${x + w} ${y}L${x + w + d} ${y - d}L${x + w + d} ${y + w - d}L${x + w} ${y + w}Z`, { fill: "#ffe9a0", stroke: "var(--ink)", "stroke-width": 2 });
      c.text(x + w / 2, y + w / 2 + 6, c.t("crème", "cream"), { ...ink, class: "sol-sub", style: "fill:#7a5c00" });
      c.text(260, 290, c.t("dessus + 4 côtés", "top + 4 sides"), { ...ink, class: "sol-sub" });
      return;
    }
    c.rect(X0, Y0, S, S, { fill: "#fff3c4", stroke: "var(--ink)", "stroke-width": 3 });
    if (s >= 2) for (let k = 0; k < n; k++) c.path(`M${poly(k).map((pt) => P2(pt).join(" ")).join("L")}Z`, { fill: `color-mix(in srgb, ${colour(k)} 50%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2, opacity: s === 2 ? ez(seg(p, 0, 0.8)) : 1 });
    const shownPts = s === 1 ? Math.floor(ez(p) * n + 0.001) : n;
    if (s >= 1) cuts.slice(0, shownPts).forEach((t, k) => { const [x, y] = P2(sq(t)); c.circ(x, y, 7, { fill: colour(k), stroke: "var(--ink)", "stroke-width": 2 }); });
    if (s === 1) { const tx = c.text(X0 + S / 2, Y0 + S + 28, `${n} × ${(4 * Number(q.a)) / n} cm = ${4 * Number(q.a)} cm`, { ...ink, class: "sol-sub" }); void tx; }
    c.circ(...P2([0.5, 0.5]), 4, { fill: "var(--ink)" });
    if (s === 3) {   // the portion containing a corner (or the first one), split into triangles with the same height a/2
      const k = cuts.findIndex((_, i) => { const a = cuts[i], b = i + 1 < n ? cuts[i + 1] : cuts[0] + 4; return Math.floor(a) + 1 < b; }), kk = k < 0 ? 0 : k, pts = poly(kk), prog = ez(p);
      for (let i = 1; i < pts.length - 1; i++) { const A = P2(pts[i]), B = P2(pts[i + 1]); c.path(`M${P2(pts[0]).join(" ")}L${A.join(" ")}L${B.join(" ")}Z`, { fill: "none", stroke: "var(--ink)", "stroke-width": 3, opacity: i / pts.length < prog ? 1 : 0 }); }
      pts.slice(1, -1).forEach((pt) => c.line(...P2([0.5, 0.5]), ...P2(pt), { stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "4 4", opacity: prog }));
      c.text(440, 120, "½ × ℓ × a/2", { ...ink, class: "sol-line" }); c.text(440, 146, c.t("par triangle", "per triangle"), { ...ink, class: "sol-sub" });
    }
    if (s === 4) { c.text(450, 110, `${cakeCream(Number(q.a), n)} cm²`, { ...ink, class: "sol-hot" }); c.text(450, 136, c.t("de crème par part", "of cream per portion"), { ...ink, class: "sol-sub" }); }
  },
};

/* ---------------------------------------------------------------- queens */
const queens = {
  size: [520, 300],
  steps: (q) => { const k = queensK(q.n, q.k), [best, ex] = QUEENS[`${q.n},${k}`]; return [
    P(`Un échiquier de ${q.n} × ${q.n} cases et ${k} dame${k > 1 ? "s" : ""}. On veut laisser le plus de cases libres, c’est-à-dire ni occupées ni attaquées.`, `A ${q.n} × ${q.n} board and ${k} queen${k > 1 ? "s" : ""}. We want to leave as many free squares as possible, that is, neither occupied nor attacked.`),
    P("Posons les dames une à une : chacune attaque sa ligne, sa colonne et ses diagonales, jusqu’à la première pièce rencontrée. Les cases attaquées sont en rouge.", "Place the queens one by one: each attacks its row, column and diagonals, up to the first piece in the way. Attacked squares are red."),
    P(`Il reste ${best} case${best > 1 ? "s" : ""} libre${best > 1 ? "s" : ""} (en vert). Les dames sont groupées : elles se gênent mutuellement et attaquent peu de lignes différentes.`, `${best} free square${best > 1 ? "s" : ""} remain (green). The queens are grouped: they block each other and cover few different lines.`),
    P(`On ne peut pas faire mieux : un ordinateur a examiné les ${(() => { let cc = 1; for (let i = 0; i < k; i++) cc = (cc * (q.n * q.n - i)) / (i + 1); return Math.round(cc); })()} placements possibles et aucun ne laisse plus de ${best} case${best > 1 ? "s" : ""} libre${best > 1 ? "s" : ""}. Ce n’est pas une preuve à la main.`, `One cannot do better: a computer examined all ${(() => { let cc = 1; for (let i = 0; i < k; i++) cc = (cc * (q.n * q.n - i)) / (i + 1); return Math.round(cc); })()} possible placements and none leaves more than ${best} free square${best > 1 ? "s" : ""}. This is not a hand proof.`),
  ]; },
  draw(c, s, p, q) {
    const n = q.n, k = queensK(n, q.k), [best, ex] = QUEENS[`${n},${k}`], C = Math.floor(260 / n), X0 = 30, Y0 = 20;
    const placed = s === 0 ? 0 : s === 1 ? Math.min(k, Math.floor(ez(seg(p, 0, 0.85)) * k + 0.001)) : k, qs = ex.slice(0, placed), free = new Set(unattacked(n, qs));
    for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
      const sq2 = r * n + col, isQ = qs.includes(sq2), isFree = free.has(sq2) && placed > 0, attacked = !isQ && !free.has(sq2);
      c.rect(X0 + col * C, Y0 + r * C, C, C, { fill: isQ ? colour(1) : s >= 2 && isFree ? `color-mix(in srgb, ${colour(2)} 60%, var(--surface))` : attacked && placed ? "color-mix(in srgb, var(--neg) 22%, var(--surface))" : (r + col) % 2 ? "var(--sunken)" : "var(--surface)", stroke: "var(--line-strong)", "stroke-width": 1 });
      if (isQ) c.text(X0 + col * C + C / 2, Y0 + r * C + C * 0.68, "♛", { ...ink, style: `font:${C * 0.7}px var(--body);fill:#fff` });
    }
    c.text(420, 90, `${placed} / ${k}`, { ...ink, class: "sol-big small" }); c.text(420, 112, c.t("dames posées", "queens placed"), { ...ink, class: "sol-sub" });
    if (s >= 1) { c.text(420, 170, String(free.size), { ...ink, class: s >= 2 ? "sol-hot" : "sol-big small" }); c.text(420, 192, c.t("cases libres", "free squares"), { ...ink, class: "sol-sub" }); }
    if (s === 3) c.text(420, 240, c.t(`maximum : ${best}`, `maximum: ${best}`), { ...ink, class: "sol-line" });
  },
};

/* ----------------------------------------------------------------- snail */
const snail = {
  size: [520, 300],
  steps: (q) => { const d = snailDown(q.up, q.down), g = q.up - d, days = snailDays(q.h, q.up, q.down); return [
    P(`Un poteau de ${q.h} m. Chaque jour l’escargot monte de ${q.up} m, chaque nuit il redescend de ${d} m. Que se passe-t-il au fil des jours ?`, `A ${q.h} m post. Each day the snail climbs ${q.up} m, each night it slips ${d} m. What happens as the days go by?`),
    P(`Jour après jour, la hauteur monte en dents de scie. Chaque jour complet fait gagner ${q.up} − ${d} = ${g} m.`, `Day after day the height rises like a saw blade. Each full day gains ${q.up} − ${d} = ${g} m.`),
    P(`Le dernier jour, l’escargot atteint le sommet : il n’y a pas de nuit pour le faire glisser. Il lui suffit de démarrer ce jour-là à au moins ${Math.max(0, q.h - q.up)} m.`, `On the last day the snail reaches the top: there is no night to make it slip. It is enough to start that day at ${Math.max(0, q.h - q.up)} m or more.`),
    P(`Il faut ⌈${Math.max(0, q.h - q.up)}/${g}⌉ = ${Math.ceil(Math.max(0, q.h - q.up) / g)} jour${Math.ceil(Math.max(0, q.h - q.up) / g) > 1 ? "s" : ""} complet${Math.ceil(Math.max(0, q.h - q.up) / g) > 1 ? "s" : ""}, puis le jour de la montée finale : jour ${days}.`, `It takes ⌈${Math.max(0, q.h - q.up)}/${g}⌉ = ${Math.ceil(Math.max(0, q.h - q.up) / g)} full day${Math.ceil(Math.max(0, q.h - q.up) / g) > 1 ? "s" : ""}, then the day of the final climb: day ${days}.`),
  ]; },
  draw(c, s, p, q) {
    const H = q.h, d = snailDown(q.up, q.down), tr = snailTrace(H, q.up, q.down), steps = []; tr.forEach((x) => { steps.push(x.peak); if (!x.done) steps.push(x.end); });
    const PY0 = 30, PY1 = 270, py = (h) => PY1 - (h / H) * (PY1 - PY0), total = steps.length, px = (i) => 130 + (i / Math.max(total, 1)) * 370;
    c.rect(52, PY0, 16, PY1 - PY0, { rx: 4, fill: "color-mix(in srgb, var(--c7) 45%, var(--surface))", stroke: "var(--ink)", "stroke-width": 1.5 });
    c.line(130, py(H), 505, py(H), { stroke: colour(2), "stroke-width": 2, "stroke-dasharray": "6 5" }); c.line(130, PY1, 505, PY1, { stroke: "var(--line-strong)" });
    c.text(505, py(H) - 6, `${H} m`, { "text-anchor": "end", class: "sol-label" });
    const half = s === 0 ? 0 : s === 1 ? ez(seg(p, 0, 0.95)) * total : total, k = Math.floor(half), f = half - k;
    const pts = [[0, 0], ...steps.slice(0, k).map((h, i) => [i + 1, h])];
    if (k < total) pts.push([k + f, lerp(k === 0 ? 0 : steps[k - 1], steps[k], f)]);
    if (s >= 1) c.path(`M${pts.map(([i, h]) => `${px(i)} ${py(h)}`).join("L")}`, { fill: "none", stroke: colour(0), "stroke-width": 4, "stroke-linejoin": "round" });
    if (s >= 1) { const [i, h] = pts.at(-1); c.circ(px(i), py(h), 6, { fill: colour(0) }); }
    if (s === 3) c.text(300, 292, `${c.t("jour", "day")} ${snailDays(H, q.up, q.down)}`, { ...ink, class: "sol-hot" });
    void d;
  },
};

/* ------------------------------------------------------------ light egg */
const lighteggs = {
  size: [520, 300],
  steps: (q) => { const k = eggWeighings(q.n); let size = q.n; const out = [P(`${q.n} œufs, un seul plus léger. Une balance à deux plateaux a trois issues : gauche plus léger, droite plus léger, équilibre.`, `${q.n} eggs, one lighter. A two-pan balance has three outcomes: left lighter, right lighter, balanced.`)];
    for (let i = 0; i < k; i++) { const [a, , r] = splitThree(size, k - i); out.push(P(`Pesée ${i + 1} : ${size} œufs suspects, en trois paquets : ${a} à gauche, ${a} à droite, ${r} à côté. Au pire il reste ${Math.max(a, r)} suspect${Math.max(a, r) > 1 ? "s" : ""}.`, `Weighing ${i + 1}: ${size} suspect eggs in three piles: ${a} on the left, ${a} on the right, ${r} aside. At worst ${Math.max(a, r)} suspect${Math.max(a, r) > 1 ? "s" : ""} remain.`)); size = Math.max(a, r); }
    out.push(P(`Après ${k} pesée${k > 1 ? "s" : ""}, un seul œuf reste : l’abîmé. On ne peut pas faire moins : ${k} pesées distinguent au plus 3^${k} = ${3 ** k} cas, et il en faut ${q.n}.`, `After ${k} weighing${k > 1 ? "s" : ""}, one egg is left: the spoiled one. One cannot do fewer: ${k} weighings tell apart at most 3^${k} = ${3 ** k} cases, and ${q.n} are needed.`)); return out; },
  draw(c, s, p, q) {
    const N = q.n, K = eggWeighings(N), cols = Math.min(N, Math.ceil(Math.sqrt(N * 1.4))), rows = Math.ceil(N / cols), size = Math.min(34, 270 / cols, 250 / rows), ox = 20, oy = 30;
    let lo = 0, cur = N; const rangeAt = []; for (let i = 0; i < K; i++) { const [a, , r] = splitThree(cur, K - i); rangeAt.push({ lo, cur, a, r }); if (a >= r) { cur = a; } else { lo += 2 * a; cur = r; } }
    const w = s >= 1 && s <= K ? rangeAt[s - 1] : null, last = s > K ? { lo: rangeAt.length ? (() => { const z = rangeAt.at(-1); return z.a >= z.r ? z.lo : z.lo + 2 * z.a; })() : 0 } : null;
    for (let i = 0; i < N; i++) {
      const x = ox + (i % cols) * (size + 4), y = oy + Math.floor(i / cols) * (size + 4);
      let fill = "var(--surface)", op = 1;
      if (w) { const off = i - w.lo; if (off < 0 || off >= w.cur) op = 0.18; else fill = off < w.a ? colour(0) : off < 2 * w.a ? colour(1) : colour(2); }
      if (s > K) op = i === last.lo ? 1 : 0.15;
      c.circ(x + size / 2, y + size / 2, size / 2 - 1, { fill: s > K && i === last.lo ? colour(3) : `color-mix(in srgb, ${fill} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2, opacity: op });
    }
    void rows;
    if (w) {
      const cx = 395, cy = 120, a = 0;
      c.line(cx, cy + 50, cx, cy - 10, { stroke: "var(--ink)", "stroke-width": 4 }); c.line(cx - 70, cy - 10 + a, cx + 70, cy - 10 - a, { stroke: "var(--ink)", "stroke-width": 4 });
      c.path(`M${cx - 95} ${cy + 10}Q${cx - 70} ${cy + 38} ${cx - 45} ${cy + 10}Z`, { fill: colour(0), opacity: 0.7, stroke: "var(--ink)" }); c.path(`M${cx + 45} ${cy + 10}Q${cx + 70} ${cy + 38} ${cx + 95} ${cy + 10}Z`, { fill: colour(1), opacity: 0.7, stroke: "var(--ink)" });
      c.text(cx - 70, cy + 4, w.a, { ...ink, class: "sol-label", style: "fill:#fff" }); c.text(cx + 70, cy + 4, w.a, { ...ink, class: "sol-label", style: "fill:#fff" });
      c.text(cx, cy + 90, `${w.r} ${c.t("à côté", "aside")}`, { ...ink, class: "sol-sub", style: `fill:${colour(2)}` });
    }
    c.text(395, 250, s === 0 ? "3 issues" : s > K ? `${K} × 3 ⇒ ≤ ${3 ** K}` : `${c.t("Pesée", "Weighing")} ${s} / ${K}`, { ...ink, class: s > K ? "sol-hot" : "sol-line" });
  },
};

/* ------------------------------------------------------------ fake coins */
const fakecoins = {
  size: [520, 300],
  steps: (q) => { const n = q.n, tot = classicSample(n), k = Math.min(7, n); return [
    P(`${n} piles de pièces, une seule pile est fausse (9 g au lieu de 10 g). Une seule pesée sur une balance de précision.`, `${n} piles of coins, exactly one is fake (9 g instead of 10 g). A single weighing on a precise scale.`),
    P(`Prenons 1 pièce de la pile 1, 2 de la pile 2, …, ${n} de la pile ${n} : ${tot} pièces. Chaque pile est reconnaissable à son nombre de pièces.`, `Take 1 coin from pile 1, 2 from pile 2, …, ${n} from pile ${n}: ${tot} coins. Each pile is recognisable by its number of coins.`),
    P(`Si tout était vrai, la balance indiquerait ${10 * tot} g. Supposons la pile ${k} fausse : ses ${k} pièces pèsent chacune 1 g de moins, la balance indique ${10 * tot - k} g.`, `If all were genuine the scale would show ${10 * tot} g. Suppose pile ${k} is fake: its ${k} coins each weigh 1 g less, the scale shows ${10 * tot - k} g.`),
    P(`Le manque, ${k} g, est exactement le numéro de la pile fausse : ${10 * tot} − ${10 * tot - k} = ${k}.`, `The shortfall, ${k} g, is exactly the number of the fake pile: ${10 * tot} − ${10 * tot - k} = ${k}.`),
    P(`Minimum : deux piles dont on prend autant de pièces seraient indiscernables, donc les nombres sont tous différents, de somme au moins 0 + 1 + … + ${n - 1} = ${minSample(n)} (aucune pièce de la pile 1). La version classique en prend ${tot}.`, `Minimum: two piles with the same number of coins taken would be indistinguishable, so the numbers are all different, with sum at least 0 + 1 + … + ${n - 1} = ${minSample(n)} (no coin from pile 1). The classic version takes ${tot}.`),
  ]; },
  draw(c, s, p, q) {
    const n = q.n, W = 480, gap = W / n, cw = Math.min(30, gap - 4), k = Math.min(7, n), ch = Math.min(12, 190 / (n + 1)), base = 230;
    const shown = s === 0 ? 0 : s === 1 ? Math.min(n, Math.floor(ez(p) * (n + 1))) : n, minimal = s === 4;
    for (let i = 1; i <= n; i++) {
      const x = 20 + (i - 1) * gap + (gap - cw) / 2, taken = minimal ? i - 1 : i;
      for (let j = 0; j < Math.max(n - 1, 1) + 1; j++) { const isTaken = s >= 1 && j < taken && (minimal || i <= shown), isFakePile = s >= 2 && i === k && s < 4; c.rect(x, base - (j + 1) * ch, cw, ch - 1.5, { rx: 3, fill: isTaken ? colour(2) : isFakePile ? `color-mix(in srgb, ${colour(3)} 35%, var(--surface))` : "var(--surface)", stroke: "var(--ink)", "stroke-width": 0.8, opacity: isTaken || !minimal ? 1 : 0.7 }); }
      c.text(x + cw / 2, base + 16, i, { ...ink, class: "sol-small", style: i === k && s >= 2 && s < 4 ? "font-weight:700;fill:var(--neg)" : "" });
    }
    if (s >= 2 && s <= 3) { const tot = classicSample(n); c.rect(330, 20, 170, 54, { rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }); c.text(415, 46, `${10 * tot - k} g`, { ...ink, class: "sol-big small" }); c.text(415, 66, `(${c.t("attendu", "expected")} ${10 * tot} g)`, { ...ink, class: "sol-small" }); }
    if (s === 3) c.text(260, 285, `${10 * classicSample(n)} − ${10 * classicSample(n) - k} = ${k}`, { ...ink, class: "sol-hot" });
    if (s === 4) c.text(260, 285, `0 + 1 + … + ${n - 1} = ${minSample(n)}`, { ...ink, class: "sol-hot" });
  },
};

export const SOLUTIONS_2 = { gridpaths, horses, cake, queens, snail, bridge, lighteggs, fakecoins };
void [lerp, gridPaths];
