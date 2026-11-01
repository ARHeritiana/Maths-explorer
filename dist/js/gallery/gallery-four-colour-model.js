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
export function wheelMap(k = 5) {
  const inner = ring(320, 220, 70, k), outer = ring(320, 220, 190, k);
  const sectors = inner.map((p, i) => [p, outer[i], outer[(i + 1) % k], inner[(i + 1) % k]]);
  return [inner, ...sectors];
}

// Eight slices that all meet at the centre: two colours are enough, because touching at a point does not count.
export function pizzaMap(k = 8) {
  const rim = ring(320, 220, 190, k * 4, 0);
  return Array.from({ length: k }, (_, i) => [[320, 220], ...[0, 1, 2, 3, 4].map((j) => rim[(i * 4 + j) % rim.length])]);
}

export const blankMap = () => [[[24, 24], [616, 24], [616, 416], [24, 416]]];
export function gridMap() {
  return Array.from({ length: 9 }, (_, i) => {
    const x = 110 + (i % 3) * 140, y = 40 + Math.floor(i / 3) * 120;
    return [[x, y], [x + 140, y], [x + 140, y + 120], [x, y + 120]];
  });
}

// An Euler circuit of K5: every pair of letters shares exactly one border.
// Repeated letters are separate pieces of the SAME country, outside the theorem's hypotheses.
export function disconnectedMap() {
  const groups = [0, 1, 2, 0, 3, 1, 4, 2, 3, 4, 0];
  const map = groups.map((_, i) => {
    const x = 34 + i * 52;
    return [[x, 80], [x + 52, 80], [x + 52, 360], [x, 360]];
  });
  return { map, groups };
}

// One catalogue supplies the menu, descriptions and the exact displayed maps.
export const MAP_EXAMPLES = [
  { id: 'random', label: ['Carte aléatoire', 'Random map'],
    description: ['Une nouvelle mosaïque de pays. Essaie de la colorier avant de demander une solution.', 'A new mosaic of countries. Try colouring it before asking for a solution.'], make: (n, seed) => ({ map: randomMap(n, seed) }) },
  { id: 'grid', label: ['Damier : deux couleurs', 'Checkerboard: two colours'],
    description: ['Deux couleurs alternées suffisent. Les cases en diagonale ne partagent qu’un sommet.', 'Two alternating colours suffice. Diagonal squares only share a corner.'], make: () => ({ map: gridMap() }) },
  { id: 'triangle', label: ['Quatre pays tous voisins', 'Four mutually neighbouring countries'],
    description: ['Chaque pays touche les trois autres : il faut quatre couleurs. L’extérieur de la figure n’est pas un pays du jeu.', 'Every country touches the other three: four colours are necessary. The area outside the figure is not a country in this game.'], make: () => ({ map: wheelMap(3) }) },
  { id: 'wheel', label: ['Roue impaire : quatre couleurs', 'Odd wheel: four colours'],
    description: ['Les cinq pays de l’anneau demandent trois couleurs. Le pays central, voisin de chacun, en demande une quatrième.', 'The five countries of the ring need three colours. The central country borders all of them and needs a fourth.'], make: () => ({ map: wheelMap(5) }) },
  { id: 'even-wheel', label: ['Roue paire : trois couleurs', 'Even wheel: three colours'],
    description: ['Six pays entourent le centre. Deux couleurs alternent sur l’anneau et une troisième suffit au centre.', 'Six countries surround the centre. Two colours alternate around the ring and a third suffices in the centre.'], make: () => ({ map: wheelMap(6) }) },
  { id: 'pizza', label: ['Faux contre-exemple : huit pays au même point', 'Apparent counterexample: eight countries at one point'],
    description: ['Ces huit pays se touchent au centre, mais un point ne crée pas de voisinage. Deux couleurs suffisent.', 'These eight countries meet at the centre, but a point does not create adjacency. Two colours suffice.'], make: () => ({ map: pizzaMap(8) }) },
  { id: 'odd-pizza', label: ['Cinq secteurs : trois couleurs', 'Five sectors: three colours'],
    description: ['Cinq secteurs forment un cycle impair : deux couleurs échouent, trois suffisent. Aucun pays n’est voisin de tous les autres.', 'Five sectors form an odd cycle: two colours fail, three suffice. No country is adjacent to all the others.'], make: () => ({ map: pizzaMap(5) }) },
  { id: 'disconnected', label: ['Hors hypothèses : cinq pays morcelés', 'Outside the hypotheses: five disconnected countries'],
    description: ['Même lettre = même pays, même dans des morceaux séparés. Chaque paire de lettres partage une frontière : cinq couleurs sont nécessaires. Ce n’est pas un contre-exemple au théorème : les pays ne sont pas tous d’un seul tenant. La cinquième couleur est disponible uniquement ici.', 'Same letter = same country, even in separate pieces. Every pair of letters shares a border: five colours are necessary. This is not a counterexample to the theorem: the countries are not all connected. The fifth colour is available only here.'], make: disconnectedMap },
  { id: 'custom', label: ['Créer ma carte', 'Design my map'],
    description: ['Pars d’un seul pays, puis trace des frontières pour le partager. Les pays créés restent d’un seul tenant.', 'Start with one country, then draw borders to divide it. The countries you create remain connected.'], make: () => ({ map: blankMap() }) },
];

// Collapse polygon components into countries, preserving shared-border geometry for conflict highlighting.
export function countryEdges(map, groups = map.map((_, i) => i)) {
  const pairs = new Map();
  for (const [a, b, segments] of neighbours(map)) {
    const i = Math.min(groups[a], groups[b]), j = Math.max(groups[a], groups[b]);
    if (i === j) continue;
    const key = `${i},${j}`;
    if (!pairs.has(key)) pairs.set(key, [i, j, []]);
    pairs.get(key)[2].push(...segments);
  }
  return [...pairs.values()];
}

export const polygonArea = (poly) => Math.abs(poly.reduce((s, p, i) => {
  const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - p[1] * q[0];
}, 0)) / 2;

// Clip a convex country on either side of the drawn line. Extend to its borders; never create overlaps or islands.
export function splitCountry(poly, a, b) {
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 8) return null;
  const side = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const clip = (sign) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], sp = sign * side(p), sq = sign * side(q);
      if (sp >= 0) out.push([...p]);
      if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) {
        const f = sp / (sp - sq); out.push([p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1])]);
      }
    }
    return out;
  };
  const parts = [clip(1), clip(-1)];
  return parts.every((p) => p.length >= 3 && polygonArea(p) >= 80) ? parts : null;
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
