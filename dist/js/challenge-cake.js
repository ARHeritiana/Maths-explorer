// The cake challenge as an open sandbox. The visitor gets a cake they can turn in 3D, a button that locks the view from above,
// and there a small geometry kit in the manner of GeoGebra (points, segments, midpoints, intersections, circles, a grid with
// snapping). Nothing tells them where to cut: the hints (see HINT_ACTIONS in app.js) move the view and the grid for them.
// When the cuts they draw share the cake fairly, the cake is cut with a short show and turned in 3D.
import { svgEl, toLocal, clamp, colour, lockTouch } from "./challenge-kit.js";
import { cakeShares } from "./challenge-puzzles.js";
import { CENTRE, cutsOfSegments, piecePolygons, isFair, niceSide, pieceDirections, rayToOutline } from "./cake-model.js";
import { makeView, drawCake, confetti, polyCentroid } from "./cake-3d.js";

const W = 640, H = 430, CX = 320, CY = 214;
const CAM_3D = { yaw: -32, pitch: 34, scale: 236 }, CAM_TOP = { yaw: 0, pitch: 90, scale: 330 };
const mk = (c) => makeView({ ...c, cx: CX, cy: CY + 26 * clamp((90 - c.pitch) / 57, 0, 1) });   // the exploded cake sits a little lower
const ease = (x) => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k); };
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const lerp = (a, b, k) => a + (b - a) * k;
const NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function cakeLab(root, { t, q, reduced }) {
  const N = Number(q.n), gStar = niceSide(N), G0 = gStar === 8 ? 9 : 8;
  const isReduced = () => (typeof reduced === "function" ? reduced() : !!reduced);

  root.innerHTML = `
    <p class="act-help" id="ck-help"></p>
    <svg class="act-svg ck-stage" viewBox="0 0 ${W} ${H}" tabindex="0" role="application" aria-label="${t("Le gâteau cubique : fais glisser pour le tourner", "The cubic cake: drag to turn it")}"></svg>
    <div class="act-controls ck-row" id="ck-view">
      <button class="btn btn-secondary" id="ck-lock" type="button" aria-pressed="false">${t("Verrouiller la vue de dessus", "Lock the view from above")}</button>
      <button class="btn-quiet" id="ck-turn" type="button" hidden>${t("Revenir à la vue 3D", "Back to the 3D view")}</button>
    </div>
    <div id="ck-kit" hidden>
      <div class="act-buttons ck-tools" role="group" aria-label="${t("Outils de construction", "Construction tools")}">
        ${[["move", "Déplacer", "Move"], ["point", "Point", "Point"], ["segment", "Segment", "Segment"], ["mid", "Milieu", "Midpoint"], ["inter", "Intersection", "Intersection"], ["circle", "Cercle", "Circle"]]
          .map(([id, fr, en]) => `<button class="btn btn-secondary ck-tool" type="button" data-tool="${id}" aria-pressed="${id === "move"}">${t(fr, en)}</button>`).join("")}
        <button class="btn-quiet" id="ck-undo" type="button">${t("Annuler", "Undo")}</button>
        <button class="btn-quiet" id="ck-clear" type="button">${t("Tout effacer", "Clear all")}</button>
      </div>
      <div class="act-controls ck-opts">
        <label class="act-check"><input id="ck-grid" type="checkbox"> ${t("Grille", "Grid")}</label>
        <label class="act-check"><input id="ck-snap" type="checkbox" disabled> ${t("Aimanter à la grille", "Snap to the grid")}</label>
        <label class="act-field" id="ck-size-wrap" hidden for="ck-size"><span class="act-label">${t("Côté du gâteau", "Cake side")} : <output id="ck-size-out"></output> ${t("unités", "units")}</span><input id="ck-size" type="range" min="2" max="12" step="1" value="${G0}"></label>
      </div>
      <div class="act-controls" id="ck-disk" hidden>
        <label class="act-check"><input id="ck-disk-on" type="checkbox"> ${t(`Partager le disque en ${N} angles égaux`, `Split the disk into ${N} equal angles`)}</label>
      </div>
      <div class="act-controls"><button class="btn btn-primary" id="ck-cut" type="button" disabled>${t("Découper le gâteau", "Cut the cake")}</button></div>
    </div>
    <div id="ck-table"></div>
    <p class="act-readout" id="ck-read" role="status" aria-live="polite"></p>`;
  const $ = (s) => root.querySelector(s);
  const svg = $("svg"), help = $("#ck-help"), read = $("#ck-read"), table = $("#ck-table"), kit = $("#ck-kit");

  // ------------------------------------------------------------ state
  let cam = { ...CAM_3D }, phase = "3d", flying = false, tool = "move", pending = [], hover = null, grab = null, spin = null;
  let showGrid = false, snapOn = false, g = G0, nextId = 1, objs = [], history = [], disk = { on: false, theta: 0.4 };
  let anim = null, raf = 0, found = false, resultT = 0, explode = 0;
  const live = { yaw: CAM_3D.yaw, pitch: CAM_3D.pitch };

  const pt = (id) => objs.find((o) => o.id === id);
  const newPoint = (x, y, extra = {}) => { const p = { id: nextId++, type: "pt", kind: "free", x, y, ok: true, ...extra }; p.name = NAMES[objs.filter((o) => o.type === "pt").length % 26]; objs.push(p); return p; };
  function recompute() {
    for (const o of objs) {
      if (o.type !== "pt") continue;
      if (o.kind === "mid") { const a = pt(o.a), b = pt(o.b); o.x = (a.x + b.x) / 2; o.y = (a.y + b.y) / 2; o.ok = a.ok && b.ok; }
      if (o.kind === "inter") {
        const s1 = pt(o.s1), s2 = pt(o.s2), a = pt(s1.a), b = pt(s1.b), c = pt(s2.a), d = pt(s2.b), r = interSeg(a, b, c, d);
        o.ok = !!r && a.ok && b.ok && c.ok && d.ok; if (r) { o.x = r[0]; o.y = r[1]; }
      }
    }
  }
  function interSeg(a, b, c, d) {
    const r = [b.x - a.x, b.y - a.y], s = [d.x - c.x, d.y - c.y], den = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(den) < 1e-12) return null;
    const u = ((c.x - a.x) * s[1] - (c.y - a.y) * s[0]) / den, v = ((c.x - a.x) * r[1] - (c.y - a.y) * r[0]) / den;
    return u >= -1e-9 && u <= 1 + 1e-9 && v >= -1e-9 && v <= 1 + 1e-9 ? [a.x + u * r[0], a.y + u * r[1]] : null;
  }
  const segments = () => objs.filter((o) => o.type === "seg" && pt(o.a).ok && pt(o.b).ok).map((o) => [[pt(o.a).x, pt(o.a).y], [pt(o.b).x, pt(o.b).y]]);
  const currentCuts = () => cutsOfSegments(segments(), 1e-6);

  // ------------------------------------------------------------ geometry helpers (screen <-> cake coordinates)
  const toScreen = (x, y, c = cam) => [CX + c.scale * (x - 0.5), CY - c.scale * (y - 0.5)];
  const fromScreen = (sx, sy) => [0.5 + (sx - CX) / cam.scale, 0.5 - (sy - CY) / cam.scale];
  const fmt = (v) => String(Math.round(v * 100) / 100).replace(".", t(",", "."));
  function snap(w, avoidId) {
    const px = 1 / cam.scale;
    if (snapOn) {
      const gx = Math.round(w[0] * g) / g, gy = Math.round(w[1] * g) / g;
      if (Math.hypot(gx - w[0], gy - w[1]) < 16 * px) return [gx, gy];
    }
    const bx = clamp(w[0], 0, 1), by = clamp(w[1], 0, 1), dl = [Math.abs(w[1]), Math.abs(w[0] - 1), Math.abs(w[1] - 1), Math.abs(w[0])], m = Math.min(...dl);
    if (m < 11 * px && w[0] > -11 * px && w[0] < 1 + 11 * px && w[1] > -11 * px && w[1] < 1 + 11 * px) {
      const s = dl.indexOf(m);
      return s === 0 ? [bx, 0] : s === 1 ? [1, by] : s === 2 ? [bx, 1] : [0, by];
    }
    void avoidId;
    return w;
  }
  const nearestPoint = (w, r = 15) => { let best = null, bd = r / cam.scale; for (const o of objs) if (o.type === "pt" && o.ok) { const d = Math.hypot(o.x - w[0], o.y - w[1]); if (d < bd) { bd = d; best = o; } } return best; };
  const nearestSeg = (w, r = 9) => {
    let best = null, bd = r / cam.scale;
    for (const o of objs) if (o.type === "seg") {
      const a = pt(o.a), b = pt(o.b); if (!a.ok || !b.ok) continue;
      const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1e-12, k = clamp(((w[0] - a.x) * dx + (w[1] - a.y) * dy) / l2, 0, 1), d = Math.hypot(a.x + k * dx - w[0], a.y + k * dy - w[1]);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  };
  const isCentre = (p) => p && p.ok && Math.hypot(p.x - 0.5, p.y - 0.5) < 1e-6;
  const diskCircle = () => objs.find((o) => o.type === "circ" && isCentre(pt(o.c)) && pt(o.r).ok);

  // ------------------------------------------------------------ pieces of the partition currently drawn
  function partition(cuts) {
    const polys = piecePolygons(cuts);
    return polys.map((poly, k) => ({ poly, off: [0, 0, 0], tint: polys.length > 1 ? `var(--c${(k % 8) + 1})` : null, cherry: false }));
  }

  // ------------------------------------------------------------ drawing
  function overlayTop() {
    const o = svgEl("g", {}, svg), tk = (v) => toScreen(v, 0.5)[0];
    void tk;
    if (showGrid) {
      const gl = svgEl("g", { "pointer-events": "none" }, o), lo = Math.floor((0.5 - CX / cam.scale) * g) - 1, hi = Math.ceil((0.5 + CX / cam.scale) * g) + 1;
      for (let i = lo; i <= hi; i++) {
        const x = toScreen(i / g, 0)[0]; if (x >= 0 && x <= W) svgEl("line", { x1: x, y1: 0, x2: x, y2: H, stroke: "var(--ink)", "stroke-opacity": i % g === 0 ? 0.3 : 0.14, "stroke-width": 1 }, gl);
      }
      const ylo = Math.floor((0.5 - CY / cam.scale) * g) - 1, yhi = Math.ceil((0.5 + (H - CY) / cam.scale) * g) + 1;
      for (let j = ylo; j <= yhi; j++) {
        const y = toScreen(0, j / g)[1]; if (y >= 0 && y <= H) svgEl("line", { x1: 0, y1: y, x2: W, y2: y, stroke: "var(--ink)", "stroke-opacity": j % g === 0 ? 0.3 : 0.14, "stroke-width": 1 }, gl);
      }
      for (let i = 0; i <= g; i++) {
        const a = svgEl("text", { x: toScreen(i / g, 0)[0], y: toScreen(0, 0)[1] + 16, "text-anchor": "middle", style: "font:600 11px var(--body);fill:var(--muted)" }, gl); a.textContent = i;
        if (i > 0) { const b = svgEl("text", { x: toScreen(0, 0)[0] - 7, y: toScreen(0, i / g)[1] + 4, "text-anchor": "end", style: "font:600 11px var(--body);fill:var(--muted)" }, gl); b.textContent = i; }
      }
    }
    // circles and the disk split
    for (const c of objs.filter((x) => x.type === "circ")) {
      const A = pt(c.c), B = pt(c.r); if (!A.ok || !B.ok) continue;
      const r = Math.hypot(B.x - A.x, B.y - A.y) * cam.scale, [sx, sy] = toScreen(A.x, A.y);
      svgEl("circle", { cx: sx, cy: sy, r, fill: "var(--accent-soft)", "fill-opacity": 0.25, stroke: "var(--accent)", "stroke-width": 2.2, "pointer-events": "none" }, o);
    }
    const dc = diskCircle();
    if (dc && disk.on) {
      const A = pt(dc.c), B = pt(dc.r), r = Math.hypot(B.x - A.x, B.y - A.y);
      for (let k = 0; k < N; k++) {
        const th = disk.theta + (2 * Math.PI * k) / N, [ex, ey] = rayToOutline(th), [x0, y0] = toScreen(0.5, 0.5), [x1, y1] = toScreen(ex, ey);
        svgEl("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: "#b5179e", "stroke-width": 2.2, "stroke-dasharray": "7 5", "pointer-events": "none" }, o);
      }
      const [hx, hy] = toScreen(0.5 + r * Math.cos(disk.theta), 0.5 + r * Math.sin(disk.theta));
      const h = svgEl("g", { class: "toy-handle", tabindex: 0, "data-handle": "disk", role: "slider", "aria-label": t("Point de départ du partage du disque", "Starting point of the disk split"), "aria-valuemin": 0, "aria-valuemax": 360, "aria-valuenow": Math.round(((disk.theta * 180) / Math.PI + 360) % 360) }, o);
      svgEl("circle", { class: "hit", cx: hx, cy: hy, r: 22 }, h); svgEl("circle", { class: "ring", cx: hx, cy: hy, r: 10, style: "stroke:#b5179e" }, h); svgEl("circle", { class: "core", cx: hx, cy: hy, r: 4, style: "fill:#b5179e" }, h);
    }
    // segments
    const cutSet = new Set(currentCuts().map((u) => u.toFixed(5)));
    void cutSet;
    for (const s of objs.filter((x) => x.type === "seg")) {
      const A = pt(s.a), B = pt(s.b); if (!A.ok || !B.ok) continue;
      const [x0, y0] = toScreen(A.x, A.y), [x1, y1] = toScreen(B.x, B.y), isCut = cutsOfSegments([[[A.x, A.y], [B.x, B.y]]]).length > 0;
      svgEl("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: isCut ? "var(--pos)" : "var(--ink)", "stroke-width": isCut ? 3.2 : 2.2, "stroke-linecap": "round", "pointer-events": "none" }, o);
    }
    if (pending.length && hover && (tool === "segment" || tool === "circle")) {
      const A = pt(pending[0]), [x0, y0] = toScreen(A.x, A.y), [x1, y1] = toScreen(...hover);
      if (tool === "segment") svgEl("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: "var(--accent)", "stroke-width": 2, "stroke-dasharray": "5 5", "pointer-events": "none" }, o);
      else svgEl("circle", { cx: x0, cy: y0, r: Math.hypot(x1 - x0, y1 - y0), fill: "none", stroke: "var(--accent)", "stroke-width": 2, "stroke-dasharray": "5 5", "pointer-events": "none" }, o);
    }
    // points
    for (const p of objs.filter((x) => x.type === "pt" && x.ok)) {
      const [sx, sy] = toScreen(p.x, p.y), free = p.kind === "free", sel = pending.includes(p.id);
      const gEl = svgEl("g", { class: "toy-handle ck-pt", tabindex: 0, "data-id": p.id, role: "button", "aria-label": `${t("Point", "Point")} ${p.name}${showGrid ? ` (${fmt(p.x * g)} ; ${fmt(p.y * g)})` : ""}${free ? "" : ` (${t("construit", "constructed")})`}` }, o);
      svgEl("circle", { class: "hit", cx: sx, cy: sy, r: 20 }, gEl);
      svgEl("circle", { class: "ring", cx: sx, cy: sy, r: sel ? 11 : 8, style: `stroke:${free ? "var(--accent)" : "var(--muted)"};stroke-width:${sel ? 4 : 3}` }, gEl);
      svgEl("circle", { class: "core", cx: sx, cy: sy, r: 3.2, style: `fill:${free ? "var(--accent)" : "var(--muted)"}` }, gEl);
      const lab = svgEl("text", { x: sx + 11, y: sy - 10, style: "font:700 13px var(--body);fill:var(--ink);paint-order:stroke;stroke:var(--sunken);stroke-width:3px;pointer-events:none" }, o);
      lab.textContent = p.name + (showGrid ? ` (${fmt(p.x * g)} ; ${fmt(p.y * g)})` : "");
    }
  }

  function draw() {
    svg.replaceChildren();
    const view = mk(cam);
    if (phase === "result") { drawResult(view); return; }
    const top = phase === "top" && !flying;
    const cuts = top ? currentCuts() : [];
    const pieces = top ? partition(cuts) : [{ poly: [[0, 0], [1, 0], [1, 1], [0, 1]], off: [0, 0, 0], tint: null, cherry: true }];
    drawCake(svg, view, pieces, { plate: !top, layers: true });
    if (top) overlayTop();
    else if (phase === "3d") { const tx = svgEl("text", { x: W / 2, y: H - 14, "text-anchor": "middle", style: "font:600 13px var(--body);fill:var(--muted);pointer-events:none" }, svg); tx.textContent = t("Glisse pour tourner le gâteau", "Drag to turn the cake"); }
  }

  // ------------------------------------------------------------ result (the cut, the explosion, the turn)
  const T_KNIFE = 2.2, T_OPEN = 4.0, T_END = 11.5;
  function resultState(tt) {
    const { cuts, polys, dirs, fair } = anim, n = polys.length;
    const knife = seg(tt, 0, T_KNIFE), open = ease(seg(tt, T_KNIFE, T_OPEN)), spinAng = seg(tt, T_OPEN, T_END);
    const c = { yaw: lerp(0, -32, open) + 330 * ease(spinAng), pitch: lerp(90, 33, open), scale: lerp(CAM_TOP.scale, 186, open) };
    return { cuts, polys, dirs, fair, n, knife, open, spinAng, cam: c };
  }
  function drawResult(view) {
    const S = resultState(resultT), { polys, dirs, fair, n } = S;
    const showShares = S.open > 0.95, shares = cakeShares(anim.cuts);
    const sortedIdx = polys.map((_, k) => k);
    const pieces = sortedIdx.map((k) => {
      const bump = showShares ? Math.max(0, Math.sin(clamp((resultT - (T_OPEN + 0.5 + k * 0.85)) / 1.1, 0, 1) * Math.PI)) : 0;
      const e = S.open * 0.2 + bump * 0.04;
      return { poly: polys[k], off: [dirs[k][0] * e, dirs[k][1] * e, bump * 0.34], tint: `var(--c${(k % 8) + 1})`, cherry: S.open > 0.2 };
    });
    const labels = showShares ? shares.map((s, k) => `${(s.volume * 100).toFixed(1).replace(".", t(",", "."))} %`) : null;
    drawCake(svg, view, pieces, { plate: true, layers: true, labels, lift: 0 });
    // the knife: a glowing line growing from the centre along every cut, in turn
    if (S.knife > 0 && S.open < 0.6) {
      const o = svgEl("g", { "pointer-events": "none", opacity: 1 - S.open / 0.6 }, svg);
      anim.cuts.forEach((u, k) => {
        const f = ease(clamp(S.knife * n - k, 0, 1)); if (f <= 0) return;
        const [ex, ey] = cutPoint(u), a = mk(S.cam).P(0.5, 0.5, 1.01), b = mk(S.cam).P(0.5 + (ex - 0.5) * f, 0.5 + (ey - 0.5) * f, 1.01);
        svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#ffd54a", "stroke-width": 9, "stroke-linecap": "round", opacity: 0.35 }, o);
        svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#fff", "stroke-width": 3, "stroke-linecap": "round" }, o);
        if (f < 1) for (let i = 0; i < 5; i++) { const ang = i * 1.7 + resultT * 9, rr = 6 + ((i * 7) % 9); svgEl("circle", { cx: b[0] + Math.cos(ang) * rr, cy: b[1] + Math.sin(ang) * rr, r: 2.2, fill: "#ffd54a" }, o); }
      });
    }
    if (fair && resultT > T_OPEN - 0.4) confetti(svg, resultT - (T_OPEN - 0.4), { x: W / 2, y: H * 0.34, ground: H + 20 });
    if (resultT >= T_END - 0.01 || isReduced()) {
      const tx = svgEl("text", { x: W / 2, y: H - 12, "text-anchor": "middle", style: "font:600 13px var(--body);fill:var(--muted);pointer-events:none" }, svg);
      tx.textContent = t("Glisse pour tourner les parts", "Drag to turn the pieces");
    }
  }
  const cutPoint = (u) => { const s = ((u % 4) + 4) % 4, k = Math.floor(s), f = s - k; return [[f, 0], [1, f], [1 - f, 1], [0, 1 - f]][k]; };

  function startResult(cuts) {
    const polys = piecePolygons(cuts), fair = isFair(cuts, N);
    anim = { cuts, polys, dirs: pieceDirections(polys), fair };
    phase = "result"; kit.hidden = true; $("#ck-view").hidden = false; $("#ck-lock").hidden = true; $("#ck-turn").hidden = true;
    resultT = isReduced() ? T_END : 0;
    help.textContent = "";
    const shares = cakeShares(cuts);
    table.innerHTML = `<table class="act-table"><thead><tr><th>${t("Part", "Portion")}</th><th>${t("Volume de gâteau", "Volume of cake")}</th><th>${t("Crème", "Cream")}</th></tr></thead><tbody>${shares.map((s, k) => `<tr><td><span class="cl-dot" style="background:${colour(k)}"></span> ${k + 1}</td><td>${(s.volume * 100).toFixed(1)} %</td><td>${(s.cream * 100).toFixed(1)} %</td></tr>`).join("")}</tbody></table>
      <div class="act-controls"><button class="btn btn-secondary" id="ck-back" type="button">${t("Recomposer le gâteau", "Put the cake back together")}</button><button class="btn-quiet" id="ck-replay" type="button">${t("Revoir l’animation", "Replay the animation")}</button></div>`;
    read.innerHTML = fair
      ? `<strong>${t("Partage équitable !", "A fair sharing!")}</strong> ${t(`Chaque part a ${(100 / N).toFixed(1)} % du gâteau et ${(100 / N).toFixed(1)} % de la crème. Il reste à calculer la surface de crème d’une part : écris ta réponse plus bas.`, `Each portion has ${(100 / N).toFixed(1)}% of the cake and ${(100 / N).toFixed(1)}% of the cream. It remains to compute the surface of cream on one portion: write your answer below.`)}`
      : `${cuts.length === N ? t("Les parts ne sont pas égales.", "The portions are not equal.") : t(`Ces coupes font ${polys.length} part${polys.length > 1 ? "s" : ""}, il en faut ${N}.`, `These cuts make ${polys.length} portion${polys.length > 1 ? "s" : ""}, you need ${N}.`)} ${t("Recompose le gâteau et essaie une autre coupe.", "Put the cake back together and try other cuts.")}`;
    $("#ck-back").addEventListener("click", () => backToTop());
    $("#ck-replay").addEventListener("click", () => startResult(cuts));
    cancelAnimationFrame(raf);
    if (isReduced()) { cam = resultState(T_END).cam; draw(); return; }
    const t0 = performance.now();
    const tick = (now) => {
      resultT = (now - t0) / 1000;
      if (resultT >= T_END) { resultT = T_END; cam = resultState(T_END).cam; live.yaw = cam.yaw; draw(); return; }
      cam = resultState(resultT).cam; draw(); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function backToTop() {
    cancelAnimationFrame(raf); anim = null; table.innerHTML = ""; read.textContent = ""; phase = "top"; cam = { ...CAM_TOP }; $("#ck-lock").hidden = false; kit.hidden = false; $("#ck-turn").hidden = false; found = false; updateUI(); draw();
  }

  // ------------------------------------------------------------ camera moves
  function fly(target, ms, then) {
    cancelAnimationFrame(raf);
    const from = { ...cam };
    if (isReduced() || ms <= 0) { cam = { ...target }; flying = false; draw(); then?.(); return; }
    flying = true; const t0 = performance.now();
    const tick = (now) => {
      const k = ease((now - t0) / ms);
      cam = { yaw: lerp(from.yaw, target.yaw, k), pitch: lerp(from.pitch, target.pitch, k), scale: lerp(from.scale, target.scale, k) };
      if (k >= 1) { cam = { ...target }; flying = false; draw(); then?.(); return; }
      draw(); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function lockTop() {
    if (phase !== "3d") return;
    live.yaw = cam.yaw; live.pitch = cam.pitch;
    phase = "top"; flying = true;
    $("#ck-lock").setAttribute("aria-pressed", "true"); $("#ck-lock").hidden = true; $("#ck-turn").hidden = false;
    fly(CAM_TOP, 650, () => { kit.hidden = false; flying = false; updateUI(); draw(); });
  }
  function unlockTop() {
    if (phase !== "top") return;
    kit.hidden = true; pending = []; phase = "3d"; flying = true;
    $("#ck-lock").setAttribute("aria-pressed", "false"); $("#ck-lock").hidden = false; $("#ck-turn").hidden = true;
    fly({ yaw: live.yaw, pitch: live.pitch, scale: CAM_3D.scale }, 650, () => { flying = false; updateUI(); draw(); });
  }

  // ------------------------------------------------------------ interface state
  function updateUI() {
    for (const b of root.querySelectorAll(".ck-tool")) b.setAttribute("aria-pressed", String(b.dataset.tool === tool));
    $("#ck-snap").disabled = !showGrid; $("#ck-size-wrap").hidden = !showGrid;
    $("#ck-size").value = g; $("#ck-size-out").textContent = g;
    $("#ck-disk").hidden = !diskCircle(); if (!diskCircle()) disk.on = false; $("#ck-disk-on").checked = disk.on;
    const cuts = phase === "top" ? currentCuts() : [];
    $("#ck-cut").disabled = cuts.length < 2;
    help.textContent = phase === "3d"
      ? t("Fais glisser le gâteau pour le tourner. Les coupes sont des plans verticaux : verrouille la vue de dessus pour les dessiner.", "Drag the cake to turn it. The cuts are vertical planes: lock the view from above to draw them.")
      : phase === "top" ? ({
        move: t("Déplacer : fais glisser un point libre (flèches au clavier).", "Move: drag a free point (arrow keys on the keyboard)."),
        point: t("Point : touche la figure pour poser un point.", "Point: tap the figure to place a point."),
        segment: t("Segment : touche deux points (ou deux endroits).", "Segment: tap two points (or two places)."),
        mid: t("Milieu : touche deux points, ou un segment.", "Midpoint: tap two points, or a segment."),
        inter: t("Intersection : touche deux segments.", "Intersection: tap two segments."),
        circle: t("Cercle : touche son centre, puis un point du cercle.", "Circle: tap its centre, then a point of the circle."),
      }[tool]) : help.textContent;
    if (phase === "top") liveReadout(cuts);
  }
  function liveReadout(cuts) {
    if (phase !== "top") return;
    const parts = [];
    if (cuts.length >= 2) {
      const sh = cakeShares(cuts);
      table.innerHTML = `<table class="act-table"><thead><tr><th>${t("Part", "Portion")}</th><th>${t("Volume de gâteau", "Volume of cake")}</th><th>${t("Crème", "Cream")}</th></tr></thead><tbody>${sh.map((s, k) => `<tr><td><span class="cl-dot" style="background:${colour(k)}"></span> ${k + 1}</td><td>${(s.volume * 100).toFixed(1)} %</td><td>${(s.cream * 100).toFixed(1)} %</td></tr>`).join("")}</tbody></table>`;
    } else if (disk.on && diskCircle()) {
      const cs = Array.from({ length: N }, (_, k) => { const [ex, ey] = rayToOutline(disk.theta + (2 * Math.PI * k) / N); return perimeter(ex, ey); }), sh = cakeShares(cs);
      table.innerHTML = `<table class="act-table"><thead><tr><th>${t("Part (angles égaux)", "Portion (equal angles)")}</th><th>${t("Volume de gâteau", "Volume of cake")}</th><th>${t("Crème", "Cream")}</th></tr></thead><tbody>${sh.map((s, k) => `<tr><td>${k + 1}</td><td>${(s.volume * 100).toFixed(1)} %</td><td>${(s.cream * 100).toFixed(1)} %</td></tr>`).join("")}</tbody></table>`;
    } else table.innerHTML = "";
    if (cuts.length) parts.push(t(`${cuts.length} coupe${cuts.length > 1 ? "s" : ""} depuis le centre.`, `${cuts.length} cut${cuts.length > 1 ? "s" : ""} from the centre.`));
    else if (!objs.length) parts.push(t("Aucun objet pour l’instant.", "No objects yet."));
    read.textContent = parts.join(" ");
  }
  const perimeter = (x, y) => {
    const eps = 1e-9;
    if (Math.abs(y) < eps) return x; if (Math.abs(x - 1) < eps) return 1 + y; if (Math.abs(y - 1) < eps) return 2 + (1 - x); return (3 + (1 - y)) % 4;
  };

  // ------------------------------------------------------------ editing actions
  function record(...ids) { history.push(ids); }
  function afterChange() {
    recompute(); updateUI(); draw();
    const cuts = currentCuts();
    if (!found && phase === "top" && isFair(cuts, N)) { found = true; setTimeout(() => { if (phase === "top" && isFair(currentCuts(), N)) startResult(currentCuts()); }, isReduced() ? 0 : 450); }
  }
  function undo() {
    const ids = history.pop(); if (!ids) return;
    objs = objs.filter((o) => !ids.includes(o.id));
    // drop anything that depended on the removed objects
    let changed = true; while (changed) { changed = false; const alive = new Set(objs.map((o) => o.id)); objs = objs.filter((o) => { const deps = [o.a, o.b, o.c, o.r, o.s1, o.s2].filter(Boolean); const ok = deps.every((d) => alive.has(d)); if (!ok) changed = true; return ok; }); }
    pending = []; afterChange();
  }
  function clearAll() { objs = []; history = []; pending = []; found = false; afterChange(); }
  function pointAt(w, create = true) {
    const hit = nearestPoint(w); if (hit) return { p: hit, fresh: false };
    if (!create) return null;
    const s = snap(w), p = newPoint(s[0], s[1]); return { p, fresh: true };
  }
  function onTap(w) {
    const added = [];
    if (tool === "point") { const r = pointAt(w); if (r.fresh) added.push(r.p.id); }
    else if (tool === "segment") {
      const r = pointAt(w); if (r.fresh) added.push(r.p.id);
      if (!pending.length) pending = [r.p.id];
      else if (pending[0] !== r.p.id) { const s = { id: nextId++, type: "seg", a: pending[0], b: r.p.id }; objs.push(s); added.push(s.id); pending = []; }
    } else if (tool === "circle") {
      const r = pointAt(w); if (r.fresh) added.push(r.p.id);
      if (!pending.length) pending = [r.p.id];
      else if (pending[0] !== r.p.id) { const c = { id: nextId++, type: "circ", c: pending[0], r: r.p.id }; objs.push(c); added.push(c.id); pending = []; }
    } else if (tool === "mid") {
      const hit = nearestPoint(w), sg = hit ? null : nearestSeg(w);
      if (sg) { const p = newPoint(0, 0, { kind: "mid", a: sg.a, b: sg.b }); added.push(p.id); pending = []; }
      else if (hit) { if (!pending.length) pending = [hit.id]; else if (pending[0] !== hit.id) { const p = newPoint(0, 0, { kind: "mid", a: pending[0], b: hit.id }); added.push(p.id); pending = []; } }
    } else if (tool === "inter") {
      const sg = nearestSeg(w);
      if (sg) { if (!pending.length) pending = [sg.id]; else if (pending[0] !== sg.id) { const p = newPoint(0, 0, { kind: "inter", s1: pending[0], s2: sg.id }); recompute(); if (!p.ok) { objs = objs.filter((o) => o !== p); read.textContent = t("Ces deux segments ne se coupent pas.", "These two segments do not cross."); } else added.push(p.id); pending = []; } }
    }
    if (added.length) record(...added);
    afterChange();
  }
  // moves made by the hints
  function hintTop(centre) {
    const go = () => {
      if (centre && !objs.some((o) => isCentre(o))) { const p = newPoint(0.5, 0.5, { kind: "hint" }); p.name = "O"; record(p.id); }
      afterChange();
    };
    if (phase === "3d") { lockTop(); const wait = setInterval(() => { if (phase === "top" && !flying) { clearInterval(wait); go(); } }, 60); }
    else if (phase === "result") { backToTop(); go(); }
    else go();
  }
  function hintGrid() {
    hintTop(true);
    const fin = () => { showGrid = true; snapOn = true; g = gStar; $("#ck-grid").checked = true; $("#ck-snap").checked = true; afterChange(); };
    if (phase === "top" && !flying) fin(); else { const wait = setInterval(() => { if (phase === "top" && !flying) { clearInterval(wait); fin(); } }, 60); }
  }
  const onAction = (e) => { if (e.detail?.id !== "cake") return; if (e.detail.act === "top") hintTop(true); else if (e.detail.act === "grid") hintGrid(); };
  document.addEventListener("challenge-action", onAction);

  // ------------------------------------------------------------ pointer input
  const local = (e) => toLocal(svg, e);
  let dragRot = null, down = null;
  svg.addEventListener("pointerdown", (e) => {
    if (flying) return;
    const L = local(e);
    if (phase === "3d" || phase === "result") { if (phase === "result" && resultT < T_END - 0.01) return; dragRot = { x: L.x, y: L.y, yaw: cam.yaw, pitch: cam.pitch }; svg.setPointerCapture(e.pointerId); return; }
    if (phase !== "top") return;
    const h = e.target.closest?.(".toy-handle"), w = fromScreen(L.x, L.y);
    if (h?.dataset.handle === "disk") { grab = { disk: true }; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (tool === "move" && h?.dataset.id) { const p = pt(Number(h.dataset.id)); if (p?.kind === "free") { grab = { id: p.id }; svg.setPointerCapture(e.pointerId); e.preventDefault(); } return; }
    if (tool === "move") return;
    down = { w, x: L.x, y: L.y };
    e.preventDefault();
  });
  svg.addEventListener("pointermove", (e) => {
    const L = local(e);
    if (dragRot) {
      cam = { ...cam, yaw: dragRot.yaw + (L.x - dragRot.x) * 0.45, pitch: clamp(dragRot.pitch + (L.y - dragRot.y) * 0.35, 8, 88) };
      live.yaw = cam.yaw; live.pitch = cam.pitch; draw(); return;
    }
    if (grab?.disk) { const A = [0.5, 0.5], w = fromScreen(L.x, L.y); disk.theta = Math.atan2(w[1] - A[1], w[0] - A[0]); updateUI(); draw(); return; }
    if (grab?.id) { const p = pt(grab.id), s = snap(fromScreen(L.x, L.y)); p.x = s[0]; p.y = s[1]; recompute(); updateUI(); draw(); return; }
    if (phase === "top" && pending.length) { hover = fromScreen(L.x, L.y); draw(); }
  });
  const release = (e) => {
    if (dragRot) { dragRot = null; return; }
    if (grab) { grab = null; afterChange(); return; }
    if (down) { const L = local(e), moved = Math.hypot(L.x - down.x, L.y - down.y); const w = down.w; down = null; if (moved < 8) onTap(w); }
  };
  svg.addEventListener("pointerup", release);
  svg.addEventListener("pointercancel", () => { dragRot = null; grab = null; down = null; });
  lockTouch(svg, ".toy-handle");
  svg.addEventListener("touchmove", (e) => { if (dragRot || grab || down) e.preventDefault(); }, { passive: false });
  svg.style.touchAction = "none";
  svg.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 10 : 3, d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    const h = e.target.closest?.(".toy-handle");
    if (d && h?.dataset.handle === "disk") { e.preventDefault(); disk.theta += (d[0] || -d[1]) * 0.03 * (e.shiftKey ? 3 : 1); updateUI(); draw(); svg.querySelector("[data-handle=disk]")?.focus(); return; }
    if (d && h?.dataset.id) {
      const p = pt(Number(h.dataset.id)); if (p?.kind !== "free") return; e.preventDefault();
      const unit = snapOn ? 1 / g : 0.01 * (e.shiftKey ? 5 : 1); p.x += d[0] * unit; p.y -= d[1] * unit;
      if (snapOn) { p.x = Math.round(p.x * g) / g; p.y = Math.round(p.y * g) / g; }
      recompute(); updateUI(); draw(); svg.querySelector(`[data-id="${p.id}"]`)?.focus(); afterChange(); svg.querySelector(`[data-id="${p.id}"]`)?.focus(); return;
    }
    if (d && h?.dataset.id && (e.key === "Enter" || e.key === " ")) return;
    if ((e.key === "Enter" || e.key === " ") && h?.dataset.id) {
      e.preventDefault(); const p = pt(Number(h.dataset.id)); if (tool !== "move") onTap([p.x, p.y]); return;
    }
    if (d && (phase === "3d" || (phase === "result" && resultT >= T_END - 0.01)) && !h) {
      e.preventDefault(); cam = { ...cam, yaw: cam.yaw + d[0] * step * 2, pitch: clamp(cam.pitch - d[1] * step, 8, 88) }; live.yaw = cam.yaw; live.pitch = cam.pitch; draw();
    }
  });

  // ------------------------------------------------------------ controls
  $("#ck-lock").addEventListener("click", lockTop);
  $("#ck-turn").addEventListener("click", unlockTop);
  for (const b of root.querySelectorAll(".ck-tool")) b.addEventListener("click", () => { tool = b.dataset.tool; pending = []; hover = null; updateUI(); draw(); });
  $("#ck-undo").addEventListener("click", undo);
  $("#ck-clear").addEventListener("click", clearAll);
  $("#ck-grid").addEventListener("change", (e) => { showGrid = e.target.checked; if (!showGrid) { snapOn = false; $("#ck-snap").checked = false; } updateUI(); draw(); });
  $("#ck-snap").addEventListener("change", (e) => { snapOn = e.target.checked; });
  $("#ck-size").addEventListener("input", (e) => { g = Number(e.target.value); updateUI(); draw(); });
  $("#ck-disk-on").addEventListener("change", (e) => { disk.on = e.target.checked; updateUI(); draw(); });
  $("#ck-cut").addEventListener("click", () => { const cuts = currentCuts(); if (cuts.length >= 2) startResult(cuts); });

  updateUI(); draw();
  return () => { cancelAnimationFrame(raf); document.removeEventListener("challenge-action", onAction); };
}
