// Geometry invariants and numerical diagnostics independent of the contact iteration.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as G from '../site/js/gallery-gomboc-model.js';
import {GOMBOC_GALLERY,GOMBOC_STORY} from '../site/js/gomboc-content.js';
const binary=fs.readFileSync(new URL('../site/data/gomboc/body.bin',import.meta.url));
const metadata=JSON.parse(fs.readFileSync(new URL('../site/data/gomboc/body.json',import.meta.url)));
const body=G.decodeGeometry(binary.buffer.slice(binary.byteOffset,binary.byteOffset+binary.byteLength),metadata);
const near=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,`${a} versus ${b}`);
test('the full contact mesh and source hash are preserved, with a separate small drawing hull',()=>{
 assert.equal(body.count,113888);assert.equal(metadata.faces,56946);assert.equal(metadata.vertices-metadata.edges+metadata.faces,2);
 assert.equal(metadata.exactInputSha256,'3b9618819b380c5218f6e43fffde57baecc145648c27f1ee1cfc9cb3d22e438f');
 assert.equal(crypto.createHash('sha256').update(binary).digest('hex'),metadata.binarySha256);
 assert.ok(body.drawingIds.length<body.count/20);assert.equal(metadata.drawingApproximation,true);
 for(let i=0;i<body.count;i++)for(let k=0;k<3;k++){const j=body.neighbours[3*i+k];assert.ok(j<body.count);assert.ok(body.neighbours.slice(3*j,3*j+3).includes(i));}
 near(metadata.volume,4.21859742982636,2e-12);
 for(let k=0;k<3;k++){assert.ok(metadata.inertia[k][k]>.3);for(let j=0;j<3;j++)near(metadata.inertia[k][j],metadata.inertia[j][k]);}
});
test('graph support agrees with an independent scan of every vertex for many directions and starts',()=>{
 for(let i=0;i<90;i++){const angle=i*2.399963229728653,z=1-2*(i+.5)/90,r=Math.sqrt(1-z*z),direction=[r*Math.cos(angle),r*Math.sin(angle),z];let exact=-Infinity;
  for(let j=0;j<body.count;j++){const a=3*j;exact=Math.max(exact,body.vertices[a]*direction[0]+body.vertices[a+1]*direction[1]+body.vertices[a+2]*direction[2]);}
  const result=G.support(body,direction,(i*7919)%body.count);near(result.value,exact,2e-13);
 }
});
test('stable and unstable certified supports have the expected local potential changes',()=>{
 for(const [kind,sign] of [['stable',1],['unstable',-1]]){const s=G.state(body,kind);for(const angle of [-.03,.03]){const q=G.qmul(G.qaxis([1,0,0],angle),s.q),support=G.support(body,G.matvec(G.transpose(G.rotation(q)),[0,0,-1]),s.support);assert.ok(sign*(support.value-s.p[2])>0,kind);}}
 const stable=G.state(body,'stable');near(stable.p[2],metadata.stableOffset,1e-12);
});
test('free flight matches analytic translation, conserves angular momentum and converges as dt halves',()=>{
 const s=G.state(body,'throw'),opts={ground:false,gravity:9.81};
 const coarse=G.simulate(body,s,.2,opts,1/120),fine=G.simulate(body,s,.2,opts,1/240),finer=G.simulate(body,s,.2,opts,1/480);
 const exact=s.p[2]+s.v[2]*.2-9.81*.2**2/2;
 near(coarse.v[2],s.v[2]-9.81*.2);assert.deepEqual(coarse.L,s.L);near(Math.hypot(...fine.q),1);
 assert.ok(Math.abs(fine.p[2]-exact)<Math.abs(coarse.p[2]-exact));assert.ok(Math.abs(finer.p[2]-exact)<Math.abs(fine.p[2]-exact));
 assert.ok(Math.abs(G.energy(body,fine)-G.energy(body,s))<Math.abs(G.energy(body,coarse)-G.energy(body,s)));
});
test('contact stops penetration, dissipates energy and stays finite through tipped and thrown trials',()=>{
 for(const preset of ['stable','tip','throw']){const start=G.state(body,preset);let s=G.simulate(body,start,3);const hit=G.support(body,G.matvec(G.transpose(G.rotation(s.q)),[0,0,-1]),s.support);
  assert.ok(s.p[2]>=hit.value-1e-12);assert.ok([...s.p,...s.v,...s.L,...s.q].every(Number.isFinite));near(Math.hypot(...s.q),1);
  assert.ok(G.energy(body,s)<G.energy(body,start)+.005);assert.ok(s.impulses>0);
 }
 assert.throws(()=>G.advance(body,G.state(body),1),RangeError);
 const result=G.convergence(body,G.state(body,'throw'),.2);assert.ok(result.position<.01&&result.angle<.001);
});
test('entry points distinguish the original smooth body, certified polyhedron and numerical approximation',()=>{
 assert.ok(GOMBOC_GALLERY.links.includes('#stories/'+GOMBOC_STORY.id));assert.ok(GOMBOC_STORY.links.includes('#gallery/gomboc'));
 const text=JSON.stringify([GOMBOC_GALLERY,GOMBOC_STORY]);assert.match(text,/prépublication/);assert.match(text,/double précision|rounded coordinates/);assert.match(text,/analogue polyédrique/);assert.doesNotMatch(text,/[—–]/);
});
test('a tipped body rights itself onto the stable face; energy rises only by a bounded contact residue',()=>{
 const start=G.state(body,'tip');let s=start,worst=0,previous=G.energy(body,s);
 for(let k=0;k<14;k++){s=G.simulate(body,s,1);worst=Math.max(worst,s.penetration);const e=G.energy(body,s);assert.ok(e<=previous+1e-3,'energy rose');previous=e;}
 const n=G.matvec(G.rotation(s.q),metadata.stableNormal);assert.ok(Math.acos(Math.min(1,-n[2]))<.02,'stable face down');
 near(s.p[2],metadata.stableOffset,5e-4);assert.ok(worst<1e-3);
 const rest=G.simulate(body,G.state(body,'stable'),2);assert.ok(G.energy(body,rest)<=G.energy(body,G.state(body,'stable'))+1e-3);
});
test('rolling resistance only adds dissipation, and thrown or unstable starts stay finite and bounded in energy',()=>{
 const run=(c,preset,seconds)=>G.simulate(body,G.state(body,preset),seconds,{rolling:c});
 const start=G.energy(body,G.state(body,'tip'));
 const e0=G.energy(body,run(0,'tip',4)),e1=G.energy(body,run(.1,'tip',4)),e3=G.energy(body,run(.3,'tip',4));
 assert.ok(e1<e0&&e3<e1,`${e0} ${e1} ${e3}`);assert.ok(e0<start+.01);
 for(const preset of ['throw','unstable']){const a=G.state(body,preset),b=G.simulate(body,a,6);
  assert.ok([...b.p,...b.v,...b.L,...b.q].every(Number.isFinite));assert.ok(G.energy(body,b)<G.energy(body,a)+.01,preset);}
});
