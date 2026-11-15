// Animated solution of the __ID__ challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { seats, handshakes } from "./maths.js";

export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P(`${q.n} personnes autour d’une table.`, `${q.n} people around a table.`),
    P(`Une personne serre la main des ${q.n - 1} autres.`, `One person shakes hands with the ${q.n - 1} others.`),
    P(`Chacune en fait autant : ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} mains tendues.`, `Everyone does the same: ${q.n} × ${q.n - 1} = ${q.n * (q.n - 1)} hands held out.`),
    P(`Mais une poignée de main, c’est deux mains : ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`, `But one handshake is two hands: ${q.n * (q.n - 1)} ÷ 2 = ${handshakes(q.n)}.`),
  ],
  // c: drawing context from common/kit.js makeCtx (line, circ, rect, text, path, wrap, t); s: step; p: progress 0..1
  draw(c, s, p, q) {
    const n = q.n, S = seats(n, 180, 150, 115);
    const lines = (from, k) => { for (let j = 0; j < n; j++) if (j !== from) { const a = S[from], b = S[j], u = k; c.line(a[0], a[1], a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, { stroke: colour(from), "stroke-width": 1.4, opacity: 0.7 }); } };
    if (s === 1) lines(0, ez(p));
    if (s >= 2) { const upto = s === 2 ? Math.ceil(ez(p) * n) : n; for (let i = 0; i < upto; i++) lines(i, 1); }
    S.forEach(([x, y], i) => c.circ(x, y, 8, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 }));
    if (s >= 2) c.text(410, 120, `${n} × ${n - 1}`, { ...mid, class: "sol-line" });
    if (s === 3) { c.text(410, 160, `÷ 2`, { ...mid, class: "sol-line", opacity: seg(p, 0, 0.5) }); c.text(410, 210, `${handshakes(n)}`, { ...mid, class: "sol-hot", opacity: seg(p, 0.4, 1) }); }
  },
};
