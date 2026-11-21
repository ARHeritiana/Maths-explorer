// Animated solution of the fly challenge. `diagram` holds the captions; `scene` builds the cartoon once (mount) and poses
// it as a pure function of (step, p) (update): the two locomotives close in, the fly zigzags leg by leg with its flight
// arcs, the stopwatch measures the meeting time, then all the legs are laid end to end in one ribbon that the fly covers
// at constant speed: the distance is speed × time. See common/player.js.
import { P, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg, easeOutBack } from "../common/scene-kit.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { W, RAIL, drawCountryside, makeTrain, poseTrain, makeFly, poseFly, makeStopwatch, poseStopwatch } from "./art.js";
import { parseFly, meetTime, flyDistance, legs, flyMotion, flyNumber } from "./maths.js";

const num = flyNumber;

export const diagram = {
  size: [520, 300],
  dur: (step) => [3600, 7000, 6500, 7000][step],
  steps: (q) => { const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), d = flyDistance(D, v1, v2, w), L = legs(D, v1, v2, w); return [
    P(`Les trains sont à ${D} km et roulent l’un vers l’autre à ${v1} et ${v2} km/h ; la mouche vole à ${w} km/h.`, `The trains are ${D} km apart and drive towards each other at ${v1} and ${v2} km/h; the fly flies at ${w} km/h.`),
    P(`Suivre la mouche trajet par trajet : ${num(L[0].length, true)} km, puis ${num(L[1].length, true)} km, puis ${num(L[2].length, true)} km… une infinité de trajets de plus en plus courts.`, `Following the fly leg by leg: ${num(L[0].length, false)} km, then ${num(L[1].length, false)} km, then ${num(L[2].length, false)} km… infinitely many ever shorter legs.`),
    P(`Regardons plutôt le temps : l’écart diminue de ${v1 + v2} km par heure, donc T = ${D} / ${v1 + v2} h, soit environ ${num(T, true)} h.`, `Look at the time instead: the gap shrinks by ${v1 + v2} km per hour, so T = ${D} / ${v1 + v2} h, approximately ${num(T, false)} h.`),
    P(`La mouche vole sans arrêt à ${w} km/h pendant T : d = ${w} × (${D} / ${v1 + v2}) km, soit environ ${num(d, true)} km. La somme infinie des trajets donne le même nombre.`, `The fly flies non-stop at ${w} km/h for time T: d = ${w} × (${D} / ${v1 + v2}) km, approximately ${num(d, false)} km. The infinite sum of the legs gives the same number.`),
  ]; },
};

const HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round";
const X0 = 96, XW = 328, FLY_Y = 176;
const blinkAt = (p, k) => (Math.abs(Math.sin(11 * p + k * 2.3)) > 0.997 ? 1 : 0);

export const scene = {
  mount(c, q) {
    const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), d = flyDistance(D, v1, v2, w), L = legs(D, v1, v2, w);
    drawCountryside(c.svg);
    const arcs = svgEl("g", {}, c.svg), ribbon = svgEl("g", {}, c.svg);
    const trains = [makeTrain(c.svg, { i: 0, dir: 1 }), makeTrain(c.svg, { i: 2, dir: -1 })];
    const fly = makeFly(c.svg), bubble = makeBubble(c.svg), watch = makeStopwatch(c.svg, { x: 260, y: 44 });
    const fr = c.t(true, false), txt = {
      v1: c.text(0, RAIL + 68, `${v1} km/h →`, { ...mid, class: "sol-small", "font-weight": 700 }),
      v2: c.text(0, RAIL + 68, `← ${v2} km/h`, { ...mid, class: "sol-small", "font-weight": 700 }),
      gap: c.text(260, RAIL + 40, "", { ...mid, class: "sol-label" }),
      line: c.text(260, 122, "", { ...mid, class: "sol-line", style: HALO }),
      hot: c.text(445, 150, `${num(d, fr)} km`, { ...mid, class: "sol-hot", style: HALO }),
      end0: c.text(40, 124, "0", { ...mid, class: "sol-small" }),
      end1: c.text(480, 124, `${num(d, fr)} km`, { ...mid, class: "sol-small" }),
    };
    const bracket = svgEl("path", { fill: "none", stroke: "var(--ink)", "stroke-width": 1.4 }, c.svg);
    return { D, v1, v2, w, T, d, L, arcs, ribbon, trains, fly, bubble, watch, txt, bracket, fr, X: (km) => X0 + (km / D) * XW, lang: c.t("fr", "en") };
  },
  update(S, s, p) {
    const { D, v1, v2, w, T, d, L, arcs, ribbon, trains, fly, bubble, watch, txt, bracket, fr, X, lang } = S;
    const t3 = L.length ? L[Math.min(2, L.length - 1)].t1 : T;
    // the clock of the story: what time of the trip this frame shows
    const time = s === 0 ? 0 : s === 1 ? t3 * p : s === 2 ? T * seg(p, 0, 0.8) : T;
    const m = flyMotion(D, v1, v2, w, time), [x1, x2, f] = m.positions, met = time >= T - 1e-12;
    const impact = s === 2 ? seg(p, 0.8, 0.9) * (1 - seg(p, 0.9, 1)) : 0;
    const happy = (s === 2 && p > 0.8) || s === 3;
    poseTrain(trains[0], { x: X(x1), roll: X(x1) - X(0), puff: 1.5 * p + (s === 2 ? time / T * 3 : 0), steam: met ? 0.3 : 1, squash: impact, mood: happy ? "grin" : impact ? "o" : "smile", blink: blinkAt(p, 0), look: 1 });
    poseTrain(trains[1], { x: X(x2), roll: X(D) - X(x2), puff: 1.5 * p + 0.5 + (s === 2 ? time / T * 3 : 0), steam: met ? 0.3 : 1, squash: impact, mood: happy ? "grin" : impact ? "o" : "smile", blink: blinkAt(p, 1), look: 1 });
    txt.v1.setAttribute("x", X(x1) - 40); txt.v2.setAttribute("x", X(x2) + 40);   // under each train
    for (const k of ["v1", "v2"]) txt[k].setAttribute("opacity", met ? 0 : s <= 2 ? 1 : 0);
    // the fly: zigzags between the noses, then (step 3) flies along the ribbon of all its legs laid end to end
    const flap = 170 * p + (s === 2 ? 60 * time / T : 0), bob = 3 * Math.sin(24 * p);
    let fx = X(f), fy = FLY_Y + bob, facing = m.direction || 1, tilt = 0;
    if (s === 0) { fy = FLY_Y - 6 * easeOutBack(seg(p, 0, 0.4)) + bob; }
    if (met && s === 2) { fy = FLY_Y - 26 * seg(p, 0.85, 1) + bob; facing = 1; }
    const R0 = 40, RW = 440, u = s === 3 ? seg(p, 0.08, 0.85) : 0;
    if (s === 3) { fx = R0 + RW * u; fy = 82 + bob; facing = 1; tilt = -6; }
    poseFly(fly, { x: fx, y: fy, facing, flap, tilt, grin: happy, ground: s === 3 ? 400 : RAIL });
    // flight arcs of the finished legs (step 1): each leg shorter than the one before
    arcs.replaceChildren();
    if (s === 1) L.forEach((leg, i) => {
      if (leg.t0 >= time) return;
      const k = Math.min(1, (time - leg.t0) / (leg.t1 - leg.t0)), a = X(leg.from), b = X(leg.from + (leg.to - leg.from) * k);
      const h = 12 + 46 * (leg.length / L[0].length), top = FLY_Y - h;
      svgEl("path", { d: `M${a.toFixed(1)} ${FLY_Y} Q${((a + b) / 2).toFixed(1)} ${(top - h * 0.2).toFixed(1)} ${b.toFixed(1)} ${FLY_Y}`, fill: "none", stroke: colour(i % 2 ? 5 : 1), "stroke-width": 2, "stroke-dasharray": "4 3", "stroke-linecap": "round" }, arcs);
      if (i < 3 && k >= 1) { const tx = svgEl("text", { x: (a + b) / 2, y: top - h * 0.1 - 6, "text-anchor": "middle", class: "sol-small", "font-weight": 700 }, arcs); tx.textContent = `${num(leg.length, fr)} km`; }
    });
    // "Demi-tour !" at each of the first turns of step 1, "Bzz !" at the start, "Ouf !" when the trains meet
    let say = null;
    if (s === 0) say = { text: lang === "fr" ? "Bzz ! Prête !" : "Bzz! Ready!", appear: seg(p, 0.2, 0.4) };
    if (s === 1) L.slice(0, 3).forEach((leg, i) => { const next = L[i + 1]?.t1 ?? T, k = (time - leg.t1) / Math.max(1e-9, next - leg.t1); if (k >= 0 && k < 0.45 && i < 2) say = { text: lang === "fr" ? "Demi-tour !" : "Turn back!", appear: seg(k, 0, 0.1) * (1 - seg(k, 0.35, 0.45)) }; });
    if (s === 2 && p > 0.8) say = { text: lang === "fr" ? "Ouf !" : "Phew!", appear: seg(p, 0.86, 0.94) };
    poseBubble(bubble, say ? { x: fx + 4, y: fy - 12, text: say.text, appear: say.appear } : { x: 0, y: 0, text: "", appear: 0 });
    // the gap between the noses (step 0 and 2)
    const showGap = (s === 0 || s === 2) && !met;
    bracket.setAttribute("d", showGap ? `M${X(x1)} ${RAIL + 18} v8 H${X(x2)} v-8` : "");
    txt.gap.textContent = showGap ? `${num(x2 - x1, fr)} km` : "";
    txt.gap.setAttribute("x", (X(x1) + X(x2)) / 2);
    // the stopwatch: appears in step 2 and measures the trip
    const wk = s < 2 ? 0 : time / T;
    poseStopwatch(watch, { k: s === 3 ? 1 : wk, opacity: s >= 2 ? Math.min(1, seg(p, 0, 0.15) + (s === 3 ? 1 : 0)) : 0, text: s >= 2 ? `t ≈ ${num(s === 3 ? T : time, fr)} h` : "" });
    // the ribbon of all the legs laid end to end, uncovered by the fly at w km/h (step 3)
    ribbon.replaceChildren();
    if (s === 3) {
      let at = 0;
      svgEl("rect", { x: R0, y: 92, width: RW, height: 12, rx: 3, fill: "var(--surface)", stroke: "var(--line-strong)", "stroke-width": 1 }, ribbon);
      for (let i = 0; i < L.length && at < u * RW; i++) {
        const wd = (L[i].length / d) * RW, shown = Math.min(wd, u * RW - at);
        svgEl("rect", { x: R0 + at, y: 92, width: shown, height: 12, fill: `color-mix(in srgb, ${colour(i % 2 ? 5 : 1)} 70%, var(--surface))` }, ribbon);
        at += wd;
      }
      if (at < u * RW) svgEl("rect", { x: R0 + at, y: 92, width: u * RW - at, height: 12, fill: "var(--object-ink)", opacity: 0.6 }, ribbon);
      svgEl("rect", { x: R0, y: 92, width: RW, height: 12, rx: 3, fill: "none", stroke: "var(--ink)", "stroke-width": 1.2 }, ribbon);
    }
    for (const k of ["end0", "end1"]) txt[k].setAttribute("opacity", s === 3 ? 1 : 0);
    txt.line.textContent = s === 2 ? `T = ${D} / ${v1 + v2} h` : s === 3 ? `d = ${w} km/h × ${num(T, fr)} h` : "";
    txt.line.setAttribute("opacity", s === 2 ? seg(p, 0.8, 0.95) : s === 3 ? seg(p, 0, 0.15) : 0);
    txt.line.setAttribute("y", s === 3 ? 150 : 112);
    txt.line.setAttribute("x", s === 3 ? 220 : 260);
    txt.hot.setAttribute("opacity", s === 3 ? seg(p, 0.85, 1) : 0);
  },
};
