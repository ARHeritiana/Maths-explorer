import test from 'node:test';
import assert from 'node:assert/strict';
import {pageOfTheDay,randomPage,teaser,candidates,buildPools,liveCollections,KINDS,TEASER_MAX} from '../dist/js/relax-model.js';
import {BIOGRAPHIES,STORIES} from '../dist/js/reading-content.js';
import {STRATEGIES} from '../dist/js/olympiad-content.js';
import {labs} from '../dist/js/content.js';
import {isLiveHash,FULL_EDITION} from '../dist/js/live-curriculum.js';

const POOLS=buildPools({BIOGRAPHIES,STORIES,labs,STRATEGIES});
const ALL=()=>true;
const day=n=>new Date(2026,10,1+n);
const key=l=>l.map(x=>x.hash+'|'+x.id).join(',');

test('same day, same picks; one per kind; changes across days',()=>{
 const a=pageOfTheDay(day(0),POOLS,{live:ALL}),b=pageOfTheDay(new Date(2026,10,1,23,59),POOLS,{live:ALL});
 assert.deepEqual(a,b);
 assert.deepEqual(a.map(x=>x.kind),KINDS);
 for(const k of KINDS){const seen=new Set();for(let i=0;i<40;i++)seen.add(pageOfTheDay(day(i),POOLS,{live:ALL}).find(x=>x.kind===k).id);assert.ok(seen.size>1,k+' changes');}
 assert.notEqual(key(pageOfTheDay(day(0),POOLS,{live:ALL})),key(pageOfTheDay(day(1),POOLS,{live:ALL})));
});

test('every pick is live, titled, with a bounded non-empty teaser and a kind label',()=>{
 for(const live of [ALL,isLiveHash])for(let i=0;i<60;i++){
  const picks=[...pageOfTheDay(day(i),POOLS,{live}),randomPage(POOLS,()=>Math.random(),{live})];
  for(const p of picks){
   assert.ok(live(p.hash),p.hash);
   for(const f of ['title','teaser','kindLabel','action'])assert.ok(p[f][0].trim()&&p[f][1].trim(),f+' '+p.hash);
   for(const x of p.teaser)assert.ok(x.length<=TEASER_MAX,x);
  }
 }
 // limited edition: Olympiad is not published, so it is never picked there; the full edition publishes it
 const olympiad=pageOfTheDay(day(0),POOLS,{live:isLiveHash}).some(p=>p.kind==='olympiad');
 assert.equal(olympiad,FULL_EDITION);
 assert.ok(pageOfTheDay(day(0),POOLS,{live:ALL}).some(p=>p.kind==='olympiad'&&p.problem.q&&p.strategy!==undefined));
});

test('every candidate of the real data has a title and a teaser in both languages',()=>{
 for(const k of KINDS)for(const c of candidates(k,POOLS,ALL)){assert.ok(c.teaser[0]&&c.teaser[1],c.hash);}
 assert.ok(candidates('biography',POOLS,ALL).length>=10);
});

test('teaser: first sentence, trimmed to 200, meaning untouched',()=>{
 assert.equal(teaser('Une phrase. Deuxième phrase.'),'Une phrase.');
 assert.equal(teaser('  Un   texte sans point  '),'Un texte sans point');
 const long='mot '.repeat(100),t=teaser(long);
 assert.ok(t.length<=TEASER_MAX&&t.endsWith('…'));assert.ok(long.startsWith(t.slice(0,-1)));
 assert.equal(teaser(''),'');assert.equal(teaser(null),'');
});

test('empty and partial pools are handled',()=>{
 assert.deepEqual(pageOfTheDay(day(0),{},{live:ALL}),[]);
 assert.deepEqual(pageOfTheDay(day(0),undefined,{live:ALL}),[]);
 assert.equal(randomPage({},()=>0.5,{live:ALL}),null);
 const one=pageOfTheDay(day(0),{stories:[{id:'s',title:['T','T'],dek:['A. B.','C. D.']}]},{live:ALL});
 assert.equal(one.length,1);assert.deepEqual(one[0].teaser,['A.','C.']);
 assert.deepEqual(pageOfTheDay(day(0),{stories:[{id:'s',title:['','T'],dek:['A','B']}]},{live:ALL}),[],'untitled items are skipped');
 assert.deepEqual(pageOfTheDay(day(0),POOLS,{live:()=>false}),[],'nothing live, nothing picked');
});

test('random draw uses the injected rng',()=>{
 const first=randomPage(POOLS,()=>0,{live:ALL}),last=randomPage(POOLS,()=>0.999999,{live:ALL});
 assert.equal(first.kind,'biography');assert.equal(last.kind,'experiment');
 assert.deepEqual(randomPage(POOLS,()=>0.37,{live:ALL}),randomPage(POOLS,()=>0.37,{live:ALL}));
 const kinds=new Set();for(let i=0;i<50;i++)kinds.add(randomPage(POOLS,()=>i/50,{live:ALL}).kind);
 assert.equal(kinds.size,5);
});

test('collections keep only live routes',()=>{
 const l=liveCollections(isLiveHash).map(c=>c[0]);
 assert.ok(l.includes('#biographies')&&l.includes('#lab')&&l.includes('#errors'));
 assert.ok(l.every(isLiveHash));
});
