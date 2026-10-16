// DOM integration checks with a recording canvas. This does not claim browser or pixel rendering QA.
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
const dom=new JSDOM('<a class="skip" href="#main">Skip</a><div id="app"></div>',{url:'https://example.org/#lab/quadratic',pretendToBeVisual:true});
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
window.HTMLElement.prototype.scrollIntoView=function(){};
globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}};
window.SVGElement.prototype.getScreenCTM=()=>({inverse(){return this;}});
let segments=0;const allArgs=[];
window.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:s=>({width:String(s).length*8}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:()=>({data:new Uint8ClampedArray(16)})},{get(target,key){if(key in target)return target[key];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(key)} received ${n}`);if(key==='lineTo')segments++;allArgs.push([key,args]);};},set(target,key,value){target[key]=value;return true;}});};
globalThis.fetch=async url=>{const rel=String(url).replace(/^\.\//,'').split('?')[0];try{return {ok:true,json:async()=>JSON.parse(await readFile(new URL('../dist/'+rel,import.meta.url),'utf8'))};}catch{return{ok:false,status:404};}};
const pair=(fr,en)=>fr,t=(fr,en)=>fr;
const {mountComplex}=await import('../site/js/complex-explorer.js');
let changed;const root=document.createElement('div');document.body.append(root);
let stop=mountComplex(root,{t,lang:'fr',initialValues:[3,4],onChange:z=>changed=z});
assert.equal(root.querySelectorAll('canvas').length,2);assert.ok(segments>=60,'base axes and grid must draw');assert.match(root.querySelector('#cx-read').textContent,/\|z\| = 5/);
for(const mode of ['translate','multiply','square','inverse','conjugate']){root.querySelector('#cx-mode').value=mode;root.querySelector('#cx-mode').dispatchEvent(new Event('change'));root.querySelector('[data-cx-step="3"]').click();assert.ok(!/NaN|Infinity|undefined/.test(root.textContent));}
root.querySelector('#cx-mode').value='inverse';root.querySelector('#cx-mode').dispatchEvent(new Event('change'));
for(const id of ['zr','zi']){const el=root.querySelector('#cx-'+id);el.value=0;el.dispatchEvent(new Event('input'));}
assert.deepEqual(changed,[0,0]);assert.match(root.querySelector('#cx-read').textContent,/non défini/);root.querySelector('canvas').dispatchEvent(new window.WheelEvent('wheel',{deltaY:-50,clientX:320,clientY:200,cancelable:true}));assert.deepEqual(changed,[0,0]);assert.equal(root.querySelector('[data-view]'),null);stop();root.remove();
const {mountObject}=await import('../site/js/lab-objects.js');const solidRoot=document.createElement('div');document.body.append(solidRoot);stop=mountObject('platonic',solidRoot,{lang:'fr',reduced:true});
for(const id of ['tetrahedron','cube','octahedron','dodecahedron','icosahedron']){solidRoot.querySelector(`[data-solid="${id}"]`).click();solidRoot.querySelector('#pl-open').click();assert.equal(solidRoot.querySelector('#pl-fold').value,'0');solidRoot.querySelector('#pl-play').click();assert.equal(solidRoot.querySelector('#pl-fold').value,'100');}
solidRoot.querySelector('#pl-p').value=6;solidRoot.querySelector('#pl-p').dispatchEvent(new Event('input'));solidRoot.querySelector('#pl-q').value=3;solidRoot.querySelector('#pl-q').dispatchEvent(new Event('input'));assert.equal(solidRoot.querySelector('#pl-build-case').disabled,true);stop();solidRoot.remove();
await import('../dist/js/app.js');
const old=document.querySelector('#plot svg').innerHTML.match(/class="gridline"/g).length;
const first=document.querySelector('#plot svg').querySelector('.gridline').getAttribute('d');
const slider=document.querySelector('#param-2');slider.value='4';slider.dispatchEvent(new Event('input'));slider.dispatchEvent(new Event('change'));
assert.equal(document.querySelector('#plot svg').querySelector('.gridline').getAttribute('d'),first,'moving a parameter must keep the axes fixed');assert.equal(document.querySelector('#plot svg').innerHTML.match(/class="gridline"/g).length,old);
document.querySelector('#plot').dispatchEvent(new window.WheelEvent('wheel',{deltaY:-50,clientX:320,clientY:200,cancelable:true}));assert.equal(document.querySelector('[data-view]'),null);assert.notEqual(document.querySelector('#plot svg').querySelector('.gridline').getAttribute('d'),first,'explicit zoom changes the view');
console.log('DOM smoke passed: complex maps, singularities, base grid, five folding controls, fixed axes, explicit zoom; canvas arguments finite.');
dom.window.close();
