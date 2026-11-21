// Pure model of the hiker challenge, seen from the side (owner, 21 November 2026): the mountain is the graph of a random
// profile (height against horizontal distance, with ups and downs, foot on the left, summit at the right end), and each
// day's walk is an irregular pace: rests, bursts and, when allowed, stretches walked backwards. Positions are fractions
// of the trail measured horizontally (0 foot, 1 summit). Everything is a pure function of its seeds; no DOM.
export const W = 520, H = 300;
export const BASE = 262, TOP = 64, LEFT = 46, RIGHT = 486;   // where the graph of the profile sits in the scene

// Seeded random numbers (mulberry32).
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// A mountain profile: heights at K + 1 evenly spaced knots, 0 at the foot, 1 at the summit, with at least one dip on the
// way (a knot lower than the one before it), all other heights inside (0.06, 0.94).
export function makeProfile(seed, K = 8) {
  const r = rng(seed * 7919 + 17), h = [0];
  for (let i = 1; i < K; i++) h.push(Math.min(0.94, Math.max(0.06, (i / K) * 0.85 + (r() - 0.5) * 0.5)));
  h.push(1);
  if (!h.some((v, i) => i > 0 && i < K && v < h[i - 1] - 0.04)) { const i = 2 + Math.floor(r() * (K - 3)); h[i - 1] = Math.max(h[i - 1], 0.3); h[i] = h[i - 1] - 0.15; }
  return h;
}
// Height of the profile at horizontal fraction x (a smooth curve through the knots, kept inside [0, 1]).
export function heightAt(h, x) {
  const K = h.length - 1;
  if (x >= 1) return h[K];
  const u = Math.min(K - 1e-9, Math.max(0, x) * K), i = Math.floor(u), f = u - i;
  const p0 = h[Math.max(0, i - 1)], p1 = h[i], p2 = h[i + 1], p3 = h[Math.min(K, i + 2)];
  const v = 0.5 * (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (3 * p1 - p0 - 3 * p2 + p3) * f * f * f);
  return Math.min(1, Math.max(0, v));
}
// Scene coordinates of the trail at fraction s.
export const sceneX = (s) => LEFT + (RIGHT - LEFT) * Math.min(1, Math.max(0, s));
export const sceneY = (v) => BASE - (BASE - TOP) * v;
export const trailPoint = (h, s) => ({ x: sceneX(s), y: sceneY(heightAt(h, s)) });
// The profile as a polyline of n + 1 scene points.
export const profilePoints = (h, n = 120) => Array.from({ length: n + 1 }, (_, i) => trailPoint(h, i / n));
// Length walked along the trail (scene units) from the foot to fraction s, for a walk cycle that never slides.
export function arcLength(h, s, n = 160) {
  let L = 0, prev = trailPoint(h, 0);
  const m = Math.max(1, Math.round(n * Math.min(1, Math.max(0, s))));
  for (let i = 1; i <= m; i++) { const p = trailPoint(h, (s * i) / m); L += Math.hypot(p.x - prev.x, p.y - prev.y); prev = p; }
  return L;
}

// An irregular pace for one day: knots [u, s] with u the fraction of the day's walking time (0 to 1) and s the fraction
// of the trail, from s = 0 to s = 1. Some stretches are rests (s unchanged); with `back`, some go backwards.
export function makePace(seed, { back = false, knots = 10 } = {}) {
  const r = rng(seed * 104729 + 3), times = [0];
  for (let i = 1; i < knots; i++) times.push(r());
  times.push(1); times.sort((a, b) => a - b);
  const s = [0];
  for (let i = 1; i < knots; i++) {
    const trend = i / knots, roll = r();
    const canBack = back && s[i - 1] > 0.15;   // a step back only once he is on the trail
    let v = roll < 0.18 ? s[i - 1] : roll < (canBack ? 0.42 : 0) ? s[i - 1] - (0.05 + 0.12 * r()) : Math.max(s[i - 1] + 0.03, trend + (r() - 0.35) * 0.18);   // rest, back, ahead
    if (!back) v = Math.max(v, s[i - 1]);
    s.push(Math.min(0.97, Math.max(0, v)));
  }
  s.push(1);
  return times.map((u, i) => [u, s[i]]);
}
// Position at fraction u of the day (piecewise linear through the knots), and the direction of motion there (1, 0, -1).
export function paceAt(K, u) {
  const x = Math.min(1, Math.max(0, u));
  for (let i = 1; i < K.length; i++) if (x <= K[i][0] || i === K.length - 1) {
    const [u0, s0] = K[i - 1], [u1, s1] = K[i], f = u1 > u0 ? (x - u0) / (u1 - u0) : 1;
    return { s: s0 + (s1 - s0) * Math.min(1, Math.max(0, f)), dir: Math.sign(s1 - s0) };
  }
  return { s: 1, dir: 0 };
}
// Where the hiker is, h hours after 08:00, on day 1 (up, T1 hours) and day 2 (down, T2 hours); after arriving he stays.
export const day1At = (K1, T1, hours) => paceAt(K1, hours / T1);
export const day2At = (K2, T2, hours) => { const p = paceAt(K2, hours / T2); return { s: 1 - p.s, dir: -p.dir }; };
// The first moment (hours after 08:00) when both days put him at the same place, and that place: the gap day 1 − day 2
// goes from −1 to +1 and is linear between the knots of both days, so the crossing is found exactly.
export function crossing(K1, T1, K2, T2) {
  const ts = [...new Set([...K1.map(([u]) => u * T1), ...K2.map(([u]) => u * T2), 0, Math.max(T1, T2)])].sort((a, b) => a - b);
  const gap = (t) => day1At(K1, T1, t).s - day2At(K2, T2, t).s;
  for (let i = 1; i < ts.length; i++) {
    const a = gap(ts[i - 1]), b = gap(ts[i]);
    if (a === 0) return { hours: ts[i - 1], s: day1At(K1, T1, ts[i - 1]).s };
    if (a < 0 && b >= 0) { const t = ts[i - 1] + ((ts[i] - ts[i - 1]) * -a) / (b - a); return { hours: t, s: day1At(K1, T1, t).s }; }
  }
  return null;
}

// Sun position for a number of minutes after 08:00 (rises on the left, sets on the right at about 20:00).
export const sunAt = (min) => { const k = Math.min(1, Math.max(0, min / 720)), a = Math.PI * (0.92 - 0.84 * k); return { x: 260 + 230 * Math.cos(a), y: 150 - 120 * Math.sin(a) }; };
