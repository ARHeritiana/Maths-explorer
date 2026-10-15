// Pure geometry for the cake challenge: the cake is the unit square seen from above (side 1, height 1), and a vertical cut
// is a segment from the centre of the top face to a point of its outline. Nothing here touches the DOM, so it is tested
// directly (tests/cake-model.test.mjs). Perimeter parameters follow challenge-puzzles.js: u in [0, 4), anticlockwise from
// the bottom-left corner, one unit per side.
import { squarePoint, cakeShares } from "./challenge-puzzles.js";

export const CENTRE = [0.5, 0.5];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// Perimeter parameter of a point of the outline, or null when the point is not on it (within eps).
export function perimeterParam(x, y, eps = 1e-6) {
  const onBottom = Math.abs(y) < eps, onRight = Math.abs(x - 1) < eps, onTop = Math.abs(y - 1) < eps, onLeft = Math.abs(x) < eps;
  const inX = x > -eps && x < 1 + eps, inY = y > -eps && y < 1 + eps;
  if (onBottom && inX) return Math.min(1, Math.max(0, x)) % 4;
  if (onRight && inY) return 1 + Math.min(1, Math.max(0, y));
  if (onTop && inX) return 2 + (1 - Math.min(1, Math.max(0, x)));
  if (onLeft && inY) return (3 + (1 - Math.min(1, Math.max(0, y)))) % 4;
  return null;
}

// The point of the outline hit by the ray from the centre in direction angle th.
export function rayToOutline(th) {
  const dx = Math.cos(th), dy = Math.sin(th), k = 0.5 / Math.max(Math.abs(dx), Math.abs(dy));
  return [0.5 + dx * k, 0.5 + dy * k];
}

// Cuts (perimeter parameters) made by a list of segments [[x1, y1], [x2, y2]]: a segment from the centre to the outline
// is one cut; a segment through the centre with both ends on the outline is two; any other segment is not a cut.
export function cutsOfSegments(segments, eps = 1e-6) {
  const out = [];
  const add = (u) => { if (u !== null && !out.some((v) => Math.min(Math.abs(u - v), 4 - Math.abs(u - v)) < 1e-6)) out.push(((u % 4) + 4) % 4); };
  for (const [A, B] of segments) {
    const aC = Math.hypot(A[0] - 0.5, A[1] - 0.5) < eps, bC = Math.hypot(B[0] - 0.5, B[1] - 0.5) < eps;
    const uA = perimeterParam(A[0], A[1], eps), uB = perimeterParam(B[0], B[1], eps);
    if (aC && uB !== null) add(uB);
    else if (bC && uA !== null) add(uA);
    else if (uA !== null && uB !== null) {
      const cross = (B[0] - A[0]) * (0.5 - A[1]) - (B[1] - A[1]) * (0.5 - A[0]), len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const dot = (0.5 - A[0]) * (B[0] - A[0]) + (0.5 - A[1]) * (B[1] - A[1]);
      if (len > eps && Math.abs(cross) / len < eps && dot > 0 && dot < len * len) { add(uA); add(uB); }
    }
  }
  return out.sort((a, b) => a - b);
}

// Outline polygon (anticlockwise, in unit-square coordinates) of every piece, from the sorted cuts.
export function piecePolygons(cuts) {
  const ts = [...cuts].map((u) => ((u % 4) + 4) % 4).sort((a, b) => a - b), k = ts.length, out = [];
  if (k === 0) return [[[0, 0], [1, 0], [1, 1], [0, 1]]];
  if (k === 1) return [[[0, 0], [1, 0], [1, 1], [0, 1]]];   // a single cut does not separate anything
  for (let i = 0; i < k; i++) {
    const a = ts[i], b = i + 1 < k ? ts[i + 1] : ts[0] + 4, pts = [CENTRE, squarePoint(a)];
    for (let c = Math.floor(a) + 1; c < b; c++) pts.push(squarePoint(c));
    pts.push(squarePoint(b));
    out.push(pts);
  }
  return out;
}

// Is this set of cuts a fair sharing into n portions (equal cake and equal cream, within tol)?
export function isFair(cuts, n, tol = 0.002) {
  if (cuts.length !== n) return false;
  return cakeShares(cuts).every((s) => Math.abs(s.volume - 1 / n) < tol && Math.abs(s.cream - 1 / n) < tol);
}

// The grid size (units along the side of the cake) for which the equally spaced points fall on grid points:
// the spacing 4g/n must be a whole number of units, with a side of at least 3 units.
export function niceSide(n) {
  let g = n / gcd(n, 4);
  while (g < 3) g *= 2;
  return g;
}

// Directions in which the pieces slide apart when the cake is exploded (unit vectors, one per piece).
export function pieceDirections(polys) {
  return polys.map((poly) => {
    const m = poly.slice(1).reduce((s, p) => [s[0] + p[0] / (poly.length - 1), s[1] + p[1] / (poly.length - 1)], [0, 0]);
    const dx = m[0] - 0.5, dy = m[1] - 0.5, l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  });
}

export { squarePoint, cakeShares };
