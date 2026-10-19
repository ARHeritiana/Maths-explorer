// DOM integration checks with a recording canvas. This does not claim browser or pixel rendering QA.
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
const dom=new JSDOM('<a class="skip" href="#main">Skip</a><div id="app"></div>',{url:'https://example.org/#lab/vectors',pretendToBeVisual:true});
const {window}=dom;
for(const key of ['window','document','location','history','localStorage','CustomEvent','Node','Element','HTMLElement','SVGElement','Event','MouseEvent','MutationObserver'])globalThis[key]=window[key];
globalThis.getComputedStyle=window.getComputedStyle.bind(window);globalThis.devicePixelRatio=1;
const frames=new Map();let frameId=0;
globalThis.requestAnimationFrame=fn=>{frames.set(++frameId,fn);return frameId;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
globalThis.matchMedia=window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
globalThis.addEventListener=window.addEventListener.bind(window);
globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn([]);}disconnect(){}};
globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
window.HTMLElement.prototype.getBoundingClientRect=function(){return{left:0,top:0,right:640,bottom:480,width:640,height:480};};
window.SVGElement.prototype.getBoundingClientRect=window.HTMLElement.prototype.getBoundingClientRect;
window.HTMLElement.prototype.setPointerCapture=function(){};window.HTMLElement.prototype.releasePointerCapture=function(){};window.HTMLElement.prototype.hasPointerCapture=()=>false;
window.HTMLElement.prototype.scrollIntoView=function(){};window.scrollTo=function(){};
globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}};
window.SVGElement.prototype.getScreenCTM=()=>({inverse(){return this;}});
let segments=0;const allArgs=[];
window.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:s=>({width:String(s).length*8}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:()=>({data:new Uint8ClampedArray(16)})},{get(target,key){if(key in target)return target[key];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(key)} received ${n}`);if(key==='lineTo')segments++;allArgs.push([key,args]);};},set(target,key,value){target[key]=value;return true;}});};
globalThis.fetch=async url=>{const rel=String(url).replace(/^\.\//,'').split('?')[0];try{return {ok:true,json:async()=>JSON.parse(await readFile(new URL('../dist/'+rel,import.meta.url),'utf8'))};}catch{return{ok:false,status:404};}};
const pair=(fr,en)=>fr,t=(fr,en)=>fr;
let stop;
const {mountObject}=await import('../site/js/lab-objects.js');const solidRoot=document.createElement('div');document.body.append(solidRoot);stop=mountObject('platonic',solidRoot,{lang:'fr',reduced:true});
for(const id of ['tetrahedron','cube','octahedron','dodecahedron','icosahedron']){solidRoot.querySelector(`[data-solid="${id}"]`).click();solidRoot.querySelector('#pl-open').click();assert.equal(solidRoot.querySelector('#pl-fold').value,'0');solidRoot.querySelector('#pl-play').click();assert.equal(solidRoot.querySelector('#pl-fold').value,'100');}
solidRoot.querySelector('#pl-p').value=6;solidRoot.querySelector('#pl-p').dispatchEvent(new Event('input'));solidRoot.querySelector('#pl-q').value=3;solidRoot.querySelector('#pl-q').dispatchEvent(new Event('input'));assert.equal(solidRoot.querySelector('#pl-build-case').disabled,true);stop();solidRoot.remove();
await import('../dist/js/app.js');
// Laboratory v2: a mounted experiment. Frames are run by hand; a drag must add or remove no element, the camera is
// independent of the state, missions change the address, keyboard handles move by one grid step.
const flush=()=>{for(let i=0;i<8&&frames.size;i++)for(const [id,fn] of [...frames]){frames.delete(id);fn(performance.now());}};
const settle=async()=>{for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,15));flush();}};
const go=async hash=>{window.location.hash=hash;window.dispatchEvent(new window.Event('hashchange'));await settle();};
const press=(el,type,x,y)=>el.dispatchEvent(new window.MouseEvent(type,{clientX:x,clientY:y,bubbles:true,cancelable:true,button:0}));
await go('#lab/quadratic/vertex');
let lab=document.querySelector('.lab2');assert.ok(lab,'the experiment page mounts');
assert.equal(lab.querySelectorAll('canvas').length,1);assert.equal(window.location.hash,'#lab/quadratic/vertex');
assert.match(lab.querySelector('.lab2-step').textContent,/3\/6/);assert.ok(lab.querySelector('.lab2-formula').textContent.includes('f(x) ='));
const api=lab.__lab,canvas=lab.querySelector('canvas'),handle=lab.querySelector('.lab2-handle');assert.equal(lab.querySelectorAll('.lab2-handle').length,1,'only the unlocked handle is focusable');
const centre=()=>{const m=/translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(handle.style.transform);return [+m[1]+22,+m[2]+22];};
const camera=api.stage.nav.camera,before=api.getState(),record=[];
const watch=new window.MutationObserver(rs=>{for(const r of rs)if(r.type==='childList')for(const n of [...r.addedNodes,...r.removedNodes])record.push(n.nodeName);});
watch.observe(lab,{childList:true,subtree:true});
let [cx,cy]=centre();press(canvas,'pointerdown',cx,cy);
for(let i=1;i<=12;i++){press(canvas,'pointermove',cx+i*9,cy-i*7);flush();}
press(canvas,'pointerup',cx+108,cy-84);flush();
await new Promise(r=>setTimeout(r,400));flush();
assert.deepEqual(record,[],'a drag adds or removes no element and replaces no text node');
assert.notEqual(api.getState().c,before.c,'the vertex followed the pointer');assert.equal(api.getState().a,1,'only the vertex moved, a is kept');
assert.equal(camera.scale,1,'the camera does not depend on the state');
watch.disconnect();
const formula=lab.querySelector('.lab2-formula').textContent;assert.ok(formula.includes('x²'),formula);assert.ok(!/NaN|undefined/.test(lab.textContent));
canvas.dispatchEvent(new window.WheelEvent('wheel',{deltaY:-120,clientX:320,clientY:200,cancelable:true}));flush();
assert.ok(camera.scale>1,'the wheel zooms');
const keep=api.getState();canvas.dispatchEvent(new window.KeyboardEvent('keydown',{key:'0',bubbles:true,cancelable:true}));flush();assert.equal(camera.scale,1,'0 resets the view');assert.deepEqual(api.getState(),keep,'zoom and reset never change the state');
// keyboard: one grid step (0.5) per arrow press
const x0=api.getState();handle.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));flush();
assert.equal(-api.getState().b/2,-x0.b/2+0.5,'the vertex moved by one grid step');
// missions: predict first, Next unlocks after an answer, the address follows
await go('#lab/quadratic/open');
lab=document.querySelector('.lab2');let next=lab.querySelector('.lab2-nav .primary');assert.ok(next.disabled,'Next waits for an answer');
assert.ok(lab.querySelectorAll('.lab2-ctl:not(.is-locked)').length===0,'controls are locked in the prediction');
lab.querySelector('.lab2-option').click();flush();assert.ok(!next.disabled);next.click();flush();
assert.equal(window.location.hash,'#lab/quadratic/sign');assert.match(lab.querySelector('.lab2-step').textContent,/2\/6/);
// every experiment: a handle drag adds or removes no element and changes the state; the camera stays; keys move one step
for(const ref of ['quadratic/vertex','trig/quadrants','sequences/difference','derivative/where','integral/bound','probability/mean','vectors/collinear','statistics/box','complex/angles','line/slope','exponential/base','cobweb/slope','matrix/columns','space-lines/parallel','space-lines/normal']){
  await go('#lab/'+ref);const L=document.querySelector('.lab2'),A=L.__lab,cv=L.querySelector('canvas'),hs=[...L.querySelectorAll('.lab2-handle')];
  assert.ok(hs.length>=1&&hs.length<=2,ref+': one or two handles are unlocked');
  const centreOf=h=>{const m=/translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(h.style.transform);return [+m[1]+22,+m[2]+22];};
  const rec=[],obs=new window.MutationObserver(rs=>{for(const r of rs)if(r.type==='childList')for(const n of [...r.addedNodes,...r.removedNodes])rec.push(n.nodeName);});obs.observe(L,{childList:true,subtree:true});
  const before=JSON.stringify(A.getState()),[x0,y0]=centreOf(hs[0]);press(cv,'pointerdown',x0,y0);
  for(let i=1;i<=14;i++){press(cv,'pointermove',x0+i*11,y0-i*(i%2?6:-3));flush();}
  press(cv,'pointerup',x0+154,y0-30);flush();await new Promise(r=>setTimeout(r,400));flush();obs.disconnect();
  assert.deepEqual(rec,[],ref+': a drag adds or removes no element and replaces no text node');
  assert.notEqual(JSON.stringify(A.getState()),before,ref+': the handle moved the state');assert.equal(A.stage.nav.camera.scale,1,ref+': the camera does not depend on the state');
  const kb=JSON.stringify(A.getState());hs[0].dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));hs[0].dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));flush();
  assert.ok(!/NaN|undefined|Infinity/.test(L.textContent),ref+': finite text');
}
// the 3D template: a drag on the empty background turns the view (no element added, state and 2D camera untouched), arrows turn it
// with the canvas focused, 0 brings it back; a wheel zooms; the angles never depend on the state
await go('#lab/space-lines/parallel');{const L=document.querySelector('.lab2'),A=L.__lab,cv=L.querySelector('canvas'),cam=A.stage.camera3,rec=[],obs=new window.MutationObserver(rs=>{for(const r of rs)if(r.type==='childList')for(const n of [...r.addedNodes,...r.removedNodes])rec.push(n.nodeName);});
  assert.ok(cam,'the space stage exposes its view angles');const y0=cam.yaw,p0=cam.pitch,st=JSON.stringify(A.getState());obs.observe(L,{childList:true,subtree:true});
  press(cv,'pointerdown',60,60);for(let i=1;i<=10;i++){press(cv,'pointermove',60+i*12,60+i*5);flush();}press(cv,'pointerup',180,110);flush();await new Promise(r=>setTimeout(r,400));flush();obs.disconnect();
  assert.deepEqual(rec,[],'turning the view adds or removes no element');assert.ok(Math.abs(cam.yaw-y0)>0.3&&cam.pitch>p0,'the background drag turned the view');
  assert.equal(JSON.stringify(A.getState()),st,'turning never changes the state');assert.equal(A.stage.nav.camera.scale,1);
  const y1=cam.yaw;cv.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));flush();assert.ok(cam.yaw>y1,'an arrow key turns the view');
  assert.ok(cam.pitch<=1.45&&cam.pitch>=0.12);for(let i=0;i<60;i++)cv.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));assert.ok(cam.pitch<=1.45,'the pitch is clamped');
  cv.dispatchEvent(new window.KeyboardEvent('keydown',{key:'0',bubbles:true,cancelable:true}));flush();assert.ok(Math.abs(cam.yaw+0.7)<1e-9&&Math.abs(cam.pitch-0.55)<1e-9,'0 resets the view');
  // a handle drag still moves the state (not the view)
  const hs=[...L.querySelectorAll('.lab2-handle')],m=/translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(hs[0].style.transform),hx=+m[1]+22,hy=+m[2]+22,ang=cam.yaw;
  press(cv,'pointerdown',hx,hy);for(let i=1;i<=8;i++){press(cv,'pointermove',hx+i*14,hy);flush();}press(cv,'pointerup',hx+112,hy);flush();
  assert.notEqual(JSON.stringify(A.getState()),st,'the handle moved the state');assert.equal(cam.yaw,ang,'and did not turn the view');}
// the run buttons of the chance experiment: a click adds experiments and draws without creating an element
await go('#lab/probability/run');{const L=document.querySelector('.lab2'),A=L.__lab,rec=[],obs=new window.MutationObserver(rs=>{for(const r of rs)if(r.type==='childList')for(const n of [...r.addedNodes,...r.removedNodes])rec.push(n.nodeName);});
  assert.equal(A.getState().runs,0);const buttons=[...L.querySelectorAll('[data-control="run"] button')];assert.equal(buttons.length,5);assert.ok(buttons.every(b=>!b.disabled),'the run buttons are unlocked in this mission');
  obs.observe(L,{childList:true,subtree:true});for(const b of buttons.slice(0,4)){b.click();flush();}obs.disconnect();
  assert.equal(A.getState().runs,1111);assert.deepEqual(rec,[],'running experiments adds no element');assert.match(L.querySelector('.lab2-readout').textContent,/1111|1 111/);
  buttons[4].click();flush();assert.equal(A.getState().runs,0,'a new series starts again');}
// a prediction hides the controls instead of showing them locked
await go('#lab/probability/open');{const L=document.querySelector('.lab2');assert.equal(L.querySelectorAll('.lab2-ctl:not([hidden])').length,0,'no control is shown before the prediction');assert.ok(L.querySelector('.lab2-controls').hidden);}
await go('#lab/probability/mean');{const L=document.querySelector('.lab2');assert.ok(!L.querySelector('.lab2-controls').hidden);assert.ok(L.querySelector('[data-control="run"].is-locked:not([hidden])'),'in other missions locked controls stay, disabled');}
// every experiment mounts in both languages, draws finite numbers, and cleans up
const {mountExperiment}=await import('../dist/js/lab/mount.js');const {EXPERIMENTS}=await import('../dist/js/lab/registry.js');
for(const e of EXPERIMENTS)for(const lang of ['fr','en'])for(const mode of ['full','inline'])for(const mission of [null,...e.missions.map(m=>m.id)]){
  const host=document.createElement('div');document.body.append(host);
  const m=mountExperiment(host,mission?e.id+'/'+mission:e.id,{mode,lang});await m.ready;flush();
  assert.ok(host.querySelector('canvas'),e.id+' draws a canvas');assert.ok(host.querySelector('.lab2-prompt').textContent.length>10);assert.ok(!/NaN|undefined|Infinity/.test(host.textContent),e.id+'/'+mission);
  assert.equal(host.querySelector('.lab2-nav')===null,mode==='inline','inline mode has no previous or next');
  m.destroy();flush();assert.equal(host.children.length,0,'destroy removes the experiment');host.remove();
}
const missing=document.createElement('div');document.body.append(missing);mountExperiment(missing,'nope',{lang:'fr'});assert.match(missing.textContent,/n’existe pas/);
await go('#lab');assert.equal(document.querySelectorAll('.lab2-card-link').length,EXPERIMENTS.length,'the index lists all experiments');
assert.equal(document.querySelectorAll('.lab2-group').length,8,'grouped by template: eight types of activity');assert.equal(document.querySelectorAll('.lab2-card-link[href^="#lab/"]').length,EXPERIMENTS.length);
// the old guided page is gone: no chart, no sliders of the previous design, whatever the route
for(const id of ['probability','vectors','statistics','complex']){await go('#lab/'+id);assert.ok(document.querySelector('.lab2'),id+' is an experiment');assert.equal(document.querySelector('#plot'),null);assert.equal(document.querySelector('[data-param]'),null);}
await go('#lab/nope');assert.ok(/introuvable|not found/i.test(document.querySelector('#main').textContent),'an unknown experiment is a missing page');
// the gallery redirect keeps working
await go('#lab/galton');assert.equal(window.location.hash,'#gallery/galton');assert.ok(document.querySelector('#object-stage canvas'),'a curiosity opens in the gallery');
for(const id of ['voronoi','fastest-slide','soap-films','knots','einstein']){
 window.location.hash='#gallery/'+id;window.dispatchEvent(new window.Event('hashchange'));
 assert.equal(document.querySelector('#object-stage')?.dataset.object,id,'gallery route mounts selected exhibit');
 assert.equal(document.querySelector('#quiz-preset'),null,'empty experiment presets are omitted');
 assert.ok(document.querySelector('#object-stage canvas'));
 assert.ok(!/undefined|NaN/.test(document.querySelector('#main').textContent));
}
console.log('DOM smoke passed: five folding controls, fourteen experiments (drags with no element change, fixed camera, missions, keyboard handles, run buttons, hidden controls in predictions), old guided page gone, gallery redirects; canvas arguments finite.');
dom.window.close();

