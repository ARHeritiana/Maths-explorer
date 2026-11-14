import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {currentCourse,rememberCourse} from '../site/js/navigation-state.js';
import {FULL_EDITION} from '../site/js/live-curriculum.js';
import {organizePage} from '../site/js/page-ergonomics.js';
import {withEntryNav} from '../site/js/entry-nav.js';
import {sheetsPage} from '../site/js/worksheets.js';
import {automatismesPage} from '../site/js/automatismes.js';
const t=x=>x[0];
test('the selected class carries between sections, while invalid data and blocked storage are safe',()=>{
 const dom=new JSDOM('',{url:'https://example.test/'}),win=dom.window;let events=0;
 win.addEventListener('mx-course-change',()=>events++);
 assert.equal(currentCourse('',win),'');rememberCourse('premiere',win);
 assert.equal(currentCourse('',win),'premiere');assert.equal(win.sessionStorage.getItem('mx-course'),'premiere');
 rememberCourse('premiere',win);assert.equal(events,1,'one notification per actual change');
 rememberCourse(FULL_EDITION?'zz':'t11s',win);assert.equal(currentCourse('',win),'premiere','classes that are not live do not reappear');
 rememberCourse('seconde',win);assert.equal(currentCourse('',win),'seconde');
 Object.defineProperty(win,'localStorage',{get(){throw new Error('blocked')}});
 assert.equal(currentCourse('',win),'seconde');rememberCourse('stmg',win);assert.equal(currentCourse('',win),'stmg');
 Object.defineProperty(win,'sessionStorage',{get(){throw new Error('blocked')}});
 assert.equal(currentCourse('expertes',win),'expertes');assert.doesNotThrow(()=>rememberCourse('premiere',win));dom.window.close();
});
for(const kind of ['sheet','starter'])test(`optional ${kind} settings retain real controls and their values`,()=>{
 const html=kind==='sheet'?sheetsPage(t):automatismesPage(t,(fr)=>fr),dom=new JSDOM(html),root=dom.window.document.querySelector('main');
 const form=root.querySelector('form'),seed=form.elements.seed;seed.value='same-series';
 const nodes=[...form.elements],exports=[...root.querySelectorAll('[data-act]')];let clicks=0;
 exports.at(-1).addEventListener('click',()=>clicks++);
 const stop=organizePage(root,t);
 assert.equal(form.elements.seed,seed);assert.equal(seed.value,'same-series');
 for(const node of nodes)assert.ok(root.contains(node),'controls are moved, never replaced');
 for(const node of exports)assert.ok(root.contains(node));exports.at(-1).click();assert.equal(clicks,1);
 assert.equal(form.elements.cls.closest('.advanced-settings'),null);
 assert.equal(form.elements.count.closest('.advanced-settings'),null);
 assert.equal(seed.closest('.advanced-settings'),null,'series code remains visible');
 assert.equal(root.querySelector('#gen-new').closest('details'),null,'new random variant remains visible');
 assert.ok(root.querySelector('[data-act="print-student"]:not(details *)'));
 if(kind==='sheet'){
  assert.equal(root.querySelector('[data-subject="A"]').hidden,true,'single subject has no redundant selector');
  root.querySelector('[data-subject="B"]').hidden=false;form.dispatchEvent(new dom.window.Event('change'));
  assert.equal(root.querySelector('[data-subject="A"]').hidden,false);
 }
 stop();dom.window.close();
});
test('a collection has usable previous/next links and retains its complete chooser',()=>{
 const items=Array.from({length:60},(_,i)=>({id:String(i),href:'#stories/'+i,title:['Idée '+i,'Idea '+i]}));
 const html=withEntryNav('<main id="main"></main>',{t,label:['Histoires','Stories'],title:['Les histoires','Stories'],groups:[{label:null,items}],current:'29'});
 const dom=new JSDOM(html),d=dom.window.document;
 assert.equal(d.querySelector('[rel="prev"]').getAttribute('href'),'#stories/28');assert.equal(d.querySelector('[rel="next"]').getAttribute('href'),'#stories/30');
 assert.equal(d.querySelector('.entry-chooser').open,false);assert.equal(d.querySelectorAll('.lab-link').length,60);
 assert.equal(d.querySelector('[aria-current="page"]').getAttribute('href'),'#stories/29');dom.window.close();
});
