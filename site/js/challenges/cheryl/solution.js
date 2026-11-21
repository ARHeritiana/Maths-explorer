// Animated solution of Cheryl's birthday. `diagram` holds the captions; `scene` builds the room once (mount) and poses it
// as a pure function of (step, p) (update): Albert (who knows the row) and Bernard (who knows the column) beside the wall
// calendar, Cheryl keeping her secret; each sentence is said in a bubble while a red marker crosses out the dates it
// rules out, until a cake lands on the one date left. See common/player.js.
import { P, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg, easeOutBack } from "../common/scene-kit.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { CHERYL_SETS, cherylSteps, uniqueDays, cherylAnswer, MONTHS, dateText } from "./maths.js";

export const diagram = {
  size: [520, 300],
  dur: (step) => [4200, 4600, 5200, 5200, 5000][step],
  steps: (q) => { const D = CHERYL_SETS[q.set], u = uniqueDays(D), a = cherylAnswer(D); return [
    P("Les dix dates, mois en lignes, jours en colonnes. Albert connaît la ligne, Bernard la colonne.", "The ten dates, months in rows, days in columns. Albert knows the row, Bernard the column."),
    P(`Les jours ${u.join(" et ")} sont seuls dans leur colonne : avec l’un d’eux, Bernard saurait tout de suite.`, `The days ${u.join(" and ")} are alone in their column: with one of them, Bernard would know at once.`),
    P("Phrase 1 : Albert sait que Bernard ne sait pas, donc sa ligne ne contient aucun de ces jours. On barre ces lignes entières.", "Sentence 1: Albert knows Bernard doesn’t know, so his row contains none of these days. Cross out those whole rows."),
    P("Phrase 2 : Bernard sait maintenant, donc sa colonne n’a plus qu’une date. On barre les colonnes qui en ont encore plusieurs.", "Sentence 2: Bernard now knows, so his column has a single date left. Cross out the columns that still have several."),
    P(`Phrase 3 : Albert sait aussi, donc sa ligne n’a plus qu’une date : le ${dateText(a, 0)}.`, `Sentence 3: Albert knows too, so his row has a single date left: ${dateText(a, 1)}.`),
  ]; },
};

const CAL = { x: 104, y: 18, w: 296, h: 210 }, FLOOR = 290;
const HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round";
const blinkAt = (p, k) => (Math.abs(Math.sin(9 * p + k * 2.7)) > 0.997 ? 1 : 0);
const SAY = [
  null,
  (u) => { const v = [...u].sort((a, b) => a - b); return [`Le ${v.join(" ou le ")} ? Je saurais !`, `The ${v.join(" or the ")}? I’d know!`]; },
  ["Bernard ne peut pas savoir !", "Bernard can’t know!"],
  ["Maintenant, je sais !", "Now I know!"],
  ["Alors moi aussi !", "Then I know too!"],
];

export const scene = {
  mount(c, q) {
    const D = CHERYL_SETS[q.set], st = cherylSteps(D), u = uniqueDays(D), ans = cherylAnswer(D), L = c.t(0, 1);
    const months = [...new Set(D.map((d) => d[0]))], days = [...new Set(D.map((d) => d[1]))].sort((a, b) => a - b);
    // the room: wall, skirting board, floor
    svgEl("rect", { x: 0, y: 0, width: 520, height: FLOOR - 20, fill: "color-mix(in srgb, #f6e7c8 55%, var(--surface))" }, c.svg);
    for (let x = 12; x < 520; x += 24) svgEl("line", { x1: x, y1: 0, x2: x, y2: FLOOR - 20, stroke: "color-mix(in srgb, #e0c48f 45%, transparent)", "stroke-width": 6 }, c.svg);
    svgEl("rect", { x: 0, y: FLOOR - 20, width: 520, height: 320 - FLOOR, fill: "#b07a43" }, c.svg);
    svgEl("rect", { x: 0, y: FLOOR - 22, width: 520, height: 5, fill: "#8d5f2d", stroke: "var(--ink)", "stroke-width": 1 }, c.svg);
    // the wall calendar: paper sheet, spiral rings, header, month rows and day columns
    svgEl("rect", { x: CAL.x + 4, y: CAL.y + 6, width: CAL.w, height: CAL.h, rx: 6, fill: "var(--ink)", opacity: 0.15 }, c.svg);
    svgEl("rect", { x: CAL.x, y: CAL.y, width: CAL.w, height: CAL.h, rx: 6, fill: "#fffdf6", stroke: "var(--ink)", "stroke-width": 1.6 }, c.svg);
    svgEl("rect", { x: CAL.x, y: CAL.y, width: CAL.w, height: 26, rx: 6, fill: "#c0392b", stroke: "var(--ink)", "stroke-width": 1.6 }, c.svg);
    for (let x = CAL.x + 24; x < CAL.x + CAL.w - 10; x += 32) svgEl("path", { d: `M${x} ${CAL.y - 6} v12`, stroke: "#777", "stroke-width": 3, "stroke-linecap": "round" }, c.svg);
    const head = c.text(CAL.x + CAL.w / 2, CAL.y + 18, L ? "Cheryl’s birthday?" : "L’anniversaire de Cheryl ?", { ...mid, "font-size": 13, "font-weight": 700, fill: "#fff" });
    const x0 = CAL.x + 74, y0 = CAL.y + 50, cw = Math.min(44, (CAL.w - 84) / days.length), rh = Math.min(42, (CAL.h - 56) / months.length);
    const bands = svgEl("g", {}, c.svg);
    const dayLabels = days.map((d, j) => c.text(x0 + j * cw + cw / 2, y0 - 8, String(d), { ...mid, class: "sol-label", "font-weight": 700 }));
    months.forEach((m, i) => c.text(x0 - 8, y0 + i * rh + rh / 2 + 5, MONTHS[m][L], { class: "sol-small", "text-anchor": "end", "font-weight": 700 }));
    const cells = D.map((d) => {
      const i = months.indexOf(d[0]), j = days.indexOf(d[1]), x = x0 + j * cw, y = y0 + i * rh, g = svgEl("g", {}, c.svg);
      const box = svgEl("rect", { x: x + 3, y: y + 3, width: cw - 6, height: rh - 6, rx: 6, fill: `color-mix(in srgb, ${colour(0)} 22%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2 }, g);
      svgEl("text", { x: x + cw / 2, y: y + rh / 2 + 5, "text-anchor": "middle", class: "sol-label" }, g).textContent = String(d[1]);
      const cross = svgEl("path", { d: `M${x + 7} ${y + 7} L${x + cw - 7} ${y + rh - 7} M${x + cw - 7} ${y + 7} L${x + 7} ${y + rh - 7}`, fill: "none", stroke: "#d32f2f", "stroke-width": 3.2, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1" }, g);
      const removed = st.findIndex((s) => !s.some((a) => a[0] === d[0] && a[1] === d[1]));   // the sentence that rules it out (or -1)
      return { d, g, box, cross, removed, cx: x + cw / 2, cy: y + rh / 2, i, j };
    });
    const ring = svgEl("ellipse", { rx: cw * 0.62, ry: rh * 0.6, fill: "none", stroke: "#2e7d32", "stroke-width": 3 }, c.svg);
    // a birthday cake that lands on the answer
    const cake = svgEl("g", {}, c.svg);
    svgEl("rect", { x: -12, y: -10, width: 24, height: 12, rx: 3, fill: "#f8bbd0", stroke: "var(--ink)", "stroke-width": 1.2 }, cake);
    svgEl("path", { d: "M-12 -6 q3 3 6 0 t6 0 t6 0 t6 0", fill: "none", stroke: "#fff", "stroke-width": 1.6 }, cake);
    svgEl("rect", { x: -1.4, y: -18, width: 2.8, height: 8, fill: "#64b5f6", stroke: "var(--ink)", "stroke-width": 0.8 }, cake);
    svgEl("path", { d: "M0 -25 q3 3 0 6 q-3 -3 0 -6 Z", fill: "#ffb300", stroke: "#e65100", "stroke-width": 0.8 }, cake);
    // the three friends: Albert on the left, Bernard and Cheryl on the right
    const people = [makePerson(c.svg, { fill: `color-mix(in srgb, ${colour(0)} 70%, var(--surface))`, look: 2, size: 1.25 }), makePerson(c.svg, { fill: `color-mix(in srgb, ${colour(2)} 70%, var(--surface))`, look: 1, size: 1.25 }), makePerson(c.svg, { fill: `color-mix(in srgb, ${colour(4)} 70%, var(--surface))`, look: 3, size: 1.1 })];
    const tags = ["Albert", "Bernard", "Cheryl"].map((n, k) => c.text([52, 436, 490][k], FLOOR + 4 - 0, n, { ...mid, class: "sol-small", "font-weight": 700, style: HALO }));
    const bubble = makeBubble(c.svg);
    const hot = c.text(CAL.x + CAL.w / 2, CAL.y + CAL.h + 34, ans ? dateText(ans, L) : "", { ...mid, class: "sol-hot", style: HALO });
    return { D, st, u, ans, cells, bands, dayLabels, days, months, ring, cake, people, tags, bubble, hot, head, x0, y0, cw, rh, L };
  },
  update(S, s, p) {
    const { u, ans, cells, bands, dayLabels, days, months, ring, cake, people, bubble, hot, x0, y0, cw, rh, L } = S;
    // the bands that show what each one knows (step 0): Albert's row, Bernard's column
    bands.replaceChildren();
    if (s === 0) {
      const ka = seg(p, 0.15, 0.45), kb = seg(p, 0.55, 0.85), row = Math.floor(seg(p, 0.15, 0.5) * months.length * 0.999), col = Math.floor(seg(p, 0.55, 0.95) * days.length * 0.999);
      if (ka > 0 && kb <= 0) svgEl("rect", { x: x0 - 70, y: y0 + row * rh, width: cw * days.length + 72, height: rh, rx: 8, fill: colour(0), opacity: 0.25 }, bands);
      if (kb > 0) svgEl("rect", { x: x0 + col * cw, y: y0 - 24, width: cw, height: rh * months.length + 26, rx: 8, fill: colour(2), opacity: 0.25 }, bands);
    }
    dayLabels.forEach((T, j) => T.setAttribute("fill", s >= 1 && u.includes(days[j]) ? "#d32f2f" : "var(--ink)"));
    // the crosses: a date ruled out by sentence r is crossed during step r + 1 (one after the other), then stays crossed
    const now = cells.filter((C) => C.removed === s - 1 && s >= 2).sort((a, b) => a.i - b.i || a.j - b.j);
    cells.forEach((C) => {
      let k = 0;
      if (C.removed > 0 && C.removed < s - 1) k = 1;
      const idx = now.indexOf(C);
      if (idx >= 0) k = seg(p, 0.25 + (0.55 * idx) / now.length, 0.25 + (0.55 * (idx + 1)) / now.length);
      C.cross.setAttribute("stroke-dashoffset", (1 - k).toFixed(3));
      C.g.setAttribute("opacity", (1 - 0.55 * (C.removed > 0 && C.removed < s - 1 ? 1 : 0)).toFixed(2));
      const pulse = s === 1 && u.includes(C.d[1]) ? 0.5 + 0.5 * Math.sin(14 * p) : 0;
      C.box.setAttribute("stroke", pulse ? "#d32f2f" : "var(--ink)"); C.box.setAttribute("stroke-width", pulse ? 1.5 + 2 * pulse : 1.2);
    });
    // the answer: ringed, then the cake drops on it
    const A = ans && cells.find((C) => C.d[0] === ans[0] && C.d[1] === ans[1]), done = s === 4 ? seg(p, 0.75, 0.9) : 0;
    ring.setAttribute("opacity", A && done > 0 ? done : 0);
    if (A) { ring.setAttribute("cx", A.cx); ring.setAttribute("cy", A.cy); }
    const drop = s === 4 ? easeOutBack(seg(p, 0.85, 1)) : 0;
    cake.setAttribute("opacity", A && drop > 0 ? 1 : 0);
    if (A) cake.setAttribute("transform", `translate(${A.cx + cw * 0.36} ${(A.cy - rh * 0.1 - 60 * (1 - drop)).toFixed(1)}) scale(0.8)`);
    // the friends: the speaker of each sentence talks and gestures; the other one turns to listen; Cheryl reacts
    const speaker = s === 1 || s === 3 ? 1 : s === 2 || s === 4 ? 0 : -1;
    const at = [[52, FLOOR], [436, FLOOR], [490, FLOOR]];
    const pose = at.map(([x, y], k) => ({ x, y, facing: k ? -1 : 1, gaze: [1, -0.6], breathe: 6 * p + k, blink: blinkAt(p, k), mood: "smile" }));
    if (s === 0) { pose[2].wave = seg(p, 0.02, 0.35); pose[2].mood = "grin"; pose[0].gaze = [1, -0.2]; pose[1].gaze = [1, -0.2]; }
    if (speaker >= 0) {
      const o = 1 - speaker, talk = seg(p, 0.05, 0.2) * (1 - seg(p, 0.85, 0.98));
      Object.assign(pose[speaker], { reach: talk, reachAngle: -30, mood: Math.sin(30 * p) > 0 ? "grin" : "o" });
      pose[o].gaze = [-1, 0]; pose[o].mood = "o";
    }
    if (s === 4 && done > 0) { pose.forEach((P0, k) => Object.assign(P0, { mood: "grin", hop: seg(p, 0.88 + 0.03 * k, 0.98 + 0.01 * k) })); pose[2].wave = seg(p, 0.85, 1); }
    people.forEach((P0, k) => posePerson(P0, pose[k]));
    const said = typeof SAY[s] === "function" ? SAY[s](u) : SAY[s], line = s === 0 ? [L ? "Guess my birthday!" : "Devinez mon anniversaire !", 2] : said ? [said[L], speaker] : null;
    // the bubbles sit in the strip under the calendar, on the speaker's side
    const sx = line ? [176, 330, 360][line[1]] : 0, appear = s === 0 ? seg(p, 0.05, 0.15) * (1 - seg(p, 0.4, 0.5)) : seg(p, 0.02, 0.12) * (1 - seg(p, s === 4 ? 0.65 : 0.9, s === 4 ? 0.75 : 1));
    poseBubble(bubble, line ? { x: sx, y: CAL.y + CAL.h + 36, text: line[0], appear } : { x: 0, y: 0, text: "", appear: 0 });
    hot.setAttribute("opacity", s === 4 ? seg(p, 0.85, 1) : 0);
  },
};
