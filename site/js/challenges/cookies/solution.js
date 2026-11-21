// Animated solution of the cookies challenge. `diagram` holds the captions; `scene` builds the picnic once (mount) and
// poses it as a pure function of (step, p) (update): the children with their plates, the cookies rolling into one row
// with chocolate sticks between the children's shares, the row read back (and the sticks hopping to other places give
// another sharing), then the places counted. See common/player.js.
import { P, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg, easeInOut, easeOutBack } from "../common/scene-kit.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { sharings, binom, NAMES } from "./maths.js";

// A sharing used as the example: as even as possible, with one person left out when the rule allows it.
function example(q) {
  const parts = Array(q.k).fill(0), skip = q.rule !== "one" && q.k >= 3 ? 1 : -1, who = parts.map((_, i) => i).filter((i) => i !== skip);
  for (let i = 0; i < q.n; i++) parts[who[i % who.length]]++;
  return parts;
}

export const diagram = {
  size: [520, 300],
  dur: (step) => [3600, 5200, 7000, 5600, 4800][step],
  steps: (q) => {
    const m = q.n + q.k - 1, e = example(q);
    return [
      P(`${q.n} biscuits identiques pour ${q.k} personnes. Un partage dit seulement combien chacun reçoit, par exemple (${e.join(" ; ")}).`, `${q.n} identical cookies for ${q.k} people. A sharing only says how many each person gets, for example (${e.join(", ")}).`),
      P(`Alignons les biscuits dans l’ordre A, B, C… et mettons un séparateur entre deux personnes : ${q.k - 1} séparateur${q.k > 2 ? "s" : ""}.`, `Line up the cookies in the order A, B, C… and put a separator between two people: ${q.k - 1} separator${q.k > 2 ? "s" : ""}.`),
      P(`Réciproquement, toute rangée de ${q.n} ● et ${q.k - 1} | se lit comme un partage : on compte les ● entre les |. Deux partages différents donnent deux rangées différentes.`, `Conversely, every row of ${q.n} ● and ${q.k - 1} | reads as a sharing: count the ● between the |. Two different sharings give two different rows.`),
      P(`Une rangée a ${m} places ; elle est fixée dès qu’on choisit les ${q.k - 1} places des séparateurs : C(${m}, ${q.k - 1}) = ${binom(m, q.k - 1)}.`, `A row has ${m} places; it is fixed once the ${q.k - 1} places of the separators are chosen: C(${m}, ${q.k - 1}) = ${binom(m, q.k - 1)}.`),
      q.rule === "one"
        ? P(`Avec « au moins un chacun », on donne d’abord un biscuit à chacun, puis on partage librement les ${Math.max(0, q.n - q.k)} restants : C(${q.n - 1}, ${q.k - 1}) = ${sharings(q.n, q.k, true)}.`, `With “at least one each”, first give everyone one cookie, then share the ${Math.max(0, q.n - q.k)} left freely: C(${q.n - 1}, ${q.k - 1}) = ${sharings(q.n, q.k, true)}.`)
        : P(`Réponse : ${sharings(q.n, q.k)} partages. La méthode vaut pour n biscuits et k personnes : C(n + k − 1, k − 1).`, `Answer: ${sharings(q.n, q.k)} sharings. The method works for n cookies and k people: C(n + k − 1, k − 1).`),
    ];
  },
};

const FEET = 150, TABLE = 132, ROW = 214, HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round";
const blinkAt = (p, k) => (Math.abs(Math.sin(9 * p + k * 1.9)) > 0.997 ? 1 : 0);

// Another sharing, to show that the sticks can stand anywhere: the shares turned by one child (or one cookie moved).
function other(e, q) {
  const alt = [...e.slice(1), e[0]];
  if (alt.join() !== e.join()) return alt;
  const b = [...e], min = q.rule === "one" ? 1 : 0;
  if (b[0] > min) { b[0]--; b[b.length - 1]++; }
  return b;
}
// slot of cookie j and of stick s in the row that codes `parts`
const owner = (parts, j) => { let c = 0; for (let i = 0; i < parts.length; i++) { c += parts[i]; if (j < c) return i; } return parts.length - 1; };
const cookieSlot = (parts, j) => j + owner(parts, j);
const stickSlot = (parts, s) => parts.slice(0, s + 1).reduce((a, v) => a + v, 0) + s;

function makeCookie(parent) {
  const root = svgEl("g", {}, parent), spin = svgEl("g", {}, root);
  svgEl("circle", { r: 9.5, fill: "#d99a51", stroke: "#714018", "stroke-width": 1.4 }, spin);
  svgEl("circle", { cx: -2.5, cy: -3, r: 4, fill: "#fff", opacity: 0.18 }, spin);
  for (const [x, y, r] of [[-4, -3, 1.7], [3, -4, 1.6], [1, 3, 1.8], [-4, 4, 1.3], [5, 2, 1.2]]) svgEl("circle", { cx: x, cy: y, r, fill: "#694025" }, spin);
  return { root, spin };
}
function makeStick(parent) {
  const root = svgEl("g", {}, parent);
  svgEl("rect", { x: -3.2, y: -22, width: 6.4, height: 44, rx: 3.2, fill: "#6b3b1c", stroke: "var(--ink)", "stroke-width": 1.2 }, root);
  svgEl("rect", { x: -1.6, y: -19, width: 1.6, height: 36, rx: 0.8, fill: "#fff", opacity: 0.3 }, root);
  return root;
}

export const scene = {
  mount(c, q) {
    const { n, k } = q, e = example(q), alt = other(e, q), m = n + k - 1, cell = Math.min(30, 470 / m), x0 = 260 - (m * cell) / 2;
    const seatW = 480 / k, seat = (i) => 20 + seatW * (i + 0.5);
    svgEl("rect", { x: 0, y: 0, width: 520, height: TABLE + 6, fill: "color-mix(in srgb, #bfe3ff 45%, var(--surface))" }, c.svg);
    svgEl("path", { d: "M0 92 q90 -40 180 -8 q90 -36 190 -2 q80 -30 150 6 V140 H0 Z", fill: "color-mix(in srgb, #8fcf7a 60%, var(--surface))" }, c.svg);
    const people = Array.from({ length: k }, (_, i) => makePerson(c.svg, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, look: i, size: Math.min(1.1, seatW / 60) }));
    // the picnic table with a checked cloth, one plate per child
    svgEl("rect", { x: 0, y: TABLE, width: 520, height: 36, fill: "#fbeaea", stroke: "var(--ink)", "stroke-width": 1.4 }, c.svg);
    for (let x = 0; x < 520; x += 18) svgEl("rect", { x, y: TABLE, width: 9, height: 36, fill: "#e57373", opacity: 0.45 }, c.svg);
    svgEl("rect", { x: 0, y: TABLE + 36, width: 520, height: 300 - TABLE - 36, fill: "#c58b52" }, c.svg);
    svgEl("rect", { x: 0, y: TABLE + 36, width: 520, height: 6, fill: "#a8743a", stroke: "var(--ink)", "stroke-width": 1.2 }, c.svg);
    for (let i = 0; i < k; i++) {
      svgEl("ellipse", { cx: seat(i), cy: TABLE + 18, rx: Math.min(30, seatW * 0.4), ry: 8, fill: "#fff", stroke: "var(--ink)", "stroke-width": 1.2 }, c.svg);
      svgEl("ellipse", { cx: seat(i), cy: TABLE + 18, rx: Math.min(20, seatW * 0.27), ry: 5, fill: "none", stroke: "#cfd8dc", "stroke-width": 1 }, c.svg);
    }
    // the wooden board where the row is laid
    svgEl("rect", { x: x0 - 14, y: ROW - 24, width: m * cell + 28, height: 48, rx: 10, fill: "#e8c48e", stroke: "var(--ink)", "stroke-width": 1.4 }, c.svg);
    svgEl("path", { d: `M${x0 - 4} ${ROW + 16} H${x0 + m * cell + 4}`, stroke: "#c99a5c", "stroke-width": 2 }, c.svg);
    const marks = svgEl("g", {}, c.svg);
    const places = Array.from({ length: m }, (_, i) => c.text(x0 + i * cell + cell / 2, ROW - 30, String(i + 1), { ...mid, class: "sol-small", style: HALO }));
    const sticks = Array.from({ length: k - 1 }, () => makeStick(c.svg));
    const cookies = Array.from({ length: n }, () => makeCookie(c.svg));
    const names = Array.from({ length: k }, (_, i) => c.text(seat(i), TABLE + 33, NAMES[i], { ...mid, class: "sol-small", "font-weight": 700, style: HALO }));
    const groups = Array.from({ length: k }, () => c.text(0, ROW + 44, "", { ...mid, class: "sol-small", "font-weight": 700, style: HALO }));
    const bubble = makeBubble(c.svg);
    const line = c.text(200, 26, "", { ...mid, class: "sol-line", style: HALO }), hot = c.text(450, 36, "", { ...mid, class: "sol-hot", style: HALO });
    return { q, e, alt, m, cell, x0, seat, seatW, people, marks, places, sticks, cookies, names, groups, bubble, line, hot, lang: c.t("fr", "en") };
  },
  update(S, s, p) {
    const { q, e, alt, m, cell, x0, seat, seatW, people, marks, places, sticks, cookies, groups, bubble, line, hot, lang } = S, { n, k } = q;
    const slotX = (i) => x0 + i * cell + cell / 2, one = q.rule === "one";
    // with "at least one each", the row left once everyone has had a cookie, centred on the board
    const rest = e.map((v) => Math.max(0, v - 1)), m2 = rest.reduce((a, v) => a + v, 0) + k - 1, slotX2 = (i) => 260 - (m2 * cell) / 2 + i * cell + cell / 2;
    const slide = s === 4 && one ? easeInOut(seg(p, 0.5, 0.75)) : 0;
    const plateAt = (i, r) => [seat(i) + ((r % 3) - 1) * Math.min(12, seatW * 0.16), TABLE + 14 - Math.floor(r / 3) * 7];
    // where each cookie and stick is, as a pure function of (s, p)
    const swap = s === 2 ? easeInOut(seg(p, 0.55, 0.85)) : 0;
    const rank = Array(k).fill(0);
    const pose = people.map((_, i) => ({ x: seat(i), y: FEET, facing: i < k / 2 ? 1 : -1, gaze: [0, 1], breathe: 6 * p + i, blink: blinkAt(p, i), mood: "smile" }));
    let say = null;
    cookies.forEach((C, j) => {
      const i = owner(e, j), r = rank[i]++, [px, py] = plateAt(i, r);
      let x = px, y = py, spin = 0;
      if (s >= 1) {
        const a = slotX(cookieSlot(e, j)), b = slotX(cookieSlot(alt, j)), rx = a + (b - a) * swap;
        const go = s === 1 ? easeInOut(seg(p, 0.04 * j, 0.04 * j + 0.45)) : 1;
        x = px + (rx - px) * go; y = py + (ROW - py) * go - 40 * Math.sin(Math.PI * go); spin = 360 * go + (rx - a) * 6;
      }
      // "at least one each": the first cookie of every share goes back to its child, the row closes up
      if (s === 4 && one) {
        const own = owner(e, j), first = j === e.slice(0, own).reduce((u, v) => u + v, 0) && e[own] > 0;
        const back = easeInOut(seg(p, 0.05 + 0.08 * own, 0.35 + 0.08 * own));
        if (first) { const [hx, hy] = plateAt(own, 0); x = slotX(cookieSlot(e, j)) + (hx - slotX(cookieSlot(e, j))) * back; y = ROW + (hy - ROW) * back - 46 * Math.sin(Math.PI * back); }
        else { const jj = j - e.slice(0, own + 1).filter((v) => v > 0).length, a = slotX(cookieSlot(e, j)); x = a + (slotX2(cookieSlot(rest, jj)) - a) * slide; }
      }
      C.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${Math.min(1, cell / 22).toFixed(2)})`);
      C.spin.setAttribute("transform", `rotate(${spin.toFixed(0)})`);
    });
    sticks.forEach((st, i) => {
      const a = slotX(stickSlot(e, i)), b = slotX(stickSlot(alt, i)), hop = Math.sin(Math.PI * swap);
      const drop = s === 0 ? 0 : s === 1 ? easeOutBack(seg(p, 0.55 + 0.06 * i, 0.8 + 0.06 * i)) : 1;
      const x = a + (b - a) * swap + (slotX2(stickSlot(rest, i)) - a) * slide, y = ROW - 160 * (1 - drop) - 34 * hop;
      st.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      st.setAttribute("opacity", s === 0 || (s === 1 && drop <= 0) ? 0 : 1);
    });
    // the shares written under the row; each child waves when its share is read (step 2), or reacts to its plate (step 0)
    const shown = s === 2 && swap > 0.5 ? alt : e, reading = s === 2 ? Math.floor(seg(p, 0, 0.5) * k * 0.999) : -1;
    let at = 0;
    groups.forEach((G, i) => {
      const v = shown[i], from = slotX(at) - cell / 2, w = v * cell;
      G.setAttribute("x", (from + Math.max(w, cell) / 2).toFixed(1)); G.textContent = `${NAMES[i]}${lang === "fr" ? " : " : ": "}${v}`;
      G.setAttribute("opacity", s >= 2 && s <= 3 && (s > 2 || swap > 0.9 || swap === 0 && p < 0.55) ? (s === 2 && p < 0.5 && i > reading ? 0.15 : 1) : 0);
      at += v + 1;
    });
    if (s === 0) e.forEach((v, i) => { const k0 = seg(p, 0.1 + 0.6 * i / k, 0.3 + 0.6 * i / k); if (k0 > 0 && k0 < 1) { pose[i].hop = v ? k0 : 0; pose[i].mood = v ? "grin" : "o"; if (!v) say = { i, text: lang === "fr" ? "Et moi ?" : "What about me?", appear: k0 }; } });
    if (s >= 1) pose.forEach((P0) => { P0.gaze = [0, 1]; });
    if (s === 1) pose.forEach((P0, i) => { P0.mood = "o"; P0.gaze = [Math.sign(260 - seat(i)) * 0.6, 1]; });
    if (s === 2 && p < 0.5 && reading >= 0) { pose[reading].wave = seg(p * 2 * k - reading, 0, 1); pose[reading].mood = "grin"; say = { i: reading, text: `${e[reading]} !`, appear: 1 }; }
    if (s === 2 && swap > 0 && swap < 1) pose.forEach((P0) => { P0.mood = "o"; });
    if (s === 4) pose.forEach((P0, i) => { P0.hop = seg(p, 0.75 + 0.03 * i, 0.9 + 0.03 * i); P0.mood = "grin"; P0.reach = one ? seg(p, 0.1, 0.3) * (1 - seg(p, 0.7, 0.8)) : 0; P0.reachAngle = 70; });
    people.forEach((P0, i) => posePerson(P0, pose[i]));
    
    poseBubble(bubble, say ? { x: seat(say.i) + 6, y: FEET - 76, text: say.text, appear: say.appear } : { x: 0, y: 0, text: "", appear: 0 });
    // the places of the row, numbered one after the other, and the chosen places of the sticks ringed
    marks.replaceChildren();
    const count = s === 3 ? Math.ceil(seg(p, 0, 0.6) * m) : 0;
    places.forEach((T, i) => T.setAttribute("opacity", s === 3 && i < count ? 1 : 0));
    if (s === 3 && p > 0.6) for (let i = 0; i < k - 1; i++) svgEl("circle", { cx: slotX(stickSlot(e, i)), cy: ROW, r: cell * 0.5, fill: "none", stroke: "var(--object-ink)", "stroke-width": 2.4, opacity: seg(p, 0.6 + 0.05 * i, 0.7 + 0.05 * i) }, marks);
    const total = sharings(n, k, one);
    line.textContent = s === 3 ? `C(${m}, ${k - 1}) = ${binom(m, k - 1)}` : s === 4 && one ? `C(${n - 1}, ${k - 1}) = ${total}` : s === 4 ? `C(${m}, ${k - 1})` : "";
    line.setAttribute("opacity", s === 3 ? seg(p, 0.7, 0.85) : s === 4 ? seg(p, one ? 0.6 : 0, one ? 0.75 : 0.2) : 0);
    hot.textContent = String(total); hot.setAttribute("opacity", s === 4 ? seg(p, 0.8, 1) : 0);
  },
};
