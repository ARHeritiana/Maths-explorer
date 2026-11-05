import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import {ANNALS,annalsFor,selectAnnals,annalsMarkup,bindAnnals} from '../dist/js/annals-bank.js';
import {bankPage,isBankRoute,bankCount} from '../dist/js/bank-page.js';
import {isLiveRoute} from '../dist/js/live-curriculum.js';
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'content/data/manifest.json')));
const t=x=>Array.isArray(x)?x[0]:x;
test('annales metadata, originals, attribution and topic links are coherent',()=>{
 assert.equal(ANNALS.length,829);
 assert.equal(ANNALS.filter(r=>r.correction).length,821);
 assert.deepEqual(new Set(ANNALS.map(r=>r.family)),new Set(['BAC','EAM','E3C']));
 assert.equal(new Set(ANNALS.map(r=>r.id)).size,ANNALS.length);
 const chapters=new Map(manifest.catalog.chapters.map(c=>[c.id,c.course]));
 for(const r of ANNALS){
  assert.ok(fs.existsSync(path.join(root,'content/tex/annals',r.id+'.tex')),r.id);
  assert.equal(fs.existsSync(path.join(root,'content/tex/annals',r.id+'.cor.tex')),r.correction);
  assert.equal(new URL(r.sourceURL).hostname,'coopmaths.fr');
  assert.ok(r.chapters.every(id=>chapters.get(id)===r.cls),r.id);
  if(/sujet0|specimen/.test(r.id))assert.ok(r.sample,r.id);
 }
 assert.equal(manifest.annalsBank.license,'CC BY-SA');
 assert.match(manifest.annalsBank.credit,/APMEP/);assert.match(manifest.annalsBank.credit,/CoopMaths/);
});
test('bank and visibility policy accept the new index and stable exercise permalinks',()=>{
 assert.ok(isBankRoute('annales'));assert.ok(isBankRoute('annales',ANNALS[0].id));assert.ok(!isBankRoute('annales','missing'));
 assert.ok(isLiveRoute({page:'bank',id:'annales'}));
 assert.match(bankPage(t,'annales'),/data-annals/);
 const chapter=ANNALS.find(r=>r.chapters.length).chapters[0];
 assert.ok(annalsFor(chapter).length>0);
 const page=new JSDOM(bankPage(t,chapter.split('-')[0],chapter)).window.document;
 assert.ok(page.querySelector('.bank-annals [data-annals]'));
 assert.equal(page.querySelector('.bank-annals').open,false);
 assert.equal(bankCount(chapter),page.querySelectorAll('.bank-list > .bank-ex').length);
 assert.equal(page.querySelector('.annal-books'),null);
 assert.ok(!bankPage(t,'terminale').includes('Programme français'));
 const index=new JSDOM(bankPage(t,'annales')).window.document;
 assert.equal(index.querySelector('.bank-sections [aria-current]').getAttribute('href'),'#bank/annales');
 const detail=new JSDOM(bankPage(t,'annales',ANNALS[0].id)).window.document;
 assert.equal(detail.querySelector('.annal-filters'),null);
 assert.equal(detail.querySelector('.annal-books'),null);
});
test('filters combine exam, year, topic and accent-folded search',()=>{
 const sample=ANNALS.find(r=>r.family==='BAC'&&r.tags.includes('Probabilités conditionnelles'));
 const found=selectAnnals(ANNALS,{family:'BAC',year:sample.year,topic:'Probabilités conditionnelles',search:'probabilites'});
 assert.ok(found.length);assert.ok(found.every(r=>r.family==='BAC'&&r.year===sample.year));
 assert.equal(selectAnnals(ANNALS,{family:'E3C',year:2026}).length,0);
 const classMatches=selectAnnals(ANNALS,{course:sample.cls,family:'BAC',year:sample.year});
 assert.ok(classMatches.length);assert.ok(classMatches.every(r=>r.cls===sample.cls));
 assert.ok(selectAnnals(ANNALS,{search:String(sample.year)}).includes(sample));
});
test('lazy loading, folded correction, filters, reset and paging use local content',async()=>{
 const dom=new JSDOM('<main>'+annalsMarkup()+'</main>',{url:'https://example.org/Maths-explorer/#bank/annales'});
 const old={document:globalThis.document,window:globalThis.window,FormData:globalThis.FormData,fetch:globalThis.fetch};
 globalThis.document=dom.window.document;globalThis.window=dom.window;globalThis.FormData=dom.window.FormData;
 dom.window.MathJax={typesetPromise:async()=>{}};const calls=[];
 globalThis.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>({question:'<p>Énoncé local \\(1+1\\)</p>',solution:'<p>Correction locale</p>'})};};
 let stop;
 try{
  stop=bindAnnals(document.querySelector('main'));
  assert.equal(document.querySelectorAll('[data-annal]').length,30);assert.equal(calls.length,0);
  const first=document.querySelector('[data-annal]');first.open=true;first.dispatchEvent(new dom.window.Event('toggle'));
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.match(calls[0],/^\.\/resources\/annals\//);assert.equal(first.querySelector('.bank-sol').open,false);
  assert.match(first.textContent,/Correction locale/);
  const search=document.querySelector('[name="search"]');search.value='no matching source';search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  assert.equal(document.querySelectorAll('[data-annal]').length,0);
  document.querySelector('form').reset();await new Promise(resolve=>queueMicrotask(resolve));assert.equal(document.querySelectorAll('[data-annal]').length,30);
  const preserved=document.querySelector('[data-annal]');preserved.open=true;
  document.querySelector('[data-annal-more]').click();assert.equal(document.querySelectorAll('[data-annal]').length,60);
  assert.equal(document.querySelector('[data-annal]'),preserved);assert.ok(preserved.open);
  const cls=document.querySelector('[name="course"]');cls.value='premiere';cls.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  assert.ok([...document.querySelectorAll('[data-annal]')].every(el=>ANNALS.find(r=>r.id===el.dataset.annal).cls==='premiere'));
 }finally{stop?.();Object.assign(globalThis,old);dom.window.close();}
});

test('typeset statements retain boxed answers and every diagram is hosted locally',()=>{
 const sample=JSON.parse(fs.readFileSync(path.join(root,'dist/resources/annals/bac_2022_05_sujet2_etrangers_1.json')));
 assert.match(sample.solution,/Réponse c/);
 const vectors=JSON.parse(fs.readFileSync(path.join(root,'dist/resources/annals/bac_2022_05_sujet2_ameriquenord_3.json')));
 assert.ok(vectors.solution.includes('pmatrix'));
 assert.ok(vectors.solution.includes('\\dfrac{11}{2}-4t'));
 for(const r of ANNALS){
  const data=JSON.parse(fs.readFileSync(path.join(root,'dist/resources/annals',r.id+'.json')));
  const dom=new JSDOM(data.question+data.solution),body=dom.window.document.body;
  for(const img of body.querySelectorAll('img')){
   assert.match(img.getAttribute('src'),/^\.\/resources\/annals\/figures\/[^/]+\.svg$/);
   assert.ok(fs.existsSync(path.join(root,'dist',img.getAttribute('src'))),r.id);
  }
  dom.window.close();
 }
});
