import { university } from './catalogue-data.js';
import { GALLERY_ADDITIONS } from './gallery-additions.js';
import { CURIOSITIES } from './gallery-curiosities.js';
import { INFERENCE_GALLERY } from './inference-content.js';
import { FAIR_GALLERY } from './fair-division-content.js';
import { TOPOLOGY_GALLERY } from './topology-content.js';
import { DYNAMICS_GALLERY } from './dynamics-content.js';
import { ILLUMINATION_GALLERY } from './illumination-content.js';
import { GOMBOC_GALLERY } from './gomboc-content.js';
import { universityPathway } from './university-model.js';
// Bilingual content: every pair is [French, English]. Topic placements are indicative.
import { challengeBase, VARIANTS, defaults } from "./challenges/registry.js";
import { catalogue as experimentCatalogue } from "./lab/registry.js";
// `labs` lists every laboratory entry. The nine experiments (lab/experiments/) appear here only as their catalogue line, so
// that titles stay in one place; the gallery objects (`custom: true`) are written out below.
export const labs = [
  ...experimentCatalogue(),
  {
    id: "galton",
    custom: true,
    symbol: "∴",
    group: ["Données & hasard", "Data & chance"],
    title: ["La planche de Galton", "The Galton board"],
    short: ["Planche de Galton", "Galton board"],
    intro: ["Des billes tombent entre des clous : à chaque clou, gauche ou droite. Pourquoi une cloche apparaît-elle ?", "Balls fall through pegs: left or right at every peg. Why does a bell shape appear?"],
    prereq: ["Probabilités, triangle de Pascal", "Probability, Pascal’s triangle"],
    formula: "",
    params: [],
    steps: [
      ["Fais tomber quelques billes, puis des centaines. La forme se stabilise-t-elle ?", "Drop a few balls, then hundreds. Does the shape settle down?"],
      ["Change p : où se déplace le sommet ? Compare avec la courbe binomiale.", "Change p: where does the peak move? Compare with the binomial curve."],
      ["Compte les trajets menant à chaque case : retrouves-tu une ligne du triangle de Pascal ?", "Count the paths to each bin: do you recognise a row of Pascal’s triangle?"],
    ],
    quiz: ["Une planche de Galton a 4 rangées de clous et p = 1/2. Quelle est la probabilité qu’une bille termine dans la case centrale ? (décimal ou fraction)", "A Galton board has 4 rows of pegs and p = 1/2. What is the probability that a ball ends in the central bin? (decimal or fraction)"],
    answer: 0.375,
    explain: ["Il y a 2⁴ = 16 trajets équiprobables ; ceux qui comptent 2 droites et 2 gauches sont C(4,2) = 6. Donc 6/16 = 3/8 = 0,375.", "There are 2⁴ = 16 equally likely paths; those with 2 rights and 2 lefts number C(4,2) = 6. So 6/16 = 3/8 = 0.375."],
    history: ["Galton · 1889", "Galton · 1889"],
    story: ["Francis Galton a imaginé cette planche pour montrer comment de nombreux petits hasards indépendants se combinent en une loi régulière, ancêtre intuitif du théorème central limite.", "Francis Galton devised this board to show how many small independent chances combine into a regular law, an intuitive forerunner of the central limit theorem."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Galton/",
    duration: 8,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "reuleaux",
    custom: true,
    symbol: "◇",
    group: ["Géométrie", "Geometry"],
    title: ["Les courbes de largeur constante", "Curves of constant width"],
    short: ["Triangle de Reuleaux", "Reuleaux triangle"],
    intro: ["Un triangle aux côtés bombés qui roule aussi bien qu’un disque, et qui perce des trous presque carrés. Comment est-ce possible ?", "A triangle with bulging sides that rolls as well as a disc and drills almost-square holes. How is that possible?"],
    prereq: ["Cercles, arcs, périmètre", "Circles, arcs, perimeter"],
    formula: "",
    params: [],
    steps: [
      ["Fais tourner la forme : la distance entre deux droites parallèles qui l’enserrent change-t-elle ?", "Rotate the shape: does the distance between two parallel lines enclosing it change?"],
      ["Passe de 3 à 5, 7, 9 sommets. Que devient le périmètre ? Et l’aire ?", "Go from 3 to 5, 7, 9 vertices. What happens to the perimeter? And the area?"],
      ["Compare l’aire avec celle du disque de même largeur : laquelle est maximale ?", "Compare the area with that of the disc of the same width: which is larger?"],
    ],
    quiz: ["Un triangle de Reuleaux a un périmètre de 6π cm. Quelle est sa largeur, en cm ?", "A Reuleaux triangle has perimeter 6π cm. What is its width, in cm?"],
    answer: 6,
    explain: ["Une courbe de largeur constante w a pour périmètre πw (théorème de Barbier). Donc πw = 6π et w = 6 cm.", "A curve of constant width w has perimeter πw (Barbier’s theorem). So πw = 6π and w = 6 cm."],
    history: ["Reuleaux · 1875", "Reuleaux · 1875"],
    story: ["Franz Reuleaux étudia ces courbes en cinématique des mécanismes. Barbier avait montré dès 1860 que toutes les courbes de même largeur ont le même périmètre.", "Franz Reuleaux studied these curves in the kinematics of mechanisms. Barbier had shown in 1860 that all curves of the same width have the same perimeter."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Reuleaux/",
    duration: 10,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "platonic",
    custom: true,
    symbol: "△",
    group: ["Géométrie", "Geometry"],
    title: ["Les cinq solides de Platon", "The five Platonic solids"],
    short: ["Solides de Platon", "Platonic solids"],
    intro: ["Des faces régulières identiques, un solide convexe, le même assemblage à chaque sommet : cinq solides, à une similitude près. Ouvre leurs patrons pour comprendre.", "Identical regular faces, a convex solid and the same arrangement at every vertex: five solids up to similarity. Open their nets to see why."],
    prereq: ["Polygones réguliers, angles, formule d’Euler", "Regular polygons, angles, Euler’s formula"],
    formula: "",
    params: [],
    steps: [
      ["Fais tourner chaque solide et compte sommets, arêtes, faces : calcule S − A + F.", "Rotate each solid and count vertices, edges, faces: compute V − E + F."],
      ["Dans « Pourquoi seulement cinq ? », ajoute des faces autour d’un sommet : quand l’angle total atteint-il 360° ?", "In “Why only five?”, add faces around a vertex: when does the total angle reach 360°?"],
      ["Essaie des pentagones ou des hexagones : combien peut-on en rassembler au plus ?", "Try pentagons or hexagons: how many can you gather at most?"],
    ],
    quiz: ["Un solide a 12 sommets et 20 faces triangulaires. Combien d’arêtes a-t-il ?", "A solid has 12 vertices and 20 triangular faces. How many edges does it have?"],
    answer: 30,
    explain: ["Chaque face a 3 arêtes et chaque arête borde 2 faces : E = 3 × 20 / 2 = 30. Euler : 12 − 30 + 20 = 2 ✓ (c’est l’icosaèdre).", "Each face has 3 edges and each edge borders 2 faces: E = 3 × 20 / 2 = 30. Euler: 12 − 30 + 20 = 2 ✓ (the icosahedron)."],
    history: ["Théétète · Ve s. av. J.-C.", "Theaetetus · 5th c. BC"],
    story: ["La classification des cinq solides réguliers est attribuée à Théétète et exposée à la fin des Éléments d’Euclide (livre XIII). L’argument des angles autour d’un sommet y figure déjà en substance.", "The classification of the five regular solids is attributed to Theaetetus and set out at the end of Euclid’s Elements (Book XIII). The angle-sum argument at a vertex is already there in substance."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Theaetetus/",
    duration: 12,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "chaos",
    custom: true,
    symbol: "⁘",
    group: ["Géométrie", "Geometry"],
    title: ["Le jeu du chaos", "The chaos game"],
    short: ["Jeu du chaos", "Chaos game"],
    intro: ["Un point saute au hasard à mi-chemin d’un sommet : le désordre dessine un triangle de Sierpiński. Pourquoi ?", "A point jumps at random halfway to a vertex: disorder draws a Sierpiński triangle. Why?"],
    prereq: ["Homothéties, suites géométriques", "Homotheties, geometric sequences"],
    formula: "",
    params: [],
    steps: [
      ["Lance le jeu avec 3 sommets : que remarques-tu après quelques milliers de points ?", "Run the game with 3 vertices: what do you notice after a few thousand points?"],
      ["Déplace un sommet, ou passe à 4, 5 ou 6 sommets : la figure change-t-elle de nature ?", "Move a vertex, or switch to 4, 5 or 6 vertices: does the figure change nature?"],
      ["Dans la construction par niveaux, compare le nombre de triangles et l’aire restante.", "In the level-by-level construction, compare the number of triangles and the remaining area."],
    ],
    quiz: ["On construit le triangle de Sierpiński : à chaque niveau, chaque triangle plein est remplacé par 3 triangles de moitié de côté. Combien de triangles pleins au niveau 3 ?", "We build the Sierpiński triangle: at each level, each filled triangle is replaced by 3 triangles of half the side. How many filled triangles at level 3?"],
    answer: 27,
    explain: ["Le nombre est multiplié par 3 à chaque niveau : 3³ = 27. L’aire, elle, est multipliée par 3/4 : (3/4)³ ≈ 0,42, et tend vers 0.", "The number is multiplied by 3 at each level: 3³ = 27. The area is multiplied by 3/4: (3/4)³ ≈ 0.42, tending to 0."],
    history: ["Sierpiński · 1915", "Sierpiński · 1915"],
    story: ["Wacław Sierpiński décrit ce triangle en 1915. Le jeu du chaos, popularisé par Michael Barnsley dans les années 1980, montre qu’il apparaît aussi comme limite d’un processus aléatoire.", "Wacław Sierpiński described this triangle in 1915. The chaos game, popularised by Michael Barnsley in the 1980s, shows it also emerges as the limit of a random process."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Sierpinski/",
    duration: 8,
    level: ["Première · Terminale", "Intermediate"],
  },
  {
    id: "fourier",
    custom: true,
    symbol: "◎",
    group: ["Formes & mouvement", "Shapes & motion"],
    title: ["Des cercles qui dessinent Madagascar", "Circles that draw Madagascar"],
    short: ["Cercles de Fourier", "Fourier circles"],
    intro: ["Une chaîne de vecteurs tournants approche un contour échantillonné. Combien en faut-il pour reconnaître une île ?", "A chain of rotating vectors approximates a sampled outline. How many does it take to recognise an island?"],
    prereq: ["Aucun : curiosité, ou nombres complexes et trigonométrie pour aller plus loin", "None: curiosity, or complex numbers and trigonometry to go further"],
    formula: "",
    params: [],
    steps: [
      ["Regarde la forme apparaître avec un seul cercle, puis deux, puis dix. Que gagne-t-on à chaque cercle ajouté ?", "Watch the shape appear with one circle, then two, then ten. What does each added circle bring?"],
      ["Cache les cercles : il reste une seule pointe qui trace la forme. Quels cercles sont les plus grands ?", "Hide the circles: a single tip remains and traces the shape. Which circles are the largest?"],
      ["Dessine ta propre forme avec le doigt ou la souris, puis augmente le nombre de cercles.", "Draw your own shape with your finger or the mouse, then increase the number of circles."],
    ],
    quiz: ["Un cercle de rayon 3 tourne à 1 tour par seconde. Sur son bord, un second cercle de rayon 1 tourne à 2 tours par seconde autour de ce point. Quelle est la plus grande distance possible entre le bout du second cercle et le centre du premier ?", "A circle of radius 3 turns once per second. On its edge, a second circle of radius 1 turns twice per second around that point. What is the greatest possible distance between the tip of the second circle and the centre of the first?"],
    answer: 4,
    explain: ["La distance est au plus 3 + 1 = 4, atteinte quand les deux bras sont alignés dans le même sens : à cet instant le bout est à 4 du centre.", "The distance is at most 3 + 1 = 4, reached when both arms point the same way: at that moment the tip is 4 from the centre."],
    history: ["Fourier · 1822", "Fourier · 1822"],
    story: ["Dans sa Théorie analytique de la chaleur (1822), Joseph Fourier développe la décomposition trigonométrique pour étudier la propagation de la chaleur. Les théorèmes de convergence précisent les hypothèses nécessaires pour retrouver un signal. Les cercles de cette page sont la même idée appliquée à une courbe du plan. Le contour de Madagascar a été relevé sur un fond de carte puis lissé : c’est une aide au dessin, pas un levé cartographique.", "In his Analytical Theory of Heat (1822), Joseph Fourier developed trigonometric decomposition to study heat propagation. Convergence theorems specify the assumptions needed to recover a signal. The circles on this page are the same idea applied to a plane curve. The outline of Madagascar was traced from a map outline and then smoothed: it is a drawing aid, not a survey."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Fourier/",
    duration: 10,
    level: ["Pour tous", "For everyone"],
  },
  {
    id: "mandelbrot",
    custom: true,
    symbol: "❋",
    group: ["Formes & mouvement", "Shapes & motion"],
    title: ["L’ensemble de Mandelbrot", "The Mandelbrot set"],
    short: ["Ensemble de Mandelbrot", "Mandelbrot set"],
    intro: ["Une règle d’une ligne, z → z² + c, et un monde infini de détails. Explore-le, zoome, et regarde l’ensemble de Julia de chaque point.", "A one-line rule, z → z² + c, and an infinite world of detail. Explore it, zoom in, and watch the Julia set of every point."],
    prereq: ["Aucun : curiosité, ou nombres complexes et suites pour aller plus loin", "None: curiosity, or complex numbers and sequences to go further"],
    formula: "",
    params: [],
    steps: [
      ["Déplace le pointeur dans le grand disque central puis dans les bulbes : l’ensemble de Julia reste-t-il d’un seul tenant ?", "Move the pointer inside the big central disc and then in the bulbs: does the Julia set stay in one piece?"],
      ["Zoome sur le bord : les formes se répètent-elles à une autre échelle ?", "Zoom in on the edge: do the shapes repeat at another scale?"],
      ["Lance le voyage vers la vallée des hippocampes et observe le nombre d’itérations nécessaires.", "Take the trip to the seahorse valley and watch the number of iterations needed."],
    ],
    quiz: ["On part de z₀ = 0 et on répète zₙ₊₁ = zₙ² + c avec c = 1. À quelle étape n la valeur |zₙ| dépasse-t-elle 2 pour la première fois ?", "Start from z₀ = 0 and repeat zₙ₊₁ = zₙ² + c with c = 1. At which step n does |zₙ| exceed 2 for the first time?"],
    answer: 3,
    explain: ["z₁ = 1, z₂ = 1² + 1 = 2 (pas encore supérieur à 2), z₃ = 2² + 1 = 5 > 2. Le point c = 1 s’échappe : il n’est pas dans l’ensemble de Mandelbrot.", "z₁ = 1, z₂ = 1² + 1 = 2 (not yet greater than 2), z₃ = 2² + 1 = 5 > 2. The point c = 1 escapes: it is not in the Mandelbrot set."],
    history: ["Mandelbrot · 1980", "Mandelbrot · 1980"],
    story: ["Benoît Mandelbrot a visualisé cet ensemble par ordinateur en 1980. Les ensembles de Julia, étudiés dès 1918 par Gaston Julia et Pierre Fatou, en sont les pièces : l’ensemble de Mandelbrot indique, pour chaque c, si l’ensemble de Julia associé est d’un seul tenant.", "Benoit Mandelbrot visualised this set by computer in 1980. The Julia sets, studied from 1918 by Gaston Julia and Pierre Fatou, are its building blocks: the Mandelbrot set records, for each c, whether the associated Julia set is in one piece."],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Mandelbrot/",
    duration: 10,
    level: ["Pour tous", "For everyone"],
  },
];

labs.push(...GALLERY_ADDITIONS, ...CURIOSITIES, ...INFERENCE_GALLERY, ...DYNAMICS_GALLERY, ...FAIR_GALLERY, ...TOPOLOGY_GALLERY);
labs.push(GOMBOC_GALLERY);
// Activities give examples, conditions and a general argument separately.
const reasoning = {
  galton: {
    conjecture: ["Avec p = 1/2, la répartition est symétrique et se concentre autour du centre quand le nombre de billes augmente.", "With p = 1/2 the distribution is symmetric and concentrates around the centre as the number of balls grows."],
    proof: ["Une bille fait n choix indépendants gauche/droite. La probabilité d’aboutir dans la case k est C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ : il y a C(n,k) trajets à k virages à droite, chacun de probabilité pᵏ(1 − p)ⁿ⁻ᵏ. L’espérance est np. La simulation illustre ce résultat, elle ne le démontre pas.", "A ball makes n independent left/right choices. The probability of bin k is C(n,k)pᵏ(1 − p)ⁿ⁻ᵏ: there are C(n,k) paths with k right turns, each of probability pᵏ(1 − p)ⁿ⁻ᵏ. The mean is np. The simulation illustrates this result; it does not prove it."],
    transfer: ["À tester : p = 0,2 avec 12 rangées. La courbe est-elle encore symétrique ? Où est son sommet ?", "Try p = 0.2 with 12 rows. Is the curve still symmetric? Where is its peak?"]
  },
  reuleaux: {
    conjecture: ["Un polygone de Reuleaux à n sommets (n impair) garde la même largeur dans toutes les directions et son périmètre vaut πw.", "A Reuleaux polygon with n vertices (n odd) has the same width in every direction and its perimeter equals πw."],
    proof: ["Chaque arc a pour rayon w et pour angle π/n, donc pour longueur πw/n ; avec n arcs, le périmètre est πw. La largeur est constante car chaque point d’un arc est à distance w du sommet opposé, et deux tangentes parallèles touchent la courbe en un sommet et en un point de l’arc opposé. Ce raisonnement suppose n impair.", "Each arc has radius w and angle π/n, hence length πw/n; with n arcs the perimeter is πw. The width is constant because each point of an arc is at distance w from the opposite vertex, and two parallel tangents touch the curve at a vertex and at a point of the opposite arc. The argument assumes n is odd."],
    transfer: ["À discuter : pourquoi un carré ne peut-il pas être une courbe de largeur constante ? Calcule sa largeur selon l’axe puis selon la diagonale.", "Discuss: why can a square not be a curve of constant width? Compute its width along an axis and along a diagonal."]
  },
  platonic: {
    conjecture: ["Autour d’un sommet, il faut au moins 3 faces et la somme de leurs angles doit être strictement inférieure à 360° : cela ne laisse que cinq possibilités.", "At a vertex at least 3 faces are needed and their angles must add up to strictly less than 360°: only five possibilities remain."],
    proof: ["Le polygone régulier à p côtés a pour angle intérieur 180°(p − 2)/p. Avec q faces par sommet, la condition est q · 180°(p − 2)/p < 360°, soit (p − 2)(q − 2) < 4. Les couples (p,q) avec p, q ≥ 3 sont (3,3), (3,4), (3,5), (4,3), (5,3). Cette condition est nécessaire ; l’existence de chaque solide se vérifie par construction. Euler : S − A + F = 2.", "The regular p-gon has interior angle 180°(p − 2)/p. With q faces at a vertex the condition is q · 180°(p − 2)/p < 360°, i.e. (p − 2)(q − 2) < 4. The pairs (p,q) with p, q ≥ 3 are (3,3), (3,4), (3,5), (4,3), (5,3). This condition is necessary; the existence of each solid is checked by construction. Euler: V − E + F = 2."],
    transfer: ["À tester : trois hexagones en un sommet donnent exactement 360°. Que se passe-t-il : un solide ou un pavage du plan ?", "Try three hexagons at a vertex: exactly 360°. What happens: a solid or a tiling of the plane?"]
  },
  chaos: {
    conjecture: ["Quel que soit le point de départ, les points du jeu du chaos à trois sommets se rassemblent sur le triangle de Sierpiński.", "Whatever the starting point, the points of the three-vertex chaos game gather on the Sierpiński triangle."],
    proof: ["Chaque saut est l’homothétie de rapport 1/2 et de centre un sommet. Les trois homothéties envoient le triangle sur trois copies réduites ; l’ensemble limite K vérifie K = h₁(K) ∪ h₂(K) ∪ h₃(K). Le point de départ est « oublié » car chaque saut divise la distance à K par 2. La simulation illustre ; la preuve repose sur cette contraction.", "Each jump is the homothety of ratio 1/2 centred at a vertex. The three homotheties send the triangle to three reduced copies; the limit set K satisfies K = h₁(K) ∪ h₂(K) ∪ h₃(K). The starting point is “forgotten” because each jump halves the distance to K. The simulation illustrates; the proof rests on this contraction."],
    transfer: ["À tester : 4 sommets avec le rapport 1/2. Que remarques-tu ? Essaie ensuite le bouton « Valeur qui donne un joli motif ».", "Try 4 vertices with ratio 1/2. What do you notice? Then try the “Value that gives a clean pattern” button."]
  },
  fourier: {
    conjecture: ["Ajouter des coefficients diminue l’erreur quadratique sur les échantillons. Les plus grands cercles rendent rapidement l’île reconnaissable.", "Adding coefficients reduces squared error on the samples. The largest circles quickly make the island recognisable."],
    proof: ["On échantillonne le contour fermé en M points complexes. Leur DFT donne M coefficients. La somme des vecteurs tournants restitue les M points à l’arrondi près quand tous les coefficients sont utilisés ; entre les points, elle définit une interpolation trigonométrique. Parseval discret donne l’erreur quadratique moyenne sur les échantillons comme la somme des modules au carré des coefficients omis. À nombre de coefficients fixé, garder les plus grands modules minimise cette erreur, sans garantir une erreur géométrique minimale en chaque point du contour.", "Sample the closed outline as M complex points. Their DFT gives M coefficients. The rotating-vector sum recovers the M points up to rounding when all coefficients are retained; between samples it defines a trigonometric interpolant. Discrete Parseval makes mean squared sample error the sum of squared magnitudes of omitted coefficients. For a fixed count, keeping the largest magnitudes minimises this error, without guaranteeing minimum geometric error at every point of the outline."],
    transfer: ["À tester : dessine un carré, puis un cercle. Combien de cercles faut-il pour chacun, et pourquoi le cercle n’en demande-t-il qu’un ?", "Try drawing a square, then a circle. How many circles does each need, and why does the circle need only one?"]
  },
  mandelbrot: {
    conjecture: ["Les points proches du centre de l’ensemble ne s’échappent jamais ; ceux loin de lui s’échappent vite ; le bord est infiniment détaillé.", "Points near the middle of the set never escape; those far from it escape quickly; the edge is endlessly detailed."],
    proof: ["Si |c| > 2, alors |z₁| = |c| > 2 et, par récurrence, |zₙ₊₁| ≥ |zₙ|² − |c| > |zₙ|, donc la suite tend vers l’infini. Plus généralement, dès qu’un terme dépasse 2 en module, la suite s’échappe : c’est ce critère qui permet de tester chaque point par un nombre fini d’itérations. L’ensemble est donc contenu dans le disque de rayon 2.", "If |c| > 2 then |z₁| = |c| > 2 and, by induction, |zₙ₊₁| ≥ |zₙ|² − |c| > |zₙ|, so the sequence tends to infinity. More generally, as soon as a term exceeds 2 in modulus the sequence escapes: this is the criterion that lets each point be tested with finitely many iterations. The set is therefore contained in the disc of radius 2."],
    transfer: ["À tester : c = −1 donne la suite 0, −1, 0, −1… Pourquoi ce point est-il dans l’ensemble ? Trouve un autre point du même genre.", "Try c = −1: the sequence is 0, −1, 0, −1… Why is that point in the set? Find another point of the same kind."]
  }
};
const quizStates = { galton: {}, reuleaux: {}, platonic: {}, chaos: {}, fourier: {}, mandelbrot: {} };
for (const lab of labs) {
  if (lab.experiment) continue;
  lab.reasoning ??= reasoning[lab.id];
  lab.quizState ??= quizStates[lab.id];
}

// Each challenge lives in challenges/<id>/ (registry.js lists them). Its statement, expected answer, hints and worked
// solution come from its variant with the default parameters: one source, so the page and the tests cannot drift apart.
export const challenges = challengeBase.map((c) => {
  const v = VARIANTS[c.id], q = defaults(c.id);
  return { ...c, prompt: v.prompt(q), answer: v.answer(q), solution: v.solution(q), hints: v.hints ? v.hints(q) : c.hints };
});

export const pathways = [
  {
    id:"mg", label:"MG", name:["Programme malagasy","Malagasy curriculum"],
    intro:["Repères tirés des répartitions ministérielles 2024–2025 pour T10 et les séries S, OSE, L. Leur validité pour 2026–2027 reste à confirmer avec ton enseignant. Les anciens documents A/C/D ne sont pas interchangeables.", "Guides based on ministry distributions for 2024–2025: T10 and streams S, OSE, L. Their applicability to 2026–2027 still needs confirmation with your teacher. Older A/C/D documents are not interchangeable."],
    stages:[
      {name:["T10 · Algèbre et vecteurs","T10 · Algebra and vectors"],ids:["quadratic","vectors"],note:["Le laboratoire des vecteurs travaille le déterminant et la colinéarité.","The vectors lab works on the determinant and collinearity."]},
      {name:["T11 S · Analyse et géométrie","T11 S · Calculus and geometry"],ids:["quadratic","trig","sequences","derivative","vectors"]},
      {name:["T11 OSE & L · Algèbre et analyse","T11 OSE & L · Algebra and calculus"],ids:["quadratic","sequences","derivative"]},
      {name:["T11 OSE · Statistiques","T11 OSE · Statistics"],ids:["statistics"]},
      {name:["T12 S · Approfondir","T12 S · Extend"],ids:["probability","integral","complex"],note:["Explorations partielles, pas une couverture complète. T12 OSE/L : correspondances encore à vérifier.","Partial explorations, not full coverage. T12 OSE/L mappings still need review."]}
    ],
    source:"https://www.education.gov.mg/repartition-annuelle-du-programme-detudes/",
    sourceName:["MEN · Répartitions T10, T11/T12 S, OSE, L (2024–2025)","Ministry · T10, T11/T12 S, OSE, L distributions (2024–2025)"]
  },
  {
    id:"fr",label:"FR",name:["Programme français","French curriculum"],
    intro:["Voie générale : seconde et première, programmes 2026–2027 ; terminale spécialité, programme 2019 encore applicable en 2026–2027. Le nouveau programme de terminale s’applique en 2027–2028. Les voies technologiques et les maths complémentaires ne sont pas cartographiées ici.","General pathway: seconde and première use the 2026–2027 programmes; terminale specialty still uses the 2019 programme in 2026–2027. Its new programme starts in 2027–2028. Technological pathways and maths complémentaires are not mapped here."],
    stages:[
      {name:["Seconde · Explorer","Seconde · Explore"],ids:["statistics","vectors","quadratic"],note:["Vecteurs : coordonnées, déterminant et colinéarité dans le laboratoire. Le discriminant général : prolongement, pas un attendu de seconde.","Vectors: coordinates, determinant and collinearity in the lab. The general discriminant is an extension, not a seconde requirement."]},
      {name:["Première · Spécialité","Première · Specialty"],ids:["quadratic","trig","sequences","derivative","vectors","probability"],note:["Probabilités (BO n° 14 du 2 avril 2026) : indépendance, probabilités totales, arbre de n ⩽ 4 épreuves de Bernoulli, espérance et variance. Le labo de probabilités s’utilise avec n ⩽ 4 et un arbre ; la loi binomiale B(n, p) relève de la terminale.","Probability (BO no. 14, 2 April 2026): independence, total probability, trees for n ⩽ 4 Bernoulli trials, expectation and variance. Use the probability lab with n ⩽ 4 and a tree; the binomial distribution B(n, p) belongs to terminale."]},
      {name:["Terminale · Spécialité (2026–2027)","Terminale · Specialty (2026–2027)"],ids:["probability","integral"]},
      {name:["Terminale · Option maths expertes","Terminale · Maths expertes option"],ids:["complex"]}
    ],
    source:"https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt",
    sourceName:["MEN · Programmes et options du lycée","Ministry · Lycée programmes and options"]
  },
  {
    id:"int",label:"INT",icon:"globe",name:["International","International"],
    intro:["Deux référentiels pour commencer : le Baccalauréat International (IB) et le SAT. Les placements sont pédagogiques et indicatifs ; les explorations couvrent une partie seulement de chaque référentiel.","Two frameworks to start with: the International Baccalaureate (IB) and the SAT. Placements are pedagogical suggestions; the explorations cover only part of each framework."],
    programmes:[{
    id:"ib",name:["Baccalauréat International (IB)","International Baccalaureate (IB)"],
    intro:["AA = Analysis and Approaches ; AI = Applications and Interpretation. SL = niveau moyen ; HL = niveau supérieur. Les repères ci-dessous distinguent le programme actuel (première évaluation 2021) des changements pour la première évaluation 2029.","AA = Analysis and Approaches; AI = Applications and Interpretation. SL = standard level; HL = higher level. These guides distinguish the current syllabus (first assessment 2021) from changes for first assessment 2029."],
    stages:[
      {name:["AA & AI · SL/HL · Idées communes","AA & AI · SL/HL · Shared ideas"],ids:["quadratic","sequences","statistics","probability","derivative","integral"]},
      {name:["AA SL/HL & AI HL · Cercle unité","AA SL/HL & AI HL · Unit circle"],ids:["trig"],note:["AI SL : trigonométrie des triangles ; cette activité sur les radians et les angles orientés est un prolongement.","AI SL: triangle trigonometry; this activity on radians and directed angles is an extension."]},
      {name:["AA & AI · HL · Vecteurs","AA & AI · HL · Vectors"],ids:["vectors"]},
      {name:["AA HL · Complexes","AA HL · Complex numbers"],ids:["complex"]},
      {name:["AI HL · Complexes : programme actuel seulement","AI HL · Complex numbers: current syllabus only"],ids:["complex"],note:["Retirés pour les élèves commençant en août 2027 (première évaluation en mai 2029). Ils restent une exploration facultative.","Removed for students starting in August 2027 (first assessment May 2029). They remain optional enrichment."]}
    ],
    source:"https://ibo.org/programmes/diploma-programme/curriculum/mathematics/",
    sourceName:["IB · Cours actuels et première évaluation 2029","IB · Current courses and first assessment 2029"]
  },{
    id:"sat",name:["SAT Math","SAT Math"],
    intro:["Le SAT numérique comporte une section de mathématiques de 44 questions en deux modules, répartie en quatre domaines. Les parts indiquées sont approximatives et varient d’un document à l’autre : vérifie la fiche College Board en vigueur. Dérivation et intégration ne figurent pas dans ces domaines.","The digital SAT has one maths section of 44 questions in two modules, split across four domains. The shares shown are approximate and differ between documents: check the current College Board specification. Differentiation and integration are not among these domains."],
    stages:[
      {name:["Algèbre · environ 35 %","Algebra · about 35%"],ids:[],note:["Équations et inéquations affines, fonctions affines, systèmes de deux équations. Pas encore d’exploration dédiée.","Linear equations and inequalities, linear functions, systems of two equations. No dedicated exploration yet."]},
      {name:["Mathématiques avancées · environ 35 %","Advanced math · about 35%"],ids:["quadratic","sequences"],note:["Équations et fonctions non linéaires : quadratiques, exponentielles, polynomiales. Les suites géométriques donnent le modèle discret de la croissance exponentielle.","Nonlinear equations and functions: quadratic, exponential, polynomial. Geometric sequences give the discrete model of exponential growth."]},
      {name:["Résolution de problèmes et analyse de données · environ 15 %","Problem-solving and data analysis · about 15%"],ids:["statistics","probability"],note:["Données à une et deux variables, probabilités. Probabilités conditionnelles, marge d’erreur, rapports et pourcentages : pas encore couverts.","One- and two-variable data, probability. Conditional probability, margin of error, ratios and percentages: not yet covered."]},
      {name:["Géométrie et trigonométrie · environ 15 %","Geometry and trigonometry · about 15%"],ids:["trig"],note:["Triangles rectangles et trigonométrie. Aires, volumes, angles et cercles : pas encore couverts.","Right triangles and trigonometry. Area, volume, angles and circles: not yet covered."]}
    ],
    source:"https://satsuite.collegeboard.org/sat/whats-on-the-test/math/overview",
    sourceName:["College Board · SAT, section Mathématiques (consulté le 13 octobre 2026)","College Board · SAT Math section (consulted 13 October 2026)"]
  }]
  },
  universityPathway(university)
];

// Stages of a pathway, whether it lists them directly or through programmes.
export const pathwayStages = (p) => (p.programmes ? p.programmes.flatMap((x) => x.stages) : p.stages);


labs.push(ILLUMINATION_GALLERY);
