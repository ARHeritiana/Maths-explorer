// Animated solution of the josephus challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, clamp01 } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { josephusOrder } from "./maths.js";

/* ================================================================= the Josephus circle */
export const scene = {
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

/* -------------------------------------------------------------- josephus */
export const diagram = {
  size: [520, 300],
  steps: (q) => {
    const k = Number(q.k), { out, last } = josephusOrder(q.n, k);
    if (k === 2) {
      const m = 2 ** Math.floor(Math.log2(q.n)), l = q.n - m;
      return [
        P(`${q.n} personnes en cercle. On saute 1, on élimine 2, on saute 3, on élimine 4, …`, `${q.n} people in a circle. Skip 1, remove 2, skip 3, remove 4, …`),
        l ? P(`Après ${l} éliminations (2, 4, …, ${2 * l}), il reste ${m} personnes : une puissance de 2.`, `After ${l} removals (2, 4, …, ${2 * l}), ${m} people remain: a power of 2.`) : P(`${q.n} est déjà une puissance de 2 : aucune élimination préalable.`, `${q.n} is already a power of 2: no preliminary removals.`),
        P(`Avec ${m} = 2^${Math.log2(m)} personnes, chaque tour retire une personne sur deux et recommence au même point : la personne qu’on saute en premier survit toujours. Ici c’est ${last}.`, `With ${m} = 2^${Math.log2(m)} people, each lap removes every second person and restarts at the same spot: the person skipped first always survives. Here that is ${last}.`),
        P(`On joue la suite : ${last} est bien la dernière personne restante.`, `Play it out: ${last} is indeed the last person standing.`),
        P(`${q.n} = ${m} + ${l} : avec l éliminations pour atteindre une puissance de 2, le survivant est 2l + 1. Ici 2 × ${l} + 1 = ${last}.`, `${q.n} = ${m} + ${l}: with l removals to reach a power of 2, the survivor is 2l + 1. Here 2 × ${l} + 1 = ${last}.`),
      ];
    }
    return [
      P(`${q.n} personnes en cercle. On saute ${k - 1} personnes, on élimine la suivante, et on recommence.`, `${q.n} people in a circle. Skip ${k - 1} people, remove the next one, and carry on.`),
      P(`On joue : les éliminés se succèdent (${out.slice(0, 5).join(", ")}, …).`, `Play it: the removed ones follow one another (${out.slice(0, 5).join(", ")}, …).`),
      P(`Dernière personne restante : ${last}.`, `Last person standing: ${last}.`),
      P(`Il n’y a pas de formule aussi simple qu’avec une élimination sur deux, mais une récurrence : J(1) = 1 et J(n) = (J(n − 1) + ${k} − 1) mod n + 1. On l’applique de n = 2 à n = ${q.n} : J(${q.n}) = ${last}.`, `There is no formula as simple as for every second one, but a recurrence: J(1) = 1 and J(n) = (J(n − 1) + ${k} − 1) mod n + 1. Apply it from n = 2 to n = ${q.n}: J(${q.n}) = ${last}.`),
    ];
  },
  draw(c, s, p, q) {
    const n = q.n, k = Number(q.k), { out, last } = josephusOrder(n, k), P2 = (i) => { const a = ((-90 + (360 * (i - 1)) / n) * Math.PI) / 180; return [170 + 128 * Math.cos(a), 150 + 128 * Math.sin(a)]; };
    const m = 2 ** Math.floor(Math.log2(n)), l = n - m;
    let killed;
    if (k === 2) killed = s === 0 ? Math.round(ez(p) * l) : s === 1 || s === 2 ? l : s === 3 ? l + Math.round(ez(p) * (out.length - l)) : out.length;
    else killed = s === 0 ? 0 : s === 1 ? Math.round(ez(p) * Math.min(out.length, Math.max(6, Math.floor(n / 3)))) : out.length;
    const dead = new Set(out.slice(0, killed)), rad = n > 70 ? 3.2 : n > 45 ? 5 : 9;
    for (let i = 1; i <= n; i++) {
      const [x, y] = P2(i), isDead = dead.has(i), win = s >= 2 && i === last;
      c.circ(x, y, win ? rad + 2 : rad, { class: `js-p${isDead ? " dead" : ""}${win ? " win" : ""}`, style: win || isDead || !(k === 2 && s === 1) ? "" : `fill:${colour(0)}` });
      if (n <= 45) c.text(x, y + 3.5, i, { class: `js-n${isDead ? " dead" : ""}`, "text-anchor": "middle" });
    }
    const left = n - killed;
    c.text(418, 110, k === 2 && s === 2 ? `${m} = 2^${Math.log2(m)}` : k === 2 && s === 4 ? `${n} = ${m} + ${l}` : `${left}`, { class: "sol-big", "text-anchor": "middle", style: k === 2 && (s === 2 || s === 4) ? "font-size:28px" : "" });
    c.text(418, 150, k === 2 && s === 2 ? c.t("le premier sauté survit", "first skipped survives") : k === 2 && s === 4 ? `2 × ${l} + 1 = ${last}` : c.t("personnes restantes", "people left"), { class: k === 2 && s === 4 ? "sol-hot" : "sol-sub", "text-anchor": "middle" });
  },
};
