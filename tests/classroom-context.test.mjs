import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>void store.set(k,String(v)),removeItem:k=>void store.delete(k)};
globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
const {autoDefaults,recentFor,contextStripHtml,noteOpen,AUTO_DEFAULTS}=await import('../site/js/classroom-context.js');
const {loadSettings,contextNote}=await import('../site/js/exercises/ui-kit.js');
const ts=await import('../site/js/teacher-state.js');
const {isLiveHash}=await import('../site/js/live-curriculum.js');
const {chaptersOf}=await import('../site/js/exercises/bank.js');
const t=p=>p[0];
const reset=()=>{store.clear();ts.clearAll();};

test('automatismes defaults are remembered, bounded and fall back safely',()=>{
 reset();
 assert.deepEqual(autoDefaults(),AUTO_DEFAULTS);
 ts.setTools({automatismes:{minutes:12,count:15,seedPolicy:'keep'}});
 assert.deepEqual(autoDefaults(),{minutes:12,count:15,seedPolicy:'keep'});
 assert.deepEqual(autoDefaults({automatismes:{minutes:999,count:1,seedPolicy:'x'}}),{minutes:60,count:3,seedPolicy:'new'});
 assert.deepEqual(autoDefaults({automatismes:'junk'}),AUTO_DEFAULTS);
});

test('the one-click route is live and the old route stays',()=>{
 assert.ok(isLiveHash('#automatismes/go'));assert.ok(isLiveHash('#automatismes'));assert.ok(!isLiveHash('#automatismes/other'));
});

test('opened pages become recents with live hrefs; the dashboard and home are not recorded',()=>{
 reset();
 assert.equal(recentFor('home','','',t),null);assert.equal(recentFor('teacher','','',t),null);
 const ch=chaptersOf('premiere')[0];
 const c=recentFor('chapter',ch,'',t);assert.equal(c.type,'chapter');assert.equal(c.href,'#chapter/'+ch);assert.ok(isLiveHash(c.href));
 const a=recentFor('automatismes','go','',t);assert.equal(a.href,'#automatismes','the one-click route is stored as the plain page');
 assert.ok(noteOpen(a));assert.ok(noteOpen(c));
 assert.deepEqual(ts.getRecent().map(x=>x.href),['#chapter/'+ch,'#automatismes']);
 assert.ok(noteOpen(c),'twice in a row is one entry');assert.equal(ts.getRecent().length,2);
 assert.equal(noteOpen({type:'tool',id:'x',title:'',href:'javascript:1'}),false,'invalid items are refused, never thrown');
});

test('class and chapter are preselected in the generators once, then left to the teacher',()=>{
 reset();
 const [c1,c2]=chaptersOf('premiere');
 ts.setChapter(c2);
 let s=loadSettings('k-test',{cls:'seconde',chapters:[],ctxChapter:''});
 assert.equal(s.cls,'premiere');assert.deepEqual(s.chapters,[c2]);assert.equal(s.ctxChapter,c2);
 assert.match(contextNote(s,t),/data-ctx-all/,'a visible note with a way out');
 // the teacher widened the choice by hand and it was saved: it stays
 localStorage.setItem('k-test',JSON.stringify({...s,chapters:[c1,c2]}));
 s=loadSettings('k-test',{cls:'seconde',chapters:[],ctxChapter:''});assert.deepEqual(s.chapters,[c1,c2]);assert.equal(contextNote(s,t),'');
 localStorage.setItem('k-test',JSON.stringify({...s,chapters:[]}));
 s=loadSettings('k-test',{cls:'seconde',chapters:[],ctxChapter:''});assert.deepEqual(s.chapters,[],'cleared by hand: not forced back');
 // a new class chapter is applied again
 ts.setChapter(c1);
 s=loadSettings('k-test',{cls:'seconde',chapters:[],ctxChapter:''});assert.deepEqual(s.chapters,[c1]);
 // no class chapter: nothing is imposed
 ts.setChapter('');localStorage.removeItem('k-test');
 s=loadSettings('k-test',{cls:'seconde',chapters:[],ctxChapter:''});assert.deepEqual(s.chapters,[]);assert.equal(contextNote(s,t),'');
});

test('the context strip names the chapter of the class, only for that class',()=>{
 reset();
 assert.equal(contextStripHtml({page:'resources',t}),'');
 const ch=chaptersOf('terminale')[0];ts.setChapter(ch);
 const h=contextStripHtml({page:'resources',t,course:'terminale'});
 assert.match(h,new RegExp('href="#chapter/'+ch+'"'));assert.match(h,/data-ctx-clear/);assert.match(h,/href="#teacher"/);
 assert.match(contextStripHtml({page:'bank',t,course:'terminale'}),new RegExp('#bank/terminale/'+ch));
 assert.equal(contextStripHtml({page:'resources',t,course:'seconde'}),'','another class: nothing is imposed');
});
