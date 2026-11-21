// Hands-on activity of the jugs challenge: in the kitchen of the solution (art.js), fill, empty and pour two jugs with faces
// until one holds the target amount. It never states the method.
import { svgEl, toLocal, lockTouch, goalLine } from "../common/kit.js";
import { animationLoop } from "../../visible-loop.js";
import { COUNTER, TAP_X, SINK_X, WATER, drawKitchen, makeJug, poseJug } from "./art.js";
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
    <svg class="act-svg jg-svg" viewBox="0 0 520 300" role="group" aria-label="${t("Bidons interactifs, robinet et évier", "Interactive jugs, tap and sink")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" id="jg-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet ${PRESS}" id="jg-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="jg-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector(".jg-svg"), read = root.querySelector("#jg-read");
  drawKitchen(svg);
  const REST = [190, 282];
  // the tap and the sink are targets too: transparent hit areas over the drawings, with their names for screen readers
  const destination = (id, label, x, y, w, h) => {
    const g = svgEl('g', { 'data-destination': id, role: 'button', tabindex: 0, 'aria-label': label, class: 'jg-object' }, svg);
    svgEl('rect', { x, y, width: w, height: h, rx: 8, fill: 'transparent' }, g);
    svgEl('text', { x: x + w / 2, y: y + h - 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)' }, g).textContent = label;
    return g;
  };
  destination('tap', t('Robinet', 'Tap'), 10, 6, 110, 92);
  destination('sink', t('Évier', 'Sink'), SINK_X - 52, COUNTER - 6, 104, 46);
  const stream = svgEl('path', { fill: 'none', stroke: WATER, 'stroke-linecap': 'round', 'stroke-width': 6, opacity: 0 }, svg);
  const jugs = [a, b].map((size, i) => {
    const g = svgEl('g', { 'data-jug': i, role: 'button', tabindex: 0, class: 'jg-object' }, svg);
    svgEl('rect', { x: REST[i] - 40, y: 60, width: 80, height: COUNTER - 40, fill: 'transparent' }, g);
    const J = makeJug(g, { size, height: 54 + 76 * (size / cap), i: i ? 2 : 0 });
    return { g, J };
  });
  const ghost = svgEl('path', { d: 'M-22 -40V0H22V-40', fill: 'var(--surface)', stroke: 'var(--object-ink)', 'stroke-width': 3, 'pointer-events': 'none', visibility: 'hidden', opacity: 0.8 }, svg);
  let mood = ['smile', 'smile'], flash = null, clock = 0;
  lockTouch(svg, '[data-jug]');
  function pose() {
    jugs.forEach(({ g, J }, i) => {
      const sel = i === selected, k = flash && flash.i === i ? Math.min(1, (clock - flash.t0) / 0.6) : 1;
      poseJug(J, { x: REST[i], litres: st[i], lift: sel ? 12 : 6 * Math.sin(Math.PI * k) * (k < 1 ? 1 : 0), slosh: reduced ? 0 : 1.2, wave: clock * 8 + i * 2, gaze: selected >= 0 && !sel ? (REST[selected] > REST[i] ? 1 : -1) : 0, mood: sel ? 'o' : mood[i], blink: Math.abs(Math.sin(clock * 0.9 + i * 3)) > 0.995 ? 1 : 0, label: `${st[i]} / ${i ? b : a} L` });
    });
    const on = flash && clock - flash.t0 < 0.6 && flash.path;
    stream.setAttribute('opacity', on ? 0.9 : 0); if (on) stream.setAttribute('d', flash.path);
  }
  function draw() {
    jugs.forEach(({ g }, i) => {
      const size = i ? b : a;
      g.setAttribute('aria-label', t(`Bidon ${i + 1} : ${st[i]} sur ${size} litres. Sélectionner ou verser depuis le bidon sélectionné.`, `Jug ${i + 1}: ${st[i]} of ${size} litres. Select or pour from the selected jug.`));
      g.setAttribute('aria-pressed', String(i === selected));
    });
    pose();
    svg.dataset.state = st.join(',');
    const done = st[0] === target || st[1] === target, n = hist.length - 1;
    root.querySelector("#jg-undo").disabled = n === 0;
    read.innerHTML = `${t("Opérations : ", "Operations: ")}<strong>${n}</strong> · ${selected >= 0 ? t('Bidon sélectionné', 'Selected jug') + ' ' + (selected + 1) : t('Aucun bidon sélectionné', 'No jug selected')}${status ? ' · ' + status : ''}${done ? ` · <strong>${t(`${target} L obtenus !`, `${target} L reached!`)}</strong>` : ""}`;
  }
  function move(m) {
    const n = apply(m, st, a, b);
    status = '';
    if (n[0] === st[0] && n[1] === st[1]) { status = t('Aucun transfert possible : choisis un autre bidon ou une autre destination.', 'No transfer is possible: choose another jug or destination.'); mood = ['flat', 'flat']; draw(); return; }
    const j = m.endsWith('A') && !m.startsWith('pour') ? 0 : m.startsWith('pour') ? (m === 'pourAB' ? 1 : 0) : 1, top = (i) => COUNTER - 6 - (jugs[i].J.height - 6) * (n[i] / (i ? b : a));
    flash = { i: j, t0: clock, path: m.startsWith('fill') ? `M${TAP_X + 10} 64 L${REST[j]} ${top(j)}` : m.startsWith('empty') ? `M${REST[j]} ${COUNTER - jugs[j].J.height} Q${(REST[j] + SINK_X) / 2} ${COUNTER - jugs[j].J.height - 30} ${SINK_X} ${COUNTER + 16}` : `M${REST[1 - j]} ${COUNTER - jugs[1 - j].J.height} Q${(REST[0] + REST[1]) / 2} ${COUNTER - 170} ${REST[j]} ${top(j)}` };
    st = n; hist.push(n); selected = -1;
    mood = [0, 1].map((i) => (st[i] === target ? 'grin' : 'smile'));
    draw();
  }
  const act = (id) => { if (id === 'tap' || id === 'sink') {
    if (selected < 0) { status = t('Touche d’abord le bidon à utiliser.', 'First tap the jug to use.'); draw(); return; }
    move(id === 'tap' ? selected ? 'fillB' : 'fillA' : selected ? 'emptyB' : 'emptyA');
  } else {
    const i = Number(id); if (selected >= 0 && i !== selected) move(selected ? 'pourBA' : 'pourAB');
    else { selected = i === selected ? -1 : i; status = ''; draw(); }
  } };
  const cancel = () => { drag = null; ghost.setAttribute('visibility', 'hidden'); };
  const targetAt = (p) => p.x < 0 || p.x > 520 || p.y < 0 || p.y > 300 ? null : p.x <= 120 && p.y <= 100 ? 'tap' : Math.abs(p.x - SINK_X) <= 52 && p.y >= COUNTER - 10 ? 'sink' : p.y >= 60 && p.y <= COUNTER + 20 && Math.abs(p.x - REST[0]) <= 44 ? '0' : p.y >= 60 && p.y <= COUNTER + 20 && Math.abs(p.x - REST[1]) <= 44 ? '1' : null;
  svg.addEventListener('pointerdown', (e) => { suppressClick = false; const g = e.target.closest('[data-jug]'); if (!g || e.button !== 0) return; if (drag && drag.pointer !== e.pointerId) { cancel(); suppressClick = true; return; } const p = toLocal(svg, e); drag = { jug: Number(g.dataset.jug), p, moved: false, pointer: e.pointerId }; svg.setPointerCapture?.(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (!drag || drag.pointer !== e.pointerId) return; const p = toLocal(svg, e); if (Math.hypot(p.x - drag.p.x, p.y - drag.p.y) > 8) drag.moved = true; if (drag.moved) { ghost.setAttribute('visibility', 'visible'); ghost.setAttribute('transform', `translate(${p.x} ${p.y + 20}) rotate(-20)`); } });
  svg.addEventListener('pointerup', (e) => { if (!drag || drag.pointer !== e.pointerId) return; const old = drag; cancel(); suppressClick = true; if (!old.moved) { act(String(old.jug)); return; } selected = old.jug; const id = targetAt(toLocal(svg, e)); if (id !== null) act(id); else draw(); });
  let suppressClick = false;
  svg.addEventListener('click', (e) => { if (suppressClick) { suppressClick = false; return; } const el = e.target.closest('[data-jug],[data-destination]'); if (el) act(el.dataset.jug ?? el.dataset.destination); });
  for (const name of ['pointercancel', 'lostpointercapture']) svg.addEventListener(name, cancel);
  svg.addEventListener('view-gesture', () => { cancel(); suppressClick = true; });
  svg.addEventListener('keydown', (e) => { const el = e.target.closest('[data-jug],[data-destination]'); if (el && ['Enter', ' '].includes(e.key)) { e.preventDefault(); act(el.dataset.jug ?? el.dataset.destination); } if (e.key === 'Escape') cancel(); });
  root.querySelector("#jg-undo").addEventListener("click", () => { cancel(); status = ''; if (hist.length > 1) { hist.pop(); st = hist.at(-1); draw(); } });
  root.querySelector("#jg-reset").addEventListener("click", () => { cancel(); selected = -1; status = ''; reset(); draw(); });
  reset(); draw();
  // the jugs breathe, blink and slosh while the scene is on screen (nothing runs under reduced motion)
  const loop = typeof globalThis.requestAnimationFrame === 'function' ? animationLoop(svg, (dt) => { clock += dt; pose(); }, { reduced: () => reduced, scope: root }) : { stop() {} };
  return () => { cancel(); loop.stop(); };
}
