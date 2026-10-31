// The floor plan of the five-room challenge: five rooms A to E and the outside O, with their 16 doors (the order of FIVE_ROOM_EDGES).
// Coordinates are in "house units" (the house is 400 x 270); a door sits on a wall with a normal n pointing from its first place to its second.
// The plan is the puzzle; the graph (rooms as vertices, doors as edges) is what the solution then reveals.
export const HOUSE = { w: 400, h: 270 };
export const ROOM_RECTS = [{ x: 0, y: 0, w: 200, h: 140 }, { x: 200, y: 0, w: 200, h: 140 }, { x: 0, y: 140, w: 130, h: 130 }, { x: 130, y: 140, w: 140, h: 130 }, { x: 270, y: 140, w: 130, h: 130 }];
export const STAND = [[100, 78], [300, 78], [65, 212], [200, 212], [335, 212], [446, -22]];   // where a person stands in each place (the last is outside)
const D = (a, b, x, y, nx, ny) => ({ a, b, x, y, n: [nx, ny] });
export const DOORS = [
  D(0, 1, 200, 70, 1, 0), D(0, 2, 65, 140, 0, 1), D(0, 3, 165, 140, 0, 1), D(1, 3, 235, 140, 0, 1), D(1, 4, 335, 140, 0, 1), D(2, 3, 130, 205, 1, 0), D(3, 4, 270, 205, 1, 0),
  D(0, 5, 60, 0, 0, -1), D(0, 5, 0, 70, -1, 0), D(1, 5, 300, 0, 0, -1), D(1, 5, 400, 70, 1, 0), D(2, 5, 0, 205, -1, 0), D(2, 5, 40, 270, 0, 1), D(3, 5, 200, 270, 0, 1), D(4, 5, 335, 270, 0, 1), D(4, 5, 400, 205, 1, 0),
];
// the points a person walks through to cross door i from place `from`: in front of the door, the door, behind it
export function doorway(i, from) {
  const d = DOORS[i], [nx, ny] = d.n, k = from === d.a ? 1 : -1, r = 26;
  return [[d.x - nx * r * k, d.y - ny * r * k], [d.x, d.y], [d.x + nx * r * k, d.y + ny * r * k]];
}
export const standAfter = (i, to) => { const d = DOORS[i]; return to === 5 ? doorway(i, d.a)[2].map((v, k) => v + d.n[k] * 14) : STAND[to]; };
export const NAMES = ["A", "B", "C", "D", "E", "O"];
// Walking round the outside of the house (a ring 26 units from the walls), the short way, so nobody crosses a wall on the grass
const M = 26, RW = HOUSE.w + 2 * M, RH = HOUSE.h + 2 * M, PER = 2 * (RW + RH);
const ringPos = (p) => {
  const x = Math.min(Math.max(p[0], -M), HOUSE.w + M), y = Math.min(Math.max(p[1], -M), HOUSE.h + M), dl = x + M, dr = HOUSE.w + M - x, dt = y + M, db = HOUSE.h + M - y, m = Math.min(dl, dr, dt, db);
  if (m === dt) return x + M; if (m === dr) return RW + (y + M); if (m === db) return RW + RH + (HOUSE.w + M - x); return 2 * RW + RH + (HOUSE.h + M - y);
};
const ringPoint = (s) => { s = ((s % PER) + PER) % PER; if (s < RW) return [s - M, -M]; s -= RW; if (s < RH) return [HOUSE.w + M, s - M]; s -= RH; if (s < RW) return [HOUSE.w + M - s, HOUSE.h + M]; s -= RW; return [-M, HOUSE.h + M - s]; };
export function ringRoute(a, b) {
  const sa = ringPos(a), sb = ringPos(b), d = (((sb - sa) % PER) + PER) % PER, dir = d <= PER / 2 ? 1 : -1, len = dir > 0 ? d : PER - d, out = [];
  for (const c of [0, RW, RW + RH, 2 * RW + RH]) { const rel = dir > 0 ? (((c - sa) % PER) + PER) % PER : (((sa - c) % PER) + PER) % PER; if (rel > 1e-6 && rel < len - 1e-6) out.push({ rel, pt: ringPoint(c) }); }
  return [a, ringPoint(sa), ...out.sort((p, q) => p.rel - q.rel).map((o) => o.pt), ringPoint(sb), b];
}
