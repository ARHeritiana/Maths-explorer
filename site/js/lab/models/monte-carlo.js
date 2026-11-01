// Monte Carlo estimation: four problems (pi, the area of a lake, an integral, a random walk), one recipe. Pure maths, no DOM,
// no Math.random: every result is a function of (problem, parameters, seed, number of trials). The trials are drawn one after the
// other from a seeded stream, so a sampler can be advanced from n to n + k trials without redrawing the first n; asking for fewer
// trials than a cached sampler holds builds a new one, and the answer is the same either way.
//
// Honest labelling: the estimates are random; the reference value is exact where a closed form exists (pi, the polygon area,
// sin², the gambler's ruin L / (U + L)) and a numerical quadrature otherwise (the gaussian integral and the spike, Simpson with
// 8000 panels, error far below the digits shown). The interval is approximate: Wilson for a proportion (pi, lake, walk), normal
// with the sample variance for a mean (integral). It can be too narrow for a rare, spiky function.
import { rng } from "./probability.js";

// The ceiling of runs of this page: 10,000, or more on a device that proved it can afford it (setMaxRuns, device-capability.js).
export const BASE_MAX_RUNS = 10000;
export let MAX_RUNS = BASE_MAX_RUNS;
export const setMaxRuns = (n) => { MAX_RUNS = Math.max(BASE_MAX_RUNS, Math.floor(n)); };
export const SHOWN = 600;          // points of the last trials kept for the drawing
export const SHOWN_WALKS = 12;     // paths of the last walks kept for the drawing
export const MIN_INTERVAL = 30;    // no interval under 30 trials
export const Z95 = 1.959963984540054;
export const WALK_STEP_CAP = 100000;
export const LAKE_UNITS = 100;     // the map is 10 km x 10 km

// ---- intervals
// Wilson interval of a proportion, as fractions.
export function wilson(hits, n, z = Z95) {
  if (!(n > 0)) return null;
  const p = hits / n, den = 1 + (z * z) / n, mid = (p + (z * z) / (2 * n)) / den;
  const half = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / den;
  return [Math.max(0, mid - half), Math.min(1, mid + half)];
}
// Normal interval of a mean from the sample variance (n - 1), clipped at 0 because the integrands are nonnegative.
export function normalInterval(mean, m2, n, z = Z95) {
  if (!(n > 1)) return null;
  const variance = Math.max(0, m2 / (n - 1)), margin = z * Math.sqrt(variance / n);
  return [Math.max(0, mean - margin), mean + margin];
}

// ---- the integrands: f, the interval [0, b], the way to write them
export const INTEGRANDS = {
  gauss: { f: (x) => Math.exp(-x * x), b: 2, exact: null },
  sine: { f: (x) => Math.sin(Math.PI * x) ** 2, b: 1, exact: 0.5 },
  spike: { f: (x) => Math.exp(-650 * (x - 0.72) ** 2), b: 1, exact: null },
};
const referenceCache = {};
export function integralReference(fn) {
  const g = INTEGRANDS[fn];
  if (!g) throw new RangeError("fn");
  if (g.exact !== null) return g.exact;
  if (referenceCache[fn] === undefined) {
    const m = 8000, h = g.b / m;   // Simpson
    let acc = g.f(0) + g.f(g.b);
    for (let i = 1; i < m; i++) acc += g.f(i * h) * (i % 2 ? 4 : 2);
    referenceCache[fn] = (acc * h) / 3;
  }
  return referenceCache[fn];
}

// ---- the lake: polygons in the unit square of the map
const DEFAULT_SHORE = (() => {
  const a = [];
  for (let i = 0; i < 170; i++) {
    const t = (2 * Math.PI * i) / 170, r = 0.333 + 0.068 * Math.sin(3 * t + 0.2) + 0.045 * Math.cos(5 * t - 0.45) + 0.025 * Math.sin(8 * t + 1.4);
    a.push([0.505 + r * Math.cos(t), 0.51 + 0.83 * r * Math.sin(t)]);
  }
  return a;
})();
export const LAKE_PRESETS = {
  default: DEFAULT_SHORE,
  disc: Array.from({ length: 120 }, (_, i) => { const t = (2 * Math.PI * i) / 120; return [0.5 + 0.35 * Math.cos(t), 0.5 + 0.35 * Math.sin(t)]; }),
  square: [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8]],
  ell: [[0.15, 0.15], [0.85, 0.15], [0.85, 0.45], [0.45, 0.45], [0.45, 0.85], [0.15, 0.85]],
};
export const LAKE_SHAPES = ["default", "disc", "square", "ell", "custom"];
export function polygonArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]; a += x1 * y2 - x2 * y1; }
  return Math.abs(a) / 2;
}
export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}
export function lakePolygon(s) {
  if (s.shape === "custom") return Array.isArray(s.poly) && s.poly.length >= 3 ? s.poly : LAKE_PRESETS.default;
  return LAKE_PRESETS[s.shape] || LAKE_PRESETS.default;
}
export const lakeArea = (s) => LAKE_UNITS * polygonArea(lakePolygon(s));

// Segments that touch or cross (closed segments, so a shared point or a collinear overlap counts).
function segmentsMeet(a, b, c, d) {
  const cross = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const on = (p, q, r) => Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
  const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return (d1 === 0 && on(a, b, c)) || (d2 === 0 && on(a, b, d)) || (d3 === 0 && on(c, d, a)) || (d4 === 0 && on(c, d, b));
}
export function selfIntersects(poly) {
  const n = poly.length;
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    if (segmentsMeet(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return true;
  }
  return false;
}
// A hand-drawn trace (points of the unit square) becomes a polygon, or null when it is too short, too small, open or crosses itself.
export function polygonFromTrace(points) {
  if (!Array.isArray(points) || points.length < 12) return null;
  const clean = points.map(([x, y]) => [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))]);
  // an open stroke (a C, an arc) is not a lake: the end must come back near the start (within 0.12 of the map side)
  if (Math.hypot(clean.at(-1)[0] - clean[0][0], clean.at(-1)[1] - clean[0][1]) > 0.12) return null;
  const step = Math.max(1, Math.floor(clean.length / 250));
  const poly = clean.filter((_, i) => i % step === 0);
  const deduped = poly.filter((p, i) => i === 0 || p[0] !== poly[i - 1][0] || p[1] !== poly[i - 1][1]);
  // a loop closed by returning to its start: the last points on the first one are the same vertex
  while (deduped.length > 3 && Math.hypot(deduped.at(-1)[0] - deduped[0][0], deduped.at(-1)[1] - deduped[0][1]) < 0.01) deduped.pop();
  if (deduped.length < 3 || polygonArea(deduped) <= 0.002 || selfIntersects(deduped)) return null;
  return deduped;
}

// ---- the walk
export const walkReference = (upper, lower) => lower / (upper + lower);

// ---- the samplers
// n up to 10,000: as before; above, the spacing grows with the size of n so that 10 million trials keep about a thousand checkpoints
const checkpoint = (n) => n <= 100 || (n <= 10000 ? n % 20 === 0 : n % 10 ** (Math.floor(Math.log10(n)) - 2) === 0);
function trialFor(kind, params) {
  if (kind === "pi") return (next) => { const x = 2 * next() - 1, y = 2 * next() - 1, hit = x * x + y * y <= 1; return { hit, x: (x + 1) / 2, y: (y + 1) / 2 }; };
  if (kind === "lake") {
    const poly = params.poly;
    return (next) => { const x = next(), y = next(); return { hit: pointInPolygon(x, y, poly), x, y }; };
  }
  if (kind === "integral") {
    const g = INTEGRANDS[params.fn];
    return (next) => { const x = next() * g.b, f = g.f(x); return { value: g.b * f, x: x / g.b, height: f }; };
  }
  if (kind === "walk") {
    const { upper, lower } = params;
    return (next) => {
      let v = 0; const path = [0];
      for (let k = 0; k < WALK_STEP_CAP; k++) { v += next() < 0.5 ? 1 : -1; path.push(v); if (v >= upper || v <= -lower) break; }
      return { hit: v >= upper, path };
    };
  }
  throw new RangeError("kind");
}
const estimateOf = (kind, S) => {
  if (!S.n) return null;
  if (kind === "pi") return (4 * S.hits) / S.n;
  if (kind === "lake") return (LAKE_UNITS * S.hits) / S.n;
  if (kind === "walk") return S.hits / S.n;
  return S.mean * 1;
};
export function createSampler(kind, params, seed, { track = true } = {}) {
  const next = rng(seed), trial = trialFor(kind, params);
  const S = { kind, n: 0, hits: 0, mean: 0, m2: 0, points: [], walks: [], history: [], advance };
  function advance(k) {
    // only the last SHOWN trials (SHOWN_WALKS walks) are kept for the drawing: earlier ones are not recorded at all
    const keepFrom = track ? k - (kind === "walk" ? SHOWN_WALKS : SHOWN) : Infinity;
    for (let i = 0; i < k; i++) {
      const t = trial(next);
      S.n++;
      if (kind === "integral") { const d = t.value - S.mean; S.mean += d / S.n; S.m2 += d * (t.value - S.mean); }
      else if (t.hit) S.hits++;
      if (track) {
        if (i >= keepFrom) {
          if (kind === "walk") S.walks.push({ path: t.path, success: t.hit });
          else S.points.push(kind === "integral" ? { x: t.x, value: t.height } : { x: t.x, y: t.y, inside: t.hit });
        }
        if (checkpoint(S.n)) S.history.push([S.n, estimateOf(kind, S)]);
      }
    }
    if (S.walks.length > SHOWN_WALKS) S.walks.splice(0, S.walks.length - SHOWN_WALKS);
    if (S.points.length > SHOWN) S.points.splice(0, S.points.length - SHOWN);
    return S;
  }
  return S;
}

const cache = new Map();
function sampler(kind, params, seed, runs) {
  const key = kind + "|" + JSON.stringify(params) + "|" + seed;
  let S = cache.get(key);
  if (!S || S.n > runs) { S = createSampler(kind, params, seed); }
  cache.delete(key); cache.set(key, S);
  if (cache.size > 12) cache.delete(cache.keys().next().value);
  S.advance(runs - S.n);
  return S;
}
const clampRuns = (runs) => { if (!Number.isInteger(runs) || runs < 0 || runs > MAX_RUNS) throw new RangeError("runs"); return runs; };

function proportionIntervals(S, scale) {
  const w = S.n >= MIN_INTERVAL ? wilson(S.hits, S.n) : null;
  return w ? [w[0] * scale, w[1] * scale] : null;
}
const finish = (S, reference, interval, extra = {}) => {
  const estimate = estimateOf(S.kind, S);
  const covered = interval && estimate !== null ? interval[0] <= reference && reference <= interval[1] : null;
  return { runs: S.n, n: S.n, hits: S.hits, estimate, reference, error: estimate === null ? null : Math.abs(estimate - reference),
    interval, covered, history: S.history.slice(), ...extra };
};

export function pi(s) {
  const { runs = 0, seed = 1 } = s; clampRuns(runs);
  const S = sampler("pi", {}, seed, runs), p = Math.PI / 4;
  return finish(S, Math.PI, proportionIntervals(S, 4), { points: S.points.slice(), probability: p, standardError: S.n ? 4 * Math.sqrt(p * (1 - p) / S.n) : null });
}
export function lake(s) {
  const { runs = 0, seed = 1 } = s; clampRuns(runs);
  const poly = lakePolygon(s), S = sampler("lake", { poly }, seed, runs), reference = LAKE_UNITS * polygonArea(poly), p = reference / LAKE_UNITS;
  return finish(S, reference, proportionIntervals(S, LAKE_UNITS), { points: S.points.slice(), poly, probability: p, standardError: S.n ? LAKE_UNITS * Math.sqrt(p * (1 - p) / S.n) : null });
}
export function integral(s) {
  const { runs = 0, seed = 1, fn = "gauss" } = s; clampRuns(runs);
  const g = INTEGRANDS[fn]; if (!g) throw new RangeError("fn");
  const S = sampler("integral", { fn }, seed, runs), reference = integralReference(fn);
  const interval = S.n >= MIN_INTERVAL ? normalInterval(S.mean, S.m2, S.n) : null;
  return finish(S, reference, interval, { points: S.points.slice(), meanHeight: S.n ? S.mean / g.b : null, b: g.b,
    standardError: S.n > 1 ? Math.sqrt(S.m2 / (S.n - 1) / S.n) : null });
}
export function walk(s) {
  const { runs = 0, seed = 1, upper = 5, lower = 3 } = s; clampRuns(runs);
  if (!Number.isInteger(upper) || !Number.isInteger(lower) || upper < 1 || lower < 1 || upper > 20 || lower > 20) throw new RangeError("boundaries");
  const S = sampler("walk", { upper, lower }, seed, runs), reference = walkReference(upper, lower), p = reference;
  return finish(S, reference, proportionIntervals(S, 1), { walks: S.walks.slice(), probability: p, standardError: S.n ? Math.sqrt(p * (1 - p) / S.n) : null });
}

export const MODELS = { pi, lake, integral, walk };
// The quantities the `check` missions ask for.
export const quantities = {
  pi: { benchmark: () => Math.PI, standardError: (s) => pi(s).standardError, hits: (s) => pi(s).hits },
  lake: { benchmark: (s) => lakeArea(s), standardError: (s) => lake(s).standardError },
  integral: { benchmark: (s) => integralReference(s.fn), standardError: (s) => integral(s).standardError },
  walk: { benchmark: (s) => walkReference(s.upper, s.lower), standardError: (s) => walk(s).standardError },
};
