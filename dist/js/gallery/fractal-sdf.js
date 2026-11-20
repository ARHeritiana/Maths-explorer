// Distance functions of the 3D fractals, written twice: in GLSL for the ray-marched pictures (gl-progressive.js) and in
// JavaScript for the tests (tests/fractal-sdf.test.mjs), which check them against the exact cell models of
// gallery-selfsimilar-model.js and gallery-escape3d-model.js. The two versions are kept line by line alike; change both.
// Each GLSL `de` may write `trap.x` in [0, 1], the colour of the point (the stage that carved a hole, the corner taken…).
const SDBOX = 'float sdBox(vec3 p,vec3 b){vec3 d=abs(p)-b;return min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.));}';
export const GLSL = {
  // Menger sponge of stage uStage in the cube [−1, 1]³: remove, at each stage, the cross through the middle of every cube.
  menger: `${SDBOX}
float de(vec3 p){float d=sdBox(p,vec3(1));trap=vec4(0);float s=1.;
  for(int m=0;m<8;m++){if(m>=uStage)break;vec3 a=mod(p*s,2.)-1.;s*=3.;vec3 r=abs(1.-3.*abs(a));
    float c=(min(max(r.x,r.y),min(max(r.y,r.z),max(r.z,r.x)))-1.)/s;if(c>d){d=c;trap.x=float(m+1)/float(uStage+1);}}
  return d;}`,
  // Cantor dust: keep the 8 corner cubes of side 1/3 at every stage.
  dust: `${SDBOX}
float de(vec3 p){trap=vec4((p.x>0.?1.:0.)/7.+(p.y>0.?2.:0.)/7.+(p.z>0.?4.:0.)/7.,0,0,0);float s=1.;
  for(int m=0;m<8;m++){if(m>=uStage)break;p=abs(p);p=(p-vec3(2./3.))*3.;s*=3.;}
  return sdBox(p,vec3(1))/s;}`,
  // Sierpiński tetrahedron: at every stage go to the half-size copy at the nearest vertex (the one with the largest
  // barycentric coordinate), then measure the distance to the tetrahedron itself.
  tetrix: `
const vec3 V0=vec3(1,1,1),V1=vec3(1,-1,-1),V2=vec3(-1,1,-1),V3=vec3(-1,-1,1);
float sdTetra(vec3 p){return max(max(-dot(V0,p),-dot(V1,p)),max(-dot(V2,p),-dot(V3,p)))*0.57735-0.57735;}
float de(vec3 p){float s=1.;trap=vec4(0);
  for(int m=0;m<10;m++){if(m>=uStage)break;vec3 c=V0;float b=dot(p,V0),k=0.;
    float b1=dot(p,V1);if(b1>b){b=b1;c=V1;k=1.;}float b2=dot(p,V2);if(b2>b){b=b2;c=V2;k=2.;}float b3=dot(p,V3);if(b3>b){c=V3;k=3.;}
    if(m==0)trap.x=k/3.;p=2.*p-c;s*=2.;}
  return .85*sdTetra(p)/s;}`,
  // Mandelbulb of power uP.x (White and Nylander): radius to the power n, angles times n, plus the start.
  bulb: `
float de(vec3 p){vec3 z=p;float dr=1.,r=0.,n=uP.x,mt=1e9;
  for(int i=0;i<64;i++){if(i>=uIters)break;r=length(z);if(r>2.)break;mt=min(mt,r);
    float th=acos(clamp(z.z/r,-1.,1.))*n,ph=atan(z.y,z.x)*n;dr=pow(r,n-1.)*n*dr+1.;z=pow(r,n)*vec3(sin(th)*cos(ph),sin(th)*sin(ph),cos(th))+p;}
  r=length(z);trap=vec4(smoothstep(.45,1.05,mt),0,0,0);return .5*log(r)*r/dr;}`,
  // Mandelbox of scale uP.x (Lowe): fold the box, fold the sphere, scale, add the start.
  box: `
float de(vec3 p){vec3 z=p;float dr=1.,s=uP.x,mt=1e9;
  for(int i=0;i<64;i++){if(i>=uIters)break;z=clamp(z,-1.,1.)*2.-z;float r2=dot(z,z);mt=min(mt,r2);
    float f=r2<.25?4.:(r2<1.?1./r2:1.);z*=f*s;dr=dr*f*abs(s)+1.;z+=p;if(dot(z,z)>1e8)break;}
  trap=vec4(clamp(sqrt(mt),0.,1.),0,0,0);return length(z)/abs(dr);}`,
  // Quaternion Julia set of q → q² + uC, the slice whose fourth coordinate is uP.x.
  julia: `
vec4 qmul(vec4 a,vec4 b){return vec4(a.x*b.x-a.y*b.y-a.z*b.z-a.w*b.w,a.x*b.y+a.y*b.x+a.z*b.w-a.w*b.z,a.x*b.z-a.y*b.w+a.z*b.x+a.w*b.y,a.x*b.w+a.y*b.z-a.z*b.y+a.w*b.x);}
float de(vec3 p){vec4 q=vec4(p,uP.x),dq=vec4(1,0,0,0);float mt=1e9;
  for(int i=0;i<64;i++){if(i>=uIters)break;dq=2.*qmul(q,dq);q=qmul(q,q)+uC;mt=min(mt,dot(q,q));if(dot(q,q)>16.)break;}
  float r=length(q);trap=vec4(smoothstep(.15,.85,sqrt(mt)),0,0,0);return .5*r*log(r)/length(dq);}`,
};

// JavaScript twins (no trap): the cube and tetrahedron coordinates of the GLSL above.
const sdBox = (p, b) => { const d = p.map((v) => Math.abs(v) - b); const out = Math.hypot(...d.map((v) => Math.max(v, 0))); return Math.min(Math.max(...d), 0) + out; };
const mod = (x, y) => x - y * Math.floor(x / y);
export function mengerSDF(p, stage) {
  let d = sdBox(p, 1), s = 1;
  for (let m = 0; m < stage; m++) {
    const a = p.map((v) => mod(v * s, 2) - 1); s *= 3; const r = a.map((v) => Math.abs(1 - 3 * Math.abs(v)));
    const c = (Math.min(Math.max(r[0], r[1]), Math.max(r[1], r[2]), Math.max(r[2], r[0])) - 1) / s; if (c > d) d = c;
  }
  return d;
}
export function dustSDF(p, stage) { let q = [...p], s = 1; for (let m = 0; m < stage; m++) { q = q.map((v) => (Math.abs(v) - 2 / 3) * 3); s *= 3; } return sdBox(q, 1) / s; }
export const TETRA_V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sdTetra = (p) => Math.max(...TETRA_V.map((v) => -dot(v, p))) * 0.57735 - 0.57735;
export function tetrixSDF(p, stage) {
  let q = [...p], s = 1;
  for (let m = 0; m < stage; m++) { let c = TETRA_V[0], b = dot(q, c); for (const v of TETRA_V.slice(1)) { const bv = dot(q, v); if (bv > b) { b = bv; c = v; } } q = q.map((x, k) => 2 * x - c[k]); s *= 2; }
  return 0.85 * sdTetra(q) / s;
}
// Radius of a sphere around each figure (the ray marcher starts and stops there).
export const BOUNDS = { menger: 1.75, dust: 1.75, tetrix: 1.8, bulb: 1.25, julia: 1.7, box: (s) => Math.sqrt(3) * (s > 1 ? Math.min(12, (2 * (s + 1)) / (s - 1)) : s < -1 ? 2.2 : 4) };   // the box reaches its corners
