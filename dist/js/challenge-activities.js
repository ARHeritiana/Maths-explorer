// One hands-on activity per challenge. Each lets the student try, fail and notice
// before answering. None of them states the answer or the method: they offer a
// tool (a board, a game, a table, a slider) and show the numbers it produces.
// Every activity works with pointer, touch and keyboard, announces its state in a
// polite live region, and returns a function that stops timers when the page changes.
import { formatNumber } from "./math.js";

import { svgEl, toLocal, clamp, colour, lockTouch, MINUS } from "./challenge-kit.js";
import { artgallery, eggs, hanoi, ramsey, konigsberg, josephus } from "./challenge-more.js";

const fmtFor = (lang) => (n, d = 2) => formatNumber(Math.abs(n) < 1e-12 ? 0 : n, lang, d).replace(/-/g, MINUS);

/* ------------------------------------------------------------- handshakes */
function handshakes(root, { t }) {
  const W = 380, H = 380, CX = 190, CY = 190, R = 135;
  let n = 6;
  let edges = new Set();
  let selected = null;
  let drag = null;
  const letters = "ABCDEFGH";

  root.innerHTML = `
    <p class="act-help">${t("Relie deux personnes pour une poignée de main : glisse de l’une à l’autre, ou touche-les l’une après l’autre. Rejoins la même paire pour l’annuler.", "Join two people to shake hands: drag from one to the other, or tap them one after the other. Join the same pair again to undo it.")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Personnes autour d’une table", "People around a table")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="hs-n"><span class="act-label">${t("Nombre de personnes", "Number of people")} <output id="hs-out"></output></span><input id="hs-n" type="range" min="2" max="8" step="1" value="6"></label>
      <button class="btn btn-secondary" id="hs-clear" type="button">${t("Effacer les poignées", "Clear handshakes")}</button>
    </div>
    <p class="act-readout" id="hs-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  lockTouch(svg, "[data-person]");
  const pos = (i) => {
    const a = (-90 + (360 * i) / n) * (Math.PI / 180);
    return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
  };
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const degree = (i) => [...edges].filter((e) => e.split("-").map(Number).includes(i)).length;

  function draw() {
    svg.replaceChildren();
    const lines = svgEl("g", { class: "hs-lines" }, svg);
    for (const e of edges) {
      const [a, b] = e.split("-").map(Number);
      const [x1, y1] = pos(a), [x2, y2] = pos(b);
      svgEl("line", { x1, y1, x2, y2 }, lines);
    }
    if (drag?.to) {
      const [x1, y1] = pos(drag.from);
      svgEl("line", { x1, y1, x2: drag.to.x, y2: drag.to.y, class: "hs-temp" }, lines);
    }
    for (let i = 0; i < n; i++) {
      const [x, y] = pos(i);
      const d = degree(i);
      const g = svgEl("g", { class: `hs-person${selected === i ? " selected" : ""}`, "data-person": i, tabindex: "0", role: "button", "aria-pressed": String(selected === i), "aria-label": `${letters[i]}, ${t("personne", "person")}, ${d} ${t(d > 1 ? "poignées de main" : "poignée de main", d > 1 ? "handshakes" : "handshake")}` }, svg);
      svgEl("circle", { cx: x, cy: y, r: 26 }, g);
      svgEl("text", { x, y: y + 6, "text-anchor": "middle", class: "hs-letter" }, g).textContent = letters[i];
      const bx = x + (x - CX) * 0.3, by = y + (y - CY) * 0.3;
      svgEl("text", { x: bx, y: by + 5, "text-anchor": "middle", class: "hs-count", "aria-hidden": "true" }, svg).textContent = d;
    }
    root.querySelector("#hs-out").textContent = n;
    const total = edges.size;
    root.querySelector("#hs-read").textContent = `${total} ${t(total > 1 ? "poignées de main échangées" : "poignée de main échangée", total > 1 ? "handshakes so far" : "handshake so far")}.`;
  }
  const toggle = (a, b) => {
    const k = key(a, b);
    if (edges.has(k)) edges.delete(k);
    else edges.add(k);
  };
  const click = (i) => {
    if (selected === null) selected = i;
    else if (selected === i) selected = null;
    else {
      toggle(selected, i);
      selected = null;
    }
    draw();
    svg.querySelector(`[data-person="${i}"]`)?.focus();
  };
  svg.addEventListener("pointerdown", (e) => {
    const node = e.target.closest("[data-person]");
    if (!node) return;
    e.preventDefault();
    drag = { from: Number(node.dataset.person), x: e.clientX, y: e.clientY, moved: false };
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true;
    if (drag.moved) {
      drag.to = toLocal(svg, e);
      draw();
    }
  });
  svg.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved) return click(d.from);
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-person]");
    const to = over ? Number(over.dataset.person) : null;
    if (to !== null && to !== d.from) toggle(d.from, to);
    selected = null;
    draw();
  });
  svg.addEventListener("pointercancel", () => {
    drag = null;
    draw();
  });
  svg.addEventListener("keydown", (e) => {
    const node = e.target.closest("[data-person]");
    if (node && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      click(Number(node.dataset.person));
    }
  });
  root.querySelector("#hs-n").addEventListener("input", (e) => {
    n = Number(e.target.value);
    edges = new Set();
    selected = null;
    draw();
  });
  root.querySelector("#hs-clear").addEventListener("click", () => {
    edges = new Set();
    selected = null;
    draw();
  });
  draw();
  return () => {};
}

/* ------------------------------------------------------------------ doors */
function doors(root, { t }) {
  let k = 0;
  let picked = null;
  let timer = null;
  root.innerHTML = `
    <p class="act-help">${t("Fais avancer les passages et regarde les portes changer d’état. Touche une porte pour voir quand elle a été changée.", "Step through the passes and watch the doors change. Tap a door to see when it was changed.")}</p>
    <div class="doors" id="dr-grid" role="group" aria-label="${t("100 portes", "100 doors")}"></div>
    <div class="act-controls">
      <label class="act-field" for="dr-k"><span class="act-label">${t("Après le passage", "After pass")} <output id="dr-out"></output></span><input id="dr-k" type="range" min="0" max="100" step="1" value="0"></label>
      <div class="act-buttons">
        <button class="btn btn-secondary" id="dr-prev" type="button">${t("Passage précédent", "Previous pass")}</button>
        <button class="btn btn-primary" id="dr-next" type="button">${t("Passage suivant", "Next pass")}</button>
        <button class="btn btn-secondary" id="dr-play" type="button" aria-pressed="false">${t("Lire", "Play")}</button>
        <button class="btn-quiet" id="dr-reset" type="button">${t("Recommencer", "Start over")}</button>
      </div>
    </div>
    <p class="act-readout" id="dr-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#dr-grid");
  const count = (n) => {
    let c = 0;
    for (let d = 1; d <= Math.min(k, n); d++) if (n % d === 0) c++;
    return c;
  };
  grid.innerHTML = Array.from({ length: 100 }, (_, i) => `<button type="button" class="door" data-n="${i + 1}"><span>${i + 1}</span></button>`).join("");
  const stop = () => {
    clearInterval(timer);
    timer = null;
    const play = root.querySelector("#dr-play");
    play.setAttribute("aria-pressed", "false");
    play.textContent = t("Lire", "Play");
  };
  function render() {
    let open = 0;
    grid.querySelectorAll(".door").forEach((b) => {
      const n = Number(b.dataset.n);
      const isOpen = count(n) % 2 === 1;
      if (isOpen) open++;
      b.classList.toggle("open", isOpen);
      b.classList.toggle("flipped", k > 0 && n % k === 0);
      b.classList.toggle("picked", picked === n);
      b.setAttribute("aria-label", `${t("Porte", "Door")} ${n}, ${isOpen ? t("ouverte", "open") : t("fermée", "closed")}`);
    });
    root.querySelector("#dr-k").value = k;
    root.querySelector("#dr-out").textContent = k;
    let text = k === 0 ? t("Toutes les portes sont fermées.", "All doors are closed.") : `${t("Après le passage", "After pass")} ${k} : ${open} ${t(open > 1 ? "portes ouvertes" : "porte ouverte", open > 1 ? "doors open" : "door open")}.`;
    if (picked) {
      const ds = Array.from({ length: Math.min(k, picked) }, (_, i) => i + 1).filter((d) => picked % d === 0);
      text += ` ${t("Porte", "Door")} ${picked} : ${ds.length ? `${t("changée aux passages", "changed at passes")} ${ds.join(", ")} (${ds.length} ${t(ds.length > 1 ? "fois" : "fois", "times")})` : t("jamais changée pour l’instant", "not changed yet")}.`;
    }
    root.querySelector("#dr-read").textContent = text;
    root.querySelector("#dr-prev").disabled = k === 0;
    root.querySelector("#dr-next").disabled = k === 100;
  }
  const go = (v) => {
    k = clamp(v, 0, 100);
    render();
  };
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".door");
    if (!b) return;
    picked = picked === Number(b.dataset.n) ? null : Number(b.dataset.n);
    render();
  });
  root.querySelector("#dr-k").addEventListener("input", (e) => go(Number(e.target.value)));
  root.querySelector("#dr-prev").addEventListener("click", () => go(k - 1));
  root.querySelector("#dr-next").addEventListener("click", () => go(k + 1));
  root.querySelector("#dr-reset").addEventListener("click", () => {
    stop();
    picked = null;
    go(0);
  });
  root.querySelector("#dr-play").addEventListener("click", (e) => {
    if (timer) return stop();
    if (k >= 100) k = 0;
    e.currentTarget.setAttribute("aria-pressed", "true");
    e.currentTarget.textContent = t("Pause", "Pause");
    timer = setInterval(() => {
      if (k >= 100) return stop();
      go(k + 1);
    }, 220);
  });
  render();
  return stop;
}

/* --------------------------------------------------------------- dominoes */
function dominoes(root, { t, reduced }) {
  const N = 8, C = 44, BX = 12, BY = 12, BW = N * C;
  // Wide screens: supply beside the board. Narrow screens: supply under it, so cells stay large.
  const compact = root.clientWidth > 0 && root.clientWidth < 560;
  const TR = compact ? { x: BX, y: BY + BW + 14, w: BW, h: 112 } : { x: BX + BW + 28, y: BY, w: 104, h: BW };
  const W = compact ? BX * 2 + BW : TR.x + TR.w + 16, H = compact ? TR.y + TR.h + BY : BY * 2 + BW;
  const removed = new Set(["0,0", "7,7"]);
  let dominos = [];
  let nextId = 1;
  let drag = null;
  let colour = false;
  let kbo = "h";
  let cursor = { c: 3, r: 3 };
  let focused = false;

  root.innerHTML = `
    <p class="act-help">${t("Fais glisser un domino depuis la réserve jusqu’au plateau. Touche un domino posé pour le tourner, ou fais-le glisser hors du plateau pour l’enlever. Au clavier : flèches, Entrée pour poser, Suppr pour enlever.", "Drag a domino from the supply onto the board. Tap a placed domino to turn it, or drag it off the board to remove it. With a keyboard: arrows, Enter to place, Delete to remove.")}</p>
    <svg class="act-svg dom-svg" viewBox="0 0 ${W} ${H}" tabindex="0" role="application" aria-label="${t("Plateau de dominos", "Domino board")}"></svg>
    <div class="act-controls">
      <button class="btn btn-secondary" id="dm-colour" type="button" aria-pressed="false">${t("Colorier les cases", "Colour the squares")}</button>
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
    announce(`${n} ${t(n > 1 ? "dominos posés" : "domino posé", n > 1 ? "dominoes placed" : "domino placed")}, ${62 - 2 * n} ${t("cases libres", "free squares")}.${split} ${extra}`.trim());
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
  root.querySelector("#dm-colour").addEventListener("click", (e) => {
    colour = !colour;
    e.currentTarget.setAttribute("aria-pressed", String(colour));
    drawBoard();
    summary();
  });
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
  return () => {};
}

/* -------------------------------------------------------------------- nim */
function nim(root, { t, reduced }) {
  let stones = 21, turn = "you", over = false, userFirst = true, perfect = true;
  let wins = 0, games = 0, log = [], timer = null;
  root.innerHTML = `
    <p class="act-help">${t("Joue contre l’ordinateur. À ton tour, retire 1, 2 ou 3 pierres. Celui qui prend la dernière pierre gagne.", "Play the computer. On your turn take 1, 2 or 3 stones. Whoever takes the last stone wins.")}</p>
    <div class="nim-pile" id="nim-pile" aria-hidden="true">${Array.from({ length: 21 }, () => '<span class="stone"></span>').join("")}</div>
    <p class="act-readout nim-status" id="nim-status" role="status" aria-live="polite"></p>
    <div class="act-buttons">${[1, 2, 3].map((k) => `<button class="btn btn-primary" type="button" data-take="${k}">${t("Prendre", "Take")} ${k}</button>`).join("")}</div>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Qui commence ?", "Who starts?")}</legend>
        <label><input type="radio" name="nim-first" value="you" checked> ${t("Moi", "Me")}</label>
        <label><input type="radio" name="nim-first" value="cpu"> ${t("L’ordinateur", "The computer")}</label></fieldset>
      <fieldset class="act-choice"><legend>${t("Adversaire", "Opponent")}</legend>
        <label><input type="radio" name="nim-level" value="perfect" checked> ${t("Sans erreur", "Never errs")}</label>
        <label><input type="radio" name="nim-level" value="random"> ${t("Au hasard", "Random")}</label></fieldset>
      <button class="btn btn-secondary" id="nim-new" type="button">${t("Nouvelle partie", "New game")}</button>
    </div>
    <p class="act-score" id="nim-score"></p>
    <ol class="nim-log" id="nim-log" aria-label="${t("Coups joués", "Moves played")}"></ol>`;
  const pile = root.querySelector("#nim-pile");
  const status = root.querySelector("#nim-status");
  function render() {
    [...pile.children].forEach((s, i) => s.classList.toggle("gone", i >= stones));
    root.querySelectorAll("[data-take]").forEach((b) => (b.disabled = over || turn !== "you" || Number(b.dataset.take) > stones));
    root.querySelector("#nim-log").innerHTML = log.map((m) => `<li>${m.who === "you" ? t("Toi", "You") : t("Ordinateur", "Computer")} : ${m.k} → ${m.left}</li>`).join("");
    root.querySelector("#nim-score").textContent = games ? `${t("Parties gagnées", "Games won")} : ${wins} / ${games}` : "";
    if (over) status.textContent = turnWinner === "you" ? t("Tu as pris la dernière pierre : tu gagnes.", "You took the last stone: you win.") : t("L’ordinateur a pris la dernière pierre : il gagne.", "The computer took the last stone: it wins.");
    else status.textContent = turn === "you" ? `${t("À toi de jouer", "Your turn")} : ${stones} ${t("pierres", "stones")}.` : `${t("L’ordinateur réfléchit…", "The computer is thinking…")} ${stones} ${t("pierres", "stones")}.`;
  }
  let turnWinner = null;
  function take(who, k) {
    stones -= k;
    log.push({ who, k, left: stones });
    if (stones === 0) {
      over = true;
      turnWinner = who;
      games++;
      if (who === "you") wins++;
    } else turn = who === "you" ? "cpu" : "you";
    render();
    if (!over && turn === "cpu") timer = setTimeout(cpu, reduced() ? 0 : 700);
  }
  function cpu() {
    const max = Math.min(3, stones);
    const k = perfect ? stones % 4 || 1 + Math.floor(Math.random() * max) : 1 + Math.floor(Math.random() * max);
    take("cpu", clamp(k, 1, max));
  }
  function start() {
    clearTimeout(timer);
    stones = 21;
    over = false;
    log = [];
    turnWinner = null;
    turn = userFirst ? "you" : "cpu";
    render();
    if (turn === "cpu") timer = setTimeout(cpu, reduced() ? 0 : 700);
  }
  root.querySelectorAll("[data-take]").forEach((b) => b.addEventListener("click", () => turn === "you" && !over && take("you", Number(b.dataset.take))));
  root.querySelector("#nim-new").addEventListener("click", start);
  root.querySelectorAll('[name="nim-first"]').forEach((r) => r.addEventListener("change", () => { userFirst = r.value === "you"; start(); }));
  root.querySelectorAll('[name="nim-level"]').forEach((r) => r.addEventListener("change", () => { perfect = r.value === "perfect"; start(); }));
  render();
  return () => clearTimeout(timer);
}

/* -------------------------------------------------------------- pigeonhole */
function pigeonhole(root, { t, lang }) {
  const MAX = 60;
  const fmt = fmtFor(lang);
  const sel = new Set();
  let best = 0;
  root.innerHTML = `
    <p class="act-help">${t("Choisis des nombres en les touchant. Le but : en choisir le plus possible sans qu’aucune paire n’ait une différence multiple de 7.", "Pick numbers by tapping them. The aim: pick as many as you can without any pair having a difference that is a multiple of 7.")}</p>
    <div class="pick-grid" id="pg-grid" role="group" aria-label="${t("Entiers de 1 à 60", "Integers from 1 to 60")}">${Array.from({ length: MAX }, (_, i) => `<button type="button" class="pick" data-n="${i + 1}" aria-pressed="false">${i + 1}</button>`).join("")}</div>
    <p class="act-readout" id="pg-read" role="status" aria-live="polite"></p>
    <div class="act-controls">
      <button class="btn btn-secondary" id="pg-clear" type="button">${t("Tout effacer", "Clear all")}</button>
      <label class="act-field" for="pg-k"><span class="act-label">${t("Tirage au hasard de", "Random draw of")} <output id="pg-kout">6</output> ${t("nombres", "numbers")}</span><input id="pg-k" type="range" min="2" max="10" value="6"></label>
      <button class="btn btn-secondary" id="pg-sim" type="button">${t("Faire 1 000 tirages", "Run 1,000 draws")}</button>
    </div>
    <p class="act-readout" id="pg-sim-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#pg-grid");
  const pairOf = (set) => {
    const a = [...set].sort((x, y) => x - y);
    const bad = new Set();
    let first = null;
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++)
        if ((a[j] - a[i]) % 7 === 0) {
          bad.add(a[i]);
          bad.add(a[j]);
          first ??= [a[i], a[j]];
        }
    return { bad, first };
  };
  function render() {
    const { bad, first } = pairOf(sel);
    grid.querySelectorAll(".pick").forEach((b) => {
      const n = Number(b.dataset.n);
      b.setAttribute("aria-pressed", String(sel.has(n)));
      b.classList.toggle("clash", bad.has(n));
    });
    if (!first && sel.size > best) best = sel.size;
    const count = sel.size;
    root.querySelector("#pg-read").textContent = first
      ? `${count} ${t("nombres choisis.", "numbers chosen.")} ${t("Paire trouvée", "Pair found")} : ${first[1]} ${MINUS} ${first[0]} = ${first[1] - first[0]} = 7 × ${(first[1] - first[0]) / 7}.`
      : `${count} ${t("nombres choisis, aucune paire dont la différence soit un multiple de 7.", "numbers chosen, no pair whose difference is a multiple of 7.")}${best ? ` ${t("Ton record sans paire", "Your best without a pair")} : ${best}.` : ""}`;
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".pick");
    if (!b) return;
    const n = Number(b.dataset.n);
    if (sel.has(n)) sel.delete(n);
    else sel.add(n);
    render();
  });
  root.querySelector("#pg-clear").addEventListener("click", () => {
    sel.clear();
    render();
  });
  root.querySelector("#pg-k").addEventListener("input", (e) => (root.querySelector("#pg-kout").textContent = e.target.value));
  root.querySelector("#pg-sim").addEventListener("click", () => {
    const k = Number(root.querySelector("#pg-k").value);
    let free = 0;
    for (let run = 0; run < 1000; run++) {
      const pool = Array.from({ length: MAX }, (_, i) => i + 1);
      const draw = new Set();
      while (draw.size < k) draw.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      if (!pairOf(draw).first) free++;
    }
    root.querySelector("#pg-sim-read").textContent = `${t("Sur 1 000 tirages de", "Out of 1,000 draws of")} ${k} ${t("nombres", "numbers")} : ${free} ${t("sans aucune paire de ce type", "with no such pair")} (${fmt((free / 1000) * 100, 1)} %). ${t("Une simulation suggère, elle ne prouve pas.", "A simulation suggests; it does not prove.")}`;
  });
  render();
  return () => {};
}

/* ---------------------------------------------------------------- product */
function product(root, { t, lang }) {
  const fmt = fmtFor(lang);
  let N = 12, d = "", factors = false, best = 0;
  root.innerHTML = `
    <p class="act-help">${t("Regarde les valeurs de n³ − n, puis propose un diviseur d. Le tableau montre pour quels n il marche.", "Look at the values of n³ − n, then try a divisor d. The table shows for which n it works.")}</p>
    <div class="act-controls">
      <label class="act-field" for="pr-n"><span class="act-label">${t("n va de 2 à", "n goes from 2 to")} <output id="pr-nout"></output></span><input id="pr-n" type="range" min="3" max="40" value="12"></label>
      <label class="act-field act-number" for="pr-d">${t("Diviseur essayé", "Divisor tried")}<input id="pr-d" type="number" min="1" max="5000" inputmode="numeric" placeholder="d"></label>
      <label class="act-check"><input id="pr-f" type="checkbox"> ${t("Montrer la factorisation de chaque valeur", "Show each value’s factorisation")}</label>
    </div>
    <p class="act-readout" id="pr-read" role="status" aria-live="polite"></p>
    <div class="table-scroll" tabindex="0" role="region" aria-label="${t("Valeurs de n³ − n", "Values of n³ − n")}"><table class="act-table" id="pr-table"></table></div>`;
  const v = (n) => n ** 3 - n;
  function render() {
    root.querySelector("#pr-nout").textContent = N;
    const dn = Number(d);
    const use = Number.isInteger(dn) && dn >= 1;
    let fail = null;
    const rows = [];
    for (let n = 2; n <= N; n++) {
      const ok = use ? v(n) % dn === 0 : null;
      if (use && !ok && fail === null) fail = n;
      rows.push(`<tr class="${ok === null ? "" : ok ? "yes" : "no"}"><th scope="row">${n}</th><td>${v(n).toLocaleString(lang)}</td>${factors ? `<td>${n - 1} × ${n} × ${n + 1}</td>` : ""}<td>${ok === null ? "" : ok ? "✓" : "✗"}</td></tr>`);
    }
    root.querySelector("#pr-table").innerHTML = `<thead><tr><th scope="col">n</th><th scope="col">n³ ${MINUS} n</th>${factors ? `<th scope="col">${t("Facteurs", "Factors")}</th>` : ""}<th scope="col">${use ? `${t("divisible par", "divisible by")} ${dn} ?` : t("Divisible ?", "Divisible?")}</th></tr></thead><tbody>${rows.join("")}</tbody>`;
    const read = root.querySelector("#pr-read");
    if (!use) read.textContent = t("Entre un entier d pour le tester.", "Enter an integer d to test it.");
    else if (fail !== null) read.textContent = `${dn} ${t("ne divise pas", "does not divide")} n³ ${MINUS} n ${t("pour n =", "for n =")} ${fail} (${fmt(v(fail), 0)}).`;
    else {
      if (dn > best) best = dn;
      read.textContent = `${dn} ${t("divise n³ − n pour tous les n de 2 à", "divides n³ − n for every n from 2 to")} ${N}. ${t("Le plus grand d validé jusqu’ici", "Largest d that has passed so far")} : ${best}. ${t("Tester jusqu’à N ne prouve pas que ça marche pour tout n.", "Testing up to N does not prove it works for every n.")}`;
    }
  }
  root.querySelector("#pr-n").addEventListener("input", (e) => {
    N = Number(e.target.value);
    render();
  });
  root.querySelector("#pr-d").addEventListener("input", (e) => {
    d = e.target.value;
    render();
  });
  root.querySelector("#pr-f").addEventListener("change", (e) => {
    factors = e.target.checked;
    render();
  });
  render();
  return () => {};
}

/* ------------------------------------------------------------- inequality */
function inequality(root, { t, lang }) {
  const fmt = fmtFor(lang);
  const W = 400, H = 300, XMAX = 5.2, YMAX = 7;
  const X = (x) => 40 + (x * 340) / XMAX, Y = (y) => 268 - (y * 246) / YMAX;
  let x = 3;
  let best = null;
  root.innerHTML = `
    <p class="act-help">${t("Déplace le point sur la courbe, ou utilise le curseur. Le rectangle a toujours une aire égale à 1.", "Move the point along the curve, or use the slider. The rectangle always has an area of 1.")}</p>
    <div class="ineq-figs">
      <svg class="act-svg" id="iq-plot" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Courbe de x + 1/x", "Graph of x + 1/x")}"></svg>
      <svg class="act-svg" id="iq-rect" viewBox="0 0 260 260" role="img" aria-label="${t("Rectangle de côtés x et 1/x", "Rectangle with sides x and 1/x")}"></svg>
    </div>
    <label class="act-field" for="iq-x"><span class="act-label">${t("Valeur de x", "Value of x")} <output id="iq-out"></output></span><input id="iq-x" type="range" min="0.15" max="5" step="0.05" value="3"></label>
    <p class="act-readout" id="iq-read" role="status" aria-live="polite"></p>
    <button class="btn-quiet" id="iq-reset" type="button">${t("Effacer la plus petite valeur trouvée", "Clear the smallest value found")}</button>`;
  const plot = root.querySelector("#iq-plot"), rect = root.querySelector("#iq-rect");
  lockTouch(plot, ".toy-handle");
  for (let i = 0; i <= 5; i++) {
    svgEl("line", { x1: X(i), y1: Y(0), x2: X(i), y2: Y(YMAX), class: i === 0 ? "ax" : "gl" }, plot);
    svgEl("text", { x: X(i), y: Y(0) + 18, "text-anchor": "middle", class: "tk" }, plot).textContent = i;
  }
  for (let j = 0; j <= 7; j++) {
    svgEl("line", { x1: X(0), y1: Y(j), x2: X(XMAX), y2: Y(j), class: j === 0 ? "ax" : "gl" }, plot);
    if (j) svgEl("text", { x: X(0) - 8, y: Y(j) + 4, "text-anchor": "end", class: "tk" }, plot).textContent = j;
  }
  const clip = svgEl("clipPath", { id: "iq-clip" }, svgEl("defs", {}, plot));
  svgEl("rect", { x: X(0), y: Y(YMAX), width: X(XMAX) - X(0), height: Y(0) - Y(YMAX) }, clip);
  let d = "";
  for (let i = 0; i <= 200; i++) {
    const xv = 0.13 + (i * (XMAX - 0.13)) / 200;
    d += (i ? "L" : "M") + X(xv).toFixed(1) + " " + Y(xv + 1 / xv).toFixed(1);
  }
  svgEl("path", { d, class: "curve", "clip-path": "url(#iq-clip)" }, plot);
  const drop = svgEl("line", { class: "drop" }, plot);
  const dot = svgEl("g", { class: "toy-handle", tabindex: "0", role: "slider", "aria-label": t("Valeur de x", "Value of x"), "aria-valuemin": 0.15, "aria-valuemax": 5 }, plot);
  svgEl("circle", { r: 24, class: "hit" }, dot);
  svgEl("circle", { r: 10, class: "ring" }, dot);
  svgEl("circle", { r: 4, class: "core" }, dot);
  function draw() {
    const y = x + 1 / x;
    dot.setAttribute("transform", `translate(${X(x)} ${Y(Math.min(y, YMAX))})`);
    dot.setAttribute("aria-valuenow", x);
    dot.setAttribute("aria-valuetext", `x = ${fmt(x)}`);
    drop.setAttribute("x1", X(x)); drop.setAttribute("x2", X(x)); drop.setAttribute("y1", Y(0)); drop.setAttribute("y2", Y(Math.min(y, YMAX)));
    rect.replaceChildren();
    const s = 190 / Math.max(x, 1 / x, 1);
    const w = x * s, h = s / x;
    const ox = 30, oy = 230;
    svgEl("rect", { x: ox, y: oy - h, width: w, height: h, class: "iq-rect" }, rect);
    svgEl("text", { x: ox + w / 2, y: oy + 18, "text-anchor": "middle", class: "tk" }, rect).textContent = `x = ${fmt(x)}`;
    svgEl("text", { x: ox - 6, y: oy - h / 2, "text-anchor": "end", class: "tk" }, rect).textContent = `1/x = ${fmt(1 / x)}`;
    if (!best || y < best.y - 1e-12) best = { x, y };
    root.querySelector("#iq-x").value = x;
    root.querySelector("#iq-out").textContent = fmt(x);
    root.querySelector("#iq-read").innerHTML = `x + 1/x = ${fmt(x)} + ${fmt(1 / x)} = <strong>${fmt(y, 3)}</strong><br>${t("Plus petite valeur trouvée", "Smallest value found")} : ${fmt(best.y, 3)} ${t("pour", "at")} x = ${fmt(best.x)}`;
  }
  const setX = (v) => {
    x = clamp(Math.round(v / 0.05) * 0.05, 0.15, 5);
    draw();
  };
  dot.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dot.setPointerCapture(e.pointerId);
    dot.classList.add("grabbed");
    const move = (ev) => setX(((toLocal(plot, ev).x - 40) * XMAX) / 340);
    const up = () => {
      dot.classList.remove("grabbed");
      dot.removeEventListener("pointermove", move);
      dot.removeEventListener("pointerup", up);
      dot.removeEventListener("pointercancel", up);
    };
    dot.addEventListener("pointermove", move);
    dot.addEventListener("pointerup", up);
    dot.addEventListener("pointercancel", up);
    move(e);
  });
  dot.addEventListener("keydown", (e) => {
    const dir = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    setX(x + dir * (e.shiftKey ? 0.5 : 0.05));
  });
  root.querySelector("#iq-x").addEventListener("input", (e) => setX(Number(e.target.value)));
  root.querySelector("#iq-reset").addEventListener("click", () => {
    best = null;
    draw();
  });
  draw();
  return () => {};
}

/* ---------------------------------------------------------------- squares */
// Each border (an L of 1, 3, 5, … dots) has its own colour, an outline that wraps the whole L, and a matching line in
// the legend, so the grouping "1 + 3 + 5 + …" is visible on the picture itself. Colour is never the only cue: the
// newest border is outlined thick and every legend line states its dot count.
function squares(root, { t }) {
  let n = 5;
  root.innerHTML = `
    <p class="act-help">${t("Ajoute des bordures de points une à une et compte les points de chacune. Chaque bordure a sa couleur et son contour.", "Add borders of dots one at a time and count the dots in each. Every border has its own colour and outline.")}</p>
    <div class="sq-layout">
      <svg class="act-svg" id="sq-svg" viewBox="0 0 300 300" role="img" aria-label="${t("Points disposés en carré, une couleur par bordure", "Dots arranged in a square, one colour per border")}"></svg>
      <ol class="sq-legend" id="sq-legend" aria-label="${t("Bordures et nombre de points", "Borders and dot counts")}"></ol>
    </div>
    <div class="act-controls">
      <label class="act-field" for="sq-n"><span class="act-label">${t("Nombre de bordures", "Number of borders")} <output id="sq-out"></output></span><input id="sq-n" type="range" min="1" max="12" step="1" value="5"></label>
      <div class="act-buttons">
        <button class="btn btn-secondary" id="sq-minus" type="button">${t("Retirer une bordure", "Remove a border")}</button>
        <button class="btn btn-primary" id="sq-plus" type="button">${t("Ajouter une bordure", "Add a border")}</button>
      </div>
    </div>
    <p class="act-readout" id="sq-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("#sq-svg"), legend = root.querySelector("#sq-legend");
  const SP = 23, R = 8;
  function draw() {
    svg.replaceChildren();
    legend.replaceChildren();
    const OX = (300 - (n - 1) * SP) / 2, OY = OX, P = (i, j) => [OX + j * SP, OY + i * SP];
    for (let k = 1; k <= n; k++) {
      // outline of border k: the L made of row k − 1 and column k − 1, drawn as one rounded polygon around the dots
      const pad = R + 3, a = k - 1, c0 = P(0, 0), x0 = c0[0] - pad, y0 = c0[1] - pad, ex = c0[0] + a * SP + pad, ey = c0[1] + a * SP + pad, ix = c0[0] + (a - 1) * SP + pad, iy = c0[1] + (a - 1) * SP + pad;
      const d = k === 1 ? `M${x0} ${y0}H${ex}V${ey}H${x0}Z` : `M${x0} ${iy}H${ix}V${y0}H${ex}V${ey}H${x0}Z`;
      svgEl("path", { d, class: `sq-border${k === n ? " newest" : ""}`, style: `stroke:${colour(k - 1)};fill:${colour(k - 1)}` }, svg);
    }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const layer = Math.max(i, j) + 1, [cx, cy] = P(i, j);
        svgEl("circle", { cx, cy, r: R, class: "sq-dot", style: `fill:${colour(layer - 1)}` }, svg);
      }
    // border numbers along the left column of the picture
    for (let k = 1; k <= n; k++) { const [cx, cy] = P(k - 1, 0); void cx; if (n <= 8) svgEl("text", { x: P(0, 0)[0] - 22, y: cy + 4, "text-anchor": "end", class: "sq-k" }, svg).textContent = k; }
    let sum = 0;
    for (let k = 1; k <= n; k++) {
      sum += 2 * k - 1;
      const li = document.createElement("li");
      li.className = k === n ? "newest" : "";
      li.innerHTML = `<span class="sw" style="background:${colour(k - 1)}"></span><span>${t("Bordure", "Border")} ${k} : <strong>${2 * k - 1}</strong> ${t(k > 1 ? "points" : "point", k > 1 ? "dots" : "dot")}</span><span class="tot">${t("total", "total")} ${sum}</span>`;
      legend.append(li);
    }
    const terms = Array.from({ length: n }, (_, k) => 2 * k + 1);
    const shown = n > 8 ? `${terms.slice(0, 4).join(" + ")} + … + ${terms.slice(-2).join(" + ")}` : terms.join(" + ");
    root.querySelector("#sq-out").textContent = n;
    root.querySelector("#sq-n").value = n;
    root.querySelector("#sq-read").innerHTML = `${shown} = <strong>${n * n}</strong><br>${t("La dernière bordure compte", "The last border has")} ${2 * n - 1} ${t(n > 1 ? "points" : "point", n > 1 ? "dots" : "dot")}. ${t("Le carré a", "The square has")} ${n} × ${n} ${t("points", "dots")}.`;
    root.querySelector("#sq-minus").disabled = n <= 1;
    root.querySelector("#sq-plus").disabled = n >= 12;
  }
  const set = (v) => {
    n = clamp(v, 1, 12);
    draw();
  };
  root.querySelector("#sq-n").addEventListener("input", (e) => set(Number(e.target.value)));
  root.querySelector("#sq-minus").addEventListener("click", () => set(n - 1));
  root.querySelector("#sq-plus").addEventListener("click", () => set(n + 1));
  draw();
  return () => {};
}

const activities = { handshakes, doors, chess: dominoes, nim, pigeonhole, product, inequality, squares, artgallery, eggs, hanoi, ramsey, konigsberg, josephus };

export function hasActivity(id) {
  return Object.hasOwn(activities, id);
}

export function mountActivity(id, root, { lang, reduced }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const stop = activities[id]?.(root, { t, lang, reduced });
  return stop || (() => {});
}
