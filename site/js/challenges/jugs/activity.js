// Hands-on activity of the jugs challenge: fill, empty and pour two jugs until one holds the target amount. It never states the method.
import { colour, svgEl, toLocal, lockTouch, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { parseJugs, apply } from "./maths.js";

export function activity(root, { t, q, reduced: reducedPref }) {
  installCartoon();
  const reduced = typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref;
  const [a, b, target] = parseJugs(q.jugs), cap = Math.max(a, b);
  let st, hist, selected = -1, drag = null, status = '';
  const reset = () => { st = [0, 0]; hist = [[0, 0]]; };
  root.innerHTML = `
    ${goalLine(t, `Obtiens ${target} L.`, `Get ${target} L.`, `Glisse un bidon vers le robinet pour le remplir, l’évier pour le vider, ou l’autre bidon pour transvaser. Tu peux aussi toucher un bidon, puis sa destination. Clavier : Tab et Entrée sur ces mêmes objets.`, `Drag a jug to the tap to fill it, the sink to empty it, or the other jug to pour. You can also tap a jug, then its destination. Keyboard: Tab and Enter on these same objects.`)}
    <svg class="act-svg jg-svg" viewBox="0 0 100 88" role="group" aria-label="${t("Bidons interactifs, robinet et évier", "Interactive jugs, tap and sink")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" id="jg-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet ${PRESS}" id="jg-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="jg-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector(".jg-svg"), read = root.querySelector("#jg-read");
  function destination(id, label, d, y, h) {
    const g = svgEl('g', { 'data-destination': id, role: 'button', tabindex: 0, 'aria-label': label, class: 'jg-object' }, svg);
    svgEl('rect', { x: 37, y, width: 26, height: h, rx: 3, fill: 'transparent' }, g);
    svgEl('path', { d, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.2 }, g);
    svgEl('text', { x: 50, y: y + h - 1, 'text-anchor': 'middle', 'font-size': 3.2, fill: 'var(--ink)' }, g).textContent = label;
    return g;
  }
  destination('tap', t('Robinet', 'Tap'), 'M43 11V5H53V9H58V13M48 5V2H53', 0, 22);
  destination('sink', t('Évier', 'Sink'), 'M39 72H61L58 80H42ZM50 80V82', 69, 19);
  const jugs = [a, b].map((size, i) => {
    const x = i ? 64 : 14, h = Math.max(12, 38 * size / cap), y = 62 - h;
    const g = svgEl('g', { 'data-jug': i, role: 'button', tabindex: 0, class: 'jg-object' }, svg);
    svgEl('rect', { x: x - 3, y: 23, width: 28, height: 46, rx: 3, fill: 'transparent' }, g);
    const water = svgEl('rect', { x, y: 62, width: 22, height: 0, fill: `color-mix(in srgb, ${colour(i ? 2 : 0)} 55%, var(--surface))`, style: reduced ? '' : 'transition:y .2s,height .2s' }, g);
    const outline = svgEl('path', { d: `M${x} ${y}V62H${x + 22}V${y}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': .8 }, g);
    const label = svgEl('text', { x: x + 11, y: 68, 'text-anchor': 'middle', 'font-size': 4, 'font-weight': 700, fill: 'var(--ink)' }, g);
    return { g, water, outline, label, h };
  });
  const ghost = svgEl('path', { d: 'M-5 -8V6H5V-8', fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 1, 'pointer-events': 'none', visibility: 'hidden' }, svg);
  lockTouch(svg, '[data-jug]');
  function draw() {
    jugs.forEach(({ g, water, outline, label, h }, i) => {
      const size = i ? b : a, lv = h * st[i] / size;
      water.setAttribute('y', 62 - lv); water.setAttribute('height', lv);
      outline.setAttribute('stroke', i === selected ? 'var(--accent)' : 'var(--ink)'); outline.setAttribute('stroke-width', i === selected ? 1.5 : .8);
      label.textContent = `${st[i]} / ${size} L`; g.setAttribute('aria-label', t(`Bidon ${i + 1} : ${st[i]} sur ${size} litres. Sélectionner ou verser depuis le bidon sélectionné.`, `Jug ${i + 1}: ${st[i]} of ${size} litres. Select or pour from the selected jug.`));
      g.setAttribute('aria-pressed', String(i === selected));
    });
    svg.dataset.state = st.join(',');
    const done = st[0] === target || st[1] === target, n = hist.length - 1;
    root.querySelector("#jg-undo").disabled = n === 0;
    read.innerHTML = `${t("Opérations : ", "Operations: ")}<strong>${n}</strong> · ${selected >= 0 ? t('Bidon sélectionné', 'Selected jug') + ' ' + (selected + 1) : t('Aucun bidon sélectionné', 'No jug selected')}${status ? ' · ' + status : ''}${done ? ` · <strong>${t(`${target} L obtenus !`, `${target} L reached!`)}</strong>` : ""}`;
  }
  function move(m) {
    const n = apply(m, st, a, b);
    status = '';
    if (n[0] === st[0] && n[1] === st[1]) { status = t('Aucun transfert possible : choisis un autre bidon ou une autre destination.', 'No transfer is possible: choose another jug or destination.'); draw(); return; }
    st = n; hist.push(n); selected = -1; draw();
  }
  const act = (id) => { if (id === 'tap' || id === 'sink') {
    if (selected < 0) { status = t('Touche d’abord le bidon à utiliser.', 'First tap the jug to use.'); draw(); return; }
    move(id === 'tap' ? selected ? 'fillB' : 'fillA' : selected ? 'emptyB' : 'emptyA');
  } else {
    const i = Number(id); if (selected >= 0 && i !== selected) move(selected ? 'pourBA' : 'pourAB');
    else { selected = i === selected ? -1 : i; status = ''; draw(); }
  } };
  const cancel = () => { drag = null; ghost.setAttribute('visibility', 'hidden'); };
  const targetAt = (p) => p.x < 0 || p.x > 100 || p.y < 0 || p.y > 88 ? null : p.x >= 37 && p.x <= 63 && p.y <= 22 ? 'tap' : p.x >= 37 && p.x <= 63 && p.y >= 69 ? 'sink' : p.y >= 23 && p.y <= 69 && p.x >= 11 && p.x <= 39 ? '0' : p.y >= 23 && p.y <= 69 && p.x >= 61 && p.x <= 89 ? '1' : null;
  svg.addEventListener('pointerdown', (e) => { suppressClick = false; const g = e.target.closest('[data-jug]'); if (!g || e.button !== 0) return; if (drag && drag.pointer !== e.pointerId) { cancel(); suppressClick = true; return; } const p = toLocal(svg, e); drag = { jug: Number(g.dataset.jug), p, moved: false, pointer: e.pointerId }; svg.setPointerCapture?.(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (!drag || drag.pointer !== e.pointerId) return; const p = toLocal(svg, e); if (Math.hypot(p.x - drag.p.x, p.y - drag.p.y) > 2) drag.moved = true; if (drag.moved) { ghost.setAttribute('visibility', 'visible'); ghost.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(-20)`); } });
  svg.addEventListener('pointerup', (e) => { if (!drag || drag.pointer !== e.pointerId) return; const old = drag; cancel(); suppressClick = true; if (!old.moved) { act(String(old.jug)); return; } selected = old.jug; const id = targetAt(toLocal(svg, e)); if (id !== null) act(id); else draw(); });
  let suppressClick = false;
  svg.addEventListener('click', (e) => { if (suppressClick) { suppressClick = false; return; } const el = e.target.closest('[data-jug],[data-destination]'); if (el) act(el.dataset.jug ?? el.dataset.destination); });
  for (const name of ['pointercancel', 'lostpointercapture']) svg.addEventListener(name, cancel);
  svg.addEventListener('view-gesture', () => { cancel(); suppressClick = true; });
  svg.addEventListener('keydown', (e) => { const el = e.target.closest('[data-jug],[data-destination]'); if (el && ['Enter', ' '].includes(e.key)) { e.preventDefault(); act(el.dataset.jug ?? el.dataset.destination); } if (e.key === 'Escape') cancel(); });
  root.querySelector("#jg-undo").addEventListener("click", () => { cancel(); status = ''; if (hist.length > 1) { hist.pop(); st = hist.at(-1); draw(); } });
  root.querySelector("#jg-reset").addEventListener("click", () => { cancel(); selected = -1; status = ''; reset(); draw(); });
  reset(); draw();
  return () => { cancel(); };
}
