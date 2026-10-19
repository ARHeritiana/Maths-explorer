// Hands-on activity of the fly challenge: the statement played as an animation (two trains, the fly going back and forth),
// with a trip counter and the distance flown so far. Hint actions add a clock and a time and position graph; the activity
// never states the total.
import { colour, onHintAction, svgEl } from "../common/kit.js";
import { parseFly, meetTime, legs, positions } from "./maths.js";

export function activity(root, { t, q, reduced, lang }) {
  const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), L = legs(D, v1, v2, w, 1e-9, 400), RUN = 9000;
  const fr = lang === "fr", fmt = (x, d = 1) => { const s = (Math.round(x * 10 ** d) / 10 ** d).toFixed(d); return fr ? s.replace(".", ",") : s; };
  let time = 0, playing = false, last = 0, raf = 0, level = 0;
  root.innerHTML = `
    <p class="act-help">${t("Lance l’animation : la mouche fait l’aller et retour entre les deux trains. Compte les trajets et regarde la distance qu’elle a déjà parcourue.", "Start the animation: the fly goes back and forth between the two trains. Count the trips and watch the distance it has already flown.")}</p>
    <svg class="act-svg" viewBox="0 0 100 34" role="img" aria-label="${t("Deux trains et une mouche", "Two trains and a fly")}"></svg>
    <svg class="act-svg fl-graph" viewBox="0 0 100 46" hidden role="img" aria-label="${t("Graphique temps et position", "Time and position graph")}"></svg>
    <div class="act-controls"><button class="secondary" id="fl-play" type="button"></button><button class="btn-quiet" id="fl-step" type="button">${t("Trajet suivant", "Next leg")}</button><button class="btn-quiet" id="fl-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="fl-read" role="status" aria-live="polite"></p>`;
  const scene = root.querySelector("svg"), graph = root.querySelector(".fl-graph"), read = root.querySelector("#fl-read"), playBtn = root.querySelector("#fl-play");
  const X = (km) => 8 + (km / D) * 84;
  function train(x, dir, i) {
    const g = svgEl("g", { transform: `translate(${x} 0)` }, scene);
    const body = dir > 0 ? "M-12 14h9l3 3v5h-12z" : "M12 14h-9l-3 3v5h12z";
    svgEl("path", { d: body, fill: `color-mix(in srgb, ${colour(i)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 0.4 }, g);
    for (const cx of dir > 0 ? [-9.5, -3.5] : [9.5, 3.5]) svgEl("circle", { cx, cy: 22.5, r: 1.3, fill: "var(--ink)" }, g);
  }
  function draw() {
    const [x1, x2, f] = positions(D, v1, v2, w, time);
    const done = L.filter((l) => l.t1 <= time).length, flown = w * Math.min(time, T), met = time >= T - 1e-12;
    scene.replaceChildren();
    svgEl("line", { x1: 2, x2: 98, y1: 24, y2: 24, stroke: "var(--line-strong)", "stroke-width": 0.6 }, scene);
    train(X(x1), 1, 0); train(X(x2), -1, 2);
    const fx = X(f), fy = 10 + Math.sin(time / T * 60) * 0.8;
    svgEl("ellipse", { cx: fx - 1, cy: fy - 1.2, rx: 1.2, ry: 0.7, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 0.2, opacity: 0.8 }, scene);
    svgEl("ellipse", { cx: fx + 1, cy: fy - 1.2, rx: 1.2, ry: 0.7, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 0.2, opacity: 0.8 }, scene);
    svgEl("circle", { cx: fx, cy: fy, r: 1, fill: "var(--ink)" }, scene);
    svgEl("text", { x: 50, y: 32, "text-anchor": "middle", "font-size": 3.4, fill: "var(--muted)" }, scene).textContent = `${t("écart", "gap")} ${fmt(Math.max(0, x2 - x1))} km`;
    graph.hidden = level < 2;
    if (level >= 2) {
      graph.replaceChildren();
      const Y = (tt) => 4 + (tt / T) * 38;
      svgEl("line", { x1: X(0), y1: Y(0), x2: X(v1 * T), y2: Y(T), stroke: colour(0), "stroke-width": 0.7 }, graph);
      svgEl("line", { x1: X(D), y1: Y(0), x2: X(D - v2 * T), y2: Y(T), stroke: colour(2), "stroke-width": 0.7 }, graph);
      const pts = [[X(0), Y(0)], ...L.filter((l) => l.t0 <= time).map((l) => [X(l.from + (l.to - l.from) * Math.min(1, (time - l.t0) / (l.t1 - l.t0))), Y(Math.min(time, l.t1))])];
      svgEl("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: "var(--ink)", "stroke-width": 0.45 }, graph);
      svgEl("line", { x1: 4, x2: 96, y1: Y(Math.min(time, T)), y2: Y(Math.min(time, T)), stroke: "var(--muted)", "stroke-width": 0.2, "stroke-dasharray": "1 1" }, graph);
      svgEl("text", { x: 2, y: 3, "font-size": 2.8, fill: "var(--muted)" }, graph).textContent = t("temps ↓   position →", "time ↓   position →");
    }
    playBtn.textContent = playing ? t("Pause", "Pause") : met ? t("Rejouer", "Replay") : t("Lancer", "Play");
    read.innerHTML = `${t("Trajets terminés : ", "Legs completed: ")}<strong>${met ? t("une infinité", "infinitely many") : done}</strong> · ${t("distance de la mouche : ", "fly’s distance: ")}<strong>${fmt(flown)} km</strong>${level >= 1 ? ` · ${t("temps : ", "time: ")}<strong>${fmt(Math.min(time, T) * 60, 0)} min</strong>` : ""}${met ? ` · <strong>${t("les trains se rencontrent", "the trains meet")}</strong>` : ""}`;
  }
  const tick = (now) => {
    if (!playing) return;
    time = Math.min(T, time + ((now - last) / RUN) * T); last = now;
    if (time >= T) playing = false;
    draw();
    if (playing) raf = requestAnimationFrame(tick);
  };
  playBtn.addEventListener("click", () => {
    if (time >= T) time = 0;
    if (reduced) { time = Math.min(T, time + T / 6); draw(); return; }
    playing = !playing; last = performance.now(); draw();
    if (playing) raf = requestAnimationFrame(tick);
  });
  root.querySelector("#fl-step").addEventListener("click", () => { playing = false; cancelAnimationFrame(raf); const next = L.find((l) => l.t1 > time + 1e-12); time = next ? next.t1 : T; draw(); });
  root.querySelector("#fl-reset").addEventListener("click", () => { playing = false; cancelAnimationFrame(raf); time = 0; draw(); });
  draw();
  const off = onHintAction("fly", { clock: () => { level = Math.max(level, 1); draw(); }, graph: () => { level = 2; draw(); } });
  return () => { playing = false; cancelAnimationFrame(raf); off(); };
}
