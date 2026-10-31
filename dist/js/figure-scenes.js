// The five figures of the home slideshow. Each scene is a plain object that owns its state and describes itself to the
// engine (figure-engine.js): title, legend, view (world box to fit), axes, hint, animating(), tick(dt, t), settle(k),
// draw(V), handles(), grab(k), drag(...), nudge(...), fields(), touch(). No DOM here: everything mathematical is testable
// (tests/figure-scenes.test.mjs). Colour is notation: the same colour marks a quantity in the figure, the legend and the
// numbers under it (red = q1, ink = q2, grey = q3; see "Design v6" in pages.css).
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const span = (cls, text) => `<span class="${cls}">${text}</span>`;
const R = (t) => span('cr', t), B = (t) => span('cb', t), Y = (t) => span('cy', t);

// Number formatting: decimal comma in French, point in English, true minus sign, honest ≈ / =.
export function makeFormat(L) {
  const fmt = (n, d = 2) => { const q = 10 ** d, v = Math.round(n * q) / q; let s = String(Object.is(v, -0) ? 0 : v); if (L === 0) s = s.replace('.', ','); return s.replace('-', '−'); };
  const approx = (n) => (Math.abs(Math.round(n * 100) / 100 - n) < 1e-9 ? '=' : '≈');
  return { fmt, approx };
}

/* --- parabola: f(x) = a(x − α)² + β. Three kinds of handle: the vertex, a free point of the curve (it sets a), the roots --- */
export function makeParabola(L, o = {}) {
  const P = (fr, en) => (L === 0 ? fr : en), { fmt, approx } = makeFormat(L);
  const S = { al: 0, be: -2, a: 1, dx: 1.5 }, sh = { ...S }; let touched = !o.drift;
  const f = (x) => sh.a * (x - sh.al) ** 2 + sh.be;
  const magnet = (v, V, on) => { if (!on) return v; const r = Math.round(v); return Math.abs(v - r) * V.s() < 7 ? r : v; };
  const forms = () => {
    const { al, be, a } = S, b = -2 * a * al, c = a * al * al + be, d = b * b - 4 * a * c, z = (v) => Math.abs(v) < 5e-3;
    const lead = z(a - 1) ? '' : z(a + 1) ? R('−') : R(fmt(a)), lead0 = z(a - 1) ? '' : z(a + 1) ? '−' : fmt(a);
    const sq = z(al) ? 'x²' : '(x ' + (al > 0 ? '−' : '+') + ' ' + B(fmt(Math.abs(al))) + ')²';
    const canon = 'f(x) = ' + lead + sq + (z(be) ? '' : ' ' + Y((be < 0 ? '− ' : '+ ') + fmt(Math.abs(be))));
    const sg = (v) => (v < 0 ? ' − ' : ' + ') + fmt(Math.abs(v));
    const dev = 'f(x) = ' + lead0 + 'x²' + (z(b) ? '' : sg(b) + 'x') + (z(c) ? '' : sg(c));
    const real = -be / a >= -1e-9, r = real ? Math.sqrt(Math.max(0, -be / a)) : 0, count = !real ? 0 : r < 1e-4 ? 1 : 2;
    const roots = count === 0 ? P('aucune racine réelle', 'no real root') : count === 1 ? 'x = ' + fmt(al) : `x₁ ${approx(al - r)} ${fmt(al - r)} ; x₂ ${approx(al + r)} ${fmt(al + r)}`;
    return { canon, dev, delta: fmt(d), roots, count, a, b, c, d };
  };
  return {
    state: S, forms,
    title: P('La parabole', 'The parabola'),
    legend: `${R('a')} ${P('ouverture', 'opening')} · ${B('α')} ${P('position du sommet', 'vertex position')} · ${Y('β')} ${P('hauteur du sommet', 'vertex height')}`,
    view: { x0: -6.5, x1: 6.5, y0: -4.6, y1: 5 }, axes: true,
    hint: P('glisse les points · les ronds blancs sont les racines · Ctrl + molette pour zoomer', 'drag the points · white circles are the roots · Ctrl + wheel to zoom'),
    touch() { touched = true; }, animating: (reduced) => !touched && !reduced,
    tick(dt, t) { S.al = 0.9 * Math.sin(t * 0.33); S.be = -2 + 0.7 * Math.sin(t * 0.27 + 1); S.a = 1 + 0.4 * Math.sin(t * 0.21); },
    settle(k, dragging) { let m = false; for (const key of ['al', 'be', 'a', 'dx']) { const d = S[key] - sh[key]; if (Math.abs(d) > 1e-5) { sh[key] += d * k(dragging ? 42 : 14); m = true; } else sh[key] = S[key]; } return m; },
    handles() {
      const r2 = -sh.be / sh.a, out = [{ k: 'V', x: sh.al, y: sh.be, c: 'q2' }, { k: 'P', x: sh.al + sh.dx, y: f(sh.al + sh.dx), c: 'q1' }];
      if (r2 >= 0) { const r = Math.sqrt(r2); out.push({ k: 'R1', x: sh.al - r, y: 0, root: true, t: fmt(sh.al - r) }, { k: 'R2', x: sh.al + r, y: 0, root: true, t: fmt(sh.al + r) }); }
      return out;
    },
    grab(k) { const r = Math.sqrt(Math.max(0, -S.be / S.a)); return k === 'R1' ? S.al + r : S.al - r; },
    drag(k, wx, wy, other, snap, V) {
      if (k === 'V') { S.al = clamp(magnet(wx, V, snap), -40, 40); S.be = clamp(magnet(wy, V, snap), -40, 40); }
      else if (k === 'P') {
        let dx = wx - S.al; if (Math.abs(dx) < 0.3) dx = (S.dx < 0 ? -1 : 1) * 0.3;
        let a = (wy - S.be) / (dx * dx); if (Math.abs(a) < 0.05) a = (S.a < 0 ? -1 : 1) * 0.05; a = clamp(a, -8, 8);
        const q = Math.round(a * 2) / 2; if (snap && Math.abs(a - q) < 0.035 && q !== 0) a = q;
        S.dx = dx; S.a = a;
      } else { const nx = magnet(wx, V, snap), half = (other - nx) / 2; S.al = (nx + other) / 2; S.be = -S.a * half * half; }
    },
    nudge(k, dx, dy, V) { const r = Math.sqrt(Math.max(0, -S.be / S.a)), p = k === 'V' ? [S.al, S.be] : k === 'P' ? [S.al + S.dx, S.a * S.dx * S.dx + S.be] : [k === 'R1' ? S.al - r : S.al + r, 0]; this.drag(k, p[0] + dx, p[1] + dy, this.grab(k), false, V); },
    say(k) { return k === 'V' ? P(`Sommet en ${fmt(S.al)} ; ${fmt(S.be)}`, `Vertex at ${fmt(S.al)}, ${fmt(S.be)}`) : k === 'P' ? `a = ${fmt(S.a)}` : P(`Racine en ${fmt(S.al)}`, `Root at ${fmt(S.al)}`); },
    names: [P('Sommet', 'Vertex'), P('Point sur la courbe', 'Point on the curve'), P('Première racine', 'First root'), P('Seconde racine', 'Second root')],
    fields() { const g = forms(); return [[P('Forme canonique', 'Vertex form'), g.canon], [P('Forme développée', 'Expanded form'), g.dev], [P('Discriminant Δ', 'Discriminant Δ'), g.delta], [P('Racines', 'Roots'), g.roots], [P('Variations', 'Variation'), g.a > 0 ? '↘ → ↗' : '↗ → ↘']]; },
    draw(V) {
      const { g, C } = V, seg = (x1, y1, x2, y2, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'butt'; g.beginPath(); g.moveTo(V.X(x1), V.Y(y1)); g.lineTo(V.X(x2), V.Y(y2)); g.stroke(); };
      g.setLineDash([2, 5]); g.strokeStyle = C.ink2; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(V.X(sh.al)) + 0.5, 0); g.lineTo(Math.round(V.X(sh.al)) + 0.5, V.H); g.stroke(); g.setLineDash([]);
      seg(0, 0, sh.al, 0, C.q2, 6); seg(0, 0, 0, sh.be, C.q3, 6);
      g.setLineDash([2, 5]); g.strokeStyle = C.ink2; g.lineWidth = 1; g.beginPath(); g.moveTo(V.X(0), V.Y(sh.be)); g.lineTo(V.X(sh.al), V.Y(sh.be)); g.stroke(); g.setLineDash([]);
      V.curve(f, V.left - 1, V.right + 1, C.ink, 2.4);
      if (V.ptr && !V.drag && !V.hov && !V.ptr.touch) {
        const x = V.ux(V.ptr.x), y = f(x), m = 2 * sh.a * (x - sh.al), px = V.X(x), py = V.Y(y);
        if (py > -50 && py < V.H + 50) { V.tangent(px, py, m); V.tip(px, py, `x = ${fmt(x)}   f(x) = ${fmt(y)}   f′(x) = ${fmt(m)}`); }
      }
    },
    labelV: () => `S(${fmt(sh.al)} ; ${fmt(sh.be)})`, below: () => sh.a > 0,
  };
}

/* --- unit circle: cosine (ink) and sine (red), the angle in grey --- */
export function makeCircle(L) {
  const P = (fr, en) => (L === 0 ? fr : en), { fmt } = makeFormat(L), PI = Math.PI;
  const r = 1.5, cx = -3.0, x0 = -0.9, kx = 0.82; let th = 0.9, ths = th, touched = false;
  const norm = (a) => ((a % TAU) + TAU) % TAU;
  return {
    state: { get theta() { return th; }, set theta(v) { th = v; ths = v; } },
    title: P('Le cercle trigonométrique', 'The unit circle'), legend: `${B('cos θ')} · ${R('sin θ')} · ${Y('θ')} ${P('angle', 'angle')}`,
    view: { x0: -4.7, x1: 5.5, y0: -2.1, y1: 2.1 }, axes: false, hint: P('fais tourner le point · les angles remarquables l’attirent', 'turn the point · the special angles attract it'),
    touch() { touched = true; }, animating: (reduced) => !touched && !reduced, tick(dt) { th += dt * 0.55; },
    settle(k) { const d = th - ths; if (Math.abs(d) > 1e-4) { ths += d * k(16); return true; } ths = th; return false; },
    handles: () => [{ k: 'P', x: cx + r * Math.cos(ths), y: r * Math.sin(ths), c: 'q3' }], grab: () => 0,
    drag(k, wx, wy, _o, snap) { let a = Math.atan2(wy, wx - cx); a += TAU * Math.round((th - a) / TAU); if (snap) { const q = Math.round(a / (PI / 6)) * PI / 6; if (Math.abs(a - q) < 0.05) a = q; } th = a; },
    nudge(k, dx, dy) { th += dy - dx; }, say: () => P(`Angle ${fmt(norm(th) * 180 / PI, 0)} degrés`, `Angle ${fmt(norm(th) * 180 / PI, 0)} degrees`), names: [P('Point P', 'Point P')],
    fields() { const a = norm(ths); return [[P('Angle θ', 'Angle θ'), Y(fmt(a * 180 / PI, 0) + '°') + ' = ' + fmt(a) + ' rad'], ['cos θ', B(fmt(Math.cos(a), 3))], ['sin θ', R(fmt(Math.sin(a), 3))], ['cos² θ + sin² θ', fmt(Math.cos(a) ** 2 + Math.sin(a) ** 2, 3)]]; },
    draw(V) {
      const { g, C } = V, a = norm(ths), px = cx + r * Math.cos(a), py = r * Math.sin(a), wx = x0 + a * kx;
      const line = (x1, y1, x2, y2, col, w = 1, dash) => { g.setLineDash(dash || []); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'butt'; g.beginPath(); g.moveTo(V.X(x1), V.Y(y1)); g.lineTo(V.X(x2), V.Y(y2)); g.stroke(); g.setLineDash([]); };
      g.fillStyle = C.q3; g.beginPath(); g.moveTo(V.X(cx), V.Y(0)); g.arc(V.X(cx), V.Y(0), 0.55 * V.s(), 0, -a, true); g.closePath(); g.fill();
      line(cx - r - 0.4, 0, cx + r + 0.4, 0, C.ink2, 1); line(cx, -r - 0.4, cx, r + 0.4, C.ink2, 1); line(x0, 0, x0 + TAU * kx + 0.3, 0, C.ink2, 1);
      g.strokeStyle = C.ink; g.lineWidth = 1.8; g.beginPath(); g.arc(V.X(cx), V.Y(0), r * V.s(), 0, TAU); g.stroke();
      g.font = '13px "STIX Two Text", serif'; g.fillStyle = C.ink2; g.textAlign = 'center'; g.textBaseline = 'top';
      [[PI / 2, 'π/2'], [PI, 'π'], [3 * PI / 2, '3π/2'], [TAU, '2π']].forEach(([v, t]) => { line(x0 + v * kx, -0.06, x0 + v * kx, 0.06, C.ink, 1); g.fillText(t, V.X(x0 + v * kx), V.Y(0) + 8); });
      g.globalAlpha = 0.28; V.curve((x) => r * Math.sin((x - x0) / kx), x0, x0 + TAU * kx, C.ink, 1.4); g.globalAlpha = 1;
      V.curve((x) => r * Math.sin((x - x0) / kx), x0, x0 + a * kx, C.q1, 3);
      line(cx, 0, px, py, C.ink, 1.8); line(cx, 0, px, 0, C.q2, 5); line(px, 0, px, py, C.q1, 5);
      line(px, py, wx, py, C.ink2, 1, [2, 5]);
      g.fillStyle = C.q1; g.beginPath(); g.arc(V.X(wx), V.Y(py), 5, 0, TAU); g.fill();
    },
  };
}

/* --- secant (red) becoming tangent (ink) on sin, h in grey --- */
export function makeTangent(L) {
  const P = (fr, en) => (L === 0 ? fr : en), { fmt } = makeFormat(L), f = Math.sin, df = Math.cos;
  let x0 = 0.7, h = 2, touched = false, x0s = x0, hs = h;
  return {
    state: { get x0() { return x0; }, set x0(v) { x0 = v; x0s = v; }, get h() { return h; }, set h(v) { h = v; hs = v; } },
    title: P('De la sécante à la tangente', 'From secant to tangent'), legend: `${R(P('sécante', 'secant'))} · ${B(P('tangente', 'tangent'))} · ${Y('h')} ${P('écart entre A et B', 'gap between A and B')}`,
    view: { x0: -6.6, x1: 6.6, y0: -2.2, y1: 2.2 }, axes: true, hint: P('déplace A ou B · quand h tend vers 0, la sécante devient la tangente', 'move A or B · as h tends to 0, the secant becomes the tangent'),
    touch() { touched = true; }, animating: (reduced) => !touched && !reduced, tick(dt, t) { h = 0.04 + 2.4 * (0.5 + 0.5 * Math.cos(t * 0.7)) ** 2; },
    settle(k) { let m = false; const a = x0 - x0s, b = h - hs; if (Math.abs(a) > 1e-5 || Math.abs(b) > 1e-5) { x0s += a * k(16); hs += b * k(16); m = true; } else { x0s = x0; hs = h; } return m; },
    handles: () => [{ k: 'A', x: x0s, y: f(x0s), c: 'q2' }, { k: 'B', x: x0s + hs, y: f(x0s + hs), c: 'q1' }], grab: () => 0,
    drag(k, wx) { if (k === 'A') x0 = clamp(wx, -5.5, 5.5); else { let d = clamp(wx - x0, -4, 4); if (Math.abs(d) < 0.02) d = (h < 0 ? -1 : 1) * 0.02; h = d; } },
    nudge(k, dx) { this.drag(k, (k === 'A' ? x0 : x0 + h) + dx); }, say: () => `x₀ = ${fmt(x0)} ; h = ${fmt(h)}`, names: [P('Point A', 'Point A'), P('Point B', 'Point B')],
    fields() { const m = (f(x0s + hs) - f(x0s)) / hs; return [[P('Point A : x₀', 'Point A: x₀'), fmt(x0s)], [P('Écart h', 'Gap h'), Y(fmt(hs, 3))], [P('Pente de la sécante', 'Slope of the secant'), R(fmt(m, 4))], ['f′(x₀) = cos x₀', B(fmt(df(x0s), 4))], [P('Différence', 'Difference'), fmt(m - df(x0s), 4)]]; },
    draw(V) {
      const { g, C } = V, ax = x0s, bx = x0s + hs, ay = f(ax), by = f(bx), m = (by - ay) / hs;
      const Ln = (x, y, slope, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'butt'; g.beginPath(); g.moveTo(V.X(V.left - 1), V.Y(y + slope * (V.left - 1 - x))); g.lineTo(V.X(V.right + 1), V.Y(y + slope * (V.right + 1 - x))); g.stroke(); };
      Ln(ax, ay, df(ax), C.q2, 2); Ln(ax, ay, m, C.q1, 2);
      V.curve(f, V.left - 1, V.right + 1, C.ink, 2.4);
      g.strokeStyle = C.q3; g.lineWidth = 6; g.lineCap = 'butt'; g.beginPath(); g.moveTo(V.X(ax), V.Y(ay)); g.lineTo(V.X(bx), V.Y(ay)); g.stroke();
      g.strokeStyle = C.q1; g.lineWidth = 6; g.beginPath(); g.moveTo(V.X(bx), V.Y(ay)); g.lineTo(V.X(bx), V.Y(by)); g.stroke();
      g.font = 'italic 14px "STIX Two Text", serif'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('h', V.X((ax + bx) / 2), V.Y(ay) + 8);
      g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Δy', V.X(bx) + 10, V.Y((ay + by) / 2));
    },
    labels: { A: 'A', B: 'B' },
  };
}

// Left Riemann sum of x² on [0, b] with n rectangles, and its exact counterpart b³/3.
export const leftSum = (b, n) => { const w = b / n; let s = 0; for (let i = 0; i < n; i++) s += (i * w) ** 2 * w; return s; };

/* --- left Riemann sum of x² on [0, b]: the part of the area not covered is the error (red) --- */
export function makeRiemann(L) {
  const P = (fr, en) => (L === 0 ? fr : en), { fmt } = makeFormat(L), f = (x) => x * x;
  let b = 2, n = 1, touched = false, bs = b, ns = n;
  return {
    state: { get b() { return b; }, get n() { return n; }, set n(v) { n = v; ns = v; }, set b(v) { b = v; bs = v; } },
    title: P('L’aire sous une parabole', 'The area under a parabola'), legend: `${B(P('somme des rectangles', 'sum of the rectangles'))} · ${R(P('aire non couverte', 'area not covered'))}`,
    view: { x0: -0.9, x1: 4.0, y0: -0.9, y1: 9.6 }, axes: true, hint: P('déplace la borne ou la largeur d’un rectangle', 'move the bound or the width of a rectangle'),
    touch() { touched = true; }, animating: (reduced) => !touched && !reduced, tick(dt, t) { n = 1 + Math.round(39 * (0.5 - 0.5 * Math.cos(t * 0.45))); },
    settle(k) { const d = b - bs; let m = false; if (Math.abs(d) > 1e-5) { bs += d * k(16); m = true; } else bs = b; ns = n; return m; },
    handles: () => [{ k: 'B', x: bs, y: f(bs), c: 'q3' }, { k: 'W', x: bs / ns, y: 0, c: 'q2' }], grab: () => 0,
    drag(k, wx) { if (k === 'B') b = clamp(wx, 0.5, 3.2); else { const w = clamp(wx, b / 80, b); n = clamp(Math.round(b / w), 1, 80); } },
    nudge(k, dx) { this.drag(k, k === 'B' ? b + dx : b / n + dx * 0.2); }, say: () => `b = ${fmt(b)} ; n = ${n}`, names: [P('Borne b', 'Bound b'), P('Largeur', 'Width')],
    fields() { const w = bs / ns, s = leftSum(bs, ns), ex = bs ** 3 / 3; return [[P('Rectangles n', 'Rectangles n'), String(ns)], [P('Largeur b / n', 'Width b / n'), fmt(w, 3)], [P('Somme gauche', 'Left sum'), B(fmt(s, 3))], [P('Aire exacte b³ / 3', 'Exact area b³ / 3'), fmt(ex, 3)], [P('Écart', 'Gap'), R(fmt(ex - s, 3))]]; },
    draw(V) {
      const { g, C } = V, w = bs / ns;
      g.fillStyle = C.q1; g.beginPath(); g.moveTo(V.X(0), V.Y(0)); for (let px = V.X(0); px <= V.X(bs); px += 2) g.lineTo(px, V.Y(f(V.ux(px)))); g.lineTo(V.X(bs), V.Y(f(bs))); g.lineTo(V.X(bs), V.Y(0)); g.closePath(); g.fill();
      for (let i = 0; i < ns; i++) { const x = i * w, hgt = f(x); if (hgt <= 0) continue; g.fillStyle = C.q2; g.fillRect(V.X(x), V.Y(hgt), w * V.s(), hgt * V.s()); g.strokeStyle = C.paper; g.lineWidth = ns > 30 ? 0.6 : 1.5; g.strokeRect(V.X(x), V.Y(hgt), w * V.s(), hgt * V.s()); }
      V.curve(f, V.left - 1, V.right + 1, C.ink, 2.4);
    },
  };
}

// Orbit of the logistic map u(n+1) = r u(n) (1 − u(n)) and the behaviour it settles into (thresholds: 3, 1 + √6, 3.5441, 3.5699).
export const logisticOrbit = (r, u0, N) => { const o = [u0]; for (let i = 0; i < N; i++) o.push(r * o[i] * (1 - o[i])); return o; };
export const logisticRegime = (r) => (r < 3 ? 'fixed' : r < 1 + Math.sqrt(6) ? 'period2' : r < 3.5441 ? 'period4' : r < 3.5699 ? 'period8' : 'chaos');

/* --- logistic cobweb --- */
export function makeCobweb(L) {
  const P = (fr, en) => (L === 0 ? fr : en), { fmt } = makeFormat(L);
  let r = 3.0, u0 = 0.2, touched = false, rs = r, us = u0;
  const regimes = { fixed: P('converge vers un point fixe', 'converges to a fixed point'), period2: P('cycle de période 2', 'cycle of period 2'), period4: P('cycle de période 4', 'cycle of period 4'), period8: P('période 8 ou plus', 'period 8 or more'), chaos: P('chaos, ou fenêtre périodique', 'chaos, or a periodic window') };
  return {
    state: { get r() { return r; }, set r(v) { r = v; rs = v; }, set u0(v) { u0 = v; us = v; } },
    title: P('La suite logistique', 'The logistic sequence'), legend: `${R(P('trajectoire', 'trajectory'))} · ${B('u₀')} ${P('départ', 'start')} · ${Y('r')} ${P('paramètre', 'parameter')}`,
    view: { x0: -0.35, x1: 1.35, y0: -0.2, y1: 1.1 }, axes: true, hint: P('tire le sommet de la courbe · déplace u₀', 'pull the top of the curve · move u₀'),
    touch() { touched = true; }, animating: (reduced) => !touched && !reduced, tick(dt, t) { r = 3.0 + 0.9 * (0.5 - 0.5 * Math.cos(t * 0.22)); },
    settle(k) { let m = false; const a = r - rs, b = u0 - us; if (Math.abs(a) > 1e-5 || Math.abs(b) > 1e-5) { rs += a * k(14); us += b * k(14); m = true; } else { rs = r; us = u0; } return m; },
    handles: () => [{ k: 'R', x: 0.5, y: rs / 4, c: 'q3' }, { k: 'U', x: us, y: 0, c: 'q2' }], grab: () => 0,
    drag(k, wx, wy) { if (k === 'R') r = clamp(wy * 4, 2.5, 4); else u0 = clamp(wx, 0.02, 0.98); },
    nudge(k, dx, dy) { if (k === 'R') r = clamp(r + dy, 2.5, 4); else u0 = clamp(u0 + dx, 0.02, 0.98); }, say: () => `r = ${fmt(r, 3)}`, names: [P('Paramètre r', 'Parameter r'), P('Valeur u₀', 'Value u₀')],
    fields() { const o = logisticOrbit(rs, us, 60); return [[P('Paramètre r', 'Parameter r'), Y(fmt(rs, 3))], [P('Valeur de départ u₀', 'Start value u₀'), B(fmt(us, 3))], ['u₅₈ ; u₅₉ ; u₆₀', o.slice(58).map((v) => fmt(v, 3)).join(' ; ')], [P('Comportement', 'Behaviour'), regimes[logisticRegime(rs)]]]; },
    draw(V) {
      const { g, C } = V, f = (x) => rs * x * (1 - x), o = logisticOrbit(rs, us, 60);
      g.strokeStyle = C.ink2; g.lineWidth = 1; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(V.X(-0.2), V.Y(-0.2)); g.lineTo(V.X(1.2), V.Y(1.2)); g.stroke(); g.setLineDash([]);
      let x = o[0], y = 0; const N = o.length;
      for (let i = 0; i < N - 1; i++) { const nx = o[i], ny = o[i + 1]; g.strokeStyle = C.q1; g.globalAlpha = 0.25 + 0.6 * (i / N); g.lineWidth = 1.3; g.lineCap = 'butt'; g.beginPath(); g.moveTo(V.X(x), V.Y(y)); g.lineTo(V.X(nx), V.Y(ny)); g.lineTo(V.X(ny), V.Y(ny)); g.stroke(); x = ny; y = ny; }
      g.globalAlpha = 1; V.curve(f, 0, 1, C.ink, 2.4);
      g.fillStyle = C.q2; g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath(); g.arc(V.X(x), V.Y(y), 4.5, 0, TAU); g.fill(); g.stroke();
    },
  };
}

// The slides of the home page, in order: scene maker, and the texts (fr, en).
export const SLIDES = [
  { id: 'parabola', make: (L) => makeParabola(L, { drift: true }), tab: ['La parabole', 'The parabola'], text: ['Chaque chapitre commence par une figure que tu déplaces. La règle vient après, avec les nombres sous les yeux.', 'Every chapter starts with a figure you move. The rule comes after, with the numbers in front of you.'] },
  { id: 'circle', make: makeCircle, tab: ['Le cercle', 'The circle'], text: ['Fais tourner le point P : cosinus et sinus se dessinent, et ne dépassent jamais le rayon.', 'Turn the point P: cosine and sine are drawn, and never exceed the radius.'] },
  { id: 'tangent', make: makeTangent, tab: ['La tangente', 'The tangent'], text: ['Rapproche les deux points : la pente de la sécante tend vers la dérivée.', 'Bring the two points together: the slope of the secant tends to the derivative.'] },
  { id: 'area', make: makeRiemann, tab: ['L’aire', 'The area'], text: ['Plus il y a de rectangles, plus la somme se rapproche de l’aire exacte. Ce qui reste en rouge est l’erreur.', 'The more rectangles, the closer the sum gets to the exact area. What is left in red is the error.'] },
  { id: 'sequence', make: makeCobweb, tab: ['Les suites', 'Sequences'], text: ['Fais varier r : la suite se stabilise, oscille, puis ne se répète plus.', 'Change r: the sequence settles, oscillates, then stops repeating.'] },
];
