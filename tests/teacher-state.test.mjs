import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createTeacherState,RECENT_MAX} from '../site/js/teacher-state.js';
import {currentCourse} from '../site/js/navigation-state.js';
const mk=()=>{const dom=new JSDOM('',{url:'https://example.test/'});return {win:dom.window,s:createTeacherState(dom.window)};};
const item=(n,type='chapter')=>({type,id:'id'+n,title:'Titre '+n,href:'#chapter/seconde-01'});
test('defaults',()=>{
 const {s,win}=mk();
 assert.equal(s.getEntry(),'');assert.equal(s.getChapter(),'');assert.deepEqual(s.getRecent(),[]);
 assert.deepEqual(s.getFavorites(),[]);assert.deepEqual(s.getTools(),{});assert.equal(s.storageStatus(),'ok');
 assert.equal(s.exportState().version,1);assert.equal(win.localStorage.length,0);
});
test('entry preference validates and persists across instances',()=>{
 const {s,win}=mk();
 assert.equal(s.setEntry('admin'),false);assert.equal(s.setEntry('teacher'),true);
 assert.equal(createTeacherState(win).getEntry(),'teacher');
 assert.equal(win.localStorage.getItem('mx-teacher-entry'),'teacher');
 s.setEntry('');assert.equal(s.getEntry(),'');
});
test('class and chapter move together; stale or foreign chapter is ignored, never a filter',()=>{
 const {s,win}=mk();
 assert.equal(s.setChapter('does-not-exist'),false);assert.equal(s.getChapter(),'');
 assert.equal(s.setChapter('seconde-01'),true);
 assert.equal(s.getChapter(),'seconde-01');assert.equal(currentCourse('',win),'seconde');
 assert.deepEqual(s.getClassroom(),{course:'seconde',chapter:'seconde-01'});
 s.setClassroom({course:'premiere'});
 assert.equal(s.getChapter(),'');assert.equal(currentCourse('',win),'premiere');
 win.localStorage.setItem('mx-teacher-chapter','gone-99');assert.equal(s.getChapter(),'');
 s.setChapter('seconde-01');win.localStorage.setItem('mx-home-course','stmg');
 assert.equal(s.getChapter(),'','changing the class elsewhere makes the chapter inert');
 s.setChapter('seconde-01');s.setChapter('');
 assert.equal(s.getChapter(),'');assert.equal(currentCourse('',win),'seconde','clearing the chapter keeps the class');
});
test('recents are bounded, most recent first and de-duplicated',()=>{
 const {s}=mk();
 for(let i=0;i<RECENT_MAX+5;i++)assert.equal(s.addRecent(item(i)),true);
 let r=s.getRecent();assert.equal(r.length,RECENT_MAX);assert.equal(r[0].id,'id'+(RECENT_MAX+4));
 s.addRecent({...item(RECENT_MAX),title:'Nouveau'});r=s.getRecent();
 assert.equal(r.length,RECENT_MAX);assert.equal(r[0].id,'id'+RECENT_MAX);assert.equal(r[0].title,'Nouveau');
 assert.equal(r.filter(x=>x.id==='id'+RECENT_MAX).length,1);
 assert.ok(Number.isFinite(r[0].at)&&r[0].at>0);
 assert.equal(s.addRecent({type:'x',id:'y',title:'t',href:'javascript:alert(1)'}),false);
 assert.equal(s.addRecent({type:'x'}),false);
 s.clearRecent();assert.deepEqual(s.getRecent(),[]);
});
test('favorites add, remove, toggle and list; same id of another type is distinct',()=>{
 const {s}=mk();
 assert.equal(s.toggleFavorite(item(1)),true);assert.ok(s.isFavorite('chapter','id1'));
 s.addFavorite(item(1));assert.equal(s.getFavorites().length,1);
 s.addFavorite(item(1,'slides'));assert.equal(s.getFavorites().length,2);
 assert.equal(s.toggleFavorite(item(1)),false);assert.equal(s.isFavorite('chapter','id1'),false);
 assert.equal(s.removeFavorite('slides','id1'),true);assert.equal(s.removeFavorite('slides','id1'),false);
 assert.deepEqual(s.getFavorites(),[]);
});
test('tool settings merge, null removes, unsafe keys and values are dropped',()=>{
 const {s,win}=mk();
 s.setTools({count:10,timed:true});s.setTools({count:12,level:'2'});
 assert.deepEqual(s.getTools(),{count:12,timed:true,level:'2'});
 s.setTools({timed:null,fn:()=>1,bad:undefined,nested:{a:1}});
 assert.deepEqual(s.getTools(),{count:12,level:'2',nested:{a:1}});
 s.setTools(JSON.parse('{"__proto__":{"x":1}}'));assert.equal({}.x,undefined);
 win.localStorage.setItem('mx-teacher-tools','not json');assert.deepEqual(s.getTools(),{});
});
test('export then import round-trips; malformed import is ignored',()=>{
 const a=mk(),b=mk();
 a.s.setEntry('teacher');a.s.setChapter('seconde-01');a.s.addRecent(item(1));a.s.addFavorite(item(2));a.s.setTools({count:5});
 const dump=JSON.parse(JSON.stringify(a.s.exportState()));
 const res=b.s.importState(dump);
 assert.equal(res.ok,true);assert.equal(res.rejected,0);
 const out=b.s.exportState();assert.deepEqual(out,dump);
 const c=mk();c.s.setEntry('student');
 for(const bad of [null,'{oops','[]',42,{},{version:99},{version:'1'},{version:0}]){
  assert.equal(c.s.importState(bad).ok,false);
 }
 assert.equal(c.s.getEntry(),'student','rejected import changes nothing');
 const r=c.s.importState({version:1,entry:'boss',chapter:'nope',recent:[item(1),{type:'a'},'x',item(1)],favorites:'no',tools:[1]});
 assert.equal(r.ok,true);assert.ok(r.rejected>=5);
 assert.equal(c.s.getEntry(),'student');assert.equal(c.s.getChapter(),'');
 assert.equal(c.s.getRecent().length,1);assert.deepEqual(c.s.getFavorites(),[]);assert.deepEqual(c.s.getTools(),{});
 assert.ok(c.s.importState(JSON.stringify(dump)).ok,'JSON strings are accepted');
});
test('clearAll deletes everything including the class',()=>{
 const {s,win}=mk();
 s.setEntry('teacher');s.setChapter('seconde-01');s.addRecent(item(1));s.addFavorite(item(1));s.setTools({a:1});
 s.clearAll();
 assert.deepEqual(s.exportState(),{version:1,entry:'',course:'',chapter:'',recent:[],favorites:[],tools:{},seance:{blocks:[]},mode:""});
 assert.equal([...Array(win.localStorage.length).keys()].filter(i=>win.localStorage.key(i).startsWith('mx-teacher-')).length,0);
});
test('blocked storage falls back to memory and says so',()=>{
 const {s,win}=mk();
 Object.defineProperty(win,'localStorage',{get(){throw new Error('blocked')}});
 Object.defineProperty(win,'sessionStorage',{get(){throw new Error('blocked')}});
 assert.equal(s.storageStatus(),'memory-only');
 assert.doesNotThrow(()=>{s.setEntry('teacher');s.addRecent(item(1));s.addFavorite(item(2));s.setTools({a:1});});
 assert.equal(s.getEntry(),'teacher');assert.equal(s.getRecent().length,1);assert.equal(s.getFavorites().length,1);assert.deepEqual(s.getTools(),{a:1});
 assert.doesNotThrow(()=>s.setChapter('seconde-01'));
 assert.equal(s.exportState().version,1);s.clearAll();assert.equal(s.getEntry(),'');
});
test('full storage keeps the new value in memory and reports it',()=>{
 const {s,win}=mk();
 s.setEntry('student');assert.equal(s.storageStatus(),'ok');
 const fake={getItem:k=>win.Storage.prototype.getItem.call(win.localStorage,k),removeItem:()=>{},setItem(){throw new win.DOMException('full','QuotaExceededError')}};
 Object.defineProperty(win,'localStorage',{get:()=>fake,configurable:true});
 s.setEntry('teacher');
 assert.equal(s.getEntry(),'teacher');assert.equal(s.storageStatus(),'memory-only');
});
test('changes dispatch mx-teacher-change once per actual change',()=>{
 const {s,win}=mk();const kinds=[];
 win.addEventListener('mx-teacher-change',e=>kinds.push(e.detail.kind));
 s.setEntry('teacher');s.setEntry('teacher');s.addRecent(item(1));s.toggleFavorite(item(1));s.setTools({a:1});s.setChapter('seconde-01');s.setChapter('bad');
 assert.deepEqual(kinds,['entry','recent','favorites','tools','chapter']);
 s.clearAll();assert.equal(kinds.at(-1),'clear');
});

const blk=(id,phase='cours')=>({id,phase,title:'Bloc '+id,href:'#chapter/seconde-01',minutes:10,print:false});
test('seance: round trip, persistence, cleaning, export/import, clear, event',()=>{
 const {s,win}=mk();const kinds=[];
 win.addEventListener('mx-teacher-change',e=>kinds.push(e.detail.kind));
 assert.deepEqual(s.getSeance(),{blocks:[]});
 const c=s.setSeance({blocks:[blk('a'),{id:'bad',phase:'nope',title:'x',href:'#x'},blk('b','bilan'),{...blk('c'),href:'javascript:alert(1)'}]});
 assert.deepEqual(c.blocks.map(b=>b.id),['a','b']);
 assert.deepEqual(createTeacherState(win).getSeance(),c);
 assert.ok(win.localStorage.getItem('mx-teacher-seance'));assert.deepEqual(kinds,['seance']);
 const dump=JSON.parse(JSON.stringify(s.exportState()));assert.deepEqual(dump.seance,c);
 const t=mk();assert.equal(t.s.importState(dump).rejected,0);assert.deepEqual(t.s.getSeance(),c);
 assert.ok(t.s.importState({version:1,entry:'teacher'}).ok,'old files without seance still import');
 assert.deepEqual(t.s.getSeance(),c,'absent key leaves the seance alone');
 const r=t.s.importState({version:1,seance:{blocks:[blk('z'),{id:1}]}});
 assert.equal(r.rejected,1);assert.deepEqual(t.s.getSeance().blocks.map(b=>b.id),['z']);
 for(const bad of ['x',[],null,{blocks:'no'},42]){const before=t.s.getSeance();assert.equal(t.s.importState({version:1,seance:bad}).rejected,1);assert.deepEqual(t.s.getSeance(),before);}
 win.localStorage.setItem('mx-teacher-seance','not json');assert.deepEqual(s.getSeance(),{blocks:[]});
 s.setSeance(c);s.clearAll();assert.deepEqual(s.getSeance(),{blocks:[]});assert.equal(win.localStorage.getItem('mx-teacher-seance'),null);
});
test('seance: blocked storage keeps it in memory',()=>{
 const {s,win}=mk();
 Object.defineProperty(win,'localStorage',{get(){throw new Error('blocked')}});
 assert.doesNotThrow(()=>s.setSeance({blocks:[blk('a')]}));
 assert.equal(s.getSeance().blocks.length,1);assert.equal(s.storageStatus(),'memory-only');
});
test('mode: validates, persists, event, export/import/clear, old files import',()=>{
 const {s,win}=mk();const kinds=[];
 win.addEventListener('mx-teacher-change',e=>kinds.push(e.detail.kind));
 assert.equal(s.getMode(),'');assert.equal(s.setMode('admin'),false);assert.equal(s.getMode(),'');
 assert.equal(s.setMode('classe'),true);assert.deepEqual(kinds,['mode']);
 assert.equal(createTeacherState(win).getMode(),'classe');assert.equal(win.localStorage.getItem('mx-teacher-mode'),'classe');
 assert.equal(s.exportState().mode,'classe');
 const t=mk();assert.ok(t.s.importState(JSON.parse(JSON.stringify(s.exportState()))).applied.includes('mode'));assert.equal(t.s.getMode(),'classe');
 assert.ok(t.s.importState({version:1,entry:'teacher'}).ok);assert.equal(t.s.getMode(),'classe','absent key leaves the mode alone');
 assert.equal(t.s.importState({version:1,mode:'x'}).rejected,1);assert.equal(t.s.getMode(),'classe');
 win.localStorage.setItem('mx-teacher-mode','garbage');assert.equal(s.getMode(),'');
 s.setMode('detente');s.clearAll();assert.equal(s.getMode(),'');assert.equal(win.localStorage.getItem('mx-teacher-mode'),null);
});
