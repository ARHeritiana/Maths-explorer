// Fractions foundation: independent arithmetic, guided answers and keyboard regressions.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {FULL_EDITION} from '../site/js/live-curriculum.js';
const french=readFileSync(new URL('../site/resources/basics/fractions.html',import.meta.url),'utf8');
function page(source=french){
 const dom=new JSDOM(source,{runScripts:'outside-only',url:'https://example.test/resources/basics/fractions.html'});
 const w=dom.window;w.HTMLElement.prototype.scrollIntoView=()=>{};
 for(const [,script] of source.matchAll(/<script>([\s\S]*?)<\/script>/g))w.eval(script);
 return {w,doc:w.document,api:w.MXFractionsTest,close:()=>w.close()};
}
const english=readFileSync(new URL('../site/resources/basics/fractions.en.html',import.meta.url),'utf8');
const scripts=html=>[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
// The full edition serves the named pages with its own name (build/mxbuild/site.py edition_text).
const EDITION=JSON.parse(readFileSync(new URL('../content/data/edition.json',import.meta.url),'utf8'));
const served=html=>FULL_EDITION?html.split(EDITION.name.limited).join(EDITION.name.full):html;
const withoutText=html=>scripts(html).replace(/\/\/ TEXT-BEGIN[\s\S]*?\/\/ TEXT-END/,'');
test('both fractions editions have identical engines, table keys and published sources',()=>{
 assert.equal(withoutText(french),withoutText(english));
 const table=s=>JSON.parse(s.match(/const T = (\{[\s\S]*?\});\n\/\/ TEXT-END/)[1]);
 assert.deepEqual(Object.keys(table(french)),Object.keys(table(english)));
 for(const [lang,html] of [['fr',french],['en',english]]){
  assert.equal(readFileSync(new URL('../dist/resources/basics/fractions'+(lang==='en'?'.en':'')+'.html',import.meta.url),'utf8'),served(html));
  assert.match(html,new RegExp('<html lang="'+lang+'"'));assert.doesNotMatch(html,/<script[^>]+src=|https?:\/\/|[—–]/);
 }
 const app=readFileSync(new URL('../site/js/basics-page.js',import.meta.url),'utf8');
 assert.match(app,/L\("fractions", \["Le laboratoire des fractions", "The fractions lab"\]/);
 assert.match(app,/id: "fractions"/);
});
for(const [lang,html] of [['fr',french],['en',english]]){
const check=(name,fn)=>test(name+' ('+lang+')',fn);

check('fraction arithmetic agrees with independent cross-products, including zero and negative results',()=>{
 const P=page(html);try{
 for(let d=1;d<=12;d++)for(let e=1;e<=12;e++)for(const n of [0,1,d,3*d])for(const m of [0,1,e,3*e]){
  const a={n,d},b={n:m,d:e};
  for(const [op,num,den] of [['add',n*e+m*d,d*e],['sub',n*e-m*d,d*e],['mul',n*m,d*e]]){
   const r=P.api[op](a,b);assert.equal(r.n*den,num*r.d,op);assert.ok(r.d>0);
  }
  const q=P.api.div(a,b);if(m===0)assert.equal(q,null);else assert.equal(q.n*d*m,n*e*q.d);
 }
 assert.equal(P.api.normalizeAnswer('1/0'),null);
 assert.equal(P.api.normalizeAnswer('<svg>'),null);
 assert.deepEqual(JSON.parse(JSON.stringify(P.api.normalizeAnswer('0,75'))),{n:3,d:4});
 }finally{P.close()}
});
check('all activities mount; steppers retain keyboard focus and SVG End stays within the displayed scale',()=>{
 const P=page(html);try{
 for(const tab of P.doc.querySelectorAll('[data-mode]')){tab.click();assert.equal(tab.getAttribute('aria-selected'),'true');assert.ok(P.doc.querySelector('#plot').children.length>0,tab.dataset.mode);}
 P.doc.querySelector('[data-mode="build"]').click();
 let plus=P.doc.querySelector('[data-step="a:n:1"]');plus.focus();plus.click();
 assert.equal(P.doc.activeElement.dataset.step,'a:n:1');
 const svg=P.doc.querySelector('[data-editbar]');const max=+svg.dataset.units;
 svg.dispatchEvent(new P.w.KeyboardEvent('keydown',{key:'End',bubbles:true}));
 const state=P.api.getState();assert.equal(state.a.n/state.a.d,max);
 assert.equal(+P.doc.querySelector('[data-editbar]').getAttribute('aria-valuenow'),max);
 }finally{P.close()}
});
check('six guided challenges accept equivalent fractions, reject mistakes and unlock progression',()=>{
 const P=page(html);try{
 P.doc.querySelector('[data-mode="guided"]').click();
 const numerator=P.doc.querySelector('#num_a');numerator.value='3';numerator.dispatchEvent(new P.w.Event('change',{bubbles:true}));
 P.doc.querySelector('[data-action="checkLesson"]').click();assert.equal(P.api.getState().done.length,1);
 const answers=['2/4','<','6/8','6/12','12/2'];
 for(const answer of answers){
  P.doc.querySelector('[data-action="nextLesson"]').click();
  const input=P.doc.querySelector('#lessonAnswer');input.value='999';input.dispatchEvent(new P.w.Event('input',{bubbles:true}));
  P.doc.querySelector('[data-action="checkLesson"]').click();assert.equal(P.api.getState().feedbackGood,false);
  const again=P.doc.querySelector('#lessonAnswer');again.value=answer;again.dispatchEvent(new P.w.Event('input',{bubbles:true}));
  P.doc.querySelector('[data-action="checkLesson"]').click();assert.equal(P.api.getState().feedbackGood,true,answer);
 }
 assert.equal(P.api.getState().done.length,6);
 }finally{P.close()}
});

check('fine common partitions and large quotients retain exact diagram scales',()=>{
 const P=page(html);try{
 P.doc.querySelector('[data-mode="operations"]').click();
 const set=(id,value)=>{const el=P.doc.getElementById(id);el.value=String(value);el.dispatchEvent(new P.w.Event('change',{bubbles:true}));};
 set('den_a',11);set('num_a',1);set('den_b',12);set('num_b',1);
 P.doc.querySelector('[data-action="compose"]').click();
 const colored=P.doc.querySelectorAll('[data-dropzone] svg rect[fill="var(--accent)"]');
 assert.equal(colored.length,12,'one eleventh is exactly twelve 132nds');
 const blue=P.doc.querySelectorAll('[data-dropzone] svg rect[fill="var(--blue)"]');
 assert.equal(blue.length,11,'one twelfth is exactly eleven 132nds');
 set('den_a',1);set('num_a',3);set('den_b',12);set('num_b',1);
 P.doc.querySelector('[data-choice="op:÷"]').click();
 const line=P.doc.querySelector('.line-svg');
 assert.ok([...line.querySelectorAll('.tick-label')].some(t=>t.textContent==='36'));
 const result=[...line.querySelectorAll('text')].find(t=>t.textContent===(lang==='en'?'Result':'Résultat'));
 assert.equal(+result.getAttribute('x'),902,'the quotient 36 reaches the true endpoint');
 }finally{P.close()}
});

}

test('English text, feedback and accessibility labels stay English in every activity',()=>{
 const P=page(english);try{
 const verify=()=>{
  const body=P.doc.body.cloneNode(true);body.querySelectorAll('script,style').forEach(el=>el.remove());
  const text=P.doc.title+' '+body.textContent+' '+[...P.doc.querySelectorAll('[aria-label],[title],[placeholder]')].map(el=>['aria-label','title','placeholder'].map(a=>el.getAttribute(a)||'').join(' ')).join(' ');
  assert.doesNotMatch(text,/[àâäéèêëîïôöùûüç]|\b(?:de|sur|somme|objets|une|des|vrai|faux|oui|non|et|les|du|un|pour|fois)\b/i);
 };
 for(const tab of P.doc.querySelectorAll('[data-mode]')){tab.click();verify();}
 P.doc.querySelector('[data-mode="build"]').click();
 P.doc.querySelector('[data-preset="a:1:2"]').click();
 assert.match(P.doc.querySelector('#readout').textContent,/0\.5/,'English decimals use a dot');
 P.doc.querySelector('[data-mode="operations"]').click();
 for(const op of ['+','−','×','÷']){P.doc.querySelector('[data-choice="op:'+op+'"]').click();verify();}
 P.doc.querySelector('[data-mode="errors"]').click();
 for(let i=0;i<8;i++){
  P.doc.querySelector('[data-action="revealError"]').click();P.doc.querySelector('[data-error-choice="false"]').click();verify();
  P.doc.querySelector('[data-action="nextError"]').click();
 }
 P.doc.querySelector('[data-mode="guided"]').click();
 for(let i=0;i<6;i++){
  P.doc.querySelector('[data-lesson="'+i+'"]').click();P.doc.querySelector('[data-action="hintLesson"]').click();
  P.doc.querySelector('[data-action="checkLesson"]').click();verify();
 }
 }finally{P.close()}
});
