// Pure maths of the fly challenge: two trains D km apart drive towards each other at v1 and v2 km/h; a fly at w km/h (faster
// than both) flies from the first train to the second, turns back, and so on until the trains meet. The trains meet after
// D / (v1 + v2) hours, so the fly covers w D / (v1 + v2) km. The legs form a geometric series with the same sum. No DOM.

// "D,v1,v2,w" (km, km/h); every preset gives a whole number of kilometres.
export const FLY_PRESETS = ["200,50,50,75", "120,40,20,90", "60,10,20,45", "100,30,20,60", "300,70,80,100"];
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
export function positions(D, v1, v2, w, t) {
  const T = meetTime(D, v1, v2), tt = Math.min(t, T), x1 = v1 * tt, x2 = D - v2 * tt;
  if (tt >= T) return [x1, x2, x1];
  const L = legs(D, v1, v2, w, 1e-9, 400), leg = L.find((l) => tt <= l.t1) || L.at(-1);
  const f = leg.from + (leg.to - leg.from) * ((tt - leg.t0) / (leg.t1 - leg.t0 || 1));
  return [x1, x2, f];
}
