// The hairy ball theorem, pure (no DOM). A tangent field on the unit sphere S² is a preset field times a strength plus the strokes
// of a comb: each stroke (centre c, unit tangent t at c) is carried to p by parallel transport along the great circle and weighted
// by exp(-2(1 - c·p)/σ²). The same formula is written in GLSL (FIELD_GLSL), so the hair drawn on the GPU and the zeros found here
// come from one field. Zeros are found on a fine geodesic mesh: the winding number of the field around each triangle is an exact
// integer (a sum of angle steps around a closed loop), each triangle with a nonzero winding holds a zero, refined by Newton's method
// to |v| < 1e-12. The sum of the indices is the Euler characteristic χ(S²) = 2 (Poincaré-Hopf), so at least one zero exists.
export const SIGMA = 0.42, MAX_STROKES = 64;
export const PRESETS = ['dipole', 'vortex', 'single', 'saddle', 'none'];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// preset fields (axis z): dipole = projection of e_z (source at the south pole, sink at the north pole, indices +1 and +1);
// vortex = e_z × p (two centres, +1 and +1); single = the push-forward of a constant plane field by the stereographic map,
// one zero of index +2 at the north pole; saddle = gradient of f = xy on S² (four extrema of index +1, two saddles of index -1).
export function preset(kind, p) {
  const [x, y, z] = p;
  if (kind === 'dipole') return [-z * x, -z * y, 1 - z * z];
  if (kind === 'vortex') return [-y, x, 0];
  if (kind === 'single') { const s = 1 - z; return [s - x * x, -x * y, -x * (z - 1)]; }
  if (kind === 'saddle') { const f = 2 * x * y; return [y - f * x, x - f * y, -f * z]; }
  return [0, 0, 0];
}
// t tangent at c, carried to p along the great circle from c to p (rotation about c × p)
export function transport(t, c, p) { const k = dot(p, t) / (1 + dot(c, p)); return [t[0] - k * (c[0] + p[0]), t[1] - k * (c[1] + p[1]), t[2] - k * (c[2] + p[2])]; }
// state: {preset, strength, strokes: [{c, t}]}; returns the tangent vector at the unit vector p
export function field(state, p) {
  const b = preset(state.preset, p), s = state.strength ?? 1, v = [b[0] * s, b[1] * s, b[2] * s];
  for (const { c, t } of state.strokes || []) {
    const cp = dot(c, p); if (cp < -0.95) continue;   // weight below e^-22: nothing to add, and transport is singular at -c
    const w = Math.exp(-2 * (1 - cp) / (SIGMA * SIGMA)), q = transport(t, c, p);
    v[0] += w * q[0]; v[1] += w * q[1]; v[2] += w * q[2];
  }
  const n = dot(v, p); return [v[0] - n * p[0], v[1] - n * p[1], v[2] - n * p[2]];
}
export const PRESET_INDEX = { none: 0, dipole: 1, vortex: 2, single: 3, saddle: 4 };
export const FIELD_GLSL = `
uniform int uPreset; uniform float uStrength; uniform int uStrokes; uniform vec4 uC[${MAX_STROKES}]; uniform vec4 uT[${MAX_STROKES}];
vec3 presetField(vec3 p){
  float x = p.x, y = p.y, z = p.z;
  if (uPreset == 1) return vec3(-z * x, -z * y, 1.0 - z * z);
  if (uPreset == 2) return vec3(-y, x, 0.0);
  if (uPreset == 3) { float s = 1.0 - z; return vec3(s - x * x, -x * y, -x * (z - 1.0)); }
  if (uPreset == 4) { float f = 2.0 * x * y; return vec3(y - f * x, x - f * y, -f * z); }
  return vec3(0.0);
}
vec3 field(vec3 p){
  vec3 v = presetField(p) * uStrength;
  for (int i = 0; i < ${MAX_STROKES}; i++) {
    if (i >= uStrokes) break;
    vec3 c = uC[i].xyz, t = uT[i].xyz; float cp = dot(c, p);
    if (cp < -0.95) continue;
    float w = exp(-2.0 * (1.0 - cp) / ${(SIGMA * SIGMA).toFixed(6)});
    v += w * (t - dot(p, t) / (1.0 + cp) * (c + p));
  }
  return v - dot(v, p) * p;
}`;

// Geodesic mesh: icosahedron subdivided `level` times, turned by a fixed generic rotation so that no vertex lies on the axes or
// the planes where the presets have their zeros. Faces are oriented outwards.
const meshes = new Map();
export function geodesic(level = 5) {
  if (meshes.has(level)) return meshes.get(level);
  const g = (1 + Math.sqrt(5)) / 2;
  let V = [[-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0], [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g], [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1]].map(unit);
  let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let l = 0; l < level; l++) {
    const mid = new Map(), m = (a, b) => { const k = a < b ? a * 1e6 + b : b * 1e6 + a; if (!mid.has(k)) { mid.set(k, V.length); V.push(unit([(V[a][0] + V[b][0]) / 2, (V[a][1] + V[b][1]) / 2, (V[a][2] + V[b][2]) / 2])); } return mid.get(k); };
    F = F.flatMap(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]; });
  }
  const R = rotation([0.3711, -0.5236, 0.7663], 0.6173);
  V = V.map((v) => apply(R, v));
  F = F.map(([a, b, c]) => { const n = cross(sub(V[b], V[a]), sub(V[c], V[a])); return dot(n, V[a]) > 0 ? [a, b, c] : [a, c, b]; });
  const out = { V, F }; meshes.set(level, out); return out;
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
function rotation(axis, ang) { const [x, y, z] = unit(axis), c = Math.cos(ang), s = Math.sin(ang), C = 1 - c; return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]]; }
const apply = (R, v) => R.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const frame = (m) => { const a = Math.abs(m[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0], e1 = unit(sub(a, m.map((x) => x * dot(a, m)))); return [e1, cross(m, e1)]; };
const wrap = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
// winding number of the field around the oriented triangle a, b, c (vectors given), in the tangent plane at the centroid
export function winding(va, vb, vc, m) {
  const [e1, e2] = frame(m), ang = (v) => Math.atan2(dot(v, e2), dot(v, e1));
  const t = [ang(va), ang(vb), ang(vc)], s = wrap(t[1] - t[0]) + wrap(t[2] - t[1]) + wrap(t[0] - t[2]);
  return Math.round(s / (2 * Math.PI));
}
// Newton's method on the sphere near q: p(x, y) = unit(q + x e1 + y e2), F = (v·e1, v·e2)
export function refine(state, q, iterations = 30) {
  let p = unit(q);
  for (let it = 0; it < iterations; it++) {
    const [e1, e2] = frame(p), F = (x, y) => { const r = unit([p[0] + x * e1[0] + y * e2[0], p[1] + x * e1[1] + y * e2[1], p[2] + x * e1[2] + y * e2[2]]), v = field(state, r); return [dot(v, e1), dot(v, e2)]; };
    const f = F(0, 0), h = 1e-7, fx = F(h, 0), fy = F(0, h), a = (fx[0] - f[0]) / h, b = (fy[0] - f[0]) / h, c = (fx[1] - f[1]) / h, d = (fy[1] - f[1]) / h, det = a * d - b * c;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-300) break;
    let dx = -(d * f[0] - b * f[1]) / det, dy = -(-c * f[0] + a * f[1]) / det; const st = Math.hypot(dx, dy);
    if (st > 0.05) { dx *= 0.05 / st; dy *= 0.05 / st; }
    p = unit([p[0] + dx * e1[0] + dy * e2[0], p[1] + dx * e1[1] + dy * e2[1], p[2] + dx * e1[2] + dy * e2[2]]);
    if (st < 1e-15) break;
  }
  const v = field(state, p); return { p, residual: Math.hypot(v[0], v[1], v[2]) };
}
// All zeros with their indices. Returns {zeros: [{p, index, residual}], sum, vmax, degenerate}; degenerate when the field is zero
// at a mesh vertex (for instance the zero field, which vanishes everywhere).
export function zeros(state, level = 5) {
  const { V, F } = geodesic(level), vs = V.map((p) => field(state, p)), mags = vs.map((v) => Math.hypot(v[0], v[1], v[2]));
  const vmax = Math.max(...mags);
  if (!(vmax > 1e-9) || mags.some((m) => m < 1e-12 * Math.max(1, vmax))) return { zeros: [], sum: null, vmax, degenerate: true };
  const found = []; let sum = 0;
  for (const [a, b, c] of F) {
    const m = unit([V[a][0] + V[b][0] + V[c][0], V[a][1] + V[b][1] + V[c][1], V[a][2] + V[b][2] + V[c][2]]), w = winding(vs[a], vs[b], vs[c], m);
    if (!w) continue; sum += w;
    const r = refine(state, m), near = found.find((z) => dot(z.p, r.p) > 1 - 1e-10);
    if (near) near.index += w; else found.push({ p: r.p, index: w, residual: r.residual });
  }
  return { zeros: found.filter((z) => z.index !== 0 || z.residual < 1e-9), sum, vmax, degenerate: false };
}
// Hair roots: a Fibonacci lattice on the sphere (even spacing, no poles in the lattice), each point moved by up to `jitter`
// of the spacing (seeded), so that the regular lattice does not show as a moire pattern. Roots are only where hairs grow.
export function fibonacci(n, jitter = 0, seed = 7) {
  const out = new Float32Array(n * 3), g = Math.PI * (3 - Math.sqrt(5)), h = jitter * Math.sqrt(4 * Math.PI / n);
  let s = seed; const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647 - 0.5;
  for (let i = 0; i < n; i++) {
    const z = 1 - (2 * i + 1) / n, r = Math.sqrt(1 - z * z), a = i * g;
    const p = unit([r * Math.cos(a) + h * rnd(), r * Math.sin(a) + h * rnd(), z + h * rnd()]);
    out[3 * i] = p[0]; out[3 * i + 1] = p[1]; out[3 * i + 2] = p[2];
  }
  return out;
}
// One hair: SEGMENTS + 1 points following the field line from the root, of length proportional to |v| at the root (no
// normalisation: hairs vanish at a zero, and continuity stays visible). Written in GLSL by the exhibit (same steps).
export const SEGMENTS = 11;
export function hair(state, root, length, vmax, lift = 0.05) {
  let p = root; const v0 = field(state, root), L = length * Math.hypot(...v0) / vmax, pts = [];
  for (let k = 0; k <= SEGMENTS; k++) {
    const s = k / SEGMENTS, r = 1 + lift * L * (1 - (1 - s) ** 2) / Math.max(length, 1e-9);
    pts.push([p[0] * r, p[1] * r, p[2] * r]);
    const v = field(state, p), n = Math.hypot(...v); if (n < 1e-12) continue;
    p = unit([p[0] + v[0] / n * L / SEGMENTS, p[1] + v[1] / n * L / SEGMENTS, p[2] + v[2] / n * L / SEGMENTS]);
  }
  return pts;
}
