#!/usr/bin/env python3
"""Find a visibly shaped, homogeneous, convex body with exactly one stable and one unstable equilibrium.

The body is described by its support function h(nu) on the unit sphere (the height of the centre of gravity above a plane
resting against the body with outward normal nu). For a convex body whose centre of gravity is the origin the equilibria are
the critical points of h, and the body is convex exactly when Hess_S h + h >= 0, which is LINEAR in h. h is a polynomial
sum k*x^(2a)*z^c (two mirror planes x -> -x, y -> -y; poles at nu = (0, 0, -+1)) of degree L. Sequential linear programming:
maximise h(N) - h(S) subject to
  * convexity: radii of curvature e^T (Hess_S h + h) e >= EPS in six tangent directions at every point of a grid,
  * no critical point off the poles: h_theta <= -DELTA sin(2 theta) cos(phi)^2 inside the quarter, h_phi >= DELTA cos(phi) on both
    symmetry lines theta = 0 and theta = pi/2,
  * centre of gravity at the origin (nonlinear: the z-centroid by the divergence theorem, linearised at each step).
Usage: optimise-gomboc.py [L=10] [EPS=0.05] [DELTA=0.002] [OUT=site/js/gomboc-support-data.js]
The result is only as good as its grid: tests/gomboc.test.mjs re-checks convexity, critical points and the centroid with an
independent finer evaluation. Needs numpy and scipy. Nothing here uses any other body's geometry.
"""
import numpy as np, sys, json
from scipy.optimize import linprog
L=int(sys.argv[1]) if len(sys.argv)>1 else 10
EPS=float(sys.argv[2]) if len(sys.argv)>2 else 0.05
DEL=float(sys.argv[3]) if len(sys.argv)>3 else 0.002
monos=[(a,c) for a in range(L//2+1) for c in range(L-2*a+1)]
K=len(monos)
def basis(nu):
    """monomial x^{2a} z^c: value, grad(3), hess(3x3) at points nu (n,3)"""
    x,y,z=nu[:,0],nu[:,1],nu[:,2];n=len(nu)
    val=np.zeros((n,K));gr=np.zeros((n,K,3));he=np.zeros((n,K,3,3))
    for k,(a,c) in enumerate(monos):
        X=x**(2*a);Z=z**c
        dX=2*a*x**(2*a-1) if a>0 else 0*x
        ddX=2*a*(2*a-1)*x**(2*a-2) if a>0 else 0*x
        dZ=c*z**(c-1) if c>0 else 0*z
        ddZ=c*(c-1)*z**(c-2) if c>1 else 0*z
        val[:,k]=X*Z
        gr[:,k,0]=dX*Z;gr[:,k,2]=X*dZ
        he[:,k,0,0]=ddX*Z;he[:,k,2,2]=X*ddZ;he[:,k,0,2]=he[:,k,2,0]=dX*dZ
    return val,gr,he
def frame(th,ph):
    nu=np.stack([np.cos(ph)*np.cos(th),np.cos(ph)*np.sin(th),np.sin(ph)],-1)
    ep=np.stack([-np.sin(ph)*np.cos(th),-np.sin(ph)*np.sin(th),np.cos(ph)],-1)
    et=np.stack([-np.sin(th),np.cos(th),0*th],-1)
    return nu,ep,et
# orthonormalisation over the sphere (even-even symmetric functions): Gauss in phi
gx,gw=np.polynomial.legendre.leggauss(80);phq=gx*np.pi/2;wq=gw*np.pi/2*np.cos(phq)
thq=(np.arange(40)+.5)/40*np.pi/2
TH,PH=np.meshgrid(thq,phq,indexing='ij');W=np.broadcast_to(wq,TH.shape).ravel()*(np.pi/2/40)
nuq,epq,etq=frame(TH.ravel(),PH.ravel())
Vq,_,_=basis(nuq)
G=(Vq*W[:,None]).T@Vq
# make constant function first, Cholesky of Gram -> orthonormal coefficients
Lc=np.linalg.cholesky(G+1e-14*np.eye(K))
T=np.linalg.inv(Lc).T   # monomial coeffs = T @ orth coeffs ; orth fn_j = sum_k T[k,j] mono_k
# normalise so first orthonormal function equals 1 (value) : scale
s0=(Vq@T[:,0])[0];T=T.copy();T[:,0]/=s0
for j in range(1,K):T[:,j]/=1.0   # keep orthonormal scale for others (relative to L2 norm of sphere/ (quarter))
# constraint rows in orth coordinates
def rows_A(th,ph,alpha):
    nu,ep,et=frame(th,ph);v,g,h=basis(nu)
    e=np.cos(alpha)*ep+np.sin(alpha)*et
    eHe=np.einsum('ni,nkij,nj->nk',e,h,e)
    nug=np.einsum('ni,nki->nk',nu,g)
    return (eHe-nug+v)@T
def rows_grad(th,ph):
    nu,ep,et=frame(th,ph);v,g,h=basis(nu)
    return np.einsum('ni,nki->nk',ep,g)@T,np.einsum('ni,nki->nk',et,g)@T,v@T
# grids
tg=np.linspace(0,np.pi/2,25);pg=np.linspace(-np.pi/2,np.pi/2,61)
TG,PG=np.meshgrid(tg,pg,indexing='ij');TG=TG.ravel();PG=PG.ravel()
conv=np.vstack([rows_A(TG,PG,a) for a in np.linspace(0,np.pi,6,endpoint=False)])   # A(e,e) >= EPS
# monotone
ti=np.linspace(.04,np.pi/2-.04,22);pi_=np.linspace(-np.pi/2+.02,np.pi/2-.02,60)
TI,PI=np.meshgrid(ti,pi_,indexing='ij');TI=TI.ravel();PI=PI.ravel()
_,gt,_=rows_grad(TI,PI)
mono_t=gt+DEL*np.sin(2*TI)[:,None]*np.cos(PI)[:,None]    # grad.e_theta + DEL sin2t cosphi <= 0
pl=np.linspace(-np.pi/2+.01,np.pi/2-.01,80)
gp0,_,_=rows_grad(0*pl,pl);gp1,_,_=rows_grad(0*pl+np.pi/2,pl)
mono_p=-np.vstack([gp0,gp1])+DEL*np.cos(np.concatenate([pl,pl]))[:,None]   # -(grad.e_phi)+DEL cosphi <=0
# poles
_,_,vN=rows_grad(np.array([0.]),np.array([np.pi/2]));_,_,vS=rows_grad(np.array([0.]),np.array([-np.pi/2]))
obj_row=(vN-vS)[0]
# centroid machinery
nq=nuq;Vq0,Gq,Hq=basis(nq)
P_=np.eye(3)[None]-nq[:,:,None]*nq[:,None,:]
def parts(c):
    h=Vq0@(T@c) if False else (Vq0@T)@c
    return h
VT=Vq0@T
GT=np.einsum('nkj,kl->nlj',Gq,T)      # grad of orth fns (n,K,3)
HT=np.einsum('nkij,kl->nlij',Hq,T)
Aef=np.einsum('ni,nkij,nj->nk',epq,HT,epq)-np.einsum('ni,nki->nk',nq,GT)+VT
Aet=np.einsum('ni,nkij,nj->nk',etq,HT,etq)-np.einsum('ni,nki->nk',nq,GT)+VT
Aeft=np.einsum('ni,nkij,nj->nk',epq,HT,etq)
gep=np.einsum('ni,nki->nk',epq,GT);get=np.einsum('ni,nki->nk',etq,GT)
def zc(c):
    h=VT@c;a11=Aef@c;a22=Aet@c;a12=Aeft@c;det=a11*a22-a12**2
    zs=h*nq[:,2]+(gep@c)*epq[:,2]+(get@c)*etq[:,2]
    V=(h*det*W).sum()/3
    return (zs*h*det*W).sum()/(4*V),V
def info(c):
    h=VT@c;return h.min(),h.max()
c=np.zeros(K);c[0]=1.0
tr=0.02
lastobj=None
for it in range(110):
    # linearise centroid
    z0,V0=zc(c);gz=np.zeros(K)
    for k in range(1,K):
        d=np.zeros(K);d[k]=1e-6;gz[k]=(zc(c+d)[0]-zc(c-d)[0])/2e-6
    A_ub=np.vstack([-conv,mono_t,mono_p]);b_ub=np.concatenate([-EPS*np.ones(len(conv)),np.zeros(len(mono_t)+len(mono_p))])
    b_ub=b_ub-A_ub@c
    res=linprog(-obj_row[1:],A_ub=A_ub[:,1:],b_ub=b_ub,A_eq=gz[None,1:],b_eq=[-z0],bounds=[(-tr,tr)]*(K-1),method='highs')
    if res.status!=0:
        print(it,'LP status',res.status,res.message[:60],'tr',tr);tr*=.5
        if tr<1e-5:break
        continue
    d=np.zeros(K);d[1:]=res.x
    cn=c+d
    # accept if constraints satisfied approx (nonlinear centroid) - always accept, track
    zn,Vn=zc(cn)
    c=cn
    ob=obj_row@c;hm,hM=info(c)
    viol=max((-conv@c+EPS).max(),(mono_t@c).max(),(mono_p@c).max())
    print(it,'obj',round(ob,5),'h range',round(hm,4),round(hM,4),'zc',f'{zn:.2e}','maxviol',f'{viol:.2e}','tr',tr,flush=True)
    lastobj=ob
    if it>=30: tr=max(tr*0.9,1e-6)
terms=[[a,cc,float(f'{k:.17g}')] for (a,cc),k in zip(monos,T@c)]
out=sys.argv[4] if len(sys.argv)>4 else 'site/js/gomboc-support-data.js'
open(out,'w').write("// GENERATED by scripts/optimise-gomboc.py: the visibly shaped mono-monostatic body, as the coefficients of its support function\n// h(\u03bd) = \u03a3 k\u00b7x^(2a)\u00b7z^c on the unit sphere (see gomboc-support.js). Optimised, not copied from any other body.\nexport const VISIBLE_META = "+json.dumps({'degree':L,'convexityMargin':EPS,'monotoneMargin':DEL})+";\nexport const VISIBLE_TERMS = "+json.dumps(terms)+";\n")
print('written',out,'h range',info(c))
