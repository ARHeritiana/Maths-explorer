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
 assert.ok(PEOPLE.length>=75&&ADVANCES.length>=50);
 for(const list of [PEOPLE,ADVANCES])assert.equal(list.length,new Set(list.map(x=>x.id)).size);
 for(const item of [...PEOPLE,...ADVANCES]){
  assert.ok(Number.isInteger(item.start));assert.ok(item.end===null||Number.isInteger(item.end)&&item.end>=item.start);
  assert.equal(new URL(item.source).protocol,'https:');assert.ok(item.summary.every(s=>s&&!/[–—]/.test(s)));
  for(const topic of item.topics)assert.ok(membershipByKey(topic),topic);
 }
 for(const person of PEOPLE){assert.ok(person.context.every(Boolean));assert.ok(['lifetime','documentary'].includes(person.dateType));}
 for(const event of ADVANCES){assert.ok(DATE_KINDS[event.kind]);for(const id of event.people)assert.ok(PEOPLE.some(p=>p.id===id),id);}
 assert.equal(historyRecord('unknown','galois'),null);
 assert.equal(dateLabel(PEOPLE.find(p=>p.id==='wolecki'),'en'),'Documents: 2019 / 2024');
 assert.match(dateLabel(PEOPLE.find(p=>p.id==='euclid'),'en'),/^c\. .*BCE/);
});
test('Galois drafts, letter and publication are distinct dates and myth claims remain qualified',()=>{
 const events=personEvents('galois');assert.deepEqual(events.map(e=>[e.id,e.start,e.kind]),[['galois-memoir',1831,'document'],['galois-letter',1832,'document'],['galois-publication',1846,'publication']]);
 assert.ok(GALOIS_BIOGRAPHY.sources.some(([url])=>url.includes('JMPA_1846')));
 assert.match(JSON.stringify(GALOIS_BIOGRAPHY),/ne prouve pas|does not show/);assert.match(JSON.stringify(GALOIS_BIOGRAPHY),/restent discutés|remain disputed/);
});
test('new resource timelines use documented publication or version dates rather than invented lifespans',()=>{
 const dated={ferguson:1989,ruggles:1947,brodie:1947,selvin:1975,hatcher:2002,siegrist:2022,'schettini-gherardini':2026,benford:1938,may:1976,gerver:1992,domokos:2006,varkonyi:2006,'goodman-strauss':2023};
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
