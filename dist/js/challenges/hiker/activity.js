// Hands-on activity of the hiker challenge, seen from the side: the mountain is the graph of a random profile (ups and
// downs), the hiker's pace is irregular (rests, bursts) and, with the toggle, he sometimes walks back. Play or scrub each
// day; draw another mountain or another pace. No clock and no passing times are shown on the way (owner, 21 November
// 2026): the whole problem is that we do not know when he reaches a given point; only the start at 8:00 is known.
// Nothing shows the two days together; putting them side by side is the learner's own idea.
import { svgEl, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { pairOf, clock } from "./maths.js";   // clock: only the 8:00 start
import { W, H, makeProfile, makePace, day1At, day2At, trailPoint, arcLength } from "./plan.js";
import { drawLandscape, setProfile, poseSky } from "./art.js";

const DAY = ["#2563eb", "#ea7a12"], SIZE = 0.62, SPEED = 60;   // SPEED: minutes of the day per second of animation
const seedOf = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function activity(root, { t, q, lang, reduced: reducedPref }) {
  installCartoon();
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const [T1, T2] = pairOf(q.pair);
  let mountain = seedOf(q.pair) % 997 + 1, pace = 11, back = false, h, K1, K2;
  let day = 0, min = 0, playing = false, last = 0, raf = 0, facing = [1, -1];
  const rebuild = () => { h = makeProfile(mountain); K1 = makePace(pace, { back }); K2 = makePace(pace + 101, { back }); };
  root.innerHTML = `
    ${goalLine(t, "Suis le randonneur les deux jours.", "Follow the hiker on both days.", "Choisis un jour, puis lance ou fais avancer la journée. Tu peux changer la montagne, l’allure, et lui permettre de revenir sur ses pas.", "Choose a day, then play or move through the day. You can change the mountain and the pace, and let him walk back at times.")}
    <div class="act-controls" role="group" aria-label="${t("Jour", "Day")}"><button class="btn-quiet ${PRESS}" type="button" data-day="0">${t("Jour 1 : la montée", "Day 1: up")}</button><button class="btn-quiet ${PRESS}" type="button" data-day="1">${t("Jour 2 : la descente", "Day 2: down")}</button></div>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Une montagne vue de profil, son sentier et un randonneur", "A mountain seen from the side, its trail and a hiker")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="play">${t("Lecture", "Play")}</button><input type="range" min="0" max="720" step="1" value="0" aria-label="${t("Avancer dans la journée", "Move through the day")}" style="flex:1;min-width:140px"></div>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="mountain">${t("Autre montagne", "Another mountain")}</button><button class="btn-quiet ${PRESS}" type="button" data-a="pace">${t("Autre allure", "Another pace")}</button><label><input type="checkbox" data-a="back"> ${t("Il revient parfois sur ses pas", "He sometimes walks back")}</label></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout"), slider = root.querySelector('input[type="range"]'), play = root.querySelector('[data-a="play"]');
  const scene = drawLandscape(svg);
  const hiker = makePerson(svg, { fill: "#3f7fd9", look: 2, size: SIZE, gear: "hiker" });
  const bubble = makeBubble(svg);
  const face = svgEl("g", {}, svg);
  svgEl("rect", { x: 10, y: 10, width: 112, height: 40, rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.6 }, face);
  const dayText = svgEl("text", { x: 66, y: 25, "text-anchor": "middle", "font-size": 10, "font-weight": 700 }, face);
  const timeText = svgEl("text", { x: 66, y: 42, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: "var(--ink)" }, face);   // the start only, never a time on the way
  const where = (d, m) => (d === 0 ? day1At(K1, T1, m / 60) : day2At(K2, T2, m / 60));
  function frame(now = 0) {
    const sec = reduced() ? 0 : now / 1000, w = where(day, min), p = trailPoint(h, w.s);
    const arrived = day === 0 ? min >= T1 * 60 : min >= T2 * 60, sinceArrival = (min - (day === 0 ? T1 : T2) * 60) / 60;   // hours
    if (w.dir) facing[day] = w.dir;
    const walking = !arrived && min > 0 && w.dir !== 0;
    poseSky(scene, min, sec);
    posePerson(hiker, { x: p.x, y: p.y + 1, facing: facing[day], walk: { phase: arcLength(h, w.s) / 6, amp: walking ? 1 : 0 }, breathe: sec * 2.2, blink: ((sec % 3.4) < 0.12) ? 1 : 0, wave: arrived && sinceArrival < 1.2 ? (sinceArrival * 3) % 1 : 0, mood: arrived ? "grin" : w.dir === 0 && min > 0 ? "flat" : "smile", gaze: [facing[day], -0.2] });
    poseBubble(bubble, { x: p.x + 6, y: p.y - 40, text: day === 0 ? t("Le sommet !", "The top!") : t("Enfin en bas !", "Down at last!"), appear: arrived && sinceArrival < 1.5 ? Math.min(1, sinceArrival * 6) * (1 - Math.max(0, (sinceArrival - 1.1) / 0.4)) : 0 });
    dayText.textContent = day === 0 ? t("Jour 1", "Day 1") : t("Jour 2", "Day 2"); dayText.setAttribute("fill", DAY[day]);
    timeText.textContent = `${t("départ", "start")} ${clock(0, lang)}`;
    slider.value = String(Math.round(min));
    root.querySelectorAll("[data-day]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.day) === day)));
  }
  const place = () => { const s = where(day, min).s; return s <= 0 ? t("au pied", "at the foot") : s >= 1 ? t("au sommet", "at the top") : t("sur le sentier", "on the trail"); };
  const announce = () => { read.textContent = `${day === 0 ? t("Jour 1", "Day 1") : t("Jour 2", "Day 2")} : ${place()}`; };
  const stopPlay = () => { playing = false; play.textContent = t("Lecture", "Play"); announce(); };
  const loop = (now) => {
    if (playing) { const dt = Math.min(0.1, (now - last) / 1000); min = Math.min(720, min + dt * SPEED); if (min >= 720) stopPlay(); }
    last = now; frame(now); raf = requestAnimationFrame(loop);
  };
  const restart = () => { min = 0; facing = [1, -1]; if (playing) stopPlay(); frame(); announce(); };
  play.addEventListener("click", () => {
    if (playing) { stopPlay(); return; }
    if (min >= 720) min = 0;
    if (reduced()) { min = 720; frame(); announce(); return; }
    playing = true; last = performance.now(); play.textContent = t("Pause", "Pause");
  });
  slider.addEventListener("input", () => { min = Number(slider.value); if (playing) stopPlay(); frame(); });
  slider.addEventListener("change", announce);
  root.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => { day = Number(b.dataset.day); restart(); }));
  root.querySelector('[data-a="mountain"]').addEventListener("click", () => { mountain = (mountain * 48271) % 2147483647; rebuild(); setProfile(scene, h); restart(); });
  root.querySelector('[data-a="pace"]').addEventListener("click", () => { pace = (pace * 69621) % 2147483647; rebuild(); restart(); });
  root.querySelector('[data-a="back"]').addEventListener("change", (e) => { back = e.target.checked; rebuild(); restart(); });
  rebuild(); setProfile(scene, h);
  frame(); announce();
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
