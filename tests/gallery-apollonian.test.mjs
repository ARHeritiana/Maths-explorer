// Apollonian gasket (issue #36): every new circle touches the three circles of its gap (distance of centres = sum or
// difference of radii, an independent geometric check of the complex Descartes formula), Descartes' relation holds for the
// quadruple, all curvatures are integers, circles are distinct and inside the outer one, the count 4 + 2(3ⁿ − 1), and the
// covered share grows towards 1.
import test from 'node:test';
import assert from 'node:assert/strict';
import {gasket,count,coverage,descartes,flip,DIMENSION_ESTIMATE} from '../site/js/gallery/gallery-apollonian-model.js';

test('tangency, Descartes, integers, distinct circles inside the disc, counts', () => {
  for(let n=0;n<=6;n++){const C=gasket(n);assert.equal(C.length,count(n));
    const keys=new Set(C.map(c=>[c.k,...c.z.map(v=>v.toFixed(9))].join()));assert.equal(keys.size,C.length);
    for(const c of C){assert.ok(Math.abs(c.k-Math.round(c.k))<1e-9);if(c.k>0)assert.ok(Math.hypot(...c.z)+1/c.k<=1+1e-9);
      if(!c.touch)continue;assert.equal(descartes([c.k,...c.touch.map(q=>q.k)]),0);
      for(const q of c.touch){const d=Math.hypot(c.z[0]-q.z[0],c.z[1]-q.z[1]),r1=1/c.k,r2=1/Math.abs(q.k);assert.ok(Math.abs(d-(q.k<0?r2-r1:r1+r2))<1e-9);}}}
});

test('covered share: exact values at the first stages, increasing, below 1', () => {
  assert.ok(Math.abs(coverage(gasket(0))-(1/4+1/4+1/9))<1e-12);
  let prev=0;for(let n=0;n<=7;n++){const a=coverage(gasket(n));assert.ok(a>prev&&a<1);prev=a;}
  assert.ok(prev>.98);assert.ok(DIMENSION_ESTIMATE>1.3&&DIMENSION_ESTIMATE<1.31);
  const f=flip([{k:-1,z:[0,0]},{k:2,z:[-.5,0]},{k:2,z:[.5,0]},{k:3,z:[0,2/3]}],3);assert.equal(f.k,3);assert.ok(Math.abs(f.z[1]+2/3)<1e-12);
});
