// Hands-on activity of the chess challenge: the learner tries, fails and notices; it never states the answer or the method.
import { lockTouch, svgEl, toLocal, clamp } from "../common/kit.js";

/* --------------------------------------------------------------- dominoes */
export function activity(root, { t, reduced, q }) {
  const N = q.n, C = Math.floor(352 / q.n), BX = 12, BY = 12, BW = N * C;
  // Wide screens: supply beside the board. Narrow screens: supply under it, so cells stay large.
  const compact = root.clientWidth > 0 && root.clientWidth < 560;
  const TR = compact ? { x: BX, y: BY + BW + 14, w: BW, h: 112 } : { x: BX + BW + 28, y: BY, w: 104, h: BW };
  const W = compact ? BX * 2 + BW : TR.x + TR.w + 16, H = compact ? TR.y + TR.h + BY : BY * 2 + BW;
  const removed = new Set(q.kind === "opp" ? ["0,0", `${N - 1},${N - 1}`] : ["0,0", `${N - 1},0`]);
  let dominos = [];
  let nextId = 1;
  let drag = null;
  let colour = false;
  let tapRemoves = false;   // what a tap on a placed domino does: turn it (default) or remove it
  let kbo = "h";
  let cursor = { c: Math.floor(N / 2) - 1, r: Math.floor(N / 2) - 1 };
  let focused = false;

  root.innerHTML = `
    <p class="act-help">${t("Fais glisser un domino depuis la réserve jusqu’au plateau. Touche un domino posé pour le tourner, ou fais-le glisser hors du plateau pour l’enlever. Sur téléphone, le bouton « Toucher un domino » permet aussi de les enlever d’un simple toucher. Au clavier : flèches, Entrée pour poser, Suppr pour enlever.", "Drag a domino from the supply onto the board. Tap a placed domino to turn it, or drag it off the board to remove it. On a phone, the “Tapping a domino” button also lets you remove one with a simple tap. With a keyboard: arrows, Enter to place, Delete to remove.")}</p>
    <svg class="act-svg dom-svg" viewBox="0 0 ${W} ${H}" tabindex="0" role="application" aria-label="${t("Plateau de dominos", "Domino board")}"></svg>
    <div class="act-controls">
      <button class="btn btn-secondary" id="dm-tap" type="button" aria-pressed="false">${t("Toucher un domino : le tourner", "Tapping a domino: turn it")}</button>
      <button class="btn btn-secondary" id="dm-orient" type="button">${t("Domino au clavier : horizontal", "Keyboard domino: horizontal")}</button>
      <button class="btn btn-secondary" id="dm-auto" type="button">${t("Essai au hasard", "Random attempt")}</button>
      <button class="btn-quiet" id="dm-clear" type="button">${t("Tout enlever", "Remove all")}</button>
    </div>
    <p class="act-readout" id="dm-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  lockTouch(svg, "[data-src], [data-d]");   // touch-action does not apply to SVG children: stop the page scrolling under a dragged domino
  const board = svgEl("g", {}, svg);
  const placed = svgEl("g", {}, svg);
  const tray = svgEl("g", { class: "dom-tray" }, svg);
  const ghostG = svgEl("g", { "pointer-events": "none" }, svg);
  const cursorG = svgEl("g", { "pointer-events": "none" }, svg);

  const cellsOf = (d) => (d.o === "h" ? [[d.c, d.r], [d.c + 1, d.r]] : [[d.c, d.r], [d.c, d.r + 1]]);
  const occupied = (ignore) => {
    const m = new Map();
    for (const d of dominos) if (d !== ignore) for (const [c, r] of cellsOf(d)) m.set(`${c},${r}`, d);
    return m;
  };
  const valid = (d, ignore) => {
    const occ = occupied(ignore);
    return cellsOf(d).every(([c, r]) => c >= 0 && c < N && r >= 0 && r < N && !removed.has(`${c},${r}`) && !occ.has(`${c},${r}`));
  };
  const rect = (d) => {
    const w = d.o === "h" ? 2 : 1, h = d.o === "h" ? 1 : 2;
    return { x: BX + d.c * C + 3, y: BY + d.r * C + 3, w: w * C - 6, h: h * C - 6 };
  };
  function dominoShape(parent, d, cls, extra = {}) {
    const q = rect(d);
    const g = svgEl("g", { class: `dom ${cls} ${d.o}`, ...extra }, parent);
    svgEl("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 7 }, g);
    if (d.o === "h") svgEl("line", { x1: q.x + q.w / 2, y1: q.y + 8, x2: q.x + q.w / 2, y2: q.y + q.h - 8 }, g);
    else svgEl("line", { x1: q.x + 8, y1: q.y + q.h / 2, x2: q.x + q.w - 8, y2: q.y + q.h / 2 }, g);
    return g;
  }
  const announce = (text) => (root.querySelector("#dm-read").textContent = text);
  function summary(extra = "") {
    const n = dominos.length;
    let split = "";
    if (colour) {
      const free = { a: 0, b: 0 }, occ = occupied(null);
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!removed.has(`${c},${r}`) && !occ.has(`${c},${r}`)) free[(c + r) % 2 ? "b" : "a"] += 1;
      split = ` ${t("Libres", "Free")} : ${free.a} ${t("claires", "light")}, ${free.b} ${t("sombres", "dark")}.`;
    }
    announce(`${n} ${t(n > 1 ? "dominos posés" : "domino posé", n > 1 ? "dominoes placed" : "domino placed")}, ${N * N - 2 - 2 * n} ${t("cases libres", "free squares")}.${split} ${extra}`.trim());
  }
  function drawBoard() {
    board.replaceChildren();
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const gone = removed.has(`${c},${r}`);
        svgEl("rect", { x: BX + c * C, y: BY + r * C, width: C, height: C, class: gone ? "cell gone" : `cell ${colour ? ((c + r) % 2 ? "b" : "a") : ""}` }, board);
      }
  }
  function drawPlaced() {
    placed.replaceChildren();
    for (const d of dominos) dominoShape(placed, d, d.o === "h" ? "ha" : "va", { "data-d": d.id });
  }
  function drawTray() {
    tray.replaceChildren();
    svgEl("rect", { x: TR.x, y: TR.y, width: TR.w, height: TR.h, rx: 12, class: "tray-bg" }, tray);
    const label = svgEl("text", { x: TR.x + TR.w / 2, y: compact ? TR.y + TR.h - 12 : TR.y + 30, "text-anchor": "middle", class: "tray-label" }, tray);
    label.textContent = compact ? `${t("Réserve", "Supply")} ${t("illimitée", "unlimited")}` : t("Réserve", "Supply");
    if (!compact) svgEl("text", { x: TR.x + TR.w / 2, y: TR.y + 50, "text-anchor": "middle", class: "tray-sub" }, tray).textContent = t("illimitée", "unlimited");
    const at = (x, y, o) => ({ c: (x - BX) / C, r: (y - BY) / C, o });
    const h = compact ? at(TR.x + 72, TR.y + 28, "h") : at(TR.x + 6, TR.y + 84, "h");
    const v = compact ? at(TR.x + 250, TR.y + 6, "v") : at(TR.x + 30, TR.y + 160, "v");
    dominoShape(tray, h, "ha src", { "data-src": "h", tabindex: "-1" });
    dominoShape(tray, v, "va src", { "data-src": "v", tabindex: "-1" });
  }
  function snap(p, o) {
    const w = o === "h" ? 2 : 1, h = o === "h" ? 1 : 2;
    const c = Math.round((p.x - BX) / C - w / 2), r = Math.round((p.y - BY) / C - h / 2);
    const inBoard = p.x >= BX - C / 2 && p.x <= BX + BW + C / 2 && p.y >= BY - C / 2 && p.y <= BY + BW + C / 2;
    return { c, r, o, inBoard };
  }
  function drawGhost() {
    ghostG.replaceChildren();
    if (!drag) return;
    const s = snap(drag.p, drag.o);
    if (s.inBoard) {
      const ok = valid(s, null);
      dominoShape(ghostG, s, `ghost ${ok ? "ok" : "bad"}`);
    } else {
      const w = drag.o === "h" ? 2 * C - 6 : C - 6, h = drag.o === "h" ? C - 6 : 2 * C - 6;
      const q = { x: drag.p.x - w / 2, y: drag.p.y - h / 2, w, h };
      const g = svgEl("g", { class: `dom ghost out ${drag.o}` }, ghostG);
      svgEl("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 7 }, g);
    }
  }
  function drawCursor() {
    cursorG.replaceChildren();
    if (!focused) return;
    svgEl("rect", { x: BX + cursor.c * C + 2, y: BY + cursor.r * C + 2, width: C - 4, height: C - 4, class: "dom-cursor" }, cursorG);
  }
  const redraw = () => {
    drawBoard();
    drawPlaced();
    drawGhost();
    drawCursor();
  };

  function place(d) {
    dominos.push({ id: nextId++, c: d.c, r: d.r, o: d.o });
    drawPlaced();
  }
  svg.addEventListener("pointerdown", (e) => {
    const src = e.target.closest("[data-src]");
    const on = e.target.closest("[data-d]");
    if (!src && !on) return;
    e.preventDefault();
    let o, origin = null;
    if (src) o = src.dataset.src;
    else {
      const d = dominos.find((x) => x.id === Number(on.dataset.d));
      o = d.o;
      origin = { c: d.c, r: d.r, o: d.o };
      dominos = dominos.filter((x) => x !== d);
    }
    drag = { o, origin, x: e.clientX, y: e.clientY, moved: false, p: toLocal(svg, e) };
    svg.setPointerCapture(e.pointerId);
    drawPlaced();
    drawGhost();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) drag.moved = true;
    drag.p = toLocal(svg, e);
    drawGhost();
  });
  const finish = (cancel) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    const s = snap(d.p, d.o);
    let note = "";
    if (cancel) {
      if (d.origin) place(d.origin);
    } else if (!d.moved && d.origin && tapRemoves) {
      note = t("Domino enlevé.", "Domino removed.");
    } else if (!d.moved && d.origin) {
      const turned = { ...d.origin, o: d.origin.o === "h" ? "v" : "h" };
      if (valid(turned, null)) place(turned);
      else {
        place(d.origin);
        note = t("Impossible de tourner ce domino ici.", "This domino cannot turn here.");
      }
    } else if (s.inBoard) {
      if (valid(s, null)) place(s);
      else if (d.origin) place(d.origin);
      else note = t("Cet emplacement n’est pas libre.", "That spot is not free.");
    } else if (d.origin) note = t("Domino enlevé.", "Domino removed.");
    drawGhost();
    summary(note);
  };
  svg.addEventListener("pointerup", () => finish(false));
  svg.addEventListener("pointercancel", () => finish(true));
  svg.addEventListener("focus", () => {
    focused = true;
    drawCursor();
  });
  svg.addEventListener("blur", () => {
    focused = false;
    drawCursor();
  });
  svg.addEventListener("keydown", (e) => {
    const move = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (move) {
      e.preventDefault();
      cursor = { c: clamp(cursor.c + move[0], 0, N - 1), r: clamp(cursor.r + move[1], 0, N - 1) };
      const here = occupied(null).get(`${cursor.c},${cursor.r}`);
      announce(`${t("Case", "Square")} ${cursor.c + 1}, ${cursor.r + 1}${removed.has(`${cursor.c},${cursor.r}`) ? `, ${t("retirée", "removed")}` : here ? `, ${t("domino présent", "domino here")}` : `, ${t("libre", "free")}`}.`);
      drawCursor();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const here = occupied(null).get(`${cursor.c},${cursor.r}`);
      if (here) {
        const turned = { c: here.c, r: here.r, o: here.o === "h" ? "v" : "h" };
        dominos = dominos.filter((x) => x !== here);
        if (valid(turned, null)) place(turned);
        else place(here);
        drawPlaced();
        summary();
      } else {
        const d = { c: cursor.c, r: cursor.r, o: kbo };
        if (valid(d, null)) {
          place(d);
          summary();
        } else announce(t("Impossible de poser un domino ici.", "Cannot place a domino here."));
      }
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      const here = occupied(null).get(`${cursor.c},${cursor.r}`);
      if (here) {
        dominos = dominos.filter((x) => x !== here);
        drawPlaced();
        summary(t("Domino enlevé.", "Domino removed."));
      }
    } else if (e.key === "o" || e.key === "O") {
      toggleOrient();
    }
  });
  function toggleOrient() {
    kbo = kbo === "h" ? "v" : "h";
    root.querySelector("#dm-orient").textContent = `${t("Domino au clavier", "Keyboard domino")} : ${kbo === "h" ? t("horizontal", "horizontal") : t("vertical", "vertical")}`;
  }
  root.querySelector("#dm-orient").addEventListener("click", toggleOrient);
  root.querySelector("#dm-tap").addEventListener("click", (e) => {
    tapRemoves = !tapRemoves;
    e.currentTarget.setAttribute("aria-pressed", String(tapRemoves));
    e.currentTarget.textContent = tapRemoves ? t("Toucher un domino : l’enlever", "Tapping a domino: remove it") : t("Toucher un domino : le tourner", "Tapping a domino: turn it");
  });
  // The colouring is a hint, so its button lives with hint 1 in the hint panel (see hintActions in index.js). It reaches
  // the activity as a "challenge-action" event; the activity keeps the button's pressed state in step.
  const hintButton = () => document.querySelector('[data-hint-act="colour"]');
  const setColour = (on) => { colour = on; hintButton()?.setAttribute("aria-pressed", String(colour)); drawBoard(); summary(); };
  const onAction = (e) => { if (e.detail?.id === "chess" && e.detail.act === "colour") setColour(!colour); };
  document.addEventListener("challenge-action", onAction);
  hintButton()?.setAttribute("aria-pressed", "false");
  // A greedy random attempt: dominoes are laid one by one in random places until none fits. It never completes the board.
  root.querySelector("#dm-auto").addEventListener("click", () => {
    dominos = [];
    const spots = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const o of ["h", "v"]) spots.push({ c, r, o });
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
    for (const d of spots) if (valid(d, null)) dominos.push({ id: nextId++, c: d.c, r: d.r, o: d.o });
    drawPlaced();
    summary(t("Essai terminé : aucun domino ne peut plus être posé.", "Attempt finished: no more domino fits."));
  });
  root.querySelector("#dm-clear").addEventListener("click", () => {
    dominos = [];
    drawPlaced();
    summary();
  });
  drawTray();
  redraw();
  summary();
  void reduced;
  return () => document.removeEventListener("challenge-action", onAction);
}
