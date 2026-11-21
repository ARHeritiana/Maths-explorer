// Animated solution of the jugs challenge. `diagram` holds the captions; `scene` builds the kitchen once (mount) and poses
// it as a pure function of (step, p) (update): the two jugs with faces, the chalkboard where the states (x, y) become
// points of a table, then the amounts that can be reached, then the shortest sequence played by the jugs themselves
// (hop to the tap, to the sink, or onto the other jug and pour) while the chalk traces the path. See common/player.js.
import { P, mid } from "../common/helpers.js";
import { svgEl } from "../common/kit.js";
import { seg, easeInOut } from "../common/scene-kit.js";
import { COUNTER, TAP_X, SINK_X, WATER, drawKitchen, makeBoard, makeJug, poseJug, spoutAt } from "./art.js";
import { parseJugs, jugsSolve, gcd, moveText } from "./maths.js";

export const diagram = {
  size: [520, 300],
  dur: (step, q) => step < 3 ? [3200, 5200, 5600][step] : Math.max(4500, 1500 * Math.max(1, (jugsSolve(...parseJugs(q.jugs)) || []).length)),
  steps: (q) => {
    const [a, b, t] = parseJugs(q.jugs), path = jugsSolve(a, b, t), g = gcd(a, b);
    return [
      P(`Deux bidons de ${a} L et ${b} L. On note (x ; y) les litres contenus : on part de (0 ; 0) et on veut ${t} L dans un bidon.`, `Two jugs of ${a} L and ${b} L. Write (x, y) for the litres they hold: we start at (0, 0) and want ${t} L in a jug.`),
      P(`Chaque état est un point de la table, x de 0 à ${a}, y de 0 à ${b}. Après chaque opération, un bidon est vide ou plein : on est toujours sur le bord de la table.`, `Each state is a point of the table, x from 0 to ${a}, y from 0 to ${b}. After each operation a jug is empty or full: we are always on the edge of the table.`),
      g > 1 ? P(`Remplir, vider ou transvaser ne fait qu’ajouter ou retirer ${a} ou ${b} litres au total : chaque quantité obtenue est un multiple de ${g}, le plus grand diviseur commun de ${a} et de ${b}.`, `Filling, emptying or pouring only adds or removes ${a} or ${b} litres in total: every amount obtained is a multiple of ${g}, the greatest common divisor of ${a} and ${b}.`) : P(`Remplir, vider ou transvaser ne fait qu’ajouter ou retirer ${a} ou ${b} litres au total : aucune quantité entière n’est exclue d’avance.`, `Filling, emptying or pouring only adds or removes ${a} or ${b} litres in total: no whole amount is ruled out in advance.`),
      path ? P(`${g > 1 ? `${t} est un multiple de ${g}` : `${t} tient dans un bidon`} : c’est possible, en ${path.length} opérations.`, `${g > 1 ? `${t} is a multiple of ${g}` : `${t} fits in a jug`}: it is possible, in ${path.length} operations.`) : P(`${t > Math.max(a, b) ? `${t} ne tient dans aucun bidon` : `${t} n’est pas un multiple de ${g}`} : c’est impossible.`, `${t > Math.max(a, b) ? `${t} fits in no jug` : `${t} is not a multiple of ${g}`}: it is impossible.`),
    ];
  },
};

const REST = [160, 252], BOARD = { x: 390, y: 20, w: 120, h: 112 };
const CHALK = "#f4f1e6", CHALK_HOT = "#ffd34d";
const blinkAt = (p, k) => (Math.abs(Math.sin(9 * p + k * 2.1)) > 0.997 ? 1 : 0);
const parse = (move) => move.startsWith("pour") ? { kind: "pour", j: move[4] === "A" ? 0 : 1, to: move[5] === "A" ? 0 : 1 } : { kind: move.startsWith("fill") ? "fill" : "empty", j: move.endsWith("A") ? 0 : 1 };

export const scene = {
  mount(c, q) {
    const [a, b, t] = parseJugs(q.jugs), path = jugsSolve(a, b, t) || [], g = gcd(a, b), cap = Math.max(a, b);
    drawKitchen(c.svg);
    const board = makeBoard(c.svg, BOARD);
    const fx = svgEl("g", {}, c.svg);
    const jugs = [a, b].map((size, i) => makeJug(c.svg, { size, height: 54 + 76 * (size / cap), i: i ? 2 : 0 }));
    const front = svgEl("g", {}, c.svg);
    const hot = c.text(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h + 44, "", { ...mid, class: "sol-hot" });
    return { a, b, t, g, path, states: [[0, 0], ...path.map((m) => m.state)], board, fx, jugs, front, hot, lang: c.t("fr", "en") };
  },
  update(S, s, p) {
    const { a, b, t, g, path, states, board, fx, jugs, hot, lang } = S, n = path.length, sizes = [a, b];
    fx.replaceChildren(); board.draw.replaceChildren();
    const chalk = (x, y, str, size = 12, fill = CHALK) => { const e = svgEl("text", { x, y, "text-anchor": "middle", "font-size": size, "font-weight": 700, fill, "font-family": "var(--hand, var(--body))" }, board.draw); e.textContent = str; return e; };
    // jug poses: at rest, idle, watching the board
    const pose = [0, 1].map((i) => ({ x: REST[i], litres: 0, tilt: 0, lift: 0, slosh: 1.2, wave: 14 * p + i * 2, gaze: 0.6, mood: "smile", blink: blinkAt(p, i), label: "" }));
    let state = [0, 0];
    // the table of states (x, y) on the chalkboard; returns the map from a state to board coordinates
    const G = { x0: board.x + 18, y0: board.y + board.h - 16, w: board.w - 30, h: board.h - 34 };
    const BX = (x) => G.x0 + (x / a) * G.w, BY = (y) => G.y0 - (y / b) * G.h;
    const grid = (reveal = 1) => {
      svgEl("rect", { x: BX(0), y: BY(b), width: G.w, height: G.h, fill: "none", stroke: CHALK, "stroke-width": 1, opacity: 0.6 }, board.draw);
      for (let x = 0; x <= a; x++) for (let y = 0; y <= b; y++) {
        const edge = x === 0 || y === 0 || x === a || y === b, k = (x + y) / (a + b);
        if (k > reveal + 1e-9) continue;
        svgEl("circle", { cx: BX(x), cy: BY(y), r: edge ? 1.9 : 1.2, fill: (x === t || y === t) && s >= 1 ? CHALK_HOT : CHALK, opacity: edge ? 0.95 : 0.35 }, board.draw);
      }
      chalk(BX(a / 2), board.y + board.h - 3, "x", 10);
      const ylab = chalk(BX(0) - 8, BY(b / 2), `y`, 10); ylab.setAttribute("text-anchor", "end");
    };
    if (s === 0) {
      chalk(board.x + board.w / 2, board.y + 40, lang === "fr" ? "Objectif" : "Goal", 13);
      chalk(board.x + board.w / 2, board.y + 78, `${t} L`, 30, CHALK_HOT);
      // each jug says hello in turn: a hop and a grin
      [0, 1].forEach((i) => { const k = seg(p, 0.15 + 0.35 * i, 0.45 + 0.35 * i); pose[i].lift = 10 * Math.sin(Math.PI * k); if (k > 0 && k < 1) pose[i].mood = "grin"; pose[i].gaze = 1 - 2 * i; });
    }
    if (s === 1) {
      grid(easeInOut(seg(p, 0, 0.7)));
      const blink = 0.5 + 0.5 * Math.sin(20 * p);
      svgEl("circle", { cx: BX(0), cy: BY(0), r: 4, fill: "none", stroke: CHALK_HOT, "stroke-width": 1.6, opacity: blink }, board.draw);
    }
    if (s === 2) {
      // the amounts 0..max(a, b) on a chalk line; the multiples of g are ringed one after another
      const top = Math.max(a, b, t), L0 = board.x + 10, LW = board.w - 20, Y0 = board.y + 64, LX = (v) => L0 + (v / top) * LW;
      svgEl("line", { x1: L0, y1: Y0, x2: L0 + LW, y2: Y0, stroke: CHALK, "stroke-width": 1.4 }, board.draw);
      for (let v = 0; v <= top; v++) svgEl("line", { x1: LX(v), y1: Y0 - 3, x2: LX(v), y2: Y0 + 3, stroke: CHALK, "stroke-width": 1 }, board.draw);
      const ringed = Math.floor(seg(p, 0.05, 0.75) * (Math.floor(top / g) + 1));
      for (let m = 0; m < ringed; m++) svgEl("circle", { cx: LX(m * g), cy: Y0, r: 4.2, fill: "none", stroke: CHALK_HOT, "stroke-width": 1.5 }, board.draw);
      chalk(board.x + board.w / 2, board.y + 30, lang === "fr" ? `pas de ${g} L` : `steps of ${g} L`, 12);
      const ok = path.length > 0 || t === 0, mark = seg(p, 0.75, 0.9);
      if (mark > 0) {
        svgEl("line", { x1: LX(Math.min(t, top)), y1: Y0 + 8, x2: LX(Math.min(t, top)), y2: Y0 + 22, stroke: ok ? "#7ddc7d" : "#ff8a7a", "stroke-width": 2, opacity: mark }, board.draw);
        chalk(LX(Math.min(t, top)), Y0 + 38, `${t} ${ok ? "✓" : "✗"}`, 14, ok ? "#7ddc7d" : "#ff8a7a").setAttribute("opacity", mark);
      }
      pose.forEach((P0) => { P0.gaze = 1; P0.mood = mark > 0 ? (path.length ? "grin" : "o") : "smile"; });
    }
    if (s === 3) {
      grid(1);
      if (!n) {   // impossible: the jugs shake their heads
        pose.forEach((P0, i) => Object.assign(P0, { mood: "sad", gaze: Math.sin(30 * p + i), tilt: 3 * Math.sin(24 * p + i) }));
        chalk(board.x + board.w / 2, board.y + board.h / 2 + 10, "✗", 40, "#ff8a7a");
      } else {
        const U = Math.min(n - 1e-9, easeInOut(p) * n), k = p >= 1 ? n - 1 : Math.floor(U), u = p >= 1 ? 1 : U - k;
        const from = states[k], to = states[k + 1], mv = parse(path[k].move), J = mv.j, O = 1 - J;
        state = [...from];
        // chalk path so far, then the current segment drawn as the move happens
        const act = seg(u, 0.28, 0.75), cur = [from[0] + (to[0] - from[0]) * act, from[1] + (to[1] - from[1]) * act];
        const pts = [...states.slice(0, k + 1), cur].map(([x, y]) => `${BX(x).toFixed(1)},${BY(y).toFixed(1)}`).join(" L");
        svgEl("path", { d: `M${pts}`, fill: "none", stroke: CHALK_HOT, "stroke-width": 1.8, "stroke-linejoin": "round" }, board.draw);
        svgEl("circle", { cx: BX(cur[0]), cy: BY(cur[1]), r: 3.6, fill: CHALK_HOT }, board.draw);
        chalk(board.x + board.w / 2, board.y + 12, `${k + (act >= 1 ? 1 : 0)} / ${n}`, 11, CHALK_HOT);
        // where the moving jug goes to work, and how it gets there (hopping over the other one when it must)
        const H = (i) => jugs[i].height;
        const station = mv.kind === "fill" ? TAP_X + 10 : mv.kind === "empty" ? SINK_X - 62 : REST[mv.to] + (mv.to === 0 ? 64 : -64);
        const lean = mv.kind === "fill" ? 0 : (mv.kind === "empty" ? 1 : mv.to === 0 ? -1 : 1);
        const liftAt = mv.kind === "pour" ? Math.max(18, H(mv.to) - H(J) * 0.25 + 8) : mv.kind === "empty" ? 22 : 0;
        const go = easeInOut(seg(u, 0, 0.22)), back = easeInOut(seg(u, 0.8, 1));
        const x = REST[J] + (station - REST[J]) * (go - back), crossing = Math.min(REST[J], station) < REST[O] && REST[O] < Math.max(REST[J], station);
        const hop = Math.sin(Math.PI * seg(u, 0, 0.22)) + Math.sin(Math.PI * seg(u, 0.8, 1));
        const lift = liftAt * (go - back) + hop * (crossing ? H(O) * 0.75 + 14 : 14);
        const tilt = lean * (mv.kind === "fill" ? 0 : 100) * (easeInOut(seg(u, 0.22, 0.34)) - easeInOut(seg(u, 0.7, 0.8)));
        const level = [from[0] + (to[0] - from[0]) * act, from[1] + (to[1] - from[1]) * act];
        Object.assign(pose[J], { x, lift, tilt, mood: act > 0 && act < 1 ? (mv.kind === "fill" ? "grin" : "o") : "smile", gaze: lean || -1 });
        Object.assign(pose[O], { gaze: x < REST[O] ? -1 : 1, mood: mv.kind === "pour" && act > 0 && act < 1 ? "grin" : "smile" });
        state = level;
        // the water stream, while the amount changes
        const flowing = act > 0 && act < 1, thick = 5 * Math.sin(Math.PI * Math.min(1, act * 4)) * (act < 0.75 ? 1 : (1 - act) * 4);
        if (flowing && thick > 0.3) {
          let s0, s1;
          if (mv.kind === "fill") { s0 = [TAP_X + 10, 64]; s1 = [x, COUNTER - lift - 6 - (H(J) - 6) * (level[J] / sizes[J])]; }
          else {
            s0 = spoutAt(jugs[J], { x, tilt, lift });
            s1 = mv.kind === "empty" ? [SINK_X, COUNTER + 18] : [REST[mv.to], COUNTER - 6 - (H(mv.to) - 6) * (level[mv.to] / sizes[mv.to])];
          }
          const wob = 2 * Math.sin(40 * p), mx = (s0[0] + s1[0]) / 2 + (mv.kind === "fill" ? wob : lean * 10);
          svgEl("path", { d: `M${s0[0].toFixed(1)} ${s0[1].toFixed(1)} Q${mx.toFixed(1)} ${(s0[1] + 4).toFixed(1)} ${s1[0].toFixed(1)} ${s1[1].toFixed(1)}`, fill: "none", stroke: WATER, "stroke-width": thick.toFixed(1), "stroke-linecap": "round" }, fx);
          for (let d = 0; d < 3; d++) { const a2 = 40 * p + d * 2.1; svgEl("circle", { cx: s1[0] + 8 * Math.sin(a2), cy: s1[1] - 4 - 5 * Math.abs(Math.cos(a2)), r: 1.6, fill: WATER }, fx); }
        }
        // the finish: the jug that holds the target hops for joy
        if (p >= 0.999 || (k === n - 1 && u > 0.95)) { const win = to[0] === t ? 0 : 1; Object.assign(pose[win], { mood: "grin", lift: pose[win].lift + 8 * Math.sin(Math.PI * seg(u, 0.95, 1)) }); }
      }
    }
    [0, 1].forEach((i) => poseJug(jugs[i], { ...pose[i], litres: s === 3 ? state[i] : 0, slosh: pose[i].tilt ? 0 : 1.2, label: `${Math.round((s === 3 ? state[i] : 0) * 10) / 10} / ${sizes[i]} L` }));
    hot.textContent = n ? String(n) : "✗";
    hot.setAttribute("opacity", s === 3 ? seg(p, 0.9, 1) : 0);
  },
};
