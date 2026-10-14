// Hands-on activities for the Euclidean-geometry and invariant puzzles (see challenge-puzzles2.js for the mathematics).
import { svgEl, toLocal, clamp, colour, lockTouch, MINUS } from "./challenge-kit.js";
import { pathLength, shortestVia, bestContact, reflectSet, luneArea, luneTotal, starK, starSumDegrees, boxSet, boxUnfoldings, boxPath, mergeFinal, mergeProduct, chamSet, chamMin, permOf, inversions, bubbleSwaps, splitTotal } from "./challenge-puzzles2.js";

const f1 = (x) => String(Math.round(x * 10) / 10);
const TAU = Math.PI * 2;

/* --------------------------------------------------- shortest path, mirror */
export function reflect(root, { t, q }) {
  const [a, b, d] = reflectSet(q.set), W = 520, H = 300, s = Math.min(380 / d, 100 / Math.max(a, b), 36), X0 = 70, RY = 150;
  let x = d / 2, best = Infinity, mirror = false, grab = false;
  root.innerHTML = `
    <p class="act-help">${t("Fais glisser le point X le long de la rivière (ou utilise le curseur) : la longueur AX + XB change. Où est-elle la plus petite ? Le bouton « Symétrique de B » montre l’astuce.", "Drag the point X along the river (or use the slider): the length AX + XB changes. Where is it smallest? The “Mirror image of B” button shows the trick.")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Rivière, points A et B, point de puisage X", "River, points A and B, water point X")}"></svg>
    <div class="act-controls"><label class="act-field" for="rf-x"><span class="act-label">${t("Position de X", "Position of X")} <output id="rf-xout"></output></span><input id="rf-x" type="range" min="0" max="${d}" step="0.05" value="${x}"></label>
      <button class="btn btn-secondary" id="rf-mirror" type="button" aria-pressed="false">${t("Symétrique de B", "Mirror image of B")}</button></div>
    <p class="act-readout" id="rf-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#rf-read"), slider = root.querySelector("#rf-x");
  const P = (u, v) => [X0 + u * s, RY - v * s];
  function draw() {
    svg.replaceChildren();
    svgEl("rect", { x: 0, y: RY, width: W, height: H - RY, fill: "color-mix(in srgb, var(--c6) 24%, var(--surface))" }, svg);
    svgEl("line", { x1: 0, y1: RY, x2: W, y2: RY, stroke: colour(5), "stroke-width": 3 }, svg);
    const A = P(0, a), B = P(d, b), X = P(x, 0), Bm = P(d, -b);
    if (mirror) { svgEl("line", { x1: A[0], y1: A[1], x2: Bm[0], y2: Bm[1], stroke: colour(3), "stroke-width": 2.5, "stroke-dasharray": "7 5" }, svg); svgEl("line", { x1: B[0], y1: B[1], x2: Bm[0], y2: Bm[1], stroke: "var(--muted)", "stroke-dasharray": "3 4" }, svg); svgEl("circle", { cx: Bm[0], cy: Bm[1], r: 6, fill: "var(--surface)", stroke: colour(3), "stroke-width": 2 }, svg); const m = svgEl("text", { x: Bm[0] + 12, y: Bm[1] + 5, style: "font:700 14px var(--body);fill:var(--ink)" }, svg); m.textContent = "B′"; }
    svgEl("polyline", { points: `${A.join(",")} ${X.join(",")} ${B.join(",")}`, fill: "none", stroke: colour(1), "stroke-width": 4, "stroke-linejoin": "round" }, svg);
    for (const [pt, lab, dx] of [[A, "A", -16], [B, "B", 14]]) { svgEl("circle", { cx: pt[0], cy: pt[1], r: 7, fill: colour(0), stroke: "var(--ink)", "stroke-width": 2 }, svg); const tx = svgEl("text", { x: pt[0] + dx, y: pt[1] - 8, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--ink)" }, svg); tx.textContent = lab; }
    const gEl = svgEl("g", { class: "toy-handle", tabindex: 0, role: "slider", "aria-label": t("Point X", "Point X"), "aria-valuemin": 0, "aria-valuemax": d, "aria-valuenow": Math.round(x * 100) / 100 }, svg);
    svgEl("circle", { class: "hit", cx: X[0], cy: X[1], r: 24 }, gEl); svgEl("circle", { class: "ring", cx: X[0], cy: X[1], r: 10 }, gEl); svgEl("circle", { class: "core", cx: X[0], cy: X[1], r: 4 }, gEl);
    const L = pathLength(a, b, d, x); best = Math.min(best, L);
    root.querySelector("#rf-xout").textContent = `${f1(x)} m`; slider.value = x;
    root.querySelector("#rf-mirror").setAttribute("aria-pressed", String(mirror));
    read.innerHTML = `AX + XB = <strong>${(Math.round(L * 100) / 100).toString()} m</strong> · ${t("meilleur essai", "best try")} : <strong>${(Math.round(best * 100) / 100).toString()} m</strong>${mirror ? ` · AB′ = √(${d}² + ${a + b}²) = <strong>${shortestVia(a, b, d)} m</strong> ${t("(contact en", "(contact at")} ${f1(bestContact(a, b, d))} m)` : ""}`;
  }
  const move = (e) => { const p = toLocal(svg, e); x = clamp((p.x - X0) / s, 0, d); draw(); };
  svg.addEventListener("pointerdown", (e) => { if (!e.target.closest(".toy-handle")) return; grab = true; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
  svg.addEventListener("pointermove", (e) => { if (grab) move(e); });
  const up = () => { grab = false; }; svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  lockTouch(svg, ".toy-handle");
  svg.addEventListener("keydown", (e) => { if (!e.target.closest?.(".toy-handle")) return; const dd = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!dd) return; e.preventDefault(); x = clamp(x + dd * (e.shiftKey ? 0.5 : 0.1), 0, d); draw(); svg.querySelector(".toy-handle")?.focus(); });
  slider.addEventListener("input", () => { x = Number(slider.value); draw(); });
  root.querySelector("#rf-mirror").addEventListener("click", () => { mirror = !mirror; draw(); });
  draw();
  return () => {};
}

/* ----------------------------------------------------------------- lunes */
export function lunes(root, { t, q }) {
  let a = q.a, b = q.b;
  root.innerHTML = `
    <p class="act-help">${t("Les deux lunules (en orange) sont à l’extérieur du cercle de diamètre AB. Change les côtés CA et CB : compare leur aire, comptée par quadrillage, à l’aire du triangle.", "The two lunes (orange) lie outside the circle on diameter AB. Change the sides CA and CB: compare their area, counted on a grid, with the area of the triangle.")}</p>
    <svg class="act-svg" viewBox="0 0 520 300" role="img" aria-label="${t("Triangle rectangle, demi-cercles et lunules", "Right triangle, semicircles and lunes")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="ln-a"><span class="act-label">CA <output id="ln-aout"></output></span><input id="ln-a" type="range" min="2" max="20" step="1" value="${a}"></label>
      <label class="act-field" for="ln-b"><span class="act-label">CB <output id="ln-bout"></output></span><input id="ln-b" type="range" min="2" max="20" step="1" value="${b}"></label>
    </div>
    <p class="act-readout" id="ln-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#ln-read");
  function draw() {
    svg.replaceChildren();
    const c = Math.hypot(a, b), cx = a / 2, cy = b / 2, R = c / 2, xmin = Math.min(-b / 2, cx - R), xmax = Math.max(a, cx + R), ymin = Math.min(-a / 2, cy - R), ymax = Math.max(b, cy + R);
    const sc = Math.min(480 / (xmax - xmin), 270 / (ymax - ymin)), ox = 20 + (480 - sc * (xmax - xmin)) / 2 - sc * xmin, oy = 15 + sc * ymax + (270 - sc * (ymax - ymin)) / 2;
    const P = (u, v) => [ox + u * sc, oy - v * sc];
    const [Cx, Cy] = P(0, 0), [Ax, Ay] = P(a, 0), [Bx, By] = P(0, b), [Mx, My] = P(cx, cy);
    svgEl("path", { d: `M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}Z`, fill: colour(1), opacity: 0.85 }, svg);
    svgEl("path", { d: `M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}Z`, fill: colour(1), opacity: 0.85 }, svg);
    svgEl("circle", { cx: Mx, cy: My, r: R * sc, fill: "var(--sunken)", stroke: "var(--ink)", "stroke-width": 2 }, svg);
    svgEl("polygon", { points: `${Cx},${Cy} ${Ax},${Ay} ${Bx},${By}`, fill: `color-mix(in srgb, ${colour(0)} 40%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2.5 }, svg);
    svgEl("path", { d: `M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, fill: "none", stroke: "var(--ink)", "stroke-width": 2 }, svg);
    svgEl("path", { d: `M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, fill: "none", stroke: "var(--ink)", "stroke-width": 2 }, svg);
    for (const [pt, lab, dx, dy] of [[[Cx, Cy], "C", -14, 18], [[Ax, Ay], "A", 14, 18], [[Bx, By], "B", -14, -6]]) { const tx = svgEl("text", { x: pt[0] + dx, y: pt[1] + dy, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--ink)" }, svg); tx.textContent = lab; }
    root.querySelector("#ln-aout").textContent = `${a} cm`; root.querySelector("#ln-bout").textContent = `${b} cm`;
    const est = luneArea(a, b, 360), tri = luneTotal(a, b);
    read.innerHTML = `${t("Aire des lunules (comptage)", "Area of the lunes (counted)")} ≈ <strong>${f1(est)} cm²</strong> · ${t("aire du triangle", "area of the triangle")} ${a} × ${b} / 2 = <strong>${tri} cm²</strong>`;
  }
  root.querySelector("#ln-a").addEventListener("input", (e) => { a = Number(e.target.value); draw(); });
  root.querySelector("#ln-b").addEventListener("input", (e) => { b = Number(e.target.value); draw(); });
  draw();
  return () => {};
}

/* ------------------------------------------------------------------ star */
export function star(root, { t, q }) {
  let n = q.n, k = starK(q.n, q.k), irregular = false, angles = [];
  const regular = () => Array.from({ length: n }, (_, i) => (TAU * i) / n);
  root.innerHTML = `
    <p class="act-help">${t("Choisis le nombre de points et le saut. Les angles aux pointes sont mesurés à partir des coordonnées. Le bouton « Points au hasard » déplace les points sur le cercle : que devient la somme ?", "Choose the number of points and the skip. The tip angles are measured from the coordinates. The “Random points” button moves the points on the circle: what happens to the sum?")}</p>
    <svg class="act-svg" viewBox="0 0 520 320" role="img" aria-label="${t("Étoile à n branches", "Star with n points")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="st-n"><span class="act-label">${t("Points", "Points")} <output id="st-nout"></output></span><input id="st-n" type="range" min="5" max="13" step="1" value="${n}"></label>
      <label class="act-field" for="st-k"><span class="act-label">${t("Saut k", "Skip k")} <output id="st-kout"></output></span><input id="st-k" type="range" min="1" max="6" step="1" value="${k}"></label>
      <button class="btn btn-secondary" id="st-rand" type="button">${t("Points au hasard", "Random points")}</button><button class="btn-quiet" id="st-reg" type="button">${t("Régulier", "Regular")}</button>
    </div>
    <p class="act-readout" id="st-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#st-read");
  function draw() {
    k = starK(n, k); const ang = irregular ? angles : regular(), CX = 260, CY = 160, R = 140, P = (i) => [CX + R * Math.cos(ang[i] - Math.PI / 2), CY + R * Math.sin(ang[i] - Math.PI / 2)];
    svg.replaceChildren();
    svgEl("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "var(--line-strong)", "stroke-width": 1.5 }, svg);
    for (let i = 0; i < n; i++) { const [x1, y1] = P(i), [x2, y2] = P((i + k) % n); svgEl("line", { x1, y1, x2, y2, stroke: colour(1), "stroke-width": 3, "stroke-linecap": "round" }, svg); }
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const o = P(i), u = P((i + k) % n), v = P((i - k + n) % n), a1 = [u[0] - o[0], u[1] - o[1]], b1 = [v[0] - o[0], v[1] - o[1]];
      const tip = (Math.acos(clamp((a1[0] * b1[0] + a1[1] * b1[1]) / (Math.hypot(...a1) * Math.hypot(...b1)), -1, 1)) * 180) / Math.PI; sum += tip;
      svgEl("circle", { cx: o[0], cy: o[1], r: 4, fill: colour(0) }, svg);
      const mx = CX + (R + 16) * Math.cos(ang[i] - Math.PI / 2), my = CY + (R + 16) * Math.sin(ang[i] - Math.PI / 2), tx = svgEl("text", { x: mx, y: my + 4, "text-anchor": "middle", style: "font:600 11px var(--body);fill:var(--ink)" }, svg); tx.textContent = `${Math.round(tip)}°`;
    }
    root.querySelector("#st-nout").textContent = n; root.querySelector("#st-kout").textContent = k;
    root.querySelector("#st-k").value = k;
    read.innerHTML = `${t("Somme des angles aux pointes", "Sum of the tip angles")} = <strong>${f1(sum)}°</strong>${irregular ? ` (${t("points quelconques", "arbitrary points")})` : ""}`;
  }
  root.querySelector("#st-n").addEventListener("input", (e) => { n = Number(e.target.value); irregular = false; draw(); });
  root.querySelector("#st-k").addEventListener("input", (e) => { k = Number(e.target.value); irregular = false; draw(); });
  root.querySelector("#st-rand").addEventListener("click", () => { angles = Array.from({ length: n }, () => Math.random() * TAU).sort((u, v) => u - v); irregular = true; draw(); });
  root.querySelector("#st-reg").addEventListener("click", () => { irregular = false; draw(); });
  void starSumDegrees;
  draw();
  return () => {};
}

/* ------------------------------------------------------------------- box */
export function box(root, { t, q }) {
  const [a, b, c] = boxSet(q.set), U = boxUnfoldings(a, b, c);
  let pick = 0;
  root.innerHTML = `
    <p class="act-help">${t("La fourmi traverse deux faces voisines. Choisis la paire de faces : on les déplie en un rectangle et le trajet devient un segment de droite. Laquelle donne le plus court trajet ?", "The ant crosses two neighbouring faces. Choose the pair of faces: they are unfolded into one rectangle and the route becomes a straight segment. Which pair gives the shortest route?")}</p>
    <svg class="act-svg" viewBox="0 0 520 280" role="img" aria-label="${t("Deux faces dépliées", "Two unfolded faces")}"></svg>
    <fieldset class="act-choice" role="radiogroup"><legend>${t("Faces dépliées", "Unfolded faces")}</legend>${U.map((u, i) => `<label><input type="radio" name="bx" value="${i}" ${i === 0 ? "checked" : ""}> ${t("dimensions", "dimensions")} ${u.cross[0]} + ${u.cross[1]} ${t("et hauteur", "and height")} ${u.height}</label>`).join("")}</fieldset>
    <p class="act-readout" id="bx-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#bx-read"), seen = new Set();
  function draw() {
    svg.replaceChildren();
    const u = U[pick], w = u.cross[0] + u.cross[1], h = u.height, sc = Math.min(440 / w, 210 / h), x0 = (520 - w * sc) / 2, y0 = 20;
    svgEl("rect", { x: x0, y: y0, width: u.cross[0] * sc, height: h * sc, fill: `color-mix(in srgb, ${colour(0)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 }, svg);
    svgEl("rect", { x: x0 + u.cross[0] * sc, y: y0, width: u.cross[1] * sc, height: h * sc, fill: `color-mix(in srgb, ${colour(2)} 35%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 }, svg);
    svgEl("line", { x1: x0, y1: y0 + h * sc, x2: x0 + w * sc, y2: y0, stroke: colour(1), "stroke-width": 4, "stroke-linecap": "round" }, svg);
    svgEl("circle", { cx: x0, cy: y0 + h * sc, r: 6, fill: colour(1) }, svg); svgEl("circle", { cx: x0 + w * sc, cy: y0, r: 6, fill: colour(1) }, svg);
    for (const [x, y, s2, anchor] of [[x0 + (u.cross[0] * sc) / 2, y0 + h * sc + 20, `${u.cross[0]}`, "middle"], [x0 + u.cross[0] * sc + (u.cross[1] * sc) / 2, y0 + h * sc + 20, `${u.cross[1]}`, "middle"], [x0 - 10, y0 + (h * sc) / 2, `${h}`, "end"]]) { const tx = svgEl("text", { x, y, "text-anchor": anchor, style: "font:700 14px var(--body);fill:var(--ink)" }, svg); tx.textContent = s2; }
    seen.add(pick);
    const done = seen.size === 3, best = boxPath(a, b, c);
    read.innerHTML = `√((${u.cross[0]} + ${u.cross[1]})² + ${h}²) = √${w * w + h * h} ≈ <strong>${Math.round(u.length * 100) / 100} cm</strong>${done ? ` · ${t("le plus court des trois", "the shortest of the three")} : <strong>${Math.round(best * 100) / 100} cm</strong>` : ` · ${t("essaie les deux autres paires", "try the other two pairs")}`}`;
  }
  root.querySelectorAll('input[name="bx"]').forEach((r) => r.addEventListener("change", () => { pick = Number(r.value); draw(); }));
  draw();
  return () => {};
}

/* ----------------------------------------------------------------- merge */
export function merge(root, { t, q }) {
  const N = q.n;
  let nums, history, sel;
  const reset = () => { nums = Array.from({ length: N }, (_, i) => i + 1); history = []; sel = []; };
  root.innerHTML = `
    <p class="act-help">${t("Touche deux nombres pour les remplacer par a + b + ab. Regarde la quantité calculée en dessous : change-t-elle ?", "Tap two numbers to replace them by a + b + ab. Watch the quantity computed below: does it change?")}</p>
    <div class="cl-grid cl-merge" id="mg-board" role="group" aria-label="${t("Nombres au tableau", "Numbers on the board")}"></div>
    <div class="act-controls"><button class="btn btn-secondary" id="mg-rand" type="button">${t("Fusion au hasard", "Random merge")}</button><button class="btn-quiet" id="mg-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="mg-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="mg-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="mg-log" aria-label="${t("Étapes", "Steps")}"></ol>`;
  const board = root.querySelector("#mg-board"), read = root.querySelector("#mg-read"), logEl = root.querySelector("#mg-log");
  function draw() {
    board.innerHTML = nums.map((x, i) => `<button type="button" class="cl-tok" data-i="${i}" aria-pressed="${sel.includes(i)}">${x}</button>`).join("");
    logEl.innerHTML = history.map((h) => `<li>${h.a} + ${h.b} + ${h.a}×${h.b} = <strong>${h.r}</strong></li>`).join("");
    const prod = mergeProduct(nums);
    read.innerHTML = `${t("Produit de tous les (nombre + 1)", "Product of all the (number + 1)")} = <strong>${prod.toLocaleString(t("fr-FR", "en-US"))}</strong>${nums.length === 1 ? ` — ${t("il reste", "left")} <strong>${nums[0]}</strong>, ${t("soit", "that is")} ${prod.toLocaleString(t("fr-FR", "en-US"))} − 1.` : ""}`;
    root.querySelector("#mg-undo").disabled = !history.length; root.querySelector("#mg-rand").disabled = nums.length < 2;
  }
  function doMerge(i, j) { const a = nums[i], b = nums[j], r = a + b + a * b; history.push({ a, b, r, nums: [...nums] }); nums = nums.filter((_, k) => k !== i && k !== j); nums.push(r); sel = []; draw(); }
  board.addEventListener("click", (e) => { const b = e.target.closest(".cl-tok"); if (!b) return; const i = Number(b.dataset.i); if (sel.includes(i)) sel = sel.filter((x) => x !== i); else sel.push(i); if (sel.length === 2) doMerge(sel[0], sel[1]); else draw(); });
  root.querySelector("#mg-rand").addEventListener("click", () => { const i = Math.floor(Math.random() * nums.length); let j; do j = Math.floor(Math.random() * nums.length); while (j === i); doMerge(i, j); });
  root.querySelector("#mg-undo").addEventListener("click", () => { const h = history.pop(); if (h) { nums = h.nums; sel = []; draw(); } });
  root.querySelector("#mg-reset").addEventListener("click", () => { reset(); draw(); });
  void mergeFinal;
  reset(); draw();
  return () => {};
}

/* ------------------------------------------------------------ chameleons */
export function cham(root, { t, q }) {
  const start = chamSet(q.set), NAMES = [t("rouges", "red"), t("verts", "green"), t("bleus", "blue")], COL = [colour(3), colour(2), colour(0)];
  let s, hist;
  const reset = () => { s = [...start]; hist = []; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis quelles couleurs se rencontrent : les deux prennent la troisième couleur. Peux-tu rendre tous les caméléons de la même couleur ? Observe les différences modulo 3.", "Choose which colours meet: both take the third colour. Can you make all the chameleons the same colour? Watch the differences modulo 3.")}</p>
    <div class="cm-bars" id="cm-bars" aria-hidden="true"></div>
    <div class="act-buttons" id="cm-btns" role="group" aria-label="${t("Rencontres", "Meetings")}"></div>
    <div class="act-controls"><button class="btn-quiet" id="cm-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="cm-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="cm-read" role="status" aria-live="polite"></p>`;
  const bars = root.querySelector("#cm-bars"), btns = root.querySelector("#cm-btns"), read = root.querySelector("#cm-read");
  const PAIRS = [[0, 1, 2], [0, 2, 1], [1, 2, 0]], mod = (x) => ((x % 3) + 3) % 3;
  function draw() {
    const total = s[0] + s[1] + s[2];
    bars.innerHTML = s.map((v, i) => `<div class="cm-row"><span class="cm-name">${NAMES[i]}</span><span class="cm-bar" style="width:${(v / total) * 100}%;background:${COL[i]}"></span><strong>${v}</strong></div>`).join("");
    btns.innerHTML = PAIRS.map(([i, j, k]) => `<button type="button" class="btn btn-secondary cm-meet" data-i="${i}" data-j="${j}" data-k="${k}" ${s[i] > 0 && s[j] > 0 ? "" : "disabled"}>${NAMES[i]} + ${NAMES[j]} → ${NAMES[k]}</button>`).join("");
    root.querySelector("#cm-undo").disabled = !hist.length;
    const single = s.filter((x) => x > 0).length === 1;
    read.innerHTML = `${t("Rencontres", "Meetings")} : <strong>${hist.length}</strong> · r − v ≡ <strong>${mod(s[0] - s[1])}</strong>, v − b ≡ <strong>${mod(s[1] - s[2])}</strong>, b − r ≡ <strong>${mod(s[2] - s[0])}</strong> (mod 3)${single ? ` — <strong>${t("tous de la même couleur !", "all one colour!")}</strong> ${t(`En ${hist.length} rencontres ; le minimum possible est ${chamMin(...start)}.`, `In ${hist.length} meetings; the least possible is ${chamMin(...start)}.`)}` : ""}`;
  }
  btns.addEventListener("click", (e) => { const b = e.target.closest(".cm-meet"); if (!b) return; const [i, j, k] = [b.dataset.i, b.dataset.j, b.dataset.k].map(Number); hist.push([...s]); s[i]--; s[j]--; s[k] += 2; draw(); });
  root.querySelector("#cm-undo").addEventListener("click", () => { const p = hist.pop(); if (p) { s = p; draw(); } });
  root.querySelector("#cm-reset").addEventListener("click", () => { reset(); draw(); });
  reset(); draw();
  return () => {};
}

/* ------------------------------------------------------------ inversions */
export function inversionsAct(root, { t, q }) {
  const p0 = permOf(q.n, q.seed), N = q.n, total = inversions(p0);
  let row, swaps;
  const reset = () => { row = [...p0]; swaps = 0; };
  root.innerHTML = `
    <p class="act-help">${t("Touche une personne pour la faire échanger sa place avec sa voisine de droite, si elle est plus grande. Combien d’échanges au total ? Regarde le compteur d’inversions.", "Tap a person to swap places with the neighbour on the right, if taller. How many swaps in all? Watch the inversion counter.")}</p>
    <div class="iv-row" id="iv-row" role="group" aria-label="${t("Rangée de personnes", "Row of people")}"></div>
    <div class="act-controls"><button class="btn btn-secondary" id="iv-one" type="button">${t("Un échange au hasard", "One random swap")}</button><button class="btn btn-secondary" id="iv-all" type="button">${t("Tout trier", "Sort it all")}</button><button class="btn-quiet" id="iv-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="iv-read" role="status" aria-live="polite"></p>`;
  const rowEl = root.querySelector("#iv-row"), read = root.querySelector("#iv-read");
  function draw(msg = "") {
    rowEl.innerHTML = row.map((h, i) => `<button type="button" class="iv-bar" data-i="${i}" style="height:${28 + (h / N) * 120}px;background:color-mix(in srgb, ${colour(h - 1)} 55%, var(--surface))" aria-label="${t("taille", "height")} ${h}">${h}</button>`).join("");
    const inv = inversions(row);
    root.querySelector("#iv-one").disabled = inv === 0; root.querySelector("#iv-all").disabled = inv === 0;
    read.innerHTML = msg || `${t("Échanges faits", "Swaps made")} : <strong>${swaps}</strong> · ${t("inversions restantes", "inversions left")} : <strong>${inv}</strong> · ${t("somme", "sum")} <strong>${swaps + inv}</strong>${inv === 0 ? ` — ${t(`rangée triée en ${swaps} échanges.`, `row sorted in ${swaps} swaps.`)}` : ""}`;
  }
  const swap = (i) => { [row[i], row[i + 1]] = [row[i + 1], row[i]]; swaps++; };
  rowEl.addEventListener("click", (e) => { const b = e.target.closest(".iv-bar"); if (!b) return; const i = Number(b.dataset.i); if (i + 1 < N && row[i] > row[i + 1]) { swap(i); draw(); } else draw(t("Pas d’échange : cette personne n’est pas plus grande que sa voisine de droite.", "No swap: this person is not taller than the neighbour on the right.")); });
  root.querySelector("#iv-one").addEventListener("click", () => { const c = row.map((_, i) => i).filter((i) => i + 1 < N && row[i] > row[i + 1]); if (c.length) { swap(c[Math.floor(Math.random() * c.length)]); draw(); } });
  root.querySelector("#iv-all").addEventListener("click", () => { for (const i of bubbleSwaps(row).log) swap(i); draw(); });
  root.querySelector("#iv-reset").addEventListener("click", () => { reset(); draw(); });
  void total;
  reset(); draw();
  return () => {};
}

/* ----------------------------------------------------------------- piles */
export function piles(root, { t, q }) {
  const N = q.n;
  let ps, log, total, sel, cut;
  const reset = () => { ps = [N]; log = []; total = 0; sel = 0; cut = 1; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis un tas d’au moins 2 cailloux, règle la coupure, puis sépare : le produit est noté. Essaie plusieurs façons de couper : que remarques-tu sur le total à la fin ?", "Choose a pile of at least 2 pebbles, set the cut, then split: the product is written down. Try several ways of cutting: what do you notice about the total at the end?")}</p>
    <div class="cl-grid cl-piles" id="pl-piles" role="group" aria-label="${t("Tas de cailloux", "Piles of pebbles")}"></div>
    <div class="act-controls"><label class="act-field" for="pl-cut"><span class="act-label">${t("Coupure", "Cut")} <output id="pl-cutout"></output></span><input id="pl-cut" type="range" min="1" max="2" step="1" value="1"></label>
      <button class="btn btn-primary" id="pl-split" type="button">${t("Séparer", "Split")}</button><button class="btn btn-secondary" id="pl-rand" type="button">${t("Tout séparer au hasard", "Split everything at random")}</button><button class="btn-quiet" id="pl-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="pl-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="pl-log" aria-label="${t("Produits notés", "Products written down")}"></ol>`;
  const box2 = root.querySelector("#pl-piles"), read = root.querySelector("#pl-read"), logEl = root.querySelector("#pl-log"), slider = root.querySelector("#pl-cut");
  function draw() {
    if (sel >= ps.length || ps[sel] < 2) sel = Math.max(0, ps.findIndex((x) => x > 1));
    const s = ps[sel] ?? 1; cut = clamp(cut, 1, Math.max(1, s - 1));
    box2.innerHTML = ps.map((x, i) => `<button type="button" class="cl-tok" data-i="${i}" aria-pressed="${i === sel && x > 1}" ${x > 1 ? "" : "disabled"}>${x}</button>`).join("");
    slider.max = Math.max(1, s - 1); slider.value = cut; slider.disabled = s < 2;
    root.querySelector("#pl-cutout").textContent = s > 1 ? `${cut} + ${s - cut} → ${cut * (s - cut)}` : "—";
    root.querySelector("#pl-split").disabled = s < 2; root.querySelector("#pl-rand").disabled = !ps.some((x) => x > 1);
    logEl.innerHTML = log.map((l) => `<li>${l.a} × ${l.b} = ${l.a * l.b}</li>`).join("");
    const done = !ps.some((x) => x > 1);
    read.innerHTML = `${t("Total des produits", "Total of the products")} : <strong>${total}</strong>${done ? ` — ${t("tous les tas sont réduits à un caillou. Pour", "every pile is down to one pebble. For")} ${N} ${t("cailloux, c’est", "pebbles it is")} ${N} × ${N - 1} / 2 = <strong>${splitTotal(N)}</strong>.` : ""}`;
  }
  function split(i, a) { const s = ps[i], b = s - a; ps.splice(i, 1, a, b); log.push({ a, b }); total += a * b; }
  box2.addEventListener("click", (e) => { const b = e.target.closest(".cl-tok"); if (b && !b.disabled) { sel = Number(b.dataset.i); draw(); } });
  slider.addEventListener("input", () => { cut = Number(slider.value); draw(); });
  root.querySelector("#pl-split").addEventListener("click", () => { if (ps[sel] > 1) { split(sel, cut); cut = 1; draw(); } });
  root.querySelector("#pl-rand").addEventListener("click", () => { while (ps.some((x) => x > 1)) { const i = ps.findIndex((x) => x > 1); split(i, 1 + Math.floor(Math.random() * (ps[i] - 1))); } draw(); });
  root.querySelector("#pl-reset").addEventListener("click", () => { reset(); draw(); });
  void MINUS;
  reset(); draw();
  return () => {};
}
