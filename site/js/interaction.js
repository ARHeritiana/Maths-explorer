// Direct manipulation stays on the same parameter grid as the native sliders.
export function snapParameter(value, parameter) {
  const [, min, max, step] = parameter;
  if (!Number.isFinite(value)) return null;
  return Math.max(min, Math.min(max, Number((min + Math.round((value - min) / step) * step).toFixed(10))));
}

// Handles of the guided labs that are not yet experiments (probability, vectors, complex). The rebuilt experiments
// (quadratic, trig, sequences, derivative, integral) have their handles in lab/experiments/.
export function manipulate(id, handle, values, position) {
  const next = [...values];
  const { x, y } = position;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { values: next };
  switch (id) {
    case "probability": next[1] = x / next[0]; break;
    case "vectors": { const i = handle === "u" ? 0 : 2; next[i] = x; next[i + 1] = y; break; }
    case "complex": next[0] = x; next[1] = y; break;
  }
  return { values: next };
}

export function graphPosition(svgPoint, bounds) {
  return {
    x: bounds.xmin + (svgPoint.x - 48) / 650 * (bounds.xmax - bounds.xmin),
    y: bounds.ymin + (314 - svgPoint.y) / 292 * (bounds.ymax - bounds.ymin),
  };
}
