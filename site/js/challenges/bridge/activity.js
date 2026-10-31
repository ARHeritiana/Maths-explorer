// Hands-on activity of the bridge challenge: the learner tries, fails and notices; it never states the answer or the method.
// It is played on the night scene of the worked solution: tap the soldiers on the lantern's side, then send them across the
// rope bridge. They really walk, with the lantern, and a crossing lasts in proportion to its minutes.
const caf = (id) => globalThis.cancelAnimationFrame?.(id);
import { bridgeTimes, bridgeBest } from "./maths.js";
import { makeSoldier, easeInOut, seg, lerp } from "../common/scene-kit.js";
import { svgEl } from "../common/kit.js";
import { nightBridge, makeLantern } from "./art.js";
import { LOOKS, slotX, LAMP_REST, WAIT_Y, LANE_Y, L, R } from "./solution.js";

// Looks of the four soldiers (the same as in the animated solution), fastest first.
export const SOLDIERS = LOOKS;

export function activity(root, { t, q, reduced }) {
  const times = bridgeTimes(q.set).sort((a, b) => a - b), best = bridgeBest(times), NAMES = ["A", "B", "C", "D"], calm = () => (typeof reduced === "function" ? reduced() : !!reduced);
  let side, torch, elapsed, hist, sel, anim = null, raf = 0, msg = "";
  const reset = () => { side = [0, 0, 0, 0]; torch = 0; elapsed = 0; hist = []; sel = new Set(); anim = null; };
  root.innerHTML = `
    <p class="act-help">${t("Touche une ou deux personnes du côté de la lampe, puis fais-les traverser le pont : le temps compté est celui du plus lent.", "Tap one or two people on the lamp's side, then send them across the bridge: the time counted is the slower one's.")}</p>
    <svg class="act-svg br-night" viewBox="0 0 520 300" role="group" aria-label="${t("Quatre soldats, une lampe, un pont", "Four soldiers, one lamp, one bridge")}"></svg>
    <div class="act-buttons"><button class="btn btn-primary" id="br-go" type="button">${t("Faire traverser", "Send across")}</button><button class="btn-quiet" id="br-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="br-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="br-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="br-log" aria-label="${t("Traversées", "Crossings")}"></ol>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#br-read"), logEl = root.querySelector("#br-log");
  nightBridge(svg);
  const rings = times.map((_, i) => svgEl("ellipse", { rx: 17, ry: 5, fill: "none", stroke: "#ffd04d", "stroke-width": 3, visibility: "hidden", "pointer-events": "none" }, svg));
  const layer = svgEl("g", {}, svg), men = times.map((m, i) => makeSoldier(layer, { ...LOOKS[i], label: String(m) })), lamp = makeLantern(layer); lamp.root.style.pointerEvents = "none";
  men.forEach((m, i) => { const g = m.root; g.setAttribute("data-i", i); g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.style.cursor = "pointer"; g.style.outline = "none"; });
  const pill = svgEl("g", {}, svg); svgEl("rect", { x: 160, y: 12, width: 200, height: 34, rx: 17, fill: "#0a0f2c", opacity: 0.72 }, pill);
  const clock = svgEl("text", { x: 260, y: 36, "text-anchor": "middle", style: "font:700 20px var(--body);fill:#fff" }, pill);
  const groundLamp = (s) => [LAMP_REST[s], WAIT_Y - 19];
  function place() {
    men.forEach((m, i) => { const x = slotX(side[i], i); m.set({ x, y: WAIT_Y, dir: side[i] === 0 ? 1 : -1, amp: 0 }); rings[i].setAttribute("cx", x); rings[i].setAttribute("cy", WAIT_Y + 2); rings[i].setAttribute("visibility", sel.has(i) ? "visible" : "hidden"); });
    const g = groundLamp(torch); lamp.set({ x: g[0], y: g[1], angle: 0 });
  }
  function describe() {
    men.forEach((m, i) => { const ok = side[i] === torch; m.root.setAttribute("aria-pressed", String(sel.has(i))); m.root.setAttribute("aria-disabled", String(!ok || !!anim)); m.root.setAttribute("aria-label", `${NAMES[i]}, ${times[i]} min, ${side[i] === 0 ? t("rive de départ", "start bank") : t("rive d’arrivée", "far bank")}${ok ? "" : `, ${t("sans la lampe", "without the lamp")}`}`); m.root.style.opacity = ok || anim ? "1" : "0.8"; });
    clock.textContent = `${t("Temps", "Time")} : ${elapsed} min`;
    root.querySelector("#br-go").disabled = !!anim || sel.size < 1 || sel.size > 2; root.querySelector("#br-undo").disabled = !!anim || !hist.length; root.querySelector("#br-reset").disabled = !!anim;
    logEl.innerHTML = hist.map((h) => `<li>${h.who.map((i) => NAMES[i]).join(" + ")} ${h.dir === "over" ? "→" : "←"} (${h.cost} min)</li>`).join("");
    const done = side.every((s) => s === 1);
    read.innerHTML = msg || `${t("Temps écoulé", "Time elapsed")} : <strong>${elapsed} min</strong>${done ? ` · ${t("Tout le monde a traversé. Peux-tu faire mieux ?", "Everyone is across. Can you do better?")}` : ""}`;
  }
  function draw(m = "") { msg = m; place(); describe(); }
  function select(i) { if (anim) return; if (side[i] !== torch) return draw(t("Cette personne n’est pas du côté de la lampe.", "That person is not on the lamp's side.")); if (sel.has(i)) sel.delete(i); else if (sel.size < 2) sel.add(i); else return draw(t("Deux personnes au plus.", "At most two people.")); draw(); }
  // the crossing: the same walk as the worked solution (down to the lane, along the bridge, up the far bank)
  function go() {
    if (anim || sel.size < 1 || sel.size > 2) return;
    const who = [...sel], cost = Math.max(...who.map((i) => times[i])), dirv = torch === 0 ? 1 : -1, from = torch, to = 1 - torch, entry = dirv === 1 ? L + 10 : R - 10, exit = dirv === 1 ? R - 10 : L + 10;
    const finish = () => { who.forEach((i) => { side[i] = 1 - side[i]; }); torch = 1 - torch; elapsed += cost; hist.push({ who, dir: dirv === 1 ? "over" : "back", cost }); sel = new Set(); anim = null; draw(); };
    if (calm()) { anim = {}; return finish(); }
    anim = { who }; rings.forEach((r) => r.setAttribute("visibility", "hidden")); who.forEach((i) => layer.append(men[i].root)); layer.append(lamp.root); describe();
    const dur = 900 + cost * 340, t0 = performance.now(), base = elapsed;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), u = seg(p, 0.06, 0.94), amp0 = Math.min(1.3, Math.max(0.65, 1.5 - cost * 0.09)), ramp = easeInOut(Math.min(seg(p, 0.03, 0.12), 1 - seg(p, 0.88, 0.97))), lead = who[0], pose = {};
      who.forEach((i, j) => {
        const a = slotX(from, i), b = slotX(to, i), off = -dirv * 34 * j, pts = [[a, WAIT_Y], [a, LANE_Y], [entry + off, LANE_Y], [exit + off, LANE_Y], [b, LANE_Y], [b, WAIT_Y]];
        const lens = pts.slice(1).map((q2, k) => Math.hypot(q2[0] - pts[k][0], q2[1] - pts[k][1])), total = lens.reduce((s, x) => s + x, 0); let d = u * total, k = 0;
        while (k < lens.length - 1 && d > lens[k]) { d -= lens[k]; k++; }
        const f = lens[k] ? d / lens[k] : 0; pose[i] = { x: lerp(pts[k][0], pts[k + 1][0], f), y: lerp(pts[k][1], pts[k + 1][1], f), dir: dirv, phase: (u * total) / 40, amp: amp0 * ramp, carry: j === 0 && p > 0.05 && p < 0.95 };
        men[i].set(pose[i]);
      });
      const hand = men[lead].hand(pose[lead]), g0 = groundLamp(from), g1 = groundLamp(to), w = p < 0.5 ? easeInOut(seg(p, 0, 0.14)) : 1 - easeInOut(seg(p, 0.86, 1)), g = p < 0.5 ? g0 : g1;
      lamp.set({ x: lerp(g[0], hand[0], w), y: lerp(g[1], hand[1] + 1, w), angle: w * (6 * Math.sin(pose[lead].phase * 6.283) - dirv * 4) });
      clock.textContent = `${t("Temps", "Time")} : ${base + Math.round(cost * u)} min`;
      if (p < 1) raf = requestAnimationFrame(tick); else finish();
    };
    raf = requestAnimationFrame(tick);
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest?.("[data-i]"); if (g) select(Number(g.dataset.i)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.("[data-i]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(Number(g.dataset.i)); } });
  root.querySelector("#br-go").addEventListener("click", go);
  root.querySelector("#br-undo").addEventListener("click", () => { const h = hist.pop(); if (!h) return; h.who.forEach((i) => { side[i] = 1 - side[i]; }); torch = 1 - torch; elapsed -= h.cost; sel = new Set(); draw(); });
  root.querySelector("#br-reset").addEventListener("click", () => { reset(); draw(); });
  void best;
  reset(); draw();
  return () => { caf(raf); };
}
