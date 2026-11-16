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
