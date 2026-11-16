// Hands-on activity of the __ID__ challenge: the learner tries, fails and notices; it never states the answer or the method.
// Contract: activity(root, { t, q, reduced, lang }) draws into root and returns a cleanup function.
// The world is the solution's world (plan.js, common/person.js): same room, same table, same people, so the solution feels familiar.
// The people are alive: they breathe, blink, look at whoever is chosen, wave when picked, and shake hands with a hop.
import { colour, svgEl, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { pairKey, handshakes } from "./maths.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { layout, handAt, aimAt } from "./plan.js";

const ROOM = { cx: 170, cy: 172, rx: 134, ry: 90 }, SHAKE = 900;   // SHAKE: length of a handshake, in ms

export function activity(root, { t, q, reduced: reducedPref }) {
  installCartoon();
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const n = q.n, L = layout(n, ROOM), S = L.seats, size = L.size, T = L.table, done = new Set();
  let sel = null, shake = null, raf = 0;   // shake: { i, j, start }
  root.innerHTML = `
    ${goalLine(t, "Fais serrer la main à tout le monde.", "Get everyone to shake hands.", "Touche une personne puis une autre pour qu’elles se serrent la main.", "Tap one person then another to make them shake hands.")}
    <svg class="act-svg" viewBox="0 0 340 300" role="group" aria-label="${t("Personnes autour d’une table", "People around a table")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout");
  // the scene is built once; frames only pose it
  svgEl("ellipse", { cx: ROOM.cx, cy: ROOM.cy + 4, rx: ROOM.rx + 26, ry: ROOM.ry + 22, fill: "color-mix(in srgb, var(--object-ink) 9%, transparent)" }, svg);
  const back = svgEl("g", {}, svg);
  svgEl("rect", { x: T.cx - 6, y: T.cy, width: 12, height: 28, fill: "#8d5f2d", stroke: "var(--ink)", "stroke-width": 1.2 }, svg);
  svgEl("ellipse", { cx: T.cx, cy: T.cy, rx: T.rx, ry: T.ry, fill: "#c58b52", stroke: "var(--ink)", "stroke-width": 1.6 }, svg);
  const lines = svgEl("g", { opacity: 0.75 }, svg), front = svgEl("g", {}, svg), over = svgEl("g", {}, svg);
  const handles = [], people = S.map(([x, y], i) => {
    const h = svgEl("g", { class: "toy-handle", tabindex: 0, role: "button", "data-i": i, "aria-label": `${t("Personne", "Person")} ${i + 1}` }, y < T.cy ? back : front);
    svgEl("ellipse", { class: "hit", cx: x, cy: y - 30 * size, rx: 16 * size, ry: 36 * size }, h);
    handles.push(h);
    return makePerson(h, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, look: i, size });
  });
  const ring = svgEl("ellipse", { rx: 15 * size, ry: 4.5 * size, fill: "none", stroke: "var(--ink)", "stroke-width": 1.4, "stroke-dasharray": "3 3", opacity: 0 }, over);
  const hello = makeBubble(over);
  const centre = [ROOM.cx, ROOM.cy - 30];
  function drawLines() {
    lines.replaceChildren();
    for (const key of done) { const [i, j] = key.split("-").map(Number), a = handAt(S[i], size), b = handAt(S[j], size); svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--object-ink)", "stroke-width": 1.6, "stroke-linecap": "round" }, lines); }
    read.textContent = done.size === handshakes(n) ? t("Tout le monde s’est serré la main.", "Everyone has shaken hands.") : "";   // neutral end message, no running count
  }
  // one frame, a function of the clock time `now` (ms) and the current state
  function frame(now) {
    const sec = reduced() ? 0 : now / 1000, k = shake ? Math.min(1, (now - shake.start) / SHAKE) : 0;
    S.forEach((at, i) => {
      const focus = shake ? (i === shake.i ? S[shake.j] : i === shake.j ? S[shake.i] : S[shake.i]) : sel !== null && sel !== i ? S[sel] : centre;
      const aim = aimAt(at, focus === centre ? centre : handAt(focus, size), size);
      const pose = { x: at[0], y: at[1], facing: aim.facing, gaze: [Math.sign(focus[0] - at[0]) || 0, focus[1] < at[1] ? -0.3 : 0.3], breathe: 2.2 * sec + i, blink: ((sec + i * 0.37) % 3.7) < 0.12 ? 1 : 0, mood: "smile" };
      if (sel === i) Object.assign(pose, { wave: reduced() ? 0 : (sec % 1.6) / 1.6, mood: "grin" });
      if (shake && (i === shake.i || i === shake.j)) {
        const grip = Math.min(1, k * 3) * (1 - Math.max(0, (k - 0.85) / 0.15));
        Object.assign(pose, { reach: grip, reachAngle: aim.angle, hop: Math.max(0, Math.min(1, (k - 0.35) / 0.35)), mood: k > 0.25 ? "grin" : "o" });
      }
      posePerson(people[i], pose);
      handles[i].setAttribute("aria-pressed", String(sel === i));
    });
    ring.setAttribute("opacity", sel === null ? 0 : 0.8);
    if (sel !== null) { ring.setAttribute("cx", S[sel][0]); ring.setAttribute("cy", S[sel][1]); }
    const b = shake ? handAt(S[shake.i], size) : [0, 0];
    poseBubble(hello, { x: b[0] + 4, y: Math.max(36, b[1] - 34 * size),   // never above the frame
      text: t("Enchanté !", "Nice to meet you!"), appear: shake ? Math.min(1, k * 4) * (1 - Math.max(0, (k - 0.8) / 0.2)) : 0 });
    if (shake && k >= 1) shake = null;
  }
  const loop = (now) => { frame(now); raf = reduced() ? 0 : requestAnimationFrame(loop); };
  const kick = () => { if (reduced()) { shake = null; frame(0); } else if (!raf) raf = requestAnimationFrame(loop); };
  const pick = (i) => {
    if (sel === null || sel === i) { sel = sel === i ? null : i; kick(); return; }
    done.add(pairKey(sel, i)); drawLines();
    shake = { i: sel, j: i, start: performance.now() }; sel = null; kick();
  };
  svg.addEventListener("click", (e) => { const g = e.target.closest(".toy-handle"); if (g) pick(Number(g.dataset.i)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.(".toy-handle"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(Number(g.dataset.i)); } });
  root.querySelector('[data-a="reset"]').addEventListener("click", () => { done.clear(); sel = null; shake = null; drawLines(); kick(); });
  drawLines(); frame(0); kick();
  return () => { cancelAnimationFrame(raf); raf = 0; };   // the idle loop must stop when the activity is unmounted
}
