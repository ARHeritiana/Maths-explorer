// WebGL2 renderer of the Gömböc analogue: the 56,946-face body drawn with one normal per vertex (see gomboc-mesh.js), lit by a
// key light and an environment reflection so that it reads as a smooth polished metal body, with no visible facets. One draw
// call per frame; the physics, the markers and the floor stay in the page's 2D canvas. Returns null without WebGL2.
// The picture is drawn into a transparent canvas of the same pixel size as the page canvas (the page's zoom and pan are
// applied here), then composited by the page with an identity transform.

const VERTEX = `#version 300 es
in vec3 aPos; in vec3 aNormal;
uniform mat3 uR;        // body rotation (world = R p + uP)
uniform mat3 uView;     // rows: screen u (right), v (up), d (away); applied to world vectors
uniform vec3 uP;        // position of the centre of mass
uniform vec4 uScreen;   // centre x, centre y (logical px), scale (px per unit), unused
uniform vec2 uOffset;   // display offset (follow mode), logical px
uniform vec3 uCamera;   // page camera: x, y, scale
uniform vec2 uSize;     // logical canvas size
out vec3 vN; out vec3 vW;
void main() {
  vec3 w = uR * aPos + uP;
  vec3 v = uView * w;
  vec2 s = vec2(uScreen.x + v.x * uScreen.z, uScreen.y - v.y * uScreen.z) + uOffset;
  s = uCamera.xy + uCamera.z * s;
  gl_Position = vec4(s.x / uSize.x * 2.0 - 1.0, 1.0 - s.y / uSize.y * 2.0, v.z / 12.0, 1.0);
  vN = uR * aNormal; vW = w;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW;
uniform vec3 uToViewer;   // unit world vector from the surface towards the viewer
uniform vec3 uKey;        // unit world vector towards the key light
uniform vec3 uBase;       // base colour (linear)
out vec4 fragColor;
void main() {
  vec3 n = normalize(vN), V = normalize(uToViewer), L = normalize(uKey);
  float nl = dot(n, L), nv = max(dot(n, V), 0.0);
  float diff = max(nl, 0.0), wrap = clamp(nl * 0.5 + 0.5, 0.0, 1.0);
  // soft environment: bright sky above, warm dark ground below, a gentle horizon
  vec3 r = reflect(-V, n);
  vec3 sky = mix(vec3(0.85, 0.90, 0.98), vec3(0.34, 0.48, 0.74), smoothstep(0.0, 1.0, r.z));
  vec3 env = mix(vec3(0.16, 0.12, 0.09), sky, smoothstep(-0.12, 0.18, r.z));
  float hemi = mix(0.10, 0.30, n.z * 0.5 + 0.5);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(n, H), 0.0), 110.0), broad = pow(max(dot(n, H), 0.0), 14.0);
  float fres = pow(1.0 - nv, 4.0);
  vec3 col = uBase * (hemi + 0.78 * diff + 0.14 * wrap);
  col += uBase * env * (0.30 + 0.35 * fres);            // tinted metal reflection
  col += vec3(1.0, 0.96, 0.88) * (0.85 * spec + 0.10 * broad) * (0.4 + 0.6 * diff);
  col += vec3(0.55, 0.66, 0.90) * fres * 0.22;           // cool rim
  col = col / (1.0 + 0.18 * col);                         // soft shoulder
  col = pow(col, vec3(1.0 / 2.2));
  fragColor = vec4(col, 1.0);                             // premultiplied: opaque inside the body
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
  for (const [name, data] of [['aPos', mesh.positions], ['aNormal', mesh.normals]]) {
    buffer(gl.ARRAY_BUFFER, data); const at = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 3, gl.FLOAT, false, 0, 0);
  }
  buffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
  const U = Object.fromEntries(['uR', 'uView', 'uP', 'uScreen', 'uOffset', 'uCamera', 'uSize', 'uToViewer', 'uKey', 'uBase'].map((k) => [k, gl.getUniformLocation(program, k)]));
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS);
  let lost = false;
  canvas.addEventListener?.('webglcontextlost', (e) => { lost = true; e.preventDefault?.(); });
  const api = {
    canvas,
    get lost() { return lost || gl.isContextLost?.() === true; },
    // opts: width, height (device pixels), size [W, H] (logical), R (row-major 3x3 rotation), p (centre of mass), view
    // (row-major 3x3 camera matrix with rows u, v, d), centre [x, y] and scale (px per unit), offset [x, y], camera
    // { x, y, scale } of the page, toViewer and key (unit vectors), base (linear rgb).
    render({ width, height, size, R, p, view, centre, scale, offset = [0, 0], camera = { x: 0, y: 0, scale: 1 }, toViewer, key, base = [0.58, 0.31, 0.12] }) {
      if (api.lost) return null;
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix3fv(U.uR, false, colMajor(R)); gl.uniformMatrix3fv(U.uView, false, colMajor(view));
      gl.uniform3f(U.uP, p[0], p[1], p[2]); gl.uniform4f(U.uScreen, centre[0], centre[1], scale, 0); gl.uniform2f(U.uOffset, offset[0], offset[1]);
      gl.uniform3f(U.uCamera, camera.x, camera.y, camera.scale); gl.uniform2f(U.uSize, size[0], size[1]);
      gl.uniform3f(U.uToViewer, ...toViewer); gl.uniform3f(U.uKey, ...key); gl.uniform3f(U.uBase, ...base);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_INT, 0);
      return canvas;
    },
    destroy() { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* already gone */ } lost = true; },
  };
  return api;
}
