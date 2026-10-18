// Animated solution of the merge challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, clamp01, lerp } from "../common/scene-kit.js";
import { factorial, mergeFinal } from "./maths.js";

/* ================================================================= numbers that merge */
export const scene = {
  size: [520, 300],
  dur: (s) => [3600, 4200, 4200, 4200, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Math.min(Number(q.n), 12);
    el("rect", { width: 520, height: 300, fill: "#e9f3ee" }, svg); el("rect", { x: 0, y: 240, width: 520, height: 60, fill: "#c9e3d4" }, svg);
    const blobs = Array.from({ length: n + 1 }, (_, i) => { const g = el("g", {}, svg), inner = el("g", {}, g); el("ellipse", { cy: 0, rx: 16, ry: 5, fill: "#000", opacity: 0.18 }, g); const body = el("circle", { cy: -18, r: 18, stroke: "#0004", "stroke-width": 1.6 }, inner); el("circle", { cx: -5, cy: -24, r: 3, fill: "#fff" }, inner); el("circle", { cx: 5, cy: -24, r: 3, fill: "#fff" }, inner); el("circle", { cx: -4.4, cy: -23.6, r: 1.4, fill: "#111" }, inner); el("circle", { cx: 5.6, cy: -23.6, r: 1.4, fill: "#111" }, inner); const num = el("text", { y: -6, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff;paint-order:stroke;stroke:#0006;stroke-width:3px" }, inner); const tag = el("text", { y: 14, "text-anchor": "middle", style: "font:700 11px var(--body);fill:#2b2538" }, g); return { g, inner, body, num, tag }; });
    const t = [0, 1, 2, 3].map((i) => el("text", { x: 260, "text-anchor": "middle", style: "font:700 24px var(--math);fill:#2b2538" }, svg));
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(14) }, board);
    return { c, n, blobs, t, label };
  },
  update(S, step, p, q) {
    const { c, n, blobs, t, label } = S, cell = Math.min(44, 480 / n), x0 = 260 - (cell * n) / 2, Q = Number(q.n);
    const show = (b, x, y, num, tag, fill, sc = 1, sq = 0) => { b.g.setAttribute("opacity", "1"); b.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`); b.inner.setAttribute("transform", `scale(${(1 + 0.12 * sq).toFixed(3)} ${(1 - 0.12 * sq).toFixed(3)})`); b.body.setAttribute("fill", fill); b.num.textContent = num; b.tag.textContent = tag; };
    const hide = (b) => b.g.setAttribute("opacity", "0");
    blobs.forEach(hide); t.forEach((x) => { x.textContent = ""; });
    const hue = (i) => `color-mix(in srgb, ${colour(i)} 78%, #fff)`;
    if (step === 0) for (let i = 1; i <= n; i++) show(blobs[i - 1], x0 + (i - 0.5) * cell, 180 - 8 * Math.abs(Math.sin(p * 6 + i)), i, "", hue(i - 1), cell / 40);
    else if (step === 1) {
      const k = easeInOut(seg(p, 0.15, 0.7)), sq = Math.sin(clamp01(seg(p, 0.6, 0.8)) * Math.PI);
      if (k < 0.99) { show(blobs[0], lerp(200, 250, k), 180, 1, "", hue(0), 1.3); show(blobs[1], lerp(320, 270, k), 180, 2, "", hue(1), 1.3); } else show(blobs[2], 260, 180 - 14 * Math.sin(seg(p, 0.7, 1) * Math.PI), 5, "5 + 1 = 6", hue(2), 1.5, sq);
      t[0].setAttribute("y", 110); t[0].textContent = k < 0.99 ? "1 + 2 + 1 × 2" : "= 5"; if (p > 0.8) { t[1].setAttribute("y", 250); t[1].textContent = "(1 + 1)(2 + 1) = 6 = 5 + 1"; t[1].style.fill = "#1f7a4a"; }
    } else if (step === 2) {
      show(blobs[0], 170, 214, "a", "a + 1", hue(0), 1.5); show(blobs[1], 350, 214, "b", "b + 1", hue(1), 1.5); t[0].setAttribute("y", 100); t[0].textContent = "a + b + ab + 1"; t[1].setAttribute("y", 140); t[1].textContent = "=  (a + 1)(b + 1)"; t[1].setAttribute("opacity", String(easeInOut(seg(p, 0.2, 0.7)))); t[2].setAttribute("y", 252); t[2].textContent = c.t("∏ (nombre + 1) est invariant", "∏ (number + 1) is invariant"); t[2].style.fill = "#1f7a4a"; t[2].setAttribute("opacity", String(easeInOut(seg(p, 0.5, 1))));
    } else if (step === 3) {
      for (let i = 1; i <= n; i++) show(blobs[i - 1], x0 + (i - 0.5) * cell, 170, i, String(i + 1), hue(i - 1), cell / 40);
      t[0].setAttribute("y", 238); t[0].textContent = `2 × 3 × … × ${Q + 1} = ${Q + 1}!`; t[0].setAttribute("opacity", String(easeInOut(seg(p, 0.2, 0.7)))); t[1].setAttribute("y", 272); t[1].textContent = factorial(Q + 1).toLocaleString(c.t("fr-FR", "en-US")); t[1].style.fill = "#1f7a4a"; t[1].setAttribute("opacity", String(easeInOut(seg(p, 0.5, 1))));
    } else {
      show(blobs[0], 260, 170 - 6 * Math.abs(Math.sin(p * 8)), "N", `N + 1 = ${Q + 1}!`, hue(3), 2); t[0].setAttribute("y", 90); t[0].textContent = `N = ${Q + 1}! − 1`; t[1].setAttribute("y", 252); t[1].textContent = mergeFinal(Q).toLocaleString(c.t("fr-FR", "en-US")); t[1].style.fill = "#1f7a4a"; t[1].setAttribute("opacity", String(easeInOut(seg(p, 0.2, 0.8))));
    }
    [0, 1, 2, 3].forEach((i) => { if (!(step === 1 && i === 1 && p > 0.8) && !(step === 2 && (i === 1 || i === 2)) && !(step === 3 && (i === 0 || i === 1)) && !(step === 4 && i === 1)) t[i].setAttribute("opacity", step === 0 ? "0" : i === 0 ? "1" : "0"); });
    label.textContent = [c.t(`au tableau : 1, 2, …, ${Q}`, `on the board: 1, 2, …, ${Q}`), c.t("1 et 2 fusionnent : 1 + 2 + 1×2 = 5", "1 and 2 merge: 1 + 2 + 1×2 = 5"), c.t("a + b + ab + 1 = (a + 1)(b + 1)", "a + b + ab + 1 = (a + 1)(b + 1)"), c.t("au départ : le produit des (nombre + 1)", "at the start: the product of the (number + 1)"), c.t("un seul nombre : N + 1 = (n + 1)!", "one number left: N + 1 = (n + 1)!")][step];
  },
};

/* ----------------------------------------------------------------- merge */
export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P(`Au tableau : 1, 2, …, ${q.n}. On efface a et b et on écrit a + b + ab, jusqu’à ce qu’il ne reste qu’un nombre.`, `On the board: 1, 2, …, ${q.n}. Erase a and b and write a + b + ab, until one number remains.`),
    P("Essayons : 1 et 2 deviennent 1 + 2 + 1×2 = 5. Remarquons que 5 + 1 = 6 = (1 + 1)(2 + 1).", "Try it: 1 and 2 become 1 + 2 + 1×2 = 5. Notice that 5 + 1 = 6 = (1 + 1)(2 + 1)."),
    P("En général a + b + ab + 1 = (a + 1)(b + 1) : le produit de tous les (nombre + 1) ne change jamais. C’est l’invariant.", "In general a + b + ab + 1 = (a + 1)(b + 1): the product of all the (number + 1) never changes. That is the invariant."),
    P(`Au départ : 2 × 3 × … × ${q.n + 1} = ${q.n + 1}! = ${factorial(q.n + 1).toLocaleString("fr-FR")}.`, `At the start: 2 × 3 × … × ${q.n + 1} = ${q.n + 1}! = ${factorial(q.n + 1).toLocaleString("en-US")}.`),
    P(`À la fin, il reste un seul nombre N, et N + 1 = ${q.n + 1}!. Donc N = ${q.n + 1}! − 1 = ${mergeFinal(q.n).toLocaleString("fr-FR")}, quel que soit l’ordre.`, `At the end a single number N remains, and N + 1 = ${q.n + 1}!. So N = ${q.n + 1}! − 1 = ${mergeFinal(q.n).toLocaleString("en-US")}, whatever the order.`),
  ],
  draw(c, s, p, q) {
    const n = Math.min(q.n, 12), cell = Math.min(40, 480 / n), x0 = 260 - (cell * n) / 2;
    const box2 = (x, y, w, txt, fill = "var(--surface)", cls = "sol-line") => { c.rect(x, y, w, 36, { rx: 8, fill, stroke: "var(--ink)", "stroke-width": 2 }); c.text(x + w / 2, y + 25, txt, { ...mid, class: cls }); };
    if (s === 0) for (let i = 1; i <= n; i++) box2(x0 + (i - 1) * cell, 100, cell - 4, i, `color-mix(in srgb, ${colour(i - 1)} 40%, var(--surface))`);
    if (s === 1) {
      const k = ez(seg(p, 0.1, 0.9));
      box2(180, 70, 60, "1", `color-mix(in srgb, ${colour(0)} 40%, var(--surface))`); box2(280, 70, 60, "2", `color-mix(in srgb, ${colour(1)} 40%, var(--surface))`);
      c.text(260, 90, "+", { ...mid, class: "sol-line", opacity: 1 - k }); box2(230, lerp(70, 150, k), 60, k > 0.6 ? "5" : "…", `color-mix(in srgb, ${colour(2)} 40%, var(--surface))`);
      if (k > 0.8) c.text(260, 230, "(1 + 1)(2 + 1) = 6 = 5 + 1", { ...mid, class: "sol-hot" });
    }
    if (s === 2) { c.text(260, 90, "a + b + ab + 1", { ...mid, class: "sol-big small" }); c.text(260, 130, "=", { ...mid, class: "sol-big small", opacity: ez(seg(p, 0.2, 0.6)) }); c.text(260, 172, "(a + 1)(b + 1)", { ...mid, class: "sol-big small", opacity: ez(seg(p, 0.3, 0.8)) }); c.text(260, 240, c.t("∏ (nombre + 1) est invariant", "∏ (number + 1) is invariant"), { ...mid, class: "sol-hot", opacity: ez(seg(p, 0.6, 1)) }); }
    if (s === 3) { for (let i = 1; i <= n; i++) box2(x0 + (i - 1) * cell, 80, cell - 4, i + 1, `color-mix(in srgb, ${colour(i - 1)} 40%, var(--surface))`, "sol-small"); c.text(260, 170, `2 × 3 × … × ${q.n + 1} = ${q.n + 1}!`, { ...mid, class: "sol-line", opacity: ez(seg(p, 0.2, 0.7)) }); c.text(260, 214, factorial(q.n + 1).toLocaleString("fr-FR"), { ...mid, class: "sol-hot", opacity: ez(seg(p, 0.5, 1)) }); }
    if (s === 4) { box2(190, 80, 140, `N + 1 = ${q.n + 1}!`, "var(--surface)"); c.text(260, 170, `N = ${q.n + 1}! − 1`, { ...mid, class: "sol-line" }); c.text(260, 220, mergeFinal(q.n).toLocaleString("fr-FR"), { ...mid, class: "sol-hot", opacity: ez(seg(p, 0.2, 0.8)) }); }
  },
};
