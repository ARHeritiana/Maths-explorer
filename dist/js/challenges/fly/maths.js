// Pure maths of the fly challenge: two trains D km apart drive towards each other at v1 and v2 km/h; a fly at w km/h (faster
// than both) flies from the first train to the second, turns back, and so on until the trains meet. The trains meet after
// D / (v1 + v2) hours, so the fly covers w D / (v1 + v2) km. The legs form a geometric series with the same sum. No DOM.

// "D,v1,v2,w" (km, km/h); every preset gives a whole number of kilometres.
export const FLY_PRESETS = ["200,50,50,500", "200,50,50,75", "120,40,20,90", "60,10,20,45", "100,30,20,60", "300,70,80,100"];
export const parseFly = (s) => String(s).split(",").map(Number);
export const meetTime = (D, v1, v2) => D / (v1 + v2);
export const flyDistance = (D, v1, v2, w) => (w * D) / (v1 + v2);

// The legs of the fly: [{ t0, t1, from, to, length }] until the gap is below eps (km); positions are measured from train 1's
// start. Leg 0 goes from train 1 to train 2.
export function legs(D, v1, v2, w, eps = 1e-6, max = 200) {
  const out = [];
  let t = 0, toRight = true;
  while (out.length < max) {
    const x1 = v1 * t, x2 = D - v2 * t, gap = x2 - x1;
    if (gap <= eps) break;
    const dt = gap / (w + (toRight ? v2 : v1)), from = toRight ? x1 : x2;
    out.push({ t0: t, t1: t + dt, from, to: toRight ? x2 - v2 * dt : x1 + v1 * dt, length: w * dt });
    t += dt; toRight = !toRight;
  }
  return out;
}
// Positions at time t: [train 1, train 2, fly] (km), the fly at the meeting point once the trains have met.
export function flyMotion(D, v1, v2, w, t) {
  const T = meetTime(D, v1, v2), tt = Math.max(0, Math.min(t, T)), x1 = v1 * tt, x2 = D - v2 * tt;
  if (tt >= T) return { positions: [x1, x2, x1], completed: Infinity, direction: 0 };
  // After a pair of legs the remaining gap/time is multiplied by R. Locate the pair analytically, without a finite
  // trajectory truncation or extrapolation beyond its final leg, even for very fast flies near the meeting instant.
  const R = ((w - v1) * (w - v2)) / ((w + v2) * (w + v1));
  const pairs = Math.max(0, Math.floor(Math.log1p(-tt / T) / Math.log(R)));
  const rem = R ** pairs, start = T * (1 - rem), gap = D * rem, turn = start + gap / (w + v2);
  const right = tt < turn, fromTime = right ? start : turn;
  const f = right ? v1 * start + w * (tt - fromTime) : D - v2 * turn - w * (tt - fromTime);
  return { positions: [x1, x2, Math.max(x1, Math.min(x2, f))], completed: 2 * pairs + (right ? 0 : 1), direction: right ? 1 : -1, nextTime: right ? turn : T * (1 - rem * R) };
}
export const positions = (...args) => flyMotion(...args).positions;

// Four significant digits retain small positive times/legs instead of displaying them as zero.
export const flyNumber = (x, fr = false) => { const s = String(Number(x.toPrecision(4))); return fr ? s.replace('.', ',') : s; };

// Resolved collision vertices for a space-time plot. When oscillations are finer than a display can resolve,
// return their bounding train envelope, plus the EXACT current fly point. Never join across omitted bounces.
export function flyTrace(D, a, b, w, time) {
  const T = meetTime(D, a, b), end = Math.max(0, Math.min(T, time)), points = [[0, 0]];
  let t = 0, x = 0, dir = 1;
  for (let i = 0; i < 600 && t < end; i++) {
    const gap = D - (a + b) * t, dt = gap / (w + (dir > 0 ? b : a));
    if (gap / D < .001 || dt / T < 1 / 800) break;
    const next = Math.min(end, t + dt); x += dir * w * (next - t); t = next;
    points.push([x, t]); dir *= -1;
  }
  const current = [positions(D, a, b, w, end)[2], end];
  const envelope = t < end ? [[a*t,t],[D-b*t,t],[D-b*end,end],[a*end,end]] : null;
  return { points, envelope, current };
}
