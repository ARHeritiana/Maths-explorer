// Template `figure`: a dynamic geometric figure with an invariant to discover. One equal-scale panel, two to four points as
// handles, the experiment's scene (polygons, vectors, labels) and one measured quantity highlighted as a badge in the corner.
import { makeView, drawAxes, drawScene, drawHandle, buildHandles } from "../plot.js";

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const spec = exp.views.figure, ctx = { fmt, lang: fmt.lang, stage, unlocked: isUnlocked };
  let view = null;
  const layout = () => { view = makeView({ x: 0, y: 0, w: stage.W, h: stage.H }, spec); return view; };
  layout();
  const handles = buildHandles({ exp, fmt, getState, setState, views: () => ({ figure: layout() }), panels: ["figure"] });

  // The measured quantity: a badge whose colour says what the figure is doing (positive, negative, zero).
  function badge(g, m) {
    g.save();
    g.font = stage.font(20, 700);
    const w = g.measureText(m.text).width + 24, x = 10, y = 8;   // the corner of the stage, outside the equal-scale frame when there is room
    g.fillStyle = stage.pal.surface; g.globalAlpha = 0.92;
    g.beginPath(); g.roundRect(x, y, w, 34, 8); g.fill();
    g.globalAlpha = 1; g.lineWidth = 2; g.strokeStyle = stage.color(m.color || "ink"); g.stroke();
    g.fillStyle = stage.color(m.color || "ink"); g.textAlign = "left"; g.fillText(m.text, x + 12, y + 24);
    g.restore();
  }

  function draw(g) {
    const v = layout(), s = getState(), other = ghost();
    drawAxes(g, v, spec, stage, fmt);
    if (other) drawScene(g, v, spec.scene(other, ctx), stage, { ghost: true });
    drawScene(g, v, spec.scene(s, ctx), stage);
    const m = spec.measure?.(s, ctx);
    if (m) badge(g, m);
    for (const h of handles) { const [x, y] = h.pos(); drawHandle(g, stage, x, y, { color: h.color, locked: !isUnlocked(h.id) }); }
  }
  return { draw, handles, destroy() {} };
}
