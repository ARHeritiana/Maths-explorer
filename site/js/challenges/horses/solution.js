// Animated solution of the horses challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
//
// Cartoon solutions, batch 2: the 25 horses. Same protocol as the other scenes (mount once, update(step, p)).
import { P, ez, ink } from "../common/helpers.js";
import { svgEl, colour } from "../common/kit.js";
import { easeInOut, seg, lerp, clamp01 } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { makeHorse } from "./art.js";
import { horseRaces } from "./maths.js";

export const el = svgEl;

export const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;

export const LETTERS = "ABCDE";

/* ================================================================= the 25 horses */
export const ORDER = [2, 0, 4, 1, 3];

export const CLOTH = ["#2563eb", "#e8710a", "#16a34a", "#c2185b", "#7b1fa2"], COAT = ["#9a5b2e", "#6b3b1a", "#c98a4a", "#3a3230", "#b3722f"];

export const rowBefore = (h, r) => (2 * r + h) % 5;

export const lane = (h, r) => (2 * r + h) % 5;

export const SMALL = { x: (col) => 46 + col * 86, y: (row) => 198 + row * 21, s: 0.4 };

export const LARGE = { x: (col) => 70 + col * 86, y: (row) => 110 + row * 38, s: 0.6 };

export const TRACK = { x0: 24, x1: 372, y: (j) => 56 + j * 25, s: 0.52 };

export const CANDIDATES = [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0]];

export const RACE7 = [[0, 1], [1, 0], [0, 2], [1, 1], [2, 0]];

export const scene = {
  size: [520, 300],
  dur: (s, q) => { const top3 = Number(q.top) === 3; return s === 0 ? 9000 : s === 1 ? 6200 : top3 ? [0, 0, 3600, 3600, 6200][s] : 4600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg;
    dayScene(svg, { ground: 172 });
    const track = el("g", {}, svg);
    el("rect", { x: 0, y: 30, width: 520, height: 136, fill: "#d9b48a" }, track);
    for (let j = 0; j <= 5; j++) el("line", { x1: 0, y1: 42 + j * 25, x2: 520, y2: 42 + j * 25, stroke: "#fff", "stroke-width": 2, "stroke-dasharray": "10 8", opacity: 0.75 }, track);
    for (let k = 0; k < 13; k++) el("rect", { x: 384, y: 32 + k * 10.3, width: 8, height: 10.3, fill: k % 2 ? "#fff" : "#222" }, track);
    el("rect", { x: 0, y: 166, width: 520, height: 134, fill: "#5fa85e" }, svg);
    const fence = el("g", {}, svg); for (let i = 0; i < 27; i++) el("line", { x1: i * 20 + 4, y1: 166, x2: i * 20 + 4, y2: 176, stroke: "#fff", "stroke-width": 2.2 }, fence); el("line", { x1: 0, y1: 169, x2: 520, y2: 169, stroke: "#fff", "stroke-width": 2 }, fence);
    const panel = el("rect", { x: 20, y: 44, width: 480, height: 230, rx: 14, fill: "#0a0f2c", opacity: 0 }, svg);
    const heads = [0, 1, 2, 3, 4].map(() => el("text", { "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff;paint-order:stroke;stroke:#3a5a3a;stroke-width:3px" }, svg));
    const hs = []; for (let h = 0; h < 5; h++) for (let r = 0; r < 5; r++) hs.push({ h, r, spr: makeHorse(svg, { coat: COAT[(h + r) % 5], cloth: CLOTH[h] }), y: 0 });
    const board = el("g", {}, svg); el("rect", { x: 90, y: 6, width: 340, height: 30, rx: 15, fill: "#0a0f2c", opacity: 0.74 }, board);
    const label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(16) }, board);
    const medals = [0, 1, 2].map((i) => { const g = el("g", { opacity: 0 }, svg); el("circle", { r: 9, fill: ["#f3c84a", "#cfd6de", "#d08a4a"][i], stroke: "#222", "stroke-width": 1.4 }, g); const t = el("text", { y: 4.5, "text-anchor": "middle", style: "font:700 12px var(--body);fill:#222" }, g); t.textContent = i + 1; return g; });
    return { c, track, panel, heads, hs, label, medals, order: "" };
  },
  update(S, step, p, q) {
    const { c, track, panel, heads, hs, label, medals } = S, top3 = Number(q.top) === 3;
    // layout: 0 = small paddock board under the track, 1 = large board
    const L = step === 2 ? easeInOut(seg(p, 0, 0.3)) : step === 3 ? 1 : step === 4 && top3 ? 1 - easeInOut(seg(p, 0, 0.25)) : 0;
    const cell = (col, row) => ({ x: lerp(SMALL.x(col), LARGE.x(col), L), y: lerp(SMALL.y(row), LARGE.y(row), L), s: lerp(SMALL.s, LARGE.s, L) });
    const col = (h) => (step === 1 ? lerp(h, ORDER.indexOf(h), easeInOut(seg(p, 0.7, 1))) : step >= 2 ? ORDER.indexOf(h) : h);
    const sorted = (h) => step >= 1 || (step === 0 && p >= (h + 1) * 0.2);
    const letterOn = step >= 2 || (step === 1 && p > 0.72);
    const nameOf = (h, r) => (letterOn ? `${LETTERS[ORDER.indexOf(h)]}${r + 1}` : String(r + 1));
    const rank = [0, 1, 2, 3, 4];
    const finalA1 = step >= 2;
    const out = [];
    for (const o of hs) {
      const { h, r } = o, g = ORDER.indexOf(h);
      const home = (rowSorted) => { const cc = cell(col(h), rowSorted ? r : rowBefore(h, r)); return cc; };
      let pose = null;
      // --- races shown on the track
      const run = (startPt, laneJ, finishFrac, u, backPt, label2) => {
        const T = finishFrac, s = seg(u, 0.18, 0.72), f = clamp01(s / T), lx = lerp(TRACK.x0, TRACK.x1, f);
        let x, y, sc, dir = 1, amp = 0, phase = 0;
        if (u < 0.18) { const t = easeInOut(u / 0.18); x = lerp(startPt.x, TRACK.x0, t); y = lerp(startPt.y, TRACK.y(laneJ), t); sc = lerp(startPt.s, TRACK.s, t); amp = 0.8; phase = u * 14; dir = TRACK.x0 >= startPt.x ? 1 : -1; }
        else if (u < 0.72) { x = lx; y = TRACK.y(laneJ); sc = TRACK.s; amp = f < 1 ? 1.2 : 0.4; phase = s * 9 / Math.max(T, 0.5); }
        else { const t = easeInOut(seg(u, 0.78, 1)); x = lerp(lx, backPt.x, t); y = lerp(TRACK.y(laneJ), backPt.y, t); sc = lerp(TRACK.s, backPt.s, t); amp = t < 1 ? 0.7 : 0; phase = u * 10; dir = backPt.x >= lx ? 1 : -1; }
        return { x, y, dir, phase, amp, scale: sc, label: label2 };
      };
      if (step === 0) {
        const u = clamp01((p - h * 0.2) / 0.2);
        if (u > 0 && u < 1) pose = run(home(false), lane(h, r), 0.6 + 0.1 * r, u, home(true), String(r + 1));
        else { const cc = home(sorted(h)); pose = { x: cc.x, y: cc.y, scale: cc.s, label: String(r + 1) }; }
      } else if (step === 1 && r === 0) {
        const u = clamp01(p / 0.66), back = { ...cell(col(h), 0) };
        const finish = 0.6 + 0.1 * g;
        pose = p < 0.66 ? run(cell(h, 0), h, finish, u, cell(h, 0), nameOf(h, r)) : { ...(() => { const cc = cell(col(h), 0); return { x: cc.x, y: cc.y, scale: cc.s }; })(), label: nameOf(h, r) };
        if (p >= 0.66) pose.glow = g === 0 ? easeInOut(seg(p, 0.66, 0.8)) * (1 - seg(p, 0.9, 1)) : 0;
        void back;
      } else if (step === 4 && top3) {
        const cand = RACE7.findIndex(([lg, rr]) => lg === g && rr === r);
        const cc = cell(col(h), r);
        if (cand >= 0) { const u = clamp01(p / 0.8); pose = run(cc, cand, 0.6 + 0.1 * cand, u, cc, nameOf(h, r)); }
        else pose = { x: cc.x, y: cc.y, scale: cc.s, label: nameOf(h, r), dim: 1 };
      } else {
        const cc = cell(col(h), r);
        pose = { x: cc.x, y: cc.y, scale: cc.s, label: nameOf(h, r) };
      }
      // --- annotations by step
      const isA1 = g === 0 && r === 0, cand = top3 && CANDIDATES.some(([lg, rr]) => lg === g && rr === r);
      if (step === 2) { if (isA1) pose.glow = easeInOut(seg(p, 0.3, 0.6)); if (!top3) pose.dim = !isA1 ? easeInOut(seg(p, 0.35, 1)) * clamp01(((g * 5 + r) + 1) / 25 * 1.0 + 0.0) : 0; }
      if (step === 3) { if (isA1) pose.glow = 1; else if (cand) pose.glow = easeInOut(seg(p, 0.25, 0.6)); else pose.dim = easeInOut(seg(p, 0.1, 0.5)); }
      if (step === 4 && top3 && !pose.dim) { if (isA1) pose.glow = 1; }
      o.pose = pose; o.id = `${h}${r}`;
      out.push(o);
    }
    // draw order: lower on the screen is in front
    const orderKey = out.slice().sort((a, b) => a.pose.y - b.pose.y).map((o) => o.id).join(",");
    if (orderKey !== S.order) { out.slice().sort((a, b) => a.pose.y - b.pose.y).forEach((o) => o.spr.root.parentNode.append(o.spr.root)); S.order = orderKey; }
    out.forEach((o) => o.spr.set({ dir: 1, phase: 0, amp: 0, glow: 0, dim: 0, ...o.pose }));
    // track, panel, column heads, medals
    track.setAttribute("opacity", String(1 - L)); panel.setAttribute("opacity", String(0.55 * L));
    heads.forEach((t, gi) => { const cc = cell(gi, 0); t.setAttribute("x", cc.x.toFixed(1)); t.setAttribute("y", (lerp(SMALL.y(0), LARGE.y(0), L) - lerp(26, 52, L)).toFixed(1)); const heat = letterOn ? ORDER[gi] : gi; t.textContent = letterOn ? `${LETTERS[gi]}` : `${c.t("course", "race")} ${heat + 1}`; t.setAttribute("opacity", String(step === 0 && p < 0.02 ? 0.9 : 1)); });
    const podium = step === 4 && top3 ? easeInOut(seg(p, 0.84, 1)) : step === 2 && top3 ? easeInOut(seg(p, 0.5, 0.8)) : 0;
    medals.forEach((m, i) => {
      const [lg, rr] = [[0, 0], [0, 1], [1, 0]][i], hh = hs.find((o) => ORDER.indexOf(o.h) === lg && o.r === rr);
      m.setAttribute("opacity", String(i === 0 ? (step >= 2 && top3 ? Math.max(podium, step > 2 ? 1 : 0) : 0) : (step === 4 ? podium : 0)));
      m.setAttribute("transform", `translate(${hh.pose.x.toFixed(1)} ${(hh.pose.y - 70 * (hh.pose.scale ?? 1) - 4).toFixed(1)})`);
    });
    let text = "";
    if (step === 0) text = `${c.t("Course", "Race")} ${Math.min(5, Math.floor(p * 5) + 1)} / 5`;
    else if (step === 1) text = p < 0.66 ? `${c.t("Course", "Race")} 6 : ${c.t("les 5 vainqueurs", "the 5 winners")}` : c.t("on renomme les groupes", "rename the groups");
    else if (step === 2) text = top3 ? c.t("A1 est premier de tous", "A1 is first of all") : `${c.t("24 perdants", "24 losers")} ÷ 4 = 6 ${c.t("courses", "races")}`;
    else if (step === 3) text = c.t("5 candidats pour la 2e et la 3e place", "5 candidates for 2nd and 3rd place");
    else text = p < 0.8 ? `${c.t("Course", "Race")} 7` : c.t("A2 est 2e, B1 est 3e : 7 courses", "A2 is 2nd, B1 is 3rd: 7 races");
    label.textContent = text;
  },
};

export const diagram = {
  size: [520, 300],
  steps: (q) => Number(q.top) === 3 ? [
    P("25 chevaux, courses de 5 au plus. Courses 1 à 5 : on les fait courir par groupes de 5. Chaque colonne est classée, le plus rapide du groupe en haut.", "25 horses, races of at most 5. Races 1 to 5: they race in groups of 5. Each column is ranked, the fastest of the group on top."),
    P("Course 6 : les 5 vainqueurs. On renomme les groupes A, B, C, D, E dans l’ordre d’arrivée de leurs vainqueurs : A1 est plus rapide que B1, qui l’est plus que C1…", "Race 6: the 5 winners. Rename the groups A, B, C, D, E in the order their winners finish: A1 is faster than B1, which is faster than C1…"),
    P("A1 bat son groupe et les 4 autres vainqueurs, donc tous les chevaux : A1 est le premier du classement général.", "A1 beats its own group and the 4 other winners, hence every horse: A1 is first overall."),
    P("Qui peut être 2e ou 3e ? Un cheval qui a déjà 3 chevaux devant lui est éliminé (en gris). Il reste 5 candidats : A2, A3, B1, B2, C1.", "Who can be 2nd or 3rd? A horse with 3 horses already ahead of it is out (greyed). Five candidates remain: A2, A3, B1, B2, C1."),
    P("Course 7 : ces 5 candidats. Les deux premiers sont les 2e et 3e de l’ensemble. En tout 7 courses.", "Race 7: these 5 candidates. The first two are 2nd and 3rd overall. In all, 7 races."),
  ] : [
    P("25 chevaux, courses de 5 au plus. Courses 1 à 5 : cinq groupes de 5, chacun classé.", "25 horses, races of at most 5. Races 1 to 5: five groups of 5, each ranked."),
    P("Course 6 : les 5 vainqueurs. Le vainqueur de cette course bat son groupe et les 4 autres vainqueurs, donc tous les chevaux : c’est le plus rapide.", "Race 6: the 5 winners. The winner of that race beats its own group and the 4 other winners, hence every horse: it is the fastest."),
    P("On ne peut pas faire moins : 24 chevaux doivent perdre au moins une fois, une course de 5 chevaux fait au plus 4 perdants, et 5 courses font au plus 20 perdants. Il faut donc 6 courses.", "One cannot do fewer: 24 horses must lose at least once, a race of 5 horses makes at most 4 losers, and 5 races make at most 20 losers. So 6 races are needed."),
  ],
  draw(c, s, p, q) {
    const top3 = Number(q.top) === 3, CW = 58, X0 = 60, Y0 = 56, RH = 34, order = [2, 0, 4, 1, 3];   // heat shown in column i before the renaming: heat order[i]
    const moved = s === 1 ? ez(seg(p, 0.1, 0.9)) : s >= 2 ? 1 : 0;
    const colX = (heat) => { const before = order.indexOf(heat); return lerp(X0 + before * CW, X0 + heat * CW, moved); };
    const letter = (heat) => LETTERS[heat];
    const grey = (g, r) => top3 && s >= 3 && !((g === 0 && (r === 1 || r === 2)) || (g === 1 && (r === 0 || r === 1)) || (g === 2 && r === 0) || (g === 0 && r === 0));
    for (let g = 0; g < 5; g++) {
      const x = colX(g), shownLetters = s >= 1 && moved > 0.5;
      c.text(x + CW / 2 - 4, 40, shownLetters ? letter(g) : `${c.t("groupe", "group")} ${order[g] + 1}`, { ...ink, class: shownLetters ? "sol-label" : "sol-small" });
      for (let r = 0; r < 5; r++) {
        const win = r === 0 && s >= 1 && s <= 1, isA1 = g === 0 && r === 0 && s >= 2, cand = top3 && s >= 3 && !grey(g, r) && !(g === 0 && r === 0), gr = grey(g, r);
        c.rect(x, Y0 + r * RH, CW - 8, RH - 6, { rx: 7, fill: isA1 ? colour(6) : cand ? colour(2) : `color-mix(in srgb, ${colour(g)} ${gr ? 14 : 55}%, var(--surface))`, stroke: win ? "var(--ink)" : "var(--line-strong)", "stroke-width": win ? 3 : 1, opacity: gr ? 0.55 : 1 });
        c.text(x + (CW - 8) / 2, Y0 + r * RH + 20, s >= 2 || (s === 1 && moved > 0.5) ? `${letter(g)}${r + 1}` : `${r + 1}`, { ...ink, class: "sol-small", style: `font-weight:700;fill:${isA1 || cand ? "#fff" : "var(--ink)"}` });
      }
    }
    if (s === 0 || (s === 1 && p < 0.1)) c.text(60 + 2.5 * CW - 6, 262, c.t("5 courses : une par groupe", "5 races: one per group"), { ...ink, class: "sol-sub" });
    if (s === 1) { c.rect(X0 - 4, Y0 - 3, 5 * CW - 2, RH, { rx: 9, fill: "none", stroke: colour(1), "stroke-width": 3 }); c.text(60 + 2.5 * CW - 6, 262, c.t("Course 6 : les cinq vainqueurs", "Race 6: the five winners"), { ...ink, class: "sol-sub" }); }
    if (s === 2) c.text(60 + 2.5 * CW - 6, 262, c.t("A1 est premier de tous", "A1 is first of all"), { ...ink, class: "sol-hot" });
    if (top3 && s === 4) { c.text(60 + 2.5 * CW - 6, 262, c.t("Course 7 : A2, A3, B1, B2, C1", "Race 7: A2, A3, B1, B2, C1"), { ...ink, class: "sol-sub" }); c.text(440, 120, "7", { ...ink, class: "sol-big" }); c.text(440, 146, c.t("courses", "races"), { ...ink, class: "sol-sub" }); }
    if (top3 && s === 3) c.text(60 + 2.5 * CW - 6, 262, c.t("En gris : au moins 3 chevaux devant", "Grey: at least 3 horses ahead"), { ...ink, class: "sol-sub" });
    if (!top3 && s >= 1) { c.text(440, 120, String(horseRaces(1)), { ...ink, class: "sol-big" }); c.text(440, 146, c.t("courses", "races"), { ...ink, class: "sol-sub" }); }
    if (!top3 && s === 2) c.text(60 + 2.5 * CW - 6, 262, c.t("24 perdants ÷ 4 par course = 6 courses", "24 losers ÷ 4 per race = 6 races"), { ...ink, class: "sol-sub" });
  },
};
