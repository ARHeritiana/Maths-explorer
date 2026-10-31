import { P, el } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg } from "../common/scene-kit.js";
import { ROOM_NAMES, eulerCriteria, eulerTrail } from "./maths.js";
import { edgesFor } from "./index.js";
import { HOUSE, ROOM_RECTS, STAND, DOORS, ringRoute } from "./art.js";

// The graph is drawn on the plan itself: a vertex at the centre of each room, an edge through each door. The outside O is one vertex
// too, drawn as the ring round the house, so every edge to O ends on that ring and no two edges cross: the drawing is planar.
const K = 0.88, OX = 84, OY = 30, RING = 26;
const S = ([x, y]) => [OX + K * x, OY + K * y];
const ringPt = (d) => [d.x + d.n[0] * RING, d.y + d.n[1] * RING];
// the polyline of door i, from place `from` to place `to` (5 is the outside ring)
const wayOf = (d, from, to) => { const a = from === 5 ? ringPt(d) : STAND[from], b = to === 5 ? ringPt(d) : STAND[to]; return from === d.a ? [a, [d.x, d.y], b] : [a, [d.x, d.y], b]; };
const pathD = (pts) => "M" + pts.map((p) => S(p).map((v) => v.toFixed(1)).join(" ")).join("L");
const lenOf = (pts) => pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const at = (pts, d) => { let k = 0; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])); while (k < L.length - 1 && d > L[k]) { d -= L[k]; k++; } const f = L[k] ? Math.min(1, d / L[k]) : 1; return { p: [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f], dir: pts[k + 1][0] >= pts[k][0] ? 1 : -1 }; };

export const diagram = {
  size: [520, 300],
  steps: (q) => [P("On superpose le graphe au plan : un sommet au centre de chaque pièce, une arête à travers chaque porte. L’extérieur O est un seul sommet : l’anneau autour de la maison.", "We lay the graph over the plan: a vertex at the centre of each room, an edge through each door. The outside O is a single vertex: the ring around the house."), P("Une arrivée et un départ utilisent deux portes. Seuls le début et la fin échappent à cet appariement.", "Arrival and departure use two doors. Only start and finish escape this pairing."), P(`${eulerCriteria(edgesFor(q)).odd.length} degrés sont impairs. Vérifie aussi la connexité des lieux portant des portes.`, `${eulerCriteria(edgesFor(q)).odd.length} degrees are odd. Also check connectivity of places with doors.`)],
  dur: (s) => (s === 2 ? 9000 : s === 1 ? 4200 : 3400),
  draw(c, step, p, q) {
    const edges = edgesFor(q), doors = q.layout === "closed-door" ? DOORS.slice(1) : DOORS, crit = eulerCriteria(edges), svg = c.svg;
    const show = step === 0 ? easeInOut(seg(p, 0.15, 0.85)) : 1;
    // the plan fades away as the graph appears, leaving only a trace of the rooms under it
    const planOp = 1 - 0.88 * show;
    ROOM_RECTS.forEach((r, i) => { const [x, y] = S([r.x, r.y]); el("rect", { x, y, width: r.w * K, height: r.h * K, fill: colour(i), "fill-opacity": 0.2, stroke: "var(--ink)", "stroke-width": 3.5, "stroke-linejoin": "round", opacity: planOp }, svg); });
    doors.forEach((d) => { const h = d.n[0] === 0, [x, y] = S([d.x, d.y]), w = (h ? 30 : 10) * K, ht = (h ? 10 : 30) * K; el("rect", { x: x - w / 2, y: y - ht / 2, width: w, height: ht, rx: 2, fill: "var(--surface)", stroke: "var(--accent)", "stroke-width": 2, opacity: planOp }, svg); });
    // the ring: the vertex O
    const [rx, ry] = S([-RING, -RING]);
    el("rect", { x: rx, y: ry, width: (HOUSE.w + 2 * RING) * K, height: (HOUSE.h + 2 * RING) * K, rx: 14, fill: "none", stroke: "var(--ink)", "stroke-width": 3, "stroke-dasharray": "2 0", opacity: show }, svg);
    el("circle", { cx: rx + 4, cy: ry + 4, r: 12, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2.5, opacity: show }, svg); el("text", { x: rx + 4, y: ry + 10, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: "var(--ink)", opacity: show }, svg).textContent = "O";
    // edges
    edges.forEach((e, i) => { el("path", { d: pathD(wayOf(doors[i], e[0], e[1])), fill: "none", stroke: "var(--ink-2)", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: show }, svg); });
    // degrees: the doors of the chosen vertex light up two by two (arrival + departure)
    if (step === 1) {
      const v = 3, mine = edges.map((e, i) => [e, i]).filter(([e]) => e[0] === v || e[1] === v).map(([, i]) => i), lit = Math.ceil(seg(p, 0.05, 0.9) * mine.length);
      mine.forEach((i, k) => { if (k < lit) el("path", { d: pathD(wayOf(doors[i], edges[i][0], edges[i][1])), fill: "none", stroke: colour(Math.floor(k / 2)), "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.9 }, svg); });
    }
    // vertices
    STAND.slice(0, 5).forEach((pt, v) => {
      const [x, y] = S(pt), odd = step >= 1 && crit.degrees[v] % 2 === 1;
      el("circle", { cx: x, cy: y, r: 17, fill: odd ? "var(--accent-soft)" : "var(--surface)", stroke: odd ? "var(--neg)" : "var(--ink)", "stroke-width": odd ? 4 : 2.5, opacity: show }, svg);
      el("text", { x, y: y + 6.5, "text-anchor": "middle", "font-size": 19, "font-weight": 700, fill: "var(--ink)", opacity: show }, svg).textContent = ROOM_NAMES[v];
      if (step >= 1) { el("circle", { cx: x + 19, cy: y - 17, r: 10, fill: odd ? "var(--neg)" : "var(--pos)" }, svg); el("text", { x: x + 19, y: y - 12.5, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#fff" }, svg).textContent = crit.degrees[v]; }
    });
    if (step >= 1) { const oOdd = crit.degrees[5] % 2 === 1, [x, y] = S([HOUSE.w + RING, HOUSE.h / 2 + 90]); el("circle", { cx: x, cy: y, r: 11, fill: oOdd ? "var(--neg)" : "var(--pos)" }, svg); el("text", { x, y: y + 4.5, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#fff" }, svg).textContent = `O:${crit.degrees[5]}`; }
    if (step === 2) {
      const trail = eulerTrail(edges);
      if (trail && trail.length) {
        let v = crit.odd[0] ?? edges[0][0], prev = null; const legs = trail.map((i) => { const [a, b] = edges[i], from = v, to = a === from ? b : a; v = to; let pts = wayOf(doors[i], from, to); if (from === 5 && prev) pts = [...ringRoute(prev, pts[0]).slice(0, -1), ...pts]; prev = to === 5 ? pts.at(-1) : null; return { i, pts, L: lenOf(pts), solid: from === 5 && prev !== null ? wayOf(doors[i], from, to) : pts }; });
        const total = legs.reduce((s, l) => s + l.L, 0); let dist = easeInOut(seg(p, 0.04, 0.97)) * total, cur = null;
        legs.forEach((l) => { if (dist > 0) { const used = Math.min(dist, l.L); if (dist < l.L) cur = { l, d: dist }; if (used >= l.L - 1e-6 || used > 0) el("path", { d: pathD(l.pts), fill: "none", stroke: "var(--pos)", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", "pathLength": 1, "stroke-dasharray": `${(used / l.L).toFixed(4)} 1`, opacity: 0.95 }, svg); dist -= l.L; } });
        const leg = cur ? cur : { l: legs.at(-1), d: legs.at(-1).L }, w = at(leg.l.pts, leg.d), [x, y] = S(w.p);
        makeSoldier(svg, { uniform: "#e8710a", hat: 1, size: 0.8, label: "" }).set({ x, y: y + 12, dir: w.dir, phase: total * p / 60, amp: p > 0.03 && p < 0.97 ? 1 : 0, scale: 1 });
      } else el("text", { x: 260, y: 21, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--neg);paint-order:stroke;stroke:var(--surface);stroke-width:5px" }, svg).textContent = c.t(`${crit.odd.length} lieux impairs : aucun parcours`, `${crit.odd.length} odd places: no trail`);
    }
  },
};
