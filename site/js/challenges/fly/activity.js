// Hands-on activity of the fly challenge: the statement played as an animation (two trains, the fly going back and forth),
// with a trip counter only: no clock, no gap, no graph and no distance (the time and the distance belong in the solution).
import { colour, svgEl, toLocal, goalLine } from "../common/kit.js";
import { installCartoon, cartoonPress } from "../common/cartoon.js";
import { parseFly, meetTime, flyMotion } from "./maths.js";

export function activity(root, { t, q, reduced: reducedPref }) {
  installCartoon();
  const reduced = typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref;
  const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), RUN = 6000;
  let time = 0, playing = false, last = 0, raf = 0, drag = null, blocked = false;
  const pointers = new Set();
  root.innerHTML = `
    ${goalLine(t, `Suis la mouche entre les deux trains.`, `Follow the fly between the two trains.`, "Touche la scène pour lancer ou suspendre la course ; glisse horizontalement pour parcourir le temps. La mouche rebondit à chaque rencontre, sans pause. Ses vitesses et celles des trains sont celles de l’énoncé. Clavier : Espace pour lancer, flèches pour avancer ou reculer, B pour le prochain rebond.", "Tap the scene to play or pause; drag horizontally to scrub time. The fly turns instantly at each encounter, without pausing. Its speed and the trains’ speeds match the statement. Keyboard: Space to play, arrows to scrub, B for the next bounce.")}
    <svg class="act-svg" viewBox="0 0 100 34" tabindex="0" role="group" aria-label="${t("Course interactive : trains et mouche", "Interactive race: trains and fly")}"></svg>
    <details><summary>${t("Lecture et alternatives aux gestes", "Playback and gesture alternatives")}</summary><div class="act-controls"><button class="btn btn-secondary" id="fl-play" type="button"></button><button class="btn-quiet" id="fl-step" type="button">${t("Trajet suivant", "Next leg")}</button><button class="btn-quiet" id="fl-reset" type="button">${t("Recommencer", "Restart")}</button><label>${t("Vitesse de lecture", "Playback speed")}<select id="fl-rate"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div></details>
    <p class="act-readout" id="fl-read" role="status" aria-live="polite"></p>`;
  const scene = root.querySelector("svg"), read = root.querySelector("#fl-read"), playBtn = root.querySelector("#fl-play");
  scene.style.touchAction = 'pan-y';
  const X = (km) => 8 + (km / D) * 84;
  svgEl('line', { x1: 2, x2: 98, y1: 24, y2: 24, stroke: 'var(--line-strong)', 'stroke-width': .6 }, scene);
  function train(x, dir, i) {
    const g = svgEl("g", { transform: `translate(${x} 0)` }, scene);
    const body = dir > 0 ? "M-12 14h9l3 3v5h-12z" : "M12 14h-9l-3 3v5h12z";
    svgEl("path", { d: body, fill: `color-mix(in srgb, ${colour(i)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 0.4 }, g);
    for (const cx of dir > 0 ? [-9.5, -3.5] : [9.5, 3.5]) svgEl("circle", { cx, cy: 22.5, r: 1.3, fill: "var(--ink)" }, g);
    return g;
  }
  const trains = [train(X(0), 1, 0), train(X(D), -1, 2)];
  const fly = svgEl('g', { class: 'fl-fly' }, scene);
  for (const x of [-1, 1]) svgEl('ellipse', { cx: x, cy: -1.2, rx: 1.2, ry: .7, fill: 'var(--surface)', stroke: 'var(--ink)', 'stroke-width': .25 }, fly);
  svgEl('path', { d: 'M-2 1L0 0L-2 -1', fill: 'none', stroke: 'var(--ink)', 'stroke-width': .35 }, fly);
  svgEl('circle', { r: 1, fill: 'var(--ink)' }, fly);
  function draw() {
    const motion = flyMotion(D, v1, v2, w, time), [x1, x2, f] = motion.positions;
    const done = motion.completed, met = time >= T;
    trains[0].setAttribute('transform', `translate(${X(x1)} 0)`); trains[1].setAttribute('transform', `translate(${X(x2)} 0)`);
    fly.setAttribute('transform', `translate(${X(f)} 19.5) scale(${motion.direction || 1} 1)`);
    scene.dataset.time = String(time); scene.dataset.fly = String(f); scene.dataset.legs = met ? '∞' : String(done);
    playBtn.textContent = playing ? t("Pause", "Pause") : met ? t("Rejouer", "Replay") : t("Lancer", "Play");
    read.innerHTML = `${t("Trajets terminés : ", "Legs completed: ")}<strong>${met ? t("une infinité", "infinitely many") : done}</strong>${met ? ` · <strong>${t("les trains se rencontrent", "the trains meet")}</strong>` : ""}`;
  }
  const tick = (now) => {
    if (!playing) return;
    time = Math.min(T, time + (Math.min(100, Math.max(0, now - last)) / RUN) * T * Number(root.querySelector('#fl-rate').value)); last = now;
    if (time >= T) playing = false;
    draw();
    if (playing) raf = requestAnimationFrame(tick);
  };
  const play = () => {
    cancelAnimationFrame(raf);
    if (time >= T) time = 0;
    if (reduced) { time = Math.min(T, time + T / 6); draw(); return; }
    playing = !playing; last = performance.now(); draw();
    if (playing) raf = requestAnimationFrame(tick);
  };
  playBtn.addEventListener('click', play);
  const nextLeg = () => { playing = false; cancelAnimationFrame(raf); const m = flyMotion(D, v1, v2, w, Math.min(T, time + T * 1e-12)); time = Math.min(T, m.nextTime ?? T); draw(); };
  root.querySelector("#fl-step").addEventListener("click", nextLeg);
  root.querySelector("#fl-reset").addEventListener("click", () => { playing = false; cancelAnimationFrame(raf); time = 0; draw(); });
  scene.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; pointers.add(e.pointerId); if (pointers.size > 1) { blocked = true; drag = null; playing = false; cancelAnimationFrame(raf); draw(); return; } if (blocked) return; const p = toLocal(scene, e); drag = { x: p.x, time, moved: false, playing, pointer: e.pointerId }; playing = false; cancelAnimationFrame(raf); scene.setPointerCapture?.(e.pointerId); scene.focus(); });
  scene.addEventListener('pointermove', (e) => { if (!drag || drag.pointer !== e.pointerId || blocked) return; const p = toLocal(scene, e); if (Math.abs(p.x - drag.x) > 1) drag.moved = true; if (drag.moved) { time = Math.max(0, Math.min(T, drag.time + (p.x - drag.x) / 84 * T)); draw(); } });
  scene.addEventListener('pointerup', (e) => { pointers.delete(e.pointerId); if (blocked) { if (!pointers.size) blocked = false; return; } if (!drag || drag.pointer !== e.pointerId) return; const old = drag; drag = null; if (!old.moved) { playing = old.playing; play(); } });
  for (const name of ['pointercancel', 'lostpointercapture']) scene.addEventListener(name, (e) => { pointers.delete(e.pointerId); if (!pointers.size) blocked = false; if (drag?.pointer === e.pointerId) { drag = null; playing = false; draw(); } });
  scene.addEventListener('view-gesture', () => { blocked = true; drag = null; playing = false; cancelAnimationFrame(raf); draw(); });
  scene.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); play(); } else if (e.key.toLowerCase() === 'b') { nextLeg(); } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); playing = false; cancelAnimationFrame(raf); time = e.key === 'Home' ? 0 : e.key === 'End' ? T : Math.max(0, Math.min(T, time + (e.key === 'ArrowRight' ? 1 : -1) * T / 100)); draw(); } });
  draw();
  const offPress = cartoonPress(root, reducedPref);
  return () => { playing = false; cancelAnimationFrame(raf); offPress(); };
}
