import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createTeacherState} from '../dist/js/teacher-state.js';
import {mountPreparePage} from '../dist/js/prepare-page.js';
import {isLiveHash} from '../dist/js/live-curriculum.js';

const DECKS=[{id:'seconde-01',course:'seconde',editions:{fr:{}}}];
const tick=()=>new Promise(r=>setTimeout(r,20));
const setup=async({lang=0,win}={})=>{
 const dom=win?null:new JSDOM('<main id="main"></main>',{url:'https://example.test/#prepare'});
 const window=win||dom.window,state=createTeacherState(window),main=window.document.querySelector('#main');
 const stop=await mountPreparePage(main,{t:p=>p[lang],state,decks:DECKS});
 const $=s=>main.querySelector(s),$$=s=>[...main.querySelectorAll(s)];
 const change=(el,v)=>{if(v!==undefined)el.value=v;el.dispatchEvent(new window.Event('change',{bubbles:true}));};
 const type=async v=>{const q=$('#pp-q');q.value=v;q.dispatchEvent(new window.Event('input',{bubbles:true}));for(let i=0;i<100&&!$('.pp-result')&&!/Aucun/.test($('#pp-status').textContent);i++)await tick();};
 return {window,state,main,stop,$,$$,change,type};
};

test('page: sections in order, shared class and chapter, chapter sheet adds blocks',async()=>{
 const h=await setup();
 assert.deepEqual(h.$$('h1,h2').map(x=>x.textContent),['Préparer','Fiche du chapitre','Chercher une ressource','Ma séance','Évaluer']);
 h.change(h.$('#pp-class'),'seconde');assert.equal(h.state.getClassroom().course,'seconde');
 const ch=h.$$('#pp-chapter option')[1].value;h.change(h.$('#pp-chapter'),ch);assert.equal(h.state.getClassroom().chapter,ch);
 assert.equal(h.$$('.pp-phase').length,7);
 const adds=h.$$('[data-pp="add-phase"]');assert.ok(adds.length>=4);
 adds[0].click();adds[1].click();
 assert.equal(h.state.getSeance().blocks.length,2,'saved at once');
 assert.equal(h.$$('.pp-block').length,2);
 assert.ok(h.$('#pp-live').textContent.startsWith('Ajouté'));
 h.stop();
});
test('builder: keyboard move, minutes, print toggle and warning, remove, clear, standard, persistence',async()=>{
 const h=await setup();
 h.change(h.$('#pp-class'),'seconde');h.change(h.$('#pp-chapter'),h.$$('#pp-chapter option')[1].value);
 h.$('[data-pp="standard"]').click();
 const n=h.state.getSeance().blocks.length;assert.ok(n>=4);
 const ids=h.state.getSeance().blocks.map(b=>b.id);
 assert.equal(h.$('[data-pp="up"]'),null,'no up/down buttons');assert.equal(h.$('[data-pp="down"]'),null);
 assert.equal(h.$$('.pp-grip').length,n,'one grip per block');
 const key=(el,k)=>el.dispatchEvent(new h.window.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
 key(h.$$('.pp-grip')[0],'ArrowUp');assert.deepEqual(h.state.getSeance().blocks.map(b=>b.id),ids,'first block cannot go up');
 key(h.$$('.pp-grip')[0],'ArrowDown');
 assert.deepEqual(h.state.getSeance().blocks.map(b=>b.id).slice(0,2),[ids[1],ids[0]]);
 assert.ok(h.$('#pp-live').textContent.includes('position 2 sur'),'announced');
 const active=h.window.document.activeElement;
 assert.equal(active.dataset.ppGrip,ids[0],'focus stays on the moved block grip');
 key(active,'ArrowUp');assert.deepEqual(h.state.getSeance().blocks.map(b=>b.id).slice(0,2),ids.slice(0,2));
 key(h.$$('.pp-grip')[n-1],'ArrowDown');assert.deepEqual(h.state.getSeance().blocks.map(b=>b.id),ids,'last block cannot go down');
 assert.ok(h.$$('.pp-print input').every(c=>c.type==='checkbox'),'print control is a real checkbox');
 assert.ok(h.$('.pp-print').textContent.startsWith('Imprimer'));
 h.change(h.$('[data-pp-min]'),'200');assert.equal(h.state.getSeance().blocks[0].minutes,90,'clamped to 90');
 h.change(h.$('[data-pp-min]'),'10');assert.equal(h.state.getSeance().blocks[0].minutes,10);
 assert.ok(h.$('.pp-total').textContent.includes('sur 55'));assert.ok(h.$('meter'));
 for(let i=0;i<4;i++){h.change(h.$$('[data-pp-print]')[i]);if(i<3)assert.equal(h.$('.pp-warn'),null,'no warning at '+(i+1));}
 assert.equal(h.state.getSeance().blocks.filter(b=>b.print).length,4);
 assert.ok(h.$('.pp-warn').textContent.includes('Beaucoup de papier'));
 assert.ok(h.$('.pp-print-count').textContent.includes('Imprimer avec modération : chaque fiche cochée est comptée'));
 assert.ok(h.$('.pp-print-list').textContent.startsWith('À imprimer'));
 h.stop();const h2=await setup({win:h.window});
 assert.equal(h2.$$('.pp-block').length,n);assert.equal(h2.$$('[data-pp-print]:checked').length,4);
 h2.$('[data-pp="remove"]').click();assert.equal(h2.state.getSeance().blocks.length,n-1);
 h2.$('[data-pp="clear"]').click();assert.equal(h2.state.getSeance().blocks.length,0);
 assert.equal(h2.$('[data-pp="clear"]').disabled,true);
 h2.$('#pp-launch').addEventListener('click',e=>e.preventDefault());
 h2.$('#pp-launch').click();assert.equal(h2.$('#pp-launch').getAttribute('href'),'#teacher');assert.equal(h2.state.getMode(),'classe');
 h2.stop();
});
test('search adds a result with a phase defaulting from its type',async()=>{
 const h=await setup();
 await h.type('second degré');
 assert.ok(h.$$('.pp-result').length>0,'results');
 const first=h.$('[data-pp="add-result"]'),sel=h.$(`[data-pp-phase="${first.dataset.id}"]`);
 assert.ok(sel&&sel.value);
 h.change(sel,'bilan');first.click();
 const b=h.state.getSeance().blocks.at(-1);assert.equal(b.phase,'bilan');assert.equal(b.resourceId,first.dataset.id);
 await h.type('zzzzqx');assert.ok(h.$('#pp-status').textContent.includes('Aucun'));
 h.stop();
});
test('Évaluer links are live routes only; English labels',async()=>{
 const h=await setup({lang:1});
 assert.deepEqual(h.$$('h1,h2').map(x=>x.textContent),['Prepare','Chapter sheet','Find a resource','My séance','Assess']);
 const links=h.$$('#pp-eval a').map(a=>a.getAttribute('href'));assert.ok(links.length>0);assert.ok(links.every(isLiveHash));
 assert.ok(h.$('.pp-print-count').textContent.includes('Print in moderation'));
 assert.equal(h.$('[data-pp="standard"]').textContent,'Standard séance');
 h.stop();
});
