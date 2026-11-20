// Stellation and the Kepler–Poinsot solids (issue #35), pure. Keep the face planes of the dodecahedron (12 planes
// n·x = 1, n a unit vertex direction of the icosahedron) and extend the faces: the planes meet again at 12 points (the
// small stellated dodecahedron, whose faces are pentagrams, and the great dodecahedron, whose faces are pentagons through
// the same points) and then at 20 points (the great stellated dodecahedron). The face planes of the icosahedron give the
// great icosahedron. Faces cross each other: for drawing, each face is cut along every other face plane into convex
// pieces that only meet along edges (`pieces`), painted far to near. Tested in tests/gallery-stellation.test.mjs.
const PHI = (1 + Math.sqrt(5)) / 2, signs = [1, -1];
const allS = (v) => signs.flatMap((a) => signs.flatMap((b) => signs.map((c) => [v[0] * a, v[1] * b, v[2] * c])));
const ev = ([a, b, c]) => [[a, b, c], [b, c, a], [c, a, b]];
const uniq = (p) => { const m = new Map(); for (const x of p) m.set(x.map((v) => Math.round(v * 1e9)).join(), x); return [...m.values()]; };
const unit = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const det3 = (a, b, c) => dot(a, cross(b, c));

const ICO_DIRS = uniq(allS([0, 1, PHI]).flatMap(ev)).map(unit);                                        // 12: dodecahedron face normals
const DOD_DIRS = uniq([...allS([1, 1, 1]), ...allS([0, 1 / PHI, PHI]).flatMap(ev)]).map(unit);         // 20: icosahedron face normals

// Every point where three of the planes n·x = 1 meet, grouped by distance from the centre (nearest first).
export function meetingPoints(normals) {
  const pts = [];
  for (let i = 0; i < normals.length; i++) for (let j = i + 1; j < normals.length; j++) for (let k = j + 1; k < normals.length; k++) {
    const [a, b, c] = [normals[i], normals[j], normals[k]], D = det3(a, b, c); if (Math.abs(D) < 1e-9) continue;
    const s = cross(b, c).map((x, q) => x + cross(c, a)[q] + cross(a, b)[q]); pts.push(s.map((x) => x / D));
  }
  const groups = new Map(); for (const p of uniq(pts)) { const r = Math.hypot(...p).toFixed(6); groups.set(r, [...(groups.get(r) || []), p]); }
  return [...groups.entries()].map(([r, ps]) => ({ r: +r, points: ps })).sort((a, b) => a.r - b.r);
}

// The stages. normals: the fixed face planes; ring: which group of meeting points are the vertices; step: 1 joins the
// coplanar vertices of a face in turn (a polygon), 2 every second one (a star polygon {5/2}).
export const STAGES = {
  dodecahedron: { family: 'dod', ring: 0, step: 1, schlafli: '{5, 3}', names: ['Dodécaèdre', 'Dodecahedron'], density: 1 },
  'small-stellated': { family: 'dod', ring: 1, step: 2, schlafli: '{5/2, 5}', names: ['Petit dodécaèdre étoilé', 'Small stellated dodecahedron'], density: 3 },
  'great-dodecahedron': { family: 'dod', ring: 1, step: 1, schlafli: '{5, 5/2}', names: ['Grand dodécaèdre', 'Great dodecahedron'], density: 3 },
  'great-stellated': { family: 'dod', ring: 2, step: 2, schlafli: '{5/2, 3}', names: ['Grand dodécaèdre étoilé', 'Great stellated dodecahedron'], density: 7 },
  icosahedron: { family: 'ico', ring: 0, step: 1, schlafli: '{3, 5}', names: ['Icosaèdre', 'Icosahedron'], density: 1 },
  'great-icosahedron': { family: 'ico', ring: 'outer12', step: 1, schlafli: '{3, 5/2}', names: ['Grand icosaèdre', 'Great icosahedron'], density: 7 },
};
export const SEQUENCES = { dod: ['dodecahedron', 'small-stellated', 'great-dodecahedron', 'great-stellated'], ico: ['icosahedron', 'great-icosahedron'] };
const cache = new Map();
export function normalsOf(family) { return family === 'dod' ? ICO_DIRS : DOD_DIRS; }
export function stellation(id) {
  if (cache.has(id)) return cache.get(id);
  const st = STAGES[id], normals = normalsOf(st.family), groups = meetingPoints(normals);
  // the great icosahedron's vertices: the outermost group of 12 points, three in each plane
  const ring = st.ring === 'outer12' ? groups.filter((g) => g.points.length === 12).at(-1) : groups[st.ring];
  const verts = ring.points, faces = [];
  normals.forEach((n, i) => {
    const on = verts.map((v, k) => [v, k]).filter(([v]) => Math.abs(dot(n, v) - 1) < 1e-7).map(([, k]) => k);
    if (!on.length) return;
    const c = on.reduce((s, k) => s.map((x, q) => x + verts[k][q] / on.length), [0, 0, 0]), u = unit(sub(verts[on[0]], c)), w = cross(n, u);
    on.sort((a, b) => Math.atan2(dot(sub(verts[a], c), w), dot(sub(verts[a], c), u)) - Math.atan2(dot(sub(verts[b], c), w), dot(sub(verts[b], c), u)));
    const cycle = []; let at = 0; for (let m = 0; m < on.length; m++) { cycle.push(on[at]); at = (at + st.step) % on.length; }
    faces.push({ plane: i, normal: n, verts: cycle, centre: c, u, w });
  });
  const edges = new Set(); faces.forEach((f) => f.verts.forEach((a, i) => { const b = f.verts[(i + 1) % f.verts.length]; edges.add(a < b ? `${a}-${b}` : `${b}-${a}`); }));
  const out = { id, ...st, normals, verts, faces, edges: [...edges].map((e) => e.split('-').map(Number)), V: verts.length, E: edges.size, F: faces.length };
  out.chi = out.V - out.E + out.F;
  cache.set(id, out); return out;
}

// Winding number of the closed polygon `poly` (2D points) around p: 2 in the centre of a pentagram, 1 in its points.
export function winding(poly, p) {
  let w = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], cr = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (a[1] <= p[1]) { if (b[1] > p[1] && cr > 0) w++; } else if (b[1] <= p[1] && cr < 0) w--;
  }
  return w;
}
const to2 = (f, v) => [dot(sub(v, f.centre), f.u), dot(sub(v, f.centre), f.w)];
const to3 = (f, [x, y]) => [0, 1, 2].map((q) => f.centre[q] + x * f.u[q] + y * f.w[q]);
// Split a convex polygon by the line a·p = b; returns the parts on each side (empty parts dropped).
function split(poly, a, b) {
  const s = poly.map((p) => a[0] * p[0] + a[1] * p[1] - b), L = [], R = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], sp = s[i], sq = s[(i + 1) % poly.length];
    if (sp <= 1e-12) L.push(p); if (sp >= -1e-12) R.push(p);
    if ((sp < -1e-12 && sq > 1e-12) || (sp > 1e-12 && sq < -1e-12)) { const r = sp / (sp - sq), m = [p[0] + r * (q[0] - p[0]), p[1] + r * (q[1] - p[1])]; L.push(m); R.push(m); }
  }
  const area = (P) => { let A = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; A += p[0] * q[1] - q[0] * p[1]; } return Math.abs(A) / 2; };
  return [L, R].filter((P) => P.length >= 3 && area(P) > 1e-10);
}
// The drawable surface: every face cut along its own edges and along every other face plane into convex pieces; a piece
// is kept when it lies inside the face (non-zero winding). Each piece: {pts (3D), normal, face, wind}.
export function pieces(S) {
  if (S.pieces) return S.pieces;
  const out = [];
  for (const f of S.faces) {
    const poly = f.verts.map((k) => to2(f, S.verts[k])), lines = [];
    poly.forEach((a, i) => { const b = poly[(i + 1) % poly.length], n = [b[1] - a[1], a[0] - b[0]]; lines.push([n, n[0] * a[0] + n[1] * a[1]]); });
    for (const g of S.faces) {
      if (g === f) continue; const m = g.normal, a = [dot(m, f.u), dot(m, f.w)]; if (Math.hypot(...a) < 1e-9) continue;   // a parallel plane
      lines.push([a, 1 - dot(m, f.centre)]);
    }
    const r = Math.max(...poly.map((p) => Math.hypot(...p))) * 1.01;
    let cells = [[[-r, -r], [r, -r], [r, r], [-r, r]]];
    for (const [a, b] of lines) cells = cells.flatMap((c) => split(c, a, b));
    for (const c of cells) {
      const m = c.reduce((s, p) => [s[0] + p[0] / c.length, s[1] + p[1] / c.length], [0, 0]), wind = winding(poly, m);
      if (wind !== 0) out.push({ pts: c.map((p) => to3(f, p)), normal: f.normal, face: f.plane, wind: Math.abs(wind) });
    }
  }
  S.pieces = out; return out;
}
// Density: how many times the surface wraps round the centre, read along a ray from the centre (each crossing counts with
// the winding number of the face at that point).
export function density(S, dir = unit([0.3123, 0.5871, 0.7463])) {
  let n = 0;
  for (const f of S.faces) {
    const s = dot(f.normal, dir); if (s <= 1e-12) continue;
    const p = dir.map((x) => x / s), poly = f.verts.map((k) => to2(f, S.verts[k]));
    n += Math.abs(winding(poly, to2(f, p)));
  }
  return n;
}
// The stellation diagram of one face plane: the lines where the other planes cut it, in the plane's own coordinates, and
// the outline of the face of every stage of the family lying in that plane.
export function diagram(family, plane = 0) {
  const ids = SEQUENCES[family], S0 = stellation(ids[0]), f0 = S0.faces.find((f) => f.plane === plane);
  const lines = S0.normals.flatMap((m, j) => { if (j === plane) return []; const a = [dot(m, f0.u), dot(m, f0.w)]; return Math.hypot(...a) < 1e-9 ? [] : [[a, 1 - dot(m, f0.centre)]]; });
  const outlines = ids.map((id) => { const S = stellation(id), f = S.faces.find((g) => g.plane === plane); return f.verts.map((k) => to2(f0, S.verts[k])); });
  return { lines, outlines };
}
// Each vertex: how many faces meet there (the second number of the Schläfli symbol, counted).
export function facesAtVertex(S) { return S.verts.map((_, k) => S.faces.filter((f) => f.verts.includes(k)).length); }
