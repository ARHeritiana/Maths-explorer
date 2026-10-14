// Hands-on activities for the challenges added in October 2026: art gallery, eggs, Hanoi, Ramsey, Königsberg, Josephus.
// Same rules as challenge-activities.js: try, fail and notice before answering; no activity states the answer or the
// method; pointer, touch and keyboard all work; state is announced in a polite live region.
import { svgEl, toLocal, clamp, colour, lockTouch, MINUS } from "./challenge-kit.js";
import { pointInPolygon, visibility } from "./challenge-geometry.js";
import { comb, graphFor, josephusOrder, layoutOf, bridgeGeom } from "./challenge-variants.js";

/* ---------------------------------------------------------- art gallery */
export function artgallery(root, { t, q }) {
  const COMB = comb(q.k), WIDTH = 5 * q.k - 2, MAXG = q.k + 4;
  const SC = Math.min(24, 324 / WIDTH), PAD = 18, W = WIDTH * SC + 2 * PAD, H = 10 * SC + 2 * PAD;
  const X = (x) => PAD + x * SC, Y = (y) => PAD + (10 - y) * SC;
  const inv = (p) => [(p.x - PAD) / SC, 10 - (p.y - PAD) / SC];
  const guards = [];
  let drag = null, sel = -1;
  root.innerHTML = `
    <p class="act-help">${t("Touche la galerie pour poser un gardien. Fais glisser un gardien pour le déplacer, touche-le sans le bouger pour l’enlever. Au clavier : Tab jusqu’à un gardien, flèches pour le déplacer, Suppr pour l’enlever.", "Tap the gallery to place a guard. Drag a guard to move it, tap it without moving to remove it. With the keyboard: Tab to a guard, arrow keys to move it, Delete to remove it.")}</p>
    <svg class="act-svg ag-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t(`Galerie en forme de peigne à ${3 * q.k} côtés`, `Comb-shaped gallery with ${3 * q.k} walls`)}"></svg>
    <div class="act-controls">
      <button class="btn btn-secondary" id="ag-add" type="button">${t("Ajouter un gardien au centre", "Add a guard in the middle")}</button>
      <button class="btn-quiet" id="ag-clear" type="button">${t("Tout enlever", "Remove all")}</button>
    </div>
    <p class="act-readout" id="ag-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  lockTouch(svg, ".ag-guard");
  const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join("") + "Z";
  const cells = [];
  for (let x = 0.1; x < WIDTH; x += 0.3) for (let y = 0.1; y < 10; y += 0.3) if (pointInPolygon([x, y], COMB)) cells.push([x, y]);

  function draw() {
    svg.replaceChildren();
    svgEl("path", { d: path(COMB), class: "ag-poly" }, svg);
    const vis = guards.map((g) => visibility(COMB, g));
    vis.forEach((v) => svgEl("path", { d: path(v), class: "ag-vis" }, svg));
    svgEl("path", { d: path(COMB), class: "ag-wall" }, svg);
    guards.forEach((g, i) => {
      const grp = svgEl("g", { class: `ag-guard${i === sel ? " sel" : ""}`, "data-g": i, tabindex: 0, role: "button", "aria-label": `${t("Gardien", "Guard")} ${i + 1}` }, svg);
      svgEl("circle", { cx: X(g[0]), cy: Y(g[1]), r: 18, class: "hit" }, grp);
      svgEl("circle", { cx: X(g[0]), cy: Y(g[1]), r: 7, class: "dot", style: `fill:${colour(i)}` }, grp);
      svgEl("circle", { cx: X(g[0]), cy: Y(g[1]), r: 11, class: "ring" }, grp);
    });
    const seen = cells.filter((c) => vis.some((v) => pointInPolygon(c, v))).length;
    const pct = Math.floor((100 * seen) / cells.length);
    const n = guards.length;
    const all = n > 0 && seen === cells.length;
    root.querySelector("#ag-read").innerHTML = `${n} ${t(n > 1 ? "gardiens" : "gardien", n > 1 ? "guards" : "guard")}. ${t("Surveillé", "Watched")} : <strong>${pct} %</strong>${all ? ` ${t("La galerie entière est surveillée.", "The whole gallery is watched.")}` : n ? ` ${t("Les zones rouges ne sont vues par personne.", "The red areas are seen by nobody.")}` : ""}`;
    root.querySelector("#ag-add").disabled = n >= MAXG;
  }
  const inside = (p) => pointInPolygon(p, COMB);
  const add = (p) => { if (guards.length < MAXG && inside(p)) { guards.push([p[0], p[1]]); sel = guards.length - 1; draw(); } };
  svg.addEventListener("pointerdown", (e) => {
    const g = e.target.closest("[data-g]");
    if (!g) { add(inv(toLocal(svg, e))); return; }
    e.preventDefault();
    const i = Number(g.dataset.g);
    drag = { i, from: guards[i].slice(), x: e.clientX, y: e.clientY, moved: false };
    sel = i;
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) drag.moved = true;
    if (!drag.moved) return;
    const p = inv(toLocal(svg, e));
    if (inside(p)) { guards[drag.i] = p; draw(); }
  });
  const end = () => {
    if (!drag) return;
    if (!drag.moved) guards.splice(drag.i, 1);
    sel = -1; drag = null; draw();
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  svg.addEventListener("keydown", (e) => {
    const g = e.target.closest?.("[data-g]");
    if (!g) return;
    const i = Number(g.dataset.g), step = e.shiftKey ? 1 : 0.4;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (mv) {
      e.preventDefault();
      const p = [guards[i][0] + mv[0], guards[i][1] + mv[1]];
      if (inside(p)) { guards[i] = p; sel = i; draw(); svg.querySelector(`[data-g="${i}"]`)?.focus(); }
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault(); guards.splice(i, 1); sel = -1; draw();
    }
  });
  root.querySelector("#ag-add").addEventListener("click", () => add([WIDTH / 2, 1.2]));
  root.querySelector("#ag-clear").addEventListener("click", () => { guards.length = 0; sel = -1; draw(); });
  draw();
  return () => {};
}

/* ------------------------------------------------------------------ eggs */
export function eggs(root, { t, q }) {
  const FLOORS = q.floors, EGGS = Number(q.eggs);
  let crit, left, drops, log, lo, hi, done;
  const fresh = () => {
    crit = Math.floor(Math.random() * (FLOORS + 1));   // highest floor from which an egg survives, 0 to FLOORS
    left = EGGS; drops = 0; log = []; lo = 0; hi = FLOORS + 1; done = false;
  };
  root.innerHTML = `
    <p class="act-help">${t(`Touche un étage pour y lâcher un œuf. Un œuf intact peut resservir, un œuf brisé non. Tu as ${EGGS} œufs. Cherche l’étage critique : le plus haut étage d’où un œuf ne se brise pas (0 s’il se brise dès l’étage 1).`, `Tap a floor to drop an egg from it. An intact egg can be reused, a broken one cannot. You have ${EGGS} eggs. Find the critical floor: the highest floor from which an egg does not break (0 if it breaks from floor 1).`)}</p>
    <div class="egg-status" id="eg-status" aria-hidden="true"></div>
    <div class="egg-grid" id="eg-grid" role="group" aria-label="${t(`Immeuble de ${FLOORS} étages`, `Building with ${FLOORS} floors`)}"></div>
    <div class="act-controls">
      <label class="act-field act-number" for="eg-guess"><span class="act-label">${t("Étage critique annoncé", "Announced critical floor")}</span><input id="eg-guess" type="number" min="0" max="${FLOORS}" inputmode="numeric"></label>
      <button class="btn btn-secondary" id="eg-say" type="button">${t("Annoncer", "Announce")}</button>
      <button class="btn-quiet" id="eg-new" type="button">${t("Nouvelle partie", "New game")}</button>
    </div>
    <p class="act-readout" id="eg-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#eg-grid"), status = root.querySelector("#eg-status"), read = root.querySelector("#eg-read");
  function draw(msg = "") {
    status.innerHTML = Array.from({ length: EGGS }, (_, i) => i).map((i) => `<span class="egg ${i < left ? "ok" : "broken"}" title="${i < left ? t("intact", "intact") : t("brisé", "broken")}"></span>`).join("");
    grid.replaceChildren();
    for (let f = FLOORS; f >= 1; f--) {
      const info = log.find((l) => l.f === f);
      const b = document.createElement("button");
      b.type = "button";
      b.className = `floor${info ? (info.broke ? " broke" : " safe") : f > lo && f < hi ? " maybe" : ""}`;
      b.textContent = f;
      b.dataset.f = f;
      b.disabled = done || left === 0 || !!info;
      b.setAttribute("aria-label", `${t("Étage", "Floor")} ${f}${info ? `, ${info.broke ? t("l’œuf s’est brisé", "the egg broke") : t("l’œuf est intact", "the egg survived")}` : ""}`);
      grid.append(b);
    }
    // 10 floors per row, floor 100 at the top left to 91, and so on down to 1 at the bottom right
    const certain = hi - lo - 1;
    read.innerHTML = `${t("Lancers", "Drops")} : <strong>${drops}</strong> · ${t("œufs intacts", "intact eggs")} : <strong>${left}</strong>. ${
      lo === 0 && hi === FLOORS + 1 ? "" : `${t("L’étage critique est entre", "The critical floor is between")} ${lo} ${t("et", "and")} ${hi - 1}${certain === 0 ? ` ${t("(un seul candidat)", "(one candidate only)")}` : ""}.`} ${msg}`.trim();
    root.querySelector("#eg-say").disabled = done;
    root.querySelector("#eg-guess").disabled = done;   // the verdict belongs to the announced value: no editing it afterwards
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b || done || left === 0) return;
    const f = Number(b.dataset.f), broke = f > crit;
    drops += 1;
    log.push({ f, broke });
    if (broke) { left -= 1; hi = Math.min(hi, f); } else lo = Math.max(lo, f);
    let msg = broke ? t(`Étage ${f} : l’œuf se brise.`, `Floor ${f}: the egg breaks.`) : t(`Étage ${f} : l’œuf ne se brise pas.`, `Floor ${f}: the egg survives.`);
    if (left === 0) msg += ` ${t("Plus d’œuf : annonce ton étage ou recommence.", "No eggs left: announce your floor or start again.")}`;
    draw(msg);
  });
  root.querySelector("#eg-say").addEventListener("click", () => {
    const v = Number(root.querySelector("#eg-guess").value);
    if (!Number.isInteger(v) || v < 0 || v > FLOORS || root.querySelector("#eg-guess").value === "") { draw(t(`Entre un entier de 0 à ${FLOORS}.`, `Enter an integer from 0 to ${FLOORS}.`)); return; }
    done = true;
    const open = hi - lo - 1;   // floors still undecided after the drops
    const why = open > 0 ? ` ${t(`Il restait ${open + 1} candidats (${lo} à ${hi - 1}) : ton plan n’avait pas assez de lancers ou d’œufs pour trancher, c’était un pari.`, `${open + 1} candidates were left (${lo} to ${hi - 1}): your plan did not have enough drops or eggs to decide, so it was a guess.`)}` : "";
    draw(v === crit ? t(`Tu as annoncé ${v} : exact, l’étage critique est ${crit}. Tu as utilisé ${drops} lancers.`, `You announced ${v}: correct, the critical floor is ${crit}. You used ${drops} drops.`) + why : t(`Tu as annoncé ${v} : faux, l’étage critique était ${crit}.`, `You announced ${v}: wrong, the critical floor was ${crit}.`) + why);
  });
  root.querySelector("#eg-new").addEventListener("click", () => { fresh(); root.querySelector("#eg-guess").value = ""; draw(); });
  fresh();
  draw();
  return () => {};
}

/* ----------------------------------------------------------------- hanoi */
export function hanoi(root, { t, reduced, q }) {
  const W = 480, H = 250, PEG = [90, 240, 390], BASE = 220, DH = 20;
  let n = Math.min(q.n, 8), pegs, moves, from = null, best = {};
  const reset = () => { pegs = [Array.from({ length: n }, (_, i) => n - i), [], []]; moves = 0; from = null; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis une tige de départ puis une tige d’arrivée pour déplacer le disque du dessus. Un disque ne se pose jamais sur un disque plus petit.", "Pick a source peg then a target peg to move the top disk. A disk never sits on a smaller disk.")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Trois tiges et des disques", "Three pegs and some disks")}"></svg>
    <div class="act-buttons hn-pegs" role="group" aria-label="${t("Tiges", "Pegs")}">
      ${[1, 2, 3].map((i) => `<button class="btn btn-secondary hn-peg" data-peg="${i - 1}" type="button" aria-pressed="false">${t("Tige", "Peg")} ${i}</button>`).join("")}
    </div>
    <div class="act-controls">
      <label class="act-field" for="hn-n"><span class="act-label">${t("Nombre de disques", "Number of disks")} <output id="hn-out"></output></span><input id="hn-n" type="range" min="1" max="8" step="1" value="${n}"></label>
      <button class="btn-quiet" id="hn-undo" type="button">${t("Annuler le dernier coup", "Undo last move")}</button>
      <button class="btn-quiet" id="hn-reset" type="button">${t("Recommencer", "Restart")}</button>
    </div>
    <p class="act-readout" id="hn-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#hn-read"), history = [];
  function draw(msg = "") {
    svg.replaceChildren();
    svgEl("rect", { x: 20, y: BASE, width: W - 40, height: 8, rx: 4, class: "hn-base" }, svg);
    PEG.forEach((x, i) => {
      svgEl("rect", { x: x - 4, y: BASE - DH * 8.4, width: 8, height: DH * 8.4, rx: 4, class: `hn-pole${from === i ? " from" : ""}` }, svg);
      pegs[i].forEach((d, k) => {
        const w = 26 + d * 16, y = BASE - DH * (k + 1);
        const lift = from === i && k === pegs[i].length - 1;
        svgEl("rect", { x: x - w / 2, y: lift ? y - 22 : y, width: w, height: DH - 3, rx: 6, class: "hn-disk", style: `fill:${colour(d - 1)}` }, svg);
      });
    });
    root.querySelector("#hn-out").textContent = n;
    root.querySelectorAll(".hn-peg").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.peg) === from)));
    const done = pegs[1].length === n || pegs[2].length === n;
    const bt = best[n] ? ` ${t("Meilleur essai", "Best try")} : ${best[n]}.` : "";
    read.innerHTML = `${t("Coups", "Moves")} : <strong>${moves}</strong>.${done ? ` ${t("Pile déplacée en", "Stack moved in")} ${moves} ${t("coups.", "moves.")}` : ""}${bt} ${msg}`.trim();
  }
  function pick(i) {
    if (from === null) {
      if (!pegs[i].length) return draw(t("Cette tige est vide.", "That peg is empty."));
      from = i; return draw(t(`Disque ${pegs[i].at(-1)} soulevé. Choisis la tige d’arrivée.`, `Disk ${pegs[i].at(-1)} lifted. Choose the target peg.`));
    }
    if (i === from) { from = null; return draw(); }
    const d = pegs[from].at(-1);
    if (pegs[i].length && pegs[i].at(-1) < d) { const msg = t("Interdit : un disque ne se pose pas sur un plus petit.", "Not allowed: a disk cannot sit on a smaller one."); from = null; return draw(msg); }
    pegs[i].push(pegs[from].pop()); history.push([from, i]); from = null; moves += 1;
    const done = pegs[1].length === n || pegs[2].length === n;
    if (done) best[n] = Math.min(best[n] ?? Infinity, moves);
    draw();
  }
  root.querySelectorAll(".hn-peg").forEach((b) => b.addEventListener("click", () => pick(Number(b.dataset.peg))));
  svg.addEventListener("click", (e) => { const p = toLocal(svg, e); pick(PEG.reduce((bi, x, i) => (Math.abs(x - p.x) < Math.abs(PEG[bi] - p.x) ? i : bi), 0)); });
  root.querySelector("#hn-n").addEventListener("input", (e) => { n = Number(e.target.value); history.length = 0; reset(); draw(); });
  root.querySelector("#hn-reset").addEventListener("click", () => { history.length = 0; reset(); draw(); });
  root.querySelector("#hn-undo").addEventListener("click", () => {
    const m = history.pop(); if (!m) return;
    pegs[m[0]].push(pegs[m[1]].pop()); moves -= 1; from = null; draw();
  });
  void reduced;
  reset();
  draw();
  return () => {};
}

/* ---------------------------------------------------------------- ramsey */
export function ramsey(root, { t, q }) {
  const W = 340, H = 340, CX = 170, CY = 170, R = 130, S = Number(q.s), NMAX = S === 3 ? 6 : 9;
  let n = Math.min(NMAX, S === 3 ? 6 : 8);
  const col = new Map();   // "i-j" -> 1 (friends) | 2 (strangers)
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  root.innerHTML = `
    <p class="act-help">${t(`Chaque trait relie deux personnes. Touche un trait pour le faire passer de « pas encore décidé » à « amis » (plein, bleu), puis « pas amis » (pointillé, orange), puis de nouveau « pas décidé ». Cherche à éviter trois amis et ${S === 3 ? 'trois' : 'quatre'} inconnus.`, `Each line joins two people. Tap a line to turn it from “undecided” to “friends” (solid, blue), then “not friends” (dashed, orange), then back to “undecided”. Try to avoid three friends and ${S === 3 ? 'three' : 'four'} strangers.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Personnes reliées deux à deux", "People joined in pairs")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="rm-n"><span class="act-label">${t("Nombre de personnes", "Number of people")} <output id="rm-out"></output></span><input id="rm-n" type="range" min="3" max="${NMAX}" step="1" value="${n}"></label>
      <button class="btn btn-secondary" id="rm-rand" type="button">${t("Colorier au hasard", "Colour at random")}</button>
      <button class="btn-quiet" id="rm-clear" type="button">${t("Tout effacer", "Clear all")}</button>
    </div>
    <p class="act-readout" id="rm-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#rm-read");
  const pos = (i) => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; };
  // one-colour groups: triangles of friends (colour 1), and groups of S strangers (colour 2)
  const groups = () => {
    const out = [], ok = (vs, x) => vs.every((a, i) => vs.slice(i + 1).every((b) => col.get(key(a, b)) === x));
    const rec = (start, vs, size, x) => { if (vs.length === size) { if (ok(vs, x)) out.push([...vs, x]); return; } for (let v = start; v < n; v++) rec(v + 1, [...vs, v], size, x); };
    rec(0, [], 3, 1); rec(0, [], S, 2);
    return out;
  };
  function draw(msg = "") {
    svg.replaceChildren();
    const mono = groups();
    mono.forEach((g) => { const x = g.at(-1), vs = g.slice(0, -1); svgEl("polygon", { points: vs.map((i) => pos(i).join(",")).join(" "), class: `rm-tri c${x}` }, svg); });
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const [x1, y1] = pos(a), [x2, y2] = pos(b), c = col.get(key(a, b)) || 0;
      const g = svgEl("g", { class: `rm-edge c${c}`, "data-e": key(a, b), tabindex: 0, role: "button", "aria-label": `${t("Personnes", "People")} ${a + 1} ${t("et", "and")} ${b + 1} : ${[t("pas décidé", "undecided"), t("amis", "friends"), t("pas amis", "not friends")][c]}` }, svg);
      svgEl("line", { x1, y1, x2, y2, class: "hit" }, g);
      svgEl("line", { x1, y1, x2, y2, class: "ln" }, g);
    }
    for (let i = 0; i < n; i++) {
      const [x, y] = pos(i);
      svgEl("circle", { cx: x, cy: y, r: 15, class: "rm-node" }, svg);
      svgEl("text", { x, y: y + 5, "text-anchor": "middle", class: "rm-label" }, svg).textContent = i + 1;
    }
    const total = (n * (n - 1)) / 2, painted = col.size, blue = mono.filter((m) => m.at(-1) === 1).length, orange = mono.length - blue;
    root.querySelector("#rm-out").textContent = n;
    read.innerHTML = `${painted} / ${total} ${t("traits décidés", "lines decided")}. ${t("Trios d’amis", "Friend trios")} : <strong>${blue}</strong> · ${S === 3 ? t("trios sans amis", "stranger trios") : t("groupes de 4 inconnus", "groups of 4 strangers")} : <strong>${orange}</strong>.${painted === total && !mono.length ? ` ${t("Aucun groupe interdit n’apparaît.", "No forbidden group appears.")}` : ""} ${msg}`.trim();
  }
  const cycle = (k) => { const c = col.get(k) || 0; if (c === 2) col.delete(k); else col.set(k, c + 1); draw(); svg.querySelector(`[data-e="${k}"]`)?.focus(); };
  svg.addEventListener("click", (e) => { const g = e.target.closest("[data-e]"); if (g) cycle(g.dataset.e); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.("[data-e]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cycle(g.dataset.e); } });
  root.querySelector("#rm-n").addEventListener("input", (e) => { n = Number(e.target.value); col.clear(); draw(); });
  root.querySelector("#rm-rand").addEventListener("click", () => { col.clear(); for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) col.set(key(a, b), 1 + Math.floor(Math.random() * 2)); draw(); });
  root.querySelector("#rm-clear").addEventListener("click", () => { col.clear(); draw(); });
  draw();
  return () => {};
}

/* ------------------------------------------------------------ konigsberg */
export function konigsberg(root, { t, q }) {
  const W = 520, H = 300, graph = graphFor(q.g), pos = layoutOf(graph), E = graph.edges.length;
  const state = { removed: new Set(), walk: [], at: null, mode: "walk" };
  root.innerHTML = `
    <p class="act-help">${t(`${graph.names.length} quartiers (${graph.names.join(", ")}) reliés par ${E} ponts. Mode promenade : touche un pont pour le traverser, puis un autre pont qui part de là où tu es. Mode retrait : touche un pont pour le supprimer ou le rétablir.`, `${graph.names.length} districts (${graph.names.join(", ")}) joined by ${E} bridges. Walk mode: tap a bridge to cross it, then another bridge leaving the district you are in. Removal mode: tap a bridge to remove or restore it.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Quartiers et ponts", "Districts and bridges")}"></svg>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Mode", "Mode")}</legend>
        <label><input type="radio" name="kb-mode" value="walk" checked> ${t("Promenade", "Walk")}</label>
        <label><input type="radio" name="kb-mode" value="remove"> ${t("Retrait de ponts", "Remove bridges")}</label></fieldset>
      <button class="btn-quiet" id="kb-undo" type="button">${t("Annuler un pont", "Undo a bridge")}</button>
      <button class="btn-quiet" id="kb-reset" type="button">${t("Recommencer", "Start over")}</button>
    </div>
    <p class="act-readout" id="kb-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#kb-read"), nm = (i) => graph.names[i];
  const used = () => new Set(state.walk.map((w) => w.i));
  function draw(msg = "") {
    svg.replaceChildren();
    const u = used();
    graph.edges.forEach((b, i) => {
      const { d, mid } = bridgeGeom(graph, i, pos), gone = state.removed.has(i), crossed = u.has(i);
      const g = svgEl("g", { class: `kb-bridge${gone ? " gone" : ""}${crossed ? " crossed" : ""}`, "data-b": i, tabindex: 0, role: "button", "aria-label": `${t("Pont", "Bridge")} ${i + 1}, ${nm(b[0])} ${t("à", "to")} ${nm(b[1])}${gone ? `, ${t("retiré", "removed")}` : crossed ? `, ${t("traversé", "crossed")}` : ""}` }, svg);
      svgEl("path", { d, class: "hit" }, g);
      svgEl("path", { d, class: "ln" }, g);
      if (crossed) {
        const k = state.walk.findIndex((w) => w.i === i) + 1;
        svgEl("circle", { cx: mid[0], cy: mid[1], r: 11, class: "num-bg" }, svg);
        svgEl("text", { x: mid[0], y: mid[1] + 4, "text-anchor": "middle", class: "num" }, svg).textContent = k;
      }
    });
    graph.names.forEach((name, v) => {
      const [x, y] = pos[v];
      svgEl("circle", { cx: x, cy: y, r: 22, class: `kb-land${state.at === v ? " here" : ""}` }, svg);
      svgEl("text", { x, y: y + 6, "text-anchor": "middle", class: "kb-name" }, svg).textContent = name;
    });
    const total = E - state.removed.size, k = state.walk.length;
    let status = `${t("Ponts restants", "Bridges left")} : <strong>${total}</strong> · ${t("traversés", "crossed")} : <strong>${k}</strong>.`;
    if (state.at !== null) {
      const free = graph.edges.filter((b, i) => !state.removed.has(i) && !u.has(i) && (b[0] === state.at || b[1] === state.at)).length;
      status += ` ${t("Tu es en", "You are in")} ${nm(state.at)}.`;
      if (k === total) status += ` ${t("Tous les ponts restants sont traversés exactement une fois.", "Every remaining bridge is crossed exactly once.")}`;
      else if (!free) status += ` ${t(`Bloqué : aucun pont libre ne part de ${nm(state.at)}, il en reste ${total - k}.`, `Stuck: no free bridge leaves ${nm(state.at)}, ${total - k} remain.`)}`;
    }
    read.innerHTML = `${status} ${msg}`.trim();
  }
  function tap(i) {
    if (state.mode === "remove") { state.removed.has(i) ? state.removed.delete(i) : state.removed.add(i); state.walk = []; state.at = null; return draw(); }
    if (state.removed.has(i)) return draw(t("Ce pont est retiré.", "That bridge is removed."));
    if (used().has(i)) return draw(t("Pont déjà traversé.", "Bridge already crossed."));
    const [a, b] = graph.edges[i];
    if (state.at === null) { state.at = b; state.walk.push({ i, from: a }); return draw(t(`Départ de ${nm(a)}.`, `Start from ${nm(a)}.`)); }
    if (state.at !== a && state.at !== b) return draw(t(`Ce pont ne part pas de ${nm(state.at)}.`, `That bridge does not leave ${nm(state.at)}.`));
    const from = state.at; state.at = from === a ? b : a; state.walk.push({ i, from }); draw();
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest("[data-b]"); if (g) tap(Number(g.dataset.b)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.("[data-b]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tap(Number(g.dataset.b)); } });
  root.querySelectorAll("[name=kb-mode]").forEach((r) => r.addEventListener("change", () => { state.mode = r.value; draw(); }));
  root.querySelector("#kb-undo").addEventListener("click", () => { const w = state.walk.pop(); if (w) state.at = state.walk.length ? w.from : null; draw(); });
  root.querySelector("#kb-reset").addEventListener("click", () => { state.walk = []; state.at = null; state.removed.clear(); draw(); });
  draw();
  return () => {};
}

/* -------------------------------------------------------------- josephus */
export function josephus(root, { t, reduced, q }) {
  const W = 360, H = 360, CX = 180, CY = 180, K = Number(q.k);
  let n = q.n, killed, order, timer = 0;
  root.innerHTML = `
    <p class="act-help">${K === 2 ? t("Les personnes sont en cercle. On saute la première, on élimine la deuxième, on saute la troisième, on élimine la quatrième, et ainsi de suite en tournant. Avance pas à pas ou lance la partie.", "People stand in a circle. Skip the first, remove the second, skip the third, remove the fourth, and so on around the circle. Step through or run the whole game.") : t(`Les personnes sont en cercle. On saute ${K - 1} personnes, on élimine la suivante, et ainsi de suite en tournant. Avance pas à pas ou lance la partie.`, `People stand in a circle. Skip ${K - 1} people, remove the next one, and so on around the circle. Step through or run the whole game.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Cercle de personnes numérotées", "Circle of numbered people")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="js-n"><span class="act-label">${t("Nombre de personnes", "Number of people")} <output id="js-out"></output></span><input id="js-n" type="range" min="1" max="100" step="1" value="${n}"></label>
      <div class="act-buttons"><button class="btn btn-secondary" id="js-step" type="button">${t("Éliminer la suivante", "Remove the next one")}</button>
      <button class="btn btn-primary" id="js-run" type="button">${t("Jouer jusqu’au bout", "Play to the end")}</button>
      <button class="btn-quiet" id="js-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    </div>
    <p class="act-readout" id="js-read" role="status" aria-live="polite"></p>
    <p class="act-score" id="js-table"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#js-read");
  const pos = (i) => { const a = ((-90 + (360 * (i - 1)) / n) * Math.PI) / 180, r = 150; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
  const stop = () => { clearInterval(timer); timer = 0; };
  function setup() { stop(); order = josephusOrder(n, K); killed = 0; draw(); }
  function draw() {
    svg.replaceChildren();
    const dead = new Set(order.out.slice(0, killed)), finished = killed >= order.out.length;
    const r = n > 70 ? 4 : n > 45 ? 6 : n > 30 ? 9 : 12;
    for (let i = 1; i <= n; i++) {
      const [x, y] = pos(i), isDead = dead.has(i), win = finished && i === order.last;
      svgEl("circle", { cx: x, cy: y, r: win ? r + 5 : r, class: `js-p${isDead ? " dead" : ""}${win ? " win" : ""}` }, svg);
      if (n <= 45 || win) svgEl("text", { x, y: y + 3.5, "text-anchor": "middle", class: `js-n${isDead ? " dead" : ""}` }, svg).textContent = i;
    }
    root.querySelector("#js-out").textContent = n;
    const left = n - killed;
    read.innerHTML = finished ? `${t("Dernière personne restante", "Last person standing")} : <strong>${order.last}</strong>.` : `${left} ${t(left > 1 ? "personnes restent" : "personne reste", "remain")}${killed ? `. ${t("Dernière éliminée", "Last removed")} : ${order.out[killed - 1]}` : ""}.`;
    root.querySelector("#js-step").disabled = finished;
    root.querySelector("#js-run").disabled = finished;
    root.querySelector("#js-table").textContent = `${t("Survivante pour n = 1, 2, …, 20", "Survivor for n = 1, 2, …, 20")} : ${Array.from({ length: 20 }, (_, k) => josephusOrder(k + 1, K).last).join(", ")}`;
  }
  root.querySelector("#js-n").addEventListener("input", (e) => { n = Number(e.target.value); setup(); });
  root.querySelector("#js-step").addEventListener("click", () => { stop(); if (killed < order.out.length) killed += 1; draw(); });
  root.querySelector("#js-run").addEventListener("click", () => {
    stop();
    if (reduced()) { killed = order.out.length; draw(); return; }
    timer = setInterval(() => { if (killed >= order.out.length) return stop(); killed += 1; draw(); }, n > 45 ? 70 : 140);
  });
  root.querySelector("#js-reset").addEventListener("click", setup);
  setup();
  return stop;
}
void MINUS;
