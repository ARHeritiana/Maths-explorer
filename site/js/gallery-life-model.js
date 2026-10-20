// Pure mathematics of the Game of Life exhibit (no DOM): the rule on the unbounded plane, the presets and their
// properties (periods, displacements), checked by simulation in tests/gallery-life.test.mjs.

// A live cell (x, y) is stored as one number; coordinates stay within ±LIMIT, cells that drift further are dropped.
const OFF = 32768, SPAN = 65536;
export const LIMIT = 4000;
export const key = (x, y) => (x + OFF) * SPAN + (y + OFF);
export const coords = (k) => [Math.floor(k / SPAN) - OFF, (k % SPAN) - OFF];

export function fromCells(cells, dx = 0, dy = 0) { return new Set(cells.map(([x, y]) => key(x + dx, y + dy))); }
export const toCells = (set) => [...set].map(coords);

// One generation of Conway's rule B3/S23: a dead cell with exactly 3 live neighbours is born, a live cell with 2 or 3
// live neighbours survives, every other cell is dead in the next generation.
export function step(set) {
  const counts = new Map();
  for (const k of set) {
    const [x, y] = coords(k);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (dx || dy) { const n = key(x + dx, y + dy); counts.set(n, (counts.get(n) || 0) + 1); }
    }
  }
  const next = new Set();
  for (const [k, c] of counts) {
    if (c === 3 || (c === 2 && set.has(k))) { const [x, y] = coords(k); if (Math.abs(x) <= LIMIT && Math.abs(y) <= LIMIT) next.add(k); }
  }
  return next;
}
export function run(set, generations) { let s = set; for (let i = 0; i < generations; i++) s = step(s); return s; }

// Shape of a pattern up to translation: sorted cells shifted so the smallest x and y are 0.
export function normalForm(set) {
  const cells = toCells(set);
  if (!cells.length) return "";
  const mx = Math.min(...cells.map((c) => c[0])), my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).join(";");
}
export function bounds(set) {
  const cells = toCells(set);
  if (!cells.length) return null;
  const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// Rows of "O" (alive) and "." (dead) into a list of cells, centred on the origin.
export function parseRows(rows) {
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "O") cells.push([x, y]); }));
  const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
  return cells.map(([x, y]) => [x - Math.floor(w / 2), y - Math.floor(h / 2)]);
}

// Presets. `kind` sorts them in the menu; the facts stated in the exhibit (period, speed, lifetime) are the ones
// checked in the tests.
export const PRESETS = [
  { id: "blinker", kind: "osc", name: ["Clignotant (période 2)", "Blinker (period 2)"], rows: ["OOO"] },
  { id: "toad", kind: "osc", name: ["Crapaud (période 2)", "Toad (period 2)"], rows: [".OOO", "OOO."] },
  { id: "beacon", kind: "osc", name: ["Phare (période 2)", "Beacon (period 2)"], rows: ["OO..", "OO..", "..OO", "..OO"] },
  { id: "pulsar", kind: "osc", name: ["Pulsar (période 3)", "Pulsar (period 3)"], rows: [
    "..OOO...OOO..", ".............", "O....O.O....O", "O....O.O....O", "O....O.O....O", "..OOO...OOO..", ".............",
    "..OOO...OOO..", "O....O.O....O", "O....O.O....O", "O....O.O....O", ".............", "..OOO...OOO.."] },
  { id: "glider", kind: "ship", name: ["Planeur", "Glider"], rows: [".O.", "..O", "OOO"] },
  { id: "lwss", kind: "ship", name: ["Petit vaisseau", "Lightweight spaceship"], rows: [".O..O", "O....", "O...O", "OOOO."] },
  { id: "gun", kind: "gun", name: ["Canon à planeurs de Gosper", "Gosper glider gun"], rows: [
    "........................O...........", "......................O.O...........", "............OO......OO............OO",
    "...........O...O....OO............OO", "OO........O.....O...OO..............", "OO........O...O.OO....O.O...........",
    "..........O.....O.......O...........", "...........O...O....................", "............OO......................"] },
  { id: "rpent", kind: "meth", name: ["R-pentomino", "R-pentomino"], rows: [".OO", "OO.", ".O."] },
  { id: "diehard", kind: "meth", name: ["Diehard (meurt)", "Diehard (dies out)"], rows: ["......O.", "OO......", ".O...OOO"] },
  { id: "acorn", kind: "meth", name: ["Gland", "Acorn"], rows: [".O.....", "...O...", "OO..OOO"] },
];
export const preset = (id) => PRESETS.find((p) => p.id === id) || PRESETS[0];
export const presetSet = (id) => fromCells(parseRows(preset(id).rows));

// A random soup in a w × h rectangle centred on the origin; rnd is injected so tests can seed it.
export function soup(w, h, density, rnd = Math.random) {
  const cells = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (rnd() < density) cells.push([x - Math.floor(w / 2), y - Math.floor(h / 2)]);
  return fromCells(cells);
}
