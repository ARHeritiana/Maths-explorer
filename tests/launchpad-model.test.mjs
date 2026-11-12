import test from 'node:test';
import assert from 'node:assert/strict';
import {launchpad,resolveForSeance,resolveTargets} from '../site/js/launchpad-model.js';
import {quickActions,chaptersFor} from '../site/js/teacher-dashboard.js';
import {PHASES,defaultSeance} from '../site/js/seance-model.js';
import {liveCourses,isLiveHash} from '../site/js/live-curriculum.js';
import {chaptersOf} from '../site/js/exercises/bank.js';

const DECKS=[{id:'seconde-01',course:'seconde',editions:{fr:{}}}];
const cases=[];
for(const c of ['',...liveCourses.map(x=>x.id)])for(const ch of ['',...(c?chaptersFor(c).map(x=>x.id):[])])for(const decks of [DECKS,[],null])cases.push({course:c,chapter:ch,decks});

test('the seven phases come in seance-model order with the full shape',()=>{
 for(const k of cases){
  const l=launchpad(k);
  assert.deepEqual(l.map(p=>p.id),PHASES.map(p=>p.id));
  assert.deepEqual(l.map(p=>p.id),['automatismes','correction','activite','cours','exercices','outils','bilan']);
  for(const p of l){
   assert.ok(p.label[0]&&p.label[1]);assert.ok(p.detail&&p.detail[0]&&p.detail[1],p.id+' detail');
   assert.equal(typeof p.print,'boolean');
  }
  assert.deepEqual(l.filter(p=>p.print).map(p=>p.id),['exercices','bilan']);
 }
});

test('every class and chapter resolves to a live route or explains itself',()=>{
 for(const k of cases){
  for(const p of launchpad(k)){
   if(p.href){assert.equal(p.why,null);if(p.href.startsWith('#'))assert.ok(isLiveHash(p.href),p.id+' '+p.href);else assert.match(p.href,/player\.html.*deck=/);}
   else assert.ok(p.why&&p.why[0]&&p.why[1],`${p.id} unavailable without reason`);
  }
 }
});

test('resolution rules',()=>{
 const get=(k,id)=>launchpad(k).find(p=>p.id===id);
 assert.equal(get({course:'seconde'},'automatismes').href,'#automatismes/go');
 assert.ok(get({course:'seconde',chapter:'seconde-01',decks:DECKS},'cours').href.includes('deck=seconde-01'));
 assert.equal(get({course:'seconde',chapter:'seconde-01',decks:[]},'cours').href,'#chapter/seconde-01','no deck: chapter page');
 assert.equal(get({},'outils').href,'#lab');assert.ok(get({course:'seconde'},'activite').href.startsWith('#lab'));
 const ch=chaptersFor('seconde').map(c=>c.id).find(id=>!chaptersOf('seconde').includes(id));
 if(ch)for(const id of ['correction','exercices','bilan']){const p=get({course:'seconde',chapter:ch},id);assert.equal(p.href,null);assert.ok(p.why[0]);}
 const ok=chaptersOf('seconde')[0];
 for(const id of ['correction','exercices','bilan'])assert.equal(get({course:'seconde',chapter:ok},id).href,`#bank/seconde/${ok}`);
});

test('shared resolution with quickActions',()=>{
 for(const k of cases){
  const T=resolveTargets(k),qa=Object.fromEntries(quickActions(k).map(a=>[a.id,a]));
  assert.equal(qa.exercises.href,T.bank.href||null);assert.equal(qa.slides.href,T.slides.href||null);
  assert.equal(qa.lesson.href,T.lesson.href);assert.equal(qa.lab.href,T.lab.href);
  const l=Object.fromEntries(launchpad(k).map(p=>[p.id,p]));
  assert.equal(l.exercices.href,qa.exercises.href);assert.equal(l.activite.href,qa.lab.href);
  assert.ok(l.cours.href===qa.lesson.href||(T.hasDeck&&l.cours.href===qa.slides.href));
 }
});

test('projecteur and tableau views: same seven phases, only automatismes and cours differ',()=>{
 for(const k of cases){
  const proj=launchpad(k),def=launchpad({...k,view:'projecteur'}),tab=launchpad({...k,view:'tableau'});
  assert.deepEqual(proj,def,'projecteur is the default');
  assert.deepEqual(tab.map(p=>p.id),proj.map(p=>p.id));
  for(const p of tab){
   assert.ok(!('board' in p),'no board script');
   const q=proj.find(x=>x.id===p.id);
   if(p.id==='automatismes'){if(p.href)assert.equal(p.href,'#automatismes/list');assert.equal(!!p.href,!!q.href);}
   else if(p.id==='cours'){assert.ok(!p.href||!p.href.includes('player.html'),'tableau never opens the slide player');assert.equal(p.href,launchpad({...k,decks:[]}).find(x=>x.id==='cours').href,'chapter page or class lessons');}
   else assert.deepEqual(p,q,p.id);
   if(p.href&&p.href.startsWith('#'))assert.ok(isLiveHash(p.href),p.href);
  }
 }
 assert.equal(launchpad({course:'seconde',view:'projecteur'})[0].href,'#automatismes/go');
 assert.equal(launchpad({course:'seconde',view:'tableau'})[0].href,'#automatismes/list');
 const c={course:'seconde',chapter:'seconde-01',decks:DECKS};
 assert.ok(launchpad(c).find(p=>p.id==='cours').href.includes('deck=seconde-01'));
 assert.equal(launchpad({...c,view:'tableau'}).find(p=>p.id==='cours').href,'#chapter/seconde-01');
});

test('resolveForSeance feeds defaultSeance',()=>{
 const s=defaultSeance({course:'seconde',chapter:'seconde-01'},resolveForSeance('seconde','seconde-01',DECKS));
 assert.deepEqual(s.blocks.map(b=>b.phase),PHASES.map(p=>p.id));
 assert.equal(s.blocks[0].href,'#automatismes/go');
});
