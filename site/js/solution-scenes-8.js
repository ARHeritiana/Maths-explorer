// Animated solutions in true 3D: the cubic cake and the ant on the box. Each scene is a pure function of (step, progress),
// drawn with the small 3D renderers of the labs (cake-3d.js, box-3d.js), so a frame can be reproduced and scrubbed.
import { svgEl } from "./challenge-kit.js";
import { cakeCream } from "./challenge-puzzles.js";
import { piecePolygons, pieceDirections, squarePoint } from "./cake-model.js";
import { makeView, drawCake, confetti } from "./cake-3d.js";
import { nets, netRoute, polyLength, dist3 } from "./box-model.js";
import { drawBox, flatCamera, boxScaler } from "./box-3d.js";
import { boxSet } from "./challenge-puzzles2.js";
import { lerp, seg, easeInOut as ease, clamp01 } from "./scene-kit.js";

const el = svgEl, W = 640, H = 400;
const P = (fr, en) => [fr, en];
const pill = (svg, text, y = 8) => {
  const w = Math.min(W - 24, 24 + text.length * 7.4), g = el("g", {}, svg);
  el("rect", { x: (W - w) / 2, y, width: w, height: 30, rx: 15, fill: "#0a0f2c", opacity: 0.78 }, g);
  const tx = el("text", { x: W / 2, y: y + 20, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#fff" }, g); tx.textContent = text;
};
const bigText = (g, x, y, s, size = 26, fill = "#1d1b2e") => { const tx = el("text", { x, y, "text-anchor": "middle", style: `font:700 ${size}px var(--math);fill:${fill};paint-order:stroke;stroke:#fff;stroke-width:5px` }, g); tx.textContent = s; return tx; };
const mix = (a, b, k) => ({ yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k), scale: lerp(a.scale, b.scale, k), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) });
const fmt = (v) => String(Math.round(v * 100) / 100);

/* ================================================================= the cake */
const CAKE_3D = { yaw: -32, pitch: 33, scale: 215, cx: W / 2, cy: 215 }, CAKE_TOP = { yaw: 0, pitch: 90, scale: 300, cx: W / 2, cy: 205 };
const cake = {
  size: [W, H],
  dur: (s, q) => [4200, 4200, 2400 + Number(q.n) * 600, 5200, 7600, 5600][s] ?? 4000,
  steps: (q) => { const a = Number(q.a), n = Number(q.n), l = (4 * a) / n; return [
    P(`Un gâteau cubique de ${a} cm d’arête, avec de la crème sur le dessus et sur les quatre côtés. On veut ${n} parts égales en gâteau et en crème.`, `A cubic cake with ${a} cm edges, with cream on top and on the four sides. We want ${n} portions equal in cake and in cream.`),
    P(`Vu de dessus : un carré de côté ${a} cm, de périmètre ${4 * a} cm. On le partage en ${n} longueurs égales de ${l} cm : ${n} points régulièrement espacés, en partant d’où l’on veut.`, `Seen from above: a square of side ${a} cm and perimeter ${4 * a} cm. Share it into ${n} equal lengths of ${l} cm: ${n} evenly spaced points, starting anywhere.`),
    P("On coupe verticalement du centre du dessus jusqu’à chaque point. Chaque part reçoit la même longueur de croûte ℓ.", "Cut vertically from the centre of the top to every point. Each portion gets the same length of crust ℓ."),
    P(`Le dessus d’une part se découpe en triangles de sommet le centre. Chaque côté du carré est à la même distance a/2 = ${a / 2} cm du centre : chaque triangle a pour aire ½ × (sa base) × a/2, donc l’aire de la part est ½ × ℓ × a/2, la même pour toutes.`, `The top of a portion splits into triangles with their apex at the centre. Every side of the square is at the same distance a/2 = ${a / 2} cm from the centre: each triangle has area ½ × (its base) × a/2, so the area of a portion is ½ × ℓ × a/2, the same for all.`),
    P("Volume = aire × a, crème des côtés = ℓ × a, crème du dessus ∝ aire : tout est égal pour toutes les parts. En 3D, on voit l’intérieur : éponge, confiture, crème.", "Volume = area × a, cream on the sides = ℓ × a, cream on top ∝ area: everything is equal for all portions. In 3D we can see the inside: sponge, jam, cream."),
    P(`Crème totale : a² + 4a² = ${5 * a * a} cm², partagée en ${n} : ${cakeCream(a, n)} cm² de crème par part.`, `Total cream: a² + 4a² = ${5 * a * a} cm², shared into ${n}: ${cakeCream(a, n)} cm² of cream per portion.`),
  ]; },
  mount(c) {
    const svg = c.svg;
    el("rect", { width: W, height: H, fill: "#fbe9f0" }, svg);
    for (let i = 0; i < 16; i++) el("circle", { cx: (i * 83 + 20) % W, cy: (i * 47 + 30) % H, r: 3 + (i % 3), fill: ["#ffc2d6", "#c2e0ff", "#fff0a8"][i % 3], opacity: 0.6 }, svg);
    return { c, g: el("g", {}, svg), ov: el("g", {}, svg) };
  },
  update(S, step, p, q) {
    const { c } = S, n = Number(q.n), a = Number(q.a);
    S.g.replaceChildren(); S.ov.replaceChildren();
    const u0 = 0.35, cuts = Array.from({ length: n }, (_, i) => u0 + (4 * i) / n), polys = piecePolygons(cuts), dirs = pieceDirections(polys);
    const whole = [{ poly: [[0, 0], [1, 0], [1, 1], [0, 1]], off: [0, 0, 0], tint: null, cherry: true }];
    const tinted = (explode = 0, lift = (k) => 0, cherry = false) => polys.map((poly, k) => ({ poly, off: [dirs[k][0] * explode, dirs[k][1] * explode, lift(k)], tint: `var(--c${(k % 8) + 1})`, cherry }));
    let cam, pieces = whole, opts = { plate: true, layers: true };
    const xy = (view, x, y) => view.P(x, y, 1.0);
    if (step === 0) { cam = { ...CAKE_3D, yaw: lerp(-70, -22, ease(p)) }; }
    else if (step === 1) { cam = mix(CAKE_3D, CAKE_TOP, ease(seg(p, 0, 0.45))); }
    else if (step === 2 || step === 3) { cam = CAKE_TOP; }
    else if (step === 4) { const open = ease(seg(p, 0, 0.3)); cam = { ...mix(CAKE_TOP, CAKE_3D, open), yaw: lerp(0, -32, open) + 360 * ease(seg(p, 0.3, 1)) }; }
    else { cam = { ...CAKE_3D, yaw: -32 + 140 * p }; }
    const view = makeView({ ...cam });
    if (step >= 2) { opts = { plate: step >= 4 || false, layers: true }; }
    if (step === 3) pieces = tinted();
    if (step === 4) { const open = ease(seg(p, 0, 0.3)); pieces = tinted(open * 0.2, (k) => Math.sin(clamp01((p - 0.35 - k * (0.5 / n)) / 0.18) * Math.PI) * 0.3, open > 0.2); }
    if (step === 5) pieces = tinted(0.2, (k) => Math.sin(clamp01((p * 1.6 - k * 0.1) / 0.5) * Math.PI) * 0.12, true);
    if (step === 1 || step === 2) pieces = whole.map((w) => ({ ...w, cherry: false }));
    const labels = step === 4 && p > 0.4 ? polys.map(() => `1/${n}`) : step === 5 ? polys.map(() => `${cakeCream(a, n)} cm²`) : null;
    drawCake(S.g, view, pieces, { ...opts, labels, lift: 0 });
    const top = (f) => view.P(f[0], f[1], 1.0);
    if (step === 1) {
      const shown = Math.floor(ease(seg(p, 0.45, 0.95)) * n + 0.001), g = S.ov;
      cuts.slice(0, shown).forEach((u, k) => { const [x, y] = top(squarePoint(u)); el("circle", { cx: x, cy: y, r: 8, fill: `var(--c${(k % 8) + 1})`, stroke: "#2b2538", "stroke-width": 2 }, g); });
      if (p > 0.5) bigText(g, W / 2, H - 16, `${n} × ${(4 * a) / n} cm = ${4 * a} cm`, 22);
    }
    if (step >= 2 && step <= 3) {
      const g = S.ov, cen = top([0.5, 0.5]);
      cuts.forEach((u, k) => {
        const f = step === 2 ? ease(clamp01(p * n - k)) : 1; if (f <= 0) return;
        const [ex, ey] = squarePoint(u), a1 = view.P(0.5, 0.5, 1), b1 = view.P(0.5 + (ex - 0.5) * f, 0.5 + (ey - 0.5) * f, 1);
        if (step === 2) el("line", { x1: a1[0], y1: a1[1], x2: b1[0], y2: b1[1], stroke: "#ffd54a", "stroke-width": 9, "stroke-linecap": "round", opacity: 0.35 }, g);
        el("line", { x1: a1[0], y1: a1[1], x2: b1[0], y2: b1[1], stroke: step === 2 ? "#fff" : "#2b2538", "stroke-width": step === 2 ? 3 : 2, "stroke-linecap": "round" }, g);
        const [px, py] = top(squarePoint(u)); el("circle", { cx: px, cy: py, r: 7, fill: `var(--c${(k % 8) + 1})`, stroke: "#2b2538", "stroke-width": 2 }, g);
      });
      el("circle", { cx: cen[0], cy: cen[1], r: 4.5, fill: "#2b2538" }, g);
    }
    if (step === 3) {
      const g = S.ov, k0 = Math.max(0, polys.findIndex((pl) => pl.length > 3)), pl = polys[k0], prog = ease(seg(p, 0, 0.7)), cen = view.P(0.5, 0.5, 1);
      for (let i = 1; i + 1 < pl.length; i++) {
        const A = view.P(pl[i][0], pl[i][1], 1), B = view.P(pl[i + 1][0], pl[i + 1][1], 1);
        el("path", { d: `M${cen[0]} ${cen[1]}L${A[0]} ${A[1]}L${B[0]} ${B[1]}Z`, fill: `var(--c${((i + k0) % 8) + 1})`, opacity: 0.35 * prog, stroke: "#2b2538", "stroke-width": 2.4 }, g);
        // the height from the centre to this side of the square (all equal to a/2)
        const mid = [(pl[i][0] + pl[i + 1][0]) / 2, (pl[i][1] + pl[i + 1][1]) / 2], side = Math.abs(pl[i][0] - pl[i + 1][0]) < 1e-9 ? [pl[i][0], 0.5] : [0.5, pl[i][1]];
        const hh = view.P(...side, 1); void mid;
        el("line", { x1: cen[0], y1: cen[1], x2: lerp(cen[0], hh[0], prog), y2: lerp(cen[1], hh[1], prog), stroke: "#b5179e", "stroke-width": 2.4, "stroke-dasharray": "6 5" }, g);
      }
      if (prog > 0.5) { bigText(g, W / 2, H - 30, "aire = ½ × ℓ × a/2", 20); const ht = el("text", { x: W / 2, y: H - 9, "text-anchor": "middle", style: "font:600 15px var(--body);fill:#6b2a4a" }, g); ht.textContent = c.t("même hauteur a/2 pour tous les triangles", "the same height a/2 for every triangle"); }
    }
    if (step === 5) { const g = S.ov; if (p > 0.15) confetti(g, (p - 0.15) * 4, { x: W / 2, y: 130, ground: H + 10 }); bigText(g, W / 2, H - 20, `${cakeCream(a, n)} cm²`, 30, "#2a7a3b"); }
    pill(S.ov, c.t(["Le gâteau", "Vue de dessus", "Les coupes", "Les triangles", "Un gâteau, " + n + " parts égales", "La crème de chaque part"][step], ["The cake", "From above", "The cuts", "The triangles", "One cake, " + n + " equal portions", "The cream of each portion"][step]));
  },
};

/* ================================================================= the ant on the box */
const BOX_3D = { yaw: -38, pitch: 28, scale: 300, cx: W / 2, cy: 215 };
const box = {
  size: [W, H],
  dur: (s) => [5200, 4800, 5600, 5200, 10500, 7200][s] ?? 4000,
  steps: (q) => { const [a, b, c] = boxSet(q.set), NS = nets([a, b, c]), best = NS.reduce((x, y) => (y.length < x.length ? y : x)), n = NS; return [
    P(`Une boîte ${a} × ${b} × ${c} cm. La fourmi part du coin S et veut rejoindre le coin opposé T en marchant sur la surface. Longer les arêtes coûte a + b + c = ${a + b + c} cm : on peut faire mieux.`, `A ${a} × ${b} × ${c} cm box. The ant starts at corner S and wants to reach the opposite corner T, walking on the surface. Following the edges costs a + b + c = ${a + b + c} cm: we can do better.`),
    P("Pour un trajet qui traverse deux faces voisines, on met ces deux faces à plat : l’arête commune devient une simple ligne sur le plan.", "For a route crossing two neighbouring faces, lay those two faces flat: the shared edge becomes a simple line on the plane."),
    P(`Dans un plan, le plus court chemin entre deux points est le segment de droite. C’est l’hypoténuse d’un triangle rectangle de côtés ${best.width} et ${best.height} : √(${best.width}² + ${best.height}²) = ${fmt(best.length)} cm.`, `In a plane, the shortest path between two points is the straight segment. It is the hypotenuse of a right triangle with sides ${best.width} and ${best.height}: √(${best.width}² + ${best.height}²) = ${fmt(best.length)} cm.`),
    P("On replie la boîte : le segment droit devient un trajet sur la boîte, qui traverse l’arête commune en un point précis.", "Fold the box back: the straight segment becomes a route on the box, crossing the shared edge at one precise point."),
    P(`Il y a trois façons de mettre deux faces à plat, donc trois longueurs : ${n.map((x) => `√(${x.width}² + ${x.height}²) = ${fmt(x.length)}`).join(" ; ")}. Les trajets sur trois faces ou plus sont plus longs.`, `There are three ways to lay two faces flat, hence three lengths: ${n.map((x) => `√(${x.width}² + ${x.height}²) = ${fmt(x.length)}`).join("; ")}. Routes over three faces or more are longer.`),
    P(`Le plus court est ${fmt(best.length)} cm. Règle : on additionne les deux plus petites dimensions, la plus grande reste seule.`, `The shortest is ${fmt(best.length)} cm. Rule: add the two smaller dimensions; the largest stays alone.`),
  ]; },
  mount(c) {
    const svg = c.svg;
    el("rect", { width: W, height: H, fill: "#e8d7bd" }, svg);
    for (let i = 0; i < 12; i++) el("line", { x1: 0, y1: 20 + i * 34, x2: W, y2: 20 + i * 34, stroke: "#d5c0a0", "stroke-width": 1.4 }, svg);
    return { c, g: el("g", {}, svg), ov: el("g", {}, svg) };
  },
  update(S, step, p, q) {
    const { c } = S, dims = boxSet(q.set), NS = nets(dims), kBest = NS.indexOf(NS.reduce((x, y) => (y.length < x.length ? y : x))), net = NS[kBest], route = netRoute(dims, net), Sx = [0, 0, 0], Tx = dims.slice();
    S.g.replaceChildren(); S.ov.replaceChildren();
    const flatK = (k) => flatCamera(dims, NS[k], W, H);
    const antAt = (pts, f) => { const total = polyLength(pts); let left = f * total; for (let i = 0; i + 1 < pts.length; i++) { const l = dist3(pts[i], pts[i + 1]); if (left <= l || i + 2 === pts.length) { const k = clamp01(left / (l || 1)); return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * k); } left -= l; } return pts[pts.length - 1]; };
    const edgeRoute = [Sx, [dims[0], 0, 0], [dims[0], dims[1], 0], Tx];
    let cam = BOX_3D, netSt = null, paths = [], ant = null, over = null;
    const markers = [{ p: Sx, kind: "S" }, { p: Tx, kind: "T" }];
    if (step === 0) {
      cam = { ...BOX_3D, yaw: lerp(-70, -30, ease(p)) };
      const f = ease(seg(p, 0.25, 0.95));
      paths = [{ pts: edgeRoute, colour: "#e07a1f", width: 4, upTo: f }]; ant = { p: antAt(edgeRoute, f), ang: -0.4, glow: true };
      if (f > 0.9) over = `${dims[0]} + ${dims[1]} + ${dims[2]} = ${dims[0] + dims[1] + dims[2]} cm`;
    } else if (step === 1) {
      const k = ease(seg(p, 0, 0.35)); cam = mix(BOX_3D, flatK(kBest), k); netSt = { base: net.base, hinge: net.hinge, amount: ease(seg(p, 0.25, 0.9)) };
    } else if (step === 2) {
      cam = flatK(kBest); netSt = { base: net.base, hinge: net.hinge, amount: 1 };
      const f = ease(seg(p, 0.15, 0.7)); paths = [{ pts: route.points, colour: "#2a9d8f", width: 4.5, upTo: f, glow: true }]; ant = { p: antAt(route.points, f), ang: 0, glow: true };
      over = p > 0.7 ? `√(${net.width}² + ${net.height}²) = ${fmt(net.length)} cm` : null;
    } else if (step === 3) {
      const back = ease(seg(p, 0.1, 0.6)); cam = mix(flatK(kBest), BOX_3D, ease(seg(p, 0.3, 0.9))); netSt = { base: net.base, hinge: net.hinge, amount: 1 - back };
      paths = [{ pts: route.points, colour: "#2a9d8f", width: 4.5, glow: true }]; ant = { p: antAt(route.points, ease(seg(p, 0.6, 1))), ang: -0.4, glow: true };
    } else if (step === 4) {
      const sub = Math.min(2, Math.floor(p * 3)), local = p * 3 - sub, prevK = sub === 0 ? kBest : sub - 1;
      cam = sub === 0 ? mix(BOX_3D, flatK(0), ease(seg(local, 0, 0.3))) : mix(flatK(prevK), flatK(sub), ease(seg(local, 0, 0.3)));
      const ns = NS[sub], r = netRoute(dims, ns);
      netSt = { base: ns.base, hinge: ns.hinge, amount: sub === 0 ? ease(seg(local, 0.1, 0.5)) : sub > 0 && local < 0.3 ? 1 : 1 };
      const f = ease(seg(local, 0.4, 0.8)); paths = [{ pts: r.points, colour: "#2a9d8f", width: 4.5, upTo: f, glow: ns === net && local > 0.8 }]; ant = { p: antAt(r.points, f), ang: 0, glow: true };
      over = local > 0.8 ? `√(${ns.width}² + ${ns.height}²) = ${fmt(ns.length)} cm` : null;
    } else {
      cam = { ...BOX_3D, yaw: -38 + 160 * p }; paths = [{ pts: route.points, colour: "#2a9d8f", width: 5, glow: true }];
      ant = { p: antAt(route.points, p < 0.5 ? ease(p * 2) : 1), ang: -0.4, glow: true };
    }
    const view = makeView({ ...cam });
    drawBox(S.g, view, dims, { net: netSt, paths, markers, edgeLabels: step === 0 || step === 5, ant });
    if (over) bigText(S.ov, W / 2, H - 16, over, 22);
    if (step === 4) {
      const maxL = Math.max(...NS.map((x) => x.length)), x0 = 40;
      NS.forEach((ns, k) => {
        const shown = k <= Math.min(2, Math.floor(p * 3)) ? ease(clamp01((p * 3 - k) / 0.6 + 0.0)) : 0, wBar = 140 * (ns.length / maxL) * shown, y = 52 + k * 20, best = ns === net;
        el("rect", { x: x0, y, width: wBar, height: 14, rx: 4, fill: best ? "#ffd54a" : "#b9a27a", stroke: "#6b4a26", "stroke-width": best ? 2 : 1, opacity: shown > 0 ? 1 : 0 }, S.ov);
        if (shown > 0.9) { const tx = el("text", { x: x0 + wBar + 6, y: y + 12, style: "font:700 12px var(--math);fill:#3b2616" }, S.ov); tx.textContent = `${fmt(ns.length)} cm`; }
      });
    }
    if (step === 5) { if (p > 0.45) confetti(S.ov, (p - 0.45) * 4, { x: W / 2, y: 120, ground: H + 10 }); bigText(S.ov, W / 2, H - 16, `${fmt(net.length)} cm`, 30, "#2a7a3b"); }
    pill(S.ov, c.t(["La fourmi et la boîte", "On met deux faces à plat", "La ligne droite", "On replie la boîte", "Trois dépliages possibles", "Le plus court trajet"][step], ["The ant and the box", "Laying two faces flat", "The straight line", "Folding the box back", "Three possible unfoldings", "The shortest route"][step]));
    void boxScaler;
  },
};

export const SCENES_8 = { cake, box };
