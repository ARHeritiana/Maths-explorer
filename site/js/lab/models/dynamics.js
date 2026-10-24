// Planar ideal double pendulum and unsoftened Newtonian gravity. Unitless quantities unless specified.
export class Collision extends Error {}
const add = (a, b, h) => a.map((x, i) => x + h * b[i]);
export function rk4(f, y, h) {
  const a = f(y), b = f(add(y, a, h / 2)), c = f(add(y, b, h / 2)), d = f(add(y, c, h));
  return y.map((x, i) => x + h / 6 * (a[i] + 2 * b[i] + 2 * c[i] + d[i]));
}
// Step-doubling RK4 with Richardson estimate; reject steps based on local truncation error, never animation speed.
export function integrate(f, initial, duration, { tolerance = 1e-8, maxStep = .02, minStep = 1e-8, maxSteps = 100000 } = {}) {
  let y = initial.slice(), t = 0, h = Math.min(maxStep, duration), accepted = 0, rejected = 0, maxError = 0;
  if (!Number.isFinite(duration) || !(duration >= 0) || !y.every(Number.isFinite) || !(tolerance > 0) || !(minStep > 0) || !(maxStep >= minStep) || !Number.isInteger(maxSteps) || maxSteps < 1) throw new RangeError("Finite state, duration and positive solver limits required");
  while (t < duration - 1e-14 && accepted + rejected < maxSteps) {
    h = Math.min(h, duration - t); let whole, half;
    try { whole = rk4(f, y, h); half = rk4(f, rk4(f, y, h / 2), h / 2); }
    catch (e) { if (!(e instanceof Collision)) throw e; if (h > minStep * 2) { h /= 2; rejected++; continue; } return { y, t, accepted, rejected, maxError, status: "near-collision" }; }
    const error = Math.max(...half.map((v, i) => Math.abs(v - whole[i]) / (15 * (1 + Math.max(Math.abs(v), Math.abs(y[i]))))));
    if (!Number.isFinite(error) || !half.every(Number.isFinite)) return { y, t, accepted, rejected, maxError, status: "nonfinite" };
    if (error > tolerance && h > minStep) { h = Math.max(minStep, h * Math.max(.1, .9 * (tolerance / error) ** .2)); rejected++; continue; }
    if (error > tolerance) return { y, t, accepted, rejected, maxError, status: "precision-limit" };
    y = half.map((v, i) => v + (v - whole[i]) / 15); t += h; accepted++; maxError = Math.max(maxError, error);
    h = Math.min(maxStep, h * Math.min(2, Math.max(.5, .9 * (tolerance / Math.max(error, 1e-30)) ** .2)));
  }
  return { y, t, accepted, rejected, maxError, status: t >= duration - 1e-14 ? "complete" : "step-limit" };
}
export function pendulumDerivative(p, y) {
  const [a, b, u, v] = y, { m1, m2, l1, l2, g, damping = 0 } = p, delta = a - b;
  const A = (m1 + m2) * l1 * l1, B = m2 * l1 * l2 * Math.cos(delta), D = m2 * l2 * l2;
  const q1 = -(m1 + m2) * g * l1 * Math.sin(a) - m2 * l1 * l2 * v * v * Math.sin(delta) - damping * u;
  const q2 = m2 * l1 * l2 * u * u * Math.sin(delta) - m2 * g * l2 * Math.sin(b) - damping * v, det = A * D - B * B;
  return [u, v, (D * q1 - B * q2) / det, (A * q2 - B * q1) / det];
}
export function pendulumPoints(p, [a, b]) { const first = [p.l1 * Math.sin(a), -p.l1 * Math.cos(a)]; return [first, [first[0] + p.l2 * Math.sin(b), first[1] - p.l2 * Math.cos(b)]]; }
export function pendulumEnergy(p, [a, b, u, v]) { return .5 * (p.m1 + p.m2) * p.l1 ** 2 * u ** 2 + .5 * p.m2 * p.l2 ** 2 * v ** 2 + p.m2 * p.l1 * p.l2 * u * v * Math.cos(a - b) - (p.m1 + p.m2) * p.g * p.l1 * Math.cos(a) - p.m2 * p.g * p.l2 * Math.cos(b); }
export function gravityDerivative(p, y) {
  const masses = p.masses, G = p.G ?? 1, stop = p.collision ?? .015, out = Array(y.length).fill(0);
  for (let i = 0; i < masses.length; i++) { out[4 * i] = y[4 * i + 2]; out[4 * i + 1] = y[4 * i + 3]; }
  for (let i = 0; i < masses.length; i++) for (let j = i + 1; j < masses.length; j++) {
    const dx = y[4 * j] - y[4 * i], dy = y[4 * j + 1] - y[4 * i + 1], r = Math.hypot(dx, dy);
    if (r < stop) throw new Collision("Close approach: integration halted before singularity");
    const factor = G / r ** 3;
    out[4 * i + 2] += factor * masses[j] * dx; out[4 * i + 3] += factor * masses[j] * dy;
    out[4 * j + 2] -= factor * masses[i] * dx; out[4 * j + 3] -= factor * masses[i] * dy;
  }
  return out;
}
export function gravityInvariants(p, y) {
  let energy = 0, angular = 0, mass = 0; const momentum = [0, 0], center = [0, 0]; let minDistance = Infinity;
  p.masses.forEach((m, i) => { const [x, z, vx, vy] = y.slice(4 * i, 4 * i + 4); mass += m; center[0] += m * x; center[1] += m * z; momentum[0] += m * vx; momentum[1] += m * vy; energy += m * (vx * vx + vy * vy) / 2; angular += m * (x * vy - z * vx); });
  for (let i = 0; i < p.masses.length; i++) for (let j = i + 1; j < p.masses.length; j++) { const r = Math.hypot(y[4 * i] - y[4 * j], y[4 * i + 1] - y[4 * j + 1]); minDistance = Math.min(minDistance, r); energy -= (p.G ?? 1) * p.masses[i] * p.masses[j] / r; }
  return { energy, angular, momentum, center: center.map((x) => x / mass), minDistance };
}
export function centerOfMassFrame(p, y) { const inv = gravityInvariants(p, y), mass = p.masses.reduce((a, b) => a + b); return y.map((v, i) => v - (i % 4 < 2 ? inv.center[i % 4] : inv.momentum[i % 4 - 2] / mass)); }
export const GRAVITY_PRESETS = {
  figure8: { masses: [1, 1, 1], y: [-.97000436, .24308753, .466203685, .43236573, .97000436, -.24308753, .466203685, .43236573, 0, 0, -.93240737, -.86473146] },
  hierarchical: { masses: [1, .02, .001], y: [0, 0, 0, 0, 1, 0, 0, 1, 3, 0, 0, .58] },
  scattering: { masses: [1, 1, .1], y: [-.6, 0, 0, -.6, .6, 0, 0, .6, -3, 1, 1.4, -.1] },
};
export function simulateDynamics(kind, params, initial, duration, options = {}) {
  if(!['pendulum','gravity'].includes(kind)||!Number.isFinite(duration)||duration<0||duration>1000||!initial.every(Number.isFinite))throw new RangeError('Simulation domain');
  if(kind==='pendulum'&&(!(params.m1>0&&params.m2>0&&params.l1>0&&params.l2>0&&params.g>0)||initial.length!==4||!(params.damping>=0)))throw new RangeError('Pendulum parameters');
  if(kind==='gravity'&&(!params.masses?.every(m=>Number.isFinite(m)&&m>0)||initial.length!==4*params.masses.length||!((params.G??1)>0)))throw new RangeError('Gravity parameters');
  const derivative = kind === "pendulum" ? (y) => pendulumDerivative(params, y) : (y) => gravityDerivative(params, y), energy = kind === "pendulum" ? (y) => pendulumEnergy(params, y) : (y) => gravityInvariants(params, y).energy;
  let y = initial.slice(), elapsed = 0, accepted = 0, rejected = 0, status = "complete"; const samples = [{ t: 0, y: y.slice(), energy: energy(y) }];
  const frames = Math.max(1, Math.ceil(duration / .04));
  for (let i = 1; i <= frames; i++) { const target = duration * i / frames, result = integrate(derivative, y, target - elapsed, options); y = result.y; elapsed += result.t; accepted += result.accepted; rejected += result.rejected; samples.push({ t: elapsed, y: y.slice(), energy: energy(y) }); if (result.status !== "complete") { status = result.status; break; } }
  return { y, t: elapsed, samples, energy: energy(y), initialEnergy: samples[0].energy, accepted, rejected, status };
}

// A small bounded cache keeps playback independent of frame timing. Changing initial data makes a new trajectory;
// scrubbing uses the nearest recorded state, whose actual time is always displayed (no hidden extrapolation).
const trajectoryCache = new Map();
export function trajectory(kind, params, initial, options = {}) {
  const duration = options.duration ?? 20, key = JSON.stringify([kind, params, initial, options]);
  if (trajectoryCache.has(key)) return trajectoryCache.get(key);
  const value = simulateDynamics(kind, params, initial, duration, options);
  trajectoryCache.set(key, value);
  if (trajectoryCache.size > 8) trajectoryCache.delete(trajectoryCache.keys().next().value);
  return value;
}
export function stateAt(path, time) {
  let lo = 0, hi = path.samples.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (path.samples[mid].t <= time) lo = mid; else hi = mid; }
  return path.samples[hi].t <= time ? path.samples[hi] : path.samples[lo];
}
export const pendulumParameters = s => ({ m1:s.m1,m2:s.m2,l1:s.l1,l2:s.l2,g:s.g,damping:s.damping });
export const pendulumInitial = s => [s.a,s.b,s.u,s.v];
export function pendulumModel(s) {
  const params=pendulumParameters(s),initial=pendulumInitial(s),options={tolerance:s.tolerance??1e-8,maxStep:.02};
  const path=trajectory('pendulum',params,initial,options),other=trajectory('pendulum',params,[initial[0]+s.delta,...initial.slice(1)],options);
  const now=stateAt(path,s.time),second=stateAt(other,now.t),points=pendulumPoints(params,now.y),nearby=pendulumPoints(params,second.y);
  const scale=(params.m1+params.m2)*params.g*(params.l1+params.l2)+Math.abs(path.initialEnergy);
  return {params,path,other,now,second,points,nearby,divergence:Math.hypot(...points[1].map((x,i)=>x-nearby[1][i])),energy:now.energy,drift:(now.energy-path.initialEnergy)/Math.max(1,scale),status:path.status,quantity:params.l1+params.l2};
}
export function gravityModel(s) {
  const params={masses:[s.m1,s.m2,s.m3],G:s.G,collision:.015},initial=s.com?centerOfMassFrame(params,s.initial):s.initial.slice(),options={tolerance:s.tolerance??1e-8,maxStep:.02};
  const changed=initial.slice();changed[0]+=s.delta;
  const path=trajectory('gravity',params,initial,options),other=trajectory('gravity',params,changed,options),now=stateAt(path,s.time),second=stateAt(other,now.t);
  const inv=gravityInvariants(params,now.y),start=gravityInvariants(params,initial),points=Array.from({length:3},(_,i)=>now.y.slice(4*i,4*i+2)),nearby=Array.from({length:3},(_,i)=>second.y.slice(4*i,4*i+2));
  const energyScale=Math.max(1,Math.abs(start.energy)),angularScale=Math.max(1,Math.abs(start.angular));
  return {params,initial,path,other,now,second,points,nearby,inv,start,energy:inv.energy,drift:(inv.energy-start.energy)/energyScale,angularDrift:(inv.angular-start.angular)/angularScale,divergence:Math.hypot(...now.y.filter((_,i)=>i%4<2).map((x,i)=>x-second.y[Math.floor(i/2)*4+i%2])),status:path.status,quantity:params.masses.reduce((a,b)=>a+b,0)};
}
