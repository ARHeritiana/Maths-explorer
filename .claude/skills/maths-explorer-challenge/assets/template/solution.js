// Animated solution of the __ID__ challenge. `diagram` holds the captions (steps); `scene` builds the cartoon once
// (mount) and poses it as a pure function of (step, p) (update). See common/player.js and references/design.md.
import { P, ez, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { seats, handshakes } from "./maths.js";
import { makePerson, posePerson } from "./art.js";

const CX = 180, CY = 160, R = 110;

export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P(`${q.n} personnes autour d’une table.`, `${q.n} people around a table.`),
    P(`Une personne serre la main des ${q.n - 1} autres.`, `One person shakes hands with the ${q.n - 1} others.`),
    P(`Chacune en fait autant : ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} mains tendues.`, `Everyone does the same: ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} hands held out.`),
    P(`Mais une poignée de main, c’est deux mains : ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`, `But one handshake is two hands: ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`),
  ],
};

export const scene = {
  // c: drawing context from common/kit.js makeCtx; build every element once and keep handles in S
  mount(c, q) {
    const n = q.n, S = seats(n, CX, CY, R), lines = svgEl("g", {}, c.svg);
    const people = S.map((_, i) => makePerson(c.svg, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, size: 1.4 }));
    const txt = [c.text(410, 120, `${n} × ${n - 1}`, { ...mid, class: "sol-line" }), c.text(410, 160, "÷ 2", { ...mid, class: "sol-line" }), c.text(410, 210, `${handshakes(n)}`, { ...mid, class: "sol-hot" })];
    return { n, S, lines, people, txt };
  },
  // a frame is a pure function of (step, p): everything is recomputed from them, nothing accumulates
  update(st, s, p) {
    const { n, S, lines, people, txt } = st, centre = (i) => Math.atan2(CY - S[i][1], CX - S[i][0]);
    lines.replaceChildren();
    const reach = (from, k) => { for (let j = 0; j < n; j++) if (j !== from) { const [a, b] = [S[from], S[j]]; svgEl("line", { x1: a[0], y1: a[1] - 16, x2: a[0] + (b[0] - a[0]) * k, y2: a[1] - 16 + (b[1] - a[1]) * k, stroke: colour(from), "stroke-width": 1.4, opacity: 0.7 }, lines); } };
    const active = s === 1 ? 1 : s >= 2 ? (s === 2 ? Math.ceil(ez(p) * n) : n) : 0;   // people who have reached out
    if (s === 1) reach(0, ez(p)); else for (let i = 0; i < active; i++) reach(i, 1);
    people.forEach((P, i) => posePerson(P, { x: S[i][0], y: S[i][1], angle: centre(i), reach: i < active ? 1 : 0, hop: s === 1 && i === 0 ? seg(p, 0.6, 1) : 0 }));
    txt[0].setAttribute("opacity", s >= 2 ? 1 : 0);
    txt[1].setAttribute("opacity", s === 3 ? seg(p, 0, 0.5) : 0);
    txt[2].setAttribute("opacity", s === 3 ? seg(p, 0.4, 1) : 0);
  },
};
