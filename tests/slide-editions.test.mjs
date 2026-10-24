// The actual player selects declared sequences and reports unsupported language requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {deckLanguages, selectDeckEdition} from '../site/slides/edition-policy.js';
const source=fs.readFileSync(new URL('../site/slides/player.js',import.meta.url),'utf8').replace(/^import .*;$/mg,'');
const sequence=(lang,count)=>Array.from({length:count},(_,i)=>({k:'concept',t:lang==='fr'?[`Idée ${i}`,'']:[ '',`Idea ${i}`],b:lang==='fr'?['Français seulement.','']:['','English only.']}));
function fixture(langs){const editions=Object.fromEntries(langs.map(lang=>[lang,{slides:sequence(lang,lang==='fr'?1:2)}]));return {id:'test',course:'test',title:['Cours','Course'],courseTitle:['Collection','Collection'],language:'fr',editions,slides:sequence(langs[0],1)};}
test('single-language and bilingual fixtures preserve independent slide counts and supported explicit requests',()=>{
 for(const langs of [['fr'],['en'],['fr','en']]){
  const deck=fixture(langs);assert.deepEqual(deckLanguages(deck),langs);
  for(const language of ['fr','en']){const selected=selectDeckEdition(deck,language);if(langs.includes(language)){assert.equal(selected.selectedLanguage,language);assert.equal(selected.slides.length,language==='fr'?1:2);}else assert.equal(selected,null);}
  assert.equal(selectDeckEdition(deck,null,'en').selectedLanguage,langs.includes('fr')?'fr':'en');
 }
});
test('player shows an unavailable-edition message instead of opening different-language text',async()=>{
 for(const available of ['fr','en']){
  const requested=available==='fr'?'en':'fr',dom=new JSDOM('<div id="wrap"><main id="stage"></main></div>',{url:`https://example.test/slides/player.html?deck=test&lang=${requested}`,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
  w.deckLanguages=deckLanguages;w.selectDeckEdition=selectDeckEdition;w.__MX_EXPORT__={deck:fixture([available]),figs:{}};
  w.matchMedia=()=>({matches:false});
  w.eval('const mount=()=>({destroy(){}});\n'+source);await new Promise(resolve=>setTimeout(resolve,10));
  assert.match(w.document.body.textContent,/unavailable|indisponible/);assert.equal(w.document.querySelector('#flow'),null);assert.equal(w.document.querySelector(`a[href="?lang=${available}"]`).textContent,available.toUpperCase());dom.window.close();
 }
});
test('player renders the explicitly requested supported edition even when curriculum default differs',async()=>{
 const dom=new JSDOM('<div id="wrap"><main id="stage"></main></div>',{url:'https://example.test/slides/player.html?deck=test&lang=en',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.deckLanguages=deckLanguages;w.selectDeckEdition=selectDeckEdition;w.__MX_EXPORT__={deck:fixture(['fr','en']),figs:{}};
 w.matchMedia=()=>({matches:false});w.document.fonts={load:async()=>{}};w.HTMLElement.prototype.scrollIntoView=()=>{};w.MathJax={startup:{promise:Promise.resolve()},typesetPromise:async()=>{}};
 w.eval('const mount=()=>({destroy(){}});\n'+source);await new Promise(resolve=>setTimeout(resolve,15));
 assert.equal(w.document.documentElement.lang,'en');assert.match(w.document.querySelector('#flow').textContent,/English only/);assert.doesNotMatch(w.document.querySelector('#flow').textContent,/Français/);assert.equal(w.document.querySelector('#count').textContent.trim(),'1 / 2');dom.window.close();
});
