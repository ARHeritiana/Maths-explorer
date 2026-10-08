import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {enrichment} from '../dist/js/enrichment-data.js';
import {libraryPage} from '../dist/js/resource-library.js';
import {selectChapters} from '../dist/js/library.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../dist/resources/catalog.json',import.meta.url)));
test('twelve bilingual workshops contain notes, four exercises and a solved synthesis problem',()=>{
 assert.equal(enrichment.length,12);
 for(const p of enrichment){
  for(const key of ['title','level','prerequisites','worked','activity','problem','solution'])assert.ok(p[key].length===2&&p[key].every(x=>typeof x==='string'&&x.length>5));
  assert.equal(p.lesson.length,3);assert.equal(p.exercises.length,4);
  for(const x of p.exercises)for(const key of ['q','a'])assert.ok(x[key].length===2&&x[key].every(Boolean));
  const resources=catalog.resources.filter(r=>r.chapter==='explore-'+p.id);assert.equal(resources.length,4);
  for(const r of resources){assert.equal(r.translation,'authored-bilingual');for(const url of [...r.url,...r.htmlUrl])assert.ok(fs.existsSync(new URL('../dist/'+url.slice(2),import.meta.url)));}
  for(const j of [0,1])assert.ok(libraryPage(x=>x[j]).includes('#library/explore-'+p.id));
 }
 assert.equal(selectChapters(catalog,{curriculum:'all',course:'explorations',type:'all',language:'en',search:'',solutions:false}).length,12);
});
test('counting, modular arithmetic and integer-equation answers agree with independent enumeration',()=>{
 const paths=(x,y)=>{if(x===0&&y===0)return 1;if((x===2&&y===1)||(x===3&&y===3))return 0;return (x>0?paths(x-1,y):0)+(y>0?paths(x,y-1):0);};
 assert.equal(paths(5,4),33);
 assert.deepEqual(Array.from({length:101},(_,i)=>i).filter(x=>x%3===2&&x%5===3&&x%2===0),[8,38,68,98]);
 assert.equal(Number(7n**2026n%10n),9);
 const boxes=[];for(let x=0;x<=14;x++)for(let y=0;y<=9;y++)if(7*x+11*y===100)boxes.push([x,y]);assert.deepEqual(boxes,[[8,4]]);
 const teams=[];for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)for(let c=b+1;c<8;c++)if(!([a,b,c].includes(0)&&[a,b,c].includes(1)))teams.push([a,b,c]);assert.equal(teams.length,50);
});
test('probability, sequence and root-bracketing worked answers are numerically consistent',()=>{
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10);
 const red=1/3*.75+2/3*.25;close(red,5/12);close((1/3*.75)/red,3/5);
 const rr=1/3*.75**2+2/3*.25**2;close(rr,11/48);close((1/3*.75**2)/rr,9/11);
 close(Array.from({length:10},(_,n)=>(5/6)**n).reduce((a,b)=>a+b,0),6*(1-(5/6)**10));
 const gap=n=>1/(2*(n+1))+1/(2*(n+2));assert.ok(gap(98)>.01&&gap(99)<.01);
 let a=1,b=2;const f=x=>x**3-x-1;for(let k=0;k<3;k++){const m=(a+b)/2;if(f(m)>0)b=m;else a=m;}assert.deepEqual([a,b],[1.25,1.375]);
 assert.ok(1/2**10<=.001&&1/2**9>.001);
 let z=[2,0],sum=[0,0];for(let i=0;i<4;i++){sum=sum.map((v,k)=>v+z[k]);z=[2-z[1],z[0]];}assert.deepEqual(z,[2,0]);assert.deepEqual(sum,[4,4]);
 for(let x=1;x<20;x++)assert.ok(x*(40-2*x)<=200);assert.equal(10*(40-20),200);
});
