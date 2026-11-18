// The napkin ring on the GPU (maths in gallery-napkin-model.js; stage in gl3d.js). Each ring is drawn from its exact equations in the
// vertex shader (outer band ρ = √(R² − z²), drilled wall ρ = r, flat cut ρ ∈ [r, √(R² − z₀²)]), so every slider only changes
// uniforms and the motion stays smooth. Above the cut the ring turns to glass; the cut is the annulus whose area π(h²/4 − z₀²) does
// not depend on R. "Grow the sphere" lets the right sphere grow at fixed h: the ring gets thinner and wider, its volume stays π h³/6.
import { glStage, glExhibit, compile, vao, gridMesh, rgb, GLSL_LIGHT, clamp } from './gl3d.js';
import { holeRadius, height, sliceArea, volume } from './gallery-napkin-model.js';
import { field as sliderField, bind } from '../object-kit.js';
import { metricStrip, plotPanel } from './gallery-panels.js';

const RING_VS = `#version 300 es
precision highp float;
in vec2 aUV;
uniform mat4 uVP; uniform vec3 uC; uniform float uS, uR, uH, ur, uZc; uniform int uKind, uPart;
out vec3 vW; out vec3 vN; out vec2 vRZ;
void main(){
  float th = aUV.x * 6.283185307179586, c = cos(th), s = sin(th), h2 = uH * 0.5;
  float z0 = uPart == 0 ? -h2 : uZc, z1 = uPart == 0 ? uZc : h2, rho, z; vec3 n;
  if (uKind == 0) { z = mix(z0, z1, aUV.y); rho = sqrt(max(uR * uR - z * z, 0.0)); n = vec3(rho * c, rho * s, z) / uR; }
  else if (uKind == 1) { z = mix(z0, z1, aUV.y); rho = ur; n = vec3(-c, -s, 0.0); }
  else if (uKind == 2) { z = uZc; rho = mix(ur, sqrt(max(uR * uR - z * z, 0.0)), aUV.y); n = vec3(0.0, 0.0, 1.0); }
  else { float ph = (aUV.y - 0.5) * 3.141592653589793; n = vec3(cos(ph) * c, cos(ph) * s, sin(ph)); rho = uR * cos(ph); z = uR * sin(ph); }
  vW = uC + uS * vec3(rho * c, rho * s, z); vN = n; vRZ = vec2(rho, z);
  gl_Position = uVP * vec4(vW, 1.0);
}`;
const RING_FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vW; in vec3 vN; in vec2 vRZ;
uniform vec3 uEye, uCol, uCut; uniform int uKind; uniform float uAlpha, ur, uR, uZc;
out vec4 frag;
${GLSL_LIGHT}
float ring(float x, float step){ float f = abs(fract(x / step + 0.5) - 0.5) * step, w = fwidth(x); return 1.0 - smoothstep(w * 0.6, w * 1.6, f); }
void main(){
  vec3 V = normalize(uEye - vW), n = normalize(vN); if (dot(n, V) < 0.0) n = -n;
  vec3 base = uCol;
  if (uKind == 1) base = uCol * (0.62 + 0.08 * ring(vRZ.y, 0.25));                    // drilled wall, faint tool marks
  if (uKind == 2) { base = uCut; base = mix(base, base * 0.55, 0.6 * ring(vRZ.x, 0.5)); }   // the cut: rings every 0.5 cm
  if (uKind == 3) { float f = pow(1.0 - abs(dot(n, V)), 2.2); float a = uAlpha * (0.06 + 0.5 * f); frag = vec4(pow(uCol, vec3(1.0 / 2.2)) * a, a); return; }
  vec3 col = studio(base, n, V, uKind == 2 ? 20.0 : 70.0, uKind == 2 ? 0.08 : 0.45);
  frag = vec4(toSRGB(col) * uAlpha, uAlpha);
}`;

export function napkinRingGL(root, opts) {
  const { t, lang } = opts, reduced = typeof opts.reduced === 'function' ? opts.reduced : () => !!opts.reduced;
  const num = (v, d = 2) => Number(v).toLocaleString(lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  const st = { RA: 4, RB: 8, h: 6, r: 2, mode: 'height', cut: 0.4, ghost: true, growing: false, grow: 0 };
  const page = glExhibit(root, opts,
    t('Deux sphères de rayons différents sont percées de part en part : il reste un anneau. Compare leurs volumes avant de bouger quoi que ce soit. Glisse pour tourner la scène ; la coupe horizontale montre la surface de chaque tranche.', 'Two spheres of different radii are drilled right through, leaving a ring. Compare their volumes before touching anything. Drag to turn the scene; the horizontal cut shows the area of each slice.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('On garde', 'Keep the same')}</span><select id="ng-mode"><option value="height">${t('la même hauteur h', 'height h')}</option><option value="hole">${t('le même trou (rayon r)', 'hole radius r')}</option></select></label>` +
    sliderField('ng-ra', t('Rayon de la sphère de gauche R₁ (cm)', 'Radius of the left sphere R₁ (cm)'), 3, 8, 0.5, st.RA) + sliderField('ng-rb', t('Rayon de la sphère de droite R₂ (cm)', 'Radius of the right sphere R₂ (cm)'), 3, 8, 0.5, st.RB) +
    sliderField('ng-h', t('Hauteur h de l’anneau (cm)', 'Height h of the ring (cm)'), 1, 6, 0.5, st.h) + sliderField('ng-r', t('Rayon r du trou (cm)', 'Radius r of the hole (cm)'), 0.5, 2.9, 0.1, st.r) +
    sliderField('ng-cut', t('Niveau de la coupe (en fraction de h/2)', 'Level of the cut (as a fraction of h/2)'), -1, 1, 0.01, st.cut) +
    `<div class="act-buttons"><button type="button" class="btn btn-primary" id="ng-grow">${t('Faire grossir la sphère de droite', 'Grow the right sphere')}</button><label class="act-check"><input id="ng-ghost" type="checkbox" checked> ${t('Montrer la sphère d’origine', 'Show the original sphere')}</label></div>`,
    `<p>${t('Percée par un trou cylindrique de rayon r, une sphère de rayon R laisse un anneau de hauteur h = 2√(R² − r²). À la hauteur z, sa tranche est une couronne entre r et √(R² − z²), d’aire π(R² − z²) − πr² = π(h²/4 − z²) : R a disparu. Deux anneaux de même hauteur ont donc des tranches de même aire à chaque niveau, et par le principe de Cavalieri le même volume : V = ∫ π(h²/4 − z²) dz = π h³/6.', 'Drilled by a cylindrical hole of radius r, a sphere of radius R leaves a ring of height h = 2√(R² − r²). At height z its slice is an annulus between r and √(R² − z²), of area π(R² − z²) − πr² = π(h²/4 − z²): R has gone. Two rings of the same height therefore have slices of equal area at every level, and by Cavalieri’s principle the same volume: V = ∫ π(h²/4 − z²) dz = π h³/6.')}</p>` +
    `<p>${t('Le volume est donné exactement, comme multiple de π, quand h est un multiple de 0,5 cm. Avec le même trou, les hauteurs diffèrent et les volumes aussi. Les anneaux sont dessinés à partir de leurs équations, point par point sur la carte graphique, sans facettes.', 'The volume is given exactly, as a multiple of π, when h is a multiple of 0.5 cm. With the same hole, the heights differ and so do the volumes. The rings are drawn from their equations, point by point on the graphics card, with no facets.')}</p>`);
  const stage = glStage(page.host, { aspect: 640 / 420, label: t('Deux anneaux de serviette en 3D. Flèches pour tourner, + et − pour zoomer, 0 pour revenir.', 'Two napkin rings in 3D. Arrows turn them, + and − zoom, 0 resets.'), view: { yaw: -0.35, pitch: 0.42, dist: 6.0, fov: 0.5 }, minDist: 2.5, maxDist: 14, reduced, scope: root });
  if (!stage) return null;
  const gl = stage.gl, $ = (s) => root.querySelector(s);
  const metrics = metricStrip(page.host, t, [
    { id: 'va', label: t('Volume de l’anneau de gauche', 'Volume of the left ring'), kind: 'exact' },
    { id: 'vb', label: t('Volume de l’anneau de droite', 'Volume of the right ring'), kind: 'exact' },
    { id: 'sa', label: t('Aire de la coupe, gauche', 'Area of the cut, left'), kind: 'exact' },
    { id: 'sb', label: t('Aire de la coupe, droite', 'Area of the cut, right'), kind: 'exact' },
  ]);
  const plot = plotPanel(metrics.el, t('Aire de la tranche selon sa hauteur z : les deux courbes, π(h²/4 − z²), coïncident quand les hauteurs sont égales.', 'Area of the slice against its height z: the two curves, π(h²/4 − z²), coincide when the heights are equal.'));
  let P, mesh, cap;
  function build() { P = compile(gl, RING_VS, RING_FS); const g = gridMesh(256, 96); mesh = vao(gl, P, { aUV: { data: g.uv, size: 2 } }, g.idx); const c = gridMesh(256, 8); cap = vao(gl, P, { aUV: { data: c.uv, size: 2 } }, c.idx); }
  // ring dimensions (cm): same height or same hole
  function dims() {
    const RB = st.growing || st.grow > 0 ? st.grow : st.RB, same = st.mode === 'height' || st.growing;
    return [st.RA, RB].map((R) => { const h = same ? Math.min(st.h, 2 * R - 1e-9) : height(R, Math.min(st.r, R - 0.05)); return { R, h, r: holeRadius(R, h) }; });
  }
  // V/π = h³/6 as a reduced fraction when 2h is an integer
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function exactVolume(h) {
    const k = Math.round(2 * h); if (Math.abs(k - 2 * h) > 1e-9) return `≈ ${num(volume(h), 3)} cm³`;
    const p = k ** 3, q = 48, d = gcd(p, q), a = p / d, b = q / d;
    return `${b === 1 ? a : `${a}/${b} `}π ≈ ${num(volume(h), 3)} cm³`;
  }
  const scale = () => 1 / 8;
  function centres(D) { const S = scale(), m = Math.max(D[0].R, D[1].R) * S; return [[0, -(m + 0.12), 0], [0, m + 0.12, 0]]; }
  stage.draw = (f) => {
    const C = f.C, D = dims(), S = scale(), cs = centres(D), VP = new Float32Array(f.viewProj);
    gl.useProgram(P); gl.uniformMatrix4fv(P.u('uVP'), false, VP); gl.uniform3fv(P.u('uEye'), f.eye); gl.uniform1f(P.u('uS'), S);
    const obj = rgb(C.object), cut = rgb(C.obj2), ink = rgb(C.ink);
    gl.uniform3fv(P.u('uCut'), cut);
    const pass = (d, c, part, alpha) => {
      const zc = clamp(st.cut, -1, 1) * d.h / 2;
      gl.uniform3fv(P.u('uC'), c); gl.uniform1f(P.u('uR'), d.R); gl.uniform1f(P.u('uH'), d.h); gl.uniform1f(P.u('ur'), d.r); gl.uniform1f(P.u('uZc'), zc);
      gl.uniform1i(P.u('uPart'), part); gl.uniform1f(P.u('uAlpha'), alpha); gl.uniform3fv(P.u('uCol'), obj);
      gl.bindVertexArray(mesh.vao);
      for (const k of [0, 1]) { gl.uniform1i(P.u('uKind'), k); gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0); }
      if (part === 0) { gl.uniform1i(P.u('uKind'), 2); gl.bindVertexArray(cap.vao); gl.drawElements(gl.TRIANGLES, cap.count, gl.UNSIGNED_INT, 0); }
    };
    D.forEach((d, i) => pass(d, cs[i], 0, 1));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    D.forEach((d, i) => pass(d, cs[i], 1, 0.22));
    if (st.ghost) D.forEach((d, i) => { gl.uniform3fv(P.u('uC'), cs[i]); gl.uniform1f(P.u('uR'), d.R); gl.uniform1i(P.u('uKind'), 3); gl.uniform1f(P.u('uAlpha'), f.dark ? 0.8 : 0.55); gl.uniform3fv(P.u('uCol'), ink); gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0); });
    gl.depthMask(true); gl.disable(gl.BLEND); gl.bindVertexArray(null);
    report(D);
  };
  stage.drawOverlay = (g, f) => {
    const C = f.C, D = dims(), S = scale(), cs = centres(D), k = Math.max(0.7, Math.min(1, f.W / 560));
    g.textAlign = 'center'; g.textBaseline = 'middle';
    D.forEach((d, i) => {
      const top = stage.project([cs[i][0], cs[i][1], cs[i][2] + d.R * S + 0.18]), bot = stage.project([cs[i][0], cs[i][1], cs[i][2] - d.R * S - 0.2]);
      g.font = `700 ${Math.round(14 * k)}px "Comic Neue", system-ui, sans-serif`; g.lineWidth = 4; g.strokeStyle = C.surface; g.fillStyle = C.ink;
      const a = `R = ${num(d.R, 1)} cm`; g.strokeText(a, top[0], top[1]); g.fillText(a, top[0], top[1]);
      g.font = `600 ${Math.round(13 * k)}px "Comic Neue", system-ui, sans-serif`;
      const b = `h = ${num(d.h, 2)} · r = ${num(d.r, 3)}`; g.strokeText(b, bot[0], bot[1]); g.fillStyle = C.muted; g.fillText(b, bot[0], bot[1]);
    });
  };
  let lastKey = '';
  function report(D) {
    const key = D.map((d) => [d.R, d.h, d.r].join()).join('|') + st.cut; if (key === lastKey) return; lastKey = key;
    const [A, B] = D, za = st.cut * A.h / 2, zb = st.cut * B.h / 2, sameH = Math.abs(A.h - B.h) < 1e-12;
    metrics.set('va', exactVolume(A.h)); metrics.set('vb', exactVolume(B.h));
    metrics.set('sa', `${num(sliceArea(A.R, A.h, za), 3)} cm²`); metrics.set('sb', `${num(sliceArea(B.R, B.h, zb), 3)} cm²`);
    page.read(sameH ? t(`Même hauteur h = ${num(A.h, 2)} cm : même volume π h³/6, alors que les sphères ont des rayons ${num(A.R, 1)} et ${num(B.R, 2)} cm.`, `Same height h = ${num(A.h, 2)} cm: same volume π h³/6, although the spheres have radii ${num(A.R, 1)} and ${num(B.R, 2)} cm.`)
      : t(`Hauteurs différentes (${num(A.h, 2)} et ${num(B.h, 2)} cm) : volumes différents.`, `Different heights (${num(A.h, 2)} and ${num(B.h, 2)} cm): different volumes.`));
    const hm = Math.max(A.h, B.h), curve = (d) => Array.from({ length: 121 }, (_, i) => { const z = -d.h / 2 + d.h * i / 120; return [z + hm / 2, sliceArea(d.R, d.h, z)]; });
    plot.draw({ xMax: hm, yMax: Math.PI * hm * hm / 4, xLabel: t('z + h/2 (cm)', 'z + h/2 (cm)'), yLabel: t('aire (cm²)', 'area (cm²)'), yFormat: (v) => num(v, 0),
      series: [{ points: curve(A), color: 'object', width: 3, dots: false }, { points: curve(B), color: 'obj2', width: 2, dash: [6, 5], dots: false }], marker: [za + hm / 2, sliceArea(A.R, A.h, za)] });
  }
  // grow the right sphere from h/2 to 8 cm at fixed h
  stage.update = (dt) => {
    if (!st.growing) return false;
    st.grow = Math.min(8, st.grow + dt * 1.4);
    if (st.grow >= 8) { st.growing = false; st.RB = 8; const s = $('#ng-rb'); s.value = '8'; s.dispatchEvent(new Event('input')); }
    return st.growing;
  };
  stage.restore = build;
  const sync = () => { $('#ng-h').disabled = st.mode !== 'height'; $('#ng-r').disabled = st.mode !== 'hole'; lastKey = ''; stage.wake(); };
  const abort = new AbortController(), on = (el, ev, fn) => el.addEventListener(ev, fn, { signal: abort.signal });
  on($('#ng-mode'), 'change', (e) => { st.mode = e.target.value; sync(); });
  on($('#ng-ghost'), 'change', (e) => { st.ghost = e.target.checked; stage.wake(); });
  on($('#ng-grow'), 'click', () => {
    st.mode = 'height'; $('#ng-mode').value = 'height'; sync();
    if (reduced()) { st.grow = 0; st.RB = st.RB >= 8 ? Math.max(3, st.h / 2) : 8; const s = $('#ng-rb'); s.value = String(st.RB); s.dispatchEvent(new Event('input')); return; }
    st.grow = st.h / 2 + 0.01; st.growing = true; stage.wake();
  });
  bind(root, 'ng-ra', (v) => { st.RA = v; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-rb', (v) => { st.RB = v; if (!st.growing) st.grow = 0; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-h', (v) => { st.h = v; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-r', (v) => { st.r = v; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-cut', (v) => { st.cut = v; stage.wake(); }, (v) => num(v, 2));
  build(); sync(); stage.start();
  return () => { abort.abort(); stage.destroy(); plot.stop(); metrics.el.remove(); };
}
