// The napkin-ring paradox. A sphere of radius R is drilled along a diameter by a cylindrical hole; the ring that remains has
// height h = 2 sqrt(R^2 - r^2) (r = radius of the hole). Its volume is pi h^3 / 6, whatever R. Pure maths, no DOM.
export const holeRadius = (R, h) => Math.sqrt(Math.max(0, R * R - h * h / 4));
export const height = (R, r) => 2 * Math.sqrt(Math.max(0, R * R - r * r));
// Cross-section of the ring at level z (|z| <= h/2): an annulus between r and sqrt(R^2 - z^2), area pi (h^2/4 - z^2).
export const sliceOuter = (R, z) => Math.sqrt(Math.max(0, R * R - z * z));
export const sliceArea = (R, h, z) => Math.PI * (sliceOuter(R, z) ** 2 - holeRadius(R, h) ** 2);
// Volume by Cavalieri: the sum of the slice areas, every slice equal to pi (h^2/4 - z^2) (integral computed by Simpson, exact for a quadratic).
export function volumeBySlices(R, h, n = 200) {
  const a = -h / 2, dz = h / n; let s = sliceArea(R, h, a) + sliceArea(R, h, h / 2);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * sliceArea(R, h, a + i * dz);
  return s * dz / 3;
}
export const volume = (h) => Math.PI * h ** 3 / 6;
// Compared ring: same height (the volumes agree) or same hole (the volumes differ; both are meaningful).
export const volumeSameHole = (R, r) => volume(height(R, r));
