// Template `family`: a function family whose parameters are the points of the graph. One or two panels (graph and unit
// circle), handles on the figure, fixed ranges. No experiment-specific code: the experiment returns a scene (see plot.js).
import { layoutPanels, panelView, drawAxes, drawScene, drawHandles, buildHandles } from "../plot.js";

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const ids = exp.views.panels || ["graph"];
  const specs = ids.map((id) => exp.views[id]);
  let views = {};
  const ctx = { fmt, lang: fmt.lang, stage };

  function layout() {
    const rects = layoutPanels(stage.W, stage.H, specs);
    views = {};
    ids.forEach((id, i) => { views[id] = panelView(stage, id, rects[i], specs[i]); });
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
