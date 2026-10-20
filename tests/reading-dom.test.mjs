// The two new curiosities of the "Lire" section and the gauss-sum activity under jsdom with a recording canvas: they mount
// in both languages, answer their controls, keep finite readouts and stop their frames. Not a substitute for browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountObject} from '../site/js/lab-objects.js';
import {mountActivity} from '../site/js/challenges/registry.js';
test('Game of Life, square packing, moving sofa, inscribed and opaque squares mount, react and clean up; the gauss-sum activity adds and pairs',async ()=>{
  const dom=new JSDOM('<main></main>',{pretendToBeVisual:true}),w=dom.window;
  for(const key of ['window','document','CustomEvent','Event','MouseEvent'])globalThis[key]=w[key];
  globalThis.devicePixelRatio=1;globalThis.getComputedStyle=w.getComputedStyle.bind(w);let number=0;const frames=new Map();
  globalThis.requestAnimationFrame=fn=>{frames.set(++number,fn);return number;};globalThis.cancelAnimationFrame=n=>frames.delete(n);
  w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:440});w.HTMLElement.prototype.setPointerCapture=()=>{};
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:440});
  w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(target,p)=>target[p]||((...args)=>args.forEach(x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));})),set:(target,p,v)=>(target[p]=v,true)});};
  let now=0;const tick=(n=1)=>{for(let i=0;i<n;i++){const work=[...frames.values()];frames.clear();now+=40;work.forEach(fn=>fn(now));}};
  const read=root=>root.querySelector('.exhibit-readout').textContent;
  const pointer=(el,type,x,y)=>el.dispatchEvent(new w.MouseEvent(type,{clientX:x,clientY:y,bubbles:true}));
  for(const lang of ['fr','en'])for(const id of ['life','square-packing']){
    const root=w.document.createElement('section');w.document.body.append(root);
    const stop=mountObject(id,root,{lang,reduced:false});tick(2);const cv=root.querySelector('canvas');assert.ok(cv);
    if(id==='life'){
      assert.match(read(root),/5/);root.querySelector('#lf-step').click();tick();assert.match(read(root),/1/);
      const sel=root.querySelector('#lf-preset');sel.value='diehard';sel.dispatchEvent(new w.Event('change'));tick();assert.match(read(root),/ 7$|: 7/);
      root.querySelector('#lf-clear').click();tick();pointer(cv,'pointerdown',320,220);pointer(cv,'pointerup',320,220);tick();assert.match(read(root),/1$/);
      cv.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));cv.dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',bubbles:true}));tick();assert.match(read(root),/2$/);
      root.querySelector('#lf-play').click();tick(3);root.querySelector('#lf-play').click();
    }
    if(id==='square-packing'){
      assert.equal(root.querySelectorAll('#sq-n option').length,18);
      root.querySelector('#sq-best').click();tick();assert.match(read(root),lang==='fr'?/2,707.*Aucun chevauchement/:/2\.707.*No overlaps/);
      const sel=root.querySelector('#sq-n');sel.value='11';sel.dispatchEvent(new w.Event('change'));tick();assert.equal(root.querySelector('#sq-best').disabled,true);assert.match(read(root),/3[.,]8772/);
      cv.dispatchEvent(new w.KeyboardEvent('keydown',{key:']',bubbles:true}));tick();assert.match(read(root),/1[.,]0°/);
    }
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent),`${id} content is finite`);stop();assert.equal(frames.size,0,`${id}: unmount cancels frames`);root.remove();
  }
  for(const lang of ['fr','en'])for(const id of ['moving-sofa','inscribed-square','opaque-square']){
    const root=w.document.createElement('section');w.document.body.append(root);
    const stop=mountObject(id,root,{lang,reduced:false});tick(2);const cv=root.querySelector('canvas');assert.ok(cv);
    if(id==='moving-sofa'){
      assert.match(read(root),/2[.,]207/);root.querySelector('#so-play').click();for(let i=0;i<200;i++){now+=60;tick();}assert.match(read(root),lang==='fr'?/passé le coin/:/round the corner/);
      const k=root.querySelector('#so-kind');k.value='rect';k.dispatchEvent(new w.Event('change'));tick();assert.match(read(root),/1[.,]800/);
      cv.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));cv.dispatchEvent(new w.KeyboardEvent('keydown',{key:']',bubbles:true}));tick();
      k.value='own';k.dispatchEvent(new w.Event('change'));pointer(cv,'pointerdown',100,120);for(let a=0;a<=40;a++)pointer(cv,'pointermove',100+30*Math.cos(a*Math.PI/20),120+20*Math.sin(a*Math.PI/20));pointer(cv,'pointerup',130,120);tick();assert.match(read(root),/0[.,]6/);
    }
    if(id==='inscribed-square'){
      await new Promise(r=>setTimeout(r,80));tick();assert.match(read(root),/1/);
      const sel=root.querySelector('#is-preset');sel.value='acute';sel.dispatchEvent(new w.Event('change'));await new Promise(r=>setTimeout(r,80));tick();assert.match(read(root),/^3 /);
      root.querySelector('#is-next').click();tick();
      sel.value='blob';sel.dispatchEvent(new w.Event('change'));pointer(cv,'pointerdown',20+60*2,10+60*2);pointer(cv,'pointermove',20+60*8,10+60*6.5);pointer(cv,'pointerup',20+60*8,10+60*6.5);tick();
      assert.match(read(root),lang==='fr'?/se croise/:/crosses itself/);
    }
    if(id==='opaque-square'){
      assert.match(read(root),lang==='fr'?/Opaque/:/Opaque/);root.querySelector('#op-delete').click();tick();assert.match(read(root),lang==='fr'?/Pas opaque/:/Not opaque/);
      root.querySelector('#op-leak').click();tick();const sel=root.querySelector('#op-preset');sel.value='best';sel.dispatchEvent(new w.Event('change'));tick();assert.match(read(root),/2[.,]639/);
      sel.value='empty';sel.dispatchEvent(new w.Event('change'));pointer(cv,'pointerdown',195,345);pointer(cv,'pointermove',445,95);pointer(cv,'pointerup',445,95);tick();assert.match(read(root),/1[.,]414/);
      root.querySelector('#op-sweep').click();tick(5);
    }
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent),`${id} content is finite`);stop();assert.equal(frames.size,0,`${id}: unmount cancels frames`);root.remove();
  }
  for(const lang of ['fr','en']){
    const root=w.document.createElement('section');w.document.body.append(root);
    const stop=mountActivity('gauss-sum',root,{lang,reduced:()=>false,params:{series:'1,1,100'}});
    root.querySelector('#gs-add10').click();assert.match(root.querySelector('#gs-read').textContent,/10.*55/);
    const tiles=root.querySelectorAll('.cl-tok');assert.equal(tiles.length,16);tiles[0].click();root.querySelectorAll('.cl-tok')[15].click();assert.match(root.querySelector('#gs-pairs').textContent,/1 \+ 100 = 101/);
    w.document.dispatchEvent(new w.CustomEvent('challenge-action',{detail:{id:'gauss-sum',act:'flip'}}));assert.ok(root.querySelectorAll('#gs-svg rect').length>24);
    stop();root.remove();
  }
  dom.window.close();
});
