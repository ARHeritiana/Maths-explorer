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
