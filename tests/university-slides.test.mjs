import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';

async function load(n){
 const source=new URL('../content/slides/university/foundations/',import.meta.url),head=fs.readFileSync(new URL('shell_head.html',source),'utf8');
 const dom=new JSDOM(head.substring(0,head.lastIndexOf('<script>')),{runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;let frame,errors=[];
 w.console.error=e=>errors.push(e);w.document.fonts={load:()=>Promise.resolve()};w.matchMedia=()=>({matches:false});
 w.MathJax={startup:{promise:Promise.resolve()},tex2svg:s=>{assert.ok(!/NaN|Infinity|undefined/.test(s),s);const e=w.document.createElementNS('http://www.w3.org/2000/svg','svg');e.textContent=s;return e;}};
 w.requestAnimationFrame=f=>{frame=f;return 1;};w.cancelAnimationFrame=()=>{};
 w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:1280,height:720});w.HTMLElement.prototype.setPointerCapture=()=>{};
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({measureText:s=>({width:String(s).length*8})},{get(t,k){return k in t?t[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),k+' '+a);};},set(t,k,v){t[k]=v;return true;}});};
 w.eval(fs.readFileSync(new URL('lib.js',source),'utf8')+'\n'+fs.readFileSync(new URL('deck'+n+'.js',source),'utf8')+'\nboot();');
 await new Promise(r=>setTimeout(r,0));return{dom,w,E:w.__E,draw(){frame?.(1000);assert.equal(errors.length,0,String(errors[0]));}};
}
test('all university scenes and selector modes render finite canvas values; zoom keeps picking invertible',async()=>{
 let count=0;
 for(let n=1;n<=6;n++){
  const a=await load(n),{E,w}=a;
  for(let i=0;i<E.S().length;i++){
   E.load(i);E.setAll(true);a.draw();count++;
   for(const selector of E.S()[i].sel||[])for(const [value]of selector.opts){
    const b=[...w.document.querySelectorAll('#sel [data-v]')].find(b=>b.getAttribute('data-v')===String(value)&&E.S()[i].sel[+b.getAttribute('data-g')].k===selector.k);b?.click();a.draw();
   }
  }
  const before=E.state().P;w.document.querySelector('canvas').dispatchEvent(new w.WheelEvent('wheel',{deltaY:-Math.log(1.25)/.005,cancelable:true}));assert.equal(E.camera().k,1.25);assert.equal(E.state().P,before);
  const [x,y]=E.point({clientX:920+E.camera().x+80*E.camera().k,clientY:280+E.camera().y+40*E.camera().k});assert.ok(Math.abs(x-1000)<1e-9&&Math.abs(y-320)<1e-9);
  a.dom.window.close();
 }
 assert.ok(count>=24);
});
test('moving set elements and disks updates cardinalities and counterexample claims',async()=>{
 const a=await load(3),{E}=a;E.load(3);let p=E.state().P;p.mode=0;p.ax=[1,1,2,2];p.by=[3,3,3,3];
 const lines=E.S()[3].steps[1].f();assert.match(lines[0].t,/=2\\times1=2$/);
 E.load(4);p=E.state().P;p.A={x:5,y:5,r:3};p.B={x:5,y:5,r:3};p.X={x:5,y:5,r:1};
 const text=E.S()[4].steps[2].f().map(x=>x.t).join(' ');assert.ok(!text.includes('L’inclusion est stricte'));assert.match(text,/égalité/);
 // A very small protrusion is detected by exact disk geometry, even between samples.
 p.A={x:0,y:0,r:1};p.B={x:0,y:0,r:1};p.X={x:.000001,y:0,r:1};assert.match(E.S()[4].steps[1].f()[0].t,/Faux/);
 p.A={x:-.5,y:0,r:1.2};p.B={x:.5,y:0,r:1.2};p.X={x:0,y:0,r:1};assert.ok(E.S()[4].steps[1].f()[1].t.includes('Vrai'));
 p.A.r=p.B.r=.9;assert.ok(E.S()[4].steps[1].f()[1].t.includes('Faux'));
 a.dom.window.close();
});
test('replacement examples agree with independent calculations',async()=>{
 const a=await load(3);a.E.load(0);const s=a.E.S()[0];s.on('pre',1);
 const sets=a.w.sets31();assert.deepEqual(JSON.parse(JSON.stringify(sets)),[[0,3,6],[5,6,7,8],[1,3,5,7]]);
 assert.equal(a.w.EXPR.length,6);a.dom.window.close();
 const b=await load(5);
 for(const p of b.w.PR51){const z={x:p[0],y:p[1]},sq=b.w.cmul(z,z);assert.ok(Number.isFinite(sq.x)&&Number.isFinite(sq.y));}
 for(const p of b.w.PR52)for(const z of b.w.roots52(p.b,p.c)){
  const square={x:z.x*z.x-z.y*z.y,y:2*z.x*z.y};
  assert.ok(Math.hypot(square.x+p.b.x*z.x-p.b.y*z.y+p.c.x,square.y+p.b.x*z.y+p.b.y*z.x+p.c.y)<1e-10);
 }
 b.E.load(2);const q=b.w.bc53();assert.equal(q.b.x,-3);assert.equal(q.b.y,2);assert.equal(q.c.x,8);assert.equal(q.c.y,6);b.dom.window.close();
 const c=await load(6),plain=x=>JSON.parse(JSON.stringify(x));
 assert.deepEqual(plain(c.w.img2([[-2,2]])),[[2,11]]);assert.deepEqual(plain(c.w.pre2([[3,6]])),[[-1,0],[2,3]]);
 assert.deepEqual(plain(c.w.pre2([[-2,1]])),[]);assert.deepEqual(plain(c.w.pre2([[2,2]])),[[1,1]]);
 c.E.load(0);c.E.state().P.x=-.5;let text=c.E.S()[0].steps[2].f().map(q=>q.t).join(' ');assert.match(text,/4x\+2=0/);
 c.E.load(3);
 for(const [x,y]of [[0,2],[2,4],[2.5,5],[3.5,6],[4,6.5]]){
  c.E.state().P.x=x;text=c.E.S()[3].steps[1].f()[1].t;assert.ok(text.endsWith('='+String(y).replace('.','{,}')),text);
 }
 c.dom.window.close();
});

test('foundation keyboard movement accumulates across snapped handle positions',async()=>{
 const a=await load(1),{E,w}=a;E.load(4);a.draw();const canvas=w.document.querySelector('canvas'),before=E.state().P.n;
 for(let i=0;i<10;i++){canvas.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));a.draw();}
 assert.notEqual(E.state().P.n,before);a.dom.window.close();
});
