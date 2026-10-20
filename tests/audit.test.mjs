import test from "node:test";
import assert from "node:assert/strict";
import { quadratic, riemann, squareSecant, formatNumber, axisTicks } from "../dist/js/math.js";
import { labs, challenges, pathways, pathwayStages } from "../dist/js/content.js";
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-10, `${a} != ${b}`);

test("unequal quadratic roots retain the small nonzero root", () => {
  for (const b of [-1e8,1e8]) {
    const roots = quadratic(1,b,1).roots;
    near(roots[0] * roots[1],1);
    for (const x of roots) assert.ok(Math.abs(x*x+b*x+1)/(Math.abs(x*x)+Math.abs(b*x)+1) < 1e-15);
  }
  for (const a of [-3,1,3]) {
    const q = quadratic(a,0,0); assert.deepEqual(q.roots,[0]);
    const r = quadratic(a,2,0); assert.ok(r.roots.some(x => x === 0));
  }
});
test("two-sided secants approach the derivative with signed error h", () => {
  for (let x=-3;x<=3;x+=.25) for (const h of [-2,-.01,.01,2]) {
    near(squareSecant(x,h), ((x+h)**2-x*x)/h);
    near(squareSecant(x,h)-2*x,h);
  }
  for (const h of [0,NaN,Infinity]) assert.throws(() => squareSecant(1,h));
});
test("rectangle formulas independently establish bounds and midpoint errors", () => {
  for (let n=1;n<=100;n++) {
    const l=riemann(n), r=riemann(n,"right"), m=riemann(n,"midpoint");
    assert.ok(l<1/3 && r>1/3 && l<m && m<1/3);
    near(r-l,1/n); near(l,1/3-1/(2*n)+1/(6*n*n));
    near(m,1/3-1/(12*n*n));
  }
  for (const n of [0,-1,1.5,Infinity]) assert.throws(() => riemann(n));
  assert.throws(() => riemann(2,"unknown"));
});
test("small graph values stay nonzero and scale labels stay distinct", () => {
  for (const lang of ["fr","en"]) {
    assert.equal(formatNumber(0,lang),"0"); assert.equal(formatNumber(-0,lang),"0");
    const labels = [1e-10,2e-10,3e-10,4e-10].map(x=>formatNumber(x,lang,2));
    assert.equal(new Set(labels).size,4); assert.ok(labels.every(x => x !== "0"));
    assert.ok(formatNumber(1e8,lang).length < 12);
  }
});
test("all reasoning, presets and pathway notes are bilingual and valid", () => {
  for (const l of labs) {
    if (l.experiment) {
      // Rebuilt experiments keep their text in lab/experiments/ (checked field by field in lab-engine.test.mjs); here only the
      // shared catalogue line and the history source are verified, like the other labs.
      for (const key of ["level","prereq","intro","story"]) assert.equal(l[key].length,2);
      assert.equal(new URL(l.source).hostname,'mathshistory.st-andrews.ac.uk');
      continue;
    }
    for (const key of ["conjecture","proof","transfer"]) assert.ok(l.reasoning[key].length===2 && l.reasoning[key].every(x=>typeof x === "string" && x.length>10));
    for (const key of ["level","prereq","intro","explain","story"]) assert.equal(l[key].length,2);
    for (const pair of l.steps) assert.ok(pair.length===2 && pair.every(Boolean));
    const values=l.quizState.values ?? [];
    assert.equal(values.length,l.params.length);
    values.forEach((v,i)=>{const [_,lo,hi,step]=l.params[i];assert.ok(v>=lo && v<=hi);near((v-lo)/step,Math.round((v-lo)/step));});
    const source=new URL(l.source);
    assert.equal(source.protocol,'https:');
    assert.ok(['mathshistory.st-andrews.ac.uk','www.cs.cmu.edu','web.mit.edu','knotinfo.org','cs.uwaterloo.ca','www.combinatorics.org'].includes(source.hostname));
    if(source.hostname!=='mathshistory.st-andrews.ac.uk')assert.ok(l.sourceLabel?.length===2&&l.sourceLabel.every(Boolean),'non-MacTutor sources need their own bilingual attribution');
  }
  for (const p of pathways) for (const s of pathwayStages(p)) {
    assert.ok(s.name.length===2 && s.name.every(Boolean));
    if(s.note) assert.ok(s.note.length===2 && s.note.every(Boolean));
  }
  for(const c of challenges) for(const h of c.hints) assert.ok(h.length===2 && h.every(Boolean));
});
test("classic challenge answers agree with independent small-case calculations", () => {
  const answer=id=>challenges.find(c=>c.id===id).answer;
  const doors=Array(101).fill(false);for(let k=1;k<=100;k++)for(let j=k;j<=100;j+=k)doors[j]=!doors[j];
  assert.equal(answer("doors"),doors.filter(Boolean).length);
  const wins=[false];for(let n=1;n<=21;n++)wins[n]=[1,2,3].some(k=>k<=n&&!wins[n-k]);
  assert.deepEqual([1,2,3].filter(k=>!wins[21-k]),[answer("nim")]);
  assert.equal(answer("pigeonhole"),7+1);assert.equal(new Set([0,1,2,3,4,5,6].map(x=>x%7)).size,7);
  assert.equal(answer("squares"),Array.from({length:20},(_,i)=>2*i+1).reduce((a,b)=>a+b,0));
});

test("axis ticks stay bounded for tiny and near-constant scales", () => {
  for (const [min,max] of [[-6,6],[1e-10,2e-10],[1e-50,2e-50],[1e-320,2e-320],[9999.99999999,10000]]) {
    const ticks=axisTicks(min,max);
    assert.ok(ticks.values.length<=8 && ticks.values.length>=1);
    assert.ok(ticks.values.every(Number.isFinite));
    assert.equal(new Set(ticks.values).size,ticks.values.length);
  }
});
test("standard deviation preserves tiny nonconstant data", async () => {
  const {statistics}=await import('../dist/js/math.js');
  const s=statistics([1e-200,3e-200]);
  assert.ok(Math.abs(s.sd / 1e-200-1)<1e-14);
});
