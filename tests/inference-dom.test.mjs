// Native interactions, hidden information and cleanup through the shared laboratory mount.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountExperiment } from '../site/js/lab/mount.js';
import { inferenceExperiments } from '../site/js/lab/experiments/inference.js';
import { INFERENCE_GALLERY, INFERENCE_STORIES } from '../site/js/inference-content.js';

test('inference shares routes and arguments, preserving the four mission contract',()=>{
 const ids=inferenceExperiments.map(e=>e.id);
 assert.deepEqual(ids,['secretary','tank','benford','baker','birthdays','monty']);
 for(const e of inferenceExperiments){
  assert.deepEqual(e.missions.map(m=>m.kind),['predict','explore','check','explain']);
  const reading=INFERENCE_STORIES.find(r=>r.id===e.id),gallery=INFERENCE_GALLERY.find(r=>r.id===e.id+'-gallery');
  assert.ok(reading.links.includes('#lab/'+e.id));assert.ok(gallery.links.includes('#stories/'+e.id));
  assert.deepEqual(reading.sections[1][1][0],e.missions.at(-1).argument);
  const checked={...e.state,...e.missions[2].set};assert.ok(Math.abs(e.model.quantity('benchmark',checked)-e.missions[2].answer)<1e-10);
 }
});

test('all six inference surfaces play in both languages without leaking future choices or retaining frames',async()=>{
 const dom=new JSDOM('<main></main>',{pretendToBeVisual:true}),w=dom.window;
 for(const key of ['window','document','Event','MouseEvent','KeyboardEvent','CustomEvent'])globalThis[key]=w[key];
 let reduced=false,number=0;const frames=new Map();
 globalThis.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
 globalThis.requestAnimationFrame=fn=>{frames.set(++number,fn);return number;};
 globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const tick=(now=100)=>{const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(now);};
 const button=(root,fr,en)=>[...root.querySelectorAll('button')].find(b=>[fr,en].includes(b.textContent));
 const change=(root,key,value)=>{const wrap=root.querySelector(`[data-control="${key}"]`),input=wrap?.querySelector('input,select');assert.ok(wrap,key);if(input){input.value=value;input.dispatchEvent(new w.Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));}else{const exp=inferenceExperiments.find(e=>e.id===root.querySelector('[data-experiment]').dataset.experiment),i=exp.controls[key].options.findIndex(o=>o.value===value);assert.ok(i>=0);wrap.querySelectorAll('button')[i].click();}tick();};
 for(const lang of ['fr','en'])for(const id of inferenceExperiments.map(e=>e.id)){
  const root=w.document.createElement('section');w.document.body.append(root);
  const api=mountExperiment(root,id,{mode:'full',lang});await api.ready;tick();
  assert.ok(root.querySelector('.inference-stage'));assert.ok(!/NaN|undefined|Infinity/.test(root.textContent));
  if(id==='secretary'){
   assert.equal(root.querySelectorAll('.inference-cell:not([hidden])').length,1,'future interviews stay hidden');
   button(root,'Refuser et continuer','Reject and continue').click();tick();assert.equal(api.getState().interview,2);
   button(root,'Accepter maintenant','Accept now').click();tick();assert.equal(api.getState().finished,true);
   assert.equal(root.querySelectorAll('.inference-cell:not([hidden])').length,20,'all true ranks revealed at end');
   change(root,'n',5);assert.equal(api.getState().finished,false);assert.equal(api.getState().interview,1);assert.ok(api.getState().skip<5);
  }
  if(id==='tank'){
   assert.equal(root.querySelector('.inference-chart').hidden,true,'population-dependent sampling distribution hidden until reveal');
   button(root,'Révéler la population','Reveal population').click();tick();assert.equal(api.getState().revealed,1);
   const old=api.getState().N;button(root,'Une expérience','One experiment').click();tick();assert.equal(api.getState().revealed,0);assert.notEqual(api.getState().N,old);
  }
  if(id==='benford'){
   const input=root.querySelector('textarea');input.value='0; -12; 3,4; 2e5';input.dispatchEvent(new w.Event('input'));tick();
   assert.deepEqual(api.getState().values,[0,-12,3.4,200000]);assert.equal(api.getState().mode,'custom');
   change(root,'mode','log');const grow=button(root,'Faire grandir l’échantillon','Grow the sample');grow.click();tick(200);assert.ok(frames.size>0);reduced=true;tick(300);assert.equal(grow.getAttribute('aria-pressed'),'false');reduced=false;
   assert.equal(root.querySelector('.inference-chart').getAttribute('role'),'table','histogram values are accessible table content');
  }
  if(id==='baker'){
   change(root,'mode','selected');assert.match(root.querySelector('.inference-status').textContent,/non calibrés|not calibrated/);
   const old=api.getState().n;button(root,'Peser un pain de plus','Weigh one more loaf').click();tick();assert.equal(api.getState().n,old+1);
  }
  if(id==='birthdays'){
   change(root,'days',16);api.setState({n:17});tick();assert.match(root.querySelector('.inference-status').textContent,/Collision/);
   assert.equal(root.querySelectorAll('.inference-cell[data-match="true"]:not([hidden])').length>0,true);
  }
  if(id==='monty'){
   const doors=[...root.querySelectorAll('.inference-door')];doors[2].click();tick();assert.equal(api.getState().choice,2);
   button(root,'Ouvrir une autre porte','Open another door').click();tick();assert.equal(api.getState().opened,true);
   const m=inferenceExperiments.find(e=>e.id===id).model.model(api.getState());assert.notEqual(m.door,2);assert.notEqual(m.door,m.prize);
   doors.find((_,i)=>i!==m.door&&i!==2).click();tick();assert.equal(api.getState().strategy,'switch');assert.equal(api.getState().finished,true);
   change(root,'host','random');assert.equal(api.getState().finished,false);assert.equal(api.getState().opened,false);
  }
  assert.ok(!/NaN|undefined|Infinity/.test(root.textContent),id);
  api.destroy();assert.equal(frames.size,0,`${id} cancels frames`);root.remove();
 }
 dom.window.close();
});
