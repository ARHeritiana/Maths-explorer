// Fixed-resolution decorative preview. Its bounded zoom needs direct float iteration,
// not the activity's deep-zoom perturbation renderer. No runtime dependencies.
// The still picture (reduced motion, no WebGL2, a card that does not move) shows the whole set; deeper in the zoom the view is a thin band
// along the real axis that reads as a flat strip at thumbnail size.
export const STILL_T = 0;
export function previewCamera(t) {
  const w = 3.4 * Math.exp(Math.log(.063 / 3.4) * t / 22);
  const u = Math.min(1, Math.max(0, (t - 2) / 10)), e = u * u * (3 - 2 * u);
  return { x: -.5 + (-1.763897 + .5) * e, w, max: Math.round(80 + 40 * Math.log2(3.4 / w)) };
}
const vertex = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const fragment = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec3 uView,uNext;
uniform int uMax,uNextMax;
uniform float uBlend;
out vec4 outColor;
vec3 colour(float n){float k=.045*n+.2;return ((.5+.5*cos(6.28318530718*(k+vec3(0.,.12,.28))))*vec3(215.,220.,235.)+vec3(20.,12.,12.))/255.;}
vec3 sampleView(vec2 uv,vec3 view,int limit){
 vec2 c=vec2(view.x,0.)+uv*view.yz;
 float x=c.x-.25,q=x*x+c.y*c.y;
 if(q*(q+x)<=.25*c.y*c.y || (c.x+1.)*(c.x+1.)+c.y*c.y<=.0625)return vec3(10.,12.,20.)/255.;
 vec2 z=vec2(0.);
 for(int i=0;i<1500;i++){
  if(i>=limit)break;
  z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
  float m=dot(z,z);
  if(m>65536.)return colour(float(i+1)+1.-log2(.5*log(m)));
 }
 return vec3(10.,12.,20.)/255.;
}
void main(){
 vec3 sum=vec3(0.);
 for(int y=0;y<2;y++)for(int x=0;x<2;x++){
  vec2 uv=(gl_FragCoord.xy-.5+(vec2(float(x),float(y))+.5)/2.)/uResolution-.5;
  vec3 a=sampleView(uv,uView,uMax);
  if(uBlend>0.)a=mix(a,sampleView(uv,uNext,uNextMax),uBlend);
  sum+=a;
 }
 outColor=vec4(sum/4.,1.);
}`;
function renderer(canvas) {
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'high-performance'});
  if(!gl)return null;
  const shader=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){gl.deleteShader(sh);throw Error('Preview shader compilation failed');}return sh;};
  const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Preview shader linking failed');
  gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
  const U=Object.fromEntries(['Resolution','View','Next','Max','NextMax','Blend'].map(k=>[k,gl.getUniformLocation(program,'u'+k)]));
  return {
    draw(w,h,t){
      if(gl.isContextLost())return;
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      const a=previewCamera(t),b=previewCamera(Math.max(0,t-22)),u=Math.max(0,(t-22)/2);
      gl.viewport(0,0,w,h);gl.uniform2f(U.Resolution,w,h);
      gl.uniform3f(U.View,a.x,a.w,a.w*h/w);gl.uniform3f(U.Next,b.x,b.w,b.w*h/w);
      gl.uniform1i(U.Max,a.max);gl.uniform1i(U.NextMax,b.max);gl.uniform1f(U.Blend,u*u*(3-2*u));
      gl.drawArrays(gl.TRIANGLES,0,3);
    },
    destroy(){gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  };
}
// Without WebGL2 keep a full-resolution still, rather than an enlarged low-resolution animation.
function drawStill(canvas,w,h){
  canvas.width=w;canvas.height=h;
  const g=canvas.getContext('2d');if(!g)return;
  const image=g.createImageData(w,h),c=previewCamera(STILL_T),height=c.w*h/w;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const cr=c.x+((i+.5)/w-.5)*c.w,ci=(.5-(j+.5)/h)*height;
    let x=0,y=0,n=0;
    while(n<c.max&&x*x+y*y<=65536){const a=x*x-y*y+cr;y=2*x*y+ci;x=a;n++;}
    const v=n>=c.max?null:n+1-Math.log2(.5*Math.log(x*x+y*y));
    const k=v===null?0:.045*v+.2,index=4*(j*w+i);
    for(let channel=0;channel<3;channel++)image.data[index+channel]=v===null?[10,12,20][channel]:Math.floor((.5+.5*Math.cos(2*Math.PI*(k+[0,.12,.28][channel])))*[215,220,235][channel]+[20,12,12][channel]);
    image.data[index+3]=255;
  }
  g.putImageData(image,0,0);
}
export function mountMandelbrotPreview(canvas,{reduced=()=>false}={}) {
  let gpu;
  try{gpu=renderer(canvas);}catch{gpu=null;}
  if(!gpu){
    // A failed shader may already own the original canvas's context.
    const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;
  }
  let alive=true,visible=false,raf=0,time=0,lastClock=performance.now(),lastDraw=-Infinity,dirty=true,lastSize='';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const isStill=()=>reduced()||motion.matches||!gpu;
  function schedule(){if(alive&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;if(!alive||!visible||document.hidden)return;
    const dt=Math.min(.1,Math.max(0,(now-lastClock)/1000));lastClock=now;
    const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1,w=Math.max(2,Math.round(r.width*d)),h=Math.max(2,Math.round(r.height*d)),size=w+'x'+h;
    if(size!==lastSize){lastSize=size;dirty=true;}
    if(!isStill()){time+=dt*.99;if(time>=24)time-=22;}
    if(dirty||!isStill()&&now-lastDraw>=1000/30){
      if(gpu)gpu.draw(w,h,isStill()?STILL_T:time);else drawStill(canvas,w,h);
      lastDraw=now;dirty=false;
    }
    if(!isStill())schedule();
  }
  const refresh=()=>{dirty=true;lastClock=performance.now();schedule();};
  const pause=()=>{if(raf)cancelAnimationFrame(raf);raf=0;lastClock=performance.now();};
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)refresh();else pause();});io.observe(canvas);
  const ro=new ResizeObserver(refresh);ro.observe(canvas);
  const visibility=()=>{if(document.hidden)pause();else refresh();};
  const lost=e=>{e.preventDefault();pause();};
  const restored=()=>{gpu=renderer(canvas);refresh();};
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
  document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',refresh);motion.addEventListener('change',refresh);
  return ()=>{alive=false;pause();io.disconnect();ro.disconnect();motion.removeEventListener('change',refresh);window.removeEventListener('resize',refresh);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);gpu?.destroy();};
}
