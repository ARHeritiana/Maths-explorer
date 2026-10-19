// Independent mathematical checks and reciprocal-link checks for the Fourier learning triangle.
import test from 'node:test';import assert from 'node:assert/strict';
import * as F from '../site/js/fourier-model.js';
import {fourier,arms} from '../site/js/gallery-math.js';
const near=(a,b,tol=2e-6)=>assert.ok(Math.abs(a-b)<tol,`${a} versus ${b}`);
test('continuous coefficients agree with midpoint correlation, and errors agree with direct integration',()=>{
 const M=12000;
 for(const kind of F.SIGNALS)for(const n of [1,2,3,8,12]){
  const c=F.coefficient(kind,n),q=F.correlate(kind,n,M);near(c.a,q.a);near(c.b,q.b);
 }
 for(const kind of F.SIGNALS)for(const N of [1,3,12,60])for(const fejer of [false,true]){
  let sum=0;for(let j=0;j<M;j++){const t=(j+.5)/M;sum+=(F.signal(kind,t)-F.partial(kind,N,t,fejer))**2/M;}
  near(sum,F.errorEnergy(kind,N,fejer));
 }
});
test('DFT inversion and omitted-coefficient error agree with sample-space sums',()=>{
 for(const shape of ['madagascar','heart','star','custom']){
  const {points,coefficients}=F.outline({shape,custom:[[0,0],[4,0],[1,3]]});const M=points.length;
  for(const count of [1,8,40,128]){
   let error=0;for(let j=0;j<M;j++){const q=F.reconstruct(coefficients,j/M,count);error+=((q[0]-points[j][0])**2+(q[1]-points[j][1])**2)/M;if(count===M){near(q[0],points[j][0],1e-9);near(q[1],points[j][1],1e-9);}}
   near(error,F.sampleError(coefficients,count),1e-9);
  }
 }
 const z=Array.from({length:4},(_,j)=>[Math.cos(Math.PI*j/2),Math.sin(Math.PI*j/2)]),c=fourier(z);near(c.find(x=>x.k===1).re,1,1e-12);
 for(let j=0;j<4;j++){const tip=arms(c,j/4,4).at(-1);near(tip[0],z[j][0],1e-12);near(tip[1],z[j][1],1e-12);}
 assert.equal(F.alias(9,8),F.alias(1,8));near(Math.sqrt(.3**2+.4**2),.5);
});
test('Fejér stays within the square-wave range, whereas partial sums overshoot near a jump',()=>{
 let max=0;for(let j=0;j<2000;j++){const t=(j+.5)/2000;assert.ok(Math.abs(F.partial('square',24,t,true))<=1+1e-12);max=Math.max(max,F.partial('square',24,t));}assert.ok(max>1.1);
 near(F.partial('square',60,0),0);near(F.errorEnergy('mixture',1),.32);near(F.energy('mixture'),.5);
});
