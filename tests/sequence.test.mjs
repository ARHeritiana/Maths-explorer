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
