import { P, el } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg } from "../common/scene-kit.js";
import { ROOM_NAMES, eulerCriteria, eulerTrail } from "./maths.js";
import { edgesFor } from "./index.js";
import { HOUSE, ROOM_RECTS, STAND, DOORS } from "./art.js";

// The house plan becomes a diagram: a point in each room, one point O for the outside (below the house), one line per door.
// A line between two rooms goes straight from each room's point to the door. A line to the outside leaves its room through
// the door, follows its own lane round the house (lanes are nested: a door further round the house uses a lane further out)
// and reaches O by its own direction, so no two lines meet or cross anywhere but at a point.
const K = 0.72, OX = 116, OY = 83;   // a free band at the top holds the verdict of the last step
const S = ([x, y]) => [OX + K * x, OY + K * y];
const O = [HOUSE.w / 2, HOUSE.h + 118];   // the outside point, in house units
const PORT = 40;                          // lines reach O radially from this distance
// the nine outside doors by their place in DOORS: lane offset from the walls (r), depth of the lane below the house (d),
// and the direction (degrees, counter-clockwise from east) from which the line enters O
const LANES = {
  13: { a: 90 },                                    // D, bottom wall: straight down
  14: { d: 24, a: 65 }, 15: { r: 24, d: 46, a: 40 }, 10: { r: 46, d: 68, a: 15 }, 9: { r: 68, d: 90, a: -10 },   // E, E, B, B
  12: { d: 24, a: 115 }, 11: { r: 24, d: 46, a: 140 }, 8: { r: 46, d: 68, a: 165 }, 7: { r: 68, d: 90, a: 190 },  // C, C, A, A
};
const portOf = (a) => [O[0] + PORT * Math.cos((a * Math.PI) / 180), O[1] - PORT * Math.sin((a * Math.PI) / 180)];

// the polyline of door k (index in DOORS) from its room's point to the other place (a room's point or O), in house units
export function doorLine(k) {
  const d = DOORS[k], room = STAND[d.a];
  if (d.b !== 5) return [room, [d.x, d.y], STAND[d.b]];
  const L = LANES[k], W = HOUSE.w, H = HOUSE.h, pts = [room, [d.x, d.y]];
  if (k === 13) return [...pts, portOf(L.a), O];
  const right = d.x > W / 2 || (d.y === 0 && d.x > W / 2);
  if (d.n[1] === 1) pts.push([d.x, H + L.d]);                                     // bottom wall: down to its lane
  else {
    const side = right ? W + L.r : -L.r;
    if (d.n[1] === -1) pts.push([d.x, -L.r], [side, -L.r]);                     // top wall: up, then along the top
    else pts.push([side, d.y]);                                                   // side wall: out to the lane
    pts.push([side, H + L.d]);                                                    // down the side of the house
  }
  return [...pts, portOf(L.a), O];
}

// an open polyline with rounded corners, in screen units
function roundOpen(pts, r = 9) {
  const f = (q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  let d = `M${f(pts[0])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], a = pts[i - 1], b = pts[i + 1], la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), k = Math.min(r, la / 2, lb / 2);
    d += `L${f([p[0] + ((a[0] - p[0]) * k) / la, p[1] + ((a[1] - p[1]) * k) / la])}Q${f(p)} ${f([p[0] + ((b[0] - p[0]) * k) / lb, p[1] + ((b[1] - p[1]) * k) / lb])}`;
  }
  return d + `L${f(pts.at(-1))}`;
}
const pathD = (pts) => roundOpen(pts.map(S));
const lenOf = (pts) => pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const at = (pts, d) => { let k = 0; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])); while (k < L.length - 1 && d > L[k]) { d -= L[k]; k++; } const f = L[k] ? Math.min(1, d / L[k]) : 1; return { p: [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f], dir: pts[k + 1][0] >= pts[k][0] ? 1 : -1 }; };
const pointOf = (v) => (v === 5 ? O : STAND[v]);

export const diagram = {
  size: [520, 398],
  steps: (q) => { const c = eulerCriteria(edgesFor(q)), odd = c.odd.map((v) => ROOM_NAMES[v]).join(", "); return [
    P("On remplace le plan par un schéma : un point dans chaque pièce, un point O pour l’extérieur, et un trait par porte, de la pièce jusqu’à l’autre côté de la porte.", "We replace the plan by a sketch: a point in each room, one point O for the outside, and one line per door, from the room to the other side of the door."),
    P("Chaque fois qu’on traverse une pièce, on y entre par une porte et on en sort par une autre : ses portes s’utilisent deux par deux. Seuls le lieu de départ et le lieu d’arrivée échappent à ce compte.", "Each time we pass through a room we come in by one door and leave by another: its doors are used two by two. Only the starting place and the finishing place escape this count."),
    c.trail ? P(`Lieux avec un nombre impair de portes : ${odd || "aucun"}. Il y en a au plus deux : on part de l’un et on finit à l’autre, et la promenade passe une fois par chaque porte.`, `Places with an odd number of doors: ${odd || "none"}. There are at most two: start at one, finish at the other, and the walk goes through every door once.`)
      : P(`Lieux avec un nombre impair de portes : ${odd}. Il y en a ${c.odd.length}, plus que deux : aucune promenade ne passe une seule fois par chaque porte. Fermer une porte entre deux de ces lieux en laisse deux.`, `Places with an odd number of doors: ${odd}. There are ${c.odd.length}, more than two: no walk goes through every door once. Closing one door between two of these places leaves two.`),
  ]; },
  dur: (s) => (s === 2 ? 9000 : s === 1 ? 4200 : 3400),
  draw(c, step, p, q) {
    const edges = edgesFor(q), shift = q.layout === "closed-door" ? 1 : 0, crit = eulerCriteria(edges), svg = c.svg;
    const lineOf = (i) => doorLine(i + shift);
    const show = step === 0 ? easeInOut(seg(p, 0.15, 0.85)) : 1;
    // the plan fades away as the diagram appears, leaving only a trace of the rooms under it
    const planOp = 1 - 0.85 * show;
    ROOM_RECTS.forEach((r, i) => { const [x, y] = S([r.x, r.y]); el("rect", { x, y, width: r.w * K, height: r.h * K, fill: colour(i), "fill-opacity": 0.2, stroke: "var(--ink)", "stroke-width": 3.5, "stroke-linejoin": "round", opacity: planOp }, svg); });
    DOORS.slice(shift).forEach((d) => { const h = d.n[0] === 0, [x, y] = S([d.x, d.y]), w = (h ? 30 : 10) * K, ht = (h ? 10 : 30) * K; el("rect", { x: x - w / 2, y: y - ht / 2, width: w, height: ht, rx: 2, fill: "var(--surface)", stroke: "var(--object-ink)", "stroke-width": 2, opacity: planOp }, svg); });
    // one line per door
    edges.forEach((e, i) => el("path", { d: pathD(lineOf(i)), fill: "none", stroke: "var(--ink-2)", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: show }, svg));
    // the doors of D light up two by two (in, out)
    if (step === 1) {
      const v = 3, mine = edges.map((e, i) => [e, i]).filter(([e]) => e[0] === v || e[1] === v).map(([, i]) => i), lit = Math.ceil(seg(p, 0.05, 0.9) * mine.length);
      mine.forEach((i, k) => { if (k < lit) el("path", { d: pathD(lineOf(i)), fill: "none", stroke: colour(Math.floor(k / 2)), "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.9 }, svg); });
    }
    // the points: five rooms and the outside (O's count sits below it, clear of its lines)
    [0, 1, 2, 3, 4, 5].forEach((v) => {
      const [x, y] = S(pointOf(v)), odd = step >= 1 && crit.degrees[v] % 2 === 1;
      el("circle", { cx: x, cy: y, r: v === 5 ? 15 : 14, fill: odd ? "var(--object-soft)" : "var(--surface)", stroke: odd ? "var(--neg)" : "var(--ink)", "stroke-width": odd ? 4 : 2.5, opacity: show }, svg);
      el("text", { x, y: y + 6, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: "var(--ink)", opacity: show }, svg).textContent = ROOM_NAMES[v];
      if (step >= 1) { const bx = x + (v === 5 ? 0 : 16), by = y + (v === 5 ? 25 : -15); el("circle", { cx: bx, cy: by, r: 10, fill: odd ? "var(--neg)" : "var(--pos)" }, svg); el("text", { x: bx, y: by + 4.5, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#fff" }, svg).textContent = crit.degrees[v]; }
    });
    if (step === 2) {
      const trail = eulerTrail(edges);
      if (trail && trail.length) {
        let v = crit.odd[0] ?? edges[0][0]; const legs = trail.map((i) => { const [a, b] = edges[i], from = v, to = a === from ? b : a; v = to; const line = lineOf(i), pts = DOORS[i + shift].a === from ? line : [...line].reverse(); return { i, pts, L: lenOf(pts) }; });
        const total = legs.reduce((s, l) => s + l.L, 0); let dist = easeInOut(seg(p, 0.04, 0.97)) * total, cur = null;
        legs.forEach((l) => { if (dist > 0) { const used = Math.min(dist, l.L); if (dist < l.L) cur = { l, d: dist }; el("path", { d: pathD(l.pts), fill: "none", stroke: "var(--pos)", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": `${(used / l.L).toFixed(4)} 1`, opacity: 0.95 }, svg); dist -= l.L; } });
        const leg = cur || { l: legs.at(-1), d: legs.at(-1).L }, w = at(leg.l.pts, leg.d), [x, y] = S(w.p);
        makeSoldier(svg, { uniform: "#e8710a", hat: 1, size: 0.7, label: "" }).set({ x, y: y + 10, dir: w.dir, phase: (total * p) / 60, amp: p > 0.03 && p < 0.97 ? 1 : 0, scale: 1 });
      } else el("text", { x: 260, y: 22, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--neg);paint-order:stroke;stroke:var(--surface);stroke-width:5px" }, svg).textContent = c.t(`${crit.odd.length} lieux impairs : aucune promenade possible`, `${crit.odd.length} odd places: no walk possible`);
    }
  },
};
