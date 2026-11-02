// Web Worker of the mirrored rooms' light: computes the beams and the lit grid of illumination-light.js away from the page, so the
// page only paints a picture and dragging stays smooth.
import { lightMap } from './illumination-light.js';
self.onmessage = (e) => {
  const { id, edges, source, options, res } = e.data;
  const r = lightMap(edges, source, options, res);
  self.postMessage({ id, ...r }, [r.level.buffer, r.grid.mask.buffer]);
};
