// Animated solution of the hanoi challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, clamp01, lerp, easeOutBack } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";

/* ================================================================= the towers of Hanoi */
export const hanoiMoves = (n, a, b, cc, out = []) => { if (n === 0) return out; hanoiMoves(n - 1, a, cc, b, out); out.push([n, a, cc]); hanoiMoves(n - 1, b, a, cc, out); return out; };

export const PEG = [100, 260, 420], BASE = 232, DH = 26;

export const scene = {
  size: [520, 300],
  dur: (s, q) => { const m = Math.min(Number(q.n), 3), moves = hanoiMoves(m, 0, 1, 2).length; return s === 0 ? 3000 : s <= moves ? 2000 : 4600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Math.min(Number(q.n), 3);
    dayScene(svg, { ground: 244 });
    el("rect", { x: 20, y: BASE, width: 480, height: 16, rx: 6, fill: "#a8723f", stroke: "#4b2d14", "stroke-width": 2 }, svg);
    PEG.forEach((x, i) => { el("rect", { x: x - 5, y: BASE - 150, width: 10, height: 150, rx: 5, fill: "#c98f52", stroke: "#4b2d14", "stroke-width": 1.6 }, svg); el("circle", { cx: x, cy: BASE - 152, r: 7, fill: "#f3c84a", stroke: "#4b2d14", "stroke-width": 1.4 }, svg); const t = el("text", { x, y: BASE + 32, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff;paint-order:stroke;stroke:#5a3a1a;stroke-width:3px" }, svg); t.textContent = `${c.t("Tige", "Peg")} ${i + 1}`; });
    const disks = Array.from({ length: m }, (_, k) => {
      const d = k + 1, w = 30 + d * 22, g = el("g", {}, svg), inner = el("g", {}, g);
      el("rect", { x: -w / 2, y: 0, width: w, height: DH - 3, rx: 9, fill: colour(d - 1), stroke: "#0004", "stroke-width": 1.4 }, inner);
      el("rect", { x: -w / 2 + 4, y: 3, width: w - 8, height: 5, rx: 2.5, fill: "#fff", opacity: 0.3 }, inner);
      const face = el("g", {}, inner); el("circle", { cx: -6, cy: 11, r: 2.4, fill: "#fff" }, face); el("circle", { cx: 6, cy: 11, r: 2.4, fill: "#fff" }, face); el("circle", { cx: -5.4, cy: 11.4, r: 1.1, fill: "#111" }, face); el("circle", { cx: 6.6, cy: 11.4, r: 1.1, fill: "#111" }, face);
      const mouth = el("path", { d: "M-4 16 q4 3 8 0", fill: "none", stroke: "#111", "stroke-width": 1.4, "stroke-linecap": "round" }, face);
      return { d, g, inner, mouth };
    });
    const board = pillAt(svg, 150, 8, 220, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(16) }, board);
    const rows = Array.from({ length: 8 }, () => ({ a: el("text", { "text-anchor": "middle", style: "font:600 13px var(--body);fill:#fff;paint-order:stroke;stroke:#2a3a6a;stroke-width:3px" }, svg), b: el("text", { "text-anchor": "middle", style: "font:700 18px var(--math);fill:#fff;paint-order:stroke;stroke:#2a3a6a;stroke-width:3px" }, svg) }));
    return { c, m, disks, label, rows };
  },
  update(S, step, p, q) {
    const { c, m, disks, label, rows } = S, HM = hanoiMoves(m, 0, 1, 2), last = HM.length + 1, nq = Number(q.n);
    const pegs = [Array.from({ length: m }, (_, i) => m - i), [], []];
    const done = Math.min(HM.length, Math.max(0, step - 1)), moving = step >= 1 && step <= HM.length ? HM[step - 1] : null;
    for (let i = 0; i < done; i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); }
    let lift = null;
    if (moving) { const [d, a, b] = moving; pegs[a].pop(); lift = { d, a, b }; }
    if (step === last) for (let i = done; i < HM.length; i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); }
    const pose = {};
    pegs.forEach((st, i) => st.forEach((d, k) => { pose[d] = { x: PEG[i], y: BASE - DH * (k + 1), sx: 1, sy: 1, mood: "ok" }; }));
    if (lift) {
      const { d, a, b } = lift, y0 = BASE - DH * (pegs[a].length + 1), y1 = BASE - DH * (pegs[b].length + 1), top = 48;
      const k1 = easeInOut(seg(p, 0, 0.3)), k2 = easeInOut(seg(p, 0.3, 0.7)), k3 = easeInOut(seg(p, 0.7, 0.92)), sq = Math.sin(clamp01(seg(p, 0.9, 1)) * Math.PI);
      const x = lerp(PEG[a], PEG[b], k2), y = p < 0.3 ? lerp(y0, top, k1) : p < 0.7 ? top : lerp(top, y1, k3);
      pose[d] = { x, y, sx: 1 + 0.08 * sq, sy: 1 - 0.14 * sq, mood: p > 0.3 && p < 0.7 ? "wow" : "ok", tilt: 6 * Math.sin(k2 * Math.PI) * (b > a ? 1 : -1) };
    }
    disks.forEach((o) => {
      const t = pose[o.d] || { x: PEG[0], y: BASE, sx: 1, sy: 1 };
      o.g.setAttribute("transform", `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${(t.tilt || 0).toFixed(1)})`);
      o.inner.setAttribute("transform", `translate(0 ${(DH - 3) * (1 - t.sy)}) scale(${t.sx} ${t.sy})`);
      o.mouth.setAttribute("d", step === last ? "M-6 15 q6 6 12 0" : t.mood === "wow" ? "M-3 16 q3 4 6 0 q-3 -2 -6 0" : "M-4 16 q4 3 8 0");
    });
    label.textContent = step === 0 ? `${m} ${c.t("disques", "disks")}` : step <= HM.length ? `${c.t("Coup", "Move")} ${step} / ${HM.length}` : `${c.t("Pour", "For")} ${nq} ${c.t("disques", "disks")} : ${2 ** nq - 1}`;
    const N = Math.min(nq, 8);
    rows.forEach((r, i) => {
      const on = step === last && i < N, x = 40 + i * (440 / Math.max(N - 1, 1)), u = on ? easeOutBack(seg(p, (i + 1) / (N + 2), (i + 1) / (N + 2) + 0.2)) : 0;
      r.a.setAttribute("x", x); r.a.setAttribute("y", 80); r.a.textContent = on ? `n = ${i + 1}` : ""; r.a.setAttribute("opacity", String(on ? 1 : 0));
      r.b.setAttribute("x", x); r.b.setAttribute("y", 112); r.b.textContent = on ? String(2 ** (i + 1) - 1) : ""; r.b.setAttribute("transform", `translate(${x} 112) scale(${Math.max(0.01, u)}) translate(${-x} -112)`); r.b.style.fill = i + 1 === nq ? "#ffd84a" : "#fff";
    });
  },
};

export const diagram = {
  size: [520, 300],
  steps: (q) => {
    const m = Math.min(q.n, 3), HM = hanoiMoves(m, 0, 1, 2), half = 2 ** (m - 1) - 1;
    return [
      P(`${m} disques sur la tige 1${q.n > m ? ` (on anime ${m} disques, la méthode est la même pour ${q.n})` : ""}. Pour libérer le grand disque, il faut d’abord déplacer les autres sur la tige 2.`, `${m} disks on peg 1${q.n > m ? ` (we animate ${m} disks, the method is the same for ${q.n})` : ""}. To free the big disk, the others must first move to peg 2.`),
      ...HM.map((mv, i) => P(`Coup ${i + 1} : le disque ${mv[0]} va de la tige ${mv[1] + 1} à la tige ${mv[2] + 1}.${i < half ? " (on déplace les petits disques)" : i === half ? " (le grand disque, une seule fois)" : " (on ramène les petits disques dessus)"}`, `Move ${i + 1}: disk ${mv[0]} goes from peg ${mv[1] + 1} to peg ${mv[2] + 1}.${i < half ? " (moving the small disks)" : i === half ? " (the big disk, only once)" : " (bringing the small disks back on top)"}`)),
      P(`Pour ${m} disques : ${half} + 1 + ${half} = ${2 ** m - 1} coups. En général u(n) = 2u(n − 1) + 1, donc u(n) = 2ⁿ − 1. Pour ${q.n} disques : ${2 ** q.n - 1} coups.`, `For ${m} disks: ${half} + 1 + ${half} = ${2 ** m - 1} moves. In general u(n) = 2u(n − 1) + 1, so u(n) = 2ⁿ − 1. For ${q.n} disks: ${2 ** q.n - 1} moves.`),
    ];
  },
  draw(c, s, p, q) {
    const m = Math.min(q.n, 3), HM = hanoiMoves(m, 0, 1, 2), last = HM.length + 1;
    const PEG = [100, 260, 420], BASE = 230, DH = 24, pegs = [Array.from({ length: m }, (_, i) => m - i), [], []];
    const done = Math.min(HM.length, Math.max(0, s - 1)), moving = s >= 1 && s <= HM.length ? HM[s - 1] : null;
    for (let i = 0; i < done; i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); }
    let lift = null;
    if (moving) { const [d, a, b] = moving; pegs[a].pop(); lift = { d, a, b }; }
    if (s === last) { for (let i = done; i < HM.length; i++) { const [d, a, b] = HM[i]; pegs[a].pop(); pegs[b].push(d); } }
    c.rect(30, BASE, 460, 8, { rx: 4, class: "hn-base" });
    PEG.forEach((x, i) => { c.rect(x - 4, BASE - 140, 8, 140, { rx: 4, class: "hn-pole" }); c.text(x, 262, `${c.t("Tige", "Peg")} ${i + 1}`, { class: "sol-small", "text-anchor": "middle" }); });
    const disk = (x, y, d) => c.rect(x - (30 + d * 22) / 2, y, 30 + d * 22, DH - 4, { rx: 7, class: "hn-disk", style: `fill:${colour(d - 1)}` });
    pegs.forEach((st, i) => st.forEach((d, k) => disk(PEG[i], BASE - DH * (k + 1), d)));
    if (lift) {
      const { d, a, b } = lift, y0 = BASE - DH * (pegs[a].length + 1), y1 = BASE - DH * (pegs[b].length + 1), top = 54;
      const k1 = ez(seg(p, 0, 0.3)), k2 = ez(seg(p, 0.3, 0.7)), k3 = ez(seg(p, 0.7, 1)), x = lerp(PEG[a], PEG[b], k2), y = p < 0.3 ? lerp(y0, top, k1) : p < 0.7 ? top : lerp(top, y1, k3);
      disk(x, y, d);
    }
    if (s >= 1 && s <= HM.length) c.text(260, 34, `${c.t("Coup", "Move")} ${s} / ${HM.length}`, { class: "sol-big small", "text-anchor": "middle" });
    if (s === last) {
      const N = Math.min(q.n, 8);
      for (let i = 1; i <= N; i++) { const x = 40 + (i - 1) * (440 / Math.max(N - 1, 1)); c.text(x, 56, `n = ${i}`, { class: "sol-small", "text-anchor": "middle" }); c.text(x, 86, 2 ** i - 1, { class: i === q.n ? "sol-hot" : "sol-line", "text-anchor": "middle", style: `opacity:${ez(seg(p, i / (N + 1), i / (N + 1) + 0.2))}` }); }
    }
  },
};
