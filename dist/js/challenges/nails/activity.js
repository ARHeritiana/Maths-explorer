// Hands-on activity of the nails challenge: a picture hangs on a wall from a rope wound around the nails. Add turns (buttons or a
// stroke drawn around the nails), watch the rope wind turn by turn beside its word (tile j is turn j, both light up together),
// then pull a nail out: it comes off the wall, the turns around it slip off, neighbouring turns X X⁻¹ unwind, and the picture
// either falls to the floor or stays. Hint actions add the table of every choice of removed nails; the activity never states the
// shortest winding. Drawings in art.js, mathematics in maths.js.
import { colour, onHintAction, svgEl, toLocal } from "../common/kit.js";
import { parseNails, NAMES, falls, remaining, reduce, wordText, popcount, letter } from "./maths.js";
import { NAIL_Y, nailX, FRAME, rope, drawRope, drawWall, drawNail, drawPicture, fallPose } from "./art.js";

const STYLE = `
.nl-stage{display:grid;gap:12px}
.nl-stage .act-svg{width:100%;height:auto;max-height:72vh;border:1px solid var(--line-strong);touch-action:none;display:block}
.nl-side{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px 20px;min-width:0}.nl-side>div{display:grid;gap:8px;align-content:start;min-width:0}
.nl-side h4{margin:0;font-size:1rem}
.nl-word{display:flex;flex-wrap:wrap;gap:6px;min-height:46px;align-items:center}
.nl-tile{min-width:44px;min-height:44px;padding:0 8px;border:2px solid var(--c);background:color-mix(in srgb,var(--c) 18%,var(--surface));color:var(--ink);font:700 1.1rem/1 var(--math);cursor:pointer;transition:opacity .3s,transform .3s}
.nl-tile.is-hot{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.nl-tile.is-erased{opacity:.35;text-decoration:line-through;border-style:dashed}
.nl-tile.is-cancelled{opacity:.3;transform:scale(.85);border-style:dotted}
.nl-empty{color:var(--muted);font-style:italic}
.nl-calc{margin:0;font-family:var(--math);font-size:1.05rem;overflow-wrap:anywhere}
.nl-palette{display:flex;flex-wrap:wrap;gap:6px}
.nl-palette button,.nl-play button{min-height:44px}
.nl-play{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.nl-play output{font-variant-numeric:tabular-nums;color:var(--muted)}
.nl-pulls{display:flex;flex-wrap:wrap;gap:6px}
.nl-pulls button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.nl-table table{border-collapse:collapse;font-size:.95rem}.nl-table td,.nl-table th{border:1px solid var(--line);padding:4px 8px;text-align:left}
.nl-table .nl-bad td{background:var(--neg-soft)}

@media (prefers-reduced-motion:reduce){.nl-tile{transition:none}}`;

export function activity(root, { t, q, reduced: reducedPref }) {
  const reduced = typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref;
  const [n, k] = parseNails(q.nails), W = 100, H = 100, nx = (i) => nailX(i, n), ny = NAIL_Y;
  let word = [], removed = 0, level = 0, raf = 0, gesture = null, blocked = false, notice = "", hot = -2, upTo = Infinity, playing = 0;
  // what is drawn: turn j slipped (collapse), nails pulled out, the fall, a sway when the picture holds, tiles marked
  let show = { collapse: [], pull: Array(n).fill(0), fall: 1, sway: 0, erased: new Set(), cancelled: new Set() };
  const pointers = new Set();
  root.innerHTML = `<style>${STYLE}</style>
    <p class="act-help">${t("Ajoute des tours de ficelle autour des clous (boutons, ou trace une boucle autour des clous), puis touche un clou pour l’arracher du mur : le tableau tient-il ?", "Add turns of string around the nails (buttons, or draw a loop around the nails), then tap a nail to pull it out of the wall: does the picture hold?")}</p>
    <div class="nl-stage">
      <svg class="act-svg" viewBox="0 0 ${W} ${H}" tabindex="0" role="group" aria-label="${t("Mur, clous, ficelle et tableau", "Wall, nails, string and picture")}"></svg>
      <div class="nl-side"><div>
        <h4>${t("Le mot de l’enroulement", "The word of the winding")}</h4>
        <div class="nl-word" role="list" aria-label="${t("Tours, dans l’ordre", "Turns, in order")}"></div>
        <p class="nl-calc" aria-live="polite"></p>
        <div class="nl-play"><button class="secondary" type="button" id="nl-replay">${t("Rejouer l’enroulement", "Replay the winding")}</button><button class="secondary" type="button" id="nl-prev" aria-label="${t("Tour précédent", "Previous turn")}">◀</button><button class="secondary" type="button" id="nl-next" aria-label="${t("Tour suivant", "Next turn")}">▶</button><output id="nl-step"></output></div>
        </div><div>
        <h4>${t("Ajouter un tour", "Add a turn")}</h4>
        <div class="nl-palette nl-turns">${NAMES.slice(0, n).map((N, i) => `<button class="secondary" type="button" data-c="${i + 1}" style="border-color:${colour(i)}" aria-label="${t(`Un tour autour de ${N} dans le sens des aiguilles d’une montre`, `A clockwise turn around ${N}`)}">↻ ${N}</button><button class="secondary" type="button" data-c="${-(i + 1)}" style="border-color:${colour(i)}" aria-label="${t(`Un tour autour de ${N} dans l’autre sens`, `An anticlockwise turn around ${N}`)}">↺ ${N}</button>`).join("")}<button class="btn-quiet" id="nl-undo" type="button">${t("Annuler le dernier tour", "Undo last turn")}</button><button class="btn-quiet" id="nl-clear" type="button">${t("Tout défaire", "Unwind all")}</button></div>
        <h4>${t("Arracher un clou", "Pull out a nail")}</h4>
        <div class="nl-pulls nl-remove" role="group" aria-label="${t("Clous retirés", "Removed nails")}">${NAMES.slice(0, n).map((N, i) => `<button class="btn-quiet" type="button" data-r="${i}" aria-pressed="false">${t("Clou", "Nail")} ${N}</button>`).join("")}</div>
      </div></div>
    </div>
    <details class="nl-tools"><summary>${t("Clavier et lecture du dessin", "Keyboard and how to read the drawing")}</summary><p>${t("Tab atteint chaque clou ; Entrée ou Espace l’arrache ou le remet. Un tour A (↻) monte à gauche du clou, passe par-dessus et redescend à droite, puis repasse dessous ; A⁻¹ (↺) fait le même tour dans l’autre sens. Là où la ficelle se croise, le tour le plus récent passe devant. La tête du clou est toujours devant la ficelle.", "Tab reaches each nail; Enter or Space pulls it out or puts it back. A turn A (↻) goes up the left of the nail, over it and down the right, then back underneath; A⁻¹ (↺) makes the same turn the other way. Where the string crosses itself, the more recent turn is in front. The nail head is always in front of the string.")}</p></details>
    <p class="act-readout" id="nl-read" role="status" aria-live="polite"></p>
    <div class="nl-table" id="nl-table" hidden></div>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#nl-read"), table = root.querySelector("#nl-table"), tiles = root.querySelector(".nl-word"), calc = root.querySelector(".nl-calc"), stepOut = root.querySelector("#nl-step");

  // the final state for this word and these removed nails: erased turns, cancelled pairs (in the order they cancel), fall
  function target() {
    const erased = new Set(), stack = [], pairs = [];
    word.forEach((c, j) => { if ((removed >> (Math.abs(c) - 1)) & 1) erased.add(j); else if (stack.length && word[stack.at(-1)] === -c) pairs.push([stack.pop(), j]); else stack.push(j); });
    const cancelled = new Set(pairs.flat()), fall = !word.length || stack.length === 0;
    return { erased, pairs, cancelled, fall, left: stack };
  }
  const settle = () => { const T = target(); show = { collapse: word.map((_, j) => (T.erased.has(j) || T.cancelled.has(j) ? 1 : 0)), pull: NAMES.slice(0, n).map((_, i) => ((removed >> i) & 1 ? 1 : 0)), fall: T.fall ? 1 : 0, sway: 0, erased: T.erased, cancelled: T.cancelled }; };

  function draw() {
    const focusNail = svg.contains(document.activeElement) ? document.activeElement.dataset.nail : undefined;
    svg.replaceChildren();
    const pose = fallPose(show.fall), rot = pose.rot + (show.sway ? 2.5 * Math.sin(show.sway * Math.PI * 3) * (1 - show.sway) : 0);
    drawWall(svg, W, H);
    drawPicture(svg, { dy: pose.dy, rot });
    const g = svgEl("g", {}, svg);
    if (word.length) drawRope(g, rope(word, n, { collapse: show.collapse, dy: pose.dy, rot, fall: show.fall }), { upTo, hot });
    for (let i = 0; i < n; i++) drawNail(svg, nx(i), ny, show.pull[i], false);
    for (let i = 0; i < n; i++) {
      const off = (removed >> i) & 1;
      svgEl("text", { x: nx(i), y: 6.5, "text-anchor": "middle", "font-size": 4.4, "font-weight": 700, fill: off ? "var(--muted)" : "var(--ink)", "text-decoration": off ? "line-through" : "" }, svg).textContent = NAMES[i];
      const hit = svgEl("g", { "data-nail": i, tabindex: 0, role: "button", "aria-pressed": String(!!off), "aria-label": `${t(off ? "Remettre le clou" : "Arracher le clou", off ? "Put back nail" : "Pull out nail")} ${NAMES[i]}` }, svg);
      svgEl("circle", { cx: nx(i), cy: ny, r: 4.5, fill: "transparent", stroke: "transparent" }, hit);
    }
    if (gesture?.points.length > 1) svgEl("polyline", { points: gesture.points.map((p) => `${p.x},${p.y}`).join(" "), fill: "none", stroke: "var(--accent)", "stroke-width": 0.8, "stroke-dasharray": "1.5 1", "stroke-linecap": "round" }, svg);
    if (focusNail !== undefined) svg.querySelector(`[data-nail="${focusNail}"]`)?.focus();
    // the word beside the drawing, synchronised with it
    tiles.replaceChildren();
    if (!word.length) { const e = document.createElement("span"); e.className = "nl-empty"; e.textContent = t("aucun tour : le mot vide 1", "no turn: the empty word 1"); tiles.append(e); }
    word.forEach((c, j) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "nl-tile"; b.dataset.j = j; b.setAttribute("role", "listitem");
      b.style.setProperty("--c", colour(Math.abs(c) - 1)); b.textContent = letter(c);
      b.setAttribute("aria-label", `${t("Tour", "Turn")} ${j + 1} : ${NAMES[Math.abs(c) - 1]} ${c > 0 ? t("sens des aiguilles", "clockwise") : t("sens inverse", "anticlockwise")}`.replace(" : ", t(" : ", ": ")));
      if (j === hot) b.classList.add("is-hot"); if (show.erased.has(j)) b.classList.add("is-erased"); if (show.cancelled.has(j)) b.classList.add("is-cancelled");
      tiles.append(b);
    });
    const T = target(), left = remaining(word, removed), off = NAMES.slice(0, n).filter((_, i) => (removed >> i) & 1);
    calc.textContent = !word.length ? "" : removed ? `${wordText(word)}  →  ${t("sans", "without")} ${off.join(", ")} : ${wordText(left)}  →  ${wordText(reduce(left))}`.replace(" : ", t(" : ", ": ")) : `${wordText(word)}  →  ${wordText(reduce(word))}`;
    const drawn = Number.isFinite(upTo) ? Math.max(0, Math.min(word.length, Math.floor(upTo) - 1)) : word.length;
    stepOut.textContent = word.length ? `${t("tour", "turn")} ${drawn} / ${word.length}` : "";
    const fall = T.fall, state = !word.length ? t("La ficelle ne passe autour d’aucun clou : le tableau tombe.", "The string goes round no nail: the picture falls.") : fall ? t("Le tableau tombe !", "The picture falls!") : t("Le tableau tient.", "The picture holds.");
    read.innerHTML = `${t("Tours : ", "Turns: ")}<strong>${word.length}</strong> · ${t("clous retirés : ", "nails removed: ")}<strong>${popcount(removed)}</strong> · ${notice || state}${level >= 1 && word.length ? ` · ${t("mot : ", "word: ")}<strong>${wordText(word)}</strong>${removed ? ` → ${wordText(left)} → ${wordText(reduce(left))}` : ""}` : ""}`;
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(!!(removed & (1 << Number(b.dataset.r))))));
    table.hidden = level < 2;
    if (level >= 2) {
      const rows = [];
      for (let m = 0; m < 1 << n; m++) {
        const offs = NAMES.slice(0, n).filter((_, i) => (m >> i) & 1).join(" ") || "-", r = reduce(remaining(word, m)), want = popcount(m) >= k, got = word.length > 0 && r.length === 0;
        rows.push(`<tr class="${want === got ? "" : "nl-bad"}"><td>${offs}</td><td>${wordText(r)}</td><td>${got ? t("tombe", "falls") : t("tient", "holds")}</td><td>${want ? t("doit tomber", "must fall") : t("doit tenir", "must hold")}</td></tr>`);
      }
      table.innerHTML = `<table><thead><tr><th>${t("Retirés", "Removed")}</th><th>${t("Ce qui reste", "What is left")}</th><th>${t("Tableau", "Picture")}</th><th>${t("Règle", "Rule")}</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
    }
  }

  // phases run one after the other; each moves some numbers of `show` from where they are to where they go
  function run(phases) {
    cancelAnimationFrame(raf);
    if (reduced || !phases.length) { settle(); upTo = Infinity; draw(); return; }
    let idx = 0, start = performance.now(), from = null;
    const begin = () => { const ph = phases[idx]; ph.enter?.(); from = { collapse: show.collapse.slice(), pull: show.pull.slice(), fall: show.fall }; };
    begin();
    const step = (now) => {
      const ph = phases[idx], s = Math.min(1, (now - start) / ph.dur), e = s < 0.5 ? 2 * s * s : 1 - 2 * (1 - s) * (1 - s);
      ph.apply(e, from, s);
      draw();
      if (s >= 1) { idx++; if (idx >= phases.length) { settle(); draw(); return; } start = now; begin(); }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  const P = {
    pull: (i, to) => ({ dur: 420, apply: (e, f) => { show.pull[i] = f.pull[i] + (to - f.pull[i]) * e; } }),
    slip: (idx, mark) => ({ dur: 520, enter: () => idx.forEach((j) => show[mark].add(j)), apply: (e, f) => idx.forEach((j) => { show.collapse[j] = f.collapse[j] + (1 - f.collapse[j]) * e; }) }),
    fall: () => ({ dur: 900, apply: (_, f, s) => { show.fall = f.fall + (1 - f.fall) * s; } }),
    sway: () => ({ dur: 650, apply: (_, __, s) => { show.sway = s; } }),
    all: () => { const T = target(), toC = word.map((_, j) => (T.erased.has(j) || T.cancelled.has(j) ? 1 : 0)), toP = NAMES.slice(0, n).map((_, i) => ((removed >> i) & 1 ? 1 : 0)), toF = T.fall ? 1 : 0;
      return { dur: 380, enter: () => { show.erased = T.erased; show.cancelled = T.cancelled; while (show.collapse.length < word.length) show.collapse.push(toC[show.collapse.length]); show.collapse.length = word.length; }, apply: (e, f) => { show.collapse = toC.map((c, j) => (f.collapse[j] ?? c) + (c - (f.collapse[j] ?? c)) * e); show.pull = toP.map((p, i) => f.pull[i] + (p - f.pull[i]) * e); show.fall = toF ? f.fall + (toF - f.fall) * e : f.fall * (1 - e); } }; },
  };
  // pulling a nail out: it comes off, its turns slip, the pairs X X⁻¹ unwind one after the other, then the picture falls or sways
  function pullOut(i) {
    removed |= 1 << i; notice = ""; upTo = Infinity;
    const T = target(), mine = word.map((c, j) => j).filter((j) => Math.abs(word[j]) === i + 1 && !show.erased.has(j));
    const phases = [P.pull(i, 1)];
    if (mine.length) phases.push(P.slip(mine, "erased"));
    for (const pair of T.pairs) if (!show.cancelled.has(pair[0])) phases.push(P.slip(pair, "cancelled"));
    phases.push(T.fall ? (show.fall >= 1 ? P.sway() : P.fall()) : P.sway());
    run(phases);
  }
  function toggle(i) { if ((removed >> i) & 1) { removed &= ~(1 << i); notice = ""; run([P.all()]); } else pullOut(i); }
  function changed() { upTo = Infinity; notice = ""; run([P.all()]); }
  function addTurns(cs) {
    const before = word.length; word = [...word, ...cs];
    if (reduced || removed) { changed(); return; }
    // the new turns are wound in front of you, then the picture hangs (or stays down) as the rule says
    settle(); show.fall = before ? show.fall : 1; upTo = before + 1; const target2 = word.length + 2, t0 = performance.now(), wasDown = !before;
    cancelAnimationFrame(raf);
    const step = (now) => { const s = Math.min(1, (now - t0) / (380 * cs.length)); upTo = before + 1 + (target2 - before - 1) * s; if (wasDown) show.fall = 1 - s; draw(); if (s < 1) raf = requestAnimationFrame(step); else { upTo = Infinity; settle(); draw(); } };
    raf = requestAnimationFrame(step);
  }
  // replay the winding letter by letter, the tile of the turn being wound lit
  function replay() {
    cancelAnimationFrame(raf); if (!word.length) return;
    if (reduced) { upTo = Infinity; hot = -2; draw(); return; }
    const t0 = performance.now(), total = word.length + 2, dur = 520 * total;
    const step = (now) => { const s = Math.min(1, (now - t0) / dur); upTo = total * s; hot = Math.min(word.length - 1, Math.floor(upTo) - 1); draw(); if (s < 1) raf = requestAnimationFrame(step); else { upTo = Infinity; hot = -2; draw(); } };
    raf = requestAnimationFrame(step);
  }
  function stepTo(d) { if (!word.length) return; cancelAnimationFrame(raf); const cur = Number.isFinite(upTo) ? Math.round(upTo) - 1 : word.length; const next = Math.max(0, Math.min(word.length, cur + d)); upTo = next >= word.length ? Infinity : next + 1; hot = next >= 1 ? next - 1 : -2; if (!Number.isFinite(upTo)) hot = -2; draw(); }

  root.querySelector(".nl-turns").addEventListener("click", (e) => { const c = Number(e.target.closest("[data-c]")?.dataset.c); if (!c) return; addTurns([c]); });
  root.querySelector(".nl-remove").addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (!b) return; toggle(Number(b.dataset.r)); });
  root.querySelector("#nl-undo").addEventListener("click", () => { word = word.slice(0, -1); changed(); });
  root.querySelector("#nl-clear").addEventListener("click", () => { word = []; changed(); });
  root.querySelector("#nl-replay").addEventListener("click", replay);
  root.querySelector("#nl-prev").addEventListener("click", () => stepTo(-1));
  root.querySelector("#nl-next").addEventListener("click", () => stepTo(1));
  const light = (e) => { const b = e.target.closest?.(".nl-tile"); const j = b ? Number(b.dataset.j) : -2; if (j !== hot) { hot = j; draw(); if (b) tiles.querySelector(`[data-j="${j}"]`)?.focus({ preventScroll: true }); } };
  tiles.addEventListener("pointerover", light); tiles.addEventListener("focusin", (e) => { const j = Number(e.target.dataset?.j); if (Number.isFinite(j) && j !== hot) { hot = j; draw(); tiles.querySelector(`[data-j="${j}"]`)?.focus({ preventScroll: true }); } });
  tiles.addEventListener("pointerleave", () => { if (hot !== -2) { hot = -2; draw(); } });
  tiles.addEventListener("focusout", (e) => { if (!tiles.contains(e.relatedTarget)) { hot = -2; draw(); } });

  // Drawing: ordered crossings of disjoint upward rays from the nails encode the loop, including its inverse. Each stroke is joined
  // to the same point below the nails, so gestures compose as words.
  const base = { x: 50, y: 40 };
  function trace(p) {
    const prev = gesture.points.at(-1), hits = [];
    for (let i = 0; i < n; i++) {
      const x = nx(i), dx = p.x - prev.x, dy = p.y - prev.y;
      const uNear = Math.max(0, Math.min(1, ((x - prev.x) * dx + (ny - prev.y) * dy) / (dx * dx + dy * dy || 1)));
      if (Math.hypot(prev.x + uNear * dx - x, prev.y + uNear * dy - ny) < 1.7) gesture.invalid = true;
      if ((prev.x <= x && p.x > x) || (p.x <= x && prev.x > x)) {
        const u = (x - prev.x) / (p.x - prev.x), y = prev.y + u * (p.y - prev.y);
        if (y < ny) hits.push({ u, c: (p.x > prev.x ? 1 : -1) * (i + 1) });
      }
    }
    hits.sort((a, b) => a.u - b.u).forEach((h) => gesture.turns.push(h.c));
    gesture.points.push(p);
  }
  svg.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    pointers.add(e.pointerId);
    if (pointers.size > 1) { blocked = true; gesture = null; draw(); return; }
    if (blocked) return;
    const p = toLocal(svg, e); notice = "";
    gesture = { id: e.pointerId, points: [base], turns: [], nail: e.target.closest?.("[data-nail]")?.dataset.nail };
    trace(p);
    svg.setPointerCapture?.(e.pointerId); svg.focus();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!gesture || gesture.id !== e.pointerId || blocked) return;
    const p = toLocal(svg, e);
    if (Math.hypot(p.x - gesture.points.at(-1).x, p.y - gesture.points.at(-1).y) < 0.2) return;
    trace(p); draw();
  });
  svg.addEventListener("pointerup", (e) => {
    pointers.delete(e.pointerId);
    if (blocked) { if (!pointers.size) blocked = false; return; }
    if (!gesture || gesture.id !== e.pointerId) return;
    const p = toLocal(svg, e); trace(p);
    const first = gesture.points[1], moved = gesture.points.slice(1).some((q) => Math.hypot(q.x - first.x, q.y - first.y) > 1.5);
    if (!moved && gesture.nail !== undefined) { const i = Number(gesture.nail); gesture = null; toggle(i); return; }
    trace(base);   // the stroke is closed through the base point below the nails, which can cross rays too
    const g = gesture; gesture = null;
    if (g.invalid) { notice = t("Le tracé traverse un clou. Contourne les clous et réessaie.", "The stroke crosses a nail. Go around the nails and try again."); draw(); }
    else if (g.turns.length) addTurns(g.turns); else draw();
  });
  const cancel = (e) => { pointers.delete(e.pointerId); if (!pointers.size) blocked = false; if (gesture?.id === e.pointerId) { gesture = null; draw(); } };
  for (const event of ["pointercancel", "lostpointercapture"]) svg.addEventListener(event, cancel);
  svg.addEventListener("view-gesture", () => { gesture = null; blocked = pointers.size > 0; draw(); });
  svg.addEventListener("keydown", (e) => {
    const nail = e.target.closest?.("[data-nail]");
    if (nail && ["Enter", " "].includes(e.key)) { e.preventDefault(); toggle(Number(nail.dataset.nail)); }
    if (e.key === "Escape") { gesture = null; draw(); }
  });
  settle(); draw();
  const off = onHintAction("nails", { word: () => { level = Math.max(level, 1); draw(); }, table: () => { level = 2; draw(); } });
  return () => { cancelAnimationFrame(raf); gesture = null; pointers.clear(); off(); void FRAME; void falls; void playing; };
}
