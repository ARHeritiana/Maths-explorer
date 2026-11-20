// Cavalieri's principle (issue #30): solids of the same height whose sections at every height have the same area have the
// same volume. Pure: the stack of cards (a straight and a leaning stack), and the hemisphere against the cylinder minus a
// cone (apex at height 0, base at height R): at height z both sections have area π(R² − z²). Tested in
// tests/gallery-cavalieri.test.mjs.

// Hemisphere of radius R standing on its flat face: section at height z (0 ≤ z ≤ R) is a disc of radius √(R² − z²).
export const hemisphereRadius = (R, z) => Math.sqrt(Math.max(0, R * R - z * z));
export const hemisphereSection = (R, z) => Math.PI * (R * R - z * z);
// Cylinder of radius R and height R with the cone (apex at the bottom centre, base the top disc) removed: at height z the
// cone has radius z, so the section is a ring between radii z and R.
export const ringSection = (R, z) => Math.PI * R * R - Math.PI * z * z;
export const volumes = (R) => ({ cylinder: Math.PI * R ** 3, cone: (Math.PI * R ** 3) / 3, hemisphere: (2 * Math.PI * R ** 3) / 3, sphere: (4 * Math.PI * R ** 3) / 3 });

// A stack of n cards (w × d × e each); card k moves sideways by k × shear + wave × sin(2πk / n). Sections at every height
// are equal rectangles, so the volume is n w d e whatever the push; only the outline (its footprint) changes.
export function stack({ n, w, d, e, shear = 0, wave = 0 }) {
  const cards = Array.from({ length: n }, (_, k) => ({ x: k * shear + wave * Math.sin((2 * Math.PI * k) / n), y: k * e, w, h: e }));
  const xs = cards.map((c) => c.x);
  return { cards, volume: n * w * d * e, height: n * e, footprint: Math.max(...xs) - Math.min(...xs) + w, section: w * d };
}
// The card cut by a horizontal plane at height z (0 ≤ z < n e), or null above the stack.
export const cardAt = (S, z) => S.cards[Math.floor(z / S.cards[0].h)] ?? null;
// Volume below the plane at height z, the same for both solids: ∫₀^z π(R² − u²) du = π(R² z − z³/3).
export const volumeBelow = (R, z) => Math.PI * (R * R * z - z ** 3 / 3);

// Numerical volume of a solid from its section areas, by Simpson's rule on [0, H] (used by the tests and the plot).
export function volumeFromSections(area, H, steps = 400) {
  const h = H / steps; let s = area(0) + area(H);
  for (let i = 1; i < steps; i++) s += (i % 2 ? 4 : 2) * area(i * h);
  return (s * h) / 3;
}
