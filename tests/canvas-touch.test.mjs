// Source-level gesture regressions: browser scrolling is additionally checked in Chromium.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {canvasNavigation, canvasTouch, svgNavigation} from '../site/js/canvas-navigation.js';
import {createStage} from '../site/js/lab/engine.js';

function setup(){
 const dom=new JSDOM('<main><canvas></canvas><svg viewBox="0 0 640 420"></svg></main>',{pretendToBeVisual:true}),w=dom.window;
 for(const key of ['window','document','Event','CustomEvent','MutationObserver'])globalThis[key]=w[key];
 globalThis.devicePixelRatio=1;globalThis.getComputedStyle=w.getComputedStyle.bind(w);
 let id=0;const frames=new Map();globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const flush=()=>{const work=[...frames.values()];frames.clear();work.forEach(fn=>fn(0));};
 w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:420});
 w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};
 const g=new Proxy({clearRect(){},measureText:()=>({width:30})},{get:(a,k)=>a[k]||(()=>{}),set:(a,k,v)=>(a[k]=v,true)});
 w.HTMLCanvasElement.prototype.getContext=()=>g;
 const touch=(el,x,y,n=1)=>{const e=new w.Event('touchstart',{cancelable:true,bubbles:true});Object.defineProperty(e,'touches',{value:Array.from({length:n},(_,i)=>({clientX:x+i*20,clientY:y}))});el.dispatchEvent(e);return e;};
 const ptr=(el,type,x,y)=>{const e=new w.MouseEvent(type,{cancelable:true,bubbles:true,clientX:x,clientY:y,button:0});Object.defineProperties(e,{pointerType:{value:'touch'},pointerId:{value:1}});el.dispatchEvent(e);return e;};
 return {dom,w,g,flush,touch,ptr};
}
test('canvas background keeps native scroll; hit targets and two-finger camera gestures reserve touch',()=>{
 const {dom,touch}=setup(),c=document.querySelector('canvas');const stop=canvasTouch(c,e=>e.clientX<40);
 assert.equal(c.style.touchAction,'pan-y pinch-zoom');assert.equal(touch(c,200,200).defaultPrevented,false);
 assert.equal(touch(c,20,200).defaultPrevented,true);assert.equal(touch(c,200,200,2).defaultPrevented,true);
 stop();assert.equal(touch(c,20,200).defaultPrevented,false);dom.window.close();
});
test('canvas and SVG plain wheel scroll; deliberate zoom preserves the picked mathematical point',()=>{
 const {dom,w,g}=setup(),c=document.querySelector('canvas'),svg=document.querySelector('svg');
 c.width=640;c.height=420;const nav=canvasNavigation(c,g,()=>[640,420],()=>{});const stopSvg=svgNavigation(svg);
 for(const el of [c,svg]){
  const plain=new w.WheelEvent('wheel',{deltaY:120,cancelable:true});el.dispatchEvent(plain);assert.equal(plain.defaultPrevented,false);
  const zoom=new w.WheelEvent('wheel',{deltaY:-120,ctrlKey:true,clientX:100,clientY:80,cancelable:true});el.dispatchEvent(zoom);assert.equal(zoom.defaultPrevented,true);
 }
 assert.deepEqual(nav.point({clientX:100,clientY:80}),[100,80]);assert.ok(nav.camera.scale>1);
 assert.notEqual(svg.getAttribute('viewBox'),'0 0 640 420');stopSvg();nav.destroy();dom.window.close();
});
test('lab handle touch locks scrolling, changes actual values, cancels cleanly and keeps the camera fixed',()=>{
 const {dom,w,flush,touch,ptr}=setup(),stage=createStage(document.querySelector('main'),{palette:{ink:'#000',c:[]}});let value=100;
 stage.setHandles([{id:'point',label:'Point',pos:()=>[value,100],drag:(x)=>{value=x;},nudge:dx=>{value+=dx;}}]);flush();
 assert.equal(touch(stage.canvas,500,300).defaultPrevented,false);assert.equal(touch(stage.canvas,100,100).defaultPrevented,true);
 const cam=stage.cam('graph');stage.panel('graph',{x:0,y:0,w:640,h:420},cam);const before={...cam};
 ptr(stage.canvas,'pointerdown',100,100);ptr(stage.canvas,'pointermove',150,120);flush();assert.equal(value,150);assert.deepEqual(cam,before);
 ptr(stage.canvas,'pointercancel',150,120);ptr(stage.canvas,'pointermove',300,120);flush();assert.equal(value,150);
 const handle=stage.wrap.querySelector('[data-handle]')||stage.wrap.querySelector('button');assert.ok(handle);
 handle.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));flush();assert.equal(value,151);
 stage.destroy();dom.window.close();
});

test('legacy gallery reserves actual shapes and vertices, makes the angle fan manipulable, and tears down navigation',async()=>{
 const {mountObject}=await import('../site/js/lab-objects.js');
 for(const id of ['chaos','reuleaux','platonic']){
  const {dom,w,g,flush,touch,ptr}=setup(),root=document.querySelector('main');root.replaceChildren();g.arcs=[];g.arc=(...args)=>g.arcs.push(args);
  const stop=mountObject(id,root,{lang:'en',reduced:true});flush();const c=root.querySelector('canvas');
  assert.equal(touch(c,5,5).defaultPrevented,false,`${id} background scrolls`);
  if(id==='chaos'){
   assert.equal(touch(c,320,24).defaultPrevented,true);ptr(c,'pointerdown',320,24);ptr(c,'pointermove',320,90);flush();
   assert.ok(g.arcs.some(a=>a[0]===320&&Math.abs(a[1]-90*460/420)<1e-8),'the actual chaos vertex moves vertically');ptr(c,'pointercancel',320,90);
  }
  if(id==='reuleaux'){
   assert.equal(touch(c,320,210).defaultPrevented,true);ptr(c,'pointerdown',320,210);ptr(c,'pointermove',400,150);flush();
   assert.ok(Number(root.querySelector('#rl-psi').value)>0,'actual rotation changes');ptr(c,'pointercancel',400,150);
  }
  if(id==='platonic'){
   assert.equal(touch(c,320,210).defaultPrevented,true,'solid faces reserve rotation');
   const fan=root.querySelector('#pl-fan-stage canvas');
   // The fan is square but this test's CSS rectangle is 640 x 420: convert its mathematical y to client y.
   const fy=y=>y/640*420;
   assert.equal(touch(fan,180,fy(560)).defaultPrevented,true);ptr(fan,'pointerdown',180,fy(560));ptr(fan,'pointermove',340,fy(560));
   assert.equal(root.querySelector('#pl-p').value,'6','the fan point changes actual sides per face');ptr(fan,'pointercancel',340,fy(560));
   fan.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));assert.equal(root.querySelector('#pl-q').value,'4');
  }
  const canvases=[...root.querySelectorAll('canvas')];stop();for(const surface of canvases)assert.equal(touch(surface,320,210,2).defaultPrevented,false,'navigation touch listener removed on unmount');
  dom.window.close();
 }
});
