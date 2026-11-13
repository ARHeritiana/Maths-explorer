// "Réviser" (#review): the scheduling rule, day arithmetic, daily cap, ordering, export and import, storage fallback
// (review-model.js, review-state.js), and the page under jsdom (review-page.js). Classes, chapters and objectives are
// read from the data (TEMPLATES, liveCourses): no level is named here.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import * as M from '../site/js/review-model.js';
import {createReviewState,KEY,DAMAGED} from '../site/js/review-state.js';
import {TEMPLATES,instance} from '../site/js/exercises/bank.js';
import {liveCourses,isLiveRoute} from '../site/js/live-curriculum.js';
import {mountReviewPage} from '../site/js/review-page.js';

const D0=20000,OBJ=[{id:'a1',cls:'x',chapter:'x-01'},{id:'a2',cls:'x',chapter:'x-01'},{id:'b1',cls:'x',chapter:'x-02'},{id:'c1',cls:'y',chapter:'y-01'}];
const seq=(grades,start=D0)=>{let c=M.newCard(start),d=start;const out=[];for(const g of grades){c=M.schedule(c,g,d);out.push(c);d=c.due;}return out;};
const fresh=(ids=['a1','a2','b1'],day=D0)=>M.enrol(M.emptyState(),ids,day);

test('rule: first review of each grade',()=>{
 const c=M.newCard(D0);
 assert.deepEqual(M.schedule(c,0,D0),{ivl:0,ease:230,due:D0,seen:1,correct:0,reps:0,lapses:0,last:D0,first:D0,added:D0});
 assert.deepEqual(M.schedule(c,1,D0),{ivl:1,ease:235,due:D0+1,seen:1,correct:1,reps:1,lapses:0,last:D0,first:D0,added:D0});
 assert.deepEqual(M.schedule(c,2,D0),{ivl:1,ease:250,due:D0+1,seen:1,correct:1,reps:1,lapses:0,last:D0,first:D0,added:D0});
 assert.deepEqual(M.schedule(c,3,D0),{ivl:4,ease:265,due:D0+4,seen:1,correct:1,reps:1,lapses:0,last:D0,first:D0,added:D0});
 assert.deepEqual(M.preview(c,D0),[0,1,1,4]);
});
test('rule: later reviews grow by exact integer steps, hard < good < easy',()=>{
 assert.deepEqual(seq([2,2,2,2,2,2]).map(c=>c.ivl),[1,3,8,20,50,125]);
 assert.deepEqual(seq([3,3,3,3]).map(c=>[c.ivl,c.ease]),[[4,265],[15,280],[58,295],[226,300]]);
 assert.deepEqual(seq([1,1,1,1,1]).map(c=>[c.ivl,c.ease]),[[1,235],[2,220],[3,205],[4,190],[5,175]]);
 const c=seq([2,2,2])[2];   // ivl 8, ease 250
 assert.deepEqual(M.preview(c,c.due),[0,10,20,28]);   // easy: round(8 × 265 × 1,3 / 100) = round(27,56) = 28
 for(const start of seq([2,3,1,2,3,2,2])){const p=M.preview(start,start.due);if(start.reps>0&&p[3]<M.MAX_IVL)assert.ok(p[0]===0&&p[1]<p[2]&&p[2]<p[3],JSON.stringify(p));}
});
test('rule: a miss resets the run, counts a lapse only after a success, and bounds hold',()=>{
 const [a,b,c,d]=seq([2,2,0,2]);
 assert.equal(c.ivl,0);assert.equal(c.due,c.last);assert.equal(c.reps,0);assert.equal(c.lapses,1);assert.equal(c.ease,230);
 assert.equal(d.ivl,1);assert.equal(d.reps,1);assert.equal(d.seen,4);assert.equal(d.correct,3);
 assert.equal(seq([0,0])[1].lapses,0);
 let x=M.newCard(D0);for(let i=0;i<30;i++)x=M.schedule(x,0,D0);assert.equal(x.ease,M.MIN_EASE);
 let y=M.newCard(D0),day=D0;for(let i=0;i<30;i++){y=M.schedule(y,3,day);day=y.due;assert.ok(Number.isInteger(y.ivl)&&y.ivl<=M.MAX_IVL);}
 assert.equal(y.ease,M.MAX_EASE);assert.equal(y.ivl,M.MAX_IVL);
 for(const k of [a,b,c,d,x,y])assert.deepEqual(M.cleanCard(k),k);
});
test('grade is immutable and ignores unknown ids and grades',()=>{
 const s=fresh(),copy=JSON.stringify(s),t=M.grade(s,'a1',2,D0);
 assert.equal(JSON.stringify(s),copy);assert.notEqual(t,s);assert.equal(t.cards.a1.seen,1);assert.equal(t.cards.a2,s.cards.a2);
 for(const [id,g,d] of [['zz',2,D0],['a1',4,D0],['a1',-1,D0],['a1',1.5,D0],['a1',2,NaN],['__proto__',2,D0],['constructor',2,D0]])assert.equal(M.grade(s,id,g,d),s);
});
test('day numbers follow the local calendar: month ends, leap day, year end, any hour',()=>{
 const n=(...a)=>M.dayNumber(new Date(...a));
 assert.equal(n(2026,0,31,23,59,59)+1,n(2026,1,1,0,0,0));
 assert.equal(n(2026,1,28)+1,n(2026,2,1));assert.equal(n(2028,1,28)+2,n(2028,2,1));
 assert.equal(n(2026,11,31,23,59)+1,n(2027,0,1,0,1));
 assert.equal(n(2026,10,13,0,0,1),n(2026,10,13,23,59,59));
 assert.equal(M.dayISO(n(2026,10,13,22,30)),'2026-11-13');assert.equal(M.dayISO(n(2028,1,29)),'2028-02-29');
 const back=M.dayDate(n(2026,2,29,23,30));assert.deepEqual([back.getFullYear(),back.getMonth(),back.getDate()],[2026,2,29]);
 let prev=n(2026,0,1);for(let i=1;i<800;i++){const d=n(2026,0,1+i,i%24,59);assert.equal(d,prev+1);prev=d;}
});
test('day numbers across daylight saving time (Europe/Paris, both changes)',()=>{
 const old=process.env.TZ;process.env.TZ='Europe/Paris';
 try{
  const n=(...a)=>M.dayNumber(new Date(...a));
  assert.equal(new Date(2026,2,29,12).getTimezoneOffset(),-120,'the test runs in Paris time');
  assert.equal(n(2026,2,28,23,59)+1,n(2026,2,29,0,30));assert.equal(n(2026,2,29,0,30),n(2026,2,29,23,30));assert.equal(n(2026,2,29,23,30)+1,n(2026,2,30,0,10));   // 23-hour day
  assert.equal(n(2026,9,25,0,10),n(2026,9,25,23,50));assert.equal(n(2026,9,25,23,50)+1,n(2026,9,26,0,10));   // 25-hour day
  assert.equal(n(2026,9,24,12)+7,n(2026,9,31,12));
  assert.equal(M.dayNumber(M.dayDate(n(2026,9,25,23,50))),n(2026,9,25));
 }finally{if(old===undefined)delete process.env.TZ;else process.env.TZ=old;}
});
test('a clock set back never shortens an interval nor corrupts a card',()=>{
 let s=fresh(['a1']);s=M.grade(s,'a1',3,D0+10);
 const before=s.cards.a1;assert.equal(before.due,D0+14);
 const t=M.grade(s,'a1',2,D0-500),c=t.cards.a1;
 assert.equal(c.last,D0+10);assert.ok(c.ivl>0&&c.due===c.last+c.ivl&&c.due>before.due);assert.deepEqual(M.cleanCard(c),c);
 assert.deepEqual(M.dueToday(s,D0-500),[]);assert.equal(M.stats(s,D0-500).nextDue,D0+14);
 assert.equal(M.startedToday(s,D0-500),0);
 const u=M.grade(s,'a1',0,D0-500).cards.a1;assert.equal(u.ivl,0);assert.equal(u.due,D0+10);
});
test('enrol and unenrol by chapter; a reviewed objective is set aside, not lost',()=>{
 assert.deepEqual(M.chaptersOf(OBJ,'x'),[{chapter:'x-01',ids:['a1','a2']},{chapter:'x-02',ids:['b1']}]);
 let s=M.enrolChapter(M.emptyState(),OBJ,'x-01',D0);
 assert.deepEqual(Object.keys(s.cards),['a1','a2']);
 assert.equal(M.enrolChapter(s,OBJ,'x-01',D0+5).cards.a1.added,D0,'enrolling twice changes nothing');
 s=M.grade(s,'a1',2,D0);const kept=s.cards.a1;
 s=M.unenrolChapter(s,OBJ,'x-01');
 assert.deepEqual(Object.keys(s.cards),['a1']);assert.equal(s.cards.a1.off,true);assert.equal(M.isEnrolled(s,'a1'),false);
 assert.deepEqual(M.dueToday(s,D0+50),[]);assert.equal(M.stats(s,D0+50).total,0);
 s=M.enrolChapter(s,OBJ,'x-01',D0+9);assert.deepEqual(s.cards.a1,kept);assert.equal(s.cards.a2.added,D0+9);
 assert.deepEqual(Object.keys(M.enrol(M.emptyState(),['__proto__','constructor','ok','bad id'],D0).cards),['ok']);
});
test('daily cap of new cards: default 10, adjustable, survives a reload, resets the next day',()=>{
 const ids=Array.from({length:25},(_,i)=>'n'+String(i).padStart(2,'0'));
 let s=fresh(ids);
 assert.equal(s.settings.newPerDay,10);assert.deepEqual(M.dueToday(s,D0),ids.slice(0,10));
 for(const id of ids.slice(0,4))s=M.grade(s,id,2,D0);
 assert.equal(M.startedToday(s,D0),4);assert.deepEqual(M.dueToday(s,D0),ids.slice(4,10));
 s=JSON.parse(JSON.stringify(s));assert.equal(M.newLeftToday(s,D0),6);
 assert.equal(M.dueToday(M.setNewPerDay(s,3),D0).length,0);assert.equal(M.dueToday(M.setNewPerDay(s,0),D0).length,0);
 assert.deepEqual(M.dueToday(M.setNewPerDay(s,12),D0),ids.slice(4,12));
 for(const bad of [-1,51,2.5,NaN,'5'])assert.equal(M.setNewPerDay(s,bad),s);
 const next=M.dueToday(s,D0+1);assert.deepEqual(next.slice(0,4),ids.slice(0,4));assert.deepEqual(next.slice(4),ids.slice(4,14));
 const missed=M.grade(fresh(ids),'n00',0,D0);assert.equal(M.dueToday(missed,D0)[0],'n00');assert.equal(M.dueToday(missed,D0).length,10,'a missed new card stays due and counts in the cap');
});
test('order: overdue first, then lowest ease, then id; new cards last, in bank order',()=>{
 const card=(due,ease,ivl=5)=>({ivl,ease,due,seen:2,correct:2,reps:2,lapses:0,last:due-ivl,first:due-ivl,added:due-ivl});
 const s={settings:{newPerDay:10},cards:{late:card(D0-9,250),hard:card(D0-2,150),soft:card(D0-2,280),twin:card(D0-2,150),today:card(D0,200),later:card(D0+1,130),n2:M.newCard(D0),n1:M.newCard(D0),old:M.newCard(D0-3)}};
 assert.deepEqual(M.dueToday(s,D0),['late','hard','twin','soft','today','old','n1','n2']);
 assert.deepEqual(M.dueToday(s,D0,{rank:id=>({n2:0,n1:1})[id]}).slice(5),['old','n2','n1']);
 assert.deepEqual(M.dueToday(s,D0,{known:new Set(['late','n1'])}),['late','n1']);
});
test('stats: due + learning + mastered = total, per chapter and overall, next due day',()=>{
 let s=fresh(['a1','a2','b1','c1']);
 s=M.grade(s,'a1',2,D0);
 s={...s,cards:{...s.cards,b1:{ivl:30,ease:250,due:D0+30,seen:5,correct:5,reps:5,lapses:0,last:D0,first:D0-40,added:D0-40}}};
 const all=M.stats(s,D0);
 assert.deepEqual(all,{total:4,due:2,fresh:2,learning:1,mastered:1,nextDue:D0+1});
 assert.deepEqual(M.chapterStats(s,OBJ,'x',D0).map(r=>[r.chapter,r.objectives,r.enrolled,r.due,r.learning,r.mastered,r.nextDue]),[['x-01',2,2,1,1,0,D0+1],['x-02',1,1,0,0,1,D0+30]]);
 assert.equal(M.stats(M.emptyState(),D0).nextDue,null);
 const later=M.stats(s,D0+30);assert.equal(later.due,4);assert.equal(later.due+later.learning+later.mastered,later.total);
});
test('seeds change at every review, so the question changes; levels rise with the interval',()=>{
 const t=TEMPLATES[0];let c=M.newCard(D0);const seeds=new Set(),qs=new Set();
 for(let i=0;i<12;i++){const seed=M.seedFor(t.id,c,D0);seeds.add(seed);qs.add(instance(t,1,seed).q);c=M.schedule(c,0,D0);}
 assert.equal(seeds.size,12);assert.ok(qs.size>=6,'the instances vary: '+qs.size);
 assert.notEqual(M.seedFor(t.id,M.newCard(D0),D0),M.seedFor(t.id,M.newCard(D0),D0+1));
 assert.deepEqual([M.newCard(D0),...seq([2,2,2,2,2])].map(M.levelFor),[1,1,2,2,2,3]);
});

// ---- export, import ----
const sample=()=>{let s=fresh(['a1','a2','b1']);s=M.grade(s,'a1',2,D0);s=M.grade(s,'a2',0,D0);return M.setNewPerDay(s,7);};
const KNOWN=OBJ.map(o=>o.id);
test('export gives the versioned plain object, and the round trip is exact',()=>{
 const s=sample(),x=M.exportReview(s,new Date(Date.UTC(2026,10,13,8,30)));
 assert.deepEqual(Object.keys(x),['app','version','exportedAt','cards','settings']);
 assert.equal(x.app,'mx-review');assert.equal(x.version,1);assert.equal(x.exportedAt,'2026-11-13T08:30:00.000Z');assert.deepEqual(x.settings,{newPerDay:7});
 for(const mode of ['replace','merge']){
  const r=M.importReview(JSON.stringify(x),M.emptyState(),mode,{known:KNOWN});
  assert.equal(r.ok,true);assert.deepEqual(r.state.cards,s.cards);assert.equal(r.imported,3);assert.equal(r.dropped,0);
 }
 assert.deepEqual(M.importReview(x,M.emptyState(),'replace',{known:KNOWN}).state,s,'an object is accepted like its text');
 assert.equal(M.importReview(JSON.stringify(x),M.emptyState(),'merge').state.settings.newPerDay,10,'merge keeps the current settings');
});
test('malformed imports are refused with an error object and never touch the current state',()=>{
 const cur=sample(),snap=JSON.stringify(cur),good=M.exportReview(cur),card=good.cards.a1;
 const bad=(v,error,mode='replace')=>{let r;assert.doesNotThrow(()=>{r=M.importReview(v,cur,mode,{known:KNOWN});});assert.equal(r.ok,false,String(JSON.stringify(v)).slice(0,80));assert.equal(r.error,error);assert.equal(r.state,undefined);assert.equal(JSON.stringify(cur),snap);};
 bad('{not json','not-json');bad('','not-json');bad('null','not-object');bad('[]','not-object');bad('42','not-object');bad(undefined,'not-object');bad(()=>1,'not-object');
 bad({...good,app:'other'},'wrong-app');bad({version:1,cards:{}},'wrong-app');
 for(const version of [2,0,'1',1.5,null])bad({...good,version},'wrong-version');
 bad({...good,cards:[]},'bad-cards');bad({...good,cards:null},'bad-cards');bad({app:'mx-review',version:1},'bad-cards');
 bad('x'.repeat(M.MAX_BYTES+1),'too-large');bad(JSON.stringify({...good,pad:'y'.repeat(M.MAX_BYTES)}),'too-large');
 bad({...good,cards:Object.fromEntries(Array.from({length:M.MAX_CARDS+1},(_,i)=>['k'+i,card]))},'too-large');
 for(const settings of [null,[],{newPerDay:-1},{newPerDay:51},{newPerDay:'10'},{newPerDay:NaN}])bad({...good,settings},'bad-settings');
 bad(good,'bad-mode','both');bad(good,'bad-mode','__proto__');bad(good,'bad-mode',null);
 const broken=[{ivl:-1},{ivl:NaN},{ivl:1.5},{ivl:M.MAX_IVL+1},{ease:129},{ease:301},{ease:'250'},{ease:Infinity},{due:-3},{due:card.due+1},{seen:-1},{seen:NaN},{correct:card.seen+1},{correct:-1},{reps:9},{lapses:-1},{lapses:5},{last:null},{last:-2},{first:card.last+1},{added:-1},{added:1e9},{off:'yes'}];
 for(const patch of broken)bad({...good,cards:{...good.cards,a1:{...card,...patch}}},'bad-card');
 for(const v of [null,7,'card',[],{}])bad({...good,cards:{a1:v}},'bad-card');
 bad({...good,cards:{b1:{...good.cards.b1,last:D0}}},'bad-card');   // never seen, yet a review day
 assert.equal(M.importReview({...good,cards:{a1:{...card,ivl:-1}}},cur,'merge',{known:KNOWN}).detail,'a1');
});
test('prototype pollution: hostile keys are dropped and nothing leaks into Object.prototype',()=>{
 const card=JSON.stringify(M.newCard(D0));
 const text=`{"app":"mx-review","version":1,"__proto__":{"polluted":1},"settings":{"newPerDay":5,"__proto__":{"polluted":2}},"cards":{"__proto__":{"polluted":3,"ivl":0},"constructor":{"prototype":{"polluted":4}},"prototype":{},"a1":{"__proto__":{"polluted":5},${card.slice(1)}}}`;
 for(const mode of ['replace','merge']){
  const r=M.importReview(text,M.emptyState(),mode);
  assert.equal(r.ok,true);assert.deepEqual(Object.keys(r.state.cards),['a1']);assert.equal(r.dropped,3);
  assert.equal(Object.getPrototypeOf(r.state),Object.prototype);assert.equal(Object.getPrototypeOf(r.state.cards),Object.prototype);assert.equal(Object.getPrototypeOf(r.state.cards.a1),Object.prototype);assert.equal(Object.getPrototypeOf(r.state.settings),Object.prototype);
  assert.equal(r.state.cards.a1.polluted,undefined);assert.equal(r.state.polluted,undefined);assert.equal(r.state.settings.polluted,undefined);
 }
 assert.equal({}.polluted,undefined);assert.equal(Object.prototype.polluted,undefined);
 assert.equal(M.cardOf(M.emptyState(),'constructor'),null);assert.equal(M.cardOf(M.emptyState(),'toString'),null);
});
test('unknown ids are dropped and counted',()=>{
 const x=M.exportReview(M.enrol(sample(),['gone1','gone2'],D0));
 const r=M.importReview(x,M.emptyState(),'replace',{known:KNOWN});
 assert.equal(r.ok,true);assert.equal(r.dropped,2);assert.equal(r.imported,3);assert.equal(r.total,3);assert.deepEqual(Object.keys(r.state.cards).sort(),['a1','a2','b1']);
 const junk=M.importReview({...x,cards:{...x.cards,gone1:{ivl:'broken'}}},M.emptyState(),'merge',{known:KNOWN});
 assert.equal(junk.ok,true,'a damaged card of an unknown objective is dropped, not fatal');assert.equal(junk.dropped,2);
});
test('merge keeps, card by card, the record reviewed last; replace takes the file',()=>{
 let here=fresh(['a1','a2','b1']);here=M.grade(here,'a1',2,D0+5);here=M.grade(here,'a2',2,D0+1);here=M.setNewPerDay(here,3);
 let file=fresh(['a1','a2','c1'],D0-1);file=M.grade(file,'a1',3,D0+2);file=M.grade(file,'a2',1,D0+4);file=M.grade(file,'c1',2,D0);file=M.setNewPerDay(file,20);
 const r=M.importReview(M.exportReview(file),here,'merge',{known:KNOWN});
 assert.equal(r.ok,true);assert.deepEqual([r.imported,r.kept,r.dropped,r.total],[2,1,0,3]);
 assert.deepEqual(r.state.cards.a1,here.cards.a1);assert.deepEqual(r.state.cards.a2,file.cards.a2);assert.deepEqual(r.state.cards.c1,file.cards.c1);assert.deepEqual(r.state.cards.b1,here.cards.b1);
 assert.equal(r.state.settings.newPerDay,3);
 const tieA=M.grade(fresh(['a1']),'a1',0,D0),tieB=M.grade(tieA,'a1',2,D0);
 assert.equal(M.importReview(M.exportReview(tieB),tieA,'merge').state.cards.a1.seen,2,'same day: the record seen most wins');
 assert.equal(M.importReview(M.exportReview(tieA),tieB,'merge').state.cards.a1.seen,2);
 assert.equal(M.importReview(M.exportReview(here),here,'merge').kept,3,'an identical file changes nothing');
 const rep=M.importReview(M.exportReview(file),here,'replace',{known:KNOWN});
 assert.deepEqual(rep.state,{cards:file.cards,settings:{newPerDay:20}});assert.equal(rep.state.cards.b1,undefined);
});

// ---- storage ----
const memoryStorage=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},_m:m};};
const ctx=(localStorage)=>{const events=[];return {localStorage,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail;}},dispatchEvent:e=>{events.push(e);return true;},events};};
const BLOCKED={getItem(){throw new Error('denied');},setItem(){throw new Error('denied');},removeItem(){throw new Error('denied');}};
test('storage: saves under mx-review-v1, reloads, emits mx-review-change',()=>{
 const c=ctx(memoryStorage()),st=createReviewState(c),s=sample();
 assert.equal(KEY,'mx-review-v1');assert.deepEqual(st.load(),M.emptyState());assert.equal(st.storageStatus(),'ok');
 st.save(s);
 assert.deepEqual(JSON.parse(c.localStorage.getItem(KEY)),s);assert.deepEqual(createReviewState(c).load(),s);
 st.update(x=>M.grade(x,'b1',3,D0));
 assert.equal(createReviewState(c).load().cards.b1.ivl,4);
 assert.deepEqual(c.events.map(e=>[e.type,e.detail.kind]),[['mx-review-change','save'],['mx-review-change','update']]);
 st.clear();assert.equal(c.localStorage.getItem(KEY),null);assert.deepEqual(st.load(),M.emptyState());assert.equal(c.events.at(-1).detail.kind,'clear');
});
test('storage: blocked or full storage falls back to memory without throwing',()=>{
 for(const ls of [BLOCKED,undefined]){
  const st=createReviewState(ctx(ls)),s=sample();
  assert.deepEqual(st.load(),M.emptyState());assert.equal(st.storageStatus(),'memory-only');
  assert.doesNotThrow(()=>st.save(s));assert.deepEqual(st.load(),s);
  st.update(x=>M.grade(x,'b1',2,D0));assert.equal(st.load().cards.b1.seen,1);
  st.clear();assert.deepEqual(st.load(),M.emptyState());
 }
 const full=memoryStorage(),set=full.setItem;let quota=false;full.setItem=(k,v)=>{if(quota)throw new Error('QuotaExceededError');set(k,v);};
 const st=createReviewState(ctx(full)),s=sample();
 st.save(s);quota=true;const t=M.grade(s,'b1',2,D0);st.save(t);
 assert.deepEqual(st.load(),t,'the newest state is served from memory');assert.equal(st.storageStatus(),'memory-only');
 assert.deepEqual(JSON.parse(full.getItem(KEY)),s,'the stored copy is the last one that fitted');
 quota=false;st.save(t);assert.equal(st.storageStatus(),'ok');assert.deepEqual(JSON.parse(full.getItem(KEY)),t);
 assert.doesNotThrow(()=>createReviewState({}).save(s));
});
test('storage: damaged data is ignored, the valid cards survive, unreadable text is set aside',()=>{
 const c=ctx(memoryStorage()),s=sample();
 c.localStorage.setItem(KEY,JSON.stringify({cards:{...s.cards,bad1:{ivl:-4},bad2:'x','bad id':s.cards.a1},settings:{newPerDay:999}}));
 const info=createReviewState(c).inspect();
 assert.deepEqual(info.state.cards,s.cards);assert.equal(info.dropped,3);assert.equal(info.damaged,false);assert.equal(info.state.settings.newPerDay,10);
 for(const raw of ['{"cards":','null','[1,2]','"text"','{"cards":7}']){
  c.localStorage._m.clear();c.localStorage.setItem(KEY,raw);
  assert.deepEqual(createReviewState(c).load(),M.emptyState(),raw);
  assert.equal(c.localStorage.getItem(KEY),raw,'reading never rewrites what is stored');
 }
 c.localStorage._m.clear();c.localStorage.setItem(KEY,'{"cards":');
 const st3=createReviewState(c);assert.equal(st3.inspect().damaged,true);
 st3.save(s);assert.equal(c.localStorage.getItem(DAMAGED),'{"cards":');assert.deepEqual(st3.load(),s);
});

// ---- data and wiring: nothing about a level is hard-coded ----
const liveIds=new Set(liveCourses.map(c=>c.id)),CLASSES=[...new Set(TEMPLATES.map(t=>t.cls))].filter(c=>liveIds.has(c));
test('every generator can be an objective: valid unique ids, live class, route and tab wired',()=>{
 assert.equal(new Set(TEMPLATES.map(t=>t.id)).size,TEMPLATES.length);
 for(const t of TEMPLATES)assert.ok(M.validId(t.id),t.id);
 assert.ok(CLASSES.length>0);
 for(const cls of CLASSES){const ch=M.chaptersOf(TEMPLATES,cls);assert.ok(ch.length>0,cls);assert.equal(ch.reduce((n,c)=>n+c.ids.length,0),TEMPLATES.filter(t=>t.cls===cls).length);}
 assert.equal(isLiveRoute({page:'review'}),true);assert.equal(isLiveRoute({page:'review',id:'x'}),false);
 const read=p=>readFileSync(new URL('../site/'+p,import.meta.url),'utf8');
 const app=read('js/app.js');
 assert.match(app,/\["bank", "Exercices", "Exercises", "seal-check"\],\s*\["review", "Réviser", "Review", "[a-z-]+"\]/);
 assert.match(app,/r\.page === "review" && !r\.id/);assert.match(app,/'\.\/review-page\.js'/);assert.doesNotMatch(app,/^import[^\n]*review-page/m,'the page is loaded on demand');
 assert.match(read('index.html'),/href="\.\/styles\/review\.css(\?v=\w+)?"/);
 for(const f of ['js/review-model.js','js/review-state.js','js/review-page.js']){const src=read(f);for(const id of new Set([...liveIds,...TEMPLATES.map(t=>t.cls)]))assert.ok(!new RegExp(`['"\`]${id}['"\`]`).test(src),`${f} names the class ${id}`);}
 assert.doesNotMatch(read('js/review-model.js'),/\b(document|window|localStorage|Date\.now|new Date\(\))/);
});

// ---- the page under jsdom ----
async function page({lang=0,store,day=[2026,10,13,10],courses=liveCourses,templates=TEMPLATES}={}){
 const dom=new JSDOM('<main id="main"></main>',{url:'https://example.test/#review'});
 const main=dom.window.document.querySelector('#main');
 store=store||createReviewState(ctx(memoryStorage()));
 const clock={date:new Date(...day)},saved=[];
 const stop=await mountReviewPage(main,{t:p=>p[lang],now:()=>clock.date,store,courses,templates,typesetMath:()=>{},save:(name,text)=>saved.push({name,text})});
 const $=s=>main.querySelector(s),$$=s=>[...main.querySelectorAll(s)],W=dom.window;
 const change=el=>el.dispatchEvent(new W.Event('change',{bubbles:true}));
 const key=(k,target=W.document.body)=>target.dispatchEvent(new W.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
 return {main,stop,$,$$,W,store,clock,saved,change,key,tick:()=>new Promise(r=>setTimeout(r,20)),tickBox:el=>{el.checked=!el.checked;change(el);}};
}
test('page: empty states, enrol a chapter, reveal and grade with keys, summary, persistence',async()=>{
 const h=await page();
 assert.deepEqual(h.$$('h1,h2').map(x=>x.textContent),['Réviser','Séance du jour','Choisir ce que je révise','Mes progrès','Mes données']);
 assert.match(h.$('#rv-stage').textContent,/Tu n’as encore rien choisi/);assert.match(h.$('#rv-progress').textContent,/apparaîtront ici/);
 assert.equal(h.$('#rv-status').getAttribute('aria-live'),'polite');
 assert.deepEqual(h.$$('#rv-class option').map(o=>o.value).sort(),[...CLASSES].sort(),'the classes are those of the data');
 const cls=h.$('#rv-class').value,chapters=M.chaptersOf(TEMPLATES,cls),first=chapters[0];
 assert.equal(h.$$('[data-chapter]').length,chapters.length);
 assert.match(h.$('[data-row] [data-count]').textContent,new RegExp(`tout le chapitre : ${first.ids.length} objectif`));
 h.tickBox(h.$(`[data-chapter="${first.chapter}"]`));
 const n=Math.min(10,first.ids.length);
 assert.equal(Object.keys(h.store.load().cards).length,first.ids.length);
 assert.equal(h.$('#rv-status').textContent,`Question 1 / ${n}`);
 assert.ok(h.$('#rv-q').textContent.trim().length>5);assert.equal(h.$('#rv-a').hidden,true);assert.equal(h.$('#rv-grade').hidden,true);
 h.key('2');assert.equal(h.$('#rv-a').hidden,true,'no grade before the answer is shown');assert.equal(h.store.load().cards[first.ids[0]].seen,0);
 h.key(' ');assert.equal(h.$('#rv-a').hidden,false);assert.ok(h.$('#rv-a').textContent.length>8);assert.equal(h.$$('.rv-grade').length,4);
 assert.deepEqual(h.$$('.rv-grade .rv-glabel').map(x=>x.textContent),['Raté','Difficile','Bien','Facile']);
 h.key('1');   // missed: comes back at the end, with other numbers
 assert.equal(h.$('#rv-status').textContent,`Question 1 / ${n}`);assert.equal(h.store.load().cards[first.ids[0]].seen,1);
 h.key('Enter');h.key('3');assert.equal(h.$('#rv-status').textContent,`Question 2 / ${n}`);
 h.$('#rv-reveal').click();h.$('.rv-grade[data-grade="3"]').click();assert.equal(h.$('#rv-status').textContent,`Question 3 / ${n}`);
 for(let i=0;i<60&&h.$('#rv-reveal');i++){h.key(' ');h.key('3');}
 assert.match(h.$('#rv-stage').textContent,/Séance terminée/);assert.match(h.$('#rv-stage').textContent,new RegExp(`${n} questions`));assert.match(h.$('#rv-stage').textContent,/Prochaine révision : demain/);
 assert.match(h.$('#rv-status').textContent,new RegExp(`${n} / ${n}`));
 const s=h.store.load();assert.equal(s.cards[first.ids[0]].seen,2);assert.equal(s.cards[first.ids[0]].correct,1);
 assert.match(h.$('#rv-progress').textContent,/en apprentissage/);assert.equal(h.$$('.rv-bars li').length,1);assert.equal(h.$('.rv-bar').getAttribute('aria-hidden'),'true');
 h.stop();
 const again=await page({store:h.store});
 assert.match(again.$('#rv-stage').textContent,/Rien à réviser aujourd’hui/);assert.equal(again.$('#rv-status').textContent,'');
 assert.equal(again.$(`[data-chapter="${first.chapter}"]`).checked,true);
 const later=await page({store:h.store,day:[2026,10,14,7]});
 assert.match(later.$('#rv-status').textContent,/^Question 1 \/ \d+$/);
});
test('page: one objective, class change, daily number, keys ignored in fields, English',async()=>{
 const h=await page({lang:1});
 assert.equal(h.$('h1').textContent,'Review');assert.match(h.$('#rv-stage').textContent,/You have not chosen anything yet/);
 const box=h.$('[data-objective]');h.tickBox(box);
 const row=box.closest('[data-row]'),whole=row.querySelector('[data-chapter]'),size=row.querySelectorAll('[data-objective]').length;
 if(size>1){assert.equal(whole.indeterminate,true);assert.equal(whole.checked,false);assert.match(row.querySelector('[data-count]').textContent,new RegExp(`\\(1 / ${size} objectives\\)`));}
 assert.equal(h.$('#rv-status').textContent,'Question 1 / 1');
 h.key(' ',h.$('#rv-new'));assert.equal(h.$('#rv-a').hidden,true,'typing in a field never reveals');
 h.$('#rv-new').value='0';h.change(h.$('#rv-new'));assert.equal(h.store.load().settings.newPerDay,0);assert.match(h.$('#rv-stage').textContent,/Nothing to review today/);
 h.$('#rv-new').value='999';h.change(h.$('#rv-new'));assert.equal(h.store.load().settings.newPerDay,M.MAX_NEW_PER_DAY);assert.equal(h.$('#rv-status').textContent,'Question 1 / 1');
 const options=h.$$('#rv-class option');
 if(options.length>1){h.$('#rv-class').value=options[1].value;h.change(h.$('#rv-class'));assert.equal(h.$$('[data-chapter]').length,M.chaptersOf(TEMPLATES,options[1].value).length);assert.equal(h.$$('[data-objective]:checked').length,0);}
 h.tickBox(h.$('[data-chapter]'));assert.ok(Object.keys(h.store.load().cards).length>1);
});
test('page: a class added to the data appears with no change to the code',async()=>{
 const extra={id:'zz-new-class',title:['Classe nouvelle','New class'],curriculum:'fr'},t0=TEMPLATES[0];
 const more=[...TEMPLATES,{...t0,id:'zz-obj-1',cls:extra.id,chapter:'zz-new-class-01'},{...t0,id:'zz-obj-2',cls:extra.id,chapter:'zz-new-class-02'}];
 const h=await page({courses:[...liveCourses,extra],templates:more});
 assert.ok(h.$$('#rv-class option').some(o=>o.value===extra.id&&o.textContent==='Classe nouvelle'));
 h.$('#rv-class').value=extra.id;h.change(h.$('#rv-class'));
 assert.deepEqual(h.$$('[data-chapter]').map(x=>x.dataset.chapter),['zz-new-class-01','zz-new-class-02']);
 h.tickBox(h.$('[data-chapter]'));assert.equal(h.$('#rv-status').textContent,'Question 1 / 1');
 h.key(' ');h.key('4');assert.equal(h.store.load().cards['zz-obj-1'].ivl,4);
 const fewer=await page({courses:liveCourses.slice(0,1),templates:more});
 assert.deepEqual(fewer.$$('#rv-class option').map(o=>o.value),[liveCourses[0].id].filter(id=>TEMPLATES.some(t=>t.cls===id)),'only live classes are offered');
});
test('page: export, reset with confirmation, import (merge, replace) and refused files',async()=>{
 const h=await page(),file=text=>{const f=new h.W.File([text],'revisions.json',{type:'application/json'});if(!f.text)f.text=async()=>text;Object.defineProperty(h.$('#rv-file'),'files',{value:[f],configurable:true});};
 h.tickBox(h.$('[data-chapter]'));h.key(' ');h.key('3');h.key(' ');h.key('2');
 const before=h.store.load();
 h.$('#rv-export').click();
 assert.equal(h.saved.length,1);assert.equal(h.saved[0].name,'revisions-2026-11-13.json');
 const data=JSON.parse(h.saved[0].text);assert.equal(data.app,'mx-review');assert.equal(data.version,1);assert.deepEqual(data.cards,before.cards);
 assert.match(h.$('#rv-data-msg').textContent,/revisions-2026-11-13\.json/);
 h.$('#rv-reset').click();assert.equal(h.$('#rv-confirm').hidden,false);assert.deepEqual(h.store.load(),before,'nothing is erased before the confirmation');
 h.$('#rv-reset-no').click();assert.equal(h.$('#rv-confirm').hidden,true);assert.deepEqual(h.store.load(),before);
 h.$('#rv-reset').click();h.$('#rv-reset-yes').click();
 assert.deepEqual(h.store.load(),M.emptyState());assert.match(h.$('#rv-stage').textContent,/Tu n’as encore rien choisi/);assert.equal(h.$$('[data-chapter]:checked').length,0);
 h.$('#rv-import').click();await h.tick();assert.match(h.$('#rv-data-msg').textContent,/Choisis d’abord un fichier/);
 for(const [text,msg] of [['{oops',/Import refusé, rien n’a changé.*lisible/],[JSON.stringify({...data,app:'x'}),/ne vient pas de la page Réviser/],[JSON.stringify({...data,version:9}),/autre version/],['x'.repeat(M.MAX_BYTES+5),/trop gros/]]){
  file(text);h.$('#rv-import').click();await h.tick();
  assert.match(h.$('#rv-data-msg').textContent,msg);assert.ok(h.$('#rv-data-msg').classList.contains('rv-error'));assert.deepEqual(h.store.load(),M.emptyState());
 }
 file(JSON.stringify({...data,cards:{...data.cards,'no-such-objective':M.newCard(3)}}));h.$('#rv-import').click();await h.tick();
 assert.deepEqual(h.store.load().cards,before.cards);assert.match(h.$('#rv-data-msg').textContent,new RegExp(`${Object.keys(before.cards).length} objectif\\(s\\) repris.*1 objectif\\(s\\) inconnu`));
 assert.equal(h.$('#rv-data-msg').classList.contains('rv-error'),false);assert.ok(h.$$('[data-chapter]:checked').length>=1);
 h.tickBox(h.$$('[data-chapter]')[1]);const grown=Object.keys(h.store.load().cards).length;
 h.$('input[name="rv-mode"][value="replace"]').checked=true;file(h.saved[0].text);h.$('#rv-import').click();await h.tick();
 assert.deepEqual(h.store.load().cards,before.cards);assert.ok(grown>Object.keys(before.cards).length);assert.match(h.$('#rv-data-msg').textContent,/remplacées/);
});
test('page: storage that refuses to save is announced, and the session still works',async()=>{
 const h=await page({store:createReviewState(ctx(BLOCKED))});
 assert.match(h.$('#rv-notes').textContent,/refuse d’enregistrer/);
 h.tickBox(h.$('[data-chapter]'));h.key(' ');h.key('3');assert.match(h.$('#rv-status').textContent,/^Question 2 \//);
 const c=ctx(memoryStorage());c.localStorage.setItem(KEY,'{broken');
 const d=await page({store:createReviewState(c)});assert.match(d.$('#rv-notes').textContent,/illisibles/);
});
