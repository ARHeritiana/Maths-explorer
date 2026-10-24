// Discovery invariants use source modules and independent registry fixtures.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS,membershipByKey,membershipsFor} from '../site/js/topic-registry.js';
import {buildDiscoveryIndex,filterDiscovery,topicCounts,recommendations} from '../site/js/discovery-index.js';
import {previewKind,modelPreview} from '../site/js/discovery-previews.js';
import {previewSVG,discoveryPage,discoveryCards,bindDiscovery} from '../site/js/discovery.js';
import {labs} from '../site/js/content.js';
import {JSDOM} from 'jsdom';
const P=s=>[s,s];
const data={labs:[{id:'quadratic',title:P('Parabola'),level:P('Intermediate')},{id:'buffon',title:P('Buffon needle'),topics:['geometry/plane','probability/experiments']}],
  chapters:[{id:'premiere-02',topic:'quadratic',title:P('Quadratic functions'),course:'premiere',labs:['quadratic/vertex']}],
  challenges:[{id:'knights',title:P('Knight tour'),difficulty:3}],
  biographies:[{id:'gauss',name:'Gauss',links:['#lab/quadratic','#challenges/knights']}],
  stories:[{id:'gauss-story',title:P('An anecdote'),who:'gauss'}]};
test('taxonomy covers distinct fields and every stable key resolves',()=>{
  assert.deepEqual(TOPICS.map(t=>t.id),['arithmetic','algebra','analysis','geometry','topology','probability','statistics','discrete','dynamics','foundations','history']);
  for(const topic of TOPICS) {
    assert.ok(topic.subtopics.length>=2);
    for(const sub of topic.subtopics)assert.equal(membershipByKey(`${topic.id}/${sub.id}`).subtopic,sub);
  }
  assert.equal(membershipByKey('geometry/unknown'),null);
  assert.throws(()=>membershipsFor({topics:['geometry/unknown']}),/Unknown/);
});
test('canonical records are cross-listed once and counts never count duplicate memberships',()=>{
  const index=buildDiscoveryIndex(data), q=index.find(x=>x.route==='#lab/quadratic');
  assert.ok(q.memberships.includes('algebra/equations'));
  assert.ok(q.memberships.includes('analysis/functions'));
  const duplicated=buildDiscoveryIndex({...data,labs:[...data.labs,data.labs[0]]});
  assert.equal(duplicated.length,index.length);
  assert.deepEqual(topicCounts(duplicated),topicCounts(index));
  assert.equal(filterDiscovery(index,{topic:'probability'}).length,1);
  assert.equal(filterDiscovery(index,{topic:'geometry',subtopic:'plane'}).length,1);
});
test('existing explicit relationships become reciprocal canonical recommendations',()=>{
  const index=buildDiscoveryIndex(data);
  assert.ok(index.find(x=>x.route==='#lab/quadratic').related.includes('#chapter/premiere-02'));
  assert.ok(index.find(x=>x.route==='#chapter/premiere-02').related.includes('#lab/quadratic'));
  assert.ok(index.find(x=>x.route==='#biographies/gauss').memberships.includes('algebra/equations'));
  assert.ok(index.find(x=>x.route==='#biographies/gauss').related.includes('#stories/gauss-story'));
  assert.ok(recommendations(index,'#lab/quadratic').some(x=>x.route==='#chapter/premiere-02'));
  for(const item of index)for(const route of item.related) {
    assert.ok(index.some(x=>x.route===route));
    assert.ok(index.find(x=>x.route===route).related.includes(item.route));
  }
});
test('story and chapter links survive added author and curriculum relationships',()=>{
  const index=buildDiscoveryIndex({...data,
    stories:[{id:'linked-story',title:P('A mathematical argument'),who:'gauss',links:['#lab/buffon']}],
    chapters:[{...data.chapters[0],links:['#challenges/knights']}]});
  const related=route=>index.find(item=>item.route===route).related;
  for(const [from,to] of [
    ['#stories/linked-story','#lab/buffon'],
    ['#stories/linked-story','#biographies/gauss'],
    ['#chapter/premiere-02','#challenges/knights'],
    ['#chapter/premiere-02','#lab/quadratic']
  ]) {
    assert.ok(related(from).includes(to),`${from} keeps ${to}`);
    assert.ok(related(to).includes(from),`${to} links back to ${from}`);
  }
});
test('formal readings keep canonical routes and mathematical memberships with a lesson badge',()=>{
  const index=buildDiscoveryIndex({...data,stories:[{id:'model-proof',kind:'lesson',title:P('A model and its proof'),links:['#lab/buffon']}]});
  const lesson=index.find(item=>item.route==='#stories/model-proof');
  assert.equal(lesson.format,'lesson');
  assert.ok(lesson.memberships.includes('geometry/plane'));
  assert.ok(lesson.related.includes('#lab/buffon'));
  const dom=new JSDOM(discoveryCards([lesson],pair=>pair[1]));
  assert.match(dom.window.document.querySelector('.section-kicker').textContent,/^Lesson · /);
  assert.equal(dom.window.document.querySelector('h2 a').getAttribute('href'),'#stories/model-proof');
  dom.window.close();
});
test('adding and removing content rebuilds links, results and counts without stale entries',()=>{
  const initial=buildDiscoveryIndex(data);
  const changed=buildDiscoveryIndex({...data,labs:[data.labs[1],{id:'custom',title:P('New surface'),topics:['topology/surfaces'],links:['#lab/buffon','#lab/removed']} ]});
  assert.equal(changed.some(x=>x.route==='#lab/quadratic'),false);
  assert.ok(changed.every(x=>!x.related.includes('#lab/quadratic')));
  assert.equal(topicCounts(changed).topology,topicCounts(initial).topology+1);
  assert.deepEqual(changed.find(x=>x.route==='#lab/custom').related,['#lab/buffon']);
});
test('search is accent-insensitive and composes with format, level and membership filters',()=>{
  const index=buildDiscoveryIndex({...data,labs:[...data.labs,{id:'new',title:['Équations de courbes','Curve equations'],topics:['algebra/equations'],level:P('Advanced')} ]});
  assert.deepEqual(filterDiscovery(index,{query:'equations courbes',format:'lab',level:'Advanced',topic:'algebra'}).map(x=>x.route),['#lab/new']);
  assert.equal(filterDiscovery(index,{query:'equations courbes',format:'challenge'}).length,0);
});
test('the rendered format selector offers PDF and filters actual chapter resources',()=>{
  const index=buildDiscoveryIndex({...data,chapters:[{...data.chapters[0],files:[{kind:'notes'}]}]});
  const t=pair=>pair[1],dom=new JSDOM(discoveryPage(index,'','',t)),root=dom.window.document;
  const cleanup=bindDiscovery(root,index,'','',t),select=root.querySelector('select[name="format"]');
  assert.ok(select.querySelector('option[value="pdf"]'));
  select.value='pdf';select.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  const links=[...root.querySelectorAll('#discovery-results h2 a')].map(a=>a.getAttribute('href'));
  assert.deepEqual(links,['#chapter/premiere-02']);
  assert.equal(root.querySelector('#discovery-count').textContent,'1 resources');
  cleanup();dom.window.close();
});
const item=(id,format='lab',extra={})=>({route:`#${format==='gallery'?'gallery':'lab'}/${id}`,format,title:P(id),...extra});
test('every current lab and gallery has its named mathematical preview, including all gallery aliases',()=>{
  for(const lab of labs){
    const entry=item(lab.id,lab.custom?'gallery':'lab'),kind=previewKind(entry);
    assert.notEqual(kind,'reading',lab.id);
    const preview=modelPreview(kind);
    assert.ok(preview?.drawing.length>50,lab.id);
    assert.ok(preview.caption.length===2&&preview.caption.every(Boolean),lab.id);
  }
  for(const id of ['secretary','tank','benford','baker','birthdays','monty','double-pendulum','three-body','logistic','fair-division','fair-goods','hairy-ball','nonorientable-surfaces']){
    assert.equal(previewSVG(item(id),p=>p[1]),previewSVG(item(`${id}-gallery`,'gallery'),p=>p[1]),id);
  }
  assert.equal(previewKind(item('mirrored-rooms','gallery')),'illumination');
  assert.equal(previewKind(item('banach-tarski-gallery','gallery')),'banach-tarski-model');
});
test('chapter previews use exact mathematical concepts, never a broad field emblem',()=>{
  const chapter={route:'#chapter/new-chapter',format:'chapter',title:P('New chapter'),memberships:['probability/experiments']};
  assert.equal(previewKind({...chapter,concepts:['derivative','functions']}),'derivative');
  assert.equal(previewKind({...chapter,concepts:['conditional','experiments']}),'conditioning');
  assert.equal(previewKind({...chapter,concepts:['modular','integers']}),'modular');
  assert.equal(previewKind({...chapter,concepts:['an-unrecognised-model']}),'reading');
  assert.equal(previewKind({...chapter,concepts:['review','space','iteration','reasoning']}),'reading');
  const fallback=previewSVG({...chapter,concepts:[],title:P('<Uncatalogued>')},p=>p[1]);
  assert.match(fallback,/&lt;Uncatalogued&gt;/);
  assert.doesNotMatch(fallback,/<svg|Field emblem|Repère visuel/);
});
test('previews remain finite, bounded static SVGs with bilingual captions and no animation or asset requests',()=>{
  const kinds=new Set(labs.map(l=>previewKind(item(l.id,l.custom?'gallery':'lab'))));
  for(const kind of kinds)for(const language of [0,1]){
    const html=previewSVG(item(kind),p=>p[language]),dom=new JSDOM(html),svg=dom.window.document.querySelector('svg');
    assert.ok(svg,kind);assert.equal(svg.getAttribute('viewBox'),'0 0 160 100');
    assert.equal(svg.getAttribute('aria-hidden'),'true');
    assert.doesNotMatch(html,/NaN|Infinity|undefined|<animate|<canvas|<image|<script|onload=|—|–/,kind);
    assert.ok(svg.querySelectorAll('*').length<1000,kind);
    assert.ok(dom.window.document.querySelector('figcaption').textContent.length>5,kind);
    dom.window.close();
  }
  assert.match(previewSVG({...item('numbers'),format:'chapter',concepts:['logic']},p=>p[1]),/4 is even/);
  assert.doesNotMatch(previewSVG({...item('numbers'),format:'chapter',concepts:['logic']},p=>p[1]),/est pair/);
  assert.match(previewSVG({...item('numbers'),format:'chapter',concepts:['percentages']},p=>p[1]),/100 × 1\.1 = 110/);
});
test('plotted geometry agrees with independent analytical benchmarks',()=>{
  const documentFor=kind=>new JSDOM(previewSVG(item(kind),p=>p[1])).window.document;
  const derivative=documentFor('derivative'),lines=[...derivative.querySelectorAll('path')].map(x=>x.getAttribute('d'));
  assert.ok(lines.includes('M94,84 L145,33'),'unit-slope screen tangent passes through (112,66)');
  assert.ok(derivative.querySelector('circle[cx="112"][cy="66"]'));
  const bars=[...documentFor('probability').querySelectorAll('rect')];
  assert.equal(bars.length,11);
  assert.ok(Math.abs(bars.reduce((s,b)=>s+Number(b.getAttribute('height')),0)-230)<1e-9,'binomial masses sum to one');
  const pendulum=documentFor('double-pendulum'),rods=pendulum.querySelectorAll('path')[1].getAttribute('d').match(/[-\d.]+/g).map(Number);
  for(let i=2;i<rods.length;i+=2)assert.ok(Math.abs(Math.hypot(rods[i]-rods[i-2],rods[i+1]-rods[i-1])-35)<.002,'each rod has unit physical length');
  const graph=documentFor('graphs');assert.equal(graph.querySelectorAll('circle').length,4);assert.equal(graph.querySelectorAll('path').length,5);
});
