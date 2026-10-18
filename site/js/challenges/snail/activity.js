// Hands-on activity of the snail challenge: the learner tries, fails and notices; it never states the answer or the method.
import { MINUS, svgEl, colour } from "../common/kit.js";
import { makeSnail } from "./art.js";
import { snailDown, snailTrace, snailDays } from "./maths.js";

/* ----------------------------------------------------------------- snail */
export function activity(root, { t, reduced, q }) {
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
