from fractions import Fraction as F
from math import sqrt
import json
from pathlib import Path
cases={'running':(1,-6,5),'three_forms':(1,2,-3),'two_roots':(2,1,-3),'double':(3,-6,3),'none':(1,2,5),'sum_product':(1,-7,12),'prescribed':(-2,10,-8),'inequality':(1,-4,-5)}
R={}
for name,(a,b,c) in cases.items():
 D=b*b-4*a*c;alpha=F(-b,2*a);beta=a*alpha*alpha+b*alpha+c
 for x in [F(i,4) for i in range(-40,41)]:assert a*x*x+b*x+c==a*(x-alpha)**2+beta
 roots=sorted([F(-b-int(sqrt(D)),2*a),F(-b+int(sqrt(D)),2*a)]) if D>=0 and int(sqrt(D))**2==D else []
 if roots:
  for r in roots:assert a*r*r+b*r+c==0
  assert roots[0]+roots[-1]==F(-b,a) and roots[0]*roots[-1]==F(c,a)
 R[name]={'a':a,'b':b,'c':c,'delta':D,'alpha':str(alpha),'beta':str(beta),'roots':list(map(str,sorted(set(roots))))}
# Exhaustive rational-grid checks independently verify sign intervals and constrained maxima.
for x in [F(i,8) for i in range(-80,81)]:assert (x*x-4*x-5<0)==(-1<x<5)
A=lambda x:x*(8-x)
assert max((A(F(i,100)),F(i,100)) for i in range(301))==(F(15),F(3))
assert all(A(x)<=15 for x in [F(i,100) for i in range(301)])
assert max((x*(12-x),x) for x in range(13))==(36,6)
for a in [-2,2]:
 for beta in [-2,0,2]:
  b=-2*a;c=a+beta;D=b*b-4*a*c
  assert (D>0)-(D<0)==((-a*beta)>0)-((-a*beta)<0)
R['restricted']={'argmax':3,'max':15};R['rectangle']={'argmax':6,'max':36,'table':[[x,x*(12-x)] for x in [2,4,6,8,10]]}
print('Quadratic forms, roots, sign intervals, six cases and restricted maxima: independent checks pass.')

# Diagnostic and final-review examples, checked independently.
for x in [F(i,4) for i in range(-40,41)]:
 assert (x-2)**2==x*x-4*x+4
 assert -2*(x-1)**2+8==-2*(x+1)*(x-3)
 assert -2*(x-1)**2+8<=8
 assert ((x-3)*(x+1)==0)==(x in (F(-1),F(3)))
assert (F(3)-1)**2==4 and (F(-1)-1)**2==4
print('Diagnostic and final-review identities and maximum verified.')
