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
