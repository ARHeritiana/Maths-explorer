// Animated solution of the piles challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, clamp01, seg, TAU, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { splitTotal } from "./maths.js";

/* ================================================================= split piles */
export const scene = {
  size: [520, 300],
  dur: (s, q) => [3400, 3400, 6400, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Math.min(Number(q.n), 7);
    dayScene(svg, { ground: 262 });
    el("ellipse", { cx: 260, cy: 164, rx: 215, ry: 112, fill: "#d9c3a0", opacity: 0.75 }, svg);
    const lines = []; for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) lines.push({ i, j, ln: el("line", { "stroke-linecap": "round" }, svg) });
    const pebbles = Array.from({ length: m }, (_, i) => { const g = el("g", {}, svg); el("ellipse", { cy: 6, rx: 13, ry: 4, fill: "#000", opacity: 0.2 }, g); el("ellipse", { rx: 13, ry: 11, fill: colour(i), stroke: "#0004", "stroke-width": 1.5 }, g); el("ellipse", { cx: -4, cy: -4, rx: 4, ry: 2.8, fill: "#fff", opacity: 0.5 }, g); return g; });
    const t1 = el("text", { x: 450, y: 74, "text-anchor": "middle", style: "font:700 38px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:5px" }, svg), t2 = el("text", { x: 450, y: 100, "text-anchor": "middle", style: "font:600 13px var(--body);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:3px" }, svg), t3 = el("text", { x: 450, y: 140, "text-anchor": "middle", style: "font:700 20px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:4px" }, svg);
    const board = pillAt(svg, 90, 8, 340, 28), label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(14) }, board);
    // the fixed script of splits: halve the first pile with more than one pebble, again and again
    const splits = []; let groups = [Array.from({ length: m }, (_, i) => i)]; const layouts = [groups.map((g) => g.slice())];
    while (groups.some((g) => g.length > 1)) { const gi = groups.findIndex((g) => g.length > 1), g = groups[gi], a = Math.max(1, Math.floor(g.length / 2)); splits.push({ left: g.slice(0, a), right: g.slice(a) }); groups.splice(gi, 1, g.slice(0, a), g.slice(a)); layouts.push(groups.map((x) => x.slice())); }
    return { c, m, lines, pebbles, t1, t2, t3, label, splits, layouts };
  },
  update(S, step, p, q) {
    const { c, m, lines, pebbles, t1, t2, t3, label, splits, layouts } = S, Q = Number(q.n);
    const shown = step === 0 ? 0 : step === 1 ? 1 : step === 2 ? Math.min(splits.length, 1 + Math.floor(easeInOut(p) * (splits.length - 1) + 1e-9)) : splits.length;
    const frac = step === 2 ? clamp01(easeInOut(p) * (splits.length - 1) - Math.floor(easeInOut(p) * (splits.length - 1) + 1e-9)) : step === 1 ? easeInOut(seg(p, 0.1, 0.8)) : 0;
    const pos = (layoutIdx) => { const L = layouts[layoutIdx], res = []; const centres = L.map((g, gi) => 40 + ((gi + 0.5) / L.length) * 380); L.forEach((g, gi) => g.forEach((pi, k) => { const a = (TAU * k) / Math.max(1, g.length) - Math.PI / 2, r = g.length > 1 ? 14 + g.length * 5 : 0; res[pi] = [centres[gi] + r * Math.cos(a), 168 + (gi % 2 ? 12 : -12) + r * 0.8 * Math.sin(a)]; })); return res; };
    const prev = pos(Math.max(0, shown - 1)), cur = pos(shown), pr = shown === 0 ? cur : prev;
    const place = (pi) => [lerp(pr[pi][0], cur[pi][0], shown === 0 ? 1 : easeInOut(Math.min(1, step === 3 ? 1 : (step === 2 ? frac * 1.6 : step === 1 ? frac : 1)))), lerp(pr[pi][1], cur[pi][1], shown === 0 ? 1 : easeInOut(Math.min(1, step === 3 ? 1 : (step === 2 ? frac * 1.6 : step === 1 ? frac : 1))))];
    const pts = pebbles.map((g, pi) => { const pt = shown === 0 ? [40 + 190 + 105 * Math.cos((TAU * pi) / m - Math.PI / 2) - 40, 168 + 80 * Math.sin((TAU * pi) / m - Math.PI / 2)] : place(pi); g.setAttribute("transform", `translate(${pt[0].toFixed(1)} ${pt[1].toFixed(1)})`); return pt; });
    const sepSet = new Set(); for (let i = 0; i < shown; i++) for (const u of splits[i].left) for (const v of splits[i].right) sepSet.add(u < v ? `${u}-${v}` : `${v}-${u}`);
    const newest = shown > 0 ? new Set(splits[shown - 1].left.flatMap((u) => splits[shown - 1].right.map((v) => (u < v ? `${u}-${v}` : `${v}-${u}`)))) : new Set();
    lines.forEach(({ i, j, ln }) => { const key = `${i}-${j}`, on = sepSet.has(key); ln.setAttribute("x1", pts[i][0]); ln.setAttribute("y1", pts[i][1]); ln.setAttribute("x2", pts[j][0]); ln.setAttribute("y2", pts[j][1]); ln.setAttribute("stroke", on ? (newest.has(key) && step <= 2 ? "#3fbf7f" : "#e8710a") : "#7a6a48"); ln.setAttribute("stroke-width", on ? "3.2" : "1"); ln.setAttribute("opacity", on ? "1" : "0.55"); });
    t1.textContent = String(sepSet.size); t2.textContent = c.t("paires séparées", "pairs separated"); t3.textContent = `/ ${(m * (m - 1)) / 2}`; t1.style.fill = step === 3 ? "#ffd84a" : "#fff";
    label.textContent = [`${Q} ${c.t("cailloux", "pebbles")} : C(${m}, 2) = ${(m * (m - 1)) / 2} ${c.t("paires", "pairs")}`, c.t("a × b paires sont séparées", "a × b pairs are separated"), c.t("une paire séparée ne l’est qu’une fois", "a separated pair is counted once"), (Q > m ? `C(${m}, 2) = ${(m * (m - 1)) / 2} · ${c.t("pour", "for")} ${Q} : ${splitTotal(Q)}` : `C(${Q}, 2) = ${splitTotal(Q)}`)][step];
  },
};

/* ----------------------------------------------------------------- piles */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const m = Math.min(q.n, 7); return [
    P(`${q.n} cailloux${q.n > m ? ` (on en dessine ${m}, le raisonnement est le même)` : ""}. Relions chaque paire de cailloux : il y a C(${m}, 2) = ${(m * (m - 1)) / 2} paires.`, `${q.n} pebbles${q.n > m ? ` (we draw ${m}, the reasoning is the same)` : ""}. Join every pair of pebbles: there are C(${m}, 2) = ${(m * (m - 1)) / 2} pairs.`),
    P("On sépare le tas en deux tas de a et b cailloux : a × b paires sont séparées (en couleur). Le produit noté est exactement le nombre de paires séparées.", "Split the pile into two piles of a and b pebbles: a × b pairs are separated (coloured). The product written is exactly the number of separated pairs."),
    P("On continue de séparer : une paire déjà séparée ne peut plus l’être (ses cailloux sont dans deux tas différents) ; chaque paire est donc comptée une seule fois.", "Keep splitting: a pair already separated cannot be separated again (its pebbles are in different piles); so every pair is counted exactly once."),
    P(`À la fin, toutes les paires sont colorées : total = C(${q.n}, 2) = ${q.n} × ${q.n - 1} / 2 = ${splitTotal(q.n)}, quelle que soit la façon de couper.`, `At the end every pair is coloured: total = C(${q.n}, 2) = ${q.n} × ${q.n - 1} / 2 = ${splitTotal(q.n)}, however the cuts are made.`),
  ]; },
  draw(c, s, p, q) {
    const m = Math.min(q.n, 7), pts = Array.from({ length: m }, (_, i) => [260 + 105 * Math.cos((TAU * i) / m - Math.PI / 2), 150 + 105 * Math.sin((TAU * i) / m - Math.PI / 2)]);
    // a fixed script of splits: peel one pebble at a time from the first pile, then the remainder in halves
    const splits = []; let groups = [Array.from({ length: m }, (_, i) => i)];
    while (groups.some((g) => g.length > 1)) { const gi = groups.findIndex((g) => g.length > 1), g = groups[gi], a = Math.max(1, Math.floor(g.length / 2)); splits.push({ left: g.slice(0, a), right: g.slice(a) }); groups.splice(gi, 1, g.slice(0, a), g.slice(a)); }
    const sepAt = (k) => { const set = new Set(); for (let i = 0; i < k; i++) for (const u of splits[i].left) for (const v of splits[i].right) set.add(u < v ? `${u}-${v}` : `${v}-${u}`); return set; };
    const shownSplits = s === 0 ? 0 : s === 1 ? 1 : s === 2 ? Math.min(splits.length, 1 + Math.floor(ez(p) * (splits.length - 1) + 1e-9)) : splits.length;
    const sep = sepAt(shownSplits);
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) { const on = sep.has(`${i}-${j}`), newest = shownSplits > 0 && splits[shownSplits - 1].left.some((u) => splits[shownSplits - 1].right.some((v) => (u === i && v === j) || (u === j && v === i))); c.line(...pts[i], ...pts[j], { stroke: on ? (newest && s <= 2 ? colour(2) : colour(1)) : "var(--line-strong)", "stroke-width": on ? 3 : 1, opacity: on ? 1 : 0.6 }); }
    pts.forEach((pt, i) => c.circ(...pt, 10, { fill: colour(i), stroke: "var(--ink)", "stroke-width": 2 }));
    c.text(450, 70, `${sep.size}`, { ...mid, class: s === 3 ? "sol-hot" : "sol-big small" }); c.text(450, 94, c.t("paires séparées", "pairs separated"), { ...mid, class: "sol-sub" });
    c.text(450, 150, `/ ${(m * (m - 1)) / 2}`, { ...mid, class: "sol-line" });
  },
};
