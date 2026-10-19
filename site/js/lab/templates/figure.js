// Template `figure`: a dynamic geometric figure with an invariant to discover. One equal-scale panel, two to four points as
// handles (or none), the experiment's scene (polygons, vectors, labels) and one measured quantity highlighted as a badge in the corner.
import { samplingStream } from "./stream.js";
import { panelView, drawAxes, drawScene, drawHandles, drawBadge, buildHandles } from "../plot.js";

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const spec = exp.views.figure, ctx = { fmt, lang: fmt.lang, stage, unlocked: isUnlocked };
  const stream = exp.stream ? samplingStream(env) : null;
  let view = null;
  const layout = () => { view = panelView(stage, "figure", { x: 0, y: 0, w: stage.W, h: stage.H }, spec); return view; };
  layout();
  const handles = buildHandles({ exp, fmt, getState, setState, views: () => ({ figure: layout() }), panels: ["figure"] });

  function draw(g) {
    const v = layout(), s = getState(), other = ghost();
    ctx.progress = stream?.progress ?? null;
    if (spec.axes !== false) drawAxes(g, v, spec, stage, fmt);   // a figure that draws its own frame (tiles, a circle, a number grid)
    if (other) drawScene(g, v, spec.scene(other, { ...ctx, progress: null }), stage, { ghost: true });
    drawScene(g, v, spec.scene(s, ctx), stage);
    const m = spec.measure?.(s, ctx);
    if (m) drawBadge(g, stage, m);
    drawHandles(g, stage, handles, isUnlocked);
  }
  return { draw, handles, stream, destroy() { stream?.stop(); } };
}
