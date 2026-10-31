// The Gömböc of Várkonyi and Domokos (2006): a smooth, homogeneous, convex body with one stable and one unstable equilibrium.
// Exact radial law and mass properties: gomboc-body.js. Rolling dynamics without slipping: gomboc-rolling.js. Drawing: gomboc-gl.js.
import { exhibit, button, field, palette, path, dot as drawDot } from './gallery-kit.js';
import { CAM3_DEFAULT, cam3Project, cam3TurnFree } from './camera3d.js';
import * as B from './gomboc-body.js';
import * as P from './gomboc-rolling.js';
import { createGombocGL } from './gomboc-gl.js';

const CENTRE = [320, 215], SCALE = 150, MAP_W = 168, MAP_H = 84;
const PRESETS = { tilt: { colatitude: 1, azimuth: 0.4 }, near: { colatitude: 0.15, azimuth: 1.2 }, nearUnstable: { colatitude: Math.PI - 0.02, azimuth: 0.7 }, stable: { colatitude: 0 }, unstable: { colatitude: Math.PI } };

export function gomboc(root, opts) {
  const { t, lang } = opts, reduced = typeof opts.reduced === 'function' ? opts.reduced : () => !!opts.reduced;
  const num = (v, d = 3) => Number(v).toLocaleString(lang, { maximumFractionDigits: d });
  let alive = true, glr = null, mesh = null, s = null, playing = false, dirty = true, drag = null, accumulator = 0, check = null, baseline = 0, keyboardBody = false, trail = [], mapTrail = [], mapImage = null;
  const cam = { ...CAM3_DEFAULT };
  const o = exhibit(root, { ...opts, reduced }, t(
    'Glisse pour tourner la vue : le corps se regarde sous tous les angles, de dessus comme de dessous. Choisis « Incliner » ou « Pousser » pour agir sur le corps. Au clavier : flèches pour tourner la vue ; H sélectionne le corps (les flèches l’inclinent), Échap le relâche ; P pousse ; Espace lance la lecture ; 0 recentre le zoom.',
    'Drag to turn the view: the body can be seen from every angle, above and below. Choose "Tip" or "Push" to act on the body. Keyboard: arrows turn the view; H selects the body (arrows tip it), Escape releases it; P pushes; Space toggles playback; 0 resets the zoom.'),
    `<label class="act-field"><span class="act-label">${t('Geste', 'Gesture')}</span><select id="go-mode"><option value="orbit">${t('Tourner la vue', 'Turn the view')}</option><option value="tip">${t('Incliner le corps', 'Tip the body')}</option><option value="push">${t('Pousser le corps', 'Push the body')}</option></select></label>` +
    `<label class="act-field"><span class="act-label">${t('Départ', 'Start')}</span><select id="go-preset"><option value="tilt">${t('Incliné de 1 rad', 'Tipped by 1 rad')}</option><option value="near">${t('Presque sur le pôle stable', 'Almost on the stable pole')}</option><option value="nearUnstable">${t('Presque sur le pôle instable', 'Almost on the unstable pole')}</option><option value="stable">${t('Pôle stable, exactement', 'Stable pole, exactly')}</option><option value="unstable">${t('Pôle instable, exactement', 'Unstable pole, exactly')}</option></select></label>` +
    button('go-play', t('Lecture', 'Play'), true) + button('go-step', t('Un pas', 'One step')) + button('go-reset', t('Recommencer', 'Restart')) + button('go-view', t('Vue initiale', 'Reset view')) +
    field('go-relief', t('Relief exagéré ×', 'Relief exaggeration ×'), 1, 3000, 1, 1500) +
    field('go-speed', t('Vitesse de lecture ×', 'Playback speed ×'), 1, 500, 1, 100) +
    `<label><input id="go-follow" type="checkbox" checked> ${t('Suivre le corps', 'Follow the body')}</label>` +
    `<details><summary>${t('Contact et précision', 'Contact and precision')}</summary>` +
    field('go-rolling', t('Résistance au roulement κ (0 : aucune perte)', 'Rolling resistance κ (0: no loss)'), 0, 0.005, 0.0001, 0.0007) +
    `<label class="act-field"><span class="act-label">${t('Pas de calcul', 'Time step')}</span><select id="go-dt"><option value="0.1">0,1 s</option><option value="0.05" selected>0,05 s</option><option value="0.02">0,02 s</option></select></label>` +
    button('go-check', t('Comparer avec un pas deux fois plus petit', 'Compare with half the time step')) + `</details>`,
    `<p>${t('Le corps est celui de Várkonyi et Domokos (2006) : en coordonnées sphériques, R(θ,φ) = 1 + d·ΔR(θ,φ), avec ΔR construit à partir de f(φ) = π[(e^{φ/(cπ)+1/(2c)} − 1)/(e^{1/c} − 1) − ½]. Le paramètre c est fixé pour que le centre de gravité du corps homogène soit l’origine (c ≈ 0,27824) et d = 2·10⁻⁵ garantit la convexité (borne des auteurs : environ 5·10⁻⁵). Le corps est donc une sphère à 0,002 % près : ce n’est pas un défaut du dessin, c’est la mathématique. Le curseur « Relief exagéré » ne change que l’image, et au-delà de ×1 le corps dessiné n’est ni convexe ni un Gömböc.', 'The body is the one of Várkonyi and Domokos (2006): in spherical coordinates R(θ,φ) = 1 + d·ΔR(θ,φ), with ΔR built from f(φ) = π[(e^{φ/(cπ)+1/(2c)} − 1)/(e^{1/c} − 1) − ½]. The parameter c is fixed so that the centre of gravity of the homogeneous body is the origin (c ≈ 0.27824) and d = 2·10⁻⁵ ensures convexity (the authors\' bound is about 5·10⁻⁵). The body is therefore a sphere to within 0.002 %: this is not a flaw of the drawing, it is the mathematics. The "Relief exaggeration" slider changes the picture only, and beyond ×1 the drawn body is neither convex nor a Gömböc.')}</p>` +
    `<p>${t('Les couleurs montrent ΔR : bleu où R < 1 (partie mince), orange où R > 1 (partie épaisse). La courbe sombre ΔR = 0 les sépare. Le pôle sud S (φ = −π/2, ΔR = −1) est le seul minimum, donc l’équilibre stable ; le pôle nord N (ΔR = +1) est le seul maximum, donc l’équilibre instable. Le quadrillage tourne avec le corps et rend le roulement visible. La carte en bas à droite est le corps déroulé (longitude, latitude) : le point est le contact actuel.', 'The colours show ΔR: blue where R < 1 (thin part), orange where R > 1 (thick part). The dark curve ΔR = 0 separates them. The south pole S (φ = −π/2, ΔR = −1) is the only minimum, so the stable equilibrium; the north pole N (ΔR = +1) is the only maximum, so the unstable equilibrium. The grid turns with the body and makes the rolling visible. The map at the bottom right is the body unrolled (longitude, latitude): the dot is the current contact.')}</p>` +
    `<p>${t('Physique. Le contact est exact (la surface est lisse, aucune approximation polyédrique) : le point de contact est celui dont la normale est verticale, et la hauteur du centre de gravité est la fonction d’appui H(ν) du corps. Le corps roule sans glisser. Les équations de Newton et d’Euler donnent ω′ par un système linéaire 3×3 ; l’énergie ½|v|² + ½ωᵀIω + gH est conservée quand κ = 0 (le programme la compare à l’énergie de départ). La résistance au roulement est un couple −κNω pendant le contact (N force normale) : elle ne fait que retirer de l’énergie. Les rayons de courbure valent 1 à 10⁻⁴ près : le corps se redresse très lentement (périodes de plusieurs minutes, d’où la vitesse de lecture), et le frottement nécessaire pour ne pas glisser est de l’ordre de 10⁻⁴ (affiché). Sans pertes, il oscille indéfiniment autour du pôle stable ; avec pertes, il s’y arrête.', 'Physics. The contact is exact (the surface is smooth, there is no polyhedral approximation): the contact point is the one whose normal is vertical, and the height of the centre of gravity is the support function H(ν) of the body. The body rolls without slipping. Newton\'s and Euler\'s equations give ω′ through a 3×3 linear system; the energy ½|v|² + ½ωᵀIω + gH is conserved when κ = 0 (the program compares it with the starting energy). Rolling resistance is a couple −κNω during contact (N the normal force): it only removes energy. The radii of curvature equal 1 to within 10⁻⁴: the body rights itself very slowly (periods of several minutes, hence the playback speed), and the friction needed to avoid slipping is of the order of 10⁻⁴ (displayed). Without losses it oscillates for ever about the stable pole; with losses it comes to rest there.')}</p>` +
    `<p>${t('Sources : Várkonyi et Domokos, J. Nonlinear Sci. 16 (2006) 255-281, section 3, équations (1) à (8). La seconde forme de l’équation (7) imprimée dans l’article (cos²f(φ)/cos²f(−φ)) est l’inverse de la première ; seule la première est cohérente avec la limite (22), les figures 6 et 9 et la valeur c ≈ 0,275 des auteurs, et c’est elle qui est utilisée.', 'Sources: Várkonyi and Domokos, J. Nonlinear Sci. 16 (2006) 255-281, section 3, equations (1) to (8). The second form of equation (7) as printed (cos²f(φ)/cos²f(−φ)) is the inverse of the first; only the first agrees with the limit (22), figures 6 and 9 and the authors\' value c ≈ 0.275, and it is the one used.')}</p>`);
  const play = root.querySelector('#go-play'), inputs = Object.fromEntries(['mode', 'preset', 'speed', 'relief', 'rolling', 'dt', 'follow'].map((k) => [k, root.querySelector('#go-' + k)]));
  const abort = new AbortController(), kappa = () => +inputs.rolling.value, relief = () => +inputs.relief.value, stepSize = () => +inputs.dt.value;
  function reset() { s = P.start(PRESETS[inputs.preset.value]); baseline = P.diagnostics(s, kappa()).energy; check = null; playing = false; trail = []; mapTrail = []; remember(); dirty = true; accumulator = 0; updatePlay(); }
  function remember() {
    const d = P.derived(s), last = trail[trail.length - 1];
    if (!last || Math.hypot(last[0] - s.c[0], last[1] - s.c[1]) > 0.004) { trail.push([s.c[0], s.c[1]]); if (trail.length > 900) trail.shift(); }
    const w = d.hit.w, m = mapTrail[mapTrail.length - 1];
    if (!m || Math.hypot(m[0] - w[0], m[1] - w[1], m[2] - w[2]) > 0.004) { mapTrail.push(w); if (mapTrail.length > 600) mapTrail.shift(); }
  }
  function updatePlay() { play.textContent = playing ? t('Pause', 'Pause') : t('Lecture', 'Play'); play.setAttribute('aria-pressed', String(playing)); }
  function run() { if (reduced()) { playing = false; tick(5); } else playing = !playing; dirty = true; updatePlay(); }
  function tick(seconds) { s = P.simulate(s, seconds, kappa(), stepSize()); remember(); dirty = true; }
  o.on(play, 'click', run); o.on(root.querySelector('#go-step'), 'click', () => tick(10));
  o.on(root.querySelector('#go-reset'), 'click', reset); o.on(inputs.preset, 'change', reset);
  o.on(root.querySelector('#go-view'), 'click', () => { Object.assign(cam, CAM3_DEFAULT); o.navigation?.camera?.reset?.(); dirty = true; });
  for (const k of ['speed', 'relief', 'rolling']) { const el = inputs[k], out = root.querySelector('#go-' + k + '-out'); out.textContent = num(el.value, k === 'rolling' ? 4 : 0); o.on(el, 'input', () => { out.textContent = num(el.value, k === 'rolling' ? 4 : 0); check = null; dirty = true; }); }
  o.on(inputs.dt, 'change', () => { check = null; dirty = true; }); o.on(inputs.follow, 'change', () => { dirty = true; });
  o.on(root.querySelector('#go-check'), 'click', () => {
    playing = false; updatePlay();
    const a = P.simulate(s, 60, kappa(), stepSize()), b = P.simulate(s, 60, kappa(), stepSize() / 2), da = P.derived(a), db = P.derived(b);
    check = { position: Math.hypot(da.p[0] - db.p[0], da.p[1] - db.p[1], da.p[2] - db.p[2]), angle: Math.acos(Math.max(-1, Math.min(1, da.hit.w[0] * db.hit.w[0] + da.hit.w[1] * db.hit.w[1] + da.hit.w[2] * db.hit.w[2]))) }; dirty = true;
  });
  const project = (p) => { const q = cam3Project(cam.yaw, cam.pitch, ...p); return [CENTRE[0] + q.u * SCALE, CENTRE[1] - q.v * SCALE, q.d]; };
  const worldScreen = (dx, dy) => { const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw); return [cy * dx + sy * dy, -sy * dx + cy * dy]; };
  function offsetNow() { if (!inputs.follow.checked || !s) return [0, 0]; const p = P.derived(s).p, a = project([p[0], p[1], 0]), base = project([0, 0, 0]); return [base[0] - a[0], base[1] - a[1]]; }
  function tipBody(dx, dy) { const w = worldScreen(dx, -dy); s = P.tilt(s, -w[1] * 0.004, w[0] * 0.004); baseline = P.diagnostics(s, kappa()).energy; check = null; dirty = true; }
  function pushBody(dx, dy) { const w = worldScreen(dx, -dy); s = P.spin(s, [-w[1] * 0.0004, w[0] * 0.0004, 0]); baseline = P.diagnostics(s, kappa()).energy; dirty = true; }
  const insideBody = (p) => { const off = offsetNow(), dp = P.derived(s).p, c = project(dp); return Math.hypot(p[0] - c[0] - off[0], p[1] - c[1] - off[1]) < SCALE * 1.12; };
  o.touchHit((p) => !!s && insideBody(p));
  o.on(o.cv, 'pointerdown', (e) => { if (!s) return; const p = o.point(e), mode = inputs.mode.value; drag = { p, last: p, mode: mode !== 'orbit' && insideBody(p) ? mode : 'orbit' }; playing = false; updatePlay(); o.cv.setPointerCapture?.(e.pointerId); e.preventDefault(); });
  o.on(o.cv, 'pointermove', (e) => {
    if (!drag) return; const p = o.point(e), dx = p[0] - drag.last[0], dy = p[1] - drag.last[1];
    if (drag.mode === 'orbit') cam3TurnFree(cam, dx * 0.008, dy * 0.008);
    if (drag.mode === 'tip') tipBody(dx, dy);
    if (drag.mode === 'push') { drag.pushed = [(drag.pushed?.[0] || 0) + dx, (drag.pushed?.[1] || 0) + dy]; }
    drag.last = p; dirty = true;
  });
  o.on(o.cv, 'pointerup', () => { if (!drag) return; if (drag.mode === 'push' && drag.pushed) { pushBody(...drag.pushed); if (!reduced()) playing = true; } drag = null; updatePlay(); dirty = true; });
  o.cancelDrag = () => { drag = null; };
  o.cv.setAttribute('aria-label', t('Gömböc en trois dimensions, à voir sous tous les angles. Flèches : tourner la vue ; H puis flèches : incliner le corps ; Espace : lecture.', 'Three-dimensional Gömböc, to be seen from every angle. Arrows: turn the view; H then arrows: tip the body; Space: play.'));
  o.on(o.cv, 'keydown', (e) => {
    if (!s) return; const arrow = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (e.shiftKey && arrow) return;
    if (e.key.toLowerCase() === 'h') { e.preventDefault(); keyboardBody = true; dirty = true; }
    if (e.key === 'Escape') { e.preventDefault(); keyboardBody = false; dirty = true; }
    if (arrow) { e.preventDefault(); if (keyboardBody) tipBody(...arrow); else cam3TurnFree(cam, arrow[0] * 0.012, arrow[1] * 0.012); dirty = true; }
    if (e.code === 'Space') { e.preventDefault(); run(); }
    if (e.key.toLowerCase() === 'p') { e.preventDefault(); pushBody(30, -10); if (!reduced()) { playing = true; updatePlay(); } dirty = true; }
  });

  // colour of the body for a value of ΔR (the ramp of the shader), used by the map and the 2D fallback
  const ramp = (v) => { const x = Math.max(-1, Math.min(1, v)), a = x < 0 ? [36, 97, 179] : [219, 92, 36], m = [230, 224, 209], k = Math.abs(x); return [0, 1, 2].map((i) => Math.round(m[i] + (a[i] - m[i]) * k)); };
  function buildMap() {
    const cv = document.createElement('canvas'); cv.width = MAP_W; cv.height = MAP_H; const g = cv.getContext('2d'), img = g.createImageData(MAP_W, MAP_H);
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) { const th = ((x + 0.5) / MAP_W) * 2 * Math.PI - Math.PI, ph = Math.PI / 2 - ((y + 0.5) / MAP_H) * Math.PI, c = ramp(B.deltaR(th, ph).v), i = 4 * (y * MAP_W + x); img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); return cv;
  }
  function drawMap(g, C, hitW) {
    mapImage ||= buildMap();
    const k = o.cv.width / o.W, x0 = o.W - MAP_W - 10, y0 = o.H - MAP_H - 10;
    g.save(); g.setTransform(k, 0, 0, k, 0, 0); g.drawImage(mapImage, x0, y0); g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, MAP_W - 1, MAP_H - 1);
    const at = (w) => { const a = B.angles(w); return [x0 + ((a.theta + Math.PI) / (2 * Math.PI)) * MAP_W, y0 + ((Math.PI / 2 - a.phi) / Math.PI) * MAP_H]; };
    g.strokeStyle = '#111'; g.lineWidth = 1; g.globalAlpha = 0.7; let prev = null;
    for (const w of mapTrail) { const p = at(w); if (prev && Math.abs(p[0] - prev[0]) < MAP_W / 2) { g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke(); } prev = p; }
    g.globalAlpha = 1; const cur = at(hitW); g.fillStyle = '#111'; g.beginPath(); g.arc(cur[0], cur[1], 3.5, 0, 2 * Math.PI); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.stroke();
    g.font = 'bold 10px system-ui'; g.fillStyle = '#111'; g.textAlign = 'left'; g.fillText('N', x0 + 3, y0 + 11); g.fillText('S', x0 + 3, y0 + MAP_H - 4);
    g.restore();
  }
  function drawFloor(g, C, P0, below) {
    // a plane of half-width 3 around the body, with lines every half unit fixed to the plane (they slide as the body rolls)
    const lines = [], x0 = P0[0] - 3, x1 = P0[0] + 3, y0 = P0[1] - 3, y1 = P0[1] + 3;
    for (let x = Math.ceil(x0 * 2) / 2; x <= x1; x += 0.5) lines.push([[x, y0], [x, y1]]);
    for (let y = Math.ceil(y0 * 2) / 2; y <= y1; y += 0.5) lines.push([[x0, y], [x1, y]]);
    g.save(); g.globalAlpha = below ? 0.22 : 1;
    path(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(offsetPoint), { close: true, fill: C.surface, stroke: C.line, width: 1 });
    for (const [a, b] of lines) path(g, [offsetPoint(a), offsetPoint(b)], { stroke: C.line, width: 0.6, alpha: 0.5 });
    g.restore();
  }
  let curOffset = [0, 0];
  const offsetPoint = (p) => { const q = project([p[0], p[1], 0]); return [q[0] + curOffset[0], q[1] + curOffset[1], q[2]]; };

  function draw() {
    const C = palette(), g = o.g; g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.sunken; g.fillRect(0, 0, o.W, o.H);
    if (!s) return;
    const d = P.derived(s), R = P.rotation(s.q), k = relief() * B.D;
    curOffset = offsetNow(); const off = curOffset, below = cam.pitch < 0.03;
    const Pj = (p) => { const q = project(p); return [q[0] + off[0], q[1] + off[1], q[2]]; };
    if (!below) drawFloor(g, C, d.p, false);
    // contact shadow, darker and tighter near the plane; the contact point and the path it has followed on the plane
    { const c0 = Pj([d.p[0], d.p[1], 0]), ex = Pj([d.p[0] + 1, d.p[1], 0]), ey = Pj([d.p[0], d.p[1] + 1, 0]), grad = g.createRadialGradient(0, 0, 0, 0, 0, 1.15);
      grad.addColorStop(0, 'rgba(0,0,0,.38)'); grad.addColorStop(0.6, 'rgba(0,0,0,.18)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.transform(ex[0] - c0[0], ex[1] - c0[1], ey[0] - c0[0], ey[1] - c0[1], c0[0], c0[1]); g.fillStyle = grad; g.beginPath(); g.arc(0, 0, 1.15, 0, 2 * Math.PI); g.fill(); g.restore(); }
    if (trail.length > 1) path(g, trail.map((q) => Pj([q[0], q[1], 0])), { stroke: C.neg, width: 1.6, alpha: 0.75 });
    // body
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), toViewer = [-sy * cp, -cy * cp, sp], right = [cy, -sy, 0];
    if (glr && !glr.lost) {
      const key = [0.55 * toViewer[0] - 0.5 * right[0], 0.55 * toViewer[1] - 0.5 * right[1], 0.55 * toViewer[2] - 0.5 * right[2] + 0.8];
      const img = glr.render({ width: o.cv.width, height: o.cv.height, size: [o.W, o.H], R, p: d.p, view: [cy, -sy, 0, sy * sp, cy * sp, cp, sy * cp, cy * cp, -sp], centre: CENTRE, scale: SCALE, k, offset: off, camera: o.navigation?.camera, toViewer, key });
      if (img) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(img, 0, 0, o.cv.width, o.cv.height); g.restore(); } else glr = null;
    }
    if (!glr) fallback(g, C, R, d, k, Pj, toViewer);
    if (below) drawFloor(g, C, d.p, true);
    // the two equilibria
    const place = (w) => { const r = B.surface(w, relief()), v = P.rotationApply(R, r); return [v[0] + d.p[0], v[1] + d.p[1], v[2] + d.p[2]]; };
    const facing = (w) => { const v = P.rotationApply(R, w); return v[0] * toViewer[0] + v[1] * toViewer[1] + v[2] * toViewer[2] > 0.05; };
    const south = [0, 0, -1], north = [0, 0, 1];
    if (facing(south)) drawDot(g, Pj(place(south)), C.pos, 6, t('S : stable', 'S: stable')); if (facing(north)) drawDot(g, Pj(place(north)), C.obj2, 6, t('N : instable', 'N: unstable'));
    const cc = Pj([s.c[0], s.c[1], 0]); drawDot(g, cc, C.neg, 4);
    drawMap(g, C, d.hit.w);
    // readout
    const dg = P.diagnostics(s, kappa()), e0 = (dg.energy - baseline) / (P.GRAVITY * B.D);
    let text = `${t('Temps', 'Time')} ${num(s.t, 0)} s · ${t('contact à', 'contact at')} ${num(dg.angleStable * 180 / Math.PI, 1)}° ${t('du pôle stable', 'from the stable pole')} · ${t('hauteur de G', 'height of G')} = 1 ${dg.heightOverD < 0 ? '−' : '+'} ${num(Math.abs(dg.heightOverD), 2)} d · ${t('E − E₀', 'E − E₀')} ≈ ${num(e0, 4)} g·d · ${t('frottement nécessaire', 'friction needed')} μ ≥ ${num(dg.slip, 6)}`;
    text += relief() > 1 ? ` · ${t('Dessin avec relief ×' + num(relief(), 0) + ' : le corps réel est une sphère à 0,002 % près', 'Drawing with relief ×' + num(relief(), 0) + ': the real body is a sphere to within 0.002 %')}` : ` · ${t('Corps réel, à l’échelle', 'Real body, to scale')}`;
    if (check) text += ` · ${t('Écart après 60 s avec Δt/2 : position', 'Difference after 60 s with Δt/2: position')} ≈ ${num(check.position, 9)}, ${t('direction du contact', 'contact direction')} ≈ ${num(check.angle, 9)} rad`;
    if (keyboardBody) text += ` · ${t('Corps sélectionné : les flèches l’inclinent.', 'Body selected: arrows tip it.')}`;
    if (reduced()) text += ` · ${t('Mouvement réduit : avance avec Un pas (10 s).', 'Reduced motion: use One step (10 s).')}`;
    o.read(text);
  }
  // CPU drawing when WebGL2 is not available: the same radial law on a coarse mesh, shaded with the exact normal
  function fallback(g, C, R, d, k, Pj, toViewer) {
    mesh ||= B.buildMesh(72, 36); const m = mesh, pts = new Array(m.vertices), nrm = new Array(m.vertices);
    for (let i = 0; i < m.vertices; i++) {
      const w = [m.dir[3 * i], m.dir[3 * i + 1], m.dir[3 * i + 2]], rho = 1 + k * m.delta[i], q = P.rotationApply(R, w.map((x) => x * rho)), gr = [m.grad[3 * i], m.grad[3 * i + 1], m.grad[3 * i + 2]];
      const nb = [w[0] - (k * gr[0]) / rho, w[1] - (k * gr[1]) / rho, w[2] - (k * gr[2]) / rho], nn = P.rotationApply(R, nb), l = Math.hypot(...nn) || 1;
      pts[i] = Pj([q[0] + d.p[0], q[1] + d.p[1], q[2] + d.p[2]]); nrm[i] = nn.map((x) => x / l);
    }
    const faces = [];
    for (let i = 0; i < m.indices.length; i += 3) {
      const a = m.indices[i], b = m.indices[i + 1], c = m.indices[i + 2], n = [0, 1, 2].map((x) => (nrm[a][x] + nrm[b][x] + nrm[c][x]) / 3), facing = n[0] * toViewer[0] + n[1] * toViewer[1] + n[2] * toViewer[2];
      if (facing <= 0) continue;
      const light = Math.max(0, n[0] * 0.4 + n[1] * 0.4 + n[2] * 0.8) / 1.0, col = ramp((m.delta[a] + m.delta[b] + m.delta[c]) / 3).map((x) => Math.round(x * (0.45 + 0.55 * Math.min(1, light + 0.2))));
      faces.push({ p: [pts[a], pts[b], pts[c]], col, depth: (pts[a][2] + pts[b][2] + pts[c][2]) / 3 });
    }
    faces.sort((x, y) => y.depth - x.depth);
    for (const f of faces) { const css = `rgb(${f.col[0]},${f.col[1]},${f.col[2]})`; path(g, f.p, { close: true, fill: css, stroke: css, width: 0.7 }); }
  }
  o.animate((dt) => {
    if (reduced() && playing) { playing = false; updatePlay(); }
    if (playing && dt && s) { accumulator += dt * +inputs.speed.value; const h = stepSize(); let n = 0; while (accumulator >= h && n++ < 400) { s = P.advance(s, h, kappa()); accumulator -= h; } if (n >= 400) accumulator = 0; remember(); dirty = true; }
    if (dirty || playing) { dirty = false; draw(); }
  });
  try { mesh = B.buildMesh(); glr = createGombocGL(mesh); } catch { glr = null; }
  reset(); o.redraw();
  root.__gomboc = { getState: () => s, getCamera: () => cam, setPreset: (value) => { inputs.preset.value = value; reset(); }, step: tick, usesGL: () => !!glr };
  return () => { alive = false; abort.abort(); o.stop(); glr?.destroy(); delete root.__gomboc; };
}
