import test from 'node:test';
import assert from 'node:assert/strict';
import {rng} from '../site/js/exercises/engine.js';
import {COMPETENCES, COMPETENCE_STARTERS, starterCompetence} from '../site/js/exercises/starter-competences.js';
import {TEMPLATES, CLASSES, buildStarter} from '../site/js/exercises/bank.js';
import {VISUAL_STARTERS} from '../site/js/exercises/starter-visual.js';
import {starterHtml, starterTex, projectionHtml} from '../site/js/exercises/export.js';

// These five labels are internal metadata. The sixth maths competency (communiquer)
// belongs to other activities, not to short automatisms.
test('five competencies are represented in every class, without pupil-facing labels', () => {
  assert.deepEqual(COMPETENCES,['chercher','modeliser','representer','raisonner','calculer']);
  assert.equal(COMPETENCE_STARTERS.length,40);
  assert.equal(new Set(COMPETENCE_STARTERS.map(x=>x.id)).size,40);
  const combined=[...TEMPLATES,...VISUAL_STARTERS,...COMPETENCE_STARTERS];
  assert.equal(new Set(combined.map(x=>x.id)).size,combined.length);
  for(const c of CLASSES) {
    const topics=COMPETENCE_STARTERS.filter(t=>t.cls===c.id);
    assert.equal(topics.length,8,c.id);
    for(const type of COMPETENCES) assert(topics.some(t=>t.competence===type),`${c.id}: missing ${type}`);
  }
  for(const t of combined) assert(COMPETENCES.includes(starterCompetence(t)),`unclassified ${t.id}`);
});

test('new starters have deterministic, varied, exact results without explanations', () => {
  for(const t of COMPETENCE_STARTERS){
    const variants=new Set();
    for(let i=0;i<200;i++){
      const x=t.make(rng(`${t.id}|${i}`),1),y=t.make(rng(`${t.id}|${i}`),1);
      assert.deepEqual([x.q,x.a],[y.q,y.a],t.id);
      assert.ok(x.ok(),`${t.id}, seed ${i}: ${x.q} => ${x.a}`);
      assert.doesNotMatch(x.q,/justifi|démontr|prouv|expliqu/i,t.id);
      assert.doesNotMatch(x.q+x.a,/undefined|NaN|Infinity|x--|\+\-|-\+/i,t.id);
      assert.equal((x.q.match(/\\\(/g)||[]).length,(x.q.match(/\\\)/g)||[]).length,t.id);
      variants.add(x.q);
    }
    assert.ok(variants.size>=20,`${t.id}: only ${variants.size} distinct questions`);
  }
});

test('unrestricted series substantially balance the five competencies and preserve seeded reproducibility',()=>{
  for(const c of CLASSES)for(let k=0;k<20;k++){
    const input={cls:c.id,count:10,minutes:5,seed:`competences-${k}`};
    const a=buildStarter(input),b=buildStarter(input);
    assert.deepEqual(a,b);
    const count=Object.fromEntries(COMPETENCES.map(c=>[c,0]));
    for(const it of a.items){
      count[it.competence]++;
      assert.doesNotMatch(it.q,/justifi|démontr|prouv|expliqu/i);
    }
    for(const type of COMPETENCES) assert.ok(count[type]>=1,`${c.id}: ${type} not present`);
    assert.ok(a.items.filter(it=>it.figure).length>=2,`${c.id}: loss of graphical questions`);
  }
});

test('chapter and domain filters always take precedence over balancing',()=>{
  const chosen=buildStarter({cls:'expertes',chapters:['expertes-06'],count:10,seed:'modular'});
  assert.ok(chosen.items.every(x=>x.chapter==='expertes-06'));
  const data=buildStarter({cls:'stmg',domains:['stats-proba'],count:10,seed:'stmg-data'});
  assert.ok(data.items.every(x=>x.domain==='stats-proba'));
  const single=buildStarter({cls:'premiere',chapters:['premiere-09'],count:10,seed:'exp'});
  assert.ok(single.items.every(x=>x.chapter==='premiere-09'));
});
test('all exports preserve questions while hiding internal competency metadata',()=>{
  for(const cls of CLASSES) {
    const doc=buildStarter({cls:cls.id,count:10,minutes:5,seed:'export-competences'});
    const output=[starterHtml(doc),starterHtml(doc,{teacher:true}),starterTex(doc),starterTex(doc,{version:'teacher'}),projectionHtml(doc)];
    for(const markup of output) {
      assert.doesNotMatch(markup,/Compétences visées|compétence\s*:/i);
      assert.doesNotMatch(markup,/Justifier la réponse|Démontrer votre réponse/i);
    }
    assert.match(output[2],/\\begin\{document\}/);
    assert.match(output[4],/application\/json/);
  }
});
