// Direct manipulation stays on the same parameter grid as the native sliders.
export function snapParameter(value, parameter) {
  const [, min, max, step] = parameter;
  if (!Number.isFinite(value)) return null;
  return Math.max(min, Math.min(max, Number((min + Math.round((value - min) / step) * step).toFixed(10))));
}

export function manipulate(id, handle, values, position, mode = "arithmetic", direction = 1) {
  const next = [...values];
  const { x, y } = position;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { values: next, direction };
  switch (id) {
    case "quadratic":
      if (handle === "intercept") next[2] = y;
      if (handle === "bend") next[0] = (y - 2 * next[1] - next[2]) / 4;
      break;
    case "trig": next[0] = ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360; break;
    case "sequences":
      if (handle === "first") next[0] = y;
      if (handle === "second") next[1] = mode === "geometric" ? y / next[0] : y - next[0];
      break;
    case "probability": next[1] = x / next[0]; break;
    case "derivative":
      if (handle === "base") next[0] = x;
      if (handle === "nearby") { next[1] = Math.abs(x - next[0]); direction = x < next[0] ? -1 : 1; }
      break;
    case "integral": next[0] = x > 0 ? 1 / x : 100; break;
    case "vectors": { const i = handle === "u" ? 0 : 2; next[i] = x; next[i + 1] = y; break; }
    case "complex": next[0] = x; next[1] = y; break;
  }
  return { values: next, direction };
}

export function graphPosition(svgPoint, bounds) {
  return {
    x: bounds.xmin + (svgPoint.x - 48) / 650 * (bounds.xmax - bounds.xmin),
    y: bounds.ymin + (314 - svgPoint.y) / 292 * (bounds.ymax - bounds.ymin),
  };
}
