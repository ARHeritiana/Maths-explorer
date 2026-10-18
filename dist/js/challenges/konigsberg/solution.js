// Animated solution of the konigsberg challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, clamp01 } from "../common/scene-kit.js";
import { graphFor, minRemoval, trailOf, layoutOf, bridgeGeom, degrees } from "./maths.js";

/* ================================================================= the bridges of Königsberg */
export const scene = {
  size: [520, 300],
  dur: (s, q) => { const g = graphFor(q.g), best = minRemoval(g), walk = trailOf(g, best); return s === 5 ? Math.min(14000, 1600 + walk.length * 1100) : 3600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, g = graphFor(q.g), pos = layoutOf(g);
    const id = "kb" + Math.floor(Math.random() * 1e6);
    const defs = el("defs", {}, svg), gr = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, "#7ec8f2"], [1, "#2f7fbf"]].forEach(([o, col]) => el("stop", { offset: o, "stop-color": col }, gr));
    el("rect", { width: 520, height: 300, fill: `url(#${id})` }, svg);
    for (let i = 0; i < 14; i++) el("path", { d: `M${(i * 97) % 520} ${30 + ((i * 53) % 250)} q10 -6 20 0 t20 0`, fill: "none", stroke: "#fff", "stroke-width": 1.6, opacity: 0.4, "stroke-linecap": "round", class: "sc-wave", style: `--d:${(i % 5) * 0.4}s` }, svg);
    const bridges = g.edges.map((_, i) => { const { d, mid } = bridgeGeom(g, i, pos), gp = el("g", {}, svg); el("path", { d, fill: "none", stroke: "#4b2d14", "stroke-width": 13, "stroke-linecap": "round" }, gp); el("path", { d, fill: "none", stroke: "#b9814a", "stroke-width": 9, "stroke-linecap": "round" }, gp); const planks = el("path", { d, fill: "none", stroke: "#6b4423", "stroke-width": 9, "stroke-dasharray": "1.6 5", opacity: 0.7 }, gp); const done = el("path", { d, fill: "none", stroke: "#5fd0a0", "stroke-width": 5, "stroke-linecap": "round", opacity: 0, "stroke-dasharray": "999", "stroke-dashoffset": "999" }, gp); const cross = el("text", { x: mid[0], y: mid[1] + 8, "text-anchor": "middle", style: "font:700 24px var(--body);fill:#ff5b5b;paint-order:stroke;stroke:#fff;stroke-width:3px" }, gp); cross.textContent = "×"; return { gp, planks, done, cross, d }; });
    const islands = g.names.map((nm, v) => { const [x, y] = pos[v], gp = el("g", { transform: `translate(${x} ${y})` }, svg); el("ellipse", { rx: 36, ry: 27, fill: "#e8d6a0", stroke: "#a38a4a", "stroke-width": 2 }, gp); el("ellipse", { rx: 30, ry: 21, fill: "#79c276" }, gp); const rr = (v * 37) % 5; el("circle", { cx: -14 + rr, cy: -6, r: 5, fill: "#3f8f4a" }, gp); el("circle", { cx: 16 - rr, cy: 6, r: 4, fill: "#3f8f4a" }, gp); const t = el("text", { y: 6, "text-anchor": "middle", style: "font:700 18px var(--body);fill:#1f3a24" }, gp); t.textContent = nm; const badge = el("g", { transform: "translate(26 -26)" }, gp); const bc = el("circle", { r: 11, fill: "#fff", stroke: "#222", "stroke-width": 1.5 }, badge); const bt = el("text", { y: 4.5, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#222" }, badge); return { gp, badge, bc, bt }; });
    const walker = makeSoldier(svg, { uniform: "#e8710a", hat: 1, size: 0.9, label: "" });
    const board = pillAt(svg, 110, 8, 300, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, g, pos, bridges, islands, walker, label };
  },
  update(S, step, p, q) {
    const { c, g, pos, bridges, islands, walker, label } = S, best = minRemoval(g), removed = step >= 4 ? best : new Set(), deg = degrees(g, removed), trail = step === 5 ? trailOf(g, best) : [];
    const prog = step === 5 ? easeInOut(seg(p, 0.06, 0.96)) * trail.length : 0;
    g.edges.forEach((b, i) => {
      const br = bridges[i], gone = best.has(i) && step >= 4, w = trail.findIndex((x) => x[0] === i);
      br.gp.setAttribute("opacity", String(gone ? (step === 4 ? 1 - 0.65 * easeInOut(seg(p, 0.1, 0.6)) : 0.35) : 1));
      br.gp.setAttribute("transform", gone && step === 4 ? `translate(0 ${(8 * easeInOut(seg(p, 0.1, 0.8))).toFixed(1)})` : gone ? "translate(0 8)" : "");
      br.cross.setAttribute("opacity", String(gone ? 1 : 0));
      const done = step === 5 && w >= 0 ? clamp01(prog - w) : 0;
      br.done.setAttribute("opacity", String(done > 0 ? 1 : 0)); br.done.setAttribute("stroke-dashoffset", String(999 * (1 - done)));
      br.done.setAttribute("pathLength", "999");
    });
    g.names.forEach((nm, v) => {
      const odd = step >= 1 && deg[v] % 2 === 1, il = islands[v];
      il.badge.setAttribute("opacity", String(step >= 1 ? easeInOut(step === 1 ? seg(p, 0, 0.5) : 1) : 0));
      il.bt.textContent = deg[v]; il.bc.setAttribute("fill", odd ? "#ff8a8a" : "#fff"); il.bc.setAttribute("stroke", odd ? "#b00020" : "#222");
      il.gp.setAttribute("transform", `translate(${pos[v][0]} ${pos[v][1] - (odd && step >= 1 && step <= 3 ? 2.5 * Math.abs(Math.sin(p * 9 + v)) : 0)})`);
    });
    // the walker crosses the remaining bridges (last step)
    if (step === 5 && trail.length) {
      const k = Math.min(trail.length - 1, Math.floor(prog)), [bi, from, to] = trail[k], tt = prog - k, { ctrl } = bridgeGeom(g, bi, pos), A = pos[from], B = pos[to];
      const x = (1 - tt) ** 2 * A[0] + 2 * (1 - tt) * tt * ctrl[0] + tt * tt * B[0], y = (1 - tt) ** 2 * A[1] + 2 * (1 - tt) * tt * ctrl[1] + tt * tt * B[1];
      walker.set({ x, y: y + 12, dir: B[0] >= A[0] ? 1 : -1, phase: prog * 3, amp: 1, scale: 1 });
    } else walker.set({ x: 0, y: 0, scale: 0 });
    const oddCount = deg.filter((v) => v % 2).length;
    label.textContent = step === 0 ? `${g.names.length} ${c.t("quartiers", "districts")}, ${g.edges.length} ${c.t("ponts", "bridges")}` : step <= 3 ? `${c.t("Quartiers impairs", "Odd districts")} : ${deg.map((v) => v % 2).reduce((a, b2) => a + b2, 0)}` : step === 4 ? `${c.t("ponts retirés", "bridges removed")} : ${best.size}` : `${c.t("Quartiers impairs", "Odd districts")} : ${oddCount}`;
  },
};

/* ------------------------------------------------------------ konigsberg */
export const diagram = {
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
