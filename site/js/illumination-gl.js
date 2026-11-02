// GPU "light map" of the mirrored rooms: every traced segment is drawn as a thin line with additive blending, so the brightness of a
// pixel is the number of rays that crossed it (a coverage map). With hundreds or thousands of rays this shows where light does and
// does not go, which 100 stroked canvas paths cannot do at interactive speed. The tracing itself is in illumination-model.js.
// createLightMap returns null without WebGL2 (the page then draws a thinned set of rays with the 2D canvas).
const VERTEX = `#version 300 es
in vec2 aPos;
uniform vec2 uSize;     // logical canvas size
uniform vec3 uCamera;   // page camera: x, y, scale
void main() { vec2 s = uCamera.xy + uCamera.z * aPos; gl_Position = vec4(s.x / uSize.x * 2.0 - 1.0, 1.0 - s.y / uSize.y * 2.0, 0.0, 1.0); }`;
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec4 uColor;    // premultiplied colour added by each segment
out vec4 fragColor;
void main() { fragColor = uColor; }`;

export function createLightMap(makeCanvas = () => document.createElement('canvas')) {
  let canvas, gl;
  try { canvas = makeCanvas(); canvas.width = 2; canvas.height = 2; gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, depth: false, preserveDrawingBuffer: false }); } catch { gl = null; }
  if (!gl || typeof gl.createShader !== 'function') return null;
  const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; };
  const vs = compile(gl.VERTEX_SHADER, VERTEX), fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const vao = gl.createVertexArray(), buffer = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const at = gl.getAttribLocation(program, 'aPos'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const U = { size: gl.getUniformLocation(program, 'uSize'), camera: gl.getUniformLocation(program, 'uCamera'), color: gl.getUniformLocation(program, 'uColor') };
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  let lost = false;
  canvas.addEventListener?.('webglcontextlost', (e) => { lost = true; e.preventDefault?.(); });
  const api = {
    canvas,
    get lost() { return lost || gl.isContextLost?.() === true; },
    // segments: Float32Array of x1, y1, x2, y2 in logical px; count: number of segments; strength 0..1 added per crossing.
    render({ width, height, size, segments, count, color, strength, camera = { x: 0, y: 0, scale: 1 } }) {
      if (api.lost) return null;
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bufferData(gl.ARRAY_BUFFER, segments.subarray(0, count * 4), gl.DYNAMIC_DRAW);
      gl.uniform2f(U.size, size[0], size[1]); gl.uniform3f(U.camera, camera.x, camera.y, camera.scale);
      gl.uniform4f(U.color, color[0] * strength, color[1] * strength, color[2] * strength, strength);
      gl.drawArrays(gl.LINES, 0, count * 2);
      return canvas;
    },
    destroy() { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* already gone */ } lost = true; },
  };
  return api;
}

// ---- the density map: for hundreds of thousands of rays. Crossings are counted in a float colour buffer (one line per segment, added
// into the red channel), chunk after chunk, and shown through a tone curve 1 - exp(-gain x count), so a pixel crossed by a million
// rays and one crossed by a hundred are both readable. The segments stay in room units; the page gives the affine map to the screen.
// Returns null where float colour buffers are missing (the page then offers no more than the ordinary light map).
const D_VERTEX = `#version 300 es
in vec2 aPos;
uniform vec2 uSize;     // logical canvas size
uniform vec4 uWorld;    // room to screen: offset x, offset y, scale x, scale y
uniform vec3 uCamera;   // page camera: x, y, scale
void main() { vec2 p = vec2(uWorld.x + uWorld.z * aPos.x, uWorld.y + uWorld.w * aPos.y); vec2 s = uCamera.xy + uCamera.z * p; gl_Position = vec4(s.x / uSize.x * 2.0 - 1.0, 1.0 - s.y / uSize.y * 2.0, 0.0, 1.0); }`;
const D_COUNT = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() { fragColor = vec4(1.0, 0.0, 0.0, 0.0); }`;
const D_QUAD = `#version 300 es
void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
const D_SHOW = `#version 300 es
precision highp float;
uniform sampler2D uCount; uniform vec3 uColor; uniform float uGain;
out vec4 fragColor;
void main() { float c = texelFetch(uCount, ivec2(gl_FragCoord.xy), 0).r; float a = 1.0 - exp(-uGain * c); fragColor = vec4(uColor * a, a); }`;

export function createDensityMap(makeCanvas = () => document.createElement('canvas')) {
  let canvas, gl;
  try { canvas = makeCanvas(); canvas.width = 2; canvas.height = 2; gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, preserveDrawingBuffer: false }); } catch { return null; }
  if (!gl || typeof gl.createShader !== 'function' || !gl.getExtension('EXT_color_buffer_float')) return null;
  const blend32 = !!gl.getExtension('EXT_float_blend');   // 32-bit counts when blending them is allowed, else 16-bit (exact up to 2048 crossings)
  const make = (vsrc, fsrc) => {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vsrc), f = sh(gl.FRAGMENT_SHADER, fsrc); if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  };
  const count = make(D_VERTEX, D_COUNT), show = make(D_QUAD, D_SHOW); if (!count || !show) return null;
  const loc = { size: gl.getUniformLocation(count, 'uSize'), world: gl.getUniformLocation(count, 'uWorld'), camera: gl.getUniformLocation(count, 'uCamera'), pos: gl.getAttribLocation(count, 'aPos'),
    tex: gl.getUniformLocation(show, 'uCount'), color: gl.getUniformLocation(show, 'uColor'), gain: gl.getUniformLocation(show, 'uGain') };
  const vao = gl.createVertexArray(), buffer = gl.createBuffer(), quad = gl.createVertexArray();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
  let texture = null, fbo = null, W = 0, H = 0, lost = false;
  canvas.addEventListener?.('webglcontextlost', (e) => { lost = true; e.preventDefault?.(); });
  const target = (width, height) => {
    if (texture && W === width && H === height) return true;
    if (texture) { gl.deleteTexture(texture); gl.deleteFramebuffer(fbo); }
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, blend32 ? gl.R32F : gl.R16F, width, height, 0, gl.RED, blend32 ? gl.FLOAT : gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    W = width; H = height; return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  };
  const api = {
    canvas, precision: blend32 ? 32 : 16,
    get lost() { return lost || gl.isContextLost?.() === true; },
    // start a new picture of this size (all counts to zero)
    reset(width, height) {
      if (api.lost) return false; if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      if (!target(width, height)) return false; gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return true;
    },
    // add the crossings of one chunk: segments are room units x1 y1 x2 y2, world = { ox, oy, sx, sy } maps the room to logical px
    add({ segments, count: n, size, world, camera = { x: 0, y: 0, scale: 1 } }) {
      if (api.lost || !n) return; gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, W, H); gl.useProgram(count); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.bufferData(gl.ARRAY_BUFFER, segments.subarray(0, n * 4), gl.STREAM_DRAW);
      gl.uniform2f(loc.size, size[0], size[1]); gl.uniform4f(loc.world, world.ox, world.oy, world.sx, world.sy); gl.uniform3f(loc.camera, camera.x, camera.y, camera.scale);
      gl.drawArrays(gl.LINES, 0, n * 2);
    },
    // draw the counts through the tone curve onto the canvas
    present({ color, gain }) {
      if (api.lost) return null; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.disable(gl.BLEND); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(show); gl.bindVertexArray(quad); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(loc.tex, 0); gl.uniform3f(loc.color, color[0], color[1], color[2]); gl.uniform1f(loc.gain, gain); gl.drawArrays(gl.TRIANGLES, 0, 3); return canvas;
    },
    // the count of one pixel (tests and diagnostics): reads the buffer back
    probe(x, y) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); const out = new Float32Array(4);
      try { gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, out); } catch { return null; } return out[0];
    },
    destroy() { try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* already gone */ } lost = true; },
  };
  return api;
}

