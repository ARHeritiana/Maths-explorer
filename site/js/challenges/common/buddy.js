// The cartoon cast of an activity: a strip above the playing field where one to three characters (a person, a robot)
// live while the learner explores. Use it only where a character is a party to the problem and its reactions help (owner,
// 21 November 2026: characters are there to help, never as decoration); today only Nim, played against a robot. They breathe (CSS, no animation frames), turn to look at what the learner touches, and react to
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
// Settings drawn behind the cast (W x H strip, floor at FLOOR): a few outlined shapes each.
const L = (b, d, fill, w = 1.3) => svgEl("path", { d, fill, stroke: INK, "stroke-width": w, "stroke-linejoin": "round" }, b);
export const SETTINGS = {
  games(b) { L(b, "M300 64 H500 V76 H300 Z", "#2a9d8f"); L(b, "M350 14 H450 V48 H350 Z", "#1d2b3a", 1.4); L(b, "M398 16 V46", "none", 1); svgEl("circle", { cx: 375, cy: 31, r: 6, fill: "#5cf27a" }, b); svgEl("circle", { cx: 425, cy: 31, r: 6, fill: "#ff6b6b" }, b); L(b, `M320 76 V${FLOOR} M480 76 V${FLOOR}`, "none", 3); },
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

// cast: [{ kind: "person" | "robot", look, fill, gear, x, facing, name? }]; backdrop(svg, W, H): optional drawing.
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
    const A = c.kind === "robot" ? makeRobot(svg, { fill: c.fill || colour(3) }) : makePerson(svg, { fill, look: c.look ?? i, size: c.size ?? 1.3, gear: c.gear || null });
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
