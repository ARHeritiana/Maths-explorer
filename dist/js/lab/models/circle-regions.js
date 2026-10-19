// Pure maths of the experiment `circle-regions`: n points on a circle, all the chords between them, and the number of regions
// they cut the disc into. The regions are counted from the drawing itself: R = 1 + E + Σ (m − 1) over the interior crossing
// points, m chords through each (every chord adds one region plus one per crossing it meets). No DOM.

export const MAX_N = 10;
// Angles (degrees) chosen so that no three chords meet at one point for n ≤ 10 (checked in tests/lab-engine.test.mjs).
export const GENERAL = [90, 151, 197, 243, 302, 338, 17, 125, 268, 51];

export function pointsOf(n, mode) {
  const deg = mode === "regular" ? Array.from({ length: n }, (_, i) => 90 + (360 * i) / n) : GENERAL.slice(0, n);
  return deg.map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)]);
}

function cross(p, q, r, s) {
  // intersection of the segments pq and rs strictly inside both, or null
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  if (Math.abs(d) < 1e-12) return null;
  const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
  const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
  return t > 1e-9 && t < 1 - 1e-9 && u > 1e-9 && u < 1 - 1e-9 ? [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])] : null;
}

const C = (n, k) => { if (k < 0 || k > n) return 0; let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c; };
export const formula = (n) => 1 + C(n, 2) + C(n, 4);

export function model(s) {
  const n = s.n, pts = pointsOf(n, s.mode), chords = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) chords.push([i, j]);
  // crossing points, merged when they coincide (several chords through one point)
  const hits = [];
  for (let a = 0; a < chords.length; a++) for (let b = a + 1; b < chords.length; b++) {
    const [i, j] = chords[a], [k, l] = chords[b];
    const X = cross(pts[i], pts[j], pts[k], pts[l]);
    if (!X) continue;
    let h = hits.find((o) => Math.hypot(o.at[0] - X[0], o.at[1] - X[1]) < 1e-7);
    if (!h) { h = { at: X, chords: new Set() }; hits.push(h); }
    h.chords.add(a); h.chords.add(b);
  }
  const extra = hits.reduce((t, h) => t + h.chords.size - 1, 0);
  return {
    n, pts, chords, hits: hits.map((h) => ({ at: h.at, m: h.chords.size })),
    regions: 1 + chords.length + extra, max: formula(n), doubling: 2 ** (n - 1),
    concurrent: hits.some((h) => h.chords.size > 2),
  };
}

export const quantities = {
  regions: (s) => model(s).regions,
};
export const quantity = (name, s) => quantities[name](s);
