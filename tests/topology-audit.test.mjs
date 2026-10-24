// Independent audit checks for tangent-field hypotheses and quotient-surface identifications.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../site/js/lab/models/topology.js';
import {hairyExperiment,surfacesExperiment,banachExperiment} from '../site/js/lab/experiments/topology.js';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
test('all sampled sphere vectors are tangent; proposed zeros and odd-circle comparison are correct',()=>{
 for(const axis of [[0,0,1],[1,2,3],[-2,.3,1]])for(const kind of ['projected','rotation']){
  const a=T.unit(axis);close(T.norm(T.tangentField(a,axis,kind)),0);close(T.norm(T.tangentField(a.map(x=>-x),axis,kind)),0);
  for(let i=0;i<40;i++){const p=[Math.cos(i*.37)*Math.cos(i*.13),Math.sin(i*.37)*Math.cos(i*.13),Math.sin(i*.13)],v=T.tangentField(p,axis,kind);close(p.reduce((s,x,j)=>s+x*v[j],0),0);assert.ok(v.every(Number.isFinite));}
 }
 for(let i=0;i<40;i++){const p=[Math.cos(i),Math.sin(i),0],v=T.circleField(p);close(p[0]*v[0]+p[1]*v[1],0);close(Math.hypot(...v),1);}
});
test('Mobius seam reverses transverse coordinate and normal; Klein immersion seam preserves quotient',()=>{
 for(const v of [-.6,-.2,.2,.6]){
  assert.ok(distance(T.surfacePoint('mobius',2*Math.PI,v),T.surfacePoint('mobius',0,-v))<1e-10);
  const a=T.surfaceFrame('mobius',2*Math.PI,v).normal,b=T.surfaceFrame('mobius',0,-v).normal;
  close(a.reduce((s,x,i)=>s+x*b[i],0),-1,1e-5);
 }
 for(const v of [.2,.8,1.7,3.2])assert.ok(distance(T.surfacePoint('klein',2*Math.PI,v),T.surfacePoint('klein',0,-v))<1e-10);
});
test('cutting agrees with rectangle gluing invariants at multiple triangulation resolutions',()=>{
 const expected=[['mobius','none',1,1,false],['mobius','centre',1,2,true],['mobius','thirds',2,3,false],['klein','none',1,0,false],['klein','meridian',1,2,true]];
 for(const [kind,cut,components,boundaries,orientable]of expected)for(const [n,m]of [[12,6],[24,12],[32,18]]){
  const t=T.surfaceComplex(kind,cut,n,m);assert.equal(t.euler,0);assert.equal(t.components.length,components);assert.equal(t.boundaryComponents,boundaries);assert.equal(t.components.every(x=>x.orientable),orientable);assert.equal(t.manifoldBoundary,true);
 }
});
test('finite Banach illustration cannot duplicate points and teaching claims keep assumptions explicit',()=>{
 for(let mask=0;mask<4096;mask++){const owners=Array.from({length:12},(_,i)=>(mask>>i)&1),m=banachExperiment.model.model({owners});assert.equal(m.total,12);assert.equal(m.left+m.right,12);assert.ok(!(m.left===12&&m.right===12));}
 assert.match(banachExperiment.missions.at(-1).argument[1],/cannot all have Lebesgue volume/);
 assert.match(hairyExperiment.conclusion[1],/continuous tangent/);
 assert.match(surfacesExperiment.intro[1],/crossing is never a junction/);
});
