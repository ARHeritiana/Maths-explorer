// Equidecomposition exhibit under jsdom with a recording canvas: mounts in both languages, answers its controls (selects,
// pairs, play, steps, slider, drawing by click and by typed vertices, refusals), nothing autoplays under reduced motion,
// frames stop on unmount; bilingual pairs in the catalogue line and in the rendered page (no French in the English slot
// and no English in the French slot). Not a substitute for the browser check.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {mountObject} from '../site/js/lab-objects.js';
import {CURIOSITIES} from '../site/js/gallery/gallery-curiosities.js';
import {labs} from '../site/js/content.js';
import {describe} from '../site/js/reading.js';

const ENGLISH=/\b(the|and|with|of|each|is|are|into|pieces|step|click)\b/i, NAMES=/Wallace-Bolyai-Gerwien|Dehn|Hilbert|Laczkovich|Tarski|Wikipedia/g;

test('catalogue line: bilingual pairs, links resolve, no dashes',()=>{
  const e=CURIOSITIES.find(x=>x.id==='equidecomposition');assert.ok(e&&e.custom);assert.ok(labs.includes(e));
  const walk=(v,path)=>{
    if(Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string')){
      assert.ok(!ENGLISH.test(v[0].replace(NAMES,'')),`${path}: English in the French slot: ${v[0]}`);
      assert.ok(!/[àâçéèêëîïôùûœ]/i.test(v[1]),`${path}: French in the English slot: ${v[1]}`);
      assert.ok(v[0]&&v[1],path);
    }else if(Array.isArray(v))v.forEach((x,i)=>walk(x,`${path}.${i}`));
    else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,`${path}.${k}`));
  };
  walk({title:e.title,short:e.short,intro:e.intro,steps:e.steps,quiz:e.quiz,explain:e.explain,story:e.story,reasoning:e.reasoning,history:e.history,sourceLabel:e.sourceLabel},'equidecomposition');
  assert.equal(e.answer,36/9);
  for(const h of e.links)assert.ok(describe(h),`link ${h} resolves`);
  for(const h of ['#lab/tiles','#gallery/banach-tarski-gallery'])assert.ok(e.links.includes(h));
  const src=['site/js/gallery/gallery-equidecomposition.js','site/js/gallery/gallery-equidecomposition-model.js','site/js/gallery/gallery-curiosities.js'].map(f=>readFileSync(f,'utf8')).join('');
  assert.ok(!/[–—]/.test(src),'no en or em dash');
  assert.ok(!/javalab|mathoutils/i.test(src));
});

test('the exhibit mounts in both languages, reacts, refuses bad polygons, respects reduced motion and stops',()=>{
  const dom=new JSDOM('<main></main>',{pretendToBeVisual:true}),w=dom.window;
  for(const key of ['window','document','CustomEvent','Event','MouseEvent'])globalThis[key]=w[key];
  globalThis.devicePixelRatio=1;globalThis.getComputedStyle=w.getComputedStyle.bind(w);let number=0;const frames=new Map();
  globalThis.requestAnimationFrame=fn=>{frames.set(++number,fn);return number;};globalThis.cancelAnimationFrame=n=>frames.delete(n);
  w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:440});w.HTMLElement.prototype.setPointerCapture=()=>{};w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:440});
  w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(target,p)=>target[p]||((...args)=>args.forEach(x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));})),set:(target,p,v)=>(target[p]=v,true)});};
  let now=0;const tick=(n=1)=>{for(let i=0;i<n;i++){const work=[...frames.values()];frames.clear();now+=40;work.forEach(fn=>fn(now));}};
  const read=root=>root.querySelector('.exhibit-readout').textContent,fire=(el,type,init={})=>el.dispatchEvent(new w.MouseEvent(type,{bubbles:true,...init}));
  const pick=(sel,v)=>{sel.value=v;sel.dispatchEvent(new w.Event('change',{bubbles:true}));};
  for(const lang of ['fr','en']){
    const root=w.document.createElement('section');w.document.body.append(root);
    const stop=mountObject('equidecomposition',root,{lang,reduced:false});tick(2);const cv=root.querySelector('canvas');assert.ok(cv);
    assert.equal(cv.getAttribute('role'),'img');assert.ok(cv.getAttribute('aria-label').length>40);
    assert.equal(root.querySelector('.exhibit-readout').getAttribute('aria-live'),'polite');
    assert.match(read(root),lang==='fr'?/Étape 1.*Aire commune A = 500 u²/:/Step 1.*Common area A = 500 u²/);
    for(const id of ['eq-prev','eq-next'])assert.ok(root.querySelector('#'+id).getAttribute('aria-label'));
    // the first pair plays by itself when motion is allowed; pause holds; steps and slider answer
    tick(30);const slider=root.querySelector('#eq-t');assert.ok(Number(slider.value)>0,'plays');
    root.querySelector('#eq-play').click();tick();const paused=slider.value;tick(5);assert.equal(slider.value,paused,'pause holds');
    assert.ok(slider.getAttribute('aria-valuetext'));
    root.querySelector('#eq-next').click();tick();assert.ok(Number.isInteger(Number(slider.value)));
    root.querySelector('#eq-prev').click();tick();root.querySelector('#eq-prev').click();tick();assert.equal(Number(slider.value),0);
    slider.value='4.5';slider.dispatchEvent(new w.Event('input',{bubbles:true}));tick();assert.match(read(root),lang==='fr'?/Étape 5/:/Step 5/);
    for(let i=0;i<4;i++){root.querySelector('#eq-next').click();tick();}assert.equal(Number(slider.value),8);
    root.querySelector('#eq-play').click();tick();assert.ok(Number(slider.value)<0.1,'Play at the end restarts');root.querySelector('#eq-play').click();
    // pairs and selects
    assert.equal(root.querySelectorAll('#eq-p option').length,14);
    pick(root.querySelector('#eq-p'),'cross');pick(root.querySelector('#eq-q'),'arrow');tick();assert.match(read(root),/P \d+, Q \d+/);
    root.querySelector('#eq-g1').click();tick();assert.equal(root.querySelector('#eq-p').value,'hexagon');assert.equal(root.querySelector('#eq-q').value,'square');
    // drawing: refusals, typed vertices, clicks, then close
    root.querySelector('#eq-dp').click();tick();assert.equal(root.querySelector('#eq-draw').hidden,false);assert.match(read(root),lang==='fr'?/Tu dessines P/:/You are drawing P/);
    root.querySelector('#eq-close').click();tick();assert.match(read(root),lang==='fr'?/trois sommets/:/three distinct vertices/);
    const typed=root.querySelector('#eq-vertices'),add=root.querySelector('#eq-add');
    typed.value='0,0; hello';add.click();tick();assert.match(read(root),lang==='fr'?/points-virgules/:/semicolons/);
    typed.value='0,0; 10,10; 10,0; 0,10';add.click();tick();root.querySelector('#eq-close').click();tick();assert.match(read(root),lang==='fr'?/refusé/:/refused/);
    root.querySelector('#eq-cancel').click();tick();assert.equal(root.querySelector('#eq-draw').hidden,true);
    root.querySelector('#eq-dq').click();typed.value='0,0; 100,0; 100,0.001; 0,0.001';add.click();tick();root.querySelector('#eq-close').click();tick();assert.match(read(root),lang==='fr'?/Trop fin/:/Too thin/);
    for(let i=0;i<4;i++)root.querySelector('#eq-undo').click();tick();
    const at=(x,y)=>{fire(cv,'pointerdown',{clientX:x,clientY:y});fire(cv,'pointerup',{clientX:x,clientY:y});};
    at(200,300);at(400,300);fire(cv,'pointerdown',{clientX:10,clientY:10});fire(cv,'pointerup',{clientX:300,clientY:300});at(300,100);tick();
    root.querySelector('#eq-close').click();tick();assert.equal(root.querySelector('#eq-draw').hidden,true,'a triangle drawn by three clicks is accepted (a drag adds nothing)');
    assert.equal(root.querySelector('#eq-q').value,'custom');assert.match(read(root),lang==='fr'?/Étape 1/:/Step 1/);
    // the keyboard path: type a rectangle for P and press Enter
    root.querySelector('#eq-dp').click();typed.value='0,0; 10,0; 10,6; 0,6';typed.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));tick();
    root.querySelector('#eq-close').click();tick();assert.equal(root.querySelector('#eq-p').value,'custom');
    const text=root.textContent;assert.ok(!/NaN|undefined|Infinity/.test(text),'finite content');
    if(lang==='en')assert.ok(!/[àâçéèêëîïôùûœ]/i.test(text),'no French in the English page');
    else assert.ok(!ENGLISH.test(text.replace(NAMES,'')),`no English in the French page: ${text.match(ENGLISH)}`);
    stop();assert.equal(frames.size,0,'unmount cancels frames');root.remove();
  }
  for(const lang of ['fr','en']){
    const root=w.document.createElement('section');w.document.body.append(root);
    const stop=mountObject('equidecomposition',root,{lang,reduced:true});tick(40);
    assert.equal(Number(root.querySelector('#eq-t').value),0,'reduced motion: nothing autoplays');assert.match(root.querySelector('#eq-play').textContent,lang==='fr'?/Lancer/:/Play/);
    root.querySelector('#eq-g0').click();tick(40);assert.equal(Number(root.querySelector('#eq-t').value),0,'reduced motion: a gallery pair starts paused');
    root.querySelector('#eq-play').click();tick(20);assert.ok(Number(root.querySelector('#eq-t').value)>0,'Play still plays when asked');
    stop();assert.equal(frames.size,0);root.remove();
  }
});
