// Pure mathematics of the box challenge (no DOM), checked by an independent method in tests/.
//
// Pure geometry for the ant-on-a-box challenge (no DOM, tested in tests/box-model.test.mjs).
// The box is [0, a] × [0, b] × [0, c]; the ant starts at S = (0, 0, 0) and wants T = (a, b, c).
// Faces: 0 x = 0, 1 x = a, 2 y = 0, 3 y = b, 4 z = 0, 5 z = c. Opposite faces are (0, 1), (2, 3), (4, 5).

/* ------------------------------------------------------- D: ant on a box */
// Two adjacent faces unfolded into one rectangle (x + y) × z: the straight segment has length √((x + y)² + z²).
export function boxUnfoldings(a, b, c) {
  return [{ cross: [a, b], height: c }, { cross: [a, c], height: b }, { cross: [b, c], height: a }].map((u) => ({ ...u, length: Math.hypot(u.cross[0] + u.cross[1], u.height) }));
}

export const boxPath = (a, b, c) => Math.min(...boxUnfoldings(a, b, c).map((u) => u.length));

export const BOX_SETS = ["1,2,4", "2,3,12", "3,5,6", "4,5,12", "5,7,9", "1,5,8"];

export const boxSet = (id) => String(id).split(",").map(Number);

export const FACE_AXIS = [0, 0, 1, 1, 2, 2];

export const FACE_SIGN = [-1, 1, -1, 1, -1, 1];

export const faceNormal = (f) => { const n = [0, 0, 0]; n[FACE_AXIS[f]] = FACE_SIGN[f]; return n; };

export const faceValue = (dims, f) => (FACE_SIGN[f] > 0 ? dims[FACE_AXIS[f]] : 0);

export const oppositeFace = (f) => f ^ 1;

// The faces a point of the surface lies on (one inside a face, two on an edge, three at a corner).
export function facesOf(dims, p, eps = 1e-9) {
  const out = [];
  for (let f = 0; f < 6; f++) if (Math.abs(p[FACE_AXIS[f]] - faceValue(dims, f)) < eps) out.push(f);
  return out;
}

export const dist3 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

// Length of a polyline of 3D points.
export const polyLength = (pts) => pts.slice(1).reduce((s, p, i) => s + dist3(pts[i], p), 0);

// Can the ant walk straight from p to q? Only when they share a face (the segment then lies in that face).
export function shareFace(dims, p, q, eps = 1e-9) {
  const fq = facesOf(dims, q, eps);
  return facesOf(dims, p, eps).find((f) => fq.includes(f)) ?? -1;
}

// Shortest route between a point on face f and a point on a face g adjacent to f (crossing their common edge once):
// unfold g into the plane of f. Returns { length, crossing: [x, y, z] }.
export function crossEdge(dims, f, g, p, q) {
  const kf = FACE_AXIS[f], kg = FACE_AXIS[g], e = 3 - kf - kg;
  const dp = Math.abs(p[kg] - faceValue(dims, g)), dq = Math.abs(q[kf] - faceValue(dims, f));
  const along = dp + dq < 1e-12 ? p[e] : p[e] + ((q[e] - p[e]) * dp) / (dp + dq);
  const crossing = [0, 0, 0]; crossing[kf] = faceValue(dims, f); crossing[kg] = faceValue(dims, g); crossing[e] = along;
  return { length: Math.hypot(dp + dq, q[e] - p[e]), crossing };
}

// The three ways to flatten two neighbouring faces that carry S and T. Each gives a rectangle (x + y) × z in which S and T
// are opposite corners. `base` is the face that stays in place, `hinge` the face that turns about the shared edge.
export function nets(dims) {
  const [a, b, c] = dims;
  const mk = (base, hinge, wide, tall) => ({ base, hinge, edgeAxis: 3 - FACE_AXIS[base] - FACE_AXIS[hinge], width: wide[0] + wide[1], height: tall, parts: wide, length: Math.hypot(wide[0] + wide[1], tall) });
  return [mk(2, 1, [a, b], c), mk(5, 2, [b, c], a), mk(5, 0, [a, c], b)];
}

export const shortest = (dims) => Math.min(...nets(dims).map((n) => n.length));

// The straight route in a net, folded back on the box: S, the point where it crosses the shared edge, T.
export function netRoute(dims, net) {
  const S = [0, 0, 0], T = dims.slice();
  const f = net.base, g = net.hinge, onBase = facesOf(dims, S).includes(f);   // S lies on one of the two faces, T on the other
  const res = onBase ? crossEdge(dims, f, g, S, T) : crossEdge(dims, g, f, S, T);
  return { points: [S, res.crossing, T], length: res.length };
}

// Position of the vertices of face g when it is folded by `amount` (0 = closed box, 1 = flat in the plane of face f).
// The hinge is the edge shared by f and g; a vertex at distance d from it, inside g, swings from -n_f to +n_g.
export function hingePosition(dims, f, g, v, amount) {
  const kf = FACE_AXIS[f], kg = FACE_AXIS[g], d = Math.abs(v[kf] - faceValue(dims, f)), nf = faceNormal(f), ng = faceNormal(g);
  const th = (amount * Math.PI) / 2, out = v.slice();
  const edge = v.slice(); edge[kf] = faceValue(dims, f); edge[kg] = faceValue(dims, g);
  for (let i = 0; i < 3; i++) out[i] = edge[i] + d * (-nf[i] * Math.cos(th) + ng[i] * Math.sin(th));
  return out;
}

// The six faces as lists of corner points.
export function faceCorners(dims, f) {
  const k = FACE_AXIS[f], u = (k + 1) % 3, w = (k + 2) % 3, v = faceValue(dims, f), out = [];
  for (const [i, j] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { const p = [0, 0, 0]; p[k] = v; p[u] = i * dims[u]; p[w] = j * dims[w]; out.push(p); }
  return out;
}
