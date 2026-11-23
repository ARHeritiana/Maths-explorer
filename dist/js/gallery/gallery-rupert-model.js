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

// ---- 3D scene helpers (gallery-rupert-gl.js), pure. Orientations are 3x3 rotation matrices (rows), the tunnel runs along z.
export const mul3 = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
export function axisRotation(axis, angle) {   // Rodrigues: rotation by `angle` about the unit vector along `axis`
  const l = norm(axis) || 1, [x, y, z] = axis.map((v) => v / l), c = Math.cos(angle), s = Math.sin(angle), k = 1 - c;
  return [[c + x * x * k, x * y * k - z * s, x * z * k + y * s], [y * x * k + z * s, c + y * y * k, y * z * k - x * s], [z * x * k - y * s, z * y * k + x * s, c + z * z * k]];
}
export function orthonormalize(R) {   // Gram-Schmidt on the rows, so that repeated small turns do not drift
  const a = R[0].map((v) => v / norm(R[0])), b0 = sub(R[1], a.map((v) => v * dot(a, R[1]))), b = b0.map((v) => v / norm(b0));
  return [a, b, cross(a, b)];
}
export function toQuat(R) {   // unit quaternion [w, x, y, z] of a rotation matrix (Shepperd's method)
  const [[a, b, c], [d, e, f], [g, h, i]] = R, tr = a + e + i; let q;
  if (tr > 0) { const s = 2 * Math.sqrt(tr + 1); q = [s / 4, (h - f) / s, (c - g) / s, (d - b) / s]; }
  else if (a > e && a > i) { const s = 2 * Math.sqrt(1 + a - e - i); q = [(h - f) / s, s / 4, (b + d) / s, (c + g) / s]; }
  else if (e > i) { const s = 2 * Math.sqrt(1 + e - a - i); q = [(c - g) / s, (b + d) / s, s / 4, (f + h) / s]; }
  else { const s = 2 * Math.sqrt(1 + i - a - e); q = [(d - b) / s, (c + g) / s, (f + h) / s, s / 4]; }
  const l = Math.hypot(...q); return q.map((v) => v / l);
}
export function fromQuat([w, x, y, z]) {
  return [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]];
}
export function slerp(R0, R1, u) {   // the shortest turn from R0 to R1, a fraction u of the way
  const p = toQuat(R0); let q = toQuat(R1), c = p.reduce((s, v, k) => s + v * q[k], 0);
  if (c < 0) { q = q.map((v) => -v); c = -c; }
  if (c > 0.9995) { const m = p.map((v, k) => v + u * (q[k] - v)), l = Math.hypot(...m); return fromQuat(m.map((v) => v / l)); }
  const th = Math.acos(c), a = Math.sin((1 - u) * th) / Math.sin(th), b = Math.sin(u * th) / Math.sin(th);
  return fromQuat(p.map((v, k) => a * v + b * q[k]));
}
export const shadowOf = (S, R) => hull(S.verts.map((v) => apply(R, v).slice(0, 2)));
// The passage for two orientations: block shadow Q, piece shadow P, best enlargement r, and the tunnel (P moved by t/s).
export function passage(S, Rout, Rin) {
  const Q = shadowOf(S, Rout), P = shadowOf(S, Rin), r = bestScale(P, Q), ok = r.s > 1 + 1e-9;
  const off = ok ? [r.t[0] / r.s, r.t[1] / r.s] : [0, 0];
  return { Q, P, r, ok, off, tunnel: P.map((p) => [p[0] + off[0], p[1] + off[1]]) };
}
// Face planes {n, d} (n·x ≤ d inside) of the solid turned by R.
export const planesOf = (S, R) => S.faces.map((f) => { const n = apply(R, f.n); return { n, d: dot(f.n, S.verts[f.verts[0]]) }; });
// Sutherland-Hodgman: the part of a planar convex polygon (3D points) inside every half-space n·x ≤ d.
export function clipConvex(poly, planes) {
  let out = poly;
  for (const { n, d } of planes) {
    const next = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i], b = out[(i + 1) % out.length], fa = dot(n, a) - d, fb = dot(n, b) - d;
      if (fa <= 0) next.push(a);
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { const k = fa / (fa - fb); next.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1]), a[2] + k * (b[2] - a[2])]); }
    }
    out = next; if (out.length < 3) return [];
  }
  return out;
}
// The walls of a straight tunnel (counter-clockwise polygon `ring`, along z) inside the block: one convex polygon per side,
// with its normal pointing into the tunnel.
export function tunnelWalls(planes, ring, h = 3) {
  return ring.map((a, k) => {
    const b = ring[(k + 1) % ring.length], e = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...e) || 1;
    return { n: [-e[1] / l, e[0] / l, 0], pts: clipConvex([[a[0], a[1], -h], [b[0], b[1], -h], [b[0], b[1], h], [a[0], a[1], h]], planes) };
  }).filter((w) => w.pts.length >= 3);
}
// Distance along the ray o + s·d (d unit) to the convex solid {n·(x − c) ≤ d}, or null if it misses.
export function rayConvex(o, d, planes, c = [0, 0, 0]) {
  let lo = 0, hi = Infinity;
  for (const p of planes) {
    const den = dot(p.n, d), num = p.d - dot(p.n, sub(o, c));
    if (Math.abs(den) < 1e-12) { if (num < 0) return null; continue; }
    const s = num / den; if (den < 0) lo = Math.max(lo, s); else hi = Math.min(hi, s);
    if (lo > hi) return null;
  }
  return Number.isFinite(hi) ? lo : null;
}
// One step of a random local search for a passage: `tries` small random turns of either orientation, the best one kept.
// `rand` returns numbers in [0, 1). Returns the new state {Rout, Rin, s}; it never gets worse.
export function searchStep(S, { Rout, Rin, s }, rand, tries = 12, size = 0.25) {
  let best = { Rout, Rin, s };
  const turn = (R) => mul3(axisRotation([rand() - 0.5, rand() - 0.5, rand() - 0.5], (rand() - 0.5) * 2 * size), R);
  for (let k = 0; k < tries; k++) {
    const which = rand() < 0.5, A = which ? turn(Rout) : Rout, B = which ? Rin : turn(Rin), v = bestScale(shadowOf(S, B), shadowOf(S, A)).s;
    if (v > best.s) best = { Rout: A, Rin: B, s: v };
  }
  return best;
}
