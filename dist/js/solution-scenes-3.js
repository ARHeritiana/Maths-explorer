// Cartoon solutions, batch 3: the ant on the box, the chameleons, the bridges of Königsberg, the Josephus circle.
import { svgEl } from "./challenge-kit.js";
import { boxSet, boxUnfoldings, boxPath, chamSet, chamSolve } from "./challenge-puzzles2.js";
import { graphFor, layoutOf, bridgeGeom, degrees, minRemoval, trailOf, josephusOrder } from "./challenge-variants.js";
import { lerp, seg, easeInOut, clamp01, makeSoldier } from "./scene-kit.js";
import { dayScene, makeAnt, makeChameleon } from "./scene-props.js";

const el = svgEl;
const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;
const pillAt = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };

/* ================================================================= the ant on the box */
const CARD = "#c89a62", CARD2 = "#d9b078", CARD3 = "#b58450", TAPE = "#e9d9a8";
const box = {
  size: [520, 300],
  dur: (s) => [3200, 5200, 5200, 5200, 6800][s] ?? 4000,
  steps: null,
  mount(c, q) {
    const svg = c.svg;
    el("rect", { width: 520, height: 300, fill: "#e8d7bd" }, svg);
    for (let i = 0; i < 9; i++) el("line", { x1: 0, y1: 20 + i * 34, x2: 520, y2: 20 + i * 34, stroke: "#d5c0a0", "stroke-width": 1.4 }, svg);
    const stage = el("g", {}, svg), ant = makeAnt(svg), ants = [makeAnt(svg), makeAnt(svg), makeAnt(svg)];
    const board = pillAt(svg, 130, 8, 260, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(16) }, board);
    return { c, stage, ant, ants, label };
  },
  update(S, step, p, q) {
    const { c, stage, ant, ants, label } = S, [a, b, cc] = boxSet(q.set), U = boxUnfoldings(a, b, cc), best = boxPath(a, b, cc);
    stage.replaceChildren(); ant.set({ x: 0, y: 0, scale: 0 }); ants.forEach((x) => x.set({ x: 0, y: 0, scale: 0 }));
    const shape = (g, x, y, w, h, fill) => el("rect", { x, y, width: w, height: h, fill, stroke: "#6b4a26", "stroke-width": 2, "stroke-linejoin": "round" }, g);
    if (step === 0) {
      // the box in oblique projection, sized to fit
      const kk = Math.min(330 / (a * 1.4 + b * 0.9), 175 / (b * 0.9 + cc * 0.9)), w = a * 1.4 * kk, d = b * 0.9 * kk, h = cc * 0.9 * kk, x = (520 - w - d) / 2, y = 60 + d + (170 - d - h) / 2 + 20;
      const top = el("path", { d: `M${x} ${y}L${x + w} ${y}L${x + w + d} ${y - d}L${x + d} ${y - d}Z`, fill: CARD2, stroke: "#6b4a26", "stroke-width": 2, "stroke-linejoin": "round" }, stage);
      el("path", { d: `M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}L${x} ${y + h}Z`, fill: CARD, stroke: "#6b4a26", "stroke-width": 2, "stroke-linejoin": "round" }, stage);
      el("path", { d: `M${x + w} ${y}L${x + w + d} ${y - d}L${x + w + d} ${y + h - d}L${x + w} ${y + h}Z`, fill: CARD3, stroke: "#6b4a26", "stroke-width": 2, "stroke-linejoin": "round" }, stage);
      el("path", { d: `M${x + d / 2} ${y - d / 2} L${x + w + d / 2} ${y - d / 2}`, stroke: TAPE, "stroke-width": 6, opacity: 0.9 }, stage); void top;
      const e0 = [x, y + h], e1 = [x + w + d, y - d], pulse = 1 + 0.12 * Math.sin(p * 14);
      el("path", { d: `M${e1[0]} ${e1[1]} v-26`, stroke: "#4b2d14", "stroke-width": 2 }, stage); el("path", { d: `M${e1[0]} ${e1[1] - 26} h20 l-5 6 l5 6 h-20z`, fill: "#d32f2f", stroke: "#7a1212", "stroke-width": 1.2 }, stage);
      ant.set({ x: e0[0] + 2, y: e0[1] + 2, rot: -35, scale: 1.7 * pulse, amp: 0, phase: p });
      const t1 = el("text", { x: e0[0] - 4, y: e0[1] + 30, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#6b4a26" }, stage); t1.textContent = c.t("départ", "start");
      const t2 = el("text", { x: e1[0] + 12, y: e1[1] - 34, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#6b4a26" }, stage); t2.textContent = c.t("arrivée", "arrival");
      label.textContent = `${a} × ${b} × ${cc}`;
      return;
    }
    const one = step <= 3, idx = Math.min(step, 3) - 1, list = one ? [idx] : [0, 1, 2];
    const open = one ? easeInOut(seg(p, 0, 0.3)) : 1, walk = one ? easeInOut(seg(p, 0.38, 0.95)) : seg(p, 0.1, 0.9);
    const maxLen = Math.max(...U.map((u) => u.length));
    list.forEach((j, pos) => {
      const u = U[j], w = u.cross[0] + u.cross[1], h = u.height;
      const sc = one ? Math.min(420 / w, 190 / h) : Math.min(150 / w, 110 / h), x0 = one ? (520 - w * sc) / 2 : 14 + pos * 170, y0 = one ? 58 : 70;
      const g = el("g", {}, stage);
      shape(g, x0, y0, u.cross[0] * sc, h * sc, CARD);
      const wr = u.cross[1] * sc * (one ? open : 1), r2 = shape(g, x0 + u.cross[0] * sc, y0, Math.max(wr, 0.5), h * sc, CARD3);
      if (one && open < 1) r2.setAttribute("opacity", "0.9");
      const Ax = x0, Ay = y0 + h * sc, Bx = x0 + w * sc, By = y0, len = u.length, isBest = len === best;
      const dx = Bx - Ax, dy = By - Ay, L = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      // trail and ant
      const f = one ? walk : clamp01((walk * maxLen) / len);
      el("line", { x1: Ax, y1: Ay, x2: lerp(Ax, Bx, f), y2: lerp(Ay, By, f), stroke: isBest && !one && f >= 1 ? "#2fa866" : "#e8710a", "stroke-width": one ? 4.5 : 3, "stroke-linecap": "round", "stroke-dasharray": "2 7" }, g);
      el("circle", { cx: Bx, cy: By, r: one ? 6 : 4, fill: "#d32f2f" }, g);
      const an = one ? ant : ants[pos];
      if (open > 0.99 || !one) an.set({ x: lerp(Ax, Bx, f), y: lerp(Ay, By, f), rot: ang, scale: one ? 1.9 : 1.1, amp: f < 1 && f > 0 ? 1 : 0, phase: f * L / 14 });
      else an.set({ x: Ax, y: Ay, rot: ang, scale: one ? 1.9 : 1.1, amp: 0 });
      const t = el("text", { x: x0 + (w * sc) / 2, y: y0 + h * sc + (one ? 30 : 20), "text-anchor": "middle", style: `font:700 ${one ? 17 : 13}px var(--math);fill:${isBest && !one ? "#1f7a4a" : "#4b2d14"}` }, g);
      t.textContent = `${Math.round(len * 100) / 100}`;
      if (one) { const dim = (txt, x, y) => { const e = el("text", { x, y, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#6b4a26" }, g); e.textContent = txt; }; dim(u.cross[0], x0 + (u.cross[0] * sc) / 2, y0 - 6); dim(u.cross[1], x0 + u.cross[0] * sc + (u.cross[1] * sc * open) / 2, y0 - 6); dim(h, x0 - 10, y0 + (h * sc) / 2); }
      if (!one && isBest && f >= 1) { el("text", { x: x0 + (w * sc) / 2, y: y0 - 8, "text-anchor": "middle", style: "font:700 18px var(--body)" }, g).textContent = "★"; }
    });
    label.textContent = one ? `${c.t("Dépliage", "Unfolding")} ${idx + 1} / 3` : `${c.t("le plus court", "shortest")} : ${best} cm`;
  },
};

/* ================================================================= the chameleons */
// For an impossible start, a few meetings just to see the colours shuffle: always a legal move, never a single colour.
const wander = (r, g, b, n = 6) => { const out = []; let s = [r, g, b]; const pairs = [[0, 1], [1, 2], [0, 2]]; for (let i = 0; i < n; i++) { const [a, c2] = pairs[i % 3]; if (s[a] < 1 || s[c2] < 1) continue; const t = [...s]; t[a]--; t[c2]--; t[3 - a - c2] += 2; out.push({ from: s, to: t, meet: [a, c2] }); s = t; } return out; };
const SKIN = ["#e0457b", "#3fbf7f", "#4a8cff"];
const cham = {
  size: [520, 300],
  dur: (s, q) => { const sol = chamSolve(...chamSet(q.set)); return s === 1 ? 4200 : s === 4 && sol ? Math.min(14000, 2200 + sol.length * 1300) : 3800; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, [r, g, b] = chamSet(q.set);
    dayScene(svg, { ground: 236 });
    // branches: three rows of colour columns
    el("rect", { x: 0, y: 236, width: 520, height: 64, fill: "#6b4a26" }, svg); el("rect", { x: 0, y: 236, width: 520, height: 6, fill: "#8a6236" }, svg);
    const sprites = []; for (let i = 0; i < r + g + b + 2; i++) sprites.push(makeChameleon(svg));
    const sparkG = el("g", {}, svg), board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    const info = el("g", {}, svg), card = el("rect", { x: 250, y: 56, width: 260, height: 96, rx: 12, fill: "#0a0f2c", opacity: 0 }, info);
    const lines = [0, 1, 2].map((i) => el("text", { x: 264, y: 82 + i * 26, style: "font:600 14px var(--body);fill:#fff" }, info));
    const heads = [0, 1, 2].map((i) => el("text", { "text-anchor": "middle", style: "font:700 22px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:4px" }, svg));
    return { c, sprites, label, card, lines, heads, r, g, b, sparkG };
  },
  update(S, step, p, q) {
    const { c, sprites, label, card, lines, heads } = S, [r, g, b] = chamSet(q.set), mod = (x) => ((x % 3) + 3) % 3, sol = chamSolve(r, g, b);
    // state machine over a list of meetings: step 1 is one red-green meeting, step 4 the shortest solution (if any)
    let moves = [], u = 0;
    if (step === 1) { moves = [{ from: [r, g, b], to: [r - 1, g - 1, b + 2], meet: [0, 1] }]; u = seg(p, 0.1, 0.9); }
    else if (step >= 2 && step <= 3) { moves = [{ from: [r, g, b], to: [r - 1, g - 1, b + 2], meet: [0, 1] }]; u = 1; }
    else if (step === 4) { moves = sol || wander(r, g, b); u = seg(p, 0.05, 0.97); }
    const total = Math.max(1, moves.length), pos = u * total, mi = Math.min(total - 1, Math.floor(pos)), f = pos - mi;
    // current counts before the move being animated
    const base = step === 0 || !moves.length ? [r, g, b] : (u >= 1 ? moves[total - 1].to : moves[mi].from);
    const cnt = [...base];
    const active = moves.length && u > 0 && u < 1 ? moves[mi] : null, sparks = [];
    const X = [88, 260, 432], sc = 0.62, slot = (col, k) => ({ x: X[col] - 54 + (k % 4) * 36, y: 233 - Math.floor(k / 4) * 29 });
    let si = 0;
    const place = (col, k) => { const s = sprites[si++], at = slot(col, k); s.set({ x: at.x, y: at.y, dir: col === 2 ? -1 : 1, scale: sc, from: SKIN[col], glance: Math.sin(p * 6 + k) * 0.6 }); };
    for (let col = 0; col < 3; col++) {
      const n = cnt[col] - (active && active.meet.includes(col) ? 1 : 0);
      for (let k = 0; k < n; k++) place(col, k);
    }
    if (active) {
      const [i2, j2] = active.meet, third = 3 - i2 - j2, ph = easeInOut(seg(f, 0, 0.4)), flash = seg(f, 0.4, 0.58), back = easeInOut(seg(f, 0.66, 1));
      [i2, j2].forEach((col, n) => {
        const from = slot(col, cnt[col] - 1), mid = { x: 260 + (n ? 26 : -26), y: 150 }, to = slot(third, cnt[third] + n);
        const pt = f < 0.4 ? { x: lerp(from.x, mid.x, ph), y: lerp(from.y, mid.y, ph) - 40 * Math.sin(ph * Math.PI) } : f < 0.66 ? mid : { x: lerp(mid.x, to.x, back), y: lerp(mid.y, to.y, back) - 34 * Math.sin(back * Math.PI) };
        const s = sprites[si++];
        s.set({ x: pt.x, y: pt.y, dir: n ? -1 : 1, scale: sc * (1 + 0.55 * Math.sin(flash * Math.PI) + 0.4 * ph * (1 - ph)), from: SKIN[col], to: SKIN[third], t: easeInOut(flash) });
      });
      if (f > 0.4 && f < 0.66) { const burst = seg(f, 0.4, 0.66); for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + burst, r0 = 10 + 32 * burst; sparks.push([260 + Math.cos(a) * r0, 150 + Math.sin(a) * r0 * 0.8, 1 - burst]); } }
    }
    for (; si < sprites.length; si++) sprites[si].set({ x: 0, y: 0, scale: 0 });
    S.sparkG.replaceChildren(); sparks.forEach(([x, y, o]) => el("circle", { cx: x, cy: y, r: 3.2, fill: "#ffe08a", opacity: o }, S.sparkG));
    // column counters
    const shown = active ? (f >= 0.65 ? moves[mi].to : moves[mi].from) : cnt;
    heads.forEach((t, i) => { t.setAttribute("x", X[i]); t.setAttribute("y", 270); t.textContent = step === 0 && p < 0.3 ? "" : shown[i]; t.style.fill = ["#ffc4d8", "#c4ffd8", "#c4dcff"][i]; });
    // invariant card (steps 2 and 3)
    const rows = [["r − v", r - g, r - 1 - (g - 1)], ["v − b", g - b, g - 1 - (b + 2)], ["b − r", b - r, b + 2 - (r - 1)]];
    const show = step === 2 || step === 3 ? easeInOut(seg(p, 0, 0.2)) : 0;
    card.setAttribute("opacity", String(0.9 * show));
    lines.forEach((t, i) => { t.textContent = show ? `${rows[i][0]} : ${rows[i][1]} → ${rows[i][2]}   (mod 3 : ${mod(rows[i][1])} = ${mod(rows[i][2])})` : ""; t.setAttribute("opacity", String(show)); t.style.fill = step === 3 && mod(rows[i][1]) === 0 ? "#5fd0a0" : "#fff"; });
    label.textContent = step === 0 ? `${r} · ${g} · ${b}` : step === 1 ? c.t("une rencontre : −1, −1, +2", "one meeting: −1, −1, +2") : step === 2 ? c.t("les différences mod 3 ne bougent pas", "the differences mod 3 never change") : step === 3 ? c.t("deux effectifs égaux à 0 ⇒ une différence ≡ 0", "two counts equal 0 ⇒ a difference ≡ 0") : sol ? `${c.t("rencontre", "meeting")} ${Math.min(total, mi + 1)} / ${total}` : c.t("impossible : aucune différence ≡ 0 (mod 3)", "impossible: no difference ≡ 0 (mod 3)");
  },
};

/* ================================================================= the bridges of Königsberg */
const konigsberg = {
  size: [520, 300],
  dur: (s, q) => { const g = graphFor(q.g), best = minRemoval(g), walk = trailOf(g, best); return s === 5 ? Math.min(14000, 1600 + walk.length * 1100) : 3600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, g = graphFor(q.g), pos = layoutOf(g);
    const id = "kb" + Math.floor(Math.random() * 1e6);
    const defs = el("defs", {}, svg), gr = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, "#7ec8f2"], [1, "#2f7fbf"]].forEach(([o, col]) => el("stop", { offset: o, "stop-color": col }, gr));
    el("rect", { width: 520, height: 300, fill: `url(#${id})` }, svg);
    for (let i = 0; i < 14; i++) el("path", { d: `M${(i * 97) % 520} ${30 + ((i * 53) % 250)} q10 -6 20 0 t20 0`, fill: "none", stroke: "#fff", "stroke-width": 1.6, opacity: 0.4, "stroke-linecap": "round", class: "sc-wave", style: `--d:${(i % 5) * 0.4}s` }, svg);
    const bridges = g.edges.map((_, i) => { const { d, mid } = bridgeGeom(g, i, pos), gp = el("g", {}, svg); el("path", { d, fill: "none", stroke: "#4b2d14", "stroke-width": 13, "stroke-linecap": "round" }, gp); el("path", { d, fill: "none", stroke: "#b9814a", "stroke-width": 9, "stroke-linecap": "round" }, gp); const planks = el("path", { d, fill: "none", stroke: "#6b4423", "stroke-width": 9, "stroke-dasharray": "1.6 5", opacity: 0.7 }, gp); const done = el("path", { d, fill: "none", stroke: "#5fd0a0", "stroke-width": 5, "stroke-linecap": "round", opacity: 0, "stroke-dasharray": "999", "stroke-dashoffset": "999" }, gp); const cross = el("text", { x: mid[0], y: mid[1] + 8, "text-anchor": "middle", style: "font:700 24px var(--body);fill:#ff5b5b;paint-order:stroke;stroke:#fff;stroke-width:3px" }, gp); cross.textContent = "×"; return { gp, planks, done, cross, d }; });
    const islands = g.names.map((nm, v) => { const [x, y] = pos[v], gp = el("g", { transform: `translate(${x} ${y})` }, svg); el("ellipse", { rx: 36, ry: 27, fill: "#e8d6a0", stroke: "#a38a4a", "stroke-width": 2 }, gp); el("ellipse", { rx: 30, ry: 21, fill: "#79c276" }, gp); const rr = (v * 37) % 5; el("circle", { cx: -14 + rr, cy: -6, r: 5, fill: "#3f8f4a" }, gp); el("circle", { cx: 16 - rr, cy: 6, r: 4, fill: "#3f8f4a" }, gp); const t = el("text", { y: 6, "text-anchor": "middle", style: "font:700 18px var(--body);fill:#1f3a24" }, gp); t.textContent = nm; const badge = el("g", { transform: "translate(26 -26)" }, gp); const bc = el("circle", { r: 11, fill: "#fff", stroke: "#222", "stroke-width": 1.5 }, badge); const bt = el("text", { y: 4.5, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#222" }, badge); return { gp, badge, bc, bt }; });
    const walker = makeSoldier(svg, { uniform: "#e8710a", hat: 1, size: 0.9, label: "" });
    const board = pillAt(svg, 110, 8, 300, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, g, pos, bridges, islands, walker, label };
  },
  update(S, step, p, q) {
    const { c, g, pos, bridges, islands, walker, label } = S, best = minRemoval(g), removed = step >= 4 ? best : new Set(), deg = degrees(g, removed), trail = step === 5 ? trailOf(g, best) : [];
    const prog = step === 5 ? easeInOut(seg(p, 0.06, 0.96)) * trail.length : 0;
    g.edges.forEach((b, i) => {
      const br = bridges[i], gone = best.has(i) && step >= 4, w = trail.findIndex((x) => x[0] === i);
      br.gp.setAttribute("opacity", String(gone ? (step === 4 ? 1 - 0.65 * easeInOut(seg(p, 0.1, 0.6)) : 0.35) : 1));
      br.gp.setAttribute("transform", gone && step === 4 ? `translate(0 ${(8 * easeInOut(seg(p, 0.1, 0.8))).toFixed(1)})` : gone ? "translate(0 8)" : "");
      br.cross.setAttribute("opacity", String(gone ? 1 : 0));
      const done = step === 5 && w >= 0 ? clamp01(prog - w) : 0;
      br.done.setAttribute("opacity", String(done > 0 ? 1 : 0)); br.done.setAttribute("stroke-dashoffset", String(999 * (1 - done)));
      br.done.setAttribute("pathLength", "999");
    });
    g.names.forEach((nm, v) => {
      const odd = step >= 1 && deg[v] % 2 === 1, il = islands[v];
      il.badge.setAttribute("opacity", String(step >= 1 ? easeInOut(step === 1 ? seg(p, 0, 0.5) : 1) : 0));
      il.bt.textContent = deg[v]; il.bc.setAttribute("fill", odd ? "#ff8a8a" : "#fff"); il.bc.setAttribute("stroke", odd ? "#b00020" : "#222");
      il.gp.setAttribute("transform", `translate(${pos[v][0]} ${pos[v][1] - (odd && step >= 1 && step <= 3 ? 2.5 * Math.abs(Math.sin(p * 9 + v)) : 0)})`);
    });
    // the walker crosses the remaining bridges (last step)
    if (step === 5 && trail.length) {
      const k = Math.min(trail.length - 1, Math.floor(prog)), [bi, from, to] = trail[k], tt = prog - k, { ctrl } = bridgeGeom(g, bi, pos), A = pos[from], B = pos[to];
      const x = (1 - tt) ** 2 * A[0] + 2 * (1 - tt) * tt * ctrl[0] + tt * tt * B[0], y = (1 - tt) ** 2 * A[1] + 2 * (1 - tt) * tt * ctrl[1] + tt * tt * B[1];
      walker.set({ x, y: y + 12, dir: B[0] >= A[0] ? 1 : -1, phase: prog * 3, amp: 1, scale: 1 });
    } else walker.set({ x: 0, y: 0, scale: 0 });
    const oddCount = deg.filter((v) => v % 2).length;
    label.textContent = step === 0 ? `${g.names.length} ${c.t("quartiers", "districts")}, ${g.edges.length} ${c.t("ponts", "bridges")}` : step <= 3 ? `${c.t("Quartiers impairs", "Odd districts")} : ${deg.map((v) => v % 2).reduce((a, b2) => a + b2, 0)}` : step === 4 ? `${c.t("ponts retirés", "bridges removed")} : ${best.size}` : `${c.t("Quartiers impairs", "Odd districts")} : ${oddCount}`;
  },
};

/* ================================================================= the Josephus circle */
const josephus = {
  size: [520, 300],
  dur: (s, q) => { const n = Number(q.n); return 3600 + Math.min(7000, n * 90) * (s === 3 || s === 0 || s === 1 ? 1 : 0.5); },
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Number(q.n), CX = 170, CY = 156, R = 112;
    dayScene(svg, { ground: 262 });
    el("ellipse", { cx: CX, cy: CY + 14, rx: R + 36, ry: R + 30, fill: "#8bc98a", opacity: 0.85 }, svg);
    el("ellipse", { cx: CX, cy: CY + 14, rx: R - 22, ry: R - 28, fill: "#6f4a2a", opacity: 0.25 }, svg);
    const fire = el("g", { transform: `translate(${CX} ${CY + 10})` }, svg); el("path", { d: "M-16 6 l32 8 M16 6 l-32 8", stroke: "#4b2d14", "stroke-width": 6, "stroke-linecap": "round" }, fire); el("path", { d: "M0 6 C-12 -4 -6 -18 0 -26 C2 -14 12 -10 8 2 C6 6 2 8 0 6Z", fill: "#ff8a2a", class: "sc-flame" }, fire); el("path", { d: "M0 6 C-6 0 -2 -10 1 -14 C3 -8 7 -4 4 3Z", fill: "#ffd84a", class: "sc-flame" }, fire);
    const sprites = n <= 45 ? Array.from({ length: n }, (_, i) => makeSoldier(svg, { uniform: ["#3b82f6", "#e8710a", "#2fa866", "#c2185b"][i % 4], hat: i % 4, size: 0.5, skin: ["#f1c27d", "#e0ac69", "#f5d0a9", "#d8a47f"][i % 4], label: String(i + 1) })) : null;
    const dots = n > 45 ? Array.from({ length: n }, () => el("circle", { r: n > 70 ? 3.2 : 5, fill: "#3b82f6", stroke: "#fff", "stroke-width": 1 }, svg)) : null;
    const crown = el("path", { d: "M-9 0 l3 -9 l6 6 l6 -6 l3 9z", fill: "#ffd84a", stroke: "#8a6a10", "stroke-width": 1.3, opacity: 0 }, svg);
    const card = el("g", {}, svg); el("rect", { x: 328, y: 58, width: 182, height: 122, rx: 14, fill: "#0a0f2c", opacity: 0.74 }, card);
    const big = el("text", { x: 419, y: 118, "text-anchor": "middle", style: "font:700 44px var(--math);fill:#fff" }, card), sub = el("text", { x: 419, y: 150, "text-anchor": "middle", style: "font:600 14px var(--body);fill:#cfe3ff" }, card), sub2 = el("text", { x: 419, y: 172, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#5fd0a0" }, card);
    const board = pillAt(svg, 190, 8, 320, 30), label = el("text", { x: 350, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, n, CX, CY, R, sprites, dots, crown, big, sub, sub2, label };
  },
  update(S, step, p, q) {
    const { c, n, CX, CY, R, sprites, dots, crown, big, sub, sub2, label } = S, k = Number(q.k), { out, last } = josephusOrder(n, k), m = 2 ** Math.floor(Math.log2(n)), l = n - m;
    const ang = (i) => ((-90 + (360 * (i - 1)) / n) * Math.PI) / 180, P2 = (i, r = R) => [CX + r * Math.cos(ang(i)), CY + r * 0.92 * Math.sin(ang(i)) + 10];
    let killedF;
    if (k === 2) killedF = step === 0 ? easeInOut(p) * l : step === 1 || step === 2 ? l : step === 3 ? l + easeInOut(p) * (out.length - l) : out.length;
    else killedF = step === 0 ? 0 : step === 1 ? easeInOut(p) * Math.min(out.length, Math.max(6, Math.floor(n / 3))) : out.length;
    const order = new Map(out.map((v, idx) => [v, idx]));
    const isLastStep = step >= 2 && (k === 2 || step >= 2);
    for (let i = 1; i <= n; i++) {
      const [x, y] = P2(i), idx = order.get(i), t = idx === undefined ? 0 : clamp01(killedF - idx), alive = idx === undefined || t <= 0;
      const fly = t > 0 ? easeInOut(t) : 0, win = i === last && step >= 2;
      const ox = x + (x - CX) * 0.9 * fly, oy = y + (y - CY) * 0.9 * fly - 40 * Math.sin(fly * Math.PI);
      if (sprites) {
        const sp = sprites[i - 1];
        sp.set({ x: t > 0 ? ox : x, y: (t > 0 ? oy : y) + 4, dir: x < CX ? 1 : -1, scale: t >= 1 ? 0 : (win ? 1.25 : 1) * (1 - 0.3 * fly), hop: win ? 7 * Math.abs(Math.sin(p * 14)) : 0, cheer: win ? 1 : 0, phase: p * 4, amp: 0 });
        sp.root.setAttribute("opacity", String(alive ? 1 : 1 - fly));
      } else { const d = dots[i - 1]; d.setAttribute("cx", (t > 0 ? ox : x).toFixed(1)); d.setAttribute("cy", (t > 0 ? oy : y).toFixed(1)); d.setAttribute("opacity", String(alive ? 1 : 1 - fly)); d.setAttribute("fill", win ? "#ffd84a" : "#3b82f6"); d.setAttribute("r", String(win ? (n > 70 ? 5 : 7) : (n > 70 ? 3.2 : 5))); }
    }
    const [wx, wy] = P2(last), showCrown = isLastStep ? easeInOut(seg(step === 2 ? p : 1, 0.2, 0.6)) : 0;
    crown.setAttribute("transform", `translate(${wx} ${wy - (sprites ? 38 : 14)})`); crown.setAttribute("opacity", String(showCrown));
    const left = n - Math.floor(killedF + 1e-9);
    big.textContent = k === 2 && step === 2 ? `${m} = 2^${Math.log2(m)}` : k === 2 && step === 4 ? `${n} = ${m} + ${l}` : String(left); big.style.fontSize = k === 2 && (step === 2 || step === 4) ? "28px" : "44px";
    sub.textContent = k === 2 && step === 2 ? c.t("le premier sauté survit", "first skipped survives") : k === 2 && step === 4 ? "" : c.t("personnes restantes", "people left");
    sub2.textContent = k === 2 && step === 4 ? `2 × ${l} + 1 = ${last}` : step >= 2 ? `${c.t("survivant", "survivor")} : ${last}` : "";
    label.textContent = step === 0 && k === 2 ? `${c.t("on saute 1, on élimine 2…", "skip 1, remove 2…")}` : step === 0 ? `${c.t("on élimine 1 sur", "remove 1 in")} ${k}` : `${c.t("éliminés", "removed")} : ${Math.floor(killedF + 1e-9)}`;
  },
};

export const SCENES_3 = { box, cham, konigsberg, josephus };
