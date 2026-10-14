// Plane geometry for the Art gallery challenge: ear clipping, three-colouring and the visibility polygon.
// Pure functions on arrays of [x, y]; the polygon is simple and listed counterclockwise.
const EPS = 1e-9;
export const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
export const area2 = (p) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0);

export function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

const inTriangle = (p, a, b, c) => cross(a, b, p) >= -EPS && cross(b, c, p) >= -EPS && cross(c, a, p) >= -EPS;

// Ear clipping: returns n − 2 triangles as index triples.
export function triangulate(poly) {
  const idx = poly.map((_, i) => i), tris = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 1000) {
    let clipped = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = poly[i0], b = poly[i1], c = poly[i2];
      if (cross(a, b, c) <= EPS) continue;
      if (idx.some((j) => j !== i0 && j !== i1 && j !== i2 && inTriangle(poly[j], a, b, c))) continue;
      tris.push([i0, i1, i2]); idx.splice(k, 1); clipped = true; break;
    }
    if (!clipped) break;
  }
  if (idx.length === 3) tris.push([idx[0], idx[1], idx[2]]);
  return tris;
}

// Fisk's colouring: walk the triangles through shared edges; the third vertex takes the colour missing on the edge.
export function threeColour(n, tris) {
  const col = Array(n).fill(-1), done = new Set(), queue = [0];
  [0, 1, 2].forEach((k) => (col[tris[0][k]] = k));
  done.add(0);
  while (queue.length) {
    const t = tris[queue.shift()];
    tris.forEach((u, j) => {
      if (done.has(j)) return;
      const shared = u.filter((v) => t.includes(v));
      if (shared.length < 2) return;
      const third = u.find((v) => !shared.includes(v));
      col[third] = [0, 1, 2].find((c) => c !== col[shared[0]] && c !== col[shared[1]]);
      done.add(j); queue.push(j);
    });
  }
  return col;
}

function onSegment(p, a, b) {
  const c = cross(a, b, p), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return Math.abs(c) / len < 1e-7 && (p[0] - a[0]) * (b[0] - p[0]) + (p[1] - a[1]) * (b[1] - p[1]) >= -1e-9;
}

function rayHit(o, d, a, b) {
  const ex = b[0] - a[0], ey = b[1] - a[1], den = d[0] * ey - d[1] * ex;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((a[0] - o[0]) * ey - (a[1] - o[1]) * ex) / den, u = ((a[0] - o[0]) * d[1] - (a[1] - o[1]) * d[0]) / den;
  return t > 1e-7 && u > -1e-9 && u < 1 + 1e-9 ? t : null;
}

// Visibility polygon of a point inside the polygon (boundary counts): rays to every vertex and just beside it.
export function visibility(poly, p) {
  const pts = [];
  const cast = (a) => {
    const d = [Math.cos(a), Math.sin(a)];
    let best = Infinity;
    for (let i = 0; i < poly.length; i++) { const t = rayHit(p, d, poly[i], poly[(i + 1) % poly.length]); if (t !== null && t < best) best = t; }
    if (!Number.isFinite(best)) return null;
    // a guard on the boundary (a vertex) must ignore the rays that leave the polygon at once
    return { a, q: [p[0] + d[0] * best, p[1] + d[1] * best], inside: pointInPolygon([p[0] + d[0] * best * 0.5, p[1] + d[1] * best * 0.5], poly) };
  };
  for (const v of poly) {
    const base = Math.atan2(v[1] - p[1], v[0] - p[0]);
    if (Math.hypot(v[0] - p[0], v[1] - p[1]) < 1e-9) continue;
    const lo = cast(base - 1e-6), mid = cast(base), hi = cast(base + 1e-6);
    // the ray along an edge sits on the boundary: keep it when a neighbouring ray runs through the interior
    for (const r of [lo, hi]) if (r && r.inside) pts.push(r);
    if (mid && ((lo && lo.inside) || (hi && hi.inside))) pts.push(mid);
  }
  // Sweep counterclockwise from the edge leaving p: for a guard on the boundary this runs through the interior only.
  let a0 = 0, onEdge = false;
  for (let i = 0; i < poly.length; i++) {
    const b = poly[(i + 1) % poly.length];
    if (onSegment(p, poly[i], b) && Math.hypot(b[0] - p[0], b[1] - p[1]) > 1e-9) { a0 = Math.atan2(b[1] - p[1], b[0] - p[0]); onEdge = true; break; }
  }
  const TWO = 2 * Math.PI;
  const rel = (a) => { const r = (((a - a0) % TWO) + TWO) % TWO; return onEdge && r > TWO - 1e-9 ? 0 : r; };
  const out = pts.sort((u, v) => rel(u.a) - rel(v.a)).map((u) => u.q);
  // a guard on the boundary closes its own wedge
  if (onEdge) out.push([p[0], p[1]]);
  return out;
}

export const sees = (poly, guard, target) => pointInPolygon(target, visibility(poly, guard));

// The 12-sided comb of the activity: four thin teeth. The tips are mutually hidden, so four guards are necessary.
export const COMB = [[0, 0], [18, 0], [16.3, 10], [14.5, 3], [13.5, 3], [11.5, 10], [9.5, 3], [8.5, 3], [6.5, 10], [4.5, 3], [3.5, 3], [1.2, 10]];
