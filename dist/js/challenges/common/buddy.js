// The cartoon cast of an activity: a strip above the playing field where one to three characters (a person, a robot, a
// pigeon) live while the learner explores. They breathe (CSS, no animation frames), turn to look at what the learner touches, and react to
// what happens: a nod for a move, an "o" and a bubble for a move the rules forbid, a hop and a grin for a goal reached.
// They never comment on the method (owner rule): every word they say repeats what the readout already states, so the strip
// is hidden from screen readers. `mountBuddy(root, options)` inserts the strip after the goal line and returns
// { react(kind, opts), look(x), destroy() }; the activity calls react("move" | "oops" | "win" | "think" | "wave").
import { svgEl, colour } from "./kit.js";
import { makePerson, posePerson } from "./person.js";
import { makeBubble, poseBubble } from "./bubble.js";

const INK = "var(--ink)", W = 520, H = 104, FLOOR = 96;
const g = (p, a = {}) => svgEl("g", a, p);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* ----------------------------------------------------------------- critters */
// A small round robot (the computer opponent), feet at (0, 0), about 70 units tall.
function makeRobot(parent, { fill = colour(3) } = {}) {
  const root = g(parent), shadow = svgEl("ellipse", { rx: 16, ry: 3.4, fill: INK, opacity: 0.16 }, root), fig = g(root);
  const metal = `color-mix(in srgb, ${fill} 55%, #c9d1d9)`;
  for (const x of [-8, 8]) svgEl("rect", { x: x - 3, y: -14, width: 6, height: 14, rx: 2, fill: "#8a949e", stroke: INK, "stroke-width": 1.1 }, fig);
  svgEl("rect", { x: -16, y: -40, width: 32, height: 28, rx: 7, fill: metal, stroke: INK, "stroke-width": 1.5 }, fig);
  svgEl("rect", { x: -9, y: -33, width: 18, height: 10, rx: 2, fill: "#1d2b3a", stroke: INK, "stroke-width": 1 }, fig);
  const leds = [-5, 0, 5].map((x) => svgEl("circle", { cx: x, cy: -28, r: 1.6, fill: "#5cf27a" }, fig));
  const arms = [-1, 1].map((s) => { const a = g(fig); svgEl("path", { d: `M${s * 16} -34 q${s * 10} 6 ${s * 8} 16`, fill: "none", stroke: INK, "stroke-width": 4.4, "stroke-linecap": "round" }, a); svgEl("path", { d: `M${s * 16} -34 q${s * 10} 6 ${s * 8} 16`, fill: "none", stroke: "#8a949e", "stroke-width": 2.6, "stroke-linecap": "round" }, a); svgEl("circle", { cx: s * 24, cy: -17, r: 3, fill: "#8a949e", stroke: INK, "stroke-width": 1 }, a); return a; });
  const head = g(fig);
  svgEl("line", { x1: 0, y1: -62, x2: 0, y2: -70, stroke: INK, "stroke-width": 1.4 }, head);
  const bulb = svgEl("circle", { cx: 0, cy: -71, r: 3, fill: "#ffd34d", stroke: INK, "stroke-width": 1 }, head);
  svgEl("rect", { x: -14, y: -62, width: 28, height: 22, rx: 8, fill: metal, stroke: INK, "stroke-width": 1.5 }, head);
  svgEl("rect", { x: -10, y: -58, width: 20, height: 13, rx: 4, fill: "#e8f6ff", stroke: INK, "stroke-width": 1 }, head);
  const eyes = [-5, 5].map((x) => svgEl("circle", { cx: x, cy: -52.5, r: 2.4, fill: "#1d2b3a" }, head));
  const mouth = svgEl("path", { fill: "none", stroke: "#1d2b3a", "stroke-width": 1.2, "stroke-linecap": "round" }, head);
  return { kind: "robot", root, shadow, fig, head, eyes, mouth, arms, leds, bulb };
}
function poseRobot(R, { x, y, facing = 1, gaze = 0, hop = 0, mood = "smile", blink = 0, wave = 0, breathe = 0 }) {
  const lift = 6 * Math.sin(Math.PI * clamp01(hop));
  R.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${facing < 0 ? -1 : 1} 1)`);
  R.fig.setAttribute("transform", `translate(0 ${(-lift - 0.6 * Math.sin(breathe)).toFixed(2)})`);
  R.head.setAttribute("transform", `rotate(${(6 * gaze).toFixed(1)} 0 -40)`);
  R.eyes.forEach((e, i) => { e.setAttribute("cx", ((i ? 5 : -5) + 1.6 * gaze).toFixed(2)); e.setAttribute("r", blink > 0.5 ? 0.6 : mood === "o" ? 3 : 2.4); });
  R.mouth.setAttribute("d", mood === "o" ? "M-2 -47.5 h4" : mood === "grin" ? "M-5 -48 q5 4 10 0" : mood === "flat" ? "M-4 -47.5 h8" : "M-4 -48 q4 2.4 8 0");
  R.arms[1].setAttribute("transform", wave > 0 ? `rotate(${(-120 + 20 * Math.sin(wave * 18)).toFixed(1)} 16 -34)` : "");
  R.bulb.setAttribute("fill", mood === "o" ? "#ff6b6b" : mood === "grin" ? "#5cf27a" : "#ffd34d");
}

// A pigeon, feet at (0, 0), facing +x, about 40 units tall.
function makePigeon(parent, { fill = "#9aa7b8" } = {}) {
  const root = g(parent), shadow = svgEl("ellipse", { rx: 12, ry: 2.6, fill: INK, opacity: 0.16 }, root), flip = g(root), fig = g(flip);
  for (const x of [-3, 3]) svgEl("path", { d: `M${x} -8 v8 l3 0`, fill: "none", stroke: "#e07b39", "stroke-width": 1.6, "stroke-linecap": "round" }, fig);
  svgEl("path", { d: "M-16 -16 q-4 -6 -10 -4 q4 2 6 6 Z", fill: `color-mix(in srgb, ${fill} 70%, #000)`, stroke: INK, "stroke-width": 1 }, fig);   // tail
  svgEl("ellipse", { cx: -2, cy: -16, rx: 15, ry: 10, fill, stroke: INK, "stroke-width": 1.4 }, fig);
  const wing = svgEl("path", { d: "M-10 -18 q8 -8 16 0 q-8 6 -16 0 Z", fill: `color-mix(in srgb, ${fill} 75%, #000)`, stroke: INK, "stroke-width": 1 }, fig);
  const head = g(fig);
  svgEl("circle", { cx: 10, cy: -28, r: 7, fill: `color-mix(in srgb, ${fill} 85%, #6a4c93)`, stroke: INK, "stroke-width": 1.3 }, head);
  svgEl("path", { d: "M16 -28 l5 1.5 l-5 1.5 Z", fill: "#e0b13a", stroke: INK, "stroke-width": 0.8 }, head);
  svgEl("circle", { cx: 12, cy: -30, r: 2.4, fill: "#fff", stroke: INK, "stroke-width": 0.7 }, head);
  const eye = svgEl("circle", { cx: 12.6, cy: -30, r: 1.2, fill: "#1d1d1d" }, head);
  return { kind: "pigeon", root, shadow, flip, fig, head, wing, eye };
}
function posePigeon(B, { x, y, facing = 1, hop = 0, mood = "smile", blink = 0, breathe = 0, wave = 0 }) {
  const lift = 7 * Math.sin(Math.PI * clamp01(hop));
  B.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  B.flip.setAttribute("transform", facing < 0 ? "scale(-1 1)" : "");
  B.fig.setAttribute("transform", `translate(0 ${(-lift).toFixed(2)})`);
  B.head.setAttribute("transform", `translate(${(1.2 * Math.sin(breathe * 2)).toFixed(2)} 0)${mood === "o" ? " rotate(-12 10 -24)" : ""}`);
  B.wing.setAttribute("transform", hop > 0 || wave > 0 ? `rotate(${(-30 * Math.abs(Math.sin((hop + wave) * 20))).toFixed(1)} -10 -18)` : "");
  B.eye.setAttribute("r", blink > 0.5 ? 0.3 : mood === "o" ? 1.6 : 1.2);
}


/* ------------------------------------------------------------------- style */
// The cast moves with CSS only: a slow breath, and on a reaction a hop (goal), a shake (refusal) or a nod (move); the
// bubble pops. All of it stops under prefers-reduced-motion.
const BUDDY_CSS = `
.act-buddy .bd-actor{animation:bd-breathe 3.2s ease-in-out infinite;transform-box:view-box}
.act-buddy .bd-actor.bd-hop{animation:bd-hop .5s cubic-bezier(.3,1.6,.5,1) 4}
.act-buddy .bd-actor.bd-shake{animation:bd-shake .45s ease-in-out 2}
.act-buddy .bd-actor.bd-nod{animation:bd-nod .5s ease-out 1}
.act-buddy .bd-bubble.bd-say{animation:bd-pop .35s cubic-bezier(.3,1.9,.5,1)}
@keyframes bd-breathe{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-1px) scale(1.01,.99)}}
@keyframes bd-hop{0%,100%{transform:translateY(0) scale(1,1)}20%{transform:translateY(0) scale(1.08,.9)}55%{transform:translateY(-12px) scale(.95,1.06)}}
@keyframes bd-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px) rotate(-3deg)}75%{transform:translateX(4px) rotate(3deg)}}
@keyframes bd-nod{0%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
@keyframes bd-pop{0%{opacity:0}60%{opacity:1}100%{opacity:1}}
@media (prefers-reduced-motion:reduce){.act-buddy .bd-actor,.act-buddy .bd-actor.bd-hop,.act-buddy .bd-actor.bd-shake,.act-buddy .bd-actor.bd-nod,.act-buddy .bd-bubble.bd-say{animation:none}}`;
function installBuddyStyle(doc) {
  if (!doc || doc.getElementById("buddy-style")) return;
  const style = doc.createElement("style");
  style.id = "buddy-style"; style.textContent = BUDDY_CSS;
  doc.head.append(style);
}

/* ---------------------------------------------------------------- settings */
// Small themed settings drawn behind the cast (W x H strip, floor at FLOOR). Each one is a few outlined shapes.
const L = (b, d, fill, w = 1.3) => svgEl("path", { d, fill, stroke: INK, "stroke-width": w, "stroke-linejoin": "round" }, b);
export const SETTINGS = {
  temple(b) { L(b, `M330 ${FLOOR} V40 L410 12 L490 40 V${FLOOR} Z`, "color-mix(in srgb, #e9c46a 35%, var(--surface))"); L(b, "M320 42 L410 6 L500 42 Z", "#c0392b"); for (const x of [350, 390, 430, 470]) L(b, `M${x - 3} 44 h6 V${FLOOR} h-6 Z`, "#8d5f2d", 0.8); },
  market(b) { L(b, `M300 ${FLOOR} V44 H500 V${FLOOR}`, "color-mix(in srgb, #c58b52 55%, var(--surface))"); for (let i = 0; i < 5; i++) L(b, `M${300 + i * 40} 30 h40 v14 q-20 10 -40 0 Z`, i % 2 ? "#fff" : "#e63946", 1); L(b, "M380 70 h40 M400 70 V52 M386 70 l-8 14 h16 Z M414 70 l-8 14 h16 Z", "none", 1.4); },
  tower(b) { L(b, `M380 ${FLOOR} V8 H470 V${FLOOR} Z`, "color-mix(in srgb, #a8dadc 45%, var(--surface))"); for (let y = 16; y < FLOOR - 8; y += 16) for (const x of [392, 418, 444]) L(b, `M${x} ${y} h14 v9 h-14 Z`, "#fff6d5", 0.8); },
  hall(b) { for (let i = 0; i < 6; i++) { const x = 250 + i * 44; L(b, `M${x} ${FLOOR} V40 Q${x + 15} 30 ${x + 30} 40 V${FLOOR} Z`, i % 2 ? "#8d5f2d" : "#b07a43", 1.1); svgEl("circle", { cx: x + 24, cy: 70, r: 2, fill: "#ffd34d" }, b); } },
  dovecote(b) { L(b, `M380 ${FLOOR} V40 H480 V${FLOOR} Z`, "color-mix(in srgb, #f4e1c1 60%, var(--surface))"); L(b, "M370 42 L430 10 L490 42 Z", "#8d5f2d"); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) L(b, `M${392 + c * 30} ${58 + r * 20} a8 8 0 0 1 16 0 v6 h-16 Z`, "#3b2a20", 1); },
  classroom(b) { L(b, "M260 14 H500 V74 H260 Z", "#2f4a3c", 1.4); L(b, "M254 8 H506 V80 H254 Z", "none", 2); svgEl("rect", { x: 280, y: 76, width: 18, height: 4, rx: 1.5, fill: "#fff" }, b); },
  night(b) { svgEl("rect", { x: 0, y: 0, width: W, height: FLOOR, rx: 12, fill: "#1d2b4a", opacity: 0.85 }, b); for (let i = 0; i < 22; i++) svgEl("circle", { cx: 130 + ((i * 97) % 380), cy: 10 + ((i * 53) % 70), r: i % 4 ? 1.1 : 2, fill: "#fff6c8" }, b); svgEl("circle", { cx: 470, cy: 26, r: 12, fill: "#fff3b0" }, b); },
  camp(b) { L(b, `M330 ${FLOOR} L380 30 L430 ${FLOOR} Z`, "#2a9d8f"); L(b, `M420 ${FLOOR} L462 44 L504 ${FLOOR} Z`, "#e76f51"); L(b, `M240 ${FLOOR} q10 -26 20 0 Z M248 ${FLOOR} q6 -14 4 -22 q10 8 6 22 Z`, "#f4a261", 1); },
  gallery(b) { for (const [x, w, c] of [[270, 50, "#e9c46a"], [340, 70, "#2a9d8f"], [430, 50, "#e76f51"]]) { L(b, `M${x} 18 h${w} v40 h${-w} Z`, "#8d5f2d", 1.4); L(b, `M${x + 5} 23 h${w - 10} v30 h${-(w - 10)} Z`, c, 0.8); } },
  park(b) { for (const x of [300, 380, 460]) { L(b, `M${x - 3} ${FLOOR} V60 h6 V${FLOOR} Z`, "#7a4a24", 0.8); svgEl("circle", { cx: x, cy: 50, r: 18, fill: "#4f9a46", stroke: INK, "stroke-width": 1 }, b); } },
  pond(b) { svgEl("ellipse", { cx: 400, cy: FLOOR - 4, rx: 100, ry: 12, fill: "color-mix(in srgb, #4aa3df 60%, var(--surface))", stroke: INK, "stroke-width": 1.2 }, b); L(b, `M330 ${FLOOR - 6} q4 -26 8 0 M470 ${FLOOR - 6} q4 -22 8 0`, "none", 1.6); },
  chess(b) { L(b, "M300 70 H500 V82 H300 Z", "#8d5f2d"); for (let i = 0; i < 8; i++) L(b, `M${310 + i * 22} 58 h22 v12 h-22 Z`, i % 2 ? "#3b2a20" : "#f4e1c1", 0.6); L(b, `M320 82 V${FLOOR} M480 82 V${FLOOR}`, "none", 3); },
  games(b) { L(b, "M300 64 H500 V76 H300 Z", "#2a9d8f"); L(b, "M350 14 H450 V48 H350 Z", "#1d2b3a", 1.4); L(b, "M398 16 V46", "none", 1); svgEl("circle", { cx: 375, cy: 31, r: 6, fill: "#5cf27a" }, b); svgEl("circle", { cx: 425, cy: 31, r: 6, fill: "#ff6b6b" }, b); L(b, `M320 76 V${FLOOR} M480 76 V${FLOOR}`, "none", 3); },
  staircase(b) { for (let i = 0; i < 8; i++) L(b, `M${300 + i * 25} ${FLOOR} V${FLOOR - 10 - i * 10} h25 V${FLOOR} Z`, `color-mix(in srgb, ${colour(i)} 50%, var(--surface))`, 1); },
  grid(b) { for (let i = 0; i <= 6; i++) { L(b, `M${300 + i * 30} 10 V${FLOOR - 6}`, "none", 0.6); } for (let j = 0; j <= 3; j++) L(b, `M300 ${10 + j * 26.6} H480`, "none", 0.6); svgEl("circle", { cx: 300, cy: FLOOR - 6, r: 5, fill: "#2a9d8f" }, b); svgEl("circle", { cx: 480, cy: 10, r: 5, fill: "#e63946" }, b); },
  lab(b) { L(b, "M300 70 H500 V80 H300 Z", "#9aa7b8"); L(b, "M330 70 V40 h14 V70 M326 40 h22", "color-mix(in srgb, #4aa3df 40%, var(--surface))"); L(b, "M380 70 q-14 0 -8 -16 l10 -16 V30 h10 v8 l10 16 q6 16 -8 16 Z", "color-mix(in srgb, #8ac926 40%, var(--surface))"); L(b, "M440 70 a16 16 0 1 1 32 0 Z", "color-mix(in srgb, #ffca3a 50%, var(--surface))"); },
};

/* ------------------------------------------------------------------- strip */
const OOPS = /interdit|not allowed|impossible|pas d’échange|no swap|n’est pas|is not|déjà|already|vide|empty|cannot|ne peut|perdu|lost|computer wins|il gagne|it wins/i;
const WORDS = {
  oops: [["Oups !", "Oops!"], ["Pas permis !", "Not allowed!"], ["Aïe !", "Ouch!"]],
  win: [["Bravo !", "Well done!"], ["Youpi !", "Hooray!"], ["Gagné !", "Done it!"]],
  think: [["Hmm…", "Hmm…"]],
  wave: [["Salut !", "Hi!"]],
  lose: [["Zut !", "Drat!"]],
};

// cast: [{ kind: "person" | "robot" | "pigeon", look, fill, gear, x, facing, name? }]; backdrop(svg, W, H): optional drawing.
// auto: a click or a change anywhere in the activity makes the cast look there and nod, unless the activity reacted itself.
// watch: true (default) reads the activity's readout, a function (text) => kind, or false.
export function mountBuddy(root, { t, cast = [{ kind: "person", look: 0 }], backdrop = null, auto = true, watch = true } = {}) {
  const holder = root.ownerDocument.createElement("div");
  holder.className = "act-buddy";
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText = "max-width:560px;margin:0 auto .35rem;line-height:0";
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", focusable: "false" });
  svg.style.cssText = "display:block;width:100%;height:auto;max-height:120px";
  holder.append(svg);
  const goal = root.querySelector(".act-help.goal");
  if (goal) goal.after(holder); else root.prepend(holder);
  // the backdrop: a soft floor, and whatever the activity draws (a shelf, a sign, a nest...)
  svgEl("rect", { x: 0, y: 0, width: W, height: H, rx: 12, fill: "color-mix(in srgb, var(--object-ink) 6%, var(--surface))" }, svg);
  svgEl("path", { d: `M0 ${FLOOR} H${W}`, stroke: "color-mix(in srgb, var(--ink) 25%, transparent)", "stroke-width": 2 }, svg);
  if (typeof backdrop === "string") SETTINGS[backdrop]?.(g(svg));
  else if (backdrop) backdrop(svg, { W, H, FLOOR, g: (a) => g(svg, a), el: (n, a) => svgEl(n, a, svg) });
  const n = cast.length, slots = n === 1 ? [70] : n === 2 ? [70, 450] : [70, 260, 450];
  const actors = cast.map((c, i) => {
    const x = c.x ?? slots[i], facing = c.facing ?? (x < W / 2 ? 1 : -1);
    const fill = c.fill || `color-mix(in srgb, ${colour(c.look ?? i)} 70%, var(--surface))`;
    const A = c.kind === "robot" ? makeRobot(svg, { fill: c.fill || colour(3) }) : c.kind === "pigeon" ? makePigeon(svg, { fill: c.fill }) : makePerson(svg, { fill, look: c.look ?? i, size: c.size ?? 1.3, gear: c.gear || null });
    if (c.name) svgEl("text", { x, y: H - 1, "text-anchor": "middle", "font-size": 9, "font-weight": 700, fill: INK }, svg).textContent = c.name;
    return { A, kind: c.kind || "person", x, facing, gaze: 0, wrap: null, timer: 0 };
  });
  // each actor sits in a wrapper that CSS animates (breathing; hop, shake or nod on a reaction): no animation frames are
  // used, and prefers-reduced-motion switches the movement off; the pose (mood, gaze, arms) is set once per reaction
  installBuddyStyle(root.ownerDocument);
  actors.forEach((a, i) => { const wrap = g(svg, { class: "bd-actor" }); wrap.style.animationDelay = `${-i * 0.7}s`; wrap.style.transformOrigin = `${a.x}px ${FLOOR}px`; wrap.append(a.A.root); a.wrap = wrap; });
  const bubble = makeBubble(svg);
  bubble.root.classList.add("bd-bubble");
  const timers = new Set(), later = (f, ms) => { const id = setTimeout(() => { timers.delete(id); f(); }, ms); timers.add(id); return id; };
  const pose = (a, kind = null) => {
    const common = { x: a.x, y: FLOOR, facing: a.facing, breathe: 0, blink: 0 };
    const mood = kind === "oops" || kind === "lose" ? "o" : kind === "win" ? "grin" : kind === "think" ? "flat" : "smile";
    if (a.kind === "robot") poseRobot(a.A, { ...common, gaze: a.gaze, mood, wave: kind === "win" || kind === "wave" ? 0.3 : 0 });
    else if (a.kind === "pigeon") posePigeon(a.A, { ...common, mood, wave: kind === "win" ? 0.3 : 0 });
    else posePerson(a.A, { ...common, gaze: [a.gaze * a.facing, kind === "think" ? -0.8 : 0.2], mood, wave: kind === "wave" || kind === "win" ? 0.12 : 0, reach: kind === "move" ? 0.7 : 0, reachAngle: 20 });
  };
  const play = (a, kind) => {
    pose(a, kind);
    const cls = kind === "win" ? "bd-hop" : kind === "oops" || kind === "lose" ? "bd-shake" : kind === "move" ? "bd-nod" : "bd-nod";
    a.wrap.classList.remove("bd-hop", "bd-shake", "bd-nod");
    void a.wrap.getBoundingClientRect?.();
    a.wrap.classList.add(cls);
    clearTimeout(a.timer); timers.delete(a.timer);
    a.timer = later(() => { a.wrap.classList.remove(cls); pose(a); }, kind === "win" ? 2000 : kind === "move" ? 700 : 1400);
  };
  const speak = (who, text) => {
    const a = actors[who];
    poseBubble(bubble, { x: a.x + (a.x < W / 2 ? 30 : -30), y: 30, text, appear: 1 });
    bubble.root.classList.remove("bd-say"); void bubble.root.getBoundingClientRect?.(); bubble.root.classList.add("bd-say");
    clearTimeout(speak.timer); timers.delete(speak.timer);
    speak.timer = later(() => { bubble.root.classList.remove("bd-say"); poseBubble(bubble, { x: 0, y: 0, text: "", appear: 0 }); }, 1800);
  };
  actors.forEach((a) => pose(a));
  poseBubble(bubble, { x: 0, y: 0, text: "", appear: 0 });
  let pick = 0, explicitAt = -1e9;
  const now = () => (globalThis.performance ? performance.now() : Date.now());
  const onAct = (e) => {
    if (now() - explicitAt < 80 || holder.contains(e.target)) return;
    const r = root.getBoundingClientRect(), fx = r.width && e.clientX ? (e.clientX - r.left) / r.width : 0.5;
    actors.forEach((a) => { a.gaze = Math.max(-1, Math.min(1, (fx * W - a.x) / 200)); play(a, "move"); });
  };
  if (auto) { root.addEventListener("click", onAct); root.addEventListener("change", onAct); }
  // the readout tells the cast what happened: a refusal makes them wince, a line ending in "!" makes them cheer
  const out = watch && root.querySelector(".act-readout, [role=status]");
  let lastText = out ? out.textContent : "", lastKind = null;
  const observer = out && typeof MutationObserver !== "undefined" ? new MutationObserver(() => {
    const text = out.textContent;
    if (text === lastText) return;
    lastText = text;
    const kind = typeof watch === "function" ? watch(text) : OOPS.test(text) ? "oops" : /!/.test(text) ? "win" : null;
    if (kind && (kind !== lastKind || kind === "oops") && now() - explicitAt > 80) api.react(kind);
    lastKind = kind;
  }) : null;
  observer?.observe(out, { childList: true, subtree: true, characterData: true });
  const api = {
    // kind: move, oops, win, think, wave, lose; who: index in the cast (default: every actor reacts, the first one speaks)
    react(kind, { who = null, text = null } = {}) {
      explicitAt = now();
      actors.forEach((a, i) => { if (who === null || who === i) play(a, kind); });
      const words = WORDS[kind];
      if (text || words) { const w = text || words[pick++ % words.length]; speak(who ?? 0, Array.isArray(w) ? t(w[0], w[1]) : w); }
    },
    // turn the cast towards a point given as a fraction 0..1 of the playing field's width
    look(fx) { actors.forEach((a) => { const dx = fx * W - a.x; a.gaze = Math.max(-1, Math.min(1, dx / 200)); pose(a); }); },
    destroy() { timers.forEach(clearTimeout); timers.clear(); observer?.disconnect(); holder.remove(); root.removeEventListener("click", onAct); root.removeEventListener("change", onAct); },
  };
  return api;
}
