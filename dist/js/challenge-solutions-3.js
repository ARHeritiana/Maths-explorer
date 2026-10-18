// Animated solutions of the Euclidean-geometry and invariant puzzles (format: see challenge-solutions.js).
import { colour } from "./challenge-kit.js";
import { pathLength, shortestVia, bestContact, reflectSet, luneTotal, starK, starSumDegrees, boxSet, boxUnfoldings, boxPath, mergeFinal, factorial, chamSet, chamSolve, PEGS_START, pegTarget, pegClass, pegLanding, pegsSolve, pegsRun, PEGS_SHIFTS, permOf, inversions, bubbleSwaps, splitTotal } from "./challenge-puzzles2.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ez = (x) => 1 - (1 - clamp01(x)) ** 3;
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const P = (fr, en) => [fr, en];
const mid = { "text-anchor": "middle" };
const TAU = Math.PI * 2;

/* --------------------------------------------------------------- reflect */
const reflect = {
  size: [520, 300],
  steps: (q) => { const [a, b, d] = reflectSet(q.set), L = shortestVia(a, b, d); return [
    P(`A est à ${a} m de la rivière, B à ${b} m, du même côté ; leurs pieds sont distants de ${d} m. On cherche le point X de la rivière qui rend AX + XB minimal.`, `A is ${a} m from the river, B is ${b} m away, on the same side; their feet are ${d} m apart. We look for the point X of the river that makes AX + XB smallest.`),
    P("Essayons plusieurs positions de X : la longueur varie, avec un minimum quelque part au milieu.", "Try several positions of X: the length changes, with a minimum somewhere in the middle."),
    P("Astuce : remplaçons B par son symétrique B′ par rapport à la rivière. Pour tout X, XB = XB′.", "Trick: replace B by its mirror image B′ in the river. For every X, XB = XB′."),
    P("Alors AX + XB = AX + XB′ ≥ AB′, avec égalité quand X est sur le segment AB′ : le chemin optimal est la droite AB′, repliée sur la rivière.", "Then AX + XB = AX + XB′ ≥ AB′, with equality when X is on the segment AB′: the best route is the straight line AB′, folded back at the river."),
    P(`AB′ = √(${d}² + (${a} + ${b})²) = √${d * d + (a + b) ** 2} = ${L} m. Au point X les deux parties du trajet font le même angle avec la rivière.`, `AB′ = √(${d}² + (${a} + ${b})²) = √${d * d + (a + b) ** 2} = ${L} m. At X the two parts of the route make the same angle with the river.`),
  ]; },
  draw(c, s, p, q) {
    const [a, b, d] = reflectSet(q.set), sc = Math.min(400 / d, 100 / Math.max(a, b), 36), X0 = 60, RY = 150, Pt = (u, v) => [X0 + u * sc, RY - v * sc];
    c.rect(0, RY, 520, 150, { fill: "color-mix(in srgb, var(--c6) 24%, var(--surface))" }); c.line(0, RY, 520, RY, { stroke: colour(5), "stroke-width": 3 });
    const A = Pt(0, a), B = Pt(d, b), Bm = Pt(d, -b), best = bestContact(a, b, d);
    const x = s === 1 ? (0.5 + 0.5 * Math.sin(p * 2 * Math.PI)) * d : s >= 3 || s === 2 ? best : d / 2;
    const X = Pt(x, 0);
    if (s >= 2) { c.line(...B, ...Bm, { stroke: "var(--muted)", "stroke-dasharray": "3 4", opacity: ez(seg(p, 0, 0.5)) }); c.circ(...Bm, 7, { fill: "var(--surface)", stroke: colour(3), "stroke-width": 2, opacity: ez(seg(p, 0, 0.5)) }); c.text(Bm[0] + 14, Bm[1] + 5, "B′", { class: "sol-label", opacity: ez(seg(p, 0, 0.5)) }); }
    if (s >= 3) c.line(...A, ...Bm, { stroke: colour(3), "stroke-width": 3, "stroke-dasharray": "8 5" });
    c.path(`M${A.join(" ")}L${X.join(" ")}L${B.join(" ")}`, { fill: "none", stroke: colour(1), "stroke-width": 4, "stroke-linejoin": "round" });
    if (s >= 2) c.path(`M${X.join(" ")}L${Bm.join(" ")}`, { fill: "none", stroke: colour(3), "stroke-width": 2, "stroke-dasharray": "3 3" });
    c.circ(...X, 7, { fill: colour(2), stroke: "var(--ink)", "stroke-width": 2 }); c.text(X[0], X[1] + 22, "X", { ...mid, class: "sol-label" });
    for (const [pt, lab, dx] of [[A, "A", -16], [B, "B", 14]]) { c.circ(...pt, 7, { fill: colour(0), stroke: "var(--ink)", "stroke-width": 2 }); c.text(pt[0] + dx, pt[1] - 8, lab, { ...mid, class: "sol-label" }); }
    const L = pathLength(a, b, d, x);
    c.text(430, 40, `${s <= 2 ? "AX + XB" : s === 3 ? "AX + XB′ ≥ AB′" : "AB′"} = ${Math.round((s === 4 ? shortestVia(a, b, d) : L) * 100) / 100} m`, { ...mid, class: s === 4 ? "sol-hot" : "sol-line" });
  },
};

/* ---------------------------------------------------------------- lunes */
const lunes = {
  size: [520, 300],
  steps: (q) => [
    P(`Triangle rectangle en C (CA = ${q.a}, CB = ${q.b}). Les deux demi-disques sur les côtés de l’angle droit (bleu) dépassent du cercle de diamètre AB : les parties qui dépassent sont les lunules.`, `Right triangle at C (CA = ${q.a}, CB = ${q.b}). The two half-discs on the legs (blue) stick out of the circle on diameter AB: the parts that stick out are the lunes.`),
    P("Pythagore : l’aire du demi-disque de diamètre AB est égale à la somme des aires des deux petits demi-disques (π/8 × AB² = π/8 × CA² + π/8 × CB²).", "Pythagoras: the area of the half-disc on diameter AB equals the sum of the areas of the two small half-discs (π/8 × AB² = π/8 × CA² + π/8 × CB²)."),
    P("Chaque petit demi-disque = une lunule + un segment circulaire du grand cercle (en vert) : D₁ = L₁ + S₁, D₂ = L₂ + S₂.", "Each small half-disc = a lune + a circular segment of the big circle (green): D₁ = L₁ + S₁, D₂ = L₂ + S₂."),
    P("Le grand demi-disque, lui, = le triangle + les deux segments : H = T + S₁ + S₂.", "The big half-disc, in turn, = the triangle + the two segments: H = T + S₁ + S₂."),
    P(`Donc L₁ + L₂ = (D₁ + D₂) − (S₁ + S₂) = H − (H − T) = T : l’aire des lunules égale l’aire du triangle, ${q.a} × ${q.b} / 2 = ${luneTotal(q.a, q.b)} cm².`, `So L₁ + L₂ = (D₁ + D₂) − (S₁ + S₂) = H − (H − T) = T: the area of the lunes equals the area of the triangle, ${q.a} × ${q.b} / 2 = ${luneTotal(q.a, q.b)} cm².`),
  ],
  draw(c, s, p, q) {
    const a = q.a, b = q.b, cc = Math.hypot(a, b), cx = a / 2, cy = b / 2, R = cc / 2, xmin = Math.min(-b / 2, cx - R), xmax = Math.max(a, cx + R), ymin = Math.min(-a / 2, cy - R), ymax = Math.max(b, cy + R);
    const sc = Math.min(470 / (xmax - xmin), 270 / (ymax - ymin)), ox = 25 + (470 - sc * (xmax - xmin)) / 2 - sc * xmin, oy = 15 + sc * ymax + (270 - sc * (ymax - ymin)) / 2, Pt = (u, v) => [ox + u * sc, oy - v * sc];
    const [Cx, Cy] = Pt(0, 0), [Ax, Ay] = Pt(a, 0), [Bx, By] = Pt(0, b), [Mx, My] = Pt(cx, cy);
    const id = `clip${s}`, defs = c.svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "defs"));
    const mk = (name, x, y, w, h) => { const cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"); cp.setAttribute("id", name); const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); for (const [k, v] of Object.entries({ x, y, width: w, height: h })) r.setAttribute(k, v); cp.appendChild(r); defs.appendChild(cp); };
    mk(`${id}a`, 0, Cy, 520, 300); mk(`${id}b`, 0, 0, Cx, 300);   // below chord CA / left of chord CB
    c.path(`M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}Z`, { fill: colour(0), opacity: s >= 2 ? 0.35 : 0.85 }); c.path(`M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}Z`, { fill: colour(0), opacity: s >= 2 ? 0.35 : 0.85 });
    const big = c.circ(Mx, My, R * sc, { fill: s === 1 || s === 3 ? `color-mix(in srgb, ${colour(5)} 22%, var(--surface))` : "var(--sunken)", stroke: "var(--ink)", "stroke-width": 2 }); void big;
    if (s >= 2) { c.circ(Mx, My, R * sc, { fill: colour(2), opacity: 0.8, "clip-path": `url(#${id}a)` }); c.circ(Mx, My, R * sc, { fill: colour(2), opacity: 0.8, "clip-path": `url(#${id}b)` }); }
    c.path(`M${Cx} ${Cy}L${Ax} ${Ay}L${Bx} ${By}Z`, { fill: `color-mix(in srgb, ${s >= 3 ? colour(4) : colour(0)} 45%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2.5 });
    if (s === 4) { const k = ez(seg(p, 0, 0.8)); c.path(`M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, { fill: "none", stroke: colour(1), "stroke-width": 5 * k }); c.path(`M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, { fill: "none", stroke: colour(1), "stroke-width": 5 * k }); }
    c.path(`M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, { fill: "none", stroke: "var(--ink)", "stroke-width": 2 }); c.path(`M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, { fill: "none", stroke: "var(--ink)", "stroke-width": 2 });
    for (const [pt, lab, dx, dy] of [[[Cx, Cy], "C", -14, 18], [[Ax, Ay], "A", 14, 18], [[Bx, By], "B", -14, -6]]) c.text(pt[0] + dx, pt[1] + dy, lab, { ...mid, class: "sol-label" });
    const msg = [`D₁ + D₂`, `D₁ + D₂ = H`, `D = L + S`, `H = T + S₁ + S₂`, `L₁ + L₂ = T`][s];
    c.text(450, 36, msg, { ...mid, class: s === 4 ? "sol-hot" : "sol-line" });
    if (s === 4) c.text(450, 62, `${luneTotal(q.a, q.b)} cm²`, { ...mid, class: "sol-hot" });
  },
};

/* ------------------------------------------------------------------ star */
const star = {
  size: [520, 300],
  steps: (q) => { const n = q.n, k = starK(q.n, q.k); return [
    P(`${n} points réguliers sur un cercle, chacun relié au ${k}-ième suivant : l’étoile {${n}/${k}}.`, `${n} regular points on a circle, each joined to the ${k}th next one: the star {${n}/${k}}.`),
    P("Regardons une pointe : ses deux côtés sont deux cordes issues du même point du cercle. L’angle de la pointe est un angle inscrit.", "Look at one tip: its two sides are two chords from the same point of the circle. The tip angle is an inscribed angle."),
    P(`Il intercepte l’arc situé en face de la pointe : n − 2k = ${n - 2 * k} pas de 360°/${n} = ${Math.round((360 / n) * 100) / 100}°.`, `It intercepts the arc opposite the tip: n − 2k = ${n - 2 * k} steps of 360°/${n} = ${Math.round((360 / n) * 100) / 100}°.`),
    P(`Un angle inscrit vaut la moitié de l’arc intercepté : ½ × ${n - 2 * k} × 360°/${n} = ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° par pointe.`, `An inscribed angle is half the intercepted arc: ½ × ${n - 2 * k} × 360°/${n} = ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° per tip.`),
    P(`Pour les ${n} pointes : ${n} × ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° = 180° × ${n - 2 * k} = ${starSumDegrees(n, k)}°.`, `For the ${n} tips: ${n} × ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° = 180° × ${n - 2 * k} = ${starSumDegrees(n, k)}°.`),
  ]; },
  draw(c, s, p, q) {
    const n = q.n, k = starK(q.n, q.k), CX = 190, CY = 150, R = 125, Pt = (i, r = R) => [CX + r * Math.cos((TAU * i) / n - Math.PI / 2), CY + r * Math.sin((TAU * i) / n - Math.PI / 2)];
    c.circ(CX, CY, R, { fill: "none", stroke: "var(--line-strong)", "stroke-width": 1.5 });
    for (let i = 0; i < n; i++) c.line(...Pt(i), ...Pt((i + k) % n), { stroke: colour(1), "stroke-width": s === 0 ? 3 * ez(seg(p, i / n * 0.8, i / n * 0.8 + 0.25)) : 2, opacity: s >= 1 ? 0.45 : 1 });
    for (let i = 0; i < n; i++) c.circ(...Pt(i), 3.5, { fill: colour(0) });
    if (s >= 1) {
      const o = Pt(0), u = Pt(k), v = Pt(n - k);
      c.line(...o, ...u, { stroke: colour(1), "stroke-width": 5 }); c.line(...o, ...v, { stroke: colour(1), "stroke-width": 5 });
      c.circ(...o, 7, { fill: colour(2), stroke: "var(--ink)", "stroke-width": 2 });
      if (s >= 2) {   // the arc from vertex k to vertex n − k, the long way round from the bottom
        const k2 = s === 2 ? ez(seg(p, 0, 0.9)) : 1, a0 = (TAU * k) / n - Math.PI / 2, steps = n - 2 * k, a1 = a0 + (TAU * steps * k2) / n, A0 = [CX + R * Math.cos(a0), CY + R * Math.sin(a0)], A1 = [CX + R * Math.cos(a1), CY + R * Math.sin(a1)];
        c.path(`M${A0.join(" ")}A${R} ${R} 0 ${steps * k2 > n / 2 ? 1 : 0} 1 ${A1.join(" ")}`, { fill: "none", stroke: colour(3), "stroke-width": 7, "stroke-linecap": "round" });
      }
    }
    c.text(420, 90, s <= 1 ? `{${n}/${k}}` : s === 2 ? `${n - 2 * k} × 360°/${n}` : s === 3 ? `${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}°` : `${starSumDegrees(n, k)}°`, { ...mid, class: s === 4 ? "sol-hot" : "sol-big small" });
    c.text(420, 118, [c.t("l’étoile", "the star"), c.t("angle inscrit", "inscribed angle"), c.t("arc intercepté", "intercepted arc"), c.t("par pointe", "per tip"), c.t("somme des angles", "sum of the angles")][s], { ...mid, class: "sol-sub" });
  },
};

/* ------------------------------------------------------------------- box */
const box = {
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

/* ----------------------------------------------------------------- merge */
const merge = {
  size: [520, 300],
  steps: (q) => [
    P(`Au tableau : 1, 2, …, ${q.n}. On efface a et b et on écrit a + b + ab, jusqu’à ce qu’il ne reste qu’un nombre.`, `On the board: 1, 2, …, ${q.n}. Erase a and b and write a + b + ab, until one number remains.`),
    P("Essayons : 1 et 2 deviennent 1 + 2 + 1×2 = 5. Remarquons que 5 + 1 = 6 = (1 + 1)(2 + 1).", "Try it: 1 and 2 become 1 + 2 + 1×2 = 5. Notice that 5 + 1 = 6 = (1 + 1)(2 + 1)."),
    P("En général a + b + ab + 1 = (a + 1)(b + 1) : le produit de tous les (nombre + 1) ne change jamais. C’est l’invariant.", "In general a + b + ab + 1 = (a + 1)(b + 1): the product of all the (number + 1) never changes. That is the invariant."),
    P(`Au départ : 2 × 3 × … × ${q.n + 1} = ${q.n + 1}! = ${factorial(q.n + 1).toLocaleString("fr-FR")}.`, `At the start: 2 × 3 × … × ${q.n + 1} = ${q.n + 1}! = ${factorial(q.n + 1).toLocaleString("en-US")}.`),
    P(`À la fin, il reste un seul nombre N, et N + 1 = ${q.n + 1}!. Donc N = ${q.n + 1}! − 1 = ${mergeFinal(q.n).toLocaleString("fr-FR")}, quel que soit l’ordre.`, `At the end a single number N remains, and N + 1 = ${q.n + 1}!. So N = ${q.n + 1}! − 1 = ${mergeFinal(q.n).toLocaleString("en-US")}, whatever the order.`),
  ],
  draw(c, s, p, q) {
    const n = Math.min(q.n, 12), cell = Math.min(40, 480 / n), x0 = 260 - (cell * n) / 2;
    const box2 = (x, y, w, txt, fill = "var(--surface)", cls = "sol-line") => { c.rect(x, y, w, 36, { rx: 8, fill, stroke: "var(--ink)", "stroke-width": 2 }); c.text(x + w / 2, y + 25, txt, { ...mid, class: cls }); };
    if (s === 0) for (let i = 1; i <= n; i++) box2(x0 + (i - 1) * cell, 100, cell - 4, i, `color-mix(in srgb, ${colour(i - 1)} 40%, var(--surface))`);
    if (s === 1) {
      const k = ez(seg(p, 0.1, 0.9));
      box2(180, 70, 60, "1", `color-mix(in srgb, ${colour(0)} 40%, var(--surface))`); box2(280, 70, 60, "2", `color-mix(in srgb, ${colour(1)} 40%, var(--surface))`);
      c.text(260, 90, "+", { ...mid, class: "sol-line", opacity: 1 - k }); box2(230, lerp(70, 150, k), 60, k > 0.6 ? "5" : "…", `color-mix(in srgb, ${colour(2)} 40%, var(--surface))`);
      if (k > 0.8) c.text(260, 230, "(1 + 1)(2 + 1) = 6 = 5 + 1", { ...mid, class: "sol-hot" });
    }
    if (s === 2) { c.text(260, 90, "a + b + ab + 1", { ...mid, class: "sol-big small" }); c.text(260, 130, "=", { ...mid, class: "sol-big small", opacity: ez(seg(p, 0.2, 0.6)) }); c.text(260, 172, "(a + 1)(b + 1)", { ...mid, class: "sol-big small", opacity: ez(seg(p, 0.3, 0.8)) }); c.text(260, 240, c.t("∏ (nombre + 1) est invariant", "∏ (number + 1) is invariant"), { ...mid, class: "sol-hot", opacity: ez(seg(p, 0.6, 1)) }); }
    if (s === 3) { for (let i = 1; i <= n; i++) box2(x0 + (i - 1) * cell, 80, cell - 4, i + 1, `color-mix(in srgb, ${colour(i - 1)} 40%, var(--surface))`, "sol-small"); c.text(260, 170, `2 × 3 × … × ${q.n + 1} = ${q.n + 1}!`, { ...mid, class: "sol-line", opacity: ez(seg(p, 0.2, 0.7)) }); c.text(260, 214, factorial(q.n + 1).toLocaleString("fr-FR"), { ...mid, class: "sol-hot", opacity: ez(seg(p, 0.5, 1)) }); }
    if (s === 4) { box2(190, 80, 140, `N + 1 = ${q.n + 1}!`, "var(--surface)"); c.text(260, 170, `N = ${q.n + 1}! − 1`, { ...mid, class: "sol-line" }); c.text(260, 220, mergeFinal(q.n).toLocaleString("fr-FR"), { ...mid, class: "sol-hot", opacity: ez(seg(p, 0.2, 0.8)) }); }
  },
};

/* ------------------------------------------------------------ chameleons */
const cham = {
  size: [520, 300],
  steps: (q) => { const [r, g, b] = chamSet(q.set), sol = chamSolve(r, g, b), mod = (x) => ((x % 3) + 3) % 3; return [
    P(`${r} rouges, ${g} verts, ${b} bleus. Deux caméléons de couleurs différentes se rencontrent : tous deux prennent la troisième couleur.`, `${r} red, ${g} green, ${b} blue. Two chameleons of different colours meet: both take the third colour.`),
    P("Une rencontre rouge-vert : r − 1, v − 1, b + 2. Les trois effectifs changent de −1, −1, +2.", "A red–green meeting: r − 1, g − 1, b + 2. The three counts change by −1, −1, +2."),
    P("Les différences r − v, v − b, b − r varient de 0 ou de ±3 : modulo 3, elles ne changent jamais. C’est l’invariant.", "The differences r − g, g − b, b − r change by 0 or ±3: modulo 3 they never change. That is the invariant."),
    P("Pour que tous aient la même couleur, deux effectifs doivent valoir 0 : leur différence vaut 0, donc deux des trois différences doivent être ≡ 0 (mod 3).", "For all to have the same colour, two counts must be 0: their difference is 0, so one of the three differences must be ≡ 0 (mod 3)."),
    sol ? P(`Ici r − v ≡ ${mod(r - g)}, v − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)} : c’est possible, et il faut au minimum ${sol.length} rencontres (suite ci-contre).`, `Here r − g ≡ ${mod(r - g)}, g − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)}: it is possible, and at least ${sol.length} meetings are needed (sequence shown).`) : P(`Ici r − v ≡ ${mod(r - g)}, v − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)} : aucune n’est congrue à 0, donc c’est impossible. Réponse : 0.`, `Here r − g ≡ ${mod(r - g)}, g − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)}: none is 0, so it is impossible. Answer: 0.`),
  ]; },
  draw(c, s, p, q) {
    const [r, g, b] = chamSet(q.set), cols = [colour(3), colour(2), colour(0)], names = [c.t("rouges", "red"), c.t("verts", "green"), c.t("bleus", "blue")], mod = (x) => ((x % 3) + 3) % 3;
    const after = [r - 1, g - 1, b + 2], k = s === 1 ? ez(seg(p, 0.15, 0.85)) : s >= 2 ? 1 : 0, cur = s >= 1 ? [lerp(r, after[0], k), lerp(g, after[1], k), lerp(b, after[2], k)] : [r, g, b], mx = Math.max(r, g, b, after[2]) || 1;
    if (s <= 3) cur.forEach((v, i) => { const w = (v / mx) * 280; c.rect(110, 50 + i * 50, Math.max(0, w), 30, { rx: 6, fill: cols[i], stroke: "var(--ink)", "stroke-width": 1.5 }); c.text(100, 71 + i * 50, names[i], { "text-anchor": "end", class: "sol-small" }); c.text(118 + Math.max(0, w), 71 + i * 50, `${Math.round(v)}`, { class: "sol-line" }); });
    if (s >= 2 && s <= 3) {
      const rows = [["r − v", r - g, after[0] - after[1]], ["v − b", g - b, after[1] - after[2]], ["b − r", b - r, after[2] - after[0]]];
      rows.forEach(([lab, before, aft], i) => { c.text(60, 218 + i * 24, `${lab} :`, { class: "sol-small" }); c.text(130, 218 + i * 24, `${before}`, { class: "sol-line" }); c.text(180, 218 + i * 24, "→", { class: "sol-small" }); c.text(210, 218 + i * 24, `${aft}`, { class: "sol-line" }); c.text(270, 218 + i * 24, `mod 3 : ${mod(before)} = ${mod(aft)}`, { class: s === 3 && mod(before) === 0 ? "sol-hot" : "sol-small" }); });
    }
    if (s === 4) {
      const sol = chamSolve(r, g, b);
      if (!sol) { c.text(260, 130, [r, g, b].join(" · "), { ...mid, class: "sol-big small" }); c.text(260, 190, c.t("impossible", "impossible"), { ...mid, class: "sol-hot" }); }
      else { const states = [[r, g, b], ...sol.map((x) => x.to)], shown = Math.min(states.length, Math.floor(ez(p) * states.length + 1)), cols2 = states.length > 7 ? 2 : 1; states.slice(0, shown).forEach((st, i) => { const col = Math.floor(i / 7), row = i % 7; c.text(40 + col * 240, 54 + row * 30, `${i}. (${st.join(", ")})`, { class: i === states.length - 1 ? "sol-hot" : "sol-line" }); }); void cols2; c.text(440, 268, `${sol.length}`, { ...mid, class: "sol-big small" }); c.text(440, 290, c.t("rencontres", "meetings"), { ...mid, class: "sol-sub" }); }
    }
  },
};

/* ------------------------------------------------------------ three pegs */
const pegs = {
  size: [520, 300],
  steps: (q) => { const T = pegTarget(q.target), sol = pegsSolve(T), cls = pegClass(T).join(", "); return [
    P(`Trois pions A, B, C en (0, 0), (1, 0), (0, 1). Un pion saute par-dessus un autre et atterrit au point symétrique. Peut-on mettre un pion en (${T.join(", ")}) ?`, `Three pegs A, B, C at (0, 0), (1, 0), (0, 1). A peg jumps over another and lands on the symmetric point. Can a peg be put on (${T.join(", ")})?`),
    P("A saute par-dessus B : il arrive en 2B − A, tel que B soit le milieu du saut. Ici (2, 0).", "A jumps over B: it lands on 2B − A, so that B is the middle of the jump. Here (2, 0)."),
    P("2B a des coordonnées paires, donc 2B − A a les mêmes parités que A : (2, 0) et (0, 0) sont tous deux (pair, pair). Un saut ne change jamais la parité d’un pion.", "2B has even coordinates, so 2B − A has the same parities as A: (2, 0) and (0, 0) are both (even, even). A jump never changes a peg’s parity."),
    P("Colorions chaque point selon la parité de (x, y). A reste sur les points de sa couleur, B sur les siens, C sur les siens. Les points du quatrième type, cercles vides, n’appartiennent à personne.", "Colour each point by the parity of (x, y). A stays on points of its colour, B on its own, C on its own. Points of the fourth type, empty circles, belong to nobody."),
    P("Réciproquement : A saute sur B, B sur A, C sur A puis sur B, et les trois pions ont glissé de (2, 0). De même de (0, 2), et en sens inverse en défaisant les sauts. Un pion atteint donc toute sa classe.", "Conversely: A over B, B over A, C over A then over B, and all three pegs have slid by (2, 0). Likewise by (0, 2), and backwards by undoing the jumps. So a peg reaches its whole class."),
    sol ? P(`Le point visé est de la classe (${cls}) modulo 2, celle d’un pion : l’invariant ne l’interdit pas. La recherche exhaustive trouve ${sol.length} saut${sol.length > 1 ? "s" : ""} au minimum (ci-contre).`, `The target is of class (${cls}) modulo 2, the class of one peg: the invariant does not forbid it. The exhaustive search finds ${sol.length} jump${sol.length > 1 ? "s" : ""} at least (shown).`) : P(`Le point visé est de la classe (${cls}) modulo 2 : aucun pion ne l’a, il est inatteignable. Réponse : 0.`, `The target is of class (${cls}) modulo 2: no peg has it, so it is unreachable. Answer: 0.`),
  ]; },
  draw(c, s, p, q) {
    const T = pegTarget(q.target), sol = pegsSolve(T), X = (x) => 40 + (x + 2) * 52, Y = (y) => 246 - (y + 1) * 52, pt = ([x, y]) => [X(x), Y(y)];
    const cc = { "0,0": colour(0), "1,0": colour(1), "0,1": colour(2) }, names = ["A", "B", "C"];
    for (let x = -2; x <= 6; x++) for (let y = -1; y <= 3; y++) {
      const cl = pegClass([x, y]).join();
      if (s >= 3) c.circ(X(x), Y(y), cl === "1,1" ? 4.5 : 3.5, cl === "1,1" ? { fill: "none", stroke: "var(--ink)", "stroke-width": 1.2, opacity: 0.8 } : { fill: cc[cl], opacity: 0.85 });
      else c.circ(X(x), Y(y), 2, { fill: "var(--line-strong)" });
    }
    // target mark
    const [tx, ty] = pt(T);
    c.circ(tx, ty, 13, { fill: "none", stroke: s === 5 ? (sol ? "var(--pos)" : "var(--neg)") : "var(--ink)", "stroke-width": 2, "stroke-dasharray": "4 4" });
    c.line(tx - 6, ty, tx + 6, ty, { stroke: "var(--ink)", "stroke-width": 1.8 }); c.line(tx, ty - 6, tx, ty + 6, { stroke: "var(--ink)", "stroke-width": 1.8 });
    let pos = PEGS_START.map((a) => [...a]), hop = null;   // hop: { i, from, to, k }
    const play = (list) => {   // replay a list of jumps as p goes from 0 to 1
      const n = list.length, u = Math.min(n - 1e-9, ez(p) * n), idx = Math.floor(u);
      if (p >= 1) { pos = list.at(-1).state.map((a) => [...a]); return; }
      pos = (idx === 0 ? PEGS_START : list[idx - 1].state).map((a) => [...a]);
      hop = { i: list[idx].peg, from: list[idx].from, to: list[idx].to, k: u - idx };
    };
    if (s === 1) hop = { i: 0, from: [0, 0], to: [2, 0], k: ez(seg(p, 0.1, 0.9)) };
    if (s === 4) play(pegsRun(PEGS_SHIFTS.x));
    if (s === 5 && sol) play(sol);
    if (s === 1 || s === 2) { const [a, b] = [pt([0, 0]), pt([1, 0])]; c.line(a[0], a[1], pt([2, 0])[0], pt([2, 0])[1], { stroke: "var(--muted)", "stroke-dasharray": "3 4" }); if (s === 1) c.text(b[0], b[1] + 34, `B = ${c.t("milieu", "midpoint")}`, { ...mid, class: "sol-small" }); }
    if (s === 2) {
      const g = pt([2, 0]); c.circ(g[0], g[1], 11, { fill: "none", stroke: colour(0), "stroke-width": 2, "stroke-dasharray": "3 3" }); c.text(g[0], g[1] + 32, "(2, 0) ≡ (0, 0)", { ...mid, class: "sol-line" });
      c.text(pt([0, 0])[0], pt([0, 0])[1] + 32, `(${c.t("pair, pair", "even, even")})`, { ...mid, class: "sol-small" });
    }
    pos.forEach((a, i) => {
      let [x, y] = a;
      if (hop && hop.i === i) { x = hop.from[0] + (hop.to[0] - hop.from[0]) * hop.k; y = hop.from[1] + (hop.to[1] - hop.from[1]) * hop.k - Math.sin(Math.PI * hop.k) * 0.34; }
      const [px, py] = [X(x), Y(y)];
      c.circ(px, py, 13, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 }); c.text(px, py + 5, names[i], { ...mid, class: "sol-label" });
    });
    if (s === 5) { c.text(494, 36, sol ? `${sol.length}` : "0", { ...mid, class: "sol-hot" }); c.text(494, 56, c.t(sol ? (sol.length > 1 ? "sauts" : "saut") : "impossible", sol ? (sol.length > 1 ? "jumps" : "jump") : "impossible"), { ...mid, class: "sol-small" }); }
  },
};

/* ------------------------------------------------------------ inversions */
const inversionsSol = {
  size: [520, 300],
  steps: (q) => { const p0 = permOf(q.n, q.seed), inv = inversions(p0); return [
    P(`La rangée : ${p0.join(", ")}. Une inversion est une paire (pas forcément voisine) où la plus grande est à gauche : il y en a ${inv}.`, `The row: ${p0.join(", ")}. An inversion is a pair (not necessarily neighbours) where the taller is on the left: there are ${inv}.`),
    P("On échange deux voisines mal rangées : leur paire n’est plus une inversion, et aucune autre paire ne change. Le nombre d’inversions baisse exactement de 1.", "Swap two neighbours in the wrong order: their pair stops being an inversion, and no other pair changes. The number of inversions drops by exactly 1."),
    P("On recommence : chaque échange fait baisser le compteur de 1, quel que soit l’échange choisi.", "Again and again: every swap lowers the counter by 1, whichever swap is chosen."),
    P(`La rangée est triée quand le compteur vaut 0. Il fallait donc exactement ${inv} échanges, quels que soient les choix.`, `The row is sorted when the counter reaches 0. So exactly ${inv} swaps were needed, whatever the choices.`),
  ]; },
  draw(c, s, p, q) {
    const p0 = permOf(q.n, q.seed), N = q.n, log = bubbleSwaps(p0).log, W = Math.min(46, 440 / N), x0 = 260 - (W * N) / 2, base = 250;
    const total = log.length, done = s === 0 ? 0 : s === 1 ? Math.min(1, total) * ez(p) : s === 2 ? Math.min(total, 1 + ez(p) * (total - 1)) : total, whole = Math.floor(done + 1e-9), frac = done - whole;
    const row = [...p0]; for (let i = 0; i < whole; i++) { const j = log[i]; [row[j], row[j + 1]] = [row[j + 1], row[j]]; }
    const slot = (i) => x0 + i * W, h = (v) => 24 + (v / N) * 150;
    row.forEach((v, i) => {
      let x = slot(i); if (frac > 0 && whole < total) { const j = log[whole]; if (i === j) x = lerp(slot(i), slot(i + 1), ez(frac)); if (i === j + 1) x = lerp(slot(i), slot(i - 1), ez(frac)); }
      c.rect(x + 2, base - h(v), W - 4, h(v), { rx: 5, fill: `color-mix(in srgb, ${colour(v - 1)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 }); c.text(x + W / 2, base - h(v) + 18, v, { ...mid, class: "sol-small", style: "font-weight:700" });
    });
    const inv = inversions(row); c.text(260, 34, `${c.t("inversions", "inversions")} : ${Math.max(0, inv - (frac > 0 && whole < total ? 1 : 0) * 0)}`, { ...mid, class: s === 3 ? "sol-hot" : "sol-big small" });
    c.text(260, 285, `${c.t("échanges faits", "swaps made")} : ${whole}`, { ...mid, class: "sol-sub" });
  },
};

/* ----------------------------------------------------------------- piles */
const piles = {
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

export const SOLUTIONS_3 = { reflect, lunes, star, box, merge, cham, pegs, inversions: inversionsSol, piles };
void [inversions, boxPath];
