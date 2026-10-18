// Template `family`: a function family whose parameters are the points of the graph. One or two panels (graph and unit
// circle), handles on the figure, fixed ranges. No experiment-specific code: the experiment returns a scene (see plot.js).
import { layoutPanels, makeView, drawAxes, drawScene, drawHandle } from "../plot.js";
import { snap, clamp } from "../models/num.js";

const asGrid = (g) => (Array.isArray(g) ? g : [g || 0, g || 0]);

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const ids = exp.views.panels || ["graph"];
  const specs = ids.map((id) => exp.views[id]);
  let views = {};
  const ctx = { fmt, lang: fmt.lang, stage };

  function layout() {
    const rects = layoutPanels(stage.W, stage.H, specs);
    views = {};
    ids.forEach((id, i) => { views[id] = makeView(rects[i], specs[i]); });
  }
  layout();

  // Handles: one engine handle per `handle` control, locked or not (locked ones are only drawn).
  const handles = [];
  for (const [id, c] of Object.entries(exp.controls)) {
    if (c.kind !== "handle") continue;
    const panel = c.panel || ids[0], axis = c.axis || "xy", [gx, gy] = asGrid(c.grid);
    const view = () => views[panel];
    handles.push({
      id, control: c, panel,
      label: fmt.t(c.label), color: c.color || "accent", absolute: !!c.absolute,
      pos() {
        const v = view(), [wx, wy] = c.at(getState());
        return [clamp(v.X(wx), v.left + 6, v.left + v.width - 6), clamp(v.Y(wy), v.top + 6, v.top + v.height - 6)];
      },
      drag(sx, sy) {
        const v = view(), s = getState();
        const next = c.drag(s, snap(v.iX(sx), gx), snap(v.iY(sy), gy));
        if (next) setState(next);
      },
      nudge(dx, dy) {
        const s = getState();
        if (c.nudge) { const next = c.nudge(s, dx, dy); if (next) setState(next); return; }
        if (axis === "x") { dx = dx || dy; dy = 0; } else if (axis === "y") { dy = dy || dx; dx = 0; }
        const [wx, wy] = c.at(s), next = c.drag(s, snap(wx + dx * gx, gx), snap(wy + dy * gy, gy));
        if (next) setState(next);
      },
      valuetext: () => c.valuetext?.(getState(), fmt) || "",
    });
  }

  function draw(g) {
    layout();
    const s = getState(), other = ghost();
    ids.forEach((id, i) => {
      const v = views[id], spec = specs[i];
      drawAxes(g, v, spec, stage, fmt);
      if (other) drawScene(g, v, spec.scene(other, ctx), stage, { ghost: true });
      drawScene(g, v, spec.scene(s, ctx), stage);
    });
    // Links between panels (a dashed line from a point of the circle to its image on the graph).
    for (const l of exp.views.links?.(s, ctx) || []) {
      const a = views[l.from.panel], b = views[l.to.panel];
      g.save(); g.strokeStyle = stage.color(l.color || "muted"); g.lineWidth = 1.5; g.setLineDash([5, 5]);
      g.beginPath(); g.moveTo(a.X(l.from.at[0]), a.Y(l.from.at[1])); g.lineTo(b.X(l.to.at[0]), b.Y(l.to.at[1])); g.stroke(); g.restore();
    }
    for (const h of handles) {
      const [x, y] = h.pos();
      drawHandle(g, stage, x, y, { color: h.color, locked: !isUnlocked(h.id) });
    }
  }

  return { draw, handles, views: () => views, destroy() {} };
}
