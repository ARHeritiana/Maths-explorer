// Animated solution of the konigsberg challenge, a pure function of (step, progress). `diagram` holds the captions (steps);
// the `scene` (mount once, then update) draws them: it starts from the town map of the activity and turns it into the
// graph (each land shrinks to a point, each bridge becomes a line through where it stood), then counts the bridges of each
// point, pairs them (one in, one out) and walks the remaining bridges. See common/player.js.
import { el, pillAt, white, P } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, clamp01, lerp } from "../common/scene-kit.js";
import { graphFor, minRemoval, trailOf, degrees } from "./maths.js";
import { cityFor, graphOver, bez } from "./plan.js";
import { drawTown } from "./art.js";

const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const qd = ({ A, C, B }) => `M${A[0].toFixed(1)} ${A[1].toFixed(1)}Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}`;
// the point the pairing step looks at: an odd district if there is one (its last bridge stays alone), else district 0
const focusOf = (deg) => { const v = deg.findIndex((d) => d % 2); return v < 0 ? 0 : v; };

/* ================================================================= the bridges of Königsberg */
export const scene = {
  size: [520, 360],
  dur: (s, q) => { if (s !== 6) return [3200, 4600, 3600, 5200, 3600, 3400][s]; const g = graphFor(q.g); return Math.min(14000, 1600 + trailOf(g, minRemoval(g)).length * 1000); },
  steps: null,
  mount(c, q) {
    const g = graphFor(q.g), city = cityFor(q.g), G = graphOver(city, g);
    const T = drawTown(c.svg, city, g.names, "kbs" + Math.floor(Math.random() * 1e6));
    const lines = g.edges.map(() => el("path", { fill: "none", "stroke-linecap": "round", opacity: 0 }, T.layer));
    const nodes = g.names.map((nm, v) => {
      const gp = el("g", { transform: `translate(${G.pts[v][0].toFixed(1)} ${G.pts[v][1].toFixed(1)})`, opacity: 0 }, T.layer);
      const ring = el("circle", { r: 15, fill: "#fffdf5", stroke: "#2b2538", "stroke-width": 2.5 }, gp);
      el("text", { y: 6.5, "text-anchor": "middle", style: "font:700 18px var(--body);fill:#2b2538" }, gp).textContent = nm;
      const badge = el("g", { transform: "translate(17 -17)", opacity: 0 }, gp), bc = el("circle", { r: 11, stroke: "#fff", "stroke-width": 2 }, badge), bt = el("text", { y: 4.5, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff" }, badge);
      return { gp, ring, badge, bc, bt };
    });
    const walker = makeSoldier(T.layer, { uniform: "#e8710a", hat: 1, size: 0.75, label: "" });
    // the graph may bulge past the frame: fit it (points, lines, badges) into the frame below the board
    const xs = [], ys = [];
    G.curves.forEach((cv) => { for (let k = 0; k <= 20; k++) { const [x, y] = bez(cv, k / 20); xs.push(x); ys.push(y); } });
    G.pts.forEach(([x, y]) => { xs.push(x - 18, x + 30); ys.push(y - 30, y + 18); });
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), fx = [12, 46, city.W - 12, city.H - 10];
    const k = Math.min(1, (fx[2] - fx[0]) / (x1 - x0), (fx[3] - fx[1]) / (y1 - y0)), fit = { k, dx: (fx[0] + fx[2]) / 2 - (k * (x0 + x1)) / 2, dy: (fx[1] + fx[3]) / 2 - (k * (y0 + y1)) / 2 };
    const board = pillAt(c.svg, 120, 8, 280, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, g, city, G, T, lines, nodes, walker, label, fit };
  },
  update(S, step, p, q) {
    const { c, g, city, G, T, lines, nodes, walker, label, fit } = S, best = minRemoval(g), removed = step >= 5 ? best : new Set(), deg = degrees(g, removed), deg0 = degrees(g);
    const m = step === 0 ? 0 : step === 1 ? easeInOut(seg(p, 0.08, 0.9)) : 1;   // 0 = the town map, 1 = the graph
    // the map fades as each land shrinks to its point
    const fm = easeInOut(seg(m, 0.65, 1));   // the finished graph then glides into the frame
    T.layer.setAttribute("transform", `translate(${(fit.dx * fm).toFixed(2)} ${(fit.dy * fm).toFixed(2)}) scale(${lerp(1, fit.k, fm).toFixed(4)})`);
    T.water.setAttribute("opacity", String(1 - 0.75 * m));
    T.lands.forEach((ld, v) => { const [x, y] = G.pts[v], s = Math.max(0.001, 1 - m); ld.g.setAttribute("transform", `translate(${x} ${y}) scale(${s.toFixed(3)}) translate(${-x} ${-y})`); ld.g.setAttribute("opacity", String(clamp01(1 - m * 1.15))); });
    T.signs.forEach((sg) => sg.setAttribute("opacity", String(clamp01(1 - m * 2))));
    T.bridges.forEach((br) => { br.g.setAttribute("opacity", String(clamp01(1 - m * 1.6))); br.cross.setAttribute("opacity", "0"); });
    nodes.forEach((nd, v) => nd.gp.setAttribute("opacity", String(clamp01((m - 0.45) * 2))));
    // each bridge becomes a line from point to point through where the bridge stood
    const focus = focusOf(deg0), mine = g.edges.map((e, i) => i).filter((i) => g.edges[i][0] === focus || g.edges[i][1] === focus);
    const lit = step === 3 ? Math.ceil(seg(p, 0.06, 0.8) * mine.length) : 0;
    const trail = step === 6 ? trailOf(g, best) : [], prog = step === 6 ? easeInOut(seg(p, 0.06, 0.96)) * trail.length : 0;
    g.edges.forEach((e, i) => {
      const br = city.bridges[i], cv = G.curves[i], curve = { A: L2(br.a, cv.A, m), B: L2(br.b, cv.B, m), C: L2(br.mid, cv.C, m) }, gone = removed.has(i);
      let stroke = m < 0.6 ? "#8a5a2e" : "#2b2538", width = lerp(12, 4, m), dash = "none", op = m > 0 ? 1 : 0;
      if (step === 3) { const k = mine.indexOf(i); if (k >= 0 && k < lit) { const alone = k === mine.length - 1 && mine.length % 2 === 1; stroke = alone ? "#e0245e" : colour(Math.floor(k / 2)); width = 7; } else if (k < 0) op = 0.35; }
      if (step === 4 && deg0.some((d, v) => d % 2 && (e[0] === v || e[1] === v))) op = 1;
      if (gone) { stroke = "#e0245e"; dash = "6 7"; op = step === 5 ? 1 - 0.7 * easeInOut(seg(p, 0.2, 0.8)) : 0.3; }
      if (step === 6) { const w = trail.findIndex((x) => x[0] === i); if (w >= 0 && prog > w) { stroke = "#1f9d6b"; width = 6; } }
      Object.entries({ d: qd(curve), stroke, "stroke-width": width.toFixed(1), "stroke-dasharray": dash, opacity: op }).forEach(([k, v]) => lines[i].setAttribute(k, v));
    });
    // bridges per point (from step 2), odd points in red
    nodes.forEach((nd, v) => {
      const odd = deg[v] % 2 === 1, show = step >= 2 ? (step === 2 ? easeInOut(seg(p, 0.1 + 0.1 * v, 0.4 + 0.1 * v)) : 1) : 0;
      nd.badge.setAttribute("opacity", String(show)); nd.bt.textContent = deg[v]; nd.bc.setAttribute("fill", odd ? "#e0245e" : "#1f9d6b");
      const pulse = (step === 4 && odd) || (step === 3 && v === focus) ? 1 + 0.12 * Math.abs(Math.sin(p * 10)) : 1;
      nd.ring.setAttribute("r", (15 * pulse).toFixed(2)); nd.ring.setAttribute("stroke", odd && step >= 2 ? "#e0245e" : "#2b2538"); nd.ring.setAttribute("stroke-width", odd && step >= 2 ? "4" : "2.5");
    });
    // the walker: on the map at the start, then along the remaining lines at the end
    if (step === 0) { const s = city.spots[0].stand; walker.set({ x: s[0], y: s[1], dir: 1, amp: 0, scale: 1 }); }
    else if (step === 6 && trail.length) {
      const k = Math.min(trail.length - 1, Math.floor(prog)), [bi, from] = trail[k], tt = Math.min(1, prog - k), fwd = from === g.edges[bi][0], pt = bez(G.curves[bi], fwd ? tt : 1 - tt), nx = bez(G.curves[bi], fwd ? Math.min(1, tt + 0.02) : Math.max(0, 1 - tt - 0.02));
      walker.set({ x: pt[0], y: pt[1] + 8, dir: nx[0] >= pt[0] ? 1 : -1, phase: prog * 3, amp: p < 0.97 ? 1 : 0, scale: 1 });
    } else walker.set({ x: 0, y: 0, scale: 0 });
    const odd = deg.filter((d) => d % 2).length;
    label.textContent = step <= 1 ? `${g.names.length} ${c.t("quartiers", "districts")}, ${g.edges.length} ${c.t("ponts", "bridges")}` : step === 5 ? `${c.t("ponts retirés", "bridges removed")} : ${best.size}` : step === 6 ? `${c.t("minimum", "minimum")} : ${best.size}` : `${c.t("quartiers impairs", "odd districts")} : ${odd}`;
  },
};

/* ------------------------------------------------------------ konigsberg: captions */
export const diagram = {
  size: [520, 360],
  steps: (q) => {
    const g = graphFor(q.g), deg = degrees(g), odd = deg.filter((x) => x % 2).length, best = minRemoval(g), names = [...best].map((i) => `${g.names[g.edges[i][0]]}-${g.names[g.edges[i][1]]}`).join(", "), list = g.names.map((nm, i) => `${nm} ${deg[i]}`).join(", ");
    const f = g.names[focusOf(deg)], fd = deg[focusOf(deg)];
    return [
      P(`Le plan : ${g.names.length} quartiers, ${g.edges.length} ponts. Peut-on traverser chaque pont exactement une fois ?`, `The map: ${g.names.length} districts, ${g.edges.length} bridges. Can we cross every bridge exactly once?`),
      P("Seul compte quel pont relie quels quartiers. Chaque quartier rétrécit jusqu’à n’être qu’un point, chaque pont devient un trait entre deux points.", "All that matters is which bridge joins which districts. Each district shrinks to a point, each bridge becomes a line between two points."),
      P(`Comptons les ponts de chaque point : ${list}. ${odd ? `${odd} nombre${odd > 1 ? "s sont impairs" : " est impair"}.` : "Tous sont pairs."}`, `Count the bridges of each point: ${list}. ${odd ? `${odd} of these number${odd > 1 ? "s are" : " is"} odd.` : "All are even."}`),
      P(`Quand on traverse ${f}, on utilise un pont pour entrer et un pour sortir : ses ponts vont par deux. ${fd % 2 ? `${f} en a ${fd} : il en reste un seul, donc ${f} doit être le départ ou l’arrivée.` : `${f} en a ${fd} : ils vont tous par deux.`}`, `Passing through ${f} uses one bridge in and one bridge out: its bridges go in pairs. ${fd % 2 ? `${f} has ${fd}: one is left alone, so ${f} must be the start or the end.` : `${f} has ${fd}: they all go in pairs.`}`),
      P(`Seuls le départ et l’arrivée peuvent avoir un nombre impair de ponts : il faut 0 ou 2 quartiers impairs. Ici ${odd}${odd > 2 ? " : c’est impossible, il faut retirer des ponts." : " : c’est possible."}`, `Only the start and the end can have an odd number of bridges: there must be 0 or 2 odd districts. Here there ${odd === 1 ? "is" : "are"} ${odd}${odd > 2 ? ": impossible, bridges must go." : ": it is possible."}`),
      best.size ? P(`Retirer un pont enlève un pont à deux points seulement. On retire ${best.size === 1 ? "le pont" : "les ponts"} ${names} : il reste au plus 2 quartiers impairs.`, `Removing a bridge takes one away from two points only. We remove ${best.size === 1 ? "the bridge" : "the bridges"} ${names}: at most 2 odd districts are left.`) : P("Aucun pont à retirer : le réseau convient déjà.", "No bridge needs to go: the network already works."),
      P(`La promenade traverse alors chaque pont restant une fois. Minimum de ponts à retirer : ${best.size}.`, `Now the walk crosses every remaining bridge once. Minimum number of bridges to remove: ${best.size}.`),
    ];
  },
  draw() {},   // the scene above draws every frame
};
