// Animated solution of the cake challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { cakeCream, piecePolygons, pieceDirections, squarePoint } from "./maths.js";
import { drawCake } from "./view-3d.js";
import { P, ez, ink } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { W, H, el, pillAt as pill, mix, bigText } from "../common/scene-3d.js";
import { lerp, easeInOut as ease, seg, clamp01 } from "../common/scene-kit.js";
import { makeView, confetti } from "../common/view-3d.js";

/* ================================================================= the cake */
export const CAKE_3D = { yaw: -32, pitch: 33, scale: 215, cx: W / 2, cy: 215 }, CAKE_TOP = { yaw: 0, pitch: 90, scale: 300, cx: W / 2, cy: 205 };

export const scene = {
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

/* ------------------------------------------------------------------ cake */
export const sq = (t) => { const s = ((t % 4) + 4) % 4, k = Math.floor(s), u = s - k; return [[u, 0], [1, u], [1 - u, 1], [0, 1 - u]][k]; };

export const diagram = {
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
