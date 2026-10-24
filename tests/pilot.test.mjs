// Independent algebra and shared-player controls for the quadratic pilot.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import * as Q from '../site/js/lab/models/quadratic.js';
import exp from '../site/js/lab/experiments/quadratic.js';
import {makeFormat} from '../site/js/lab/format.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('quadratic coordinates preserve the same polynomial across all three forms',()=>{
 for(const a of [-2,-.75,.5,3])for(const alpha of [-2,.5,2])for(const beta of [-2,0,2]){
  const s={a,...Q.fromVertex(a,alpha,beta)};
  for(const x of [-3,-.25,0,1,3])near(a*x*x+s.b*x+s.c,a*(x-alpha)**2+beta);
  for(const form of ['abc','vertex','roots']){
   const state={...s,form},coords=Q.coordinates(state);
   if(form==='roots'&&Q.model(s).roots.length===0){assert.equal(Q.inputForm(state),'vertex');continue;}
   const rebuilt={...state,...Q.editCoordinate(state,0,coords[0])};
   near(rebuilt.b,s.b);near(rebuilt.c,s.c);
   const second={...state,...Q.editCoordinate(state,1,coords[1])};near(second.b,s.b);near(second.c,s.c);
  }
 }
});
test('independent case selectors cover all six cases and retain the other dimension',()=>{
 for(const a of [-2,2])for(const beta of [-2,0,2]){
  const s={a,...Q.fromVertex(a,1,beta)},D=s.b*s.b-4*a*s.c;
  const flip={...s,...exp.controls.orientation.set(s,-Math.sign(a))};
  near(-flip.b/(2*flip.a),1);assert.equal(Math.sign(flip.b*flip.b-4*flip.a*flip.c),Math.sign(D));
  for(const sign of [-1,0,1]){const p={...s,...Q.rootCase(s,sign)};assert.equal(p.a,a);near(-p.b/(2*p.a),1);assert.equal(Math.sign(p.b*p.b-4*p.a*p.c),sign);}
 }
 for(const lang of ['fr','en'])assert.match(exp.views.formula({a:.75,b:1,c:0,form:'abc'},{fmt:makeFormat(lang)}),/≈/,'rounded canonical form is labelled approximate');
});
test('the shared slide exposes parameter forms, valid slider ranges, all cases and fallback',async()=>{
 const dom=new JSDOM('<div id="host"></div><div id="controls"></div><div id="readout"></div><div id="hint"></div>',{pretendToBeVisual:true,url:'https://example.test'}),w=dom.window;
 for(const key of ['window','document','Element','HTMLElement','Node','Event','CustomEvent'])globalThis[key]=key==='window'?w:w[key];
 globalThis.getComputedStyle=w.getComputedStyle.bind(w);globalThis.devicePixelRatio=1;
 const frames=new Map();let id=0;
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 globalThis.matchMedia=w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn([]);}disconnect(){}};
 w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:400,right:640,bottom:400});
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:s=>({width:String(s).length*8})},{get:(o,k)=>o[k]||(()=>{})});};
 const {createShell}=await import('../site/js/lab/shell.js'),tpl=await import('../site/js/lab/templates/family.js');
 const api=createShell(document.querySelector('#host'),exp,tpl,{mode:'slide',lang:'fr',mission:'vertex',controls:document.querySelector('#controls'),readout:document.querySelector('#readout'),hint:document.querySelector('#hint')});
 const flush=()=>{api.flush();for(let i=0;i<2;i++)for(const [key,fn]of[...frames]){frames.delete(key);fn(performance.now());}};flush();
 const control=name=>document.querySelector(`[data-control="${name}"]`);
 assert.ok(['a','form','coordinate1','coordinate2','orientation','rootCase'].every(name=>!control(name).hidden));
 const camera={...api.stage.view};
 control('rootCase').querySelectorAll('button')[2].click();flush();
 assert.ok(Q.model(api.getState()).discriminant<0);
 control('form').querySelectorAll('button')[2].click();flush();
 assert.equal(Q.inputForm(api.getState()),'vertex');assert.match(document.querySelector('#readout').textContent,/Pas de racine réelle/);
 control('form').querySelectorAll('button')[0].click();flush();
 assert.equal(control('coordinate1').querySelector('input').min,'-96');
 const input=control('coordinate1').querySelector('input');input.value='4';input.dispatchEvent(new w.Event('input'));flush();assert.equal(api.getState().b,4);
 assert.deepEqual(api.stage.view,camera,'editing mathematical state keeps the camera');
 const root=api.root;api.destroy();assert.equal(root.isConnected,false);assert.equal(frames.size,0);dom.window.close();
});
