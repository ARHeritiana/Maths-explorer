// One overlapping taxonomy for discovery. Memberships use stable topic/subtopic keys.
const P = (fr, en) => [fr, en];
const sub = (id, fr, en, concepts, words) => ({id, title:P(fr,en), concepts:concepts.split(' '), words});
export const TOPICS = [
  {id:'arithmetic', title:P('Arithmétique','Arithmetic'), preview:'numbers', subtopics:[
    sub('integers','Entiers et divisibilité','Integers and divisibility','arithmetic primes bezout congruences modular diophantine factorial factorials valuations jugs euler-primes fermat doors','(?<!log)arithm|divisib|prime|premier|congru|factoriel|factorial|entier'),
    sub('calculation','Calcul et proportions','Calculation and proportions','percentages reals gauss-sum','calcul mental|calcul numérique|calcul décimal|proportion|pourcent|percent|fraction')]},
  {id:'algebra', title:P('Algèbre','Algebra'), preview:'parabola', subtopics:[
    sub('equations','Équations et polynômes','Equations and polynomials','algebra quadratic polynomials inequalities sumproduct','algebr|algèbr|equation|équation|polyn|trinôme|quadratic'),
    sub('linear','Vecteurs et algèbre linéaire','Vectors and linear algebra','vectors scalar matrices matrix orthogonality space-equations','vect|matri|linéaire|linear'),
    sub('complex','Nombres complexes','Complex numbers','complex complex-algebra complex-plane complex-exponential complex-rotations roots-of-unity','complex|racines de l.unité|roots of unity')]},
  {id:'analysis', title:P('Analyse','Analysis'), preview:'curve', subtopics:[
    sub('functions','Fonctions et variations','Functions and variation','functions quadratic derivative convexity exponential logarithm log10 reciprocal bisection optimisation line lines ferris-wheel','fonction|function|dériv|deriv|exponent|logarith|convex|optimis'),
    sub('limits','Suites et limites','Sequences and limits','sequences sequence-limits function-limits induction telescoping differential','suite|sequence|limit|récurrence'),
    sub('integration','Intégration et Fourier','Integration and Fourier','integral fourier fourier-series fourier-drawing trig-functions trigonometry','intégr|integr|fourier|trigonom')]},
  {id:'geometry', title:P('Géométrie','Geometry'), preview:'geometry', subtopics:[
    sub('plane','Figures du plan','Plane figures','geometry circle reuleaux voronoi tiles artgallery reflect lunes star squares inscribed-square opaque-square moving-sofa equidecomposition hat','géom|geom|cercle|circle|triangle|polygon|square|carré|pavage|tiling|sofa|canapé'),
    sub('space','Espace et solides','Space and solids','space space-lines platonic box cake gomboc gömböc','\\bsolides?\\b|\\bsolids?\\b|espace|spatial|polyèdre|polyhed'),
    sub('optics','Réflexion et illumination','Reflection and illumination','illumination penrose tokarsky reflection','illumin|réflexion|reflection|tokarsky|penrose')]},
  {id:'topology', title:P('Topologie','Topology'), preview:'loop', subtopics:[
    sub('surfaces','Surfaces et orientation','Surfaces and orientation','mobius klein hairy-ball tangent-field','topolog|möbius|mobius|klein|chevelu|hairy|surface|orientab'),
    sub('knots','Nœuds et enlacements','Knots and links','knots nails','nœud|noeud|knot|enlac|hanging')]},
  {id:'probability', title:P('Probabilités','Probability'), preview:'distribution', subtopics:[
    sub('experiments','Expériences et modèles','Experiments and models','random probability galton buffon bertrand binomial birthday monty-hall','probabil|hasard|random|binomial|birthday|anniversaire|monty'),
    sub('conditioning','Conditionnement et décision','Conditioning and decisions','conditional bayes waiting-time stopping optimal-stopping markov','condition|bayes|stopping|arrêt optimal|decision|décision')]},
  {id:'statistics', title:P('Statistiques','Statistics'), preview:'distribution', subtopics:[
    sub('data','Données et distributions','Data and distributions','statistics regression tables benford','statisti|\\bdonnées\\b|\\bdata\\b|régression|regression|benford'),
    sub('inference','Estimation et incertitude','Estimation and uncertainty','concentration german-tank baker inference','estimat|incert|uncertain|tank|boulanger|baker|inferen')]},
  {id:'discrete', title:P('Mathématiques discrètes','Discrete mathematics'), preview:'graph', subtopics:[
    sub('graphs','Graphes et parcours','Graphs and traversal','graphs euler-trails konigsberg five-rooms rooms knight-tour knights chess queens ramsey','\\bgraphes?\\b(?!\\s+(?:de|d’|d\\x27|représentatif))|\\bgraphs?\\b(?!\\s+of)|parcours|travers|cavalier|knight|eulérien|eulerian|königsberg|konigsberg'),
    sub('counting','Dénombrement et algorithmes','Counting and algorithms','counting lattice-paths pigeonhole gridpaths cookies hanoi merge inversions josephus nim piles pegs horses eggs lighteggs fakecoins cheryl','dénombre|\\bcount(?:ing|s)?\\b|algorithm|combina|tiroir|pigeon|inversion')]},
  {id:'dynamics', title:P('Dynamique','Dynamics'), preview:'orbit', subtopics:[
    sub('iteration','Itérations et chaos','Iteration and chaos','cobweb chaos mandelbrot logistic life','chaos|logisti|itér|iterat|mandelbrot|bifurc|\\blife\\b|jeu de la vie'),
    sub('motion','Mouvement et mécanique','Motion and mechanics','double-pendulum three-body gomboc fastest fly snail bridge soap','pendul|three.body|trois corps|\\bmotion\\b|\\bmouvements?\\b|descent|brachist|gömb|gomb')]},
  {id:'foundations', title:P('Fondements','Foundations'), preview:'numbers', subtopics:[
    sub('reasoning','Logique et démonstration','Logic and proof','logic review invariants induction circle-regions tiles fermat euler-primes','\\blogiques?\\b|\\blogic(?:al)?\\b|\\bpreuves?\\b|\\bproofs?\\b|raisonn|reasoning|invariant'),
    sub('sets','Ensembles et choix','Sets and choice','banach-tarski fair-division fair-goods','\\bensembles\\b|théorie des ensembles|set theory|banach|tarski|axiom|partage équitable|fair division|\\benvy|\\benvie')]},
  {id:'history', title:P('Histoire des mathématiques','History of mathematics'), preview:'timeline', subtopics:[
    sub('people','Mathématiciennes et mathématiciens','Mathematicians','biography biographies','biograph'),
    sub('advances','Idées, découvertes et preuves','Ideas, discoveries and proofs','story stories timeline advances','histoire|history|timeline|chronolog')]},
];
export const topicById = id => TOPICS.find(t => t.id === id);
export const membershipByKey = key => {
  const [topic, subtopic] = String(key).split('/');
  const t = topicById(topic), s = t?.subtopics.find(x=>x.id===subtopic);
  return s ? {topic:t, subtopic:s} : null;
};
// Explicit placements by route, for records whose words cannot place them (or would misplace them). A record's own
// `topics` field wins over this table; the table wins over the word rules. Pinned by tests/discovery.test.mjs.
const LAB = (ids, topics) => ids.flatMap(id => [[`#lab/${id}`, topics], [`#gallery/${id}-gallery`, topics]]);
export const PLACEMENTS = Object.fromEntries([
  ...LAB(['secretary'], ['probability/conditioning','probability/experiments']),
  ...LAB(['monty'], ['probability/conditioning','probability/experiments']),
  ...LAB(['tank'], ['statistics/inference','probability/experiments']),
  ...LAB(['baker'], ['statistics/inference','statistics/data']),
  ...LAB(['benford'], ['statistics/data','statistics/inference']),
  ...LAB(['birthdays'], ['probability/experiments']),
  ...LAB(['fair-division','fair-goods'], ['foundations/sets']),
  ...LAB(['hairy-ball','nonorientable-surfaces'], ['topology/surfaces']),
  ['#lab/banach-tarski-model', ['foundations/sets','geometry/space']],
  ['#gallery/banach-tarski-gallery', ['foundations/sets','geometry/space']],
  ['#lab/monte-carlo-pi', ['probability/experiments','statistics/inference']],
  ['#lab/monte-carlo-lake', ['probability/experiments','statistics/inference','geometry/plane']],
  ['#lab/monte-carlo-integral', ['analysis/integration','probability/experiments','statistics/inference']],
  ['#lab/monte-carlo-walk', ['probability/experiments']],
  ['#lab/trig', ['geometry/plane','analysis/functions']],
  ['#lab/vectors', ['algebra/linear','geometry/plane']],
  ['#lab/line', ['analysis/functions','geometry/plane']],
  ['#lab/circle-regions', ['discrete/counting','foundations/reasoning']],
  ['#gallery/mandelbrot', ['dynamics/iteration','algebra/complex']],
  ['#gallery/chaos', ['dynamics/iteration','geometry/plane']],
  ['#gallery/soap-films', ['geometry/space','analysis/functions']],
  ['#gallery/einstein', ['geometry/plane']],
  ['#gallery/four-colours', ['discrete/graphs','foundations/reasoning']],
  ['#university/calculs-algebriques', ['algebra/equations','discrete/counting']],
  ['#university/fourier-periodicite', ['analysis/integration']],
  ['#university/fourier-coefficients', ['analysis/integration','algebra/complex']],
  ['#university/fourier-convergence', ['analysis/integration','analysis/limits']],
  ['#university/fourier-energie', ['analysis/integration','algebra/linear']],
  ['#university/fourier-discret', ['analysis/integration','algebra/linear']],
  ['#university/fourier-contours', ['analysis/integration','geometry/plane']],
]);
// The word rules match whole words where a fragment would mislead ("logi" in "Topologie", "ensemble" in "l'ensemble de
// Mandelbrot"). `fallback: false` returns [] when nothing matches (the caller then inherits from linked records).
export function membershipsFor(record, kind='', {route='', fallback=true}={}) {
  if (!record.topics?.length && PLACEMENTS[route]) record = {...record, topics: PLACEMENTS[route]};
  if (record.topics?.length) {
    for(const key of record.topics) if(!membershipByKey(key)) throw new Error(`Unknown discovery membership: ${key}`);
    return [...new Set(record.topics)];
  }
  const concepts = new Set([record.id, typeof record.topic==='string'?record.topic:'', ...(record.concepts || [])]);
  // The broad gallery group ("Données & hasard", "Jeux & histoires") is not matched: it placed every member in every
  // field the group names. Records the words cannot place get an entry in PLACEMENTS.
  const text = [record.title, record.name, record.topic, record.summary].flat(Infinity).filter(Boolean).join(' ').toLowerCase();
  const result = TOPICS.flatMap(topic=>topic.subtopics.filter(s=>s.concepts.some(c=>concepts.has(c)) || new RegExp(s.words,'iu').test(text)).map(s=>`${topic.id}/${s.id}`));
  if (kind==='biography') result.push('history/people');
  if (kind==='story' || kind==='timeline') result.push('history/advances');
  return [...new Set(result.length||!fallback?result:['foundations/reasoning'])];
}
// Figures of the field menu (kinds of discovery-previews.js `modelPreview`): one recognisable object per field.
export const TOPIC_FIGURES = {arithmetic:'euler-primes', algebra:'quadratic', analysis:'integral', geometry:'reuleaux',
  topology:'nonorientable-surfaces', probability:'probability', statistics:'statistics', discrete:'graphs',
  dynamics:'logistic', foundations:'sets', history:'timeline'};
// "Pour commencer" on the #topics landing: a short, varied selection (an experiment, a curiosity, a challenge, a story...),
// one door per kind of activity. Routes that disappear are skipped by the page and caught by tests/discovery.test.mjs.
export const TOPIC_STARTERS = ['#lab/quadratic','#gallery/mandelbrot','#challenges/konigsberg','#lab/monty',
  '#gallery/moving-sofa','#errors/square-of-sum'];
// Difficulty bands. Challenges carry their own difficulty (1 to 3). Other resources get the band of the earliest stage
// their level names (the first segment of "Seconde · Première" is Seconde); "Pour tous" and mixed collections stay
// unbanded and appear only under "all difficulties".
export const DIFFICULTY_BANDS = [
  {id:1, title:['Premiers pas (collège, Seconde, T10)','First steps (lower secondary, Year 10)']},
  {id:2, title:['Lycée (Première, Terminale, T11)','Upper secondary (Years 11 and 12)']},
  {id:3, title:['Approfondissement (expertes, université)','Further study (advanced, university)']}];
export function difficultyBand(difficulty, level) {
  if (Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 3) return difficulty;
  const first = String((Array.isArray(level) ? level[0] : level) || '').split('·')[0].trim().toLowerCase();
  if (/^(coll[eè]ge|seconde|t10\b)/.test(first)) return 1;
  if (/expert|universit|supérieur|approfond|atelier/.test(first)) return 3;
  if (/^(premi|terminale|lycée|t11\b|interm)/.test(first)) return 2;
  return null;
}
