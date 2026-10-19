// Direct cookie transfers and accessible arithmetic surfaces under DOM events; browser touch checks live in browser.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {activity} from '../site/js/challenges/cookies/activity.js';
import {mountExperiment} from '../site/js/lab/mount.js';
import {readFileSync} from 'node:fs';

function setup(){
 const dom=new JSDOM('<main></main>',{pretendToBeVisual:true}),w=dom.window;
 for(const key of ['window','document','Event','CustomEvent'])globalThis[key]=w[key];
 let number=0;const frames=new Map();globalThis.requestAnimationFrame=f=>{frames.set(++number,f);return number;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
 const flush=()=>{for(let turn=0;turn<8&&frames.size;turn++){const work=[...frames];frames.clear();work.forEach(([,f])=>f(0));}};
 return {dom,w,frames,flush};
}
test('Fermat and Euler show exact nested expressions and factors without a canvas or scrolling gestures',async()=>{
 const {dom,w,frames,flush}=setup();const host=document.querySelector('main');
 for(const lang of ['fr','en'])for(const mode of ['full','inline','slide'])for(const id of ['fermat','euler-primes']){
  const side=document.createElement('aside');document.body.append(side);
  const A=mountExperiment(host,id,{mode,lang,controls:side,readout:side,hint:side});await A.ready;flush();
  assert.equal(host.querySelector('canvas'),null);assert.equal(host.querySelector('.lab2-zoom'),null);
  const surface=host.querySelector('.lab2-calculation');assert.ok(surface);assert.equal(surface.querySelectorAll('math').length,2);
  for(const type of ['wheel','pointerdown','touchstart']){const e=new w.Event(type,{bubbles:true,cancelable:true});surface.dispatchEvent(e);assert.equal(e.defaultPrevented,false,'readable maths never consumes scrolling gestures');}
  if(id==='fermat'){
   A.setState({e:4});flush();assert.equal(surface.querySelector('.lab2-number-value').textContent,'= 17');assert.ok(surface.querySelector('msup > msup'),'the Fermat exponent is genuinely nested');
   A.setState({e:32});flush();assert.equal(surface.querySelector('.lab2-number-value').textContent,'= 4294967297');assert.match(surface.querySelectorAll('math')[1].textContent,/641×6700417/);
   A.setState({e:12});flush();assert.equal(surface.querySelector('msub'),null,'non-Fermat exponents are not labelled F_n');assert.match(surface.querySelectorAll('math')[1].textContent,/17×241/);
  }else{
   A.setState({n:40,c:41});flush();assert.equal(surface.querySelector('.lab2-number-value').textContent,'= 1681');assert.match(surface.querySelectorAll('math')[1].textContent,/1681=412/);assert.equal(surface.querySelectorAll('math')[1].querySelector('msup').textContent,'412');
   A.setState({n:39});flush();assert.equal(surface.querySelector('.lab2-number-kind').dataset.prime,'true');
  }
  A.setMission(1);flush();assert.equal(A.shell.index,1);A.destroy();assert.equal(frames.size,0);side.remove();
 }
 dom.window.close();
});
test('cookies are visually identical, children distinct, and transfers preserve only recipient counts',()=>{
 const {dom,w}=setup(),root=document.querySelector('main'),t=(fr,en)=>fr;
 const stop=activity(root,{t,q:{n:3,k:3,rule:'any'}}),stage=root.querySelector('.ck-sharing'),cookies=[...root.querySelectorAll('[data-cookie]')],child=i=>root.querySelector(`[data-child="${i}"]`),parts=()=>stage.dataset.parts;
 assert.equal(new Set(cookies.map(b=>b.innerHTML)).size,1);assert.equal(new Set([...root.querySelectorAll('.ck-child svg')].map(s=>s.innerHTML)).size,3);
 assert.equal(root.querySelector('.toy-handle'),null,'there are no plus/minus allocation buttons');
 cookies[0].click();child(0).click();cookies[1].click();child(1).click();cookies[2].click();child(2).click();assert.equal(parts(),'1,1,1');assert.equal(root.querySelector('#ck-note').disabled,false);
 root.querySelector('#ck-note').click();assert.match(root.querySelector('#ck-read').textContent,/notés : 1/);
 // Swap two physically identical cookies: this must still be the same mathematical sharing.
 cookies[0].click();child(1).click();cookies[1].click();child(0).click();root.querySelector('#ck-note').click();assert.match(root.querySelector('#ck-read').textContent,/notés : 1.*déjà noté/);
 cookies[0].click();root.querySelector('.ck-return').click();assert.equal(stage.dataset.left,'1');assert.equal(root.querySelector('#ck-note').disabled,true);
 const ptr=(el,type,x,y,id=1)=>{const e=new w.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y});Object.defineProperty(e,'pointerId',{value:id});el.dispatchEvent(e);return e;};
 document.elementFromPoint=()=>child(2);
 ptr(cookies[0],'pointerdown',20,20);ptr(stage,'pointermove',120,150);assert.ok(document.querySelector('.ck-cookie-ghost'));ptr(stage,'pointerup',120,150);assert.equal(parts(),'1,0,2');assert.equal(document.querySelector('.ck-cookie-ghost'),null);
 // Off-object drops, cancellation, Escape and a second finger never distribute a cookie.
 document.elementFromPoint=()=>document.body;const before=parts();ptr(cookies[2],'pointerdown',20,20);ptr(stage,'pointermove',120,150);ptr(stage,'pointerup',120,150);assert.equal(parts(),before);
 ptr(cookies[2],'pointerdown',20,20);ptr(stage,'pointermove',120,150);stage.dispatchEvent(new w.Event('pointercancel'));assert.equal(parts(),before);assert.equal(document.querySelector('.ck-cookie-ghost'),null);
 ptr(cookies[2],'pointerdown',20,20);ptr(stage,'pointerdown',50,50,2);ptr(stage,'pointerup',120,150);assert.equal(parts(),before);
 cookies[2].click();stage.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));child(0).click();assert.equal(parts(),before);
 const e=new w.Event('touchstart',{bubbles:true,cancelable:true});child(1).dispatchEvent(e);assert.equal(e.defaultPrevented,false);
 root.querySelector('#ck-reset').click();assert.equal(parts(),'0,0,0');assert.equal(root.querySelectorAll('[data-cookie]').length,3);
 ptr(cookies[0],'pointerdown',10,10);ptr(stage,'pointermove',50,50);stop();assert.equal(document.querySelector('.ck-cookie-ghost'),null);cookies[0].click();child(1).click();assert.equal(parts(),'0,0,0');
 dom.window.close();
});
test('the at-least-one rule still validates physical shares',()=>{
 const {dom}=setup(),root=document.querySelector('main');const stop=activity(root,{t:(fr,en)=>en,q:{n:3,k:2,rule:'one'}});
 for(const cookie of root.querySelectorAll('[data-cookie]')){cookie.click();root.querySelector('[data-child="0"]').click();}
 assert.equal(root.querySelector('#ck-note').disabled,true);root.querySelector('[data-cookie]').click();root.querySelector('[data-child="1"]').click();assert.equal(root.querySelector('#ck-note').disabled,false);stop();dom.window.close();
});
test('mission text is not constrained to an internal scrolling viewport',()=>{
 const css=readFileSync(new URL('../site/styles/pages.css',import.meta.url),'utf8');
 const card=css.match(/\.lab2-card \{ display: flex;[^}]+\}/)?.[0];assert.ok(card);assert.match(card,/max-height: none/);assert.match(card,/overflow: visible/);assert.doesNotMatch(card,/contain|sticky/);
});

test('continuous sampling obeys speed, pause, completion counts, reduced motion and the trial limit',async()=>{
 const {dom}=setup();const {samplingStream}=await import('../site/js/lab/templates/stream.js');
 let state={runs:0},callback=null,reduced=false,stops=0;const changes=[];
 const stage={reduced:()=>reduced,invalidate(){},animate(fn){callback=fn;return()=>{callback=null;stops++;};}};
 const stream=samplingStream({exp:{model:{MAX_RUNS:8}},stage,getState:()=>state,advance:p=>{state={...state,...p};}});stream.onChange=on=>changes.push(on);
 stream.toggle();assert.equal(stream.playing,true);callback(0);callback(100);assert.equal(state.runs,0,'in-flight drops do not inflate the tally');assert.equal(stream.progress,.5);callback(200);assert.equal(state.runs,1);
 stream.setRate(20);callback(250);assert.equal(state.runs,2,'speed changes take effect without pausing');assert.equal(stream.playing,true);stream.toggle();assert.equal(stream.playing,false);assert.equal(callback,null);assert.equal(stream.progress,null);
 stream.toggle();callback(1000);callback(1100);assert.equal(state.runs,4);stream.stop();
 reduced=true;stream.toggle();assert.equal(state.runs,5);assert.equal(stream.playing,false);assert.equal(callback,null,'reduced motion adds one explicit sample without automatic motion');
 reduced=false;stream.toggle();callback(1400);reduced=true;callback(1450);assert.equal(stream.playing,false,'a preference change immediately stops an existing animation');assert.equal(state.runs,5);
 reduced=false;stream.setRate(60);stream.toggle();callback(2000);callback(2100);assert.equal(state.runs,8);assert.equal(stream.playing,false);assert.equal(callback,null);stream.toggle();assert.equal(callback,null,'reaching the limit cannot silently restart a series');assert.ok(stops>=3);assert.ok(changes.includes(true)&&changes.includes(false));dom.window.close();
});

test('new needles land and chords grow to exactly the seeded endpoints before being counted',async()=>{
 const {default:buffon}=await import('../site/js/lab/experiments/buffon.js'),{default:bertrand}=await import('../site/js/lab/experiments/bertrand.js');
 for(const exp of [buffon,bertrand]){
  const s={...exp.state,runs:5},next=exp.model.model({...s,runs:6}).shown.at(-1);
  const start=exp.views.figure.scene(s,{progress:0}).lines.at(-1),end=exp.views.figure.scene(s,{progress:1}).lines.at(-1);
  assert.deepEqual(end.a,next.a);assert.deepEqual(end.b,next.b);assert.equal(exp.model.model(s).runs,5);
  if(exp.id==='bertrand')assert.deepEqual(start.a,start.b);else assert.ok(start.a[1]>next.a[1]);
 }
});

test('sampling controls run inside the real mission shell, stop on parameter changes and clean up on navigation',async()=>{
 const {dom,w,frames,flush}=setup();
 globalThis.devicePixelRatio=1;globalThis.getComputedStyle=w.getComputedStyle.bind(w);globalThis.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn([]);}disconnect(){}};
 w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:640,height:440});
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({measureText:s=>({width:String(s).length*8})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});};
 let now=0;const tick=dt=>{now+=dt;const work=[...frames.values()];frames.clear();work.forEach(fn=>fn(now));};
 for(const id of ['buffon','bertrand']){
  const host=document.querySelector('main'),A=mountExperiment(host,id,{mode:'full',lang:'en'});await A.ready;flush();
  const button=host.querySelector('.lab2-stream-toggle'),speed=host.querySelector('.lab2-stream-speed input');assert.ok(button&&speed);button.click();tick(16);for(let i=0;i<80;i++)tick(16);assert.ok(A.getState().runs>=5);
  speed.value='60';speed.dispatchEvent(new w.Event('input'));assert.equal(button.getAttribute('aria-pressed'),'true');const old=A.getState().runs;for(let i=0;i<60;i++)tick(16);assert.ok(A.getState().runs>=old+50);
  if(id==='buffon'){const length=host.querySelector('[data-control="L"] input');length.value='.5';length.dispatchEvent(new w.Event('input'));}
  else host.querySelector('[data-control="method"] button').click();
  assert.equal(button.getAttribute('aria-pressed'),'false');const stopped=A.getState().runs;for(let i=0;i<10;i++)tick(20);assert.equal(A.getState().runs,stopped);
  button.click();A.setMission(1);assert.equal(button.getAttribute('aria-pressed'),'false');button.click();A.destroy();assert.equal(frames.size,0);
 }
 dom.window.close();
});
