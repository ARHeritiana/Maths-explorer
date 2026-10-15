// Cartoon solutions, batch 4: the pigeons and the remainders, the squares of odd numbers, the hundred doors, the stones game.
import { svgEl, colour } from "./challenge-kit.js";
import { nimScript } from "./challenge-puzzles2.js";
import { lerp, seg, easeInOut, easeOutBack, clamp01, makeSoldier } from "./scene-kit.js";
import { dayScene, makePigeon } from "./scene-props.js";

const el = svgEl;
const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;
const pillAt = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };

/* ================================================================= pigeons in the holes of a dovecote */
const pigeonhole = {
  size: [520, 300],
  dur: (s, q) => [3200, 2400 + Number(q.m) * 520, 4200, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Number(q.m);
    dayScene(svg, { ground: 262 });
    const bw = Math.min(54, 470 / m - 6), step = 480 / m, top = 168, boxes = [];
    el("rect", { x: 8, y: top + 70, width: 504, height: 10, rx: 3, fill: "#6b4423" }, svg);
    for (let r = 0; r < m; r++) {
      const x = 20 + r * step, g = el("g", {}, svg);
      el("rect", { x, y: top, width: bw, height: 72, rx: 6, fill: "#c98f52", stroke: "#4b2d14", "stroke-width": 2 }, g);
      el("path", { d: `M${x + bw / 2 - bw * 0.26} ${top + 60} v-22 a${bw * 0.26} ${bw * 0.26} 0 0 1 ${bw * 0.52} 0 v22z`, fill: "#3a2410" }, g);
      el("path", { d: `M${x - 3} ${top + 2} L${x + bw / 2} ${top - 16} L${x + bw + 3} ${top + 2}Z`, fill: "#b4533c", stroke: "#4b2d14", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
      const t = el("text", { x: x + bw / 2, y: top + 92, "text-anchor": "middle", style: `font:700 ${bw < 40 ? 10 : 12}px var(--body);fill:#2b2538` }, svg); t.textContent = `${c.t("reste", "rem.")} ${r}`;
      boxes.push({ g, x, hot: el("rect", { x: x - 4, y: top - 20, width: bw + 8, height: 98, rx: 8, fill: "none", stroke: "#ffd84a", "stroke-width": 4, opacity: 0 }, svg) });
    }
    const pigeons = Array.from({ length: m + 1 }, (_, i) => makePigeon(svg, i === m ? { body: "#e0b08a", wing: "#c98a5a" } : {}));
    const bang = el("text", { "text-anchor": "middle", style: "font:700 26px var(--body);fill:#d32f2f;paint-order:stroke;stroke:#fff;stroke-width:4px" }, svg); bang.textContent = "!";
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, m, bw, step, top, boxes, pigeons, bang, label };
  },
  update(S, step, p, q) {
    const { c, m, bw, step: stp, top, boxes, pigeons, bang, label } = S, e = 2 * m + 1;
    const cx = (r) => 20 + r * stp + bw / 2;
    boxes.forEach((b, r) => { b.g.setAttribute("transform", `translate(0 ${(step === 0 ? (1 - easeOutBack(seg(p, (r / m) * 0.7, (r / m) * 0.7 + 0.3))) * -40 : 0).toFixed(1)})`); b.g.setAttribute("opacity", String(step === 0 ? clamp01(seg(p, (r / m) * 0.7, (r / m) * 0.7 + 0.15) * 2) : 1)); b.hot.setAttribute("opacity", "0"); });
    // pigeons 0..m-1: one per hole; the last one is the extra integer
    pigeons.forEach((pg, i) => {
      const isExtra = i === m, target = isExtra ? 1 : i;
      const startX = i % 2 ? 560 : -40, startY = 20 + (i * 17) % 60;
      let x, y, flap = 0, scale = 1, tilt = 0, dir = 1;
      const landY = top + 62, perchY = top - 16;
      if (!isExtra) {
        if (step === 0) { scale = 0; x = cx(i); y = landY; }
        else if (step === 1) {
          const a = i / (m + 1), u = clamp01((p - a * 0.8) / 0.22);
          if (u <= 0) { scale = 0; x = startX; y = startY; } else { x = lerp(startX, cx(target), easeInOut(u)); y = lerp(startY, landY, easeInOut(u)) - 60 * Math.sin(u * Math.PI); flap = u * 5 * (u < 1 ? 1 : 0); dir = cx(target) >= startX ? 1 : -1; scale = u < 1 ? 1.1 : 0.92; tilt = u < 1 ? -10 * Math.sin(u * Math.PI) : 0; }
        } else { x = cx(target); y = landY; scale = 0.92; }
      } else {
        if (step <= 1) { scale = 0; x = startX; y = startY; }
        else { const u = step === 2 ? easeInOut(seg(p, 0.05, 0.75)) : 1; x = lerp(560, cx(1), u); y = lerp(30, perchY, u) - 60 * Math.sin(u * Math.PI) * (u < 1 ? 1 : 0); flap = u < 1 ? p * 6 : 0; dir = -1; scale = u < 1 ? 0.95 : 0.85; tilt = u < 1 ? 8 : 0; }
      }
      pg.set({ x, y, dir, flap, scale, tilt, label: isExtra ? String(e) : String(i) });
    });
    const arrived = step === 2 ? seg(p, 0.75, 1) : step === 3 ? 1 : 0;
    boxes[1].hot.setAttribute("opacity", String(arrived * (0.6 + 0.4 * Math.sin(p * 18))));
    bang.setAttribute("x", cx(1) + 28); bang.setAttribute("y", top - 24); bang.setAttribute("opacity", String(arrived));
    label.textContent = step === 0 ? `${m} ${c.t("restes possibles : de 0 à", "possible remainders: from 0 to")} ${m - 1}` : step === 1 ? `${m} ${c.t("entiers : un par case", "integers: one per box")}` : step === 2 ? `${c.t("un de plus :", "one more:")} ${e} ${c.t("a le reste 1", "has remainder 1")}` : `${e} − 1 = ${e - 1} = 2 × ${m}`;
  },
};

/* ================================================================= squares of odd numbers */
const squares = {
  size: [520, 300],
  dur: (s) => [3200, 3200, 5200, 3200, 5200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Number(q.n);
    el("rect", { width: 520, height: 300, fill: "#f1ecf8" }, svg);
    for (let i = 0; i < 14; i++) el("line", { x1: 0, y1: i * 22, x2: 520, y2: i * 22, stroke: "#e2dbef", "stroke-width": 1 }, svg);
    const mk = (count) => Array.from({ length: count }, () => { const g = el("g", {}, svg); const body = el("circle", { r: 10, stroke: "#0004", "stroke-width": 1 }, g), hi = el("circle", { r: 3, fill: "#fff", opacity: 0.55 }, g); return { g, body, hi }; });
    const A = mk(36), B = mk(n * n), frame = el("path", { fill: "none", stroke: "#e8710a", "stroke-width": 3.5, "stroke-linejoin": "round", opacity: 0 }, svg);
    const legend = [0, 1, 2, 3, 4, 5].map(() => { const g = el("g", {}, svg); const sw = el("rect", { width: 14, height: 14, rx: 3 }, g); const t = el("text", { x: 22, y: 12, style: "font:600 16px var(--math);fill:#2b2538" }, g); return { g, sw, t }; });
    const f1 = el("text", { "text-anchor": "start", style: "font:600 17px var(--math);fill:#2b2538" }, svg), f2 = el("text", { "text-anchor": "start", style: "font:700 30px var(--math);fill:#2b2538" }, svg), f3 = el("text", { "text-anchor": "start", style: "font:600 13px var(--body);fill:#5a5470" }, svg);
    const board = pillAt(svg, 130, 8, 260, 28), label = el("text", { x: 260, y: 28, "text-anchor": "middle", style: white(15) }, board);
    return { c, n, A, B, frame, legend, f1, f2, f3, label };
  },
  update(S, step, p, q) {
    const { c, n, A, B, frame, legend, f1, f2, f3, label } = S;
    const place = (pool, size, sp, ox, oy, r, upto) => {
      pool.forEach((d, idx) => {
        if (idx >= size * size) { d.g.setAttribute("opacity", "0"); return; }
        const i = Math.floor(idx / size), j = idx % size, layer = Math.max(i, j) + 1, along = i === layer - 1 ? j / Math.max(1, layer) : (layer - 1 - i) / Math.max(1, layer) * 0.8;
        const u = clamp01((upto - (layer - 1)) * 1.5 - along * 0.5), sc = easeOutBack(u);
        d.g.setAttribute("transform", `translate(${ox + j * sp} ${oy + i * sp}) scale(${Math.max(0.001, sc * r / 10)})`);
        d.g.setAttribute("opacity", u > 0 ? "1" : "0"); d.body.setAttribute("fill", colour(layer - 1));
      });
    };
    const small = step <= 3;
    if (small) {
      const upto = step === 0 ? 0.0001 + easeInOut(p) : step === 1 ? 1 + easeInOut(p) : step === 2 ? 2 + easeInOut(p) * 4 : 6;
      place(A, 6, 34, 44, 52, 13, Math.min(6, upto)); place(B, 0, 0, 0, 0, 0, 0);
      const L = Math.min(6, Math.ceil(upto - 1e-9));
      legend.forEach((l, i) => { const k = i + 1, on = k <= L; l.g.setAttribute("opacity", on ? String(k < upto ? 1 : easeInOut(upto - (k - 1))) : "0"); l.g.setAttribute("transform", `translate(270 ${50 + i * 33})`); l.sw.setAttribute("fill", colour(k - 1)); l.t.textContent = `${Array.from({ length: k }, (_, qq) => 2 * qq + 1).join(" + ")} = ${k * k}`; });
      f1.textContent = f2.textContent = f3.textContent = "";
      if (step === 3) { f1.setAttribute("x", 270); f1.setAttribute("y", 262); f1.textContent = "1 + 3 + 5 + … + (2k − 1) = k²"; }
      frame.setAttribute("opacity", "0");
    } else {
      const sp = Math.min(13.5, 250 / n), r = Math.max(2.6, sp * 0.46), ox = 34, oy = 52;
      place(A, 0, 0, 0, 0, 0, 0); place(B, n, sp, ox, oy, r * 1.05, step === 4 ? 1 + easeInOut(p) * (n - 1) : n);
      legend.forEach((l) => l.g.setAttribute("opacity", "0"));
      const x0 = ox - sp * 0.7, y0 = oy - sp * 0.7, e = ox + (n - 1) * sp + sp * 0.7, f = oy + (n - 1) * sp + sp * 0.7, ix = ox + (n - 2) * sp + sp * 0.7, iy = oy + (n - 2) * sp + sp * 0.7;
      frame.setAttribute("d", `M${x0} ${iy}H${ix}V${y0}H${e}V${f}H${x0}Z`); frame.setAttribute("opacity", String(step === 4 ? easeInOut(seg(p, 0.85, 1)) : 1));
      const X0 = ox + n * sp + 26;
      f1.setAttribute("x", X0); f1.setAttribute("y", 110); f1.textContent = `1 + 3 + 5 + … + ${2 * n - 1}`;
      f2.setAttribute("x", X0); f2.setAttribute("y", 156); f2.textContent = `= ${n}² = ${n * n}`;
      f3.setAttribute("x", X0); f3.setAttribute("y", 190); f3.textContent = c.t(`dernière bordure : ${2 * n - 1} points`, `last border: ${2 * n - 1} dots`);
    }
    label.textContent = small ? (step === 0 ? c.t("1 point au centre", "1 dot in the middle") : step === 1 ? "1 + 3 = 4 = 2²" : step === 2 ? "1 + 3 + 5 + … = 3², 4², 5², 6²" : "1 + 3 + … + (2k − 1) = k²") : `${n} ${c.t("bordures", "borders")}`;
  },
};

/* ================================================================= the doors of the hotel */
const doors = {
  size: [520, 300],
  dur: (s, q) => [3600, 3600, 3600, 6200, 5200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, N = Number(q.n), cols = N <= 100 ? 10 : N <= 150 ? 15 : 20, rows = Math.ceil(N / cols), w = Math.min(25, 262 / cols), h = Math.min(27, 246 / rows);
    el("rect", { width: 520, height: 300, fill: "#2b2f55" }, svg);
    el("rect", { x: 6, y: 44, width: cols * w + 16, height: rows * h + 14, rx: 10, fill: "#46406a", stroke: "#1f1d3a", "stroke-width": 2 }, svg);
    const ds = []; for (let d = 1; d <= N; d++) {
      const x = 14 + ((d - 1) % cols) * w, y = 52 + Math.floor((d - 1) / cols) * h, g = el("g", { transform: `translate(${x} ${y})` }, svg);
      const glow = el("rect", { x: -2, y: -2, width: w - 1, height: h - 1, rx: 4, fill: "#ffe08a", opacity: 0 }, g);
      el("rect", { width: w - 3, height: h - 3, rx: 3, fill: "#17142e" }, g);
      const leaf = el("rect", { width: w - 3, height: h - 3, rx: 3, fill: "#b9814a", stroke: "#4b2d14", "stroke-width": 1.2 }, g);
      const num = el("text", { x: (w - 3) / 2, y: (h - 3) * 0.62, "text-anchor": "middle", style: `font:700 ${Math.min(9, w * 0.4)}px var(--body);fill:#3a2410` }, g); num.textContent = w > 14 ? d : "";
      ds.push({ d, g, glow, leaf, num, w: w - 3, h: h - 3 });
    }
    const porter = makeSoldier(svg, { uniform: "#e8710a", hat: 3, size: 0.5, label: "" });
    const X0 = 14 + cols * w + 26;
    const card = el("rect", { x: X0 - 12, y: 54, width: 520 - X0 - 2, height: 200, rx: 12, fill: "#0a0f2c", opacity: 0.6 }, svg);
    const t1 = el("text", { x: X0, y: 86, style: "font:600 15px var(--body);fill:#cfe3ff" }, svg), t2 = el("text", { x: X0, y: 140, style: "font:700 44px var(--math);fill:#fff" }, svg), t3 = el("text", { x: X0, y: 168, style: "font:600 14px var(--body);fill:#cfe3ff" }, svg);
    const pairs = [0, 1, 2, 3, 4, 5].map((i) => el("text", { x: X0, y: 102 + i * 22, style: "font:600 15px var(--math);fill:#fff" }, svg));
    const board = pillAt(svg, 130, 8, 260, 28), label = el("text", { x: 260, y: 28, "text-anchor": "middle", style: white(15) }, board);
    return { c, N, cols, w, h, ds, porter, t1, t2, t3, pairs, label, X0, card };
  },
  update(S, step, p, q) {
    const { c, N, cols, w, h, ds, porter, t1, t2, t3, pairs, label, X0 } = S, M = Math.floor(Math.sqrt(N));
    let pass = step === 0 ? 1 : step === 1 ? 2 : step === 2 ? 3 : step === 3 ? 3 + easeInOut(p) * (N - 3) : N;
    const sweep = step <= 2 ? easeInOut(seg(p, 0.05, 0.92)) : 1;        // how far the porter has got through the current pass
    const k = step <= 2 ? step + 1 : Math.floor(pass), frac = step === 3 ? pass - Math.floor(pass) : 0;
    const parity = (d, upto) => { let t = 0; for (let r = 1; r <= upto; r++) if (d % r === 0) t++; return t % 2; };
    let count = 0, lastDoor = 0;
    ds.forEach((o) => {
      const { d } = o; let open;
      if (step <= 2) {
        const before = parity(d, k - 1), toggled = d % k === 0 && d <= sweep * N + 0.5;
        if (d % k === 0 && d <= sweep * N + 0.5) lastDoor = Math.max(lastDoor, d);
        const prog = d % k === 0 ? clamp01((sweep * N - d) / 2 + 0.5) : 0;
        open = before === 1 ? 1 - (d % k === 0 ? easeInOut(prog) : 0) : (d % k === 0 ? easeInOut(prog) : 0); void toggled;
      } else if (step === 3) {
        const base = parity(d, k), next = k + 1 <= N && d % (k + 1) === 0 ? 1 - base : base;
        open = lerp(base, next, next !== base ? easeInOut(frac) : 0);
      } else open = parity(d, N);
      if (open > 0.5) count++;
      const sq = Number.isInteger(Math.sqrt(d)) && step === 4;
      o.leaf.setAttribute("transform", `translate(0 0) scale(${(1 - 0.78 * open).toFixed(3)} 1)`);
      o.leaf.setAttribute("fill", sq ? "#ffd84a" : "#b9814a");
      o.num.setAttribute("opacity", String(1 - open)); o.glow.setAttribute("opacity", String(open * (sq ? 0.95 : 0.45)));
    });
    // the porter walks along the doors he toggles, then stands in the corridor on the right
    const door = ds[Math.max(0, (lastDoor || 1) - 1)], gx = 14 + ((door.d - 1) % cols) * w + w / 2, gy = 52 + Math.floor((door.d - 1) / cols) * h + h;
    porter.set({ x: step <= 2 ? gx : S.X0 + 40, y: step <= 2 ? gy + 2 : 232, dir: 1, phase: p * 12, amp: step === 3 || (step <= 2 && p > 0.05 && p < 0.92) ? 1 : 0, scale: step === 4 ? 0 : step <= 2 ? 1 : 1.5 });
    t1.textContent = step === 4 ? c.t(`Porte ${Math.min(36, M * M)} : diviseurs par paires`, `Door ${Math.min(36, M * M)}: divisors in pairs`) : `${c.t("Passage", "Pass")} ${Math.min(N, Math.max(1, Math.floor(pass)))}`;
    t2.textContent = step === 4 ? "" : String(count); t3.textContent = step === 4 ? "" : c.t("ouvertes", "open");
    if (step === 4) {
      const d0 = Math.min(36, M * M), list = []; for (let r = 1; r <= d0; r++) if (d0 % r === 0 && r <= d0 / r) list.push([r, d0 / r]);
      pairs.forEach((t, i) => { const pr = list[i]; t.textContent = pr ? `${pr[0]} × ${pr[1]}${pr[0] === pr[1] ? "  ★" : ""}` : ""; t.style.fill = pr && pr[0] === pr[1] ? "#ffd84a" : "#fff"; t.setAttribute("opacity", String(pr ? easeInOut(seg(p, i * 0.1, i * 0.1 + 0.25)) : 0)); });
      t3.textContent = c.t(`${M} portes restent ouvertes`, `${M} doors stay open`); t3.setAttribute("opacity", String(easeInOut(seg(p, 0.5, 0.8)))); t2.textContent = String(M); t2.setAttribute("opacity", String(easeInOut(seg(p, 0.5, 0.8)))); t2.setAttribute("y", 238); t3.setAttribute("y", 258);
    } else { pairs.forEach((t) => { t.textContent = ""; }); t2.setAttribute("opacity", "1"); t3.setAttribute("opacity", "1"); t2.setAttribute("y", 140); t3.setAttribute("y", 168); }
    label.textContent = step <= 2 ? c.t(`multiples de ${step + 1} : on change l’état`, `multiples of ${step + 1}: toggle`) : step === 3 ? `${c.t("passages", "passes")} 4 … ${N}` : `1, 4, 9, …, ${M * M}`;
  },
};

/* ================================================================= the 21 stones */
const nim = {
  size: [520, 300],
  dur: (s, q) => { const mv = nimScript(q).length; return s === 0 ? 4200 : s === 1 ? 6500 : s === 2 ? Math.min(12000, 2500 + mv * 700) : 4200; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, N = Number(q.n);
    dayScene(svg, { ground: 252 });
    const per = N <= 30 ? N : Math.ceil(N / 2), sp = Math.min(23.5, 470 / per), rad = sp * 0.38;
    el("rect", { x: 14, y: 138, width: per * sp + 16, height: (N > per ? 2 : 1) * (rad * 2 + 10) + 22, rx: 12, fill: "#a8723f", stroke: "#4b2d14", "stroke-width": 2 }, svg);
    const stones = Array.from({ length: N }, (_, i) => { const g = el("g", {}, svg); const b = el("ellipse", { rx: rad, ry: rad * 0.82, fill: "#cfd6de", stroke: "#4a5361", "stroke-width": 1.4 }, g); const hi = el("ellipse", { cx: -rad * 0.28, cy: -rad * 0.28, rx: rad * 0.28, ry: rad * 0.2, fill: "#fff", opacity: 0.6 }, g); return { g, b, hi }; });
    const blocks = Array.from({ length: N }, () => el("rect", { height: 4, rx: 2 }, svg));
    const me = makeSoldier(svg, { uniform: "#3b82f6", hat: 1, size: 1.25, label: "" }), op = makeSoldier(svg, { uniform: "#e8710a", hat: 2, size: 1.25, label: "" });
    const bubble = el("g", {}, svg), bb = el("rect", { y: -16, height: 24, rx: 12, fill: "#fff", stroke: "#222", "stroke-width": 1.5 }, bubble), bt = el("text", { y: 1, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#222" }, bubble);
    const board = pillAt(svg, 160, 8, 200, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(16) }, board);
    return { c, N, per, sp, rad, stones, blocks, me, op, bubble, bb, bt, label, moves: nimScript(q) };
  },
  update(S, step, p, q) {
    const { c, N, per, sp, rad, stones, blocks, me, op, bubble, bb, bt, label, moves } = S, b = Number(q.m) + 1, total = moves.length;
    const at = (st) => (st < 0 ? 0 : st === 0 ? 1 : st === 1 ? Math.min(3, total) : total);
    const prev = step === 0 ? 0 : at(step - 1), cur = at(step), upto = lerp(prev, cur, easeInOut(step === 0 ? seg(p, 0.15, 0.9) : p));
    const owner = Array(N).fill(0), when = Array(N).fill(0); let right = N;
    moves.forEach(([who, take], idx) => { for (let k = 0; k < take; k++) { right -= 1; owner[right] = who; when[right] = idx; } });
    let left = N, active = null;
    stones.forEach((s, i) => {
      const row = Math.floor(i / per), x = 22 + (i % per) * sp, y = 160 + row * (rad * 2 + 12), w = owner[i], t = w ? clamp01(upto - when[i]) : 0;
      const inMove = t > 0 && t < 1, hop = inMove ? 14 * Math.sin(t * Math.PI) : 0;
      if (t >= 1 || (t > 0.5)) { /* taken */ } if (t > 0) left -= 0;
      s.g.setAttribute("transform", `translate(${x} ${y - hop})`);
      s.b.setAttribute("fill", w && t > 0.4 ? (w === 1 ? "#6ea8ff" : "#ffb347") : "#cfd6de"); s.b.setAttribute("opacity", w && t >= 1 ? "0.55" : "1");
      if (w && t > 0 && t < 1) active = w;
    });
    left = N - moves.reduce((s, [, take], idx) => s + (upto > idx ? Math.min(1, upto - idx) * take : 0), 0);
    blocks.forEach((r, i) => { const row = Math.floor(i / per), x = 22 + (i % per) * sp; r.setAttribute("x", x - rad); r.setAttribute("y", 160 + row * (rad * 2 + 12) + rad + 2); r.setAttribute("width", rad * 2); r.setAttribute("fill", i < N && owner[i] === 0 ? ["#2fa866", "#c2185b"][Math.floor(i / b) % 2] : "none"); r.setAttribute("opacity", String(owner[i] === 0 ? 1 : 0)); });
    const lastIdx = Math.min(total - 1, Math.max(0, Math.ceil(upto) - 1)), mvNow = moves[lastIdx], moving = upto > 0 && upto < total && Math.abs(upto - Math.round(upto)) > 0.02 ? mvNow : null;
    const act = (who) => (moving && moving[0] === who ? easeInOut(1 - Math.abs(2 * (upto - lastIdx) - 1)) : 0);
    me.set({ x: 48, y: 108, dir: 1, phase: 0, amp: 0, hop: 6 * act(1), carry: act(1) > 0.2 });
    op.set({ x: 472, y: 108, dir: -1, phase: 0, amp: 0, hop: 6 * act(2), carry: act(2) > 0.2 });
    const who = moving ? moving[0] : 0, bx = who === 1 ? 110 : 410;
    bubble.setAttribute("opacity", moving ? "1" : "0"); bubble.setAttribute("transform", `translate(${bx} 64)`);
    const txt = moving ? `${c.t(who === 1 ? "je prends" : "il prend", who === 1 ? "I take" : "they take")} ${moving[1]}` : ""; bt.textContent = txt; bb.setAttribute("x", String(-txt.length * 3.9 - 10)); bb.setAttribute("width", String(txt.length * 7.8 + 20));
    label.textContent = `${Math.round(left)} ${c.t(Math.round(left) > 1 ? "pierres" : "pierre", Math.round(left) > 1 ? "stones" : "stone")}`;
    void active;
  },
};

export const SCENES_4 = { pigeonhole, squares, doors, nim };
