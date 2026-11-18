// Animated solution of the ants challenge. `diagram` holds the captions; `scene` builds the garden, the ants and their
// ghosts once (mount) and poses them as a pure function of (step, p) (update).
import { P, ez, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { antStart, antsAt, bumps, lastFall } from "./maths.js";
import { makeAnt, poseAnt, drawGarden } from "./art.js";

const W = 520, H = 300, X0 = 40, X1 = 480, Y = 200, GROUND = 250, GY = 112;   // GY: the ghosts' line
const fmt = (s) => String(Math.round(s)).replace(".", ",");
const worst = (q) => { const a = antStart(q.L, q.n); a[0] = { x: 0, d: 1 }; return a; };
const pair = (L) => [{ x: Math.round(L / 2 - L / 6), d: 1 }, { x: Math.round(L / 2 + L / 6), d: -1 }];

export const diagram = {
  size: [W, H],
  dur: (step) => [5200, 4200, 5200, 5600, 5600][step],
  steps: (q) => [
    P(`${q.n} fourmis sur un bâton de ${q.L} cm, à 1 cm par seconde. À chaque rencontre, demi-tour !`, `${q.n} ants on a stick of ${q.L} cm, at 1 cm per second. At every meeting, they turn back!`),
    P("Regardons une seule rencontre : les deux fourmis se cognent et repartent chacune de son côté.", "Look at one meeting: the two ants bump and each goes back the way it came."),
    P("En haut, deux fantômes qui se traversent sans s’arrêter. Aux mêmes instants, ils occupent exactement les mêmes places que les fourmis.", "Above, two ghosts that walk through each other without stopping. At every moment they are at exactly the same places as the ants."),
    P(`Donc tout se passe comme si chaque fourmi marchait tout droit sans jamais se retourner : chaque fantôme quitte le bâton en ${q.L} s au plus.`, `So it is as if each ant walked straight on without ever turning: every ghost leaves the stick within ${q.L} s.`),
    P(`Et ${q.L} s est atteint : une fourmi posée à un bout, tournée vers l’autre, a tout le bâton à parcourir. Réponse : ${q.L}.`, `And ${q.L} s is reached: an ant at one end, facing the other, has the whole stick to cross. Answer: ${q.L}.`),
  ],
};

export const scene = {
  mount(c, q) {
    const L = q.L, n = q.n, size = n <= 6 ? 1.2 : n <= 9 ? 1 : 0.82;
    drawGarden(c.svg, { W, H, x0: X0, x1: X1, y: Y, L, ground: GROUND });
    const ghostLine = svgEl("g", {}, c.svg);
    svgEl("line", { x1: X0, y1: GY, x2: X1, y2: GY, stroke: "var(--ink)", "stroke-width": 1.4, "stroke-dasharray": "5 5", opacity: 0.6 }, ghostLine);
    c.text(X0, GY - 34, c.t("fantômes", "ghosts"), { class: "sol-small" }).setAttribute("fill", "var(--ink)");
    const links = svgEl("g", {}, c.svg);
    const ghosts = Array.from({ length: n }, (_, i) => makeAnt(c.svg, { fill: "#bdbdbd", size, ghost: true }));
    const ants = Array.from({ length: n }, (_, i) => makeAnt(c.svg, { fill: `color-mix(in srgb, ${colour(i)} 55%, #3a2a20)`, size }));
    const bubbles = [makeBubble(c.svg), makeBubble(c.svg)];
    const clock = c.text(70, 40, "", { ...mid, class: "sol-line" }), big = c.text(W - 60, 110, "", { ...mid, class: "sol-hot" });
    return { L, n, size, ghostLine, links, ghosts, ants, bubbles, clock, big, word: c.t("Demi-tour !", "Turn back!") };
  },
  update(S, s, p) {
    const { L, n, size, ghostLine, links, ghosts, ants, bubbles, clock, big, word } = S, X = (c) => X0 + ((X1 - X0) * c) / L;
    const q = { L, n }, setup = s === 1 || s === 2 ? pair(L) : s === 4 ? worst(q) : antStart(L, n);
    const end = s === 1 || s === 2 ? L / 3 : lastFall(setup, L), tSim = ez(p) * (end + (s >= 3 ? 0 : L * 0.08)), speed = L / 8;
    const state = antsAt(setup, L, tSim), list = bumps(setup, L), showGhosts = s >= 2;
    links.replaceChildren();
    ghostLine.setAttribute("opacity", showGhosts ? 1 : 0);
    ants.forEach((A, i) => {
      const st = state[i];
      if (!st) { A.root.setAttribute("opacity", 0); return; }
      A.root.setAttribute("opacity", 1);
      let x = X(st.x), y = Y, tilt = 0, mood = "smile", squash = 0;
      if (st.fallen) { const k = Math.min(1, ((tSim - st.fallT) / speed) * 1.4); x += st.fallen * (14 + 24 * k); y = Y + (GROUND + 26 - Y) * k * k; tilt = st.fallen * 200 * k; mood = k < 1 ? "o" : "flat"; }
      const b = list.find((m) => tSim >= m.t && tSim - m.t < speed * 0.4 && Math.abs(m.x - st.x) < tSim - m.t + 0.5);
      if (b && !st.fallen) { squash = 1 - (tSim - b.t) / (speed * 0.4); mood = "o"; }
      if (s === 4 && i === 0 && !st.fallen) mood = "grin";
      poseAnt(A, { x, y, facing: st.d, phase: st.fallen ? 0 : (X(st.x) - X0) / 4 + i, amp: st.fallen || p >= 1 ? 0 : 1, squash, tilt, mood });
    });
    ghosts.forEach((G, i) => {
      const a = setup[i];
      if (!a || !showGhosts) { G.root.setAttribute("opacity", 0); return; }
      const gx = a.x + a.d * tSim, out = gx < 0 || gx > L;
      G.root.setAttribute("opacity", out ? 0 : s === 4 && i !== 0 ? 0.25 : 0.55);
      poseAnt(G, { x: X(Math.max(0, Math.min(L, gx))), y: GY, facing: a.d, phase: (X(gx) - X0) / 4, amp: out || p >= 1 ? 0 : 1, mood: "smile" });
      if (s === 2 && !out) svgEl("line", { x1: X(gx), y1: GY + 4, x2: X(gx), y2: Y - 26 * size, stroke: "var(--object-ink)", "stroke-width": 1, "stroke-dasharray": "2 3" }, links);   // same places
    });
    const recent = s <= 1 ? list.filter((m) => tSim >= m.t && tSim - m.t < speed * 0.5).slice(-2) : [];
    bubbles.forEach((B, k) => { const m = recent[k]; poseBubble(B, m ? { x: X(m.x), y: Y - 34 * size, text: word, appear: seg((tSim - m.t) / (speed * 0.5), 0, 0.15) * (1 - seg((tSim - m.t) / (speed * 0.5), 0.7, 1)) } : { x: 0, y: 0, text: "", appear: 0 }); });
    clock.textContent = `${fmt(Math.min(tSim, end))} s`;
    big.textContent = s === 4 ? `${L} s` : "";
    big.setAttribute("opacity", s === 4 ? seg(p, 0.75, 1) : 0);
  },
};
