// Self-similar fractals built stage by stage (issue #36): Cantor set, Koch snowflake, Sierpiński carpet, Menger sponge and
// Sierpiński tetrahedron. Pure: the pieces of stage n and the exact facts of each stage (pieces, scale, measure, dimension).
// Every one of the five satisfies the open set condition, so its Hausdorff dimension equals the similarity dimension
// log N / log(1/r) (Moran 1946, Hutchinson 1981). Tested in tests/gallery-selfsimilar.test.mjs.

// N copies at ratio r; E the dimension of the space it lives in; measure: what an ordinary measure of stage n is called.
export const FRACTALS = {
  cantor: { N: 2, r: 1 / 3, E: 1, max: 8, measure: ['longueur', 'length'] },
  koch: { N: 4, r: 1 / 3, E: 2, max: 6, measure: ['périmètre', 'perimeter'] },
  carpet: { N: 8, r: 1 / 3, E: 2, max: 5, measure: ['aire', 'area'] },
  menger: { N: 20, r: 1 / 3, E: 3, max: 3, measure: ['volume', 'volume'] },
  tetrix: { N: 4, r: 1 / 2, E: 3, max: 5, measure: ['volume', 'volume'] },
};
export const FRACTAL_IDS = Object.keys(FRACTALS);

export const similarityDim = (id) => { const F = FRACTALS[id]; return Math.log(F.N) / Math.log(1 / F.r); };

// Facts of stage n, as ratios to stage 0 (an interval, a triangle, a square, a cube, a tetrahedron of size 1).
// pieces: copies of the base piece (Koch: segments of the outline); scale: their size; measure: length, area or volume
// kept; limit: the limit of the measure as n grows (Infinity for the Koch perimeter). Koch also gives the enclosed area.
export function stageFacts(id, n) {
  const F = FRACTALS[id], pieces = (id === 'koch' ? 3 : 1) * F.N ** n, scale = F.r ** n;
  const out = { pieces, scale, dim: similarityDim(id) };
  if (id === 'koch') { out.measure = (4 / 3) ** n; out.limit = Infinity; out.area = 8 / 5 - (3 / 5) * (4 / 9) ** n; out.areaLimit = 8 / 5; }
  else { out.measure = F.N ** n * scale ** F.E; out.limit = 0; }
  if (id === 'tetrix') out.surface = 1;   // four copies at half size: the total surface area of the faces never changes
  return out;
}

// Cantor set: the intervals [a, b] of stage n inside [0, 1].
export function cantorIntervals(n) {
  let I = [[0, 1]];
  for (let k = 0; k < n; k++) I = I.flatMap(([a, b]) => { const d = (b - a) / 3; return [[a, a + d], [b - d, b]]; });
  return I;
}

// Koch snowflake: the closed outline of stage n, starting from an equilateral triangle of side 1 (points turn clockwise
// on screen with y downwards, so each bump points outwards).
export function kochSnowflake(n) {
  const h = Math.sqrt(3) / 2;
  let P = [[0, 0], [1, 0], [0.5, h]];
  // outward bumps: with these vertices in counter-clockwise order (y up), the bump of a side a→b is on its right
  for (let k = 0; k < n; k++) {
    const Q = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], d = [(b[0] - a[0]) / 3, (b[1] - a[1]) / 3];
      const p1 = [a[0] + d[0], a[1] + d[1]], p2 = [a[0] + 2 * d[0], a[1] + 2 * d[1]];
      // apex: p1 + d turned by −60° (to the right of a→b)
      const c = 0.5, s = -h, apex = [p1[0] + d[0] * c - d[1] * s, p1[1] + d[0] * s + d[1] * c];
      Q.push(a, p1, apex, p2);
    }
    P = Q;
  }
  return P;
}
// Signed area of a closed polygon (shoelace).
export const polyArea = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };

// Sierpiński carpet: the holes cut up to stage n, as squares [x, y, side] in the unit square (the carpet is the unit square
// minus these). There are (8ⁿ − 1)/7 of them.
export function carpetHoles(n) {
  const out = [];
  const rec = (x, y, s, k) => { if (k === 0) return; const t = s / 3; out.push([x + t, y + t, t]); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i !== 1 || j !== 1) rec(x + i * t, y + j * t, t, k - 1); };
  rec(0, 0, 1, n);
  return out;
}

// Menger sponge: the kept cells (integer coordinates in a 3ⁿ grid). A cell is removed when, at some level, two or more of
// its three base-3 digits equal 1.
export function mengerKept(x, y, z) {
  while (x || y || z) { if ((x % 3 === 1) + (y % 3 === 1) + (z % 3 === 1) >= 2) return false; x = Math.floor(x / 3); y = Math.floor(y / 3); z = Math.floor(z / 3); }
  return true;
}
export function mengerCells(n) {
  const m = 3 ** n, out = [];
  for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) for (let z = 0; z < m; z++) if (mengerKept(x, y, z)) out.push([x, y, z]);
  return out;
}
// The visible square faces of stage n: faces of kept cells whose neighbour across that face is not kept (or is outside).
// Each face: {c: centre, n: outward normal axis and sign} in a cube of side 1 centred at the origin.
export function mengerFaces(n) {
  const m = 3 ** n, s = 1 / m, cells = mengerCells(n), key = new Set(cells.map(([x, y, z]) => (x * m + y) * m + z)), faces = [];
  const has = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < m && y < m && z < m && key.has((x * m + y) * m + z);
  for (const [x, y, z] of cells) for (const [ax, sg] of [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]]) {
    const q = [x, y, z]; q[ax] += sg;
    if (has(...q)) continue;
    const c = [(x + 0.5) * s - 0.5, (y + 0.5) * s - 0.5, (z + 0.5) * s - 0.5]; c[ax] += sg * s / 2;
    faces.push({ c, ax, sg, s });
  }
  return faces;
}

// Sierpiński tetrahedron: the corners of the 4ⁿ small tetrahedra of stage n, from a regular tetrahedron of edge 1.
export const TETRA = [[0, 0, 0], [1, 0, 0], [0.5, Math.sqrt(3) / 2, 0], [0.5, Math.sqrt(3) / 6, Math.sqrt(2 / 3)]];
export function tetrixPieces(n) {
  let T = [TETRA];
  for (let k = 0; k < n; k++) T = T.flatMap((V) => V.map((a) => V.map((b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2])));
  return T;
}
export const tetraVolume = (V) => { const [a, b, c, d] = V, u = b.map((x, i) => x - a[i]), v = c.map((x, i) => x - a[i]), w = d.map((x, i) => x - a[i]); return Math.abs(u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0])) / 6; };
