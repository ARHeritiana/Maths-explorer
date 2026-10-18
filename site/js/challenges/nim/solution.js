// Animated solution of the nim challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, lerp, easeInOut, seg, clamp01 } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { nimScript } from "./maths.js";

/* ================================================================= the 21 stones */
export const scene = {
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

/* ------------------------------------------------------------------- nim */
export const diagram = {
  size: [520, 300],
  steps: (q) => {
    const b = q.m + 1, r = q.n % b, rounds = Math.floor(q.n / b);
    const out = [r > 0 ? P(`Tu prends ${r} pierre${r > 1 ? "s" : ""} : il en reste ${q.n - r}, soit ${rounds} bloc${rounds > 1 ? "s" : ""} de ${b}. L’adversaire va devoir jouer dans un bloc.`, `You take ${r} stone${r > 1 ? "s" : ""}: ${q.n - r} remain, that is ${rounds} block${rounds > 1 ? "s" : ""} of ${b}. The opponent has to play into a block.`) : P(`${q.n} pierres, c’est ${rounds} blocs de ${b} : quoi que tu prennes, l’adversaire parfait peut compléter à ${b}. Tu prends 1 pierre pour voir.`, `${q.n} stones is ${rounds} blocks of ${b}: whatever you take, a perfect opponent can complete to ${b}. You take 1 stone to see.`)];
    out.push(r > 0 ? P(`Il prend k pierres, tu prends ${b} − k : le bloc de ${b} est complet.`, `They take k, you take ${b} − k: the block of ${b} is complete.`) : P(`Il prend ce qu’il faut pour que ${b} pierres au total partent à chaque tour : un bloc de ${b} se vide, et c’est toi qui reçois un multiple de ${b}.`, `They take what completes ${b} stones in total each round: a block of ${b} empties, and you are the one handed a multiple of ${b}.`));
    if (rounds > 2) out.push(P("Même scénario, bloc après bloc.", "Same story, block after block."));
    out.push(r > 0 ? P(`À la fin, il reste un bloc de ${b} : l’adversaire prend k, tu prends la dernière pierre. Tu gagnes quel que soit k.`, `At the end one block of ${b} remains: they take k, you take the last stone. You win whatever k is.`) : P(`Le multiple de ${b} est toujours pour toi : c’est l’adversaire qui prend la dernière pierre. La réponse est 0.`, `You are always handed the multiple of ${b}: the opponent takes the last stone. The answer is 0.`));
    return out;
  },
  draw(c, s, p, q) {
    const moves = nimScript(q), b = q.m + 1, rounds = Math.floor(q.n / b), last = rounds > 2 ? 3 : 2;
    const total = moves.length, at = (st) => (st === 0 ? 1 : st === 1 ? Math.min(3, total) : st === 2 && rounds > 2 ? Math.min(total, 3 + Math.round(ez(p) * (total - 3))) : total);
    const nShown = at(s), prev = s === 0 ? 0 : at(s - 1);
    const owner = Array(q.n).fill(0), fresh = new Set(); let right = q.n;
    moves.slice(0, nShown).forEach(([who, take], idx) => { for (let k = 0; k < take; k++) { right -= 1; owner[right] = who; if (idx >= prev) fresh.add(right); } });
    const per = q.n <= 30 ? q.n : Math.ceil(q.n / 2), sp = Math.min(23.5, 480 / per), rad = sp * 0.4, left = right;
    for (let i = 0; i < q.n; i++) {
      const row = Math.floor(i / per), x = 22 + (i % per) * sp, y = 100 + row * (rad * 2 + 14), w = owner[i], f = fresh.has(i);
      const fill = w === 1 ? colour(0) : w === 2 ? colour(1) : "var(--surface)";
      c.circ(x, y, rad, { class: "sol-stone", style: `fill:${fill};stroke:${w ? fill : "var(--ink)"};opacity:${w && f ? 0.3 + 0.7 * ez(p) : w ? 0.45 : 1}` });
      if (!w) c.rect(x - rad, y + rad + 3, rad * 2, 4, { rx: 2, style: `fill:${colour(2 + (Math.floor(i / b) % 2) * 2)}` });
    }
    c.text(260, 36, `${left} ${c.t(left > 1 ? "pierres" : "pierre", left > 1 ? "stones" : "stone")}`, { class: "sol-big small", "text-anchor": "middle" });
    c.rect(150, 238, 12, 12, { rx: 3, style: `fill:${colour(0)}` }); c.text(168, 249, c.t("tes pierres", "your stones"), { class: "sol-small" });
    c.rect(290, 238, 12, 12, { rx: 3, style: `fill:${colour(1)}` }); c.text(308, 249, c.t("pierres de l’adversaire", "opponent’s stones"), { class: "sol-small" });
    c.text(260, 214, c.t(`les barres regroupent les pierres restantes par ${b}`, `bars group the remaining stones by ${b}`), { class: "sol-sub", "text-anchor": "middle" });
    void last;
  },
};
