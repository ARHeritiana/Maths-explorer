// Hands-on activity of the artgallery challenge: the learner tries, fails and notices; it never states the answer or the method.
import { pointInPolygon, visibility, triangulate, threeColour } from "./maths.js";
import { lockTouch, onHintAction, svgEl, colour, toLocal } from "../common/kit.js";

export const GW = 20, GH = 12;

export const segCross = (a, b, c, d) => {   // do the closed segments ab and cd meet?
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const on = (p, q, r) => Math.min(p[0], q[0]) - 1e-9 <= r[0] && r[0] <= Math.max(p[0], q[0]) + 1e-9 && Math.min(p[1], q[1]) - 1e-9 <= r[1] && r[1] <= Math.max(p[1], q[1]) + 1e-9;
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  if (((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9))) return true;
  return (Math.abs(d1) <= 1e-9 && on(c, d, a)) || (Math.abs(d2) <= 1e-9 && on(c, d, b)) || (Math.abs(d3) <= 1e-9 && on(a, b, c)) || (Math.abs(d4) <= 1e-9 && on(a, b, d));
};

export const isSimple = (poly) => {
  const n = poly.length;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || (i === 0 && j === n - 1)) continue;   // neighbouring walls share a vertex
    if (segCross(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return false;
  }
  // neighbouring walls must not fold back onto each other
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], c = poly[(i + 2) % n], cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(cr) < 1e-6 && (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]) < 0) return false;
  }
  return true;
};

export const distSeg = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p[0] - a[0] - k * dx, p[1] - a[1] - k * dy); };

// A gallery worth exploring has no needle-thin spikes: every corner opens at least 15 degrees and no vertex hugs a wall.
export const roomy = (pts) => {
  const n = pts.length, minAng = ((n > 12 ? 8 : 15) * Math.PI) / 180, minDist = n > 12 ? 0.22 : 0.45;
  return pts.every((v, i) => {
    const a = pts[(i + n - 1) % n], c = pts[(i + 1) % n], u = [a[0] - v[0], a[1] - v[1]], w = [c[0] - v[0], c[1] - v[1]];
    const ang = Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w)))));
    if (ang < minAng) return false;
    return pts.every((p, j) => j === (i + 1) % n || j === (i + n - 1) % n || j === i || distSeg(v, p, pts[(j + 1) % n]) > minDist || (j + 1) % n === i);
  });
};

export const polyArea = (p) => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0)) / 2;

// Random simple polygon: random points joined in a random order, then 2-opt moves (reverse a stretch whenever two walls
// cross) until no walls cross; each move shortens the closed path, so this stops.
export function randomGallery(n) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const pts = Array.from({ length: n }, () => [1 + Math.random() * (GW - 2), 1 + Math.random() * (GH - 2)]);
    for (let guard = 0; guard < 4000; guard++) {
      let moved = false;
      for (let i = 0; i < n && !moved; i++) for (let j = i + 2; j < n && !moved; j++) {
        if (i === 0 && j === n - 1) continue;
        if (segCross(pts[i], pts[i + 1], pts[j], pts[(j + 1) % n])) { pts.splice(i + 1, j - i, ...pts.slice(i + 1, j + 1).reverse()); moved = true; }
      }
      if (!moved) break;
    }
    const ok = isSimple(pts) && roomy(pts) && polyArea(pts) > 0.18 * GW * GH && pts.every((p, i) => Math.hypot(p[0] - pts[(i + 1) % n][0], p[1] - pts[(i + 1) % n][1]) > 0.8);
    if (ok) { const signed = pts.reduce((s, a, i) => { const b = pts[(i + 1) % n]; return s + a[0] * b[1] - b[0] * a[1]; }, 0); return signed < 0 ? pts.reverse() : pts; }   // counterclockwise, as visibility() expects
  }
  return convexGallery(n);
}

export const convexGallery = (n) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return [GW / 2 + 8.6 * Math.cos(a), GH / 2 + 5 * Math.sin(a)]; });

export const starGallery = (n) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI, r = i % 2 ? 0.45 : 1; return [GW / 2 + 8.8 * r * Math.cos(a), GH / 2 + 5.2 * r * Math.sin(a)]; });

export function activity(root, { t, q }) {
  const N = Number(q.n), MAXG = Math.floor(N / 3) + 4;
  const SC = 16, PAD = 14, W = GW * SC + 2 * PAD, H = GH * SC + 2 * PAD;
  const X = (x) => PAD + x * SC, Y = (y) => PAD + (GH - y) * SC;
  const inv = (p) => [(p.x - PAD) / SC, GH - (p.y - PAD) / SC];
  let poly = randomGallery(N), cells = [];
  const guards = [];
  let drag = null, sel = -1, mode = "guard", best = 0, aid = 0;   // aid: 0 none, 1 triangulation (hint 1), 2 plus 3-colouring (hint 2)
  root.innerHTML = `
    <p class="act-help">${t(`Une galerie à ${N} côtés. Pose des gardiens (touche la galerie ; glisse un gardien pour le déplacer, touche-le pour l’enlever). Puis change de galerie ou déforme celle-ci : glisse un sommet, tant que les murs ne se croisent pas.`, `A gallery with ${N} sides. Place guards (tap the gallery; drag a guard to move it, tap it to remove it). Then change the gallery or reshape this one: drag a vertex as long as the walls do not cross.`)}</p>
    <div class="act-controls" role="group" aria-label="${t("Que déplacer ?", "What to move?")}">
      <button class="btn btn-secondary" id="ag-m-guard" type="button" aria-pressed="true">${t("Gardiens", "Guards")}</button>
      <button class="btn btn-secondary" id="ag-m-vertex" type="button" aria-pressed="false">${t("Sommets", "Vertices")}</button>
    </div>
    <svg class="act-svg ag-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t(`Galerie à ${N} côtés`, `Gallery with ${N} sides`)}"></svg>
    <div class="act-controls">
      <button class="btn btn-secondary" id="ag-random" type="button">${t("Autre galerie au hasard", "Another random gallery")}</button>
      <button class="btn-quiet" id="ag-convex" type="button">${t("Convexe", "Convex")}</button>
      <button class="btn-quiet" id="ag-star" type="button">${t("Étoilée", "Star-shaped")}</button>
      <button class="btn-quiet" id="ag-clear" type="button">${t("Enlever les gardiens", "Remove guards")}</button>
    </div>
    <p class="act-readout" id="ag-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  lockTouch(svg, ".ag-guard, .ag-vertex");
  const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join("") + "Z";
  const sample = () => { cells = []; for (let x = 0.1; x < GW; x += 0.3) for (let y = 0.1; y < GH; y += 0.3) if (pointInPolygon([x, y], poly)) cells.push([x, y]); };
  const keepInside = () => { for (let i = guards.length - 1; i >= 0; i--) if (!pointInPolygon(guards[i], poly)) guards.splice(i, 1); };
  const setPoly = (p) => { poly = p; guards.length = 0; sel = -1; best = 0; sample(); draw(); };

  function draw() {
    svg.replaceChildren();
    svgEl("path", { d: path(poly), class: "ag-poly" }, svg);
    const vis = guards.map((g) => visibility(poly, g));
    vis.forEach((v) => svgEl("path", { d: path(v), class: "ag-vis" }, svg));
    svgEl("path", { d: path(poly), class: "ag-wall" }, svg);
    if (aid >= 1) {
      const tris = triangulate(poly);
      tris.forEach(([a, b, c]) => svgEl("path", { d: path([poly[a], poly[b], poly[c]]), fill: "none", stroke: "var(--muted)", "stroke-width": 1.4, "stroke-dasharray": "4 4", "pointer-events": "none" }, svg));
      if (aid >= 2) threeColour(poly.length, tris).forEach((c, i) => { svgEl("circle", { cx: X(poly[i][0]), cy: Y(poly[i][1]), r: 7, fill: colour(c * 2 + 1), stroke: "var(--ink)", "stroke-width": 1.5, "pointer-events": "none" }, svg); });
    }
    if (mode === "vertex") poly.forEach((v, i) => {
      const grp = svgEl("g", { class: "ag-vertex", "data-v": i, tabindex: 0, role: "button", "aria-label": `${t("Sommet", "Vertex")} ${i + 1}` }, svg);
      svgEl("circle", { cx: X(v[0]), cy: Y(v[1]), r: 16, class: "hit" }, grp);
      svgEl("rect", { x: X(v[0]) - 6, y: Y(v[1]) - 6, width: 12, height: 12, rx: 2, class: "sq" }, grp);
    });
    guards.forEach((g, i) => {
      const grp = svgEl("g", { class: `ag-guard${i === sel ? " sel" : ""}`, "data-g": i, tabindex: 0, role: "button", "aria-label": `${t("Gardien", "Guard")} ${i + 1}` }, svg);
      svgEl("circle", { cx: X(g[0]), cy: Y(g[1]), r: 16, class: "hit" }, grp);
      svgEl("circle", { cx: X(g[0]), cy: Y(g[1]), r: 7, class: "dot", style: `fill:${colour(i)}` }, grp);
      svgEl("circle", { cx: X(g[0]), cy: Y(g[1]), r: 11, class: "ring" }, grp);
    });
    const seen = cells.filter((c) => vis.some((v) => pointInPolygon(c, v))).length;
    const pct = Math.floor((100 * seen) / cells.length), n = guards.length, all = n > 0 && seen === cells.length;
    if (all && (best === 0 || n < best)) best = n;
    root.querySelector("#ag-read").innerHTML = `${n} ${t(n > 1 ? "gardiens" : "gardien", n > 1 ? "guards" : "guard")}. ${t("Surveillé", "Watched")} : <strong>${pct} %</strong>.${all ? ` ${t("Toute la galerie est surveillée.", "The whole gallery is watched.")}` : ""}${best ? ` ${t("Ton meilleur sur cette galerie", "Your best on this gallery")} : <strong>${best}</strong>.` : ""}`;
    root.querySelector("#ag-m-guard").setAttribute("aria-pressed", String(mode === "guard"));
    root.querySelector("#ag-m-vertex").setAttribute("aria-pressed", String(mode === "vertex"));
    root.querySelector("#ag-random").textContent = t("Autre galerie au hasard", "Another random gallery");
  }
  const inside = (p) => pointInPolygon(p, poly);
  const add = (p) => { if (mode === "guard" && guards.length < MAXG && inside(p)) { guards.push([p[0], p[1]]); sel = guards.length - 1; draw(); } };
  const clampP = (p) => [Math.min(GW - 0.2, Math.max(0.2, p[0])), Math.min(GH - 0.2, Math.max(0.2, p[1]))];
  const tryVertex = (i, p) => { const c = clampP(p), next = poly.map((v, k) => (k === i ? c : v)); if (!isSimple(next)) return false; poly = next; keepInside(); sample(); return true; };

  svg.addEventListener("pointerdown", (e) => {
    const v = e.target.closest("[data-v]"), g = e.target.closest("[data-g]");
    if (v && mode === "vertex") { e.preventDefault(); drag = { kind: "v", i: Number(v.dataset.v), x: e.clientX, y: e.clientY, moved: false }; svg.setPointerCapture(e.pointerId); return; }
    if (!g) { add(inv(toLocal(svg, e))); return; }
    if (mode !== "guard") return;
    e.preventDefault();
    const i = Number(g.dataset.g);
    drag = { kind: "g", i, x: e.clientX, y: e.clientY, moved: false };
    sel = i;
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) drag.moved = true;
    if (!drag.moved) return;
    const p = inv(toLocal(svg, e));
    if (drag.kind === "g") { if (inside(p)) { guards[drag.i] = p; draw(); } }
    else if (tryVertex(drag.i, p)) draw();
  });
  const end = () => {
    if (!drag) return;
    if (drag.kind === "g" && !drag.moved) guards.splice(drag.i, 1);
    sel = -1; drag = null; draw();
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  svg.addEventListener("keydown", (e) => {
    const g = e.target.closest?.("[data-g]"), v = e.target.closest?.("[data-v]");
    if (!g && !v) return;
    const step = e.shiftKey ? 1 : 0.4, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (g) {
      const i = Number(g.dataset.g);
      if (mv) { e.preventDefault(); const p = [guards[i][0] + mv[0], guards[i][1] + mv[1]]; if (inside(p)) { guards[i] = p; sel = i; draw(); svg.querySelector(`[data-g="${i}"]`)?.focus(); } }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); guards.splice(i, 1); sel = -1; draw(); }
    } else if (mv) {
      e.preventDefault(); const i = Number(v.dataset.v);
      if (tryVertex(i, [poly[i][0] + mv[0], poly[i][1] + mv[1]])) { draw(); svg.querySelector(`[data-v="${i}"]`)?.focus(); }
    }
  });
  root.querySelector("#ag-m-guard").addEventListener("click", () => { mode = "guard"; draw(); });
  root.querySelector("#ag-m-vertex").addEventListener("click", () => { mode = "vertex"; draw(); });
  root.querySelector("#ag-random").addEventListener("click", () => setPoly(randomGallery(N)));
  root.querySelector("#ag-convex").addEventListener("click", () => setPoly(convexGallery(N)));
  root.querySelector("#ag-star").addEventListener("click", () => setPoly(starGallery(N)));
  root.querySelector("#ag-clear").addEventListener("click", () => { guards.length = 0; sel = -1; draw(); });
  sample(); draw();
  return onHintAction("artgallery", { triangulate: () => { aid = Math.max(aid, 1); draw(); }, colour: () => { aid = 2; draw(); } });
}
