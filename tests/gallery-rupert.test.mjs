// Prince Rupert's problem (issue #27): the solids (vertex, edge and face counts, convexity, equal edges), the shadow and
// the linear programme for the largest scale that passes, checked against an independent method (half-plane clipping of
// the translation region with bisection on s, using every supporting line through two projected vertices, no hull), every
// stored witness passes with s > 1, the cube's comes within 1e-4 of Nieuwland's 3√2/4 without exceeding it, and the
// passage drawn at scale 1 (translation t/s) really lies inside the outer shadow.
import test from 'node:test';
import assert from 'node:assert/strict';
import {solid,rotation,apply,shadow,bestScale,scaleFor,WITNESSES,NIEUWLAND,SHAPES} from '../site/js/gallery/gallery-rupert-model.js';

const COUNTS={tetrahedron:[4,6,4],cube:[8,12,6],octahedron:[6,12,8],dodecahedron:[20,30,12],icosahedron:[12,30,20],rhombicosidodecahedron:[60,120,62]};
const proj=(S,a)=>{const R=rotation(a);return S.verts.map(v=>apply(R,v).slice(0,2));};

function independentScale(S,outer,inner){
  const Q=proj(S,outer),P=proj(S,inner),lines=[];
  for(let i=0;i<Q.length;i++)for(let j=0;j<Q.length;j++)if(i!==j){const n=[Q[j][1]-Q[i][1],Q[i][0]-Q[j][0]],l=Math.hypot(...n);if(l<1e-9)continue;
    const u=[n[0]/l,n[1]/l],c=u[0]*Q[i][0]+u[1]*Q[i][1];if(Q.every(q=>u[0]*q[0]+u[1]*q[1]<=c+1e-9))lines.push({u,c});}
  const feasible=s=>{let poly=[[-9,-9],[9,-9],[9,9],[-9,9]];
    for(const {u,c} of lines){const k=c-s*Math.max(...P.map(p=>u[0]*p[0]+u[1]*p[1])),out=[];
      for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=u[0]*a[0]+u[1]*a[1]-k,fb=u[0]*b[0]+u[1]*b[1]-k;
        if(fa<=0)out.push(a);if(fa*fb<0){const r=fa/(fa-fb);out.push([a[0]+r*(b[0]-a[0]),a[1]+r*(b[1]-a[1])]);}}
      poly=out;if(!poly.length)return false;}return true;};
  let lo=0,hi=3;for(let i=0;i<60;i++){const m=(lo+hi)/2;feasible(m)?lo=m:hi=m;}return lo;
}
const inside=(pts,Q,margin)=>pts.every(p=>Q.every((a,k)=>{const b=Q[(k+1)%Q.length];return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>margin;}));

test('the solids: counts, Euler, circumradius 1, convex, all edges equal', () => {
  for(const name of SHAPES){const S=solid(name);assert.deepEqual([S.V,S.E,S.F],COUNTS[name],name);assert.equal(S.V-S.E+S.F,2);
    for(const v of S.verts)assert.ok(Math.abs(Math.hypot(...v)-1)<1e-12);
    for(const f of S.faces){const d=f.n[0]*S.verts[f.verts[0]][0]+f.n[1]*S.verts[f.verts[0]][1]+f.n[2]*S.verts[f.verts[0]][2];
      for(const v of S.verts)assert.ok(f.n[0]*v[0]+f.n[1]*v[1]+f.n[2]*v[2]<=d+1e-9);}
    const L=S.edges.map(([a,b])=>Math.hypot(...[0,1,2].map(k=>S.verts[a][k]-S.verts[b][k])));assert.ok(Math.max(...L)-Math.min(...L)<1e-9,name);}
  const faces=solid('rhombicosidodecahedron').faces.map(f=>f.verts.length).reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{});
  assert.deepEqual(faces,{3:20,4:30,5:12});
});

test('rotations are orthogonal and the linear programme agrees with an independent method', () => {
  for(const a of [[0.3,1.1,2.2],[2,0.4,5],[0,0,0]]){const R=rotation(a);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const d=R[i][0]*R[j][0]+R[i][1]*R[j][1]+R[i][2]*R[j][2];assert.ok(Math.abs(d-(i===j))<1e-12);}}
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*6.3;};
  for(const name of SHAPES.slice(0,5))for(let k=0;k<6;k++){const S=solid(name),o=[0,rnd(),rnd()],i=[rnd(),rnd(),rnd()];
    assert.ok(Math.abs(scaleFor(S,o,i).s-independentScale(S,o,i))<1e-6,name);}
  // the same position always gives exactly 1 (a solid fits its own shadow, with no room)
  for(const name of SHAPES){const S=solid(name),a=[0,0.7,1.3];assert.ok(Math.abs(scaleFor(S,a,a).s-1)<1e-9,name);}
});

test('every stored witness passes with room, by both methods; the cube comes within 1e-4 of 3√2/4', () => {
  for(const [name,w] of Object.entries(WITNESSES)){const S=solid(name),r=scaleFor(S,w.outer,w.inner);
    assert.ok(r.s>1.0005,`${name} ${r.s}`);assert.ok(Math.abs(r.s-independentScale(S,w.outer,w.inner))<1e-6);
    const Q=shadow(S,w.outer),P=shadow(S,w.inner);
    // the scaled copy at t, and the copy of scale 1 at t/s (drawn as the tunnel), are both strictly inside
    assert.ok(inside(P.map(p=>[r.s*0.9999*p[0]+r.t[0],r.s*0.9999*p[1]+r.t[1]]),Q,0),name);
    assert.ok(inside(P.map(p=>[p[0]+r.t[0]/r.s,p[1]+r.t[1]/r.s]),Q,1e-6),name);}
  const c=scaleFor(solid('cube'),WITNESSES.cube.outer,WITNESSES.cube.inner).s;
  assert.ok(c<=NIEUWLAND+1e-9&&NIEUWLAND-c<1e-4,String(c));assert.ok(Math.abs(NIEUWLAND-1.0606601717798212)<1e-15);
});

test('bestScale on squares: a unit square fits a square of side 2 at scale 2, and a square turned by 45° in a unit square at 1/√2', () => {
  const sq=(h,a=0)=>[[-h,-h],[h,-h],[h,h],[-h,h]].map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]);
  assert.ok(Math.abs(bestScale(sq(0.5),sq(1)).s-2)<1e-12);assert.ok(Math.abs(bestScale(sq(0.5,Math.PI/4),sq(0.5)).s-Math.SQRT1_2)<1e-12);
});
