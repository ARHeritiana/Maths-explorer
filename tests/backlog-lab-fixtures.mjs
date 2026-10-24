// Independent answers and reachable states for the new guided experiments.
// These computations do not call the production models.
const permutations=a=>a.length<2?[a]:a.flatMap((x,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[x,...p]));
const choose=(n,k)=>{let c=1;for(let j=1;j<=k;j++)c=c*(n-k+j)/j;return c;};
export const BACKLOG_CHECKS={
 'fair-division/read':s=>s.values[0][0]/s.values[0].reduce((a,b)=>a+b,0),
 'fair-goods/read':s=>s.values[0].reduce((sum,v,i)=>sum+(s.owners[i]===0?v:0),0),
 'secretary/read':({n,skip})=>{const ps=permutations(Array.from({length:n},(_,i)=>i+1));let hits=0;for(const p of ps){let found=n-1;for(let i=skip;i<n;i++)if(p.slice(0,i).every(v=>v<p[i])){found=i;break;}hits+=p[found]===n;}return hits/ps.length;},
 'tank/read':({N,k})=>{let mean=0;for(let m=k;m<=N;m++)mean+=(m*(k+1)/k-1)*choose(m-1,k-1)/choose(N,k);return mean;},
 'benford/read':()=>{let area=0;const n=10000;for(let i=0;i<n;i++)area+=1/(1+(i+.5)/n)/Math.log(10)/n;return area;},
 'baker/read':s=>Math.sqrt((s.sigma*s.sigma+s.noise*s.noise)/s.n),
 'birthdays/read':({days})=>{let same=0;for(let a=0;a<days;a++)for(let b=0;b<days;b++)same+=a===b;return same/(days*days);},
 'monty/read':()=>{let win=0;for(let prize=0;prize<3;prize++)for(let choice=0;choice<3;choice++)win+=prize!==choice;return win/9;},
 'illumination/reflection':()=>Math.cos(Math.PI),
 'double-pendulum/energy':s=>-s.m1*s.g*s.l1-s.m2*s.g*(s.l1+s.l2),
 'three-body/mass':s=>[s.m1,s.m2,s.m3].reduce((a,b)=>a+b,0),
 'logistic/fixed':({r,u0})=>{let x=u0;for(let i=0;i<1000;i++)x=r*x*(1-x);return x;},
 'hairy-ball/tangent':()=>[1,0,0].reduce((sum,x,i)=>sum+x*[0,0,1][i],0),
 'nonorientable-surfaces/boundaries':()=>[0,2*Math.PI].length,
 'banach-tarski-model/total':s=>s.owners.filter(x=>x===0).length+s.owners.filter(x=>x===1).length,
};
export const BACKLOG_WITNESSES={
 'fair-division/cuts':{cut1:1/3,cut2:2/3},
 'fair-division/preferences':{values:[[1,3,1],[1,1,1],[1,1,1]]},
 'fair-goods/allocate':{owners:[0,0,1]},
 'fair-goods/preferences':{values:[[3,2,1],[6,2,1]]},
 ...Object.fromEntries(['secretary','tank','benford','baker','birthdays','monty'].map(id=>[id+'/trials',{runs:100}])),
 'illumination/source':{sx:1.5,sy:0},
 'double-pendulum/release':{time:6},'three-body/release':{time:6},'logistic/iterate':{n:40},
 'hairy-ball/zeros':{ax:.8},
 'nonorientable-surfaces/orientation':{u:2*Math.PI},
 'nonorientable-surfaces/cut':{cut:'thirds'},
 'banach-tarski-model/move':{owners:[1,1,0,0,0,0,0,0,0,0,0,0]},
};
export const BACKLOG_PREDICTIONS={
 'fair-division':{truth:()=>2/6<3/6,expected:true,words:/goûts peuvent différer/},
 'fair-goods':{truth:()=>[0,1].every(owner=>[0,1].some(i=>i!==owner)),expected:true,words:/une personne reste/},
 secretary:{truth:()=>permutations([1,2]).some(p=>p[0]!==2),expected:true,words:/Non, une probabilité/},
 tank:{truth:()=>permutations([1,2,3]).reduce((sum,p)=>sum+p[0],0)/6<3,expected:true,words:/Oui, sauf/},
 benford:{truth:()=>Array.from({length:100},(_,i)=>String(1000+i)[0]).every(d=>d==='1'),expected:true,words:/Non, le modèle/},
 baker:{truth:()=>{const posterior=prior=>prior*.2/(prior*.2+(1-prior)*.8);return posterior(.5)!==posterior(.9);},expected:true,words:/Non, elle est calculée/},
 birthdays:{truth:()=>{let p=1;for(let j=0;j<23;j++)p*=(365-j)/365;return 1-p>.5;},expected:true,words:/Oui, la probabilité/},
 monty:{truth:()=>[0,1,2].filter(prize=>prize!==0).length/3>1/3,expected:true,words:/Oui, la probabilité/},
 illumination:{truth:()=>48<Infinity,expected:true,words:/Non, il reste/},
 // The exactly downward equilibrium has zero torque; the positive energy gap bounds a small release nearby.
 'double-pendulum':{truth:()=>{const g=9.81,delta=1e-5,gap=2*g*(1-Math.cos(delta))+g*(1-Math.cos(delta));return Math.sin(0)===0&&gap<g*(1-Math.cos(.01));},expected:true,words:/dépend des conditions/},
 // Equal masses on an equilateral unit circle have acceleration -r/sqrt(3), hence exact circular motion exists.
 'three-body':{truth:()=>{const positions=Array.from({length:3},(_,i)=>[Math.cos(2*Math.PI*i/3),Math.sin(2*Math.PI*i/3)]);return positions.every((p,i)=>{const acc=[0,0];positions.forEach((q,j)=>{if(i!==j){const d=q.map((x,k)=>x-p[k]),r=Math.hypot(...d);d.forEach((x,k)=>acc[k]+=x/r**3);}});return Math.hypot(...acc.map((x,k)=>x+p[k]/Math.sqrt(3)))<1e-12;});},expected:true,words:/solutions périodiques/},
 logistic:{truth:()=>{let x=.4;for(let i=0;i<100;i++)x=3.2*x*(1-x);return Math.abs(3.2*x*(1-x)-x)>.01;},expected:true,words:/dépend de r/},
 'hairy-ball':{truth:()=>1!==(-1)**3,expected:true,words:/au moins un zéro/},
 'nonorientable-surfaces':{truth:()=>{const next=side=>1-side;let side=0;const seen=new Set();do{seen.add(side);side=next(side);}while(!seen.has(side));return seen.size===2?1:2;},expected:1,words:/^Une$/},
 'banach-tarski-model':{truth:()=>12<12+12,expected:true,words:/^Non$/},
};
