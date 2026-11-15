// Pure geometry of the town map of the konigsberg challenge (no DOM): land masses separated by water, bridges crossing it.
// Network 0 is Königsberg as in Euler's 1736 problem (the Pregel round the Kneiphof island, the eastern land between its two
// branches, the north and south banks, seven bridges). Networks 1 to 98 become a town cut by river arms: one land mass per
// district (a land touching the edge of the map is a bank, the others are islands), the arms of the river run between them,
// and every bridge crosses one arm between the two districts it joins. The map shows no graph: the solution draws it.
import { graphFor, mulberry } from "./maths.js";

export const W = 520, H = 360;
export const HIT = 78;   // a bridge's tap box, in map units (304 px for 520 units on a 390 px phone: 78 units = 45 px)
// half the width of a river arm and the smallest district of a random town: the first that gives a good map is used
const LOOSER = [{ ARM: 24, AREA: 6000 }, { ARM: 20, AREA: 4500 }, { ARM: 18, AREA: 3500 }];

/* ------------------------------------------------------------ small plane geometry */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1], len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => mul(a, 1 / (len(a) || 1));

// keep the part of a convex polygon where a·x <= c
function clip(poly, a, c) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], fp = dot(a, p) - c, fq = dot(a, q) - c;
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) out.push(add(p, mul(sub(q, p), fp / (fp - fq))));
  }
  return out;
}

export function area(poly) { let s = 0; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; }); return Math.abs(s) / 2; }

export function centroid(poly) {
  let cx = 0, cy = 0, s = 0;
  poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length], k = p[0] * q[1] - q[0] * p[1]; s += k; cx += (p[0] + q[0]) * k; cy += (p[1] + q[1]) * k; });
  return [cx / (3 * s), cy / (3 * s)];
}

// even-odd point in polygon
export function inside(poly, [x, y]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; }
  return c;
}

// distance from a point to the boundary of a polygon
export function edgeDist(poly, p) {
  let best = Infinity;
  poly.forEach((a, i) => { const b = poly[(i + 1) % poly.length], ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1))); best = Math.min(best, len(sub(p, add(a, mul(ab, t))))); });
  return best;
}

// where the segment p -> q crosses the boundary of poly, the crossing nearest to `from` (p or q)
function crossing(poly, p, q, nearQ) {
  let best = null;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length], r = sub(q, p), s = sub(b, a), den = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(den) < 1e-9) return;
    const t = ((a[0] - p[0]) * s[1] - (a[1] - p[1]) * s[0]) / den, u = ((a[0] - p[0]) * r[1] - (a[1] - p[1]) * r[0]) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return;
    if (best === null || (nearQ ? t > best : t < best)) best = t;
  });
  return best === null ? null : add(p, mul(sub(q, p), best));
}

/* ------------------------------------------------------------ Königsberg (network 0) */
// Lands in the order of graphFor(0): A Kneiphof island, B north bank (Altstadt), C south bank, D the eastern land (Lomse).
const KB_LANDS = [
  [[140, 172], [162, 151], [222, 145], [282, 150], [306, 168], [308, 208], [284, 228], [222, 234], [160, 228], [138, 206]],
  [[-12, -12], [532, -12], [532, 116], [470, 120], [404, 118], [340, 108], [290, 104], [220, 102], [150, 106], [80, 110], [-12, 114]],
  [[-12, 372], [532, 372], [532, 278], [470, 276], [404, 276], [340, 278], [290, 280], [220, 280], [150, 276], [80, 272], [-12, 268]],
  [[368, 170], [404, 160], [470, 160], [532, 158], [532, 238], [470, 238], [404, 238], [368, 226], [354, 198]],
];
// each bridge as a line from a point of its first land to a point of its second land (Euler's a, b, c, d, e, f, g)
const KB_BRIDGES = [[[178, 170], [178, 80]], [[266, 170], [266, 80]], [[178, 210], [178, 300]], [[266, 210], [266, 300]], [[280, 190], [380, 190]], [[440, 180], [440, 90]], [[440, 220], [440, 300]]];
const KB_SPOTS = [
  { label: [160, 190], stand: [232, 214] },
  { label: [96, 58], stand: [356, 70] },
  { label: [96, 316], stand: [356, 330] },
  { label: [490, 198], stand: [420, 210] },
];
// houses (h), trees (t) and the cathedral (c) of the Kneiphof
const KB_DECO = [
  [["c", 222, 182]],
  [["h", 30, 40], ["h", 140, 30], ["h", 168, 64], ["t", 222, 46], ["h", 260, 28], ["h", 296, 66], ["t", 320, 30], ["h", 410, 36], ["h", 460, 70], ["t", 500, 34], ["h", 220, 80]],
  [["h", 30, 330], ["t", 150, 336], ["h", 186, 322], ["h", 230, 340], ["t", 300, 320], ["h", 420, 330], ["h", 470, 318], ["t", 505, 340], ["h", 140, 300]],
  [["t", 396, 192], ["t", 466, 182], ["t", 470, 220], ["h", 506, 222]],
];

/* ------------------------------------------------------------ random towns (networks 1 to 98) */
// Sites from a spring layout of the network; each district is the cell of its site (points nearer to it than to any other
// site), shrunk by ARM on every shared side so that a river arm runs between neighbouring districts.
function springSites(graph, rnd) {
  const n = graph.names.length, k = Math.sqrt((W * H) / n) * 0.75, P = graph.names.map(() => [70 + rnd() * (W - 140), 60 + rnd() * (H - 120)]);
  for (let it = 0, temp = 60; it < 260; it++, temp *= 0.985) {
    const F = P.map(() => [0, 0]);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) { const d = sub(P[i], P[j]), l = Math.max(1, len(d)); F[i] = add(F[i], mul(d, (k * k) / (l * l))); }
    for (const [a, b] of graph.edges) { const d = sub(P[b], P[a]), l = Math.max(1, len(d)); F[a] = add(F[a], mul(d, l / k / 2)); F[b] = sub(F[b], mul(d, l / k / 2)); }
    for (let i = 0; i < n; i++) { const f = F[i], l = len(f) || 1; P[i] = add(P[i], mul(f, Math.min(l, temp) / l)); P[i] = [Math.max(70, Math.min(W - 70, P[i][0])), Math.max(60, Math.min(H - 60, P[i][1]))]; }
  }
  return P;
}

function cells(sites, shrink) {
  const box = [[-12, -12], [W + 12, -12], [W + 12, H + 12], [-12, H + 12]];
  return sites.map((p, i) => sites.reduce((poly, q, j) => {
    if (i === j || !poly.length) return poly;
    const a = sub(q, p), m = mul(add(p, q), 0.5);
    return clip(poly, a, dot(a, m) - shrink * len(a));
  }, box));
}

// the side shared by the cells of sites i and j (unshrunk cells), or null
function sharedSide(full, sites, i, j) {
  const a = sub(sites[j], sites[i]), c = dot(a, mul(add(sites[i], sites[j]), 0.5)), la = len(a), on = full[i].filter((p) => Math.abs(dot(a, p) - c) / la < 1e-6);
  if (on.length < 2) return null;
  let best = null;
  for (const p of on) for (const q of on) if (!best || len(sub(p, q)) > len(sub(best[0], best[1]))) best = [p, q];
  return len(sub(best[0], best[1])) > 1 ? best : null;
}

// Site positions found by the search below for networks 1 to 99, rounded ([fallback level, sites]): building a town from
// them is instant, while the search can take a second. Regenerate with searchTown(g) if graphFor changes; the tests
// rebuild every town from this table and check it.
const BAKED = {
  1: [0, [[136.5, 232.8], [230, 239.9], [318.2, 36], [252.8, 293.3]]],
  2: [0, [[255.2, 324], [312.3, 197.7], [258.3, 36], [423.8, 260]]],
  3: [0, [[261.1, 164], [179.3, 324], [203.3, 36], [389.2, 36], [201.7, 324], [478.3, 234.3]]],
  4: [0, [[70, 93.1], [257.5, 73.3], [450, 64.3], [70, 294.6], [262.5, 285.5], [450, 265.8]]],
  5: [0, [[294.5, 120.5], [70, 78.5], [178.6, 268.4], [401.4, 261.6]]],
  6: [0, [[87.8, 94.9], [325.6, 93.6], [111.6, 273.9], [300.5, 275.8]]],
  7: [0, [[450, 132.9], [230.7, 160.6], [70, 60], [352, 300]]],
  8: [0, [[228.6, 67.7], [450, 60], [290.2, 211.8], [70, 222.2]]],
  9: [0, [[450, 212.9], [450, 60], [264.8, 273.9], [70, 300], [254.2, 63.9], [70, 101.8]]],
  10: [0, [[187.8, 204.5], [315.3, 258.7], [70, 134.4], [294.4, 135.4]]],
  11: [0, [[415.1, 36], [283.9, 292.1], [63.7, 146.8], [469.8, 36], [197.8, 251.2], [196.2, 324]]],
  12: [0, [[307.1, 49.5], [322.2, 139.6], [105, 113.8], [313, 318.5], [75.7, 205.6], [445.4, 199.4]]],
  13: [0, [[292.2, 89.2], [158.9, 214.1], [70, 60], [333.3, 256.4]]],
  14: [0, [[263.1, 130.3], [70, 65], [433.3, 299.6], [445.2, 105.2]]],
  15: [0, [[222.7, 60], [157.3, 220.1], [70, 60], [327.1, 252.9], [450, 300], [416.9, 60]]],
  16: [0, [[450, 210.5], [405.2, 60], [253.6, 160], [70, 300]]],
  17: [0, [[133.5, 177], [202.2, 268.7], [287.2, 40.5], [421.6, 52], [427, 263.3], [40, 194.9]]],
  18: [0, [[466.7, 192.3], [387.5, 166.1], [285.6, 324], [382.9, 77.8]]],
  19: [0, [[480, 38.6], [207.8, 146.3], [70, 60], [151.3, 162], [352.9, 324]]],
  20: [0, [[395.5, 318.9], [397.2, 229.4], [291.1, 109], [57.3, 137.9], [480, 208.1], [119.6, 36]]],
  21: [0, [[138, 271], [231.4, 120.5], [360.6, 259.1], [450, 60]]],
  22: [0, [[394.9, 150.9], [448.4, 193.3], [198.3, 249.3], [40, 313.9], [40, 258.8], [408.9, 89.8]]],
  23: [0, [[203.3, 60], [388.5, 64.7], [79.6, 184.8], [430.4, 232.9], [204.7, 300]]],
  24: [0, [[480, 254.5], [208.1, 324], [57.2, 156.9], [301, 151.2], [234.3, 176.2], [158, 36]]],
  25: [0, [[242.9, 84.7], [218.2, 300], [70, 300], [450, 60], [70, 84.3]]],
  26: [0, [[77.5, 300], [293.5, 293.9], [245.6, 146.7], [419.4, 113.1]]],
  27: [0, [[267.5, 141.1], [153.1, 175], [248.9, 324], [40, 319.7], [474.2, 218.9], [70.9, 39.1]]],
  28: [0, [[40, 51.6], [329.3, 165.7], [310.4, 324], [236, 255.6]]],
  29: [0, [[338, 172.5], [405.2, 155.6], [143.1, 185.4], [70, 300], [70, 60], [429.8, 36]]],
  30: [0, [[135.1, 149.8], [273.2, 186.3], [188.2, 281.3], [105.8, 110.2], [299.1, 60]]],
  31: [0, [[235.9, 266.1], [40, 128.1], [235.7, 324], [344.2, 151.6], [240, 95.2], [480, 50.4]]],
  32: [0, [[282.2, 60], [450, 107.7], [91, 121.6], [70, 300], [259.1, 222]]],
  33: [0, [[186.5, 151.8], [283.3, 271.5], [354.2, 144.1], [43.8, 235], [153.2, 36], [480, 36]]],
  34: [0, [[317.2, 216.1], [170.4, 181.3], [412, 285.2], [339.6, 60], [70, 300]]],
  35: [0, [[133.3, 36], [377.8, 234.7], [339.8, 304.3], [480, 282.2], [279, 250.6], [54.8, 52.1]]],
  36: [0, [[183.9, 300], [387, 242.5], [326.6, 115.5], [468.4, 36], [40, 148.3]]],
  37: [0, [[184.4, 60], [70, 188.9], [372.5, 130.4], [450, 300], [195.1, 228.2]]],
  38: [0, [[124.7, 56.6], [303.1, 200.1], [282.1, 110.8], [430.7, 267]]],
  39: [0, [[369.6, 235.3], [172.4, 43.7], [175.3, 207.6], [163.5, 224.7], [472, 313.1], [40, 239.4]]],
  40: [0, [[146, 36], [170.3, 170.3], [270.1, 324], [134.3, 104.7], [40, 259], [474, 324]]],
  41: [0, [[188.9, 324], [183.1, 214.7], [193.4, 36], [469.3, 297.4], [480, 38.7], [149.5, 254.2]]],
  42: [0, [[410.8, 163.6], [206.5, 113.4], [70, 60], [450, 300], [284.7, 300]]],
  43: [0, [[290.2, 60], [419.9, 286.4], [450, 60], [480, 324], [53.1, 36]]],
  44: [0, [[292.2, 196.8], [70, 300], [427.2, 69.4], [450, 265.1]]],
  45: [0, [[81.1, 237.7], [231.6, 300], [450, 300], [349.4, 154.8], [429.4, 69.7]]],
  46: [0, [[257.2, 142.2], [445.2, 119.1], [70, 60], [367.3, 296.4]]],
  47: [0, [[239.4, 128.8], [315.6, 261.5], [43.1, 315.8], [414.7, 116.4]]],
  48: [0, [[304.5, 60], [450, 189.2], [230.9, 235.7], [98.2, 108], [70, 300]]],
  49: [0, [[252.7, 283.3], [323.8, 324], [50, 324], [216.6, 43.4], [91.6, 36]]],
  50: [0, [[468.8, 154.2], [273.9, 129.3], [369.8, 199.9], [43.8, 38.4], [400.9, 324]]],
  51: [0, [[94.8, 60], [260.6, 121.9], [348.6, 229.6], [229.5, 265.5], [473.6, 243.6]]],
  52: [0, [[265, 254.3], [209.7, 64.1], [317.3, 122.8], [40, 320.8], [453.5, 97.5]]],
  53: [0, [[450, 71.5], [215.8, 81.4], [79.4, 177.3], [215.8, 273.1], [450, 283]]],
  54: [0, [[240.8, 110.4], [118.2, 232.3], [290.3, 285.8], [446.2, 200.4]]],
  55: [0, [[196.2, 36], [286.5, 104.7], [351, 296.1], [99.6, 98.7], [424.3, 139.7], [373.8, 324]]],
  56: [0, [[190.7, 166.2], [109.6, 275.3], [68.3, 70.1], [339.4, 281.6], [180.6, 109.6], [480, 36]]],
  57: [0, [[418.9, 249.5], [303.7, 290.6], [258.3, 155.9], [480, 36], [40, 150.7]]],
  58: [0, [[96.4, 166.1], [258.5, 283.3], [398.2, 136.4], [450, 300], [266.6, 60], [70, 300]]],
  59: [0, [[306, 251.5], [407, 60], [450, 300], [217.6, 60], [70, 60], [142.4, 220.8]]],
  60: [0, [[70, 60], [211.4, 239.1], [246.7, 50.4], [376.2, 300]]],
  61: [0, [[231.4, 214.8], [96.4, 324], [346.8, 77.1], [134.4, 95.1]]],
  62: [0, [[441.2, 70.3], [223.8, 73.2], [338.5, 218.1], [171.1, 284.1]]],
  63: [0, [[314, 291], [192.7, 148.3], [93.1, 291.8], [416.9, 96.1]]],
  64: [0, [[450, 60], [259.8, 127.7], [92, 299.6], [77, 105.4]]],
  65: [0, [[70, 60], [166.7, 265], [337.4, 300], [239.4, 93.1]]],
  66: [0, [[88.9, 120.6], [170.6, 36], [355.4, 255], [168.8, 96.1]]],
  67: [0, [[108.2, 212.8], [290.7, 300], [450, 300], [70, 60], [238.3, 60], [386.9, 136.4]]],
  68: [1, [[480, 86.6], [480, 140.2], [297.4, 138.3], [196.7, 324], [243.2, 36], [280.4, 140.1]]],
  69: [0, [[118.3, 188.3], [360.8, 293], [471.5, 36], [190.4, 100.5], [192.4, 78.1]]],
  70: [0, [[256.6, 300], [131.5, 194.9], [480, 140.8], [438.9, 91.9], [70, 60], [70, 300]]],
  71: [0, [[336.2, 235.3], [236, 324], [192.2, 128.5], [56.8, 36], [99.3, 240.2], [480, 72.4]]],
  72: [0, [[168.2, 296.3], [400.3, 300], [267.5, 164.6], [337.1, 66.4], [151.3, 39.2]]],
  73: [0, [[180.3, 72.1], [294.2, 226.1], [281.8, 299.3], [472.4, 116.3]]],
  74: [0, [[341.7, 258], [450, 300], [40, 282.2], [365.2, 122.1], [139.1, 36]]],
  75: [0, [[273.9, 252.7], [266.8, 133.7], [59.9, 107.8], [476.6, 274.8], [55.6, 36], [308.4, 202.8]]],
  76: [0, [[70, 214.1], [285.4, 208.5], [450, 300], [100.1, 60]]],
  77: [0, [[268.2, 187.9], [158.9, 324], [282.1, 189.5], [227.4, 42.4]]],
  78: [0, [[212.2, 303.5], [344.6, 36], [163.9, 97.8], [234.5, 78.7], [40, 116.4]]],
  79: [0, [[279.9, 300], [105.9, 224.5], [70, 60], [450, 300]]],
  80: [0, [[134.8, 57], [305.7, 194], [313.2, 122.7], [448.3, 289]]],
  81: [0, [[70, 60], [153.3, 144.7], [165.2, 36], [450, 72.4], [310.7, 300], [443.7, 163.2]]],
  82: [0, [[426.6, 266.9], [269.6, 79.7], [59.9, 114.9], [248.2, 324], [295, 189]]],
  83: [0, [[228.2, 145.1], [104.5, 36], [108.4, 136.4], [148.8, 253.5], [182.8, 324]]],
  84: [0, [[308.8, 211], [265.5, 324], [68, 103.1], [435.8, 200.1], [73.5, 44.9], [233.4, 149.9]]],
  85: [0, [[222.3, 154.2], [480, 36], [70, 300], [402.6, 311.4], [235.5, 209.1]]],
  86: [0, [[82.2, 235.4], [227, 324], [407.2, 233.4], [252.8, 62.8], [298.7, 187.6], [164.5, 213.9]]],
  87: [0, [[289.3, 89], [119.5, 60], [218.7, 300], [70, 300], [450, 60]]],
  88: [0, [[290.2, 235.1], [264.5, 60], [106.1, 261.5], [70, 60], [450, 300]]],
  89: [0, [[259.3, 102.5], [261.4, 266.9], [450, 60], [450, 257.5], [70, 300], [70, 103.4]]],
  90: [0, [[113.3, 279.2], [249.2, 148.3], [70, 91], [448.1, 102]]],
  91: [0, [[396.2, 160.3], [458.2, 270.8], [134, 36.2], [40, 67.6], [387.2, 226.7]]],
  92: [0, [[363.2, 72], [122, 71.5], [361.4, 253.5], [120.2, 249.2]]],
  93: [0, [[335.1, 300], [217.9, 143.1], [70, 60], [164.9, 300], [70, 194], [450, 300]]],
  94: [0, [[480, 36], [305.8, 181.9], [480, 268.7], [299.2, 276.3], [252.9, 214.8], [247.8, 115.3]]],
  95: [0, [[184.2, 324], [70.2, 179.1], [440.5, 96.3], [270.9, 114.2], [149, 215], [416.2, 36]]],
  96: [0, [[174, 146.7], [395.6, 60.1], [71.3, 275.7], [286.7, 300], [450, 219.2]]],
  97: [0, [[235.6, 151.9], [70, 60], [419.7, 300], [450, 146]]],
  98: [0, [[450, 300], [355.5, 324], [86.4, 249.1], [70, 60], [189.9, 149.6]]],
  99: [0, [[273.1, 241.8], [320.9, 60.5], [102.7, 87.7], [447.9, 241.4]]],
};

function randomTown(g) {
  const b = BAKED[g], town = b && tryTown(g, LOOSER[b[0]], b[1]);
  if (town) return town;
  const found = searchTown(g);
  if (!found) throw new Error(`no town map for network ${g}`);
  return tryTown(g, LOOSER[found[0]], found[1]);
}

// [fallback level, sites] of a good town for network g, or null
export function searchTown(g) {
  for (let k = 0; k < LOOSER.length; k++) { const sites = tryTown(g, LOOSER[k]); if (sites) return [k, sites.map((p) => p.map((v) => Math.round(v * 10) / 10))]; }
  return null;
}

// With `fixed` sites: the town they give, or null if it is not good. Without: a search for good sites (returns them).
function tryTown(g, { ARM, AREA }, fixed = null) {
  const graph = graphFor(g), n = graph.names.length;
  const pairs = new Map(); graph.edges.forEach(([a, b], i) => { const key = `${a}-${b}`; pairs.set(key, [...(pairs.get(key) || []), i]); });
  // how far a placement of the sites is from a good town: every pair joined by bridges must share a side long enough
  // for its bridges, every district must be big enough for a few houses (0 means good)
  const need = (ids) => HIT * (ids.length - 1) + 2 * ARM + 36;
  // the bridges of a placement: each crosses its arm square to the shared side, spaced HIT apart round the middle of it;
  // `bad` counts the feet that do not rest on a straight stretch of their own shore
  const place = (sites, full, lands) => {
    const bridges = []; let bad = 0;
    for (const [key, ids] of pairs) {
      const [a, b] = key.split("-").map(Number), side = sharedSide(full, sites, a, b);
      if (!side) { bad += ids.length; continue; }
      const dir = unit(sub(side[1], side[0])), mid = mul(add(side[0], side[1]), 0.5), nrm = unit(sub(sites[b], sites[a]));
      ids.forEach((id, k) => {
        const q = add(mid, mul(dir, (k - (ids.length - 1) / 2) * HIT)), br = { a: sub(q, mul(nrm, ARM)), b: add(q, mul(nrm, ARM)) };
        const firm = (poly, foot, inward) => edgeDist(poly, foot) < 0.5 && [-14, 14].every((s) => edgeDist(poly, add(foot, mul(dir, s))) < 0.5) && inside(poly, add(foot, mul(inward, 10)));
        if (!firm(lands[a], br.a, mul(nrm, -1)) || !firm(lands[b], br.b, nrm)) bad++;
        bridges[id] = br;
      });
    }
    const mids = bridges.filter(Boolean).map((br) => mul(add(br.a, br.b), 0.5));
    mids.forEach((m, i) => mids.forEach((o, j) => { if (j > i && len(sub(m, o)) < HIT - 4) bad++; }));
    return { bridges, bad };
  };
  const deficit = (sites) => {
    const full = cells(sites, 0), lands = cells(sites, ARM); let d = 0;
    lands.forEach((poly) => { d += poly.length < 3 ? 6000 : Math.max(0, AREA - area(poly)) / 20; });
    for (const [key, ids] of pairs) { const [a, b] = key.split("-").map(Number), side = sharedSide(full, sites, a, b); d += side ? Math.max(0, need(ids) - len(sub(side[1], side[0]))) : 300; }
    if (lands.some((poly) => poly.length < 3)) return d;
    return d + 40 * place(sites, full, lands).bad;
  };
  const keep = ([x, y]) => [Math.max(40, Math.min(W - 40, x)), Math.max(36, Math.min(H - 36, y))];
  if (!fixed) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const rnd = mulberry(g * 104729 + attempt * 7 + 1);
      let sites = attempt % 2 ? graph.names.map(() => [50 + rnd() * (W - 100), 44 + rnd() * (H - 88)]) : springSites(graph, rnd), score = deficit(sites);
      for (let it = 0; it < 500 && score > 0; it++) {
        const v = Math.floor(rnd() * n), step = 70 * (1 - it / 600), trial = sites.map((p, i) => (i === v ? keep([p[0] + (rnd() - 0.5) * 2 * step, p[1] + (rnd() - 0.5) * 2 * step]) : p)), sc = deficit(trial);
        if (sc <= score) { sites = trial; score = sc; }
      }
      if (score === 0 && deficit(sites.map((p) => p.map((v) => Math.round(v * 10) / 10))) === 0) return sites;
    }
    return null;
  }
  {
    const sites = fixed, rnd = mulberry(g * 31 + 5);
    if (deficit(sites) > 0) return null;
    const full = cells(sites, 0), lands = cells(sites, ARM), { bridges } = place(sites, full, lands);
    const spots = lands.map((poly) => { const c = centroid(poly); let stand = add(c, [24, 34]); if (!inside(poly, stand) || edgeDist(poly, stand) < 14) stand = add(c, [0, 30]); return { label: c, stand }; });
    // a few houses and trees, away from the bridges, the sign and where the walker stands
    const deco = lands.map((poly, v) => {
      const feet = bridges.flatMap((br, i) => (graph.edges[i][0] === v ? [br.a] : graph.edges[i][1] === v ? [br.b] : [])), spots0 = spots[v], out = [];
      const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      for (let y = Math.max(16, Math.min(...ys) + 18); y < Math.min(H - 8, Math.max(...ys) - 8); y += 30) for (let x = Math.max(14, Math.min(...xs) + 16); x < Math.min(W - 14, Math.max(...xs) - 14); x += 34) {
        const p = [x + (rnd() - 0.5) * 10, y + (rnd() - 0.5) * 8];
        if (!inside(poly, p) || edgeDist(poly, p) < 14 || feet.some((f) => len(sub(f, p)) < 44) || len(sub(spots0.label, p)) < 34 || len(sub(spots0.stand, [p[0], p[1] + 20])) < 34) continue;
        if (rnd() < 0.55) out.push([rnd() < 0.6 ? "h" : "t", p[0], p[1]]);
      }
      return out.slice(0, 7);
    });
    return { lands, bridges, spots, deco, sites };
  }
}

function konigsberg() {
  const bridges = KB_BRIDGES.map(([p, q], i) => { const [a, b] = graphFor(0).edges[i]; return { a: crossing(KB_LANDS[a], p, q, false) ? lastExit(KB_LANDS[a], p, q) : p, b: crossing(KB_LANDS[b], p, q, false) }; });
  return { lands: KB_LANDS, bridges, spots: KB_SPOTS, deco: KB_DECO };
}
// leaving land `poly` along p -> q (p inside it): the last boundary point before the water
const lastExit = (poly, p, q) => { const far = crossing(poly, q, p, false); return far ?? p; };

/* ------------------------------------------------------------ the town of a network */
const cache = new Map();
// { W, H, lands: [polygon per district], bridges: [{ a, b }] (a on the land of edges[i][0], b on that of edges[i][1]),
//   spots: [{ label, stand }], deco: [[kind, x, y], ...] per land, islands: [district indices not touching the map edge] }
export function cityFor(g) {
  if (cache.has(g)) return cache.get(g);
  const base = g === 0 ? konigsberg() : randomTown(g);
  const islands = base.lands.map((poly, v) => (poly.every((p) => p[0] > 0 && p[0] < W && p[1] > 0 && p[1] < H) ? v : -1)).filter((v) => v >= 0);
  const city = { W, H, ...base, islands };
  city.bridges = city.bridges.map((br) => { const d = sub(br.b, br.a); return { ...br, mid: mul(add(br.a, br.b), 0.5), angle: (Math.atan2(d[1], d[0]) * 180) / Math.PI, span: len(d) }; });
  cache.set(g, city);
  return city;
}

// The graph drawn over the map in the solution: one point per district (where its sign stands) and one line per bridge,
// a curve from point to point through the middle of that bridge. Returns { pts, curves: [{ A, C, B }] } (quadratic curves).
export function graphOver(city, graph) {
  const pts = city.spots.map((s) => s.label);
  const curves = graph.edges.map(([a, b], i) => { const A = pts[a], B = pts[b], M = city.bridges[i].mid; return { A, B, C: sub(mul(M, 2), mul(add(A, B), 0.5)) }; });
  return { pts, curves };
}

export const bez = ({ A, C, B }, t) => [(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0], (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1]];
