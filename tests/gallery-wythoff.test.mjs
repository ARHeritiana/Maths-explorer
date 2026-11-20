// The Wythoff triangle (issue #35): group orders, the 7 uniform points of each family against the published counts and
// face types (MathWorld), every edge equal there and equal to twice the distance of the point to a mirror, the two snubs
// (the snub cube against its published tribonacci coordinates), the snub of the tetrahedron is the icosahedron, duals
// (V and F swapped, edges kept, Catalan faces congruent, a dual vertex on the line of its face), Euler everywhere in the
// triangle, and the classification of prisms, antiprisms, Johnson and Kepler-Poinsot solids.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as W from '../site/js/gallery/gallery-wythoff-model.js';
import {stellation} from '../site/js/gallery/gallery-stellation-model.js';

const PUBLISHED={   // [V, E, F, signature] at the 7 stops [100,010,001,110,011,101,111]
  O:[[6,12,8,'3:8'],[8,12,6,'4:6'],[12,24,14,'3:8,4:6'],[24,48,26,'3:8,4:18'],[24,36,14,'3:8,8:6'],[24,36,14,'4:6,6:8'],[48,72,26,'4:12,6:8,8:6']],
  I:[[12,30,20,'3:20'],[20,30,12,'5:12'],[30,60,32,'3:20,5:12'],[60,120,62,'3:20,4:30,5:12'],[60,90,32,'3:20,10:12'],[60,90,32,'5:12,6:20'],[120,180,62,'4:30,6:20,10:12']],
  T:[[4,6,4,'3:4'],[4,6,4,'3:4'],[6,12,8,'3:8'],[12,24,14,'3:8,4:6'],[12,18,8,'3:4,6:4'],[12,18,8,'3:4,6:4'],[24,36,14,'4:6,6:8']],
};
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} versus ${b}`);

test('the groups: 24, 48 and 120 symmetries, half of them rotations; the mirrors fix two corners each', () => {
  for(const [id,n] of [['T',24],['O',48],['I',120]]){const F=W.family(id);assert.equal(F.group.length,n);assert.equal(F.rotations.length,n/2);
    F.mirrors.forEach((m,i)=>F.corners.forEach((c,j)=>{if(i!==j)near(W.dot(m,c),0,1e-12);else assert.ok(W.dot(m,c)>0);}));}
});

test('the seven uniform points of each family against the published solids, every edge twice a distance', () => {
  for(const [id,rows] of Object.entries(PUBLISHED))W.STOPS.forEach((d,k)=>{const S=W.wythoff(id,d),[V,E,F,sig]=rows[k];
    assert.deepEqual([S.V,S.E,S.F,W.signature(S)],[V,E,F,sig],`${id} ${d}`);assert.ok(W.uniformEdges(S));
    // an edge joins the point to its mirror image: length 2 × (distance to that mirror), measured on the actual point
    const Fm=W.family(id),p=W.wythoffPoint(Fm,d),L=W.edgeLengths(S)[0],r=W.norm(S.verts[0])/W.norm(p);
    const ds=Fm.mirrors.map(m=>W.dot(m,p)).filter(x=>x>1e-12);for(const x of ds)near(L,2*x*r,1e-9);
    assert.equal(S.V-S.E+S.F,2);assert.ok(W.isConvex(S));});
});

test('snubs: the snub cube matches its tribonacci coordinates, the snub dodecahedron its counts, the snub tetrahedron is the icosahedron', () => {
  const sc=W.wythoff('O',W.snubPoint('O'),true);assert.deepEqual([sc.V,sc.E,sc.F,W.signature(sc)],[24,60,38,'3:32,4:6']);assert.ok(W.uniformEdges(sc,1e-7));
  // published vertices: even permutations of (±1, ±1/τ, ±τ) with an even number of minus signs, odd ones with an odd number
  const tau=(1+Math.cbrt(19+3*Math.sqrt(33))+Math.cbrt(19-3*Math.sqrt(33)))/3,pub=[];
  const perms=[[0,1,2,1],[1,2,0,1],[2,0,1,1],[1,0,2,-1],[0,2,1,-1],[2,1,0,-1]];
  for(const [a,b,c,par] of perms)for(let m=0;m<8;m++){const s=[m&1?-1:1,m&2?-1:1,m&4?-1:1],neg=s.filter(x=>x<0).length%2;if((neg===0)!==(par===1))continue;const v=[1,1/tau,tau];pub.push([v[a]*s[0],v[b]*s[1],v[c]*s[2]]);}
  // compare up to scale and chirality (the mirror image is the other snub cube): sorted pair distances
  const prof=P=>{const r=W.norm(P[0]);const ds=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)ds.push(W.norm(W.sub(P[i],P[j]))/r);return ds.sort((a,b)=>a-b);};
  const a=prof(sc.verts),b=prof(pub);assert.equal(a.length,b.length);a.forEach((x,i)=>near(x,b[i],1e-6));
  near(W.snubPoint('O')[0],tau,1e-6);   // the ratio of the distances found by the search is the tribonacci constant
  const sd=W.wythoff('I',W.snubPoint('I'),true);assert.deepEqual([sd.V,sd.E,sd.F,W.signature(sd)],[60,150,92,'3:80,5:12']);assert.ok(W.uniformEdges(sd,1e-7));
  const st=W.wythoff('T',W.snubPoint('T'),true);assert.deepEqual([st.V,st.E,st.F,W.signature(st)],[12,30,20,'3:20']);assert.ok(W.uniformEdges(st,1e-7));
});

test('duals: V and F swap, E stays, Catalan faces congruent, each dual vertex on the line through its face', () => {
  for(const [id,d,tw] of [['O',[0,0,1]],['O',[1,1,0]],['I',[1,0,1]],['I',[1,1,1]],['O',W.snubPoint('O'),true]]){
    const S=W.wythoff(id,d,!!tw),D=W.dual(S);assert.deepEqual([D.V,D.E,D.F],[S.F,S.E,S.V]);assert.equal(D.V-D.E+D.F,2);
    const c=W.classify(D);assert.equal(c.kind,'catalan');assert.ok(c.oneFace&&!c.regular&&c.convex);
    S.faces.forEach((f,i)=>near(W.norm(W.cross(f.normal,D.verts[i])),0,1e-9));}
  const cube=W.dual(W.wythoff('O',[1,0,0]));assert.equal(W.signature(cube),'4:6');
});

test('Euler and convexity everywhere in the triangle; non-uniform points have unequal edges', () => {
  let seed=3;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(const id of ['T','O','I'])for(let k=0;k<12;k++){const d=[rnd(),rnd(),rnd()],S=W.wythoff(id,d);assert.equal(S.V-S.E+S.F,2);assert.ok(W.isConvex(S));assert.ok(!W.uniformEdges(S,1e-3));}
});

test('classification by computed properties', () => {
  assert.equal(W.classify(W.wythoff('O',[0,1,0])).kind,'platonic');assert.equal(W.classify(W.wythoff('I',[1,1,0])).kind,'archimedean');
  for(const n of [3,5,6,8])assert.equal(W.classify(W.prism(n)).kind,n===4?'platonic':'prism');
  for(const n of [4,5,6])assert.equal(W.classify(W.antiprism(n)).kind,'prism');assert.equal(W.classify(W.antiprism(3)).kind,'platonic');   // the triangular antiprism is the octahedron
  for(const S of [W.pyramid(4),W.pyramid(5),W.bipyramid()]){const c=W.classify(S);assert.equal(c.kind,'johnson');assert.ok(c.regular&&!c.sameVertices&&W.uniformEdges(S));}
  for(const id of ['small-stellated','great-dodecahedron','great-stellated','great-icosahedron']){const T=stellation(id),c=W.classify({...T,faces:T.faces.map(f=>({...f,d:1}))});assert.ok(!c.convex&&c.regular,id);}
  assert.equal(W.vertexConfig(W.wythoff('O',[1,1,0]),0),'3.4.4.4');assert.equal(W.vertexConfig(W.wythoff('I',[1,1,1]),0),'4.6.10');
});
