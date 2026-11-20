// Live measurements of the gallery (issue #37): bead states on the descent tracks, Voronoi cell facts, Fourier error curve,
// glider speed, and the axis helpers of the plot panel. Each value is checked against an independent computation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {cycloid,descentTrack,stateAtTime,voronoiCells,cellFacts,polygonArea} from '../site/js/gallery/gallery-models.js';
import {fourier,arms,errorCurve,heart} from '../site/js/gallery/gallery-math.js';
import {presetSet,step,shapeOf,observedRepeat,shipSpeed} from '../site/js/gallery/gallery-life-model.js';
import {niceTicks,sampleIndices} from '../site/js/gallery/gallery-panels.js';

const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} versus ${b}`);
const G=9.81;

test('straight-line bead: constant acceleration g sin(alpha), speed sqrt(2gy) at every time', () => {
  const end=[4,2],tr=descentTrack([[0,0],end]),L=Math.hypot(...end),acc=G*end[1]/L;
  near(tr.total,Math.sqrt(2*L/acc),1e-12);
  for(const time of [0,.1,.4,tr.total*.9,tr.total]){
    const st=stateAtTime(tr,time),s=acc*time*time/2;
    near(st.dist,s,1e-9);near(st.depth,s*end[1]/L,1e-9);near(st.speed,acc*time,1e-9);near(st.speed,Math.sqrt(2*G*st.depth),1e-9);
  }
  near(stateAtTime(tr,tr.total+1).dist,L,1e-9);
});
test('cycloid bead: exact state, arc length 4a(1 - cos(theta/2)), arrival at the end with speed sqrt(2g y_end)', () => {
  const cy=cycloid([4,2]),fin=stateAtTime(null,cy.time,cy);
  near(fin.pos[0],4,1e-6);near(fin.pos[1],2,1e-6);near(fin.speed,Math.sqrt(2*G*2),1e-6);
  // arc length by summing a fine polyline of the same cycloid
  const th=cy.theta,n=20000;let s=0;for(let i=1;i<=n;i++){const a=th*(i-1)/n,b=th*i/n;s+=Math.hypot(cy.a*(b-Math.sin(b)-a+Math.sin(a)),cy.a*(Math.cos(a)-Math.cos(b)));}
  near(fin.dist,s,1e-6);
  // the speed is sqrt(2gy) along the way, and the cycloid bead is deeper than the straight-line bead early on
  const line=descentTrack([[0,0],[4,2]]);
  for(const time of [.1,.3,.5]){const st=stateAtTime(null,time,cy);near(st.speed,Math.sqrt(2*G*st.depth),1e-9);assert.ok(st.depth>stateAtTime(line,time).depth);}
});
test('Voronoi facts: two seeds share the perpendicular bisector, the frame closes the rest', () => {
  const seeds=[[100,200],[300,200]],cells=voronoiCells(seeds,[0,0,640,440]),F=cellFacts(seeds,cells,0);
  assert.deepEqual(F.neighbours,[1]);near(F.distance,200);assert.equal(F.nearest,1);
  near(F.area,200*440,1e-6);near(F.perimeter,2*(200+440),1e-6);
  const shared=F.edges.filter(e=>e.j===1);assert.equal(shared.length,1);near(shared[0].len,440,1e-6);
  for(const p of [shared[0].a,shared[0].b])near(p[0],200,1e-9);
});
test('Voronoi facts: areas of all cells fill the field; neighbourhood is symmetric', () => {
  const seeds=[[100,100],[285,80],[500,115],[150,315],[365,285],[540,350]],cells=voronoiCells(seeds,[0,0,640,440]);
  near(cells.reduce((s,c)=>s+polygonArea(c),0),640*440,1e-6);
  const facts=seeds.map((_,i)=>cellFacts(seeds,cells,i));
  facts.forEach((F,i)=>F.neighbours.forEach(j=>assert.ok(facts[j].neighbours.includes(i),`${i} and ${j}`)));
  // the disc of radius d/2 about a seed stays in its cell: every edge is at least d/2 away (frame aside)
  facts.forEach((F,i)=>F.edges.filter(e=>e.j>=0).forEach(e=>{const s=seeds[i],[a,b]=[e.a,e.b],u=[b[0]-a[0],b[1]-a[1]],k=Math.max(0,Math.min(1,((s[0]-a[0])*u[0]+(s[1]-a[1])*u[1])/(u[0]**2+u[1]**2)));
    assert.ok(Math.hypot(a[0]+k*u[0]-s[0],a[1]+k*u[1]-s[1])>=F.distance/2-1e-9);}));
});
test('Fourier error curve agrees with the direct reconstruction error on the samples', () => {
  const pts=heart(64),co=fourier(pts),err=errorCurve(co),M=pts.length;
  const rms=Math.sqrt(pts.reduce((s,p)=>s+p[0]**2+p[1]**2,0)/M-(pts.reduce((s,p)=>s+p[0],0)/M)**2-(pts.reduce((s,p)=>s+p[1],0)/M)**2);
  assert.equal(err.length,co.length+1);assert.equal(err[co.length],0);
  for(let n=1;n<err.length;n++)assert.ok(err[n]<=err[n-1]+1e-12);
  const total=Math.sqrt(co.reduce((s,c)=>s+c.amp**2,0));
  for(const n of [1,3,10,40]){let e=0;for(let j=0;j<M;j++){const q=arms(co,j/M,n).at(-1);e+=((q[0]-pts[j][0])**2+(q[1]-pts[j][1])**2)/M;}near(Math.sqrt(e)/total,err[n],1e-9);}
  assert.ok(rms>0);
});
test('glider speed c/4, blinker in place, larger shifts reduced', () => {
  let s=presetSet('glider');const shapes=[shapeOf(s)];for(let i=0;i<8;i++){s=step(s);shapes.push(shapeOf(s));}
  assert.equal(shipSpeed(observedRepeat(shapes)).label,'c/4');
  assert.equal(shipSpeed({period:2,dx:0,dy:0}),null);assert.equal(shipSpeed(null),null);
  assert.equal(shipSpeed({period:4,dx:2,dy:0}).label,'c/2');assert.equal(shipSpeed({period:3,dx:2,dy:0}).label,'2c/3');assert.equal(shipSpeed({period:1,dx:1,dy:1}).label,'c');
});
test('plot axes: round ticks covering the maximum; sampled indices keep the last value', () => {
  assert.deepEqual(niceTicks(5),[0,2,4,6]);assert.deepEqual(niceTicks(100,4),[0,50,100]);assert.deepEqual(niceTicks(1.6,4),[0,0.5,1,1.5,2]);
  assert.deepEqual(niceTicks(0),[0,1]);
  const idx=sampleIndices(6001,600);assert.ok(idx.length<=602);assert.equal(idx.at(-1),6000);assert.equal(idx[0],0);
  assert.deepEqual(sampleIndices(3),[0,1,2]);assert.deepEqual(sampleIndices(0),[]);
});

// Batch 2 of issue #37: Mandelbrot membership, chaos-game dimensions, film-area axis, knot colourings.
import {escape,orbit,membership,similarityDimension,boxCounts,logSlope} from '../site/js/gallery/gallery-math.js';
import {niceRange} from '../site/js/gallery/gallery-panels.js';
import {KNOT_CATALOGUE} from '../site/js/knot-catalogue.js';
import {normaliseKnot,cameraKnot,knotProjection,knotDeformation} from '../site/js/gallery/gallery-knot-geometry.js';

test('Mandelbrot: points proved inside never escape, points proved outside really escape', () => {
  assert.equal(membership([-0.5,0]).status,'cardioid');assert.equal(membership([0.25,0]).status,'cardioid');assert.equal(membership([-1,0]).status,'bulb');
  assert.equal(membership([-2,0],500).status,'unknown');assert.equal(membership([0,1],500).status,'unknown');   // both in the set, neither in the two discs
  const m=membership([0.3,0.6]);assert.equal(m.status,'escapes');const z=orbit([0.3,0.6],[0,0],m.n);assert.ok(Math.hypot(...z.at(-1))>2);assert.ok(Math.hypot(...z.at(-2))<=2);
  for(let i=0;i<=60;i++)for(let j=0;j<=40;j++){const c=[-2.2+i*0.05,j*0.03],r=membership(c,200);
    if(r.status==='cardioid'||r.status==='bulb')assert.equal(escape(0,0,c[0],c[1],3000),3000,`${c} escapes`);
    if(r.status==='escapes')assert.equal(r.n,escape(0,0,c[0],c[1],200));}
});
test('orbit: stops at the first |z| > 2 and starts from z0', () => {
  const z=orbit([1,0],[0,0],40);assert.deepEqual(z.map(p=>p[0]),[0,1,2,5]);
  assert.deepEqual(orbit([0,0],[0.5,0],3),[[0.5,0],[0.25,0],[0.0625,0],[0.00390625,0]]);
});
test('chaos game: similarity dimensions and box counting on known sets', () => {
  near(similarityDimension(3,.5),Math.log(3)/Math.log(2),1e-12);near(similarityDimension(4,.5),2,1e-12);near(similarityDimension(6,.6),2,1e-12);
  near(logSlope([[2,8],[4,32],[8,128]]),2,1e-12);
  const square=[],line=[];for(let i=0;i<256;i++)for(let j=0;j<256;j++)square.push([i/256,j/256]);for(let i=0;i<4096;i++)line.push([i/4096,i/4096]);
  near(logSlope(boxCounts(square,[0,0,1],[4,8,16,32,64])),2,1e-9);near(logSlope(boxCounts(line,[0,0,1],[4,8,16,32,64])),1,1e-9);
  // deterministic Sierpinski points (all addresses of depth 7): the estimate is close to log 3 / log 2
  let pts=[[0,0]];const V=[[0,0],[1,0],[0.5,Math.sqrt(3)/2]];for(let d=0;d<7;d++)pts=pts.flatMap(p=>V.map(v=>[(p[0]+v[0])/2,(p[1]+v[1])/2]));
  assert.ok(Math.abs(logSlope(boxCounts(pts,[0,0,1],[4,8,16,32,64]))-Math.log(3)/Math.log(2))<0.1);
});
test('axis from a minimum: ticks cover the range with a round step', () => {
  const r=niceRange(3.912,3.97);assert.ok(r[0]<=3.912&&r.at(-1)>=3.97);assert.ok(r.length<=7);
  assert.deepEqual(niceRange(2,2),[1,2,3]);
});
test('knots: the number of 3-colourings is the same in every view and along every guided deformation; the crossings are not', () => {
  for(const [id,count] of [['0_1',3],['3_1',9],['4_1',3]]){const b=normaliseKnot(KNOT_CATALOGUE.find(x=>x.id===id));
    for(let i=0;i<12;i++)assert.equal(knotProjection(cameraKnot(b,i*.4,i*.13,i%2===1)).count,count);}
  for(const [ex,id] of [['unknot','0_1'],['shear','3_1'],['turn','4_1']]){const b=normaliseKnot(KNOT_CATALOGUE.find(x=>x.id===id)),cross=new Set(),cols=new Set();
    for(let i=0;i<=40;i++){const p=knotProjection(cameraKnot(knotDeformation(b,ex,i/40),0,0,false));cross.add(p.crossings.length);cols.add(p.count);}
    assert.equal(cols.size,1);assert.ok(cross.size>1,ex);}
});

// Batch 3: Reuleaux width against direction, Platonic counts and defects, Galton running mean.
import {reuleaux,widthAt,polygonWidth,widthProfile,platonic,platonicFacts,SOLIDS,binMean,thinHistory} from '../site/js/lab-objects.js';
test('Reuleaux shapes have constant width w in every direction; the polygon of their vertices does not', () => {
  for(const n of [3,5,7,9]){
    const S=reuleaux(n,1),prof=widthProfile(th=>widthAt(S,th),1);
    for(const [,w] of prof)near(w,1,2e-3);
    const poly=widthProfile(th=>polygonWidth(S.verts,th),1).map(q=>q[1]);
    assert.ok(Math.max(...poly)-Math.min(...poly)>1e-3,`n=${n}: polygon width varies`);
    near(Math.max(...poly),1,1e-6);   // the diagonal of the polygon is the width w of the Reuleaux shape
    near(S.perimeter,Math.PI,1e-12);assert.ok(S.area<S.diskArea);
  }
  // triangle: area (π − √3)/2 · w² by the classical formula
  near(reuleaux(3,1).area,(Math.PI-Math.sqrt(3))/2,1e-12);
});
test('Platonic solids: V − E + F = 2 and the total angle defect is 720 degrees', () => {
  for(const id of SOLIDS){const S=platonic(id),P=platonicFacts(S);assert.equal(P.euler,2,id);near(P.total,720,1e-9);assert.equal(S.V*S.q,2*S.E,id);assert.equal(S.F*S.p,2*S.E,id);}
});
test('Galton running mean and bounded history keep real samples', () => {
  assert.equal(binMean([0,0,0]),null);
  near(binMean([1,2,1]),1);near(binMean([0,0,5]),2);
  const h=Array.from({length:1201},(_,i)=>[i,i*2]),k=thinHistory(h);
  assert.ok(k.length<=601+1);assert.deepEqual(k.at(-1),[1200,2400]);for(const q of k)assert.equal(q[1],q[0]*2);
  assert.equal(thinHistory(h.slice(0,10)).length,10);
});

// batch 4: comparison of two runs, events on plots, Gömböc energy, Hammersley's family
import {withPinned} from '../site/js/gallery/gallery-panels.js';
import {lifeEvents} from '../site/js/gallery/gallery-life-model.js';
import {hammersley,hammersleyArea,area as polyArea,HAMMERSLEY_R} from '../site/js/gallery/gallery-sofa-model.js';
import * as GR from '../site/js/gomboc-rolling.js';
import {makeSupportBody} from '../site/js/gomboc-support.js';
import {VISIBLE_TERMS} from '../site/js/gomboc-support-data.js';

test('a pinned run is drawn first, grey and dotted, and the axes widen to hold both runs', () => {
  const spec={xMax:10,yMax:5,series:[{values:[1,2,3]}]},pin={points:[[0,1],[20,9]],label:'a'};
  const out=withPinned(spec,pin);
  assert.equal(out.series.length,2);assert.equal(out.series[0].color,'muted');assert.deepEqual(out.series[0].points,pin.points);
  assert.equal(out.xMax,20);assert.equal(out.yMax,9);assert.equal(withPinned(spec,null),spec);
  assert.equal(withPinned({...spec,xTicks:[0,5,10]},pin).xMax,10);   // explicit ticks are kept
  assert.equal(withPinned({...spec,yMin:2},pin).yMin,1);
  const log={xMax:3,logY:[0.01,100],series:[]};assert.equal(withPinned(log,pin).yMax,undefined);
});

function run(id,n){const pops=[],shapes=[];let cells=presetSet(id),repG=null;pops.push(cells.size);shapes.push(shapeOf(cells));
  for(let g=1;g<=n;g++){cells=step(cells);pops.push(cells.size);shapes.push(shapeOf(cells));if(shapes.length>80)shapes.shift();if(repG===null&&observedRepeat(shapes))repG=g;}return {pops,repG};}
test('Life events: the glider is seen again at g = 4, diehard dies at g = 130 after its peak, a blinker has no peak event', () => {
  const gl=run('glider',20),ev=lifeEvents(gl.pops,gl.repG);assert.deepEqual(ev.map(e=>e.x),[4]);
  const dh=run('diehard',140),d=lifeEvents(dh.pops,dh.repG);
  const dead=d.find(e=>/mort/.test(e.label));assert.equal(dead.x,130);assert.equal(dh.pops[129]>0&&dh.pops[130],0);
  const pk=d.find(e=>/maximum/.test(e.label));assert.equal(dh.pops[pk.x],Math.max(...dh.pops));
  assert.ok(lifeEvents(run('blinker',10).pops,null).every(e=>!/maximum/.test(e.label)));
  for(let i=1;i<d.length;i++)assert.ok(d[i].x>=d[i-1].x);
});

test('Hammersley: the area formula against the drawn outline, and the largest of the family at r = 2/π', () => {
  for(const r of [0,0.2,0.5,HAMMERSLEY_R,0.9])assert.ok(Math.abs(polyArea(hammersley(r,400))-hammersleyArea(r))<2e-3,String(r));
  let best=0,arg=0;for(let i=0;i<=10000;i++){const r=i/10000,a=hammersleyArea(r);if(a>best){best=a;arg=r;}}
  near(arg,2/Math.PI,1e-4);near(best,Math.PI/2+2/Math.PI,1e-8);
});

test('Gömböc plot: E/(m g) never below the height of G, flat with no resistance, and with resistance the body comes to rest on S', () => {
  const V=makeSupportBody(VISIBLE_TERMS);
  let s=GR.start({colatitude:1,azimuth:0.4});const e0=GR.diagnostics(s,0,V).energy;
  for(let i=0;i<400;i++){s=GR.advance(s,0.01,0,V);const d=GR.diagnostics(s,0,V);assert.ok(d.energy/GR.GRAVITY>=GR.derived(s,V).hit.H-1e-12);assert.ok(Math.abs(d.energy-e0)<1e-4*Math.abs(e0));}
  let r=GR.start({colatitude:1,azimuth:0.4});for(let i=0;i<6000;i++)r=GR.advance(r,0.01,0.03,V);
  const d=GR.diagnostics(r,0.03,V);assert.ok(d.angleStable*180/Math.PI<1,String(d.angleStable));assert.ok(d.energy/GR.GRAVITY-GR.derived(r,V).hit.H<1e-3*(V.range().hi-V.range().lo));
});
