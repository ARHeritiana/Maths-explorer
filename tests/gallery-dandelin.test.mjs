// Dandelin's spheres (issue #31): the spheres really touch the cone and the plane, the touching points lie in the plane,
// the section points lie on both the cone and the plane, and PF1 + PF2 is the same everywhere: equal to T1T2 along the
// generator and to the major axis 2a measured on the drawn ellipse.
import test from 'node:test';
import assert from 'node:assert/strict';
import {setup,ellipse,ellipsePoint,facts,majorAxis,isEllipse,point} from '../site/js/gallery/gallery-dandelin-model.js';

const {dot,sub,len}=point,near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} versus ${b}`);
const cases=[];for(const a of [15,25,35])for(const b of [0,10,20,40])if(isEllipse(a*Math.PI/180,b*Math.PI/180))cases.push({alpha:a*Math.PI/180,beta:b*Math.PI/180,c:1+a/100});

test('each sphere is tangent to the cone (distance to every generator = r) and to the plane (distance = r), focus in the plane', () => {
  for(const q of cases){const S=setup(q);
    for(const s of [S.low,S.high]){
      near(Math.abs(dot(S.n,sub(s.C,S.P0))),s.r);near(dot(S.n,sub(s.F,S.P0)),0);
      for(let k=0;k<12;k++){const th=k*Math.PI/6,g=[Math.sin(q.alpha)*Math.cos(th),Math.sin(q.alpha)*Math.sin(th),Math.cos(q.alpha)],proj=dot(s.C,g),foot=[g[0]*proj,g[1]*proj,g[2]*proj];near(len(sub(s.C,foot)),s.r);}
    }
    assert.ok(S.low.C[2]<S.high.C[2]);
  }
});

test('section points are on the cone and in the plane', () => {
  for(const q of cases){const S=setup(q);for(const P of ellipse(S,48)){near(Math.hypot(P[0],P[1]),P[2]*Math.tan(q.alpha));near(dot(S.n,sub(P,S.P0)),0);}}
});

test('PF1 + PF2 is constant, equal to T1T2 along the generator and to the major axis 2a', () => {
  for(const q of cases){const S=setup(q),A=majorAxis(S);
    for(let k=0;k<60;k++){const f=facts(S,k*2*Math.PI/60);near(f.d1,f.PT1,1e-9);near(f.d2,f.PT2,1e-9);near(f.sum,f.T1T2,1e-9);near(f.sum,A,1e-9);}
    // independent: the largest distance between two drawn points of the ellipse is the major axis
    const E=ellipse(S,360);let m=0;for(const p of E)for(const r of E)m=Math.max(m,len(sub(p,r)));near(m,A,1e-6);
  }
});

test('a horizontal plane gives a circle: both foci at its centre', () => {
  const S=setup({alpha:0.4,beta:0,c:1});near(len(sub(S.low.F,S.high.F)),0);const E=ellipse(S,24);for(const p of E)near(len(sub(p,S.low.F)),Math.tan(0.4));
});
