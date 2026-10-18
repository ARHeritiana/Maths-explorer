// Real input events and recording canvas under jsdom; not a substitute for browser/pixel QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountObject} from '../site/js/lab-objects.js';
test('Five gallery exhibits mount in both languages, handle input and clean up their frames',()=>{
  const dom=new JSDOM('<main></main>',{pretendToBeVisual:true}),w=dom.window;
  for(const key of ['window','document','CustomEvent','Event','MouseEvent'])globalThis[key]=w[key];
  globalThis.devicePixelRatio=1;globalThis.getComputedStyle=w.getComputedStyle.bind(w);let number=0;const frames=new Map();
  globalThis.requestAnimationFrame=fn=>{frames.set(++number,fn);return number;};globalThis.cancelAnimationFrame=n=>frames.delete(n);
  w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:440});w.HTMLElement.prototype.setPointerCapture=()=>{};
  const finite=args=>args.forEach(x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));});
  w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(target,p)=>target[p]||((...args)=>finite(args)),set:(target,p,v)=>(target[p]=v,true)});};
  let now=0;const tick=(n=1)=>{for(let i=0;i<n;i++){const work=[...frames.values()];frames.clear();now+=40;work.forEach(fn=>fn(now));}};
  const input=(root,id,value)=>{const el=root.querySelector(id);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));tick();};
  for(const reduced of [false,true])for(const lang of ['fr','en'])for(const id of ['voronoi','fastest-slide','soap-films','knots','einstein']){
    const root=w.document.createElement('section');w.document.body.append(root);const errors=[];const listener=e=>errors.push(e.error||e.message);w.addEventListener('error',listener);
    const stop=mountObject(id,root,{lang,reduced});tick(2);assert.ok(root.querySelector('canvas'));assert.ok(root.querySelector('.exhibit-readout').textContent);
    if(id==='voronoi'){root.querySelector('#vo-grow').click();tick(5);root.querySelector('#vo-relax').click();tick(5);root.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));}
    if(id==='fastest-slide'){root.querySelector('#bs-show-1').click();assert.equal(root.querySelector('#bs-show-1').checked,false);root.querySelector('#bs-race').click();tick(40);input(root,'#bs-time',.3);assert.equal(root.querySelector('#bs-time-out').textContent,'0.300');}
    if(id==='soap-films'){root.querySelector('#sf-step').click();root.querySelector('#sf-bulge').click();assert.equal(root.querySelectorAll('#sf-frame option').length,14);root.querySelector('#sf-frame').value='tetrahedron';root.querySelector('#sf-frame').dispatchEvent(new w.Event('change'));root.querySelector('#sf-step').click();tick(5);}
    if(id==='knots'){
      assert.equal(root.querySelectorAll('#kn-knot option').length,44);assert.equal(root.querySelector('#kn-mode'),null);
      root.querySelector('#kn-knot').value='3_1';root.querySelector('#kn-knot').dispatchEvent(new w.Event('change'));root.querySelector('#kn-projection').click();tick();root.querySelector('#kn-find').click();assert.match(root.querySelector('.exhibit-readout').textContent,/9/);
      root.querySelector('#kn-example').value='unknot';root.querySelector('#kn-example').dispatchEvent(new w.Event('change'));tick();assert.match(root.querySelector('.exhibit-readout').textContent,/2 /);root.querySelector('#kn-end').click();tick();assert.match(root.querySelector('.exhibit-readout').textContent,/0 /);root.querySelector('#kn-space').click();tick();assert.match(root.textContent,/KnotInfo/);
    }
    if(id==='einstein'){input(root,'#hat-shape',.5);assert.match(root.querySelector('.exhibit-readout').textContent,/Exception/);root.querySelector('#hat-p6340').click();tick();root.querySelector('#hat-play').click();tick(5);}
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent),`${id} content is finite`);assert.deepEqual(errors,[],`${id} input errors`);stop();assert.equal(frames.size,0,'unmount cancels frames');root.remove();w.removeEventListener('error',listener);
  }dom.window.close();
});
