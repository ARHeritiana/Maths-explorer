// Animated solution of the hiker challenge, seen from the side as in the activity. `diagram` holds the captions; `scene`
// builds the mountain (the graph of a random profile), the two hikers, the bubbles and the graph card once (mount) and
// poses them as a pure function of (step, p) (update). The paces are irregular, with rests and a stretch walked back, so
// the meeting is a fact about any walk, not about steady speeds; no time on the way is ever shown, only the 8:00 start.
import { P, ez } from "../common/helpers.js";
import { svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { pairOf, clock } from "./maths.js";
import { W, H, makeProfile, makePace, day1At, day2At, trailPoint, arcLength, crossing } from "./plan.js";
import { drawLandscape, setProfile, poseSky } from "./art.js";

const DAY = ["#2563eb", "#ea7a12"], SIZE = 0.62;
const seedOf = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
// the walks shown: the activity's first mountain, and paces with rests and backtracking
const walks = (q) => { const [T1, T2] = pairOf(q.pair), h = makeProfile(seedOf(q.pair) % 997 + 1), K1 = makePace(23, { back: true }), K2 = makePace(124, { back: true }); return { T1, T2, h, K1, K2, meet: crossing(K1, T1, K2, T2) }; };

export const diagram = {
  size: [W, H],
  dur: (step) => [6000, 5200, 5200, 4200, 6200][step],
  steps: (q) => {
    const [T1, T2] = pairOf(q.pair);
    return [
      P(`Jour 1 : départ du pied à 8 h 00, arrivée au sommet ${T1} h plus tard, à une allure quelconque : il s’arrête, accélère, revient même sur ses pas.`, `Day 1: he leaves the foot at 08:00 and reaches the top ${T1} h later, at any pace: he stops, speeds up, even walks back.`),
      P(`Jour 2 : départ du sommet à 8 h 00 par le même sentier, arrivée en bas ${T2} h plus tard, tout aussi irrégulièrement.`, `Day 2: he leaves the top at 08:00 on the same trail and is down ${T2} h later, just as irregularly.`),
      P("Imaginons les deux journées en même temps : deux randonneurs partent à 8 h 00, l’un d’en bas, l’autre d’en haut, sur le même sentier.", "Picture both days at once: two hikers leave at 08:00, one from the foot, one from the top, on the same trail."),
      P("Celui qui monte part en dessous de l’autre et finit au-dessus : sur un seul sentier, ils se croisent forcément. Là, le randonneur passe au même endroit, à la même heure, les deux jours.", "The one going up starts below the other and ends above him: on a single trail, they must meet. There, the hiker is at the same place, at the same time, on both days."),
      P("Traçons la position sur le sentier au fil du temps : la montée va du bas vers le haut, la descente du haut vers le bas. Les deux tracés se croisent toujours, quelles que soient les allures. On ne sait pas à quelle heure, mais ce moment existe.", "Plot the position on the trail as time goes by: the way up goes from bottom to top, the way down from top to bottom. The two lines always cross, whatever the paces. We do not know at what time, but that moment exists."),
    ];
  },
};

export const scene = {
  mount(c, q) {
    const Wk = walks(q), lang = c.t("fr", "en");
    const sky = drawLandscape(c.svg);
    setProfile(sky, Wk.h);
    const pin = svgEl("g", { opacity: 0 }, c.svg);
    svgEl("path", { d: "M0 0 q-7 -9 -7 -14 a7 7 0 1 1 14 0 q0 5 -7 14 Z", fill: "#d92d20", stroke: "var(--ink)", "stroke-width": 1.2 }, pin);
    svgEl("circle", { cx: 0, cy: -14, r: 2.6, fill: "#fff" }, pin);
    const hikers = [makePerson(c.svg, { fill: "#3f7fd9", look: 2, size: SIZE, gear: "hiker" }), makePerson(c.svg, { fill: "#f08a2c", look: 2, size: SIZE, gear: "hiker" })];
    const bubbles = [makeBubble(c.svg), makeBubble(c.svg)];
    const face = svgEl("g", {}, c.svg);
    svgEl("rect", { x: 10, y: 10, width: 112, height: 40, rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.6 }, face);
    const dayText = svgEl("text", { x: 66, y: 25, "text-anchor": "middle", "font-size": 10, "font-weight": 700 }, face);
    const timeText = svgEl("text", { x: 66, y: 42, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: "var(--ink)" }, face);
    // the graph card of the last step: position on the trail (foot to top) against time, with no times written
    const card = svgEl("g", { opacity: 0 }, c.svg), G = { x: 246, y: 40, w: 236, h: 160 };
    svgEl("rect", { x: G.x - 40, y: G.y - 26, width: G.w + 58, height: G.h + 54, rx: 10, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.6 }, card);
    svgEl("path", { d: `M${G.x} ${G.y - 8} V${G.y + G.h} H${G.x + G.w + 8}`, fill: "none", stroke: "var(--ink)", "stroke-width": 1.4 }, card);
    const label = (x, y, s, a = {}) => { const e = svgEl("text", { x, y, "font-size": 9, fill: "var(--ink)", ...a }, card); e.textContent = s; return e; };
    label(G.x - 4, G.y + 3, c.t("haut", "top"), { "text-anchor": "end" }); label(G.x - 4, G.y + G.h + 3, c.t("bas", "foot"), { "text-anchor": "end" });
    label(G.x, G.y + G.h + 14, clock(0, lang), { "text-anchor": "middle" }); label(G.x + G.w, G.y + G.h + 14, c.t("temps", "time"), { "text-anchor": "end" });
    const lines = [svgEl("path", { fill: "none", stroke: DAY[0], "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, card), svgEl("path", { fill: "none", stroke: DAY[1], "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, card)];
    const cross = svgEl("circle", { r: 5.5, fill: "none", stroke: "#d92d20", "stroke-width": 2.4 }, card);
    return { ...Wk, lang, sky, pin, hikers, bubbles, dayText, timeText, card, G, lines, cross, facing: [1, -1] };
  },
  update(S, s, p) {
    const { T1, T2, h, K1, K2, meet, lang, sky, pin, hikers, bubbles, dayText, timeText, card, G, lines, cross } = S;
    const M = meet ? meet.hours * 60 : Math.min(T1, T2) * 30;
    const minute = s === 0 ? ez(p) * (T1 * 60 + 30) : s === 1 ? ez(p) * (T2 * 60 + 30) : s === 2 ? ez(p) * M * 0.8 : s === 3 ? M * (0.8 + 0.2 * ez(seg(p, 0, 0.6))) : M;
    poseSky(sky, minute, p * 6);
    const at = [day1At(K1, T1, minute / 60), day2At(K2, T2, minute / 60)], show = [s !== 1, s >= 1];
    hikers.forEach((Hk, d) => {
      Hk.root.setAttribute("opacity", show[d] ? 1 : 0);
      const pt = trailPoint(h, at[d].s), done = d === 0 ? minute >= T1 * 60 : minute >= T2 * 60, met = s >= 3 && p > 0.55;
      const facing = met ? (d === 0 ? 1 : -1) : at[d].dir || (d === 0 ? 1 : -1);
      posePerson(Hk, { x: pt.x + (met ? (d === 0 ? -5 : 5) : 0), y: pt.y + 1, facing, walk: { phase: arcLength(h, at[d].s) / 6, amp: done || met || s === 4 || at[d].dir === 0 ? 0 : 1 }, breathe: p * 8 + d, wave: met && s === 3 ? seg(p, 0.6, 1) : 0, mood: met ? "grin" : done ? "grin" : at[d].dir === 0 && minute > 0 ? "flat" : "smile", gaze: [facing, -0.2], blink: Math.abs(Math.sin(9 * p + d * 2)) > 0.997 ? 1 : 0 });
    });
    const meetPt = trailPoint(h, meet ? meet.s : 0.5), metNow = s === 3 && p > 0.55;
    pin.setAttribute("opacity", s >= 3 ? (s === 4 ? 1 : seg(p, 0.5, 0.7)) : 0);
    pin.setAttribute("transform", `translate(${meetPt.x.toFixed(1)} ${(meetPt.y - 30).toFixed(1)})`);
    const hi = [c2(lang, "Salut !", "Hello!"), c2(lang, "Te voilà !", "There you are!")];
    bubbles.forEach((B, d) => poseBubble(B, { x: meetPt.x + (d === 0 ? -14 : 14), y: meetPt.y - 32, text: hi[d], appear: metNow ? seg(p, 0.58 + d * 0.08, 0.7 + d * 0.08) : 0 }));
    dayText.textContent = s === 0 ? c2(lang, "Jour 1", "Day 1") : s === 1 ? c2(lang, "Jour 2", "Day 2") : c2(lang, "Jours 1 et 2", "Days 1 and 2");
    dayText.setAttribute("fill", s === 1 ? DAY[1] : s === 0 ? DAY[0] : "var(--ink)");
    timeText.textContent = `${c2(lang, "départ", "start")} ${clock(0, lang)}`;   // only the known 8:00 start: never a time on the way
    // the graph: both positions against time, drawn as p grows; the crossing is the meeting (no time written)
    card.setAttribute("opacity", s === 4 ? seg(p, 0, 0.15) : 0);
    const hours = Math.max(T1, T2), X = (t) => G.x + (G.w * t) / hours, Y = (v) => G.y + G.h * (1 - v), upto = s === 4 ? hours * ez(seg(p, 0.1, 0.75)) : 0;
    [(t) => day1At(K1, T1, t).s, (t) => day2At(K2, T2, t).s].forEach((f, d) => { let path = ""; for (let i = 0; i <= 120; i++) { const t = (upto * i) / 120; path += `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`; } lines[d].setAttribute("d", path); });
    const shown = s === 4 && meet && upto >= meet.hours;
    if (meet) { cross.setAttribute("cx", X(meet.hours)); cross.setAttribute("cy", Y(meet.s)); }
    cross.setAttribute("opacity", shown ? 1 : 0);
  },
};
const c2 = (lang, fr, en) => (lang === "fr" ? fr : en);
