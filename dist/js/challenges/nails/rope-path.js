// Geometry of the rope of the nails challenge (pure, no DOM; tests/nails-rope.test.mjs). Coordinates are those of a 100 x 100 scene
// (nails on the line y = 14). A winding is a list of turns, +i = once around nail i clockwise, -i = anticlockwise.
// How the rope is laid out, so that one can read how it is attached: a turn is ONE arch over its nail (clockwise: up the left
// side, over the top, down the right side; anticlockwise: the other way), the k-th turn around a nail a little wider than the
// previous one, so arches are nested and never touch. Between two turns the rope either runs straight along the nail line
// (when it goes from one arch directly to the next without passing any nail: it does not dip) or goes below the nails on a
// level of its own where runs would overlap (when it has to pass under a nail). So the rope only ever meets itself at clean
// crossings. A turn can be "collapsed" (0 = on its nail, 1 = slipped off, lying on one slack line below the nails, which draws in over the frame as the picture falls): the animations only
// move this number.
export const NAIL_Y = 14, SLACK_Y = 24, FLOOR_Y = 95, FRAME = { x: 30, y: 46, w: 40, h: 26 };
export const nailX = (i, n) => 50 + (i - (n - 1) / 2) * (70 / Math.max(n, 2));
const R0 = 4, LANE_TOP = 22, LANE_BOTTOM = 40, CORNER = 1.4;

// radius of every turn: the k-th turn around a nail goes a little wider than the previous one. When a nail carries many
// turns the first arch tightens (down to 3) and the step shrinks, so the arches of neighbouring nails never meet; `step` tells
// how far apart they ended up (Infinity when no nail has two turns)
const CLEAR = 1.9;   // distance between two parallel passes at which the full-width rope still reads
export function radii(word, n = 4) {
  const total = {}; word.forEach((c) => { total[Math.abs(c)] = (total[Math.abs(c)] || 0) + 1; });
  const most = Math.max(1, ...Object.values(total)), room = 35 / Math.max(n, 2) - 1.1;
  const r0 = most > 1 ? Math.max(3, Math.min(R0, room - CLEAR * (most - 1))) : R0, step = most > 1 ? Math.min(2.4, (room - r0) / (most - 1)) : Infinity, count = {};
  const R = word.map((c) => { const i = Math.abs(c); count[i] = (count[i] || 0) + 1; return r0 + (most > 1 ? step : 0) * (count[i] - 1); });
  R.step = step;
  return R;
}

const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
// levels of the horizontal runs: run k joins turn k - 1 to turn k; it takes the first level no earlier overlapping run uses
function runLevels(spans) {
  const level = [];
  spans.forEach((span, k) => {
    if (!span) { level.push(-1); return; }   // a straight join along the nail line uses no level
    const [a, b] = span, lo = Math.min(a, b) - 1.2, hi = Math.max(a, b) + 1.2, used = new Set();
    for (let m = 0; m < k; m++) { if (!spans[m]) continue; const [c, e] = spans[m]; if (Math.min(c, e) - 1.2 < hi && Math.max(c, e) + 1.2 > lo) used.add(level[m]); }
    let l = 0; while (used.has(l)) l++;
    level.push(l);
  });
  return level;
}
// round the corners of a tagged polyline (points { p, j }) with radius rad, then cut it into short steps
function smooth(way, rad = CORNER, stepLen = 0.6) {
  const out = [way[0]];
  for (let i = 1; i + 1 < way.length; i++) {
    const a = way[i - 1].p, b = way[i].p, c = way[i + 1].p, la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const turn = la && lc ? ((a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])) / (la * lc) : -1;
    if (turn < -0.97) { out.push(way[i]); continue; }   // nearly straight: keep the point
    const r = Math.min(rad, la / 2, lc / 2), p = lerp(b, a, r / la), q = lerp(b, c, r / lc);
    for (let k = 0; k <= 5; k++) { const t = k / 5, u = 1 - t; out.push({ j: way[i].j, p: [u * u * p[0] + 2 * u * t * b[0] + t * t * q[0], u * u * p[1] + 2 * u * t * b[1] + t * t * q[1]] }); }
  }
  out.push(way.at(-1));
  const fine = [out[0]];
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1].p, b = out[i].p, parts = Math.max(1, Math.ceil(Math.hypot(a[0] - b[0], a[1] - b[1]) / stepLen));
    for (let k = 1; k <= parts; k++) fine.push({ j: out[i].j, p: lerp(a, b, k / parts) });
  }
  return fine;
}
// The rope as pieces: { j, pts } with j = -1 the start (from the left corner of the frame), then one piece per letter (the
// run that leads to its nail, then its arch), then the end (j = word.length, to the right corner). `collapse[j]` slips turn j;
// `dy`, `rot` move the corners with a falling picture; `fall` brings every run down onto one slack line above the frame.
// does the straight line along the nail line from x = a to x = b pass no nail?
export function isFlatJoin(a, b, n) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  for (let i = 0; i < n; i++) { const x = nailX(i, n); if (x > lo - 1e-9 && x < hi + 1e-9) return false; }
  return true;
}
export function rope(word, n, { collapse = [], dy = 0, rot = 0, fall = 0 } = {}) {
  const R = radii(word, n), cx = FRAME.x + FRAME.w / 2, cy = FRAME.y + dy, f = Math.min(1, fall), m = word.length;
  const corner = (side) => { const x = FRAME.x + (side ? FRAME.w : 0) - cx, a = (rot * Math.PI) / 180; return [cx + x * Math.cos(a), cy + x * Math.sin(a)]; };
  const L = corner(0), Rc = corner(1);
  if (!m) return [{ j: -1, pts: [L, [L[0] + 4, cy - 3], [Rc[0] - 4, cy - 3], Rc] }];
  const X = word.map((c) => nailX(Math.abs(c) - 1, n)), side = word.map((c) => (c > 0 ? 1 : -1));
  const inX = word.map((_, j) => X[j] - side[j] * R[j]), outX = word.map((_, j) => X[j] + side[j] * R[j]);
  // runs 1 .. m - 1 between two turns; the two ends of the rope leave below every run
  // join k (from turn k - 1 to turn k) runs straight along the nail line when no nail lies between its two ends (over one
  // nail, then directly over the next one: no dip); otherwise it goes under the nails on a level of its own
  const flat = word.map((_, k) => k > 0 && isFlatJoin(outX[k - 1], inX[k], n));
  const spans = []; for (let k = 1; k < m; k++) spans.push(flat[k] ? null : [outX[k - 1], inX[k]]);
  const level = runLevels(spans), top = Math.max(0, ...level), gap = Math.min(3.2, (LANE_BOTTOM - LANE_TOP) / Math.max(1, top + 1));
  const flatY = FRAME.y - 3 + dy, down = (y) => y + (flatY - y) * f;
  const runY = (k) => down(k < 1 || k >= m ? LANE_TOP + (top + 1) * gap + (spans.length ? 0.6 : 0) : LANE_TOP + level[k - 1] * gap);   // run k ends at turn k
  const way = [{ j: -1, p: L }];
  word.forEach((c, j) => {
    const s = collapse[j] || 0, yIn = runY(j), yOut = runY(j + 1), rest = [cx + (X[j] - cx) * (1 - 0.55 * f), runY(0)], put = (p, tag = j) => way.push({ j: tag, p: lerp(p, rest, s) });
    if (flat[j]) put([inX[j], NAIL_Y], j);
    else { put([inX[j], yIn], j ? j : -1); put([inX[j], NAIL_Y]); }
    for (let k = 1; k < 12; k++) { const a = (Math.PI * k) / 12; put([X[j] - side[j] * R[j] * Math.cos(a), NAIL_Y - R[j] * Math.sin(a)]); }
    put([outX[j], NAIL_Y]);
    if (!(j + 1 < m && flat[j + 1])) put([outX[j], yOut]);
  });
  way.push({ j: m, p: Rc });
  const pieces = [];
  pieces.thin = Math.max(0.45, Math.min(1, R.step / CLEAR, gap / CLEAR));   // a crowded winding is drawn with a thinner rope
  smooth(way).forEach(({ j, p }, k, all) => { if (!pieces.length || pieces.at(-1).j !== j) pieces.push({ j, pts: k ? [all[k - 1].p, p] : [p] }); else pieces.at(-1).pts.push(p); });
  return pieces;
}
