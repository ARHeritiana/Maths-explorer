// Web Worker of the mirrored rooms: traces chunks of rays for illumination-farm.js and sends back the segments as a transferable array.
import { traceChunk } from './illumination-farm.js';
let ctx = null;
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === 'setup') { ctx = m; return; }
  if (m.type === 'chunk' && ctx) {
    const r = traceChunk(ctx.edges, ctx.source, ctx.angle, ctx.rays, m.from, m.to, ctx.bounces);
    self.postMessage({ type: 'chunk', id: m.id, ...r }, [r.segments.buffer]);
  }
};
