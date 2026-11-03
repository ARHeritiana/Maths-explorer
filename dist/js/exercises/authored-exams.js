// Original multi-part practice exercises for the online bank and worksheets.
// Text and numerical scenarios are newly authored; the normal bank, worksheet and export paths share these records.
const R = String.raw;
const near=(a,b,t=1e-8)=>Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b));
const derivative=(f,x)=>(f(x+1e-5)-f(x-1e-5))/2e-5;
const integral=(f,a,b,n=1000)=>{let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+(b-a)*i/n);return s*(b-a)/(3*n);};
const choose=(n,k)=>{let s=1;for(let i=1;i<=k;i++)s=s*(n-i+1)/i;return s;};
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const checks={
 'eam-01':()=>near(3/4-1/6,7/12)&&2**5*2**-2/2===4&&[-2,0,5].every(x=>(x-3)**2-(x-3)*(x+3)===-6*x+18),
 'eam-02':()=>near(250*1.12,280)&&near(280*.85,238)&&near(1.12*.85-1,-.048)&&near(250/238-1,6/119),
 'eam-03':()=>[-3,-.5,0,3,5].every(x=>2*x*x-5*x-3===(2*x+1)*(x-3))&&2*(-.5)**2-5*(-.5)-3===0&&2*3**2-5*3-3===0,
 'eam-04':()=>dot([4,0],[3,3])===12&&near(Math.hypot(3,3),3*Math.sqrt(2))&&near(Math.acos(12/(4*Math.sqrt(18))),Math.PI/4),
 'eam-05':()=>near(900*.8**3,460.8)&&900*.8**4>=300&&900*.8**5<300,
 'eam-06':()=>{const f=x=>2*x+18/x+7;return [.5,1,2,3,5].every(x=>near(derivative(f,x),2-18/x**2))&&f(3)===19&&f(1)===27&&2-18===-16;},
 'eam-07':()=>near((1/4)**2,1/16)&&near(2*(1/4)*(3/4),6/16)&&near((3/4)**2,9/16)&&near(6/16+6/16-18/16,-3/8),
 'eam-08':()=>{const f=x=>(3*x-6)*Math.exp(-x)+4;return [-1,0,1,3,4].every(x=>near(derivative(f,x),(9-3*x)*Math.exp(-x)))&&near(f(3),4+3*Math.exp(-3));},
 'e3c-01':()=>near(400*1.1**3,532.4)&&[0,1,2,3,4,5].every(n=>400*1.1**n<=500+30*n)&&400*1.1**6>680,
 'e3c-02':()=>{const sum=n=>Array.from({length:n},(_,i)=>3**(i+1)).reduce((a,b)=>a+b,0);return [1,2,3,5,6].every(n=>sum(n)===(3**(n+1)-3)/2)&&sum(5)===363&&sum(6)===1092;},
 'e3c-03':()=>near(.6*.05,.03)&&near(.6*.05+.4*.15,.09)&&near(.4*.15/.09,2/3)&&.05!==.09,
 'e3c-04':()=>near(3/12,1/4)&&near(2/3,2/3)&&near(3/12*2/11,1/22)&&near((3/12)**2,1/16)&&1/16>1/22,
 'e3c-05':()=>{const f=x=>x**3-3*x*x-9*x+11;return [-4,-1,0,1,3,5].every(x=>near(derivative(f,x),3*(x+1)*(x-3))&&near(f(x),(x-1)*(x*x-2*x-11)))&&f(-1)===16&&f(3)===-16&&[1-2*Math.sqrt(3),1,1+2*Math.sqrt(3)].every(x=>near(f(x),0));},
 'e3c-06':()=>[[0,1],[4,3],[2,2]].every(([x,y])=>x-2*y+2===0)&&2*2+2-6===0&&dot([4,2],[-1,2])===0&&Math.hypot(1,-2)===Math.sqrt(5)&&(1-2)**2+(4-2)**2===5,
 'e3c-07':()=>near(Math.cos(7*Math.PI/6),-Math.sqrt(3)/2)&&near(Math.sin(7*Math.PI/6),-.5)&&[5*Math.PI/6,7*Math.PI/6].every(x=>near(Math.cos(x),-Math.sqrt(3)/2))&&[Math.PI/12,5*Math.PI/12].every(x=>near(Math.sin(2*x),.5)),
 'e3c-08':()=>{const f=x=>(2*x+1)*Math.exp(-x);return [-1,0,.5,2].every(x=>near(derivative(f,x),(1-2*x)*Math.exp(-x)))&&near(f(.5),2*Math.exp(-.5))&&f(-.5)===0&&f(0)===1;},
 'bac-01':()=>near(choose(10,8)*.8**8*.2**2,.301989888)&&near(10*.8**9*.2+.8**10,.3758096384)&&1-.2**4<.999&&1-.2**5>=.999,
 'bac-02':()=>near(.7*.02+.3*.06,.032)&&near(.3*.06/.032,9/16)&&Math.round((1-.968**20)*1e4)===4782&&near(.032*.968/20,.0015488),
 'bac-03':()=>{let u=3;for(let n=0;n<8;n++){const v=(u-2)/(u+2),next=(3*u+4)/(u+3);if(!(u>2&&next<u&&near(v,5**(-n-1))&&near((next-2)/(next+2),v/5)))return false;u=next;}return 5**5<4001&&5**6>=4001;},
 'bac-04':()=>{const f=x=>(x*x+2*x)*Math.exp(-x),F=x=>-((x+2)**2)*Math.exp(-x);return [0,1,Math.sqrt(2),3,10].every(x=>near(derivative(f,x),(2-x*x)*Math.exp(-x))&&near(derivative(F,x),f(x)))&&near(f(Math.sqrt(2)),(2+2*Math.sqrt(2))*Math.exp(-Math.sqrt(2)))&&near(integral(f,0,2),4-16*Math.exp(-2));},
 'bac-05':()=>{const T=t=>18+60*Math.exp(-t/5);return T(0)===78&&[0,1,5,10].every(t=>near(derivative(T,t),-.2*(T(t)-18)))&&near(T(5*Math.log(5)),30)&&near(integral(T,0,5)/5,18+60*(1-Math.exp(-1)));},
 'bac-06':()=>{const I=integral(x=>Math.exp(-x)*Math.cos(x),0,Math.PI/2),J=integral(x=>Math.exp(-x)*Math.sin(x),0,Math.PI/2);return near(I,1-J)&&near(J,I-Math.exp(-Math.PI/2))&&near(I,(1+Math.exp(-Math.PI/2))/2)&&near(J,(1-Math.exp(-Math.PI/2))/2)&&near((I+J)*2/Math.PI,2/Math.PI);},
 'bac-07':()=>{const N=[1,2,-2],H=[19/9,-7/9,16/9];return 1-4+3===0&&dot([2,1,-2],N)===8&&near(H[0]+2*H[1]-2*H[2]+3,0)&&near(Math.hypot(3-H[0],1-H[1],-H[2]),8/3);},
 'bac-08':()=>{const h=x=>x-2-Math.log(x);return [.1,.5,1,2,5].every(x=>near(derivative(h,x),1-1/x))&&h(1)===-1&&h(3.14)<0&&h(3.15)>0;}
};
const domains={'Automatismes':'algebre','Pourcentages':'nombres','Second degré':'algebre','Produit scalaire':'geometrie','Suites':'suites','Dérivation':'analyse','Variables aléatoires':'stats-proba','Exponentielle':'analyse','Probabilités conditionnelles':'stats-proba','Géométrie repérée':'geometrie','Trigonométrie':'fonctions','Loi binomiale':'stats-proba','Suites et récurrence':'suites','Analyse et intégration':'analyse','Équations différentielles':'analyse','Intégration par parties':'analyse','Géométrie de l’espace':'geometrie','Logarithme':'analyse'};
// Observable learning goals, distinct from the knowledge needed before attempting the problem.
const targetSkills = {
 'eam-01': ['Effectuer un calcul exact sur des fractions.', 'Appliquer les règles de calcul sur les puissances.', 'Développer ou factoriser une expression pour reconnaître une identité.'],
 'eam-02': ['Calculer un prix après des évolutions successives.', 'Déterminer un taux global à partir de coefficients multiplicateurs.', 'Calculer un taux réciproque et arrondir un pourcentage.'],
 'eam-03': ['Vérifier une factorisation de trinôme.', 'Résoudre une équation du second degré sous forme factorisée.', 'Étudier le signe d’un produit et résoudre une inéquation.'],
 'eam-04': ['Calculer les coordonnées et le produit scalaire de deux vecteurs.', 'Déterminer des longueurs dans un repère orthonormé.', 'Déterminer un angle à partir de son cosinus.'],
 'eam-05': ['Modéliser une diminution répétée par une suite géométrique.', 'Exprimer et calculer un terme de suite.', 'Écrire une boucle de seuil et justifier le premier rang obtenu.'],
 'eam-06': ['Dériver une fonction faisant intervenir un inverse.', 'Déduire les variations et un minimum du signe de la dérivée.', 'Déterminer une équation de tangente.'],
 'eam-07': ['Représenter deux épreuves indépendantes par un arbre pondéré.', 'Déterminer la loi d’un gain net.', 'Calculer et interpréter une espérance pour discuter l’équité d’un jeu.'],
 'eam-08': ['Dériver un produit comportant une exponentielle.', 'Étudier les variations à partir du signe de la dérivée.', 'Déterminer les coordonnées d’un point à tangente horizontale.'],
 'e3c-01': ['Distinguer un modèle arithmétique d’un modèle géométrique.', 'Exprimer et comparer les termes de deux suites.', 'Programmer une comparaison de seuil et justifier le premier dépassement.'],
 'e3c-02': ['Exprimer le terme général d’une suite géométrique.', 'Calculer une somme de termes consécutifs.', 'Utiliser un accumulateur pour déterminer un premier seuil.'],
 'e3c-03': ['Traduire des probabilités conditionnelles par un arbre pondéré.', 'Calculer une probabilité d’intersection et appliquer les probabilités totales.', 'Inverser un conditionnement.', 'Vérifier si deux événements sont indépendants.'],
 'e3c-04': ['Calculer une probabilité à partir d’un dénombrement.', 'Calculer une probabilité conditionnelle.', 'Modéliser deux tirages sans remise.', 'Comparer les modèles avec et sans remise.'],
 'e3c-05': ['Étudier les variations d’un polynôme à l’aide de sa dérivée.', 'Déterminer une tangente.', 'Factoriser un polynôme à partir d’une racine connue.', 'Déterminer ses racines et son signe.'],
 'e3c-06': ['Déterminer une équation cartésienne de droite et une perpendiculaire.', 'Calculer un projeté orthogonal en résolvant un système.', 'Calculer une distance dans un repère orthonormé.', 'Déterminer un cercle de diamètre donné et tester l’appartenance d’un point.'],
 'e3c-07': ['Calculer des valeurs trigonométriques exactes avec les angles associés.', 'Résoudre une équation trigonométrique sur un intervalle imposé.', 'Adapter l’intervalle de résolution lors d’un changement de variable.'],
 'e3c-08': ['Dériver un produit comportant une exponentielle.', 'Déterminer des variations et un maximum exact.', 'Déterminer une tangente.', 'Résoudre une équation et étudier un signe en utilisant la positivité de l’exponentielle.'],
 'bac-01': ['Justifier une modélisation par une loi binomiale.', 'Calculer une espérance et des probabilités binomiales.', 'Utiliser l’événement contraire pour calculer une probabilité.', 'Déterminer et contrôler une taille minimale d’échantillon.'],
 'bac-02': ['Appliquer les probabilités totales et inverser un conditionnement.', 'Modéliser un nombre de défauts par une loi binomiale.', 'Calculer la probabilité d’au moins un défaut.', 'Déterminer l’espérance et la variance d’une fréquence.'],
 'bac-03': ['Démontrer par récurrence une propriété assurant l’existence d’une suite.', 'Transformer une récurrence pour obtenir une suite géométrique.', 'Déterminer le sens de variation et la limite d’une suite.', 'Résoudre une inégalité de seuil et vérifier le premier rang.'],
 'bac-04': ['Étudier les variations et le maximum d’une fonction.', 'Déterminer une limite par croissance comparée.', 'Vérifier une primitive par dérivation.', 'Calculer une aire par intégration et étudier sa limite.'],
 'bac-05': ['Résoudre une équation différentielle avec condition initiale.', 'Étudier les variations et la limite d’un modèle de température.', 'Déterminer un instant de franchissement par le logarithme.', 'Calculer la valeur moyenne d’une fonction sur un intervalle.'],
 'bac-06': ['Effectuer une intégration par parties avec des fonctions exponentielles et trigonométriques.', 'Relier deux intégrales et résoudre le système obtenu.', 'Calculer une valeur moyenne à partir d’une intégrale.'],
 'bac-07': ['Vérifier l’appartenance d’un point à un plan.', 'Tester le parallélisme ou l’orthogonalité d’une droite et d’un plan.', 'Déterminer une intersection par une représentation paramétrique.', 'Calculer une projection et une distance dans l’espace en justifiant les affirmations.'],
 'bac-08': ['Étudier les limites, les variations et la convexité d’une fonction logarithmique.', 'Justifier l’existence et l’unicité de racines sur des intervalles.', 'Encadrer numériquement une solution avec une précision imposée.', 'Résoudre une inéquation à partir du signe de la fonction.']
};
// Python is rendered as a display array, so the same code stays legible in HTML, print and LaTeX.
const codeText=s=>s.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g,(_,code)=>'\\[\\begin{array}{l}'+code.split('\n').map(line=>{
  const indent=line.match(/^ */)[0].length/4;
  return '\\quad'.repeat(indent)+'\\texttt{'+line.trim().replace(/_/g,'\\_')+'}';
}).join('\\\\')+'\\end{array}\\]');
const problem=(id,exam,title,topic,chapters,level,minutes,prerequisites,statement,questions,hints,solution)=>({
 id:'exam-'+id,title,topic,cls:exam==='Bac'?'terminale':'premiere',domain:domains[topic],chapters,level,minutes,
 prerequisites,skills:targetSkills[id],
 intro:statement+' Prérequis : '+prerequisites,
 parts:questions.map((q,i)=>({w:1,q,hint:i===0?hints.join(' '):'',a:codeText(solution[i])})),
 ok:checks[id]
});

export const authoredExams = [
problem('eam-01','EAM','Calculer sans calculatrice','Automatismes',['premiere-02'],1,8,
'Fractions, puissances et développement.',
R`Pour chaque question, choisir une seule réponse parmi A, B, C et D.`,[
R`\(\frac34-\frac16\) vaut : A. \(\frac12\) ; B. \(\frac7{12}\) ; C. \(\frac23\) ; D. \(\frac58\).`,
R`\(\frac{2^5\times2^{-2}}{2}\) vaut : A. 2 ; B. 4 ; C. 8 ; D. 16.`,
R`\((x-3)^2-(x-3)(x+3)\) vaut : A. \(-6x+18\) ; B. \(-6x\) ; C. \(18\) ; D. \(2x^2-18\).`],
[R`Mettre les fractions au même dénominateur et factoriser par \(x-3\) à la dernière question.`],
[R`B : \(\frac9{12}-\frac2{12}=\frac7{12}\).`,R`B : \(2^{5-2-1}=2^2=4\).`,R`A : \((x-3)((x-3)-(x+3))=-6(x-3)=-6x+18\).`]),
problem('eam-02','EAM','Deux évolutions successives','Pourcentages',['premiere-01'],1,8,
'Coefficients multiplicateurs et pourcentages.',
R`Un abonnement annuel coûte 250 unités monétaires avant une hausse de 12 %, suivie d’une remise de 15 %.`,[
R`Calculer le prix après la hausse, puis après la remise.`,
R`Déterminer le taux global d’évolution.`,
R`Après cette remise, quel pourcentage d’augmentation permettrait de revenir exactement au prix initial ? Donner la valeur exacte puis arrondir à 0,1 point de pourcentage.`],
[R`Multiplier les coefficients d’évolution. Pour le retour, chercher le coefficient qui annule l’évolution globale.`],
[R`Après hausse : \(250\times1{,}12=280\). Après remise : \(280\times0{,}85=238\).`,R`Le coefficient global vaut \(1{,}12\times0{,}85=0{,}952\), soit une baisse de \(4{,}8\,\%\).`,R`Le taux de retour est \(\frac{250}{238}-1=\frac6{119}\), soit \(\frac{600}{119}\,\%\approx5{,}0\,\%\). Additionner les deux taux initiaux aurait donné un résultat erroné.`]),
problem('eam-03','EAM','Des racines au signe','Second degré',['premiere-02'],1,10,
'Factorisation et signe d’un produit.',R`On pose \(P(x)=2x^2-5x-3\).`,[
R`Vérifier que \(P(x)=(2x+1)(x-3)\).`,R`Résoudre \(P(x)=0\).`,R`Résoudre \(P(x)\leq0\), puis \(P(x)>0\).`],
[R`Repérer les deux changements de signe des facteurs, puis les ranger sur un axe.`],
[R`Le développement donne \(2x^2-6x+x-3=2x^2-5x-3\).`,R`Les racines sont \(-\frac12\) et 3.`,R`Le produit est positif à l’extérieur des racines et négatif entre elles. Ainsi \(P(x)\leq0\) pour \(x\in[-\frac12;3]\) et \(P(x)>0\) pour \(x\in]-\infty;-\frac12[\cup]3;+\infty[\).`]),
problem('eam-04','EAM','Un angle à partir de coordonnées','Produit scalaire',['premiere-03'],2,12,
'Coordonnées de vecteurs, norme et cosinus.',R`Dans un repère orthonormé, on considère \(A(1;2)\), \(B(5;2)\) et \(C(4;5)\).`,[
R`Calculer \(\overrightarrow{AB}\), \(\overrightarrow{AC}\) et leur produit scalaire.`,R`Calculer les longueurs AB et AC.`,R`Déterminer la mesure exacte en radians de \(\widehat{BAC}\).`],
[R`Relier le produit scalaire aux deux longueurs et au cosinus de l’angle.`],
[R`\(\overrightarrow{AB}=(4;0)\), \(\overrightarrow{AC}=(3;3)\) et \(\overrightarrow{AB}\cdot\overrightarrow{AC}=12\).`,R`\(AB=4\) et \(AC=\sqrt{18}=3\sqrt2\).`,R`\(\cos\widehat{BAC}=\frac{12}{4\times3\sqrt2}=\frac{\sqrt2}{2}\). L’angle d’un triangle appartient à \([0;\pi]\), donc \(\widehat{BAC}=\frac\pi4\).`]),
problem('eam-05','EAM','Renouveler un stock','Suites',['premiere-01'],2,15,
'Suites géométriques et lecture d’une boucle.',R`Au début du mois 0, une réserve contient 900 pièces. Chaque mois, 20 % des pièces sont utilisées et aucune n’est ajoutée. On modélise le stock par des nombres réels \(s_n\).`,[
R`Donner \(s_0\), une relation de récurrence et l’expression de \(s_n\).`,R`Calculer \(s_3\).`,R`Écrire une fonction Python renvoyant le premier entier \(n\) tel que \(s_n<300\), puis déterminer sa valeur.`],
[R`Il reste 80 % du stock d’un mois au suivant. La boucle doit continuer tant que le stock est au moins égal à 300.`],
[R`\(s_0=900\), \(s_{n+1}=0{,}8s_n\), donc \(s_n=900(0{,}8)^n\).`,R`\(s_3=460{,}8\) dans ce modèle continu.`,R`<pre><code>def premier_mois():
    n, s = 0, 900
    while s >= 300:
        s = 0.8*s
        n = n+1
    return n</code></pre>\(s_4=368{,}64\) et \(s_5=294{,}912\). Le stock décroît, donc la fonction renvoie 5.`]),
problem('eam-06','EAM','Un coût moyen minimal','Dérivation',['premiere-04','premiere-06'],2,15,
'Dérivée de l’inverse, signe et tangente.',R`Pour \(x>0\), on définit \(c(x)=2x+\frac{18}{x}+7\).`,[
R`Calculer \(c'(x)\) et la mettre sous forme factorisée.`,R`Déterminer les variations de \(c\) et sa valeur minimale.`,R`Déterminer l’équation de la tangente au point d’abscisse 1.`],
[R`Le dénominateur \(x^2\) est positif. Une tangente en \(a\) a pour équation \(y=c(a)+c'(a)(x-a)\).`],
[R`\(c'(x)=2-\frac{18}{x^2}=\frac{2(x-3)(x+3)}{x^2}\).`,R`Sur \(]0;3]\), \(c\) décroît ; sur \([3;+\infty[\), elle croît. Son minimum vaut \(c(3)=19\).`,R`\(c(1)=27\), \(c'(1)=-16\), donc \(y=27-16(x-1)=-16x+43\).`]),
problem('eam-07','EAM','Deux sélections et un gain','Variables aléatoires',['premiere-05','premiere-08'],2,18,
'Arbre pondéré, indépendance et espérance.',R`Deux sélections indépendantes donnent chacune un symbole étoile avec probabilité \(\frac14\). Une partie coûte 2 jetons. Elle rapporte 8 jetons pour deux étoiles, 3 jetons pour exactement une étoile et aucun jeton sinon. On note \(G\) le gain net, récompense moins coût.`,[
R`Construire l’arbre des deux sélections.`,R`Déterminer la loi de \(G\).`,R`Calculer \(E(G)\). Le jeu est-il équitable ?`],
[R`Les récompenses et les gains nets diffèrent de 2. Pour une seule étoile, il y a deux chemins.`],
[R`À chacun des deux niveaux, les branches étoile et sans étoile portent \(\frac14\) et \(\frac34\). L’indépendance autorise les mêmes probabilités au deuxième niveau.`,R`\(P(G=6)=\frac1{16}\), \(P(G=1)=2\times\frac14\times\frac34=\frac6{16}\), \(P(G=-2)=\frac9{16}\).`,R`\(E(G)=\frac{6+6-18}{16}=-\frac38\) jeton par partie. Le jeu n’est pas équitable ; le gain net moyen est négatif.`]),
problem('eam-08','EAM','Un pic puis une décroissance','Exponentielle',['premiere-09','premiere-06'],2,15,
'Dérivation d’un produit et positivité de l’exponentielle.',R`On définit sur \(\mathbb R\) la fonction \(f(x)=(3x-6)e^{-x}+4\).`,[
R`Calculer et factoriser \(f'(x)\).`,R`Dresser les variations de \(f\).`,R`Donner les coordonnées exactes du point où la tangente est horizontale.`],
[R`Dériver chacun des deux facteurs du produit. Le signe de \(e^{-x}\) ne varie pas.`],
[R`\(f'(x)=3e^{-x}-(3x-6)e^{-x}=(9-3x)e^{-x}\).`,R`Comme \(e^{-x}>0\), \(f'\) est positive pour \(x<3\) et négative pour \(x>3\). La fonction croît sur \(]-\infty;3]\), puis décroît sur \([3;+\infty[\).`,R`\(f'(x)=0\) équivaut à \(x=3\). Le point est \((3;4+3e^{-3})\).`]),
problem('e3c-01','E3C','Deux plans de collecte','Suites',['premiere-01'],2,20,
'Suites arithmétiques et géométriques, algorithme.',R`Deux équipes collectent des données. À la semaine 0, l’équipe A en a 400 et l’équipe B en a 500. Chaque semaine, A augmente sa collection de 10 % et B ajoute 30 données. On note leurs tailles \(a_n\) et \(b_n\). Les tailles sont modélisées par des réels.`,[
R`Préciser la nature de chaque suite et donner \(a_n\), \(b_n\).`,R`Calculer les tailles à la semaine 3.`,R`Écrire une boucle Python qui s’arrête à la première semaine où A dépasse strictement B. Donner cette semaine.`],
[R`Mettre à jour les deux collections dans la même boucle, en poursuivant tant que \(a\leq b\).`],
[R`\(a_n=400(1{,}1)^n\) est géométrique ; \(b_n=500+30n\) est arithmétique.`,R`\(a_3=532{,}4\) et \(b_3=590\).`,R`<pre><code>a, b, n = 400, 500, 0
while a <= b:
    a = 1.1*a
    b = b+30
    n = n+1</code></pre>On obtient \(n=6\) : \(a_5=644{,}204<650=b_5\) et \(a_6=708{,}6244>680=b_6\). De plus \((a_{n+1}-b_{n+1})-(a_n-b_n)=0{,}1a_n-30\geq10\), donc la différence est strictement croissante.`]),
problem('e3c-02','E3C','Une somme qui grandit','Suites',['premiere-01'],2,18,
'Somme géométrique et boucle avec accumulateur.',R`Un atelier réalise 3 motifs au jour 1, puis trois fois plus chaque jour suivant. On note \(u_n\) le nombre réalisé au jour \(n\geq1\) et \(S_n\) le total des jours 1 à \(n\).`,[
R`Donner \(u_n\) puis \(S_n\).`,R`Calculer \(S_5\).`,R`Écrire un algorithme donnant le premier jour où le total atteint au moins 1 000 motifs ; déterminer ce jour.`],
[R`La somme commence par 3, pas par 1. Un accumulateur doit compter le jour qui vient d’être réalisé.`],
[R`\(u_n=3^n\) et \(S_n=3\frac{3^n-1}{3-1}=\frac{3^{n+1}-3}{2}\).`,R`\(S_5=363\).`,R`<pre><code>n, u, total = 0, 1, 0
while total < 1000:
    u = 3*u
    total = total+u
    n = n+1</code></pre>\(S_6=1092\) et \(S_5=363\), donc le premier jour est 6, les sommes étant strictement croissantes.`]),
problem('e3c-03','E3C','Retrouver une origine','Probabilités conditionnelles',['premiere-05'],2,18,
'Arbre, probabilités totales et conditionnement.',R`Une plateforme propose 60 % de ses fichiers au format A et 40 % au format B. Un contrôle rejette 5 % des fichiers A et 15 % des fichiers B. On choisit un fichier au hasard. On note \(D\) l’événement « fichier rejeté ».`,[
R`Construire un arbre pondéré.`,R`Calculer \(P(A\cap D)\) et \(P(D)\).`,R`Sachant que le fichier est rejeté, déterminer la probabilité qu’il soit au format B.`,R`Les événements A et D sont-ils indépendants ?`],
[R`Pour inverser le conditionnement, diviser la probabilité du chemin par celle de l’événement connu.`],
[R`Premier niveau : \(0{,}6\) et \(0{,}4\). Sous A : \(0{,}05\) pour D, \(0{,}95\) sinon. Sous B : \(0{,}15\) et \(0{,}85\).`,R`\(P(A\cap D)=0{,}6\times0{,}05=0{,}03\). Par probabilités totales, \(P(D)=0{,}03+0{,}4\times0{,}15=0{,}09\).`,R`\(P(B\mid D)=\frac{0{,}06}{0{,}09}=\frac23\).`,R`Non : \(P(D\mid A)=0{,}05\ne0{,}09=P(D)\).`]),
problem('e3c-04','E3C','Tirages sans remise','Probabilités conditionnelles',['premiere-05'],2,18,
'Conditionnement et tirages successifs.',R`Un sac contient 5 badges bleus, dont 2 portent une étoile, et 7 badges orange, dont 1 porte une étoile. Chaque badge a la même probabilité d’être tiré.`,[
R`Calculer la probabilité de tirer un badge étoilé.`,R`Sachant que le badge tiré est étoilé, calculer la probabilité qu’il soit bleu.`,R`On remet le badge dans le sac, puis on tire successivement deux badges sans remise. Calculer la probabilité que les deux soient étoilés.`,R`Comparer avec deux tirages avec remise.`],
[R`Après un premier badge étoilé, il reste 2 badges étoilés parmi 11. Avec remise, la composition reste identique.`],
[R`Il y a 3 badges étoilés sur 12, soit \(\frac14\).`,R`Parmi les 3 badges étoilés, 2 sont bleus, donc \(\frac23\).`,R`Sans remise : \(\frac3{12}\times\frac2{11}=\frac1{22}\).`,R`Avec remise : \((\frac14)^2=\frac1{16}\). Cette probabilité est plus grande que \(\frac1{22}\) ; les tirages sans remise ne sont pas indépendants.`]),
problem('e3c-05','E3C','Une étude complète de polynôme','Dérivation',['premiere-04','premiere-06','premiere-02'],3,25,
'Dérivation, discriminant, signe et tangente.',R`On considère \(f(x)=x^3-3x^2-9x+11\) sur \(\mathbb R\).`,[
R`Factoriser \(f'(x)\) et dresser les variations de \(f\).`,R`Déterminer la tangente à la courbe au point d’abscisse 0.`,R`Vérifier que 1 est une racine et factoriser \(f(x)\) par \(x-1\).`,R`Déterminer toutes les racines puis le signe de \(f\).`],
[R`La dérivée possède deux racines entières. Après division par \(x-1\), il reste un trinôme.`],
[R`\(f'(x)=3(x+1)(x-3)\). La fonction croît sur \(]-\infty;-1]\), décroît sur \([-1;3]\), puis croît sur \([3;+\infty[\). Les valeurs aux deux extremums sont \(f(-1)=16\) et \(f(3)=-16\).`,R`\(f(0)=11\) et \(f'(0)=-9\), donc \(y=-9x+11\).`,R`\(f(1)=0\) et \(f(x)=(x-1)(x^2-2x-11)\).`,R`Les racines ordonnées sont \(1-2\sqrt3\), 1, \(1+2\sqrt3\). Chaque facteur linéaire change de signe à sa racine : en partant de \(-\infty\), les signes sont successivement \(-,+,-,+\), avec zéro aux trois racines.`]),
problem('e3c-06','E3C','Projection et cercle','Géométrie repérée',['premiere-07','premiere-03'],3,25,
'Vecteur normal, projection orthogonale et cercle.',R`Dans un repère orthonormé, \(A(0;1)\), \(B(4;3)\) et \(C(1;4)\).`,[
R`Établir une équation cartésienne de (AB).`,R`Déterminer la droite passant par C et perpendiculaire à (AB), puis le projeté orthogonal H de C sur (AB).`,R`Calculer CH.`,R`Déterminer une équation du cercle de diamètre [AB]. Le point C appartient-il à ce cercle ?`],
[R`Un vecteur directeur de (AB) est \((4;2)\). Le centre du cercle est le milieu de [AB].`],
[R`\(\overrightarrow{AB}=(4;2)\), donc un vecteur normal est \((1;-2)\). Ainsi (AB) : \(x-2y+2=0\).`,R`La perpendiculaire a pour équation \(2x+y-6=0\). En résolvant avec \(x-2y+2=0\), on trouve \(H(2;2)\).`,R`\(CH=\sqrt{(2-1)^2+(2-4)^2}=\sqrt5\).`,R`Le centre est \(M(2;2)\), \(AB=\sqrt{20}\) et le rayon est \(\sqrt5\). Le cercle a pour équation \((x-2)^2+(y-2)^2=5\). Pour C, le membre de gauche vaut 5 : C appartient au cercle.`]),
problem('e3c-07','E3C','Angles associés et équation','Trigonométrie',['premiere-10'],2,15,
'Cercle trigonométrique et valeurs remarquables.',R`Tous les angles sont exprimés en radians.`,[
R`Donner les valeurs exactes de \(\cos(\frac{7\pi}6)\) et \(\sin(\frac{7\pi}6)\).`,R`Résoudre \(\cos x=-\frac{\sqrt3}{2}\) dans \([0;2\pi[\).`,R`Résoudre \(\sin(2x)=\frac12\) dans \([0;\pi]\).`],
[R`Utiliser les symétries du cercle. Pour la dernière question, poser \(t=2x\) et transformer aussi l’intervalle.`],
[R`\(\frac{7\pi}6=\pi+\frac\pi6\), donc le cosinus vaut \(-\frac{\sqrt3}{2}\) et le sinus \(-\frac12\).`,R`Les solutions sont \(\frac{5\pi}6\) et \(\frac{7\pi}6\).`,R`Pour \(t\in[0;2\pi]\), \(\sin t=\frac12\) donne \(t=\frac\pi6\) ou \(\frac{5\pi}6\). Donc \(x=\frac\pi{12}\) ou \(\frac{5\pi}{12}\).`]),
problem('e3c-08','E3C','Dériver et choisir une tangente','Exponentielle',['premiere-09','premiere-04'],2,20,
'Dérivée de l’exponentielle, produit et tangente.',R`On pose \(g(x)=(2x+1)e^{-x}\) pour \(x\in\mathbb R\).`,[
R`Déterminer \(g'(x)\).`,R`Étudier les variations de \(g\) et donner son maximum exact.`,R`Déterminer l’équation de la tangente en 0.`,R`Résoudre \(g(x)=0\) et donner le signe de \(g\).`],
[R`L’exponentielle est toujours strictement positive : elle ne crée aucune racine.`],
[R`\(g'(x)=2e^{-x}-(2x+1)e^{-x}=(1-2x)e^{-x}\).`,R`La fonction croît jusqu’à \(\frac12\), puis décroît. Son maximum vaut \(g(\frac12)=2e^{-1/2}\).`,R`\(g(0)=1\) et \(g'(0)=1\) : la tangente est \(y=x+1\).`,R`L’unique racine est \(-\frac12\). Le signe est négatif avant cette racine et positif après.`]),
problem('bac-01','Bac','Un nombre de réussites','Loi binomiale',['terminale-07'],2,25,
'Bernoulli, loi binomiale et complémentaire.',R`Un test de transmission réussit avec probabilité 0,8. On effectue 10 tests indépendants et on note X le nombre de réussites.`,[
R`Justifier la loi de X et donner son espérance.`,R`Calculer \(P(X=8)\) et \(P(X\geq9)\), arrondies à \(10^{-4}\).`,R`On effectue maintenant n tests indépendants. Quel est le plus petit entier n pour que la probabilité d’au moins une réussite soit supérieure ou égale à 0,999 ?`],
[R`Pour la dernière question, calculer la probabilité de zéro réussite. Vérifier le seuil et l’entier précédent.`],
[R`Les tests répètent de façon indépendante la même épreuve de Bernoulli de paramètre \(0{,}8\). Ainsi \(X\sim\mathcal B(10;0{,}8)\) et \(E(X)=8\).`,R`\(P(X=8)=\binom{10}{8}(0{,}8)^8(0{,}2)^2\approx0{,}3020\). \(P(X\geq9)=10(0{,}8)^9(0{,}2)+(0{,}8)^{10}\approx0{,}3758\).`,R`Il faut \((0{,}2)^n\leq0{,}001\), donc \(n\geq\frac{\ln(0{,}001)}{\ln(0{,}2)}\). Le plus petit entier est 5 : pour 4, la probabilité vaut \(0{,}9984\), et pour 5, elle vaut \(0{,}99968\).`]),
problem('bac-02','Bac','Contrôler puis échantillonner','Probabilités conditionnelles',['terminale-07','terminale-12'],3,30,
'Probabilités totales, binomiale, espérance et variance.',R`Un atelier assemble 70 % de ses capteurs sur la ligne A, où 2 % sont défectueux, et 30 % sur la ligne B, où 6 % sont défectueux. On choisit un capteur au hasard et on note D le défaut.`,[
R`Calculer \(P(D)\) puis \(P(B\mid D)\).`,R`On prélève 20 capteurs de façon indépendante, avec la même probabilité de défaut. Justifier la loi du nombre Y de capteurs défectueux.`,R`Calculer \(P(Y\geq1)\) à \(10^{-4}\) près.`,R`Donner l’espérance et la variance de \(F=Y/20\).`],
[R`Un capteur défectueux peut provenir de deux lignes. Pour la fréquence, la variance est divisée par le carré de 20.`],
[R`\(P(D)=0{,}7\times0{,}02+0{,}3\times0{,}06=0{,}032\). Ainsi \(P(B\mid D)=\frac{0{,}018}{0{,}032}=\frac9{16}\).`,R`Les 20 indicatrices de défaut sont indépendantes, de même paramètre \(0{,}032\), donc \(Y\sim\mathcal B(20;0{,}032)\).`,R`\(P(Y\geq1)=1-(0{,}968)^{20}\approx0{,}4782\).`,R`\(E(F)=\frac{20\times0{,}032}{20}=0{,}032\). \(V(F)=\frac{20\times0{,}032\times0{,}968}{20^2}=0{,}0015488\).`]),
problem('bac-03','Bac','Transformer une suite récurrente','Suites et récurrence',['terminale-01','terminale-03'],3,30,
'Récurrence, suite géométrique, limite et logarithme.',R`On définit \(u_0=3\) et \(u_{n+1}=\frac{3u_n+4}{u_n+3}\).`,[
R`Montrer par récurrence que \(u_n>2\) pour tout \(n\), et que la suite est bien définie.`,R`On pose \(v_n=\frac{u_n-2}{u_n+2}\). Montrer que \(v_{n+1}=\frac15v_n\), puis exprimer \(v_n\).`,R`En déduire \(u_n=2\frac{1+v_n}{1-v_n}\), le sens de variation et la limite de \(u_n\).`,R`Déterminer le premier n pour lequel \(u_n-2\leq0{,}001\).`],
[R`Calculer séparément \(u_{n+1}-2\) et \(u_{n+1}+2\). Pour le seuil, isoler \(v_n\).`],
[R`Au rang 0, \(u_0=3>2\). Si \(u_n>2\), le dénominateur est positif et \(u_{n+1}-2=\frac{u_n-2}{u_n+3}>0\). Cela prouve à la fois l’existence et l’inégalité au rang suivant.`,R`\(u_{n+1}+2=\frac{5(u_n+2)}{u_n+3}\), donc \(v_{n+1}=v_n/5\). Comme \(v_0=1/5\), \(v_n=5^{-(n+1)}\).`,R`L’égalité \(v_n(u_n+2)=u_n-2\) donne l’expression annoncée. De plus \(u_{n+1}-u_n=\frac{4-u_n^2}{u_n+3}<0\). Puis \(v_n\to0\) entraîne \(u_n\to2\).`,R`\(u_n-2=\frac{4v_n}{1-v_n}\leq\frac1{1000}\) équivaut à \(5^{n+1}\geq4001\). Or \(5^5=3125<4001\leq15625=5^6\). Le premier rang est 5.`]),
problem('bac-04','Bac','Exponentielle, maximum et aire','Analyse et intégration',['terminale-06','terminale-11','terminale-04'],3,30,
'Dérivation, croissance comparée et primitive.',R`Pour \(x\geq0\), on pose \(f(x)=(x^2+2x)e^{-x}\).`,[
R`Déterminer \(f'(x)\) puis les variations de \(f\) sur \([0;+\infty[\).`,R`Calculer la limite en \(+\infty\) et la valeur exacte du maximum.`,R`Vérifier que \(F(x)=-(x+2)^2e^{-x}\) est une primitive.`,R`Calculer l’aire sous la courbe entre 0 et 2, puis la limite de l’aire entre 0 et a lorsque \(a\to+\infty\).`],
[R`L’exponentielle est positive. Pour la limite, les puissances de x sont dominées par \(e^x\).`],
[R`\(f'(x)=(2-x^2)e^{-x}\). Elle est positive sur \([0;\sqrt2[\), nulle en \(\sqrt2\) et négative ensuite.`,R`\(\lim f(x)=0\). Le maximum vaut \(f(\sqrt2)=(2+2\sqrt2)e^{-\sqrt2}\).`,R`\(F'(x)=(-2(x+2)+(x+2)^2)e^{-x}=(x^2+2x)e^{-x}\).`,R`Sur \([0;+\infty[\), \(f\geq0\), donc l’aire vaut l’intégrale : \(\int_0^2f(x)\,dx=4-16e^{-2}\). Jusqu’à a, elle vaut \(4-(a+2)^2e^{-a}\), dont la limite est 4 unités d’aire.`]),
problem('bac-05','Bac','Un modèle de refroidissement','Équations différentielles',['terminale-10','terminale-11'],2,25,
'Équation différentielle linéaire, logarithme, intégration et valeur moyenne.',R`La température \(T(t)\), en degrés Celsius, d’un objet au bout de t minutes vérifie \(T'(t)=-0{,}2(T(t)-18)\), avec \(T(0)=78\). On étudie \(t\geq0\).`,[
R`En posant \(U=T-18\), résoudre le problème et donner \(T(t)\).`,R`Étudier les variations et la limite de T.`,R`Déterminer l’instant exact où la température atteint 30 °C ; en donner une valeur approchée au dixième de minute.`,R`Déterminer la température moyenne sur les 5 premières minutes.`],
[R`La transformation retire la constante. La température moyenne est \(\frac15\int_0^5T(t)\,dt\).`],
[R`\(U'=-0{,}2U\), donc \(U(t)=Ce^{-t/5}\). La condition initiale donne \(C=60\), d’où \(T(t)=18+60e^{-t/5}\).`,R`\(T'(t)=-12e^{-t/5}<0\), donc T décroît strictement vers 18 °C.`,R`\(e^{-t/5}=1/5\) donne \(t=5\ln5\approx8{,}0\) minutes. La stricte décroissance garantit l’unicité.`,R`Une primitive est \(18t-300e^{-t/5}\). La moyenne vaut \(18+60(1-e^{-1})\) °C.`]),
problem('bac-06','Bac','Deux intégrales liées','Intégration par parties',['terminale-11','terminale-14'],3,30,
'Intégration par parties, trigonométrie et système linéaire.',R`On pose \(I=\int_0^{\pi/2}e^{-x}\cos x\,dx\) et \(J=\int_0^{\pi/2}e^{-x}\sin x\,dx\).`,[
R`Par intégration par parties, établir \(I=1-J\).`,R`Par une seconde intégration par parties, établir \(J=I-e^{-\pi/2}\).`,R`En déduire I et J.`,R`Calculer la valeur moyenne de \(e^{-x}(\cos x+\sin x)\) sur \([0;\pi/2]\).`],
[R`Prendre pour primitive de \(e^{-x}\) la fonction \(-e^{-x}\), en conservant le signe devant l’intégrale restante.`],
[R`Avec \(u=\cos x\), \(v'=e^{-x}\), on obtient \(I=[-e^{-x}\cos x]_0^{\pi/2}-\int_0^{\pi/2}e^{-x}\sin x\,dx=1-J\).`,R`Avec \(u=\sin x\), \(v'=e^{-x}\), on obtient \(J=[-e^{-x}\sin x]_0^{\pi/2}+\int_0^{\pi/2}e^{-x}\cos x\,dx=I-e^{-\pi/2}\).`,R`En résolvant les deux égalités : \(I=\frac{1+e^{-\pi/2}}2\) et \(J=\frac{1-e^{-\pi/2}}2\).`,R`La moyenne vaut \(\frac{2}{\pi}(I+J)=\frac2\pi\).`]),
problem('bac-07','Bac','Vrai ou faux dans l’espace','Géométrie de l’espace',['terminale-02','terminale-09','terminale-13'],3,30,
'Produit scalaire, plan, droite paramétrée et distance.',R`Dans un repère orthonormé de l’espace, on donne \(A(1;0;2)\), \(B(3;1;0)\), le plan \(\mathcal P:x+2y-2z+3=0\) et la droite \(d:(x;y;z)=(1+t;2t;2-2t)\). Pour chaque affirmation, décider si elle est vraie ou fausse et justifier.`,[
R`Le point A appartient à \(\mathcal P\).`,R`La droite (AB) est parallèle au plan \(\mathcal P\).`,R`La droite d est perpendiculaire à \(\mathcal P\) et le coupe en A.`,R`La distance du point B à \(\mathcal P\) vaut \(8/3\).`],
[R`Un vecteur normal au plan est \((1;2;-2)\). Une direction parallèle au plan a un produit scalaire nul avec ce vecteur.`],
[R`Vrai : \(1+2\times0-2\times2+3=0\).`,R`Faux : \(\overrightarrow{AB}=(2;1;-2)\) et \((2;1;-2)\cdot(1;2;-2)=8\ne0\).`,R`Vrai : le vecteur directeur de d est \((1;2;-2)\), normal au plan. Pour \(t=0\), on obtient A. La substitution dans l’équation du plan donne \(9t=0\), donc l’intersection est unique.`,R`Vrai : le projeté H de B appartient à la droite \(B+s(1;2;-2)\). L’équation du plan donne \(8+9s=0\), d’où \(H=B-\frac89(1;2;-2)=(\frac{19}9;-\frac79;\frac{16}9)\). Ainsi \(BH=\frac89\sqrt{1+4+4}=\frac83\).`]),
problem('bac-08','Bac','Logarithme, convexité et encadrement','Logarithme',['terminale-08','terminale-06'],3,30,
'Dérivation du logarithme, continuité et dichotomie.',R`Pour \(x>0\), on définit \(h(x)=x-2-\ln x\).`,[
R`Étudier les limites, les variations et la convexité de h.`,R`Montrer que \(h(x)=0\) a exactement deux solutions, l’une dans \(]0;1[\), l’autre dans \(]1;+\infty[\).`,R`Encadrer la plus grande solution \(\beta\) entre deux centièmes consécutifs.`,R`Résoudre \(h(x)\leq0\) en fonction des deux solutions \(\alpha<\beta\).`],
[R`Le minimum est atteint en 1. Pour l’encadrement, calculer les signes aux centièmes, sur la branche croissante.`],
[R`\(h'(x)=1-1/x=(x-1)/x\) et \(h''(x)=1/x^2>0\). h décroît sur \(]0;1]\), croît sur \([1;+\infty[\), et est strictement convexe. Ses limites en \(0^+\) et en \(+\infty\) valent \(+\infty\), par croissance comparée pour la seconde.`,R`\(h(1)=-1\). La continuité, les limites et la stricte monotonie sur chaque branche donnent exactement une racine de chaque côté de 1.`,R`\(h(3{,}14)\approx-0{,}00422<0\) et \(h(3{,}15)\approx0{,}00260>0\). Donc \(3{,}14<\beta<3{,}15\).`,R`Le signe est positif avant \(\alpha\), négatif entre les deux racines, positif après \(\beta\). La solution est \([\alpha;\beta]\).`])
];
