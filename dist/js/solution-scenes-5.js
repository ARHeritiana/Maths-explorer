// Cartoon solutions, batch 5: the towers of Hanoi, friends and strangers (Ramsey), paths in a city grid.
import { svgEl, colour } from "./challenge-kit.js";
import { pascalGrid, gridPaths } from "./challenge-puzzles.js";
import { lerp, seg, easeInOut, easeOutBack, clamp01, makeSoldier } from "./scene-kit.js";
import { dayScene } from "./scene-props.js";

const el = svgEl;
const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;
const pillAt = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };

/* ================================================================= the towers of Hanoi */
const hanoiMoves = (n, a, b, cc, out = []) => { if (n === 0) return out; hanoiMoves(n - 1, a, cc, b, out); out.push([n, a, cc]); hanoiMoves(n - 1, b, a, cc, out); return out; };
const PEG = [100, 260, 420], BASE = 232, DH = 26;
const hanoi = {
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

/* ================================================================= friends and strangers */
const ring = (n, i) => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180; return [190 + 105 * Math.cos(a), 150 + 105 * Math.sin(a)]; };
const LOOK = [{ uniform: "#3b82f6", hat: 0 }, { uniform: "#e8710a", hat: 1 }, { uniform: "#2fa866", hat: 2 }, { uniform: "#c2185b", hat: 3 }];
function ramseyFrame(step, p, q) {
  const blue = "#4a8cff", orange = "#ff9a3c", out = { n: 0, nodes: [], edges: [], tris: [], texts: [] };
  const edge = (A, B, col, dash, k = 1, w = 4) => out.edges.push({ A, B, col, dash, k, w });
  if (Number(q.s) === 4) {
    if (step <= 1) {
      const n = 8, friend = (i, j) => [1, 4, 7].includes((j - i + n) % n); let idx = 0; out.n = n;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const f = friend(i, j), k = step === 0 ? easeInOut(seg(p, (idx++ / 28) * 0.7, (idx / 28) * 0.7 + 0.3)) : 1; edge(ring(n, i), ring(n, j), f ? blue : orange, !f, k, f ? 4 : 1.8); }
      for (let i = 0; i < n; i++) out.nodes.push({ label: String(i + 1) });
      out.texts.push([420, 140, step === 1 ? "0" : "3", "big"], [420, 176, step === 1 ? "trio" : "ami", "sub"]);
      return out;
    }
    const n = 9, A = ring(n, 0), fr = step === 2 ? [1, 2, 3, 4] : [1, 2, 3], st = step === 2 ? [5, 6, 7, 8] : [4, 5, 6, 7, 8]; out.n = n;
    fr.forEach((i, k) => edge(A, ring(n, i), blue, false, easeInOut(seg(p, k / 6, k / 6 + 0.3))));
    st.forEach((i, k) => edge(A, ring(n, i), orange, true, step === 2 ? easeInOut(seg(p, 0.5 + k / 8, 0.8 + k / 8)) : easeInOut(seg(p, k / 7, k / 7 + 0.3)), 2.5));
    for (let i = 0; i < n; i++) out.nodes.push({ label: i === 0 ? "A" : "", hot: step === 2 && i >= 1 && i <= 4 ? blue : "" });
    if (step === 2) out.texts.push([420, 120, "4 ?", "big"]); if (step === 3) out.texts.push([420, 120, "≤ 5", "big"]);
    if (step === 4) out.texts.push([420, 120, "9 × 3 = 27", "bigsmall"]);
    return out;
  }
  if (step <= 1) {
    out.n = 5;
    for (let i = 0; i < 5; i++) edge(ring(5, i), ring(5, (i + 1) % 5), blue, false, step === 0 ? easeInOut(seg(p, i / 10, i / 10 + 0.2)) : 1);
    for (let i = 0; i < 5; i++) edge(ring(5, i), ring(5, (i + 2) % 5), orange, true, step === 0 ? easeInOut(seg(p, 0.5 + i / 10, 0.7 + i / 10)) : 1, 3);
    for (let i = 0; i < 5; i++) out.nodes.push({ label: String(i + 1) });
    if (step === 1) out.texts.push([400, 140, "0", "big"]);
    return out;
  }
  out.n = 6; const V = (i) => ring(6, i), Aq = V(0), friends = [1, 2, 3], others = [4, 5];
  friends.forEach((i, k) => edge(Aq, V(i), blue, false, step === 2 ? easeInOut(seg(p, k / 6, k / 6 + 0.3)) : 1));
  others.forEach((i, k) => edge(Aq, V(i), orange, true, step === 2 ? easeInOut(seg(p, 0.5 + k / 6, 0.8 + k / 6)) : 1, 3));
  if (step === 4) { edge(V(1), V(2), blue, false, easeInOut(p)); out.tris.push({ pts: [Aq, V(1), V(2)], col: blue, op: 0.35 * easeInOut(p) }); }
  if (step === 5) { [[1, 2], [2, 3], [1, 3]].forEach(([a, b], k) => edge(V(a), V(b), orange, true, easeInOut(seg(p, k / 4, k / 4 + 0.3)), 3)); out.tris.push({ pts: [V(1), V(2), V(3)], col: orange, op: 0.35 * easeInOut(seg(p, 0.6, 1)) }); }
  for (let i = 0; i < 6; i++) out.nodes.push({ label: "ABCDEF"[i], hot: step >= 3 && friends.includes(i) ? blue : "" });
  if (step === 2) out.texts.push([400, 150, "5", "big"]);
  return out;
}
const ramsey = {
  size: [520, 300],
  dur: (s) => 3800,
  steps: null,
  mount(c, q) {
    const svg = c.svg;
    dayScene(svg, { ground: 262 });
    el("ellipse", { cx: 190, cy: 160, rx: 168, ry: 132, fill: "#8bc98a", opacity: 0.85 }, svg);
    const tris = [el("path", { opacity: 0 }, svg), el("path", { opacity: 0 }, svg)];
    const lines = Array.from({ length: 40 }, () => el("line", { "stroke-linecap": "round", opacity: 0 }, svg));
    const men = Array.from({ length: 9 }, (_, i) => makeSoldier(svg, { ...LOOK[i % 4], size: 0.7, skin: ["#f1c27d", "#e0ac69", "#f5d0a9", "#d8a47f"][i % 4], label: "" }));
    const rings = Array.from({ length: 9 }, () => el("circle", { r: 26, fill: "none", stroke: "#4a8cff", "stroke-width": 4, opacity: 0 }, svg));
    const texts = [0, 1].map(() => el("text", { "text-anchor": "middle" }, svg));
    const legend = el("g", {}, svg); el("rect", { x: 330, y: 214, width: 12, height: 5, rx: 2, fill: "#4a8cff" }, legend); el("rect", { x: 330, y: 234, width: 12, height: 5, rx: 2, fill: "#ff9a3c" }, legend);
    const l1 = el("text", { x: 348, y: 221, style: "font:600 13px var(--body);fill:#1f3a24" }, legend), l2 = el("text", { x: 348, y: 241, style: "font:600 13px var(--body);fill:#1f3a24" }, legend);
    const board = pillAt(svg, 232, 8, 280, 30), label = el("text", { x: 372, y: 29, "text-anchor": "middle", style: white(14) }, board);
    return { c, tris, lines, men, rings, texts, l1, l2, label };
  },
  update(S, step, p, q) {
    const { c, tris, lines, men, rings, texts, l1, l2, label } = S, f = ramseyFrame(step, p, q);
    lines.forEach((ln, i) => { const e = f.edges[i]; if (!e) { ln.setAttribute("opacity", "0"); return; } ln.setAttribute("x1", e.A[0]); ln.setAttribute("y1", e.A[1]); ln.setAttribute("x2", lerp(e.A[0], e.B[0], e.k)); ln.setAttribute("y2", lerp(e.A[1], e.B[1], e.k)); ln.setAttribute("stroke", e.col); ln.setAttribute("stroke-width", e.w); ln.setAttribute("stroke-dasharray", e.dash ? "9 6" : "none"); ln.setAttribute("opacity", e.k > 0.01 ? "0.95" : "0"); });
    tris.forEach((t, i) => { const tr = f.tris[i]; if (!tr) { t.setAttribute("opacity", "0"); return; } t.setAttribute("d", `M${tr.pts.map((q2) => q2.join(" ")).join("L")}Z`); t.setAttribute("fill", tr.col); t.setAttribute("opacity", String(tr.op)); });
    men.forEach((m, i) => {
      const nd = f.nodes[i];
      if (!nd) { m.set({ x: 0, y: 0, scale: 0 }); rings[i].setAttribute("opacity", "0"); return; }
      const [x, y] = ring(f.n, i);
      m.set({ x, y: y + 14, dir: x < 190 ? 1 : -1, phase: p * 3, amp: 0, scale: 1, hop: nd.hot ? 4 * Math.abs(Math.sin(p * 10 + i)) : 0, cheer: nd.hot ? 0.6 : 0 });
      rings[i].setAttribute("cx", x); rings[i].setAttribute("cy", y - 8); rings[i].setAttribute("stroke", nd.hot || "#4a8cff"); rings[i].setAttribute("opacity", nd.hot ? "0.9" : "0");
      const bt = m.root.querySelector("text"); if (bt) bt.textContent = nd.label || "";
    });
    texts.forEach((t, i) => { const d = f.texts[i]; if (!d) { t.textContent = ""; return; } t.setAttribute("x", d[0]); t.setAttribute("y", d[1]); t.textContent = d[2] === "ami" ? c.t("amis chacun", "friends each") : d[2] === "trio" ? c.t("trio interdit", "no forbidden group") : d[2]; t.setAttribute("style", d[3] === "sub" ? "font:600 14px var(--body);fill:#1f3a24" : `font:700 ${d[3] === "bigsmall" ? 30 : 46}px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:5px`); });
    l1.textContent = c.t("amis", "friends"); l2.textContent = c.t("pas amis", "not friends");
    const six = Number(q.s) === 3;
    label.textContent = six ? [c.t("5 personnes suffisent-elles ?", "are 5 people enough?"), c.t("aucun trio d’une seule couleur", "no one-colour trio"), c.t("6 personnes : regardons A", "6 people: look at A"), c.t("5 relations, 2 couleurs", "5 relations, 2 colours"), c.t("deux amis parmi B, C, D", "two friends among B, C, D"), c.t("sinon B, C, D sont inconnus", "otherwise B, C, D are strangers")][step] : [c.t("8 personnes en cercle", "8 people in a circle"), c.t("ni trio d’amis ni 4 inconnus", "no friend trio, no 4 strangers"), c.t("9 personnes : A a au plus 3 amis", "9 people: A has at most 3 friends"), c.t("et au plus 5 inconnus", "and at most 5 strangers"), c.t("27 est impair : impossible", "27 is odd: impossible")][step];
  },
};

/* ================================================================= paths in a city grid */
const SAMPLE = (m, n) => { const w = []; let r = m, u = n; while (r || u) { if (r && (w.length % 2 === 0 || !u)) { w.push("R"); r--; } else { w.push("U"); u--; } } return w; };
const gridpaths = {
  size: [520, 300],
  dur: (s) => [3200, 5200, 4200, 5600, 3800][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Number(q.m), n = Number(q.n), X0 = 50, Y0 = 52, DX = Math.min(44, 420 / m), DY = Math.min(38, 200 / n), px = (i) => X0 + i * DX, py = (j) => Y0 + (n - j) * DY;
    dayScene(svg, { ground: 280 });
    el("rect", { x: X0 - 22, y: Y0 - 22, width: m * DX + 44, height: n * DY + 44, rx: 14, fill: "#cfd8c4", stroke: "#8a9a7a", "stroke-width": 2 }, svg);
    for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) { const hgt = 6 + ((i * 7 + j * 11) % 5) * 2.4; el("rect", { x: px(i) + 7, y: py(j + 1) + 7, width: DX - 14, height: DY - 14, rx: 4, fill: ["#d9a86a", "#e8b0a0", "#a8c8e8", "#cfe0a0"][(i + 2 * j) % 4], stroke: "#0002", "stroke-width": 1 }, svg); void hgt; }
    for (let j = 0; j <= n; j++) el("line", { x1: px(0), y1: py(j), x2: px(m), y2: py(j), stroke: "#6b6f78", "stroke-width": 7, "stroke-linecap": "round" }, svg);
    for (let i = 0; i <= m; i++) el("line", { x1: px(i), y1: py(0), x2: px(i), y2: py(n), stroke: "#6b6f78", "stroke-width": 7, "stroke-linecap": "round" }, svg);
    for (let j = 0; j <= n; j++) el("line", { x1: px(0), y1: py(j), x2: px(m), y2: py(j), stroke: "#fff", "stroke-width": 1.2, "stroke-dasharray": "5 6" }, svg);
    for (let i = 0; i <= m; i++) el("line", { x1: px(i), y1: py(0), x2: px(i), y2: py(n), stroke: "#fff", "stroke-width": 1.2, "stroke-dasharray": "5 6" }, svg);
    const trail = el("path", { fill: "none", stroke: "#e8710a", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.9 }, svg);
    const nodes = []; for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) { const g = el("g", { transform: `translate(${px(i)} ${py(j)})` }, svg); const b = el("circle", { r: 12, fill: "#fff", stroke: "#2b2538", "stroke-width": 1.6 }, g); const t = el("text", { y: 4, "text-anchor": "middle", style: "font:700 11px var(--body);fill:#2b2538" }, g); nodes.push({ g, b, t, i, j }); }
    const hl = el("path", { fill: "none", stroke: "#e8710a", "stroke-width": 3.5, "stroke-linecap": "round" }, svg);
    const flagA = el("g", {}, svg), flagB = el("g", {}, svg);
    for (const [g, x, y, ch, col] of [[flagA, px(0) - 22, py(0) + 8, "A", "#2fa866"], [flagB, px(m) + 22, py(n) - 8, "B", "#d32f2f"]]) { g.setAttribute("transform", `translate(${x} ${y})`); el("circle", { r: 13, fill: col, stroke: "#fff", "stroke-width": 2 }, g); const t = el("text", { y: 5, "text-anchor": "middle", style: "font:700 15px var(--body);fill:#fff" }, g); t.textContent = ch; }
    const walker = makeSoldier(svg, { uniform: "#e8710a", hat: 0, size: 0.7, label: "" });
    const wordG = el("g", {}, svg), word = Array.from({ length: m + n }, () => { const g = el("g", {}, wordG); const r = el("rect", { height: 22, rx: 5, stroke: "#2b2538", "stroke-width": 1 }, g); const t = el("text", { y: 16, "text-anchor": "middle", style: "font:700 13px var(--body)" }, g); return { g, r, t }; });
    const board = pillAt(svg, 110, 8, 300, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    const eq = el("text", { x: 260, y: 296, "text-anchor": "middle", style: "font:700 19px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:4px" }, svg);
    return { c, m, n, px, py, trail, nodes, hl, walker, word, wordG, label, eq, g: pascalGrid(m, n) };
  },
  update(S, step, p, q) {
    const { c, m, n, px, py, trail, nodes, hl, walker, word, wordG, label, eq, g } = S, w = SAMPLE(m, n);
    const shown = step === 1 ? easeInOut(seg(p, 0.05, 0.95)) * w.length : step === 2 ? w.length : 0;
    // the courier's route
    let i = 0, j = 0; const pts = [[0, 0]];
    for (let k = 0; k < Math.floor(shown); k++) { w[k] === "R" ? i++ : j++; pts.push([i, j]); }
    let cur = [i, j];
    if (shown < w.length && step >= 1) { const k = Math.floor(shown), f = shown - k; if (k < w.length) { cur = [i + (w[k] === "R" ? f : 0), j + (w[k] === "U" ? f : 0)]; pts.push(cur); } }
    trail.setAttribute("d", step >= 1 && step <= 2 ? `M${pts.map(([a, b]) => `${px(a)} ${py(b)}`).join("L")}` : "");
    const dirR = shown < w.length ? w[Math.min(w.length - 1, Math.floor(shown))] === "R" : true;
    walker.set({ x: px(cur[0]), y: py(cur[1]) + 14, dir: 1, phase: shown * 1.2, amp: step === 1 && p > 0.05 && p < 0.95 ? 1 : 0, scale: step <= 2 ? 1 : 0, hop: 0 });
    void dirR;
    const diagShown = step === 3 ? Math.floor(easeInOut(p) * (m + n + 1) + 0.0001) : step === 4 ? m + n + 1 : 0;
    nodes.forEach((nd) => {
      const on = nd.i + nd.j < diagShown, big = g[nd.j][nd.i], last = nd.i === m && nd.j === n, born = on ? easeOutBack(clamp01((diagShown - (nd.i + nd.j)) * 1.6)) : 0;
      nd.g.setAttribute("transform", `translate(${px(nd.i)} ${py(nd.j)}) scale(${step >= 3 ? (on ? Math.max(0.01, 1 + (born - 1) * 0.6) : 0.55) : 0.34})`);
      nd.b.setAttribute("fill", on && last && step === 4 ? "#2fa866" : "#fff"); nd.b.setAttribute("stroke", on ? "#2b2538" : "#9aa0a8");
      nd.t.textContent = on ? String(big) : ""; nd.t.style.fontSize = `${big > 9999 ? 6.5 : big > 999 ? 8 : big > 99 ? 9.5 : 11}px`; nd.t.style.fill = on && last && step === 4 ? "#fff" : "#2b2538";
    });
    // highlight of the two neighbours added at the current diagonal
    let d3 = "";
    if (step === 3 && diagShown >= 2 && diagShown <= m + n) { const d = diagShown - 1; for (let ii = 0; ii <= m; ii++) { const jj = d - ii; if (jj >= 1 && jj <= n && ii >= 1) d3 += `M${px(ii - 1)} ${py(jj)}L${px(ii)} ${py(jj)}M${px(ii)} ${py(jj - 1)}L${px(ii)} ${py(jj)}`; } }
    hl.setAttribute("d", d3);
    // the word of the path
    const cell = Math.min(24, 440 / w.length), x0 = 260 - (cell * w.length) / 2, kk = Math.floor(easeInOut(p) * w.length + 0.001);
    word.forEach((o, idx) => { const on = step === 2 && idx < kk + 1, isU = w[idx] === "U"; o.g.setAttribute("transform", `translate(${x0 + idx * cell} 252)`); o.r.setAttribute("width", cell - 2); o.r.setAttribute("fill", on ? (isU ? "#2fa866" : "#3b82f6") : "#fff"); o.t.setAttribute("x", (cell - 2) / 2); o.t.textContent = step === 2 ? (w[idx] === "R" ? c.t("D", "R") : c.t("H", "U")) : ""; o.t.style.fill = on ? "#fff" : "#2b2538"; o.g.setAttribute("opacity", step === 2 ? "1" : "0"); });
    eq.textContent = step === 4 ? `C(${m + n}, ${n}) = ${gridPaths(m, n)}` : step === 2 ? `C(${m + n}, ${n})` : "";
    label.textContent = step === 0 ? `${m} × ${n}` : step === 1 ? `${c.t("un chemin", "one path")} : ${m} ${c.t("pas à droite", "right")} + ${n} ${c.t("en haut", "up")}` : step === 2 ? c.t("un mot de D et de H", "a word of R and U") : step === 3 ? c.t("on additionne les deux voisins", "add the two neighbours") : c.t("deux méthodes, même nombre", "two methods, same number");
  },
};

export const SCENES_5 = { hanoi, ramsey, gridpaths };
