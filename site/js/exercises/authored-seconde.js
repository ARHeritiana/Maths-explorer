// Fixed Seconde exercises for the online bank and the sheets: proofs, "vrai ou faux justifié", guided reasoning and
// remediation, where random numbers would add nothing. Same contract as authored.js: parts [{w, q, hint?, a}], ok()
// recomputes every number quoted in a correction. Chapter ids: content/data/manifest.json.
import { M } from './engine.js';

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const C = 'seconde';

export const authoredSeconde = [
  // ================= 01 Arithmétique =================
  { id: 'a-sec-parite', cls: C, chapters: ['seconde-01'], domain: 'nombres', level: 1, minutes: 15, title: 'Pair, impair : premières démonstrations',
    intro: `On rappelle qu’un entier ${M('n')} est pair s’il s’écrit ${M('n=2k')} et impair s’il s’écrit ${M('n=2k+1')}, avec ${M('k')} entier.`,
    parts: [
      { w: 1, q: 'Écrire les entiers 38, 51 et -7 sous la forme 2k ou 2k + 1.', a: `${M('38=2\\times 19')}, ${M('51=2\\times 25+1')} et ${M('-7=2\\times(-4)+1')}.` },
      { w: 2, q: 'Démontrer que la somme de deux entiers impairs est paire.', hint: `Prendre deux entiers impairs ${M('2k+1')} et ${M('2\\ell+1')} avec deux lettres différentes : ils ne sont pas forcément égaux.`, a: `Soit ${M('a=2k+1')} et ${M('b=2\\ell+1')}. Alors ${M('a+b=2k+2\\ell+2=2(k+\\ell+1)')}, et ${M('k+\\ell+1')} est un entier : ${M('a+b')} est pair.` },
      { w: 2, q: 'Démontrer que le produit de deux entiers impairs est impair.', a: `${M('(2k+1)(2\\ell+1)=4k\\ell+2k+2\\ell+1=2(2k\\ell+k+\\ell)+1')}, de la forme ${M('2m+1')} avec ${M('m=2k\\ell+k+\\ell')} entier : le produit est impair.` },
      { w: 2, q: 'En déduire que le carré d’un entier impair est impair. La réciproque est-elle vraie ?', hint: 'Pour la réciproque, raisonner sur un entier pair et regarder son carré.', a: `Un carré ${M('n^{2}=n\\times n')} est un produit de deux impairs si ${M('n')} est impair : il est impair. Réciproque : si ${M('n^{2}')} est impair, alors ${M('n')} est impair. Elle est vraie : si ${M('n=2k')} était pair, ${M('n^{2}=4k^{2}=2(2k^{2})')} serait pair.` },
    ],
    ok: () => 38 === 2 * 19 && 51 === 2 * 25 + 1 && -7 === 2 * -4 + 1 && [1, 3, 5, 7, 9].every((a) => [1, 3, 11].every((b) => (a + b) % 2 === 0 && (a * b) % 2 === 1)) },
  { id: 'a-sec-consecutifs', cls: C, chapters: ['seconde-01', 'seconde-13'], domain: 'nombres', level: 3, minutes: 20, title: 'Sommes et produits d’entiers consécutifs',
    intro: `Dans tout l’exercice, ${M('n')} désigne un entier.`,
    parts: [
      { w: 2, q: `Démontrer que ${M('n(n+1)')} est toujours pair.`, hint: `Distinguer deux cas : ${M('n')} pair, ${M('n')} impair.`, a: `Si ${M('n=2k')}, ${M('n(n+1)=2k(2k+1)')} est pair. Si ${M('n=2k+1')}, ${M('n+1=2(k+1)')} et ${M('n(n+1)=2(2k+1)(k+1)')} est pair. Dans tous les cas, le produit de deux entiers consécutifs est pair.` },
      { w: 2, q: 'Démontrer que la somme de trois entiers consécutifs est un multiple de 3.', a: `${M('(n-1)+n+(n+1)=3n')} : c’est un multiple de ${M('3')}.` },
      { w: 2, q: 'La somme de quatre entiers consécutifs est-elle toujours un multiple de 4 ? Justifier.', hint: 'Calculer la somme de n, n + 1, n + 2, n + 3, puis tester un exemple.', a: `Non : ${M('n+(n+1)+(n+2)+(n+3)=4n+6=4(n+1)+2')}. Par exemple ${M('1+2+3+4=10')} n’est pas un multiple de ${M('4')}. C’est un multiple de ${M('2')}, pas de ${M('4')}.` },
      { w: 2, q: `Démontrer que ${M('n^{3}-n')} est un multiple de 6.`, hint: `Factoriser : ${M('n^{3}-n=(n-1)n(n+1)')}.`, a: `${M('n^{3}-n=n(n^{2}-1)=(n-1)n(n+1)')}. Parmi deux entiers consécutifs, l’un est pair, donc ce produit est pair. Parmi trois entiers consécutifs, l’un est un multiple de ${M('3')}. Le produit est donc un multiple de ${M('2')} et de ${M('3')}, deux nombres premiers distincts : c’est un multiple de ${M('6')}.` },
    ],
    ok: () => [...Array(40).keys()].map((k) => k - 20).every((n) => ((n * (n + 1)) % 2 === 0) && ((3 * n) % 3 === 0) && ((n ** 3 - n) % 6 === 0) && 4 * n + 6 === 4 * (n + 1) + 2) && (1 + 2 + 3 + 4) % 4 !== 0 },

  // ================= 02 Vecteurs =================
  { id: 'a-sec-demo-vecteurs', cls: C, chapters: ['seconde-02'], domain: 'geometrie', level: 3, minutes: 25, title: 'Démontrer avec la relation de Chasles',
    intro: `${M('ABC')} est un triangle et ${M('I')} est le milieu de ${M('[BC]')}. On ne travaille pas dans un repère.`,
    parts: [
      { w: 2, q: `Démontrer que ${M('\\overrightarrow{AB}+\\overrightarrow{AC}=2\\overrightarrow{AI}')}.`, hint: `Décomposer ${M('\\overrightarrow{AB}')} et ${M('\\overrightarrow{AC}')} en passant par ${M('I')}, puis utiliser ${M('\\overrightarrow{IB}+\\overrightarrow{IC}=\\vec{0}')}.`, a: `${M('\\overrightarrow{AB}+\\overrightarrow{AC}=\\overrightarrow{AI}+\\overrightarrow{IB}+\\overrightarrow{AI}+\\overrightarrow{IC}=2\\overrightarrow{AI}+(\\overrightarrow{IB}+\\overrightarrow{IC})')}, et ${M('\\overrightarrow{IB}+\\overrightarrow{IC}=\\vec{0}')} car ${M('I')} est le milieu de ${M('[BC]')}.` },
      { w: 2, q: `On définit le point ${M('D')} par ${M('\\overrightarrow{AD}=\\overrightarrow{AB}+\\overrightarrow{AC}')}. Montrer que ${M('I')} est le milieu de ${M('[AD]')}. Quelle est la nature de ${M('ABDC')} ?`, a: `D’après 1, ${M('\\overrightarrow{AD}=2\\overrightarrow{AI}')}, donc ${M('\\overrightarrow{AI}=\\dfrac{1}{2}\\overrightarrow{AD}')} : ${M('I')} est le milieu de ${M('[AD]')}. Les diagonales ${M('[AD]')} et ${M('[BC]')} ont le même milieu ${M('I')} : ${M('ABDC')} est un parallélogramme.` },
      { w: 3, q: `Soit ${M('G')} le point tel que ${M('\\overrightarrow{GA}+\\overrightarrow{GB}+\\overrightarrow{GC}=\\vec{0}')}. Montrer que ${M('\\overrightarrow{AG}=\\dfrac{2}{3}\\overrightarrow{AI}')}.`, hint: `Introduire ${M('A')} dans ${M('\\overrightarrow{GB}')} et ${M('\\overrightarrow{GC}')} : ${M('\\overrightarrow{GB}=\\overrightarrow{GA}+\\overrightarrow{AB}')}.`, a: `${M('\\overrightarrow{GA}+\\overrightarrow{GA}+\\overrightarrow{AB}+\\overrightarrow{GA}+\\overrightarrow{AC}=\\vec{0}')}, soit ${M('3\\overrightarrow{GA}+2\\overrightarrow{AI}=\\vec{0}')}, d’où ${M('3\\overrightarrow{AG}=2\\overrightarrow{AI}')} et ${M('\\overrightarrow{AG}=\\dfrac{2}{3}\\overrightarrow{AI}')}.` },
      { w: 1, q: `Vérifier ce résultat avec ${M('A(0\\,;\\,0)')}, ${M('B(6\\,;\\,0)')} et ${M('C(0\\,;\\,9)')}.`, a: `${M('I(3\\,;\\,4{,}5)')} et ${M('G')} vérifie ${M('x_G=\\dfrac{0+6+0}{3}=2')}, ${M('y_G=\\dfrac{0+0+9}{3}=3')}. Or ${M('\\dfrac{2}{3}\\times 3=2')} et ${M('\\dfrac{2}{3}\\times 4{,}5=3')} : on a bien ${M('\\overrightarrow{AG}=\\dfrac{2}{3}\\overrightarrow{AI}')}.` },
    ],
    ok: () => { const A = [0, 0], B = [6, 0], Cc = [0, 9], I = [3, 4.5], G = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3]; return G[0] === 2 && G[1] === 3 && near((2 / 3) * I[0], G[0]) && near((2 / 3) * I[1], G[1]) && [0, 1].every((k) => near(A[k] - G[k] + B[k] - G[k] + Cc[k] - G[k], 0)); } },

  // ================= 03 Droites =================
  { id: 'a-sec-lire-equation', cls: C, chapters: ['seconde-03'], domain: 'geometrie', level: 1, minutes: 12, title: 'Tout lire sur une équation de droite',
    intro: `Dans un repère, on considère la droite ${M('d')} d’équation ${M('2x-3y+6=0')}.`,
    parts: [
      { w: 1, q: `Les points ${M('A(3\\,;\\,4)')} et ${M('B(1\\,;\\,2)')} appartiennent-ils à ${M('d')} ?`, a: `${M('2\\times 3-3\\times 4+6=0')} : ${M('A\\in d')}. ${M('2\\times 1-3\\times 2+6=2\\neq 0')} : ${M('B\\notin d')}.` },
      { w: 1, q: `Donner un vecteur directeur de ${M('d')}.`, hint: `Une droite d’équation ${M('ax+by+c=0')} est dirigée par ${M('\\vec{u}(-b\\,;\\,a)')}.`, a: `${M('\\vec{u}(3\\,;\\,2)')}, car ${M('a=2')} et ${M('b=-3')}.` },
      { w: 2, q: `Déterminer l’équation réduite de ${M('d')}, sa pente et son ordonnée à l’origine.`, a: `${M('-3y=-2x-6\\iff y=\\dfrac{2}{3}x+2')} : pente ${M('\\dfrac{2}{3}')}, ordonnée à l’origine ${M('2')}.` },
      { w: 1, q: `Déterminer les points d’intersection de ${M('d')} avec les axes.`, a: `Pour ${M('x=0')} : ${M('y=2')}, point ${M('(0\\,;\\,2)')}. Pour ${M('y=0')} : ${M('2x+6=0')}, ${M('x=-3')}, point ${M('(-3\\,;\\,0)')}.` },
    ],
    ok: () => { const d = (x, y) => 2 * x - 3 * y + 6; return d(3, 4) === 0 && d(1, 2) === 2 && 2 * 3 + -3 * 2 === 0 && near((2 / 3) * 3 + 2, 4) && d(0, 2) === 0 && d(-3, 0) === 0; } },
  { id: 'a-sec-droites-parametre', cls: C, chapters: ['seconde-03'], domain: 'geometrie', level: 3, minutes: 20, title: 'Une famille de droites',
    intro: `Pour tout réel ${M('m')}, on note ${M('d_m')} la droite d’équation ${M('(m-1)x+2y-4=0')}.`,
    parts: [
      { w: 1, q: `Montrer que, quel que soit ${M('m')}, la droite ${M('d_m')} passe par le point ${M('K(0\\,;\\,2)')}.`, a: `${M('(m-1)\\times 0+2\\times 2-4=0')} pour tout ${M('m')}.` },
      { w: 2, q: `Pour quelle valeur de ${M('m')} la droite ${M('d_m')} passe-t-elle par ${M('A(2\\,;\\,5)')} ?`, a: `${M('2(m-1)+10-4=0\\iff 2m+4=0\\iff m=-2')}.` },
      { w: 2, q: `Pour quelle valeur de ${M('m')} la droite ${M('d_m')} est-elle parallèle à la droite ${M('\\Delta:\\ y=3x+1')} ?`, hint: `Écrire l’équation réduite de ${M('d_m')} et comparer les pentes.`, a: `${M('y=-\\dfrac{m-1}{2}x+2')} : pente ${M('\\dfrac{1-m}{2}')}. Elle vaut ${M('3')} pour ${M('m=-5')} ; comme ${M('2\\neq 1')}, les droites sont alors strictement parallèles.` },
      { w: 2, q: `Existe-t-il une valeur de ${M('m')} pour laquelle ${M('d_m')} est parallèle à l’axe des abscisses ? à l’axe des ordonnées ?`, a: `Parallèle à l’axe des abscisses quand la pente est nulle : ${M('m=1')}, et ${M('d_1:\\ y=2')}. Jamais parallèle à l’axe des ordonnées : le coefficient de ${M('y')} vaut ${M('2\\neq 0')} pour tout ${M('m')}.` },
    ],
    ok: () => { const d = (m, x, y) => (m - 1) * x + 2 * y - 4; return [-7, -2, 0, 1, 3].every((m) => d(m, 0, 2) === 0) && d(-2, 2, 5) === 0 && (1 - -5) / 2 === 3 && d(1, 5, 2) === 0; } },

  // ================= 04 Réels =================
  { id: 'a-sec-tiers-decimal', cls: C, chapters: ['seconde-04'], domain: 'nombres', level: 2, minutes: 15, title: 'Pourquoi 1/3 n’est pas un nombre décimal',
    intro: `Un nombre décimal s’écrit ${M('\\dfrac{a}{10^{n}}')} avec ${M('a')} entier et ${M('n')} entier naturel. On veut démontrer par l’absurde que ${M('\\dfrac{1}{3}')} n’est pas décimal.`,
    parts: [
      { w: 1, q: `Supposons que ${M('\\dfrac{1}{3}=\\dfrac{a}{10^{n}}')}. Montrer qu’alors ${M('10^{n}=3a')}.`, a: `On multiplie les deux membres par ${M('3\\times 10^{n}')} : ${M('10^{n}=3a')}.` },
      { w: 2, q: `Justifier que ${M('10^{n}')} n’est jamais un multiple de ${M('3')}, et conclure.`, hint: `Calculer la somme des chiffres de ${M('10^{n}')}, ou décomposer ${M('10^{n}')} en facteurs premiers.`, a: `${M('10^{n}=2^{n}\\times 5^{n}')} : par unicité de la décomposition, ${M('3')} n’y figure pas, donc ${M('10^{n}')} n’est pas un multiple de ${M('3')}. Or ${M('3a')} en est un : contradiction. Donc ${M('\\dfrac{1}{3}')} n’est pas décimal.` },
      { w: 2, q: `En adaptant le raisonnement, montrer que ${M('\\dfrac{2}{7}')} n’est pas décimal.`, a: `Si ${M('\\dfrac{2}{7}=\\dfrac{a}{10^{n}}')}, alors ${M('2\\times 10^{n}=7a')}. Mais ${M('2\\times 10^{n}=2^{n+1}\\times 5^{n}')} n’a pas le facteur ${M('7')} : contradiction.` },
      { w: 1, q: `Le nombre ${M('\\dfrac{7}{40}')} est-il décimal ?`, a: `Oui : ${M('\\dfrac{7}{40}=\\dfrac{7\\times 25}{40\\times 25}=\\dfrac{175}{1000}=0{,}175')}.` },
    ],
    ok: () => [...Array(12).keys()].every((n) => 10 ** n % 3 !== 0 && (2 * 10 ** n) % 7 !== 0) && 7 * 25 === 175 && 40 * 25 === 1000 && near(7 / 40, 0.175) },
  { id: 'a-sec-racine-deux', cls: C, chapters: ['seconde-04', 'seconde-13'], domain: 'nombres', level: 3, minutes: 25, title: 'L’irrationalité de racine de deux',
    intro: `On veut démontrer par l’absurde que ${M('\\sqrt{2}')} n’est pas rationnel. On admet la propriété démontrée en arithmétique : un entier et son carré ont la même parité.`,
    parts: [
      { w: 1, q: `Supposons ${M('\\sqrt{2}=\\dfrac{p}{q}')} avec ${M('p')} et ${M('q')} entiers naturels non nuls, la fraction étant irréductible. Montrer que ${M('p^{2}=2q^{2}')}.`, a: `En élevant au carré : ${M('2=\\dfrac{p^{2}}{q^{2}}')}, donc ${M('p^{2}=2q^{2}')}.` },
      { w: 2, q: `En déduire que ${M('p')} est pair, puis que ${M('q')} est pair.`, hint: `Écrire ${M('p=2k')} et remplacer dans ${M('p^{2}=2q^{2}')}.`, a: `${M('p^{2}=2q^{2}')} est pair, donc ${M('p')} est pair : ${M('p=2k')}. Alors ${M('4k^{2}=2q^{2}')}, soit ${M('q^{2}=2k^{2}')} : ${M('q^{2}')} est pair, donc ${M('q')} aussi.` },
      { w: 1, q: 'Conclure.', a: `${M('p')} et ${M('q')} sont tous deux pairs : la fraction ${M('\\dfrac{p}{q}')} se simplifie par ${M('2')}, ce qui contredit son irréductibilité. Donc ${M('\\sqrt{2}')} est irrationnel.` },
      { w: 2, q: `En déduire que ${M('\\sqrt{8}')} et ${M('1+\\sqrt{2}')} sont irrationnels.`, hint: `Si ${M('1+\\sqrt{2}')} était un rationnel ${M('r')}, que vaudrait ${M('\\sqrt{2}')} ?`, a: `${M('\\sqrt{8}=2\\sqrt{2}')} : si c’était un rationnel ${M('r')}, ${M('\\sqrt{2}=\\dfrac{r}{2}')} serait rationnel. De même, si ${M('1+\\sqrt{2}=r')}, alors ${M('\\sqrt{2}=r-1')} serait rationnel. Contradiction dans les deux cas.` },
    ],
    ok: () => near(Math.sqrt(8), 2 * Math.sqrt(2)) && [...Array(200).keys()].every((q) => q === 0 || !Number.isInteger(Math.sqrt(2 * q * q))) },

  // ================= 05 Bilan de trimestre =================
  { id: 'a-sec-bilan-erreurs', cls: C, chapters: ['seconde-05'], domain: 'nombres', level: 2, minutes: 20, title: 'Bilan : corriger cinq erreurs fréquentes',
    intro: 'Chaque affirmation ci-dessous vient d’une copie. Dire si elle est juste ; sinon, expliquer l’erreur et corriger.',
    parts: [
      { w: 1, q: `« ${M('\\dfrac{2}{3}+\\dfrac{1}{5}=\\dfrac{3}{8}')} »`, hint: 'On n’ajoute jamais les dénominateurs.', a: `Faux : il faut un dénominateur commun. ${M('\\dfrac{2}{3}+\\dfrac{1}{5}=\\dfrac{10}{15}+\\dfrac{3}{15}=\\dfrac{13}{15}')}.` },
      { w: 1, q: `« ${M('x\\in[-2\\,;\\,5[')} et ${M('x\\in]1\\,;\\,7]')}, donc ${M('x\\in[-2\\,;\\,7]')} »`, a: `Faux : « et » correspond à l’intersection. ${M('[-2\\,;\\,5[\\cap]1\\,;\\,7]=]1\\,;\\,5[')}. La réunion vaudrait ${M('[-2\\,;\\,7]')}.` },
      { w: 1, q: `« Pour ${M('A(1\\,;\\,4)')} et ${M('B(3\\,;\\,-2)')}, ${M('\\overrightarrow{AB}(2\\,;\\,6)')} »`, a: `Faux : ${M('\\overrightarrow{AB}(x_B-x_A\\,;\\,y_B-y_A)=(2\\,;\\,-6)')}. L’erreur est un signe : ${M('-2-4=-6')}.` },
      { w: 1, q: `« La droite passant par ${M('A(1\\,;\\,4)')} et ${M('B(3\\,;\\,-2)')} a pour pente ${M('-\\dfrac{1}{3}')} »`, hint: 'Vérifier quelle différence est au numérateur.', a: `Faux : la pente est ${M('\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{-6}{2}=-3')}. L’élève a inversé le quotient.` },
      { w: 2, q: `« ${M('\\sqrt{9+16}=\\sqrt{9}+\\sqrt{16}=7')} »`, a: `Faux : ${M('\\sqrt{9+16}=\\sqrt{25}=5')}. La racine d’une somme n’est pas la somme des racines ; en revanche ${M('\\sqrt{ab}=\\sqrt{a}\\sqrt{b}')} pour ${M('a,b\\geqslant 0')}.` },
    ],
    ok: () => near(2 / 3 + 1 / 5, 13 / 15) && 3 - 1 === 2 && -2 - 4 === -6 && (-2 - 4) / (3 - 1) === -3 && Math.sqrt(25) === 5 && Math.sqrt(9) + Math.sqrt(16) === 7 },
  { id: 'a-sec-bilan-vrai-faux', cls: C, chapters: ['seconde-05'], domain: 'nombres', level: 1, minutes: 15, title: 'Bilan : vrai ou faux justifié',
    intro: 'Pour chaque affirmation, répondre par vrai ou faux et justifier.',
    parts: [
      { w: 1, q: '« 91 est un nombre premier. »', hint: 'Tester les nombres premiers jusqu’à la racine carrée de 91, environ 9,5.', a: `Faux : ${M('91=7\\times 13')}.` },
      { w: 1, q: `« Le PGCD de ${M('84')} et ${M('126')} est ${M('42')}. »`, a: `Vrai : ${M('84=2^{2}\\times 3\\times 7')} et ${M('126=2\\times 3^{2}\\times 7')}, donc le PGCD est ${M('2\\times 3\\times 7=42')}.` },
      { w: 1, q: `« Les vecteurs ${M('\\vec{u}(4\\,;\\,-6)')} et ${M('\\vec{v}(-6\\,;\\,9)')} sont colinéaires. »`, a: `Vrai : ${M('\\det(\\vec{u},\\vec{v})=4\\times 9-(-6)\\times(-6)=36-36=0')}.` },
      { w: 1, q: `« ${M('-3')} appartient à l’intervalle ${M(']-3\\,;\\,2]')}. »`, a: 'Faux : le crochet est ouvert en -3, la borne est exclue.' },
      { w: 1, q: `« Les droites ${M('y=2x+1')} et ${M('4x-2y+3=0')} sont parallèles. »`, a: `Vrai : la seconde s’écrit ${M('y=2x+\\dfrac{3}{2}')}, de même pente ${M('2')} (et d’ordonnée à l’origine différente : strictement parallèles).` },
    ],
    ok: () => 91 === 7 * 13 && 84 === 4 * 3 * 7 && 126 === 2 * 9 * 7 && 4 * 9 - (-6) * (-6) === 0 && (3 / 2) * 2 === 3 },
  // ================= 07 Statistiques =================
  { id: 'a-sec-celsius-fahrenheit', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 3, minutes: 15, title: 'Changer d’unité : degrés Celsius et Fahrenheit',
    intro: `Sur un mois, les températures relevées à midi dans une ville ont pour moyenne ${M('15')} degrés Celsius, pour écart type ${M('4')} degrés Celsius et pour médiane ${M('14')}. Pour convertir en degrés Fahrenheit, on utilise ${M('F=1{,}8\\,C+32')}.`,
    parts: [
      { w: 1, q: 'Calculer la moyenne des températures en degrés Fahrenheit.', hint: 'Si chaque valeur est remplacée par k x + c, la moyenne devient k fois la moyenne plus c.', a: `${M('1{,}8\\times 15+32=59')} degrés Fahrenheit.` },
      { w: 2, q: 'Calculer l’écart type et la variance en degrés Fahrenheit.', a: `L’écart type est multiplié par ${M('|1{,}8|')} ; ajouter ${M('32')} ne change rien : ${M('\\sigma_F=1{,}8\\times 4=7{,}2')} et ${M('V_F=7{,}2^{2}=51{,}84')}.` },
      { w: 1, q: 'Quelle est la médiane en degrés Fahrenheit ? Justifier.', a: `La conversion est une fonction affine croissante : elle conserve l’ordre des valeurs, donc la médiane devient ${M('1{,}8\\times 14+32=57{,}2')}.` },
      { w: 2, q: `Un élève affirme : « l’écart type en Fahrenheit vaut ${M('1{,}8\\times 4+32=39{,}2')} ». Expliquer son erreur.`, a: 'L’écart type mesure des écarts entre valeurs ; une translation de 32 décale toutes les valeurs du même nombre et ne modifie aucun écart. Seul le facteur 1,8 agit.' },
    ],
    ok: () => near(1.8 * 15 + 32, 59) && near(1.8 * 4, 7.2) && near(7.2 ** 2, 51.84) && near(1.8 * 14 + 32, 57.2) && near(1.8 * 4 + 32, 39.2) },

  // ================= 08 Calcul algébrique =================
  { id: 'a-sec-identites-calcul', cls: C, chapters: ['seconde-08'], domain: 'algebre', level: 3, minutes: 20, title: 'Identités remarquables et calcul astucieux',
    intro: 'Les identités remarquables permettent de calculer de tête et de démontrer des propriétés des entiers.',
    parts: [
      { w: 1, q: `Calculer sans calculatrice ${M('101^{2}')} et ${M('49^{2}')}.`, hint: `Écrire ${M('101=100+1')} et ${M('49=50-1')}.`, a: `${M('101^{2}=100^{2}+2\\times 100+1=10\\,201')} ; ${M('49^{2}=50^{2}-2\\times 50+1=2\\,401')}.` },
      { w: 1, q: `Calculer ${M('99\\times 101')} et ${M('1\\,002\\times 998')}.`, a: `${M('(100-1)(100+1)=10\\,000-1=9\\,999')} ; ${M('(1\\,000+2)(1\\,000-2)=1\\,000\\,000-4=999\\,996')}.` },
      { w: 2, q: `Démontrer que, pour tout entier ${M('n')}, ${M('(n+1)^{2}-n^{2}=2n+1')}. Que peut-on en déduire sur la différence de deux carrés d’entiers consécutifs ?`, a: `${M('(n+1)^{2}-n^{2}=n^{2}+2n+1-n^{2}=2n+1')}, qui est impair : la différence de deux carrés consécutifs est toujours un nombre impair (par exemple ${M('36-25=11')}).` },
      { w: 2, q: `Factoriser ${M('a^{2}-b^{2}')} et en déduire, sans calculatrice, ${M('2026^{2}-2024^{2}')}.`, a: `${M('a^{2}-b^{2}=(a-b)(a+b)')}, donc ${M('2026^{2}-2024^{2}=2\\times 4\\,050=8\\,100')}.` },
    ],
    ok: () => 101 ** 2 === 10201 && 49 ** 2 === 2401 && 99 * 101 === 9999 && 1002 * 998 === 999996 && 36 - 25 === 11 && 2026 ** 2 - 2024 ** 2 === 8100 && [...Array(30).keys()].every((n) => (n + 1) ** 2 - n * n === 2 * n + 1) },

  // ================= 09 Proportions et évolutions =================
  { id: 'a-sec-lire-pourcentages', cls: C, chapters: ['seconde-09'], domain: 'nombres', level: 2, minutes: 15, title: 'Lire des pourcentages dans la presse',
    intro: 'Chaque phrase ci-dessous est extraite d’un article. Dire si elle est exacte et justifier par un calcul.',
    parts: [
      { w: 1, q: '« Après deux hausses successives de 10 %, le prix a augmenté de 21 %. »', a: `Exact : ${M('1{,}1\\times 1{,}1=1{,}21')}.` },
      { w: 1, q: '« Les ventes ont baissé de 50 % puis augmenté de 50 % : elles sont revenues à leur niveau initial. »', hint: 'Multiplier les coefficients multiplicateurs.', a: `Faux : ${M('0{,}5\\times 1{,}5=0{,}75')}, les ventes ont baissé de ${M('25\\,\\%')} au total.` },
      { w: 2, q: '« Le taux de chômage est passé de 8 % à 6 %, soit une baisse de 2 %. »', hint: 'Calculer le taux d’évolution entre la valeur initiale 8 et la valeur finale 6.', a: `Inexact : le taux a baissé de ${M('2')} points, mais son évolution relative est ${M('\\dfrac{6-8}{8}=-0{,}25')}, soit une baisse de ${M('25\\,\\%')}.` },
      { w: 1, q: '« Une hausse de 25 % est exactement compensée par une baisse de 20 %. »', a: `Exact : ${M('1{,}25\\times 0{,}8=1')}.` },
    ],
    ok: () => near(1.1 * 1.1, 1.21) && near(0.5 * 1.5, 0.75) && near((6 - 8) / 8, -0.25) && near(1.25 * 0.8, 1) },

  // ================= 10 Variations =================
  { id: 'a-sec-demontrer-variations', cls: C, chapters: ['seconde-10'], domain: 'fonctions', level: 3, minutes: 20, title: 'Démontrer un sens de variation',
    intro: 'On démontre les variations de deux fonctions de référence à partir de la définition : comparer les images de deux réels a et b.',
    parts: [
      { w: 2, q: `Soit ${M('0<a<b')}. Montrer que ${M('\\dfrac{1}{a}-\\dfrac{1}{b}=\\dfrac{b-a}{ab}')} et en déduire le sens de variation de la fonction inverse sur ${M(']0\\,;\\,+\\infty[')}.`, hint: 'Réduire au même dénominateur, puis étudier le signe du numérateur et du dénominateur.', a: `${M('\\dfrac{1}{a}-\\dfrac{1}{b}=\\dfrac{b-a}{ab}')}. Comme ${M('b-a>0')} et ${M('ab>0')}, la différence est positive : ${M('\\dfrac{1}{a}>\\dfrac{1}{b}')}. La fonction inverse est strictement décroissante sur ${M(']0\\,;\\,+\\infty[')}.` },
      { w: 2, q: `Soit ${M('0\\leqslant a<b')}. Montrer que ${M('b^{2}-a^{2}>0')} et conclure pour la fonction carré.`, a: `${M('b^{2}-a^{2}=(b-a)(b+a)')} avec ${M('b-a>0')} et ${M('b+a>0')} : ${M('a^{2}<b^{2}')}. La fonction carré est strictement croissante sur ${M('[0\\,;\\,+\\infty[')}.` },
      { w: 2, q: `En déduire le sens de variation de ${M('g(x)=3-\\dfrac{2}{x}')} sur ${M(']0\\,;\\,+\\infty[')}.`, a: `Pour ${M('0<a<b')} : ${M('\\dfrac{1}{a}>\\dfrac{1}{b}')}, donc ${M('-\\dfrac{2}{a}<-\\dfrac{2}{b}')} (on multiplie par ${M('-2<0')}) et ${M('g(a)<g(b)')} : ${M('g')} est strictement croissante.` },
      { w: 1, q: `Vérifier avec ${M('a=1')} et ${M('b=4')}.`, a: `${M('g(1)=1')} et ${M('g(4)=2{,}5')} : on a bien ${M('g(1)<g(4)')}.` },
    ],
    ok: () => { const g = (x) => 3 - 2 / x; return near(1 / 2 - 1 / 5, 3 / 10) && g(1) === 1 && g(4) === 2.5 && [0.5, 1, 2, 7].every((x) => g(x) < g(x + 0.5)); } },
  { id: 'a-sec-nombre-carre', cls: C, chapters: ['seconde-10'], domain: 'fonctions', level: 1, minutes: 12, title: 'Un nombre et son carré',
    intro: `On compare un réel positif ${M('x')} et son carré ${M('x^{2}')}.`,
    parts: [
      { w: 1, q: `Calculer ${M('0{,}7^{2}')}, ${M('1{,}3^{2}')} et comparer chaque fois au nombre de départ.`, a: `${M('0{,}7^{2}=0{,}49<0{,}7')} et ${M('1{,}3^{2}=1{,}69>1{,}3')}.` },
      { w: 2, q: `Montrer que ${M('x^{2}-x=x(x-1)')} et étudier son signe pour ${M('x\\geqslant 0')}.`, hint: 'Faire un tableau de signes avec les facteurs x et x - 1.', a: `Pour ${M('0\\leqslant x\\leqslant 1')} : ${M('x\\geqslant 0')} et ${M('x-1\\leqslant 0')}, donc ${M('x^{2}\\leqslant x')}. Pour ${M('x\\geqslant 1')} : les deux facteurs sont positifs, ${M('x^{2}\\geqslant x')}. Égalité en ${M('0')} et en ${M('1')}.` },
      { w: 1, q: `Sans calculer, ranger ${M('0{,}93')}, ${M('0{,}93^{2}')} et ${M('0{,}93^{3}')}.`, a: `${M('0{,}93')} est entre ${M('0')} et ${M('1')} : chaque multiplication par ${M('0{,}93')} diminue, donc ${M('0{,}93^{3}<0{,}93^{2}<0{,}93')}.` },
    ],
    ok: () => near(0.7 ** 2, 0.49) && near(1.3 ** 2, 1.69) && 0.93 ** 3 < 0.93 ** 2 && 0.93 ** 2 < 0.93 },

  // ================= 11 Deux variables qualitatives =================
  { id: 'a-sec-traduire-phrases', cls: C, chapters: ['seconde-11'], domain: 'stats-proba', level: 1, minutes: 12, title: 'Traduire des phrases en fréquences',
    intro: `Dans un lycée de ${M('400')} élèves : ${M('\\begin{array}{l|cc|c}&\\text{demi-pensionnaires}&\\text{externes}&\\text{Total}\\\\\\hline\\text{Filles}&120&80&200\\\\\\text{Garçons}&90&110&200\\\\\\hline\\text{Total}&210&190&400\\end{array}')} Dire si chaque phrase est vraie et justifier.`,
    parts: [
      { w: 1, q: '« 60 % des filles sont demi-pensionnaires. »', hint: '« Des filles » : la population de référence est celle des filles.', a: `Vrai : ${M('\\dfrac{120}{200}=0{,}6')}.` },
      { w: 1, q: '« La moitié des demi-pensionnaires sont des filles. »', a: `Faux : ${M('\\dfrac{120}{210}\\approx 57{,}1\\,\\%')}.` },
      { w: 1, q: '« 27,5 % des élèves sont des garçons externes. »', a: `Vrai : ${M('\\dfrac{110}{400}=0{,}275')}.` },
      { w: 1, q: '« Parmi les externes, environ 42 % sont des filles. »', a: `Vrai : ${M('\\dfrac{80}{190}\\approx 42{,}1\\,\\%')}.` },
    ],
    ok: () => 120 / 200 === 0.6 && near(120 / 210, 0.5714, 1e-3) && 110 / 400 === 0.275 && near(80 / 190, 0.421, 1e-3) && 120 + 90 === 210 },
  { id: 'a-sec-simpson', cls: C, chapters: ['seconde-11'], domain: 'stats-proba', level: 3, minutes: 20, title: 'Meilleur partout, moins bon au total',
    intro: `On compare la réussite à un examen dans deux lycées. Lycée A : ${M('80')} reçues sur ${M('100')} filles, ${M('20')} reçus sur ${M('50')} garçons. Lycée B : ${M('18')} reçues sur ${M('20')} filles, ${M('72')} reçus sur ${M('160')} garçons.`,
    parts: [
      { w: 1, q: 'Calculer, pour chaque lycée, le taux de réussite des filles et celui des garçons.', a: `Lycée A : ${M('80\\,\\%')} chez les filles, ${M('40\\,\\%')} chez les garçons. Lycée B : ${M('\\dfrac{18}{20}=90\\,\\%')} et ${M('\\dfrac{72}{160}=45\\,\\%')}.` },
      { w: 1, q: 'Calculer le taux de réussite global de chaque lycée.', a: `A : ${M('\\dfrac{100}{150}\\approx 66{,}7\\,\\%')} ; B : ${M('\\dfrac{90}{180}=50\\,\\%')}.` },
      { w: 2, q: 'Le lycée B réussit mieux chez les filles et chez les garçons, mais moins bien au total. Expliquer ce paradoxe.', hint: 'Regarder la composition de chaque lycée : quelle part de garçons ?', a: `Le taux global est une moyenne des taux par groupe, pondérée par les effectifs. Le lycée B compte surtout des garçons (${M('160')} sur ${M('180')}), groupe où la réussite est plus faible partout ; le lycée A compte surtout des filles. La composition des populations explique l’inversion (paradoxe de Simpson).` },
      { w: 1, q: 'Quelle comparaison est la plus pertinente pour juger les deux lycées ?', a: 'Comparer groupe par groupe, à composition égale : B fait mieux dans chaque groupe.' },
    ],
    ok: () => 80 / 100 < 18 / 20 && 20 / 50 < 72 / 160 && 100 / 150 > 90 / 180 && 72 / 160 === 0.45 && near(100 / 150, 0.6667, 1e-3) },

  // ================= 12 Géométrie repérée : synthèse =================
  { id: 'a-sec-varignon', cls: C, chapters: ['seconde-12', 'seconde-02'], domain: 'geometrie', level: 3, minutes: 25, title: 'Les milieux d’un quadrilatère',
    intro: `${M('ABCD')} est un quadrilatère quelconque. On note ${M('I')}, ${M('J')}, ${M('K')}, ${M('L')} les milieux respectifs de ${M('[AB]')}, ${M('[BC]')}, ${M('[CD]')} et ${M('[DA]')}.`,
    parts: [
      { w: 1, q: `Conjecturer la nature de ${M('IJKL')} avec ${M('A(0\\,;\\,0)')}, ${M('B(6\\,;\\,0)')}, ${M('C(8\\,;\\,6)')} et ${M('D(2\\,;\\,4)')}.`, a: `${M('I(3\\,;\\,0)')}, ${M('J(7\\,;\\,3)')}, ${M('K(5\\,;\\,5)')}, ${M('L(1\\,;\\,2)')} ; ${M('\\overrightarrow{IJ}(4\\,;\\,3)')} et ${M('\\overrightarrow{LK}(4\\,;\\,3)')} : ${M('IJKL')} semble être un parallélogramme.` },
      { w: 2, q: `Démontrer, pour un quadrilatère quelconque, que ${M('\\overrightarrow{IJ}=\\dfrac{1}{2}\\overrightarrow{AC}')}.`, hint: `Passer par ${M('B')} : ${M('\\overrightarrow{IJ}=\\overrightarrow{IB}+\\overrightarrow{BJ}')}.`, a: `${M('\\overrightarrow{IJ}=\\overrightarrow{IB}+\\overrightarrow{BJ}=\\dfrac{1}{2}\\overrightarrow{AB}+\\dfrac{1}{2}\\overrightarrow{BC}=\\dfrac{1}{2}\\overrightarrow{AC}')}.` },
      { w: 2, q: `Montrer de même que ${M('\\overrightarrow{LK}=\\dfrac{1}{2}\\overrightarrow{AC}')} et conclure.`, a: `${M('\\overrightarrow{LK}=\\overrightarrow{LD}+\\overrightarrow{DK}=\\dfrac{1}{2}\\overrightarrow{AD}+\\dfrac{1}{2}\\overrightarrow{DC}=\\dfrac{1}{2}\\overrightarrow{AC}')}. Donc ${M('\\overrightarrow{IJ}=\\overrightarrow{LK}')} : ${M('IJKL')} est un parallélogramme, quel que soit ${M('ABCD')}.` },
      { w: 1, q: `Dans l’exemple, calculer ${M('IJ')} et ${M('AC')} (repère orthonormé) et vérifier la relation.`, a: `${M('IJ=\\sqrt{16+9}=5')} et ${M('AC=\\sqrt{64+36}=10')} : ${M('IJ=\\dfrac{1}{2}AC')}.` },
    ],
    ok: () => { const A = [0, 0], B = [6, 0], Cc = [8, 6], D = [2, 4], mid = (P, Q) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], I = mid(A, B), J = mid(B, Cc), K = mid(Cc, D), L = mid(D, A); return J[0] - I[0] === 4 && J[1] - I[1] === 3 && K[0] - L[0] === 4 && K[1] - L[1] === 3 && Math.hypot(4, 3) === 5 && Math.hypot(8, 6) === 10; } },

  // ================= 13 Raisonnement =================
  { id: 'a-sec-implications', cls: C, chapters: ['seconde-13'], domain: 'algebre', level: 1, minutes: 15, title: 'Implication, réciproque, équivalence',
    intro: 'Pour chaque proposition, dire si elle est vraie, énoncer sa réciproque et dire si la réciproque est vraie.',
    parts: [
      { w: 1, q: '« Si un quadrilatère est un carré, alors c’est un rectangle. »', a: 'Vraie. Réciproque : « si un quadrilatère est un rectangle, alors c’est un carré » : fausse, un rectangle de côtés 2 et 3 n’est pas un carré.' },
      { w: 1, q: `« Si ${M('x=3')}, alors ${M('x^{2}=9')}. »`, a: `Vraie. Réciproque : « si ${M('x^{2}=9')}, alors ${M('x=3')} » : fausse, ${M('x=-3')} convient aussi.` },
      { w: 1, q: `« Si ${M('n')} est un multiple de ${M('4')}, alors ${M('n')} est pair. »`, a: `Vraie : ${M('n=4k=2(2k)')}. Réciproque : fausse, ${M('6')} est pair sans être multiple de ${M('4')}.` },
      { w: 2, q: `Écrire une équivalence vraie qui relie ${M('x^{2}=9')} à des valeurs de ${M('x')}.`, hint: 'Une équivalence exige les deux implications : il faut toutes les solutions.', a: `${M('x^{2}=9\\iff (x=3\\ \\text{ou}\\ x=-3)')}.` },
    ],
    ok: () => 3 ** 2 === 9 && (-3) ** 2 === 9 && 6 % 2 === 0 && 6 % 4 !== 0 },
  { id: 'a-sec-contre-exemples', cls: C, chapters: ['seconde-13'], domain: 'algebre', level: 2, minutes: 15, title: 'Chercher un contre-exemple',
    intro: 'Chacune des affirmations suivantes est fausse. Donner un contre-exemple et, si possible, corriger l’affirmation.',
    parts: [
      { w: 1, q: `« Pour tout réel ${M('x')}, ${M('x^{2}>0')}. »`, a: `Pour ${M('x=0')} : ${M('0^{2}=0')}. Correction : ${M('x^{2}\\geqslant 0')}, ou ${M('x^{2}>0')} pour ${M('x\\neq 0')}.` },
      { w: 1, q: `« Pour tous réels ${M('a')} et ${M('b')}, si ${M('a<b')} alors ${M('a^{2}<b^{2}')}. »`, hint: 'Essayer un nombre négatif.', a: `${M('a=-3')}, ${M('b=1')} : ${M('-3<1')} mais ${M('9>1')}. Correction : c’est vrai si ${M('0\\leqslant a<b')}.` },
      { w: 1, q: `« Deux vecteurs de même norme sont égaux. »`, a: `${M('\\vec{u}(1\\,;\\,0)')} et ${M('\\vec{v}(0\\,;\\,1)')} ont la même norme ${M('1')} mais des directions différentes.` },
      { w: 2, q: `« Pour tout réel ${M('x>0')}, ${M('\\dfrac{1}{x}<x')}. »`, a: `Pour ${M('x=\\dfrac{1}{2}')} : ${M('\\dfrac{1}{x}=2>\\dfrac{1}{2}')}. Correction : c’est vrai pour ${M('x>1')} (car alors ${M('x^{2}>1')}).` },
    ],
    ok: () => 0 ** 2 === 0 && -3 < 1 && 9 > 1 && Math.hypot(1, 0) === Math.hypot(0, 1) && 1 / 0.5 > 0.5 && [1.5, 2, 9].every((x) => 1 / x < x) },
  { id: 'a-sec-disjonction', cls: C, chapters: ['seconde-13', 'seconde-04'], domain: 'algebre', level: 2, minutes: 20, title: 'Raisonner par disjonction de cas',
    intro: 'On démontre deux propriétés en séparant les cas.',
    parts: [
      { w: 2, q: `Démontrer que, pour tout entier ${M('n')}, ${M('n^{2}+n+1')} est impair.`, hint: `${M('n^{2}+n=n(n+1)')} : traiter ${M('n')} pair puis ${M('n')} impair.`, a: `Si ${M('n=2k')} : ${M('n(n+1)=2k(2k+1)')} est pair. Si ${M('n=2k+1')} : ${M('n(n+1)=(2k+1)(2k+2)=2(2k+1)(k+1)')} est pair. Dans les deux cas ${M('n^{2}+n')} est pair, donc ${M('n^{2}+n+1')} est impair.` },
      { w: 3, q: `Démontrer que, pour tout réel ${M('x')}, ${M('|x-1|+|x+1|\\geqslant 2')}.`, hint: `Distinguer ${M('x\\leqslant -1')}, ${M('-1\\leqslant x\\leqslant 1')} et ${M('x\\geqslant 1')}, et enlever les valeurs absolues dans chaque cas.`, a: `Si ${M('x\\leqslant -1')} : la somme vaut ${M('(1-x)+(-x-1)=-2x\\geqslant 2')}. Si ${M('-1\\leqslant x\\leqslant 1')} : ${M('(1-x)+(x+1)=2')}. Si ${M('x\\geqslant 1')} : ${M('(x-1)+(x+1)=2x\\geqslant 2')}. Dans tous les cas, la somme est au moins ${M('2')}.` },
      { w: 1, q: 'Interpréter ce dernier résultat en termes de distances.', a: `${M('|x-1|+|x+1|')} est la somme des distances de ${M('x')} à ${M('1')} et à ${M('-1')} : elle est au moins égale à la distance entre ${M('-1')} et ${M('1')}, qui vaut ${M('2')}, avec égalité quand ${M('x')} est entre les deux.` },
    ],
    ok: () => [...Array(41).keys()].map((k) => k - 20).every((n) => (n * n + n + 1) % 2 !== 0) && [...Array(81).keys()].map((k) => (k - 40) / 10).every((x) => Math.abs(x - 1) + Math.abs(x + 1) >= 2 - 1e-12) },
  { id: 'a-sec-rationnel-irrationnel', cls: C, chapters: ['seconde-13', 'seconde-04'], domain: 'nombres', level: 3, minutes: 20, title: 'Rationnels et irrationnels',
    intro: `On admet que ${M('\\sqrt{2}')} est irrationnel. On rappelle que la somme, la différence et le produit de deux rationnels sont rationnels, ainsi que le quotient par un rationnel non nul.`,
    parts: [
      { w: 2, q: `Soit ${M('r')} un rationnel et ${M('x')} un irrationnel. Démontrer par l’absurde que ${M('r+x')} est irrationnel.`, hint: `Supposer que ${M('r+x')} est un rationnel ${M('q')} et exprimer ${M('x')} en fonction de ${M('q')} et ${M('r')}.`, a: `Si ${M('r+x=q')} avec ${M('q')} rationnel, alors ${M('x=q-r')} est une différence de rationnels, donc rationnel : contradiction. Donc ${M('r+x')} est irrationnel.` },
      { w: 2, q: `Montrer de même que, si ${M('r\\neq 0')}, ${M('rx')} est irrationnel. En déduire que ${M('3\\sqrt{2}')} et ${M('5+\\sqrt{2}')} sont irrationnels.`, a: `Si ${M('rx=q')} rationnel, alors ${M('x=\\dfrac{q}{r}')} serait rationnel : contradiction. Avec ${M('x=\\sqrt{2}')}, ${M('r=3')} puis ${M('r=5')}, les deux nombres sont irrationnels.` },
      { w: 2, q: '« La somme de deux irrationnels est irrationnelle. » Vrai ou faux ?', a: `Faux : ${M('(1+\\sqrt{2})+(1-\\sqrt{2})=2')}, alors que ${M('1+\\sqrt{2}')} et ${M('1-\\sqrt{2}')} sont irrationnels d’après la question 1.` },
    ],
    ok: () => near(1 + Math.SQRT2 + 1 - Math.SQRT2, 2) },

  // ================= 14 Probabilités =================
  { id: 'a-sec-evenements', cls: C, chapters: ['seconde-14'], domain: 'stats-proba', level: 1, minutes: 12, title: 'Vocabulaire des événements',
    intro: `On lance un dé équilibré à six faces. On note ${M('A')} : « le résultat est pair », ${M('B')} : « le résultat est supérieur ou égal à 4 » et ${M('C')} : « le résultat est 1 ».`,
    parts: [
      { w: 1, q: `Écrire l’univers ${M('\\Omega')} et les événements ${M('A')}, ${M('B')}, ${M('C')} comme des ensembles.`, a: `${M('\\Omega=\\{1\\,;\\,2\\,;\\,3\\,;\\,4\\,;\\,5\\,;\\,6\\}')}, ${M('A=\\{2\\,;\\,4\\,;\\,6\\}')}, ${M('B=\\{4\\,;\\,5\\,;\\,6\\}')}, ${M('C=\\{1\\}')}.` },
      { w: 1, q: `Déterminer ${M('A\\cap B')}, ${M('A\\cup B')} et ${M('\\overline{A}')}.`, a: `${M('A\\cap B=\\{4\\,;\\,6\\}')}, ${M('A\\cup B=\\{2\\,;\\,4\\,;\\,5\\,;\\,6\\}')}, ${M('\\overline{A}=\\{1\\,;\\,3\\,;\\,5\\}')}.` },
      { w: 1, q: `Les événements ${M('A')} et ${M('C')} sont-ils incompatibles ? et ${M('A')} et ${M('B')} ?`, hint: 'Deux événements sont incompatibles quand leur intersection est vide.', a: `${M('A\\cap C=\\varnothing')} : ${M('A')} et ${M('C')} sont incompatibles. ${M('A\\cap B\\neq\\varnothing')} : ${M('A')} et ${M('B')} ne le sont pas.` },
      { w: 1, q: `Calculer ${M('P(A\\cup B)')} de deux façons.`, a: `Directement : ${M('\\dfrac{4}{6}=\\dfrac{2}{3}')}. Par la formule : ${M('P(A)+P(B)-P(A\\cap B)=\\dfrac{3}{6}+\\dfrac{3}{6}-\\dfrac{2}{6}=\\dfrac{4}{6}')}.` },
    ],
    ok: () => { const A = [2, 4, 6], B = [4, 5, 6], I = A.filter((x) => B.includes(x)), U = [...new Set([...A, ...B])]; return I.length === 2 && U.length === 4 && near(3 / 6 + 3 / 6 - 2 / 6, 4 / 6); } },

  // ================= 15 Consolidation =================
  { id: 'a-sec-vers-tangente', cls: C, chapters: ['seconde-15', 'seconde-03', 'seconde-10'], domain: 'fonctions', level: 3, minutes: 25, title: 'Vers la Première : des sécantes à la tangente',
    intro: `On considère la parabole ${M('\\mathcal{C}')} d’équation ${M('y=x^{2}')} et le point ${M('A(1\\,;\\,1)')}. Pour ${M('h\\neq 0')}, on note ${M('M')} le point de ${M('\\mathcal{C}')} d’abscisse ${M('1+h')}.`,
    parts: [
      { w: 2, q: `Montrer que la pente de la droite ${M('(AM)')} vaut ${M('2+h')}.`, hint: `La pente est ${M('\\dfrac{y_M-y_A}{x_M-x_A}')} ; développer ${M('(1+h)^{2}')}.`, a: M('\\dfrac{(1+h)^{2}-1}{(1+h)-1}=\\dfrac{2h+h^{2}}{h}=2+h') },
      { w: 1, q: `Calculer cette pente pour ${M('h=1')}, ${M('h=0{,}1')} et ${M('h=-0{,}01')}. Que conjecturer quand ${M('h')} devient très petit ?`, a: `${M('3')}, ${M('2{,}1')}, ${M('1{,}99')} : les pentes se rapprochent de ${M('2')}.` },
      { w: 2, q: `Déterminer l’équation réduite de la droite ${M('T')} passant par ${M('A')} de pente ${M('2')}.`, a: `${M('y=2x+p')} avec ${M('1=2+p')}, soit ${M('T:\\ y=2x-1')}.` },
      { w: 2, q: `Montrer que ${M('x^{2}-(2x-1)=(x-1)^{2}')} et interpréter la position de ${M('\\mathcal{C}')} par rapport à ${M('T')}.`, a: `${M('x^{2}-2x+1=(x-1)^{2}\\geqslant 0')} : la parabole est au-dessus de ${M('T')}, et ne la touche qu’en ${M('A')} (égalité pour ${M('x=1')}). On dira en Première que ${M('T')} est la tangente à ${M('\\mathcal{C}')} en ${M('A')}.` },
    ],
    ok: () => [1, 0.1, -0.01].every((h) => near(((1 + h) ** 2 - 1) / h, 2 + h)) && [-3, 0, 1, 2.5].every((x) => near(x * x - (2 * x - 1), (x - 1) ** 2)) },
];

