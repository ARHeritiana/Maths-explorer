// Template `data`: a data set on a number line. Panel `dots` (one dot per value, equal values stacked, a handle per value)
// above panel `box` (the summary strip: box plot, mean and median) sharing the same horizontal scale. The experiment's scenes
// compute everything from the model; the template only lays out, draws and exposes the handles.
import { makeView, drawAxes, drawScene, drawHandle, buildHandles } from "../plot.js";

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const specs = { dots: exp.views.dots, box: exp.views.box }, ctx = { fmt, lang: fmt.lang, stage, unlocked: isUnlocked };
  let views = {};
  function layout() {
    const W = stage.W, H = stage.H, h0 = Math.round(H * 0.4);
    views = {
      dots: makeView({ x: 0, y: 0, w: W, h: h0 }, { ...specs.dots, pad: [16, 10, 16, 6] }),
      box: makeView({ x: 0, y: h0, w: W, h: H - h0 }, { ...specs.box, pad: [16, 4, 16, 26] }),
    };
    return views;
  }
  layout();
  const handles = buildHandles({ exp, fmt, getState, setState, views: () => layout(), panels: ["dots"] });

  function draw(g) {
    layout();
    const s = getState(), other = ghost();
    for (const id of ["dots", "box"]) {
      const v = views[id], spec = specs[id];
      drawAxes(g, v, { ...spec, xLabel: id === "dots" ? () => "" : spec.xLabel }, stage, fmt);
      if (other) drawScene(g, v, spec.scene(other, ctx), stage, { ghost: true });
      drawScene(g, v, spec.scene(s, ctx), stage);
    }
    // only the handles a mission unlocks are marked: the dots themselves are the figure
    for (const h of handles) if (isUnlocked(h.id)) { const [x, y] = h.pos(); drawHandle(g, stage, x, y, { color: h.color }); }
  }
  return { draw, handles, destroy() {} };
}
