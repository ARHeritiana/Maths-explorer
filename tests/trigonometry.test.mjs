import {findings} from './banned.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {remarkableAngles,trigValues,radiansLabel,relations,model} from '../dist/js/lab/models/trig.js';
import trig from '../dist/js/lab/experiments/trig.js';
import {makeFormat} from '../dist/js/lab/engine.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('remarkable angles have exact coordinates in every quadrant, including negative and multi-turn angles',()=>{
  assert.deepEqual(trigValues(30).exact,['√3/2','1/2']);
  assert.deepEqual(trigValues(45).exact,['√2/2','√2/2']);
  assert.deepEqual(trigValues(60).exact,['1/2','√3/2']);
  assert.deepEqual(trigValues(225).exact,['−√2/2','−√2/2']);
  assert.deepEqual(trigValues(-90).exact,['0','−1']);
  assert.deepEqual(trigValues(720).exact,['1','0']);
  const evaluate=s=>({ '0':0,'1':1,'−1':-1,'1/2':.5,'−1/2':-.5,'√2/2':Math.SQRT1_2,'−√2/2':-Math.SQRT1_2,'√3/2':Math.sqrt(3)/2,'−√3/2':-Math.sqrt(3)/2 })[s];
  for(const angle of remarkableAngles){const q=trigValues(angle);assert.ok(q.exact);close(evaluate(q.exact[0]),Math.cos(angle*Math.PI/180));close(evaluate(q.exact[1]),Math.sin(angle*Math.PI/180));}
  assert.equal(radiansLabel(330),'11π/6');assert.equal(radiansLabel(-135),'−3π/4');assert.equal(radiansLabel(360),'2π');
  assert.equal(trigValues(31).exact,null);
});
test('all associated-angle identities agree with independent trigonometric calculations',()=>{
  const expected={plusPi:[q=>-q.cos,q=>-q.sin],minusPi:[q=>-q.cos,q=>-q.sin],plusHalfPi:[q=>-q.sin,q=>q.cos],minusHalfPi:[q=>q.sin,q=>-q.cos],opposite:[q=>q.cos,q=>-q.sin],supplementary:[q=>-q.cos,q=>q.sin],complementary:[q=>q.sin,q=>q.cos],fullTurn:[q=>q.cos,q=>q.sin]};
  for(const x of [-410,-90,0,30,45,60,179,225,360,721])for(const [key,r] of Object.entries(relations)){const q=trigValues(x),v=trigValues(r.transform(x));close(v.cos,expected[key][0](q));close(v.sin,expected[key][1](q));}
});
test('the circle point, the curve point and the associated point share the same angle',()=>{
  const fmt=makeFormat('fr'),ctx={fmt,lang:'fr'};
  for(const fn of ['sin','cos'])for(const assoc of ['none',...Object.keys(relations)])for(const deg of [0,30,90,150,180,270,360]){
    const s={deg,assoc,fn},rad=deg*Math.PI/180;
    const circle=trig.views.circle.scene(s,ctx),graph=trig.views.graph.scene(s,ctx);
    const P=circle.points.find(p=>p.label==='P').at;
    close(P[0],Math.cos(rad));close(P[1],Math.sin(rad));
    const G=graph.points[0].at;close(G[0],rad);close(G[1],Math[fn](rad));
    // the link is horizontal: it leaves the circle at the height of the plotted value (P for the sine; for the cosine, the point
    // (0 ; cos x) where the quarter turn lays the x-coordinate of P) and reaches the curve point
    const link=trig.views.links(s)[0];close(link.from.at[1],link.to.at[1]);close(link.to.at[1],G[1]);
    if(fn==='sin'){close(link.from.at[0],P[0]);}else{close(link.from.at[0],0);const arc=circle.polys[0].pts;close(arc[0][0],P[0]);close(arc.at(-1)[1],P[0]);}
    const Q=circle.points.find(p=>p.label==='Q');
    assert.equal(!!Q,assoc!=='none');
    if(Q){const a=relations[assoc].transform(deg)*Math.PI/180;close(Q.at[0],Math.cos(a));close(Q.at[1],Math.sin(a));}
    for(const lang of ['fr','en']){const c={fmt:makeFormat(lang),lang};assert.ok(!/NaN|undefined|Infinity/.test(trig.views.formula(s,c)));}
  }
  assert.match(trig.views.formula({deg:30,assoc:'minusHalfPi',fn:'sin'},ctx),/sin x/);
  assert.match(trig.views.formula({deg:30,assoc:'supplementary',fn:'sin'},ctx),/Q = P\(π − x\) = \(−cos x ; sin x\)/);
});
test('no client catalogue or rendered chapter exposes personal-space URLs',()=>{
  for(const file of ['dist/js/resource-library.js','dist/js/library.js','dist/js/resources-data.js','dist/resources/catalog.json'])assert.deepEqual(findings(fs.readFileSync(file,'utf8')),[],file);
});
test('associated points and plotted values agree, including exact negative quarter-turn values',()=>{
  for(const relation of Object.keys(relations))for(const x of [0,30,90,180,270,360]){
    const a=relations[relation].transform(x),m=model({deg:x,assoc:relation});
    close(m.q.sin,Math.sin(a*Math.PI/180));close(m.q.cos,Math.cos(a*Math.PI/180));
    assert.equal(m.qAngle,a);
  }
  const m=model({deg:30,assoc:'minusHalfPi'});
  assert.equal(relations.minusHalfPi.angle,'x − π/2');
  assert.deepEqual(m.q.exact,['1/2','−√3/2']);   // x − π/2 at x = 30°: the angle −60°
});
