// Pictures for the six "chance and data" experiments: canvas panels drawn from the same state and model as the numbers.
// One shared animation loop per figure (visible-loop.js): it runs only while something moves and the figure is on screen.
import { canvasIn, palette, animationLoop, css } from '../../object-kit.js';
import * as M from '../models/inference.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
let fontFamily = '';
const font = (size, weight = 400) => `${weight} ${size}px ${fontFamily || (fontFamily = getComputedStyle(document.body).fontFamily || 'sans-serif')}`;
function txt(g, s, x, y, { size = 12, color, align = 'left', weight = 400, base = 'alphabetic' } = {}) {
  g.font = font(size, weight); g.fillStyle = color; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y);
}
const line = (g, x1, y1, x2, y2, color, w = 1, dash = null) => { g.strokeStyle = color; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]); };
const alpha = (g, a, fn) => { const old = g.globalAlpha; g.globalAlpha = a; fn(); g.globalAlpha = old; };
const jitter = i => ((Math.imul(i + 1, 2654435761) >>> 8) % 1000) / 1000;
const normalPdf = (x, m, s) => Math.exp(-(((x - m) / s) ** 2) / 2) / (s * 2.5066282746310002);

// A canvas panel at a logical size (so that text stays readable on a phone), with its caption above.
function panel(parent, W, H, caption, draw, { label = '' } = {}) {
  const box = document.createElement('figure'); box.className = 'inf-panel';
  const cap = document.createElement('figcaption'); cap.textContent = caption; box.append(cap);
  const host = document.createElement('div'); host.className = 'inf-canvas'; box.append(host); parent.append(box);
  // logical width = css width (text keeps its size on any screen), fixed css height (nothing moves when the figure mounts)
  let cw = host.clientWidth || W;
  const ro = globalThis.ResizeObserver ? new ResizeObserver(() => { const w = host.clientWidth; if (w > 0) cw = w; }) : null; ro?.observe(host);
  const o = canvasIn(host, W / H, { navigation: false });
  Object.defineProperty(o, 'W', { get: () => cw, set() {}, configurable: true }); o.H = H;
  o.cv.style.aspectRatio = 'auto'; o.cv.style.height = H + 'px'; o.resize();
  o.cv.setAttribute('role', 'img'); o.cv.setAttribute('aria-label', label || caption);
  o.paint = () => { if (!o.live) return; const w = o.W; o.g.setTransform(o.cv.width / w, 0, 0, o.cv.height / H, 0, 0); o.g.clearRect(0, 0, w, H); draw(o.g, w, H, palette()); };
  o.redraw = o.paint; o.host = host; o.caption = cap; o.dispose = () => { ro?.disconnect(); o.disconnect?.(); };
  return o;
}
// A pointer/keyboard slider laid over a panel: x -> value mapping given by the caller. Touch is claimed only where `hit` says so.
function slider(o, { hit, set, min, max, step = 1, get, text }) {
  const cv = o.cv; let down = false;
  cv.tabIndex = 0; cv.setAttribute('role', 'slider'); cv.setAttribute('aria-valuemin', min); cv.setAttribute('aria-valuemax', max);
  o.touchHit(pt => hit(pt));
  cv.addEventListener('pointerdown', e => { const pt = o.point(e); if (!hit(pt)) return; down = true; cv.setPointerCapture?.(e.pointerId); set(pt); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { if (down) set(o.point(e)); });
  const up = () => { down = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('keydown', e => {
    const v = get(), k = e.key, d = e.shiftKey ? 10 * step : step;
    const nv = k === 'ArrowRight' || k === 'ArrowUp' ? v + d : k === 'ArrowLeft' || k === 'ArrowDown' ? v - d : k === 'Home' ? min : k === 'End' ? max : null;
    if (nv === null) return; e.preventDefault(); set(null, clamp(nv, min, max));
  });
  o.setAria = () => { cv.setAttribute('aria-valuenow', get()); cv.setAttribute('aria-valuetext', text()); };
}

const BUILD = {
  // ---------------------------------------------------------------- baker
  baker({ wrap, t, fmt, setState, getState }) {
    const L = 40, bins = 40, lo = 900, hi = 1100;
    let S, Mo, clouds = null, ckey = '', shown = Array(bins).fill(0), counts = Array(bins).fill(0);
    const px = (W, v) => L + (clamp(v, lo, hi) - lo) / (hi - lo) * (W - L - 14);
    const hist = panel(wrap, 480, 290, t(['Masses des pains pesés (g)', 'Weights of the loaves weighed (g)']), (g, W, H, p) => {
      const T = 46, B = H - 50, n = S.n, tsd = Math.hypot(S.sigma, S.noise), bw = (W - L - 14) / bins;
      const peak = Math.max(1, ...counts, n * 5 * normalPdf(S.mean, S.mean, tsd)), y = c => B - c / peak * (B - T) * .92;
      line(g, L, B, W - 14, B, p.line, 1);
      for (let i = 0; i < bins; i++) { if (shown[i] > .02) { g.fillStyle = p.obj3; g.fillRect(L + i * bw + 1, y(shown[i]), bw - 2, B - y(shown[i])); } }
      g.strokeStyle = p.ink; g.lineWidth = 1.5; g.setLineDash([5, 4]); g.beginPath();
      for (let v = lo; v <= hi; v += 2) { const c = n * 5 * normalPdf(v, S.mean, tsd); (v === lo ? g.moveTo : g.lineTo).call(g, px(W, v), y(c)); }
      g.stroke(); g.setLineDash([]);
      for (let v = lo; v <= hi; v += 20) { line(g, px(W, v), B, px(W, v), B + 4, p.line); txt(g, String(v), px(W, v), B + 16, { size: 11, color: p.muted, align: 'center' }); }
      // target (the claim), sample mean (what the data say) and the naive 95 % interval around it
      line(g, px(W, S.target), T - 2, px(W, S.target), B, p.ink, 2);
      const left = Mo.average < S.target;   // the two labels sit on opposite sides of their lines
      txt(g, t(['cible ', 'target ']) + S.target + ' g', px(W, S.target) + (left ? 5 : -5), T - 6, { size: 12, color: p.ink, weight: 700, align: left ? 'left' : 'right' });
      const mx = px(W, Mo.average);
      line(g, mx, T - 2, mx, B, p.accent, 2.5);
      txt(g, 'x̄ = ' + fmt.num(Mo.average, 1) + ' g', mx + (left ? -5 : 5), T - 6, { size: 12, color: p.accent, weight: 700, align: left ? 'right' : 'left' });
      const c0 = px(W, Mo.ci[0]), c1 = px(W, Mo.ci[1]); line(g, c0, B - 8, c1, B - 8, p.accent, 3); line(g, c0, B - 14, c0, B - 2, p.accent, 2); line(g, c1, B - 14, c1, B - 2, p.accent, 2);
      // the true production mean: a handle to drag
      const hx = px(W, S.mean); g.fillStyle = p.ink; g.beginPath(); g.moveTo(hx, B + 20); g.lineTo(hx - 7, B + 31); g.lineTo(hx + 7, B + 31); g.closePath(); g.fill();
      txt(g, 'μ = ' + S.mean, hx, B + 45, { size: 11, color: p.ink, align: 'center', weight: 700 });
    });
    slider(hist, { min: 940, max: 1020, get: () => getState().mean, hit: ([x, y]) => Math.abs(x - px(hist.W, getState().mean)) < 30 && y > 245, set: (pt, v) => setState({ mean: Math.round(v ?? clamp(lo + (pt[0] - L) / (hist.W - L - 14) * (hi - lo), 940, 1020)) }), text: () => t(['moyenne vraie ', 'true mean ']) + getState().mean + ' g' });
    hist.caption.append(' ', Object.assign(document.createElement('small'), { textContent: t(['(pointillés : pains fabriqués ; glisse le triangle μ)', '(dashed: loaves baked; drag the μ triangle)']) }));
    const strips = panel(wrap, 480, 290, t(['Même nombre de pains : au hasard, ou le plus lourd de cinq', 'Same number of loaves: random, or the heaviest of five']), (g, W, H, p) => {
      const rows = [['random', t(['Pains au hasard', 'Random loaves']), clouds.random, clouds.meanRandom, p.ink], ['selected', t(['Le plus lourd de cinq', 'Heaviest of five']), clouds.selected, clouds.meanSelected, p.accent]];
      rows.forEach(([id, name, xs, mean, col], r) => {
        const top = 34 + r * 112, active = S.mode === id;
        alpha(g, active ? 1 : .55, () => {
          txt(g, name + (active ? '  ◀' : ''), L, top - 8, { size: 12, color: p.ink, weight: 700 });
          line(g, L, top + 76, W - 14, top + 76, p.line);
          xs.forEach((v, i) => { g.fillStyle = col; g.globalAlpha = (active ? .75 : .4); g.fillRect(px(W, v) - 2.5, top + 8 + jitter(i) * 56, 5, 5); });
          g.globalAlpha = 1;
          const mx = px(W, mean); line(g, mx, top, mx, top + 76, col, 3);
          txt(g, 'x̄ = ' + fmt.num(mean, 1) + ' g', W - 14, top - 8, { size: 12, color: col, weight: 700, align: 'right' });
        });
      });
      for (const [v, col, dash, lbl] of [[S.mean, p.muted, [3, 3], 'μ'], [S.target, p.ink, null, '']]) { line(g, px(W, v), 22, px(W, v), H - 30, col, 1.2, dash); if (lbl) txt(g, lbl, px(W, v), 14, { size: 11, color: col, align: 'center' }); }
      for (let v = lo; v <= hi; v += 20) txt(g, String(v), px(W, v), H - 12, { size: 11, color: p.muted, align: 'center' });
      txt(g, t(['décalage dû au tri : ', 'shift caused by selection: ']) + (clouds.shift >= 0 ? '+' : '') + fmt.num(clouds.shift, 1) + ' g', W - 14, 14, { size: 12, color: p.accent, align: 'right', weight: 700 });
    }, { label: '' });
    strips.cv.addEventListener('pointerdown', e => { const [, y] = strips.point(e); setState({ mode: y < 146 ? 'random' : 'selected' }); });
    strips.caption.append(' ', Object.assign(document.createElement('small'), { textContent: t(['(touche une rangée pour l’adopter)', '(tap a row to use it)']) }));
    return {
      panels: [hist, strips],
      set(s, m) {
        S = s; Mo = m;
        const key = JSON.stringify([s.seed, s.n, s.mean, s.sigma, s.noise]); if (key !== ckey) { ckey = key; clouds = M.bakerClouds(s); }
        counts = Array(bins).fill(0); for (const w of m.weights) counts[clamp(Math.floor((w - lo) / (hi - lo) * bins), 0, bins - 1)]++;
        const sub = [`${t(['moyenne observée', 'observed mean'])} ${fmt.num(m.average, 1)} g`, `${t(['cible', 'target'])} ${s.target} g`, `${t(['tri : décalage', 'selection shift'])} ${fmt.num(clouds.shift, 1)} g`].join(', ');
        hist.cv.setAttribute('aria-label', t(['Histogramme des masses. ', 'Histogram of weights. ']) + sub); strips.cv.setAttribute('aria-label', t(['Deux nuages de masses. ', 'Two clouds of weights. ']) + sub); hist.setAria();
      },
      step(k) { let moving = false; shown = shown.map((v, i) => { const d = counts[i] - v; if (Math.abs(d) < .02) return counts[i]; moving = true; return v + d * k; }); return moving; },
    };
  },

  // ---------------------------------------------------------------- tank
  tank({ wrap, t, fmt, setState, getState }) {
    let S, Mo, shownEst = 0, hasEst = false, hist = Array(32).fill(0), histM = Array(32).fill(0), hshown = Array(32).fill(0), hshownM = Array(32).fill(0);
    const axisMax = () => { const s = S, e = Mo.estimate; return s.revealed ? Math.max(s.N, s.guess, e, Mo.upper) * 1.08 : Math.max(s.guess, e, Mo.upper, 2 * Mo.m) * 1.08; };
    const L = 24, ax = W => v => L + v / axisMax() * (W - L - 18);
    const lineP = panel(wrap, 480, 290, t(['Numéros observés sur la droite 1…N', 'Observed serial numbers on the line 1…N']), (g, W, H, p) => {
      const x = ax(W), Y = 128, N = S.N;
      line(g, L, Y, W - 18, Y, p.ink, 2);
      if (S.revealed && N <= 600) for (let i = 1; i <= N; i++) line(g, x(i), Y - 5, x(i), Y, p.line, 1);
      const max = axisMax(), step = max > 600 ? 200 : max > 250 ? 100 : max > 120 ? 50 : 20;
      for (let v = 0; v <= max; v += step) { line(g, x(v), Y, x(v), Y + 6, p.ink); txt(g, String(v), x(v), Y + 19, { size: 11, color: p.muted, align: 'center' }); }
      for (const v of Mo.sample) line(g, x(v), Y - 26, x(v), Y, v === Mo.m ? p.ink : p.obj3, v === Mo.m ? 4 : 2.5);
      if (S.k <= 8) Mo.sample.forEach(v => v !== Mo.m && txt(g, String(v), x(v), Y - 31, { size: 10, color: p.muted, align: 'center' }));
      txt(g, 'M = ' + Mo.m, x(Mo.m), Y - 33, { size: 12, color: p.ink, weight: 700, align: 'center' });
      // the corrected estimate and its one-sided upper bound
      const ex = x(shownEst); g.fillStyle = p.accent; g.beginPath(); g.moveTo(ex, Y - 62); g.lineTo(ex + 8, Y - 72); g.lineTo(ex, Y - 82); g.lineTo(ex - 8, Y - 72); g.closePath(); g.fill();
      line(g, ex, Y - 62, ex, Y, p.accent, 1.5, [3, 3]);
      txt(g, 'N̂ = ' + fmt.num(Mo.estimate, 1), ex, Y - 88, { size: 12, color: p.accent, weight: 700, align: 'center' });
      line(g, x(Mo.m), Y + 38, x(Mo.upper), Y + 38, p.ink, 2); line(g, x(Mo.m), Y + 32, x(Mo.m), Y + 44, p.ink, 2); line(g, x(Mo.upper), Y + 32, x(Mo.upper), Y + 44, p.ink, 2);
      txt(g, t(['borne à 95 % : ', '95% bound: ']) + Mo.upper, x(Mo.upper), Y + 58, { size: 11, color: p.ink, align: x(Mo.upper) > W - 110 ? 'right' : 'left' });
      // your guess: drag the handle
      const gx = x(S.guess); g.strokeStyle = p.ink; g.lineWidth = 2; g.fillStyle = p.surface; g.beginPath(); g.moveTo(gx, Y + 70); g.lineTo(gx - 8, Y + 86); g.lineTo(gx + 8, Y + 86); g.closePath(); g.fill(); g.stroke();
      txt(g, t(['ton estimation ', 'your guess ']) + S.guess, gx, Y + 102, { size: 12, color: p.ink, align: gx > W - 70 ? 'right' : gx < 70 ? 'left' : 'center', weight: 700 });
      if (S.revealed) { line(g, x(N), 26, x(N), Y + 8, p.accent, 3); txt(g, 'N = ' + N, x(N) + (x(N) > W - 80 ? -6 : 6), 20, { size: 13, color: p.accent, weight: 700, align: x(N) > W - 80 ? 'right' : 'left' }); }
      else txt(g, t(['N est caché : révèle la population pour comparer.', 'N is hidden: reveal the population to compare.']), W / 2, 22, { size: 12, color: p.muted, align: 'center' });
    });
    slider(lineP, { min: 2, max: 1000, get: () => getState().guess, hit: ([x, y]) => y > 180 || Math.abs(x - ax(lineP.W)(getState().guess)) < 28, set: (pt, v) => setState({ guess: Math.round(v ?? clamp(((pt[0] - L) / (lineP.W - L - 18)) * axisMax(), 2, 1000)) }), text: () => t(['estimation ', 'guess ']) + getState().guess });
    const rep = panel(wrap, 480, 290, t(['Répétitions : le maximum M contre l’estimateur N̂', 'Repetitions: the maximum M versus the estimator N̂']), (g, W, H, p) => {
      const T = 40, B = H - 52, N = S.N, xmax = Math.min(2 * N, Math.max(1.3 * N, N * (1 + 1 / S.k))), bw = (W - 30) / 32, xv = v => 20 + v / xmax * (W - 30);
      line(g, 20, B, W - 10, B, p.line);
      if (!S.revealed || !S.runs) { txt(g, S.revealed ? t(['Lance « + 100 essais » pour voir les répétitions.', 'Press “+ 100 trials” to see repetitions.']) : t(['Révèle N, puis répète le tirage.', 'Reveal N, then repeat the draw.']), W / 2, H / 2, { size: 13, color: p.muted, align: 'center' }); return; }
      const peak = Math.max(1, ...hshown, ...hshownM);
      for (let i = 0; i < 32; i++) {
        for (const [arr, col] of [[hshownM, p.c[1]], [hshown, p.c[0]]]) { const h = arr[i] / peak * (B - T); alpha(g, .6, () => { g.fillStyle = col; g.fillRect(20 + i * bw + 1, B - h, bw - 2, h); }); }
      }
      for (let v = 0; v <= xmax; v += Math.max(20, Math.round(xmax / 6 / 20) * 20)) { line(g, xv(v), B, xv(v), B + 4, p.line); txt(g, String(v), xv(v), B + 16, { size: 11, color: p.muted, align: 'center' }); }
      line(g, xv(N), T - 10, xv(N), B, p.accent, 3); txt(g, 'N = ' + N, xv(N) + 5, T - 14, { size: 12, color: p.accent, weight: 700 });
      const mM = Mo.maxima.reduce((a, b) => a + b, 0) / Mo.maxima.length, mE = Mo.observedMean;
      for (const [v, col, name, dy] of [[mM, p.c[1], 'M', 30], [mE, p.c[0], 'N̂', 30]]) { g.fillStyle = col; g.beginPath(); g.moveTo(xv(v), B + 18); g.lineTo(xv(v) - 6, B + 28); g.lineTo(xv(v) + 6, B + 28); g.closePath(); g.fill(); }
      g.fillStyle = p.c[1]; g.fillRect(20, H - 22, 10, 10); txt(g, t(['maximum M — moyenne ', 'maximum M — mean ']) + fmt.num(mM, 1), 34, H - 13, { size: 11, color: p.ink });
      g.fillStyle = p.c[0]; g.fillRect(W / 2 + 4, H - 22, 10, 10); txt(g, 'N̂ = M(1+1/k)−1 — ' + t(['moyenne ', 'mean ']) + fmt.num(mE, 1), W / 2 + 18, H - 13, { size: 11, color: p.ink });
    });
    return {
      panels: [lineP, rep],
      set(s, m) {
        S = s; Mo = m; if (!hasEst) { shownEst = m.estimate; hasEst = true; }
        hist = Array(32).fill(0); histM = Array(32).fill(0);
        if (s.revealed && s.runs) { const xmax = Math.min(2 * s.N, Math.max(1.3 * s.N, s.N * (1 + 1 / s.k))); const f = (arr, vs) => vs.forEach(v => arr[clamp(Math.floor(v / xmax * 32), 0, 31)]++); f(hist, m.estimates); f(histM, m.maxima); }
        lineP.cv.setAttribute('aria-label', `${t(['Numéros observés', 'Observed serials'])}: ${m.sample.join(', ')}. M = ${m.m}, N̂ = ${fmt.num(m.estimate, 1)}, ${t(['borne 95 %', '95% bound'])} ${m.upper}${s.revealed ? ', N = ' + s.N : ''}`); lineP.setAria();
        rep.cv.setAttribute('aria-label', s.revealed && s.runs ? `${t(['Répétitions', 'Repetitions'])}: ${t(['moyenne de N̂', 'mean of N̂'])} ${fmt.num(m.observedMean, 1)}, N = ${s.N}` : t(['Répétitions : pas encore', 'Repetitions: not yet']));
      },
      step(k) { let moving = Math.abs(shownEst - Mo.estimate) > .05; shownEst = moving ? shownEst + (Mo.estimate - shownEst) * k : Mo.estimate;
        for (const [sh, tg] of [[hshown, hist], [hshownM, histM]]) for (let i = 0; i < 32; i++) { const d = tg[i] - sh[i]; if (Math.abs(d) < .05) sh[i] = tg[i]; else { sh[i] += d * k; moving = true; } }
        return moving; },
    };
  },

  // ---------------------------------------------------------------- monty
  monty({ wrap, t, fmt, setState, getState }) {
    let S, Mo, open = [0, 0, 0], tkey = '', tally = null, shownRuns = 0, view = 'tally', pulse = 0;
    const doorsPanel = panel(wrap, 480, 270, t(['Trois portes', 'Three doors']), (g, W, H, p) => {
      const cw = W / 3;
      for (let i = 0; i < 3; i++) {
        const x = i * cw + cw * .12, y = 28, w = cw * .76, h = 170, o = open[i], isChoice = i === S.choice;
        g.fillStyle = p.sunken; g.fillRect(x, y, w, h);
        if (o > 0.02) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x + w / 2, y + h - 18); const k = Math.min(1, w / 110); g.scale(k, k); (i === Mo.prize ? car : goat)(g, 0, 0, p); g.restore(); }
        const lw = w * (1 - o * .92);
        g.fillStyle = p.surface; g.fillRect(x, y, lw, h); g.strokeStyle = isChoice ? p.accent : p.ink; g.lineWidth = isChoice ? 4 : 2; g.strokeRect(x, y, w, h); g.strokeRect(x, y, lw, h);
        if (o < .6) { txt(g, String(i + 1), x + lw / 2, y + 80, { size: 52 * Math.min(1, w / 110) * (1 - o), color: p.ink, align: 'center', weight: 700 }); g.fillStyle = p.ink; g.beginPath(); g.arc(x + lw - 12, y + 92, 5, 0, 7); g.fill(); }
        line(g, x - 8, y + h, x + w + 8, y + h, p.ink, 2);
        const final = S.finished ? (S.strategy === 'stay' ? S.choice : [0, 1, 2].find(d => d !== S.choice && d !== Mo.door)) : -1;
        txt(g, t(['Porte ', 'Door ']) + (i + 1) + (isChoice ? t([' · ton choix', ' · your pick']) : ''), x + w / 2, y + h + 20, { size: 13, color: isChoice ? p.accent : p.ink, weight: isChoice ? 700 : 400, align: 'center' });
        if (final === i) { txt(g, Mo.win ? t(['✓ gagné', '✓ won']) : t(['✗ perdu', '✗ lost']), x + w / 2, y + h + 40, { size: 13, color: Mo.win ? p.pos : p.neg, weight: 700, align: 'center' }); }
      }
      if (S.opened && !S.finished && Mo.valid) txt(g, t(['Reste, ou change : touche une porte.', 'Stay or switch: touch a door.']), W / 2, 16, { size: 12, color: p.muted, align: 'center' });
      else if (!S.opened) txt(g, t(['Choisis une porte, puis laisse l’animateur ouvrir.', 'Pick a door, then let the host open one.']), W / 2, 16, { size: 12, color: p.muted, align: 'center' });
    });
    doorsPanel.cv.removeAttribute('role'); doorsPanel.cv.setAttribute('aria-hidden', 'true'); doorsPanel.cv.tabIndex = -1;
    doorsPanel.host.style.position = 'relative';
    const overlay = document.createElement('div'); overlay.className = 'inf-overlay'; doorsPanel.host.append(overlay);
    const side = panel(wrap, 480, 270, '', (g, W, H, p) => {
      if (view === 'tree') return tree(g, W, H, p, t);
      const e = tally.eligible, i = Math.max(0, Math.min(S.runs, Math.round(shownRuns)) - 1), have = S.runs > 0 && e.length;
      const exactSwitch = M.montyExact(S.host, 'switch').probability, exactStay = M.montyExact(S.host, 'stay').probability;
      const ge = have ? e[i] : 0, sw = have ? tally.switchWins[i] : 0, st = have ? tally.stayWins[i] : 0, fs = ge ? sw / ge : 0, ft = ge ? st / ge : 0;
      const T = 40, B = H - 44;
      [[t(['Changer', 'Switch']), fs, exactSwitch, p.accent, 24, sw], [t(['Rester', 'Stay']), ft, exactStay, p.obj2, 94, st]].forEach(([name, f, ex, col, x0, wins]) => {
        g.fillStyle = col; g.fillRect(x0, B - f * (B - T), 56, f * (B - T)); line(g, x0 - 6, B - ex * (B - T), x0 + 62, B - ex * (B - T), p.ink, 2, [4, 3]);
        txt(g, name, x0 + 28, B + 16, { size: 12, color: p.ink, align: 'center', weight: 700 }); txt(g, have ? fmt.num(100 * f, 1) + ' %' : '–', x0 + 28, B - f * (B - T) - 6, { size: 12, color: p.ink, align: 'center', weight: 700 });
        txt(g, fmt.num(ex * 100, 1) + ' %', x0 + 28, B - ex * (B - T) - 18, { size: 10, color: p.muted, align: 'center' });
      });
      line(g, 14, B, 170, B, p.line);
      txt(g, have ? `${sw + st}/${ge}`.replace(/.*/, `${t(['gains', 'wins'])} ${sw} + ${st} = ${ge}`) : t(['Aucune partie : lance des essais.', 'No game yet: run trials.']), 94, H - 6, { size: 11, color: p.muted, align: 'center' });
      // running frequencies against the number of games
      const X0 = 205, X1 = W - 12;
      line(g, X0, T, X0, B, p.line); line(g, X0, B, X1, B, p.line);
      for (const [v, col] of [[exactSwitch, p.accent], [exactStay, p.obj2]]) { const y = B - v * (B - T); line(g, X0, y, X1, y, col, 1, [4, 4]); txt(g, v === 1 / 3 ? '1/3' : v === 2 / 3 ? '2/3' : '1/2', X1, y - 3, { size: 10, color: p.muted, align: 'right' }); }
      txt(g, '0', X0 - 4, B + 4, { size: 10, color: p.muted, align: 'right' }); txt(g, '1', X0 - 4, T + 4, { size: 10, color: p.muted, align: 'right' });
      txt(g, t(['parties jouées →', 'games played →']), X1, H - 6, { size: 11, color: p.muted, align: 'right' });
      if (have && i > 0) for (const [arr, col] of [[tally.stayWins, p.obj2], [tally.switchWins, p.accent]]) {
        g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); const pts = Math.min(i + 1, 240);
        for (let j = 0; j < pts; j++) { const idx = Math.round(j * i / Math.max(1, pts - 1)), v = e[idx] ? arr[idx] / e[idx] : 0; const x = X0 + (idx + 1) / Math.max(S.runs, 1) * (X1 - X0), y = B - v * (B - T); j ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      txt(g, 'n = ' + S.runs, X0 + 4, T - 8, { size: 11, color: p.muted });
    });
    // caption and the view toggle
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'btn btn-secondary inf-toggle'; toggle.setAttribute('aria-pressed', 'false');
    const cap = () => { side.caption.textContent = view === 'tree' ? t(['Arbre de probabilités (animateur informé)', 'Probability tree (informed host)']) : t(['Gains cumulés : changer contre rester', 'Cumulative wins: switch versus stay']); toggle.textContent = view === 'tree' ? t(['Voir les parties simulées', 'Show simulated games']) : t(['Voir l’arbre des probabilités', 'Show the probability tree']); toggle.setAttribute('aria-pressed', String(view === 'tree')); };
    cap(); toggle.addEventListener('click', () => { view = view === 'tree' ? 'tally' : 'tree'; cap(); side.paint(); }); side.host.after(toggle);
    return {
      panels: [doorsPanel, side], overlay,
      set(s, m) {
        const first = !S; S = s; Mo = m; const key = s.seed + '|' + s.host; if (key !== tkey) { tkey = key; tally = M.montyTally(s.seed, 10000, s.host); }
        shownRuns = Math.min(shownRuns, s.runs); if (first) shownRuns = s.runs;
        side.cv.setAttribute('aria-label', t(['Gains cumulés. ', 'Cumulative wins. ']) + `${t(['changer', 'switch'])} ${m.wins}/${m.eligible}`); void pulse;
        doorsPanel.caption.textContent = t(['Trois portes — ', 'Three doors — ']) + (!s.opened ? t(['à toi de choisir', 'your pick']) : s.finished ? (m.win ? t(['gagné', 'won']) : t(['perdu', 'lost'])) : t(['une chèvre est révélée', 'a goat is revealed']));
      },
      step(k, dt) {
        let moving = false;
        for (let i = 0; i < 3; i++) { const tg = S.finished || (S.opened && i === Mo.door) ? 1 : 0, d = tg - open[i]; if (Math.abs(d) < .01) open[i] = tg; else { open[i] += d * k; moving = true; } }
        if (shownRuns !== S.runs) { const rate = Math.max(60, S.runs / .9) * (dt || 1); shownRuns = Math.min(S.runs, shownRuns + rate); moving = true; if (dt === 0) shownRuns = S.runs; }
        return moving;
      },
    };
  },

  // ---------------------------------------------------------------- birthdays
  birthdays({ wrap, t, fmt, setState, getState }) {
    let S, Mo, ckey = '', curve = [], cur0 = [], pulse = 0, lastN = 0;
    const days = () => S.days, cols = () => Math.ceil(Math.sqrt(days() * 1.6));
    const cal = panel(wrap, 480, 290, '', (g, W, H, p) => {
      const d = days(), c = cols(), r = Math.ceil(d / c), cs = Math.min(30, (W - 24) / c, (H - 78) / r), x0 = (W - cs * c) / 2, y0 = 26;
      const count = new Map(); Mo.sample.forEach(v => count.set(v, (count.get(v) || 0) + 1));
      for (let i = 0; i < d; i++) {
        const x = x0 + (i % c) * cs, y = y0 + Math.floor(i / c) * cs, n = count.get(i) || 0;
        g.fillStyle = n > 1 ? p.accent : n === 1 ? p.obj2 : p.sunken; g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
        if (!n) { g.strokeStyle = p.line; g.lineWidth = .5; g.strokeRect(x + 1.5, y + 1.5, cs - 3, cs - 3); }
        if (n > 1 && cs >= 12) txt(g, String(n), x + cs / 2, y + cs / 2, { size: Math.min(13, cs - 3), color: css('--accent-ink'), weight: 700, align: 'center', base: 'middle' });
      }
      if (pulse > 0 && Mo.sample.length) { const i = Mo.sample.at(-1), x = x0 + (i % c) * cs + cs / 2, y = y0 + Math.floor(i / c) * cs + cs / 2; g.strokeStyle = p.accent; g.lineWidth = 2; g.beginPath(); g.arc(x, y, cs * (.6 + (1 - pulse) * 1.6), 0, 7); g.stroke(); }
      const by = y0 + r * cs + 14;
      g.fillStyle = p.obj2; g.fillRect(x0, by - 9, 10, 10); txt(g, t(['une personne', 'one person']), x0 + 15, by, { size: 11, color: p.ink });
      g.fillStyle = p.accent; g.fillRect(x0 + 110, by - 9, 10, 10); txt(g, t(['au moins deux : collision', 'two or more: collision']), x0 + 125, by, { size: 11, color: p.ink });
      txt(g, `${S.n} ${t(['personnes', 'people'])}, ${d} ${S.days === 365 ? t(['jours', 'days']) : t(['cases', 'buckets'])}`, W / 2, 14, { size: 12, color: p.ink, align: 'center', weight: 700 });
      txt(g, Mo.duplicate ? t(['Collision !', 'Collision!']) : t(['Aucune collision', 'No collision']), W / 2, H - 6, { size: 13, color: Mo.duplicate ? p.accent : p.muted, align: 'center', weight: 700 });
    }, { label: '' });
    const L = 40, T = 34, plot = (W, H) => ({ x: n => L + n / 100 * (W - L - 16), y: q => H - 40 - q * (H - 40 - T) });
    const crv = panel(wrap, 480, 290, t(['Probabilité d’une collision selon la taille du groupe', 'Probability of a collision by group size']), (g, W, H, p) => {
      const { x, y } = plot(W, H), B = H - 40;
      for (const q of [0, .25, .5, .75, 1]) { line(g, L, y(q), W - 16, y(q), q === .5 ? p.line : p.grid, q === .5 ? 1.2 : 1); txt(g, Math.round(q * 100) + ' %', L - 5, y(q) + 4, { size: 10, color: p.muted, align: 'right' }); }
      for (let n = 0; n <= 100; n += 10) { txt(g, String(n), x(n), B + 15, { size: 10, color: p.muted, align: 'center' }); line(g, x(n), B, x(n), B + 4, p.line); }
      txt(g, t(['personnes n →', 'people n →']), W - 16, H - 6, { size: 11, color: p.muted, align: 'right' });
      if (S.mode !== 'uniform') { g.strokeStyle = p.obj3; g.lineWidth = 1.5; g.setLineDash([4, 3]); g.beginPath(); cur0.forEach((v, n) => n ? g.lineTo(x(n), y(v)) : g.moveTo(x(n), y(v))); g.stroke(); g.setLineDash([]); }
      g.strokeStyle = p.ink; g.lineWidth = 2.5; g.beginPath(); curve.forEach((v, n) => n ? g.lineTo(x(n), y(v)) : g.moveTo(x(n), y(v))); g.stroke();
      const n = S.n, n50 = M.birthdayThreshold(curve);
      if (n50 > 0 && n50 <= 100) { line(g, x(n50), y(.5), x(n50), B, p.muted, 1.2, [3, 3]); if (n !== n50) { g.fillStyle = p.surface; g.strokeStyle = p.ink; g.lineWidth = 2; g.beginPath(); g.arc(x(n50), y(curve[n50]), 5, 0, 7); g.fill(); g.stroke(); } txt(g, 'n* = ' + n50, x(n50) + 6, B - 8, { size: 12, color: p.ink, weight: 700 }); }
      const pv = curve[n]; line(g, x(n), y(pv), x(n), B, p.accent, 2); line(g, L, y(pv), x(n), y(pv), p.accent, 1.2, [3, 3]);
      g.fillStyle = p.accent; g.beginPath(); g.arc(x(n), y(pv), 7, 0, 7); g.fill();
      const leftSide = n >= 15; txt(g, `n = ${n} : ${fmt.num(pv * 100, 1)} %`, x(n) + (leftSide ? -12 : 12), y(pv) - 12, { size: 13, color: p.accent, weight: 700, align: leftSide ? 'right' : 'left' });
      if (S.runs) { g.strokeStyle = p.ink; g.lineWidth = 2; g.strokeRect(x(n) - 5, y(Mo.frequency) - 5, 10, 10); }
      if (n50 > 0) txt(g, t(['≥ 50 % dès n = ', '≥ 50% from n = ']) + n50, W - 16, T - 10, { size: 12, color: p.muted, align: 'right' });
    });
    slider(crv, { min: 2, max: 100, get: () => getState().n, hit: ([x, y]) => x > L - 10 && y > T - 10 && y < 262, set: (pt, v) => setState({ n: Math.round(v ?? clamp((pt[0] - L) / (crv.W - L - 16) * 100, 2, 100)) }), text: () => `${getState().n} ${t(['personnes', 'people'])}` });
    crv.caption.append(' ', Object.assign(document.createElement('small'), { textContent: t(['(glisse le point rouge)', '(drag the red dot)']) }));
    return {
      panels: [cal, crv],
      set(s, m) {
        S = s; Mo = m; const key = s.days + s.mode; if (key !== ckey) { ckey = key; const probs = s.mode === 'seasonal' ? Array.from({ length: s.days }, (_, i) => (1 + .6 * Math.cos(2 * Math.PI * i / s.days)) / s.days) : null; curve = M.birthdayCurve(s.days, probs, 100); cur0 = s.mode === 'uniform' ? curve : M.birthdayCurve(s.days, null, 100); }
        if (s.n > lastN) pulse = 1; lastN = s.n; cal.caption.textContent = t(['Le calendrier du groupe', 'The group’s calendar']);
        cal.cv.setAttribute('aria-label', `${s.n} ${t(['personnes', 'people'])}: ${m.duplicate ? t(['collision présente', 'collision present']) : t(['aucune collision', 'no collision'])}`);
        crv.cv.setAttribute('aria-label', `${t(['Courbe de probabilité', 'Probability curve'])}: n = ${s.n}, ${fmt.num(curve[s.n] * 100, 1)} %`); crv.setAria();
      },
      step(k, dt) { if (pulse > 0) { pulse = dt ? Math.max(0, pulse - dt * 2.2) : 0; return pulse > 0; } return false; },
    };
  },

  // ---------------------------------------------------------------- secretary
  secretary({ wrap, t, fmt, setState, getState }) {
    let S, Mo, shown = [], timer = 0;
    const n100 = () => Math.min(S.n, 100);
    const recs = () => { const out = [], seenRel = []; for (let i = 0; i < S.interview; i++) { const v = Mo.order[i], below = Mo.order.slice(0, i).filter(x => x < v).length; seenRel.push(i ? (below + 1) / (i + 1) : 1); out.push(i === 0 || Mo.order.slice(0, i).every(x => x < v)); } return { seenRel, isRecord: out }; };
    const stopIdx = () => M.secretarySelection(Mo.order, Math.min(S.n - 1, S.skip));
    const bars = panel(wrap, 480, 290, t(['Les candidats, dans l’ordre des entretiens', 'The candidates, in interview order']), (g, W, H, p) => {
      const n = S.n, L = 14, T = 40, B = H - 56, bw = (W - L - 12) / n, { seenRel, isRecord } = recs(), r = Math.min(n - 1, S.skip), stop = stopIdx();
      line(g, L, B, W - 12, B, p.line);
      for (let i = 0; i < n; i++) {
        const x = L + i * bw, seen = i < S.interview, h = S.finished ? Mo.order[i] / n * (B - T) : seen ? Math.max(.06, seenRel[i]) * (B - T) : 4;
        const hh = i < shown.length ? shown[i] : h;
        let col = !seen && !S.finished ? p.line : i < r ? p.obj3 : p.obj2;
        if (S.finished && i === S.accepted) col = p.accent;
        g.fillStyle = col; g.fillRect(x + Math.min(1, bw / 4), B - hh, Math.max(1, bw - Math.min(2, bw / 2)), hh);
        if (seen && isRecord[i] && !S.finished) { g.fillStyle = p.ink; g.fillRect(x + bw / 2 - 2, B - hh - 8, 4, 4); }
        if (S.finished && Mo.order[i] === n) { g.strokeStyle = Mo.selected === n ? p.pos : p.neg; g.lineWidth = 2; g.strokeRect(x - 1, B - hh - 3, bw + 2, hh + 3); }
      }
      // the observation threshold r and the point where the rule would stop
      const rx = L + r * bw; line(g, rx, T - 14, rx, B, p.ink, 2, [5, 4]);
      txt(g, 'r = ' + r, rx + 4, T - 20, { size: 12, color: p.ink, weight: 700 });
      txt(g, t(['observation', 'observe']), L + 2, T - 6, { size: 11, color: p.muted });
      if (S.interview > r && stop < S.interview) { const sx = L + stop * bw + bw / 2; g.fillStyle = p.accent; g.beginPath(); g.moveTo(sx, B + 3); g.lineTo(sx - 6, B + 13); g.lineTo(sx + 6, B + 13); g.closePath(); g.fill(); txt(g, t(['la règle s’arrête', 'the rule stops']), sx, B + 28, { size: 11, color: p.accent, weight: 700, align: sx > W - 70 ? 'right' : sx < 60 ? 'left' : 'center' }); }
      txt(g, S.finished ? t(['Qualités réelles révélées : ', 'True qualities revealed: ']) + (Mo.selected === n ? t(['meilleur choisi ✓', 'best chosen ✓']) : t(['rang ', 'rank ']) + Mo.selected + '/' + n) : t(['Hauteur = rang parmi les candidats déjà vus ; point = meilleur jusqu’ici', 'Height = rank among those seen; dot = best so far']), W / 2, H - 6, { size: 11, color: p.muted, align: 'center' });
    });
    const run = document.createElement('button'); run.type = 'button'; run.className = 'btn btn-secondary inf-toggle'; run.textContent = t(['Appliquer la règle de seuil', 'Apply the threshold rule']);
    bars.host.after(run);
    const clearTimer = () => { clearTimeout(timer); timer = 0; };
    run.addEventListener('click', () => {
      clearTimer();
      const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const s0 = getState(); if (s0.finished) { setState({ interview: 1, accepted: -1, finished: false }); }
      const step = () => { const s = getState(), m = M.secretary(s), stop = M.secretarySelection(m.order, Math.min(s.n - 1, s.skip));
        if (s.finished) return;
        if (reduced) { setState({ interview: stop + 1, accepted: stop, finished: true }); return; }
        if (s.interview < stop + 1) { setState({ interview: s.interview + 1 }); timer = setTimeout(step, 260); } else setState({ accepted: stop, finished: true }); };
      step();
    });
    const L2 = 40, T2 = 34, px = (W, r) => L2 + r / Math.max(1, S.n - 1) * (W - L2 - 16), py = (H, q) => H - 40 - q * (H - 40 - T2) / .5;
    const curve = panel(wrap, 480, 290, t(['Probabilité de choisir le meilleur selon r', 'Probability of choosing the best, by r']), (g, W, H, p) => {
      const n = S.n, B = H - 40, qmax = .5;
      for (const q of [0, .1, .2, .3, .4, .5]) { line(g, L2, py(H, q), W - 16, py(H, q), p.grid); txt(g, Math.round(q * 100) + ' %', L2 - 5, py(H, q) + 4, { size: 10, color: p.muted, align: 'right' }); }
      line(g, L2, py(H, 1 / Math.E), W - 16, py(H, 1 / Math.E), p.muted, 1, [4, 3]); txt(g, '1/e ≈ 36,8 %'.replace(',', fmt.num(.5, 1).includes(',') ? ',' : '.'), W - 16, py(H, 1 / Math.E) - 4, { size: 10, color: p.muted, align: 'right' });
      g.strokeStyle = p.ink; g.lineWidth = 2.5; g.beginPath(); for (let r = 0; r < n; r++) { const x = px(W, r), y = py(H, Math.min(qmax, M.secretaryProbability(n, r))); r ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      const o = Mo.optimum, ne = n / Math.E; line(g, px(W, ne), T2, px(W, ne), B, p.muted, 1, [3, 3]); txt(g, 'n/e ≈ ' + fmt.num(ne, 1), px(W, ne) + (ne > n * .6 ? -5 : 5), T2 + 10, { size: 11, color: p.muted, align: ne > n * .6 ? 'right' : 'left' });
      if (o.skip !== Math.min(n - 1, S.skip)) { g.fillStyle = p.surface; g.strokeStyle = p.ink; g.lineWidth = 2; g.beginPath(); g.arc(px(W, o.skip), py(H, o.probability), 5, 0, 7); g.fill(); g.stroke();
      txt(g, t(['meilleur r = ', 'best r = ']) + o.skip + ' (' + fmt.num(100 * o.probability, 1) + ' %)', px(W, o.skip), py(H, o.probability) - 12, { size: 11, color: p.ink, weight: 700, align: o.skip > n * .7 ? 'right' : 'center' }); }
      const r = Math.min(n - 1, S.skip), cx = px(W, r), cy = py(H, Math.min(qmax, Mo.probability)); line(g, cx, cy, cx, B, p.accent, 2); g.fillStyle = p.accent; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
      const isBest = r === o.skip; txt(g, `r = ${r} : ${fmt.num(100 * Mo.probability, 1)} %` + (isBest ? t([' (meilleur)', ' (best)']) : ''), isBest ? cx : cx + (r > n * .6 ? -12 : 12), isBest ? cy - 14 : cy + 22, { size: 13, color: p.accent, weight: 700, align: isBest ? (r > n * .6 ? 'right' : 'center') : r > n * .6 ? 'right' : 'left' });
      if (S.runs) { g.strokeStyle = p.ink; g.lineWidth = 2; g.strokeRect(cx - 5, py(H, Math.min(qmax, Mo.frequency)) - 5, 10, 10); }
      for (let q = 0; q <= n; q += n > 50 ? 20 : 10) txt(g, String(q), px(W, Math.min(q, n - 1)), B + 15, { size: 10, color: p.muted, align: 'center' });
      txt(g, t(['refus initiaux r →', 'initial rejections r →']), W - 16, H - 6, { size: 11, color: p.muted, align: 'right' });
    });
    slider(curve, { min: 0, max: 99, get: () => getState().skip, hit: ([x, y]) => x > L2 - 10 && y > T2 - 10 && y < 262, set: (pt, v) => { const s = getState(); setState({ skip: clamp(Math.round(v ?? ((pt[0] - L2) / (curve.W - L2 - 16)) * (s.n - 1)), 0, s.n - 1), finished: false, interview: 1, accepted: -1 }); }, text: () => 'r = ' + getState().skip });
    curve.caption.append(' ', Object.assign(document.createElement('small'), { textContent: t(['(glisse le point rouge)', '(drag the red dot)']) }));
    return {
      panels: [bars, curve],
      set(s, m) {
        S = s; Mo = m; const { seenRel } = recs(), B = 234, H = B - 40;
        void seenRel; void H; if (!shown.length || shown.length !== s.n) shown = Array.from({ length: s.n }, () => 4);
        bars.cv.setAttribute('aria-label', `${t(['Entretien ', 'Interview '])}${Math.min(s.interview, s.n)}/${s.n}, r = ${Math.min(s.n - 1, s.skip)}${s.finished ? ', ' + t(['qualité choisie ', 'selected quality ']) + m.selected + '/' + s.n : ''}`);
        curve.cv.setAttribute('aria-label', `${t(['Probabilité de succès', 'Success probability'])}: r = ${Math.min(s.n - 1, s.skip)}, ${fmt.num(100 * m.probability, 1)} %`); curve.setAria();
        run.disabled = false;
      },
      step(k) {
        const n = S.n, B = 234, T = 40, { seenRel } = recs(); let moving = false;
        for (let i = 0; i < n; i++) { const tg = S.finished ? Mo.order[i] / n * (B - T) : i < S.interview ? Math.max(.06, seenRel[i]) * (B - T) : 4, d = tg - shown[i]; if (Math.abs(d) < .3) shown[i] = tg; else { shown[i] += d * k; moving = true; } }
        return moving;
      },
      destroy() { clearTimer(); },
    };
  },

  // ---------------------------------------------------------------- benford
  benford({ wrap, t, fmt, getState }) {
    let S, Mo, shown = [];
    wrap.classList.add('inf-fig--stack');
    const L = 40, R = 14, start = () => (S.digits === 1 ? 1 : 10);
    const bars = panel(wrap, 560, 300, t(['Fréquence du premier chiffre : données contre loi de Benford', 'Leading-digit frequency: data versus Benford’s law']), (g, W, H, p) => {
      const cnt = Mo.counts.length, bw = (W - L - R) / cnt, T = 36, B = H - 34, ymax = Math.max(.32, ...Mo.theory, ...Mo.frequency) * 1.08, y = v => B - v / ymax * (B - T);
      for (let q = 0; q <= .3; q += .1) { line(g, L, y(q), W - R, y(q), p.grid); txt(g, Math.round(q * 100) + ' %', L - 5, y(q) + 4, { size: 11, color: p.muted, align: 'right' }); }
      line(g, L, B, W - R, B, p.line);
      for (let i = 0; i < cnt; i++) {
        const x = L + i * bw, h = shown[i] ?? 0; g.fillStyle = p.obj3; g.fillRect(x + Math.min(2, bw / 4), y(h), bw - Math.min(4, bw / 2), B - y(h));
        const tx = x + bw / 2, ty = y(Mo.theory[i]); line(g, x + 1, ty, x + bw - 1, ty, p.accent, 3);
        if (cnt <= 9) { g.fillStyle = p.accent; g.beginPath(); g.arc(tx, ty, 4, 0, 7); g.fill(); txt(g, fmt.num(100 * Mo.theory[i], 1), tx, ty - 9, { size: 11, color: p.accent, align: 'center', weight: 700 }); }
        if (cnt <= 9 || i % 10 === 0) txt(g, String(i + start()), tx, B + 16, { size: 12, color: p.ink, align: 'center', weight: 700 });
      }
      g.fillStyle = p.obj3; g.fillRect(L + 4, 8, 11, 11); txt(g, t(['tes données (', 'your data (']) + Mo.n + ')', L + 19, 18, { size: 12, color: p.ink });
      line(g, W - R - 110, 14, W - R - 94, 14, p.accent, 3); txt(g, 'log₁₀(1 + 1/d)', W - R, 18, { size: 12, color: p.accent, weight: 700, align: 'right' });
      if (!Mo.n) txt(g, t(['Aucune valeur exploitable.', 'No usable value.']), W / 2, H / 2, { size: 13, color: p.muted, align: 'center' });
    });
    const ruler = panel(wrap, 560, 150, t(['La règle logarithmique : chaque valeur tombe sur une graduation de 1 à 10', 'The logarithmic ruler: each value lands on a mark between 1 and 10']), (g, W, H, p) => {
      const x = v => L + Math.log10(v) * (W - L - R), Y = 82, d0 = start(), top = d0 === 1 ? 10 : 100;
      const xs = v => L + (Math.log10(v) - Math.log10(d0)) / (Math.log10(top) - Math.log10(d0)) * (W - L - R);
      void x;
      for (let d = d0; d < top; d += d0 === 1 ? 1 : 1) {
        const a = xs(d), b = xs(d + 1);
        if (d0 === 10 && d % 10 !== 0 && d !== 99) { line(g, a, Y, a, Y + 6, p.line); continue; }
        g.fillStyle = (d % 2) ? p.sunken : p.surface; g.fillRect(a, Y, b - a, 22); g.strokeStyle = p.ink; g.lineWidth = 1; g.strokeRect(a, Y, b - a, 22);
        if (b - a > 20 || d0 === 10) txt(g, String(d), (a + b) / 2, Y + 15, { size: 12, color: p.ink, align: 'center', weight: 700 });
      }
      // the data, one tick per value, at log10 of its mantissa: where Benford lives
      const vals = Mo.values; const step = Math.max(1, Math.floor(vals.length / 1500));
      g.strokeStyle = p.c[0]; g.lineWidth = 1; g.globalAlpha = .45; g.beginPath();
      for (let i = 0; i < vals.length; i += step) { const v = Math.abs(vals[i] * S.scale); if (!v || !Number.isFinite(v)) continue; const m = v / 10 ** Math.floor(Math.log10(v)), mm = d0 === 1 ? m : m * 10; if (mm < d0 || mm >= top) continue; const px = xs(mm); g.moveTo(px, Y - 6); g.lineTo(px, Y - 36 - 0); }
      g.stroke(); g.globalAlpha = 1;
      txt(g, t(['position = log₁₀ de la mantisse (écrite de 1 à 10)', 'position = log₁₀ of the mantissa (written from 1 to 10)']), L, 20, { size: 12, color: p.ink });
      txt(g, t(['Largeur du chiffre d = log₁₀(1 + 1/d) : le 1 occupe 30 %, le 9 moins de 5 %.', 'Width of digit d = log₁₀(1 + 1/d): the 1 takes 30%, the 9 less than 5%.']), L, Y + 44, { size: 12, color: p.muted });
      if (d0 === 1) { txt(g, '1', xs(1), Y + 64, { size: 11, color: p.muted, align: 'center' }); txt(g, '10', xs(10), Y + 64, { size: 11, color: p.muted, align: 'center' }); }
    });
    return {
      panels: [bars, ruler],
      set(s, m) {
        S = s; Mo = m; if (shown.length !== m.counts.length) shown = m.frequency.map(() => 0);
        const sub = m.frequency.slice(0, 9).map((f, i) => `${i + start()}: ${fmt.num(100 * f, 1)} %`).join(', ');
        bars.cv.setAttribute('aria-label', `${t(['Fréquences observées', 'Observed frequencies'])}, n = ${m.n}. ${s.digits === 1 ? sub : ''}`); ruler.cv.setAttribute('aria-label', t(['Règle logarithmique avec les valeurs', 'Logarithmic ruler with the values']));
      },
      step(k) { let moving = false; shown = shown.map((v, i) => { const d = Mo.frequency[i] - v; if (Math.abs(d) < .0004) return Mo.frequency[i]; moving = true; return v + d * k; }); return moving; },
    };
  },
};

function car(g, cx, by, p) {
  g.fillStyle = p.accent; g.fillRect(cx - 34, by - 30, 68, 18); g.fillRect(cx - 20, by - 46, 38, 18);
  g.fillStyle = p.sunken; g.fillRect(cx - 15, by - 42, 12, 11); g.fillRect(cx + 2, by - 42, 12, 11);
  g.fillStyle = p.ink; for (const dx of [-20, 20]) { g.beginPath(); g.arc(cx + dx, by - 11, 8, 0, 7); g.fill(); }
}
function goat(g, cx, by, p) {
  g.fillStyle = p.obj3; g.strokeStyle = p.ink; g.lineWidth = 2;
  g.fillRect(cx - 26, by - 52, 48, 26); g.strokeRect(cx - 26, by - 52, 48, 26);
  for (const dx of [-22, -10, 8, 18]) line(g, cx + dx, by - 26, cx + dx, by, p.ink, 3);
  g.fillRect(cx + 16, by - 74, 18, 24); g.strokeRect(cx + 16, by - 74, 18, 24);
  line(g, cx + 20, by - 74, cx + 17, by - 88, p.ink, 2.5); line(g, cx + 30, by - 74, cx + 33, by - 88, p.ink, 2.5); line(g, cx + 25, by - 50, cx + 25, by - 40, p.ink, 2);
  g.fillStyle = p.ink; g.fillRect(cx + 26, by - 66, 3, 3);
}
// The probability tree for an informed host, you having picked door 1: three equally likely prizes, then the host's forced or free reveal.
function tree(g, W, H, p, t) {
  const x1 = Math.round(W * .3), x2 = Math.round(W * .62), pw = Math.max(72, Math.round(W * .2)), x3 = W - pw - 6;
  const rows = [[44, 0, t(['ouvre 2 : 1/6', 'opens 2: 1/6']), false], [92, 0, t(['ouvre 3 : 1/6', 'opens 3: 1/6']), false], [152, 1, t(['ouvre 3 : 1/3', 'opens 3: 1/3']), true], [208, 2, t(['ouvre 2 : 1/3', 'opens 2: 1/3']), true]];
  const prizeY = [68, 152, 208], mid = H / 2 - 10;
  txt(g, t(['ton choix :', 'your pick:']), 6, mid - 14, { size: 11, color: p.muted }); txt(g, t(['porte 1', 'door 1']), 6, mid + 2, { size: 12, color: p.ink, weight: 700 });
  prizeY.forEach((y, i) => { line(g, 62, mid, x1 - 4, y, p.ink, 1.5); txt(g, t(['prix en ', 'prize at ']) + (i + 1), x1, y - 18, { size: 11, color: p.ink, weight: 700 }); txt(g, '1/3', x1, y - 6, { size: 11, color: p.muted }); });
  for (const [y, pi, label, sw] of rows) {
    line(g, x1 + 46, prizeY[pi] - 2, x2 - 4, y, p.ink, 1.2); txt(g, label, x2, y - 6, { size: 11, color: p.ink });
    g.fillStyle = sw ? p.accent : p.obj2; g.fillRect(x3, y - 4, pw, 20); txt(g, sw ? t(['changer gagne', 'switch wins']) : t(['rester gagne', 'stay wins']), x3 + pw / 2, y + 10, { size: 10.5, color: sw ? css('--accent-ink') : p.surface, align: 'center', weight: 700 });
  }
  txt(g, t(['Rester : 1/6 + 1/6 = 1/3', 'Stay: 1/6 + 1/6 = 1/3']), 6, H - 28, { size: 12, color: p.ink, weight: 700 });
  txt(g, t(['Changer : 1/3 + 1/3 = 2/3', 'Switch: 1/3 + 1/3 = 2/3']), 6, H - 10, { size: 12, color: p.accent, weight: 700 });
}

export function createFigure(id, host, ctx) {
  const probe = document.createElement('canvas');
  if (!BUILD[id] || !probe.getContext?.('2d')) return null;
  const wrap = document.createElement('div'); wrap.className = 'inf-fig'; host.append(wrap);
  const B = BUILD[id]({ ...ctx, wrap });
  let ready = false;
  const loop = animationLoop(wrap, (dt) => { if (!ready) return false; const moving = B.step(dt > 0 ? 1 - Math.exp(-12 * dt) : 1, dt); B.panels.forEach(p => p.paint()); return moving ? true : false; }, { reduced: ctx.reduced });
  return {
    wrap, overlay: B.overlay || null,
    update(s, m) { ready = true; B.set(s, m); B.panels.forEach(p => { p.live = true; }); loop.wake(60); },
    destroy() { loop.stop(); B.destroy?.(); B.panels.forEach(p => p.dispose?.()); wrap.remove(); },
  };
}
