// Prince Rupert's problem (issue #27), pure. A convex polyhedron is Rupert when a congruent copy passes, with room to spare,
// through a straight tunnel cut in it. Equivalently: there are two orientations whose shadows (orthogonal projections on a
// plane) satisfy s·(inner shadow) + t ⊂ interior of the outer shadow for some translation t and some s > 1. For fixed
// orientations the largest s is a linear programme in (s, tx, ty), solved exactly here by enumerating vertices of the
// feasible region (`bestScale`). Witnesses below were found by a random search with local refinement and are checked by
// tests/gallery-rupert.test.mjs; none of this proves anything for a shape where no witness is found.
const PHI = (1 + Math.sqrt(5)) / 2;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => Math.hypot(a[0], a[1], a[2]);
const signs = [1, -1];
const evenPerms = ([a, b, c]) => [[a, b, c], [b, c, a], [c, a, b]];
const allSigns = (v) => signs.flatMap((s0) => signs.flatMap((s1) => signs.map((s2) => [v[0] * s0, v[1] * s1, v[2] * s2])));
const unique = (pts) => { const seen = new Map(); for (const p of pts) seen.set(p.map((x) => Math.round(x * 1e9)).join(','), p); return [...seen.values()]; };

export const RAW = {
  tetrahedron: () => [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
  cube: () => allSigns([1, 1, 1]),
  octahedron: () => [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
  dodecahedron: () => unique([...allSigns([1, 1, 1]), ...allSigns([0, 1 / PHI, PHI]).flatMap(evenPerms)]),
  icosahedron: () => unique(allSigns([0, 1, PHI]).flatMap(evenPerms)),
  // small rhombicosidodecahedron, edge 2: even permutations of (±1, ±1, ±φ³), (±φ², ±φ, ±2φ), (±(2 + φ), 0, ±φ²)
  rhombicosidodecahedron: () => unique([[1, 1, PHI ** 3], [PHI ** 2, PHI, 2 * PHI], [2 + PHI, 0, PHI ** 2]].flatMap((v) => allSigns(v).flatMap(evenPerms))),
};

// A convex solid from its vertices: circumradius 1, faces (outward normal, vertex indices in order), edges, V, E, F.
export function solid(name) {
  const raw = RAW[name](), r = Math.max(...raw.map(norm)), verts = raw.map((v) => v.map((x) => x / r)), planes = new Map();
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) for (let k = j + 1; k < verts.length; k++) {
    let n = cross(sub(verts[j], verts[i]), sub(verts[k], verts[i])); const len = norm(n); if (len < 1e-9) continue;
    n = n.map((x) => x / len); let d = dot(n, verts[i]); if (d < 0) { n = n.map((x) => -x); d = -d; }
    const key = [...n, d].map((x) => Math.round(x * 1e6)).join(','); if (planes.has(key)) continue;
    if (verts.some((v) => dot(n, v) > d + 1e-7)) continue;
    planes.set(key, { n, idx: verts.map((v, m) => [v, m]).filter(([v]) => Math.abs(dot(n, v) - d) < 1e-7).map(([, m]) => m) });
  }
  const faces = [...planes.values()].map(({ n, idx }) => {
    const c = idx.reduce((s, m) => s.map((x, q) => x + verts[m][q] / idx.length), [0, 0, 0]), u0 = sub(verts[idx[0]], c), u = u0.map((x) => x / norm(u0)), v = cross(n, u);
    const ang = (m) => Math.atan2(dot(sub(verts[m], c), v), dot(sub(verts[m], c), u));
    return { n, verts: idx.sort((a, b) => ang(a) - ang(b)) };
  });
  const edges = new Set(); faces.forEach((f) => f.verts.forEach((a, i) => { const b = f.verts[(i + 1) % f.verts.length]; edges.add(a < b ? `${a}-${b}` : `${b}-${a}`); }));
  return { name, verts, faces, edges: [...edges].map((e) => e.split('-').map(Number)), V: verts.length, E: edges.size, F: faces.length };
}

// Orientation from three angles: R = Rz(a) · Rx(b) · Rz(c). The view looks along z, so a shadow is (x, y) of R v.
export function rotation([a, b, c]) {
  const Rz = (t) => [[Math.cos(t), -Math.sin(t), 0], [Math.sin(t), Math.cos(t), 0], [0, 0, 1]];
  const Rx = (t) => [[1, 0, 0], [0, Math.cos(t), -Math.sin(t)], [0, Math.sin(t), Math.cos(t)]];
  const mul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  return mul(mul(Rz(a), Rx(b)), Rz(c));
}
export const apply = (R, v) => [dot(R[0], v), dot(R[1], v), dot(R[2], v)];
export function hull(pts) {   // convex hull of 2D points, counter-clockwise, no repeated or collinear points
  const P = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => { const h = []; for (const p of list) { while (h.length >= 2 && cr(h[h.length - 2], h[h.length - 1], p) <= 1e-12) h.pop(); h.push(p); } h.pop(); return h; };
  return [...half(P), ...half([...P].reverse())];
}
export const shadow = (S, angles) => { const R = rotation(angles); return hull(S.verts.map((v) => apply(R, v).slice(0, 2))); };

// Largest s (and its t) with s·P + t inside the convex polygon Q (both counter-clockwise hulls): maximise s subject to
// s·h_k + n_k·t ≤ c_k for every edge k of Q (n_k outward unit normal, c_k its offset, h_k = max over P of n_k·p).
export function bestScale(P, Q) {
  const rows = Q.map((a, k) => { const b = Q[(k + 1) % Q.length], e = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...e), n = [e[1] / l, -e[0] / l];
    return { h: Math.max(...P.map((p) => n[0] * p[0] + n[1] * p[1])), n, c: n[0] * a[0] + n[1] * a[1] }; });
  let best = { s: 0, t: [0, 0] };
  const ok = (s, t) => rows.every((r) => s * r.h + r.n[0] * t[0] + r.n[1] * t[1] <= r.c + 1e-9);
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) for (let k = j + 1; k < rows.length; k++) {
    const A = [rows[i], rows[j], rows[k]].map((r) => [r.h, r.n[0], r.n[1], r.c]);
    const det3 = (M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    const M = A.map((r) => r.slice(0, 3)), D = det3(M); if (Math.abs(D) < 1e-12) continue;
    const col = (q) => det3(M.map((r, m) => r.map((x, p) => (p === q ? A[m][3] : x)))) / D;
    const s = col(0), t = [col(1), col(2)];
    if (s > best.s && ok(s, t)) best = { s, t };
  }
  return best;
}
export const scaleFor = (S, outer, inner) => bestScale(shadow(S, inner), shadow(S, outer));

// Witnesses (outer angles, inner angles): found by search, checked by the tests. The cube's reaches Nieuwland's constant.
export const WITNESSES = {
  cube: { outer: [0, 0.8346456389, 1.0892713862], inner: [5.1344275259, -4.51e-08, 0.8151574281] },
  tetrahedron: { outer: [0, 4.0585530121, 3.8337029716], inner: [2.6960292618, 2.1948815271, 3.1723836745] },
  octahedron: { outer: [0, -7.87e-08, 3.0243053128], inner: [4.5951016183, 1.9097391382, 2.3580917214] },
  dodecahedron: { outer: [0, 1.5827467267, 4.2810947753], inner: [5.2111895978, 1.165595075, 1.6397984977] },
  icosahedron: { outer: [0, 2.9086323818, 1.8423433318], inner: [2.0306580009, 2.3072098384, 4.8731723378] },
};
export const NIEUWLAND = 3 * Math.sqrt(2) / 4;   // the largest cube that passes through a unit cube
export const SHAPES = ['cube', 'tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron', 'rhombicosidodecahedron'];
