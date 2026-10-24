import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../site/js/lab/models/fair-division.js';
import cake,{discreteExperiment as goods} from '../site/js/lab/experiments/fair-division.js';
import {makeFormat} from '../site/js/lab/format.js';
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
test('piecewise cake values agree with fine independent midpoint quadrature',()=>{
 for(const row of [[2,3,1],[0,6,0],[1,4,2,0],[7]])for(const [a,b] of [[0,1],[.11,.73],[.25,.5],[.9,.9]]){
  const N=24000;let area=0;for(let k=0;k<N;k++){const x=a+(b-a)*(k+.5)/N;area+=row[Math.min(row.length-1,Math.floor(x*row.length))]*(b-a)/N;}
  const total=row.reduce((a,b)=>a+b,0)/row.length;near(F.cakeValue(row,a,b),area/total,3e-5);
 }
});
test('three-person proportional counterexample is exact and envy-free implies proportional',()=>{
 const m=F.cakeAllocation([[2,3,1],[1,2,3],[3,1,2]],[1/3,2/3]);
 m.own.forEach(x=>near(x,1/3));assert.equal(m.allProportional,true);assert.equal(m.envyFree,false);near(m.maxEnvy,1/6);
 for(let x=0;x<=12;x++)for(let y=x;y<=12;y++){
  const r=F.cakeAllocation([[1,2,3],[3,0,1],[1,1,4]],[x/12,y/12]);
  r.matrix.forEach(row=>near(row.reduce((a,b)=>a+b,0),1));if(r.envyFree)assert.equal(r.allProportional,true);
 }
});
test('cut and choose is envy-free even with zero densities and opposing preferences',()=>{
 const rows=[];for(let a=0;a<=3;a++)for(let b=0;b<=3;b++)for(let c=0;c<=3;c++)if(a+b+c)rows.push([a,b,c]);
 for(const a of rows)for(const b of rows){const r=F.cutAndChoose([a,b]);near(r.own[0],.5);assert.ok(r.own[1]>=.5-1e-12);assert.equal(r.envyFree,true);}
});
test('discrete fairness and EF1 agree with direct subset comparisons for every assignment',()=>{
 for(const values of [[[3,2,1],[1,2,3]],[[1,0,0],[1,0,0]],[[1,1,1],[1,1,1]]])for(let mask=0;mask<8;mask++){
  const owners=[0,1,2].map(j=>(mask>>j)&1),r=F.goodsAllocation(values,owners);
  let ef=true,prop=true,ef1=true;
  for(let i=0;i<2;i++){
   const own=values[i].filter((v,j)=>owners[j]===i).reduce((a,b)=>a+b,0),other=values[i].filter((v,j)=>owners[j]!==i);
   const otherValue=other.reduce((a,b)=>a+b,0);ef&&=own>=otherValue;prop&&=own*2>=values[i].reduce((a,b)=>a+b,0);
   ef1&&=own>=otherValue||other.some(v=>own>=otherValue-v);
  }
  assert.equal(r.envyFree,ef);assert.equal(r.allProportional,prop);assert.equal(r.ef1,ef1);
 }
 for(const owner of [0,1]){const r=F.goodsAllocation([[1],[1]],[owner]);assert.equal(r.envyFree,false);assert.equal(r.allProportional,false);assert.equal(r.ef1,true);}
});
test('sincere round robin always yields EF1 over exhaustive small additive profiles',()=>{
 const rows=[];for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)if(a+b+c)rows.push([a,b,c]);
 for(const a of rows)for(const b of rows){const owners=F.roundRobin([a,b]);assert.equal(F.goodsAllocation([a,b],owners).ef1,true);}
});
test('invalid valuations and incomplete assignments fail explicitly',()=>{
 assert.throws(()=>F.cakeAllocation([[0,0],[1,1]],[.5]));assert.throws(()=>F.goodsAllocation([[1],[1]],[-1]));
 assert.throws(()=>F.cakeAllocation([[1],[1],[1]],[.8,.2]));assert.throws(()=>F.cakeValue([1],-.1,.5));
});
test('every mission is finite in both languages and direct manipulation changes one intended quantity',()=>{
 for(const e of [cake,goods])for(const mission of e.missions){const s={...e.state,...mission.set};
  for(const language of ['fr','en']){const ctx={fmt:makeFormat(language),unlocked:()=>true};assert.ok(!/NaN|undefined/.test(e.views.formula(s,ctx)));assert.ok(e.views.figure.scene(s,ctx));assert.ok(e.views.readout(s,ctx).length);}
 }
 const changed=cake.controls.density.drag(cake.state,6,4);assert.equal(changed.values[0][1],4);assert.equal(cake.state.values[0][1],1);
 const patch=goods.controls.good0.drag(goods.state,2,6);assert.deepEqual(patch.owners,[1,0,1]);
 const value=goods.controls.value.nudge(goods.state,0,1);assert.equal(value.values[0][0],4);
});
