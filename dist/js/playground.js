// Home page toys: small direct-manipulation figures. Each one is a real model
// (roots, determinant, unit circle, secant), drawn as SVG, moved with pointer
// or arrow keys, and always shows the numbers behind the picture.
import { formatNumber } from "./math.js";

const NS = "http://www.w3.org/2000/svg";
const MINUS = "−";
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const snap = (v, step) => Math.round(v / step) * step;

function svgEl(name, attrs = {}, parent) {
  const el = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.append(el);
  return el;
}

// Number formatting: decimal comma in French, true minus sign.
const makeFormat = (lang) => (n, digits = 2) =>
  formatNumber(Math.abs(n) < 1e-9 ? 0 : n, lang, digits).replace(/-/g, MINUS);

// 1x^2 - 4x + 0  ->  x^2 - 4x   (coefficients simplified, zero terms dropped)
function polynomial(coefs, fmt) {
  const powers = ["x²", "x", ""];
  let out = "";
  coefs.forEach((c, i) => {
    if (Math.abs(c) < 1e-9) return;
    const abs = Math.abs(c);
    const body = powers[i] && Math.abs(abs - 1) < 1e-9 ? powers[i] : fmt(abs) + powers[i];
    if (!out) out = (c < 0 ? MINUS : "") + body;
    else out += (c < 0 ? ` ${MINUS} ` : " + ") + body;
  });
  return out || "0";
}

// Critically underdamped spring: values glide to their targets with a slight
// overshoot. This is the toy's one signature motion; it answers a user action.
function createSpring(initial, onFrame, reduced) {
  let current = [...initial];
  let target = [...initial];
  let velocity = initial.map(() => 0);
  let frame = null;
  const step = () => {
    frame = null;
    let moving = false;
    current = current.map((value, i) => {
      velocity[i] = (velocity[i] + (target[i] - value) * 0.2) * 0.7;
      const next = value + velocity[i];
      if (Math.abs(target[i] - next) > 0.0015 || Math.abs(velocity[i]) > 0.0015) moving = true;
      return next;
    });
    if (!moving) current = [...target];
    onFrame(current);
    if (moving) frame = requestAnimationFrame(step);
  };
  return {
    to(next, instant = false) {
      target = [...next];
      if (instant || reduced()) {
        current = [...next];
        velocity = velocity.map(() => 0);
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        onFrame(current);
      } else if (frame === null) frame = requestAnimationFrame(step);
    },
    get target() {
      return target;
    },
    get current() {
      return current;
    },
    stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    },
  };
}

// Pointer dragging for an SVG handle; reports coordinates in viewBox units.
function dragHandle(svg, handle, move, start = () => {}, end = () => {}) {
  const toLocal = (event) => {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("grabbed");
    start();
    const onMove = (e) => {
      const p = toLocal(e);
      move(p.x, p.y);
    };
    const onUp = () => {
      handle.classList.remove("grabbed");
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      end();
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
    onMove(event);
  });
}

function makeHandle(parent, { cls, label, min, max, onKey }) {
  const g = svgEl("g", { class: `toy-handle ${cls}`, tabindex: "0", role: "slider", "aria-label": label, "aria-valuemin": min, "aria-valuemax": max }, parent);
  svgEl("circle", { class: "hit", r: 26 }, g);
  svgEl("circle", { class: "halo", r: 15 }, g);
  svgEl("circle", { class: "ring", r: 11 }, g);
  svgEl("circle", { class: "core", r: 5 }, g);
  g.addEventListener("keydown", (e) => {
    const dir = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    onKey(dir, e.shiftKey);
  });
  return g;
}

function placeHandle(g, x, y, value, text) {
  g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  g.setAttribute("aria-valuenow", value);
  g.setAttribute("aria-valuetext", text);
}

function announce(node) {
  let timer = null;
  return (text) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      node.textContent = text;
    }, 450);
  };
}

/* ---------------------------------------------------------------- parabola */

export function mountParabola(root, { lang, reduced }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const fmt = makeFormat(lang);
  const W = 640, H = 420, S = 32, OX = W / 2, OY = H / 2;
  const X = (x) => OX + x * S;
  const Y = (y) => OY - y * S;
  const XMAX = W / 2 / S;
  const state = { x1: -2, x2: 3, k: 4 }; // a = k / 4, k in {-8..-1, 1..8}
  const aOf = (k) => k / 4;

  root.innerHTML = `
    <div class="toy-head">
      <p class="toy-formula" id="par-formula" aria-hidden="true"></p>
      <p class="toy-mood" id="par-mood"></p>
    </div>
    <svg class="toy-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Parabole : déplace les deux racines sur l’axe", "Parabola: move the two roots along the axis")}"></svg>
    <div class="toy-readout" aria-hidden="true">
      <span class="chip" id="par-delta"></span>
      <span class="chip" id="par-vertex"></span>
      <span class="chip" id="par-roots"></span>
    </div>
    <label class="toy-slider" for="par-a"><span>${t("Coefficient a", "Coefficient a")} <output id="par-a-out"></output></span>
      <input id="par-a" type="range" min="-8" max="8" step="1" value="${state.k}"></label>
    <p class="sr-only" id="par-live" aria-live="polite"></p>`;

  const svg = root.querySelector("svg");
  const defs = svgEl("defs", {}, svg);
  const clip = svgEl("clipPath", { id: "par-clip" }, defs);
  svgEl("rect", { x: 0, y: 0, width: W, height: H }, clip);
  const clipPos = svgEl("clipPath", { id: "par-pos" }, defs);
  svgEl("rect", { x: 0, y: 0, width: W, height: OY }, clipPos);
  const clipNeg = svgEl("clipPath", { id: "par-neg" }, defs);
  svgEl("rect", { x: 0, y: OY, width: W, height: H - OY }, clipNeg);

  const grid = svgEl("g", { class: "toy-grid" }, svg);
  for (let x = -Math.floor(XMAX); x <= Math.floor(XMAX); x++) svgEl("line", { x1: X(x), y1: 0, x2: X(x), y2: H, class: x === 0 ? "axis" : "" }, grid);
  for (let y = -6; y <= 6; y++) svgEl("line", { x1: 0, y1: Y(y), x2: W, y2: Y(y), class: y === 0 ? "axis" : "" }, grid);
  const ticks = svgEl("g", { class: "toy-ticks" }, svg);
  for (let x = -8; x <= 8; x += 2) if (x !== 0) svgEl("text", { x: X(x), y: OY + 18, "text-anchor": "middle" }, ticks).textContent = fmt(x, 0);

  const plot = svgEl("g", { "clip-path": "url(#par-clip)" }, svg);
  const areaPos = svgEl("path", { class: "area-pos", "clip-path": "url(#par-pos)" }, plot);
  const areaNeg = svgEl("path", { class: "area-neg", "clip-path": "url(#par-neg)" }, plot);
  const axisOfSymmetry = svgEl("line", { class: "symmetry", y1: 0, y2: H }, plot);
  const curve = svgEl("path", { class: "curve" }, plot);
  const vertex = svgEl("g", { class: "vertex" }, plot);
  svgEl("circle", { r: 6 }, vertex);
  const burst = svgEl("circle", { class: "burst", r: 14, cy: OY }, svg);

  const handle1 = makeHandle(svg, { cls: "h1", label: t("Racine x₁", "Root x₁"), min: -6, max: 6, onKey: (d, big) => setRoot("x1", state.x1 + d * (big ? 2 : 0.5)) });
  const handle2 = makeHandle(svg, { cls: "h2", label: t("Racine x₂", "Root x₂"), min: -6, max: 6, onKey: (d, big) => setRoot("x2", state.x2 + d * (big ? 2 : 0.5)) });
  const label1 = svgEl("text", { class: "handle-name", "text-anchor": "middle" }, svg);
  const label2 = svgEl("text", { class: "handle-name", "text-anchor": "middle" }, svg);
  label1.textContent = "x₁";
  label2.textContent = "x₂";

  const el = (id) => root.querySelector(id);
  const say = announce(el("#par-live"));
  let wasDouble = false;

  function draw([x1, x2, k]) {
    const a = aOf(k);
    const f = (x) => a * (x - x1) * (x - x2);
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const x = -XMAX + (2 * XMAX * i) / 160;
      d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(f(x)).toFixed(1);
    }
    curve.setAttribute("d", d);
    const fill = `${d}L${X(XMAX)} ${Y(0)}L${X(-XMAX)} ${Y(0)}Z`;
    areaPos.setAttribute("d", fill);
    areaNeg.setAttribute("d", fill);
    const alpha = (x1 + x2) / 2;
    const beta = f(alpha);
    axisOfSymmetry.setAttribute("x1", X(alpha));
    axisOfSymmetry.setAttribute("x2", X(alpha));
    vertex.setAttribute("transform", `translate(${X(alpha)} ${Y(beta)})`);
    placeHandle(handle1, X(x1), Y(0), state.x1, `${fmt(state.x1, 1)}`);
    placeHandle(handle2, X(x2), Y(0), state.x2, `${fmt(state.x2, 1)}`);
    const sep = Math.abs(x1 - x2) < 0.9;
    label1.setAttribute("x", X(x1) + (sep && x1 <= x2 ? -14 : sep ? 14 : 0));
    label2.setAttribute("x", X(x2) + (sep && x1 <= x2 ? 14 : sep ? -14 : 0));
    label1.setAttribute("y", Y(0) + (sep ? 44 : 44));
    label2.setAttribute("y", Y(0) + (sep ? 44 : 44));
    el("#par-a-out").textContent = fmt(a);
  }

  const spring = createSpring([state.x1, state.x2, state.k], draw, reduced);

  function summary() {
    const a = aOf(state.k);
    const { x1, x2 } = state;
    const b = -a * (x1 + x2), c = a * x1 * x2;
    const delta = b * b - 4 * a * c;
    const alpha = (x1 + x2) / 2, beta = a * (alpha - x1) * (alpha - x2);
    const double = Math.abs(x1 - x2) < 1e-9;
    el("#par-formula").innerHTML = `<i>f</i>(<i>x</i>) = ${polynomial([a, b, c], fmt).replace(/x/g, "<i>x</i>")}`;
    const direction = a > 0 ? t("branches vers le haut", "opens upward") : t("branches vers le bas", "opens downward");
    const verdict = double
      ? t("Racine double : les deux points se rejoignent et la courbe effleure l’axe.", "Double root: the two points meet and the curve just touches the axis.")
      : Number.isInteger(x1) && Number.isInteger(x2)
        ? t("Deux racines entières.", "Two whole-number roots.")
        : t("Deux racines distinctes.", "Two distinct roots.");
    el("#par-mood").innerHTML = `<span class="m"><i>a</i> ${a > 0 ? "&gt;" : "&lt;"} 0</span> : ${direction}. ${verdict}`;
    el("#par-delta").innerHTML = `Δ = ${fmt(delta)}`;
    el("#par-vertex").innerHTML = `${t("Sommet", "Vertex")} S(${fmt(alpha)} ; ${fmt(beta)})`;
    el("#par-roots").innerHTML = double ? `x₁ = x₂ = ${fmt(x1, 1)}` : `x₁ = ${fmt(Math.min(x1, x2), 1)}, x₂ = ${fmt(Math.max(x1, x2), 1)}`;
    say(`f(x) = ${polynomial([a, b, c], fmt)}. ${t("Racines", "Roots")} ${fmt(x1, 1)} ${t("et", "and")} ${fmt(x2, 1)}. Δ = ${fmt(delta)}.`);
    if (double && !wasDouble && !reduced()) {
      burst.setAttribute("cx", X(x1));
      burst.classList.remove("go");
      void burst.getBoundingClientRect();
      burst.classList.add("go");
    }
    wasDouble = double;
  }

  function setRoot(which, value) {
    state[which] = clamp(snap(value, 0.5), -6, 6);
    spring.to([state.x1, state.x2, state.k]);
    summary();
  }

  dragHandle(svg, handle1, (px) => setRoot("x1", (px - OX) / S), () => interact());
  dragHandle(svg, handle2, (px) => setRoot("x2", (px - OX) / S), () => interact());

  const slider = el("#par-a");
  let previousK = state.k;
  slider.addEventListener("input", () => {
    let k = Number(slider.value);
    if (k === 0) k = previousK > 0 ? -1 : 1; // a = 0 is not a quadratic: hop across.
    slider.value = k;
    previousK = k;
    state.k = k;
    interact();
    spring.to([state.x1, state.x2, state.k]);
    summary();
  });

  let touched = false;
  let intro = null;
  function interact() {
    touched = true;
    if (intro) intro = (cancelAnimationFrame(intro), null);
  }

  // A short invitation: the right-hand root slides out and settles, once.
  state.x2 = 1;
  spring.to([state.x1, state.x2, state.k], true);
  summary();
  if (!reduced()) {
    intro = requestAnimationFrame(() =>
      setTimeout(() => {
        if (!touched) {
          state.x2 = 3;
          spring.to([state.x1, state.x2, state.k]);
          summary();
        }
      }, 700),
    );
  } else {
    state.x2 = 3;
    spring.to([state.x1, state.x2, state.k], true);
    summary();
  }
  return () => {
    spring.stop();
    if (intro) cancelAnimationFrame(intro);
  };
}

/* ------------------------------------------------------------ determinant */

export function mountDeterminant(root, { lang, reduced }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const fmt = makeFormat(lang);
  const W = 360, H = 300, S = 28, OX = 150, OY = 170;
  const X = (x) => OX + x * S, Y = (y) => OY - y * S;
  const v = { a: 3, b: 1, c: -1, d: 3 }; // u = (a, b), v = (c, d)

  root.innerHTML = `
    <svg class="toy-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Deux vecteurs et leur parallélogramme", "Two vectors and their parallelogram")}"></svg>
    <p class="toy-sum" id="det-sum"></p>
    <p class="sr-only" id="det-live" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  const grid = svgEl("g", { class: "toy-grid" }, svg);
  for (let x = -5; x <= 7; x++) svgEl("line", { x1: X(x), y1: 0, x2: X(x), y2: H, class: x === 0 ? "axis" : "" }, grid);
  for (let y = -5; y <= 4; y++) svgEl("line", { x1: 0, y1: Y(y), x2: W, y2: Y(y), class: y === 0 ? "axis" : "" }, grid);
  const para = svgEl("path", { class: "para" }, svg);
  const arrowU = svgEl("path", { class: "vec vec-u" }, svg);
  const arrowV = svgEl("path", { class: "vec vec-v" }, svg);
  const hu = makeHandle(svg, { cls: "hu", label: t("Pointe du vecteur u", "Tip of vector u"), min: -5, max: 5, onKey: (dir, big) => nudge("u", dir, big) });
  const hv = makeHandle(svg, { cls: "hv", label: t("Pointe du vecteur v", "Tip of vector v"), min: -5, max: 5, onKey: (dir, big) => nudge("v", dir, big) });
  const nu = svgEl("text", { class: "handle-name" }, svg);
  const nv = svgEl("text", { class: "handle-name" }, svg);
  nu.textContent = "u";
  nv.textContent = "v";
  const say = announce(root.querySelector("#det-live"));
  const head = (x, y, dx, dy) => {
    const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const bx = x - ux * 12, by = y - uy * 12;
    return `M${bx - uy * 6} ${by + ux * 6}L${x} ${y}L${bx + uy * 6} ${by - ux * 6}`;
  };

  function draw([a, b, c, d]) {
    const det = v.a * v.d - v.b * v.c;
    para.setAttribute("d", `M${X(0)} ${Y(0)}L${X(a)} ${Y(b)}L${X(a + c)} ${Y(b + d)}L${X(c)} ${Y(d)}Z`);
    para.setAttribute("class", `para ${det > 0 ? "pos" : det < 0 ? "neg" : "zero"}`);
    arrowU.setAttribute("d", `M${X(0)} ${Y(0)}L${X(a)} ${Y(b)}${head(X(a), Y(b), a, -b)}`);
    arrowV.setAttribute("d", `M${X(0)} ${Y(0)}L${X(c)} ${Y(d)}${head(X(c), Y(d), c, -d)}`);
    placeHandle(hu, X(a), Y(b), `${v.a}, ${v.b}`, `(${fmt(v.a, 0)} ; ${fmt(v.b, 0)})`);
    placeHandle(hv, X(c), Y(d), `${v.c}, ${v.d}`, `(${fmt(v.c, 0)} ; ${fmt(v.d, 0)})`);
    nu.setAttribute("x", X(a) + 16);
    nu.setAttribute("y", Y(b) - 14);
    nv.setAttribute("x", X(c) + 16);
    nv.setAttribute("y", Y(d) - 14);
  }
  const spring = createSpring([v.a, v.b, v.c, v.d], draw, reduced);

  function summary() {
    const det = v.a * v.d - v.b * v.c;
    const wrap = (n) => (n < 0 ? `(${fmt(n, 0)})` : fmt(n, 0));
    const verdict = det === 0 ? t("Aire nulle : u et v sont colinéaires.", "Zero area: u and v are collinear.") : det > 0 ? t("Sens direct : déterminant positif.", "Counter-clockwise: positive determinant.") : t("Sens indirect : déterminant négatif.", "Clockwise: negative determinant.");
    const sum = root.querySelector("#det-sum");
    sum.innerHTML = `<span class="eq">det(<i>u</i>, <i>v</i>) = ${fmt(v.a, 0)} × ${fmt(v.d, 0)} ${MINUS} ${wrap(v.b)} × ${wrap(v.c)} = <strong class="${det > 0 ? "pos" : det < 0 ? "neg" : ""}">${fmt(det, 0)}</strong></span><span class="verdict">${verdict}</span>`;
    say(`det = ${fmt(det, 0)}. ${verdict}`);
  }
  function update() {
    spring.to([v.a, v.b, v.c, v.d]);
    summary();
  }
  const bound = (n) => clamp(Math.round(n), -5, 5);
  const bind = (handle, kx, ky) =>
    dragHandle(svg, handle, (px, py) => {
      v[kx] = bound((px - OX) / S);
      v[ky] = bound((OY - py) / S);
      update();
    });
  bind(hu, "a", "b");
  bind(hv, "c", "d");
  function nudge(which, dir, big) {
    const [kx] = which === "u" ? ["a", "b"] : ["c", "d"];
    v[kx] = bound(v[kx] + dir * (big ? 2 : 1));
    update();
  }
  spring.to([v.a, v.b, v.c, v.d], true);
  summary();
  return () => spring.stop();
}

/* ------------------------------------------------------------- unit circle */

export function mountCircle(root, { lang, reduced }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const fmt = makeFormat(lang);
  const W = 320, H = 300, R = 100, OX = 150, OY = 150;
  const state = { deg: 50 };

  root.innerHTML = `
    <svg class="toy-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Cercle trigonométrique", "Unit circle")}"></svg>
    <p class="toy-sum" id="cir-sum"></p>
    <p class="sr-only" id="cir-live" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  const grid = svgEl("g", { class: "toy-grid" }, svg);
  svgEl("line", { x1: 10, y1: OY, x2: W - 10, y2: OY, class: "axis" }, grid);
  svgEl("line", { x1: OX, y1: 10, x2: OX, y2: H - 10, class: "axis" }, grid);
  svgEl("circle", { cx: OX, cy: OY, r: R, class: "unit" }, svg);
  const arc = svgEl("path", { class: "arc" }, svg);
  const radius = svgEl("line", { class: "radius", x1: OX, y1: OY }, svg);
  const cosLine = svgEl("line", { class: "cos-line" }, svg);
  const sinLine = svgEl("line", { class: "sin-line" }, svg);
  const handle = makeHandle(svg, { cls: "hp", label: t("Point P sur le cercle (angle)", "Point P on the circle (angle)"), min: 0, max: 360, onKey: (dir, big) => turn(state.deg + dir * (big ? 45 : 15)) });
  const say = announce(root.querySelector("#cir-live"));
  let unwrapped = state.deg;

  function draw([deg]) {
    const r = (deg * Math.PI) / 180;
    const px = OX + R * Math.cos(r), py = OY - R * Math.sin(r);
    radius.setAttribute("x2", px);
    radius.setAttribute("y2", py);
    cosLine.setAttribute("x1", OX); cosLine.setAttribute("y1", OY); cosLine.setAttribute("x2", px); cosLine.setAttribute("y2", OY);
    sinLine.setAttribute("x1", px); sinLine.setAttribute("y1", OY); sinLine.setAttribute("x2", px); sinLine.setAttribute("y2", py);
    const sweep = Math.abs(deg) % 360 > 180 ? 1 : 0;
    const ar = 26;
    arc.setAttribute("d", `M${OX + ar} ${OY}A${ar} ${ar} 0 ${sweep} ${deg >= 0 ? 0 : 1} ${OX + ar * Math.cos(r)} ${OY - ar * Math.sin(r)}`);
    placeHandle(handle, px, py, Math.round(((deg % 360) + 360) % 360), `${fmt(((state.deg % 360) + 360) % 360, 0)}°`);
  }
  const spring = createSpring([state.deg], draw, reduced);
  function summary() {
    const deg = ((state.deg % 360) + 360) % 360;
    const r = (deg * Math.PI) / 180;
    root.querySelector("#cir-sum").innerHTML = `<span class="eq">θ = ${fmt(deg, 0)}°</span><span class="eq"><span class="cos">cos θ = ${fmt(Math.cos(r))}</span> <span class="sin">sin θ = ${fmt(Math.sin(r))}</span></span><span class="verdict">cos² θ + sin² θ = ${fmt(Math.cos(r) ** 2 + Math.sin(r) ** 2)}</span>`;
    say(`θ = ${fmt(deg, 0)}°, cos = ${fmt(Math.cos(r))}, sin = ${fmt(Math.sin(r))}.`);
  }
  function turn(deg) {
    state.deg = deg;
    spring.to([deg]);
    summary();
  }
  dragHandle(svg, handle, (px, py) => {
    const raw = (Math.atan2(OY - py, px - OX) * 180) / Math.PI;
    let target = snap(((raw % 360) + 360) % 360, 15);
    // Unwrap so the point takes the short way round at 0 / 360.
    const delta = ((target - unwrapped + 540) % 360) - 180;
    unwrapped += delta;
    turn(unwrapped);
  });
  spring.to([state.deg], true);
  summary();
  return () => spring.stop();
}

/* ------------------------------------------------------------ secant slope */

export function mountTangent(root, { lang, reduced }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const fmt = makeFormat(lang);
  const W = 320, H = 300, SX = 62, SY = 38, OX = 90, OY = 250;
  const X = (x) => OX + x * SX, Y = (y) => OY - y * SY;
  const f = (x) => x * x;
  const state = { h: 1.2 };

  root.innerHTML = `
    <svg class="toy-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Sécante qui devient tangente", "A secant turning into a tangent")}"></svg>
    <p class="toy-sum" id="tan-sum"></p>
    <p class="sr-only" id="tan-live" aria-live="polite"></p>`;
  const svg = root.querySelector("svg");
  const grid = svgEl("g", { class: "toy-grid" }, svg);
  svgEl("line", { x1: 8, y1: OY, x2: W - 8, y2: OY, class: "axis" }, grid);
  svgEl("line", { x1: OX, y1: 8, x2: OX, y2: H - 8, class: "axis" }, grid);
  const clip = svgEl("clipPath", { id: "tan-clip" }, svgEl("defs", {}, svg));
  svgEl("rect", { x: 0, y: 0, width: W, height: H }, clip);
  const plot = svgEl("g", { "clip-path": "url(#tan-clip)" }, svg);
  let d = "";
  for (let i = 0; i <= 80; i++) {
    const x = -1.4 + (i * 3.6) / 80;
    d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(f(x)).toFixed(1);
  }
  svgEl("path", { class: "curve", d }, plot);
  const tangent = svgEl("line", { class: "tangent" }, plot);
  const secant = svgEl("line", { class: "secant" }, plot);
  const pointA = svgEl("circle", { class: "fixed", cx: X(1), cy: Y(1), r: 6 }, svg);
  const handle = makeHandle(svg, { cls: "hq", label: t("Point Q sur la courbe (h)", "Point Q on the curve (h)"), min: -1.5, max: 1.5, onKey: (dir, big) => setH(state.h + dir * (big ? 0.5 : 0.1)) });
  const say = announce(root.querySelector("#tan-live"));
  const line = (el, slope) => {
    const x0 = -1.4, x1 = 2.2;
    el.setAttribute("x1", X(x0)); el.setAttribute("y1", Y(1 + slope * (x0 - 1)));
    el.setAttribute("x2", X(x1)); el.setAttribute("y2", Y(1 + slope * (x1 - 1)));
  };
  function draw([h]) {
    const slope = Math.abs(h) < 0.02 ? 2 : (f(1 + h) - 1) / h;
    line(secant, slope);
    line(tangent, 2);
    placeHandle(handle, X(1 + h), Y(f(1 + h)), fmt(state.h, 1), `h = ${fmt(state.h, 1)}`);
  }
  const spring = createSpring([state.h], draw, reduced);
  function summary() {
    const h = state.h;
    const zero = Math.abs(h) < 1e-9;
    const slope = zero ? 2 : 2 + h;
    root.querySelector("#tan-sum").innerHTML = zero
      ? `<span class="eq">h = 0</span><span class="verdict">${t("La sécante devient la tangente : pente 2.", "The secant has become the tangent: slope 2.")}</span>`
      : `<span class="eq">h = ${fmt(h, 1)}</span><span class="eq">${t("pente de la sécante", "secant slope")} = (<i>f</i>(1 + <i>h</i>) ${MINUS} <i>f</i>(1)) / <i>h</i> = <strong>${fmt(slope, 2)}</strong></span><span class="verdict">${t("Quand h se rapproche de 0, la pente se rapproche de 2.", "As h gets closer to 0, the slope gets closer to 2.")}</span>`;
    say(zero ? t("h égal 0, pente 2.", "h equals 0, slope 2.") : `h = ${fmt(h, 1)}, ${t("pente", "slope")} ${fmt(slope, 2)}.`);
  }
  function setH(value) {
    state.h = clamp(snap(value, 0.1), -1.5, 1.5);
    spring.to([state.h]);
    summary();
  }
  dragHandle(svg, handle, (px) => setH((px - OX) / SX - 1));
  spring.to([state.h], true);
  summary();
  return () => spring.stop();
}
