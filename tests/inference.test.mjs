// Independent enumeration and statistical checks for the inference models.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../site/js/lab/models/inference.js';
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function permutations(a){if(a.length<2)return [a];return a.flatMap((x,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[x,...p]));}
test('secretary finite probabilities agree with exhaustive permutations and approach 1/e',()=>{
 for(let n=1;n<=7;n++)for(let r=0;r<n;r++){const ps=permutations(Array.from({length:n},(_,i)=>i+1));let hits=0;for(const p of ps){let chosen=n-1;for(let i=r;i<n;i++){if(p.slice(0,i).every(v=>v<p[i])){chosen=i;break;}}hits+=p[chosen]===n;}near(hits/ps.length,M.secretaryProbability(n,r));}
 const best=M.secretaryThreshold(1000);near(best.skip/1000,1/Math.E,.002);near(best.probability,1/Math.E,.002);
 near(M.secretary({n:30,skip:11,runs:5000,seed:91}).frequency,M.secretaryProbability(30,11),.025);
});
test('tank exact maximum distribution, unbiased estimate, variance and interval coverage',()=>{
 for(let N=2;N<=20;N++)for(let k=1;k<=N;k++){let mass=0,mean=0,v=0,cov=0;for(let m=k;m<=N;m++){const p=M.maximumProbability(N,k,m),e=m*(1+1/k)-1;mass+=p;mean+=p*e;v+=p*(e-N)**2;if(M.tankUpperBound(m,k)>=N)cov+=p;}near(mass,1);near(mean,N);near(v,(N+1)*(N-k)/(k*(k+2)));assert.ok(cov>=.95-1e-10);}
 const a=M.tank({N:100,k:10,runs:3000,seed:5});near(a.observedMean,100,.8);assert.equal(a.sample.length,new Set(a.sample).size);
});
test('Benford probability telescopes; decimal edge cases and counterexamples',()=>{
 for(const digits of [1,2]){const start=10**(digits-1);near(Array.from({length:9*start},(_,i)=>M.benfordProbability(i+start,digits)).reduce((a,b)=>a+b,0),1);}
 assert.equal(M.leadingDigits(1e-300),1);assert.equal(M.leadingDigits(-.0099,2),99);assert.equal(M.leadingDigits(0),null);assert.equal(M.leadingDigits(Infinity),null);
 const a=M.benford({count:10000,seed:7});near(a.frequency[0],Math.log10(2),.015);const b=M.benford({count:1000,mode:'narrow'});assert.equal(b.counts[7],1000);assert.equal(b.counts[0],0);
 const c=M.benford({values:[0,NaN,-10,.02]});assert.equal(c.n,2);assert.equal(c.excluded,2);
});
test('known-variance baker test has calibrated size, coverage and power under iid assumptions',()=>{
 const a=M.baker({mean:1000,n:30,runs:3000,seed:29});near(a.rejectRate,.05,.018);near(a.coverageRate,.95,.018);
 const b=M.baker({mean:990,n:30,runs:3000,seed:29});near(b.rejectRate,b.power,.025);
 const selected=M.baker({mean:980,n:100,mode:'selected',seed:2});assert.equal(selected.validIID,false);assert.ok(selected.average>995);
});
test('birthday 23-person threshold, exact nonuniform enumeration, hashing pigeonhole',()=>{
 assert.ok(M.birthdayProbability(22)<.5);near(M.birthdayProbability(23),.5072972343239859);assert.equal(M.birthdayProbability(366),1);
 const p=[.1,.2,.3,.4];let collision=0;for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++)if(new Set([a,b,c]).size<3)collision+=p[a]*p[b]*p[c];near(M.birthdayProbability(3,4,p),collision);
 near(M.birthdays({n:23,runs:5000,seed:37}).frequency,M.birthdayProbability(23),.025);
});
test('Monty host rules give 2/3 for informed switching and 1/2 conditional on a random goat reveal',()=>{
 near(M.montyExact('informed','switch').probability,2/3);near(M.montyExact('informed','stay').probability,1/3);near(M.montyExact('random','switch').probability,.5);near(M.montyExact('random','stay').probability,.5);near(M.montyExact('random').eligibleProbability,2/3);
 for(const host of ['informed','random'])near(M.monty({host,runs:10000,seed:72}).frequency,M.montyExact(host).probability,.02);
 assert.deepEqual(M.monty({seed:9,runs:10}),M.monty({seed:9,runs:10}));
});
test('secretary rank payoff: exact law equals exhaustive enumeration; the dynamic-programming rule beats every threshold and matches its own enumeration',()=>{
 for(let n=1;n<=7;n++){const ps=permutations(Array.from({length:n},(_,i)=>i+1));
  for(let r=0;r<n;r++){const law=Array(n+1).fill(0);for(const a of ps)law[n-a[M.secretarySelection(a,r)]+1]+=1/ps.length;const L=M.secretaryRankLaw(n,r);for(let j=1;j<=n;j++)near(L[j],law[j]);near(L[1],M.secretaryProbability(n,r));}
  const pol=M.secretaryRankPolicy(n);let e=0;for(const a of ps)e+=(n-a[M.secretaryRankSelection(a,pol)]+1)/ps.length;near(pol.expectedRank,e);
  assert.ok(pol.expectedRank<=M.secretaryBestRankThreshold(n).expectedRank+1e-12);}
 const s=M.secretary({n:20,skip:4,variant:'rank',runs:6000,seed:3});near(s.meanRank,s.expectedRank,.25);near(s.meanOptimalRank,s.optimalRank,.2);
 assert.ok(s.optimalRank<s.bestRankThreshold.expectedRank);assert.equal(M.secretary({n:20,skip:4}).rankLaw,null);
});
test('German tank Bayesian reading under the flat prior: tail, mean and median agree with direct summation; estimators compared by simulation',()=>{
 for(const [m,k] of [[60,4],[10,3],[7,2],[25,5]]){
  const post=n=>1/M.choose(n,k);let Z=0;for(let n=m;n<2e5;n++)Z+=post(n);
  for(const n of [m,m+1,m+9,m+50]){let tail=0;for(let j=n+1;j<2e5;j++)tail+=post(j);near(tail/Z,M.tankPosteriorTail(m,k,n),2e-4);}
  const med=M.tankPosteriorMedian(m,k);assert.ok(M.tankPosteriorTail(m,k,med)<=.5&&M.tankPosteriorTail(m,k,med-1)>.5);
  if(k>=3){let mean=0;for(let n=m;n<2e5;n++)mean+=n*post(n)/Z;near(mean,M.tankPosteriorMean(m,k),.05);}else assert.equal(M.tankPosteriorMean(m,k),null);}
 near(M.tankPosteriorMean(60,4),88.5);assert.equal(M.tankPosteriorMedian(5,1),null);
 const t=M.tank({N:100,k:5,runs:4000,seed:12}),by=Object.fromEntries(t.estimators.map(e=>[e.id,e]));
 near(by.unbiased.mean,100,1);near(by.mean.mean,100,1.5);assert.ok(by.max.mean<90);assert.ok(by.unbiased.rmse<by.mean.rmse);assert.ok(by.unbiased.rmse<by.max.rmse);
});
test('Benford extra datasets: 217 real country populations plausible, fixed prices and invented amounts depart, forger is uniform on first digits',async()=>{
 const {COUNTRY_POPULATIONS_2022:pop}=await import('../site/js/lab/models/benford-data.js');
 assert.equal(pop.length,217);assert.ok(pop.every(x=>Number.isInteger(x)&&x>0));
 const c=M.benford({values:pop});assert.equal(c.n,217);for(let d=0;d<9;d++)near(c.frequency[d],c.theory[d],.09);
 const p=M.benford({mode:'prices',count:2000,seed:2});assert.ok(p.frequency[0]<.3&&p.frequency[8]>.15);
 const f=M.benford({mode:'invented',count:9000,seed:4});for(let d=0;d<9;d++)near(f.frequency[d],1/9,.03);assert.ok(f.chiSquare>50);
});
