// Pure mathematics for the curiosity gallery (no DOM, tested in tests/gallery-math.test.mjs): escape times of the
// Mandelbrot and Julia sets, the discrete Fourier transform of a closed curve and the epicycles that redraw it.
const TAU = Math.PI * 2;

// Number of iterations of z -> z^2 + c from z0 before |z| exceeds 2 (max if it never does); smooth gives a continuous value.
export function escape(zr, zi, cr, ci, max = 200, smooth = false) {
  let x = zr, y = zi, n = 0;
  while (n < max && x * x + y * y <= 4) { const t = x * x - y * y + cr; y = 2 * x * y + ci; x = t; n++; }
  if (n >= max) return smooth ? max : max;
  return smooth ? n + 1 - Math.log2(Math.log(x * x + y * y) / 2) : n;
}
export const mandelbrot = (cr, ci, max, smooth) => escape(0, 0, cr, ci, max, smooth);
export const julia = (zr, zi, cr, ci, max, smooth) => escape(zr, zi, cr, ci, max, smooth);

// A stylised outline of Madagascar, clockwise from Cap d'Ambre, from the approximate [longitude, latitude] of coastal
// towns and capes. It is a silhouette for drawing, not a survey: details such as bays are left out.
export const MADAGASCAR = [
  [49.27, -11.95], [50.0, -13.35], [50.17, -14.27], [50.28, -14.9], [50.47, -15.27], [49.74, -15.43], [49.77, -16.17],
  [49.58, -16.92], [49.42, -17.38], [49.41, -18.15], [48.8, -19.9], [48.34, -21.21], [48.02, -22.15], [47.83, -22.82],
  [47.6, -23.35], [46.99, -25.03], [45.15, -25.6], [44.07, -25.0], [43.67, -23.35], [43.37, -21.75], [44.28, -20.28],
  [44.03, -18.05], [45.35, -16.1], [46.31, -15.72], [47.77, -14.63], [47.95, -13.8], [48.3, -13.4], [49.29, -12.28],
];
// longitude/latitude -> plane coordinates with the longitude scaled by cos(latitude) at the middle of the island, y up
export const planar = (pts) => pts.map(([lon, lat]) => [lon * Math.cos((19 * Math.PI) / 180), lat]);

// Resample a closed polyline into n points equally spaced along its length.
export function resample(poly, n) {
  const pts = [...poly, poly[0]], seg = [], total = pts.slice(1).reduce((s, p, i) => { const l = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); seg.push(l); return s + l; }, 0);
  const out = []; let i = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    while (i < seg.length - 1 && acc + seg[i] < target) { acc += seg[i]; i++; }
    const f = seg[i] ? (target - acc) / seg[i] : 0;
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
  }
  return out;
}

// Discrete Fourier transform of a closed curve (points as complex numbers x + iy): coefficients c_k for the frequencies
// k = -n/2 ... n/2 - 1, sorted by decreasing amplitude. z(t) = sum c_k e^(2 pi i k t) for t in [0, 1).
export function fourier(points) {
  const n = points.length, out = [];
  for (let m = 0; m < n; m++) {
    const k = m < n / 2 ? m : m - n; let re = 0, im = 0;
    for (let j = 0; j < n; j++) { const a = (-TAU * k * j) / n, c = Math.cos(a), s = Math.sin(a), [x, y] = points[j]; re += x * c - y * s; im += x * s + y * c; }
    re /= n; im /= n; out.push({ k, re, im, amp: Math.hypot(re, im) });
  }
  return out.sort((a, b) => b.amp - a.amp);
}
// The chain of rotating arms at time t in [0, 1) using the first `count` coefficients: the tips of the successive arms.
export function arms(coeffs, t, count) {
  let x = 0, y = 0; const chain = [[0, 0, 0]];
  for (let i = 0; i < Math.min(count, coeffs.length); i++) {
    const { k, re, im, amp } = coeffs[i], a = TAU * k * t, c = Math.cos(a), s = Math.sin(a);
    x += re * c - im * s; y += re * s + im * c; chain.push([x, y, amp]);
  }
  return chain;
}
// A closed polyline from a parametric curve, for the other shapes of the lab.
export const heart = (n) => Array.from({ length: n }, (_, i) => { const t = (TAU * i) / n; return [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]; });
export const star = (n, spikes = 5) => Array.from({ length: n }, (_, i) => { const t = (TAU * i) / n, r = 1 + 0.45 * Math.cos(spikes * t); return [r * Math.cos(t) * 10, r * Math.sin(t) * 10]; });
