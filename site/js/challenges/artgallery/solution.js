// Animated solution of the artgallery challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { comb, triangulate, threeColour, visibility } from "./maths.js";
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, lerp, easeOutBack } from "../common/scene-kit.js";

/* ================================================================= the art gallery */
export const GCOL = ["#5b8cff", "#ff9a3c", "#3fbf7f"];

export const gal = new Map();

export const galleryOf = (k) => { if (!gal.has(k)) { const poly = comb(k), tris = triangulate(poly), col = threeColour(poly.length, tris), sizes = [0, 1, 2].map((x) => col.filter((v) => v === x).length), best = sizes.indexOf(Math.min(...sizes)); gal.set(k, { poly, tris, col, sizes, best, tips: Array.from({ length: k }, (_, i) => 2 + 3 * i) }); } return gal.get(k); };

export const scene = {
  size: [520, 300],
  dur: (s) => [3000, 4800, 4200, 3400, 3600, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, k = Number(q.n) / 3, g = galleryOf(k), { poly, tris, col, best, tips } = g, WIDTH = 5 * k - 2, S = Math.min(24, 420 / WIDTH), OX = (520 - WIDTH * S) / 2, OY = 40;
    const X = (x) => OX + x * S, Y = (y) => OY + (10 - y) * S * 0.92 + 8, d = (pts) => pts.map((v, i) => `${i ? "L" : "M"}${X(v[0]).toFixed(1)} ${Y(v[1]).toFixed(1)}`).join("") + "Z";
    el("rect", { width: 520, height: 300, fill: "#3a2f4a" }, svg);
    el("path", { d: d(poly), fill: "#d9b48a", stroke: "none" }, svg);
    for (let x = 0; x < WIDTH; x += 2) el("line", { x1: X(x), y1: Y(10), x2: X(x), y2: Y(0), stroke: "#c4a074", "stroke-width": 1, opacity: 0.6 }, svg);
    const visG = el("g", {}, svg), vis = poly.map((v) => null);
    const visPaths = poly.map((v, i) => col[i] === best ? el("path", { d: d(visibility(poly, v)), fill: "#fff2a8", opacity: 0, stroke: "#e8c84a", "stroke-width": 1 }, visG) : null);
    const tipPaths = tips.map((i, kk) => el("path", { d: d(visibility(poly, poly[i])), fill: colour(kk), opacity: 0 }, visG));
    el("path", { d: d(poly), fill: "none", stroke: "#4b2d14", "stroke-width": 5, "stroke-linejoin": "round" }, svg);
    const diag = tris.map(([a, b, e]) => [[a, b], [b, e], [e, a]].map(([u, v]) => el("line", { x1: X(poly[u][0]), y1: Y(poly[u][1]), x2: X(poly[u][0]), y2: Y(poly[u][1]), stroke: "#fff", "stroke-width": 2, "stroke-dasharray": "5 4", opacity: 0.9 }, svg)));
    const dots = poly.map((v) => { const c2 = el("circle", { cx: X(v[0]), cy: Y(v[1]), r: 3.5, fill: "#2b2538", stroke: "#fff", "stroke-width": 1.4 }, svg); return c2; });
    const rings = poly.map((v, i) => col[i] === best ? el("circle", { cx: X(v[0]), cy: Y(v[1]), r: 14, fill: "none", stroke: "#ffd84a", "stroke-width": 3, opacity: 0 }, svg) : null);
    const guards = poly.map((v, i) => col[i] === best ? makeSoldier(svg, { uniform: GCOL[col[i]], hat: i % 4, size: 0.62, label: "" }) : null);
    const board = pillAt(svg, 90, 8, 340, 28), label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(14) }, board), sizesT = el("text", { x: 504, y: 54, "text-anchor": "end", style: "font:700 14px var(--body);fill:#fff" }, svg);
    return { c, k, g, X, Y, d, visPaths, tipPaths, diag, dots, rings, guards, label, sizesT, poly, tris, col, best, tips };
  },
  update(S, step, p, q) {
    const { c, k, g, X, Y, visPaths, tipPaths, diag, dots, rings, guards, label, sizesT, poly, tris, col, best, tips } = S, n = 3 * k;
    diag.forEach((ls, i) => { const t = easeInOut(seg(step === 1 ? p : step > 1 ? 1 : 0, i / (tris.length + 1), i / (tris.length + 1) + 0.25)); const [a, b, e] = tris[i]; [[a, b], [b, e], [e, a]].forEach(([u, v], j) => { ls[j].setAttribute("x2", lerp(X(poly[u][0]), X(poly[v][0]), t)); ls[j].setAttribute("y2", lerp(Y(poly[u][1]), Y(poly[v][1]), t)); ls[j].setAttribute("opacity", step >= 1 ? "0.9" : "0"); }); });
    poly.forEach((v, i) => {
      const kk = step >= 2 ? (step === 2 ? easeOutBack(seg(p, i / (poly.length + 2), i / (poly.length + 2) + 0.3)) : 1) : 0;
      dots[i].setAttribute("r", String(step >= 2 ? Math.max(0.1, 8 * kk) : 3.5)); dots[i].setAttribute("fill", step >= 2 ? GCOL[col[i]] : "#2b2538");
      const isG = col[i] === best, up = step >= 3 && isG;
      if (rings[i]) rings[i].setAttribute("opacity", String(up ? 0.9 : 0)), rings[i].setAttribute("r", String(13 + (step === 3 ? 3 * Math.sin(p * 12) : 0)));
      if (guards[i]) { const u = step >= 3 ? easeOutBack(step === 3 ? seg(p, 0.1, 0.7) : 1) : 0; guards[i].set({ x: X(v[0]), y: Y(v[1]) + 6, dir: X(v[0]) < 260 ? 1 : -1, scale: Math.max(0.001, u), phase: p * 3, amp: 0, hop: step === 4 ? 4 * Math.abs(Math.sin(p * 10 + i)) : 0 }); }
      if (visPaths[i]) { const on = step === 4 ? easeInOut(p) * 0.65 : step >= 5 ? 0.18 : 0; visPaths[i].setAttribute("opacity", String(on * (0.85 + 0.15 * Math.sin(p * 16 + i)))); }
    });
    tipPaths.forEach((t, kk) => t.setAttribute("opacity", String(step === 5 ? 0.55 * easeInOut(p) : 0)));
    sizesT.textContent = step >= 3 ? `${g.sizes.join(" + ")} = ${n}` : "";
    label.textContent = [c.t(`galerie à ${n} murs en forme de peigne`, `a comb-shaped gallery with ${n} walls`), c.t(`${n - 2} triangles par des diagonales`, `${n - 2} triangles with diagonals`), c.t("trois couleurs, un triangle = trois couleurs", "three colours, every triangle shows all three"), c.t(`une couleur : au plus ⌊${n}/3⌋ = ${k} sommets`, `one colour: at most ⌊${n}/3⌋ = ${k} vertices`), c.t(`${k} gardiens suffisent`, `${k} guards suffice`), c.t(`et ${k} sont nécessaires`, `and ${k} are needed`)][step];
  },
};

/* ------------------------------------------------------------ art gallery */
export const GALLERY = new Map();

export function gallery(k) {
  if (!GALLERY.has(k)) {
    const poly = comb(k), tris = triangulate(poly), col = threeColour(poly.length, tris), sizes = [0, 1, 2].map((x) => col.filter((v) => v === x).length), best = sizes.indexOf(Math.min(...sizes));
    GALLERY.set(k, { poly, tris, col, sizes, best, tips: Array.from({ length: k }, (_, i) => 2 + 3 * i) });
  }
  return GALLERY.get(k);
}

export const GCOL2 = ["var(--c1)", "var(--c2)", "var(--c3)"];

export const diagram = {
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
      if (s >= 2) { const k = s === 2 ? ez(seg(p, i / (poly.length + 2), i / (poly.length + 2) + 0.3)) : 1; c.circ(X(v[0]), Y(v[1]), 8 * k, { style: `fill:${GCOL2[col[i]]};stroke:var(--ink)`, class: "sol-vertex" }); }
      else c.circ(X(v[0]), Y(v[1]), 3.5, { style: "fill:var(--ink)" });
    });
    if (s >= 3) poly.forEach((v, i) => { if (col[i] === best) c.circ(X(v[0]), Y(v[1]), 13 + (s === 3 ? 3 * Math.sin(p * 12) : 0), { class: "sol-ring" }); });
    if (s >= 3) c.text(504, 24, `${sizes.join(" + ")} = ${3 * (q.n / 3)}`, { class: "sol-small", "text-anchor": "end" });
  },
};
