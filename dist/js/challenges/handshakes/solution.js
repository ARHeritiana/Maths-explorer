// Animated solution of the handshakes challenge. `diagram` holds the captions (steps); `scene` builds the cartoon once
// (mount) and poses it as a pure function of (step, p) (update): nothing accumulates between frames.
import { P, ez, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { handshakes } from "./maths.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { layout, handAt, aimAt } from "./plan.js";

const ROOM = { cx: 200, cy: 200, rx: 162, ry: 80 };

export const diagram = {
  size: [520, 300],
  dur: (step) => [3200, 6000, 4200, 3800][step],
  steps: (q) => [
    P(`${q.n} personnes se retrouvent autour d’une table.`, `${q.n} people meet around a table.`),
    P(`A serre la main de chacune des ${q.n - 1} autres : ${q.n - 1} poignées de main.`, `A shakes hands with each of the ${q.n - 1} others: ${q.n - 1} handshakes.`),
    P(`Chacune en fait autant : ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} mains tendues.`, `Everyone does the same: ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} hands held out.`),
    P(`Mais une poignée de main, c’est deux mains : ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`, `But one handshake is two hands: ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`),
  ],
};

export const scene = {
  mount(c, q) {
    const n = q.n, L = layout(n, ROOM), T = L.table;
    svgEl("ellipse", { cx: ROOM.cx, cy: ROOM.cy + 4, rx: ROOM.rx + 30, ry: ROOM.ry + 26, fill: "color-mix(in srgb, var(--object-ink) 9%, transparent)" }, c.svg);   // rug
    const back = svgEl("g", {}, c.svg);
    svgEl("rect", { x: T.cx - 6, y: T.cy, width: 12, height: 26, fill: "#8d5f2d", stroke: "var(--ink)", "stroke-width": 1.2 }, c.svg);   // table foot
    svgEl("ellipse", { cx: T.cx, cy: T.cy, rx: T.rx, ry: T.ry, fill: "#c58b52", stroke: "var(--ink)", "stroke-width": 1.6 }, c.svg);
    svgEl("ellipse", { cx: T.cx - T.rx * 0.25, cy: T.cy - T.ry * 0.3, rx: T.rx * 0.45, ry: T.ry * 0.25, fill: "#fff", opacity: 0.18 }, c.svg);   // shine
    const front = svgEl("g", {}, c.svg), lines = svgEl("g", { opacity: 0.6 }, c.svg), bubbles = svgEl("g", {}, c.svg);
    // people behind the table are drawn before it, the others after
    const people = L.seats.map(([, y], i) => makePerson(y < T.cy ? back : front, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, look: i, size: L.size }));
    const name = svgEl("text", { "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: "var(--ink)" }, front);
    const hello = makeBubble(bubbles);
    const txt = [c.text(450, 110, "", { ...mid, class: "sol-line" }), c.text(450, 150, "÷ 2", { ...mid, class: "sol-line" }), c.text(450, 200, `${handshakes(n)}`, { ...mid, class: "sol-hot" })];
    return { n, L, people, lines, hello, name, txt, lang: c.t("fr", "en") };
  },
  update(st, s, p) {
    const { n, L, people, lines, hello, name, txt, lang } = st, S = L.seats, size = L.size, centre = [ROOM.cx, ROOM.cy - 30];
    const word = lang === "fr" ? "Enchanté !" : "Nice to meet you!";
    lines.replaceChildren();
    const line = (i, j, k = 1, col = colour(i)) => { const a = handAt(S[i], size), b = handAt(S[j], size); svgEl("line", { x1: a[0], y1: a[1], x2: a[0] + (b[0] - a[0]) * k, y2: a[1] + (b[1] - a[1]) * k, stroke: col, "stroke-width": 1.6, "stroke-linecap": "round" }, lines); };
    // default pose: idle, breathing and looking at the table; the breathing and the blinks are functions of p
    const pose = S.map((at, i) => ({ x: at[0], y: at[1], ...aimAt(at, centre, size), gaze: [Math.sign(centre[0] - at[0]) * 0.5, 0.3], breathe: 6 * p + i, blink: Math.abs(Math.sin(9 * p + i * 1.7)) > 0.998 ? 1 : 0, mood: "smile" }));
    let bubble = null;
    if (s === 0) {   // hello: each one waves in turn
      S.forEach((_, i) => { const w = seg(p, (i / n) * 0.8, (i / n) * 0.8 + 0.25); if (w > 0 && w < 1) Object.assign(pose[i], { wave: w, mood: "grin" }); });
    }
    if (s === 1) {   // A meets the others one by one
      const u = Math.min(n - 1 - 1e-9, ez(p) * (n - 1)), idx = Math.floor(u), k = p >= 1 ? 1 : u - idx, j = idx + 1;
      for (let m = 1; m < j; m++) line(0, m);
      line(0, j, seg(k, 0.15, 0.45));
      const a = aimAt(S[0], handAt(S[j], size), size), b = aimAt(S[j], handAt(S[0], size), size), shake = seg(k, 0.3, 0.6) * (1 - seg(k, 0.85, 1));
      Object.assign(pose[0], { facing: a.facing, reachAngle: a.angle, reach: shake, gaze: [a.facing, 0.2], mood: shake > 0.5 ? "grin" : "smile", hop: seg(k, 0.45, 0.75) });
      Object.assign(pose[j], { facing: b.facing, reachAngle: b.angle, reach: shake, gaze: [b.facing, -0.2], mood: shake > 0.5 ? "grin" : "o", hop: seg(k, 0.45, 0.75) });
      S.forEach((_, i) => { if (i !== 0 && i !== j) pose[i].gaze = [Math.sign(S[0][0] - S[i][0]), -0.4]; });   // the others watch
      bubble = { at: handAt(S[0], size), appear: seg(k, 0.3, 0.45) * (1 - seg(k, 0.8, 0.95)) };
      txt[0].textContent = `${Math.min(j - (k < 0.45 ? 1 : 0), n - 1)}`;
    }
    if (s >= 2) {   // everyone reaches out; in step 2 the lines appear person by person
      const upto = s === 2 ? Math.ceil(ez(p) * n) : n;
      for (let i = 0; i < upto; i++) for (let j = 0; j < n; j++) if (j !== i) line(i, j, s === 2 && i === upto - 1 ? seg(ez(p) * n - (upto - 1), 0, 1) : 1);
      S.forEach((at, i) => { if (i < upto) Object.assign(pose[i], { reach: 1, reachAngle: aimAt(at, centre, size).angle, mood: "grin" }); });
      txt[0].textContent = `${n} × ${n - 1}`;
    }
    if (s === 3) S.forEach((_, i) => Object.assign(pose[i], { hop: seg(p, 0.65 + 0.2 * (i / n), 0.85 + 0.15 * (i / n)), reach: 1 - seg(p, 0.6, 0.8) }));   // the final cheer
    people.forEach((Pp, i) => posePerson(Pp, pose[i]));
    name.setAttribute("x", S[0][0]); name.setAttribute("y", S[0][1] + 14); name.textContent = "A";
    poseBubble(hello, bubble ? { x: bubble.at[0] + 6, y: Math.max(36, bubble.at[1] - 34 * size), text: word, appear: bubble.appear } : { x: 0, y: 0, text: word, appear: 0 });
    txt[0].setAttribute("opacity", s >= 1 ? 1 : 0);
    txt[1].setAttribute("opacity", s === 3 ? seg(p, 0, 0.4) : 0);
    txt[2].setAttribute("opacity", s === 3 ? seg(p, 0.3, 0.7) : 0);
  },
};
