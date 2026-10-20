// Independent model checks and real DOM events for direct manipulation; no claim of browser/pixel QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { flyMotion, meetTime, flyTrace, flyNumber } from '../site/js/challenges/fly/maths.js';
import { activity as flyActivity } from '../site/js/challenges/fly/activity.js';
import { activity as jugActivity } from '../site/js/challenges/jugs/activity.js';
import { normalise, defaults, mountActivity } from '../site/js/challenges/registry.js';
import { normaliseKnot, cameraKnot, projectedKnotCrossings, knotCrossingBridge } from '../site/js/gallery-knot-geometry.js';
import { KNOT_CATALOGUE } from '../site/js/knot-catalogue.js';
import { drawKnotStrand } from '../site/js/gallery-knot-render.js';

test('preview-style strands draw near crossings last with a matching background gap', () => {
  const strokes=[];let a,b;
  const g={save(){},restore(){},beginPath(){},moveTo(x,y){a=[x,y];},lineTo(x,y){b=[x,y];},stroke(){strokes.push({a,b,ink:this.strokeStyle,width:this.lineWidth});}};
  // Closed spatial quadrilateral: crossing diagonals at (0,0), with one clearly in front.
  const P=[[-20,-20,-1],[20,20,-1],[-20,20,1],[20,-20,1]];
  for(const background of ['#ffffff','#131a28'])for(const mirror of [false,true]){
    strokes.length=0;
    const points=P.map(([x,y,z])=>[x,y,mirror?-z:z]);
    drawKnotStrand(g,points,{ink:'#3366cc',background});
    assert.equal(strokes.length,8,'every segment, including the closing one, is painted');
    const last=strokes.slice(-2),expected=mirror?P.slice(0,2):P.slice(2);
    assert.deepEqual(last[0].a,expected[0].slice(0,2));assert.deepEqual(last[0].b,expected[1].slice(0,2));
    assert.equal(last[0].ink,background);assert.equal(last[0].width,9);
    assert.equal(last[1].ink,'#3366cc');assert.equal(last[1].width,5);
    assert.deepEqual(P,[[-20,-20,-1],[20,20,-1],[-20,20,1],[20,-20,1]],'rendering leaves geometry unchanged');
  }
});

test('fly motion agrees with independent collision stepping, including fast custom values and late bounces', () => {
  for (const [D, a, b, w] of [[200,50,50,500],[137,31,47,250],[2000,1,1,3000],[1,299,300,301],[19,3,7,11]]) {
    const T = D / (a + b); let time = 0, x = 0, dir = 1;
    for (let leg = 0; leg < 18000; leg++) {
      const gap = D - (a + b) * time; if (gap < D * 1e-8) break;
      const dt = gap / (w + (dir > 0 ? b : a));
      for (const f of [.1, .5, .9]) {
        const t = time + f * dt, m = flyMotion(D,a,b,w,t), expected = x + dir * w * f * dt;
        assert.ok(Math.abs(m.positions[2] - expected) < D * 2e-9, `${D},${a},${b},${w},${leg}`);
        assert.equal(m.direction, dir); assert.equal(m.completed, leg);
        assert.ok(Math.abs(m.nextTime - (time + dt)) < T * 1e-10);
      }
      x += dir * w * dt; time += dt; dir *= -1;
    }
    const end = flyMotion(D,a,b,w,T); assert.equal(end.positions[2], a*T);
    assert.equal(end.completed, Infinity);
  }
  assert.equal(flyMotion(2000,1,1,3000,999).completed > 400, true, 'no finite-leg extrapolation near the meeting');
  for(const q of [[1,1,1,3000],[1,300,300,301],[137,31,47,250]])for(const f of [.1,.8,.999,1]){
    const T=meetTime(...q.slice(0,3)),trace=flyTrace(...q,T*f),motion=flyMotion(...q,T*f);
    assert.ok(trace.points.length<=601);assert.deepEqual(trace.current,[motion.positions[2],T*f]);
    if(trace.envelope)assert.equal(trace.envelope[2][1],T*f,'unresolved oscillations extend to the actual time');
    else assert.ok(Math.abs(trace.points.at(-1)[1]-T*f)<1e-12);
  }
  assert.ok(Number(flyNumber(1/600))>0);assert.ok(Number(flyNumber(1e-8))>0);
});

test('editable tuples accept non-presets and reject invalid ranges, fractions and fly speeds', () => {
  assert.equal(normalise('fly', {trip:'137,31,47,250'}).trip,'137,31,47,250');
  assert.equal(normalise('jugs', {jugs:'8,13,7'}).jugs,'8,13,7');
  for (const trip of ['0,31,47,250','100,31,47,20','100,31.5,47,250','100,31,47,NaN']) assert.equal(normalise('fly',{trip}).trip,defaults('fly').trip);
  for (const jugs of ['0,13,7','31,13,7','8,13,0','8,13,1.5']) assert.equal(normalise('jugs',{jugs}).jugs,defaults('jugs').jugs);
});

test('crossing cues follow the actual front strand after orbiting and mirroring', () => {
  const at = (P,u) => { const i=Math.floor(u),f=u-i; return P[i].map((x,d)=>x+f*(P[(i+1)%P.length][d]-x)); };
  for (const entry of KNOT_CATALOGUE) for (const mirror of [false,true]) {
    const P = cameraKnot(normaliseKnot(entry), .21, .65, mirror);
    for (const c of projectedKnotCrossings(P).crossings) {
      const over=at(P,c.over),under=at(P,c.under),bridge=knotCrossingBridge(P,c);
      assert.ok(over[2]>under[2]);assert.ok(Math.hypot(over[0]-under[0],over[1]-under[1])<1e-9);
      assert.ok(bridge.some(p=>p.every((x,d)=>Math.abs(x-over[d])<1e-10)));
      assert.ok(bridge.flat().every(Number.isFinite));
      // Each cue point lies on the ORIGINAL piecewise-linear spatial strand, not an invented bridge through space.
      for (const p of bridge) assert.ok(P.some((a,i)=>{
        const b=P[(i+1)%P.length],v=b.map((x,d)=>x-a[d]),v2=v.reduce((s,x)=>s+x*x,0);
        const u=p.reduce((s,x,d)=>s+(x-a[d])*v[d],0)/v2;
        return u>=-1e-8&&u<=1+1e-8&&Math.hypot(...p.map((x,d)=>x-a[d]-u*v[d]))<1e-8;
      }));
    }
  }
});

test('jug objects support tapping, keyboard, dragging and cancellation; fly scene plays without replacing objects', () => {
  const dom = new JSDOM('<main></main>', {pretendToBeVisual:true}), w=dom.window;
  for(const k of ['window','document','CustomEvent','Event'])globalThis[k]=w[k];
  w.SVGElement.prototype.createSVGPoint=()=>({x:0,y:0,matrixTransform(){return this;}});
  w.SVGElement.prototype.getScreenCTM=()=>({inverse(){return this;}});
  w.SVGElement.prototype.setPointerCapture=()=>{};
  let n=0;const frames=new Map();globalThis.requestAnimationFrame=f=>{frames.set(++n,f);return n;};globalThis.cancelAnimationFrame=i=>frames.delete(i);
  const errors=[];w.addEventListener('error',e=>errors.push(e.error||e.message));
  const pointer=(el,type,x,y,id=1)=>{const e=new w.MouseEvent(type,{clientX:x,clientY:y,button:0,bubbles:true});Object.defineProperty(e,'pointerId',{value:id});el.dispatchEvent(e);};
  const key=(el,k)=>el.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true}));
  for(const lang of ['fr','en']){
    const root=w.document.createElement('section');w.document.body.append(root);const t=(fr,en)=>lang==='fr'?fr:en;
    let stop=jugActivity(root,{t,q:{jugs:'3,5,4'},reduced:true});const svg=root.querySelector('.jg-svg'),jug=i=>root.querySelector(`[data-jug="${i}"]`),tap=root.querySelector('[data-destination="tap"]'),sink=root.querySelector('[data-destination="sink"]');
    const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    assert.equal(root.querySelector('.jg-moves'),null);assert.equal(svg.dataset.state,'0,0');
    pointer(jug(0),'pointerdown',25,40);pointer(svg,'pointerup',25,40);click(svg);
    assert.equal(jug(0).getAttribute('aria-pressed'),'true','a captured tap activates its ORIGINAL jug');
    click(jug(0));
    click(jug(0));click(tap);assert.equal(svg.dataset.state,'3,0');
    click(jug(0));click(jug(1));assert.equal(svg.dataset.state,'0,3');
    key(jug(1),'Enter');key(tap,'Enter');assert.equal(svg.dataset.state,'0,5');
    pointer(jug(1),'pointerdown',75,40);pointer(svg,'pointermove',25,40);pointer(svg,'pointerup',25,40);assert.equal(svg.dataset.state,'3,2');
    // Captured drag generates a click on the SVG in a browser; it must not count twice.
    click(svg);assert.equal(svg.dataset.state,'3,2');
    click(jug(0));click(sink);assert.equal(svg.dataset.state,'0,2');
    pointer(jug(1),'pointerdown',75,40);pointer(svg,'pointermove',50,80);svg.dispatchEvent(new w.Event('pointercancel'));pointer(svg,'pointerup',50,80);assert.equal(svg.dataset.state,'0,2');
    root.querySelector('#jg-undo').click();assert.equal(svg.dataset.state,'3,2');
    root.querySelector('#jg-reset').click();assert.equal(svg.dataset.state,'0,0');
    // Off-scene drops are never interpreted as the tap or sink.
    pointer(jug(0),'pointerdown',25,40);pointer(svg,'pointermove',50,-80);pointer(svg,'pointerup',50,-80);assert.equal(svg.dataset.state,'0,0');
    click(svg);stop();
    stop=flyActivity(root,{t,lang,q:{trip:'200,50,50,500'},reduced:false});
    const scene=root.querySelector('svg'),fly=root.querySelector('.fl-fly');let now=performance.now();
    pointer(scene,'pointerdown',50,15);pointer(scene,'pointerup',50,15);
    for(let i=0;i<320;i++){now+=16;const work=[...frames.values()];frames.clear();work.forEach(f=>f(now));}
    assert.equal(root.querySelector('.fl-fly'),fly,'movement never reconstructs the fly or train objects');
    assert.ok(Number(scene.dataset.legs)>=8,'visible rapid repeated bounces in the default scenario');
    key(scene,'Home');assert.equal(scene.dataset.time,'0');
    key(scene,'b');assert.ok(Math.abs(Number(scene.dataset.time)-200/550)<1e-9);
    pointer(scene,'pointerdown',10,15);pointer(scene,'pointermove',52,15);pointer(scene,'pointerup',52,15);assert.ok(Number(scene.dataset.time)>meetTime(200,50,50)/2);
    const timeBefore=scene.dataset.time;
    pointer(scene,'pointerdown',20,15,2);pointer(scene,'pointerdown',60,15,3);pointer(scene,'pointermove',90,15,2);pointer(scene,'pointerup',90,15,2);pointer(scene,'pointerup',60,15,3);
    assert.equal(scene.dataset.time,timeBefore,'a second pointer cancels scrubbing instead of owning another finger');assert.equal(frames.size,0);
    stop();assert.equal(frames.size,0);root.remove();
  }
  assert.deepEqual(errors,[]);dom.window.close();
});


test('challenge motion callbacks, contact, hidden answers and ordered nail drawing', () => {
  const dom = new JSDOM('<main></main>', {pretendToBeVisual:true}), w = dom.window;
  for (const k of ['window','document','CustomEvent','Event']) globalThis[k] = w[k];
  w.SVGElement.prototype.createSVGPoint = () => ({x:0,y:0,matrixTransform(){return this;}});
  w.SVGElement.prototype.getScreenCTM = () => ({inverse(){return this;}});
  w.SVGElement.prototype.setPointerCapture = () => {};
  const frames = new Map(); let seq = 0;
  globalThis.requestAnimationFrame = f => {frames.set(++seq, f);return seq;};
  globalThis.cancelAnimationFrame = i => frames.delete(i);
  const root = w.document.querySelector('main'), errors = [];
  w.addEventListener('error', e => errors.push(e.error));
  const pointer = (el,type,x,y,id=1) => {const e = new w.MouseEvent(type,{clientX:x,clientY:y,button:0,bubbles:true});Object.defineProperty(e,'pointerId',{value:id});el.dispatchEvent(e);};
  const key = (el,key) => el.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true}));
  const runFrame = now => {const fs = [...frames.values()];frames.clear();fs.forEach(f=>f(now));};
  for (const lang of ['fr','en']) {
    let stop = mountActivity('pegs',root,{lang,reduced:()=>false,params:defaults('pegs')});
    root.querySelector('[data-i="0"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    root.querySelector('[data-i="1"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    assert.equal(frames.size,1,'the real callback-based app mount animates jumps');
    const start = root.querySelector('[data-i="0"] circle.hit').getAttribute('cx');
    runFrame(performance.now()+325);
    assert.notEqual(root.querySelector('[data-i="0"] circle.hit').getAttribute('cx'),start);
    stop();assert.equal(frames.size,0);
    stop = mountActivity('pegs',root,{lang,reduced:()=>true,params:defaults('pegs')});
    root.querySelector('[data-i="0"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));root.querySelector('[data-i="1"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    assert.equal(frames.size,0,'reduced motion remains respected');stop();
    stop = mountActivity('fly',root,{lang,reduced:()=>false,params:defaults('fly')});
    const scene = root.querySelector('svg');key(scene,'b');
    const x = Number(root.querySelector('.fl-fly').getAttribute('transform').match(/translate\(([^ ]+)/)[1]);
    const trains = [...scene.querySelectorAll('g')].filter(g=>g.querySelector('path[d^="M12"]'));
    const trainX = Number(trains[0].getAttribute('transform').match(/translate\(([^ ]+)/)[1]);
    assert.ok(Math.abs(x-trainX)<1e-8,'the first bounce touches the second front face');
    assert.match(root.querySelector('.fl-fly').getAttribute('transform'),/19.5/);
    key(scene,'End');assert.doesNotMatch(root.querySelector('#fl-read').textContent,/1000|distance/);stop();
    stop = mountActivity('nails',root,{lang,reduced:()=>true,params:defaults('nails')});
    const svg = root.querySelector('svg'), tools = root.querySelector('.nl-tools');assert.equal(tools.open,false);
    const stroke = points => {pointer(svg,'pointerdown',...points[0]);for(const p of points.slice(1))pointer(svg,'pointermove',...p);pointer(svg,'pointerup',...points.at(-1));};
    const circle = Array.from({length:81},(_,i)=>[50+26*Math.cos(i*Math.PI/40),14+10*Math.sin(i*Math.PI/40)]);
    stroke(circle);assert.match(root.querySelector('#nl-read').textContent,/2/);
    stroke([...circle].reverse());
    w.document.dispatchEvent(new w.CustomEvent('challenge-action',{detail:{id:'nails',act:'word'}}));
    assert.match(root.querySelector('#nl-read').textContent,lang==='fr'?/tombe/:/falls/,'retracing a two-nail loop cancels it');
    root.querySelector('#nl-clear').click();
    pointer(svg,'pointerdown',20,8);pointer(svg,'pointermove',90,8);svg.dispatchEvent(new w.Event('pointercancel'));pointer(svg,'pointerup',90,8);
    assert.match(root.querySelector('#nl-read').innerHTML,/<strong>0<\/strong>/,'cancelled drawing adds no winding');
    const nail = root.querySelector('[data-nail="0"]');nail.focus();key(nail,'Enter');assert.equal(w.document.activeElement.dataset.nail,'0');key(w.document.activeElement,'Enter');assert.equal(root.querySelector('[data-nail="0"]').getAttribute('aria-pressed'),'false');
    stop();root.replaceChildren();
  }
  assert.deepEqual(errors,[]);dom.window.close();
});
