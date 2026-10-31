// A `soft` handle moves continuously and is pulled onto a grid line only within 8 px of it; other handles snap to their grid.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHandles } from '../dist/js/lab/plot.js';

// A view with 40 px per unit, origin at (0, 0). Magnet radius = min(8 px, 30% of a grid step): 6 px on a 0.5 grid, 3 px on a 0.25 grid.
const view = { X: (x) => 40 * x, Y: (y) => -40 * y, iX: (px) => px / 40, iY: (py) => -py / 40, left: -400, top: -300, width: 800, height: 600, cam: null };
const make = (control) => {
  let state = { x: 0, y: 0 };
  const exp = { controls: { p: { kind: 'handle', at: (s) => [s.x, s.y], drag: (s, x, y) => ({ x, y }), ...control } } };
  const [h] = buildHandles({ exp, fmt: { t: (v) => v[0] }, getState: () => state, setState: (n) => { state = { ...state, ...n }; }, views: () => ({ graph: view }), panels: ['graph'] });
  return { h, get state() { return state; } };
};
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);

test('soft: free between grid lines, magnet near them', () => {
  const m = make({ soft: true, grid: 0.5, label: ['p', 'p'] });
  m.h.drag(40 * 1.23, -40 * 2.25);   // 1.23 is 9.2 px from the line 1; 2.25 is midway between 2 and 2.5 (10 px): both free
  near(m.state.x, 1.23); near(m.state.y, 2.25);
  m.h.drag(40 * 1.1, -40 * 2.4);     // 0.1 unit = 4 px from 1.0 and from 2.5 (0.1): inside the magnet
  near(m.state.x, 1.0); near(m.state.y, 2.5);
  m.h.drag(40 * 0.75, 0);            // exactly between lines 0.5 and 1.0: 0.25 unit = 10 px: free
  near(m.state.x, 0.75);
});

test('not soft: snaps to the grid as before', () => {
  const m = make({ grid: 0.5, label: ['p', 'p'] });
  m.h.drag(40 * 1.23, -40 * 2.31); near(m.state.x, 1.0); near(m.state.y, 2.5);   // a hard grid snaps to the nearest line
});

test('soft handle with a one-axis grid keeps the other axis free', () => {
  const m = make({ soft: true, grid: [0.25, 0], label: ['p', 'p'] });
  m.h.drag(40 * 0.95, -40 * 1.777); near(m.state.x, 1.0); near(m.state.y, 1.777);   // 0.95 is 2 px from the line 1.0: pulled; the y axis has no grid
});

test('keyboard: one grid step from an off-grid soft position, and from the grid stays on the grid', () => {
  const m = make({ soft: true, grid: 0.5, label: ['p', 'p'] });
  m.h.drag(40 * 1.23, 0); near(m.state.x, 1.23);
  m.h.nudge(1, 0); near(m.state.x, 1.73);
  m.h.drag(40 * 1.0, 0); near(m.state.x, 1.0);
  m.h.nudge(1, 0); near(m.state.x, 1.5); m.h.nudge(-1, 0); near(m.state.x, 1.0);
});

test('a dense grid leaves most positions free: the magnet is at most 30% of a step', () => {
  const m = make({ soft: true, grid: 0.1, label: ['p', 'p'] });          // step = 4 px: magnet radius 1.2 px = 0.03 unit
  m.h.drag(40 * 0.17, 0); near(m.state.x, 0.17);                        // 0.03 from the line 0.2 and 0.07 from 0.1: not within 0.03
  m.h.drag(40 * 0.19, 0); near(m.state.x, 0.2);                         // 0.01 from 0.2: pulled
});
