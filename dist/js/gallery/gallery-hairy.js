// The hairy ball on the GPU (maths in gallery-hairy-model.js; stage in gl3d.js). Tens of thousands of hairs follow the exact field:
// one transform-feedback pass integrates every hair along its field line in a vertex shader (same formula as the model), the points
// go to a float texture, and each hair is drawn as a tapered ribbon with anisotropic (Kajiya-Kay) light. The scalp is shaded per
// pixel by |v|, so a zero shows as a bald red spot. Drag to turn the ball, or switch to "comb" and drag on the ball: each stroke
// changes the field, the zeros and their indices are recomputed (winding numbers, Newton), and their sum stays 2 = χ(S²).
// The contrast: the same hair on a torus (χ = 0), which can be combed with no zero; combing it creates zeros whose sum stays 0.
import { glStage, glExhibit, compile, vao, gridMesh, raySphere, rgb, GLSL_LIGHT, dot3, norm3, sub3, clamp } from './gl3d.js';
import { field as fieldAt, zeros as findZeros, fibonacci, hair as hairCPU, geodesic, FIELD_GLSL, PRESET_INDEX, MAX_STROKES, SEGMENTS,
  TORUS, TORUS_GLSL, TORUS_INDEX, torusField, torusZeros, torusRoots, torusHair, torusPoint, torusParam } from './gallery-hairy-model.js';
import { field as sliderField, bind } from '../object-kit.js';
import { metricStrip } from './gallery-panels.js';

const PTS = SEGMENTS + 1, TEX_W = 4096;
const COMPUTE_VS = `#version 300 es
precision highp float;
in vec3 aRoot;
uniform float uLen, uVmax, uLift;
${FIELD_GLSL}
${Array.from({ length: PTS }, (_, k) => `out vec4 o${k};`).join(' ')}
void main(){
  vec3 p = aRoot; float lv = 0.6 + 0.8 * fract(sin(float(gl_VertexID) * 78.233) * 43758.5453); float m0 = length(field(p)), L = uLen * m0 / uVmax, rel = m0 / uVmax;
  vec4 P[${PTS}];
  for (int k = 0; k < ${PTS}; k++) {
    float s = float(k) / ${SEGMENTS}.0, r = 1.0 + uLift * lv * L * (1.0 - (1.0 - s) * (1.0 - s)) / max(uLen, 1e-9);
    P[k] = vec4(p * r, rel);
    vec3 v = field(p); float n = length(v);
    if (n > 1e-12) p = normalize(p + v / n * L / ${SEGMENTS}.0);
  }
  ${Array.from({ length: PTS }, (_, k) => `o${k} = P[${k}];`).join(' ')}
  gl_Position = vec4(0.0);
}`;
// the same integration on the torus: the root is (u, v), steps along the unit field in the frame (e_u, e_v)
const TORUS_COMPUTE_VS = `#version 300 es
precision highp float;
in vec3 aRoot;
uniform float uLen, uVmax, uLift;
${TORUS_GLSL}
${Array.from({ length: PTS }, (_, k) => `out vec4 o${k};`).join(' ')}
void main(){
  vec2 q = aRoot.xy; float lv = 0.6 + 0.8 * fract(sin(float(gl_VertexID) * 78.233) * 43758.5453); float m0 = length(field2(q)), L = uLen * m0 / uVmax, rel = m0 / uVmax;
  vec4 P[${PTS}];
  for (int k = 0; k < ${PTS}; k++) {
    float s = float(k) / ${SEGMENTS}.0;
    P[k] = vec4(tpos(q, uLift * lv * L * (1.0 - (1.0 - s) * (1.0 - s)) / max(uLen, 1e-9)), rel);
    vec2 f = field2(q); float n = length(f);
    if (n > 1e-12) { vec2 d = f / n * L / ${SEGMENTS}.0; q += vec2(d.x / (TR + Tr * cos(q.y)), d.y / Tr); }
  }
  ${Array.from({ length: PTS }, (_, k) => `o${k} = P[${k}];`).join(' ')}
  gl_Position = vec4(0.0);
}`;
const NULL_FS = `#version 300 es
precision mediump float; out vec4 c; void main(){ c = vec4(0.0); }`;
const HAIR_VS = `#version 300 es
precision highp float; precision highp sampler2D;
uniform sampler2D uPts; uniform mat4 uVP; uniform vec3 uEye; uniform float uWidth;
out vec3 vT; out vec3 vPos; out float vS; out float vSide; out float vRel; out float vRand;
vec4 at(int i){ return texelFetch(uPts, ivec2(i % ${TEX_W}, i / ${TEX_W}), 0); }
void main(){
  int k = gl_VertexID / 2, side = gl_VertexID - 2 * k, base = gl_InstanceID * ${PTS};
  vec4 P = at(base + k), A = at(base + max(k - 1, 0)), B = at(base + min(k + 1, ${SEGMENTS}));
  vec3 T = B.xyz - A.xyz; float tl = length(T);
  T = tl > 1e-9 ? T / tl : normalize(cross(P.xyz, vec3(0.31, 0.52, 0.79)));
  vec3 V = normalize(uEye - P.xyz), S = cross(T, V); float sl = length(S); S = sl > 1e-6 ? S / sl : normalize(cross(T, P.xyz));
  float rw = 0.7 + 0.6 * fract(sin(float(gl_InstanceID) * 4.1414) * 24634.6345), s = float(k) / ${SEGMENTS}.0, w = uWidth * rw * (1.0 - 0.82 * s) * smoothstep(0.0, 0.03, P.w);
  float sg = side == 0 ? -1.0 : 1.0;
  vec3 pos = P.xyz + S * (0.5 * w * sg);
  gl_Position = uVP * vec4(pos, 1.0);
  vT = T; vPos = pos; vS = s; vSide = sg; vRel = P.w;
  vRand = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
}`;
const HAIR_FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vT; in vec3 vPos; in float vS; in float vSide; in float vRel; in float vRand;
uniform vec3 uEye, uRoot, uTip; uniform float uAlpha; uniform int uSurf;
out vec4 frag;
${GLSL_LIGHT}
void main(){
  vec3 T = normalize(vT), V = normalize(uEye - vPos), N = uSurf == 1 ? normalize(vPos - ${TORUS.R.toFixed(6)} * normalize(vec3(vPos.xy, 0.0) + 1e-9)) : normalize(vPos);
  vec3 L1 = normalize(vec3(0.45, -0.35, 0.82)), L2 = normalize(vec3(-0.7, 0.4, 0.25));
  vec3 base = mix(uRoot, uTip, smoothstep(0.0, 1.0, vS)) * (0.82 + 0.36 * vRand);
  float ao = mix(0.35, 1.0, smoothstep(0.0, 0.7, vS));
  float tl1 = dot(T, L1), tl2 = dot(T, L2), tv = dot(T, V);
  float kd = sqrt(max(0.0, 1.0 - tl1 * tl1)) * max(0.25, dot(N, L1) * 0.5 + 0.5), kd2 = sqrt(max(0.0, 1.0 - tl2 * tl2)) * 0.25;
  float sinV = sqrt(max(0.0, 1.0 - tv * tv)), ks = pow(max(0.0, tl1 * tv + sqrt(max(0.0, 1.0 - tl1 * tl1)) * sinV), 60.0);
  float ks2 = pow(max(0.0, tl1 * tv + sqrt(max(0.0, 1.0 - tl1 * tl1)) * sinV), 9.0);
  vec3 col = base * (0.22 + 0.9 * kd + kd2) * ao + vec3(1.0, 0.96, 0.88) * (0.42 * ks * ao) + base * 0.35 * ks2 * ao;
  float edge = 1.0 - smoothstep(0.55, 1.0, abs(vSide));
  frag = vec4(toSRGB(col), uAlpha * mix(0.35, 1.0, edge));
}`;
const SCALP_VS = `#version 300 es
precision highp float;
in vec2 aUV; uniform mat4 uVP; out vec3 vP;
void main(){ float th = aUV.x * 6.283185307179586, ph = (aUV.y - 0.5) * 3.141592653589793;
  vP = vec3(cos(ph) * cos(th), cos(ph) * sin(th), sin(ph)); gl_Position = uVP * vec4(vP * 0.999, 1.0); }`;
const SCALP_FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vP; uniform vec3 uEye, uScalp, uZero; uniform float uVmax;
${FIELD_GLSL}
${GLSL_LIGHT}
out vec4 frag;
void main(){
  vec3 n = normalize(vP), V = normalize(uEye - n);
  float m = length(field(n)) / uVmax;
  float bald = 1.0 - smoothstep(0.0, 0.16, m);
  vec3 base = mix(uScalp, uZero, bald);
  frag = vec4(toSRGB(studio(base, n, V, 40.0, 0.12)), 1.0);
}`;
const TSCALP_VS = `#version 300 es
precision highp float;
in vec2 aUV; uniform mat4 uVP; out vec2 vQ;
${TORUS_GLSL}
void main(){ vQ = aUV * 6.283185307179586; gl_Position = uVP * vec4(tpos(vQ, -0.001), 1.0); }`;
const TSCALP_FS = `#version 300 es
precision highp float; precision highp int;
in vec2 vQ; uniform vec3 uEye, uScalp, uZero; uniform float uVmax;
${TORUS_GLSL}
${GLSL_LIGHT}
out vec4 frag;
void main(){
  vec3 n = tnormal(vQ), V = normalize(uEye - tpos(vQ, 0.0));
  float bald = 1.0 - smoothstep(0.0, 0.16, length(field2(vQ)) / uVmax);
  frag = vec4(toSRGB(studio(mix(uScalp, uZero, bald), n, V, 40.0, 0.12)), 1.0);
}`;
// first hit of a ray with the torus (sphere tracing on its distance function), or null
function rayTorus(o, d) {
  let s = 0;
  for (let i = 0; i < 160; i++) {
    const p = [o[0] + s * d[0], o[1] + s * d[1], o[2] + s * d[2]], e = Math.hypot(Math.hypot(p[0], p[1]) - TORUS.R, p[2]) - TORUS.r;
    if (e < 1e-6) return p;
    s += e; if (s > 40) return null;
  }
  return null;
}
const SPHERE_PRESETS = [['dipole', 'Source et puits (deux zéros d’indice +1)', 'Source and sink (two zeros of index +1)'], ['vortex', 'Rotation (deux centres d’indice +1)', 'Rotation (two centres of index +1)'],
  ['single', 'Un seul zéro, d’indice +2', 'A single zero, of index +2'], ['saddle', 'Gradient de xy (quatre +1, deux cols −1)', 'Gradient of xy (four +1, two saddles −1)'], ['none', 'Aucun (seulement le peigne)', 'None (comb only)']];
const TORUS_PRESETS = [['along', 'Peigné autour du trou (aucun zéro)', 'Combed around the hole (no zero)'], ['spiral', 'Peigné en spirale (aucun zéro)', 'Combed in a spiral (no zero)'],
  ['height', 'Gradient de x (deux +1, deux cols −1)', 'Gradient of x (two +1, two saddles −1)'], ['none', 'Aucun (seulement le peigne)', 'None (comb only)']];

export function hairyBall(root, opts) {
  const { t, lang } = opts, reduced = typeof opts.reduced === 'function' ? opts.reduced : () => !!opts.reduced;
  const num = (v, d = 3) => Number(v).toLocaleString(lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  const coarse = globalThis.matchMedia?.('(pointer: coarse)').matches;
  const st = { surface: 'sphere', preset: 'dipole', strength: 1, strokes: [], length: 0.32, count: coarse ? 12000 : 30000, mode: 'orbit', labels: true };
  const opt = (v, fr, en) => `<option value="${v}">${t(fr, en)}</option>`;
  const page = glExhibit(root, opts,
    t('Chaque cheveu suit le champ de vecteurs tangent à la surface ; sa longueur est proportionnelle à la norme du champ, donc il disparaît là où le champ s’annule. Glisse pour tourner la figure. Passe en mode « Peigner » et glisse sur la boule : quel que soit ton coup de peigne, il reste un épi. Sur le tore, en revanche, tout peut être peigné.',
      'Each hair follows the tangent vector field on the surface; its length is proportional to the size of the field, so it vanishes where the field is zero. Drag to turn the figure. Switch to "Comb" and drag on the ball: however you comb, a cowlick remains. The torus, on the other hand, can be combed flat.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Surface', 'Surface')}</span><select id="hb-surface">${opt('sphere', 'Sphère, χ = 2', 'Sphere, χ = 2')}${opt('torus', 'Tore, χ = 0', 'Torus, χ = 0')}</select></label>` +
    `<label class="act-field exhibit-select"><span class="act-label">${t('Champ de départ', 'Starting field')}</span><select id="hb-preset">` +
    SPHERE_PRESETS.map(([v, fr, en]) => opt(v, fr, en)).join('') + `</select></label>` +
    `<label class="act-field exhibit-select"><span class="act-label">${t('Glisser sur la figure', 'Dragging on the figure')}</span><select id="hb-mode">${opt('orbit', 'tourne la figure', 'turns the figure')}${opt('comb', 'peigne la figure', 'combs the figure')}</select></label>` +
    sliderField('hb-strength', t('Poids du champ de départ', 'Weight of the starting field'), 0, 1, 0.01, 1) +
    sliderField('hb-length', t('Longueur des cheveux', 'Hair length'), 0.08, 0.6, 0.01, st.length) +
    `<label class="act-field exhibit-select"><span class="act-label">${t('Nombre de cheveux', 'Number of hairs')}</span><select id="hb-count">${[6000, 12000, 30000, 60000].map((n) => `<option value="${n}"${n === st.count ? ' selected' : ''}>${n.toLocaleString(lang)}</option>`).join('')}</select></label>` +
    `<div class="act-buttons"><button type="button" class="btn btn-primary" id="hb-single">${t('Un seul épi (indice +2)', 'One cowlick (index +2)')}</button><button type="button" class="btn btn-secondary" id="hb-torus">${t('Peigner un tore', 'Comb a torus')}</button><button type="button" class="btn btn-secondary" id="hb-random">${t('Peigner au hasard', 'Random combing')}</button><button type="button" class="btn btn-secondary" id="hb-clear">${t('Effacer le peigne', 'Clear the comb')}</button><label class="act-check"><input id="hb-labels" type="checkbox" checked> ${t('Indices des zéros', 'Indices of the zeros')}</label></div>`,
    `<p>${t('Un champ de vecteurs tangent continu sur la sphère S² s’annule au moins une fois (Poincaré 1885, Brouwer 1912). L’indice d’un zéro compte les tours que fait la direction du champ quand on tourne une fois autour de lui : +1 pour une source, un puits ou un centre, −1 pour un col, +2 pour le zéro double du champ à un seul zéro. Le théorème de Poincaré-Hopf dit que la somme des indices vaut la caractéristique d’Euler de la surface, χ(S²) = 2. Comme 2 ≠ 0, il existe au moins un zéro.', 'A continuous tangent vector field on the sphere S² vanishes at least once (Poincaré 1885, Brouwer 1912). The index of a zero counts the turns of the field direction along one loop around it: +1 for a source, a sink or a centre, −1 for a saddle, +2 for the double zero of the single-zero field. The Poincaré-Hopf theorem says that the indices add up to the Euler characteristic of the surface, χ(S²) = 2. Since 2 ≠ 0, there is at least one zero.')}</p>` +
    `<p>${t('Calcul. Le champ est évalué en double précision sur 20 480 triangles d’une sphère géodésique ; le nombre de tours du champ le long du bord de chaque triangle est un entier exact. Chaque triangle de nombre non nul contient un zéro, que la méthode de Newton localise à |v| < 10⁻¹² près. Le même champ, écrit en GLSL, guide les cheveux sur la carte graphique.', 'Computation. The field is evaluated in double precision on the 20,480 triangles of a geodesic sphere; the number of turns of the field along the edge of each triangle is an exact integer. Each triangle with a nonzero count holds a zero, located by Newton’s method to |v| < 10⁻¹². The same field, written in GLSL, guides the hairs on the graphics card.')}</p>` +
    `<p>${t('Un coup de peigne de centre c et de direction t ajoute en p le vecteur t transporté parallèlement le long du grand cercle de c à p, pondéré par exp(−2(1 − c·p)/σ²) avec σ = 0,42. ', 'A comb stroke with centre c and direction t adds at p the vector t carried by parallel transport along the great circle from c to p, weighted by exp(−2(1 − c·p)/σ²) with σ = 0.42.')}</p>` +
    `<p>${t('Le contraste. Le tore a pour caractéristique χ(T²) = 0 : il porte un repère tangent (e_u autour du trou, e_v autour du tube) défini partout, et le champ constant e_u ne s’annule nulle part, on peut peigner un beignet. Si tu le peignes, des zéros apparaissent par paires (un +1 et un −1, ou plus), et leur somme reste 0. Les zéros sont comptés de la même façon, sur une grille de 24 576 cellules en (u, v).', 'The contrast. The torus has characteristic χ(T²) = 0: it carries a tangent frame (e_u around the hole, e_v around the tube) defined everywhere, and the constant field e_u vanishes nowhere, so a doughnut can be combed. If you comb it, zeros appear in pairs (a +1 and a −1, or more), and their sum stays 0. The zeros are counted the same way, on a grid of 24,576 cells in (u, v).')}</p>`);
  const stage = glStage(page.host, { aspect: 640 / 460, label: t('Boule chevelue en 3D. Flèches pour tourner, + et − pour zoomer, 0 pour revenir à la vue initiale.', 'Hairy ball in 3D. Arrows turn it, + and − zoom, 0 resets the view.'), view: { yaw: -0.7, pitch: 0.62, dist: 4.2, fov: 0.6 }, minDist: 1.8, maxDist: 12, reduced, scope: root });
  if (!stage) return null;
  const gl = stage.gl, $ = (s) => root.querySelector(s);
  const metrics = metricStrip(page.host, t, [
    { id: 'zeros', label: t('Zéros trouvés', 'Zeros found'), kind: 'observed' },
    { id: 'indices', label: t('Leurs indices', 'Their indices'), kind: 'exact' },
    { id: 'sum', label: t('Somme des indices', 'Sum of the indices'), kind: 'exact' },
    { id: 'chi', label: t('χ de la surface', 'χ of the surface'), kind: 'exact' },
    { id: 'res', label: t('Plus grand |v| aux zéros', 'Largest |v| at the zeros'), kind: 'approx' },
  ]);
  metrics.set('chi', '2');
  // ---- GPU programs
  let P, hairTex, tfBuf, roots, tfVao, hairVao, scalp, tscalp, texH = 1, gpuCompute = true, vmax = 1, fieldDirty = true, info = null;
  const torus = () => st.surface === 'torus';
  // the surface-dependent pieces: field and zeros of the model, roots, hair, GPU programs
  const fieldOf = (p) => torus() ? torusField(st, torusParam(p)) : fieldAt(st, p);
  const zerosOf = (level) => torus() ? torusZeros(st, level) : findZeros(st, level);
  const computeProgram = () => torus() ? P.tcompute : P.compute, scalpProgram = () => torus() ? P.tscalp : P.scalp;
  function build() {
    const outs = Array.from({ length: PTS }, (_, k) => 'o' + k);
    P = { compute: null, tcompute: null, hair: compile(gl, HAIR_VS, HAIR_FS), scalp: compile(gl, SCALP_VS, SCALP_FS), tscalp: compile(gl, TSCALP_VS, TSCALP_FS) };
    try { P.compute = compile(gl, COMPUTE_VS, NULL_FS, outs); P.tcompute = compile(gl, TORUS_COMPUTE_VS, NULL_FS, outs); } catch { P.compute = P.tcompute = null; gpuCompute = false; }
    const g = gridMesh(192, 96); scalp = vao(gl, P.scalp, { aUV: { data: g.uv, size: 2 } }, g.idx);
    const gt = gridMesh(256, 96); tscalp = vao(gl, P.tscalp, { aUV: { data: gt.uv, size: 2 } }, gt.idx);
    hairVao = gl.createVertexArray();
    hairTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, hairTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    allocate();
  }
  function allocate() {
    const n = st.count; roots = torus() ? torusRoots(n, 0.9) : fibonacci(n, 0.9); texH = Math.ceil(n * PTS / TEX_W);
    gl.bindTexture(gl.TEXTURE_2D, hairTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, texH, 0, gl.RGBA, gl.FLOAT, null);
    if (computeProgram()) {
      tfVao && gl.deleteVertexArray(tfVao.vao); tfVao = vao(gl, computeProgram(), { aRoot: { data: roots, size: 3 } });
      tfBuf && gl.deleteBuffer(tfBuf); tfBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, tfBuf); gl.bufferData(gl.ARRAY_BUFFER, TEX_W * texH * 16, gl.DYNAMIC_COPY); gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    fieldDirty = true;
  }
  function setField(p) {
    gl.uniform1i(p.u('uPreset'), (torus() ? TORUS_INDEX : PRESET_INDEX)[st.preset]); gl.uniform1f(p.u('uStrength'), st.strength); gl.uniform1i(p.u('uStrokes'), st.strokes.length);
    if (st.strokes.length) {
      const C = new Float32Array(MAX_STROKES * 4), T = new Float32Array(MAX_STROKES * 4);
      st.strokes.forEach(({ c, t: d }, i) => { C.set(c, i * 4); T.set(d, i * 4); });
      gl.uniform4fv(p.u('uC'), C); gl.uniform4fv(p.u('uT'), T);
    }
  }
  function computeHair() {
    const pc = computeProgram();
    if (gpuCompute && pc) {
      try {
        gl.useProgram(pc); setField(pc); gl.uniform1f(pc.u('uLen'), st.length); gl.uniform1f(pc.u('uVmax'), vmax); gl.uniform1f(pc.u('uLift'), 0.1);
        gl.bindVertexArray(tfVao.vao); gl.enable(gl.RASTERIZER_DISCARD); gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuf);
        gl.beginTransformFeedback(gl.POINTS); gl.drawArrays(gl.POINTS, 0, st.count); gl.endTransformFeedback();
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null); gl.disable(gl.RASTERIZER_DISCARD); gl.bindVertexArray(null);
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, tfBuf); gl.bindTexture(gl.TEXTURE_2D, hairTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TEX_W, texH, gl.RGBA, gl.FLOAT, 0); gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
        if (gl.getError() === gl.NO_ERROR) return;
      } catch { /* fall through to the CPU */ }
      gpuCompute = false;
    }
    // CPU path (same steps as the shader), at most 8,000 hairs
    const n = Math.min(st.count, 8000), data = new Float32Array(TEX_W * texH * 4);
    for (let i = 0; i < n; i++) {
      const r = [roots[3 * i], roots[3 * i + 1], roots[3 * i + 2]];
      const pts = torus() ? torusHair(st, r, st.length, vmax, 0.1) : hairCPU(st, r, st.length, vmax, 0.1), rel = Math.hypot(...(torus() ? torusField(st, r) : fieldAt(st, r))) / vmax;
      pts.forEach((p, k) => data.set([p[0], p[1], p[2], rel], (i * PTS + k) * 4));
    }
    gl.bindTexture(gl.TEXTURE_2D, hairTex); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TEX_W, texH, gl.RGBA, gl.FLOAT, data);
  }
  const drawn = () => gpuCompute ? st.count : Math.min(st.count, 8000);
  // ---- zeros: coarse while combing, fine when the hand stops
  const fastMesh = geodesic(3).V, fastTorus = Array.from({ length: 64 * 24 }, (_, k) => torusPoint([2 * Math.PI * (k % 64) / 64, 2 * Math.PI * Math.floor(k / 64) / 24]));
  function quickVmax() { let m = 0; for (const p of torus() ? fastTorus : fastMesh) m = Math.max(m, Math.hypot(...fieldOf(p))); return m || 1; }
  let zTimer = 0, zFine = 0;
  function changed() {
    vmax = quickVmax(); fieldDirty = true; stage.wake();
    if (!zTimer) zTimer = setTimeout(() => { zTimer = 0; info = zerosOf(4); report(); stage.wake(); }, 60);
    clearTimeout(zFine); zFine = setTimeout(() => { info = zerosOf(5); vmax = Math.max(vmax, info.vmax || 0) || 1; fieldDirty = true; report(); stage.wake(); }, 260);
  }
  const signed = (k) => (k > 0 ? '+' : k < 0 ? '−' : '') + Math.abs(k);
  function report() {
    if (!info) return;
    if (info.degenerate) {
      ['zeros', 'indices', 'sum', 'res'].forEach((k) => metrics.set(k, '–'));
      page.read(t('Le champ est nul partout : chaque point est un zéro. Choisis un champ de départ ou donne un coup de peigne.', 'The field is zero everywhere: every point is a zero. Choose a starting field or comb the ball.'));
      return;
    }
    const z = info.zeros, idx = z.map((q) => signed(q.index)).sort().join(', '), chi = torus() ? 'χ(T²)' : 'χ(S²)';
    metrics.set('zeros', String(z.length)); metrics.set('indices', idx || '–'); metrics.set('sum', signed(info.sum));
    metrics.set('res', z.length ? Math.max(...z.map((q) => q.residual)).toExponential(1).replace('.', lang === 'fr' ? ',' : '.') : '–');
    const strokes = t(`${st.strokes.length} coup${st.strokes.length > 1 ? 's' : ''} de peigne.`, `${st.strokes.length} comb stroke${st.strokes.length === 1 ? '' : 's'}.`);
    if (torus() && !z.length) page.read(t(`Aucun zéro : le tore est peigné, sans épi. Somme des indices 0 = χ(T²). ${strokes}`, `No zero: the torus is combed flat, with no cowlick. Sum of the indices 0 = χ(T²). ${strokes}`));
    else page.read(t(`${z.length} zéro${z.length > 1 ? 's' : ''} ; somme des indices ${signed(info.sum)} = ${chi}. ${strokes}`, `${z.length} zero${z.length === 1 ? '' : 's'}; the indices add up to ${signed(info.sum)} = ${chi}. ${strokes}`));
  }
  // ---- combing
  let hover = null;
  const hit = (ray) => torus() ? rayTorus(ray.o, ray.d) : raySphere(ray.o, ray.d, [0, 0, 0], 1.0);
  const gap = (a, b) => torus() ? Math.hypot(...sub3(a, b)) : Math.acos(clamp(dot3(a, b), -1, 1));
  function addStroke(a, b) {
    if (torus()) {
      // on the torus: centre at the middle in (u, v), direction in the frame (e_u, e_v), scaled by the local lengths
      const qa = torusParam(a), qb = torusParam(b), w = (x) => x - 2 * Math.PI * Math.round(x / (2 * Math.PI)), du = w(qb[0] - qa[0]), dv = w(qb[1] - qa[1]);
      const c = [qa[0] + du / 2, qa[1] + dv / 2], d = [du * (TORUS.R + TORUS.r * Math.cos(c[1])), dv * TORUS.r], l = Math.hypot(d[0], d[1]) || 1;
      st.strokes = [...st.strokes, { c, t: [d[0] / l, d[1] / l] }].slice(-MAX_STROKES); changed(); return;
    }
    const m = norm3([a[0] + b[0], a[1] + b[1], a[2] + b[2]]), d = sub3(b, a), dn = dot3(d, m), tv = norm3([d[0] - dn * m[0], d[1] - dn * m[1], d[2] - dn * m[2]]);
    st.strokes = [...st.strokes, { c: m, t: tv }].slice(-MAX_STROKES); changed();
  }
  stage.pick = (ray) => {
    if (st.mode !== 'comb') return null;
    let last = hit(ray); if (!last) return null;
    return { move(r) { const p = hit(r); hover = p; if (!p) return; if (gap(p, last) > 0.09) { addStroke(last, p); last = p; } }, up() {} };
  };
  stage.hover = (ray) => { if (st.mode !== 'comb') { if (hover) { hover = null; stage.wake(); } return; } hover = hit(ray); stage.wake(); };
  // ---- frame
  stage.draw = (f) => {
    const C = f.C, VP = new Float32Array(f.viewProj);
    if (fieldDirty) { fieldDirty = false; computeHair(); }
    const ps = scalpProgram(), mesh = torus() ? tscalp : scalp;
    gl.useProgram(ps); setField(ps);
    gl.uniformMatrix4fv(ps.u('uVP'), false, VP); gl.uniform3fv(ps.u('uEye'), f.eye); gl.uniform1f(ps.u('uVmax'), vmax);
    const object = rgb(C.object, [0.1, 0.5, 0.45]);
    gl.uniform3fv(ps.u('uScalp'), object.map((x) => x * 0.35)); gl.uniform3fv(ps.u('uZero'), rgb(C.neg, [0.8, 0.15, 0.1]));
    gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
    gl.useProgram(P.hair); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, hairTex); gl.uniform1i(P.hair.u('uPts'), 0);
    gl.uniformMatrix4fv(P.hair.u('uVP'), false, VP); gl.uniform3fv(P.hair.u('uEye'), f.eye);
    gl.uniform1f(P.hair.u('uWidth'), 0.0075 * Math.sqrt(30000 / drawn()));
    gl.uniform3fv(P.hair.u('uRoot'), object.map((x) => x * 0.55)); gl.uniform3fv(P.hair.u('uTip'), object.map((x) => Math.min(1, x * 1.25 + 0.06)));
    gl.uniform1f(P.hair.u('uAlpha'), 1); gl.uniform1i(P.hair.u('uSurf'), torus() ? 1 : 0);
    gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.bindVertexArray(hairVao); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, PTS * 2, drawn());
    gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE); gl.bindVertexArray(null);
  };
  stage.drawOverlay = (g, f) => {
    // a point is in front when the ray from the eye meets the surface there first
    const C = f.C, front = (p) => { if (!torus()) return dot3(p, f.eye) > 1.0; const d = norm3(sub3(p, f.eye)), h = rayTorus(f.eye, d); return !!h && Math.hypot(...sub3(h, p)) < 1e-3; };
    if (st.labels && info && !info.degenerate) for (const z of info.zeros) {
      if (!front(z.p)) continue;
      const [x, y] = stage.project(z.p), [x2, y2] = stage.project(z.p.map((v) => v * 1.0) .map((v, i) => v + 0.09 * (i === 2 ? 1 : 0)));
      const r = Math.max(9, Math.hypot(x2 - x, y2 - y));
      g.lineWidth = 2; g.strokeStyle = C.neg; g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.stroke();
      g.font = '700 14px "Atkinson Hyperlegible", system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'bottom';
      const label = signed(z.index); g.lineWidth = 4; g.strokeStyle = C.surface; g.strokeText(label, x + r + 3, y - 3); g.fillStyle = C.ink; g.fillText(label, x + r + 3, y - 3);
    }
    if (st.mode === 'comb' && hover && front(hover)) { const [x, y] = stage.project(hover); g.strokeStyle = C.ink; g.globalAlpha = 0.7; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.beginPath(); g.arc(x, y, 26, 0, 2 * Math.PI); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
  };
  stage.restore = () => { build(); changed(); };
  // ---- controls
  const abort = new AbortController(), on = (el, ev, fn) => el.addEventListener(ev, fn, { signal: abort.signal });
  on($('#hb-preset'), 'change', (e) => { st.preset = e.target.value; changed(); });
  function setSurface(s, preset) {
    st.surface = s; st.strokes = []; st.preset = preset; $('#hb-surface').value = s;
    $('#hb-preset').innerHTML = (s === 'torus' ? TORUS_PRESETS : SPHERE_PRESETS).map(([v, fr, en]) => opt(v, fr, en)).join(''); $('#hb-preset').value = preset;
    metrics.set('chi', s === 'torus' ? '0' : '2'); stage.cam.dist = s === 'torus' ? 5 : 4.2; allocate();
  }
  on($('#hb-surface'), 'change', (e) => { setSurface(e.target.value, e.target.value === 'torus' ? 'along' : 'dipole'); changed(); });
  on($('#hb-torus'), 'click', () => { setSurface('torus', 'along'); st.strength = 1; const sl = $('#hb-strength'); sl.value = '1'; sl.dispatchEvent(new Event('input')); Object.assign(stage.cam, { pitch: 0.75, vyaw: 0, vpitch: 0 }); changed(); });
  on($('#hb-mode'), 'change', (e) => { st.mode = e.target.value; stage.canvas.style.cursor = st.mode === 'comb' ? 'crosshair' : ''; stage.wake(); });
  on($('#hb-count'), 'change', (e) => { st.count = Number(e.target.value); allocate(); stage.wake(); });
  on($('#hb-labels'), 'change', (e) => { st.labels = e.target.checked; stage.wake(); });
  // the field with a single singularity: one zero of index +2, turned towards the viewer
  on($('#hb-single'), 'click', () => { setSurface('sphere', 'single'); st.strength = 1; const sl = $('#hb-strength'); sl.value = '1'; sl.dispatchEvent(new Event('input')); Object.assign(stage.cam, { pitch: 0.95, vyaw: 0, vpitch: 0 }); changed(); });
  on($('#hb-clear'), 'click', () => { st.strokes = []; changed(); });
  on($('#hb-random'), 'click', () => {
    let s = (Date.now() % 2147483646) + 1; const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647, out = [];
    if (torus()) for (let i = 0; i < 24; i++) { const a = 2 * Math.PI * rnd(); out.push({ c: [2 * Math.PI * rnd(), 2 * Math.PI * rnd()], t: [Math.cos(a), Math.sin(a)] }); }
    else for (let i = 0; i < 24; i++) { const c = norm3([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]), a = norm3([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]), d = dot3(a, c); out.push({ c, t: norm3([a[0] - d * c[0], a[1] - d * c[1], a[2] - d * c[2]]) }); }
    st.strokes = [...st.strokes, ...out].slice(-MAX_STROKES); changed();
  });
  bind(root, 'hb-strength', (v) => { st.strength = v; changed(); }, (v) => num(v, 2));
  bind(root, 'hb-length', (v) => { st.length = v; fieldDirty = true; stage.wake(); }, (v) => num(v, 2));
  build(); stage.start(); changed();
  return () => { clearTimeout(zTimer); clearTimeout(zFine); abort.abort(); stage.destroy(); metrics.el.remove(); };
}
