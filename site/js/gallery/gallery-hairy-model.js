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

// The contrast: the torus T² (tube of radius r = 0.42 around a circle of radius R = 1 in the plane z = 0), of characteristic
// χ(T²) = 0. A point is q = (u, v): u turns around the hole, v around the tube. The torus has a global orthonormal tangent frame
// (e_u, e_v), so a field is two components (a, b) in that frame, everywhere at once: a constant (a, b) never vanishes, the torus
// can be combed. A comb stroke at c with components t adds w·t, w = exp(-2d²/σ²), d the chord distance in each direction (smooth
// and periodic). Zeros come from exact winding numbers of (a, b) around the cells of a grid in (u, v), then Newton; the indices
// add up to 0. Same formula in GLSL (TORUS_GLSL).
export const TORUS = { R: 1, r: 0.42 };
export const TORUS_PRESETS = ['along', 'spiral', 'height', 'none'];
export const TORUS_INDEX = { none: 0, along: 1, spiral: 2, height: 3 };
// along = e_u (around the hole), spiral = 0.8 e_u + 0.6 e_v, height = gradient of x (maximum and minimum of index +1, two saddles -1)
export function torusPreset(kind, [u, v]) {
  if (kind === 'along') return [1, 0];
  if (kind === 'spiral') return [0.8, 0.6];
  if (kind === 'height') return [-Math.sin(u), -Math.sin(v) * Math.cos(u)];
  return [0, 0];
}
export function torusField(state, q) {
  const b = torusPreset(state.preset, q), s = state.strength ?? 1, f = [b[0] * s, b[1] * s];
  for (const { c, t } of state.strokes || []) {
    const hu = 2 * Math.sin((q[0] - c[0]) / 2) * (TORUS.R + TORUS.r * Math.cos(c[1])), hv = 2 * Math.sin((q[1] - c[1]) / 2) * TORUS.r;
    const w = Math.exp(-2 * (hu * hu + hv * hv) / (SIGMA * SIGMA)); f[0] += w * t[0]; f[1] += w * t[1];
  }
  return f;
}
// point of the torus pushed out by h along the normal (the tube radius becomes r + h), and the unit normal
export const torusPoint = ([u, v], h = 0) => { const c = TORUS.R + (TORUS.r + h) * Math.cos(v); return [c * Math.cos(u), c * Math.sin(u), (TORUS.r + h) * Math.sin(v)]; };
export const torusNormal = ([u, v]) => [Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u), Math.sin(v)];
// the field as a 3D vector at q (for drawing and tests): a e_u + b e_v
export function torusVector(state, q) { const [a, b] = torusField(state, q), [u, v] = q; return [-a * Math.sin(u) - b * Math.sin(v) * Math.cos(u), a * Math.cos(u) - b * Math.sin(v) * Math.sin(u), b * Math.cos(v)]; }
// (u, v) of a point near the torus
export const torusParam = ([x, y, z]) => [Math.atan2(y, x), Math.atan2(z, Math.hypot(x, y) - TORUS.R)];
export const TORUS_GLSL = `
uniform int uPreset; uniform float uStrength; uniform int uStrokes; uniform vec4 uC[${MAX_STROKES}]; uniform vec4 uT[${MAX_STROKES}];
const float TR = ${TORUS.R.toFixed(6)}, Tr = ${TORUS.r.toFixed(6)};
vec2 presetField(vec2 q){
  if (uPreset == 1) return vec2(1.0, 0.0);
  if (uPreset == 2) return vec2(0.8, 0.6);
  if (uPreset == 3) return vec2(-sin(q.x), -sin(q.y) * cos(q.x));
  return vec2(0.0);
}
vec2 field2(vec2 q){
  vec2 f = presetField(q) * uStrength;
  for (int i = 0; i < ${MAX_STROKES}; i++) {
    if (i >= uStrokes) break;
    vec2 c = uC[i].xy, h = 2.0 * sin(0.5 * (q - c)) * vec2(TR + Tr * cos(c.y), Tr);
    f += exp(-2.0 * dot(h, h) / ${(SIGMA * SIGMA).toFixed(6)}) * uT[i].xy;
  }
  return f;
}
vec3 tpos(vec2 q, float h){ float c = TR + (Tr + h) * cos(q.y); return vec3(c * cos(q.x), c * sin(q.x), (Tr + h) * sin(q.y)); }
vec3 tnormal(vec2 q){ return vec3(cos(q.y) * cos(q.x), cos(q.y) * sin(q.x), sin(q.y)); }`;
const wrapP = (a) => a - 2 * Math.PI * Math.floor(a / (2 * Math.PI));
// Newton's method in (u, v) on the components (a, b)
function refineTorus(state, q0, iterations = 30) {
  let q = q0.slice();
  for (let it = 0; it < iterations; it++) {
    const f = torusField(state, q), h = 1e-7, fu = torusField(state, [q[0] + h, q[1]]), fv = torusField(state, [q[0], q[1] + h]);
    const a = (fu[0] - f[0]) / h, b = (fv[0] - f[0]) / h, c = (fu[1] - f[1]) / h, d = (fv[1] - f[1]) / h, det = a * d - b * c;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-300) break;
    let du = -(d * f[0] - b * f[1]) / det, dv = -(-c * f[0] + a * f[1]) / det; const st = Math.hypot(du, dv);
    if (st > 0.05) { du *= 0.05 / st; dv *= 0.05 / st; }
    q = [q[0] + du, q[1] + dv];
    if (st < 1e-15) break;
  }
  q = [wrapP(q[0]), wrapP(q[1])]; const f = torusField(state, q);
  return { q, residual: Math.hypot(f[0], f[1]) };
}
// All zeros on the torus, same output as zeros() plus q. Grid of 8·2^level by 3·2^level cells, shifted off the lines u, v ∈ {0, π}.
export function torusZeros(state, level = 5) {
  const nu = 8 * 2 ** level, nv = 3 * 2 ** level, ou = 0.01234, ov = 0.02171, val = [], mags = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const f = torusField(state, [ou + 2 * Math.PI * i / nu, ov + 2 * Math.PI * j / nv]); val.push(Math.atan2(f[1], f[0])); mags.push(Math.hypot(f[0], f[1])); }
  const vmax = Math.max(...mags);
  if (!(vmax > 1e-9) || mags.some((m) => m < 1e-12 * Math.max(1, vmax))) return { zeros: [], sum: null, vmax, degenerate: true };
  const at = (i, j) => val[(j % nv) * nu + (i % nu)], found = []; let sum = 0;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const t = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
    const w = Math.round((wrap(t[1] - t[0]) + wrap(t[2] - t[1]) + wrap(t[3] - t[2]) + wrap(t[0] - t[3])) / (2 * Math.PI));
    if (!w) continue; sum += w;
    const r = refineTorus(state, [ou + 2 * Math.PI * (i + 0.5) / nu, ov + 2 * Math.PI * (j + 0.5) / nv]);
    const near = found.find((z) => Math.abs(wrap(z.q[0] - r.q[0])) + Math.abs(wrap(z.q[1] - r.q[1])) < 1e-8);
    if (near) near.index += w; else found.push({ q: r.q, p: torusPoint(r.q), index: w, residual: r.residual });
  }
  return { zeros: found.filter((z) => z.index !== 0 || z.residual < 1e-9), sum, vmax, degenerate: false };
}
// Hair roots on the torus, even in area (density ∝ R + r cos v): v by the inverse of the area fraction, u by the golden ratio,
// then a seeded jitter. Returns (u, v, 0) triples.
export function torusRoots(n, jitter = 0, seed = 7) {
  const out = new Float32Array(n * 3), { R, r } = TORUS, g = (Math.sqrt(5) - 1) / 2, h = jitter * Math.sqrt(4 * Math.PI * Math.PI * R * r / n);
  let s = seed; const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647 - 0.5;
  for (let i = 0; i < n; i++) {
    const target = 2 * Math.PI * R * (i + 0.5) / n; let v = target / R;
    for (let k = 0; k < 8; k++) v -= (R * v + r * Math.sin(v) - target) / (R + r * Math.cos(v));
    const u = 2 * Math.PI * ((i * g) % 1);
    out[3 * i] = u + h * rnd() / (R + r * Math.cos(v)); out[3 * i + 1] = v + h * rnd() / r;
  }
  return out;
}
// one hair on the torus (same steps as the shader of the exhibit)
export function torusHair(state, q0, length, vmax, lift = 0.05) {
  let q = q0.slice(); const f0 = torusField(state, q), L = length * Math.hypot(...f0) / vmax, pts = [];
  for (let k = 0; k <= SEGMENTS; k++) {
    const s = k / SEGMENTS; pts.push(torusPoint(q, lift * L * (1 - (1 - s) ** 2) / Math.max(length, 1e-9)));
    const f = torusField(state, q), n = Math.hypot(f[0], f[1]); if (n < 1e-12) continue;
    q = [q[0] + f[0] / n * L / SEGMENTS / (TORUS.R + TORUS.r * Math.cos(q[1])), q[1] + f[1] / n * L / SEGMENTS / TORUS.r];
  }
  return pts;
}
