// The ray farm: chunks traced anywhere give the same rays as tracing them one by one; the cap stops the work; a cancelled job is ignored.
import test from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS} from '../site/js/illumination-presets.js';
import * as M from '../site/js/illumination-model.js';
import {traceChunk, createFarm, inlineWorker} from '../site/js/illumination-farm.js';
const room = PRESETS.tokarsky, angle = 0.173;
const reference = (rays, bounces) => { let n = 0, len = 0; for (let i = 0; i < rays; i++) { const th = angle + i * M.TAU / rays, p = M.trace(room.edges, room.source, [Math.cos(th), Math.sin(th)], bounces); n += p.points.length - 1; len += p.length; } return {n, len}; };
const run = (farm, opts) => new Promise((resolve) => { const chunks = []; farm.run({edges: room.edges, source: room.source, angle, onChunk: (c) => chunks.push(c), onDone: (s) => resolve({stats: s, chunks}), ...opts}); });
test('traceChunk covers exactly the segments of the single-ray tracer, and is independent of the cut', () => {
  const ref = reference(120, 60), a = traceChunk(room.edges, room.source, angle, 120, 0, 120, 60);
  assert.equal(a.count, ref.n); assert.ok(Math.abs(a.length - ref.len) < 1e-6 * ref.len);
  let n = 0; for (let from = 0; from < 120; from += 17) n += traceChunk(room.edges, room.source, angle, 120, from, Math.min(120, from + 17), 60).count;
  assert.equal(n, ref.n);
  assert.equal(a.segments.length, a.count * 4); assert.ok([...a.segments].every(Number.isFinite));
});
test('the farm returns every ray once, whatever the number of workers', async () => {
  const ref = reference(500, 40);
  for (const workers of [1, 3, 8]) {
    const farm = createFarm({make: inlineWorker, workers}), {stats, chunks} = await run(farm, {rays: 500, bounces: 40, segmentCap: Infinity});
    assert.equal(stats.rays, 500, 'workers ' + workers); assert.equal(stats.segments, ref.n); assert.equal(chunks.reduce((s, c) => s + c.count, 0), ref.n);
    assert.equal(stats.corners + stats.tangents + stats.escaped + stats.limit, 500, 'every ray has a reason'); assert.equal(stats.capped, false);
    assert.ok(chunks.length >= workers, 'the work was cut into at least one chunk per worker'); farm.destroy();
  }
});
test('the segment cap stops the work and says so; the cap is never exceeded by more than one chunk', async () => {
  const farm = createFarm({make: inlineWorker, workers: 4}), {stats, chunks} = await run(farm, {rays: 4000, bounces: 100, segmentCap: 5000});
  assert.equal(stats.capped, true); assert.ok(stats.segments >= 5000); assert.ok(stats.rays < 4000);
  const biggest = Math.max(...chunks.map((c) => c.count)); assert.ok(stats.segments < 5000 + biggest * 4 + 1);
  farm.destroy();
});
test('a new job cancels the previous one: the old results never reach the new callbacks', async () => {
  const farm = createFarm({make: inlineWorker, workers: 2}); let staleDone = false;
  farm.run({edges: room.edges, source: room.source, angle, rays: 2000, bounces: 100, segmentCap: Infinity, onChunk: () => { throw new Error('stale chunk delivered'); }, onDone: () => { staleDone = true; }});
  const second = await run(farm, {rays: 100, bounces: 20, segmentCap: Infinity});
  assert.equal(second.stats.rays, 100); assert.equal(staleDone, false); farm.destroy();
});
test('bounces up to 2000 are accepted by the tracer, more is refused', () => {
  assert.doesNotThrow(() => M.trace(room.edges, room.source, [1, 0.3], 2000)); assert.throws(() => M.trace(room.edges, room.source, [1, 0.3], 2001), RangeError);
  assert.throws(() => M.traceReference(room.edges, room.source, [1, 0.3], 301), RangeError);
});
