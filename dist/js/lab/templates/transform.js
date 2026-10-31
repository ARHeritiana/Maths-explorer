// Template `transform`: a map applied to points, a figure and a grid. Two equal-scale panels, `before` and `after`, side by
// side (stacked on a narrow stage), with the same fixed range so that sizes can be compared. Handles may sit in either
// panel (the parameter of the map in `after`, a test point in `before`); a dashed link joins a point to its image.
import { layoutPanels, panelView, drawAxes, drawScene, drawHandles, buildHandles } from "../plot.js";

export function mount(env) {
  const { exp, stage, fmt, getState, getShown = getState, setState, ghost, isUnlocked } = env;
  const ids = ["before", "after"], specs = ids.map((id) => exp.views[id]), ctx = { fmt, lang: fmt.lang, stage, unlocked: isUnlocked };
  let views = {};
  function layout() {
    const rects = layoutPanels(stage.W, stage.H, [{ share: 0.5 }, {}]);
    ids.forEach((id, i) => { views[id] = panelView(stage, id, rects[i], specs[i], { camId: "plane" }); });
    return views;
  }
  layout();
  const handles = buildHandles({ exp, fmt, getState, getShown, setState, views: () => layout(), panels: ids });

  function draw(g) {
    layout();
    const s = getShown(), other = ghost();
    ids.forEach((id, i) => {
      const v = views[id];
      drawAxes(g, v, specs[i], stage, fmt);
      if (other) drawScene(g, v, specs[i].scene(other, ctx), stage, { ghost: true });
      drawScene(g, v, specs[i].scene(s, ctx), stage);
    });
    for (const l of exp.views.links?.(s, ctx) || []) {
      const a = views[l.from.panel], b = views[l.to.panel];
      g.save(); g.strokeStyle = stage.color(l.color || "muted"); g.lineWidth = 1.5; g.setLineDash([5, 5]);
      g.beginPath(); g.moveTo(a.X(l.from.at[0]), a.Y(l.from.at[1])); g.lineTo(b.X(l.to.at[0]), b.Y(l.to.at[1])); g.stroke(); g.restore();
    }
    drawHandles(g, stage, handles, isUnlocked);
  }
  return { draw, handles, destroy() {} };
}
