// A convex body defined by its support function h(ν): the exact, smooth model of a visibly shaped mono-monostatic body.
// Pure functions (no DOM), tested in tests/gomboc.test.mjs.
//
// For a convex body with its centre of gravity at the origin, h(ν) is the height of the centre of gravity above a plane
// resting on the body with outward normal ν. The equilibria are the critical points of h on the unit sphere. The contact
// point is r(ν) = h ν + ∇ₛh and the radii of curvature are the eigenvalues of A = Hessₛh + h·1 (on the tangent plane), so
// the body is convex exactly when A is positive semidefinite, and A is also the derivative of the contact point with
// respect to ν. h is a polynomial in the coordinates x² and z of ν (the body has the two mirror planes x → −x and
// y → −y, and the poles are ν = (0, 0, ∓1)): h = Σ k·x^(2a)·z^c on the sphere. A polynomial extension makes the
// gradient and Hessian exact and regular at the poles, where the equilibria are.
const PI = Math.PI;

// terms: [[a, c, coefficient], …]. Returns the model.
export function makeSupportBody(terms, meta = {}) {
  const maxA = Math.max(...terms.map((t) => t[0])), maxC = Math.max(...terms.map((t) => t[1]));
  // value, Euclidean gradient (x and z only) and Hessian (xx, xz, zz) of the polynomial extension at a unit vector
  function poly(nu) {
    const x = nu[0], z = nu[2], x2 = x * x, px = [1], pz = [1];
    for (let a = 1; a <= maxA; a++) px[a] = px[a - 1] * x2;
    for (let c = 1; c <= maxC; c++) pz[c] = pz[c - 1] * z;
    let p = 0, gx = 0, gz = 0, hxx = 0, hxz = 0, hzz = 0;
    for (const [a, c, k] of terms) {
      const X = px[a], Z = pz[c];
      const dX = a > 0 ? 2 * a * x * px[a - 1] : 0, ddX = a > 0 ? 2 * a * (2 * a - 1) * Math.pow(x, 2 * a - 2) : 0;
      const dZ = c > 0 ? c * pz[c - 1] : 0, ddZ = c > 1 ? c * (c - 1) * pz[c - 2] : 0;
      p += k * X * Z; gx += k * dX * Z; gz += k * X * dZ; hxx += k * ddX * Z; hxz += k * dX * dZ; hzz += k * X * ddZ;
    }
    return { p, g: [gx, 0, gz], H: [hxx, 0, hxz, 0, 0, 0, hxz, 0, hzz] };
  }
  // h, tangent gradient, and A = Hessₛh + h·P as a 3×3 acting on tangent vectors
  function jet(nu) {
    const { p, g, H } = poly(nu), d = nu[0] * g[0] + nu[1] * g[1] + nu[2] * g[2];
    const P = [1 - nu[0] * nu[0], -nu[0] * nu[1], -nu[0] * nu[2], -nu[1] * nu[0], 1 - nu[1] * nu[1], -nu[1] * nu[2], -nu[2] * nu[0], -nu[2] * nu[1], 1 - nu[2] * nu[2]];
    const mm = (a, b) => { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[3 * i + j] = a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]; return o; };
    const PHP = mm(mm(P, H), P), A = PHP.map((v, i) => v + (p - d) * P[i]);
    const gs = [P[0] * g[0] + P[1] * g[1] + P[2] * g[2], P[3] * g[0] + P[4] * g[1] + P[5] * g[2], P[6] * g[0] + P[7] * g[1] + P[8] * g[2]];
    return { h: p, g: gs, A };
  }
  const model = {
    id: 'support', radial: false, ...meta,
    jet,
    // the contact for a requested outward normal ν (the `guess` argument is unused: the map ν → r is explicit)
    contact(nu) { const { h, g } = jet(nu); return { w: nu, r: [h * nu[0] + g[0], h * nu[1] + g[1], h * nu[2] + g[2]], H: h }; },
    contactJacobian(nu) { return jet(nu).A; },
    height: (nu) => jet(nu).h,
    surface(nu) { return model.contact(nu).r; },
  };
  // integrals over the body from the surface: dV = (1/3) h det A dσ, ∫x_i dV = (1/4)∮ x_i h det A dσ, ∫x_i x_j dV = (1/5)∮ x_i x_j h det A dσ
  model.massProperties = (nPhi = 64, nTheta = 96) => {
    const { x, w } = gaussNodes(nPhi);
    let V = 0; const m1 = [0, 0, 0], m2 = new Array(9).fill(0);
    for (let i = 0; i < nPhi; i++) {
      const phi = (PI / 2) * x[i], cp = Math.cos(phi), sp = Math.sin(phi), wp = (PI / 2) * w[i] * cp;
      for (let j = 0; j < nTheta; j++) {
        const th = (2 * PI * (j + 0.5)) / nTheta, ct = Math.cos(th), st = Math.sin(th), nu = [cp * ct, cp * st, sp];
        const ep = [-sp * ct, -sp * st, cp], et = [-st, ct, 0], { h, g, A } = jet(nu);
        const Ae = (u, v) => { let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += u[a] * A[3 * a + b] * v[b]; return s; };
        const det = Ae(ep, ep) * Ae(et, et) - Ae(ep, et) ** 2, r = [h * nu[0] + g[0], h * nu[1] + g[1], h * nu[2] + g[2]], dw = wp * ((2 * PI) / nTheta) * h * det;
        V += dw / 3; for (let a = 0; a < 3; a++) { m1[a] += dw * r[a] / 4; for (let b = 0; b < 3; b++) m2[3 * a + b] += dw * r[a] * r[b] / 5; }
      }
    }
    const tr = m2[0] + m2[4] + m2[8];
    return { volume: V, centroid: m1.map((v) => v / V), inertia: m2.map((v, i) => (i % 4 === 0 ? tr : 0) - v) };
  };
  // the extremes of h (the poles), the radii of the body (distance of the surface from the centre) along the poles
  model.poles = { S: [0, 0, -1], N: [0, 0, 1] };
  model.range = () => { const lo = model.height([0, 0, -1]), hi = model.height([0, 0, 1]); return { lo, hi, scale: (hi - lo) / 2, mean: (hi + lo) / 2 }; };
  { const { mean, scale } = model.range(); model.heightUnit = { offset: mean, scale }; model.tint = (nu) => (model.height(nu) - mean) / scale; }
  // display mesh: latitude-longitude grid of normals; position = contact point, normal = ν, tint = (h − mean)/scale in [−1, 1]
  model.buildMesh = (nLon = 192, nLat = 96) => {
    const rows = nLat - 1, count = 2 + rows * (nLon + 1), pos = new Float32Array(count * 3), nrm = new Float32Array(count * 3), tint = new Float32Array(count);
    let n = 0; const { mean, scale } = model.range();
    const put = (nu) => { const c = model.contact(nu); pos.set(c.r, 3 * n); nrm.set(nu, 3 * n); tint[n] = (c.H - mean) / scale; n++; };
    put([0, 0, -1]);
    for (let i = 1; i <= rows; i++) { const phi = -PI / 2 + (PI * i) / nLat; for (let j = 0; j <= nLon; j++) { const th = (2 * PI * j) / nLon; put([Math.cos(phi) * Math.cos(th), Math.cos(phi) * Math.sin(th), Math.sin(phi)]); } }
    put([0, 0, 1]);
    const idx = [], ring = (i) => 1 + (i - 1) * (nLon + 1);
    for (let j = 0; j < nLon; j++) idx.push(0, ring(1) + j + 1, ring(1) + j);
    for (let i = 1; i < rows; i++) for (let j = 0; j < nLon; j++) { const a = ring(i) + j, b = ring(i) + j + 1, c2 = ring(i + 1) + j, d2 = ring(i + 1) + j + 1; idx.push(a, b, c2, b, d2, c2); }
    for (let j = 0; j < nLon; j++) idx.push(count - 1, ring(rows) + j, ring(rows) + j + 1);
    return { explicit: true, pos, normals: nrm, dir: nrm, tint, indices: new Uint32Array(idx), vertices: count };
  };
  return model;
}

function gaussNodes(n) {
  const x = new Float64Array(n), w = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let z = Math.cos(PI * (i + 0.75) / (n + 0.5)), pp = 0;
    for (let it = 0; it < 100; it++) { let p1 = 1, p2 = 0; for (let j = 1; j <= n; j++) { const p3 = p2; p2 = p1; p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j; } pp = n * (z * p1 - p2) / (z * z - 1); const dz = p1 / pp; z -= dz; if (Math.abs(dz) < 1e-15) break; }
    x[i] = z; w[i] = 2 / ((1 - z * z) * pp * pp);
  }
  return { x, w };
}
