// WebGL2 renderer of the smooth Gömböc (mesh and radial law from gomboc-body.js). One draw call per frame; the physics, the
// markers and the floor stay in the page's 2D canvas. Returns null without WebGL2.
//
// The vertex shader places each vertex at (1 + k·ΔR)·direction, with k = relief·d, and the fragment shader shades with the
// exact normal of that radial surface (direction − k ∇ΔR / (1 + k ΔR)), so the smooth shape reads as smooth whatever the
// relief. relief = 1 is the real body (a sphere to within 2·10⁻⁵ of its radius: the shading then shows nothing but the
// colour); a larger value is a drawing aid that the page announces. The colour map is ΔR itself (cool: thin part, R < 1;
// warm: thick part, R > 1), the line ΔR = 0 (the curve separating them, tennis-ball like) is drawn dark, and a graticule of
// the body (every 15°) makes the rolling visible. The picture is drawn into a transparent canvas of the same pixel size as
// the page canvas (the page's zoom and pan are applied here), then composited by the page with an identity transform.

const VERTEX = `#version 300 es
in vec3 aDir; in float aDelta; in vec3 aGrad;
uniform mat3 uR;        // body rotation (world = R p + uP)
uniform mat3 uView;     // rows: screen u (right), v (up), d (away); applied to world vectors
uniform vec3 uP;        // position of the centre of mass
uniform vec4 uScreen;   // centre x, centre y (logical px), scale (px per unit), k = relief * d
uniform vec2 uOffset;   // display offset, logical px
uniform vec3 uCamera;   // page camera: x, y, scale
uniform vec2 uSize;     // logical canvas size
out vec3 vN; out vec3 vDir; out float vDelta;
void main() {
  float k = uScreen.w, rho = 1.0 + k * aDelta;
  vec3 pos = aDir * rho;
  vec3 nb = normalize(aDir - k * aGrad / rho);       // normal of the radial graph, body frame
  vec3 w = uR * pos + uP;
  vec3 v = uView * w;
  vec2 s = vec2(uScreen.x + v.x * uScreen.z, uScreen.y - v.y * uScreen.z) + uOffset;
  s = uCamera.xy + uCamera.z * s;
  gl_Position = vec4(s.x / uSize.x * 2.0 - 1.0, 1.0 - s.y / uSize.y * 2.0, v.z / 12.0, 1.0);
  vN = uR * nb; vDir = aDir; vDelta = aDelta;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vDir; in float vDelta;
uniform vec3 uToViewer;   // unit world vector from the surface towards the viewer
uniform vec3 uKey;        // unit world vector towards the key light
uniform float uDark;      // 1 in the dark theme
out vec4 fragColor;
float line(float x, float step, float width) {   // anti-aliased line at multiples of step
  float f = abs(fract(x / step + 0.5) - 0.5) * step, w = fwidth(x) * width;
  return 1.0 - smoothstep(w * 0.5, w * 1.5, f);
}
void main() {
  vec3 n = normalize(vN), V = normalize(uToViewer), L = normalize(uKey);
  if (dot(n, V) < 0.0) n = -n;
  float nl = dot(n, L), nv = max(dot(n, V), 0.0), diff = max(nl, 0.0), wrap = clamp(nl * 0.5 + 0.5, 0.0, 1.0);
  // colour map of the deviation from the unit sphere: thin (cool) .. thick (warm), pale at the separatrix
  float t = clamp(vDelta, -1.0, 1.0);
  vec3 cool = vec3(0.14, 0.38, 0.70), mid = vec3(0.90, 0.88, 0.82), warm = vec3(0.86, 0.36, 0.14);
  vec3 base = t < 0.0 ? mix(mid, cool, smoothstep(0.0, 1.0, -t)) : mix(mid, warm, smoothstep(0.0, 1.0, t));
  // graticule of the body, every 15 degrees, thinner near the poles; the separatrix ΔR = 0 in dark ink
  float lat = asin(clamp(vDir.z, -1.0, 1.0)), lon = atan(vDir.y, vDir.x), fade = smoothstep(0.0, 0.08, cos(lat));
  float grid = max(line(lat, 0.2617994, 1.0), line(lon, 0.2617994, 1.0) * fade);
  float sep = 1.0 - smoothstep(fwidth(vDelta) * 1.0, fwidth(vDelta) * 2.2, abs(vDelta));
  base = mix(base, base * 0.55, 0.55 * grid);
  base = mix(base, vec3(0.05, 0.06, 0.09), 0.9 * sep);
  vec3 r = reflect(-V, n);
  vec3 sky = mix(vec3(0.85, 0.90, 0.98), vec3(0.34, 0.48, 0.74), smoothstep(0.0, 1.0, r.z));
  vec3 env = mix(vec3(0.16, 0.12, 0.09), sky, smoothstep(-0.12, 0.18, r.z));
  float hemi = mix(0.14, 0.34, n.z * 0.5 + 0.5);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(n, H), 0.0), 90.0), broad = pow(max(dot(n, H), 0.0), 12.0), fres = pow(1.0 - nv, 4.0);
  vec3 col = base * (hemi + 0.72 * diff + 0.14 * wrap);
  col += base * env * (0.12 + 0.22 * fres);
  col += vec3(1.0, 0.97, 0.90) * (0.55 * spec + 0.06 * broad) * (0.4 + 0.6 * diff);
  col += vec3(0.55, 0.66, 0.90) * fres * 0.12;
  col = col / (1.0 + 0.15 * col);
  col = pow(col, vec3(1.0 / 2.2));
  fragColor = vec4(col, 1.0);
}`;

const colMajor = (m) => new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);   // row-major 3x3 -> GL layout

export function createGombocGL(mesh, makeCanvas = () => document.createElement('canvas')) {
  let canvas, gl;
  try { canvas = makeCanvas(); canvas.width = 2; canvas.height = 2; gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, depth: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }); } catch { gl = null; }
  if (!gl || typeof gl.createShader !== 'function') return null;
  const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; };
  const vs = compile(gl.VERTEX_SHADER, VERTEX), fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const buffer = (target, data) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; };
  for (const [name, data, size] of [['aDir', mesh.dir, 3], ['aDelta', mesh.delta, 1], ['aGrad', mesh.grad, 3]]) {
    buffer(gl.ARRAY_BUFFER, data); const at = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, size, gl.FLOAT, false, 0, 0);
  }
  buffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
  const U = Object.fromEntries(['uR', 'uView', 'uP', 'uScreen', 'uOffset', 'uCamera', 'uSize', 'uToViewer', 'uKey', 'uDark'].map((k) => [k, gl.getUniformLocation(program, k)]));
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS);
  let lost = false;
  canvas.addEventListener?.('webglcontextlost', (e) => { lost = true; e.preventDefault?.(); });
  const api = {
    canvas,
    get lost() { return lost || gl.isContextLost?.() === true; },
    // opts: width, height (device pixels), size [W, H] (logical), R (row-major 3x3 rotation), p (centre of mass), view
    // (row-major 3x3 camera matrix with rows u, v, d), centre [x, y] and scale (px per unit), k = relief * d, offset [x, y],
    // camera { x, y, scale } of the page, toViewer and key (unit vectors).
    render({ width, height, size, R, p, view, centre, scale, k, offset = [0, 0], camera = { x: 0, y: 0, scale: 1 }, toViewer, key, dark = 0 }) {
      if (api.lost) return null;
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix3fv(U.uR, false, colMajor(R)); gl.uniformMatrix3fv(U.uView, false, colMajor(view));
      gl.uniform3f(U.uP, p[0], p[1], p[2]); gl.uniform4f(U.uScreen, centre[0], centre[1], scale, k); gl.uniform2f(U.uOffset, offset[0], offset[1]);
      gl.uniform3f(U.uCamera, camera.x, camera.y, camera.scale); gl.uniform2f(U.uSize, size[0], size[1]);
      gl.uniform3f(U.uToViewer, ...toViewer); gl.uniform3f(U.uKey, ...key); gl.uniform1f(U.uDark, dark);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_INT, 0);
      return canvas;
    },
    destroy() { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* already gone */ } lost = true; },
  };
  return api;
}
