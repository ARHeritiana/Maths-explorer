// Rigid-body dynamics of the smooth Gömböc rolling without slipping on a horizontal plane (pure, tested in tests/gomboc.test.mjs).
//
// Unit mass, gravity g, the body frame has its origin at the centre of mass G. The surface is smooth, so no polyhedral
// approximation is used (any facetted approximation of a body that deviates from the sphere by 2·10⁻⁵ would have many
// stable faces of its own). Contact is exact: with ν the outward normal at the contact point, in the body frame,
//     ν = Rᵀ(−ẑ),   contact point r(ν) (body frame),   ρ = R r  (from G to the contact point, world frame),
//     height of G above the plane  p_z = H(ν) = r·ν   (support function; its critical points are the equilibria).
// No slipping at the contact: v + ω × ρ = 0. Differentiating it and using ρ' = ω × ρ + R (∂r/∂ν) ν',  ν' = −(Rᵀω) × ν,
// then Newton's law for G and Euler's law about G (the contact force F acts at ρ) leave one linear system for ω':
//     ( I_w + |ρ|² 1 − ρ ρᵀ ) ω' = −ω × (I_w ω) − ρ × (ω × ρ') + g ρ × ẑ + τ,      I_w = R I Rᵀ,
// and the contact force follows from F = −ω' × ρ − ω × ρ' + g ẑ. The state is the orientation q, the angular velocity ω
// and the position c of the contact point on the plane. With no dissipation the energy
//     E = ½ |v|² + ½ ωᵀ I_w ω + g H(ν)
// is conserved (tested). Dissipation is a rolling-resistance couple τ = −κ N ω while in contact (N the normal force): it
// removes energy only. The no-slip assumption needs |F_tangential| ≤ μ N; the ratio is reported, never hidden.
import { contact, contactJacobian, massProperties, D, C } from './gomboc-body.js';

export const GRAVITY = 9.81;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const mv = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const mvT = (m, v) => [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
const mm = (a, b) => { const o = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[3 * i + j] = a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]; return o; };
const tr = (m) => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
function solve3(m, b) {
  const [a, bb, c, d, e, f, g, h, i] = m, A = e * i - f * h, B = c * h - bb * i, Cc = bb * f - c * e, det = a * A + d * B + g * Cc;
  return [(A * b[0] + B * b[1] + Cc * b[2]) / det, ((f * g - d * i) * b[0] + (a * i - c * g) * b[1] + (c * d - a * f) * b[2]) / det, ((d * h - e * g) * b[0] + (bb * g - a * h) * b[1] + (a * e - bb * d) * b[2]) / det];
}
export const qmul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
export const qaxis = (axis, angle) => { const l = Math.hypot(...axis) || 1, s = Math.sin(angle / 2) / l; return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s]; };
export function rotation(q) { const [w, x, y, z] = q; return [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]; }
// The rotation taking the unit vector a onto the unit vector b.
export function qbetween(a, b) {
  const d = dot(a, b);
  if (d < -1 + 1e-12) return qaxis(Math.abs(a[0]) < 0.9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0]), Math.PI);
  const q = [1 + d, ...cross(a, b)], n = Math.hypot(...q); return q.map((x) => x / n);
}
const normalize = (q) => { const n = Math.hypot(...q); return q.map((x) => x / n); };

let props = null;
export function body() {
  if (!props) { const m = massProperties(C, D, 160, 256); props = { I: m.inertia.map((x) => x / m.volume), mass: m.volume }; }
  return props;
}

export const rotationApply = (R, v) => mv(R, v);
const ZHAT = [0, 0, 1];

// Everything the dynamics needs at a state, and the rates of change. `kappa` is the rolling-resistance coefficient.
export function evaluate(s, kappa = 0) {
  const R = rotation(s.q), Ib = body().I, nu = mvT(R, [0, 0, -1]), hit = contact(nu, s.w), J = contactJacobian(nu, hit);
  const rho = mv(R, hit.r), omb = mvT(R, s.om), nudot = mul(cross(omb, nu), -1), rhodot = add(cross(s.om, rho), mv(R, mv(J, nudot)));
  const Iw = mm(mm(R, Ib), tr(R)), r2 = dot(rho, rho), M = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[3 * i + j] = Iw[3 * i + j] + (i === j ? r2 : 0) - rho[i] * rho[j];
  const gyro = cross(s.om, mv(Iw, s.om)), rhs0 = sub(sub(mul(cross(rho, ZHAT), GRAVITY), gyro), cross(rho, cross(s.om, rhodot)));
  const force = (omd) => add(sub(mul(cross(omd, rho), -1), cross(s.om, rhodot)), mul(ZHAT, GRAVITY));
  let omd = solve3(M, rhs0), F = force(omd);
  if (kappa > 0) { const N = Math.max(0, F[2]); omd = solve3(M, sub(rhs0, mul(s.om, kappa * N))); F = force(omd); }
  const qdot = qmul([0, ...s.om], s.q).map((x) => x / 2), cdot = mv(R, mv(J, nudot));
  return { R, nu, hit, rho, rhodot, Iw, omd, F, qdot, cdot };
}
// Where G is, its velocity, and the energy (kinetic + gravitational, unit mass).
export function derived(s) {
  const R = rotation(s.q), nu = mvT(R, [0, 0, -1]), hit = contact(nu, s.w), rho = mv(R, hit.r), Iw = mm(mm(R, body().I), tr(R)), v = mul(cross(s.om, rho), -1);
  return { p: [s.c[0] - rho[0], s.c[1] - rho[1], hit.H], v, rho, hit, nu, energy: dot(v, v) / 2 + dot(s.om, mv(Iw, s.om)) / 2 + GRAVITY * hit.H };
}

export function advance(s, h, kappa = 0) {
  const at = (base, k, f) => ({ q: normalize(base.q.map((x, i) => x + f * k.qdot[i])), om: add(base.om, mul(k.omd, f)), c: [base.c[0] + f * k.cdot[0], base.c[1] + f * k.cdot[1]], w: base.w, t: base.t });
  const k1 = evaluate(s, kappa), s2 = at(s, k1, h / 2); s2.w = k1.hit.w;
  const k2 = evaluate(s2, kappa), s3 = at(s, k2, h / 2); s3.w = k2.hit.w;
  const k3 = evaluate(s3, kappa), s4 = at(s, k3, h); s4.w = k3.hit.w;
  const k4 = evaluate(s4, kappa);
  const q = normalize(s.q.map((x, i) => x + (h / 6) * (k1.qdot[i] + 2 * k2.qdot[i] + 2 * k3.qdot[i] + k4.qdot[i])));
  const om = [0, 1, 2].map((i) => s.om[i] + (h / 6) * (k1.omd[i] + 2 * k2.omd[i] + 2 * k3.omd[i] + k4.omd[i]));
  const c = [0, 1].map((i) => s.c[i] + (h / 6) * (k1.cdot[i] + 2 * k2.cdot[i] + 2 * k3.cdot[i] + k4.cdot[i]));
  const out = { q, om, c, w: k4.hit.w, t: s.t + h };
  return out;
}
export function simulate(s, seconds, kappa = 0, dt = 0.05) {
  const n = Math.max(1, Math.ceil(seconds / dt)), h = seconds / n; let out = s;
  for (let i = 0; i < n; i++) out = advance(out, h, kappa);
  return out;
}

// Starting states. `colatitude`: the angle at G between the contact direction and the stable pole direction (south pole of
// the body: φ = −π/2); 0 is the stable equilibrium, π the unstable one (north pole down). `azimuth` chooses the side.
export function start({ colatitude = 0, azimuth = 0, spin = [0, 0, 0] } = {}) {
  const nu = [Math.sin(colatitude) * Math.cos(azimuth), Math.sin(colatitude) * Math.sin(azimuth), -Math.cos(colatitude)];
  const q = qbetween(nu, [0, 0, -1]), s = { q, om: spin.slice(), c: [0, 0], w: nu.slice(), t: 0 };
  return s;
}
// Tilt the resting body about horizontal world axes, keeping the contact point where it is, and stop it.
export function tilt(s, ax, ay) { return { ...s, q: normalize(qmul(qaxis([1, 0, 0], ax), qmul(qaxis([0, 1, 0], ay), s.q))), om: [0, 0, 0] }; }
// Give the body an angular velocity (a push).
export function spin(s, dom) { return { ...s, om: add(s.om, dom) }; }
// Diagnostics: normal force, tangential/normal ratio (needed friction coefficient for the no-slip assumption), contact
// angle to the stable pole, height of G above the plane in units of d.
export function diagnostics(s, kappa = 0) {
  const e = evaluate(s, kappa), d = derived(s), tan = Math.hypot(e.F[0], e.F[1]), N = e.F[2];
  const angleStable = Math.acos(Math.max(-1, Math.min(1, -e.hit.w[2])));
  return { N, slip: N > 0 ? tan / N : Infinity, angleStable, heightOverD: (d.hit.H - 1) / D, energy: d.energy, p: d.p, hit: e.hit };
}
