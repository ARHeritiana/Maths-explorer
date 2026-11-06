// Short, varied automatismes explicitly designed around five mathematical competencies.
// Metadata is internal: do not display competency labels or requests for justification.
const M = (s) => `\\(${s}\\)`;
const sign = (n) => n < 0 ? `${n}` : `+${n}`;
const lin = (a,b,v='x') => `${a===1?'':a===-1?'-':a}${v}${b===0?'':sign(b)}`;
const frac = (n,d) => d===1?String(n):`\\dfrac{${n}}{${d}}`;
const half = (n) => n%2===0?String(n/2):frac(n,2);
const xMinus = (k) => k===0 ? 'x' : `(x${sign(-k)})`;
const complex = (a,b) => `${a===0?'':a}${b===0?'':(b<0?'-':a===0?'':'+')+(Math.abs(b)===1?'':Math.abs(b))+'i'}`;
const answer = (q,a,ok) => ({q,a,ok,s:''});
const T = (id,cls,chapter,domain,competence,skill,make) => ({id,cls,chapter,domain,competence,skill,fast:true,make});

export const COMPETENCES = ['chercher','modeliser','representer','raisonner','calculer'];
export const COMPETENCE_STARTERS = [
  // Seconde: search and translate before calculating.
  T('cs-s-multiple','seconde','seconde-01','nombres','chercher','Trouver un entier sous contraintes',r=>{
    const d=r.int(5,12), n=d*r.int(2,8),lo=n-r.int(1,2),hi=n+r.int(1,2);
    return answer(`Quel entier de l’intervalle ${M(`[${lo}\\,;\\,${hi}]`)} est multiple de ${M(d)} ?`,M(n),()=>n%d===0&&Array.from({length:hi-lo+1},(_,i)=>lo+i).filter(v=>v%d===0).length===1);
  }),
  T('cs-s-negative-square','seconde','seconde-04','nombres','chercher','Trouver un entier négatif',r=>{
    const n=r.int(3,30);return answer(`Quel entier négatif a pour carré ${M(n*n)} ?`,M(-n),()=>Math.pow(-n,2)===n*n);
  }),
  T('cs-s-tariff','seconde','seconde-10','fonctions','modeliser','Traduire un tarif en fonction',r=>{
    const fixe=r.int(2,14),prix=r.int(3,12);
    return answer(`Une location coûte ${fixe} € plus ${prix} € par heure. Exprimer son coût ${M('C(x)')} pour ${M('x')} heures.`,M(`C(x)=${lin(prix,fixe)}`),()=>[0,1,4].every(x=>prix*x+fixe===fixe+prix*x));
  }),
  T('cs-s-rectangle','seconde','seconde-08','algebre','modeliser','Exprimer une aire',r=>{
    const d=r.int(1,30);return answer(`Un rectangle a pour côtés ${M('x')} et ${M(`x+${d}`)}. Donner son aire ${M('A(x)')}.`,M(`A(x)=x(x+${d})`),()=>[1,3,8].every(x=>x*(x+d)===x*x+d*x));
  }),
  T('cs-s-table-line','seconde','seconde-03','geometrie','representer','Passer de valeurs à une fonction affine',r=>{
    const a=r.nz(-5,5),b=r.int(-8,8),y=b+2*a;
    return answer(`Une fonction affine vérifie ${M(`f(0)=${b}`)} et ${M(`f(2)=${y}`)}. Donner son expression.`,M(`f(x)=${lin(a,b)}`),()=>a*2+b===y);
  }),
  T('cs-s-sign-reverse','seconde','seconde-04','nombres','raisonner','Comparer deux opposés',r=>{
    const a=r.int(-12,5),b=a+r.int(1,9);
    return answer(`Sachant que ${M(`${a}<${b}`)}, comparer leurs opposés ${M(-a)} et ${M(-b)}.`,M(`${-a}>${-b}`),()=>a<b&&-a>-b);
  }),
  T('cs-s-function-sign','seconde','seconde-10','fonctions','raisonner','Déduire des variations',r=>{
    const a=r.nz(-9,9),b=r.int(-9,9);
    return answer(`La fonction ${M(`f(x)=${lin(a,b)}`)} est-elle croissante ou décroissante sur ${M('\\mathbb{R}')} ?`,a>0?'Croissante.':'Décroissante.',()=>a!==0);
  }),
  T('cs-s-mental','seconde','seconde-01','nombres','calculer','Multiplier mentalement par 25',r=>{
    const n=4*r.int(3,45);return answer(`Calculer mentalement ${M(`25\\times ${n}`)}.`,M(25*n),()=>25*n===100*(n/4));
  }),

  // Première spécialité.
  T('cs-p-find-root','premiere','premiere-02','algebre','chercher','Rechercher une racine',r=>{
    const a=r.int(-6,6),d=r.int(2,8),b=a+d;
    return answer(`Trouver la plus petite solution de ${M(`${xMinus(a)}^{2}=${d*d}`)}.`,M(`x=${a-d}`),()=>Math.pow(a-d-a,2)===d*d&&a-d<a+d);
  }),
  T('cs-p-find-index','premiere','premiere-01','suites','chercher','Trouver le rang d’un terme',r=>{
    const u=r.int(-5,20),step=r.nz(-6,6),n=r.int(2,15),v=u+n*step;
    return answer(`La suite ${M('u_n')} est arithmétique, avec ${M(`u_0=${u}`)} et ${M(`r=${step}`)}. Trouver ${M('n')} tel que ${M(`u_n=${v}`)}.`,M(`n=${n}`),()=>u+n*step===v&&step!==0);
  }),
  T('cs-p-growth','premiere','premiere-01','suites','modeliser','Modéliser une évolution géométrique',r=>{
    const n0=100*r.int(2,15),p=r.pick([2,3,4,5,10,20]);
    return answer(`Une population de ${n0} personnes augmente de ${p} % chaque année. Exprimer la population ${M('u_n')} après ${M('n')} années.`,M(`u_n=${n0}\\left(1+\\dfrac{${p}}{100}\\right)^n`),()=>n0>0&&p>0);
  }),
  T('cs-p-conditional','premiere','premiere-05','stats-proba','modeliser','Identifier une probabilité conditionnelle',r=>{
    const n=r.int(20,90),k=r.int(2,n-1);
    return answer(`Parmi ${n} élèves pratiquant un sport, ${k} jouent au tennis. Quelle est la probabilité de jouer au tennis sachant que l’élève pratique un sport ?`,M(frac(k,n)),()=>k>0&&k<n);
  }),
  T('cs-p-vertex','premiere','premiere-02','algebre','representer','Passer du sommet à la forme canonique',r=>{
    const h=r.nz(-6,6),k=r.int(-9,9),a=r.pick([-3,-2,-1,1,2,3]),expr=`${a===1?'':a===-1?'-':a}(x${sign(-h)})^{2}${k===0?'':sign(k)}`;
    return answer(`Le sommet d’une parabole est ${M(`S(${h}\\,;\\,${k})`)} et son coefficient dominant est ${M(`a=${a}`)}. Écrire la forme canonique.`,M(`f(x)=${expr}`),()=>a!==0&&a*(h-h)**2+k===k&&a*((h+1-h)**2)-a*((h-h)**2)===a);
  }),
  T('cs-p-discriminant','premiere','premiere-02','algebre','raisonner','Déduire le signe du discriminant',r=>{
    const u=r.int(-7,3),v=u+r.int(1,9),a=r.pick([-3,-2,-1,1,2,3]);
    return answer(`Le trinôme ${M(`f(x)=${a===1?'':a===-1?'-':a}${xMinus(u)}${xMinus(v)}`)} a-t-il un discriminant positif, nul ou négatif ?`,'Positif.',()=>a!==0&&u!==v);
  }),
  T('cs-p-derivative-monotonic','premiere','premiere-04','analyse','raisonner','Déduire le sens de variation',r=>{
    const k=r.int(-8,8),positive=r.sign()>0;
    return answer(`Sur ${M(`[${k}\\,;\\,${k+3}]`)}, on sait que ${M(positive?"f'(x)>0":"f'(x)<0")}. Donner le sens de variation de ${M('f')}.`,positive?'Croissante.':'Décroissante.',()=>k+3>k);
  }),
  T('cs-p-derivative-value','premiere','premiere-04','analyse','calculer','Calculer une dérivée en un point',r=>{
    const a=r.nz(-7,7),b=r.int(-9,9),x=r.int(-5,5);
    const bx=b===0?'':b===1?'+x':b===-1?'-x':sign(b)+'x';
    return answer(`Pour ${M(`f(x)=${a===1?'':a===-1?'-':a}x^{2}${bx}`)}, calculer ${M(`f'(${x})`)}.`,M(2*a*x+b),()=>2*a*x+b===a*((x+1)**2-x*x)+b-a);
  }),

  // Terminale spécialité.
  T('cs-t-power-rank','terminale','terminale-03','suites','chercher','Rechercher un rang exponentiel',r=>{
    const a=r.pick([2,3,4,5,6]),n=r.int(2,a===2?9:a===3?6:a===4?5:a===5?4:3);return answer(`Trouver ${M('n')} tel que ${M(`${a}^{n}=${a**n}`)}.`,M(`n=${n}`),()=>a**n===Number(`${a**n}`));
  }),
  T('cs-t-choose-primitive','terminale','terminale-10','analyse','chercher','Reconnaître une primitive',r=>{
    const n=r.int(2,8),a=r.int(2,9),coeff=a*(n+1);
    return answer(`Parmi ${M(`${a}x^{${n}}`)}, ${M(`${a}x^{${n+1}}`)} et ${M(`${a}x^{${n+2}}`)}, laquelle est une primitive de ${M(`${coeff}x^{${n}}`)} ?`,M(`${a}x^{${n+1}}`),()=>coeff===a*(n+1));
  }),
  T('cs-t-decay','terminale','terminale-01','suites','modeliser','Modéliser une décroissance',r=>{
    const u0=100*r.int(2,20),p=r.pick([5,10,15,20,25]);
    return answer(`Une quantité de ${u0} unités diminue de ${p} % chaque année. Exprimer ${M('u_n')} après ${M('n')} années.`,M(`u_n=${u0}\\left(1-\\dfrac{${p}}{100}\\right)^n`),()=>u0>0&&p>0&&p<100);
  }),
  T('cs-t-ode','terminale','terminale-10','analyse','modeliser','Traduire un taux de variation',r=>{
    const a=r.nz(-12,12);return answer(`La vitesse de variation d’une grandeur ${M('y')} est à chaque instant égale à ${M(a)} fois cette grandeur. Donner l’équation différentielle.`,M(`y'=${a===1?'':a===-1?'-':a}y`),()=>a!==0);
  }),
  T('cs-t-derivative-table','terminale','terminale-04','analyse','representer','Lire les variations dans le signe de f prime',r=>{
    const k=r.int(-6,6),before=r.sign()>0;
    return answer(`Une fonction ${M('f')} est dérivable sur ${M('\\mathbb{R}')} avec ${M(`f'(${k})=0`)}. On a ${M(before?`f'(x)>0\\text{ si }x<${k}`:`f'(x)<0\\text{ si }x<${k}`)} et le signe opposé si ${M(`x>${k}`)}. ${M('f')} admet-elle un maximum ou un minimum en ${M(k)} ?`,before?'Un maximum.':'Un minimum.',()=>Number.isInteger(k));
  }),
  T('cs-t-bounded','terminale','terminale-03','suites','raisonner','Reconnaître une convergence',r=>{
    const m=r.int(-20,0),Mmax=r.int(2,15);return answer(`Une suite croissante est majorée par ${M(Mmax)} et minorée par ${M(m)}. Est-elle convergente ?`,'Oui.',()=>Mmax>m);
  }),
  T('cs-t-convex','terminale','terminale-06','analyse','raisonner','Lire la convexité par la dérivée seconde',r=>{
    const a=r.nz(-8,8),p=r.int(-7,7);
    return answer(`Sur ${M(`[${p}\\,;\\,${p+4}]`)}, ${M(a>0?"f''(x)>0":"f''(x)<0")}. ${M('f')} est-elle convexe ou concave ?`,a>0?'Convexe.':'Concave.',()=>a!==0);
  }),
  T('cs-t-ln-exp','terminale','terminale-08','analyse','calculer','Simplifier un logarithme',r=>{
    const n=r.int(-15,15);return answer(`Simplifier ${M(`\\ln(e^{${n}})`)}.`,M(n),()=>Math.abs(Math.log(Math.exp(n))-n)<1e-9);
  }),

  // Mathématiques expertes.
  T('cs-e-residue-interval','expertes','expertes-06','arithmetique','chercher','Trouver un entier congru',r=>{
    const m=r.int(6,13),n=r.int(10,80),lo=n-r.int(1,2),hi=n+r.int(1,2),rem=(n%m+m)%m;
    return answer(`Quel entier de ${M(`[${lo}\\,;\\,${hi}]`)} est congru à ${M(rem)} modulo ${M(m)} ?`,M(n),()=>[...Array(hi-lo+1)].map((_,i)=>lo+i).filter(x=>((x%m)+m)%m===rem).length===1);
  }),
  T('cs-e-complex-equation','expertes','expertes-01','complexes','chercher','Trouver une affixe',r=>{
    const a=r.nz(-7,7),b=r.nz(-7,7);
    return answer(`Trouver ${M('z')} tel que ${M(`z+(${complex(a,b)})=0`)}.`,M(complex(-a,-b)),()=>a+(-a)===0&&b+(-b)===0);
  }),
  T('cs-e-markov','expertes','expertes-11','matrices','modeliser','Construire une matrice de transition',r=>{
    const a=r.int(1,8),b=r.int(1,8);
    const mat=`\\begin{pmatrix}${frac(10-a,10)}&${frac(a,10)}\\\\${frac(b,10)}&${frac(10-b,10)}\\end{pmatrix}`;
    return answer(`Chaque étape, ${10*a} % des éléments de A passent en B, et ${10*b} % des éléments de B passent en A. Donner la matrice de transition (lignes A, B).`,M(mat),()=>((10-a)+a===10)&&((10-b)+b===10));
  }),
  T('cs-e-rotation','expertes','expertes-05','complexes','modeliser','Traduire une rotation par une affixe',r=>{
    const a=r.nz(-5,5),b=r.nz(-5,5),clockwise=r.sign()<0;
    return answer(`Dans le plan complexe, une rotation de centre O et d’angle ${M(clockwise?'-\\pi/2':'\\pi/2')} envoie l’affixe ${M(complex(a,b))} sur quelle affixe ${M("z'")} ?`,M(`z'=${clockwise?complex(b,-a):complex(-b,a)}`),()=>a!==0&&b!==0);
  }),
  T('cs-e-affix-point','expertes','expertes-05','complexes','representer','Passer de l’affixe aux coordonnées',r=>{
    const a=r.nz(-8,8),b=r.nz(-8,8);
    return answer(`Dans le plan complexe, donner les coordonnées du point d’affixe ${M(complex(a,b))}.`,M(`(${a}\\,;\\,${b})`),()=>a!==0&&b!==0);
  }),
  T('cs-e-odd-square','expertes','expertes-06','arithmetique','raisonner','Déduire une congruence',r=>{
    const n=2*r.int(2,25)+1;return answer(`Quel est le reste de la division de ${M(`${n}^{2}`)} par ${M(8)} ?`,M(1),()=>n%2===1&&(n*n)%8===1);
  }),
  T('cs-e-imaginary-arg','expertes','expertes-03','complexes','raisonner','Identifier un argument',r=>{
    const k=r.int(1,15),s=r.sign();return answer(`Donner un argument du nombre complexe ${M(`${s*k}i`)}.`,M(s>0?'\\dfrac{\\pi}{2}':'-\\dfrac{\\pi}{2}'),()=>s*k!==0);
  }),
  T('cs-e-modular-add','expertes','expertes-06','arithmetique','calculer','Calculer un reste modulo n',r=>{
    const m=r.int(3,13),a=r.int(2,40),b=r.int(2,40),v=(a*b)%m;
    return answer(`Déterminer le reste de ${M(`${a}\\times ${b}`)} dans la division par ${M(m)}.`,M(v),()=>v>=0&&v<m);
  }),

  // Terminale STMG.
  T('cs-m-best-tariff','stmg','stmg-02','nombres','chercher','Comparer trois tarifs',r=>{
    const n=r.pick([3,4,5,6,7,8,10,11,13]),p=r.int(2,8),fixed=r.int(1,10),a=fixed+p*n,b=fixed+9+(p-1)*n,c=fixed+21+(p-2)*n;
    const lowest=Math.min(a,b,c),ids=['A','B','C'].filter((_,i)=>[a,b,c][i]===lowest);
    return answer(`Pour ${n} unités, trois offres coûtent A : ${M(`${fixed}+${p}\\times ${n}`)} €, B : ${M(`${fixed+9}+${p-1}\\times ${n}`)} €, C : ${M(`${fixed+21}+${p-2}\\times ${n}`)} €. Quelle offre est la moins chère ?`,ids.join(' et ')+'.',()=>Math.min(a,b,c)===lowest);
  }),
  T('cs-m-threshold','stmg','stmg-01','suites','chercher','Trouver un seuil',r=>{
    const u0=100*r.int(2,20),step=10*r.int(2,7),k=r.int(2,9),threshold=u0+step*k;
    return answer(`La suite des recettes vérifie ${M(`u_0=${u0}`)} et augmente de ${step} € par mois. Quel est le plus petit ${M('n')} tel que ${M(`u_n\\geqslant ${threshold}`)} ?`,M(k),()=>u0+step*k===threshold);
  }),
  T('cs-m-cost','stmg','stmg-02','fonctions','modeliser','Traduire un coût fixe et variable',r=>{
    const fixed=r.int(5,40)*10,unit=r.int(2,15);
    return answer(`Une entreprise paie ${fixed} € de frais fixes et ${unit} € par produit. Donner le coût ${M('C(x)')} de ${M('x')} produits.`,M(`C(x)=${lin(unit,fixed)}`),()=>fixed+unit*10===10*unit+fixed);
  }),
  T('cs-m-evolution','stmg','stmg-01','suites','modeliser','Modéliser un taux d’évolution annuel',r=>{
    const amount=r.int(2,20)*100,p=r.pick([2,4,5,8,10,15]);
    return answer(`Le chiffre d’affaires est de ${amount} € et augmente de ${p} % par an. Écrire son expression ${M('u_n')} après ${M('n')} ans.`,M(`u_n=${amount}\\left(1+\\dfrac{${p}}{100}\\right)^n`),()=>amount>0&&p>0);
  }),
  T('cs-m-table','stmg','stmg-05','stats-proba','representer','Passer de deux valeurs à une droite',r=>{
    const a=r.nz(-5,5),b=r.int(-6,6),y=b+2*a;
    return answer(`Une droite d’ajustement passe par ${M(`A(0\\,;\\,${b})`)} et ${M(`B(2\\,;\\,${y})`)}. Donner son équation réduite.`,M(`y=${lin(a,b)}`),()=>2*a+b===y);
  }),
  T('cs-m-rate-composition','stmg','stmg-02','nombres','raisonner','Comparer hausse et baisse successives',r=>{
    const p=r.pick([5,10,15,20,25,30]),price=r.int(4,50)*10;return answer(`Un prix de ${price} € augmente de ${p} % puis diminue de ${p} %. Revient-il à son prix initial ?`,'Non, il est inférieur.',()=>((100+p)/100)*((100-p)/100)<1);
  }),
  T('cs-m-means','stmg','stmg-05','stats-proba','raisonner','Raisonner sur des moyennes de groupes',r=>{
    const x=r.int(3,18),y=x+r.int(2,15),same=r.sign()>0,n=r.int(2,13),m=same?n:n+r.int(1,8);
    return answer(`Deux groupes ont des moyennes ${M(x)} et ${M(y)} et des effectifs ${M(n)} et ${M(m)}. La moyenne des deux groupes est-elle égale à ${M(half(x+y))} ?`,same?'Oui.':'Non.',()=>same===((n*x+m*y)/(n+m)===(x+y)/2));
  }),
  T('cs-m-multiplier','stmg','stmg-02','nombres','calculer','Appliquer un coefficient multiplicateur',r=>{
    const price=100*r.int(1,25),p=r.pick([5,10,20,25,50]);
    const result=price*(100-p)/100;
    return answer(`Après une remise de ${p} %, quel est le nouveau prix d’un article coûtant ${price} € ?`,`${result} €`,()=>result>0&&result<price);
  }),
];

export const competenceStartersFor = (cls) => COMPETENCE_STARTERS.filter(t=>t.cls===cls);

// Reviewed metadata for pre-existing templates. Unlisted symbolic fluency tasks default to 'calculer'.
// A single *predominant* competence is recorded; other competencies may also be involved.
const CHERCHER = new Set(['s-prime-test','s-divisors','s-set-ops','s-ref-equation','s-domain','e-prime-test']);
const MODELISER = new Set(['s-calc-program','s-percent','s-proportion','s-rate','s-successive','s-percent-equation','s-step-model','s-weighted-mean','s-proba-equiprob','p-proba-cond','p-rv','t-fixed-seq','t-counting','t-concentration','e-markov','m-geometric-seq','m-exp-evolution','m-threshold','m-stats2','m-proba-table']);
const REPRESENTER = new Set(['s-vec-coords','s-vec-norm','s-line-two-points','s-line-reduced','s-line-cartesian','s-affine-sign','s-interval-ops','s-abs-interval','s-set-ops','s-canonical-vertex','s-line-slope-point','p-canonical','p-circle','p-tangent','p-radians','t-plane-eq','t-plane-distance','t-space-vectors','e-complex-geometry','e-modulus-arg','e-graph','m-inverse']);
const RAISONNER = new Set(['s-prime-test','s-vec-colinear','s-line-relative','s-ref-equation','s-affine-variation','s-compare-images','s-aligned-points','s-converse','s-true-false','s-parity-expr','s-cond-inverse','s-proba-inverse','s-mean-update','p-variations','t-seq-limit','t-func-limit','t-convex','t-space-coplanar','e-fermat-power','e-bezout','e-prime-test','e-graph']);
const VISUAL_REASONING = new Set(['v-s-vectors-equal','v-s-parabola-shape','v-s-parabola-table','v-p-parabola-signs','v-p-parabola-table','v-t-derivative','v-t-second-derivative']);
export function starterCompetence(t) {
  if(t.competence) return t.competence;
  if(VISUAL_REASONING.has(t.id)) return 'raisonner';
  if(t.visual) return 'representer';
  if(RAISONNER.has(t.id)) return 'raisonner';
  if(MODELISER.has(t.id)) return 'modeliser';
  if(REPRESENTER.has(t.id)) return 'representer';
  if(CHERCHER.has(t.id)) return 'chercher';
  return 'calculer';
}