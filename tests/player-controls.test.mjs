import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
const source=fs.readFileSync(new URL('../site/slides/player.js',import.meta.url),'utf8').replace(/^import .*;$/mg,'');
async function player(widgetCount){
 const dom=new JSDOM('<div id="wrap"><main id="stage"></main></div>',{url:'https://example.test/slides/player.html?deck=test&lang=en#1',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.matchMedia=()=>({matches:false});w.document.fonts={load:async()=>{}};w.HTMLElement.prototype.scrollIntoView=()=>{};w.MathJax={startup:{promise:Promise.resolve()},typesetPromise:async()=>{}};
 const widgets=Array.from({length:widgetCount},(_,i)=>({k:'widget',t:['Figure '+i,'Figure '+i],b:['',''],w:{type:'test'}}));
 w.__MX_EXPORT__={deck:{id:'test',course:'premiere',courseTitle:['Première','Year 12'],title:['Cours','Lesson'],language:'fr',slides:[{k:'title',t:['Cours','Lesson'],b:['','']},{k:'concept',t:['Notion','Concept'],b:['Texte.','Text.']},...widgets]},figs:{}};
 w.eval('const mount=()=>({destroy(){}});\n'+source);await new Promise(r=>setTimeout(r,10));return dom;
}
test('player loads curriculum language, omits duplicate actions and singleton choice',async()=>{
 const dom=await player(1),d=dom.window.document;assert.equal(d.documentElement.lang,'fr');assert.equal(d.querySelector('#lng,#dl,#explore-choice'),null);assert.ok(d.querySelector('#wcanvas'));assert.ok(d.querySelector('#lst'));dom.window.close();
});
test('player retains selector when figures represent multiple mathematical choices',async()=>{
 const dom=await player(2);assert.equal(dom.window.document.querySelectorAll('#explore-choice option').length,2);dom.window.close();
});
