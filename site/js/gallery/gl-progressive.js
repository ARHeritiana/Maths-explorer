// Progressive WebGL2 drawing for the gallery (fractals in the plane and in space). One full-screen fragment shader per
// figure; while the figure moves, frames are drawn at half resolution so dragging stays smooth; once it is still, frames are
// drawn at full resolution with a sub-pixel jitter and averaged (blending into the kept buffer), so edges and fine detail
// sharpen over a second or so. `raymarchShader` builds the shader of a 3D distance-estimated object with soft shadows,
// ambient occlusion, orbit-trap colouring in the site's colours, a highlight and a soft background.
// createProgressive returns null without WebGL2; the exhibits then keep their processor drawing.
const VERT = `#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;

// CSS colour to linear RGB, through a 1×1 canvas (cached per string).
const rgbCache = new Map();
export function linearRGB(css) {
  if (rgbCache.has(css)) return rgbCache.get(css);
  let out = [0.5, 0.5, 0.5];
  try { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#000'; x.fillStyle = css; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; out = [d[0], d[1], d[2]].map((v) => (v / 255) ** 2.2); } catch {}
  rgbCache.set(css, out); return out;
}

// Pure: how many samples to average and at which resolution, given whether the figure moved and how long frames take.
export function plan(state, now) {
  const still = now - state.lastChange > 140;
  if (!still) return { scale: 0.5, sample: 0, done: false };
  const max = state.frameMs > 60 ? 4 : state.frameMs > 30 ? 8 : 16;
  return { scale: 1, sample: state.samples, done: state.samples >= max };
}
// Sub-pixel offsets of the averaged samples (a fixed low-discrepancy sequence, so two runs give the same picture).
export const jitter = (k) => { const h = (b, i) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }; return k === 0 ? [0, 0] : [h(2, k) - 0.5, h(3, k) - 0.5]; };

export function createProgressive(fragment, uniformNames) {
  let cv, gl;
  try { cv = document.createElement('canvas'); gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false }); } catch { return null; }
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader'); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  const U = Object.fromEntries(['uRes', 'uJitter', ...uniformNames].map((n) => [n, gl.getUniformLocation(prog, n)])), vao = gl.createVertexArray();
  const state = { samples: 0, lastChange: -1e9, frameMs: 16, w: 0, h: 0, view: [0, 0] };
  const api = {
    canvas: cv,
    // something changed: start again from a quick half-resolution frame
    reset(now = performance.now()) { state.samples = 0; state.lastChange = now; },
    // draw one frame; set(gl, U) sets the figure's uniforms. Returns true while more frames would improve the picture.
    frame(w, h, set, now = performance.now()) {
      const p = plan(state, now); if (p.done) return false;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; state.samples = 0; }
      const vw = Math.max(1, Math.round(w * p.scale)), vh = Math.max(1, Math.round(h * p.scale)), t0 = performance.now();
      gl.viewport(0, 0, vw, vh); gl.useProgram(prog); gl.bindVertexArray(vao);
      gl.uniform2f(U.uRes, vw, vh); const j = jitter(p.sample); gl.uniform2f(U.uJitter, j[0], j[1]); set(gl, U);
      if (p.sample > 0) { gl.enable(gl.BLEND); gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA); gl.blendColor(0, 0, 0, 1 / (p.sample + 1)); } else gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish();
      const ms = performance.now() - t0; state.frameMs = state.frameMs * 0.7 + ms * 0.3;
      state.view = [vw, vh]; if (p.scale === 1) state.samples++;
      return true;
    },
    // copy the last frame onto a 2D canvas context (logical size W × H): only the drawn part of the buffer
    blit(g, W, H) { const [vw, vh] = state.view; if (!vw) return; g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, cv.height - vh, vw, vh, 0, 0, W, H); g.restore(); },
    busy: () => !plan(state, performance.now()).done,
    destroy() { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
  return api;
}

// The shader of a ray-marched 3D object. `de` is GLSL defining `float de(vec3 p)` that may write the global `vec4 trap`
// (orbit trap, x in [0, 1] chooses the colour). Uniforms: camera (uEye, uFwd, uRight, uUp, uFov), uBound (radius of a
// sphere around the object), uPix (angular size of a pixel), colours (uBg0, uBg1, uCol0, uCol1, uCol2, uInk), uLight,
// and the figure's own uP (vec4), uC (vec4), uIters, uStage.
export const RAY_UNIFORMS = ['uEye', 'uFwd', 'uRight', 'uUp', 'uFov', 'uBound', 'uPix', 'uBg0', 'uBg1', 'uCol0', 'uCol1', 'uCol2', 'uInk', 'uLight', 'uP', 'uC', 'uIters', 'uStage', 'uFar'];
export function raymarchShader(de, { steps = 220, shadowSteps = 40 } = {}) {
  return `#version 300 es
precision highp float;
uniform vec2 uRes,uJitter;uniform vec3 uEye,uFwd,uRight,uUp,uBg0,uBg1,uCol0,uCol1,uCol2,uInk,uLight;uniform float uFov,uBound,uPix,uFar;
uniform vec4 uP,uC;uniform int uIters,uStage;out vec4 fragColor;
vec4 trap;
${de}
vec2 sphere(vec3 ro,vec3 rd,float r){float b=dot(ro,rd),c=dot(ro,ro)-r*r,h=b*b-c;if(h<0.)return vec2(-1);h=sqrt(h);return vec2(-b-h,-b+h);}
float shadow(vec3 ro,vec3 rd,float k,float t0){float res=1.,t=t0;for(int i=0;i<${shadowSteps};i++){float h=de(ro+rd*t);res=min(res,k*h/t);t+=clamp(h,.003*uBound,.12*uBound);if(res<.002||t>uBound*2.)break;}return clamp(res,0.,1.);}
float occlusion(vec3 p,vec3 n,float s){float o=0.,w=1.;for(int i=1;i<=5;i++){float h=s*float(i);o+=w*(h-de(p+n*h));w*=.55;}return .3+.7*clamp(1.-.55*o/s,0.,1.);}
vec3 palette(float x){x=clamp(x,0.,1.);return x<.5?mix(uCol0,uCol1,x*2.):mix(uCol1,uCol2,x*2.-1.);}
void main(){
  vec2 uv=(gl_FragCoord.xy+uJitter-.5*uRes)/uRes.y;
  vec3 rd=normalize(uFwd*uFov+uRight*uv.x+uUp*uv.y),ro=uEye;
  vec3 bg=mix(uBg0,uBg1,clamp(.55+.6*uv.y,0.,1.))*(1.-.18*dot(uv,uv));
  vec2 hitS=sphere(ro,rd,uBound);vec3 col=bg;
  if(hitS.y>0.){
    float t=max(hitS.x,0.),tEnd=min(hitS.y,uFar);bool hit=false;float d=0.;
    for(int i=0;i<${steps};i++){d=de(ro+rd*t);if(d<uPix*t){hit=true;break;}t+=d;if(t>tEnd)break;}
    if(hit){
      vec3 p=ro+rd*t;float e=max(uPix*t*.5,1e-6);vec2 k=vec2(1,-1);
      vec3 n=normalize(k.xyy*de(p+k.xyy*e)+k.yyx*de(p+k.yyx*e)+k.yxy*de(p+k.yxy*e)+k.xxx*de(p+k.xxx*e));
      de(p);vec3 base=mix(palette(trap.x),vec3(1),.12);
      vec3 L=normalize(uLight);float dif=clamp(dot(n,L),0.,1.);
      float sh=dif>0.?shadow(p+n*e*3.,L,8.,max(e*6.,.004*uBound)):0.;
      float ao=occlusion(p,n,max(.02*uBound,e*6.));
      float sky=.5+.5*dot(n,normalize(uUp+uFwd*-.3));
      vec3 h=normalize(L-rd);float spe=pow(clamp(dot(n,h),0.,1.),48.)*dif*sh;
      float fre=pow(clamp(1.+dot(n,rd),0.,1.),3.);
      float back=clamp(dot(n,-L)*.5+.5,0.,1.);
      vec3 F=normalize(-L+uUp*.6);float fill=clamp(dot(n,F),0.,1.);
      col=base*((.2+.3*sky)*ao+.28*fill*ao+.12*back+1.05*dif*sh*(.5+.5*ao))+.4*spe+fre*.3*bg*ao;
      col=mix(col,uInk,.08*(1.-ao));
    }
  }
  col=col/(1.+.25*col);   // gentle tone mapping
  fragColor=vec4(pow(col,vec3(1./2.2)),1);
}`;
}

// Set the camera and colour uniforms of a ray-marched figure: view {yaw, pitch}, distance, bound radius, palette C.
export function setCamera(gl, U, { yaw, pitch }, dist, bound, w, h, scale) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const eye = [dist * cp * cy, dist * cp * sy, dist * sp], f = eye.map((v) => -v / dist), r = [-sy, cy, 0], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const fov = 1.8;   // r is the screen right (f × z), u the screen up (r × f)
  gl.uniform3fv(U.uEye, eye); gl.uniform3fv(U.uFwd, f); gl.uniform3fv(U.uRight, r); gl.uniform3fv(U.uUp, u); gl.uniform1f(U.uFov, fov);
  gl.uniform1f(U.uBound, bound); gl.uniform1f(U.uFar, dist + bound * 2); gl.uniform1f(U.uPix, 1.1 / (fov * h * scale));
  // the light comes from the upper left, slightly behind the viewer
  const L = [0, 1, 2].map((k) => -r[k] * 0.55 + u[k] * 0.8 - f[k] * 0.45); gl.uniform3fv(U.uLight, L);
}
export function setColours(gl, U, C) {
  gl.uniform3fv(U.uBg0, linearRGB(C.surface)); gl.uniform3fv(U.uBg1, linearRGB(C.sunken)); gl.uniform3fv(U.uInk, linearRGB(C.ink));
  gl.uniform3fv(U.uCol0, linearRGB(C.c[1])); gl.uniform3fv(U.uCol1, linearRGB(C.object)); gl.uniform3fv(U.uCol2, linearRGB(C.c[2]));
}
