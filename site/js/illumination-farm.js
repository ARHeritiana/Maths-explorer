// Tracing hundreds of thousands of rays for hundreds of bounces: the work is cut into chunks of rays, spread over Web Workers (one
// per spare core, as many as device-capability.js allows) and the segments come back as typed arrays, chunk after chunk, so the
// picture builds up while the page stays responsive. Without Worker the same chunks run on the main thread in short slices.
// `traceChunk` is the pure part (also used by the worker and by the tests); a ray is the one of illumination-model.js `trace`.
import { trace } from './illumination-model.js';

// Rays from..to-1 of `rays` evenly spaced directions starting at `angle`; segments are flat x1 y1 x2 y2 in room units.
export function traceChunk(edges, source, angle, rays, from, to, bounces, maxSegments = Infinity) {
  let capacity = 4096, out = new Float32Array(capacity * 4), n = 0, escaped = 0, corners = 0, tangents = 0, limit = 0, length = 0, done = 0;
  for (let i = from; i < to; i++) {
    const theta = angle + i * 2 * Math.PI / rays, path = trace(edges, source, [Math.cos(theta), Math.sin(theta)], bounces), pts = path.points;
    if (n + pts.length - 1 > capacity) { capacity = Math.max(capacity * 2, n + pts.length); const bigger = new Float32Array(capacity * 4); bigger.set(out.subarray(0, n * 4)); out = bigger; }
    for (let k = 1; k < pts.length; k++) { out[n * 4] = pts[k - 1][0]; out[n * 4 + 1] = pts[k - 1][1]; out[n * 4 + 2] = pts[k][0]; out[n * 4 + 3] = pts[k][1]; n++; }
    length += path.length; done++;
    if (path.reason === 'escaped') escaped++; else if (path.reason === 'corner') corners++; else if (path.reason === 'tangent') tangents++; else if (path.reason === 'limit') limit++;
    if (n >= maxSegments) break;
  }
  return { segments: out.slice(0, n * 4), count: n, rays: done, escaped, corners, tangents, limit, length };
}

// A worker-like object that runs the chunks on this thread, one macrotask each (tests, and devices without Worker).
export function inlineWorker() {
  let ctx = null; const w = { onmessage: null, postMessage(m) {
    if (m.type === 'setup') { ctx = m; return; }
    setTimeout(() => { if (w.dead) return; const r = traceChunk(ctx.edges, ctx.source, ctx.angle, ctx.rays, m.from, m.to, ctx.bounces); w.onmessage?.({ data: { type: 'chunk', id: m.id, ...r } }); }, 0);
  }, terminate() { w.dead = true; } };
  return w;
}
export function moduleWorker(url) { const w = new Worker(url, { type: 'module' }); return w; }

// A farm keeps up to `workers` workers (made by `make`). `run` starts a job and cancels the previous one.
export function createFarm({ make, workers }) {
  const pool = []; let job = 0;
  const ensure = () => { while (pool.length < Math.max(1, workers)) pool.push(make()); };
  const api = {
    // onChunk(result) per chunk (segments transferred to the caller); onDone({ capped, rays, segments, ... }) once.
    run({ edges, source, angle, rays, bounces, segmentCap, chunkRays, onChunk, onDone }) {
      ensure(); const id = ++job, total = Math.max(1, Math.ceil(rays / (chunkRays || Math.max(64, Math.ceil(rays / (pool.length * 24))))));
      const size = Math.ceil(rays / total), stats = { rays: 0, segments: 0, escaped: 0, corners: 0, tangents: 0, limit: 0, length: 0, capped: false };
      let next = 0, outstanding = 0, finished = false;
      const finish = () => { if (!finished && outstanding === 0) { finished = true; onDone?.({ ...stats }); } };
      const feed = (w) => {
        if (id !== job || finished) return;
        if (stats.segments >= segmentCap) { stats.capped = true; finish(); return; }
        if (next >= total) { finish(); return; }
        const from = next * size, to = Math.min(rays, from + size); next++; outstanding++; w.postMessage({ type: 'chunk', id: id * 1e6 + next, from, to });
      };
      pool.forEach((w) => {
        w.postMessage({ type: 'setup', edges, source, angle, rays, bounces });
        w.onmessage = (e) => {
          const m = e.data; if (m.type !== 'chunk' || Math.floor(m.id / 1e6) !== id) return;   // a result of a cancelled job
          outstanding--; for (const k of ['rays', 'escaped', 'corners', 'tangents', 'limit', 'length']) stats[k] += m[k]; stats.segments += m.count;
          onChunk?.(m); feed(w);
        };
        feed(w);
      });
      return { cancel() { if (id === job) job++; } };
    },
    cancel() { job++; },
    destroy() { job++; pool.forEach((w) => w.terminate?.()); pool.length = 0; },
    get size() { return pool.length; },
  };
  return api;
}
