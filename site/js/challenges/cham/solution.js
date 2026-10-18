// Animated solution of the cham challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { makeChameleon } from "./art.js";
import { chamSolve, chamSet } from "./maths.js";
import { el, pillAt, white, P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";

/* ================================================================= the chameleons */
// For an impossible start, a few meetings just to see the colours shuffle: always a legal move, never a single colour.
export const wander = (r, g, b, n = 6) => { const out = []; let s = [r, g, b]; const pairs = [[0, 1], [1, 2], [0, 2]]; for (let i = 0; i < n; i++) { const [a, c2] = pairs[i % 3]; if (s[a] < 1 || s[c2] < 1) continue; const t = [...s]; t[a]--; t[c2]--; t[3 - a - c2] += 2; out.push({ from: s, to: t, meet: [a, c2] }); s = t; } return out; };

export const SKIN = ["#e0457b", "#3fbf7f", "#4a8cff"];

export const scene = {
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

/* ------------------------------------------------------------ chameleons */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const [r, g, b] = chamSet(q.set), sol = chamSolve(r, g, b), mod = (x) => ((x % 3) + 3) % 3; return [
    P(`${r} rouges, ${g} verts, ${b} bleus. Deux caméléons de couleurs différentes se rencontrent : tous deux prennent la troisième couleur.`, `${r} red, ${g} green, ${b} blue. Two chameleons of different colours meet: both take the third colour.`),
    P("Une rencontre rouge-vert : r − 1, v − 1, b + 2. Les trois effectifs changent de −1, −1, +2.", "A red–green meeting: r − 1, g − 1, b + 2. The three counts change by −1, −1, +2."),
    P("Les différences r − v, v − b, b − r varient de 0 ou de ±3 : modulo 3, elles ne changent jamais. C’est l’invariant.", "The differences r − g, g − b, b − r change by 0 or ±3: modulo 3 they never change. That is the invariant."),
    P("Pour que tous aient la même couleur, deux effectifs doivent valoir 0 : leur différence vaut 0, donc deux des trois différences doivent être ≡ 0 (mod 3).", "For all to have the same colour, two counts must be 0: their difference is 0, so one of the three differences must be ≡ 0 (mod 3)."),
    sol ? P(`Ici r − v ≡ ${mod(r - g)}, v − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)} : c’est possible, et il faut au minimum ${sol.length} rencontres (suite ci-contre).`, `Here r − g ≡ ${mod(r - g)}, g − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)}: it is possible, and at least ${sol.length} meetings are needed (sequence shown).`) : P(`Ici r − v ≡ ${mod(r - g)}, v − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)} : aucune n’est congrue à 0, donc c’est impossible. Réponse : 0.`, `Here r − g ≡ ${mod(r - g)}, g − b ≡ ${mod(g - b)}, b − r ≡ ${mod(b - r)}: none is 0, so it is impossible. Answer: 0.`),
  ]; },
  draw(c, s, p, q) {
    const [r, g, b] = chamSet(q.set), cols = [colour(3), colour(2), colour(0)], names = [c.t("rouges", "red"), c.t("verts", "green"), c.t("bleus", "blue")], mod = (x) => ((x % 3) + 3) % 3;
    const after = [r - 1, g - 1, b + 2], k = s === 1 ? ez(seg(p, 0.15, 0.85)) : s >= 2 ? 1 : 0, cur = s >= 1 ? [lerp(r, after[0], k), lerp(g, after[1], k), lerp(b, after[2], k)] : [r, g, b], mx = Math.max(r, g, b, after[2]) || 1;
    if (s <= 3) cur.forEach((v, i) => { const w = (v / mx) * 280; c.rect(110, 50 + i * 50, Math.max(0, w), 30, { rx: 6, fill: cols[i], stroke: "var(--ink)", "stroke-width": 1.5 }); c.text(100, 71 + i * 50, names[i], { "text-anchor": "end", class: "sol-small" }); c.text(118 + Math.max(0, w), 71 + i * 50, `${Math.round(v)}`, { class: "sol-line" }); });
    if (s >= 2 && s <= 3) {
      const rows = [["r − v", r - g, after[0] - after[1]], ["v − b", g - b, after[1] - after[2]], ["b − r", b - r, after[2] - after[0]]];
      rows.forEach(([lab, before, aft], i) => { c.text(60, 218 + i * 24, `${lab} :`, { class: "sol-small" }); c.text(130, 218 + i * 24, `${before}`, { class: "sol-line" }); c.text(180, 218 + i * 24, "→", { class: "sol-small" }); c.text(210, 218 + i * 24, `${aft}`, { class: "sol-line" }); c.text(270, 218 + i * 24, `mod 3 : ${mod(before)} = ${mod(aft)}`, { class: s === 3 && mod(before) === 0 ? "sol-hot" : "sol-small" }); });
    }
    if (s === 4) {
      const sol = chamSolve(r, g, b);
      if (!sol) { c.text(260, 130, [r, g, b].join(" · "), { ...mid, class: "sol-big small" }); c.text(260, 190, c.t("impossible", "impossible"), { ...mid, class: "sol-hot" }); }
      else { const states = [[r, g, b], ...sol.map((x) => x.to)], shown = Math.min(states.length, Math.floor(ez(p) * states.length + 1)), cols2 = states.length > 7 ? 2 : 1; states.slice(0, shown).forEach((st, i) => { const col = Math.floor(i / 7), row = i % 7; c.text(40 + col * 240, 54 + row * 30, `${i}. (${st.join(", ")})`, { class: i === states.length - 1 ? "sol-hot" : "sol-line" }); }); void cols2; c.text(440, 268, `${sol.length}`, { ...mid, class: "sol-big small" }); c.text(440, 290, c.t("rencontres", "meetings"), { ...mid, class: "sol-sub" }); }
    }
  },
};
