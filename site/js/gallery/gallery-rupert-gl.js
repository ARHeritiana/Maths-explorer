// Prince Rupert's cube on the GPU (maths in gallery-rupert-model.js; stage in gl3d.js; 2D fallback gallery-rupert.js). One 3D scene:
// the block, really drilled (its faces are cut away inside the tunnel in the fragment shader, and the tunnel walls are the
// tunnel's sides clipped to the block), and the piece above it, which slides down the tunnel when it fits. Drag the piece or the
// block to turn it (a trackball turn about the screen axes), drag elsewhere to turn the view; the tunnel is recomputed at once.
// Animations: the passage (play, pause, or the slider), a verified passage reached by a smooth turn of both solids, a live search
// for a passage (random local turns, the best kept), a camera flight along the tunnel axis, and an automatic turn of the view.
// An inset draws the two shadows seen along the tunnel, where the question is decided.
import { glStage, compile, vao, rgb, GLSL_LIGHT, clamp } from './gl3d.js';
import { illuminateFeedback } from '../motion.js';
import { metricStrip } from './gallery-panels.js';
import { solid, rotation, apply, passage, planesOf, tunnelWalls, rayConvex, axisRotation, mul3, orthonormalize, slerp, searchStep, WITNESSES, NIEUWLAND, SHAPES } from './gallery-rupert-model.js';

const NAMES = { cube: ['Cube', 'Cube'], tetrahedron: ['Tétraèdre', 'Tetrahedron'], octahedron: ['Octaèdre', 'Octahedron'], dodecahedron: ['Dodécaèdre', 'Dodecahedron'], icosahedron: ['Icosaèdre', 'Icosahedron'], rhombicosidodecahedron: ['Rhombicosidodécaèdre', 'Rhombicosidodecahedron'] };
const RING_MAX = 64, GAP = 0.25;   // most sides a tunnel can have; clearance between the piece and the block at both ends of the passage

const VS = `#version 300 es
precision highp float;
in vec3 aP; in vec3 aN;
uniform mat4 uVP; uniform vec3 uShift;
out vec3 vW; out vec3 vN;
void main(){ vW = aP + uShift; vN = aN; gl_Position = uVP * vec4(vW, 1.0); }`;
const FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vW; in vec3 vN;
uniform vec3 uEye, uCol; uniform float uAlpha; uniform int uFlat, uHole, uN; uniform vec3 uRing[${RING_MAX}];
out vec4 frag;
${GLSL_LIGHT}
void main(){
  if (uHole == 1 && uN > 0) {   // inside the tunnel the block is cut away
    bool inside = true;
    for (int k = 0; k < ${RING_MAX}; k++) { if (k >= uN) break; if (dot(uRing[k].xy, vW.xy) > uRing[k].z) { inside = false; break; } }
    if (inside) discard;
  }
  if (uFlat == 1) { frag = vec4(pow(uCol, vec3(1.0 / 2.2)) * uAlpha, uAlpha); return; }
  vec3 V = normalize(uEye - vW), n = normalize(vN); if (dot(n, V) < 0.0) n = -n;
  frag = vec4(toSRGB(studio(uCol, n, V, 60.0, 0.35)) * uAlpha, uAlpha);
}`;

// triangles (fan per convex polygon) and edge lines of a list of polygons {pts, n}
function meshOf(polys) {
  const tri = [], lin = [];
  for (const { pts, n } of polys) {
    for (let i = 1; i + 1 < pts.length; i++) for (const p of [pts[0], pts[i], pts[i + 1]]) tri.push(...p, ...n);
    pts.forEach((p, i) => lin.push(...p, ...n, ...pts[(i + 1) % pts.length], ...n));
  }
  return { tri: new Float32Array(tri), lin: new Float32Array(lin) };
}

export function rupertCubesGL(root, opts) {
  const { t, lang } = opts, reduced = typeof opts.reduced === 'function' ? opts.reduced : () => !!opts.reduced;
  const nf = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 4, maximumFractionDigits: 4 }), num = (v) => nf.format(v), nm = (k) => t(...NAMES[k]);
  root.innerHTML = `<p class="act-help">${t('Un cube est percé d’un tunnel droit. Un second cube, identique, peut-il passer par ce tunnel sans casser le premier ? Glisse sur la pièce ou sur le bloc pour les tourner (le tunnel suit), ailleurs pour tourner la vue ; puis fais passer la pièce.', 'A cube has a straight tunnel drilled through it. Can a second, identical cube pass through that tunnel without breaking the first? Drag the piece or the block to turn it (the tunnel follows), elsewhere to turn the view; then move the piece through.')}</p>
    <div class="exhibit-band">
      <fieldset class="act-choice"><legend>${t('Peut-on faire passer un cube par un trou percé dans un cube de même taille ?', 'Can a cube pass through a hole drilled in a cube of the same size?')}</legend>
        ${[t('non, c’est impossible', 'no, it is impossible'), t('oui, tout juste', 'yes, just about'), t('oui, et même un cube un peu plus grand', 'yes, and even a slightly larger cube')].map((c, i) => `<label><input type="radio" name="rp-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
      <p class="feedback" id="rp-verdict" role="status"></p></div>
    <div class="obj-stage exhibit-stage gl-stage"></div>
    <div class="act-controls exhibit-controls exhibit-band">
      <div class="act-buttons rp-shapes" role="group" aria-label="${t('Solide', 'Solid')}">${SHAPES.map((k) => `<button type="button" class="btn btn-secondary" data-shape="${k}" aria-pressed="${k === 'cube'}">${nm(k)}</button>`).join('')}</div>
      <label class="ph-slider"><span>${t('Position de la pièce dans le tunnel', 'Position of the piece in the tunnel')}</span><input type="range" id="rp-slide" min="0" max="100" step="1" value="0"></label>
      <div class="act-buttons">
        <button type="button" class="btn btn-primary" id="rp-play" aria-pressed="false">${t('Faire passer la pièce', 'Move the piece through')}</button>
        <button type="button" class="btn btn-secondary" id="rp-witness">${t('Montrer un passage vérifié', 'Show a verified passage')}</button>
        <button type="button" class="btn btn-secondary" id="rp-search" aria-pressed="false">${t('Chercher un passage', 'Search for a passage')}</button>
        <button type="button" class="btn btn-secondary" id="rp-axis" aria-pressed="false">${t('Regarder dans l’axe du tunnel', 'Look along the tunnel')}</button>
        <button type="button" class="btn btn-secondary" id="rp-reset">${t('Recentrer la vue', 'Reset the view')}</button></div>
      <div class="act-buttons">
        <label class="act-check"><input id="rp-spin" type="checkbox"> ${t('Rotation automatique de la vue', 'Turn the view automatically')}</label>
        <label class="act-check"><input id="rp-glass" type="checkbox"> ${t('Bloc translucide', 'See-through block')}</label>
        <label class="act-check"><input id="rp-inset" type="checkbox" checked> ${t('Ombres vues dans l’axe', 'Shadows seen along the tunnel')}</label></div></div>
    <p class="act-readout exhibit-readout" role="status" aria-live="polite"></p>
    <details class="exhibit-notes"><summary>${t('Observer, puis comprendre', 'Observe, then understand')}</summary><ol>
      <li>${t('Un tunnel droit laisse passer la pièce si, vue dans la direction du tunnel, l’ombre de la pièce tient à l’intérieur de l’ombre du bloc, avec un peu de place tout autour : le bloc garde alors un mur tout autour du trou et reste d’un seul morceau. L’encart dessine ces deux ombres ; le bouton « Regarder dans l’axe du tunnel » montre la même chose dans la scène.', 'A straight tunnel lets the piece through if, seen along the tunnel, the shadow of the piece fits inside the shadow of the block with a little room all round: the block then keeps a wall all round the hole and stays in one piece. The inset draws those two shadows; the button “Look along the tunnel” shows the same thing in the scene.')}</li>
      <li>${t('Pour deux positions données, le plus grand agrandissement s de la pièce qui tient dans l’ombre du bloc se calcule exactement : chaque côté de l’ombre du bloc donne une inégalité, et on maximise s (un petit programme linéaire). Le solide est dit de Rupert si l’on trouve des positions avec s > 1.', 'For two given positions, the largest enlargement s of the piece that fits in the block’s shadow is computed exactly: each side of the block’s shadow gives an inequality, and s is maximised (a small linear programme). The solid is called Rupert if positions with s > 1 exist.')}</li>
      <li>${t('« Chercher un passage » tourne la pièce et le bloc au hasard, par petits pas, et garde chaque position qui augmente s. Pour le cube, la recherche approche 3√2/4 ≈ 1,0607 (Nieuwland), le meilleur possible : un cube 6 % plus grand passe.', '“Search for a passage” turns the piece and the block at random, in small steps, and keeps every position that increases s. For the cube the search approaches 3√2/4 ≈ 1.0607 (Nieuwland), the best possible: a cube 6% larger passes.')}</li>
      <li>${t('Les cinq solides de Platon sont de Rupert : l’exposition montre pour chacun un passage trouvé par une recherche et vérifié par deux calculs indépendants. Ce s n’est pas forcément le meilleur possible.', 'All five Platonic solids are Rupert: for each, the exhibit shows a passage found by a search and checked by two independent computations. That s is not necessarily the best possible.')}</li>
      <li>${t('Ne pas trouver de passage ne prouve rien. En 2025, Steininger et Yurkevich ont prouvé, avec l’aide d’un ordinateur, que le Noperthèdre (90 sommets, 152 faces) n’a aucun passage. En octobre 2026, un polyèdre à 7 sommets sans passage (le Septopert) a été annoncé avec un certificat vérifié en Lean, ainsi qu’une preuve que tout polyèdre convexe d’au plus 6 sommets est de Rupert. En 2026 aussi, une prépublication assistée par ordinateur annonce que le rhombicosidodécaèdre n’a pas de passage : ici, la recherche ne trouve jamais mieux que s = 1, la pièce posée exactement sur son ombre, sans aucune place. Ces deux derniers polyèdres ne sont pas dessinés ici.', 'Finding no passage proves nothing. In 2025 Steininger and Yurkevich proved, with the help of a computer, that the Noperthedron (90 vertices, 152 faces) has no passage. In October 2026 a polyhedron with 7 vertices and no passage (the Septopert) was announced with a certificate checked in Lean, together with a proof that every convex polyhedron with at most 6 vertices is Rupert. Also in 2026, a computer-assisted preprint announces that the rhombicosidodecahedron has no passage: here the search never finds better than s = 1, the piece placed exactly on its own shadow, with no room at all. Those last two polyhedra are not drawn here.')}</li>
      <li>${t('Une boule n’a jamais de passage : son ombre est toujours un disque de même rayon. La question ne se pose que pour les polyèdres convexes.', 'A ball never has a passage: its shadow is always a disc of the same radius. The question is only about convex polyhedra.')}</li>
    </ol></details>`;
  const $ = (s) => root.querySelector(s), host = $('.exhibit-stage');
  const stage = glStage(host, { aspect: 640 / 460, reduced, scope: root, view: { yaw: -0.75, pitch: 0.38, dist: 10.5, fov: 0.6 }, minDist: 3.5, maxDist: 24,
    label: t('Le bloc percé et la pièce, en 3D. Glisser sur un solide le tourne, ailleurs tourne la vue. Flèches : la vue ; Maj + flèches : la pièce ; Alt + flèches : le bloc ; Espace : faire passer ; + et − : zoom ; 0 : recentrer.', 'The drilled block and the piece, in 3D. Dragging a solid turns it, elsewhere turns the view. Arrows: the view; Shift + arrows: the piece; Alt + arrows: the block; Space: move the piece through; + and −: zoom; 0: reset.') });
  if (!stage) return null;
  const gl = stage.gl, cam = stage.cam;
  const MS = metricStrip(host, t, [{ id: 's', label: t('Plus grand agrandissement qui passe, dans ces positions', 'Largest enlargement that passes, in these positions'), kind: 'approx' }, { id: 'pass', label: t('Dans ces positions', 'In these positions'), kind: 'exact' }, { id: 'vef', label: t('Sommets · arêtes · faces', 'Vertices · edges · faces'), kind: 'exact' }, { id: 'status', label: t('Ce que l’on sait', 'What is known'), kind: '' }]);

  // ---- state
  let shape = 'cube', S = solid(shape), Rout = rotation([0, 0.35, 0.5]), Rin = rotation([0.4, 0.9, 0.3]);
  let slide = 0, playing = false, phase = 0, spin = false, glass = false, inset = true, answer = null, seen = false;
  let tween = null, search = null, flight = null, dragging = false, seed = 1;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let cache = null, updating = false;
  // inside stage.update the frame is already running: waking the loop there would start a second requestAnimationFrame chain
  const wake = () => { if (!updating) stage.wake(); };
  function scene() {   // geometry for the current orientations (rebuilt only when they change)
    const key = shape + Rout.flat().join() + Rin.flat().join(); if (cache?.key === key) return cache;
    const ps = passage(S, Rout, Rin), planes = planesOf(S, Rout), pin = planesOf(S, Rin);
    const block = meshOf(S.faces.map((f, k) => ({ pts: f.verts.map((i) => apply(Rout, S.verts[i])), n: planes[k].n })));
    const piece = meshOf(S.faces.map((f, k) => ({ pts: f.verts.map((i) => apply(Rin, S.verts[i])), n: pin[k].n })));
    // the drilled tunnel, a hair wider than the piece's shadow so that the piece never touches its walls on screen
    const cx = ps.tunnel.reduce((a, p) => a + p[0], 0) / ps.tunnel.length, cy = ps.tunnel.reduce((a, p) => a + p[1], 0) / ps.tunnel.length;
    const ring = ps.tunnel.map((p) => [cx + (p[0] - cx) * 1.004, cy + (p[1] - cy) * 1.004]), walls = ps.ok ? meshOf(tunnelWalls(planes, ring)) : null;
    const edges = ring.map((a, k) => { const b = ring[(k + 1) % ring.length], e = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...e), n = [e[1] / l, -e[0] / l]; return [n[0], n[1], n[0] * a[0] + n[1] * a[1]]; });
    // the piece starts just above the block and ends just below it (heights from the actual vertices, not the circumradius)
    const zs = (R) => S.verts.map((v) => apply(R, v)[2]), zb = zs(Rout), zp = zs(Rin);
    const top = Math.max(...zb) - Math.min(...zp) + GAP, bottom = Math.min(...zb) - Math.max(...zp) - GAP;
    cache = { key, ps, planes, pin, top, bottom, ring: ps.ok && edges.length <= RING_MAX ? new Float32Array(edges.flat()) : null, ringN: ps.ok ? Math.min(edges.length, RING_MAX) : 0,
      block: upload(block, cache?.block), piece: upload(piece, cache?.piece), walls: walls ? upload(walls, cache?.walls) : null };
    return cache;
  }
  let P = null;
  function upload(m, old) {
    for (const k of ['tri', 'lin']) if (old?.[k]) gl.deleteBuffer(old[k].buf);
    const mk = (data) => { const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      const v = vao(gl, P, { aP: { buffer: buf, size: 3, stride: 24, offset: 0 }, aN: { buffer: buf, size: 3, stride: 24, offset: 12 } }); return { vao: v.vao, buf, n: data.length / 6 }; };
    return { tri: mk(m.tri), lin: mk(m.lin) };
  }
  const pieceAt = () => { const c = scene(); return [c.ps.off[0], c.ps.off[1], c.ps.ok ? c.top + (c.bottom - c.top) * slide : c.top]; };   // a piece that does not fit waits above the block

  // ---- drawing
  stage.draw = (f) => {
    const C = f.C, c = scene(), VP = new Float32Array(f.viewProj), shift = pieceAt();
    gl.useProgram(P); gl.uniformMatrix4fv(P.u('uVP'), false, VP); gl.uniform3fv(P.u('uEye'), f.eye);
    const blockCol = rgb(C.c[0]), wallCol = blockCol.map((v) => v * 0.55), pieceCol = rgb(c.ps.ok ? C.object : C.c[3]), ink = rgb(C.ink);
    gl.uniform1i(P.u('uN'), c.ringN); if (c.ring) gl.uniform3fv(P.u('uRing'), c.ring);
    const draw = (m, mode, col, { hole = 0, flat = 0, alpha = 1, at = [0, 0, 0] } = {}) => {
      gl.uniform3fv(P.u('uCol'), col); gl.uniform1i(P.u('uHole'), hole); gl.uniform1i(P.u('uFlat'), flat); gl.uniform1f(P.u('uAlpha'), alpha); gl.uniform3fv(P.u('uShift'), at);
      gl.bindVertexArray(m.vao); gl.drawArrays(mode, 0, m.n);
    };
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1);
    draw(c.piece.tri, gl.TRIANGLES, pieceCol, { at: shift });
    if (!glass) { draw(c.block.tri, gl.TRIANGLES, blockCol, { hole: 1 }); if (c.walls) draw(c.walls.tri, gl.TRIANGLES, wallCol); }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    draw(c.piece.lin, gl.LINES, ink, { flat: 1, at: shift, alpha: 0.9 });
    if (c.walls) draw(c.walls.lin, gl.LINES, ink, { flat: 1, alpha: glass ? 0.45 : 0.6 });
    draw(c.block.lin, gl.LINES, ink, { flat: 1, hole: 1, alpha: 0.9 });
    if (glass) {   // see-through block: back faces then front faces, blended, without writing depth
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.CULL_FACE);
      for (const face of [gl.FRONT, gl.BACK]) { gl.cullFace(face); draw(c.block.tri, gl.TRIANGLES, blockCol, { hole: 1, alpha: 0.28 }); }
      gl.disable(gl.CULL_FACE); if (c.walls) draw(c.walls.tri, gl.TRIANGLES, wallCol, { alpha: 0.3 });
      gl.depthMask(true); gl.disable(gl.BLEND);
    }
    gl.bindVertexArray(null);
    report(c);
  };
  // the two shadows seen along the tunnel, in an inset; a message when the piece does not pass; the search's progress
  const insetSide = (f) => Math.round(clamp(Math.min(f.W, f.H) * 0.34, 84, 220));
  stage.drawOverlay = (g, f) => {
    const C = f.C, c = scene(), { Q, P: Pp, r, ok, tunnel } = c.ps, k = Math.max(0.75, Math.min(1, f.W / 600));
    g.textBaseline = 'alphabetic';
    if (inset) {
      const side = insetSide(f), x0 = f.W - side - 10, y0 = f.H - side - 10, sc = side * 0.36, cx = x0 + side / 2, cy = y0 + side / 2 + 6 * k;
      g.globalAlpha = 0.88; g.fillStyle = C.surface; g.fillRect(x0, y0, side, side); g.globalAlpha = 1; g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, side - 1, side - 1);
      const X = (p) => [cx + p[0] * sc, cy - p[1] * sc];
      const poly = (pts, fill, stroke, w, alpha = 1, dash = []) => { g.beginPath(); pts.map(X).forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.closePath();
        if (fill) { g.globalAlpha = alpha; g.fillStyle = fill; g.fill(); g.globalAlpha = 1; } if (stroke) { g.setLineDash(dash); g.strokeStyle = stroke; g.lineWidth = w; g.stroke(); g.setLineDash([]); } };
      const pc = ok ? C.object : C.c[3];
      poly(Q, C.c[0], C.ink, 2, 0.3);
      poly(ok ? tunnel : Pp, pc, pc, 1.6, 0.5);
      if (r.s > 0) poly(Pp.map((p) => [r.s * p[0] + r.t[0], r.s * p[1] + r.t[1]]), null, pc, 1.2, 1, [5, 4]);
      g.font = `600 ${side < 130 ? 10 : Math.round(12 * k)}px system-ui, sans-serif`; g.textAlign = 'left'; g.fillStyle = C.ink;
      g.fillText(side < 130 ? t('Dans l’axe', 'Axis view') : t('Vu dans l’axe du tunnel', 'Seen along the tunnel'), x0 + 6, y0 + 14);
      g.fillStyle = C.muted; g.fillText(side < 130 ? `× ${num(r.s)}` : t(`pointillés : × ${num(r.s)}`, `dotted: × ${num(r.s)}`), x0 + 6, y0 + side - 6);
    }
    g.font = `600 ${Math.round(14 * k)}px system-ui, sans-serif`; g.textAlign = 'left';
    const line = (text, y, col) => { g.lineWidth = 4; g.strokeStyle = C.surface; g.strokeText(text, 12, y); g.fillStyle = col; g.fillText(text, 12, y); };
    line(t('bloc percé', 'drilled block'), 22 * k, C.ink); line(t('pièce', 'piece'), 42 * k, ok ? C.object : C.c[3]);
    if (search) line(t(`Recherche… s = ${num(search.s)}`, `Searching… s = ${num(search.s)}`), 66 * k, C.ink);
    if (!ok) line(t('Dans ces positions, la pièce ne passe pas : tourne-la, ou cherche un passage.', 'In these positions, the piece does not pass: turn it, or search for a passage.'), f.H - (inset && f.W < 520 ? insetSide(f) + 24 : 14), C.c[3]);
  };

  // ---- readouts and the question
  const fb = $('#rp-verdict');
  function verdict() {
    let text, cls = '';
    if (answer == null) text = t('Choisis une réponse, puis cherche un passage en tournant la pièce, ou demande un passage vérifié.', 'Choose an answer, then look for a passage by turning the piece, or ask for a verified passage.');
    else if (!seen) text = t('Réponse notée. Trouve une position du cube avec s > 1 et fais-le passer, ou regarde le passage vérifié jusqu’au bout.', 'Answer noted. Find a position of the cube with s > 1 and move it through, or watch the verified passage to the end.');
    else { const ok = answer === 2; cls = ok ? 'success' : 'error'; text = (ok ? t('Bien vu. ', 'Well spotted. ') : t('Pas tout à fait. ', 'Not quite. ')) + t(`Un cube passe, et même un cube agrandi jusqu’à 3√2/4 ≈ ${num(NIEUWLAND)} fois : son ombre tient dans celle du bloc avec de la place autour.`, `A cube passes, and even a cube enlarged up to 3√2/4 ≈ ${num(NIEUWLAND)} times: its shadow fits in the block’s with room all round.`); }
    if (fb.textContent !== text) { const was = fb.className; fb.className = 'feedback' + (cls ? ' ' + cls : ''); fb.textContent = text; if (cls && was !== fb.className) illuminateFeedback(fb, reduced); }
  }
  let lastReport = '';
  function report(c) {
    const { r, ok } = c.ps, key = shape + num(r.s) + ok; if (key === lastReport) return; lastReport = key;
    MS.set('s', num(r.s)); MS.set('pass', ok ? t('elle passe, avec de la place', 'it passes, with room') : Math.abs(r.s - 1) < 1e-6 ? t('elle tient tout juste, sans place', 'it just fits, with no room') : t('elle ne passe pas', 'it does not pass'));
    MS.set('vef', `${S.V} · ${S.E} · ${S.F}`);
    MS.set('status', shape === 'rhombicosidodecahedron' ? t('sans passage, selon une prépublication de 2026 (preuve par ordinateur)', 'no passage, according to a 2026 preprint (computer proof)') : shape === 'cube' ? t('de Rupert ; meilleur s = 3√2/4 (Nieuwland)', 'Rupert; best s = 3√2/4 (Nieuwland)') : t('de Rupert (prouvé)', 'Rupert (proved)'));
    page(t(`${nm(shape)} : agrandissement ${num(r.s)}, ${ok ? 'la pièce passe' : 'la pièce ne passe pas'}.`, `${nm(shape)}: enlargement ${num(r.s)}, ${ok ? 'the piece passes' : 'the piece does not pass'}.`));
  }
  let lastRead = ''; const page = (s) => { if (s !== lastRead) { lastRead = s; $('.exhibit-readout').textContent = s; } };

  // ---- controls
  const slideIn = $('#rp-slide'), playBtn = $('#rp-play'), searchBtn = $('#rp-search'), axisBtn = $('#rp-axis');
  const setSlide = (v) => { slide = clamp(v, 0, 1); slideIn.value = String(Math.round(slide * 100)); if (slide >= 0.999 && shape === 'cube' && scene().ps.ok) { seen = true; verdict(); } wake(); };
  const setPlaying = (on) => { playing = on && scene().ps.ok; playBtn.setAttribute('aria-pressed', String(playing)); playBtn.textContent = playing ? t('Pause', 'Pause') : t('Faire passer la pièce', 'Move the piece through');
    if (playing && reduced()) { playing = false; playBtn.setAttribute('aria-pressed', 'false'); playBtn.textContent = t('Faire passer la pièce', 'Move the piece through'); setSlide(slide >= 0.5 ? 0 : 1); }
    else if (playing) phase = Math.acos(clamp(1 - 2 * slide, -1, 1)); wake(); };
  const stopSearch = () => { search = null; searchBtn.setAttribute('aria-pressed', 'false'); searchBtn.textContent = t('Chercher un passage', 'Search for a passage'); };
  const turned = () => { setPlaying(false); tween = null; if (slide > 0) setSlide(0); wake(); };   // a new position: the piece goes back above the block
  root.querySelectorAll('[data-shape]').forEach((b) => stage.on(b, 'click', () => {
    shape = b.dataset.shape; S = solid(shape); cache && (cache.key = ''); stopSearch(); tween = null; setPlaying(false); setSlide(0);
    root.querySelectorAll('[data-shape]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); wake(); }));
  root.querySelectorAll('[name=rp-guess]').forEach((r) => stage.on(r, 'change', () => { answer = +r.value; verdict(); }));
  stage.on(slideIn, 'input', () => { setPlaying(false); if (!scene().ps.ok) { slideIn.value = '0'; return; } setSlide(+slideIn.value / 100); });
  stage.on(playBtn, 'click', () => {
    if (!scene().ps.ok) { page(t('Dans ces positions la pièce ne passe pas : tourne-la, cherche un passage ou demande un passage vérifié.', 'In these positions the piece does not pass: turn it, search for a passage or ask for a verified passage.')); return; }
    setPlaying(!playing); });
  stage.on($('#rp-witness'), 'click', () => {
    const w = WITNESSES[shape]; stopSearch();
    if (!w) { page(t('Aucun passage connu pour ce solide : il n’en a pas (prépublication de 2026).', 'No passage is known for this solid: it has none (2026 preprint).')); return; }
    const to = { Rout: rotation(w.outer), Rin: rotation(w.inner) }; setPlaying(false); setSlide(0);
    if (reduced()) { Rout = to.Rout; Rin = to.Rin; setSlide(1); return; }
    tween = { from: { Rout, Rin }, to, u: 0, then: () => setPlaying(true) }; wake();
  });
  stage.on(searchBtn, 'click', () => {
    if (search) { stopSearch(); wake(); return; }
    tween = null; setPlaying(false); setSlide(0);
    search = { Rout, Rin, s: scene().ps.r.s, steps: 0 }; searchBtn.setAttribute('aria-pressed', 'true'); searchBtn.textContent = t('Arrêter la recherche', 'Stop the search');
    if (reduced()) { while (search.steps < 400) step(); finishSearch(); }
    wake();
  });
  const STEPS = 420;
  function step() { const size = 0.35 * (1 - search.steps / (STEPS + 40)) + 0.01; const n = searchStep(S, search, rand, shape === 'rhombicosidodecahedron' ? 4 : 10, size); search = { ...n, steps: search.steps + 1 }; Rout = n.Rout; Rin = n.Rin; }
  function finishSearch() { const ok = scene().ps.ok; stopSearch(); if (ok) setPlaying(true); else page(t('La recherche n’a pas trouvé de passage. Cela ne prouve rien… sauf ici, où une preuve existe pour le rhombicosidodécaèdre.', 'The search found no passage. That proves nothing… except here, where a proof exists for the rhombicosidodecahedron.')); }
  stage.on(axisBtn, 'click', () => {
    const along = axisBtn.getAttribute('aria-pressed') !== 'true'; axisBtn.setAttribute('aria-pressed', String(along));
    axisBtn.textContent = along ? t('Revenir à la vue d’ensemble', 'Back to the overall view') : t('Regarder dans l’axe du tunnel', 'Look along the tunnel');
    const to = along ? { pitch: 1.5, yaw: cam.yaw, dist: 12 } : { pitch: stage.home.pitch, yaw: cam.yaw, dist: stage.home.dist };
    if (along) { spin = false; $('#rp-spin').checked = false; }
    if (reduced()) { Object.assign(cam, to); wake(); return; }
    flight = { from: { pitch: cam.pitch, yaw: cam.yaw, dist: cam.dist }, to, u: 0 }; wake();
  });
  stage.on($('#rp-reset'), 'click', () => { flight = null; axisBtn.setAttribute('aria-pressed', 'false'); axisBtn.textContent = t('Regarder dans l’axe du tunnel', 'Look along the tunnel'); stage.reset(); });
  stage.on($('#rp-spin'), 'change', (e) => { spin = e.target.checked && !reduced(); wake(); });
  stage.on($('#rp-glass'), 'change', (e) => { glass = e.target.checked; wake(); });
  stage.on($('#rp-inset'), 'change', (e) => { inset = e.target.checked; wake(); });

  // ---- turning a solid: drag on it (trackball about the screen axes), or Shift / Alt + arrows
  const turnBy = (which, dx, dy) => {
    const f = stage.frame(); if (!f) return; const v = f.view, right = [v[0], v[4], v[8]], up = [v[1], v[5], v[9]];
    const axis = [0, 1, 2].map((i) => up[i] * dx + right[i] * dy), ang = Math.hypot(dx, dy); if (ang < 1e-9) return;
    const R = axisRotation(axis, ang);
    if (which === 'piece') Rin = orthonormalize(mul3(R, Rin)); else Rout = orthonormalize(mul3(R, Rout));
    stopSearch(); turned();
  };
  stage.pick = (ray) => {
    const c = scene(), dp = rayConvex(ray.o, ray.d, c.pin, pieceAt()), db = rayConvex(ray.o, ray.d, c.planes);
    if (dp == null && db == null) return null;
    const which = db == null || (dp != null && dp <= db) ? 'piece' : 'block'; let last = null; dragging = true;
    return { move: (r, e, p) => { if (last) { const k = 3.2 / Math.max(240, stage.W); turnBy(which, (p[0] - last[0]) * k, (p[1] - last[1]) * k); } last = p; }, up: () => { dragging = false; } };
  };
  stage.key = (e) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (d && (e.shiftKey || e.altKey)) { turnBy(e.shiftKey ? 'piece' : 'block', d[0] * 0.08, d[1] * 0.08); return true; }
    if (e.key === ' ') { playBtn.click(); return true; }
    return false;
  };

  // ---- animation
  const ease = (u) => u * u * (3 - 2 * u);
  stage.update = (dt) => { updating = true; try { return advance(dt); } finally { updating = false; } };
  function advance(dt) {
    let busy = false;
    if (tween) {
      tween.u = Math.min(1, tween.u + dt / 1.6); const u = ease(tween.u);
      Rout = slerp(tween.from.Rout, tween.to.Rout, u); Rin = slerp(tween.from.Rin, tween.to.Rin, u);
      if (tween.u >= 1) { const then = tween.then; tween = null; then?.(); } busy = true;
    }
    if (search) { for (let i = 0; i < 2 && search && search.steps < STEPS; i++) step(); if (search.steps >= STEPS) finishSearch(); busy = true; }
    if (playing) {
      phase += dt * Math.PI / 2.4; const s = (1 - Math.cos(phase)) / 2, was = slide; setSlide(s);
      if (was < 0.999 && s >= 0.999 && shape === 'cube') { seen = true; verdict(); }
      busy = true;
    }
    if (flight) {
      flight.u = Math.min(1, flight.u + dt / 1.2); const u = ease(flight.u);
      for (const k of ['pitch', 'yaw', 'dist']) cam[k] = flight.from[k] + (flight.to[k] - flight.from[k]) * u;
      if (flight.u >= 1) flight = null; busy = true;
    }
    if (spin && !dragging) { cam.yaw += dt * 0.35; busy = true; }
    return busy;
  }

  stage.restore = () => { P = compile(gl, VS, FS); cache = null; };
  stage.restore(); verdict(); stage.start();
  return () => { stage.destroy(); MS.el.remove(); };
}
