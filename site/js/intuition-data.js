// The collection « Les mathématiques contre l'intuition » (issue #28): one record per entry, each pointing at an exhibit, an experiment or a
// challenge that already exists on the site (nothing is duplicated). `status` is 'live'; entries still to come are listed in SOON.
// kind: gallery (Curiosités), lab (Laboratoire), challenge (Défis). `claim` is what intuition says, `fact` what the experiment shows.
const P = (fr, en) => [fr, en];
export const ENTRIES = [
  {id: 'collisions', hash: '#gallery/collisions', kind: 'gallery', title: P('Les collisions qui calculent π', 'Colliding blocks that compute π'),
    claim: P('Deux blocs et un mur : combien de chocs ? Un nombre quelconque, pense-t-on.', 'Two blocks and a wall: how many collisions? Some arbitrary number, one would think.'),
    fact: P('Avec des masses de rapport 1, 100, 10 000, 1 000 000 : 3, 31, 314, 3 141 chocs.', 'With mass ratios 1, 100, 10,000, 1,000,000: 3, 31, 314, 3,141 collisions.')},
  {id: 'napkin-ring', hash: '#gallery/napkin-ring', kind: 'gallery', title: P('L’anneau de serviette', 'The napkin ring'),
    claim: P('Une grosse sphère percée garde plus de matière qu’une petite, à hauteur égale.', 'A large drilled sphere keeps more material than a small one, at equal height.'),
    fact: P('Le volume est π h³ / 6, quel que soit le rayon de la sphère.', 'The volume is π h³ / 6, whatever the radius of the sphere.')},
  {id: 'hundred-boxes', hash: '#gallery/hundred-boxes', kind: 'gallery', title: P('Les cent boîtes', 'The hundred boxes'),
    claim: P('Sans se parler, cent prisonniers qui ouvrent des boîtes n’ont presque aucune chance.', 'Without talking, a hundred prisoners opening boxes have almost no chance.'),
    fact: P('Une stratégie les fait gagner avec une probabilité d’environ 31 %, contre (1/2)¹⁰⁰ au hasard.', 'One strategy wins with probability about 31%, against (1/2)¹⁰⁰ at random.')},
  {id: 'birthdays', hash: '#gallery/birthdays-gallery', kind: 'gallery', title: P('Deux anniversaires le même jour', 'Two birthdays on the same day'),
    claim: P('Il faut une foule pour que deux personnes aient le même anniversaire.', 'It takes a crowd for two people to share a birthday.'),
    fact: P('23 personnes suffisent pour dépasser une chance sur deux.', '23 people are enough to pass one chance in two.')},
  {id: 'monty', hash: '#gallery/monty-gallery', kind: 'gallery', title: P('Changer de porte ?', 'Switch doors?'),
    claim: P('Deux portes restantes : une chance sur deux, changer ne sert à rien.', 'Two doors left: one chance in two, switching is pointless.'),
    fact: P('Changer fait gagner dans deux cas sur trois (animateur informé).', 'Switching wins in two cases out of three (informed host).')},
  {id: 'bertrand', hash: '#lab/bertrand', kind: 'lab', title: P('Une corde au hasard', 'A random chord'),
    claim: P('« Au hasard » désigne une seule chose.', '“At random” means one thing.'),
    fact: P('Trois façons naturelles de tirer une corde donnent 1/3, 1/2 et 1/4.', 'Three natural ways to draw a chord give 1/3, 1/2 and 1/4.')},
  {id: 'circle-regions', hash: '#lab/circle-regions', kind: 'lab', title: P('1, 2, 4, 8, 16… et 31', '1, 2, 4, 8, 16… and 31'),
    claim: P('Les régions d’un disque doublent à chaque nouveau point.', 'The regions of a disc double with each new point.'),
    fact: P('Le sixième point en donne 31, pas 32 : 1 + C(n,2) + C(n,4).', 'The sixth point gives 31, not 32: 1 + C(n,2) + C(n,4).')},
  {id: 'tiles', hash: '#lab/tiles', kind: 'lab', title: P('Des pièces qui changent d’aire', 'Pieces that change area'),
    claim: P('On réarrange les mêmes pièces et il manque (ou il reste) un carreau.', 'The same pieces are rearranged and a square is missing (or left over).'),
    fact: P('Le dessin est truqué : la « diagonale » est brisée.', 'The drawing cheats: the “diagonal” is bent.')},
];
// Entries planned for the collection and not on the site yet (issue #28, next phases).
export const SOON = [
  P('Le triangle de Morley', 'Morley’s triangle'),
  P('Le carré disparu', 'The missing square'),
];
export const KINDS = {gallery: P('Curiosité', 'Curiosity'), lab: P('Laboratoire', 'Laboratory'), challenge: P('Défi', 'Challenge')};
