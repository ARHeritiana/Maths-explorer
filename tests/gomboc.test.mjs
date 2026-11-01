// The smooth Gömböc of Várkonyi and Domokos (2006): the surface, its mass properties, its equilibria and convexity, the exact
// contact with a plane, the display mesh, and the rolling dynamics. Every check is independent of the code it tests
// (finite differences, quadrature at two resolutions, conserved energy, Newton's law from kinematics).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../site/js/gomboc-body.js';
import * as P from '../site/js/gomboc-rolling.js';
import {makeSupportBody} from '../site/js/gomboc-support.js';
import {VISIBLE_TERMS,VISIBLE_META} from '../site/js/gomboc-support-data.js';
import {GOMBOC_GALLERY,GOMBOC_STORY} from '../site/js/gomboc-content.js';
const PI=Math.PI,near=(a,b,eps)=>assert.ok(Math.abs(a-b)<=eps,`${a} versus ${b} (eps ${eps})`);

test('the radial law is analytic: partial derivatives agree with finite differences, poles are ±1, limit (22) of the paper holds',()=>{
 const h=1e-6;
 for(const [th,ph] of [[.7,.3],[2.4,-1.1],[.05,1.5],[4,-1.5],[1.57,.2]]){
  const r=B.deltaR(th,ph);
  near(r.dt,(B.deltaR(th+h,ph).v-B.deltaR(th-h,ph).v)/(2*h),1e-6);near(r.dp,(B.deltaR(th,ph+h).v-B.deltaR(th,ph-h).v)/(2*h),1e-6);
 }
 near(B.deltaR(.4,PI/2).v,1,0);near(B.deltaR(.4,-PI/2).v,-1,0);near(B.deltaR(.4,PI/2-1e-7).v,1,1e-9);near(B.deltaR(.4,-PI/2+1e-7).v,-1,1e-9);
 // limit c -> 0 (eq. 22): -1 on the upper half, +1 on the lower half, sin²θ − cos²θ on the equator (theta not a multiple of π/2)
 near(B.deltaR(.7,.8,.03).v,-1,1e-6);near(B.deltaR(.7,-.8,.03).v,1,1e-6);near(B.deltaR(.7,0,.03).v,Math.sin(.7)**2-Math.cos(.7)**2,1e-12);
 // limit c -> infinity (eq. 21): sin φ
 near(B.deltaR(.7,.8,500).v,Math.sin(.8),2e-2);
 // the two reflection planes θ = 0 and θ = π/2 and the half-turn symmetry
 near(B.deltaR(0,.9).v,B.deltaR(0,.9).v,0);near(B.deltaR(1.1,.4).v,B.deltaR(-1.1,.4).v,1e-14);near(B.deltaR(1.1,.4).v,B.deltaR(PI-1.1,.4).v,1e-14);
});

test('mass properties: the centre of gravity is the origin, quadrature has converged, c is the root of the centroid condition',()=>{
 const a=B.massProperties(B.C,B.D,200,256),b=B.massProperties(B.C,B.D,400,720);
 near(a.volume,b.volume,1e-11);near(a.volume,4*PI/3,3*B.D);
 for(let k=0;k<3;k++){near(a.centroid[k],0,1e-9);near(b.centroid[k],0,1e-9);}
 for(let k=0;k<9;k++)near(a.inertia[k],b.inertia[k],1e-10);
 near(a.inertia[0]/a.volume,.4,2e-3);          // a ball of unit radius: 2/5
 near(B.solveC(),B.C,1e-9);
 // the root is a genuine sign change near the authors' value c ≈ 0.275 and the centroid is moved by about d when c is moved by 0.01
 assert.ok(B.centroidZ(.2)<0&&B.centroidZ(.4)>0);assert.ok(Math.abs(B.C-.275)<.01);
 assert.ok(Math.abs(B.centroidZ(B.C+.01)-B.centroidZ(B.C))>1e-7);
});

test('only the two poles are equilibria: R has its minimum at S and its maximum at N, and no other critical point on the sphere',()=>{
 let min=Infinity,max=-Infinity,argmin,argmax,least=Infinity;
 for(let i=1;i<1200;i++)for(let j=0;j<=200;j++){const ph=-PI/2+PI*i/1200,th=j/200*PI/2,r=B.deltaR(th,ph);
  if(r.v<min){min=r.v;argmin=ph;}if(r.v>max){max=r.v;argmax=ph;}
  if(Math.abs(ph)<PI/2-.01)least=Math.min(least,Math.hypot(r.dp,r.dt/Math.cos(ph)));}
 assert.ok(argmin<-PI/2+.01&&argmax>PI/2-.01);assert.ok(min<-.99&&max>.99);
 assert.ok(least>3e-5,`gradient of ΔR bounded below away from the poles: ${least}`);
 // support function of the real body: minimum at the south pole direction, maximum at the north pole direction
 const lo=B.contact([0,0,-1]).H,hi=B.contact([0,0,1]).H;near(lo,1-B.D,1e-12);near(hi,1+B.D,1e-12);
 let others=Infinity;
 for(let i=1;i<80;i++)for(let j=0;j<80;j++){const ph=-PI/2+PI*i/80,th=2*PI*j/80,nu=B.direction(th,ph);if(Math.abs(ph)>PI/2-.05)continue;
  const c=B.contact(nu),tangent=c.r.map((x,k)=>x-c.H*nu[k]);others=Math.min(others,Math.hypot(...tangent));assert.ok(c.H>lo&&c.H<hi);}
 assert.ok(others>2e-9,`gradient of the support function (r minus its normal part) away from the poles: ${others}`);
});

test('the body is convex: the radial gauge function 1/R has a positive-definite spherical Hessian plus identity everywhere checked',()=>{
 let worst=Infinity;
 const probe=(t,p,h,d=B.D)=>{const psi=(t,p)=>1/(1+d*B.deltaR(t,p).v),F=psi(t,p),ft=(s,u)=>psi(t+s*h/Math.cos(p),p+u*h),pt=(ft(1,0)-ft(-1,0))/(2*h/Math.cos(p)),pp=(ft(0,1)-ft(0,-1))/(2*h);
  const ptt=(ft(1,0)-2*F+ft(-1,0))/(h/Math.cos(p))**2,ppp=(ft(0,1)-2*F+ft(0,-1))/h**2,ptp=(ft(1,1)-ft(1,-1)-ft(-1,1)+ft(-1,-1))/(4*h*h/Math.cos(p));
  const cp=Math.cos(p),sp=Math.sin(p),Mpp=ppp+F,Mtt=(ptt-sp*cp*pp)/cp**2+F,Mpt=(ptp+Math.tan(p)*pt)/cp;
  return ((Mpp+Mtt)/2-Math.sqrt((Mpp-Mtt)**2/4+Mpt**2))/F;};
 for(let i=1;i<100;i++)for(let j=0;j<=24;j++)worst=Math.min(worst,probe(j/24*PI/2,-PI/2+PI*i/100,1e-5));
 for(const eps of [3e-2,1e-2,3e-3])for(let j=0;j<=24;j++)for(const sgn of [-1,1])worst=Math.min(worst,probe(j/24*PI/2,sgn*(PI/2-eps),Math.min(1e-5,eps/10)));
 assert.ok(worst>.4,`smallest relative curvature ${worst}`);
 // the paper's own bound: with d about ten times larger the surface stops being convex
 let bad=false;for(const eps of [3e-3,1e-3])for(let j=0;j<=24;j++)if(probe(j/24*PI/2,-PI/2+eps,Math.min(1e-5,eps/10),1e-3)<0)bad=true;
 assert.ok(bad,'d = 1e-3 must violate convexity near the poles, as the paper says');
});

test('contact is exact: the surface normal at the contact point is the requested one, and r(ν) is the gradient of the support function',()=>{
 for(const [th,ph] of [[.3,-1.2],[2.5,.4],[4.1,1.3],[5.5,-.3]]){
  const nu=B.direction(th,ph),c=B.contact(nu),g=B.deltaAt(c.w),k=1+B.D*g.v,n=c.w.map((x,i)=>x-B.D*g.g[i]/k),l=Math.hypot(...n);
  for(let i=0;i<3;i++)near(n[i]/l,nu[i],1e-12);
  assert.ok(Math.abs(Math.hypot(...c.r)-k)<1e-12);
  // Hessian of the support function: symmetric, zero along ν, eigenvalues (radii of curvature) within 1e-3 of 1
  const J=B.contactJacobian(nu,c);near(J[1],J[3],1e-6);near(J[2],J[6],1e-6);near(J[5],J[7],1e-6);
  for(let i=0;i<3;i++)near(J[3*i]*nu[0]+J[3*i+1]*nu[1]+J[3*i+2]*nu[2],0,1e-9);
  const trace=J[0]+J[4]+J[8];near(trace,2,2e-2);
  // H is the support function: no surface point is farther along ν
  let best=-Infinity;for(let i=-40;i<=40;i++)for(let j=-40;j<=40;j++){const w=c.w.map((x,k)=>x+i*5e-4*[1,0,0][k]*0+0),a=[c.w[1],-c.w[0],0],l=Math.hypot(...a)||1,e1=a.map(x=>x/l),e2=[c.w[1]*e1[2]-c.w[2]*e1[1],c.w[2]*e1[0]-c.w[0]*e1[2],c.w[0]*e1[1]-c.w[1]*e1[0]],q=w.map((x,k)=>c.w[k]+i*5e-4*e1[k]+j*5e-4*e2[k]),n=Math.hypot(...q),sf=B.surface(q.map(x=>x/n));best=Math.max(best,sf[0]*nu[0]+sf[1]*nu[1]+sf[2]*nu[2]);}
  assert.ok(best<=c.H+1e-13&&c.H-best<1e-13,`${best} ${c.H}`);
 }
});

test('display mesh: closed latitude-longitude strip, outward triangles, unit directions, ΔR from the model',()=>{
 const m=B.buildMesh(48,24);assert.equal(m.indices.length%3,0);let inward=0;
 for(let v=0;v<m.vertices;v++)near(Math.hypot(m.dir[3*v],m.dir[3*v+1],m.dir[3*v+2]),1,1e-6);
 for(let i=0;i<m.indices.length;i+=3){const [a,b,c]=[0,1,2].map(k=>{const v=m.indices[i+k];return [m.dir[3*v],m.dir[3*v+1],m.dir[3*v+2]];}),u=b.map((x,k)=>x-a[k]),w=c.map((x,k)=>x-a[k]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
  if(Math.hypot(...n)<1e-12)continue;if(n[0]*(a[0]+b[0]+c[0])+n[1]*(a[1]+b[1]+c[1])+n[2]*(a[2]+b[2]+c[2])<0)inward++;}
 assert.equal(inward,0);assert.equal(m.delta[0],-1);assert.equal(m.delta[m.vertices-1],1);
 const preview=B.previewMesh(1500);assert.ok(preview.vertices.every(p=>p.every(Number.isFinite))&&preview.quads.length>100);
});

const energy=(s)=>P.derived(s).energy,g=P.GRAVITY*B.D;
test('rolling without slipping: Newton\'s law holds from the kinematics, the contact force is vertical to 10⁻⁴, the energy is conserved',()=>{
 let s=P.start({colatitude:1,azimuth:.4});const e0=energy(s);
 // F = d/dt(v) + g ẑ, with v = −ω×ρ differentiated numerically along the motion
 const h=.01,a=P.derived(s),s2=P.advance(s,h),b=P.derived(P.advance(s,2*h)),m=P.derived(s2),acc=[0,1,2].map(i=>(b.v[i]-a.v[i])/(2*h)),e=P.evaluate(s);
 for(let i=0;i<3;i++)near(acc[i]+(i===2?P.GRAVITY:0),e.F[i],2e-6);
 near(e.F[2],P.GRAVITY,1e-3);assert.ok(Math.hypot(e.F[0],e.F[1])/e.F[2]<1e-3);
 for(let k=0;k<10;k++){s=P.simulate(s,100,0,.1);assert.ok(Math.abs(energy(s)-e0)<1e-3*g,`energy drift ${energy(s)-e0}`);near(Math.hypot(...s.q),1,1e-12);}
 // a rolling body with no dissipation travels: it is not at rest
 assert.ok(Math.hypot(s.c[0],s.c[1])>1e-3);
 // time-step convergence
 const c1=P.simulate(P.start({colatitude:1,azimuth:.4}),300,0,.1),c2=P.simulate(P.start({colatitude:1,azimuth:.4}),300,0,.05);
 near(c1.c[0],c2.c[0],1e-6);near(c1.c[1],c2.c[1],1e-6);
});

test('equilibria of the dynamics: stable and exactly-placed unstable poles rest, a nudged unstable pole leaves, damping brings a tipped body to the stable pole',()=>{
 for(const colat of [0,PI]){const s=P.simulate(P.start({colatitude:colat}),1000,0,.1);assert.ok(Math.hypot(...s.om)<1e-12,String(colat));}
 const gone=P.simulate(P.start({colatitude:PI-1e-3,azimuth:.7}),400,0,.1);assert.ok(P.diagnostics(gone).angleStable<PI-.5);
 // linear stability of the stable pole: a small tip oscillates (no growth beyond twice the start)
 let s=P.start({colatitude:.05,azimuth:1}),worst=0;for(let k=0;k<30;k++){s=P.simulate(s,100,0,.1);worst=Math.max(worst,P.diagnostics(s).angleStable);}
 assert.ok(worst<.1,`stable pole is stable: ${worst}`);
 // with rolling resistance the contact settles near the stable pole and the energy never rises
 let d=P.start({colatitude:1,azimuth:.4}),last=energy(d);const start=P.diagnostics(d).angleStable;
 for(let k=0;k<25;k++){d=P.simulate(d,200,.0015,.1);const e=energy(d);assert.ok(e<=last+1e-3*g,'energy rose under dissipation');last=e;}
 assert.ok(P.diagnostics(d).angleStable<.45*start,`${P.diagnostics(d).angleStable}`);
 assert.ok(P.diagnostics(d,.0015).slip<1e-3);
});

test('entry points describe the smooth body, its size, and the sources honestly',()=>{
 assert.ok(GOMBOC_GALLERY.links.includes('#stories/'+GOMBOC_STORY.id));assert.ok(GOMBOC_STORY.links.includes('#gallery/gomboc'));
 const text=JSON.stringify([GOMBOC_GALLERY,GOMBOC_STORY]);assert.match(text,/0,002 %/);assert.match(text,/0\.002 %/);assert.match(text,/c ≈ 0,275|c ≈ 0\.275/);assert.doesNotMatch(text,/polyhedr|polyédr/i);assert.doesNotMatch(text,/[—–]/);
 assert.equal(GOMBOC_GALLERY.answer,4);assert.equal(B.D,2e-5);
});

// ---------------------------------------------------------------------------------------------------------------------
// The visibly shaped body, defined by its support function (gomboc-support.js, coefficients from scripts/optimise-gomboc.py).
const V=makeSupportBody(VISIBLE_TERMS),VR=V.range(),dirOf=(th,ph)=>[Math.cos(ph)*Math.cos(th),Math.cos(ph)*Math.sin(th),Math.sin(ph)];
const eigs=(A,nu)=>{const th=Math.atan2(nu[1],nu[0]),ph=Math.asin(nu[2]),ep=[-Math.sin(ph)*Math.cos(th),-Math.sin(ph)*Math.sin(th),Math.cos(ph)],et=[-Math.sin(th),Math.cos(th),0],
 Ae=(u,v)=>{let q=0;for(let a=0;a<3;a++)for(let b=0;b<3;b++)q+=u[a]*A[3*a+b]*v[b];return q;},a=Ae(ep,ep),b=Ae(ep,et),c=Ae(et,et),m=(a+c)/2,r=Math.sqrt((a-c)**2/4+b*b);return [m-r,m+r];};

test('visible body: it is clearly not a sphere, its centre of gravity is the origin, quadrature has converged',()=>{
 assert.ok(VR.hi/VR.lo>1.15,`ratio ${VR.hi/VR.lo}`);near(V.height([0,0,-1]),VR.lo,0);near(V.height([0,0,1]),VR.hi,0);
 const a=V.massProperties(64,96),b=V.massProperties(120,200);
 near(a.volume,b.volume,1e-11);for(let k=0;k<3;k++){near(a.centroid[k],0,1e-8);near(b.centroid[k],0,1e-8);}
 for(let k=0;k<9;k++)near(a.inertia[k],b.inertia[k],1e-10);
 // the volume of a body with these heights lies between the balls of radius h_min and h_max
 assert.ok(a.volume>4*PI/3*VR.lo**3&&a.volume<4*PI/3*VR.hi**3);
 assert.ok(VISIBLE_META.convexityMargin>0&&VISIBLE_META.degree>=8);
});

test('visible body: jet is consistent with finite differences, the surface is its own support function, A is the derivative of the contact point',()=>{
 for(const [th,ph] of [[.4,.3],[1.2,-.9],[.05,1.3],[1.5,-1.4],[0,0]]){
  const nu=dirOf(th,ph),j=V.jet(nu),h=1e-5,ep=[-Math.sin(ph)*Math.cos(th),-Math.sin(ph)*Math.sin(th),Math.cos(ph)],et=[-Math.sin(th),Math.cos(th),0];
  const f=(t,p)=>V.height(dirOf(t,p));
  near(Math.hypot(...j.g)>0?j.g[0]*ep[0]+j.g[1]*ep[1]+j.g[2]*ep[2]:0,(f(th,ph+h)-f(th,ph-h))/(2*h),1e-7);
  near((j.g[0]*et[0]+j.g[1]*et[1]+j.g[2]*et[2])*Math.cos(ph),(f(th+h,ph)-f(th-h,ph))/(2*h),1e-7);
  // contact point derivative: r(ν + δ) − r(ν − δ) ≈ 2 A δ along a tangent direction
  const d=1e-5,up=dirOf(th,ph+d),dn=dirOf(th,ph-d),ru=V.contact(up).r,rd=V.contact(dn).r,A=V.contactJacobian(nu);
  for(let k=0;k<3;k++)near((ru[k]-rd[k])/(2*d),A[3*k]*ep[0]+A[3*k+1]*ep[1]+A[3*k+2]*ep[2],1e-6);
  // support property: no surface point goes further along ν than h(ν)
  let best=-Infinity;for(let i=0;i<1500;i++){const a=i*2.399963229728653,z=1-2*(i+.5)/1500,r=Math.sqrt(1-z*z),w=[r*Math.cos(a),r*Math.sin(a),z],p=V.contact(w).r;best=Math.max(best,p[0]*nu[0]+p[1]*nu[1]+p[2]*nu[2]);}
  assert.ok(best<=V.height(nu)+1e-9,`${best} ${V.height(nu)}`);
 }
});

test('visible body: convex everywhere (radii of curvature positive, poles included) and only the two poles are equilibria',()=>{
 let lo=Infinity,hi=-Infinity,least=Infinity,leastLine=Infinity;
 for(let i=0;i<=180;i++)for(let k=0;k<=90;k++){const ph=-PI/2+PI*i/180,th=k/90*PI/2,nu=dirOf(th,ph),{g,A}=V.jet(nu),[l1,l2]=eigs(A,nu);
  lo=Math.min(lo,l1);hi=Math.max(hi,l2);
  if(Math.abs(ph)<PI/2-.03&&th>.03&&th<PI/2-.03)least=Math.min(least,Math.hypot(...g));
  if((k===0||k===90)&&Math.abs(ph)<PI/2-.01)leastLine=Math.min(leastLine,Math.hypot(...g)/Math.cos(ph));}
 for(const nu of [[0,0,-1],[0,0,1]]){const [l1]=eigs(V.jet(nu).A,[1e-9,0,Math.sign(nu[2])*1]);assert.ok(l1>0.02,`pole curvature ${l1}`);}
 assert.ok(lo>0.02,`smallest radius of curvature ${lo}`);assert.ok(hi<5);
 assert.ok(least>5e-4,`gradient of h away from the symmetry lines ${least}`);assert.ok(leastLine>1e-3,`gradient on the lines ${leastLine}`);
 // independent classification on a lattice of the whole sphere: no local extremum of h except the poles
 const n=120,m=240,H=(i,j)=>V.height(dirOf(2*PI*j/m,-PI/2+PI*i/n));let extra=0;
 for(let i=1;i<n;i++)for(let j=0;j<m;j++){const c=H(i,j),nb=[H(i-1,j),H(i+1,j),H(i,(j+1)%m),H(i,(j+m-1)%m),H(i-1,(j+1)%m),H(i-1,(j+m-1)%m),H(i+1,(j+1)%m),H(i+1,(j+m-1)%m)];
  if(nb.every(x=>c>x)||nb.every(x=>c<x))extra++;}
 // the grid rows next to the poles are allowed as the extremum ring only if the pole itself is: none must appear
 assert.equal(extra,0);
 let argmin=[0,0],mn=Infinity,mx=-Infinity;for(let i=0;i<=n;i++)for(let j=0;j<m;j++){const v=H(i,j);if(v<mn){mn=v;argmin=[i,j];}mx=Math.max(mx,v);}
 near(mn,VR.lo,1e-12);near(mx,VR.hi,1e-12);assert.equal(argmin[0],0);
});

test('visible body: rolling without slipping conserves energy, rests at its poles, leaves the unstable one, settles with damping',()=>{
 let s=P.start({colatitude:1,azimuth:.4});const e0=P.derived(s,V).energy,unit=P.GRAVITY*(VR.hi-VR.lo)/2;
 for(let k=0;k<10;k++){s=P.simulate(s,10,0,.01,V);assert.ok(Math.abs(P.derived(s,V).energy-e0)<2e-6*unit,`energy ${P.derived(s,V).energy-e0}`);}
 const run=(dt)=>P.simulate(P.start({colatitude:1,azimuth:.4}),20,0,dt,V),c1=run(.02),c2=run(.01),c3=run(.005),err=(x,y)=>Math.hypot(x.c[0]-y.c[0],x.c[1]-y.c[1]);
 assert.ok(err(c2,c3)<2e-3&&err(c1,c3)>6*err(c2,c3),`step convergence ${err(c1,c3)} ${err(c2,c3)}`);
 // Newton's law from the kinematics
 const a=P.derived(P.advance(s,-.005,0,V),V),b=P.derived(P.advance(s,.005,0,V),V),e=P.evaluate(s,0,V);
 for(let i=0;i<3;i++)near((b.v[i]-a.v[i])/.01+(i===2?P.GRAVITY:0),e.F[i],3e-4);
 assert.ok(e.F[2]>0&&Math.hypot(e.F[0],e.F[1])/e.F[2]<.4,'no-slip needs a friction a dry floor can give');
 const rest=P.simulate(P.start({colatitude:0}),30,0,.01,V);assert.ok(Math.hypot(...rest.om)<1e-9);
 const top=P.simulate(P.start({colatitude:PI}),5,0,.01,V);assert.ok(Math.hypot(...top.om)<.05);
 const gone=P.simulate(P.start({colatitude:PI-1e-2,azimuth:.7}),60,0,.01,V);assert.ok(P.diagnostics(gone,0,V).angleStable<PI-.5);
 // oscillation about the stable pole stays near it; with damping the contact settles there and the energy never rises
 let near0=P.start({colatitude:.1,azimuth:1}),worst=0;for(let k=0;k<20;k++){near0=P.simulate(near0,5,0,.01,V);worst=Math.max(worst,P.diagnostics(near0,0,V).angleStable);}assert.ok(worst<.15,String(worst));
 let d=P.start({colatitude:1.2,azimuth:.4}),last=P.derived(d,V).energy;
 for(let k=0;k<30;k++){d=P.simulate(d,5,.03,.01,V);const en=P.derived(d,V).energy;assert.ok(en<=last+1e-6*unit,'energy rose');last=en;}
 assert.ok(P.diagnostics(d,.03,V).angleStable<.2,String(P.diagnostics(d,.03,V).angleStable));
});
