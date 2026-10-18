// Template `chance`: a random experiment repeated many times. A histogram of observed frequencies (and, only when the
// experiment's state says so, the theoretical probabilities) above a tray with the last experiments, one row each. The
// run buttons are an `action` control of the shell; the simulation itself is pure and seeded (the experiment's model), so
// drawing never creates an element and never calls Math.random.
import { makeView, drawAxes, drawScene, drawHandle, buildHandles } from "../plot.js";

const call = (v, s) => (typeof v === "function" ? v(s) : v);

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const spec = exp.views.histogram, tray = exp.views.tray;
  const ctx = { fmt, lang: fmt.lang, stage, unlocked: isUnlocked };

  // The panels depend on the state only through the number of bars (the x range); the camera does not depend on it.
  function build(s) {
    const W = stage.W, H = stage.H, trayH = Math.round(Math.min(150, Math.max(92, H * 0.3)));
    const resolved = { ...spec, x: call(spec.x, s), xTicks: call(spec.xTicks, s), pad: [40, 12, 12, 26] };
    return { hist: makeView({ x: 0, y: 0, w: W, h: H - trayH }, resolved), tray: { x: 0, y: H - trayH, w: W, h: trayH }, spec: resolved };
  }
  const handles = buildHandles({ exp, fmt, getState, setState, views: () => ({ hist: build(getState()).hist }), panels: ["hist"] });

  function drawTray(g, r, s) {
    const rows = tray.rows(s), n = tray.columns(s), shown = 6, pal = stage.pal;
    g.save();
    g.fillStyle = pal.muted; g.font = stage.font(14); g.textAlign = "left";
    g.fillText(fmt.t(tray.title), r.x + 10, r.y + 16);
    if (!rows.length) {
      g.fillStyle = pal.muted; g.font = stage.font(15, 400, true);
      g.fillText(fmt.t(tray.empty), r.x + 10, r.y + r.h / 2 + 8);
      g.restore();
      return;
    }
    const top = r.y + 26, rowH = Math.min(20, (r.h - 30) / shown), rad = Math.max(3, Math.min(7, rowH * 0.36, (r.w - 120) / (n * 2.6)));
    rows.forEach((row, i) => {
      const y = top + i * rowH + rowH / 2, left = r.x + 16;
      row.forEach((hit, j) => {
        const x = left + j * rad * 2.6 + rad;
        g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2);
        if (hit) { g.fillStyle = stage.color("accent"); g.fill(); } else { g.lineWidth = 1.4; g.strokeStyle = pal.muted; g.stroke(); }
      });
      g.fillStyle = pal.ink; g.font = stage.font(Math.max(12, Math.min(16, rowH * 0.8)), 600); g.textAlign = "left";
      g.fillText("= " + row.reduce((a, b) => a + b, 0), left + n * rad * 2.6 + 6, y + 5);
    });
    g.restore();
  }

  function draw(g) {
    const s = getState(), other = ghost(), b = build(s);
    drawAxes(g, b.hist, b.spec, stage, fmt);
    if (other) drawScene(g, b.hist, spec.scene(other, ctx), stage, { ghost: true });
    drawScene(g, b.hist, spec.scene(s, ctx), stage);
    drawTray(g, b.tray, s);
    g.save(); g.strokeStyle = stage.pal.line; g.lineWidth = 1; g.beginPath(); g.moveTo(0, b.tray.y + 0.5); g.lineTo(stage.W, b.tray.y + 0.5); g.stroke(); g.restore();
    for (const h of handles) { const [x, y] = h.pos(); drawHandle(g, stage, x, y, { color: h.color, locked: !isUnlocked(h.id) }); }
  }
  return { draw, handles, destroy() {} };
}
