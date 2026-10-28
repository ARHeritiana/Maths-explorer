// Real lesson scripts under DOM events; these checks do not replace rendered browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInContext} from 'node:vm';
import {JSDOM} from 'jsdom';

function lesson(id,lang){
 const html=readFileSync(new URL(`../site/resources/basics/${id}${lang==='en'?'.en':''}.html`,import.meta.url),'utf8');
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.test/resources/basics/'+id+'.html'}),w=dom.window;
 const calls=[],timers=[];
 const drawing=new Proxy({},{get:(_,key)=>key==='fillStyle'?undefined:(...args)=>{calls.push([key,...args]);},set:(_,key,v)=>{calls.push([key,v]);return true;}});
 w.HTMLCanvasElement.prototype.getContext=()=>drawing;
 w.matchMedia=()=>({matches:true});w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
 w.setTimeout=fn=>{timers.push(fn);return timers.length;};
 const ctx=dom.getInternalVMContext();
 runInContext(script,ctx);
 const run=code=>runInContext(code,ctx);
 return {dom,w,calls,timers,run};
}

for(const lang of ['fr','en']){
 test(`place-value capacity is enforced at every column in every base (${lang})`,()=>{
  const L=lesson('place-value',lang);
  try{
   for(let base=2;base<=16;base++)for(let p=0;p<4;p++){
    L.run(`S.B=${base};S.c=dig(${base**4-1-base**p},S.B,4);paint()`);
    let button=L.w.document.querySelector(`[data-a="add"][data-p="${p}"]`);
    assert.equal(button.disabled,false,`base ${base}, column ${p}: final legal counter`);
    button.click();
    assert.equal(L.run('val(S.c,S.B)'),base**4-1);
    assert.ok([...L.w.document.querySelectorAll('[data-a="add"]')].every(b=>b.disabled),'all increments blocked at capacity');
    L.run(`S.c=dig(${base**4-base**p},S.B,4);paint()`);
    button=L.w.document.querySelector(`[data-a="add"][data-p="${p}"]`);
    assert.equal(button.disabled,true,`base ${base}, column ${p}: overflow blocked`);
    const before=L.run('JSON.stringify(S.c)');button.click();assert.equal(L.run('JSON.stringify(S.c)'),before);
   }
  }finally{L.dom.window.close();}
 });

 test(`multiplication reset cancels a carry paused between columns (${lang})`,async()=>{
  const L=lesson('multiplication',lang);
  try{
   L.run(`globalThis.plays=0;play=async(items,keep)=>{plays++;S.balls=keep.concat(items.map(i=>i.b).filter(q=>q.a>0));return true};
S.balls=Array.from({length:10},(_,k)=>({z:2,pl:0,k,x:0,y:0,r:4,a:1,f:0,s:-1}));`);
   const task=L.run('carrySteps([{z:2,yt:S.Z2,hh:70}])');
   await Promise.resolve();
   assert.equal(L.run('plays'),1);assert.equal(L.timers.length,1,'carry is paused between columns');
   L.run(`reset();S.balls=Array.from({length:10},(_,k)=>({z:2,pl:1,k,x:0,y:0,r:6,a:1,f:1,s:-1}));S.msg='new calculation'`);
   const replacement=L.run('JSON.stringify(S.balls)');
   L.timers.shift()();assert.equal(await task,false);
   assert.equal(L.run('plays'),1,'discarded carry must not animate the replacement counters');
   assert.equal(L.run('JSON.stringify(S.balls)'),replacement);
   assert.equal(L.run('S.msg'),'new calculation');
  }finally{L.dom.window.close();}
 });

 for(const id of ['multiplication','division'])test(`${id} redraws its counters on a theme mutation (${lang})`,async()=>{
  const L=lesson(id,lang);
  try{
   L.calls.length=0;L.w.document.documentElement.dataset.theme='dark';await Promise.resolve();
   assert.ok(L.calls.some(c=>c[0]==='clearRect'),'theme change redraws canvas without an activity action');
   assert.ok(L.calls.some(c=>c[0]==='fillStyle'&&c[1]==='#9DB0B8'),'canvas uses the newly computed dark palette');
  }finally{L.dom.window.close();}
 });

 test(`place-value 3D camera supports keyboard rotation and bounded zoom (${lang})`,()=>{
  const L=lesson('place-value',lang);
  try{
   // Minimal Three shell: test the actual camera handlers without pretending to render WebGL.
   class Object3D{constructor(){this.position={set(){}};}add(){}}
   L.w.THREE={WebGLRenderer:class{constructor(){this.domElement=L.w.document.createElement('canvas');}setPixelRatio(){}},Scene:Object3D,PerspectiveCamera:Object3D,Group:Object3D,DirectionalLight:Object3D,AmbientLight:Object3D};
   L.run('init3()');const canvas=L.w.document.querySelector('#cvw canvas');
   assert.equal(canvas.tabIndex,0);assert.ok(canvas.getAttribute('aria-label'));
   const key=k=>{const event=new L.w.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true});canvas.dispatchEvent(event);return event;};
   const az=L.run('R3.az');assert.equal(key('ArrowLeft').defaultPrevented,true);assert.ok(L.run('R3.az')>az);
   key('ArrowRight');assert.equal(L.run('R3.az'),az);
   for(let i=0;i<100;i++)key('ArrowUp');assert.equal(L.run('R3.el'),1.5);
   for(let i=0;i<100;i++)key('ArrowDown');assert.equal(L.run('R3.el'),.08);
   for(let i=0;i<100;i++)key('+');assert.equal(L.run('R3.zoom'),8);
   for(let i=0;i<100;i++)key('-');assert.equal(L.run('R3.zoom'),.3);
   key('0');assert.equal(L.run('JSON.stringify([R3.az,R3.el,R3.zoom])'),'[0.35,0.95,1]');
   assert.equal(key('Tab').defaultPrevented,false,'unrelated keyboard navigation is preserved');
   L.run('globalThis.rebuilds=0;build=()=>{rebuilds++}');
   L.w.document.documentElement.dataset.theme='dark';
   return Promise.resolve().then(()=>{assert.equal(L.run('rebuilds'),1);}).finally(()=>L.dom.window.close());
  }catch(e){L.dom.window.close();throw e;}
 });
}
