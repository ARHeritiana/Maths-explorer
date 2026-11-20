// Iteration in the complex plane (issue #36): Multibrot escape is final (an escaped orbit keeps growing), the set lies in
// |c| ≤ 2^(1/(d−1)), the (d − 1)-fold symmetry on a sample of points, the Mandelbrot set's known points; Newton's method
// finds the exact roots, converges from points near them, its basins of z³ − 1 are turned into each other by a third of a
// turn, and the superattracting cycle 0 → 1 → 0 of z³ − 2z + 2 makes a whole disc fail.
import test from 'node:test';
import assert from 'node:assert/strict';
import {multibrotEscape,symmetryOrder,boundRadius,POLYS,rootsFor,newton,evalPoly,cmul,cabs,newtonStep} from '../site/js/gallery/gallery-basins-model.js';

let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const rot=(z,a)=>[z[0]*Math.cos(a)-z[1]*Math.sin(a),z[0]*Math.sin(a)+z[1]*Math.cos(a)];

test('Multibrot: escape is final, the set lies in the bound disc, known points of the Mandelbrot set', () => {
  for(let d=2;d<=8;d++)for(let i=0;i<300;i++){const c=[rnd()*6-3,rnd()*6-3],k=multibrotEscape(c,d,60);
    if(k!==null){let z=[0,0];for(let j=0;j<k+12;j++){let p=[1,0];for(let q=0;q<d;q++)p=cmul(p,z);z=[p[0]+c[0],p[1]+c[1]];if(cabs(z)>1e30)break;}assert.ok(cabs(z)>Math.max(2,cabs(c)),`${d} ${c}`);}
    if(cabs(c)>boundRadius(d)+1e-9)assert.notEqual(multibrotEscape(c,d,400),null);}
  for(const c of [[0,0],[-1,0],[-2,0],[.25,0],[0,1],[-.12,.75]])assert.equal(multibrotEscape(c,2,2000),null,String(c));   // in the Mandelbrot set
  assert.equal(multibrotEscape([.26,0],2,5000)!==null,true);assert.equal(multibrotEscape([1,0],2,10),3);
});

test('Multibrot: the set is unchanged by a turn of 2π/(d − 1)', () => {
  for(let d=3;d<=7;d++){let agree=0,total=0;const a=2*Math.PI/symmetryOrder(d);
    for(let i=0;i<1500;i++){const c=[rnd()*3-1.5,rnd()*3-1.5],k1=multibrotEscape(c,d,80),k2=multibrotEscape(rot(c,a),d,80);total++;if(k1===k2)agree++;}
    assert.ok(agree/total>.995,`${d}: ${agree}/${total}`);}   // exact in exact arithmetic; rounding can move a step at the edge
  assert.equal(symmetryOrder(2),1);
});

test('Newton: exact roots, fast convergence near them, basins of z³ − 1 turned by a third of a turn', () => {
  for(const id of Object.keys(POLYS)){const R=rootsFor(id);assert.equal(R.length,POLYS[id].coef.length-1);for(const z of R)assert.ok(cabs(evalPoly(POLYS[id].coef,z).p)<1e-10,id);
    R.forEach((z,i)=>{const r=newton(id,[z[0]+.01,z[1]-.01],50);assert.equal(r.root,i);assert.ok(r.steps<=6);});}
  const w=2*Math.PI/3;let agree=0;for(let i=0;i<800;i++){const z=[rnd()*4-2,rnd()*4-2],a=newton('z3-1',z,80),b=newton('z3-1',rot(z,w),80);if(a.root<0||b.root<0)continue;if(b.root===(a.root+1)%3)agree++;else if(cabs(z)>1e-3)agree+=0;}
  assert.ok(agree>760,String(agree));
});

test('Newton on z³ − 2z + 2: 0 → 1 → 0 exactly, and a whole disc around 0 never reaches a root', () => {
  const coef=POLYS['z3-2z+2'].coef;assert.deepEqual(newtonStep(coef,[0,0]),[1,0]);assert.deepEqual(newtonStep(coef,[1,0]),[0,0]);
  for(let i=0;i<200;i++){const r=.05*Math.sqrt(rnd()),a=rnd()*2*Math.PI;assert.equal(newton('z3-2z+2',[r*Math.cos(a),r*Math.sin(a)],200).root,-1);}
  assert.notEqual(newton('z3-2z+2',[-2,0],100).root,-1);   // far from 0 it does find the real root
});
