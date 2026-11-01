// Small interactive figures of the Olympiad strategies (site/js/olympiad.js): nearest neighbours (extremal principle),
// the inscribed angle (angle chasing), rectangle and square of the same perimeter (inequalities). Every figure is
// dragged with the mouse or a finger, and arrow keys move the selected handle (H picks the next one). Pure geometry in
// the model functions, which tests/olympiad.test.mjs checks without a DOM.
import { canvasIn, palette } from './object-kit.js';

// ---- models (pure)
export function nearest(points) {
  // index of the nearest other point, for each point (distances assumed distinct)
  return points.map((p, i) => { let best = -1, d = Infinity; points.forEach((q, j) => { if (j === i) return; const e = Math.hypot(p[0] - q[0], p[1] - q[1]); if (e < d) { d = e; best = j; } }); return best; });
}
export function untargeted(points) { const t = nearest(points), hit = new Set(t); return points.map((_, i) => i).filter((i) => !hit.has(i)); }
export const angleAt = (m, a, b) => { const u = [a[0] - m[0], a[1] - m[1]], v = [b[0] - m[0], b[1] - m[1]]; return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))); };
export const rectangle = (perimeter, width) => { const h = perimeter / 2 - width; return { w: width, h, area: width * h, square: (perimeter / 4) ** 2 }; };

const fmt = (x, d, en) => { const s = (Math.round(x * 10 ** d) / 10 ** d).toFixed(d); return en ? s : s.replace('.', ','); };
const deg = (r) => (r * 180) / Math.PI;

// ---- the figures
export function mountWidget(kind, host, lang) {
  const en = lang === 'en', T = (fr, e) => (en ? e : fr);
  const o = canvasIn(host, kind === 'amgm' ? 16 / 9 : 4 / 3, { navigation: false });
  const read = document.createElement('p'); read.className = 'olymp-readout'; read.setAttribute('aria-live', 'polite'); host.after(read);
  let handles = [], drag = -1, selected = 0;
  const state = {
    nearest: { pts: [[140, 120], [260, 90], [330, 230], [470, 150], [520, 320], [200, 330], [380, 380]] },
    inscribed: { t: 2.1, a: 3.6, b: 5.8 },     // angles on the circle of M, A, B
    amgm: { w: 7 },                             // perimeter 20
  }[kind];
  const C = { x: 320, y: 240, r: 170 };
  const onCircle = (t) => [C.x + C.r * Math.cos(t), C.y - C.r * Math.sin(t)];
  function draw() {
    const p = palette(), g = o.g; g.clearRect(0, 0, o.W, o.H); g.lineWidth = 2; g.font = '15px system-ui, sans-serif';
    const dot = (x, y, col, label) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); if (label) { g.fillStyle = p.ink; g.fillText(label, x + 10, y - 10); } };
    if (kind === 'nearest') {
      const pts = state.pts, t = nearest(pts), dry = new Set(untargeted(pts));
      pts.forEach((a, i) => { const b = pts[t[i]], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]) - 10;
        g.strokeStyle = t[t[i]] === i ? p.accent : p.muted; g.beginPath(); g.moveTo(a[0], a[1]); const e = [a[0] + L * Math.cos(ang), a[1] + L * Math.sin(ang)]; g.lineTo(...e); g.stroke();
        g.beginPath(); g.moveTo(...e); g.lineTo(e[0] - 10 * Math.cos(ang - 0.4), e[1] - 10 * Math.sin(ang - 0.4)); g.lineTo(e[0] - 10 * Math.cos(ang + 0.4), e[1] - 10 * Math.sin(ang + 0.4)); g.closePath(); g.fillStyle = g.strokeStyle; g.fill(); });
      pts.forEach((a, i) => dot(a[0], a[1], dry.has(i) ? p.pos : p.ink));
      handles = pts.map((a) => ({ get: () => a, set: (x, y) => { a[0] = Math.max(10, Math.min(o.W - 10, x)); a[1] = Math.max(10, Math.min(o.H - 10, y)); } }));
      read.textContent = T(`${pts.length} personnes. Les flèches orange relient les paires qui se visent mutuellement ; en vert, ${dry.size} personne${dry.size > 1 ? 's' : ''} que personne ne vise.`,
        `${pts.length} people. Orange arrows join pairs that target each other; in green, ${dry.size} ${dry.size > 1 ? 'people' : 'person'} nobody targets.`);
    } else if (kind === 'inscribed') {
      const M = onCircle(state.t), A = onCircle(state.a), B = onCircle(state.b), O = [C.x, C.y];
      g.strokeStyle = p.line; g.beginPath(); g.arc(C.x, C.y, C.r, 0, 7); g.stroke();
      g.strokeStyle = p.accent; g.beginPath(); g.moveTo(...A); g.lineTo(...M); g.lineTo(...B); g.stroke();
      g.strokeStyle = p.obj2; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(...A); g.lineTo(...O); g.lineTo(...B); g.stroke(); g.setLineDash([]);
      dot(...A, p.ink, 'A'); dot(...B, p.ink, 'B'); dot(...M, p.accent, 'M'); dot(...O, p.obj2, 'O');
      const inscribed = deg(angleAt(M, A, B)), central = deg(angleAt(O, A, B));
      handles = [['t', M], ['a', A], ['b', B]].map(([k]) => ({ get: () => onCircle(state[k]), set: (x, y) => { state[k] = Math.atan2(C.y - y, x - C.x); } }));
      read.textContent = T(`Angle inscrit AMB : ${fmt(inscribed, 1, en)}°. Angle au centre AOB : ${fmt(central, 1, en)}°. Déplacez M : tant qu’il reste sur le même arc, l’angle ne bouge pas, et il vaut la moitié de l’angle au centre (ou son supplément de l’autre côté).`,
        `Inscribed angle AMB: ${fmt(inscribed, 1, en)}°. Central angle AOB: ${fmt(central, 1, en)}°. Move M: while it stays on the same arc the angle does not change, and it is half the central angle (or its supplement on the other side).`);
    } else {
      const P = 20, r = rectangle(P, state.w), k = 26, x0 = 60, y0 = o.H - 40;
      g.fillStyle = p.accent; g.strokeStyle = p.accent; g.globalAlpha = 0.2; g.fillRect(x0, y0 - r.h * k, r.w * k, r.h * k); g.globalAlpha = 1; g.strokeRect(x0, y0 - r.h * k, r.w * k, r.h * k);
      const s = P / 4, x1 = o.W - 60 - s * k; g.strokeStyle = p.obj2; g.setLineDash([6, 5]); g.strokeRect(x1, y0 - s * k, s * k, s * k); g.setLineDash([]);
      dot(x0 + r.w * k, y0 - r.h * k, p.accent);
      g.fillStyle = p.ink; g.fillText(`${fmt(r.w, 1, en)} × ${fmt(r.h, 1, en)}`, x0, y0 + 24); g.fillText(T('carré 5 × 5', 'square 5 × 5'), x1, y0 + 24);
      handles = [{ get: () => [x0 + state.w * k, y0 - (P / 2 - state.w) * k], set: (x) => { state.w = Math.max(0.5, Math.min(9.5, Math.round(((x - x0) / k) * 10) / 10)); } }];
      read.textContent = T(`Périmètre 20. Rectangle ${fmt(r.w, 1, en)} sur ${fmt(r.h, 1, en)} : aire ${fmt(r.area, 2, en)}, au plus ${fmt(r.square, 0, en)}, l’aire du carré. Écart : ${fmt(r.square - r.area, 2, en)} = (largeur - 5)².`,
        `Perimeter 20. Rectangle ${fmt(r.w, 1, en)} by ${fmt(r.h, 1, en)}: area ${fmt(r.area, 2, en)}, at most ${fmt(r.square, 0, en)}, the square’s area. Gap: ${fmt(r.square - r.area, 2, en)} = (width - 5)².`);
    }
  }
  o.redraw = draw;
  const hit = ([x, y]) => handles.findIndex((h) => { const [a, b] = h.get(); return Math.hypot(a - x, b - y) < 22; });
  const down = (e) => { drag = hit(o.point(e)); if (drag >= 0) { selected = drag; o.cv.setPointerCapture(e.pointerId); e.preventDefault(); } };
  const move = (e) => { if (drag < 0) return; const [x, y] = o.point(e); handles[drag].set(x, y); draw(); };
  const up = () => { drag = -1; };
  const key = (e) => {
    if (e.key === 'h' || e.key === 'H') { selected = (selected + 1) % handles.length; e.preventDefault(); return; }
    const d = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[e.key]; if (!d || !handles[selected]) return;
    const [x, y] = handles[selected].get(); handles[selected].set(x + d[0], y + d[1]); draw(); e.preventDefault();
  };
  o.cv.tabIndex = 0; o.cv.setAttribute('role', 'img');
  o.cv.setAttribute('aria-label', T('Figure interactive : faites glisser les points, ou H puis les flèches au clavier.', 'Interactive figure: drag the points, or H then the arrow keys.'));
  o.cv.addEventListener('pointerdown', down); o.cv.addEventListener('pointermove', move); o.cv.addEventListener('pointerup', up); o.cv.addEventListener('keydown', key);
  o.touchHit((pt) => hit(pt) >= 0);
  draw();
  return { destroy() { o.stopTouch?.(); read.remove(); host.innerHTML = ''; } };
}
