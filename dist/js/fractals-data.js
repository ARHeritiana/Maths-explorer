// The fractal collection (`#fractals`, issue #36): one record per fractal shown on the site, grouped 2D / 3D and
// constructions / iterations, each pointing at the exhibit that shows it (nothing is duplicated). `dim` says what is known
// about its dimension: an exact value (with the reason), a published numerical estimate, or not established.
const P = (fr, en) => [fr, en];
const EXACT = (v, why) => ({ kind: 'exact', v, why }), EST = (v, why) => ({ kind: 'estimate', v, why }), NONE = (why) => ({ kind: 'none', why });
export const GROUPS = [
  { id: 'build2', title: P('Construites étape par étape, dans le plan', 'Built stage by stage, in the plane') },
  { id: 'build3', title: P('Construites étape par étape, dans l’espace', 'Built stage by stage, in space') },
  { id: 'iter2', title: P('Itérations dans le plan complexe', 'Iterations in the complex plane') },
  { id: 'iter3', title: P('Itérations dans l’espace', 'Iterations in space') },
];
export const FRACTALS = [
  { group: 'build2', hash: '#gallery/self-similar', name: P('Ensemble de Cantor', 'Cantor set'), dim: EXACT('log 2 / log 3 ≈ 0,631', P('2 copies au rapport 1/3', '2 copies at ratio 1/3')) },
  { group: 'build2', hash: '#gallery/self-similar', name: P('Flocon de Koch', 'Koch snowflake'), dim: EXACT('log 4 / log 3 ≈ 1,262', P('4 copies au rapport 1/3 (pour le bord)', '4 copies at ratio 1/3 (for the edge)')) },
  { group: 'build2', hash: '#gallery/self-similar', name: P('Tapis de Sierpiński', 'Sierpiński carpet'), dim: EXACT('log 8 / log 3 ≈ 1,893', P('8 copies au rapport 1/3', '8 copies at ratio 1/3')) },
  { group: 'build2', hash: '#gallery/chaos', name: P('Triangle de Sierpiński (jeu du chaos)', 'Sierpiński triangle (chaos game)'), dim: EXACT('log 3 / log 2 ≈ 1,585', P('3 copies au rapport 1/2', '3 copies at ratio 1/2')) },
  { group: 'build2', hash: '#gallery/self-similar', name: P('Courbe du dragon', 'Dragon curve'), dim: EXACT('2', P('la limite remplit une région ; sa frontière : ≈ 1,5236, valeur calculée publiée', 'the limit fills a region; its boundary: ≈ 1.5236, a published computed value')) },
  { group: 'build2', hash: '#gallery/self-similar', name: P('Courbes de Hilbert et de Peano', 'Hilbert and Peano curves'), dim: EXACT('2', P('la courbe limite remplit le carré ; chaque étape finie n’a pas d’aire', 'the limit curve fills the square; each finite stage has no area')) },
  { group: 'build2', hash: '#gallery/self-similar', name: P('Fougère de Barnsley', 'Barnsley fern'), dim: NONE(P('copies affines, pas des similitudes : pas de formule simple', 'affine copies, not similarities: no simple formula')) },
  { group: 'build2', hash: '#gallery/apollonian', name: P('Baderne d’Apollonius', 'Apollonian gasket'), dim: EST('≈ 1,3057', P('aucune formule ; calcul numérique de McMullen (1998)', 'no formula; numerical computation by McMullen (1998)')) },
  { group: 'build3', hash: '#gallery/self-similar', name: P('Éponge de Menger', 'Menger sponge'), dim: EXACT('log 20 / log 3 ≈ 2,727', P('20 copies au rapport 1/3', '20 copies at ratio 1/3')) },
  { group: 'build3', hash: '#gallery/self-similar', name: P('Tétraèdre de Sierpiński', 'Sierpiński tetrahedron'), dim: EXACT('2', P('4 copies au rapport 1/2', '4 copies at ratio 1/2')) },
  { group: 'build3', hash: '#gallery/self-similar', name: P('Poussière de Cantor', 'Cantor dust'), dim: EXACT('log 8 / log 3 ≈ 1,893', P('8 copies au rapport 1/3', '8 copies at ratio 1/3')) },
  { group: 'iter2', hash: '#gallery/mandelbrot', name: P('Ensembles de Mandelbrot et de Julia', 'Mandelbrot and Julia sets'), dim: EXACT('2 (bord de Mandelbrot)', P('théorème de Shishikura (1998) pour le bord ; pour Julia, la dimension dépend de c', 'Shishikura’s theorem (1998) for the boundary; for Julia sets, the dimension depends on c')) },
  { group: 'iter2', hash: '#gallery/basins', name: P('Multibrot et bassins de Newton', 'Multibrot and Newton basins'), dim: NONE(P('dépend de la puissance ou du polynôme ; non affichée', 'depends on the power or the polynomial; not shown')) },
  { group: 'iter3', hash: '#gallery/escape-3d', name: P('Mandelbulb, Mandelbox, Julia quaternionique', 'Mandelbulb, Mandelbox, quaternion Julia'), dim: NONE(P('non établie ; formules choisies, ou tranche 3D d’un ensemble de dimension 4', 'not established; chosen formulas, or a 3D slice of a four-dimensional set')) },
];
export const DIM_KIND = { exact: P('Exacte', 'Exact'), estimate: P('Estimation', 'Estimate'), none: P('Non établie', 'Not established') };
