import test from 'node:test';
import assert from 'node:assert/strict';
import {dockItems,showDock,phasesOfHash} from '../site/js/dock-model.js';
import {launchpad} from '../site/js/launchpad-model.js';
import {chaptersOf} from '../site/js/exercises/bank.js';

const DECKS=[{id:'premiere-02',course:'premiere',editions:{fr:{}}}];
const ctx={course:'premiere',chapter:'premiere-02',decks:DECKS};
const active=m=>m.items.filter(i=>i.active).map(i=>i.id);
const blk=(id,phase,href,title=phase)=>({id,phase,title,href,minutes:5,print:false});

test('seven items in launch pad order with label, href, active and disabled',()=>{
 const m=dockItems({...ctx,currentHash:'#teacher'});
 assert.deepEqual(m.items.map(i=>i.id),['automatismes','correction','activite','cours','exercices','outils','bilan']);
 const pad=launchpad(ctx);
 m.items.forEach((i,k)=>{assert.equal(i.href,pad[k].href);assert.deepEqual(i.label,pad[k].label);assert.equal(i.disabled,!pad[k].href);});
 assert.deepEqual(active(m),[]);assert.equal(m.current,null);
});

test('active matching: automatismes, bank, lab, cours',()=>{
 const bank=`#bank/premiere/premiere-02`;
 assert.ok(chaptersOf('premiere').includes('premiere-02'));
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#automatismes'})),['automatismes']);
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#automatismes/go'})),['automatismes']);
 assert.deepEqual(active(dockItems({...ctx,currentHash:bank})),['exercices'],'exercices is the primary bank match');
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#bank/seconde'})),['exercices']);
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#lab'})),['outils']);
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#lab/some-other'})),['outils']);
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#chapter/premiere-02'})),['cours']);
 assert.deepEqual(active(dockItems({...ctx,currentHash:'#slides/premiere'})),['cours']);
 assert.deepEqual(active(dockItems({currentHash:'#sheets'})),[]);
 const act=launchpad(ctx).find(p=>p.id==='activite').href;
 if(act!=='#lab')assert.deepEqual(active(dockItems({...ctx,currentHash:act})),['activite'],'the chapter experiment is the activity');
 assert.deepEqual(phasesOfHash('#bank/x',launchpad(ctx)),['exercices','correction','bilan']);
});

test('prev and next follow the phases when no séance is saved, skipping unreachable and same-page phases',()=>{
 let m=dockItems({...ctx,currentHash:'#automatismes'});
 assert.equal(m.prev,null);assert.ok(m.next);
 assert.equal(m.next.href,launchpad(ctx)[1].href,'next is the correction bank');
 m=dockItems({...ctx,currentHash:'#chapter/premiere-02',seance:{blocks:[]}});
 assert.ok(m.prev&&m.next);assert.notEqual(m.next.href,'#chapter/premiere-02');
 m=dockItems({...ctx,currentHash:'#lab'});assert.equal(m.current,'outils');
 assert.ok(m.prev);
 m=dockItems({...ctx,currentHash:'#sheets'});assert.deepEqual([m.prev,m.next],[null,null]);
});

test('prev and next follow the saved séance relative to the block whose href equals the page',()=>{
 const seance={blocks:[blk('a-1','automatismes','#automatismes/go','Auto'),blk('c-2','cours','#chapter/premiere-02','Le cours'),blk('e-3','exercices','#bank/premiere/premiere-02','Ex'),blk('b-4','bilan','#bank/premiere/premiere-02','Bil')]};
 let m=dockItems({...ctx,seance,currentHash:'#automatismes'});
 assert.equal(m.current,'a-1');assert.equal(m.prev,null);assert.deepEqual(m.next,{href:'#chapter/premiere-02',label:['Le cours','Le cours']});
 m=dockItems({...ctx,seance,currentHash:'#chapter/premiere-02'});
 assert.equal(m.prev.href,'#automatismes/go');assert.equal(m.next.href,'#bank/premiere/premiere-02');
 m=dockItems({...ctx,seance,currentHash:'#bank/premiere/premiere-02'});
 assert.equal(m.current,'e-3','same href: the block of the matching phase wins');assert.equal(m.next.label[0],'Bil');
 m=dockItems({...ctx,seance,currentHash:'#lab'});
 assert.deepEqual([m.prev,m.next,m.current],[null,null,null],'a page outside the séance has no steps');
});

test('unreachable phases are disabled with a bilingual reason, never dropped',()=>{
 for(const c of [{course:'',chapter:''},{course:'premiere',chapter:'premiere-02',decks:[]},{course:'nope',chapter:''}]){
  const m=dockItems({...c,currentHash:'#bank'});
  assert.equal(m.items.length,7);
  for(const i of m.items){
   if(i.href){assert.equal(i.disabled,false);assert.equal(i.why,null);}
   else{assert.equal(i.disabled,true);assert.ok(i.why[0]&&i.why[1],i.id);}
  }
 }
 const m=dockItems({course:'nope',chapter:'',currentHash:'#lab'});
 assert.equal(m.items[0].disabled,true,'unknown class has no generator');
});

test('showDock: only in remembered mode classe, with the mode bar, on tool pages',()=>{
 const tool=['bank','automatismes','lab','chapter','slides','resources','sheets','search'];
 for(const page of tool){
  assert.equal(showDock({mode:'classe',entry:'teacher',page}),true,page);
  assert.equal(showDock({mode:'preparer',entry:'teacher',page}),false,page+' preparer');
  assert.equal(showDock({mode:'detente',entry:'teacher',page}),false);
  assert.equal(showDock({mode:'',entry:'teacher',page}),false);
  assert.equal(showDock({mode:'classe',entry:'student',page}),false,page+' student: no mode bar');
  assert.equal(showDock({mode:'classe',entry:'',page}),false,'nothing stored: visitor, no dock');
  assert.equal(showDock({mode:'classe',entry:'visitor',page}),false,'visitor: no dock');
 }
 for(const page of ['teacher','prepare','relax','home','missing','']){
  assert.equal(showDock({mode:'classe',entry:'teacher',page}),false,page);
 }
 assert.equal(showDock(),false);
});

test('the dock follows the view: tableau links to the non-projector targets',()=>{
 const proj=dockItems({...ctx,currentHash:'#teacher'}),tab=dockItems({...ctx,currentHash:'#teacher',view:'tableau'});
 const by=(m,id)=>m.items.find(i=>i.id===id).href;
 assert.equal(by(proj,'automatismes'),'#automatismes/go');assert.equal(by(tab,'automatismes'),'#automatismes/list');
 assert.ok(by(proj,'cours').includes('player.html'));assert.equal(by(tab,'cours'),'#chapter/premiere-02');
 const pad=launchpad({...ctx,view:'tableau'});
 tab.items.forEach((i,k)=>assert.equal(i.href,pad[k].href));
 assert.deepEqual(active(dockItems({...ctx,view:'tableau',currentHash:'#automatismes'})),['automatismes']);
});
