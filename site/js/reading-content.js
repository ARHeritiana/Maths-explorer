// Texts of the "Lire" section: biographies and stories. Every string is a pair [French, English]. `links` are site
// addresses; the pages linked to show a link back (reading.js `relatedTo`), so each cross-reference is written once.
// Facts are kept to what the listed sources state; where accounts differ, the text says so.
const P = (fr, en) => [fr, en];

export const BIOGRAPHIES = [
  {
    id: "gauss",
    name: "Carl Friedrich Gauss",
    dates: "1777-1855",
    places: P("Brunswick, Göttingen", "Brunswick, Göttingen"),
    dek: P("Le fils d’un artisan de Brunswick qui a renouvelé l’arithmétique, la géométrie, l’astronomie et l’étude des erreurs de mesure.", "A Brunswick craftsman’s son who renewed arithmetic, geometry, astronomy and the study of measurement errors."),
    facts: [
      ["1777", P("Naissance à Brunswick, le 30 avril, dans une famille modeste.", "Born in Brunswick on 30 April, into a family of modest means.")],
      ["1792", P("Le duc de Brunswick finance ses études, au Collegium Carolinum puis à Göttingen (1795).", "The Duke of Brunswick pays for his studies, at the Collegium Carolinum and then in Göttingen (1795).")],
      ["1796", P("Il montre que le polygone régulier à 17 côtés se construit à la règle et au compas.", "He shows that the regular 17-sided polygon can be constructed with ruler and compass.")],
      ["1799", P("Thèse : une démonstration du théorème fondamental de l’algèbre.", "Doctoral thesis: a proof of the fundamental theorem of algebra.")],
      ["1801", P("Disquisitiones arithmeticae, et le calcul de l’orbite de Cérès, qui permet de retrouver la planète naine.", "Disquisitiones arithmeticae, and the computation of the orbit of Ceres, which lets astronomers find the dwarf planet again.")],
      ["1807", P("Directeur de l’observatoire de Göttingen, jusqu’à sa mort.", "Director of the Göttingen observatory, until his death.")],
      ["1809", P("Theoria motus : la méthode des moindres carrés et la loi des erreurs qui porte son nom.", "Theoria motus: the method of least squares and the law of errors that bears his name.")],
      ["1827", P("Étude des surfaces courbes et « theorema egregium » : la courbure se mesure depuis la surface elle-même.", "Study of curved surfaces and the “theorema egregium”: curvature can be measured from within the surface.")],
      ["1833", P("Avec Wilhelm Weber, un télégraphe électromagnétique relie l’observatoire au laboratoire de physique.", "With Wilhelm Weber, an electromagnetic telegraph links the observatory to the physics laboratory.")],
      ["1855", P("Mort à Göttingen, le 23 février.", "Dies in Göttingen on 23 February.")],
    ],
    sections: [
      [P("Un enfant qui compte", "A child who counts"), [
        P("Gauss naît à Brunswick, dans le nord de l’Allemagne, dans une famille d’artisans ; son père exerce plusieurs métiers manuels. Ses dons pour le calcul se remarquent tôt ; l’histoire de la somme posée par son maître d’école, racontée plus bas, date de cette époque. Le duc de Brunswick, informé, prend ses études à sa charge.", "Gauss is born in Brunswick, in northern Germany; his father works at several manual trades. His gift for calculation is noticed early; the story of the sum set by his schoolmaster, told below, dates from this time. The Duke of Brunswick hears of him and pays for his studies."),
        P("À dix-huit ans, il trouve quels polygones réguliers se construisent à la règle et au compas, et montre que l’heptadécagone (17 côtés) en fait partie : un problème resté ouvert depuis l’Antiquité grecque. Cette découverte ouvre le carnet où il notera ensuite ses résultats, souvent en une ligne.", "At eighteen he finds which regular polygons can be constructed with ruler and compass, and shows that the heptadecagon (17 sides) is one of them: a question left open since Greek antiquity. This discovery opens the notebook in which he then records his results, often in a single line."),
      ]],
      [P("Le prince des mathématiciens", "The prince of mathematicians"), [
        P("En 1801, les Disquisitiones arithmeticae fondent la théorie des nombres moderne : congruences, formes quadratiques, loi de réciprocité quadratique, qu’il démontre de plusieurs façons. La même année, il calcule l’orbite de Cérès à partir de quelques observations, et les astronomes la retrouvent là où il l’avait annoncé.", "In 1801 the Disquisitiones arithmeticae lay the foundations of modern number theory: congruences, quadratic forms, the law of quadratic reciprocity, which he proves in several ways. The same year he computes the orbit of Ceres from a handful of observations, and astronomers find it where he said it would be."),
        P("Pour tirer le meilleur d’observations imprécises, il développe la méthode des moindres carrés et la loi des erreurs en cloche, aujourd’hui appelée loi normale ou gaussienne. Les travaux de géodésie (l’arpentage du royaume de Hanovre) le conduisent à la géométrie des surfaces courbes ; avec Weber, il étudie le magnétisme terrestre.", "To make the most of imprecise observations he develops the method of least squares and the bell-shaped law of errors, today called the normal or Gaussian distribution. His geodetic work (surveying the Kingdom of Hanover) leads him to the geometry of curved surfaces; with Weber he studies the Earth’s magnetism."),
        P("Il publie peu et seulement des résultats achevés ; sa devise était « Pauca sed matura », peu mais mûr. Sa correspondance et ses carnets montrent qu’il avait envisagé une géométrie non euclidienne sans la publier.", "He publishes little, and only finished work; his motto was “Pauca sed matura”, few but ripe. His letters and notebooks show that he had considered a non-Euclidean geometry without publishing it."),
      ]],
    ],
    links: ["#stories/gauss-sum", "#challenges/gauss-sum", "#gallery/galton", "#lab/complex"],
    sources: [["https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/", P("Gauss · MacTutor (anglais)", "Gauss · MacTutor")]],
  },
  {
    id: "von-neumann",
    name: "John von Neumann",
    dates: "1903-1957",
    places: P("Budapest, Berlin, Princeton", "Budapest, Berlin, Princeton"),
    dek: P("Un esprit d’une rapidité légendaire, des fondements des mathématiques aux premiers ordinateurs.", "A mind of legendary speed, from the foundations of mathematics to the first computers."),
    facts: [
      ["1903", P("Naissance à Budapest, le 28 décembre (Neumann János).", "Born in Budapest on 28 December (Neumann János).")],
      ["1926", P("Diplôme d’ingénieur chimiste à Zurich et doctorat de mathématiques à Budapest, sur la théorie des ensembles.", "Diploma in chemical engineering in Zurich and a doctorate in mathematics in Budapest, on set theory.")],
      ["1928", P("Théorème du minimax : naissance de la théorie des jeux.", "The minimax theorem: game theory is born.")],
      ["1932", P("Fondements mathématiques de la mécanique quantique.", "Mathematical foundations of quantum mechanics.")],
      ["1933", P("L’un des premiers professeurs de l’Institute for Advanced Study de Princeton.", "One of the first professors of the Institute for Advanced Study in Princeton.")],
      ["1944", P("Theory of Games and Economic Behavior, avec Oskar Morgenstern.", "Theory of Games and Economic Behavior, with Oskar Morgenstern.")],
      ["1945", P("Rapport sur l’EDVAC : le programme rangé dans la mémoire, comme les données.", "Report on the EDVAC: the program stored in memory, like the data.")],
      ["1957", P("Mort à Washington, le 8 février.", "Dies in Washington on 8 February.")],
    ],
    sections: [
      [P("Budapest", "Budapest"), [
        P("Fils d’un banquier de Budapest, il reçoit une éducation très soignée. Au lycée luthérien, son professeur de mathématiques remarque vite qu’il faut lui donner autre chose que le programme : il travaille avec des mathématiciens de l’université dès l’adolescence. Son père lui fait aussi suivre des études d’ingénieur chimiste, plus sûres pour gagner sa vie.", "The son of a Budapest banker, he receives a very careful education. At the Lutheran gymnasium his mathematics teacher soon sees that the syllabus is not enough: he works with university mathematicians while still a teenager. His father also has him study chemical engineering, a safer way to earn a living."),
      ]],
      [P("Une œuvre sans frontières", "Work without borders"), [
        P("Il donne une axiomatique de la théorie des ensembles, écrit les fondements mathématiques de la mécanique quantique (les états sont des vecteurs d’un espace de Hilbert), étudie les algèbres d’opérateurs qui portent son nom et démontre un théorème ergodique. En 1928, son théorème du minimax montre que dans un jeu à deux joueurs et à somme nulle, chacun a une stratégie, éventuellement aléatoire, qui garantit le meilleur résultat possible face au pire adversaire.", "He gives an axiomatic set theory, writes the mathematical foundations of quantum mechanics (states are vectors of a Hilbert space), studies the operator algebras that bear his name and proves an ergodic theorem. In 1928 his minimax theorem shows that in a two-player zero-sum game each player has a strategy, possibly random, that guarantees the best possible outcome against the worst opponent."),
        P("Pendant la guerre, il travaille au projet Manhattan. Il s’intéresse alors au calcul automatique : son rapport de 1945 sur l’EDVAC décrit une machine dont le programme est rangé en mémoire avec les données, schéma de presque tous les ordinateurs actuels. Avec Stanislaw Ulam, il développe la méthode de Monte-Carlo, qui estime une quantité en simulant le hasard.", "During the war he works on the Manhattan Project. He turns to automatic computation: his 1945 report on the EDVAC describes a machine whose program is stored in memory alongside the data, the plan of nearly every computer since. With Stanislaw Ulam he develops the Monte Carlo method, which estimates a quantity by simulating chance."),
        P("À la fin de sa vie, il cherche une machine capable de se reproduire. Sur une idée d’Ulam, il la conçoit dans une grille de cases dont chacune change d’état selon ses voisines : un automate cellulaire. Le jeu de la vie de John Conway, dans les curiosités, est un descendant très simplifié de cette idée.", "Late in life he looks for a machine able to reproduce itself. Following a suggestion by Ulam, he designs it in a grid of cells, each changing state according to its neighbours: a cellular automaton. John Conway’s Game of Life, among the curiosities, is a much simplified descendant of this idea."),
      ]],
    ],
    links: ["#stories/von-neumann-fly", "#challenges/fly", "#gallery/life", "#lab/buffon"],
    sources: [["https://mathshistory.st-andrews.ac.uk/Biographies/Von_Neumann/", P("Von Neumann · MacTutor (anglais)", "Von Neumann · MacTutor")]],
  },
  {
    id: "erdos",
    name: "Paul Erdős",
    dates: "1913-1996",
    places: P("Budapest, et partout ailleurs", "Budapest, and everywhere else"),
    dek: P("Un mathématicien sans maison ni bagage, qui a écrit avec plus de cinq cents coauteurs.", "A mathematician with no home and almost no luggage, who wrote with more than five hundred coauthors."),
    facts: [
      ["1913", P("Naissance à Budapest, le 26 mars ; ses deux parents enseignent les mathématiques.", "Born in Budapest on 26 March; both his parents teach mathematics.")],
      ["1932", P("Encore étudiant, il publie une démonstration nouvelle du théorème de Tchebychev : entre n et 2n, il y a toujours un nombre premier.", "Still a student, he publishes a new proof of Chebyshev’s theorem: between n and 2n there is always a prime.")],
      ["1934", P("Doctorat à Budapest, puis départ pour Manchester.", "Doctorate in Budapest, then he leaves for Manchester.")],
      ["1947", P("Une borne pour les nombres de Ramsey par un argument de probabilités : la méthode probabiliste.", "A bound on Ramsey numbers through a probability argument: the probabilistic method.")],
      ["1949", P("Démonstration élémentaire du théorème des nombres premiers, en même temps qu’Atle Selberg.", "Elementary proof of the prime number theorem, at the same time as Atle Selberg.")],
      ["1959", P("Avec Alfréd Rényi, la théorie des graphes aléatoires.", "With Alfréd Rényi, the theory of random graphs.")],
      ["1996", P("Mort à Varsovie, le 20 septembre, pendant un congrès.", "Dies in Warsaw on 20 September, during a conference.")],
    ],
    sections: [
      [P("Une vie dans une valise", "A life in a suitcase"), [
        P("Erdős n’a jamais eu de poste fixe très longtemps ni de maison. Pendant des décennies, il voyage d’université en université avec une petite valise, arrive chez un collègue, annonce « Mon cerveau est ouvert » et travaille avec lui quelques jours avant de repartir. Ce qu’il gagne, il le donne presque entièrement.", "Erdős never kept a permanent post for long, nor a home. For decades he travels from university to university with a small suitcase, turns up at a colleague’s house, announces “My brain is open” and works with them for a few days before moving on. What he earns he gives away almost entirely."),
        P("Il a son vocabulaire : les enfants sont des « epsilons », et les plus belles démonstrations viennent du « Livre » où Dieu garderait la preuve parfaite de chaque théorème. Il offre aussi des récompenses, de quelques dollars à plusieurs milliers, pour les problèmes qu’il pose.", "He has his own vocabulary: children are “epsilons”, and the finest proofs come from “The Book” in which God keeps the perfect proof of each theorem. He also offers rewards, from a few dollars to several thousand, for the problems he poses."),
      ]],
      [P("Un réseau de collaborations", "A web of collaborations"), [
        P("Il signe environ 1 500 articles, plus que tout autre mathématicien de son siècle, avec plus de 500 coauteurs. D’où le « nombre d’Erdős » : 1 pour ses coauteurs, 2 pour les coauteurs de ses coauteurs, et ainsi de suite. C’est une distance dans un graphe.", "He signs about 1,500 papers, more than any other mathematician of his century, with more than 500 coauthors. Hence the “Erdős number”: 1 for his coauthors, 2 for their coauthors, and so on. It is a distance in a graph."),
        P("Ses domaines sont la théorie des nombres, la combinatoire, les graphes, les probabilités. Il aimait les énoncés qu’un élève peut comprendre et dont la preuve demande une idée. Le défi de Ramsey et le principe des tiroirs, dans les défis, sont de cette famille.", "His fields are number theory, combinatorics, graphs and probability. He liked statements a pupil can understand and whose proof needs an idea. The Ramsey and pigeonhole challenges belong to this family."),
      ]],
    ],
    links: ["#stories/erdos-generosity", "#challenges/ramsey", "#challenges/pigeonhole"],
    sources: [["https://mathshistory.st-andrews.ac.uk/Biographies/Erdos/", P("Erdős · MacTutor (anglais)", "Erdős · MacTutor")]],
  },
];

export const STORIES = [
  {
    id: "gauss-sum",
    title: P("Le petit Gauss et la longue addition", "Young Gauss and the long sum"),
    who: "gauss",
    dek: P("Un maître d’école donne à sa classe une addition interminable. Un élève pose son ardoise presque aussitôt.", "A schoolmaster sets his class an endless addition. One pupil puts down his slate almost at once."),
    sections: [
      [P("L’histoire", "The story"), [
        P("Brunswick, quelques années après l’entrée de Gauss à l’école, en 1784. Le maître, Büttner, veut occuper sa classe : il fait additionner une longue suite de nombres. Le jeune Gauss réfléchit un instant, écrit un seul nombre sur son ardoise et la pose sur la table du maître. Les autres calculent encore longtemps. Quand le maître vérifie, le nombre de Gauss est le bon.", "Brunswick, a few years after Gauss starts school in 1784. The schoolmaster, Büttner, wants to keep his class busy: he has them add up a long list of numbers. Young Gauss thinks for a moment, writes a single number on his slate and puts it on the master’s table. The others go on calculating for a long time. When the master checks, Gauss’s number is right."),
        P("La version la plus connue dit que la somme était 1 + 2 + 3 + … + 100. Gauss aurait remarqué que 1 + 100, 2 + 99, 3 + 98… valent tous 101, qu’il y a 50 paires, et donc que la somme vaut 50 × 101 = 5 050.", "The best-known version says the sum was 1 + 2 + 3 + … + 100. Gauss is said to have noticed that 1 + 100, 2 + 99, 3 + 98… all make 101, that there are 50 pairs, and so that the sum is 50 × 101 = 5,050."),
      ]],
      [P("Ce qu’on sait vraiment", "What is actually known"), [
        P("Le récit le plus ancien est celui de Wolfgang Sartorius von Waltershausen, un collègue de Gauss à Göttingen, dans un livre publié en 1856, un an après sa mort. Il ne donne ni les nombres de la somme ni la méthode : il parle seulement d’une suite arithmétique. Le « 1 à 100 » et l’astuce des paires ont été ajoutés plus tard. Le journaliste scientifique Brian Hayes a rassemblé plus de cent versions différentes de l’histoire ; dans l’une d’elles, popularisée par E. T. Bell, la somme est 81 297 + 81 495 + … + 100 899, cent nombres qui augmentent de 198.", "The oldest account is by Wolfgang Sartorius von Waltershausen, a colleague of Gauss in Göttingen, in a book published in 1856, a year after his death. It gives neither the numbers of the sum nor the method: it only speaks of an arithmetic series. The “1 to 100” and the pairing trick were added later. The science writer Brian Hayes collected more than a hundred versions of the story; in one of them, made popular by E. T. Bell, the sum is 81,297 + 81,495 + … + 100,899, a hundred numbers going up by 198."),
        P("Ce qui ne change pas d’une version à l’autre, c’est l’idée : ne pas additionner terme à terme, mais regarder la forme de la somme. Écrite à l’endroit puis à l’envers, une suite arithmétique donne des paires de même total.", "What stays the same in every version is the idea: do not add term by term, look at the shape of the sum instead. Written forwards and then backwards, an arithmetic series gives pairs with the same total."),
      ]],
      [P("À toi", "Your turn"), [
        P("Le défi « La somme du petit Gauss » propose la somme du récit et ses variantes (nombres impairs, suites de raison quelconque, la version de Bell). Essaie avant de lire la solution.", "The challenge “Young Gauss’s sum” offers the sum of the story and its variants (odd numbers, series with any common difference, Bell’s version). Try it before reading the solution."),
      ]],
    ],
    links: ["#challenges/gauss-sum", "#biographies/gauss", "#lab/sequences"],
    sources: [
      ["https://www.americanscientist.org/article/gausss-day-of-reckoning", P("Brian Hayes, « Gauss’s Day of Reckoning », American Scientist, 2006 (anglais)", "Brian Hayes, “Gauss’s Day of Reckoning”, American Scientist, 2006")],
      ["https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/", P("Gauss · MacTutor (anglais)", "Gauss · MacTutor")],
    ],
  },
  {
    id: "erdos-generosity",
    title: P("Erdős et le mendiant de la gare", "Erdős and the beggar at the station"),
    who: "erdos",
    dek: P("Un premier salaire, une gare de Londres, un homme qui demande de quoi s’acheter un thé.", "A first salary, a London station, a man asking for the price of a cup of tea."),
    sections: [
      [P("L’histoire", "The story"), [
        P("Au début des années 1960, Erdős passe une année à University College, à Londres. Le mathématicien David Larman, alors étudiant, se souvient d’une scène à la gare d’Euston. Erdős vient de toucher sa première paie du mois. Un homme l’aborde et lui demande de l’argent pour une tasse de thé.", "In the early 1960s Erdős spends a year at University College London. The mathematician David Larman, then a student, remembers a scene at Euston station. Erdős has just received his first monthly pay. A man comes up to him and asks for money for a cup of tea."),
        P("Erdős ouvre l’enveloppe, en retire la petite somme dont il estime avoir besoin pour ses besoins très modestes, et donne tout le reste à l’homme.", "Erdős opens the envelope, takes out the small amount he reckons he needs for his very modest wants, and gives all the rest to the man."),
      ]],
      [P("D’où vient le récit", "Where the story comes from"), [
        P("Le souvenir de Larman est cité par Paul Hoffman dans sa biographie d’Erdős, The Man Who Loved Only Numbers (1998). C’est un témoignage, pas un document : les versions qui circulent varient sur les détails, par exemple sur ce qu’Erdős a gardé. Elles s’accordent avec ce que racontent tous ceux qui l’ont connu : il ne pouvait pas passer devant un sans-abri sans lui donner quelque chose, et il distribuait presque tout ce qu’il recevait, salaires, honoraires et prix.", "Larman’s recollection is quoted by Paul Hoffman in his biography of Erdős, The Man Who Loved Only Numbers (1998). It is a recollection, not a record: the versions in circulation differ in detail, for instance on what Erdős kept. They agree with what everyone who knew him reports: he could not pass a homeless person without giving something, and he gave away almost everything he received, salaries, fees and prizes."),
      ]],
      [P("Et les mathématiques ?", "And the mathematics?"), [
        P("Pour Erdős, posséder des choses était un encombrement ; seul comptait le temps passé à chercher. Il dépensait plutôt en récompenses pour les problèmes ouverts qu’il lançait à ses collègues. Le défi de Ramsey, l’un de ses sujets favoris, montre le genre d’énoncé qu’il aimait : simple à dire, difficile à démontrer.", "To Erdős, owning things was a nuisance; only the time spent on research mattered. He spent instead on rewards for the open problems he set his colleagues. The Ramsey challenge, one of his favourite subjects, shows the kind of statement he liked: easy to state, hard to prove."),
      ]],
    ],
    links: ["#biographies/erdos", "#challenges/ramsey"],
    sources: [
      ["https://en.wikiquote.org/wiki/Paul_Erd%C5%91s", P("Citations d’Erdős et de ses proches, avec références · Wikiquote (anglais)", "Quotations by and about Erdős, with references · Wikiquote")],
      ["https://mathshistory.st-andrews.ac.uk/Biographies/Erdos/", P("Erdős · MacTutor (anglais)", "Erdős · MacTutor")],
    ],
  },
  {
    id: "von-neumann-fly",
    title: P("Von Neumann et la mouche", "Von Neumann and the fly"),
    who: "von-neumann",
    dek: P("Deux trains, une mouche qui fait l’aller et retour, et une réponse donnée sans hésiter.", "Two trains, a fly going back and forth, and an answer given without hesitation."),
    sections: [
      [P("L’histoire", "The story"), [
        P("On pose à von Neumann l’énigme suivante. Deux trains sont à 20 milles l’un de l’autre et roulent l’un vers l’autre, chacun à 10 milles à l’heure. Une mouche part du premier à 15 milles à l’heure, touche le second, fait demi-tour, et ainsi de suite jusqu’à ce que les trains se rencontrent. Quelle distance parcourt-elle ?", "Von Neumann is given this puzzle. Two trains are 20 miles apart and drive towards each other, each at 10 miles per hour. A fly leaves the first at 15 miles per hour, touches the second, turns back, and so on until the trains meet. How far does it fly?"),
        P("« Quinze milles », répond-il aussitôt. Son interlocuteur, déçu, explique qu’il y a un raccourci et que la plupart des gens essaient de sommer la série infinie des trajets. Von Neumann s’étonne : « Mais c’est ce que j’ai fait ! »", "“Fifteen miles,” he answers at once. Disappointed, the questioner explains that there is a shortcut, and that most people try to sum the infinite series of legs. Von Neumann is puzzled: “But that is what I did!”"),
      ]],
      [P("Les deux calculs", "The two calculations"), [
        P("Le raccourci : les trains se rapprochent de 20 milles à l’heure, ils se rencontrent donc au bout d’une heure. La mouche vole pendant une heure à 15 milles à l’heure : 15 milles.", "The shortcut: the trains close in at 20 miles per hour, so they meet after one hour. The fly flies for one hour at 15 miles per hour: 15 miles."),
        P("La série : la mouche et le second train se rapprochent à 25 milles à l’heure, le premier trajet dure 20/25 = 0,8 h et mesure 12 milles. Pendant ce temps, l’écart entre les trains passe de 20 à 4 milles, cinq fois moins. Chaque trajet est donc cinq fois plus court que le précédent : 12 + 12/5 + 12/25 + … = 12 / (1 − 1/5) = 15. Les deux raisonnements donnent bien le même résultat ; von Neumann avait simplement fait le second de tête.", "The series: the fly and the second train close in at 25 miles per hour, so the first leg lasts 20/25 = 0.8 h and is 12 miles long. Meanwhile the gap between the trains shrinks from 20 to 4 miles, five times smaller. So each leg is five times shorter than the one before: 12 + 12/5 + 12/25 + … = 12 / (1 − 1/5) = 15. Both arguments give the same answer; von Neumann had simply done the second in his head."),
      ]],
      [P("Une anecdote à prendre avec prudence", "An anecdote to take with care"), [
        P("L’histoire est racontée partout, mais on n’en connaît pas de témoignage de première main, et les nombres changent d’une version à l’autre (dans certaines, ce sont deux cyclistes). Elle dit surtout l’impression que sa vitesse de calcul faisait à ses collègues.", "The story is told everywhere, but no first-hand account of it is known, and the numbers change from one version to the next (in some it is two cyclists). Above all it records the impression his speed of calculation made on his colleagues."),
      ]],
    ],
    links: ["#challenges/fly", "#biographies/von-neumann", "#lab/sequences"],
    sources: [
      ["https://mathworld.wolfram.com/TwoTrainsPuzzle.html", P("Two Trains Puzzle · MathWorld (anglais)", "Two Trains Puzzle · MathWorld")],
      ["https://mathshistory.st-andrews.ac.uk/Biographies/Von_Neumann/", P("Von Neumann · MacTutor (anglais)", "Von Neumann · MacTutor")],
    ],
  },
  {
    id: "hanoi-legend",
    title: P("La légende des tours de Hanoï", "The legend of the Tower of Hanoi"),
    figure: "Édouard Lucas",
    dek: P("Dans un temple, des prêtres déplacent 64 disques d’or. Quand ils auront fini, le monde s’achèvera. Faut-il s’inquiéter ?", "In a temple, priests move 64 golden disks. When they finish, the world will end. Should we worry?"),
    sections: [
      [P("La légende", "The legend"), [
        P("Dans le grand temple de Bénarès, sous le dôme qui marque le centre du monde, se dressent trois aiguilles de diamant. Au commencement, Dieu a enfilé sur l’une d’elles 64 disques d’or, du plus grand au plus petit. Jour et nuit, des prêtres les transportent sur une autre aiguille, un disque à la fois, sans jamais poser un disque sur un plus petit. Quand les 64 disques auront changé d’aiguille, le monde finira.", "In the great temple of Benares, beneath the dome that marks the centre of the world, stand three diamond needles. At the beginning, God placed 64 golden disks on one of them, from the largest to the smallest. Day and night, priests carry them to another needle, one disk at a time, never putting a disk on a smaller one. When all 64 disks have changed needles, the world will end."),
      ]],
      [P("D’où vient la légende", "Where the legend comes from"), [
        P("Le jeu est mis en vente en 1883, signé « N. Claus (de Siam), mandarin du collège Li-Sou-Stian » : les anagrammes de « Lucas d’Amiens » et de « lycée Saint-Louis », où enseignait le mathématicien Édouard Lucas. Peu après, le journaliste Henri de Parville raconte la légende du temple. Ni le temple ni les prêtres n’ont existé : la légende est une invention pour faire connaître le jeu. Le calcul, lui, est exact.", "The game went on sale in 1883, signed “N. Claus (de Siam), mandarin of the college of Li-Sou-Stian”: anagrams of “Lucas d’Amiens” and of “lycée Saint-Louis”, where the mathematician Édouard Lucas taught. Soon after, the journalist Henri de Parville told the legend of the temple. Neither the temple nor the priests existed: the legend was invented to make the game known. The arithmetic, however, is exact."),
      ]],
      [P("Faut-il s’inquiéter ?", "Should we worry?"), [
        P("Pour déplacer n disques, il faut d’abord déplacer les n − 1 plus petits sur l’aiguille libre, puis le grand disque, puis les n − 1 par-dessus. Le nombre minimal de coups vérifie donc u(n) = 2u(n − 1) + 1 avec u(1) = 1, d’où u(n) = 2ⁿ − 1. Le défi « Les tours de Hanoï » te fait démontrer cette formule.", "To move n disks, first move the n − 1 smaller ones to the free needle, then the large disk, then the n − 1 back on top. So the least number of moves satisfies u(n) = 2u(n − 1) + 1 with u(1) = 1, hence u(n) = 2ⁿ − 1. The challenge “The Tower of Hanoi” asks you to prove this formula."),
        P("Pour 64 disques : 2⁶⁴ − 1 = 18 446 744 073 709 551 615 coups. À un coup par seconde, sans erreur ni pause, il faudrait environ 585 milliards d’années (une année de 365,25 jours compte 31 557 600 secondes), soit plus de 40 fois l’âge de l’Univers, estimé à 13,8 milliards d’années. Même à mille coups par seconde, il faudrait plus de 580 millions d’années.", "For 64 disks: 2⁶⁴ − 1 = 18,446,744,073,709,551,615 moves. At one move per second, without mistakes or breaks, it would take about 585 billion years (a year of 365.25 days has 31,557,600 seconds), more than 40 times the age of the Universe, estimated at 13.8 billion years. Even at a thousand moves per second it would take more than 580 million years."),
        P("Un détail amusant : au coup numéro k, le disque déplacé est le disque d + 1, où d est le nombre de fois que 2 divise k. Le plus petit disque bouge un coup sur deux, le deuxième un coup sur quatre, et la suite des disques déplacés suit les chiffres qui changent quand on compte en binaire.", "A curious detail: at move number k, the disk moved is disk d + 1, where d is the number of times 2 divides k. The smallest disk moves every other move, the second every fourth move, and the sequence of disks moved follows the digits that change when counting in binary."),
      ]],
    ],
    links: ["#challenges/hanoi"],
    sources: [["https://mathshistory.st-andrews.ac.uk/Extras/Hanoi/", P("Les tours de Hanoï · MacTutor (anglais)", "The Towers of Hanoi · MacTutor")]],
  },
];

// History additions keep their source evidence beside the text.
import {GALOIS_BIOGRAPHY} from './reading-history-content.js';
BIOGRAPHIES.push(GALOIS_BIOGRAPHY);

// The same assumptions and arguments feed laboratory and reading editions.
import { INFERENCE_STORIES } from "./inference-content.js";
STORIES.push(...INFERENCE_STORIES);

import {FAIR_STORIES} from './fair-division-content.js';
import {TOPOLOGY_STORIES} from './topology-content.js';
STORIES.push(...FAIR_STORIES,...TOPOLOGY_STORIES);
import { DYNAMICS_STORIES } from './dynamics-content.js';
STORIES.push(...DYNAMICS_STORIES);
import { GOMBOC_STORY } from './gomboc-content.js';
STORIES.push(GOMBOC_STORY);

import { ILLUMINATION_STORY } from "./illumination-content.js";
STORIES.push(ILLUMINATION_STORY);

// Further portraits and stories link the existing atlas to its reading pages.
BIOGRAPHIES.push(
  {
    id: 'liu-hui', name: 'Liu Hui', dates: 'IIIe siècle / 3rd century',
    places: P('Chine, tradition des Neuf Chapitres', 'China, Nine Chapters tradition'),
    dek: P('Un commentateur qui explique des méthodes de calcul et cherche à justifier leurs résultats.', 'A commentator who explains methods of calculation and seeks to justify their results.'),
    facts: [['263', P('Commentaire des Neuf Chapitres sur l’art mathématique.', 'Commentary on the Nine Chapters on the Mathematical Art.')]],
    sections: [
      [P('Expliquer un texte plus ancien', 'Explaining an older text'), [
        P('On connaît peu de détails sûrs sur sa vie. En 263, Liu Hui commente les Neuf Chapitres sur l’art mathématique, un recueil de problèmes et de procédures composé avant lui. Son commentaire ne se contente pas de donner des règles : il cherche aussi à expliquer pourquoi elles fonctionnent.', 'Few details of his life are securely known. In 263 Liu Hui commented on the Nine Chapters on the Mathematical Art, a collection of problems and procedures composed before him. His commentary does more than state rules: it also seeks to explain why they work.'),
        P('Pour étudier le cercle, il considère des polygones inscrits dont le nombre de côtés augmente. Leurs aires permettent d’approcher celle du cercle et conduisent à des approximations de π. Cette démarche relie le calcul numérique à un argument géométrique.', 'To study the circle, he considers inscribed polygons with increasing numbers of sides. Their areas approximate the area of the circle and lead to approximations of π. This connects numerical calculation with a geometric argument.')
      ]]
    ], links: ['#history/people/liu-hui', '#history/advances/nine-chapters'],
    sources: [['https://mathshistory.st-andrews.ac.uk/Biographies/Liu_Hui/', P('Liu Hui · MacTutor (anglais)', 'Liu Hui · MacTutor')]]
  },
  {
    id: 'hypatia', name: 'Hypatie', dates: 'IVe et Ve siècles / 4th and 5th centuries',
    places: P('Alexandrie', 'Alexandria'),
    dek: P('Une enseignante de mathématiques et de philosophie dans l’Alexandrie de l’Antiquité tardive.', 'A teacher of mathematics and philosophy in late antique Alexandria.'),
    facts: [['Vers 400 / Around 400', P('Enseigne à Alexandrie.', 'Teaches in Alexandria.')], ['415', P('Mort à Alexandrie.', 'Dies in Alexandria.')]],
    sections: [[P('Enseignement et transmission', 'Teaching and transmission'), [
      P('Hypatie enseigne les mathématiques et la philosophie à Alexandrie. Elle travaille dans une tradition de commentaires savants, notamment avec son père Théon, lui-même mathématicien et astronome. Ses élèves lui écrivent et gardent trace de son enseignement.', 'Hypatia teaches mathematics and philosophy in Alexandria. She works in a tradition of scholarly commentary, including work with her father Theon, himself a mathematician and astronomer. Her students write to her and preserve traces of her teaching.'),
      P('Les sources anciennes sont fragmentaires et les œuvres conservées ne permettent pas toujours de distinguer précisément les contributions de chacun. Certaines attributions restent discutées. Cette incertitude invite à lire sa vie sans transformer les lacunes en anecdotes assurées.', 'Ancient sources are fragmentary, and surviving works do not always allow each person’s contribution to be distinguished precisely. Some attributions remain disputed. This uncertainty invites us to read her life without turning gaps into certain anecdotes.')
    ]]], links: ['#history/people/hypatia'],
    sources: [['https://mathshistory.st-andrews.ac.uk/Biographies/Hypatia/', P('Hypatie · MacTutor (anglais)', 'Hypatia · MacTutor')]]
  },
  {
    id: 'germain', name: 'Sophie Germain', dates: '1776-1831',
    places: P('France', 'France'),
    dek: P('Une chercheuse en théorie des nombres et en élasticité, malgré les obstacles à la formation des femmes.', 'A researcher in number theory and elasticity despite barriers to women’s education.'),
    facts: [['1804', P('Début de sa correspondance avec Gauss sous le nom de Monsieur Le Blanc.', 'Begins corresponding with Gauss under the name Monsieur Le Blanc.')], ['1816', P('Prix de l’Académie des sciences pour un mémoire sur les vibrations.', 'Academy of Sciences prize for a paper on vibrations.')]],
    sections: [[P('Correspondre et chercher', 'Correspondence and research'), [
      P('Sophie Germain étudie les mathématiques largement par elle-même, à une époque où les institutions savantes offrent peu de possibilités aux femmes. Elle correspond avec des chercheurs sous le nom de Monsieur Le Blanc, notamment avec Gauss au sujet de la théorie des nombres.', 'Sophie Germain studies mathematics largely on her own, at a time when scholarly institutions offer women few opportunities. She corresponds with researchers under the name Monsieur Le Blanc, including Gauss on number theory.'),
      P('Elle travaille aussi sur la vibration des plaques élastiques. Après plusieurs soumissions, elle reçoit en 1816 un prix de l’Académie des sciences. Ses recherches montrent des échanges entre problèmes physiques, calcul et démonstration.', 'She also works on the vibration of elastic plates. After several submissions, she receives an Academy of Sciences prize in 1816. Her research connects physical problems, calculation and proof.')
    ]]], links: ['#history/people/germain'],
    sources: [['https://mathshistory.st-andrews.ac.uk/Biographies/Germain/', P('Sophie Germain · MacTutor (anglais)', 'Sophie Germain · MacTutor')]]
  },
  {
    id: 'mirzakhani', name: 'Maryam Mirzakhani', dates: '1977-2017',
    places: P('Iran et États-Unis', 'Iran and United States'),
    dek: P('Explorer la géométrie et la dynamique des surfaces.', 'Exploring the geometry and dynamics of surfaces.'),
    facts: [['2014', P('Médaille Fields pour ses travaux sur les surfaces de Riemann et leurs espaces de modules.', 'Fields Medal for work on Riemann surfaces and their moduli spaces.')]],
    sections: [[P('Des chemins sur les surfaces', 'Paths on surfaces'), [
      P('Née en Iran, Maryam Mirzakhani étudie les surfaces de Riemann et les espaces qui permettent de comparer leurs géométries. Ses travaux relient géométrie, dynamique et dénombrement.', 'Born in Iran, Maryam Mirzakhani studies Riemann surfaces and spaces that allow their geometries to be compared. Her work connects geometry, dynamics and counting.'),
      P('Elle étudie notamment des géodésiques fermées, des chemins localement les plus courts qui se referment sur une surface. En 2014, elle devient la première femme à recevoir la médaille Fields. Ses travaux avec d’autres chercheurs ont ouvert de nouvelles questions sur la dynamique des surfaces.', 'She studies closed geodesics, locally shortest paths that close up on a surface. In 2014 she becomes the first woman to receive the Fields Medal. Her work with other researchers opened new questions about the dynamics of surfaces.')
    ]]], links: ['#history/people/mirzakhani'],
    sources: [['https://mathshistory.st-andrews.ac.uk/Biographies/Mirzakhani/', P('Maryam Mirzakhani · MacTutor (anglais)', 'Maryam Mirzakhani · MacTutor')]]
  }
);
STORIES.push(
  {
    id: 'zero-history', figure: 'Brahmagupta', title: P('Le long voyage du zéro', 'The long journey of zero'),
    dek: P('Une place vide et un nombre sur lequel on calcule : deux idées liées, aux histoires multiples.', 'An empty place and a number used in arithmetic: related ideas with multiple histories.'),
    sections: [[P('Des usages différents', 'Different uses'), [
      P('Dans une écriture positionnelle, un signe peut distinguer une place vide. Mais traiter zéro comme un nombre et lui appliquer des règles de calcul est une autre étape. Ces usages apparaissent dans plusieurs traditions et ne se résument pas à une invention unique.', 'In place-value notation, a sign can distinguish an empty place. But treating zero as a number and applying arithmetic rules to it is another step. These uses occur in several traditions and cannot be reduced to a single invention.'),
      P('En Inde, Brahmagupta formule au VIIe siècle des règles pour zéro et les nombres signés. Certaines diffèrent de nos conventions : sa règle concernant la division par zéro ne correspond pas à l’arithmétique actuelle. Comparer les textes aide à comprendre ce qui a changé.', 'In India, Brahmagupta formulated rules for zero and signed numbers in the seventh century. Some differ from our conventions: his rule concerning division by zero does not match present-day arithmetic. Comparing texts helps us see what changed.')
    ]]], links: ['#history/people/brahmagupta', '#history/advances/brahmagupta-zero'],
    sources: [['https://mathshistory.st-andrews.ac.uk/HistTopics/Zero/', P('Histoire du zéro · MacTutor (anglais)', 'A history of zero · MacTutor')], ['https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/', P('Brahmagupta · MacTutor (anglais)', 'Brahmagupta · MacTutor')]]
  },
  {
    id: 'bridges-history', title: P('Les ponts et les connexions', 'Bridges and connections'), figure: 'Leonhard Euler',
    dek: P('Une promenade impossible devient une question sur les connexions.', 'An impossible walk becomes a question about connections.'),
    sections: [[P('Changer de regard', 'A change of viewpoint'), [
      P('Peut-on traverser chacun des ponts de Königsberg une seule fois au cours d’une promenade ? Euler étudie les connexions entre les terres et le nombre de ponts qui touchent chacune d’elles. Les distances et la forme exacte des rives ne sont pas nécessaires à son raisonnement.', 'Can a walk cross each bridge of Königsberg exactly once? Euler studies the connections between land masses and the number of bridges meeting each one. Distances and the exact shape of the banks are unnecessary to his reasoning.'),
      P('Aujourd’hui, on représente les terres par des sommets et les ponts par des arêtes. Les quatre terres ont chacune un nombre impair de ponts : une telle promenade ne peut avoir que deux extrémités au plus. Le défi permet de chercher ce raisonnement avant de consulter la solution.', 'Today we represent land masses by vertices and bridges by edges. All four land masses meet an odd number of bridges, while such a walk can have at most two endpoints. The challenge invites you to work out the reasoning before consulting the solution.')
    ]]], links: ['#history/advances/bridges', '#challenges/konigsberg'],
    sources: [['https://scholarlycommons.pacific.edu/euler-works/53/', P('Mémoire d’Euler · Euler Archive', 'Euler’s paper · Euler Archive')], ['https://mathshistory.st-andrews.ac.uk/HistTopics/Topology_in_mathematics/', P('Histoire de la topologie · MacTutor (anglais)', 'History of topology · MacTutor')]]
  },
  {
    id: 'germain-letter', title: P('Une correspondance sous un autre nom', 'Correspondence under another name'), who: 'germain',
    dek: P('Sophie Germain écrit à Gauss sous le nom de Monsieur Le Blanc.', 'Sophie Germain writes to Gauss under the name Monsieur Le Blanc.'),
    sections: [[P('Des nombres et des lettres', 'Numbers and letters'), [
      P('Au début du XIXe siècle, Sophie Germain étudie les Disquisitiones arithmeticae de Gauss et lui écrit sous le nom de Monsieur Le Blanc. Leur correspondance porte notamment sur la théorie des nombres. Son parcours rappelle les obstacles rencontrés par les femmes pour accéder aux études et aux institutions savantes.', 'In the early nineteenth century Sophie Germain studies Gauss’s Disquisitiones arithmeticae and writes to him as Monsieur Le Blanc. Their correspondence includes number theory. Her path recalls the barriers women encountered in access to education and scholarly institutions.'),
      P('Le pseudonyme ne résume pas son travail : elle mène aussi des recherches sur l’élasticité et les vibrations. Les lettres permettent de replacer les résultats dans une histoire d’échanges et d’accès au savoir.', 'The pseudonym does not encompass her work: she also researches elasticity and vibrations. The letters place mathematical results within a history of exchange and access to knowledge.')
    ]]], links: ['#biographies/germain', '#history/people/gauss'],
    sources: [['https://mathshistory.st-andrews.ac.uk/Biographies/Germain/', P('Sophie Germain · MacTutor (anglais)', 'Sophie Germain · MacTutor')]]
  },
  {
    id: 'four-colours-history', figure: 'Appel et Haken', title: P('Quatre couleurs et une machine', 'Four colours and a machine'),
    dek: P('Une conjecture sur les cartes conduit à une preuve assistée par ordinateur.', 'A conjecture about maps leads to a computer-assisted proof.'),
    sections: [[P('Le problème et sa preuve', 'The problem and its proof'), [
      P('Pour une carte planaire finie dont chaque pays est connexe, quatre couleurs suffisent-elles toujours ? Deux pays voisins, qui partagent un segment de frontière, doivent recevoir des couleurs différentes. Un simple contact en un point ne compte pas comme voisinage.', 'Are four colours always enough for a finite planar map whose countries are connected? Neighbouring countries, which share a boundary segment, must receive different colours. Contact at a single point does not count as adjacency.'),
      P('En 1976, Kenneth Appel et Wolfgang Haken annoncent une démonstration qui réduit le problème à un grand nombre de configurations vérifiées par ordinateur. Cette preuve a aussi suscité des discussions sur la manière de vérifier une démonstration dont une partie du travail est effectuée par une machine.', 'In 1976 Kenneth Appel and Wolfgang Haken announced a proof reducing the problem to many configurations checked by computer. The proof also prompted discussion about how to verify an argument when a machine performs part of the work.')
    ]]], links: ['#history/people/appel', '#history/people/haken', '#gallery/four-colours'],
    sources: [['https://mathshistory.st-andrews.ac.uk/HistTopics/The_four_colour_theorem/', P('Théorème des quatre couleurs · MacTutor (anglais)', 'Four colour theorem · MacTutor')]]
  }
);
