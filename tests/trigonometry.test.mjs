import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {remarkableAngles,trigValues,radiansLabel,relations,trigControls,trigDiagram,graphValues} from '../dist/js/trigonometry.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
const t=p=>p[0],fmt=n=>n.toFixed(3),handle=(x,y)=>`<g data-handle="angle" data-x="${x}" data-y="${y}"></g>`;
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
test('each view exposes only its own controls and circle/curve coordinates share the same angle',()=>{
  for(const language of [0,1])for(const view of ['angles','identities','graphs']){
    const tt=p=>p[language],s={values:[30],trigView:view,trigFunction:'sin',trigRelation:'minusHalfPi'};
    const controls=trigControls(s,tt),d=trigDiagram(30,s,tt,fmt,handle);
    assert.ok(!/undefined|NaN|Infinity/.test(d.svg+controls));assert.ok(d.svg.includes('>cos<')&&d.svg.includes('>sin<'));
    assert.equal(controls.includes('id="remarkable-angle"'),view==='angles');assert.equal(controls.includes('id="trig-relation"'),view==='identities');assert.equal(controls.includes('id="trig-play"'),view==='graphs');
    close(d.q.sin,.5);close(d.q.cos,Math.sqrt(3)/2);
    if(view==='graphs')assert.ok(d.svg.includes('cx="415" cy="113.5"'));
    if(view==='identities')assert.match(d.formula,/sin\(x − π\/2\) = −cos x/);
  }
});
test('no client catalogue or rendered chapter exposes personal-space URLs',()=>{
  const banned=/(?:drive|docs)\.google\.com|dropbox\.com|onedrive|sharepoint/i;
  for(const file of ['dist/js/resource-library.js','dist/js/library.js','dist/js/resources-data.js','dist/resources/catalog.json'])assert.ok(!banned.test(fs.readFileSync(file,'utf8')),file);
});
test('transformed circle and plotted values agree, including exact negative quarter-turn values',()=>{
  for(const relation of ['identity',...Object.keys(relations)])for(const x of [0,30,90,180,270,360]){
    const a=relation==='identity'?x:relations[relation].transform(x);
    const g=graphValues(x,relation);
    close(g.sin,Math.sin(a*Math.PI/180));close(g.cos,Math.cos(a*Math.PI/180));
    for(const fn of ['sin','cos','both']){
      const d=trigDiagram(x,{trigView:'graphs',trigGraphRelation:relation,trigFunction:fn},t,fmt,handle);
      assert.ok(!/NaN|undefined|Infinity/.test(d.svg));
      for(const name of ['sin','cos'])assert.equal(d.svg.includes(`data-curve="${name}"`),fn==='both'||fn===name);
      for(const m of d.svg.matchAll(/data-curve="(sin|cos)" data-angle="([^"]+)" data-value="([^"]+)"/g)){
        close(+m[2],x);close(+m[3],Math[m[1]](a*Math.PI/180));
      }
    }
  }
  const d=trigDiagram(30,{trigView:'graphs',trigGraphRelation:'minusHalfPi',trigFunction:'sin'},t,fmt,handle);
  assert.equal(d.formula,'y = sin(x − π/2)');
  assert.deepEqual(d.rows.at(-1),['y = sin(x − π/2)','−√3/2']);
});
