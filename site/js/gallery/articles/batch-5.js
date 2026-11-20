// Batch 5 of the gallery articles (shape and rules: ../article.js): German tank problem, Benford's law, the baker and
// Poincaré, birthdays, Monty Hall, double pendulum, three bodies, logistic map. Encyclopedia voice: third person, present tense.
const p = (fr, en) => [fr, en];
export const BATCH5 = {
  "tank-gallery": {
    facts: [
      [p("Contexte", "Context"), p("Seconde Guerre mondiale, renseignement allié", "Second World War, Allied intelligence")],
      [p("Étude publiée", "Study published"), p("Ruggles et Brodie, 1947", "Ruggles and Brodie, 1947")],
      [p("Domaine", "Field"), p("Statistique, estimation", "Statistics, estimation")],
      [p("Résultat clé", "Key result"), p("N̂ = m(1 + 1/k) − 1, estimateur sans biais", "N̂ = m(1 + 1/k) − 1, an unbiased estimator")],
      [p("Statut", "Status"), p("Résultat démontré, modèle idéalisé", "Proved result, idealised model")],
    ],
    lead: [
      p("Le problème des chars allemands consiste à estimer le nombre total d’objets fabriqués à partir de quelques numéros de série observés. Il tire son nom d’une application de la Seconde Guerre mondiale : des analystes alliés ont estimé la production mensuelle de chars allemands d’après les numéros relevés sur des chars capturés ou détruits.",
        "The German tank problem consists in estimating the total number of manufactured objects from a few observed serial numbers. It takes its name from a Second World War application: Allied analysts estimated monthly German tank production from the numbers read on captured or destroyed tanks."),
    ],
    sections: [
      { h: p("Le modèle", "The model"), p: [
        p("On suppose que les objets portent les numéros consécutifs 1, 2, …, N, où N est inconnu, et qu’on en observe k, tirés au hasard sans remise. Le plus grand numéro vu est noté m. Le problème est de proposer, à partir de m et de k, une estimation de N.",
          "The objects are assumed to carry the consecutive numbers 1, 2, …, N, with N unknown, and k of them are observed, drawn at random without replacement. The largest number seen is written m. The task is to propose an estimate of N from m and k."),
        p("L’estimation naïve N̂ = m est toujours trop basse, ou au mieux exacte : le plus grand numéro observé ne peut pas dépasser N.",
          "The naive estimate N̂ = m is always too low, or at best exact: the largest observed number cannot exceed N.") ] },
      { h: p("Les mathématiques", "The mathematics"), p: [
        p("Il y a C(N, k) échantillons équiprobables. Pour que le maximum soit m, il faut choisir m et k − 1 numéros parmi 1 à m − 1 : P(M = m) = C(m − 1, k − 1) / C(N, k). On en déduit l’espérance du maximum, E(M) = k(N + 1)/(k + 1).",
          "There are C(N, k) equally likely samples. For the maximum to be m, one must choose m and k − 1 numbers among 1 to m − 1: P(M = m) = C(m − 1, k − 1) / C(N, k). From this follows the expectation of the maximum, E(M) = k(N + 1)/(k + 1)."),
        p("Une façon de le voir : les k numéros observés découpent les N − k numéros absents en k + 1 intervalles qui, par symétrie, ont la même taille moyenne. Le dernier intervalle, N − M, vaut donc en moyenne (N − k)/(k + 1). L’estimateur N̂ = m(1 + 1/k) − 1 ajoute au maximum la taille moyenne d’un intervalle : il est sans biais, alors que le maximum seul sous-estime en moyenne. Sa variance vaut (N + 1)(N − k)/(k(k + 2)).",
          "One way to see it: the k observed numbers cut the N − k absent numbers into k + 1 gaps which, by symmetry, have the same average size. The last gap, N − M, therefore averages (N − k)/(k + 1). The estimator N̂ = m(1 + 1/k) − 1 adds to the maximum the average size of a gap: it is unbiased, whereas the maximum alone underestimates on average. Its variance is (N + 1)(N − k)/(k(k + 2)). For example, four numbers 19, 40, 42 and 60 give 60 × 5/4 − 1 = 74.") ] },
      { h: p("Autres estimateurs et point de vue bayésien", "Other estimators and the Bayesian view"), p: [
        p("Doubler la moyenne et retrancher 1 donne aussi un estimateur sans biais, mais plus dispersé, car il n’exploite pas toute l’information contenue dans le maximum. Dans l’approche bayésienne, on pose une loi a priori plate sur N (impropre : c’est un choix explicite, pas un fait). On obtient alors P(N > n | m) = C(m − 1, k − 1)/C(n, k − 1), et une espérance a posteriori (m − 1)(k − 1)/(k − 2) lorsque k ≥ 3. Ces estimateurs ne sont pas sans biais et dépendent de la loi a priori.",
          "Doubling the mean and subtracting 1 also gives an unbiased estimator, but a more spread-out one, because it does not use all the information in the maximum. In the Bayesian approach, a flat prior is placed on N (improper: an explicit choice, not a fact). One then obtains P(N > n | m) = C(m − 1, k − 1)/C(n, k − 1), and a posterior mean (m − 1)(k − 1)/(k − 2) when k ≥ 3. These estimators are not unbiased and depend on the prior.") ] },
      { h: p("Histoire", "History"), p: [
        p("Pendant la Seconde Guerre mondiale, les analystes alliés ont estimé la production mensuelle de chars allemands à partir des numéros de série (Ruggles et Brodie, 1947). Selon les chiffres rapportés de cet article, pour trois mois, les estimations par numéros de série sont bien plus proches des registres allemands d’après-guerre que les estimations classiques du renseignement : juin 1940, 169 contre 1 000 (registres : 122) ; juin 1941, 244 contre 1 550 (registres : 271) ; août 1942, 327 contre 1 550 (registres : 342). Il s’agit de productions mensuelles, estimées et non comptées.",
          "During the Second World War, Allied analysts estimated monthly German tank production from serial numbers (Ruggles and Brodie, 1947). According to the figures reported from that article, for three months, the serial-number estimates were much closer to the postwar German records than conventional intelligence estimates: June 1940, 169 against 1,000 (records: 122); June 1941, 244 against 1,550 (records: 271); August 1942, 327 against 1,550 (records: 342). These are monthly productions, estimated and not counted.") ] },
      { h: p("Limites et prolongements", "Limits and extensions"), p: [
        p("Le modèle simplifie l’analyse historique : il suppose des numéros sans trou et un échantillon uniforme, hypothèses à vérifier dans la réalité. Des numéros sautés ou un prélèvement préférentiel invalident les garanties. L’intervalle de confiance se construit en inversant la queue P_N(M ≤ m) > 0,05 : il couvre N au moins 95 % du temps sous les hypothèses, sans être une probabilité de 95 % sur ce N fixe une fois les données vues. La même idée sert à estimer un nombre de versions, de lots ou de séries numérotés.",
          "The model simplifies the historical analysis: it assumes numbers without gaps and a uniform sample, assumptions to be checked in reality. Skipped numbers or preferential sampling invalidate the guarantees. The confidence interval is built by inverting the tail P_N(M ≤ m) > 0.05: it covers N at least 95% of the time under the assumptions, without being a 95% probability about this fixed N once the data are seen. The same idea serves to estimate a number of versions, batches or numbered series.") ] },
    ],
  },

  "benford-gallery": {
    facts: [
      [p("Observé par", "Observed by"), p("Simon Newcomb (1881), Frank Benford (1938)", "Simon Newcomb (1881), Frank Benford (1938)")],
      [p("Domaine", "Field"), p("Statistique, logarithmes", "Statistics, logarithms")],
      [p("Loi", "Law"), p("P(D = d) = log₁₀(1 + 1/d)", "P(D = d) = log₁₀(1 + 1/d)")],
      [p("Valeur pour le chiffre 1", "Value for digit 1"), p("environ 30,1 %", "about 30.1%")],
      [p("Statut", "Status"), p("Loi exacte sous une hypothèse, non universelle", "Exact law under an assumption, not universal")],
    ],
    lead: [
      p("La loi de Benford décrit la fréquence du premier chiffre de nombreux jeux de données : le chiffre 1 ouvre environ 30 % des nombres, le chiffre 9 moins de 5 %. Le premier chiffre significatif d’un nombre n’est donc pas uniformément réparti sur 1 à 9 dans ces données, ce qui surprend à première vue.",
        "Benford’s law describes the frequency of the leading digit in many datasets: the digit 1 opens about 30% of the numbers, the digit 9 less than 5%. The first significant digit of a number is therefore not uniformly spread over 1 to 9 in such data, which is surprising at first sight."),
    ],
    sections: [
      { h: p("L’énoncé", "The statement"), p: [
        p("La probabilité que le premier chiffre soit d vaut P(D = d) = log₁₀(1 + 1/d). Pour d = 1 on obtient log₁₀ 2 ≈ 0,301, soit environ 30 % ; pour d = 9, log₁₀(10/9) ≈ 0,046, soit environ 4,6 %. Une loi analogue existe pour les deux premiers chiffres, de 10 à 99.",
          "The probability that the leading digit is d is P(D = d) = log₁₀(1 + 1/d). For d = 1 this gives log₁₀ 2 ≈ 0.301, about 30%; for d = 9, log₁₀(10/9) ≈ 0.046, about 4.6%. A similar law exists for the first two digits, from 10 to 99.") ] },
      { h: p("L’explication mathématique", "The mathematical explanation"), p: [
        p("On écrit |X| = 10^(K + U), avec K entier et U compris entre 0 et 1. Le premier chiffre vaut d exactement lorsque log₁₀(d) ≤ U < log₁₀(d + 1). Si U est réparti uniformément, cet intervalle a pour longueur log₁₀(1 + 1/d), ce qui donne la loi. La loi de Benford s’applique donc quand la partie fractionnaire de log₁₀|X| est uniforme : c’est le cas de données qui s’étalent sur plusieurs ordres de grandeur, comme les populations des pays.",
          "One writes |X| = 10^(K + U), with K an integer and U between 0 and 1. The leading digit is exactly d when log₁₀(d) ≤ U < log₁₀(d + 1). If U is uniformly spread, this interval has length log₁₀(1 + 1/d), which gives the law. Benford’s law thus applies when the fractional part of log₁₀|X| is uniform: this is the case for data spread over several orders of magnitude, such as the populations of countries."),
        p("Multiplier toutes les valeurs par une constante positive ajoute une constante à U modulo 1, qui reste uniforme : la loi théorique ne dépend donc pas de l’unité choisie (invariance d’échelle).",
          "Multiplying all the values by a positive constant adds a constant to U modulo 1, which remains uniform: the theoretical law therefore does not depend on the unit chosen (scale invariance).") ] },
      { h: p("Histoire", "History"), p: [
        p("L’astronome Simon Newcomb remarque en 1881 que les premières pages des tables de logarithmes sont plus usées que les dernières. Le physicien Frank Benford étudie en 1938 un grand nombre de séries de données et donne son nom à la loi.",
          "The astronomer Simon Newcomb notes in 1881 that the first pages of logarithm tables are more worn than the last. The physicist Frank Benford studies a large number of datasets in 1938 and gives the law his name.") ] },
      { h: p("Quand la loi ne s’applique pas", "When the law does not apply"), p: [
        p("La loi n’est pas universelle. Des identifiants attribués, des prix fixes ou des plages étroites, comme des tailles humaines, ne la suivent pas. Les sept constantes définissant le SI sont des données réelles, mais elles forment une petite sélection contrainte, avec des unités différentes : ce n’est pas un échantillon représentatif pour tester Benford. Le statisticien doit justifier le modèle avant de tester.",
          "The law is not universal. Assigned identifiers, fixed prices or narrow ranges, such as human heights, do not follow it. The seven defining constants of the SI are real data, but they form a small, constrained selection with different units: not a representative sample for testing Benford. The statistician must justify the model before testing.") ] },
      { h: p("Applications et précautions", "Applications and cautions"), p: [
        p("En audit comptable, on compare les premiers chiffres des écritures d’un registre à la loi de Benford pour décider quels jeux de données méritent un examen plus attentif (Nigrini, 2012). Un écart n’est qu’un signal : il peut venir de prix fixes, de plafonds, d’identifiants, d’un mélange de sources ou d’un échantillon trop petit. On le mesure avec la statistique χ² = Σ(O − E)²/E, qui suppose des observations assez indépendantes et des effectifs attendus suffisants. Un écart ne prouve pas la fraude, et la conformité ne prouve pas l’authenticité.",
          "In accounting audits, the leading digits of ledger entries are compared with Benford’s law to decide which datasets deserve a closer look (Nigrini, 2012). A deviation is only a signal: it can come from fixed prices, caps, identifiers, a mixture of sources or a sample that is too small. It is measured with the statistic χ² = Σ(O − E)²/E, which requires reasonably independent observations and adequate expected counts. A deviation does not prove fraud, and conformity does not prove authenticity.") ] },
    ],
  },

  "baker-gallery": {
    facts: [
      [p("Attribué à", "Attributed to"), p("Henri Poincaré (anecdote non attestée)", "Henri Poincaré (anecdote not attested)")],
      [p("Domaine", "Field"), p("Statistique, tests d’hypothèse", "Statistics, hypothesis testing")],
      [p("Idée clé", "Key idea"), p("L’écart type d’une moyenne de n pesées est divisé par √n", "The standard deviation of a mean of n weighings is divided by √n")],
      [p("Statut", "Status"), p("Raisonnement exact, histoire non documentée", "Sound reasoning, story undocumented")],
    ],
    lead: [
      p("L’anecdote du boulanger de Poincaré est une parabole de statistique. Un mathématicien pèse chaque jour son pain « d’un kilo » ; la moyenne de ses pesées s’établit nettement en dessous de 1 000 g, et il en conclut que le boulanger triche. Averti, le boulanger lui donne alors le plus gros pain parmi plusieurs, et la forme de la distribution trahit ce tri.",
        "The story of Poincaré’s baker is a parable of statistics. A mathematician weighs his “one kilo” loaf every day; the mean of his weighings settles clearly below 1,000 g, and he concludes that the baker is cheating. Warned, the baker then hands him the heaviest of several loaves, and the shape of the distribution betrays the selection."),
    ],
    sections: [
      { h: p("Une anecdote, pas un fait", "An anecdote, not a fact"), p: [
        p("Ce qui est documenté : Poincaré tient la chaire de calcul des probabilités et de physique mathématique de la Sorbonne pendant une dizaine d’années, et il signe avec Appell et Darboux le rapport demandé par la Cour de cassation dans l’affaire Dreyfus, qui s’ouvre sur un chapitre consacré à la probabilité des causes et répond aux arguments probabilistes de Bertillon (Mazliak, 2012, qui date la signature de 1906).",
          "What is documented: Poincaré held the Sorbonne chair of probability calculus and mathematical physics for about ten years, and he signed with Appell and Darboux the report requested by the Court of Cassation in the Dreyfus affair, which opens with a chapter on the probability of causes and answers Bertillon’s probabilistic arguments (Mazliak, 2012, who dates the signature to 1906)."),
        p("Ce qui n’est pas documenté : l’histoire du boulanger. On ne lui connaît pas de source ancienne, les versions diffèrent (masse annoncée, moyennes, durée), et des auteurs qui la racontent la tiennent pour inventée, par exemple Gil Kalai, qui la tient de Maya Bar-Hillel et écrit qu’elle n’a jamais eu lieu. Les chiffres de la démonstration (980 g, 20 g, le plus lourd de cinq) relèvent d’une illustration, non d’un fait.",
          "What is not documented: the baker story. No early source is known, versions differ (advertised mass, averages, duration), and authors who tell it regard it as invented, for example Gil Kalai, who heard it from Maya Bar-Hillel and writes that it never happened. The figures of the demonstration (980 g, 20 g, heaviest of five) belong to an illustration, not to a fact.") ] },
      { h: p("Le raisonnement : la moyenne varie moins qu’une pesée", "The reasoning: the mean varies less than one weighing"), p: [
        p("Un seul pain léger ne prouve rien, car la masse d’un pain varie. Mais la moyenne de n pesées varie √n fois moins qu’une pesée : avec un écart type d’environ 50 g par pain, la moyenne de 365 pains varie d’environ 50/√365 ≈ 2,6 g. Une moyenne de 950 g est alors trop éloignée de 1 000 g pour relever du hasard.",
          "A single light loaf proves nothing, because a loaf’s mass varies. But the mean of n weighings varies √n times less than one weighing: with a standard deviation of about 50 g per loaf, the mean of 365 loaves varies by about 50/√365 ≈ 2.6 g. A mean of 950 g is then too far from 1,000 g to be due to chance.") ] },
      { h: p("Le test et l’intervalle", "The test and the interval"), p: [
        p("Sous l’hypothèse H₀ : μ = μ₀, avec écart type σ connu, bruit de mesure τ et mesures normales indépendantes, la statistique Z = (x̄ − μ₀)/SE, où SE = √(σ² + τ²)/√n, suit exactement une loi normale centrée réduite. Un test unilatéral au seuil de 5 % rejette H₀ si Z < −1,64485. La valeur p est P(Z ≤ z observé) sous H₀ : ce n’est pas la probabilité que le boulanger soit honnête. L’intervalle x̄ ± 1,95996 SE couvre μ dans 95 % des répétitions.",
          "Under the hypothesis H₀: μ = μ₀, with known standard deviation σ, measurement noise τ and independent normal measurements, the statistic Z = (x̄ − μ₀)/SE, where SE = √(σ² + τ²)/√n, has exactly a standard normal distribution. A one-sided test at the 5% level rejects H₀ if Z < −1.64485. The p-value is P(Z ≤ observed z) under H₀: it is not the probability that the baker is honest. The interval x̄ ± 1.95996 SE covers μ in 95% of repetitions."),
        p("Pour une vraie moyenne μ < μ₀, la puissance du test vaut Φ((μ₀ − μ)/SE − 1,64485) : augmenter n ou réduire le bruit aide à détecter de petites différences. Estimer σ exigerait un calcul adapté, par exemple une loi de Student.",
          "For a true mean μ < μ₀, the power of the test is Φ((μ₀ − μ)/SE − 1.64485): increasing n or reducing the noise helps detect small differences. Estimating σ would require an adapted calculation, for instance a Student distribution.") ] },
      { h: p("Le piège de la sélection", "The selection trap"), p: [
        p("Si chaque pain est le plus lourd de cinq, la distribution des masses est déformée et la garantie ci-dessus tombe : une moyenne proche de la cible peut cacher un procédé qui livre trop peu. La forme penchée de l’histogramme trahit le tri. La leçon de la parabole est qu’une moyenne correcte peut dissimuler une sélection, et qu’une décision statistique dépend du modèle et de l’échantillonnage : elle n’est ni la preuve d’une fraude ni un jugement sur une personne.",
          "If each loaf is the heaviest of five, the distribution of masses is distorted and the guarantee above fails: a mean near the target may hide a process that delivers too little. The lopsided shape of the histogram betrays the selection. The lesson of the parable is that a correct mean can conceal a selection, and that a statistical decision depends on the model and the sampling: it is neither proof of fraud nor a judgment about a person.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },

  "birthdays-gallery": {
    facts: [
      [p("Nom usuel", "Common name"), p("Paradoxe des anniversaires", "Birthday paradox")],
      [p("Domaine", "Field"), p("Probabilités, dénombrement", "Probability, counting")],
      [p("Résultat clé", "Key result"), p("23 personnes : probabilité d’une coïncidence d’environ 0,507", "23 people: probability of a coincidence about 0.507")],
      [p("Modèle", "Model"), p("365 jours équiprobables, tirages indépendants", "365 equally likely days, independent draws")],
      [p("Statut", "Status"), p("Résultat démontré (contre-intuitif, non paradoxal)", "Proved result (counterintuitive, not a true paradox)")],
    ],
    lead: [
      p("Le paradoxe des anniversaires affirme que, dans un groupe de seulement 23 personnes, la probabilité que deux d’entre elles soient nées le même jour dépasse une chance sur deux. Ce n’est pas un paradoxe logique mais un résultat qui heurte l’intuition, car on pense spontanément à la probabilité de partager sa propre date de naissance.",
        "The birthday paradox states that in a group of only 23 people, the probability that two of them were born on the same day exceeds one chance in two. It is not a logical paradox but a result that clashes with intuition, because one spontaneously thinks of the probability of sharing one’s own birthday."),
    ],
    sections: [
      { h: p("Le calcul", "The calculation"), p: [
        p("On suppose une année de 365 jours, sans 29 février, des jours équiprobables et des naissances indépendantes. La probabilité que n personnes aient toutes des jours différents est le produit 1 × (364/365) × (363/365) × … × ((365 − n + 1)/365), car chaque nouvelle personne doit éviter les jours déjà pris. La probabilité d’une coïncidence est le complément : 1 − ∏ⱼ₌₀ⁿ⁻¹ (1 − j/d), avec d = 365.",
          "A year of 365 days is assumed, without 29 February, with equally likely days and independent births. The probability that n people all have different days is the product 1 × (364/365) × (363/365) × … × ((365 − n + 1)/365), since each new person must avoid the days already taken. The probability of a coincidence is the complement: 1 − ∏ⱼ₌₀ⁿ⁻¹ (1 − j/d), with d = 365."),
        p("Pour n = 22 la probabilité d’une coïncidence est d’environ 0,476 ; pour n = 23 elle vaut environ 0,5073. Le seuil est donc 23.",
          "For n = 22 the probability of a coincidence is about 0.476; for n = 23 it is about 0.5073. The threshold is therefore 23.") ] },
      { h: p("Pourquoi c’est contre-intuitif", "Why it is counterintuitive"), p: [
        p("Vingt-trois personnes forment 253 paires, et chaque paire est une occasion de coïncidence. Le nombre moyen de paires concordantes vaut C(n, 2)/d ; il peut dépasser 1 et n’est pas une probabilité. La question est aussi différente de celle de la probabilité que quelqu’un partage votre date : celle-ci vaut 1 − (364/365)^(n − 1) et reste bien plus faible.",
          "Twenty-three people form 253 pairs, and each pair is a chance of coincidence. The expected number of matching pairs is C(n, 2)/d; it can exceed 1 and is not a probability. The question also differs from that of someone sharing your birthday: that probability is 1 − (364/365)^(n − 1) and stays much lower.") ] },
      { h: p("Années non uniformes", "Non-uniform years"), p: [
        p("Si les naissances ne sont pas équiprobables, de probabilités p₁, …, p_d, la probabilité de non-coïncidence vaut n! fois la somme des produits pᵢ₁…pᵢₙ sur les ensembles de jours distincts, et le nombre moyen de paires concordantes devient C(n, 2) Σpᵢ². Une répartition inégale rend la coïncidence plus probable. Les vraies naissances ne sont d’ailleurs ni parfaitement uniformes ni toujours indépendantes, et les fréquences simulées restent aléatoires.",
          "If births are not equally likely, with probabilities p₁, …, p_d, the probability of no coincidence is n! times the sum of the products pᵢ₁…pᵢₙ over sets of distinct days, and the expected number of matching pairs becomes C(n, 2) Σpᵢ². An uneven spread makes a coincidence more likely. Real births are in any case neither perfectly uniform nor always independent, and simulated frequencies remain random.") ] },
      { h: p("Applications : les collisions de hachage", "Applications: hash collisions"), p: [
        p("Le même modèle gouverne les collisions d’une fonction de hachage uniforme sur d valeurs : le seuil de collision est de l’ordre de √d, bien avant d. En cryptographie, l’attaque des anniversaires exploite ce fait (NIST). Ce seuil ne mesure pas la résistance à une attaque visant un hachage particulier, qui est une question différente.",
          "The same model governs collisions of a hash function that is uniform over d values: the collision threshold is of order √d, well before d. In cryptography, the birthday attack exploits this fact (NIST). This threshold does not measure resistance to an attack targeting one particular hash, which is a different question."),
        p("Par exemple, une fonction de hachage à 32 bits, qui prend 2³² valeurs, produit typiquement une collision après quelques dizaines de milliers d’éléments, soit de l’ordre de √(2³²) = 65 536, et non après des milliards.",
          "For example, a 32-bit hash function, which takes 2³² values, typically produces a collision after some tens of thousands of items, of the order of √(2³²) = 65,536, and not after billions.") ] },
    ],
  },

  "monty-gallery": {
    facts: [
      [p("Nom usuel", "Common name"), p("Problème de Monty Hall", "Monty Hall problem")],
      [p("Domaine", "Field"), p("Probabilités conditionnelles", "Conditional probability")],
      [p("Résultat clé", "Key result"), p("Changer de porte gagne avec la probabilité 2/3 (animateur informé)", "Switching wins with probability 2/3 (informed host)")],
      [p("Origine", "Origin"), p("Jeu télévisé américain Let’s Make a Deal", "American television game show Let’s Make a Deal")],
      [p("Statut", "Status"), p("Résultat démontré, dépendant de la règle de l’animateur", "Proved result, depending on the host’s rule")],
    ],
    lead: [
      p("Le problème de Monty Hall est une énigme de probabilités conditionnelles. Un candidat choisit une porte parmi trois, dont une cache une voiture et deux cachent une chèvre. L’animateur, qui sait où se trouve la voiture, ouvre une autre porte derrière laquelle il y a une chèvre, puis propose de changer de choix. Changer fait gagner avec la probabilité 2/3.",
        "The Monty Hall problem is a puzzle of conditional probability. A contestant picks one door out of three, one hiding a car and two hiding a goat. The host, who knows where the car is, opens another door with a goat behind it, then offers a switch. Switching wins with probability 2/3."),
    ],
    sections: [
      { h: p("Le raisonnement", "The reasoning"), p: [
        p("Le choix initial est gagnant avec la probabilité 1/3. Dans les deux cas sur trois où il est perdant, la voiture se trouve derrière une autre porte, et l’animateur est obligé d’ouvrir la seule autre porte à chèvre : la porte restante cache la voiture. Changer gagne donc exactement quand le premier choix était mauvais, soit avec la probabilité 2/3, contre 1/3 pour rester.",
          "The initial choice wins with probability 1/3. In the two cases out of three where it loses, the car is behind another door, and the host is forced to open the only other goat door: the remaining door hides the car. Switching therefore wins exactly when the first choice was wrong, with probability 2/3, against 1/3 for staying."),
        p("L’intuition qui conclut à une chance sur deux oublie que la révélation n’est pas aléatoire : elle apporte de l’information, car l’animateur ne peut jamais ouvrir la porte choisie ni celle de la voiture.",
          "The intuition that concludes one chance in two forgets that the reveal is not random: it carries information, since the host can never open the chosen door nor the door with the car.") ] },
      { h: p("La règle de l’animateur compte", "The host’s rule matters"), p: [
        p("Le résultat dépend de la règle de l’animateur, et le mot « au hasard » seul ne la précise pas. Si l’animateur ne sait pas où est la voiture et ouvre au hasard l’une des deux portes restantes, il révèle la voiture dans 1/3 des parties, qui n’offrent alors plus de décision. Parmi les parties où une chèvre apparaît, rester et changer ont chacun une masse de 1/3 : la probabilité conditionnelle de gagner est 1/2 dans les deux cas. Le dénominateur de la fréquence est le nombre de révélations de chèvre, non le nombre de parties commencées.",
          "The result depends on the host’s rule, and the word “random” alone does not specify it. If the host does not know where the car is and opens one of the two remaining doors at random, he reveals the car in 1/3 of games, which then offer no further decision. Among the games where a goat appears, staying and switching each carry a mass of 1/3: the conditional probability of winning is 1/2 in both cases. The denominator of the frequency is the number of goat reveals, not the number of games started."),
        p("Une règle qui propose le changement seulement dans certains cas demande un autre calcul : le savoir et le comportement de l’animateur font partie du modèle.",
          "A rule that offers the switch only in certain cases requires another calculation: the host’s knowledge and behaviour are part of the model.") ] },
      { h: p("Histoire", "History"), p: [
        p("Le nom vient de Monty Hall, animateur du jeu télévisé américain Let’s Make a Deal. Le problème est posé sous une forme proche par Steve Selvin dans une lettre à la revue The American Statistician en 1975, puis devient célèbre en 1990, quand Marilyn vos Savant le traite dans sa chronique du magazine Parade ; de nombreux lecteurs, dont des mathématiciens, contestent alors la réponse.",
          "The name comes from Monty Hall, host of the American television game show Let’s Make a Deal. The problem is posed in a close form by Steve Selvin in a letter to the journal The American Statistician in 1975, then becomes famous in 1990, when Marilyn vos Savant treats it in her Parade magazine column; many readers, including mathematicians, then dispute the answer.") ] },
      { h: p("Variantes et leçon", "Variants and lesson"), p: [
        p("Avec 100 portes, où l’animateur en ouvre 98 à chèvre, l’effet devient frappant : changer gagne avec la probabilité 99/100. Le problème est devenu un exemple classique pour enseigner qu’une information nouvelle doit être traitée avec le mécanisme qui la produit, et que le conditionnement dépend du protocole, pas seulement des faits observés.",
          "With 100 doors, where the host opens 98 goat doors, the effect becomes striking: switching wins with probability 99/100. The problem has become a classic example for teaching that new information must be treated together with the mechanism that produces it, and that conditioning depends on the protocol, not only on the observed facts.") ] },
    ],
  },

  "double-pendulum-gallery": {
    facts: [
      [p("Système", "System"), p("Un pendule suspendu au bout d’un autre", "One pendulum hung from the end of another")],
      [p("Domaine", "Field"), p("Mécanique, systèmes dynamiques, chaos", "Mechanics, dynamical systems, chaos")],
      [p("Résultat clé", "Key result"), p("Sensibilité aux conditions initiales", "Sensitivity to initial conditions")],
      [p("Conservation", "Conservation"), p("Énergie E = T + V sans frottement", "Energy E = T + V without damping")],
      [p("Statut", "Status"), p("Système déterministe, non prévisible à long terme en pratique", "Deterministic system, unpredictable in practice over long times")],
    ],
    lead: [
      p("Le pendule double est un système mécanique formé d’un pendule accroché à l’extrémité d’un autre. Régi par des équations parfaitement déterministes, il devient pour de grandes amplitudes un exemple classique de chaos : deux mouvements issus de positions presque identiques finissent par n’avoir plus rien de commun.",
        "The double pendulum is a mechanical system made of one pendulum attached to the end of another. Governed by perfectly deterministic equations, it becomes, at large amplitudes, a classic example of chaos: two motions starting from almost identical positions end up having nothing in common."),
    ],
    sections: [
      { h: p("Le système", "The system"), p: [
        p("Deux masses reliées par des tiges se déplacent dans un plan, et la configuration est décrite par deux angles. Sans frottement, l’énergie totale E = T + V (cinétique plus potentielle) reste constante ; avec un couple visqueux, elle décroît selon E′ = −c(u² + v²), où u et v sont les vitesses angulaires. Les équations du mouvement se calculent par des méthodes numériques, car il n’existe pas de solution simple pour toutes les conditions initiales.",
          "Two masses linked by rods move in a plane, and the configuration is described by two angles. Without damping, the total energy E = T + V (kinetic plus potential) stays constant; with a viscous torque, it decreases according to E′ = −c(u² + v²), where u and v are the angular velocities. The equations of motion are computed by numerical methods, since there is no simple solution for all initial conditions.") ] },
      { h: p("Sensibilité aux conditions initiales", "Sensitivity to initial conditions"), p: [
        p("Deux pendules doubles lâchés de positions qui diffèrent d’un millième de degré restent d’abord indiscernables. L’écart grandit ensuite à peu près de manière exponentielle, c’est-à-dire multiplié environ par le même facteur à chaque seconde, et au bout de quelques secondes les deux mouvements n’ont plus rien de commun. Sur une échelle de puissances de 10, l’écart monte en ligne droite. Aucune mesure n’étant exacte, l’avenir lointain d’un pendule double est imprévisible en pratique, bien que les équations soient exactes.",
          "Two double pendulums released from positions that differ by a thousandth of a degree are at first indistinguishable. The gap then grows roughly exponentially, that is, multiplied by about the same factor every second, and after a few seconds the two motions have nothing in common. On a scale of powers of 10, the gap climbs in a straight line. Since no measurement is exact, the distant future of a double pendulum is unpredictable in practice, although the equations are exact."),
        p("Déterministe ne signifie donc ni prévisible à toute précision ni aléatoire. De petites oscillations régulières et une forte sensibilité à grande amplitude peuvent coexister dans le même système.",
          "Deterministic therefore means neither predictable at every precision nor random. Regular small oscillations and strong sensitivity at large amplitude can coexist in the same system.") ] },
      { h: p("Calculer sans confondre erreur et chaos", "Computing without confusing error with chaos"), p: [
        p("La méthode de Runge-Kutta d’ordre 4 (RK4) évalue quatre pentes par pas. Le calcul compare un pas h à deux demi-pas h/2 : la différence divisée par 15 estime l’erreur locale du résultat le plus fin. Un pas trop grand est rejeté et le résultat accepté est extrapolé. Une petite dérive d’énergie est un contrôle utile mais ne certifie pas toute la trajectoire.",
          "The fourth-order Runge-Kutta method (RK4) evaluates four slopes per step. The calculation compares one step h with two half steps h/2: their difference divided by 15 estimates the local error of the finer result. An excessive step is rejected and the accepted result is extrapolated. A small energy drift is a useful check but does not certify the whole trajectory."),
        p("Avant d’interpréter la séparation de deux départs, il faut comparer des tolérances sur une durée fixe : une séparation qui change beaucoup avec la tolérance peut être un artefact numérique et non du chaos physique.",
          "Before interpreting the separation of two starts, tolerances must be compared over a fixed duration: a separation that changes greatly with tolerance may be a numerical artefact rather than physical chaos.") ] },
      { h: p("Portée", "Significance"), p: [
        p("Le pendule double illustre, avec un matériel très simple, l’idée de chaos déterministe étudiée depuis Poincaré, notamment pour le problème des trois corps. Il montre que la complexité n’exige ni hasard ni grand nombre de composants : deux degrés de liberté suffisent.",
          "The double pendulum illustrates, with very simple equipment, the idea of deterministic chaos studied since Poincaré, notably for the three-body problem. It shows that complexity requires neither randomness nor a large number of components: two degrees of freedom are enough.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },

  "three-body-gallery": {
    facts: [
      [p("Posé par", "Posed by"), p("Problème issu de la gravitation de Newton (Principia, 1687)", "Problem arising from Newton’s gravitation (Principia, 1687)")],
      [p("Résultat de Poincaré", "Poincaré’s result"), p("Pas de formule générale, vers 1890", "No general formula, around 1890")],
      [p("Solution particulière", "Special solution"), p("Huit de Chenciner et Montgomery, 2000", "Figure eight of Chenciner and Montgomery, 2000")],
      [p("Domaine", "Field"), p("Mécanique céleste, systèmes dynamiques", "Celestial mechanics, dynamical systems")],
      [p("Statut", "Status"), p("Pas de solution élémentaire générale ; solutions particulières connues", "No general elementary solution; special solutions known")],
    ],
    lead: [
      p("Le problème des trois corps demande de décrire le mouvement de trois astres qui s’attirent selon la loi de la gravitation de Newton. Alors que deux corps seuls suivent des ellipses, comme l’a décrit Kepler, le mouvement de trois corps ne se laisse en général décrire par aucune formule simple.",
        "The three-body problem asks for a description of the motion of three bodies attracting one another according to Newton’s law of gravitation. Whereas two bodies alone follow ellipses, as Kepler described, the motion of three bodies cannot in general be described by any simple formula."),
    ],
    sections: [
      { h: p("Du problème à deux corps à trois corps", "From two bodies to three"), p: [
        p("Les Principia de Newton (1687) relient mouvement et forces, et le problème de plusieurs corps devient un champ durable de recherche. Pour deux astres, le mouvement est résolu : chacun parcourt toujours la même ellipse, ce que Kepler décrit par une formule. Avec un troisième corps, le mouvement devient imprévisible en général : un départ décalé d’un millionième peut aboutir à un tout autre chemin.",
          "Newton’s Principia (1687) connect motion and forces, and the many-body problem becomes a lasting field of research. For two bodies the motion is solved: each always traces the same ellipse, which Kepler described with a formula. With a third body the motion becomes unpredictable in general: a start shifted by a millionth can end on a completely different path.") ] },
      { h: p("Poincaré et le chaos", "Poincaré and chaos"), p: [
        p("Vers 1890, le mémoire de Poincaré sur les trois corps renouvelle l’étude qualitative des trajectoires : il n’existe pas de formule générale comme celle de Kepler, et les orbites peuvent être chaotiques, une minuscule différence initiale grandissant jusqu’à changer complètement le futur. Une erreur corrigée fait partie de cette histoire. Le chaos n’empêche ni les solutions particulières ni les méthodes numériques.",
          "Around 1890, Poincaré’s memoir on three bodies renews the qualitative study of trajectories: there is no general formula like Kepler’s, and orbits can be chaotic, a tiny initial difference growing until it completely changes the future. A corrected error is part of this story. Chaos precludes neither special solutions nor numerical methods."),
        p("Les trajectoires de trois corps sont donc étudiées de deux façons complémentaires : par des résultats qualitatifs sur la forme des orbites, et par le calcul numérique de conditions initiales précises. Aucune formule élémentaire unique ne décrit toutes les données initiales, ce qui n’empêche pas l’existence de solutions particulières.",
          "Three-body trajectories are therefore studied in two complementary ways: through qualitative results on the shape of orbits, and through numerical computation from precise initial conditions. No single elementary formula describes all initial data, which does not prevent special solutions from existing."),
        p("Pour deux corps, au contraire, l’énergie et le moment cinétique suffisent à tout déterminer, et la trajectoire relative reste une conique : ellipse, parabole ou hyperbole.",
          "For two bodies, by contrast, energy and angular momentum suffice to determine everything, and the relative path remains a conic section: ellipse, parabola or hyperbola.") ] },
      { h: p("Des danses régulières : le huit", "Regular dances: the figure eight"), p: [
        p("Il existe pourtant des mouvements exceptionnellement réguliers. Chenciner et Montgomery prouvent en 2000 l’existence d’une orbite périodique sans collision où trois masses égales se poursuivent sur un huit, sur une même courbe. Les coordonnées arrondies de Simó, reprises sur la page de Montgomery, en donnent une approximation numérique. Les deux autres exemples de la figure sont des données initiales pédagogiques originales : leur stabilité indéfinie n’est pas affirmée.",
          "Yet exceptionally regular motions exist. Chenciner and Montgomery prove in 2000 that a collision-free periodic orbit exists in which three equal masses chase one another around an eight, on a single curve. Simó’s rounded coordinates, listed on Montgomery’s page, provide a numerical approximation. The two other examples of the figure use original teaching initial data: indefinite stability is not asserted.") ] },
      { h: p("Calculer pas à pas", "Computing step by step"), p: [
        p("Faute de formule, on calcule le mouvement pas à pas, en surveillant l’énergie, qui doit rester constante : sa dérive mesure l’erreur du calcul. Le solveur RK4 adapte le pas en comparant deux résolutions locales. À moins de 0,015 unité entre deux masses, le calcul s’arrête : le champ est singulier à la collision et le modèle ne prescrit ni rebond ni fusion, et aucun adoucissement de la gravité n’est caché. Une séparation qui change beaucoup avec la tolérance peut être un artefact numérique.",
          "Without a formula, the motion is computed step by step while watching the energy, which must stay constant: its drift measures the error of the calculation. The RK4 solver adjusts the step by comparing two local resolutions. Below a 0.015-unit separation between two masses the calculation stops: the field is singular at collision, the model prescribes neither rebound nor merger, and no gravitational softening is hidden. A separation that changes greatly with tolerance can be a numerical artefact.") ] },
      { h: p("Explication animée", "Animated explanation"), explainer: true },
    ],
  },

  "logistic-gallery": {
    facts: [
      [p("Récurrence", "Recurrence"), p("xₙ₊₁ = r xₙ (1 − xₙ)", "xₙ₊₁ = r xₙ (1 − xₙ)")],
      [p("Diffusée par", "Popularised by"), p("Robert May, 1976", "Robert May, 1976")],
      [p("Domaine", "Field"), p("Systèmes dynamiques, suites", "Dynamical systems, sequences")],
      [p("Point fixe positif", "Positive fixed point"), p("1 − 1/r (par exemple 0,6 pour r = 2,5)", "1 − 1/r (for example 0.6 for r = 2.5)")],
      [p("Statut", "Status"), p("Modèle discret exemplaire, non prédiction de populations réelles", "Exemplary discrete model, not a prediction of real populations")],
    ],
    lead: [
      p("La suite logistique est la récurrence xₙ₊₁ = r xₙ (1 − xₙ), où xₙ est la taille d’une population rapportée à un maximum et r un paramètre de croissance. Cette formule très simple produit, selon r, un équilibre, des cycles de période 2, 4, 8, …, puis du chaos : elle est devenue l’exemple type d’une dynamique complexe issue d’un modèle élémentaire.",
        "The logistic sequence is the recurrence xₙ₊₁ = r xₙ (1 − xₙ), where xₙ is a population size relative to a maximum and r a growth parameter. This very simple formula produces, depending on r, an equilibrium, cycles of period 2, 4, 8, …, then chaos: it has become the standard example of complex dynamics arising from an elementary model."),
    ],
    sections: [
      { h: p("Le modèle", "The model"), p: [
        p("Le terme r x décrit une croissance proportionnelle à la population, et le facteur (1 − x) la freine quand la population approche son maximum. Chaque génération se calcule à partir de la précédente. Ce modèle est discret : l’équation différentielle logistique x′ = ax(1 − x) est un autre modèle, dont les solutions scalaires ne présentent pas la cascade décrite ici.",
          "The term r x describes growth proportional to the population, and the factor (1 − x) slows it as the population nears its maximum. Each generation is computed from the previous one. This model is discrete: the logistic differential equation x′ = ax(1 − x) is a different model, whose scalar solutions do not show the cascade described here.") ] },
      { h: p("Points fixes et cycles", "Fixed points and cycles"), p: [
        p("Un point fixe vérifie x = r x (1 − x) : en dehors de 0, il vaut 1 − 1/r. Pour r = 2,5 il vaut 0,6. Ce point attire les trajectoires pour 1 < r < 3 environ ; au-delà de r = 3 il devient instable et la population oscille entre deux valeurs (cycle de période 2). Les doublements se succèdent ensuite de plus en plus vite : période 4, 8, 16, …, jusqu’à une valeur d’environ 3,57 de r où s’ouvre le chaos.",
          "A fixed point satisfies x = r x (1 − x): apart from 0, it equals 1 − 1/r. For r = 2.5 it equals 0.6. This point attracts trajectories for 1 < r < 3 roughly; beyond r = 3 it becomes unstable and the population oscillates between two values (a cycle of period 2). The doublings then follow one another ever faster: period 4, 8, 16, …, up to a value of r of about 3.57 where chaos opens."),
        p("Dans la zone chaotique subsistent des fenêtres régulières, par exemple autour de r ≈ 3,83 où apparaît un cycle de période 3.",
          "Within the chaotic zone regular windows persist, for example around r ≈ 3.83 where a cycle of period 3 appears.") ] },
      { h: p("Trois vues d’un même calcul", "Three views of one calculation"), p: [
        p("L’escalier alterne entre la courbe et la droite y = x. Le graphique temporel montre les mêmes états génération par génération, avec un second départ proche en pointillés. Le diagramme de bifurcation retire 900 itérations transitoires puis place 32 états par paramètre ; le zoom recalcule des paramètres plus fins. L’exposant de Lyapunov moyenne log|f′(xₙ)| après 500 itérations et sur 1 000 autres : positif, il signale la sensibilité aux conditions initiales. C’est une estimation pour un départ donné, et un échantillonnage fini peut manquer une petite fenêtre ou un long transitoire.",
          "The cobweb alternates between the curve and the line y = x. The time plot displays the same states generation by generation, with a nearby second start in dashes. The bifurcation diagram removes 900 transient iterations then plots 32 states per parameter; zooming recomputes finer parameters. The Lyapunov exponent averages log|f′(xₙ)| after 500 iterations and over another 1,000: when positive, it signals sensitivity to initial conditions. It is an estimate for a given start, and finite sampling can miss a small window or a long transient.") ] },
      { h: p("Histoire et portée", "History and significance"), p: [
        p("L’article de Robert May de 1976, « Simple mathematical models with very complicated dynamics », diffuse la richesse des itérations logistiques auprès des biologistes et des physiciens. La croissance logistique continue, elle, n’a pas cette cascade de doublements.",
          "Robert May’s 1976 article, “Simple mathematical models with very complicated dynamics”, spreads the richness of logistic iterations among biologists and physicists. Continuous logistic growth, by contrast, does not have this cascade of doublings."),
        p("Ni le dessin ni la récurrence ne constituent une prédiction universelle des populations réelles : la structure en générations indépendantes et les hypothèses de densité doivent être discutées.",
          "Neither the drawing nor the recurrence is a universal prediction of real populations: the structure of independent generations and the density assumptions need discussion.") ] },
    ],
  },
};
