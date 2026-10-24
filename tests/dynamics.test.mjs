// Independent invariants, analytic benchmarks and convergence tests; no rendered picture is a proof of chaos.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../site/js/lab/models/dynamics.js';
import * as W from '../site/js/lab/models/cobweb.js';
import pendulum,{threeBody} from '../site/js/lab/experiments/dynamics.js';
import logistic from '../site/js/lab/experiments/logistic.js';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);
const p={m1:1.3,m2:.7,l1:1.1,l2:.8,g:9.81,damping:0};
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
test('adaptive RK4 agrees with harmonic motion and handles requested error/step limits',()=>{
 const f=([x,v])=>[v,-x],a=D.integrate(f,[1,0],10,{tolerance:1e-10});
 assert.equal(a.status,'complete');near(a.y[0],Math.cos(10),2e-10);near(a.y[1],-Math.sin(10),2e-10);
 const limit=D.integrate(f,[1,0],10,{maxSteps:1});assert.equal(limit.status,'step-limit');
 assert.throws(()=>D.integrate(f,[1,0],Infinity),RangeError);assert.throws(()=>D.integrate(f,[1,0],1,{maxStep:0}),RangeError);
});
test('pendulum derivative conserves independently differentiated energy, with correct damping dissipation',()=>{
 for(const state of [[.2,-.3,.7,-.5],[2,1.7,0,2],[-2,2,-1,1]])for(const damping of [0,.3]){
  const pars={...p,damping},v=D.pendulumDerivative(pars,state),h=1e-6;
  const gradient=state.map((_,i)=>{const a=state.slice(),b=state.slice();a[i]+=h;b[i]-=h;return(D.pendulumEnergy(pars,a)-D.pendulumEnergy(pars,b))/(2*h);});
  near(gradient.reduce((sum,x,i)=>sum+x*v[i],0),-damping*(state[2]**2+state[3]**2),2e-7);
  const points=D.pendulumPoints(pars,state);near(Math.hypot(...points[0]),p.l1);near(distance(points[0],points[1]),p.l2);
 }
});
test('pendulum integration converges as tolerance is reduced; damping decreases energy',()=>{
 const initial=[2,1.9,0,0],coarse=D.simulateDynamics('pendulum',p,initial,5,{tolerance:1e-5,maxStep:.08}),fine=D.simulateDynamics('pendulum',p,initial,5,{tolerance:1e-9,maxStep:.08}),ref=D.simulateDynamics('pendulum',p,initial,5,{tolerance:1e-12,maxStep:.02});
 assert.ok(distance(fine.y,ref.y)<distance(coarse.y,ref.y)/30);assert.ok(Math.abs(fine.energy-fine.initialEnergy)<3e-6);
 const damp=D.simulateDynamics('pendulum',{...p,damping:.2},initial,5,{tolerance:1e-10});assert.ok(damp.energy<damp.initialEnergy);
 const eq=D.simulateDynamics('pendulum',p,[0,0,0,0],5);assert.deepEqual(eq.y,[0,0,0,0]);
});
test('gravity force balance, center-of-mass transform and angular momentum are invariant',()=>{
 const pars={masses:[2,.7,.3],G:1},y=[-1,.3,.4,.1,1,-.4,-.3,.2,.2,1.1,.1,-.5],v=D.gravityDerivative(pars,y);
 for(let axis=0;axis<2;axis++)near(pars.masses.reduce((sum,m,i)=>sum+m*v[4*i+2+axis],0),0,1e-12);
 const centered=D.centerOfMassFrame(pars,y),inv=D.gravityInvariants(pars,centered);near(Math.hypot(...inv.center),0,1e-12);near(Math.hypot(...inv.momentum),0,1e-12);
 const a=D.simulateDynamics('gravity',pars,centered,.5,{tolerance:1e-10}),after=D.gravityInvariants(pars,a.y);assert.equal(a.status,'complete');near(after.angular,inv.angular,1e-7);near(after.energy,inv.energy,1e-7);
});
test('figure-eight orbit returns near its initial state; conservation and convergence checked separately',()=>{
 const q=D.GRAVITY_PRESETS.figure8,pars={masses:q.masses,G:1},T=6.32591398;
 const coarse=D.simulateDynamics('gravity',pars,q.y,T,{tolerance:1e-5,maxStep:.08}),fine=D.simulateDynamics('gravity',pars,q.y,T,{tolerance:1e-10,maxStep:.02}),ref=D.simulateDynamics('gravity',pars,q.y,T,{tolerance:1e-12,maxStep:.01});
 assert.ok(distance(fine.y,q.y)<2e-6);assert.ok(distance(fine.y,ref.y)<distance(coarse.y,ref.y)/20);near(fine.energy,fine.initialEnergy,1e-8);
 const inv=D.gravityInvariants(pars,fine.y);near(inv.angular,0,1e-8);near(Math.hypot(...inv.center),0,1e-9);
});
test('near collisions stop explicitly rather than soften the gravitational model',()=>{
 const p={masses:[1,1,1],G:1,collision:.015},y=[0,0,0,0,.01,0,0,0,2,0,0,0],a=D.simulateDynamics('gravity',p,y,1);
 assert.equal(a.status,'near-collision');assert.equal(a.t,0);assert.deepEqual(a.y,y);assert.ok(a.y.every(Number.isFinite));
});
test('logistic domain, fixed points, exact two-cycle multiplier and period-three window',()=>{
 for(let r=0;r<=4;r+=.05)for(let u0=0;u0<=1;u0+=.1){const a=W.logistic({r,u0,n:100,delta:1e-6});assert.ok(a.terms.every(x=>x>=0&&x<=1));}
 const r=3.2,root=Math.sqrt((r-3)*(r+1)),a=(r+1-root)/(2*r),b=(r+1+root)/(2*r);near(r*a*(1-a),b);near(r*b*(1-b),a);near(r*(1-2*a)*r*(1-2*b),-r*r+2*r+4);
 const period=W.terms({kind:'logistic',r:3.835,u0:.413},1000);for(let i=990;i<997;i++)near(period[i],period[i+3],1e-10);assert.ok(Math.abs(period[995]-period[996])>.01);
 const chaos=W.logistic({r:4,u0:.413,n:100,delta:1e-6});near(chaos.lyapunov,Math.log(2),.02);assert.deepEqual(W.terms({kind:'logistic',r:4,u0:.5},4),[.5,1,0,0]);
 const points=W.bifurcation(3.82,3.85,50,8);assert.equal(points.length,400);assert.ok(points.every(([r,x])=>r>=3.82&&r<=3.85&&x>=0&&x<=1));
});
test('experiment initial handles and physical settings keep finite states and honor mission answers',()=>{
 for(const e of[pendulum,threeBody,logistic]){for(const m of e.missions.filter(m=>m.kind==='check'))near(e.model.quantity(m.quantity,{...e.state,...m.set}),m.answer);for(const c of Object.values(e.controls).filter(c=>c.kind==='handle')){const [x,y]=c.at(e.state),patch=c.drag(e.state,x+.02,y+.02);assert.ok(patch);const value=e.model.model({...e.state,...patch});assert.ok(Number.isFinite(value.divergence));}}
});
