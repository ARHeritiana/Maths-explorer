// Animated solution of the box challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { boxSet, nets, netRoute, polyLength, dist3, boxUnfoldings, boxPath } from "./maths.js";
import { drawBox, boxScaler, flatCamera } from "./view-3d.js";
import { P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { W, H, el, bigText, pillAt as pill, mix } from "../common/scene-3d.js";
import { clamp01, lerp, easeInOut as ease, seg } from "../common/scene-kit.js";
import { makeView, confetti } from "../common/view-3d.js";

export const fmt = (v) => String(Math.round(v * 100) / 100);

/* ================================================================= the ant on the box */
export const BOX_3D = { yaw: -38, pitch: 28, scale: 300, cx: W / 2, cy: 215 };

export const scene = {
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

/* ------------------------------------------------------------------- box */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const [a, b, c] = boxSet(q.set), U = boxUnfoldings(a, b, c); return [
    P(`Une boîte ${a} × ${b} × ${c}. La fourmi va d’un coin au coin opposé en marchant sur la surface.`, `A ${a} × ${b} × ${c} box. The ant goes from one corner to the opposite corner, walking on the surface.`),
    ...U.map((u) => P(`On déplie les deux faces qui se partagent une arête de longueur ${u.height} : un rectangle ${u.cross[0] + u.cross[1]} × ${u.height}. Le plus court chemin y est la diagonale : √(${u.cross[0] + u.cross[1]}² + ${u.height}²) = ${Math.round(u.length * 100) / 100}.`, `Unfold the two faces that share an edge of length ${u.height}: a ${u.cross[0] + u.cross[1]} × ${u.height} rectangle. The shortest path there is the diagonal: √(${u.cross[0] + u.cross[1]}² + ${u.height}²) = ${Math.round(u.length * 100) / 100}.`)),
    P(`Le plus court des trois : ${boxPath(a, b, c)} cm. Les deux plus petites dimensions s’additionnent ; la plus grande reste seule.`, `The shortest of the three: ${boxPath(a, b, c)} cm. The two smaller dimensions add up; the largest stands alone.`),
  ]; },
  draw(c, s, p, q) {
    const [a, b, cc] = boxSet(q.set), U = boxUnfoldings(a, b, cc), best = boxPath(a, b, cc);
    if (s === 0) {
      const k = 14, w = a * k * 1.4, d = b * k * 0.9, h = cc * k * 0.9, x = 120, y = 80 + d;
      c.path(`M${x} ${y}L${x + w} ${y}L${x + w + d} ${y - d}L${x + d} ${y - d}Z`, { fill: `color-mix(in srgb, ${colour(2)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 });
      c.path(`M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}L${x} ${y + h}Z`, { fill: `color-mix(in srgb, ${colour(0)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 });
      c.path(`M${x + w} ${y}L${x + w + d} ${y - d}L${x + w + d} ${y + h - d}L${x + w} ${y + h}Z`, { fill: `color-mix(in srgb, ${colour(3)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 });
      c.circ(x, y + h, 7, { fill: colour(1) }); c.circ(x + w + d, y - d, 7, { fill: colour(1) }); c.text(x - 12, y + h + 18, c.t("départ", "start"), { ...mid, class: "sol-small" }); c.text(x + w + d + 8, y - d - 10, c.t("arrivée", "arrival"), { ...mid, class: "sol-small" });
      return;
    }
    const idx = Math.min(s, 3) - 1, shown = s <= 3 ? [idx] : [0, 1, 2];
    shown.forEach((j, pos) => {
      const u = U[j], w = u.cross[0] + u.cross[1], h = u.height, sc = s <= 3 ? Math.min(420 / w, 200 / h) : Math.min(150 / w, 110 / h), x0 = s <= 3 ? (520 - w * sc) / 2 : 15 + pos * 170, y0 = s <= 3 ? 40 : 60, k = s === 4 ? 1 : ez(seg(p, 0, 0.8));
      c.rect(x0, y0, u.cross[0] * sc, h * sc, { fill: `color-mix(in srgb, ${colour(0)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 }); c.rect(x0 + u.cross[0] * sc, y0, u.cross[1] * sc, h * sc, { fill: `color-mix(in srgb, ${colour(2)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 });
      c.line(x0, y0 + h * sc, lerp(x0, x0 + w * sc, k), lerp(y0 + h * sc, y0, k), { stroke: u.length === best && s === 4 ? colour(2) : colour(1), "stroke-width": s <= 3 ? 5 : 4, "stroke-linecap": "round" });
      c.text(x0 + (w * sc) / 2, y0 + h * sc + 24, `${Math.round(u.length * 100) / 100}`, { ...mid, class: u.length === best && s === 4 ? "sol-hot" : "sol-line" });
    });
  },
};
