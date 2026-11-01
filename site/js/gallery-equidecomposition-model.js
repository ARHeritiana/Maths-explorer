// Pure mathematics of the equidecomposition exhibit (no DOM): the Wallace-Bolyai-Gerwien construction. Two simple
// polygons of equal area are cut into polygonal pieces that move (rotation and translation only) into a common
// rectangle R, and the cuts of the second polygon are played backwards. Stages 0 to 3 turn P into R (triangulate and
// make each triangle a rectangle; shear into a parallelogram; shear back into a rectangle of width W; stack), stages
// 4 to 7 turn R into Q. Checked in tests/gallery-equidecomposition.test.mjs (area at every stage time for every pair
// of presets, stages join up, degenerate custom polygons).
const P2 = (fr, en) => [fr, en];
const TAU = Math.PI * 2;
export const AREA = 500;               // both polygons are rescaled to this area so that the hypothesis holds
export const STAGES = 8;
export const MAX_VERTICES = 120;       // ear clipping is O(n^3); a hand-made polygon never needs more
export const MAX_ASPECT = 40;          // bounding box more than 40 times longer than wide: pieces would be hair-thin

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const reg = (n, o = 0) => [...Array(n)].map((_, i) => [Math.cos(o + TAU * i / n), Math.sin(o + TAU * i / n)]);
const star = () => [...Array(10)].map((_, i) => { const r = i % 2 ? .45 : 1, a = Math.PI * i / 5; return [r * Math.cos(a), r * Math.sin(a)]; });

export const PRESETS = [
  { id: 'square', name: P2('Carré', 'Square'), pts: [[0, 0], [1, 0], [1, 1], [0, 1]] },
  { id: 'rectangle', name: P2('Rectangle 4×1', 'Rectangle 4×1'), pts: [[0, 0], [4, 0], [4, 1], [0, 1]] },
  { id: 'triangle', name: P2('Triangle', 'Triangle'), pts: [[0, 0], [4, 0], [1, 3]] },
  { id: 'right', name: P2('Triangle rectangle', 'Right triangle'), pts: [[0, 0], [3, 0], [0, 4]] },
  { id: 'parallelogram', name: P2('Parallélogramme', 'Parallelogram'), pts: [[0, 0], [3, 0], [4, 1.5], [1, 1.5]] },
  { id: 'trapezoid', name: P2('Trapèze', 'Trapezoid'), pts: [[0, 0], [4, 0], [3, 2], [1, 2]] },
  { id: 'hexagon', name: P2('Hexagone', 'Hexagon'), pts: reg(6) },
  { id: 'pentagon', name: P2('Pentagone', 'Pentagon'), pts: reg(5, -Math.PI / 2) },
  { id: 'l-shape', name: P2('Polygone en L', 'L-shape'), pts: [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]] },
  { id: 'cross', name: P2('Croix', 'Cross'), pts: [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1]] },
  { id: 'star', name: P2('Étoile (non convexe)', 'Star (concave)'), pts: star() },
  { id: 'arrow', name: P2('Flèche', 'Arrow'), pts: [[0, 1], [3, 1], [3, 0], [5, 1.5], [3, 3], [3, 2], [0, 2]] },
  { id: 'house', name: P2('Maison', 'House'), pts: [[0, 0], [3, 0], [3, 2], [1.5, 3.2], [0, 2]] },
  { id: 'zigzag', name: P2('Zigzag', 'Zigzag'), pts: [[0, 0], [1, 0], [1.5, 1], [2, 0], [3, 0], [3, 1], [2.5, 2], [2, 1], [1.5, 2], [1, 1], [0, 1]] },
];
export const preset = (id) => PRESETS.find((p) => p.id === id);
export const GALLERY = [['square', 'triangle'], ['hexagon', 'square'], ['l-shape', 'star'], ['cross', 'arrow'], ['rectangle', 'pentagon'], ['star', 'hexagon'], ['house', 'zigzag'], ['parallelogram', 'right'], ['trapezoid', 'cross']];

// ---------- elementary geometry ----------
export const area = (A) => A.reduce((s, p, i) => { const q = A[(i + 1) % A.length]; return s + (p[0] * q[1] - q[0] * p[1]) / 2; }, 0);
const cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const inTri = (q, a, b, c) => cr(a, b, q) >= -1e-9 && cr(b, c, q) >= -1e-9 && cr(c, a, q) >= -1e-9;

// Ear clipping of a counter-clockwise simple polygon: n - 2 triangles, or null when the clipping gets stuck.
export function triangulate(Pl) {
  let id = Pl.map((_, i) => i), o = [], g = 0;
  while (id.length > 3 && g++ < 9999) {
    let found = false;
    for (let i = 0; i < id.length; i++) {
      const n = id.length, a = Pl[id[(i + n - 1) % n]], b = Pl[id[i]], c = Pl[id[(i + 1) % n]];
      if (cr(a, b, c) <= 1e-9) continue;
      if (id.some((j) => { const q = Pl[j]; return q !== a && q !== b && q !== c && inTri(q, a, b, c); })) continue;
      o.push([a, b, c]); id.splice(i, 1); found = true; break;
    }
    if (!found) break;
  }
  if (id.length === 3) o.push(id.map((j) => Pl[j]));
  return o.length === Pl.length - 2 ? o : null;   // the final guard: exactly n - 2 triangles
}

// Rescale to area AREA, counter-clockwise, bounding box centred at (cx, cy).
export function normalise(A, cx = 0, cy = 0) {
  A = A.map((p) => [...p]); if (area(A) < 0) A.reverse();
  const s = Math.sqrt(AREA / area(A)); A = A.map((p) => [p[0] * s, p[1] * s]);
  const xs = A.map((p) => p[0]), ys = A.map((p) => p[1]), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  return A.map((p) => [p[0] - mx + cx, p[1] - my + cy]);
}

// ---------- validation of a hand-made polygon ----------
// Closed-segment intersection: a proper crossing, an endpoint on the other segment and a collinear overlap all count,
// so polygons that touch themselves (pinched bow-tie) are refused.
const onSeg = (p, q, r) => Math.min(p[0], q[0]) - 1e-9 <= r[0] && r[0] <= Math.max(p[0], q[0]) + 1e-9 && Math.min(p[1], q[1]) - 1e-9 <= r[1] && r[1] <= Math.max(p[1], q[1]) + 1e-9;
export const segmentsMeet = (a, b, c, d) => {
  const o = (p, q, r) => { const v = cr(p, q, r); return Math.abs(v) < 1e-9 ? 0 : Math.sign(v); }, o1 = o(a, b, c), o2 = o(a, b, d), o3 = o(c, d, a), o4 = o(c, d, b);
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;
  return (o1 === 0 && onSeg(a, b, c)) || (o2 === 0 && onSeg(a, b, d)) || (o3 === 0 && onSeg(c, d, a)) || (o4 === 0 && onSeg(c, d, b));
};
export function isSimple(A) {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    const a = A[i], b = A[(i + 1) % n], c = A[(i + 2) % n];
    if (Math.abs(cr(a, b, c)) < 1e-9 && dot(sub(b, a), sub(c, b)) < 0) return false;   // an edge that goes back on itself
    for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (segmentsMeet(a, b, A[j], A[(j + 1) % n])) return false; }
  }
  return true;
}
const dedupe = (A) => A.filter((p, i) => dist(p, A[(i + A.length - 1) % A.length]) > 1e-9);

// Typed vertices: pairs separated by semicolons or new lines, x and y separated by a comma ("2.5,3"), by spaces ("2,5 3,5")
// or both ("2.5, 3"). The decimal separator is a point or a comma; a comma is read as the separator of x and y only when it is
// the single comma of a pair without spaces. Null if malformed.
export function parseVertices(text) {
  const parts = String(text).split(/[;\n]+/).map((s) => s.trim()).filter(Boolean), out = [];
  for (const part of parts) {
    const tok = part.split(/\s+/).filter(Boolean); let q = null;
    if (tok.length === 1) { const c = tok[0].split(','); if (c.length === 2) q = c; }
    else if (tok.length === 2) q = [tok[0].replace(/,$/, ''), tok[1]];
    else if (tok.length === 3 && tok[1] === ',') q = [tok[0], tok[2]];
    if (!q) return null;
    const n = q.map((x) => (/^[+-]?(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?$/.test(x) ? Number(x.replace(',', '.')) : NaN)); if (!n.every(Number.isFinite)) return null; out.push(n);
  }
  return out.length ? out : null;
}

// The one validator for clicks and for typed vertices. Returns { ok: true, poly } (poly: duplicates removed, centred and
// scaled to a bounding box of 100, so tolerances do not depend on the units typed) or { ok: false, code } with code
// 'numbers' | 'few' | 'many' | 'thin' | 'invalid'.
export function validatePolygon(raw) {
  if (!Array.isArray(raw) || raw.some((p) => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) return { ok: false, code: 'numbers' };
  if (raw.length > MAX_VERTICES) return { ok: false, code: 'many' };
  const xs = raw.map((p) => p[0]), ys = raw.map((p) => p[1]), dim = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  if (raw.length < 3 || !(dim > 0) || !Number.isFinite(dim)) return { ok: false, code: 'few' };
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2, s = 100 / dim;
  const A = dedupe(raw.map((p) => [(p[0] - mx) * s, (p[1] - my) * s]));
  if (A.length < 3) return { ok: false, code: 'few' };
  const bx = A.map((p) => p[0]), by = A.map((p) => p[1]), bw = Math.max(...bx) - Math.min(...bx), bh = Math.max(...by) - Math.min(...by);
  if (Math.max(bw, bh) > MAX_ASPECT * Math.max(Math.min(bw, bh), 1e-12)) return { ok: false, code: 'thin' };
  if (Math.abs(area(A)) < 1e-6 || !isSimple(A) || !triangulate(normalise(A))) return { ok: false, code: 'invalid' };
  return { ok: true, poly: A };
}

// ---------- the dissection ----------
const clip = (A, lo, hi) => {
  const cut = (A, f) => { const o = []; for (let i = 0; i < A.length; i++) { const a = A[i], b = A[(i + 1) % A.length], fa = f(a), fb = f(b); if (fa >= 0) o.push(a); if (fa * fb < 0) { const t = fa / (fa - fb); o.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); } } return o; };
  return cut(cut(A, (p) => p[0] - lo), (p) => hi - p[0]);
};
// A piece moves as p -> centre + R(angle t) (p - centre) + t v, for t from 0 to 1.
export const place = (pc, q, t) => { const a = pc.a * t, c = Math.cos(a), s = Math.sin(a), d = sub(q, pc.c); return [pc.c[0] + c * d[0] - s * d[1] + pc.v[0] * t, pc.c[1] + s * d[0] + c * d[1] + pc.v[1] * t]; };
export const piecePolygon = (pc, t) => pc.p.map((q) => place(pc, q, t));

// Stage 0: each triangle becomes a rectangle (3 pieces; two rotate by 180 degrees about midpoints of the slanted sides).
function stage0(A0, colour0) {
  const pcs = [], rects = [], tris = triangulate(A0);
  tris.forEach((t, i) => {
    let bi = 0, bl = -1; for (let j = 0; j < 3; j++) { const l = dist(t[j], t[(j + 1) % 3]); if (l > bl) { bl = l; bi = j; } }
    const A = t[bi], B = t[(bi + 1) % 3], C = t[(bi + 2) % 3], L = bl, u = mul(sub(B, A), 1 / L); let n = [-u[1], u[0]]; if (dot(sub(C, A), n) < 0) n = mul(n, -1);
    const h = dot(sub(C, A), n), k = dot(sub(C, A), u), W = (x, y) => [A[0] + x * u[0] + y * n[0], A[1] + x * u[1] + y * n[1]], M1 = W(k / 2, h / 2), M2 = W((L + k) / 2, h / 2), K = W(k, h / 2), col = i + colour0;
    pcs.push({ p: [A, B, M2, M1], c: A, a: 0, v: [0, 0], col, l: 0 }, { p: [M1, K, C], c: M1, a: Math.PI, v: [0, 0], col, l: 1 }, { p: [K, M2, C], c: M2, a: Math.PI, v: [0, 0], col, l: 2 });
    const h2 = h / 2; rects.push(L >= h2 ? { o: A, ex: u, ey: n, a: L, b: h2, col } : { o: A, ex: n, ey: u, a: h2, b: L, col });
  });
  return { pcs, rects };
}
// Shear lemma: a parallelogram (base L, offset off, height H) and the rectangle L x H are cut into the same strips of width L.
function lemma(o, eu, ev, L, off, H, toRect, col) {
  const par = [[0, 0], [L, 0], [L + off, H], [off, H]], out = [], K = Math.ceil((L + off) / L - 1e-9);
  for (let k = 0; k < K; k++) {
    const q = clip(par, k * L, (k + 1) * L); if (q.length < 3 || Math.abs(area(q)) < 1e-6) continue; const sh = toRect ? 0 : -k * L;
    out.push({ p: q.map((p) => { const x = p[0] + sh; return [o[0] + x * eu[0] + p[1] * ev[0], o[1] + x * eu[1] + p[1] * ev[1]]; }), c: o, a: 0, v: mul(eu, (toRect ? -k : k) * L), col, l: k });
  }
  return out;
}
// Stages 1 to 3: rectangle -> parallelogram with slanted side W -> rectangle of width W -> stacked into R.
// Each triangle is worked on in its own workspace (a box of a row, see `shelf`), so that the pieces of different triangles
// never overlap at the end of a step: step 0 cuts the triangle and carries the pieces to the box as a rectangle, step 1 shears
// the rectangle, step 2 turns the parallelogram into a rectangle of width W inside the same box, step 3 carries it into R.
const frameOf = (r, W) => {
  const s = Math.sqrt(W * W - r.b * r.b);
  const w = [s * r.ex[0] + r.b * r.ey[0], s * r.ex[1] + r.b * r.ey[1]], u = mul(w, 1 / W); let v = [-u[1], u[0]]; const e = mul(r.ex, r.a); if (dot(e, v) < 0) v = mul(v, -1);
  return { s, u, v, off: dot(e, u), H: dot(e, v) };
};
// Boxes (relative to each rectangle's origin) holding the parallelogram of step 1 and the rectangle of step 2, laid out in a row.
function shelf(rects, W) {
  const boxes = rects.map((r) => {
    const f = frameOf(r, W), pts = [[0, 0], [r.a, 0], [r.a, r.b], [0, r.b], [r.a + f.s, r.b], [f.s, r.b]].map(([x, y]) => [x * r.ex[0] + y * r.ey[0], x * r.ex[1] + y * r.ey[1]])
      .concat([[0, 0], [W, 0], [W, f.H], [0, f.H]].map(([x, y]) => [x * f.u[0] + y * f.v[0], x * f.u[1] + y * f.v[1]]));
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  });
  const gap = 0.06 * W, total = boxes.reduce((t, bx) => t + (bx.x1 - bx.x0), 0) + gap * (boxes.length - 1), tall = Math.max(...boxes.map((bx) => bx.y1 - bx.y0));
  let x = -total / 2;
  return boxes.map((bx) => { const at = [x - bx.x0, -35 - tall / 2 - bx.y0]; x += bx.x1 - bx.x0 + gap; return at; });
}
function later(rects, W, X0, Y0) {
  const s2a = [], s2b = [], s3 = [], spots = shelf(rects, W); let y = Y0;
  rects.forEach((r, i) => {
    const { s, u, v, off, H } = frameOf(r, W), o2 = [spots[i][0], spots[i][1]];
    s2a.push(...lemma(o2, r.ex, r.ey, r.a, s, r.b, false, r.col));
    s2b.push(...lemma(o2, u, v, W, off, H, true, r.col));
    const ph = -Math.atan2(u[1], u[0]), cs = Math.cos(ph), sn = Math.sin(ph), cor = [[0, 0], [W, 0], [W, H], [0, H]].map((q) => [o2[0] + q[0] * u[0] + q[1] * v[0], o2[1] + q[0] * u[1] + q[1] * v[1]]);
    const rot = cor.map((q) => { const d = sub(q, o2); return [o2[0] + cs * d[0] - sn * d[1], o2[1] + sn * d[0] + cs * d[1]]; });
    s3.push({ p: cor, c: o2, a: ph, v: [X0 - Math.min(...rot.map((q) => q[0])), y - Math.min(...rot.map((q) => q[1]))], col: r.col, l: 0 }); y += H;
  });
  return { stages: [s2a, s2b, s3], spots };
}

// The whole chain for two polygons (any simple polygons, counter-clockwise or not). Both are rescaled to area AREA.
export function buildChain(P, Q) {
  const AP = normalise(P, -50, -25), AQ = normalise(Q, 50, -25), a = stage0(AP, 0), b = stage0(AQ, 4);
  const W = 1.25 * Math.max(...a.rects.concat(b.rects).map((r) => r.a)), H = AREA / W, X0 = -W / 2, Y0 = 30 - H / 2;
  const lp = later(a.rects, W, X0, Y0), lq = later(b.rects, W, X0, Y0);
  // step 0 also carries each triangle's pieces to the workspace of its rectangle (the pieces know their triangle by `col`)
  for (const [st, l, c0, rs] of [[a.pcs, lp, 0, a.rects], [b.pcs, lq, 4, b.rects]]) st.forEach((pc) => { const i = pc.col - c0; pc.v = [l.spots[i][0] - rs[i].o[0], l.spots[i][1] - rs[i].o[1]]; });
  const CH = { AP, AQ, W, H, X0, Y0, nP: a.rects.length, nQ: b.rects.length, P: [a.pcs, ...lp.stages], Q: [b.pcs, ...lq.stages] };
  const all = [...AP, ...AQ, [X0, Y0], [X0 + W, Y0 + H]];
  [...CH.P, ...CH.Q].forEach((st) => st.forEach((pc) => pc.p.forEach((q) => { all.push(place(pc, q, 0), place(pc, q, 1)); })));
  CH.bbox = all; CH.R = [[X0, Y0], [X0 + W, Y0], [X0 + W, Y0 + H], [X0, Y0 + H]];
  return CH;
}
export const smooth = (t) => t * t * (3 - 2 * t);
// The pieces of step i (0 to 7) at progress e (0 to 1) of that step; steps 4 to 7 are the stages of Q played backwards.
export function stagePieces(CH, i, e) {
  const st = i < 4 ? CH.P[i] : CH.Q[7 - i], tt = i < 4 ? e : 1 - e;
  return st.map((pc) => ({ poly: piecePolygon(pc, tt), colour: (pc.col * 2 + pc.l) % 8 }));
}
// The picture at global time T in [0, 8] (the easing is inside).
export function frame(CH, T) {
  const t = Math.max(0, Math.min(STAGES, T)), i = Math.min(STAGES - 1, Math.floor(t)), e = smooth(t - i);
  return { step: i, pieces: stagePieces(CH, i, e) };
}
export const pieceCount = (CH, i) => (i < 4 ? CH.P[i] : CH.Q[7 - i]).length;
