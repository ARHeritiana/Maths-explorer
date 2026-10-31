// GPU renderer for the Mandelbrot and Julia views of the gallery (WebGL2, no dependency).
//
// Every pixel is computed at the resolution of the screen, with a smooth escape time, so that the image is as sharp as
// the display allows. A single-precision shader cannot zoom far on its own, so it uses perturbation: one reference orbit
// Z_n is computed in double precision on the CPU for the centre of the view, and each pixel iterates only its small
// difference d_n = z_n - Z_n, with d_{n+1} = 2 Z_n d_n + d_n^2 + dc. The difference keeps its relative precision at any
// depth the page allows (view width down to 2e-13). When a pixel's orbit comes closer to 0 than its difference is
// large, or when the reference orbit ends, the pixel "rebases" onto the start of the reference (Zhuoran's method): an
// exact rewriting that removes the visible glitches of the plain method.
// Julia sets use the same shader: the reference orbit starts at the centre of the view, the difference starts at the
// pixel and dc = 0. Without WebGL2 (or after a lost context) createFractalGL returns null and the page keeps its CPU path.

export const ORBIT_CAPACITY = 2048;   // texels of the reference orbit; also bounds the iteration limit (2000)
export const MAX_ITERATIONS = 2000;

// The reference orbit z_0 = (zr, zi), z_{n+1} = z_n^2 + c in double precision, stored as float pairs until it leaves a
// large disc, `max` iterations or the capacity. Returns { data: Float32Array(2 * ORBIT_CAPACITY), length }.
export function referenceOrbit(zr, zi, cr, ci, max, capacity = ORBIT_CAPACITY) {
  const data = new Float32Array(2 * capacity), limit = Math.min(capacity, max + 1);
  let x = zr, y = zi, n = 0;
  for (; n < limit; n++) {
    data[2 * n] = x; data[2 * n + 1] = y;
    if (x * x + y * y > 1e12) { n++; break; }
    const t = x * x - y * y + cr; y = 2 * x * y + ci; x = t;
  }
  return { data, length: n };
}

const VERTEX = `#version 300 es
void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uOrbit;
uniform int uLength;      // valid texels of the reference orbit
uniform int uMax;         // iteration limit
uniform int uJulia;       // 1: the pixel is the starting point z_0, 0: the pixel is the parameter c
uniform int uSamples;     // samples per axis (1 or 2)
uniform vec2 uRes;        // size of the target in pixels
uniform vec2 uSize;       // world width and height of the view
out vec4 fragColor;

const float TAU = 6.283185307179586;
vec2 fetch(int n) { return texelFetch(uOrbit, ivec2(n, 0), 0).rg; }
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }

// cosine palette on the smooth escape time; the inside of the set is dark
vec3 palette(float v) {
  float k = 0.045 * v + 0.2;
  vec3 c = 0.5 + 0.5 * cos(TAU * (k + vec3(0.0, 0.12, 0.28)));
  return (c * vec3(215.0, 220.0, 235.0) + vec3(20.0, 12.0, 12.0)) / 255.0;
}

vec3 shade(vec2 offset) {
  vec2 Z0 = fetch(0), d, dc;
  if (uJulia == 1) { d = offset; dc = vec2(0.0); } else { d = vec2(0.0); dc = offset; }
  int n = 0;
  for (int i = 0; i < ${MAX_ITERATIONS}; i++) {
    if (i >= uMax) break;
    if (n >= uLength - 1) { d = fetch(n) + d - Z0; n = 0; }                  // the reference orbit has ended: rebase
    d = 2.0 * cmul(fetch(n), d) + cmul(d, d) + dc;
    n++;
    vec2 z = fetch(n) + d;
    float m = dot(z, z);
    if (m > 65536.0) return palette(float(i + 1) + 1.0 - log2(0.5 * log(m)));
    if (m < dot(d, d)) { d = z - Z0; n = 0; }                                // glitch-free rebasing
  }
  return vec3(10.0, 12.0, 20.0) / 255.0;
}

void main() {
  vec3 sum = vec3(0.0);
  float count = float(uSamples * uSamples);
  for (int sy = 0; sy < 2; sy++) for (int sx = 0; sx < 2; sx++) {
    if (sx >= uSamples || sy >= uSamples) continue;
    vec2 jitter = (vec2(float(sx), float(sy)) + 0.5) / float(uSamples);       // regular grid inside the pixel
    vec2 uv = (gl_FragCoord.xy - 0.5 + jitter) / uRes - 0.5;
    sum += shade(uv * uSize);
  }
  fragColor = vec4(sum / count, 1.0);
}`;

export function createFractalGL(makeCanvas = () => document.createElement('canvas')) {
  let canvas, gl;
  try {
    canvas = makeCanvas(); canvas.width = 2; canvas.height = 2;
    gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  } catch { gl = null; }
  if (!gl || typeof gl.createShader !== 'function' || typeof gl.texImage2D !== 'function') return null;
  const compile = (type, source) => { const sh = gl.createShader(type); gl.shaderSource(sh, source); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; };
  const vs = compile(gl.VERTEX_SHADER, VERTEX), fs = compile(gl.FRAGMENT_SHADER, FRAGMENT), program = gl.createProgram();
  if (!vs || !fs) return null;
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const loc = (name) => gl.getUniformLocation(program, name);
  const U = { orbit: loc('uOrbit'), length: loc('uLength'), max: loc('uMax'), julia: loc('uJulia'), samples: loc('uSamples'), res: loc('uRes'), size: loc('uSize') };
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, ORBIT_CAPACITY, 1, 0, gl.RG, gl.FLOAT, new Float32Array(2 * ORBIT_CAPACITY));
  gl.uniform1i(U.orbit, 0);
  let lost = false;
  canvas.addEventListener?.('webglcontextlost', (e) => { lost = true; e.preventDefault?.(); });
  const api = {
    canvas,
    get lost() { return lost || gl.isContextLost?.() === true; },
    // opts: width, height (pixels), kind 'mandelbrot' | 'julia', cx, cy (centre of the view), w (world width), h (world
    // height), c = [cr, ci] (Julia parameter), max (iteration limit), samples (1 or 2 per axis). Returns the canvas.
    render({ width, height, kind, cx, cy, w, h, c = [0, 0], max, samples = 1 }) {
      if (api.lost) return null;
      width = Math.max(2, Math.round(width)); height = Math.max(2, Math.round(height));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      const julia = kind === 'julia', limit = Math.max(1, Math.min(MAX_ITERATIONS, Math.round(max)));
      const orbit = julia ? referenceOrbit(cx, cy, c[0], c[1], limit) : referenceOrbit(0, 0, cx, cy, limit);
      gl.viewport(0, 0, width, height);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, ORBIT_CAPACITY, 1, gl.RG, gl.FLOAT, orbit.data);
      gl.uniform1i(U.length, orbit.length); gl.uniform1i(U.max, limit); gl.uniform1i(U.julia, julia ? 1 : 0);
      gl.uniform1i(U.samples, samples > 1 ? 2 : 1); gl.uniform2f(U.res, width, height); gl.uniform2f(U.size, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return canvas;
    },
    destroy() { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* already gone */ } lost = true; },
  };
  return api;
}
