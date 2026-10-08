import test from 'node:test';
import assert from 'node:assert/strict';
import {quadraticModel,decimalFraction,coefficientsFromMode,signAt,explanation,graph} from '../dist/js/quadratic-workshop.js';
const t=p=>p[0];
test('exact discriminant and canonical form, including fractional coefficients',()=>{
 const q=quadraticModel('.25','-.5','-.75');
 assert.deepEqual(q.D,{n:1n,d:1n});assert.deepEqual(q.alpha,{n:1n,d:1n});assert.deepEqual(q.beta,{n:-1n,d:1n});assert.deepEqual(q.roots,[-1,3]);
 assert.deepEqual(decimalFraction('-0.125'),{n:-1n,d:8n});
});
test('all six sign cases agree with evaluation away from roots',()=>{
 for(const a of [2,-2])for(const c of [-6,2,4]){
 const q=quadraticModel(a,-2*a,a>0?c:-c);
 for(const x of [-5,0,1,2,5]){const y=Number(q.a.n)/Number(q.a.d)*x*x+Number(q.b.n)/Number(q.b.d)*x+Number(q.c.n)/Number(q.c.d);assert.equal(signAt(q,x),Math.sign(y));}
 assert(!explanation(q,5,t,'fr').includes('undefined'));
 }
});
test('parameter transformations preserve the requested vertex or roots',()=>{
 const c=coefficientsFromMode('canonical',['-2','1.5','3.25']),q=quadraticModel(...c);
 assert.deepEqual(q.alpha,{n:3n,d:2n});assert.deepEqual(q.beta,{n:13n,d:4n});
 const r=quadraticModel(...coefficientsFromMode('roots',['-2','-1','3']));assert.deepEqual(r.roots,[-1,3]);
});
test('small positive discriminants are not classified as rootless',()=>{
 const q=quadraticModel('1','0','-0.000000001');assert.equal(q.case,1);assert.equal(q.roots.length,2);
 assert.throws(()=>quadraticModel('0','2','1'));assert.throws(()=>decimalFraction('NaN'));
});
test('exact expressions and numerical graph are explicitly separated in both languages',()=>{
 for(const lang of ['fr','en']){
 const t=p=>p[lang==='fr'?0:1],q=quadraticModel('-1','0','2');
 const e=explanation(q,4,t,lang);assert(e.includes('<mfrac>'));assert(e.includes('<msqrt>'));assert(e.includes('≈'));
 const svg=graph(q,5,t,lang);assert(!/NaN|Infinity|undefined/.test(svg));assert(svg.includes('q-positive'));assert(svg.includes('q-negative'));
 }
});
