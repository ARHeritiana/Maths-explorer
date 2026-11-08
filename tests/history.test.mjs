// Schema, chronology, dates and linked views tested independently of the assembled site.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {PEOPLE,ADVANCES,DATE_KINDS,dateLabel,queryHistory,historyLinks,historyRecord,personEvents} from '../site/js/history-data.js';
import {historyPage,bindHistory,isHistoryRoute,mathematiciansTimelineUrl} from '../site/js/history.js';
import {membershipByKey} from '../site/js/topic-registry.js';
import {buildDiscoveryIndex,topicCounts} from '../site/js/discovery-index.js';
import {GALOIS_BIOGRAPHY} from '../site/js/reading-history-content.js';
const t=p=>p[0];
test('historical records have typed dates, sources, context and resolving people',()=>{
 assert.ok(PEOPLE.length===69&&ADVANCES.length>=50);
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
 assert.deepEqual(ADVANCES.find(e=>e.id==='gerver-sofa').credits,['Joseph Gerver']);assert.deepEqual(ADVANCES.find(e=>e.id==='gerver-sofa').people,['hammersley']);
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
test('the people timeline has a dedicated document, while advances keep native search',()=>{
 const url=mathematiciansTimelineUrl('fr');
 assert.ok(url.includes('mathematicians-timeline.html?lang=fr&bios='));
 const page=new JSDOM(historyPage('people',undefined,t)).window.document;
 assert.equal(page.querySelector('iframe'),null);
 assert.equal(page.querySelector('main a[href^="./resources/history/"]').getAttribute('href'),url);
 const dom=new JSDOM(historyPage('advances',undefined,t));
 const root=dom.window.document.querySelector('main'),stop=bindHistory(root,'advances',t);
 const form=root.querySelector('form');
 form.elements.query.value='galois';form.dispatchEvent(new dom.window.Event('input'));
 assert.ok(root.querySelectorAll('.history-list>li').length>=1);
 form.elements.from.value='2000';form.elements.to.value='1800';form.dispatchEvent(new dom.window.Event('input'));
 assert.match(root.querySelector('#history-count').textContent,/première année/);
 form.dispatchEvent(new dom.window.Event('reset'));
 assert.equal(root.querySelectorAll('.history-list>li').length,ADVANCES.length);
 stop();
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
 const dom=new JSDOM(historyPage('advances',undefined,t)),root=dom.window.document.querySelector('main'),stop=bindHistory(root,'advances',t);
 const event=name=>new dom.window.Event(name,{bubbles:true});
 const viewport=root.querySelector('#history-viewport');
 assert.equal(root.querySelectorAll('.history-node').length,ADVANCES.length);
 assert.equal(root.querySelector('[data-history-id="monty-letters"] .history-lifetime'),null);
 assert.ok(root.querySelector('[data-history-id="monty-letters"] .history-document-marker'));
 root.querySelector('button[data-history-view="list"]').click();assert.equal(root.dataset.historyView,'list');
 root.querySelector('button[data-history-view="atlas"]').click();assert.equal(root.dataset.historyView,'atlas');
 root.querySelector('[data-history-era="today"]').click();assert.ok(viewport.scrollLeft>4000);
 const before=viewport.scrollLeft,scale=root.querySelector('#history-zoom');scale.value='1.6';scale.dispatchEvent(event('change'));assert.equal(viewport.scrollLeft,before*1.6);
 const form=root.querySelector('form');form.elements.query.value='no-such-mathematician';form.dispatchEvent(event('input'));
 assert.ok(root.classList.contains('history-no-results'));assert.ok(root.querySelector('[data-history-reset]'));
 root.querySelector('[data-history-reset]').click();assert.equal(root.querySelectorAll('.history-list>li').length,ADVANCES.length);
 stop();const left=viewport.scrollLeft;root.querySelector('[data-history-era="today"]').click();assert.equal(viewport.scrollLeft,left,'listeners cleaned up');
});

// Issue #16: major questions and results, dated against MacTutor, the Clay Institute and the journal pages.
test('major questions and results of #16 are dated, typed and sourced',()=>{
 const expected={'kepler-packing':[1611,'conjecture'],'fermat-last-note':[1630,'conjecture'],'euler-basel':[1735,'proof'],'goldbach-conjecture':[1742,'conjecture'],
  'wessel-plane':[1799,'publication'],'gauss-fundamental-algebra':[1799,'proof'],'cauchy-cours':[1821,'publication'],'non-euclidean':[1829,'publication'],
  'hamilton-quaternions':[1843,'discovery'],'boole-laws':[1854,'publication'],'riemann-hypothesis':[1859,'conjecture'],'dedekind-cuts':[1872,'publication'],
  'cantor-uncountable':[1874,'proof'],'lindemann-pi':[1882,'proof'],'prime-number-theorem':[1896,'proof'],'hilbert-problems':[1900,'conjecture'],
  'lebesgue-integral':[1902,'publication'],'poincare-conjecture':[1904,'conjecture'],'zermelo-choice':[1904,'proof'],'godel-incompleteness':[1931,'publication'],
  'kolmogorov-axioms':[1933,'publication'],'godel-consistency':[1940,'proof'],'cohen-independence':[1963,'proof'],'wiles-fermat':[1995,'proof'],
  'perelman-preprints':[2002,'preprint'],'hales-kepler-formal':[2017,'proof']};
 for(const [id,[year,kind]] of Object.entries(expected)){
  const e=ADVANCES.find(x=>x.id===id);assert.ok(e,id);assert.equal(e.start,year,id);assert.equal(e.kind,kind,id);
  assert.match(e.source,/^https:\/\/(mathshistory\.st-andrews\.ac\.uk|www\.claymath\.org|arxiv\.org|doi\.org)\//,id);
  assert.ok(e.summary.every(s=>s.length>60&&!/VERIFY/.test(s)),id);
  for(const route of e.links.filter(r=>r.startsWith('#history/')))assert.ok(historyRecord(...route.slice(9).split('/')),route);
 }
 // Open questions are not called solved; the solved ones point to their question and back.
 for(const id of ['riemann-hypothesis','goldbach-conjecture'])assert.match(ADVANCES.find(x=>x.id===id).summary[1],/open/);
 for(const [q,a] of [['fermat-last-note','wiles-fermat'],['poincare-conjecture','perelman-preprints'],['kepler-packing','hales-kepler-formal']]){
  assert.ok(ADVANCES.find(x=>x.id===q).links.includes('#history/advances/'+a));assert.ok(ADVANCES.find(x=>x.id===a).links.includes('#history/advances/'+q));
 }
 // Authors on the people timeline (issue #15) are linked as people; the others stay credited by name.
 for(const [event,id] of [['riemann-hypothesis','riemann'],['cantor-uncountable','cantor'],['godel-incompleteness','godel'],['godel-consistency','godel'],['cohen-independence','godel'],['wiles-fermat','wiles'],['dedekind-cuts','dedekind'],['lebesgue-integral','lebesgue'],['kolmogorov-axioms','kolmogorov']])assert.ok(ADVANCES.find(e=>e.id===event).people.includes(id),event);
 assert.ok(ADVANCES.find(e=>e.id==='perelman-preprints').credits.includes('Grigori Perelman'));
});

// Issue #15: every person with a full biography links to it, and the biography links back to the timeline entry.
test('people with a full biography and their biographies link both ways',async()=>{
 const {BIOGRAPHY_PEOPLE}=await import('../site/js/history-data.js');
 const {BIOGRAPHIES}=await import('../site/js/reading-content.js');
 const {MAJOR_BIOGRAPHIES}=await import('../site/js/biographies-major.js');
 const ids=new Set(BIOGRAPHIES.map(b=>b.id));
 for(const id of BIOGRAPHY_PEOPLE){
  const p=PEOPLE.find(x=>x.id===id);assert.ok(p,`person ${id}`);assert.ok(ids.has(id),`biography ${id}`);
  assert.ok(p.links.includes('#biographies/'+id),id);assert.ok(BIOGRAPHIES.find(b=>b.id===id).links.includes('#history/people/'+id),id);
 }
 for(const b of BIOGRAPHIES)if(PEOPLE.some(p=>p.id===b.id))assert.ok(BIOGRAPHY_PEOPLE.has(b.id),`${b.id} missing from BIOGRAPHY_PEOPLE`);
 // Generated biographies: dates agree with the timeline, sources over https, no markdown or straight quote, facts in order.
 for(const b of MAJOR_BIOGRAPHIES){
  const p=PEOPLE.find(x=>x.id===b.id);assert.ok(p,b.id);
  const years=(b.dates.match(/\d{3,4}/g)||[]).map(Number);assert.equal(years[0],Math.abs(p.start),b.id);if(p.end!==null)assert.equal(years[1],Math.abs(p.end),b.id);
  const text=JSON.stringify([b.dek,b.sections,b.facts]);assert.ok(!/[*'–—]/.test(text),b.id);
  assert.ok(b.sources.length&&b.sources.every(([u])=>u.startsWith('https://')),b.id);
  assert.ok(b.facts.length>=2,b.id);
 }
});

test('standalone timeline provides site navigation and a shared theme',()=>{
 const html=readFileSync(new URL('../site/resources/history/mathematicians-timeline.html',import.meta.url),'utf8');
 const doc=new JSDOM(html).window.document;
 const links=[...doc.querySelectorAll('.topbar a, .subnav a')].map(x=>x.getAttribute('href'));
 for(const destination of ['../../index.html#home','../../index.html#resources','../../index.html#topics','../../index.html#biographies','../../index.html#history/advances'])
  assert.ok(links.includes(destination),destination);
 assert.equal(doc.querySelector('link[href="../../styles/explorer.css"]')?.getAttribute('rel'),'stylesheet');
 assert.equal(doc.querySelector('link[href="../../styles/pages.css"]')?.getAttribute('rel'),'stylesheet');
 assert.equal(doc.querySelector('link[href="../../styles/timeline-standalone.css"]')?.getAttribute('rel'),'stylesheet');
 assert.equal(doc.querySelectorAll('.topbar .mainnav a').length,3);
 assert.equal(doc.querySelectorAll('.subnav a[aria-current="page"]').length,1);
 assert.equal(doc.querySelectorAll('[data-timeline-lang]').length,2);
 assert.equal(doc.querySelector('.topbar .brand')?.getAttribute('href'),'../../index.html#home');
 assert.equal(doc.querySelectorAll('.subnav a[href="../../index.html#home"]').length,0);
 assert.match(html,/laneH=mobile\?\(short\?48:52\):\(short\?50:56\)/);
 assert.match(html,/surface\.style\.height=Math\.max/);
 assert.doesNotMatch(html,/laneH=mobile\?\(short\?23:/);
 assert.ok(doc.querySelector('#timeline-theme'));
 assert.match(html,/localStorage\.getItem\('maths-explorer-theme'\)/);
 assert.match(html,/localStorage\.setItem\('maths-explorer-theme',theme\)/);
 const sharedStyles=readFileSync(new URL('../site/styles/explorer.css',import.meta.url),'utf8');
 assert.match(sharedStyles,/:root\[data-theme="nuit"\]/);
 assert.match(sharedStyles,/:root\[data-theme="jour"\]/);
});

test('standalone timeline shows each year only on the single time axis',()=>{
 const root=new URL('../site/',import.meta.url);
 const html=readFileSync(new URL('resources/history/mathematicians-timeline.html',root),'utf8');
 const css=readFileSync(new URL('styles/timeline-standalone.css',root),'utf8');
 assert.doesNotMatch(html,/node\('small','',g,fmt\(e\.start\)\)/);
 assert.match(html,/node\('span','axis-label',axis,fmt\(year\)\)/);
 assert.match(css,/\.century::after,\.century\.quiet::after\{content:none!important\}/);
 assert.match(css,/\.era-marker\{[^}]*border:0/);
 assert.match(css,/\.era-marker small\{display:none!important\}/);
});
