// Schema, chronology, dates and linked views tested independently of the assembled site.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {PEOPLE,ADVANCES,DATE_KINDS,dateLabel,queryHistory,historyLinks,historyRecord,personEvents} from '../site/js/history-data.js';
import {historyPage,bindHistory,isHistoryRoute} from '../site/js/history.js';
import {membershipByKey} from '../site/js/topic-registry.js';
import {buildDiscoveryIndex,topicCounts} from '../site/js/discovery-index.js';
import {GALOIS_BIOGRAPHY} from '../site/js/reading-history-content.js';
const t=p=>p[0];
test('historical records have typed dates, sources, context and resolving people',()=>{
 assert.ok(PEOPLE.length===56&&ADVANCES.length>=50);
 for(const list of [PEOPLE,ADVANCES])assert.equal(list.length,new Set(list.map(x=>x.id)).size);
 for(const item of [...PEOPLE,...ADVANCES]){
  assert.ok(Number.isInteger(item.start));assert.ok(item.end===null||Number.isInteger(item.end)&&item.end>=item.start);
  assert.equal(new URL(item.source).protocol,'https:');assert.ok(item.summary.every(s=>s&&!/[–—]/.test(s)));
  for(const topic of item.topics)assert.ok(membershipByKey(topic),topic);
 }
 for(const person of PEOPLE){assert.ok(person.context.every(Boolean));assert.ok(['lifetime','documentary'].includes(person.dateType));}
 for(const event of ADVANCES){assert.ok(DATE_KINDS[event.kind]);for(const id of event.people)assert.ok(PEOPLE.some(p=>p.id===id),id);for(const name of event.credits)assert.match(name,/^\p{Lu}/u,'plain-text credit, not a mistyped id: '+name);}
 // People not shown in the people timeline stay credited by name in the advances timeline.
 for(const id of ['ahmes','buffon','gerver','smith','schettini-gherardini','plato'])assert.ok(!PEOPLE.some(p=>p.id===id),id);
 assert.deepEqual(ADVANCES.find(e=>e.id==='hat').credits,['David Smith','Joseph Samuel Myers','Craig S. Kaplan','Chaim Goodman-Strauss']);
 assert.deepEqual(ADVANCES.find(e=>e.id==='gerver-sofa').credits,['Joseph Gerver','John Hammersley']);
 assert.deepEqual(ADVANCES.find(e=>e.id==='illumination-rational').people,['mirzakhani']);
 assert.equal(historyRecord('unknown','galois'),null);
 assert.equal(dateLabel(PEOPLE.find(p=>p.id==='may'),'en'),'Documents: 1976');
 assert.match(dateLabel(PEOPLE.find(p=>p.id==='euclid'),'en'),/^c\. .*BCE/);
});
test('Galois drafts, letter and publication are distinct dates and myth claims remain qualified',()=>{
 const events=personEvents('galois');assert.deepEqual(events.map(e=>[e.id,e.start,e.kind]),[['galois-memoir',1831,'document'],['galois-letter',1832,'document'],['galois-publication',1846,'publication']]);
 assert.ok(GALOIS_BIOGRAPHY.sources.some(([url])=>url.includes('JMPA_1846')));
 assert.match(JSON.stringify(GALOIS_BIOGRAPHY),/ne prouve pas|does not show/);assert.match(JSON.stringify(GALOIS_BIOGRAPHY),/restent discutés|remain disputed/);
});
test('new resource timelines use documented publication or version dates rather than invented lifespans',()=>{
 const dated={may:1976};
 for(const [id,date]of Object.entries(dated)){const p=PEOPLE.find(p=>p.id===id);assert.ok(p,id);assert.equal(p.start,date);assert.equal(p.end,date);assert.equal(p.dateType,'documentary');}
 for(const [event,route]of [['tank-statistical-study','#lab/tank'],['monty-letters','#lab/monty'],['secretary-survey','#lab/secretary'],['degree-topology-textbook','#lab/hairy-ball'],['birthday-online-exposition','#lab/birthdays'],['certified-polyhedral-gomboc','#gallery/gomboc']]){const e=ADVANCES.find(e=>e.id===event);assert.ok(e&&e.links.includes(route));assert.ok(['publication','document','preprint'].includes(e.kind));}
 assert.equal(ADVANCES.find(e=>e.id==='birthday-online-exposition').kind,'document');
});

test('timeline query sorts numerically, intersects intervals and searches accent-insensitively',()=>{
 const all=queryHistory('people');assert.ok(all.every((p,i)=>!i||all[i-1].start<=p.start));
 assert.deepEqual(queryHistory('people',{query:'evariste'}).map(p=>p.id),['galois']);
 assert.ok(queryHistory('people',{from:1830,to:1831}).some(p=>p.id==='galois'));
 assert.ok(!queryHistory('people',{from:1833,to:1840}).some(p=>p.id==='galois'));
 assert.deepEqual(queryHistory('advances',{from:1846,to:1846,query:'galois'}).map(p=>p.id),['galois-publication']);
 assert.ok(queryHistory('people',{topic:'algebra'}).some(p=>p.id==='galois'));
});
test('people and developments are reciprocal canonical discovery records',()=>{
 const index=buildDiscoveryIndex({people:PEOPLE,advances:ADVANCES,biographies:[GALOIS_BIOGRAPHY]});
 assert.equal(index.length,PEOPLE.length+ADVANCES.length+1);
 const p=index.find(x=>x.route==='#history/people/galois'),e=index.find(x=>x.route==='#history/advances/galois-publication');
 assert.ok(p.related.includes(e.route)&&e.related.includes(p.route));
 assert.ok(e.related.includes('#biographies/galois'));
 assert.equal(topicCounts(index).history,index.length);
 for(const item of [...PEOPLE,...ADVANCES])for(const route of historyLinks(PEOPLE.includes(item)?'people':'advances',item))if(route.startsWith('#history/')){const [,kind,id]=route.slice(1).split('/');assert.ok(historyRecord(kind,id),route);}
});
test('timeline DOM supports search, date errors, reset, detail routes and cleanup',()=>{
 const dom=new JSDOM(historyPage('people',undefined,t)),root=dom.window.document.querySelector('main'),stop=bindHistory(root,'people',t);
 const form=root.querySelector('form'),count=root.querySelector('#history-count');
 assert.match(count.textContent,new RegExp(String(PEOPLE.length)));
 form.elements.query.value='Évariste';form.dispatchEvent(new dom.window.Event('input'));assert.equal(root.querySelectorAll('.history-list>li').length,1);assert.match(root.querySelector('.history-list').textContent,/Galois/);
 form.elements.from.value='2000';form.elements.to.value='1800';form.dispatchEvent(new dom.window.Event('input'));assert.match(count.textContent,/première année/);
 form.dispatchEvent(new dom.window.Event('reset'));assert.equal(root.querySelectorAll('.history-list>li').length,PEOPLE.length);
 stop();form.elements.query.value='nonexistent';form.dispatchEvent(new dom.window.Event('input'));assert.equal(root.querySelectorAll('.history-list>li').length,PEOPLE.length);
 for(const kind of ['people','advances']){assert.ok(isHistoryRoute(kind));assert.ok(!isHistoryRoute(kind,'missing'));}
 assert.match(historyPage('advances','galois-publication',p=>p[1]),/Edition of Galois/);
 assert.ok(isHistoryRoute()&&!isHistoryRoute('missing'));
});

test('atlas time is continuous and strictly increasing across period boundaries',async()=>{
 const {HISTORY_ERAS,timePosition}=await import('../site/js/history-layout.js');
 assert.equal(timePosition(-1800),0);
 let previous=-1;
 for(let y=-1800;y<=2026;y++) {const x=timePosition(y);assert.ok(x>previous,`year ${y}`);previous=x;}
 let sum=0;
 for(const era of HISTORY_ERAS){assert.equal(timePosition(era.from),sum);sum+=era.width;assert.equal(timePosition(era.to),sum);}
 assert.equal(timePosition(2026,1.6),sum*1.6);
});
test('atlas lanes keep both cards and complete lifetime bars disjoint at every scale',async()=>{
 const {timelineLayout,timePosition}=await import('../site/js/history-layout.js');
 for(const zoom of [.7,1,1.6,3.2])for(const list of [PEOPLE,ADVANCES]){
  const {placed,width}=timelineLayout(list,zoom);
  assert.equal(placed.length,list.length);
  const lanes=new Map();
  for(const p of placed){
   assert.equal(p.end,timePosition(p.item.end??2026,zoom));
   const right=Math.max(p.x+184,p.item.dateType==='lifetime'?p.end:p.x);
   assert.ok(p.x>=(lanes.get(p.lane)??-16)+16,`${p.item.id}: lane collision`);
   assert.ok(right<=width,`${p.item.id}: clipped endpoint`);
   lanes.set(p.lane,right);
  }
 }
 // Documentary spans must not be visually treated as lifetimes.
 const a=PEOPLE.find(p=>p.id==='may');
 assert.equal(a.dateType,'documentary');
});
test('image register uses local, bounded assets with explicit reusable licences and full attribution',async()=>{
 const {HISTORY_IMAGES}=await import('../site/js/history-images.js');
 const {statSync}=await import('node:fs');
 assert.ok(Object.keys(HISTORY_IMAGES).length>=35);
 let bytes=0;
 for(const [id,img]of Object.entries(HISTORY_IMAGES)){
  assert.ok(historyRecord('people',id)||historyRecord('advances',id),id);
  assert.match(img.src,/^\.\/data\/history\/[a-z-]+\.webp$/);
  assert.ok(img.width<=480&&img.height<=600);
  assert.match(img.license,/^(?:Public domain|CC0|CC BY(?:-SA)? [1-4]\.0(?: de)?)$/);
  assert.equal(new URL(img.source).hostname,'commons.wikimedia.org');
  assert.equal(new URL(img.licenseUrl).hostname,'creativecommons.org');
  assert.ok(img.creator&&img.title&&img.original&&img.retrieved);
  bytes+=statSync(new URL('../site/'+img.src.slice(2),import.meta.url)).size;
  const kind=historyRecord('people',id)?'people':'advances';
  const markup=historyPage(kind,id,p=>p[1]);
  const doc=new JSDOM(markup).window.document,credit=doc.querySelector('.history-credit');
  assert.ok(credit&&credit.textContent.includes(img.license),id);
  const clean=x=>x.replace(/[–—]/g,'-').replace(/Unknown authorUnknown author/g,'Unknown author');
  if(img.credit)assert.ok(credit.textContent.includes(clean(img.credit)),id+': institutional credit');
  assert.ok(!/[–—]/.test(doc.body.textContent),id+': visible punctuation');
 }
 assert.ok(bytes<2_000_000,'complete image collection stays below 2 MB');
});
test('atlas view, era jumps, scale, empty recovery and documentary markers work through DOM events',()=>{
 const dom=new JSDOM(historyPage('people',undefined,t)),root=dom.window.document.querySelector('main'),stop=bindHistory(root,'people',t);
 const event=name=>new dom.window.Event(name,{bubbles:true});
 const viewport=root.querySelector('#history-viewport');
 assert.equal(root.querySelectorAll('.history-node').length,PEOPLE.length);
 assert.equal(root.querySelector('[data-history-id="may"] .history-lifetime'),null);
 assert.ok(root.querySelector('[data-history-id="may"] .history-document-marker'));
 root.querySelector('button[data-history-view="list"]').click();assert.equal(root.dataset.historyView,'list');
 root.querySelector('button[data-history-view="atlas"]').click();assert.equal(root.dataset.historyView,'atlas');
 root.querySelector('[data-history-era="today"]').click();assert.ok(viewport.scrollLeft>4000);
 const before=viewport.scrollLeft,scale=root.querySelector('#history-zoom');scale.value='1.6';scale.dispatchEvent(event('change'));assert.equal(viewport.scrollLeft,before*1.6);
 const form=root.querySelector('form');form.elements.query.value='no-such-mathematician';form.dispatchEvent(event('input'));
 assert.ok(root.classList.contains('history-no-results'));assert.ok(root.querySelector('[data-history-reset]'));
 root.querySelector('[data-history-reset]').click();assert.equal(root.querySelectorAll('.history-list>li').length,PEOPLE.length);
 stop();const left=viewport.scrollLeft;root.querySelector('[data-history-era="today"]').click();assert.equal(viewport.scrollLeft,left,'listeners cleaned up');
});
