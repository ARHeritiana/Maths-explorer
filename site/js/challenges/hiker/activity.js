// Hands-on activity of the hiker challenge: play or scrub each day; the signposts note the time he passes them.
// Nothing shows the two days together; comparing the notes on the posts is the learner's own idea.
import { svgEl, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { pairOf, up, down, clock } from "./maths.js";
import { W, H, trailAt, facingAt, POSTS, TRAIL_LENGTH } from "./plan.js";
import { drawMountain, poseSky, makePost } from "./art.js";

const DAY = ["#2563eb", "#ea7a12"], SIZE = 0.62, SPEED = 60;   // SPEED: minutes of the day per second of animation

export function activity(root, { t, q, lang, reduced: reducedPref }) {
  installCartoon();
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const [T1, T2] = pairOf(q.pair), stops = [0, ...POSTS, 1];
  let day = 0, min = 0, playing = false, last = 0, raf = 0;
  const reached = [0, 0];   // how far each day has been played (minutes), for the notes on the posts
  root.innerHTML = `
    ${goalLine(t, "Suis le randonneur les deux jours.", "Follow the hiker on both days.", "Choisis un jour, puis lance ou fais glisser l’heure. Les panneaux notent l’heure de passage.", "Choose a day, then play or slide the time. The signposts note when he passes.")}
    <div class="act-controls" role="group" aria-label="${t("Jour", "Day")}"><button class="btn-quiet ${PRESS}" type="button" data-day="0">${t("Jour 1 : la montée", "Day 1: up")}</button><button class="btn-quiet ${PRESS}" type="button" data-day="1">${t("Jour 2 : la descente", "Day 2: down")}</button></div>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Une montagne, un sentier en lacets et un randonneur", "A mountain, a zigzag trail and a hiker")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="play">${t("Lecture", "Play")}</button><input type="range" min="0" max="720" step="1" value="0" aria-label="${t("Heure de la journée", "Time of day")}" style="flex:1;min-width:140px"></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout"), slider = root.querySelector('input[type="range"]'), play = root.querySelector('[data-a="play"]');
  const scene = drawMountain(svg);
  const posts = stops.map((s) => makePost(svg, s, { day1: DAY[0], day2: DAY[1] }));
  const hiker = makePerson(svg, { fill: "#3f7fd9", look: 2, size: SIZE, gear: "hiker" });
  const bubble = makeBubble(svg);
  const face = svgEl("g", {}, svg);
  svgEl("rect", { x: 10, y: 10, width: 112, height: 40, rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.6 }, face);
  const dayText = svgEl("text", { x: 66, y: 25, "text-anchor": "middle", "font-size": 10, "font-weight": 700 }, face);
  const timeText = svgEl("text", { x: 66, y: 43, "text-anchor": "middle", "font-size": 16, "font-weight": 800, fill: "var(--ink)" }, face);
  const where = (d, m) => (d === 0 ? up(m / 60, T1) : down(m / 60, T2));
  const passMin = (d, s) => (d === 0 ? s * T1 * 60 : (1 - s) * T2 * 60);
  function frame(now = 0) {
    const sec = reduced() ? 0 : now / 1000, s = where(day, min), p = trailAt(s), dir = day === 0 ? 1 : -1;
    const arrived = day === 0 ? min >= T1 * 60 : min >= T2 * 60, sinceArrival = (min - (day === 0 ? T1 : T2) * 60) / 60;   // hours
    const walking = !arrived && min > 0;
    poseSky(scene, min, sec);
    posePerson(hiker, { x: p.x, y: p.y + 2, facing: arrived ? 1 : facingAt(s, dir), walk: { phase: (s * TRAIL_LENGTH) / 6, amp: walking ? 1 : 0 }, breathe: sec * 2.2, blink: ((sec % 3.4) < 0.12) ? 1 : 0, wave: arrived && sinceArrival < 1.2 ? (sinceArrival * 3) % 1 : 0, mood: arrived ? "grin" : walking ? "smile" : "smile", gaze: [arrived ? 1 : facingAt(s, dir), -0.2] });
    poseBubble(bubble, { x: p.x + 6, y: p.y - 40, text: day === 0 ? t("Le sommet !", "The top!") : t("Enfin en bas !", "Down at last!"), appear: arrived && sinceArrival < 1.5 ? Math.min(1, sinceArrival * 6) * (1 - Math.max(0, (sinceArrival - 1.1) / 0.4)) : 0 });
    posts.forEach((P, k) => P.tags.forEach((T, d) => { const m = passMin(d, stops[k]), seen = reached[d] >= m; T.t.setAttribute("opacity", seen ? 1 : 0); T.tx.textContent = `${t("J", "D")}${d + 1} ${clock(m, lang)}`; }));
    dayText.textContent = day === 0 ? t("Jour 1", "Day 1") : t("Jour 2", "Day 2"); dayText.setAttribute("fill", DAY[day]);
    timeText.textContent = clock(min, lang);
    slider.value = String(Math.round(min));
    root.querySelectorAll("[data-day]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.day) === day)));
  }
  const announce = () => { read.textContent = `${day === 0 ? t("Jour 1", "Day 1") : t("Jour 2", "Day 2")}, ${clock(min, lang)}`; };
  const stopPlay = () => { playing = false; play.textContent = t("Lecture", "Play"); announce(); };
  const loop = (now) => {
    if (playing) { const dt = Math.min(0.1, (now - last) / 1000); min = Math.min(720, min + dt * SPEED); reached[day] = Math.max(reached[day], min); if (min >= 720) stopPlay(); }
    last = now; frame(now); raf = requestAnimationFrame(loop);
  };
  play.addEventListener("click", () => {
    if (playing) { stopPlay(); return; }
    if (min >= 720) min = 0;
    if (reduced()) { min = 720; reached[day] = 720; frame(); announce(); return; }
    playing = true; last = performance.now(); play.textContent = t("Pause", "Pause");
  });
  slider.addEventListener("input", () => { min = Number(slider.value); reached[day] = Math.max(reached[day], min); if (playing) stopPlay(); frame(); });
  slider.addEventListener("change", announce);
  root.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => { day = Number(b.dataset.day); min = 0; if (playing) stopPlay(); frame(); announce(); }));
  frame(); announce();
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
