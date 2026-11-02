// The lit floor of the mirrored rooms (site/js/illumination-light.js): beams between neighbouring rays, the grid of reflection
// levels, the dark patches, and the wall-crossing check of the room editor. Exact answers are computed independently here.
import test from 'node:test'; import assert from 'node:assert/strict';
import { lightMap, litUpTo, coverage, crossings, rasterQuads, roomGrid, NEVER, STRIDE, lightBeams } from '../site/js/illumination-light.js';
import { PRESETS, LROOM, STAR } from '../site/js/illumination-presets.js';
import * as M from '../site/js/illumination-model.js';
const diag = (b) => Math.hypot(b[1] - b[0], b[3] - b[2]);
const map = (id, source, bounces, budget = 3000) => { const p = PRESETS[id]; return lightMap(p.edges, source, { rays: 720, bounces, depth: 8, budget, gap: diag(p.bounds) / 110 }, 320); };
const patches = (r, upTo = Infinity) => coverage(r.grid, litUpTo(r.level, upTo), { minCells: 8 }).patches;

test('Penrose, lamp at the centre: the four pockets beyond the foci stay dark (each 1 by 0.8)', () => {
  const ps = patches(map('penrose', [0, 0], 30));
  assert.equal(ps.length, 4);
  for (const p of ps) { assert.ok(Math.abs(p.area - 0.8) < 0.08, `pocket area ${p.area}`); assert.ok(Math.abs(Math.abs(p.centre[0]) - 4.5) < 0.1 && Math.abs(Math.abs(p.centre[1]) - 0.6) < 0.1, `pocket at ${p.centre}`); }
});

test('Penrose, lamp in a pocket: the far half of the room stays dark', () => {
  const c = coverage(map('penrose', [4.5, 0.6], 30).grid, litUpTo(map('penrose', [4.5, 0.6], 30).level), { minCells: 8 });
  assert.ok(c.litShare < 0.5, `lit ${c.litShare}`);
});

test('L-shaped room: the shadow behind the inner corner has the exact area with no reflection and is gone after two', () => {
  // lamp (-3, -2), inner corner (0, 1): in the wing x > 0, 1 < y < 4 the lamp sees the points above the line y = x + 1
  // (triangle (0,1), (3,4), (0,4) of area 4.5), so 15 - 4.5 = 10.5 is hidden
  const r = map('lroom', [-3, -2], 2), hidden = patches(r, 0);
  assert.equal(hidden.length, 1); assert.ok(Math.abs(hidden[0].area - 10.5) < 0.25, `hidden ${hidden[0].area}`);
  assert.ok(patches(r, 1).length >= 1, 'still a shadow after one reflection');
  assert.equal(patches(r, 2).length, 0, 'no shadow after two reflections');
});

test('a convex room is fully lit with no reflection; the reflection levels are coherent', () => {
  const r = map('polygon', [0.3, -0.2], 3), lit0 = litUpTo(r.level, 0);
  const c = coverage(r.grid, lit0); assert.ok(c.litShare > 0.995, `${c.litShare}`); assert.equal(c.patches.length, 0);
  // a ray aimed exactly at a corner stops there, so a few cells in the corners are reached only after one reflection
  let late = 0; for (let i = 0; i < r.level.length; i++) if (r.grid.mask[i] && r.level[i] !== 0) late++;
  assert.ok(late < 0.005 * r.grid.cellsInside, `${late} cells lit late`);
  assert.equal(litUpTo(new Uint16Array([NEVER, 0, 3]), Infinity).join(), '0,1,1');
});

test('Tokarsky and Wolecki: no dark patch (their unlit point has no area), whatever the budget', () => {
  for (const id of ['tokarsky', 'wolecki']) assert.equal(patches(map(id, PRESETS[id].source, 30)).length, 0, id);
});

test('beams agree with single rays: every cell crossed by a ray traced alone is lit', () => {
  const p = PRESETS.star, source = [0.4, 0.3], b = lightBeams(p.edges, source, { rays: 360, bounces: 2, depth: 6, budget: 3000, gap: diag(p.bounds) / 110 });
  const grid = roomGrid(p.edges, p.bounds, 200), lit = rasterQuads(grid, b.quads); let checked = 0;
  for (let i = 0; i < 97; i++) {
    const a = 0.0123 + i * 2 * Math.PI / 97, path = M.trace(p.edges, source, [Math.cos(a), Math.sin(a)], 2);
    for (let k = 1; k < path.points.length; k++) for (let s = 0.05; s < 0.95; s += 0.05) {
      const q = [path.points[k - 1][0] + s * (path.points[k][0] - path.points[k - 1][0]), path.points[k - 1][1] + s * (path.points[k][1] - path.points[k - 1][1])];
      const c = Math.floor((q[0] - grid.x0) / grid.h), r = Math.floor((q[1] - grid.y0) / grid.h), j = r * grid.cols + c;
      if (grid.mask[j]) { assert.equal(lit[j], 1, `ray ${i} at ${q}`); checked++; }
    }
  }
  assert.ok(checked > 1000);
  assert.equal(b.quads.length % STRIDE, 0);
});

test('the editor finds crossing walls, ignores neighbours, and treats an open outline without its closing wall', () => {
  assert.deepEqual(crossings(M.polygonEdges([[0, 0], [2, 0], [0, 2], [2, 2]])), [[1, 3]]);
  assert.equal(crossings(M.polygonEdges(LROOM)).length, 0);
  assert.equal(crossings(M.polygonEdges(STAR)).length, 0);
  const open = M.polygonEdges([[0, 0], [4, 0], [4, 4], [2, -1]]);
  assert.ok(crossings(open.slice(0, -1), false).length > 0, 'the last wall crosses the first');
  assert.equal(crossings(M.polygonEdges([[0, 0], [4, 0], [4, 4]]).slice(0, -1), false).length, 0);
});

test('the new ordinary rooms are valid rooms with the lamp inside', () => {
  for (const id of ['lroom', 'star', 'ellipse']) { const p = PRESETS[id]; assert.equal(M.validate(p.edges).ok, true, id); assert.ok(M.inside(p.source, M.flatten(p.edges)), id); }
});
