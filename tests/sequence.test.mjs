import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sequenceModel,goalFields} from '../site/js/sequence-model.js';
const directory=new URL('../dist/slides/data/',import.meta.url);
test('chapter progression retains the authored mathematics and task answers',()=>{
 for(const file of fs.readdirSync(directory).filter(p=>p.endsWith('.json')&&p!=='index.json')){
  const deck=JSON.parse(fs.readFileSync(new URL(file,directory)));
  const model=sequenceModel(deck);
  assert.ok(model.lessons.length,deck.id);
  const statements=model.lessons.flatMap(l=>l.statements);
  const examples=model.lessons.flatMap(l=>l.examples);
  for(const s of deck.slides){
   if(['concept','method','proof','code'].includes(s.k))assert.ok(statements.includes(s),deck.id+' missing statement');
   if(s.k==='example')assert.ok(examples.includes(s),deck.id+' missing example');
   if(s.k==='activity'||s.k==='widget')assert.ok(model.activities.some(a=>a.b===s.b),deck.id+' missing activity');
   if(s.k==='try')assert.ok([...model.tasks,...model.diagnostics,...model.checks].some(a=>a.b===s.b&&a.a===s.a),deck.id+' missing task');
  }
 }
});
test('objectives keep chapter-specific content while omitting source-calendar dates',()=>{
 const fields=goalFields([{t:['Plan','Plan'],b:['<b>Objectifs.</b> Résoudre une équation.<br><br><b>Prérequis.</b> Produit nul.<br><br><b>Repère annuel.</b> Septembre','']}],0);
 assert.deepEqual(fields.map(f=>f.label),['Objectifs','Prérequis']);
 assert.equal(goalFields([{t:['Objectifs','Goals'],b:['Calculer une limite.','Compute a limit.']}],1)[0].body,'Compute a limit.');
});

test('practice never converts unverified worked examples into standalone exercises', () => {
 const example={k:'example',t:['Notion','Idea'],b:['Compléter.','Complete.'],a:['Résultat.','Answer.']};
 const m=sequenceModel({id:'another-chapter',slides:[{k:'title'},example]});
 assert.equal(m.tasks.length,0);
 assert.equal(m.lessons[0].examples.length,1);
});

test('interval and Python practice restores omitted data in both languages', () => {
 const deck=JSON.parse(fs.readFileSync(new URL('../dist/slides/data/seconde-04.json',import.meta.url)));
 const m=sequenceModel(deck);
 const table=m.tasks.find(s=>s.b.some(b=>b?.includes('intervalCases') || b?.includes('<ol>')));
 assert.ok(table, 'a standalone intervals exercise is needed');
 for(const L of [0,1]){
  assert.match(table.b[L], /<li>/, 'each available language needs the interval pairs');
  assert.match(table.a[L], /<li>/, 'solutions must contain the five interval results');
  assert.equal((table.b[L].match(/<li>/g)||[]).length,5);
  assert.equal((table.a[L].match(/<li>/g)||[]).length,5);
 }
 const program=m.tasks.find(s=>s.b.some(b=>b?.includes('def encadre_racine2(p):')));
 assert.ok(program, 'the Python question must include the full function');
 assert.ok(m.lessons.flatMap(s=>s.examples).includes(program)===false, 'practice is a distinct record');
 for(const L of [0,1])assert.match(program.b[L], /return k\/q/);
});
