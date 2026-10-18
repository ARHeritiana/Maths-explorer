// Pure mathematics of the star challenge (no DOM), checked by an independent method in tests/.

/* ----------------------------------------------------- C: star polygons */
export const gcd = (x, y) => (y ? gcd(y, x % y) : x);

// The star {n/k}: every vertex of a regular n-gon is joined to the k-th next one. k must satisfy gcd(n, k) = 1 and 2k < n.
export const starK = (n, k) => { for (let kk = Math.min(Math.max(1, k), Math.floor((n - 1) / 2)); kk >= 1; kk--) if (gcd(n, kk) === 1) return kk; return 1; };

export const starTipDegrees = (n, k) => 180 - (360 * k) / n;

export const starSumDegrees = (n, k) => 180 * (n - 2 * k);

// The tip angle measured from coordinates: at vertex 0, between the chords to the vertices k ahead and k behind.
export function measuredTip(n, k) {
  const P = (i) => [Math.cos((2 * Math.PI * i) / n), Math.sin((2 * Math.PI * i) / n)], o = P(0), u = P(k), v = P(n - k);
  const a = [u[0] - o[0], u[1] - o[1]], b = [v[0] - o[0], v[1] - o[1]];
  return (Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) * 180) / Math.PI;
}
