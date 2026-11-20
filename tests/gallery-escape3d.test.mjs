// 3D escape-time sets (issue #36): each distance estimate is checked against plain membership by iteration (no point of
// the set inside half the estimated ball, over random points), the Mandelbulb's (n − 1)-fold symmetry about the vertical
// axis, the quaternion product (i² = j² = k² = ijk = −1, ij = −ji) and its use, the slice at w = 0 of the quaternion Julia
// set of a complex c contains the complex Julia set's points; the shader and the model agree on their parameters.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SETS,DE,INSIDE,bulbDE,juliaInside,qmul} from '../site/js/gallery/gallery-escape3d-model.js';

let seed=17;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};

test('distance estimates are honest: no point of the set within half the estimated distance', () => {
  for(const [id,a,R] of [['bulb',8,1.5],['bulb',4,1.5],['box',-1.5,3],['box',2,7],['julia',0,1.5],['julia',.3,1.5]]){let checked=0;
    for(let i=0;i<1500;i++){const p=[0,1,2].map(()=>rnd()*2*R-R),d=DE[id](p,a);if(!(d>.02&&d<1))continue;checked++;
      for(let k=0;k<5;k++){const u=[rnd()-.5,rnd()-.5,rnd()-.5],l=Math.hypot(...u),q=p.map((v,j)=>v+u[j]/l*d*.5*rnd());assert.ok(!INSIDE[id](q,a),`${id} ${a} ${p}`);}}
    assert.ok(checked>200,`${id}: ${checked}`);}
});

test('Mandelbulb: n − 1 copies around the vertical axis; the centre is in the set', () => {
  for(const n of [3,5,8]){const a=2*Math.PI/(n-1);let agree=0,total=0;
    for(let i=0;i<400;i++){const p=[rnd()*2.4-1.2,rnd()*2.4-1.2,rnd()*2.4-1.2],q=[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a),p[2]];total++;if(Math.abs(bulbDE(p,n)-bulbDE(q,n))<1e-6*Math.max(1,Math.abs(bulbDE(p,n))))agree++;}
    assert.ok(agree/total>.99,`${n}: ${agree}/${total}`);}
  assert.ok(INSIDE.bulb([0,0,0],8));assert.ok(!INSIDE.bulb([1.5,0,0],8));
});

test('quaternions: Hamilton’s rules, and a complex c gives the complex Julia set in the slice w = 0, z = 0', () => {
  const one=[1,0,0,0],i=[0,1,0,0],j=[0,0,1,0],k=[0,0,0,1],neg=v=>v.map(x=>0-x+0),z0=v=>v.map(x=>x+0);
  assert.deepEqual(z0(qmul(i,i)),neg(one));assert.deepEqual(z0(qmul(j,j)),neg(one));assert.deepEqual(z0(qmul(k,k)),neg(one));
  assert.deepEqual(z0(qmul(i,j)),k);assert.deepEqual(z0(qmul(j,i)),neg(k));assert.deepEqual(z0(qmul(qmul(i,j),k)),neg(one));
  const c=[-.8,.156,0,0];   // complex c: the quaternion orbit of x + y i stays in the complex plane
  for(let n=0;n<300;n++){const x=rnd()*3-1.5,y=rnd()*3-1.5;let z=[x,y];let inC=true;for(let s=0;s<40;s++){z=[z[0]*z[0]-z[1]*z[1]+c[0],2*z[0]*z[1]+c[1]];if(Math.hypot(...z)>4){inC=false;break;}}
    assert.equal(juliaInside([x,y,0],0,c),inC);}
});

test('the parameters offered by the page', () => {
  assert.deepEqual(Object.keys(SETS),['bulb','box','julia']);for(const s of Object.values(SETS))assert.ok(s.param.min<=s.param.value&&s.param.value<=s.param.max);
});
