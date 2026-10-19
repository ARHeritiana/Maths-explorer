// Template `family`: a function family whose parameters are the points of the graph. One or two panels (graph and unit
// circle), handles on the figure, fixed ranges. No experiment-specific code: the experiment returns a scene (see plot.js).
import { layoutPanels, panelView, drawAxes, drawScene, drawHandles, buildHandles } from "../plot.js";

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const ids = exp.views.panels || ["graph"];
  const specs = ids.map((id) => exp.views[id]);
  let views = {};
  const ctx = { fmt, lang: fmt.lang, stage };

  // `views.row` keeps the panels side by side at every width. A panel with `alignY: "<other panel>"` takes the vertical scale
  // of that panel (same height in pixels for the same value, so a horizontal line joins equal values); its own camera then zooms
  // and pans horizontally only, the vertical follows the other panel.
  function layout() {
    let rects;
    if (exp.views.row && stage.W < stage.H * 1.25) {
      // a tall stage (a phone) kept in a row: half the width each, in a centred band (the full height would only add empty grid)
      const h = Math.min(stage.H, Math.round(stage.W * 0.8)), top = Math.round((stage.H - h) / 2);
      rects = layoutPanels(stage.W, h, [{ ...specs[0], share: 0.5 }, ...specs.slice(1)], true).map((r) => ({ ...r, y: r.y + top }));
    } else rects = layoutPanels(stage.W, stage.H, specs, !!exp.views.row);
    views = {};
    ids.forEach((id, i) => {
      const spec = specs[i], o = spec.alignY && views[spec.alignY];
      if (!o) { views[id] = panelView(stage, id, rects[i], spec); return; }
      const first = panelView(stage, id, rects[i], spec, { axis: "x" });
      views[id] = panelView(stage, id, rects[i], { ...spec, y: [o.iY(first.top + first.height), o.iY(first.top)] }, { axis: "x" });
    });
  }
  layout();

  const handles = buildHandles({ exp, fmt, getState, setState, views: () => views, panels: ids });

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
    drawHandles(g, stage, handles, isUnlocked);
  }

  return { draw, handles, views: () => views, destroy() {} };
}
