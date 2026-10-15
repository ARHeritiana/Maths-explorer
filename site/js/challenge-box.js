// The ant on the box as an open sandbox. The visitor turns a 3D box, then lays a route on its surface by tapping points;
// two consecutive points must share a face (so crossing an edge means putting a point on that edge), and the length is
// measured live. Nothing suggests flattening the box: the hints do that on request (HINT_ACTIONS in app.js).
// A route within 0.4 % of the shortest triggers the finale: the box unfolds, the ant walks the straight line, the box folds back.
import { svgEl, toLocal, clamp, lockTouch } from "./challenge-kit.js";
import { boxSet, boxPath } from "./challenge-puzzles2.js";
import { FACE_AXIS, faceValue, faceCorners, hingePosition, facesOf, shareFace, polyLength, dist3, nets, netRoute } from "./box-model.js";
import { makeView, drawBox, boxScaler, projectBoxPoint, flatCamera } from "./box-3d.js";
import { confetti } from "./cake-3d.js";

const W = 640, H = 420, CX = 320, CY = 214;
const ease = (x) => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k); };
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const lerp = (a, b, k) => a + (b - a) * k;

export function boxLab(root, { t, q, reduced }) {
  const dims = boxSet(q.set), [A, B, C] = dims, M = Math.max(...dims), S = [0, 0, 0], T = dims.slice(), best = boxPath(...dims), NET = nets(dims);
  const isReduced = () => (typeof reduced === "function" ? reduced() : !!reduced);
  const fmt = (v) => String(Math.round(v * 100) / 100).replace(".", t(",", "."));
  const N = boxScaler(dims);
  root.innerHTML = `
    <p class="act-help" id="bx-help"></p>
    <svg class="act-svg bx-stage" viewBox="0 0 ${W} ${H}" tabindex="0" role="application" aria-label="${t("La boîte et la fourmi : fais glisser pour tourner, touche la boîte pour poser des points", "The box and the ant: drag to turn, tap the box to place points")}"></svg>
    <div class="act-buttons bx-bar" id="bx-bar3d">
      <button class="btn btn-secondary" id="bx-add" type="button">${t("Ajouter un point (clavier)", "Add a point (keyboard)")}</button>
      <button class="btn btn-secondary" id="bx-walk" type="button">${t("Faire marcher la fourmi", "Send the ant walking")}</button>
      <button class="btn-quiet" id="bx-undo" type="button">${t("Annuler le dernier point", "Undo the last point")}</button>
      <button class="btn-quiet" id="bx-clear" type="button">${t("Tout effacer", "Clear")}</button>
    </div>
    <div class="act-buttons bx-bar" id="bx-barflat" hidden>
      <button class="btn btn-secondary" id="bx-next" type="button">${t("Autre paire de faces", "Another pair of faces")}</button>
      <button class="btn-quiet" id="bx-fold" type="button">${t("Replier la boîte", "Fold the box back")}</button>
    </div>
    <p class="act-readout" id="bx-read" role="status" aria-live="polite"></p>`;
  const $ = (s) => root.querySelector(s);
  const svg = $("svg"), help = $("#bx-help"), read = $("#bx-read");

  // ------------------------------------------------------------ state
  let cam = { yaw: -38, pitch: 28, scale: 300, cx: CX, cy: CY }, mode = "3d", way = [], drag = null, rot = null, raf = 0, found = false;
  let flat = { k: NET.indexOf(NET.reduce((a, b) => (b.length > a.length ? b : a))), amount: 0, m: 0.5, line: false }, walk = null, fin = null, finT = 0, flying = false;
  const route = () => [S, ...way.map((w) => w.p)];
  const edgeEnds = (net) => { const e = net.edgeAxis, p0 = [0, 0, 0]; p0[FACE_AXIS[net.base]] = faceValue(dims, net.base); p0[FACE_AXIS[net.hinge]] = faceValue(dims, net.hinge); const p1 = p0.slice(); p1[e] = dims[e]; return [p0, p1]; };
  const flatM = () => { const [p0, p1] = edgeEnds(NET[flat.k]); return p0.map((v, i) => v + (p1[i] - v) * flat.m); };
  const mk = (c = cam) => makeView({ ...c });

  // ------------------------------------------------------------ picking on the surface
  function pick(view, sx, sy) {
    let bestHit = null;
    for (let f = 0; f < 6; f++) {
      const nf = [0, 0, 0]; nf[FACE_AXIS[f]] = f % 2 ? 1 : -1;
      if (view.facing(nf) <= 1e-4) continue;
      const k = FACE_AXIS[f], u = (k + 1) % 3, w = (k + 2) % 3, p0 = [0, 0, 0]; p0[k] = faceValue(dims, f);
      const P0 = view.P(...N(p0)), pu = p0.slice(); pu[u] = 1; const Pu = view.P(...N(pu)), pw = p0.slice(); pw[w] = 1; const Pw = view.P(...N(pw));
      const a11 = Pu[0] - P0[0], a12 = Pw[0] - P0[0], a21 = Pu[1] - P0[1], a22 = Pw[1] - P0[1], det = a11 * a22 - a12 * a21;
      if (Math.abs(det) < 1e-6) continue;
      const rx = sx - P0[0], ry = sy - P0[1], du = (rx * a22 - a12 * ry) / det, dw = (a11 * ry - a21 * rx) / det;
      if (du < -1e-9 || du > dims[u] + 1e-9 || dw < -1e-9 || dw > dims[w] + 1e-9) continue;
      const p = p0.slice(); p[u] = du; p[w] = dw;
      const depth = view.P(...N(p))[2];
      if (!bestHit || depth > bestHit.depth) bestHit = { p, depth, f, u, w, pxU: Math.hypot(a11, a21), pxW: Math.hypot(a12, a22) };
    }
    if (!bestHit) return null;
    // snap to the edges and corners of the face under the pointer (distances measured in screen pixels)
    const { p, u, w, pxU, pxW } = bestHit, out = p.slice(), R = 11;
    for (const [axis, px] of [[u, pxU], [w, pxW]]) {
      if (p[axis] * px < R) out[axis] = 0; else if ((dims[axis] - p[axis]) * px < R) out[axis] = dims[axis];
    }
    if (dist3(out, T) * Math.min(pxU, pxW) < R * 1.4) return { p: T.slice(), f: bestHit.f };
    if (dist3(out, S) * Math.min(pxU, pxW) < R * 1.4) return { p: S.slice(), f: bestHit.f };
    return { p: out, f: bestHit.f };
  }

  // ------------------------------------------------------------ drawing
  function paths3d() {
    const r = route(), out = [];
    for (let i = 0; i + 1 < r.length; i++) { const ok = shareFace(dims, r[i], r[i + 1]) >= 0; if (ok) out.push({ pts: [r[i], r[i + 1]], colour: "#d62828", width: 4 }); }
    return out;
  }
  function overlayWays(view, g) {
    const r = route();
    for (let i = 0; i + 1 < r.length; i++) if (shareFace(dims, r[i], r[i + 1]) < 0) {
      const a = view.P(...N(r[i])), b = view.P(...N(r[i + 1]));
      svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--muted)", "stroke-width": 2, "stroke-dasharray": "3 6", "pointer-events": "none" }, g);
    }
    way.forEach((wp, i) => {
      const faces = facesOf(dims, wp.p), vis = faces.some((f) => { const n = [0, 0, 0]; n[FACE_AXIS[f]] = f % 2 ? 1 : -1; return view.facing(n) > 1e-4; });
      const [x, y] = view.P(...N(wp.p)), gEl = svgEl("g", { class: "toy-handle", tabindex: 0, "data-i": i, role: "button", opacity: vis ? 1 : 0.25, "aria-label": `${t("Point", "Point")} ${i + 1}` }, g);
      svgEl("circle", { class: "hit", cx: x, cy: y, r: 20 }, gEl); svgEl("circle", { class: "ring", cx: x, cy: y, r: 8 }, gEl); svgEl("circle", { class: "core", cx: x, cy: y, r: 3.2 }, gEl);
    });
  }
  function draw() {
    svg.replaceChildren();
    const view = mk();
    if (mode === "flat" || mode === "finale") { drawFlat(view); return; }
    const antPos = walk ? walk.pos : S;
    const { g } = drawBox(svg, view, dims, { paths: paths3d(), markers: [{ p: S, kind: "S" }, { p: T, kind: "T" }], edgeLabels: true, ant: { p: antPos, ang: walk?.ang ?? -0.5, glow: !!walk } });
    overlayWays(view, g);
    if (!way.length) { const tx = svgEl("text", { x: W / 2, y: H - 12, "text-anchor": "middle", style: "font:600 13px var(--body);fill:var(--muted);pointer-events:none" }, svg); tx.textContent = t("Glisse pour tourner · touche la boîte pour poser un point de ton trajet", "Drag to turn · tap the box to place a point of your route"); }
  }
  function drawFlat(view) {
    const net = { base: NET[flat.k].base, hinge: NET[flat.k].hinge, amount: flat.amount }, m = flatM(), paths = [];
    const crossing = flatRoute();
    if (mode !== "finale") paths.push({ pts: [S, m, T], colour: "#d62828", width: 4 });
    if (flat.line || (mode === "finale" && fin)) paths.push({ pts: crossing.points, colour: "#2a9d8f", width: 4, dash: flat.line && mode !== "finale" ? "9 6" : undefined, glow: mode === "finale", upTo: mode === "finale" ? fin.line : 1 });
    const ant = mode === "finale" && fin.ant != null ? { p: pointAlong(crossing.points, fin.ant), ang: 0, glow: true } : null;
    const { g } = drawBox(svg, view, dims, { net, paths, markers: [{ p: S, kind: "S" }, { p: T, kind: "T" }], edgeLabels: false, ant });
    // the sliding crossing point
    if (mode === "flat") {
      const [x, y] = projectBoxPoint(view, dims, net, m), h = svgEl("g", { class: "toy-handle", tabindex: 0, "data-handle": "m", role: "slider", "aria-label": t("Point de passage sur l’arête commune", "Crossing point on the shared edge"), "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(flat.m * 100) }, g);
      svgEl("circle", { class: "hit", cx: x, cy: y, r: 22 }, h); svgEl("circle", { class: "ring", cx: x, cy: y, r: 10 }, h); svgEl("circle", { class: "core", cx: x, cy: y, r: 4 }, h);
    }
    if (mode === "finale") finaleOverlay(view, net, crossing);
  }
  const flatRoute = () => netRoute(dims, NET[flat.k]);
  const pointAlong = (pts, f) => { const total = polyLength(pts); let left = f * total; for (let i = 0; i + 1 < pts.length; i++) { const l = dist3(pts[i], pts[i + 1]); if (left <= l || i + 2 === pts.length) { const k = clamp(left / (l || 1), 0, 1); return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * k); } left -= l; } return pts[pts.length - 1]; };

  // ------------------------------------------------------------ the camera, the net, the readouts
  const flatCam = (k) => flatCamera(dims, NET[k], W, H);
  const hingeFlat = (net, v) => (facesOf(dims, v).includes(net.hinge) && !facesOf(dims, v).includes(net.base) ? hingePosition(dims, net.base, net.hinge, v, 1) : v);
  function flatReadout() {
    const m = flatM(), len = polyLength([S, m, T]), n = NET[flat.k];
    read.innerHTML = `${t("Trajet S → point de passage → T", "Route S → crossing point → T")} : <strong>${fmt(len)} cm</strong>${flat.line ? ` · ${t("segment droit", "straight segment")} : <strong>${fmt(n.length)} cm</strong>` : ""}`;
  }
  function updateUI() {
    $("#bx-bar3d").hidden = mode !== "3d"; $("#bx-barflat").hidden = mode !== "flat";
    help.textContent = mode === "3d"
      ? t(`La fourmi part du coin S et veut atteindre le coin T, en marchant sur la surface. Dimensions : ${A} × ${B} × ${C} cm. Touche la boîte pour poser des points : deux points consécutifs doivent être sur une même face (pour passer d’une face à l’autre, pose un point sur leur arête).`, `The ant starts at corner S and wants to reach corner T, walking on the surface. Dimensions: ${A} × ${B} × ${C} cm. Tap the box to place points: two consecutive points must be on a common face (to go from one face to another, put a point on their edge).`)
      : mode === "flat" ? t("Deux faces voisines sont mises à plat. Fais glisser le point de passage sur l’arête commune.", "Two neighbouring faces are laid flat. Drag the crossing point along the shared edge.") : "";
    if (mode === "flat") { flatReadout(); return; }
    if (mode !== "3d") return;
    const r = route(), bad = r.findIndex((p, i) => i + 1 < r.length && shareFace(dims, p, r[i + 1]) < 0);
    const ends = way.length && dist3(way[way.length - 1].p, T) < 1e-9;
    if (!way.length) read.textContent = "";
    else if (bad >= 0) read.innerHTML = t("Ces deux points ne sont pas sur une même face : la fourmi ne traverse pas la boîte. Ajoute un point sur une arête commune.", "These two points are not on a common face: the ant cannot go through the box. Add a point on a shared edge.");
    else read.innerHTML = `${t("Longueur du trajet", "Length of the route")} : <strong>${fmt(polyLength(r))} cm</strong>${ends ? ` · ${t("arrivée en T", "arrived at T")}` : ` · ${t("pas encore arrivée en T", "not at T yet")}`}`;
  }

  // ------------------------------------------------------------ camera tweens
  function fly(target, ms, step, done) {
    cancelAnimationFrame(raf);
    const from = { ...cam }, t0 = performance.now();
    if (isReduced() || ms <= 0) { cam = { ...target }; step?.(1); draw(); done?.(); return; }
    flying = true;
    const tick = (now) => {
      const k = ease((now - t0) / ms);
      cam = { yaw: lerp(from.yaw, target.yaw, k), pitch: lerp(from.pitch, target.pitch, k), scale: lerp(from.scale, target.scale, k), cx: lerp(from.cx, target.cx, k), cy: lerp(from.cy, target.cy, k) };
      step?.(k); draw();
      if (k >= 1) { flying = false; done?.(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function showNet(k, line) {
    walk = null;
    const go = () => { mode = "flat"; flat.k = k; flat.m = 0.5; flat.amount = 0; flat.line = !!line; updateUI(); fly(flatCam(k), 650, null, () => animateAmount(0, 1, 1100)); draw(); };
    if (mode === "flat" || mode === "finale") { flat.k = k; flat.m = 0.5; flat.line = !!line; flat.amount = 0; const target = flatCam(k); mode = "flat"; updateUI(); fly(target, 400, null, () => animateAmount(0, 1, 900)); return; }
    go();
  }
  function animateAmount(from, to, ms, done) {
    if (isReduced()) { flat.amount = to; draw(); done?.(); return; }
    const t0 = performance.now(); flying = true;
    const tick = (now) => { const k = clamp((now - t0) / ms, 0, 1); flat.amount = lerp(from, to, ease(k)); draw(); if (k < 1) raf = requestAnimationFrame(tick); else { flying = false; done?.(); } };
    raf = requestAnimationFrame(tick);
  }
  function foldBack() {
    if (mode !== "flat") return;
    cancelAnimationFrame(raf);
    animateAmount(flat.amount, 0, 700, () => { mode = "3d"; updateUI(); fly({ yaw: -38, pitch: 28, scale: 300, cx: CX, cy: CY }, 650, null, () => { updateUI(); draw(); }); });
  }

  // ------------------------------------------------------------ the ant walking the route, and the finale
  function walkRoute() {
    const r = route(); if (r.length < 2) return;
    const pts = []; for (let i = 0; i + 1 < r.length; i++) if (shareFace(dims, r[i], r[i + 1]) >= 0) pts.push(i === 0 || !pts.length ? r[i] : null, r[i + 1]); else break;
    const poly = pts.filter(Boolean); if (poly.length < 2) return;
    const total = polyLength(poly), ms = isReduced() ? 0 : clamp(total * 400, 1400, 5000), t0 = performance.now(); cancelAnimationFrame(raf);
    const tick = (now) => {
      const k = ms ? clamp((now - t0) / ms, 0, 1) : 1, p = pointAlong(poly, k), q2 = pointAlong(poly, Math.min(1, k + 0.01)), view = mk(), a = view.P(...N(p)), b = view.P(...N(q2));
      walk = { pos: p, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; draw();
      if (k < 1) raf = requestAnimationFrame(tick); else setTimeout(() => { walk = null; draw(); }, 700);
    };
    raf = requestAnimationFrame(tick);
  }
  const FIN = { fly: 1.0, unfold: 2.8, line: 5.0, hold: 5.6, refold: 7.2, spin: 12 };
  function startFinale() {
    cancelAnimationFrame(raf); walk = null;
    const k = NET.indexOf(NET.reduce((a, b) => (b.length < a.length ? b : a)));
    flat.k = k; flat.m = 0.5; flat.line = false; flat.amount = 0; mode = "finale"; fin = { line: 0, ant: null, spin: 0, conf: -1 };
    $("#bx-bar3d").hidden = true; $("#bx-barflat").hidden = true; help.textContent = "";
    const from = { ...cam }, target = flatCam(k), end = { yaw: -38, pitch: 28, scale: 300, cx: CX, cy: CY };
    read.innerHTML = `<strong>${t("Bravo, c’est le plus court trajet !", "Well done, that is the shortest route!")}</strong> ${t(`Il mesure ${fmt(best)} cm. Écris maintenant la valeur dans le champ plus bas.`, `It measures ${fmt(best)} cm. Now enter the value in the field below.`)}`;
    const frame = (tt) => {
      finT = tt;
      const f = ease(seg(tt, 0, FIN.fly)), u = ease(seg(tt, FIN.fly, FIN.unfold)), back = ease(seg(tt, FIN.hold, FIN.refold));
      flat.amount = tt < FIN.hold ? u : 1 - back;
      const c0 = { yaw: lerp(from.yaw, target.yaw, f), pitch: lerp(from.pitch, target.pitch, f), scale: lerp(from.scale, target.scale, f), cx: lerp(from.cx, target.cx, f), cy: lerp(from.cy, target.cy, f) };
      cam = tt < FIN.hold ? c0 : { yaw: lerp(target.yaw, end.yaw, back) + 360 * ease(seg(tt, FIN.refold, FIN.spin)), pitch: lerp(target.pitch, end.pitch, back), scale: lerp(target.scale, end.scale, back), cx: lerp(target.cx, end.cx, back), cy: lerp(target.cy, end.cy, back) };
      fin.line = ease(seg(tt, FIN.unfold, FIN.line)); fin.ant = tt >= FIN.unfold ? ease(seg(tt, FIN.unfold, FIN.line)) : null;
      if (tt >= FIN.hold) fin.ant = null;
      draw();
    };
    const t0 = performance.now(), stopAt = FIN.spin;
    if (isReduced()) { frame(FIN.refold); endFinale(); return; }
    const tick = (now) => { const tt = (now - t0) / 1000; if (tt >= stopAt) { frame(stopAt); endFinale(); return; } frame(tt); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  function endFinale() {
    mode = "3d"; fin = null; cam = { yaw: cam.yaw % 360, pitch: 28, scale: 300, cx: CX, cy: CY };
    $("#bx-bar3d").hidden = false; updateUI(); help.textContent = ""; read.innerHTML = `<strong>${t("Bravo, c’est le plus court trajet !", "Well done, that is the shortest route!")}</strong> ${t(`Il mesure ${fmt(best)} cm. Écris maintenant la valeur dans le champ plus bas.`, `It measures ${fmt(best)} cm. Now enter the value in the field below.`)}`; draw();
  }
  function finaleOverlay(view, net, crossing) {
    if (finT > FIN.unfold - 0.1 && finT < FIN.hold + 0.3) confetti(svg, finT - (FIN.unfold - 0.1), { x: W / 2, y: H * 0.3, ground: H + 20 });
    if (finT >= FIN.unfold && finT < FIN.hold) {
      const w = NET[flat.k].width, h = NET[flat.k].height, tx = svgEl("text", { x: W / 2, y: H - 14, "text-anchor": "middle", style: "font:700 16px var(--math);fill:var(--ink);paint-order:stroke;stroke:var(--sunken);stroke-width:4px" }, svg);
      tx.textContent = `√(${fmt(w)}² + ${fmt(h)}²) = ${fmt(crossing.length)} cm`;
    }
    void view; void net;
  }

  // ------------------------------------------------------------ the hints
  const onAction = (e) => {
    if (e.detail?.id !== "box") return;
    if (e.detail.act === "net") showNet(mode === "flat" ? flat.k : NET.indexOf(NET.reduce((a, b) => (b.length > a.length ? b : a))), false);
    else if (e.detail.act === "line") { if (mode === "flat") { flat.line = true; updateUI(); draw(); } else { showNet(flat.k, true); } }
  };
  document.addEventListener("challenge-action", onAction);

  // ------------------------------------------------------------ input
  const local = (e) => toLocal(svg, e);
  let down = null;
  svg.addEventListener("pointerdown", (e) => {
    if (mode === "finale" || flying) return;
    const L = local(e), h = e.target.closest?.(".toy-handle");
    if (h?.dataset.handle === "m") { drag = { m: true }; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (h?.dataset.i !== undefined) { drag = { i: Number(h.dataset.i) }; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (mode === "3d") { rot = { x: L.x, y: L.y, yaw: cam.yaw, pitch: cam.pitch }; down = { x: L.x, y: L.y }; svg.setPointerCapture(e.pointerId); }
  });
  svg.addEventListener("pointermove", (e) => {
    const L = local(e);
    if (drag?.m) {
      const net = { base: NET[flat.k].base, hinge: NET[flat.k].hinge, amount: flat.amount }, [p0, p1] = edgeEnds(NET[flat.k]), v = mk(), a = projectBoxPoint(v, dims, net, p0), b = projectBoxPoint(v, dims, net, p1);
      const dx = b[0] - a[0], dy = b[1] - a[1], k = ((L.x - a[0]) * dx + (L.y - a[1]) * dy) / (dx * dx + dy * dy);
      flat.m = clamp(Math.round(k * 200) / 200, 0, 1); updateUI(); draw(); return;
    }
    if (drag?.i !== undefined) { const hit = pick(mk(), L.x, L.y); if (hit) { way[drag.i].p = hit.p; updateUI(); draw(); } return; }
    if (rot) { cam = { ...cam, yaw: rot.yaw + (L.x - rot.x) * 0.45, pitch: clamp(rot.pitch + (L.y - rot.y) * 0.35, -60, 88) }; draw(); }
  });
  const release = (e) => {
    if (drag) { drag = null; afterEdit(); return; }
    if (rot) {
      const L = local(e), moved = down ? Math.hypot(L.x - down.x, L.y - down.y) : 99; rot = null; down = null;
      if (moved < 6 && mode === "3d") { const hit = pick(mk(), L.x, L.y); if (hit && !(dist3(hit.p, S) < 1e-9 && !way.length)) { way.push({ p: hit.p }); afterEdit(); } }
    }
  };
  svg.addEventListener("pointerup", release);
  svg.addEventListener("pointercancel", () => { drag = null; rot = null; down = null; });
  lockTouch(svg, ".toy-handle");
  svg.style.touchAction = "none";
  svg.addEventListener("keydown", (e) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key], h = e.target.closest?.(".toy-handle");
    if (!d) return;
    if (h?.dataset.handle === "m") { e.preventDefault(); flat.m = clamp(flat.m + (d[0] || d[1]) * (e.shiftKey ? 0.05 : 0.01), 0, 1); updateUI(); draw(); svg.querySelector("[data-handle=m]")?.focus(); return; }
    if (h?.dataset.i !== undefined) {
      e.preventDefault(); const i = Number(h.dataset.i), p = way[i].p, fs = facesOf(dims, p), step = e.shiftKey ? 0.5 : 0.1, f = fs[0], k = FACE_AXIS[f], u = (k + 1) % 3, w = (k + 2) % 3;
      p[u] = clamp(p[u] + d[0] * step, 0, dims[u]); p[w] = clamp(p[w] + d[1] * step, 0, dims[w]);
      for (const ax of [u, w]) { if (p[ax] < 0.05) p[ax] = 0; if (dims[ax] - p[ax] < 0.05) p[ax] = dims[ax]; }
      afterEdit(); svg.querySelector(`[data-i="${i}"]`)?.focus(); return;
    }
    if (mode === "3d") { e.preventDefault(); cam = { ...cam, yaw: cam.yaw + d[0] * 8, pitch: clamp(cam.pitch - d[1] * 6, -60, 88) }; draw(); }
  });
  function afterEdit() {
    updateUI(); draw();
    const r = route();
    const complete = way.length && dist3(way[way.length - 1].p, T) < 1e-9 && r.every((p, i) => i + 1 >= r.length || shareFace(dims, p, r[i + 1]) >= 0);
    if (complete && polyLength(r) <= best * 1.004 && !found) { found = true; setTimeout(() => { if (mode === "3d") startFinale(); }, isReduced() ? 0 : 350); }
    if (!complete) found = false;
  }

  $("#bx-add").addEventListener("click", () => {
    const f = facesOf(dims, S)[0] === 0 ? 2 : 2, k = FACE_AXIS[f], u = (k + 1) % 3, w = (k + 2) % 3, p = [0, 0, 0]; p[k] = faceValue(dims, f); p[u] = dims[u] / 2; p[w] = dims[w] / 2;
    way.push({ p }); afterEdit(); svg.querySelector(`[data-i="${way.length - 1}"]`)?.focus();
  });
  $("#bx-undo").addEventListener("click", () => { way.pop(); afterEdit(); });
  $("#bx-clear").addEventListener("click", () => { way = []; found = false; afterEdit(); });
  $("#bx-walk").addEventListener("click", walkRoute);
  $("#bx-next").addEventListener("click", () => { const k = (flat.k + 1) % NET.length; flat.k = k; flat.m = 0.5; flat.amount = 0; const target = flatCam(k); fly(target, 400, null, () => animateAmount(0, 1, 800)); updateUI(); });
  $("#bx-fold").addEventListener("click", foldBack);

  svg.__box = () => ({ way, mode, flat, cam, add: (p) => { way.push({ p }); afterEdit(); } });   // read by the browser tests
  updateUI(); draw();
  return () => { cancelAnimationFrame(raf); document.removeEventListener("challenge-action", onAction); };
}
