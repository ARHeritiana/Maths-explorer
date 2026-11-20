// Hands-on activity of the braess challenge: the town of the solution, 20 cars (each a group of N/20 drivers), the
// mayor beside the closed new road and a commuter with a stopwatch at the stadium. The learner sends groups from one
// route to another, can let the drivers change route by themselves (the rule of the problem: each one goes where it
// is faster for them) and can open the new road. Nothing names the paradox; the stopwatch only measures.
import { svgEl, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { ROUTES, routeTimes, groupSize, switchOnce, along } from "./maths.js";
import { drawTown, poseRoad, makeCar, poseCar, makeWatch, poseWatch } from "./art.js";

const DRIVE = 700, OPEN = 900, LANE = { top: -4, short: 0, bottom: 4 };   // ms; sideways offset of each route's cars
const NAME = { top: ["par C (A→C→B)", "through C (A→C→B)"], bottom: ["par D (A→D→B)", "through D (A→D→B)"], short: ["par C puis D (A→C→D→B)", "through C then D (A→C→D→B)"] };

export function activity(root, { t, q, lang, reduced: pref }) {
  installCartoon();
  const reduced = () => (typeof pref === "function" ? !!pref() : !!pref);
  const N = q.n, g = groupSize(N), fmt = (v) => v.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 });
  let flows = { top: N, bottom: 0, short: 0 }, open = false, sel = null, moving = null, opening = null, auto = 0, raf = 0, mood = "smile", said = null, owners = [];
  root.innerHTML = `
    ${goalLine(t, "Fais aller tout le monde de A au stade B, le plus vite possible.", "Get everyone from A to the stadium B as fast as possible.", "Touche un trajet puis un autre pour y envoyer un groupe de conducteurs. Les boutons ouvrent la nouvelle route et laissent les conducteurs changer de trajet.", "Tap one route then another to send a group of drivers there. The buttons open the new road and let the drivers change route.")}
    <svg class="act-svg" viewBox="0 0 370 320" role="img" aria-label="${t("La ville : A, B, C, D et les routes", "The town: A, B, C, D and the roads")}"></svg>
    <div class="act-controls braess-routes" role="group" aria-label="${t("Trajets", "Routes")}"></div>
    <div class="act-controls">
      <button class="btn-quiet ${PRESS}" type="button" data-a="open" aria-pressed="false">${t("Ouvrir la route C→D", "Open the road C→D")}</button>
      <button class="btn-quiet ${PRESS}" type="button" data-a="auto">${t("Laisser les conducteurs changer", "Let the drivers change")}</button>
      <button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button>
    </div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout"), cardsBox = root.querySelector(".braess-routes");
  const T = drawTown(svg, t);
  const cars = Array.from({ length: 20 }, (_, i) => makeCar(T.cars, i));
  const mayor = makePerson(T.people, { fill: "color-mix(in srgb, var(--c3) 70%, var(--surface))", look: 2, size: 0.55 });
  const fan = makePerson(T.people, { fill: "color-mix(in srgb, var(--c5) 70%, var(--surface))", look: 4, size: 0.55 });
  const watch = makeWatch(svg, 300, 292), bubble = makeBubble(T.over), carBubble = makeBubble(T.over);
  // owners[i]: the route of car i (one car per group); kept in step with flows
  const assign = () => { owners = []; for (const r of ROUTES) for (let k = 0; k < Math.round(flows[r] / g); k++) owners.push(r); };
  assign();
  const average = () => { const tm = routeTimes(flows); return ROUTES.reduce((s, r) => s + flows[r] * tm[r], 0) / N; };

  function cards() {
    const tm = routeTimes(flows);
    cardsBox.innerHTML = ROUTES.filter((r) => r !== "short" || open).map((r) =>
      `<button class="btn-quiet ${PRESS} braess-route" type="button" data-r="${r}" aria-pressed="${sel === r}"><span class="braess-route-name">${t(...NAME[r])}</span><strong>${fmt(flows[r])}</strong> ${t("conducteurs", "drivers")} · <strong>${fmt(tm[r])}</strong> min</button>`).join("");
  }
  function frame(now) {
    const sec = reduced() ? 0 : now / 1000, slots = { top: [], bottom: [], short: [] };
    owners.forEach((r, i) => slots[r].push(i));
    for (const r of ROUTES) slots[r].forEach((i, k) => {
      let u = (k + 1) / (slots[r].length + 1);
      if (moving && moving.car === i) u *= Math.min(1, (now - moving.start) / DRIVE);   // the moved car drives from A to its place
      const p = along(r, u), n = [-Math.sin(p.heading), Math.cos(p.heading)];
      poseCar(cars[i], { x: p.x + n[0] * LANE[r], y: p.y + n[1] * LANE[r], heading: p.heading, scale: 0.9 });
    });
    const k = opening ? Math.min(1, (now - opening.start) / OPEN) : open ? 1 : 0, kk = opening && !opening.open ? 1 - k : k;
    poseRoad(T, kk);
    const mid = T.mid, look = moving ? along(owners[moving.car], 0.5) : { x: 300, y: 160 };
    posePerson(mayor, { x: mid[0] + 30, y: mid[1] + 22, facing: -1, gaze: [-1, -0.2], breathe: 2 * sec, blink: (sec % 3.3) < 0.12 ? 1 : 0, mood: opening ? "grin" : "smile", wave: opening && !reduced() ? (k % 0.5) / 0.5 : 0, hop: opening ? Math.sin(Math.PI * k) : 0 });
    posePerson(fan, { x: 342, y: 304, facing: -1, gaze: [Math.sign(look.x - 342) || -1, -0.4], breathe: 2 * sec + 1, blink: ((sec + 1.3) % 4.1) < 0.12 ? 1 : 0, mood });
    poseBubble(bubble, { x: mid[0] + 26, y: mid[1] - 14, text: t("C’est ouvert !", "It’s open!"), appear: opening && opening.open ? Math.min(1, k * 3) * (1 - Math.max(0, (k - 0.85) / 0.15)) : 0 });
    if (said && moving) { const c = along(owners[moving.car], 0.5); poseBubble(carBubble, { x: c.x, y: c.y - 10, text: said, appear: Math.min(1, (now - moving.start) / 300) }); }
    else poseBubble(carBubble, { x: 0, y: 0, text: "", appear: 0 });
    const avg = average(); poseWatch(watch, avg, fmt(avg));
    if (moving && now - moving.start > DRIVE + 500) { moving = null; said = null; }
    if (opening && k >= 1) opening = null;
  }
  const loop = (now) => { frame(now); raf = reduced() ? 0 : requestAnimationFrame(loop); };   // idle life: breathing and blinks
  const kick = () => { if (reduced()) { moving = null; opening = null; said = null; frame(0); } else if (!raf) raf = requestAnimationFrame(loop); };

  // Move one group from a route to another; the moved driver says their new time; the commuter reacts to the average.
  function move(from, to) {
    if (flows[from] < g) { read.textContent = t("Personne ne prend ce trajet.", "Nobody takes this route."); return false; }
    const before = average();
    flows = { ...flows, [from]: flows[from] - g, [to]: flows[to] + g };
    const i = owners.lastIndexOf(from); owners[i] = to;
    const mine = routeTimes(flows)[to], after = average();
    mood = after < before - 1e-9 ? "grin" : after > before + 1e-9 ? "o" : "smile";
    said = `${fmt(mine)} min`; moving = { car: i, start: performance.now() };
    read.textContent = t(`${fmt(g)} conducteurs passent ${NAME[to][0]} : ${fmt(mine)} minutes pour eux.`, `${fmt(g)} drivers go ${NAME[to][1]}: ${fmt(mine)} minutes for them.`);
    cards(); kick(); return true;
  }
  function pick(r) {
    if (sel === null || sel === r) { sel = sel === r ? null : r; cards(); cardsBox.querySelector(`[data-r="${r}"]`)?.focus(); return; }
    const from = sel; sel = null; move(from, r); cardsBox.querySelector(`[data-r="${r}"]`)?.focus();
  }
  // The drivers change one group at a time, each time where the group gains the most, until nobody gains.
  function selfish() {
    clearTimeout(auto);
    const step = () => {
      const s = switchOnce(flows, open, g);
      if (!s) { read.textContent = t("Plus personne ne gagne à changer de trajet.", "Nobody gains by changing route any more."); return; }
      move(s.from, s.to);
      auto = setTimeout(step, reduced() ? 0 : 450);
    };
    step();
  }
  cardsBox.addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (b) pick(b.dataset.r); });
  const openBtn = root.querySelector('[data-a="open"]');
  openBtn.addEventListener("click", () => {
    clearTimeout(auto);
    if (open && flows.short > 0) { flows = { ...flows, top: flows.top + flows.short, short: 0 }; assign(); }   // closing sends the shortcut's drivers back by C
    open = !open; sel = null; opening = { open, start: performance.now() };
    openBtn.textContent = open ? t("Fermer la route C→D", "Close the road C→D") : t("Ouvrir la route C→D", "Open the road C→D");
    openBtn.setAttribute("aria-pressed", String(open));
    read.textContent = open ? t("La nouvelle route est ouverte : 0 minute de C à D.", "The new road is open: 0 minutes from C to D.") : t("La nouvelle route est fermée.", "The new road is closed.");
    cards(); kick();
  });
  root.querySelector('[data-a="auto"]').addEventListener("click", selfish);
  root.querySelector('[data-a="reset"]').addEventListener("click", () => {
    clearTimeout(auto); flows = { top: N, bottom: 0, short: 0 }; open = false; sel = null; moving = null; opening = null; mood = "smile"; assign();
    openBtn.textContent = t("Ouvrir la route C→D", "Open the road C→D"); openBtn.setAttribute("aria-pressed", "false"); read.textContent = ""; cards(); kick(); frame(0);
  });
  cards(); frame(0); kick();
  return () => { cancelAnimationFrame(raf); raf = 0; clearTimeout(auto); };
}
