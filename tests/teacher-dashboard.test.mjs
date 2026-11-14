import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createTeacherState} from '../site/js/teacher-state.js';
import {mountTeacherDashboard,quickActions,chaptersFor,STATE_FILE} from '../site/js/teacher-dashboard.js';
import {landingHash,homeHash,effectiveEntry,defaultEntry,installEntrySwitch,AUDIENCES} from '../site/js/teacher-entry.js';
import {homePage} from '../site/js/welcome.js';
import {liveCourses,isLiveHash,FULL_EDITION} from '../site/js/live-curriculum.js';
import {chaptersOf} from '../site/js/exercises/bank.js';

const t=p=>p[0];
const DECKS=[{id:'seconde-01',course:'seconde',editions:{fr:{}}},{id:'premiere-02',course:'premiere',editions:{fr:{}}}];
const setup=async({blocked=false,decks=DECKS,win}={})=>{
 const dom=win?null:new JSDOM('<div id="app"><main id="main"></main></div>',{url:'https://example.test/#teacher'});
 const window=win||dom.window;
 if(blocked)Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});
 const state=createTeacherState(window),main=window.document.querySelector('#main'),saved=[];
 const stop=await mountTeacherDashboard(main,{t,state,decks,download:(name,text)=>saved.push({name,text})});
 const change=(el,value)=>{el.value=value;el.dispatchEvent(new window.Event('change',{bubbles:true}));};
 const click=sel=>main.querySelector(sel).click();
 return {window,state,main,saved,stop,change,click,$:s=>main.querySelector(s),$$:s=>[...main.querySelectorAll(s)]};
};
const tick=()=>new Promise(r=>setTimeout(r,10));

test('entry preference: remembered, switch both ways, landing and logo follow it',async()=>{
 const h=await setup();
 assert.equal(h.state.getEntry(),'');
 assert.equal(defaultEntry(),'visitor');assert.deepEqual(AUDIENCES.map(a=>a.id),['visitor','student','teacher']);
 assert.equal(effectiveEntry(''),'visitor');assert.equal(effectiveEntry('bogus'),'visitor');
 for(const a of ['visitor','student','teacher'])assert.equal(effectiveEntry(a),a);
 // nothing stored: the visitor home, no redirection; only a device that chose "teacher" lands on the dashboard
 assert.equal(landingHash('',h.state.getEntry()),null);assert.equal(landingHash('#',null),null);
 assert.equal(landingHash('','teacher'),'#teacher');assert.equal(landingHash('#','teacher'),'#teacher');
 assert.equal(landingHash('#home','teacher'),null,'explicit #home opens the home');
 assert.equal(landingHash('','student'),null);assert.equal(landingHash('','visitor'),null);
 assert.equal(landingHash('#lab/quadratic','teacher'),null,'explicit links are never redirected');
 assert.equal(homeHash('teacher'),'#teacher');assert.equal(homeHash('student'),'#home');assert.equal(homeHash('visitor'),'#home');assert.equal(homeHash(''),'#home');
 // the visitor home offers both working audiences and has no class finder
 const visitor=new JSDOM(homePage({t:p=>p[0],pair:(a)=>a,link:(p,id)=>'#'+p+(id?'/'+id:''),index:[],last:'',audience:'visitor'}),{url:'https://example.test/'});
 const vd=visitor.window.document;
 assert.equal(vd.querySelector('#home-class'),null);assert.ok(vd.querySelector('#home-figure-stage'),'a figure to move at once');
 assert.equal(vd.querySelector('[data-set-entry="student"]').getAttribute('href'),'#home');
 assert.equal(vd.querySelector('.audience-cards [data-set-entry="teacher"]').getAttribute('href'),'#teacher');
 assert.ok(vd.querySelectorAll('.door-list a').length>=5);
 for(const a of vd.querySelectorAll('.door-list a'))assert.ok(isLiveHash(a.getAttribute('href')),a.getAttribute('href'));
 // student home offers the choice
 const home=new JSDOM(homePage({t:p=>p[0],pair:(a)=>a,link:(p,id)=>'#'+p+(id?'/'+id:''),index:[],last:''}),{url:'https://example.test/'});
 const choose=home.window.document.querySelector('[data-set-entry="teacher"]');
 assert.equal(choose.getAttribute('href'),'#teacher');
 const stopSwitch=installEntrySwitch(home.window.document.body,h.state);
 choose.click();assert.equal(h.state.getEntry(),'teacher');
 assert.equal(createTeacherState(h.window).getEntry(),'teacher','persisted for the next visit');
 // the dashboard now shows the way back, always visible
 await h.stop();const h2=await setup({win:h.window});
 const back=h2.$('[data-set-entry="student"]');assert.ok(back);assert.equal(back.getAttribute('href'),'#home');
 const stopBack=installEntrySwitch(h2.main,h2.state);back.click();
 assert.equal(h2.state.getEntry(),'student');assert.equal(landingHash('','student'),null);assert.equal(h2.state.getEntry(),'student');
 stopBack();stopSwitch();
 // from the dashboard with no preference, a button chooses it
 const h3=await setup();assert.ok(h3.$('a[href="#home"]'),'student home reachable');
 assert.equal(h3.$('[data-td="entry-reset"]'),null,'nothing stored: nothing to reset');
 h3.state.setEntry('student');await h3.stop();
 const h4=await setup({win:h3.window});
 h4.click('[data-td="entry-teacher"]');assert.equal(h4.state.getEntry(),'teacher');
 assert.ok(h4.$('[data-set-entry="student"]'),'switch back is shown after choosing');
 assert.ok(h4.$('[data-td="entry-reset"]'),'a stored choice can be reset');
 h4.click('[data-td="entry-reset"]');assert.equal(h4.state.getEntry(),'','reset restores the default');
 assert.equal(h4.$('[data-td="entry-reset"]'),null);
});

test('class and chapter override: chapters limited to the class, nothing hidden',async()=>{
 const h=await setup();
 assert.equal(h.$('#td-chapter').disabled,true,'no chapter list without a class');
 assert.equal(h.$$('#td-class option').length,liveCourses.length+1);
 for(const c of liveCourses){
  h.change(h.$('#td-class'),c.id);
  assert.equal(h.state.getClassroom().course,c.id);
  const ids=h.$$('#td-chapter option').slice(1).map(o=>o.value);
  assert.deepEqual(ids,chaptersFor(c.id).map(x=>x.id));
  assert.ok(ids.length>0);assert.ok(ids.every(id=>isLiveHash('#chapter/'+id)));
 }
 h.change(h.$('#td-class'),'seconde');h.change(h.$('#td-chapter'),'seconde-01');
 assert.deepEqual(h.state.getClassroom(),{course:'seconde',chapter:'seconde-01'});
 assert.match(h.$('#td-resume').textContent,/Seconde/);
 assert.equal(h.$('#td-resume a').getAttribute('href'),'#chapter/seconde-01');
 assert.equal(h.window.document.activeElement.id,'td-chapter','focus stays on the control');
 h.change(h.$('#td-class'),'premiere');
 assert.equal(h.state.getChapter(),'','changing class drops the chapter of another class');
 h.change(h.$('#td-class'),'');
 assert.equal(h.state.getClassroom().course,'');
 assert.equal(h.$('#td-chapter').disabled,true);
 // the class is the shared one
 h.change(h.$('#td-class'),'terminale');
 assert.equal(h.window.localStorage.getItem('mx-home-course'),'terminale');
});

test('quick actions: every enabled one points at an existing live route, the others explain themselves',async()=>{
 for(const course of ['',...liveCourses.map(c=>c.id)]){
  const chapters=['',...(course?chaptersFor(course).map(c=>c.id):[])];
  for(const chapter of chapters){
   for(const decks of [DECKS,[],null]){
    const actions=quickActions({course,chapter,decks});
    assert.deepEqual(actions.map(a=>a.id),['starters','sheets','exercises','slides','lesson','lab']);
    for(const a of actions){
     if(a.href){
      assert.equal(a.why,null);
      if(a.href.startsWith('#'))assert.ok(isLiveHash(a.href),`${a.id} ${a.href}`);
      else assert.match(a.href,/slides\/player\.html.*deck=/);
      if(a.href.startsWith('#bank/')&&chapter)assert.ok(chaptersOf(course).includes(chapter),'exercises exist for '+chapter);
     }else assert.ok(a.why&&a.why[0],`${a.id} unavailable without a reason`);
    }
   }
  }
 }
 const a=quickActions({course:'seconde',chapter:'seconde-01',decks:DECKS});
 assert.match(a.find(x=>x.id==='slides').href,/deck=seconde-01/);
 assert.equal(a.find(x=>x.id==='lesson').href,'#chapter/seconde-01');
 const none=quickActions({course:'seconde',chapter:'seconde-01',decks:[]});
 assert.equal(none.find(x=>x.id==='slides').href,null,'no deck, no link');
 assert.equal(quickActions({course:'seconde',decks:null}).find(x=>x.id==='slides').href,'#slides/seconde','index unreadable: class page still exists');
});

test('dashboard has no dead buttons or links',async()=>{
 const h=await setup();
 h.change(h.$('#td-class'),'seconde');h.change(h.$('#td-chapter'),'seconde-01');
 for(const a of h.$$('a')){
  const href=a.getAttribute('href');assert.ok(href&&href!=='#','link without a target: '+a.textContent);
  if(href.startsWith('#'))assert.ok(isLiveHash(href),href);
 }
 for(const el of h.$$('.is-unavailable'))assert.ok(!el.matches('a,button'),'unavailable entries are not controls');
 for(const b of h.$$('button'))assert.ok(b.dataset.td,'every button is wired: '+b.textContent);
 assert.ok(!/Mes sélections|Accès rapides/.test(h.main.textContent),'old quick actions list is gone');
 const hidden=new Set(liveCourses.map(c=>c.id));
 assert.deepEqual(h.$$('#td-class option').slice(1).map(o=>o.value).filter(v=>!hidden.has(v)),[]);
});

test('recents and favorites: honest empty states, then populated, removable, only live links',async()=>{
 const h=await setup();
 assert.match(h.$('#td-rec-h').parentElement.textContent,/Aucun élément récent/);
 assert.match(h.$('#td-fav-h').parentElement.textContent,/Aucun favori/);
 h.state.addRecent({type:'chapter',id:'seconde-01',title:'Arithmétique',href:'#chapter/seconde-01'});
 h.state.addRecent({type:'chapter',id:'hidden',title:'Caché',href:FULL_EDITION?'#chapter/zz-01':'#chapter/t10-01'});
 h.state.addRecent({type:'tool',id:'x',title:'Outil externe',href:'https://example.org/'});
 await h.stop();const h2=await setup({win:h.window});
 const rows=h2.$$('#td-rec-h ~ ul li');
 assert.equal(rows.length,2,'an item of a hidden curriculum is not shown');assert.ok(!h2.main.textContent.includes('Caché'));
 assert.equal(h2.$$('#td-rec-h ~ ul a').length,2);
 h2.click('[data-td="fav"][data-id="seconde-01"]');
 assert.equal(h2.state.isFavorite('chapter','seconde-01'),true);
 assert.match(h2.$('#td-fav-h').parentElement.textContent,/Arithmétique/);
 assert.equal(h2.$('[data-td="fav"][data-id="seconde-01"]').getAttribute('aria-pressed'),'true');
 h2.click('[data-td="unfav"]');assert.deepEqual(h2.state.getFavorites(),[]);
 assert.match(h2.$('#td-fav-h').parentElement.textContent,/Aucun favori/);
 h2.click('[data-td="clear-recent"]');assert.deepEqual(h2.state.getRecent(),[]);
 assert.match(h2.$('#td-rec-h').parentElement.textContent,/Aucun élément récent/);
});

test('opening a quick action records it as a recent item',async()=>{
 const h=await setup();
 h.change(h.$('#td-class'),'premiere');
 const link=h.$('.lp-tile[data-recent-id="exercices"]');
 link.addEventListener('click',e=>e.preventDefault());link.click();
 const [r]=h.state.getRecent();
 assert.equal(r.href,'#bank/premiere');assert.match(r.title,/Exercices/);
});

test('launch pad: seven link tiles in both views, tableau opens the non-projector targets with no scripts, switch persists',async()=>{
 const h=await setup();
 h.change(h.$('#td-class'),'seconde');h.change(h.$('#td-chapter'),'seconde-01');
 assert.match(h.$('h1').textContent,/En classe/);
 assert.equal(h.$$('.lp-grid>li').length,7);
 assert.equal(h.$('.lp-tile[data-recent-id="automatismes"]').getAttribute('href'),'#automatismes/go');
 assert.match(h.$('.lp-tile[data-recent-id="cours"]').getAttribute('href'),/player\.html/);
 assert.equal(h.$('[data-view="projecteur"]').getAttribute('aria-pressed'),'true');
 const links=h.$$('.lp-grid>li>a.lp-tile').length;
 h.click('[data-view="tableau"]');
 assert.equal(h.state.getTools().view,'tableau');
 assert.equal(h.$('.lp-tile[data-recent-id="automatismes"]').getAttribute('href'),'#automatismes/list');
 assert.equal(h.$('.lp-tile[data-recent-id="cours"]').getAttribute('href'),'#chapter/seconde-01');
 assert.equal(h.$$('.lp-script').length+h.$$('.lp-tag').length+h.$$('a.lp-open').length+h.$$('.lp-board').length,0,'no board scripts, tags or Ouvrir');
 assert.equal(h.$$('.lp-grid>li>a.lp-tile').length,links,'same tile layout: every tile is one link');
 await h.stop();const h2=await setup({win:h.window});
 assert.equal(h2.$('[data-view="tableau"]').getAttribute('aria-pressed'),'true','switch persists');
 h2.click('[data-view="projecteur"]');assert.equal(h2.state.getTools().view,'projecteur');
 assert.equal(h2.$('.lp-tile[data-recent-id="automatismes"]').getAttribute('href'),'#automatismes/go');
});

test('Ma séance: empty state proposes a standard séance, stored and shown; blocks are links',async()=>{
 const h=await setup();
 h.change(h.$('#td-class'),'seconde');h.change(h.$('#td-chapter'),'seconde-01');
 assert.equal(h.state.getSeance().blocks.length,0);
 assert.ok(h.$('[data-td="propose"]'));assert.equal(h.$('.lp-build').getAttribute('href'),'#prepare');
 h.click('[data-td="propose"]');
 assert.equal(h.state.getSeance().blocks.length,7);
 assert.equal(h.$$('.lp-blocks li').length,7);assert.equal(h.$('[data-td="propose"]'),null);
 for(const a of h.$$('.lp-blocks a'))assert.ok(a.getAttribute('href'));
 assert.match(h.$('.lp-total').textContent,/\d+ min/);
});

test('storage blocked: banner, choices kept for the session, export still works',async()=>{
 const h=await setup({blocked:true});
 assert.ok(h.$('.td-banner'),'storage banner is shown');assert.match(h.$('.td-banner').textContent,/bloqué/);
 h.change(h.$('#td-class'),'seconde');
 assert.equal(h.state.storageStatus(),'memory-only');
 h.state.setEntry('teacher');assert.equal(h.state.getEntry(),'teacher','kept in memory');
 h.click('[data-td="export"]');
 assert.equal(h.saved.length,1);assert.equal(JSON.parse(h.saved[0].text).entry,'teacher');
 const ok=await setup();assert.equal(ok.$('.td-banner'),null,'no banner when storage works');
});

test('export, clear, import round trip',async()=>{
 const h=await setup();
 h.change(h.$('#td-class'),'premiere');
 const ch=chaptersFor('premiere')[0].id;h.change(h.$('#td-chapter'),ch);
 h.state.setEntry('teacher');
 h.state.addRecent({type:'chapter',id:ch,title:'Un chapitre',href:'#chapter/'+ch});
 h.state.addFavorite({type:'chapter',id:ch,title:'Un chapitre',href:'#chapter/'+ch});
 h.state.setTools({starters:{minutes:7}});
 h.click('[data-td="export"]');
 const file=h.saved[0];assert.equal(file.name,STATE_FILE);
 const before=JSON.parse(file.text);assert.equal(before.course,'premiere');assert.equal(before.chapter,ch);
 // clear needs a confirmation that says the class is forgotten
 h.click('[data-td="clear-ask"]');
 assert.match(h.$('.td-confirm').textContent,/classe choisie/);
 h.click('[data-td="clear-no"]');assert.equal(h.$('.td-confirm'),null);assert.equal(h.state.getClassroom().course,'premiere');
 h.click('[data-td="clear-ask"]');h.click('[data-td="clear-yes"]');
 assert.equal(h.state.getClassroom().course,'','the class is forgotten too');
 assert.equal(h.state.getEntry(),'');assert.deepEqual(h.state.getRecent(),[]);assert.equal(h.$('#td-class').value,'');
 assert.match(h.$('#td-message').textContent,/effacé/);
 // import the file
 const input=h.$('#td-import');
 Object.defineProperty(input,'files',{value:[Object.assign(new h.window.File([file.text],'x.json'),{text:async()=>file.text})],configurable:true});
 input.dispatchEvent(new h.window.Event('change',{bubbles:true}));
 await tick();
 assert.deepEqual(h.state.exportState(),before,'round trip is exact');
 assert.equal(h.$('#td-class').value,'premiere');assert.equal(h.$('#td-chapter').value,ch);
 assert.match(h.$('#td-message').textContent,/Importé/);
 // garbage changes nothing
 const bad=h.$('#td-import');
 Object.defineProperty(bad,'files',{value:[Object.assign(new h.window.File(['{not json'],'y.json'),{text:async()=>'{not json'})],configurable:true});
 bad.dispatchEvent(new h.window.Event('change',{bubbles:true}));await tick();
 assert.deepEqual(h.state.exportState(),before);assert.match(h.$('#td-message').textContent,/non reconnu/);
});

test('English labels render and the teacher module does not leak a French-only string key',async()=>{
 const dom=new JSDOM('<main id="main"></main>',{url:'https://example.test/'});
 const state=createTeacherState(dom.window),main=dom.window.document.querySelector('main');
 await mountTeacherDashboard(main,{t:p=>p[1],state,decks:[],download(){}});
 assert.match(main.querySelector('h1').textContent,/In class/);
 assert.ok(!/undefined|NaN/.test(main.textContent));
 assert.ok(!/[–—]/.test(main.textContent),'no em or en dashes in copy');
});

test('one-click timed starters: link to the launch route, remembered defaults, no forced values',async()=>{
 const h=await setup();
 const go=h.$('.lp-grid a.lp-tile');assert.equal(go.getAttribute('href'),'#automatismes/go','the first tile is the one-click timed series');assert.equal(h.$('a.td-go'),null,'no duplicate launch button');assert.ok(isLiveHash('#automatismes/go'));
 assert.match(h.$('#td-timed-sum').textContent,/5 min/,'default duration shown');
 h.change(h.$('#td-class'),'premiere');
 assert.match(h.$('#td-timed-sum').textContent,/Première/,'the class of the device is named');
 h.change(h.$('#td-auto-minutes'),'8');h.change(h.$('#td-auto-count'),'12');h.change(h.$('#td-auto-seed'),'keep');
 assert.deepEqual(h.state.getTools().automatismes,{minutes:8,count:12,seedPolicy:'keep'});
 assert.match(h.$('#td-timed-sum').textContent,/8 min.*12.*même série/);
 assert.ok(h.$('details.td-settings[open]'),'the settings stay open while editing');
 h.change(h.$('#td-auto-minutes'),'999');assert.equal(h.state.getTools().automatismes.minutes,60,'bounded');
 // persisted for the next visit on this device
 await h.stop();const h2=await setup({win:h.window});
 assert.equal(h2.$('#td-auto-minutes').value,'60');assert.equal(h2.$('#td-auto-seed').value,'keep');
 h2.click('[data-td="export"]');assert.equal(JSON.parse(h2.saved[0].text).tools.automatismes.seedPolicy,'keep','exported with the rest');
});

test('one-click starters with storage blocked still show defaults',async()=>{
 const h=await setup({blocked:true});
 assert.ok(h.$('.lp-grid a.lp-tile'));h.change(h.$('#td-auto-minutes'),'7');
 assert.equal(h.$('#td-auto-minutes').value,'7','held in memory for the session');
});

test('one screen: first-screen elements present, secondary areas folded, removed sections gone',async()=>{
 const h=await setup();
 h.change(h.$('#td-class'),'seconde');h.change(h.$('#td-chapter'),'seconde-01');
 const top=[...h.main.children];
 const has=sel=>top.some(n=>n.matches(sel)||n.querySelector(sel));
 assert.ok(has('#td-class')&&has('#td-chapter'),'class and chapter selects');
 assert.equal(h.$$('.lp-grid>li').length,7,'seven tiles');
 assert.deepEqual(h.$$('.lp-grid .lp-n').map(n=>n.textContent),['1','2','3','4','5','6','7'],'in session order');
 assert.ok(top.some(n=>n.classList.contains('lp-seance')),'Ma séance strip is top level');
 for(const sel of ['.td-recent','.td-settings']){const d=h.$(sel);assert.ok(d&&d.tagName==='DETAILS'&&!d.open,sel+' is a collapsed disclosure');assert.ok(top.includes(d));}
 for(const id of ['td-entry-h','td-data-h','td-timed-h'])assert.ok(h.$('.td-settings #'+id),id+' moved into the settings');
 for(const id of ['td-rec-h','td-fav-h'])assert.ok(h.$('.td-recent #'+id),id+' moved into the recent disclosure');
 for(const n of top)assert.ok(!n.matches('.td-entry,.td-timed,.td-search,.td-columns')&&n.id!=='td-search-slot','no secondary section at top level');
 assert.equal(h.$('#td-search-slot'),null,'search lives in the header only');
 assert.ok(!/Par activité|By activity|Automatismes en un clic/.test(h.main.textContent),'removed sections stay removed');
 assert.ok(!/[–—]/.test(h.main.textContent));
});
