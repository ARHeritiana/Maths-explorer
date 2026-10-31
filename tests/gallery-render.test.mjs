// Pure parts of the smooth renderers and the editable soap frame: reference orbit of the GPU Mandelbrot, frame handles of the soap films, and the sofa contact test with cached samples.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {referenceOrbit, ORBIT_CAPACITY} from '../site/js/fractal-gl.js';
import {escape} from '../site/js/gallery-math.js';
import * as Soap from '../site/js/gallery-soap-model.js';
import * as Sofa from '../site/js/gallery-sofa-model.js';

test('reference orbit is the double-precision orbit, and stops when it leaves a large disc', () => {
  const o = referenceOrbit(0, 0, -0.5, 0.1, 50);
  let x = 0, y = 0;
  for (let n = 0; n < o.length; n++) { assert.ok(Math.abs(o.data[2 * n] - x) < 1e-6 && Math.abs(o.data[2 * n + 1] - y) < 1e-6); const t = x * x - y * y - 0.5; y = 2 * x * y + 0.1; x = t; }
  assert.equal(o.length, 51);                                   // c in the set: max + 1 entries
  const e = referenceOrbit(0, 0, 1, 1, 500);                    // escapes at once
  assert.ok(e.length < 12 && e.length >= 3);
  assert.equal(referenceOrbit(0, 0, 0, 0, 100000).length, ORBIT_CAPACITY);   // capacity bound
  assert.equal(escape(0, 0, 1, 1, 50) < 5, true);
});

test('soap frame handles: the handle ends where it was put, the wire stays continuous, the film keeps relaxing', () => {
  for (const f of Soap.SOAP_FRAMES) {
    const mesh = Soap.makeSoapFrame(f.id), handles = Soap.frameHandleIds(mesh), k = 1, before = mesh.pts[handles[k].id].slice();
    for (let s = 0; s < 6; s++) { const p = mesh.pts[handles[k].id]; Soap.moveFrameHandle(mesh, handles, k, [p[0] + .05, p[1] + .03, p[2] + .06]); }
    const after = mesh.pts[handles[k].id];
    assert.ok(Math.abs(after[0] - before[0] - .3) < 1e-9 && Math.abs(after[1] - before[1] - .18) < 1e-9 && Math.abs(after[2] - before[2] - .36) < 1e-9, f.id);
    assert.ok(mesh.pts.every((p) => p.every(Number.isFinite)));
    for (const wire of mesh.wires) for (let i = 0; i < wire.length; i++) { const a = mesh.pts[wire[i]], b = mesh.pts[wire[(i + 1) % wire.length]]; assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < .5, `${f.id} wire jump`); }
    const area0 = Soap.meshArea3D(mesh); let drop = 0; for (let i = 0; i < 60; i++) drop += Soap.relaxMesh3D(mesh).drop;
    assert.ok(drop > 0 && Soap.meshArea3D(mesh) < area0, f.id);
  }
  const t = Soap.tetraFilm(.18), h = Soap.frameHandleIds(t);
  assert.equal(h.length, 4); Soap.moveFrameHandle(t, h, 0, [1.2, 1.1, 1]); assert.deepEqual(t.pts[0], [1.2, 1.1, 1]);
  Soap.moveFrameHandle(t, h, 0, [9, 9, 9]); assert.deepEqual(t.pts[0], Soap.FRAME_LIMIT);   // clamped
});

test('sofa contact test with cached boundary samples agrees with the placed-outline definition', () => {
  const poly = Sofa.hammersley(Sofa.HAMMERSLEY_R), c0 = Sofa.centroid(poly);
  const direct = (pose) => { const placed = Sofa.place(poly, pose); return Sofa.boundary(placed, .02).every((p) => Sofa.inHallway(p, 1e-5)) && !(Sofa.contains(placed, [0, 0]) && placed.every((p, i) => Sofa.segmentDistance([0, 0], p, placed[(i + 1) % placed.length]) > 1e-7)); };
  let agree = 0, total = 0;
  for (let i = 0; i < 400; i++) { const pose = { x: -2.2 + 2.4 * ((i * 37) % 101) / 100, y: -.4 + 1.2 * ((i * 53) % 97) / 96, a: -1.6 * ((i * 29) % 89) / 88 }; total++; if (Sofa.fits(poly, pose, 1e-5) === direct(pose)) agree++; }
  assert.equal(agree, total);
  void c0;
});
