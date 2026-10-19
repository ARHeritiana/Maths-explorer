// Animated solution of the fly challenge, a pure function of (step, progress): the trains close in, the first legs of the
// fly, the meeting time, and the distance as speed × time (and as the sum of the legs). See common/player.js.
import { P, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { parseFly, meetTime, flyDistance, legs, positions, flyTrace, flyNumber } from "./maths.js";

const num = flyNumber;

export const diagram = {
  size: [520, 300],
  dur: (step) => step === 1 ? 6000 : 3600,
  steps: (q) => { const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), d = flyDistance(D, v1, v2, w), L = legs(D, v1, v2, w); return [
    P(`Les trains sont à ${D} km et roulent l’un vers l’autre à ${v1} et ${v2} km/h ; la mouche vole à ${w} km/h.`, `The trains are ${D} km apart and drive towards each other at ${v1} and ${v2} km/h; the fly flies at ${w} km/h.`),
    P(`Suivre la mouche trajet par trajet : ${num(L[0].length, true)} km, puis ${num(L[1].length, true)} km, puis ${num(L[2].length, true)} km… une infinité de trajets de plus en plus courts.`, `Following the fly leg by leg: ${num(L[0].length, false)} km, then ${num(L[1].length, false)} km, then ${num(L[2].length, false)} km… infinitely many ever shorter legs.`),
    P(`Regardons plutôt le temps : l’écart diminue de ${v1 + v2} km par heure, donc T = ${D} / ${v1 + v2} h, soit environ ${num(T, true)} h.`, `Look at the time instead: the gap shrinks by ${v1 + v2} km per hour, so T = ${D} / ${v1 + v2} h, approximately ${num(T, false)} h.`),
    P(`La mouche vole sans arrêt à ${w} km/h pendant T : d = ${w} × (${D} / ${v1 + v2}) km, soit environ ${num(d, true)} km. La somme infinie des trajets donne le même nombre.`, `The fly flies non-stop at ${w} km/h for time T: d = ${w} × (${D} / ${v1 + v2}) km, approximately ${num(d, false)} km. The infinite sum of the legs gives the same number.`),
  ]; },
  draw(c, s, p, q) {
    const [D, v1, v2, w] = parseFly(q.trip), T = meetTime(D, v1, v2), X = (km) => 40 + (km / D) * 440;
    const time = s === 0 ? 0 : s <= 2 ? T * p : T;
    const [x1, x2, f] = positions(D, v1, v2, w, time);
    c.line(20, 120, 500, 120, { stroke: "var(--line-strong)", "stroke-width": 3 });
    c.rect(X(x1) - 46, 92, 46, 24, { rx: 4, fill: `color-mix(in srgb, ${colour(0)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 });
    c.rect(X(x2), 92, 46, 24, { rx: 4, fill: `color-mix(in srgb, ${colour(2)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 });
    c.circ(X(f), 70, 5, { fill: "var(--ink)" });
    c.text(X(0) + 10, 140, `${v1} km/h →`, { class: "sol-small" });
    c.text(X(D) - 10, 140, `← ${v2} km/h`, { class: "sol-small", "text-anchor": "end" });
    // the legs drawn as a zigzag under the track (space-time picture)
    if (s >= 1) {
      const Y = (tt) => 170 + (tt / T) * 110, trace = flyTrace(D,v1,v2,w,time), pts = trace.points.map(([x,t])=>[X(x),Y(t)]);
      if(trace.envelope){c.path('M'+trace.envelope.map(([x,t])=>`${X(x)},${Y(t)}`).join(' L')+' Z',{fill:'var(--accent)',opacity:.18,stroke:'none'});c.text(260,298,c.t('Zone ombrée : oscillations trop fines pour ce dessin.','Shaded area: oscillations too fine for this drawing.'),{...mid,class:'sol-small'});}
      c.path("M" + pts.map((q2) => q2.join(",")).join(" L"), { fill: "none", stroke: "var(--ink)", "stroke-width": 1.4 });
      c.circ(X(trace.current[0]),Y(trace.current[1]),3,{fill:'var(--ink)'});
      c.line(X(0), Y(0), X(v1 * Math.min(time, T)), Y(Math.min(time, T)), { stroke: colour(0), "stroke-width": 2 });
      c.line(X(D), Y(0), X(D - v2 * Math.min(time, T)), Y(Math.min(time, T)), { stroke: colour(2), "stroke-width": 2 });
    }
    if (s >= 2) c.text(260, 36, `t ≈ ${num(Math.min(time, T), c.t(true, false))} h`, { ...mid, class: "sol-line" });
    if (s === 3) c.text(470, 36, `${num(flyDistance(D, v1, v2, w), c.t(true, false))} km`, { ...mid, class: "sol-hot" });
  },
};
