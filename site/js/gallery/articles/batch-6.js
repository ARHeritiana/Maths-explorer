// Batch 6 of the gallery articles (shape and rules: ../article.js): fair division (cake and goods), hairy ball, nonorientable
// surfaces, Banach-Tarski, Gömböc, mirrored rooms. Encyclopedia voice: third person, present tense, no task, no question.
const p = (fr, en) => [fr, en];
const EXPLAINER = { h: p("Explication animée", "Animated explanation"), explainer: true };
export const BATCH6 = {
  "fair-division-gallery": {
    facts: [
      [p("Problème", "Problem"), p("Partager un bien divisible (un gâteau) entre n personnes", "Sharing a divisible good (a cake) among n people")],
      [p("Formalisé", "Formalised"), p("Années 1940, école mathématique polonaise (Steinhaus, Banach, Knaster)", "1940s, Polish school of mathematics (Steinhaus, Banach, Knaster)")],
      [p("Domaine", "Field"), p("Théorie du partage équitable, économie, informatique", "Fair division theory, economics, computer science")],
      [p("Critères", "Criteria"), p("Proportionnel, sans envie", "Proportional, envy-free")],
      [p("Résultat clé", "Key result"), p("Sans envie implique proportionnel ; la réciproque est fausse dès trois personnes", "Envy-free implies proportional; the converse fails from three people on")],
    ],
    lead: [
      p("Le partage équitable (fair division) étudie la façon de répartir un bien entre plusieurs personnes qui l’évaluent chacune à sa manière. Le bien est classiquement représenté par un gâteau, que l’on peut couper où l’on veut : un morceau a un glaçage pour l’un, des fruits pour l’autre, et personne ne donne la même valeur à tous les morceaux.",
        "Fair division studies how to share a good among several people who each value it in their own way. The good is classically pictured as a cake that can be cut anywhere: one piece carries icing, another fruit, and nobody values all pieces alike."),
      p("Le mot « équitable » reçoit ici une définition précise qui ne compare jamais le bonheur de deux personnes : chacun juge uniquement les lots avec sa propre échelle de valeurs.",
        "The word “fair” receives a precise definition here which never compares two people’s happiness: each person judges the bundles only on their own scale of values."),
    ],
    sections: [
      { h: p("Le modèle : la valeur est personnelle", "The model: value is personal"), p: [
        p("Chaque personne i attribue à chaque morceau une valeur Vᵢ, additive : la valeur de deux morceaux disjoints réunis est la somme de leurs valeurs. On normalise la valeur du gâteau entier à 1 pour chacun. Ces valeurs sont privées et ne se comparent pas d’une personne à l’autre. On suppose aussi que les valeurs n’ont pas d’atomes : aucun point isolé n’a de valeur.",
          "Each person i gives every piece a value Vᵢ that is additive: the value of two disjoint pieces together is the sum of their values. The whole cake is normalised to value 1 for everyone. These values are private and are not compared between people. The values are also assumed atomless: no single point has any value.") ] },
      { h: p("Deux critères", "Two criteria"), p: [
        p("Un partage complet en n lots A₁, …, Aₙ est proportionnel si chacun estime son lot à au moins 1/n du tout : Vᵢ(Aᵢ) ≥ 1/n. Pour trois personnes, chacune doit donc valoriser son lot à au moins 1/3.",
          "A complete division into n bundles A₁, …, Aₙ is proportional if everyone values their bundle at at least 1/n of the whole: Vᵢ(Aᵢ) ≥ 1/n. With three people, each must therefore value their own bundle at 1/3 or more."),
        p("Il est sans envie si chacun estime son lot au moins autant que tout autre lot : Vᵢ(Aᵢ) ≥ Vᵢ(Aⱼ) pour tout j. Le premier critère compare un lot à une part du tout, le second compare des lots entre eux.",
          "It is envy-free if everyone values their bundle at least as much as any other bundle: Vᵢ(Aᵢ) ≥ Vᵢ(Aⱼ) for every j. The first criterion compares a bundle with a share of the whole, the second compares bundles with one another.") ] },
      { h: p("Une implication et sa limite", "An implication and its limit"), p: [
        p("Dans un partage complet sans envie, chaque lot vaut pour i au plus Vᵢ(Aᵢ). En additionnant les n lots : n·Vᵢ(Aᵢ) ≥ Vᵢ(tout) = 1, donc Vᵢ(Aᵢ) ≥ 1/n. Sans envie implique proportionnel.",
          "In a complete envy-free division every bundle is worth at most Vᵢ(Aᵢ) to i. Adding the n bundles gives n·Vᵢ(Aᵢ) ≥ Vᵢ(whole) = 1, hence Vᵢ(Aᵢ) ≥ 1/n. Envy-free implies proportional."),
        p("La réciproque est vraie pour deux personnes, mais fausse à trois. Si les trois personnes évaluent les lots 1, 2, 3 selon les lignes (2, 3, 1), (1, 2, 3) et (3, 1, 2), divisées par 6, chacune obtient exactement son tiers, alors qu’elle préfère un autre lot au sien.",
          "The converse holds for two people but fails for three. If the three people value bundles 1, 2, 3 according to the rows (2, 3, 1), (1, 2, 3) and (3, 1, 2), divided by 6, each gets exactly a third, although each prefers another bundle to their own.") ] },
      { h: p("Le cas de deux personnes", "The case of two people"), p: [
        p("Pour deux personnes, la méthode « je coupe, tu choisis » donne un partage sans envie : l’une coupe le gâteau en deux moitiés selon sa propre valeur, l’autre choisit le morceau qu’elle préfère. La première est indifférente entre les deux morceaux, la seconde a le morceau qu’elle préfère.",
          "For two people, “I cut, you choose” gives an envy-free division: one person cuts the cake into halves according to their own value, the other picks the piece they prefer. The first is indifferent between the two pieces, the second holds the piece they prefer."),
        p("Cette garantie suppose un gâteau divisible, des valeurs sans atomes et des préférences utilisées avec sincérité. Elle ne garantit ni l’efficacité économique, ni l’intérêt de dire la vérité dans tout mécanisme.",
          "This guarantee assumes a divisible cake, atomless values and sincerely used preferences. It guarantees neither economic efficiency nor an incentive to tell the truth in every mechanism.") ] },
      { h: p("Histoire et prolongements", "History and developments"), p: [
        p("Dans les années 1940, Hugo Steinhaus, Stefan Banach et Bronisław Knaster formalisent le problème et donnent des procédures proportionnelles pour un nombre quelconque de personnes. Une procédure sans envie à trois personnes, attribuée à Selfridge et Conway, date des années 1960, et Aziz et Mackenzie en donnent une pour n personnes en 2016, avec un nombre de coupes borné.",
          "In the 1940s Hugo Steinhaus, Stefan Banach and Bronisław Knaster formalise the problem and give proportional procedures for any number of people. An envy-free procedure for three people, credited to Selfridge and Conway, dates from the 1960s, and Aziz and Mackenzie give one for n people in 2016, with a bounded number of cuts."),
        p("Quand les biens ne peuvent plus être coupés, comme des objets, le critère sans envie ne peut plus toujours être respecté : c’est l’objet du partage équitable de biens indivisibles. La référence qui sert ici est A. Procaccia, Cake Cutting Algorithms (sections 13.2 et 13.3).",
          "When the goods can no longer be cut, as with objects, the envy-free criterion can no longer always be met: this is the subject of fair division of indivisible goods. The reference used here is A. Procaccia, Cake Cutting Algorithms (sections 13.2 and 13.3).") ] },
    ],
  },
  "fair-goods-gallery": {
    facts: [
      [p("Problème", "Problem"), p("Répartir des objets qu’on ne peut pas découper, sans argent", "Allocating goods that cannot be cut, without money")],
      [p("Étudié par", "Studied by"), p("Lipton, Markakis, Mossel et Saberi, 2004", "Lipton, Markakis, Mossel and Saberi, 2004")],
      [p("Domaine", "Field"), p("Partage équitable, informatique théorique", "Fair division, theoretical computer science")],
      [p("Résultat clé", "Key result"), p("Sans envie impossible en général ; « sans envie à un objet près » toujours réalisable", "Envy-freeness impossible in general; “envy-free up to one good” always achievable")],
    ],
    lead: [
      p("Le partage équitable d’objets indivisibles traite des situations où les biens à répartir ne se coupent pas : un ours en peluche, un livre, un instrument. Chaque personne attribue à chaque objet une valeur privée, et l’on cherche une répartition où personne n’a de raison sérieuse de se plaindre.",
        "Fair allocation of indivisible goods deals with situations where the goods to be shared cannot be cut: a teddy bear, a book, an instrument. Each person gives each good a private value, and the aim is an allocation in which nobody has serious grounds for complaint."),
    ],
    sections: [
      { h: p("Une impossibilité", "An impossibility"), p: [
        p("Pour un gâteau, le critère « sans envie » (chacun préfère son lot ou lui est indifférent) peut toujours être respecté. Pour des objets, ce n’est plus vrai. S’il n’y a qu’un seul objet que les deux personnes veulent, une seule le reçoit, et l’autre envie son lot, quoi qu’on fasse : sans argent, sans partage de l’objet et sans tirage au sort, l’absence d’envie est impossible pour tous les profils de valeurs.",
          "For a cake the “envy-free” criterion (everyone prefers their bundle or is indifferent) can always be met. For goods this is no longer true. If a single good is wanted by both people, one receives it and the other envies that bundle, whatever is done: with no money, no splitting of the good and no lottery, envy-freeness is impossible for every profile of values.") ] },
      { h: p("Un critère affaibli : EF1", "A weakened criterion: EF1"), p: [
        p("On se contente donc d’une règle plus faible, « sans envie à un objet près » (EF1, pour envy-free up to one good). Une personne i peut envier une personne j, mais l’envie de i disparaîtrait si l’on retirait au plus un objet du lot de j. Ce retrait n’est qu’un test de comparaison, pas une confiscation réelle.",
          "A weaker rule is therefore used, “envy-free up to one good” (EF1). A person i may envy a person j, but i’s envy would vanish if at most one good were removed from j’s bundle. This removal is only a test for comparison, not an actual confiscation."),
        p("EF1 ne garantit ni l’absence totale d’envie, ni la proportionnalité exacte. Elle s’applique avec des valeurs additives et non négatives.",
          "EF1 guarantees neither the complete absence of envy nor exact proportionality. It applies with additive, nonnegative values.") ] },
      { h: p("Deux méthodes qui l’atteignent", "Two methods that achieve it"), p: [
        p("Dans la première, on distribue les objets un par un, chaque objet allant à une personne que personne n’envie pour l’instant (quand deux personnes sont dans ce cas, celle qui l’estime le plus le reçoit). À chaque étape, l’envie qui peut exister porte sur un lot dont le dernier objet ajouté suffirait à l’expliquer, d’où EF1.",
          "In the first, the goods are handed out one at a time, each going to someone whom nobody envies at that moment (when two people qualify, the one who values it more receives it). At each step any existing envy is aimed at a bundle whose latest added good accounts for it, hence EF1."),
        p("Dans la seconde, les personnes choisissent à tour de rôle leur objet préféré parmi ceux qui restent. Avec deux personnes, chaque choix ultérieur de l’une peut être apparié à un choix antérieur de l’autre au moins aussi bien estimé : il ne reste, au plus, que le premier choix de la seconde personne, que le retrait d’un objet suffit à écarter.",
          "In the second, the people take turns choosing their favourite remaining good. With two people, each later pick by one can be paired with an earlier pick by the other valued at least as highly: at most the other person’s first pick remains unmatched, and removing one good removes it.") ] },
      { h: p("Histoire et portée", "History and scope"), p: [
        p("Lipton, Markakis, Mossel et Saberi étudient en 2004 des allocations à envie bornée quand les biens ne peuvent pas être divisés. Leur résultat s’étend à un nombre quelconque de personnes.",
          "Lipton, Markakis, Mossel and Saberi studied bounded-envy allocations in 2004 when goods cannot be divided. Their result extends to any number of people."),
        p("Un exemple à deux personnes et cinq objets illustre le mécanisme : le dernier objet distribué peut laisser un peu d’envie, mais il suffit de lui retirer l’objet envié pour la faire disparaître. Indivisible ne signifie pas injuste dans tous les cas : cela empêche seulement une garantie sans envie pour tous les profils.",
          "An example with two people and five goods shows the mechanism: the last good handed out may leave some envy, but removing the envied good makes it vanish. Indivisible does not mean unfair in every case: it only prevents an envy-free guarantee for every profile.") ] },
      EXPLAINER,
    ],
  },
  "hairy-ball-gallery": {
    facts: [
      [p("Énoncé", "Statement"), p("Un champ tangent continu sur la sphère S² s’annule au moins une fois", "A continuous tangent field on the sphere S² vanishes at least once")],
      [p("Dates", "Dates"), p("Poincaré, 1885 ; Brouwer, 1912", "Poincaré, 1885; Brouwer, 1912")],
      [p("Domaine", "Field"), p("Topologie", "Topology")],
      [p("Invariant clé", "Key invariant"), p("Somme des indices des zéros = caractéristique d’Euler (2 pour la sphère)", "Sum of the indices of the zeros = Euler characteristic (2 for the sphere)")],
      [p("Statut", "Status"), p("Théorème démontré", "Proved theorem")],
    ],
    lead: [
      p("Le théorème de la boule chevelue affirme qu’on ne peut pas peigner une sphère couverte de cheveux sans laisser au moins un épi : tout champ de vecteurs continu et tangent à la sphère S² s’annule en au moins un point. Chaque cheveu représente le vecteur du champ en son point ; il disparaît là où le champ est nul.",
        "The hairy ball theorem states that a sphere covered with hair cannot be combed flat without leaving at least one cowlick: every continuous vector field tangent to the sphere S² vanishes at at least one point. Each hair represents the vector of the field at its point, and disappears where the field is zero."),
    ],
    sections: [
      { h: p("Énoncé et hypothèses", "Statement and assumptions"), p: [
        p("Les hypothèses sont essentielles. Le champ doit être continu et tangent à une sphère de dimension paire. Un champ constant non nul dans l’espace n’est pas tangent à toute la sphère, et le théorème ne dit donc pas que tout champ de l’espace s’annule. Il exige au moins un zéro, pas exactement un : le champ identiquement nul en a une infinité.",
          "The assumptions are essential. The field must be continuous and tangent to an even-dimensional sphere. A nonzero constant field in space is not tangent to the whole sphere, so the theorem does not say every field in space vanishes. It requires at least one zero, not exactly one: the identically zero field has infinitely many."),
        p("Deux familles de champs sur S² servent d’exemples : la projection v(p) = a − (a·p)p d’un vecteur fixe a, et la rotation v(p) = a × p autour de l’axe a. Pour a unitaire, les deux ont exactement deux zéros, en p = a et p = −a.",
          "Two families of fields on S² serve as examples: the projection v(p) = a − (a·p)p of a fixed vector a, and the rotation v(p) = a × p about the axis a. For a unit vector a, both have exactly two zeros, at p = a and p = −a.") ] },
      { h: p("L’indice d’un zéro", "The index of a zero"), p: [
        p("L’indice d’un zéro compte les tours que fait la direction du champ quand on parcourt une fois un petit lacet autour de lui. Il vaut +1 pour une source, un puits ou un centre, et −1 pour un col. Le zéro double d’un champ à un seul zéro a pour indice +2.",
          "The index of a zero counts the turns made by the direction of the field along one loop around it. It is +1 for a source, a sink or a centre, and −1 for a saddle. The double zero of a field with a single zero has index +2."),
        p("Le théorème de Poincaré-Hopf affirme que la somme des indices des zéros égale la caractéristique d’Euler de la surface, χ(S²) = 2. Comme 2 ≠ 0, il y a au moins un zéro. Un tore, de caractéristique 0, se peigne sans épi.",
          "The Poincaré-Hopf theorem states that the indices of the zeros add up to the Euler characteristic of the surface, χ(S²) = 2. Since 2 ≠ 0, there is at least one zero. A torus, of characteristic 0, can be combed flat.") ] },
      { h: p("Un argument par le degré", "An argument by degree"), p: [
        p("Si un champ tangent v ne s’annulait jamais, on pourrait le normaliser. L’application H(p, t) = cos(πt)·p + sin(πt)·v(p) resterait sur la sphère et déformerait continûment l’identité en l’application antipodale p ↦ −p. Or les degrés de ces deux applications valent 1 et (−1)^(d+1) sur la sphère de dimension d, différents quand d est pair. C’est impossible.",
          "If a tangent field v never vanished, it could be normalised. The map H(p, t) = cos(πt)·p + sin(πt)·v(p) would stay on the sphere and deform the identity continuously into the antipodal map p ↦ −p. But the degrees of these two maps are 1 and (−1)^(d+1) on the sphere of dimension d, different when d is even. This is impossible."),
        p("En dimension impaire, rien de tel : sur S^(2k+1), le champ (−x₂, x₁, −x₄, x₃, …) est continu, tangent et de norme 1. Sur le cercle S¹, toutes les flèches suivent le même sens sans s’annuler.",
          "In odd dimension nothing of the kind happens: on S^(2k+1), the field (−x₂, x₁, −x₄, x₃, …) is continuous, tangent and of length 1. On the circle S¹, all arrows can follow the same direction without vanishing.") ] },
      { h: p("Histoire et applications", "History and applications"), p: [
        p("Henri Poincaré établit le résultat en 1885 et L. E. J. Brouwer le démontre en 1912 sous une forme générale. Heinz Hopf en donne la généralisation par la caractéristique d’Euler, d’où le nom de Poincaré-Hopf. Le degré fournit une obstruction globale qu’une vue locale des flèches ne révèle pas.",
          "Henri Poincaré establishes the result in 1885 and L. E. J. Brouwer proves it in 1912 in general form. Heinz Hopf gives the generalisation through the Euler characteristic, hence the name Poincaré-Hopf. Degree provides a global obstruction that a local view of the arrows does not reveal."),
        p("Une illustration courante est météorologique : un champ de vent continu sur la surface de la Terre a toujours un point de vent horizontal nul, comme le centre d’un cyclone ou d’un anticyclone. Les figures de peignage n’illustrent le théorème que sur des exemples : les flèches échantillonnées ne constituent pas la preuve.",
          "A common illustration is meteorological: a continuous wind field over the surface of the Earth always has a point of zero horizontal wind, such as the eye of a cyclone or of an anticyclone. Combing figures illustrate the theorem on examples only: sampled arrows do not constitute the proof.") ] },
    ],
  },
  "nonorientable-surfaces-gallery": {
    facts: [
      [p("Objets", "Objects"), p("Ruban de Möbius, bouteille de Klein", "Möbius strip, Klein bottle")],
      [p("Découverts", "Discovered"), p("Möbius et Listing, 1858 ; Klein, 1882", "Möbius and Listing, 1858; Klein, 1882")],
      [p("Domaine", "Field"), p("Topologie des surfaces", "Topology of surfaces")],
      [p("Propriété clé", "Key property"), p("Aucun choix continu d’orientation locale sur toute la surface", "No continuous choice of local orientation on the whole surface")],
      [p("Bord", "Boundary"), p("Möbius : un bord ; Klein : aucun", "Möbius: one boundary; Klein: none")],
    ],
    lead: [
      p("Une surface est non orientable lorsqu’on ne peut pas choisir continûment, en chacun de ses points, un côté de la surface : une normale choisie localement revient avec le signe opposé après un tour bien choisi. Les deux exemples classiques sont le ruban de Möbius, qui a un bord, et la bouteille de Klein, qui est fermée.",
        "A surface is nonorientable when one cannot choose continuously, at each of its points, a side of the surface: a locally chosen normal returns with the opposite sign after a suitable trip around. The two classical examples are the Möbius strip, which has a boundary, and the Klein bottle, which is closed."),
    ],
    sections: [
      { h: p("Des rectangles aux surfaces", "From rectangles to surfaces"), p: [
        p("Une surface se décrit par un rectangle dont on identifie des côtés. Pour le ruban de Möbius, on recolle (u = 2π, v) avec (u = 0, −v) : la couture retourne la largeur. Il reste un seul bord avant toute coupe. Pour la bouteille de Klein, on recolle de la même façon (2π, v) ~ (0, −v), et aussi (u, 2π) ~ (u, 0) : la surface n’a aucun bord.",
          "A surface is described by a rectangle whose sides are identified. For the Möbius strip, (u = 2π, v) is glued to (u = 0, −v): the seam flips the width. One boundary remains before any cut. For the Klein bottle, (2π, v) ~ (0, −v) is glued in the same way, and also (u, 2π) ~ (u, 0): the surface has no boundary."),
        p("Ces identifications permettent de comparer les surfaces sans confondre leur topologie avec leur réalisation dans l’espace.",
          "These identifications allow surfaces to be compared without mistaking their topology for their realisation in space.") ] },
      { h: p("L’orientation", "Orientation"), p: [
        p("Sur un ruban de Möbius, une normale transportée tout le long de la ligne centrale revient avec le signe opposé, parce que la couture identifie v avec −v. Localement, un choix de normale est toujours possible ; globalement, il ne l’est pas.",
          "On a Möbius strip, a normal carried along the centreline returns with the opposite sign, because the seam identifies v with −v. Locally a choice of normal is always possible; globally it is not.") ] },
      { h: p("Couper une surface", "Cutting a surface"), p: [
        p("Couper change la surface. La coupe centrale d’un ruban de Möbius donne une seule composante, orientable, avec deux bords. La coupe au tiers de la largeur, poursuivie jusqu’à la fermeture de la trajectoire, donne un ruban de Möbius et un cylindre, soit trois bords au total. Une bouteille de Klein intacte n’a aucun bord ; coupée le long d’un méridien (u = 0), elle donne un cylindre à deux bords.",
          "Cutting changes the surface. The centre cut of a Möbius strip gives a single orientable component with two boundaries. A cut at one third of the width, continued until the path closes, gives a Möbius strip and a cylinder, three boundaries in all. An uncut Klein bottle has no boundary; cut along a meridian (u = 0), it gives a cylinder with two boundaries."),
        p("Ces affirmations se vérifient en recollant les bords des rectangles ; elles se calculent sur un maillage de la surface, par la caractéristique d’Euler V − E + F, les composantes du bord et la cohérence des orientations. Elles ne se déduisent pas de la silhouette d’une image.",
          "These statements are checked by gluing the edges of the rectangles; they are computed on a mesh of the surface, using the Euler characteristic V − E + F, the boundary components and the consistency of orientations. They are not deduced from the silhouette of a picture.") ] },
      { h: p("Immersion et plongement", "Immersion and embedding"), p: [
        p("La bouteille de Klein ne se réalise dans l’espace à trois dimensions qu’avec des auto-intersections : c’est une immersion, par exemple l’immersion « en huit » décrite par Hermann Karcher. Le croisement visible n’est ni un bord ni une soudure : les deux voisinages restent séparés sur la surface abstraite, et rien ne permet de passer d’une feuille à l’autre. En dimension quatre, la bouteille de Klein se plonge sans croisement. Le ruban de Möbius, lui, se plonge dans l’espace ordinaire.",
          "The Klein bottle can be realised in three-dimensional space only with self-intersections: it is an immersion, for example the figure-eight immersion described by Hermann Karcher. The visible crossing is neither a boundary nor a welded joint: the two neighbourhoods remain separate on the abstract surface, and nothing allows a passage from one sheet to the other. In four dimensions the Klein bottle embeds with no crossing. The Möbius strip embeds in ordinary space.") ] },
      { h: p("Histoire", "History"), p: [
        p("August Ferdinand Möbius et Johann Benedict Listing décrivent le ruban en 1858, chacun de son côté. Felix Klein introduit la bouteille qui porte son nom en 1882. Ces surfaces ont ouvert la classification des surfaces, où l’orientabilité et la caractéristique d’Euler jouent un rôle central.",
          "August Ferdinand Möbius and Johann Benedict Listing describe the strip in 1858, each independently. Felix Klein introduces the bottle that bears his name in 1882. These surfaces opened the classification of surfaces, in which orientability and the Euler characteristic play a central role.") ] },
    ],
  },
  "banach-tarski-gallery": {
    facts: [
      [p("Auteurs", "Authors"), p("Stefan Banach et Alfred Tarski, 1924, sur des idées de Hausdorff (1914)", "Stefan Banach and Alfred Tarski, 1924, building on ideas of Hausdorff (1914)")],
      [p("Domaine", "Field"), p("Théorie de la mesure, théorie des ensembles, groupes de rotations", "Measure theory, set theory, rotation groups")],
      [p("Énoncé", "Statement"), p("Une boule de R³ se partage en un nombre fini de morceaux qui, déplacés, forment deux boules identiques", "A ball in R³ splits into finitely many pieces which, moved, form two identical balls")],
      [p("Hypothèse", "Assumption"), p("Axiome du choix", "Axiom of choice")],
      [p("Statut", "Status"), p("Théorème ; preuve mécanisée publiée en 2022", "Theorem; mechanised proof published in 2022")],
    ],
    lead: [
      p("Le paradoxe de Banach-Tarski affirme que, dans les mathématiques usuelles et avec l’axiome du choix, une boule pleine de l’espace R³ se partage en un nombre fini de sous-ensembles que des déplacements rigides réassemblent en deux copies disjointes de la boule de départ. Le résultat date de 1924.",
        "The Banach-Tarski paradox states that, in usual mathematics and with the axiom of choice, a solid ball in R³ has a finite partition into subsets which rigid motions reassemble into two disjoint copies of the original ball. The result dates from 1924."),
    ],
    sections: [
      { h: p("Pourquoi ce n’est pas une contradiction", "Why it is not a contradiction"), p: [
        p("Des morceaux ordinaires, qui ont un volume, ne peuvent pas doubler : déplacer ne change pas le volume, et deux moitiés ne font qu’une boule. Les morceaux du théorème ne sont pas de cette espèce : ce sont des nuages infinis de points si dispersés qu’aucun volume ne peut leur être attribué. Si tous avaient un volume, l’additivité finie et l’invariance par déplacement donneraient V = 2V avec V > 0.",
          "Ordinary pieces, which have a volume, cannot double: moving does not change volume, and two halves make only one ball. The pieces in the theorem are not of that kind: they are infinite clouds of points so scattered that no volume can be assigned to them. If all had a volume, finite additivity and invariance under motion would give V = 2V with V > 0."),
        p("Une partition finie signifie un nombre fini de sous-ensembles, et non des sous-ensembles finis. Le théorème ne contredit donc pas l’invariance du volume pour les morceaux mesurables. Il montre que l’on ne peut pas donner à tous les sous-ensembles de l’espace un volume finiment additif et invariant qui prolonge le volume usuel.",
          "A finite partition means finitely many subsets, not finite subsets. The theorem therefore does not contradict the invariance of volume for measurable pieces. It shows that not every subset of space can be given a finitely additive, invariant volume extending ordinary volume.") ] },
      { h: p("Le cœur combinatoire : un arbre qui se dédouble", "The combinatorial core: a tree that doubles"), p: [
        p("Le principe se voit sur un arbre infini où chaque sommet a quatre voisins, dont les sommets sont les mots réduits écrits avec a, b et leurs inverses A, B. Un mot qui ne commence pas par a s’écrit a·w, avec w commençant par A, donc l’arbre entier F vérifie F = W(a) ⊔ a·W(A), où W(x) désigne les mots commençant par x. De même F = W(b) ⊔ b·W(B).",
          "The principle shows on an infinite tree in which every vertex has four neighbours, whose vertices are the reduced words written with a, b and their inverses A, B. A word not beginning with a is written a·w, with w beginning with A, so the whole tree F satisfies F = W(a) ⊔ a·W(A), where W(x) denotes the words beginning with x. Likewise F = W(b) ⊔ b·W(B)."),
        p("Quatre morceaux, déplacés par a et b, refont donc deux arbres entiers : seul le sommet de départ reste en trop. C’est un paradoxe du groupe libre, qui ne demande ni boule, ni volume, ni axiome du choix. Sur un arbre fini, rien ne se dédouble : le paradoxe vit dans l’infini.",
          "Four pieces, moved by a and b, therefore rebuild two whole trees: only the starting vertex is left over. This is a paradox of the free group, which needs no ball, no volume and no axiom of choice. On a finite tree nothing doubles: the paradox lives in the infinite.") ] },
      { h: p("De l’arbre à la boule", "From the tree to the ball"), p: [
        p("Deux rotations d’angle arccos(1/3) autour de deux axes perpendiculaires engendrent un groupe libre de rotations (résultat classique, exposé dans Wagon, 1985). Hors un ensemble dénombrable de points fixes, ce groupe fait de chaque orbite sur la sphère une copie de l’arbre.",
          "Two rotations by the angle arccos(1/3) about two perpendicular axes generate a free group of rotations (a classical result, set out in Wagon, 1985). Outside a countable set of fixed points, this group turns every orbit on the sphere into a copy of the tree."),
        p("L’axiome du choix permet de choisir un point dans chaque orbite ; cet ensemble de représentants, que nul ne peut décrire, transporte la décomposition de l’arbre sur la sphère, puis sur la boule (les points fixes et le centre demandent un traitement à part). L’axiome du choix affirme que, dans toute famille d’ensembles non vides, on peut choisir un élément de chacun, même sans règle pour le faire.",
          "The axiom of choice lets one pick a point in each orbit; this set of representatives, which nobody can describe, carries the tree decomposition over to the sphere and then to the ball (the fixed points and the centre need separate treatment). The axiom of choice states that from any family of nonempty sets one can pick an element of each, even with no rule for doing so.") ] },
      { h: p("Le rôle de la dimension", "The role of dimension"), p: [
        p("La dimension 3 est essentielle. Le groupe des déplacements du plan ne contient aucun groupe libre à deux générateurs, et en dimension 1 et 2 il existe, comme Banach l’a montré en 1923, un volume invariant défini sur tous les ensembles. Les morceaux du paradoxe n’existent donc qu’en dimension 3 ou plus.",
          "Dimension 3 is essential. The group of motions of the plane contains no free group on two generators, and in dimensions 1 and 2 there is, as Banach showed in 1923, a motion-invariant volume defined on all sets. The pieces of the paradox therefore exist only in dimension 3 or more.") ] },
      { h: p("Histoire et lecture du résultat", "History and reading of the result"), p: [
        p("Hausdorff donne en 1914 un paradoxe sur la sphère privée d’un ensemble dénombrable de points ; Banach et Tarski l’étendent à la boule en 1924. Raphael Robinson montre en 1947 que cinq morceaux suffisent, et que ce nombre est minimal. Une preuve mécanisée publiée en 2022 par Bapanapally et Gamboa explicite le groupe libre de rotations et l’axiome du choix.",
          "Hausdorff gives in 1914 a paradox on the sphere minus a countable set of points; Banach and Tarski extend it to the ball in 1924. Raphael Robinson shows in 1947 that five pieces suffice, and that this number is minimal. A mechanised proof published in 2022 by Bapanapally and Gamboa makes explicit the free group of rotations and the axiom of choice."),
        p("Le théorème n’est pas un procédé physique : la matière est faite d’un nombre fini d’atomes, et aucun outil ne peut isoler des morceaux sans volume. Le choix intervient dans une preuve d’existence, non dans des instructions exécutables sur les points d’un objet matériel.",
          "The theorem is not a physical procedure: matter is made of finitely many atoms, and no tool can isolate pieces without volume. Choice enters an existence proof, not executable instructions on the points of a physical object.") ] },
      EXPLAINER,
    ],
  },
  gomboc: {
    facts: [
      [p("Question posée par", "Question posed by"), p("V. I. Arnold", "V. I. Arnold")],
      [p("Construit par", "Constructed by"), p("Péter Várkonyi et Gábor Domokos, 2006", "Péter Várkonyi and Gábor Domokos, 2006")],
      [p("Domaine", "Field"), p("Géométrie, équilibres, mécanique du roulement", "Geometry, equilibria, rolling mechanics")],
      [p("Propriété", "Property"), p("Corps convexe homogène à un seul équilibre stable et un seul instable", "Convex homogeneous body with a single stable and a single unstable equilibrium")],
      [p("Statut", "Status"), p("Existence démontrée (2006)", "Existence proved (2006)")],
    ],
    lead: [
      p("Le Gömböc est un corps convexe homogène (de densité uniforme) qui n’a qu’un seul équilibre stable et un seul équilibre instable lorsqu’il est posé sur un plan horizontal. Posé n’importe comment, il roule jusqu’à l’unique position de repos stable. On dit d’un tel corps qu’il est mono-monostatique. Son nom vient du hongrois gömb, « sphère ».",
        "The Gömböc is a convex homogeneous body (of uniform density) which has only one stable and one unstable equilibrium when resting on a horizontal plane. Placed in any way, it rolls until it reaches the single stable rest position. Such a body is called mono-monostatic. Its name comes from the Hungarian gömb, “sphere”."),
    ],
    sections: [
      { h: p("La question", "The question"), p: [
        p("Un culbuto se redresse grâce à une masse cachée. Le Gömböc répond à une question différente : une densité uniforme et une forme convexe peuvent-elles suffire à n’avoir qu’un équilibre stable et un instable ? Une sphère n’est pas un exemple, car toutes ses orientations sont des équilibres neutres. Les galets et les dés, eux, ont au moins deux équilibres stables.",
          "A weighted self-righting toy relies on a hidden mass. The Gömböc answers a different question: can uniform density and a convex shape be enough to give only one stable and one unstable equilibrium? A sphere is not an example, since all of its orientations are neutral equilibria. Pebbles and dice have at least two stable equilibria.") ] },
      { h: p("Dans le plan, c’est impossible", "In the plane it is impossible"), p: [
        p("V. I. Arnold demande s’il existe un corps convexe homogène à un seul équilibre stable et un seul instable. Dans le plan, la réponse est non : le théorème des quatre sommets impose à un corps plan convexe homogène au moins quatre équilibres, deux stables et deux instables.",
          "V. I. Arnold asks whether a convex homogeneous body can have only one stable and one unstable equilibrium. In the plane the answer is no: the four-vertex theorem forces a convex homogeneous planar body to have at least four equilibria, two stable and two unstable.") ] },
      { h: p("Dans l’espace, c’est possible", "In space it is possible"), p: [
        p("Pour un corps convexe dont le centre de gravité est l’origine, les équilibres sont les points critiques de la distance R(θ, φ) à l’origine : minima stables, maxima instables, selles. Le théorème de Poincaré-Hopf impose seulement S + U − H = 2, où S, U, H comptent les minima, les maxima et les selles. Le triplet (1, 1, 0) est donc admissible, et le Gömböc le réalise.",
          "For a convex body whose centre of gravity is the origin, the equilibria are the critical points of the distance R(θ, φ) to the origin: stable minima, unstable maxima, saddles. The Poincaré-Hopf theorem only requires S + U − H = 2, where S, U, H count minima, maxima and saddles. The triple (1, 1, 0) is therefore admissible, and the Gömböc achieves it."),
        p("En 2006, Várkonyi et Domokos construisent une famille de surfaces lisses R(θ, φ) = 1 + d·ΔR et montrent que, pour des paramètres c ≈ 0,275 et d très petit, le corps est convexe, son centre de gravité est l’origine et la surface n’a que deux points critiques, les pôles. La courbe ΔR = 0, en forme de couture de balle de tennis, sépare la partie mince de la partie épaisse.",
          "In 2006, Várkonyi and Domokos build a family of smooth surfaces R(θ, φ) = 1 + d·ΔR and show that, for parameters c ≈ 0.275 and d very small, the body is convex, its centre of gravity is the origin and the surface has only two critical points, the poles. The curve ΔR = 0, shaped like the seam of a tennis ball, separates the thin part from the thick part.") ] },
      { h: p("Une sphère à 0,002 % près", "A sphere to within 0.002 %"), p: [
        p("La convexité exige que d·|ΔR″| reste inférieur à 1 près des pôles, où les dérivées secondes de ΔR sont très grandes. Les auteurs trouvent d < 5·10⁻⁵. Avec d = 2·10⁻⁵, le corps est une sphère à 0,002 % près : la forme est presque invisible. Les auteurs soulignent qu’on ne sait pas si d’autres corps mono-monostatiques, bien plus éloignés de la sphère, existent.",
          "Convexity requires d·|ΔR″| to stay below 1 near the poles, where the second derivatives of ΔR are very large. The authors find d < 5·10⁻⁵. With d = 2·10⁻⁵ the body is a sphere to within 0.002 %: the shape is almost invisible. The authors stress that it is not known whether other mono-monostatic bodies, much farther from a sphere, exist."),
        p("Un corps plus visible peut se décrire par sa fonction d’appui h(ν), la hauteur du centre de gravité au-dessus d’un plan posé contre lui avec la normale ν. Ses équilibres sont les points critiques de h, et il est convexe exactement quand Hess h + h, la matrice des rayons de courbure, est positive. Un corps de ce type a été calculé numériquement pour cette exposition, par optimisation sous les mêmes conditions (convexe, deux points critiques, centre de gravité à l’origine) : il est vérifié numériquement, non démontré, et ne provient pas de la littérature citée.",
          "A more visible body can be described by its support function h(ν), the height of the centre of gravity above a plane resting against it with normal ν. Its equilibria are the critical points of h, and it is convex exactly when Hess h + h, the matrix of radii of curvature, is positive. A body of this kind was computed numerically for this exhibition, by optimisation under the same conditions (convex, two critical points, centre of gravity at the origin): it is verified numerically, not proved, and does not come from the literature cited.") ] },
      { h: p("Le mouvement de roulement", "Rolling motion"), p: [
        p("Le corps roule sans glisser sur le plan. La conservation de l’énergie ½|v|² + ½ωᵀIω + gH, où H est la hauteur du centre de gravité, tient sans résistance de roulement : le corps oscille alors sans fin. Une résistance au roulement retire de l’énergie et le ramène au pôle stable ; le pôle instable ne tient que si le corps y est posé exactement.",
          "The body rolls without slipping on the plane. Conservation of the energy ½|v|² + ½ωᵀIω + gH, where H is the height of the centre of gravity, holds without rolling resistance: the body then oscillates for ever. Rolling resistance removes energy and brings the body back to the stable pole; the unstable pole holds only if the body is placed exactly on it."),
        p("Pour un corps de cette famille, les forces de rappel sont de l’ordre de d et les périodes d’oscillation durent plusieurs minutes. Un corps réel serait presque impossible à fabriquer avec la précision requise, et le modèle ignore la déformation et le frottement réel. Domokos et Várkonyi ont aussi étudié la forme de carapaces de tortues qui se retournent seules (2008).",
          "For a body of this family the restoring forces are of the order of d and the oscillation periods last several minutes. A real body would be almost impossible to manufacture with the precision required, and the model ignores deformation and real friction. Domokos and Várkonyi have also studied the shape of turtle shells that right themselves (2008).") ] },
    ],
  },
  "mirrored-rooms": {
    facts: [
      [p("Problème", "Problem"), p("Une lampe dans une pièce aux murs miroirs éclaire-t-elle toute la pièce ?", "Does a lamp in a room with mirrored walls light the whole room?")],
      [p("Pièce courbe", "Curved room"), p("L. S. et R. Penrose, 1958 (demi-ellipses)", "L. S. and R. Penrose, 1958 (half-ellipses)")],
      [p("Pièce polygonale", "Polygonal room"), p("Tokarsky, 1995 (26 côtés) ; Wolecki (22 côtés)", "Tokarsky, 1995 (26 sides); Wolecki (22 sides)")],
      [p("Polygones rationnels", "Rational polygons"), p("Lelièvre, Monteil et Weiss, 2016 : un nombre fini de points non éclairés", "Lelièvre, Monteil and Weiss, 2016: finitely many unilluminated points")],
      [p("Statut", "Status"), p("Polygones irrationnels : problème général ouvert", "Irrational polygons: general problem open")],
    ],
    lead: [
      p("Le problème de l’illumination demande si une source ponctuelle de lumière, placée dans une pièce dont les murs sont des miroirs, éclaire toute la pièce. Les rayons se propagent en ligne droite et se réfléchissent selon la loi v′ = v − 2(v·n)n, où n est une normale unitaire au mur : la composante tangentielle du rayon est conservée, la composante normale change de signe, et l’angle d’incidence égale l’angle de réflexion.",
        "The illumination problem asks whether a point source of light, placed in a room whose walls are mirrors, lights the whole room. Rays travel in straight lines and reflect by the law v′ = v − 2(v·n)n, where n is a unit normal to the wall: the tangential component of the ray is kept, the normal component changes sign, and the angle of incidence equals the angle of reflection."),
      p("À un coin, aucune normale unique ne définit une réflexion : les trajectoires s’y arrêtent. Le modèle est géométrique : la diffraction physique des ondes lui est étrangère.",
        "At a corner no unique normal defines a reflection, so trajectories stop there. The model is geometric: the physical diffraction of waves does not belong to it."),
    ],
    sections: [
      { h: p("La pièce de Penrose, 1958", "Penrose’s room, 1958"), p: [
        p("En 1958, Lionel et Roger Penrose construisent une pièce aux murs courbes qui n’est pas entièrement éclairable. Elle associe deux demi-ellipses et deux petits renfoncements entourant les foyers. Une bougie allumée dans un renfoncement laisse toute une région dans le noir.",
          "In 1958 Lionel and Roger Penrose construct a room with curved walls that cannot be wholly lit. It combines two half-ellipses and two small recesses placed around the foci. A candle lit in one recess leaves a whole region dark."),
        p("L’explication vient de l’ellipse : un rayon issu d’un foyer se réfléchit en passant par l’autre foyer, et un rayon qui passe à l’extérieur de ses deux foyers repasse à l’extérieur après un reflet. Partie de là, la lumière ne passe jamais entre les foyers pour descendre. Dans la reconstruction présentée ici, les demi-axes sont 5 et 3, donc les foyers sont en ±4.",
          "The explanation lies in the ellipse: a ray from one focus reflects through the other focus, and a ray passing outside its two foci passes outside them again after a reflection. Starting there, light never passes between the foci to go down. In the reconstruction shown here the semi-axes are 5 and 3, so the foci are at ±4.") ] },
      { h: p("Des murs droits", "Straight walls"), p: [
        p("Avec des murs droits, la situation est plus subtile. En 1995, Serge Tokarsky publie une pièce polygonale à 26 côtés contenant deux points qui ne s’éclairent pas l’un l’autre. Wolecki donne un exemple à 22 côtés dans un texte révisé en novembre 2024, mais ce nombre est une borne supérieure, pas un minimum démontré.",
          "With straight walls the situation is subtler. In 1995 Serge Tokarsky publishes a 26-sided polygonal room containing two points that do not light each other. Wolecki gives a 22-sided example in a text revised in November 2024, but that number is an upper bound, not a proved minimum."),
        p("Ces deux constructions répondent à des questions différentes : avec des miroirs courbes, une région entière peut rester sombre ; dans une pièce polygonale, c’est un couple de points qui peut ne pas s’éclairer, et non une région. Les pièces polygonales construites vivent sur un quadrillage de triangles rectangles isocèles.",
          "These two constructions answer different questions: with curved mirrors a whole region may stay dark; in a polygonal room it is a pair of points that may fail to light each other, not a region. The polygonal rooms constructed live on a lattice of isosceles right triangles.") ] },
      { h: p("Le dépliage", "Unfolding"), p: [
        p("Dans une pièce polygonale, le dépliage remplace chaque réflexion par une copie symétrique de la pièce : la trajectoire réfléchie devient un segment droit. Une preuve doit alors examiner toutes les directions possibles, y compris celles qu’un dessin fini ne montre pas. Un pixel non visité n’est pas un point prouvé sombre.",
          "In a polygonal room, unfolding replaces each reflection by a reflected copy of the room: the reflected path becomes a straight segment. A proof must then examine all possible directions, including those a finite drawing does not show. An unvisited pixel is not a point proved dark.") ] },
      { h: p("Polygones rationnels", "Rational polygons"), p: [
        p("Un polygone est rationnel si ses angles sont des multiples rationnels de π. Lelièvre, Monteil et Weiss montrent en 2016 que, dans un tel polygone, toute source n’a qu’un nombre fini de points non éclairés. Wolecki démontre le résultat plus fort que l’ensemble des couples non éclairants est fini pour un polygone rationnel à intérieur connexe : toute source hors d’un ensemble fini éclaire tous les points non singuliers.",
          "A polygon is rational if its angles are rational multiples of π. Lelièvre, Monteil and Weiss show in 2016 that in such a polygon every source has only finitely many unilluminated points. Wolecki proves the stronger result that the set of nonilluminating pairs is finite for a rational polygon with connected interior: every source outside a finite set lights all nonsingular points."),
        p("Ces résultats ne portent pas sur les miroirs courbes de Penrose et ne règlent pas le problème général des polygones irrationnels.",
          "These results do not concern Penrose’s curved mirrors and do not settle the general problem of irrational polygons.") ] },
      { h: p("Origine du problème", "Origin of the problem"), p: [
        p("La question d’une pièce polygonale illuminable depuis chacun de ses points est attribuée à Ernst Straus (années 1950) et popularisée par Victor Klee. Les pièces de Penrose et de Tokarsky montrent que la réponse générale est négative, tandis que les théorèmes sur les polygones rationnels précisent que les points sombres y restent rares.",
          "The question of a polygonal room that can be lit from each of its points is credited to Ernst Straus (1950s) and popularised by Victor Klee. The rooms of Penrose and Tokarsky show that the general answer is negative, while the theorems on rational polygons specify that dark points remain rare there.") ] },
      EXPLAINER,
    ],
  },
};
