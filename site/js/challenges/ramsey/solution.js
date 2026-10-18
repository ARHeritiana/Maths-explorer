// Animated solution of the ramsey challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, makeSoldier, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";

/* ================================================================= friends and strangers */
export const ring = (n, i) => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180; return [190 + 105 * Math.cos(a), 150 + 105 * Math.sin(a)]; };

export const LOOK = [{ uniform: "#3b82f6", hat: 0 }, { uniform: "#e8710a", hat: 1 }, { uniform: "#2fa866", hat: 2 }, { uniform: "#c2185b", hat: 3 }];

export function ramseyFrame(step, p, q) {
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

export const scene = {
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

/* ---------------------------------------------------------------- ramsey */
export const diagram = {
  size: [520, 300],
  steps: (q) => Number(q.s) === 3 ? [
    P("Cinq personnes suffisent-elles ? On colorie le pentagone en bleu (amis) et ses diagonales en orange (pas amis).", "Are five people enough? Colour the pentagon blue (friends) and its diagonals orange (not friends)."),
    P("Aucun trio n’a trois traits de la même couleur : cinq personnes ne suffisent pas.", "No trio has three lines of one colour: five people are not enough."),
    P("Avec six personnes, regardons la personne A : elle a 5 relations avec les autres.", "With six people, look at person A: she has 5 relations with the others."),
    P("5 relations, 2 couleurs : au moins 3 de la même couleur (tiroirs). Disons B, C, D, amis de A.", "5 relations, 2 colours: at least 3 of one colour (pigeonhole). Say B, C, D are friends of A."),
    P("Si deux d’entre eux sont amis, par exemple B et C, alors A, B, C sont trois amis.", "If two of them are friends, say B and C, then A, B, C are three friends."),
    P("Sinon B, C, D ne sont amis deux à deux : trois personnes sans amis entre elles. Dans tous les cas, un trio de même couleur : le minimum est 6.", "Otherwise B, C, D are pairwise not friends: three people with no friendship among them. Either way there is a one-colour trio: the minimum is 6."),
  ] : [
    P("Huit personnes en cercle : deux personnes sont amies (bleu) si leurs places diffèrent de 1 ou de 4, sinon non amies (orange). Chacun a 3 amis.", "Eight people in a circle: two are friends (blue) if their seats differ by 1 or 4, otherwise not friends (orange). Everyone has 3 friends."),
    P("Aucun trio d’amis et aucun groupe de 4 inconnus : huit personnes ne suffisent pas.", "No trio of friends and no group of 4 strangers: eight people are not enough."),
    P("Avec 9 personnes, supposons qu’il n’y ait ni trio d’amis ni 4 inconnus. Une personne A a au plus 3 amis : 4 amis seraient deux à deux inconnus.", "With 9 people, suppose there is no trio of friends and no 4 strangers. A person A has at most 3 friends: 4 friends would be pairwise strangers."),
    P("A a au plus 5 inconnus : parmi 6 inconnus, R(3, 3) = 6 donnerait un trio d’amis ou un trio d’inconnus, donc 4 inconnus avec A.", "A has at most 5 strangers: among 6 strangers, R(3, 3) = 6 would give a trio of friends or of strangers, hence 4 strangers with A."),
    P("3 + 5 = 8 : chacun a exactement 3 amis. 9 × 3 = 27 amitiés comptées deux fois : impossible, 27 est impair. Donc R(3, 4) = 9.", "3 + 5 = 8: everyone has exactly 3 friends. 9 × 3 = 27 friendships counted twice: impossible, 27 is odd. So R(3, 4) = 9."),
  ],
  draw(c, s, p, q) {
    const blue = colour(0), orange = colour(1);
    const edge = (A, B, col, dash, k = 1, w = 4) => c.line(A[0], A[1], lerp(A[0], B[0], k), lerp(A[1], B[1], k), { class: "sol-edge", style: `stroke:${col};stroke-width:${w}`, ...(dash ? { "stroke-dasharray": "9 6" } : {}) });
    const node = (v, lab, hot) => { c.circ(v[0], v[1], 15, { class: "sol-node", style: hot ? `stroke:${hot};stroke-width:4` : "" }); c.text(v[0], v[1] + 5, lab, { class: "sol-label", "text-anchor": "middle" }); };
    const ring = (n, i) => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180; return [190 + 105 * Math.cos(a), 150 + 105 * Math.sin(a)]; };
    if (Number(q.s) === 4) {
      if (s <= 1) {
        const n = 8, friend = (i, j) => [1, 4, 7].includes((j - i + n) % n);
        let idx = 0;
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const f = friend(i, j), k = s === 0 ? ez(seg(p, (idx++ / 28) * 0.7, (idx / 28) * 0.7 + 0.3)) : 1; edge(ring(n, i), ring(n, j), f ? blue : orange, !f, k, f ? 4 : 1.8); }
        for (let i = 0; i < n; i++) node(ring(n, i), i + 1);
        c.text(420, 140, s === 1 ? "0" : "3", { class: "sol-big", "text-anchor": "middle" }); c.text(420, 176, s === 1 ? c.t("trio ou groupe interdit", "forbidden group") : c.t("amis chacun", "friends each"), { class: "sol-sub", "text-anchor": "middle" });
        return;
      }
      const n = 9, A = ring(n, 0), fr = s === 2 ? [1, 2, 3, 4] : [1, 2, 3], st = s === 2 ? [5, 6, 7, 8] : [4, 5, 6, 7, 8];
      fr.forEach((i, k) => edge(A, ring(n, i), blue, false, ez(seg(p, k / 6, k / 6 + 0.3))));
      st.forEach((i, k) => edge(A, ring(n, i), orange, true, s === 2 ? ez(seg(p, 0.5 + k / 8, 0.8 + k / 8)) : ez(seg(p, k / 7, k / 7 + 0.3)), 2.5));
      for (let i = 0; i < n; i++) node(ring(n, i), i === 0 ? "A" : "", s === 2 && i >= 1 && i <= 4 ? blue : "");
      if (s === 2) { c.text(420, 120, "4 ?", { class: "sol-big", "text-anchor": "middle" }); c.wrap(420, 156, c.t("4 amis seraient 4 inconnus", "4 friends would be 4 strangers"), 18, { class: "sol-sub", "text-anchor": "middle" }, 20); }
      if (s === 3) { c.text(420, 120, "≤ 5", { class: "sol-big", "text-anchor": "middle" }); c.text(420, 156, c.t("inconnus", "strangers"), { class: "sol-sub", "text-anchor": "middle" }); }
      if (s === 4) { c.text(420, 110, "9 × 3 = 27", { class: "sol-big small", "text-anchor": "middle" }); c.text(420, 146, c.t("impair :", "odd:"), { class: "sol-hot", "text-anchor": "middle", style: "fill:var(--neg)" }); c.text(420, 174, c.t("impossible", "impossible"), { class: "sol-hot", "text-anchor": "middle", style: "fill:var(--neg)" }); }
      return;
    }
    if (s <= 1) {
      for (let i = 0; i < 5; i++) edge(ring(5, i), ring(5, (i + 1) % 5), blue, false, s === 0 ? ez(seg(p, i / 10, i / 10 + 0.2)) : 1);
      for (let i = 0; i < 5; i++) edge(ring(5, i), ring(5, (i + 2) % 5), orange, true, s === 0 ? ez(seg(p, 0.5 + i / 10, 0.7 + i / 10)) : 1, 3);
      for (let i = 0; i < 5; i++) node(ring(5, i), i + 1);
      c.text(400, 140, s === 1 ? "0" : "", { class: "sol-big", "text-anchor": "middle" }); c.text(400, 176, s === 1 ? c.t("trio d’une seule couleur", "one-colour trios") : "", { class: "sol-sub", "text-anchor": "middle" });
      return;
    }
    const V = (i) => ring(6, i), Aq = V(0), friends = [1, 2, 3], others = [4, 5];
    friends.forEach((i, k) => edge(Aq, V(i), blue, false, s === 2 ? ez(seg(p, k / 6, k / 6 + 0.3)) : 1));
    others.forEach((i, k) => edge(Aq, V(i), orange, true, s === 2 ? ez(seg(p, 0.5 + k / 6, 0.8 + k / 6)) : 1, 3));
    if (s === 4) { edge(V(1), V(2), blue, false, ez(p)); c.path(`M${Aq[0]} ${Aq[1]}L${V(1)[0]} ${V(1)[1]}L${V(2)[0]} ${V(2)[1]}Z`, { class: "sol-tri", style: `fill:${blue};opacity:${0.35 * ez(p)}` }); }
    if (s === 5) { [[1, 2], [2, 3], [1, 3]].forEach(([a, b], k) => edge(V(a), V(b), orange, true, ez(seg(p, k / 4, k / 4 + 0.3)), 3)); c.path(`M${V(1)[0]} ${V(1)[1]}L${V(2)[0]} ${V(2)[1]}L${V(3)[0]} ${V(3)[1]}Z`, { class: "sol-tri", style: `fill:${orange};opacity:${0.35 * ez(seg(p, 0.6, 1))}` }); }
    for (let i = 0; i < 6; i++) node(V(i), "ABCDEF"[i], s >= 3 && friends.includes(i) ? blue : "");
    if (s === 2) c.text(400, 150, "5", { class: "sol-big", "text-anchor": "middle" });
  },
};
