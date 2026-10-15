import test from 'node:test';
import assert from 'node:assert/strict';
import {SOLIDS,platonic,vertexVerdict} from '../site/js/lab-objects.js';
import {makeNet,polygonOverlap} from '../site/js/platonic-fold.js';
import {complexMap,complexDerivative,complexInverse,multiply} from '../site/js/complex-explorer.js';
import {camera2D} from '../site/js/canvas-navigation.js';

test('all five nets are flat, do not overlap, hinge rigidly, and close with the original edge lengths',()=>{
  for(const name of SOLIDS){const solid=platonic(name),net=makeNet(solid),flat=net.faces(0);
    for(let i=0;i<flat.length;i++){assert.ok(flat[i].every(p=>Math.abs(p[2]-flat[0][0][2])<1e-8));for(let j=i+1;j<flat.length;j++)assert.equal(polygonOverlap(flat[i],flat[j]),false,name);}
    for(const fold of [0,.1,.25,.5,.75,.9,1]){const faces=net.faces(fold);faces.forEach((face,i)=>face.forEach((p,j)=>{
      const k=(j+1)%face.length,a=solid.verts[solid.faces[i].verts[j]],b=solid.verts[solid.faces[i].verts[k]];
      assert.ok(Math.abs(Math.hypot(...p.map((v,n)=>v-face[k][n]))-Math.hypot(...a.map((v,n)=>v-b[n])))<1e-9);
    }));}
    const closed=net.faces(1),seen=new Map();solid.faces.forEach((face,i)=>face.verts.forEach((vertex,j)=>{const point=closed[i][j];if(seen.has(vertex))assert.ok(Math.hypot(...point.map((v,k)=>v-seen.get(vertex)[k]))<1e-9);else seen.set(vertex,point);}));
  }
});
test('the convex vertex inequality leaves exactly five pairs, and all p >= 6 fail',()=>{
  const allowed=[];for(let p=3;p<=50;p++)for(let q=3;q<=50;q++)if(vertexVerdict(p,q)==='solid')allowed.push([p,q]);
  assert.deepEqual(allowed,[[3,3],[3,4],[3,5],[4,3],[5,3]]);assert.equal(vertexVerdict(6,3),'flat');
});
test('complex maps, their inverse dragging, and local derivatives agree, including singular cases',()=>{
  for(const z of [[2,1],[-2,-3],[.2,-.7],[-3,0],[0,4]])for(const mode of ['translate','multiply','square','inverse','conjugate']){
    const a=[1,-2],w=complexMap(mode,z,a),back=complexInverse(mode,w,a,z);assert.ok(Math.hypot(back[0]-z[0],back[1]-z[1])<1e-9,mode);
    const D=complexDerivative(mode,z,a);if(D){const h=[1e-6,2e-6],exact=complexMap(mode,[z[0]+h[0],z[1]+h[1]],a),local=multiply(D,h);assert.ok(Math.hypot(exact[0]-w[0]-local[0],exact[1]-w[1]-local[1])<1e-8);}
  }
  assert.equal(complexMap('inverse',[0,0]),null);assert.equal(complexDerivative('conjugate',[1,2]),null);assert.deepEqual(complexMap('multiply',[2,3],[0,0]),[0,0]);assert.equal(complexInverse('multiply',[0,0],[0,0],[1,1]),null);
});
test('zoom preserves the model point under the pointer and resets independently of parameters',()=>{
  const c=camera2D();for(let i=0;i<40;i++){const anchor=[i*5,i*3],before=c.unproject(anchor);c.zoomAt(i%2?.8:1.25,anchor);assert.ok(Math.hypot(...c.unproject(anchor).map((v,k)=>v-before[k]))<1e-10);}
  c.reset();assert.deepEqual(c.project([2,-3]),[2,-3]);
});
