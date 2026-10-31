// The smooth Gömböc of Várkonyi and Domokos: a homogeneous, convex body with one stable and one unstable equilibrium.
// Pure functions (no DOM), tested in tests/gomboc.test.mjs.
//
// Source: P. L. Várkonyi and G. Domokos, "Static equilibria of rigid bodies: dice, pebbles and the Poincaré–Hopf theorem",
// J. Nonlinear Sci. 16 (2006) 255–281, section 3, equations (1)–(8). In spherical coordinates (θ longitude, φ latitude,
// the "poles" φ = ±π/2 being the equilibria), the distance from the centre of gravity is
//     R(θ, φ) = 1 + d · ΔR(θ, φ),    ΔR = a·f1 + (1 − a)·f2,
//     f(φ) = π [ (e^(φ/(cπ) + 1/(2c)) − 1) / (e^(1/c) − 1) − 1/2 ],   f1 = sin f(φ),   f2(φ) = −f1(−φ),
//     a = cos²θ (1 − f1²) / ( cos²θ (1 − f1²) + sin²θ (1 − f2²) ).
// NOTE on the source: the second form of equation (7), printed with cos²f(φ)/cos²f(−φ), is the inverse of the first form.
// The first form is the one that agrees with the limit (22), with figures 6 and 9, and with the value c ≈ 0.275 the authors
// report; it is the one implemented (the other form has no root c: the centre of gravity can then never be brought to O).
//
// The two parameters: d (the flatness) must be tiny for convexity (the paper finds d < 5·10⁻⁵), and c is then fixed by the
// condition that the centre of gravity of the homogeneous body is the origin. So the body is a sphere to within 2·10⁻⁵ of
// its radius: it is NOT a drawing problem, it is the mathematics. Whatever draws it larger must say so.
//
// The equilibria of a convex body resting on a plane are the critical points of R (stable: minima, unstable: maxima,
// saddles otherwise). Here these are the south pole S (φ = −π/2, ΔR = −1, minimum: stable) and the north pole N (φ = +π/2,
// ΔR = +1, maximum: unstable), and no others (Lemma A.1, re-checked numerically in the tests).

export const D = 2e-5;                 // flatness d (the paper's bound for convexity is about 5·10⁻⁵)
export const C = 0.27823889839136;     // c solving "centre of gravity = origin" for D (see solveC, tests/gomboc.test.mjs)
const PI = Math.PI, HALF = PI / 2;

// E(φ) = (e^x − 1)/(e^(1/c) − 1) with x = φ/(cπ) + 1/(2c): so that f = π (E − 1/2). Both E and 1 − E are returned, each
// without cancellation, so that cos f = sin(πE) stays accurate next to the poles.
function expo(phi, c) {
  const K = 1 / c, x = phi / (c * PI) + K / 2, den = Math.expm1(K);
  const e = Math.expm1(x) / den, oneMinus = Math.exp(x) * Math.expm1(K - x) / den, slope = Math.exp(x) / (c * PI * den);
  return { e, oneMinus, slope };
}
// P(φ) = cos f(φ) = sin(πE) and its derivative; F1(φ) = sin f(φ) = −cos(πE) and its derivative.
function half(phi, c) {
  const { e, oneMinus, slope } = expo(phi, c), m = e < 0.5 ? e : oneMinus;
  return { P: Math.sin(PI * m), dP: PI * slope * Math.cos(PI * e), f: -Math.cos(PI * e), df: PI * slope * Math.sin(PI * e) };
}

// ΔR and its partial derivatives (∂/∂θ, ∂/∂φ) at (θ, φ), analytic. At the poles the value is ±1 and the gradient is 0.
export function deltaR(theta, phi, c = C) {
  if (phi >= HALF - 1e-13) return { v: 1, dt: 0, dp: 0 };
  if (phi <= -HALF + 1e-13) return { v: -1, dt: 0, dp: 0 };
  const p = half(phi, c), m = half(-phi, c);          // m: the same functions at −φ
  const f1 = p.f, f1p = p.df;                          // f1(φ) = sin f(φ)
  const f2 = -m.f, f2p = m.df;                         // f2(φ) = −f1(−φ);  f2' = f1'(−φ)
  const ct = Math.cos(theta), st = Math.sin(theta);
  const A = ct * ct * p.P * p.P, B = st * st * m.P * m.P, S = A + B;
  if (!(S > 1e-300)) return { v: 0, dt: 0, dp: 0 };
  const a = A / S, S2 = S * S;
  const At = -2 * st * ct * p.P * p.P, Bt = 2 * st * ct * m.P * m.P;
  const Ap = 2 * ct * ct * p.P * p.dP, Bp = -2 * st * st * m.P * m.dP;
  const at = (At * B - A * Bt) / S2, ap = (Ap * B - A * Bp) / S2, df = f1 - f2;
  return { v: f2 + a * df, dt: at * df, dp: ap * df + a * f1p + (1 - a) * f2p };
}

// The unit direction of (θ, φ), and the tangent frame.
export const direction = (theta, phi) => [Math.cos(phi) * Math.cos(theta), Math.cos(phi) * Math.sin(theta), Math.sin(phi)];
export function angles(w) { return { theta: Math.atan2(w[1], w[0]), phi: Math.asin(Math.max(-1, Math.min(1, w[2]))) }; }

// ΔR and the gradient of ΔR along the unit sphere (a tangent 3-vector) at a unit direction w.
export function deltaAt(w, c = C) {
  const { theta, phi } = angles(w), r = deltaR(theta, phi, c), cp = Math.cos(phi), sp = Math.sin(phi), ct = Math.cos(theta), st = Math.sin(theta);
  if (cp < 1e-9) return { v: r.v, g: [0, 0, 0] };
  const kt = r.dt / cp;
  return { v: r.v, g: [-r.dp * sp * ct - kt * st, -r.dp * sp * st + kt * ct, r.dp * cp] };
}

// The radius and the surface point at a unit direction w, for the real body (relief = 1) or a body whose relief d·ΔR is
// multiplied by `relief` (a drawing aid only, see the page).
export function radius(w, relief = 1) { return 1 + relief * D * deltaAt(w).v; }
export function surface(w, relief = 1) { const k = radius(w, relief); return [w[0] * k, w[1] * k, w[2] * k]; }

// ---------------------------------------------------------------------------------------------------------------------
// Integrals over the body (density 1, so mass = volume): Gauss–Legendre in φ, trapezoid in θ (periodic).
function gaussLegendre(n) {
  const x = new Float64Array(n), w = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let z = Math.cos(PI * (i + 0.75) / (n + 0.5)), pp = 0;
    for (let it = 0; it < 100; it++) {
      let p1 = 1, p2 = 0;
      for (let j = 1; j <= n; j++) { const p3 = p2; p2 = p1; p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j; }
      pp = n * (z * p1 - p2) / (z * z - 1);
      const dz = p1 / pp; z -= dz; if (Math.abs(dz) < 1e-15) break;
    }
    x[i] = z; w[i] = 2 / ((1 - z * z) * pp * pp);
  }
  return { x, w };
}
const GL = new Map();
function rule(n) { if (!GL.has(n)) GL.set(n, gaussLegendre(n)); return GL.get(n); }

// Mass properties for given c, d. Returns the volume, the centroid, and the inertia tensor about the origin, as a
// row-major 3×3 array (for the unit-density body; divide by the volume for unit mass).
export function massProperties(c = C, d = D, nPhi = 240, nTheta = 360) {
  const { x, w } = rule(nPhi);
  let V = 0, cx = 0, cy = 0, cz = 0;
  const I = new Float64Array(9);
  for (let i = 0; i < nPhi; i++) {
    const phi = HALF * x[i], wp = HALF * w[i] * Math.cos(phi), sp = Math.sin(phi), cp = Math.cos(phi);
    for (let j = 0; j < nTheta; j++) {
      const th = (2 * PI * j) / nTheta, r = 1 + d * deltaR(th, phi, c).v, r3 = r * r * r, r4 = r3 * r, r5 = r4 * r;
      const u = [cp * Math.cos(th), cp * Math.sin(th), sp], dw = wp * (2 * PI / nTheta);
      V += dw * r3 / 3;
      cx += dw * r4 / 4 * u[0]; cy += dw * r4 / 4 * u[1]; cz += dw * r4 / 4 * u[2];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) I[3 * a + b] += dw * (r5 / 5) * ((a === b ? 1 : 0) - u[a] * u[b]);
    }
  }
  return { volume: V, centroid: [cx / V, cy / V, cz / V], inertia: Array.from(I) };
}
// The height of the centroid above the origin, as a function of c (the root is C).
export const centroidZ = (c, d = D) => massProperties(c, d, 200, 256).centroid[2];
export function solveC(d = D, lo = 0.2, hi = 0.4) {
  let flo = centroidZ(lo, d);
  for (let it = 0; it < 60; it++) { const mid = (lo + hi) / 2, fm = centroidZ(mid, d); if (fm * flo > 0) { lo = mid; flo = fm; } else hi = mid; }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------------------------------------------------
// Contact of the body with a horizontal plane. ν is the outward unit normal of the body at the contact point, in the body
// frame. The contact point is the surface point whose normal is ν; for the radial graph ρ(ω) the normal is ∝ ω − ∇ρ/ρ, so
// ω solves the fixed-point equation  ω = normalize(ν + g/√(1+|g|²)),  g = ∇ρ(ω)/ρ(ω)  (a contraction while the body is
// convex and d is small). Returns the contact point r(ν) (from the centre of gravity), the height H(ν) = r·ν of the centre
// of gravity above the plane (the support function: its critical points are the equilibria) and the direction ω.
export function contact(nu, guess = null, c = C) {
  let w = guess ? guess.slice() : nu.slice();
  for (let it = 0; it < 80; it++) {
    const { v, g } = deltaAt(w, c), k = 1 + D * v, gg = [D * g[0] / k, D * g[1] / k, D * g[2] / k], s = Math.sqrt(1 + gg[0] ** 2 + gg[1] ** 2 + gg[2] ** 2);
    let n = [nu[0] + gg[0] / s, nu[1] + gg[1] / s, nu[2] + gg[2] / s]; const l = Math.hypot(...n); n = [n[0] / l, n[1] / l, n[2] / l];
    const step = Math.hypot(n[0] - w[0], n[1] - w[1], n[2] - w[2]); w = n;
    if (step < 1e-15) break;
  }
  const k = radius(w), r = [w[0] * k, w[1] * k, w[2] * k];
  return { w, r, H: r[0] * nu[0] + r[1] * nu[1] + r[2] * nu[2] };
}
// The derivative of the contact point with respect to ν (a 3×3 matrix, row-major; zero along ν). It is the Hessian of the
// support function, whose eigenvalues are the principal radii of curvature of the body at the contact point.
export function contactJacobian(nu, hit, c = C, h = 1e-6) {
  const e1 = Math.abs(nu[2]) < 0.9 ? [-nu[1], nu[0], 0] : [0, -nu[2], nu[1]], l1 = Math.hypot(...e1), t1 = e1.map((x) => x / l1);
  const t2 = [nu[1] * t1[2] - nu[2] * t1[1], nu[2] * t1[0] - nu[0] * t1[2], nu[0] * t1[1] - nu[1] * t1[0]];
  const col = (t) => {
    const up = [nu[0] + h * t[0], nu[1] + h * t[1], nu[2] + h * t[2]], dn = [nu[0] - h * t[0], nu[1] - h * t[1], nu[2] - h * t[2]];
    const lu = Math.hypot(...up), ld = Math.hypot(...dn), a = contact(up.map((x) => x / lu), hit.w, c).r, b = contact(dn.map((x) => x / ld), hit.w, c).r;
    return [(a[0] - b[0]) / (2 * h), (a[1] - b[1]) / (2 * h), (a[2] - b[2]) / (2 * h)];
  };
  const a = col(t1), b = col(t2), J = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) J[3 * i + j] = a[i] * t1[j] + b[i] * t2[j];
  return J;
}

// ---------------------------------------------------------------------------------------------------------------------
// Display meshes. A latitude–longitude grid with one vertex at each pole. Per vertex: the unit direction, ΔR and the
// gradient of ΔR on the sphere; a renderer places the vertex at (1 + relief·d·ΔR)·direction and shades it with the normal
// ∝ direction − relief·d·∇ΔR/(1 + relief·d·ΔR), exactly the normal of the radial graph.
export function buildMesh(nLon = 192, nLat = 96) {
  const rows = nLat - 1, count = 2 + rows * (nLon + 1);       // rows of latitude between the poles, seam column duplicated
  const dir = new Float32Array(count * 3), delta = new Float32Array(count), grad = new Float32Array(count * 3);
  let n = 0;
  const put = (w, r) => { dir.set(w, 3 * n); delta[n] = r.v; grad.set(r.g, 3 * n); n++; };
  put([0, 0, -1], { v: -1, g: [0, 0, 0] });
  for (let i = 1; i <= rows; i++) {
    const phi = -HALF + (PI * i) / nLat;
    for (let j = 0; j <= nLon; j++) { const th = (2 * PI * j) / nLon, w = direction(th, phi); put(w, deltaAt(w)); }
  }
  put([0, 0, 1], { v: 1, g: [0, 0, 0] });
  const idx = [], ring = (i) => 1 + (i - 1) * (nLon + 1);
  for (let j = 0; j < nLon; j++) idx.push(0, ring(1) + j + 1, ring(1) + j);
  for (let i = 1; i < rows; i++) for (let j = 0; j < nLon; j++) {
    const a = ring(i) + j, b = ring(i) + j + 1, c2 = ring(i + 1) + j, d2 = ring(i + 1) + j + 1;
    idx.push(a, b, c2, b, d2, c2);
  }
  for (let j = 0; j < nLon; j++) idx.push(count - 1, ring(rows) + j, ring(rows) + j + 1);
  return { dir, delta, grad, indices: new Uint32Array(idx), vertices: count, nLon, nLat };
}
// A coarse wireframe for the small previews (home card, discovery card): vertices and quads, relief multiplied for legibility.
export function previewMesh(relief = 1500, nLon = 14, nLat = 9) {
  const vertices = [], quads = [];
  for (let i = 1; i < nLat; i++) for (let j = 0; j < nLon; j++) vertices.push(surface(direction((2 * PI * j) / nLon, -HALF + (PI * i) / nLat), relief));
  vertices.push(surface([0, 0, -1], relief), surface([0, 0, 1], relief));
  const south = vertices.length - 2, north = vertices.length - 1, at = (i, j) => (i - 1) * nLon + (j % nLon);
  for (let i = 1; i < nLat - 1; i++) for (let j = 0; j < nLon; j++) quads.push([at(i, j), at(i, j + 1), at(i + 1, j + 1), at(i + 1, j)]);
  for (let j = 0; j < nLon; j++) { quads.push([south, at(1, j + 1), at(1, j), south]); quads.push([north, at(nLat - 1, j), at(nLat - 1, j + 1), north]); }
  return { vertices, quads };
}
