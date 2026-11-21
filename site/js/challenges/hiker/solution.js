// Animated solution of the hiker challenge. `diagram` holds the captions; `scene` builds the mountain, the two hikers,
// the bubbles and the graph once (mount) and poses them as a pure function of (step, p) (update).
import { P, ez, mid } from "../common/helpers.js";
import { svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { pairOf, up, down, meetMinutes, clock } from "./maths.js";
import { W, H, trailAt, facingAt, TRAIL_LENGTH } from "./plan.js";
import { drawMountain, poseSky } from "./art.js";

const DAY = ["#2563eb", "#ea7a12"], SIZE = 0.62;

export const diagram = {
  size: [W, H],
  dur: (step) => [5200, 4600, 4400, 3800, 6200][step],
  steps: (q) => {
    const [T1, T2] = pairOf(q.pair), m = meetMinutes(T1, T2);
    return [
      P(`Jour 1 : départ du pied à 8 h 00, arrivée au sommet ${T1} h plus tard.`, `Day 1: he leaves the foot at 08:00 and reaches the top ${T1} h later.`),
      P(`Jour 2 : départ du sommet à 8 h 00 par le même sentier, arrivée en bas ${T2} h plus tard.`, `Day 2: he leaves the top at 08:00 on the same trail and is down ${T2} h later.`),
      P("Imaginons les deux journées en même temps : deux randonneurs partent à 8 h 00, l’un d’en bas, l’autre d’en haut, sur le même sentier.", "Picture both days at once: two hikers leave at 08:00, one from the foot, one from the top, on the same trail."),
      P(`Ils marchent l’un vers l’autre : quelle que soit leur allure, ils se croisent forcément. Là, le randonneur passe au même endroit, à la même heure, les deux jours.`, `They walk towards each other: whatever their pace, they must meet. There, the hiker is at the same place, at the same time, on both days.`),
      P(`Bonus, si les allures sont régulières (comme ici) : l’un a fait h ÷ ${T1} du sentier, l’autre doit encore en faire h ÷ ${T2} : h ÷ ${T1} + h ÷ ${T2} = 1, donc h = ${T1} × ${T2} ÷ ${T1 + T2} heures, soit ${clock(m, "fr")}.`, `Bonus, if the paces are steady (as here): one has done h ÷ ${T1} of the trail, the other still has h ÷ ${T2} to go: h ÷ ${T1} + h ÷ ${T2} = 1, so h = ${T1} × ${T2} ÷ ${T1 + T2} hours, that is ${clock(m, "en")}.`),
    ];
  },
};

export const scene = {
  mount(c, q) {
    const [T1, T2] = pairOf(q.pair), lang = c.t("fr", "en");
    const sky = drawMountain(c.svg);
    const pin = svgEl("g", { opacity: 0 }, c.svg);
    svgEl("path", { d: "M0 0 q-7 -9 -7 -14 a7 7 0 1 1 14 0 q0 5 -7 14 Z", fill: "#d92d20", stroke: "var(--ink)", "stroke-width": 1.2 }, pin);
    svgEl("circle", { cx: 0, cy: -14, r: 2.6, fill: "#fff" }, pin);
    const hikers = [makePerson(c.svg, { fill: "#3f7fd9", look: 2, size: SIZE, gear: "hiker" }), makePerson(c.svg, { fill: "#f08a2c", look: 2, size: SIZE, gear: "hiker" })];
    const bubbles = [makeBubble(c.svg), makeBubble(c.svg)];
    const face = svgEl("g", {}, c.svg);
    svgEl("rect", { x: 10, y: 10, width: 112, height: 40, rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.6 }, face);
    const dayText = svgEl("text", { x: 66, y: 25, "text-anchor": "middle", "font-size": 10, "font-weight": 700 }, face);
    const timeText = svgEl("text", { x: 66, y: 42, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: "var(--ink)" }, face);
    // the graph card of the last step: position (0 foot, 1 top) against the time of day
    const card = svgEl("g", { opacity: 0 }, c.svg), G = { x: 258, y: 34, w: 236, h: 170 }, hours = Math.max(T1, T2);
    svgEl("rect", { x: G.x - 34, y: G.y - 24, width: G.w + 50, height: G.h + 70, rx: 10, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.6 }, card);
    svgEl("path", { d: `M${G.x} ${G.y} V${G.y + G.h} H${G.x + G.w}`, fill: "none", stroke: "var(--ink)", "stroke-width": 1.4 }, card);
    const label = (x, y, s, a = {}) => { const e = svgEl("text", { x, y, "font-size": 9, fill: "var(--ink)", ...a }, card); e.textContent = s; return e; };
    label(G.x - 4, G.y + 3, c.t("haut", "top"), { "text-anchor": "end" }); label(G.x - 4, G.y + G.h + 3, c.t("bas", "foot"), { "text-anchor": "end" });
    label(G.x, G.y + G.h + 14, clock(0, lang), { "text-anchor": "middle" }); label(G.x + G.w, G.y + G.h + 14, clock(hours * 60, lang), { "text-anchor": "middle" });
    const lines = [svgEl("path", { fill: "none", stroke: DAY[0], "stroke-width": 2.6, "stroke-linecap": "round" }, card), svgEl("path", { fill: "none", stroke: DAY[1], "stroke-width": 2.6, "stroke-linecap": "round" }, card)];
    const cross = svgEl("circle", { r: 5, fill: "none", stroke: "#d92d20", "stroke-width": 2.4 }, card);
    const crossText = label(0, 0, "", { "text-anchor": "middle", "font-size": 11, "font-weight": 700 });
    const answer = c.text(G.x + G.w / 2, G.y + G.h + 36, `${meetMinutes(T1, T2)} min`, { ...mid, class: "sol-hot" });
    card.append(answer);
    return { T1, T2, lang, sky, pin, hikers, bubbles, dayText, timeText, card, G, hours, lines, cross, crossText, answer };
  },
  update(S, s, p) {
    const { T1, T2, lang, sky, pin, hikers, bubbles, dayText, timeText, card, G, hours, lines, cross, crossText, answer } = S, meet = meetMinutes(T1, T2);
    const minute = s === 0 ? ez(p) * (T1 * 60 + 40) : s === 1 ? ez(p) * (T2 * 60 + 40) : s === 2 ? ez(p) * meet * 0.8 : s === 3 ? meet * (0.8 + 0.2 * ez(seg(p, 0, 0.6))) : meet;
    poseSky(sky, minute, p * 6);
    const pos = [up(minute / 60, T1), down(minute / 60, T2)], show = [s !== 1, s >= 1], dir = [1, -1];
    hikers.forEach((Hk, d) => {
      Hk.root.setAttribute("opacity", show[d] ? 1 : 0);
      const pt = trailAt(pos[d]), done = d === 0 ? minute >= T1 * 60 : minute >= T2 * 60, met = s >= 3 && p > 0.55;
      const other = trailAt(pos[1 - d]);
      posePerson(Hk, { x: pt.x + (met ? (d === 0 ? -5 : 5) : 0), y: pt.y + 2, facing: met ? (d === 0 ? 1 : -1) : done ? 1 : facingAt(pos[d], dir[d]), walk: { phase: (pos[d] * TRAIL_LENGTH) / 6, amp: done || met || s === 4 ? 0 : 1 }, breathe: p * 8 + d, wave: met && s === 3 ? seg(p, 0.6, 1) : 0, mood: met ? "grin" : "smile", gaze: s >= 2 ? [Math.sign(other.x - pt.x) || 1, Math.sign(other.y - pt.y) * 0.6] : [1, -0.3] });
    });
    const meetPt = trailAt(up(meet / 60, T1)), metNow = s === 3 && p > 0.55;
    pin.setAttribute("opacity", s >= 3 ? seg(p, 0.5, 0.7) || (s === 4 ? 1 : 0) : 0);
    pin.setAttribute("transform", `translate(${meetPt.x} ${meetPt.y - 30})`);
    const hi = [c2(lang, "Salut !", "Hello!"), c2(lang, "Te voilà !", "There you are!")];
    bubbles.forEach((B, d) => poseBubble(B, { x: meetPt.x + (d === 0 ? -14 : 14), y: meetPt.y - 32, text: hi[d], appear: metNow ? seg(p, 0.58 + d * 0.08, 0.7 + d * 0.08) : 0 }));
    dayText.textContent = s === 0 ? c2(lang, "Jour 1", "Day 1") : s === 1 ? c2(lang, "Jour 2", "Day 2") : c2(lang, "Jours 1 et 2", "Days 1 and 2");
    dayText.setAttribute("fill", s === 1 ? DAY[1] : s === 0 ? DAY[0] : "var(--ink)");
    timeText.textContent = `${c2(lang, "départ", "start")} ${clock(0, lang)}`;   // only the known 8:00 start: never a time on the way
    // the graph: both positions against the time, drawn as p grows; the crossing is the meeting
    card.setAttribute("opacity", s === 4 ? seg(p, 0, 0.15) : 0);
    const X = (h) => G.x + (G.w * h) / hours, Y = (v) => G.y + G.h * (1 - v), upto = s === 4 ? hours * ez(seg(p, 0.1, 0.7)) : 0;
    [(h) => up(h, T1), (h) => down(h, T2)].forEach((f, d) => { let path = ""; for (let i = 0; i <= 60; i++) { const h = (upto * i) / 60; path += `${i ? "L" : "M"}${X(h).toFixed(1)} ${Y(f(h)).toFixed(1)}`; } lines[d].setAttribute("d", path); });
    const hm = meet / 60, shown = s === 4 && upto >= hm;
    cross.setAttribute("cx", X(hm)); cross.setAttribute("cy", Y(up(hm, T1))); cross.setAttribute("opacity", shown ? 1 : 0);
    crossText.setAttribute("x", X(hm)); crossText.setAttribute("y", Y(up(hm, T1)) - 10); crossText.textContent = clock(meet, lang); crossText.setAttribute("opacity", shown ? 1 : 0);
    answer.setAttribute("opacity", s === 4 ? seg(p, 0.75, 1) : 0);
  },
};
const c2 = (lang, fr, en) => (lang === "fr" ? fr : en);
