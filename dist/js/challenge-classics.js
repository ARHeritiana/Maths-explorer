// Hands-on activities for the classic puzzles: grid paths, the 25 horses, the cake, queens, the snail, the bridge,
// the light egg and the fake coins. Each is mounted by mountActivity (challenge-activities.js) with the parameters q
// of the variation on show; the mathematics lives in challenge-puzzles.js.
import { makeSnail, makeEgg } from "./scene-props.js";
import { makeSoldier } from "./scene-kit.js";
import { svgEl, toLocal, clamp, colour, lockTouch, MINUS, onHintAction } from "./challenge-kit.js";
import { pascalGrid, gridPaths, horseRaces, squarePoint, cakeShares, unattacked, QUEENS, queensK, queensBest, snailDown, snailTrace, snailDays, bridgeBest, bridgePlans, bridgeTimes, eggWeighings, minSample, identifies } from "./challenge-puzzles.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const shuffled = (n) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ------------------------------------------------------------ grid paths */
export function gridpaths(root, { t, q }) {
  const m = q.m, n = q.n, W = 520, H = 300, X0 = 40, Y0 = 20, DX = Math.min(44, 440 / m), DY = Math.min(44, 250 / n), found = new Set();
  let walk = [], counts = false;
  const px = (i) => X0 + i * DX, py = (j) => Y0 + (n - j) * DY, g = pascalGrid(m, n);
  root.innerHTML = `
    <p class="act-help">${t("Avance du coin en bas à gauche (A) jusqu’au coin en haut à droite (B) avec les boutons ou en touchant le prochain point. Chaque chemin complet est mémorisé : combien de chemins différents trouves-tu ?", "Walk from the bottom-left corner (A) to the top-right corner (B) with the buttons or by tapping the next point. Every complete path is remembered: how many different paths can you find?")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Quadrillage", "Grid")}"></svg>
    <div class="act-buttons">
      <button class="btn btn-secondary" id="gp-r" type="button">${t("Droite →", "Right →")}</button>
      <button class="btn btn-secondary" id="gp-u" type="button">${t("Haut ↑", "Up ↑")}</button>
      <button class="btn-quiet" id="gp-undo" type="button">${t("Annuler un pas", "Undo a step")}</button>
      <button class="btn-quiet" id="gp-clear" type="button">${t("Nouveau chemin", "New path")}</button>
      <button class="btn btn-secondary" id="gp-rand" type="button">${t("Chemin au hasard", "Random path")}</button>
    </div>
    <p class="act-readout" id="gp-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#gp-read"), pos = () => walk.reduce(([i, j], s) => (s === "R" ? [i + 1, j] : [i, j + 1]), [0, 0]);
  const word = (w) => w.join("");
  function draw() {
    svg.replaceChildren();
    for (let j = 0; j <= n; j++) svgEl("line", { x1: px(0), y1: py(j), x2: px(m), y2: py(j), stroke: "var(--line-strong)", "stroke-width": 1 }, svg);
    for (let i = 0; i <= m; i++) svgEl("line", { x1: px(i), y1: py(0), x2: px(i), y2: py(n), stroke: "var(--line-strong)", "stroke-width": 1 }, svg);
    let [ci, cj] = [0, 0]; const pts = [[0, 0]]; for (const s of walk) { s === "R" ? ci++ : cj++; pts.push([ci, cj]); }
    svgEl("polyline", { points: pts.map(([i, j]) => `${px(i)},${py(j)}`).join(" "), fill: "none", stroke: colour(1), "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) {
      const here = i === ci && j === cj, next = (i === ci + 1 && j === cj) || (i === ci && j === cj + 1);
      const dot = svgEl("circle", { cx: px(i), cy: py(j), r: counts ? 11 : here ? 8 : 5, fill: here ? colour(1) : "var(--surface)", stroke: next ? colour(2) : "var(--ink)", "stroke-width": next ? 3 : 1.5, "data-i": i, "data-j": j, style: next ? "cursor:pointer" : "" }, svg);
      void dot;
      if (counts) { const tx = svgEl("text", { x: px(i), y: py(j) + 4, "text-anchor": "middle", style: `font:700 ${g[j][i] > 999 ? 8 : g[j][i] > 99 ? 9 : 11}px var(--body);fill:${here ? "#fff" : "var(--ink)"};pointer-events:none` }, svg); tx.textContent = g[j][i]; }
    }
    for (const [lab, i, j] of [["A", 0, 0], ["B", m, n]]) { const tx = svgEl("text", { x: px(i) + (i ? 16 : -16), y: py(j) + (j ? -10 : 22), "text-anchor": "middle", style: "font:700 16px var(--body);fill:var(--ink)" }, svg); tx.textContent = lab; }
    const total = gridPaths(m, n), done = walk.length === m + n;
    read.innerHTML = `${t("Chemin en cours", "Current path")} : <strong>${word(walk) || "—"}</strong>. ${t("Chemins différents trouvés", "Different paths found")} : <strong>${found.size}</strong>${counts ? ` ${t("sur", "out of")} <strong>${total}</strong>` : ""}.${done ? ` ${t("Chemin complet !", "Complete path!")}` : ""}`;
    root.querySelector("#gp-r").disabled = pos()[0] >= m; root.querySelector("#gp-u").disabled = pos()[1] >= n;
  }
  function step(s) { const [i, j] = pos(); if ((s === "R" && i >= m) || (s === "U" && j >= n)) return; walk.push(s); if (walk.length === m + n) found.add(word(walk)); draw(); }
  root.querySelector("#gp-r").addEventListener("click", () => step("R")); root.querySelector("#gp-u").addEventListener("click", () => step("U"));
  root.querySelector("#gp-undo").addEventListener("click", () => { walk.pop(); draw(); });
  root.querySelector("#gp-clear").addEventListener("click", () => { walk = []; draw(); });
  root.querySelector("#gp-rand").addEventListener("click", () => { const w = [...Array(m).fill("R"), ...Array(n).fill("U")]; for (let i = w.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [w[i], w[j]] = [w[j], w[i]]; } walk = w; found.add(word(w)); draw(); });
  svg.addEventListener("click", (e) => { const c = e.target.closest("circle"); if (!c) return; const [i, j] = pos(), ti = Number(c.dataset.i), tj = Number(c.dataset.j); if (ti === i + 1 && tj === j) step("R"); else if (ti === i && tj === j + 1) step("U"); });
  draw();
  return onHintAction("gridpaths", { counts: () => { counts = true; draw(); } });
}

/* ---------------------------------------------------------------- horses */
export function horses(root, { t, q }) {
  const TOP = Number(q.top), NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");
  let speed, sel, log, podium, mode;
  const fresh = () => { const p = shuffled(25); speed = (h) => p[h]; sel = new Set(); log = []; podium = []; mode = "race"; };
  root.innerHTML = `
    <p class="act-help">${t(`Choisis de 2 à 5 chevaux et fais-les courir : tu vois seulement l’ordre d’arrivée, jamais les temps. Quand tu sais, propose ${TOP === 3 ? "le podium" : "le plus rapide"}. Glisse les chevaux pour les ranger comme tu veux sur le terrain (flèches du clavier aussi).`, `Pick 2 to 5 horses and race them: you only see the finishing order, never times. When you know, propose ${TOP === 3 ? "the podium" : "the fastest"}. Drag the horses to arrange them however you like on the field (arrow keys work too).`)}</p>
    <div class="cl-arena" id="hs-grid" role="group" aria-label="${t("Les 25 chevaux", "The 25 horses")}"></div>
    <div class="act-buttons" style="margin-top:10px">
      <button class="btn btn-primary" id="hs-race" type="button">${t("Faire courir", "Race them")}</button>
      <button class="btn btn-secondary" id="hs-podium" type="button" aria-pressed="false">${TOP === 3 ? t("Proposer le podium", "Propose the podium") : t("Proposer le plus rapide", "Propose the fastest")}</button>
      <button class="btn-quiet" id="hs-clear" type="button">${t("Désélectionner", "Deselect")}</button>
      <button class="btn-quiet" id="hs-home" type="button">${t("Replacer en grille", "Back to a grid")}</button>
      <button class="btn-quiet" id="hs-new" type="button">${t("Nouveaux chevaux", "New horses")}</button>
    </div>
    <p class="act-readout" id="hs-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="hs-log" aria-label="${t("Historique des courses", "Race history")}"></ol>`;
  const grid = root.querySelector("#hs-grid"), read = root.querySelector("#hs-read"), logEl = root.querySelector("#hs-log");
  grid.innerHTML = NAMES.map((nm, i) => `<button type="button" class="cl-tok" data-h="${i}" aria-pressed="false">${nm}</button>`).join("");
  // The field is a free board of COLS x ROWS cells: horses can be dragged (or moved with the arrow keys) to any free
  // cell, so the learner can group them the way the plan of the races needs. Positions never affect the speeds.
  const COLS = 8, ROWS = 7;
  let pos = [], drag = null, suppressClick = false;
  const home = () => { pos = NAMES.map((_, i) => [i % 5, Math.floor(i / 5)]); };
  const place = (b) => { const [c, r] = pos[Number(b.dataset.h)]; b.style.setProperty("--c", c); b.style.setProperty("--r", r); b.style.left = b.style.top = ""; };
  const placeAll = () => grid.querySelectorAll(".cl-tok").forEach(place);
  const freeNear = (c, r, h) => {
    const taken = new Set(pos.filter((_, i) => i !== h).map((p) => `${p[0]},${p[1]}`));
    let best = [c, r], bd = Infinity;
    for (let cc = 0; cc < COLS; cc++) for (let rr = 0; rr < ROWS; rr++) if (!taken.has(`${cc},${rr}`)) { const d = (cc - c) ** 2 + (rr - r) ** 2; if (d < bd) { bd = d; best = [cc, rr]; } }
    return best;
  };
  home(); placeAll();
  grid.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".cl-tok");
    if (!b || e.button > 0) return;
    drag = { b, h: Number(b.dataset.h), x: e.clientX, y: e.clientY, moved: false, rect: grid.getBoundingClientRect() };
    b.setPointerCapture(e.pointerId);
  });
  grid.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.moved = true; drag.b.classList.add("dragging"); }
    if (!drag.moved) return;
    const { rect } = drag, cw = rect.width / COLS, ch = rect.height / ROWS;
    drag.b.style.left = `${clamp(e.clientX - rect.left - cw / 2, 0, rect.width - cw)}px`;
    drag.b.style.top = `${clamp(e.clientY - rect.top - ch / 2, 0, rect.height - ch)}px`;
  });
  const drop = (e) => {
    if (!drag) return;
    const { b, h, rect, moved } = drag; drag = null;
    if (!moved) return;
    const c = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * COLS), 0, COLS - 1), r = clamp(Math.floor(((e.clientY - rect.top) / rect.height) * ROWS), 0, ROWS - 1);
    pos[h] = freeNear(c, r, h); b.classList.remove("dragging"); place(b);
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);   // the click that follows a drag must not select the horse
  };
  grid.addEventListener("pointerup", drop);
  grid.addEventListener("pointercancel", drop);
  grid.addEventListener("keydown", (e) => {
    const b = e.target.closest(".cl-tok"), d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!b || !d) return;
    e.preventDefault();
    const h = Number(b.dataset.h), c = clamp(pos[h][0] + d[0], 0, COLS - 1), r = clamp(pos[h][1] + d[1], 0, ROWS - 1);
    if (!pos.some((p, i) => i !== h && p[0] === c && p[1] === r)) { pos[h] = [c, r]; place(b); }
  });
  root.querySelector("#hs-home").addEventListener("click", () => { home(); placeAll(); });
  function render(msg = "") {
    grid.querySelectorAll(".cl-tok").forEach((b) => { const h = Number(b.dataset.h), k = podium.indexOf(h); b.setAttribute("aria-pressed", String(mode === "race" ? sel.has(h) : k >= 0)); b.dataset.rank = mode === "podium" && k >= 0 ? k + 1 : ""; });
    root.querySelector("#hs-race").disabled = mode !== "race" || sel.size < 2 || sel.size > 5;
    root.querySelector("#hs-podium").setAttribute("aria-pressed", String(mode === "podium"));
    logEl.innerHTML = log.map((l) => `<li>${t("Course", "Race")} ${l.n} : ${l.order.map((h) => NAMES[h]).join(" › ")}</li>`).join("");
    read.innerHTML = msg || (mode === "podium" ? t(`Touche ${TOP === 3 ? "dans l’ordre le 1er, le 2e puis le 3e" : "le cheval le plus rapide"}.`, `Tap ${TOP === 3 ? "the 1st, then the 2nd, then the 3rd in order" : "the fastest horse"}.`) : `${t("Chevaux choisis", "Horses picked")} : <strong>${sel.size}</strong> ${t("sur 5 au plus", "of 5 at most")} · ${t("Courses courues", "Races run")} : <strong>${log.length}</strong>`);
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".cl-tok"); if (!b) return;
    if (suppressClick) { suppressClick = false; return; }
    const h = Number(b.dataset.h);
    if (mode === "race") { if (sel.has(h)) sel.delete(h); else if (sel.size < 5) sel.add(h); render(); return; }
    if (podium.includes(h) || podium.length >= TOP) return;
    podium.push(h);
    if (podium.length === TOP) {
      const truth = [...Array(25).keys()].sort((a, b2) => speed(b2) - speed(a)).slice(0, TOP), ok = podium.every((x, i) => x === truth[i]), best = horseRaces(TOP);
      render(ok ? `${t("Exact !", "Correct!")} ${t(`Tu l’as trouvé en ${log.length} course${log.length > 1 ? "s" : ""}.`, `You found it in ${log.length} race${log.length > 1 ? "s" : ""}.`)} ${log.length <= best ? t(`C’est le minimum (${best}) : bravo.`, `That is the minimum (${best}): well done.`) : t(`Il est possible de le faire en ${best}.`, `It can be done in ${best}.`)}` : `${t("Pas tout à fait. Le bon classement était", "Not quite. The right order was")} <strong>${truth.map((x) => NAMES[x]).join(" › ")}</strong>. ${t("Appuie sur « Nouveaux chevaux » pour réessayer.", "Press “New horses” to try again.")}`);
      return;
    }
    render();
  });
  root.querySelector("#hs-race").addEventListener("click", () => { const hs = [...sel], order = hs.sort((a, b) => speed(b) - speed(a)); log.push({ n: log.length + 1, order }); sel = new Set(); render(); });
  root.querySelector("#hs-podium").addEventListener("click", () => { mode = mode === "race" ? "podium" : "race"; podium = []; render(); });
  root.querySelector("#hs-clear").addEventListener("click", () => { sel = new Set(); podium = []; render(); });
  root.querySelector("#hs-new").addEventListener("click", () => { fresh(); render(); });
  fresh(); render();
  return () => {};
}

/* ---------------------------------------------------------------- queens */
export function queens(root, { t, q }) {
  const n = q.n, k = queensK(n, q.k), [best, example] = QUEENS[`${n},${k}`], queensSet = new Set();
  let peeked = false, record = 0;
  root.innerHTML = `
    <p class="act-help">${t(`Touche une case pour poser ou retirer une dame (${k} au plus). Les cases vertes sont libres : ni occupées ni attaquées. Une dame est arrêtée par la première pièce rencontrée.`, `Tap a square to place or remove a queen (${k} at most). Green squares are free: neither occupied nor attacked. A queen's line of sight stops at the first piece.`)}</p>
    <div class="qn-board" id="qn-board" style="--n:${n}" role="grid" aria-label="${t("Échiquier", "Chessboard")}"></div>
    <div class="act-controls"><button class="btn-quiet" id="qn-clear" type="button">${t("Tout retirer", "Remove all")}</button></div>
    <p class="act-readout" id="qn-read" role="status" aria-live="polite"></p>`;
  const board = root.querySelector("#qn-board"), read = root.querySelector("#qn-read");
  function draw() {
    const free = new Set(unattacked(n, [...queensSet]));
    board.innerHTML = Array.from({ length: n * n }, (_, s) => `<button type="button" role="gridcell" class="qn-cell ${(Math.floor(s / n) + (s % n)) % 2 ? "dark" : ""}${queensSet.has(s) ? " queen" : free.has(s) ? " free" : ""}" data-s="${s}" aria-label="${t("ligne", "row")} ${Math.floor(s / n) + 1}, ${t("colonne", "column")} ${(s % n) + 1}${queensSet.has(s) ? `, ${t("dame", "queen")}` : free.has(s) ? `, ${t("libre", "free")}` : ""}">${queensSet.has(s) ? "♛" : ""}</button>`).join("");
    if (queensSet.size === k) record = Math.max(record, free.size);
    read.innerHTML = `${t("Dames posées", "Queens placed")} : <strong>${queensSet.size}</strong> / ${k} · ${t("Cases libres", "Free squares")} : <strong>${free.size}</strong>${record ? ` · ${t("Ton meilleur", "Your best")} : <strong>${record}</strong>` : ""}${peeked ? ` · ${t("Maximum possible", "Largest possible")} : <strong>${best}</strong>` : ""}${queensSet.size === k && free.size === best ? ` — ${t("c’est le maximum !", "that is the maximum!")}` : ""}`;
  }
  board.addEventListener("click", (e) => { const b = e.target.closest(".qn-cell"); if (!b) return; const s = Number(b.dataset.s); if (queensSet.has(s)) queensSet.delete(s); else if (queensSet.size < k) queensSet.add(s); draw(); board.querySelector(`[data-s="${s}"]`)?.focus(); });
  root.querySelector("#qn-clear").addEventListener("click", () => { queensSet.clear(); draw(); });
  draw();
  return onHintAction("queens", { peek: () => { const s = example.find((x) => !queensSet.has(x)); if (s !== undefined && queensSet.size < k) { queensSet.add(s); draw(); } } });
}

/* ----------------------------------------------------------------- snail */
export function snail(root, { t, reduced, q }) {
  const H = q.h, up = q.up, down = snailDown(q.up, q.down), trace = snailTrace(H, up, down), W = 520, HT = 300, PX = 92, PY0 = 20, PY1 = 280;
  const days = snailDays(H, up, down);
  let half = 0, timer = 0;   // number of half-days elapsed: even = morning, odd = evening
  const steps = [];   // heights after each half-day
  trace.forEach((d) => { steps.push(d.peak); if (!d.done) steps.push(d.end); });
  root.innerHTML = `
    <p class="act-help">${t("Fais avancer l’escargot demi-journée par demi-journée.", "Move the snail forward half a day at a time.")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${HT}" role="img" aria-label="${t("Poteau et courbe de la hauteur de l’escargot", "Post and graph of the snail’s height")}"></svg>
    <div class="act-buttons">
      <button class="btn btn-primary" id="sn-next" type="button">${t("Demi-journée suivante", "Next half-day")}</button>
      <button class="btn btn-secondary" id="sn-auto" type="button" aria-pressed="false">${t("Lecture", "Play")}</button>
      <button class="btn-quiet" id="sn-reset" type="button">${t("Recommencer", "Restart")}</button>
    </div>
    <p class="act-readout" id="sn-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#sn-read"), nextBtn = root.querySelector("#sn-next"), autoBtn = root.querySelector("#sn-auto");
  const py = (h) => PY1 - (h / H) * (PY1 - PY0), cx = 290, total = steps.length, px = (i) => 175 + (i / Math.max(total, 1)) * 330;
  function draw() {
    svg.replaceChildren();
    svgEl("rect", { x: PX - 8, y: PY0, width: 16, height: PY1 - PY0, rx: 4, fill: "color-mix(in srgb, var(--c7) 45%, var(--surface))", stroke: "var(--ink)", "stroke-width": 1.5 }, svg);
    const step = Math.max(1, Math.ceil(H / 10));
    for (let m = 0; m <= H; m += step) { svgEl("line", { x1: PX - 16, y1: py(m), x2: PX - 8, y2: py(m), stroke: "var(--ink)" }, svg); const tx = svgEl("text", { x: PX - 20, y: py(m) + 4, "text-anchor": "end", style: "font:12px var(--body);fill:var(--ink-2)" }, svg); tx.textContent = `${m} m`; }
    svgEl("line", { x1: 165, y1: py(H), x2: 505, y2: py(H), stroke: colour(2), "stroke-width": 2, "stroke-dasharray": "6 5" }, svg);
    svgEl("line", { x1: 165, y1: PY1, x2: 505, y2: PY1, stroke: "var(--line-strong)" }, svg);
    const pts = [[0, 0], ...steps.slice(0, half).map((h, i) => [i + 1, h])];
    svgEl("polyline", { points: pts.map(([i, h]) => `${px(i)},${py(h)}`).join(" "), fill: "none", stroke: colour(0), "stroke-width": 4, "stroke-linejoin": "round" }, svg);
    const h = half === 0 ? 0 : steps[half - 1], sy = py(h);
    svgEl("circle", { cx: px(Math.min(half, total)), cy: py(h), r: 6, fill: colour(0) }, svg);
    // the cartoon snail of the worked solution, climbing the post (scared while it slides back at night)
    const critter = makeSnail(svg); critter.set({ x: PX + 8, y: Math.max(sy, 50), rot: 90, dir: -1, mood: half > 0 && half % 2 === 0 && half < total ? "scared" : "ok", size: 0.95 });
    const tx = svgEl("text", { x: 505, y: py(H) - 6, "text-anchor": "end", style: "font:700 13px var(--body);fill:var(--ink)" }, svg); tx.textContent = `${t("Sommet", "Top")} : ${H} m`;
    const day = Math.min(days, Math.floor(half / 2) + 1), done = half >= total;
    read.innerHTML = half === 0 ? t("Début du jour 1, à 0 m.", "Start of day 1, at 0 m.") : `${t("Jour", "Day")} ${Math.floor((half - 1) / 2) + 1}, ${(half - 1) % 2 === 0 ? t("fin de la journée", "end of the day") : t("après la nuit", "after the night")} : <strong>${h} m</strong>${done ? ` — ${t("sommet atteint le jour", "top reached on day")} <strong>${days}</strong>` : ""}`;
    void day;
    nextBtn.disabled = done;
  }
  const halt = () => { clearInterval(timer); timer = 0; autoBtn.setAttribute("aria-pressed", "false"); autoBtn.textContent = t("Lecture", "Play"); };
  nextBtn.addEventListener("click", () => { halt(); if (half < total) half++; draw(); });
  autoBtn.addEventListener("click", () => { if (timer) { halt(); return; } if (reduced()) { half = total; draw(); return; } if (half >= total) half = 0; autoBtn.setAttribute("aria-pressed", "true"); autoBtn.textContent = t("Pause", "Pause"); timer = setInterval(() => { if (half < total) half++; draw(); if (half >= total) halt(); }, 550); });
  root.querySelector("#sn-reset").addEventListener("click", () => { halt(); half = 0; draw(); });
  draw();
  void MINUS;
  return halt;
}

/* ---------------------------------------------------------------- bridge */
// Looks of the four soldiers (the same as in the animated solution), fastest first.
const SOLDIERS = [{ uniform: "#3b82f6", size: 0.86 * 1.1, skin: "#f1c27d" }, { uniform: "#e8710a", size: 0.94 * 1.1, skin: "#e0ac69" }, { uniform: "#2fa866", size: 1.1, skin: "#f5d0a9" }, { uniform: "#c2185b", size: 1.1 * 1.1, skin: "#d8a47f", moustache: true, top: 80 }];
export function bridge(root, { t, q }) {
  const times = bridgeTimes(q.set).sort((a, b) => a - b), best = bridgeBest(times), NAMES = ["A", "B", "C", "D"];
  let side, torch, elapsed, hist, sel;
  const reset = () => { side = [0, 0, 0, 0]; torch = 0; elapsed = 0; hist = []; sel = new Set(); };
  root.innerHTML = `
    <p class="act-help">${t("Choisis une ou deux personnes du côté de la lampe, puis fais-les traverser : le temps compté est celui du plus lent.", "Pick one or two people on the lamp's side, then send them across: the time counted is the slower one's.")}</p>
    <div class="br-scene"><div class="br-bank" id="br-left"></div><div class="br-river" aria-hidden="true">≈ ≈ ≈</div><div class="br-bank" id="br-right"></div></div>
    <div class="act-buttons"><button class="btn btn-primary" id="br-go" type="button">${t("Faire traverser", "Send across")}</button><button class="btn-quiet" id="br-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="br-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="br-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="br-log" aria-label="${t("Traversées", "Crossings")}"></ol>`;
  const read = root.querySelector("#br-read"), logEl = root.querySelector("#br-log");
  function draw(msg = "") {
    for (const [id, s] of [["#br-left", 0], ["#br-right", 1]]) root.querySelector(id).innerHTML = `<span class="br-lamp ${torch === s ? "on" : ""}" aria-label="${torch === s ? t("lampe ici", "lamp here") : ""}">${torch === s ? "🔦" : ""}</span>${times.map((tm, i) => side[i] === s ? `<button type="button" class="cl-tok br-man" data-i="${i}" aria-pressed="${sel.has(i)}" ${torch === s ? "" : "disabled"}><svg class="br-sd" viewBox="-22 -84 44 90" width="38" height="78" aria-hidden="true"></svg>${NAMES[i]}<small>${tm} min</small></button>` : "").join("")}`;
    // each person is the soldier of the worked solution: same look, slower people are bigger and wear different colours
    root.querySelectorAll(".br-man").forEach((b) => { const k = Number(b.dataset.i), look = SOLDIERS[k % 4]; makeSoldier(b.querySelector(".br-sd"), { ...look, label: "" }).set({ x: 0, y: 4, dir: 1, amp: 0 }); });
    root.querySelector("#br-go").disabled = sel.size < 1 || sel.size > 2;
    root.querySelector("#br-undo").disabled = !hist.length;
    logEl.innerHTML = hist.map((h) => `<li>${h.who.map((i) => NAMES[i]).join(" + ")} ${h.dir === "over" ? "→" : "←"} (${h.cost} min)</li>`).join("");
    const done = side.every((s) => s === 1);
    read.innerHTML = msg || `${t("Temps écoulé", "Time elapsed")} : <strong>${elapsed} min</strong>${done ? ` — ${elapsed === best ? t(`tout le monde a traversé en ${best} min, le minimum possible !`, `everyone is across in ${best} min, the least possible!`) : t(`tout le monde a traversé, mais on peut faire mieux : le minimum est ${best} min.`, `everyone is across, but it can be done faster: the least is ${best} min.`)}` : ""}`;
  }
  root.addEventListener("click", (e) => {
    const m = e.target.closest(".br-man"); if (m) { const i = Number(m.dataset.i); if (sel.has(i)) sel.delete(i); else if (sel.size < 2) sel.add(i); draw(); return; }
  });
  root.querySelector("#br-go").addEventListener("click", () => { const who = [...sel], cost = Math.max(...who.map((i) => times[i])), dir = torch === 0 ? "over" : "back"; who.forEach((i) => { side[i] = 1 - side[i]; }); torch = 1 - torch; elapsed += cost; hist.push({ who, dir, cost }); sel = new Set(); draw(); });
  root.querySelector("#br-undo").addEventListener("click", () => { const h = hist.pop(); if (!h) return; h.who.forEach((i) => { side[i] = 1 - side[i]; }); torch = 1 - torch; elapsed -= h.cost; sel = new Set(); draw(); });
  root.querySelector("#br-reset").addEventListener("click", () => { reset(); draw(); });
  void bridgePlans;
  reset(); draw();
  return () => {};
}

/* ------------------------------------------------------------ light egg */
export function lighteggs(root, { t, q }) {
  const N = q.n, K = eggWeighings(N);
  let light, state, used, mode, over;   // state: 0 aside, 1 left pan, 2 right pan, 3 set aside (cleared)
  const fresh = () => { light = Math.floor(Math.random() * N); state = Array(N).fill(0); used = 0; mode = "weigh"; over = false; };
  root.innerHTML = `
    <p class="act-help">${t("Touche un œuf pour le changer de place : à côté, plateau de gauche, plateau de droite, ou écarté (hors de cause). Pèse, puis désigne l’œuf abîmé, plus léger que les autres.", "Tap an egg to move it: aside, left pan, right pan, or cleared (ruled out). Weigh, then name the spoiled egg, which is lighter than the others.")}</p>
    <svg class="act-svg" id="eg-scale" style="max-width:360px" viewBox="0 0 360 120" role="img" aria-label="${t("Balance", "Balance")}"></svg>
    <div class="cl-grid cl-eggs" id="eg-grid" role="group" aria-label="${t("Les œufs", "The eggs")}"></div>
    <div class="act-buttons" style="margin-top:10px"><button class="btn btn-primary" id="eg-weigh" type="button">${t("Peser", "Weigh")}</button><button class="btn btn-secondary" id="eg-name" type="button" aria-pressed="false">${t("Désigner l’œuf abîmé", "Name the spoiled egg")}</button><button class="btn-quiet" id="eg-new" type="button">${t("Nouvelle partie", "New game")}</button></div>
    <p class="act-readout" id="eg-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#eg-grid"), scale = root.querySelector("#eg-scale"), read = root.querySelector("#eg-read");
  grid.innerHTML = Array.from({ length: N }, (_, i) => `<button type="button" class="cl-tok cl-egg" data-i="${i}"><svg class="eg-ic" viewBox="-17 -44 34 48" width="30" height="42" aria-hidden="true"></svg><span>${i + 1}</span></button>`).join("");
  // the eggs of the worked solution: a ruled-out egg smiles
  const eggIcons = [...grid.querySelectorAll(".eg-ic")].map((svg) => makeEgg(svg));
  let tilt = 0;
  function drawScale() {
    scale.replaceChildren();
    const a = tilt * 12, lx = 90, rx = 270, ly = 70 - a, ry = 70 + a;   // tilt > 0 : right pan lower (right heavier)
    svgEl("line", { x1: 180, y1: 105, x2: 180, y2: 40, stroke: "var(--ink)", "stroke-width": 5 }, scale);
    svgEl("line", { x1: lx, y1: ly - 20, x2: rx, y2: ry - 20, stroke: "var(--ink)", "stroke-width": 5, "stroke-linecap": "round" }, scale);
    for (const [x, y, n] of [[lx, ly, state.filter((s) => s === 1).length], [rx, ry, state.filter((s) => s === 2).length]]) { svgEl("path", { d: `M${x - 40} ${y - 20} Q${x} ${y + 20} ${x + 40} ${y - 20}Z`, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }, scale); const tx = svgEl("text", { x, y: y - 2, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--ink)" }, scale); tx.textContent = n; }
  }
  function draw(msg = "") {
    grid.querySelectorAll(".cl-egg").forEach((b) => { const s = state[Number(b.dataset.i)]; b.dataset.s = s; eggIcons[Number(b.dataset.i)].set({ x: 0, y: 0, face: s === 3 ? "happy" : "ok" }); b.setAttribute("aria-label", `${t("Œuf", "Egg")} ${Number(b.dataset.i) + 1}: ${[t("à côté", "aside"), t("plateau gauche", "left pan"), t("plateau droit", "right pan"), t("écarté", "cleared")][s]}`); });
    drawScale();
    root.querySelector("#eg-name").setAttribute("aria-pressed", String(mode === "name"));
    root.querySelector("#eg-weigh").disabled = over || mode === "name" || state.filter((s) => s === 1).length === 0 || state.filter((s) => s === 1).length !== state.filter((s) => s === 2).length;
    read.innerHTML = msg || (mode === "name" ? t("Touche l’œuf que tu désignes.", "Tap the egg you name.") : `${t("Pesées", "Weighings")} : <strong>${used}</strong> ${t("(il faut deux plateaux avec autant d’œufs)", "(both pans need the same number of eggs)")}`);
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".cl-egg"); if (!b || over) return; const i = Number(b.dataset.i);
    if (mode === "name") { over = true; mode = "weigh"; const ok = i === light; draw(ok ? `<strong>${t("Exact !", "Correct!")}</strong> ${t(`Tu l’as trouvé en ${used} pesée${used > 1 ? "s" : ""}.`, `You found it in ${used} weighing${used > 1 ? "s" : ""}.`)} ${used <= K ? t(`C’est le minimum (${K}) : bravo.`, `That is the minimum (${K}): well done.`) : t(`Il est possible de le faire en ${K}.`, `It can be done in ${K}.`)}` : `${t("Non : l’œuf abîmé était le numéro", "No: the spoiled egg was number")} <strong>${light + 1}</strong>.`); return; }
    state[i] = (state[i] + 1) % 4; tilt = 0; draw();
  });
  root.querySelector("#eg-weigh").addEventListener("click", () => {
    used++; const L = state.map((s, i) => (s === 1 ? i : -1)).filter((i) => i >= 0), R = state.map((s, i) => (s === 2 ? i : -1)).filter((i) => i >= 0);
    tilt = L.includes(light) ? -1 : R.includes(light) ? 1 : 0;   // the lighter side rises
    draw(tilt === 0 ? t("Les plateaux sont en équilibre.", "The pans balance.") : tilt < 0 ? t("Le plateau de gauche est plus léger.", "The left pan is lighter.") : t("Le plateau de droite est plus léger.", "The right pan is lighter."));
  });
  root.querySelector("#eg-name").addEventListener("click", () => { if (!over) { mode = mode === "name" ? "weigh" : "name"; draw(); } });
  root.querySelector("#eg-new").addEventListener("click", () => { fresh(); tilt = 0; draw(); });
  fresh(); draw();
  return () => {};
}

/* ------------------------------------------------------------ fake coins */
export function fakecoins(root, { t, q }) {
  const N = q.n;
  let counts, fake, weighed, reading, solved;
  const fresh = () => { counts = Array(N).fill(0); fake = Math.floor(Math.random() * N); weighed = 0; reading = null; solved = false; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis combien de pièces prendre dans chaque pile, puis pèse (les vraies pèsent 10 g, les fausses 9 g). Un seul pesage est autorisé dans l’énoncé : ici on les compte. Ensuite, désigne la pile fausse.", "Choose how many coins to take from each pile, then weigh (genuine coins weigh 10 g, fake ones 9 g). The problem allows one weighing: here they are counted. Then name the fake pile.")}</p>
    <div class="fc-piles" id="fc-piles"></div>
    <div class="act-buttons" style="margin-top:10px"><button class="btn btn-primary" id="fc-weigh" type="button">${t("Peser", "Weigh")}</button><button class="btn-quiet" id="fc-zero" type="button">${t("Tout à zéro", "All to zero")}</button><button class="btn-quiet" id="fc-new" type="button">${t("Nouvelle pile fausse", "New fake pile")}</button></div>
    <p class="act-readout" id="fc-read" role="status" aria-live="polite"></p>
    <div class="act-buttons" id="fc-guess" role="group" aria-label="${t("Quelle pile est fausse ?", "Which pile is fake?")}"></div>`;
  const piles = root.querySelector("#fc-piles"), read = root.querySelector("#fc-read"), guess = root.querySelector("#fc-guess");
  piles.innerHTML = Array.from({ length: N }, (_, i) => `<div class="fc-row"><span class="fc-name">${t("Pile", "Pile")} ${i + 1}</span><button type="button" class="btn-quiet fc-step" data-i="${i}" data-d="-1" aria-label="${t("Une pièce de moins, pile", "One coin fewer, pile")} ${i + 1}">${MINUS}</button><output class="fc-count" id="fc-c${i}">0</output><button type="button" class="btn-quiet fc-step" data-i="${i}" data-d="1" aria-label="${t("Une pièce de plus, pile", "One coin more, pile")} ${i + 1}">+</button></div>`).join("");
  function draw(msg = "") {
    counts.forEach((c, i) => { root.querySelector(`#fc-c${i}`).textContent = c; });
    const total = counts.reduce((a, b) => a + b, 0);
    guess.innerHTML = reading === null || solved ? "" : Array.from({ length: N }, (_, i) => `<button type="button" class="btn btn-secondary fc-g" data-i="${i}">${i + 1}</button>`).join("");
    read.innerHTML = msg || `${t("Pièces sur la balance", "Coins on the scale")} : <strong>${total}</strong>${reading !== null ? ` · ${t("balance", "scale")} : <strong>${reading} g</strong> (${t("attendu si tout est vrai", "expected if all genuine")} : ${total * 10} g)` : ""}${weighed ? ` · ${t("Pesées", "Weighings")} : ${weighed}` : ""}`;
  }
  root.addEventListener("click", (e) => {
    const s = e.target.closest(".fc-step"); if (s) { const i = Number(s.dataset.i); counts[i] = clamp(counts[i] + Number(s.dataset.d), 0, N); reading = null; draw(); root.querySelector(`.fc-step[data-i="${i}"][data-d="${s.dataset.d}"]`)?.focus(); return; }
    const g = e.target.closest(".fc-g"); if (g) {
      const i = Number(g.dataset.i); solved = i === fake;
      const total = counts.reduce((a, b) => a + b, 0);
      draw(solved ? `<strong>${t("Exact !", "Correct!")}</strong> ${t(`C’était la pile ${fake + 1} : le manque était de ${counts[fake]} g.`, `It was pile ${fake + 1}: the shortfall was ${counts[fake]} g.`)} ${total === minSample(N) ? t(`Avec ${total} pièces, c’est le minimum.`, `With ${total} coins, that is the minimum.`) : total > minSample(N) ? t(`Tu as utilisé ${total} pièces ; on peut en utiliser seulement ${minSample(N)}.`, `You used ${total} coins; ${minSample(N)} are enough.`) : ""}` : `${t("Non.", "No.")} ${identifies(counts) ? "" : t("Ta répartition donne le même manque pour deux piles : essaie des nombres tous différents.", "Your design gives the same shortfall for two piles: try numbers that are all different.")}`);
    }
  });
  root.querySelector("#fc-weigh").addEventListener("click", () => { weighed++; reading = 10 * counts.reduce((a, b) => a + b, 0) - counts[fake]; solved = false; draw(); });
  root.querySelector("#fc-zero").addEventListener("click", () => { counts = Array(N).fill(0); reading = null; draw(); });
  root.querySelector("#fc-new").addEventListener("click", () => { fresh(); draw(); });
  fresh(); draw();
  return onHintAction("fakecoins", { fill: () => { counts = Array.from({ length: N }, (_, i) => i + 1); reading = null; draw(); } });
}

void esc;
