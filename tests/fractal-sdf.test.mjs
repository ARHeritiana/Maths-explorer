// Distance functions of the ray-marched fractals (site/js/gallery/fractal-sdf.js) and the pure parts of the progressive
// renderer (site/js/gallery/gl-progressive.js). The JavaScript twins of the GLSL must say "inside" exactly where the cell
// models of gallery-selfsimilar-model.js keep a cell, and must never claim more room than there is (a step of that size
// cannot jump over the surface), else the pictures would show the wrong stage or holes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mengerSDF,dustSDF,tetrixSDF,TETRA_V,BOUNDS,GLSL} from '../site/js/gallery/fractal-sdf.js';
import {mengerKept} from '../site/js/gallery/gallery-selfsimilar-model.js';
import {plan,jitter} from '../site/js/gallery/gl-progressive.js';

let seed=12345;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
const point=(r=1.3)=>[0,1,2].map(()=>(2*rnd()-1)*r);
// digit test of the dust: every base-3 digit of every coordinate is 0 or 2
const dustKept=(x,y,z)=>{for(let v of [x,y,z])while(v){if(v%3===1)return false;v=Math.floor(v/3);}return true;};
const cellOf=(p,n)=>{const m=3**n,c=p.map(v=>(v+1)/2*m);if(c.some(v=>v<0||v>=m))return null;const f=c.map(Math.floor);return Math.min(...c.map((v,k)=>Math.min(v-f[k],f[k]+1-v)))<1e-6?'edge':f;};

for(const [name,sdf,kept] of [['Menger sponge',mengerSDF,mengerKept],['Cantor dust',dustSDF,dustKept]])
  test(`${name}: inside exactly the kept cells of stages 0 to 4`,()=>{
    for(let n=0;n<=4;n++)for(let i=0;i<6000;i++){const p=point(),c=cellOf(p,n);if(c==='edge')continue;
      const inside=sdf(p,n)<0;assert.equal(inside,c!==null&&kept(...c),`${name} stage ${n} at ${p}`);}
  });

// barycentric coordinates in the tetrahedron V (four points): all ≥ 0 inside
const bary=(p,V)=>{const [a,b,c,d]=V,m=[b,c,d].map(v=>v.map((x,k)=>x-a[k])),q=p.map((x,k)=>x-a[k]);
  const det=M=>M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
  const T=[0,1,2].map(r=>[m[0][r],m[1][r],m[2][r]]),D=det(T),l=[0,1,2].map(k=>det(T.map((row,r)=>row.map((x,j)=>j===k?q[r]:x)))/D);return [1-l[0]-l[1]-l[2],...l];};
test('Sierpiński tetrahedron: inside exactly the 4ⁿ small tetrahedra of stages 0 to 5',()=>{
  for(let n=0;n<=5;n++){let T=[TETRA_V];for(let k=0;k<n;k++)T=T.flatMap(V=>V.map(a=>V.map(b=>a.map((x,j)=>(x+b[j])/2))));
    for(let i=0;i<4000;i++){const p=point(),bs=T.map(V=>Math.min(...bary(p,V)));if(bs.some(b=>Math.abs(b)<1e-6))continue;
      assert.equal(tetrixSDF(p,n)<0,bs.some(b=>b>0),`stage ${n} at ${p}`);}}
});

test('the distances never overshoot: |d(p) − d(q)| ≤ |p − q| (a ray step of d(p) cannot cross the surface)',()=>{
  for(const [sdf,n] of [[mengerSDF,3],[dustSDF,3],[tetrixSDF,4],[mengerSDF,0],[tetrixSDF,0]])
    for(let i=0;i<20000;i++){const p=point(),u=point(.08),q=p.map((v,k)=>v+u[k]);
      assert.ok(Math.abs(sdf(p,n)-sdf(q,n))<=Math.hypot(...u)*(1+1e-9),`${sdf.name} stage ${n} at ${p}`);}
});

test('the bounding spheres contain the figures, and every shader defines de',()=>{
  for(let i=0;i<4000;i++){const p=point(2.2),r=Math.hypot(...p);
    if(r>BOUNDS.menger)assert.ok(mengerSDF(p,0)>0);if(r>BOUNDS.dust)assert.ok(dustSDF(p,0)>0);if(r>BOUNDS.tetrix)assert.ok(tetrixSDF(p,0)>0);}
  for(const k of Object.keys(GLSL))assert.match(GLSL[k],/float de\(vec3 p\)/);
  assert.ok(BOUNDS.box(2)>=Math.sqrt(3)*6-1e-9);   // scale 2: the box reaches 2(s+1)/(s−1) = 6 along each axis
});

test('progressive plan: half resolution while moving, then a bounded number of full samples',()=>{
  const st={samples:0,lastChange:1000,frameMs:10};
  assert.deepEqual(plan(st,1050),{scale:.5,sample:0,done:false});
  assert.deepEqual(plan(st,1200),{scale:1,sample:0,done:false});
  st.samples=16;assert.equal(plan(st,1200).done,true);
  st.samples=4;st.frameMs=80;assert.equal(plan(st,1200).done,true);   // slow device: fewer samples
});

test('jitter: no offset first, then distinct offsets inside the pixel',()=>{
  assert.deepEqual(jitter(0),[0,0]);
  const seen=new Set();for(let k=1;k<16;k++){const j=jitter(k);assert.ok(j.every(v=>v>=-.5&&v<.5));seen.add(j.join());}
  assert.equal(seen.size,15);
});
