// Pure mathematics of the moving sofa exhibit (no DOM): an L-shaped hallway of width 1, sofas as polygons, a pose test
// (does the sofa fit?), Hammersley's family and its turning motion, and a polygon from a freehand outline.
// Checked in tests/gallery-puzzles.test.mjs.

// Hallway: horizontal arm {x ≤ 1, 0 ≤ y ≤ 1} (coming from the left) and vertical arm {0 ≤ x ≤ 1, y ≤ 1} (leaving
// downwards). The inner corner is (0, 0), the outer corner (1, 1).
export const inHallway = ([x, y], eps = 1e-9) => (x <= 1 + eps && y >= -eps && y <= 1 + eps) || (x >= -eps && x <= 1 + eps && y <= 1 + eps);

export function area(poly) { let s = 0; for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s) / 2; }
export function contains(poly, [px, py]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside; }
  return inside;
}
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

// Hammersley's family: two quarter discs of radius 1 joined by a 2r × 1 block from which a half disc of radius r is
// removed (0 ≤ r ≤ 1). r = 0 is the half disc of radius 1; the area π/2 + 2r − πr²/2 is largest for r = 2/π.
export function hammersley(r, n = 48) {
  // the notch polygon is drawn outside its circle (vertices at r / cos(π/2n)), so the corner sliding on the circle stays
  // outside the polygon; the outer arcs are inscribed in theirs, so the polygon stays inside the true sofa
  const notch = r > 0 ? [[-r, 0], ...arc(0, 0, r / Math.cos(Math.PI / (2 * n)), Math.PI - Math.PI / (2 * n), Math.PI / (2 * n), n - 1), [r, 0]] : [[0, 0]];
  return [[-r - 1, 0], ...notch, [r + 1, 0], ...arc(r, 0, 1, 0, Math.PI / 2, n).slice(1), ...arc(-r, 0, 1, Math.PI / 2, Math.PI, n).slice(1, -1)];
}
export const hammersleyArea = (r) => Math.PI / 2 + 2 * r - (Math.PI * r * r) / 2;
export const HAMMERSLEY_R = 2 / Math.PI;
// A rectangle of width w (across the hallway) and length l, centred on the origin.
export const rectangle = (w, l) => [[-l / 2, -w / 2], [l / 2, -w / 2], [l / 2, w / 2], [-l / 2, w / 2]];

// Records quoted in the exhibit (area of the largest sofa known to turn the corner).
export const RECORDS = { hammersley: Math.PI / 2 + 2 / Math.PI, gerver: 2.2195, upper: 2.37 };

// A pose { x, y, a } puts the sofa point q at R(a) q + (x, y).
export function place(poly, { x, y, a }) { const c = Math.cos(a), s = Math.sin(a); return poly.map(([u, v]) => [x + c * u - s * v, y + s * u + c * v]); }
// Boundary points every `step` along the outline.
export function boundary(poly, step = 0.02) {
  const out = [];
  for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length], n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step)); for (let k = 0; k < n; k++) out.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]); }
  return out;
}
// The sofa fits when its whole outline is in the hallway and the inner corner is not inside it (the only part of the
// walls that can poke into a sofa whose outline stays in the hallway). Touching a wall is allowed.
export function fits(poly, pose, eps = 1e-9) {
  const placed = place(poly, pose);
  return boundary(placed).every((p) => inHallway(p, eps)) && !containsStrictly(placed, [0, 0], eps);
}
function containsStrictly(poly, p, eps) {
  if (!contains(poly, p)) return false;
  // on the outline (touching the corner) counts as outside
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], d = segmentDistance(p, a, b); if (d <= Math.max(eps, 1e-7)) return false; }
  return true;
}
export function segmentDistance([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
// Through the corner: every point of the sofa is in the vertical arm below the horizontal one.
export const through = (poly, pose) => place(poly, pose).every(([, y]) => y <= 0);

// Hammersley's motion for the sofa of parameter r: slide in until it touches the far wall, turn by a quarter turn while
// the centre of the notch runs on the circle of radius r around the inner corner, slide out. s goes from 0 to 3.
export function hammersleyPose(r, s, run = 3) {
  if (s <= 1) return { x: -r - run * (1 - s), y: 0, a: 0 };
  if (s <= 2) { const t = (s - 1) * (Math.PI / 2); return { x: -r * Math.cos(t), y: -r * Math.sin(t), a: -t }; }
  return { x: 0, y: -r - run * (s - 2), a: -Math.PI / 2 };
}

// A freehand outline: resample to n points equally spaced along it, as a closed polygon centred on its centroid.
export function fromStroke(points, n = 90) {
  const pts = points.filter((p, i) => i === 0 || Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) > 1e-6);
  if (pts.length < 3) return null;
  const closed = [...pts, pts[0]], lens = [0];
  for (let i = 1; i < closed.length; i++) lens.push(lens[i - 1] + Math.hypot(closed[i][0] - closed[i - 1][0], closed[i][1] - closed[i - 1][1]));
  const total = lens.at(-1), out = [];
  for (let k = 0, j = 1; k < n; k++) { const d = (total * k) / n; while (lens[j] < d) j++; const f = (d - lens[j - 1]) / (lens[j] - lens[j - 1] || 1); out.push([closed[j - 1][0] + f * (closed[j][0] - closed[j - 1][0]), closed[j - 1][1] + f * (closed[j][1] - closed[j - 1][1])]); }
  const cx = out.reduce((s, p) => s + p[0], 0) / n, cy = out.reduce((s, p) => s + p[1], 0) / n;
  return { poly: out.map(([x, y]) => [x - cx, y - cy]), at: [cx, cy] };
}
