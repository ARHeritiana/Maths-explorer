import test from 'node:test';import assert from 'node:assert/strict';
import * as M from '../site/js/illumination-model.js';import {PRESETS,TOKARSKY,WOLECKI,PENROSE} from '../site/js/illumination-presets.js';
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('reflection preserves speed, reverses normal and preserves tangent component',()=>{
 for(let i=0;i<100;i++){const d=[Math.cos(i*.31),Math.sin(i*.31)],n=[Math.cos(i*.17),Math.sin(i*.17)],r=M.reflect(d,n),t=[-n[1],n[0]];near(M.norm(r),1);near(M.dot(r,n),-M.dot(d,n));near(M.dot(r,t),M.dot(d,t));}
});
test('line, ellipse and Bezier intersections use exact geometric normals',()=>{
 const a=M.intersections([0,0],[1,0],M.line([3,-2],[3,2]))[0];near(a.t,3);near(a.u,.5);
 const e=M.intersections([0,0],[1,0],M.arc([0,0],3,2,-Math.PI/2,Math.PI))[0];near(e.t,3);
 const b=M.intersections([0,0],[0,1],M.bezier([-2,2],[0,4],[2,2]))[0];near(b.t,3);near(b.u,.5);near(Math.abs(b.normal[1]),1);
 const f=Math.sqrt(25-9),q=[3,-1-3*Math.sqrt(1-9/25)],d=M.unit([q[0]+f,q[1]+1]),r=M.reflect(d,M.unit([q[0]/25,(q[1]+1)/9]));near(M.dot(r,M.unit([f-q[0],-1-q[1]])),1);
});
test('polygon validation rejects open, degenerate, overlapping and crossed boundaries',()=>{
 assert.equal(M.validate(PRESETS.polygon.edges).ok,true);assert.equal(M.validate(PENROSE).ok,true);
 assert.equal(M.validate(M.polygonEdges([[0,0],[1,1],[0,1],[1,0]])).ok,false);
 assert.equal(M.validate([M.line([0,0],[1,0]),M.line([2,0],[0,1]),M.line([0,1],[0,0])]).ok,false);
});
test('corner rays stop and specular rectangular trajectories agree with unfolded straight lines',()=>{
 const es=M.polygonEdges([[-1,-1],[1,-1],[1,1],[-1,1]]);assert.equal(M.trace(es,[0,0],[1,1],10).reason,'corner');
 const p=M.trace(es,[0,0],[1,.231],15),u=M.unfold(es,p);for(const q of u.points)near(q[1],.231*q[0],1e-7);
 assert.ok(p.points.every(p=>p.every(Number.isFinite)));assert.equal(p.reason,'limit');
 assert.equal(M.trace(es,[0,0],[1,.231],0).hits.length,0);
 // An artificial split on a smooth wall must not absorb a ray as if it were a corner.
 const split=M.polygonEdges([[-1,-1],[1,-1],[1,0],[1,1],[-1,1]]);
 assert.equal(M.trace(split,[0,0],[1,0],1).reason,'limit');
});
test('verified room side counts, source/target interiors and finite ray segments',()=>{
 assert.equal(TOKARSKY.length,26);assert.equal(WOLECKI.length,22);
 for(const id of ['penrose','tokarsky','wolecki']){const p=PRESETS[id],poly=M.flatten(p.edges);assert.ok(M.inside(p.source,poly),id);if(p.target)assert.ok(M.inside(p.target,poly),id);
  for(let i=0;i<32;i++){const a=i*Math.PI/16+.003,pth=M.trace(p.edges,p.source,[Math.cos(a),Math.sin(a)],30);assert.ok(pth.length>0);assert.ok(pth.points.every(p=>p.every(Number.isFinite)));}
 }
 // Wolecki's vertex contact is retained, not silently repaired into another room.
 assert.equal(WOLECKI.filter(p=>p[0]===4&&p[1]===4).length,2);
});
test('the allocation-free tracer agrees with the reference tracer: reason, hit sequence, points and length',()=>{
 // polygons: 60 bounces; the elliptical Penrose room: 8 (billiards are chaotic, so rounding differences grow with the bounces)
 for(const [name,bounces] of [['tokarsky',60],['wolecki',60],['polygon',60],['penrose',8]]){
  const p=PRESETS[name];
  for(let i=0;i<300;i++){const th=.01+i*.021,d=[Math.cos(th),Math.sin(th)],a=M.traceReference(p.edges,p.source,d,bounces),b=M.trace(p.edges,p.source,d,bounces);
   assert.equal(b.reason,a.reason,`${name} ${i}`);assert.deepEqual(b.hits,a.hits,`${name} ${i}`);assert.equal(b.points.length,a.points.length);
   a.points.forEach((q,k)=>{near(q[0],b.points[k][0],1e-7);near(q[1],b.points[k][1],1e-7);});near(a.length,b.length,1e-6);}
 }
 // a curved custom wall (Bezier) still goes through the general path
 const edges=[M.line([-4,-3],[4,-3]),M.bezier([4,-3],[6,0],[4,3]),M.line([4,3],[-4,3]),M.line([-4,3],[-4,-3])];
 for(let i=0;i<50;i++){const d=[Math.cos(i*.13),Math.sin(i*.13)],a=M.traceReference(edges,[0,0],d,20),b=M.trace(edges,[0,0],d,20);assert.equal(b.reason,a.reason);assert.deepEqual(b.hits,a.hits);}
});
