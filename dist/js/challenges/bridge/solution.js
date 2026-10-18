// Animated solution of the bridge challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
//
// Animated solution of "Four soldiers on a bridge", drawn as a small cartoon: a night landscape, four soldiers made of
// separate parts and one lantern. It uses the player's mount/update protocol (see common/player.js): the scene is
// built once in mount(), then update(scene, step, p) poses it. A frame is still a pure function of (step, p), so the
// controls can scrub and replay it. A crossing lasts in proportion to its minutes: the slow soldier really is slow.
import { SCENE, nightBridge, makeLantern } from "./art.js";
import { bridgeTimes, bridgePlans, bridgeBest } from "./maths.js";
import { svgEl } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, easeOutBack, lerp } from "../common/scene-kit.js";

export const P = (fr, en) => [fr, en];

export const { WAIT_Y, LANE_Y, LEFT_EDGE: L, RIGHT_EDGE: R } = SCENE;

export const K = 1.3;

export const LOOKS = [
  { uniform: "#3b82f6", hat: 0, size: 0.86 * K, skin: "#f1c27d" },
  { uniform: "#e8710a", hat: 1, size: 0.94 * K, skin: "#e0ac69" },
  { uniform: "#2fa866", hat: 2, size: 1.0 * K, skin: "#f5d0a9" },
  { uniform: "#c2185b", hat: 3, size: 1.1 * K, skin: "#d8a47f", moustache: true, top: 80 },
];

export const slotX = (side, i) => (side === 0 ? 104 - 27 * i : 416 + 27 * i);

export const LAMP_REST = [118, 402];

export const planOf = (q) => { const t = bridgeTimes(q.set).sort((x, y) => x - y), pl = bridgePlans(t), best = pl.A.total <= pl.B.total ? "A" : "B"; return { t, pl, mv: pl[best].moves }; };

export const diagram = {
  size: [520, 300],
  // 0.9 s plus 0.34 s per minute of the crossing; the intro and the comparison get a fixed time.
  dur: (step, q) => { const { mv } = planOf(q); return step === 0 ? 2800 : step <= mv.length ? 900 + mv[step - 1][2] * 340 : 3800; },
  steps: (q) => { const { t, pl, mv } = planOf(q), who = (m) => m[0].join(" + ");
    return [
      P(`Quatre soldats : ${t.join(", ")} min. Une lampe, deux personnes au plus par traversée, au rythme du plus lent.`, `Four soldiers: ${t.join(", ")} min. One lamp, at most two people per crossing, at the pace of the slower one.`),
      ...mv.map((m, i) => P(`Traversée ${i + 1} : ${who(m)} ${m[1] === "over" ? "passent" : "revient"} (${m[2]} min). Total : ${mv.slice(0, i + 1).reduce((s, x) => s + x[2], 0)} min.`, `Crossing ${i + 1}: ${who(m)} ${m[1] === "over" ? "cross" : "comes back"} (${m[2]} min). Total: ${mv.slice(0, i + 1).reduce((s, x) => s + x[2], 0)} min.`)),
      P(`Plan 1 : ${pl.A.total} min. Plan 2 (le plus rapide escorte chacun) : ${pl.B.total} min. Le meilleur : ${bridgeBest(t)} min. L’idée : les deux plus lents passent ensemble, leur lenteur ne coûte qu’une fois.`, `Plan 1: ${pl.A.total} min. Plan 2 (the fastest escorts everyone): ${pl.B.total} min. The better: ${bridgeBest(t)} min. The idea: the two slowest cross together so their slowness is paid only once.`),
    ]; },

  mount(c, q) {
    const svg = c.svg, { t, pl, mv } = planOf(q);
    nightBridge(svg);
    const layer = svgEl("g", {}, svg);
    const men = t.map((m, i) => makeSoldier(layer, { ...LOOKS[i], label: String(m) }));
    const lamp = makeLantern(layer);
    // minute counter (steps of the crossings) and the final comparison panel
    const pill = svgEl("g", {}, svg);
    svgEl("rect", { x: 160, y: 12, width: 200, height: 34, rx: 17, fill: "#0a0f2c", opacity: 0.72 }, pill);
    const clock = svgEl("text", { x: 260, y: 36, "text-anchor": "middle", style: "font:700 20px var(--body);fill:#fff" }, pill);
    const panel = svgEl("g", {}, svg);
    svgEl("rect", { x: 138, y: 6, width: 372, height: 74, rx: 12, fill: "#0a0f2c", opacity: 0.78 }, panel);
    const maxT = Math.max(pl.A.total, pl.B.total), bestKey = pl.A.total <= pl.B.total ? "A" : "B";
    const bars = ["A", "B"].map((k, i) => {
      const y = 14 + i * 32;
      const lab = svgEl("text", { x: 150, y: y + 18, style: "font:700 14px var(--body);fill:#fff" }, panel); lab.textContent = `${c.t("Plan", "Plan")} ${i + 1}`;
      const bar = svgEl("rect", { x: 212, y, width: 1, height: 24, rx: 6, fill: k === bestKey ? "#ffd04d" : "#8aa0ff" }, panel);
      const val = svgEl("text", { y: y + 18, style: "font:700 14px var(--body);fill:#fff" }, panel);
      return { k, bar, val, v: pl[k].total };
    });
    return { c, men, lamp, layer, pill, clock, panel, bars, maxT, mv, t, last: -1 };
  },

  update(S, step, p) {
    const { men, lamp, layer, pill, clock, panel, bars, maxT, mv, t } = S, n = mv.length;
    const moving = step >= 1 && step <= n ? mv[step - 1] : null;
    const done = step === 0 ? 0 : Math.min(n, step - 1 + (step > n ? 1 : 0));
    const side = [0, 0, 0, 0]; let torch = 0, elapsed = 0;
    for (let i = 0; i < done; i++) { mv[i][0].forEach((m) => { side[t.indexOf(m)] ^= 1; }); torch ^= 1; elapsed += mv[i][2]; }
    const finale = step > n, groundLamp = (s) => [LAMP_REST[s], WAIT_Y - 19];

    const pose = men.map((m, i) => ({ x: slotX(side[i], i), y: WAIT_Y, dir: side[i] === 0 ? 1 : -1 }));
    // introduction: the soldiers pop in one after the other
    if (step === 0) pose.forEach((o, i) => { o.scale = easeOutBack(seg(p, i * 0.14, i * 0.14 + 0.3)); });
    // finale: everyone cheers on the far side
    if (finale) pose.forEach((o, i) => { const k = easeInOut(seg(p, 0.35 + i * 0.03, 0.5 + i * 0.03)); o.cheer = k; o.hop = k * Math.abs(Math.sin((p * 3 + i * 0.17) * Math.PI)) * 9; o.phase = p * 6; });

    let lampPos = groundLamp(torch), lampAngle = step === 0 ? 4 * Math.sin(p * 12.6) : 0, minutes = elapsed;
    if (moving) {
      const dirv = moving[1] === "over" ? 1 : -1, from = dirv === 1 ? 0 : 1, to = 1 - from;
      const entry = dirv === 1 ? L + 10 : R - 10, exit = dirv === 1 ? R - 10 : L + 10;
      const u = seg(p, 0.06, 0.94), m = moving[2];
      const amp0 = Math.min(1.3, Math.max(0.65, 1.5 - m * 0.09)), ramp = easeInOut(Math.min(seg(p, 0.03, 0.12), 1 - seg(p, 0.88, 0.97)));
      minutes = elapsed + Math.round(m * u);
      moving[0].forEach((mt, j) => {
        const i = t.indexOf(mt), a = slotX(from, i), b = slotX(to, i), off = -dirv * 34 * j;
        const pts = [[a, WAIT_Y], [a, LANE_Y], [entry + off, LANE_Y], [exit + off, LANE_Y], [b, LANE_Y], [b, WAIT_Y]];
        const lens = pts.slice(1).map((q, k) => Math.hypot(q[0] - pts[k][0], q[1] - pts[k][1])), total = lens.reduce((s, x) => s + x, 0);
        let d = u * total, k = 0;
        while (k < lens.length - 1 && d > lens[k]) { d -= lens[k]; k++; }
        const f = lens[k] ? d / lens[k] : 0;
        Object.assign(pose[i], { x: lerp(pts[k][0], pts[k + 1][0], f), y: lerp(pts[k][1], pts[k + 1][1], f), dir: dirv, phase: (u * total) / 40, amp: amp0 * ramp, carry: j === 0 && p > 0.05 && p < 0.95, moving: true });
      });
      const lead = t.indexOf(moving[0][0]), hand = men[lead].hand(pose[lead]);
      const g0 = groundLamp(from), g1 = groundLamp(to), w = p < 0.5 ? easeInOut(seg(p, 0, 0.14)) : 1 - easeInOut(seg(p, 0.86, 1));
      const g = p < 0.5 ? g0 : g1;
      lampPos = [lerp(g[0], hand[0], w), lerp(g[1], hand[1] + 1, w)];
      lampAngle = w * (6 * Math.sin(pose[lead].phase * 6.283) - dirv * 4);
    }
    // draw order: those who wait, then the walkers in front, then the lantern
    if (S.last !== step) {
      men.map((m, i) => [m, pose[i].moving ? 1 : 0]).sort((a, b) => a[1] - b[1]).forEach(([m]) => layer.append(m.root));
      layer.append(lamp.root); S.last = step;
    }
    men.forEach((m, i) => m.set(pose[i]));
    lamp.set({ x: lampPos[0], y: lampPos[1], angle: lampAngle });

    pill.setAttribute("opacity", finale ? 0 : 1);
    clock.textContent = `${S.c.t("Temps", "Time")} : ${minutes} min`;
    panel.setAttribute("opacity", finale ? easeInOut(seg(p, 0, 0.15)) : 0);
    bars.forEach((b, i) => {
      const w = Math.max(1, 230 * (b.v / maxT) * easeInOut(seg(p, 0.1 + i * 0.1, 0.7 + i * 0.1)));
      b.bar.setAttribute("width", w.toFixed(1)); b.val.setAttribute("x", (218 + w).toFixed(1));
      const best = b.v === Math.min(...bars.map((x) => x.v));
      b.val.textContent = `${Math.round(b.v * easeInOut(seg(p, 0.1 + i * 0.1, 0.7 + i * 0.1)))} min${best && p > 0.85 ? " ✓" : ""}`;
    });
  },
};
