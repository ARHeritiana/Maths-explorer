// Animated solution of the doors challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, clamp01, lerp } from "../common/scene-kit.js";

/* ================================================================= the doors of the hotel */
export const scene = {
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

/* ----------------------------------------------------------------- doors */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const m = Math.floor(Math.sqrt(q.n)); return [
    P("Passage 1 : on change l’état de toutes les portes. Toutes sont ouvertes.", "Pass 1: every door is toggled. All are open."),
    P("Passage 2 : les multiples de 2 changent d’état et se referment.", "Pass 2: the multiples of 2 are toggled and close again."),
    P("Passage 3 : les multiples de 3 changent d’état.", "Pass 3: the multiples of 3 are toggled."),
    P(`Les passages 4 à ${q.n} défilent. Une porte change d’état à chaque diviseur de son numéro.`, `Passes 4 to ${q.n} run. A door is toggled once for each divisor of its number.`),
    P(`Il reste ${m} portes ouvertes : 1, 4, 9, …, ${m * m}. Les diviseurs vont par paires, sauf quand un nombre est un carré parfait.`, `${m} doors stay open: 1, 4, 9, …, ${m * m}. Divisors come in pairs, except when a number is a perfect square.`),
  ]; },
  draw(c, s, p, q) {
    const N = q.n, cols = N <= 100 ? 10 : N <= 150 ? 15 : 20, rows = Math.ceil(N / cols), w = Math.min(25, 250 / cols), h = Math.min(27, 270 / rows), fs = Math.min(9, w * 0.4);
    const pass = s === 0 ? 1 : s === 1 ? 2 : s === 2 ? 3 : s === 3 ? 3 + Math.round(ez(p) * (N - 3)) : N;
    const open = (d) => { let k = 0; for (let r = 1; r <= pass; r++) if (d % r === 0) k++; return k % 2 === 1; };
    let count = 0;
    for (let d = 1; d <= N; d++) {
      const x = 14 + ((d - 1) % cols) * w, y = 14 + Math.floor((d - 1) / cols) * h, o = open(d), sq = Number.isInteger(Math.sqrt(d));
      if (o) count++;
      c.rect(x, y, w - 3, h - 3, { rx: 4, class: `sol-door${o ? " open" : ""}${s === 4 && sq ? " square" : ""}`, style: o ? `fill:${s === 4 ? colour(2) : colour(0)}` : "" });
      if (w > 14) c.text(x + (w - 3) / 2, y + h * 0.6, d, { class: `sol-tiny${o ? " on" : ""}`, "text-anchor": "middle", style: `font-size:${fs}px` });
    }
    const X0 = 14 + cols * w + 20;
    c.text(X0, 40, `${c.t("Passage", "Pass")} ${pass}`, { class: "sol-sub" });
    if (s === 4) {
      const m = Math.floor(Math.sqrt(N)), d0 = Math.min(36, m * m), divs = []; for (let r = 1; r <= d0; r++) if (d0 % r === 0 && r <= d0 / r) divs.push([r, d0 / r]);
      c.text(X0, 78, c.t(`Porte ${d0} : diviseurs par paires`, `Door ${d0}: divisors in pairs`), { class: "sol-sub" });
      divs.slice(0, 5).forEach(([a, b], i) => c.text(X0, 108 + i * 26, `${a} × ${b}`, { class: a === b ? "sol-hot" : "sol-line", style: a === b ? "" : `fill:${colour(0)}` }));
      if (divs.some(([a, b]) => a === b)) c.wrap(X0, 108 + Math.min(5, divs.length) * 26 + 10, c.t(`${Math.sqrt(d0)} × ${Math.sqrt(d0)} : un diviseur sans partenaire, donc un nombre impair de diviseurs : la porte reste ouverte.`, `${Math.sqrt(d0)} × ${Math.sqrt(d0)}: one divisor with no partner, so an odd number of divisors: the door stays open.`), 30, { class: "sol-small" }, 16);
    } else { c.text(X0, 84, c.t("Ouvertes", "Open"), { class: "sol-sub" }); c.text(X0, 130, count, { class: "sol-big" }); }
  },
};
