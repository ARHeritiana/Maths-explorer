import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const read = p => readFile(new URL(p,import.meta.url),'utf8');
const lessons={
 'place-value':['Place value as grouping','La numération par regroupements'],
 addition:['Addition as grouping','Addition et retenues'],
 subtraction:['Subtraction as ungrouping','Soustraction et emprunts'],
 multiplication:['Multiplication as grouping','Multiplication par regroupements'],
 division:['Division as sharing','Division par partage']
};
test('Foundations iframe follows website language',async()=>{
 const app=await read('../dist/js/app.js');
 assert.ok(app.includes('lesson.id+(lang==="en"?".en":"")'));
 assert.ok(app.includes('<iframe id="basics-frame" lang='));
});
for(const [id,[enTitle,frTitle]] of Object.entries(lessons)){
 test(id+' both language editions are published and integrated',async()=>{
  const [en,fr,sen,sfr]=await Promise.all([
   read('../dist/resources/basics/'+id+'.en.html'),
   read('../dist/resources/basics/'+id+'.html'),
   read('../site/resources/basics/'+id+'.en.html'),
   read('../site/resources/basics/'+id+'.html')
  ]);
  assert.equal(en,sen); assert.equal(fr,sfr);
  assert.match(en,/<html lang="en">/);assert.match(fr,/<html lang="fr">/);
  assert.ok(en.includes(enTitle));assert.ok(fr.includes(frTitle));assert.ok(!en.includes(frTitle));
  assert.ok(en.includes('mx-basics-size')&&en.includes('ResizeObserver'));
  assert.ok(en.includes('../../fonts/'));assert.ok(!en.includes('fonts.googleapis.com'));
  assert.ok(en.includes('prefers-reduced-motion'));
 });
}
for(const id of ['addition','subtraction']){
 test(id+' English arithmetic agrees with exact integer arithmetic in bases 2 to 16',async()=>{
  const html=await read('../dist/resources/basics/'+id+'.en.html');
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  const setup=script.slice(0,script.indexOf("$('step').onclick"));
  assert.ok(setup.includes('S.auto'));
  for(const B of [2,3,5,8,10,12,16])
   for(const [A,Z] of [[0,0],[1,1],[478,256],[1000,1],[9999,9999],[B**3,1],[3210,1234]]){
    if(id==='subtraction'&&Z>A)continue;
    const code=setup+';S.B='+B+';S.A='+A+';S.Z='+Z+';reset();JSON.stringify(S.st)';
    const steps=JSON.parse(runInNewContext(code));
    const actual=steps.reduce((total,s)=>total+s.r*B**s.p,0);
    assert.equal(actual,id==='addition'?A+Z:A-Z);
   }
 });
}

test('multiplication and division are reachable in the foundations progression',async()=>{
 const app=await read('../dist/js/app.js');
 for(const [id,num] of [['multiplication','04'],['division','05']]){
  assert.ok(app.includes('r.id === "'+id+'"'));
  assert.ok(app.includes('id: "'+id+'", number: "'+num+'"'));
  assert.ok(app.includes('#basics/'+id));
 }
});
test('new lesson sources retain the arithmetic models and animations',async()=>{
 for(const id of ['multiplication','division']){
  const html=await read('../dist/resources/basics/'+id+'.en.html');
  assert.ok(html.includes('function reset()'));
  assert.ok(html.includes('requestAnimationFrame'));
  assert.ok(html.includes('function notifySize()'));
  assert.ok(html.includes("document.fonts?.ready.then(notifySize)"));
  assert.ok(html.includes('const S='));
  assert.ok(!html.includes('fonts.googleapis.com'));
 }
});

test('multiplication explains regrouping hundreds into thousands',async()=>{
 const en=await read('../dist/resources/basics/multiplication.en.html');
 const fr=await read('../dist/resources/basics/multiplication.html');
 assert.ok(en.includes("['units','tens','hundreds','thousands']"));
 assert.ok(fr.includes("['unités','dizaines','centaines','milliers']"));
});
