import test from 'node:test';
import assert from 'node:assert/strict';
import {PHASES,emptySeance,defaultSeance,addBlock,removeBlock,moveBlock,moveBlockTo,setMinutes,togglePrint,totals,cleanSeance,MAX_BLOCKS} from '../site/js/seance-model.js';
const blk=(id,o={})=>({id,phase:'cours',title:'T'+id,href:'#chapter/x',minutes:10,print:false,...o});
test('phases in session order with default minutes and [fr,en] labels',()=>{
 assert.deepEqual(PHASES.map(p=>p.id),['automatismes','correction','activite','cours','exercices','outils','bilan']);
 assert.deepEqual(PHASES.map(p=>p.minutes),[5,8,12,15,15,0,5]);
 for(const p of PHASES){assert.equal(p.label.length,2);assert.ok(!/[–—]/.test(p.label.join('')));}
});
test('defaultSeance uses the resolver and skips phases it cannot resolve',()=>{
 const calls=[];
 const s=defaultSeance({course:'seconde',chapter:'seconde-01'},(ph,ctx)=>{calls.push([ph,ctx.chapter]);return ph==='outils'?null:ph==='cours'?{href:'#chapter/seconde-01',title:'Le cours',resourceId:'r1'}:'#x/'+ph;});
 assert.equal(calls.length,7);assert.deepEqual(s.blocks.map(b=>b.phase),['automatismes','correction','activite','cours','exercices','bilan']);
 assert.equal(s.blocks[3].title,'Le cours');assert.equal(s.blocks[3].resourceId,'r1');assert.equal(s.blocks[0].minutes,5);
 assert.equal(new Set(s.blocks.map(b=>b.id)).size,6);
 assert.deepEqual(defaultSeance({}),{blocks:[]});
 assert.deepEqual(defaultSeance({},()=>'javascript:x').blocks,[]);
});
test('add, remove, move, minutes, print are immutable',()=>{
 const e=emptySeance(),a=addBlock(e,{phase:'cours',title:'A',href:'#a'});
 assert.deepEqual(e,{blocks:[]});assert.equal(a.blocks[0].minutes,15);assert.equal(a.blocks[0].print,false);
 const b=addBlock(a,{phase:'cours',title:'B',href:'#b'}),c=addBlock(b,{phase:'bilan',title:'C',href:'#c'});
 assert.equal(new Set(c.blocks.map(x=>x.id)).size,3);assert.equal(a.blocks.length,1);
 assert.equal(addBlock(c,{phase:'zzz',title:'x',href:'#x'}).blocks.length,3);
 assert.equal(addBlock(c,{phase:'cours',title:'x',href:'javascript:1'}).blocks.length,3);
 const [i0,i1,i2]=c.blocks.map(x=>x.id);
 assert.deepEqual(moveBlock(c,0,1).blocks.map(x=>x.id),[i1,i0,i2]);
 assert.deepEqual(moveBlock(c,2,-2).blocks.map(x=>x.id),[i2,i0,i1]);
 assert.deepEqual(moveBlock(c,0,-1),c);assert.deepEqual(moveBlock(c,9,1),c);assert.deepEqual(moveBlock(c,0,5).blocks.map(x=>x.id),[i1,i2,i0]);
 assert.deepEqual(removeBlock(c,i1).blocks.map(x=>x.id),[i0,i2]);assert.equal(c.blocks.length,3);
 assert.equal(setMinutes(c,i0,500).blocks[0].minutes,90);assert.equal(setMinutes(c,i0,-3).blocks[0].minutes,0);
 assert.equal(setMinutes(c,i0,NaN).blocks[0].minutes,0);assert.equal(c.blocks[0].minutes,15);
 assert.equal(togglePrint(c,i0).blocks[0].print,true);assert.equal(togglePrint(togglePrint(c,i0),i0).blocks[0].print,false);
});
test('totals: minutes against target, print warning above 3',()=>{
 let s={blocks:[blk('a',{minutes:30}),blk('b',{minutes:25})]};
 assert.deepEqual(totals(s),{minutes:55,over:false,printCount:0,printWarning:false});
 s=setMinutes(s,'b',26);assert.equal(totals(s).over,true);assert.equal(totals(s,{target:60}).over,false);
 s={blocks:['a','b','c','d'].map(i=>blk(i,{print:true}))};
 assert.equal(totals(s).printCount,4);assert.equal(totals(s).printWarning,true);
 assert.equal(totals({blocks:s.blocks.slice(0,3)}).printWarning,false);
 assert.deepEqual(totals(null),{minutes:0,over:false,printCount:0,printWarning:false});
});
test('cleanSeance rejects malformed input and caps blocks',()=>{
 for(const bad of [null,undefined,'x',42,[],{},{blocks:'no'}])assert.deepEqual(cleanSeance(bad),{blocks:[]});
 const s=cleanSeance({blocks:[blk('a'),null,'x',blk('a'),blk('b',{href:'javascript:alert(1)'}),blk('c',{phase:'x'}),blk('d',{title:''}),blk('e',{minutes:999,print:'yes',resourceId:5}),blk('f',{href:'//evil.test'})]});
 assert.deepEqual(s.blocks.map(b=>b.id),['a','e']);assert.equal(s.blocks[1].minutes,90);assert.equal(s.blocks[1].print,false);assert.ok(!('resourceId' in s.blocks[1]));
 const many=cleanSeance({blocks:Array.from({length:50},(_,i)=>blk('i'+i))});assert.equal(many.blocks.length,MAX_BLOCKS);
 assert.equal(addBlock(many,{phase:'cours',title:'x',href:'#x'}).blocks.length,MAX_BLOCKS);
 assert.deepEqual(cleanSeance(JSON.parse('{"blocks":[{"id":"a","phase":"cours","title":"t","href":"#h","__proto__":{"x":1}}]}')).blocks[0],{id:'a',phase:'cours',title:'t',href:'#h',minutes:0,print:false});
});
test('moveBlockTo: any position, clamped, no-ops return the same content, immutable',()=>{
 const s={blocks:['a','b','c','d'].map(i=>blk(i))},ids=x=>x.blocks.map(b=>b.id).join('');
 assert.equal(ids(moveBlockTo(s,2,0)),'cabd');assert.equal(ids(moveBlockTo(s,0,3)),'bcda');assert.equal(ids(moveBlockTo(s,1,2)),'acbd');
 assert.equal(ids(moveBlockTo(s,3,-5)),'dabc');assert.equal(ids(moveBlockTo(s,0,99)),'bcda');
 assert.deepEqual(moveBlockTo(s,1,1),s);assert.deepEqual(moveBlockTo(s,9,0),s);assert.deepEqual(moveBlockTo(s,-1,0),s);
 assert.deepEqual(moveBlockTo(s,0,1.5),s);assert.deepEqual(moveBlockTo({blocks:[]},0,1),{blocks:[]});assert.equal(ids(s),'abcd');
 assert.equal(ids(moveBlock(s,3,-1)),'abdc');
});
