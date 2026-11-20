// Animated solution of the braess challenge, in the town of the activity: the cars settle half by C and half by D,
// the mayor opens the new road, one driver tries it and gains, everyone follows, and the streets fill until every
// trip is slower. Each car is a group of N/20 drivers and moves in its own time window, so a frame is a pure function
// of (step, p); the times written on the streets come from the cars' routes at that frame.
import { P } from "../common/helpers.js";
import { svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { routeTimes, groupSize, along, equilibrium, before, after, PLACES } from "./maths.js";
import { drawTown, poseRoad, makeCar, poseCar, makeWatch, poseWatch } from "./art.js";

const CARS = 20, LANE = { top: -4, short: 0, bottom: 4 };
const fmt = (v, fr) => v.toLocaleString(fr ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 });

// Where every car is at the start and at the end of each step (route names, one per car).
function plan(N) {
  const g = groupSize(N), e = equilibrium(N, true).flows, nSide = Math.round(e.top / g);
  const balance = Array.from({ length: CARS }, (_, i) => (i < CARS / 2 ? "top" : "bottom"));
  const tilt = balance.map((r, i) => (i === 10 || i === 11 ? "top" : r));   // two groups of D try C
  const one = balance.map((r, i) => (i === 0 ? "short" : r));
  // at the end: nShort cars on the shortcut, nSide by C and nSide by D (taken from each side in turn)
  const end = balance.map((r, i) => { const k = i < CARS / 2 ? i : i - CARS / 2; return k < (CARS / 2 - nSide) ? "short" : r; });
  return { g, balance, tilt, one, end };
}

export const diagram = {
  size: [520, 320],
  dur: (step) => [4200, 6200, 3600, 4400, 6500, 4200][step],
  steps: (q) => {
    const N = q.n, b = before(N), a = after(N), helps = a <= b, h = N / 200, full = N <= 4500;
    return [
      P(`Chaque matin, ${fmt(N, 1)} conducteurs partent de A vers le stade B, par C ou par D.`, `Every morning, ${fmt(N, 0)} drivers leave A for the stadium B, through C or through D.`),
      P(`Si quelques-uns passent tous par C, la rue A→C ralentit et ils reviennent. Ça se stabilise à moitié-moitié : ${h} + 45 = ${b} minutes.`, `If a few more go through C, the street A→C slows down and they come back. It settles half and half: ${h} + 45 = ${b} minutes.`),
      P(`La ville ouvre la route C→D : 0 minute pour aller de C à D.`, `The town opens the road C→D: 0 minutes from C to D.`),
      P(`Un conducteur essaie A→C→D→B : deux rues, aucune voie rapide. Environ ${h} + 0 + ${h} = ${2 * h} minutes au lieu de ${b} : il gagne.`, `One driver tries A→C→D→B: two streets, no expressway. About ${h} + 0 + ${h} = ${2 * h} minutes instead of ${b}: he gains.`),
      full ? P(`Tout le monde l’imite… mais les deux rues se remplissent : ${fmt(N, 1)} voitures chacune, ${N / 100} + ${N / 100} = ${a} minutes.`, `Everyone copies him… but both streets fill up: ${fmt(N, 0)} cars each, ${N / 100} + ${N / 100} = ${a} minutes.`)
        : P(`Beaucoup l’imitent… les deux rues se remplissent jusqu’à 45 minutes chacune : 45 + 45 = ${a} minutes, sur tous les trajets.`, `Many copy him… both streets fill up until each takes 45 minutes: 45 + 45 = ${a} minutes, on every route.`),
      helps ? P(`Personne ne gagne à changer de trajet. Ici, avec peu de voitures, la nouvelle route fait gagner du temps : ${a} minutes au lieu de ${b}.`, `Nobody gains by changing route. Here, with few cars, the new road saves time: ${a} minutes instead of ${b}.`)
        : P(`Revenir ne sert à rien : ${full ? `45 + ${N / 100} = ${45 + N / 100}` : `45 + 45 = 90`}, pas mieux que ${a}. Chacun a choisi le plus rapide pour lui, et tous mettent ${a} minutes au lieu de ${b}.`, `Going back does not help: ${full ? `45 + ${N / 100} = ${45 + N / 100}` : `45 + 45 = 90`}, no better than ${a}. Everyone chose the fastest route for themselves, and everyone takes ${a} minutes instead of ${b}.`),
    ];
  },
};

export const scene = {
  mount(c, q) {
    const fr = c.t("fr", "en") === "fr", T = drawTown(c.svg, c.t);
    const cars = Array.from({ length: CARS }, (_, i) => makeCar(T.cars, i));
    const mayor = makePerson(T.people, { fill: "color-mix(in srgb, var(--c3) 70%, var(--surface))", look: 2, size: 0.55 });
    const fan = makePerson(T.people, { fill: "color-mix(in srgb, var(--c5) 70%, var(--surface))", look: 4, size: 0.55 });
    const watch = makeWatch(c.svg, 300, 292), say = makeBubble(T.over);
    // minutes written beside each piece of road
    const tag = (x, y) => { const g = svgEl("g", {}, c.svg); svgEl("rect", { x: x - 20, y: y - 10, width: 40, height: 18, rx: 4, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.2 }, g); const tx = svgEl("text", { x, y: y + 3.5, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "var(--ink)" }, g); return { g, tx }; };
    const tags = { ac: tag(100, 98), cb: tag(268, 98), ad: tag(100, 222), db: tag(268, 222), cd: tag(160, 160) };
    const panel = svgEl("g", {}, c.svg);
    svgEl("rect", { x: 382, y: 96, width: 128, height: 120, rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.4 }, panel);
    const lines = [c.text(446, 128, "", { "text-anchor": "middle", class: "sol-line" }), c.text(446, 162, "", { "text-anchor": "middle", class: "sol-line" }), c.text(446, 198, "", { "text-anchor": "middle", class: "sol-hot" })];
    return { fr, T, cars, mayor, fan, watch, say, tags, lines, plan: plan(q.n), N: q.n };
  },
  update(S, s, p) {
    const { fr, T, cars, mayor, fan, watch, say, tags, lines, plan: L, N } = S, g = L.g, b = before(N), a = after(N);
    // routes at the start and end of this step, and each car's time window
    const [from, to] = [[L.balance.map(() => "A"), L.balance], [L.balance, L.balance], [L.balance, L.balance], [L.balance, L.one], [L.one, L.end], [L.end, L.end]][s];
    const win = (i) => (s === 0 ? [i / CARS * 0.7, i / CARS * 0.7 + 0.3] : s === 3 ? [0.1, 0.6] : [0.05 + (i / CARS) * 0.75, 0.25 + (i / CARS) * 0.75]);
    let route = cars.map((_, i) => { const k = seg(p, ...win(i)); return k > 0 ? to[i] : from[i]; });
    if (s === 1) route = p >= 0.08 && p < 0.55 ? L.tilt : L.balance;   // two groups of D try C, then come back
    const flows = { top: 0, bottom: 0, short: 0 };
    route.forEach((r) => { if (r !== "A") flows[r] += g; });
    // slots: cars on one route spread evenly; a car that just changed drives in from A
    const slots = { top: [], bottom: [], short: [] };
    route.forEach((r, i) => { if (r !== "A") slots[r].push(i); });
    for (const r of ["top", "bottom", "short"]) slots[r].forEach((i, k) => {
      let u = (k + 1) / (slots[r].length + 1);
      const changed = s === 1 ? (i === 10 || i === 11) : from[i] !== to[i];
      if (changed) { const w = s === 1 ? (p < 0.55 ? seg(p, 0.08, 0.3) : seg(p, 0.55, 0.75)) : seg(p, ...win(i)); u *= Math.max(0.02, w); }
      const pt = along(r, u), n = [-Math.sin(pt.heading), Math.cos(pt.heading)];
      poseCar(cars[i], { x: pt.x + n[0] * LANE[r], y: pt.y + n[1] * LANE[r], heading: pt.heading, scale: 0.9 });
    });
    route.forEach((r, i) => { if (r === "A") poseCar(cars[i], { x: PLACES.A[0] + 6, y: PLACES.A[1], heading: 0, scale: 0.9, opacity: 0 }); });
    // the new road
    const roadK = s < 2 ? 0 : s === 2 ? seg(p, 0.2, 0.7) : 1;
    poseRoad(T, roadK);
    // minutes on each piece of road, from the cars' routes
    const ac = (flows.top + flows.short) / 100, db = (flows.bottom + flows.short) / 100;
    const show = (tg, txt, on) => { tg.tx.textContent = txt; tg.g.setAttribute("opacity", on ? 1 : 0); };
    show(tags.ac, `${fmt(ac, fr)} min`, s >= 1); show(tags.db, `${fmt(db, fr)} min`, s >= 1); show(tags.cb, "45 min", s >= 1); show(tags.ad, "45 min", s >= 1); show(tags.cd, "0 min", s >= 2 && roadK > 0.5);
    // people
    const mid = T.mid;
    posePerson(mayor, { x: mid[0] + 30, y: mid[1] + 22, facing: -1, gaze: [-1, -0.2], breathe: 5 * p, blink: Math.abs(Math.sin(7 * p)) > 0.997 ? 1 : 0, mood: s === 2 ? "grin" : "smile", wave: s === 2 ? seg(p, 0.6, 1) : 0, hop: s === 2 ? Math.sin(Math.PI * seg(p, 0.55, 0.9)) : 0 });
    const avg = (["top", "bottom", "short"].reduce((m, r) => m + flows[r] * routeTimes(flows)[r], 0)) / Math.max(1, flows.top + flows.bottom + flows.short);
    const sad = s >= 4 && a > b ? (s === 5 ? "flat" : seg(p, 0.5, 1) > 0 ? "o" : "smile") : s >= 4 ? "grin" : "smile";
    posePerson(fan, { x: 342, y: 304, facing: -1, gaze: [-1, -0.4], breathe: 5 * p + 1, blink: Math.abs(Math.sin(5 * p + 1)) > 0.997 ? 1 : 0, mood: sad, hop: s === 3 ? Math.sin(Math.PI * seg(p, 0.6, 0.9)) * 0.6 : 0 });
    poseWatch(watch, s === 0 ? 0 : avg, s === 0 ? "?" : fmt(avg, fr));
    // the first driver of the shortcut says how long his trip takes
    const c0 = along("short", 0.55);
    const mine = routeTimes(flows).short;
    poseBubble(say, s === 3 ? { x: c0.x, y: c0.y - 12, text: `${fmt(mine, fr)} min !`, appear: seg(p, 0.55, 0.7) } : s === 2 ? { x: mid[0] + 26, y: mid[1] - 14, text: fr ? "C’est ouvert !" : "It’s open!", appear: seg(p, 0.5, 0.65) * (1 - seg(p, 0.9, 1)) } : { x: 0, y: 0, text: "", appear: 0 });
    // the panel: before, after
    lines[0].textContent = s >= 1 ? (fr ? `Avant : ${b} min` : `Before: ${b} min`) : "";
    lines[1].textContent = s >= 4 ? (fr ? "Après :" : "After:") : "";
    lines[2].textContent = s >= 4 ? `${a} min` : "";
    lines[1].setAttribute("opacity", s === 4 ? seg(p, 0.7, 0.85) : 1); lines[2].setAttribute("opacity", s === 4 ? seg(p, 0.75, 0.95) : 1);
  },
};
