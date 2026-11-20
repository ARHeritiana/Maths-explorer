// The Apollonian gasket (issue #36), pure. Four mutually tangent circles with curvatures k₁…k₄ (the outer circle counted
// negative) satisfy Descartes' theorem (k₁ + k₂ + k₃ + k₄)² = 2(k₁² + k₂² + k₃² + k₄²), and the same holds for k·z (z the
// centre as a complex number). So, given three of them, the two possible fourth circles have k₄ + k₄' = 2(k₁ + k₂ + k₃):
// replacing one circle of a quadruple by the other solution gives a new circle in a gap. Starting from (−1, 2, 2, 3), every
// curvature is an integer. Tested in tests/gallery-apollonian.test.mjs.
// A circle: {k (curvature, negative for the outer one), z: [x, y] centre, gen (the stage that adds it)}.
const kz = (c) => [c.k * c.z[0], c.k * c.z[1]];
const START = [
  { k: -1, z: [0, 0] }, { k: 2, z: [-0.5, 0] }, { k: 2, z: [0.5, 0] }, { k: 3, z: [0, 2 / 3] },
];
// The circle that replaces quadruple member i: k' = 2(sum of the other three) − k_i, likewise for k·z.
export function flip(Q, i) {
  const others = Q.filter((_, j) => j !== i), k = 2 * others.reduce((s, c) => s + c.k, 0) - Q[i].k;
  const w = [0, 1].map((a) => 2 * others.reduce((s, c) => s + kz(c)[a], 0) - kz(Q[i])[a]);
  return { k, z: [w[0] / k, w[1] / k] };
}
// All circles up to stage n: the 4 starting circles (stage 0), then each stage flips every quadruple at the positions
// other than the one it came from; each circle appears once (`count`). Each new circle keeps the three it touches (`touch`).
export function gasket(n, minRadius = 0) {
  const circles = START.map((c) => ({ ...c, gen: 0 })), quads = [{ Q: START, from: -1 }];
  let frontier = quads;
  for (let g = 1; g <= n; g++) {
    const next = [];
    for (const { Q, from } of frontier) for (let i = 0; i < 4; i++) {
      if (i === from) continue;
      const c = { ...flip(Q, i), gen: g, touch: Q.filter((_, j) => j !== i) };
      if (1 / c.k < minRadius) continue;
      circles.push(c); const R = Q.slice(); R[i] = c; next.push({ Q: R, from: i });
    }
    frontier = next;
  }
  return circles;
}
// Number of circles up to stage n: 4 at stage 0, 4 more at stage 1, then 3 times as many at each new stage.
export const count = (n) => (n === 0 ? 4 : 4 + 4 * (3 ** n - 1) / 2);
// Descartes' relation for a quadruple of curvatures.
export const descartes = (k) => { const s = k.reduce((a, b) => a + b, 0); return s * s - 2 * k.reduce((a, b) => a + b * b, 0); };
// Share of the outer disc covered by the inner circles (radius of the outer circle: 1).
export const coverage = (circles) => circles.filter((c) => c.k > 0).reduce((s, c) => s + 1 / (c.k * c.k), 0);
// Hausdorff dimension of the limit set: no closed form; a published numerical value (McMullen 1998: 1.305688...).
export const DIMENSION_ESTIMATE = 1.305688;
