// Animated solution of the fly challenge, a pure function of (step, progress): the trains close in, the first legs of the
// fly, the meeting time, and the distance as speed × time (and as the sum of the legs). See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { parseFly, meetTime, flyDistance, legs, positions } from "./maths.js";

const num = (x, fr) => { const s = String(Math.round(x * 100) / 100); return fr ? s.replace(".", ",") : s; };

export const diagram = {
  size: [520, 300],
  steps: (q) => { const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), d = flyDistance(D, v1, v2, w), L = legs(D, v1, v2, w); return [
    P(`Les trains sont à ${D} km et roulent l’un vers l’autre à ${v1} et ${v2} km/h ; la mouche vole à ${w} km/h.`, `The trains are ${D} km apart and drive towards each other at ${v1} and ${v2} km/h; the fly flies at ${w} km/h.`),
    P(`Suivre la mouche trajet par trajet : ${num(L[0].length, true)} km, puis ${num(L[1].length, true)} km, puis ${num(L[2].length, true)} km… une infinité de trajets de plus en plus courts.`, `Following the fly leg by leg: ${num(L[0].length, false)} km, then ${num(L[1].length, false)} km, then ${num(L[2].length, false)} km… infinitely many ever shorter legs.`),
    P(`Regardons plutôt le temps : l’écart diminue de ${v1 + v2} km par heure, donc les trains se rencontrent après ${D} / ${v1 + v2} = ${num(T, true)} h.`, `Look at the time instead: the gap shrinks by ${v1 + v2} km per hour, so the trains meet after ${D} / ${v1 + v2} = ${num(T, false)} h.`),
    P(`Pendant ces ${num(T, true)} h, la mouche vole sans arrêt à ${w} km/h : ${w} × ${num(T, true)} = ${num(d, true)} km. La somme infinie des trajets donne le même nombre.`, `During these ${num(T, false)} h the fly flies non-stop at ${w} km/h: ${w} × ${num(T, false)} = ${num(d, false)} km. The infinite sum of the legs gives the same number.`),
  ]; },
  draw(c, s, p, q) {
    const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), L = legs(D, v1, v2, w, 1e-9, 400), X = (km) => 40 + (km / D) * 440;
    const time = s === 0 ? 0 : s === 1 ? L[Math.min(2, L.length - 1)].t1 * ez(p) : T * (s === 2 ? ez(p) : 1);
    const [x1, x2, f] = positions(D, v1, v2, w, time);
    c.line(20, 120, 500, 120, { stroke: "var(--line-strong)", "stroke-width": 3 });
    c.rect(X(x1) - 46, 92, 46, 24, { rx: 4, fill: `color-mix(in srgb, ${colour(0)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 });
    c.rect(X(x2), 92, 46, 24, { rx: 4, fill: `color-mix(in srgb, ${colour(2)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 });
    c.circ(X(f), 70, 5, { fill: "var(--ink)" });
    c.text(X(0) + 10, 140, `${v1} km/h →`, { class: "sol-small" });
    c.text(X(D) - 10, 140, `← ${v2} km/h`, { class: "sol-small", "text-anchor": "end" });
    // the legs drawn as a zigzag under the track (space-time picture)
    if (s >= 1) {
      const Y = (tt) => 170 + (tt / T) * 110, pts = [[X(0), Y(0)]];
      for (const l of L) { if (l.t0 > time) break; const k = Math.min(1, (time - l.t0) / (l.t1 - l.t0)); pts.push([X(l.from + (l.to - l.from) * k), Y(Math.min(time, l.t1))]); }
      c.path("M" + pts.map((q2) => q2.join(",")).join(" L"), { fill: "none", stroke: "var(--ink)", "stroke-width": 1.4 });
      c.line(X(0), Y(0), X(v1 * Math.min(time, T)), Y(Math.min(time, T)), { stroke: colour(0), "stroke-width": 2 });
      c.line(X(D), Y(0), X(D - v2 * Math.min(time, T)), Y(Math.min(time, T)), { stroke: colour(2), "stroke-width": 2 });
    }
    if (s >= 2) c.text(260, 36, `t = ${num(Math.min(time, T), c.t(true, false))} h`, { ...mid, class: "sol-line" });
    if (s === 3) c.text(470, 36, `${num(flyDistance(D, v1, v2, w), c.t(true, false))} km`, { ...mid, class: "sol-hot" });
  },
};
