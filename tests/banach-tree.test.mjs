// The free-group tree behind the Banach-Tarski lab, checked independently of the site code.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../site/js/lab/models/topology.js';
import {banachTreeExperiment as exp} from '../site/js/lab/experiments/topology.js';

// Independent reduced-word enumeration: all words of length <= d over {a,b,A,B} with no adjacent inverse pair.
function words(d){const inv={a:'A',A:'a',b:'B',B:'b'},out=[''];let layer=[''];for(let k=0;k<d;k++){const next=[];for(const w of layer)for(const c of 'abAB')if(!w||inv[c]!==w.at(-1))next.push(w+c);out.push(...next);layer=next;}return out;}

test('tree counts: 2*3^d - 1 words; F = W(gen) disjoint-union gen*W(inverse gen) except exactly the words of length d outside W(gen)',()=>{
 for(let d=1;d<=5;d++)for(const g of ['a','b']){
  const all=words(d),c=T.treeCopy(d,g);assert.equal(c.size,all.length);assert.equal(all.length,2*3**d-1);
  assert.equal(c.overlap,0);assert.equal(c.fixed,(3**d-1)/2);assert.equal(c.moved,(3**d-1)/2);
  const expected=all.filter(w=>w.length===d&&w[0]!==g);assert.deepEqual([...c.missing].sort(),expected.sort());assert.equal(c.missingCount,4*3**(d-1)-3**(d-1));
 }
 // the identity itself on the infinite tree: any reduced word u not starting with a is a*(A u), and A u is reduced and starts with A
 for(const u of words(5))if(u[0]!=='a'){const w='A'+u;assert.equal(T.reduceWord(w),w);assert.equal(T.leftMultiply('a',w),u);}
 for(const u of words(5))if(u[0]!=='b'){const w='B'+u;assert.equal(T.leftMultiply('b',w),u);}
});
test('tree layout: unique words, no coincident vertices up to depth 3, parents consistent',()=>{
 const L=T.treeLayout(3);assert.equal(L.nodes.length,53);assert.equal(new Set(L.nodes.map(n=>n.w)).size,53);
 let min=1e9;for(let i=0;i<53;i++)for(let j=i+1;j<53;j++)min=Math.min(min,Math.hypot(L.nodes[i].x-L.nodes[j].x,L.nodes[i].y-L.nodes[j].y));assert.ok(min>.3,String(min));
 for(const n of L.nodes)if(n.parent>=0)assert.equal(L.nodes[n.parent].w,n.w.slice(0,-1));
});
test('lab: mission witnesses and the check answer are recomputed from the model',()=>{
 assert.deepEqual(exp.missions.map(m=>m.kind),['predict','explore','check','explore','explain']);
 const m3=exp.missions[2];assert.equal(exp.model.quantity(m3.quantity,{...exp.state,...m3.set}),m3.answer);
 assert.equal(m3.answer,words(3).filter(w=>w.length===3&&w[0]!=='a').length);
 assert.ok(exp.missions[1].goal({depth:3,gen:'a',probe:'AB'}));assert.ok(!exp.missions[1].goal({depth:3,gen:'a',probe:'b'}));
 assert.ok(exp.missions[3].goal({depth:3,gen:'b',probe:'Ba'}));
 assert.match(exp.missions.at(-1).argument[1],/axiom of choice/);assert.match(exp.missions.at(-1).argument[0],/axiome du choix/);
});
// Exact arithmetic in Z[sqrt 2]: 3a and 3b are integer matrices; a product of L letters is non-identity iff 3^L-scaled matrix != 3^L I.
const mul=(x,y)=>[x[0]*y[0]+2n*x[1]*y[1],x[0]*y[1]+x[1]*y[0]],add=(x,y)=>[x[0]+y[0],x[1]+y[1]],Z=[0n,0n],I3=[[ [3n,0n],Z,Z],[Z,[3n,0n],Z],[Z,Z,[3n,0n]]];
const A3=[[[1n,0n],[0n,-2n],Z],[[0n,2n],[1n,0n],Z],[Z,Z,[3n,0n]]];          // 3 * rotation about z, cos = 1/3, sin = 2*sqrt2/3
const B3=[[[3n,0n],Z,Z],[Z,[1n,0n],[0n,-2n]],[Z,[0n,2n],[1n,0n]]];          // 3 * rotation about x
const tr=m=>m[0].map((_,j)=>m.map(r=>r[j])),mat=(x,y)=>x.map(r=>y[0].map((_,j)=>r.reduce((s,_,k)=>add(s,mul(r[k],y[k][j])),Z)));
const inv3={a:A3,b:B3,A:tr(A3),B:tr(B3)};   // the inverse of an orthogonal R is its transpose; every letter contributes one factor 3 to the scale
test('two rotations by arccos(1/3) about perpendicular axes: no reduced word of length <= 8 is the identity (exact arithmetic; a sanity check, not a proof of freeness)',()=>{
 // rotation matrices are orthogonal, so R^-1 = R^T. Use 3R = M integer: word value = product of M's over 3^L; identity iff product == 3^L I.
 for(const w of words(8)){if(!w)continue;let P=I3.map(r=>r.map(e=>[e[0]/3n,0n]));let scale=1n;
  for(const c of w){P=mat(P,inv3[c]);scale*=3n;}
  const isId=P.every((r,i)=>r.every((e,j)=>i===j?(e[0]===scale&&e[1]===0n):(e[0]===0n&&e[1]===0n)));
  assert.ok(!isId,w);}
 // the matrices are orthogonal rotations: M M^T = 9 I
 for(const M of [A3,B3]){const P=mat(M,tr(M));P.forEach((r,i)=>r.forEach((e,j)=>assert.deepEqual(e,i===j?[9n,0n]:[0n,0n])));}
});
