import { P, el } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, lerp } from "../common/scene-kit.js";
import { ROOM_NAMES, eulerCriteria, eulerTrail } from "./maths.js";
import { edgesFor } from "./index.js";
import { ROOM_RECTS, STAND, DOORS } from "./art.js";
import { bridgeGeom } from "../konigsberg/maths.js";

// The plan becomes a graph: each room shrinks to a vertex, each door to an edge. Then degrees, and a trail if one exists.
const PLAN = { x: 40, y: 26, k: 0.72 };
const GRAPH = [[110, 60], [290, 45], [60, 205], [215, 165], [370, 215], [462, 130]];
const planPt = ([x, y]) => [PLAN.x + PLAN.k * x, PLAN.y + PLAN.k * y];
export const diagram = {
  size: [520, 300],
  steps: (q) => [P("Le plan devient un graphe : chaque pièce et l’extérieur sont des sommets, chaque porte est une arête.", "The plan becomes a graph: each room and the outside is a vertex, each door is an edge."), P("Une arrivée et un départ utilisent deux portes. Seuls le début et la fin échappent à cet appariement.", "Arrival and departure use two doors. Only start and finish escape this pairing."), P(`${eulerCriteria(edgesFor(q)).odd.length} degrés sont impairs. Vérifie aussi la connexité des lieux portant des portes.`, `${eulerCriteria(edgesFor(q)).odd.length} degrees are odd. Also check connectivity of places with doors.`)],
  dur: (s) => (s === 2 ? 7000 : 3200),
  draw(c, step, p, q) {
    const edges = edgesFor(q), doors = q.layout === "closed-door" ? DOORS.slice(1) : DOORS, crit = eulerCriteria(edges), svg = c.svg;
    const m = step === 0 ? easeInOut(seg(p, 0.35, 0.95)) : 1;                       // 0: plan, 1: graph
    const pos = GRAPH.map((g, v) => [lerp(planPt(STAND[v])[0], g[0], m), lerp(planPt(STAND[v])[1], g[1], m)]);
    // the plan, fading out
    const plan = el("g", { transform: `translate(${PLAN.x} ${PLAN.y}) scale(${PLAN.k})`, opacity: 1 - m }, svg);
    ROOM_RECTS.forEach((r, i) => { el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, fill: colour(i), "fill-opacity": 0.25, stroke: "var(--ink)", "stroke-width": 5 }, plan); });
    doors.forEach((d, i) => { const h = d.n[0] === 0; el("rect", { x: d.x - (h ? 17 : 6), y: d.y - (h ? 6 : 17), width: h ? 34 : 12, height: h ? 12 : 34, rx: 3, fill: "var(--surface)", stroke: "var(--accent)", "stroke-width": 3 }, plan); });
    // the graph: edges through their doors (parallel doors bend apart), then the vertices
    const g = { names: ROOM_NAMES, edges };
    edges.forEach((e, i) => { const { d } = bridgeGeom(g, i, pos); el("path", { d, fill: "none", stroke: "var(--ink-2)", "stroke-width": 3, "stroke-linecap": "round", opacity: m }, svg); });
    const trail = step === 2 ? eulerTrail(edges) : null;
    pos.forEach(([x, y], v) => {
      const odd = step >= 1 && crit.degrees[v] % 2 === 1, r = lerp(14, 24, m);
      el("circle", { cx: x, cy: y, r, fill: odd ? "var(--accent-soft)" : "var(--surface)", stroke: odd ? "var(--neg)" : "var(--ink)", "stroke-width": odd ? 4 : 2.5 }, svg);
      el("text", { x, y: y + 7, "text-anchor": "middle", "font-size": 20, "font-weight": 700, fill: "var(--ink)" }, svg).textContent = ROOM_NAMES[v];
      if (step >= 1) { el("circle", { cx: x + 26, cy: y - 22, r: 11, fill: odd ? "var(--neg)" : "var(--pos)" }, svg); el("text", { x: x + 26, y: y - 17.5, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff" }, svg).textContent = crit.degrees[v]; }
    });
    if (step === 1) { // pairing: the doors of the first odd-or-even vertex light up two by two
      const v = 5, mine = edges.map((e, i) => [e, i]).filter(([e]) => e[0] === v || e[1] === v).map(([, i]) => i), lit = Math.floor(seg(p, 0, 0.9) * mine.length);
      mine.forEach((i, k) => { if (k < lit) el("path", { d: bridgeGeom(g, i, pos).d, fill: "none", stroke: colour(Math.floor(k / 2)), "stroke-width": 6, "stroke-linecap": "round", opacity: 0.9 }, svg); });
    }
    if (step === 2) {
      if (trail && trail.length) { // an Euler trail exists: a walker follows it door by door
        const walker = makeSoldier(svg, { uniform: "#e8710a", hat: 1, size: 0.8, label: "" });
        let v = crit.odd[0] ?? edges[0][0]; const route = trail.map((i) => { const [a, b] = edges[i], from = v; v = a === from ? b : a; return [i, from, v]; });
        const prog = easeInOut(seg(p, 0.05, 0.97)) * route.length, k = Math.min(route.length - 1, Math.floor(prog)), tt = prog - k;
        route.forEach(([i, from, to], j) => { if (j < prog) el("path", { d: bridgeGeom(g, i, pos).d, fill: "none", stroke: "var(--pos)", "stroke-width": 5, "stroke-linecap": "round", opacity: j < k ? 1 : 0.9 }, svg); });
        const [i, from, to] = route[k], { ctrl } = bridgeGeom(g, i, pos), A = pos[from], B = pos[to];
        walker.set({ x: (1 - tt) ** 2 * A[0] + 2 * (1 - tt) * tt * ctrl[0] + tt * tt * B[0], y: (1 - tt) ** 2 * A[1] + 2 * (1 - tt) * tt * ctrl[1] + tt * tt * B[1] + 12, dir: B[0] >= A[0] ? 1 : -1, phase: prog * 2, amp: 1, scale: 1 });
      } else el("text", { x: 260, y: 290, "text-anchor": "middle", style: "font:700 16px var(--body);fill:var(--neg)" }, svg).textContent = c.t(`${crit.odd.length} lieux impairs : aucun parcours`, `${crit.odd.length} odd places: no trail`);
    }
  },
};
