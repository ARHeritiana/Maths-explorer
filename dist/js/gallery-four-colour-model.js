// Pure maths of the four colour exhibit: maps (random Voronoi countries, an odd wheel that needs four colours, a pizza whose
// slices only touch at the centre), which countries are neighbours (they share a border of positive length, a common point is
// not enough), proper colourings by backtracking, and the least number of colours of a map. No DOM.
import { voronoiCells } from "./gallery-models.js";

export const BOX = [0, 0, 640, 440];

// mulberry32: seeded uniform numbers in [0, 1)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// n countries: Voronoi cells of seeded random points, kept apart so that no country is a sliver.
export function randomMap(n, seed) {
  const next = rng(seed), seeds = [];
  for (let tries = 0; seeds.length < n && tries < 5000; tries++) {
    const p = [30 + next() * 580, 30 + next() * 380];
    if (seeds.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 48 - tries / 200)) seeds.push(p);
  }
  return voronoiCells(seeds, BOX).filter((c) => c.length >= 3);
}

const ring = (cx, cy, r, k, turn = -Math.PI / 2) => Array.from({ length: k }, (_, i) => [cx + r * Math.cos(turn + (2 * Math.PI * i) / k), cy + r * Math.sin(turn + (2 * Math.PI * i) / k)]);

// A centre surrounded by an odd ring of five countries, inside a sea: the ring alone needs three colours, the centre a fourth.
export function wheelMap() {
  const inner = ring(320, 220, 70, 5), outer = ring(320, 220, 190, 5);
  const sectors = inner.map((p, i) => [p, outer[i], outer[(i + 1) % 5], inner[(i + 1) % 5]]);
  return [inner, ...sectors];
}

// Eight slices that all meet at the centre: two colours are enough, because touching at a point does not count.
export function pizzaMap() {
  const rim = ring(320, 220, 190, 32, 0);
  return Array.from({ length: 8 }, (_, i) => [[320, 220], ...[0, 1, 2, 3, 4].map((j) => rim[(i * 4 + j) % 32])]);
}

// Shared border of positive length between two polygons: two collinear edges whose projections overlap.
function overlap(a, b, c, d, eps = 1e-6) {
  const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy);
  if (L < eps) return null;
  const cross = (p) => (ux * (p[1] - a[1]) - uy * (p[0] - a[0])) / L;
  if (Math.abs(cross(c)) > 1e-4 || Math.abs(cross(d)) > 1e-4) return null;
  const t = (p) => ((p[0] - a[0]) * ux + (p[1] - a[1]) * uy) / (L * L);
  const lo = Math.max(0, Math.min(t(c), t(d))), hi = Math.min(1, Math.max(t(c), t(d)));
  return hi - lo > 1e-6 ? [[a[0] + lo * ux, a[1] + lo * uy], [a[0] + hi * ux, a[1] + hi * uy]] : null;
}

// Neighbours: list of [i, j, segments] with i < j.
export function neighbours(map) {
  const out = [];
  for (let i = 0; i < map.length; i++) for (let j = i + 1; j < map.length; j++) {
    const segs = [];
    const A = map[i], B = map[j];
    for (let p = 0; p < A.length; p++) for (let q = 0; q < B.length; q++) {
      const s = overlap(A[p], A[(p + 1) % A.length], B[q], B[(q + 1) % B.length]);
      if (s) segs.push(s);
    }
    if (segs.length) out.push([i, j, segs]);
  }
  return out;
}

export const adjacency = (n, edges) => { const adj = Array.from({ length: n }, () => new Set()); for (const [i, j] of edges) { adj[i].add(j); adj[j].add(i); } return adj; };

// A proper colouring with at most k colours (array of 0..k-1), or null. Backtracking, most constrained country first.
export function colourWith(n, edges, k) {
  const adj = adjacency(n, edges), col = Array(n).fill(-1);
  const pick = () => { let best = -1, bestSat = -1, bestDeg = -1; for (let v = 0; v < n; v++) if (col[v] < 0) { const sat = new Set([...adj[v]].map((w) => col[w]).filter((c) => c >= 0)).size; if (sat > bestSat || (sat === bestSat && adj[v].size > bestDeg)) { best = v; bestSat = sat; bestDeg = adj[v].size; } } return best; };
  const go = (left) => {
    if (!left) return true;
    const v = pick();
    for (let c = 0; c < k; c++) if ([...adj[v]].every((w) => col[w] !== c)) { col[v] = c; if (go(left - 1)) return true; col[v] = -1; }
    return false;
  };
  return go(n) ? col : null;
}

export function chromatic(n, edges) {
  for (let k = 1; k <= 6; k++) if (colourWith(n, edges, k)) return k;
  return null;
}

// The pairs of neighbours that have the same colour.
export const conflicts = (edges, col) => edges.filter(([i, j]) => col[i] >= 0 && col[i] === col[j]);

export function pointIn(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
