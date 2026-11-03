// Original exam-type additions must use the existing bank, worksheet and export contracts.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {authoredExams} from '../site/js/exercises/authored-exams.js';
import {AUTHORED,buildSheet} from '../site/js/exercises/bank.js';
import {sheetTex,sheetHtml,html} from '../site/js/exercises/export.js';
import {bankPage,bankCount} from '../dist/js/bank-page.js';

test('24 original exam problems share 84 complete question/solution pairs with the existing bank',()=>{
  assert.equal(authoredExams.length,24);
  assert.equal(authoredExams.reduce((n,e)=>n+e.parts.length,0),84);
  for(const prefix of ['eam','e3c','bac'])assert.equal(authoredExams.filter(e=>e.id.startsWith('exam-'+prefix+'-')).length,8);
  for(const e of authoredExams){
    assert.ok(AUTHORED.includes(e),e.id);
    assert.ok(e.ok(),e.id);
    assert.ok(e.skills.length>=3 && e.skills.length<=4,e.id);
    assert.equal(new Set(e.skills).size,e.skills.length,e.id);
    assert.ok(e.skills.every(skill=>skill.endsWith('.')),e.id);
    assert.ok(e.parts.some(p=>p.hint),e.id);
    assert.ok(e.parts.every(p=>p.q&&p.a&&p.w>0),e.id);
    for(const s of [e.intro,...e.parts.flatMap(p=>[p.q,p.a,p.hint])])assert.doesNotMatch(s,/<\/?(?:pre|code)>|undefined|NaN/);
    const doc={kind:'sheet',minutes:e.minutes,exercises:[e]};
    const student=sheetTex(doc),teacher=sheetTex(doc,{version:'teacher'});
    assert.ok(student.includes('\\begin{document}'));
    assert.ok(teacher.includes('\\begin{mdframed}'));
    assert.doesNotMatch(teacher,/<pre>|<code>/);
    for(const output of [student,teacher,sheetHtml(doc),sheetHtml(doc,{teacher:true})]) {
      assert.doesNotMatch(output,/Compétences visées|Type\s+(?:Bac|E3C|EAM)/);
      assert.doesNotMatch(output,/class="exercise-skills"/);
    }
  }
});
test('new problems appear in chapter bank cards, with folded corrections and Python that exports',()=>{
  for(const cls of ['premiere','terminale']){
    for(const e of authoredExams.filter(e=>e.cls===cls)){
      const chapter=e.chapters[0];
      const dom=new JSDOM(bankPage(p=>p[0],cls,chapter));
      const card=dom.window.document.querySelector(`[data-ex="${e.id}"]`);
      assert.ok(card,e.id);
      assert.equal(card.querySelectorAll('.bank-sol').length,e.parts.length);
      assert.equal(card.querySelectorAll('details[open]').length,0);
      assert.doesNotMatch(card.textContent,/Compétences visées|Type\s+(?:Bac|E3C|EAM)/);
      assert.equal(card.querySelector('.exercise-skills'),null);
      assert.ok(card.querySelector('.bank-intro'));
      assert.ok(bankCount(chapter)>=1);
      dom.window.close();
    }
  }
  for(const id of ['exam-eam-05','exam-e3c-01','exam-e3c-02']){
    const e=authoredExams.find(e=>e.id===id),answer=e.parts.at(-1).a;
    assert.match(answer,/\\begin\{array\}/);
    assert.doesNotMatch(html(answer),/&lt;pre|&lt;code/);
  }
});
test('worksheet composition can select every new exam problem without a separate catalogue',()=>{
  const seen=new Set();
  for(const cls of ['premiere','terminale'])for(let n=0;n<120;n++){
    const sheet=buildSheet({cls,kind:'devoir',count:12,includeAuthored:true,levels:[1,2,3],seed:'exam-'+n});
    sheet.exercises.forEach(e=>{
      seen.add(e.id);
      const original=authoredExams.find(x=>x.id===e.id);
      if(original)assert.deepEqual(e.skills,original.skills,e.id);
    });
  }
  assert.deepEqual(authoredExams.filter(e=>!seen.has(e.id)).map(e=>e.id),[]);
});

test('every new formula and Python display converts with the shipped MathJax without a TeX error',async()=>{
  const text=authoredExams.map(e=>[e.intro,...e.parts.flatMap(p=>[p.q,p.a,p.hint])].map(html).join('<p>')).join('<hr>');
  const dom=new JSDOM('<!doctype html><html><head></head><body>'+text+'</body></html>',{runScripts:'outside-only',url:'https://example.test/'});
  try{
    dom.window.MathJax={startup:{typeset:false},svg:{fontCache:'none'},tex:{inlineMath:[['\\(','\\)']]}};
    dom.window.eval(readFileSync(new URL('../site/vendor/mathjax-tex-svg.js',import.meta.url),'utf8'));
    await dom.window.MathJax.startup.promise;
    await dom.window.MathJax.typesetPromise([dom.window.document.body]);
    assert.ok(dom.window.document.querySelectorAll('mjx-container').length>350);
    assert.equal(dom.window.document.querySelectorAll('[data-mml-node="merror"],mjx-merror').length,0);
  }finally{dom.window.close();}
});
