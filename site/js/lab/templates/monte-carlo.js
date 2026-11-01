// Surface of the Monte Carlo experiments (template `inference`, delegated from templates/inference.js): one canvas with the trials,
// a user-started run at a fixed number of trials per SECOND (time-based, so it does not depend on the refresh rate of the display),
// the estimate with its approximate interval and the exact reference, the convergence of the estimate, a table of checkpoints
// and the pseudocode. Reduced motion: the run button adds one batch per press and nothing is animated.
import * as M from "../models/monte-carlo.js";
import { capability } from "../../device-capability.js";

const el = (tag, cls = "", text = "") => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
export const SPEEDS = { slow: 30, normal: 600, fast: 6000 };   // trials per second
const CHECKPOINTS = [10, 100, 1000, 10000];

export function mountMonteCarlo({ exp, stage, fmt, getState, setState, advance }) {
  const cfg = exp.monteCarlo, kind = cfg.kind, t = fmt.t, fr = fmt.fr, root = stage.wrap;
  const step = advance || setState, model = exp.model.model;
  const abort = new (root.ownerDocument.defaultView.AbortController)(), on = (n, ev, fn, o) => n.addEventListener(ev, fn, { signal: abort.signal, ...o });
  let alive = true, running = false, raf = 0, last = null, carry = 0, rate = SPEEDS.normal, showRef = true, hideNow = false, previous = "", note = null, lastStatus = 0;
  // a check mission sets `hide`: the quantity it asks for (the reference, the theoretical standard deviation) stays out of sight
  const shown = () => showRef && !hideNow;

  const premise = el("p", "inference-assumption", t(cfg.assumption));
  const figure = el("div", "mc-figure"), canvas = el("canvas", "mc-canvas"), hint = el("p", "inference-plot-note", t(cfg.hint));
  canvas.setAttribute("role", "img"); canvas.tabIndex = -1;
  if (kind === "lake") canvas.classList.add("is-draw");
  figure.append(canvas);
  const bar = el("div", "mc-bar"), runBtn = el("button", "btn btn-secondary mc-run"), speedLabel = el("label", "mc-speed"), speed = el("select"), refBtn = el("button", "btn btn-secondary");
  runBtn.type = refBtn.type = "button"; runBtn.setAttribute("aria-pressed", "false");
  speed.id = `mc-speed-${exp.id}`; speedLabel.htmlFor = speed.id;
  speedLabel.append(el("span", "", t(["Vitesse", "Speed"])), speed);
  for (const [key, per] of Object.entries(SPEEDS)) {
    const o = el("option", "", `${t(key === "slow" ? ["Lente", "Slow"] : key === "fast" ? ["Rapide", "Fast"] : ["Normale", "Normal"])} (${fmt.num(per, 0)} ${t(["essais/s", "trials/s"])})`);
    o.value = key; speed.append(o);
  }
  speed.value = "normal";
  // Beyond 6,000 trials per second, and beyond 10,000 trials in all, only where this device measured fast enough: the extra speed
  // uses at most 30% of what one thread can sample, so the page keeps answering (device-capability.js).
  const turbo = { rate: 0 };
  capability({ kind: "montecarlo", gpu: false, share: 0.3, work: () => { M.createSampler("pi", {}, 1, { track: false }).advance(20000); return 20000; } }).then((r) => {
    if (!alive) return;
    M.setMaxRuns(r.limits.runs);
    if (r.tier !== "basic") {
      turbo.rate = r.limits.trialsPerSecond;
      const o = el("option", "", `${t(["Très rapide", "Very fast"])} (${fmt.num(turbo.rate, 0)} ${t(["essais/s", "trials/s"])}, ${t(["jusqu’à", "up to"])} ${fmt.num(r.limits.runs, 0)})`);
      o.value = "turbo"; speed.append(o);
    }
    previous = ""; stage.invalidate();
  }).catch(() => {});
  bar.append(runBtn, speedLabel, refBtn);
  const status = el("p", "inference-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
  const stats = el("dl", "inference-stats"), pairs = Array.from({ length: 8 }, () => { const dt = el("dt"), dd = el("dd"); stats.append(dt, dd); return [dt, dd]; });
  const warn = el("p", "inference-plot-note", t(["L’intervalle est approché : il décrit la variabilité du tirage et peut être trop étroit pour une fonction pointue ou peu d’essais. Il ne dit rien d’un mauvais modèle.", "The interval is approximate: it describes sampling variability and can be too narrow for a spiky function or few trials. It says nothing about a wrong model."]));
  const chartTitle = el("p", "mc-chart-title", t(["Convergence de l’estimation", "Convergence of the estimate"]));
  const chart = el("canvas", "mc-chart"); chart.setAttribute("role", "img");
  const table = el("table", "mc-table"); table.setAttribute("role", "table");
  const cap = el("caption", "", t(["Estimation à quelques nombres d’essais", "Estimate at a few numbers of trials"])), tbody = el("tbody"), thead = el("thead");
  const hr = el("tr"); for (const h of [["Essais N", "Trials N"], ["Estimation", "Estimate"], ["Erreur absolue", "Absolute error"]]) { const th = el("th", "", t(h)); th.scope = "col"; hr.append(th); }
  thead.append(hr);
  const rows = CHECKPOINTS.map((n) => { const tr = el("tr"), a = el("td", "", fmt.num(n, 0)), b = el("td"), c = el("td"); tr.append(a, b, c); tbody.append(tr); return [b, c]; });
  table.append(cap, thead, tbody);
  const formula = el("p", "inference-formula", fr || !cfg.formulaEn ? cfg.formula : cfg.formulaEn);
  const det = el("details", "mc-pseudo"), sum = el("summary", "", t(["Le programme, en pseudocode", "The program, in pseudocode"])), pre = el("pre", "", t(cfg.pseudo));
  det.append(sum, pre);
  const text = el("p", "inference-caution", t(cfg.recipe)), rateText = el("p", "inference-caution", t(cfg.rate)), caution = el("p", "inference-caution", t(cfg.caution));
  root.append(premise, figure, hint, bar, status, stats, warn, chartTitle, chart, table, formula, det, text, rateText, caution);

  // ---- the run: time-based, a fixed number of trials per second whatever the display refresh rate
  const paintRun = () => { write(runBtn, running ? t(["Pause", "Pause"]) : stage.reduced() ? t(["Un lot de 100 essais", "One batch of 100 trials"]) : t(["Lancer", "Run"])); runBtn.setAttribute("aria-pressed", String(running)); };
  function stop() { running = false; cancelAnimationFrame(raf); raf = 0; paintRun(); stage.invalidate(); }
  function tick(now) {
    raf = 0;
    if (!alive || !running) return;
    if (stage.reduced()) return stop();
    if (last === null || document.hidden) { last = now; raf = requestAnimationFrame(tick); return; }
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    carry += dt * rate;
    const k = Math.floor(carry); carry -= k;
    const s = getState();
    if (k && s.runs < M.MAX_RUNS) step({ runs: Math.min(M.MAX_RUNS, s.runs + k) });
    if (getState().runs >= M.MAX_RUNS) return stop();
    raf = requestAnimationFrame(tick);
  }
  on(runBtn, "click", () => {
    if (running) return stop();
    const s = getState();
    if (s.runs >= M.MAX_RUNS) return;
    if (stage.reduced()) { step({ runs: Math.min(M.MAX_RUNS, s.runs + 100) }); return; }
    running = true; last = null; carry = 0; paintRun(); raf = requestAnimationFrame(tick);
  });
  on(speed, "change", () => { rate = speed.value === "turbo" && turbo.rate ? turbo.rate : SPEEDS[speed.value] || SPEEDS.normal; });
  on(refBtn, "click", () => { showRef = !showRef; previous = ""; stage.invalidate(); });

  // ---- drawing a shoreline (lake): a trace of the unit square, then the polygon replaces the lake
  let geom = { x: 0, y: 0, s: 1 }, trace = null;
  const unit = (e) => { const r = canvas.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left - geom.x) / geom.s)), Math.min(1, Math.max(0, (e.clientY - r.top - geom.y) / geom.s))]; };
  if (kind === "lake") {
    on(canvas, "pointerdown", (e) => { trace = [unit(e)]; note = null; try { canvas.setPointerCapture(e.pointerId); } catch { /* jsdom */ } e.preventDefault(); });
    on(canvas, "pointermove", (e) => {
      if (!trace) return;
      const p = unit(e), q = trace.at(-1);
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.004) { trace.push(p); drawLake(true); }
      e.preventDefault();
    });
    const end = (e) => {
      if (!trace) return;
      const poly = M.polygonFromTrace(trace); trace = null;
      if (poly) { stop(); setState({ shape: "custom", poly, runs: 0 }); } else { note = t(["Tracé refusé : trop court, trop petit ou qui se croise. Dessine une boucle fermée plus grande.", "Trace refused: too short, too small or crossing itself. Draw a larger closed loop."]); previous = ""; stage.invalidate(); }
      e.preventDefault();
    };
    on(canvas, "pointerup", end); on(canvas, "pointercancel", end);
  }

  // ---- drawing
  const css = () => { const c = root.ownerDocument.defaultView.getComputedStyle(root), v = (n, d) => c.getPropertyValue(n).trim() || d; return { ink: v("--ink", "#000"), muted: v("--muted", "#595959"), line: v("--line", "#cdcdcd"), grid: v("--grid", "#ececec"), sunken: v("--sunken", "#f2f2f2"), pos: v("--pos", "#0a7a43"), out: v("--c2", "#e8710a"), blue: v("--c1", "#2563eb"), accent: v("--accent", "#d90012") }; };
  function setup(c, w, h) {
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    if (c.dataset.h !== String(h)) { c.style.height = h + "px"; c.dataset.h = String(h); }
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = c.getContext?.("2d"); if (!g) return null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); return g;
  }
  const label = (g, s, x, y, color, align = "left", size = 12) => { g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.font = `${size}px system-ui, sans-serif`; g.fillText(s, x, y); };
  const size = () => { const w = Math.max(120, Math.round(canvas.clientWidth || figure.clientWidth || 300)); return { w, h: kind === "pi" || kind === "lake" ? Math.min(w, 380) : Math.min(300, Math.round(w * 0.75)) }; };
  let cur = null;
  function drawSquare(g, w, h, m, col, overlay) {
    const pad = 18, s = Math.min(w, h) - 2 * pad - 14, x = (w - s) / 2, y = pad; geom = { x, y, s };
    g.fillStyle = col.sunken; g.fillRect(x, y, s, s);
    g.strokeStyle = col.grid; g.lineWidth = 1; g.beginPath();
    for (let i = 1; i < 10; i++) { g.moveTo(x + (s * i) / 10, y); g.lineTo(x + (s * i) / 10, y + s); g.moveTo(x, y + (s * i) / 10); g.lineTo(x + s, y + (s * i) / 10); }
    g.stroke();
    g.beginPath();
    if (kind === "pi") g.arc(x + s / 2, y + s / 2, s / 2, 0, 2 * Math.PI);
    else m.poly.forEach(([px, py], i) => (i ? g.lineTo(x + px * s, y + py * s) : g.moveTo(x + px * s, y + py * s)));
    g.closePath(); g.globalAlpha = 0.14; g.fillStyle = col.blue; g.fill("evenodd"); g.globalAlpha = 1; g.strokeStyle = col.blue; g.lineWidth = 2.5; g.stroke();
    const r = Math.max(1.4, Math.min(2.7, s / 180));
    for (const p of m.points) { g.beginPath(); g.fillStyle = p.inside ? col.pos : col.out; g.globalAlpha = 0.85; g.arc(x + p.x * s, y + p.y * s, r, 0, 2 * Math.PI); g.fill(); }
    g.globalAlpha = 1; g.strokeStyle = col.line; g.lineWidth = 1.5; g.strokeRect(x, y, s, s);
    label(g, kind === "pi" ? "2 × 2" : fr ? "10 km × 10 km" : "10 km × 10 km", w / 2, y + s + 10, col.muted, "center", 11);
    if (overlay && trace) { g.strokeStyle = col.accent; g.lineWidth = 2.5; g.setLineDash([5, 5]); g.beginPath(); trace.forEach(([px, py], i) => (i ? g.lineTo(x + px * s, y + py * s) : g.moveTo(x + px * s, y + py * s))); g.stroke(); g.setLineDash([]); }
  }
  function drawIntegral(g, w, h, m, col, s) {
    const L = 38, R = 12, T = 12, B = 26, W = w - L - R, H = h - T - B, b = m.b, top = 1.1, f = M.INTEGRANDS[s.fn].f;
    const X = (u) => L + u * W, Y = (v) => T + H - (v / top) * H;
    g.fillStyle = col.sunken; g.fillRect(L, T, W, H);
    g.strokeStyle = col.grid; g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const yy = Y(i / 4); g.beginPath(); g.moveTo(L, yy); g.lineTo(L + W, yy); g.stroke(); label(g, fmt.num(i / 4, 2), L - 5, yy, col.muted, "right", 10); }
    g.beginPath(); g.moveTo(X(0), Y(0)); for (let i = 0; i <= 240; i++) g.lineTo(X(i / 240), Y(f((i / 240) * b))); g.lineTo(X(1), Y(0)); g.closePath(); g.globalAlpha = 0.13; g.fillStyle = col.blue; g.fill(); g.globalAlpha = 1;
    g.beginPath(); for (let i = 0; i <= 240; i++) (i ? g.lineTo : g.moveTo).call(g, X(i / 240), Y(f((i / 240) * b))); g.strokeStyle = col.blue; g.lineWidth = 2.4; g.stroke();
    g.save(); g.beginPath(); g.rect(L, T, W, H); g.clip();
    for (const p of m.points) { g.strokeStyle = col.muted; g.globalAlpha = 0.25; g.beginPath(); g.moveTo(X(p.x), Y(0)); g.lineTo(X(p.x), Y(p.value)); g.stroke(); g.globalAlpha = 0.85; g.fillStyle = col.pos; g.beginPath(); g.arc(X(p.x), Y(p.value), 2.4, 0, 2 * Math.PI); g.fill(); }
    g.restore(); g.globalAlpha = 1;
    if (m.n) { g.setLineDash([6, 5]); g.strokeStyle = col.out; g.lineWidth = 1.8; g.beginPath(); g.moveTo(L, Y(m.meanHeight)); g.lineTo(L + W, Y(m.meanHeight)); g.stroke(); g.setLineDash([]); }
    g.strokeStyle = col.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + H); g.lineTo(L + W, T + H); g.stroke();
    label(g, "0", L, T + H + 14, col.muted, "center", 11); label(g, String(b), L + W, T + H + 14, col.muted, "center", 11); label(g, "x", L + W - 4, T + H - 10, col.ink, "right", 12);
  }
  function drawWalk(g, w, h, m, col, s) {
    const L = 34, R = 12, T = 14, B = 26, W = w - L - R, H = h - T - B, high = s.upper + 1, low = -s.lower - 1;
    const maxT = Math.max(18, ...m.walks.map((p) => p.path.length - 1));
    const X = (k) => L + (k / maxT) * W, Y = (v) => T + ((high - v) / (high - low)) * H;
    g.fillStyle = col.sunken; g.fillRect(L, T, W, H);
    for (let v = -s.lower; v <= s.upper; v++) { g.strokeStyle = v === 0 ? col.line : col.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(L + W, Y(v)); g.stroke(); }
    for (const [v, c] of [[s.upper, col.pos], [-s.lower, col.out]]) { g.setLineDash([5, 5]); g.strokeStyle = c; g.lineWidth = 1.8; g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(L + W, Y(v)); g.stroke(); g.setLineDash([]); label(g, (v > 0 ? "+" : "−") + Math.abs(v), L - 5, Y(v), c, "right"); }
    m.walks.forEach((wk, i) => {
      const lastOne = i === m.walks.length - 1, c = wk.success ? col.pos : col.out;
      g.beginPath(); wk.path.forEach((v, k) => (k ? g.lineTo(X(k), Y(v)) : g.moveTo(X(k), Y(v))));
      g.globalAlpha = lastOne ? 1 : 0.22; g.strokeStyle = c; g.lineWidth = lastOne ? 2.8 : 1.2; g.stroke(); g.globalAlpha = 1;
      if (lastOne) { g.beginPath(); g.arc(X(wk.path.length - 1), Y(wk.path.at(-1)), 5, 0, 2 * Math.PI); g.fillStyle = c; g.fill(); }
    });
    g.strokeStyle = col.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + H); g.lineTo(L + W, T + H); g.stroke();
    label(g, t(["nombre de pas", "number of steps"]), L + W, T + H + 14, col.muted, "right", 11);
    if (!m.walks.length) label(g, t(["Lance des marches pour voir les trajectoires", "Run walks to see the paths"]), L + W / 2, T + H / 2, col.muted, "center");
  }
  function drawLake(overlay) { if (!cur) return; const { w, h } = size(), g = setup(canvas, w, h); if (g) drawSquare(g, w, h, cur.m, cur.col, overlay); }
  function drawChart(m, col, digits) {
    const w = Math.max(120, Math.round(chart.clientWidth || figure.clientWidth || 300)), h = 170, g = setup(chart, w, h); if (!g) return;
    const L = 46, R = 10, T = 10, B = 24, W = w - L - R, H = h - T - B, ys = m.history.map((p) => p[1]);
    let lo = Math.min(...ys, shown() ? m.reference : Infinity), hi = Math.max(...ys, shown() ? m.reference : -Infinity);
    if (!ys.length) { lo = shown() ? m.reference * 0.85 : 0; hi = shown() ? m.reference * 1.15 : 1; }
    const pad = (hi - lo || Math.abs(hi) * 0.1 || 0.1) * 0.15; lo -= pad; hi += pad;
    const X = (n) => L + (m.n > 1 ? (n - 1) / (m.n - 1) : 0.5) * W, Y = (v) => T + ((hi - v) / (hi - lo)) * H;
    g.fillStyle = col.sunken; g.fillRect(L, T, W, H); g.strokeStyle = col.grid; g.lineWidth = 1;
    for (let i = 0; i <= 3; i++) { const yy = T + (H * i) / 3; g.beginPath(); g.moveTo(L, yy); g.lineTo(L + W, yy); g.stroke(); label(g, fmt.num(hi - ((hi - lo) * i) / 3, 3), L - 5, yy, col.muted, "right", 10); }
    if (shown()) { g.setLineDash([7, 5]); g.strokeStyle = col.out; g.lineWidth = 1.6; g.beginPath(); g.moveTo(L, Y(m.reference)); g.lineTo(L + W, Y(m.reference)); g.stroke(); g.setLineDash([]); }
    if (ys.length) { g.beginPath(); m.history.forEach(([n, y], i) => (i ? g.lineTo(X(n), Y(y)) : g.moveTo(X(n), Y(y)))); g.strokeStyle = col.blue; g.lineWidth = 2; g.lineJoin = "round"; g.stroke(); }
    else label(g, t(["Lance l’expérience pour tracer les estimations", "Run the experiment to trace the estimates"]), L + W / 2, T + H / 2, col.muted, "center");
    g.strokeStyle = col.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + H); g.lineTo(L + W, T + H); g.stroke();
    label(g, "1", L, T + H + 13, col.muted, "center", 11); label(g, "N = " + fmt.num(m.n, 0), L + W, T + H + 13, col.muted, "right", 11);
  }

  const themeWatch = new MutationObserver(() => { previous = ""; stage.invalidate(); });
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  const resizeWatch = typeof ResizeObserver === "function" ? new ResizeObserver(() => { previous = ""; stage.invalidate(); }) : null;
  resizeWatch?.observe(figure);

  const d = cfg.digits, est = (v) => (v === null ? t(["Pas encore", "Not yet"]) : fmt.read(v, d));
  const now = (x) => globalThis.performance?.now?.() ?? 0;
  paintRun();
  return {
    handles: [],
    draw() {
      const s = getState(), { w, h } = size(); hideNow = !!s.hide; const key = JSON.stringify(s) + "|" + w + "|" + h + "|" + showRef + "|" + (note || "");
      if (key === previous) return; previous = key;
      const m = model(s), col = css(); cur = { m, col };
      const g = setup(canvas, w, h);
      if (g) { if (kind === "integral") drawIntegral(g, w, h, m, col, s); else if (kind === "walk") drawWalk(g, w, h, m, col, s); else drawSquare(g, w, h, m, col, false); }
      drawChart(m, col, d);
      refBtn.disabled = hideNow; write(refBtn, shown() ? t(["Masquer la référence", "Hide the reference"]) : t(["Révéler la référence", "Reveal the reference"]));
      const ref = shown() ? fmt.read(m.reference, d) : hideNow ? t(["à calculer", "to compute"]) : "•••", unit = cfg.unit ? " " + cfg.unit : "";
      const iv = m.interval ? "≈ [" + fmt.num(m.interval[0], d) + (fr ? " ; " : ", ") + fmt.num(m.interval[1], d) + "]" + unit : t(["Au moins 30 essais", "At least 30 trials"]);
      const rows8 = [
        [["Essais indépendants N", "Independent trials N"], fmt.num(m.n, 0)],
        [["Estimation", "Estimate"], m.estimate === null ? est(null) : est(m.estimate) + unit],
        [["Référence", "Reference"], shown() ? ref + unit : ref],
        [["Erreur absolue", "Absolute error"], shown() && m.error !== null ? fmt.read(m.error, d) + unit : "•••"],
        kind === "integral" ? [["Hauteur moyenne", "Mean height"], m.meanHeight === null ? est(null) : fmt.read(m.meanHeight, d)] : [["Succès / essais", "Successes / trials"], fmt.num(m.hits, 0) + " / " + fmt.num(m.n, 0)],
        [["Intervalle approché à 95 %", "Approximate 95% interval"], iv],
        [kind === "integral" ? ["Écart type estimé de l’estimation", "Estimated standard deviation of the estimate"] : ["Écart type théorique de l’estimation", "Theoretical standard deviation of the estimate"], m.standardError === null ? est(null) : hideNow ? t(["à calculer", "to compute"]) : fmt.read(m.standardError, d + 1)],
        [["L’intervalle contient la référence ?", "Does the interval contain the reference?"], !shown() || m.covered === null ? "•••" : t(m.covered ? ["Oui", "Yes"] : ["Non", "No"])],
      ];
      pairs.forEach(([a, b], i) => { write(a, t(rows8[i][0])); write(b, rows8[i][1]); });
      CHECKPOINTS.forEach((n, i) => {
        const row = m.history.find((p) => p[0] === n);
        write(rows[i][0], row ? fmt.read(row[1], d) : t(["Pas encore", "Not yet"]));
        write(rows[i][1], row && shown() ? fmt.read(Math.abs(row[1] - m.reference), d) : "•••");
      });
      const line = m.n ? `${fmt.num(m.n, 0)} ${t(["essais", "trials"])}. ${t(["Estimation", "Estimate"])} ${est(m.estimate)}${unit}.` : t(["Aucun essai pour l’instant. Lance l’expérience.", "No trial yet. Run the experiment."]);
      if (!running || now() - lastStatus > 2000 || m.n === 0) { write(status, note || line); lastStatus = now(); }
      const label2 = `${t(exp.title)}. ${line}`;
      canvas.setAttribute("aria-label", label2); chart.setAttribute("aria-label", t(["Convergence de l’estimation. ", "Convergence of the estimate. "]) + line);
      runBtn.disabled = m.n >= M.MAX_RUNS && !running;
    },
    destroy() { alive = false; running = false; cancelAnimationFrame(raf); abort.abort(); themeWatch.disconnect(); resizeWatch?.disconnect(); },
  };
}
