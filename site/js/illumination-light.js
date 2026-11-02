// What a lamp lights in a mirrored room, estimated from beams rather than from single rays (pure, no DOM; tests in
// tests/illumination-light.test.mjs). Two neighbouring rays that meet the same walls in the same order bound a beam: the
// quadrilateral between their k-th segments is lit. Where the two rays part (another wall, a corner), the angle between them is
// halved and the halves are examined again, down to `depth` halvings and within a `budget` of traced rays. The lit quadrilaterals
// are then counted on a grid of the room: what no beam reaches after `bounces` reflections is reported as dark patches.
// This is evidence from finitely many directions and reflections, never a proof that a region is dark.
import { trace, flatten, inside, pointAt, MAX_BOUNCES } from './illumination-model.js';

const TAU = 2 * Math.PI;
export const STRIDE = 9;

// Beams of light from `source` after at most `bounces` reflections.
// rays: evenly spaced starting directions; gap: largest distance allowed between the two ends of a beam segment before the
// beam is split (room units); returns quads as a flat Float64Array (STRIDE = 9 numbers per quad: a_k, a_k+1, b_k+1, b_k, then k,
// the number of reflections before that piece of light) and the count
// of traced rays; `exhausted` says the budget stopped a refinement (the picture is then coarser).
export function lightBeams(edges, source, { rays = 720, bounces = 20, angle = 0, depth = 6, budget = 6000, gap = Infinity } = {}) {
  const K = Math.max(0, Math.min(MAX_BOUNCES - 1, Math.floor(bounces)));
  let traced = 0, exhausted = false, quads = new Float64Array(4096 * STRIDE), n = 0;
  const ray = (theta) => { traced++; const p = trace(edges, source, [Math.cos(theta), Math.sin(theta)], K + 1); return { theta, points: p.points, hits: p.hits }; };
  const push = (a, b, c, d, k) => {
    if ((n + 1) * STRIDE > quads.length) { const q = new Float64Array(quads.length * 2); q.set(quads); quads = q; }
    const o = n * STRIDE; quads[o] = a[0]; quads[o + 1] = a[1]; quads[o + 2] = b[0]; quads[o + 3] = b[1]; quads[o + 4] = c[0]; quads[o + 5] = c[1]; quads[o + 6] = d[0]; quads[o + 7] = d[1]; quads[o + 8] = k; n++;
  };
  // segment k of a path runs from points[k] to points[k+1] and ends on wall hits[k] (trace was asked for one reflection more).
  // Splits wait in a first-in first-out queue, so a limited budget refines every beam to the same depth before going deeper.
  const queue = [];
  function emit(a, b, k0, d) {
    for (let k = k0; k <= K; k++) {
      const ea = a.hits[k], eb = b.hits[k], both = a.points.length > k + 1 && b.points.length > k + 1;
      if (!both) return;
      const pa = a.points[k + 1], pb = b.points[k + 1], same = ea !== undefined && ea === eb, wide = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) > gap;
      if (same && (!wide || d <= 0 || traced >= budget)) { push(a.points[k], pa, pb, b.points[k], k); continue; }
      if (d <= 0 || traced >= budget) { if (traced >= budget) exhausted = true; return; }
      queue.push([a, b, k, d]); return;
    }
  }
  const base = [];
  for (let i = 0; i < rays; i++) base.push(ray(angle + i * TAU / rays));
  for (let i = 0; i < rays; i++) {
    const a = base[i], b = i + 1 < rays ? base[i + 1] : { ...base[0], theta: base[0].theta + TAU };
    if (rays > 1) emit(a, b, 0, depth);
  }
  for (let head = 0; head < queue.length; head++) {
    const [a, b, k, d] = queue[head]; queue[head] = null;
    if (traced >= budget) { exhausted = true; emitCoarse(a, b, k); continue; }
    const m = ray((a.theta + b.theta) / 2);
    emit(a, m, k, d - 1); emit(m, b, k, d - 1);
  }
  // budget spent: keep only what two rays certainly share (same walls), however wide the beam
  function emitCoarse(a, b, k0) {
    for (let k = k0; k <= K; k++) {
      if (!(a.points.length > k + 1 && b.points.length > k + 1) || a.hits[k] === undefined || a.hits[k] !== b.hits[k]) return;
      push(a.points[k], a.points[k + 1], b.points[k + 1], b.points[k], k);
    }
  }
  return { quads: quads.slice(0, n * STRIDE), count: n, traced, exhausted, bounces: K };
}

// A grid over `bounds` = [x0, x1, y0, y1] with about `res` cells along the longer side. `insideMask` marks the cells whose
// centre is in the room (cached per edge list).
const masks = new WeakMap();
export function roomGrid(edges, bounds, res = 300) {
  const key = bounds.join(',') + '|' + res, cached = masks.get(edges);
  if (cached && cached.key === key) return cached.grid;
  const [x0, x1, y0, y1] = bounds, h = Math.max(x1 - x0, y1 - y0) / res, cols = Math.ceil((x1 - x0) / h), rows = Math.ceil((y1 - y0) / h);
  const poly = flatten(edges, 48), mask = new Uint8Array(cols * rows);
  let cellsInside = 0;
  for (let r = 0; r < rows; r++) {
    const y = y0 + (r + 0.5) * h, xs = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    xs.sort((p, q) => p - q);
    for (let s = 0; s + 1 < xs.length; s += 2) {
      const c0 = Math.max(0, Math.ceil((xs[s] - x0) / h - 0.5)), c1 = Math.min(cols - 1, Math.floor((xs[s + 1] - x0) / h - 0.5));
      for (let c = c0; c <= c1; c++) { mask[r * cols + c] = 1; cellsInside++; }
    }
  }
  const grid = { x0, y0, h, cols, rows, mask, cellsInside };
  masks.set(edges, { key, grid });
  return grid;
}

// For every cell, the fewest reflections after which a beam covers its centre (NEVER when none does): one pass over the quads gives
// the lit floor after 0, 1, 2... reflections (even-odd inside each quad, so a quad whose two rays cross still counts its two lobes).
export const NEVER = 65535;
export function rasterLevels(grid, quads) {
  const { x0, y0, h, cols, rows } = grid, level = new Uint16Array(cols * rows).fill(NEVER), xs = [0, 0, 0, 0];
  for (let o = 0; o < quads.length; o += STRIDE) {
    const k = Math.min(NEVER - 1, quads[o + 8]);
    let ymin = Infinity, ymax = -Infinity;
    for (let v = 1; v < 8; v += 2) { if (quads[o + v] < ymin) ymin = quads[o + v]; if (quads[o + v] > ymax) ymax = quads[o + v]; }
    const r0 = Math.max(0, Math.ceil((ymin - y0) / h - 0.5)), r1 = Math.min(rows - 1, Math.floor((ymax - y0) / h - 0.5));
    for (let r = r0; r <= r1; r++) {
      const y = y0 + (r + 0.5) * h; let m = 0;
      for (let v = 0; v < 4; v++) {
        const ax = quads[o + 2 * v], ay = quads[o + 2 * v + 1], w = (v + 1) % 4, bx = quads[o + 2 * w], by = quads[o + 2 * w + 1];
        if ((ay > y) !== (by > y)) xs[m++] = ax + (y - ay) * (bx - ax) / (by - ay);
      }
      if (m < 2) continue;
      if (m === 2) { if (xs[0] > xs[1]) { const z = xs[0]; xs[0] = xs[1]; xs[1] = z; } }
      else { const t = xs.slice(0, m).sort((p, q) => p - q); for (let i = 0; i < m; i++) xs[i] = t[i]; }
      for (let s = 0; s + 1 < m; s += 2) {
        const c0 = Math.max(0, Math.ceil((xs[s] - x0) / h - 0.5)), c1 = Math.min(cols - 1, Math.floor((xs[s + 1] - x0) / h - 0.5)), row = r * cols;
        for (let c = c0; c <= c1; c++) if (level[row + c] > k) level[row + c] = k;
      }
    }
  }
  return level;
}
// The cells lit after at most `upTo` reflections (1) and the others (0).
export function litUpTo(level, upTo = Infinity) { const lit = new Uint8Array(level.length); for (let i = 0; i < level.length; i++) lit[i] = level[i] !== NEVER && level[i] <= upTo ? 1 : 0; return lit; }
export const rasterQuads = (grid, quads, upTo = Infinity) => litUpTo(rasterLevels(grid, quads), upTo);

// Everything the page shows about the light, computed in one go (in a worker): the beams, the grid over the room (about `res` cells
// along its longer side) and the reflection level of each cell.
export function lightMap(edges, source, options = {}, res = 320) {
  const beams = lightBeams(edges, source, options), q = flatten(edges, 24);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of q) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const pad = 0.02 * Math.max(x1 - x0, y1 - y0), grid = roomGrid(edges, [x0 - pad, x1 + pad, y0 - pad, y1 + pad], res);
  return { grid: { ...grid }, level: rasterLevels(grid, beams.quads), count: beams.count, traced: beams.traced, exhausted: beams.exhausted, bounces: beams.bounces };
}

// Lit share of the floor and the dark patches (4-connected unlit cells inside the room), largest first. A patch of fewer than
// `minCells` cells is counted in the share but not listed (a sliver of the size of a cell says nothing).
// `marks`: also return `dark`, the cells of the listed patches (the page hatches them).
export function coverage(grid, lit, { minCells = 6, marks = false } = {}) {
  const { mask, cols, rows, h, x0, y0, cellsInside } = grid, seen = new Uint8Array(cols * rows), patches = [], dark = marks ? new Uint8Array(cols * rows) : null, cells = [];
  let litInside = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] && lit[i]) litInside++;
  const stack = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || lit[i] || seen[i]) continue;
    let count = 0, sx = 0, sy = 0, cmin = cols, cmax = 0, rmin = rows, rmax = 0; stack.push(i); seen[i] = 1; cells.length = 0;
    while (stack.length) {
      const j = stack.pop(), r = (j / cols) | 0, c = j - r * cols; count++; sx += c; sy += r; if (dark) cells.push(j);
      if (c < cmin) cmin = c; if (c > cmax) cmax = c; if (r < rmin) rmin = r; if (r > rmax) rmax = r;
      const next = [c > 0 ? j - 1 : -1, c < cols - 1 ? j + 1 : -1, r > 0 ? j - cols : -1, r < rows - 1 ? j + cols : -1];
      for (const q of next) if (q >= 0 && mask[q] && !lit[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
    }
    if (count >= minCells && dark) for (const j of cells) dark[j] = 1;
    if (count >= minCells) patches.push({ cells: count, area: count * h * h, share: count / Math.max(1, cellsInside),
      centre: [x0 + (sx / count + 0.5) * h, y0 + (sy / count + 0.5) * h],
      box: [x0 + cmin * h, x0 + (cmax + 1) * h, y0 + rmin * h, y0 + (rmax + 1) * h] });
  }
  patches.sort((a, b) => b.cells - a.cells);
  return { litShare: cellsInside ? litInside / cellsInside : 0, darkShare: cellsInside ? 1 - litInside / cellsInside : 0, patches, cellsInside, area: cellsInside * h * h, dark };
}

// Pairs of walls that cross or overlap (curved walls flattened finely). Neighbouring walls share an end and are skipped there.
// `closed` false: the closing wall from the last vertex to the first is not part of the room yet.
export function crossings(edges, closed = true) {
  const segs = [];
  edges.forEach((e, i) => { const steps = e.type === 'line' ? 1 : 24; for (let s = 0; s < steps; s++) segs.push({ e: i, a: pointAt(e, s / steps), b: pointAt(e, (s + 1) / steps) }); });
  const n = edges.length, bad = new Set(), pairs = [];
  const adjacent = (i, j) => i === j || Math.abs(i - j) === 1 || (closed && n > 2 && Math.abs(i - j) === n - 1);
  const cr = (u, v) => u[0] * v[1] - u[1] * v[0];
  for (let p = 0; p < segs.length; p++) for (let q = p + 1; q < segs.length; q++) {
    const s = segs[p], r = segs[q]; if (adjacent(s.e, r.e)) continue;
    const v = [s.b[0] - s.a[0], s.b[1] - s.a[1]], w = [r.b[0] - r.a[0], r.b[1] - r.a[1]], ca = [r.a[0] - s.a[0], r.a[1] - s.a[1]], den = cr(v, w);
    let hit = false;
    if (Math.abs(den) < 1e-12) { if (Math.abs(cr(ca, v)) < 1e-9) { const vv = v[0] * v[0] + v[1] * v[1] || 1, lo = (ca[0] * v[0] + ca[1] * v[1]) / vv, hi = ((r.b[0] - s.a[0]) * v[0] + (r.b[1] - s.a[1]) * v[1]) / vv; hit = Math.min(1, Math.max(lo, hi)) - Math.max(0, Math.min(lo, hi)) > 1e-9; } }
    else { const u = cr(ca, w) / den, t = cr(ca, v) / den; hit = u >= -1e-9 && u <= 1 + 1e-9 && t >= -1e-9 && t <= 1 + 1e-9; }
    if (hit) { const key = s.e + ',' + r.e; if (!bad.has(key)) { bad.add(key); pairs.push([s.e, r.e]); } }
  }
  return pairs;
}

// Nearest point of a segment and the parameter there (editor: insert a vertex on a wall).
export function nearestOnSegment(p, a, b) {
  const v = [b[0] - a[0], b[1] - a[1]], L = v[0] * v[0] + v[1] * v[1];
  const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L)) : 0, q = [a[0] + t * v[0], a[1] + t * v[1]];
  return { t, point: q, distance: Math.hypot(p[0] - q[0], p[1] - q[1]) };
}

export const snapTo = (p, step) => (step > 0 ? p.map((x) => Math.round(x / step) * step) : p.slice());
export const lampInside = (edges, p) => inside(p, flatten(edges, 48));
