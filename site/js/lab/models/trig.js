// Pure maths of the unit circle: exact values at remarkable angles, associated angles, circle and graph share one angle.
// Angles are in degrees in the state; the graph axis is in radians.
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export const remarkableAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

export function radiansLabel(degrees) {
  const n = Math.round(degrees);
  if (Math.abs(degrees - n) > 1e-8) return null;
  if (n === 0) return "0";
  const d = gcd(Math.abs(n), 180), a = n / d, b = 180 / d;
  return `${a < 0 ? "−" : ""}${Math.abs(a) === 1 ? "" : Math.abs(a)}π${b === 1 ? "" : "/" + b}`;
}
const norm = (d) => ((d % 360) + 360) % 360;
const EXACT = { 0: ["1", "0"], 30: ["√3/2", "1/2"], 45: ["√2/2", "√2/2"], 60: ["1/2", "√3/2"], 90: ["0", "1"], 120: ["−1/2", "√3/2"], 135: ["−√2/2", "√2/2"], 150: ["−√3/2", "1/2"], 180: ["−1", "0"], 210: ["−√3/2", "−1/2"], 225: ["−√2/2", "−√2/2"], 240: ["−1/2", "−√3/2"], 270: ["0", "−1"], 300: ["1/2", "−√3/2"], 315: ["√2/2", "−√2/2"], 330: ["√3/2", "−1/2"] };
export function trigValues(degrees) {
  const a = norm(degrees), rad = (degrees * Math.PI) / 180;
  const key = Object.keys(EXACT).find((k) => Math.abs(+k - a) < 1e-8);
  const c = Math.cos(rad), s = Math.sin(rad);
  return { cos: Math.abs(c) < 1e-12 ? 0 : c, sin: Math.abs(s) < 1e-12 ? 0 : s, exact: key === undefined ? null : EXACT[key], radians: radiansLabel(degrees) };
}

// Associated angles: the angle of Q as a function of the angle x of P, and what happens to the coordinates.
export const relations = {
  plusPi: { angle: "x + π", transform: (x) => x + 180, cos: "−cos x", sin: "−sin x", explain: ["Un demi-tour change le signe des deux coordonnées.", "A half-turn changes the sign of both coordinates."] },
  minusPi: { angle: "x − π", transform: (x) => x - 180, cos: "−cos x", sin: "−sin x", explain: ["Un demi-tour dans l’autre sens donne aussi le point opposé.", "A half-turn in the other direction also gives the opposite point."] },
  plusHalfPi: { angle: "x + π/2", transform: (x) => x + 90, cos: "−sin x", sin: "cos x", explain: ["Un quart de tour direct transforme (a ; b) en (−b ; a).", "A counterclockwise quarter-turn maps (a, b) to (−b, a)."] },
  minusHalfPi: { angle: "x − π/2", transform: (x) => x - 90, cos: "sin x", sin: "−cos x", explain: ["Un quart de tour horaire transforme (a ; b) en (b ; −a).", "A clockwise quarter-turn maps (a, b) to (b, −a)."] },
  opposite: { angle: "−x", transform: (x) => -x, cos: "cos x", sin: "−sin x", explain: ["La symétrie par rapport à l’axe des abscisses conserve l’abscisse et change l’ordonnée.", "Reflection in the horizontal axis keeps the horizontal coordinate and reverses the vertical one."] },
  supplementary: { angle: "π − x", transform: (x) => 180 - x, cos: "−cos x", sin: "sin x", explain: ["La symétrie par rapport à l’axe des ordonnées change l’abscisse et conserve l’ordonnée.", "Reflection in the vertical axis reverses the horizontal coordinate and keeps the vertical one."] },
  complementary: { angle: "π/2 − x", transform: (x) => 90 - x, cos: "sin x", sin: "cos x", explain: ["La symétrie par rapport à la droite d’équation y = x échange les coordonnées.", "Reflection in the line y = x swaps the coordinates."] },
  fullTurn: { angle: "x + 2π", transform: (x) => x + 360, cos: "cos x", sin: "sin x", explain: ["Un tour complet ramène au même point : sinus et cosinus sont 2π-périodiques.", "A full turn returns to the same point: sine and cosine are 2π-periodic."] },
};

// Everything derived from the state {deg, assoc}: P, the associated point Q (or null), the graph abscissa in radians.
export function model(s) {
  const p = trigValues(s.deg), r = s.assoc && s.assoc !== "none" ? relations[s.assoc] : null;
  const qAngle = r ? r.transform(s.deg) : null;
  return { deg: s.deg, rad: (s.deg * Math.PI) / 180, p, relation: r, q: r ? trigValues(qAngle) : null, qAngle };
}
export const quantities = {
  cos: (s) => trigValues(s.deg).cos,
  sin: (s) => trigValues(s.deg).sin,
  tan: (s) => Math.tan((s.deg * Math.PI) / 180),
};
export const quantity = (name, s) => quantities[name](s);
