// Viviani's theorem (issue #33): the exhibit's model checked independently. Distances come from the model; the height
// comes from a√3/2; the weighted identity is checked against the shoelace area; random triangles show the plain sum moves.
import test from 'node:test';
import assert from 'node:assert/strict';
import {facts,foot,inside,clampInside,equilateralFrom,centroid,isEquilateral,distToLine} from '../site/js/gallery/gallery-viviani-model.js';

let seed=7;const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} versus ${b}`);
const randomIn=T=>{let u=rnd(),v=rnd();if(u+v>1){u=1-u;v=1-v;}return [T[0][0]+u*(T[1][0]-T[0][0])+v*(T[2][0]-T[0][0]),T[0][1]+u*(T[1][1]-T[0][1])+v*(T[2][1]-T[0][1])];};

test('equilateral triangle: d1 + d2 + d3 = a√3/2 for every inside point, vertices and edges included', () => {
  for(let k=0;k<50;k++){
    const G=[rnd()*400,rnd()*400],T=equilateralFrom(G,[G[0]+20+rnd()*200,G[1]+rnd()*100],k%3),a=Math.hypot(T[1][0]-T[0][0],T[1][1]-T[0][1]),h=a*Math.sqrt(3)/2;
    assert.ok(isEquilateral(T,1e-12));
    for(let j=0;j<40;j++)near(facts(T,randomIn(T)).sum,h,1e-9);
    for(const P of [...T,centroid(T),[(T[0][0]+T[1][0])/2,(T[0][1]+T[1][1])/2]])near(facts(T,P).sum,h,1e-9);
  }
});

test('any triangle: a·d1 + b·d2 + c·d3 = 2 × area (shoelace), but the plain sum changes', () => {
  for(let k=0;k<50;k++){
    const T=[[rnd()*300,rnd()*300],[rnd()*300,rnd()*300],[rnd()*300,rnd()*300]];
    const S=Math.abs((T[1][0]-T[0][0])*(T[2][1]-T[0][1])-(T[2][0]-T[0][0])*(T[1][1]-T[0][1]))/2;if(S<100)continue;
    const sums=[];
    for(let j=0;j<20;j++){const f=facts(T,randomIn(T));near(f.weighted,2*S,1e-9);near(f.parts[0]+f.parts[1]+f.parts[2],S,1e-9);sums.push(f.sum);}
    if(!isEquilateral(T,1e-3))assert.ok(Math.max(...sums)-Math.min(...sums)>1e-6,'the sum moves in a scalene triangle');
    // at a vertex, the sum is the height from that vertex
    for(let i=0;i<3;i++)near(facts(T,T[i]).sum,facts(T,T[i]).heights[i],1e-9);
  }
});

test('feet of the perpendiculars, inside test and clamping', () => {
  const T=[[0,0],[10,0],[0,10]];
  assert.deepEqual(foot([3,5],[0,0],[10,0]),[3,0]);
  near(distToLine([3,5],[0,0],[10,0]),5);
  assert.ok(inside(T,[2,2]));assert.ok(!inside(T,[8,8]));
  const Q=clampInside(T,[8,8]);assert.ok(inside(T,Q,1e-9));near(Q[0]+Q[1],10,1e-9);
  const R=clampInside(T,[2,3]);near(R[0],2);near(R[1],3);   // a point inside does not move
});
